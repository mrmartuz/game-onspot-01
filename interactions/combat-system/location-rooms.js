// Location room system
// Handles room generation, tier distribution, and room clearing status

import { getDeterministicRoomCount, getDeterministicCreatureType } from "./deterministic-generation.js";
import { getRoomCountRange, getRoomTier, getLocationBehaviorType, isBossRoom } from "./databases/location-rules.js";
import { gameState } from "../../gamestate/game_variables.js";

/**
 * Generate location rooms data structure
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {string} locationType - Location type
 * @returns {Object} Location rooms data
 */
export function generateLocationRooms(x, y, locationType) {
  const behaviorType = getLocationBehaviorType(locationType);
  const roomRange = getRoomCountRange(locationType);
  
  // Use deterministic generation for room count
  const totalRooms = getDeterministicRoomCount(x, y, locationType);
  
  // Get main creature/race type for location (deterministic)
  const mainRace = getDeterministicCreatureType(x, y, locationType);
  
  // Generate room data for each room
  const rooms = [];
  for (let i = 0; i < totalRooms; i++) {
    const tier = getRoomTier(i, totalRooms);
    const isBoss = isBossRoom(i, totalRooms);
    
    rooms.push({
      index: i,
      tier: tier,
      isBoss: isBoss,
      cleared: false,
      mainRace: mainRace,
    });
  }
  
  return {
    behaviorType: behaviorType,
    totalRooms: totalRooms,
    mainRace: mainRace,
    rooms: rooms,
  };
}

/**
 * Get room data for a specific room
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} roomIndex - Room index (0-based)
 * @param {string} locationType - Location type
 * @returns {Object} Room data or null
 */
export function getRoomData(x, y, roomIndex, locationType) {
  const locationData = generateLocationRooms(x, y, locationType);
  
  if (!locationData || !locationData.rooms) {
    return null;
  }
  
  if (roomIndex < 0 || roomIndex >= locationData.rooms.length) {
    return null;
  }
  
  return locationData.rooms[roomIndex];
}

/**
 * Check if a room is cleared
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} roomIndex - Room index
 * @returns {boolean} True if room is cleared
 */
export function checkRoomCleared(x, y, roomIndex) {
  const location = getClearedLocation(x, y);
  if (!location) {
    return false;
  }
  
  if (roomIndex < 0 || roomIndex >= location.clearedRooms.length) {
    return false;
  }
  
  return location.clearedRooms[roomIndex] === true;
}

/**
 * Mark a room as cleared
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} roomIndex - Room index
 */
export function clearRoom(x, y, roomIndex) {
  const location = getClearedLocation(x, y);
  if (!location) {
    // Create new location entry if it doesn't exist
    // This will be initialized properly by location-tracking.js
    return;
  }
  
  if (roomIndex < 0 || roomIndex >= location.clearedRooms.length) {
    return;
  }
  
  location.clearedRooms[roomIndex] = true;
  
  // If this is the boss room, mark boss as dead
  const roomData = getRoomData(x, y, roomIndex, location.locationType);
  if (roomData && roomData.isBoss) {
    location.bossAlive = false;
  }
}

/**
 * Get full location status
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {Object} Location status
 */
export function getLocationStatus(x, y) {
  const location = getClearedLocation(x, y);
  
  if (!location) {
    return null;
  }
  
  const clearedCount = location.clearedRooms.filter(cleared => cleared === true).length;
  const allCleared = clearedCount === location.totalRooms;
  const hasBoss = location.bossAlive;
  
  return {
    x: location.x,
    y: location.y,
    locationType: location.locationType,
    behaviorType: location.behaviorType,
    totalRooms: location.totalRooms,
    clearedRooms: location.clearedRooms,
    clearedCount: clearedCount,
    allCleared: allCleared,
    bossAlive: location.bossAlive,
    bossType: location.bossType,
    lastCheck: location.lastCheck,
    lastCleared: location.lastCleared,
    stashCollected: location.stashCollected || false,
  };
}

/**
 * Check if location is fully cleared
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {boolean}
 */
export function isLocationFullyCleared(x, y) {
  const status = getLocationStatus(x, y);
  return status ? status.allCleared : false;
}

/**
 * Check if location has been visited (has at least one room cleared)
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {boolean}
 */
export function isLocationVisited(x, y) {
  const location = getClearedLocation(x, y);
  if (!location) {
    return false;
  }
  
  return location.clearedRooms.some(cleared => cleared === true);
}

/**
 * Get next uncleared room index
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {number} Room index, or -1 if all cleared
 */
export function getNextUnclearedRoom(x, y) {
  const location = getClearedLocation(x, y);
  if (!location) {
    return 0; // First room if not tracked yet
  }
  
  for (let i = 0; i < location.clearedRooms.length; i++) {
    if (!location.clearedRooms[i]) {
      return i;
    }
  }
  
  return -1; // All cleared
}

/**
 * Get cleared location from gameState
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {Object} Location data or null
 */
function getClearedLocation(x, y) {
  if (!gameState.clearedLocations) {
    return null;
  }
  
  return gameState.clearedLocations.find(
    loc => loc.x === x && loc.y === y
  ) || null;
}

