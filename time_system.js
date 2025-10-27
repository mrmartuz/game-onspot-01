import {
  game_start_real,
  game_start_date,
  acceleration,
} from "./gamestate/game_variables.js";
import { gameState } from "./gamestate/game_variables.js";
import { getShowDeathDialog } from "./interactions.js";

export function getCurrentGameDate() {
  const elapsed_real_ms = Date.now() - game_start_real;
  const elapsed_game_ms = elapsed_real_ms * acceleration;
  const timeOffset = gameState.timeOffset || 0;
  return new Date(game_start_date.getTime() + elapsed_game_ms + timeOffset);
}

export function logEvent(desc) {
  gameState.events.push({ date: getCurrentGameDate().toLocaleString(), desc });
}

export function advanceGameTime(hours) {
  const beforeTime = getCurrentGameDate();
  const hoursInMs = hours * 60 * 60 * 1000;

  // Store current game time before advancing
  gameState.last_consume_game_time = getCurrentGameDate().getTime();

  // Add to time offset
  gameState.timeOffset = (gameState.timeOffset || 0) + hoursInMs;

  const afterTime = getCurrentGameDate();

  // Trigger consumption check to handle any crossed thresholds
  timeConsumption();

  return { beforeTime, afterTime };
}

export function getTimeOfDay(hour) {
  if (hour >= 21 || hour < 6) {
    return "night";
  } else if (hour >= 6 && hour < 8) {
    return "sunrise";
  } else if (hour >= 8 && hour < 17) {
    return "day";
  } else if (hour >= 17 && hour < 21) {
    return "sunset";
  }
}

export function getTransitionFactor(hour, minute) {
  let transitionStart, transitionEnd, currentMinute;

  // Define transition windows aligned with actual time periods
  if (hour >= 5 && hour < 6) {
    // Night → Sunrise: 5:00-6:00 (1 hour)
    currentMinute = hour * 60 + minute;
    transitionStart = 5 * 60; // 5:00
    transitionEnd = 6 * 60; // 6:00
  } else if (hour >= 7 && hour < 8) {
    // Sunrise → Day: 7:00-8:00 (1 hour)
    currentMinute = hour * 60 + minute;
    transitionStart = 7 * 60; // 7:00
    transitionEnd = 8 * 60; // 8:00
  } else if (hour >= 16 && hour < 18) {
    // Day → Sunset: 16:00-17:00 (1 hour)
    currentMinute = hour * 60 + minute;
    transitionStart = 16 * 60; // 16:00
    transitionEnd = 17 * 60; // 17:00
  } else if (hour >= 18 && hour < 20) {
    // Sunset → Night: 21:00-22:00 (1 hour)
    currentMinute = hour * 60 + minute;
    transitionStart = 21 * 60; // 21:00
    transitionEnd = 22 * 60; // 22:00
  } else {
    return 0.0; // No transition, pure current period
  }

  // Calculate factor (0.0 = start of transition, 1.0 = end of transition)
  const totalDuration = transitionEnd - transitionStart;
  const progress = currentMinute - transitionStart;
  return Math.max(0, Math.min(1, progress / totalDuration));
}

export function getTimeOfDayPair(hour) {
  const current = getTimeOfDay(hour);

  // Determine next period in cycle
  let next;
  if (current === "night") {
    next = "sunrise";
  } else if (current === "sunrise") {
    next = "day";
  } else if (current === "day") {
    next = "sunset";
  } else if (current === "sunset") {
    next = "night";
  }

  return { current, next };
}

export function updateTimeColorCache() {
  const currentGameDate = getCurrentGameDate();
  const currentHour = currentGameDate.getHours();
  const currentMinute = currentGameDate.getMinutes();
  const timeKey = currentHour * 100 + currentMinute; // Unique per hour:minute

  if (timeKey !== gameState.lastTimeUpdate) {
    const { current, next } = getTimeOfDayPair(currentHour);
    gameState.currentTimeOfDay = current;
    gameState.nextTimeOfDay = next;
    gameState.transitionFactor = getTransitionFactor(
      currentHour,
      currentMinute
    );
    gameState.lastTimeUpdate = timeKey;
  }
}

