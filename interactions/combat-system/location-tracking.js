// Location tracking system
// Handles room clearing tracking, weekly refill logic, and cleanup functions

import { gameState, addClearedLocation, updateClearedLocation, removeClearedLocation, getClearedLocation } from "../../gamestate/game_variables.js";
import { generateLocationRooms } from "./location-rooms.js";
import { getLocationBehaviorType } from "./databases/location-rules.js";
import { getDeterministicCreatureType } from "./deterministic-generation.js";

/**
 * Track location clearing after combat
 * Called after a room is cleared in combat
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {string} locationType - Location type
 * @param {number} roomIndex - Room index that was cleared
 */
export function trackLocationClearing(x, y, locationType, roomIndex) {
  let location = getClearedLocation(x, y);
  const behaviorType = getLocationBehaviorType(locationType);
  
  if (!location) {
    // Initialize new location entry
    const locationData = generateLocationRooms(x, y, locationType);
    const mainRace = getDeterministicCreatureType(x, y, locationType);
    
    // Initialize clearedRooms array
    const clearedRooms = new Array(locationData.totalRooms).fill(false);
    clearedRooms[roomIndex] = true;
    
    // Determine if boss is alive based on room cleared
    const roomData = locationData.rooms[roomIndex];
    const bossAlive = !roomData.isBoss;
    
    // Determine boss type if boss is alive
    let bossType = null;
    if (bossAlive && locationData.totalRooms > 0) {
      const bossRoomIndex = locationData.totalRooms - 1;
      const bossRoomData = locationData.rooms[bossRoomIndex];
      bossType = bossRoomData ? mainRace : null;
    }
    
    addClearedLocation({
      x: x,
      y: y,
      locationType: locationType,
      behaviorType: behaviorType,
      totalRooms: locationData.totalRooms,
      clearedRooms: clearedRooms,
      bossAlive: bossAlive,
      bossType: bossType,
      lastCheck: Date.now(),
      lastCleared: Date.now(),
      stashCollected: false,
    });
  } else {
    // Update existing location
    if (roomIndex >= 0 && roomIndex < location.clearedRooms.length) {
      location.clearedRooms[roomIndex] = true;
      
      // Check if this was the boss room
      const locationData = generateLocationRooms(x, y, locationType);
      const roomData = locationData.rooms[roomIndex];
      
      if (roomData && roomData.isBoss) {
        location.bossAlive = false;
        location.bossType = null;
      }
      
      // Update last cleared timestamp if first room cleared
      if (!location.lastCleared) {
        location.lastCleared = Date.now();
      }
      
      updateClearedLocation(x, y, {
        clearedRooms: location.clearedRooms,
        bossAlive: location.bossAlive,
        bossType: location.bossType,
        lastCleared: location.lastCleared,
      });
    }
  }
}

/**
 * Check if weekly refill should occur for a location
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {boolean} True if weekly check should be performed
 */
export function shouldCheckWeeklyRefill(x, y) {
  const location = getClearedLocation(x, y);
  if (!location) {
    return false;
  }
  
  // Check if at least one week has passed since last check
  const oneWeek = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
  const timeSinceLastCheck = Date.now() - (location.lastCheck || 0);
  
  return timeSinceLastCheck >= oneWeek;
}

/**
 * Refill one empty room if boss is alive
 * Caves: 15% chance, Monster-caves: 5% chance
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {boolean} True if room was refilled
 */
export function refillEmptyRoom(x, y) {
  const location = getClearedLocation(x, y);
  if (!location) {
    return false;
  }
  
  // Only refill if boss is alive
  if (!location.bossAlive) {
    return false;
  }
  
  // Find empty rooms
  const emptyRooms = [];
  for (let i = 0; i < location.clearedRooms.length; i++) {
    if (!location.clearedRooms[i]) {
      emptyRooms.push(i);
    }
  }
  
  if (emptyRooms.length === 0) {
    return false;
  }
  
  // Determine refill chance based on location type
  let refillChance = 0.05; // Default 5% (monster-caves)
  if (location.behaviorType === "cave" || location.behaviorType === "beast-cave") {
    refillChance = 0.15; // 15% for caves
  }
  
  // Roll for refill
  if (Math.random() > refillChance) {
    return false;
  }
  
  // Refill one random empty room
  const roomToRefill = emptyRooms[Math.floor(Math.random() * emptyRooms.length)];
  location.clearedRooms[roomToRefill] = false;
  
  updateClearedLocation(x, y, {
    clearedRooms: location.clearedRooms,
    lastCheck: Date.now(),
  });
  
  return true;
}

