// Equipment selection step for character creation
import {
  getShowChoiceDialog,
  getDialogValue,
} from "../../../../interactions.js";

import { raceDatabase } from "../../races.js";
import { classDatabase } from "../../../../interactions/combat/classes.js";
import {
  raceEmoji,
  classEmoji,
  skillEmoji,
} from "../../../../gamestate/emoji-database.js";
import { skillDatabase } from "../../../../interactions/skills.js";

import { createMessage, createBackButton } from "../utils/utils-navigation.js";
import {
  createCharacterIdentityDisplay,
  createStatDisplayGrid,
  createSkillsButtonGrid,
} from "../utils/utils-ui.js";
import { createEquipmentSelectionDisplay } from "../utils/utils-ui.js";
import {
  generateDiverseItemsForAllSlots,
  showItemSelectionDialog,
  isItem2HandedWeapon,
} from "../utils/utils-equipment-selection.js";
import { EQUIPMENT_SLOTS, STAT_CATEGORIES } from "../constants.js";
import { statEmoji } from "../../../../gamestate/emoji-database.js";
import { sexEmoji } from "../../../../gamestate/emoji-database.js";

/**
 * Show equipment selection dialog and handle item selection
 * @param {Object} character - Character object to modify equipment for
 * @param {string} generationMethod - Method used ("random" or "custom")
 * @param {Object} statsResult - Stats allocation result
 * @param {Object} nameResult - Name selection result
 * @param {string} raceResult - Selected race
 * @param {string} sexResult - Selected sex
 * @param {string} classResult - Selected class
 * @returns {Promise<Object>} Modified character with updated equipment
 */
export async function showEquipmentSelection(
  character,
  generationMethod,
  statsResult = null,
  nameResult = null,
  raceResult = null,
  sexResult = null,
  classResult = null
) {
  // Generate diverse items for all slots
  const availableItems = generateDiverseItemsForAllSlots(character.class);

  while (true) {
    const message = "";
    let components = [];

    // Character identity section
    const identityComponents = createCharacterIdentityDisplay(
      character,
      raceDatabase,
      classDatabase,
      raceEmoji,
      classEmoji,
      sexEmoji
    );
    components.push(...identityComponents);

    // Stats section
    const statComponents = createStatDisplayGrid(
      character.stats,
      statEmoji,
      STAT_CATEGORIES
    );
    components.push(...statComponents);

    // Skills section
    const skillsComponents = createSkillsButtonGrid(
      character.skills,
      skillEmoji,
      skillDatabase,
      3
    );
    components.push(...skillsComponents);

    // Equipment selection section (interactive)
    const equipmentComponents = createEquipmentSelectionDisplay(
      character.equipment,
      availableItems
    );
    components.push(...equipmentComponents);

    // Action buttons
    components.push({
      type: "button",
      label: "✅ Confirm Equipment",
      value: "confirm",
      focused: true,
    });

    components.push(createBackButton());

    const choice = await getShowChoiceDialog(message, components);
    const choiceValue = getDialogValue(choice, "value");

    if (choiceValue === "confirm") {
      // Equipment confirmed, return character
      return character;
    } else if (
      choiceValue &&
      choiceValue.startsWith("select_equipment_slot_")
    ) {
      // Slot selected, show item selection dialog
      const slotKey = choiceValue.replace("select_equipment_slot_", "");
      const slotConfig = EQUIPMENT_SLOTS.find((slot) => slot.key === slotKey);

      if (
        slotConfig &&
        availableItems[slotKey] &&
        availableItems[slotKey].length > 0
      ) {
        const selectedItem = await showItemSelectionDialog(
          slotKey,
          availableItems[slotKey],
          slotConfig.label
        );

        if (selectedItem) {
          // Update equipment
          character.equipment[slotKey] = selectedItem;

          // Handle 2h weapon logic
          if (slotKey === "weapon") {
            if (isItem2HandedWeapon(selectedItem)) {
              // Set secondHand to empty when 2h weapon is selected
              character.equipment.secondHand = "(empty)";
            } else if (character.equipment.secondHand === "(empty)") {
              // Clear secondHand if switching from 2h to 1h weapon
              character.equipment.secondHand = null;
            }
          }

          // If secondHand is selected and it's not "(empty)" or "(2h-grip)",
          // and current weapon is 2h, clear the weapon's 2h status
          if (
            slotKey === "secondHand" &&
            selectedItem !== "(empty)" &&
            selectedItem !== "(2h-grip)"
          ) {
            // If we have a 2h weapon, we shouldn't be able to select a secondHand item
            // But if somehow we do, we need to handle it
            if (isItem2HandedWeapon(character.equipment.weapon)) {
              character.equipment.weapon = null; // Clear 2h weapon
            }
          }
        }

        // Continue loop to refresh display
        continue;
      }
    } else if (choiceValue === "back") {
      // Go back
      return "back";
    } else if (choiceValue && choiceValue.startsWith("display_")) {
      // Display buttons, just refresh
      continue;
    }

    // Default: go back
    return "back";
  }
}
