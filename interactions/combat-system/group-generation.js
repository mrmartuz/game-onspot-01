// Group generation system
// Generates enemy groups with different composition types (leader, mixed intelligent, mixed different, mixed beasts)

import { generateCreature } from "./creature-generation.js";
import {
  getAllMonsterTypes,
  getMonsterTypesByTier,
  determineMonsterTier,
  selectLeaderByRarity,
  selectMonsterByRarity,
  mixedGroupRules,
} from "./databases/monster-tiers.js";
import { creatureTemplates } from "./creature-templates.js";
import { gameState } from "../../gamestate/game_variables.js";
import {
  getGroupTypeWeights,
  selectGroupType,
  canRacesMix,
  getCompatibleRaces,
  getLeaderTypes,
  isLeaderClass,
  isIntelligentRace,
  isBeastRace,
  isDemonRace,
  isDragonRace,
  getBeastRaces,
  getIntelligentRaces,
  GROUP_TYPES,
} from "./databases/group-composition-rules.js";
import {
  getLocationBehaviorType,
  getLocationSpawnRules,
  selectDragonCaveComposition,
} from "./databases/location-rules.js";
import {
  getDeterministicCreatureType,
  getHashValue,
} from "./deterministic-generation.js";

/**
 * Determine group type for encounter
 * Uses hash for entities (deterministic), weighted random for locations
 * @param {string} entityType - "monster" | "beast" | null (if location)
 * @param {string} locationType - Location type if encounter is at location
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {string} Group type
 */
export function determineGroupType(entityType, locationType, x, y) {
  // If entity encounter, use hash for deterministic group type
  if (entityType) {
    const hashValue = getHashValue(x, y, entityType === "beast" ? 1000 : 2000);
    const weights = getGroupTypeWeights(entityType);
    return selectGroupType(weights, hashValue);
  }

  // If location encounter, use weighted random
  const behaviorType = getLocationBehaviorType(locationType);
  const weights = getGroupTypeWeights(behaviorType);
  const hashValue = getHashValue(x, y, 9000); // Use hash for "randomness" but it's still deterministic
  return selectGroupType(weights, hashValue);
}

/**
 * Generate leader group: 1 leader + regular variants
 * Minimum 3 creatures required (1 leader + 2 regular)
 * @param {string} baseCreatureType - Base creature template (e.g., "goblin")
 * @param {number} count - Total count (leader counts toward this)
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {Promise<Array>} Array of Monster instances
 */
export async function generateLeaderGroup(baseCreatureType, count, x, y) {
  const monsters = [];
  const template = creatureTemplates[baseCreatureType];

  if (!template) {
    console.error(`Template not found for leader group: ${baseCreatureType}`);
    return monsters;
  }

  // Determine tier from group size
  const groupMemberCount = gameState.group ? gameState.group.length : 1;
  const tier = determineMonsterTier(groupMemberCount);

  const race = template.race;
  const leaderTypes = getLeaderTypes(race);

  if (leaderTypes.length === 0) {
    // No leader type available, generate regular group
    return await generateRegularGroup(baseCreatureType, count, x, y);
  }

  // Get all types in tier
  const tierTypes = getMonsterTypesByTier(tier);
  const allTypes = getAllMonsterTypes();

  // Find all leader types for this race in the tier
  const availableLeaderTypes = [];
  for (const leaderClass of leaderTypes) {
    const leaderType = tierTypes.find((type) => {
      const t = creatureTemplates[type];
      return (
        t &&
        t.race === race &&
        isLeaderClass(t.class) &&
        t.class.toLowerCase().includes(leaderClass.toLowerCase())
      );
    });

    if (leaderType && !availableLeaderTypes.includes(leaderType)) {
      availableLeaderTypes.push(leaderType);
    }
  }

  // If no leader types found in tier, try all tiers as fallback
  if (availableLeaderTypes.length === 0) {
    for (const leaderClass of leaderTypes) {
      const leaderType = allTypes.find((type) => {
        const t = creatureTemplates[type];
        return (
          t &&
          t.race === race &&
          isLeaderClass(t.class) &&
          t.class.toLowerCase().includes(leaderClass.toLowerCase())
        );
      });

      if (leaderType && !availableLeaderTypes.includes(leaderType)) {
        availableLeaderTypes.push(leaderType);
      }
    }
  }

  // Use rarity-based selection: 80% uncommon, 20% rare (no common leaders)
  const leaderTemplate = selectLeaderByRarity(tier, race, availableLeaderTypes);

  // If no leader template found, use regular group
  if (!leaderTemplate) {
    return await generateRegularGroup(baseCreatureType, count, x, y);
  }

  // Generate 1 leader
  const leader = await generateCreature(leaderTemplate, x, y, 0);
  if (leader) {
    leader.isLeader = true;
    monsters.push(leader);
  }

  // Generate rest as regular variants with rarity weighting
  const regularCount = Math.max(2, count - 1); // Minimum 2 regular, rest based on count

  // Get regular types (non-leaders) in tier
  const regularTypes = tierTypes.filter((type) => {
    const t = creatureTemplates[type];
    return t && t.race === race && !isLeaderClass(t.class);
  });

  // Fallback to all types if no tier-specific regular types
  const typesToUse =
    regularTypes.length > 0
      ? regularTypes
      : allTypes.filter((type) => {
          const t = creatureTemplates[type];
          return t && t.race === race && !isLeaderClass(t.class);
        });

  if (typesToUse.length === 0) {
    typesToUse.push(baseCreatureType); // Fallback
  }

  // Use rarity-based selection for regular members
  const rarityWeights = mixedGroupRules.REGULAR_GROUP.rarityDistribution;

  for (let i = 1; i <= regularCount; i++) {
    const selectedType =
      selectMonsterByRarity(
        tier,
        race,
        rarityWeights,
        typesToUse,
        creatureTemplates
      ) || typesToUse[Math.floor(Math.random() * typesToUse.length)];

    const monster = await generateCreature(selectedType, x, y, i);
    if (monster) {
      monsters.push(monster);
    }
  }

  return monsters;
}

