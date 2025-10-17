// Recruitment Dialog Interface
// Handles the recruitment board and character selection interface

import { getShowChoiceDialog } from "../interactions.js";
import { recruitmentSystem } from "./recruitmentSystem.js";
import { gameState } from "../gamestate/game_variables.js";

// Show recruitment board dialog
export async function showRecruitmentDialog(
  locationType,
  x,
  y,
  characters = null
) {
  const message = `RECRUITMENT BOARD - ${locationType.toUpperCase()}`;
  const components = [];

  // Get characters using persistent storage system
  if (!characters) {
    characters = recruitmentSystem.getLocationCharacters(locationType, x, y);
  }

  // Add character previews
  characters.forEach((character, index) => {
    const isAvailable = recruitmentSystem.isCharacterAvailable(character);
    const canRecruit = recruitmentSystem.canPlayerRecruitCharacter(character);
    const cost = recruitmentSystem.calculateRecruitmentCost(character);

    if (isAvailable && canRecruit) {
      const description =
        recruitmentSystem.generateCharacterDescription(character);
      const costText =
        cost.items.length > 0
          ? `${cost.gold} gold + ${cost.items.join(", ")}`
          : `${cost.gold} gold`;

      components.push({
        type: "message",
        label: `${character.firstName} ${character.lastName} (${character.gender} ${character.race} ${character.class} Lv.${character.level})`,
        value: `char_${index}`,
      });

      components.push({
        type: "message",
        label: description,
        value: `desc_${index}`,
      });

      components.push({
        type: "message",
        label: `Cost: ${costText}`,
        value: `cost_${index}`,
      });

      components.push({
        type: "button",
        label: `Recruit ${character.firstName}`,
        value: `recruit_${index}`,
      });

      components.push({
        type: "message",
        label: "---",
        value: `separator_${index}`,
      });
    } else if (isAvailable && !canRecruit) {
      const errorMessage =
        recruitmentSystem.getRecruitmentErrorMessage(character);
      components.push({
        type: "message",
        label: `${character.firstName} ${character.lastName} - ${errorMessage}`,
        value: `unavailable_${index}`,
      });
    }
  });

  // Add back button
  components.push({
    type: "button",
    label: "❌ Back",
    value: "back",
  });

  const choice = await getShowChoiceDialog(message, components);

  // Handle recruitment choice
  if (choice.startsWith("recruit_")) {
    const charIndex = parseInt(choice.split("_")[1]);
    const character = characters[charIndex];

    if (
      character &&
      recruitmentSystem.isCharacterAvailable(character) &&
      recruitmentSystem.canPlayerRecruitCharacter(character)
    ) {
      return await handleRecruitmentConfirmation(character);
    }
  }

  // Handle refresh
  if (choice === "refresh") {
    return "refresh";
  }

  // Handle back
  if (choice === "back") {
    return "back";
  }

  return choice;
}

// Handle recruitment confirmation and payment
async function handleRecruitmentConfirmation(character) {
  const cost = recruitmentSystem.calculateRecruitmentCost(character);
  const costText =
    cost.items.length > 0
      ? `${cost.gold} gold + ${cost.items.join(", ")}`
      : `${cost.gold} gold`;

  const message = `RECRUITMENT CONFIRMATION`;
  const components = [
    {
      type: "message",
      label: `Recruit ${character.firstName} ${character.lastName}?`,
      value: "confirm_title",
    },
    {
      type: "message",
      label: recruitmentSystem.generateCharacterDescription(character),
      value: "confirm_desc",
    },
    {
      type: "message",
      label: `Cost: ${costText}`,
      value: "confirm_cost",
    },
    {
      type: "button",
      label: "✅ Confirm Recruitment",
      value: "confirm",
    },
    {
      type: "button",
      label: "❌ Cancel",
      value: "cancel",
    },
  ];

  const choice = await getShowChoiceDialog(message, components);

  if (choice === "confirm") {
    return await processRecruitment(character, cost);
  }

  return "cancel";
}

// Process the actual recruitment
async function processRecruitment(character, cost) {
  // Check if player has enough gold
  if (gameState.gold < cost.gold) {
    const message = "INSUFFICIENT FUNDS";
    const components = [
      {
        type: "message",
        label: `You need ${cost.gold} gold but only have ${gameState.gold} gold.`,
        value: "insufficient_gold",
      },
      {
        type: "button",
        label: "❌ Back",
        value: "back",
      },
    ];

    await getShowChoiceDialog(message, components);
    return "insufficient_funds";
  }

  // Check if player has required items
  if (cost.items.length > 0) {
    // TODO: Implement item checking logic
    // For now, assume player has items
    console.log(`Required items: ${cost.items.join(", ")}`);
  }

  // Deduct gold
  gameState.gold -= cost.gold;

  // Add character to group
  gameState.group.push(character);

  // Show success message
  const message = "RECRUITMENT SUCCESSFUL";
  const components = [
    {
      type: "message",
      label: `${character.firstName} ${character.lastName} has joined your group!`,
      value: "success_title",
    },
    {
      type: "message",
      label: `Remaining gold: ${gameState.gold}`,
      value: "success_gold",
    },
    {
      type: "button",
      label: "✅ Continue",
      value: "continue",
    },
  ];

  await getShowChoiceDialog(message, components);

  return "recruitment_successful";
}

// Show special location recruitment dialog
export async function showSpecialLocationRecruitmentDialog(locationType, x, y) {
  const character = recruitmentSystem.checkSpecialLocationRecruitment(
    locationType,
    x,
    y
  );

  if (!character) {
    const message = `${locationType.toUpperCase()} EXPLORATION`;
    const components = [
      {
        type: "message",
        label: `You explore the ${locationType} but find no one to recruit.`,
        value: "no_recruit",
      },
      {
        type: "button",
        label: "❌ Back",
        value: "back",
      },
    ];

    await getShowChoiceDialog(message, components);
    return "no_recruitment_available";
  }

  // Show character found
  const message = `${locationType.toUpperCase()} DISCOVERY`;
  const components = [
    {
      type: "message",
      label: `You discover someone in the ${locationType}!`,
      value: "discovery_title",
    },
    {
      type: "message",
      label: recruitmentSystem.generateCharacterDescription(character),
      value: "discovery_desc",
    },
    {
      type: "button",
      label: `Recruit ${character.firstName}`,
      value: "recruit",
    },
    {
      type: "button",
      label: "❌ Leave",
      value: "leave",
    },
  ];

  const choice = await getShowChoiceDialog(message, components);

  if (choice === "recruit") {
    return await handleRecruitmentConfirmation(character);
  }

  return "left_without_recruiting";
}

// Main recruitment dialog object
export const recruitmentDialog = {
  showRecruitmentDialog,
  showSpecialLocationRecruitmentDialog,
  handleRecruitmentConfirmation,
  processRecruitment,
};

export default recruitmentDialog;
