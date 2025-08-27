import { gameState } from './game_variables.js';
import { getGroupBonus, getTile, getMaxStorage, getBonusForRole, updateGroupBonus } from './utils.js';
import { logEvent, getCurrentGameDate } from './time_system.js';
import { updateStatus } from './rendering.js';

const gameDialog = document.getElementById('game-dialog');

export async function showChoiceDialog(message, buttons) {
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
        // Ensure dialog is not already open
        if (gameDialog.open) {
            gameDialog.close();
        }
        gameDialog.showModal();
        gameDialog.addEventListener('close', () => resolve(gameDialog.returnValue), {once: true});
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
    
    // Apply combat bonus for better success chance
    let combatBonus = getGroupBonus('combat');
    let baseSuccessChance = 0.5;
    let success = Math.random() < baseSuccessChance + combatBonus;
    
    if (success) {
        await showChoiceDialog('Victory! 🏆', [
            {label: 'OK', value: 'ok'}
        ]);
        gameState.killed.add(`${ex},${ey}`);
        gameState.killPoints += 5;
        updateStatus();
        logEvent(`🏆 Defeated ${entity} at (${ex},${ey})`);
        return true;
    } else {
        // Apply health bonus to reduce damage taken
        let healthBonus = getGroupBonus('health');
        let damageReduction = healthBonus * 0.5; // Health bonus reduces damage by up to 50%
        let baseDamage = isOnTile ? 20 : 10;
        let finalDamage = Math.max(1, baseDamage * (1 - damageReduction));
        
        await showChoiceDialog('Defeat! Took damage.🤕', [
            {label: 'OK', value: 'ok'}
        ]);
        gameState.health -= finalDamage;
        updateStatus();
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
            // Apply discovery bonus to discovery points
            const positionKey = `${gameState.px},${gameState.py}`;
            if(gameState.discoveredLocations.has(positionKey)){
                await showChoiceDialog(`You've already discovered this ${tile.location}! 🌟`, [
                    {label: 'OK', value: 'ok'}
                ]);
                return;
            }
            let discoveryBonus = getGroupBonus('discovery');
            let basePoints = 10;
            let bonusPoints = Math.floor(basePoints * discoveryBonus * Math.random()); // Random bonus based on discovery skill
            let totalPoints = basePoints + bonusPoints;

            gameState.discoverPoints += totalPoints;
            gameState.discoveredLocations.add(positionKey); // Add position to discovered locations
            updateStatus();

            let bonusText = bonusPoints > 0 ? ` (+${bonusPoints} bonus)` : '';
            await showChoiceDialog(`Discovered ${tile.location}! 🌟${bonusText}`, [
                {label: 'OK', value: 'ok'}
            ]);
            logEvent(`🌟 Discovered ${tile.location} +${totalPoints} points`);
        }
        let options = [
            {label: '🚶 Leave', value: '1'}
        ];
        
        if (['camp', 'outpost', 'farm','hamlet', 'village', 'city'].includes(tile.location)) {
            options.unshift({label: '😴 Rest', value: '2'});
        }
        if (['hamlet', 'village', 'city'].includes(tile.location) || ['trader', 'caravan'].includes(tile.entity)) {
            options.unshift({label: '🪙 Trade', value: '3'});
        }
        if (['outpost', 'farm', 'hamlet', 'village', 'city'].includes(tile.location) || ['trader', 'caravan', 'army', 'group', `npc`].includes(tile.entity)) {
            options.unshift({label: '🧍🏻 Hire', value: '4'});
        }
        if (tile.location === 'city') {
            options.unshift({label: '🌟 Sell discoveries', value: '5'});
        }
        if (['village', 'city'].includes(tile.location) || ['caravan'].includes(tile.entity)) {
            options.unshift({label: '🏹 Sell hunts', value: '6'});
        }
        
        
        let msg = `At ${tile.location !== 'none' ? tile.location : ''} ${tile.entity !== 'none' ? tile.entity : ''}`.trim();
        if (msg === 'At') msg = 'On this tile';
        let choice = await showChoiceDialog(msg, options);
        await handleChoice(choice, tile);
    }
}

