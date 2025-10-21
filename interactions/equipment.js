// Equipment system for enhanced character progression
// Equipment has status/material/rarity/type structure with durability and skill bonuses
// Format: "status material rarity [type]"

// Equipment status levels by item type
export const equipmentStatus = {
  clothes: {
    name: "Clothes",
    statuses: [
      {
        name: "Shattered",
        level: 0,
        durability: 0,
        repairable: false,
        description: "Completely destroyed and unusable",
      },
      {
        name: "Tattered",
        level: 1,
        durability: 15,
        repairable: true,
        description: "Severely damaged, barely functional",
      },
      {
        name: "Frayed",
        level: 2,
        durability: 30,
        repairable: true,
        description: "Worn and showing signs of wear",
      },
      {
        name: "Worn",
        level: 3,
        durability: 50,
        repairable: true,
        description: "Used but still serviceable",
      },
      {
        name: "Serviceable",
        level: 4,
        durability: 70,
        repairable: true,
        description: "In good working condition",
      },
      {
        name: "Pristine",
        level: 5,
        durability: 90,
        repairable: true,
        description: "Like new, well maintained",
      },
      {
        name: "Immaculate",
        level: 6,
        durability: 100,
        repairable: true,
        description: "Perfect condition, flawless",
      },
    ],
  },
  armor: {
    name: "Armor",
    statuses: [
      {
        name: "Shattered",
        level: 0,
        durability: 0,
        repairable: false,
        description: "Completely destroyed and unusable",
      },
      {
        name: "Breached",
        level: 1,
        durability: 15,
        repairable: true,
        description: "Severely damaged, protection compromised",
      },
      {
        name: "Dented",
        level: 2,
        durability: 30,
        repairable: true,
        description: "Battle damage visible, reduced protection",
      },
      {
        name: "Scratched",
        level: 3,
        durability: 50,
        repairable: true,
        description: "Minor battle scars, still protective",
      },
      {
        name: "Polished",
        level: 4,
        durability: 70,
        repairable: true,
        description: "Well maintained, good protection",
      },
      {
        name: "Reinforced",
        level: 5,
        durability: 90,
        repairable: true,
        description: "Enhanced and strengthened",
      },
      {
        name: "Fortified",
        level: 6,
        durability: 100,
        repairable: true,
        description: "Maximum protection, expertly crafted",
      },
    ],
  },
  weapons: {
    name: "Weapons",
    statuses: [
      {
        name: "Ruined",
        level: 0,
        durability: 0,
        repairable: false,
        description: "Completely destroyed and unusable",
      },
      {
        name: "Blunted",
        level: 1,
        durability: 15,
        repairable: true,
        description: "Severely damaged, barely functional",
      },
      {
        name: "Nicked",
        level: 2,
        durability: 30,
        repairable: true,
        description: "Minor damage, reduced effectiveness",
      },
      {
        name: "Honed",
        level: 3,
        durability: 50,
        repairable: true,
        description: "Sharp and ready for combat",
      },
      {
        name: "Balanced",
        level: 4,
        durability: 70,
        repairable: true,
        description: "Well balanced, effective weapon",
      },
      {
        name: "Keen",
        level: 5,
        durability: 90,
        repairable: true,
        description: "Razor sharp, deadly effective",
      },
      {
        name: "Legendary",
        level: 6,
        durability: 100,
        repairable: true,
        description: "Mythical weapon of great power",
      },
    ],
  },
  general: {
    name: "General Items",
    statuses: [
      {
        name: "Destroyed",
        level: 0,
        durability: 0,
        repairable: false,
        description: "Completely destroyed and unusable",
      },
      {
        name: "Damaged",
        level: 1,
        durability: 15,
        repairable: true,
        description: "Severely damaged, barely functional",
      },
      {
        name: "Worn",
        level: 2,
        durability: 30,
        repairable: true,
        description: "Showing signs of wear and use",
      },
      {
        name: "Fair",
        level: 3,
        durability: 50,
        repairable: true,
        description: "Decent condition, functional",
      },
      {
        name: "Good",
        level: 4,
        durability: 70,
        repairable: true,
        description: "Well maintained, reliable",
      },
      {
        name: "Excellent",
        level: 5,
        durability: 90,
        repairable: true,
        description: "High quality, superior performance",
      },
      {
        name: "Pristine",
        level: 6,
        durability: 100,
        repairable: true,
        description: "Perfect condition, flawless",
      },
    ],
  },
};

