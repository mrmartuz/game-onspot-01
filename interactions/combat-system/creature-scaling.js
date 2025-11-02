// Creature scaling functions
// Handles stat scaling and health calculations for creatures

import { raceDatabase } from "../character/races.js";
import { classHealthBonuses } from "./databases/class-combat-bonuses.js";

/**
 * Scale creature stats based on race bonuses
 * @param {Object} baseStats - Base stat object (e.g., {STR: 10, DEX: 8, ...})
 * @param {string} race - Race name
 * @returns {Object} Scaled stats object
 */
export function scaleCreatureStats(baseStats, race) {
  const raceData = raceDatabase[race];
  if (!raceData) {
    console.warn(`Race data not found for: ${race}`);
    return baseStats;
  }

  const scaledStats = { ...baseStats };

  // Apply race stat bonuses
  Object.keys(raceData.statBonuses).forEach((stat) => {
    scaledStats[stat] += raceData.statBonuses[stat];
  });

  // Ensure stats are within reasonable bounds
  Object.keys(scaledStats).forEach((stat) => {
    scaledStats[stat] = Math.max(1, Math.min(25, scaledStats[stat]));
  });

  return scaledStats;
}

/**
 * Get health bonus for a given class
 * @param {string} className - Class name
 * @returns {number} Health bonus value
 */
export function getClassHealthBonus(className) {
  return classHealthBonuses[className] || 0;
}


