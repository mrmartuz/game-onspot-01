// Validation utility functions for character creation

import { MIN_STAT_VALUE} from "../constants.js";

/**
 * Calculate the cost of changing a stat from current to desired value
 * @param {number} currentValue - Current stat value
 * @param {number} desiredValue - Desired stat value
 * @returns {number} Point cost (negative if gaining points)
 */
export function calculateStatCost(currentValue, desiredValue) {
  if (desiredValue <= 10) {
    return desiredValue - currentValue; // 1 point per stat point up to 10
  } else {
    // Points over 10 cost 2 each
    if (currentValue <= 10) {
      return 10 - currentValue + (desiredValue - 10) * 2;
    } else {
      return (desiredValue - currentValue) * 2;
    }
  }
}

/**
 * Validate stat allocation
 * @param {Object} stats - Current stats object
 * @param {number} remainingPoints - Remaining points to allocate
 * @returns {Object} Validation result with isValid and errors
 */
export function validateStatAllocation(stats, remainingPoints) {
  const errors = [];

  // Check minimum stat values
  Object.keys(stats).forEach((stat) => {
    if (stat !== "LUCK" && stats[stat] < MIN_STAT_VALUE) {
      errors.push(`${stat} cannot be below ${MIN_STAT_VALUE}`);
    }
  });

  // Check if remaining points is valid
  if (remainingPoints < 0) {
    errors.push("Cannot have negative remaining points");
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
  };
}

/**
 * Validate character data completeness
 * @param {Object} character - Character object to validate
 * @returns {Object} Validation result with isValid and errors
 */
export function validateCharacterData(character) {
  const errors = [];
  const requiredFields = [
    "firstName",
    "lastName",
    "sex",
    "race",
    "class",
    "stats",
    "skills",
    "equipment",
    "health",
  ];

  requiredFields.forEach((field) => {
    if (!character[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  // Validate stats object
  if (character.stats) {
    const requiredStats = ["STR", "DEX", "CON", "INT", "WIS", "CHA", "LUCK"];
    requiredStats.forEach((stat) => {
      if (typeof character.stats[stat] !== "number") {
        errors.push(`Invalid stat value for ${stat}`);
      }
    });
  }

  // Validate health object
  if (character.health) {
    if (
      typeof character.health.current !== "number" ||
      typeof character.health.max !== "number"
    ) {
      errors.push("Invalid health values");
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
  };
}

/**
 * Check if a stat can be increased
 * @param {Object} stats - Current stats
 * @param {string} stat - Stat to check
 * @param {number} remainingPoints - Remaining points
 * @returns {boolean} Whether the stat can be increased
 */
export function canIncreaseStat(stats, stat, remainingPoints) {
  const cost = calculateStatCost(stats[stat], stats[stat] + 1);
  return remainingPoints >= cost;
}

/**
 * Check if a stat can be decreased
 * @param {Object} stats - Current stats
 * @param {string} stat - Stat to check
 * @returns {boolean} Whether the stat can be decreased
 */
export function canDecreaseStat(stats, stat) {
  return stats[stat] > MIN_STAT_VALUE;
}

/**
 * Calculate new stats after increasing a stat
 * @param {Object} currentStats - Current stats
 * @param {string} stat - Stat to increase
 * @param {number} remainingPoints - Current remaining points
 * @returns {Object} Result with newStats and newRemainingPoints
 */
export function increaseStat(currentStats, stat, remainingPoints) {
  const cost = calculateStatCost(currentStats[stat], currentStats[stat] + 1);
  if (remainingPoints >= cost) {
    const newStats = { ...currentStats };
    newStats[stat]++;
    return {
      newStats,
      newRemainingPoints: remainingPoints - cost,
      success: true,
    };
  }
  return { success: false };
}

/**
 * Calculate new stats after decreasing a stat
 * @param {Object} currentStats - Current stats
 * @param {string} stat - Stat to decrease
 * @param {number} remainingPoints - Current remaining points
 * @returns {Object} Result with newStats and newRemainingPoints
 */
export function decreaseStat(currentStats, stat, remainingPoints) {
  if (currentStats[stat] > MIN_STAT_VALUE) {
    const gain = Math.abs(
      calculateStatCost(currentStats[stat], currentStats[stat] - 1)
    );
    const newStats = { ...currentStats };
    newStats[stat]--;
    return {
      newStats,
      newRemainingPoints: remainingPoints + gain,
      success: true,
    };
  }
  return { success: false };
}
