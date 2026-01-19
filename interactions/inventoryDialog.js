import { gameState } from "../gamestate/game_variables.js";
import { getMaxStorage } from "../utils.js";
import { getGroupBonus } from "../utils.js";
import { getStorageBreakdown } from "../utils.js";
import { getShowChoiceDialog } from "../interactions.js";
import { getCurrentGameDate } from "../time_system.js";
import { getTotalHeadSpace, getAllHeadsForDisplay } from "./loot-system.js";
import { getGroupInventory } from "./character/characterManagement-system/utils/utils-group-inventory.js";
import {
  parseEquipmentString,
  equipmentTypes,
  getEquipmentByName,
  getEquipmentMaterial,
} from "./equipment.js";
import { equipmentAssignment } from "./character/equipment-assignment.js";

/**
 * Get all equipped items from all characters (player + group)
 * @returns {Set<string>} Set of all equipped item strings
 */
function getAllEquippedItems() {
  const equippedItems = new Set();

  // Get all characters
  const allCharacters = [];
  if (gameState.playerCharacter) {
    allCharacters.push(gameState.playerCharacter);
  }
  allCharacters.push(...gameState.group);

  // Collect all equipped items
  allCharacters.forEach((character) => {
    if (character.equipment) {
      Object.values(character.equipment).forEach((item) => {
        // Add valid equipment items (not null, not special markers like "(2h-grip)" or "(empty)")
        if (item && typeof item === "string" && !item.startsWith("(")) {
          equippedItems.add(item);
        }
      });
    }
  });

  return equippedItems;
}

/**
 * Calculate item weight using formula: Math.ceil((baseWeight * material.weight) / 10)
 * Falls back to defaults if calculation fails
 * @param {Object} parsed - Parsed equipment string
 * @param {string} categoryType - Equipment type category name
 * @returns {number} Item weight
 */
function calculateItemWeight(parsed, categoryType) {
  if (!parsed) return 1;

  // Try to normalize item name to match database keys (remove common suffixes)
  let itemName = parsed.type;
  let item = getEquipmentByName(itemName);

  // If not found, try removing common suffixes like "-armor"
  if (!item && itemName.includes("-")) {
    const parts = itemName.split("-");
    // Try the first part (e.g., "chainmail" from "chainmail-armor")
    item = getEquipmentByName(parts[0]);
    if (item) {
      itemName = parts[0];
    }
  }

  const material = getEquipmentMaterial(parsed.material);

  // Try to calculate weight using formula
  if (
    item &&
    material &&
    item.baseWeight !== undefined &&
    material.weight !== undefined
  ) {
    return Math.ceil((item.baseWeight * material.weight) / 10);
  }

  // Fallback defaults based on category
  const is2Handed = equipmentAssignment.is2HandedWeapon(parsed.type);
  const isLeather =
    parsed.material && parsed.material.toLowerCase() === "leather";

  // Determine category-based defaults
  if (categoryType === "shields" || categoryType === "great_shields") {
    return 4; // Shields default
  } else if (categoryType === "armor") {
    return isLeather ? 5 : 8; // Leather armor: 5w, Metal armor: 8w
  } else if (categoryType === "tool") {
    return 3; // Tools default
  } else if (
    is2Handed ||
    [
      "great_swords",
      "great_axes",
      "polearms",
      "great_hammers",
      "bows",
      "crossbows",
    ].includes(categoryType)
  ) {
    return 7; // 2H weapons default
  } else if (["swords", "axes", "hammers", "throwing"].includes(categoryType)) {
    return 3; // 1H weapons default
  }

  return 1; // Generic default
}

/**
 * Categorize and calculate weights for unequipped items
 * @returns {Object} Object with categorized items and their weights
 */
