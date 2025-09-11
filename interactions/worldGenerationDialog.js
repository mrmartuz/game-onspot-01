import { gameState } from "../gamestate/game_variables.js";
import { getShowChoiceDialog } from "../interactions.js";
import { getWorldName } from "../utils.js";

export async function worldGenerationDialog() {
  const seed = gameState.seed;
  const worldName = getWorldName(seed);
  const message = `CREATE OR LOAD A WORLD`;

  const choice = await getShowChoiceDialog(message, [
    {
      type: "message",
      label: `We can offer you the world of: \n${worldName}\n to be explored...`,
      value: "",
    },
    { type: "button", label: `🧭 Explore ${worldName}! 🔎`, value: "new" },
    {
      type: "message",
      label:
        "\n Or enter a seed manually of 9 numbers to search in another world: 🔭",
      value: "seed",
    },
    { type: "input", label: "Seed", value: "seed" },
    {
      type: "message",
      label:
        "\n\nIf you had enough, you can exit the game. This will close the game-window.",
      value: "",
    },
    { type: "button", label: "❌ Back to start menu ❌", value: "back" },
  ]);
  if (choice === "title") {
    return choice;
  } else if (choice === "new") {
    return choice;
  } else if (choice === "seed") {
    return choice;
  } else if (choice === "back") {
    return choice;
  }
}