// Material types with properties and equipment type restrictions
export const equipmentMaterials = {
  // Clothes materials
  cotton: {
    name: "Cotton",
    rarity: "common",
    durability: 30,
    weight: 1,
    cost: 1,
    description: "Soft cotton fabric, comfortable and breathable",
    color: "#F5F5DC",
    allowedTypes: ["clothes"],
  },
  silk: {
    name: "Silk",
    rarity: "uncommon",
    durability: 40,
    weight: 0.8,
    cost: 8,
    description: "Luxurious silk fabric, smooth and elegant",
    color: "#FFB6C1",
    allowedTypes: ["clothes"],
  },
  wool: {
    name: "Wool",
    rarity: "common",
    durability: 45,
    weight: 1.2,
    cost: 2,
    description: "Warm wool fabric, good insulation",
    color: "#DEB887",
    allowedTypes: ["clothes", "container"],
  },
  padded: {
    name: "Padded",
    rarity: "common",
    durability: 35,
    weight: 1.5,
    cost: 3,
    description: "Padded fabric with extra protection",
    color: "#D2B48C",
    allowedTypes: ["clothes", "armor"],
  },
  leather: {
    name: "Leather",
    rarity: "common",
    durability: 50,
    weight: 2,
    cost: 2,
    description: "Animal hide, flexible and moderately durable",
    color: "#A0522D",
    allowedTypes: ["clothes", "armor", "tool", "container"],
  },
  fur: {
    name: "Fur",
    rarity: "uncommon",
    durability: 40,
    weight: 1.8,
    cost: 5,
    description: "Animal fur, warm and insulating",
    color: "#8B4513",
    allowedTypes: ["clothes", "armor"],
  },
  gilded: {
    name: "Gilded",
    rarity: "rare",
    durability: 45,
    weight: 1.3,
    cost: 15,
    description: "Fabric with gold thread accents",
    color: "#FFD700",
    allowedTypes: ["clothes"],
  },

  // Armor materials
  bone: {
    name: "Bone",
    rarity: "common",
    durability: 35,
    weight: 1.5,
    cost: 2,
    description: "Hardened bone, lightweight protection",
    color: "#F5F5DC",
    allowedTypes: ["armor", "weapon1h", "weapon2h", "ranged", "shield"],
  },
  bronze: {
    name: "Bronze",
    rarity: "common",
    durability: 60,
    weight: 4,
    cost: 4,
    description: "Bronze alloy, good balance of strength and weight",
    color: "#CD7F32",
    allowedTypes: ["armor", "weapon1h", "weapon2h", "ranged", "shield"],
  },
  iron: {
    name: "Iron",
    rarity: "common",
    durability: 70,
    weight: 5,
    cost: 5,
    description: "Common metal, sturdy and reliable",
    color: "#696969",
    allowedTypes: [
      "armor",
      "weapon1h",
      "weapon2h",
      "ranged",
      "shields",
      "tools",
    ],
  },
  steel: {
    name: "Steel",
    rarity: "uncommon",
    durability: 85,
    weight: 6,
    cost: 10,
    description: "Refined iron alloy, stronger and more durable",
    color: "#708090",
    allowedTypes: [
      "armor",
      "weapon1h",
      "weapon2h",
      "ranged",
      "shields",
      "tools",
    ],
  },
  aurene: {
    name: "Aurene",
    rarity: "rare",
    durability: 80,
    weight: 3,
    cost: 30,
    description: "Rare golden metal, magical properties",
    color: "#FFD700",
    allowedTypes: ["armor", "weapon1h", "weapon2h", "ranged", "shield"],
  },
  obsura: {
    name: "Obsura",
    rarity: "rare",
    durability: 90,
    weight: 4,
    cost: 35,
    description: "Dark silver metal, mysterious properties",
    color: "#2F4F4F",
    allowedTypes: ["armor", "weapon1h", "weapon2h", "ranged", "shield"],
  },

  // Weapon materials
  wood: {
    name: "Wood",
    rarity: "common",
    durability: 30,
    weight: 1,
    cost: 1,
    description: "General wood, light but not very durable",
    color: "#8B4513",
    allowedTypes: ["weapon1h", "weapon2h", "ranged", "shield", "tool"],
  },
  oak: {
    name: "Oak",
    rarity: "common",
    durability: 40,
    weight: 1.2,
    cost: 1.5,
    description: "Oak wood, strong and durable",
    color: "#8B4513",
    allowedTypes: ["weapon1h", "weapon2h", "ranged", "shield", "tool"],
  },
  pine: {
    name: "Pine",
    rarity: "common",
    durability: 25,
    weight: 0.8,
    cost: 1,
    description: "Pine wood, light but not very durable",
    color: "#8B4513",
    allowedTypes: ["weapon1h", "weapon2h", "ranged", "shield", "tool"],
  },
  birch: {
    name: "Birch",
    rarity: "common",
    durability: 35,
    weight: 1,
    cost: 1.2,
    description: "Birch wood, flexible and light",
    color: "#8B4513",
    allowedTypes: ["weapon1h", "weapon2h", "ranged", "shield", "tool"],
  },
  maple: {
    name: "Maple",
    rarity: "uncommon",
    durability: 45,
    weight: 1.1,
    cost: 2,
    description: "Maple wood, excellent balance and strength",
    color: "#8B4513",
    allowedTypes: ["weapon1h", "weapon2h", "ranged", "shield", "tool"],
  },

  // Container materials
  canvas: {
    name: "Canvas",
    rarity: "common",
    durability: 40,
    weight: 1.5,
    cost: 2,
    description: "Heavy canvas fabric, durable for containers",
    color: "#D2B48C",
    allowedTypes: ["container"],
  },
  hemp: {
    name: "Hemp",
    rarity: "common",
    durability: 35,
    weight: 1.2,
    cost: 1.5,
    description: "Hemp fiber, strong and flexible",
    color: "#D2B48C",
    allowedTypes: ["container"],
  },
  // Tool materials
  copper: {
    name: "Copper",
    rarity: "common",
    durability: 50,
    weight: 3,
    cost: 3,
    description: "Soft metal, good for tools and utensils",
    color: "#B87333",
    allowedTypes: ["tool"],
  },
  brass: {
    name: "Brass",
    rarity: "common",
    durability: 55,
    weight: 3.5,
    cost: 4,
    description: "Copper-zinc alloy, durable and corrosion-resistant",
    color: "#B87333",
    allowedTypes: ["tool"],
  },
  tin: {
    name: "Tin",
    rarity: "common",
    durability: 40,
    weight: 2.5,
    cost: 2,
    description: "Soft metal, easy to work with",
    color: "#C0C0C0",
    allowedTypes: ["tool"],
  },
};

// Rarity levels
export const equipmentRarity = {
  scrap: {
    name: "Scrap",
    rarity: "common",
    multiplier: 0.3,
    description: "Broken and barely functional",
    color: "#8B4513",
  },
  improvised: {
    name: "Improvised",
    rarity: "common",
    multiplier: 0.5,
    description: "Crudely made, basic functionality",
    color: "#A0522D",
  },
  poor: {
    name: "Poor",
    rarity: "common",
    multiplier: 0.7,
    description: "Low quality, basic functionality",
    color: "#8B4513",
  },
  common: {
    name: "Common",
    rarity: "common",
    multiplier: 1.0,
    description: "Standard quality, reliable performance",
    color: "#808080",
  },
  fine: {
    name: "Fine",
    rarity: "uncommon",
    multiplier: 1.3,
    description: "Well-crafted, good quality",
    color: "#32CD32",
  },
  noble: {
    name: "Noble",
    rarity: "uncommon",
    multiplier: 1.6,
    description: "High quality, superior craftsmanship",
    color: "#4169E1",
  },
  legendary: {
    name: "Legendary",
    rarity: "rare",
    multiplier: 2.0,
    description: "Exceptional quality, masterwork craftsmanship",
    color: "#FF8C00",
  },
  mythic: {
    name: "Mythic",
    rarity: "legendary",
    multiplier: 3.0,
    description: "Mythical quality, otherworldly perfection",
    color: "#FF1493",
  },
};

