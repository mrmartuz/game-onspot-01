// Character Generation Dialog Interface
// Provides interactive character creation with point allocation and class selection

import { getShowChoiceDialog, getDialogValue } from "../interactions.js";
import characterGeneration, {
  statGeneration,
  proceduralGeneration,
  raceDatabase,
  nameDatabase,
} from "./characterGeneration.js";
import { classDatabase } from "./combat/classes.js";

export async function showCharacterGenerationDialog() {
  const message = "🎭 CHARACTER GENERATION";
  let components = [];

  // Character creation options
  components.push({
    type: "message",
    label: "Choose your character creation method:",
    value: "",
  });

  components.push({
    type: "button",
    label: "🎲 Random Generation",
    value: "random",
  });

  components.push({
    type: "button",
    label: "🎯 Custom Creation",
    value: "custom",
  });

  components.push({
    type: "button",
    label: "❌ Back",
    value: "back",
  });

  const choice = await getShowChoiceDialog(message, components);

  const choiceValue = getDialogValue(choice, "value");

  switch (choiceValue) {
    case "random":
      return await handleRandomGeneration();
    case "custom":
      return await handleCustomCreation();
    case "back":
      return "back";
    default:
      return "back";
  }
}

async function handleRandomGeneration() {
  const message = "🎲 RANDOM CHARACTER GENERATION";
  let components = [];

  components.push({
    type: "message",
    label:
      "Generate a random character with random stats, class, and equipment?",
    value: "",
  });

  components.push({
    type: "button",
    label: "🎲 Generate Random Character",
    value: "generate",
  });

  components.push({
    type: "button",
    label: "❌ Back",
    value: "back",
  });

  const choice = await getShowChoiceDialog(message, components);
  const choiceValue = getDialogValue(choice, "value");

  if (choiceValue === "generate") {
    const character = characterGeneration.generateCharacter({
      usePointAllocation: false,
    });
    const result = await showCharacterPreview(character, "random");

    // Check if character was accepted
    if (result && result.action === "accept") {
      return result; // Return the accepted character
    }

    return result; // Return other results (back, regenerate, etc.)
  }

  return "back";
}

async function handleCustomCreation() {
  // Step 1: Race Selection
  const raceResult = await handleRaceSelection();
  if (raceResult === "back") return "back";

  // Step 2: Gender Selection
  const genderResult = await handleGenderSelection();
  if (genderResult === "back") return "back";

  // Step 3: Name and Surname
  const nameResult = await handleNameSelection(raceResult, genderResult);
  if (nameResult === "back") return "back";

  // Step 4: Class Selection (only common classes)
  const classResult = await handleClassSelection();
  if (classResult === "back") return "back";

  // Step 5: Stats Allocation
  const statsResult = await handleStatsAllocation();
  if (statsResult === "back") return "back";

  // Step 6: Create character and show preview
  const character = characterGeneration.generateCharacter({
    firstName: nameResult.firstName,
    lastName: nameResult.lastName,
    raceName: raceResult,
    gender: genderResult,
    className: classResult,
    customStats: statsResult,
    isPlayer: true,
  });

  const result = await showCharacterPreview(character, "custom");

  // Check if character was accepted
  if (result && result.action === "accept") {
    return result; // Return the accepted character
  }

  return result; // Return other results (back, regenerate, etc.)
}

async function handleGenderSelection() {
  const message = "⚧ GENDER SELECTION";
  let components = [];

  components.push({
    type: "message",
    label: "Choose your character's gender:",
    value: "",
  });

  components.push({
    type: "button",
    label: "♂️ Male",
    value: "male",
  });

  components.push({
    type: "button",
    label: "♀️ Female",
    value: "female",
  });

  components.push({
    type: "button",
    label: "❌ Back",
    value: "back",
  });

  const choice = await getShowChoiceDialog(message, components);
  const choiceValue = getDialogValue(choice, "value");

  if (choiceValue && choiceValue !== "back") {
    return choiceValue;
  }

  return "back";
}