export async function handleChoice(choice, tile) {
    if (choice === 'close') {
        return; // Close dialog without further action
    }
    if (choice === '1') { // Leave
        return; // Just close the dialog and return to game
    }
    if (choice === '2') { // Rest
        // Apply health bonus for better healing
        let healthBonus = getGroupBonus('health');
        let baseHealing = 10;
        let bonusHealing = Math.floor(baseHealing * healthBonus * 0.5); // Health bonus adds up to 50% more healing
        let totalHealing = baseHealing + bonusHealing;
        
        gameState.health = Math.min(100, gameState.health + totalHealing);
        gameState.food -= gameState.group.length * 0.5;
        gameState.water -= gameState.group.length * 0.5;
        updateStatus();
        
        let bonusText = bonusHealing > 0 ? ` (+${bonusHealing} bonus)` : '';
        await showChoiceDialog(`Rested. 😴 Healed ${totalHealing} health${bonusText}`, [
            {label: 'OK', value: 'ok'}
        ]);
        logEvent(`😴 Rested and healed ${totalHealing} health${bonusText}`);
    } else if (choice === '3') { // Trade
        // Apply interact bonus for better trade prices
        let interactBonus = getGroupBonus('interact');
        let buyDiscount = Math.min(0.3, interactBonus * 0.3); // Up to 30% discount on buying
        let sellBonus = Math.min(0.5, interactBonus * 0.6); // Up to 50% bonus on selling
        
        let trading = true;
        while (trading) {
            let t = await showChoiceDialog('Trade options:', [
                {label: `📥 Buy food 🍞 (${Math.floor(10 * (1 - buyDiscount))} for 10g)`, value: '1'},
                {label: `📥 Sell food 🍞 (10 for ${Math.floor(3 * (1 + sellBonus))}g)`, value: '2'},
                {label: `📥 Buy water 💧 (${Math.floor(10 * (1 - buyDiscount))} for 10g)`, value: '3'},
                {label: `📥 Sell water 💧 (10 for ${Math.floor(3 * (1 + sellBonus))}g)`, value: '4'},
                {label: `📤 Sell wood 🪵 (5 for ${Math.floor(10 * (1 + sellBonus))}g)`, value: '5'},
                {label: '📥 Buy cart 🛒 (100g for 1)', value: '6'},
                {label: '❌ Close', value: 'close'}
            ]);
            
            if (t === 'close') {
                trading = false;
                continue;
            }
            
            let tradeDesc = '';
            let max_storage = getMaxStorage();
            if (t === '1') {
                if (gameState.gold >= 10 && gameState.food + 10 <= max_storage) {
                    let actualFood = Math.floor(10 * (1 - buyDiscount));
                    gameState.food += actualFood;
                    gameState.gold -= 10;
                    updateStatus();
                    tradeDesc = `📥 Bought ${actualFood} food 🍞 for 10g`;
                } else {
                    await showChoiceDialog('Not enough gold or storage! ⚠️', [
                        {label: 'OK', value: 'ok'}
                    ]);
                }
            } else if (t === '2') {
                if (gameState.food >= 10) {
                    gameState.food -= 10;
                    let actualGold = Math.floor(3 * (1 + sellBonus));
                    gameState.gold += actualGold;
                    updateStatus();
                    tradeDesc = `📥 Sold 10 food 🍞 for ${actualGold}g`;
                } else {
                    await showChoiceDialog('Not enough food! ⚠️', [
                        {label: 'OK', value: 'ok'}
                    ]);
                }
            } else if (t === '3') {
                if (gameState.gold >= 10 && gameState.water + 10 <= max_storage) {
                    let actualWater = Math.floor(10 * (1 - buyDiscount));
                    gameState.water += actualWater;
                    gameState.gold -= 10;
                    updateStatus();
                    tradeDesc = `📥 Bought ${actualWater} water 💧 for 10g`;
                } else {
                    await showChoiceDialog('Not enough gold or storage! ⚠️', [
                        {label: 'OK', value: 'ok'}
                    ]);
                }
            } else if (t === '4') {
                if (gameState.water >= 10) {
                    gameState.water -= 10;
                    let actualGold = Math.floor(3 * (1 + sellBonus));
                    gameState.gold += actualGold;
                    updateStatus();
                    tradeDesc = `📥 Sold 10 water 💧 for ${actualGold}g`;
                } else {
                    await showChoiceDialog('Not enough water! ⚠️', [
                        {label: 'OK', value: 'ok'}
                    ]);
                }
            } else if (t === '5') {
                if (gameState.wood >= 5) {
                    gameState.wood -= 5;
                    let actualGold = Math.floor(10 * (1 + sellBonus));
                    gameState.gold += actualGold;
                    updateStatus();
                    tradeDesc = `📤 Sold 5 wood 🪵 for ${actualGold}g`;
                } else {
                    await showChoiceDialog('Not enough wood! ⚠️', [
                        {label: 'OK', value: 'ok'}
                    ]);
                }
            } else if (t === '6') {
                if (gameState.gold >= 100) {
                    gameState.carts += 1;
                    gameState.gold -= 100;
                    tradeDesc = '📥 Bought cart 🛒 for 100g';
                } else {
                    await showChoiceDialog('Not enough gold! ⚠️', [
                        {label: 'OK', value: 'ok'}
                    ]);
                }
            }
            if (tradeDesc) {
                logEvent(tradeDesc);
            }
        }
    } else if (choice === '4') { // Hire
        // Apply interact bonus for hiring discounts
        let number_of_hires = 0;
        let interactBonus = getGroupBonus('interact');
        let hireDiscount = Math.min(0.4, interactBonus * 0.6); // Up to 40% discount on hiring
        if (tile.entity === 'caravan'  || tile.entity === 'group' || ['outpost', 'farm'].includes(tile.location)){
            number_of_hires = Math.floor(Math.random() * 2) + 2;
        } else if(tile.entity === 'army' || ['hamlet', 'village', 'city'].includes(tile.location)){
            number_of_hires = Math.floor(Math.random() * 4) + 3;
        } else {
            number_of_hires = Math.floor(Math.random() * 2) + 1;
        }
        let hiring = true;
        while (hiring) {
            const roles = ['native-guide🧭', 'cook🍞', 'guard⚔️', 'geologist🪵', 'biologist🌱', 'translator🤝', 'carrier📦', 'medic❤️', 'navigator👁️', 'explorer🔍'];
            let hires = [];
            for (let i = 0; i < number_of_hires; i++) {
                let r = roles[Math.floor(Math.random() * roles.length)];
                let baseCost = 50 + Math.floor(Math.random() * 50);
                let actualCost = Math.floor(baseCost * (1 - hireDiscount));
                hires.push({label: `${i+1}: ${r} for ${actualCost}g`, value: (i+1).toString(), baseCost, actualCost});
            }
            hires.push({label: '❌ Close', value: 'close'});
            
            let c = await showChoiceDialog('Hire options:', hires);
            if (c === 'close') {
                hiring = false;
                continue;
            }
            
            if (c && ['1','2','3'].includes(c)) {
                let idx = parseInt(c) - 1;
                let hireStr = hires[idx].label;
                let role = hireStr.split(': ')[1].split(' for ')[0];
                let cost = hires[idx].actualCost;
                if (gameState.gold >= cost) {
                    gameState.group.push({role, bonus: getBonusForRole(role)});
                    gameState.gold -= cost;
                    updateGroupBonus(); // Recalculate group bonuses after hiring
                    let discountText = hireDiscount > 0 ? ` (${Math.floor(hireDiscount * 100)}% discount applied)` : '';
                    await showChoiceDialog(`Hired ${role}! 👏${discountText}`, [
                        {label: 'OK', value: 'ok'}
                    ]);
                    logEvent(`🧍🏻 Hired ${role} for ${cost}g${discountText}`);
                } else {
                    await showChoiceDialog('Not enough gold! ⚠️', [
                        {label: 'OK', value: 'ok'}
                    ]);
                }
            }
        }
    } else if (choice === '5') { // Sell discoveries
        if(gameState.discoverPoints > 0){
        gameState.gold += gameState.discoverPoints;
        logEvent(`🪙 Sold discoveries for ${gameState.discoverPoints}g`);
        gameState.discoverPoints = 0;
        updateStatus();
        await showChoiceDialog('Sold discoveries! 🪙', [
            {label: 'OK', value: 'ok'}
        ]);
    } else {
        await showChoiceDialog('No discoveries to sell! You Scum! Go discover some locations! ⚠️', [
            {label: 'OK', value: 'ok'}
        ]);
    }
    } else if (choice === '6') { // Sell hunts
        if(gameState.killPoints > 0){
        gameState.gold += gameState.killPoints;
        logEvent(`🪙 Sold hunts for ${gameState.killPoints}g`);
        gameState.killPoints = 0;
        updateStatus();
        await showChoiceDialog('Sold hunts! 🪙', [
            {label: 'OK', value: 'ok'}
        ]);
    } else {
        await showChoiceDialog('No hunts to sell! Go hunt some monsters or get killed or get a job! ⚠️', [
            {label: 'OK', value: 'ok'}
        ]);
    }
    }
}

