// Combat Phase Handlers
// Handles Detection, Engagement, Combat, and Resolution phases

import { getShowChoiceDialog } from "../../interactions.js";
import { gameState } from "../../gamestate/game_variables.js";
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
  getPrimaryWeaponSkill,
} from "./character-calculations.js";
import {
  generateMonsterHead,
  addHeadToInventory,
  getAvailableHeadSpace,
  formatHeadForDisplay,
} from "../loot-system.js";
import { logEvent } from "../../time_system.js";
import { updateStatus } from "../../rendering.js";
import { getRaceEmoji } from "../../gamestate/emoji-database.js";
import {
  COMBAT_PHASES,
  getCombatState,
  setCombatStateProperty,
  getCombatStateProperty,
} from "./combat-state.js";
import { updateCombatPositions } from "./combat-grid.js";
import {
  formatMonsterList,
  formatAllyList,
  formatPlayerTurnMessage,
  formatAttackMessage,
  createTargetChoice,
  createDialogChoicesWithGrid,
  createCombatActionButtons,
  createEngagementActionButtons,
} from "./combat-ui.js";

// Helper function wrapper for updatePositionsForEngagement
function updatePositionsForEngagement(playerChoice, enemyChoice) {
  // Use the new combat-grid function
  updateCombatPositions(playerChoice);
  // Note: enemyChoice is currently not used in updateCombatPositions
  // This can be enhanced later if needed
}

// Phase 1: Detection
export async function handleDetectionPhase() {
  const combatState = getCombatState();
  ("=== DETECTION PHASE ===");

  const detectionBonus = calculateDetectionBonus();
  const stealthModifier = calculateStealthModifier();

  // Check if group detects enemies
  const groupDetectionRoll = Math.random() * 100;
  const groupDetectionThreshold = 50 + detectionBonus;
  setCombatStateProperty(
    "enemiesDetected",
    groupDetectionRoll <= groupDetectionThreshold
  );

  // Check if enemies detect group
  const enemyDetectionRoll = Math.random() * 100;
  const enemyDetectionThreshold = 30 - stealthModifier; // Lower threshold = easier to detect
  setCombatStateProperty(
    "playerDetected",
    enemyDetectionRoll <= enemyDetectionThreshold
  );

  const updatedState = getCombatState();

  let detectionMessage = "🔍 DETECTION PHASE\n\n";

  if (updatedState.enemiesDetected) {
    detectionMessage += `✅ Your group detects ${
      updatedState.monsters.length
    } ${updatedState.monsters.length > 0 ? "enemies" : "enemy"}!\n`;
    detectionMessage += `Enemies spotted: ${updatedState.monsters
      .map((m) => m.name)
      .join(", ")}\n\n`;
  } else {
    detectionMessage += `❌ Your group doesn't detect any immediate threats.\n\n`;
  }

  if (updatedState.playerDetected) {
    detectionMessage += `⚠️ The enemies have spotted your group!\n`;
  } else {
    detectionMessage += `✅ Your group remains undetected.\n`;
  }

  detectionMessage += `\nDetection Bonus: +${detectionBonus}\n`;
  detectionMessage += `Stealth Modifier: ${
    stealthModifier > 0 ? "+" : ""
  }${stealthModifier}`;

  // Create dialog choices with grid
  const choices = createDialogChoicesWithGrid("detection", [
    { type: "button", label: "Continue", value: "continue" },
  ]);

  await getShowChoiceDialog(detectionMessage, choices);

  // Move to engagement phase
  setCombatStateProperty("phase", COMBAT_PHASES.ENGAGEMENT);
  return await handleEngagementPhase();
}

// Enemy engagement decision function
function determineEnemyEngagementChoice() {
  // Analyze enemy group composition and behavior
  const enemyBehavior = analyzeEnemyGroupBehavior();

  // Determine engagement choice based on behavior and random factors
  const random = Math.random();

  switch (enemyBehavior) {
    case "aggressive":
      // Aggressive enemies prefer charge attacks
      if (random < 0.6) return "charge";
      if (random < 0.8) return "attack";
      if (random < 0.9) return "stalk";
      return "flee";

    case "defensive":
      // Defensive enemies prefer careful attacks and stalking
      if (random < 0.4) return "attack";
      if (random < 0.7) return "stalk";
      if (random < 0.85) return "charge";
      return "flee";

    case "cunning":
      // Cunning enemies prefer stalking and careful attacks
      if (random < 0.5) return "stalk";
      if (random < 0.75) return "attack";
      if (random < 0.9) return "charge";
      return "flee";

    case "cowardly":
      // Cowardly enemies prefer fleeing
      if (random < 0.7) return "flee";
      if (random < 0.85) return "stalk";
      if (random < 0.95) return "attack";
      return "charge";

    default:
      // Balanced behavior
      if (random < 0.3) return "charge";
      if (random < 0.6) return "attack";
      if (random < 0.8) return "stalk";
      return "flee";
  }
}

