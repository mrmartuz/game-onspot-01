import { gameState } from "../gamestate/game_variables.js";
import { getShowChoiceDialog } from "../interactions.js";

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
  } else {
    components.push({
      type: "message",
      label: "How is it called your group?",
      value: "",
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
  console.log(choice);

  if (choice !== "create" && choice !== "group-name" && choice !== "back") {
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
