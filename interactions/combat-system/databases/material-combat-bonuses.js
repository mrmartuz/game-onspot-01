// Material combat bonuses database
// Weapon damage and armor defense bonuses by material

export const materialCombatBonuses = {
  // Weapon material damage bonuses
  weaponDamage: {
    obsura: 4, // Top tier (cost 35, durability 90)
    aurene: 3, // Top tier (cost 30, durability 80)
    "sil-teel": 2, // High tier (silver and steel alloy - hard as steel, reflective as polished silver)
    steel: 1,
    iron: 0,
    bronze: -1,
    wood: -2,
    oak: -1,
    pine: -2,
    birch: -1,
    maple: 0,
    bone: -1,
    obsidian: 0,
    stone: -1,
    copper: -1,
    // Default for materials not listed
    default: 0,
  },
  // Armor material defense bonuses
  armorDefense: {
    obsura: 5, // Top tier
    aurene: 4, // Top tier
    "sil-teel": 3, // High tier
    steel: 2,
    iron: 1,
    bronze: 0,
    leather: -1,
    bone: 0,
    padded: 0,
    fur: 0,
    // Default for materials not listed
    default: 0,
  },
};

// Helper functions
export function getWeaponDamageBonus(materialName) {
  return (
    materialCombatBonuses.weaponDamage[materialName] ||
    materialCombatBonuses.weaponDamage.default
  );
}

export function getArmorDefenseBonus(materialName) {
  return (
    materialCombatBonuses.armorDefense[materialName] ||
    materialCombatBonuses.armorDefense.default
  );
}
