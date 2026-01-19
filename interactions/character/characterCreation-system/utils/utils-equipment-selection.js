// Equipment selection utilities for character creation
import { equipmentAssignment } from "../../equipment-assignment.js";
import {
  equipmentTypes,
  parseEquipmentString,
} from "../../../../interactions/equipment.js";
import { EQUIPMENT_SLOTS, STARTING_EQUIPMENT_LIMITS } from "../constants.js";
import {
  getShowChoiceDialog,
  getDialogValue,
} from "../../../../interactions.js";

/**
 * Generate 5 diverse random items for a specific equipment slot
 * @param {string} slotKey - Equipment slot key (e.g., "weapon", "armor")
 * @param {string} className - Character class for appropriate item generation
 * @returns {Array<string>} Array of 5 equipment item strings
 */
export function generateDiverseItemsForSlot(slotKey, className = null) {
  const items = [];

  // Map slots to equipment types
  const slotToEquipmentTypes = {
    clothes: ["clothes"],
    armor: ["armor"],
    weapon: [
      "swords",
      "great_swords",
      "axes",
      "great_axes",
      "hammers",
      "great_hammers",
      "polearms",
      "throwing",
      "bows",
      "crossbows",
    ],
    secondHand: ["shields", "throwing", "swords"],
    back: [
      "container",
      "great_swords",
      "great_axes",
      "great_hammers",
      "polearms",
      "bows",
      "crossbows",
    ],
    tool: ["tool"],
  };

  // Filter disallowed categories per slot
  const filteredTypes = (slot) => {
    const types = slotToEquipmentTypes[slot] || [];
    const banned =
      STARTING_EQUIPMENT_LIMITS.disallowedTypesBySlot?.[slot] || [];
    return types.filter((t) => !banned.includes(t));
  };

  const equipmentTypeKeys = filteredTypes(slotKey);

  if (equipmentTypeKeys.length === 0) {
    return items;
  }

  // Generate items from different types to ensure diversity
  const itemsPerType = Math.max(1, Math.floor(5 / equipmentTypeKeys.length));
  let generatedCount = 0;

  // Shuffle equipment types to get variety
  const shuffledTypes = [...equipmentTypeKeys].sort(() => Math.random() - 0.5);

  for (const equipmentType of shuffledTypes) {
    if (generatedCount >= 5) break;

    const typeData = equipmentTypes[equipmentType];
    if (!typeData || !typeData.items || typeData.items.length === 0) {
      continue;
    }

    // Generate items from this type
    const typeItems = typeData.items;
    const itemsToGenerate = Math.min(
      itemsPerType,
      5 - generatedCount,
      typeItems.length
    );

    // Shuffle items and pick unique ones
    const shuffledItems = [...typeItems].sort(() => Math.random() - 0.5);
    const selectedItems = shuffledItems.slice(0, itemsToGenerate);

    for (const itemType of selectedItems) {
      if (generatedCount >= 5) break;

      // Determine the correct equipment type for generating
      let actualEquipmentType = equipmentType;
      if (equipmentType === "weapon" || slotKey === "weapon") {
        // Use the weapon category helper for weapons
        actualEquipmentType = equipmentAssignment.getWeaponCategory(itemType);
      }

      const item = equipmentAssignment.generateEquipmentItem(
        actualEquipmentType,
        itemType,
        STARTING_EQUIPMENT_LIMITS
      );

      if (
        item &&
        !items.includes(item) &&
        withinStartingLimits(item, actualEquipmentType, slotKey)
      ) {
        items.push(item);
        generatedCount++;
      }
    }
  }

  // If we don't have 5 items yet, fill the rest with random items
  while (items.length < 5 && equipmentTypeKeys.length > 0) {
    const randomType =
      equipmentTypeKeys[Math.floor(Math.random() * equipmentTypeKeys.length)];
    const typeData = equipmentTypes[randomType];
    if (typeData && typeData.items && typeData.items.length > 0) {
      const randomItemType =
        typeData.items[Math.floor(Math.random() * typeData.items.length)];

      let actualEquipmentType = randomType;
      if (slotKey === "weapon") {
        actualEquipmentType =
          equipmentAssignment.getWeaponCategory(randomItemType);
      }

      const item = equipmentAssignment.generateEquipmentItem(
        actualEquipmentType,
        randomItemType,
        STARTING_EQUIPMENT_LIMITS
      );

      if (
        item &&
        !items.includes(item) &&
        withinStartingLimits(item, actualEquipmentType, slotKey)
      ) {
        items.push(item);
      } else {
        // Avoid infinite loop if all items are duplicates
        break;
      }
    } else {
      break;
    }
  }

  return items;
}

