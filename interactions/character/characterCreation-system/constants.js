// Constants for character creation system
// Reuses existing emoji from gamestate/emoji-database.js

// Basic races available for player selection (common races only)
export const BASIC_RACES = ["Human", "Elf", "Dwarf", "Orc"];

// Equipment slots configuration for character preview display
export const EQUIPMENT_SLOTS = [
  { key: "clothes", label: "👕 Clothes" },
  { key: "armor", label: "🛡️ Armor" },
  { key: "weapon", label: "⚔️ Weapon" },
  { key: "secondHand", label: "🛡️ Second Hand" },
  { key: "back", label: "🎒 Back" },
  { key: "tool", label: "🔧 Tool" },
];

// Stat categories for organized display
export const STAT_CATEGORIES = {
  physical: ["STR", "DEX", "CON"],
  mental: ["INT", "WIS", "CHA"],
};

// Stat allocation constants
export const MIN_STAT_VALUE = 8;
export const DEFAULT_POINTS = 10;

// UI configuration constants
export const NAME_GRID_COLUMNS = 3;
export const NAME_GRID_TEXT_SIZE = "11px";
export const NAME_GRID_GAP = "1px";
export const MAX_NAMES_DISPLAYED = 9;

// Starter gear limits applied to both random and custom equipment selection
export const STARTING_EQUIPMENT_LIMITS = {
  // Rarity cap for starting equipment
  allowedRarities: ["scrap", "improvised", "poor", "common"],

  // Status cap (0..6) – clamp to this level for starters
  maxStatusLevel: 4,
  // Optional whitelist (leave null to use cap)
  allowedStatusNames: null,

  // Material whitelist per equipment type (semi-realistic early-game options)
  allowedMaterialsByType: {
    clothes: ["cotton", "wool", "padded", "leather"],
    armor: ["leather", "bone", "bronze", "iron"],

    swords: ["bone", "stone", "copper", "pig_iron", "iron"],
    axes: ["bone", "stone", "copper", "pig_iron", "iron"],
    hammers: ["stone", "copper", "pig_iron", "iron"],
    polearms: ["bone", "stone", "copper", "pig_iron", "iron"],

    bows: ["wood", "leather"],
    crossbows: ["wood", "iron"],
    throwing: ["stone", "bone", "iron"],

    shields: ["wood", "leather", "iron"],
    container: ["cloth", "wool", "leather"],
    tool: ["cloth", "leather", "wood", "iron"],
  },

  // Disallow advanced categories for starters
  disallowedTypesBySlot: {
    weapon: [
      "great_swords",
      "great_axes",
      "great_hammers",
      "polearms",
      "bows",
      "crossbows",
    ],
    back: [
      "great_swords",
      "great_axes",
      "great_hammers",
      "polearms",
      "bows",
      "crossbows",
    ],
  },

  // Optional per-slot item blacklists by item type token
  blacklistItemsBySlot: {
    armor: [
      "plate-armor",
      "brigandine",
      "splint-mail",
      "scale-armor",
      "ring-mail",
      "chainmail-armor",
      "chainmail",
    ],
    weapon: [
      // Two-handed and advanced melee
      "greatsword",
      "claymore",
      "zweihander",
      "bastard-sword",
      "greataxe",
      "battleaxe",
      "war-axe",
      "vrakgul-axe",
      "maul",
      "great-hammer",
      "war-hammer",
      "gormith-hammer",
      // Polearms and staves
      "spear",
      "halberd",
      "poleaxe",
      "staff",
      "quarterstaff",
      "scythe",
      "pike",
      "glaive",
      // Advanced bows and crossbows
      "longbow",
      "shortbow",
      "composite-bow",
      "recurve-bow",
      "lyssarion-bow",
      "crossbow",
      "heavy-crossbow",
      "light-crossbow",
      "gormith-crossbow",
    ],
    clothes: [
      "noble-clothes",
      "merchant-clothes",
      "scholar-robes",
      "court-attire",
      "work-clothes",
    ],
  },
};

// Starting gear policy for both random and custom selection
// (Duplicate removed)
