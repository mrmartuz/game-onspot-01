import { gameState } from "../gamestate/game_variables.js";
import { getShowChoiceDialog } from "../interactions.js";
import { getGroupBonus, getMaxStorage, hash } from "../utils.js";
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
import {
  getLocationStatus,
  getNextUnclearedRoom,
  isLocationFullyCleared,
  isLocationVisited,
} from "./combat-system/location-rooms.js";
import { getLocationBehaviorType } from "./combat-system/databases/location-rules.js";

// Helper function to get image component for location
function getLocationImageComponent(location, x, y) {
  const locationImages = {
    army: ["images/army-01.png", "images/army-02.png"],
    trader: ["images/trader-01.png", "images/trader-02.png"],
    caravan: ["images/caravan-01.png"],
    npc: ["images/npc-01.png"],
    group: ["images/group-01.png", "images/group-02.png"],
    city: ["images/city-01.png", "images/city-02.png"],
    village: [
      "images/village-01.png",
      "images/village-02.png",
      "images/village-03.png",
    ],
    farm: ["images/farm-01.png", "images/farm-02.png"],
    waterfalls: ["images/waterfalls-01.png", "images/waterfalls-02.png"],
    camp: [
      "images/camp-01.png",
      "images/camp-02.png",
      "images/camp-03.png",
      "images/camp-04.png",
    ],
    hamlet: ["images/hamlet-01.png", "images/hamlet-02.png"],
    outpost: ["images/outpost-01.png", "images/outpost-02.png"],
    ruin: [
      "images/ruin-01.png",
      "images/ruin-02.png",
      "images/ruin-03.png",
      "images/ruin-04.png",
      "images/ruin-05.png",
    ],
    volcano: ["images/volcano-01.png", "images/volcano-02.png"],
    "monster caves": [
      "images/monster-caves-01.png",
      "images/monster-caves-02.png",
      "images/monster-caves-03.png",
    ],
    cave: ["images/cave-01.png", "images/cave-02.png"],
  };

  let imagePath = locationImages[location];
  if (!imagePath) {
    return null;
  }

  // If imagePath is an array, deterministically select one based on hash
  if (Array.isArray(imagePath)) {
    if (x !== undefined && y !== undefined) {
      // Use hash with a seed value of 0 for image selection
      const hashValue = hash(x, y, 0);
      const imageIndex = Math.floor(hashValue * imagePath.length);
      imagePath = imagePath[imageIndex];
    } else {
      // Fallback to first image if coordinates not provided
      imagePath = imagePath[0];
    }
  }

  return {
    type: "image",
    src: imagePath,
    alt: location,
    maxWidth: "100%",
    marginBottom: "15px",
  };
}

// Helper function to get image component for entity
function getEntityImageComponent(entity, x, y) {
  const entityImages = {
    npc: ["images/npc-01.png", "images/npc-02.png"],
    group: ["images/group-01.png", "images/group-02.png"],
    caravan: ["images/caravan-01.png", "images/caravan-02.png"],
    trader: ["images/trader-01.png", "images/trader-02.png"],
    army: ["images/army-01.png", "images/army-02.png"],
  };

  let imagePath = entityImages[entity];
  if (!imagePath) {
    return null;
  }

  // If imagePath is an array, deterministically select one based on hash
  if (Array.isArray(imagePath)) {
    if (x !== undefined && y !== undefined) {
      // Use hash with a seed value of 0 for image selection
      const hashValue = hash(x, y, 0);
      const imageIndex = Math.floor(hashValue * imagePath.length);
      imagePath = imagePath[imageIndex];
    } else {
      // Fallback to first image if coordinates not provided
      imagePath = imagePath[0];
    }
  }

  return {
    type: "image",
    src: imagePath,
    alt: entity,
    maxWidth: "100%",
    marginBottom: "15px",
  };
}

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

  // Add fight option for monster caves, caves, volcano, or monster entities
  const fightLabel = getFightButtonLabel(tile);
  if (fightLabel) {
    options.unshift({
      type: "button",
      label: fightLabel,
      value: "9",
    });
  }

  // Add location image if available (at the top, after all buttons are added)
  const locationImage = getLocationImageComponent(
    tile.location,
    gameState.px,
    gameState.py
  );
  if (locationImage) {
    options.unshift(locationImage);
  }

  const choice = await getShowChoiceDialog("", options);

  // Handle the choices
  if (choice === "water") {
    await collectWaterFromWaterfall();
  } else if (choice === "9") {
    await getHandleEnhancedCombatDialog(gameState.px, gameState.py, true);
  }
}