async function handleNameSelection(race = "Human", gender = "male") {
  const message = "📝 NAME SELECTION";
  let components = [];

  components.push({
    type: "message",
    label: `Choose names for your ${gender} ${race} character:`,
    value: "",
  });

  // First Name Selection
  components.push({
    type: "message",
    label: "First Name:",
    value: "",
  });

  // Get race-gender specific first names
  const raceData = nameDatabase[race];
  if (raceData && raceData[gender] && raceData[gender].firstNames) {
    const firstNames = raceData[gender].firstNames;

    // Show first 10 names as buttons, with option to see more
    const displayFirstNames = firstNames.slice(0, 10);
    displayFirstNames.forEach((name) => {
      components.push({
        type: "button",
        label: name,
        value: `first_${name}`,
      });
    });

    if (firstNames.length > 10) {
      components.push({
        type: "button",
        label: `... and ${firstNames.length - 10} more`,
        value: "more_first",
      });
    }
  }

  components.push({
    type: "button",
    label: "🎲 Random First Name",
    value: "random_first",
  });

  components.push({
    type: "input",
    label: "Custom First Name",
    value: "custom_first",
  });

  // Last Name Selection
  components.push({
    type: "message",
    label: "Last Name:",
    value: "",
  });

  // Get race-specific last names
  if (raceData && raceData[gender] && raceData[gender].lastNames) {
    const lastNames = raceData[gender].lastNames;

    // Show first 10 names as buttons
    const displayLastNames = lastNames.slice(0, 10);
    displayLastNames.forEach((name) => {
      components.push({
        type: "button",
        label: name,
        value: `last_${name}`,
      });
    });

    if (lastNames.length > 10) {
      components.push({
        type: "button",
        label: `... and ${lastNames.length - 10} more`,
        value: "more_last",
      });
    }
  }

  components.push({
    type: "button",
    label: "🎲 Random Last Name",
    value: "random_last",
  });

  components.push({
    type: "input",
    label: "Custom Last Name",
    value: "custom_last",
  });

  components.push({
    type: "button",
    label: "🎲 Random Full Name",
    value: "random_full",
  });

  components.push({
    type: "button",
    label: "✅ Continue",
    value: "continue",
  });

  components.push({
    type: "button",
    label: "❌ Back",
    value: "back",
  });

  const choice = await getShowChoiceDialog(message, components);
  const choiceValue = getDialogValue(choice, "value");
  const customFirst = getDialogValue(choice, "custom_first");
  const customLast = getDialogValue(choice, "custom_last");

  let firstName = "";
  let lastName = "";

  if (choiceValue === "random_full") {
    return {
      firstName: characterGeneration.generateRandomName("first", race, gender),
      lastName: characterGeneration.generateRandomName("last", race),
    };
  } else if (choiceValue === "random_first") {
    firstName = characterGeneration.generateRandomName("first", race, gender);
  } else if (choiceValue === "random_last") {
    lastName = characterGeneration.generateRandomName("last", race);
  } else if (choiceValue && choiceValue.startsWith("first_")) {
    firstName = choiceValue.replace("first_", "");
  } else if (choiceValue && choiceValue.startsWith("last_")) {
    lastName = choiceValue.replace("last_", "");
  } else if (choiceValue === "more_first") {
    return await handleMoreFirstNames(race, gender);
  } else if (choiceValue === "more_last") {
    return await handleMoreLastNames(race, gender);
  } else if (choiceValue === "continue") {
    firstName =
      customFirst ||
      characterGeneration.generateRandomName("first", race, gender);
    lastName =
      customLast || characterGeneration.generateRandomName("last", race);
  }

  // If we have a partial selection, continue with name selection
  if (firstName || lastName) {
    return await handleNameSelectionContinuation(
      race,
      gender,
      firstName,
      lastName
    );
  }

  return "back";
}

async function handleMoreFirstNames(race, gender) {
  const message = "📝 FIRST NAME SELECTION";
  let components = [];

  components.push({
    type: "message",
    label: `All first names for ${gender} ${race}:`,
    value: "",
  });

  const raceData = nameDatabase[race];
  if (raceData && raceData[gender] && raceData[gender].firstNames) {
    const firstNames = raceData[gender].firstNames;

    firstNames.forEach((name) => {
      components.push({
        type: "button",
        label: name,
        value: `first_${name}`,
      });
    });
  }

  components.push({
    type: "button",
    label: "❌ Back",
    value: "back",
  });

  const choice = await getShowChoiceDialog(message, components);
  const choiceValue = getDialogValue(choice, "value");

  if (choiceValue && choiceValue.startsWith("first_")) {
    const firstName = choiceValue.replace("first_", "");
    return await handleNameSelectionContinuation(race, gender, firstName, "");
  }

  return "back";
}

async function handleMoreLastNames(race, gender) {
  const message = "📝 LAST NAME SELECTION";
  let components = [];

  components.push({
    type: "message",
    label: `All last names for ${race}:`,
    value: "",
  });

  const raceData = nameDatabase[race];
  if (raceData && raceData[gender] && raceData[gender].lastNames) {
    const lastNames = raceData[gender].lastNames;

    lastNames.forEach((name) => {
      components.push({
        type: "button",
        label: name,
        value: `last_${name}`,
      });
    });
  }

  components.push({
    type: "button",
    label: "❌ Back",
    value: "back",
  });

  const choice = await getShowChoiceDialog(message, components);
  const choiceValue = getDialogValue(choice, "value");

  if (choiceValue && choiceValue.startsWith("last_")) {
    const lastName = choiceValue.replace("last_", "");
    return await handleNameSelectionContinuation(race, gender, "", lastName);
  }

  return "back";
}

