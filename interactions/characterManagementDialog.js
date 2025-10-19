// Character Management Interface
// Provides comprehensive character management including stats, skills, equipment, and history

import { gameState } from "../gamestate/game_variables.js";
import { showChoiceDialog } from "./showDialog.js";
import { getGroupBonus } from "../utils.js";

// Class emoji mapping for display
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

// Race emoji mapping for display
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

export async function showCharacterManagementDialog() {
  const message = "👥 CHARACTER MANAGEMENT";

  const components = [
    {
      type: "message",
      label: "Manage your characters and companions:",
      value: "",
    },
    {
      type: "button",
      label: "👤 Player Character",
      value: "player",
      disabled: !gameState.playerCharacter,
    },
    {
      type: "button",
      label: `👥 Group Members (${gameState.group.length})`,
      value: "group",
      disabled: gameState.group.length === 0,
    },
    {
      type: "button",
      label: "📊 Group Overview",
      value: "overview",
    },
    {
      type: "button",
      label: "❌ Close",
      value: "close",
    },
  ];

  const choice = await showChoiceDialog(message, components);

  switch (choice) {
    case "player":
      if (gameState.playerCharacter) {
        return await showPlayerCharacterDialog();
      }
      break;
    case "group":
      if (gameState.group.length > 0) {
        return await showGroupMembersDialog();
      }
      break;
    case "overview":
      return await showGroupOverviewDialog();
    case "close":
      return "close";
    default:
      return "close";
  }
}

async function showPlayerCharacterDialog() {
  const player = gameState.playerCharacter;
  const emoji = classEmoji[player.class] || "👤";
  const raceEmojiIcon = raceEmoji[player.race] || "👤";

  let message = `👤 **PLAYER CHARACTER**\n\n`;
  message += `Name: ${player.firstName} ${player.lastName}\n`;
  message += `Race: ${player.race} ${raceEmojiIcon} | Class: ${player.class} ${emoji}\n`;
  message += `Gender: ${player.gender} | Level: ${player.level || 1}\n`;
  message += `Health: ${player.health?.current || 0}/${
    player.health?.max || 0
  } ❤️‍🩹\n\n`;

  // Display stats
  if (player.stats) {
    message += `📊 **STATS:**\n`;
    message += `STR: ${player.stats.STR} | DEX: ${player.stats.DEX} | CON: ${player.stats.CON}\n`;
    message += `INT: ${player.stats.INT} | WIS: ${player.stats.WIS} | CHA: ${player.stats.CHA} | LUCK: ${player.stats.LUCK}\n\n`;
  }

  // Display top skills
  if (player.skills) {
    message += `🎯 **TOP SKILLS:**\n`;
    const topSkills = Object.entries(player.skills)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([skill, level]) => `${skill}: ${level.toFixed(1)}`)
      .join("\n");
    message += `${topSkills}\n\n`;
  }

  // Display equipment
  if (player.equipment) {
    message += `⚔️ **EQUIPMENT:**\n`;
    if (player.equipment.armor) {
      message += `Armor: ${player.equipment.armor}\n`;
    }
    if (player.equipment.weapon) {
      message += `Weapon: ${player.equipment.weapon}\n`;
    }
    if (player.equipment.tool) {
      message += `Tool: ${player.equipment.tool}\n`;
    }
    message += "\n";
  }

  const components = [
    {
      type: "message",
      label: message,
      value: "",
    },
    {
      type: "button",
      label: "📈 Skill Details",
      value: "skills",
    },
    {
      type: "button",
      label: "⚔️ Equipment Details",
      value: "equipment",
    },
    {
      type: "button",
      label: "📜 Character History",
      value: "history",
    },
    {
      type: "button",
      label: "❌ Back",
      value: "back",
    },
  ];

  const choice = await showChoiceDialog("Player Character Details", components);

  switch (choice) {
    case "skills":
      return await showPlayerSkillsDialog();
    case "equipment":
      return await showPlayerEquipmentDialog();
    case "history":
      return await showPlayerHistoryDialog();
    case "back":
      return await showCharacterManagementDialog();
    default:
      return await showCharacterManagementDialog();
  }
}