/**
 * Generate mixed intelligent group: Multiple intelligent races
 * @param {Array<string>} races - Array of race names to mix
 * @param {number} count - Total monster count
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {Promise<Array>} Array of Monster instances
 */
export async function generateMixedIntelligentGroup(races, count, x, y) {
  const monsters = [];

  // Determine tier from group size
  const groupMemberCount = gameState.group ? gameState.group.length : 1;
  const tier = determineMonsterTier(groupMemberCount);

  // Get weighted distribution (weighted toward one race)
  const distribution = getWeightedCreatureDistribution(races, count);

  // Get rarity rules for mixed intelligent groups
  const rules = mixedGroupRules.MIXED_INTELLIGENT;
  const primaryRace = races[0];

  // Get all creature templates for each race, filtered by tier
  const tierTypes = getMonsterTypesByTier(tier);
  const allTypes = getAllMonsterTypes();
  const raceTemplates = {};

  for (const race of races) {
    // Filter by tier first
    raceTemplates[race] = tierTypes.filter((type) => {
      const t = creatureTemplates[type];
      return t && t.race === race;
    });

    // Fallback to all types if no tier-specific types
    if (raceTemplates[race].length === 0) {
      raceTemplates[race] = allTypes.filter((type) => {
        const t = creatureTemplates[type];
        return t && t.race === race;
      });
    }
  }

  let index = 0;
  for (const [race, raceCount] of Object.entries(distribution)) {
    const templates = raceTemplates[race] || [];
    if (templates.length === 0) continue;

    // Use different rarity weights for primary vs secondary races
    const isPrimary = race === primaryRace;
    const rarityWeights = isPrimary
      ? rules.rarityDistribution.primaryRace
      : rules.rarityDistribution.secondaryRaces;

    for (let i = 0; i < raceCount; i++) {
      const selectedType =
        selectMonsterByRarity(
          tier,
          race,
          rarityWeights,
          templates,
          creatureTemplates
        ) || templates[Math.floor(Math.random() * templates.length)];

      const monster = await generateCreature(selectedType, x, y, index);
      if (monster) {
        monsters.push(monster);
        index++;
      }
    }
  }

  return monsters;
}

/**
 * Generate mixed different group: Intelligent + beast
 * @param {string} intelligentRace - Intelligent race name
 * @param {string} beastRace - Beast race name
 * @param {number} count - Total monster count
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {Promise<Array>} Array of Monster instances
 */
