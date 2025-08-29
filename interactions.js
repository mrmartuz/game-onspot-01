import { gameState } from './game_variables.js';
import { getGroupBonus, getTile, getMaxStorage, getBonusForRole, getEnhancedBonusForRole, updateGroupBonus, checkDeath, getNumCarriers } from './utils.js';
import { logEvent, getCurrentGameDate } from './time_system.js';
import { updateStatus } from './rendering.js';
import { showChoiceDialog } from './interactions/showDialog.js';
import { handleCombat, checkAdjacentMonsters } from './interactions/combatDialog.js';
import { checkTileInteraction } from './interactions/tileInteraction.js';
import { handleChoice } from './interactions/handleChoice.js';
import { handleAnimal } from './interactions/handleAnimalDialog.js';

export async function getShowChoiceDialog(message, buttons) {
    return showChoiceDialog(message, buttons);
}

export async function getHandleCombatDialog(ex, ey, isOnTile = false){
    return handleCombat(ex, ey, isOnTile);
}

export async function getCheckAdjacentMonstersDialog(){
    return checkAdjacentMonsters();
}

export async function getCheckTileInteractionDialog(tile){
    return checkTileInteraction(tile);
}

export async function getHandleChoiceDialog(choice, tile){
    return handleChoice(choice, tile);
}

export async function getHandleAnimalDialog(x, y){
    return handleAnimal(x, y);
}





