import { gameState } from './game_variables.js';
import { getGroupBonus, getTile, getMaxStorage, getBonusForRole } from './utils.js';
import { logEvent } from './time_system.js';

const gameDialog = document.getElementById('game-dialog');

async function showChoiceDialog(message, buttons) {
    return new Promise((resolve) => {
        gameDialog.innerHTML = '';
        // Wrap the message in a div
        const pDiv = document.createElement('div');
        const p = document.createElement('p');
        p.textContent = message || 'No message provided'; // Fallback for empty message
        pDiv.appendChild(p);
        gameDialog.appendChild(pDiv);
        // Wrap each button in its own div
        if (buttons && buttons.length > 0) {
            buttons.forEach(({label, value}) => {
                const btnDiv = document.createElement('div');
                const btn = document.createElement('button');
                btn.textContent = label || 'Unnamed Button';
                btn.addEventListener('click', () => {
                    gameDialog.close(value);
                });
                btnDiv.appendChild(btn);
                gameDialog.appendChild(btnDiv);
            });
        } else {
            console.warn('showChoiceDialog: No buttons provided, adding fallback Close button');
            const btnDiv = document.createElement('div');
            const btn = document.createElement('button');
            btn.textContent = '❌ Close';
            btn.addEventListener('click', () => {
                gameDialog.close('close');
            });
            btnDiv.appendChild(btn);
            gameDialog.appendChild(btnDiv);
        }
        // Log dialog content for debugging
        console.log('Dialog HTML:', gameDialog.innerHTML);
        // Ensure dialog is not already open
        if (gameDialog.open) {
            gameDialog.close();
        }
        gameDialog.showModal();
        gameDialog.addEventListener('close', () => resolve(gameDialog.returnValue), {once: true});
    });
}

// Remove showAlert since it will be replaced by showChoiceDialog
// export async function showAlert(message) { ... } // Removed

export async function handleCombat(ex, ey, isOnTile = false) {
    let tile = getTile(ex, ey);
    let entity = tile.entity;
    let input = await showChoiceDialog(`Hostile ${entity} at (${ex},${ey})!`, [
        {label: '⚔️ Attack', value: '1'},
        {label: '🌬️ Flee', value: '2'}
    ]);
    if (input === '2') {
        if (isOnTile) {
            gameState.px = gameState.prevx;
            gameState.py = gameState.prevy;
            await showChoiceDialog('Fled back. 😵‍💫', [
                {label: 'OK', value: 'ok'}
            ]);
        } else {
            await showChoiceDialog('Fled, staying put. 😅', [
                {label: 'OK', value: 'ok'}
            ]);
        }
        return false;
    }
    let combatBonus = getGroupBonus('combat');
    let success = Math.random() < 0.5 + combatBonus;
    if (success) {
        await showChoiceDialog('Victory! 🏆', [
            {label: 'OK', value: 'ok'}
        ]);
        gameState.killed.add(`${ex},${ey}`);
        gameState.killPoints += 5;
        logEvent(`🏆 Defeated ${entity} at (${ex},${ey})`);
        return true;
    } else {
        await showChoiceDialog('Defeat! Took damage.🤕', [
            {label: 'OK', value: 'ok'}
        ]);
        gameState.health -= isOnTile ? 20 : 10;
        logEvent(`🤕 Defeated by ${entity} at (${ex},${ey})`);
        return false;
    }
}

export async function checkAdjacentMonsters() {
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            if (dx === 0 && dy === 0) continue;
            let tile = getTile(gameState.px + dx, gameState.py + dy);
            if (tile.entity === 'monster' || tile.entity === 'beast') {
                await handleCombat(gameState.px + dx, gameState.py + dy);
            }
        }
    }
}

export async function checkTileInteraction(tile) {
    if (['monster', 'beast'].includes(tile.entity)) {
        await handleCombat(gameState.px, gameState.py, true);
        return;
    }
1
    if (tile.location !== 'none' || tile.entity !== 'none') {
        if (['waterfalls', 'canyon', 'geyser', 'peaks', 'monster caves', 'cave', 'ruin'].includes(tile.location)) {
            gameState.discoverPoints += 10;
            await showChoiceDialog(`Discovered ${tile.location}! 🌟`, [
                {label: 'OK', value: 'ok'},
                {label: '❌ Close', value: 'close'}
            ]);
            logEvent(`🌟 Discovered ${tile.location} at (${gameState.px},${gameState.py})`);
        }
        let options = [
            {label: '🚶 Leave', value: '1'},
            {label: '❌ Close', value: 'close'}
        ];
        if (['camp', 'outpost'].includes(tile.location)) {
            options.push({label: '😴 Rest', value: '2'});
        }
        if (['outpost', 'hamlet', 'village', 'city'].includes(tile.location) || ['trader', 'caravan'].includes(tile.entity)) {
            options.push({label: '🪙 Trade', value: '3'});
            options.push({label: '🧍🏻 Hire', value: '4'});
        }
        if (tile.location === 'city') {
            options.push({label: '🪙 Sell discoveries', value: '5'});
        }
        if (tile.location === 'village') {
            options.push({label: '🏹 Sell hunts', value: '6'});
        }
        let msg = `At ${tile.location} ${tile.entity}`;
        let choice = await showChoiceDialog(msg, options);
        await handleChoice(choice, tile);
    }
}

