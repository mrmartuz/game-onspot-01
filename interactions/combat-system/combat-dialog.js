// Enhanced Combat Dialog System
// Implements proper combat phases: Detection, Engagement, Combat

import { getShowChoiceDialog } from "../../interactions.js";
import { gameState } from "../../gamestate/game_variables.js";
import { generateMonsters } from "./creature-generation.js";
import { generateAllies } from "./ai.js";
import {
  calculateDetectionBonus,
  calculateStealthModifier,
  calculateInitiative,
} from "./detection-stealth.js";
import {
  calculateCharacterDamage,
  calculateCharacterDefense,
  calculateCharacterAccuracy,
  calculateCharacterInitiative,
  progressSkill,
} from "./character-calculations.js";
import { Monster, Ally } from "./entities.js";
import {
  generateMonsterHead,
  addHeadToInventory,
  getAvailableHeadSpace,
  formatHeadForDisplay,
  getRaceEmoji as getLootRaceEmoji,
} from "../loot-system.js";
import { logEvent } from "../../time_system.js";
import { updateStatus } from "../../rendering.js";

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
};

// Helper function to get race emoji
function getRaceEmoji(race) {
  return raceEmoji[race] || "👤";
}

// Combat phases
const COMBAT_PHASES = {
  DETECTION: "detection",
  ENGAGEMENT: "engagement",
  COMBAT: "combat",
  RESOLUTION: "resolution",
};

// Combat state
let combatState = {
  phase: COMBAT_PHASES.DETECTION,
  allies: [],
  monsters: [],
  turnCount: 0,
  playerDetected: false,
  enemiesDetected: false,
  initiativeOrder: [],
  currentTurn: 0,
  combatActive: false,
};

export async function handleEnhancedCombatDialog(ex, ey, isOnTile = false) {
  console.log(`Starting enhanced combat dialog at (${ex}, ${ey})`);

  // Reset combat state
  combatState = {
    phase: COMBAT_PHASES.DETECTION,
    allies: [],
    monsters: [],
    turnCount: 0,
    playerDetected: false,
    enemiesDetected: false,
    initiativeOrder: [],
    currentTurn: 0,
    combatActive: false,
  };

  // Generate combatants
  combatState.allies = await generateAllies();
  combatState.monsters = await generateMonsters(
    Math.floor(Math.random() * 3) + 1, // 1-3 monsters
    "goblin", // Default monster type
    ex,
    ey
  );

  console.log(
    `Generated ${combatState.allies.length} allies and ${combatState.monsters.length} monsters`
  );

  // Start with detection phase
  return await handleDetectionPhase();
}

// Phase 1: Detection
async function handleDetectionPhase() {
  console.log("=== DETECTION PHASE ===");

  const detectionBonus = calculateDetectionBonus();
  const stealthModifier = calculateStealthModifier();

  // Check if group detects enemies
  const groupDetectionRoll = Math.random() * 100;
  const groupDetectionThreshold = 50 + detectionBonus;
  combatState.enemiesDetected = groupDetectionRoll <= groupDetectionThreshold;

  // Check if enemies detect group
  const enemyDetectionRoll = Math.random() * 100;
  const enemyDetectionThreshold = 30 - stealthModifier; // Lower threshold = easier to detect
  combatState.playerDetected = enemyDetectionRoll <= enemyDetectionThreshold;

  let detectionMessage = "🔍 DETECTION PHASE\n\n";

  if (combatState.enemiesDetected) {
    detectionMessage += `✅ Your group detects ${combatState.monsters.length} ${
      combatState.monsters.length > 0 ? "enemies" : "enemy"
    }!\n`;
    detectionMessage += `Enemies spotted: ${combatState.monsters
      .map((m) => m.name)
      .join(", ")}\n\n`;
  } else {
    detectionMessage += `❌ Your group doesn't detect any immediate threats.\n\n`;
  }

  if (combatState.playerDetected) {
    detectionMessage += `⚠️ The enemies have spotted your group!\n`;
  } else {
    detectionMessage += `✅ Your group remains undetected.\n`;
  }

  detectionMessage += `\nDetection Bonus: +${detectionBonus}\n`;
  detectionMessage += `Stealth Modifier: ${
    stealthModifier > 0 ? "+" : ""
  }${stealthModifier}`;

  await getShowChoiceDialog(detectionMessage, [
    { type: "button", label: "Continue", value: "continue" },
  ]);

  // Move to engagement phase
  combatState.phase = COMBAT_PHASES.ENGAGEMENT;
  return await handleEngagementPhase();
}

