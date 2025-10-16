// Character Generation System for enhanced character progression
// Implements point allocation, procedural generation, and equipment assignment

import {
  classDatabase,
  calculateClassStats,
  getClassStartingSkills,
} from "./combat/classes.js";
import { skillDatabase } from "./skills.js";
import {
  equipmentTypes,
  equipmentMaterials,
  equipmentQuality,
  equipmentStatus,
} from "./equipment.js";

// Race system for character generation
export const raceDatabase = {
  Human: {
    name: "Human",
    region: "Aurenith",
    description: "Versatile and adaptable, humans excel in all areas",
    statBonuses: { STR: 0, DEX: 0, CON: 0, INT: 0, WIS: 0, CHA: 0, LUCK: 1 },
    skillBonuses: {},
  },
  Elf: {
    name: "Elf",
    region: "Lyssarion",
    description: "Graceful and wise, elves have enhanced dexterity and wisdom",
    statBonuses: { STR: -1, DEX: 2, CON: -1, INT: 1, WIS: 2, CHA: 1, LUCK: 0 },
    skillBonuses: { archery: 1, meditation: 1, nature_magic: 1 },
  },
  Dwarf: {
    name: "Dwarf",
    region: "Gromthar",
    description: "Sturdy and strong, dwarves excel in physical attributes",
    statBonuses: { STR: 2, DEX: -1, CON: 2, INT: 0, WIS: 0, CHA: -1, LUCK: 0 },
    skillBonuses: { blacksmithing: 1, mining: 1, stonework: 1 },
  },
  Orc: {
    name: "Orc",
    region: "Vrakgul",
    description: "Powerful warriors with great strength and constitution",
    statBonuses: { STR: 3, DEX: 0, CON: 2, INT: -2, WIS: -1, CHA: -1, LUCK: 0 },
    skillBonuses: { intimidation: 2, unarmed: 1, survival: 1 },
  },
  Goblin: {
    name: "Goblin",
    region: "Skrixel",
    description: "Small but cunning, goblins are agile and lucky",
    statBonuses: { STR: -2, DEX: 2, CON: -1, INT: 1, WIS: 0, CHA: 0, LUCK: 2 },
    skillBonuses: { stealth: 1, lockpicking: 1, bartering: 1 },
  },
  Demon: {
    name: "Demon",
    region: "Zarthorym",
    description: "Dark beings with enhanced magical abilities",
    statBonuses: { STR: 1, DEX: 0, CON: 1, INT: 2, WIS: 0, CHA: 1, LUCK: -1 },
    skillBonuses: { fire_magic: 2, intimidation: 1, death_magic: 1 },
  },
  Angel: {
    name: "Angel",
    region: "Celvayne",
    description: "Divine beings with enhanced wisdom and charisma",
    statBonuses: { STR: 0, DEX: 1, CON: 0, INT: 1, WIS: 2, CHA: 2, LUCK: 1 },
    skillBonuses: { divine_magic: 2, healing: 1, persuasion: 1 },
  },
  Undead: {
    name: "Undead",
    region: "Nethrogar",
    description: "Undead beings with enhanced constitution and dark magic",
    statBonuses: { STR: 0, DEX: -1, CON: 3, INT: 1, WIS: 0, CHA: -2, LUCK: -1 },
    skillBonuses: { death_magic: 2, intimidation: 1, survival: 1 },
  },
  Draconic: {
    name: "Draconic",
    region: "Vyrascor",
    description:
      "Dragon-blooded beings with enhanced physical and magical abilities",
    statBonuses: { STR: 2, DEX: 0, CON: 2, INT: 1, WIS: 1, CHA: 1, LUCK: 0 },
    skillBonuses: { fire_magic: 1, intimidation: 1, survival: 1 },
  },
  Fishman: {
    name: "Fishman",
    region: "Thaloryn",
    description: "Aquatic beings with enhanced swimming and water magic",
    statBonuses: { STR: 0, DEX: 1, CON: 1, INT: 0, WIS: 1, CHA: 0, LUCK: 0 },
    skillBonuses: { swimming: 2, nature_magic: 1, survival: 1 },
  },
  Birdman: {
    name: "Birdman",
    region: "Sylvarith",
    description: "Avian beings with enhanced dexterity and flight abilities",
    statBonuses: { STR: -1, DEX: 3, CON: 0, INT: 0, WIS: 1, CHA: 0, LUCK: 1 },
    skillBonuses: { acrobatics: 2, scouting: 1, archery: 1 },
  },
};

