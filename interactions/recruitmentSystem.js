// Recruitment System for location-based character recruitment
// Implements character generation, availability tracking, and recruitment mechanics

import { characterGeneration } from "./characterGeneration.js";
import { classDatabase } from "./combat/classes.js";
import { gameState } from "../gamestate/game_variables.js";
import { getCurrentGameDate } from "../time_system.js";
import { hash } from "../utils.js";

// Location-based character availability configuration
export const locationCharacterAvailability = {
  city: {
    refreshInterval: 14, // days
    characterCount: { min: 4, max: 6 }, // 4-6 characters
    classProbabilities: {
      alchemist: 0.15,
      craftsman: 0.15,
      explorer: 0.12,
      dungeondiver: 0.12,
      hunter: 0.1,
      herbalist: 0.1,
      cleric: 0.08,
      monk: 0.08,
      paladin: 0.05, // rare
      pyromancer: 0.03, // rare
      articaster: 0.02, // rare
    },
  },
  village: {
    refreshInterval: 90, // days
    characterCount: { min: 4, max: 5 }, // 4-5 characters
    classProbabilities: {
      herbalist: 0.2,
      craftsman: 0.18,
      hunter: 0.15,
      ranger: 0.15,
      fighter: 0.12,
      dungeondiver: 0.1,
      brute: 0.1,
    },
  },
  army: {
    refreshInterval: 90, // days
    characterCount: { min: 3, max: 4 }, // 3-4 characters
    classProbabilities: {
      fighter: 0.25,
      archer: 0.2,
      brute: 0.15,
      paladin: 0.12,
      martial_artist: 0.1,
      pyromancer: 0.08, // rare combat mage
      articaster: 0.05, // rare combat mage
      cleric: 0.05,
    },
  },
  hamlet: {
    refreshInterval: 90, // days
    characterCount: { min: 3, max: 4 }, // 3-4 characters
    classProbabilities: {
      herbalist: 0.25,
      craftsman: 0.2,
      hunter: 0.2,
      ranger: 0.15,
      fighter: 0.1,
      dungeondiver: 0.1,
    },
  },
  outpost: {
    refreshInterval: 90, // days
    characterCount: { min: 2, max: 3 }, // 2-3 characters
    classProbabilities: {
      fighter: 0.3,
      archer: 0.25,
      hunter: 0.2,
      ranger: 0.15,
      dungeondiver: 0.1,
    },
  },
  farm: {
    refreshInterval: 90, // days
    characterCount: { min: 2, max: 3 }, // 2-3 characters
    classProbabilities: {
      herbalist: 0.4,
      craftsman: 0.3,
      hunter: 0.2,
      ranger: 0.1,
    },
  },
  camp: {
    refreshInterval: 90, // days
    characterCount: { min: 0, max: 2 }, // 1-2 characters
    classProbabilities: {
      hunter: 0.4,
      ranger: 0.3,
      fighter: 0.2,
      dungeondiver: 0.1,
    },
  },
  // Special locations with rare recruitment opportunities
  waterfalls: {
    refreshInterval: 180, // days
    recruitmentChance: 0.05, // 5% chance to find recruitable character
    characterCount: { min: 0, max: 1 }, // Always 1 character if found
    classProbabilities: {
      ranger: 0.4,
      explorer: 0.3,
      herbalist: 0.2,
      monk: 0.1,
    },
  },
  volcano: {
    refreshInterval: 180, // days
    recruitmentChance: 0.05, // 5% chance to find recruitable character
    characterCount: { min: 0, max: 1 }, // Always 1 character if found
    classProbabilities: {
      pyromancer: 0.5,
      fighter: 0.3,
      explorer: 0.2,
    },
  },
  canyon: {
    refreshInterval: 180, // days
    recruitmentChance: 0.05, // 5% chance to find recruitable character
    characterCount: { min: 0, max: 1 }, // Always 1 character if found
    classProbabilities: {
      ranger: 0.4,
      hunter: 0.3,
      explorer: 0.2,
      dungeondiver: 0.1,
    },
  },
  geyser: {
    refreshInterval: 180, // days
    recruitmentChance: 0.05, // 5% chance to find recruitable character
    characterCount: { min: 0, max: 1 }, // Always 1 character if found
    classProbabilities: {
      herbalist: 0.4,
      alchemist: 0.3,
      explorer: 0.2,
      monk: 0.1,
    },
  },
  "monster caves": {
    refreshInterval: 180, // days
    recruitmentChance: 0.05, // 5% chance to find recruitable character
    characterCount: { min: 0, max: 1 }, // Always 1 character if found
    classProbabilities: {
      dungeondiver: 0.4,
      fighter: 0.3,
      necromancer: 0.2,
      brute: 0.1,
    },
  },
  cave: {
    refreshInterval: 180, // days
    recruitmentChance: 0.05, // 5% chance to find recruitable character
    characterCount: { min: 0, max: 1 }, // Always 1 character if found
    classProbabilities: {
      dungeondiver: 0.4,
      explorer: 0.3,
      fighter: 0.2,
      necromancer: 0.1,
    },
  },
  ruin: {
    refreshInterval: 180, // days
    recruitmentChance: 0.05, // 5% chance to find recruitable character
    characterCount: { min: 0, max: 1 }, // Always 1 character if found
    classProbabilities: {
      explorer: 0.4,
      dungeondiver: 0.3,
      necromancer: 0.2,
      alchemist: 0.1,
    },
  },
  peaks: {
    refreshInterval: 180, // days
    recruitmentChance: 0.01, // 1% chance to find recruitable character (very rare)
    characterCount: { min: 0, max: 1 }, // Always 1 character if found
    classProbabilities: {
      explorer: 0.5,
      ranger: 0.3,
      monk: 0.2,
    },
  },
};

