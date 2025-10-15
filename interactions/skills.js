// Skill system for enhanced character progression
// Skills range from 0.01 to 99.99 with difficulty scaling and synergies

export const skillDatabase = {
  // COMBAT SKILLS (8 skills)
  swordfighting: {
    name: "Swordfighting",
    category: "combat",
    description:
      "The art of wielding swords and other bladed weapons in combat.",
    maxLevel: 99.99,
    difficulty: "medium",
    primaryStat: "STR",
    secondaryStat: "DEX",
    prerequisites: [],
    synergies: ["shieldwork", "tactics"],
    bonusCalculation: "linear", // Each level adds +0.1 to combat bonus
    experienceMultiplier: 1.0,
  },

  archery: {
    name: "Archery",
    category: "combat",
    description: "The skill of using bows and crossbows with deadly accuracy.",
    maxLevel: 99.99,
    difficulty: "medium",
    primaryStat: "DEX",
    secondaryStat: "WIS",
    prerequisites: [],
    synergies: ["tracking", "scouting"],
    bonusCalculation: "linear",
    experienceMultiplier: 1.0,
  },

  polearms: {
    name: "Polearms",
    category: "combat",
    description: "Mastery of long weapons like spears, halberds, and pikes.",
    maxLevel: 99.99,
    difficulty: "medium",
    primaryStat: "STR",
    secondaryStat: "CON",
    prerequisites: [],
    synergies: ["tactics", "intimidation"],
    bonusCalculation: "linear",
    experienceMultiplier: 1.0,
  },

  unarmed: {
    name: "Unarmed Combat",
    category: "combat",
    description:
      "Fighting without weapons using fists, kicks, and martial arts.",
    maxLevel: 99.99,
    difficulty: "hard",
    primaryStat: "DEX",
    secondaryStat: "STR",
    prerequisites: [],
    synergies: ["acrobatics", "meditation"],
    bonusCalculation: "linear",
    experienceMultiplier: 1.2,
  },

  shieldwork: {
    name: "Shieldwork",
    category: "combat",
    description:
      "The defensive art of using shields to protect oneself and allies.",
    maxLevel: 99.99,
    difficulty: "medium",
    primaryStat: "CON",
    secondaryStat: "STR",
    prerequisites: [],
    synergies: ["swordfighting", "tactics"],
    bonusCalculation: "linear",
    experienceMultiplier: 1.0,
  },

  tactics: {
    name: "Tactics",
    category: "combat",
    description:
      "Strategic thinking and battlefield awareness in combat situations.",
    maxLevel: 99.99,
    difficulty: "hard",
    primaryStat: "INT",
    secondaryStat: "WIS",
    prerequisites: [],
    synergies: ["swordfighting", "polearms", "shieldwork"],
    bonusCalculation: "linear",
    experienceMultiplier: 1.3,
  },

  intimidation: {
    name: "Intimidation",
    category: "combat",
    description:
      "Using fear and psychological pressure to gain advantage in combat.",
    maxLevel: 99.99,
    difficulty: "easy",
    primaryStat: "CHA",
    secondaryStat: "STR",
    prerequisites: [],
    synergies: ["polearms", "unarmed"],
    bonusCalculation: "linear",
    experienceMultiplier: 0.8,
  },

  divine_magic: {
    name: "Divine Magic",
    category: "combat",
    description:
      "Channeling divine power for healing, protection, and smiting enemies.",
    maxLevel: 99.99,
    difficulty: "hard",
    primaryStat: "WIS",
    secondaryStat: "CHA",
    prerequisites: [],
    synergies: ["healing", "persuasion"],
    bonusCalculation: "linear",
    experienceMultiplier: 1.4,
  },

  // EXPLORATION SKILLS (8 skills)
  navigation: {
    name: "Navigation",
    category: "exploration",
    description:
      "Finding your way through unknown terrain and tracking your position.",
    maxLevel: 99.99,
    difficulty: "medium",
    primaryStat: "WIS",
    secondaryStat: "INT",
    prerequisites: [],
    synergies: ["cartography", "scouting"],
    bonusCalculation: "linear",
    experienceMultiplier: 1.0,
  },

  tracking: {
    name: "Tracking",
    category: "exploration",
    description:
      "Following trails, reading signs, and hunting prey through the wilderness.",
    maxLevel: 99.99,
    difficulty: "medium",
    primaryStat: "WIS",
    secondaryStat: "DEX",
    prerequisites: [],
    synergies: ["archery", "survival", "scouting"],
    bonusCalculation: "linear",
    experienceMultiplier: 1.0,
  },

  cartography: {
    name: "Cartography",
    category: "exploration",
    description:
      "Creating and reading maps, understanding geographical features.",
    maxLevel: 99.99,
    difficulty: "hard",
    primaryStat: "INT",
    secondaryStat: "WIS",
    prerequisites: [],
    synergies: ["navigation", "lore_knowledge"],
    bonusCalculation: "linear",
    experienceMultiplier: 1.2,
  },

  survival: {
    name: "Survival",
    category: "exploration",
    description:
      "Staying alive in harsh wilderness conditions and finding resources.",
    maxLevel: 99.99,
    difficulty: "medium",
    primaryStat: "CON",
    secondaryStat: "WIS",
    prerequisites: [],
    synergies: ["tracking", "herbalism", "cooking"],
    bonusCalculation: "linear",
    experienceMultiplier: 1.0,
  },

  climbing: {
    name: "Climbing",
    category: "exploration",
    description: "Scaling walls, cliffs, and other vertical surfaces safely.",
    maxLevel: 99.99,
    difficulty: "medium",
    primaryStat: "STR",
    secondaryStat: "DEX",
    prerequisites: [],
    synergies: ["acrobatics", "survival"],
    bonusCalculation: "linear",
    experienceMultiplier: 1.0,
  },

  swimming: {
    name: "Swimming",
    category: "exploration",
    description:
      "Moving through water efficiently and surviving aquatic environments.",
    maxLevel: 99.99,
    difficulty: "easy",
    primaryStat: "STR",
    secondaryStat: "CON",
    prerequisites: [],
    synergies: ["survival", "climbing"],
    bonusCalculation: "linear",
    experienceMultiplier: 0.8,
  },

  scouting: {
    name: "Scouting",
    category: "exploration",
    description:
      "Moving unseen, gathering intelligence, and avoiding detection.",
    maxLevel: 99.99,
    difficulty: "medium",
    primaryStat: "DEX",
    secondaryStat: "WIS",
    prerequisites: [],
    synergies: ["stealth", "tracking", "archery"],
    bonusCalculation: "linear",
    experienceMultiplier: 1.0,
  },

  stealth: {
    name: "Stealth",
    category: "exploration",
    description: "Moving silently and remaining hidden from enemies.",
    maxLevel: 99.99,
    difficulty: "hard",
    primaryStat: "DEX",
    secondaryStat: "WIS",
    prerequisites: [],
    synergies: ["scouting", "lockpicking"],
    bonusCalculation: "linear",
    experienceMultiplier: 1.2,
  },

  // CRAFTING SKILLS (10 skills)
  blacksmithing: {
    name: "Blacksmithing",
    category: "crafting",
    description: "Working with metal to create weapons, armor, and tools.",
    maxLevel: 99.99,
    difficulty: "hard",
    primaryStat: "STR",
    secondaryStat: "INT",
    prerequisites: [],
    synergies: ["carpentry", "leatherworking"],
    bonusCalculation: "linear",
    experienceMultiplier: 1.3,
  },

  alchemy: {
    name: "Alchemy",
    category: "crafting",
    description:
      "Creating potions, elixirs, and magical compounds through chemistry.",
    maxLevel: 99.99,
    difficulty: "hard",
    primaryStat: "INT",
    secondaryStat: "WIS",
    prerequisites: [],
    synergies: ["herbalism", "investigation"],
    bonusCalculation: "linear",
    experienceMultiplier: 1.4,
  },

  leatherworking: {
    name: "Leatherworking",
    category: "crafting",
    description:
      "Crafting leather goods, armor, and equipment from animal hides.",
    maxLevel: 99.99,
    difficulty: "medium",
    primaryStat: "DEX",
    secondaryStat: "INT",
    prerequisites: [],
    synergies: ["blacksmithing", "tailoring"],
    bonusCalculation: "linear",
    experienceMultiplier: 1.0,
  },

  tailoring: {
    name: "Tailoring",
    category: "crafting",
    description: "Creating clothing, robes, and fabric-based equipment.",
    maxLevel: 99.99,
    difficulty: "medium",
    primaryStat: "DEX",
    secondaryStat: "INT",
    prerequisites: [],
    synergies: ["leatherworking", "cooking"],
    bonusCalculation: "linear",
    experienceMultiplier: 1.0,
  },

  cooking: {
    name: "Cooking",
    category: "crafting",
    description:
      "Preparing meals that provide sustenance and temporary benefits.",
    maxLevel: 99.99,
    difficulty: "easy",
    primaryStat: "WIS",
    secondaryStat: "CON",
    prerequisites: [],
    synergies: ["survival", "herbalism"],
    bonusCalculation: "linear",
    experienceMultiplier: 0.8,
  },

  jewelcrafting: {
    name: "Jewelcrafting",
    category: "crafting",
    description: "Creating jewelry, gems, and magical trinkets.",
    maxLevel: 99.99,
    difficulty: "hard",
    primaryStat: "DEX",
    secondaryStat: "INT",
    prerequisites: [],
    synergies: ["enchanting", "bartering"],
    bonusCalculation: "linear",
    experienceMultiplier: 1.3,
  },

  enchanting: {
    name: "Enchanting",
    category: "crafting",
    description: "Imbuing items with magical properties and powers.",
    maxLevel: 99.99,
    difficulty: "hard",
    primaryStat: "INT",
    secondaryStat: "WIS",
    prerequisites: [],
    synergies: ["jewelcrafting", "lore_knowledge"],
    bonusCalculation: "linear",
    experienceMultiplier: 1.5,
  },

  herbalism: {
    name: "Herbalism",
    category: "crafting",
    description:
      "Identifying, harvesting, and using plants for healing and magic.",
    maxLevel: 99.99,
    difficulty: "medium",
    primaryStat: "WIS",
    secondaryStat: "INT",
    prerequisites: [],
    synergies: ["alchemy", "healing", "survival"],
    bonusCalculation: "linear",
    experienceMultiplier: 1.0,
  },

  carpentry: {
    name: "Carpentry",
    category: "crafting",
    description:
      "Working with wood to create structures, furniture, and tools.",
    maxLevel: 99.99,
    difficulty: "medium",
    primaryStat: "STR",
    secondaryStat: "DEX",
    prerequisites: [],
    synergies: ["blacksmithing", "survival"],
    bonusCalculation: "linear",
    experienceMultiplier: 1.0,
  },

  scribing: {
    name: "Scribing",
    category: "crafting",
    description: "Creating written documents, scrolls, and magical texts.",
    maxLevel: 99.99,
    difficulty: "medium",
    primaryStat: "INT",
    secondaryStat: "DEX",
    prerequisites: [],
    synergies: ["lore_knowledge", "enchanting"],
    bonusCalculation: "linear",
    experienceMultiplier: 1.1,
  },

  // SOCIAL SKILLS (8 skills)
  diplomacy: {
    name: "Diplomacy",
    category: "social",
    description:
      "Negotiating, mediating conflicts, and building relationships.",
    maxLevel: 99.99,
    difficulty: "hard",
    primaryStat: "CHA",
    secondaryStat: "INT",
    prerequisites: [],
    synergies: ["persuasion", "insight"],
    bonusCalculation: "linear",
    experienceMultiplier: 1.3,
  },

  bartering: {
    name: "Bartering",
    category: "social",
    description: "Trading goods and services for favorable prices and deals.",
    maxLevel: 99.99,
    difficulty: "medium",
    primaryStat: "CHA",
    secondaryStat: "INT",
    prerequisites: [],
    synergies: ["persuasion", "insight"],
    bonusCalculation: "linear",
    experienceMultiplier: 1.0,
  },

  persuasion: {
    name: "Persuasion",
    category: "social",
    description: "Convincing others to see your point of view and take action.",
    maxLevel: 99.99,
    difficulty: "medium",
    primaryStat: "CHA",
    secondaryStat: "WIS",
    prerequisites: [],
    synergies: ["diplomacy", "bartering"],
    bonusCalculation: "linear",
    experienceMultiplier: 1.0,
  },

  animal_handling: {
    name: "Animal Handling",
    category: "social",
    description:
      "Working with animals, training them, and understanding their behavior.",
    maxLevel: 99.99,
    difficulty: "medium",
    primaryStat: "WIS",
    secondaryStat: "CHA",
    prerequisites: [],
    synergies: ["survival", "tracking"],
    bonusCalculation: "linear",
    experienceMultiplier: 1.0,
  },

  lockpicking: {
    name: "Lockpicking",
    category: "social",
    description:
      "Opening locks, disabling traps, and bypassing security measures.",
    maxLevel: 99.99,
    difficulty: "hard",
    primaryStat: "DEX",
    secondaryStat: "INT",
    prerequisites: [],
    synergies: ["trap_disarming", "stealth"],
    bonusCalculation: "linear",
    experienceMultiplier: 1.2,
  },

  trap_disarming: {
    name: "Trap Disarming",
    category: "social",
    description:
      "Identifying, understanding, and safely disabling traps and mechanisms.",
    maxLevel: 99.99,
    difficulty: "hard",
    primaryStat: "INT",
    secondaryStat: "DEX",
    prerequisites: [],
    synergies: ["lockpicking", "investigation"],
    bonusCalculation: "linear",
    experienceMultiplier: 1.3,
  },

  lore_knowledge: {
    name: "Lore Knowledge",
    category: "social",
    description: "Understanding history, legends, and ancient knowledge.",
    maxLevel: 99.99,
    difficulty: "hard",
    primaryStat: "INT",
    secondaryStat: "WIS",
    prerequisites: [],
    synergies: ["investigation", "cartography"],
    bonusCalculation: "linear",
    experienceMultiplier: 1.2,
  },

  investigation: {
    name: "Investigation",
    category: "social",
    description:
      "Gathering information, analyzing clues, and solving mysteries.",
    maxLevel: 99.99,
    difficulty: "hard",
    primaryStat: "INT",
    secondaryStat: "WIS",
    prerequisites: [],
    synergies: ["lore_knowledge", "trap_disarming"],
    bonusCalculation: "linear",
    experienceMultiplier: 1.2,
  },

  // ADDITIONAL SKILLS (4 skills)
  insight: {
    name: "Insight",
    category: "social",
    description:
      "Reading people's intentions and understanding their true motives.",
    maxLevel: 99.99,
    difficulty: "hard",
    primaryStat: "WIS",
    secondaryStat: "CHA",
    prerequisites: [],
    synergies: ["diplomacy", "persuasion"],
    bonusCalculation: "linear",
    experienceMultiplier: 1.3,
  },

  performance: {
    name: "Performance",
    category: "social",
    description:
      "Entertaining others through music, storytelling, or other arts.",
    maxLevel: 99.99,
    difficulty: "medium",
    primaryStat: "CHA",
    secondaryStat: "DEX",
    prerequisites: [],
    synergies: ["persuasion", "bartering"],
    bonusCalculation: "linear",
    experienceMultiplier: 1.0,
  },

  deception: {
    name: "Deception",
    category: "social",
    description: "Lying convincingly and misleading others for personal gain.",
    maxLevel: 99.99,
    difficulty: "medium",
    primaryStat: "CHA",
    secondaryStat: "INT",
    prerequisites: [],
    synergies: ["stealth", "sleight_of_hand"],
    bonusCalculation: "linear",
    experienceMultiplier: 1.0,
  },

  sleight_of_hand: {
    name: "Sleight of Hand",
    category: "social",
    description:
      "Performing tricks, pickpocketing, and manipulating objects unnoticed.",
    maxLevel: 99.99,
    difficulty: "hard",
    primaryStat: "DEX",
    secondaryStat: "CHA",
    prerequisites: [],
    synergies: ["stealth", "deception"],
    bonusCalculation: "linear",
    experienceMultiplier: 1.2,
  },

  // MAGIC SKILLS (4 skills)
  fire_magic: {
    name: "Fire Magic",
    category: "magic",
    description: "Channeling the destructive power of fire and heat.",
    maxLevel: 99.99,
    difficulty: "hard",
    primaryStat: "INT",
    secondaryStat: "CHA",
    prerequisites: [],
    synergies: ["alchemy", "intimidation"],
    bonusCalculation: "linear",
    experienceMultiplier: 1.4,
  },

  ice_magic: {
    name: "Ice Magic",
    category: "magic",
    description: "Commanding the power of cold, frost, and winter.",
    maxLevel: 99.99,
    difficulty: "hard",
    primaryStat: "INT",
    secondaryStat: "WIS",
    prerequisites: [],
    synergies: ["meditation", "survival"],
    bonusCalculation: "linear",
    experienceMultiplier: 1.4,
  },

  earth_magic: {
    name: "Earth Magic",
    category: "magic",
    description:
      "Manipulating stone, metal, and the very ground beneath your feet.",
    maxLevel: 99.99,
    difficulty: "hard",
    primaryStat: "INT",
    secondaryStat: "CON",
    prerequisites: [],
    synergies: ["mining", "stonework"],
    bonusCalculation: "linear",
    experienceMultiplier: 1.4,
  },

  death_magic: {
    name: "Death Magic",
    category: "magic",
    description: "Commanding the power of death, decay, and the undead.",
    maxLevel: 99.99,
    difficulty: "hard",
    primaryStat: "INT",
    secondaryStat: "WIS",
    prerequisites: [],
    synergies: ["lore_knowledge", "investigation"],
    bonusCalculation: "linear",
    experienceMultiplier: 1.5,
  },

  // SPECIALIZED SKILLS (4 skills)
  meditation: {
    name: "Meditation",
    category: "specialized",
    description:
      "Achieving inner peace and spiritual enlightenment through contemplation.",
    maxLevel: 99.99,
    difficulty: "medium",
    primaryStat: "WIS",
    secondaryStat: "CON",
    prerequisites: [],
    synergies: ["healing", "unarmed"],
    bonusCalculation: "linear",
    experienceMultiplier: 1.1,
  },

  healing: {
    name: "Healing",
    category: "specialized",
    description:
      "Restoring health and treating injuries through natural and magical means.",
    maxLevel: 99.99,
    difficulty: "medium",
    primaryStat: "WIS",
    secondaryStat: "INT",
    prerequisites: [],
    synergies: ["herbalism", "divine_magic"],
    bonusCalculation: "linear",
    experienceMultiplier: 1.1,
  },

  acrobatics: {
    name: "Acrobatics",
    category: "specialized",
    description:
      "Performing athletic feats, dodging attacks, and moving with grace.",
    maxLevel: 99.99,
    difficulty: "hard",
    primaryStat: "DEX",
    secondaryStat: "STR",
    prerequisites: [],
    synergies: ["unarmed", "climbing"],
    bonusCalculation: "linear",
    experienceMultiplier: 1.2,
  },

  nature_magic: {
    name: "Nature Magic",
    category: "specialized",
    description: "Channeling the power of nature and the natural world.",
    maxLevel: 99.99,
    difficulty: "hard",
    primaryStat: "WIS",
    secondaryStat: "CON",
    prerequisites: [],
    synergies: ["herbalism", "animal_handling"],
    bonusCalculation: "linear",
    experienceMultiplier: 1.3,
  },

  // PROFESSIONAL SKILLS (2 skills)
  mining: {
    name: "Mining",
    category: "professional",
    description: "Extracting valuable materials from the earth and stone.",
    maxLevel: 99.99,
    difficulty: "medium",
    primaryStat: "STR",
    secondaryStat: "CON",
    prerequisites: [],
    synergies: ["earth_magic", "blacksmithing"],
    bonusCalculation: "linear",
    experienceMultiplier: 1.0,
  },

  stonework: {
    name: "Stonework",
    category: "professional",
    description: "Working with stone to create structures, tools, and art.",
    maxLevel: 99.99,
    difficulty: "medium",
    primaryStat: "STR",
    secondaryStat: "INT",
    prerequisites: [],
    synergies: ["mining", "carpentry"],
    bonusCalculation: "linear",
    experienceMultiplier: 1.0,
  },
};

