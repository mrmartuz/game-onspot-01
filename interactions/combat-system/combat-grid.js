// Combat grid generation and position management
// Handles grid visualization and positioning of combatants

import { getCombatState, setCombatStateProperty, getCombatStateProperty } from "./combat-state.js";
import { getRaceEmoji } from "../../gamestate/emoji-database.js";

const GRID_SIZE = 10;

// Define spiral positions for allies (top area)
const ALLY_POSITIONS = [
  // Core positions for allies (rows 0-2)
  [0, 4], [0, 5], [0, 6], // Top row
  [1, 3], [1, 4], [1, 5], [1, 6], [1, 7], // Middle row
  [2, 2], [2, 3], [2, 4], [2, 5], [2, 6], [2, 7], [2, 8], // Bottom row
  // Extended positions if needed
  [0, 3], [0, 7], [1, 2], [1, 8], [2, 1], [2, 9],
];

// Define spiral positions for monsters (bottom area)
const MONSTER_POSITIONS = [
  // Core positions for monsters (rows 7-9)
  [7, 2], [7, 3], [7, 4], [7, 5], [7, 6], [7, 7], [7, 8], // Top row
  [8, 3], [8, 4], [8, 5], [8, 6], [8, 7], // Middle row
  [9, 4], [9, 5], [9, 6], // Bottom row
  // Extended positions if needed
  [7, 1], [7, 9], [8, 2], [8, 8], [9, 3], [9, 7],
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
 * Generate combat grid for visualization
 * @param {string} phase - Current combat phase
 * @param {Object} currentCombatant - Currently active combatant (optional)
 * @returns {Object} Grid tiles object for dialog display
 */
export function generateCombatGrid(phase, currentCombatant = null) {
  const combatState = getCombatState();
  const tiles = {};

  // Add allies to grid
  Object.keys(combatState.positions.allies).forEach((allyId) => {
    const position = combatState.positions.allies[allyId];
    // Extract index from ally key (ally_0, ally_1, etc.)
    const allyIndex = parseInt(allyId.split("_")[1]);
    const ally = combatState.allies[allyIndex];

    if (ally && position) {
      const cellKey = `${position.row}-${position.col}`;
      // Show different emojis based on ally status
      let emoji;
      if (ally.isDead()) {
        emoji = "💀"; // Dead
      } else if (ally.isUnconscious()) {
        emoji = "😵"; // Unconscious
      } else {
        emoji = getRaceEmoji(ally.character?.race || ally.race); // Conscious
      }
      const name = ally.name || `Ally ${allyIndex + 1}`;
      // Add ID to name for better identification
      const displayName = `${name} (#${ally.combatId + 1})`;

      // Determine background color
      let backgroundColor = "#4169E1"; // Royal Blue for allies
      if (ally.isPlayer) {
        backgroundColor = "#FFD700"; // Gold for player
      }

      // Change background color if this is the current combatant
      if (
        currentCombatant &&
        ((ally.isPlayer && currentCombatant.isPlayer) ||
          (ally.character && currentCombatant.character && ally.character === currentCombatant.character))
      ) {
        backgroundColor = "#00FF00"; // Green for current combatant
      }

      tiles[cellKey] = {
        emoji,
        name: displayName,
        backgroundColor,
        description: `${displayName} - HP: ${ally.currentHealth}/${ally.maxHealth}`,
      };
    }
  });

  // Add monsters to grid
  Object.keys(combatState.positions.monsters).forEach((monsterId) => {
    const position = combatState.positions.monsters[monsterId];
    // Extract index from monster key (monster_0, monster_1, etc.)
    const monsterIndex = parseInt(monsterId.split("_")[1]);
    const monster = combatState.monsters[monsterIndex];

    if (monster && position) {
      const cellKey = `${position.row}-${position.col}`;
      const enemiesDetected =
        phase === "detection" ? combatState.enemiesDetected : true;

      let emoji, backgroundColor, name;

      if (enemiesDetected || phase !== "detection") {
        // Show monster details with status-based emoji
        if (monster.isDead()) {
          emoji = "💀"; // Dead
        } else if (monster.isUnconscious()) {
          emoji = "😵"; // Unconscious
        } else {
          emoji = getRaceEmoji(monster.race); // Conscious
        }
        name = `${monster.name} (#${monster.combatId + 1})`;
        backgroundColor = "#DC143C"; // Crimson for enemies

        // Change background color if this is the current combatant
        if (
          currentCombatant &&
          !currentCombatant.character &&
          !currentCombatant.isPlayer &&
          monster.combatId === currentCombatant.combatId
        ) {
          backgroundColor = "#00FF00"; // Green for current combatant
        }
      } else {
        // Show unknown enemy indicator
        emoji = "❓";
        name = "Unknown Enemy";
        backgroundColor = "#808080"; // Gray for unknown
      }

      tiles[cellKey] = {
        emoji,
        name,
        backgroundColor,
        description: enemiesDetected
          ? `${name} - HP: ${monster.currentHealth}/${monster.maxHealth}`
          : "Unknown threat detected",
      };
    }
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

