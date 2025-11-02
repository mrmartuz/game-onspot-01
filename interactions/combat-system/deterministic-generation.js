// Deterministic generation using hash function
// Uses hash(x, y, s) from utils.js to ensure deterministic creature types and room counts

import { hash } from "../../utils.js";
import { getAllMonsterTypes } from "./databases/monster-tiers.js";
import { getRoomCountRange, getLocationBehaviorType } from "./databases/location-rules.js";
import {
  getIntelligentRaces,
  getBeastRaces,
  getDemonRaces,
  raceCategories,
  RACE_CATEGORIES,
} from "./databases/group-composition-rules.js";

/**
 * Get deterministic group type for entities
 * Uses hash to ensure same entity always spawns same group type
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {string} entityType - Entity type ("monster" | "beast")
 * @returns {string} Group type
 */
export function getDeterministicGroupType(x, y, entityType) {
  // Use hash with seed based on entity type
  const seed = entityType === "beast" ? 1000 : 2000;
  const hashValue = hash(x, y, seed);
  
  // Map hash value to group type
  // For now, return the hash value - actual selection will be done with weights
  return hashValue;
}

/**
 * Get deterministic creature type for locations
 * Uses hash to determine main race/creature type for a location
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {string} locationType - Location type
 * @returns {string} Main creature type (race name)
 */
export function getDeterministicCreatureType(x, y, locationType) {
  // Use hash with seed based on location type
  const seed = getLocationSeed(locationType);
  const hashValue = hash(x, y, seed);
  
  // Get available races based on location type and hash
  const availableRaces = getAvailableRacesForLocation(locationType);
  
  if (availableRaces.length === 0) {
    return "Goblin"; // Default fallback
  }
  
  // Use hash value to select from available races
  const index = Math.floor(hashValue * availableRaces.length);
  return availableRaces[index];
}

/**
 * Get deterministic room count for locations
 * Uses hash to determine number of rooms (caves: 1-5, monster-caves: 4-10)
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {string} locationType - Location type
 * @returns {number} Number of rooms
 */
export function getDeterministicRoomCount(x, y, locationType) {
  // Use hash with seed for room count
  const seed = 3000;
  const hashValue = hash(x, y, seed);
  
  const roomRange = getRoomCountRange(locationType);
  const roomCount = roomRange.min + Math.floor(hashValue * (roomRange.max - roomRange.min + 1));
  
  return Math.max(roomRange.min, Math.min(roomRange.max, roomCount));
}

/**
 * Get available races for a location type
 * @param {string} locationType - Location type
 * @returns {Array<string>} Array of available race names
 */
function getAvailableRacesForLocation(locationType) {
  const behaviorType = getLocationBehaviorType(locationType);
  
  switch (behaviorType) {
    case "dragon-cave":
    case "volcano":
      // Dragon caves can have dragons or intelligent races (servitude)
      return ["Dragon", ...getIntelligentRaces()];
    
    case "beast-cave":
      // Beast caves only have beasts
      return getBeastRaces();
    
    case "monster-cave":
      // Monster caves can have any intelligent or demon races
      return [...getIntelligentRaces(), ...getDemonRaces()];
    
    case "cave":
    default:
      // Regular caves can have any race
      return [
        ...getIntelligentRaces(),
        ...getBeastRaces(),
        ...getDemonRaces(),
        "Dragon",
      ];
  }
}

/**
 * Get seed value for location type
 * @param {string} locationType - Location type
 * @returns {number} Seed value
 */
function getLocationSeed(locationType) {
  const seedMap = {
    "cave": 4000,
    "monster-cave": 5000,
    "monster caves": 5000,
    "dragon-cave": 6000,
    "volcano": 6000,
    "beast-cave": 7000,
  };
  
  return seedMap[locationType] || 4000;
}

/**
 * Get deterministic creature template name
 * Uses hash to select a specific creature template from a race
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {string} race - Race name
 * @param {string} tier - Tier ("early" | "mid" | "late")
 * @returns {string} Creature template name (e.g., "goblin", "goblin_shaman")
 */
export function getDeterministicCreatureTemplate(x, y, race, tier) {
  // Use hash with seed based on race and tier
  const seed = 8000 + (race.charCodeAt(0) || 0) + (tier.charCodeAt(0) || 0);
  const hashValue = hash(x, y, seed);
  
  // Get all creature types from the specified tier and race
  const allTypes = getAllMonsterTypes();
  const raceTypes = allTypes.filter(type => {
    // This would need access to creature templates to check race
    // For now, use simple name matching
    return type.toLowerCase().includes(race.toLowerCase());
  });
  
  if (raceTypes.length === 0) {
    return race.toLowerCase(); // Fallback to base race name
  }
  
  // Use hash to select from available types
  const index = Math.floor(hashValue * raceTypes.length);
  return raceTypes[index];
}

/**
 * Get hash value for weighted random selection
 * Useful for getting deterministic random values from hash
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} seed - Seed value
 * @returns {number} Hash value between 0 and 1
 */
export function getHashValue(x, y, seed) {
  return hash(x, y, seed);
}

