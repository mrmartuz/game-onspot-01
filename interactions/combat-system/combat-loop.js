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
  `Starting enhanced combat at (${ex}, ${ey})`;

  // Use the real game state
  if (!gameState) {
    console.error("Game state not available");
    return;
  }

  // Calculate detection bonus
  const detectionBonus = calculateDetectionBonus();
  `Detection bonus: ${detectionBonus}`;

  // Generate monsters based on location and detection
  const baseMonsterCount = Math.floor(Math.random() * 3) + 1; // 1-3 monsters
  const groupMemberCount = gameState.group ? gameState.group.length : 1;
  const monsterCount =
    baseMonsterCount + Math.min(1, Math.floor(groupMemberCount / 2));

  console.log("monsterCount", monsterCount);
  const monsterTypes = [
    "goblin",
    "goblin_scout",
    "goblin_shaman",
    "orc",
    "orc_scout",
    "orc_warrior",
    "orc_raider",
    "wolf",
    "wolf_young",
    "wolf_alpha",
    "bear",
    "bear_black",
    "bear_grizzly",
    "troll",
    "troll_warrior",
    "mountainLion",
    "mountain_lion_young",
    "mountain_lion_adult",
    "mountain_lion_hunter",
    "screamer",
    "stalker",
  ];
  const selectedTypes = monsterTypes
    .sort(() => 0.5 - Math.random())
    .slice(0, monsterCount);

  const monsters = await generateMonsters(
    monsterCount,
    selectedTypes[0],
    ex,
    ey
  );
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
      const target = monsters.find((m) => !m.isDead() && !m.isFleeing());
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

  // Update game state (experience and skills already updated above)
  ("Combat completed - game state updated");

  return finalStatus;
}

function getPrimaryWeaponSkill(character) {
  // Determine primary weapon skill based on equipment
  const weapon = character.equipment?.weapon;
  if (!weapon) return "unarmed";

  const weaponType = weapon.toLowerCase();

  // Map weapon types to specific skills - order matters for overlapping names
  if (
    weaponType.includes("greatsword") ||
    weaponType.includes("claymore") ||
    weaponType.includes("zweihander")
  )
    return "great_swords";
  if (weaponType.includes("sword") || weaponType.includes("skrith-blade"))
    return "swords";
  if (
    weaponType.includes("greataxe") ||
    weaponType.includes("battleaxe") ||
    weaponType.includes("vrakgul-axe")
  )
    return "great_axes";
  if (weaponType.includes("axe")) return "axes";
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
    return "polearms";
  if (
    weaponType.includes("maul") ||
    weaponType.includes("great-hammer") ||
    weaponType.includes("gormith-hammer")
  )
    return "great_hammers";
  if (
    weaponType.includes("mace") ||
    weaponType.includes("club") ||
    weaponType.includes("warhammer") ||
    weaponType.includes("flail") ||
    weaponType.includes("morningstar")
  )
    return "hammers";
  if (
    weaponType.includes("crossbow") ||
    weaponType.includes("gormith-crossbow")
  )
    return "crossbows";
  if (weaponType.includes("bow") || weaponType.includes("lyssarion-bow"))
    return "bows";
  if (
    weaponType.includes("dagger") ||
    weaponType.includes("javelin") ||
    weaponType.includes("throwing") ||
    weaponType.includes("sling") ||
    weaponType.includes("skrith-nedle")
  )
    return "throwing";
  if (weaponType.includes("shield") || weaponType.includes("aurethine-shield"))
    return "shields";

  return "unarmed";
}
