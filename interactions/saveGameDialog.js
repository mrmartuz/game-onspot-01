import { getShowChoiceDialog } from "../interactions.js";
import { gameState } from "../game_variables.js";
import { getWorldName } from "../utils.js";

export async function saveGameDialog() {
  const message = "Save Game";
  const components = [
    {
      type: "message",
      label:
        "You are safe at your current position. Would you like to save your game?",
      value: "",
    },
    { type: "button", label: "Save", value: "save" },
    { type: "button", label: "Back", value: "back" },
  ];
  const choice = await getShowChoiceDialog(message, components);
  if (choice === "save") {
    exportSaveGame();
    return choice;
  } else if (choice === "back") {
    return choice;
  }
}

function exportSaveGame() {
  console.log(gameState);

  const saveGame = JSON.stringify(
    gameState,
    (key, value) => {
      if (value instanceof Map) {
        return {
          _type: "Map",
          value: Array.from(value.entries()),
        };
      } else if (value instanceof Set) {
        return {
          _type: "Set",
          value: Array.from(value),
        };
      }
      return value;
    },
    2
  );
  console.log(saveGame);

  const blob = new Blob([saveGame], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `EXPOGA-${Date.now()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
