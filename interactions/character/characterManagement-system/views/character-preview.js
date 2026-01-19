// Character preview for management system
import { showChoiceDialog } from "../../../showDialog.js";
import { raceDatabase } from "../../races.js";
import { classDatabase } from "../../../combat/classes.js";
import {
  raceEmoji,
  classEmoji,
  sexEmoji,
  skillEmoji,
  statEmoji,
} from "../../../../gamestate/emoji-database.js";
import { skillDatabase } from "../../../skills.js";
import {
  createCharacterIdentityDisplay,
  createStatDisplayGrid,
  createSkillsButtonGrid,
} from "../../characterCreation-system/utils/utils-ui.js";
import {
  STAT_CATEGORIES,
  EQUIPMENT_SLOTS,
} from "../../characterCreation-system/constants.js";
import {
  createBackButton,
  createCharacterNavigator,
} from "../utils/utils-navigation.js";
import { createInteractiveEquipmentDisplay } from "../utils/utils-equipment-management.js";
import {
  showEquipmentSelectionDialog,
  equipItem,
  unequipItem,
} from "../utils/utils-equipment-management.js";
import {
  getItemsForSlot,
  getItemsByCharacterForSlot,
  addToGroupInventory,
  removeFromGroupInventory,
} from "../utils/utils-group-inventory.js";
import { gameState } from "../../../../gamestate/game_variables.js";

/**
 * Get character ID for equipment management
 * @param {Object} character - Character object
 * @param {number} currentIndex - Current index in character list
 * @returns {string} Character ID
 */
function getCharacterId(character, currentIndex) {
  // Check if this is the player character
  if (
    gameState.playerCharacter &&
    gameState.playerCharacter.id === character.id
  ) {
    return "player";
  }
  // Otherwise it's a group member, use index-based ID
  return `group_${currentIndex}`;
}

/**
 * Show character preview for management
 * @param {Object} character - Character to preview
 * @param {number} currentIndex - Current index in character list
 * @param {Array} characters - Full array of characters for navigation
 * @returns {Promise<string>} Navigation result
 */
export async function showCharacterPreview(
  character,
  currentIndex = 0,
  characters = []
) {
  const characterId = getCharacterId(character, currentIndex);

  while (true) {
    let components = [];

    // Add character navigator if we have multiple characters
    if (characters && characters.length > 0) {
      const navigatorComponent = createCharacterNavigator(
        character,
        currentIndex,
        characters.length,
        raceEmoji
      );
      components.push(navigatorComponent);
    }

    // Character Identity Section
    const identityComponents = createCharacterIdentityDisplay(
      character,
      raceDatabase,
      classDatabase,
      raceEmoji,
      classEmoji,
      sexEmoji
    );
    components.push(...identityComponents);

    // Stats Section
    const statComponents = createStatDisplayGrid(
      character.stats,
      statEmoji,
      STAT_CATEGORIES
    );
    components.push(...statComponents);

    // Skills Section
    const skillsComponents = createSkillsButtonGrid(
      character.skills,
      skillEmoji,
      skillDatabase,
      3
    );
    components.push(...skillsComponents);

    // Equipment Section - Interactive
    const equipmentComponents = createInteractiveEquipmentDisplay(
      character.equipment,
      characterId
    );
    components.push(...equipmentComponents);

    components.push({
      type: "message",
      label: "\n",
      value: "",
    });

    // Add back button
    components.push(createBackButton());

    const choice = await showChoiceDialog("", components);

    if (choice === "back") {
      return "back";
    }

    if (choice === "nav_previous" || choice === "nav_next") {
      return choice;
    }

    // Handle equipment slot selection
    if (choice && choice.startsWith("equip_slot_")) {
      const slotKey = choice.replace("equip_slot_", "");
      const slotConfig = EQUIPMENT_SLOTS.find(
        (slot) => slot.key === slotKey
      ) || { key: slotKey, label: slotKey };

      // Get available items organized by character
      const organizedItems = getItemsByCharacterForSlot(slotKey, characterId);

      const availableItems = getItemsForSlot(slotKey, characterId);

      if (availableItems.length > 0 || slotKey === "secondHand") {
        const selectedItem = await showEquipmentSelectionDialog(
          slotKey,
          availableItems,
          slotConfig.label || slotKey,
          organizedItems
        );

        if (selectedItem !== null) {
          // Equip the item
          equipItem(
            character,
            slotKey,
            selectedItem,
            addToGroupInventory,
            removeFromGroupInventory
          );
          // Continue loop to refresh display
          continue;
        }
      }
      // Continue loop to refresh display even if cancelled
      continue;
    }

    // Handle unequip
    if (choice && choice.startsWith("unequip_slot_")) {
      const slotKey = choice.replace("unequip_slot_", "");
      unequipItem(character, slotKey, addToGroupInventory);
      // Continue loop to refresh display
      continue;
    }

    // Return any other result (shouldn't happen, but handle it)
    return "back";
  }
}
