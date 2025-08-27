import { resize, draw, updateStatus, canvas, ctx } from './rendering.js';
import { revealAround } from './movement.js';
import { gameState } from './game_variables.js';
import { getTile, updateGroupBonus, updateTile } from './utils.js';
import { checkAdjacentMonsters, checkTileInteraction, showChoiceDialog } from './interactions.js';
import { getCurrentGameDate, timeConsumption } from './time_system.js';
import { setupInputs } from './input_handlers.js';

// Setup
window.addEventListener('resize', resize, { passive: true });
resize();
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
    await checkAdjacentMonsters();
    await checkTileInteraction(tile);
    if (gameState.health <= 0) {
        await showChoiceDialog('You died fighting! ☠️', [
            { label: '🔄 Restart Game', value: 'restart' }
        ]);
        location.reload();
    } else if (gameState.gold < -50) {
        await showChoiceDialog('You paid your debt with your life! ☠️', [
            { label: '🔄 Restart Game', value: 'restart' }
        ]);
        location.reload();
    }
}

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
        let fraction = (now - gameState.moveStartTime) / gameState.moveDuration;
        if (fraction >= 1) {
            fraction = 1;
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
        offsetDeltaX = -fraction * gameState.moveDx * gameState.tileSize;
        offsetDeltaY = -fraction * gameState.moveDy * gameState.tileSize;
    }
    draw(offsetDeltaX, offsetDeltaY);
    requestAnimationFrame(loop);
}
loop();