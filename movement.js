import { gameState } from './game_variables.js';
import { getGroupBonus, getTile, getMaxStorage } from './utils.js';

export function move(dx, dy) {
    if (gameState.cooldown) return;
    gameState.cooldown = true;
    gameState.moving = true;
    gameState.moveStartTime = performance.now();
    let tx = gameState.px + dx;
    let ty = gameState.py + dy;
    let tile = getTile(tx, ty);
    let navigationBonus = getGroupBonus('navigation');
    gameState.group.forEach(g => {
        if (g.role === 'navigator' && tile.terrain === 'dirt' && tile.flora < 6) {
            navigationBonus += 0.2;
        } else if (g.role === 'native-guide' && tile.flora >= 6) {
            navigationBonus += 0.2;
        } else if (g.role === 'explorer' && tile.location !== 'none' && tile.flora < 3) {
            navigationBonus += 0.2;
        }
    });
    let baseDuration = (400 + tile.inclination * 80 + tile.flora * 40) * (1 - navigationBonus);
    let loadFactor = (gameState.food + gameState.water) / getMaxStorage();
    gameState.moveDuration = baseDuration * (1 + loadFactor * 0.5);
    gameState.moveDx = dx;
    gameState.moveDy = dy;
}

export function revealAround() {
    let currentViewDist = gameState.viewDist + Math.floor(getGroupBonus('view'));
    for (let ddx = -currentViewDist; ddx <= currentViewDist; ddx++) {
        for (let ddy = -currentViewDist; ddy <= currentViewDist; ddy++) {
            if (Math.sqrt(ddx * ddx + ddy * ddy) <= currentViewDist) {
                gameState.visited.add(`${gameState.px + ddx},${gameState.py + ddy}`);
            }
        }
    }
}

export function updateResources(tile) {
    gameState.food += tile.flora * 0.1 * (1 + getGroupBonus('plant'));
    gameState.food = Math.min(gameState.food, getMaxStorage());
    if (Math.random() < 0.05 * (1 + getGroupBonus('resource'))) gameState.wood += 1;
    gameState.water = Math.min(gameState.water, getMaxStorage());
}