async function showGroupMembersDialog() {
  const message = `👥 **GROUP MEMBERS** (${gameState.group.length})\n\n`;

  let memberList = "";
  gameState.group.forEach((member, index) => {
    const emoji = classEmoji[member.class] || "👤";
    const raceEmojiIcon = raceEmoji[member.race] || "👤";

    memberList += `${index + 1}. ${member.firstName} ${member.lastName}\n`;
    memberList += `   ${member.race} ${raceEmojiIcon} ${
      member.class
    } ${emoji} | Level ${member.level || 1}\n`;
    memberList += `   Health: ${member.health?.current || 0}/${
      member.health?.max || 0
    }\n`;

    // Show top 2 skills
    if (member.skills) {
      const topSkills = Object.entries(member.skills)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 2)
        .map(([skill, level]) => `${skill}:${level.toFixed(1)}`)
        .join(", ");
      if (topSkills) {
        memberList += `   Skills: ${topSkills}\n`;
      }
    }
    memberList += "\n";
  });

  const components = [
    {
      type: "message",
      label: message + memberList,
      value: "",
    },
    {
      type: "button",
      label: "👤 View Member Details",
      value: "details",
    },
    {
      type: "button",
      label: "❌ Back",
      value: "back",
    },
  ];

  const choice = await showChoiceDialog("Group Members", components);

  switch (choice) {
    case "details":
      return await showMemberSelectionDialog();
    case "back":
      return await showCharacterManagementDialog();
    default:
      return await showCharacterManagementDialog();
  }
}

async function showMemberSelectionDialog() {
  const message = "Select a group member to view details:";

  const components = [
    {
      type: "message",
      label: message,
      value: "",
    },
  ];

  // Add buttons for each group member
  gameState.group.forEach((member, index) => {
    const emoji = classEmoji[member.class] || "👤";
    components.push({
      type: "button",
      label: `${index + 1}. ${member.firstName} ${member.lastName} ${emoji}`,
      value: `member_${index}`,
    });
  });

  components.push({
    type: "button",
    label: "❌ Back",
    value: "back",
  });

  const choice = await showChoiceDialog("Select Group Member", components);

  if (choice.startsWith("member_")) {
    const memberIndex = parseInt(choice.split("_")[1]);
    const member = gameState.group[memberIndex];
    return await showMemberDetailsDialog(member, memberIndex);
  } else if (choice === "back") {
    return await showGroupMembersDialog();
  } else {
    return await showGroupMembersDialog();
  }
}

async function showMemberDetailsDialog(member, memberIndex) {
  const emoji = classEmoji[member.class] || "👤";
  const raceEmojiIcon = raceEmoji[member.race] || "👤";

  let message = `👤 **GROUP MEMBER DETAILS**\n\n`;
  message += `Name: ${member.firstName} ${member.lastName}\n`;
  message += `Race: ${member.race} ${raceEmojiIcon} | Class: ${member.class} ${emoji}\n`;
  message += `Gender: ${member.gender} | Level: ${member.level || 1}\n`;
  message += `Health: ${member.health?.current || 0}/${
    member.health?.max || 0
  } ❤️‍🩹\n\n`;

  // Display stats
  if (member.stats) {
    message += `📊 **STATS:**\n`;
    message += `STR: ${member.stats.STR} | DEX: ${member.stats.DEX} | CON: ${member.stats.CON}\n`;
    message += `INT: ${member.stats.INT} | WIS: ${member.stats.WIS} | CHA: ${member.stats.CHA} | LUCK: ${member.stats.LUCK}\n\n`;
  }

  // Display top skills
  if (member.skills) {
    message += `🎯 **TOP SKILLS:**\n`;
    const topSkills = Object.entries(member.skills)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([skill, level]) => `${skill}: ${level.toFixed(1)}`)
      .join("\n");
    message += `${topSkills}\n\n`;
  }

  // Display equipment
  if (member.equipment) {
    message += `⚔️ **EQUIPMENT:**\n`;
    if (member.equipment.armor) {
      message += `Armor: ${member.equipment.armor}\n`;
    }
    if (member.equipment.weapon) {
      message += `Weapon: ${member.equipment.weapon}\n`;
    }
    if (member.equipment.tool) {
      message += `Tool: ${member.equipment.tool}\n`;
    }
    message += "\n";
  }

  const components = [
    {
      type: "message",
      label: message,
      value: "",
    },
    {
      type: "button",
      label: "📈 Skill Details",
      value: "skills",
    },
    {
      type: "button",
      label: "⚔️ Equipment Details",
      value: "equipment",
    },
    {
      type: "button",
      label: "📜 Character History",
      value: "history",
    },
    {
      type: "button",
      label: "❌ Back",
      value: "back",
    },
  ];

  const choice = await showChoiceDialog(
    `${member.firstName} ${member.lastName} Details`,
    components
  );

  switch (choice) {
    case "skills":
      return await showMemberSkillsDialog(member, memberIndex);
    case "equipment":
      return await showMemberEquipmentDialog(member, memberIndex);
    case "history":
      return await showMemberHistoryDialog(member, memberIndex);
    case "back":
      return await showMemberSelectionDialog();
    default:
      return await showMemberSelectionDialog();
  }
}

