// Combat movement system
// Handles movement range calculation, collision detection, and creature pushing

import { parseEquipmentString } from "../equipment.js";
import { getCombatState } from "./combat-state.js";
import { normalizeArmorType } from "./databases/armor-utils.js";

const GRID_SIZE = 10;

/**
 * Calculate movement range based on DEX
 * @param {number} dex - Dexterity stat
 * @param {string} armor - Optional armor equipment string
 * @returns {number} Movement range in tiles
 */
export function calculateMovementRange(dex, armor = null) {
  const baseRange = getBaseMovementRange(dex);
  const penalty = calculateArmorMovementPenalty(armor);
  return Math.max(1, baseRange + penalty);
}

/**
 * Get base movement range from DEX stat
 * @param {number} dex - Dexterity stat
 * @returns {number} Base movement range
 */
function getBaseMovementRange(dex) {
  if (dex < 8) return 1;
  if (dex < 16) return 2;
  if (dex < 24) return 3;
  if (dex < 32) return 4;
  if (dex < 48) return 5;
  if (dex < 56) return 6;
  if (dex < 72) return 7;
  if (dex < 80) return 8;
  if (dex < 88) return 9;
  if (dex < 96) return 10;
  return 11; // 96+
}

/**
 * Calculate movement penalty from armor
 * @param {string} armor - Armor equipment string
 * @returns {number} Movement penalty (negative number)
 */
function calculateArmorMovementPenalty(armor) {
  if (!armor) return 0;
  
  const parsed = parseEquipmentString(armor);
  if (!parsed) return 0;
  
  // Heavy armor reduces movement by 1
  const normalizedType = normalizeArmorType(parsed.type);
  const heavyArmor = ["plate-armor", "chainmail-armor"];
  
  if (normalizedType && heavyArmor.includes(normalizedType)) {
    return -1;
  }
  return 0;
}

/**
 * Get adjacent tiles (including diagonal)
 * @param {number} row - Row position
 * @param {number} col - Column position
 * @returns {Array<[number, number]>} Array of [row, col] tuples
 */
export function getAdjacentTiles(row, col) {
  return [
    [row - 1, col - 1], [row - 1, col], [row - 1, col + 1],
    [row, col - 1],                     [row, col + 1],
    [row + 1, col - 1], [row + 1, col], [row + 1, col + 1]
  ].filter(([r, c]) => r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE);
}

/**
 * Get all tiles occupied by an entity
 * @param {number} row - Top-left corner row
 * @param {number} col - Top-left corner column
 * @param {Object} size - Size object with width and height
 * @returns {Array<[number, number]>} Array of [row, col] tuples
 */
function getEntityTiles(row, col, size) {
  const tiles = [];
  const width = size.width || 1;
  const height = size.height || 1;
  
  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      tiles.push([row + r, col + c]);
    }
  }
  return tiles;
}

/**
 * Get entity position from combat state
 * @param {Object} entity - Entity (Monster or Ally)
 * @param {Object} combatState - Combat state
 * @returns {Object|null} Position object with row and col, or null
 */
function getEntityPosition(entity, combatState) {
  // Check if entity is an ally
  const allyIndex = combatState.allies.findIndex(a => a === entity);
  if (allyIndex >= 0) {
    const allyKey = `ally_${allyIndex}`;
    return combatState.positions.allies[allyKey] || null;
  }
  
  // Check if entity is a monster
  const monsterIndex = combatState.monsters.findIndex(m => m === entity);
  if (monsterIndex >= 0) {
    const monsterKey = `monster_${monsterIndex}`;
    return combatState.positions.monsters[monsterKey] || null;
  }
  
  return null;
}

/**
 * Get all tiles occupied by all entities (excluding the moving entity)
 * @param {Object} combatState - Combat state
 * @param {Object} excludeEntity - Entity to exclude from occupied tiles
 * @returns {Map<string, Object>} Map of tile keys to entities
 */
