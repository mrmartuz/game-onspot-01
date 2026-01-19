// Input validation for character creation system
import { BASIC_RACES } from "./constants.js";

/**
 * Validate race selection
 * @param {string} race - Selected race
 * @returns {boolean} True if valid race
 */
export function validateRaceSelection(race) {
  if (!race || typeof race !== "string") {
    return false;
  }
  return BASIC_RACES.includes(race);
}

/**
 * Validate sex selection
 * @param {string} sex - Selected sex
 * @returns {boolean} True if valid sex
 */
export function validateSexSelection(sex) {
  return sex === "male" || sex === "female";
}

/**
 * Validate name result object
 * @param {Object} nameResult - Name selection result
 * @returns {boolean} True if valid name result
 */
export function validateNameResult(nameResult) {
  if (!nameResult || typeof nameResult !== "object") {
    return false;
  }

  const { firstName, lastName } = nameResult;

  if (!firstName || !lastName) {
    return false;
  }

  if (typeof firstName !== "string" || typeof lastName !== "string") {
    return false;
  }

  if (firstName.trim().length === 0 || lastName.trim().length === 0) {
    return false;
  }

  return true;
}

/**
 * Validate class selection
 * @param {string} className - Selected class name
 * @param {Object} classDatabase - Class database to validate against
 * @returns {boolean} True if valid class
 */
export function validateClassSelection(className, classDatabase) {
  if (!className || typeof className !== "string") {
    return false;
  }

  if (!classDatabase || typeof classDatabase !== "object") {
    return false;
  }

  return className in classDatabase;
}

/**
 * Validate stats result object
 * @param {Object} stats - Stats allocation result
 * @returns {boolean} True if valid stats
 */
export function validateStatsResult(stats) {
  if (!stats || typeof stats !== "object") {
    return false;
  }

  const requiredStats = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];

  for (const stat of requiredStats) {
    if (!(stat in stats)) {
      return false;
    }

    if (typeof stats[stat] !== "number") {
      return false;
    }

    if (stats[stat] < 8) {
      return false;
    }
  }

  return true;
}

/**
 * Validate character creation state
 * @param {CharacterCreationState} state - Character creation state
 * @returns {Object} Validation result with isValid and errors
 */
export function validateCharacterCreationState(state) {
  const errors = [];

  if (!state.hasRace()) {
    errors.push("Race not selected");
  } else if (!validateRaceSelection(state.getRace())) {
    errors.push("Invalid race selection");
  }

  if (!state.hasSex()) {
    errors.push("Sex not selected");
  } else if (!validateSexSelection(state.getSex())) {
    errors.push("Invalid sex selection");
  }

  if (!state.hasName()) {
    errors.push("Name not selected");
  } else if (!validateNameResult(state.getName())) {
    errors.push("Invalid name selection");
  }

  if (!state.hasClass()) {
    errors.push("Class not selected");
  }

  if (!state.hasStats()) {
    errors.push("Stats not allocated");
  } else if (!validateStatsResult(state.getStats())) {
    errors.push("Invalid stats allocation");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate navigation result
 * @param {Object} result - Navigation result object
 * @returns {boolean} True if valid navigation result
 */
export function validateNavigationResult(result) {
  if (!result || typeof result !== "object") {
    return false;
  }

  if (!result.action || typeof result.action !== "string") {
    return false;
  }

  const validActions = [
    "back_to_race",
    "back_to_sex",
    "back_to_name",
    "back_to_class",
    "back_to_stats",
    "regenerate",
    "accept",
    "back_to_main",
  ];

  return validActions.includes(result.action);
}
