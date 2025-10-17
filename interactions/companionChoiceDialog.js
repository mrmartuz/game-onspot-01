// Companion Choice Dialog Interface
// Provides choice between starting alone (+50 gold) or selecting from 4 random companions

import { getShowChoiceDialog, getDialogValue } from "../interactions.js";
import characterGeneration, { raceDatabase } from "./characterGeneration.js";
import { classDatabase } from "./combat/classes.js";
import { gameState } from "../gamestate/game_variables.js";
import { generateCharacterDescription } from "./recruitmentSystem.js";

export async function showCompanionChoiceDialog(playerCharacter) {
  const message = "👥 COMPANION CHOICE";
  let components = [];

  components.push({
    type: "message",
    label:
      "Now that you have created your character, you must decide how to begin your journey:",
    value: "",
  });

  components.push({
    type: "message",
    label:
      "You can start alone and receive 50 gold to help fund your expedition, or choose from 4 random companions of your race and common classes.",
    value: "",
  });

  components.push({
    type: "button",
    label: "💰 Start Alone (+50 Gold)",
    value: "alone",
  });

  components.push({
    type: "button",
    label: "👥 Choose Companion",
    value: "companion",
  });

  const choice = await getShowChoiceDialog(message, components);
  const choiceValue = getDialogValue(choice, "value");

  if (choiceValue === "alone") {
    // Add 50 gold bonus
    gameState.gold += 50;
    return { action: "alone", goldBonus: 50 };
  } else if (choiceValue === "companion") {
    return await showCompanionSelectionDialog(playerCharacter);
  }

  return "back";
}

async function showCompanionSelectionDialog(playerCharacter) {
  const message = "👥 COMPANION SELECTION";
  let components = [];

  components.push({
    type: "message",
    label: `Choose a companion for your ${playerCharacter.race} character:`,
    value: "",
  });

  // Generate 4 random companions of the same race and common classes
  const companions = generateRandomCompanions(playerCharacter.race, 4);

  companions.forEach((companion, index) => {
    const classData = classDatabase[companion.class];

    // Use narrative description like recruitment system
    const description = generateCharacterDescription(companion);

    components.push({
      type: "message",
      label: `${companion.firstName} ${companion.lastName} (${companion.gender} ${companion.race} ${classData.name} Lv.${companion.level})`,
      value: `char_${index}`,
    });

    components.push({
      type: "message",
      label: description,
      value: `desc_${index}`,
    });

    components.push({
      type: "button",
      label: `✅ Select ${companion.firstName}`,
      value: `select_${index}`,
    });

    components.push({
      type: "message",
      label: "---",
      value: `separator_${index}`,
    });
  });

  components.push({
    type: "button",
    label: "❌ Back",
    value: "back",
  });

  const choice = await getShowChoiceDialog(message, components);
  const choiceValue = getDialogValue(choice, "value");

  if (choiceValue && choiceValue.startsWith("select_")) {
    const companionIndex = parseInt(choiceValue.replace("select_", ""));
    const selectedCompanion = companions[companionIndex];

    // Add companion to group
    gameState.group.push(selectedCompanion);

    return {
      action: "companion_selected",
      companion: selectedCompanion,
    };
  }

  return "back";
}

function generateRandomCompanions(race, count) {
  const companions = [];
  const commonClasses = characterGeneration.getClassesByRarity("common");

  for (let i = 0; i < count; i++) {
    // Generate random gender
    const genders = ["male", "female"];
    const gender = genders[Math.floor(Math.random() * genders.length)];

    // Select random common class
    const className =
      commonClasses[Math.floor(Math.random() * commonClasses.length)];

    // Generate character with specific race and class
    const companion = characterGeneration.generateCharacter({
      raceName: race,
      gender: gender,
      className: className,
      isPlayer: false, // This is an NPC companion
    });

    companions.push(companion);
  }

  return companions;
}

export default showCompanionChoiceDialog;
