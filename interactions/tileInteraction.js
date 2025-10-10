import { gameState } from "../gamestate/game_variables.js";
import { getShowChoiceDialog } from "../interactions.js";
import { getGroupBonus } from "../utils.js";
import { updateStatus } from "../rendering.js";
import { logEvent } from "../time_system.js";
import {
  getHandleChoiceDialog,
  getHandleCombatDialog,
  getHandleEnhancedCombatDialog,
} from "../interactions.js";

export async function checkTileInteraction(tile) {
  if (["monster", "beast"].includes(tile.entity)) {
    await getHandleCombatDialog(gameState.px, gameState.py, true);
    return;
  }

  if (tile.location !== "none" || tile.entity !== "none") {
    if (
      [
        "waterfalls",
        "canyon",
        "geyser",
        "monster caves",
        "cave",
        "ruin",
      ].includes(tile.location)
    ) {
      // Apply discovery bonus to discovery points
      const positionKey = `${gameState.px},${gameState.py}`;
      if (gameState.discoveredLocations.includes(positionKey)) {
        // Use .includes() for array
        let choice = await getShowChoiceDialog(
          `You've already discovered this ${tile.location}! 🌟`,
          [
            { type: "button", label: "Fight the monsters", value: "9" },
            { type: "button", label: "OK", value: "ok" },
          ]
        );

        // Handle the choice if user wants to fight monsters
        if (choice === "9") {
          await getHandleEnhancedCombatDialog(gameState.px, gameState.py, true);
        }
        return;
      }
      let discoveryBonus = getGroupBonus("discovery");
      let basePoints = 10;
      let bonusPoints = Math.floor(
        Math.random() * (5 + discoveryBonus) + basePoints
      );
      let totalPoints = bonusPoints;

      gameState.discoverPoints += totalPoints;
      gameState.discoveredLocations.push(positionKey); // Use .push() for array
      updateStatus();

      let bonusText = bonusPoints > 0 ? ` (+${bonusPoints} bonus)` : "";
      await getShowChoiceDialog(`Discovered ${tile.location}! 🌟${bonusText}`, [
        { type: "button", label: "OK", value: "ok" },
      ]);
      logEvent(
        `🌟 Discovered ${tile.location} at ${positionKey} +${totalPoints} points`
      );
    }

    let options = [{ type: "button", label: "🚶 Leave", value: "1" }];
    if (tile.location === "camp" || tile.location === "outpost") {
      options.unshift({ type: "button", label: "💰 Save game", value: "8" });
    }

    if (
      ["camp", "outpost", "farm", "hamlet", "village", "city"].includes(
        tile.location
      )
    ) {
      options.unshift({
        type: "button",
        label: `😴 Rest (-${gameState.group.length * 0.5}🍞 - ${
          gameState.group.length * 0.5
        }💧 -2🪙)`,
        value: "2",
      });
    }
    if (
      ["hamlet", "village", "city"].includes(tile.location) ||
      ["trader", "caravan"].includes(tile.entity)
    ) {
      options.unshift({ type: "button", label: "🪙 Trade", value: "3" });
    }
    if (
      ["outpost", "farm", "hamlet", "village", "city"].includes(
        tile.location
      ) ||
      ["trader", "caravan", "army", "group", "npc"].includes(tile.entity)
    ) {
      options.unshift({ type: "button", label: "🧍🏻 Hire", value: "4" });
    }
    if (tile.location === "city") {
      options.unshift({
        type: "button",
        label: "🌟 Sell discoveries",
        value: "5",
      });
    }
    if (
      ["village", "city"].includes(tile.location) ||
      ["caravan"].includes(tile.entity)
    ) {
      options.unshift({ type: "button", label: "🏹 Sell hunts", value: "6" });
    }
    if (tile.entity === "animal") {
      options.unshift({ type: "button", label: "🏹 Hunt", value: "7" });
    }
    if (tile.location === "monster caves") {
      options.unshift({
        type: "button",
        label: "Fight the monsters!",
        value: "9",
      });
    }
    let msg = "";
    if (tile.location === "peaks" && tile.entity === "none") {
      return;
    }
    msg = `At ${tile.location !== "none" ? tile.location : ""} ${
      tile.entity !== "none" ? tile.entity : ""
    }`.trim();
    if (msg === "At") msg = "On this tile";
    let choice = await getShowChoiceDialog(msg, options);
    await getHandleChoiceDialog(choice, tile);
  }
}
