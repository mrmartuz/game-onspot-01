import {
  calculateCharacterDamage,
  calculateCharacterDefense,
  calculateCharacterAccuracy,
  progressSkill,
} from "./character-calculations.js";
import { gameState } from "../../gamestate/game_variables.js";
import { Ally } from "./entities.js";

// AI behavior functions for combat system
export async function generateAllies() {
  // Generate AI-controlled allies for combat from gameState.group
  const allies = [];

  // Add player character as first ally
  if (gameState.playerCharacter) {
    const playerAlly = new Ally(gameState.playerCharacter);

    // Set player-specific properties
    playerAlly.id = gameState.playerCharacter.id;
    playerAlly.isPlayer = true;
    playerAlly.aiPersonality = "balanced";

    allies.push(playerAlly);
  }

  // Add group members as allies
  if (gameState.group && gameState.group.length > 0) {
    for (const character of gameState.group) {
      const ally = new Ally(character);

      // Set character-specific properties
      ally.id = character.id;
      ally.isPlayer = false;
      ally.aiPersonality = determineAIPersonality(character);

      allies.push(ally);
    }
  }

  return allies;
}

export function allyAI(allies, monsters, turnCount = 0) {
  // AI behavior for ally characters
  allies.forEach((ally) => {
    if (ally.isDead() || ally.isFleeing()) {
      return; // Skip dead or fleeing allies
    }

    // Determine AI behavior based on personality
    let target = null;
    let action = "defend";

    switch (ally.aiPersonality) {
      case "aggressive":
        target = findWeakestTarget(monsters);
        action = "attack";
        break;
      case "defensive":
        target = findStrongestTarget(monsters);
        action = "defend";
        break;
      case "balanced":
        target = findBalancedTarget(monsters);
        action = Math.random() < 0.5 ? "attack" : "defend";
        break;
      default:
        action = "defend";
    }

    // Execute action
    if (action === "attack" && target) {
      executeAttack(ally, target);
    } else if (action === "defend") {
      executeDefend(ally);
    }

    // Update turn actions
    ally.turnActions.push({
      action: action,
      target: target,
      turn: turnCount,
    });
  });
}

export function monsterAI(monsters, allies, turnCount = 0) {
  // AI behavior for monster characters
  monsters.forEach((monster) => {
    if (monster.isDead() || monster.isFleeing()) {
      return; // Skip dead or fleeing monsters
    }

    // Determine AI behavior based on creature type
    let target = null;
    let action = "attack";

    switch (monster.aiBehavior) {
      case "aggressive":
        target = findWeakestTarget(allies);
        action = "attack";
        break;
      case "defensive":
        target = findStrongestTarget(allies);
        action = "defend";
        break;
      case "cunning":
        target = findBalancedTarget(allies);
        action = Math.random() < 0.7 ? "attack" : "defend";
        break;
      default:
        action = "attack";
        target = findRandomTarget(allies);
    }

    // Execute action
    if (action === "attack" && target) {
      executeAttack(monster, target);
    } else if (action === "defend") {
      executeDefend(monster);
    }

    // Update turn actions
    monster.turnActions.push({
      action: action,
      target: target,
      turn: turnCount,
    });
  });
}

// Helper functions for AI behavior
function findWeakestTarget(targets) {
  if (!targets || targets.length === 0) return null;

  return targets.reduce((weakest, current) => {
    if (current.isDead() || current.isFleeing()) return weakest;
    if (!weakest) return current;

    const currentHealth = current.currentHealth / current.maxHealth;
    const weakestHealth = weakest.currentHealth / weakest.maxHealth;

    return currentHealth < weakestHealth ? current : weakest;
  }, null);
}

function findStrongestTarget(targets) {
  if (!targets || targets.length === 0) return null;

  return targets.reduce((strongest, current) => {
    if (current.isDead() || current.isFleeing()) return strongest;
    if (!strongest) return current;

    const currentThreat = calculateThreatLevel(current);
    const strongestThreat = calculateThreatLevel(strongest);

    return currentThreat > strongestThreat ? current : strongest;
  }, null);
}

