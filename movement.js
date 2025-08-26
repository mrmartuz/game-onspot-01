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
    
    // Apply terrain-specific navigation bonuses
    gameState.group.forEach(g => {
        if (g.role === 'navigator' && tile.terrain === 'dirt' && tile.flora < 6) {
            navigationBonus += 0.2;
        } else if (g.role === 'native-guide' && tile.flora >= 6) {
            navigationBonus += 0.2;
        } else if (g.role === 'explorer' && tile.location !== 'none' && tile.flora < 3) {
            navigationBonus += 0.2;
        }
    });
    
    // Apply navigation bonus to movement speed (navigation bonus makes movement faster)
    let baseDuration = (400 + tile.inclination * 80 + tile.flora * 40);
    let navigationSpeedMultiplier = Math.max(0.3, 1 - navigationBonus); // Minimum 30% of original speed
    let adjustedDuration = baseDuration * navigationSpeedMultiplier;
    
    let loadFactor = (gameState.food + gameState.water) / getMaxStorage();
    gameState.moveDuration = adjustedDuration * (1 + loadFactor * 0.5);
    gameState.moveDx = dx;
    gameState.moveDy = dy;
}

export function revealAround() {
    // Apply view bonus for increased view distance
    let viewBonus = getGroupBonus('view');
    let currentViewDist = gameState.viewDist + Math.floor(viewBonus);
    
    for (let ddx = -currentViewDist; ddx <= currentViewDist; ddx++) {
        for (let ddy = -currentViewDist; ddy <= currentViewDist; ddy++) {
            if (Math.sqrt(ddx * ddx + ddy * ddy) <= currentViewDist) {
                gameState.visited.add(`${gameState.px + ddx},${gameState.py + ddy}`);
            }
        }
    }
}