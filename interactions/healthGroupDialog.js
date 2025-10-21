// Health Group Dialog
// Displays group status, character information, and bonuses
// Integrated with Character Management Interface for detailed character management

import { gameState } from "../gamestate/game_variables.js";
import { getGroupBonus } from "../utils.js";
import { getShowChoiceDialog } from "../interactions.js";
import { showCharacterManagementDialog } from "./characterManagementDialog.js";

export async function showHealthGroupDialog() {
  let message = "";

  // Calculate total group size (player + NPCs)
  const totalGroupSize =
    (gameState.playerCharacter ? 1 : 0) + gameState.group.length;

  message += `🛡️📍The ${gameState.groupName} ${
    totalGroupSize < 3
      ? "duo"
      : totalGroupSize < 5
      ? "group"
      : totalGroupSize < 7
      ? "party"
      : totalGroupSize < 9
      ? "clan"
      : "tribe"
  }`;
  message += `📍🛡️\n`;

  // Class emoji mapping for display (consistent with character management)
  const classEmoji = {
    fighter: "⚔️",
    archer: "🏹",
    brute: "💪",
    monk: "🧘",
    cleric: "⛪",
    geomancer: "🌍",
    pyromancer: "🔥",
    necromancer: "💀",
    articaster: "❄️",
    martial_artist: "🥋",
    ranger: "🌲",
    explorer: "🔍",
    paladin: "🛡️",
    alchemist: "🧪",
    herbalist: "🌿",
    hunter: "🎯",
    dungeondiver: "🗝️",
    craftsman: "🔨",
  };

  // Race emoji mapping for display (consistent with character management)
  const raceEmoji = {
    Human: "👤",
    Elf: "🧝",
    Dwarf: "🧙",
    Orc: "👹",
    Goblin: "👺",
    Demon: "👿",
    Angel: "👼",
    Undead: "💀",
    Draconic: "🐉",
    Fishman: "🐠",
    Birdman: "🦅",
  };

  // Debug: Log the current state
  console.log("Current gameState.playerCharacter:", gameState.playerCharacter);
  console.log("Current gameState.group:", gameState.group);
  console.log("Current gameState.groupBonus:", gameState.groupBonus);

  // Player character details
  if (gameState.playerCharacter) {
    const player = gameState.playerCharacter;
    const classEmojiIcon = classEmoji[player.class] || "👤";
    const raceEmojiIcon = raceEmoji[player.race] || "👤";

    let playerStats = `👤 **Player Character**\n`;
    playerStats += `Name: ${player.firstName} ${player.lastName}\n`;
    playerStats += `Race: ${player.race} ${raceEmojiIcon} | Class: ${player.class} ${classEmojiIcon}\n`;
    playerStats += `Gender: ${player.gender} | Level: ${player.level || 1}\n`;
    playerStats += `Health: ${player.health?.current || 0}/${
      player.health?.max || 0
    } ❤️‍🩹\n`;

    // Display stats
    if (player.stats) {
      playerStats += `Stats: STR:${player.stats.STR} DEX:${player.stats.DEX} CON:${player.stats.CON} INT:${player.stats.INT} WIS:${player.stats.WIS} CHA:${player.stats.CHA} LUCK:${player.stats.LUCK}\n`;
    }

    // Display top skills
    if (player.skills) {
      const topSkills = Object.entries(player.skills)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([skill, level]) => `${skill}:${level.toFixed(2)}`)
        .join(", ");
      if (topSkills) {
        playerStats += `Top Skills: ${topSkills}\n`;
      }
    }

    message += playerStats + "\n";
  } else {
    message += `👤 **Player Character**\n`;
    message += `Name: ${gameState.name}\n`;
    message += `Health: ${Math.floor(gameState.health)}/100 ❤️‍🩹\n\n`;
  }

  // Group members (NPCs) details
  if (gameState.group.length > 0) {
    message += `👥 **Group Members (${gameState.group.length}):**\n`;

    gameState.group.forEach((member, index) => {
      const classEmojiIcon = classEmoji[member.class] || "👤";
      const raceEmojiIcon = raceEmoji[member.race] || "👤";

      message += `${index + 1}. ${member.firstName} ${member.lastName}\n`;
      message += `   ${member.race} ${raceEmojiIcon} ${
        member.class
      } ${classEmojiIcon} | Level ${member.level || 1}\n`;
      message += `   Gender: ${member.gender} | Health: ${
        member.health?.current || 0
      }/${member.health?.max || 0}\n`;

      // Display top skills
      if (member.skills) {
        const topSkills = Object.entries(member.skills)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 2)
          .map(([skill, level]) => `${skill}:${level.toFixed(2)}`)
          .join(", ");
        if (topSkills) {
          message += `   Skills: ${topSkills}\n`;
        }
      }
      message += "\n";
    });
  } else {
    message += `👥 **Group Members:** None\n\n`;
  }

  message += `📊 **Total Active Bonuses:**\n`;

  // Show combined bonuses (individual + group) for each type
  const bonusTypes = [
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

  bonusTypes.forEach((bonusType) => {
    const totalBonus = getGroupBonus(bonusType);
    if (totalBonus > 0) {
      let emoji = "";
      let description = "";

      switch (bonusType) {
        case "navigation":
          emoji = "🧭";
          description = "Faster movement";
          break;
        case "discovery":
          emoji = "🔍";
          description = "More discovery points";
          break;
        case "food":
          emoji = "🍞";
          description = "Slower food consumption";
          break;
        case "combat":
          emoji = "⚔️";
          description = "Better combat success";
          break;
        case "resource":
          emoji = "🪵";
          description = "More wood from flora";
          break;
        case "plant":
          emoji = "🌱";
          description = "Bonus food from flowers";
          break;
        case "interact":
          emoji = "🤝";
          description = "Better trade prices";
          break;
        case "carry":
          emoji = "📦";
          description = "Increased storage";
          break;
        case "health":
          emoji = "❤️";
          description = "Better healing";
          break;
        case "view":
          emoji = "👁️";
          description = "Increased view distance";
          break;
      }

      message += `${emoji} **${
        bonusType.charAt(0).toUpperCase() + bonusType.slice(1)
      }**: +${totalBonus.toFixed(1)} - ${description}\n`;
    }
  });

  message += `\n📦 **Storage:** ${getMaxStorage()} units\n`;
  message += `💰 **Gold:** ${gameState.gold}\n`;
  message += `🍞 **Food:** ${gameState.food}\n`;
  message += `💧 **Water:** ${gameState.water}\n`;

  const components = [
    { type: "message", label: message, value: "" },
    {
      type: "button",
      label: "👥 Character Management",
      value: "char_mgmt",
    },
    {
      type: "button",
      label: "Detailed Breakdown",
      value: "detailed-breakdown",
    },
    { type: "button", label: "❌ Close", value: "close" },
  ];

  const choice = await getShowChoiceDialog("Group Status", components);

  if (choice === "char_mgmt") {
    await showCharacterManagementDialog();
    return await showHealthGroupDialog(); // Return to health dialog after character management
  } else if (choice === "detailed-breakdown") {
    return showDetailedBreakdownDialog();
  }

  return choice;
}

