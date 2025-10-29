// Character preview for management system
import { showChoiceDialog } from "../../../showDialog.js";
import { raceDatabase } from "../../races.js";
import { classDatabase } from "../../../combat/classes.js";
import {
  raceEmoji,
  classEmoji,
  sexEmoji,
  skillEmoji,
  statEmoji,
} from "../../../../gamestate/emoji-database.js";
import { skillDatabase } from "../../../skills.js";
import { createCharacterOverview } from "../../characterCreation-system/utils/utils-ui.js";
import { STAT_CATEGORIES } from "../../characterCreation-system/constants.js";
import {
  createBackButton,
  createCharacterNavigator,
} from "../utils/utils-navigation.js";

/**
 * Show character preview for management
 * @param {Object} character - Character to preview
 * @param {number} currentIndex - Current index in character list
 * @param {Array} characters - Full array of characters for navigation
 * @returns {Promise<string>} Navigation result
 */
export async function showCharacterPreview(
  character,
  currentIndex = 0,
  characters = []
) {
  let components = [];

  // Add character navigator if we have multiple characters
  if (characters && characters.length > 0) {
    const navigatorComponent = createCharacterNavigator(
      character,
      currentIndex,
      characters.length,
      raceEmoji
    );
    components.push(navigatorComponent);
  }

  // Complete character overview using single comprehensive component
  const overviewComponents = createCharacterOverview(
    character,
    raceDatabase,
    classDatabase,
    skillDatabase,
    raceEmoji,
    classEmoji,
    sexEmoji,
    skillEmoji,
    statEmoji,
    STAT_CATEGORIES
  );
  components.push(...overviewComponents);

  // Add back button
  components.push(createBackButton());

  const choice = await showChoiceDialog("", components);

  if (choice === "back") {
    return "back";
  }

  if (choice === "nav_previous" || choice === "nav_next") {
    return choice;
  }

  return "back";
}
