// Location rules database
// Defines room count ranges, tier distributions, and location-specific spawn rules

// Location type mappings
// Maps location type strings to behavior types
export const LOCATION_BEHAVIOR_MAP = {
  "cave": "beast-cave", // Natural dwellings, can be beast or other
  "monster caves": "monster-cave",
  "monster-cave": "monster-cave",
  "volcano": "dragon-cave", // Volcano locations are treated as dragon caves
};

// Room count ranges per location type
export const locationRoomRanges = {
  "cave": { min: 1, max: 5 }, // Caves: 1-5 rooms
  "monster-cave": { min: 4, max: 10 }, // Monster-caves: 4-10 rooms
  "dragon-cave": { min: 3, max: 8 }, // Dragon caves (volcanoes): 3-8 rooms
  "beast-cave": { min: 1, max: 3 }, // Beast caves: 1-3 rooms
};

// Tier distribution for rooms
// Rooms are distributed: 1/3 early tier, 1/3 mid tier, 1/3 late tier + final boss
export function getRoomTier(roomIndex, totalRooms) {
  // Last room is always the boss room (late tier)
  if (roomIndex === totalRooms - 1) {
    return "late";
  }
  
  // Calculate tier distribution
  const earlyCount = Math.floor((totalRooms - 1) / 3);
  const midCount = Math.floor((totalRooms - 1) / 3);
  const lateCount = (totalRooms - 1) - earlyCount - midCount;
  
  if (roomIndex < earlyCount) {
    return "early";
  } else if (roomIndex < earlyCount + midCount) {
    return "mid";
  } else {
    return "late";
  }
}

/**
 * Get room count range for a location type
 * @param {string} locationType - Location type ("cave", "monster-cave", "volcano", etc.)
 * @returns {Object} {min, max} room count range
 */
export function getRoomCountRange(locationType) {
  const behaviorType = getLocationBehaviorType(locationType);
  return locationRoomRanges[behaviorType] || locationRoomRanges["cave"];
}

/**
 * Get the behavior type for a location
 * Maps location types to their behavior (e.g., "volcano" -> "dragon-cave")
 * @param {string} locationType - Raw location type from game
 * @returns {string} Behavior type ("cave", "monster-cave", "dragon-cave", "beast-cave")
 */
export function getLocationBehaviorType(locationType) {
  if (!locationType) return "cave";
  
  // Check direct mapping
  if (LOCATION_BEHAVIOR_MAP[locationType]) {
    return LOCATION_BEHAVIOR_MAP[locationType];
  }
  
  // Check if it's already a behavior type
  if (["cave", "monster-cave", "dragon-cave", "beast-cave"].includes(locationType)) {
    return locationType;
  }
  
  // Default to cave
  return "cave";
}

// Location-specific spawn rules
export const locationSpawnRules = {
  "dragon-cave": {
    // Dragon caves (volcanoes) have special spawn rules
    // Can be: single dragon, dragon + servitude (goblins/kobolds), or adult/ancient/elder + hatchlings
    possibleCompositions: [
      "single_dragon", // Just a dragon
      "dragon_servitude", // Dragon + goblins/kobolds
      "dragon_hatchlings", // Adult/ancient/elder dragon + young dragons
    ],
    // Weight for each composition type
    compositionWeights: {
      single_dragon: 0.30,
      dragon_servitude: 0.50, // Most common
      dragon_hatchlings: 0.20,
    },
  },
  
  "beast-cave": {
    // Beast caves spawn mixed beast groups (same species only)
    groupType: "mixed_beast",
    // Can have different beast types, but same species groups
    possibleBeasts: ["Wolf", "Bear", "MountainLion"],
  },
  
  "monster-cave": {
    // Monster-caves use standard group type weights
    useStandardWeights: true,
  },
  
  "cave": {
    // Regular caves can be various types
    useStandardWeights: true,
  },
};

/**
 * Get spawn rules for a location type
 * @param {string} locationType - Location type
 * @returns {Object} Spawn rules for that location
 */
export function getLocationSpawnRules(locationType) {
  const behaviorType = getLocationBehaviorType(locationType);
  return locationSpawnRules[behaviorType] || locationSpawnRules["cave"];
}

/**
 * Select a composition type for dragon caves based on weights
 * @param {number} randomValue - Random value 0-1
 * @returns {string} Composition type
 */
export function selectDragonCaveComposition(randomValue) {
  const weights = locationSpawnRules["dragon-cave"].compositionWeights;
  const random = randomValue || Math.random();
  let cumulative = 0;
  
  for (const [composition, weight] of Object.entries(weights)) {
    cumulative += weight;
    if (random <= cumulative) {
      return composition;
    }
  }
  
  return "dragon_servitude"; // Default
}

/**
 * Check if a location type is a special location (dragon-cave, beast-cave)
 * @param {string} locationType - Location type
 * @returns {boolean}
 */
export function isSpecialLocation(locationType) {
  const behaviorType = getLocationBehaviorType(locationType);
  return behaviorType === "dragon-cave" || behaviorType === "beast-cave";
}

/**
 * Get all room indices for a location
 * @param {number} totalRooms - Total number of rooms
 * @returns {Array<number>} Array of room indices (0-based)
 */
export function getAllRoomIndices(totalRooms) {
  return Array.from({ length: totalRooms }, (_, i) => i);
}

/**
 * Check if a room is the boss room (final room)
 * @param {number} roomIndex - Room index (0-based)
 * @param {number} totalRooms - Total number of rooms
 * @returns {boolean}
 */
export function isBossRoom(roomIndex, totalRooms) {
  return roomIndex === totalRooms - 1;
}



