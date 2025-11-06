// Monster tiers database
// Defines early/mid/late game monster types and scaling rules

export const monsterTiers = {
  early: {
    common: [
      "goblin",
      "kobold",
      "goblin_scavenger",
      "kobold_scavenger",
      "wolf_baby",
      "wolf_young",
    ],
    uncommon: [
      "goblin_scout",
      "kobold_scout",
      "wolf_adult",
      "mountain_lion_baby",
      "mountain_lion_young",
    ],
    rare: ["goblin_shaman", "kobold_shaman", "demon_screamer"],
  },
  mid: {
    common: [
      "goblin_scout",
      "orc",
      "orc_scavenger",
      "mountain_lion_young",
      "kobold_scout",
      "wolf_adult",
      "bear_baby",
      "bear_young",
      "demon_screamer",
    ],
    uncommon: [
      "goblin_shaman",
      "orc_scout",
      "orc_shaman",
      "mountain_lion_adult",
      "wolf_alpha",
      "kobold_chief",
      "bear_black",
      "troll",
      "troll_shaman",
      "demon_catcher",
    ],
    rare: [
      "orc_warrior",
      "orc_raider",
      "mountain_lion_alpha",
      "wolf_elder",
      "demon_stalker",
      "troll_warrior",
    ],
  },
  late: {
    common: ["troll", "orc_raider", "bear_black", "bear_young"],
    uncommon: [
      "bear_alpha",
      "troll_warrior",
      "troll_shaman",
      "dragon_young",
      "demon_screamer",
      "demon_blood_harvester",
    ],
    rare: [
      "dragon_adult",
      "dragon_elder",
      "bear_grizzly",
      "troll_chief",
      "troll_elder",
      "demon_reaper",
      "demon_general",
    ],
  },
};

/**
 * Get all available monster types (flattened from all tiers)
 * @returns {Array<string>} Array of all monster type names
 */
export function getAllMonsterTypes() {
  const allTypes = [];
  for (const tier of Object.values(monsterTiers)) {
    allTypes.push(...tier.common, ...tier.uncommon, ...tier.rare);
  }
  return allTypes;
}

/**
 * Get monster types for a specific tier (flattened from all rarity categories)
 * @param {string} tier - Tier name ('early', 'mid', 'late')
 * @returns {Array<string>} Array of monster type names for the tier
 */
export function getMonsterTypesByTier(tier) {
  const tierData = monsterTiers[tier];
  if (!tierData) return [];
  return [...tierData.common, ...tierData.uncommon, ...tierData.rare];
}

/**
 * Get monster types for a specific tier and rarity
 * @param {string} tier - Tier name ('early', 'mid', 'late')
 * @param {string} rarity - Rarity name ('common', 'uncommon', 'rare')
 * @returns {Array<string>} Array of monster type names for the tier and rarity
 */
export function getMonsterTypesByTierAndRarity(tier, rarity) {
  const tierData = monsterTiers[tier];
  if (!tierData) return [];
  return tierData[rarity] || [];
}

/**
 * Select a monster by rarity with weighted distribution
 * @param {string} tier - Tier name ('early', 'mid', 'late')
 * @param {string} race - Race name to filter by (optional)
 * @param {Object} rarityWeights - Weights for each rarity { common: 0.7, uncommon: 0.25, rare: 0.05 }
 * @param {Array} availableTypes - Optional pre-filtered types (if provided, filters by race and tier)
 * @param {Object} creatureTemplates - Creature templates object for race filtering
 * @returns {string|null} Selected monster type or null
 */
