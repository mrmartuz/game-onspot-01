// Combat grid generation and position management
// Handles grid visualization and positioning of combatants

import {
  getCombatState,
  setCombatStateProperty,
  getCombatStateProperty,
} from "./combat-state.js";
import { getRaceEmoji } from "../../gamestate/emoji-database.js";

const GRID_SIZE = 10;

// Define spiral positions for allies (top area)
const ALLY_POSITIONS = [
  // Core positions for allies (rows 0-2)
  [0, 4],
  [0, 5],
  [0, 6], // Top row
  [1, 3],
  [1, 4],
  [1, 5],
  [1, 6],
  [1, 7], // Middle row
  [2, 2],
  [2, 3],
  [2, 4],
  [2, 5],
  [2, 6],
  [2, 7],
  [2, 8], // Bottom row
  // Extended positions if needed
  [0, 3],
  [0, 7],
  [1, 2],
  [1, 8],
  [2, 1],
  [2, 9],
];

// Define spiral positions for monsters (bottom area)
const MONSTER_POSITIONS = [
  // Core positions for monsters (rows 7-9)
  [7, 2],
  [7, 3],
  [7, 4],
  [7, 5],
  [7, 6],
  [7, 7],
  [7, 8], // Top row
  [8, 3],
  [8, 4],
  [8, 5],
  [8, 6],
  [8, 7], // Middle row
  [9, 4],
  [9, 5],
  [9, 6], // Bottom row
  // Extended positions if needed
  [7, 1],
  [7, 9],
  [8, 2],
  [8, 8],
  [9, 3],
  [9, 7],
];

/**
 * Initialize combat positions for all combatants
 */
export function initializeCombatPositions() {
  const combatState = getCombatState();
  const positions = { allies: {}, monsters: {} };

  // Position allies using spiral pattern
  combatState.allies.forEach((ally, index) => {
    const pos = ALLY_POSITIONS[index] || [1, 4]; // Fallback position
    // Add unique ID to ally
    ally.combatId = index;
    // Use a consistent key format
    const allyKey = `ally_${index}`;
    positions.allies[allyKey] = {
      row: pos[0],
      col: pos[1],
    };
  });

  // Position monsters using spiral pattern
  combatState.monsters.forEach((monster, index) => {
    const pos = MONSTER_POSITIONS[index] || [8, 5]; // Fallback position
    // Add unique ID to monster
    monster.combatId = index;
    // Use a consistent key format
    const monsterKey = `monster_${index}`;
    positions.monsters[monsterKey] = {
      row: pos[0],
      col: pos[1],
    };
  });

  setCombatStateProperty("positions", positions);
}

/**
 * Get emoji position for a creature based on its size
 * @param {number} row - Top-left corner row
 * @param {number} col - Top-left corner column
 * @param {Object} size - Size object with width and height
 * @returns {Object} Position object with emojiRow and emojiCol
 */
function getEmojiPosition(row, col, size) {
  const width = size.width || 1;
  const height = size.height || 1;

  // For 1x1: center tile (same as anchor)
  if (width === 1 && height === 1) {
    return { emojiRow: row, emojiCol: col };
  }

  // For 2x1 (trolls): top-left tile (same as anchor)
  if (width === 2 && height === 1) {
    return { emojiRow: row, emojiCol: col };
  }

  // For 1x2 (bears): top tile (same as anchor)
  if (width === 1 && height === 2) {
    return { emojiRow: row, emojiCol: col };
  }

  // For 2x2: top-left tile (same as anchor)
  if (width === 2 && height === 2) {
    return { emojiRow: row, emojiCol: col };
  }

  // For 2x3: center-left tile (row: center, col: left)
  if (width === 2 && height === 3) {
    return { emojiRow: row + 1, emojiCol: col }; // Center row, left column
  }

  // For 3x3: center tile
  if (width === 3 && height === 3) {
    return { emojiRow: row + 1, emojiCol: col + 1 }; // Center of 3x3
  }

  // For 4x4: center 2x2 area (rows 1-2, cols 1-2 from top-left)
  if (width === 4 && height === 4) {
    // Place emoji in the center 2x2 area - use top-left of center area
    return { emojiRow: row + 1, emojiCol: col + 1 };
  }

  // Default: use top-left corner
  return { emojiRow: row, emojiCol: col };
}

/**
 * Generate combat grid for visualization
 * @param {string} phase - Current combat phase
 * @param {Object} currentCombatant - Currently active combatant (optional)
 * @returns {Object} Grid tiles object for dialog display
 */
