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
import { createStatDisplay } from "../utils/utils-ui.js";
import { STAT_CATEGORIES, DEFAULT_POINTS } from "../constants.js";
import {
  calculateStatCost,
  canIncreaseStat,
  canDecreaseStat,
  increaseStat,
  decreaseStat,
} from "../utils/utils-validation.js";


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
      `You have ${remainingPoints} points to allocate. Each point over 10 costs 2 points. Minimum stat value is 8.`
    )
  );

  // Show current stats using utility function
  const statDisplayComponents = createStatDisplay(
    currentStats,
    STAT_CATEGORIES
  );
  components.push(...statDisplayComponents);

  // Physical stats buttons in grid
  const physicalButtons = [];
  STAT_CATEGORIES.physical.forEach((stat) => {
    const canIncrease = canIncreaseStat(currentStats, stat, remainingPoints);
    const canDecrease = canDecreaseStat(currentStats, stat);

    physicalButtons.push({
      label: `+ ${stat} (${calculateStatCost(
        currentStats[stat],
        currentStats[stat] + 1
      )})`,
      value: `increase_${stat}`,
      disabled: !canIncrease,
      gridColumn: 1,
    });

    physicalButtons.push({
      label: `- ${stat} (${Math.abs(
        calculateStatCost(currentStats[stat], currentStats[stat] - 1)
      )})`,
      value: `decrease_${stat}`,
      disabled: !canDecrease,
      gridColumn: 1,
    });
  });

  components.push({
    type: "button_grid",
    buttons: physicalButtons,
  });

  // Mental stats buttons in grid
  const mentalButtons = [];
  STAT_CATEGORIES.mental.forEach((stat) => {
    const canIncrease = canIncreaseStat(currentStats, stat, remainingPoints);
    const canDecrease = canDecreaseStat(currentStats, stat);

    mentalButtons.push({
      label: `+ ${stat} (${calculateStatCost(
        currentStats[stat],
        currentStats[stat] + 1
      )})`,
      value: `increase_${stat}`,
      disabled: !canIncrease,
      gridColumn: 1,
    });

    mentalButtons.push({
      label: `- ${stat} (${Math.abs(
        calculateStatCost(currentStats[stat], currentStats[stat] - 1)
      )})`,
      value: `decrease_${stat}`,
      disabled: !canDecrease,
      gridColumn: 1,
    });
  });

  components.push({
    type: "button_grid",
    buttons: mentalButtons,
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
    // Generate random stats using the point allocation system
    return proceduralGeneration.generateRandomStats();
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
  } else if (choiceValue === "back") {
    // Go back to class selection (reset class selection)
    return "back";
  }

  // If no valid action was taken, go back to class selection (reset class selection)
  return "back";
}
