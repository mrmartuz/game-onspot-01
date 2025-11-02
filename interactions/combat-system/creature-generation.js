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
import { weaponEmoji, equipmentEmoji } from "../../gamestate/emoji-database.js";
import { scaleCreatureStats, getClassHealthBonus } from "./creature-scaling.js";
import {
  calculateExperienceValue,
  generateLootTable,
} from "./creature-loot.js";

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
  const classBonus = getClassHealthBonus(template.class);
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

  console.log(
    `[MONSTER GENERATION] Created monster ${monster.name} (${monster.race}, ${monster.class}) with equipment:`,
    monster.equipment
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

/**
 * Map item name to equipment type key
 * @param {string} itemName - Item name (e.g., "sword", "axe", "shield")
 * @returns {string|null} Equipment type key (e.g., "swords", "axes", "shields") or null if not found
 */
function getEquipmentTypeForItem(itemName) {
  if (!itemName || typeof itemName !== "string") return null;

  // Check each equipment type to find which one contains this item
  for (const [equipmentTypeKey, typeData] of Object.entries(equipmentTypes)) {
    if (typeData.items && typeData.items.includes(itemName)) {
      return equipmentTypeKey;
    }
  }

  // Fallback mappings for common item names that might not be in the database
  const fallbackMap = {
    sword: "swords",
    shortsword: "swords",
    longsword: "swords",
    rapier: "swords",
    scimitar: "swords",
    broadsword: "swords",
    sabre: "swords",
    axe: "axes",
    "hand-axe": "axes",
    hatchet: "axes",
    tomahawk: "axes",
    club: "hammers",
    mace: "hammers",
    warhammer: "hammers",
    flail: "hammers",
    morningstar: "hammers",
    shield: "shields",
    buckler: "shields",
    "round-shield": "shields",
    "kite-shield": "shields",
    bow: "bows",
    longbow: "bows",
    shortbow: "bows",
    crossbow: "crossbows",
    dagger: "throwing",
    javelin: "throwing",
    "throwing-axe": "throwing",
    spear: "polearms",
    halberd: "polearms",
    poleaxe: "polearms",
    staff: "polearms",
    quarterstaff: "polearms",
  };

  return fallbackMap[itemName] || null;
}

/**
 * Check if a race is a beast (animals that shouldn't have weapons/armor)
 * @param {string} race - Race name
 * @returns {boolean} True if the race is a beast
 */
function isBeastRace(race) {
  if (!race) return false;

  const beastRaces = [
    "Wolf",
    "Bear",
    "MountainLion",
    "Mountain Lion",
    // Add other beast races as needed
  ];

  return beastRaces.includes(race);
}

export async function generateCreatureEquipment(className, race) {
  // Import classDatabase dynamically to avoid circular dependency
  const { classDatabase } = await import("../combat/classes.js");
  const classData = classDatabase[className];
  if (!classData) {
    console.warn(
      `[EQUIPMENT GENERATION] Class data not found for: ${className}`
    );
    return {};
  }

  const equipment = {};

  // Beasts don't use weapons or armor - they use natural attacks
  if (isBeastRace(race)) {
    console.log(
      `[EQUIPMENT GENERATION] Skipping weapon/armor generation for beast race: ${race}`
    );
    return equipment; // Return empty equipment for beasts
  }

  // Generate weapon based on class preferences
  if (classData.equipmentPreferences?.weapon) {
    const weaponItemName =
      classData.equipmentPreferences.weapon[
        Math.floor(Math.random() * classData.equipmentPreferences.weapon.length)
      ];
    const equipmentType = getEquipmentTypeForItem(weaponItemName);

    if (equipmentType) {
      equipment.weapon = generateEquipmentItem(equipmentType, weaponItemName);
      if (equipment.weapon) {
        console.log(
          `[EQUIPMENT GENERATION] Generated weapon for ${className}: ${equipment.weapon}`
        );
      } else {
        console.warn(
          `[EQUIPMENT GENERATION] Failed to generate weapon for ${className}, item: ${weaponItemName}, type: ${equipmentType}`
        );
      }
    } else {
      console.warn(
        `[EQUIPMENT GENERATION] Could not find equipment type for weapon item: ${weaponItemName}`
      );
    }
  }

  // Generate armor based on class preferences
  if (classData.equipmentPreferences?.armor) {
    const armorItemName =
      classData.equipmentPreferences.armor[
        Math.floor(Math.random() * classData.equipmentPreferences.armor.length)
      ];
    // Armor items should always use "armor" type
    equipment.armor = generateEquipmentItem("armor", armorItemName);
    if (equipment.armor) {
      console.log(
        `[EQUIPMENT GENERATION] Generated armor for ${className}: ${equipment.armor}`
      );
    } else {
      console.warn(
        `[EQUIPMENT GENERATION] Failed to generate armor for ${className}, item: ${armorItemName}`
      );
    }
  }

  // Generate shield if applicable
  if (classData.equipmentPreferences?.shield) {
    const shieldItemName =
      classData.equipmentPreferences.shield[
        Math.floor(Math.random() * classData.equipmentPreferences.shield.length)
      ];
    const equipmentType = getEquipmentTypeForItem(shieldItemName);

    if (equipmentType) {
      equipment.secondHand = generateEquipmentItem(
        equipmentType,
        shieldItemName
      );
      if (equipment.secondHand) {
        console.log(
          `[EQUIPMENT GENERATION] Generated shield for ${className}: ${equipment.secondHand}`
        );
      } else {
        console.warn(
          `[EQUIPMENT GENERATION] Failed to generate shield for ${className}, item: ${shieldItemName}, type: ${equipmentType}`
        );
      }
    } else {
      console.warn(
        `[EQUIPMENT GENERATION] Could not find equipment type for shield item: ${shieldItemName}`
      );
    }
  }

  console.log(
    `[EQUIPMENT GENERATION] Final equipment for ${className}:`,
    equipment
  );

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

  // Format: "emoji [item type] material rarity status"
  // Determine emoji based on equipment type
  let emoji;
  if (weaponEmoji[equipmentType]) {
    emoji = weaponEmoji[equipmentType];
  } else if (equipmentType === "container") {
    emoji = equipmentEmoji.back;
  } else {
    emoji = equipmentEmoji[equipmentType] || "⚙️";
  }

  return `${emoji} [${itemType}] ${randomMaterial} ${randomRarity} ${randomStatus.name.toLowerCase()}`;
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
