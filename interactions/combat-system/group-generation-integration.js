// Group generation integration
// Main entry point for generating enemy groups with all group types

import {
  determineGroupType,
  generateLeaderGroup,
  generateMixedIntelligentGroup,
  generateMixedDifferentGroup,
  generateMixedBeastGroup,
  generateRegularGroup,
  generateDragonCaveGroup,
  selectCompatibleRaces,
  getWeightedCreatureDistribution,
} from "./group-generation.js";
import { selectGroupType } from "./databases/group-composition-rules.js";
import {
  getDeterministicCreatureType,
  getHashValue,
} from "./deterministic-generation.js";
import {
  getGroupTypeWeights,
  getCompatibleRaces,
  getIntelligentRaces,
  getBeastRaces,
  isBeastRace,
  isIntelligentRace,
  isDragonRace,
  GROUP_TYPES,
} from "./databases/group-composition-rules.js";
import {
  getLocationBehaviorType,
  getLocationSpawnRules,
  selectDragonCaveComposition,
} from "./databases/location-rules.js";
import { getAllMonsterTypes, getMonsterTypesByTier } from "./databases/monster-tiers.js";
import { creatureTemplates } from "./creature-templates.js";
import { gameState } from "../../gamestate/game_variables.js";

/**
 * Main entry point for generating grouped monsters
 * @param {string} entityType - "monster" | "beast" | null (if location)
 * @param {string} locationType - Location type or null (if entity)
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {Object} roomData - Room data (for locations) or null
 * @param {number} roomIndex - Room index (for locations) or -1
 * @returns {Promise<Array>} Array of Monster instances
 */
export async function generateGroupedMonsters(
  entityType,
  locationType,
  x,
  y,
  roomData,
  roomIndex
) {
  // Calculate monster count
  const groupMemberCount = gameState.group ? gameState.group.length : 1;
  const baseMonsterCount = Math.floor(Math.random() * 3) + 1; // 1-3 base
  const bonusMonsterCount = Math.max(1, Math.floor(groupMemberCount / 2));
  let monsterCount = baseMonsterCount + bonusMonsterCount;
  
  // Determine group type
  const groupType = determineGroupType(entityType, locationType, x, y);
  
  // Adjust count based on room tier for locations
  if (roomData && roomIndex >= 0) {
    const tier = roomData.tier;
    const tierCounts = {
      early: { min: 2, max: 3 },
      mid: { min: 3, max: 5 },
      late: { min: 4, max: 6 },
    };
    const tierRules = tierCounts[tier] || tierCounts.early;
    monsterCount = Math.max(tierRules.min, Math.min(tierRules.max, monsterCount));
  }
  
  // Handle location-specific spawns
  if (locationType) {
    const behaviorType = getLocationBehaviorType(locationType);
    return await generateLocationMonsters(
      behaviorType,
      x,
      y,
      monsterCount,
      roomData,
      roomIndex
    );
  }
  
  // Handle entity spawns
  if (entityType) {
    // Re-determine group type for entities (it was already determined but needs to be used)
    return await generateEntityMonsters(
      entityType,
      x,
      y,
      monsterCount,
      groupType || determineGroupType(entityType, null, x, y)
    );
  }
  
  // Fallback
  return await generateRegularGroup("goblin", monsterCount, x, y);
}

/**
 * Generate monsters for location encounters
 */
async function generateLocationMonsters(
  behaviorType,
  x,
  y,
  monsterCount,
  roomData,
  roomIndex
) {
  const mainRace = getDeterministicCreatureType(x, y, behaviorType);
  
  // Handle special location types
  if (behaviorType === "dragon-cave" || behaviorType === "volcano") {
    // Dragon cave logic
    const hashValue = getHashValue(x, y, 10000);
    const composition = selectDragonCaveComposition(hashValue);
    return await generateDragonCaveGroup(composition, monsterCount, x, y);
  }
  
  if (behaviorType === "beast-cave") {
    // Beast cave - mixed beast group
    const beastRaces = getBeastRaces();
    const beastType = beastRaces.find(r => r === mainRace) || beastRaces[0];
    return await generateMixedBeastGroup(beastType, monsterCount, x, y);
  }
  
  // Regular location spawns use weighted group types
  const hashValue = getHashValue(x, y, 9000);
  const weights = getGroupTypeWeights(behaviorType);
  const selectedGroupType = selectGroupType(weights, hashValue);
  
  // Get creature types based on tier
  const tier = roomData ? roomData.tier : "early";
  const tierTypes = getMonsterTypesByTier(tier);
  
  // Filter by main race
  const raceTypes = tierTypes.filter(type => {
    const template = creatureTemplates[type];
    return template && template.race === mainRace;
  });
  
  if (raceTypes.length === 0) {
    // Fallback to any type in tier
    const fallbackType = tierTypes[0] || "goblin";
    return await generateRegularGroup(fallbackType, monsterCount, x, y);
  }
  
  // Generate based on group type
  return await generateMonstersByGroupType(
    selectedGroupType,
    raceTypes,
    mainRace,
    monsterCount,
    x,
    y
  );
}