export async function generateMixedDifferentGroup(
  intelligentRace,
  beastRace,
  count,
  x,
  y
) {
  const monsters = [];

  // Determine tier from group size
  const groupMemberCount = gameState.group ? gameState.group.length : 1;
  const tier = determineMonsterTier(groupMemberCount);

  // Get rarity rules for mixed different groups
  const rules = mixedGroupRules.MIXED_DIFFERENT;

  // Weighted distribution (more intelligent, less beast)
  const intelligentCount = Math.ceil(count * rules.intelligentRatio);
  const beastCount = count - intelligentCount;

  // Get templates for each race, filtered by tier
  const tierTypes = getMonsterTypesByTier(tier);
  const allTypes = getAllMonsterTypes();

  const intelligentTemplates = tierTypes.filter((type) => {
    const t = creatureTemplates[type];
    return t && t.race === intelligentRace;
  });

  const beastTemplates = tierTypes.filter((type) => {
    const t = creatureTemplates[type];
    return t && t.race === beastRace;
  });

  // Fallback to all types if no tier-specific types
  const intelligentTypesToUse =
    intelligentTemplates.length > 0
      ? intelligentTemplates
      : allTypes.filter((type) => {
          const t = creatureTemplates[type];
          return t && t.race === intelligentRace;
        });

  const beastTypesToUse =
    beastTemplates.length > 0
      ? beastTemplates
      : allTypes.filter((type) => {
          const t = creatureTemplates[type];
          return t && t.race === beastRace;
        });

  // Generate intelligent creatures with rarity weighting
  for (let i = 0; i < intelligentCount; i++) {
    const selectedType =
      selectMonsterByRarity(
        tier,
        intelligentRace,
        rules.intelligentRarity,
        intelligentTypesToUse,
        creatureTemplates
      ) ||
      (intelligentTypesToUse.length > 0
        ? intelligentTypesToUse[
            Math.floor(Math.random() * intelligentTypesToUse.length)
          ]
        : null);

    if (selectedType) {
      const monster = await generateCreature(selectedType, x, y, i);
      if (monster) {
        monsters.push(monster);
      }
    }
  }

  // Generate beasts with rarity weighting
  for (let i = 0; i < beastCount; i++) {
    const selectedType =
      selectMonsterByRarity(
        tier,
        beastRace,
        rules.beastRarity,
        beastTypesToUse,
        creatureTemplates
      ) ||
      (beastTypesToUse.length > 0
        ? beastTypesToUse[Math.floor(Math.random() * beastTypesToUse.length)]
        : null);

    if (selectedType) {
      const monster = await generateCreature(
        selectedType,
        x,
        y,
        intelligentCount + i
      );
      if (monster) {
        monsters.push(monster);
      }
    }
  }

  return monsters;
}

/**
 * Generate mixed beast group: Same species only
 * Filters by tier to ensure early game gets wolves, not bears/mountain lions
 * @param {string} beastType - Beast race name
 * @param {number} count - Total monster count
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {string} tier - Optional tier ('early', 'mid', 'late'). If not provided, determined from group size
 * @returns {Promise<Array>} Array of Monster instances
 */
export async function generateMixedBeastGroup(
  beastType,
  count,
  x,
  y,
  tier = null
) {
  const monsters = [];

  // Determine tier if not provided
  if (!tier) {
    const groupMemberCount = gameState.group ? gameState.group.length : 1;
    tier = determineMonsterTier(groupMemberCount);
  }

  // Get monster types for the tier (ensures early game gets early tier beasts)
  const tierTypes = getMonsterTypesByTier(tier);

  // Filter beast templates by both race and tier
  const beastTemplates = tierTypes.filter((type) => {
    const t = creatureTemplates[type];
    return t && t.race === beastType;
  });

  // If no tier-filtered beasts found, fallback to early tier for safety
  if (beastTemplates.length === 0 && tier !== "early") {
    const earlyTypes = getMonsterTypesByTier("early");
    const earlyBeasts = earlyTypes.filter((type) => {
      const t = creatureTemplates[type];
      return t && t.race === beastType;
    });
    if (earlyBeasts.length > 0) {
      // Use early tier beasts as fallback
      beastTemplates.push(...earlyBeasts);
    }
  }

  // Final fallback: if still no beasts, try any tier (shouldn't happen normally)
  if (beastTemplates.length === 0) {
    const allTypes = getAllMonsterTypes();
    const fallbackBeasts = allTypes.filter((type) => {
      const t = creatureTemplates[type];
      return t && t.race === beastType;
    });
    if (fallbackBeasts.length > 0) {
      beastTemplates.push(...fallbackBeasts);
    }
  }

  if (beastTemplates.length === 0) {
    return monsters;
  }

  // Get rarity rules for mixed beast groups
  const rarityWeights = mixedGroupRules.MIXED_BEAST.rarityDistribution;

  // Generate mixed variants of same species (from tier-appropriate types) with rarity weighting
  for (let i = 0; i < count; i++) {
    const selectedType =
      selectMonsterByRarity(
        tier,
        beastType,
        rarityWeights,
        beastTemplates,
        creatureTemplates
      ) || beastTemplates[Math.floor(Math.random() * beastTemplates.length)];

    const monster = await generateCreature(selectedType, x, y, i);
    if (monster) {
      monsters.push(monster);
    }
  }

  return monsters;
}

