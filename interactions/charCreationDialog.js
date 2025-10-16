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
    label: "⚖️ Point Allocation",
    value: "point_allocation",
  });

  components.push({
    type: "button",
    label: "🏛️ Class Selection",
    value: "class_selection",
  });

  components.push({
    type: "button",
    label: "🧬 Race Selection",
    value: "race_selection",
  });

  components.push({
    type: "button",
    label: "🎯 Full Custom Creation",
    value: "full_custom",
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
    case "point_allocation":
      return await handlePointAllocation();
    case "class_selection":
      return await handleClassSelection();
    case "race_selection":
      return await handleRaceSelection();
    case "full_custom":
      return await handleFullCustomCreation();
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

async function handlePointAllocation() {
  const message = "⚖️ POINT ALLOCATION";
  let components = [];

  components.push({
    type: "message",
    label: `You have ${statGeneration.pointAllocation.totalPoints} points to allocate across your stats.`,
    value: "",
  });

  components.push({
    type: "message",
    label: "Point costs escalate: 1st point = 1 cost, 2nd point = 2 cost, etc.",
    value: "",
  });

  // For now, we'll use a simplified interface
  // In a full implementation, this would be a more complex UI
  components.push({
    type: "button",
    label: "🎲 Auto-Allocate Points",
    value: "auto_allocate",
  });

  components.push({
    type: "button",
    label: "❌ Back",
    value: "back",
  });

  const choice = await getShowChoiceDialog(message, components);

  if (choice === "auto_allocate") {
    // Generate random stats using point allocation system
    const character = characterGeneration.generateCharacter({
      usePointAllocation: true,
    });
    const result = await showCharacterPreview(character, "point_allocation");

    // Check if character was accepted
    if (result && result.action === "accept") {
      return result; // Return the accepted character
    }

    return result; // Return other results (back, regenerate, etc.)
  }

  return "back";
}

async function handleClassSelection() {
  const message = "🏛️ CLASS SELECTION";
  let components = [];

  components.push({
    type: "message",
    label: "Choose a character class:",
    value: "",
  });

  // Group classes by rarity
  const commonClasses = characterGeneration.getClassesByRarity("common");
  const uncommonClasses = characterGeneration.getClassesByRarity("uncommon");
  const rareClasses = characterGeneration.getClassesByRarity("rare");
  const legendaryClasses = characterGeneration.getClassesByRarity("legendary");

  // Add common classes
  if (commonClasses.length > 0) {
    components.push({
      type: "message",
      label: "📜 Common Classes:",
      value: "",
    });

    commonClasses.forEach((className) => {
      const classData = classDatabase[className];
      components.push({
        type: "button",
        label: `${classData.name} - ${classData.description.substring(
          0,
          50
        )}...`,
        value: `class_${className}`,
      });
    });
  }

  // Add uncommon classes
  if (uncommonClasses.length > 0) {
    components.push({
      type: "message",
      label: "⭐ Uncommon Classes:",
      value: "",
    });

    uncommonClasses.forEach((className) => {
      const classData = classDatabase[className];
      components.push({
        type: "button",
        label: `${classData.name} - ${classData.description.substring(
          0,
          50
        )}...`,
        value: `class_${className}`,
      });
    });
  }

  // Add rare classes
  if (rareClasses.length > 0) {
    components.push({
      type: "message",
      label: "💎 Rare Classes:",
      value: "",
    });

    rareClasses.forEach((className) => {
      const classData = classDatabase[className];
      components.push({
        type: "button",
        label: `${classData.name} - ${classData.description.substring(
          0,
          50
        )}...`,
        value: `class_${className}`,
      });
    });
  }

  // Add legendary classes
  if (legendaryClasses.length > 0) {
    components.push({
      type: "message",
      label: "👑 Legendary Classes:",
      value: "",
    });

    legendaryClasses.forEach((className) => {
      const classData = classDatabase[className];
      components.push({
        type: "button",
        label: `${classData.name} - ${classData.description.substring(
          0,
          50
        )}...`,
        value: `class_${className}`,
      });
    });
  }

  components.push({
    type: "button",
    label: "❌ Back",
    value: "back",
  });

  const choice = await getShowChoiceDialog(message, components);

  if (choice && choice.startsWith("class_")) {
    const className = choice.replace("class_", "");
    const character = characterGeneration.generateCharacter({ className });
    const result = await showCharacterPreview(character, "class_selection");

    // Check if character was accepted
    if (result && result.action === "accept") {
      return result; // Return the accepted character
    }

    return result; // Return other results (back, regenerate, etc.)
  }

  return "back";
}

async function handleRaceSelection() {
  const message = "🧬 RACE SELECTION";
  let components = [];

  components.push({
    type: "message",
    label: "Choose your character's race:",
    value: "",
  });

  // Create race options for select
  const raceOptions = Object.keys(raceDatabase).map((raceName) => ({
    value: raceName,
    label: `${raceDatabase[raceName].name} (${raceDatabase[raceName].region}) - ${raceDatabase[raceName].description}`,
  }));

  components.push({
    type: "select",
    label: "Select Race:",
    value: "race",
    options: raceOptions,
    defaultValue: "Human", // Set default selection
  });

  components.push({
    type: "button",
    label: "🎲 Generate Character with Selected Race",
    value: "generate",
  });

  components.push({
    type: "button",
    label: "❌ Back",
    value: "back",
  });

  const choice = await getShowChoiceDialog(message, components);
  const choiceValue = getDialogValue(choice, "value");
  const selectedRace = getDialogValue(choice, "race");

  // Debug logging
  console.log("Race selection dialog result:", choice);
  console.log("Choice value:", choiceValue);
  console.log("Selected race:", selectedRace);
  console.log("Race key exists in choice:", "race" in choice);
  console.log("Race value directly:", choice.race);

  if (choiceValue === "generate") {
    // Fallback to Human if no race is selected
    const raceToUse = selectedRace || "Human";
    console.log("Using race:", raceToUse);

    const character = characterGeneration.generateCharacter({
      raceName: raceToUse,
    });
    const result = await showCharacterPreview(character, "race_selection");

    // Check if character was accepted
    if (result && result.action === "accept") {
      return result; // Return the accepted character
    }

    return result; // Return other results (back, regenerate, etc.)
  }

  return "back";
}

async function handleFullCustomCreation() {
  const message = "🎯 FULL CUSTOM CHARACTER CREATION";
  let components = [];

  components.push({
    type: "message",
    label: "Create a fully customized character:",
    value: "",
  });

  // Race selection
  const raceOptions = Object.keys(raceDatabase).map((raceName) => ({
    value: raceName,
    label: `${raceDatabase[raceName].name} (${raceDatabase[raceName].region})`,
  }));

  components.push({
    type: "select",
    label: "Select Race:",
    value: "race",
    options: raceOptions,
    defaultValue: "Human", // Set default selection
  });

  // Class selection
  const classOptions = Object.keys(classDatabase).map((className) => ({
    value: className,
    label: `${classDatabase[className].name} (${classDatabase[className].rarity})`,
  }));

  components.push({
    type: "select",
    label: "Select Class:",
    value: "class",
    options: classOptions,
    defaultValue: "fighter", // Set default selection
  });

  // Name inputs
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
    label: "🎯 Create Custom Character",
    value: "create",
  });

  components.push({
    type: "button",
    label: "❌ Back",
    value: "back",
  });

  const choice = await getShowChoiceDialog(message, components);
  const choiceValue = getDialogValue(choice, "value");
  const selectedRace = getDialogValue(choice, "race");
  const selectedClass = getDialogValue(choice, "class");
  const firstName = getDialogValue(choice, "firstName");
  const lastName = getDialogValue(choice, "lastName");

  if (choiceValue === "create") {
    // Fallbacks for undefined values
    const raceToUse = selectedRace || "Human";
    const classToUse = selectedClass || "fighter";

    console.log(
      "Full custom creation - Race:",
      raceToUse,
      "Class:",
      classToUse
    );

    const character = characterGeneration.generateCharacter({
      raceName: raceToUse,
      className: classToUse,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      isPlayer: true,
    });
    const result = await showCharacterPreview(character, "full_custom");

    // Check if character was accepted
    if (result && result.action === "accept") {
      return result; // Return the accepted character
    }

    return result; // Return other results (back, regenerate, etc.)
  }

  return "back";
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
      case "point_allocation":
        return await handlePointAllocation();
      case "class_selection":
        return await handleClassSelection();
      case "race_selection":
        return await handleRaceSelection();
      case "full_custom":
        return await handleFullCustomCreation();
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
