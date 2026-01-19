// Name selection step
import {
  getShowChoiceDialog,
  getDialogValue,
} from "../../../../interactions.js";
import characterGeneration from "../../generation.js";
import { nameDatabase } from "../../names.js";
import { raceEmoji, sexEmoji } from "../../../../gamestate/emoji-database.js";
import {
  createMessage,
  createBackButton,
  createRandomButton,
  createCustomInput,
  createMoreButton,
} from "../utils/utils-navigation.js";
import { createNameGrid } from "../utils/utils-ui.js";
import { MAX_NAMES_DISPLAYED } from "../constants.js";
import { raceDatabase } from "../../../../interactions/character/races.js";

/**
 * Handle name selection for custom character creation
 * @param {string} race - Selected race
 * @param {string} sex - Selected sex
 * @returns {Promise<Object|string>} Name result or navigation result
 */
export async function handleNameSelection(race = "Human", sex = "male") {
  const message = "📝 NAME SELECTION";
  let components = [];

  // Initialize name variables
  let firstName = "";
  let lastName = "";

  components.push(
    createMessage(
      `You are a ${sex} ${sexEmoji[sex]} ${raceDatabase[race].region} ${raceEmoji[race]}\n
      Choose names for your  character:`
    )
  );

  // First Name Selection
  components.push(createMessage("First Name:"));

  // Get race-sex specific first names
  const raceData = nameDatabase[race];
  if (raceData && raceData[sex] && raceData[sex].firstNames) {
    const firstNames = raceData[sex].firstNames;
    const nameGrid = createNameGrid(firstNames, "first");
    components.push(nameGrid);

    if (raceData[sex].firstNames.length > MAX_NAMES_DISPLAYED) {
      components.push(
        createMoreButton(
          `... and ${
            raceData[sex].firstNames.length - MAX_NAMES_DISPLAYED
          } more`,
          "more_first"
        )
      );
    }
  }

  components.push(createCustomInput("Custom First Name", "custom_first"));

  // Last Name Selection
  components.push(createMessage("Last Name:"));

  // Get race-specific last names
  if (raceData && raceData[sex] && raceData[sex].lastNames) {
    const lastNames = raceData[sex].lastNames;
    const nameGrid = createNameGrid(lastNames, "last");
    components.push(nameGrid);

    if (raceData[sex].lastNames.length > MAX_NAMES_DISPLAYED) {
      components.push(
        createMoreButton(
          `... and ${
            raceData[sex].lastNames.length - MAX_NAMES_DISPLAYED
          } more`,
          "more_last"
        )
      );
    }
  }

  components.push(createRandomButton("🎲 Random Last Name"));

  // Only show continue button if both names are selected
  if (firstName && lastName) {
    components.push({
      type: "button",
      label: "✅ Continue",
      value: "continue",
    });
  }

  components.push(createBackButton());

  const choice = await getShowChoiceDialog(message, components);
  const choiceValue = getDialogValue(choice, "value");
  const customFirst = getDialogValue(choice, "custom_first");

  if (choiceValue === "random_last") {
    lastName = characterGeneration.generateRandomName("last", race);
  } else if (choiceValue && choiceValue.startsWith("first_")) {
    firstName = choiceValue.replace("first_", "");
  } else if (choiceValue && choiceValue.startsWith("last_")) {
    lastName = choiceValue.replace("last_", "");
  } else if (choiceValue === "more_first") {
    return await handleMoreFirstNames(race, sex);
  } else if (choiceValue === "more_last") {
    return await handleMoreLastNames(race, sex);
  } else if (choiceValue === "continue") {
    firstName =
      customFirst || characterGeneration.generateRandomName("first", race, sex);
    lastName = characterGeneration.generateRandomName("last", race);
  }

  // Handle back button - go back to sex selection (reset sex selection)
  if (choiceValue === "back") {
    return "back";
  }

  // If we have a partial selection, continue with name selection
  if (firstName || lastName) {
    return await handleNameSelectionContinuation(
      race,
      sex,
      firstName,
      lastName
    );
  }

  // If no selection was made, go back to sex selection (reset sex selection)
  return "back";
}

/**
 * Handle more first names selection
 * @param {string} race - Selected race
 * @param {string} sex - Selected sex
 * @returns {Promise<Object|string>} Name result or navigation result
 */