/**
 * Get fight button label based on location/entity status
 * Shows room progression for multi-room locations
 * @param {Object} tile - Tile object
 * @returns {string} Fight button label or null
 */
function getFightButtonLabel(tile) {
  const x = gameState.px;
  const y = gameState.py;

  // Check for entity encounters
  if (tile.entity === "monster" || tile.entity === "beast") {
    return "⚔️ Fight the monsters";
  }

  // Check for location encounters
  if (
    tile.location &&
    ["cave", "monster caves", "volcano"].includes(tile.location)
  ) {
    const locationStatus = getLocationStatus(x, y);

    if (locationStatus) {
      // Location has been visited, show room progression
      const nextRoom = getNextUnclearedRoom(x, y);
      const totalRooms = locationStatus.totalRooms;
      const clearedCount = locationStatus.clearedCount;

      if (nextRoom === -1) {
        // All rooms cleared
        if (isLocationFullyCleared(x, y)) {
          return `🏆 Location Cleared (${clearedCount}/${totalRooms} rooms)`;
        }
      } else {
        // Show current room info
        const roomNumber = nextRoom + 1;
        const behaviorType = getLocationBehaviorType(tile.location);
        const isBossRoom = roomNumber === totalRooms;

        if (isBossRoom) {
          return `⚔️ Fight Boss (Room ${roomNumber}/${totalRooms})`;
        } else {
          return `⚔️ Enter Room ${roomNumber}/${totalRooms}`;
        }
      }
    } else {
      // First time entering location
      return (
        "⚔️ Enter the " +
        (tile.location === "volcano" ? "volcano" : tile.location)
      );
    }
  }

  return null;
}

// Helper function to show menu after entity interaction (with trade option for armies)
async function showMenuAfterEntityInteraction(tile) {
  let options = [{ type: "button", label: "🚶 Leave", value: "1" }];

  // Add fight option for monster caves, caves, volcano, or monster entities
  const fightLabel = getFightButtonLabel(tile);
  if (fightLabel) {
    options.unshift({
      type: "button",
      label: fightLabel,
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

  // Add entity image if available (at the top, after all buttons are added)
  const entityImage = getEntityImageComponent(
    tile.entity,
    gameState.px,
    gameState.py
  );
  if (entityImage) {
    options.unshift(entityImage);
  }

  const choice = await getShowChoiceDialog("", options);

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
      const fightLabel = getFightButtonLabel(tile);
      const combatChoice = await getShowChoiceDialog("", [
        { type: "button", label: fightLabel || "⚔️ Fight", value: "fight" },
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

        // Add location image if available
        const locationImage = getLocationImageComponent(
          tile.location,
          gameState.px,
          gameState.py
        );
        if (locationImage) {
          components.push(locationImage);
        }

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
        const fightLabel = getFightButtonLabel(tile);
        if (fightLabel) {
          components.push({
            type: "button",
            label: fightLabel,
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

      // Add location image if available
      const locationImage = getLocationImageComponent(
        tile.location,
        gameState.px,
        gameState.py
      );
      if (locationImage) {
        components.push(locationImage);
      }

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
      label: `😴 Rest (-${Math.ceil(
        gameState.group.length * 0.5
      )}🍞 - ${Math.ceil(gameState.group.length * 0.5)}💧)`,
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
  // Add fight option for locations and entities
  const fightLabel = getFightButtonLabel(tile);
  if (fightLabel) {
    options.unshift({
      type: "button",
      label: fightLabel,
      value: "9",
    });
  }
  if (tile.location === "peaks" && tile.entity === "none") {
    return;
  }

  // Check if we have a location or entity to show dialog for
  const hasLocation = tile.location !== "none";
  const hasEntity = tile.entity !== "none";
  if (!hasLocation && !hasEntity) {
    return; // Don't show dialog for empty tiles
  }

  // Add location image if available (for city, village, farm)
  const locationImage = getLocationImageComponent(
    tile.location,
    gameState.px,
    gameState.py
  );
  if (locationImage) {
    options.unshift(locationImage);
  }

  // Add entity image if available (for npc, group, caravan, trader, army)
  const entityImage = getEntityImageComponent(
    tile.entity,
    gameState.px,
    gameState.py
  );
  if (entityImage) {
    options.unshift(entityImage);
  }

  let choice = await getShowChoiceDialog("", options);
  await getHandleChoiceDialog(choice, tile);
}