// Character description system
export const statDescriptions = {
  high: {
    12: {
      STR: ["Strong", "Muscular", "Brawny"],
      DEX: ["Agile", "Nimble", "Deft"],
      CON: ["Hardy", "Sturdy", "Resilient"],
      INT: ["Clever", "Sharp", "Astute"],
      WIS: ["Wise", "Prudent", "Insightful"],
      CHA: ["Charismatic", "Charming", "Eloquent"],
    },
    16: {
      STR: ["Massive", "Titanic", "Herculean"],
      DEX: ["Swift", "Blinding", "Feline"],
      CON: ["Ironclad", "Unbreakable", "Enduring"],
      INT: ["Genius", "Brilliant", "Visionary"],
      WIS: ["Sage", "Prophetic", "Enlightened"],
      CHA: ["Magnetic", "Radiant", "Commanding"],
    },
  },
  low: {
    8: {
      STR: ["Weak", "Frail", "Feeble"],
      DEX: ["Clumsy", "Slow", "Awkward"],
      CON: ["Fragile", "Delicate", "Vulnerable"],
      INT: ["Dull", "Simple", "Naive"],
      WIS: ["Foolish", "Reckless", "Unwise"],
      CHA: ["Uncharismatic", "Repulsive", "Offensive"],
    },
  },
};

// Skill description thresholds
export const skillDescriptions = {
  good: 4, // Skill > 4: "good [skillname]"
  expert: 7, // Skill > 7: "expert [skillname]"
  master: 10, // Skill > 10: "master [skillname]"
};

// Recruitment cost system
export const recruitmentCosts = {
  baseCosts: {
    1: 50, // Level 1: 50 gold
    2: 120, // Level 2: 120 gold
    3: 250, // Level 3: 250 gold
    4: 500, // Level 4: 500 gold
    5: 1000, // Level 5: 1000 gold
  },
  rarityMultipliers: {
    common: 1.0,
    uncommon: 2.0,
    rare: 4.0,
    legendary: 8.0,
  },
  rareItemRequirements: {
    pyromancer: ["tome_of_fire", "phoenix_feather"],
    articaster: ["tome_of_ice", "frost_crystal"],
    geomancer: ["tome_of_earth", "earth_stone"],
    necromancer: ["tome_of_death", "skull_focus"],
    paladin: ["holy_relic", "divine_blessing"],
    cleric: ["sacred_symbol", "holy_water"],
  },
};

