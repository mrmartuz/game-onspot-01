import { getShowChoiceDialog } from "../interactions.js";
import {
  locationEmoji,
  raceEmoji,
  entityEmoji,
  goldEmoji,
} from "../gamestate/emoji-database.js";

export async function titleDialog() {
  const message = "ExpoGa🧭 v0.1.0 - Exploration Adventure Game";

  const choice = await getShowChoiceDialog(message, [
    {
      type: "message",
      label: `🗺️ Explore a infinite procedurally (for now) generated world ${locationEmoji.camp}${locationEmoji.waterfalls}${locationEmoji.volcano} \n\n⚔️ Battle creatures and monsters in monster caves ${locationEmoji["monster caves"]} or around the world ${entityEmoji.monster} \n\n 👥 Recruit companions ${raceEmoji.Human}${raceEmoji.Elf}${raceEmoji.Dwarf}${raceEmoji.Orc} to join your expedition by hiring them in camps ${locationEmoji.outpost} or villages, ${locationEmoji.village} or cities ${locationEmoji.city} or interacting with the othe groups ${entityEmoji.group}${entityEmoji.army} that travel the world. \n\n 💰 Collect heads 🏺🐺 of monsters to sell them in cities or armies ${entityEmoji.army} \n\n 🏆 🌟 Discover new places and sell them to cities ${locationEmoji.city} \n\n Gain gold ${goldEmoji} by discovering new places and selling your discoveries 🌟 to cities ${locationEmoji.city}`,
      value: "",
    },
    {
      type: "message",
      label:
        "\nClick on arrows ⬆️↗️➡️↘️⬇️↙️⬅️↖️ to move around the world. Your adventure awaits!",
      value: "",
    },
    { type: "button", label: "🔙 Back to Main Menu", value: "back" },
  ]);

  return choice;
}