export function selectMonsterByRarity(
  tier,
  race = null,
  rarityWeights = { common: 0.7, uncommon: 0.25, rare: 0.05 },
  availableTypes = null,
  creatureTemplates = null
) {
  // Normalize weights
  const totalWeight =
    rarityWeights.common + rarityWeights.uncommon + rarityWeights.rare;
  const normalizedWeights = {
    common: rarityWeights.common / totalWeight,
    uncommon: rarityWeights.uncommon / totalWeight,
    rare: rarityWeights.rare / totalWeight,
  };

  // Get available types
  let typesByRarity = {
    common: [],
    uncommon: [],
    rare: [],
  };

  if (availableTypes && creatureTemplates && race) {
    // Filter provided types by race
    const raceTypes = availableTypes.filter((type) => {
      const t = creatureTemplates[type];
      return t && t.race === race;
    });

    // Categorize by rarity
    for (const type of raceTypes) {
      if (getMonsterTypesByTierAndRarity(tier, "common").includes(type)) {
        typesByRarity.common.push(type);
      } else if (
        getMonsterTypesByTierAndRarity(tier, "uncommon").includes(type)
      ) {
        typesByRarity.uncommon.push(type);
      } else if (getMonsterTypesByTierAndRarity(tier, "rare").includes(type)) {
        typesByRarity.rare.push(type);
      }
    }
  } else {
    // Get all types for tier and race
    const tierTypes = getMonsterTypesByTier(tier);
    let filteredTypes = tierTypes;

    if (race && creatureTemplates) {
      filteredTypes = tierTypes.filter((type) => {
        const t = creatureTemplates[type];
        return t && t.race === race;
      });
    }

    // Categorize by rarity
    for (const type of filteredTypes) {
      if (getMonsterTypesByTierAndRarity(tier, "common").includes(type)) {
        typesByRarity.common.push(type);
      } else if (
        getMonsterTypesByTierAndRarity(tier, "uncommon").includes(type)
      ) {
        typesByRarity.uncommon.push(type);
      } else if (getMonsterTypesByTierAndRarity(tier, "rare").includes(type)) {
        typesByRarity.rare.push(type);
      }
    }
  }

  // Select by weighted random
  const random = Math.random();
  let cumulative = 0;

  // Try rare first (highest weight in leader selection)
  cumulative += normalizedWeights.rare;
  if (random <= cumulative && typesByRarity.rare.length > 0) {
    return typesByRarity.rare[
      Math.floor(Math.random() * typesByRarity.rare.length)
    ];
  }

  // Then uncommon
  cumulative += normalizedWeights.uncommon;
  if (random <= cumulative && typesByRarity.uncommon.length > 0) {
    return typesByRarity.uncommon[
      Math.floor(Math.random() * typesByRarity.uncommon.length)
    ];
  }

  // Finally common (fallback)
  if (typesByRarity.common.length > 0) {
    return typesByRarity.common[
      Math.floor(Math.random() * typesByRarity.common.length)
    ];
  }

  // Fallback to any available
  const allAvailable = [
    ...typesByRarity.common,
    ...typesByRarity.uncommon,
    ...typesByRarity.rare,
  ];
  if (allAvailable.length > 0) {
    return allAvailable[0];
  }

  return null;
}

/**
 * Select a leader by rarity (80% uncommon, 20% rare, no common)
 * @param {string} tier - Tier name ('early', 'mid', 'late')
 * @param {string} race - Race name
 * @param {Array<string>} availableLeaderTypes - Available leader types (already filtered by race and tier)
 * @returns {string|null} Selected leader type or null
 */
export function selectLeaderByRarity(tier, race, availableLeaderTypes) {
  if (availableLeaderTypes.length === 0) {
    return null;
  }

  // Categorize leaders by rarity
  const uncommonLeaders = [];
  const rareLeaders = [];

  for (const type of availableLeaderTypes) {
    if (getMonsterTypesByTierAndRarity(tier, "uncommon").includes(type)) {
      uncommonLeaders.push(type);
    } else if (getMonsterTypesByTierAndRarity(tier, "rare").includes(type)) {
      rareLeaders.push(type);
    }
  }

  // 80% uncommon, 20% rare (no common leaders)
  const random = Math.random();

  if (random < 0.8) {
    // 80% chance: select from uncommon
    if (uncommonLeaders.length > 0) {
      return uncommonLeaders[
        Math.floor(Math.random() * uncommonLeaders.length)
      ];
    }
    // Fallback to rare if no uncommon
    if (rareLeaders.length > 0) {
      return rareLeaders[Math.floor(Math.random() * rareLeaders.length)];
    }
  } else {
    // 20% chance: select from rare
    if (rareLeaders.length > 0) {
      return rareLeaders[Math.floor(Math.random() * rareLeaders.length)];
    }
    // Fallback to uncommon if no rare
    if (uncommonLeaders.length > 0) {
      return uncommonLeaders[
        Math.floor(Math.random() * uncommonLeaders.length)
      ];
    }
  }

  // Final fallback: first available
  return availableLeaderTypes[0];
}

