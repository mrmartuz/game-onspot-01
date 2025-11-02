// Character calculations - Thin wrapper around combat-calculations.js
// Re-exports all calculation functions for backward compatibility

// Re-export all combat calculation functions from unified module
export {
  // Main calculation functions
  calculateCharacterHealth,
  calculateCharacterDamage,
  calculateCharacterDefense,
  calculateCharacterAccuracy,
  calculateCharacterInitiative,
  
  // Equipment bonus functions
  getEquipmentDamageBonus,
  getEquipmentDefenseBonus,
  getEquipmentAccuracyBonus,
  getEquipmentInitiativeBonus,
  getEquipmentHealthBonus,
  
  // Class bonus functions
  getClassHealthBonus,
  getClassDamageBonus,
  getClassDefenseBonus,
  getClassAccuracyBonus,
  
  // Skill bonus functions
  getSkillDamageBonus,
  getSkillDefenseBonus,
  getSkillAccuracyBonus,
  getSkillInitiativeBonus,
  
  // Helper functions
  getPrimaryWeaponSkill,
} from "./combat-calculations.js";

// Skill progression system
export const SKILL_PROGRESSION_RATE = 0.1;

export function progressSkill(
  character,
  skillName,
  amount = SKILL_PROGRESSION_RATE
) {
  if (!character.skills) {
    character.skills = {};
  }

  if (!character.skills[skillName]) {
    character.skills[skillName] = 0;
  }

  // Add skill points
  character.skills[skillName] += amount;

  // Check for skill level up (every 1.0 points)
  const currentLevel = Math.floor(character.skills[skillName]);
  const previousLevel = Math.floor(character.skills[skillName] - amount);

  if (currentLevel > previousLevel) {
    `${character.firstName} ${character.lastName} leveled up ${skillName} to level ${currentLevel}!`;

    // Apply skill level bonuses
    if (
      skillName === "swords" ||
      skillName === "bows" ||
      skillName === "polearms"
    ) {
      // Combat skills give damage bonus
      const damageBonus = Math.floor(currentLevel / 2);
      `+${damageBonus} damage bonus from ${skillName}`;
    } else if (skillName === "shieldwork") {
      // Shield skill gives defense bonus
      const defenseBonus = Math.floor(currentLevel / 3);
      `+${defenseBonus} defense bonus from ${skillName}`;
    } else if (skillName === "tactics") {
      // Tactics gives defense and accuracy bonus
      const defenseBonus = Math.floor(currentLevel / 4);
      const accuracyBonus = Math.floor(currentLevel / 4);
      `+${defenseBonus} defense and +${accuracyBonus} accuracy bonus from ${skillName}`;
    }
  }

  return character.skills[skillName];
}