// Skill categories for organization
export const skillCategories = {
  combat: {
    name: "Combat",
    description: "Skills related to fighting and warfare",
    color: "#ff4444",
    skills: [
      "swordfighting",
      "archery",
      "polearms",
      "unarmed",
      "shieldwork",
      "tactics",
      "intimidation",
      "divine_magic",
    ],
  },
  exploration: {
    name: "Exploration",
    description: "Skills for navigating and surviving in the wilderness",
    color: "#44ff44",
    skills: [
      "navigation",
      "tracking",
      "cartography",
      "survival",
      "climbing",
      "swimming",
      "scouting",
      "stealth",
    ],
  },
  crafting: {
    name: "Crafting",
    description: "Skills for creating items and equipment",
    color: "#4444ff",
    skills: [
      "blacksmithing",
      "alchemy",
      "leatherworking",
      "tailoring",
      "cooking",
      "jewelcrafting",
      "enchanting",
      "herbalism",
      "carpentry",
      "scribing",
    ],
  },
  social: {
    name: "Social",
    description: "Skills for interacting with people and society",
    color: "#ffff44",
    skills: [
      "diplomacy",
      "bartering",
      "persuasion",
      "animal_handling",
      "lockpicking",
      "trap_disarming",
      "lore_knowledge",
      "investigation",
      "insight",
      "performance",
      "deception",
      "sleight_of_hand",
    ],
  },
  magic: {
    name: "Magic",
    description: "Skills for channeling magical energies",
    color: "#ff44ff",
    skills: ["fire_magic", "ice_magic", "earth_magic", "death_magic"],
  },
  specialized: {
    name: "Specialized",
    description: "Unique skills that don't fit other categories",
    color: "#44ffff",
    skills: ["meditation", "healing", "acrobatics", "nature_magic"],
  },
  professional: {
    name: "Professional",
    description: "Trade and professional skills",
    color: "#ff8844",
    skills: ["mining", "stonework"],
  },
};

