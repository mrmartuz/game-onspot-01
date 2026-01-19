// Armor damage reduction database
// Calculates damage reduction percentage (1-80%) based on material, type, rarity, and status

import { parseEquipmentString } from "../../equipment.js";
import { normalizeArmorType } from "./armor-utils.js";

// Material base reduction percentages (0-50%)
const materialBaseReduction = {
  obsura: 50,        // Top tier (cost 35, durability 90)
  aurene: 48,        // Top tier (cost 30, durability 80)
  "sil-teel": 45,    // High tier (silver and steel alloy)
  steel: 40,
  iron: 30,
  bronze: 20,
  leather: 15,
  bone: 10,
  padded: 8,
  fur: 5,
  cloth: 3,
  default: 5,
};

// Armor type multipliers (modify base reduction)
const armorTypeMultipliers = {
  "plate-armor": 1.5,           // Heavy armor = best protection
  "chainmail-armor": 1.2,
  "scale-armor": 1.1,
  "splint-mail": 1.1,
  "brigandine": 1.0,
  "studded-armor": 0.9,
  "ring-mail": 0.8,
  "leather-armor": 0.7,
  "cloth": 0.5,
  "cloth-armor": 0.5,
  "robes": 0.4,
  default: 0.6,
};

// Rarity multipliers (affect final reduction)
const rarityMultipliers = {
  mythic: 1.2,
  epic: 1.15,
  legendary: 1.1,
  rare: 1.05,
  fine: 1.0,
  noble: 1.0,
  uncommon: 1.0,
  common: 0.95,
  poor: 0.9,
  improvised: 0.85,
  scrap: 0.8,
  default: 1.0,
};

// Status/condition multipliers (affect final reduction)
// Maps both armor-specific statuses and general status aliases
const statusMultipliers = {
  // Armor-specific statuses (from equipment.js armor statuses)
  fortified: 1.0,        // Level 6 - Maximum protection
  reinforced: 0.95,       // Level 5 - Enhanced
  polished: 0.9,          // Level 4 - Well maintained
  scratched: 0.75,        // Level 3 - Minor damage
  dented: 0.5,            // Level 2 - Battle damage
  breached: 0.25,         // Level 1 - Severely damaged
  shattered: 0.1,          // Level 0 - Destroyed
  
  // General status aliases (from rarity-status-bonuses)
  excellent: 1.0,
  pristine: 1.0,
  immaculate: 1.0,
  good: 0.9,
  fair: 0.75,
  serviceable: 0.75,
  poor: 0.5,
  worn: 0.4,
  damaged: 0.3,
  frayed: 0.25,
  tattered: 0.2,
  broken: 0.1,
  ruined: 0.1,
  blunted: 0.1,
  nicked: 0.75,
  honed: 0.9,
  balanced: 0.95,
  keen: 0.95,
  default: 0.5,
};

/**
 * Get armor damage reduction percentage (1-80%)
 * @param {string} equipmentString - Equipment string in format "emoji [type] material rarity status"
 * @returns {number} Damage reduction percentage (1-80)
 */
export function getArmorDamageReduction(equipmentString) {
  if (!equipmentString) return 0;
  
  const parsed = parseEquipmentString(equipmentString);
  if (!parsed) return 0;
  
  // Normalize armor type
  const normalizedType = normalizeArmorType(parsed.type);
  if (!normalizedType) return 0;
  
  // Get base reduction from material (0-50%)
  const materialBase = materialBaseReduction[parsed.material] || materialBaseReduction.default;
  
  // Apply armor type multiplier
  const typeMultiplier = armorTypeMultipliers[normalizedType] || armorTypeMultipliers.default;
  let reduction = materialBase * typeMultiplier;
  
  // Apply rarity multiplier
  const rarityMulti = rarityMultipliers[parsed.rarity] || rarityMultipliers.default;
  reduction *= rarityMulti;
  
  // Apply status multiplier
  const statusLower = parsed.status.toLowerCase();
  const statusMulti = statusMultipliers[statusLower] || statusMultipliers.default;
  reduction *= statusMulti;
  
  // Clamp between 1% and 80%
  return Math.max(1, Math.min(80, Math.floor(reduction)));
}

