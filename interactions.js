import { gameState } from './game_variables.js';
import { getGroupBonus, getTile, getMaxStorage, getBonusForRole } from './utils.js';
import { logEvent } from './time_system.js';

const gameDialog = document.getElementById('game-dialog');

async function showChoiceDialog(message, buttons) {
    return new Promise((resolve) => {
        gameDialog.innerHTML = '';
        const form = document.createElement('form');
        form.method = 'dialog';
        const p = document.createElement('p');
        p.textContent = message;
        form.appendChild(p);
        buttons.forEach(({label, value}) => {
            const btn = document.createElement('button');
            btn.value = value;
            btn.textContent = label;
            form.appendChild(btn);
        });
        gameDialog.appendChild(form);
        gameDialog.addEventListener('close', () => resolve(gameDialog.returnValue), {once: true});
        gameDialog.showModal();
    });
}

export async function showAlert(message) {
    return new Promise((resolve) => {
        gameDialog.innerHTML = '';
        const p = document.createElement('p');
        p.textContent = message;
        gameDialog.appendChild(p);
        const btn = document.createElement('button');
        btn.textContent = 'OK';
        gameDialog.appendChild(btn);
        gameDialog.addEventListener('close', () => resolve(), {once: true});
        gameDialog.showModal();
    });
}

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
            await showAlert('Fled back. 😵‍💫');
        } else {
            await showAlert('Fled, staying put. 😅');
        }
        return false;
    }
    let combatBonus = getGroupBonus('combat');
    let success = Math.random() < 0.5 + combatBonus;
    if (success) {
        await showAlert('Victory! 🏆');
        gameState.killed.add(`${ex},${ey}`);
        gameState.killPoints += 5;
        logEvent(`🏆 Defeated ${entity} at (${ex},${ey})`);
        return true;
    } else {
        await showAlert('Defeat! Took damage.🤕');
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
    if (tile.location !== 'none' || tile.entity !== 'none') {
        if (['waterfalls', 'canyon', 'geyser', 'peaks', 'monster caves', 'cave', 'ruin'].includes(tile.location)) {
            gameState.discoverPoints += 10;
            await showAlert(`Discovered ${tile.location}! 🌟`);
            logEvent(`🌟 Discovered ${tile.location} at (${gameState.px},${gameState.py})`);
        }
        let options = ['1: 🚶 Leave'];
        if (['camp', 'outpost'].includes(tile.location)) options.push('2: 😴 Rest');
        if (['outpost', 'hamlet', 'village', 'city'].includes(tile.location) || ['trader', 'caravan'].includes(tile.entity)) {
            options.push('3: 🪙 Trade');
            options.push('4: 🧍🏻 Hire');
        }
        if (tile.location === 'city') options.push('5: 🪙 Sell discoveries');
        if (tile.location === 'village') options.push('6: 🏹 Sell hunts');
        let msg = `At ${tile.location} ${tile.entity}`;
        let choice = await showChoiceDialog(msg, options.map(opt => {
            let [val, label] = opt.split(': ');
            return {label, value: val};
        }));
        await handleChoice(choice, tile);
    }
}