/**
 * Generate diverse items for all equipment slots
 * @param {string} className - Character class for appropriate item generation
 * @returns {Object} Object with arrays of items for each slot
 */
export function generateDiverseItemsForAllSlots(className = null) {
  const availableItems = {};

  EQUIPMENT_SLOTS.forEach(({ key }) => {
    availableItems[key] = generateDiverseItemsForSlot(key, className);
  });

  return availableItems;
}

/**
 * Check if a weapon is 2-handed by parsing its item string
 * @param {string} itemString - Equipment item string
 * @returns {boolean} True if the weapon is 2-handed
 */
export function isItem2HandedWeapon(itemString) {
  if (!itemString) return false;

  const parsed = parseEquipmentString(itemString);
  if (!parsed || !parsed.type) return false;

  return equipmentAssignment.is2HandedWeapon(parsed.type);
}

// Double-safety check for limits when building selection lists
function withinStartingLimits(equipmentString, equipmentType, slotKey) {
  const parsed = parseEquipmentString(equipmentString);
  if (!parsed) return false;

  // Rarity
  if (
    STARTING_EQUIPMENT_LIMITS.allowedRarities &&
    !STARTING_EQUIPMENT_LIMITS.allowedRarities.includes(parsed.rarity)
  )
    return false;

  // Material
  const allowedMats =
    STARTING_EQUIPMENT_LIMITS.allowedMaterialsByType?.[equipmentType];
  if (allowedMats && !allowedMats.includes(parsed.material)) return false;

  // Status (by name if provided, otherwise assume generator clamped by level)
  if (
    STARTING_EQUIPMENT_LIMITS.allowedStatusNames &&
    !STARTING_EQUIPMENT_LIMITS.allowedStatusNames.includes(parsed.status)
  )
    return false;

  // Item blacklist per slot (compare by parsed.type)
  const blacklist =
    STARTING_EQUIPMENT_LIMITS.blacklistItemsBySlot?.[slotKey] || [];
  if (blacklist.includes(parsed.type)) return false;

  return true;
}

/**
 * Show item selection dialog for a specific slot
 * @param {string} slotKey - Equipment slot key
 * @param {Array<string>} items - Array of available items
 * @param {string} slotLabel - Display label for the slot
 * @returns {Promise<string|null>} Selected item string or null if cancelled
 */
export async function showItemSelectionDialog(slotKey, items, slotLabel) {
  const components = [];

  components.push({
    type: "message",
    label: `\nSelect ${slotLabel}:\n`,
    value: "",
  });

  // For secondHand slot, add "(empty)" option if not already in items
  let itemsToShow = [...items];
  if (slotKey === "secondHand" && !itemsToShow.includes("(empty)")) {
    itemsToShow = ["(empty)", ...itemsToShow].slice(0, 5);
  }

  // Create buttons for each item (max 5 items)
  const itemButtons = itemsToShow.slice(0, 5).map((item, index) => {
    // Truncate long item names for display (but not for special items like "(empty)")
    const displayText =
      item.length > 40 && !item.startsWith("(")
        ? item.substring(0, 37) + "..."
        : item;

    return {
      label: displayText,
      value: `select_item_${index}`,
      disabled: false,
    };
  });

  components.push({
    type: "button_grid",
    columns: 1,
    textSize: "11px",
    gap: "2px",
    buttons: itemButtons,
  });

  components.push({
    type: "button",
    label: "Cancel",
    value: "cancel",
  });

  const result = await getShowChoiceDialog(`Choose ${slotLabel}`, components);
  const choiceValue = getDialogValue(result, "value");

  if (choiceValue === "cancel" || !choiceValue) {
    return null;
  }

  // Extract index from value
  const indexMatch = choiceValue.match(/select_item_(\d+)/);
  if (indexMatch) {
    const index = parseInt(indexMatch[1], 10);
    // Use itemsToShow instead of items since we may have added "(empty)"
    if (index >= 0 && index < itemsToShow.length) {
      const selected = itemsToShow[index];
      // Return null for "(empty)" so it can be handled properly
      return selected === "(empty)" ? "(empty)" : selected;
    }
  }

  return null;
}
