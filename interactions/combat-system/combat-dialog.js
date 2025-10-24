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
  // Beast races
  Wolf: "🐺",
  Bear: "🐻",
  MountainLion: "🦁",
  // Monster races
  Troll: "👹",
  Dragon: "🐉",
};

// Helper function to get race emoji
function getRaceEmoji(race) {
  return raceEmoji[race] || "👤";
}

// Initialize combat positions for all combatants
function initializeCombatPositions() {
  const gridSize = 10;

  // Define spiral positions for allies (top area)
  const allyPositions = [
    // Core positions for allies (rows 0-2)
    [0, 4],
    [0, 5],
    [0, 6], // Top row
    [1, 3],
    [1, 4],
    [1, 5],
    [1, 6],
    [1, 7], // Middle row
    [2, 2],
    [2, 3],
    [2, 4],
    [2, 5],
    [2, 6],
    [2, 7],
    [2, 8], // Bottom row
    // Extended positions if needed
    [0, 3],
    [0, 7],
    [1, 2],
    [1, 8],
    [2, 1],
    [2, 9],
  ];

  // Define spiral positions for monsters (bottom area)
  const monsterPositions = [
    // Core positions for monsters (rows 7-9)
    [7, 2],
    [7, 3],
    [7, 4],
    [7, 5],
    [7, 6],
    [7, 7],
    [7, 8], // Top row
    [8, 3],
    [8, 4],
    [8, 5],
    [8, 6],
    [8, 7], // Middle row
    [9, 4],
    [9, 5],
    [9, 6], // Bottom row
    // Extended positions if needed
    [7, 1],
    [7, 9],
    [8, 2],
    [8, 8],
    [9, 3],
    [9, 7],
  ];

  // Position allies using spiral pattern
  combatState.allies.forEach((ally, index) => {
    const pos = allyPositions[index] || [1, 4]; // Fallback position
    // Add unique ID to ally
    ally.combatId = index;
    // Use a consistent key format
    const allyKey = `ally_${index}`;
    combatState.positions.allies[allyKey] = {
      row: pos[0],
      col: pos[1],
    };
  });

  // Position monsters using spiral pattern
  combatState.monsters.forEach((monster, index) => {
    const pos = monsterPositions[index] || [8, 5]; // Fallback position
    // Add unique ID to monster
    monster.combatId = index;
    // Use a consistent key format
    const monsterKey = `monster_${index}`;
    combatState.positions.monsters[monsterKey] = {
      row: pos[0],
      col: pos[1],
    };
  });
}