export async function handleChoice(choice, tile) {
    if (choice === 'close') {
        return; // Close dialog without further action
    }
    if (choice === '2') { // Rest
        gameState.health = Math.min(100, gameState.health + 10 * (1 + getGroupBonus('health')));
        gameState.food -= gameState.group.length * 0.5;
        gameState.water -= gameState.group.length * 0.5;
        await showChoiceDialog('Rested. 😴', [
            {label: 'OK', value: 'ok'},
            {label: '❌ Close', value: 'close'}
        ]);
        logEvent('😴 Rested');
    } else if (choice === '3') { // Trade
        let t = await showChoiceDialog('Trade options:', [
            {label: '📥 Buy food 🍞 (10 for 10g)', value: '1'},
            {label: '📥 Buy water 💧 (10 for 10g)', value: '2'},
            {label: '📤 Sell wood 🪵 (5 for 10g)', value: '3'},
            {label: '📥 Buy cart 🛒 (100g for 1)', value: '4'},
            {label: '❌ Close', value: 'close'}
        ]);
        if (t === 'close') return;
        let tradeDesc = '';
        let max_storage = getMaxStorage();
        if (t === '1') {
            if (gameState.gold >= 10 && gameState.food + 10 <= max_storage) {
                gameState.food += 10;
                gameState.gold -= 10;
                tradeDesc = '📥 Bought 10 food 🍞 for 10g';
            } else {
                await showChoiceDialog('Not enough gold or storage! ⚠️', [
                    {label: 'OK', value: 'ok'},
                    {label: '❌ Close', value: 'close'}
                ]);
            }
        } else if (t === '2') {
            if (gameState.gold >= 10 && gameState.water + 10 <= max_storage) {
                gameState.water += 10;
                gameState.gold -= 10;
                tradeDesc = '📥 Bought 10 water 💧 for 10g';
            } else {
                await showChoiceDialog('Not enough gold or storage! ⚠️', [
                    {label: 'OK', value: 'ok'},
                    {label: '❌ Close', value: 'close'}
                ]);
            }
        } else if (t === '3') {
            if (gameState.wood >= 5) {
                gameState.wood -= 5;
                gameState.gold += 10;
                tradeDesc = '📤 Sold 5 wood 🪵 for 10g';
            } else {
                await showChoiceDialog('Not enough wood! ⚠️', [
                    {label: 'OK', value: 'ok'},
                    {label: '❌ Close', value: 'close'}
                ]);
            }
        } else if (t === '4') {
            if (gameState.gold >= 100) {
                gameState.carts += 1;
                gameState.gold -= 100;
                tradeDesc = '📥 Bought cart 🛒 for 100g';
            } else {
                await showChoiceDialog('Not enough gold! ⚠️', [
                    {label: 'OK', value: 'ok'},
                    {label: '❌ Close', value: 'close'}
                ]);
            }
        }
        if (tradeDesc) {
            logEvent(tradeDesc);
        }
    } else if (choice === '4') { // Hire
        const roles = ['native-guide👲🏻', 'cook🧑🏻‍🍳', 'guard💂🏻', 'geologist🧑🏻‍🔬', 'biologist🧑🏻‍🔬', 'translator👳🏻', 'carrier🧑🏻‍🔧', 'medic🧑🏻‍⚕️', 'navigator🧑🏻‍✈️'];
        let hires = [];
        for (let i = 0; i < 3; i++) {
            let r = roles[Math.floor(Math.random() * roles.length)];
            let cost = 50 + Math.floor(Math.random() * 50);
            hires.push({label: `${i+1}: ${r} for ${cost}g`, value: (i+1).toString()});
        }
        hires.push({label: '❌ Close', value: 'close'});
        let c = await showChoiceDialog('Hire options:', hires);
        if (c === 'close') return;
        if (c && ['1','2','3'].includes(c)) {
            let idx = parseInt(c) - 1;
            let hireStr = hires[idx].label;
            let role = hireStr.split(': ')[1].split(' for ')[0];
            let cost = parseInt(hireStr.split(' for ')[1]);
            if (gameState.gold >= cost) {
                gameState.group.push({role, bonus: getBonusForRole(role)});
                gameState.gold -= cost;
                await showChoiceDialog(`Hired ${role}! 👏`, [
                    {label: 'OK', value: 'ok'},
                    {label: '❌ Close', value: 'close'}
                ]);
                logEvent(`🧍🏻 Hired ${role} for ${cost}g`);
            } else {
                await showChoiceDialog('Not enough gold! ⚠️', [
                    {label: 'OK', value: 'ok'},
                    {label: '❌ Close', value: 'close'}
                ]);
            }
        }
    } else if (choice === '5') { // Sell discoveries
        gameState.gold += gameState.discoverPoints;
        logEvent(`🪙 Sold discoveries for ${gameState.discoverPoints}g`);
        gameState.discoverPoints = 0;
        await showChoiceDialog('Sold discoveries! 🪙', [
            {label: 'OK', value: 'ok'},
            {label: '❌ Close', value: 'close'}
        ]);
    } else if (choice === '6') { // Sell hunts
        gameState.gold += gameState.killPoints;
        logEvent(`🪙 Sold hunts for ${gameState.killPoints}g`);
        gameState.killPoints = 0;
        await showChoiceDialog('Sold hunts! 🪙', [
            {label: 'OK', value: 'ok'},
            {label: '❌ Close', value: 'close'}
        ]);
    }
}

