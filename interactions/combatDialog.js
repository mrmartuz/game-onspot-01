import { gameState } from "../gamestate/game_variables.js";
import { showChoiceDialog } from "./showDialog.js";
import { getGroupBonus } from "../utils.js";
import { updateStatus } from "../rendering.js";
import { logEvent } from "../time_system.js";
import { checkDeath } from "../utils.js";
import { getTile } from "../rendering/tile.js";
import { handleEnhancedCombatDialog } from "./combat-system/index.js";

// Stat-based combat calculations for simple combat
function calculatePlayerDamage() {
  if (!gameState.playerCharacter) return 2; // Fallback damage

  const baseDamage = 1;
  const strBonus = Math.floor((gameState.playerCharacter.stats?.STR || 8) / 2);
  const weaponSkill = getPrimaryWeaponSkill(gameState.playerCharacter);
  const skillBonus = Math.floor(weaponSkill / 10);
  const equipmentBonus = getEquipmentDamageBonus(gameState.playerCharacter);

  return Math.max(1, baseDamage + strBonus + skillBonus + equipmentBonus);
}

function calculatePlayerDefense() {
  if (!gameState.playerCharacter) return 0;

  const conBonus = Math.floor((gameState.playerCharacter.stats?.CON || 8) / 3);
  const armorSkill = gameState.playerCharacter.skills?.shieldwork || 0;
  const skillBonus = Math.floor(armorSkill / 15);
  const equipmentBonus = getEquipmentDefenseBonus(gameState.playerCharacter);

  return conBonus + skillBonus + equipmentBonus;
}

function calculatePlayerAccuracy() {
  if (!gameState.playerCharacter) return 50;

  const baseAccuracy = 50;
  const dexBonus = (gameState.playerCharacter.stats?.DEX || 8) * 2;
  const weaponSkill = getPrimaryWeaponSkill(gameState.playerCharacter);
  const skillBonus = weaponSkill;
  const equipmentBonus = getEquipmentAccuracyBonus(gameState.playerCharacter);

  return Math.min(95, baseAccuracy + dexBonus + skillBonus + equipmentBonus);
}

// Helper functions (simplified versions from enhanced combat)
function getPrimaryWeaponSkill(character) {
  const skills = character.skills || {};
  const weapon = character.equipment?.weapon || "";

  const weaponType = weapon.toLowerCase();

  // Map weapon types to specific skills - order matters for overlapping names
  if (
    weaponType.includes("greatsword") ||
    weaponType.includes("claymore") ||
    weaponType.includes("zweihander")
  )
    return skills.great_swords || 0;
  if (weaponType.includes("sword")) return skills.swords || 0;
  if (
    weaponType.includes("greataxe") ||
    weaponType.includes("battleaxe") ||
    weaponType.includes("vrakgul-axe")
  )
    return skills.great_axes || 0;
  if (weaponType.includes("axe")) return skills.axes || 0;
  if (
    weaponType.includes("spear") ||
    weaponType.includes("halberd") ||
    weaponType.includes("polearm") ||
    weaponType.includes("staff") ||
    weaponType.includes("quarterstaff") ||
    weaponType.includes("scythe") ||
    weaponType.includes("pike") ||
    weaponType.includes("glaive")
  )
    return skills.polearms || 0;
  if (
    weaponType.includes("maul") ||
    weaponType.includes("great-hammer") ||
    weaponType.includes("gormith-hammer")
  )
    return skills.great_hammers || 0;
  if (
    weaponType.includes("mace") ||
    weaponType.includes("club") ||
    weaponType.includes("warhammer") ||
    weaponType.includes("flail") ||
    weaponType.includes("morningstar")
  )
    return skills.hammers || 0;
  if (weaponType.includes("crossbow")) return skills.crossbows || 0;
  if (weaponType.includes("bow")) return skills.bows || 0;
  if (
    weaponType.includes("dagger") ||
    weaponType.includes("javelin") ||
    weaponType.includes("throwing") ||
    weaponType.includes("sling") ||
    weaponType.includes("skrith-nedle")
  )
    return skills.throwing || 0;
  if (weaponType.includes("shield")) return skills.shields || 0;

  return skills.unarmed || 0;
}

function getEquipmentDamageBonus(character) {
  const equipment = character.equipment || {};
  let bonus = 0;

  const weapon = equipment.weapon || "";
  if (weapon.includes("mithril")) bonus += 2;
  else if (weapon.includes("steel")) bonus += 1;
  else if (weapon.includes("silver")) bonus += 1;

  return bonus;
}