// Phase 2: Engagement
async function handleEngagementPhase() {
  console.log("=== ENGAGEMENT PHASE ===");

  let engagementMessage = "⚔️ ENGAGEMENT PHASE\n\n";

  if (combatState.enemiesDetected) {
    engagementMessage += `You have spotted ${combatState.monsters.length} ${
      combatState.monsters.length > 0 ? "enemies" : "enemy"
    }:\n`;
    combatState.monsters.forEach((monster, index) => {
      const emoji = getRaceEmoji(monster.race);
      engagementMessage += `${index + 1}. ${monster.name} (${
        monster.race
      } ${emoji} ${monster.class} Lv.${monster.level})\n`;
    });
    engagementMessage += `\nWhat do you want to do?`;

    const choices = [
      { type: "button", label: "⚡ Charge Attack", value: "charge" },
      { type: "button", label: "🎯 Careful Attack", value: "attack" },
      { type: "button", label: "🥷 Stalk", value: "stalk" },
      { type: "button", label: "🏃 Run Away", value: "flee" },
    ];

    const choice = await getShowChoiceDialog(engagementMessage, choices);

    switch (choice) {
      case "charge":
        return await handleChargeAttack();
      case "attack":
        return await handleCarefulAttack();
      case "stalk":
        return await handleStalk();
      case "flee":
        return await handleFlee();
    }
  } else {
    // Group didn't detect enemies - enemies might attack first
    if (combatState.playerDetected) {
      engagementMessage += `⚠️ The enemies have spotted you and are attacking!\n`;
      engagementMessage += `You didn't detect them in time to prepare.\n\n`;

      await getShowChoiceDialog(engagementMessage, [
        { type: "button", label: "Defend!", value: "defend" },
      ]);

      return await handleSurpriseAttack();
    } else {
      engagementMessage += `❌ Neither side detected the other.\n`;
      engagementMessage += `Combat begins with initiative rolls.\n\n`;

      await getShowChoiceDialog(engagementMessage, [
        { type: "button", label: "Begin Combat", value: "begin" },
      ]);

      return await handleInitiativeCombat();
    }
  }
}

// Engagement actions
async function handleChargeAttack() {
  console.log("Player chooses: Charge Attack");

  // Charge gives initiative bonus but higher risk
  combatState.initiativeOrder = await calculateInitiativeOrder(true); // Charge bonus
  combatState.combatActive = true;
  combatState.phase = COMBAT_PHASES.COMBAT;

  await getShowChoiceDialog(
    "⚡ CHARGE ATTACK!\n\nYour group charges forward with battle cries!\nYou gain initiative bonus but enemies are alerted.",
    [{ type: "button", label: "Begin Combat", value: "begin" }]
  );

  return await handleCombatPhase();
}

async function handleCarefulAttack() {
  console.log("Player chooses: Careful Attack");

  // Careful attack - normal initiative
  combatState.initiativeOrder = await calculateInitiativeOrder(false);
  combatState.combatActive = true;
  combatState.phase = COMBAT_PHASES.COMBAT;

  await getShowChoiceDialog(
    "🎯 CAREFUL ATTACK\n\nYour group approaches cautiously, weapons ready.\nNormal initiative rolls.",
    [{ type: "button", label: "Begin Combat", value: "begin" }]
  );

  return await handleCombatPhase();
}