// Equipment types and slots
export const equipmentTypes = {
  clothes: {
    name: "Clothes",
    slot: "clothes",
    statusType: "clothes",
    description: "Everyday clothing and garments",
    skillBonuses: {
      persuasion: 0.5,
      performance: 0.5,
    },
    items: [
      "commoner-clothes",
      "noble-clothes",
      "traveler-clothes",
      "merchant-clothes",
      "scholar-robes",
      "peasant-garb",
      "court-attire",
      "work-clothes",
    ],
  },
  armor: {
    name: "Armor",
    slot: "armor",
    statusType: "armor",
    description: "Protective clothing and armor",
    skillBonuses: {
      shieldwork: 1,
      survival: 0.5,
    },
    items: [
      "chainmail-armor",
      "plate-armor",
      "leather-armor",
      "studded-armor",
      "scale-armor",
      "ring-mail",
      "splint-mail",
      "brigandine",
    ],
  },
  weapon1h: {
    name: "One-Handed Weapon",
    slot: "weapon",
    statusType: "weapons",
    description: "One-handed weapons for combat",
    skillBonuses: {
      swordfighting: 1,
      unarmed: 0.5,
    },
    items: [
      "sword",
      "dagger",
      "mace",
      "axe",
      "club",
      "rapier",
      "scimitar",
      "shortsword",
      "warhammer",
      "flail",
      "sickle",
    ],
  },
  weapon2h: {
    name: "Two-Handed Weapon",
    slot: "back",
    statusType: "weapons",
    description: "Two-handed weapons for combat",
    skillBonuses: {
      swordfighting: 1.5,
      polearms: 1,
    },
    items: [
      "greatsword",
      "greataxe",
      "spear",
      "halberd",
      "poleaxe",
      "staff",
      "quarterstaff",
      "scythe",
      "maul",
      "battleaxe",
    ],
  },
  ranged: {
    name: "Ranged Weapon",
    slot: "back",
    statusType: "weapons",
    description: "Ranged weapons for combat",
    skillBonuses: {
      archery: 1.5,
      tracking: 0.5,
    },
    items: [
      "longbow",
      "shortbow",
      "crossbow",
      "sling",
      "javelin",
      "throwing-axe",
      "throwing-knife",
    ],
  },
  shield: {
    name: "Shield",
    slot: "secondHand",
    statusType: "armor",
    description: "Protective shields",
    skillBonuses: {
      shieldwork: 2,
      tactics: 0.5,
    },
    items: ["buckler", "shield", "tower-shield", "kite-shield", "round-shield"],
  },
  container: {
    name: "Container",
    slot: "back",
    statusType: "general",
    description: "Storage containers and packs",
    skillBonuses: {
      survival: 0.5,
      bartering: 0.5,
    },
    items: [
      "coin-purse",
      "belt-pouch",
      "satchel",
      "sack",
      "knapsack",
      "backpack",
      "haversack",
      "rucksack",
      "traveler-pack",
      "wayfarer-chest",
    ],
    containerSlots: {
      "coin-purse": 1,
      "belt-pouch": 2,
      satchel: 3,
      sack: 4,
      knapsack: 5,
      backpack: 6,
      haversack: 7,
      rucksack: 8,
      "traveler-pack": 10,
      "wayfarer-chest": 12,
    },
  },
  tool: {
    name: "Tool",
    slot: "tool",
    statusType: "general",
    description: "Tools and utility items",
    skillBonuses: {
      blacksmithing: 1,
      carpentry: 1,
      leatherworking: 1,
      tailoring: 1,
      cooking: 1,
      herbalism: 1,
      mining: 1,
      stonework: 1,
    },
    items: [
      "rope",
      "quiver",
      "arrows",
      "grappling-hook",
      "prayer-beads",
      "incense",
      "holy-symbol",
      "prayer-book",
      "crystals",
      "mining-pick",
      "phoenix-feathers",
      "fire-crystals",
      "skull",
      "bone-chalk",
      "ice-crystals",
      "frost-gem",
      "training-weights",
      "meditation-mat",
      "tracking-kit",
      "survival-gear",
      "map",
      "compass",
      "journal",
      "blessed-water",
      "alchemy-kit",
      "potion-belt",
      "herb-pouch",
      "gardening-tools",
      "herbalist-kit",
      "blacksmithing-kit",
      "alchemy-kit",
      "leatherworking-kit",
      "tailoring-kit",
      "carpentry-kit",
      "trader-kit",
      "dungeondiver-kit",
      "explorer-kit",
      "geomancer-kit",
      "pyromancer-kit",
      "articaster-kit",
      "necromancer-kit",
      "meditation-kit",
      "traps",
      "lockpicks",
      "torch",
      "smithing-tools",
      "workshop-kit",
      "whetstone",
      // Skill Kits
      "sword-kit",
      "archery-kit",
      "polearm-kit",
      "shield-kit",
      "tactics-manual",
      "intimidation-tools",
      "leatherworking-tools",
      "tailoring-kit",
      "cooking-kit",
      "stonework-tools",
      "stealth-kit",
      "merchant-kit",
      "healing-kit",
      "acrobatics-gear",
      "nature-totem",
      "earth-stones",
      "general-tools",
      // Exploration Skill Kits
      "navigation-kit",
      "cartography-kit",
      "climbing-gear",
      "swimming-gear",
      "scouting-kit",
      // Social Skill Kits
      "diplomacy-kit",
      "animal-handling-kit",
      "trap-disarming-kit",
      "lore-books",
      "investigation-kit",
      "insight-tools",
      "performance-kit",
      "deception-tools",
      "sleight-of-hand-kit",
      // Crafting Skill Kits
      "jewelcrafting-tools",
      "enchanting-kit",
      "carpentry-tools",
      "scribing-kit",
      "persuasion-tools",
      // Magic Skill Kits
      "ice-crystals",
    ],
  },
  accessory: {
    name: "Accessory",
    slot: "accessory",
    statusType: "general",
    description: "Jewelry and magical accessories",
    skillBonuses: {
      jewelcrafting: 1,
      enchanting: 1,
      performance: 1,
      persuasion: 0.5,
    },
    items: [
      "ring",
      "amulet",
      "bracelet",
      "necklace",
      "earring",
      "brooch",
      "pendant",
      "charm",
      "talisman",
      "crown",
      "circlet",
      "cloak",
      "cape",
      "belt",
      "gloves",
      "boots",
    ],
  },
};

