// Main character creation system entry point
import { getShowChoiceDialog, getDialogValue } from "../../../interactions.js";
import characterGeneration from "../generation.js";
import { createMessage, createReloadButton } from "./utils/utils-navigation.js";
import { handleRandomGeneration } from "./steps/random-generation.js";
import { handleRaceSelection } from "./steps/race-selection.js";
import { handleSexSelection } from "./steps/sex-selection.js";
import { handleNameSelection } from "./steps/name-selection.js";
import { handleClassSelection } from "./steps/class-selection.js";
import { handleStatsAllocationWithState } from "./steps/stats-allocation.js";
import { showCharacterPreview } from "./steps/character-preview.js";
import { statGeneration } from "../stats.js";

/**
 * Main character generation dialog entry point
 * @returns {Promise<Object|string>} Generated character or navigation result
 */
export async function showCharacterGenerationDialog() {
  const message = "🎭 CHARACTER GENERATION";
  let components = [];

  // Character creation options
  components.push(
    createMessage(
      "Choose your character creation method.\n You can either create a 🎲 Random character or create a 🎯 Custom character.\n\n Random character will have a larger pool of choice for the race, class, name, stats, skills, and equipment. Even uncommon or rare ones will be available in the random generation."
    )
  );

  components.push({
    type: "button",
    label: "🎲 Random Generation",
    value: "random",
  });

  components.push({
    type: "button",
    label: "🎯 Custom Creation",
    value: "custom",
  });

  components.push(createReloadButton());

  const choice = await getShowChoiceDialog(message, components);
  const choiceValue = getDialogValue(choice, "value");

  console.log("the player chose:", choiceValue);
  switch (choiceValue) {
    case "random":
      return await handleRandomGeneration();
    case "custom":
      return await handleCustomCreation();
    case "back":
      return "back";
    case "reload":
      return "reload";
    default:
      return "back";
  }
}

/**
 * Handle custom character creation flow
 * @returns {Promise<Object|string>} Generated character or navigation result
 */
async function handleCustomCreation() {
  // Step 1: Race Selection
  const raceResult = await handleRaceSelection();
  if (raceResult === "back") return "back";

  // Step 2: Sex Selection
  const sexResult = await handleSexSelectionStep(raceResult);
  if (sexResult === "back") return "back";

  // Step 3: Name and Surname
  const nameResult = await handleNameSelectionStep(raceResult, sexResult);
  if (nameResult === "back") return "back";

  // Step 4: Class Selection (only common classes)
  const classResult = await handleClassSelectionStep(
    nameResult,
    raceResult,
    sexResult
  );
  if (classResult === "back") return "back";

  // Ensure classResult is valid
  if (!classResult || typeof classResult !== "string") {
    console.error("Invalid class result:", classResult);
    return "back";
  }

  // Step 5: Stats Allocation
  const statsResult = await handleStatsAllocationStep(
    nameResult,
    raceResult,
    sexResult,
    classResult
  );
  if (statsResult === "back") return "back";

  // Step 6: Create character and show preview
  const character = await characterGeneration.generateCharacter({
    firstName: nameResult.firstName,
    lastName: nameResult.lastName,
    raceName: raceResult,
    sex: sexResult,
    className: classResult,
    customStats: statsResult,
    isPlayer: true,
  });

  const result = await showCharacterPreview(
    character,
    "custom",
    statsResult,
    nameResult,
    raceResult,
    sexResult,
    classResult
  );

  // Check if character was accepted
  if (result && result.action === "accept") {
    return result; // Return the accepted character
  }

  // Handle back from preview - restart the entire custom creation flow
  if (result === "back") {
    return await handleCustomCreation();
  }

  return result; // Return other results (regenerate, etc.)
}

/**
 * Handle sex selection step with proper back navigation
 * @param {string} raceResult - Selected race
 * @returns {Promise<string>} Selected sex or navigation result
 */
async function handleSexSelectionStep(raceResult) {
  const sexResult = await handleSexSelection(raceResult);
  if (sexResult === "back") {
    // Go back to race selection
    return await handleCustomCreation();
  }
  return sexResult;
}

/**
 * Handle name selection step with proper back navigation
 * @param {string} raceResult - Selected race
 * @param {string} sexResult - Selected sex
 * @returns {Promise<Object|string>} Name result or navigation result
 */
async function handleNameSelectionStep(raceResult, sexResult) {
  const nameResult = await handleNameSelection(raceResult, sexResult);
  if (nameResult === "back") {
    // Go back to sex selection
    return await handleSexSelectionStep(raceResult);
  }
  return nameResult;
}

/**
 * Handle class selection step with proper back navigation
 * @param {Object} nameResult - Name selection result
 * @param {string} raceResult - Selected race
 * @param {string} sexResult - Selected sex
 * @returns {Promise<string>} Selected class or navigation result
 */
async function handleClassSelectionStep(nameResult, raceResult, sexResult) {
  const classResult = await handleClassSelection(
    nameResult,
    raceResult,
    sexResult
  );
  if (classResult === "back") {
    // Go back to name selection
    return await handleNameSelectionStep(raceResult, sexResult);
  }
  return classResult;
}

/**
 * Handle stats allocation step with proper back navigation
 * @param {Object} nameResult - Name selection result
 * @param {string} raceResult - Selected race
 * @param {string} sexResult - Selected sex
 * @param {string} classResult - Selected class
 * @returns {Promise<Object|string>} Stats result or navigation result
 */
async function handleStatsAllocationStep(
  nameResult,
  raceResult,
  sexResult,
  classResult
) {
  const statsResult = await handleStatsAllocationWithState(
    { ...statGeneration.baseStats },
    10,
    nameResult,
    raceResult,
    sexResult,
    classResult
  );
  if (statsResult === "back") {
    // Go back to class selection
    return await handleClassSelectionStep(nameResult, raceResult, sexResult);
  }
  return statsResult;
}

// Export main dialog function as default
export default showCharacterGenerationDialog;