async function handleNameSelectionContinuation(
  race,
  gender,
  firstName,
  lastName
) {
  const message = "📝 NAME SELECTION";
  let components = [];

  components.push({
    type: "message",
    label: `Complete your ${gender} ${race} character's name:`,
    value: "",
  });

  // Show current selection
  if (firstName) {
    components.push({
      type: "message",
      label: `First Name: ${firstName}`,
      value: "",
    });
  }

  if (lastName) {
    components.push({
      type: "message",
      label: `Last Name: ${lastName}`,
      value: "",
    });
  }

  // If we don't have both names, show selection options
  if (!firstName) {
    components.push({
      type: "message",
      label: "Choose First Name:",
      value: "",
    });

    const raceData = nameDatabase[race];
    if (raceData && raceData[gender] && raceData[gender].firstNames) {
      const firstNames = raceData[gender].firstNames.slice(0, 8);
      firstNames.forEach((name) => {
        components.push({
          type: "button",
          label: name,
          value: `first_${name}`,
        });
      });
    }

    components.push({
      type: "button",
      label: "🎲 Random First Name",
      value: "random_first",
    });

    components.push({
      type: "input",
      label: "Custom First Name",
      value: "custom_first",
    });
  }

  if (!lastName) {
    components.push({
      type: "message",
      label: "Choose Last Name:",
      value: "",
    });

    const raceData = nameDatabase[race];
    if (raceData && raceData[gender] && raceData[gender].lastNames) {
      const lastNames = raceData[gender].lastNames.slice(0, 8);
      lastNames.forEach((name) => {
        components.push({
          type: "button",
          label: name,
          value: `last_${name}`,
        });
      });
    }

    components.push({
      type: "button",
      label: "🎲 Random Last Name",
      value: "random_last",
    });

    components.push({
      type: "input",
      label: "Custom Last Name",
      value: "custom_last",
    });
  }

  // If we have both names, show continue option
  if (firstName && lastName) {
    components.push({
      type: "button",
      label: "✅ Continue",
      value: "continue",
    });
  }

  components.push({
    type: "button",
    label: "❌ Back",
    value: "back",
  });

  const choice = await getShowChoiceDialog(message, components);
  const choiceValue = getDialogValue(choice, "value");
  const customFirst = getDialogValue(choice, "custom_first");
  const customLast = getDialogValue(choice, "custom_last");

  if (choiceValue === "continue") {
    return {
      firstName: firstName,
      lastName: lastName,
    };
  } else if (choiceValue === "random_first") {
    return await handleNameSelectionContinuation(
      race,
      gender,
      characterGeneration.generateRandomName("first", race, gender),
      lastName
    );
  } else if (choiceValue === "random_last") {
    return await handleNameSelectionContinuation(
      race,
      gender,
      firstName,
      characterGeneration.generateRandomName("last", race)
    );
  } else if (choiceValue && choiceValue.startsWith("first_")) {
    const newFirstName = choiceValue.replace("first_", "");
    return await handleNameSelectionContinuation(
      race,
      gender,
      newFirstName,
      lastName
    );
  } else if (choiceValue && choiceValue.startsWith("last_")) {
    const newLastName = choiceValue.replace("last_", "");
    return await handleNameSelectionContinuation(
      race,
      gender,
      firstName,
      newLastName
    );
  } else if (customFirst) {
    return await handleNameSelectionContinuation(
      race,
      gender,
      customFirst,
      lastName
    );
  } else if (customLast) {
    return await handleNameSelectionContinuation(
      race,
      gender,
      firstName,
      customLast
    );
  }

  return "back";
}

async function handleClassSelection() {
  const message = "🏛️ CLASS SELECTION";
  let components = [];

  components.push({
    type: "message",
    label: "Choose a character class (Common classes only):",
    value: "",
  });

  // Only show common classes
  const commonClasses = characterGeneration.getClassesByRarity("common");

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

  components.push({
    type: "button",
    label: "❌ Back",
    value: "back",
  });

  const choice = await getShowChoiceDialog(message, components);
  const choiceValue = getDialogValue(choice, "value");

  if (choiceValue && choiceValue !== "back") {
    return choiceValue;
  }

  return "back";
}