// Equipment database with specific items
export const equipmentDatabase = {
  // ARMOR ITEMS
  chainmail: {
    name: "Chainmail",
    type: "armor",
    baseDurability: 80,
    baseWeight: 15,
    baseCost: 50,
    skillBonuses: {
      shieldwork: 2,
      survival: 1,
    },
    materials: ["iron", "steel", "mithril"],
    description: "Interlocked metal rings providing good protection",
  },
  plate: {
    name: "Plate Armor",
    type: "armor",
    baseDurability: 100,
    baseWeight: 25,
    baseCost: 100,
    skillBonuses: {
      shieldwork: 3,
      intimidation: 1,
    },
    materials: ["steel", "mithril"],
    description: "Heavy metal plates offering maximum protection",
  },
  leather: {
    name: "Leather Armor",
    type: "armor",
    baseDurability: 60,
    baseWeight: 8,
    baseCost: 20,
    skillBonuses: {
      stealth: 1,
      survival: 1,
    },
    materials: ["leather"],
    description: "Flexible leather protection allowing mobility",
  },
  robes: {
    name: "Robes",
    type: "armor",
    baseDurability: 40,
    baseWeight: 3,
    baseCost: 15,
    skillBonuses: {
      meditation: 2,
      divine_magic: 1,
    },
    materials: ["cloth", "leather"],
    description: "Simple robes favored by scholars and mages",
  },

  // WEAPON ITEMS
  longsword: {
    name: "Longsword",
    type: "weapon",
    baseDurability: 90,
    baseWeight: 4,
    baseCost: 30,
    skillBonuses: {
      swordfighting: 3,
      tactics: 1,
    },
    materials: ["iron", "steel", "silver", "mithril"],
    description: "A versatile one-handed sword",
  },
  battleaxe: {
    name: "Battleaxe",
    type: "weapon",
    baseDurability: 85,
    baseWeight: 6,
    baseCost: 25,
    skillBonuses: {
      swordfighting: 2,
      intimidation: 2,
    },
    materials: ["iron", "steel", "mithril"],
    description: "A heavy axe designed for combat",
  },
  longbow: {
    name: "Longbow",
    type: "weapon",
    baseDurability: 70,
    baseWeight: 3,
    baseCost: 40,
    skillBonuses: {
      archery: 3,
      tracking: 1,
    },
    materials: ["leather", "iron", "steel"],
    description: "A powerful bow for long-range combat",
  },
  quarterstaff: {
    name: "Quarterstaff",
    type: "weapon",
    baseDurability: 75,
    baseWeight: 4,
    baseCost: 10,
    skillBonuses: {
      unarmed: 2,
      meditation: 1,
    },
    materials: ["leather", "iron"],
    description: "A simple but effective staff weapon",
  },

  // TOOL ITEMS
  backpack: {
    name: "Backpack",
    type: "tool",
    baseDurability: 60,
    baseWeight: 2,
    baseCost: 5,
    skillBonuses: {
      survival: 1,
      bartering: 0.5,
    },
    materials: ["cloth", "leather"],
    description: "A sturdy pack for carrying supplies",
  },
  alchemy_kit: {
    name: "Alchemy Kit",
    type: "tool",
    baseDurability: 80,
    baseWeight: 5,
    baseCost: 50,
    skillBonuses: {
      alchemy: 3,
      investigation: 1,
    },
    materials: ["iron", "steel"],
    description: "Tools and equipment for alchemical work",
  },
  lockpicks: {
    name: "Lockpicks",
    type: "tool",
    baseDurability: 40,
    baseWeight: 0.5,
    baseCost: 20,
    skillBonuses: {
      lockpicking: 2,
      stealth: 1,
    },
    materials: ["iron", "steel"],
    description: "Delicate tools for opening locks",
  },

  // ACCESSORY ITEMS
  ring: {
    name: "Ring",
    type: "accessory",
    baseDurability: 100,
    baseWeight: 0.1,
    baseCost: 10,
    skillBonuses: {
      persuasion: 1,
      performance: 1,
    },
    materials: ["silver", "gold", "mithril"],
    description: "A decorative ring that may have magical properties",
  },
  amulet: {
    name: "Amulet",
    type: "accessory",
    baseDurability: 90,
    baseWeight: 0.5,
    baseCost: 25,
    skillBonuses: {
      divine_magic: 2,
      healing: 1,
    },
    materials: ["silver", "gold", "mithril"],
    description: "A protective amulet with divine properties",
  },

  // SKILL KITS
  sword_kit: {
    name: "Sword Training Kit",
    type: "tool",
    baseDurability: 80,
    baseWeight: 3,
    baseCost: 15,
    skillBonuses: {
      swordfighting: 2,
      tactics: 1,
    },
    materials: ["leather", "iron", "steel"],
    description: "Training equipment for swordfighting practice",
  },
  archery_kit: {
    name: "Archery Kit",
    type: "tool",
    baseDurability: 70,
    baseWeight: 2,
    baseCost: 20,
    skillBonuses: {
      archery: 2,
      tracking: 1,
    },
    materials: ["leather", "iron"],
    description: "Equipment for archery training and practice",
  },
  polearm_kit: {
    name: "Polearm Training Kit",
    type: "tool",
    baseDurability: 75,
    baseWeight: 4,
    baseCost: 18,
    skillBonuses: {
      polearms: 2,
      tactics: 1,
    },
    materials: ["leather", "iron"],
    description: "Training equipment for polearm combat",
  },
  shield_kit: {
    name: "Shield Training Kit",
    type: "tool",
    baseDurability: 85,
    baseWeight: 3,
    baseCost: 16,
    skillBonuses: {
      shieldwork: 2,
      tactics: 1,
    },
    materials: ["leather", "iron"],
    description: "Training equipment for shield combat",
  },
  tactics_manual: {
    name: "Tactics Manual",
    type: "tool",
    baseDurability: 100,
    baseWeight: 1,
    baseCost: 25,
    skillBonuses: {
      tactics: 3,
      intimidation: 1,
    },
    materials: ["cloth", "leather"],
    description: "A comprehensive guide to military tactics",
  },
  intimidation_tools: {
    name: "Intimidation Tools",
    type: "tool",
    baseDurability: 60,
    baseWeight: 2,
    baseCost: 12,
    skillBonuses: {
      intimidation: 2,
      persuasion: 1,
    },
    materials: ["iron", "leather"],
    description: "Tools and props for intimidation tactics",
  },
  leatherworking_tools: {
    name: "Leatherworking Tools",
    type: "tool",
    baseDurability: 80,
    baseWeight: 3,
    baseCost: 20,
    skillBonuses: {
      leatherworking: 2,
      tailoring: 1,
    },
    materials: ["iron", "steel"],
    description: "Professional tools for leatherworking",
  },
  tailoring_kit: {
    name: "Tailoring Kit",
    type: "tool",
    baseDurability: 70,
    baseWeight: 2,
    baseCost: 15,
    skillBonuses: {
      tailoring: 2,
      leatherworking: 1,
    },
    materials: ["iron", "cloth"],
    description: "Tools and materials for tailoring work",
  },
  cooking_kit: {
    name: "Cooking Kit",
    type: "tool",
    baseDurability: 75,
    baseWeight: 4,
    baseCost: 18,
    skillBonuses: {
      cooking: 2,
      herbalism: 1,
    },
    materials: ["iron", "leather"],
    description: "Complete cooking equipment and utensils",
  },
  stonework_tools: {
    name: "Stonework Tools",
    type: "tool",
    baseDurability: 90,
    baseWeight: 5,
    baseCost: 22,
    skillBonuses: {
      stonework: 2,
      mining: 1,
    },
    materials: ["iron", "steel"],
    description: "Heavy tools for stonework and masonry",
  },
  stealth_kit: {
    name: "Stealth Kit",
    type: "tool",
    baseDurability: 65,
    baseWeight: 1,
    baseCost: 20,
    skillBonuses: {
      stealth: 2,
      lockpicking: 1,
    },
    materials: ["leather", "cloth"],
    description: "Tools and equipment for stealth operations",
  },
  merchant_kit: {
    name: "Merchant Kit",
    type: "tool",
    baseDurability: 80,
    baseWeight: 2,
    baseCost: 25,
    skillBonuses: {
      bartering: 2,
      persuasion: 1,
    },
    materials: ["leather", "cloth"],
    description: "Tools and scales for merchant activities",
  },
  healing_kit: {
    name: "Healing Kit",
    type: "tool",
    baseDurability: 70,
    baseWeight: 2,
    baseCost: 30,
    skillBonuses: {
      healing: 2,
      herbalism: 1,
    },
    materials: ["leather", "cloth"],
    description: "Medical supplies and healing equipment",
  },
  acrobatics_gear: {
    name: "Acrobatics Gear",
    type: "tool",
    baseDurability: 60,
    baseWeight: 1,
    baseCost: 15,
    skillBonuses: {
      acrobatics: 2,
      unarmed: 1,
    },
    materials: ["leather", "cloth"],
    description: "Lightweight gear for acrobatic training",
  },
  nature_totem: {
    name: "Nature Totem",
    type: "tool",
    baseDurability: 85,
    baseWeight: 2,
    baseCost: 20,
    skillBonuses: {
      nature_magic: 2,
      herbalism: 1,
    },
    materials: ["leather", "cloth"],
    description: "A mystical totem for nature magic practice",
  },
  earth_stones: {
    name: "Earth Stones",
    type: "tool",
    baseDurability: 100,
    baseWeight: 3,
    baseCost: 18,
    skillBonuses: {
      earth_magic: 2,
      mining: 1,
    },
    materials: ["iron", "steel"],
    description: "Magical stones attuned to earth energy",
  },
  general_tools: {
    name: "General Tools",
    type: "tool",
    baseDurability: 70,
    baseWeight: 3,
    baseCost: 10,
    skillBonuses: {
      blacksmithing: 1,
      carpentry: 1,
    },
    materials: ["iron", "leather"],
    description: "Basic tools for general crafting work",
  },

  // EXPLORATION SKILL KITS
  navigation_kit: {
    name: "Navigation Kit",
    type: "tool",
    baseDurability: 80,
    baseWeight: 2,
    baseCost: 20,
    skillBonuses: {
      navigation: 2,
      cartography: 1,
    },
    materials: ["iron", "leather"],
    description: "Compass, maps, and tools for finding your way",
  },
  cartography_kit: {
    name: "Cartography Kit",
    type: "tool",
    baseDurability: 75,
    baseWeight: 2,
    baseCost: 25,
    skillBonuses: {
      cartography: 2,
      lore_knowledge: 1,
    },
    materials: ["cloth", "leather"],
    description: "Tools for creating and studying maps",
  },
  climbing_gear: {
    name: "Climbing Gear",
    type: "tool",
    baseDurability: 85,
    baseWeight: 4,
    baseCost: 30,
    skillBonuses: {
      climbing: 2,
      acrobatics: 1,
    },
    materials: ["leather", "iron"],
    description: "Ropes, hooks, and equipment for scaling heights",
  },
  swimming_gear: {
    name: "Swimming Gear",
    type: "tool",
    baseDurability: 70,
    baseWeight: 2,
    baseCost: 15,
    skillBonuses: {
      swimming: 2,
      survival: 1,
    },
    materials: ["leather", "cloth"],
    description: "Equipment for aquatic activities and water survival",
  },
  scouting_kit: {
    name: "Scouting Kit",
    type: "tool",
    baseDurability: 75,
    baseWeight: 2,
    baseCost: 22,
    skillBonuses: {
      scouting: 2,
      stealth: 1,
    },
    materials: ["leather", "cloth"],
    description: "Tools for reconnaissance and intelligence gathering",
  },

  // SOCIAL SKILL KITS
  diplomacy_kit: {
    name: "Diplomacy Kit",
    type: "tool",
    baseDurability: 90,
    baseWeight: 1,
    baseCost: 35,
    skillBonuses: {
      diplomacy: 2,
      persuasion: 1,
    },
    materials: ["cloth", "leather"],
    description: "Documents, seals, and tools for diplomatic negotiations",
  },
  animal_handling_kit: {
    name: "Animal Handling Kit",
    type: "tool",
    baseDurability: 80,
    baseWeight: 3,
    baseCost: 20,
    skillBonuses: {
      animal_handling: 2,
      survival: 1,
    },
    materials: ["leather", "cloth"],
    description: "Tools and treats for working with animals",
  },
  trap_disarming_kit: {
    name: "Trap Disarming Kit",
    type: "tool",
    baseDurability: 70,
    baseWeight: 2,
    baseCost: 25,
    skillBonuses: {
      trap_disarming: 2,
      investigation: 1,
    },
    materials: ["iron", "steel"],
    description: "Delicate tools for identifying and disabling traps",
  },
  lore_books: {
    name: "Lore Books",
    type: "tool",
    baseDurability: 100,
    baseWeight: 2,
    baseCost: 30,
    skillBonuses: {
      lore_knowledge: 2,
      investigation: 1,
    },
    materials: ["cloth", "leather"],
    description: "Ancient texts and historical documents",
  },
  investigation_kit: {
    name: "Investigation Kit",
    type: "tool",
    baseDurability: 75,
    baseWeight: 2,
    baseCost: 28,
    skillBonuses: {
      investigation: 2,
      insight: 1,
    },
    materials: ["iron", "cloth"],
    description: "Tools for gathering clues and analyzing evidence",
  },
  insight_tools: {
    name: "Insight Tools",
    type: "tool",
    baseDurability: 80,
    baseWeight: 1,
    baseCost: 20,
    skillBonuses: {
      insight: 2,
      diplomacy: 1,
    },
    materials: ["cloth", "leather"],
    description: "Tools for reading people and understanding motives",
  },
  performance_kit: {
    name: "Performance Kit",
    type: "tool",
    baseDurability: 70,
    baseWeight: 3,
    baseCost: 18,
    skillBonuses: {
      performance: 2,
      persuasion: 1,
    },
    materials: ["cloth", "leather"],
    description: "Instruments and props for entertaining audiences",
  },
  deception_tools: {
    name: "Deception Tools",
    type: "tool",
    baseDurability: 65,
    baseWeight: 1,
    baseCost: 15,
    skillBonuses: {
      deception: 2,
      sleight_of_hand: 1,
    },
    materials: ["cloth", "leather"],
    description: "Props and tools for misleading others",
  },
  sleight_of_hand_kit: {
    name: "Sleight of Hand Kit",
    type: "tool",
    baseDurability: 60,
    baseWeight: 1,
    baseCost: 20,
    skillBonuses: {
      sleight_of_hand: 2,
      stealth: 1,
    },
    materials: ["leather", "cloth"],
    description: "Tools for performing tricks and manipulating objects",
  },

  // CRAFTING SKILL KITS
  jewelcrafting_tools: {
    name: "Jewelcrafting Tools",
    type: "tool",
    baseDurability: 85,
    baseWeight: 2,
    baseCost: 40,
    skillBonuses: {
      jewelcrafting: 2,
      enchanting: 1,
    },
    materials: ["iron", "steel"],
    description: "Precision tools for working with gems and jewelry",
  },
  enchanting_kit: {
    name: "Enchanting Kit",
    type: "tool",
    baseDurability: 90,
    baseWeight: 3,
    baseCost: 50,
    skillBonuses: {
      enchanting: 2,
      lore_knowledge: 1,
    },
    materials: ["iron", "cloth"],
    description: "Magical tools for imbuing items with power",
  },
  carpentry_tools: {
    name: "Carpentry Tools",
    type: "tool",
    baseDurability: 80,
    baseWeight: 4,
    baseCost: 18,
    skillBonuses: {
      carpentry: 2,
      blacksmithing: 1,
    },
    materials: ["iron", "leather"],
    description: "Tools for working with wood and creating structures",
  },
  scribing_kit: {
    name: "Scribing Kit",
    type: "tool",
    baseDurability: 75,
    baseWeight: 2,
    baseCost: 22,
    skillBonuses: {
      scribing: 2,
      lore_knowledge: 1,
    },
    materials: ["cloth", "leather"],
    description: "Writing materials and tools for creating documents",
  },
  persuasion_tools: {
    name: "Persuasion Tools",
    type: "tool",
    baseDurability: 80,
    baseWeight: 1,
    baseCost: 20,
    skillBonuses: {
      persuasion: 2,
      diplomacy: 1,
    },
    materials: ["cloth", "leather"],
    description: "Tools and materials for convincing others",
  },

  // COMPREHENSIVE CLASS KITS
  herbalist_kit: {
    name: "Herbalist Kit",
    type: "tool",
    baseDurability: 90,
    baseWeight: 8,
    baseCost: 45,
    skillBonuses: {
      herbalism: 3,
      healing: 2,
      nature_magic: 1,
      survival: 1,
    },
    materials: ["leather", "cloth", "wood", "iron"],
    description:
      "A comprehensive kit containing basket, scythe, leather gloves, herb bags, drying racks, mortar and pestle, and field guides for safe herb harvesting",
  },
  blacksmithing_kit: {
    name: "Blacksmithing Kit",
    type: "tool",
    baseDurability: 95,
    baseWeight: 15,
    baseCost: 70,
    skillBonuses: {
      blacksmithing: 4,
      mining: 1,
    },
    materials: ["iron", "steel", "leather"],
    description:
      "A complete forge kit with tongs, hammer, flint and steel, bellows, anvil tools, quenching tank, and metalworking implements",
  },
  alchemy_kit: {
    name: "Alchemy Kit",
    type: "tool",
    baseDurability: 85,
    baseWeight: 6,
    baseCost: 55,
    skillBonuses: {
      alchemy: 4,
      investigation: 1,
    },
    materials: ["glass", "silver", "crystal", "leather"],
    description:
      "A complete alchemical laboratory with alembic, mortar and pestle, phials, retort, distillation apparatus, and chemical components",
  },
  leatherworking_kit: {
    name: "Leatherworking Kit",
    type: "tool",
    baseDurability: 80,
    baseWeight: 5,
    baseCost: 35,
    skillBonuses: {
      leatherworking: 4,
      tailoring: 1,
    },
    materials: ["leather", "iron", "wood"],
    description:
      "A leatherworker's toolkit with awls, needles, thread, cutting knives, leather stamps, and tanning tools",
  },
  tailoring_kit: {
    name: "Tailoring Kit",
    type: "tool",
    baseDurability: 75,
    baseWeight: 3,
    baseCost: 30,
    skillBonuses: {
      tailoring: 4,
      leatherworking: 1,
    },
    materials: ["cloth", "thread", "wood", "iron"],
    description:
      "A tailor's complete kit with needles, thread, scissors, measuring tools, patterns, and fabric samples",
  },
  carpentry_kit: {
    name: "Carpentry Kit",
    type: "tool",
    baseDurability: 90,
    baseWeight: 8,
    baseCost: 40,
    skillBonuses: {
      carpentry: 4,
      stonework: 1,
    },
    materials: ["wood", "iron", "steel"],
    description:
      "A carpenter's toolkit with saws, chisels, planes, measuring tools, clamps, and woodworking implements",
  },
  trader_kit: {
    name: "Trader Kit",
    type: "tool",
    baseDurability: 85,
    baseWeight: 4,
    baseCost: 50,
    skillBonuses: {
      bartering: 4,
      investigation: 2,
      persuasion: 1,
    },
    materials: ["wood", "iron", "glass", "leather"],
    description:
      "A merchant's kit with precision weights, measurement tools, inspection glasses, scales, coin scales, and appraisal tools",
  },
  dungeondiver_kit: {
    name: "Dungeondiver Kit",
    type: "tool",
    baseDurability: 80,
    baseWeight: 7,
    baseCost: 45,
    skillBonuses: {
      lockpicking: 4,
      trap_disarming: 3,
      investigation: 2,
      survival: 1,
    },
    materials: ["iron", "steel", "leather", "wood"],
    description:
      "A professional adventurer's kit with lockpicks, trap disarming tools, rope, grappling hook, torch, investigation tools, and survival gear",
  },
  explorer_kit: {
    name: "Explorer Kit",
    type: "tool",
    baseDurability: 85,
    baseWeight: 6,
    baseCost: 35,
    skillBonuses: {
      navigation: 3,
      survival: 2,
      investigation: 2,
      lore_knowledge: 1,
    },
    materials: ["leather", "cloth", "wood", "iron"],
    description:
      "An adventurer's kit with maps, compass, journal, rope, grappling hook, torch, lockpicks, and investigation tools",
  },
  geomancer_kit: {
    name: "Geomancer Kit",
    type: "tool",
    baseDurability: 90,
    baseWeight: 8,
    baseCost: 60,
    skillBonuses: {
      earth_magic: 4,
      mining: 2,
      stonework: 1,
    },
    materials: ["stone", "crystal", "iron", "leather"],
    description:
      "A geomancer's toolkit with earth stones, crystal formations, geological hammer, stone chisels, mineral samples, and the Tome of Stonebinding",
  },
  pyromancer_kit: {
    name: "Pyromancer Kit",
    type: "tool",
    baseDurability: 85,
    baseWeight: 5,
    baseCost: 65,
    skillBonuses: {
      fire_magic: 4,
      alchemy: 2,
      intimidation: 1,
    },
    materials: ["crystal", "phoenix_feathers", "cloth", "leather"],
    description:
      "A pyromancer's kit with reagents pouch, phoenix feathers, fire crystals, spellbook 'Tome of the Primal Flame', sulfur, charcoal, and flame-resistant gloves",
  },
  articaster_kit: {
    name: "Articaster Kit",
    type: "tool",
    baseDurability: 80,
    baseWeight: 4,
    baseCost: 55,
    skillBonuses: {
      ice_magic: 4,
      meditation: 2,
      survival: 1,
    },
    materials: ["crystal", "frost_gem", "cloth", "leather"],
    description:
      "An articaster's kit with ice crystals, frost gems, frozen reagents, spellbook 'Tome of Eternal Winter', snow quartz, and cold-resistant containers",
  },
  necromancer_kit: {
    name: "Necromancer Kit",
    type: "tool",
    baseDurability: 75,
    baseWeight: 6,
    baseCost: 70,
    skillBonuses: {
      death_magic: 4,
      lore_knowledge: 2,
      investigation: 1,
    },
    materials: ["bone", "skull", "cloth", "leather"],
    description:
      "A necromancer's kit with bone chalk, skull focus, death reagents, spellbook 'Tome of the Grave', grave dust, black candles, and bone-carved tools",
  },
  meditation_kit: {
    name: "Meditation Kit",
    type: "tool",
    baseDurability: 85,
    baseWeight: 3,
    baseCost: 25,
    skillBonuses: {
      meditation: 3,
      healing: 2,
      divine_magic: 1,
      nature_magic: 1,
    },
    materials: ["cloth", "leather", "wood", "crystal"],
    description:
      "A spiritual kit containing prayer beads, incense, meditation mat, candles, holy symbols, and sacred texts",
  },
};

