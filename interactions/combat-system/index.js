// Combat system exports - single entry point for enhanced combat

// Entity classes
export { CombatEntity, Monster, Ally } from "./entities.js";

// Character calculations (re-exports from combat-calculations via character-calculations)
export {
  calculateCharacterHealth,
  calculateCharacterDamage,
  calculateCharacterDefense,
  calculateCharacterAccuracy,
  calculateCharacterInitiative,
  progressSkill,
  SKILL_PROGRESSION_RATE,
  getPrimaryWeaponSkill,
  getEquipmentDamageBonus,
  getEquipmentDefenseBonus,
  getEquipmentAccuracyBonus,
  getEquipmentInitiativeBonus,
  getClassHealthBonus,
  getClassDamageBonus,
  getClassDefenseBonus,
  getClassAccuracyBonus,
  getSkillDamageBonus,
  getSkillDefenseBonus,
  getSkillAccuracyBonus,
  getSkillInitiativeBonus,
} from "./character-calculations.js";

// Equipment combat helpers
export {
  getPrimaryWeaponSkill as getWeaponSkillFromEquipment,
  getWeaponDamageBonus,
  getArmorDefenseBonus,
  getShieldDefenseBonus,
  getWeaponAccuracyBonus,
  getEquipmentInitiativeModifier,
} from "./equipment-combat-helpers.js";

// Creature generation
export {
  generateMonsters,
  generateCreature,
  generateCreatureEquipment,
  generateEquipmentItem,
  generateTeamComposition,
  testCreatureGeneration,
} from "./creature-generation.js";

// Creature scaling
export {
  scaleCreatureStats,
  getClassHealthBonus as getCreatureClassHealthBonus,
} from "./creature-scaling.js";

// Creature loot
export {
  calculateExperienceValue,
  generateLootTable,
  generateRandomLootItem,
} from "./creature-loot.js";

// Creature templates
export {
  creatureTemplates,
  getRandomDiscoveryMessage,
  getRandomDetectionMessage,
  getCreatureRarityColor,
} from "./creature-templates.js";

// Detection and stealth
export {
  calculateDetectionBonus,
  generateDetectionMessage,
  calculateStealthModifier,
  calculateInitiative,
} from "./detection-stealth.js";

// AI
export { allyAI, monsterAI, generateAllies } from "./ai.js";

// Combat loop
export { getCombatStatus, handleEnhancedCombat } from "./combat-loop.js";

// Combat dialog (orchestrator)
export { handleEnhancedCombatDialog } from "./combat-dialog.js";

// Group generation
export * from "./group-generation.js";
export * from "./group-generation-integration.js";

// Location systems
export * from "./location-rooms.js";
export * from "./location-tracking.js";
export * from "./location-rewards.js";
export * from "./deterministic-generation.js";

// Combat phases
export {
  handleDetectionPhase,
  handleEngagementPhase,
  handleCombatPhase,
  handleResolutionPhase,
} from "./combat-phases.js";

// Combat state
export {
  COMBAT_PHASES,
  getCombatState,
  resetCombatState,
  updateCombatState,
  setCombatStateProperty,
  getCombatStateProperty,
} from "./combat-state.js";

// Combat grid
export {
  initializeCombatPositions,
  generateCombatGrid,
  updateCombatPositions,
} from "./combat-grid.js";

// Monster tiers database
export {
  monsterTiers,
  monsterCountRules,
  getAllMonsterTypes,
  getMonsterTypesByTier,
} from "./databases/monster-tiers.js";

// Combat UI helpers
export {
  formatMonsterList,
  formatAllyList,
  formatPlayerTurnMessage,
  formatAttackMessage,
  createTargetChoice,
  createDialogChoicesWithGrid,
  createCombatActionButtons,
  createEngagementActionButtons,
} from "./combat-ui.js";