/**
 * Generate regular group (single race, no leader)
 * @param {string} baseCreatureType - Base creature template
 * @param {number} count - Monster count
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {Promise<Array>} Array of Monster instances
 */
export async function generateRegularGroup(baseCreatureType, count, x, y) {
  const monsters = [];
  const template = creatureTemplates[baseCreatureType];

  if (!template) {
    return monsters;
  }

  // Determine tier from group size
  const groupMemberCount = gameState.group ? gameState.group.length : 1;
  const tier = determineMonsterTier(groupMemberCount);

  // Get all variants of this race in tier
  const tierTypes = getMonsterTypesByTier(tier);
  const allTypes = getAllMonsterTypes();
  const race = template.race;

  // Filter by tier first, then by race and exclude leaders
  const raceTemplates = tierTypes.filter((type) => {
    const t = creatureTemplates[type];
    return t && t.race === race && !isLeaderClass(t.class);
  });

  // Fallback to all types if no tier-specific types found
  const typesToUse =
    raceTemplates.length > 0
      ? raceTemplates
      : allTypes.filter((type) => {
          const t = creatureTemplates[type];
          return t && t.race === race && !isLeaderClass(t.class);
        });

  if (typesToUse.length === 0) {
    typesToUse.push(baseCreatureType); // Fallback
  }

  // Use rarity-based selection for regular group members
  const rarityWeights = mixedGroupRules.REGULAR_GROUP.rarityDistribution;

  for (let i = 0; i < count; i++) {
    const selectedType =
      selectMonsterByRarity(
        tier,
        race,
        rarityWeights,
        typesToUse,
        creatureTemplates
      ) || typesToUse[Math.floor(Math.random() * typesToUse.length)];

    const monster = await generateCreature(selectedType, x, y, i);
    if (monster) {
      monsters.push(monster);
    }
  }

  return monsters;
}

/**
 * Select compatible races for mixing
 * @param {string} baseRace - Base race
 * @param {number} count - Number of races to select
 * @param {number} hashValue - Hash value for deterministic selection
 * @returns {Array<string>} Array of compatible race names
 */
export function selectCompatibleRaces(baseRace, count, hashValue) {
  const compatible = getCompatibleRaces(baseRace);

  if (compatible.length <= count) {
    return compatible;
  }

  // Select races based on hash
  const selected = [];
  let currentHash = hashValue;

  for (let i = 0; i < count && compatible.length > 0; i++) {
    const index = Math.floor(currentHash * compatible.length);
    selected.push(compatible[index]);
    compatible.splice(index, 1);
    currentHash = (currentHash * 1000) % 1; // Use next "random" value
  }

  return selected;
}

/**
 * Get weighted creature distribution
 * Option B: Weighted toward one race (e.g., 4 goblins + 2 orcs)
 * @param {Array<string>} races - Array of race names
 * @param {number} totalCount - Total creature count
 * @returns {Object} Distribution object {race: count}
 */
