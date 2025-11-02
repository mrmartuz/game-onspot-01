// Enhanced Combat Dialog System
// Orchestrator for combat phases - delegates to specialized modules

import { gameState } from "../../gamestate/game_variables.js";
import { getTile } from "../../rendering/tile.js";
import { generateAllies } from "./ai.js";
import {
  getCombatState,
  resetCombatState,
  setCombatStateProperty,
} from "./combat-state.js";
import { initializeCombatPositions } from "./combat-grid.js";
import { handleDetectionPhase } from "./combat-phases.js";
import { generateGroupedMonsters } from "./group-generation-integration.js";
import { getLocationBehaviorType } from "./databases/location-rules.js";
import {
  getNextUnclearedRoom,
  getRoomData,
  getLocationStatus,
  checkRoomCleared,
} from "./location-rooms.js";

export async function handleEnhancedCombatDialog(ex, ey, isOnTile = false) {
  `Starting enhanced combat dialog at (${ex}, ${ey})`;

  // Reset combat state
  const combatState = resetCombatState();

  // Get tile to determine location/entity type
  const tile = getTile(ex, ey);
  const locationType = tile.location !== "none" ? tile.location : null;
  const entityType = tile.entity !== "none" ? tile.entity : null;

  // Generate combatants
  const allies = await generateAllies();
  setCombatStateProperty("allies", allies);

  // Determine if this is a location encounter or entity encounter
  let monsters = [];
  let roomIndex = -1;

  if (
    locationType &&
    ["cave", "monster caves", "volcano"].includes(locationType)
  ) {
    // Location encounter
    const behaviorType = getLocationBehaviorType(locationType);

    // Get current room index
    roomIndex = getNextUnclearedRoom(ex, ey);
    if (roomIndex === -1) {
      // All rooms cleared - check if location is fully cleared
      const locationStatus = getLocationStatus(ex, ey);
      if (locationStatus && locationStatus.allCleared) {
        // Location is fully cleared, don't generate monsters
        monsters = [];
      } else {
        // Fallback: start from room 0
        roomIndex = 0;
      }
    }

    // Get room data for tier and boss info (only if we have a valid room)
    let roomData = null;
    if (roomIndex >= 0) {
      roomData = getRoomData(ex, ey, roomIndex, locationType);
    }

    // Generate monsters for this room (if room is available)
    if (roomIndex >= 0 && roomData) {
      monsters = await generateGroupedMonsters(
        null, // entityType is null for locations
        locationType,
        ex,
        ey,
        roomData,
        roomIndex
      );
    } else {
      monsters = []; // No monsters if all rooms cleared
    }
  } else if (entityType && ["monster", "beast"].includes(entityType)) {
    // Entity encounter
    const baseMonsterCount = Math.floor(Math.random() * 3) + 1; // 1-3 monsters
    const groupMemberCount = gameState.group ? gameState.group.length : 1;
    const bonusMonsterCount = Math.max(1, Math.floor(groupMemberCount / 2));
    const monsterCount = baseMonsterCount + bonusMonsterCount;

    // Generate monsters for entity encounter
    monsters = await generateGroupedMonsters(
      entityType,
      null, // locationType is null for entities
      ex,
      ey,
      null, // no room data for entities
      -1 // no room index for entities
    );
  } else {
    // Fallback: generate basic monsters
    console.warn("Unknown encounter type, using fallback monster generation");
    monsters = await generateGroupedMonsters("monster", null, ex, ey, null, -1);
  }

  setCombatStateProperty("monsters", monsters);
  setCombatStateProperty("roomIndex", roomIndex);
  setCombatStateProperty("locationType", locationType);

  const state = getCombatState();
  `Generated ${state.allies.length} allies and ${state.monsters.length} monsters`;

  // Initialize positions for all combatants
  initializeCombatPositions();

  // Start with detection phase
  return await handleDetectionPhase();
}