// Character description generation
export function generateCharacterDescription(character) {
  const {
    stats,
    skills,
    race,
    gender,
    class: className,
    equipment,
  } = character;

  // Find highest and second highest stats
  const statEntries = Object.entries(stats).filter(([stat]) => stat !== "LUCK");
  statEntries.sort((a, b) => b[1] - a[1]);

  const [highestStat, highestValue] = statEntries[0];
  const [secondHighestStat, secondHighestValue] = statEntries[1];

  // Get stat descriptions
  const highestDesc = getStatDescription(highestStat, highestValue);
  const secondHighestDesc = getStatDescription(
    secondHighestStat,
    secondHighestValue
  );

  // Find two highest skills
  const skillEntries = Object.entries(skills || {});
  skillEntries.sort((a, b) => b[1] - a[1]);
  const [skill1Name, skill1Value] = skillEntries[0] || ["unknown", 0];
  const [skill2Name, skill2Value] = skillEntries[1] || ["unknown", 0];

  // Get skill descriptions
  const skill1Desc = getSkillDescription(skill1Name, skill1Value);
  const skill2Desc = getSkillDescription(skill2Name, skill2Value);

  // Get equipment descriptions
  const equipmentDesc = getEquipmentDescription(equipment);

  // Generate description
  const genderPronoun = gender === "male" ? "he" : "she";
  const genderPossessive = gender === "male" ? "his" : "her";

  return `You find yourself in front of a ${highestDesc} ${race} ${gender}, ${genderPronoun} is a ${secondHighestDesc} ${className}. ${
    genderPossessive.charAt(0).toUpperCase() + genderPossessive.slice(1)
  } expertise lies in ${skill1Desc} and ${skill2Desc}. ${
    genderPronoun.charAt(0).toUpperCase() + genderPronoun.slice(1)
  } wears ${equipmentDesc.clothing} and brandishes ${equipmentDesc.weapon}.`;
}

// Get stat description based on value
function getStatDescription(stat, value) {
  if (value >= 16) {
    const descriptions = statDescriptions.high[16][stat];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  } else if (value >= 12) {
    const descriptions = statDescriptions.high[12][stat];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  } else if (value <= 8) {
    const descriptions = statDescriptions.low[8][stat];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }
  return "average";
}

// Get skill description based on value
function getSkillDescription(skillName, value) {
  if (value >= skillDescriptions.master) {
    return `master ${skillName}`;
  } else if (value >= skillDescriptions.expert) {
    return `expert ${skillName}`;
  } else if (value >= skillDescriptions.good) {
    return `good ${skillName}`;
  }
  return skillName;
}

// Get equipment description
function getEquipmentDescription(equipment) {
  const clothing = equipment?.clothes || equipment?.armor || "simple clothes";
  const weapon = equipment?.weapon || equipment?.back || "a simple weapon";

  return {
    clothing: clothing.split(" ").slice(1).join(" "), // Remove status
    weapon: weapon.split(" ").slice(1).join(" "), // Remove status
  };
}

// Generate characters for a specific location using deterministic generation
export function generateLocationCharacters(locationType, x, y, count = null) {
  const locationConfig = locationCharacterAvailability[locationType];
  if (!locationConfig) {
    console.warn(`No configuration found for location type: ${locationType}`);
    return [];
  }

  // Use character count from location config if not specified
  if (count === null) {
    const countRange = locationConfig.characterCount || { min: 4, max: 4 };
    count =
      Math.floor(Math.random() * (countRange.max - countRange.min + 1)) +
      countRange.min;
  }

  const characters = [];
  const currentDate = getCurrentGameDate();
  const dateHash = hash(currentDate.getTime(), 0, 1); // Use game date for deterministic generation

  for (let i = 0; i < count; i++) {
    // Generate deterministic character based on position and date
    const characterSeed = hash(x, y, i + dateHash);

    // Generate character class based on location probabilities and seed
    const className = generateClassForLocation(
      locationConfig.classProbabilities,
      characterSeed
    );

    // Generate character with specific class and seed
    const character = characterGeneration.generateCharacter({
      className: className,
      isPlayer: false,
      seed: characterSeed, // Pass seed for deterministic generation
    });

    // Add recruitment-specific data
    character.recruitmentCost = calculateRecruitmentCost(character);
    character.locationAvailability = {
      locationType: locationType,
      availableUntil: calculateAvailabilityEndDate(locationType),
      refreshDate: new Date().toISOString(),
    };

    characters.push(character);
  }

  return characters;
}

