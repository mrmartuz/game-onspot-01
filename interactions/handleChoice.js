import { gameState } from "../gamestate/game_variables.js";
import {
  getShowChoiceDialog,
  getHandleAnimalDialog,
  getHandleEnhancedCombatDialog,
} from "../interactions.js";
import { getGroupBonus } from "../utils.js";
import { updateStatus } from "../rendering.js";
import { logEvent, advanceGameTime } from "../time_system.js";
import { getMaxStorage } from "../utils.js";
import { updateGroupBonus } from "../utils.js";
import { getSaveGameDialog } from "../interactions.js";
import { recruitmentDialog } from "./recruitmentDialog.js";
import {
  calculateHeadValue,
  removeHeadFromInventory,
  getAllHeadsForDisplay,
} from "./loot-system.js";
import {
  getRaceEmoji,
  raceEmoji,
  classEmoji,
  sexEmoji,
} from "../gamestate/emoji-database.js";
import { parseEquipmentString, calculateItemSellValue } from "./equipment.js";
import {
  getGroupInventory,
  removeFromGroupInventory,
} from "./character/characterManagement-system/utils/utils-group-inventory.js";
import { raceDatabase } from "./character/races.js";
import { classDatabase } from "./combat/classes.js";

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
    const { beforeTime, afterTime } = advanceGameTime(8);

    // Apply health bonus for better healing
    let healthBonus = getGroupBonus("health");
    let baseHealing = 10;
    let bonusHealing = Math.floor(baseHealing * healthBonus * 0.5); // Health bonus adds up to 50% more healing
    let totalHealing = baseHealing + bonusHealing;

    // Heal player character
    if (gameState.playerCharacter) {
      gameState.playerCharacter.health.current = Math.min(
        gameState.playerCharacter.health.max,
        gameState.playerCharacter.health.current + totalHealing
      );
      gameState.health = gameState.playerCharacter.health.current; // Update legacy health
    } else {
      // Fallback for legacy system
      gameState.health = Math.min(100, gameState.health + totalHealing);
    }

    // Heal all group members
    gameState.group.forEach((member) => {
      if (member.health && member.health.current < member.health.max) {
        member.health.current = Math.min(
          member.health.max,
          member.health.current + totalHealing
        );
      }
    });

    updateStatus();

    const timePassedText = `Time passed: (${beforeTime.getHours()}:00 -> ${afterTime.getHours()}:00)`;
    let bonusText = bonusHealing > 0 ? ` (+${bonusHealing} bonus)` : "";

    await getShowChoiceDialog("", [
      {
        type: "image",
        src: "images/rest-camp-01.png",
        alt: "Rest",
        maxWidth: "100%",
        marginBottom: "15px",
      },
      {
        type: "message",
        label: `Rested. 😴 Healed ${totalHealing} health${bonusText}\n${timePassedText}`,
        value: "",
      },
      { type: "button", label: "OK", value: "ok" },
    ]);
    logEvent(
      `😴 Rested and healed ${totalHealing} health${bonusText} (2 hours)`
    );
  } else if (choice === "3") {
    // Trade
    // Apply interact bonus for better trade prices
    let interactBonus = getGroupBonus("interact");
    let buyDiscount = Math.min(0.3, interactBonus * 0.3); // Up to 30% discount on buying
    let sellBonus = Math.min(0.5, interactBonus * 0.6); // Up to 50% bonus on selling

    let trading = true;
    while (trading) {
      // Determine location type for pricing
      const locationType = tile?.location || "village";

      // Create trade options as button grid (2 columns)
      const tradeButtons = [
        {
          label: `📥 Buy food 🍞 (${Math.floor(
            10 * (1 - buyDiscount)
          )} for 10g)`,
          value: "1",
        },
        {
          label: `📥 Sell food 🍞 (10 for ${Math.floor(3 * (1 + sellBonus))}g)`,
          value: "2",
        },
        {
          label: `📥 Buy water 💧 (${Math.floor(
            10 * (1 - buyDiscount)
          )} for 10g)`,
          value: "3",
        },
        {
          label: `📥 Sell water 💧 (10 for ${Math.floor(
            3 * (1 + sellBonus)
          )}g)`,
          value: "4",
        },
        {
          label: `📥 Buy wood 🪵 (5 for 10g)`,
          value: "buy_wood",
        },
        {
          label: `📤 Sell wood 🪵 (5 for ${Math.floor(10 * (1 + sellBonus))}g)`,
          value: "5",
        },
        { label: "📥 Buy cart 🛒 (100g for 1)", value: "6" },
        {
          label: `📤 Sell cart 🛒 (1 for ${Math.floor(50 * (1 + sellBonus))}g)`,
          value: "sell_cart",
        },
      ];

      // Add monster head selling options if available
      if (gameState.monsterHeads.length > 0) {
        tradeButtons.push({
          label: "🏺 Sell Monster Heads",
          value: "heads",
        });
        tradeButtons.push({
          label: "🏺 Sell All Monster Heads",
          value: "sell_all_heads",
        });
      } else {
        tradeButtons.push({
          label: "🏺 Sell Monster Heads",
          value: "heads",
          disabled: true,
        });
        tradeButtons.push({
          label: "🏺 Sell All Monster Heads",
          value: "sell_all_heads",
          disabled: true,
        });
      }

      // Check if there are items to sell
      const allSellableItems = getAllSellableItems();
      const groupInventoryItems = getGroupInventory().filter(
        (item) => calculateItemSellValue(item) > 0
      );
      if (allSellableItems.length > 0) {
        tradeButtons.push({
          label: `📦 Sell Items (${allSellableItems.length} available)`,
          value: "sell_items",
        });
        if (groupInventoryItems.length > 0) {
          tradeButtons.push({
            label: `📦 Auto Sell All Items (${groupInventoryItems.length} unequipped)`,
            value: "sell_all_items",
          });
        } else {
          tradeButtons.push({
            label: "📦 Auto Sell All Items",
            value: "sell_all_items",
            disabled: true,
          });
        }
      } else {
        tradeButtons.push({
          label: "📦 Sell Items",
          value: "sell_items",
          disabled: true,
        });
        tradeButtons.push({
          label: "📦 Auto Sell All Items",
          value: "sell_all_items",
          disabled: true,
        });
      }

      const tradeComponents = [
        {
          type: "image",
          src: "images/market-03.png",
          alt: "Market",
          maxWidth: "100%",
          marginBottom: "15px",
        },
        {
          type: "button_grid",
          columns: 2,
          textSize: "12px",
          gap: "2px",
          buttons: tradeButtons,
        },
      ];
      const components = [];
      const closeButton = {
        type: "button",
        label: "❌ Close",
        value: "close",
      };
      components.push(...tradeComponents);
      components.push(closeButton);
      let t = await getShowChoiceDialog("", components);

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
      } else if (t === "buy_wood") {
        if (gameState.gold >= 10) {
          gameState.wood += 5;
          gameState.gold -= 10;
          updateStatus();
          tradeDesc = "📥 Bought 5 wood 🪵 for 10g";
        } else {
          await getShowChoiceDialog("Not enough gold! ⚠️", [
            { type: "button", label: "OK", value: "ok" },
          ]);
        }
      } else if (t === "sell_cart") {
        if (gameState.carts >= 1) {
          gameState.carts -= 1;
          let actualGold = Math.floor(50 * (1 + sellBonus));
          gameState.gold += actualGold;
          updateStatus();
          tradeDesc = `📤 Sold 1 cart 🛒 for ${actualGold}g`;
        } else {
          await getShowChoiceDialog("Not enough carts! ⚠️", [
            { type: "button", label: "OK", value: "ok" },
          ]);
        }
      } else if (t === "sell_items") {
        // Handle item selling
        await handleItemSelling(locationType, sellBonus);
        tradeDesc = "Item selling completed";
      } else if (t === "sell_all_items") {
        // Auto sell all unequipped items
        await sellAllGroupInventoryItems(locationType, sellBonus);
        tradeDesc = "Auto-sold all inventory items";
      } else if (t === "heads") {
        // Handle monster head selling
        await handleMonsterHeadSelling(locationType, interactBonus);
        tradeDesc = "Monster head trading completed";
      } else if (t === "sell_all_heads") {
        // Auto sell all monster heads
        await sellAllMonsterHeads(locationType, interactBonus);
        tradeDesc = "Auto-sold all monster heads";
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

// Auto sell all monster heads
async function sellAllMonsterHeads(locationType, interactBonus) {
  if (gameState.monsterHeads.length === 0) {
    await getShowChoiceDialog("You have no monster heads to sell!", [
      { type: "button", label: "OK", value: "ok" },
    ]);
    return;
  }

  let totalGold = 0;
  const headCount = gameState.monsterHeads.length;
  const headsToSell = [...gameState.monsterHeads]; // Copy array to avoid modification during iteration

  // Calculate total value and remove all heads
  headsToSell.forEach((head) => {
    const price = calculateHeadValue(head, locationType, interactBonus);
    totalGold += price;
  });

  // Remove all heads from inventory
  gameState.monsterHeads = [];
  gameState.gold += totalGold;
  updateStatus();

  const summary = `✅ Sold all ${headCount} monster head${
    headCount > 1 ? "s" : ""
  } for ${totalGold}g`;
  await getShowChoiceDialog(summary, [
    { type: "button", label: "OK", value: "ok" },
  ]);
  logEvent(summary);
}

// Auto sell all unequipped items from group inventory
async function sellAllGroupInventoryItems(locationType, sellBonus) {
  const groupInventory = getGroupInventory();
  const sellableItems = groupInventory.filter(
    (item) => calculateItemSellValue(item) > 0
  );

  if (sellableItems.length === 0) {
    await getShowChoiceDialog("You have no unequipped items to sell!", [
      { type: "button", label: "OK", value: "ok" },
    ]);
    return;
  }

  let totalGold = 0;
  let soldCount = 0;

  // Sell all items
  sellableItems.forEach((item) => {
    const baseValue = calculateItemSellValue(item);
    const sellValue = Math.floor(baseValue * (1 + sellBonus));
    totalGold += sellValue;
    removeFromGroupInventory(item);
    soldCount++;
  });

  gameState.gold += totalGold;
  updateStatus();

  const summary = `✅ Sold ${soldCount} unequipped item${
    soldCount > 1 ? "s" : ""
  } for ${totalGold}g`;
  await getShowChoiceDialog(summary, [
    { type: "button", label: "OK", value: "ok" },
  ]);
  logEvent(summary);
}

// Handle monster head selling dialog
async function handleMonsterHeadSelling(locationType, interactBonus) {
  if (gameState.monsterHeads.length === 0) {
    await getShowChoiceDialog("You have no monster heads to sell!", [
      { type: "button", label: "OK", value: "ok" },
    ]);
    return;
  }

  let selling = true;
  while (selling) {
    const headsForDisplay = getAllHeadsForDisplay();
    let sellMessage = `🏺 **SELL MONSTER HEADS**\n\n`;
    sellMessage += `Location: ${locationType}\n`;
    sellMessage += `Interact Bonus: +${(interactBonus * 100).toFixed(0)}%\n\n`;
    sellMessage += `Available heads:\n`;

    const sellOptions = [];

    headsForDisplay.forEach((headData, index) => {
      const price = calculateHeadValue(
        headData.head,
        locationType,
        interactBonus
      );
      sellMessage += `${headData.text} - ${price}g\n`;

      sellOptions.push({
        type: "button",
        label: `${headData.text} - ${price}g`,
        value: `sell_${index}`,
      });
    });

    sellOptions.push({ type: "button", label: "❌ Close", value: "close" });

    const sellChoice = await getShowChoiceDialog(sellMessage, sellOptions);

    if (sellChoice === "close") {
      selling = false;
      continue;
    }

    if (sellChoice.startsWith("sell_")) {
      const headIndex = parseInt(sellChoice.split("_")[1]);
      const head = gameState.monsterHeads[headIndex];

      if (head) {
        const price = calculateHeadValue(head, locationType, interactBonus);
        gameState.gold += price;
        removeHeadFromInventory(headIndex);

        const emoji = getRaceEmoji(head.race);
        const sellSummary = `✅ Sold ${emoji} ${head.race} Head for ${price}g`;
        await getShowChoiceDialog(sellSummary, [
          { type: "button", label: "OK", value: "ok" },
        ]);
        logEvent(sellSummary);

        // If no more heads, exit selling loop
        if (gameState.monsterHeads.length === 0) {
          selling = false;
        }
      }
    }
  }
}

// Format character identity display string (similar to createCharacterIdentityDisplay)
function formatCharacterIdentity(character) {
  if (!character) return "Unknown";

  // Get race and class data
  const raceData = raceDatabase[character.race];
  const raceRegion = raceData ? raceData.region : "Unknown";
  const raceEmojiIcon = raceEmoji[character.race] || "👤";

  const classData = classDatabase[character.class];
  const className = classData ? classData.name : "Unknown";
  const classEmojiIcon = classEmoji[character.class] || "❓";

  // Format: RaceEmoji FirstName LastName | Sex SexEmoji RaceRegion RaceEmoji ClassName ClassEmoji lvl.X
  const firstName = character.firstName || "";
  const lastName = character.lastName || "";
  const fullName =
    firstName && lastName
      ? `${raceEmojiIcon} ${firstName.toUpperCase()} ${lastName.toUpperCase()}`
      : character.name || "Unknown";

  const details = `${character.sex || ""} ${
    sexEmoji[character.sex] || ""
  } ${raceRegion} ${raceEmojiIcon} ${className} ${classEmojiIcon} lvl.${
    character.level || 1
  }`;

  return `${fullName} | ${details}`;
}

// Get all sellable items organized by character ownership
// Returns array of { type: 'character' | 'inventory', character?: object, name: string, items: [{ itemString, slotKey? }] }
function getOrganizedSellableItems() {
  const organized = [];

  // Get items from group inventory (unequipped) - show first
  const groupInventory = getGroupInventory();
  const inventoryItems = [];
  groupInventory.forEach((item) => {
    const sellValue = calculateItemSellValue(item);
    if (sellValue > 0) {
      inventoryItems.push({ itemString: item });
    }
  });

  if (inventoryItems.length > 0) {
    organized.push({
      type: "inventory",
      name: "Group Inventory",
      items: inventoryItems,
    });
  }

  // Get equipped items from all characters - show after inventory
  const allCharacters = [];
  if (gameState.playerCharacter) {
    allCharacters.push({
      character: gameState.playerCharacter,
      name: formatCharacterIdentity(gameState.playerCharacter),
    });
  }
  gameState.group.forEach((char) => {
    allCharacters.push({
      character: char,
      name: formatCharacterIdentity(char),
    });
  });

  allCharacters.forEach(({ character, name }) => {
    if (character.equipment) {
      const characterItems = [];
      Object.entries(character.equipment).forEach(([slotKey, item]) => {
        // Add valid equipment items (not null, not special markers like "(2h-grip)" or "(empty)")
        if (item && typeof item === "string" && !item.startsWith("(")) {
          const sellValue = calculateItemSellValue(item);
          if (sellValue > 0) {
            characterItems.push({ itemString: item, slotKey });
          }
        }
      });

      if (characterItems.length > 0) {
        organized.push({
          type: "character",
          character: character,
          name: name,
          items: characterItems,
        });
      }
    }
  });

  return organized;
}

// Get all sellable items (flat list) - kept for backward compatibility
function getAllSellableItems() {
  const organized = getOrganizedSellableItems();
  const allItems = [];

  organized.forEach((section) => {
    section.items.forEach(({ itemString }) => {
      allItems.push(itemString);
    });
  });

  return allItems;
}

// Handle item selling dialog
async function handleItemSelling(locationType, sellBonus) {
  const organizedItems = getOrganizedSellableItems();

  if (organizedItems.length === 0) {
    await getShowChoiceDialog("You have no items to sell!", [
      { type: "button", label: "OK", value: "ok" },
    ]);
    return;
  }

  let selling = true;
  while (selling) {
    // Re-fetch items in case inventory changed
    const currentOrganized = getOrganizedSellableItems();

    if (currentOrganized.length === 0) {
      await getShowChoiceDialog("No more items to sell!", [
        { type: "button", label: "OK", value: "ok" },
      ]);
      selling = false;
      continue;
    }

    let sellMessage = `📦 **SELL ITEMS**\n\n`;

    const sellButtons = [];
    const itemMap = []; // Maps index to { itemString, character, slotKey, type }

    currentOrganized.forEach((section) => {
      // Add character/inventory section header (disabled button)
      sellButtons.push({
        label: `${section.name}`,
        value: `header_${section.type}`,
        disabled: true,
      });

      // Add items for this section
      section.items.forEach(({ itemString, slotKey }) => {
        const baseValue = calculateItemSellValue(itemString);
        const sellValue = Math.floor(baseValue * (1 + sellBonus));

        // Truncate long item names for display
        const parsed = parseEquipmentString(itemString);
        let displayName = itemString;
        if (parsed) {
          // Show item type and material
          displayName = `${parsed.type} (${parsed.material})`;
        }
        if (displayName.length > 40) {
          displayName = displayName.substring(0, 37) + "...";
        }

        const index = itemMap.length;
        itemMap.push({
          itemString,
          character: section.character || null,
          slotKey: slotKey || null,
          type: section.type,
        });

        sellButtons.push({
          label: `  ${displayName} - ${sellValue}g`,
          value: `sell_item_${index}`,
        });
      });
    });

    sellButtons.push({
      label: "❌ Close",
      value: "close",
    });

    const sellComponents = [
      {
        type: "button_grid",
        columns: 1,
        textSize: "11px",
        gap: "2px",
        buttons: sellButtons,
      },
    ];

    const sellChoice = await getShowChoiceDialog(sellMessage, sellComponents);

    if (sellChoice === "close") {
      selling = false;
      continue;
    }

    if (sellChoice.startsWith("sell_item_")) {
      const itemIndex = parseInt(sellChoice.split("_")[2]);
      const itemData = itemMap[itemIndex];

      if (itemData && itemData.itemString) {
        const baseValue = calculateItemSellValue(itemData.itemString);
        const sellValue = Math.floor(baseValue * (1 + sellBonus));

        let removed = false;

        // Remove based on item source
        if (itemData.type === "inventory") {
          // Remove from group inventory
          removed = removeFromGroupInventory(itemData.itemString);
        } else if (itemData.character && itemData.slotKey) {
          // Remove from equipped items
          if (itemData.character.equipment) {
            if (
              itemData.character.equipment[itemData.slotKey] ===
              itemData.itemString
            ) {
              itemData.character.equipment[itemData.slotKey] = null;
              // Handle 2h weapon cleanup
              if (
                itemData.slotKey === "weapon" &&
                itemData.character.equipment.secondHand === "(2h-grip)"
              ) {
                itemData.character.equipment.secondHand = null;
              }
              removed = true;
            }
          }
        }

        if (removed) {
          gameState.gold += sellValue;
          updateStatus();

          const parsed = parseEquipmentString(itemData.itemString);
          let displayName = itemData.itemString;
          if (parsed) {
            displayName = `${parsed.type} (${parsed.material})`;
          }
          if (displayName.length > 40) {
            displayName = displayName.substring(0, 37) + "...";
          }

          const sellSummary = `✅ Sold ${displayName} for ${sellValue}g`;
          await getShowChoiceDialog(sellSummary, [
            { type: "button", label: "OK", value: "ok" },
          ]);
          logEvent(sellSummary);
        }
      }
    }
  }
}
