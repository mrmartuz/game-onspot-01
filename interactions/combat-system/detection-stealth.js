// Detection and stealth systems for combat
import { parseEquipmentString } from "../equipment.js";
import { getArmorStealthModifier } from "./databases/armor-initiative-modifiers.js";

export function calculateDetectionBonus() {
  // Calculate detection bonus based on party composition and skills
  let detectionBonus = 0;

  // Check if player has allies with scouting skills
  const allies = getGameState().allies || [];
  allies.forEach((ally) => {
    if (ally.character && ally.character.skills) {
      const scoutingSkill = ally.character.skills.scouting || 0;
      const trackingSkill = ally.character.skills.tracking || 0;
      detectionBonus +=
        Math.floor(scoutingSkill / 2) + Math.floor(trackingSkill / 3);
    }
  });

  // Check player's own skills
  const player = getGameState().player;
  if (player && player.skills) {
    const scoutingSkill = player.skills.scouting || 0;
    const trackingSkill = player.skills.tracking || 0;
    detectionBonus +=
      Math.floor(scoutingSkill / 2) + Math.floor(trackingSkill / 3);
  }

  // Add wisdom bonus
  if (player && player.stats) {
    detectionBonus += Math.floor(player.stats.WIS / 4);
  }

  return detectionBonus;
}

export function generateDetectionMessage(monsters) {
  const detectedMonsters = monsters.filter((monster) => monster.detected);
  const undiscoveredMonsters = monsters.filter(
    (monster) => !monster.discovered
  );

  if (detectedMonsters.length === 0) {
    return "You don't detect any immediate threats in the area.";
  }

  let message = "You detect the following threats:\n";

  detectedMonsters.forEach((monster) => {
    const distance = Math.sqrt(
      Math.pow(monster.x - getGameState().player.x, 2) +
        Math.pow(monster.y - getGameState().player.y, 2)
    );

    let distanceDescription = "nearby";
    if (distance > 5) distanceDescription = "in the distance";
    if (distance > 10) distanceDescription = "far away";

    message += `- ${monster.name} (${distanceDescription})\n`;
  });

  if (undiscoveredMonsters.length > 0) {
    message += `\nYou sense ${undiscoveredMonsters.length} additional presence(s) but cannot pinpoint their location.`;
  }

  return message;
}

export function calculateStealthModifier() {
  // Calculate stealth modifier based on party composition and skills
  let stealthModifier = 0;

  // Check if player has allies with stealth skills
  const allies = getGameState().allies || [];
  allies.forEach((ally) => {
    if (ally.character && ally.character.skills) {
      const stealthSkill = ally.character.skills.stealth || 0;
      const scoutingSkill = ally.character.skills.scouting || 0;
      stealthModifier +=
        Math.floor(stealthSkill / 2) + Math.floor(scoutingSkill / 4);
    }
  });

  // Check player's own skills
  const player = getGameState().player;
  if (player && player.skills) {
    const stealthSkill = player.skills.stealth || 0;
    const scoutingSkill = player.skills.scouting || 0;
    stealthModifier +=
      Math.floor(stealthSkill / 2) + Math.floor(scoutingSkill / 4);
  }

  // Add dexterity bonus
  if (player && player.stats) {
    stealthModifier += Math.floor(player.stats.DEX / 4);
  }

  // Penalty for heavy armor
  if (player && player.equipment && player.equipment.armor) {
    const parsed = parseEquipmentString(player.equipment.armor);
    if (parsed) {
      stealthModifier += getArmorStealthModifier(parsed.type);
    }
  }

  return stealthModifier;
}

export function calculateInitiative(playerChoice, stealthModifier) {
  // Calculate initiative based on player choice and stealth modifier
  let initiative = 0;

  const player = getGameState().player;
  if (!player || !player.stats) {
    return 0;
  }

  // Base initiative from stats
  initiative +=
    Math.floor(player.stats.DEX / 2) + Math.floor(player.stats.WIS / 2);

  // Add stealth modifier
  initiative += stealthModifier;

  // Add bonus based on player choice
  switch (playerChoice) {
    case "attack":
      initiative += 2; // Aggressive approach
      break;
    case "defend":
      initiative -= 1; // Defensive approach
      break;
    case "flee":
      initiative += 3; // Quick escape
      break;
    case "stealth":
      initiative += stealthModifier; // Double stealth bonus
      break;
    default:
      initiative += 0; // Neutral approach
  }

  // Add random element
  initiative += Math.floor(Math.random() * 6) - 3; // -3 to +3

  return Math.max(0, initiative);
}

// Helper function to get game state (placeholder - should be imported from actual game state)
function getGameState() {
  // This should be replaced with actual game state access
  return {
    player: {
      x: 0,
      y: 0,
      stats: { DEX: 10, WIS: 10 },
      skills: { stealth: 0, scouting: 0 },
      equipment: { armor: "leather" },
    },
    allies: [],
  };
}


