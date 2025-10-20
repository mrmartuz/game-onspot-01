import { classDatabase } from "../combat/classes.js";

// Character calculation functions for combat system
export function calculateCharacterHealth(character) {
  const baseHealth = Math.floor(character.stats.CON * 2 + 10);
  const classBonus = getClassHealthBonus(character.class);
  const equipmentBonus = getEquipmentHealthBonus(character);

  return baseHealth + classBonus + equipmentBonus;
}

export function calculateCharacterDamage(character) {
  const baseDamage = Math.floor(character.stats.STR / 2) + 1;
  const weaponBonus = getEquipmentDamageBonus(character);
  const skillBonus = getSkillDamageBonus(character);
  const classBonus = getClassDamageBonus(character.class);

  return baseDamage + weaponBonus + skillBonus + classBonus;
}

export function calculateCharacterDefense(character) {
  const baseDefense = Math.floor(character.stats.CON / 2);
  const armorBonus = getEquipmentDefenseBonus(character);
  const skillBonus = getSkillDefenseBonus(character);
  const classBonus = getClassDefenseBonus(character.class);

  return baseDefense + armorBonus + skillBonus + classBonus;
}

export function calculateCharacterAccuracy(character) {
  const baseAccuracy = Math.floor(character.stats.DEX / 2) + 10;
  const weaponBonus = getEquipmentAccuracyBonus(character);
  const skillBonus = getSkillAccuracyBonus(character);
  const classBonus = getClassAccuracyBonus(character.class);

  return baseAccuracy + weaponBonus + skillBonus + classBonus;
}

export function calculateCharacterInitiative(character) {
  const baseInitiative =
    Math.floor(character.stats.DEX / 2) + Math.floor(character.stats.WIS / 2);
  const equipmentBonus = getEquipmentInitiativeBonus(character);
  const skillBonus = getSkillInitiativeBonus(character);

  return baseInitiative + equipmentBonus + skillBonus;
}

export function getPrimaryWeaponSkill(character) {
  // Determine primary weapon skill based on equipment
  const weapon = character.equipment?.weapon;
  if (!weapon) return "unarmed";

  const weaponType = weapon.toLowerCase();

  // Map weapon types to skills
  if (weaponType.includes("sword")) return "swordfighting";
  if (weaponType.includes("bow") || weaponType.includes("arrow"))
    return "archery";
  if (weaponType.includes("spear") || weaponType.includes("polearm"))
    return "polearms";
  if (weaponType.includes("axe")) return "swordfighting"; // Axes use swordfighting skill
  if (weaponType.includes("mace") || weaponType.includes("club"))
    return "swordfighting"; // Maces use swordfighting skill
  if (weaponType.includes("dagger")) return "swordfighting"; // Daggers use swordfighting skill

  return "unarmed";
}

export function getEquipmentDamageBonus(character) {
  let bonus = 0;

  // Check weapon
  if (character.equipment?.weapon) {
    const weapon = character.equipment.weapon;
    if (weapon.includes("excellent")) bonus += 3;
    else if (weapon.includes("good")) bonus += 2;
    else if (weapon.includes("fair")) bonus += 1;
    else if (weapon.includes("poor")) bonus -= 1;
    else if (weapon.includes("broken")) bonus -= 2;

    // Material bonuses
    if (weapon.includes("mithril")) bonus += 2;
    else if (weapon.includes("steel")) bonus += 1;
    else if (weapon.includes("iron")) bonus += 0;
    else if (weapon.includes("bronze")) bonus -= 1;
    else if (weapon.includes("wood")) bonus -= 2;
  }

  return bonus;
}

export function getEquipmentDefenseBonus(character) {
  let bonus = 0;

  // Check armor
  if (character.equipment?.armor) {
    const armor = character.equipment.armor;
    if (armor.includes("excellent")) bonus += 4;
    else if (armor.includes("good")) bonus += 3;
    else if (armor.includes("fair")) bonus += 2;
    else if (armor.includes("poor")) bonus += 1;
    else if (armor.includes("broken")) bonus += 0;

    // Material bonuses
    if (armor.includes("mithril")) bonus += 3;
    else if (armor.includes("steel")) bonus += 2;
    else if (armor.includes("iron")) bonus += 1;
    else if (armor.includes("bronze")) bonus += 0;
    else if (armor.includes("leather")) bonus -= 1;
  }

  // Check shield
  if (character.equipment?.secondHand) {
    const shield = character.equipment.secondHand;
    if (shield.includes("excellent")) bonus += 2;
    else if (shield.includes("good")) bonus += 1;
    else if (shield.includes("fair")) bonus += 0;
    else if (shield.includes("poor")) bonus -= 1;
    else if (shield.includes("broken")) bonus -= 2;
  }

  return bonus;
}

export function getEquipmentAccuracyBonus(character) {
  let bonus = 0;

  // Check weapon
  if (character.equipment?.weapon) {
    const weapon = character.equipment.weapon;
    if (weapon.includes("excellent")) bonus += 2;
    else if (weapon.includes("good")) bonus += 1;
    else if (weapon.includes("fair")) bonus += 0;
    else if (weapon.includes("poor")) bonus -= 1;
    else if (weapon.includes("broken")) bonus -= 2;
  }

  return bonus;
}