async function handleRaceSelection() {
  const message = "🧬 RACE SELECTION";
  let components = [];

  components.push({
    type: "message",
    label: "Choose your character's race (Basic races only):",
    value: "",
  });

  // Only show basic races (Human, Elf, Dwarf, Orc)
  const basicRaces = ["Human", "Elf", "Dwarf", "Orc"];

  basicRaces.forEach((raceName) => {
    const raceData = raceDatabase[raceName];
    components.push({
      type: "button",
      label: `${raceData.name} (${raceData.region}) - ${raceData.description}`,
      value: raceName,
    });
  });

  components.push({
    type: "button",
    label: "❌ Back",
    value: "back",
  });

  const choice = await getShowChoiceDialog(message, components);
  const choiceValue = getDialogValue(choice, "value");

  if (choiceValue && choiceValue !== "back") {
    return choiceValue;
  }

  return "back";
}

async function handleStatsAllocation() {
  return await handleStatsAllocationWithState(
    { ...statGeneration.baseStats },
    10
  );
}

async function handleStatsAllocationWithState(currentStats, remainingPoints) {
  const message = "⚖️ STATS ALLOCATION";
  let components = [];

  components.push({
    type: "message",
    label: `You have ${remainingPoints} points to allocate. Each point over 10 costs 2 points. Minimum stat value is 8.`,
    value: "",
  });

  // Show current stats in compact format
  components.push({
    type: "message",
    label: "Physical Stats:",
    value: "",
  });

  // Physical stats (STR, DEX, CON) on one line
  const physicalStats = ["STR", "DEX", "CON"];
  const physicalStatsLine = physicalStats
    .map((stat) => `${stat}: ${currentStats[stat]}`)
    .join(" | ");
  components.push({
    type: "message",
    label: `  ${physicalStatsLine}`,
    value: "",
  });

  // Physical stats buttons in grid
  const physicalButtons = [];
  physicalStats.forEach((stat) => {
    const canIncrease =
      remainingPoints >=
      getStatCost(currentStats[stat], currentStats[stat] + 1);
    const canDecrease = currentStats[stat] > 8;

    physicalButtons.push({
      label: `+ ${stat} (${getStatCost(
        currentStats[stat],
        currentStats[stat] + 1
      )})`,
      value: `increase_${stat}`,
      disabled: !canIncrease,
      gridColumn: 1,
    });

    physicalButtons.push({
      label: `- ${stat} (${Math.abs(
        getStatCost(currentStats[stat], currentStats[stat] - 1)
      )})`,
      value: `decrease_${stat}`,
      disabled: !canDecrease,
      gridColumn: 1,
    });
  });

  components.push({
    type: "button_grid",
    buttons: physicalButtons,
  });

  components.push({
    type: "message",
    label: "Mental Stats:",
    value: "",
  });

  // Mental stats (INT, WIS, CHA) on one line
  const mentalStats = ["INT", "WIS", "CHA"];
  const mentalStatsLine = mentalStats
    .map((stat) => `${stat}: ${currentStats[stat]}`)
    .join(" | ");
  components.push({
    type: "message",
    label: `  ${mentalStatsLine}`,
    value: "",
  });

  // Mental stats buttons in grid
  const mentalButtons = [];
  mentalStats.forEach((stat) => {
    const canIncrease =
      remainingPoints >=
      getStatCost(currentStats[stat], currentStats[stat] + 1);
    const canDecrease = currentStats[stat] > 8;

    mentalButtons.push({
      label: `+ ${stat} (${getStatCost(
        currentStats[stat],
        currentStats[stat] + 1
      )})`,
      value: `increase_${stat}`,
      disabled: !canIncrease,
      gridColumn: 1,
    });

    mentalButtons.push({
      label: `- ${stat} (${Math.abs(
        getStatCost(currentStats[stat], currentStats[stat] - 1)
      )})`,
      value: `decrease_${stat}`,
      disabled: !canDecrease,
      gridColumn: 1,
    });
  });

  components.push({
    type: "button_grid",
    buttons: mentalButtons,
  });

  components.push({
    type: "message",
    label: `Remaining Points: ${remainingPoints}`,
    value: "",
  });

  components.push({
    type: "button",
    label: "🎲 Random Allocation",
    value: "random",
  });

  components.push({
    type: "button",
    label: "✅ Continue",
    value: "continue",
  });

  components.push({
    type: "button",
    label: "❌ Back",
    value: "back",
  });

  const choice = await getShowChoiceDialog(message, components);
  const choiceValue = getDialogValue(choice, "value");

  if (choiceValue === "random") {
    // Generate random stats using the point allocation system
    return proceduralGeneration.generateRandomStats();
  } else if (choiceValue === "continue") {
    return currentStats;
  } else if (choiceValue && choiceValue.startsWith("increase_")) {
    const stat = choiceValue.replace("increase_", "");
    const cost = getStatCost(currentStats[stat], currentStats[stat] + 1);
    if (remainingPoints >= cost) {
      const newStats = { ...currentStats };
      newStats[stat]++;
      const newRemainingPoints = remainingPoints - cost;
      return await handleStatsAllocationWithState(newStats, newRemainingPoints);
    }
  } else if (choiceValue && choiceValue.startsWith("decrease_")) {
    const stat = choiceValue.replace("decrease_", "");
    if (currentStats[stat] > 8) {
      const gain = Math.abs(
        getStatCost(currentStats[stat], currentStats[stat] - 1)
      );
      const newStats = { ...currentStats };
      newStats[stat]--;
      const newRemainingPoints = remainingPoints + gain;
      return await handleStatsAllocationWithState(newStats, newRemainingPoints);
    }
  }

  return "back";
}

