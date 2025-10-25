// Character preview step
import {
  getShowChoiceDialog,
  getDialogValue,
} from "../../../../interactions.js";
import characterGeneration from "../../generation.js";
import { raceDatabase } from "../../races.js";
import { classDatabase } from "../../../../interactions/combat/classes.js";
import { raceEmoji, classEmoji } from "../../../../gamestate/emoji-database.js";
import { statGeneration } from "../../stats.js";
import { createMessage, createBackButton } from "../utils/utils-navigation.js";
import {
  createStatDisplay,
  createEquipmentDisplay,
  createSkillsDisplay,
  createCompactStatLine,
} from "../utils/utils-ui.js";
import { STAT_CATEGORIES, DEFAULT_POINTS } from "../constants.js";
import { handleRandomGeneration } from "./random-generation.js";
import { handleStatsAllocationWithState } from "./stats-allocation.js";

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
  const message = `${
    raceEmoji[character.race]
  } ${character.firstName.toUpperCase()} ${character.lastName.toUpperCase()}`;
  let components = [];

  // Character basic info - First line: sex, race name (explanation race)
  const raceData = raceDatabase && raceDatabase[character.race];
  const raceRegion = raceData ? raceData.region : "Unknown Region";
  const raceName = raceData ? raceData.name.toLowerCase() : "unknown";
  const raceEmojiIcon = raceEmoji[character.race];
  const classData = classDatabase[character.class];
  const className = classData ? classData.name : "Unknown Class";
  const classEmojiIcon = classEmoji[character.class] || "❓";

  components.push(
    createMessage(
      `${character.sex} ${raceRegion} ${raceEmojiIcon} (${raceName}) ${className} ${classEmojiIcon} lvl.${character.level}`
    )
  );

  // Stats header
  components.push(createMessage("::::::STATS::::::"));

  // Physical stats (STR, DEX, CON)
  const physicalLine = createCompactStatLine(
    character.stats,
    STAT_CATEGORIES.physical
  );
  components.push(createMessage(physicalLine));

  // Mental stats (INT, WIS, CHA, do not show LUCK to the player)
  const mentalLine = createCompactStatLine(
    character.stats,
    STAT_CATEGORIES.mental
  );
  components.push(createMessage(mentalLine));

  // Skills display using utility function
  const skillsComponents = createSkillsDisplay(character.skills);
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
        return "back"; // Will restart custom creation flow
      default:
        return "back";
    }
  } else if (choiceValue === "back") {
    // Go back to stats allocation for custom characters
    if (generationMethod === "custom") {
      // Reset stats to base stats when going back
      return await handleStatsAllocationWithState(
        { ...statGeneration.baseStats },
        DEFAULT_POINTS,
        nameResult,
        raceResult,
        sexResult,
        classResult
      );
    }
    // For random characters, go back to random generation
    return await handleRandomGeneration();
  }

  // If no valid action was taken, go back to stats allocation for custom characters
  if (generationMethod === "custom") {
    return await handleStatsAllocationWithState(
      { ...statGeneration.baseStats },
      DEFAULT_POINTS,
      nameResult,
      raceResult,
      sexResult,
      classResult
    );
  }
  // For random characters, go back to random generation
  return await handleRandomGeneration();
}
