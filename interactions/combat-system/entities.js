// Combat entity classes for enhanced combat system
import {
  calculateCharacterHealth,
  progressSkill,
} from "./character-calculations.js";
import {
  getWeaponDamageBonus,
  getArmorDefenseBonus,
  getShieldDefenseBonus,
  getEquipmentInitiativeModifier,
  isRangedWeapon,
  getAmmoType,
  getArmorDamageReduction,
} from "./equipment-combat-helpers.js";
import {
  getSkillDamageBonus,
  getSkillAccuracyBonus,
  getSkillInitiativeBonus,
} from "./combat-calculations.js";

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
    // Allow damage to go below 0 HP (negative health)
    this.currentHealth = this.currentHealth - amount;
    this.damageTaken += amount;

    // Progress defense skills when taking damage
    if (this.character && amount > 0) {
      const shieldSkill = this.character.skills.shieldwork || 0;
      const tacticsSkill = this.character.skills.tactics || 0;

      // Progress shieldwork skill (smaller amount since taking damage)
      const shieldProgress = Math.max(0.001, 0.015 - shieldSkill * 0.002);
      progressSkill(this.character, "shieldwork", shieldProgress);

      // Progress tactics skill (smaller amount since taking damage)
      const tacticsProgress = Math.max(0.001, 0.015 - tacticsSkill * 0.002);
      progressSkill(this.character, "tactics", tacticsProgress);

      `[SKILL PROGRESS] ${this.name} gained ${shieldProgress.toFixed(
        4
      )} shieldwork and ${tacticsProgress.toFixed(
        4
      )} tactics experience from taking damage`;
    }

    // Death mechanics: unconscious at 0 HP, dead at -maxHealth/2
    if (this.currentHealth <= 0 && !this.unconscious) {
      this.status = "unconscious";
      this.unconscious = true;
    }

    if (this.currentHealth <= -Math.floor(this.maxHealth / 2)) {
      this.status = "dead";
      this.unconscious = true;
    }

    return amount;
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

  isUnconscious() {
    return this.unconscious || this.status === "unconscious";
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
    this.isLeader = false; // Whether this monster is a leader of its group
    this.fleeState = false; // Whether this monster is set to flee (will flee on next turn)
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
    this.size = { width: 1, height: 1 }; // Default size for single-tile creatures
    this.ammo = {
      arrows: 0,
      bolts: 0,
      stones: 0,
    };
  }

  takeDamage(amount) {
    const actualDamage = this.calculateActualDamage(amount);
    const damageApplied = super.takeDamage(actualDamage);

    `[MONSTER DAMAGE] ${this.name} (${
      this.race || "unknown"
    }) takes ${damageApplied} damage. Health: ${this.currentHealth}/${
      this.maxHealth
    }`;

    // Check for unconsciousness (at 0 HP) - let base class handle death status
    if (this.currentHealth <= 0 && !this.unconscious && !this.isDead()) {
      this.unconscious = true;
      // Don't set status here, let base class handle it
      `[MONSTER UNCONSCIOUS] ${this.name} (${
        this.race || "unknown"
      }) becomes unconscious! Health: ${this.currentHealth}/${this.maxHealth}`;
    }

    return damageApplied;
  }

  calculateActualDamage(amount) {
    // Apply armor damage reduction FIRST (before resistances)
    let finalDamage = amount;
    
    if (this.equipment?.armor) {
      const armorReduction = getArmorDamageReduction(this.equipment.armor);
      if (armorReduction > 0) {
        finalDamage *= (1 - armorReduction / 100);
      }
    }

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
    
    // Create a mock character-like object for skill bonus calculation
    const mockCharacter = {
      equipment: this.equipment,
      skills: this.skills,
    };
    const skillBonus = getSkillDamageBonus(mockCharacter);

    return baseDamage + weaponBonus + skillBonus;
  }

  getDefense() {
    // Base defense calculation for monsters
    const baseDefense = Math.floor(this.stats.CON / 2);
    const armorBonus = this.getArmorDefenseBonus();
    const shieldBonus = this.getShieldDefenseBonus();

    return baseDefense + armorBonus + shieldBonus;
  }

  getAccuracy() {
    // Base accuracy calculation for monsters
    const baseAccuracy = Math.floor(this.stats.DEX / 2) + 10;
    
    // Create a mock character-like object for skill bonus calculation
    const mockCharacter = {
      equipment: this.equipment,
      skills: this.skills,
    };
    const skillBonus = getSkillAccuracyBonus(mockCharacter);

    return baseAccuracy + skillBonus;
  }

  getInitiative() {
    // Base initiative calculation for monsters
    const baseInitiative =
      Math.floor(this.stats.DEX / 2) + Math.floor(this.stats.WIS / 2);
    const equipmentBonus = this.getEquipmentInitiativeBonus();
    
    // Create a mock character-like object for skill bonus calculation
    const mockCharacter = {
      equipment: this.equipment,
      skills: this.skills,
    };
    const skillBonus = getSkillInitiativeBonus(mockCharacter);

    return baseInitiative + equipmentBonus + skillBonus;
  }

  // Helper methods for damage and defense calculations
  getWeaponDamageBonus() {
    if (!this.equipment?.weapon) return 0;
    return getWeaponDamageBonus(this.equipment.weapon);
  }

  getArmorDefenseBonus() {
    if (!this.equipment?.armor) return 0;
    return getArmorDefenseBonus(this.equipment.armor);
  }

  getShieldDefenseBonus() {
    if (!this.equipment?.secondHand) return 0;
    return getShieldDefenseBonus(this.equipment.secondHand);
  }

  getEquipmentInitiativeBonus() {
    if (!this.equipment?.armor) return 0;
    return getEquipmentInitiativeModifier(this.equipment.armor);
  }

  // Override isFleeing to check fleeState
  isFleeing() {
    return super.isFleeing() || this.fleeState;
  }

  /**
   * Get all tiles occupied by this creature
   * @param {number} row - Top-left corner row position
   * @param {number} col - Top-left corner column position
   * @returns {Array<[number, number]>} Array of [row, col] tuples
   */
  getOccupiedTiles(row, col) {
    const tiles = [];
    for (let r = 0; r < this.size.height; r++) {
      for (let c = 0; c < this.size.width; c++) {
        tiles.push([row + r, col + c]);
      }
    }
    return tiles;
  }

  /**
   * Get the anchor position (top-left corner)
   * @returns {Object} Position object with row and col
   */
  getAnchorPosition() {
    // This will be set by combat grid system
    return { row: this.combatRow || 0, col: this.combatCol || 0 };
  }

  /**
   * Check if entity has ammo for current weapon
   * @returns {boolean} True if has ammo or weapon is melee
   */
  hasAmmo() {
    if (!this.equipment?.weapon) return true; // No weapon or unarmed
    if (!isRangedWeapon(this.equipment.weapon)) return true; // Melee weapon
    
    const ammoType = getAmmoType(this.equipment.weapon);
    if (!ammoType) return true; // Not a ranged weapon
    
    return this.ammo[ammoType] > 0;
  }

  /**
   * Consume 1 ammo when attacking
   */
  consumeAmmo() {
    if (!this.equipment?.weapon) return;
    if (!isRangedWeapon(this.equipment.weapon)) return;
    
    const ammoType = getAmmoType(this.equipment.weapon);
    if (ammoType && this.ammo[ammoType] > 0) {
      this.ammo[ammoType]--;
    }
  }

  /**
   * Switch to melee weapon from inventory or unarmed
   * This will be implemented to check character inventory for melee weapons
   */
  switchToMelee() {
    // For monsters, just set weapon to null (unarmed)
    if (this.equipment) {
      if (!isRangedWeapon(this.equipment.weapon)) {
        return; // Already has melee weapon
      }
      // Set to unarmed for now
      this.equipment.weapon = null;
    }
  }
}

