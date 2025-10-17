import { gameState } from "./gamestate/game_variables.js";

export function hash(x, y, s) {
  let n = x * 12345 + y * 6789 + s * 98765 + gameState.seed;
  n = Math.sin(n) * 43758.5453;
  return n - Math.floor(n);
}

export function getGroupBonus(type) {
  // Phase 2.1 Migration: Calculate bonuses from character skills instead of roles
  const allCharacters = [];

  // Include player character if it exists
  if (gameState.playerCharacter) {
    allCharacters.push(gameState.playerCharacter);
  }

  // Include all group members (NPCs)
  allCharacters.push(...gameState.group);

  if (allCharacters.length === 0) {
    return gameState.groupBonus[type] || 0;
  }

  let skillBonus = 0;

  switch (type) {
    case "navigation":
      // MAX(navigation skill + cartography skill) across all characters
      skillBonus = Math.max(
        ...allCharacters.map(
          (char) =>
            (char.skills?.navigation || 0) + (char.skills?.cartography || 0)
        )
      );
      break;

    case "discovery":
      // MAX(investigation + lore_knowledge + arcana) across all characters
      skillBonus = Math.max(
        ...allCharacters.map(
          (char) =>
            (char.skills?.investigation || 0) +
            (char.skills?.lore_knowledge || 0) +
            (char.skills?.arcana || 0)
        )
      );
      break;

    case "combat":
      // SUM(all combat skills) from all characters
      skillBonus = allCharacters.reduce((total, char) => {
        const combatSkills = [
          "swordfighting",
          "archery",
          "polearms",
          "unarmed",
          "shieldwork",
          "tactics",
          "intimidation",
          "divine_magic",
          "fire_magic",
          "ice_magic",
          "earth_magic",
          "death_magic",
          "nature_magic",
        ];
        return (
          total +
          combatSkills.reduce(
            (skillTotal, skill) => skillTotal + (char.skills?.[skill] || 0),
            0
          )
        );
      }, 0);
      break;

    case "food":
      // SUM(cooking + survival + herbalism) from all characters
      skillBonus = allCharacters.reduce(
        (total, char) =>
          total +
          (char.skills?.cooking || 0) +
          (char.skills?.survival || 0) +
          (char.skills?.herbalism || 0),
        0
      );
      break;

    case "resource":
      // SUM(crafting skills) from all characters
      skillBonus = allCharacters.reduce((total, char) => {
        const craftingSkills = [
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
        ];
        return (
          total +
          craftingSkills.reduce(
            (skillTotal, skill) => skillTotal + (char.skills?.[skill] || 0),
            0
          )
        );
      }, 0);
      break;

    case "plant":
      // MAX(herbalism + survival) across all characters
      skillBonus = Math.max(
        ...allCharacters.map(
          (char) => (char.skills?.herbalism || 0) + (char.skills?.survival || 0)
        )
      );
      break;

    case "interact":
      // MAX(diplomacy + persuasion + bartering) across all characters
      skillBonus = Math.max(
        ...allCharacters.map(
          (char) =>
            (char.skills?.diplomacy || 0) +
            (char.skills?.persuasion || 0) +
            (char.skills?.bartering || 0)
        )
      );
      break;

    case "carry":
      // SUM(STR stat / 10) from all characters + carts
      skillBonus = allCharacters.reduce(
        (total, char) => total + Math.floor((char.stats?.STR || 8) / 10),
        0
      );
      break;

    case "health":
      // MAX(healing + herbalism) across all characters
      skillBonus = Math.max(
        ...allCharacters.map(
          (char) => (char.skills?.healing || 0) + (char.skills?.herbalism || 0)
        )
      );
      break;

    case "view":
      // MAX(scouting + tracking) across all characters
      skillBonus = Math.max(
        ...allCharacters.map(
          (char) => (char.skills?.scouting || 0) + (char.skills?.tracking || 0)
        )
      );
      break;

    default:
      skillBonus = 0;
  }

  // Add the groupBonus modifier
  const groupModifier = gameState.groupBonus[type] || 0;
  const total = skillBonus + groupModifier;

  return total;
}

export function getNumCarriers() {
  // Phase 2.1 Migration: Calculate carriers based on STR stats instead of roles
  const allCharacters = [];

  // Include player character if it exists
  if (gameState.playerCharacter) {
    allCharacters.push(gameState.playerCharacter);
  }

  // Include all group members (NPCs)
  allCharacters.push(...gameState.group);

  // Count characters with STR >= 12 as carriers
  return allCharacters.filter((char) => (char.stats?.STR || 8) >= 12).length;
}

