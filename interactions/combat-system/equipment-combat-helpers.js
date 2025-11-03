// Equipment combat helpers - Uses parseEquipmentString and database lookups
// Replaces all string matching logic with proper parsing and database queries

import {
  parseEquipmentString,
  getEquipmentType,
  getEquipmentStatus,
  equipmentTypes,
} from "../equipment.js";
import {
  getWeaponMapping,
  getPrimaryWeaponSkillFromItem,
  getWeaponBaseDamageFromItem,
  getWeaponCategoryFromItem,
} from "./databases/weapon-mapping.js";
import {
  getWeaponDamageBonus as getMaterialWeaponDamageBonus,
  getArmorDefenseBonus as getMaterialArmorDefenseBonus,
} from "./databases/material-combat-bonuses.js";
import {
  getRarityStatusBonus,
} from "./databases/rarity-combat-multipliers.js";
import {
  getArmorInitiativeModifier,
} from "./databases/armor-initiative-modifiers.js";

/**
 * Get primary weapon skill from equipment string
 * Uses weapon mapping database instead of string matching
 */
export function getPrimaryWeaponSkill(equipmentString) {
  if (!equipmentString) return "unarmed";
  
  const parsed = parseEquipmentString(equipmentString);
  if (!parsed) return "unarmed";
  
  return getPrimaryWeaponSkillFromItem(parsed.type);
}

/**
 * Get weapon damage bonus from equipment string
 * Combines: base damage from weapon type + material bonus + status/rarity bonus
 */
export function getWeaponDamageBonus(equipmentString) {
  if (!equipmentString) return 0;
  
  const parsed = parseEquipmentString(equipmentString);
  if (!parsed) return 0;
  
  // Base damage from weapon type (e.g., sword=2, axe=3)
  const baseDamage = getWeaponBaseDamageFromItem(parsed.type);
  
  // Material bonus (e.g., mithril=+2, steel=+1, wood=-2)
  const materialBonus = getMaterialWeaponDamageBonus(parsed.material);
  
  // Status/rarity bonus (e.g., excellent=+3, good=+2, poor=-1)
  const statusBonus = getRarityStatusBonus(parsed.status, "weaponDamage");
  
  return baseDamage + materialBonus + statusBonus;
}

/**
 * Helper to find equipment type key for an item name
 */
function findEquipmentTypeForItem(itemName) {
  if (!itemName) return null;
  
  for (const [typeName, typeData] of Object.entries(equipmentTypes)) {
    if (typeData.items && typeData.items.includes(itemName)) {
      return { typeKey: typeName, typeData };
    }
  }
  return null;
}

/**
 * Get armor defense bonus from equipment string
 * Combines: material bonus + status/rarity bonus
 */
export function getArmorDefenseBonus(equipmentString) {
  if (!equipmentString) return 0;
  
  const parsed = parseEquipmentString(equipmentString);
  if (!parsed) return 0;
  
  // Find equipment type to determine if it's armor
  const found = findEquipmentTypeForItem(parsed.type);
  if (!found) return 0;
  
  const { typeKey, typeData } = found;
  
  // Check if it's armor or shield type
  const isArmor = typeData.statusType === "armor" || 
                  typeKey === "shields" || 
                  typeKey === "great_shields" ||
                  typeKey === "armor";
  
  if (!isArmor) return 0;
  
  // Material bonus (e.g., mithril=+3, steel=+2, leather=-1)
  const materialBonus = getMaterialArmorDefenseBonus(parsed.material);
  
  // Status/rarity bonus (e.g., excellent=+4, good=+3, poor=+1)
  const statusBonus = getRarityStatusBonus(parsed.status, "armorDefense");
  
  return materialBonus + statusBonus;
}

/**
 * Get shield defense bonus from equipment string
 */
export function getShieldDefenseBonus(equipmentString) {
  if (!equipmentString) return 0;
  
  const parsed = parseEquipmentString(equipmentString);
  if (!parsed) return 0;
  
  // Check if it's a shield
  const found = findEquipmentTypeForItem(parsed.type);
  if (!found) return 0;
  
  const { typeKey } = found;
  const isShield = typeKey === "shields" || typeKey === "great_shields";
  
  if (!isShield) return 0;
  
  // Status/rarity bonus for shields
  const statusBonus = getRarityStatusBonus(parsed.status, "shieldDefense");
  
  return statusBonus;
}