// Generate combat grid for visualization
function generateCombatGrid(phase, currentCombatant = null) {
  const tiles = {};
  const gridSize = 10;

  // Add allies to grid
  Object.keys(combatState.positions.allies).forEach((allyId) => {
    const position = combatState.positions.allies[allyId];
    // Extract index from ally key (ally_0, ally_1, etc.)
    const allyIndex = parseInt(allyId.split("_")[1]);
    const ally = combatState.allies[allyIndex];

    if (ally && position) {
      const cellKey = `${position.row}-${position.col}`;
      // Show skull emoji for dead allies, race emoji for living ones
      const emoji = ally.isDead()
        ? "💀"
        : getRaceEmoji(ally.character?.race || ally.race);
      const name = ally.name || `Ally ${allyIndex + 1}`;
      // Add ID to name for better identification
      const displayName = `${name} (#${ally.combatId + 1})`;

      // Determine background color
      let backgroundColor = "#4169E1"; // Royal Blue for allies
      if (ally.isPlayer) {
        backgroundColor = "#FFD700"; // Gold for player
      }

      // Change background color if this is the current combatant
      if (currentCombatant && currentCombatant === ally) {
        if (ally.isPlayer) {
          backgroundColor = "#FFA500"; // Orange for active player
        } else {
          backgroundColor = "#FF6B6B"; // Light red for active ally
        }
      }

      tiles[cellKey] = {
        emoji: emoji,
        name: displayName,
        backgroundColor: backgroundColor,
        characterIndex: allyIndex,
      };
    }
  });

  // Add monsters to grid
  Object.keys(combatState.positions.monsters).forEach((monsterId) => {
    const position = combatState.positions.monsters[monsterId];
    // Extract index from monster key (monster_0, monster_1, etc.)
    const monsterIndex = parseInt(monsterId.split("_")[1]);
    const monster = combatState.monsters[monsterIndex];

    if (monster && position) {
      const cellKey = `${position.row}-${position.col}`;
      const isDetected =
        phase === "detection" ? combatState.enemiesDetected : true;

      let emoji, backgroundColor, name;

      if (isDetected) {
        // Show skull emoji for dead creatures, race emoji for living ones
        emoji = monster.isDead() ? "💀" : getRaceEmoji(monster.race);
        backgroundColor = "#DC143C"; // Crimson Red for detected enemies
        name = monster.name || `Monster ${monsterIndex + 1}`;
        // Add ID to name for better identification
        name = `${name} (#${monster.combatId + 1})`;
      } else {
        emoji = "?";
        backgroundColor = "#808080"; // Gray for undetected enemies
        name = `Unknown Enemy (#${monster.combatId + 1})`;
      }

      // Change background color if this is the current combatant
      if (currentCombatant && currentCombatant === monster) {
        backgroundColor = "#FF4500"; // Orange-red for active monster
      }

      tiles[cellKey] = {
        emoji: emoji,
        name: name,
        backgroundColor: backgroundColor,
        characterIndex: monsterIndex,
      };
    }
  });

  return tiles;
}

// Update positions based on engagement choices
function updatePositionsForEngagement(playerChoice, enemyChoice) {
  const gridSize = 10;

  // Calculate movement distances
  const playerMovement = getMovementDistance(playerChoice);
  const enemyMovement = getMovementDistance(enemyChoice);

  // Update ally positions (move down)
  Object.keys(combatState.positions.allies).forEach((allyId) => {
    const position = combatState.positions.allies[allyId];
    if (position) {
      position.row = Math.min(gridSize - 1, position.row + playerMovement);
    }
  });

  // Update monster positions (move up)
  Object.keys(combatState.positions.monsters).forEach((monsterId) => {
    const position = combatState.positions.monsters[monsterId];
    if (position) {
      position.row = Math.max(0, position.row - enemyMovement);
    }
  });
}

// Get movement distance based on action choice
function getMovementDistance(choice) {
  switch (choice) {
    case "charge":
      return 2; // Move 2 rows closer
    case "attack":
      return 1; // Move 1 row closer
    case "stalk":
      return 3; // Move 3 rows closer (stealth approach)
    case "flee":
      return 0; // Stay at same position
    default:
      return 0;
  }
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
  positions: { allies: {}, monsters: {} }, // Track grid positions
  turnCount: 0,
  playerDetected: false,
  enemiesDetected: false,
  initiativeOrder: [],
  currentTurn: 0,
  combatActive: false,
};

export async function handleEnhancedCombatDialog(ex, ey, isOnTile = false) {
  `Starting enhanced combat dialog at (${ex}, ${ey})`;

  // Reset combat state
  combatState = {
    phase: COMBAT_PHASES.DETECTION,
    allies: [],
    monsters: [],
    positions: { allies: {}, monsters: {} }, // Track grid positions
    turnCount: 0,
    playerDetected: false,
    enemiesDetected: false,
    initiativeOrder: [],
    currentTurn: 0,
    combatActive: false,
  };

  // Generate combatants
  combatState.allies = await generateAllies();

  // Generate monsters with random selection
  const baseMonsterCount = Math.floor(Math.random() * 3) + 1; // 1-3 monsters
  const groupMemberCount = gameState.group ? gameState.group.length : 1;
  const bonusMonsterCount = Math.max(1, Math.floor(groupMemberCount / 2));
  const monsterCount = baseMonsterCount + bonusMonsterCount;

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

  combatState.monsters = await generateMonsters(
    monsterCount,
    selectedTypes[0],
    ex,
    ey
  );

  `Generated ${combatState.allies.length} allies and ${combatState.monsters.length} monsters`;

  // Initialize positions for all combatants
  initializeCombatPositions();

  // Start with detection phase
  return await handleDetectionPhase();
}

