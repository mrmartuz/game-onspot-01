// Group composition rules database
// Defines race compatibility, group type weights, and leader mappings

// Race categories
export const RACE_CATEGORIES = {
  INTELLIGENT: "intelligent",
  BEAST: "beast",
  DEMON: "demon",
  DRAGON: "dragon",
};

// Race classification
export const raceCategories = {
  // Intelligent races (can mix with each other)
  Goblin: RACE_CATEGORIES.INTELLIGENT,
  Orc: RACE_CATEGORIES.INTELLIGENT,
  Troll: RACE_CATEGORIES.INTELLIGENT,
  Kobold: RACE_CATEGORIES.INTELLIGENT,
  
  // Beast races (cannot mix cross-species)
  Wolf: RACE_CATEGORIES.BEAST,
  Bear: RACE_CATEGORIES.BEAST,
  MountainLion: RACE_CATEGORIES.BEAST,
  
  // Demon races (only mix with demons)
  Demon: RACE_CATEGORIES.DEMON,
  
  // Dragon races (special category)
  Dragon: RACE_CATEGORIES.DRAGON,
};

// Race compatibility matrix for mixed intelligent groups
// Defines which intelligent races can mix together
export const raceCompatibilityMatrix = {
  Goblin: ["Goblin", "Orc", "Troll", "Kobold", "Dragon"], // Goblins can serve dragons
  Orc: ["Goblin", "Orc", "Troll", "Kobold"],
  Troll: ["Goblin", "Orc", "Troll", "Kobold"],
  Kobold: ["Goblin", "Orc", "Troll", "Kobold", "Dragon"], // Kobolds can serve dragons
  Dragon: ["Goblin", "Kobold"], // Dragons only with servitude races
};

// Leader class mappings per race
// Maps race to possible leader variants (classes that indicate leadership)
export const leaderClassMappings = {
  Goblin: ["shaman", "chief", "necromancer"], // goblin_shaman, goblin_chief
  Orc: ["chief", "warrior", "raider"], // orc_chief, orc_warrior, orc_raider
  Troll: ["chief", "warrior", "elder"], // troll_chief, troll_warrior, troll_elder
  Kobold: ["shaman", "chief"], // kobold_shaman, kobold_chief
  Wolf: ["Alpha", "Elder"], // wolf_alpha, wolf_dire (elder class)
  Bear: ["Elder"], // bear_grizzly (elder class)
  MountainLion: ["hunter", "Adult"], // mountain_lion_hunter, mountain_lion_adult
  Demon: ["lord", "general", "reaper"], // demon_lord, general, reaper
  Dragon: ["Adult", "Ancient", "Ancient"], // dragon_adult, dragon_ancient
};

// Group type definitions
export const GROUP_TYPES = {
  LEADER: "leader",
  MIXED_INTELLIGENT: "mixed_intelligent",
  MIXED_DIFFERENT: "mixed_different",
  MIXED_BEAST: "mixed_beast",
  REGULAR_INTELLIGENT: "regular_intelligent", // Single intelligent race, no leader
  REGULAR_BEAST: "regular_beast", // Single beast race, no leader
};

// Group type weights for entities (monster/beast on regional map)
export const entityGroupTypeWeights = {
  // When encountering "beast" entity
  beast: {
    [GROUP_TYPES.REGULAR_BEAST]: 0.70, // 70% beast only
    [GROUP_TYPES.MIXED_BEAST]: 0.00, // 0% mixed beast (beasts don't mix cross-species)
    [GROUP_TYPES.REGULAR_BEAST + "_leader"]: 0.20, // 20% beast with leader
    [GROUP_TYPES.MIXED_DIFFERENT]: 0.10, // 10% other (could be intelligent + beast encounter)
  },
  
  // When encountering "monster" entity
  monster: {
    [GROUP_TYPES.LEADER]: 0.10, // 10% leader groups
    [GROUP_TYPES.MIXED_INTELLIGENT]: 0.30, // 30% mixed intelligent
    [GROUP_TYPES.REGULAR_INTELLIGENT]: 0.40, // 40% regular intelligent (single race)
    [GROUP_TYPES.MIXED_DIFFERENT]: 0.20, // 20% intelligent + creature (e.g., orcs + wolf)
  },
};