// Equipment set bonuses
export const equipmentSetBonuses = {
  warrior_set: {
    name: "Warrior's Set",
    pieces: ["plate", "longsword", "shield"],
    bonus: {
      swordfighting: 2,
      shieldwork: 2,
      tactics: 1,
    },
    description: "Complete warrior equipment provides combat synergy",
  },
  mage_set: {
    name: "Mage's Set",
    pieces: ["robes", "staff", "amulet"],
    bonus: {
      divine_magic: 2,
      meditation: 2,
      enchanting: 1,
    },
    description: "Mage equipment enhances magical abilities",
  },
  ranger_set: {
    name: "Ranger's Set",
    pieces: ["leather", "longbow", "backpack"],
    bonus: {
      archery: 2,
      tracking: 2,
      survival: 1,
    },
    description: "Ranger equipment improves wilderness skills",
  },
};

// Helper functions
export function getEquipmentDatabase() {
  return equipmentDatabase;
}

export function getEquipmentByName(equipmentName) {
  return equipmentDatabase[equipmentName] || null;
}

export function getEquipmentStatus(statusType, level) {
  const statusData = equipmentStatus[statusType];
  if (!statusData) return null;

  return (
    statusData.statuses.find((status) => status.level === level) ||
    statusData.statuses[0]
  );
}