async function handleStalk() {
  console.log("Player chooses: Stalk");

  // Stalk gives stealth bonus but might fail
  const stalkSuccess = Math.random() < 0.7; // 70% chance of success

  if (stalkSuccess) {
    combatState.initiativeOrder = await calculateInitiativeOrder(false, true); // Stealth bonus
    combatState.combatActive = true;
    combatState.phase = COMBAT_PHASES.COMBAT;

    await getShowChoiceDialog(
      "🥷 STALKING SUCCESS\n\nYour group successfully stalks the enemies.\nYou gain stealth bonus to initiative.",
      [{ type: "button", label: "Begin Combat", value: "begin" }]
    );
  } else {
    await getShowChoiceDialog(
      "🥷 STALKING FAILED\n\nYour group is detected while stalking!\nEnemies gain initiative bonus.",
      [{ type: "button", label: "Begin Combat", value: "begin" }]
    );

    combatState.initiativeOrder = await calculateInitiativeOrder(
      false,
      false,
      true
    ); // Enemy bonus
    combatState.combatActive = true;
    combatState.phase = COMBAT_PHASES.COMBAT;
  }

  return await handleCombatPhase();
}

async function handleFlee() {
  console.log("Player chooses: Flee");

  // Flee attempt - might succeed or fail
  const fleeSuccess = Math.random() < 0.8; // 80% chance of success

  if (fleeSuccess) {
    await getShowChoiceDialog(
      "🏃 FLEE SUCCESSFUL\n\nYour group successfully flees from combat!\nNo casualties.",
      [{ type: "button", label: "Continue", value: "ok" }]
    );
    return "fled";
  } else {
    await getShowChoiceDialog(
      "🏃 FLEE FAILED\n\nYour group couldn't escape!\nCombat begins with enemies having advantage.",
      [{ type: "button", label: "Begin Combat", value: "begin" }]
    );

    combatState.initiativeOrder = await calculateInitiativeOrder(
      false,
      false,
      true
    ); // Enemy bonus
    combatState.combatActive = true;
    combatState.phase = COMBAT_PHASES.COMBAT;

    return await handleCombatPhase();
  }
}

async function handleSurpriseAttack() {
  console.log("Enemies surprise attack");

  // Enemies attack first due to surprise
  combatState.initiativeOrder = await calculateInitiativeOrder(
    false,
    false,
    true
  ); // Enemy bonus
  combatState.combatActive = true;
  combatState.phase = COMBAT_PHASES.COMBAT;

  return await handleCombatPhase();
}

async function handleInitiativeCombat() {
  console.log("Initiative-based combat");

  // Normal initiative rolls
  combatState.initiativeOrder = await calculateInitiativeOrder(false);
  combatState.combatActive = true;
  combatState.phase = COMBAT_PHASES.COMBAT;

  return await handleCombatPhase();
}

// Phase 3: Combat
async function handleCombatPhase() {
  console.log("=== COMBAT PHASE ===");

  while (combatState.combatActive) {
    combatState.turnCount++;

    // Get current combatant
    const currentCombatant =
      combatState.initiativeOrder[combatState.currentTurn];

    if (currentCombatant.isPlayer) {
      // Player turn
      await handlePlayerTurn(currentCombatant);
    } else if (currentCombatant.character) {
      // Ally turn
      await handleAllyTurn(currentCombatant);
    } else {
      // Monster turn
      await handleMonsterTurn(currentCombatant);
    }

    // Check combat end conditions
    const status = getCombatStatus();
    if (status.victory || status.defeat) {
      combatState.combatActive = false;
      return await handleResolutionPhase(status);
    }

    // Next turn
    combatState.currentTurn =
      (combatState.currentTurn + 1) % combatState.initiativeOrder.length;
  }
}

