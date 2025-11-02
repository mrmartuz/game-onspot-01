// Combat state management
// Centralized state object for combat system

// Combat phases enum
export const COMBAT_PHASES = {
  DETECTION: "detection",
  ENGAGEMENT: "engagement",
  COMBAT: "combat",
  RESOLUTION: "resolution",
  NONE: "none",
};

// Initial combat state structure
export function createInitialCombatState() {
  return {
    phase: COMBAT_PHASES.DETECTION,
    allies: [],
    monsters: [],
    positions: { allies: {}, monsters: {} }, // Track grid positions
    turnCount: 0,
    playerDetected: false,
    enemiesDetected: false,
    initiativeOrder: [],
    currentTurn: 0,
    combatActive: false,
    playerEngagementBonus: null,
    enemyEngagementBonus: null,
    enemyEngagementChoice: null,
  };
}

// Global combat state instance
let combatState = createInitialCombatState();

// Get current combat state
export function getCombatState() {
  return combatState;
}

// Reset combat state to initial values
export function resetCombatState() {
  combatState = createInitialCombatState();
  return combatState;
}

// Update combat state (safe setter)
export function updateCombatState(updates) {
  combatState = { ...combatState, ...updates };
  return combatState;
}

// Set a specific property in combat state
export function setCombatStateProperty(key, value) {
  combatState[key] = value;
  return combatState;
}

// Get a specific property from combat state
export function getCombatStateProperty(key) {
  return combatState[key];
}


