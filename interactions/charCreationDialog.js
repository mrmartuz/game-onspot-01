// Character Generation Dialog Interface
// Provides interactive character creation with point allocation and class selection

import { getShowChoiceDialog, getDialogValue } from "../interactions.js";
import characterGeneration, {
  statGeneration,
  proceduralGeneration,
  raceDatabase,
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
  // Step 1: Name and Surname
  const nameResult = await handleNameSelection();
  if (nameResult === "back") return "back";

  // Step 2: Race Selection
  const raceResult = await handleRaceSelection();
  if (raceResult === "back") return "back";

  // Step 3: Class Selection (only common classes)
  const classResult = await handleClassSelection();
  if (classResult === "back") return "back";

  // Step 4: Stats Allocation
  const statsResult = await handleStatsAllocation();
  if (statsResult === "back") return "back";

  // Step 5: Create character and show preview
  const character = characterGeneration.generateCharacter({
    firstName: nameResult.firstName,
    lastName: nameResult.lastName,
    raceName: raceResult,
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

async function handleNameSelection() {
  const message = "📝 NAME SELECTION";
  let components = [];

  components.push({
    type: "message",
    label: "Enter your character's name:",
    value: "",
  });

  components.push({
    type: "input",
    label: "First Name",
    value: "firstName",
  });

  components.push({
    type: "input",
    label: "Last Name",
    value: "lastName",
  });

  components.push({
    type: "button",
    label: "🎲 Random Names",
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
  const firstName = getDialogValue(choice, "firstName");
  const lastName = getDialogValue(choice, "lastName");

  if (choiceValue === "random") {
    return {
      firstName: characterGeneration.generateRandomName("first"),
      lastName: characterGeneration.generateRandomName("last"),
    };
  } else if (choiceValue === "continue") {
    return {
      firstName: firstName || characterGeneration.generateRandomName("first"),
      lastName: lastName || characterGeneration.generateRandomName("last"),
    };
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
  const message = "👤 CHARACTER PREVIEW";
  let components = [];

  // Character basic info
  components.push({
    type: "message",
    label: `Name: ${character.firstName} ${character.lastName}`,
    value: "",
  });

  components.push({
    type: "message",
    label: `Race: ${raceDatabase[character.race].name} (${
      raceDatabase[character.race].region
    })`,
    value: "",
  });

  components.push({
    type: "message",
    label: `Class: ${classDatabase[character.class].name} (${
      classDatabase[character.class].rarity
    })`,
    value: "",
  });

  components.push({
    type: "message",
    label: `Level: ${character.level}`,
    value: "",
  });

  // Stats display
  components.push({
    type: "message",
    label: "📊 Stats:",
    value: "",
  });

  Object.entries(character.stats).forEach(([stat, value]) => {
    components.push({
      type: "message",
      label: `  ${stat}: ${value}`,
      value: "",
    });
  });

  // Skills display
  if (Object.keys(character.skills).length > 0) {
    components.push({
      type: "message",
      label: "🎯 Starting Skills:",
      value: "",
    });

    Object.entries(character.skills).forEach(([skill, level]) => {
      components.push({
        type: "message",
        label: `  ${skill}: ${level}`,
        value: "",
      });
    });
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
        label: `  ${slot}: ${item}`,
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
