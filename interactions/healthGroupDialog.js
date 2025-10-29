// Health Group Dialog
// Displays group status, character information, and bonuses
// Integrated with Character Management Interface for detailed character management

import { gameState } from "../gamestate/game_variables.js";
import { getGroupBonus } from "../utils.js";
import { getShowChoiceDialog } from "../interactions.js";
import {
  classEmoji,
  raceEmoji,
  sexEmoji,
  statEmoji,
} from "../gamestate/emoji-database.js";
import { raceDatabase } from "./character/races.js";
import { classDatabase } from "./combat/classes.js";
import { STAT_CATEGORIES } from "./character/characterCreation-system/constants.js";
import {
  createCharacterIdentityDisplay,
  createStatDisplayGrid,
} from "./character/characterCreation-system/utils/utils-ui.js";
import { showCharacterPreview } from "./character/characterManagement-system/views/character-preview.js";

// Helper function to format character details for display
function formatCharacterDetails(character) {
  if (!character) {
    return [
      {
        type: "message",
        label: "Click on a creature in the grid above to see their details",
        value: "",
      },
    ];
  }
  let components = [];
  // Character Identity Section
  const identityComponents = createCharacterIdentityDisplay(
    character,
    raceDatabase,
    classDatabase,
    raceEmoji,
    classEmoji,
    sexEmoji
  );
  components.push(...identityComponents);

  // Stats Section
  const statComponents = createStatDisplayGrid(
    character.stats,
    statEmoji,
    STAT_CATEGORIES
  );
  components.push(...statComponents);

  return components;
}