// Player turn handler
async function handlePlayerTurn(player) {
  console.log(`Player turn: ${player.name}`);

  const aliveMonsters = combatState.monsters.filter(
    (m) => !m.isDead() && !m.isFleeing()
  );

  if (aliveMonsters.length === 0) {
    return; // No targets
  }

  let combatMessage = `⚔️ YOUR TURN\n\n`;
  combatMessage += `Health: ${player.currentHealth}/${player.maxHealth}\n\n`;
  // Allies status
  if (combatState.allies && combatState.allies.length > 0) {
    combatMessage += `Allies:\n`;
    combatState.allies.forEach((ally) => {
      const condition =
        ally.status === "dead"
          ? "Dead"
          : ally.unconscious
          ? "Unconscious"
          : "Active";
      const emoji = getRaceEmoji(ally.character?.race);
      combatMessage += `- ${ally.name} ${emoji}: ${ally.currentHealth}/${ally.maxHealth} HP (${condition})\n`;
    });
    combatMessage += `\n`;
  }
  combatMessage += `Available targets:\n`;

  aliveMonsters.forEach((monster, index) => {
    const emoji = getRaceEmoji(monster.race);
    combatMessage += `${index + 1}. ${monster.name} ${emoji} (${
      monster.currentHealth
    }/${monster.maxHealth} HP)\n`;
  });

  const choices = [
    { type: "button", label: "⚔️ Attack", value: "attack" },
    { type: "button", label: "🛡️ Defend", value: "defend" },
    { type: "button", label: "🛡️ Protect Ally", value: "protect" },
    { type: "button", label: "🏃 Retreat (All)", value: "retreat" },
    { type: "button", label: "🏃 Run Away", value: "flee" },
  ];

  const choice = await getShowChoiceDialog(combatMessage, choices);

  switch (choice) {
    case "attack":
      await handlePlayerAttack(player, aliveMonsters);
      break;
    case "defend":
      await handlePlayerDefend(player);
      break;
    case "protect":
      await handlePlayerProtect(player);
      break;
    case "retreat":
      return await handleGroupRetreat();
    case "flee":
      return await handlePlayerFlee();
  }
}

async function handlePlayerAttack(player, targets) {
  if (targets.length === 1) {
    // Only one target, attack directly
    await executeAttack(player, targets[0]);
  } else {
    // Multiple targets, let player choose
    let targetMessage = `🎯 CHOOSE TARGET\n\n`;
    targets.forEach((target, index) => {
      const emoji = getRaceEmoji(target.race);
      targetMessage += `${index + 1}. ${target.name} ${emoji} (${
        target.currentHealth
      }/${target.maxHealth} HP)\n`;
    });

    const targetChoices = targets.map((target, index) => {
      const emoji = getRaceEmoji(target.race);
      return {
        type: "button",
        label: `${target.name} ${emoji} (${target.currentHealth}/${target.maxHealth} HP)`,
        value: `target_${index}`,
      };
    });

    const targetChoice = await getShowChoiceDialog(
      targetMessage,
      targetChoices
    );
    const targetIndex = parseInt(targetChoice.split("_")[1]);
    const selectedTarget = targets[targetIndex];

    await executeAttack(player, selectedTarget);
  }
}