export async function handleChoice(choice, tile) {
    if (choice === '2') { // Rest
        gameState.health = Math.min(100, gameState.health + 10 * (1 + getGroupBonus('health')));
        gameState.food -= gameState.group.length * 0.5;
        gameState.water -= gameState.group.length * 0.5;
        await showAlert('Rested. 😴');
        logEvent('😴 Rested');
    } else if (choice === '3') { // Trade
        let t = await showChoiceDialog('Trade options:', [
            {label: '📥 Buy food 🍞 (10 for 10g)', value: '1'},
            {label: '📥 Buy water 💧 (10 for 10g)', value: '2'},
            {label: '📤 Sell wood 🪵 (5 for 10g)', value: '3'},
            {label: '📥 Buy cart 🛒 (100g for 1)', value: '4'}
        ]);
        let tradeDesc = '';
        let max_storage = getMaxStorage();
        if (t === '1') {
            if (gameState.gold >= 10 && gameState.food + 10 <= max_storage) {
                gameState.food += 10;
                gameState.gold -= 10;
                tradeDesc = '📥 Bought 10 food 🍞 for 10g';
            } else {
                await showAlert('Not enough gold or storage! ⚠️');
            }
        } else if (t === '2') {
            if (gameState.gold >= 10 && gameState.water + 10 <= max_storage) {
                gameState.water += 10;
                gameState.gold -= 10;
                tradeDesc = '📥 Bought 10 water 💧 for 10g';
            } else {
                await showAlert('Not enough gold or storage! ⚠️');
            }
        } else if (t === '3') {
            if (gameState.wood >= 5) {
                gameState.wood -= 5;
                gameState.gold += 10;
                tradeDesc = '📤 Sold 5 wood 🪵 for 10g';
            } else {
                await showAlert('Not enough wood! ⚠️');
            }
        } else if (t === '4') {
            if (gameState.gold >= 100) {
                gameState.carts += 1;
                gameState.gold -= 100;
                tradeDesc = '📥 Bought cart 🛒 for 100g';
            } else {
                await showAlert('Not enough gold! ⚠️');
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
            hires.push(`${i+1}: ${r} for ${cost}g`);
        }
        let c = await showChoiceDialog('Hire options:', hires.map((h, i) => ({label: h, value: (i+1).toString()})));
        if (c && ['1','2','3'].includes(c)) {
            let idx = parseInt(c) - 1;
            let hireStr = hires[idx];
            let role = hireStr.split(': ')[1].split(' for ')[0];
            let cost = parseInt(hireStr.split(' for ')[1]);
            if (gameState.gold >= cost) {
                gameState.group.push({role, bonus: getBonusForRole(role)});
                gameState.gold -= cost;
                await showAlert(`Hired ${role}! 👏`);
                logEvent(`🧍🏻 Hired ${role} for ${cost}g`);
            } else {
                await showAlert('Not enough gold! ⚠️');
            }
        }
    } else if (choice === '5') { // Sell discoveries
        gameState.gold += gameState.discoverPoints;
        logEvent(`🪙 Sold discoveries for ${gameState.discoverPoints}g`);
        gameState.discoverPoints = 0;
        await showAlert('Sold discoveries! 🪙');
    } else if (choice === '6') { // Sell hunts
        gameState.gold += gameState.killPoints;
        logEvent(`🪙 Sold hunts for ${gameState.killPoints}g`);
        gameState.killPoints = 0;
        await showAlert('Sold hunts! 🪙');
    }
}

export async function showMenu() {
    let inv = `❤️‍🩹 Health: ${gameState.health} 🪙 Gold: ${gameState.gold} 🍞 Food: ${gameState.food.toFixed(1)} 💧 Water: ${gameState.water.toFixed(1)} ⛺ Tents: ${gameState.tents} 🧱 Mats: ${gameState.building_mats} 🪵 Wood: ${gameState.wood}`;
    let grp = gameState.group.map(g => g.role).join(', ');
    let msg = `${inv}\n👥 Group: ${grp}`;
    let choice = await showChoiceDialog(msg, [
        {label: '❌ Close', value: '1'},
        {label: '🏗️ Build camp ⛺ (5 🧱 mats, 5 🪵 wood)', value: '2'},
        {label: '🏗️ Build outpost 🏕️ (10 🧱 mats, 10 🪵 wood)', value: '3'}
    ]);
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
                {label: 'NW', value: 'NW'}
            ]);
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
                    await showAlert(`Built ${type}! 🏗️`);
                    logEvent(`🏗️ Built ${type} at (${bx},${by})`);
                } else {
                    await showAlert('Cannot build there. 🚫');
                }
            } else {
                await showAlert('Invalid direction. ❓');
            }
        } else {
            await showAlert('Not enough materials! ⚠️');
        }
    }
}