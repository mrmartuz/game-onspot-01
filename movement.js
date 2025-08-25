import { px, py, cooldown, moving, moveStartTime, moveDuration, moveDx, moveDy, viewDist, food, water, prevx, prevy, visited } from './game_variables.js';
import { getGroupBonus, getTile, getMaxStorage } from './utils.js';
import { group } from './game_variables.js';

export function move(dx, dy) {
    if (cooldown) return;
    cooldown = true;
    moving = true;
    moveStartTime = performance.now();
    let tx = px + dx;
    let ty = py + dy;
    let tile = getTile(tx, ty);
    let navigationBonus = getGroupBonus('navigation');
    group.forEach(g => {
        if (g.role === 'navigator' && tile.terrain === 'dirt' && tile.flora < 6) {
            navigationBonus += 0.2;
        } else if (g.role === 'native-guide' && tile.flora >= 6) {
            navigationBonus += 0.2;
        } else if (g.role === 'explorer' && tile.location !== 'none' && tile.flora < 3) {
            navigationBonus += 0.2;
        }
    });
    let baseDuration = (400 + tile.inclination * 80 + tile.flora * 40) * (1 - navigationBonus);
    let loadFactor = (food + water) / getMaxStorage();
    moveDuration = baseDuration * (1 + loadFactor * 0.5);
    moveDx = dx;
    moveDy = dy;
}

export function revealAround() {
    let currentViewDist = viewDist + Math.floor(getGroupBonus('view'));
    for (let ddx = -currentViewDist; ddx <= currentViewDist; ddx++) {
        for (let ddy = -currentViewDist; ddy <= currentViewDist; ddy++) {
            if (Math.sqrt(ddx * ddx + ddy * ddy) <= currentViewDist) {
                visited.add(`${px + ddx},${py + ddy}`);
            }
        }
    }
}

export function updateResources(tile) {
    food += tile.flora * 0.1 * (1 + getGroupBonus('plant'));
    food = Math.min(food, getMaxStorage());
    if (Math.random() < 0.05 * (1 + getGroupBonus('resource'))) wood += 1;
    water = Math.min(water, getMaxStorage());
}