function categorizeUnequippedItems() {
  const equippedItems = getAllEquippedItems();
  const groupInventory = getGroupInventory();
  const categories = {};

  groupInventory.forEach((itemString) => {
    // Skip if item is equipped
    if (equippedItems.has(itemString)) {
      return;
    }

    const parsed = parseEquipmentString(itemString);
    if (!parsed) return;

    // Find which equipment type this item belongs to
    let categoryType = null;
    let categoryName = null;

    for (const [typeName, typeData] of Object.entries(equipmentTypes)) {
      if (typeData.items && typeData.items.includes(parsed.type)) {
        categoryType = typeName;
        categoryName = typeData.name;
        break;
      }
    }

    // If not found in equipmentTypes, try to determine from parsed type
    if (!categoryType) {
      // Check if it's a 2H weapon
      if (equipmentAssignment.is2HandedWeapon(parsed.type)) {
        // Determine which 2H category
        if (parsed.type.includes("sword")) {
          categoryType = "great_swords";
          categoryName = "Great Swords";
        } else if (parsed.type.includes("axe")) {
          categoryType = "great_axes";
          categoryName = "Great Axes";
        } else if (
          parsed.type.includes("hammer") ||
          parsed.type.includes("maul")
        ) {
          categoryType = "great_hammers";
          categoryName = "Great Hammers";
        } else if (parsed.type.includes("bow")) {
          categoryType = "bows";
          categoryName = "Bows";
        } else if (parsed.type.includes("crossbow")) {
          categoryType = "crossbows";
          categoryName = "Crossbows";
        } else {
          categoryType = "polearms";
          categoryName = "Polearms";
        }
      } else {
        // Default to "Other" if we can't categorize
        categoryType = "other";
        categoryName = "Other";
      }
    }

    if (!categories[categoryType]) {
      categories[categoryType] = {
        name: categoryName,
        items: [],
      };
    }

    const weight = calculateItemWeight(parsed, categoryType);
    categories[categoryType].items.push({
      itemString,
      parsed,
      weight,
    });
  });

  return categories;
}

/**
 * Format categorized items into display string
 * @param {Object} categories - Categorized items object
 * @returns {string} Formatted string for display
 */
function formatCategorizedItems(categories) {
  if (Object.keys(categories).length === 0) {
    return "\n**Unequipped Items:**\n  (none)";
  }

  let result = "\n**Unequipped Items:**\n";

  // Define category order for display
  const categoryOrder = [
    "swords",
    "axes",
    "hammers",
    "throwing",
    "great_swords",
    "great_axes",
    "great_hammers",
    "polearms",
    "bows",
    "crossbows",
    "shields",
    "great_shields",
    "armor",
    "tool",
    "clothes",
    "accessory",
    "container",
    "other",
  ];

  categoryOrder.forEach((categoryType) => {
    if (categories[categoryType] && categories[categoryType].items.length > 0) {
      const category = categories[categoryType];
      const sortedItems = category.items.sort((a, b) => {
        const nameA = a.itemString.toLowerCase();
        const nameB = b.itemString.toLowerCase();
        return nameA.localeCompare(nameB);
      });

      let categoryTotalWeight = 0;
      const itemsText = sortedItems
        .map((item) => {
          categoryTotalWeight += item.weight;
          return `  ${item.itemString} (${item.weight}w)`;
        })
        .join("\n");

      result += `\n**${category.name}:** (${categoryTotalWeight}w total)\n${itemsText}`;
    }
  });

  return result;
}

function getNextConsumptionTimes() {
  const currentGameDate = getCurrentGameDate();
  const currentHour = currentGameDate.getHours();
  const currentMinute = currentGameDate.getMinutes();

  let nextFood = null;
  let nextWater = null;
  let nextGold = null;

  // Find next food consumption time
  const foodTimes = [6, 12, 18];
  for (let hour of foodTimes) {
    if (hour > currentHour || (hour === currentHour && currentMinute < 60)) {
      nextFood = hour;
      break;
    }
  }
  if (!nextFood) nextFood = foodTimes[0] + 24; // Next day

  // Find next water consumption time
  const waterTimes = [7, 14, 20];
  for (let hour of waterTimes) {
    if (hour > currentHour || (hour === currentHour && currentMinute < 60)) {
      nextWater = hour;
      break;
    }
  }
  if (!nextWater) nextWater = waterTimes[0] + 24; // Next day

  // Find next gold consumption time
  if (currentHour < 12) {
    nextGold = 12;
  } else {
    nextGold = 36; // Next day at noon
  }

  return { nextFood, nextWater, nextGold, currentHour, currentMinute };
}

