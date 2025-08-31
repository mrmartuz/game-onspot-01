import { gameState } from "./game_variables.js";

export function hash(x, y, s) {
  let n = x * 12345 + y * 6789 + s * 98765 + gameState.seed;
  n = Math.sin(n) * 43758.5453;
  return n - Math.floor(n);
}

export function getGroupBonus(type) {
  // Get individual role bonuses
  const roleBonus = gameState.group.reduce((total, g) => {
    // Safely handle missing bonus properties
    const memberBonus = g.bonus || {};
    return total + (memberBonus[type] || 0);
  }, 0);

  // Add the groupBonus modifier
  const groupModifier = gameState.groupBonus[type] || 0;
  const total = roleBonus + groupModifier;

  // if (type === 'discovery' || type === 'carry') {
  //     console.log(`getGroupBonus(${type}): roleBonus=${roleBonus}, groupModifier=${groupModifier}, total=${total}`);
  // }

  return total;
}

export function getNumCarriers() {
  return gameState.group.filter(
    (g) => g.role.replace(/[^\w-]/g, "") === "carrier"
  ).length;
}

export function getMaxStorage() {
  // Base storage: 10 per person + 24 per carrier + 200 per cart
  let numCarriers = getNumCarriers();
  let baseStorage =
    10 *
    gameState.group.filter((g) => g.role.replace(/[^\w-]/g, "") !== "carrier")
      .length;

  // Only add carrier storage if there are carriers
  if (numCarriers > 0) {
    baseStorage += 24 * numCarriers;
  }

  // Add cart storage
  baseStorage += 200 * gameState.carts;

  // Apply carry bonus for additional storage capacity
  let carryBonus = gameState.groupBonus.carry || 0;
  let bonusStorage = Math.floor(carryBonus);

  return baseStorage + bonusStorage;
}

export function getBonusForRole(role) {
  // Strip emojis from role names for matching
  const cleanRole = role.replace(/[^\w-]/g, "");

  const bonuses = {
    "native-guide": { navigation: 0.2 },
    explorer: { discovery: 0.2 },
    cook: { food: 0.2 },
    guard: { combat: 0.2 },
    geologist: { resource: 0.2 },
    biologist: { plant: 0.2 },
    translator: { interact: 0.2 },
    carrier: { carry: 0.2 },
    medic: { health: 0.2 },
    navigator: { view: 1 },
  };
  return bonuses[cleanRole] || {};
}

