import { gameState } from "../gamestate/game_variables.js";
import { getMaxStorage } from "../utils.js";
import { getGroupBonus } from "../utils.js";
import { getNumCarriers } from "../utils.js";
import { getShowChoiceDialog } from "../interactions.js";
import { getCurrentGameDate } from "../time_system.js";

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

  const message =
    `📦 **Party Inventory**\n` +
    `🛒: ${gameState.carts}*100 + 📦: ${getNumCarriers()}*24 + 👥: ${
      gameState.group.length - getNumCarriers() - gameState.carts
    }*10\n` +
    `📦 Max Storage: ${maxStorage}\n\n` +
    `🪙 Gold: ${gameState.gold}\n` +
    `🍞 Food: ${gameState.food.toFixed(1)} -${dailyFoodConsumption.toFixed(
      1
    )}/day\n` +
    `💧 Water: ${gameState.water.toFixed(1)} -${dailyWaterConsumption.toFixed(
      1
    )}/day\n` +
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

  return getShowChoiceDialog(message, [
    { type: "button", label: "❌ Close", value: "close" },
  ]);
}
