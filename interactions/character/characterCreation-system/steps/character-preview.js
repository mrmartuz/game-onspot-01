// Character preview step
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
  createCharacterOverview,
  createCharacterIdentityDisplay,
  createStatDisplayGrid,
  createSkillsButtonGrid,
  createEquipmentSelectionDisplay,
  createEquipmentDisplay,
} from "../utils/utils-ui.js";
import {
  generateDiverseItemsForAllSlots,
  showItemSelectionDialog,
  isItem2HandedWeapon,
} from "../utils/utils-equipment-selection.js";
import { STAT_CATEGORIES, EQUIPMENT_SLOTS } from "../constants.js";
import characterGeneration from "../../generation.js";

import { createNavigationResult, NavigationResult } from "../state.js";
import { statEmoji } from "../../../../gamestate/emoji-database.js";
import { sexEmoji } from "../../../../gamestate/emoji-database.js";
/**
 * Show character preview and handle final actions
 * @param {Object} character - Generated character
 * @param {string} generationMethod - Method used ("random" or "custom")
 * @param {Object} statsResult - Stats allocation result
 * @param {Object} nameResult - Name selection result
 * @param {string} raceResult - Selected race
 * @param {string} sexResult - Selected sex
 * @param {string} classResult - Selected class
 * @returns {Promise<Object|string>} Action result or navigation result
 */
export async function showCharacterPreview(
  character,
  generationMethod,
  statsResult = null,
  nameResult = null,
  raceResult = null,
  sexResult = null,
  classResult = null
) {
  // Generate diverse items only for custom creation (interactive equip)
  const availableItems =
    generationMethod === "custom"
      ? generateDiverseItemsForAllSlots(character.class)
      : null;

  while (true) {
    const message = ``;
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

    // Equipment section
    const equipmentComponents =
      generationMethod === "custom"
        ? createEquipmentSelectionDisplay(character.equipment, availableItems)
        : createEquipmentDisplay(character.equipment);
    components.push(...equipmentComponents);

    // Action buttons
    components.push({
      type: "button",
      label: "✅ Accept Character",
      value: "accept",
      focused: true, // This will be used to set focus
    });

    components.push({
      type: "button",
      label: "🔄 Regenerate",
      value: "regenerate",
    });

    components.push(createBackButton());

    const choice = await getShowChoiceDialog(message, components);
    const choiceValue = getDialogValue(choice, "value");

    if (choiceValue === "accept") {
      return { action: "accept", character };
    } else if (choiceValue === "regenerate") {
      // Regenerate based on the original method
      switch (generationMethod) {
        case "random":
          // Generate a new random character and show its preview
          const newCharacter = await characterGeneration.generateCharacter({
            usePointAllocation: false,
          });
          return await showCharacterPreview(
            newCharacter,
            generationMethod,
            statsResult,
            nameResult,
            raceResult,
            sexResult,
            classResult
          );
        case "custom":
          return createNavigationResult(NavigationResult.REGENERATE, {
            nameResult,
            raceResult,
            sexResult,
            classResult,
          });
        default:
          return createNavigationResult(NavigationResult.BACK_TO_MAIN);
      }
    } else if (
      generationMethod === "custom" &&
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

          // If secondHand slot is selected and it's not "(empty)" or "(2h-grip)",
          // and current weapon is 2h, we should clear the weapon's 2h status
          if (
            slotKey === "secondHand" &&
            selectedItem !== "(empty)" &&
            selectedItem !== "(2h-grip)"
          ) {
            // If we have a 2h weapon, clear it when selecting a shield/second weapon
            if (isItem2HandedWeapon(character.equipment.weapon)) {
              character.equipment.weapon = null; // Clear 2h weapon
            }
          }
        }

        // Continue loop to refresh display
        continue;
      }
    } else if (choiceValue && choiceValue.startsWith("display_")) {
      // Display buttons are not interactive, just refresh the dialog
      continue;
    } else if (choiceValue === "back") {
      // Go back to stats allocation for custom characters
      if (generationMethod === "custom") {
        return createNavigationResult(NavigationResult.BACK_TO_STATS, {
          statsResult,
          nameResult,
          raceResult,
          sexResult,
          classResult,
        });
      }
      // For random characters, go back to the main choice dialog
      return "back";
    }

    // If we get here, continue the loop (for refresh scenarios)
    continue;
  }
}
