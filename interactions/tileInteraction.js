import { gameState } from "../gamestate/game_variables.js";
import { getShowChoiceDialog } from "../interactions.js";
import { getGroupBonus, getMaxStorage } from "../utils.js";
import { updateStatus } from "../rendering.js";
import { logEvent } from "../time_system.js";
import {
  getHandleChoiceDialog,
  getHandleCombatDialog,
  getHandleEnhancedCombatDialog,
} from "../interactions.js";
import { recruitmentDialog } from "./recruitmentDialog.js";
import { recruitmentSystem } from "./recruitmentSystem.js";
import { handleChoice } from "./handleChoice.js";

// Helper function to check if there's enough storage space for water
function hasSpaceForWater(amount = 10) {
  const maxStorage = getMaxStorage();

  // Calculate current storage usage
  const goldSpace = Math.ceil(gameState.gold / 25);
  const foodSpace = gameState.food;
  const waterSpace = gameState.water;
  const woodSpace = gameState.wood;
  const tentSpace = gameState.tents;
  const buildingMatSpace = gameState.building_mats;

  // Calculate monster head space
  const headSpace = gameState.monsterHeads.reduce(
    (total, head) => total + head.inventorySize,
    0
  );

  const totalUsedSpace =
    goldSpace +
    foodSpace +
    waterSpace +
    headSpace +
    woodSpace +
    tentSpace +
    buildingMatSpace;
  const availableSpace = maxStorage - totalUsedSpace;

  return availableSpace >= amount;
}

// Helper function to collect water from waterfall
async function collectWaterFromWaterfall() {
  const waterAmount = 10;

  if (!hasSpaceForWater(waterAmount)) {
    await getShowChoiceDialog(
      `❌ Not enough storage space!\n\nYou need ${waterAmount} space to collect water from the waterfall.`,
      [{ type: "button", label: "OK", value: "ok" }]
    );
    return false;
  }

  gameState.water += waterAmount;
  updateStatus();
  logEvent(`💧 Collected ${waterAmount} water from waterfall`);

  await getShowChoiceDialog(
    `💧 Collected ${waterAmount} water from the waterfall!\n\nYour party now has ${gameState.water.toFixed(
      1
    )} water.`,
    [{ type: "button", label: "OK", value: "ok" }]
  );

  return true;
}

// Helper function to show minimal menu after recruitment
async function showMinimalMenuAfterRecruitment(tile) {
  let options = [{ type: "button", label: "🚶 Leave", value: "1" }];

  // Add water collection option for waterfalls
  if (tile.location === "waterfalls") {
    const waterButtonLabel = hasSpaceForWater(10)
      ? "💧 Take water from the waterfall +10💧"
      : "💧 Take water from the waterfall +10💧 (No space)";
    options.unshift({
      type: "button",
      label: waterButtonLabel,
      value: "water",
    });
  }

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

  // Handle the choices
  if (choice === "water") {
    await collectWaterFromWaterfall();
  } else if (choice === "9") {
    await getHandleEnhancedCombatDialog(gameState.px, gameState.py, true);
  }
}

// Helper function to show menu after entity interaction (with trade option for armies)
async function showMenuAfterEntityInteraction(tile) {
  let options = [{ type: "button", label: "🚶 Leave", value: "1" }];

  // Add fight option for monster caves
  if (tile.location === "monster caves" || tile.entity === "monster") {
    options.unshift({
      type: "button",
      label: "Fight the monsters",
      value: "9",
    });
  }

  // Add trade option for armies
  if (tile.entity === "army") {
    options.unshift({
      type: "button",
      label: "💰 Trade",
      value: "3",
    });
  }

  const msg = `At ${tile.location !== "none" ? tile.location : ""} ${
    tile.entity !== "none" ? tile.entity : ""
  }`.trim();
  const finalMsg = msg === "At" ? "On this tile" : msg;

  const choice = await getShowChoiceDialog(finalMsg, options);

  // Handle the choice
  if (choice === "9") {
    await getHandleEnhancedCombatDialog(gameState.px, gameState.py, true);
  } else if (choice === "3") {
    // Handle trade for armies
    await handleChoice("3", tile);
  }
}

