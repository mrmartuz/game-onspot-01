import { CombatEntity, Monster, Ally } from "./entities.js";
import {
  calculateCharacterHealth,
  calculateCharacterDamage,
  calculateCharacterDefense,
  calculateCharacterAccuracy,
  calculateCharacterInitiative,
  progressSkill,
} from "./character-calculations.js";
import { generateMonsters, generateCreature } from "./creature-generation.js";
import {
  calculateDetectionBonus,
  generateDetectionMessage,
  calculateStealthModifier,
  calculateInitiative,
} from "./detection-stealth.js";
import { allyAI, monsterAI, generateAllies } from "./ai.js";
import { gameState } from "../../gamestate/game_variables.js";

// Main combat loop and player actions
export function getCombatStatus(allies, monsters, turnCount = 0) {
  const status = {
    turn: turnCount,
    allies: allies.map((ally) => ({
      name: ally.name,
      health: ally.currentHealth,
      maxHealth: ally.maxHealth,
      status: ally.status,
      unconscious: ally.unconscious,
      damageDealt: ally.damageDealt,
      damageTaken: ally.damageTaken,
    })),
    monsters: monsters.map((monster) => ({
      name: monster.name,
      health: monster.currentHealth,
      maxHealth: monster.maxHealth,
      status: monster.status,
      creatureType: monster.creatureType,
      rarity: monster.rarity,
      discovered: monster.discovered,
      detected: monster.detected,
    })),
    combatActive:
      allies.some((ally) => !ally.isDead() && !ally.isFleeing()) &&
      monsters.some((monster) => !monster.isDead() && !monster.isFleeing()),
    victory: monsters.every(
      (monster) => monster.isDead() || monster.isFleeing()
    ),
    defeat: allies.every((ally) => ally.isDead() || ally.isFleeing()),
  };

  return status;
}

export async function handleEnhancedCombat(ex, ey, isOnTile = false) {
  // Main combat handler function
  console.log(`Starting enhanced combat at (${ex}, ${ey})`);

  // Use the real game state
  if (!gameState) {
    console.error("Game state not available");
    return;
  }

  // Calculate detection bonus
  const detectionBonus = calculateDetectionBonus();
  console.log(`Detection bonus: ${detectionBonus}`);

  // Generate monsters based on location and detection
  const monsterCount = Math.floor(Math.random() * 3) + 1; // 1-3 monsters
  const monsterTypes = ["goblin", "orc", "wolf", "bear"];
  const selectedTypes = monsterTypes
    .sort(() => 0.5 - Math.random())
    .slice(0, monsterCount);

  const monsters = await generateMonsters(
    monsterCount,
    selectedTypes[0],
    ex,
    ey
  );
  console.log(`Generated ${monsters.length} monsters`);

  // Generate allies
  const allies = await generateAllies();
  console.log(`Generated ${allies.length} allies`);

  // Calculate stealth modifier
  const stealthModifier = calculateStealthModifier();
  console.log(`Stealth modifier: ${stealthModifier}`);

  // Generate detection message
  const detectionMessage = generateDetectionMessage(monsters);
  console.log(detectionMessage);

  // Combat loop
  let turnCount = 0;
  let combatActive = true;

  while (combatActive) {
    turnCount++;
    console.log(`\n--- Turn ${turnCount} ---`);

    // Check combat status
    const status = getCombatStatus(allies, monsters, turnCount);

    if (status.victory) {
      console.log("Victory! All monsters defeated.");
      combatActive = false;
      break;
    }

    if (status.defeat) {
      console.log("Defeat! All allies defeated.");
      combatActive = false;
      break;
    }

    // Player turn (simplified for this example)
    console.log("Player turn - choosing action...");

    // Simulate player choice
    const playerChoices = ["attack", "defend", "flee", "stealth"];
    const playerChoice =
      playerChoices[Math.floor(Math.random() * playerChoices.length)];
    console.log(`Player chooses: ${playerChoice}`);

    // Calculate initiative
    const initiative = calculateInitiative(playerChoice, stealthModifier);
    console.log(`Initiative: ${initiative}`);

    // Execute player action
    if (playerChoice === "attack") {
      const target = monsters.find((m) => !m.isDead() && !m.isFleeing());
      if (target && gameState.playerCharacter) {
        const damage = calculateCharacterDamage(gameState.playerCharacter);
        const actualDamage = target.takeDamage(damage);
        console.log(
          `Player attacks ${target.name} for ${actualDamage} damage!`
        );

        // Progress combat skills
        const primarySkill = getPrimaryWeaponSkill(gameState.playerCharacter);
        progressSkill(gameState.playerCharacter, primarySkill, 0.1);
      }
    } else if (playerChoice === "defend") {
      console.log("Player takes a defensive stance!");
    } else if (playerChoice === "flee") {
      console.log("Player attempts to flee!");
      // Implement flee logic
      combatActive = false;
      break;
    } else if (playerChoice === "stealth") {
      console.log("Player attempts to hide!");
    }

    // Ally AI turn
    if (allies.length > 0) {
      console.log("Ally AI turn...");
      allyAI(allies, monsters, turnCount);
    }

    // Monster AI turn
    if (monsters.length > 0) {
      console.log("Monster AI turn...");
      monsterAI(monsters, allies, turnCount);
    }

    // Check for combat end conditions
    const finalStatus = getCombatStatus(allies, monsters, turnCount);
    if (finalStatus.victory || finalStatus.defeat) {
      combatActive = false;
    }

    // Prevent infinite loops
    if (turnCount > 50) {
      console.log("Combat timeout - ending combat");
      combatActive = false;
    }
  }

  // Combat resolution
  const finalStatus = getCombatStatus(allies, monsters, turnCount);

  if (finalStatus.victory) {
    console.log("\n=== VICTORY ===");

    // Calculate experience and loot
    let totalExp = 0;
    let totalLoot = [];

    monsters.forEach((monster) => {
      if (monster.isDead()) {
        totalExp += monster.experienceValue;
        totalLoot = totalLoot.concat(monster.lootTable);
      }
    });

    console.log(`Experience gained: ${totalExp}`);
    console.log(`Loot found:`, totalLoot);

    // Distribute experience
    if (gameState.playerCharacter) {
      gameState.playerCharacter.experience += totalExp;
      console.log(`Player experience: ${gameState.playerCharacter.experience}`);
    }

    // Progress skills for surviving allies
    allies.forEach((ally) => {
      if (!ally.isDead() && ally.character) {
        const primarySkill = getPrimaryWeaponSkill(ally.character);
        progressSkill(ally.character, primarySkill, 0.2);
      }
    });
  } else if (finalStatus.defeat) {
    console.log("\n=== DEFEAT ===");

    // Handle defeat logic
    console.log("All allies have been defeated!");
  } else {
    console.log("\n=== COMBAT ENDED ===");
    console.log("Combat ended without clear victory or defeat");
  }

  // Update game state (experience and skills already updated above)
  console.log("Combat completed - game state updated");

  return finalStatus;
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
