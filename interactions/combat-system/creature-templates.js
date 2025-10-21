// Creature templates and discovery/detection messages for combat system
export const creatureTemplates = {
  // MONSTER TEMPLATES
  goblin: {
    name: "Goblin",
    race: "Goblin",
    class: "fighter",
    level: 1,
    rarity: "common",
    inventorySize: 1,
    baseStats: {
      STR: 6,
      DEX: 12,
      CON: 8,
      INT: 10,
      WIS: 8,
      CHA: 6,
      LUCK: 12,
    },
    skills: {
      stealth: 2,
      lockpicking: 1,
      bartering: 1,
      swords: 1,
    },
    equipment: {
      weapon: "poor bronze [dagger]",
      armor: "poor leather [leather-armor]",
    },
    discoveryMessages: [
      "You spot a small, green-skinned figure lurking in the shadows.",
      "A pair of glowing eyes peer at you from behind a rock.",
      "You hear the sound of metal clinking as a goblin adjusts its gear.",
      "A small, hunched figure darts between cover, trying to stay hidden.",
      "You notice movement in the underbrush - a goblin scout!",
    ],
    detectionMessages: [
      "The goblin's eyes widen as it realizes it's been spotted!",
      "Caught off guard, the goblin fumbles with its weapon.",
      "The goblin lets out a surprised yelp and prepares for combat.",
      "Startled, the goblin drops what it was carrying and draws its weapon.",
      "The goblin's stealth is broken - it's time for battle!",
    ],
  },

  orc: {
    name: "Orc",
    race: "Orc",
    class: "brute",
    level: 2,
    rarity: "common",
    inventorySize: 1,
    baseStats: {
      STR: 14,
      DEX: 8,
      CON: 12,
      INT: 6,
      WIS: 7,
      CHA: 5,
      LUCK: 8,
    },
    skills: {
      intimidation: 3,
      unarmed: 2,
      survival: 1,
      swords: 2,
    },
    equipment: {
      weapon: "fair iron [axe]",
      armor: "fair iron [chainmail-armor]",
    },
    discoveryMessages: [
      "A massive, green-skinned warrior emerges from the shadows.",
      "You hear the heavy footsteps of an orc approaching.",
      "A towering figure with tusks and a menacing scowl blocks your path.",
      "The sound of metal armor clanking announces an orc's presence.",
      "You spot an orc warrior sharpening its weapon nearby.",
    ],
    detectionMessages: [
      "The orc roars in anger and charges forward!",
      "Caught off guard, the orc snarls and raises its weapon.",
      "The orc's eyes burn with fury as it prepares for battle.",
      "Startled, the orc lets out a battle cry and attacks!",
      "The orc's surprise turns to rage as combat begins!",
    ],
  },

  troll: {
    name: "Troll",
    race: "Troll",
    class: "brute",
    level: 4,
    rarity: "uncommon",
    inventorySize: 3,
    baseStats: {
      STR: 18,
      DEX: 4,
      CON: 16,
      INT: 3,
      WIS: 4,
      CHA: 3,
      LUCK: 6,
    },
    skills: {
      intimidation: 4,
      unarmed: 3,
      survival: 2,
      tactics: 1,
    },
    equipment: {
      weapon: "good steel [club]",
      armor: "good steel [plate-armor]",
    },
    discoveryMessages: [
      "A massive, hulking figure with thick hide and sharp claws emerges.",
      "You hear the deep, guttural breathing of a troll nearby.",
      "A towering creature with glowing eyes and sharp teeth blocks your way.",
      "The ground shakes as a troll lumbers into view.",
      "You spot a troll resting near a cave entrance.",
    ],
    detectionMessages: [
      "The troll roars with primal fury and charges!",
      "Caught off guard, the troll's eyes burn with rage.",
      "The troll's surprise turns to violent anger!",
      "Startled, the troll lets out a deafening roar!",
      "The troll's massive form tenses for battle!",
    ],
  },

  dragon: {
    name: "Dragon",
    race: "Dragon",
    class: "pyromancer",
    level: 8,
    rarity: "legendary",
    inventorySize: 10,
    baseStats: {
      STR: 20,
      DEX: 12,
      CON: 18,
      INT: 16,
      WIS: 14,
      CHA: 16,
      LUCK: 10,
    },
    skills: {
      fire_magic: 8,
      intimidation: 6,
      tactics: 4,
      survival: 3,
      lore_knowledge: 4,
    },
    equipment: {
      weapon: "excellent mithril [claws]",
      armor: "excellent mithril [dragon-scales]",
    },
    discoveryMessages: [
      "A massive, ancient dragon with scales that shimmer like precious metals emerges.",
      "You hear the deep, rumbling voice of a dragon speaking in an ancient tongue.",
      "A towering creature with wings that span the sky blocks your path.",
      "The air grows hot as a dragon's fiery breath fills the area.",
      "You spot a dragon perched on a mountain peak, surveying its domain.",
    ],
    detectionMessages: [
      "The dragon's eyes burn with ancient wisdom and fury!",
      "Caught off guard, the dragon's scales shimmer with magical energy.",
      "The dragon's surprise turns to calculated rage!",
      "Startled, the dragon lets out a roar that shakes the earth!",
      "The dragon's massive form tenses with magical power!",
    ],
  },

  // BEAST TEMPLATES
  wolf: {
    name: "Wolf",
    race: "Wolf",
    class: "hunter",
    level: 1,
    rarity: "common",
    inventorySize: 1,
    baseStats: {
      STR: 8,
      DEX: 14,
      CON: 10,
      INT: 6,
      WIS: 12,
      CHA: 8,
      LUCK: 10,
    },
    skills: {
      tracking: 3,
      scouting: 2,
      survival: 2,
      intimidation: 1,
    },
    equipment: {
      weapon: "natural [claws]",
      armor: "natural [fur]",
    },
    discoveryMessages: [
      "A sleek, gray wolf emerges from the underbrush.",
      "You hear the sound of paws padding softly on the ground.",
      "A pair of glowing eyes peer at you from the darkness.",
      "You spot a wolf pack moving through the trees.",
      "The sound of a wolf's howl echoes through the forest.",
    ],
    detectionMessages: [
      "The wolf's eyes lock onto you with predatory focus!",
      "Caught off guard, the wolf snarls and bares its teeth.",
      "The wolf's surprise turns to hunting instinct!",
      "Startled, the wolf lets out a warning growl!",
      "The wolf's form tenses for a pounce!",
    ],
  },

  bear: {
    name: "Bear",
    race: "Bear",
    class: "brute",
    level: 3,
    rarity: "uncommon",
    inventorySize: 1,
    baseStats: {
      STR: 16,
      DEX: 8,
      CON: 14,
      INT: 4,
      WIS: 10,
      CHA: 6,
      LUCK: 8,
    },
    skills: {
      intimidation: 4,
      survival: 3,
      unarmed: 3,
      tracking: 2,
    },
    equipment: {
      weapon: "natural [claws]",
      armor: "natural [thick-fur]",
    },
    discoveryMessages: [
      "A massive brown bear emerges from behind a tree.",
      "You hear the deep, rumbling growl of a bear nearby.",
      "A towering creature with sharp claws and powerful jaws blocks your path.",
      "The ground shakes as a bear lumbers into view.",
      "You spot a bear foraging for food near a berry bush.",
    ],
    detectionMessages: [
      "The bear roars with primal fury and charges!",
      "Caught off guard, the bear's eyes burn with rage.",
      "The bear's surprise turns to violent anger!",
      "Startled, the bear lets out a deafening roar!",
      "The bear's massive form tenses for battle!",
    ],
  },

  mountainLion: {
    name: "Mountain Lion",
    race: "MountainLion",
    class: "hunter",
    level: 2,
    rarity: "uncommon",
    inventorySize: 1,
    baseStats: {
      STR: 12,
      DEX: 16,
      CON: 10,
      INT: 8,
      WIS: 12,
      CHA: 8,
      LUCK: 10,
    },
    skills: {
      stealth: 4,
      scouting: 3,
      unarmed: 3,
      survival: 2,
    },
    equipment: {
      weapon: "natural [claws]",
      armor: "natural [fur]",
    },
    discoveryMessages: [
      "A sleek, golden mountain lion emerges from the rocks.",
      "You hear the soft padding of paws on stone.",
      "A pair of golden eyes peer at you from above.",
      "You spot a mountain lion perched on a rocky outcrop.",
      "The sound of a mountain lion's growl echoes through the mountains.",
    ],
    detectionMessages: [
      "The mountain lion's eyes lock onto you with predatory focus!",
      "Caught off guard, the mountain lion snarls and bares its teeth.",
      "The mountain lion's surprise turns to hunting instinct!",
      "Startled, the mountain lion lets out a warning growl!",
      "The mountain lion's form tenses for a pounce!",
    ],
  },
};

// Helper functions for creature messages
export function getRandomDiscoveryMessage(monster) {
  const template = creatureTemplates[monster.creatureType];
  if (!template || !template.discoveryMessages) {
    return `You spot a ${monster.name} nearby.`;
  }

  const messages = template.discoveryMessages;
  return messages[Math.floor(Math.random() * messages.length)];
}

export function getRandomDetectionMessage(monster) {
  const template = creatureTemplates[monster.creatureType];
  if (!template || !template.detectionMessages) {
    return `The ${monster.name} notices you and prepares for combat!`;
  }

  const messages = template.detectionMessages;
  return messages[Math.floor(Math.random() * messages.length)];
}

export function getCreatureRarityColor(rarity) {
  const colors = {
    common: "#90EE90", // Light green
    uncommon: "#87CEEB", // Sky blue
    rare: "#DDA0DD", // Plum
    legendary: "#FFD700", // Gold
    epic: "#FF6347", // Tomato
    mythic: "#9370DB", // Medium purple
  };

  return colors[rarity] || "#90EE90"; // Default to light green
}