function findBalancedTarget(targets) {
  if (!targets || targets.length === 0) return null;

  const validTargets = targets.filter(
    (target) => !target.isDead() && !target.isFleeing()
  );

  if (validTargets.length === 0) return null;

  // Find target with medium threat level
  const sortedTargets = validTargets.sort((a, b) => {
    const threatA = calculateThreatLevel(a);
    const threatB = calculateThreatLevel(b);
    return threatA - threatB;
  });

  const middleIndex = Math.floor(sortedTargets.length / 2);
  return sortedTargets[middleIndex];
}

function findRandomTarget(targets) {
  if (!targets || targets.length === 0) return null;

  const validTargets = targets.filter(
    (target) => !target.isDead() && !target.isFleeing()
  );

  if (validTargets.length === 0) return null;

  return validTargets[Math.floor(Math.random() * validTargets.length)];
}

function calculateThreatLevel(entity) {
  // Calculate threat level based on health, damage, and defense
  const healthRatio = entity.currentHealth / entity.maxHealth;
  const damage = entity.character
    ? calculateCharacterDamage(entity.character)
    : entity.getDamage();
  const defense = entity.character
    ? calculateCharacterDefense(entity.character)
    : entity.getDefense();

  return healthRatio * 0.4 + damage * 0.3 + defense * 0.3;
}

function executeAttack(attacker, target) {
  // Execute attack action
  const damage = attacker.character
    ? calculateCharacterDamage(attacker.character)
    : attacker.getDamage();

  const accuracy = attacker.character
    ? calculateCharacterAccuracy(attacker.character)
    : attacker.getAccuracy();

  const defense = target.character
    ? calculateCharacterDefense(target.character)
    : target.getDefense();

  // Calculate hit chance
  const hitChance = Math.max(5, Math.min(95, accuracy - defense + 50));
  const hitRoll = Math.random() * 100;

  if (hitRoll <= hitChance) {
    // Hit!
    const actualDamage = target.takeDamage(damage);
    attacker.damageDealt += actualDamage;

    console.log(
      `${attacker.name} attacks ${target.name} for ${actualDamage} damage!`
    );

    // Progress combat skills
    if (attacker.character) {
      const primarySkill = getPrimaryWeaponSkill(attacker.character);
      progressSkill(attacker.character, primarySkill, 0.1);
    }
  } else {
    // Miss!
    console.log(`${attacker.name} attacks ${target.name} but misses!`);
  }
}

function executeDefend(entity) {
  // Execute defend action
  const defense = entity.character
    ? calculateCharacterDefense(entity.character)
    : entity.getDefense();

  // Defend action provides temporary defense bonus
  entity.temporaryDefenseBonus = Math.floor(defense * 0.5);

  console.log(`${entity.name} takes a defensive stance!`);
}

function getPrimaryWeaponSkill(character) {
  // Determine primary weapon skill based on equipment
  const weapon = character.equipment?.weapon;
  if (!weapon) return "unarmed";

  const weaponType = weapon.toLowerCase();

  // Map weapon types to skills
  if (weaponType.includes("sword")) return "swordfighting";
  if (weaponType.includes("bow") || weaponType.includes("arrow"))
    return "archery";
  if (weaponType.includes("spear") || weaponType.includes("polearm"))
    return "polearms";
  if (weaponType.includes("axe")) return "swordfighting";
  if (weaponType.includes("mace") || weaponType.includes("club"))
    return "swordfighting";
  if (weaponType.includes("dagger")) return "swordfighting";

  return "unarmed";
}

// Helper function to determine AI personality based on character class
function determineAIPersonality(character) {
  const className = character.class?.toLowerCase();

  switch (className) {
    case "fighter":
    case "brute":
    case "paladin":
      return "aggressive";
    case "ranger":
    case "hunter":
    case "archer":
      return "balanced";
    case "cleric":
    case "herbalist":
    case "alchemist":
      return "defensive";
    case "rogue":
    case "assassin":
      return "cunning";
    default:
      return "balanced";
  }
}