async function showGroupOverviewDialog() {
  const totalGroupSize =
    (gameState.playerCharacter ? 1 : 0) + gameState.group.length;

  let message = `📊 **GROUP OVERVIEW**\n\n`;
  message += `Group Size: ${totalGroupSize} members\n`;
  message += `Group Name: ${gameState.groupName || "Unnamed Group"}\n\n`;

  // Show group composition
  if (gameState.playerCharacter) {
    const playerEmoji = classEmoji[gameState.playerCharacter.class] || "👤";
    message += `👤 Player: ${gameState.playerCharacter.firstName} ${gameState.playerCharacter.lastName} (${gameState.playerCharacter.class}) ${playerEmoji}\n`;
  }

  if (gameState.group.length > 0) {
    message += `👥 Companions: ${gameState.group.length}\n`;

    // Count classes
    const classCounts = {};
    gameState.group.forEach((member) => {
      classCounts[member.class] = (classCounts[member.class] || 0) + 1;
    });

    Object.entries(classCounts).forEach(([className, count]) => {
      const emoji = classEmoji[className] || "👤";
      message += `   ${className} ${emoji}: ${count}\n`;
    });
  }

  message += `\n📈 **ACTIVE BONUSES:**\n`;

  // Show combined bonuses
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

  const components = [
    {
      type: "message",
      label: message,
      value: "",
    },
    {
      type: "button",
      label: "❌ Back",
      value: "back",
    },
  ];

  const choice = await showChoiceDialog("Group Overview", components);

  if (choice === "back") {
    return await showCharacterManagementDialog();
  } else {
    return await showCharacterManagementDialog();
  }
}

// Skill details dialogs
async function showPlayerSkillsDialog() {
  const player = gameState.playerCharacter;
  return await showSkillsDialog(player, "Player Character Skills", "player");
}

async function showMemberSkillsDialog(member, memberIndex) {
  return await showSkillsDialog(
    member,
    `${member.firstName} ${member.lastName} Skills`,
    `member_${memberIndex}`
  );
}

async function showSkillsDialog(character, title, returnContext) {
  if (!character.skills) {
    await showChoiceDialog("No skills available for this character.", [
      { type: "button", label: "❌ Back", value: "back" },
    ]);
    return returnContext === "player"
      ? await showPlayerCharacterDialog()
      : await showMemberDetailsDialog(
          character,
          parseInt(returnContext.split("_")[1])
        );
  }

  // Group skills by category
  const skillCategories = {
    Combat: [
      "swordfighting",
      "archery",
      "polearms",
      "unarmed",
      "shieldwork",
      "tactics",
      "intimidation",
    ],
    Magic: [
      "divine_magic",
      "fire_magic",
      "ice_magic",
      "earth_magic",
      "death_magic",
      "nature_magic",
    ],
    Exploration: [
      "navigation",
      "tracking",
      "cartography",
      "survival",
      "climbing",
      "swimming",
      "scouting",
      "stealth",
    ],
    Crafting: [
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
    ],
    Social: [
      "diplomacy",
      "bartering",
      "persuasion",
      "animal_handling",
      "lockpicking",
      "trap_disarming",
      "lore_knowledge",
      "arcana",
      "investigation",
      "insight",
      "performance",
      "deception",
      "sleight_of_hand",
    ],
    Other: ["meditation", "mining", "stonework", "acrobatics"],
  };

  let message = `📈 **${title.toUpperCase()}**\n\n`;

  Object.entries(skillCategories).forEach(([category, skills]) => {
    const categorySkills = skills.filter(
      (skill) => character.skills[skill] && character.skills[skill] > 0
    );
    if (categorySkills.length > 0) {
      message += `**${category}:**\n`;
      categorySkills.forEach((skill) => {
        const level = character.skills[skill];
        const levelText =
          level >= 10
            ? "Master"
            : level >= 7
            ? "Expert"
            : level >= 4
            ? "Good"
            : "Novice";
        message += `  ${skill}: ${level.toFixed(1)} (${levelText})\n`;
      });
      message += "\n";
    }
  });

  const components = [
    {
      type: "message",
      label: message,
      value: "",
    },
    {
      type: "button",
      label: "❌ Back",
      value: "back",
    },
  ];

  const choice = await showChoiceDialog(title, components);

  if (choice === "back") {
    return returnContext === "player"
      ? await showPlayerCharacterDialog()
      : await showMemberDetailsDialog(
          character,
          parseInt(returnContext.split("_")[1])
        );
  } else {
    return returnContext === "player"
      ? await showPlayerCharacterDialog()
      : await showMemberDetailsDialog(
          character,
          parseInt(returnContext.split("_")[1])
        );
  }
}

