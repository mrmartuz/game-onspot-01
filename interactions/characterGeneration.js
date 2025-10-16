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

// Race system for character generation with gender bonuses
export const raceDatabase = {
  Human: {
    name: "Human",
    region: "Aurenith",
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
    description: "Graceful and wise, elves have enhanced dexterity and wisdom",
    statBonuses: { STR: -1, DEX: 2, CON: -1, INT: 1, WIS: 2, CHA: 1, LUCK: 0 },
    skillBonuses: { archery: 1, meditation: 1, nature_magic: 1 },
    genderBonuses: {
      male: { DEX: 1, INT: 1, CON: -1 },
      female: { WIS: 1, CHA: 1, STR: -1 },
    },
  },
  Dwarf: {
    name: "Dwarf",
    region: "Gromthar",
    description: "Sturdy and strong, dwarves excel in physical attributes",
    statBonuses: { STR: 2, DEX: -1, CON: 2, INT: 0, WIS: 0, CHA: -1, LUCK: 0 },
    skillBonuses: { blacksmithing: 1, mining: 1, stonework: 1 },
    genderBonuses: {
      male: { STR: 1, CON: 1, CHA: -1 },
      female: { CON: 1, WIS: 1, DEX: -1 },
    },
  },
  Orc: {
    name: "Orc",
    region: "Vrakgul",
    description: "Powerful warriors with great strength and constitution",
    statBonuses: { STR: 3, DEX: 0, CON: 2, INT: -2, WIS: -1, CHA: -1, LUCK: 0 },
    skillBonuses: { intimidation: 2, unarmed: 1, survival: 1 },
    genderBonuses: {
      male: { STR: 1, CON: 1, INT: -1 },
      female: { STR: 1, WIS: 1, CHA: -1 },
    },
  },
  Goblin: {
    name: "Goblin",
    region: "Skrixel",
    description: "Small but cunning, goblins are agile and lucky",
    statBonuses: { STR: -2, DEX: 2, CON: -1, INT: 1, WIS: 0, CHA: 0, LUCK: 2 },
    skillBonuses: { stealth: 1, lockpicking: 1, bartering: 1 },
    genderBonuses: {
      male: { DEX: 1, LUCK: 1, CON: -1 },
      female: { DEX: 1, INT: 1, STR: -1 },
    },
  },
  Demon: {
    name: "Demon",
    region: "Zarthorym",
    description: "Dark beings with enhanced magical abilities",
    statBonuses: { STR: 1, DEX: 0, CON: 1, INT: 2, WIS: 0, CHA: 1, LUCK: -1 },
    skillBonuses: { fire_magic: 2, intimidation: 1, death_magic: 1 },
    genderBonuses: {
      male: { STR: 1, INT: 1, WIS: -1 },
      female: { INT: 1, CHA: 1, CON: -1 },
    },
  },
  Angel: {
    name: "Angel",
    region: "Celvayne",
    description: "Divine beings with enhanced wisdom and charisma",
    statBonuses: { STR: 0, DEX: 1, CON: 0, INT: 1, WIS: 2, CHA: 2, LUCK: 1 },
    skillBonuses: { divine_magic: 2, healing: 1, persuasion: 1 },
    genderBonuses: {
      male: { WIS: 1, INT: 1, STR: -1 },
      female: { WIS: 1, CHA: 1, CON: -1 },
    },
  },
  Undead: {
    name: "Undead",
    region: "Nethrogar",
    description: "Undead beings with enhanced constitution and dark magic",
    statBonuses: { STR: 0, DEX: -1, CON: 3, INT: 1, WIS: 0, CHA: -2, LUCK: -1 },
    skillBonuses: { death_magic: 2, intimidation: 1, survival: 1 },
    genderBonuses: {
      male: { CON: 1, INT: 1, CHA: -1 },
      female: { INT: 1, WIS: 1, STR: -1 },
    },
  },
  Draconic: {
    name: "Draconic",
    region: "Vyrascor",
    description:
      "Dragon-blooded beings with enhanced physical and magical abilities",
    statBonuses: { STR: 2, DEX: 0, CON: 2, INT: 1, WIS: 1, CHA: 1, LUCK: 0 },
    skillBonuses: { fire_magic: 1, intimidation: 1, survival: 1 },
    genderBonuses: {
      male: { STR: 1, CON: 1, DEX: -1 },
      female: { CHA: 1, WIS: 1, CON: -1 },
    },
  },
  Fishman: {
    name: "Fishman",
    region: "Thaloryn",
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
    description: "Avian beings with enhanced dexterity and flight abilities",
    statBonuses: { STR: -1, DEX: 3, CON: 0, INT: 0, WIS: 1, CHA: 0, LUCK: 1 },
    skillBonuses: { acrobatics: 2, scouting: 1, archery: 1 },
    genderBonuses: {
      male: { DEX: 1, LUCK: 1, CON: -1 },
      female: { DEX: 1, WIS: 1, STR: -1 },
    },
  },
};

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
