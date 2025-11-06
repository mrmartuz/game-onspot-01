// Armor type normalization utility
// Maps armor type variations to canonical names

/**
 * Normalize armor type name to canonical form
 * Maps variations like "chainmail", "chain-mail" to "chainmail-armor"
 * @param {string} armorType - Armor type name (may be from equipment string parsing)
 * @returns {string|null} Canonical armor type name or null if invalid
 */
export function normalizeArmorType(armorType) {
  if (!armorType) return null;
  
  const normalized = armorType.toLowerCase().trim();
  
  // Map variations to canonical names
  const armorTypeMap = {
    // Chainmail variations
    "chainmail": "chainmail-armor",
    "chain-mail": "chainmail-armor",
    "chainmail-armor": "chainmail-armor",
    
    // Plate variations
    "plate": "plate-armor",
    "plate-armor": "plate-armor",
    
    // Leather variations
    "leather": "leather-armor",
    "leather-armor": "leather-armor",
    
    // Other armor types (already canonical)
    "studded-armor": "studded-armor",
    "scale-armor": "scale-armor",
    "ring-mail": "ring-mail",
    "splint-mail": "splint-mail",
    "brigandine": "brigandine",
    "cloth": "cloth",
    "cloth-armor": "cloth-armor",
    "robes": "robes",
  };
  
  // Try exact match first
  if (armorTypeMap[normalized] !== undefined) {
    return armorTypeMap[normalized];
  }
  
  // Try partial match for embedded names (e.g., "leather-armor" in full equipment string)
  for (const [key, canonical] of Object.entries(armorTypeMap)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return canonical;
    }
  }
  
  // Return original if no match found (might be a valid armor type we don't have variations for)
  return normalized;
}

