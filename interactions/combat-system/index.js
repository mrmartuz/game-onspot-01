// Combat system exports - single entry point for enhanced combat
export { CombatEntity, Monster, Ally } from "./entities.js";
export {
  calculateCharacterHealth,
  calculateCharacterDamage,
  calculateCharacterDefense,
  calculateCharacterAccuracy,
  calculateCharacterInitiative,
  progressSkill,
  SKILL_PROGRESSION_RATE,
} from "./character-calculations.js";
export {
  creatureTemplates,
  getRandomDiscoveryMessage,
  getRandomDetectionMessage,
  getCreatureRarityColor,
} from "./creature-templates.js";
export {
  generateMonsters,
  generateCreature,
  scaleCreatureStats,
  generateCreatureEquipment,
  generateEquipmentItem,
  generateTeamComposition,
  testCreatureGeneration,
} from "./creature-generation.js";
export {
  calculateDetectionBonus,
  generateDetectionMessage,
  calculateStealthModifier,
  calculateInitiative,
} from "./detection-stealth.js";
export { allyAI, monsterAI, generateAllies } from "./ai.js";
export { getCombatStatus, handleEnhancedCombat } from "./combat-loop.js";
export { handleEnhancedCombatDialog } from "./combat-dialog.js";
