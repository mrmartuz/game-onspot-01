export const gameState = {
  px: 0,
  py: 0,
  prevx: 0,
  prevy: 0,
  name: "",
  groupName: "",
  mapType: "regional", // globla, regional, local
  visited: new Set(),
  cachedTiles: new Map(), // {x, y, tile}
  cameraX: 0,
  cameraY: 0,
  changed: [], // {x, y, type}
  killed: new Set(),
  seed: Math.floor(Math.random() * 1000000000), // Randomized seed for procedural generation
  viewWidth: 21,
  viewHeight: 21,
  viewDist: 3,
  cooldown: false,
  health: 100,
  gold: 20 + Math.floor(Math.random() * 10),
  food: 12 + Math.floor(Math.random() * 7),
  water: 13 + Math.floor(Math.random() * 9),
  tents: 0,
  building_mats: 0,
  wood: 0,
  carts: 0,

  // Character System - Phase 2.1 Migration
  playerCharacter: null, // Full character object for the player (separate from group)
  group: [], // Array of full character objects for NPC companions only

  // NPC Character Storage System - Phase 3.1.8 Persistent Character Storage
  npcCharacters: [], // Array of NPC character objects with position and persistence data
  // Structure: [{ character: {...}, position: {x, y, locationType}, migrationCount: 0, isPersistent: false }]

  // Monster Head Loot System
  monsterHeads: [], // Array of {race, rarity, level, inventorySize, timestamp, id}

  // Group Inventory System - Stores unequipped items from all characters
  groupInventory: [], // Array of equipment item strings

  groupBonus: {
    navigation: 0,
    discovery: 0,
    food: 0,
    combat: 0,
    resource: 0,
    plant: 0,
    interact: 0,
    carry: 0,
    health: 0,
    view: 0,
  },
  discoverPoints: 0,
  killPoints: 0,
  events: [],
  discoveredLocations: [], // Track discovered locations separately from event logs
  clearedLocations: [], // Track cleared locations/rooms with state
  // Structure: [{x, y, locationType, behaviorType, totalRooms, clearedRooms: boolean[], bossAlive, bossType, lastCheck, lastCleared, stashCollected}]
  moving: false,
  moveStartTime: 0,
  moveDuration: 0,
  moveDx: 0,
  moveDy: 0,
  tileSize: 50,
  spriteSizeLocation: 40,
  spriteSizeEntity: 24,
  spriteSizeFlora: 20,
  offsetX: 0,
  offsetY: 0,
  last_consume_time: Date.now(),
  last_consume_game_time: undefined, // Game time (with offset) of last consumption check
  timeOffset: 0, // Manual time adjustments in milliseconds (for actions like rest)

  // Time-based color system
  currentTimeOfDay: "day", // "night", "sunrise", "day", "sunset"
  nextTimeOfDay: "day", // Next time period in the cycle
  transitionFactor: 0.0, // 0.0 = pure current period, 1.0 = pure next period
  lastTimeUpdate: -1, // Last hour checked to detect time changes
  lastWeeklyCheck: null, // Timestamp of last weekly check for location refills
};

// Character ID generation system - Phase 2.1 Migration
export function generateCharacterId() {
  // Timestamp-based IDs allow for future smart systems (sorting by creation time, tracking character age, etc.)
  return `char_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

// Time system constants (unchanged, as they're immutable)
export const game_start_real = Date.now();
export const game_start_date = new Date(
  `${(Math.floor(Math.random() * 300) + Math.floor(Math.random() * 300))
    .toString()
    .padStart(4, "0")}-${(Math.floor(Math.random() * 12) + 1)
    .toString()
    .padStart(2, "0")}-${(Math.floor(Math.random() * 28) + 1)
    .toString()
    .padStart(2, "0")}T${Math.floor(Math.random() * 24)
    .toString()
    .padStart(2, "0")}:00:00`
);
export const acceleration = 720; // 1 game day per 2 real minutes (86400 seconds / 120 seconds = 720)

// Location tracking helper functions

/**
 * Add a cleared location entry
 * @param {Object} locationData - Location data object
 */
export function addClearedLocation(locationData) {
  if (!gameState.clearedLocations) {
    gameState.clearedLocations = [];
  }
  
  // Check if location already exists
  const existing = getClearedLocation(locationData.x, locationData.y);
  if (existing) {
    updateClearedLocation(locationData.x, locationData.y, locationData);
    return;
  }
  
  gameState.clearedLocations.push({
    x: locationData.x,
    y: locationData.y,
    locationType: locationData.locationType,
    behaviorType: locationData.behaviorType,
    totalRooms: locationData.totalRooms,
    clearedRooms: locationData.clearedRooms || [],
    bossAlive: locationData.bossAlive !== undefined ? locationData.bossAlive : true,
    bossType: locationData.bossType || null,
    lastCheck: locationData.lastCheck || Date.now(),
    lastCleared: locationData.lastCleared || null,
    stashCollected: locationData.stashCollected || false,
  });
}

/**
 * Update an existing cleared location
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {Object} updates - Partial location data to update
 */
export function updateClearedLocation(x, y, updates) {
  if (!gameState.clearedLocations) {
    return;
  }
  
  const location = getClearedLocation(x, y);
  if (!location) {
    return;
  }
  
  Object.assign(location, updates);
}

/**
 * Remove a cleared location from tracking
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 */
export function removeClearedLocation(x, y) {
  if (!gameState.clearedLocations) {
    return;
  }
  
  gameState.clearedLocations = gameState.clearedLocations.filter(
    loc => !(loc.x === x && loc.y === y)
  );
}

/**
 * Get a cleared location entry
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {Object} Location data or null
 */
export function getClearedLocation(x, y) {
  if (!gameState.clearedLocations) {
    return null;
  }
  
  return gameState.clearedLocations.find(
    loc => loc.x === x && loc.y === y
  ) || null;
}
