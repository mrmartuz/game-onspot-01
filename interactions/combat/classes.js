// Character class database for enhanced combat system
// Each class has stat bonuses per level, starting skills, equipment preferences, and lore

export const classDatabase = {
  // COMMON CLASSES (Easy to find, basic stat bonuses)
  fighter: {
    name: "Fighter",
    rarity: "common",
    description:
      "A skilled warrior trained in the art of combat. Fighters are versatile combatants who excel in melee combat and can adapt to various fighting styles.",
    lore: "Fighters are the backbone of any adventuring party. Trained in military academies or through hard-won experience, they bring discipline and determination to every battle.",
    statBonuses: {
      STR: 1, // +1 Strength per level
      CON: 1, // +1 Constitution per level
      DEX: 1, // +1 Dexterity per level
      INT: 0, // No Intelligence bonus
      WIS: 0, // No Wisdom bonus
      CHA: 0, // No Charisma bonus
      LUCK: 0, // No Luck bonus
    },
    startingSkills: {
      swordfighting: 2.0,
      shieldwork: 1.5,
      intimidation: 1.0,
      tactics: 1.0,
    },
    equipmentPreferences: {
      clothes: ["commoner-clothes", "work-clothes"],
      armor: ["chainmail-armor", "plate-armor"],
      weapon: ["sword", "axe", "mace"],
      shield: ["shield", "buckler"],
      back: ["greatsword", "spear", "backpack"],
      tool: ["rope", "general-tools"],
    },
  },

  archer: {
    name: "Archer",
    rarity: "common",
    description:
      "A master of ranged combat who strikes from a distance. Archers are patient, precise, and deadly accurate with their chosen weapon.",
    lore: "Archers spend years perfecting their aim and understanding of trajectory. They are often former hunters or military scouts who have honed their skills in the wilderness.",
    statBonuses: {
      STR: 0,
      CON: 0,
      DEX: 2, // +2 Dexterity per level (primary stat)
      INT: 0,
      WIS: 1, // +1 Wisdom per level (for aim and perception)
      CHA: 0,
      LUCK: 0,
    },
    startingSkills: {
      archery: 2.0,
      tracking: 1.5,
      scouting: 1.0,
      survival: 1.0,
    },
    equipmentPreferences: {
      clothes: ["traveler-clothes", "work-clothes"],
      armor: ["leather-armor", "studded-armor"],
      weapon: ["shortsword", "dagger"],
      back: ["longbow", "shortbow", "backpack"],
      tool: ["quiver", "arrows"],
    },
  },

  brute: {
    name: "Brute",
    rarity: "common",
    description:
      "A massive warrior who relies on raw strength and intimidation. Brutes are terrifying in combat but lack finesse and tactical thinking.",
    lore: "Brutes are often former criminals, gladiators, or barbarian warriors who have embraced their savage nature. They strike fear into the hearts of their enemies.",
    statBonuses: {
      STR: 2, // +2 Strength per level (primary stat)
      CON: 1, // +1 Constitution per level
      DEX: 0,
      INT: 0,
      WIS: 0,
      CHA: 0,
      LUCK: 0,
    },
    startingSkills: {
      intimidation: 2.0,
      unarmed: 1.5,
      polearms: 1.0,
      survival: 1.0,
    },
    equipmentPreferences: {
      armor: ["leather", "chainmail"],
      weapon: ["greatsword", "greataxe", "club"],
      tool: ["rope", "grappling"],
    },
  },

  monk: {
    name: "Monk",
    rarity: "uncommon",
    description:
      "A disciplined warrior who combines martial arts with spiritual training. Monks are agile, wise, and capable of incredible feats of physical prowess.",
    lore: "Monks dedicate their lives to perfecting both body and spirit. They follow ancient traditions that teach them to harness inner energy for combat and enlightenment.",
    statBonuses: {
      STR: 0,
      CON: 0,
      DEX: 1, // +1 Dexterity per level
      INT: 0,
      WIS: 2, // +2 Wisdom per level (primary stat)
      CHA: 0,
      LUCK: 0,
    },
    startingSkills: {
      unarmed: 2.0,
      meditation: 1.5,
      acrobatics: 1.0,
      healing: 1.0,
    },
    equipmentPreferences: {
      armor: ["robes", "simple"],
      weapon: ["quarterstaff", "nunchaku", "sai"],
      tool: ["prayer_beads", "incense"],
    },
  },

  cleric: {
    name: "Cleric",
    rarity: "uncommon",
    description:
      "A holy warrior who serves the divine. Clerics combine martial prowess with divine magic, healing allies and smiting enemies.",
    lore: "Clerics are chosen by the gods to serve as their representatives on earth. They undergo rigorous training in both combat and divine magic to fulfill their sacred duties.",
    statBonuses: {
      STR: 0,
      CON: 1, // +1 Constitution per level
      DEX: 0,
      INT: 0,
      WIS: 2, // +2 Wisdom per level (primary stat)
      CHA: 0,
      LUCK: 0,
    },
    startingSkills: {
      healing: 2.0,
      divine_magic: 1.5,
      lore_knowledge: 1.0,
      persuasion: 1.0,
    },
    equipmentPreferences: {
      armor: ["chainmail", "plate"],
      weapon: ["mace", "warhammer", "flail"],
      tool: ["holy_symbol", "prayer_book"],
    },
  },

  geomancer: {
    name: "Geomancer",
    rarity: "rare",
    description:
      "A master of earth magic who commands the power of stone, metal, and the very ground beneath their feet. Geomancers are patient and methodical.",
    lore: "Geomancers study the ancient arts of earth manipulation, learning to commune with the spirits of stone and metal. They are often found in mountain monasteries or deep caves.",
    statBonuses: {
      STR: 0,
      CON: 1, // +1 Constitution per level
      DEX: 0,
      INT: 2, // +2 Intelligence per level (primary stat)
      WIS: 0,
      CHA: 0,
      LUCK: 0,
    },
    startingSkills: {
      earth_magic: 2.0,
      mining: 1.5,
      stonework: 1.0,
      meditation: 1.0,
    },
    equipmentPreferences: {
      armor: ["stone", "metal"],
      weapon: ["staff", "hammer"],
      tool: ["crystals", "mining_pick"],
    },
  },

  pyromancer: {
    name: "Pyromancer",
    rarity: "rare",
    description:
      "A master of fire magic who wields the destructive power of flames. Pyromancers are passionate, unpredictable, and devastating in combat.",
    lore: "Pyromancers are drawn to the raw power of fire, often learning their craft through dangerous experimentation. They are feared for their destructive potential and fiery temperaments.",
    statBonuses: {
      STR: 0,
      CON: 0,
      DEX: 0,
      INT: 2, // +2 Intelligence per level (primary stat)
      WIS: 0,
      CHA: 1, // +1 Charisma per level (for commanding presence)
      LUCK: 0,
    },
    startingSkills: {
      fire_magic: 2.0,
      alchemy: 1.5,
      intimidation: 1.0,
      survival: 1.0,
    },
    equipmentPreferences: {
      armor: ["robes", "fire_resistant"],
      weapon: ["staff", "wand"],
      tool: ["phoenix_feathers", "fire_crystals"],
    },
  },

  necromancer: {
    name: "Necromancer",
    rarity: "rare",
    description:
      "A master of death magic who commands the power of the undead and the forces of decay. Necromancers are dark, mysterious, and feared by all.",
    lore: "Necromancers walk a dangerous path, studying the forbidden arts of death and undeath. They are often shunned by society but possess knowledge that others dare not seek.",
    statBonuses: {
      STR: 0,
      CON: 0,
      DEX: 0,
      INT: 2, // +2 Intelligence per level (primary stat)
      WIS: 1, // +1 Wisdom per level (for understanding death)
      CHA: 0,
      LUCK: 0,
    },
    startingSkills: {
      death_magic: 2.0,
      lore_knowledge: 1.5,
      investigation: 1.0,
      intimidation: 1.0,
    },
    equipmentPreferences: {
      armor: ["robes", "bone"],
      weapon: ["staff", "scythe"],
      tool: ["skull", "bone_chalk"],
    },
  },

  articaster: {
    name: "Articaster",
    rarity: "rare",
    description:
      "A master of ice magic who commands the power of cold and frost. Articasters are calm, calculating, and deadly precise in their magical attacks.",
    lore: "Articasters study the ancient arts of ice manipulation, learning to harness the power of winter itself. They are often found in frozen wastelands or high mountain peaks.",
    statBonuses: {
      STR: 0,
      CON: 0,
      DEX: 0,
      INT: 2, // +2 Intelligence per level (primary stat)
      WIS: 1, // +1 Wisdom per level (for patience and focus)
      CHA: 0,
      LUCK: 0,
    },
    startingSkills: {
      ice_magic: 2.0,
      meditation: 1.5,
      survival: 1.0,
      investigation: 1.0,
    },
    equipmentPreferences: {
      armor: ["robes", "ice_resistant"],
      weapon: ["staff", "ice_blade"],
      tool: ["ice_crystals", "frost_gem"],
    },
  },

  martial_artist: {
    name: "Martial Artist",
    rarity: "uncommon",
    description:
      "A master of unarmed combat who has perfected their body as a weapon. Martial artists are disciplined, agile, and capable of incredible feats.",
    lore: "Martial artists dedicate their lives to perfecting the art of combat without weapons. They follow ancient traditions that teach them to harness their inner strength.",
    statBonuses: {
      STR: 1, // +1 Strength per level
      CON: 0,
      DEX: 2, // +2 Dexterity per level (primary stat)
      INT: 0,
      WIS: 0,
      CHA: 0,
      LUCK: 0,
    },
    startingSkills: {
      unarmed: 2.0,
      acrobatics: 1.5,
      meditation: 1.0,
      intimidation: 1.0,
    },
    equipmentPreferences: {
      armor: ["simple", "robes"],
      weapon: ["fists", "nunchaku"],
      tool: ["training_weights", "meditation_mat"],
    },
  },

  ranger: {
    name: "Ranger",
    rarity: "common",
    description:
      "A skilled tracker and wilderness warrior who combines combat prowess with nature magic. Rangers are independent, resourceful, and at home in the wild.",
    lore: "Rangers are the guardians of the wilderness, trained to survive in the harshest environments and protect nature from those who would harm it.",
    statBonuses: {
      STR: 1, // +1 Strength per level
      CON: 0,
      DEX: 1, // +1 Dexterity per level
      INT: 0,
      WIS: 1, // +1 Wisdom per level
      CHA: 0,
      LUCK: 0,
    },
    startingSkills: {
      tracking: 2.0,
      archery: 1.5,
      survival: 1.0,
      animal_handling: 1.0,
    },
    equipmentPreferences: {
      armor: ["leather", "studded"],
      weapon: ["bow", "sword", "spear"],
      tool: ["tracking_kit", "survival_gear"],
    },
  },

  explorer: {
    name: "Explorer",
    rarity: "common",
    description:
      "A curious adventurer who seeks to discover new lands and uncover ancient secrets. Explorers are brave, resourceful, and always ready for adventure.",
    lore: "Explorers are driven by an insatiable curiosity about the world. They are often former scholars, merchants, or adventurers who have dedicated their lives to discovery.",
    statBonuses: {
      STR: 0,
      CON: 0,
      DEX: 1, // +1 Dexterity per level
      INT: 1, // +1 Intelligence per level
      WIS: 1, // +1 Wisdom per level
      CHA: 0,
      LUCK: 0,
    },
    startingSkills: {
      navigation: 2.0,
      investigation: 1.5,
      survival: 1.0,
      lore_knowledge: 1.0,
    },
    equipmentPreferences: {
      armor: ["leather", "studded"],
      weapon: ["sword", "crossbow"],
      tool: ["map", "compass", "journal"],
    },
  },

  paladin: {
    name: "Paladin",
    rarity: "rare",
    description:
      "A holy warrior who combines divine magic with martial prowess. Paladins are noble, courageous, and dedicated to fighting evil wherever it may be found.",
    lore: "Paladins are chosen by the gods to serve as their champions on earth. They undergo rigorous training in both combat and divine magic to fulfill their sacred mission.",
    statBonuses: {
      STR: 1, // +1 Strength per level
      CON: 1, // +1 Constitution per level
      DEX: 0,
      INT: 0,
      WIS: 1, // +1 Wisdom per level
      CHA: 1, // +1 Charisma per level
      LUCK: 0,
    },
    startingSkills: {
      divine_magic: 2.0,
      swordfighting: 1.5,
      healing: 1.0,
      persuasion: 1.0,
    },
    equipmentPreferences: {
      armor: ["plate", "chainmail"],
      weapon: ["longsword", "warhammer"],
      tool: ["holy_symbol", "blessed_water"],
    },
  },

  alchemist: {
    name: "Alchemist",
    rarity: "uncommon",
    description:
      "A master of chemical magic who creates potions, elixirs, and magical compounds. Alchemists are intelligent, methodical, and always experimenting.",
    lore: "Alchemists study the fundamental properties of matter and magic, seeking to understand the secrets of transformation and creation through scientific methods.",
    statBonuses: {
      STR: 0,
      CON: 0,
      DEX: 0,
      INT: 2, // +2 Intelligence per level (primary stat)
      WIS: 1, // +1 Wisdom per level (for patience and observation)
      CHA: 0,
      LUCK: 0,
    },
    startingSkills: {
      alchemy: 2.0,
      investigation: 1.5,
      lore_knowledge: 1.0,
      healing: 1.0,
    },
    equipmentPreferences: {
      armor: ["robes", "leather"],
      weapon: ["staff", "crossbow"],
      tool: ["alchemy_kit", "potion_belt"],
    },
  },

  herbalist: {
    name: "Herbalist",
    rarity: "common",
    description:
      "A master of plant magic and natural healing who uses herbs and nature's gifts to aid allies and harm enemies. Herbalists are wise, patient, and in tune with nature.",
    lore: "Herbalists study the healing and magical properties of plants, learning to harness nature's power for both good and ill. They are often found in gardens, forests, or apothecary shops.",
    statBonuses: {
      STR: 0,
      CON: 0,
      DEX: 0,
      INT: 1, // +1 Intelligence per level
      WIS: 2, // +2 Wisdom per level (primary stat)
      CHA: 0,
      LUCK: 0,
    },
    startingSkills: {
      herbalism: 2.0,
      healing: 1.5,
      survival: 1.0,
      nature_magic: 1.0,
    },
    equipmentPreferences: {
      armor: ["leather", "robes"],
      weapon: ["staff", "sling"],
      tool: ["herb_pouch", "gardening_tools"],
    },
  },

  hunter: {
    name: "Hunter",
    rarity: "common",
    description:
      "A skilled tracker and marksman who specializes in hunting both beasts and men. Hunters are patient, observant, and deadly accurate with their weapons.",
    lore: "Hunters are masters of the wilderness, trained to track, trap, and kill their prey with precision and efficiency. They are often former scouts, trappers, or wilderness guides.",
    statBonuses: {
      STR: 0,
      CON: 0,
      DEX: 2, // +2 Dexterity per level (primary stat)
      INT: 0,
      WIS: 1, // +1 Wisdom per level (for perception and patience)
      CHA: 0,
      LUCK: 0,
    },
    startingSkills: {
      tracking: 2.0,
      archery: 1.5,
      survival: 1.0,
      animal_handling: 1.0,
    },
    equipmentPreferences: {
      armor: ["leather", "studded"],
      weapon: ["bow", "crossbow", "spear"],
      tool: ["tracking_kit", "traps"],
    },
  },

  dungeondiver: {
    name: "Dungeondiver",
    rarity: "uncommon",
    description:
      "A specialized adventurer who explores dangerous dungeons and ancient ruins. Dungeondivers are brave, resourceful, and skilled at surviving in hostile environments.",
    lore: "Dungeondivers are professional adventurers who specialize in exploring the most dangerous places in the world. They are often former soldiers, thieves, or scholars who have turned to adventure.",
    statBonuses: {
      STR: 1, // +1 Strength per level
      CON: 1, // +1 Constitution per level
      DEX: 1, // +1 Dexterity per level
      INT: 0,
      WIS: 0,
      CHA: 0,
      LUCK: 0,
    },
    startingSkills: {
      lockpicking: 2.0,
      trap_disarming: 1.5,
      investigation: 1.0,
      survival: 1.0,
    },
    equipmentPreferences: {
      armor: ["leather", "studded"],
      weapon: ["sword", "crossbow"],
      tool: ["lockpicks", "rope", "torch"],
    },
  },

  craftsman: {
    name: "Craftsman",
    rarity: "common",
    description:
      "A skilled artisan who creates weapons, armor, and tools. Craftsmen are patient, methodical, and take pride in their work.",
    lore: "Craftsmen are masters of their trade, spending years perfecting their skills in metalworking, woodworking, or other crafts. They are often former apprentices who have struck out on their own.",
    statBonuses: {
      STR: 1, // +1 Strength per level
      CON: 0,
      DEX: 1, // +1 Dexterity per level
      INT: 1, // +1 Intelligence per level
      WIS: 0,
      CHA: 0,
      LUCK: 0,
    },
    startingSkills: {
      blacksmithing: 2.0,
      carpentry: 1.5,
      leatherworking: 1.0,
      bartering: 1.0,
    },
    equipmentPreferences: {
      armor: ["leather", "chainmail"],
      weapon: ["hammer", "sword"],
      tool: ["smithing_tools", "workshop_kit"],
    },
  },
};