export async function checkTileInteraction(tile) {
  // Handle entity-based recruitment for monster/beast (wounded character rescue)
  if (["monster", "beast"].includes(tile.entity)) {
    // Check if there's a wounded character to rescue
    const woundedCharacter = recruitmentSystem.checkEntityRecruitment(
      tile.entity,
      gameState.px,
      gameState.py
    );

    if (woundedCharacter) {
      const result = await recruitmentDialog.showWoundedCharacterDialog(
        tile.entity,
        gameState.px,
        gameState.py
      );

      if (result === "rescue_successful") {
        logEvent(`🩹 Rescued and recruited character from ${tile.entity}`);
      } else if (result === "left_wounded_character") {
        logEvent(`😔 Left wounded character at ${tile.entity}`);
      }

      // After rescue attempt, show combat option
      const combatChoice = await getShowChoiceDialog(`At ${tile.entity}`, [
        { type: "button", label: "⚔️ Fight", value: "fight" },
        { type: "button", label: "🚶 Leave", value: "leave" },
      ]);

      if (combatChoice === "fight") {
        await getHandleEnhancedCombatDialog(gameState.px, gameState.py, true);
      }
      return;
    } else {
      // No wounded character, proceed to combat
      await getHandleCombatDialog(gameState.px, gameState.py, true);
      return;
    }
  }

  // Handle entity-based recruitment for other entities
  if (["npc", "group", "army", "trader", "caravan"].includes(tile.entity)) {
    const result = await recruitmentDialog.showEntityRecruitmentDialog(
      tile.entity,
      gameState.px,
      gameState.py
    );

    if (result === "recruitment_successful") {
      logEvent(`🧍🏻 Recruited character from ${tile.entity}`);
    } else if (result === "no_recruitment_available") {
      logEvent(`👥 No one willing to join from ${tile.entity}`);
    }

    // Show menu after recruitment attempt
    await showMenuAfterEntityInteraction(tile);
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
            await recruitmentSystem.checkSpecialLocationRecruitment(
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

        // Add water collection option for waterfalls
        if (tile.location === "waterfalls") {
          const waterButtonLabel = hasSpaceForWater(10)
            ? "💧 Take water from the waterfall +10💧"
            : "💧 Take water from the waterfall +10💧 (No space)";
          components.push({
            type: "button",
            label: waterButtonLabel,
            value: "water",
          });
        }

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

        // Handle the choices
        if (choice === "water") {
          await collectWaterFromWaterfall();
        } else if (choice === "9") {
          await getHandleEnhancedCombatDialog(gameState.px, gameState.py, true);
        }
        return;
      }

      // For peaks, skip discovery points and just check for recruits
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
        return; // Silent return for peaks, no discovery points or message
      }

      // Calculate discovery points for non-peak locations
      let discoveryBonus = getGroupBonus("discovery");
      let basePoints = 10;
      let bonusPoints = Math.floor(Math.random() * (5 + discoveryBonus));
      let totalPoints = basePoints + bonusPoints;

      gameState.discoverPoints += totalPoints;
      gameState.discoveredLocations.push(positionKey);
      updateStatus();

      let bonusText = bonusPoints > 0 ? ` (+${bonusPoints} bonus)` : "";

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
          label: `Discovered ${tile.location}! 🌟${totalPoints}`,
          value: "",
        });
        components.push({
          type: "button",
          label: "Continue",
          value: "continue",
        });

        await getShowChoiceDialog(`You have found a new location!`, components);
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

      // Add water collection option for waterfalls
      if (tile.location === "waterfalls") {
        const waterButtonLabel = hasSpaceForWater(10)
          ? "💧 Take water from the waterfall +10💧"
          : "💧 Take water from the waterfall +10💧 (No space)";
        components.push({
          type: "button",
          label: waterButtonLabel,
          value: "water",
        });
      }

      components.push({ type: "button", label: "OK", value: "ok" });

      const choice = await getShowChoiceDialog(
        `Discovered ${tile.location}! 🌟${totalPoints}`,
        components
      );

      // Handle water collection
      if (choice === "water") {
        await collectWaterFromWaterfall();
      }
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
      label: `😴 Rest (-${Math.ceil(gameState.group.length * 0.5)}🍞 - ${Math.ceil(gameState.group.length * 0.5)
      }💧)`,
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
