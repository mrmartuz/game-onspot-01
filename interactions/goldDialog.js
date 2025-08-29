import { gameState } from '../game_variables.js';
import { getShowChoiceDialog } from '../interactions.js';


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