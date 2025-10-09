import { gameState } from "../gamestate/game_variables.js";
import { showChoiceDialog } from "./showDialog.js";
import { getGroupBonus, hash } from "../utils.js";
import { updateStatus } from "../rendering.js";
import { logEvent } from "../time_system.js";
import { getTile } from "../rendering/tile.js";
import { checkDeath } from "../utils.js";

// Combat entity classes
class CombatEntity {
  constructor(name, maxHealth, role = null) {
    this.name = name;
    this.maxHealth = maxHealth;
    this.currentHealth = maxHealth;
    this.wounds = 0;
    this.status = "active"; // active, fleeing, dead
    this.role = role;
  }

  takeDamage(amount) {
    this.currentHealth -= amount;
    this.wounds = Math.floor(
      (this.maxHealth - this.currentHealth) / (this.maxHealth / 4)
    );
    if (this.currentHealth <= 0) {
      this.status = "dead";
      this.currentHealth = 0;
    }
  }

  heal(amount) {
    this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
    this.wounds = Math.floor(
      (this.maxHealth - this.currentHealth) / (this.maxHealth / 4)
    );
  }

  isDead() {
    return this.status === "dead";
  }

  isFleeing() {
    return this.status === "fleeing";
  }

  flee() {
    this.status = "fleeing";
  }
}

class Monster extends CombatEntity {
  constructor(name, maxHealth, detectionValue = 0, x = 0, y = 0) {
    super(name, maxHealth);
    this.detectionValue = detectionValue;
    this.x = x;
    this.y = y;
    this.rarity = "common";
    this.attackLevel = { min: 1, max: 2 };
    this.killValue = 1;
    this.discoveryMessages = [];
    this.detectionMessages = [];
    // Use hash to determine wounds deterministically
    const woundHash = hash(x, y, 200);
    this.maxWounds = Math.floor(woundHash * 2) + 2; // 2-3 wounds
  }

  takeDamage(amount) {
    super.takeDamage(amount);
    if (this.wounds >= this.maxWounds) {
      this.status = "dead";
    }
  }

  getDamage() {
    const damageRange = this.attackLevel.max - this.attackLevel.min;
    return this.attackLevel.min + Math.floor(Math.random() * (damageRange + 1));
  }
}

class Ally extends CombatEntity {
  constructor(name, role, maxHealth = 5) {
    super(name, maxHealth, role);
    this.maxWounds = 5; // Allies die after 5 wounds
    this.unconscious = false;
  }

  takeDamage(amount) {
    // If already unconscious, take damage kills the ally
    if (this.unconscious) {
      this.status = "dead";
      return;
    }

    super.takeDamage(amount);

    // If health reaches 0, become unconscious instead of dead
    if (this.currentHealth <= 0) {
      this.unconscious = true;
      this.status = "unconscious";
      this.currentHealth = 0; // Ensure health doesn't go below 0
    }

    // Still check wounds for death
    if (this.wounds >= this.maxWounds) {
      this.status = "dead";
    }
  }

  getDamage() {
    return Math.floor(Math.random() * 2) + 1; // 1-2 damage
  }

  isUnconscious() {
    return this.unconscious;
  }

  isDead() {
    return this.status === "dead";
  }

  isFleeing() {
    return this.status === "fleeing";
  }
}

// Detection system
function calculateDetectionBonus() {
  let detectionBonus = 0;

  gameState.group.forEach((member) => {
    const cleanRole = member.role.replace(/[^\w-]/g, "");
    switch (cleanRole) {
      case "native-guide":
        detectionBonus += 3; // High detection
        break;
      case "guard":
        detectionBonus += 2; // Medium detection
        break;
      case "biologist":
        detectionBonus += 2; // Medium detection
        break;
      case "explorer":
        detectionBonus += 3; // High detection
        break;
      case "navigator":
        detectionBonus += 2; // Medium detection
        break;
    }
  });

  return detectionBonus;
}

function generateDetectionMessage(monsters) {
  if (monsters.length === 0) {
    return "You find no signs of creatures in the area.";
  }

  // Group monsters by type for better descriptions
  const monsterGroups = {};
  monsters.forEach((monster) => {
    if (!monsterGroups[monster.name]) {
      monsterGroups[monster.name] = [];
    }
    monsterGroups[monster.name].push(monster);
  });

  const descriptions = [];

  Object.keys(monsterGroups).forEach((monsterType) => {
    const group = monsterGroups[monsterType];
    const count = group.length;
    const monster = group[0]; // Use first monster for description

    // Get random discovery message for this creature type
    const discoveryMessage = getRandomDiscoveryMessage(monster);

    if (count === 1) {
      descriptions.push(discoveryMessage);
    } else {
      descriptions.push(`${discoveryMessage} You count ${count} of them.`);
    }
  });

  return descriptions.join(" ");
}

// Stealth system
function calculateStealthModifier() {
  let stealthModifier = 0;

  gameState.group.forEach((member) => {
    const cleanRole = member.role.replace(/[^\w-]/g, "");
    switch (cleanRole) {
      case "carrier":
      case "medic":
      case "cook":
      case "biologist":
      case "geologist":
        stealthModifier -= 1; // Noisy members
        break;
      case "native-guide":
      case "explorer":
        stealthModifier += 1; // Stealthy members
        break;
    }
  });

  return stealthModifier;
}