// Monster count scaling rules per tier
// Early tier can now scale group size while staying early tier
export const monsterCountRules = {
  early: {
    minCount: 2,
    maxCount: 5, // Allow small groups to grow to 4 while staying early tier
    description: "Goblins/wolves: small groups that can grow",
  },
  mid: {
    minCount: 3,
    maxCount: 5,
    description: "Orcs/mountain lions: medium groups",
  },
  late: {
    minCount: 4,
    maxCount: 6,
    description: "Bears/demons: large groups",
    // Scales further with large groups
    scalesWithGroup: true,
  },
};

// Tier determination based on group size
// Early game lasts longer - small groups stay early tier even as they grow
// This ensures players encounter more wolves and easy creatures at the start
export const tierDetermination = {
  early: {
    maxGroupSize: 5, // Early tier now lasts up to 5 members
  },
  mid: {
    minGroupSize: 6,
    maxGroupSize: 8,
  },
  late: {
    minGroupSize: 9, // Late tier only for very large groups
  },
};

// Helper functions
export function determineMonsterTier(groupMemberCount) {
  if (groupMemberCount >= tierDetermination.late.minGroupSize) {
    return "late";
  } else if (groupMemberCount >= tierDetermination.mid.minGroupSize) {
    return "mid";
  }
  return "early";
}

export function getMonsterTierList(tier) {
  const tierData = monsterTiers[tier];
  if (!tierData) return getMonsterTypesByTier("early");
  return getMonsterTypesByTier(tier);
}

export function getMonsterCountForTier(tier, baseCount, groupMemberCount) {
  const rules = monsterCountRules[tier] || monsterCountRules.early;
  let minCount = rules.minCount;
  let maxCount = rules.maxCount;

  // Late tier scales further with large groups
  if (tier === "late" && rules.scalesWithGroup) {
    maxCount = 6 + Math.floor(groupMemberCount / 3);
  }

  // Early tier can scale up gradually (2-4 monsters) as group grows
  // This allows small creature groups to increase while staying early tier
  if (tier === "early") {
    // Allow early tier to scale from 2 to 4 based on group size
    const earlyScaling = Math.min(4, 2 + Math.floor(groupMemberCount / 2));
    maxCount = Math.max(maxCount, earlyScaling);
  }

  const calculatedCount = Math.min(
    Math.max(minCount, baseCount + Math.floor(groupMemberCount / 2)),
    maxCount
  );

  return calculatedCount;
}

// Mixed group composition rules
// Controls rarity distribution and composition for mixed groups
export const mixedGroupRules = {
  MIXED_INTELLIGENT: {
    primaryRaceWeight: 0.65, // 65% of group is primary race
    rarityDistribution: {
      primaryRace: {
        common: 0.6, // 60% of primary race are common
        uncommon: 0.3, // 30% uncommon
        rare: 0.1, // 10% rare
      },
      secondaryRaces: {
        common: 0.5, // 50% of secondary races are common
        uncommon: 0.4, // 40% uncommon
        rare: 0.1, // 10% rare
      },
    },
  },
  MIXED_DIFFERENT: {
    intelligentRatio: 0.7, // 70% intelligent creatures
    beastRatio: 0.3, // 30% beasts
    intelligentRarity: {
      common: 0.7, // 70% common
      uncommon: 0.25, // 25% uncommon
      rare: 0.05, // 5% rare
    },
    beastRarity: {
      common: 0.8, // 80% common
      uncommon: 0.2, // 20% uncommon
      rare: 0.0, // 0% rare (beasts rarely have rare variants in mixed groups)
    },
  },
  MIXED_BEAST: {
    rarityDistribution: {
      common: 0.7, // 70% common
      uncommon: 0.25, // 25% uncommon
      rare: 0.05, // 5% rare
    },
  },
  REGULAR_GROUP: {
    rarityDistribution: {
      common: 0.7, // 70% common
      uncommon: 0.25, // 25% uncommon
      rare: 0.05, // 5% rare
    },
  },
};