async function executeAttack(attacker, target) {
  console.log(
    `[ATTACK ATTEMPT] ${attacker.name} (${
      attacker.character?.race || attacker.race || "unknown"
    }) attempting to attack ${target.name} (${
      target.character?.race || target.race || "unknown"
    })`
  );
  console.log(
    `[ATTACKER STATE] ${attacker.name} - Status: ${attacker.status}, Health: ${
      attacker.currentHealth
    }/${attacker.maxHealth}, Unconscious: ${
      attacker.unconscious
    }, Dead: ${attacker.isDead()}`
  );
  console.log(
    `[TARGET STATE] ${target.name} - Status: ${target.status}, Health: ${
      target.currentHealth
    }/${target.maxHealth}, Unconscious: ${
      target.unconscious
    }, Dead: ${target.isDead()}`
  );

  // Check if attacker can attack
  if (attacker.isDead() || attacker.isFleeing() || attacker.isUnconscious()) {
    console.log(
      `[ATTACK ERROR] ${attacker.name} cannot attack - Status: ${attacker.status}, Unconscious: ${attacker.unconscious}`
    );
    return;
  }

  const damage = attacker.character
    ? calculateCharacterDamage(attacker.character)
    : attacker.getDamage();

  const accuracy = attacker.character
    ? calculateCharacterAccuracy(attacker.character)
    : attacker.getAccuracy();

  const defense = target.character
    ? calculateCharacterDefense(target.character)
    : target.getDefense();

  const hitChance = Math.max(5, Math.min(95, accuracy - defense + 50));
  const hitRoll = Math.random() * 100;

  console.log(
    `[ATTACK CALC] ${
      attacker.name
    } - Damage: ${damage}, Accuracy: ${accuracy}, Hit Chance: ${hitChance}%, Roll: ${hitRoll.toFixed(
      1
    )}`
  );

  if (hitRoll <= hitChance) {
    const actualDamage = target.takeDamage(damage);
    const attackerEmoji = getRaceEmoji(
      attacker.character?.race || attacker.race
    );
    const targetEmoji = getRaceEmoji(target.character?.race || target.race);
    console.log(
      `[ATTACK HIT] ${attacker.name} hits ${target.name} for ${actualDamage} damage!`
    );

    // Progress combat skills for successful attack
    if (attacker.character) {
      const primarySkill = getPrimaryWeaponSkill(attacker.character);
      const skillLevel = attacker.character.skills[primarySkill] || 0;
      const skillProgress = Math.max(0.001, 0.033 - skillLevel * 0.003);
      progressSkill(attacker.character, primarySkill, skillProgress);
      console.log(
        `[SKILL PROGRESS] ${attacker.name} gained ${skillProgress.toFixed(
          4
        )} ${primarySkill} experience`
      );
    }

    await getShowChoiceDialog(
      `⚔️ ${attacker.name} ${attackerEmoji} attacks ${target.name} ${targetEmoji} for ${actualDamage} damage!`,
      [{ type: "button", label: "Continue", value: "ok" }]
    );
  } else {
    const attackerEmoji = getRaceEmoji(
      attacker.character?.race || attacker.race
    );
    const targetEmoji = getRaceEmoji(target.character?.race || target.race);
    console.log(`[ATTACK MISS] ${attacker.name} misses ${target.name}!`);
    await getShowChoiceDialog(
      `⚔️ ${attacker.name} ${attackerEmoji} attacks ${target.name} ${targetEmoji} but misses!`,
      [{ type: "button", label: "Continue", value: "ok" }]
    );
  }
}

async function handlePlayerDefend(player) {
  // Defend action provides temporary defense bonus
  const defense = player.character
    ? calculateCharacterDefense(player.character)
    : player.getDefense();

  player.temporaryDefenseBonus = Math.floor(defense * 0.5);

  // Progress defense skills
  if (player.character) {
    const shieldSkill = player.character.skills.shieldwork || 0;
    const tacticsSkill = player.character.skills.tactics || 0;

    // Progress shieldwork skill
    const shieldProgress = Math.max(0.001, 0.033 - shieldSkill * 0.003);
    progressSkill(player.character, "shieldwork", shieldProgress);
    console.log(
      `[SKILL PROGRESS] ${player.name} gained ${shieldProgress.toFixed(
        4
      )} shieldwork experience`
    );

    // Progress tactics skill
    const tacticsProgress = Math.max(0.001, 0.033 - tacticsSkill * 0.003);
    progressSkill(player.character, "tactics", tacticsProgress);
    console.log(
      `[SKILL PROGRESS] ${player.name} gained ${tacticsProgress.toFixed(
        4
      )} tactics experience`
    );
  }

  await getShowChoiceDialog(
    `🛡️ ${player.name} takes a defensive stance!\nDefense increased by ${player.temporaryDefenseBonus}.`,
    [{ type: "button", label: "Continue", value: "ok" }]
  );
}