// Initiative system
function calculateInitiative(playerChoice, stealthModifier) {
  let baseInitiative = 0;

  switch (playerChoice) {
    case "charge":
      baseInitiative = 12; // Very hard for monsters to beat
      break;
    case "attack":
      baseInitiative = 8; // Good chance to beat monsters
      break;
    case "stalk":
    case "keep_distance":
      baseInitiative = 7; // Medium-hard, influenced by stealth
      break;
    case "run":
      baseInitiative = 2; // Very low initiative for running
      break;
  }

  // Stealth affects initiative for stalk/keep distance
  if (playerChoice === "stalk" || playerChoice === "keep_distance") {
    baseInitiative += stealthModifier;
  }

  const playerRoll = Math.random() * 10 + baseInitiative;
  const monsterRoll = Math.random() * 10 + 5; // Base monster initiative

  console.log(
    `Initiative Debug - Base: ${baseInitiative}, Player Roll: ${playerRoll.toFixed(
      2
    )}, Monster Roll: ${monsterRoll.toFixed(2)}, Player Wins: ${
      playerRoll > monsterRoll
    }`
  );

  return playerRoll > monsterRoll;
}

// Monster generation
function generateMonsters(count, entityType, x, y) {
  const monsters = [];

  // Define creature types with detailed properties
  const creatureDatabase = {
    monster: [
      {
        name: "Goblin",
        rarity: "common",
        health: { min: 6, max: 10 },
        attack: { min: 1, max: 2 },
        killValue: 3,
        teamComposition: "pack", // Can be in groups
        allies: ["Orc"], // Can ally with orcs
        discoveryMessages: [
          "Small, crude footprints scatter the ground.",
          "You hear faint chittering and see small claw marks.",
          "Crude weapons and scraps of cloth litter the area.",
          "The smell of something foul and unwashed lingers.",
        ],
        detectionMessages: [
          "You spot small, hunched figures moving in the shadows.",
          "Goblin scouts emerge from behind rocks, brandishing crude weapons.",
          "The chittering grows louder as goblins reveal themselves.",
          "Small, green-skinned creatures step into view, eyes gleaming with malice.",
        ],
      },
      {
        name: "Orc",
        rarity: "common",
        health: { min: 8, max: 12 },
        attack: { min: 1, max: 3 },
        killValue: 4,
        teamComposition: "pack", // Can be in groups
        allies: ["Goblin", "Wolf"], // Can ally with goblins and wolves
        discoveryMessages: [
          "Large, heavy footprints mark the earth.",
          "You find crude armor and weapons discarded nearby.",
          "The ground shows signs of heavy, aggressive movement.",
          "Broken shields and bloodstained weapons tell of recent battle.",
        ],
        detectionMessages: [
          "Massive, green-skinned warriors emerge from cover.",
          "Orc raiders brandish their weapons and roar in challenge.",
          "Heavy footsteps announce the arrival of orc warriors.",
          "Muscular figures clad in crude armor step forward menacingly.",
        ],
      },
      {
        name: "Troll",
        rarity: "uncommon",
        health: { min: 12, max: 18 },
        attack: { min: 2, max: 3 },
        killValue: 6,
        teamComposition: "solo", // Usually alone
        allies: [], // No allies
        discoveryMessages: [
          "Massive footprints sink deep into the earth.",
          "You find bones and debris scattered around a crude camp.",
          "The ground trembles where something enormous has passed.",
          "Broken trees and crushed rocks mark the troll's path.",
        ],
        detectionMessages: [
          "A towering troll emerges from behind a boulder, club raised.",
          "The ground shakes as a massive troll lumbers into view.",
          "A hulking figure with thick hide steps forward menacingly.",
          "The troll's roar echoes as it reveals its massive form.",
        ],
      },
      {
        name: "Dragon",
        rarity: "legendary",
        health: { min: 20, max: 30 },
        attack: { min: 3, max: 5 },
        killValue: 15,
        teamComposition: "solo", // Always alone
        allies: [], // No allies
        discoveryMessages: [
          "The ground is scorched and melted where fire has touched.",
          "Massive claw marks gouge deep into stone and earth.",
          "You find scales the size of shields scattered about.",
          "The air itself seems to shimmer with residual heat.",
        ],
        detectionMessages: [
          "A massive dragon's shadow darkens the sky as it descends.",
          "The dragon's roar shakes the very ground beneath your feet.",
          "Wings spread wide, the ancient dragon reveals its terrible majesty.",
          "Fire dances in the dragon's eyes as it lands with earth-shaking force.",
        ],
      },
      {
        name: "Demon",
        rarity: "rare",
        health: { min: 15, max: 22 },
        attack: { min: 2, max: 4 },
        killValue: 10,
        teamComposition: "solo_or_pair", // Alone or with other demons
        allies: ["Demon"], // Can ally with other demons
        discoveryMessages: [
          "The ground is blackened and cracked with unnatural heat.",
          "You find twisted, otherworldly tracks that seem to burn the earth.",
          "The air itself feels wrong, heavy with malevolent energy.",
          "Strange symbols are carved into the ground, glowing faintly red.",
        ],
        detectionMessages: [
          "Reality itself seems to warp as a demon materializes before you.",
          "The demon's eyes burn with hellish fire as it steps from shadow.",
          "A creature of pure malice emerges, its form shifting and unnatural.",
          "The very air ignites as the demon reveals its true form.",
        ],
      },
    ],
    beast: [
      {
        name: "Wolf",
        rarity: "common",
        health: { min: 5, max: 8 },
        attack: { min: 1, max: 2 },
        killValue: 2,
        teamComposition: "pack", // Usually in packs
        allies: ["Orc"], // Can ally with orcs
        discoveryMessages: [
          "Paw prints and fur tufts mark the wolf's passage.",
          "You hear distant howling carried on the wind.",
          "Scattered bones and tufts of fur tell of recent hunting.",
          "The ground shows the tracks of a pack on the move.",
        ],
        detectionMessages: [
          "Yellow eyes gleam in the shadows as wolves emerge.",
          "The pack circles, their growls growing louder.",
          "Wolves step from the undergrowth, teeth bared.",
          "The alpha wolf leads its pack into view, eyes fixed on you.",
        ],
      },
      {
        name: "Bear",
        rarity: "uncommon",
        health: { min: 10, max: 15 },
        attack: { min: 2, max: 3 },
        killValue: 5,
        teamComposition: "solo", // Usually alone
        allies: [], // No allies
        discoveryMessages: [
          "Massive claw marks scar the trees and ground.",
          "You find a den with bones and the smell of wild animal.",
          "The earth is torn where powerful claws have dug deep.",
          "Broken branches and scattered fur mark the bear's territory.",
        ],
        detectionMessages: [
          "A massive bear rises on its hind legs, roaring in challenge.",
          "The bear emerges from the forest, claws extended.",
          "Muscle ripples under thick fur as the bear steps forward.",
          "The bear's roar echoes as it reveals its massive form.",
        ],
      },
      {
        name: "Mountain Lion",
        rarity: "uncommon",
        health: { min: 8, max: 12 },
        attack: { min: 2, max: 3 },
        killValue: 4,
        teamComposition: "solo", // Usually alone
        allies: [], // No allies
        discoveryMessages: [
          "Silent paw prints show the cat's careful approach.",
          "You find scratch marks high on tree trunks.",
          "The ground shows signs of a predator's patient stalking.",
          "Tufts of tawny fur caught on branches mark its passage.",
        ],
        detectionMessages: [
          "Golden eyes appear in the shadows before the cat emerges.",
          "The mountain lion steps forward with deadly grace.",
          "Muscle and sinew move with predatory precision.",
          "The cat's tail flicks as it prepares to strike.",
        ],
      },
    ],
  };

  const creatureTypes =
    creatureDatabase[entityType] || creatureDatabase["monster"];

  // Generate team composition based on creature type
  const teamComposition = generateTeamComposition(count, creatureTypes, x, y);

  teamComposition.forEach((creatureTemplate, index) => {
    // Use hash to determine health deterministically
    const healthHash = hash(x, y, index + 100);
    const healthRange =
      creatureTemplate.health.max - creatureTemplate.health.min;
    const health =
      creatureTemplate.health.min + Math.floor(healthHash * (healthRange + 1));

    // Create monster with template properties
    const monster = new Monster(creatureTemplate.name, health, 0, x, y);
    monster.rarity = creatureTemplate.rarity;
    monster.attackLevel = creatureTemplate.attack;
    monster.killValue = creatureTemplate.killValue;
    monster.discoveryMessages = creatureTemplate.discoveryMessages;
    monster.detectionMessages = creatureTemplate.detectionMessages;

    monsters.push(monster);
  });

  return monsters;
}

