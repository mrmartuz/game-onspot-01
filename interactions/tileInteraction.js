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
import { recruitmentDialog } from "./recruitmentDialog.js";
import { recruitmentSystem } from "./recruitmentSystem.js";

// Helper function to show minimal menu after recruitment
async function showMinimalMenuAfterRecruitment(tile) {
  let options = [{ type: "button", label: "🚶 Leave", value: "1" }];

  // Add fight option for monster caves
  if (tile.location === "monster caves" || tile.entity === "monster") {
    options.unshift({
      type: "button",
      label: "Fight the monsters",
      value: "9",
    });
  }

  const msg = `At ${tile.location !== "none" ? tile.location : ""} ${
    tile.entity !== "none" ? tile.entity : ""
  }`.trim();
  const finalMsg = msg === "At" ? "On this tile" : msg;

  const choice = await getShowChoiceDialog(finalMsg, options);

  // Handle the choice if user wants to fight monsters
  if (choice === "9") {
    await getHandleEnhancedCombatDialog(gameState.px, gameState.py, true);
  }
}

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
        "volcano",
        "peaks",
      ].includes(tile.location)
    ) {
      // Apply discovery bonus to discovery points
      const positionKey = `${gameState.px},${gameState.py}`;
      if (gameState.discoveredLocations.includes(positionKey)) {
        // For peaks, skip discovery message and just check for recruits
        if (tile.location === "peaks") {
          const availableCharacter =
            recruitmentSystem.checkSpecialLocationRecruitment(
              tile.location,
              gameState.px,
              gameState.py
            );
          if (availableCharacter) {
            const result =
              await recruitmentDialog.showSpecialLocationRecruitmentDialog(
                tile.location,
                gameState.px,
                gameState.py
              );
            if (result === "recruitment_successful") {
              logEvent(`🧍🏻 Recruited character from ${tile.location}`);
            }
          }
          return; // Silent return for peaks
        }

        // Check if there's actually a recruitable character at this location
        const availableCharacter =
          recruitmentSystem.checkSpecialLocationRecruitment(
            tile.location,
            gameState.px,
            gameState.py
          );

        // If there's a character available, show recruitment dialog directly
        if (availableCharacter) {
          const result =
            await recruitmentDialog.showSpecialLocationRecruitmentDialog(
              tile.location,
              gameState.px,
              gameState.py
            );
          if (result === "recruitment_successful") {
            logEvent(`🧍🏻 Recruited character from ${tile.location}`);
          }
          // Show minimal menu after recruitment
          await showMinimalMenuAfterRecruitment(tile);
          return;
        }

        // If no character available, show regular discovery message
        let components = [];
        components.push({
          type: "message",
          label: `You've already discovered this ${tile.location}! 🌟`,
          value: "",
        });

        // Show combat option for locations with monsters
        if (tile.location === "monster caves" || tile.entity === "monster") {
          components.push({
            type: "button",
            label: "Fight the monsters",
            value: "9",
          });
        }

        components.push({ type: "button", label: "OK", value: "ok" });

        let choice = await getShowChoiceDialog(
          `You've already discovered this ${tile.location}! 🌟`,
          components
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

      // For peaks, skip discovery message and just check for recruits
      if (tile.location === "peaks") {
        const availableCharacter =
          recruitmentSystem.checkSpecialLocationRecruitment(
            tile.location,
            gameState.px,
            gameState.py
          );
        if (availableCharacter) {
          const result =
            await recruitmentDialog.showSpecialLocationRecruitmentDialog(
              tile.location,
              gameState.px,
              gameState.py
            );
          if (result === "recruitment_successful") {
            logEvent(`🧍🏻 Recruited character from ${tile.location}`);
          }
        }
        return; // Silent return for peaks, no discovery message
      }

      // Check if there's actually a recruitable character at this location
      const availableCharacter =
        recruitmentSystem.checkSpecialLocationRecruitment(
          tile.location,
          gameState.px,
          gameState.py
        );

      // If there's a character available, show recruitment dialog directly
      if (availableCharacter) {
        // First show discovery message briefly
        let components = [];
        components.push({
          type: "message",
          label: `Discovered ${tile.location}! 🌟${bonusText}`,
          value: "",
        });
        components.push({
          type: "button",
          label: "Continue",
          value: "continue",
        });

        await getShowChoiceDialog(
          `Discovered ${tile.location}! 🌟${bonusText}`,
          components
        );
        logEvent(
          `🌟 Discovered ${tile.location} at ${positionKey} +${totalPoints} points`
        );

        // Then show recruitment dialog
        const result =
          await recruitmentDialog.showSpecialLocationRecruitmentDialog(
            tile.location,
            gameState.px,
            gameState.py
          );
        if (result === "recruitment_successful") {
          logEvent(`🧍🏻 Recruited character from ${tile.location}`);
        }
        // Show minimal menu after recruitment
        await showMinimalMenuAfterRecruitment(tile);
        return;
      }

      // If no character available, show regular discovery message
      let components = [];
      components.push({
        type: "message",
        label: `Discovered ${tile.location}! 🌟${bonusText}`,
        value: "",
      });
      components.push({ type: "button", label: "OK", value: "ok" });

      await getShowChoiceDialog(
        `Discovered ${tile.location}! 🌟${bonusText}`,
        components
      );
      logEvent(
        `🌟 Discovered ${tile.location} at ${positionKey} +${totalPoints} points`
      );

      // Special locations should never fall through to general menu
      return;
    }
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
  // Add recruitment option for locations with recruitment opportunities
  const specialLocations = [
    "waterfalls",
    "canyon",
    "geyser",
    "monster caves",
    "cave",
    "ruin",
    "volcano",
    "peaks",
  ];
  if (
    recruitmentSystem.hasRecruitmentOpportunities(tile.location) &&
    !specialLocations.includes(tile.location)
  ) {
    options.unshift({
      type: "button",
      label: "🧍🏻 Recruitment Board",
      value: "4",
    });
  } else if (
    ["outpost", "farm", "hamlet", "village", "city"].includes(tile.location) ||
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
  if (msg === "At") {
    return; // Don't show dialog for empty tiles
  }
  let choice = await getShowChoiceDialog(msg, options);
  await getHandleChoiceDialog(choice, tile);
}
