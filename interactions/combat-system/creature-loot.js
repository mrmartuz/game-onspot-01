// Creature loot generation functions
// Handles loot table generation and experience value calculations

import {
  equipmentTypes,
} from "../equipment.js";
import {
  getRarityExperienceMultiplier,
  getRarityLootMultiplier,
} from "./databases/rarity-combat-multipliers.js";
import { generateEquipmentItem } from "./creature-generation.js";

/**
 * Calculate experience value for a monster based on level and rarity
 * @param {Object} monster - Monster object
 * @returns {number} Experience value
 */
export function calculateExperienceValue(monster) {
  const baseExp = monster.level * 10;
  const rarityMultiplier = getRarityExperienceMultiplier(monster.rarity);
  return Math.floor(baseExp * rarityMultiplier);
}

/**
 * Generate loot table for a monster
 * @param {Object} monster - Monster object
 * @returns {Array} Loot table array with items and gold
 */
export function generateLootTable(monster) {
  const lootTable = [];

  // Base loot chance based on rarity - use database
  const lootChance = getRarityLootMultiplier(monster.rarity);

  if (Math.random() < lootChance) {
    // Generate random loot item
    lootTable.push({
      type: "equipment",
      item: generateRandomLootItem(monster.level),
      chance: 1.0,
    });
  }

  // Always drop gold
  const goldAmount = Math.floor(monster.level * 5 * (Math.random() + 0.5));
  lootTable.push({
    type: "gold",
    amount: goldAmount,
    chance: 1.0,
  });

  return lootTable;
}

/**
 * Generate a random loot item for a given level
 * @param {number} level - Creature level
 * @returns {string|null} Generated equipment item string or null if generation failed
 */
export function generateRandomLootItem(level) {
  // Use valid equipment type keys
  const validEquipmentTypeKeys = [
    "swords",
    "axes",
    "hammers",
    "armor",
    "shields",
    "tool",
    "bows",
  ];
  const randomTypeKey =
    validEquipmentTypeKeys[
      Math.floor(Math.random() * validEquipmentTypeKeys.length)
    ];

  const typeData = equipmentTypes[randomTypeKey];
  if (!typeData || !typeData.items || typeData.items.length === 0) {
    console.warn(
      `[LOOT GENERATION] Invalid equipment type or no items: ${randomTypeKey}`
    );
    return null;
  }

  const randomItem =
    typeData.items[Math.floor(Math.random() * typeData.items.length)];
  const generatedItem = generateEquipmentItem(randomTypeKey, randomItem);

  if (generatedItem) {
    console.log(
      `[LOOT GENERATION] Generated random loot item: ${generatedItem}`
    );
  } else {
    console.warn(
      `[LOOT GENERATION] Failed to generate item for type: ${randomTypeKey}, item: ${randomItem}`
    );
  }

  return generatedItem;
}




