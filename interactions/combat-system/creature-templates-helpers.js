// Creature templates helper functions
import { creatureTemplates } from "./databases/creature-templates-database.js";

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


