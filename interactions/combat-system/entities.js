// Combat entity classes for enhanced combat system
import { calculateCharacterHealth } from "./character-calculations.js";

export class CombatEntity {
  constructor(name, maxHealth, role = null) {
    this.name = name;
    this.maxHealth = maxHealth;
    this.currentHealth = maxHealth;
    this.status = "active"; // active, unconscious, dead, fleeing
    this.role = role; // player, ally, monster
    this.unconscious = false;
    this.turnActions = [];
    this.damageDealt = 0;
    this.damageTaken = 0;
  }

  takeDamage(amount) {
    const damageApplied = Math.min(amount, this.currentHealth);
    this.currentHealth = Math.max(0, this.currentHealth - damageApplied);
    this.damageTaken += damageApplied;

    if (this.currentHealth <= 0) {
      this.status = "dead";
      this.unconscious = true;
    }

    return damageApplied;
  }

  heal(amount) {
    this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
    if (this.currentHealth > 0 && this.status === "dead") {
      this.status = "active";
      this.unconscious = false;
    }
    return this.currentHealth;
  }

  isDead() {
    return this.status === "dead";
  }

  isFleeing() {
    return this.status === "fleeing";
  }

  flee() {
    this.status = "fleeing";
    return true;
  }
}

export class Monster extends CombatEntity {
  constructor(name, maxHealth, detectionValue = 0, x = 0, y = 0) {
    super(name, maxHealth, "monster");
    this.detectionValue = detectionValue;
    this.x = x;
    this.y = y;
    this.creatureType = null;
    this.race = null;
    this.class = null;
    this.level = 1;
    this.stats = {};
    this.skills = {};
    this.equipment = {};
    this.discovered = false;
    this.detected = false;
    this.discoveryMessage = "";
    this.detectionMessage = "";
    this.rarity = "common";
    this.experienceValue = 0;
    this.lootTable = [];
    this.aiBehavior = "aggressive";
    this.specialAbilities = [];
    this.resistances = {};
    this.vulnerabilities = {};
  }

  takeDamage(amount) {
    const actualDamage = this.calculateActualDamage(amount);
    return super.takeDamage(actualDamage);
  }

  calculateActualDamage(amount) {
    // Apply resistances and vulnerabilities
    let finalDamage = amount;

    // Apply resistances (reduce damage)
    Object.keys(this.resistances).forEach((resistance) => {
      if (this.resistances[resistance] > 0) {
        finalDamage *= 1 - this.resistances[resistance];
      }
    });

    // Apply vulnerabilities (increase damage)
    Object.keys(this.vulnerabilities).forEach((vulnerability) => {
      if (this.vulnerabilities[vulnerability] > 0) {
        finalDamage *= 1 + this.vulnerabilities[vulnerability];
      }
    });

    return Math.max(1, Math.floor(finalDamage));
  }

  getDamage() {
    // Base damage calculation for monsters
    const baseDamage = Math.floor(this.stats.STR / 2) + 1;
    const weaponBonus = this.getWeaponDamageBonus();
    const skillBonus = this.getSkillDamageBonus();

    return baseDamage + weaponBonus + skillBonus;
  }

  getDefense() {
    // Base defense calculation for monsters
    const baseDefense = Math.floor(this.stats.CON / 2);
    const armorBonus = this.getArmorDefenseBonus();

    return baseDefense + armorBonus;
  }

  getAccuracy() {
    // Base accuracy calculation for monsters
    const baseAccuracy = Math.floor(this.stats.DEX / 2) + 10;
    const skillBonus = this.getSkillAccuracyBonus();

    return baseAccuracy + skillBonus;
  }

  getInitiative() {
    // Base initiative calculation for monsters
    const baseInitiative =
      Math.floor(this.stats.DEX / 2) + Math.floor(this.stats.WIS / 2);
    const equipmentBonus = this.getEquipmentInitiativeBonus();

    return baseInitiative + equipmentBonus;
  }

  // Helper methods for damage and defense calculations
  getWeaponDamageBonus() {
    if (!this.equipment?.weapon) return 0;

    // Parse weapon damage from equipment string
    const weapon = this.equipment.weapon.toLowerCase();

    // Basic weapon damage bonuses based on weapon type
    if (weapon.includes("sword")) return 2;
    if (weapon.includes("axe")) return 3;
    if (weapon.includes("mace")) return 2;
    if (weapon.includes("spear")) return 1;
    if (weapon.includes("bow")) return 1;
    if (weapon.includes("dagger")) return 1;

    return 1; // Default weapon bonus
  }

