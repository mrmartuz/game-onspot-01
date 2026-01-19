// State management for character creation system
// Handles preservation of user selections during navigation

/**
 * Character creation state management class
 * Preserves user selections during back/forward navigation
 */
export class CharacterCreationState {
  constructor() {
    this.race = null;
    this.sex = null;
    this.name = null;
    this.class = null;
    this.stats = null;
    this.generationMethod = null;
  }

  // Setters
  setRace(race) {
    this.race = race;
  }

  setSex(sex) {
    this.sex = sex;
  }

  setName(name) {
    this.name = name;
  }

  setClass(className) {
    this.class = className;
  }

  setStats(stats) {
    this.stats = stats;
  }

  setGenerationMethod(method) {
    this.generationMethod = method;
  }

  // Getters
  getRace() {
    return this.race;
  }

  getSex() {
    return this.sex;
  }

  getName() {
    return this.name;
  }

  getClass() {
    return this.class;
  }

  getStats() {
    return this.stats;
  }

  getGenerationMethod() {
    return this.generationMethod;
  }

  // State validation
  hasRace() {
    return this.race !== null;
  }

  hasSex() {
    return this.sex !== null;
  }

  hasName() {
    return this.name !== null && this.name.firstName && this.name.lastName;
  }

  hasClass() {
    return this.class !== null;
  }

  hasStats() {
    return this.stats !== null;
  }

  hasCompleteData() {
    return (
      this.hasRace() &&
      this.hasSex() &&
      this.hasName() &&
      this.hasClass() &&
      this.hasStats()
    );
  }

  // State management
  reset() {
    this.race = null;
    this.sex = null;
    this.name = null;
    this.class = null;
    this.stats = null;
    this.generationMethod = null;
  }

  resetFromStep(step) {
    // Reset state from a specific step onwards
    switch (step) {
      case "race":
        this.reset();
        break;
      case "sex":
        this.sex = null;
        this.name = null;
        this.class = null;
        this.stats = null;
        break;
      case "name":
        this.name = null;
        this.class = null;
        this.stats = null;
        break;
      case "class":
        this.class = null;
        this.stats = null;
        break;
      case "stats":
        this.stats = null;
        break;
    }
  }

  // Serialization for debugging
  toJSON() {
    return {
      race: this.race,
      sex: this.sex,
      name: this.name,
      class: this.class,
      stats: this.stats,
      generationMethod: this.generationMethod,
    };
  }

  // Create from existing data
  static fromData(data) {
    const state = new CharacterCreationState();
    if (data.race) state.setRace(data.race);
    if (data.sex) state.setSex(data.sex);
    if (data.name) state.setName(data.name);
    if (data.class) state.setClass(data.class);
    if (data.stats) state.setStats(data.stats);
    if (data.generationMethod) state.setGenerationMethod(data.generationMethod);
    return state;
  }
}

/**
 * Navigation result types for character creation
 */
export const NavigationResult = {
  BACK_TO_RACE: "back_to_race",
  BACK_TO_SEX: "back_to_sex",
  BACK_TO_NAME: "back_to_name",
  BACK_TO_CLASS: "back_to_class",
  BACK_TO_STATS: "back_to_stats",
  REGENERATE: "regenerate",
  ACCEPT: "accept",
  BACK_TO_MAIN: "back_to_main",
};

/**
 * Create a navigation result object
 * @param {string} action - The navigation action
 * @param {Object} data - Additional data to preserve
 * @returns {Object} Navigation result object
 */
export function createNavigationResult(action, data = {}) {
  return {
    action,
    ...data,
  };
}