export function getWeightedCreatureDistribution(races, totalCount) {
  if (races.length === 0) return {};
  if (races.length === 1) {
    return { [races[0]]: totalCount };
  }

  // Weight the first race more heavily (60-70%)
  const primaryRace = races[0];
  const primaryCount = Math.ceil(totalCount * 0.65);
  const remainingCount = totalCount - primaryCount;

  const distribution = { [primaryRace]: primaryCount };

  // Distribute remaining count among other races
  const otherRaces = races.slice(1);
  const perRace = Math.floor(remainingCount / otherRaces.length);
  const remainder = remainingCount % otherRaces.length;

  for (let i = 0; i < otherRaces.length; i++) {
    const count = perRace + (i < remainder ? 1 : 0);
    distribution[otherRaces[i]] = count;
  }

  return distribution;
}

/**
 * Generate group for dragon cave (special logic)
 * @param {string} composition - Composition type ("single_dragon", "dragon_servitude", "dragon_hatchlings")
 * @param {number} count - Total count
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {Promise<Array>} Array of Monster instances
 */
export async function generateDragonCaveGroup(composition, count, x, y) {
  const monsters = [];
  const allTypes = getAllMonsterTypes();

  switch (composition) {
    case "single_dragon":
      // Just a single dragon
      const dragonTypes = allTypes.filter((type) => {
        const t = creatureTemplates[type];
        return t && t.race === "Dragon";
      });
      if (dragonTypes.length > 0) {
        const dragonType =
          dragonTypes[Math.floor(Math.random() * dragonTypes.length)];
        const dragon = await generateCreature(dragonType, x, y, 0);
        if (dragon) {
          dragon.isLeader = true;
          monsters.push(dragon);
        }
      }
      break;

    case "dragon_servitude":
      // Dragon + goblins/kobolds
      const servitudeRaces = ["Goblin", "Kobold"];
      const servitudeRace =
        servitudeRaces[Math.floor(Math.random() * servitudeRaces.length)];
      const dragonCount = 1;
      const servitudeCount = Math.max(2, count - dragonCount);

      // Generate dragon
      const servitudeDragonTypes = allTypes.filter((type) => {
        const t = creatureTemplates[type];
        return (
          t && t.race === "Dragon" && !t.name.toLowerCase().includes("young")
        );
      });
      if (servitudeDragonTypes.length > 0) {
        const dragonType =
          servitudeDragonTypes[
            Math.floor(Math.random() * servitudeDragonTypes.length)
          ];
        const dragon = await generateCreature(dragonType, x, y, 0);
        if (dragon) {
          dragon.isLeader = true;
          monsters.push(dragon);
        }
      }

      // Generate servitude
      const servitudeTemplates = allTypes.filter((type) => {
        const t = creatureTemplates[type];
        return t && t.race === servitudeRace && !isLeaderClass(t.class);
      });
      for (let i = 0; i < servitudeCount; i++) {
        const template =
          servitudeTemplates[
            Math.floor(Math.random() * servitudeTemplates.length)
          ];
        const monster = await generateCreature(template, x, y, dragonCount + i);
        if (monster) {
          monsters.push(monster);
        }
      }
      break;

    case "dragon_hatchlings":
      // Adult/ancient/elder dragon + young dragons
      const adultDragonTypes = allTypes.filter((type) => {
        const t = creatureTemplates[type];
        return (
          t &&
          t.race === "Dragon" &&
          (t.name.toLowerCase().includes("adult") ||
            t.name.toLowerCase().includes("ancient") ||
            t.name.toLowerCase().includes("elder"))
        );
      });
      const hatchlingTypes = allTypes.filter((type) => {
        const t = creatureTemplates[type];
        return (
          t && t.race === "Dragon" && t.name.toLowerCase().includes("young")
        );
      });

      // Generate adult dragon
      if (adultDragonTypes.length > 0) {
        const dragonType =
          adultDragonTypes[Math.floor(Math.random() * adultDragonTypes.length)];
        const dragon = await generateCreature(dragonType, x, y, 0);
        if (dragon) {
          dragon.isLeader = true;
          monsters.push(dragon);
        }
      }

      // Generate hatchlings
      const hatchlingCount = Math.max(1, count - 1);
      for (let i = 0; i < hatchlingCount && hatchlingTypes.length > 0; i++) {
        const hatchlingType =
          hatchlingTypes[Math.floor(Math.random() * hatchlingTypes.length)];
        const hatchling = await generateCreature(hatchlingType, x, y, 1 + i);
        if (hatchling) {
          monsters.push(hatchling);
        }
      }
      break;
  }

  return monsters;
}