// Group type weights for locations (caves, monster-caves)
// Leaders are rarer in locations
export const locationGroupTypeWeights = {
  // For regular caves and monster-caves (not special types)
  default: {
    [GROUP_TYPES.LEADER]: 0.05, // 5% leader groups (rarer in locations)
    [GROUP_TYPES.MIXED_INTELLIGENT]: 0.30, // 30% mixed intelligent
    [GROUP_TYPES.REGULAR_INTELLIGENT]: 0.45, // 45% regular intelligent
    [GROUP_TYPES.MIXED_DIFFERENT]: 0.20, // 20% intelligent + creature
  },
  
  // For beast caves
  beast: {
    [GROUP_TYPES.REGULAR_BEAST]: 0.70,
    [GROUP_TYPES.REGULAR_BEAST + "_leader"]: 0.20,
    [GROUP_TYPES.MIXED_DIFFERENT]: 0.10,
  },
  
  // For dragon caves (volcano locations)
  dragon: {
    // Special logic handled separately - can be dragon + servitude or dragon + hatchlings
    [GROUP_TYPES.LEADER]: 0.40, // Dragons often appear as leaders
    [GROUP_TYPES.MIXED_INTELLIGENT]: 0.60, // Dragon + servitude (goblins/kobolds)
  },
};

// Helper functions

/**
 * Check if a race is intelligent
 * @param {string} race - Race name
 * @returns {boolean}
 */
export function isIntelligentRace(race) {
  return raceCategories[race] === RACE_CATEGORIES.INTELLIGENT;
}

/**
 * Check if a race is a beast
 * @param {string} race - Race name
 * @returns {boolean}
 */
export function isBeastRace(race) {
  return raceCategories[race] === RACE_CATEGORIES.BEAST;
}

/**
 * Check if a race is a demon
 * @param {string} race - Race name
 * @returns {boolean}
 */
export function isDemonRace(race) {
  return raceCategories[race] === RACE_CATEGORIES.DEMON;
}

/**
 * Check if a race is a dragon
 * @param {string} race - Race name
 * @returns {boolean}
 */
export function isDragonRace(race) {
  return raceCategories[race] === RACE_CATEGORIES.DRAGON;
}

/**
 * Check if two races can mix together
 * @param {string} race1 - First race name
 * @param {string} race2 - Second race name
 * @returns {boolean}
 */
export function canRacesMix(race1, race2) {
  // Same race always can mix
  if (race1 === race2) return true;
  
  // Demons only mix with demons
  if (isDemonRace(race1) || isDemonRace(race2)) {
    return isDemonRace(race1) && isDemonRace(race2);
  }
  
  // Dragons special case - can mix with goblins/kobolds (servitude)
  if (isDragonRace(race1)) {
    return race2 === "Goblin" || race2 === "Kobold";
  }
  if (isDragonRace(race2)) {
    return race1 === "Goblin" || race1 === "Kobold";
  }
  
  // Beasts cannot mix cross-species
  if (isBeastRace(race1) || isBeastRace(race2)) {
    // Can only mix if both are beasts AND same species
    return isBeastRace(race1) && isBeastRace(race2) && race1 === race2;
  }
  
  // Intelligent races check compatibility matrix
  if (isIntelligentRace(race1) && isIntelligentRace(race2)) {
    const compatible = raceCompatibilityMatrix[race1];
    return compatible && compatible.includes(race2);
  }
  
  // Intelligent + beast is allowed (mixed different type)
  if ((isIntelligentRace(race1) && isBeastRace(race2)) ||
      (isIntelligentRace(race2) && isBeastRace(race1))) {
    return true;
  }
  
  return false;
}