/**
 * Get weapon accuracy bonus from equipment string
 * Based on status/rarity quality only
 */
export function getWeaponAccuracyBonus(equipmentString) {
  if (!equipmentString) return 0;
  
  const parsed = parseEquipmentString(equipmentString);
  if (!parsed) return 0;
  
  // Check if it's a weapon
  const found = findEquipmentTypeForItem(parsed.type);
  if (!found) return 0;
  
  const { typeKey, typeData } = found;
  
  // Check if it's a weapon type (slot === "weapon" and not a shield/clothes/container/tool/accessory)
  const nonWeaponTypes = ["armor", "shields", "great_shields", "clothes", "container", "tool", "accessory"];
  const isWeapon = !nonWeaponTypes.includes(typeKey) && typeData.slot === "weapon";
  
  if (!isWeapon) return 0;
  
  // Status/rarity bonus (e.g., excellent=+2, good=+1, poor=-1)
  const statusBonus = getRarityStatusBonus(parsed.status, "weaponAccuracy");
  
  return statusBonus;
}

/**
 * Get equipment initiative modifier from armor equipment string
 * Heavy armor reduces initiative, light armor increases it
 */
export function getEquipmentInitiativeModifier(equipmentString) {
  if (!equipmentString) return 0;
  
  const parsed = parseEquipmentString(equipmentString);
  if (!parsed) return 0;
  
  // Find equipment type to check if it's armor
  const found = findEquipmentTypeForItem(parsed.type);
  if (!found) return 0;
  
  const { typeData } = found;
  
  // Check if it's armor (statusType === "armor")
  if (typeData.statusType !== "armor") return 0;
  
  // Use armor initiative modifier database
  return getArmorInitiativeModifier(parsed.type);
}

/**
 * Get all equipment bonuses for a character
 * Returns object with damage, defense, accuracy, and initiative bonuses
 */
export function getCharacterEquipmentBonuses(character) {
  const bonuses = {
    weaponDamage: 0,
    armorDefense: 0,
    shieldDefense: 0,
    weaponAccuracy: 0,
    initiative: 0,
  };
  
  // Weapon bonuses
  if (character.equipment?.weapon) {
    bonuses.weaponDamage = getWeaponDamageBonus(character.equipment.weapon);
    bonuses.weaponAccuracy = getWeaponAccuracyBonus(character.equipment.weapon);
  }
  
  // Armor bonuses
  if (character.equipment?.armor) {
    bonuses.armorDefense = getArmorDefenseBonus(character.equipment.armor);
    bonuses.initiative += getEquipmentInitiativeModifier(character.equipment.armor);
  }
  
  // Shield bonuses
  if (character.equipment?.secondHand) {
    bonuses.shieldDefense = getShieldDefenseBonus(character.equipment.secondHand);
  }
  
  return bonuses;
}

/**
 * Check if weapon is ranged
 * @param {string} equipmentString - Weapon equipment string
 * @returns {boolean} True if weapon is ranged
 */
export function isRangedWeapon(equipmentString) {
  if (!equipmentString) return false;
  
  const parsed = parseEquipmentString(equipmentString);
  if (!parsed) return false;
  
  const category = getWeaponCategoryFromItem(parsed.type);
  if (!category) return false;
  
  const rangedCategories = ["bows", "crossbows", "throwing"];
  return rangedCategories.includes(category);
}

/**
 * Get ammo type for a weapon
 * @param {string} equipmentString - Weapon equipment string
 * @returns {string|null} Ammo type ("arrows", "bolts", "stones") or null if not ranged
 */
export function getAmmoType(equipmentString) {
  if (!equipmentString) return null;
  
  const parsed = parseEquipmentString(equipmentString);
  if (!parsed) return null;
  
  const category = getWeaponCategoryFromItem(parsed.type);
  if (!category) return null;
  
  if (category === "bows") return "arrows";
  if (category === "crossbows") return "bolts";
  if (category === "throwing") return "stones";
  
  return null; // Not a ranged weapon
}