function getAllOccupiedTiles(combatState, excludeEntity) {
  const occupied = new Map();
  
  // Add allies
  Object.keys(combatState.positions.allies).forEach((allyId) => {
    const position = combatState.positions.allies[allyId];
    const allyIndex = parseInt(allyId.split("_")[1]);
    const ally = combatState.allies[allyIndex];
    
    if (ally && ally !== excludeEntity && position) {
      const size = ally.size || { width: 1, height: 1 };
      const tiles = getEntityTiles(position.row, position.col, size);
      tiles.forEach(tile => {
        const key = `${tile[0]}-${tile[1]}`;
        // Check bounds
        if (tile[0] >= 0 && tile[0] < GRID_SIZE && tile[1] >= 0 && tile[1] < GRID_SIZE) {
          occupied.set(key, ally);
        }
      });
    }
  });
  
  // Add monsters
  Object.keys(combatState.positions.monsters).forEach((monsterId) => {
    const position = combatState.positions.monsters[monsterId];
    const monsterIndex = parseInt(monsterId.split("_")[1]);
    const monster = combatState.monsters[monsterIndex];
    
    if (monster && monster !== excludeEntity && position) {
      const size = monster.size || { width: 1, height: 1 };
      const tiles = getEntityTiles(position.row, position.col, size);
      tiles.forEach(tile => {
        const key = `${tile[0]}-${tile[1]}`;
        // Check bounds
        if (tile[0] >= 0 && tile[0] < GRID_SIZE && tile[1] >= 0 && tile[1] < GRID_SIZE) {
          occupied.set(key, monster);
        }
      });
    }
  });
  
  return occupied;
}

/**
 * Calculate push direction away from moving entity
 * @param {Object} oldPos - Old position {row, col}
 * @param {number} newRow - New row position
 * @param {number} newCol - New column position
 * @returns {Object} Push direction {rowDir, colDir}
 */
function calculatePushDirection(oldPos, newRow, newCol) {
  if (!oldPos) {
    // Default push direction (down-right)
    return { rowDir: 1, colDir: 1 };
  }
  
  const rowDiff = newRow - oldPos.row;
  const colDiff = newCol - oldPos.col;
  
  // Normalize direction
  return {
    rowDir: rowDiff > 0 ? 1 : (rowDiff < 0 ? -1 : 0),
    colDir: colDiff > 0 ? 1 : (colDiff < 0 ? -1 : 0)
  };
}

/**
 * Try to push a single entity in a direction
 * @param {Object} entity - Entity to push
 * @param {Object} pushDir - Push direction {rowDir, colDir}
 * @param {Object} combatState - Combat state
 * @returns {boolean} True if push was successful
 */
function tryPushEntity(entity, pushDir, combatState) {
  const currentPos = getEntityPosition(entity, combatState);
  if (!currentPos) return false;
  
  const size = entity.size || { width: 1, height: 1 };
  
  // Calculate new position (push 1 tile in direction)
  let newRow = currentPos.row + pushDir.rowDir;
  let newCol = currentPos.col + pushDir.colDir;
  
  // Check bounds
  const entityTiles = getEntityTiles(newRow, newCol, size);
  for (const [r, c] of entityTiles) {
    if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) {
      // Try alternative push direction (perpendicular)
      if (pushDir.rowDir !== 0) {
        newRow = currentPos.row;
        newCol = currentPos.col + (pushDir.colDir !== 0 ? pushDir.colDir : 1);
      } else {
        newRow = currentPos.row + (pushDir.rowDir !== 0 ? pushDir.rowDir : 1);
        newCol = currentPos.col;
      }
      
      // Re-check bounds
      const altTiles = getEntityTiles(newRow, newCol, size);
      for (const [ar, ac] of altTiles) {
        if (ar < 0 || ar >= GRID_SIZE || ac < 0 || ac >= GRID_SIZE) {
          return false; // Can't push, no space
        }
      }
      break;
    }
  }
  
  // Check if new position overlaps with other entities
  const occupiedTiles = getAllOccupiedTiles(combatState, entity);
  const newTiles = getEntityTiles(newRow, newCol, size);
  
  for (const tile of newTiles) {
    const key = `${tile[0]}-${tile[1]}`;
    if (occupiedTiles.has(key)) {
      // Try to push the blocking entity recursively
      const blockingEntity = occupiedTiles.get(key);
      if (blockingEntity && blockingEntity !== entity) {
        const pushed = tryPushEntity(blockingEntity, pushDir, combatState);
        if (!pushed) {
          return false; // Can't push blocking entity
        }
      }
    }
  }
  
  // Update entity position
  const allyIndex = combatState.allies.findIndex(a => a === entity);
  if (allyIndex >= 0) {
    const allyKey = `ally_${allyIndex}`;
    if (combatState.positions.allies[allyKey]) {
      combatState.positions.allies[allyKey].row = newRow;
      combatState.positions.allies[allyKey].col = newCol;
    }
  } else {
    const monsterIndex = combatState.monsters.findIndex(m => m === entity);
    if (monsterIndex >= 0) {
      const monsterKey = `monster_${monsterIndex}`;
      if (combatState.positions.monsters[monsterKey]) {
        combatState.positions.monsters[monsterKey].row = newRow;
        combatState.positions.monsters[monsterKey].col = newCol;
      }
    }
  }
  
  return true;
}