export async function showDetailedBreakdownDialog() {
  let message = "";
  message += `\n📋 How Bonuses Work (Phase 2.1):\n`;
  message += `• Individual bonuses come from character skills and stats\n`;
  message += `• Group bonuses are additional bonuses from class synergies\n`;
  message += `• Total = Skill-based bonuses + Group synergy bonuses\n\n`;

  let bonusTypes = [
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

  let emoji = {
    navigation: "🧭",
    discovery: "🔍",
    food: "🍞",
    combat: "⚔️",
    resource: "🪵",
    plant: "🌱",
    interact: "🤝",
    carry: "📦",
    health: "❤️",
    view: "👁️",
  };

  if (bonusTypes.every((type) => getGroupBonus(type) === 0)) {
    message += `No active bonuses. Create characters with diverse skills to unlock bonuses!\n`;
  }

  // Show detailed breakdown for active bonuses
  const activeBonusTypes = bonusTypes.filter((type) => getGroupBonus(type) > 0);
  if (activeBonusTypes.length > 0) {
    activeBonusTypes.forEach((bonusType) => {
      const skillBonus = getSkillBasedBonus(bonusType);
      const groupBonus = gameState.groupBonus[bonusType] || 0;
      const totalBonus = getGroupBonus(bonusType);

      message += `${emoji[bonusType]} ${
        bonusType.charAt(0).toUpperCase() + bonusType.slice(1)
      }: `;
      message += `${skillBonus.toFixed(1)} (skills) + `;
      message += `${groupBonus.toFixed(1)} (synergy) = `;
      message += `+${totalBonus.toFixed(1)} (total)\n`;
    });
  }

  const choice = await getShowChoiceDialog(message, [
    { type: "button", label: "👥 Character Management", value: "char_mgmt" },
    { type: "button", label: "❌ Close", value: "close" },
  ]);

  if (choice === "char_mgmt") {
    await showCharacterManagementDialog();
    return await showDetailedBreakdownDialog(); // Return to detailed breakdown after character management
  }

  return choice;
}

// Helper function to calculate skill-based bonuses (similar to getGroupBonus but without groupBonus)
function getSkillBasedBonus(type) {
  const allCharacters = [];

  if (gameState.playerCharacter) {
    allCharacters.push(gameState.playerCharacter);
  }

  allCharacters.push(...gameState.group);

  if (allCharacters.length === 0) {
    return 0;
  }

  let skillBonus = 0;

  switch (type) {
    case "navigation":
      skillBonus = Math.max(
        ...allCharacters.map(
          (char) =>
            (char.skills?.navigation || 0) + (char.skills?.cartography || 0)
        )
      );
      break;

    case "discovery":
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
      skillBonus = allCharacters.reduce((total, char) => {
        const combatSkills = [
          "swords",
          "bows",
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
      skillBonus = Math.max(
        ...allCharacters.map(
          (char) => (char.skills?.herbalism || 0) + (char.skills?.survival || 0)
        )
      );
      break;

    case "interact":
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
      skillBonus = allCharacters.reduce(
        (total, char) => total + Math.floor((char.stats?.STR || 8) / 10),
        0
      );
      break;

    case "health":
      skillBonus = Math.max(
        ...allCharacters.map(
          (char) => (char.skills?.healing || 0) + (char.skills?.herbalism || 0)
        )
      );
      break;

    case "view":
      skillBonus = Math.max(
        ...allCharacters.map(
          (char) => (char.skills?.scouting || 0) + (char.skills?.tracking || 0)
        )
      );
      break;

    default:
      skillBonus = 0;
  }

  return skillBonus;
}

// Helper function to get max storage (imported from utils.js)
function getMaxStorage() {
  const allCharacters = [];

  if (gameState.playerCharacter) {
    allCharacters.push(gameState.playerCharacter);
  }

  allCharacters.push(...gameState.group);

  let baseStorage = allCharacters.reduce(
    (total, char) => total + (char.stats?.STR || 8) * 2,
    0
  );

  baseStorage += 200 * gameState.carts;

  let carryBonus = gameState.groupBonus.carry || 0;
  let bonusStorage = Math.floor(carryBonus);

  return baseStorage + bonusStorage;
}