export function getEquipmentMaterial(materialName) {
  return equipmentMaterials[materialName] || null;
}

export function getEquipmentRarity(rarityName) {
  return equipmentRarity[rarityName] || null;
}

export function getEquipmentType(typeName) {
  return equipmentTypes[typeName] || null;
}

// Equipment parsing and creation functions
export function parseEquipmentString(equipmentString) {
  // Format: "status material rarity [type]"
  const bracketMatch = equipmentString.match(
    /^(.+?)\s+(.+?)\s+(.+?)\s+\[(.+?)\]$/
  );
  if (!bracketMatch) return null;

  const [, status, material, rarity, type] = bracketMatch;

  return {
    status: status.trim(),
    material: material.trim(),
    rarity: rarity.trim(),
    type: type.trim(),
    fullString: equipmentString,
  };
}

export function createEquipmentString(status, material, rarity, type) {
  return `${status} ${material} ${rarity} [${type}]`;
}

export function generateRandomEquipment(equipmentType, rarity = "common") {
  const typeData = equipmentTypes[equipmentType];
  if (!typeData) return null;

  // Get random item from type
  const items = typeData.items;
  const randomItem = items[Math.floor(Math.random() * items.length)];

  // Get random status (avoiding destroyed/shattered for new equipment)
  const statusData = equipmentStatus[typeData.statusType];
  const availableStatuses = statusData.statuses.filter((s) => s.level >= 3);
  const randomStatus =
    availableStatuses[Math.floor(Math.random() * availableStatuses.length)];

  // Get random material based on equipment type restrictions
  const materials = Object.keys(equipmentMaterials);
  const allowedMaterials = materials.filter((m) =>
    equipmentMaterials[m].allowedTypes?.includes(equipmentType)
  );
  const randomMaterial =
    allowedMaterials[Math.floor(Math.random() * allowedMaterials.length)] ||
    materials[0];

  // Get random rarity based on rarity parameter
  const rarities = Object.keys(equipmentRarity);
  const rarityMaterials = rarities.filter(
    (r) => equipmentRarity[r].rarity === rarity
  );
  const randomRarity =
    rarityMaterials[Math.floor(Math.random() * rarityMaterials.length)] ||
    "common";

  return createEquipmentString(
    randomStatus.name,
    randomMaterial,
    randomRarity,
    randomItem
  );
}

