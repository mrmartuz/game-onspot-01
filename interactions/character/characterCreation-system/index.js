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
import {
  CharacterCreationState,
  NavigationResult,
  createNavigationResult,
} from "./state.js";
import {
  validateRaceSelection,
  validateSexSelection,
  validateNameResult,
  validateClassSelection,
  validateStatsResult,
} from "./validation.js";
import { classDatabase } from "../../../interactions/combat/classes.js";

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
 * Handle custom character creation flow with state management
 * @param {CharacterCreationState} state - Character creation state (optional)
 * @returns {Promise<Object|string>} Generated character or navigation result
 */
async function handleCustomCreation(state = new CharacterCreationState()) {
  // Set generation method if not already set
  if (!state.getGenerationMethod()) {
    state.setGenerationMethod("custom");
  }

  // Step 1: Race Selection
  let raceResult = state.getRace();
  if (!raceResult) {
    raceResult = await handleRaceSelection();
    if (raceResult === "back") return "back";

    // Validate race selection
    if (!validateRaceSelection(raceResult)) {
      console.error("Invalid race selection:", raceResult);
      return "back";
    }

    state.setRace(raceResult);
  }

  // Step 2: Sex Selection
  let sexResult = state.getSex();
  if (!sexResult) {
    sexResult = await handleSexSelectionStep(raceResult, state);
    if (sexResult === "back") {
      state.resetFromStep("race");
      return await handleCustomCreation(state);
    }

    // Validate sex selection
    if (!validateSexSelection(sexResult)) {
      console.error("Invalid sex selection:", sexResult);
      return "back";
    }

    state.setSex(sexResult);
  }

  // Step 3: Name Selection
  let nameResult = state.getName();
  if (!nameResult) {
    nameResult = await handleNameSelectionStep(raceResult, sexResult, state);
    if (nameResult === "back") {
      state.resetFromStep("sex");
      return await handleCustomCreation(state);
    }

    // Validate name result
    if (!validateNameResult(nameResult)) {
      console.error("Invalid name result:", nameResult);
      return "back";
    }

    state.setName(nameResult);
  }

  // Step 4: Class Selection
  let classResult = state.getClass();
  if (!classResult) {
    classResult = await handleClassSelectionStep(
      nameResult,
      raceResult,
      sexResult,
      state
    );
    if (classResult === "back") {
      state.resetFromStep("name");
      return await handleCustomCreation(state);
    }

    // Validate class selection
    if (!validateClassSelection(classResult, classDatabase)) {
      console.error("Invalid class selection:", classResult);
      return "back";
    }

    state.setClass(classResult);
  }

  // Step 5: Stats Allocation
  let statsResult = state.getStats();
  if (!statsResult) {
    statsResult = await handleStatsAllocationStep(
      nameResult,
      raceResult,
      sexResult,
      classResult,
      state
    );
    if (statsResult === "back") {
      state.resetFromStep("class");
      return await handleCustomCreation(state);
    }

    // Validate stats result
    if (!validateStatsResult(statsResult)) {
      console.error("Invalid stats result:", statsResult);
      return "back";
    }

    state.setStats(statsResult);
  }

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

  // Handle navigation results from preview
  if (result && result.action === "accept") {
    return result; // Return the accepted character
  }

  // Handle back navigation from preview
  if (result && result.action === NavigationResult.BACK_TO_STATS) {
    // Go back to stats allocation with preserved data
    state.resetFromStep("stats");
    return await handleCustomCreation(state);
  }

  // Handle regenerate from preview
  if (result && result.action === NavigationResult.REGENERATE) {
    // Regenerate character with same selections but new stats/equipment
    state.resetFromStep("stats");
    return await handleCustomCreation(state);
  }

  // Handle back to main menu
  if (result && result.action === NavigationResult.BACK_TO_MAIN) {
    return "back";
  }

  return result; // Return other results
}

/**
 * Handle sex selection step with proper back navigation
 * @param {string} raceResult - Selected race
 * @param {CharacterCreationState} state - Character creation state
 * @returns {Promise<string>} Selected sex or navigation result
 */
async function handleSexSelectionStep(raceResult, state) {
  const sexResult = await handleSexSelection(raceResult);
  if (sexResult === "back") {
    // Go back to race selection
    return "back";
  }
  return sexResult;
}

/**
 * Handle name selection step with proper back navigation
 * @param {string} raceResult - Selected race
 * @param {string} sexResult - Selected sex
 * @param {CharacterCreationState} state - Character creation state
 * @returns {Promise<Object|string>} Name result or navigation result
 */
async function handleNameSelectionStep(raceResult, sexResult, state) {
  const nameResult = await handleNameSelection(raceResult, sexResult);
  if (nameResult === "back") {
    // Go back to sex selection
    return "back";
  }
  return nameResult;
}

/**
 * Handle class selection step with proper back navigation
 * @param {Object} nameResult - Name selection result
 * @param {string} raceResult - Selected race
 * @param {string} sexResult - Selected sex
 * @param {CharacterCreationState} state - Character creation state
 * @returns {Promise<string>} Selected class or navigation result
 */
async function handleClassSelectionStep(
  nameResult,
  raceResult,
  sexResult,
  state
) {
  const classResult = await handleClassSelection(
    nameResult,
    raceResult,
    sexResult
  );
  if (classResult === "back") {
    // Go back to name selection
    return "back";
  }
  return classResult;
}

/**
 * Handle stats allocation step with proper back navigation
 * @param {Object} nameResult - Name selection result
 * @param {string} raceResult - Selected race
 * @param {string} sexResult - Selected sex
 * @param {string} classResult - Selected class
 * @param {CharacterCreationState} state - Character creation state
 * @returns {Promise<Object|string>} Stats result or navigation result
 */
async function handleStatsAllocationStep(
  nameResult,
  raceResult,
  sexResult,
  classResult,
  state
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
    return "back";
  }
  return statsResult;
}

// Export main dialog function as default
export default showCharacterGenerationDialog;