// Class rarity system
export const classRarity = {
  common: {
    color: "#888888",
    description: "Common classes are easy to find and recruit",
    spawnWeight: 40,
  },
  uncommon: {
    color: "#00ff00",
    description: "Uncommon classes require more effort to find",
    spawnWeight: 25,
  },
  rare: {
    color: "#0080ff",
    description: "Rare classes are difficult to find and recruit",
    spawnWeight: 10,
  },
  legendary: {
    color: "#ff8000",
    description: "Legendary classes are extremely rare and powerful",
    spawnWeight: 3,
  },
  mythic: {
    color: "#ff0080",
    description: "Mythic classes are legendary figures of immense power",
    spawnWeight: 1,
  },
};

// Helper functions
export function getClassDatabase() {
  return classDatabase;
}

export function getClassByName(className) {
  return classDatabase[className] || null;
}

export function getClassRarity(rarity) {
  return classRarity[rarity] || classRarity.common;
}

export function getRandomClassByRarity(rarity) {
  const classesOfRarity = Object.values(classDatabase).filter(
    (cls) => cls.rarity === rarity
  );
  if (classesOfRarity.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * classesOfRarity.length);
  return classesOfRarity[randomIndex];
}

export function getAllClassesByRarity(rarity) {
  return Object.values(classDatabase).filter((cls) => cls.rarity === rarity);
}

export function calculateClassStats(baseStats, className, classLevel) {
  const classData = getClassByName(className);
  if (!classData) return baseStats;

  const statBonuses = classData.statBonuses;
  const calculatedStats = { ...baseStats };

  // Apply stat bonuses for each level
  for (let level = 1; level <= classLevel; level++) {
    Object.keys(statBonuses).forEach((stat) => {
      calculatedStats[stat] += statBonuses[stat];
    });
  }

  return calculatedStats;
}

export function getClassStartingSkills(className) {
  const classData = getClassByName(className);
  return classData ? classData.startingSkills : {};
}

export function getClassEquipmentPreferences(className) {
  const classData = getClassByName(className);
  return classData ? classData.equipmentPreferences : {};
}
