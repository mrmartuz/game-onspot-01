// Group inventory utilities for equipment management
import { gameState } from "../../../../gamestate/game_variables.js";
import {
  canEquipInSlot,
  parseEquipmentString,
  equipmentTypes,
} from "../../../equipment.js";

/**
 * Initialize group inventory if it doesn't exist
 * Group inventory is stored at gameState.groupInventory
 */
export function initializeGroupInventory() {
  if (!gameState.groupInventory) {
    gameState.groupInventory = [];
  }
}

/**
 * Get all items from group inventory
 * This includes:
 * - Items stored in gameState.groupInventory
 * - Items in character containers (if implemented)
 * @returns {Array<string>} Array of equipment item strings
 */
export function getGroupInventory() {
  initializeGroupInventory();
  return gameState.groupInventory || [];
}

/**
 * Add an item to group inventory
 * @param {string} item - Equipment item string
 */
export function addToGroupInventory(item) {
  if (!item) return;
  initializeGroupInventory();
  gameState.groupInventory.push(item);
}

/**
 * Remove an item from group inventory by index or value
 * @param {string|number} itemOrIndex - Item string or index
 * @returns {string|null} Removed item or null
 */
export function removeFromGroupInventory(itemOrIndex) {
  initializeGroupInventory();
  if (typeof itemOrIndex === "number") {
    if (itemOrIndex >= 0 && itemOrIndex < gameState.groupInventory.length) {
      return gameState.groupInventory.splice(itemOrIndex, 1)[0] || null;
    }
  } else {
    const index = gameState.groupInventory.indexOf(itemOrIndex);
    if (index !== -1) {
      return gameState.groupInventory.splice(index, 1)[0] || null;
    }
  }
  return null;
}

/**
 * Get all items from all characters' containers
 * For now, this includes:
 * - All equipped items (can be unequipped)
 * - Items in groupInventory
 * In the future, this could include items stored in character.back container inventory
 * @returns {Array<string>} Array of all available items
 */
export function getAllGroupItems() {
  const allItems = [];
  
  // Get items from group inventory
  allItems.push(...getGroupInventory());
  
  // Get equipped items from all characters (these can be unequipped)
  const allCharacters = [];
  if (gameState.playerCharacter) {
    allCharacters.push(gameState.playerCharacter);
  }
  allCharacters.push(...gameState.group);
  
  allCharacters.forEach((character) => {
    if (character.equipment) {
      Object.values(character.equipment).forEach((item) => {
        // Add valid equipment items (not null, not special markers like "(2h-grip)" or "(empty)")
        if (
          item &&
          typeof item === "string" &&
          !item.startsWith("(") &&
          !allItems.includes(item)
        ) {
          allItems.push(item);
        }
      });
    }
    
    // TODO: In the future, get items from character.containerInventory if it exists
    // if (character.containerInventory && Array.isArray(character.containerInventory)) {
    //   character.containerInventory.forEach(item => {
    //     if (item && !allItems.includes(item)) {
    //       allItems.push(item);
    //     }
    //   });
    // }
  });
  
  return allItems;
}

/**
 * Get items organized by character ownership for a specific slot
 * @param {string} slot - Equipment slot (e.g., "weapon", "armor")
 * @param {string} excludeCharacterId - Optional character ID to exclude currently equipped items on this character
 * @returns {Object} Object with character arrays and inventory array: { characters: [{character, items: []}], inventory: [] }
 */
export function getItemsByCharacterForSlot(slot, excludeCharacterId = null) {
  const result = {
    characters: [],
    inventory: [],
  };
  
  const seenItems = new Set();
  
  // Get the character being edited to exclude their currently equipped items
  let excludeCharacter = null;
  if (excludeCharacterId) {
    if (excludeCharacterId === "player" && gameState.playerCharacter) {
      excludeCharacter = gameState.playerCharacter;
    } else if (excludeCharacterId.startsWith("group_")) {
      const index = parseInt(excludeCharacterId.replace("group_", ""), 10);
      if (index >= 0 && index < gameState.group.length) {
        excludeCharacter = gameState.group[index];
      }
    }
  }
  
  // Get all characters
  const allCharacters = [];
  if (gameState.playerCharacter) {
    allCharacters.push(gameState.playerCharacter);
  }
  allCharacters.push(...gameState.group);
  
  // Find items equipped on each character for this slot
  allCharacters.forEach((character) => {
    if (!character.equipment) return;
    
    // Skip if this is the character we're editing (don't show their currently equipped items)
    if (character === excludeCharacter) return;
    
    const characterItems = [];
    
    // Check each equipment slot - only include items that can be equipped in the requested slot
    for (const [slotKey, item] of Object.entries(character.equipment)) {
      if (item && typeof item === "string" && !item.startsWith("(")) {
        // Check if this item fits the requested slot
        if (canEquipInSlot(item, slot)) {
          if (!seenItems.has(item)) {
            characterItems.push(item);
            seenItems.add(item);
          }
        }
      }
    }
    
    if (characterItems.length > 0) {
      result.characters.push({
        character: character,
        items: characterItems,
      });
    }
  });
  
  // Get items from group inventory
  const groupInventory = getGroupInventory();
  groupInventory.forEach((item) => {
    if (!seenItems.has(item) && canEquipInSlot(item, slot)) {
      result.inventory.push(item);
      seenItems.add(item);
    }
  });
  
  return result;
}

/**
 * Filter group inventory items by equipment slot
 * @param {string} slot - Equipment slot (e.g., "weapon", "armor")
 * @param {string} excludeCharacterId - Optional character ID to exclude currently equipped items on this character
 * @returns {Array<string>} Array of items that can be equipped in the slot
 */
export function getItemsForSlot(slot, excludeCharacterId = null) {
  const organized = getItemsByCharacterForSlot(slot, excludeCharacterId);
  const allItems = [];
  
  // Add items from characters
  organized.characters.forEach((charData) => {
    allItems.push(...charData.items);
  });
  
  // Add items from inventory
  allItems.push(...organized.inventory);
  
  return allItems;
}

/**
 * Get the slot that an item belongs to
 * @param {string} item - Equipment item string
 * @returns {string|null} Slot name or null
 */
export function getItemSlot(item) {
  if (!item) return null;
  
  const parsed = parseEquipmentString(item);
  if (!parsed) return null;
  
  // Find which equipment type this item belongs to
  for (const [typeName, typeData] of Object.entries(equipmentTypes)) {
    if (typeData.items && typeData.items.includes(parsed.type)) {
      return typeData.slot;
    }
  }
  
  return null;
}

