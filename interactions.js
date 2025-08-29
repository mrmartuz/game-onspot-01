import { gameState } from './game_variables.js';
import { showChoiceDialog } from './interactions/showDialog.js';
import { handleCombat, checkAdjacentMonsters } from './interactions/combatDialog.js';
import { checkTileInteraction } from './interactions/tileInteraction.js';
import { handleChoice } from './interactions/handleChoice.js';
import { handleAnimal } from './interactions/handleAnimalDialog.js';
import { showMenu } from './interactions/showMenu.js';
import { showInventoryDialog } from './interactions/inventoryDialog.js';
import { showGoldDialog } from './interactions/goldDialog.js';
import { showDeathDialog } from './interactions/deathDialog.js';
import { showHealthGroupDialog } from './interactions/healthGroupDialog.js';

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

export async function getShowMenuDialog(){
    return showMenu();
}

export async function getShowInventoryDialog(){
    return showInventoryDialog();
}

export async function getShowGoldDialog(){
    return showGoldDialog();
}

export async function getShowDeathDialog(death){
    return showDeathDialog(death);
}

export async function getShowHealthGroupDialog(){
    return showHealthGroupDialog();
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


export async function showEventsDialog() {
    const list = gameState.events.map(ev => `${ev.date}: ${ev.desc}`).join('\n');
    await getShowChoiceDialog(`The events of your journey so far: 📜\n\n${list}` || 'No events yet. 📜', [
        {label: 'OK', value: 'ok'}
    ]);
}