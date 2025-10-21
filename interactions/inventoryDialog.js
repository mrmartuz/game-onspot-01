import { gameState } from "../gamestate/game_variables.js";
import { getMaxStorage } from "../utils.js";
import { getGroupBonus } from "../utils.js";
import { getStorageBreakdown } from "../utils.js";
import { getShowChoiceDialog } from "../interactions.js";
import { getCurrentGameDate } from "../time_system.js";
import { getTotalHeadSpace, getAllHeadsForDisplay } from "./loot-system.js";

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

  // Calculate daily consumption rates (now consumed in specific meals/drinks)
  const dailyFoodConsumption =
    gameState.group.length * (1 - getGroupBonus("food"));
  const dailyWaterConsumption = gameState.group.length;
  const dailyGoldExpense = gameState.group.length * 0.5;

  // Calculate per-meal and per-drink amounts
  const foodPerMeal = dailyFoodConsumption / 3;
  const waterPerDrink = dailyWaterConsumption / 3;

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

  const components = [
    { type: "message", label: message, value: "" },
    { type: "button", label: "👥 Character Management", value: "char_mgmt" },
    { type: "button", label: "❌ Close", value: "close" },
  ];

  const choice = await getShowChoiceDialog("📦 Party Inventory", components);

  if (choice === "char_mgmt") {
    const { showCharacterManagementDialog } = await import(
      "./characterManagementDialog.js"
    );
    await showCharacterManagementDialog();
    return await showInventoryDialog(); // Return to inventory after character management
  }

  return choice;
}