// Base stat ranges and point allocation system
export const statGeneration = {
  // Base stat ranges (before point allocation)
  baseStats: {
    STR: 8, // Base strength
    DEX: 8, // Base dexterity
    CON: 8, // Base constitution
    INT: 8, // Base intelligence
    WIS: 8, // Base wisdom
    CHA: 8, // Base charisma
    LUCK: 8, // Base luck (not included in point allocation)
  },

  // Point allocation system (10 points with escalating costs + malus system)
  pointAllocation: {
    totalPoints: 10,
    escalatingCosts: true, // Each additional point in a stat costs more
    maxStatValue: 18, // Maximum stat value after allocation
    minStatValue: 5, // Minimum stat value (allows malus)
    malusSystem: true, // 3 malus points = 2 bonus points
  },

  // Cost calculation for escalating point allocation with malus system
  getPointCost: function (currentValue, desiredValue) {
    if (!this.escalatingCosts) {
      return desiredValue - currentValue;
    }

    let totalCost = 0;

    if (desiredValue > currentValue) {
      // Bonus points (above base)
      for (let i = currentValue; i < desiredValue; i++) {
        totalCost += i - this.baseStats.STR + 1;
      }
    } else if (desiredValue < currentValue) {
      // Malus points (below base) - 3 malus points = 2 bonus points
      const malusPoints = currentValue - desiredValue;
      const bonusPointsGained = Math.floor((malusPoints * 2) / 3);
      totalCost = -bonusPointsGained; // Negative cost = points gained
    }

    return totalCost;
  },

  // Calculate remaining points after allocation (including malus system)
  calculateRemainingPoints: function (allocatedStats) {
    let usedPoints = 0;
    let malusBonusPoints = 0;

    Object.keys(this.baseStats).forEach((stat) => {
      if (stat !== "LUCK") {
        // LUCK not included in point allocation
        const allocated = allocatedStats[stat] || this.baseStats[stat];
        const cost = this.getPointCost(this.baseStats[stat], allocated);

        if (cost < 0) {
          // Malus points gained
          malusBonusPoints += Math.abs(cost);
        } else {
          // Bonus points spent
          usedPoints += cost;
        }
      }
    });

    return this.pointAllocation.totalPoints + malusBonusPoints - usedPoints;
  },
};

// Procedural character generation
export const proceduralGeneration = {
  // Generate random stats within reasonable ranges
  generateRandomStats: function () {
    const stats = { ...statGeneration.baseStats };

    // Randomly distribute points across stats (excluding LUCK)
    const statsToAllocate = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];
    let remainingPoints = statGeneration.pointAllocation.totalPoints;

    // Randomly allocate points
    while (remainingPoints > 0) {
      const randomStat =
        statsToAllocate[Math.floor(Math.random() * statsToAllocate.length)];
      const currentValue = stats[randomStat];

      // Don't exceed max value
      if (currentValue < statGeneration.pointAllocation.maxStatValue) {
        const cost = statGeneration.getPointCost(
          currentValue,
          currentValue + 1
        );
        if (cost <= remainingPoints) {
          stats[randomStat]++;
          remainingPoints -= cost;
        } else {
          // If we can't afford the next point, try a different stat
          const affordableStats = statsToAllocate.filter((stat) => {
            const nextCost = statGeneration.getPointCost(
              stats[stat],
              stats[stat] + 1
            );
            return (
              nextCost <= remainingPoints &&
              stats[stat] < statGeneration.pointAllocation.maxStatValue
            );
          });

          if (affordableStats.length === 0) break;

          const affordableStat =
            affordableStats[Math.floor(Math.random() * affordableStats.length)];
          const affordableCost = statGeneration.getPointCost(
            stats[affordableStat],
            stats[affordableStat] + 1
          );
          stats[affordableStat]++;
          remainingPoints -= affordableCost;
        }
      } else {
        // Remove this stat from consideration if it's at max
        const index = statsToAllocate.indexOf(randomStat);
        if (index > -1) {
          statsToAllocate.splice(index, 1);
        }
        if (statsToAllocate.length === 0) break;
      }
    }

    // Randomly generate LUCK (8-12 range)
    stats.LUCK = 8 + Math.floor(Math.random() * 5);

    return stats;
  },

  // Generate random class based on rarity
  generateRandomClass: function () {
    const classes = Object.keys(classDatabase);
    const rarityWeights = {
      common: 0.5, // 50% chance
      uncommon: 0.3, // 30% chance
      rare: 0.15, // 15% chance
      legendary: 0.05, // 5% chance
    };

    const random = Math.random();
    let targetRarity = "common";
    let cumulative = 0;

    for (const [rarity, weight] of Object.entries(rarityWeights)) {
      cumulative += weight;
      if (random <= cumulative) {
        targetRarity = rarity;
        break;
      }
    }

    // Filter classes by target rarity
    const classesOfRarity = classes.filter(
      (className) => classDatabase[className].rarity === targetRarity
    );

    if (classesOfRarity.length === 0) {
      // Fallback to common classes if none found
      return classes.filter(
        (className) => classDatabase[className].rarity === "common"
      )[
        Math.floor(
          Math.random() *
            classes.filter(
              (className) => classDatabase[className].rarity === "common"
            ).length
        )
      ];
    }

    return classesOfRarity[Math.floor(Math.random() * classesOfRarity.length)];
  },
};