export async function handleMoreFirstNames(race, sex) {
  const message = "📝 FIRST NAME SELECTION";
  let components = [];

  components.push(
    createMessage(`You are a ${lastName} a ${sex} ${sexEmoji[sex]} ${raceDatabase[race].region} ${raceEmoji[race]}\n
      Choose between the complete list of first names for ${race}:`)
  );

  const raceData = nameDatabase[race];
  if (raceData && raceData[sex] && raceData[sex].firstNames) {
    const firstNames = raceData[sex].firstNames;

    firstNames.forEach((name) => {
      components.push({
        type: "button",
        label: name,
        value: `first_${name}`,
      });
    });
  }

  components.push(createBackButton());

  const choice = await getShowChoiceDialog(message, components);
  const choiceValue = getDialogValue(choice, "value");

  if (choiceValue && choiceValue.startsWith("first_")) {
    const firstName = choiceValue.replace("first_", "");
    return await handleNameSelectionContinuation(race, sex, firstName, "");
  }

  return "back";
}

/**
 * Handle more last names selection
 * @param {string} race - Selected race
 * @param {string} sex - Selected sex
 * @returns {Promise<Object|string>} Name result or navigation result
 */
export async function handleMoreLastNames(race, sex) {
  const message = "📝 LAST NAME SELECTION";
  let components = [];

  components.push(
    createMessage(`You are a ${firstName} a ${sex} ${sexEmoji[sex]} ${raceDatabase[race].region} ${raceEmoji[race]}\n
      Choose between the complete list of last names for ${race}:`)
  );

  const raceData = nameDatabase[race];
  if (raceData && raceData[sex] && raceData[sex].lastNames) {
    const lastNames = raceData[sex].lastNames;

    lastNames.forEach((name) => {
      components.push({
        type: "button",
        label: name,
        value: `last_${name}`,
      });
    });
  }

  components.push(createBackButton());

  const choice = await getShowChoiceDialog(message, components);
  const choiceValue = getDialogValue(choice, "value");

  if (choiceValue && choiceValue.startsWith("last_")) {
    const lastName = choiceValue.replace("last_", "");
    return await handleNameSelectionContinuation(race, sex, "", lastName);
  }

  return "back";
}

/**
 * Handle name selection continuation with partial data
 * @param {string} race - Selected race
 * @param {string} sex - Selected sex
 * @param {string} firstName - Current first name
 * @param {string} lastName - Current last name
 * @returns {Promise<Object|string>} Name result or navigation result
 */
export async function handleNameSelectionContinuation(
  race,
  sex,
  firstName,
  lastName
) {
  const message = "📝 NAME SELECTION";
  let components = [];

  components.push(
    createMessage(
      `You are ${firstName?firstName:""} ${lastName?lastName:""} a ${sex} ${sexEmoji[sex]} ${raceDatabase[race].region} ${raceEmoji[race]}\n
    ${firstName&&lastName?"\n":"Complete your character's name:"}`
    )
  );
  
  // If we don't have both names, show selection options
  if (!firstName) {
    components.push(createMessage("Choose First Name:"));

    const raceData = nameDatabase[race];
    if (raceData && raceData[sex] && raceData[sex].firstNames) {
      const firstNames = raceData[sex].firstNames;
      const nameGrid = createNameGrid(firstNames, "first");
      components.push(nameGrid);
    }

    components.push(createCustomInput("Custom First Name", "custom_first"));
  }

  if (!lastName) {
    components.push(createMessage("Choose Last Name:"));

    const raceData = nameDatabase[race];
    if (raceData && raceData[sex] && raceData[sex].lastNames) {
      const lastNames = raceData[sex].lastNames;
      const nameGrid = createNameGrid(lastNames, "last");
      components.push(nameGrid);
    }

    components.push(createRandomButton("🎲 Random Last Name"));
  }

  // If we have both names, show continue option
  if (firstName && lastName) {
    components.push({
      type: "button",
      label: "✅ Continue",
      value: "continue",
    });
  }

  components.push(createBackButton());

  const choice = await getShowChoiceDialog(message, components);
  const choiceValue = getDialogValue(choice, "value");
  const customFirst = getDialogValue(choice, "custom_first");

  if (choiceValue === "continue") {
    return {
      firstName: firstName,
      lastName: lastName,
    };
  } else if (choiceValue === "back") {
    // Go back to sex selection (reset sex selection)
    return "back";
  } else if (choiceValue === "random_last") {
    return await handleNameSelectionContinuation(
      race,
      sex,
      firstName,
      characterGeneration.generateRandomName("last", race)
    );
  } else if (choiceValue && choiceValue.startsWith("first_")) {
    const newFirstName = choiceValue.replace("first_", "");
    return await handleNameSelectionContinuation(
      race,
      sex,
      newFirstName,
      lastName
    );
  } else if (choiceValue && choiceValue.startsWith("last_")) {
    const newLastName = choiceValue.replace("last_", "");
    return await handleNameSelectionContinuation(
      race,
      sex,
      firstName,
      newLastName
    );
  } else if (customFirst) {
    return await handleNameSelectionContinuation(
      race,
      sex,
      customFirst,
      lastName
    );
  }

  // If no valid selection was made, go back to sex selection (reset sex selection)
  return "back";
}
