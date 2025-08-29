import { gameState } from '../game_variables.js';
import { getShowChoiceDialog } from '../interactions.js';
import { getGroupBonus } from '../utils.js';
import { updateStatus } from '../rendering.js';
import { logEvent } from '../time_system.js';
import { getTile } from '../utils.js';


export async function handleAnimal(x, y) {
    let tile = getTile(x, y);
    if (tile.entity === 'animal' && gameState.food > 0) {
        let hunting = true;
        while (hunting && gameState.food > 0) {
            gameState.food -= 1;
            let r = Math.floor(Math.random() * 100 + getGroupBonus('combat'));
            if (r > 80) {
                let killPoints = 10 + getGroupBonus('food');
                gameState.killPoints += killPoints;
                let food = 1 + getGroupBonus('food');
                gameState.food += food;
                logEvent(`🪙🏹 You killed an animal and gained 10 kill point!`);
                let choice = await getShowChoiceDialog(`🪙🏹 You killed an animal gained ${killPoints} kill points and ${food} food!`, [
                    {label: '🏹 Hunt again', value: '7'},
                    {label: 'Leave', value: 'leave'}
                ]);
                if (choice === '7') {
                    continue; // Continue hunting
                } else {
                    hunting = false; // Stop hunting
                }
            } else if (r > 50) {
                logEvent(`You failed to kill an animal.`);
                let choice = await getShowChoiceDialog(`You failed to kill an animal.`, [
                    {label: '🏹 Hunt again', value: '7'},
                    {label: 'Leave', value: 'leave'}
                ]);
                if (choice === '7') {
                    continue; // Continue hunting
                } else {
                    hunting = false; // Stop hunting
                }
            } else if (r > 20) {
                let health = Math.floor(Math.random() * 5);
                gameState.health -= health;
                logEvent(`You failed to kill an animal and injured yourself. You lost ${health} health.`);
                let choice = await getShowChoiceDialog(`You failed to kill an animal and injured yourself. You lost ${health} health.`, [
                    {label: '🏹 Hunt again', value: '7'},
                    {label: 'Leave', value: 'leave'}
                ]);
                if (choice === '7') {
                    continue; // Continue hunting
                } else {
                    hunting = false; // Stop hunting
                }
            } else if (r > 10) {
                let health = Math.floor(Math.random() * 20 + 5);
                gameState.health -= health;
                logEvent(`You failed to kill an animal, gravely injured yourself. You lost ${health} health.`);
                let choice = await getShowChoiceDialog(`You failed to kill an animal and gravely injured yourself. You lost ${health} health.`, [
                    {label: '🏹 Hunt again', value: '7'},
                    {label: 'Leave', value: 'leave'}
                ]);
                if (choice === '7') {
                    continue; // Continue hunting
                } else {
                    hunting = false; // Stop hunting
                }
            } else {
                gameState.group.splice(Math.floor(Math.random()*gameState.group.length), 1);   //TODO REMOVE A CHARACTER FROM THE GROUP
                let health = Math.floor(Math.random() * 20 + 5);
                gameState.health -= health;
                logEvent(`You failed to kill an animal, gravely injured yourself and lost one of your men. You lost ${health} health.`);
                let choice = await getShowChoiceDialog(`You failed to kill an animal, gravely injured yourself and lost one of your men. You lost ${health} health.`, [
                    {label: '🏹 Hunt again', value: '7'},
                    {label: 'Leave', value: 'leave'}
                ]);
                if (choice === '7') {
                    continue; // Continue hunting
                } else {
                    hunting = false; // Stop hunting
                }
            }
            updateStatus();
        }
    }
}

