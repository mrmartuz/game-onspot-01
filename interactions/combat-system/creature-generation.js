import {
  creatureTemplates,
  getRandomDiscoveryMessage,
  getRandomDetectionMessage,
} from "./creature-templates.js";
import { raceDatabase } from "../character/races.js";
import {
  equipmentTypes,
  equipmentMaterials,
  equipmentRarity,
  equipmentStatus,
} from "../equipment.js";
import { Monster } from "./entities.js";

// Determine AI behavior based on creature template and characteristics
function determineAIBehavior(template, monster) {
  const className = template.class?.toLowerCase();
  const raceName = template.race?.toLowerCase();
  const creatureName = template.name?.toLowerCase();

  // Determine behavior based on class
  switch (className) {
    case "fighter":
    case "brute":
    case "warrior":
    case "berserker":
      return "aggressive";

    case "scout":
    case "ranger":
    case "hunter":
    case "archer":
      return "cunning";

    case "rogue":
    case "assassin":
    case "thief":
      return "cunning";

    case "cleric":
    case "priest":
    case "healer":
      return "defensive";

    case "mage":
    case "wizard":
    case "sorcerer":
      return "defensive";

    default:
      // Determine by race if class is not specific
      break;
  }

  // Determine behavior based on race
  switch (raceName) {
    case "goblin":
      return "cowardly";

    case "orc":
    case "troll":
    case "ogre":
      return "aggressive";

    case "elf":
    case "dwarf":
      return "defensive";

    case "demon":
      return "aggressive";

    case "dragon":
      return "aggressive";

    default:
      // Determine by creature name if race is not specific
      break;
  }

  // Determine behavior based on creature name
  if (creatureName.includes("scout") || creatureName.includes("spy")) {
    return "cunning";
  }
  if (creatureName.includes("guard") || creatureName.includes("soldier")) {
    return "defensive";
  }
  if (creatureName.includes("berserker") || creatureName.includes("warrior")) {
    return "aggressive";
  }
  if (creatureName.includes("coward") || creatureName.includes("weak")) {
    return "cowardly";
  }

  // Default behavior based on level
  if (monster.level <= 2) {
    return "cowardly";
  } else if (monster.level >= 8) {
    return "aggressive";
  } else {
    return "balanced";
  }
}

// Creature generation functions for combat system
export async function generateMonsters(count, entityType, x, y) {
  const monsters = [];

  for (let i = 0; i < count; i++) {
    const monster = await generateCreature(entityType, x, y, i);
    monsters.push(monster);
  }

  return monsters;
}

export async function generateCreature(creatureTemplate, x, y, index) {
  const template = creatureTemplates[creatureTemplate];
  if (!template) {
    console.error(`Creature template not found: ${creatureTemplate}`);
    return null;
  }

  // Scale stats based on level and race
  const scaledStats = scaleCreatureStats(template.baseStats, template.race);

  // Calculate health based on scaled stats
  const baseHealth = Math.floor(scaledStats.CON * 2 + 10);
  const classBonus = await getClassHealthBonus(template.class);
  const maxHealth = baseHealth + classBonus;

  // Create proper Monster instance
  const monster = new Monster(template.name, maxHealth, 0, x, y);

  // Set additional properties
  monster.id = `monster_${Date.now()}_${index}`;
  monster.creatureType = creatureTemplate;
  monster.race = template.race;
  monster.class = template.class;
  monster.level = template.level;
  monster.rarity = template.rarity;
  monster.discovered = false;
  monster.detected = false;
  monster.discoveryMessage = "";
  monster.detectionMessage = "";
  monster.aiBehavior = determineAIBehavior(template, monster);
  monster.specialAbilities = [];
  monster.resistances = {};
  monster.vulnerabilities = {};
  monster.lootTable = [];
  monster.experienceValue = 0;
  monster.stats = scaledStats;

  // Generate skills
  monster.skills = { ...template.skills };

  // Generate equipment
  monster.equipment = await generateCreatureEquipment(
    template.class,
    template.race
  );

  // Generate discovery and detection messages
  monster.discoveryMessage = getRandomDiscoveryMessage(monster);
  monster.detectionMessage = getRandomDetectionMessage(monster);

  // Calculate experience value
  monster.experienceValue = calculateExperienceValue(monster);

  // Generate loot table
  monster.lootTable = generateLootTable(monster);

  // Add special abilities based on creature type
  monster.specialAbilities = generateSpecialAbilities(monster);

  // Add resistances and vulnerabilities based on race
  monster.resistances = generateResistances(monster.race);
  monster.vulnerabilities = generateVulnerabilities(monster.race);

  return monster;
}

