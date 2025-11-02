import { CombatEntity, Monster, Ally } from "./entities.js";
import {
  calculateCharacterHealth,
  calculateCharacterDamage,
  calculateCharacterDefense,
  calculateCharacterAccuracy,
  calculateCharacterInitiative,
  progressSkill,
  getPrimaryWeaponSkill,
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
import {
  getMonsterTypesByTier,
  determineMonsterTier,
  getMonsterCountForTier,
} from "./databases/monster-tiers.js";

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
      allies.some(
        (ally) => !ally.isDead() && !ally.isFleeing() && !ally.isUnconscious()
      ) &&
      monsters.some(
        (monster) =>
          !monster.isDead() && !monster.isFleeing() && !monster.isUnconscious()
      ),
    victory: monsters.every(
      (monster) => monster.isDead() || monster.isFleeing()
    ),
    defeat: allies.every(
      (ally) => ally.isDead() || ally.isFleeing() || ally.isUnconscious()
    ),
  };

  return status;
}

export async function handleEnhancedCombat(ex, ey, isOnTile = false) {
  // Main combat handler function
  `Starting enhanced combat at (${ex}, ${ey})`;

  // Use the real game state
  if (!gameState) {
    console.error("Game state not available");
    return;
  }

  // Calculate detection bonus
  const detectionBonus = calculateDetectionBonus();
  `Detection bonus: ${detectionBonus}`;

  // // Generate monsters based on location and detection
  // const baseMonsterCount = Math.floor(Math.random() * 3) + 1; // 1-3 monsters
  // const groupMemberCount = gameState.group ? gameState.group.length : 1;
  // const monsterCount = Math.min(
  //   1,
  //   Math.max(1, baseMonsterCount + Math.floor(groupMemberCount / 2))
  // );

  // console.log(
  //   "baseMonsterCount",
  //   baseMonsterCount,
  //   "groupMemberCount",
  //   groupMemberCount,
  //   "monsterCount",
  //   monsterCount
  // );
  // const monsterTypes = [
  //   "goblin",
  //   "goblin_scout",
  //   "goblin_shaman",
  //   "orc",
  //   "orc_scout",
  //   "orc_warrior",
  //   "orc_raider",
  //   "wolf",
  //   "wolf_young",
  //   "wolf_alpha",
  //   "bear",
  //   "bear_black",
  //   "bear_grizzly",
  //   "troll",
  //   "troll_warrior",
  //   "mountainLion",
  //   "mountain_lion_young",
  //   "mountain_lion_adult",
  //   "mountain_lion_hunter",
  //   "screamer",
  //   "stalker",
  // ];
  // const selectedTypes = monsterTypes
  //   .sort(() => 0.5 - Math.random())
  //   .slice(0, monsterCount);

  // const monsters = await generateMonsters(
  //   monsterCount,
  //   selectedTypes[0],
  //   ex,
  //   ey
  // );
  // `Generated ${monsters.length} monsters`;

  // Generate monsters based on location and detection
  const baseMonsterCount = Math.floor(Math.random() * 3) + 1; // 1-3 base
  const groupMemberCount = gameState.group ? gameState.group.length : 1;

  // Determine tier based on group size using database helper
  const tier = determineMonsterTier(groupMemberCount);

  // Get monster types for the selected tier from database
  const tierMonsterTypes = getMonsterTypesByTier(tier);

  // Calculate monster count using database helper
  const monsterCount = getMonsterCountForTier(
    tier,
    baseMonsterCount,
    groupMemberCount
  );

  // Randomly select one type from the current tier
  const selectedType =
    tierMonsterTypes[Math.floor(Math.random() * tierMonsterTypes.length)];

  console.log(
    "baseMonsterCount",
    baseMonsterCount,
    "groupMemberCount",
    groupMemberCount,
    "tier",
    tier,
    "monsterCount",
    monsterCount,
    "selectedType",
    selectedType
  );

  // Generate monsters (all of the same type, as in your original)
  const monsters = await generateMonsters(monsterCount, selectedType, ex, ey);
  `Generated ${monsters.length} monsters`;

  // Generate allies
  const allies = await generateAllies();
  `Generated ${allies.length} allies`;

  // Calculate stealth modifier
  const stealthModifier = calculateStealthModifier();
  `Stealth modifier: ${stealthModifier}`;

  // Generate detection message
  const detectionMessage = generateDetectionMessage(monsters);
  detectionMessage;

  // Combat loop
  let turnCount = 0;
  let combatActive = true;

  while (combatActive) {
    turnCount++;
    `\n--- Turn ${turnCount} ---`;

    // Check combat status
    const status = getCombatStatus(allies, monsters, turnCount);

    if (status.victory) {
      ("Victory! All monsters defeated.");
      combatActive = false;
      break;
    }

    if (status.defeat) {
      ("Defeat! All allies defeated.");
      combatActive = false;
      break;
    }

    // Player turn (simplified for this example)
    ("Player turn - choosing action...");

    // Simulate player choice
    const playerChoices = ["attack", "defend", "flee", "stealth"];
    const playerChoice =
      playerChoices[Math.floor(Math.random() * playerChoices.length)];
    `Player chooses: ${playerChoice}`;

    // Calculate initiative
    const initiative = calculateInitiative(playerChoice, stealthModifier);
    `Initiative: ${initiative}`;

    // Execute player action
    if (playerChoice === "attack") {
      const target = monsters.find(
        (m) => !m.isDead() && !m.isFleeing() && !m.isUnconscious()
      );
      if (target && gameState.playerCharacter) {
        const damage = calculateCharacterDamage(gameState.playerCharacter);
        const actualDamage = target.takeDamage(damage);
        `Player attacks ${target.name} for ${actualDamage} damage!`;

        // Progress combat skills
        const primarySkill = getPrimaryWeaponSkill(gameState.playerCharacter);
        progressSkill(gameState.playerCharacter, primarySkill, 0.1);
      }
    } else if (playerChoice === "defend") {
      ("Player takes a defensive stance!");
    } else if (playerChoice === "flee") {
      ("Player attempts to flee!");
      // Implement flee logic
      combatActive = false;
      break;
    } else if (playerChoice === "stealth") {
      ("Player attempts to hide!");
    }

    // Log creature status before AI turns
    `[TURN ${turnCount} STATUS] Allies: ${allies
      .map(
        (a) =>
          `${a.name}(${a.status},${
            a.unconscious ? "unconscious" : "conscious"
          })`
      )
      .join(", ")}`;
    `[TURN ${turnCount} STATUS] Monsters: ${monsters
      .map(
        (m) =>
          `${m.name}(${m.status},${
            m.unconscious ? "unconscious" : "conscious"
          })`
      )
      .join(", ")}`;

    // Ally AI turn
    if (allies.length > 0) {
      ("Ally AI turn...");
      allyAI(allies, monsters, turnCount);
    }

    // Monster AI turn
    if (monsters.length > 0) {
      ("Monster AI turn...");
      monsterAI(monsters, allies, turnCount);
    }

    // Check for combat end conditions
    const finalStatus = getCombatStatus(allies, monsters, turnCount);
    if (finalStatus.victory || finalStatus.defeat) {
      combatActive = false;
    }

    // Prevent infinite loops
    if (turnCount > 50) {
      ("Combat timeout - ending combat");
      combatActive = false;
    }
  }

  // Combat resolution
  const finalStatus = getCombatStatus(allies, monsters, turnCount);

  if (finalStatus.victory) {
    ("\n=== VICTORY ===");

    // Calculate experience and loot
    let totalExp = 0;
    let totalLoot = [];

    monsters.forEach((monster) => {
      if (monster.isDead()) {
        totalExp += monster.experienceValue;
        totalLoot = totalLoot.concat(monster.lootTable);
      }
    });

    `Experience gained: ${totalExp}`;
    `Loot found:`, totalLoot;

    // Distribute experience
    if (gameState.playerCharacter) {
      gameState.playerCharacter.experience += totalExp;
      `Player experience: ${gameState.playerCharacter.experience}`;
    }

    // Progress skills for surviving allies
    allies.forEach((ally) => {
      if (!ally.isDead() && ally.character) {
        const primarySkill = getPrimaryWeaponSkill(ally.character);
        progressSkill(ally.character, primarySkill, 0.2);
      }
    });
  } else if (finalStatus.defeat) {
    ("\n=== DEFEAT ===");

    // Handle defeat logic
    ("All allies have been defeated!");
  } else {
    ("\n=== COMBAT ENDED ===");
    ("Combat ended without clear victory or defeat");
  }

  // Sync health back to gameState characters
  syncHealthToGameStateLoop(allies);

  // Update game state (experience and skills already updated above)
  ("Combat completed - game state updated");

  return finalStatus;
}

