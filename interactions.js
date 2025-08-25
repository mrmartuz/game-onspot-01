import { health, gold, food, water, tents, building_mats, wood, carts, group, discoverPoints, killPoints, changed, killed, px, py, prevx, prevy } from './game_variables.js';
import { getGroupBonus, getTile, getMaxStorage, getBonusForRole } from './utils.js';
import { logEvent } from './time_system.js';

export function handleCombat(ex, ey, isOnTile = false) {
    let tile = getTile(ex, ey);
    let entity = tile.entity;
    let input = prompt(`Hostile ${entity} at (${ex},${ey})! 1:⚔️ Attack, 2:🌬️ Flee`);
    if (input === '2') {
        if (isOnTile) {
            px = prevx;
            py = prevy;
            alert('Fled back. 😵‍💫');
        } else {
            alert('Fled, staying put. 😅');
        }
        return false;
    }
    let combatBonus = getGroupBonus('combat');
    let success = Math.random() < 0.5 + combatBonus;
    if (success) {
        alert('Victory! 🏆');
        killed.add(`${ex},${ey}`);
        killPoints += 5;
        logEvent(`🏆 Defeated ${entity} at (${ex},${ey})`);
        return true;
    } else {
        alert('Defeat! Took damage.🤕');
        health -= isOnTile ? 20 : 10;
        logEvent(`🤕 Defeated by ${entity} at (${ex},${ey})`);
        return false;
    }
}

export function checkAdjacentMonsters() {
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            if (dx === 0 && dy === 0) continue;
            let tile = getTile(px + dx, py + dy);
            if (tile.entity === 'monster' || tile.entity === 'beast') {
                handleCombat(px + dx, py + dy);
            }
        }
    }
}

export function checkTileInteraction(tile) {
    if (['monster', 'beast'].includes(tile.entity)) {
        handleCombat(px, py, true);
        return;
    }
    if (tile.location !== 'none' || tile.entity !== 'none') {
        if (['waterfalls', 'canyon', 'geyser', 'peaks', 'monster caves', 'cave', 'ruin'].includes(tile.location)) {
            discoverPoints += 10;
            alert(`Discovered ${tile.location}! 🌟`);
            logEvent(`🌟 Discovered ${tile.location} at (${px},${py})`);
        }
        let options = ['1: 🚶 Leave'];
        if (['camp', 'outpost'].includes(tile.location)) options.push('2: 😴 Rest');
        if (['outpost', 'hamlet', 'village', 'city'].includes(tile.location) || ['trader', 'caravan'].includes(tile.entity)) {
            options.push('3: 🪙 Trade');
            options.push('4: 🧍🏻 Hire');
        }
        if (tile.location === 'city') options.push('5: 🪙 Sell discoveries');
        if (tile.location === 'village') options.push('6: 🏹 Sell hunts');
        let msg = `At ${tile.location} ${tile.entity}\n${options.join('\n')}`;
        let choice = prompt(msg);
        handleChoice(choice, tile);
    }
}

