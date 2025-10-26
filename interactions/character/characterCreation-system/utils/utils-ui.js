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
 * Create equipment display button grid
 * @param {Object} equipment - Character equipment object
 * @param {Array} slots - Equipment slot configuration
 * @returns {Array} Array of components including button grid
 */
export function createEquipmentDisplay(equipment, slots = EQUIPMENT_SLOTS) {
  const components = [];

  components.push({
    type: "message",
    label: "\nCHARACTER'S EQUIPMENT ⚔️🛡️",
    value: "",
  });

  // Create button grid with slot names and items side by side
  const equipmentButtons = [];

  slots.forEach(({ key, label }) => {
    const item = equipment[key];
    let displayText;

    if (item) {
      // Special handling for secondHand to show "(2h-grip)" properly
      if (key === "secondHand" && item === "(2h-grip)") {
        displayText = item;
      } else {
        displayText = item;
      }
    } else {
      displayText = "(empty)";
    }

    // Push slot name button (left column)
    equipmentButtons.push({
      label: label,
      value: `display_equipment_slot_${key}`,
      disabled: false, // Display only, not interactive
    });

    // Push item button (right column)
    equipmentButtons.push({
      label: displayText,
      value: `display_equipment_item_${key}`,
      disabled: false, // Display only, not interactive
    });
  });

  components.push({
    type: "button_grid",
    columns: 2,
    textSize: "11px",
    gap: "2px",
    buttons: equipmentButtons,
  });

  return components;
}

/**
 * Create dynamic skills button grid display
 * @param {Object} skills - Character skills object
 * @param {Object} skillEmoji - Object containing emoji mappings for skills
 * @param {Object} skillDatabase - Skills database for skill names
 * @param {number} columns - Number of columns in the grid (default: 3)
 * @returns {Array} Array of components including button grid
 */
