// Armor initiative modifiers database
// Initiative bonuses/penalties based on armor type

export const armorInitiativeModifiers = {
  // Heavy armor reduces initiative
  plate: -2,
  "plate-armor": -2,
  chainmail: -1,
  "chainmail-armor": -1,
  "chain-mail": -1,
  
  // Medium armor neutral
  leather: 0,
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
  plate: -3,
  "plate-armor": -3,
  chainmail: -2,
  "chainmail-armor": -2,
  "chain-mail": -2,
  leather: -1,
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
  
  const normalizedType = armorType.toLowerCase().trim();
  
  // Try exact match first
  if (armorInitiativeModifiers[normalizedType] !== undefined) {
    return armorInitiativeModifiers[normalizedType];
  }
  
  // Try partial match (e.g., "leather-armor" in "🛡️ [leather-armor] iron common honed")
  for (const [key, value] of Object.entries(armorInitiativeModifiers)) {
    if (normalizedType.includes(key) || key.includes(normalizedType)) {
      return value;
    }
  }
  
  return armorInitiativeModifiers.default;
}

export function getArmorStealthModifier(armorType) {
  if (!armorType) return 0;
  
  const normalizedType = armorType.toLowerCase().trim();
  
  // Try exact match first
  if (armorStealthModifiers[normalizedType] !== undefined) {
    return armorStealthModifiers[normalizedType];
  }
  
  // Try partial match
  for (const [key, value] of Object.entries(armorStealthModifiers)) {
    if (normalizedType.includes(key) || key.includes(normalizedType)) {
      return value;
    }
  }
  
  return armorStealthModifiers.default;
}



