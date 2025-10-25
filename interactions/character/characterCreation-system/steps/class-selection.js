// Class selection step
import {
  getShowChoiceDialog,
  getDialogValue,
} from "../../../../interactions.js";
import characterGeneration from "../../generation.js";
import { classDatabase } from "../../../../interactions/combat/classes.js";
import { createMessage, createBackButton } from "../utils/utils-navigation.js";

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
    createMessage("Choose a character class (Common classes only):")
  );

  // Only show common classes
  const commonClasses = await characterGeneration.getClassesByRarity("common");

  if (commonClasses.length > 0) {
    commonClasses.forEach((className) => {
      const classData = classDatabase[className];
      components.push({
        type: "button",
        label: `${classData.name} - ${classData.description.substring(
          0,
          50
        )}...`,
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