export async function showMenu() {
    // Check if player is on a tile with location or entity
    let currentTile = getTile(gameState.px, gameState.py);
    if (currentTile.location !== 'none' || currentTile.entity !== 'none'){
        await checkTileInteraction(currentTile);
        return;
    }

    let isFlora = false;
    
    // If there's a combat entity, handle combat first
    if (['monster', 'beast'].includes(currentTile.entity)) {
        await handleCombat(gameState.px, gameState.py, true);
        return;
    }
    
    // If there's a location, entity, or edible flora, show the appropriate interaction dialog
    if (['sun-flower', 'iris', 'tulip'].includes(currentTile.flora_type)) {
        isFlora = true;
    }
    
    // Otherwise show the regular menu
    let max_storage = getMaxStorage();
    let inv = `❤️‍🩹 Health: ${gameState.health} 🌟 Discoveries: ${gameState.discoverPoints} 🪙 Gold: ${gameState.gold} 🍞 Food: ${gameState.food.toFixed(1)}/${max_storage} 💧 Water: ${gameState.water.toFixed(1)}/${max_storage} ⛺ Tents: ${gameState.tents} 🧱 Mats: ${gameState.building_mats} 🪵 Wood: ${gameState.wood}`;
    let grp = gameState.group.map(g => g.role).join(', ');
    let msg = `${inv}\n👥 Group: ${grp}`;
    let choice = await showChoiceDialog(msg, [
        ...(isFlora ? [{label: '🌱 Harvest flowers', value: '4'}] : []),
        {label: '🏗️ Build camp ⛺ (5 🧱, 5 🪵)', value: '2'},
        {label: '🏗️ Build outpost 🏕️ (10 🧱, 10 🪵)', value: '3'},  
        {label: '❌ Close', value: 'close'}
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
                        {label: 'OK', value: 'ok'}
                    ]);
                    logEvent(`🏗️ Built ${type} at (${bx},${by})`);
                } else {
                    await showChoiceDialog('Cannot build there. 🚫', [
                        {label: '❌ Close', value: 'close'}
                    ]);
                }
            } else {
                await showChoiceDialog('Invalid direction. ❓', [
                    {label: '❌ Close', value: 'close'}
                ]);
            }
        } else {
            await showChoiceDialog('Not enough materials! ⚠️', [
                {label: '❌ Close', value: 'close'}
            ]);
        }
    }
    if (choice === '4') {
        // Apply plant bonus for better harvest yields
        let plantBonus = getGroupBonus('plant');
        let baseFood = Math.floor((Math.random() * 1.2))+ 0.1;
        console.log(baseFood);
        let bonusFood = Math.floor(baseFood * plantBonus);
        console.log(bonusFood);
        let totalFood = baseFood + bonusFood;
        console.log(totalFood);
        let max_storage = getMaxStorage();
        if(totalFood > 0){
            if (gameState.food + totalFood <= max_storage) {
            gameState.food += totalFood;
            updateStatus();
            let bonusText = bonusFood > 0 ? ` (+${bonusFood} bonus)` : '';
            await showChoiceDialog(`Harvested flowers! 🌱 Gained ${totalFood} food${bonusText}`, [
                {label: 'OK', value: 'ok'}
            ]);
            logEvent(`🌱 Harvested flowers for ${totalFood} food${bonusText}`);
        } else {
            await showChoiceDialog('Not enough storage for harvested food! ⚠️', [
                {label: 'OK', value: 'ok'}
            ]);
        }
        }
        else {await showChoiceDialog('Nothing to harvest! ⚠️', [
                {label: 'OK', value: 'ok'}
            ]);}

    }
}