// Skill difficulty levels
export const skillDifficulty = {
  easy: {
    name: "Easy",
    description: "Skills that are easy to learn and improve",
    experienceMultiplier: 0.8,
    color: "#00ff00",
  },
  medium: {
    name: "Medium",
    description: "Skills with moderate difficulty and learning curve",
    experienceMultiplier: 1.0,
    color: "#ffff00",
  },
  hard: {
    name: "Hard",
    description: "Skills that are difficult to master and require dedication",
    experienceMultiplier: 1.2,
    color: "#ff8800",
  },
};

// Helper functions
export function getSkillDatabase() {
  return skillDatabase;
}

export function getSkillByName(skillName) {
  return skillDatabase[skillName] || null;
}

export function getSkillsByCategory(category) {
  return Object.values(skillDatabase).filter(
    (skill) => skill.category === category
  );
}

export function getAllSkillCategories() {
  return skillCategories;
}

export function getSkillCategory(categoryName) {
  return skillCategories[categoryName] || null;
}

export function getSkillDifficulty(difficulty) {
  return skillDifficulty[difficulty] || skillDifficulty.medium;
}

// Skill leveling and progression functions
export function calculateSkillExperienceRequired(currentLevel, targetLevel) {
  if (currentLevel >= targetLevel) return 0;

  let totalExperience = 0;
  for (let level = currentLevel; level < targetLevel; level++) {
    // Exponential curve: each level requires more experience
    const baseExperience = Math.pow(level + 1, 1.5) * 10;
    totalExperience += baseExperience;
  }

  return Math.floor(totalExperience);
}

