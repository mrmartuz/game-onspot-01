import { gameState } from '../game_variables.js';
import { getTile } from '../rendering/tile.js';
import { getCheckTileInteractionDialog } from '../interactions.js';
import { getHandleCombatDialog } from '../interactions.js';
import { getMaxStorage } from '../utils.js';
import { getGroupBonus } from '../utils.js';
import { getShowChoiceDialog } from '../interactions.js';
import { logEvent } from '../time_system.js';


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
        ...(isFlora ? [{type: 'button', label: '🌱 Harvest flowers', value: '4'}] : []),
        {type: 'button', label: '🏗️ Build camp ⛺ (5 🪵)', value: '2'},
        {type: 'button', label: '🏗️ Build outpost 🏕️ (10 🧱, 10 🪵)', value: '3'},  
        {type: 'button', label: '❌ Close', value: 'close'}
    ]);
    if (choice === 'close') return;
    if (choice === '2' || choice === '3') {
        let costMats = choice === '2' ? 0 : 10;
        let costWood = choice === '2' ? 5 : 10;
        let type = choice === '2' ? 'camp' : 'outpost';
        if (gameState.building_mats >= costMats && gameState.wood >= costWood) {
            let dirStr = await getShowChoiceDialog('You are building a ' + (choice === '2' ? '⛺camp' : '🏕️outpost') +'\nDo you want to build it here?', [
                {type: 'button', label: '🏗️ Confirm', value: 'C'},
                {type: 'button', label: '❌ Close', value: 'close'}
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
                        {type: 'button', label: 'OK', value: 'ok'}
                    ]);
                    logEvent(`🏗️ Built ${type} at (${bx},${by})`);
                } else {
                    await getShowChoiceDialog('Cannot build there.There is something already there 🚫', [
                        {type: 'button', label: '❌ Close', value: 'close'}
                    ]);
                }
            } else {
                await getShowChoiceDialog('Invalid direction. ❓', [
                    {type: 'button', label: '❌ Close', value: 'close'}
                ]);
            }
        } else {
            await getShowChoiceDialog('Not enough materials! ⚠️', [
                {type: 'button', label: '❌ Close', value: 'close'}
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
                {type: 'button', label: 'OK', value: 'ok'}
            ]);
            logEvent(`🌱 Harvested flowers for ${totalFood} food${bonusText}`);
        } else {
            await getShowChoiceDialog('Not enough storage for harvested food! ⚠️', [
                {type: 'button', label: 'OK', value: 'ok'}
            ]);
        }
        }
        else {await getShowChoiceDialog('Nothing to harvest! ⚠️', [
                {type: 'button', label: 'OK', value: 'ok'}
            ]);}

    }
}