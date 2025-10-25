// UI utility functions for character creation dialogs
import {
  EQUIPMENT_SLOTS,
  STAT_CATEGORIES,
  NAME_GRID_COLUMNS,
  NAME_GRID_TEXT_SIZE,
  NAME_GRID_GAP,
  MAX_NAMES_DISPLAYED,
} from "../constants.js";

/**
 * Create a button grid component for displaying multiple options
 * @param {Array} items - Array of items to display as buttons
 * @param {number} columns - Number of columns in the grid
 * @param {string} textSize - CSS text size for buttons
 * @param {string} valuePrefix - Prefix for button values
 * @returns {Object} Button grid component
 */
export function createButtonGrid(
  items,
  columns = 3,
  textSize = "12px",
  valuePrefix = ""
) {
  return {
    type: "button_grid",
    columns: columns,
    textSize: textSize,
    gap: "2px",
    buttons: items.map((item) => ({
      label: item,
      value: `${valuePrefix}${item}`,
    })),
  };
}

/**
 * Create a specialized name grid for name selection
 * @param {Array} names - Array of names to display
 * @param {string} type - Type of names ("first" or "last")
 * @returns {Object} Name button grid component
 */
export function createNameGrid(names, type) {
  const displayNames = names.slice(0, MAX_NAMES_DISPLAYED);

  return {
    type: "button_grid",
    columns: NAME_GRID_COLUMNS,
    textSize: NAME_GRID_TEXT_SIZE,
    gap: NAME_GRID_GAP,
    buttons: displayNames.map((name) => ({
      label: name,
      value: `${type}_${name}`,
    })),
  };
}

/**
 * Create stat display messages for physical and mental stats
 * @param {Object} stats - Character stats object
 * @param {Object} categories - Stat categories (physical/mental)
 * @returns {Array} Array of message components
 */
export function createStatDisplay(stats, categories = STAT_CATEGORIES) {
  const components = [];

  // Physical stats
  components.push({
    type: "message",
    label: "Physical Stats:",
    value: "",
  });

  const physicalStats = categories.physical
    .map((stat) => `${stat}: ${stats[stat]}`)
    .join(" | ");
  components.push({
    type: "message",
    label: `  ${physicalStats}`,
    value: "",
  });

  // Mental stats
  components.push({
    type: "message",
    label: "Mental Stats:",
    value: "",
  });

  const mentalStats = categories.mental
    .map((stat) => `${stat}: ${stats[stat]}`)
    .join(" | ");
  components.push({
    type: "message",
    label: `  ${mentalStats}`,
    value: "",
  });

  return components;
}

/**
 * Create equipment display messages
 * @param {Object} equipment - Character equipment object
 * @param {Array} slots - Equipment slot configuration
 * @returns {Array} Array of message components
 */
export function createEquipmentDisplay(equipment, slots = EQUIPMENT_SLOTS) {
  const components = [];

  components.push({
    type: "message",
    label: ":::::STARTING EQUIPMENT:::::",
    value: "",
  });

  slots.forEach(({ key, label }) => {
    const item = equipment[key];
    if (item) {
      // Special handling for secondHand to show "(2h-grip)" properly
      if (key === "secondHand" && item === "(2h-grip)") {
        components.push({
          type: "message",
          label: `${label}: ${item}`,
          value: "",
        });
      } else {
        components.push({
          type: "message",
          label: `${label}: ${item}`,
          value: "",
        });
      }
    } else {
      components.push({
        type: "message",
        label: `${label}: (empty)`,
        value: "",
      });
    }
  });

  return components;
}

/**
 * Create skills display messages
 * @param {Object} skills - Character skills object
 * @returns {Array} Array of message components
 */
export function createSkillsDisplay(skills) {
  const components = [];

  if (Object.keys(skills).length > 0) {
    components.push({
      type: "message",
      label: ":::::STARTING SKILLS:::::",
      value: "",
    });

    // Group skills into lines of 2 skills each
    const skillEntries = Object.entries(skills);
    for (let i = 0; i < skillEntries.length; i += 2) {
      const skillLine = skillEntries
        .slice(i, i + 2)
        .map(([skill, level]) => `${skill}: ${level}`)
        .join(" | ");
      components.push({
        type: "message",
        label: skillLine,
        value: "",
      });
    }
  }

  return components;
}

/**
 * Create a compact stat line for character preview
 * @param {Object} stats - Character stats object
 * @param {Array} statList - Array of stat names to include
 * @returns {string} Formatted stat line
 */
export function createCompactStatLine(stats, statList) {
  return statList.map((stat) => `${stat}:${stats[stat]}`).join(" | ");
}
