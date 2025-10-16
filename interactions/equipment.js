// Equipment system for enhanced character progression
// Equipment has status/material/quality/type structure with durability and skill bonuses

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

// Material types with properties
export const equipmentMaterials = {
  pine_wood: {
    name: "Pine Wood",
    rarity: "common",
    durability: 30,
    weight: 1,
    cost: 1,
    description: "Pine wood, light but not very durable",
    color: "#8B4513",
  },
  oak_wood: {
    name: "Oak Wood",
    rarity: "common",
    durability: 30,
    weight: 1,
    cost: 1,
    description: "Oak wood, light but not very durable",
    color: "#8B4513",
  },
  birch_wood: {
    name: "Birch Wood",
    rarity: "common",
    durability: 30,
    weight: 1,
    cost: 1,
    description: "Birch wood, light but not very durable",
    color: "#8B4513",
  },
  cloth: {
    name: "Cloth",
    rarity: "common",
    durability: 30,
    weight: 1,
    cost: 1,
    description: "Cloth, light but not very durable",
    color: "#8B4513",
  },
  leather: {
    name: "Leather",
    rarity: "common",
    durability: 50,
    weight: 2,
    cost: 2,
    description: "Animal hide, flexible and moderately durable",
    color: "#A0522D",
  },
  iron: {
    name: "Iron",
    rarity: "common",
    durability: 70,
    weight: 5,
    cost: 5,
    description: "Common metal, sturdy and reliable",
    color: "#696969",
  },
  steel: {
    name: "Steel",
    rarity: "uncommon",
    durability: 85,
    weight: 6,
    cost: 10,
    description: "Refined iron alloy, stronger and more durable",
    color: "#708090",
  },
  silver: {
    name: "Silver",
    rarity: "rare",
    durability: 60,
    weight: 4,
    cost: 25,
    description: "Precious metal with magical properties",
    color: "#C0C0C0",
  },
  gold: {
    name: "Gold",
    rarity: "rare",
    durability: 50,
    weight: 3,
    cost: 50,
    description: "Rare precious metal, highly valued",
    color: "#FFD700",
  },
  mithril: {
    name: "Mithril",
    rarity: "legendary",
    durability: 95,
    weight: 2,
    cost: 200,
    description: "Legendary metal, incredibly strong yet light",
    color: "#E6E6FA",
  },
};