export async function showHealthGroupDialog() {
  let message = "";
  let title = "";
  let groupMembersPositions = {};

  // Calculate total group size (player + NPCs)
  const totalGroupSize =
    (gameState.playerCharacter ? 1 : 0) + gameState.group.length;

  title += `${gameState.groupName}`;
  title += `\nAn unknown ${
    totalGroupSize < 3
      ? "duo"
      : totalGroupSize < 5
      ? "group"
      : totalGroupSize < 7
      ? "party"
      : totalGroupSize < 9
      ? "clan"
      : "tribe"
  }\n`;

  // Debug: Log the current state
  "Current gameState.playerCharacter:", gameState.playerCharacter;
  "Current gameState.group:", gameState.group;
  "Current gameState.groupBonus:", gameState.groupBonus;

  // Character details will be displayed dynamically when grid items are clicked

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

  groupMembersPositions = {
    group: gameState.group.map((member) => ({
      position: {
        x: member.position?.x ?? 0,
        y: member.position?.y ?? 0,
      },
      name: member.firstName + " " + member.lastName,
      class: member.class,
      race: member.race,
      level: member.level,
      health: member.health,
      skills: member.skills,
    })),
  };

  // Function to populate grid with group members
  function populateGridWithGroupMembers(groupMembers, gridSize = 10) {
    const tiles = {};

    groupMembers.forEach((member, index) => {
      // Calculate position starting from center
      let x, y;

      if (
        member.position?.x !== undefined &&
        member.position?.y !== undefined
      ) {
        // Use actual position if available
        x = Math.max(0, Math.min(gridSize - 1, member.position.x));
        y = Math.max(0, Math.min(gridSize - 1, member.position.y));
      } else {
        // Distribute from center in a spiral pattern
        const centerX = Math.floor(gridSize / 2);
        const centerY = Math.floor(gridSize / 2);

        // Calculate organic spiral positions - first 5 close, then expanding
        const spiralPositions = [
          // Core group - very close together (radius 1)
          [centerX, centerY], // Center (0) - Player
          [centerX + 1, centerY], // Right (1)
          [centerX, centerY + 1], // Down (2)
          [centerX - 1, centerY], // Left (3)
          [centerX, centerY - 1], // Up (4)

          // Inner ring - slightly further (radius 1.5)
          [centerX + 1, centerY + 1], // Down-Right (5)
          [centerX - 1, centerY + 1], // Down-Left (6)
          [centerX - 1, centerY - 1], // Up-Left (7)
          [centerX + 1, centerY - 1], // Up-Right (8)

          // Outer ring - more distance (radius 2)
          [centerX + 2, centerY], // Further Right (9)
          [centerX, centerY + 2], // Further Down (10)
          [centerX - 2, centerY], // Further Left (11)
          [centerX, centerY - 2], // Further Up (12)

          // Extended positions - even more distance (radius 2.5)
          [centerX + 2, centerY + 1], // Right-Down (13)
          [centerX + 2, centerY - 1], // Right-Up (14)
          [centerX + 1, centerY + 2], // Down-Right-Far (15)
          [centerX - 1, centerY + 2], // Down-Left-Far (16)
          [centerX - 2, centerY + 1], // Left-Down (17)
          [centerX - 2, centerY - 1], // Left-Up (18)
          [centerX - 1, centerY - 2], // Up-Left-Far (19)
          [centerX + 1, centerY - 2], // Up-Right-Far (20)

          // Far positions - significant distance (radius 3)
          [centerX + 3, centerY], // Far Right (21)
          [centerX, centerY + 3], // Far Down (22)
          [centerX - 3, centerY], // Far Left (23)
          [centerX, centerY - 3], // Far Up (24)

          // Very far positions - maximum distance (radius 3.5)
          [centerX + 3, centerY + 1], // Far Right-Down (25)
          [centerX + 3, centerY - 1], // Far Right-Up (26)
          [centerX + 2, centerY + 2], // Far Down-Right (27)
          [centerX - 2, centerY + 2], // Far Down-Left (28)
          [centerX - 3, centerY + 1], // Far Left-Down (29)
          [centerX - 3, centerY - 1], // Far Left-Up (30)
          [centerX - 2, centerY - 2], // Far Up-Left (31)
          [centerX + 2, centerY - 2], // Far Up-Right (32)

          // Extreme positions - edge of grid (radius 4)
          [centerX + 4, centerY], // Very Far Right (33)
          [centerX, centerY + 4], // Very Far Down (34)
          [centerX - 4, centerY], // Very Far Left (35)
          [centerX, centerY - 4], // Very Far Up (36)

          // Corner positions - maximum spread
          [centerX + 4, centerY + 1], // Very Far Right-Down (37)
          [centerX + 4, centerY - 1], // Very Far Right-Up (38)
          [centerX + 3, centerY + 2], // Very Far Down-Right (39)
          [centerX - 3, centerY + 2], // Very Far Down-Left (40)
          [centerX - 4, centerY + 1], // Very Far Left-Down (41)
          [centerX - 4, centerY - 1], // Very Far Left-Up (42)
          [centerX - 3, centerY - 2], // Very Far Up-Left (43)
          [centerX + 3, centerY - 2], // Very Far Up-Right (44)

          // Edge positions - grid boundaries
          [centerX + 4, centerY + 2], // Extreme Right-Down (45)
          [centerX - 4, centerY + 2], // Extreme Left-Down (46)
          [centerX + 4, centerY - 2], // Extreme Right-Up (47)
          [centerX - 4, centerY - 2], // Extreme Left-Up (48)
          [centerX + 2, centerY + 3], // Extreme Down-Right (49)
        ];

        const pos = spiralPositions[index] || [centerX, centerY];
        x = Math.max(0, Math.min(gridSize - 1, pos[0]));
        y = Math.max(0, Math.min(gridSize - 1, pos[1]));
      }

      const cellKey = `${y}-${x}`;

      // Determine emoji based on race only
      let emoji = raceEmoji[member.race] || "👤"; // Default human emoji

      // Try different name properties
      const memberName =
        member.firstName +
          " " +
          member.lastName +
          " - " +
          member.race +
          " " +
          member.class +
          " lvl." +
          member.level || `Member ${index + 1}`;

      // Determine background color based on member type
      let backgroundColor = "#ffffff"; // Default white

      if (index === 0 && gameState.playerCharacter) {
        // Player character gets special color
        backgroundColor = "#e8f4fd"; // Light blue
      } else {
        // Group members get different colors based on their index
        const colors = [
          "red", // Alice blue
          "#f5f5dc", // Beige
          "#ffe4e1", // Misty rose
          "#f0fff0", // Honeydew
          "#fff8dc", // Cornsilk
          "#fdf5e6", // Old lace
          "#faf0e6", // Linen
          "#f5fffa", // Mint cream
          "#fffacd", // Lemon chiffon
          "#e6e6fa", // Lavender
          "#ffe4b5", // Moccasin
          "#f0e68c", // Khaki
          "#dda0dd", // Plum
          "#98fb98", // Pale green
          "#f0ffff", // Azure
          "#ffefd5", // Papaya whip
          "#ffdab9", // Peach puff
          "#e0ffff", // Light cyan
          "#f5deb3", // Wheat
          "#d3d3d3", // Light gray
          "#ffb6c1", // Light pink
          "#ffa07a", // Light salmon
          "#87ceeb", // Sky blue
          "#dda0dd", // Plum
          "#98fb98", // Pale green
          "#f0e68c", // Khaki
          "#ffb6c1", // Light pink
          "#e6e6fa", // Lavender
          "#f5deb3", // Wheat
          "#d3d3d3", // Light gray
          "#ffefd5", // Papaya whip
          "#f0ffff", // Azure
          "#ffe4b5", // Moccasin
          "#ffdab9", // Peach puff
          "#e0ffff", // Light cyan
          "#f0f8ff", // Alice blue
          "#f5f5dc", // Beige
          "#ffe4e1", // Misty rose
          "#f0fff0", // Honeydew
          "#fff8dc", // Cornsilk
          "#fdf5e6", // Old lace
          "#faf0e6", // Linen
          "#f5fffa", // Mint cream
          "#fffacd", // Lemon chiffon
          "#e6e6fa", // Lavender
          "#ffe4b5", // Moccasin
          "#f0e68c", // Khaki
          "#dda0dd", // Plum
          "#98fb98", // Pale green
          "#f0ffff", // Azure
        ];
        backgroundColor = colors[index % colors.length];
      }

      tiles[cellKey] = {
        emoji: emoji,
        name: memberName,
        backgroundColor: backgroundColor,
        characterIndex: index,
      };
    });

    return tiles;
  }

  // Generate tiles for the grid using group members (including player character)
  const allMembers = gameState.playerCharacter
    ? [gameState.playerCharacter, ...gameState.group]
    : gameState.group;
  const groupTiles = populateGridWithGroupMembers(allMembers);

  // Function to handle character selection and update display
  function handleCharacterSelect(characterIndex) {
    const character = allMembers[characterIndex];
    const detailsContainer = document.getElementById(
      "character-details-container"
    );

    if (detailsContainer && character) {
      const characterComponents = formatCharacterDetails(character);

      // Clear existing content
      detailsContainer.innerHTML = "";

      // Render each component matching showDialog.js styling
      characterComponents.forEach((component) => {
        switch (component.type) {
          case "button":
            const btnDiv = document.createElement("div");
            const btn = document.createElement("button");
            btn.textContent = component.label || "";
            btn.disabled = component.disabled || false;

            if (btn.disabled) {
              btn.style.opacity = "0.5";
              btn.style.cursor = "not-allowed";
            }

            btnDiv.appendChild(btn);
            detailsContainer.appendChild(btnDiv);
            break;
          case "message":
            const msgDiv = document.createElement("div");
            const msg = document.createElement("p");
            msg.textContent = component.label || "";
            msgDiv.appendChild(msg);
            detailsContainer.appendChild(msgDiv);
            break;
          case "button_grid":
            const gridContainer = document.createElement("div");
            gridContainer.style.display = "grid";
            gridContainer.style.marginBottom = "10px";

            const columns = component.columns || 2;
            gridContainer.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;

            const gap = component.gap || "6px";
            gridContainer.style.gap = gap;
            gridContainer.style.marginBottom = "0px";
            gridContainer.style.maxWidth = "100%";
            gridContainer.style.boxSizing = "border-box";

            const textSize = component.textSize || "12px";

            if (component.buttons && Array.isArray(component.buttons)) {
              component.buttons.forEach((buttonConfig) => {
                const btn = document.createElement("button");
                btn.textContent = buttonConfig.label || "";
                btn.disabled = buttonConfig.disabled || false;

                btn.style.fontSize = textSize;
                btn.style.minWidth = "0";
                btn.style.maxWidth = "100%";
                btn.style.width = "100%";
                btn.style.height = "auto";
                btn.style.padding = "8px 4px";
                btn.style.overflow = "hidden";
                btn.style.textOverflow = "ellipsis";
                btn.style.whiteSpace = "nowrap";
                btn.style.boxSizing = "border-box";
                btn.style.marginBottom = "0px";
                btn.style.marginTop = gap;

                if (btn.disabled) {
                  btn.style.opacity = "0.5";
                  btn.style.cursor = "not-allowed";
                }

                gridContainer.appendChild(btn);
              });
            }

            detailsContainer.appendChild(gridContainer);
            break;
        }
      });
    }
  }

  const components = [
    {
      type: "squaregrid",
      showCoordinates: false,
      tiles: groupTiles,
      onCharacterSelect: handleCharacterSelect,
    },
    {
      type: "message",
      label: "",
      value: "",
      id: "character-details-container",
    },
    ...formatCharacterDetails(null),
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

  const choice = await getShowChoiceDialog(title, components);

  if (choice === "char_mgmt") {
    // Open character preview directly
    const allMembers = gameState.playerCharacter
      ? [gameState.playerCharacter, ...gameState.group]
      : gameState.group;

    if (allMembers.length === 0) {
      return choice; // No characters to show
    }

    // Format characters array similar to character-list.js
    const characters = [];
    let characterIndex = 0;

    if (gameState.playerCharacter) {
      characters.push({
        character: gameState.playerCharacter,
        type: "player",
        index: characterIndex,
      });
      characterIndex++;
    }

    gameState.group.forEach((member) => {
      characters.push({
        character: member,
        type: "group",
        index: characterIndex,
      });
      characterIndex++;
    });

    // Start with first character (player if exists, otherwise first group member)
    let currentIndex = 0;

    // Show preview with navigation capability
    while (true) {
      const currentCharacter = characters[currentIndex]?.character;
      if (!currentCharacter) {
        break;
      }

      const previewResult = await showCharacterPreview(
        currentCharacter,
        currentIndex,
        characters
      );

      // Handle navigation
      if (previewResult === "nav_previous") {
        // Go to previous character, wrap to last if at first
        if (currentIndex > 0) {
          currentIndex--;
        } else {
          currentIndex = characters.length - 1;
        }
        continue; // Re-show preview with new character
      }

      if (previewResult === "nav_next") {
        // Go to next character, wrap to first if at last
        if (currentIndex < characters.length - 1) {
          currentIndex++;
        } else {
          currentIndex = 0;
        }
        continue; // Re-show preview with new character
      }

      // Go back to health dialog
      if (previewResult === "back") {
        return await showHealthGroupDialog(); // Return to health dialog after character management
      }

      // Return any other result
      return previewResult;
    }
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
    { type: "button", label: "❌ Close", value: "close" },
  ]);

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