/**
 * Roll for new boss entering cleared caves
 * Caves: 15% chance, Monster-caves: 5% chance
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {boolean} True if new boss entered
 */
export function rollNewBoss(x, y) {
  const location = getClearedLocation(x, y);
  if (!location) {
    return false;
  }
  
  // Only roll if boss is dead
  if (location.bossAlive) {
    return false;
  }
  
  // Determine boss chance based on location type
  let bossChance = 0.05; // Default 5% (monster-caves)
  if (location.behaviorType === "cave" || location.behaviorType === "beast-cave") {
    bossChance = 0.15; // 15% for caves
  }
  
  // Roll for new boss
  if (Math.random() > bossChance) {
    return false;
  }
  
  // New boss entered - refill boss room
  const bossRoomIndex = location.totalRooms - 1;
  if (bossRoomIndex >= 0 && bossRoomIndex < location.clearedRooms.length) {
    location.clearedRooms[bossRoomIndex] = false;
    location.bossAlive = true;
    
    // Determine boss type based on location
    const mainRace = getDeterministicCreatureType(x, y, location.locationType);
    location.bossType = mainRace;
    
    updateClearedLocation(x, y, {
      clearedRooms: location.clearedRooms,
      bossAlive: true,
      bossType: location.bossType,
      lastCheck: Date.now(),
    });
    
    return true;
  }
  
  return false;
}

/**
 * Process weekly refills for all tracked locations
 * Called periodically (weekly) by time system
 */
export function processWeeklyRefills() {
  if (!gameState.clearedLocations || gameState.clearedLocations.length === 0) {
    return;
  }
  
  for (const location of gameState.clearedLocations) {
    // Check if weekly check should occur
    if (!shouldCheckWeeklyRefill(location.x, location.y)) {
      continue;
    }
    
    // Update last check time
    updateClearedLocation(location.x, location.y, {
      lastCheck: Date.now(),
    });
    
    // Process refills based on boss status
    if (location.bossAlive) {
      // Try to refill empty room
      refillEmptyRoom(location.x, location.y);
    } else {
      // Try to roll for new boss
      rollNewBoss(location.x, location.y);
    }
  }
}

/**
 * Cleanup locations where all rooms are filled (remove from tracking)
 * Removes locations where boss is alive and all rooms are occupied
 */
export function cleanupFilledLocations() {
  if (!gameState.clearedLocations || gameState.clearedLocations.length === 0) {
    return;
  }
  
  const locationsToRemove = [];
  
  for (const location of gameState.clearedLocations) {
    // Check if location should be removed
    // Only remove if: boss is alive AND all rooms are filled (not cleared)
    if (!location.bossAlive) {
      continue; // Keep locations with dead bosses
    }
    
    // Check if all rooms are filled (not cleared)
    const allFilled = location.clearedRooms.every(cleared => cleared === false);
    
    if (allFilled) {
      // Location is back to original state, remove from tracking
      locationsToRemove.push({ x: location.x, y: location.y });
    }
  }
  
  // Remove locations
  for (const { x, y } of locationsToRemove) {
    removeClearedLocation(x, y);
  }
  
  return locationsToRemove.length;
}

/**
 * Initialize location tracking for a location (if needed)
 * Called when player first visits a location that might have rooms
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {string} locationType - Location type
 */
export function initializeLocationTracking(x, y, locationType) {
  const location = getClearedLocation(x, y);
  
  // Only initialize if location doesn't exist yet
  // We don't create it until first room is cleared
  if (location) {
    return;
  }
  
  // Don't create entry yet - wait until first room is cleared
  // This keeps the tracking array light
}

/**
 * Check if location has been visited (at least one room cleared)
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

