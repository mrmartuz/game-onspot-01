// Race system for character generation with gender bonuses
export const raceDatabase = {
  // PLAYER/NPC AVAILABLE RACES
  Dwarf: {
    name: "Dwarf",
    region: "Gromthar",
    rarity: "common",
    description: "Strong and sturdy, dwarves excel in all areas",
    statBonuses: { STR: 1, DEX: 0, CON: 1, INT: 0, WIS: 0, CHA: 0, LUCK: 0 },
    skillBonuses: {},
    genderBonuses: {
      male: { STR: 1, DEX: 1, WIS: -1 },
      female: { DEX: 1, CHA: 1 },
    },
  },
  Human: {
    name: "Human",
    region: "Aurenith",
    rarity: "common",
    description: "Versatile and adaptable, humans excel in all areas",
    statBonuses: { STR: 0, DEX: 0, CON: 0, INT: 0, WIS: 0, CHA: 0, LUCK: 1 },
    skillBonuses: {},
    genderBonuses: {
      male: { STR: 1, DEX: 1, WIS: -1 },
      female: { DEX: 1, CHA: 1 },
    },
  },
  Elf: {
    name: "Elf",
    region: "Lyssarion",
    rarity: "common",
    description: "Graceful and wise, elves have enhanced dexterity and wisdom",
    statBonuses: { STR: -1, DEX: 2, CON: -1, INT: 1, WIS: 2, CHA: 1, LUCK: 0 },
    skillBonuses: { archery: 1, meditation: 1, nature_magic: 1 },
    genderBonuses: {
      male: { DEX: 1, INT: 1, CON: -1 },
      female: { WIS: 1, CHA: 1, STR: -1 },
    },
  },
  Fishman: {
    name: "Fishman",
    region: "Thaloryn",
    rarity: "uncommon",
    description: "Aquatic beings with enhanced swimming and water magic",
    statBonuses: { STR: 0, DEX: 1, CON: 1, INT: 0, WIS: 1, CHA: 0, LUCK: 0 },
    skillBonuses: { swimming: 2, nature_magic: 1, survival: 1 },
    genderBonuses: {
      male: { CON: 1, DEX: 1, INT: -1 },
      female: { DEX: 1, WIS: 1, STR: -1 },
    },
  },
  Birdman: {
    name: "Birdman",
    region: "Sylvarith",
    rarity: "uncommon",
    description: "Avian beings with enhanced dexterity and flight abilities",
    statBonuses: { STR: -1, DEX: 3, CON: 0, INT: 0, WIS: 1, CHA: 0, LUCK: 1 },
    skillBonuses: { acrobatics: 2, scouting: 1, archery: 1 },
    genderBonuses: {
      male: { DEX: 1, LUCK: 1, CON: -1 },
      female: { DEX: 1, WIS: 1, STR: -1 },
    },
  },
  Goblin: {
    name: "Goblin",
    region: "Skrixel",
    rarity: "common",
    description: "Small but cunning, goblins are agile and lucky",
    statBonuses: { STR: -2, DEX: 2, CON: -1, INT: 1, WIS: 0, CHA: 0, LUCK: 2 },
    skillBonuses: { stealth: 1, lockpicking: 1, bartering: 1 },
    genderBonuses: {
      male: { DEX: 1, LUCK: 1, CON: -1 },
      female: { DEX: 1, INT: 1, STR: -1 },
    },
  },
  Orc: {
    name: "Orc",
    region: "Vrakgul",
    rarity: "common",
    description: "Powerful warriors with great strength and constitution",
    statBonuses: { STR: 3, DEX: 0, CON: 2, INT: -2, WIS: -1, CHA: -1, LUCK: 0 },
    skillBonuses: { intimidation: 2, unarmed: 1, survival: 1 },
    genderBonuses: {
      male: { STR: 1, CON: 1, INT: -1 },
      female: { STR: 1, WIS: 1, CHA: -1 },
    },
  },
  Angel: {
    name: "Angel",
    region: "Celvayne",
    rarity: "legendary",
    description:
      "Angelic figures directly chosen by the gods to serve as their champions on earth to defend life.",
    statBonuses: {
      STR: 10,
      DEX: 10,
      CON: 10,
      INT: 10,
      WIS: 10,
      CHA: 10,
      LUCK: 10,
    },
    skillBonuses: { divine_magic: 13, healing: 13, persuasion: 13 },
    genderBonuses: {
      male: { STR: 12, DEX: 16, CON: 14, WIS: 14, INT: 14, CHA: 16, LUCK: 16 },
      female: {
        STR: 12,
        DEX: 16,
        CON: 14,
        WIS: 14,
        INT: 14,
        CHA: 16,
        LUCK: 16,
      },
    },
  },
  Demon: {
    name: "Demon",
    region: "Zarthorym",
    rarity: "legendary",
    description:
      "Dark beings directly chosen by the gods to serve as their champions on earth to sway the balance of power.",
    statBonuses: {
      STR: 10,
      DEX: 10,
      CON: 10,
      INT: 10,
      WIS: 10,
      CHA: 10,
      LUCK: 10,
    },
    skillBonuses: { fire_magic: 13, intimidation: 13, death_magic: 13 },
    genderBonuses: {
      male: { STR: 13, DEX: 13, CON: 13, WIS: 13, INT: 13, CHA: 13, LUCK: 13 },
      female: {
        STR: 13,
        DEX: 13,
        CON: 13,
        WIS: 13,
        INT: 13,
        CHA: 13,
        LUCK: 13,
      },
    },
  },
  // CREATURE RACES FOR MONSTERS AND BEASTS (NOT AVAILABLE TO PLAYERS/NPCS)
  Troll: {
    name: "Troll",
    region: "Gromthar",
    rarity: "creature",
    description:
      "Massive, brutish creatures with incredible strength and regeneration",
    statBonuses: {
      STR: 4,
      DEX: -2,
      CON: 4,
      INT: -3,
      WIS: -2,
      CHA: -3,
      LUCK: 0,
    },
    skillBonuses: { intimidation: 3, unarmed: 2, survival: 1, tactics: 1 },
    genderBonuses: {
      male: { STR: 2, CON: 2, INT: -1 },
      female: { CON: 2, WIS: 1, STR: 1 },
    },
  },
  Dragon: {
    name: "Dragon",
    region: "Vyrascor",
    rarity: "creature",
    description:
      "Ancient, intelligent creatures with immense power and magical abilities",
    statBonuses: { STR: 6, DEX: 2, CON: 6, INT: 4, WIS: 4, CHA: 4, LUCK: 2 },
    skillBonuses: {
      fire_magic: 5,
      intimidation: 4,
      tactics: 3,
      survival: 2,
      lore_knowledge: 3,
    },
    genderBonuses: {
      male: { STR: 2, CON: 2, INT: 1 },
      female: { INT: 2, WIS: 2, CHA: 1 },
    },
  },
  Wolf: {
    name: "Wolf",
    region: "Wilderness",
    rarity: "creature",
    description: "Pack hunters with keen senses and coordinated tactics",
    statBonuses: { STR: 0, DEX: 2, CON: 1, INT: -1, WIS: 2, CHA: 0, LUCK: 1 },
    skillBonuses: { tracking: 2, scouting: 1, survival: 1, intimidation: 1 },
    genderBonuses: {
      male: { STR: 1, DEX: 1, CON: -1 },
      female: { DEX: 1, WIS: 1, STR: -1 },
    },
  },
  Bear: {
    name: "Bear",
    region: "Wilderness",
    rarity: "creature",
    description: "Massive predators with incredible strength and endurance",
    statBonuses: { STR: 3, DEX: -1, CON: 3, INT: -2, WIS: 1, CHA: -1, LUCK: 0 },
    skillBonuses: { intimidation: 3, survival: 2, unarmed: 2, tracking: 1 },
    genderBonuses: {
      male: { STR: 2, CON: 1, INT: -1 },
      female: { CON: 2, WIS: 1, STR: 1 },
    },
  },
  MountainLion: {
    name: "Mountain Lion",
    region: "Wilderness",
    rarity: "creature",
    description: "Stealthy predators with incredible agility and precision",
    statBonuses: { STR: 1, DEX: 3, CON: 1, INT: 0, WIS: 2, CHA: 0, LUCK: 1 },
    skillBonuses: { stealth: 3, scouting: 2, unarmed: 2, survival: 1 },
    genderBonuses: {
      male: { DEX: 1, STR: 1, CON: -1 },
      female: { DEX: 1, WIS: 1, STR: -1 },
    },
  },
};

// Helper functions to filter creature races from player/NPC generation
export function getPlayerAvailableRaces() {
  return Object.values(raceDatabase).filter(
    (race) => race.rarity !== "creature"
  );
}

export function getPlayerAvailableRacesByRarity(rarity) {
  return Object.values(raceDatabase).filter(
    (race) => race.rarity === rarity && race.rarity !== "creature"
  );
}

export function isCreatureRace(raceName) {
  const raceData = raceDatabase[raceName];
  return raceData ? raceData.rarity === "creature" : false;
}