function analyzeEnemyGroupBehavior() {
  const combatState = getCombatState();
  if (!combatState.monsters || combatState.monsters.length === 0) {
    return "balanced";
  }

  // Analyze the group composition
  let aggressiveCount = 0;
  let defensiveCount = 0;
  let cunningCount = 0;
  let cowardlyCount = 0;

  combatState.monsters.forEach((monster) => {
    switch (monster.aiBehavior) {
      case "aggressive":
        aggressiveCount++;
        break;
      case "defensive":
        defensiveCount++;
        break;
      case "cunning":
        cunningCount++;
        break;
      case "cowardly":
        cowardlyCount++;
        break;
    }
  });

  const totalMonsters = combatState.monsters.length;

  // Determine dominant behavior
  if (aggressiveCount / totalMonsters >= 0.5) return "aggressive";
  if (defensiveCount / totalMonsters >= 0.5) return "defensive";
  if (cunningCount / totalMonsters >= 0.5) return "cunning";
  if (cowardlyCount / totalMonsters >= 0.5) return "cowardly";

  // Check for mixed behaviors
  if (aggressiveCount > defensiveCount && aggressiveCount > cunningCount)
    return "aggressive";
  if (defensiveCount > aggressiveCount && defensiveCount > cunningCount)
    return "defensive";
  if (cunningCount > aggressiveCount && cunningCount > defensiveCount)
    return "cunning";

  return "balanced";
}

function getEngagementChoiceDescription(choice) {
  switch (choice) {
    case "charge":
      return "⚡ Charge Attack - Rush forward aggressively";
    case "attack":
      return "🎯 Careful Attack - Approach cautiously";
    case "stalk":
      return "🥷 Stalk - Try to gain stealth advantage";
    case "flee":
      return "🏃 Run Away - Attempt to escape";
    default:
      return "Unknown approach";
  }
}

// Handle simultaneous engagement choices
async function handleSimultaneousEngagement(playerChoice, enemyChoice) {
  `Simultaneous engagement: Player=${playerChoice}, Enemy=${enemyChoice}`;

  let message = "⚔️ SIMULTANEOUS ENGAGEMENT\n\n";
  message += `Your choice: ${getEngagementChoiceDescription(playerChoice)}\n`;
  message += `Enemy choice: ${getEngagementChoiceDescription(enemyChoice)}\n\n`;

  // Determine engagement outcome based on choices
  const outcome = determineEngagementOutcome(playerChoice, enemyChoice);

  switch (outcome.type) {
    case "player_advantage":
      message += `✅ ${outcome.description}\n\n`;
      break;
    case "enemy_advantage":
      message += `❌ ${outcome.description}\n\n`;
      break;
    case "balanced":
      message += `⚖️ ${outcome.description}\n\n`;
      break;
    case "both_flee":
      message += `🏃 ${outcome.description}\n\n`;
      break;
  }

  // Handle both sides fleeing
  if (outcome.endCombat) {
    await getShowChoiceDialog(message, [
      { type: "button", label: "Continue", value: "continue" },
    ]);

    // End combat and return to normal gameplay
    setCombatStateProperty("combatActive", false);
    setCombatStateProperty("phase", COMBAT_PHASES.NONE);

    // Log the event
    logEvent("Both sides fled from combat. No battle occurred.");

    return { success: true, combatEnded: true };
  }

  message += "Combat begins!";

  // Update positions based on engagement choices
  updatePositionsForEngagement(playerChoice, enemyChoice);

  // Create dialog choices with grid
  const choices = createDialogChoicesWithGrid("engagement", [
    { type: "button", label: "Begin Combat", value: "begin" },
  ]);

  await getShowChoiceDialog(message, choices);

  // Apply engagement bonuses/penalties
  applyEngagementModifiers(outcome);

  // Start combat with modified initiative
  const initiativeOrder = await calculateInitiativeOrder(
    outcome.playerInitiativeBonus,
    outcome.playerStealthBonus || false,
    outcome.enemyInitiativeBonus || false
  );
  setCombatStateProperty("initiativeOrder", initiativeOrder);
  setCombatStateProperty("combatActive", true);
  setCombatStateProperty("phase", COMBAT_PHASES.COMBAT);

  return await handleCombatPhase();
}

