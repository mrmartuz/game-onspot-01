import { gameState } from "../gamestate/game_variables.js";
import { getShowChoiceDialog } from "../interactions.js";

export async function showEventsDialog() {
  const list = gameState.events
    .map((ev) => `${ev.date}: ${ev.desc}`)
    .join("\n");
  await getShowChoiceDialog(
    `The events of your journey so far: 📜\n\n${list}` || "No events yet. 📜",
    [{ type: "button", label: "OK", value: "ok" }]
  );
}