  getSkillDamageBonus() {
    if (!this.skills) return 0;

    // Get relevant combat skills
    const combatSkills = ["swordfighting", "archery", "polearms", "unarmed"];
    let totalBonus = 0;

    combatSkills.forEach((skill) => {
      if (this.skills[skill]) {
        totalBonus += Math.floor(this.skills[skill] / 2);
      }
    });

    return totalBonus;
  }

  getArmorDefenseBonus() {
    if (!this.equipment?.armor) return 0;

    // Parse armor defense from equipment string
    const armor = this.equipment.armor.toLowerCase();

    // Basic armor defense bonuses
    if (armor.includes("leather")) return 1;
    if (armor.includes("chain")) return 2;
    if (armor.includes("plate")) return 3;
    if (armor.includes("scale")) return 2;

    return 0; // No armor
  }

  getSkillAccuracyBonus() {
    if (!this.skills) return 0;

    // Get relevant accuracy skills
    const accuracySkills = ["swordfighting", "archery", "polearms", "unarmed"];
    let totalBonus = 0;

    accuracySkills.forEach((skill) => {
      if (this.skills[skill]) {
        totalBonus += Math.floor(this.skills[skill] / 3);
      }
    });

    return totalBonus;
  }

  getEquipmentInitiativeBonus() {
    if (!this.equipment) return 0;

    let bonus = 0;

    // Light weapons give initiative bonus
    if (this.equipment.weapon) {
      const weapon = this.equipment.weapon.toLowerCase();
      if (weapon.includes("dagger") || weapon.includes("bow")) {
        bonus += 1;
      }
    }

    // Heavy armor reduces initiative
    if (this.equipment.armor) {
      const armor = this.equipment.armor.toLowerCase();
      if (armor.includes("plate")) {
        bonus -= 2;
      } else if (armor.includes("chain")) {
        bonus -= 1;
      }
    }

    return bonus;
  }
}

export class Ally extends CombatEntity {
  constructor(character, maxHealth = null) {
    const health = maxHealth || calculateCharacterHealth(character);
    super(character.firstName + " " + character.lastName, health, "ally");
    this.character = character;
    this.unconscious = false;
    this.turnActions = [];
    this.damageDealt = 0;
    this.damageTaken = 0;
    this.aiControlled = true; // Allies are AI controlled
    this.aiPersonality = "defensive"; // defensive, aggressive, balanced
    this.preferredTargets = []; // Target preferences for AI
    this.specialAbilities = [];
    this.statusEffects = [];
  }

  takeDamage(amount) {
    const actualDamage = this.calculateActualDamage(amount);
    const damageApplied = super.takeDamage(actualDamage);

    // Update character health
    this.character.health.current = this.currentHealth;

    // Check for unconsciousness (below 25% health)
    if (this.currentHealth <= this.maxHealth * 0.25 && !this.unconscious) {
      this.unconscious = true;
      this.status = "unconscious";
    }

    return damageApplied;
  }

  calculateActualDamage(amount) {
    // Apply resistances and vulnerabilities from character
    let finalDamage = amount;

    // Apply resistances (reduce damage)
    Object.keys(this.character.resistances || {}).forEach((resistance) => {
      if (this.character.resistances[resistance] > 0) {
        finalDamage *= 1 - this.character.resistances[resistance];
      }
    });

    // Apply vulnerabilities (increase damage)
    Object.keys(this.character.vulnerabilities || {}).forEach(
      (vulnerability) => {
        if (this.character.vulnerabilities[vulnerability] > 0) {
          finalDamage *= 1 + this.character.vulnerabilities[vulnerability];
        }
      }
    );

    return Math.max(1, Math.floor(finalDamage));
  }

  getDamage() {
    return calculateCharacterDamage(this.character);
  }

  isUnconscious() {
    return this.unconscious;
  }

  isDead() {
    return this.status === "dead";
  }

  isFleeing() {
    return this.status === "fleeing";
  }
}