/**
 * Generate monsters for entity encounters
 */
async function generateEntityMonsters(
  entityType,
  x,
  y,
  monsterCount,
  groupType
) {
  if (entityType === "beast") {
    // Beast entity encounters
    if (groupType.includes("leader") || groupType.endsWith("_leader")) {
      // Beast with leader
      const beastRaces = getBeastRaces();
      const hashValue = getHashValue(x, y, 11000);
      const beastType = beastRaces[Math.floor(hashValue * beastRaces.length)];
      const allTypes = getAllMonsterTypes();
      const beastTypes = allTypes.filter(type => {
        const t = creatureTemplates[type];
        return t && t.race === beastType;
      });
      
      // Find a leader type
      const leaderTypes = beastTypes.filter(type => {
        const t = creatureTemplates[type];
        return t && (t.class === "Alpha" || t.class === "Elder");
      });
      
      if (leaderTypes.length > 0) {
        const leaderType = leaderTypes[0];
        return await generateLeaderGroup(leaderType, monsterCount, x, y);
      }
    }
    
    // Regular beast group
    const beastRaces = getBeastRaces();
    const hashValue = getHashValue(x, y, 11000);
    const beastType = beastRaces[Math.floor(hashValue * beastRaces.length)];
    return await generateMixedBeastGroup(beastType, monsterCount, x, y);
  }
  
  // Monster entity encounters
  const weights = getGroupTypeWeights(entityType);
  const hashValue = getHashValue(x, y, 12000);
  const selectedGroupType = selectGroupType(weights, hashValue);
  
  // Get main creature type (deterministic)
  const mainRace = getDeterministicCreatureType(x, y, entityType);
  const allTypes = getAllMonsterTypes();
  const raceTypes = allTypes.filter(type => {
    const t = creatureTemplates[type];
    return t && t.race === mainRace;
  });
  
  return await generateMonstersByGroupType(
    selectedGroupType,
    raceTypes,
    mainRace,
    monsterCount,
    x,
    y
  );
}

/**
 * Generate monsters based on group type
 */
async function generateMonstersByGroupType(
  groupType,
  raceTypes,
  mainRace,
  monsterCount,
  x,
  y
) {
  // Handle leader groups (including "_leader" suffix variants)
  if (groupType === GROUP_TYPES.LEADER || 
      groupType.includes("leader") || 
      groupType.endsWith("_leader")) {
    // Leader group
    const baseType = raceTypes[0] || "goblin";
    return await generateLeaderGroup(baseType, monsterCount, x, y);
  }
  
  if (groupType === GROUP_TYPES.MIXED_INTELLIGENT) {
    // Mixed intelligent
    const compatible = getCompatibleRaces(mainRace);
    if (compatible.length === 0) {
      // Fallback to regular group if no compatible races
      return await generateRegularGroup(raceTypes[0] || "goblin", monsterCount, x, y);
    }
    // Select main race plus one compatible race (as array)
    const otherRaces = compatible.filter(r => r !== mainRace);
    const selectedRace = otherRaces.length > 0 ? otherRaces[0] : mainRace;
    const racesArray = [mainRace, selectedRace];
    return await generateMixedIntelligentGroup(racesArray, monsterCount, x, y);
  }
  
  if (groupType === GROUP_TYPES.MIXED_DIFFERENT) {
    // Mixed different (intelligent + beast)
    const intelligentRace = isIntelligentRace(mainRace) ? mainRace : getIntelligentRaces()[0];
    const beastRaces = getBeastRaces();
    const beastRace = beastRaces[Math.floor(Math.random() * beastRaces.length)];
    return await generateMixedDifferentGroup(intelligentRace, beastRace, monsterCount, x, y);
  }
  
  if (groupType === GROUP_TYPES.MIXED_BEAST || groupType === GROUP_TYPES.REGULAR_BEAST) {
    // Mixed/regular beast
    const beastType = isBeastRace(mainRace) ? mainRace : getBeastRaces()[0];
    return await generateMixedBeastGroup(beastType, monsterCount, x, y);
  }
  
  // Handle REGULAR_INTELLIGENT (single race, no leader)
  if (groupType === GROUP_TYPES.REGULAR_INTELLIGENT) {
    const baseType = raceTypes[0] || "goblin";
    return await generateRegularGroup(baseType, monsterCount, x, y);
  }
  
  // Default: regular intelligent group
  const baseType = raceTypes[0] || "goblin";
  return await generateRegularGroup(baseType, monsterCount, x, y);
}

