import { resize, draw, updateStatus, canvas, ctx } from "./rendering.js";
import { revealAround } from "./movement.js";
import { gameState } from "./gamestate/game_variables.js";
import { updateGroupBonus, checkDeath } from "./utils.js";
import { getTile } from "./rendering/tile.js";
import { getLoadGameDialog } from "./interactions.js";
import {
  getCheckAdjacentMonstersDialog,
  getCheckTileInteractionDialog,
  getShowDeathDialog,
} from "./interactions.js";
import { timeConsumption } from "./time_system.js";
import { setupInputs } from "./input_handlers.js";
import {
  getStartMenuDialog,
  getCharacterCreationDialog,
  getTitleDialog,
  getGroupCreationDialog,
  getWorldGenerationDialog,
} from "./interactions.js";
import { showCompanionChoiceDialog } from "./interactions/companionChoiceDialog.js";
import {
  addVisitedTile,
  addCachedTile,
  getVisitedTile,
} from "./gamestate/gameStateSetGet.js";

// Setup
window.addEventListener("resize", resize, { passive: true });
resize();

// Start Menu
let startMenu;
while (startMenu !== "explore" && startMenu !== "exit") {
  startMenu = await getStartMenuDialog();
  "Selected option:", startMenu;
  if (startMenu === "title") {
    //TODO: show to player title and close it after pressing
    //TODO: insert info about the game and mechanics
    // await getTitleDialog();
  } else if (startMenu === "load") {
    startMenu;
    await getLoadGameDialog();
    break;
  } else if (startMenu === "exit") {
    window.close();
  }
}
startMenu;
if (startMenu !== "load") {
  // World Generation
  let worldGenerationDialog;
  while (worldGenerationDialog !== "new" && worldGenerationDialog !== "back") {
    worldGenerationDialog = await getWorldGenerationDialog();
    if (worldGenerationDialog === "seed") {
      continue;
    }
    if (worldGenerationDialog === "back") {
      location.reload();
    }
  }

  // Character Creation
  let characterCreation;
  while (characterCreation !== "create") {
    characterCreation = await getCharacterCreationDialog();
    if (characterCreation === "reload") {
      location.reload();
    } else if (characterCreation === "create") {
      continue;
    } else if (characterCreation && characterCreation.action === "accept") {
      // Character was accepted, store it and continue
      "Character accepted:", characterCreation.character;
      gameState.playerCharacter = characterCreation.character; // Store the player character
      characterCreation = "create"; // Set to exit the loop
    }
  }

  // Companion Choice Dialog
  let companionChoice;
  while (companionChoice !== "continue") {
    companionChoice = await showCompanionChoiceDialog(
      gameState.playerCharacter
    );
    if (companionChoice === "back") {
      location.reload();
    } else if (
      companionChoice &&
      (companionChoice.action === "alone" ||
        companionChoice.action === "companion_selected")
    ) {
      "Companion choice result:", companionChoice;
      companionChoice = "continue"; // Set to exit the loop
    }
  }

  // Group Creation
  let groupCreation;
  while (groupCreation !== "create") {
    groupCreation = await getGroupCreationDialog();
    if (groupCreation === "back") {
      location.reload();
    } else if (groupCreation === "create") {
      continue;
    }
  }
}

// if (startMenu !== "load" || !gameState.visited.has("0,0")) {
//   gameState.visited.set("0,0", getTile(0, 0));
// }

updateGroupBonus();
addVisitedTile("0,0");
revealAround();
setupInputs();

// Intervals
setInterval(timeConsumption, 1000);
setInterval(updateStatus, 1000);

// Async post-move logic
async function postMove() {
  let tile = getTile(gameState.px, gameState.py);
  const key = `${gameState.px},${gameState.py}`;
  addCachedTile(key, tile);
  await getCheckAdjacentMonstersDialog();
  await getCheckTileInteractionDialog(tile);
  let death = await checkDeath();
  if (death) {
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
    let unclampedFraction =
      (now - gameState.moveStartTime) / gameState.moveDuration;
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
      if (!getVisitedTile(key)) {
        const tile = getTile(gameState.px, gameState.py);
        addCachedTile(key, tile);
        addVisitedTile(key);
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
