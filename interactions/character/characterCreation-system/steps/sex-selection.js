// Sex selection step
import { getShowChoiceDialog, getDialogValue } from "../../../../interactions.js";
import { sexEmoji } from "../../../../gamestate/emoji-database.js";
import { createMessage, createBackButton } from "../utils/utils-navigation.js";

/**
 * Handle sex selection for custom character creation
 * @param {string} race - Selected race
 * @returns {Promise<string>} Selected sex or navigation result
 */
export async function handleSexSelection(race) {
  const message = `${sexEmoji.female} SEX SELECTION ${sexEmoji.male}`;
  let components = [];

  components.push(createMessage("Choose your character's sex:"));

  components.push({
    type: "button",
    label: `${sexEmoji.male} Male`,
    value: "male",
  });

  components.push({
    type: "button",
    label: `${sexEmoji.female} Female`,
    value: "female",
  });

  components.push(createBackButton());

  const choice = await getShowChoiceDialog(message, components);
  const choiceValue = getDialogValue(choice, "value");

  if (choiceValue === "back") {
    // Go back to race selection (reset race selection)
    return "back";
  }

  if (choiceValue && choiceValue !== "back") {
    return choiceValue;
  }

  return "back";
}