export function updateGroupBonus() {
  console.log("updateGroupBonus called");

  // Ensure all group members have proper bonus properties
  ensureGroupBonuses();

  // Reset all bonuses
  Object.keys(gameState.groupBonus).forEach((key) => {
    gameState.groupBonus[key] = 0;
  });

  // Calculate group bonuses based on role composition
  let roleCounts = {};
  gameState.group.forEach((member) => {
    // Strip emojis from role names for matching
    const cleanRole = member.role.replace(/[^\w-]/g, "");
    roleCounts[cleanRole] = (roleCounts[cleanRole] || 0) + 1;
  });

  // Apply bonuses based on role combinations with scaling
  if (roleCounts["native-guide"] >= 1) {
    gameState.groupBonus.navigation += 0.3;
    // Additional bonus for multiple guides
    if (roleCounts["native-guide"] >= 2) {
      gameState.groupBonus.navigation += 0.2;
    }
    if (roleCounts["native-guide"] >= 3) {
      gameState.groupBonus.navigation += 0.1;
    }
  }

  if (roleCounts["explorer"] >= 1) {
    gameState.groupBonus.discovery += 0.1;

    // Additional bonus for multiple explorers
    if (roleCounts["explorer"] >= 2) {
      gameState.groupBonus.discovery += 0.3;
    }
    if (roleCounts["explorer"] >= 3) {
      gameState.groupBonus.discovery += 0.3;
    }
  }

  if (roleCounts["cook"] >= 1) {
    gameState.groupBonus.food += 0.3;

    // Additional bonus for multiple cooks
    if (roleCounts["cook"] >= 2) {
      gameState.groupBonus.food += 0.2;
    }
    if (roleCounts["cook"] >= 3) {
      gameState.groupBonus.food += 0.1;
    }
  }

  if (roleCounts["guard"] >= 1) {
    gameState.groupBonus.combat += 0.4;

    // Additional bonus for multiple guards
    if (roleCounts["guard"] >= 2) {
      gameState.groupBonus.combat += 0.3;
    }
    if (roleCounts["guard"] >= 3) {
      gameState.groupBonus.combat += 0.2;
    }
  }

  if (roleCounts["geologist"] >= 1) {
    gameState.groupBonus.resource += 0.3;

    // Additional bonus for multiple geologists
    if (roleCounts["geologist"] >= 2) {
      gameState.groupBonus.resource += 0.2;
    }
    if (roleCounts["geologist"] >= 3) {
      gameState.groupBonus.resource += 0.1;
    }
  }

  if (roleCounts["biologist"] >= 1) {
    gameState.groupBonus.plant += 0.3;

    // Additional bonus for multiple biologists
    if (roleCounts["biologist"] >= 2) {
      gameState.groupBonus.plant += 0.2;
    }
    if (roleCounts["biologist"] >= 3) {
      gameState.groupBonus.plant += 0.1;
    }
  }

  if (roleCounts["translator"] >= 1) {
    gameState.groupBonus.interact += 0.3;

    // Additional bonus for multiple translators
    if (roleCounts["translator"] >= 2) {
      gameState.groupBonus.interact += 0.2;
    }
    if (roleCounts["translator"] >= 3) {
      gameState.groupBonus.interact += 0.1;
    }
  }

  if (roleCounts["carrier"] >= 1) {
    gameState.groupBonus.carry += 0.1;

    // Additional bonus for multiple carriers
    if (roleCounts["carrier"] >= 2) {
      gameState.groupBonus.carry += 0.2;
    }
    if (roleCounts["carrier"] >= 3) {
      gameState.groupBonus.carry += 0.1;
    }
  }

  if (roleCounts["medic"] >= 1) {
    gameState.groupBonus.health += 0.4;

    // Additional bonus for multiple medics
    if (roleCounts["medic"] >= 2) {
      gameState.groupBonus.health += 0.3;
    }
    if (roleCounts["medic"] >= 3) {
      gameState.groupBonus.health += 0.2;
    }
  }

  if (roleCounts["navigator"] >= 1) {
    gameState.groupBonus.view += 1;

    // Additional bonus for multiple navigators
    if (roleCounts["navigator"] >= 2) {
      gameState.groupBonus.view += 0.5;
    }
    if (roleCounts["navigator"] >= 3) {
      gameState.groupBonus.view += 0.25;
    }
  }

  // Special combination bonuses
  if (roleCounts["native-guide"] && roleCounts["navigator"]) {
    gameState.groupBonus.navigation += 0.2;
  }
  if (roleCounts["geologist"] && roleCounts["biologist"]) {
    gameState.groupBonus.resource += 0.2;
    gameState.groupBonus.plant += 0.2;
  }
  if (roleCounts["medic"] && roleCounts["guard"]) {
    gameState.groupBonus.health += 0.2;
    gameState.groupBonus.combat += 0.2;
  }
}

// Function to ensure all group members have proper bonus properties
export function ensureGroupBonuses() {
  gameState.group.forEach((member) => {
    if (!member.bonus || typeof member.bonus !== "object") {
      member.bonus = getBonusForRole(member.role);
      console.log(`Fixed missing bonus for ${member.role}:`, member.bonus);
    }
  });
}