// Equipment assignment system
export const equipmentAssignment = {
  // Generate starting equipment based on class preferences
  generateStartingEquipment: function (className) {
    const classData = classDatabase[className];
    if (!classData || !classData.equipmentPreferences) {
      return this.generateRandomEquipment();
    }

    const equipment = {
      armor: null,
      weapon: null,
      tool: null,
    };

    // Generate armor
    if (
      classData.equipmentPreferences.armor &&
      classData.equipmentPreferences.armor.length > 0
    ) {
      const armorType =
        classData.equipmentPreferences.armor[
          Math.floor(
            Math.random() * classData.equipmentPreferences.armor.length
          )
        ];
      equipment.armor = this.generateEquipmentItem("armor", armorType);
    }

    // Generate weapon
    if (
      classData.equipmentPreferences.weapon &&
      classData.equipmentPreferences.weapon.length > 0
    ) {
      const weaponType =
        classData.equipmentPreferences.weapon[
          Math.floor(
            Math.random() * classData.equipmentPreferences.weapon.length
          )
        ];
      equipment.weapon = this.generateEquipmentItem("weapon", weaponType);
    }

    // Generate tool
    if (
      classData.equipmentPreferences.tool &&
      classData.equipmentPreferences.tool.length > 0
    ) {
      const toolType =
        classData.equipmentPreferences.tool[
          Math.floor(Math.random() * classData.equipmentPreferences.tool.length)
        ];
      equipment.tool = this.generateEquipmentItem("tool", toolType);
    }

    return equipment;
  },

  // Generate random equipment when no class preferences
  generateRandomEquipment: function () {
    const equipment = {
      armor: null,
      weapon: null,
      tool: null,
    };

    // Randomly decide which equipment slots to fill (1-3 items)
    const slots = ["armor", "weapon", "tool"];
    const numSlots = 1 + Math.floor(Math.random() * 3);
    const selectedSlots = slots
      .sort(() => 0.5 - Math.random())
      .slice(0, numSlots);

    selectedSlots.forEach((slot) => {
      const equipmentType = equipmentTypes[slot];
      if (
        equipmentType &&
        equipmentType.items &&
        equipmentType.items.length > 0
      ) {
        const itemType =
          equipmentType.items[
            Math.floor(Math.random() * equipmentType.items.length)
          ];
        equipment[slot] = this.generateEquipmentItem(slot, itemType);
      }
    });

    return equipment;
  },

  // Generate individual equipment item with random properties
  generateEquipmentItem: function (slot, itemType) {
    const equipmentType = equipmentTypes[slot];
    if (!equipmentType) return null;

    // Random status (weighted toward better condition for starting equipment)
    const statusType = equipmentStatus[equipmentType.statusType];
    const statusWeights = [0.05, 0.1, 0.2, 0.3, 0.25, 0.08, 0.02]; // Weighted toward "Good" condition
    const randomStatus = this.weightedRandom(
      statusType.statuses,
      statusWeights
    );

    // Random material (weighted toward common materials)
    const materials = Object.keys(equipmentMaterials);
    const materialWeights = [0.4, 0.3, 0.15, 0.1, 0.03, 0.015, 0.005]; // Weighted toward cloth/leather/iron
    const randomMaterial = this.weightedRandom(materials, materialWeights);

    // Random quality (weighted toward common quality)
    const qualities = Object.keys(equipmentQuality);
    const qualityWeights = [0.1, 0.6, 0.2, 0.08, 0.02]; // Weighted toward common
    const randomQuality = this.weightedRandom(qualities, qualityWeights);

    // Format: "status,material,quality,itemType"
    return `${randomStatus.name.toLowerCase()},${randomMaterial},${randomQuality},${itemType}`;
  },

  // Weighted random selection
  weightedRandom: function (items, weights) {
    const random = Math.random();
    let cumulative = 0;

    for (let i = 0; i < items.length; i++) {
      cumulative += weights[i] || 0;
      if (random <= cumulative) {
        return items[i];
      }
    }

    return items[items.length - 1]; // Fallback
  },
};

