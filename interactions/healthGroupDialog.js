import { gameState } from '../game_variables.js';
import { getGroupBonus } from '../utils.js';
import { getEnhancedBonusForRole } from '../utils.js';
import { getShowChoiceDialog } from '../interactions.js';

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
        {type: 'button', label:'Detailed Breakdown', value: 'detailed-breakdown'},
        {type: 'button', label: '❌ Close', value: 'close'}
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
        {type: 'button', label: '❌ Close', value: 'close'}
    ]);
}