export function getEnhancedBonusForRole(role) {
  // Strip emojis from role names for matching
  const cleanRole = role.replace(/[^\w-]/g, "");

  // Define possible enhanced bonuses for each role
  const enhancedBonuses = {
    "native-guide": [
      { type: "navigation", value: 0.3, description: "Expert Navigation" },
      { type: "view", value: 0.5, description: "Eagle Eyes" },
      { type: "discovery", value: 0.2, description: "Pathfinder" },
    ],
    explorer: [
      { type: "discovery", value: 0.3, description: "Master Explorer" },
      { type: "navigation", value: 0.2, description: "Trail Blazer" },
      { type: "view", value: 0.5, description: "Scout Vision" },
    ],
    cook: [
      { type: "food", value: 0.3, description: "Master Chef" },
      { type: "health", value: 0.2, description: "Nutritionist" },
      { type: "carry", value: 0.1, description: "Kitchen Master" },
    ],
    guard: [
      { type: "combat", value: 0.3, description: "Elite Guard" },
      { type: "health", value: 0.2, description: "Iron Will" },
      { type: "view", value: 0.3, description: "Vigilant" },
    ],
    geologist: [
      { type: "resource", value: 0.3, description: "Master Geologist" },
      { type: "discovery", value: 0.2, description: "Mineral Expert" },
      { type: "carry", value: 0.1, description: "Rock Hauler" },
    ],
    biologist: [
      { type: "plant", value: 0.3, description: "Master Biologist" },
      { type: "food", value: 0.2, description: "Herbalist" },
      { type: "health", value: 0.1, description: "Natural Healer" },
    ],
    translator: [
      { type: "interact", value: 0.3, description: "Master Translator" },
      { type: "discovery", value: 0.2, description: "Cultural Expert" },
      { type: "navigation", value: 0.1, description: "Local Knowledge" },
    ],
    carrier: [
      { type: "carry", value: 0.3, description: "Master Carrier" },
      { type: "health", value: 0.2, description: "Iron Back" },
      { type: "combat", value: 0.1, description: "Pack Defender" },
    ],
    medic: [
      { type: "health", value: 0.3, description: "Master Medic" },
      { type: "combat", value: 0.2, description: "Battle Medic" },
      { type: "food", value: 0.1, description: "Dietician" },
    ],
    navigator: [
      { type: "view", value: 1.5, description: "Master Navigator" },
      { type: "navigation", value: 0.3, description: "Path Master" },
      { type: "discovery", value: 0.2, description: "Terrain Expert" },
    ],
  };

  // Get the possible bonuses for this role
  const possibleBonuses = enhancedBonuses[cleanRole] || [];

  if (possibleBonuses.length === 0) {
    // Fallback: give a random bonus
    const allBonusTypes = [
      "navigation",
      "discovery",
      "food",
      "combat",
      "resource",
      "plant",
      "interact",
      "carry",
      "health",
      "view",
    ];
    const randomType =
      allBonusTypes[Math.floor(Math.random() * allBonusTypes.length)];
    return {
      type: randomType,
      value: 0.2 + Math.random() * 0.3, // 0.2 to 0.5
      description: "Natural Talent",
    };
  }

  // Return a random enhanced bonus for this role
  return possibleBonuses[Math.floor(Math.random() * possibleBonuses.length)];
}

export async function checkDeath() {
  if (gameState.health <= 0) {
    return "health";
  } else if (gameState.gold < -50) {
    return "gold";
  }
}

export function getWorldName(seed) {
  const numToLetter = {
    0: "a",
    1: "e",
    2: "i",
    3: "o",
    4: "u",
    5: "r",
    6: "n",
    7: "s",
    8: "t",
    9: "l",
  };

  const letterStr = seed
    .toString()
    .split("")
    .map((d) => numToLetter[d] || "")
    .join("");

  //TODO: Define groups by seed to be deterministic
  const groupsCount = Math.floor(Math.random() * 3) + 1;
  const groupSize = Math.ceil(letterStr.length / groupsCount);

  let groups = [];
  for (let i = 0; i < groupsCount; i++) {
    groups.push(letterStr.slice(i * groupSize, (i + 1) * groupSize));
    groups[i] = groups[i].charAt(0).toUpperCase() + groups[i].slice(1);
  }

  groups = groups.filter((g) => g.length > 0);

  let name = groups.join(" ");

  if (Math.random() < 0.5 && name.length > 2) {
    let r = Math.random() * 100;
    if (r > 50) {
      const pos = Math.floor(Math.random() * (name.length - 2)) + 1;
      name = name.slice(0, pos) + "'" + name.slice(pos);
    } else {
      name =
        name.slice(0, 1) +
        " '" +
        name.slice(1).charAt(0).toUpperCase() +
        name.slice(2);
    }
  }

  return name.charAt(0).toUpperCase() + name.slice(1);
}
