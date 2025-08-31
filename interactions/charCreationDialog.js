import { getShowChoiceDialog } from "../interactions.js";
import { gameState } from "../game_variables.js";
import { getWorldName } from "../utils.js";

export async function characterCreationDialog() {
  const worldName = getWorldName(gameState.seed);
  let name = "";
  let role = gameState.group[0] || "";
  let components = [];
  console.log("name:", name);
  console.log("role:", role);
  const message = `WELOCOME TO ${worldName}`;
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
      label: `Your role is ${role}`,
      value: "",
    });
    components.push({
      type: "button",
      label: "Create Character",
      value: "create",
    });
  }
  const choice = await getShowChoiceDialog(message, components);
  console.log("choice", choice);
  if (choice === "create" && name === "" && role === "") {
    await characterCreationDialog();
  } else if (choice === "name") {
    gameState.name = choice;
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
    gameState.group[0] = choice;
    await characterCreationDialog();
  } else if (choice === "create" && name !== "" && role !== "") {
    gameState.name = name;
    gameState.group[0].role = role;
    return true;
  }
}
