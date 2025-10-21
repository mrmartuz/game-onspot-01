import { gameState } from "../gamestate/game_variables.js";
import { getTile } from "../rendering/tile.js";
import { getCheckTileInteractionDialog } from "../interactions.js";
import { getHandleCombatDialog } from "../interactions.js";
import { getMaxStorage } from "../utils.js";
import { getGroupBonus } from "../utils.js";
import { getShowChoiceDialog } from "../interactions.js";
import { logEvent } from "../time_system.js";
import { updateStatus } from "../rendering.js";
import { showCharacterManagementDialog } from "./characterManagementDialog.js";

// Race emoji mapping for display
const raceEmoji = {
  Human: "👤",
  Elf: "🧝",
  Dwarf: "🧙",
  Orc: "👹",
  Goblin: "👺",
  Demon: "👿",
  Angel: "👼",
  Undead: "💀",
  Draconic: "🐉",
  Fishman: "🐠",
  Birdman: "🦅",
  // Beast races
  Wolf: "🐺",
  Bear: "🐻",
  MountainLion: "🦁",
  // Monster races
  Troll: "👹",
  Dragon: "🐉",
};

function getRaceEmoji(race) {
  return raceEmoji[race] || "👤";
}

export async function showMenu() {
  // Check if player is on a tile with location or entity
  let currentTile = getTile(gameState.px, gameState.py);
  if (currentTile.location !== "none" || currentTile.entity !== "none") {
    await getCheckTileInteractionDialog(currentTile);
    return;
  }

  let isFlora = false;

  // If there's a combat entity, handle combat first
  if (["monster", "beast"].includes(currentTile.entity)) {
    await getHandleCombatDialog(gameState.px, gameState.py, true);
    return;
  }

  // If there's a location, entity, or edible flora, show the appropriate interaction dialog
  if (["sun-flower", "iris", "tulip"].includes(currentTile.flora_type)) {
    isFlora = true;
  }

  // Otherwise show the regular menu
  let max_storage = getMaxStorage();
  let inv = `❤️‍🩹 Health: ${gameState.health} 🌟 Discoveries: ${
    gameState.discoverPoints
  } 🪙 Gold: ${gameState.gold} 🍞 Food: ${gameState.food.toFixed(
    1
  )}/${max_storage} 💧 Water: ${gameState.water.toFixed(
    1
  )}/${max_storage} ⛺ Tents: ${gameState.tents} 🧱 Mats: ${
    gameState.building_mats
  } 🪵 Wood: ${gameState.wood}`;
  let grp = gameState.group.map((g) => g.role).join(", ");
  let msg = `${inv}\n👥 Group: ${grp}`;
  let choice = await getShowChoiceDialog(msg, [
    ...(isFlora
      ? [{ type: "button", label: "🌱 Harvest flowers", value: "4" }]
      : []),
    { type: "button", label: "👥 Character Management", value: "char_mgmt" },
    { type: "button", label: "🏗️ Build camp ⛺ (5 🪵)", value: "2" },
    { type: "button", label: "🏗️ Build outpost 🏕️ (10 🧱, 10 🪵)", value: "3" },
    { type: "button", label: "❌ Close", value: "close" },
  ]);
  if (choice === "close") return;
  if (choice === "char_mgmt") {
    await showCharacterManagementDialog();
    return;
  }
  if (choice === "2" || choice === "3") {
    let costMats = choice === "2" ? 0 : 10;
    let costWood = choice === "2" ? 5 : 10;
    let type = choice === "2" ? "camp" : "outpost";
    if (gameState.building_mats >= costMats && gameState.wood >= costWood) {
      let dirStr = await getShowChoiceDialog(
        "You are building a " +
          (choice === "2" ? "⛺camp" : "🏕️outpost") +
          "\nDo you want to build it here?",
        [
          { type: "button", label: "🏗️ Confirm", value: "C" },
          { type: "button", label: "❌ Close", value: "close" },
        ]
      );
      if (dirStr === "close") return;
      const dmap = {
        C: { dx: 0, dy: 0 },
      };
      let d = dmap[dirStr];
      if (d) {
        let bx = gameState.px + d.dx;
        let by = gameState.py + d.dy;
        let btile = getTile(bx, by);
        if (btile.location === "none" && btile.entity === "none") {
          gameState.changed.push({ x: bx, y: by, type });
          // Mark the tile as visited so the change is applied
          const key = `${bx},${by}`;
          gameState.visited.set(key, getTile(bx, by));
          let tile = getTile(bx, by);
          tile.location = type;
          gameState.visited.set(key, tile);
          gameState.building_mats -= costMats;
          gameState.wood -= costWood;
          await getShowChoiceDialog(`Built ${type}! 🏗️`, [
            { type: "button", label: "OK", value: "ok" },
          ]);
          logEvent(`🏗️ Built ${type} at (${bx},${by})`);
        } else {
          await getShowChoiceDialog(
            "Cannot build there.There is something already there 🚫",
            [{ type: "button", label: "❌ Close", value: "close" }]
          );
        }
      } else {
        await getShowChoiceDialog("Invalid direction. ❓", [
          { type: "button", label: "❌ Close", value: "close" },
        ]);
      }
    } else {
      await getShowChoiceDialog("Not enough materials! ⚠️", [
        { type: "button", label: "❌ Close", value: "close" },
      ]);
    }
  }
  if (choice === "4") {
    // TODO create a proper plant system
    // TODO keep track of actions and needs time to respawn (delete from array) resources used
    // Apply plant bonus for better harvest yields
    // Harvest flowers using herbalism and survival skills
    const allCharacters = [];

    // Include player character if it exists
    if (gameState.playerCharacter) {
      allCharacters.push(gameState.playerCharacter);
    }

    // Include all group members (NPCs)
    allCharacters.push(...gameState.group);

    if (allCharacters.length === 0) {
      await getShowChoiceDialog("No characters to harvest flowers! ⚠️", [
        { type: "button", label: "OK", value: "ok" },
      ]);
      return;
    }

    let successfulHarvests = 0;
    let harvestDetails = [];

    // Each character makes a skill roll
    for (const character of allCharacters) {
      const herbalism = character.skills?.herbalism || 0;
      const survival = character.skills?.survival || 0;
      const totalSkill = herbalism + survival;

      // Roll d20 + skill total, success on 10+
      const roll = Math.floor(Math.random() * 20) + 1;
      const totalRoll = roll + totalSkill;

      if (totalRoll >= 10) {
        successfulHarvests++;
        const characterName = `${character.firstName || "Unknown"} ${
          character.lastName || ""
        }`.trim();
        const raceEmoji = getRaceEmoji(character.race);
        harvestDetails.push(
          `✅ ${raceEmoji} ${characterName}: Rolled ${roll} + ${totalSkill} = ${totalRoll} (Success!)`
        );
      } else {
        const characterName = `${character.firstName || "Unknown"} ${
          character.lastName || ""
        }`.trim();
        const raceEmoji = getRaceEmoji(character.race);
        harvestDetails.push(
          `❌ ${raceEmoji} ${characterName}: Rolled ${roll} + ${totalSkill} = ${totalRoll} (Failed)`
        );
      }
    }

    if (successfulHarvests > 0) {
      const max_storage = getMaxStorage();
      if (gameState.food + successfulHarvests <= max_storage) {
        gameState.food += successfulHarvests;
        updateStatus();

        const harvestMessage =
          `🌱 **FLOWER HARVEST RESULTS**\n\n` +
          `Total food harvested: ${successfulHarvests} unit${
            successfulHarvests > 1 ? "s" : ""
          }\n\n` +
          `**Individual Results:**\n${harvestDetails.join("\n")}`;

        await getShowChoiceDialog(harvestMessage, [
          { type: "button", label: "OK", value: "ok" },
        ]);
        logEvent(
          `🌱 Harvested flowers: ${successfulHarvests} food (${successfulHarvests}/${allCharacters.length} characters succeeded)`
        );
      } else {
        await getShowChoiceDialog("Not enough storage for harvested food! ⚠️", [
          { type: "button", label: "OK", value: "ok" },
        ]);
      }
    } else {
      const harvestMessage =
        `🌱 **FLOWER HARVEST RESULTS**\n\n` +
        `No food harvested - all characters failed their skill rolls!\n\n` +
        `**Individual Results:**\n${harvestDetails.join("\n")}`;

      await getShowChoiceDialog(harvestMessage, [
        { type: "button", label: "OK", value: "ok" },
      ]);
      logEvent(
        `🌱 Harvested flowers: 0 food (0/${allCharacters.length} characters succeeded)`
      );
    }
  }
}
