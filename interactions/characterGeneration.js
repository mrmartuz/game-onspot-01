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
  equipmentRarity,
  equipmentStatus,
} from "./equipment.js";

// Race system for character generation with gender bonuses
export const raceDatabase = {
  // PLAYER/NPC AVAILABLE RACES
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
    skillBonuses: { bows: 1, meditation: 1, nature_magic: 1 },
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
    skillBonuses: { acrobatics: 2, scouting: 1, bows: 1 },
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

// Race-gender specific name databases
export const nameDatabase = {
  Human: {
    male: {
      firstNames: [
        "Marcus",
        "Gareth",
        "Cyrus",
        "Finn",
        "Darius",
        "Orion",
        "Phoenix",
        "River",
        "Blaze",
        "Storm",
        "Alexander",
        "William",
        "James",
        "Michael",
        "David",
        "Robert",
        "John",
        "Richard",
        "Charles",
        "Thomas",
        "Christopher",
        "Daniel",
        "Matthew",
        "Anthony",
        "Mark",
        "Donald",
        "Steven",
        "Paul",
        "Andrew",
        "Joshua",
      ],
      lastNames: [
        "Ironhand",
        "Swiftfoot",
        "Brightblade",
        "Stormcaller",
        "Goldheart",
        "Firebrand",
        "Windrider",
        "Earthshaker",
        "Starweaver",
        "Sunstrider",
        "Shadowbane",
        "Lightbringer",
        "Thornbrook",
        "Oakshield",
        "Silverleaf",
        "Copperforge",
        "Steelheart",
        "Goldmane",
        "Brightwater",
        "Stormwind",
        "Firestone",
        "Ironwood",
        "Silverhand",
        "Goldleaf",
        "Brightstone",
        "Stormheart",
        "Firewind",
        "Ironwater",
        "Silverwood",
        "Goldstone",
        "Brightwind",
        "Stormstone",
        "Firewood",
        "Ironstone",
        "Silverwind",
        "Goldwood",
        "Brightstone",
        "Stormwood",
        "Firestone",
        "Ironwind",
      ],
    },
    female: {
      firstNames: [
        "Elena",
        "Aria",
        "Maya",
        "Zara",
        "Nora",
        "Luna",
        "Iris",
        "Sage",
        "Willow",
        "Dawn",
        "Sarah",
        "Jessica",
        "Ashley",
        "Amanda",
        "Jennifer",
        "Lisa",
        "Michelle",
        "Kimberly",
        "Donna",
        "Carol",
        "Sandra",
        "Ruth",
        "Sharon",
        "Michelle",
        "Laura",
        "Sarah",
        "Kimberly",
        "Deborah",
        "Dorothy",
        "Lisa",
      ],
      lastNames: [
        "Nightwhisper",
        "Moonchild",
        "Starweaver",
        "Dawnbringer",
        "Silvermoon",
        "Goldheart",
        "Brightstar",
        "Stormcaller",
        "Fireheart",
        "Windwhisper",
        "Earthchild",
        "Waterstar",
        "Stonemoon",
        "Ironstar",
        "Steelheart",
        "Copperstar",
        "Silverheart",
        "Goldstar",
        "Brightmoon",
        "Stormstar",
        "Firestar",
        "Windstar",
        "Earthstar",
        "Waterheart",
        "Stonestar",
        "Ironheart",
        "Steelstar",
        "Copperheart",
        "Silverstar",
        "Goldheart",
        "Brightheart",
        "Stormheart",
        "Fireheart",
        "Windheart",
        "Earthheart",
        "Waterheart",
        "Stoneheart",
        "Ironheart",
        "Steelheart",
        "Copperheart",
      ],
    },
  },
  Elf: {
    male: {
      firstNames: [
        "Thorin",
        "Kael",
        "Orion",
        "River",
        "Blaze",
        "Storm",
        "Shadow",
        "Dawn",
        "Phoenix",
        "Sage",
        "Aelar",
        "Thranduil",
        "Legolas",
        "Elrond",
        "Celeborn",
        "Glorfindel",
        "Erestor",
        "Lindir",
        "Haldir",
        "Rumil",
        "Orophin",
        "Mithrandir",
        "Radagast",
        "Saruman",
        "Gandalf",
        "Elrohir",
        "Elladan",
        "Arwen",
        "Galadriel",
        "Celebrian",
      ],
      lastNames: [
        "Moonwhisper",
        "Starborn",
        "Winddancer",
        "Leafweaver",
        "Silverbow",
        "Goldleaf",
        "Brightmoon",
        "Stormwind",
        "Fireleaf",
        "Waterdance",
        "Earthsong",
        "Stonesinger",
        "Ironleaf",
        "Steelbow",
        "Copperleaf",
        "Silverbow",
        "Goldleaf",
        "Brightbow",
        "Stormleaf",
        "Firebow",
        "Windleaf",
        "Earthbow",
        "Stoneleaf",
        "Ironbow",
        "Steelleaf",
        "Copperbow",
        "Silverleaf",
        "Goldbow",
        "Brightleaf",
        "Stormbow",
        "Fireleaf",
        "Windbow",
        "Earthleaf",
        "Stonebow",
        "Ironleaf",
        "Steelbow",
        "Copperleaf",
        "Silverbow",
        "Goldleaf",
        "Brightbow",
      ],
    },
    female: {
      firstNames: [
        "Lyra",
        "Zara",
        "Luna",
        "Iris",
        "Sage",
        "Willow",
        "Dawn",
        "Aria",
        "Maya",
        "Elena",
        "Arwen",
        "Galadriel",
        "Celebrian",
        "Tauriel",
        "Nimrodel",
        "Luthien",
        "Aredhel",
        "Idril",
        "Nienor",
        "Morwen",
        "Eowyn",
        "Lobelia",
        "Rosie",
        "Goldberry",
        "Belladonna",
        "Primula",
        "Daisy",
        "Poppy",
        "Marigold",
        "Lily",
      ],
      lastNames: [
        "Starlight",
        "Moonbeam",
        "Windwhisper",
        "Leafdancer",
        "Silvermoon",
        "Goldstar",
        "Brightwind",
        "Stormleaf",
        "Firestar",
        "Watermoon",
        "Earthstar",
        "Stonewind",
        "Ironstar",
        "Steelmoon",
        "Copperstar",
        "Silverwind",
        "Goldstar",
        "Brightmoon",
        "Stormstar",
        "Firewind",
        "Windstar",
        "Earthmoon",
        "Stonestar",
        "Ironwind",
        "Steelstar",
        "Coppermoon",
        "Silverstar",
        "Goldwind",
        "Brightstar",
        "Stormmoon",
        "Firestar",
        "Windmoon",
        "Earthstar",
        "Stonemoon",
        "Ironstar",
        "Steelwind",
        "Copperstar",
        "Silvermoon",
        "Goldstar",
        "Brightwind",
      ],
    },
  },
  Dwarf: {
    male: {
      firstNames: [
        "Thorin",
        "Gimli",
        "Balin",
        "Dwalin",
        "Fili",
        "Kili",
        "Oin",
        "Gloin",
        "Ori",
        "Dori",
        "Nori",
        "Bifur",
        "Bofur",
        "Bombur",
        "Dain",
        "Fundin",
        "Gror",
        "Frerin",
        "Dis",
        "Vili",
        "Durin",
        "Nain",
        "Thrain",
        "Thror",
        "Azaghal",
        "Telchar",
        "Narvi",
        "Celebrimbor",
        "Durin",
        "Narvi",
      ],
      lastNames: [
        "Ironbeard",
        "Stonehammer",
        "Goldmine",
        "Silveraxe",
        "Copperforge",
        "Steelbeard",
        "Ironhammer",
        "Stoneaxe",
        "Goldforge",
        "Silverbeard",
        "Copperhammer",
        "Steelaxe",
        "Ironforge",
        "Stonebeard",
        "Goldhammer",
        "Silveraxe",
        "Copperforge",
        "Steelbeard",
        "Ironhammer",
        "Stoneaxe",
        "Goldforge",
        "Silverbeard",
        "Copperhammer",
        "Steelaxe",
        "Ironforge",
        "Stonebeard",
        "Goldhammer",
        "Silveraxe",
        "Copperforge",
        "Steelbeard",
        "Ironhammer",
        "Stoneaxe",
        "Goldforge",
        "Silverbeard",
        "Copperhammer",
        "Steelaxe",
        "Ironforge",
        "Stonebeard",
        "Goldhammer",
        "Silveraxe",
      ],
    },
    female: {
      firstNames: [
        "Disa",
        "Frida",
        "Hilda",
        "Ingrid",
        "Astrid",
        "Sigrid",
        "Gudrun",
        "Helga",
        "Ragnhild",
        "Solveig",
        "Thora",
        "Freya",
        "Sif",
        "Idunn",
        "Gerd",
        "Skadi",
        "Frigg",
        "Eir",
        "Var",
        "Vor",
        "Syn",
        "Hlin",
        "Snotra",
        "Gna",
        "Fulla",
        "Hlín",
        "Sága",
        "Eir",
        "Sjöfn",
        "Lofn",
      ],
      lastNames: [
        "Stoneheart",
        "Ironwill",
        "Goldhand",
        "Silverbeard",
        "Copperheart",
        "Steelwill",
        "Ironhand",
        "Stonebeard",
        "Goldwill",
        "Silverheart",
        "Copperbeard",
        "Steelhand",
        "Ironwill",
        "Stoneheart",
        "Goldbeard",
        "Silverwill",
        "Copperheart",
        "Steelbeard",
        "Ironhand",
        "Stonewill",
        "Goldheart",
        "Silverbeard",
        "Copperwill",
        "Steelheart",
        "Ironbeard",
        "Stonewill",
        "Goldhand",
        "Silverheart",
        "Copperbeard",
        "Steelwill",
        "Ironheart",
        "Stonebeard",
        "Goldwill",
        "Silverhand",
        "Copperheart",
        "Steelbeard",
        "Ironwill",
        "Stoneheart",
        "Goldbeard",
        "Silverwill",
      ],
    },
  },
  Orc: {
    male: {
      firstNames: [
        "Grommash",
        "Thrall",
        "Garrosh",
        "Kil'jaeden",
        "Archimonde",
        "Gul'dan",
        "Ner'zhul",
        "Kargath",
        "Blackhand",
        "Doomhammer",
        "Grom",
        "Thrall",
        "Garrosh",
        "Kil'jaeden",
        "Archimonde",
        "Gul'dan",
        "Ner'zhul",
        "Kargath",
        "Blackhand",
        "Doomhammer",
        "Grommash",
        "Thrall",
        "Garrosh",
        "Kil'jaeden",
        "Archimonde",
        "Gul'dan",
        "Ner'zhul",
        "Kargath",
        "Blackhand",
        "Doomhammer",
      ],
      lastNames: [
        "Skullcrusher",
        "Bonebreaker",
        "Bloodaxe",
        "Ironjaw",
        "Steelclaw",
        "Gorefang",
        "Deathbringer",
        "Soulreaper",
        "Shadowstrike",
        "Darkblade",
        "Nightbane",
        "Doomcaller",
        "Warbringer",
        "Fleshripper",
        "Bonegnawer",
        "Skullsplitter",
        "Blooddrinker",
        "Ironfist",
        "Steeltooth",
        "Gorehand",
        "Deathgrip",
        "Soulstealer",
        "Shadowfang",
        "Darkclaw",
        "Nightstrike",
        "Doomblade",
        "Wargrip",
        "Fleshgnawer",
        "Bonesplitter",
        "Skulldrinker",
        "Bloodfist",
        "Irontooth",
        "Steelhand",
        "Goregrip",
        "Deathstealer",
        "Soulfang",
        "Shadowclaw",
        "Darkstrike",
        "Nightblade",
        "Doomgrip",
      ],
    },
    female: {
      firstNames: [
        "Azshara",
        "Sylvanas",
        "Jaina",
        "Tyrande",
        "Maiev",
        "Vereesa",
        "Alleria",
        "Liadrin",
        "Yrel",
        "Maraad",
        "Garona",
        "Sally",
        "Lilian",
        "Natalie",
        "Sarah",
        "Jessica",
        "Ashley",
        "Amanda",
        "Jennifer",
        "Lisa",
        "Michelle",
        "Kimberly",
        "Donna",
        "Carol",
        "Sandra",
        "Ruth",
        "Sharon",
        "Michelle",
        "Laura",
        "Sarah",
      ],
      lastNames: [
        "Bloodfang",
        "Ironclaw",
        "Steeljaw",
        "Goretooth",
        "Deathgrip",
        "Soulfang",
        "Shadowclaw",
        "Darkstrike",
        "Nightblade",
        "Doomgrip",
        "Warfang",
        "Fleshclaw",
        "Bonejaw",
        "Skulltooth",
        "Bloodgrip",
        "Ironfang",
        "Steelclaw",
        "Gorejaw",
        "Deathtooth",
        "Soulgrip",
        "Shadowfang",
        "Darkclaw",
        "Nightjaw",
        "Doomtooth",
        "Wargrip",
        "Fleshfang",
        "Boneclaw",
        "Skulljaw",
        "Bloodtooth",
        "Irongrip",
        "Steelfang",
        "Goreclaw",
        "Deathjaw",
        "Soultooth",
        "Shadowgrip",
        "Darkfang",
        "Nightclaw",
        "Doomjaw",
        "Wartooth",
        "Fleshgrip",
      ],
    },
  },
  Goblin: {
    male: {
      firstNames: [
        "Gizmo",
        "Gadget",
        "Widget",
        "Gizmo",
        "Gadget",
        "Widget",
        "Gizmo",
        "Gadget",
        "Widget",
        "Gizmo",
        "Gadget",
        "Widget",
        "Gizmo",
        "Gadget",
        "Widget",
        "Gizmo",
        "Gadget",
        "Widget",
        "Gizmo",
        "Gadget",
        "Widget",
        "Gizmo",
        "Gadget",
        "Widget",
        "Gizmo",
        "Gadget",
        "Widget",
        "Gizmo",
        "Gadget",
        "Widget",
      ],
      lastNames: [
        "Coppercoin",
        "Goldpouch",
        "Silverpurse",
        "Bronzebag",
        "Tinwallet",
        "Ironpurse",
        "Steelcoin",
        "Mithrilpouch",
        "Goldcoin",
        "Silverbag",
        "Bronzepurse",
        "Tincoin",
        "Ironpouch",
        "Steelbag",
        "Mithrilpurse",
        "Copperwallet",
        "Goldpurse",
        "Silvercoin",
        "Bronzepouch",
        "Tinbag",
        "Ironwallet",
        "Steelpurse",
        "Mithrilcoin",
        "Copperbag",
        "Goldwallet",
        "Silverpurse",
        "Bronzecoin",
        "Tinpouch",
        "Ironbag",
        "Steelwallet",
        "Mithrilpurse",
        "Coppercoin",
        "Goldbag",
        "Silverwallet",
        "Bronzepurse",
        "Tincoin",
        "Ironpouch",
        "Steelbag",
        "Mithrilwallet",
        "Copperpurse",
      ],
    },
    female: {
      firstNames: [
        "Gizelle",
        "Gadgette",
        "Widgette",
        "Gizelle",
        "Gadgette",
        "Widgette",
        "Gizelle",
        "Gadgette",
        "Widgette",
        "Gizelle",
        "Gadgette",
        "Widgette",
        "Gizelle",
        "Gadgette",
        "Widgette",
        "Gizelle",
        "Gadgette",
        "Widgette",
        "Gizelle",
        "Gadgette",
        "Widgette",
        "Gizelle",
        "Gadgette",
        "Widgette",
        "Gizelle",
        "Gadgette",
        "Widgette",
        "Gizelle",
        "Gadgette",
        "Widgette",
      ],
      lastNames: [
        "Goldpurse",
        "Silvercoin",
        "Bronzepouch",
        "Tinbag",
        "Ironwallet",
        "Steelpurse",
        "Mithrilcoin",
        "Copperbag",
        "Goldwallet",
        "Silverpurse",
        "Bronzecoin",
        "Tinpouch",
        "Ironbag",
        "Steelwallet",
        "Mithrilpurse",
        "Coppercoin",
        "Goldbag",
        "Silverwallet",
        "Bronzepurse",
        "Tincoin",
        "Ironpouch",
        "Steelbag",
        "Mithrilwallet",
        "Copperpurse",
        "Goldcoin",
        "Silverbag",
        "Bronzepurse",
        "Tinwallet",
        "Ironcoin",
        "Steelpouch",
        "Mithrilbag",
        "Copperwallet",
        "Goldpurse",
        "Silvercoin",
        "Bronzebag",
        "Tinpurse",
        "Ironwallet",
        "Steelcoin",
        "Mithrilpurse",
        "Copperbag",
      ],
    },
  },
  Demon: {
    male: {
      firstNames: [
        "Malachar",
        "Zephyros",
        "Vorthak",
        "Kethros",
        "Zalathar",
        "Morthak",
        "Kethros",
        "Zalathar",
        "Morthak",
        "Kethros",
        "Zalathar",
        "Morthak",
        "Kethros",
        "Zalathar",
        "Morthak",
        "Kethros",
        "Zalathar",
        "Morthak",
        "Kethros",
        "Zalathar",
        "Morthak",
        "Kethros",
        "Zalathar",
        "Morthak",
        "Kethros",
        "Zalathar",
        "Morthak",
        "Kethros",
        "Zalathar",
        "Morthak",
      ],
      lastNames: [
        "Hellfire",
        "Soulburn",
        "Darkflame",
        "Shadowburn",
        "Doomfire",
        "Deathflame",
        "Soulfire",
        "Hellburn",
        "Darkfire",
        "Shadowflame",
        "Doomburn",
        "Deathfire",
        "Soulburn",
        "Hellflame",
        "Darkburn",
        "Shadowfire",
        "Doomflame",
        "Deathburn",
        "Soulfire",
        "Hellflame",
        "Darkburn",
        "Shadowfire",
        "Doomflame",
        "Deathburn",
        "Soulfire",
        "Hellflame",
        "Darkburn",
        "Shadowfire",
        "Doomflame",
        "Deathburn",
        "Soulfire",
        "Hellflame",
        "Darkburn",
        "Shadowfire",
        "Doomflame",
        "Deathburn",
        "Soulfire",
        "Hellflame",
        "Darkburn",
        "Shadowfire",
      ],
    },
    female: {
      firstNames: [
        "Lilith",
        "Azazel",
        "Belial",
        "Asmodeus",
        "Mammon",
        "Leviathan",
        "Beelzebub",
        "Astaroth",
        "Paimon",
        "Bael",
        "Purson",
        "Agares",
        "Vassago",
        "Gamigin",
        "Marbas",
        "Valefor",
        "Amon",
        "Barbatos",
        "Paimon",
        "Buer",
        "Gusion",
        "Sitri",
        "Beleth",
        "Leraje",
        "Eligos",
        "Zepar",
        "Botis",
        "Bathin",
        "Sallos",
        "Purson",
      ],
      lastNames: [
        "Shadowflame",
        "Darkburn",
        "Soulfire",
        "Hellflame",
        "Deathburn",
        "Doomfire",
        "Shadowburn",
        "Darkflame",
        "Soulburn",
        "Hellfire",
        "Deathflame",
        "Doomburn",
        "Shadowfire",
        "Darkburn",
        "Soulflame",
        "Hellburn",
        "Deathfire",
        "Doomflame",
        "Shadowburn",
        "Darkfire",
        "Soulburn",
        "Hellflame",
        "Deathburn",
        "Doomfire",
        "Shadowflame",
        "Darkburn",
        "Soulfire",
        "Hellflame",
        "Deathburn",
        "Doomfire",
        "Shadowburn",
        "Darkflame",
        "Soulburn",
        "Hellfire",
        "Deathflame",
        "Doomburn",
        "Shadowfire",
        "Darkburn",
        "Soulflame",
        "Hellburn",
      ],
    },
  },
  Angel: {
    male: {
      firstNames: [
        "Gabriel",
        "Michael",
        "Raphael",
        "Uriel",
        "Metatron",
        "Sandalphon",
        "Raguel",
        "Remiel",
        "Sariel",
        "Jeremiel",
        "Azrael",
        "Jophiel",
        "Chamuel",
        "Zadkiel",
        "Camael",
        "Haniel",
        "Raziel",
        "Tzadkiel",
        "Sachiel",
        "Cassiel",
        "Malkiel",
        "Oriel",
        "Phanuel",
        "Raguel",
        "Sariel",
        "Jeremiel",
        "Azrael",
        "Jophiel",
        "Chamuel",
        "Zadkiel",
      ],
      lastNames: [
        "Lightbringer",
        "Starweaver",
        "Moonbeam",
        "Sunray",
        "Starlight",
        "Moonlight",
        "Sunlight",
        "Starbright",
        "Moonbright",
        "Sunbright",
        "Lightstar",
        "Starmoon",
        "Moonsun",
        "Sunstar",
        "Brightstar",
        "Brightmoon",
        "Brightsun",
        "Lightmoon",
        "Lightsun",
        "Starlight",
        "Moonstar",
        "Sunstar",
        "Brightstar",
        "Brightmoon",
        "Brightsun",
        "Lightstar",
        "Lightmoon",
        "Lightsun",
        "Starbright",
        "Moonbright",
        "Sunbright",
        "Lightstar",
        "Starmoon",
        "Moonsun",
        "Sunstar",
        "Brightstar",
        "Brightmoon",
        "Brightsun",
        "Lightstar",
        "Lightmoon",
      ],
    },
    female: {
      firstNames: [
        "Seraphina",
        "Cherubina",
        "Gabriella",
        "Michaela",
        "Raphaela",
        "Urielia",
        "Metatrona",
        "Sandalphona",
        "Raguela",
        "Remiela",
        "Sariela",
        "Jeremiela",
        "Azraela",
        "Jophiela",
        "Chamuela",
        "Zadkiela",
        "Camaela",
        "Haniela",
        "Raziela",
        "Tzadkiela",
        "Sachiela",
        "Cassiela",
        "Malkiela",
        "Oriela",
        "Phanuela",
        "Raguela",
        "Sariela",
        "Jeremiela",
        "Azraela",
        "Jophiela",
      ],
      lastNames: [
        "Starlight",
        "Moonbeam",
        "Sunray",
        "Lightstar",
        "Starmoon",
        "Moonsun",
        "Sunstar",
        "Brightstar",
        "Brightmoon",
        "Brightsun",
        "Lightmoon",
        "Lightsun",
        "Starbright",
        "Moonbright",
        "Sunbright",
        "Lightstar",
        "Starmoon",
        "Moonsun",
        "Sunstar",
        "Brightstar",
        "Brightmoon",
        "Brightsun",
        "Lightstar",
        "Lightmoon",
        "Lightsun",
        "Starbright",
        "Moonbright",
        "Sunbright",
        "Lightstar",
        "Starmoon",
        "Moonsun",
        "Sunstar",
        "Brightstar",
        "Brightmoon",
        "Brightsun",
        "Lightstar",
        "Lightmoon",
        "Lightsun",
        "Starbright",
        "Moonbright",
      ],
    },
  },
  Undead: {
    male: {
      firstNames: [
        "Mortis",
        "Necros",
        "Thanatos",
        "Hades",
        "Pluto",
        "Charon",
        "Styx",
        "Lethe",
        "Phlegethon",
        "Cocytus",
        "Acheron",
        "Tartarus",
        "Erebus",
        "Nyx",
        "Hypnos",
        "Thanatos",
        "Hades",
        "Pluto",
        "Charon",
        "Styx",
        "Lethe",
        "Phlegethon",
        "Cocytus",
        "Acheron",
        "Tartarus",
        "Erebus",
        "Nyx",
        "Hypnos",
        "Thanatos",
        "Hades",
      ],
      lastNames: [
        "Bonechill",
        "Soulfrost",
        "Deathfrost",
        "Gravechill",
        "Tombfrost",
        "Cryptchill",
        "Soulfrost",
        "Deathchill",
        "Gravefrost",
        "Tombchill",
        "Cryptfrost",
        "Bonefrost",
        "Soulchill",
        "Deathfrost",
        "Gravechill",
        "Tombfrost",
        "Cryptchill",
        "Bonefrost",
        "Soulfrost",
        "Deathchill",
        "Gravefrost",
        "Tombchill",
        "Cryptfrost",
        "Bonechill",
        "Soulfrost",
        "Deathfrost",
        "Gravechill",
        "Tombfrost",
        "Cryptchill",
        "Bonefrost",
        "Soulchill",
        "Deathfrost",
        "Gravefrost",
        "Tombchill",
        "Cryptfrost",
        "Bonechill",
        "Soulfrost",
        "Deathchill",
        "Gravefrost",
        "Tombchill",
      ],
    },
    female: {
      firstNames: [
        "Mortisa",
        "Necrosa",
        "Thanatosa",
        "Hadesa",
        "Plutoa",
        "Charona",
        "Styxa",
        "Lethea",
        "Phlegethona",
        "Cocytusa",
        "Acherona",
        "Tartarusa",
        "Erebusa",
        "Nyxa",
        "Hypnosa",
        "Thanatosa",
        "Hadesa",
        "Plutoa",
        "Charona",
        "Styxa",
        "Lethea",
        "Phlegethona",
        "Cocytusa",
        "Acherona",
        "Tartarusa",
        "Erebusa",
        "Nyxa",
        "Hypnosa",
        "Thanatosa",
        "Hadesa",
      ],
      lastNames: [
        "Soulfrost",
        "Deathchill",
        "Gravefrost",
        "Tombchill",
        "Cryptfrost",
        "Bonechill",
        "Soulfrost",
        "Deathfrost",
        "Gravechill",
        "Tombfrost",
        "Cryptchill",
        "Bonefrost",
        "Soulchill",
        "Deathfrost",
        "Gravefrost",
        "Tombchill",
        "Cryptfrost",
        "Bonechill",
        "Soulfrost",
        "Deathchill",
        "Gravefrost",
        "Tombfrost",
        "Cryptchill",
        "Bonefrost",
        "Soulfrost",
        "Deathfrost",
        "Gravechill",
        "Tombfrost",
        "Cryptchill",
        "Bonefrost",
        "Soulchill",
        "Deathfrost",
        "Gravefrost",
        "Tombchill",
        "Cryptfrost",
        "Bonechill",
        "Soulfrost",
        "Deathchill",
        "Gravefrost",
        "Tombchill",
      ],
    },
  },
  Draconic: {
    male: {
      firstNames: [
        "Drakon",
        "Vyrn",
        "Syth",
        "Zephyr",
        "Pyros",
        "Frost",
        "Storm",
        "Shadow",
        "Flame",
        "Thunder",
        "Drakon",
        "Vyrn",
        "Syth",
        "Zephyr",
        "Pyros",
        "Frost",
        "Storm",
        "Shadow",
        "Flame",
        "Thunder",
        "Drakon",
        "Vyrn",
        "Syth",
        "Zephyr",
        "Pyros",
        "Frost",
        "Storm",
        "Shadow",
        "Flame",
        "Thunder",
      ],
      lastNames: [
        "Dragonfire",
        "Wyrmflame",
        "Drakescale",
        "Serpentfire",
        "Dragonflame",
        "Wyrmfire",
        "Drakescale",
        "Serpentflame",
        "Dragonfire",
        "Wyrmflame",
        "Drakescale",
        "Serpentfire",
        "Dragonflame",
        "Wyrmfire",
        "Drakescale",
        "Serpentflame",
        "Dragonfire",
        "Wyrmflame",
        "Drakescale",
        "Serpentfire",
        "Dragonflame",
        "Wyrmfire",
        "Drakescale",
        "Serpentflame",
        "Dragonfire",
        "Wyrmflame",
        "Drakescale",
        "Serpentfire",
        "Dragonflame",
        "Wyrmfire",
        "Drakescale",
        "Serpentflame",
        "Dragonfire",
        "Wyrmflame",
        "Drakescale",
        "Serpentfire",
        "Dragonflame",
        "Wyrmfire",
        "Drakescale",
        "Serpentflame",
      ],
    },
    female: {
      firstNames: [
        "Drakina",
        "Vyrna",
        "Sytha",
        "Zephyra",
        "Pyrosa",
        "Frosta",
        "Storma",
        "Shadowa",
        "Flamea",
        "Thundera",
        "Drakina",
        "Vyrna",
        "Sytha",
        "Zephyra",
        "Pyrosa",
        "Frosta",
        "Storma",
        "Shadowa",
        "Flamea",
        "Thundera",
        "Drakina",
        "Vyrna",
        "Sytha",
        "Zephyra",
        "Pyrosa",
        "Frosta",
        "Storma",
        "Shadowa",
        "Flamea",
        "Thundera",
      ],
      lastNames: [
        "Wyrmflame",
        "Drakescale",
        "Serpentfire",
        "Dragonflame",
        "Wyrmfire",
        "Drakescale",
        "Serpentflame",
        "Dragonfire",
        "Wyrmflame",
        "Drakescale",
        "Serpentfire",
        "Dragonflame",
        "Wyrmfire",
        "Drakescale",
        "Serpentflame",
        "Dragonfire",
        "Wyrmflame",
        "Drakescale",
        "Serpentfire",
        "Dragonflame",
        "Wyrmfire",
        "Drakescale",
        "Serpentflame",
        "Dragonfire",
        "Wyrmflame",
        "Drakescale",
        "Serpentfire",
        "Dragonflame",
        "Wyrmfire",
        "Drakescale",
        "Serpentflame",
        "Dragonfire",
        "Wyrmflame",
        "Drakescale",
        "Serpentfire",
        "Dragonflame",
        "Wyrmfire",
        "Drakescale",
        "Serpentflame",
        "Dragonfire",
      ],
    },
  },
  Fishman: {
    male: {
      firstNames: [
        "Aqua",
        "Marin",
        "Coral",
        "Reef",
        "Wave",
        "Tide",
        "Current",
        "Stream",
        "Flow",
        "Depth",
        "Aqua",
        "Marin",
        "Coral",
        "Reef",
        "Wave",
        "Tide",
        "Current",
        "Stream",
        "Flow",
        "Depth",
        "Aqua",
        "Marin",
        "Coral",
        "Reef",
        "Wave",
        "Tide",
        "Current",
        "Stream",
        "Flow",
        "Depth",
      ],
      lastNames: [
        "Seafoam",
        "Coralreef",
        "Wavecrash",
        "Tidepool",
        "Currentflow",
        "Streamrush",
        "Flowdeep",
        "Depthcurrent",
        "Seafoam",
        "Coralreef",
        "Wavecrash",
        "Tidepool",
        "Currentflow",
        "Streamrush",
        "Flowdeep",
        "Depthcurrent",
        "Seafoam",
        "Coralreef",
        "Wavecrash",
        "Tidepool",
        "Currentflow",
        "Streamrush",
        "Flowdeep",
        "Depthcurrent",
        "Seafoam",
        "Coralreef",
        "Wavecrash",
        "Tidepool",
        "Currentflow",
        "Streamrush",
        "Flowdeep",
        "Depthcurrent",
        "Seafoam",
        "Coralreef",
        "Wavecrash",
        "Tidepool",
        "Currentflow",
        "Streamrush",
        "Flowdeep",
        "Depthcurrent",
      ],
    },
    female: {
      firstNames: [
        "Aquana",
        "Marina",
        "Corala",
        "Reefa",
        "Wavea",
        "Tidea",
        "Currenta",
        "Streama",
        "Flowa",
        "Deptha",
        "Aquana",
        "Marina",
        "Corala",
        "Reefa",
        "Wavea",
        "Tidea",
        "Currenta",
        "Streama",
        "Flowa",
        "Deptha",
        "Aquana",
        "Marina",
        "Corala",
        "Reefa",
        "Wavea",
        "Tidea",
        "Currenta",
        "Streama",
        "Flowa",
        "Deptha",
      ],
      lastNames: [
        "Coralreef",
        "Wavecrash",
        "Tidepool",
        "Currentflow",
        "Streamrush",
        "Flowdeep",
        "Depthcurrent",
        "Seafoam",
        "Coralreef",
        "Wavecrash",
        "Tidepool",
        "Currentflow",
        "Streamrush",
        "Flowdeep",
        "Depthcurrent",
        "Seafoam",
        "Coralreef",
        "Wavecrash",
        "Tidepool",
        "Currentflow",
        "Streamrush",
        "Flowdeep",
        "Depthcurrent",
        "Seafoam",
        "Coralreef",
        "Wavecrash",
        "Tidepool",
        "Currentflow",
        "Streamrush",
        "Flowdeep",
        "Depthcurrent",
        "Seafoam",
        "Coralreef",
        "Wavecrash",
        "Tidepool",
        "Currentflow",
        "Streamrush",
        "Flowdeep",
        "Depthcurrent",
        "Seafoam",
      ],
    },
  },
  Birdman: {
    male: {
      firstNames: [
        "Aero",
        "Zephyr",
        "Gale",
        "Wind",
        "Breeze",
        "Gust",
        "Storm",
        "Tempest",
        "Cyclone",
        "Hurricane",
        "Aero",
        "Zephyr",
        "Gale",
        "Wind",
        "Breeze",
        "Gust",
        "Storm",
        "Tempest",
        "Cyclone",
        "Hurricane",
        "Aero",
        "Zephyr",
        "Gale",
        "Wind",
        "Breeze",
        "Gust",
        "Storm",
        "Tempest",
        "Cyclone",
        "Hurricane",
      ],
      lastNames: [
        "Windrider",
        "Skysoarer",
        "Clouddancer",
        "Stormflyer",
        "Tempestwing",
        "Cyclonesoar",
        "Hurricanefly",
        "Windrider",
        "Skysoarer",
        "Clouddancer",
        "Stormflyer",
        "Tempestwing",
        "Cyclonesoar",
        "Hurricanefly",
        "Windrider",
        "Skysoarer",
        "Clouddancer",
        "Stormflyer",
        "Tempestwing",
        "Cyclonesoar",
        "Hurricanefly",
        "Windrider",
        "Skysoarer",
        "Clouddancer",
        "Stormflyer",
        "Tempestwing",
        "Cyclonesoar",
        "Hurricanefly",
        "Windrider",
        "Skysoarer",
        "Clouddancer",
        "Stormflyer",
        "Tempestwing",
        "Cyclonesoar",
        "Hurricanefly",
        "Windrider",
        "Skysoarer",
        "Clouddancer",
        "Stormflyer",
        "Tempestwing",
      ],
    },
    female: {
      firstNames: [
        "Aera",
        "Zephyra",
        "Galea",
        "Winda",
        "Breeza",
        "Gusta",
        "Storma",
        "Tempesta",
        "Cyclona",
        "Hurricana",
        "Aera",
        "Zephyra",
        "Galea",
        "Winda",
        "Breeza",
        "Gusta",
        "Storma",
        "Tempesta",
        "Cyclona",
        "Hurricana",
        "Aera",
        "Zephyra",
        "Galea",
        "Winda",
        "Breeza",
        "Gusta",
        "Storma",
        "Tempesta",
        "Cyclona",
        "Hurricana",
      ],
      lastNames: [
        "Skysoarer",
        "Clouddancer",
        "Stormflyer",
        "Tempestwing",
        "Cyclonesoar",
        "Hurricanefly",
        "Windrider",
        "Skysoarer",
        "Clouddancer",
        "Stormflyer",
        "Tempestwing",
        "Cyclonesoar",
        "Hurricanefly",
        "Windrider",
        "Skysoarer",
        "Clouddancer",
        "Stormflyer",
        "Tempestwing",
        "Cyclonesoar",
        "Hurricanefly",
        "Windrider",
        "Skysoarer",
        "Clouddancer",
        "Stormflyer",
        "Tempestwing",
        "Cyclonesoar",
        "Hurricanefly",
        "Windrider",
        "Skysoarer",
        "Clouddancer",
        "Stormflyer",
        "Tempestwing",
        "Cyclonesoar",
        "Hurricanefly",
        "Windrider",
        "Skysoarer",
        "Clouddancer",
        "Stormflyer",
        "Tempestwing",
        "Cyclonesoar",
      ],
    },
  },
  // CREATURE NAME DATABASES
  Goblin: {
    male: {
      firstNames: [
        "Gizmo",
        "Gadget",
        "Widget",
        "Sprocket",
        "Cog",
        "Gear",
        "Bolt",
        "Nail",
        "Rivet",
        "Pin",
        "Screw",
        "Wrench",
        "Hammer",
        "Chisel",
        "File",
        "Drill",
        "Saw",
        "Plier",
        "Clamp",
        "Hook",
      ],
      lastNames: [
        "Coppercoin",
        "Goldpouch",
        "Silverpurse",
        "Bronzebag",
        "Tinwallet",
        "Ironpurse",
        "Steelcoin",
        "Mithrilpouch",
        "Goldcoin",
        "Silverbag",
        "Bronzepurse",
        "Tincoin",
      ],
    },
    female: {
      firstNames: [
        "Gizelle",
        "Gadgette",
        "Widgette",
        "Sprockette",
        "Cogette",
        "Gearette",
        "Bollette",
        "Naillette",
        "Rivette",
        "Pinette",
        "Screwette",
        "Wrenchette",
        "Hammerette",
        "Chiselette",
        "Filette",
      ],
      lastNames: [
        "Goldpurse",
        "Silvercoin",
        "Bronzepouch",
        "Tinbag",
        "Ironwallet",
        "Steelpurse",
        "Mithrilcoin",
        "Copperbag",
        "Goldwallet",
        "Silverpurse",
        "Bronzecoin",
        "Tinpouch",
      ],
    },
  },
  Orc: {
    male: {
      firstNames: [
        "Grommash",
        "Thrall",
        "Garrosh",
        "Kil'jaeden",
        "Archimonde",
        "Gul'dan",
        "Ner'zhul",
        "Kargath",
        "Blackhand",
        "Doomhammer",
        "Grom",
        "Thrall",
        "Garrosh",
        "Kil'jaeden",
        "Archimonde",
      ],
      lastNames: [
        "Skullcrusher",
        "Bonebreaker",
        "Bloodaxe",
        "Ironjaw",
        "Steelclaw",
        "Gorefang",
        "Deathbringer",
        "Soulreaper",
        "Shadowstrike",
        "Darkblade",
        "Nightbane",
        "Doomcaller",
        "Warbringer",
        "Fleshripper",
      ],
    },
    female: {
      firstNames: [
        "Azshara",
        "Sylvanas",
        "Jaina",
        "Tyrande",
        "Maiev",
        "Vereesa",
        "Alleria",
        "Liadrin",
        "Yrel",
        "Maraad",
        "Garona",
        "Sally",
        "Lilian",
        "Natalie",
        "Sarah",
      ],
      lastNames: [
        "Bloodfang",
        "Ironclaw",
        "Steeljaw",
        "Goretooth",
        "Deathgrip",
        "Soulfang",
        "Shadowclaw",
        "Darkstrike",
        "Nightblade",
        "Doomgrip",
        "Warfang",
        "Fleshclaw",
        "Bonejaw",
        "Skulltooth",
      ],
    },
  },
  Troll: {
    male: {
      firstNames: [
        "Grommash",
        "Thrall",
        "Garrosh",
        "Kil'jaeden",
        "Archimonde",
        "Gul'dan",
        "Ner'zhul",
        "Kargath",
        "Blackhand",
        "Doomhammer",
        "Grom",
        "Thrall",
        "Garrosh",
        "Kil'jaeden",
        "Archimonde",
      ],
      lastNames: [
        "Skullcrusher",
        "Bonebreaker",
        "Bloodaxe",
        "Ironjaw",
        "Steelclaw",
        "Gorefang",
        "Deathbringer",
        "Soulreaper",
        "Shadowstrike",
        "Darkblade",
        "Nightbane",
        "Doomcaller",
        "Warbringer",
        "Fleshripper",
      ],
    },
    female: {
      firstNames: [
        "Azshara",
        "Sylvanas",
        "Jaina",
        "Tyrande",
        "Maiev",
        "Vereesa",
        "Alleria",
        "Liadrin",
        "Yrel",
        "Maraad",
        "Garona",
        "Sally",
        "Lilian",
        "Natalie",
        "Sarah",
      ],
      lastNames: [
        "Bloodfang",
        "Ironclaw",
        "Steeljaw",
        "Goretooth",
        "Deathgrip",
        "Soulfang",
        "Shadowclaw",
        "Darkstrike",
        "Nightblade",
        "Doomgrip",
        "Warfang",
        "Fleshclaw",
        "Bonejaw",
        "Skulltooth",
      ],
    },
  },
  Dragon: {
    male: {
      firstNames: [
        "Drakon",
        "Vyrn",
        "Syth",
        "Zephyr",
        "Pyros",
        "Frost",
        "Storm",
        "Shadow",
        "Flame",
        "Thunder",
        "Drakon",
        "Vyrn",
        "Syth",
        "Zephyr",
        "Pyros",
        "Frost",
        "Storm",
        "Shadow",
        "Flame",
        "Thunder",
      ],
      lastNames: [
        "Dragonfire",
        "Wyrmflame",
        "Drakescale",
        "Serpentfire",
        "Dragonflame",
        "Wyrmfire",
        "Drakescale",
        "Serpentflame",
        "Dragonfire",
        "Wyrmflame",
        "Drakescale",
        "Serpentfire",
        "Dragonflame",
        "Wyrmfire",
      ],
    },
    female: {
      firstNames: [
        "Drakina",
        "Vyrna",
        "Sytha",
        "Zephyra",
        "Pyrosa",
        "Frosta",
        "Storma",
        "Shadowa",
        "Flamea",
        "Thundera",
        "Drakina",
        "Vyrna",
        "Sytha",
        "Zephyra",
        "Pyrosa",
        "Frosta",
        "Storma",
        "Shadowa",
        "Flamea",
        "Thundera",
      ],
      lastNames: [
        "Wyrmflame",
        "Drakescale",
        "Serpentfire",
        "Dragonflame",
        "Wyrmfire",
        "Drakescale",
        "Serpentflame",
        "Dragonfire",
        "Wyrmflame",
        "Drakescale",
        "Serpentfire",
        "Dragonflame",
        "Wyrmfire",
        "Drakescale",
      ],
    },
  },
  Demon: {
    male: {
      firstNames: [
        "Malachar",
        "Zephyros",
        "Vorthak",
        "Kethros",
        "Zalathar",
        "Morthak",
        "Kethros",
        "Zalathar",
        "Morthak",
        "Kethros",
        "Zalathar",
        "Morthak",
        "Kethros",
        "Zalathar",
        "Morthak",
      ],
      lastNames: [
        "Hellfire",
        "Soulburn",
        "Darkflame",
        "Shadowburn",
        "Doomfire",
        "Deathflame",
        "Soulfire",
        "Hellburn",
        "Darkfire",
        "Shadowflame",
        "Doomburn",
        "Deathfire",
        "Soulburn",
        "Hellflame",
      ],
    },
    female: {
      firstNames: [
        "Lilith",
        "Azazel",
        "Belial",
        "Asmodeus",
        "Mammon",
        "Leviathan",
        "Beelzebub",
        "Astaroth",
        "Paimon",
        "Bael",
        "Purson",
        "Agares",
        "Vassago",
        "Gamigin",
        "Marbas",
      ],
      lastNames: [
        "Shadowflame",
        "Darkburn",
        "Soulfire",
        "Hellflame",
        "Deathburn",
        "Doomfire",
        "Shadowburn",
        "Darkflame",
        "Soulburn",
        "Hellfire",
        "Deathflame",
        "Doomburn",
        "Shadowfire",
        "Darkburn",
      ],
    },
  },
  Wolf: {
    male: {
      firstNames: [
        "Alpha",
        "Beta",
        "Gamma",
        "Delta",
        "Epsilon",
        "Zeta",
        "Eta",
        "Theta",
        "Iota",
        "Kappa",
        "Lambda",
        "Mu",
        "Nu",
        "Xi",
        "Omicron",
        "Pi",
        "Rho",
        "Sigma",
        "Tau",
        "Upsilon",
      ],
      lastNames: [
        "Howler",
        "Growler",
        "Snarler",
        "Biter",
        "Clawer",
        "Hunter",
        "Tracker",
        "Stalker",
        "Runner",
        "Leaper",
        "Pouncer",
        "Slasher",
        "Ripper",
        "Tearer",
        "Shredder",
      ],
    },
    female: {
      firstNames: [
        "Alpha",
        "Beta",
        "Gamma",
        "Delta",
        "Epsilon",
        "Zeta",
        "Eta",
        "Theta",
        "Iota",
        "Kappa",
        "Lambda",
        "Mu",
        "Nu",
        "Xi",
        "Omicron",
        "Pi",
        "Rho",
        "Sigma",
        "Tau",
        "Upsilon",
      ],
      lastNames: [
        "Howler",
        "Growler",
        "Snarler",
        "Biter",
        "Clawer",
        "Hunter",
        "Tracker",
        "Stalker",
        "Runner",
        "Leaper",
        "Pouncer",
        "Slasher",
        "Ripper",
        "Tearer",
        "Shredder",
      ],
    },
  },
  Bear: {
    male: {
      firstNames: [
        "Grizzly",
        "Brown",
        "Black",
        "Polar",
        "Kodiak",
        "Grizzly",
        "Brown",
        "Black",
        "Polar",
        "Kodiak",
        "Grizzly",
        "Brown",
        "Black",
        "Polar",
        "Kodiak",
        "Grizzly",
        "Brown",
        "Black",
        "Polar",
        "Kodiak",
      ],
      lastNames: [
        "Claw",
        "Fang",
        "Roar",
        "Growl",
        "Snarl",
        "Bite",
        "Rip",
        "Tear",
        "Slash",
        "Crush",
        "Smash",
        "Pound",
        "Bash",
        "Thump",
        "Stomp",
        "Trample",
        "Squash",
        "Flatten",
        "Squish",
        "Mash",
      ],
    },
    female: {
      firstNames: [
        "Grizzly",
        "Brown",
        "Black",
        "Polar",
        "Kodiak",
        "Grizzly",
        "Brown",
        "Black",
        "Polar",
        "Kodiak",
        "Grizzly",
        "Brown",
        "Black",
        "Polar",
        "Kodiak",
        "Grizzly",
        "Brown",
        "Black",
        "Polar",
        "Kodiak",
      ],
      lastNames: [
        "Claw",
        "Fang",
        "Roar",
        "Growl",
        "Snarl",
        "Bite",
        "Rip",
        "Tear",
        "Slash",
        "Crush",
        "Smash",
        "Pound",
        "Bash",
        "Thump",
        "Stomp",
        "Trample",
        "Squash",
        "Flatten",
        "Squish",
        "Mash",
      ],
    },
  },
  MountainLion: {
    male: {
      firstNames: [
        "Cougar",
        "Puma",
        "Panther",
        "Jaguar",
        "Leopard",
        "Tiger",
        "Lion",
        "Cheetah",
        "Lynx",
        "Bobcat",
        "Cougar",
        "Puma",
        "Panther",
        "Jaguar",
        "Leopard",
        "Tiger",
        "Lion",
        "Cheetah",
        "Lynx",
        "Bobcat",
      ],
      lastNames: [
        "Pounce",
        "Leap",
        "Spring",
        "Bound",
        "Jump",
        "Dash",
        "Sprint",
        "Rush",
        "Charge",
        "Strike",
        "Slash",
        "Claw",
        "Rip",
        "Tear",
        "Bite",
        "Snarl",
        "Growl",
        "Hiss",
        "Roar",
        "Yowl",
      ],
    },
    female: {
      firstNames: [
        "Cougar",
        "Puma",
        "Panther",
        "Jaguar",
        "Leopard",
        "Tiger",
        "Lion",
        "Cheetah",
        "Lynx",
        "Bobcat",
        "Cougar",
        "Puma",
        "Panther",
        "Jaguar",
        "Leopard",
        "Tiger",
        "Lion",
        "Cheetah",
        "Lynx",
        "Bobcat",
      ],
      lastNames: [
        "Pounce",
        "Leap",
        "Spring",
        "Bound",
        "Jump",
        "Dash",
        "Sprint",
        "Rush",
        "Charge",
        "Strike",
        "Slash",
        "Claw",
        "Rip",
        "Tear",
        "Bite",
        "Snarl",
        "Growl",
        "Hiss",
        "Roar",
        "Yowl",
      ],
    },
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
  // Generate random gender with 70/30 male/female distribution
  generateRandomGender: function () {
    const random = Math.random();
    return random < 0.7 ? "male" : "female";
  },

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

  // Generate random class based on rarity with very low probability for uncommon/rare
  generateRandomClass: function () {
    const classes = Object.keys(classDatabase);
    const rarityWeights = {
      common: 0.938, // 93.8% chance for common classes
      uncommon: 0.05, // 5% chance for uncommon classes (very low)
      rare: 0.01, // 1% chance for rare classes (very rare)
      legendary: 0.005, // 0.2% chance for legendary classes (extremely rare)
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
      clothes: null,
      armor: null,
      weapon: null,
      secondHand: null,
      back: null,
      tool: null,
    };

    // ALWAYS generate clothes for all characters
    if (
      classData.equipmentPreferences.clothes &&
      classData.equipmentPreferences.clothes.length > 0
    ) {
      const clothesType =
        classData.equipmentPreferences.clothes[
          Math.floor(
            Math.random() * classData.equipmentPreferences.clothes.length
          )
        ];
      equipment.clothes = this.generateEquipmentItem("clothes", clothesType);
    } else {
      // Fallback to basic clothes if no preferences
      equipment.clothes = this.generateEquipmentItem(
        "clothes",
        "commoner-clothes"
      );
    }

    // Generate armor ONLY for martial classes
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

    // Generate weapon (1h) - ALWAYS generate a weapon for all characters
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
      equipment.weapon = this.generateEquipmentItem("weapon1h", weaponType);
    } else {
      // Fallback weapon if no preferences defined
      equipment.weapon = this.generateEquipmentItem("weapon1h", "sword");
    }

    // Generate shield or second weapon
    if (
      classData.equipmentPreferences.shield &&
      classData.equipmentPreferences.shield.length > 0
    ) {
      const shieldType =
        classData.equipmentPreferences.shield[
          Math.floor(
            Math.random() * classData.equipmentPreferences.shield.length
          )
        ];
      equipment.secondHand = this.generateEquipmentItem("shield", shieldType);
    }

    // Generate 2h weapon or container for back slot
    if (
      classData.equipmentPreferences.back &&
      classData.equipmentPreferences.back.length > 0
    ) {
      const backType =
        classData.equipmentPreferences.back[
          Math.floor(Math.random() * classData.equipmentPreferences.back.length)
        ];
      // Determine if it's a weapon or container
      const weapon2hItems = equipmentTypes.weapon2h.items;
      const rangedItems = equipmentTypes.ranged.items;
      const containerItems = equipmentTypes.container.items;

      if (weapon2hItems.includes(backType)) {
        equipment.back = this.generateEquipmentItem("weapon2h", backType);
      } else if (rangedItems.includes(backType)) {
        equipment.back = this.generateEquipmentItem("ranged", backType);
      } else if (containerItems.includes(backType)) {
        equipment.back = this.generateEquipmentItem("container", backType);
      }
    }

    // Generate tool based on class type
    const crafterClasses = ["craftsman", "alchemist", "herbalist"];
    const explorerClasses = ["explorer", "ranger", "hunter", "dungeondiver"];
    const mageClasses = [
      "pyromancer",
      "necromancer",
      "articaster",
      "geomancer",
    ];

    if (martialClasses.includes(className)) {
      // Martial classes get whetstone
      equipment.tool = this.generateEquipmentItem("tool", "whetstone");
    } else if (crafterClasses.includes(className)) {
      // Crafter classes get specialized kits based on their primary skill
      if (className === "herbalist") {
        equipment.tool = this.generateEquipmentItem("tool", "herbalist-kit");
      } else if (className === "craftsman") {
        equipment.tool = this.generateEquipmentItem(
          "tool",
          "blacksmithing-kit"
        );
      } else if (className === "alchemist") {
        equipment.tool = this.generateEquipmentItem("tool", "alchemy-kit");
      }
    } else if (explorerClasses.includes(className)) {
      // Explorer classes get specialized kits
      if (className === "dungeondiver") {
        equipment.tool = this.generateEquipmentItem("tool", "dungeondiver-kit");
      } else {
        equipment.tool = this.generateEquipmentItem("tool", "explorer-kit");
      }
    } else if (mageClasses.includes(className)) {
      // Mage classes get specialized kits based on their school
      if (className === "geomancer") {
        equipment.tool = this.generateEquipmentItem("tool", "geomancer-kit");
      } else if (className === "pyromancer") {
        equipment.tool = this.generateEquipmentItem("tool", "pyromancer-kit");
      } else if (className === "articaster") {
        equipment.tool = this.generateEquipmentItem("tool", "articaster-kit");
      } else if (className === "necromancer") {
        equipment.tool = this.generateEquipmentItem("tool", "necromancer-kit");
      }
    } else if (className === "monk" || className === "cleric") {
      // Monks and clerics get meditation kit
      equipment.tool = this.generateEquipmentItem("tool", "meditation-kit");
    } else if (
      classData.equipmentPreferences.tool &&
      classData.equipmentPreferences.tool.length > 0
    ) {
      // Other classes get random tool if they have preferences
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
      clothes: null,
      armor: null,
      weapon: null,
      secondHand: null,
      back: null,
      tool: null,
    };

    // ALWAYS generate clothes first
    equipment.clothes = this.generateEquipmentItem(
      "clothes",
      "commoner-clothes"
    );

    // ALWAYS generate weapon - this is critical for all characters
    equipment.weapon = this.generateEquipmentItem("weapon1h", "sword");

    // Randomly decide which additional equipment slots to fill (0-2 more items)
    const slots = ["armor", "secondHand", "back", "tool"];
    const numSlots = Math.floor(Math.random() * 3); // 0-2 additional items
    const selectedSlots = slots
      .sort(() => 0.5 - Math.random())
      .slice(0, numSlots);

    selectedSlots.forEach((slot) => {
      let equipmentType = null;

      // Map slots to equipment types
      switch (slot) {
        case "armor":
          equipmentType = "armor";
          break;
        case "secondHand":
          equipmentType = "shield";
          break;
        case "back":
          // Randomly choose between 2h weapon, ranged, or container
          const backTypes = ["weapon2h", "ranged", "container"];
          equipmentType =
            backTypes[Math.floor(Math.random() * backTypes.length)];
          break;
        case "tool":
          equipmentType = "tool";
          break;
      }

      if (
        equipmentType &&
        equipmentTypes[equipmentType] &&
        equipmentTypes[equipmentType].items.length > 0
      ) {
        const itemType =
          equipmentTypes[equipmentType].items[
            Math.floor(
              Math.random() * equipmentTypes[equipmentType].items.length
            )
          ];
        equipment[slot] = this.generateEquipmentItem(equipmentType, itemType);
      }
    });

    return equipment;
  },

  // Generate individual equipment item with random properties
  generateEquipmentItem: function (equipmentType, itemType) {
    const typeData = equipmentTypes[equipmentType];
    if (!typeData) return null;

    // Random status (weighted toward better condition for starting equipment)
    const statusType = equipmentStatus[typeData.statusType];
    const statusWeights = [0.05, 0.1, 0.2, 0.3, 0.25, 0.08, 0.02]; // Weighted toward "Good" condition
    const randomStatus = this.weightedRandom(
      statusType.statuses,
      statusWeights
    );

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
    const randomMaterial = this.weightedRandom(
      allowedMaterials,
      materialWeights
    );

    // Random rarity (weighted toward common rarity, capped at common, floored at scrap)
    const rarities = Object.keys(equipmentRarity);
    // Only allow scrap, improvised, poor, and common rarities for starting equipment
    const allowedRarities = ["scrap", "improvised", "poor", "common"];
    const rarityWeights = [0.1, 0.2, 0.3, 0.4]; // Weighted toward common
    const randomRarity = this.weightedRandom(allowedRarities, rarityWeights);

    // Format: "status material rarity [itemType]"
    return `${randomStatus.name.toLowerCase()} ${randomMaterial} ${randomRarity} [${itemType}]`;
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
      history: `${generatedFirstName} ${generatedLastName} is a ${selectedGender} ${
        raceData.name
      } ${classDatabase[
        selectedClass
      ].name.toLowerCase()} who has joined your group.`,
      experience: 0,
      level: 1,
    };

    return character;
  },

  // Generate player starting equipment (clothes, weapon, shield/tool based on class)
  generatePlayerStartingEquipment: function (className) {
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
      hammers: "hammer_kit",
      great_hammers: "greathammer_kit",
      polearms: "polearm_kit",
      bows: "archery_kit",
      crossbows: "crossbow_kit",
      throwing: "throwing_kit",
      shields: "shield_kit",
      great_shields: "greatshield_kit",
      unarmed: "training_weights",
      tactics: "tactics_manual",
      intimidation: "intimidation_tools",
      shieldwork: "shield_kit",
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