function determineEngagementOutcome(playerChoice, enemyChoice) {
  // Both flee
  if (playerChoice === "flee" && enemyChoice === "flee") {
    return {
      type: "both_flee",
      description: "Both sides attempt to flee! Combat is avoided.",
      playerInitiativeBonus: false,
      endCombat: true,
    };
  }

  // Player flees, enemy doesn't
  if (playerChoice === "flee" && enemyChoice !== "flee") {
    return {
      type: "enemy_advantage",
      description:
        "You attempt to flee while enemies pursue! They gain initiative advantage.",
      playerInitiativeBonus: false,
      enemyInitiativeBonus: true,
    };
  }

  // Enemy flees, player doesn't
  if (enemyChoice === "flee" && playerChoice !== "flee") {
    return {
      type: "player_advantage",
      description:
        "Enemies attempt to flee while you pursue! You gain initiative advantage.",
      playerInitiativeBonus: true,
    };
  }

  // Both charge
  if (playerChoice === "charge" && enemyChoice === "charge") {
    return {
      type: "balanced",
      description: "Both sides charge! Equal initiative bonuses cancel out.",
      playerInitiativeBonus: false,
    };
  }

  // Player charges, enemy doesn't
  if (playerChoice === "charge" && enemyChoice !== "charge") {
    return {
      type: "player_advantage",
      description:
        "You charge while enemies are cautious! You gain initiative advantage.",
      playerInitiativeBonus: true,
    };
  }

  // Enemy charges, player doesn't
  if (enemyChoice === "charge" && playerChoice !== "charge") {
    return {
      type: "enemy_advantage",
      description:
        "Enemies charge while you're cautious! They gain initiative advantage.",
      playerInitiativeBonus: false,
      enemyInitiativeBonus: true,
    };
  }

  // Both stalk
  if (playerChoice === "stalk" && enemyChoice === "stalk") {
    return {
      type: "balanced",
      description: "Both sides attempt to stalk! Stealth bonuses cancel out.",
      playerInitiativeBonus: false,
    };
  }

  // Player stalks, enemy doesn't
  if (playerChoice === "stalk" && enemyChoice !== "stalk") {
    return {
      type: "player_advantage",
      description:
        "You stalk while enemies are aggressive! You gain stealth advantage.",
      playerInitiativeBonus: false,
      playerStealthBonus: true,
    };
  }

  // Enemy stalks, player doesn't
  if (enemyChoice === "stalk" && playerChoice !== "stalk") {
    return {
      type: "enemy_advantage",
      description:
        "Enemies stalk while you're aggressive! They gain stealth advantage.",
      playerInitiativeBonus: false,
      enemyStealthBonus: true,
    };
  }

  // Both careful attack
  return {
    type: "balanced",
    description: "Both sides approach carefully. Normal combat begins.",
    playerInitiativeBonus: false,
  };
}

function applyEngagementModifiers(outcome) {
  // Apply any temporary modifiers based on engagement outcome
  // This could affect accuracy, damage, defense, etc.

  if (outcome.type === "player_advantage") {
    // Player gets small bonuses
    setCombatStateProperty("playerEngagementBonus", {
      accuracy: 5,
      damage: 2,
      initiative: 10,
    });
  } else if (outcome.type === "enemy_advantage") {
    // Enemies get small bonuses
    setCombatStateProperty("enemyEngagementBonus", {
      accuracy: 5,
      damage: 2,
      initiative: 10,
    });
  }
}