// Team composition logic
function generateTeamComposition(requestedCount, creatureTypes, x, y) {
  const team = [];

  // Use hash to determine primary creature type
  const primaryHash = hash(x, y, 0);
  const primaryCreature =
    creatureTypes[Math.floor(primaryHash * creatureTypes.length)];

  // Determine team size based on creature type
  let teamSize = requestedCount;

  if (primaryCreature.teamComposition === "solo") {
    teamSize = 1; // Solo creatures are always alone
  } else if (primaryCreature.teamComposition === "solo_or_pair") {
    teamSize = Math.min(requestedCount, 2); // Max 2 demons
  } else if (primaryCreature.teamComposition === "pack") {
    teamSize = Math.min(requestedCount, 4); // Max 4 for pack creatures
  }

  // Add primary creature
  team.push(primaryCreature);

  // Add allies if applicable
  if (
    teamSize > 1 &&
    primaryCreature.allies &&
    primaryCreature.allies.length > 0
  ) {
    const remainingSlots = teamSize - 1;

    for (let i = 0; i < remainingSlots; i++) {
      // Use hash to determine ally type
      const allyHash = hash(x, y, i + 1);
      const allyTypeName =
        primaryCreature.allies[
          Math.floor(allyHash * primaryCreature.allies.length)
        ];

      // Find ally creature template
      const allyCreature = creatureTypes.find(
        (creature) => creature.name === allyTypeName
      );
      if (allyCreature) {
        team.push(allyCreature);
      } else {
        // If ally not found, add another of the same type
        team.push(primaryCreature);
      }
    }
  }

  return team;
}