export async function timeConsumption() {
  // Get current game time
  const currentGameDate = getCurrentGameDate();
  const currentHour = currentGameDate.getHours();
  const currentMinute = currentGameDate.getMinutes();

  // Check if we've passed consumption times since last check
  // Use stored game time if available, otherwise calculate from real time
  let lastGameDate;
  if (gameState.last_consume_game_time !== undefined) {
    lastGameDate = new Date(gameState.last_consume_game_time);
  } else {
    // Fallback for initialization: calculate from real time
    lastGameDate = new Date(
      game_start_date.getTime() +
        (gameState.last_consume_time - game_start_real) * acceleration
    );
  }
  const lastHour = lastGameDate.getHours();
  const lastMinute = lastGameDate.getMinutes();

  // Count total characters (player + group members)
  const totalCharacters =
    (gameState.playerCharacter ? 1 : 0) + gameState.group.length;

  // 🍞 FOOD: Consume 3 times per day (breakfast, lunch, dinner)
  // Breakfast: 6:00-7:00, Lunch: 12:00-13:00, Dinner: 18:00-19:00
  const foodTimes = [6, 12, 18];
  foodTimes.forEach((foodHour) => {
    if (
      (lastHour < foodHour && currentHour >= foodHour) ||
      (lastHour === foodHour && lastMinute < 0 && currentMinute >= 0)
    ) {
      // Each character consumes 1 unit per meal
      const foodPerMeal = totalCharacters;
      gameState.food = gameState.food - foodPerMeal;
      logEvent(
        `🍞 Mealtime: consumed ${foodPerMeal} food (${totalCharacters} characters)`
      );
      if (gameState.food < 0) {
        logEvent(`🍞 ⚠️ Warning: Starving! Food is negative`);
      }
      if (gameState.food < -gameState.group.length * 15) {
        getShowDeathDialog("starvation");
      }
    }
  });

  // 💧 WATER: Consume 3 times per day (morning, afternoon, evening)
  // Morning: 7:00-8:00, Afternoon: 14:00-15:00, Evening: 20:00-21:00
  const waterTimes = [7, 14, 20];
  waterTimes.forEach((waterHour) => {
    if (
      (lastHour < waterHour && currentHour >= waterHour) ||
      (lastHour === waterHour && lastMinute < 0 && currentMinute >= 0)
    ) {
      // Each character consumes 1 unit per drink
      const waterPerDrink = totalCharacters;
      gameState.water = gameState.water - waterPerDrink;
      logEvent(
        `💧 Drink time: consumed ${waterPerDrink} water (${totalCharacters} characters)`
      );
      if (gameState.water < 0) {
        logEvent(`💧 ⚠️ Warning: Dying of thirst! Water is negative`);
      }
      if (gameState.water < -gameState.group.length * 10) {
        getShowDeathDialog("thirst");
      }
    }
  });

  // 💰 GOLD: Consume once per day at noon (12:00-13:00)
  if (
    (lastHour < 12 && currentHour >= 12) ||
    (lastHour === 12 && lastMinute < 0 && currentMinute >= 0)
  ) {
    const dailyGoldExpense = totalCharacters * 0.5;
    gameState.gold = Math.max(-100, gameState.gold - dailyGoldExpense); // Allow going negative but not too much
    logEvent(`💰 Daily expenses: -${dailyGoldExpense.toFixed(1)} gold`);
    if (
      gameState.group.length > 1 &&
      gameState.gold < -gameState.group.length * 10
    ) {
      getShowDeathDialog("gold");
    }
  }

  // Update both real time and game time for next consumption check
  gameState.last_consume_time = Date.now();
  gameState.last_consume_game_time = currentGameDate.getTime();
}