async function handlePlayerProtect(player) {
  // Protect action - reduce damage to allies
  player.protectionActive = true;

  await getShowChoiceDialog(
    `🛡️ ${player.name} prepares to protect allies!\nDamage to allies will be reduced.`,
    [{ type: "button", label: "Continue", value: "ok" }]
  );
}

async function handleGroupRetreat() {
  // Group retreat - all allies attempt to flee
  const retreatSuccess = Math.random() < 0.6; // 60% chance

  if (retreatSuccess) {
    await getShowChoiceDialog(
      "🏃 GROUP RETREAT SUCCESSFUL\n\nYour group successfully retreats from combat!\nSome members may be wounded.",
      [{ type: "button", label: "Continue", value: "ok" }]
    );
    return "retreated";
  } else {
    await getShowChoiceDialog(
      "🏃 GROUP RETREAT FAILED\n\nYour group couldn't retreat!\nCombat continues.",
      [{ type: "button", label: "Continue", value: "ok" }]
    );
    // Continue combat
  }
}

async function handlePlayerFlee() {
  // Individual flee - player runs away, allies continue fighting
  const fleeSuccess = Math.random() < 0.8; // 80% chance

  if (fleeSuccess) {
    await getShowChoiceDialog(
      "🏃 YOU FLEE\n\nYou successfully flee from combat!\nYour allies continue fighting.",
      [{ type: "button", label: "Continue", value: "ok" }]
    );
    return "fled";
  } else {
    await getShowChoiceDialog(
      "🏃 FLEE FAILED\n\nYou couldn't escape!\nCombat continues.",
      [{ type: "button", label: "Continue", value: "ok" }]
    );
    // Continue combat
  }
}

// Ally turn handler
async function handleAllyTurn(ally) {
  console.log(
    `[ALLY TURN] ${ally.name} (${
      ally.character?.race || "unknown"
    }) - Status: ${ally.status}, Health: ${ally.currentHealth}/${
      ally.maxHealth
    }, Unconscious: ${ally.unconscious}, Dead: ${ally.isDead()}`
  );

  // Check if ally can act
  if (ally.isDead() || ally.isFleeing() || ally.isUnconscious()) {
    console.log(
      `[ALLY TURN] ${ally.name} cannot act - Status: ${ally.status}, Unconscious: ${ally.unconscious}`
    );
    return;
  }

  // Simple AI for allies
  const aliveMonsters = combatState.monsters.filter(
    (m) => !m.isDead() && !m.isFleeing()
  );

  console.log(
    `[ALLY TARGETS] ${ally.name} can target ${
      aliveMonsters.length
    } monsters: ${aliveMonsters
      .map((m) => `${m.name}(${m.status},${m.currentHealth}/${m.maxHealth})`)
      .join(", ")}`
  );

  if (aliveMonsters.length === 0) return;

  const target =
    aliveMonsters[Math.floor(Math.random() * aliveMonsters.length)];
  await executeAttack(ally, target);
}

