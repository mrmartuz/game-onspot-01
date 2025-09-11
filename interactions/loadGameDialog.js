// saveGame.js
import { gameState } from "../gamestate/game_variables.js";
import { getShowChoiceDialog } from "../interactions.js";

export async function loadGameDialog() {
  const message = "Load Game";
  const components = [
    {
      type: "message",
      label: "You can load a save game file here",
      value: "",
    },
    { type: "button", label: "⏬ Load", value: "load" },
    { type: "button", label: "❌ Back", value: "back" },
  ];
  const choice = await getShowChoiceDialog(message, components);
  if (choice === "load") {
    await importSaveGame();
    return choice;
  } else if (choice === "back") {
    return choice;
  }
}

//TODO: check serialization for errors. bugs when importing saved game.

function importSaveGame() {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.style.display = "none";
    document.body.appendChild(input);

    input.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (!file) {
        document.body.removeChild(input);
        resolve();
        return;
      }

      const reader = new FileReader();
      reader.onload = function (e) {
        try {
          const loadedData = JSON.parse(e.target.result);
          // Reconstruct Map and Set objects
          const restoredData = Object.keys(loadedData).reduce((obj, key) => {
            const value = loadedData[key];
            if (value && value._type === "Map") {
              obj[key] = new Map(value.value);
            } else if (value && value._type === "Set") {
              obj[key] = new Set(value.value);
            } else if (key === "game_start_date") {
              obj[key] = new Date(value); // Convert string back to Date
            } else {
              obj[key] = value;
            }
            return obj;
          }, {});
          // Validate essential properties
          if (
            !restoredData.px ||
            !restoredData.py ||
            !restoredData.visited ||
            !restoredData.killed
          ) {
            throw new Error("Invalid save file: Missing required properties");
          }
          // Update gameState
          Object.assign(gameState, restoredData);

          // Reset movement-related states when loading a saved game
          gameState.cooldown = false;
          gameState.moving = false;
          gameState.moveStartTime = 0;
          gameState.moveDuration = 0;
          gameState.moveDx = 0;
          gameState.moveDy = 0;

          console.log("Loaded gameState:", gameState);
          //   getShowChoiceDialog("Game loaded successfully!", [
          //     { type: "button", label: "OK", value: "ok" },
          //   ]);
          alert("Game loaded successfully!");
        } catch (error) {
          console.error("Import error:", error);
          // getShowChoiceDialog("Error loading save file: Invalid format", [
          //   { type: "button", label: "OK", value: "ok" },
          // ]);
          alert("Error loading save file: Invalid format");
        }
        document.body.removeChild(input);
        resolve();
      };
      reader.readAsText(file);
    });

    input.click();
  });
}
