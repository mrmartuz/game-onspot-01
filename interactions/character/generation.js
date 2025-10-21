import {
  calculateClassStats,
  getClassStartingSkills,
} from "../combat/classes.js";
import { skillDatabase } from "../skills.js";
import { raceDatabase } from "./races.js";
import { nameDatabase } from "./names.js";
import { statGeneration, proceduralGeneration } from "./stats.js";
import { equipmentAssignment } from "./equipment-assignment.js";

// Main character generation functions
export const characterGeneration = {
  // Generate a complete character with all components
  generateCharacter: async function (options = {}) {
    const {
      usePointAllocation = false,
      className = null,
      raceName = null,
      gender = null,
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

    // Generate gender
    const selectedGender =
      gender || proceduralGeneration.generateRandomGender();

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

    // Apply gender stat bonuses
    const genderBonuses = raceData.genderBonuses[selectedGender];
    if (genderBonuses) {
      Object.keys(genderBonuses).forEach((stat) => {
        raceAdjustedStats[stat] += genderBonuses[stat];
      });
    }

    // Generate class
    const selectedClass =
      className || (await proceduralGeneration.generateRandomClass());

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
      ? await this.generatePlayerStartingEquipment(selectedClass)
      : await equipmentAssignment.generateStartingEquipment(selectedClass);

    // Generate names if not provided (race and gender specific)
    const generatedFirstName =
      firstName ||
      this.generateRandomName("first", selectedRace, selectedGender);
    const generatedLastName =
      lastName || this.generateRandomName("last", selectedRace);

    // Create character object
    const character = {
      id: `char_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      firstName: generatedFirstName,
      lastName: generatedLastName,
      gender: selectedGender,
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
      history: `${generatedFirstName} ${generatedLastName} is a ${selectedGender} ${raceData.name} ${selectedClass} who has joined your group.`,
      experience: 0,
      level: 1,
    };

    return character;
  },

  // Generate player starting equipment (clothes, weapon, shield/tool based on class)
  generatePlayerStartingEquipment: async function (className) {
    const equipment = {
      clothes: null,
      armor: null,
      weapon: null,
      secondHand: null,
      back: null,
      tool: null,
    };

    // ALWAYS generate clothes for all characters
    equipment.clothes = this.generateEquipmentItem(
      "clothes",
      "commoner-clothes"
    );

    // Give weapon based on class preferences with specific requirements
    const { classDatabase } = await import("../combat/classes.js");
    const classData = classDatabase[className];
    if (
      classData &&
      classData.equipmentPreferences &&
      classData.equipmentPreferences.weapon
    ) {
      let weaponType;

      // Specific weapon requirements for certain classes
      if (className === "archer") {
        // Archers get a bow in the back slot, and a melee weapon in weapon slot
        const bowType = classData.equipmentPreferences.back
          ? classData.equipmentPreferences.back.find((item) =>
              item.includes("bow")
            ) || "shortbow"
          : "shortbow";
        equipment.back = this.generateEquipmentItem("ranged", bowType);
        weaponType = "dagger"; // Backup melee weapon
      } else if (className === "ranger") {
        weaponType = "axe";
      } else if (className === "brute") {
        weaponType = "axe";
      } else if (className === "herbalist") {
        weaponType = "sickle";
      } else if (className === "craftsman") {
        weaponType = "hammer";
      } else {
        // For other classes, pick from their preferences
        weaponType =
          classData.equipmentPreferences.weapon[
            Math.floor(
              Math.random() * classData.equipmentPreferences.weapon.length
            )
          ];
      }

      equipment.weapon = this.generateEquipmentItem("weapon1h", weaponType);
    } else {
      // Default weapon
      equipment.weapon = this.generateEquipmentItem("weapon1h", "sword");
    }

    // Give shield for fighter class
    if (className === "fighter") {
      equipment.secondHand = this.generateEquipmentItem("shield", "shield");
    }

    // Give armor for martial classes
    const martialClasses = [
      "fighter",
      "archer",
      "brute",
      "martial_artist",
      "paladin",
      "cleric",
      "ranger",
      "hunter",
      "dungeondiver",
    ];
    if (
      martialClasses.includes(className) &&
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
      swords: "sword_kit",
      great_swords: "greatsword_kit",
      axes: "axe_kit",
      great_axes: "greataxe_kit",
      polearms: "polearm_kit",
      hammers: "hammer_kit",
      great_hammers: "greathammer_kit",
      bows: "archery_kit",
      crossbows: "crossbow_kit",
      throwing: "throwing_kit",
      shields: "shield_kit",
      great_shields: "greatshield_kit",
      unarmed: "training_weights",
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

  // Generate random race based on rarity weights
  generateRandomRace: function () {
    const races = Object.keys(raceDatabase);
    const rarityWeights = {
      common: 0.948, // 94.8% chance for common races
      uncommon: 0.05, // 5% chance for uncommon races
      rare: 0.0017, // 0.17% chance for rare races (very rare)
      legendary: 0.0003, // 0.03% chance for legendary races (extremely rare)
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

    // Filter races by target rarity
    const racesOfRarity = races.filter(
      (raceName) => raceDatabase[raceName].rarity === targetRarity
    );

    if (racesOfRarity.length === 0) {
      // Fallback to common races if none found
      return races.filter(
        (raceName) => raceDatabase[raceName].rarity === "common"
      )[
        Math.floor(
          Math.random() *
            races.filter(
              (raceName) => raceDatabase[raceName].rarity === "common"
            ).length
        )
      ];
    }

    return racesOfRarity[Math.floor(Math.random() * racesOfRarity.length)];
  },

  // Generate random names (race and gender specific)
  generateRandomName: function (type, race = "Human", gender = "male") {
    const raceData = nameDatabase[race];
    if (!raceData) {
      console.error(`Name data not found for race: ${race}`);
      return "Unknown";
    }

    const genderData = raceData[gender];
    if (!genderData) {
      console.error(`Name data not found for race: ${race}, gender: ${gender}`);
      return "Unknown";
    }

    if (type === "first") {
      const firstNames = genderData.firstNames;
      return firstNames[Math.floor(Math.random() * firstNames.length)];
    } else if (type === "last") {
      const lastNames = genderData.lastNames;
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
  getClassesByRarity: async function (rarity) {
    const { classDatabase } = await import("../combat/classes.js");
    return Object.keys(classDatabase).filter(
      (className) => classDatabase[className].rarity === rarity
    );
  },

  // Get all available classes
  getAllClasses: async function () {
    const { classDatabase } = await import("../combat/classes.js");
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
