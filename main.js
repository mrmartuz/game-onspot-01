import { resize, draw, updateStatus, canvas, ctx } from './rendering.js';
import { revealAround, updateResources } from './movement.js';
import { gameState } from './game_variables.js';
import { getTile, updateGroupBonus } from './utils.js';
import { checkAdjacentMonsters, checkTileInteraction, showChoiceDialog, showDiscoveriesDialog } from './interactions.js';
import { getCurrentGameDate, timeConsumption } from './time_system.js';
import { setupInputs } from './input_handlers.js';

// Setup
window.addEventListener('resize', resize);
resize();
updateGroupBonus(); // Initialize group bonuses
console.log('Initial group bonuses:', gameState.groupBonus); // Debug log
revealAround();
setupInputs();

// Intervals
setInterval(timeConsumption, 1000);

// Async post-move logic
async function postMove() {
    let tile = getTile(gameState.px, gameState.py);
    updateResources(tile);
    await checkAdjacentMonsters();
    await checkTileInteraction(tile);
    if (gameState.health <= 0 || gameState.gold < -50) {
        await showChoiceDialog('Game Over! ☠️', [
            { label: '🔄 Restart Game', value: 'restart' }
        ]);
        location.reload();
    }
}

// Game loop
function loop() {
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
            gameState.visited.add(`${gameState.px},${gameState.py}`);
            revealAround();
            postMove().then(() => {
                gameState.cooldown = false;
            });
        }
        offsetDeltaX = -fraction * gameState.moveDx * gameState.tileSize;
        offsetDeltaY = -fraction * gameState.moveDy * gameState.tileSize;
    }
    draw(offsetDeltaX, offsetDeltaY);
    updateStatus();
    requestAnimationFrame(loop);
}
loop();