import { showChoiceDialog } from "./interactions/showDialog.js";
import {
  handleCombat,
  checkAdjacentMonsters,
} from "./interactions/combatDialog.js";
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
import { titleDialog } from "./interactions/titleDialog.js";
import { characterCreationDialog } from "./interactions/charCreationDialog.js";
import { showGroupCreationDialog } from "./interactions/groupCreationDialog.js";
import { worldGenerationDialog } from "./interactions/worldGenerationDialog.js";
import { saveGameDialog } from "./interactions/saveGameDialog.js";
import { loadGameDialog } from "./interactions/loadGameDialog.js";

export async function getShowChoiceDialog(message, components) {
  return showChoiceDialog(message, components);
}

export async function getHandleCombatDialog(ex, ey, isOnTile = false) {
  return handleCombat(ex, ey, isOnTile);
}

export async function getCheckAdjacentMonstersDialog() {
  return checkAdjacentMonsters();
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

export async function getTitleDialog() {
  return titleDialog();
}

export async function getCharacterCreationDialog() {
  return characterCreationDialog();
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