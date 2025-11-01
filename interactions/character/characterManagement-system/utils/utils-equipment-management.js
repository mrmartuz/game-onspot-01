// Equipment management utilities for character management system
import { showChoiceDialog } from "../../../showDialog.js";
import { EQUIPMENT_SLOTS } from "../../characterCreation-system/constants.js";
import { getItemsForSlot } from "./utils-group-inventory.js";
import {
  canEquipInSlot,
  parseEquipmentString,
} from "../../../equipment.js";
import { equipmentAssignment } from "../../equipment-assignment.js";
import { gameState } from "../../../../gamestate/game_variables.js";

/**
 * Check if a weapon is 2-handed
 * @param {string} itemString - Equipment item string
 * @returns {boolean} True if the weapon is 2-handed
 */
export function isItem2HandedWeapon(itemString) {
  if (!itemString) return false;
  
  const parsed = parseEquipmentString(itemString);
  if (!parsed || !parsed.type) return false;
  
  return equipmentAssignment.is2HandedWeapon(parsed.type);
}

/**
 * Create interactive equipment display for character management
 * Slot buttons are clickable and will open item selection dialogs
 * @param {Object} equipment - Current character equipment object
 * @param {string} characterId - Character ID for excluding currently equipped items
 * @param {Array} slots - Equipment slot configuration
 * @returns {Array} Array of components including button grid
 */
export function createInteractiveEquipmentDisplay(
  equipment,
  characterId = null,
  slots = EQUIPMENT_SLOTS
) {
  const components = [];

  components.push({
    type: "message",
    label: "\nEQUIPMENT ⚔️🛡️\n(Click slot names to equip items from group inventory)",
    value: "",
  });

  // Create button grid with slot names and items side by side
  const equipmentButtons = [];

  slots.forEach(({ key, label }) => {
    const item = equipment[key];
    let displayText;

    if (item) {
      // Special handling for secondHand to show "(2h-grip)" or "(empty)"
      if (
        key === "secondHand" &&
        (item === "(2h-grip)" || item === "(empty)")
      ) {
        displayText = item;
      } else {
        // Truncate long item names for display
        displayText =
          item.length > 35 ? item.substring(0, 32) + "..." : item;
      }
    } else {
      displayText = "(empty)";
    }

    // Get available items for this slot from group inventory
    const availableItems = getItemsForSlot(key, characterId);
    const hasAvailableItems = availableItems.length > 0;

    // Push slot name button (left column) - clickable if items available
    equipmentButtons.push({
      label: label,
      value: hasAvailableItems
        ? `equip_slot_${key}`
        : `display_equipment_slot_${key}`,
      disabled: !hasAvailableItems, // Disabled if no items available
    });

    // Push item button (right column) - clickable to unequip
    const canUnequip = item && !item.startsWith("(");
    equipmentButtons.push({
      label: displayText,
      value: canUnequip ? `unequip_slot_${key}` : `display_equipment_item_${key}`,
      disabled: !canUnequip,
    });
  });

  components.push({
    type: "button_grid",
    columns: 2,
    textSize: "11px",
    gap: "2px",
    buttons: equipmentButtons,
  });

  return components;
}

/**
 * Show item selection dialog for a specific slot
 * Items are organized by character (who has them equipped) then group inventory
 * @param {string} slotKey - Equipment slot key
 * @param {Array<string>} items - Array of available items (for backwards compatibility)
 * @param {string} slotLabel - Display label for the slot
 * @param {Object} organizedItems - Optional organized items object from getItemsByCharacterForSlot
 * @returns {Promise<string|null>} Selected item string or null if cancelled
 */
export async function showEquipmentSelectionDialog(
  slotKey,
  items,
  slotLabel,
  organizedItems = null
) {
  const components = [];
  const { raceEmoji, classEmoji } = await import("../../../../gamestate/emoji-database.js");
  const { classDatabase } = await import("../../../combat/classes.js");

  components.push({
    type: "message",
    label: `\nSelect ${slotLabel}:\n`,
    value: "",
  });

  // Get organized items if not provided
  if (!organizedItems) {
    const { getItemsByCharacterForSlot } = await import("./utils-group-inventory.js");
    organizedItems = getItemsByCharacterForSlot(slotKey, null);
  }

  let allItemsToShow = [];
  let itemIndex = 0;

  // Add items from each character
  organizedItems.characters.forEach((charData) => {
    const character = charData.character;
    const raceEmojiIcon = raceEmoji[character.race] || "👤";
    const classData = classDatabase[character.class];
    const className = classData ? classData.name : character.class;
    const classEmojiIcon = classEmoji[character.class] || "👤";

    // Character header
    components.push({
      type: "message",
      label: `${raceEmojiIcon} ${character.firstName} ${character.lastName} - ${className} ${classEmojiIcon} Lvl.${character.level || 1}`,
      value: "",
    });

    // Items equipped by this character for this slot
    charData.items.forEach((item) => {
      const displayText =
        item.length > 40 && !item.startsWith("(")
          ? item.substring(0, 37) + "..."
          : item;

      components.push({
        type: "button",
        label: `  ${displayText}`,
        value: `select_item_${itemIndex}`,
        disabled: false,
      });

      allItemsToShow.push(item);
      itemIndex++;
    });
  });

  // Add group inventory items
  if (organizedItems.inventory.length > 0) {
    components.push({
      type: "message",
      label: "\n📦 Group Inventory:",
      value: "",
    });

    organizedItems.inventory.forEach((item) => {
      const displayText =
        item.length > 40 && !item.startsWith("(")
          ? item.substring(0, 37) + "..."
          : item;

      components.push({
        type: "button",
        label: `  ${displayText}`,
        value: `select_item_${itemIndex}`,
        disabled: false,
      });

      allItemsToShow.push(item);
      itemIndex++;
    });
  }

  // For secondHand slot, add "(empty)" option
  if (slotKey === "secondHand" && !allItemsToShow.includes("(empty)")) {
    components.push({
      type: "message",
      label: "\n",
      value: "",
    });
    components.push({
      type: "button",
      label: "(empty)",
      value: `select_item_${itemIndex}`,
      disabled: false,
    });
    allItemsToShow.push("(empty)");
    itemIndex++;
  }

  if (allItemsToShow.length === 0) {
    components.push({
      type: "message",
      label: "No items available for this slot.",
      value: "",
    });
  }

  components.push({
    type: "message",
    label: "\n",
    value: "",
  });

  components.push({
    type: "button",
    label: "Cancel",
    value: "cancel",
  });

  const result = await showChoiceDialog("Choose Equipment", components);

  if (result === "cancel" || !result) {
    return null;
  }

  // Extract index from value
  const indexMatch = result.match(/select_item_(\d+)/);
  if (indexMatch) {
    const index = parseInt(indexMatch[1], 10);
    if (index >= 0 && index < allItemsToShow.length) {
      const selected = allItemsToShow[index];
      // Return null for "(empty)" so it can be handled properly
      return selected === "(empty)" ? "(empty)" : selected;
    }
  }

  return null;
}

