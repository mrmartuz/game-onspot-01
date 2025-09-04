import { gameState } from "../game_variables.js";
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
    components.push({ type: "message", label: "How is it called your group?", value: "" });
    components.push({
      type: "input",
      label: "group-name",
      value: "group-name",
    });
  }
  if (gameState.group.length === 1) {
    components.push({
      type: "message",
      label: "Add a member to your group",
      value: "",
    },
    { type: "button", label: "Native Guide🧭", value: "native-guide🧭" },
    { type: "button", label: "Cook🍞", value: "cook🍞" },
    { type: "button", label: "Guard⚔️", value: "guard⚔️" },
    { type: "button", label: "Geologist🪵", value: "geologist🪵" },
    { type: "button", label: "Biologist🌱", value: "biologist🌱" },
    { type: "button", label: "Translator🤝", value: "translator🤝" },
    { type: "button", label: "Carrier 📦", value: "carrier📦" },
    { type: "button", label: "Medic ❤️", value: "medic❤️" },
    { type: "button", label: "Navigator 👁️", value: "navigator👁️" },
    { type: "button", label: "Explorer🔍", value: "explorer🔍" }
);
  } else {
    components.push({
      type: "message",
      label: `Your group ${groupName} is formed by you and ${gameState.group
        .slice(1)
        .map((member) => member.role)
        .join(", ")}`,
    });
  }
  components.push({ type: "button", label: "Create", value: "create" });
  const choice = await getShowChoiceDialog(message, components);
  console.log(choice);
  if (
    choice !== "create" &&
    choice !== "group-name" &&
    choice !== "native-guide🧭" &&
    choice !== "cook🍞" &&
    choice !== "guard⚔️" &&
    choice !== "geologist🪵" &&
    choice !== "biologist🌱" &&
    choice !== "translator🤝" &&
    choice !== "carrier📦" &&
    choice !== "medic❤️" &&
    choice !== "navigator👁️" &&
    choice !== "explorer🔍"
  ) {
    gameState.groupName = choice.charAt(0).toUpperCase() + choice.slice(1).toLowerCase();
    return "group-name";
  } else if (
    choice === "native-guide🧭" ||
    choice === "cook🍞" ||
    choice === "guard⚔️" ||
    choice === "geologist🪵" ||
    choice === "biologist🌱" ||
    choice === "translator🤝" ||
    choice === "carrier📦" ||
    choice === "medic❤️" ||
    choice === "navigator👁️" ||
    choice === "explorer🔍"
  ) {
    gameState.group[1] = { role: choice };
    console.log(gameState.group);
    return "group";
  } else if (choice === "create") {
    return choice;
  }
  return choice;
}

export function handleGroupCreationChoice(choice) {
  if (choice === "create") {
    createGroup();
  }
}
