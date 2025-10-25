// Navigation utility functions for character creation dialogs

/**
 * Create a standard back button component
 * @returns {Object} Back button component
 */
export function createBackButton() {
  return {
    type: "button",
    label: "❌ Back",
    value: "back",
  };
}

export function createReloadButton() {
  return {
    type: "button",
    label: "❌ Back to Start Menu",
    value: "reload",
  };
}

/**
 * Create a standard continue button component
 * @param {boolean} enabled - Whether the button should be enabled
 * @returns {Object} Continue button component
 */
export function createContinueButton(enabled = true) {
  return {
    type: "button",
    label: "✅ Continue",
    value: "continue",
    disabled: !enabled,
  };
}

/**
 * Create a random generation button component
 * @param {string} label - Label for the random button
 * @returns {Object} Random button component
 */
export function createRandomButton(label = "🎲 Random") {
  return {
    type: "button",
    label: label,
    value: "random",
  };
}

/**
 * Create a custom input component
 * @param {string} label - Label for the input
 * @param {string} value - Value identifier for the input
 * @returns {Object} Input component
 */
export function createCustomInput(label, value) {
  return {
    type: "input",
    label: label,
    value: value,
  };
}

/**
 * Create a message component
 * @param {string} label - Message text
 * @returns {Object} Message component
 */
export function createMessage(label) {
  return {
    type: "message",
    label: label,
    value: "",
  };
}

/**
 * Handle back navigation logic
 * @param {string} currentStep - Current step identifier
 * @param {Object} context - Context object with step data
 * @returns {string|Function} Next step or function to call
 */
export function handleBackNavigation(currentStep, context) {
  switch (currentStep) {
    case "sex-selection":
      return "race-selection";
    case "name-selection":
      return "sex-selection";
    case "class-selection":
      return "name-selection";
    case "stats-allocation":
      return "class-selection";
    case "character-preview":
      return context.generationMethod === "custom"
        ? "stats-allocation"
        : "random-generation";
    default:
      return "character-generation";
  }
}

/**
 * Create a "more" button for additional options
 * @param {string} label - Label for the more button
 * @param {string} value - Value for the more button
 * @returns {Object} More button component
 */
export function createMoreButton(label, value) {
  return {
    type: "button",
    label: label,
    value: value,
  };
}
