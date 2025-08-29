import { resize, draw, updateStatus, canvas, ctx } from './rendering.js';
import { revealAround } from './movement.js';
import { gameState } from './game_variables.js';
import { getTile, updateGroupBonus, updateTile, ensureGroupBonuses, checkDeath } from './utils.js';
import { getCheckAdjacentMonstersDialog, getCheckTileInteractionDialog, getShowChoiceDialog } from './interactions.js';
import { getCurrentGameDate, timeConsumption } from './time_system.js';
import { setupInputs } from './input_handlers.js';

// Setup
window.addEventListener('resize', resize, { passive: true });
resize();
ensureGroupBonuses(); // Fix any missing bonuses in existing group members
updateGroupBonus();
gameState.visited.set('0,0', getTile(0, 0));
revealAround();
setupInputs();

// Intervals
setInterval(timeConsumption, 1000);
setInterval(updateStatus, 1000);

// Async post-move logic
async function postMove() {
    let tile = getTile(gameState.px, gameState.py);
    await getCheckAdjacentMonstersDialog();
    await getCheckTileInteractionDialog(tile);
    let death = await checkDeath();
    if(death){
        await getShowDeathDialog(death);
    }
}

// Game loop (30 FPS)
// Game loop (30 FPS)
let lastFrameTime = 0;
const targetFrameTime = 1000 / 30;
function loop(timestamp) {
    if (timestamp - lastFrameTime < targetFrameTime) {
        requestAnimationFrame(loop);
        return;
    }
    lastFrameTime = timestamp;

    let offsetDeltaX = 0;
    let offsetDeltaY = 0;
    if (gameState.moving) {
        let now = performance.now();
        let unclampedFraction = (now - gameState.moveStartTime) / gameState.moveDuration;
        let fraction = Math.min(1, unclampedFraction); // Clamp to prevent overshoot if frame is late
        offsetDeltaX = -fraction * gameState.moveDx * gameState.tileSize;
        offsetDeltaY = -fraction * gameState.moveDy * gameState.tileSize;

        draw(offsetDeltaX, offsetDeltaY); // Draw BEFORE updating position

        if (unclampedFraction >= 1) {
            gameState.moving = false;
            gameState.prevx = gameState.px;
            gameState.prevy = gameState.py;
            gameState.px += gameState.moveDx;
            gameState.py += gameState.moveDy;
            const key = `${gameState.px},${gameState.py}`;
            if (!gameState.visited.has(key)) {
                gameState.visited.set(key, getTile(gameState.px, gameState.py));
            }
            revealAround();
            postMove().then(() => {
                gameState.cooldown = false;
            });
        }
        // No draw here—it's already done above
    } else {
        draw(offsetDeltaX, offsetDeltaY); // Non-moving case
    }
    requestAnimationFrame(loop);
}
loop();