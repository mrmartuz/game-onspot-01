// Stats allocation step
import {
  getShowChoiceDialog,
  getDialogValue,
} from "../../../../interactions.js";
import { statGeneration, proceduralGeneration } from "../../stats.js";
import {
  createMessage,
  createBackButton,
  createRandomButton,
} from "../utils/utils-navigation.js";
import { STAT_CATEGORIES, DEFAULT_POINTS } from "../constants.js";
import {
  calculateStatCost,
  canIncreaseStat,
  canDecreaseStat,
  increaseStat,
  decreaseStat,
} from "../utils/utils-validation.js";
import { raceEmoji } from "../../../../gamestate/emoji-database.js";
import { sexEmoji } from "../../../../gamestate/emoji-database.js";
import { classEmoji } from "../../../../gamestate/emoji-database.js";
import { classDatabase } from "../../../../interactions/combat/classes.js";
import { raceDatabase } from "../../../../interactions/character/races.js";
import { statEmoji } from "../../../../gamestate/emoji-database.js";
/**
 * Handle stats allocation for custom character creation
 * @param {Object} currentStats - Current stats
 * @param {number} remainingPoints - Remaining points to allocate
 * @param {Object} nameResult - Name selection result
 * @param {string} raceResult - Selected race
 * @param {string} sexResult - Selected sex
 * @param {string} classResult - Selected class
 * @returns {Promise<Object|string>} Stats result or navigation result
 */
export async function handleStatsAllocationWithState(
  currentStats,
  remainingPoints,
  nameResult = null,
  raceResult = null,
  sexResult = null,
  classResult = null
) {
  const message = "⚖️ STATS ALLOCATION";
  let components = [];

  components.push(
    createMessage(
      `You are ${nameResult.firstName} ${nameResult.lastName} a ${sexResult} ${sexEmoji[sexResult]} ${raceDatabase[raceResult].region} ${raceEmoji[raceResult]}, you are a ${classEmoji[classResult]} ${classResult}:
      \n
      ${classDatabase[classResult].description}
      \n
      You have ${remainingPoints} points to allocate. Each point over 10 costs 2 points. Minimum stat value is 8.`
    )
  );

  // Create compact 3-row stats allocation grid
  const allStats = [...STAT_CATEGORIES.physical, ...STAT_CATEGORIES.mental];

  // Row 1: Increase buttons (arrow up symbols)
  const increaseButtons = allStats.map((stat) => {
    const canIncrease = canIncreaseStat(currentStats, stat, remainingPoints);
    const cost = calculateStatCost(currentStats[stat], currentStats[stat] + 1);

    return {
      label: `⬆️ ${cost}`,
      value: `increase_${stat}`,
      disabled: !canIncrease,
    };
  });

  components.push({
    type: "button_grid",
    columns: 6,
    buttons: increaseButtons,
  });

  // Row 2: Stat names and current values (display only)
  const statDisplayButtons = allStats.map((stat) => {
    // Use abbreviated stat names to prevent truncation
    const statAbbrev = stat.substring(0, 1) + ".";
    return {
      label: `${currentStats[stat] > 9 ? statAbbrev : stat} ${
        currentStats[stat]
      }`,
      value: `display_${stat}`,
      disabled: false, // Not disabled, but handled in choice logic
    };
  });
  //label: `${currentStats[stat]>9?statAbbrev:stat} ${currentStats[stat]}`
  components.push({
    type: "button_grid",
    columns: 6,
    buttons: statDisplayButtons,
  });

  // Row 3: Decrease buttons (arrow down symbols)
  const decreaseButtons = allStats.map((stat) => {
    const canDecrease = canDecreaseStat(currentStats, stat);
    const cost = Math.abs(
      calculateStatCost(currentStats[stat], currentStats[stat] - 1)
    );

    return {
      label: `⬇️ ${cost}`,
      value: `decrease_${stat}`,
      disabled: !canDecrease,
    };
  });

  components.push({
    type: "button_grid",
    columns: 6,
    buttons: decreaseButtons,
  });

  const statEmojiButtons = allStats.map((stat) => {
    return {
      label: `${statEmoji[stat]}`,
      value: `display_${stat}`,
      disabled: false, // Not disabled, but handled in choice logic
    };
  });

  components.push({
    type: "button_grid",
    columns: 6,
    buttons: statEmojiButtons,
  });

  components.push(createMessage(`Remaining Points: ${remainingPoints}`));

  components.push(createRandomButton("🎲 Random Allocation"));

  components.push({
    type: "button",
    label: "✅ Continue",
    value: "continue",
  });

  components.push(createBackButton());

  const choice = await getShowChoiceDialog(message, components);
  const choiceValue = getDialogValue(choice, "value");

  if (choiceValue === "random") {
    // Generate new random stats and stay in the allocation dialog
    const newRandomStats = proceduralGeneration.generateRandomStats();
    const newRemainingPoints =
      statGeneration.calculateRemainingPoints(newRandomStats);

    return await handleStatsAllocationWithState(
      newRandomStats,
      newRemainingPoints,
      nameResult,
      raceResult,
      sexResult,
      classResult
    );
  } else if (choiceValue === "continue") {
    return currentStats;
  } else if (choiceValue && choiceValue.startsWith("increase_")) {
    const stat = choiceValue.replace("increase_", "");
    const result = increaseStat(currentStats, stat, remainingPoints);
    if (result.success) {
      return await handleStatsAllocationWithState(
        result.newStats,
        result.newRemainingPoints,
        nameResult,
        raceResult,
        sexResult,
        classResult
      );
    }
  } else if (choiceValue && choiceValue.startsWith("decrease_")) {
    const stat = choiceValue.replace("decrease_", "");
    const result = decreaseStat(currentStats, stat, remainingPoints);
    if (result.success) {
      return await handleStatsAllocationWithState(
        result.newStats,
        result.newRemainingPoints,
        nameResult,
        raceResult,
        sexResult,
        classResult
      );
    }
  } else if (choiceValue && choiceValue.startsWith("display_")) {
    // Display buttons are not interactive, just refresh the dialog
    return await handleStatsAllocationWithState(
      currentStats,
      remainingPoints,
      nameResult,
      raceResult,
      sexResult,
      classResult
    );
  } else if (choiceValue === "back") {
    // Go back to class selection (reset class selection)
    return "back";
  }

  // If no valid action was taken, go back to class selection (reset class selection)
  return "back";
}