// Helper function to check supply status
function getSupplyStatus() {
    const dailyFoodConsumption = gameState.group.length * (1 - getGroupBonus('food'));
    const dailyWaterConsumption = gameState.group.length;
    
    const daysOfFood = dailyFoodConsumption > 0 ? gameState.food / dailyFoodConsumption : Infinity;
    const daysOfWater = dailyWaterConsumption > 0 ? gameState.water / dailyWaterConsumption : Infinity;
    
    let warnings = [];
    
    if (daysOfFood <= 1) warnings.push('🍞 CRITICAL: Food will run out in less than 1 day!');
    else if (daysOfFood <= 3) warnings.push('🍞 WARNING: Food will run out in less than 3 days');
    else if (daysOfFood <= 7) warnings.push('🍞 Notice: Food will run out in less than 7 days');
    
    if (daysOfWater <= 1) warnings.push('💧 CRITICAL: Water will run out in less than 1 day!');
    else if (daysOfWater <= 3) warnings.push('💧 WARNING: Water will run out in less than 3 days');
    else if (daysOfWater <= 7) warnings.push('💧 Notice: Water will run out in less than 7 days');
    
    return { warnings, daysOfFood, daysOfWater };
}

// Function to get next consumption times
function getNextConsumptionTimes() {
    const currentGameDate = getCurrentGameDate();
    const currentHour = currentGameDate.getHours();
    const currentMinute = currentGameDate.getMinutes();
    
    let nextFood = null;
    let nextWater = null;
    let nextGold = null;
    
    // Find next food consumption time
    const foodTimes = [6, 12, 18];
    for (let hour of foodTimes) {
        if (hour > currentHour || (hour === currentHour && currentMinute < 60)) {
            nextFood = hour;
            break;
        }
    }
    if (!nextFood) nextFood = foodTimes[0] + 24; // Next day
    
    // Find next water consumption time
    const waterTimes = [7, 14, 20];
    for (let hour of waterTimes) {
        if (hour > currentHour || (hour === currentHour && currentMinute < 60)) {
            nextWater = hour;
            break;
        }
    }
    if (!nextWater) nextWater = waterTimes[0] + 24; // Next day
    
    // Find next gold consumption time
    if (currentHour < 12) {
        nextGold = 12;
    } else {
        nextGold = 36; // Next day at noon
    }
    
    return { nextFood, nextWater, nextGold, currentHour, currentMinute };
}