// Helper function to calculate stat cost
function getStatCost(currentValue, desiredValue) {
  if (desiredValue <= 10) {
    return desiredValue - currentValue; // 1 point per stat point up to 10
  } else {
    // Points over 10 cost 2 each
    if (currentValue <= 10) {
      return 10 - currentValue + (desiredValue - 10) * 2;
    } else {
      return (desiredValue - currentValue) * 2;
    }
  }
}

async function showCharacterPreview(character, generationMethod) {
  const message = `👤 ${character.firstName.toUpperCase()} ${character.lastName.toUpperCase()}`;
  let components = [];

  // Character basic info - First line: gender, race name (explanation race)
  const raceData = raceDatabase[character.race];
  components.push({
    type: "message",
    label: `${character.gender} ${
      raceData.region
    } (${raceData.name.toLowerCase()})`,
    value: "",
  });

  // Second line: Class name and level
  const classData = classDatabase[character.class];
  components.push({
    type: "message",
    label: `${classData.name} lvl.${character.level}`,
    value: "",
  });

  // Third line: Stats header
  components.push({
    type: "message",
    label: "📊 Stats:",
    value: "",
  });

  // Fourth line: Physical stats (STR, DEX, CON)
  const physicalStats = ["STR", "DEX", "CON"];
  const physicalLine = physicalStats
    .map((stat) => `${stat}:${character.stats[stat]}`)
    .join(" | ");
  components.push({
    type: "message",
    label: physicalLine,
    value: "",
  });

  // Fifth line: Mental stats (INT, WIS, CHA, LUCK)
  const mentalStats = ["INT", "WIS", "CHA", "LUCK"];
  const mentalLine = mentalStats
    .map((stat) => `${stat}:${character.stats[stat]}`)
    .join(" | ");
  components.push({
    type: "message",
    label: mentalLine,
    value: "",
  });

  // Skills display
  if (Object.keys(character.skills).length > 0) {
    components.push({
      type: "message",
      label: "🎯 Starting Skills:",
      value: "",
    });

    // Group skills into lines of 2 skills each
    const skillEntries = Object.entries(character.skills);
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

  // Equipment display
  components.push({
    type: "message",
    label: "⚔️ Starting Equipment:",
    value: "",
  });

  Object.entries(character.equipment).forEach(([slot, item]) => {
    if (item) {
      components.push({
        type: "message",
        label: `${slot}: ${item}`,
        value: "",
      });
    }
  });

  // Health display
  components.push({
    type: "message",
    label: `❤️ Health: ${character.health.current}/${character.health.max}`,
    value: "",
  });

  // Action buttons
  components.push({
    type: "button",
    label: "✅ Accept Character",
    value: "accept",
  });

  components.push({
    type: "button",
    label: "🔄 Regenerate",
    value: "regenerate",
  });

  components.push({
    type: "button",
    label: "❌ Back",
    value: "back",
  });

  const choice = await getShowChoiceDialog(message, components);
  const choiceValue = getDialogValue(choice, "value");

  if (choiceValue === "accept") {
    return { action: "accept", character };
  } else if (choiceValue === "regenerate") {
    // Regenerate based on the original method
    switch (generationMethod) {
      case "random":
        return await handleRandomGeneration();
      case "custom":
        return await handleCustomCreation();
      default:
        return "back";
    }
  }

  return "back";
}

// Helper function to add character to group
export function addCharacterToGroup(character) {
  // This will be integrated with the game state in Phase 2
  console.log("Adding character to group:", character);
  return character;
}

// Export main dialog function
export default showCharacterGenerationDialog;