/**
 * Get leader types for a race
 * @param {string} race - Race name
 * @returns {Array<string>} Array of leader class names
 */
export function getLeaderTypes(race) {
  return leaderClassMappings[race] || [];
}

/**
 * Check if a class name indicates leadership
 * @param {string} className - Class name to check
 * @returns {boolean}
 */
export function isLeaderClass(className) {
  const leaderClasses = [
    "chief", "shaman", "Alpha", "Elder", "lord", "general", "reaper",
    "warrior", "raider", "hunter", "Adult", "Ancient"
  ];
  return leaderClasses.some(leaderClass => 
    className && className.toLowerCase().includes(leaderClass.toLowerCase())
  );
}

/**
 * Get group type weights based on entity type or location type
 * @param {string} encounterType - "beast" | "monster" | "cave" | "monster-cave" | "dragon-cave" | "beast-cave"
 * @returns {Object} Group type weights
 */
export function getGroupTypeWeights(encounterType) {
  // Entity encounters
  if (encounterType === "beast") {
    return entityGroupTypeWeights.beast;
  }
  if (encounterType === "monster") {
    return entityGroupTypeWeights.monster;
  }
  
  // Location encounters
  if (encounterType === "dragon-cave" || encounterType === "volcano") {
    return locationGroupTypeWeights.dragon;
  }
  if (encounterType === "beast-cave") {
    return locationGroupTypeWeights.beast;
  }
  
  // Default location weights
  return locationGroupTypeWeights.default;
}

/**
 * Select a group type based on weights
 * @param {Object} weights - Group type weights object
 * @param {number} randomValue - Random value 0-1 (for deterministic generation, use hash)
 * @returns {string} Selected group type
 */
export function selectGroupType(weights, randomValue) {
  const entries = Object.entries(weights);
  let cumulative = 0;
  const random = randomValue || Math.random();
  
  for (const [groupType, weight] of entries) {
    cumulative += weight;
    if (random <= cumulative) {
      return groupType;
    }
  }
  
  // Fallback to first type
  return entries[0]?.[0] || GROUP_TYPES.REGULAR_INTELLIGENT;
}

/**
 * Get compatible races for mixing
 * @param {string} baseRace - Base race to find compatible races for
 * @returns {Array<string>} Array of compatible race names
 */
export function getCompatibleRaces(baseRace) {
  if (!baseRace) return [];
  
  // Demons only compatible with demons
  if (isDemonRace(baseRace)) {
    return ["Demon"];
  }
  
  // Dragons compatible with servitude races
  if (isDragonRace(baseRace)) {
    return ["Dragon", "Goblin", "Kobold"];
  }
  
  // Beasts compatible with same species only
  if (isBeastRace(baseRace)) {
    return [baseRace]; // Only same species
  }
  
  // Intelligent races use compatibility matrix
  if (isIntelligentRace(baseRace)) {
    return raceCompatibilityMatrix[baseRace] || [baseRace];
  }
  
  return [baseRace];
}

/**
 * Get all beast races
 * @returns {Array<string>}
 */
export function getBeastRaces() {
  return Object.entries(raceCategories)
    .filter(([_, category]) => category === RACE_CATEGORIES.BEAST)
    .map(([race, _]) => race);
}

/**
 * Get all intelligent races
 * @returns {Array<string>}
 */
export function getIntelligentRaces() {
  return Object.entries(raceCategories)
    .filter(([_, category]) => category === RACE_CATEGORIES.INTELLIGENT)
    .map(([race, _]) => race);
}

/**
 * Get all demon races
 * @returns {Array<string>}
 */
export function getDemonRaces() {
  return Object.entries(raceCategories)
    .filter(([_, category]) => category === RACE_CATEGORIES.DEMON)
    .map(([race, _]) => race);
}



