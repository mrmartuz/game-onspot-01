import { gameState } from '../game_variables.js';
import { getShowChoiceDialog, getHandleAnimalDialog } from '../interactions.js';
import { getGroupBonus } from '../utils.js';
import { updateStatus } from '../rendering.js';
import { logEvent } from '../time_system.js';
import { getMaxStorage } from '../utils.js';
import { getEnhancedBonusForRole } from '../utils.js';
import { getBonusForRole } from '../utils.js';  
import { updateGroupBonus } from '../utils.js';

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
        gameState.gold -= 2
        updateStatus();
        
        let bonusText = bonusHealing > 0 ? ` (+${bonusHealing} bonus)` : '';
        await getShowChoiceDialog(`Rested. 😴 Healed ${totalHealing} health${bonusText}`, [
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
            let t = await getShowChoiceDialog('Trade options:', [
                {type: 'button', label: `📥 Buy food 🍞 (${Math.floor(10 * (1 - buyDiscount))} for 10g)`, value: '1'},
                {type: 'button', label: `📥 Sell food 🍞 (10 for ${Math.floor(3 * (1 + sellBonus))}g)`, value: '2'},
                {type: 'button', label: `📥 Buy water 💧 (${Math.floor(10 * (1 - buyDiscount))} for 10g)`, value: '3'},
                {type: 'button', label: `📥 Sell water 💧 (10 for ${Math.floor(3 * (1 + sellBonus))}g)`, value: '4'},
                {type: 'button', label: `📤 Sell wood 🪵 (5 for ${Math.floor(10 * (1 + sellBonus))}g)`, value: '5'},
                {type: 'button', label: '📥 Buy cart 🛒 (100g for 1)', value: '6'},
                {type: 'button', label: '❌ Close', value: 'close'}
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
                    await getShowChoiceDialog('Not enough gold or storage! ⚠️', [
                        {type: 'button', label: 'OK', value: 'ok'}
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
                    await getShowChoiceDialog('Not enough food! ⚠️', [
                        {type: 'button', label: 'OK', value: 'ok'}
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
                    await getShowChoiceDialog('Not enough gold or storage! ⚠️', [
                        {type: 'button', label: 'OK', value: 'ok'}
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
                    await getShowChoiceDialog('Not enough water! ⚠️', [
                        {type: 'button', label: 'OK', value: 'ok'}
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
                    await getShowChoiceDialog('Not enough wood! ⚠️', [
                        {type: 'button', label: 'OK', value: 'ok'}
                    ]);
                }
            } else if (t === '6') {
                if (gameState.gold >= 100) {
                    gameState.carts += 1;
                    gameState.gold -= 100;
                    tradeDesc = '📥 Bought cart 🛒 for 100g';
                } else {
                    await getShowChoiceDialog('Not enough gold! ⚠️', [
                        {type: 'button', label: 'OK', value: 'ok'}
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
                
                // 15% chance for enhanced personal bonus
                let hasEnhancedBonus = Math.random() < 0.15;
                let enhancedBonus = null;
                let upgradeCost = 0;
                
                if (hasEnhancedBonus) {
                    enhancedBonus = getEnhancedBonusForRole(r);
                    upgradeCost = Math.floor(baseCost * 0.8); // 80% of base cost for upgrade
                }
                
                let label = `${i+1}: ${r} for ${actualCost}g`;
                if (hasEnhancedBonus) {
                    label += ` ⭐ (Enhanced: +${enhancedBonus.value} ${enhancedBonus.type})`;
                }
                
                hires.push({
                    label: label, 
                    value: (i+1).toString(), 
                    baseCost, 
                    actualCost,
                    hasEnhancedBonus,
                    enhancedBonus,
                    upgradeCost
                });
            }
            hires.push({type: 'button', label: '❌ Close', value: 'close'});
            
            let c = await getShowChoiceDialog('Hire options:', hires);
            if (c === 'close') {
                hiring = false;
                continue;
            }
            
            if (c && c !== 'close' && !isNaN(parseInt(c)) && parseInt(c) >= 1 && parseInt(c) <= number_of_hires) {
                let idx = parseInt(c) - 1;
                let hire = hires[idx];
                let role = hire.label.split(': ')[1].split(' for ')[0];
                let baseCost = hire.baseCost;
                let actualCost = hire.actualCost;
                
                if (hire.hasEnhancedBonus) {
                    // Show upgrade choice dialog
                    let upgradeChoice = await getShowChoiceDialog(
                        `🌟 **Enhanced Character Available!** 🌟\n\n` +
                        `Role: ${role}\n` +
                        `Enhanced Bonus: +${hire.enhancedBonus.value} ${hire.enhancedBonus.type}\n` +
                        `Speciality: ${hire.enhancedBonus.description}\n\n` +
                        `**Options:**\n` +
                        `1. Hire Basic: ${actualCost}g\n` +
                        `2. Hire Enhanced: ${actualCost + hire.upgradeCost}g (+${hire.upgradeCost}g upgrade)\n` +
                        `3. Cancel`,
                        [
                            {type: 'button', label: `Basic Hire (${actualCost}g)`, value: 'basic'},
                            {type: 'button', label: `Enhanced Hire (${actualCost + hire.upgradeCost}g)`, value: 'enhanced'},
                            {type: 'button', label: '❌ Cancel', value: 'cancel'}
                        ]
                    );
                    
                    if (upgradeChoice === 'cancel') {
                        continue;
                    }
                    
                    if (upgradeChoice === 'enhanced') {
                        actualCost += hire.upgradeCost;
                        if (gameState.gold >= actualCost) {
                            let finalBonus = {...getBonusForRole(role)};
                            finalBonus[hire.enhancedBonus.type] = (finalBonus[hire.enhancedBonus.type] || 0) + hire.enhancedBonus.value;
                            
                            gameState.group.push({role, speciality: hire.enhancedBonus.description, bonus: finalBonus});
                            gameState.gold -= actualCost;
                            updateGroupBonus();
                            
                            let discountText = hireDiscount > 0 ? ` (${Math.floor(hireDiscount * 100)}% discount applied)` : '';
                            await getShowChoiceDialog(`🌟 Hired Enhanced ${role}! 👏\nEnhanced Bonus: +${hire.enhancedBonus.value} ${hire.enhancedBonus.type}\nSpeciality: ${hire.enhancedBonus.description}${discountText}`, [
                                {type: 'button', label: 'OK', value: 'ok'}
                            ]);
                            logEvent(`🌟 Hired Enhanced ${role} for ${actualCost}g${discountText} (Enhanced: +${hire.enhancedBonus.value} ${hire.enhancedBonus.type} - ${hire.enhancedBonus.description})`);
                        } else {
                            await getShowChoiceDialog('Not enough gold for enhanced hire! ⚠️', [
                                {type: 'button', label: 'OK', value: 'ok'}
                            ]);
                            continue;
                        }
                    } else {
                        // Basic hire
                        if (gameState.gold >= actualCost) {
                            gameState.group.push({role, bonus: getBonusForRole(role)});
                            gameState.gold -= actualCost;
                            updateGroupBonus();
                            
                            let discountText = hireDiscount > 0 ? ` (${Math.floor(hireDiscount * 100)}% discount applied)` : '';
                            await getShowChoiceDialog(`Hired ${role}! 👏${discountText}`, [
                                {type: 'button', label: 'OK', value: 'ok'}
                            ]);
                            logEvent(`🧍🏻 Hired ${role} for ${actualCost}g${discountText}`);
                        } else {
                            await getShowChoiceDialog('Not enough gold! ⚠️', [
                                {type: 'button', label: 'OK', value: 'ok'}
                            ]);
                        }
                    }
                } else {
                    // Regular hire without enhanced bonus
                    if (gameState.gold >= actualCost) {
                        gameState.group.push({role, bonus: getBonusForRole(role)});
                        gameState.gold -= actualCost;
                        updateGroupBonus();
                        
                        let discountText = hireDiscount > 0 ? ` (${Math.floor(hireDiscount * 100)}% discount applied)` : '';
                        await getShowChoiceDialog(`Hired ${role}! 👏${discountText}`, [
                            {type: 'button', label: 'OK', value: 'ok'}
                        ]);
                        logEvent(`🧍🏻 Hired ${role} for ${actualCost}g${discountText}`);
                    } else {
                        await getShowChoiceDialog('Not enough gold! ⚠️', [
                            {type: 'button', label: 'OK', value: 'ok'}
                        ]);
                    }
                }
            }
        }
    } else if (choice === '5') { // Sell discoveries
        if(gameState.discoverPoints > 0){
        gameState.gold += gameState.discoverPoints;
        logEvent(`🪙 Sold discoveries for ${gameState.discoverPoints}g`);
        gameState.discoverPoints = 0;
        updateStatus();
        await getShowChoiceDialog('Sold discoveries! 🪙', [
            {type: 'button', label: 'OK', value: 'ok'}
        ]);
    } else {
        await getShowChoiceDialog('No discoveries to sell! You Scum! Go discover some locations! ⚠️', [
            {type: 'button', label: 'OK', value: 'ok'}
        ]);
    }
    } else if (choice === '6') { // Sell hunts
        if(gameState.killPoints > 0){
        gameState.gold += gameState.killPoints;
        logEvent(`🪙 Sold hunts for ${gameState.killPoints}g`);
        gameState.killPoints = 0;
        updateStatus();
        await getShowChoiceDialog('Sold hunts! 🪙', [
            {type: 'button', label: 'OK', value: 'ok'}
        ]);
    } else {
        await getShowChoiceDialog('No hunts to sell! Go hunt some monsters or get killed or get a job! ⚠️', [
            {type: 'button', label: 'OK', value: 'ok'}
        ]);
    } 
    } else if (choice === '7') {
        await getHandleAnimalDialog(gameState.px, gameState.py);
    }
}
