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
    {
      type: "squaregrid",
      showCoordinates: false,
      tiles: {
        "0-0": { emoji: "🛡️", name: "Sir Galahad", backgroundColor: "#e8f4fd" },
        "9-9": { emoji: "🧙", name: "Syn Copperhammer" },
        "4-4": { emoji: "🌳", name: "Ancient Oak", backgroundColor: "#e8f4fd" },
        "2-7": { emoji: "⚔️", name: "Legendary Sword", backgroundColor: "#e8f4fd" },
        "5-3": { emoji: "💎", name: "Dragon's Hoard", backgroundColor: "blue" },
        "1-1": { emoji: "🧙‍♂️", name: "Wizard", backgroundColor: "red" }, // Wizard
        "8-8": { emoji: "🐉", name: "Dragon", backgroundColor: "#e8f4fd" }, // Dragon
        "3-5": { emoji: "🏰", name: "Castle wall", backgroundColor: "#e8f4fd" }, // Castle wall
        "6-2": { emoji: "⚡", name: "Lightning", backgroundColor: "#e8f4fd" }, // Lightning
      },
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
