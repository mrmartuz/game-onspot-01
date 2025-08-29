import { gameState } from '../game_variables.js';
import { getShowChoiceDialog } from '../interactions.js';

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
