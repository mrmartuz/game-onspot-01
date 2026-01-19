// Rarity combat multipliers database
// Experience and loot multipliers by rarity

export const rarityCombatMultipliers = {
  common: {
    experienceMultiplier: 1.0,
    lootMultiplier: 0.3,
  },
  uncommon: {
    experienceMultiplier: 1.5,
    lootMultiplier: 0.5,
  },
  rare: {
    experienceMultiplier: 2.0,
    lootMultiplier: 0.7,
  },
  legendary: {
    experienceMultiplier: 3.0,
    lootMultiplier: 0.9,
  },
  epic: {
    experienceMultiplier: 4.0,
    lootMultiplier: 1.0,
  },
  mythic: {
    experienceMultiplier: 5.0,
    lootMultiplier: 1.0,
  },
};

// Equipment rarity status bonuses (for equipment quality)
export const rarityStatusBonuses = {
  // Status name -> combat bonuses
  excellent: {
    weaponDamage: 3,
    weaponAccuracy: 2,
    armorDefense: 4,
    shieldDefense: 2,
  },
  good: {
    weaponDamage: 2,
    weaponAccuracy: 1,
    armorDefense: 3,
    shieldDefense: 1,
  },
  fair: {
    weaponDamage: 1,
    weaponAccuracy: 0,
    armorDefense: 2,
    shieldDefense: 0,
  },
  poor: {
    weaponDamage: -1,
    weaponAccuracy: -1,
    armorDefense: 1,
    shieldDefense: -1,
  },
  broken: {
    weaponDamage: -2,
    weaponAccuracy: -2,
    armorDefense: 0,
    shieldDefense: -2,
  },
  // Status aliases
  pristine: {
    weaponDamage: 3,
    weaponAccuracy: 2,
    armorDefense: 4,
    shieldDefense: 2,
  },
  immaculate: {
    weaponDamage: 3,
    weaponAccuracy: 2,
    armorDefense: 4,
    shieldDefense: 2,
  },
  serviceable: {
    weaponDamage: 1,
    weaponAccuracy: 0,
    armorDefense: 2,
    shieldDefense: 0,
  },
  worn: {
    weaponDamage: 0,
    weaponAccuracy: 0,
    armorDefense: 1,
    shieldDefense: 0,
  },
  frayed: {
    weaponDamage: -1,
    weaponAccuracy: -1,
    armorDefense: 1,
    shieldDefense: -1,
  },
  tattered: {
    weaponDamage: -1,
    weaponAccuracy: -1,
    armorDefense: 0,
    shieldDefense: -1,
  },
  damaged: {
    weaponDamage: -1,
    weaponAccuracy: -1,
    armorDefense: 1,
    shieldDefense: -1,
  },
  // Default for statuses not listed
  default: {
    weaponDamage: 0,
    weaponAccuracy: 0,
    armorDefense: 0,
    shieldDefense: 0,
  },
};

// Helper functions
export function getRarityExperienceMultiplier(rarityName) {
  const multiplier = rarityCombatMultipliers[rarityName];
  return multiplier ? multiplier.experienceMultiplier : 1.0;
}

export function getRarityLootMultiplier(rarityName) {
  const multiplier = rarityCombatMultipliers[rarityName];
  return multiplier ? multiplier.lootMultiplier : 0.3;
}

export function getRarityStatusBonus(statusName, bonusType) {
  const status = rarityStatusBonuses[statusName?.toLowerCase()] || rarityStatusBonuses.default;
  return status[bonusType] || 0;
}