// Utility functions for creature messages
function getRandomDiscoveryMessage(monster) {
  if (monster.discoveryMessages && monster.discoveryMessages.length > 0) {
    const randomIndex = Math.floor(
      Math.random() * monster.discoveryMessages.length
    );
    return monster.discoveryMessages[randomIndex];
  }
  return "You find signs of a creature's presence.";
}

function getRandomDetectionMessage(monster) {
  if (monster.detectionMessages && monster.detectionMessages.length > 0) {
    const randomIndex = Math.floor(
      Math.random() * monster.detectionMessages.length
    );
    return monster.detectionMessages[randomIndex];
  }
  return "A creature emerges from the shadows.";
}

function getCreatureRarityColor(rarity) {
  switch (rarity) {
    case "common":
      return "#888888";
    case "uncommon":
      return "#00ff00";
    case "rare":
      return "#0080ff";
    case "legendary":
      return "#ff8000";
    case "mythic":
      return "#ff0080";
    default:
      return "#888888";
  }
}

// Ally generation
function generateAllies() {
  const allies = [];

  // Include all group members (including player as first ally)
  gameState.group.forEach((member, index) => {
    if (index === 0) {
      // Player character gets better stats
      allies.push(new Ally(gameState.name || "Player", "player", 12));
    } else {
      allies.push(new Ally(member.role, member.role, 8));
    }
  });

  return allies;
}

// Combat display
function getCombatStatus(allies, monsters, turnCount = 0) {
  let status = `⚔️ **COMBAT STATUS** - Round ${turnCount} ⚔️\n\n`;

  status += "👥 **Allies:**\n";
  allies.forEach((ally, index) => {
    const healthBar =
      "█".repeat(Math.max(0, ally.maxHealth - ally.wounds)) +
      "░".repeat(ally.wounds);

    let statusText = ally.status;
    if (ally.isUnconscious()) {
      statusText = "😵 Unconscious";
    } else if (ally.isDead()) {
      statusText = "💀 Dead";
    } else if (ally.isFleeing()) {
      statusText = "🏃 Fleeing";
    } else {
      statusText = "⚔️ Active";
    }

    status += `${index + 1}. ${ally.name} (${
      ally.role
    }) - ${statusText} [${healthBar}] ${ally.currentHealth}/${
      ally.maxHealth
    }\n`;
  });

  status += "\n👹 **Enemies:**\n";
  monsters.forEach((monster, index) => {
    const healthBar =
      "█".repeat(Math.max(0, monster.maxHealth - monster.wounds)) +
      "░".repeat(monster.wounds);
    status += `${index + 1}. ${monster.name} - ${
      monster.status
    } [${healthBar}] ${monster.currentHealth}/${monster.maxHealth}\n`;
  });

  return status;
}

// AI behavior
function allyAI(allies, monsters, turnCount = 0) {
  const activeAllies = allies.filter(
    (ally) => !ally.isDead() && !ally.isFleeing() && !ally.isUnconscious()
  );
  const activeMonsters = monsters.filter(
    (monster) => !monster.isDead() && !monster.isFleeing()
  );

  console.log(
    `Round ${turnCount} - Ally AI: ${activeAllies.length} active allies, ${activeMonsters.length} active monsters`
  );

  if (activeMonsters.length === 0) {
    console.log("Round ${turnCount} - Ally AI: No monsters to attack");
    return;
  }

  activeAllies.forEach((ally) => {
    // Allies attack the most wounded monster
    const target = activeMonsters.reduce((prev, current) =>
      prev.wounds > current.wounds ? prev : current
    );

    const damage = ally.getDamage();
    const oldHealth = target.currentHealth;
    target.takeDamage(damage);
    const newHealth = target.currentHealth;

    console.log(
      `Round ${turnCount} - ${ally.name} attacks ${target.name}: ${damage} damage (${oldHealth} → ${newHealth} HP)`
    );
    logEvent(`${ally.name} attacks ${target.name} for ${damage} damage!`);

    // Chance to flee if heavily wounded
    if (ally.wounds >= 3 && Math.random() < 0.3) {
      ally.flee();
      console.log(`Round ${turnCount} - ${ally.name} flees from combat!`);
      logEvent(`${ally.name} flees from combat!`);
    }
  });
}

