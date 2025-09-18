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
  const missingProperties = [];
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

          console.log(loadedData);
          console.log(
            "cachedTiles should be empty: ",
            loadedData.cachedTiles.size === 0 ? "true" : "false"
          );
          if (loadedData.visited.size === 0) {
            console.warn("visited is empty, this is not normal");
          } else {
            console.log("visited is not empty, this is normal");
          }
          console.log(
            "killed should be empty: ",
            loadedData.killed.size === 0 ? "true" : "false"
          );

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

          if (restoredData.px === undefined) {
            missingProperties.push("px");
          }
          if (restoredData.py === undefined) {
            missingProperties.push("py");
          }
          if (restoredData.visited === undefined) {
            missingProperties.push("visited");
          }
          if (restoredData.killed === undefined) {
            missingProperties.push("killed");
          }
          if (missingProperties.length > 0) {
            throw new Error(
              "Invalid save file: Missing required properties: " +
                missingProperties.join(", ")
            );
          }

          restoredData.cachedTiles = new Map();

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
          if (
            error.message.includes(
              "Invalid save file: Missing required properties"
            )
          ) {
            alert(
              `Error loading save file. ${
                missingProperties.length > 0
                  ? `\nMissing properties: ${missingProperties.join(", ")}`
                  : "\nThere are no missing properties"
              }`
            );
          } else {
            alert("Error loading save file: Invalid format");
          }
          getShowChoiceDialog("Error loading save file: Invalid format", [
            { type: "button", label: "OK", value: "ok" },
          ]);
          alert(
            `Error loading save file. ${
              missingProperties.length > 0
                ? `\nMissing properties: ${missingProperties.join(", ")}`
                : "\nThere are no missing properties"
            }`
          );
        }
        document.body.removeChild(input);
        resolve();
      };
      reader.readAsText(file);
    });

    input.click();
  });
}