// Monster turn handler
async function handleMonsterTurn(monster) {
  console.log(
    `[MONSTER TURN] ${monster.name} (${monster.race || "unknown"}) - Status: ${
      monster.status
    }, Health: ${monster.currentHealth}/${monster.maxHealth}, Unconscious: ${
      monster.unconscious
    }, Dead: ${monster.isDead()}`
  );

  // Check if monster can act
  if (monster.isDead() || monster.isFleeing() || monster.isUnconscious()) {
    console.log(
      `[MONSTER TURN] ${monster.name} cannot act - Status: ${monster.status}, Unconscious: ${monster.unconscious}`
    );
    return;
  }

  // Simple AI for monsters
  const aliveAllies = combatState.allies.filter(
    (a) => !a.isDead() && !a.isFleeing()
  );

  console.log(
    `[MONSTER TARGETS] ${monster.name} can target ${
      aliveAllies.length
    } allies: ${aliveAllies
      .map((a) => `${a.name}(${a.status},${a.currentHealth}/${a.maxHealth})`)
      .join(", ")}`
  );

  if (aliveAllies.length === 0) return;

  const target = aliveAllies[Math.floor(Math.random() * aliveAllies.length)];
  await executeAttack(monster, target);
}

// Phase 4: Resolution
async function handleResolutionPhase(status) {
  console.log("=== RESOLUTION PHASE ===");

  if (status.victory) {
    await getShowChoiceDialog(
      "🏆 VICTORY!\n\nAll enemies have been defeated!\nYour group celebrates their victory.",
      [{ type: "button", label: "Continue", value: "ok" }]
    );

    // Show harvest dialog after victory
    await handleHarvestDialog();

    // Sync all skill changes back to gameState
    syncSkillsToGameState();

    // Update status display to reflect skill progression
    updateStatus();

    return "victory";
  } else if (status.defeat) {
    await getShowChoiceDialog(
      "💀 DEFEAT!\n\nAll allies have been defeated!\nYour group has fallen in battle.",
      [{ type: "button", label: "Continue", value: "ok" }]
    );

    // Sync skills even after defeat
    syncSkillsToGameState();

    // Update status display even after defeat
    updateStatus();

    return "defeat";
  }

  return "unknown";
}

// Sync skills from combat entities back to gameState
function syncSkillsToGameState() {
  // Sync player character skills
  const playerAlly = combatState.allies.find((ally) => ally.isPlayer);
  if (playerAlly && playerAlly.character && gameState.playerCharacter) {
    gameState.playerCharacter.skills = { ...playerAlly.character.skills };
    console.log(
      "[SKILL SYNC] Synced player skills:",
      gameState.playerCharacter.skills
    );
  }

  // Sync group member skills
  combatState.allies.forEach((ally) => {
    if (!ally.isPlayer && ally.character && ally.id) {
      const groupMember = gameState.group.find((char) => char.id === ally.id);
      if (groupMember) {
        groupMember.skills = { ...ally.character.skills };
        console.log(
          `[SKILL SYNC] Synced ${ally.name} skills:`,
          groupMember.skills
        );
      }
    }
  });
}

