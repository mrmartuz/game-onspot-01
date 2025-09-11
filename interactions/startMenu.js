import { gameState } from "../gamestate/game_variables.js";
import { getShowChoiceDialog } from "../interactions.js";

export async function startMenu() {
  const message = " ";

  const choice = await getShowChoiceDialog(message, [
    { type: "button", label: "Welcome to ExpoGa! ", value: "title" },
    {
      type: "message",
      label: `This game offers you to explore the world, hire new members, gain renown, become the greatest explorer of all`,
      value: "",
    },
    { type: "message", label: `Are you ready to start a new game?`, value: "" },
    { type: "button", label: `⏫ Explore! ⏫`, value: "explore" },
    {
      type: "message",
      label: "\n Or do you want to load a saved game?",
      value: "",
    },
    { type: "button", label: `⏬ Load! ⏬`, value: "load" },
    {
      type: "message",
      label:
        "\n\nIf you had enough, you can exit the game. This will close the game-window.",
      value: "",
    },
    { type: "button", label: "❌ Exit the game ❌", value: "exit" },
  ]);
  if (choice === "title") {
    return choice;
  } else if (choice === "explore") {
    return choice;
  } else if (choice === "load") {
    return choice;
  } else if (choice === "exit") {
    return choice;
  }
}
