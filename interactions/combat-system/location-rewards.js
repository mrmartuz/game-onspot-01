// Location rewards system
// Handles rewards for clearing locations

import { gameState } from "../../gamestate/game_variables.js";
import { getLocationStatus } from "./location-rooms.js";
import { getLocationBehaviorType } from "./databases/location-rules.js";

/**
 * Grant location rewards when location is fully cleared
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {string} locationType - Location type
 * @param {boolean} allRoomsCleared - Whether all rooms are cleared
 * @returns {Object} Reward information
 */
export function grantLocationRewards(x, y, locationType, allRoomsCleared) {
  if (!allRoomsCleared) {
    return { granted: false, message: null };
  }
  
  const behaviorType = getLocationBehaviorType(locationType);
  const status = getLocationStatus(x, y);
  
  // Check if rewards already collected
  if (status && status.stashCollected) {
    return { granted: false, message: "Rewards already collected" };
  }
  
  let reward = {
    granted: false,
    gold: 0,
    message: null,
  };
  
  switch (behaviorType) {
    case "monster-cave":
      // Monster-caves: Gold stash (300-1000g)
      reward.gold = Math.floor(Math.random() * 701) + 300; // 300-1000
      gameState.gold += reward.gold;
      reward.granted = true;
      reward.message = `You found a hidden stash of ${reward.gold} gold in the depths of the monster-cave!`;
      
      // Mark stash as collected
      if (status) {
        status.stashCollected = true;
      }
      break;
      
    case "dragon-cave":
    case "volcano":
      // Dragon caves: Could have valuable hoard, but for now same as monster-caves
      reward.gold = Math.floor(Math.random() * 701) + 300;
      gameState.gold += reward.gold;
      reward.granted = true;
      reward.message = `You discovered a hidden hoard of ${reward.gold} gold in the dragon's lair!`;
      
      if (status) {
        status.stashCollected = true;
      }
      break;
      
    case "cave":
    case "beast-cave":
      // Regular caves and beast caves: Small rewards or nothing
      // Could be expanded in the future
      reward.granted = false;
      reward.message = "You cleared the cave, but found nothing of value.";
      break;
  }
  
  return reward;
}

/**
 * Check if location rewards are available
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {boolean}
 */
export function hasLocationRewards(x, y) {
  const status = getLocationStatus(x, y);
  if (!status) {
    return false;
  }
  
  const behaviorType = status.behaviorType;
  return status.allCleared && 
         !status.stashCollected && 
         (behaviorType === "monster-cave" || behaviorType === "dragon-cave" || behaviorType === "volcano");
}