export class Ally extends CombatEntity {
  constructor(character, maxHealth = null, currentHealth = null) {
    const health = maxHealth || calculateCharacterHealth(character);
    const startingHealth = currentHealth !== null ? currentHealth : health;
    super(character.firstName + " " + character.lastName, health, "ally");
    this.currentHealth = startingHealth;
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
    this.size = { width: 1, height: 1 }; // Default size for single-tile creatures
    this.ammo = {
      arrows: 0,
      bolts: 0,
      stones: 0,
    };
    
    // Initialize ammo if character has ranged weapon
    if (character?.equipment?.weapon) {
      const ammoType = getAmmoType(character.equipment.weapon);
      if (ammoType) {
        this.ammo[ammoType] = 20; // Default 20 ammo
      }
    }
  }

  takeDamage(amount) {
    const actualDamage = this.calculateActualDamage(amount);
    const damageApplied = super.takeDamage(actualDamage);

    `[ALLY DAMAGE] ${this.name} (${
      this.character?.race || "unknown"
    }) takes ${damageApplied} damage. Health: ${this.currentHealth}/${
      this.maxHealth
    }`;

    // Update character health
    this.character.health.current = this.currentHealth;

    // Check for unconsciousness (at 0 HP) - let base class handle death status
    if (this.currentHealth <= 0 && !this.unconscious) {
      this.unconscious = true;
      // Don't set status here, let base class handle it
      `[ALLY UNCONSCIOUS] ${this.name} (${
        this.character?.race || "unknown"
      }) becomes unconscious! Health: ${this.currentHealth}/${this.maxHealth}`;
    }

    return damageApplied;
  }

