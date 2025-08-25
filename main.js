import { resize, draw, updateStatus, canvas, ctx } from './rendering.js';
import { revealAround, updateResources } from './movement.js';
import { moving, moveStartTime, moveDuration, moveDx, moveDy, px, py, prevx, prevy, visited, cooldown, health, gold } from './game_variables.js';
import { getTile, getMaxStorage } from './utils.js'; // For game over check
import { checkAdjacentMonsters, checkTileInteraction } from './interactions.js';
import { getCurrentGameDate, timeConsumption } from './time_system.js';
import { setupInputs } from './input_handlers.js';

// Setup
window.addEventListener('resize', resize);
resize();
revealAround();
setupInputs();

// Intervals
setInterval(() => {
    document.getElementById('date-bar').innerText = getCurrentGameDate().toLocaleString();
}, 1000);
setInterval(timeConsumption, 1000);

// Game loop
function loop() {
    let offsetDeltaX = 0;
    let offsetDeltaY = 0;
    if (moving) {
        let now = performance.now();
        let fraction = (now - moveStartTime) / moveDuration;
        if (fraction >= 1) {
            fraction = 1;
            moving = false;
            prevx = px;
            prevy = py;
            px += moveDx;
            py += moveDy;
            visited.add(`${px},${py}`);
            revealAround();
            let tile = getTile(px, py);
            updateResources(tile);
            checkAdjacentMonsters();
            checkTileInteraction(tile);
            if (health <= 0 || gold < -50) {
                alert('Game Over! ☠️');
                // Reset game (simple)
                location.reload();
            }
            cooldown = false;
        }
        offsetDeltaX = -fraction * moveDx * tileSize;
        offsetDeltaY = -fraction * moveDy * tileSize;
    }
    draw(offsetDeltaX, offsetDeltaY);
    updateStatus();
    requestAnimationFrame(loop);
}
loop();