export function calculateSkillBonus(skillLevel, skillName) {
  const skill = getSkillByName(skillName);
  if (!skill) return 0;

  // Linear bonus calculation (can be modified for different curves)
  return Math.floor(skillLevel * 0.1); // Each skill level adds 0.1 to bonus
}

export function getSkillSynergies(skillName) {
  const skill = getSkillByName(skillName);
  return skill ? skill.synergies : [];
}

export function calculateSynergyBonus(skillLevel, synergySkills) {
  let synergyBonus = 0;

  synergySkills.forEach((synergySkill) => {
    const synergyLevel = synergySkill.level || 0;
    // Synergy bonus is 10% of the synergy skill level
    synergyBonus += synergyLevel * 0.1;
  });

  return Math.floor(synergyBonus);
}

export function canLearnSkill(skillName, characterSkills) {
  const skill = getSkillByName(skillName);
  if (!skill) return false;

  // Check prerequisites
  for (const prerequisite of skill.prerequisites) {
    const prereqLevel = characterSkills[prerequisite] || 0;
    if (prereqLevel < prerequisite.requiredLevel) {
      return false;
    }
  }

  return true;
}

export function getSkillExperienceMultiplier(skillName) {
  const skill = getSkillByName(skillName);
  if (!skill) return 1.0;

  return skill.experienceMultiplier;
}

