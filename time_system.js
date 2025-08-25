import { game_start_real, game_start_date, acceleration } from './game_variables.js';
import { gameState } from './game_variables.js';
import { getGroupBonus } from './utils.js';

export function getCurrentGameDate() {
    const elapsed_real_ms = Date.now() - game_start_real;
    const elapsed_game_ms = elapsed_real_ms * acceleration;
    return new Date(game_start_date.getTime() + elapsed_game_ms);
}

export function logEvent(desc) {
    gameState.events.push({date: getCurrentGameDate().toLocaleString(), desc});
}

export function timeConsumption() {
    let now = Date.now();
    let delta_real = now - gameState.last_consume_time;
    let delta_game = delta_real * acceleration;
    let days_fraction = delta_game / (86400 * 1000);
    gameState.food -= days_fraction * gameState.group.length * (1 - getGroupBonus('food'));
    gameState.water -= days_fraction * gameState.group.length;
    gameState.gold -= days_fraction * gameState.group.length * 0.5;
    if (Math.random() < 0.05 * days_fraction) {
        gameState.tents = Math.max(0, gameState.tents - 1);
    }
    gameState.last_consume_time = now;
}