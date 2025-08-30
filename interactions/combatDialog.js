import { gameState } from '../game_variables.js';
import { showChoiceDialog } from './showDialog.js';
import { getGroupBonus } from '../utils.js';
import { updateStatus } from '../rendering.js';
import { logEvent } from '../time_system.js';
import { checkDeath } from '../utils.js';
import { getTile } from '../rendering/tile.js';


export async function handleCombat(ex, ey, isOnTile = false) {
    let tile = getTile(ex, ey);
    let entity = tile.entity;
    let input = await showChoiceDialog(`Hostile ${entity} at (${ex},${ey})!`, [
        {type: 'button', label: '⚔️ Attack', value: '1'},
        {type: 'button', label: '🌬️ Flee', value: '2'}
    ]);
    if (input === '2') {
        if (isOnTile) {
            gameState.px = gameState.prevx;
            gameState.py = gameState.prevy;
            await showChoiceDialog('Fled back. 😵‍💫', [
                {type: 'button', label: 'OK', value: 'ok'}
            ]);
        } else {
            await showChoiceDialog('Fled, staying put. 😅', [
                {type: 'button', label: 'OK', value: 'ok'}
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
            {type: 'button', label: 'OK', value: 'ok'}
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
            {type: 'button', label: 'OK', value: 'ok'}
        ]);
        gameState.health -= finalDamage;
        updateStatus();
        logEvent(`🤕 Defeated by ${entity} at (${ex},${ey})`);
        let death = await checkDeath();
        if(death === 'health'){
            await showChoiceDialog('You died fighting! ☠️', [
            { type: 'button', label: '🔄 Restart Game', value: 'restart' }
            ]);
            location.reload();
        } else if(death === 'gold'){
            await showChoiceDialog('You paid your debt with your life! ☠️', [
                { type: 'button', label: '🔄 Restart Game', value: 'restart' }
            ]);
            location.reload();
        }
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