// Phase 1: Detection
async function handleDetectionPhase() {
  ("=== DETECTION PHASE ===");

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

  // Generate combat grid for detection phase
  const combatGrid = generateCombatGrid("detection");

  await getShowChoiceDialog(detectionMessage, [
    { type: "squaregrid", tiles: combatGrid },
    { type: "button", label: "Continue", value: "continue" },
  ]);

  // Move to engagement phase
  combatState.phase = COMBAT_PHASES.ENGAGEMENT;
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
    combatState.combatActive = false;
    combatState.phase = COMBAT_PHASES.NONE;

    // Log the event
    logEvent("Both sides fled from combat. No battle occurred.");

    return { success: true, combatEnded: true };
  }

  message += "Combat begins!";

  // Update positions based on engagement choices
  updatePositionsForEngagement(playerChoice, enemyChoice);

  // Generate updated combat grid
  const updatedGrid = generateCombatGrid("engagement");

  await getShowChoiceDialog(message, [
    { type: "squaregrid", tiles: updatedGrid },
    { type: "button", label: "Begin Combat", value: "begin" },
  ]);

  // Apply engagement bonuses/penalties
  applyEngagementModifiers(outcome);

  // Start combat with modified initiative
  combatState.initiativeOrder = await calculateInitiativeOrder(
    outcome.playerInitiativeBonus,
    outcome.playerStealthBonus || false,
    outcome.enemyInitiativeBonus || false
  );
  combatState.combatActive = true;
  combatState.phase = COMBAT_PHASES.COMBAT;

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
    combatState.playerEngagementBonus = {
      accuracy: 5,
      damage: 2,
      initiative: 10,
    };
  } else if (outcome.type === "enemy_advantage") {
    // Enemies get small bonuses
    combatState.enemyEngagementBonus = {
      accuracy: 5,
      damage: 2,
      initiative: 10,
    };
  }
}

