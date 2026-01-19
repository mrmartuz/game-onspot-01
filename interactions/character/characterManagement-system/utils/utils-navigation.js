// Navigation utility functions for character management dialogs

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

/**
 * Create a standard close button component
 * @returns {Object} Close button component
 */
export function createCloseButton() {
  return {
    type: "button",
    label: "❌ Close",
    value: "close",
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
 * Create a character navigator component for switching between characters
 * @param {Object} character - Current character object
 * @param {number} currentIndex - Current index in character list
 * @param {number} totalCount - Total number of characters
 * @param {Object} raceEmoji - Race emoji mapping object
 * @returns {Object} Character navigator component
 */
export function createCharacterNavigator(
  character,
  currentIndex,
  totalCount,
  raceEmoji
) {
  const raceEmojiIcon = raceEmoji[character.race] || "👤";
  const canGoPrevious = totalCount > 1 && currentIndex > 0;
  const canGoNext = totalCount > 1 && currentIndex < totalCount - 1;

  return {
    type: "character_navigator",
    character: character,
    currentIndex: currentIndex,
    totalCount: totalCount,
    onPrevious: "nav_previous",
    onNext: "nav_next",
    raceEmoji: raceEmoji,
    canGoPrevious: canGoPrevious,
    canGoNext: canGoNext,
  };
}