// Quality levels
export const equipmentQuality = {
  poor: {
    name: "Poor",
    rarity: "common",
    multiplier: 0.5,
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
  noble: {
    name: "Noble",
    rarity: "uncommon",
    multiplier: 1.5,
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
      "robes",
      "vest",
      "common-clothes",
      "noble-clothes",
    ],
  },
  weapon: {
    name: "Weapon",
    slot: "weapon",
    statusType: "weapons",
    description: "Weapons for combat",
    skillBonuses: {
      swordfighting: 1,
      archery: 1,
      polearms: 1,
      unarmed: 0.5,
    },
    items: [
      "longsword",
      "battleaxe",
      "spear",
      "longbow",
      "shortbow",
      "crossbow",
      "greatsword",
      "greataxe",
      "club",
      "quarterstaff",
      "nunchaku",
      "sai",
      "mace",
      "warhammer",
      "flail",
      "staff",
      "hammer",
      "wand",
      "scythe",
      "ice_blade",
      "fists",
      "bow",
      "sword",
      "crossbow",
      "warhammer",
      "staff",
      "sling",
      "hammer",
      "holy_sword",
      "staff",
      "ice_blade",
    ],
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
      "backpack",
      "rope",
      "quiver",
      "arrows",
      "grappling",
      "prayer_beads",
      "incense",
      "holy_symbol",
      "prayer_book",
      "crystals",
      "mining_pick",
      "phoenix_feathers",
      "fire_crystals",
      "skull",
      "bone_chalk",
      "ice_crystals",
      "frost_gem",
      "training_weights",
      "meditation_mat",
      "tracking_kit",
      "survival_gear",
      "map",
      "compass",
      "journal",
      "blessed_water",
      "alchemy_kit",
      "potion_belt",
      "herb_pouch",
      "gardening_tools",
      "tracking_kit",
      "traps",
      "lockpicks",
      "torch",
      "smithing_tools",
      "workshop_kit",
      // Skill Kits
      "sword_kit",
      "archery_kit",
      "polearm_kit",
      "shield_kit",
      "tactics_manual",
      "intimidation_tools",
      "leatherworking_tools",
      "tailoring_kit",
      "cooking_kit",
      "stonework_tools",
      "stealth_kit",
      "merchant_kit",
      "healing_kit",
      "acrobatics_gear",
      "nature_totem",
      "earth_stones",
      "general_tools",
      // Exploration Skill Kits
      "navigation_kit",
      "cartography_kit",
      "climbing_gear",
      "swimming_gear",
      "scouting_kit",
      // Social Skill Kits
      "diplomacy_kit",
      "animal_handling_kit",
      "trap_disarming_kit",
      "lore_books",
      "investigation_kit",
      "insight_tools",
      "performance_kit",
      "deception_tools",
      "sleight_of_hand_kit",
      // Crafting Skill Kits
      "jewelcrafting_tools",
      "enchanting_kit",
      "carpentry_tools",
      "scribing_kit",
      "persuasion_tools",
      // Magic Skill Kits
      "ice_crystals",
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

export function getEquipmentQuality(qualityName) {
  return equipmentQuality[qualityName] || null;
}

export function getEquipmentType(typeName) {
  return equipmentTypes[typeName] || null;
}

// Equipment parsing and creation functions
export function parseEquipmentString(equipmentString) {
  const parts = equipmentString.split(",");
  if (parts.length !== 4) return null;

  const [status, material, quality, type] = parts;

  return {
    status: status.trim(),
    material: material.trim(),
    quality: quality.trim(),
    type: type.trim(),
    fullString: equipmentString,
  };
}

export function createEquipmentString(status, material, quality, type) {
  return `${status},${material},${quality},${type}`;
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

  // Get random material based on rarity
  const materials = Object.keys(equipmentMaterials);
  const rarityMaterials = materials.filter(
    (m) => equipmentMaterials[m].rarity === rarity
  );
  const randomMaterial =
    rarityMaterials[Math.floor(Math.random() * rarityMaterials.length)] ||
    materials[0];

  // Get random quality based on rarity
  const qualities = Object.keys(equipmentQuality);
  const rarityQualities = qualities.filter(
    (q) => equipmentQuality[q].rarity === rarity
  );
  const randomQuality =
    rarityQualities[Math.floor(Math.random() * rarityQualities.length)] ||
    "common";

  return createEquipmentString(
    randomStatus.name,
    randomMaterial,
    randomQuality,
    randomItem
  );
}

// Equipment durability and repair functions
export function calculateEquipmentDurability(equipmentString) {
  const parsed = parseEquipmentString(equipmentString);
  if (!parsed) return 0;

  const item = getEquipmentByName(parsed.type);
  const material = getEquipmentMaterial(parsed.material);
  const quality = getEquipmentQuality(parsed.quality);
  const status = getEquipmentStatus(equipmentTypes[item?.type]?.statusType, 0);

  if (!item || !material || !quality || !status) return 0;

  const baseDurability = item.baseDurability;
  const materialMultiplier = material.durability / 100;
  const qualityMultiplier = quality.multiplier;
  const statusMultiplier = status.durability / 100;

  return Math.floor(
    baseDurability * materialMultiplier * qualityMultiplier * statusMultiplier
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
    parsed.quality,
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
    parsed.quality,
    parsed.type
  );
}

// Equipment skill bonus calculations
export function calculateEquipmentSkillBonus(equipmentString, skillName) {
  const parsed = parseEquipmentString(equipmentString);
  if (!parsed) return 0;

  const item = getEquipmentByName(parsed.type);
  const quality = getEquipmentQuality(parsed.quality);

  if (!item || !quality) return 0;

  const baseBonus = item.skillBonuses[skillName] || 0;
  const qualityMultiplier = quality.multiplier;

  return Math.floor(baseBonus * qualityMultiplier);
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
  const quality = getEquipmentQuality(parsed.quality);
  const status = getEquipmentStatus(equipmentTypes[item?.type]?.statusType, 0);

  if (!item || !material || !quality || !status) return 0;

  const baseValue = item.baseCost;
  const materialMultiplier = material.cost;
  const qualityMultiplier = quality.multiplier;
  const statusMultiplier = status.durability / 100;

  return Math.floor(
    baseValue * materialMultiplier * qualityMultiplier * statusMultiplier
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