export function generateCombatGrid(phase, currentCombatant = null) {
  const combatState = getCombatState();
  const tiles = {};
  const hitEffects = combatState.hitEffects || {};

  // Helper function to add a creature to the grid
  const addCreatureToGrid = (entity, position, isAlly, entityId) => {
    if (!entity || !position) return;

    const size = entity.size || { width: 1, height: 1 };
    const occupiedTiles = entity.getOccupiedTiles(position.row, position.col);

    // Get emoji position
    const { emojiRow, emojiCol } = getEmojiPosition(
      position.row,
      position.col,
      size
    );
    const emojiCellKey = `${emojiRow}-${emojiCol}`;

    // Determine emoji based on status
    let emoji;
    if (entity.isDead()) {
      emoji = "💀"; // Dead
    } else if (entity.isUnconscious()) {
      emoji = "😵"; // Unconscious
    } else {
      // Check for hit effects
      const hitEffect = hitEffects[entityId];
      if (hitEffect === "hit") {
        emoji = "💥"; // Hit
      } else if (hitEffect === "miss") {
        emoji = "🌬"; // Miss
      } else {
        emoji = getRaceEmoji(entity.character?.race || entity.race);
      }
    }

    // Determine display name
    const name = entity.name || (isAlly ? `Ally` : `Monster`);
    const displayName = `${name} (#${entity.combatId + 1})`;

    // Determine background color
    let backgroundColor;
    if (isAlly) {
      backgroundColor = "#4169E1"; // Royal Blue for allies
      if (entity.isPlayer) {
        backgroundColor = "#FFD700"; // Gold for player
      }
      // Change background color if this is the current combatant
      if (
        currentCombatant &&
        ((entity.isPlayer && currentCombatant.isPlayer) ||
          (entity.character &&
            currentCombatant.character &&
            entity.character === currentCombatant.character))
      ) {
        backgroundColor = "#FFFFFF"; // White for current combatant
      }
    } else {
      // Monster
      const enemiesDetected =
        phase === "detection" ? combatState.enemiesDetected : true;

      if (enemiesDetected || phase !== "detection") {
        backgroundColor = "#CC6969"; // Light red for enemies
        // Change background color if this is the current combatant
        if (
          currentCombatant &&
          !currentCombatant.character &&
          !currentCombatant.isPlayer &&
          entity.combatId === currentCombatant.combatId
        ) {
          backgroundColor = "#FFFFFF"; // White for current combatant
        }
      } else {
        // Unknown enemy
        backgroundColor = "#808080"; // Gray for unknown
        emoji = "❓";
      }
    }

    // Add all occupied tiles to grid
    occupiedTiles.forEach(([tileRow, tileCol]) => {
      // Check bounds
      if (
        tileRow < 0 ||
        tileRow >= GRID_SIZE ||
        tileCol < 0 ||
        tileCol >= GRID_SIZE
      ) {
        return;
      }

      const cellKey = `${tileRow}-${tileCol}`;
      const isEmojiTile = tileRow === emojiRow && tileCol === emojiCol;

      tiles[cellKey] = {
        emoji: isEmojiTile ? emoji : "", // Only show emoji on designated tile
        name: displayName,
        backgroundColor,
        description: isAlly
          ? `${displayName} - HP: ${entity.currentHealth}/${entity.maxHealth}`
          : phase === "detection" && !combatState.enemiesDetected
          ? "Unknown threat detected"
          : `${displayName} - HP: ${entity.currentHealth}/${entity.maxHealth}`,
        isPartOfCreature: !isEmojiTile, // Mark non-emoji tiles
        creatureId: entityId, // Store creature ID for click detection
      };
    });
  };

  // Add allies to grid
  Object.keys(combatState.positions.allies).forEach((allyId) => {
    const position = combatState.positions.allies[allyId];
    const allyIndex = parseInt(allyId.split("_")[1]);
    const ally = combatState.allies[allyIndex];
    addCreatureToGrid(ally, position, true, allyId);
  });

  // Add monsters to grid
  Object.keys(combatState.positions.monsters).forEach((monsterId) => {
    const position = combatState.positions.monsters[monsterId];
    const monsterIndex = parseInt(monsterId.split("_")[1]);
    const monster = combatState.monsters[monsterIndex];
    addCreatureToGrid(monster, position, false, monsterId);
  });

  return tiles;
}

/**
 * Update combat positions based on player choice
 * @param {string} playerChoice - Player's engagement choice
 */
export function updateCombatPositions(playerChoice) {
  const combatState = getCombatState();

  // Calculate movement distances
  const playerMovement = getMovementDistance(playerChoice);
  const enemyMovement = Math.max(0, playerMovement - 1); // Enemies move slightly less

  // Update ally positions
  Object.keys(combatState.positions.allies).forEach((allyId) => {
    const position = combatState.positions.allies[allyId];
    if (position) {
      position.row = Math.min(GRID_SIZE - 1, position.row + playerMovement);
    }
  });

  // Update monster positions
  Object.keys(combatState.positions.monsters).forEach((monsterId) => {
    const position = combatState.positions.monsters[monsterId];
    if (position) {
      position.row = Math.max(0, position.row - enemyMovement);
    }
  });
}

/**
 * Get movement distance based on player choice
 * @param {string} choice - Player engagement choice
 * @returns {number} Movement distance
 */
function getMovementDistance(choice) {
  switch (choice) {
    case "charge":
      return 3; // Charge forward
    case "attack":
      return 2; // Advance carefully
    case "stalk":
      return 1; // Sneak forward
    case "defend":
      return 0; // Stay in place
    default:
      return 0; // Stay at same position
  }
}