/**
 * Remove an item from wherever it's currently located (equipped or in inventory)
 * @param {string} item - Item to remove
 * @param {Object} excludeCharacter - Character to exclude from search
 * @param {Function} removeFromGroupInventory - Function to remove from group inventory
 */
function removeItemFromCurrentLocation(item, excludeCharacter, removeFromGroupInventory) {
  // Try to remove from group inventory first
  const removed = removeFromGroupInventory(item);
  if (removed) {
    return true;
  }
  
  // If not in group inventory, find it on another character and unequip it
  const allCharacters = [];
  if (gameState.playerCharacter && gameState.playerCharacter !== excludeCharacter) {
    allCharacters.push(gameState.playerCharacter);
  }
  gameState.group.forEach((char) => {
    if (char !== excludeCharacter) {
      allCharacters.push(char);
    }
  });
  
  for (const char of allCharacters) {
    if (char.equipment) {
      for (const [slot, equippedItem] of Object.entries(char.equipment)) {
        if (equippedItem === item) {
          char.equipment[slot] = null;
          // Handle 2h weapon cleanup
          if (slot === "weapon" && char.equipment.secondHand === "(2h-grip)") {
            char.equipment.secondHand = null;
          }
          return true;
        }
      }
    }
  }
  
  return false;
}

/**
 * Equip an item on a character
 * Handles unequipping the old item and adding it to group inventory
 * Also removes the new item from wherever it's currently located
 * @param {Object} character - Character object
 * @param {string} slotKey - Equipment slot key
 * @param {string} item - Item to equip
 * @param {Function} addToGroupInventory - Function to add items to group inventory
 * @param {Function} removeFromGroupInventory - Function to remove items from group inventory
 */
export function equipItem(
  character,
  slotKey,
  item,
  addToGroupInventory,
  removeFromGroupInventory
) {
  // Get currently equipped item
  const currentItem = character.equipment[slotKey];

  // Add current item to group inventory if it exists and isn't a special marker
  if (currentItem && !currentItem.startsWith("(")) {
    addToGroupInventory(currentItem);
  }

  // If equipping a new item (not empty), remove it from its current location
  if (item && item !== "(empty)") {
    removeItemFromCurrentLocation(item, character, removeFromGroupInventory);
  }

  // Equip new item
  character.equipment[slotKey] = item === "(empty)" ? null : item;

  // Handle 2h weapon logic
  if (slotKey === "weapon") {
    if (isItem2HandedWeapon(item)) {
      // Set secondHand to empty when 2h weapon is equipped
      if (character.equipment.secondHand && !character.equipment.secondHand.startsWith("(")) {
        addToGroupInventory(character.equipment.secondHand);
      }
      character.equipment.secondHand = "(2h-grip)";
    } else if (character.equipment.secondHand === "(2h-grip)") {
      // Clear secondHand if switching from 2h to 1h weapon
      character.equipment.secondHand = null;
    }
  }

  // If secondHand is equipped and it's not "(empty)" or "(2h-grip)",
  // and current weapon is 2h, we shouldn't allow this, but if it happens, clear the weapon
  if (
    slotKey === "secondHand" &&
    item !== "(empty)" &&
    item !== "(2h-grip)" &&
    isItem2HandedWeapon(character.equipment.weapon)
  ) {
    if (character.equipment.weapon) {
      addToGroupInventory(character.equipment.weapon);
    }
    character.equipment.weapon = null;
  }
}

/**
 * Unequip an item from a character
 * Adds the item to group inventory
 * @param {Object} character - Character object
 * @param {string} slotKey - Equipment slot key
 * @param {Function} addToGroupInventory - Function to add items to group inventory
 */
export function unequipItem(
  character,
  slotKey,
  addToGroupInventory
) {
  const currentItem = character.equipment[slotKey];
  
  if (currentItem && !currentItem.startsWith("(")) {
    addToGroupInventory(currentItem);
    character.equipment[slotKey] = null;
    
    // Handle 2h weapon logic
    if (slotKey === "weapon" && character.equipment.secondHand === "(2h-grip)") {
      character.equipment.secondHand = null;
    }
  } else if (slotKey === "secondHand" && currentItem === "(2h-grip)") {
    // Can't unequip 2h grip, need to unequip the weapon instead
    if (character.equipment.weapon) {
      addToGroupInventory(character.equipment.weapon);
      character.equipment.weapon = null;
      character.equipment.secondHand = null;
    }
  }
}