// Equipment durability and repair functions
export function calculateEquipmentDurability(equipmentString) {
  const parsed = parseEquipmentString(equipmentString);
  if (!parsed) return 0;

  const item = getEquipmentByName(parsed.type);
  const material = getEquipmentMaterial(parsed.material);
  const rarity = getEquipmentRarity(parsed.rarity);
  const status = getEquipmentStatus(equipmentTypes[item?.type]?.statusType, 0);

  if (!item || !material || !rarity || !status) return 0;

  const baseDurability = item.baseDurability;
  const materialMultiplier = material.durability / 100;
  const rarityMultiplier = rarity.multiplier;
  const statusMultiplier = status.durability / 100;

  return Math.floor(
    baseDurability * materialMultiplier * rarityMultiplier * statusMultiplier
  );
}

export function degradeEquipment(equipmentString, amount = 1) {
  const parsed = parseEquipmentString(equipmentString);
  if (!parsed) return equipmentString;

  const typeData = equipmentTypes[parsed.type];
  if (!typeData) return equipmentString;

  const statusData = equipmentStatus[typeData.statusType];
  const currentStatus = statusData.statuses.find(
    (s) => s.name === parsed.status
  );

  if (!currentStatus || currentStatus.level <= 0) return equipmentString;

  const newLevel = Math.max(0, currentStatus.level - amount);
  const newStatus =
    statusData.statuses.find((s) => s.level === newLevel) ||
    statusData.statuses[0];

  return createEquipmentString(
    newStatus.name,
    parsed.material,
    parsed.rarity,
    parsed.type
  );
}

