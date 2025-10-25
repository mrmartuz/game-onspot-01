// Random character generation step
import { getShowChoiceDialog, getDialogValue } from "../../../../interactions.js";
import characterGeneration from "../../generation.js";
import { createMessage, createBackButton } from "../utils/utils-navigation.js";
import { showCharacterPreview } from "./character-preview.js";

/**
 * Handle random character generation
 * @returns {Promise<Object|string>} Generated character or navigation result
 */
export async function handleRandomGeneration() {
  const message = "🎲 RANDOM CHARACTER GENERATION";
  let components = [];

  components.push(
    createMessage(
      "Generate a random character with random stats, class, and equipment?"
    )
  );

  components.push({
    type: "button",
    label: "🎲 Generate Random Character",
    value: "generate",
  });

  components.push(createBackButton());

  const choice = await getShowChoiceDialog(message, components);
  const choiceValue = getDialogValue(choice, "value");

  if (choiceValue === "generate") {
    const character = await characterGeneration.generateCharacter({
      usePointAllocation: false,
    });

    const result = await showCharacterPreview(
      character,
      "random",
      null,
      null,
      null,
      null,
      null
    );

    // Check if character was accepted
    if (result && result.action === "accept") {
      return result; // Return the accepted character
    }

    return result; // Return other results (back, regenerate, etc.)
  }

  return "back";
}