// Specialized dialog functions for status bar stats
export async function showGoldDialog() {
    // Calculate daily expenses based on the actual time system
    const dailyGoldExpense = gameState.group.length * 0.5;
    
    // Calculate role-based additional costs
    const roleExpenses = gameState.group.reduce((total, member) => {
        let roleCost = 0;
        if (member.role.includes('guide')) roleCost = 1.0;      // Guides cost more
        else if (member.role.includes('cook')) roleCost = 0.8;   // Cooks cost more
        else if (member.role.includes('guard')) roleCost = 1.2;  // Guards cost more
        else if (member.role.includes('medic')) roleCost = 1.5;  // Medics cost more
        else if (member.role.includes('navigator')) roleCost = 0.9; // Navigators cost more
        else roleCost = 0.3; // Base additional cost for other roles
        
        return total + roleCost;
    }, 0);
    
    const totalDailyExpense = dailyGoldExpense + roleExpenses;
    
    const message = `💰 **Gold Status**\n\n` +
                   `Current Gold: ${Math.floor(gameState.gold)} 🪙\n\n` +
                   `**Daily Party Expenses:**\n` +
                   `Base Cost: ${dailyGoldExpense.toFixed(1)} 🪙\n` +
                   `Role Bonuses: +${roleExpenses.toFixed(1)} 🪙\n` +
                   `Total Daily: ${totalDailyExpense.toFixed(1)} 🪙\n` +
                   `**Consumption Time:** Noon (12:00-13:00)\n\n` +
                   `**Party Members:** ${gameState.group.length}\n` +
                   `**Days Until Bankrupt:** ${Math.floor(gameState.gold / totalDailyExpense)} days`;
    
    return showChoiceDialog(message, [
        {label: '❌ Close', value: 'close'}
    ]);
}