export async function showMenu() {
    // Check if player is on a tile with location or entity
    let currentTile = getTile(gameState.px, gameState.py);
    if (currentTile.location !== 'none' || currentTile.entity !== 'none'){
        await getCheckTileInteractionDialog(currentTile);
        return;
    }

    let isFlora = false;
    
    // If there's a combat entity, handle combat first
    if (['monster', 'beast'].includes(currentTile.entity)) {
        await getHandleCombatDialog(gameState.px, gameState.py, true);
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
    let choice = await getShowChoiceDialog(msg, [
        ...(isFlora ? [{label: '🌱 Harvest flowers', value: '4'}] : []),
        {label: '🏗️ Build camp ⛺ (5 🪵)', value: '2'},
        {label: '🏗️ Build outpost 🏕️ (10 🧱, 10 🪵)', value: '3'},  
        {label: '❌ Close', value: 'close'}
    ]);
    if (choice === 'close') return;
    if (choice === '2' || choice === '3') {
        let costMats = choice === '2' ? 0 : 10;
        let costWood = choice === '2' ? 5 : 10;
        let type = choice === '2' ? 'camp' : 'outpost';
        if (gameState.building_mats >= costMats && gameState.wood >= costWood) {
            let dirStr = await getShowChoiceDialog('You are building a ' + (choice === '2' ? '⛺camp' : '🏕️outpost') +'\nDo you want to build it here?', [
                {label: '🏗️ Confirm', value: 'C'},
                {label: '❌ Close', value: 'close'}
            ]);
            if (dirStr === 'close') return;
            const dmap = {
                'C': {dx:0,dy:0}
            };
            let d = dmap[dirStr];
            if (d) {
                let bx = gameState.px + d.dx;
                let by = gameState.py + d.dy;
                let btile = getTile(bx, by);
                if (btile.location === 'none' && btile.entity === 'none') {
                    gameState.changed.push({x: bx, y: by, type});
                    // Mark the tile as visited so the change is applied
                    const key = `${bx},${by}`;
                    gameState.visited.set(key, getTile(bx, by));
                    let tile = getTile(bx, by);
                    tile.location = type;
                    gameState.visited.set(key, tile);
                    gameState.building_mats -= costMats;
                    gameState.wood -= costWood;
                    await getShowChoiceDialog(`Built ${type}! 🏗️`, [
                        {label: 'OK', value: 'ok'}
                    ]);
                    logEvent(`🏗️ Built ${type} at (${bx},${by})`);
                } else {
                    await getShowChoiceDialog('Cannot build there.There is something already there 🚫', [
                        {label: '❌ Close', value: 'close'}
                    ]);
                }
            } else {
                await getShowChoiceDialog('Invalid direction. ❓', [
                    {label: '❌ Close', value: 'close'}
                ]);
            }
        } else {
            await getShowChoiceDialog('Not enough materials! ⚠️', [
                {label: '❌ Close', value: 'close'}
            ]);
        }
    }
    if (choice === '4') {
        // Apply plant bonus for better harvest yields
        let plantBonus = getGroupBonus('plant');
        let baseFood = Math.floor((Math.random() * 1.2))+ 0.1;
        let bonusFood = Math.floor(baseFood * plantBonus);
        let totalFood = baseFood + bonusFood + plantBonus;
        let max_storage = getMaxStorage();
        if(totalFood > 0){
            if (gameState.food + totalFood <= max_storage) {
            gameState.food += totalFood;
            updateStatus();
            let bonusText = bonusFood > 0 ? ` (+${bonusFood} bonus)` : '';
            await getShowChoiceDialog(`Harvested flowers! 🌱 Gained ${totalFood} food${bonusText}`, [
                {label: 'OK', value: 'ok'}
            ]);
            logEvent(`🌱 Harvested flowers for ${totalFood} food${bonusText}`);
        } else {
            await getShowChoiceDialog('Not enough storage for harvested food! ⚠️', [
                {label: 'OK', value: 'ok'}
            ]);
        }
        }
        else {await getShowChoiceDialog('Nothing to harvest! ⚠️', [
                {label: 'OK', value: 'ok'}
            ]);}

    }
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
        const cleanRole = member.role.replace(/[^\w-]/g, '');
        if (cleanRole.includes('guide')) roleCost = 1.0;      // Guides cost more
        else if (cleanRole.includes('cook')) roleCost = 0.8;   // Cooks cost more
        else if (cleanRole.includes('guard')) roleCost = 1.2;  // Guards cost more
        else if (cleanRole.includes('medic')) roleCost = 1.5;  // Medics cost more
        else if (cleanRole.includes('navigator')) roleCost = 0.9; // Navigators cost more
        else roleCost = 0.3; // Base additional cost for other roles
        
        return total + roleCost;
    }, 0);
    
    const totalDailyExpense = dailyGoldExpense + roleExpenses;
    
    const message = `💰 **Gold Status**\n\n` +
                   `Current Gold: ${Math.floor(gameState.gold)} 🪙\n\n` +
                   `**Daily Party Expenses:**\n` +
                   `Base Cost: -${dailyGoldExpense.toFixed(1)} 🪙\n` +
                   `Role Costs: -${roleExpenses.toFixed(1)} 🪙\n` +
                   `Total Daily: -${totalDailyExpense.toFixed(1)} 🪙\n` +
                   `**Consumption Time:** Noon (12:00-13:00)\n\n` +
                   `**Party Members:** ${gameState.group.length}\n` +
                   `**Days Until Bankrupt:** ${Math.floor(gameState.gold / totalDailyExpense)} days`;
    
    return getShowChoiceDialog(message, [
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
    
    const message = `📦 **Party Inventory**\n` +
                   `🛒: ${gameState.carts}*100 + 📦: ${getNumCarriers()}*24 + 👥: ${gameState.group.length - getNumCarriers() - gameState.carts}*10\n`  + `📦 Max Storage: ${maxStorage}\n\n` +
                   `🪙 Gold: ${gameState.gold}\n` +
                   `🍞 Food: ${gameState.food.toFixed(1)} -${dailyFoodConsumption.toFixed(1)}/day\n` +
                   `💧 Water: ${gameState.water.toFixed(1)} -${dailyWaterConsumption.toFixed(1)}/day\n` +
                   `🪵 Wood: ${gameState.wood}\n` +
                   `⛺ Tents: ${gameState.tents}\n` +
                   `🧱 Building Materials: ${gameState.building_mats}\n` +
                   `**Daily Expenses:**\n` +
                   `💰 Gold: -${dailyGoldExpense.toFixed(1)}/day (consumed at noon)\n` +
                   `💰 Next Gold Expense: ${nextGold > 23 ? (nextGold - 24) : nextGold}:00\n\n` +
                   `**Current Game Time:** ${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}\n` +
                   `**Storage Capacity:** ${maxStorage}`;
    
    return getShowChoiceDialog(message, [
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
    
    return getShowChoiceDialog(message, [
        {label: '❌ Close', value: 'close'}
    ]);
}

export async function showHealthGroupDialog() {
    let message = '';
    let emoji = {
        'native-guide': '🧭',
        'cook': '🍞',
        'guard': '⚔️',
        'geologist': '🪵',
        'biologist': '🌱',
        'translator': '🤝',
        'carrier': '📦',
        'medic': '❤️',
        'navigator': '👁️',
        'explorer': '🔍'
    };
    
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
            playerStats += `  ${bonus}: +${value.toFixed(1)}\n`;
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
            const individualBonus = gameState.group.reduce((total, g) => {
                const memberBonus = g.bonus || {};
                return total + (memberBonus[bonusType] || 0);
            }, 0);
            const groupBonus = gameState.groupBonus[bonusType] || 0;
            
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
            
            message += `${emoji} **${bonusType.charAt(0).toUpperCase() + bonusType.slice(1)}**: +${totalBonus.toFixed(1)} - ${description}\n`;
        }
    });
    
    // Other party members
    let otherMembers = '';
if (gameState.group.length > 1) {
    otherMembers = `\n👥 **Other Party Members:**\n`;
    for (let i = 1; i < gameState.group.length; i++) {
        const member = gameState.group[i];
        console.log(member);
        const memberBonus = member.bonus || {};
        const occupation = member.speciality ? member.speciality.toLowerCase() : member.role.toLowerCase();
        otherMembers += `\n${i}. ${occupation}${member.speciality ? emoji[member.role.replace(/[^\w-]/g, '')] : ''}:`;
        if (Object.keys(memberBonus).length > 0) {
            Object.entries(memberBonus).forEach(([bonus, value]) => {
                otherMembers += ` ${bonus}+${value.toFixed(1)}`;
            });
        }
    }
}
    
     else {
        otherMembers = `👥 **No other party members**`;
    }
    
    message += otherMembers;
    
    
    const choice = await getShowChoiceDialog(message, [
        {label:'Detailed Breakdown', value: 'detailed-breakdown'},
        {label: '❌ Close', value: 'close'}
    ]);

    if (choice === 'detailed-breakdown') {
        return showDetailedBreakdownDialog();
    }
}