export function formatSkillLevel(skillLevel) {
  return skillLevel.toFixed(2);
}

export function getSkillProgressPercentage(skillLevel) {
  return Math.min((skillLevel / 99.99) * 100, 100);
}

// Skill-to-bonus mapping for game systems
export function getNavigationBonus(characterSkills) {
  const navigation = characterSkills.navigation || 0;
  const cartography = characterSkills.cartography || 0;
  const scouting = characterSkills.scouting || 0;

  return (
    calculateSkillBonus(navigation) +
    calculateSkillBonus(cartography) +
    calculateSkillBonus(scouting)
  );
}

export function getDiscoveryBonus(characterSkills) {
  const investigation = characterSkills.investigation || 0;
  const loreKnowledge = characterSkills.lore_knowledge || 0;
  const arcana = characterSkills.arcana || 0; // Assuming this exists

  return Math.max(
    calculateSkillBonus(investigation),
    calculateSkillBonus(loreKnowledge),
    calculateSkillBonus(arcana)
  );
}

export function getCombatBonus(characterSkills) {
  const swordfighting = characterSkills.swordfighting || 0;
  const archery = characterSkills.archery || 0;
  const polearms = characterSkills.polearms || 0;
  const unarmed = characterSkills.unarmed || 0;
  const shieldwork = characterSkills.shieldwork || 0;

  return (
    calculateSkillBonus(swordfighting) +
    calculateSkillBonus(archery) +
    calculateSkillBonus(polearms) +
    calculateSkillBonus(unarmed) +
    calculateSkillBonus(shieldwork)
  );
}

