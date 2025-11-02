import { showChoiceDialog, getDialogValue } from "./interactions/showDialog.js";
import { handleEnhancedCombat } from "./interactions/combat-system/index.js";
import { handleEnhancedCombatDialog } from "./interactions/combat-system/index.js";
import { checkTileInteraction } from "./interactions/tileInteraction.js";
import { handleChoice } from "./interactions/handleChoice.js";
import { handleAnimal } from "./interactions/handleAnimalDialog.js";
import { showMenu } from "./interactions/showMenu.js";
import { showInventoryDialog } from "./interactions/inventoryDialog.js";
import { showGoldDialog } from "./interactions/goldDialog.js";
import { showDeathDialog } from "./interactions/deathDialog.js";
import { showHealthGroupDialog } from "./interactions/healthGroupDialog.js";
import { showDiscoveriesDialog } from "./interactions/discoveriesDialog.js";
import { showEventsDialog } from "./interactions/eventDialog.js";
import { startMenu } from "./interactions/startMenu.js";
import { titleDialog } from "./interactions/showTitleDialog.js";
import { showCharacterGenerationDialog } from "./interactions/character/characterCreation-system/index.js";
import { showGroupCreationDialog } from "./interactions/groupCreationDialog.js";
import { worldGenerationDialog } from "./interactions/worldGenerationDialog.js";
import { saveGameDialog } from "./interactions/saveGameDialog.js";
import { loadGameDialog } from "./interactions/loadGameDialog.js";
import { gameState } from "./gamestate/game_variables.js";
import { updateStatus } from "./rendering.js";
import { getTile } from "./rendering/tile.js";

export async function getShowChoiceDialog(message, components) {
  return showChoiceDialog(message, components);
}

export { getDialogValue };

// Legacy compatibility: use enhanced combat system
export async function getHandleCombatDialog(ex, ey, isOnTile = false) {
  // Redirect to enhanced combat system for backward compatibility
  return handleEnhancedCombatDialog(ex, ey, isOnTile);
}

export async function getHandleEnhancedCombatDialog(ex, ey, isOnTile = false) {
  return handleEnhancedCombatDialog(ex, ey, isOnTile);
}

// Legacy compatibility stub for checkAdjacentMonsters
// Checks adjacent tiles for monsters and triggers combat if found
export async function getCheckAdjacentMonstersDialog() {
  // Check adjacent tiles for monster entities
  const directions = [
    { dx: 0, dy: -1 }, // North
    { dx: 1, dy: 0 },  // East
    { dx: 0, dy: 1 },  // South
    { dx: -1, dy: 0 }, // West
  ];

  for (const dir of directions) {
    const adjX = gameState.px + dir.dx;
    const adjY = gameState.py + dir.dy;
    
    // Get tile (will generate or use cache)
    const tile = getTile(adjX, adjY);
    
    // Check if tile has a combat entity (monster or beast)
    if (tile && (tile.entity === "monster" || tile.entity === "beast")) {
      // Trigger combat at the adjacent tile location
      return await handleEnhancedCombatDialog(adjX, adjY, false);
    }
  }

  // No monsters found in adjacent tiles
  return null;
}

export async function getCheckTileInteractionDialog(tile) {
  return checkTileInteraction(tile);
}

export async function getHandleChoiceDialog(choice, tile) {
  return handleChoice(choice, tile);
}

export async function getHandleAnimalDialog(x, y) {
  return handleAnimal(x, y);
}

export async function getShowMenuDialog() {
  return showMenu();
}

export async function getShowInventoryDialog() {
  return showInventoryDialog();
}

export async function getShowGoldDialog() {
  return showGoldDialog();
}

export async function getShowDeathDialog(death) {
  return showDeathDialog(death);
}

export async function getShowHealthGroupDialog() {
  return showHealthGroupDialog();
}

export async function getShowDiscoveriesDialog() {
  return showDiscoveriesDialog();
}

export async function getShowEventsDialog() {
  return showEventsDialog();
}

export async function getStartMenuDialog() {
  return startMenu();
}

export async function showTitleDialog() {
  return titleDialog();
}

export async function getCharacterCreationDialog() {
  return showCharacterGenerationDialog();
}

export async function getGroupCreationDialog() {
  return showGroupCreationDialog();
}

export async function getWorldGenerationDialog() {
  return worldGenerationDialog();
}

export async function getSaveGameDialog() {
  return saveGameDialog();
}

export async function getLoadGameDialog() {
  return loadGameDialog();
}

export async function toggleMapType() {
  if (gameState.mapType === "global") {
    gameState.mapType = "regional";
  } else {
    gameState.mapType = "global";
  }
  setTimeout(() => {
    "map type changed to", gameState.mapType;
  }, 1000);
  updateStatus();
}