export async function showDetailedBreakdownDialog() {
    let message = '';
    message += `\n📋 How Bonuses Work:\n`;
    message += `• Individual bonuses come from each character's role\n`;
    message += `• Group bonuses are additional bonuses from role combinations\n`;
    message += `• Total = Individual + Group bonuses\n\n`;
    let bonusTypes = ['navigation', 'discovery', 'food', 'combat', 'resource', 'plant', 'interact', 'carry', 'health', 'view'];
    let emoji = {
        'navigation': '🧭',
        'discovery': '🔍',
        'food': '🍞',
        'combat': '⚔️',
        'resource': '🪵',
        'plant': '🌱',
        'interact': '🤝',
        'carry': '📦',
        'health': '❤️',
        'view': '👁️'
    };
    if (bonusTypes.every(type => getGroupBonus(type) === 0)) {
        message += `No active bonuses. Hire more specialized roles to unlock bonuses!\n`;
    }
    
    // Show detailed breakdown for active bonuses
    const activeBonusTypes = bonusTypes.filter(type => getGroupBonus(type) > 0);
    if (activeBonusTypes.length > 0) {
        activeBonusTypes.forEach(bonusType => {
            const individualBonus = gameState.group.reduce((total, g) => {
                const memberBonus = g.bonus || {};
                return total + (memberBonus[bonusType] || 0);
            }, 0);
            const groupBonus = gameState.groupBonus[bonusType] || 0;
            const totalBonus = getGroupBonus(bonusType);
            
            message += `${emoji[bonusType]} ${bonusType.charAt(0).toUpperCase() + bonusType.slice(1)}: `;
            message += `${individualBonus.toFixed(1)} (individual) + `;
            message += `${groupBonus.toFixed(1)} (group) = `;
            message += `+${totalBonus.toFixed(1)} (total)\n`;
        });
    }
    let enhancedBonuses = getEnhancedBonusForRole(gameState.group[0].role);
    if (enhancedBonuses.length > 0) {
        message += `\nEnhanced Bonuses:\n`;
        enhancedBonuses.forEach(bonus => {
            message += `${emoji[bonus.type]} ${bonus.type.charAt(0).toUpperCase() + bonus.type.slice(1)}: +${bonus.value} ${bonus.description}\n`;
        });
    }
    
    return getShowChoiceDialog(message, [
        {label: '❌ Close', value: 'close'}
    ]);
}

export async function showEventsDialog() {
    const list = gameState.events.map(ev => `${ev.date}: ${ev.desc}`).join('\n');
    await getShowChoiceDialog(`The events of your journey so far: 📜\n\n${list}` || 'No events yet. 📜', [
        {label: 'OK', value: 'ok'}
    ]);
}