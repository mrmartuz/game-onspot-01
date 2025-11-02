// Class combat bonuses database
// Health, damage, defense, and accuracy bonuses per class

// Export separate objects for compatibility with existing code
export const classHealthBonuses = {
  fighter: 2,
  paladin: 3,
  cleric: 2,
  ranger: 1,
  hunter: 1,
  archer: 0,
  brute: 4,
  martial_artist: 1,
  monk: 1,
  explorer: 1,
  dungeondiver: 2,
  craftsman: 0,
  alchemist: 0,
  herbalist: 0,
  pyromancer: 0,
  necromancer: 0,
  articaster: 0,
  geomancer: 0,
};

export const classDamageBonuses = {
  fighter: 2,
  paladin: 2,
  cleric: 1,
  ranger: 1,
  hunter: 1,
  archer: 1,
  brute: 3,
  martial_artist: 2,
  monk: 1,
  explorer: 0,
  dungeondiver: 1,
  craftsman: 0,
  alchemist: 0,
  herbalist: 0,
  pyromancer: 1,
  necromancer: 1,
  articaster: 1,
  geomancer: 1,
};

export const classDefenseBonuses = {
  fighter: 2,
  paladin: 3,
  cleric: 2,
  ranger: 1,
  hunter: 1,
  archer: 0,
  brute: 2,
  martial_artist: 1,
  monk: 1,
  explorer: 0,
  dungeondiver: 1,
  craftsman: 0,
  alchemist: 0,
  herbalist: 0,
  pyromancer: 0,
  necromancer: 0,
  articaster: 0,
  geomancer: 0,
};

export const classAccuracyBonuses = {
  fighter: 1,
  paladin: 1,
  cleric: 0,
  ranger: 2,
  hunter: 2,
  archer: 3,
  brute: 0,
  martial_artist: 2,
  monk: 2,
  explorer: 1,
  dungeondiver: 1,
  craftsman: 0,
  alchemist: 0,
  herbalist: 0,
  pyromancer: 1,
  necromancer: 1,
  articaster: 1,
  geomancer: 1,
};

// Unified structure (for future use)
export const classCombatBonuses = {
  fighter: {
    health: classHealthBonuses.fighter,
    damage: classDamageBonuses.fighter,
    defense: classDefenseBonuses.fighter,
    accuracy: classAccuracyBonuses.fighter,
  },
  paladin: {
    health: classHealthBonuses.paladin,
    damage: classDamageBonuses.paladin,
    defense: classDefenseBonuses.paladin,
    accuracy: classAccuracyBonuses.paladin,
  },
  cleric: {
    health: classHealthBonuses.cleric,
    damage: classDamageBonuses.cleric,
    defense: classDefenseBonuses.cleric,
    accuracy: classAccuracyBonuses.cleric,
  },
  ranger: {
    health: classHealthBonuses.ranger,
    damage: classDamageBonuses.ranger,
    defense: classDefenseBonuses.ranger,
    accuracy: classAccuracyBonuses.ranger,
  },
  hunter: {
    health: classHealthBonuses.hunter,
    damage: classDamageBonuses.hunter,
    defense: classDefenseBonuses.hunter,
    accuracy: classAccuracyBonuses.hunter,
  },
  archer: {
    health: classHealthBonuses.archer,
    damage: classDamageBonuses.archer,
    defense: classDefenseBonuses.archer,
    accuracy: classAccuracyBonuses.archer,
  },
  brute: {
    health: classHealthBonuses.brute,
    damage: classDamageBonuses.brute,
    defense: classDefenseBonuses.brute,
    accuracy: classAccuracyBonuses.brute,
  },
  martial_artist: {
    health: classHealthBonuses.martial_artist,
    damage: classDamageBonuses.martial_artist,
    defense: classDefenseBonuses.martial_artist,
    accuracy: classAccuracyBonuses.martial_artist,
  },
  monk: {
    health: classHealthBonuses.monk,
    damage: classDamageBonuses.monk,
    defense: classDefenseBonuses.monk,
    accuracy: classAccuracyBonuses.monk,
  },
  explorer: {
    health: classHealthBonuses.explorer,
    damage: classDamageBonuses.explorer,
    defense: classDefenseBonuses.explorer,
    accuracy: classAccuracyBonuses.explorer,
  },
  dungeondiver: {
    health: classHealthBonuses.dungeondiver,
    damage: classDamageBonuses.dungeondiver,
    defense: classDefenseBonuses.dungeondiver,
    accuracy: classAccuracyBonuses.dungeondiver,
  },
  craftsman: {
    health: classHealthBonuses.craftsman,
    damage: classDamageBonuses.craftsman,
    defense: classDefenseBonuses.craftsman,
    accuracy: classAccuracyBonuses.craftsman,
  },
  alchemist: {
    health: classHealthBonuses.alchemist,
    damage: classDamageBonuses.alchemist,
    defense: classDefenseBonuses.alchemist,
    accuracy: classAccuracyBonuses.alchemist,
  },
  herbalist: {
    health: classHealthBonuses.herbalist,
    damage: classDamageBonuses.herbalist,
    defense: classDefenseBonuses.herbalist,
    accuracy: classAccuracyBonuses.herbalist,
  },
  pyromancer: {
    health: classHealthBonuses.pyromancer,
    damage: classDamageBonuses.pyromancer,
    defense: classDefenseBonuses.pyromancer,
    accuracy: classAccuracyBonuses.pyromancer,
  },
  necromancer: {
    health: classHealthBonuses.necromancer,
    damage: classDamageBonuses.necromancer,
    defense: classDefenseBonuses.necromancer,
    accuracy: classAccuracyBonuses.necromancer,
  },
  articaster: {
    health: classHealthBonuses.articaster,
    damage: classDamageBonuses.articaster,
    defense: classDefenseBonuses.articaster,
    accuracy: classAccuracyBonuses.articaster,
  },
  geomancer: {
    health: classHealthBonuses.geomancer,
    damage: classDamageBonuses.geomancer,
    defense: classDefenseBonuses.geomancer,
    accuracy: classAccuracyBonuses.geomancer,
  },
};

// Helper function to get class bonus (uses unified structure)
export function getClassCombatBonus(className, bonusType) {
  const bonuses = classCombatBonuses[className];
  if (!bonuses) return 0;
  return bonuses[bonusType] || 0;
}