export function createSkillsButtonGrid(
  skills,
  skillEmoji,
  skillDatabase,
  columns = 3
) {
  const components = [];

  if (Object.keys(skills).length > 0) {
    components.push({
      type: "message",
      label: "\nCHARACTER'S SKILLS ⚒️🪚",
      value: "",
    });

    // Sort skills alphabetically by skill name
    const sortedSkills = Object.entries(skills).sort(([a], [b]) => {
      const skillA = skillDatabase[a];
      const skillB = skillDatabase[b];
      const nameA = skillA ? skillA.name : a;
      const nameB = skillB ? skillB.name : b;
      return nameA.localeCompare(nameB);
    });

    // Create button grid for skills
    const skillButtons = sortedSkills.map(([skillKey, level]) => {
      const skillData = skillDatabase[skillKey];
      const skillName = skillData ? skillData.name : skillKey;
      const emoji = skillEmoji[skillKey] || "📊";

      return {
        label: `${emoji} ${level} ${skillName}`,
        value: `display_skill_${skillKey}`,
        disabled: false, // Display only, not interactive
      };
    });

    components.push({
      type: "button_grid",
      columns: columns,
      textSize: "11px",
      gap: "2px",
      buttons: skillButtons,
    });
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

/**
 * Create character identity display component
 * @param {Object} character - Character object with name, race, class, sex
 * @param {Object} raceDatabase - Race database for race information
 * @param {Object} classDatabase - Class database for class information
 * @param {Object} raceEmoji - Object containing emoji mappings for races
 * @param {Object} classEmoji - Object containing emoji mappings for classes
 * @param {Object} sexEmoji - Object containing emoji mappings for sex
 * @returns {Array} Array of components for character identity display
 */
export function createCharacterIdentityDisplay(
  character,
  raceDatabase,
  classDatabase,
  raceEmoji,
  classEmoji,
  sexEmoji
) {
  const components = [];

  // Get race and class data
  const raceData = raceDatabase && raceDatabase[character.race];
  const raceRegion = raceData ? raceData.region : "Unknown Region";
  const raceName = raceData ? raceData.name.toLowerCase() : "unknown";
  const raceEmojiIcon = raceEmoji[character.race];

  const classData = classDatabase[character.class];
  const className = classData ? classData.name : "Unknown Class";
  const classEmojiIcon = classEmoji[character.class] || "❓";

  // Character name display
  components.push({
    type: "button",
    label: `${raceEmojiIcon} ${character.firstName.toUpperCase()} ${character.lastName.toUpperCase()}`,
    value: "display_character_name",
    disabled: false, // Display only, not interactive
  });

  // Character details display
  components.push({
    type: "message",
    label: `${character.sex} ${
      sexEmoji[character.sex]
    } ${raceRegion} ${raceEmojiIcon} ${className} ${classEmojiIcon} lvl.${
      character.level
    }`,
    value: "",
  });

  components.push({
    type: "message",
    label: `Health: ${character.health?.current || 0}/${
      character.health?.max || 0
    } ${character.health?.current === character.health?.max ? "❤️" : "❤️‍🩹"}`,
    value: "",
  });

  return components;
}

/**
 * Create a visual stat display grid with names, values, and emojis
 * @param {Object} stats - Character stats object
 * @param {Object} statEmoji - Object containing emoji mappings for stats
 * @param {Object} categories - Stat categories (physical/mental)
 * @returns {Array} Array of button grid components for stat display
 */
export function createStatDisplayGrid(
  stats,
  statEmoji,
  categories = STAT_CATEGORIES
) {
  const components = [];

  components.push({
    type: "message",
    label: "CHARACTER'S STATS 📊🍀",
    value: "",
  });

  const allStats = [...categories.physical, ...categories.mental];

  // Stat names row (STR, DEX, CON, INT, WIS, CHA)
  const statNameButtons = allStats.map((stat) => ({
    label: stat,
    value: `display_stat_name_${stat}`,
    disabled: false, // Display only, not interactive
  }));

  components.push({
    type: "button_grid",
    columns: 6,
    buttons: statNameButtons,
  });

  // Stat values row
  const statValueButtons = allStats.map((stat) => ({
    label: `${stats[stat]}`,
    value: `display_${stat}`,
    disabled: false, // Display only, not interactive
  }));

  components.push({
    type: "button_grid",
    columns: 6,
    buttons: statValueButtons,
  });

  // Stat emoji row
  const statEmojiButtons = allStats.map((stat) => ({
    label: `${statEmoji[stat]}`,
    value: `display_${stat}`,
    disabled: false, // Display only, not interactive
  }));

  components.push({
    type: "button_grid",
    columns: 6,
    buttons: statEmojiButtons,
  });

  return components;
}

/**
 * Create a comprehensive character overview component that displays all character information
 * @param {Object} character - Complete character object
 * @param {Object} raceDatabase - Race database for race information
 * @param {Object} classDatabase - Class database for class information
 * @param {Object} skillDatabase - Skills database for skill names
 * @param {Object} raceEmoji - Object containing emoji mappings for races
 * @param {Object} classEmoji - Object containing emoji mappings for classes
 * @param {Object} sexEmoji - Object containing emoji mappings for sex
 * @param {Object} skillEmoji - Object containing emoji mappings for skills
 * @param {Object} statEmoji - Object containing emoji mappings for stats
 * @param {Object} categories - Stat categories (physical/mental)
 * @returns {Array} Array of components for complete character overview
 */
export function createCharacterOverview(
  character,
  raceDatabase,
  classDatabase,
  skillDatabase,
  raceEmoji,
  classEmoji,
  sexEmoji,
  skillEmoji,
  statEmoji,
  categories = STAT_CATEGORIES
) {
  const components = [];

  // Character Identity Section
  const identityComponents = createCharacterIdentityDisplay(
    character,
    raceDatabase,
    classDatabase,
    raceEmoji,
    classEmoji,
    sexEmoji
  );
  components.push(...identityComponents);

  // Stats Section
  const statComponents = createStatDisplayGrid(
    character.stats,
    statEmoji,
    categories
  );
  components.push(...statComponents);

  // Skills Section
  const skillsComponents = createSkillsButtonGrid(
    character.skills,
    skillEmoji,
    skillDatabase,
    3
  );
  components.push(...skillsComponents);

  // Equipment Section
  const equipmentComponents = createEquipmentDisplay(character.equipment);
  components.push(...equipmentComponents);

  components.push({
    type: "message",
    label: "\n",
    value: "",
  });

  return components;
}
