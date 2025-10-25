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
