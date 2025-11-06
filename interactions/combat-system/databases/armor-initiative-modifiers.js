// Armor initiative modifiers database
// Initiative bonuses/penalties based on armor type

import { normalizeArmorType } from "./armor-utils.js";

export const armorInitiativeModifiers = {
  // Heavy armor reduces initiative
  "plate-armor": -2,
  "chainmail-armor": -1,

  // Medium armor neutral
  "leather-armor": 0,
  "studded-armor": 0,
  "scale-armor": 0,
  "ring-mail": 0,
  "splint-mail": 0,
  brigandine: 0,

  // Light armor/clothing increases initiative
  cloth: 1,
  "cloth-armor": 1,
  robes: 1,

  // Default for armor types not listed
  default: 0,
};

// Armor stealth modifiers (for detection system)
export const armorStealthModifiers = {
  "plate-armor": -3,
  "chainmail-armor": -2,
  "leather-armor": -1,
  "studded-armor": -1,
  cloth: 0,
  "cloth-armor": 0,
  robes: 0,
  default: 0,
};

// Helper functions
export function getArmorInitiativeModifier(armorType) {
  if (!armorType) return 0;

  const normalizedType = normalizeArmorType(armorType);
  if (!normalizedType) return armorInitiativeModifiers.default;

  return (
    armorInitiativeModifiers[normalizedType] || armorInitiativeModifiers.default
  );
}

export function getArmorStealthModifier(armorType) {
  if (!armorType) return 0;

  const normalizedType = normalizeArmorType(armorType);
  if (!normalizedType) return armorStealthModifiers.default;

  return armorStealthModifiers[normalizedType] || armorStealthModifiers.default;
}
