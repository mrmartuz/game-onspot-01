// Temporary test file for createCombatActionButtons
// Test if ranged attack button is disabled when player has no ranged weapon

import { createCombatActionButtons } from "./combat-ui.js";
import { isRangedWeapon } from "./equipment-combat-helpers.js";

// Test cases
console.log("=== Testing createCombatActionButtons ===\n");

// Test 1: Player with no weapon
console.log("Test 1: Player with no weapon");
const playerNoWeapon = {
  name: "Test Player",
  character: {
    equipment: {
      weapon: null
    }
  }
};
const buttons1 = createCombatActionButtons(playerNoWeapon);
const rangedButton1 = buttons1[0].buttons.find(b => b.value === "ranged_attack");
console.log("Ranged Attack button disabled:", rangedButton1.disabled);
console.log("Expected: true, Got:", rangedButton1.disabled, rangedButton1.disabled === true ? "✅" : "❌");
console.log("Weapon value:", playerNoWeapon.character.equipment.weapon);
console.log("isRangedWeapon result:", isRangedWeapon(playerNoWeapon.character.equipment.weapon));
console.log("");

// Test 2: Player with melee weapon (sword)
console.log("Test 2: Player with melee weapon (sword)");
const playerMelee = {
  name: "Test Player",
  character: {
    equipment: {
      weapon: "⚔️ [sword] iron common pristine"
    }
  }
};
const buttons2 = createCombatActionButtons(playerMelee);
const rangedButton2 = buttons2[0].buttons.find(b => b.value === "ranged_attack");
console.log("Ranged Attack button disabled:", rangedButton2.disabled);
console.log("Expected: true, Got:", rangedButton2.disabled, rangedButton2.disabled === true ? "✅" : "❌");
console.log("Weapon value:", playerMelee.character.equipment.weapon);
console.log("isRangedWeapon result:", isRangedWeapon(playerMelee.character.equipment.weapon));
console.log("");

// Test 3: Player with ranged weapon (bow)
console.log("Test 3: Player with ranged weapon (shortbow)");
const playerBow = {
  name: "Test Player",
  character: {
    equipment: {
      weapon: "🏹 [shortbow] leather common pristine"
    }
  }
};
const buttons3 = createCombatActionButtons(playerBow);
const rangedButton3 = buttons3[0].buttons.find(b => b.value === "ranged_attack");
console.log("Ranged Attack button disabled:", rangedButton3.disabled);
console.log("Expected: false, Got:", rangedButton3.disabled, rangedButton3.disabled === false ? "✅" : "❌");
console.log("Weapon value:", playerBow.character.equipment.weapon);
console.log("isRangedWeapon result:", isRangedWeapon(playerBow.character.equipment.weapon));
console.log("");

// Test 4: Player with ranged weapon (crossbow)
console.log("Test 4: Player with ranged weapon (crossbow)");
const playerCrossbow = {
  name: "Test Player",
  character: {
    equipment: {
      weapon: "🏹 [crossbow] iron common pristine"
    }
  }
};
const buttons4 = createCombatActionButtons(playerCrossbow);
const rangedButton4 = buttons4[0].buttons.find(b => b.value === "ranged_attack");
console.log("Ranged Attack button disabled:", rangedButton4.disabled);
console.log("Expected: false, Got:", rangedButton4.disabled, rangedButton4.disabled === false ? "✅" : "❌");
console.log("Weapon value:", playerCrossbow.character.equipment.weapon);
console.log("isRangedWeapon result:", isRangedWeapon(playerCrossbow.character.equipment.weapon));
console.log("");

// Test 5: Player with direct equipment (not character.equipment)
console.log("Test 5: Player with direct equipment structure (bow)");
const playerDirect = {
  name: "Test Player",
  equipment: {
    weapon: "🏹 [longbow] leather common pristine"
  }
};
const buttons5 = createCombatActionButtons(playerDirect);
const rangedButton5 = buttons5[0].buttons.find(b => b.value === "ranged_attack");
console.log("Ranged Attack button disabled:", rangedButton5.disabled);
console.log("Expected: false, Got:", rangedButton5.disabled, rangedButton5.disabled === false ? "✅" : "❌");
console.log("Weapon value:", playerDirect.equipment.weapon);
console.log("isRangedWeapon result:", isRangedWeapon(playerDirect.equipment.weapon));
console.log("");

// Test 6: No player passed (should default to disabled)
console.log("Test 6: No player passed");
const buttons6 = createCombatActionButtons();
const rangedButton6 = buttons6[0].buttons.find(b => b.value === "ranged_attack");
console.log("Ranged Attack button disabled:", rangedButton6.disabled);
console.log("Expected: true, Got:", rangedButton6.disabled, rangedButton6.disabled === true ? "✅" : "❌");
console.log("");

// Test 7: Player with throwing weapon
console.log("Test 7: Player with throwing weapon (dagger)");
const playerThrowing = {
  name: "Test Player",
  character: {
    equipment: {
      weapon: "🗡️ [dagger] iron common pristine"
    }
  }
};
const buttons7 = createCombatActionButtons(playerThrowing);
const rangedButton7 = buttons7[0].buttons.find(b => b.value === "ranged_attack");
console.log("Ranged Attack button disabled:", rangedButton7.disabled);
console.log("Weapon value:", playerThrowing.character.equipment.weapon);
console.log("isRangedWeapon result:", isRangedWeapon(playerThrowing.character.equipment.weapon));
console.log("");

// Test 8: Player with undefined weapon
console.log("Test 8: Player with undefined weapon");
const playerUndefined = {
  name: "Test Player",
  character: {
    equipment: {
      weapon: undefined
    }
  }
};
const buttons8 = createCombatActionButtons(playerUndefined);
const rangedButton8 = buttons8[0].buttons.find(b => b.value === "ranged_attack");
console.log("Ranged Attack button disabled:", rangedButton8.disabled);
console.log("Expected: true, Got:", rangedButton8.disabled, rangedButton8.disabled === true ? "✅" : "❌");
console.log("Weapon value:", playerUndefined.character.equipment.weapon);
console.log("isRangedWeapon result:", isRangedWeapon(playerUndefined.character.equipment.weapon));
console.log("");

console.log("=== Test Complete ===");
console.log("\nFull button structure for Test 1:");
console.log(JSON.stringify(buttons1, null, 2));