// Phase 2: Engagement
export async function handleEngagementPhase() {
  const combatState = getCombatState();
  ("=== ENGAGEMENT PHASE ===");

  let engagementMessage = "⚔️ ENGAGEMENT PHASE\n\n";

  if (combatState.enemiesDetected) {
    engagementMessage += `You have spotted ${combatState.monsters.length} ${
      combatState.monsters.length > 0 ? "enemies" : "enemy"
    }:\n`;
    engagementMessage += formatMonsterList(combatState.monsters, "engagement");
    engagementMessage += `\n`;

    // Check if enemies also detected the player group
    if (combatState.playerDetected) {
      engagementMessage += `\n⚠️ The enemies have also spotted your group!\n`;
      engagementMessage += `Both sides are aware of each other and must choose their approach.\n\n`;

      // Determine enemy engagement choice
      const enemyChoice = determineEnemyEngagementChoice();
      setCombatStateProperty("enemyEngagementChoice", enemyChoice);

      engagementMessage += `The enemies are preparing to: ${getEngagementChoiceDescription(
        enemyChoice
      )}\n\n`;
    }

    engagementMessage += `What do you want to do?`;

    // Create dialog choices with grid and engagement action buttons
    const choices = createDialogChoicesWithGrid(
      "engagement",
      createEngagementActionButtons()
    );

    const choice = await getShowChoiceDialog(engagementMessage, choices);

    // Handle simultaneous engagement choices
    const enemyEngagementChoice = getCombatStateProperty(
      "enemyEngagementChoice"
    );
    if (combatState.playerDetected && enemyEngagementChoice) {
      return await handleSimultaneousEngagement(choice, enemyEngagementChoice);
    }

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
  ("Player chooses: Charge Attack");

  // Update positions for charge attack
  updatePositionsForEngagement("charge", "attack"); // Assume enemy does careful attack

  // Charge gives initiative bonus but higher risk
  const initiativeOrder = await calculateInitiativeOrder(true, false, false); // Charge bonus
  setCombatStateProperty("initiativeOrder", initiativeOrder);
  setCombatStateProperty("combatActive", true);
  setCombatStateProperty("phase", COMBAT_PHASES.COMBAT);

  // Create dialog choices with grid
  const choices = createDialogChoicesWithGrid("engagement", [
    { type: "button", label: "Begin Combat", value: "begin" },
  ]);

  await getShowChoiceDialog(
    "⚡ CHARGE ATTACK!\n\nYour group charges forward with battle cries!\nYou gain initiative bonus but enemies are alerted.",
    choices
  );

  return await handleCombatPhase();
}

async function handleCarefulAttack() {
  ("Player chooses: Careful Attack");

  // Update positions for careful attack
  updatePositionsForEngagement("attack", "attack"); // Assume enemy does careful attack

  // Careful attack - normal initiative
  const initiativeOrder = await calculateInitiativeOrder(false, false, false);
  setCombatStateProperty("initiativeOrder", initiativeOrder);
  setCombatStateProperty("combatActive", true);
  setCombatStateProperty("phase", COMBAT_PHASES.COMBAT);

  // Create dialog choices with grid
  const choices = createDialogChoicesWithGrid("engagement", [
    { type: "button", label: "Begin Combat", value: "begin" },
  ]);

  await getShowChoiceDialog(
    "🎯 CAREFUL ATTACK\n\nYour group approaches cautiously, weapons ready.\nNormal initiative rolls.",
    choices
  );

  return await handleCombatPhase();
}

async function handleStalk() {
  ("Player chooses: Stalk");

  // Update positions for stalk
  updatePositionsForEngagement("stalk", "attack"); // Assume enemy does careful attack

  // Stalk gives stealth bonus but might fail
  const stalkSuccess = Math.random() < 0.7; // 70% chance of success

  if (stalkSuccess) {
    const initiativeOrder = await calculateInitiativeOrder(false, true, false); // Stealth bonus
    setCombatStateProperty("initiativeOrder", initiativeOrder);
    setCombatStateProperty("combatActive", true);
    setCombatStateProperty("phase", COMBAT_PHASES.COMBAT);

    const choices = createDialogChoicesWithGrid("engagement", [
      { type: "button", label: "Begin Combat", value: "begin" },
    ]);

    await getShowChoiceDialog(
      "🥷 STALKING SUCCESS\n\nYour group successfully stalks the enemies.\nYou gain stealth bonus to initiative.",
      choices
    );
  } else {
    const choices = createDialogChoicesWithGrid("engagement", [
      { type: "button", label: "Begin Combat", value: "begin" },
    ]);

    await getShowChoiceDialog(
      "🥷 STALKING FAILED\n\nYour group is detected while stalking!\nEnemies gain initiative bonus.",
      choices
    );

    const initiativeOrder = await calculateInitiativeOrder(false, false, true); // Enemy bonus
    setCombatStateProperty("initiativeOrder", initiativeOrder);
    setCombatStateProperty("combatActive", true);
    setCombatStateProperty("phase", COMBAT_PHASES.COMBAT);
  }

  return await handleCombatPhase();
}

async function handleFlee() {
  ("Player chooses: Flee");

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

    const initiativeOrder = await calculateInitiativeOrder(false, false, true); // Enemy bonus
    setCombatStateProperty("initiativeOrder", initiativeOrder);
    setCombatStateProperty("combatActive", true);
    setCombatStateProperty("phase", COMBAT_PHASES.COMBAT);

    return await handleCombatPhase();
  }
}

async function handleSurpriseAttack() {
  ("Enemies surprise attack");

  // Enemies attack first due to surprise
  const initiativeOrder = await calculateInitiativeOrder(false, false, true); // Enemy bonus
  setCombatStateProperty("initiativeOrder", initiativeOrder);
  setCombatStateProperty("combatActive", true);
  setCombatStateProperty("phase", COMBAT_PHASES.COMBAT);

  return await handleCombatPhase();
}

async function handleInitiativeCombat() {
  ("Initiative-based combat");

  // Normal initiative rolls
  const initiativeOrder = await calculateInitiativeOrder(false, false, false);
  setCombatStateProperty("initiativeOrder", initiativeOrder);
  setCombatStateProperty("combatActive", true);
  setCombatStateProperty("phase", COMBAT_PHASES.COMBAT);

  return await handleCombatPhase();
}