// Get characters for a specific location (checking persistent storage first)
export function getLocationCharacters(locationType, x, y) {
  const locationKey = `${x},${y}`;

  // Check if characters exist for this location
  const existingCharacters = gameState.npcCharacters.filter(
    (npc) =>
      npc.position.x === x &&
      npc.position.y === y &&
      npc.position.locationType === locationType
  );

  if (existingCharacters.length > 0) {
    // Check if characters need refresh based on creation date
    const refreshedCharacters = [];

    existingCharacters.forEach((npcData) => {
      const character = npcData.character;
      const creationDate = new Date(character.id.split("_")[1]);
      const daysSinceCreation = Math.floor(
        (Date.now() - creationDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      const locationConfig = locationCharacterAvailability[locationType];
      const refreshInterval = locationConfig?.refreshInterval || 14;

      if (daysSinceCreation >= refreshInterval) {
        // Character needs refresh - roll for migration/vanishing
        const migrationResult = processCharacterMigration(
          character,
          locationType,
          npcData
        );
        if (migrationResult) {
          refreshedCharacters.push(migrationResult);
        }
      } else {
        // Character is still available
        refreshedCharacters.push(character);
      }
    });

    // Remove processed characters from storage
    gameState.npcCharacters = gameState.npcCharacters.filter(
      (npc) =>
        !(
          npc.position.x === x &&
          npc.position.y === y &&
          npc.position.locationType === locationType
        )
    );

    // Add remaining characters back to storage
    refreshedCharacters.forEach((character) => {
      gameState.npcCharacters.push({
        character: character,
        position: { x, y, locationType },
        migrationCount: 0,
        isPersistent: false,
      });
    });

    return refreshedCharacters;
  }

  // No existing characters - generate new ones
  const newCharacters = generateLocationCharacters(locationType, x, y);

  // Store new characters
  newCharacters.forEach((character) => {
    gameState.npcCharacters.push({
      character: character,
      position: { x, y, locationType },
      migrationCount: 0,
      isPersistent: false,
    });
  });

  return newCharacters;
}

// Process character migration/vanishing
function processCharacterMigration(character, currentLocationType, npcData) {
  const locationConfig = locationCharacterAvailability[currentLocationType];
  if (!locationConfig) return null;

  // Calculate migration probability based on location type
  let migrationProbability = 0.3; // Default 30% chance
  if (currentLocationType === "city") {
    migrationProbability = 0.5; // Cities have higher migration rate
  }

  const random = Math.random();

  if (random <= migrationProbability) {
    // Character migrates
    const newLocation = selectMigrationLocation(currentLocationType);
    if (newLocation) {
      // Increment migration count
      npcData.migrationCount++;

      // Check if character becomes persistent (migrated more than once)
      if (npcData.migrationCount > 1) {
        npcData.isPersistent = true;
        console.log(
          `Character ${character.firstName} ${character.lastName} became persistent after ${npcData.migrationCount} migrations`
        );
      }

      // Roll for character improvement during migration
      const improvedCharacter = rollCharacterImprovement(character);

      // Update character location
      improvedCharacter.locationAvailability = {
        locationType: newLocation,
        availableUntil: calculateAvailabilityEndDate(newLocation),
        refreshDate: new Date().toISOString(),
      };

      // Store migrated character in new location
      gameState.npcCharacters.push({
        character: improvedCharacter,
        position: {
          x: gameState.px,
          y: gameState.py,
          locationType: newLocation,
        }, // Will be updated when player visits
        migrationCount: npcData.migrationCount,
        isPersistent: npcData.isPersistent,
      });

      console.log(
        `Character ${character.firstName} migrated from ${currentLocationType} to ${newLocation}`
      );
      return null; // Character is no longer at original location
    }
  }

  // Character vanishes (doesn't migrate)
  console.log(
    `Character ${character.firstName} vanished from ${currentLocationType}`
  );
  return null;
}

// Select migration location
function selectMigrationLocation(currentLocationType) {
  const possibleLocations = Object.keys(locationCharacterAvailability).filter(
    (loc) =>
      loc !== currentLocationType &&
      !locationCharacterAvailability[loc].recruitmentChance
  );

  if (possibleLocations.length === 0) return null;

  return possibleLocations[
    Math.floor(Math.random() * possibleLocations.length)
  ];
}

// Roll for character improvement during migration
function rollCharacterImprovement(character) {
  const improvedCharacter = { ...character };

  // 20% chance to gain a level
  if (Math.random() < 0.2) {
    improvedCharacter.level = (improvedCharacter.level || 1) + 1;
    console.log(`${character.firstName} gained a level during migration!`);
  }

  // 15% chance to improve a random stat by 1
  if (Math.random() < 0.15) {
    const stats = Object.keys(improvedCharacter.stats).filter(
      (stat) => stat !== "LUCK"
    );
    const randomStat = stats[Math.floor(Math.random() * stats.length)];
    improvedCharacter.stats[randomStat]++;
    console.log(
      `${character.firstName} improved ${randomStat} during migration!`
    );
  }

  // 10% chance to improve a random skill by 0.5
  if (Math.random() < 0.1) {
    const skills = Object.keys(improvedCharacter.skills || {});
    if (skills.length > 0) {
      const randomSkill = skills[Math.floor(Math.random() * skills.length)];
      improvedCharacter.skills[randomSkill] =
        (improvedCharacter.skills[randomSkill] || 0) + 0.5;
      console.log(
        `${character.firstName} improved ${randomSkill} during migration!`
      );
    }
  }

  return improvedCharacter;
}

// Generate class based on location probabilities with optional seed
function generateClassForLocation(classProbabilities, seed = null) {
  const random = seed !== null ? seed : Math.random();
  let cumulative = 0;

  for (const [className, probability] of Object.entries(classProbabilities)) {
    cumulative += probability;
    if (random <= cumulative) {
      return className;
    }
  }

  // Fallback to first available class
  return Object.keys(classProbabilities)[0];
}

// Calculate recruitment cost for a character
export function calculateRecruitmentCost(character) {
  const { classLevel, class: className } = character;
  const classData = classDatabase[className];
  const rarity = classData?.rarity || "common";

  // Base cost by level
  const baseCost =
    recruitmentCosts.baseCosts[classLevel] || recruitmentCosts.baseCosts[1];

  // Apply rarity multiplier
  const multiplier = recruitmentCosts.rarityMultipliers[rarity] || 1.0;
  const goldCost = Math.floor(baseCost * multiplier);

  // Check for rare item requirements
  const itemRequirements =
    recruitmentCosts.rareItemRequirements[className] || [];

  return {
    gold: goldCost,
    items: itemRequirements,
  };
}

// Calculate availability end date for a location
function calculateAvailabilityEndDate(locationType) {
  const locationConfig = locationCharacterAvailability[locationType];
  if (!locationConfig) return null;

  const now = new Date();
  const endDate = new Date(
    now.getTime() + locationConfig.refreshInterval * 24 * 60 * 60 * 1000
  );
  return endDate.toISOString();
}

// Check if character is still available for recruitment
export function isCharacterAvailable(character) {
  if (!character.locationAvailability) return false;

  const now = new Date();
  const availableUntil = new Date(
    character.locationAvailability.availableUntil
  );

  return now <= availableUntil;
}

// Check if player can recruit character (level restriction)
export function canPlayerRecruitCharacter(character) {
  const playerLevel = gameState.playerCharacter?.level || 1;
  const characterLevel = character.level || 1;

  return characterLevel <= playerLevel;
}

// Get recruitment error message for level restriction
export function getRecruitmentErrorMessage(character) {
  const playerLevel = gameState.playerCharacter?.level || 1;
  const characterLevel = character.level || 1;

  if (characterLevel > playerLevel) {
    return "You are not so strong/smart/important to work with me";
  }

  return null;
}

// Check if location has recruitment opportunities
export function hasRecruitmentOpportunities(locationType) {
  const locationConfig = locationCharacterAvailability[locationType];
  return !!locationConfig;
}

// Check if special location has rare recruitment opportunity
export function checkSpecialLocationRecruitment(locationType, x, y) {
  const locationConfig = locationCharacterAvailability[locationType];
  if (!locationConfig || !locationConfig.recruitmentChance) return null;

  // Use deterministic random based on location coordinates and game date
  const currentDate = getCurrentGameDate();
  const dateHash = hash(currentDate.getTime(), 0, 1);
  const locationHash = hash(x, y, dateHash);
  const deterministicRandom = locationHash; // This will be 0-1

  if (deterministicRandom <= locationConfig.recruitmentChance) {
    // Generate single character for special location using deterministic seed
    const characterSeed = hash(x, y, dateHash + 1); // Different seed for character generation
    const character = characterGeneration.generateCharacter({
      className: generateClassForLocation(
        locationConfig.classProbabilities,
        characterSeed
      ),
      isPlayer: false,
      seed: characterSeed,
    });

    // Special location characters have shorter availability (1 week)
    character.recruitmentCost = calculateRecruitmentCost(character);
    character.locationAvailability = {
      locationType: locationType,
      availableUntil: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ).toISOString(), // 1 week
      refreshDate: new Date().toISOString(),
      isSpecialLocation: true,
    };

    return character;
  }

  return null;
}

// Update character availability based on time passed
export function updateCharacterAvailability(character) {
  if (!character.locationAvailability) return character;

  const now = new Date();
  const refreshDate = new Date(character.locationAvailability.refreshDate);
  const daysSinceRefresh = Math.floor(
    (now - refreshDate) / (1000 * 60 * 60 * 24)
  );

  // Update availability based on location type
  const locationType = character.locationAvailability.locationType;
  const locationConfig = locationCharacterAvailability[locationType];

  if (!locationConfig) return character;

  // Calculate new availability end date
  const newAvailableUntil = new Date(
    now.getTime() + locationConfig.refreshInterval * 24 * 60 * 60 * 1000
  );
  character.locationAvailability.availableUntil =
    newAvailableUntil.toISOString();
  character.locationAvailability.refreshDate = now.toISOString();

  return character;
}

// Get available characters for a location
export function getAvailableCharacters(locationType) {
  // This would typically check a database or stored character pool
  // For now, we'll generate fresh characters each time
  return generateLocationCharacters(locationType, 4);
}

// Calculate character departure probability based on time
export function getCharacterDepartureProbability(character) {
  if (!character.locationAvailability) return 0;

  const now = new Date();
  const refreshDate = new Date(character.locationAvailability.refreshDate);
  const daysSinceRefresh = Math.floor(
    (now - refreshDate) / (1000 * 60 * 60 * 24)
  );

  const locationType = character.locationAvailability.locationType;
  const locationConfig = locationCharacterAvailability[locationType];

  if (!locationConfig) return 0;

  // Special locations: 100% departure after 1 week
  if (character.locationAvailability.isSpecialLocation) {
    return daysSinceRefresh >= 7 ? 1.0 : 0;
  }

  // Cities: escalating probability (1 week 30%, 2 weeks 40%, 3 weeks 50%, etc.)
  if (locationType === "city") {
    const weeksSinceRefresh = Math.floor(daysSinceRefresh / 7);
    const baseProbability = 0.3 + weeksSinceRefresh * 0.1; // 30%, 40%, 50%, etc.
    return Math.min(0.9, baseProbability); // Cap at 90%
  }

  // Other locations: lower probability, longer intervals
  const weeksSinceRefresh = Math.floor(daysSinceRefresh / 7);
  const baseProbability = 0.1 + weeksSinceRefresh * 0.05; // 10%, 15%, 20%, etc.
  return Math.min(0.5, baseProbability); // Cap at 50%
}

// Migrate character to another location
export function migrateCharacter(character, newLocationType) {
  if (!character.locationAvailability) return character;

  // Keep same stats and name, update timestamp
  const now = new Date();
  character.locationAvailability = {
    locationType: newLocationType,
    availableUntil: calculateAvailabilityEndDate(newLocationType),
    refreshDate: now.toISOString(),
    migratedFrom: character.locationAvailability.locationType,
  };

  return character;
}

// Process character departures for a location
export function processCharacterDepartures(locationType) {
  // This would typically process a stored character pool
  // For now, we'll simulate by checking if characters should depart
  const characters = getAvailableCharacters(locationType);
  const remainingCharacters = [];

  characters.forEach((character) => {
    const departureProbability = getCharacterDepartureProbability(character);
    const random = Math.random();

    if (random > departureProbability) {
      // Character stays
      remainingCharacters.push(character);
    } else {
      // Character departs - could migrate to another location
      const migrationChance = Math.random();
      if (migrationChance < 0.3) {
        // 30% chance to migrate
        const possibleLocations = Object.keys(
          locationCharacterAvailability
        ).filter(
          (loc) =>
            loc !== locationType &&
            !locationCharacterAvailability[loc].recruitmentChance
        );
        if (possibleLocations.length > 0) {
          const newLocation =
            possibleLocations[
              Math.floor(Math.random() * possibleLocations.length)
            ];
          const migratedCharacter = migrateCharacter(character, newLocation);
          // In a real implementation, this would be stored in the new location's character pool
          console.log(
            `Character ${character.firstName} migrated from ${locationType} to ${newLocation}`
          );
        }
      }
      // Otherwise, character is removed from the game
      console.log(
        `Character ${character.firstName} departed from ${locationType}`
      );
    }
  });

  return remainingCharacters;
}

// Main recruitment system object
export const recruitmentSystem = {
  generateCharacterDescription,
  generateLocationCharacters,
  getLocationCharacters,
  calculateRecruitmentCost,
  isCharacterAvailable,
  canPlayerRecruitCharacter,
  getRecruitmentErrorMessage,
  hasRecruitmentOpportunities,
  checkSpecialLocationRecruitment,
  updateCharacterAvailability,
  getAvailableCharacters,
  getCharacterDepartureProbability,
  migrateCharacter,
  processCharacterDepartures,
  locationCharacterAvailability,
  statDescriptions,
  skillDescriptions,
  recruitmentCosts,
};

export default recruitmentSystem;