export function getEquipmentInitiativeBonus(character) {
  let bonus = 0;

  // Check armor (heavier armor reduces initiative)
  if (character.equipment?.armor) {
    const armor = character.equipment.armor;
    if (armor.includes("plate")) bonus -= 2;
    else if (armor.includes("chainmail")) bonus -= 1;
    else if (armor.includes("leather")) bonus += 0;
    else if (armor.includes("cloth")) bonus += 1;
  }

  return bonus;
}

export function getClassHealthBonus(className) {
  const classData = classDatabase[className];
  if (!classData) return 0;

  // Health bonus based on class
  const healthBonuses = {
    fighter: 2,
    paladin: 3,
    cleric: 2,
    ranger: 1,
    hunter: 1,
    archer: 0,
    brute: 4,
    martial_artist: 1,
    monk: 1,
    explorer: 1,
    dungeondiver: 2,
    craftsman: 0,
    alchemist: 0,
    herbalist: 0,
    pyromancer: 0,
    necromancer: 0,
    articaster: 0,
    geomancer: 0,
  };

  return healthBonuses[className] || 0;
}

export function getClassDamageBonus(className) {
  const classData = classDatabase[className];
  if (!classData) return 0;

  // Damage bonus based on class
  const damageBonuses = {
    fighter: 2,
    paladin: 2,
    cleric: 1,
    ranger: 1,
    hunter: 1,
    archer: 1,
    brute: 3,
    martial_artist: 2,
    monk: 1,
    explorer: 0,
    dungeondiver: 1,
    craftsman: 0,
    alchemist: 0,
    herbalist: 0,
    pyromancer: 1,
    necromancer: 1,
    articaster: 1,
    geomancer: 1,
  };

  return damageBonuses[className] || 0;
}

export function getClassDefenseBonus(className) {
  const classData = classDatabase[className];
  if (!classData) return 0;

  // Defense bonus based on class
  const defenseBonuses = {
    fighter: 2,
    paladin: 3,
    cleric: 2,
    ranger: 1,
    hunter: 1,
    archer: 0,
    brute: 2,
    martial_artist: 1,
    monk: 1,
    explorer: 0,
    dungeondiver: 1,
    craftsman: 0,
    alchemist: 0,
    herbalist: 0,
    pyromancer: 0,
    necromancer: 0,
    articaster: 0,
    geomancer: 0,
  };

  return defenseBonuses[className] || 0;
}

export function getClassAccuracyBonus(className) {
  const classData = classDatabase[className];
  if (!classData) return 0;

  // Accuracy bonus based on class
  const accuracyBonuses = {
    fighter: 1,
    paladin: 1,
    cleric: 0,
    ranger: 2,
    hunter: 2,
    archer: 3,
    brute: 0,
    martial_artist: 2,
    monk: 2,
    explorer: 1,
    dungeondiver: 1,
    craftsman: 0,
    alchemist: 0,
    herbalist: 0,
    pyromancer: 1,
    necromancer: 1,
    articaster: 1,
    geomancer: 1,
  };

  return accuracyBonuses[className] || 0;
}

export function getSkillDamageBonus(character) {
  const primarySkill = getPrimaryWeaponSkill(character);
  const skillLevel = character.skills[primarySkill] || 0;
  return Math.floor(skillLevel / 2);
}

export function getSkillDefenseBonus(character) {
  const shieldSkill = character.skills.shieldwork || 0;
  const tacticsSkill = character.skills.tactics || 0;
  return Math.floor(shieldSkill / 3) + Math.floor(tacticsSkill / 4);
}

export function getSkillAccuracyBonus(character) {
  const primarySkill = getPrimaryWeaponSkill(character);
  const skillLevel = character.skills[primarySkill] || 0;
  return Math.floor(skillLevel / 3);
}

export function getSkillInitiativeBonus(character) {
  const stealthSkill = character.skills.stealth || 0;
  const scoutingSkill = character.skills.scouting || 0;
  return Math.floor(stealthSkill / 4) + Math.floor(scoutingSkill / 4);
}

export function getEquipmentHealthBonus(character) {
  // Equipment doesn't typically affect health directly
  return 0;
}

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
    console.log(
      `${character.firstName} ${character.lastName} leveled up ${skillName} to level ${currentLevel}!`
    );

    // Apply skill level bonuses
    if (
      skillName === "swordfighting" ||
      skillName === "archery" ||
      skillName === "polearms"
    ) {
      // Combat skills give damage bonus
      const damageBonus = Math.floor(currentLevel / 2);
      console.log(`+${damageBonus} damage bonus from ${skillName}`);
    } else if (skillName === "shieldwork") {
      // Shield skill gives defense bonus
      const defenseBonus = Math.floor(currentLevel / 3);
      console.log(`+${defenseBonus} defense bonus from ${skillName}`);
    } else if (skillName === "tactics") {
      // Tactics gives defense and accuracy bonus
      const defenseBonus = Math.floor(currentLevel / 4);
      const accuracyBonus = Math.floor(currentLevel / 4);
      console.log(
        `+${defenseBonus} defense and +${accuracyBonus} accuracy bonus from ${skillName}`
      );
    }
  }

  return character.skills[skillName];
}