export function handleChoice(choice, tile) {
    if (choice === '2') { // Rest
        health = Math.min(100, health + 10 * (1 + getGroupBonus('health')));
        food -= group.length * 0.5;
        water -= group.length * 0.5;
        alert('Rested. 😴');
        logEvent('😴 Rested');
    } else if (choice === '3') { // Trade
        let t = prompt('1: 📥 Buy food 🍞 (10 for 10g), 2: 📥 Buy water 💧 (10 for 10g), 3: 📤 Sell wood 🪵 (5 for 10g), 4: 📥 Buy cart 🛒 (100g for 1)');
        let tradeDesc = '';
        let max_storage = getMaxStorage();
        if (t === '1' && gold >= 10 && food + 10 <= max_storage) { 
            food += 10; 
            gold -= 10; 
            tradeDesc = '📥 Bought 10 food 🍞 for 10g'; 
        } else if (t === '1') {
            alert('Not enough gold or storage! ⚠️');
        }
        if (t === '2' && gold >= 10 && water + 10 <= max_storage) { 
            water += 10; 
            gold -= 10; 
            tradeDesc = '📥 Bought 10 water 💧 for 10g'; 
        } else if (t === '2') {
            alert('Not enough gold or storage! ⚠️');
        }
        if (t === '3' && wood >= 5) { 
            wood -= 5; 
            gold += 10; 
            tradeDesc = '📤 Sold 5 wood 🪵 for 10g'; 
        } else if (t === '3') {
            alert('Not enough wood! ⚠️');
        }
        if (t === '4' && gold >= 100) { 
            carts += 1; 
            gold -= 100; 
            tradeDesc = '📥 Bought cart 🛒 for 100g'; 
        } else if (t === '4') {
            alert('Not enough gold! ⚠️');
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
        let c = prompt(hires.join('\n'));
        if (c && ['1','2','3'].includes(c)) {
            let idx = parseInt(c) - 1;
            let hireStr = hires[idx];
            let role = hireStr.split(': ')[1].split(' for ')[0];
            let cost = parseInt(hireStr.split(' for ')[1]);
            if (gold >= cost) {
                group.push({role, bonus: getBonusForRole(role)});
                gold -= cost;
                alert(`Hired ${role}! 👏`);
                logEvent(`🧍🏻 Hired ${role} for ${cost}g`);
            } else alert('Not enough gold! ⚠️');
        }
    } else if (choice === '5') { // Sell discoveries
        gold += discoverPoints;
        logEvent(`🪙 Sold discoveries for ${discoverPoints}g`);
        discoverPoints = 0;
        alert('Sold discoveries! 🪙');
    } else if (choice === '6') { // Sell hunts
        gold += killPoints;
        logEvent(`🪙 Sold hunts for ${killPoints}g`);
        killPoints = 0;
        alert('Sold hunts! 🪙');
    }
}

export function showMenu() {
    let inv = `❤️‍🩹 Health: ${health} 🪙 Gold: ${gold} 🍞 Food: ${food.toFixed(1)} 💧 Water: ${water.toFixed(1)} ⛺ Tents: ${tents} 🧱 Mats: ${building_mats} 🪵 Wood: ${wood}`;
    let grp = group.map(g => g.role).join(', ');
    let msg = `${inv}\n👥 Group: ${grp}\n1: ❌ Close, 2: 🏗️ Build camp ⛺ (5 🧱 mats, 5 🪵 wood), 3: 🏗️ Build outpost 🏕️ (10 🧱 mats, 10 🪵 wood)`;
    let choice = prompt(msg);
    if (choice === '2' || choice === '3') {
        let costMats = choice === '2' ? 5 : 10;
        let costWood = choice === '2' ? 5 : 10;
        let type = choice === '2' ? 'camp' : 'outpost';
        if (building_mats >= costMats && wood >= costWood) {
            let dirStr = prompt('Direction: N NE E SE S SW W NW');
            const dmap = {
                'N': {dx:0,dy:-1}, 'NE':{dx:1,dy:-1}, 'E':{dx:1,dy:0}, 'SE':{dx:1,dy:1},
                'S':{dx:0,dy:1}, 'SW':{dx:-1,dy:1}, 'W':{dx:-1,dy:0}, 'NW':{dx:-1,dy:-1}
            };
            let d = dmap[dirStr ? dirStr.toUpperCase() : ''];
            if (d) {
                let bx = px + d.dx;
                let by = py + d.dy;
                let btile = getTile(bx, by);
                if (btile.location === 'none' && btile.entity === 'none') {
                    changed.push({x: bx, y: by, type});
                    building_mats -= costMats;
                    wood -= costWood;
                    alert(`Built ${type}! 🏗️`);
                    logEvent(`🏗️ Built ${type} at (${bx},${by})`);
                } else alert('Cannot build there. 🚫');
            } else alert('Invalid direction. ❓');
        } else alert('Not enough materials! ⚠️');
    }
}