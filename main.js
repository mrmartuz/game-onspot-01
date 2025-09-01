import { resize, draw, updateStatus, canvas, ctx } from './rendering.js';
import { revealAround } from './movement.js';
import { gameState } from './game_variables.js';
import { updateGroupBonus, ensureGroupBonuses, checkDeath } from './utils.js';
import { getTile } from './rendering/tile.js';
import { getCheckAdjacentMonstersDialog, getCheckTileInteractionDialog, getShowDeathDialog } from './interactions.js';
import { timeConsumption } from './time_system.js';
import { setupInputs } from './input_handlers.js';
import { getStartMenuDialog, getCharacterCreationDialog, getTitleDialog} from './interactions.js';

// Setup
window.addEventListener('resize', resize, { passive: true });
resize();

let startMenu;
while (startMenu !== "new" && startMenu !== "exit") {
  startMenu = await getStartMenuDialog();
  console.log("Selected option:", startMenu);
  if (startMenu === "title") {
    //TODO: show to player title and close it after pressing
    //TODO: insert info about the game and mechanics
    // await getTitleDialog();
  } else if (startMenu === "seed") {
    // No need to call getStartMenuDialog again; the loop will handle it
    continue;
  } else if (startMenu === "exit") {
    window.close();
  }
}
if (startMenu === "new") {
  await getCharacterCreationDialog();
}

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