export function getMaxStorage() {
  // Phase 2.1 Migration: Calculate storage based on STR stats instead of roles
  const allCharacters = [];

  // Include player character if it exists
  if (gameState.playerCharacter) {
    allCharacters.push(gameState.playerCharacter);
  }

  // Include all group members (NPCs)
  allCharacters.push(...gameState.group);

  // Base storage: STR stat * 2 per character + 200 per cart
  let baseStorage = allCharacters.reduce(
    (total, char) => total + (char.stats?.STR || 8) * 2,
    0
  );

  // Add cart storage
  baseStorage += 200 * gameState.carts;

  // Apply carry bonus for additional storage capacity
  let carryBonus = gameState.groupBonus.carry || 0;
  let bonusStorage = Math.floor(carryBonus);

  return baseStorage + bonusStorage;
}

// Phase 2.1 Migration: Removed getBonusForRole() - now using skill-based calculations

export function updateGroupBonus() {
  console.log("updateGroupBonus called - Phase 2.1 Migration");

  // Reset all bonuses
  Object.keys(gameState.groupBonus).forEach((key) => {
    gameState.groupBonus[key] = 0;
  });

  // Phase 2.1 Migration: Calculate group bonuses based on class synergies instead of roles
  const allCharacters = [];

  // Include player character if it exists
  if (gameState.playerCharacter) {
    allCharacters.push(gameState.playerCharacter);
  }

  // Include all group members (NPCs)
  allCharacters.push(...gameState.group);

  if (allCharacters.length === 0) {
    return;
  }

  // Count characters by class for synergy bonuses
  let classCounts = {};
  allCharacters.forEach((char) => {
    const className = char.class || "unknown";
    classCounts[className] = (classCounts[className] || 0) + 1;
  });

  // Apply class synergy bonuses
  // Multiple rangers/explorers → discovery bonus
  const explorerClasses = ["ranger", "explorer", "hunter"];
  const explorerCount = explorerClasses.reduce(
    (total, className) => total + (classCounts[className] || 0),
    0
  );
  if (explorerCount >= 2) {
    gameState.groupBonus.discovery += 0.1;
    if (explorerCount >= 3) {
      gameState.groupBonus.discovery += 0.2;
    }
  }

  // Multiple fighters/guards → combat bonus
  const fighterClasses = ["fighter", "brute", "martial_artist", "paladin"];
  const fighterCount = fighterClasses.reduce(
    (total, className) => total + (classCounts[className] || 0),
    0
  );
  if (fighterCount >= 2) {
    gameState.groupBonus.combat += 0.2;
    if (fighterCount >= 3) {
      gameState.groupBonus.combat += 0.3;
    }
  }

  // Multiple healers → health bonus
  const healerClasses = ["cleric", "herbalist"];
  const healerCount = healerClasses.reduce(
    (total, className) => total + (classCounts[className] || 0),
    0
  );
  if (healerCount >= 2) {
    gameState.groupBonus.health += 0.2;
    if (healerCount >= 3) {
      gameState.groupBonus.health += 0.3;
    }
  }

  // Multiple crafters → resource bonus
  const crafterClasses = ["craftsman", "alchemist", "herbalist"];
  const crafterCount = crafterClasses.reduce(
    (total, className) => total + (classCounts[className] || 0),
    0
  );
  if (crafterCount >= 2) {
    gameState.groupBonus.resource += 0.2;
    if (crafterCount >= 3) {
      gameState.groupBonus.resource += 0.3;
    }
  }

  // Multiple mages → magic bonus (could affect various bonuses)
  const mageClasses = ["pyromancer", "necromancer", "articaster", "geomancer"];
  const mageCount = mageClasses.reduce(
    (total, className) => total + (classCounts[className] || 0),
    0
  );
  if (mageCount >= 2) {
    gameState.groupBonus.discovery += 0.1; // Magic helps with discovery
    if (mageCount >= 3) {
      gameState.groupBonus.discovery += 0.2;
    }
  }

  console.log("Updated groupBonus:", gameState.groupBonus);
}

// Phase 2.1 Migration: Removed ensureGroupBonuses() - no longer needed with character objects

// Phase 2.1 Migration: Removed getEnhancedBonusForRole() - no longer needed with character objects

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