// Handle harvest dialog after combat victory
async function handleHarvestDialog() {
  const defeatedMonsters = combatState.monsters.filter((monster) =>
    monster.isDead()
  );

  if (defeatedMonsters.length === 0) {
    return; // No monsters to harvest
  }

  const availableSpace = getAvailableHeadSpace();
  let harvestMessage = "🏺 **HARVEST LOOT**\n\n";
  harvestMessage += `Available inventory space: ${availableSpace}\n\n`;
  harvestMessage += "Defeated monsters:\n";

  // Create harvest options
  const harvestOptions = [];
  let totalSelectedSpace = 0;

  for (let i = 0; i < defeatedMonsters.length; i++) {
    const monster = defeatedMonsters[i];
    const head = generateMonsterHead(monster);
    const emoji = getLootRaceEmoji(monster.race);

    harvestMessage += `${emoji} ${monster.race} (Level ${monster.level}, ${monster.rarity}) - ${head.inventorySize} space\n`;

    // Add checkbox option for each monster
    harvestOptions.push({
      type: "checkbox",
      value: `harvest_${i}`,
      label: `${emoji} ${monster.race} Head (${head.inventorySize} space)`,
      checked: false,
    });
  }

  harvestOptions.push({
    type: "button",
    label: "✅ Harvest Selected",
    value: "harvest",
  });
  harvestOptions.push({
    type: "button",
    label: "❌ Skip Harvest",
    value: "skip",
  });

  const harvestResult = await getShowChoiceDialog(
    harvestMessage,
    harvestOptions
  );

  console.log("Harvest result:", harvestResult);
  console.log("Harvest result keys:", Object.keys(harvestResult));

  if (harvestResult === "skip") {
    return;
  }

  if (harvestResult === "harvest" || harvestResult.value === "harvest") {
    let harvestedCount = 0;
    let harvestedItems = [];

    console.log(
      "Processing harvest, defeatedMonsters.length:",
      defeatedMonsters.length
    );

    for (let i = 0; i < defeatedMonsters.length; i++) {
      console.log(`Checking harvest_${i}:`, harvestResult[`harvest_${i}`]);
      if (harvestResult[`harvest_${i}`]) {
        const monster = defeatedMonsters[i];
        const head = generateMonsterHead(monster);

        console.log("Generated head:", head);

        if (addHeadToInventory(head)) {
          harvestedCount++;
          harvestedItems.push(
            `${getLootRaceEmoji(monster.race)} ${monster.race} Head`
          );
          console.log("Successfully added head to inventory");

          // Progress survival skill for successful harvest
          if (gameState.playerCharacter) {
            const survivalSkill =
              gameState.playerCharacter.skills.survival || 0;
            const skillProgress = Math.max(
              0.001,
              0.033 - survivalSkill * 0.003
            );
            progressSkill(gameState.playerCharacter, "survival", skillProgress);
            console.log(
              `[SKILL PROGRESS] Player gained ${skillProgress.toFixed(
                4
              )} survival experience from harvesting`
            );
          }
        } else {
          console.log("Failed to add head to inventory - not enough space");
          await getShowChoiceDialog(
            `❌ Not enough inventory space for ${monster.race} head!`,
            [{ type: "button", label: "OK", value: "ok" }]
          );
          break;
        }
      }
    }

    if (harvestedCount > 0) {
      const harvestSummary = `✅ Harvested ${harvestedCount} monster head${
        harvestedCount > 1 ? "s" : ""
      }:\n${harvestedItems.join("\n")}`;
      await getShowChoiceDialog(harvestSummary, [
        { type: "button", label: "OK", value: "ok" },
      ]);
      logEvent(
        `🏺 Harvested ${harvestedCount} monster head${
          harvestedCount > 1 ? "s" : ""
        }`
      );
    }
  }
}

// Helper functions
async function calculateInitiativeOrder(
  chargeBonus = false,
  stealthBonus = false,
  enemyBonus = false
) {
  const combatants = [...combatState.allies, ...combatState.monsters];

  const initiativeRolls = combatants.map((combatant) => {
    let initiative = combatant.character
      ? calculateCharacterInitiative(combatant.character)
      : combatant.getInitiative();

    // Apply bonuses
    if (chargeBonus && combatant.isPlayer) initiative += 5;
    if (stealthBonus && combatant.isPlayer) initiative += 3;
    if (enemyBonus && !combatant.isPlayer) initiative += 5;

    return {
      combatant,
      initiative: initiative + Math.random() * 10, // Add randomness
    };
  });

  // Sort by initiative (highest first)
  initiativeRolls.sort((a, b) => b.initiative - a.initiative);

  return initiativeRolls.map((roll) => roll.combatant);
}

function getCombatStatus() {
  const aliveAllies = combatState.allies.filter(
    (a) => !a.isDead() && !a.isFleeing()
  );
  const aliveMonsters = combatState.monsters.filter(
    (m) => !m.isDead() && !m.isFleeing()
  );

  return {
    victory: aliveMonsters.length === 0,
    defeat: aliveAllies.length === 0,
    combatActive: aliveAllies.length > 0 && aliveMonsters.length > 0,
  };
}

// Helper function to get primary weapon skill
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
