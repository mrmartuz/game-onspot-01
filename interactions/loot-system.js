// Monster Head Loot System
import { gameState } from "../gamestate/game_variables.js";
import { getMaxStorage } from "../utils.js";

// Inventory size mapping for monster heads
const headSizes = {
  Goblin: 1,
  Wolf: 1,
  Orc: 1,
  Bear: 1,
  MountainLion: 1,
  Troll: 3,
  Demon: 5,
  Dragon: 10,
};

// Rarity multipliers for pricing
const rarityMultipliers = {
  common: 1,
  uncommon: 2,
  rare: 4,
  legendary: 10,
};

// Location multipliers for pricing
const locationMultipliers = {
  village: 1.0,
  city: 1.2,
  army: 1.8,
};

/**
 * Generate a monster head item from a defeated monster
 * @param {Object} monster - The defeated monster object
 * @returns {Object} Monster head item
 */
export function generateMonsterHead(monster) {
  return {
    race: monster.race,
    rarity: monster.rarity,
    level: monster.level,
    inventorySize: monster.inventorySize || getHeadInventorySize(monster.race),
    timestamp: Date.now(),
    id: `head_${monster.race}_${Date.now()}`,
  };
}

/**
 * Get inventory size required for a monster head based on race
 * @param {string} race - Monster race
 * @returns {number} Inventory space required
 */
export function getHeadInventorySize(race) {
  return headSizes[race] || 1;
}

/**
 * Calculate the value of a monster head at a specific location
 * @param {Object} head - Monster head object
 * @param {string} locationType - Type of location (village, city, army)
 * @param {number} interactBonus - Player's interact bonus
 * @returns {number} Gold value of the head
 */
export function calculateHeadValue(head, locationType, interactBonus = 0) {
  const rarityMultiplier = rarityMultipliers[head.rarity] || 1;
  const locationMultiplier = locationMultipliers[locationType] || 1.0;

  const basePrice = rarityMultiplier * head.level * 10;
  const finalPrice = Math.floor(
    basePrice * locationMultiplier * (1 + interactBonus)
  );

  return Math.max(1, finalPrice); // Minimum 1 gold
}

/**
 * Add a monster head to the player's inventory
 * @param {Object} head - Monster head object
 * @returns {boolean} True if successfully added, false if not enough space
 */
export function addHeadToInventory(head) {
  console.log("Adding head to inventory:", head);
  console.log("Current gameState.monsterHeads:", gameState.monsterHeads);

  const currentHeadSpace = gameState.monsterHeads.reduce(
    (total, h) => total + h.inventorySize,
    0
  );
  const maxStorage = getMaxStorage();

  console.log("Current head space:", currentHeadSpace);
  console.log("Max storage:", maxStorage);
  console.log("Head inventory size:", head.inventorySize);

  if (currentHeadSpace + head.inventorySize <= maxStorage) {
    gameState.monsterHeads.push(head);
    console.log(
      "Successfully added head. New monsterHeads:",
      gameState.monsterHeads
    );
    return true;
  }

  console.log("Not enough space to add head");
  return false;
}

/**
 * Remove a monster head from inventory by index
 * @param {number} index - Index of head to remove
 * @returns {Object|null} Removed head object or null if invalid index
 */
export function removeHeadFromInventory(index) {
  if (index >= 0 && index < gameState.monsterHeads.length) {
    return gameState.monsterHeads.splice(index, 1)[0];
  }
  return null;
}

/**
 * Get total inventory space used by monster heads
 * @returns {number} Total space used
 */
export function getTotalHeadSpace() {
  return gameState.monsterHeads.reduce(
    (total, head) => total + head.inventorySize,
    0
  );
}

/**
 * Get available inventory space for monster heads
 * @returns {number} Available space
 */
export function getAvailableHeadSpace() {
  const maxStorage = getMaxStorage();
  const usedSpace = getTotalHeadSpace();
  return Math.max(0, maxStorage - usedSpace);
}

/**
 * Get race emoji for display
 * @param {string} race - Monster race
 * @returns {string} Emoji for the race
 */
export function getRaceEmoji(race) {
  const raceEmojis = {
    Goblin: "👺",
    Wolf: "🐺",
    Orc: "👹",
    Bear: "🐻",
    MountainLion: "🦁",
    Troll: "🧌",
    Demon: "👿",
    Dragon: "🐉",
  };
  return raceEmojis[race] || "💀";
}

/**
 * Format monster head for display
 * @param {Object} head - Monster head object
 * @param {number} index - Index in inventory
 * @returns {string} Formatted display string
 */
export function formatHeadForDisplay(head, index) {
  const emoji = getRaceEmoji(head.race);
  return `${emoji} ${head.race} Head (Level ${head.level}, ${head.rarity}) - ${head.inventorySize} space`;
}

/**
 * Get all monster heads formatted for display
 * @returns {Array} Array of formatted head strings
 */
export function getAllHeadsForDisplay() {
  return gameState.monsterHeads.map((head, index) => ({
    text: formatHeadForDisplay(head, index),
    head: head,
    index: index,
  }));
}
