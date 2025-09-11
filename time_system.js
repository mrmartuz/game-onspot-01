import { game_start_real, game_start_date, acceleration } from './game_variables.js';
import { gameState } from './game_variables.js';
import { getGroupBonus } from './utils.js';

export function getCurrentGameDate() {
    const elapsed_real_ms = Date.now() - game_start_real;
    const elapsed_game_ms = elapsed_real_ms * acceleration;
    return new Date(game_start_date.getTime() + elapsed_game_ms);
}

export function logEvent(desc) {
    gameState.events.push({date: getCurrentGameDate().toLocaleString(), desc});
}

export function timeConsumption() {
    let now = Date.now();
    let delta_real = now - gameState.last_consume_time;
    let delta_game = delta_real * acceleration;
    let days_fraction = delta_game / (86400 * 1000);
    
    // Get current game time
    const currentGameDate = getCurrentGameDate();
    const currentHour = currentGameDate.getHours();
    const currentMinute = currentGameDate.getMinutes();
    
    // Check if we've passed consumption times since last check
    const lastGameDate = new Date(game_start_date.getTime() + (gameState.last_consume_time - game_start_real) * acceleration);
    const lastHour = lastGameDate.getHours();
    const lastMinute = lastGameDate.getMinutes();
    
    // 🍞 FOOD: Consume 3 times per day (breakfast, lunch, dinner)
    // Breakfast: 6:00-7:00, Lunch: 12:00-13:00, Dinner: 18:00-19:00
    const foodTimes = [6, 12, 18];
    foodTimes.forEach(foodHour => {
        if ((lastHour < foodHour && currentHour >= foodHour) || 
            (lastHour === foodHour && lastMinute < 0 && currentMinute >= 0)) {
            // Apply food bonus to reduce consumption (food bonus makes food last longer)
            let foodBonus = getGroupBonus('food');
            let consumptionReduction = Math.min(0.5, foodBonus * 0.8); // Up to 50% reduction
            const foodPerMeal = gameState.group.length * (1 - consumptionReduction) / 3;
            gameState.food = Math.max(0, gameState.food - foodPerMeal);
            if(gameState.food < 0) {
                logEvent(`🍞 You are starving! Consumed ${foodPerMeal.toFixed(1)} food for meal (${Math.floor(consumptionReduction * 100)}% reduction applied)`);
            }
        }
    });
    
    // 💧 WATER: Consume 3 times per day (morning, afternoon, evening)
    // Morning: 7:00-8:00, Afternoon: 14:00-15:00, Evening: 20:00-21:00
    const waterTimes = [7, 14, 20];
    waterTimes.forEach(waterHour => {
        if ((lastHour < waterHour && currentHour >= waterHour) || 
            (lastHour === waterHour && lastMinute < 0 && currentMinute >= 0)) {
            const waterPerDrink = gameState.group.length / 3;
            gameState.water = Math.max(0, gameState.water - waterPerDrink); 
            if(gameState.water < 0) {
                logEvent(`💧 You are dying of thirst! Consumed ${waterPerDrink.toFixed(1)} water`);
            }
        }
    });
    
    // 💰 GOLD: Consume once per day at noon (12:00-13:00)
    if ((lastHour < 12 && currentHour >= 12) || 
        (lastHour === 12 && lastMinute < 0 && currentMinute >= 0)) {
        const dailyGoldExpense = gameState.group.length * 0.5;
        gameState.gold = Math.max(-100, gameState.gold - dailyGoldExpense); // Allow going negative but not too much
        logEvent(`💰 Daily expenses: -${dailyGoldExpense.toFixed(1)} gold`);
    }
    

    // TODO remove this and create a proper equip system
    // Tent degradation (random chance per day)
    if (Math.random() < 0.05 * days_fraction) {
        gameState.tents = Math.max(0, gameState.tents - 1);
    }
    
    gameState.last_consume_time = now;
}