export function getFoodBonus(characterSkills) {
  const cooking = characterSkills.cooking || 0;
  const survival = characterSkills.survival || 0;
  const herbalism = characterSkills.herbalism || 0;

  return (
    calculateSkillBonus(cooking) +
    calculateSkillBonus(survival) +
    calculateSkillBonus(herbalism)
  );
}

export function getResourceBonus(characterSkills) {
  const blacksmithing = characterSkills.blacksmithing || 0;
  const carpentry = characterSkills.carpentry || 0;
  const leatherworking = characterSkills.leatherworking || 0;
  const tailoring = characterSkills.tailoring || 0;

  return (
    calculateSkillBonus(blacksmithing) +
    calculateSkillBonus(carpentry) +
    calculateSkillBonus(leatherworking) +
    calculateSkillBonus(tailoring)
  );
}

export function getPlantBonus(characterSkills) {
  const herbalism = characterSkills.herbalism || 0;
  const survival = characterSkills.survival || 0;

  return calculateSkillBonus(herbalism) + calculateSkillBonus(survival);
}

export function getInteractBonus(characterSkills) {
  const diplomacy = characterSkills.diplomacy || 0;
  const persuasion = characterSkills.persuasion || 0;
  const bartering = characterSkills.bartering || 0;
  const intimidation = characterSkills.intimidation || 0;

  return (
    calculateSkillBonus(diplomacy) +
    calculateSkillBonus(persuasion) +
    calculateSkillBonus(bartering) +
    calculateSkillBonus(intimidation)
  );
}

export function getHealthBonus(characterSkills) {
  const healing = characterSkills.healing || 0;
  const herbalism = characterSkills.herbalism || 0;

  return calculateSkillBonus(healing) + calculateSkillBonus(herbalism);
}

export function getViewBonus(characterSkills) {
  const scouting = characterSkills.scouting || 0;
  const tracking = characterSkills.tracking || 0;

  return Math.max(calculateSkillBonus(scouting), calculateSkillBonus(tracking));
}