function getEquipmentDefenseBonus(character) {
  const equipment = character.equipment || {};
  let bonus = 0;

  const armor = equipment.armor || "";
  if (armor.includes("plate")) bonus += 4;
  else if (armor.includes("chainmail")) bonus += 3;
  else if (armor.includes("leather")) bonus += 1;

  const shield = equipment.secondHand || "";
  if (shield.includes("shield")) bonus += 2;

  return bonus;
}

function getEquipmentAccuracyBonus(character) {
  const equipment = character.equipment || {};
  let bonus = 0;

  const weapon = equipment.weapon || "";
  if (weapon.includes("mithril")) bonus += 10;
  else if (weapon.includes("steel")) bonus += 5;
  else if (weapon.includes("iron")) bonus += 2;

  return bonus;
}

// Skill progression for simple combat
function progressCombatSkill(skillName) {
  if (!gameState.playerCharacter || !gameState.playerCharacter.skills) return;

  const currentLevel = gameState.playerCharacter.skills[skillName] || 0;
  const progressionAmount = 0.01; // Same rate as enhanced combat
  const newLevel = Math.min(99.99, currentLevel + progressionAmount);

  gameState.playerCharacter.skills[skillName] = newLevel;

  `${
    gameState.playerCharacter.firstName
  }'s ${skillName} increased from ${currentLevel.toFixed(
    2
  )} to ${newLevel.toFixed(2)}`;
}

export async function handleCombat(ex, ey, isOnTile = false) {
  // Use the enhanced combat system for monsters and beasts
  let tile = getTile(ex, ey);
  let entity = tile.entity;

  if (entity === "monster" || entity === "beast") {
    return await handleEnhancedCombatDialog(ex, ey, isOnTile);
  }

  // Fallback to simple combat for other entities (now stat-based)
  let input = await showChoiceDialog(`Hostile ${entity} at (${ex},${ey})!`, [
    { type: "button", label: "⚔️ Attack", value: "1" },
    { type: "button", label: "🌬️ Flee", value: "2" },
  ]);

  if (input === "2") {
    if (isOnTile) {
      gameState.px = gameState.prevx;
      gameState.py = gameState.prevy;
      await showChoiceDialog("Fled back. 😵‍💫", [
        { type: "button", label: "OK", value: "ok" },
      ]);
    } else {
      await showChoiceDialog("Fled, staying put. 😅", [
        { type: "button", label: "OK", value: "ok" },
      ]);
    }
    return false;
  }

  // Stat-based combat resolution
  const playerAccuracy = calculatePlayerAccuracy();
  const hitRoll = Math.random() * 100;

  if (hitRoll <= playerAccuracy) {
    // Player hits - calculate damage
    const playerDamage = calculatePlayerDamage();

    await showChoiceDialog(`Victory! You dealt ${playerDamage} damage! 🏆`, [
      { type: "button", label: "OK", value: "ok" },
    ]);

    gameState.killed.add(`${ex},${ey}`);
    gameState.killPoints += 5;
    updateStatus();
    logEvent(`🏆 Defeated ${entity} at (${ex},${ey})`);

    // Progress combat skills
    if (gameState.playerCharacter) {
      const weaponSkill = getPrimaryWeaponSkill(gameState.playerCharacter);
      progressCombatSkill(weaponSkill);
    }

    return true;
  } else {
    // Player misses - take damage
    const playerDefense = calculatePlayerDefense();
    const baseDamage = isOnTile ? 20 : 10;
    const finalDamage = Math.max(1, baseDamage - playerDefense);

    await showChoiceDialog(`Defeat! You took ${finalDamage} damage. 🤕`, [
      { type: "button", label: "OK", value: "ok" },
    ]);

    gameState.health -= finalDamage;
    updateStatus();
    logEvent(`🤕 Defeated by ${entity} at (${ex},${ey})`);

    const death = await checkDeath();
    if (death === "health") {
      await showChoiceDialog("You died fighting! ☠️", [
        { type: "button", label: "🔄 Restart Game", value: "reloadGame" },
      ]);
      location.reload();
    } else if (death === "gold") {
      await showChoiceDialog("You paid your debt with your life! ☠️", [
        { type: "button", label: "🔄 Restart Game", value: "reloadGame" },
      ]);
      location.reload();
    }
    return false;
  }
}

export async function checkAdjacentMonsters() {
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue;
      let tile = getTile(gameState.px + dx, gameState.py + dy);
      if (tile.entity === "monster" || tile.entity === "beast") {
        await handleCombat(gameState.px + dx, gameState.py + dy);
      }
    }
  }
}
