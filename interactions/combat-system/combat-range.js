// Combat range and line of sight system
// Handles range checking and line of sight calculations

import { getCombatState } from "./combat-state.js";

const GRID_SIZE = 10;

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
 * Check if a tile is occupied by any creature
 * @param {number} row - Row position
 * @param {number} col - Column position
 * @param {Object} combatState - Combat state
 * @returns {boolean} True if tile is occupied
 */
function isTileOccupied(row, col, combatState) {
  const allOccupied = getAllOccupiedTiles(combatState, null);
  return allOccupied.has(`${row}-${col}`);
}

/**
 * Get line path using Bresenham's line algorithm
 * @param {number} row1 - Start row
 * @param {number} col1 - Start column
 * @param {number} row2 - End row
 * @param {number} col2 - End column
 * @returns {Array<[number, number]>} Array of [row, col] tuples along the path
 */
function getLinePath(row1, col1, row2, col2) {
  const path = [];
  const dx = Math.abs(col2 - col1);
  const dy = Math.abs(row2 - row1);
  const sx = col1 < col2 ? 1 : -1;
  const sy = row1 < row2 ? 1 : -1;
  let err = dx - dy;
  
  let x = col1;
  let y = row1;
  
  while (true) {
    path.push([y, x]);
    if (x === col2 && y === row2) break;
    
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }
  
  return path;
}

/**
 * Check if there is a direct line of sight between two positions
 * Creatures block line of sight
 * @param {number} row1 - Attacker row position
 * @param {number} col1 - Attacker column position
 * @param {number} row2 - Target row position
 * @param {number} col2 - Target column position
 * @param {Object} combatState - Combat state
 * @returns {boolean} True if line of sight is clear
 */
export function hasLineOfSight(row1, col1, row2, col2, combatState) {
  const path = getLinePath(row1, col1, row2, col2);
  
  // Check each tile in path (excluding start and end) for blockers
  for (let i = 1; i < path.length - 1; i++) {
    const [r, c] = path[i];
    if (isTileOccupied(r, c, combatState)) {
      return false; // Blocked by creature
    }
  }
  return true;
}

/**
 * Check if target is in melee range (adjacent including diagonal)
 * @param {number} row1 - Attacker row position
 * @param {number} col1 - Attacker column position
 * @param {number} row2 - Target row position
 * @param {number} col2 - Target column position
 * @returns {boolean} True if target is in melee range
 */
export function isInMeleeRange(row1, col1, row2, col2) {
  const rowDiff = Math.abs(row1 - row2);
  const colDiff = Math.abs(col1 - col2);
  return rowDiff <= 1 && colDiff <= 1;
}

/**
 * Get distance between two positions (Chebyshev distance)
 * @param {number} row1 - First row position
 * @param {number} col1 - First column position
 * @param {number} row2 - Second row position
 * @param {number} col2 - Second column position
 * @returns {number} Distance between positions
 */
export function getDistance(row1, col1, row2, col2) {
  return Math.max(Math.abs(row1 - row2), Math.abs(col1 - col2));
}

