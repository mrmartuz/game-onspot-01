// Creature templates - re-exported from database and helpers

// Re-export creature templates database
export { creatureTemplates } from "./databases/creature-templates-database.js";

// Re-export helper functions
export {
  getRandomDiscoveryMessage,
  getRandomDetectionMessage,
  getCreatureRarityColor,
} from "./creature-templates-helpers.js";