export function scaleCreatureStats(baseStats, race) {
  const raceData = raceDatabase[race];
  if (!raceData) {
    console.warn(`Race data not found for: ${race}`);
    return baseStats;
  }

  const scaledStats = { ...baseStats };

  // Apply race stat bonuses
  Object.keys(raceData.statBonuses).forEach((stat) => {
    scaledStats[stat] += raceData.statBonuses[stat];
  });

  // Ensure stats are within reasonable bounds
  Object.keys(scaledStats).forEach((stat) => {
    scaledStats[stat] = Math.max(1, Math.min(25, scaledStats[stat]));
  });

  return scaledStats;
}

export async function generateCreatureEquipment(className, race) {
  // Import classDatabase dynamically to avoid circular dependency
  const { classDatabase } = await import("../combat/classes.js");
  const classData = classDatabase[className];
  if (!classData) {
    console.warn(`Class data not found for: ${className}`);
    return {};
  }

  const equipment = {};

  // Generate weapon based on class preferences
  if (classData.equipmentPreferences?.weapon) {
    const weaponType =
      classData.equipmentPreferences.weapon[
        Math.floor(Math.random() * classData.equipmentPreferences.weapon.length)
      ];
    equipment.weapon = generateEquipmentItem("weapon1h", weaponType);
  }

  // Generate armor based on class preferences
  if (classData.equipmentPreferences?.armor) {
    const armorType =
      classData.equipmentPreferences.armor[
        Math.floor(Math.random() * classData.equipmentPreferences.armor.length)
      ];
    equipment.armor = generateEquipmentItem("armor", armorType);
  }

  // Generate shield if applicable
  if (classData.equipmentPreferences?.shield) {
    const shieldType =
      classData.equipmentPreferences.shield[
        Math.floor(Math.random() * classData.equipmentPreferences.shield.length)
      ];
    equipment.secondHand = generateEquipmentItem("shield", shieldType);
  }

  return equipment;
}

export function generateEquipmentItem(equipmentType, itemType) {
  const typeData = equipmentTypes[equipmentType];
  if (!typeData) return null;

  // Random status (weighted toward better condition for creatures)
  const statusType = equipmentStatus[typeData.statusType];
  const statusWeights = [0.1, 0.2, 0.3, 0.25, 0.1, 0.04, 0.01]; // Weighted toward "Fair" condition
  const randomStatus = weightedRandom(statusType.statuses, statusWeights);

  // Random material based on equipment type restrictions
  const materials = Object.keys(equipmentMaterials);
  const allowedMaterials = materials.filter((m) =>
    equipmentMaterials[m].allowedTypes?.includes(equipmentType)
  );

  if (allowedMaterials.length === 0) {
    console.warn(`No allowed materials for equipment type: ${equipmentType}`);
    return null;
  }

  const materialWeights = allowedMaterials.map(() => 1); // Equal weight for all allowed materials
  const randomMaterial = weightedRandom(allowedMaterials, materialWeights);

  // Random rarity (weighted toward common rarity, capped at common, floored at scrap)
  const rarities = Object.keys(equipmentRarity);
  // Only allow scrap, improvised, poor, and common rarities for creature equipment
  const allowedRarities = ["scrap", "improvised", "poor", "common"];
  const rarityWeights = [0.15, 0.25, 0.35, 0.25]; // Weighted toward poor/common
  const randomRarity = weightedRandom(allowedRarities, rarityWeights);

  // Format: "status material rarity [itemType]"
  return `${randomStatus.name.toLowerCase()} ${randomMaterial} ${randomRarity} [${itemType}]`;
}

export async function generateTeamComposition(
  requestedCount,
  creatureTypes,
  x,
  y
) {
  const monsters = [];
  const actualCount = Math.min(requestedCount, creatureTypes.length);

  for (let i = 0; i < actualCount; i++) {
    const creatureType = creatureTypes[i];
    const monster = await generateCreature(creatureType, x, y, i);
    if (monster) {
      monsters.push(monster);
    }
  }

  return monsters;
}

