import { gameState } from "../gamestate/game_variables.js";
import {
  getShowChoiceDialog,
  getHandleAnimalDialog,
  getHandleEnhancedCombatDialog,
} from "../interactions.js";
import { getGroupBonus } from "../utils.js";
import { updateStatus } from "../rendering.js";
import { logEvent } from "../time_system.js";
import { getMaxStorage } from "../utils.js";
import { updateGroupBonus } from "../utils.js";
import { getSaveGameDialog } from "../interactions.js";
import { recruitmentDialog } from "./recruitmentDialog.js";

export async function handleChoice(choice, tile) {
  if (choice === "close") {
    return; // Close dialog without further action
  }
  if (choice === "1") {
    // Leave
    return; // Just close the dialog and return to game
  }
  if (choice === "2") {
    // Rest
    // Apply health bonus for better healing
    let healthBonus = getGroupBonus("health");
    let baseHealing = 10;
    let bonusHealing = Math.floor(baseHealing * healthBonus * 0.5); // Health bonus adds up to 50% more healing
    let totalHealing = baseHealing + bonusHealing;

    gameState.health = Math.min(100, gameState.health + totalHealing);
    gameState.food -= gameState.group.length * 0.5;
    gameState.water -= gameState.group.length * 0.5;
    gameState.gold -= 2;
    updateStatus();

    let bonusText = bonusHealing > 0 ? ` (+${bonusHealing} bonus)` : "";
    await getShowChoiceDialog(
      `Rested. 😴 Healed ${totalHealing} health${bonusText}`,
      [{ type: "button", label: "OK", value: "ok" }]
    );
    logEvent(`😴 Rested and healed ${totalHealing} health${bonusText}`);
  } else if (choice === "3") {
    // Trade
    // Apply interact bonus for better trade prices
    let interactBonus = getGroupBonus("interact");
    let buyDiscount = Math.min(0.3, interactBonus * 0.3); // Up to 30% discount on buying
    let sellBonus = Math.min(0.5, interactBonus * 0.6); // Up to 50% bonus on selling

    let trading = true;
    while (trading) {
      let t = await getShowChoiceDialog("Trade options:", [
        {
          type: "button",
          label: `📥 Buy food 🍞 (${Math.floor(
            10 * (1 - buyDiscount)
          )} for 10g)`,
          value: "1",
        },
        {
          type: "button",
          label: `📥 Sell food 🍞 (10 for ${Math.floor(3 * (1 + sellBonus))}g)`,
          value: "2",
        },
        {
          type: "button",
          label: `📥 Buy water 💧 (${Math.floor(
            10 * (1 - buyDiscount)
          )} for 10g)`,
          value: "3",
        },
        {
          type: "button",
          label: `📥 Sell water 💧 (10 for ${Math.floor(
            3 * (1 + sellBonus)
          )}g)`,
          value: "4",
        },
        {
          type: "button",
          label: `📤 Sell wood 🪵 (5 for ${Math.floor(10 * (1 + sellBonus))}g)`,
          value: "5",
        },
        { type: "button", label: "📥 Buy cart 🛒 (100g for 1)", value: "6" },
        { type: "button", label: "❌ Close", value: "close" },
      ]);

      if (t === "close") {
        trading = false;
        continue;
      }

      let tradeDesc = "";
      let max_storage = getMaxStorage();
      if (t === "1") {
        if (gameState.gold >= 10 && gameState.food + 10 <= max_storage) {
          let actualFood = Math.floor(10 * (1 - buyDiscount));
          gameState.food += actualFood;
          gameState.gold -= 10;
          updateStatus();
          tradeDesc = `📥 Bought ${actualFood} food 🍞 for 10g`;
        } else {
          await getShowChoiceDialog("Not enough gold or storage! ⚠️", [
            { type: "button", label: "OK", value: "ok" },
          ]);
        }
      } else if (t === "2") {
        if (gameState.food >= 10) {
          gameState.food -= 10;
          let actualGold = Math.floor(3 * (1 + sellBonus));
          gameState.gold += actualGold;
          updateStatus();
          tradeDesc = `📥 Sold 10 food 🍞 for ${actualGold}g`;
        } else {
          await getShowChoiceDialog("Not enough food! ⚠️", [
            { type: "button", label: "OK", value: "ok" },
          ]);
        }
      } else if (t === "3") {
        if (gameState.gold >= 10 && gameState.water + 10 <= max_storage) {
          let actualWater = Math.floor(10 * (1 - buyDiscount));
          gameState.water += actualWater;
          gameState.gold -= 10;
          updateStatus();
          tradeDesc = `📥 Bought ${actualWater} water 💧 for 10g`;
        } else {
          await getShowChoiceDialog("Not enough gold or storage! ⚠️", [
            { type: "button", label: "OK", value: "ok" },
          ]);
        }
      } else if (t === "4") {
        if (gameState.water >= 10) {
          gameState.water -= 10;
          let actualGold = Math.floor(3 * (1 + sellBonus));
          gameState.gold += actualGold;
          updateStatus();
          tradeDesc = `📥 Sold 10 water 💧 for ${actualGold}g`;
        } else {
          await getShowChoiceDialog("Not enough water! ⚠️", [
            { type: "button", label: "OK", value: "ok" },
          ]);
        }
      } else if (t === "5") {
        if (gameState.wood >= 5) {
          gameState.wood -= 5;
          let actualGold = Math.floor(10 * (1 + sellBonus));
          gameState.gold += actualGold;
          updateStatus();
          tradeDesc = `📤 Sold 5 wood 🪵 for ${actualGold}g`;
        } else {
          await getShowChoiceDialog("Not enough wood! ⚠️", [
            { type: "button", label: "OK", value: "ok" },
          ]);
        }
      } else if (t === "6") {
        if (gameState.gold >= 100) {
          gameState.carts += 1;
          gameState.gold -= 100;
          tradeDesc = "📥 Bought cart 🛒 for 100g";
        } else {
          await getShowChoiceDialog("Not enough gold! ⚠️", [
            { type: "button", label: "OK", value: "ok" },
          ]);
        }
      }
      if (tradeDesc) {
        logEvent(tradeDesc);
      }
    }
  } else if (choice === "4") {
    // Recruitment Board
    const result = await recruitmentDialog.showRecruitmentDialog(
      tile.location,
      gameState.px,
      gameState.py
    );

    if (result === "recruitment_successful") {
      logEvent(`🧍🏻 Recruited character from ${tile.location}`);
      updateGroupBonus(); // Update group bonuses after recruitment
    } else if (result === "refresh") {
      // Refresh characters and show dialog again
      const refreshResult = await recruitmentDialog.showRecruitmentDialog(
        tile.location,
        gameState.px,
        gameState.py
      );
      if (refreshResult === "recruitment_successful") {
        logEvent(`🧍🏻 Recruited character from ${tile.location}`);
        updateGroupBonus();
      }
    }
  } else if (choice === "recruit_special") {
    // Special location recruitment
    const result = await recruitmentDialog.showSpecialLocationRecruitmentDialog(
      tile.location,
      gameState.px,
      gameState.py
    );

    if (result === "recruitment_successful") {
      logEvent(`🧍🏻 Recruited character from ${tile.location}`);
      updateGroupBonus();
    }
  } else if (choice === "5") {
    // Sell discoveries
    if (gameState.discoverPoints > 0) {
      gameState.gold += gameState.discoverPoints;
      logEvent(`🪙 Sold discoveries for ${gameState.discoverPoints}g`);
      gameState.discoverPoints = 0;
      updateStatus();
      await getShowChoiceDialog("Sold discoveries! 🪙", [
        { type: "button", label: "OK", value: "ok" },
      ]);
    } else {
      await getShowChoiceDialog(
        "No discoveries to sell! You Scum! Go discover some locations! ⚠️",
        [{ type: "button", label: "OK", value: "ok" }]
      );
    }
  } else if (choice === "6") {
    // Sell hunts
    if (gameState.killPoints > 0) {
      gameState.gold += gameState.killPoints;
      logEvent(`🪙 Sold hunts for ${gameState.killPoints}g`);
      gameState.killPoints = 0;
      updateStatus();
      await getShowChoiceDialog("Sold hunts! 🪙", [
        { type: "button", label: "OK", value: "ok" },
      ]);
    } else {
      await getShowChoiceDialog(
        "No hunts to sell! Go hunt some monsters or get killed or get a job! ⚠️",
        [{ type: "button", label: "OK", value: "ok" }]
      );
    }
  } else if (choice === "7") {
    await getHandleAnimalDialog(gameState.px, gameState.py);
  } else if (choice === "8") {
    await getSaveGameDialog();
  } else if (choice === "9") {
    // Handle monster cave exploration - trigger enhanced combat
    await getHandleEnhancedCombatDialog(gameState.px, gameState.py, true);
  }
}