// Main character generation functions
export const characterGeneration = {
  // Generate a complete character with all components
  generateCharacter: function (options = {}) {
    const {
      usePointAllocation = false,
      className = null,
      raceName = null,
      firstName = null,
      lastName = null,
      customStats = null,
      isPlayer = false,
    } = options;

    // Generate race
    const selectedRace = raceName || this.generateRandomRace();
    const raceData = raceDatabase[selectedRace];

    // Debug and error handling
    if (!raceData) {
      console.error(`Race data not found for: ${selectedRace}`);
      console.error(`Available races:`, Object.keys(raceDatabase));
      // Fallback to Human if race not found
      const fallbackRace = "Human";
      const fallbackRaceData = raceDatabase[fallbackRace];
      console.log(`Using fallback race: ${fallbackRace}`);
      return this.generateCharacter({ ...options, raceName: fallbackRace });
    }

    // Generate stats
    let baseStats;
    if (customStats) {
      baseStats = { ...statGeneration.baseStats, ...customStats };
    } else if (usePointAllocation) {
      baseStats = statGeneration.baseStats; // Will be modified by point allocation
    } else {
      baseStats = proceduralGeneration.generateRandomStats();
    }

    // Apply race stat bonuses
    const raceAdjustedStats = { ...baseStats };
    Object.keys(raceData.statBonuses).forEach((stat) => {
      raceAdjustedStats[stat] += raceData.statBonuses[stat];
    });

    // Generate class
    const selectedClass =
      className || proceduralGeneration.generateRandomClass();

    // Calculate final stats with class bonuses
    const finalStats = calculateClassStats(raceAdjustedStats, selectedClass, 1);

    // Generate starting skills (class + race)
    const startingSkills = { ...(getClassStartingSkills(selectedClass) || {}) };
    Object.keys(raceData.skillBonuses).forEach((skill) => {
      startingSkills[skill] =
        (startingSkills[skill] || 0) + raceData.skillBonuses[skill];
    });

    // Generate equipment
    const equipment = isPlayer
      ? this.generatePlayerStartingEquipment(selectedClass)
      : equipmentAssignment.generateStartingEquipment(selectedClass);

    // Generate names if not provided
    const generatedFirstName = firstName || this.generateRandomName("first");
    const generatedLastName = lastName || this.generateRandomName("last");

    // Create character object
    const character = {
      id: `char_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      firstName: generatedFirstName,
      lastName: generatedLastName,
      race: selectedRace,
      class: selectedClass,
      classLevel: 1,
      stats: finalStats,
      skills: startingSkills,
      health: {
        current: Math.floor(finalStats.CON * 2 + 10), // Health based on Constitution
        max: Math.floor(finalStats.CON * 2 + 10),
      },
      equipment: equipment,
      history: `${generatedFirstName} ${generatedLastName} is a ${
        raceData.name
      } ${classDatabase[
        selectedClass
      ].name.toLowerCase()} who has joined your group.`,
      experience: 0,
      level: 1,
    };

    return character;
  },

  // Generate player starting equipment (clothes, weapon, 1 skill kit)
  generatePlayerStartingEquipment: function (className) {
    const equipment = {
      armor: null,
      weapon: null,
      tool: null,
    };

    // Always give clothes (basic armor)
    equipment.armor = this.generateEquipmentItem("armor", "simple");

    // Give weapon based on class preferences
    const classData = classDatabase[className];
    if (
      classData &&
      classData.equipmentPreferences &&
      classData.equipmentPreferences.weapon
    ) {
      const weaponType =
        classData.equipmentPreferences.weapon[
          Math.floor(
            Math.random() * classData.equipmentPreferences.weapon.length
          )
        ];
      equipment.weapon = this.generateEquipmentItem("weapon", weaponType);
    } else {
      // Default weapon
      equipment.weapon = this.generateEquipmentItem("weapon", "sword");
    }

    // Give 1 skill kit based on class starting skills
    const startingSkills = getClassStartingSkills(className) || {};
    const skillNames = Object.keys(startingSkills);
    if (skillNames.length > 0) {
      const randomSkill =
        skillNames[Math.floor(Math.random() * skillNames.length)];
      const skillKit = this.getSkillKitForSkill(randomSkill);
      if (skillKit) {
        equipment.tool = this.generateEquipmentItem("tool", skillKit);
      }
    }

    return equipment;
  },

  // Get skill kit name for a given skill
  getSkillKitForSkill: function (skillName) {
    const skillKits = {
      // Combat Skills
      swordfighting: "sword_kit",
      archery: "archery_kit",
      polearms: "polearm_kit",
      unarmed: "training_weights",
      shieldwork: "shield_kit",
      tactics: "tactics_manual",
      intimidation: "intimidation_tools",
      divine_magic: "holy_symbol",

      // Exploration Skills
      navigation: "navigation_kit",
      tracking: "tracking_kit",
      cartography: "cartography_kit",
      survival: "survival_gear",
      climbing: "climbing_gear",
      swimming: "swimming_gear",
      scouting: "scouting_kit",
      stealth: "stealth_kit",

      // Crafting Skills
      blacksmithing: "smithing_tools",
      alchemy: "alchemy_kit",
      leatherworking: "leatherworking_tools",
      tailoring: "tailoring_kit",
      cooking: "cooking_kit",
      jewelcrafting: "jewelcrafting_tools",
      enchanting: "enchanting_kit",
      herbalism: "herb_pouch",
      carpentry: "carpentry_tools",
      scribing: "scribing_kit",

      // Social Skills
      diplomacy: "diplomacy_kit",
      bartering: "merchant_kit",
      persuasion: "persuasion_tools",
      animal_handling: "animal_handling_kit",
      lockpicking: "lockpicks",
      trap_disarming: "trap_disarming_kit",
      lore_knowledge: "lore_books",
      investigation: "investigation_kit",
      insight: "insight_tools",
      performance: "performance_kit",
      deception: "deception_tools",
      sleight_of_hand: "sleight_of_hand_kit",

      // Magic Skills
      fire_magic: "fire_crystals",
      ice_magic: "ice_crystals",
      earth_magic: "earth_stones",
      death_magic: "skull",

      // Specialized Skills
      meditation: "meditation_mat",
      healing: "healing_kit",
      acrobatics: "acrobatics_gear",
      nature_magic: "nature_totem",

      // Professional Skills
      mining: "mining_pick",
      stonework: "stonework_tools",
    };

    return skillKits[skillName] || "general_tools";
  },

  // Generate random race
  generateRandomRace: function () {
    const races = Object.keys(raceDatabase);
    return races[Math.floor(Math.random() * races.length)];
  },

  // Generate random names (placeholder - will be enhanced in 1.5)
  generateRandomName: function (type) {
    const firstNames = [
      "Marcus",
      "Elena",
      "Thorin",
      "Lyra",
      "Gareth",
      "Aria",
      "Finn",
      "Zara",
      "Kael",
      "Nora",
      "Darius",
      "Maya",
      "Orion",
      "Luna",
      "Cyrus",
      "Iris",
      "Phoenix",
      "Sage",
      "River",
      "Willow",
      "Blaze",
      "Storm",
      "Shadow",
      "Dawn",
    ];

    const lastNames = [
      "Ironhand",
      "Swiftfoot",
      "Brightblade",
      "Stormcaller",
      "Nightwhisper",
      "Goldheart",
      "Firebrand",
      "Iceborn",
      "Windrider",
      "Earthshaker",
      "Starweaver",
      "Moonchild",
      "Sunstrider",
      "Shadowbane",
      "Lightbringer",
      "Thornbrook",
      "Oakshield",
      "Silverleaf",
      "Copperforge",
      "Steelheart",
    ];

    if (type === "first") {
      return firstNames[Math.floor(Math.random() * firstNames.length)];
    } else if (type === "last") {
      return lastNames[Math.floor(Math.random() * lastNames.length)];
    }

    return "Unknown";
  },

  // Validate point allocation
  validatePointAllocation: function (allocatedStats) {
    const remainingPoints =
      statGeneration.calculateRemainingPoints(allocatedStats);
    const isValid = remainingPoints >= 0;

    return {
      isValid,
      remainingPoints,
      message: isValid
        ? `Remaining points: ${remainingPoints}`
        : `Invalid allocation: ${Math.abs(remainingPoints)} points over budget`,
    };
  },

  // Get available classes by rarity
  getClassesByRarity: function (rarity) {
    return Object.keys(classDatabase).filter(
      (className) => classDatabase[className].rarity === rarity
    );
  },

  // Get all available classes
  getAllClasses: function () {
    return Object.keys(classDatabase);
  },

  // Get all available races
  getAllRaces: function () {
    return Object.keys(raceDatabase);
  },

  // Generate equipment item (helper function)
  generateEquipmentItem: function (slot, itemType) {
    return equipmentAssignment.generateEquipmentItem(slot, itemType);
  },
};

// Export main functions for use in other modules
export default characterGeneration;