// Phase 3: Combat
export async function handleCombatPhase() {
  console.log("=== COMBAT PHASE ===");
  let combatState = getCombatState();

  while (combatState.combatActive) {
    const currentTurnCount = combatState.turnCount || 0;
    setCombatStateProperty("turnCount", currentTurnCount + 1);
    combatState = getCombatState(); // Refresh state after update

    // Get current combatant
    const currentCombatant =
      combatState.initiativeOrder[combatState.currentTurn];

    if (currentCombatant.isPlayer) {
      // Player turn (grid will be generated in handlePlayerTurn via UI helpers)
      const playerResult = await handlePlayerTurn(currentCombatant);
      // Check if player retreated or fled successfully
      if (playerResult === "retreated" || playerResult === "fled") {
        setCombatStateProperty("combatActive", false);
        return await handleResolutionPhase({ retreat: true });
      }
    } else if (currentCombatant.character) {
      // Ally turn
      await handleAllyTurn(currentCombatant);
    } else {
      // Monster turn
      await handleMonsterTurn(currentCombatant);
    }

    // Check combat end conditions
    combatState = getCombatState(); // Refresh state
    const status = getCombatStatus();
    if (status.victory || status.defeat) {
      setCombatStateProperty("combatActive", false);
      return await handleResolutionPhase(status);
    }

    // Next turn
    const currentTurn = combatState.currentTurn || 0;
    const nextTurn = (currentTurn + 1) % combatState.initiativeOrder.length;
    setCombatStateProperty("currentTurn", nextTurn);
    combatState = getCombatState(); // Refresh state for next iteration
  }
}