export async function showMenu() {
    let inv = `❤️‍🩹 Health: ${gameState.health} 🪙 Gold: ${gameState.gold} 🍞 Food: ${gameState.food.toFixed(1)} 💧 Water: ${gameState.water.toFixed(1)} ⛺ Tents: ${gameState.tents} 🧱 Mats: ${gameState.building_mats} 🪵 Wood: ${gameState.wood}`;
    let grp = gameState.group.map(g => g.role).join(', ');
    let msg = `${inv}\n👥 Group: ${grp}`;
    console.log('Menu message:', msg); // Debug
    let choice = await showChoiceDialog(msg, [
        {label: '❌ Close', value: 'close'},
        {label: '🏗️ Build camp ⛺ (5 🧱, 5 🪵)', value: '2'},
        {label: '🏗️ Build outpost 🏕️ (10 🧱, 10 🪵)', value: '3'}
    ]);
    if (choice === 'close') return;
    if (choice === '2' || choice === '3') {
        let costMats = choice === '2' ? 5 : 10;
        let costWood = choice === '2' ? 5 : 10;
        let type = choice === '2' ? 'camp' : 'outpost';
        if (gameState.building_mats >= costMats && gameState.wood >= costWood) {
            let dirStr = await showChoiceDialog('Direction:', [
                {label: 'N', value: 'N'},
                {label: 'NE', value: 'NE'},
                {label: 'E', value: 'E'},
                {label: 'SE', value: 'SE'},
                {label: 'S', value: 'S'},
                {label: 'SW', value: 'SW'},
                {label: 'W', value: 'W'},
                {label: 'NW', value: 'NW'},
                {label: '❌ Close', value: 'close'}
            ]);
            if (dirStr === 'close') return;
            const dmap = {
                'N': {dx:0,dy:-1}, 'NE':{dx:1,dy:-1}, 'E':{dx:1,dy:0}, 'SE':{dx:1,dy:1},
                'S':{dx:0,dy:1}, 'SW':{dx:-1,dy:1}, 'W':{dx:-1,dy:0}, 'NW':{dx:-1,dy:-1}
            };
            let d = dmap[dirStr];
            if (d) {
                let bx = gameState.px + d.dx;
                let by = gameState.py + d.dy;
                let btile = getTile(bx, by);
                if (btile.location === 'none' && btile.entity === 'none') {
                    gameState.changed.push({x: bx, y: by, type});
                    gameState.building_mats -= costMats;
                    gameState.wood -= costWood;
                    await showChoiceDialog(`Built ${type}! 🏗️`, [
                        {label: 'OK', value: 'ok'},
                        {label: '❌ Close', value: 'close'}
                    ]);
                    logEvent(`🏗️ Built ${type} at (${bx},${by})`);
                } else {
                    await showChoiceDialog('Cannot build there. 🚫', [
                        {label: 'OK', value: 'ok'},
                        {label: '❌ Close', value: 'close'}
                    ]);
                }
            } else {
                await showChoiceDialog('Invalid direction. ❓', [
                    {label: 'OK', value: 'ok'},
                    {label: '❌ Close', value: 'close'}
                ]);
            }
        } else {
            await showChoiceDialog('Not enough materials! ⚠️', [
                {label: 'OK', value: 'ok'},
                {label: '❌ Close', value: 'close'}
            ]);
        }
    }
}