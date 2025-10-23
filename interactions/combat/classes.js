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
      swords: 2.0,
      hammers: 2.0,
      axes: 2.0,
      shieldwork: 1.5,
      intimidation: 1.0,
      tactics: 1.0,
    },
    equipmentPreferences: {
      clothes: ["commoner-clothes", "work-clothes"],
      armor: ["chainmail-armor", "plate-armor"],
      weapon: ["sword", "axe", "mace"],
      secondHand: ["shield", "buckler"],
      back: ["coin-purse", "belt-pouch", "satchel", "sack"],
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
      bows: 2.0,
      swords: 1.5,
      throwing: 1.0,
      tracking: 1.5,
      scouting: 1.0,
      survival: 1.0,
    },
    equipmentPreferences: {
      clothes: ["traveler-clothes", "work-clothes"],
      armor: ["leather-armor", "studded-armor"],
      weapon: ["shortsword", "dagger", "longbow", "shortbow"],
      back: ["coin-purse", "belt-pouch", "satchel", "sack"],
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
      great_swords: 1.5,
      great_axes: 1.5,
      hammers: 1.0,
      unarmed: 1.5,
      survival: 1.0,
    },
    equipmentPreferences: {
      armor: ["leather", "chainmail"],
      weapon: ["greatsword", "greataxe", "club"],
      back: ["coin-purse", "belt-pouch", "satchel", "sack"],
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
      polearms: 1.5,
      meditation: 1.5,
      acrobatics: 1.0,
      healing: 1.0,
    },
    equipmentPreferences: {
      armor: ["robes", "simple"],
      weapon: ["quarterstaff", "nunchaku", "sai"],
      back: ["coin-purse", "belt-pouch", "satchel", "sack"],
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
      hammers: 1.5,
      divine_magic: 1.5,
      lore_knowledge: 1.0,
      persuasion: 1.0,
    },
    equipmentPreferences: {
      armor: ["chainmail", "plate"],
      weapon: ["mace", "warhammer", "flail"],
      back: ["coin-purse", "belt-pouch", "satchel", "sack"],
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
      polearms: 1.5,
      hammers: 1.0,
      mining: 1.5,
      stonework: 1.0,
      meditation: 1.0,
    },
    equipmentPreferences: {
      armor: ["stone", "metal"],
      weapon: ["staff", "hammer"],
      back: ["coin-purse", "belt-pouch", "satchel", "sack"],
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
      polearms: 1.5,
      alchemy: 1.5,
      intimidation: 1.0,
      survival: 1.0,
    },
    equipmentPreferences: {
      armor: ["robes", "fire_resistant"],
      weapon: ["staff", "wand"],
      back: ["coin-purse", "belt-pouch", "satchel", "sack"],
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
      polearms: 1.5,
      lore_knowledge: 1.5,
      investigation: 1.0,
      intimidation: 1.0,
    },
    equipmentPreferences: {
      armor: ["robes", "bone"],
      weapon: ["staff", "scythe"],
      back: ["coin-purse", "belt-pouch", "satchel", "sack"],
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
      polearms: 1.5,
      swords: 1.0,
      meditation: 1.5,
      survival: 1.0,
      investigation: 1.0,
    },
    equipmentPreferences: {
      armor: ["robes", "ice_resistant"],
      weapon: ["staff", "ice_blade"],
      back: ["coin-purse", "belt-pouch", "satchel", "sack"],
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
      back: ["coin-purse", "belt-pouch", "satchel", "sack"],
      tool: ["training_weights", "meditation_mat"],
    },
  },

  ranger: {
    name: "Ranger",
    rarity: "common",
    description:
      "A skilled tracker and wilderness warrior who combines combat prowess and survival skills. Rangers are independent, resourceful, and at home in the wild.",
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
      bows: 2.0,
      swords: 2.0,
      polearms: 1.0,
      axes: 2.0,
      survival: 1.0,
      animal_handling: 1.0,
    },
    equipmentPreferences: {
      armor: ["leather", "studded"],
      weapon: ["bow", "sword", "spear", "hatchet"],
      back: ["coin-purse", "belt-pouch", "satchel", "sack"],
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
      swords: 1.5,
      crossbows: 1.5,
      axes: 1.0,
      investigation: 1.5,
      survival: 1.0,
      lore_knowledge: 1.0,
    },
    equipmentPreferences: {
      armor: ["leather", "studded"],
      weapon: ["sword", "crossbow", "hatchet"],
      back: ["coin-purse", "belt-pouch", "satchel", "sack"],
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
      swords: 1.5,
      hammers: 1.5,
      healing: 1.0,
      persuasion: 1.0,
    },
    equipmentPreferences: {
      armor: ["plate", "chainmail"],
      weapon: ["longsword", "warhammer"],
      secondHand: ["shield", "buckler"],
      back: ["coin-purse", "belt-pouch", "satchel", "sack"],
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
      polearms: 1.5,
      crossbows: 1.5,
      investigation: 1.5,
      lore_knowledge: 1.0,
      healing: 1.0,
    },
    equipmentPreferences: {
      armor: ["robes", "leather"],
      weapon: ["staff", "crossbow"],
      back: ["coin-purse", "belt-pouch", "satchel", "sack"],
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
      polearms: 1.5,
      throwing: 1.0,
      healing: 1.5,
      survival: 1.0,
      nature_magic: 1.0,
    },
    equipmentPreferences: {
      armor: ["leather", "robes"],
      weapon: ["staff", "sling"],
      back: ["coin-purse", "belt-pouch", "satchel", "sack"],
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
      axes: 2.0,
      tracking: 2.0,
      bows: 1.5,
      crossbows: 1.5,
      polearms: 1.0,
      survival: 1.0,
      animal_handling: 1.0,
    },
    equipmentPreferences: {
      armor: ["leather", "studded"],
      weapon: ["bow", "crossbow", "spear", "hand-axe", "tomahawk"],
      back: ["coin-purse", "belt-pouch", "satchel", "sack"],
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
      swords: 2.0,
      crossbows: 1.5,
      lockpicking: 2.0,
      trap_disarming: 1.5,
      investigation: 1.0,
      survival: 1.0,
    },
    equipmentPreferences: {
      armor: ["leather", "studded"],
      weapon: ["sword", "crossbow"],
      back: ["coin-purse", "belt-pouch", "satchel", "sack"],
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
      hammers: 2.0,
      blacksmithing: 2.0,
      carpentry: 1.5,
      leatherworking: 1.0,
      bartering: 1.0,
    },
    equipmentPreferences: {
      armor: ["leather", "chainmail"],
      weapon: ["hammer"],
      back: ["coin-purse", "belt-pouch", "satchel", "sack"],
      tool: ["smithing_tools", "workshop_kit"],
    },
  },

  // CREATURE CLASSES FOR MONSTERS AND BEASTS (NOT AVAILABLE TO PLAYERS/NPCS)

  // BEAST/MONSTER AGE-BASED CLASSES
  Baby: {
    name: "Baby",
    rarity: "creature",
    description: "A young creature with reduced stats but high potential",
    lore: "Baby creatures are vulnerable but learn quickly, representing the youngest and weakest of their kind.",
    isCreatureClass: true,
    statMultiplier: 0.33, // Stats divided by 3
    statBonuses: {
      STR: 0,
      CON: 0,
      DEX: 0,
      INT: 0,
      WIS: 0,
      CHA: 0,
      LUCK: 0,
    },
    startingSkills: {
      survival: 1.0,
    },
    equipmentPreferences: {
      clothes: ["commoner-clothes"],
    },
  },

  Young: {
    name: "Young",
    rarity: "creature",
    description: "An adolescent creature growing into its power",
    lore: "Young creatures are developing their abilities and represent the adolescent stage of their species.",
    isCreatureClass: true,
    statMultiplier: 0.5, // Stats divided by 2
    statBonuses: {
      STR: 0,
      CON: 0,
      DEX: 0,
      INT: 0,
      WIS: 0,
      CHA: 0,
      LUCK: 0,
    },
    startingSkills: {
      survival: 1.5,
      intimidation: 1.0,
    },
    equipmentPreferences: {
      clothes: ["commoner-clothes"],
    },
  },

  Adult: {
    name: "Adult",
    rarity: "creature",
    description: "A mature creature at the peak of its natural abilities",
    lore: "Adult creatures represent the standard, mature form of their species with full natural capabilities.",
    isCreatureClass: true,
    statMultiplier: 1.0, // Base stats
    statBonuses: {
      STR: 0,
      CON: 0,
      DEX: 0,
      INT: 0,
      WIS: 0,
      CHA: 0,
      LUCK: 0,
    },
    startingSkills: {
      survival: 2.0,
      intimidation: 2.0,
    },
    equipmentPreferences: {
      clothes: ["commoner-clothes"],
    },
  },

  Elder: {
    name: "Old",
    rarity: "creature",
    description: "An elderly creature with wisdom and experience",
    lore: "Old creatures are veterans of their kind, slower but wiser and more experienced.",
    isCreatureClass: true,
    statMultiplier: 2.0, // Stats multiplied by 2
    statBonuses: {
      STR: 0,
      CON: 0,
      DEX: 0,
      INT: 1,
      WIS: 2,
      CHA: 0,
      LUCK: 0,
    },
    startingSkills: {
      survival: 3.0,
      intimidation: 2.5,
      tactics: 2.0,
    },
    equipmentPreferences: {
      clothes: ["commoner-clothes"],
    },
  },

  Alpha: {
    name: "Alpha",
    rarity: "creature",
    description: "A dominant creature that leads its kind",
    lore: "Alpha creatures are the leaders and strongest of their species, commanding respect and fear.",
    isCreatureClass: true,
    statMultiplier: 3.0, // Stats multiplied by 3
    statBonuses: {
      STR: 1,
      CON: 1,
      DEX: 0,
      INT: 1,
      WIS: 1,
      CHA: 2,
      LUCK: 1,
    },
    startingSkills: {
      survival: 4.0,
      intimidation: 4.0,
      tactics: 3.0,
    },
    equipmentPreferences: {
      clothes: ["commoner-clothes"],
    },
  },

  Ancient: {
    name: "Ancient",
    rarity: "creature",
    description: "An ancient creature of legendary power and wisdom",
    lore: "Ancient creatures are legendary beings that have survived for centuries, accumulating immense power and knowledge.",
    isCreatureClass: true,
    statMultiplier: 4.0, // Stats multiplied by 4
    statBonuses: {
      STR: 2,
      CON: 2,
      DEX: 1,
      INT: 3,
      WIS: 3,
      CHA: 3,
      LUCK: 2,
    },
    startingSkills: {
      survival: 5.0,
      intimidation: 5.0,
      tactics: 4.0,
      lore_knowledge: 3.0,
    },
    equipmentPreferences: {
      clothes: ["noble-clothes"],
    },
  },

  // HOSTILE NPC CLASSES (GOBLINS, ORCS)
  scavenger: {
    name: "Scavenger",
    rarity: "creature",
    description: "A weak creature that survives by picking through scraps",
    lore: "Scavengers are the weakest of their kind, surviving through cunning rather than strength.",
    isCreatureClass: true,
    statMultiplier: 0.7, // Stats multiplied by 0.7 (reduced)
    statBonuses: {
      STR: -1,
      CON: -1,
      DEX: 1,
      INT: 1,
      WIS: 0,
      CHA: -1,
      LUCK: 1,
    },
    startingSkills: {
      stealth: 2.0,
      survival: 2.0,
      bartering: 1.5,
    },
    equipmentPreferences: {
      clothes: ["commoner-clothes"],
      weapon: ["dagger"],
    },
  },

  scout: {
    name: "Scout",
    rarity: "creature",
    description: "A fast and agile creature specialized in reconnaissance",
    lore: "Scouts are the eyes and ears of their groups, relying on speed and stealth to gather information.",
    isCreatureClass: true,
    statMultiplier: 0.8, // Stats multiplied by 0.8
    statBonuses: {
      STR: 0,
      CON: 0,
      DEX: 2,
      INT: 1,
      WIS: 1,
      CHA: 0,
      LUCK: 1,
    },
    startingSkills: {
      stealth: 3.0,
      scouting: 3.0,
      survival: 2.0,
    },
    equipmentPreferences: {
      clothes: ["commoner-clothes"],
      weapon: ["dagger", "shortsword"],
      tool: ["rope"],
    },
  },

  warrior: {
    name: "Warrior",
    rarity: "creature",
    description: "A standard combatant trained in basic warfare",
    lore: "Warriors are the backbone of their groups, trained in standard combat techniques.",
    isCreatureClass: true,
    statMultiplier: 1.0, // Base stats
    statBonuses: {
      STR: 1,
      CON: 1,
      DEX: 0,
      INT: 0,
      WIS: 0,
      CHA: 0,
      LUCK: 0,
    },
    startingSkills: {
      swords: 2.0,
      intimidation: 2.0,
      survival: 1.0,
    },
    equipmentPreferences: {
      clothes: ["commoner-clothes"],
      armor: ["leather-armor"],
      weapon: ["sword", "axe", "club"],
      shield: ["shield"],
    },
  },

  raider: {
    name: "Raider",
    rarity: "creature",
    description: "An aggressive combatant specialized in hit-and-run tactics",
    lore: "Raiders are experienced fighters who excel at quick, brutal attacks and intimidation.",
    isCreatureClass: true,
    statMultiplier: 1.2, // Stats multiplied by 1.2
    statBonuses: {
      STR: 2,
      CON: 1,
      DEX: 1,
      INT: 0,
      WIS: 0,
      CHA: 1,
      LUCK: 0,
    },
    startingSkills: {
      swords: 3.0,
      intimidation: 3.0,
      tactics: 2.0,
      survival: 2.0,
    },
    equipmentPreferences: {
      clothes: ["commoner-clothes"],
      armor: ["leather-armor", "chainmail-armor"],
      weapon: ["sword", "axe", "mace"],
      shield: ["shield"],
    },
  },

  chief: {
    name: "Chief",
    rarity: "creature",
    description: "A powerful leader who commands respect and fear",
    lore: "Chiefs are the leaders of their groups, combining combat prowess with leadership abilities.",
    isCreatureClass: true,
    statMultiplier: 1.6, // Stats multiplied by 1.6
    statBonuses: {
      STR: 2,
      CON: 2,
      DEX: 1,
      INT: 1,
      WIS: 1,
      CHA: 3,
      LUCK: 1,
    },
    startingSkills: {
      swords: 4.0,
      intimidation: 4.0,
      tactics: 3.0,
      survival: 2.0,
    },
    equipmentPreferences: {
      clothes: ["commoner-clothes"],
      armor: ["chainmail-armor"],
      weapon: ["sword", "axe", "mace"],
      shield: ["shield"],
    },
  },

  // DEMON CLASSES
  screamer: {
    name: "Screamer",
    rarity: "creature",
    description: "A weak demon that relies on terror rather than strength",
    lore: "Screamers are the weakest demons, using their terrifying appearance and screams to intimidate rather than fight.",
    isCreatureClass: true,
    statMultiplier: 1.0, // Base stats
    statBonuses: {
      STR: 0,
      CON: 0,
      DEX: 0,
      INT: 0,
      WIS: 0,
      CHA: 1,
      LUCK: 0,
    },
    startingSkills: {
      intimidation: 3.0,
      deception: 2.0,
    },
    equipmentPreferences: {
      clothes: ["commoner-clothes"],
    },
  },

  stalker: {
    name: "Stalker",
    rarity: "creature",
    description: "A stealthy demon that hunts from the shadows",
    lore: "Stalkers are demons that prefer to hunt their prey through stealth and deception rather than direct confrontation.",
    isCreatureClass: true,
    statMultiplier: 1.1, // Stats multiplied by 1.1
    statBonuses: {
      STR: 0,
      CON: 0,
      DEX: 2,
      INT: 1,
      WIS: 1,
      CHA: 1,
      LUCK: 1,
    },
    startingSkills: {
      stealth: 3.0,
      intimidation: 2.0,
      deception: 2.0,
    },
    equipmentPreferences: {
      clothes: ["commoner-clothes"],
      weapon: ["dagger"],
    },
  },

  hunter: {
    name: "Hunter",
    rarity: "creature",
    description: "A skilled demon predator that tracks and kills its prey",
    lore: "Hunters are demons that specialize in tracking and killing their targets with precision and skill.",
    isCreatureClass: true,
    statMultiplier: 1.3, // Stats multiplied by 1.3
    statBonuses: {
      STR: 1,
      CON: 1,
      DEX: 2,
      INT: 1,
      WIS: 2,
      CHA: 1,
      LUCK: 1,
    },
    startingSkills: {
      tracking: 3.0,
      intimidation: 3.0,
      tactics: 2.0,
      survival: 2.0,
    },
    equipmentPreferences: {
      clothes: ["commoner-clothes"],
      weapon: ["sword", "dagger"],
    },
  },

  blood_harvester: {
    name: "Blood Harvester",
    rarity: "creature",
    description: "A demon that feeds on the life force of its victims",
    lore: "Blood Harvesters are demons that drain the life force from their victims, growing stronger with each kill.",
    isCreatureClass: true,
    statMultiplier: 2.0, // Stats multiplied by 2.0
    statBonuses: {
      STR: 2,
      CON: 2,
      DEX: 1,
      INT: 2,
      WIS: 1,
      CHA: 2,
      LUCK: 1,
    },
    startingSkills: {
      death_magic: 4.0,
      intimidation: 4.0,
      tactics: 2.0,
    },
    equipmentPreferences: {
      clothes: ["commoner-clothes"],
    },
  },

  reaper: {
    name: "Reaper",
    rarity: "creature",
    description: "A powerful demon that brings death to all it encounters",
    lore: "Reapers are demons of death, wielding dark magic to harvest souls and spread destruction.",
    isCreatureClass: true,
    statMultiplier: 4.0, // Stats multiplied by 4.0
    statBonuses: {
      STR: 3,
      CON: 3,
      DEX: 2,
      INT: 3,
      WIS: 2,
      CHA: 3,
      LUCK: 2,
    },
    startingSkills: {
      death_magic: 5.0,
      intimidation: 5.0,
      tactics: 4.0,
    },
    equipmentPreferences: {
      clothes: ["noble-clothes"],
    },
  },

  general: {
    name: "General",
    rarity: "creature",
    description: "A demon commander that leads armies of lesser demons",
    lore: "Generals are demon commanders that lead legions of lesser demons in battle, combining tactical genius with demonic power.",
    isCreatureClass: true,
    statMultiplier: 3.0, // Stats multiplied by 3.0
    statBonuses: {
      STR: 2,
      CON: 2,
      DEX: 1,
      INT: 3,
      WIS: 3,
      CHA: 4,
      LUCK: 2,
    },
    startingSkills: {
      tactics: 5.0,
      intimidation: 4.0,
      fire_magic: 3.0,
      death_magic: 3.0,
    },
    equipmentPreferences: {
      clothes: ["noble-clothes"],
    },
  },

  lord: {
    name: "Lord",
    rarity: "creature",
    description: "A demon lord of immense power and authority",
    lore: "Demon Lords are among the most powerful demons, commanding vast armies and wielding incredible dark magic.",
    isCreatureClass: true,
    statMultiplier: 5.0, // Stats multiplied by 5.0
    statBonuses: {
      STR: 4,
      CON: 4,
      DEX: 2,
      INT: 4,
      WIS: 3,
      CHA: 5,
      LUCK: 3,
    },
    startingSkills: {
      fire_magic: 6.0,
      death_magic: 6.0,
      intimidation: 6.0,
      tactics: 5.0,
      deception: 4.0,
    },
    equipmentPreferences: {
      clothes: ["noble-clothes"],
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
  creature: {
    color: "#8B4513",
    description: "Creature classes are exclusive to monsters and beasts",
    spawnWeight: 0, // Not available for player/NPC generation
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

// Helper functions to filter creature classes from player/NPC generation
export function getPlayerAvailableClasses() {
  return Object.values(classDatabase).filter(
    (cls) => cls.rarity !== "creature" && !cls.isCreatureClass
  );
}

export function getPlayerAvailableClassesByRarity(rarity) {
  return Object.values(classDatabase).filter(
    (cls) =>
      cls.rarity === rarity && cls.rarity !== "creature" && !cls.isCreatureClass
  );
}

export function isCreatureClass(className) {
  const classData = getClassByName(className);
  return classData
    ? classData.rarity === "creature" || classData.isCreatureClass
    : false;
}