export async function showInventoryDialog() {
  const storageBreakdown = getStorageBreakdown();
  const maxStorage = getMaxStorage();

  // Calculate daily consumption rates (3 meals/drinks per day, 1 unit per character each)
  const dailyFoodConsumption = gameState.group.length * 3;
  const dailyWaterConsumption = gameState.group.length * 3;
  const dailyGoldExpense = gameState.group.length * 0.5;

  // Calculate per-meal and per-drink amounts
  const foodPerMeal = gameState.group.length;
  const waterPerDrink = gameState.group.length;

  // Calculate how long supplies will last
  const daysOfFood =
    dailyFoodConsumption > 0
      ? (gameState.food / dailyFoodConsumption).toFixed(1)
      : "∞";
  const daysOfWater =
    dailyWaterConsumption > 0
      ? (gameState.water / dailyWaterConsumption).toFixed(1)
      : "∞";

  // Get next consumption times
  const { nextFood, nextWater, nextGold, currentHour, currentMinute } =
    getNextConsumptionTimes();

  const totalHeadSpace = getTotalHeadSpace();

  // Calculate total storage used by all items
  const goldSpace = Math.ceil(gameState.gold / 25);
  const foodSpace = gameState.food;
  const waterSpace = gameState.water;
  const headSpace = getTotalHeadSpace();
  const woodSpace = gameState.wood;
  const tentSpace = gameState.tents;
  const buildingMatSpace = gameState.building_mats;

  const totalUsedSpace =
    goldSpace +
    foodSpace +
    waterSpace +
    headSpace +
    woodSpace +
    tentSpace +
    buildingMatSpace;
  const availableSpace = maxStorage - totalUsedSpace;

  let message =
    `🛒: ${storageBreakdown.carts}*100 + 📦: ${storageBreakdown.backpacks}*24 + 👥: ${storageBreakdown.regular}*10 + 💪: ${storageBreakdown.strTotal}\n` +
    `📦 Max Storage: ${maxStorage}\n` +
    `📦 Used Space: ${totalUsedSpace}\n` +
    `📦 Available Space: ${availableSpace}\n\n` +
    `🪙 Gold: ${gameState.gold}\n` +
    `🍞 Food: ${gameState.food.toFixed(1)} -${dailyFoodConsumption.toFixed(
      1
    )}/day\n` +
    `💧 Water: ${gameState.water.toFixed(1)} -${dailyWaterConsumption.toFixed(
      1
    )}/day\n` +
    `🏺🐺 Monster Heads: ${gameState.monsterHeads.length} per ${totalHeadSpace} space\n` +
    `🪵 Wood: ${gameState.wood}\n` +
    `⛺ Tents: ${gameState.tents}\n` +
    `🧱 Building Materials: ${gameState.building_mats}\n` +
    `**Daily Expenses:**\n` +
    `💰 Gold: -${dailyGoldExpense.toFixed(1)}/day (consumed at noon)\n` +
    `💰 Next Gold Expense: ${nextGold > 23 ? nextGold - 24 : nextGold}:00\n\n` +
    `**Current Game Time:** ${currentHour
      .toString()
      .padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}\n` +
    `**Storage Capacity:** ${maxStorage}`;

  // Get and format unequipped items
  const categorizedItems = categorizeUnequippedItems();
  const itemsDisplay = formatCategorizedItems(categorizedItems);
  message += itemsDisplay;

  const components = [
    { type: "message", label: message, value: "" },
    { type: "button", label: "❌ Close", value: "close" },
  ];

  const choice = await getShowChoiceDialog("📦 Party Inventory", components);

  return choice;
}