  calculateActualDamage(amount) {
    // Apply armor damage reduction FIRST (before resistances)
    let finalDamage = amount;
    
    if (this.character?.equipment?.armor) {
      const armorReduction = getArmorDamageReduction(this.character.equipment.armor);
      if (armorReduction > 0) {
        finalDamage *= (1 - armorReduction / 100);
      }
    }

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

  /**
   * Get all tiles occupied by this creature
   * @param {number} row - Top-left corner row position
   * @param {number} col - Top-left corner column position
   * @returns {Array<[number, number]>} Array of [row, col] tuples
   */
  getOccupiedTiles(row, col) {
    const tiles = [];
    for (let r = 0; r < this.size.height; r++) {
      for (let c = 0; c < this.size.width; c++) {
        tiles.push([row + r, col + c]);
      }
    }
    return tiles;
  }

  /**
   * Get the anchor position (top-left corner)
   * @returns {Object} Position object with row and col
   */
  getAnchorPosition() {
    // This will be set by combat grid system
    return { row: this.combatRow || 0, col: this.combatCol || 0 };
  }

  /**
   * Check if entity has ammo for current weapon
   * @returns {boolean} True if has ammo or weapon is melee
   */
  hasAmmo() {
    if (!this.character?.equipment?.weapon) return true; // No weapon or unarmed
    if (!isRangedWeapon(this.character.equipment.weapon)) return true; // Melee weapon
    
    const ammoType = getAmmoType(this.character.equipment.weapon);
    if (!ammoType) return true; // Not a ranged weapon
    
    return this.ammo[ammoType] > 0;
  }

  /**
   * Consume 1 ammo when attacking
   */
  consumeAmmo() {
    if (!this.character?.equipment?.weapon) return;
    if (!isRangedWeapon(this.character.equipment.weapon)) return;
    
    const ammoType = getAmmoType(this.character.equipment.weapon);
    if (ammoType && this.ammo[ammoType] > 0) {
      this.ammo[ammoType]--;
    }
  }

  /**
   * Switch to melee weapon from inventory or unarmed
   * This will be implemented to check character inventory for melee weapons
   */
  switchToMelee() {
    // For now, just set weapon to null (unarmed)
    // TODO: Check inventory for melee weapons
    if (this.character && this.character.equipment) {
      // Look for melee weapon in inventory or keep current if melee
      if (!isRangedWeapon(this.character.equipment.weapon)) {
        return; // Already has melee weapon
      }
      // Set to unarmed for now
      this.character.equipment.weapon = null;
    }
  }
}
