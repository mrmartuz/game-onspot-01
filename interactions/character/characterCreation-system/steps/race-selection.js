// Race selection step
import { getShowChoiceDialog, getDialogValue } from "../../../../interactions.js";
import { raceDatabase } from "../../../../interactions/character/races.js";
import { raceEmoji } from "../../../../gamestate/emoji-database.js";
import { BASIC_RACES } from "../constants.js";
import { createMessage, createBackButton } from "../../../../interactions/character/characterCreation-system/utils/utils-navigation.js";

/**
 * Handle race selection for custom character creation
 * @returns {Promise<string>} Selected race or navigation result
 */
export async function handleRaceSelection() {
  const message = `🧬 RACE SELECTION ${raceEmoji.Human}${raceEmoji.Elf}${raceEmoji.Dwarf}${raceEmoji.Orc}`;
  let components = [];

  components.push(
    createMessage(
      "In this game there are lots of races, but you will be able to choose only the main ones. If you want one the other races, you will have to test your luck in the random generation. \nChoose your character's race:"
    )
  );

  // Only show basic races (Human, Elf, Dwarf, Orc)
  BASIC_RACES.forEach((raceName) => {
    const raceData = raceDatabase && raceDatabase[raceName];
    if (!raceData) {
      console.warn("Race not found in raceDatabase:", raceName);
      return; // Skip undefined races to prevent crash
    }
    components.push({
      type: "button",
      label: `${raceData.region} ${raceEmoji[raceName]} (${raceData.name}) - ${raceData.description}`,
      value: raceName,
    });
  });

  components.push(createBackButton());

  const choice = await getShowChoiceDialog(message, components);
  const choiceValue = getDialogValue(choice, "value");

  if (choiceValue === "back") {
    // Go back to character generation type selection
    return "back";
  }

  if (choiceValue && choiceValue !== "back") {
    return choiceValue;
  }

  return "back";
}