export function repairEquipment(equipmentString, repairLevel = 1) {
  const parsed = parseEquipmentString(equipmentString);
  if (!parsed) return equipmentString;

  const typeData = equipmentTypes[parsed.type];
  if (!typeData) return equipmentString;

  const statusData = equipmentStatus[typeData.statusType];
  const currentStatus = statusData.statuses.find(
    (s) => s.name === parsed.status
  );

  if (!currentStatus || !currentStatus.repairable) return equipmentString;

  const newLevel = Math.min(6, currentStatus.level + repairLevel);
  const newStatus =
    statusData.statuses.find((s) => s.level === newLevel) ||
    statusData.statuses[6];

  return createEquipmentString(
    newStatus.name,
    parsed.material,
    parsed.rarity,
    parsed.type
  );
}

// Equipment skill bonus calculations
export function calculateEquipmentSkillBonus(equipmentString, skillName) {
  const parsed = parseEquipmentString(equipmentString);
  if (!parsed) return 0;

  const item = getEquipmentByName(parsed.type);
  const rarity = getEquipmentRarity(parsed.rarity);

  if (!item || !rarity) return 0;

  const baseBonus = item.skillBonuses[skillName] || 0;
  const rarityMultiplier = rarity.multiplier;

  return Math.floor(baseBonus * rarityMultiplier);
}

export function calculateTotalEquipmentBonuses(characterEquipment, skillName) {
  let totalBonus = 0;

  Object.values(characterEquipment).forEach((equipmentString) => {
    if (equipmentString) {
      totalBonus += calculateEquipmentSkillBonus(equipmentString, skillName);
    }
  });

  return totalBonus;
}

// Equipment set bonus calculations
export function calculateSetBonuses(characterEquipment) {
  const equippedItems = Object.values(characterEquipment)
    .map((eq) => {
      const parsed = parseEquipmentString(eq);
      return parsed ? parsed.type : null;
    })
    .filter(Boolean);

  let setBonuses = {};

  Object.values(equipmentSetBonuses).forEach((set) => {
    const hasAllPieces = set.pieces.every((piece) =>
      equippedItems.includes(piece)
    );
    if (hasAllPieces) {
      Object.keys(set.bonus).forEach((skill) => {
        setBonuses[skill] = (setBonuses[skill] || 0) + set.bonus[skill];
      });
    }
  });

  return setBonuses;
}

// Equipment repair requirements
export function getRepairRequirements(equipmentString) {
  const parsed = parseEquipmentString(equipmentString);
  if (!parsed) return null;

  const item = getEquipmentByName(parsed.type);
  const material = getEquipmentMaterial(parsed.material);
  const status = getEquipmentStatus(equipmentTypes[item?.type]?.statusType, 0);

  if (!item || !material || !status) return null;

  return {
    materials: {
      [parsed.material]: Math.ceil(item.baseCost * 0.1),
    },
    time: Math.ceil(item.baseDurability * 0.1),
    skills: {
      blacksmithing: item.type === "weapon" || item.type === "armor" ? 1 : 0,
      tailoring: item.type === "armor" && parsed.material === "cloth" ? 1 : 0,
      leatherworking:
        item.type === "armor" && parsed.material === "leather" ? 1 : 0,
    },
    tools: status.level <= 1 ? "workshop" : "repair_kit",
  };
}

// Equipment value calculations
export function calculateEquipmentValue(equipmentString) {
  const parsed = parseEquipmentString(equipmentString);
  if (!parsed) return 0;

  const item = getEquipmentByName(parsed.type);
  const material = getEquipmentMaterial(parsed.material);
  const rarity = getEquipmentRarity(parsed.rarity);
  const status = getEquipmentStatus(equipmentTypes[item?.type]?.statusType, 0);

  if (!item || !material || !rarity || !status) return 0;

  const baseValue = item.baseCost;
  const materialMultiplier = material.cost;
  const rarityMultiplier = rarity.multiplier;
  const statusMultiplier = status.durability / 100;

  return Math.floor(
    baseValue * materialMultiplier * rarityMultiplier * statusMultiplier
  );
}

// Equipment weight calculations
export function calculateEquipmentWeight(equipmentString) {
  const parsed = parseEquipmentString(equipmentString);
  if (!parsed) return 0;

  const item = getEquipmentByName(parsed.type);
  const material = getEquipmentMaterial(parsed.material);

  if (!item || !material) return 0;

  const baseWeight = item.baseWeight;
  const materialMultiplier = material.weight / 5; // Normalize to base weight

  return Math.floor(baseWeight * materialMultiplier);
}

// Container system functions
export function getContainerSlots(containerType) {
  const containerData = equipmentTypes.container;
  if (!containerData || !containerData.containerSlots) return 0;

  return containerData.containerSlots[containerType] || 0;
}

export function isMaterialAllowedForType(materialName, equipmentType) {
  const material = getEquipmentMaterial(materialName);
  if (!material || !material.allowedTypes) return false;

  return material.allowedTypes.includes(equipmentType);
}

export function getValidMaterialsForType(equipmentType) {
  const materials = Object.keys(equipmentMaterials);
  return materials.filter((material) =>
    isMaterialAllowedForType(material, equipmentType)
  );
}

// Equipment slot management
export const equipmentSlots = {
  clothes: "clothes",
  armor: "armor",
  weapon: "weapon",
  secondHand: "secondHand",
  back: "back",
  tool: "tool",
  accessory: "accessory",
};

export function getEquipmentSlotForType(equipmentType) {
  const typeData = equipmentTypes[equipmentType];
  return typeData ? typeData.slot : null;
}

export function canEquipInSlot(equipmentString, slot) {
  const parsed = parseEquipmentString(equipmentString);
  if (!parsed) return false;

  // Find which equipment type this item belongs to
  for (const [typeName, typeData] of Object.entries(equipmentTypes)) {
    if (typeData.items.includes(parsed.type)) {
      return typeData.slot === slot;
    }
  }

  return false;
}
