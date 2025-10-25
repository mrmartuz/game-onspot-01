import { getShowChoiceDialog } from "../interactions.js";

export async function showDeathDialog(death) {
  if (death === "health") {
    await getShowChoiceDialog("You died fighting! ☠️", [
      { type: "button", label: "🔄 Restart Game", value: "reload" },
    ]);
    location.reload();
  } else if (death === "gold") {
    await getShowChoiceDialog("You paid your debt with your life! ☠️", [
      { type: "button", label: "🔄 Restart Game", value: "reload" },
    ]);
    location.reload();
  } else if (death === "hunting") {
    await getShowChoiceDialog("The hunter became the hunted! ☠️ \n You died!", [
      { type: "button", label: "🔄 Restart Game", value: "reload" },
    ]);
    location.reload();
  }
}