/**
 * Try to push overlapping entities out of the way
 * @param {Object} movingEntity - Entity that is moving
 * @param {number} newRow - New row position
 * @param {number} newCol - New column position
 * @param {Array<Object>} overlappingEntities - Array of entities that overlap
 * @param {Object} combatState - Combat state
 * @returns {boolean} True if all entities were pushed successfully
 */
function tryPushEntities(movingEntity, newRow, newCol, overlappingEntities, combatState) {
  const oldPos = getEntityPosition(movingEntity, combatState);
  const pushDir = calculatePushDirection(oldPos, newRow, newCol);
  
  // Try to push each overlapping entity
  for (const entity of overlappingEntities) {
    const pushed = tryPushEntity(entity, pushDir, combatState);
    if (!pushed) {
      return false; // Can't push, movement fails
    }
  }
  
  return true; // All entities pushed successfully
}

/**
 * Check if position is valid and handle creature pushing
 * @param {number} newRow - New row position (top-left corner)
 * @param {number} newCol - New column position (top-left corner)
 * @param {Object} entity - Entity trying to move
 * @param {Object} combatState - Combat state
 * @returns {boolean} True if movement is valid
 */
export function canMoveTo(newRow, newCol, entity, combatState) {
  // Basic bounds check
  if (newRow < 0 || newRow >= GRID_SIZE || newCol < 0 || newCol >= GRID_SIZE) {
    return false;
  }
  
  const size = entity.size || { width: 1, height: 1 };
  const entityTiles = getEntityTiles(newRow, newCol, size);
  
  // Check if all tiles are within bounds
  for (const [r, c] of entityTiles) {
    if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) {
      return false;
    }
  }
  
  const occupiedTiles = getAllOccupiedTiles(combatState, entity);
  
  // Check for overlaps
  const overlappingEntities = [];
  for (const tile of entityTiles) {
    const key = `${tile[0]}-${tile[1]}`;
    if (occupiedTiles.has(key)) {
      const overlappingEntity = occupiedTiles.get(key);
      if (overlappingEntity && overlappingEntity !== entity) {
        if (!overlappingEntities.includes(overlappingEntity)) {
          overlappingEntities.push(overlappingEntity);
        }
      }
    }
  }
  
  // If overlaps found, try to push entities
  if (overlappingEntities.length > 0) {
    return tryPushEntities(entity, newRow, newCol, overlappingEntities, combatState);
  }
  
  return true;
}

/**
 * Move entity to new position
 * @param {Object} entity - Entity to move
 * @param {number} newRow - New row position
 * @param {number} newCol - New column position
 * @param {Object} combatState - Combat state
 * @returns {boolean} True if movement was successful
 */
export function moveEntity(entity, newRow, newCol, combatState) {
  if (!canMoveTo(newRow, newCol, entity, combatState)) {
    return false;
  }
  
  // Update position in combat state
  const allyIndex = combatState.allies.findIndex(a => a === entity);
  if (allyIndex >= 0) {
    const allyKey = `ally_${allyIndex}`;
    if (combatState.positions.allies[allyKey]) {
      combatState.positions.allies[allyKey].row = newRow;
      combatState.positions.allies[allyKey].col = newCol;
      return true;
    }
  } else {
    const monsterIndex = combatState.monsters.findIndex(m => m === entity);
    if (monsterIndex >= 0) {
      const monsterKey = `monster_${monsterIndex}`;
      if (combatState.positions.monsters[monsterKey]) {
        combatState.positions.monsters[monsterKey].row = newRow;
        combatState.positions.monsters[monsterKey].col = newCol;
        return true;
      }
    }
  }
  
  return false;
}

