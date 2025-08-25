import { game_start_real, game_start_date, acceleration, last_consume_time, events } from './game_variables.js';
import { food, water, gold, tents, group } from './game_variables.js';
import { getGroupBonus } from './utils.js';

export function getCurrentGameDate() {
    const elapsed_real_ms = Date.now() - game_start_real;
    const elapsed_game_ms = elapsed_real_ms * acceleration;
    return new Date(game_start_date.getTime() + elapsed_game_ms);
}

export function logEvent(desc) {
    events.push({date: getCurrentGameDate().toLocaleString(), desc});
}

export function timeConsumption() {
    let now = Date.now();
    let delta_real = now - last_consume_time;
    let delta_game = delta_real * acceleration;
    let days_fraction = delta_game / (86400 * 1000);
    food -= days_fraction * group.length * (1 - getGroupBonus('food'));
    water -= days_fraction * group.length;
    gold -= days_fraction * group.length * 0.5;
    if (Math.random() < 0.05 * days_fraction) {
        tents = Math.max(0, tents - 1);
    }
    last_consume_time = now;
}