// getPrimaryWeaponSkill is now imported from character-calculations.js

// Sync health from combat entities back to gameState (for combat-loop.js)
function syncHealthToGameStateLoop(allies) {
  // Sync player character health
  const playerAlly = allies.find((ally) => ally.isPlayer);
  if (playerAlly && playerAlly.character && gameState.playerCharacter) {
    gameState.playerCharacter.health.current = playerAlly.currentHealth;
    gameState.playerCharacter.health.max = playerAlly.maxHealth;
    gameState.health = playerAlly.currentHealth; // Backwards compatibility
    "[HEALTH SYNC] Synced player health:",
      playerAlly.currentHealth,
      "/",
      playerAlly.maxHealth;
  }

  // Sync group member health
  allies.forEach((ally) => {
    if (!ally.isPlayer && ally.character && ally.id) {
      const groupMember = gameState.group.find((char) => char.id === ally.id);
      if (groupMember) {
        groupMember.health.current = ally.currentHealth;
        groupMember.health.max = ally.maxHealth;
        `[HEALTH SYNC] Synced ${ally.name} health:`,
          ally.currentHealth,
          "/",
          ally.maxHealth;
      }
    }
  });

  // Apply post-combat auto-heal for survivors
  applyPostCombatHealingLoop();
}

// Apply post-combat healing to surviving characters (for combat-loop.js)
function applyPostCombatHealingLoop() {
  // Heal player character if not dead
  if (
    gameState.playerCharacter &&
    gameState.playerCharacter.health.current >
      -Math.floor(gameState.playerCharacter.health.max / 2)
  ) {
    const healAmount = Math.floor(gameState.playerCharacter.health.max / 10);
    const oldHealth = gameState.playerCharacter.health.current;
    gameState.playerCharacter.health.current = Math.min(
      gameState.playerCharacter.health.max,
      gameState.playerCharacter.health.current + healAmount
    );
    gameState.health = gameState.playerCharacter.health.current; // Update legacy health
    const actualHealing = gameState.playerCharacter.health.current - oldHealth;
    if (actualHealing > 0) {
      "[POST-COMBAT HEAL] Player healed for", actualHealing, "HP";
    }
  }

  // Heal group members if not dead
  gameState.group.forEach((member) => {
    if (member.health.current > -Math.floor(member.health.max / 2)) {
      const healAmount = Math.floor(member.health.max / 10);
      const oldHealth = member.health.current;
      member.health.current = Math.min(
        member.health.max,
        member.health.current + healAmount
      );
      const actualHealing = member.health.current - oldHealth;
      if (actualHealing > 0) {
        "[POST-COMBAT HEAL]",
          member.firstName,
          member.lastName,
          "healed for",
          actualHealing,
          "HP";
      }
    }
  });
}
