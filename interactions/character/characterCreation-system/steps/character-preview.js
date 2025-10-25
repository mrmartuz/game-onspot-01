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
  createEquipmentDisplay,
  createSkillsButtonGrid,
  createStatDisplayGrid,
} from "../utils/utils-ui.js";
import { STAT_CATEGORIES } from "../constants.js";
import { handleRandomGeneration } from "./random-generation.js";

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
  const message = ``;
  let components = [];

  // Character basic info - First line: sex, race name (explanation race)
  const raceData = raceDatabase && raceDatabase[character.race];
  const raceRegion = raceData ? raceData.region : "Unknown Region";
  const raceName = raceData ? raceData.name.toLowerCase() : "unknown";
  const raceEmojiIcon = raceEmoji[character.race];
  const classData = classDatabase[character.class];
  const className = classData ? classData.name : "Unknown Class";
  const classEmojiIcon = classEmoji[character.class] || "❓";

  components.push({
    type: "button",
    label: `${
      raceEmoji[character.race]
    } ${character.firstName.toUpperCase()} ${character.lastName.toUpperCase()}`,
    value: "display_character_name",
  });

  components.push(
    createMessage(
      `${character.sex} ${
        sexEmoji[character.sex]
      } ${raceRegion} ${raceEmojiIcon} ${className} ${classEmojiIcon} lvl.${
        character.level
      }`
    )
  );

  // Stats display using utility function
  const statComponents = createStatDisplayGrid(character.stats, statEmoji);
  components.push(...statComponents);
  // Skills display using button grid
  const skillsComponents = createSkillsButtonGrid(
    character.skills,
    skillEmoji,
    skillDatabase,
    3
  );
  components.push(...skillsComponents);

  // Equipment display using utility function
  const equipmentComponents = createEquipmentDisplay(character.equipment);
  components.push(...equipmentComponents);

  // Health display
  components.push(
    createMessage(
      `❤️ Health: ${character.health.current}/${character.health.max}`
    )
  );

  // Action buttons
  components.push({
    type: "button",
    label: "✅ Accept Character",
    value: "accept",
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
        return await handleRandomGeneration();
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
  } else if (choiceValue && choiceValue.startsWith("display_")) {
    // Display buttons are not interactive, just refresh the dialog
    return await showCharacterPreview(
      character,
      generationMethod,
      statsResult,
      nameResult,
      raceResult,
      sexResult,
      classResult
    );
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
    // For random characters, go back to random generation
    return await handleRandomGeneration();
  }

  // If no valid action was taken, go back to stats allocation for custom characters
  if (generationMethod === "custom") {
    return createNavigationResult(NavigationResult.BACK_TO_STATS, {
      statsResult,
      nameResult,
      raceResult,
      sexResult,
      classResult,
    });
  }
  // For random characters, go back to random generation
  return await handleRandomGeneration();
}
