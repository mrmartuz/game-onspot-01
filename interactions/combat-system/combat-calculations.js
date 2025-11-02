// Unified combat calculations module
// Centralizes all combat-related calculations using databases and equipment-helpers

// Equipment helpers - for equipment-specific calculations
import {
  getPrimaryWeaponSkill as getPrimaryWeaponSkillFromEquipment,
  getWeaponDamageBonus,
  getArmorDefenseBonus,
  getShieldDefenseBonus,
  getWeaponAccuracyBonus,
  getEquipmentInitiativeModifier,
} from "./equipment-combat-helpers.js";

// Database imports
import {
  classHealthBonuses,
  classDamageBonuses,
  classDefenseBonuses,
  classAccuracyBonuses,
} from "./databases/class-combat-bonuses.js";

/**
 * Get primary weapon skill from character equipment
 */
export function getPrimaryWeaponSkill(character) {
  const weapon = character.equipment?.weapon;
  if (!weapon) return "unarmed";
  
  return getPrimaryWeaponSkillFromEquipment(weapon);
}

/**
 * Get class-based health bonus
 */
export function getClassHealthBonus(className) {
  return classHealthBonuses[className] || 0;
}

/**
 * Get class-based damage bonus
 */
export function getClassDamageBonus(className) {
  return classDamageBonuses[className] || 0;
}

/**
 * Get class-based defense bonus
 */
export function getClassDefenseBonus(className) {
  return classDefenseBonuses[className] || 0;
}

/**
 * Get class-based accuracy bonus
 */
export function getClassAccuracyBonus(className) {
  return classAccuracyBonuses[className] || 0;
}

/**
 * Get equipment damage bonus for a character
 */
export function getEquipmentDamageBonus(character) {
  if (!character.equipment?.weapon) return 0;
  
  return getWeaponDamageBonus(character.equipment.weapon);
}

/**
 * Get equipment defense bonus for a character (armor + shield)
 */
export function getEquipmentDefenseBonus(character) {
  let bonus = 0;

  // Check armor
  if (character.equipment?.armor) {
    bonus += getArmorDefenseBonus(character.equipment.armor);
  }

  // Check shield
  if (character.equipment?.secondHand) {
    bonus += getShieldDefenseBonus(character.equipment.secondHand);
  }

  return bonus;
}

/**
 * Get equipment accuracy bonus for a character
 */
export function getEquipmentAccuracyBonus(character) {
  if (!character.equipment?.weapon) return 0;
  
  return getWeaponAccuracyBonus(character.equipment.weapon);
}

/**
 * Get equipment initiative bonus for a character
 */
export function getEquipmentInitiativeBonus(character) {
  if (!character.equipment?.armor) return 0;
  
  return getEquipmentInitiativeModifier(character.equipment.armor);
}

/**
 * Get equipment health bonus for a character
 * (Currently always returns 0 as equipment doesn't affect health directly)
 */
export function getEquipmentHealthBonus(character) {
  return 0;
}

/**
 * Get skill-based damage bonus
 */
export function getSkillDamageBonus(character) {
  const primarySkill = getPrimaryWeaponSkill(character);
  const skillLevel = character.skills?.[primarySkill] || 0;
  return Math.floor(skillLevel / 2);
}

/**
 * Get skill-based defense bonus
 */
export function getSkillDefenseBonus(character) {
  const shieldSkill = character.skills?.shieldwork || 0;
  const tacticsSkill = character.skills?.tactics || 0;
  return Math.floor(shieldSkill / 3) + Math.floor(tacticsSkill / 4);
}

/**
 * Get skill-based accuracy bonus
 */
export function getSkillAccuracyBonus(character) {
  const primarySkill = getPrimaryWeaponSkill(character);
  const skillLevel = character.skills?.[primarySkill] || 0;
  return Math.floor(skillLevel / 3);
}

/**
 * Get skill-based initiative bonus
 */
export function getSkillInitiativeBonus(character) {
  const stealthSkill = character.skills?.stealth || 0;
  const scoutingSkill = character.skills?.scouting || 0;
  return Math.floor(stealthSkill / 4) + Math.floor(scoutingSkill / 4);
}

/**
 * Calculate total character health
 */
export function calculateCharacterHealth(character) {
  const baseHealth = Math.floor(character.stats.CON * 2 + 10);
  const classBonus = getClassHealthBonus(character.class);
  const equipmentBonus = getEquipmentHealthBonus(character);

  return baseHealth + classBonus + equipmentBonus;
}

/**
 * Calculate total character damage
 */
export function calculateCharacterDamage(character) {
  const baseDamage = Math.floor(character.stats.STR / 2) + 1;
  const weaponBonus = getEquipmentDamageBonus(character);
  const skillBonus = getSkillDamageBonus(character);
  const classBonus = getClassDamageBonus(character.class);

  return baseDamage + weaponBonus + skillBonus + classBonus;
}

/**
 * Calculate total character defense
 */
export function calculateCharacterDefense(character) {
  const baseDefense = Math.floor(character.stats.CON / 2);
  const armorBonus = getEquipmentDefenseBonus(character);
  const skillBonus = getSkillDefenseBonus(character);
  const classBonus = getClassDefenseBonus(character.class);

  return baseDefense + armorBonus + skillBonus + classBonus;
}

/**
 * Calculate total character accuracy
 */
export function calculateCharacterAccuracy(character) {
  const baseAccuracy = Math.floor(character.stats.DEX / 2) + 10;
  const weaponBonus = getEquipmentAccuracyBonus(character);
  const skillBonus = getSkillAccuracyBonus(character);
  const classBonus = getClassAccuracyBonus(character.class);

  return baseAccuracy + weaponBonus + skillBonus + classBonus;
}

/**
 * Calculate total character initiative
 */
export function calculateCharacterInitiative(character) {
  const baseInitiative =
    Math.floor(character.stats.DEX / 2) + Math.floor(character.stats.WIS / 2);
  const equipmentBonus = getEquipmentInitiativeBonus(character);
  const skillBonus = getSkillInitiativeBonus(character);

  return baseInitiative + equipmentBonus + skillBonus;
}