// Equipment details dialogs
async function showPlayerEquipmentDialog() {
  const player = gameState.playerCharacter;
  return await showEquipmentDialog(
    player,
    "Player Character Equipment",
    "player"
  );
}

async function showMemberEquipmentDialog(member, memberIndex) {
  return await showEquipmentDialog(
    member,
    `${member.firstName} ${member.lastName} Equipment`,
    `member_${memberIndex}`
  );
}

async function showEquipmentDialog(character, title, returnContext) {
  if (!character.equipment) {
    await showChoiceDialog("No equipment available for this character.", [
      { type: "button", label: "❌ Back", value: "back" },
    ]);
    return returnContext === "player"
      ? await showPlayerCharacterDialog()
      : await showMemberDetailsDialog(
          character,
          parseInt(returnContext.split("_")[1])
        );
  }

  let message = `⚔️ **${title.toUpperCase()}**\n\n`;

  if (character.equipment.armor) {
    message += `**Armor:**\n${character.equipment.armor}\n\n`;
  }

  if (character.equipment.weapon) {
    message += `**Weapon:**\n${character.equipment.weapon}\n\n`;
  }

  if (character.equipment.tool) {
    message += `**Tool:**\n${character.equipment.tool}\n\n`;
  }

  if (
    !character.equipment.armor &&
    !character.equipment.weapon &&
    !character.equipment.tool
  ) {
    message += "No equipment equipped.\n\n";
  }

  // Add equipment skill bonuses if available
  message += `**Equipment Bonuses:**\n`;
  message += `Equipment provides skill bonuses based on material, quality, and type.\n`;
  message += `Higher quality equipment provides better bonuses.\n`;

  const components = [
    {
      type: "message",
      label: message,
      value: "",
    },
    {
      type: "button",
      label: "❌ Back",
      value: "back",
    },
  ];

  const choice = await showChoiceDialog(title, components);

  if (choice === "back") {
    return returnContext === "player"
      ? await showPlayerCharacterDialog()
      : await showMemberDetailsDialog(
          character,
          parseInt(returnContext.split("_")[1])
        );
  } else {
    return returnContext === "player"
      ? await showPlayerCharacterDialog()
      : await showMemberDetailsDialog(
          character,
          parseInt(returnContext.split("_")[1])
        );
  }
}

// History dialogs
async function showPlayerHistoryDialog() {
  const player = gameState.playerCharacter;
  return await showHistoryDialog(player, "Player Character History", "player");
}

async function showMemberHistoryDialog(member, memberIndex) {
  return await showHistoryDialog(
    member,
    `${member.firstName} ${member.lastName} History`,
    `member_${memberIndex}`
  );
}

async function showHistoryDialog(character, title, returnContext) {
  let message = `📜 **${title.toUpperCase()}**\n\n`;

  if (character.history) {
    message += character.history;
  } else {
    message += `**Character Background:**\n`;
    message += `${character.firstName} ${character.lastName} is a ${character.race} ${character.class}.\n`;
    message += `They joined the group and have been a valuable companion.\n\n`;

    message += `**Recent Events:**\n`;
    message += `• Joined the group\n`;
    message += `• Participated in various adventures\n`;
    message += `• Contributed to group success\n`;
  }

  message += `\n\n**Character ID:** ${character.id || "Unknown"}\n`;
  message += `**Recruitment Cost:** ${
    character.recruitmentCost ? `${character.recruitmentCost.gold}g` : "N/A"
  }\n`;

  const components = [
    {
      type: "message",
      label: message,
      value: "",
    },
    {
      type: "button",
      label: "❌ Back",
      value: "back",
    },
  ];

  const choice = await showChoiceDialog(title, components);

  if (choice === "back") {
    return returnContext === "player"
      ? await showPlayerCharacterDialog()
      : await showMemberDetailsDialog(
          character,
          parseInt(returnContext.split("_")[1])
        );
  } else {
    return returnContext === "player"
      ? await showPlayerCharacterDialog()
      : await showMemberDetailsDialog(
          character,
          parseInt(returnContext.split("_")[1])
        );
  }
}
