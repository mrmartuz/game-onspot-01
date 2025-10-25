// Class selection step
import {
  getShowChoiceDialog,
  getDialogValue,
} from "../../../../interactions.js";
import characterGeneration from "../../generation.js";
import { classDatabase } from "../../../../interactions/combat/classes.js";
import { createMessage, createBackButton } from "../utils/utils-navigation.js";
import { raceEmoji } from "../../../../gamestate/emoji-database.js";
import { sexEmoji } from "../../../../gamestate/emoji-database.js";
import { classEmoji } from "../../../../gamestate/emoji-database.js";
import { raceDatabase } from "../../../../interactions/character/races.js";
/**
 * Handle class selection for custom character creation
 * @param {Object} nameResult - Name selection result
 * @param {string} race - Selected race
 * @param {string} sex - Selected sex
 * @returns {Promise<string>} Selected class or navigation result
 */
export async function handleClassSelection(nameResult, race, sex) {
  const message = "🏛️ CLASS SELECTION";
  let components = [];

  components.push(
    createMessage(
      `You are  ${nameResult.firstName} ${nameResult.lastName} a ${sex} ${sexEmoji[sex]} ${raceDatabase[race].region} ${raceEmoji[race]}. \n Choose your class:`
    )
  );

  // Only show common classes
  const commonClasses = await characterGeneration.getClassesByRarity("common");

  if (commonClasses.length > 0) {
    commonClasses.forEach((className) => {
      const classData = classDatabase[className];
      components.push({
        type: "button",
        label: `${classEmoji[className]} ${
          classData.name
        } - ${classData.description.substring(0, 50)}...`,
        value: className,
      });
    });
  }

  components.push(createBackButton());

  const choice = await getShowChoiceDialog(message, components);
  const choiceValue = getDialogValue(choice, "value");

  if (choiceValue === "back") {
    // Go back to name selection (reset name selection)
    return "back";
  }

  if (choiceValue && choiceValue !== "back") {
    return choiceValue;
  }

  // If no valid class was selected, go back to name selection
  return "back";
}
