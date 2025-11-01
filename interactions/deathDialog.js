import { getShowChoiceDialog } from "../interactions.js";
import { gameState } from "../gamestate/game_variables.js";

export async function showDeathDialog(death) {
  let value = "";

  if (death === "health") {
    await getShowChoiceDialog("You died fighting! ☠️", [
      { type: "button", label: "🔄 Restart Game", value: "reload" },
    ]);
  value = "reload";
  } else if (death === "gold") {
    await getShowChoiceDialog("You paid your debt with your life! ☠️", [
      { type: "button", label: "🔄 Restart Game", value: "reload" },
    ]);
    value = "reload";
  } else if (death === "hunting") {
    await getShowChoiceDialog("The hunter became the hunted! ☠️ \n You died!", [
      { type: "button", label: "🔄 Restart Game", value: "reload" },
    ]);
    value = "reload";
  }
  if (death === "thirst") {
    if (gameState.group.length > 1) {
      await getShowChoiceDialog(
        "You left your group without anything ot drink, they clench their thirst with your blood! ☠️",
        [{ type: "button", label: "🔄 Restart Game", value: "reload" }]
      );
    } else {
      await getShowChoiceDialog(
        "Your head pulsating like a roaring storm... your throat swells closing your airway... you died of thirst! ☠️",
        [{ type: "button", label: "🔄 Restart Game", value: "reload" }]
      );
      value = "reload";
    }
  }
  if (death === "starvation") {
    if (gameState.group.length > 1) {
      await getShowChoiceDialog(
        "You left your group without anything to eat, they clench their hunger with your blood! ☠️",
        [{ type: "button", label: "🔄 Restart Game", value: "reload" }]
      );
    } else {
      await getShowChoiceDialog(
        "A slow and steady agony... you died of starvation! ☠️",
        [{ type: "button", label: "🔄 Restart Game", value: "reload" }]
      );
      value = "reload";
    }
  }

  if (value === "reload") {
    setTimeout(() => {
      location.reload();
    }, 1000);
  }
}


