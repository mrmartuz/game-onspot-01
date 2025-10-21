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
  food: 10 + Math.floor(Math.random() * 5),
  water: 10 + Math.floor(Math.random() * 5),
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