export async function showInventoryDialog() {
    const maxStorage = getMaxStorage();
    
    // Calculate daily consumption rates (now consumed in specific meals/drinks)
    const dailyFoodConsumption = gameState.group.length * (1 - getGroupBonus('food'));
    const dailyWaterConsumption = gameState.group.length;
    const dailyGoldExpense = gameState.group.length * 0.5;
    
    // Calculate per-meal and per-drink amounts
    const foodPerMeal = dailyFoodConsumption / 3;
    const waterPerDrink = dailyWaterConsumption / 3;
    
    // Calculate how long supplies will last
    const daysOfFood = dailyFoodConsumption > 0 ? (gameState.food / dailyFoodConsumption).toFixed(1) : '∞';
    const daysOfWater = dailyWaterConsumption > 0 ? (gameState.water / dailyWaterConsumption).toFixed(1) : '∞';
    
    // Get next consumption times
    const { nextFood, nextWater, nextGold, currentHour, currentMinute } = getNextConsumptionTimes();
    
    const message = `📦 **Party Inventory**\n\n` +
                   `🍞 Food: ${gameState.food.toFixed(1)}/${maxStorage}\n` +
                   `🍞 Daily Total: -${dailyFoodConsumption.toFixed(1)}/day\n` +
                   `💧 Water: ${gameState.water.toFixed(1)}/${maxStorage}\n` +
                   `💧 Daily Total: -${dailyWaterConsumption.toFixed(1)}/day\n` +
                   `🪵 Wood: ${gameState.wood}\n` +
                   `⛺ Tents: ${gameState.tents}\n` +
                   `🧱 Building Materials: ${gameState.building_mats}\n` +
                   `🛒 Carts: ${gameState.carts}\n\n` +
                   `**Daily Expenses:**\n` +
                   `💰 Gold: -${dailyGoldExpense.toFixed(1)}/day (consumed at noon)\n` +
                   `💰 Next Gold Expense: ${nextGold > 23 ? (nextGold - 24) : nextGold}:00\n\n` +
                   `**Current Game Time:** ${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}\n` +
                   `**Storage Capacity:** ${maxStorage}`;
    
    return showChoiceDialog(message, [
        {label: '❌ Close', value: 'close'}
    ]);
}

export async function showDiscoveriesDialog() {
    const message = `🌟 **Discoveries & Kills**\n\n` +
                   `🔍 Discovery Points: ${Math.floor(gameState.discoverPoints)}\n` +
                   `⚔️ Kill Points: ${Math.floor(gameState.killPoints)}\n\n` +
                   `**Total Value:**\n` +
                   `Discoveries: ${Math.floor(gameState.discoverPoints)} 🪙\n` +
                   `Kills: ${Math.floor(gameState.killPoints)} 🪙\n` +
                   `Combined: ${Math.floor(gameState.discoverPoints + gameState.killPoints)} 🪙\n\n` +
                   `*Sell at cities to convert to gold*`;
    
    return showChoiceDialog(message, [
        {label: '❌ Close', value: 'close'}
    ]);
}

