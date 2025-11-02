// Monster tiers database
// Defines early/mid/late game monster types and scaling rules

export const monsterTiers = {
  early: [
    "goblin",
    "goblin_scout",
    "goblin_shaman",
    "wolf",
    "wolf_young",
    "wolf_alpha",
  ],
  mid: [
    "orc",
    "orc_scout",
    "orc_warrior",
    "orc_raider",
    "mountainLion",
    "mountain_lion_young",
    "mountain_lion_adult",
    "mountain_lion_hunter",
  ],
  late: [
    "bear",
    "bear_black",
    "bear_grizzly",
    "troll",
    "troll_warrior",
    "screamer",
    "stalker",
  ],
};

/**
 * Get all available monster types (flattened from all tiers)
 * @returns {Array<string>} Array of all monster type names
 */
export function getAllMonsterTypes() {
  return [
    ...monsterTiers.early,
    ...monsterTiers.mid,
    ...monsterTiers.late,
  ];
}

/**
 * Get monster types for a specific tier
 * @param {string} tier - Tier name ('early', 'mid', 'late')
 * @returns {Array<string>} Array of monster type names for the tier
 */
export function getMonsterTypesByTier(tier) {
  return monsterTiers[tier] || [];
}

// Monster count scaling rules per tier
export const monsterCountRules = {
  early: {
    minCount: 2,
    maxCount: 2,
    description: "Goblins/wolves: small groups",
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
export const tierDetermination = {
  early: {
    maxGroupSize: 2,
  },
  mid: {
    minGroupSize: 3,
    maxGroupSize: 4,
  },
  late: {
    minGroupSize: 5,
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
  return monsterTiers[tier] || monsterTiers.early;
}

export function getMonsterCountForTier(tier, baseCount, groupMemberCount) {
  const rules = monsterCountRules[tier] || monsterCountRules.early;
  let minCount = rules.minCount;
  let maxCount = rules.maxCount;
  
  // Late tier scales further with large groups
  if (tier === "late" && rules.scalesWithGroup) {
    maxCount = 6 + Math.floor(groupMemberCount / 3);
  }
  
  const calculatedCount = Math.min(
    Math.max(minCount, baseCount + Math.floor(groupMemberCount / 2)),
    maxCount
  );
  
  return calculatedCount;
}

