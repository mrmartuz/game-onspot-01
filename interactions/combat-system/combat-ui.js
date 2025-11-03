// Combat UI Helpers
// Utility functions for formatting combat messages and creating dialog choices

import { getRaceEmoji } from "../../gamestate/emoji-database.js";
import { generateCombatGrid } from "./combat-grid.js";

/**
 * Format a monster entry for display in lists
 * @param {Object} monster - Monster object
 * @param {number} index - Index in the list (0-based)
 * @param {string} format - Format style: 'engagement' (with class/level) or 'combat' (with HP)
 * @returns {string} Formatted monster string
 */
export function formatMonsterEntry(monster, index, format = "combat") {
  // Show status-based emoji
  let emoji;
  if (monster.isDead && monster.isDead()) {
    emoji = "💀"; // Dead
  } else if (monster.isUnconscious && monster.isUnconscious()) {
    emoji = "😵"; // Unconscious
  } else {
    emoji = getRaceEmoji(monster.race); // Conscious
  }
  const id = `#${monster.combatId + 1}`;

  if (format === "engagement") {
    return `${index + 1}. ${monster.name} (${id}) (${monster.race} ${emoji} ${
      monster.class
    } Lv.${monster.level})`;
  } else {
    // combat format (default)
    return `${index + 1}. ${monster.name} (${id}) ${emoji} (${
      monster.currentHealth
    }/${monster.maxHealth} HP)`;
  }
}

/**
 * Format a list of monsters for display
 * @param {Array} monsters - Array of monster objects
 * @param {string} format - Format style: 'engagement' or 'combat'
 * @returns {string} Formatted monster list string
 */
export function formatMonsterList(monsters, format = "combat") {
  if (!monsters || monsters.length === 0) {
    return "";
  }

  return monsters
    .map((monster, index) => formatMonsterEntry(monster, index, format))
    .join("\n");
}

/**
 * Format an ally entry for display
 * @param {Object} ally - Ally object
 * @returns {string} Formatted ally string
 */
export function formatAllyEntry(ally) {
  // Show status-based emoji
  let emoji;
  if (ally.isDead && ally.isDead()) {
    emoji = "💀"; // Dead
  } else if (ally.isUnconscious && ally.isUnconscious()) {
    emoji = "😵"; // Unconscious
  } else {
    emoji = getRaceEmoji(ally.character?.race); // Conscious
  }
  const condition =
    ally.status === "dead"
      ? "Dead"
      : ally.unconscious
      ? "Unconscious"
      : "Active";

  return `- ${ally.name} ${emoji}: ${ally.currentHealth}/${ally.maxHealth} HP (${condition})`;
}

/**
 * Format a list of allies for display
 * @param {Array} allies - Array of ally objects
 * @returns {string} Formatted ally list string
 */
export function formatAllyList(allies) {
  if (!allies || allies.length === 0) {
    return "";
  }

  return allies.map((ally) => formatAllyEntry(ally)).join("\n");
}

/**
 * Create a target choice button for dialog
 * @param {Object} target - Target monster object
 * @param {number} index - Index in the list (0-based)
 * @returns {Object} Dialog choice object
 */
export function createTargetChoice(target, index) {
  // Show status-based emoji
  let emoji;
  if (target.isDead && target.isDead()) {
    emoji = "💀"; // Dead
  } else if (target.isUnconscious && target.isUnconscious()) {
    emoji = "😵"; // Unconscious
  } else {
    emoji = getRaceEmoji(target.race); // Conscious
  }
  return {
    type: "button",
    label: `${target.name} (#${target.combatId + 1}) ${emoji} (${
      target.currentHealth
    }/${target.maxHealth} HP)`,
    value: `target_${index}`,
  };
}

/**
 * Create dialog choices array with combat grid
 * @param {string} phase - Combat phase ('detection', 'engagement', 'combat')
 * @param {Array} buttons - Array of button choice objects
 * @param {Object} currentCombatant - Optional current combatant for grid generation
 * @returns {Array} Dialog choices array with grid and buttons
 */
export function createDialogChoicesWithGrid(
  phase,
  buttons,
  currentCombatant = null
) {
  const combatGrid = generateCombatGrid(phase, currentCombatant);
  return [{ type: "squaregrid", tiles: combatGrid }, ...buttons];
}

/**
 * Format attack result message
 * @param {Object} attacker - Attacker entity
 * @param {Object} target - Target entity
 * @param {number} damage - Damage dealt
 * @param {boolean} hit - Whether the attack hit
 * @returns {string} Formatted attack message
 */
export function formatAttackMessage(attacker, target, damage, hit) {
  const attackerEmoji = getRaceEmoji(attacker.character?.race || attacker.race);
  const targetEmoji = getRaceEmoji(target.character?.race || target.race);

  if (hit) {
    return `⚔️ ${attacker.name} ${attackerEmoji} attacks ${target.name} ${targetEmoji} for ${damage} damage!`;
  } else {
    return `⚔️ ${attacker.name} ${attackerEmoji} attacks ${target.name} ${targetEmoji} but misses!`;
  }
}

/**
 * Format player turn message with health and status
 * @param {Object} player - Player entity
 * @param {Array} allies - Array of ally objects
 * @param {Array} targets - Array of target monster objects
 * @returns {string} Formatted player turn message
 */
export function formatPlayerTurnMessage(player, allies, targets) {
  let message = `⚔️ YOUR TURN\n\nHealth: ${player.currentHealth}/${player.maxHealth}\n\n`;

  // Add allies status
  if (allies && allies.length > 0) {
    message += `Allies:\n`;
    message += formatAllyList(allies);
    message += `\n\n`;
  }

  // Add available targets
  if (targets && targets.length > 0) {
    message += `Available targets:\n`;
    message += formatMonsterList(targets, "combat");
  }

  return message;
}

/**
 * Create standard combat action buttons in 2-column grid layout
 * Row 1: Advance, Retreat
 * Row 2: Melee Attack, Ranged Attack
 * Row 3: Defend Stance, Defend Ally
 * Row 4: Flee Alone, Flee Group
 * @returns {Array} Array of button choice objects with button_grid
 */
export function createCombatActionButtons() {
  // Create buttons array matching the format used in equipment management
  const buttons = [
    { label: "⬆️ Advance", value: "advance" },
    { label: "⬇️ Retreat", value: "retreat" },
    { label: "⚔️ Melee Attack", value: "melee_attack" },
    { label: "🏹 Ranged Attack", value: "ranged_attack" },
    { label: "🛡️ Defend Stance", value: "defend" },
    { label: "🛡️ Defend Ally", value: "protect" },
    { label: "🏃 Flee Alone", value: "flee_alone" },
    { label: "🏃 Flee Group", value: "flee_group" },
  ];

  return [
    {
      type: "button_grid",
      columns: 2,
      textSize: "12px",
      gap: "6px",
      buttons: buttons,
    },
  ];
}

/**
 * Create standard engagement action buttons
 * @returns {Array} Array of button choice objects
 */
export function createEngagementActionButtons() {
  return [
    { type: "button", label: "⚡ Charge Attack", value: "charge" },
    { type: "button", label: "🎯 Careful Attack", value: "attack" },
    { type: "button", label: "🥷 Stalk", value: "stalk" },
    { type: "button", label: "🏃 Run Away", value: "flee" },
  ];
}
