import { gameState } from "../gamestate/game_variables.js";
import { getShowChoiceDialog } from "../interactions.js";

// Generate random group name
function generateRandomGroupName() {
  const groupNamePrefixes = [
    "The",
    "The Order of",
    "The Guild of",
    "The Company of",
    "The Band of",
    "The Circle of",
    "The Brotherhood of",
    "The Sisterhood of",
    "The Fellowship of",
    "The Alliance of",
    "The Coalition of",
    "The Union of",
    "The Society of",
  ];

  const groupNameSuffixes = [
    "Adventurers",
    "Heroes",
    "Explorers",
    "Warriors",
    "Mages",
    "Rogues",
    "Knights",
    "Guardians",
    "Defenders",
    "Seekers",
    "Hunters",
    "Scouts",
    "Mercenaries",
    "Wanderers",
    "Travelers",
    "Pilgrims",
    "Crusaders",
    "Champions",
    "Legends",
    "Mystics",
    "Sages",
    "Scholars",
    "Artisans",
    "Traders",
    "Merchants",
    "Diplomats",
    "Spies",
    "Assassins",
    "Thieves",
    "Bards",
    "Healers",
    "Priests",
    "Paladins",
    "Rangers",
    "Druids",
    "Monks",
    "Barbarians",
    "Fighters",
    "Wizards",
    "Sorcerers",
    "Clerics",
    "Druids",
    "Rogues",
    "Rangers",
    "Paladins",
    "Monks",
    "Barbarians",
  ];

  const descriptiveWords = [
    "Golden",
    "Silver",
    "Iron",
    "Steel",
    "Crystal",
    "Emerald",
    "Ruby",
    "Sapphire",
    "Diamond",
    "Shadow",
    "Light",
    "Dark",
    "Bright",
    "Storm",
    "Fire",
    "Ice",
    "Wind",
    "Earth",
    "Water",
    "Thunder",
    "Lightning",
    "Frost",
    "Flame",
    "Star",
    "Moon",
    "Sun",
    "Dawn",
    "Dusk",
    "Night",
    "Day",
    "Crimson",
    "Azure",
    "Violet",
    "Emerald",
    "Amber",
    "Pearl",
    "Onyx",
    "Jade",
    "Topaz",
    "Garnet",
    "Opal",
  ];

  const randomPrefix =
    groupNamePrefixes[Math.floor(Math.random() * groupNamePrefixes.length)];
  const randomSuffix =
    groupNameSuffixes[Math.floor(Math.random() * groupNameSuffixes.length)];
  const randomDescriptor =
    descriptiveWords[Math.floor(Math.random() * descriptiveWords.length)];

  // Sometimes add a descriptor, sometimes not
  if (Math.random() < 0.6) {
    return `${randomPrefix} ${randomDescriptor} ${randomSuffix}`;
  } else {
    return `${randomPrefix} ${randomSuffix}`;
  }
}

export async function showGroupCreationDialog() {
  let groupName = gameState.groupName || "";
  const message = "GROUP CREATION";
  let components = [];

  if (groupName) {
    components.push({
      type: "message",
      label: `Your group is called ${groupName}`,
      value: groupName,
    });
    components.push({
      type: "button",
      label: "🎲 Generate Another Random Name",
      value: "random-name",
    });
    components.push({
      type: "input",
      label: "group-name",
      value: "group-name",
    });
  } else {
    components.push({
      type: "message",
      label: "How is it called your group?",
      value: "",
    });
    components.push({
      type: "button",
      label: "🎲 Random Name",
      value: "random-name",
    });
    components.push({
      type: "input",
      label: "group-name",
      value: "group-name",
    });
  }

  // Show current group members
  if (gameState.group.length > 1) {
    const memberNames = gameState.group
      .slice(1)
      .map((member) => {
        if (member.firstName && member.lastName) {
          return `${member.firstName} ${member.lastName} (${member.class})`;
        } else if (member.role) {
          return member.role;
        }
        return "Unknown";
      })
      .join(", ");

    components.push({
      type: "message",
      label: `Your group ${groupName} is formed by you and ${memberNames}`,
    });
  } else {
    components.push({
      type: "message",
      label: `Your group ${groupName} consists of just you.`,
    });
  }

  components.push({ type: "button", label: "Create", value: "create" });
  components.push({
    type: "button",
    label: "❌ Back to start menu ❌",
    value: "back",
  });

  const choice = await getShowChoiceDialog(message, components);
  choice;

  if (choice === "random-name") {
    let randomName;
    let attempts = 0;
    // Try to generate a different name (max 5 attempts to avoid infinite loop)
    do {
      randomName = generateRandomGroupName();
      attempts++;
    } while (randomName === gameState.groupName && attempts < 5);

    gameState.groupName = randomName;
    // Return to the same dialog to show the new name and allow generating another
    return "group-name";
  } else if (
    choice !== "create" &&
    choice !== "group-name" &&
    choice !== "back"
  ) {
    gameState.groupName =
      choice.charAt(0).toUpperCase() + choice.slice(1).toLowerCase();
    return "group-name";
  } else if (choice === "create") {
    return choice;
  } else if (choice === "back") {
    return choice;
  }
}

export function handleGroupCreationChoice(choice) {
  if (choice === "create") {
    createGroup();
  }
}
