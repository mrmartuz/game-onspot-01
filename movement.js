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

export function updateResources(tile) {
    // Apply plant bonus for food gain on flower tiles
    let plantBonus = getGroupBonus('plant');
    let foodGain = tile.flora * 0.1;
    
    // Bonus food on flower tiles (flora > 6)
    if (tile.flora > 6 && tile.flora_type !== 'none') {
        foodGain += 1 * (1 + plantBonus); // Base 1 food + plant bonus
    }
    
    gameState.food += foodGain;
    gameState.food = Math.min(gameState.food, getMaxStorage());
    
    // Apply resource bonus for wood gain on high flora tiles
    let resourceBonus = getGroupBonus('resource');
    if (tile.flora > 6) {
        // Higher chance and amount of wood on high flora tiles
        let woodChance = 0.15 * (1 + resourceBonus);
        if (Math.random() < woodChance) {
            let woodAmount = 1 + Math.floor(resourceBonus * 2); // 1-3 wood based on bonus
            gameState.wood += woodAmount;
        }
    } else {
        // Regular wood chance on other tiles
        if (Math.random() < 0.05 * (1 + resourceBonus)) {
            gameState.wood += 1;
        }
    }
    
    gameState.water = Math.min(gameState.water, getMaxStorage());
}