// Helper functions
async function getClassHealthBonus(className) {
  // Import classDatabase dynamically to avoid circular dependency
  const { classDatabase } = await import("../combat/classes.js");
  const classData = classDatabase[className];
  if (!classData) return 0;

  const healthBonuses = {
    fighter: 2,
    paladin: 3,
    cleric: 2,
    ranger: 1,
    hunter: 1,
    archer: 0,
    brute: 4,
    martial_artist: 1,
    monk: 1,
    explorer: 1,
    dungeondiver: 2,
    craftsman: 0,
    alchemist: 0,
    herbalist: 0,
    pyromancer: 0,
    necromancer: 0,
    articaster: 0,
    geomancer: 0,
  };

  return healthBonuses[className] || 0;
}

function calculateExperienceValue(monster) {
  const baseExp = monster.level * 10;
  const rarityMultiplier = {
    common: 1,
    uncommon: 1.5,
    rare: 2,
    legendary: 3,
    epic: 4,
    mythic: 5,
  };

  return Math.floor(baseExp * (rarityMultiplier[monster.rarity] || 1));
}

function generateLootTable(monster) {
  const lootTable = [];

  // Base loot chance based on rarity
  const lootChances = {
    common: 0.3,
    uncommon: 0.5,
    rare: 0.7,
    legendary: 0.9,
    epic: 1.0,
    mythic: 1.0,
  };

  const lootChance = lootChances[monster.rarity] || 0.3;

  if (Math.random() < lootChance) {
    // Generate random loot item
    lootTable.push({
      type: "equipment",
      item: generateRandomLootItem(monster.level),
      chance: 1.0,
    });
  }

  // Always drop gold
  const goldAmount = Math.floor(monster.level * 5 * (Math.random() + 0.5));
  lootTable.push({
    type: "gold",
    amount: goldAmount,
    chance: 1.0,
  });

  return lootTable;
}

function generateRandomLootItem(level) {
  const equipmentTypes = ["weapon1h", "armor", "shield", "tool"];
  const randomType =
    equipmentTypes[Math.floor(Math.random() * equipmentTypes.length)];

  const typeData = equipmentTypes[randomType];
  if (!typeData) return null;

  const randomItem =
    typeData.items[Math.floor(Math.random() * typeData.items.length)];
  return generateEquipmentItem(randomType, randomItem);
}

function generateSpecialAbilities(monster) {
  const abilities = [];

  // Race-based abilities
  if (monster.race === "Dragon") {
    abilities.push({
      name: "Fire Breath",
      description: "Breathes fire for area damage",
      damage: monster.level * 2,
      cooldown: 3,
    });
  } else if (monster.race === "Troll") {
    abilities.push({
      name: "Regeneration",
      description: "Heals damage over time",
      heal: monster.level,
      cooldown: 2,
    });
  } else if (monster.race === "Wolf") {
    abilities.push({
      name: "Pack Tactics",
      description: "Gains bonus damage when near allies",
      damage: monster.level,
      cooldown: 0,
    });
  }

  return abilities;
}

function generateResistances(race) {
  const resistances = {};

  if (race === "Dragon") {
    resistances.fire = 0.5;
    resistances.physical = 0.2;
  } else if (race === "Troll") {
    resistances.physical = 0.3;
    resistances.poison = 0.5;
  } else if (race === "Wolf") {
    resistances.cold = 0.2;
  }

  return resistances;
}

function generateVulnerabilities(race) {
  const vulnerabilities = {};

  if (race === "Troll") {
    vulnerabilities.fire = 0.5;
  } else if (race === "Wolf") {
    vulnerabilities.fire = 0.3;
  }

  return vulnerabilities;
}

function weightedRandom(items, weights) {
  const random = Math.random();
  let cumulative = 0;

  for (let i = 0; i < items.length; i++) {
    cumulative += weights[i] || 0;
    if (random <= cumulative) {
      return items[i];
    }
  }

  return items[items.length - 1]; // Fallback
}

// Test function for creature generation
export async function testCreatureGeneration() {
  ("Testing creature generation...");

  // Test monster generation
  const monsters = await generateMonsters(3, "goblin", 10, 10);
  "Generated monsters:", monsters;

  // Test beast generation
  const beasts = await generateMonsters(2, "wolf", 15, 15);
  "Generated beasts:", beasts;

  // Test team composition
  const team = await generateTeamComposition(2, ["goblin", "orc"], 20, 20);
  "Generated team:", team;

  ("Creature generation test complete!");
}
