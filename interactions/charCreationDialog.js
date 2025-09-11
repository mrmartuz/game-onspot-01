import { getShowChoiceDialog } from "../interactions.js";
import { gameState } from "../gamestate/game_variables.js";
import { getWorldName } from "../utils.js";

export async function characterCreationDialog() {
  const worldName = getWorldName(gameState.seed);
  let name = gameState.name || "";
  let role = gameState.group[0] || "";
  let components = [];
  console.log("name:", name);
  console.log("role:", role);
  const message = `WELCOME TO ${worldName.toUpperCase()}`;
  if (name === "") {
    components.push({ type: "message", label: "Whats your name?", value: "" });
    components.push({ type: "input", label: "name", value: "name" });
  } else {
    components.push({ type: "message", label: `Hi ${name}!`, value: "" });
  }
  if (role === "") {
    components.push(
      {
        type: "message",
        label:
          "Whats your role? Your role will determine your abilities and bonuses.",
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
      { type: "button", label: "Explorer🔍", value: "explorer🔍" },
      { type: "message", label: "Are you ready to start?", value: "" },
      { type: "button", label: "Create Character", value: "create" }
    );
  } else {
    components.push({
      type: "message",
      label: `Your role is ${role.role}`,
      value: "",
    });
    components.push({
      type: "button",
      label: "Create Character",
      value: "create",
    });
  }
  components.push({
    type: "button",
    label: "❌ Back to start menu ❌",
    value: "back",
  });
  const choice = await getShowChoiceDialog(message, components);
  if (choice === "create" && name === "" && role === "") {
    await characterCreationDialog();
  } else if (
    choice !== "create" &&
    choice !== "native-guide🧭" &&
    choice !== "cook🍞" &&
    choice !== "guard⚔️" &&
    choice !== "geologist🪵" &&
    choice !== "biologist🌱" &&
    choice !== "translator🤝" &&
    choice !== "carrier📦" &&
    choice !== "medic❤️" &&
    choice !== "navigator👁️" &&
    choice !== "explorer🔍" &&
    choice !== "back"
  ) {
    gameState.name = choice.charAt(0).toUpperCase() + choice.slice(1);
    await characterCreationDialog();
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
    gameState.group[0] = { role: choice };
    return choice;
  } else if (choice === "create" && name !== "" && role !== "") {
    return choice;
  } else if (choice === "back") {
    return choice;
  }
}