// Phase 2: Engagement
async function handleEngagementPhase() {
  ("=== ENGAGEMENT PHASE ===");

  let engagementMessage = "⚔️ ENGAGEMENT PHASE\n\n";

  if (combatState.enemiesDetected) {
    engagementMessage += `You have spotted ${combatState.monsters.length} ${
      combatState.monsters.length > 0 ? "enemies" : "enemy"
    }:\n`;
    combatState.monsters.forEach((monster, index) => {
      const emoji = getRaceEmoji(monster.race);
      engagementMessage += `${index + 1}. ${monster.name} (#${
        monster.combatId + 1
      }) (${monster.race} ${emoji} ${monster.class} Lv.${monster.level})\n`;
    });

    // Check if enemies also detected the player group
    if (combatState.playerDetected) {
      engagementMessage += `\n⚠️ The enemies have also spotted your group!\n`;
      engagementMessage += `Both sides are aware of each other and must choose their approach.\n\n`;

      // Determine enemy engagement choice
      const enemyChoice = determineEnemyEngagementChoice();
      combatState.enemyEngagementChoice = enemyChoice;

      engagementMessage += `The enemies are preparing to: ${getEngagementChoiceDescription(
        enemyChoice
      )}\n\n`;
    }

    engagementMessage += `What do you want to do?`;

    // Generate combat grid for engagement phase
    const combatGrid = generateCombatGrid("engagement");

    const choices = [
      { type: "squaregrid", tiles: combatGrid },
      { type: "button", label: "⚡ Charge Attack", value: "charge" },
      { type: "button", label: "🎯 Careful Attack", value: "attack" },
      { type: "button", label: "🥷 Stalk", value: "stalk" },
      { type: "button", label: "🏃 Run Away", value: "flee" },
    ];

    const choice = await getShowChoiceDialog(engagementMessage, choices);

    // Handle simultaneous engagement choices
    if (combatState.playerDetected && combatState.enemyEngagementChoice) {
      return await handleSimultaneousEngagement(
        choice,
        combatState.enemyEngagementChoice
      );
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

  // Generate updated combat grid
  const updatedGrid = generateCombatGrid("engagement");

  // Charge gives initiative bonus but higher risk
  combatState.initiativeOrder = await calculateInitiativeOrder(
    true,
    false,
    false
  ); // Charge bonus
  combatState.combatActive = true;
  combatState.phase = COMBAT_PHASES.COMBAT;

  await getShowChoiceDialog(
    "⚡ CHARGE ATTACK!\n\nYour group charges forward with battle cries!\nYou gain initiative bonus but enemies are alerted.",
    [
      { type: "squaregrid", tiles: updatedGrid },
      { type: "button", label: "Begin Combat", value: "begin" },
    ]
  );

  return await handleCombatPhase();
}

async function handleCarefulAttack() {
  ("Player chooses: Careful Attack");

  // Update positions for careful attack
  updatePositionsForEngagement("attack", "attack"); // Assume enemy does careful attack

  // Generate updated combat grid
  const updatedGrid = generateCombatGrid("engagement");

  // Careful attack - normal initiative
  combatState.initiativeOrder = await calculateInitiativeOrder(
    false,
    false,
    false
  );
  combatState.combatActive = true;
  combatState.phase = COMBAT_PHASES.COMBAT;

  await getShowChoiceDialog(
    "🎯 CAREFUL ATTACK\n\nYour group approaches cautiously, weapons ready.\nNormal initiative rolls.",
    [
      { type: "squaregrid", tiles: updatedGrid },
      { type: "button", label: "Begin Combat", value: "begin" },
    ]
  );

  return await handleCombatPhase();
}

async function handleStalk() {
  ("Player chooses: Stalk");

  // Update positions for stalk
  updatePositionsForEngagement("stalk", "attack"); // Assume enemy does careful attack

  // Generate updated combat grid
  const updatedGrid = generateCombatGrid("engagement");

  // Stalk gives stealth bonus but might fail
  const stalkSuccess = Math.random() < 0.7; // 70% chance of success

  if (stalkSuccess) {
    combatState.initiativeOrder = await calculateInitiativeOrder(
      false,
      true,
      false
    ); // Stealth bonus
    combatState.combatActive = true;
    combatState.phase = COMBAT_PHASES.COMBAT;

    await getShowChoiceDialog(
      "🥷 STALKING SUCCESS\n\nYour group successfully stalks the enemies.\nYou gain stealth bonus to initiative.",
      [
        { type: "squaregrid", tiles: updatedGrid },
        { type: "button", label: "Begin Combat", value: "begin" },
      ]
    );
  } else {
    await getShowChoiceDialog(
      "🥷 STALKING FAILED\n\nYour group is detected while stalking!\nEnemies gain initiative bonus.",
      [
        { type: "squaregrid", tiles: updatedGrid },
        { type: "button", label: "Begin Combat", value: "begin" },
      ]
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
  ("Enemies surprise attack");

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
  ("Initiative-based combat");

  // Normal initiative rolls
  combatState.initiativeOrder = await calculateInitiativeOrder(
    false,
    false,
    false
  );
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

    // Generate combat grid with current combatant highlighted
    const combatGrid = generateCombatGrid("combat", currentCombatant);

    if (currentCombatant.isPlayer) {
      // Player turn
      const playerResult = await handlePlayerTurn(currentCombatant, combatGrid);
      // Check if player retreated or fled successfully
      if (playerResult === "retreated" || playerResult === "fled") {
        combatState.combatActive = false;
        return await handleResolutionPhase({ retreat: true });
      }
    } else if (currentCombatant.character) {
      // Ally turn
      await handleAllyTurn(currentCombatant, combatGrid);
    } else {
      // Monster turn
      await handleMonsterTurn(currentCombatant, combatGrid);
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
async function handlePlayerTurn(player, combatGrid) {
  console.log(`Player turn: ${player.name}`);

  const aliveMonsters = combatState.monsters.filter(
    (m) => !m.isDead() && !m.isFleeing()
  );

  if (aliveMonsters.length === 0) {
    return; // No targets
  }

  let combatMessage = `⚔️ YOUR TURN\n\nHealth: ${player.currentHealth}/${player.maxHealth}\n\n`;
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
    combatMessage += `${index + 1}. ${monster.name} (#${
      monster.combatId + 1
    }) ${emoji} (${monster.currentHealth}/${monster.maxHealth} HP)\n`;
  });

  const choices = [
    { type: "squaregrid", tiles: combatGrid },
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
      targetMessage += `${index + 1}. ${target.name} (#${
        target.combatId + 1
      }) ${emoji} (${target.currentHealth}/${target.maxHealth} HP)\n`;
    });

    const targetChoices = targets.map((target, index) => {
      const emoji = getRaceEmoji(target.race);
      return {
        type: "button",
        label: `${target.name} (#${target.combatId + 1}) ${emoji} (${
          target.currentHealth
        }/${target.maxHealth} HP)`,
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
  const combatGrid = generateCombatGrid("combat", attacker);

  if (hitRoll <= hitChance) {
    const actualDamage = target.takeDamage(damage);
    const attackerEmoji = getRaceEmoji(
      attacker.character?.race || attacker.race
    );
    const targetEmoji = getRaceEmoji(target.character?.race || target.race);
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

    await getShowChoiceDialog(
      `⚔️ ${attacker.name} ${attackerEmoji} attacks ${target.name} ${targetEmoji} for ${actualDamage} damage!`,
      [
        { type: "squaregrid", tiles: combatGrid },
        { type: "button", label: "Continue", value: "ok" },
      ]
    );
  } else {
    const attackerEmoji = getRaceEmoji(
      attacker.character?.race || attacker.race
    );
    const targetEmoji = getRaceEmoji(target.character?.race || target.race);
    `[ATTACK MISS] ${attacker.name} misses ${target.name}!`;
    await getShowChoiceDialog(
      `⚔️ ${attacker.name} ${attackerEmoji} attacks ${target.name} ${targetEmoji} but misses!`,
      [
        { type: "squaregrid", tiles: combatGrid },
        { type: "button", label: "Continue", value: "ok" },
      ]
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
async function handleAllyTurn(ally, combatGrid) {
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
  const aliveMonsters = combatState.monsters.filter(
    (m) => !m.isDead() && !m.isFleeing()
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
async function handleMonsterTurn(monster, combatGrid) {
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
  const aliveAllies = combatState.allies.filter(
    (a) => !a.isDead() && !a.isFleeing()
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
async function handleResolutionPhase(status) {
  ("=== RESOLUTION PHASE ===");

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
  } else if (status.retreat) {
    await getShowChoiceDialog(
      "🏃 RETREAT SUCCESSFUL!\n\nYour group has successfully retreated from combat.\nSome members may be wounded but alive.",
      [{ type: "button", label: "Continue", value: "ok" }]
    );

    // Sync skills even after retreat
    syncSkillsToGameState();

    // Update status display even after retreat
    updateStatus();

    return "retreat";
  }

  return "unknown";
}

// Sync skills from combat entities back to gameState
function syncSkillsToGameState() {
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
            `${getLootRaceEmoji(monster.race)} ${monster.race} Head`
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