export async function showHealthGroupDialog() {
    let message = '';
    
    // Debug: Log the current state
    console.log('Current gameState.group:', gameState.group);
    console.log('Current gameState.groupBonus:', gameState.groupBonus);
    
    // Player character (first character) details
    const player = gameState.group[0] || {role: 'Explorer', bonus: {}};
    const playerBonus = player.bonus || {};
    
    let playerStats = `👤 **Player Character**\n` +
                      `Role: ${player.role}\n` +
                      `Health: ${Math.floor(gameState.health)}/100 ❤️‍🩹\n`;
    
    // Add bonus details
    if (Object.keys(playerBonus).length > 0) {
        playerStats += `Individual Bonuses:\n`;
        Object.entries(playerBonus).forEach(([bonus, value]) => {
            playerStats += `  ${bonus}: +${(value * 100).toFixed(0)}%\n`;
        });
    }

    message += playerStats;
    
    message += `\n📊 **Total Active Bonuses:**\n`;
    
    // Show combined bonuses (individual + group) for each type
    const bonusTypes = ['navigation', 'discovery', 'food', 'combat', 'resource', 'plant', 'interact', 'carry', 'health', 'view'];
    
    bonusTypes.forEach(bonusType => {
        const totalBonus = getGroupBonus(bonusType);
        if (totalBonus > 0) {
            let emoji = '';
            let description = '';
            
            // Debug: Show individual vs group breakdown
            const individualBonus = gameState.group.reduce((total, g) => total + (g.bonus[bonusType] || 0), 0);
            const groupBonus = gameState.groupBonus[bonusType] || 0;
            console.log(`${bonusType}: individual=${individualBonus}, group=${groupBonus}, total=${totalBonus}`);
            
            switch(bonusType) {
                case 'navigation': emoji = '🧭'; description = 'Faster movement'; break;
                case 'discovery': emoji = '🔍'; description = 'More discovery points'; break;
                case 'food': emoji = '🍞'; description = 'Slower food consumption'; break;
                case 'combat': emoji = '⚔️'; description = 'Better combat success'; break;
                case 'resource': emoji = '🪵'; description = 'More wood from flora'; break;
                case 'plant': emoji = '🌱'; description = 'Bonus food from flowers'; break;
                case 'interact': emoji = '🤝'; description = 'Better trade prices'; break;
                case 'carry': emoji = '📦'; description = 'Increased storage'; break;
                case 'health': emoji = '❤️'; description = 'Better healing'; break;
                case 'view': emoji = '👁️'; description = 'Increased view distance'; break;
            }
            
            message += `${emoji} **${bonusType.charAt(0).toUpperCase() + bonusType.slice(1)}**: +${(totalBonus * 100).toFixed(0)}% - ${description}\n`;
        }
    });
    
    if (bonusTypes.every(type => getGroupBonus(type) === 0)) {
        message += `No active bonuses. Hire more specialized roles to unlock bonuses!\n`;
    }
    
    // Show detailed breakdown for active bonuses
    const activeBonusTypes = bonusTypes.filter(type => getGroupBonus(type) > 0);
    if (activeBonusTypes.length > 0) {
        message += `\n📋 **Detailed Breakdown:**\n`;
        activeBonusTypes.forEach(bonusType => {
            const individualBonus = gameState.group.reduce((total, g) => total + (g.bonus[bonusType] || 0), 0);
            const groupBonus = gameState.groupBonus[bonusType] || 0;
            const totalBonus = getGroupBonus(bonusType);
            
            message += `${bonusType.charAt(0).toUpperCase() + bonusType.slice(1)}: `;
            message += `${(individualBonus * 100).toFixed(0)}% (individual) + `;
            message += `${(groupBonus * 100).toFixed(0)}% (group) = `;
            message += `${(totalBonus * 100).toFixed(0)}% (total)\n`;
        });
    }
    
    // Show explanation
    message += `\n📋 **How Bonuses Work:**\n`;
    message += `• Individual bonuses come from each character's role\n`;
    message += `• Group bonuses are additional bonuses from role combinations\n`;
    message += `• Total = Individual + Group bonuses\n`;

    // Other party members
    let otherMembers = '';
    if (gameState.group.length > 1) {
        otherMembers = `\n👥 **Other Party Members:**\n`;
        for (let i = 1; i < gameState.group.length; i++) {
            const member = gameState.group[i];
            const memberBonus = member.bonus || {};
            otherMembers += `\n${i}. ${member.role}`;
            if (Object.keys(memberBonus).length > 0) {
                otherMembers += `\n   Individual Bonuses:`;
                Object.entries(memberBonus).forEach(([bonus, value]) => {
                    otherMembers += ` ${bonus}+${(value * 100).toFixed(0)}%`;
                });
            }
        }
    } else {
        otherMembers = `\n👥 **No other party members**`;
    }
    
    message += otherMembers;
    
    
    return showChoiceDialog(message, [
        {label: '❌ Close', value: 'close'}
    ]);
}