// Player turn handler
async function handlePlayerTurn(player) {
  console.log(`Player turn: ${player.name}`);
  const combatState = getCombatState();

  const aliveMonsters = combatState.monsters.filter(
    (m) => !m.isDead() && !m.isFleeing() && !m.isUnconscious()
  );

  if (aliveMonsters.length === 0) {
    return; // No targets
  }

  // Format player turn message using UI helper
  const combatMessage = formatPlayerTurnMessage(
    player,
    combatState.allies,
    aliveMonsters
  );

  // Create dialog choices with grid and combat action buttons
  const choices = createDialogChoicesWithGrid(
    "combat",
    createCombatActionButtons(),
    player
  );

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
    targetMessage += formatMonsterList(targets, "combat");

    const targetChoices = targets.map((target, index) =>
      createTargetChoice(target, index)
    );

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
  `[ATTACK ATTEMPT] ${attacker.name} (${
    attacker.character?.race || attacker.race || "unknown"
  }) attempting to attack ${target.name} (${
    target.character?.race || target.race || "unknown"
  })`;
  `[ATTACKER STATE] ${attacker.name} - Status: ${attacker.status}, Health: ${
    attacker.currentHealth
  }/${attacker.maxHealth}, Unconscious: ${
    attacker.unconscious
  }, Dead: ${attacker.isDead()}`;
  `[TARGET STATE] ${target.name} - Status: ${target.status}, Health: ${
    target.currentHealth
  }/${target.maxHealth}, Unconscious: ${
    target.unconscious
  }, Dead: ${target.isDead()}`;

  // Check if attacker can attack
  if (attacker.isDead() || attacker.isFleeing() || attacker.isUnconscious()) {
    `[ATTACK ERROR] ${attacker.name} cannot attack - Status: ${attacker.status}, Unconscious: ${attacker.unconscious}`;
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

  `[ATTACK CALC] ${
    attacker.name
  } - Damage: ${damage}, Accuracy: ${accuracy}, Hit Chance: ${hitChance}%, Roll: ${hitRoll.toFixed(
    1
  )}`;

  // Generate combat grid with attacker highlighted
  if (hitRoll <= hitChance) {
    const actualDamage = target.takeDamage(damage);
    `[ATTACK HIT] ${attacker.name} hits ${target.name} for ${actualDamage} damage!`;

    // Progress combat skills for successful attack
    if (attacker.character) {
      const primarySkill = getPrimaryWeaponSkill(attacker.character);
      const skillLevel = attacker.character.skills[primarySkill] || 0;
      const skillProgress = Math.max(0.001, 0.033 - skillLevel * 0.003);
      progressSkill(attacker.character, primarySkill, skillProgress);
      `[SKILL PROGRESS] ${attacker.name} gained ${skillProgress.toFixed(
        4
      )} ${primarySkill} experience`;
    }

    const attackMessage = formatAttackMessage(
      attacker,
      target,
      actualDamage,
      true
    );
    const choices = createDialogChoicesWithGrid(
      "combat",
      [{ type: "button", label: "Continue", value: "ok" }],
      attacker
    );

    await getShowChoiceDialog(attackMessage, choices);
  } else {
    `[ATTACK MISS] ${attacker.name} misses ${target.name}!`;
    const attackMessage = formatAttackMessage(attacker, target, 0, false);
    const choices = createDialogChoicesWithGrid(
      "combat",
      [{ type: "button", label: "Continue", value: "ok" }],
      attacker
    );

    await getShowChoiceDialog(attackMessage, choices);
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
    `[SKILL PROGRESS] ${player.name} gained ${shieldProgress.toFixed(
      4
    )} shieldwork experience`;

    // Progress tactics skill
    const tacticsProgress = Math.max(0.001, 0.033 - tacticsSkill * 0.003);
    progressSkill(player.character, "tactics", tacticsProgress);
    `[SKILL PROGRESS] ${player.name} gained ${tacticsProgress.toFixed(
      4
    )} tactics experience`;
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
  `[ALLY TURN] ${ally.name} (${ally.character?.race || "unknown"}) - Status: ${
    ally.status
  }, Health: ${ally.currentHealth}/${ally.maxHealth}, Unconscious: ${
    ally.unconscious
  }, Dead: ${ally.isDead()}`;

  // Check if ally can act
  if (ally.isDead() || ally.isFleeing() || ally.isUnconscious()) {
    `[ALLY TURN] ${ally.name} cannot act - Status: ${ally.status}, Unconscious: ${ally.unconscious}`;
    return;
  }

  // Simple AI for allies
  const combatState = getCombatState();
  const aliveMonsters = combatState.monsters.filter(
    (m) => !m.isDead() && !m.isFleeing() && !m.isUnconscious()
  );

  `[ALLY TARGETS] ${ally.name} can target ${
    aliveMonsters.length
  } monsters: ${aliveMonsters
    .map((m) => `${m.name}(${m.status},${m.currentHealth}/${m.maxHealth})`)
    .join(", ")}`;

  if (aliveMonsters.length === 0) return;

  const target =
    aliveMonsters[Math.floor(Math.random() * aliveMonsters.length)];
  await executeAttack(ally, target);
}

// Monster turn handler
async function handleMonsterTurn(monster) {
  `[MONSTER TURN] ${monster.name} (${monster.race || "unknown"}) - Status: ${
    monster.status
  }, Health: ${monster.currentHealth}/${monster.maxHealth}, Unconscious: ${
    monster.unconscious
  }, Dead: ${monster.isDead()}`;

  // Check if monster can act
  if (monster.isDead() || monster.isFleeing() || monster.isUnconscious()) {
    `[MONSTER TURN] ${monster.name} cannot act - Status: ${monster.status}, Unconscious: ${monster.unconscious}`;
    return;
  }

  // Simple AI for monsters
  const combatState = getCombatState();
  const aliveAllies = combatState.allies.filter(
    (a) => !a.isDead() && !a.isFleeing() && !a.isUnconscious()
  );

  `[MONSTER TARGETS] ${monster.name} can target ${
    aliveAllies.length
  } allies: ${aliveAllies
    .map((a) => `${a.name}(${a.status},${a.currentHealth}/${a.maxHealth})`)
    .join(", ")}`;

  if (aliveAllies.length === 0) return;

  const target = aliveAllies[Math.floor(Math.random() * aliveAllies.length)];
  await executeAttack(monster, target);
}

// Phase 4: Resolution
export async function handleResolutionPhase(status) {
  ("=== RESOLUTION PHASE ===");

  if (status.victory) {
    await getShowChoiceDialog(
      "🏆 VICTORY!\n\nAll enemies have been defeated!\nYour group celebrates their victory.",
      [{ type: "button", label: "Continue", value: "ok" }]
    );

    // Show harvest dialog after victory (includes equipment looting)
    await handleHarvestDialog();
    // Show equipment looting dialog
    await handleEquipmentLootDialog();

    // Sync all skill and health changes back to gameState
    syncSkillsToGameState();
    syncHealthToGameState();

    // Update status display to reflect skill progression
    updateStatus();

    return "victory";
  } else if (status.defeat) {
    await getShowChoiceDialog(
      "💀 DEFEAT!\n\nAll allies have been defeated!\nYour group has fallen in battle.",
      [{ type: "button", label: "Continue", value: "ok" }]
    );

    // Sync skills and health even after defeat
    syncSkillsToGameState();
    syncHealthToGameState();

    // Update status display even after defeat
    updateStatus();

    return "defeat";
  } else if (status.retreat) {
    await getShowChoiceDialog(
      "🏃 RETREAT SUCCESSFUL!\n\nYour group has successfully retreated from combat.\nSome members may be wounded but alive.",
      [{ type: "button", label: "Continue", value: "ok" }]
    );

    // Sync skills and health even after retreat
    syncSkillsToGameState();
    syncHealthToGameState();

    // Update status display even after retreat
    updateStatus();

    return "retreat";
  }

  return "unknown";
}

// Sync skills from combat entities back to gameState
function syncSkillsToGameState() {
  const combatState = getCombatState();
  // Sync player character skills
  const playerAlly = combatState.allies.find((ally) => ally.isPlayer);
  if (playerAlly && playerAlly.character && gameState.playerCharacter) {
    gameState.playerCharacter.skills = { ...playerAlly.character.skills };
    "[SKILL SYNC] Synced player skills:", gameState.playerCharacter.skills;
  }

  // Sync group member skills
  combatState.allies.forEach((ally) => {
    if (!ally.isPlayer && ally.character && ally.id) {
      const groupMember = gameState.group.find((char) => char.id === ally.id);
      if (groupMember) {
        groupMember.skills = { ...ally.character.skills };
        `[SKILL SYNC] Synced ${ally.name} skills:`, groupMember.skills;
      }
    }
  });
}

// Sync health from combat entities back to gameState
function syncHealthToGameState() {
  const combatState = getCombatState();
  // Sync player character health
  const playerAlly = combatState.allies.find((ally) => ally.isPlayer);
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
  combatState.allies.forEach((ally) => {
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
  applyPostCombatHealing();

  // Handle death and remove dead group members
  handlePostCombatDeaths();
}

// Apply post-combat healing to surviving characters
function applyPostCombatHealing() {
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

// Handle post-combat deaths and remove dead group members
function handlePostCombatDeaths() {
  // Check if player character is dead
  if (
    gameState.playerCharacter &&
    gameState.playerCharacter.health.current <=
      -Math.floor(gameState.playerCharacter.health.max / 2)
  ) {
    ("[DEATH] Player character has died!");
    // Player death will be handled by the game's death check system
  }

  // Remove dead group members
  const aliveGroupMembers = gameState.group.filter((member) => {
    const isDead = member.health.current <= -Math.floor(member.health.max / 2);
    if (isDead) {
      "[DEATH] Removing dead group member:", member.firstName, member.lastName;
      logEvent(`💀 ${member.firstName} ${member.lastName} has died in combat`);
    }
    return !isDead;
  });

  // Update group with only living members
  const removedCount = gameState.group.length - aliveGroupMembers.length;
  if (removedCount > 0) {
    gameState.group = aliveGroupMembers;
    "[DEATH] Removed", removedCount, "dead group members";
  }
}

// Handle equipment looting dialog after combat victory
async function handleEquipmentLootDialog() {
  console.log("[LOOT DIALOG] Starting equipment loot dialog");
  const combatState = getCombatState();

  const defeatedMonsters = combatState.monsters.filter(
    (monster) => monster.isDead() || monster.isUnconscious()
  );

  console.log(
    `[LOOT DIALOG] Defeated monsters count: ${defeatedMonsters.length}`
  );

  if (defeatedMonsters.length === 0) {
    console.log("[LOOT DIALOG] No defeated monsters, skipping loot dialog");
    return; // No monsters to loot
  }

  // Collect all equipment from defeated monsters
  const lootableEquipment = [];
  defeatedMonsters.forEach((monster, index) => {
    console.log(
      `[LOOT DIALOG] Checking monster ${index}: ${monster.name} (${monster.race}), equipment:`,
      monster.equipment
    );

    if (monster.equipment) {
      Object.entries(monster.equipment).forEach(([slot, item]) => {
        if (item && typeof item === "string" && !item.startsWith("(")) {
          console.log(
            `[LOOT DIALOG] Found lootable item in slot ${slot}: ${item}`
          );
          lootableEquipment.push({
            monster: monster,
            monsterIndex: index,
            slot: slot,
            item: item,
          });
        }
      });
    } else {
      console.log(
        `[LOOT DIALOG] Monster ${monster.name} has no equipment object`
      );
    }
  });

  console.log(
    `[LOOT DIALOG] Total lootable equipment items: ${lootableEquipment.length}`
  );

  if (lootableEquipment.length === 0) {
    console.log(
      "[LOOT DIALOG] No equipment found on defeated monsters, skipping loot dialog"
    );
    return; // No equipment to loot
  }

  // Import group inventory functions
  const { addToGroupInventory } = await import(
    "../character/characterManagement-system/utils/utils-group-inventory.js"
  );

  let lootMessage = "⚔️ **LOOT EQUIPMENT**\n\n";
  lootMessage += "Equipment found on defeated monsters:\n\n";

  // Create loot options
  const lootOptions = [];
  const groupedByMonster = {};

  // Group equipment by monster
  lootableEquipment.forEach((loot) => {
    if (!groupedByMonster[loot.monsterIndex]) {
      groupedByMonster[loot.monsterIndex] = {
        monster: loot.monster,
        items: [],
      };
    }
    groupedByMonster[loot.monsterIndex].items.push(loot);
  });

  // Create UI for each monster's equipment
  Object.entries(groupedByMonster).forEach(([monsterIndex, data]) => {
    const monster = data.monster;
    const emoji = getRaceEmoji(monster.race);

    lootMessage += `${emoji} ${monster.race} (Level ${monster.level}):\n`;

    data.items.forEach((loot, itemIndex) => {
      const displayText =
        loot.item.length > 50 ? loot.item.substring(0, 47) + "..." : loot.item;
      lootMessage += `  • ${displayText}\n`;

      // Add checkbox for each item
      lootOptions.push({
        type: "checkbox",
        value: `loot_${monsterIndex}_${itemIndex}`,
        label: `${emoji} ${monster.race} - ${displayText}`,
        checked: false,
      });
    });
    lootMessage += "\n";
  });

  lootOptions.push({
    type: "button",
    label: "✅ Loot Selected",
    value: "loot",
  });
  lootOptions.push({
    type: "button",
    label: "❌ Skip Loot",
    value: "skip",
  });

  const lootResult = await getShowChoiceDialog(lootMessage, lootOptions);

  if (lootResult === "skip") {
    return;
  }

  if (lootResult === "loot" || lootResult.value === "loot") {
    let lootedCount = 0;
    const lootedItems = [];

    Object.entries(groupedByMonster).forEach(([monsterIndex, data]) => {
      data.items.forEach((loot, itemIndex) => {
        const checkboxValue = `loot_${monsterIndex}_${itemIndex}`;
        if (lootResult[checkboxValue]) {
          // Add item to group inventory
          addToGroupInventory(loot.item);
          lootedCount++;
          const displayText =
            loot.item.length > 40
              ? loot.item.substring(0, 37) + "..."
              : loot.item;
          lootedItems.push(displayText);
        }
      });
    });

    if (lootedCount > 0) {
      const lootSummary = `✅ Looted ${lootedCount} equipment item${
        lootedCount > 1 ? "s" : ""
      }:\n${lootedItems.join("\n")}`;
      await getShowChoiceDialog(lootSummary, [
        { type: "button", label: "OK", value: "ok" },
      ]);
      logEvent(
        `⚔️ Looted ${lootedCount} equipment item${lootedCount > 1 ? "s" : ""}`
      );
    }
  }
}

// Handle harvest dialog after combat victory
async function handleHarvestDialog() {
  const combatState = getCombatState();
  const defeatedMonsters = combatState.monsters.filter(
    (monster) => monster.isDead() || monster.isUnconscious()
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
    const emoji = getRaceEmoji(monster.race);

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

  "Harvest result:", harvestResult;
  "Harvest result keys:", Object.keys(harvestResult);

  if (harvestResult === "skip") {
    return;
  }

  if (harvestResult === "harvest" || harvestResult.value === "harvest") {
    let harvestedCount = 0;
    let harvestedItems = [];

    "Processing harvest, defeatedMonsters.length:", defeatedMonsters.length;

    for (let i = 0; i < defeatedMonsters.length; i++) {
      `Checking harvest_${i}:`, harvestResult[`harvest_${i}`];
      if (harvestResult[`harvest_${i}`]) {
        const monster = defeatedMonsters[i];
        const head = generateMonsterHead(monster);

        "Generated head:", head;

        if (addHeadToInventory(head)) {
          harvestedCount++;
          harvestedItems.push(
            `${getRaceEmoji(monster.race)} ${monster.race} Head`
          );
          ("Successfully added head to inventory");

          // Progress survival skill for successful harvest
          if (gameState.playerCharacter) {
            const survivalSkill =
              gameState.playerCharacter.skills.survival || 0;
            const skillProgress = Math.max(
              0.001,
              0.033 - survivalSkill * 0.003
            );
            progressSkill(gameState.playerCharacter, "survival", skillProgress);
            `[SKILL PROGRESS] Player gained ${skillProgress.toFixed(
              4
            )} survival experience from harvesting`;
          }
        } else {
          ("Failed to add head to inventory - not enough space");
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
  const combatState = getCombatState();
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
  const combatState = getCombatState();
  const aliveAllies = combatState.allies.filter(
    (a) => !a.isDead() && !a.isFleeing() && !a.isUnconscious()
  );
  const aliveMonsters = combatState.monsters.filter(
    (m) => !m.isDead() && !m.isFleeing() && !m.isUnconscious()
  );

  return {
    victory: aliveMonsters.length === 0,
    defeat: aliveAllies.length === 0,
    combatActive: aliveAllies.length > 0 && aliveMonsters.length > 0,
  };
}