function monsterAI(monsters, allies, turnCount = 0) {
  const activeMonsters = monsters.filter(
    (monster) => !monster.isDead() && !monster.isFleeing()
  );
  const activeAllies = allies.filter(
    (ally) => !ally.isDead() && !ally.isFleeing() && !ally.isUnconscious()
  );
  const unconsciousAllies = allies.filter((ally) => ally.isUnconscious());

  console.log(
    `Round ${turnCount} - Monster AI: ${activeMonsters.length} active monsters, ${activeAllies.length} active allies, ${unconsciousAllies.length} unconscious allies`
  );

  if (activeAllies.length === 0 && unconsciousAllies.length === 0) {
    console.log(`Round ${turnCount} - Monster AI: No allies to attack`);
    return;
  }

  activeMonsters.forEach((monster) => {
    // Monsters prefer to attack active allies, but will attack unconscious ones if no active allies
    let target;
    if (activeAllies.length > 0) {
      target = activeAllies[Math.floor(Math.random() * activeAllies.length)];
    } else {
      // Attack unconscious allies (this will kill them)
      target =
        unconsciousAllies[Math.floor(Math.random() * unconsciousAllies.length)];
    }

    const damage = monster.getDamage();
    const oldHealth = target.currentHealth;
    const wasUnconscious = target.isUnconscious();
    target.takeDamage(damage);
    const newHealth = target.currentHealth;

    if (wasUnconscious) {
      console.log(
        `Round ${turnCount} - ${monster.name} finishes off unconscious ${target.name}: ${damage} damage (${oldHealth} → ${newHealth} HP) - ${target.name} is now DEAD`
      );
      logEvent(
        `${monster.name} finishes off unconscious ${target.name}! ${target.name} is dead!`
      );
    } else {
      console.log(
        `Round ${turnCount} - ${monster.name} attacks ${target.name}: ${damage} damage (${oldHealth} → ${newHealth} HP)`
      );
      logEvent(`${monster.name} attacks ${target.name} for ${damage} damage!`);

      if (target.isUnconscious()) {
        logEvent(`${target.name} falls unconscious!`);
      }
    }

    // Chance to flee if heavily wounded
    if (monster.wounds >= 2 && Math.random() < 0.2) {
      monster.flee();
      console.log(`Round ${turnCount} - ${monster.name} flees from combat!`);
      logEvent(`${monster.name} flees from combat!`);
    }
  });
}

// Main combat function
export async function handleEnhancedCombat(ex, ey, isOnTile = false) {
  let tile = getTile(ex, ey);
  let entity = tile.entity;

  // Phase 1: Initial Detection
  const detectionBonus = calculateDetectionBonus();
  const luckRoll = Math.floor(Math.random() * 10) + 1;
  const baseMonsterCount = Math.floor(Math.random() * 3) + 1; // 1-3 monsters
  const detectedCount = Math.min(
    baseMonsterCount +
      Math.floor(detectionBonus / 3) +
      Math.floor(luckRoll / 3),
    5
  );

  // Generate monsters first to get their descriptions
  const monsters = generateMonsters(detectedCount, entity, ex, ey);
  const detectionMessage = generateDetectionMessage(monsters);

  // Phase 2: Player Choice
  const choice = await showChoiceDialog(detectionMessage, [
    { type: "button", label: "⚔️ Charge", value: "charge" },
    { type: "button", label: "🗡️ Attack", value: "attack" },
    { type: "button", label: "🥷 Stalk", value: "stalk" },
    { type: "button", label: "📏 Keep Distance", value: "keep_distance" },
    { type: "button", label: "🏃 Run", value: "run" },
  ]);

  if (choice === "run") {
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

  // Phase 3: Hidden Discovery Roll
  const stealthModifier = calculateStealthModifier();
  const discoveryRoll = Math.random() * 10 + stealthModifier;
  const discovered = discoveryRoll < 6; // 60% base chance

  // Phase 4: Initiative
  const playerGoesFirst = calculateInitiative(choice, stealthModifier);

  // Debug logging
  console.log(
    `Combat Debug - Choice: ${choice}, Stealth Modifier: ${stealthModifier}, Player Goes First: ${playerGoesFirst}`
  );

  // Phase 5: Combat Setup
  const allies = generateAllies();

  // Show detection messages for each monster type
  const monsterGroups = {};
  monsters.forEach((monster) => {
    if (!monsterGroups[monster.name]) {
      monsterGroups[monster.name] = [];
    }
    monsterGroups[monster.name].push(monster);
  });

  // Display detection messages for each creature type
  for (const [monsterType, group] of Object.entries(monsterGroups)) {
    const monster = group[0];
    const detectionMessage = getRandomDetectionMessage(monster);
    const count = group.length;

    let message = detectionMessage;
    if (count > 1) {
      message += ` (${count} ${monsterType}s)`;
    }

    await showChoiceDialog(message, [
      { type: "button", label: "Continue", value: "continue" },
    ]);
  }

  console.log(
    `Combat Setup - Monsters: ${monsters.length}, Allies: ${allies.length}`
  );
  console.log(
    `Monster health: ${monsters.map(
      (m) => m.maxHealth
    )}, Ally health: ${allies.map((a) => a.maxHealth)}`
  );

  // Determine enemy visibility based on group composition
  const outnumbered = allies.length < monsters.length;
  const hasScouts = gameState.group.some((member) => {
    const cleanRole = member.role.replace(/[^\w-]/g, "");
    return ["explorer", "biologist", "native-guide", "navigator"].includes(
      cleanRole
    );
  });

  let enemyDescription = "";
  if (outnumbered && !hasScouts) {
    enemyDescription =
      "You can only see partial details of the enemy creatures.";
  } else {
    enemyDescription = "You have a perfect view of all enemy creatures.";
  }

  await showChoiceDialog(
    `${enemyDescription}\n\n${
      playerGoesFirst ? "You strike first!" : "The enemies attack first!"
    }`,
    [{ type: "button", label: "Begin Combat", value: "start" }]
  );

  // Phase 6: Combat Loop
  let combatActive = true;
  let turnCount = 0;

  while (combatActive && turnCount < 20) {
    // Prevent infinite loops
    turnCount++;
    console.log(`Combat Turn ${turnCount}`);

    const activeAllies = allies.filter(
      (ally) => !ally.isDead() && !ally.isFleeing()
    );
    const activeMonsters = monsters.filter(
      (monster) => !monster.isDead() && !monster.isFleeing()
    );

    // Check win conditions
    if (activeMonsters.length === 0) {
      console.log(`Round ${turnCount} - VICTORY! All monsters defeated`);
      await showChoiceDialog("Victory! All enemies defeated! 🏆", [
        { type: "button", label: "OK", value: "ok" },
      ]);
      gameState.killed.add(`${ex},${ey}`);
      gameState.killPoints += 5 * monsters.length;
      updateStatus();
      logEvent(`🏆 Defeated ${monsters.length} ${entity}s at (${ex},${ey})`);
      return true;
    }

    if (activeAllies.length === 0) {
      console.log(`Round ${turnCount} - DEFEAT! All allies fallen`);
      // Player takes damage
      const damage = Math.floor(Math.random() * 15) + 10;
      gameState.health -= damage;
      updateStatus();

      await showChoiceDialog(
        `Defeat! All allies fallen. You took ${damage} damage. 🤕`,
        [{ type: "button", label: "OK", value: "ok" }]
      );

      logEvent(`🤕 Defeated by ${entity}s at (${ex},${ey})`);

      const death = await checkDeath();
      if (death === "health") {
        await showChoiceDialog("You died fighting! ☠️", [
          { type: "button", label: "🔄 Restart Game", value: "restart" },
        ]);
        location.reload();
      } else if (death === "gold") {
        await showChoiceDialog("You paid your debt with your life! ☠️", [
          { type: "button", label: "🔄 Restart Game", value: "restart" },
        ]);
        location.reload();
      }
      return false;
    }

    // Determine turn order based on initiative
    if (playerGoesFirst || turnCount === 1) {
      console.log(
        `Round ${turnCount} - Player goes first (initiative won: ${playerGoesFirst})`
      );

      // Player turn
      const playerAction = await showChoiceDialog(
        getCombatStatus(allies, monsters, turnCount),
        [
          { type: "button", label: "⚔️ Attack", value: "attack" },
          {
            type: "button",
            label: "📢 Shout to Attack",
            value: "rally_attack",
          },
          { type: "button", label: "🆘 Shout for Help", value: "call_help" },
          { type: "button", label: "🏃 Shout to Run", value: "order_retreat" },
          { type: "button", label: "🏃 Run Away", value: "run_away" },
        ]
      );

      console.log(`Round ${turnCount} - Player chose: ${playerAction}`);

      // Resolve player action
      switch (playerAction) {
        case "attack":
          const target =
            activeMonsters[Math.floor(Math.random() * activeMonsters.length)];
          const damage = Math.floor(Math.random() * 3) + 1; // 1-3 damage
          const oldHealth = target.currentHealth;
          target.takeDamage(damage);
          const newHealth = target.currentHealth;

          console.log(
            `Round ${turnCount} - Player attacks ${target.name}: ${damage} damage (${oldHealth} → ${newHealth} HP)`
          );
          logEvent(`You attack ${target.name} for ${damage} damage!`);
          break;

        case "rally_attack":
          console.log(`Round ${turnCount} - Player rallies allies`);
          // Boost ally attack power for this turn
          allies.forEach((ally) => {
            if (!ally.isDead() && !ally.isFleeing()) {
              const oldHealth = ally.currentHealth;
              ally.takeDamage(-1); // Heal 1 HP as rally effect
              const newHealth = ally.currentHealth;
              console.log(
                `Round ${turnCount} - ${ally.name} healed by rally: ${oldHealth} → ${newHealth} HP`
              );
            }
          });
          logEvent("You rally your allies! They gain confidence!");
          break;

        case "call_help":
          console.log(`Round ${turnCount} - Player calls for help`);
          // Chance to call for reinforcements (if any available)
          if (Math.random() < 0.3) {
            const newAlly = new Ally("Reinforcement", "guard");
            allies.push(newAlly);
            console.log(
              `Round ${turnCount} - Reinforcement joined! Total allies: ${allies.length}`
            );
            logEvent("A reinforcement joins your group!");
          } else {
            console.log(`Round ${turnCount} - No help arrived`);
            logEvent("No help arrives...");
          }
          break;

        case "order_retreat":
          console.log(`Round ${turnCount} - Player orders retreat`);
          // Order allies to retreat
          let retreatedCount = 0;
          allies.forEach((ally) => {
            if (!ally.isDead() && Math.random() < 0.7) {
              ally.flee();
              retreatedCount++;
            }
          });
          console.log(
            `Round ${turnCount} - ${retreatedCount} allies retreated`
          );
          logEvent("You order your allies to retreat!");
          break;

        case "run_away":
          console.log(`Round ${turnCount} - Player attempts to flee`);

          // Check if player is unconscious
          const player = allies[0]; // Player is first ally
          if (player && player.isUnconscious()) {
            console.log(
              `Round ${turnCount} - Player cannot flee while unconscious`
            );
            logEvent("You cannot flee while unconscious!");
            break;
          }

          // Player attempts to flee
          const fleeChance = 0.6 + getGroupBonus("combat") * 0.1;
          const fleeRoll = Math.random();
          console.log(
            `Round ${turnCount} - Flee chance: ${fleeChance.toFixed(
              2
            )}, Roll: ${fleeRoll.toFixed(2)}`
          );

          if (fleeRoll < fleeChance) {
            console.log(`Round ${turnCount} - Player successfully fled!`);
            await showChoiceDialog("You successfully flee! 🏃", [
              { type: "button", label: "OK", value: "ok" },
            ]);
            return false;
          } else {
            console.log(`Round ${turnCount} - Player failed to flee`);
            logEvent("You fail to flee!");
          }
          break;
      }

      // AI turns
      console.log(`Round ${turnCount} - Ally AI turn`);
      allyAI(allies, monsters, turnCount);
      console.log(`Round ${turnCount} - Monster AI turn`);
      monsterAI(monsters, allies, turnCount);

      // Check for immediate victory/defeat after AI turns
      const currentActiveAllies = allies.filter(
        (ally) => !ally.isDead() && !ally.isFleeing()
      );
      const currentActiveMonsters = monsters.filter(
        (monster) => !monster.isDead() && !monster.isFleeing()
      );

      if (currentActiveMonsters.length === 0) {
        console.log(`Round ${turnCount} - VICTORY! All monsters defeated`);
        await showChoiceDialog("Victory! All enemies defeated! 🏆", [
          { type: "button", label: "OK", value: "ok" },
        ]);
        gameState.killed.add(`${ex},${ey}`);
        gameState.killPoints += 5 * monsters.length;
        updateStatus();
        logEvent(`🏆 Defeated ${monsters.length} ${entity}s at (${ex},${ey})`);
        return true;
      }

      if (currentActiveAllies.length === 0) {
        console.log(`Round ${turnCount} - DEFEAT! All allies fallen`);
        const damage = Math.floor(Math.random() * 15) + 10;
        gameState.health -= damage;
        updateStatus();
        await showChoiceDialog(
          `Defeat! All allies fallen. You took ${damage} damage. 🤕`,
          [{ type: "button", label: "OK", value: "ok" }]
        );
        logEvent(`🤕 Defeated by ${entity}s at (${ex},${ey})`);
        const death = await checkDeath();
        if (death === "health") {
          await showChoiceDialog("You died fighting! ☠️", [
            { type: "button", label: "🔄 Restart Game", value: "restart" },
          ]);
          location.reload();
        } else if (death === "gold") {
          await showChoiceDialog("You paid your debt with your life! ☠️", [
            { type: "button", label: "🔄 Restart Game", value: "restart" },
          ]);
          location.reload();
        }
        return false;
      }
    } else {
      // Monsters go first
      console.log(`Round ${turnCount} - Monsters go first (initiative lost)`);

      console.log(`Round ${turnCount} - Monster AI turn`);
      monsterAI(monsters, allies, turnCount);
      console.log(`Round ${turnCount} - Ally AI turn`);
      allyAI(allies, monsters, turnCount);

      // Player turn
      const playerAction = await showChoiceDialog(
        getCombatStatus(allies, monsters, turnCount),
        [
          { type: "button", label: "⚔️ Attack", value: "attack" },
          {
            type: "button",
            label: "📢 Shout to Attack",
            value: "rally_attack",
          },
          { type: "button", label: "🆘 Shout for Help", value: "call_help" },
          { type: "button", label: "🏃 Shout to Run", value: "order_retreat" },
          { type: "button", label: "🏃 Run Away", value: "run_away" },
        ]
      );

      console.log(`Round ${turnCount} - Player chose: ${playerAction}`);

      // Resolve player action
      switch (playerAction) {
        case "attack":
          const target =
            activeMonsters[Math.floor(Math.random() * activeMonsters.length)];
          const damage = Math.floor(Math.random() * 3) + 1; // 1-3 damage
          const oldHealth = target.currentHealth;
          target.takeDamage(damage);
          const newHealth = target.currentHealth;

          console.log(
            `Round ${turnCount} - Player attacks ${target.name}: ${damage} damage (${oldHealth} → ${newHealth} HP)`
          );
          logEvent(`You attack ${target.name} for ${damage} damage!`);
          break;

        case "rally_attack":
          console.log(`Round ${turnCount} - Player rallies allies`);
          // Boost ally attack power for this turn
          allies.forEach((ally) => {
            if (!ally.isDead() && !ally.isFleeing()) {
              const oldHealth = ally.currentHealth;
              ally.takeDamage(-1); // Heal 1 HP as rally effect
              const newHealth = ally.currentHealth;
              console.log(
                `Round ${turnCount} - ${ally.name} healed by rally: ${oldHealth} → ${newHealth} HP`
              );
            }
          });
          logEvent("You rally your allies! They gain confidence!");
          break;

        case "call_help":
          console.log(`Round ${turnCount} - Player calls for help`);
          // Chance to call for reinforcements (if any available)
          if (Math.random() < 0.3) {
            const newAlly = new Ally("Reinforcement", "guard");
            allies.push(newAlly);
            console.log(
              `Round ${turnCount} - Reinforcement joined! Total allies: ${allies.length}`
            );
            logEvent("A reinforcement joins your group!");
          } else {
            console.log(`Round ${turnCount} - No help arrived`);
            logEvent("No help arrives...");
          }
          break;

        case "order_retreat":
          console.log(`Round ${turnCount} - Player orders retreat`);
          // Order allies to retreat
          let retreatedCount = 0;
          allies.forEach((ally) => {
            if (!ally.isDead() && Math.random() < 0.7) {
              ally.flee();
              retreatedCount++;
            }
          });
          console.log(
            `Round ${turnCount} - ${retreatedCount} allies retreated`
          );
          logEvent("You order your allies to retreat!");
          break;

        case "run_away":
          console.log(`Round ${turnCount} - Player attempts to flee`);

          // Check if player is unconscious
          const player = allies[0]; // Player is first ally
          if (player && player.isUnconscious()) {
            console.log(
              `Round ${turnCount} - Player cannot flee while unconscious`
            );
            logEvent("You cannot flee while unconscious!");
            break;
          }

          // Player attempts to flee
          const fleeChance = 0.6 + getGroupBonus("combat") * 0.1;
          const fleeRoll = Math.random();
          console.log(
            `Round ${turnCount} - Flee chance: ${fleeChance.toFixed(
              2
            )}, Roll: ${fleeRoll.toFixed(2)}`
          );

          if (fleeRoll < fleeChance) {
            console.log(`Round ${turnCount} - Player successfully fled!`);
            await showChoiceDialog("You successfully flee! 🏃", [
              { type: "button", label: "OK", value: "ok" },
            ]);
            return false;
          } else {
            console.log(`Round ${turnCount} - Player failed to flee`);
            logEvent("You fail to flee!");
          }
          break;
      }

      // Check for immediate victory/defeat after player action
      const currentActiveAllies = allies.filter(
        (ally) => !ally.isDead() && !ally.isFleeing()
      );
      const currentActiveMonsters = monsters.filter(
        (monster) => !monster.isDead() && !monster.isFleeing()
      );

      if (currentActiveMonsters.length === 0) {
        console.log(`Round ${turnCount} - VICTORY! All monsters defeated`);
        await showChoiceDialog("Victory! All enemies defeated! 🏆", [
          { type: "button", label: "OK", value: "ok" },
        ]);
        gameState.killed.add(`${ex},${ey}`);
        gameState.killPoints += 5 * monsters.length;
        updateStatus();
        logEvent(`🏆 Defeated ${monsters.length} ${entity}s at (${ex},${ey})`);
        return true;
      }

      if (currentActiveAllies.length === 0) {
        console.log(`Round ${turnCount} - DEFEAT! All allies fallen`);
        const damage = Math.floor(Math.random() * 15) + 10;
        gameState.health -= damage;
        updateStatus();
        await showChoiceDialog(
          `Defeat! All allies fallen. You took ${damage} damage. 🤕`,
          [{ type: "button", label: "OK", value: "ok" }]
        );
        logEvent(`🤕 Defeated by ${entity}s at (${ex},${ey})`);
        const death = await checkDeath();
        if (death === "health") {
          await showChoiceDialog("You died fighting! ☠️", [
            { type: "button", label: "🔄 Restart Game", value: "restart" },
          ]);
          location.reload();
        } else if (death === "gold") {
          await showChoiceDialog("You paid your debt with your life! ☠️", [
            { type: "button", label: "🔄 Restart Game", value: "restart" },
          ]);
          location.reload();
        }
        return false;
      }
    }

    // Check if combat should continue
    const remainingAllies = allies.filter(
      (ally) => !ally.isDead() && !ally.isFleeing()
    );
    const remainingMonsters = monsters.filter(
      (monster) => !monster.isDead() && !monster.isFleeing()
    );

    console.log(
      `Round ${turnCount} - Combat Status: ${remainingAllies.length} allies, ${remainingMonsters.length} monsters remaining`
    );

    if (remainingAllies.length === 0 || remainingMonsters.length === 0) {
      console.log(
        `Round ${turnCount} - Combat ended! Allies: ${remainingAllies.length}, Monsters: ${remainingMonsters.length}`
      );
      combatActive = false;
    }
  }

  // Combat timeout
  console.log(`Combat timeout after ${turnCount} rounds - Both sides withdraw`);
  await showChoiceDialog("Combat drags on... Both sides withdraw. 🤝", [
    { type: "button", label: "OK", value: "ok" },
  ]);

  return false;
}
