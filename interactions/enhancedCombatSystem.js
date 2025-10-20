// import { gameState } from "../gamestate/game_variables.js";
// import { showChoiceDialog } from "./showDialog.js";
// import { getGroupBonus, hash } from "../utils.js";
// import { updateStatus } from "../rendering.js";
// import { logEvent } from "../time_system.js";
// import { getTile } from "../rendering/tile.js";
// import { checkDeath } from "../utils.js";
// import { getClassByName } from "./combat/classes.js";
// import { skillDatabase } from "./skills.js";
// import { equipmentDatabase, equipmentTypes } from "./equipment.js";
// import {
//   characterGeneration,
//   raceDatabase,
//   nameDatabase,
// } from "./characterGeneration.js";

// // Skill progression rate: 0.010 per level per use
// const SKILL_PROGRESSION_RATE = 0.01;

// // Combat entity classes
// class CombatEntity {
//   constructor(name, maxHealth, role = null) {
//     this.name = name;
//     this.maxHealth = maxHealth;
//     this.currentHealth = maxHealth;
//     this.wounds = 0;
//     this.status = "active"; // active, fleeing, dead
//     this.role = role;
//   }

//   takeDamage(amount) {
//     this.currentHealth -= amount;
//     this.wounds = Math.floor(
//       (this.maxHealth - this.currentHealth) / (this.maxHealth / 4)
//     );
//     if (this.currentHealth <= 0) {
//       this.status = "dead";
//       this.currentHealth = 0;
//     }
//   }

//   heal(amount) {
//     this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
//     this.wounds = Math.floor(
//       (this.maxHealth - this.currentHealth) / (this.maxHealth / 4)
//     );
//   }

//   isDead() {
//     return this.status === "dead";
//   }

//   isFleeing() {
//     return this.status === "fleeing";
//   }

//   flee() {
//     this.status = "fleeing";
//   }
// }

// class Monster extends CombatEntity {
//   constructor(name, maxHealth, detectionValue = 0, x = 0, y = 0) {
//     super(name, maxHealth);
//     this.detectionValue = detectionValue;
//     this.x = x;
//     this.y = y;
//     this.rarity = "common";
//     this.attackLevel = { min: 1, max: 2 };
//     this.killValue = 1;
//     this.discoveryMessages = [];
//     this.detectionMessages = [];
//     this.character = null; // Will be set when generated
//     // Use hash to determine wounds deterministically
//     const woundHash = hash(x, y, 200);
//     this.maxWounds = Math.floor(woundHash * 2) + 2; // 2-3 wounds
//   }

//   takeDamage(amount) {
//     super.takeDamage(amount);
//     if (this.wounds >= this.maxWounds) {
//       this.status = "dead";
//     }
//   }

//   getDamage() {
//     // Use character-based damage calculation if character exists
//     if (this.character) {
//       return calculateCharacterDamage(this.character);
//     }
//     // Fallback to old system
//     const damageRange = this.attackLevel.max - this.attackLevel.min;
//     return this.attackLevel.min + Math.floor(Math.random() * (damageRange + 1));
//   }

//   getDefense() {
//     // Use character-based defense calculation if character exists
//     if (this.character) {
//       return calculateCharacterDefense(this.character);
//     }
//     return 0; // Fallback
//   }

//   getAccuracy() {
//     // Use character-based accuracy calculation if character exists
//     if (this.character) {
//       return calculateCharacterAccuracy(this.character);
//     }
//     return 50; // Fallback
//   }

//   getInitiative() {
//     // Use character-based initiative calculation if character exists
//     if (this.character) {
//       return calculateCharacterInitiative(this.character);
//     }
//     return 10; // Fallback
//   }
// }

// class Ally extends CombatEntity {
//   constructor(character, maxHealth = null) {
//     // Calculate health based on character stats if not provided
//     const calculatedHealth = maxHealth || calculateCharacterHealth(character);
//     super(
//       character.firstName + " " + character.lastName,
//       calculatedHealth,
//       character.class
//     );

//     this.character = character;
//     this.maxWounds = 5; // Allies die after 5 wounds
//     this.unconscious = false;
//   }

//   takeDamage(amount) {
//     // If already unconscious, take damage kills the ally
//     if (this.unconscious) {
//       this.status = "dead";
//       return;
//     }

//     super.takeDamage(amount);

//     // If health reaches 0, become unconscious instead of dead
//     if (this.currentHealth <= 0) {
//       this.unconscious = true;
//       this.status = "unconscious";
//       this.currentHealth = 0; // Ensure health doesn't go below 0
//     }

//     // Still check wounds for death
//     if (this.wounds >= this.maxWounds) {
//       this.status = "dead";
//     }
//   }

//   getDamage() {
//     return calculateCharacterDamage(this.character);
//   }

//   isUnconscious() {
//     return this.unconscious;
//   }

//   isDead() {
//     return this.status === "dead";
//   }

//   isFleeing() {
//     return this.status === "fleeing";
//   }
// }

// // Character stat-based calculations
// function calculateCharacterHealth(character) {
//   const baseHealth = 20;
//   const conBonus = Math.floor((character.stats?.CON || 8) * 2);
//   const classBonus = getClassHealthBonus(character.class);
//   return Math.max(15, baseHealth + conBonus + classBonus);
// }

// function calculateCharacterDamage(character) {
//   const baseDamage = 1;

//   // Primary damage stat (STR for most weapons)
//   const primaryStat = character.stats?.STR || 8;
//   const statBonus = Math.floor((primaryStat - 8) / 2); // Every 2 points above 8 = +1 damage

//   // Weapon skill bonus
//   const weaponSkill = getPrimaryWeaponSkill(character);
//   const skillBonus = Math.floor(weaponSkill / 10); // Every 10 skill levels = +1 damage

//   // Equipment bonus
//   const equipmentBonus = getEquipmentDamageBonus(character);

//   // Class bonus
//   const classBonus = getClassDamageBonus(character.class);

//   const totalDamage =
//     baseDamage + statBonus + skillBonus + equipmentBonus + classBonus;

//   // Add some randomness (±1 damage)
//   const randomVariation = Math.floor(Math.random() * 3) - 1; // -1, 0, or +1

//   return Math.max(1, totalDamage + randomVariation);
// }

// function calculateCharacterDefense(character) {
//   const baseDefense = 0;

//   // Constitution bonus
//   const conBonus = Math.floor((character.stats?.CON || 8) / 3); // Every 3 CON = +1 defense

//   // Armor skill bonus
//   const armorSkill = character.skills?.shieldwork || 0;
//   const skillBonus = Math.floor(armorSkill / 15); // Every 15 skill levels = +1 defense

//   // Equipment bonus
//   const equipmentBonus = getEquipmentDefenseBonus(character);

//   // Class bonus
//   const classBonus = getClassDefenseBonus(character.class);

//   return baseDefense + conBonus + skillBonus + equipmentBonus + classBonus;
// }

// function calculateCharacterAccuracy(character) {
//   const baseAccuracy = 50; // 50% base hit chance

//   // Dexterity bonus
//   const dexBonus = (character.stats?.DEX || 8) * 2; // Each DEX point = +2% accuracy

//   // Weapon skill bonus
//   const weaponSkill = getPrimaryWeaponSkill(character);
//   const skillBonus = weaponSkill; // Each skill level = +1% accuracy

//   // Equipment bonus
//   const equipmentBonus = getEquipmentAccuracyBonus(character);

//   // Class bonus
//   const classBonus = getClassAccuracyBonus(character.class);

//   return Math.min(
//     95,
//     baseAccuracy + dexBonus + skillBonus + equipmentBonus + classBonus
//   );
// }

// function calculateCharacterInitiative(character) {
//   const baseInitiative = 10;

//   // Dexterity bonus
//   const dexBonus = (character.stats?.DEX || 8) * 1.5;

//   // Wisdom bonus (awareness)
//   const wisBonus = (character.stats?.WIS || 8) * 0.5;

//   // Skill bonus
//   const combatSkill = getPrimaryWeaponSkill(character);
//   const skillBonus = combatSkill * 0.5;

//   // Equipment bonus
//   const equipmentBonus = getEquipmentInitiativeBonus(character);

//   return baseInitiative + dexBonus + wisBonus + skillBonus + equipmentBonus;
// }

// // Helper functions for character calculations
// function getPrimaryWeaponSkill(character) {
//   const skills = character.skills || {};

//   // Check equipped weapon type and return appropriate skill
//   const weapon = character.equipment?.weapon || "";

//   if (
//     weapon.includes("sword") ||
//     weapon.includes("dagger") ||
//     weapon.includes("rapier")
//   ) {
//     return skills.swordfighting || 0;
//   } else if (weapon.includes("bow") || weapon.includes("crossbow")) {
//     return skills.archery || 0;
//   } else if (
//     weapon.includes("spear") ||
//     weapon.includes("halberd") ||
//     weapon.includes("staff")
//   ) {
//     return skills.polearms || 0;
//   } else if (weapon.includes("unarmed") || weapon === "") {
//     return skills.unarmed || 0;
//   }

//   // Default to swordfighting if weapon type unclear
//   return skills.swordfighting || 0;
// }

// function getEquipmentDamageBonus(character) {
//   const equipment = character.equipment || {};
//   let bonus = 0;

//   // Weapon bonus
//   const weapon = equipment.weapon || "";
//   if (weapon.includes("mithril")) bonus += 2;
//   else if (weapon.includes("steel")) bonus += 1;
//   else if (weapon.includes("silver")) bonus += 1;

//   // Armor can provide small damage bonus for certain types
//   const armor = equipment.armor || "";
//   if (armor.includes("plate")) bonus += 1; // Heavy armor can be used offensively

//   return bonus;
// }

// function getEquipmentDefenseBonus(character) {
//   const equipment = character.equipment || {};
//   let bonus = 0;

//   // Armor bonus
//   const armor = equipment.armor || "";
//   if (armor.includes("plate")) bonus += 4;
//   else if (armor.includes("chainmail")) bonus += 3;
//   else if (armor.includes("leather")) bonus += 1;

//   // Shield bonus
//   const shield = equipment.secondHand || "";
//   if (shield.includes("shield")) bonus += 2;

//   return bonus;
// }

// function getEquipmentAccuracyBonus(character) {
//   const equipment = character.equipment || {};
//   let bonus = 0;

//   // Weapon quality affects accuracy
//   const weapon = equipment.weapon || "";
//   if (weapon.includes("mithril")) bonus += 10;
//   else if (weapon.includes("steel")) bonus += 5;
//   else if (weapon.includes("iron")) bonus += 2;

//   return bonus;
// }

// function getEquipmentInitiativeBonus(character) {
//   const equipment = character.equipment || {};
//   let bonus = 0;

//   // Heavy armor reduces initiative
//   const armor = equipment.armor || "";
//   if (armor.includes("plate")) bonus -= 3;
//   else if (armor.includes("chainmail")) bonus -= 1;

//   // Light armor increases initiative
//   if (armor.includes("leather")) bonus += 1;

//   return bonus;
// }

// // Class-based bonuses
// function getClassHealthBonus(className) {
//   const classData = getClassByName(className);
//   if (!classData) return 0;

//   // Health bonus based on class rarity and type
//   switch (classData.rarity) {
//     case "common":
//       return 0;
//     case "uncommon":
//       return 2;
//     case "rare":
//       return 4;
//     case "legendary":
//       return 6;
//     case "mythic":
//       return 8;
//     default:
//       return 0;
//   }
// }

// function getClassDamageBonus(className) {
//   const classData = getClassByName(className);
//   if (!classData) return 0;

//   // Combat-focused classes get damage bonus
//   const combatClasses = [
//     "fighter",
//     "archer",
//     "brute",
//     "monk",
//     "paladin",
//     "martial_artist",
//     "ranger",
//   ];
//   if (combatClasses.includes(className)) {
//     switch (classData.rarity) {
//       case "common":
//         return 1;
//       case "uncommon":
//         return 2;
//       case "rare":
//         return 3;
//       case "legendary":
//         return 4;
//       case "mythic":
//         return 5;
//       default:
//         return 0;
//     }
//   }

//   return 0;
// }

// function getClassDefenseBonus(className) {
//   const classData = getClassByName(className);
//   if (!classData) return 0;

//   // Tank classes get defense bonus
//   const tankClasses = ["fighter", "paladin", "brute"];
//   if (tankClasses.includes(className)) {
//     switch (classData.rarity) {
//       case "common":
//         return 1;
//       case "uncommon":
//         return 2;
//       case "rare":
//         return 3;
//       case "legendary":
//         return 4;
//       case "mythic":
//         return 5;
//       default:
//         return 0;
//     }
//   }

//   return 0;
// }

// function getClassAccuracyBonus(className) {
//   const classData = getClassByName(className);
//   if (!classData) return 0;

//   // Precision classes get accuracy bonus
//   const precisionClasses = ["archer", "ranger", "monk", "martial_artist"];
//   if (precisionClasses.includes(className)) {
//     switch (classData.rarity) {
//       case "common":
//         return 5;
//       case "uncommon":
//         return 10;
//       case "rare":
//         return 15;
//       case "legendary":
//         return 20;
//       case "mythic":
//         return 25;
//       default:
//         return 0;
//     }
//   }

//   return 0;
// }

// // Skill progression system
// function progressSkill(character, skillName, amount = SKILL_PROGRESSION_RATE) {
//   if (!character.skills) character.skills = {};

//   const currentLevel = character.skills[skillName] || 0;
//   const skillData = skillDatabase[skillName];

//   if (!skillData) return; // Invalid skill

//   // Calculate progression based on difficulty
//   let progressionAmount = amount;
//   if (skillData.difficulty === "hard") {
//     progressionAmount *= 0.7; // Harder skills progress slower
//   } else if (skillData.difficulty === "easy") {
//     progressionAmount *= 1.3; // Easier skills progress faster
//   }

//   // Apply experience multiplier
//   progressionAmount *= skillData.experienceMultiplier || 1.0;

//   // Cap at max level
//   const newLevel = Math.min(
//     skillData.maxLevel,
//     currentLevel + progressionAmount
//   );
//   character.skills[skillName] = newLevel;

//   console.log(
//     `${character.firstName} ${
//       character.lastName
//     }'s ${skillName} increased from ${currentLevel.toFixed(
//       2
//     )} to ${newLevel.toFixed(2)}`
//   );
// }

// // Detection system
// function calculateDetectionBonus() {
//   let detectionBonus = 0;

//   gameState.group.forEach((member) => {
//     // Use skills instead of roles for detection bonus
//     const scouting = member.skills?.scouting || 0;
//     const tracking = member.skills?.tracking || 0;
//     const investigation = member.skills?.investigation || 0;
//     const navigation = member.skills?.navigation || 0;

//     // Each skill level adds detection bonus (0.1 per level)
//     detectionBonus += Math.floor(scouting * 0.1);
//     detectionBonus += Math.floor(tracking * 0.1);
//     detectionBonus += Math.floor(investigation * 0.1);
//     detectionBonus += Math.floor(navigation * 0.1);
//   });

//   return detectionBonus;
// }

// function generateDetectionMessage(monsters) {
//   if (monsters.length === 0) {
//     return "You find no signs of creatures in the area.";
//   }

//   // Group monsters by type for better descriptions
//   const monsterGroups = {};
//   monsters.forEach((monster) => {
//     if (!monsterGroups[monster.name]) {
//       monsterGroups[monster.name] = [];
//     }
//     monsterGroups[monster.name].push(monster);
//   });

//   const descriptions = [];

//   Object.keys(monsterGroups).forEach((monsterType) => {
//     const group = monsterGroups[monsterType];
//     const count = group.length;
//     const monster = group[0]; // Use first monster for description

//     // Get random discovery message for this creature type
//     const discoveryMessage = getRandomDiscoveryMessage(monster);

//     if (count === 1) {
//       descriptions.push(discoveryMessage);
//     } else {
//       descriptions.push(`${discoveryMessage} You count ${count} of them.`);
//     }
//   });

//   return descriptions.join(" ");
// }

// // Stealth system
// function calculateStealthModifier() {
//   let stealthModifier = 0;

//   gameState.group.forEach((member) => {
//     // Use skills instead of roles for stealth modifier
//     const stealth = member.skills?.stealth || 0;
//     const scouting = member.skills?.scouting || 0;
//     const acrobatics = member.skills?.acrobatics || 0;

//     // Stealth skills provide positive modifier
//     stealthModifier += Math.floor(stealth * 0.1);
//     stealthModifier += Math.floor(scouting * 0.05);
//     stealthModifier += Math.floor(acrobatics * 0.05);

//     // Heavy armor or equipment might reduce stealth
//     const armor = member.equipment?.armor || "";
//     if (armor.includes("plate") || armor.includes("chainmail")) {
//       stealthModifier -= 1; // Heavy armor is noisy
//     }
//   });

//   return stealthModifier;
// }

// // Initiative system - now stat-based
// function calculateInitiative(playerChoice, stealthModifier) {
//   let baseInitiative = 0;

//   // Calculate player initiative based on character stats
//   const playerInitiative = gameState.playerCharacter
//     ? calculateCharacterInitiative(gameState.playerCharacter)
//     : 10;

//   switch (playerChoice) {
//     case "charge":
//       baseInitiative = playerInitiative + 8; // Charge gives big initiative bonus
//       break;
//     case "attack":
//       baseInitiative = playerInitiative + 4; // Attack gives moderate bonus
//       break;
//     case "stalk":
//     case "keep_distance":
//       baseInitiative = playerInitiative + stealthModifier; // Stealth affects initiative
//       break;
//     case "run":
//       baseInitiative = playerInitiative - 5; // Running reduces initiative
//       break;
//   }

//   const playerRoll = Math.random() * 10 + baseInitiative;
//   const monsterRoll = Math.random() * 10 + 5; // Base monster initiative

//   console.log(
//     `Initiative Debug - Player Initiative: ${playerInitiative}, Base: ${baseInitiative}, Player Roll: ${playerRoll.toFixed(
//       2
//     )}, Monster Roll: ${monsterRoll.toFixed(2)}, Player Wins: ${
//       playerRoll > monsterRoll
//     }`
//   );

//   return playerRoll > monsterRoll;
// }

// // Monster generation (keeping existing system)
// function generateMonsters(count, entityType, x, y) {
//   const monsters = [];

//   // NEW CREATURE GENERATION SYSTEM USING CHARACTER GENERATION
//   const creatureTemplates = {
//     monster: [
//       {
//         race: "Goblin",
//         classes: ["scavenger", "scout", "warrior", "raider", "chief"],
//         teamComposition: "pack",
//         allies: ["Orc"],
//         killValue: 3,
//         discoveryMessages: [
//           "Small, crude footprints scatter the ground.",
//           "You hear faint chittering and see small claw marks.",
//           "Crude weapons and scraps of cloth litter the area.",
//           "The smell of something foul and unwashed lingers.",
//         ],
//         detectionMessages: [
//           "You spot small, hunched figures moving in the shadows.",
//           "Goblin scouts emerge from behind rocks, brandishing crude weapons.",
//           "The chittering grows louder as goblins reveal themselves.",
//           "Small, green-skinned creatures step into view, eyes gleaming with malice.",
//         ],
//       },
//       {
//         race: "Orc",
//         classes: ["scavenger", "scout", "warrior", "raider", "chief"],
//         teamComposition: "pack",
//         allies: ["Goblin", "Wolf"],
//         killValue: 4,
//         discoveryMessages: [
//           "Large, heavy footprints mark the earth.",
//           "You find crude armor and weapons discarded nearby.",
//           "The ground shows signs of heavy, aggressive movement.",
//           "Broken shields and bloodstained weapons tell of recent battle.",
//         ],
//         detectionMessages: [
//           "Massive, green-skinned warriors emerge from cover.",
//           "Orc raiders brandish their weapons and roar in challenge.",
//           "Heavy footsteps announce the arrival of orc warriors.",
//           "Muscular figures clad in crude armor step forward menacingly.",
//         ],
//       },
//       {
//         race: "Troll",
//         classes: [
//           "baby_beast",
//           "young_beast",
//           "adult_beast",
//           "old_beast",
//           "alpha_beast",
//           "ancient_beast",
//         ],
//         teamComposition: "solo",
//         allies: [],
//         killValue: 6,
//         discoveryMessages: [
//           "Massive footprints sink deep into the earth.",
//           "You find bones and debris scattered around a crude camp.",
//           "The ground trembles where something enormous has passed.",
//           "Broken trees and crushed rocks mark the troll's path.",
//         ],
//         detectionMessages: [
//           "A towering troll emerges from behind a boulder, club raised.",
//           "The ground shakes as a massive troll lumbers into view.",
//           "A hulking figure with thick hide steps forward menacingly.",
//           "The troll's roar echoes as it reveals its massive form.",
//         ],
//       },
//       {
//         race: "Dragon",
//         classes: [
//           "baby_beast",
//           "young_beast",
//           "adult_beast",
//           "old_beast",
//           "alpha_beast",
//           "ancient_beast",
//         ],
//         teamComposition: "solo",
//         allies: [],
//         killValue: 15,
//         discoveryMessages: [
//           "The ground is scorched and melted where fire has touched.",
//           "Massive claw marks gouge deep into stone and earth.",
//           "You find scales the size of shields scattered about.",
//           "The air itself seems to shimmer with residual heat.",
//         ],
//         detectionMessages: [
//           "A massive dragon's shadow darkens the sky as it descends.",
//           "The dragon's roar shakes the very ground beneath your feet.",
//           "Wings spread wide, the ancient dragon reveals its terrible majesty.",
//           "Fire dances in the dragon's eyes as it lands with earth-shaking force.",
//         ],
//       },
//       {
//         race: "Demon",
//         classes: [
//           "screamer",
//           "stalker",
//           "hunter",
//           "blood_harvester",
//           "reaper",
//           "general",
//           "lord",
//         ],
//         teamComposition: "solo_or_pair",
//         allies: ["Demon"],
//         killValue: 10,
//         discoveryMessages: [
//           "The ground is blackened and cracked with unnatural heat.",
//           "You find twisted, otherworldly tracks that seem to burn the earth.",
//           "The air itself feels wrong, heavy with malevolent energy.",
//           "Strange symbols are carved into the ground, glowing faintly red.",
//         ],
//         detectionMessages: [
//           "Reality itself seems to warp as a demon materializes before you.",
//           "The demon's eyes burn with hellish fire as it steps from shadow.",
//           "A creature of pure malice emerges, its form shifting and unnatural.",
//           "The very air ignites as the demon reveals its true form.",
//         ],
//       },
//     ],
//     beast: [
//       {
//         race: "Wolf",
//         classes: [
//           "baby_beast",
//           "young_beast",
//           "adult_beast",
//           "old_beast",
//           "alpha_beast",
//           "ancient_beast",
//         ],
//         teamComposition: "pack",
//         allies: ["Orc"],
//         killValue: 2,
//         discoveryMessages: [
//           "Paw prints and fur tufts mark the wolf's passage.",
//           "You hear distant howling carried on the wind.",
//           "Scattered bones and tufts of fur tell of recent hunting.",
//           "The ground shows the tracks of a pack on the move.",
//         ],
//         detectionMessages: [
//           "Yellow eyes gleam in the shadows as wolves emerge.",
//           "The pack circles, their growls growing louder.",
//           "Wolves step from the undergrowth, teeth bared.",
//           "The alpha wolf leads its pack into view, eyes fixed on you.",
//         ],
//       },
//       {
//         race: "Bear",
//         classes: [
//           "baby_beast",
//           "young_beast",
//           "adult_beast",
//           "old_beast",
//           "alpha_beast",
//           "ancient_beast",
//         ],
//         teamComposition: "solo",
//         allies: [],
//         killValue: 5,
//         discoveryMessages: [
//           "Massive claw marks scar the trees and ground.",
//           "You find a den with bones and the smell of wild animal.",
//           "The earth is torn where powerful claws have dug deep.",
//           "Broken branches and scattered fur mark the bear's territory.",
//         ],
//         detectionMessages: [
//           "A massive bear rises on its hind legs, roaring in challenge.",
//           "The bear emerges from the forest, claws extended.",
//           "Muscle ripples under thick fur as the bear step forward.",
//           "The bear's roar echoes as it reveals its massive form.",
//         ],
//       },
//       {
//         race: "MountainLion",
//         classes: [
//           "baby_beast",
//           "young_beast",
//           "adult_beast",
//           "old_beast",
//           "alpha_beast",
//           "ancient_beast",
//         ],
//         teamComposition: "solo",
//         allies: [],
//         killValue: 4,
//         discoveryMessages: [
//           "Silent paw prints show the cat's careful approach.",
//           "You find scratch marks high on tree trunks.",
//           "The ground shows signs of a predator's patient stalking.",
//           "Tufts of tawny fur caught on branches mark its passage.",
//         ],
//         detectionMessages: [
//           "Golden eyes appear in the shadows before the cat emerges.",
//           "The mountain lion steps forward with deadly grace.",
//           "Muscle and sinew move with predatory precision.",
//           "The cat's tail flicks as it prepares to strike.",
//         ],
//       },
//     ],
//   };

//   const creatureTypes =
//     creatureTemplates[entityType] || creatureTemplates["monster"];

//   // Generate team composition based on creature type
//   const teamComposition = generateTeamComposition(count, creatureTypes, x, y);

//   teamComposition.forEach((creatureTemplate, index) => {
//     // Generate creature using character generation system
//     const creature = generateCreature(creatureTemplate, x, y, index);

//     // Create monster with generated character data
//     const monster = new Monster(creature.name, creature.health.max, 0, x, y);
//     monster.character = creature; // Store the full character data
//     monster.killValue = creatureTemplate.killValue;
//     monster.discoveryMessages = creatureTemplate.discoveryMessages;
//     monster.detectionMessages = creatureTemplate.detectionMessages;

//     monsters.push(monster);
//   });

//   return monsters;
// }

// // Generate creature using character generation system
// function generateCreature(creatureTemplate, x, y, index) {
//   // Select random class from available classes for this creature type
//   const selectedClass =
//     creatureTemplate.classes[
//       Math.floor(Math.random() * creatureTemplate.classes.length)
//     ];

//   // Generate creature using character generation with creature-specific options
//   const creature = characterGeneration.generateCharacter({
//     usePointAllocation: false, // Use procedural generation for creatures
//     className: selectedClass,
//     raceName: creatureTemplate.race,
//     gender: Math.random() < 0.7 ? "male" : "female", // 70/30 male/female
//     isPlayer: false,
//   });

//   // Apply creature-specific stat scaling based on size and power
//   const scaledStats = scaleCreatureStats(creature.stats, creatureTemplate.race);
//   creature.stats = scaledStats;

//   // Apply class stat multiplier
//   const classData = getClassByName(selectedClass);
//   if (classData && classData.statMultiplier) {
//     Object.keys(creature.stats).forEach((stat) => {
//       creature.stats[stat] = Math.floor(
//         creature.stats[stat] * classData.statMultiplier
//       );
//     });
//   }

//   // Recalculate health based on scaled stats
//   creature.health = {
//     current: calculateCharacterHealth(creature),
//     max: calculateCharacterHealth(creature),
//   };

//   // Add creature-specific equipment based on class
//   creature.equipment = generateCreatureEquipment(
//     selectedClass,
//     creatureTemplate.race
//   );

//   return creature;
// }

// // Scale creature stats based on race characteristics
// function scaleCreatureStats(baseStats, race) {
//   const scaledStats = { ...baseStats };

//   // Apply creature-specific scaling multipliers
//   const scalingFactors = {
//     Goblin: {
//       STR: 0.8,
//       DEX: 1.2,
//       CON: 0.9,
//       INT: 1.1,
//       WIS: 1.0,
//       CHA: 0.9,
//       LUCK: 1.2,
//     },
//     Orc: {
//       STR: 1.3,
//       DEX: 0.9,
//       CON: 1.2,
//       INT: 0.8,
//       WIS: 0.9,
//       CHA: 0.9,
//       LUCK: 1.0,
//     },
//     Troll: {
//       STR: 1.5,
//       DEX: 0.7,
//       CON: 1.4,
//       INT: 0.7,
//       WIS: 0.8,
//       CHA: 0.8,
//       LUCK: 1.0,
//     },
//     Dragon: {
//       STR: 1.8,
//       DEX: 1.1,
//       CON: 1.6,
//       INT: 1.4,
//       WIS: 1.3,
//       CHA: 1.3,
//       LUCK: 1.2,
//     },
//     Demon: {
//       STR: 1.4,
//       DEX: 1.1,
//       CON: 1.3,
//       INT: 1.2,
//       WIS: 1.1,
//       CHA: 1.3,
//       LUCK: 1.1,
//     },
//     Wolf: {
//       STR: 1.0,
//       DEX: 1.2,
//       CON: 1.1,
//       INT: 0.9,
//       WIS: 1.2,
//       CHA: 1.0,
//       LUCK: 1.1,
//     },
//     Bear: {
//       STR: 1.4,
//       DEX: 0.8,
//       CON: 1.3,
//       INT: 0.8,
//       WIS: 1.1,
//       CHA: 0.9,
//       LUCK: 1.0,
//     },
//     MountainLion: {
//       STR: 1.1,
//       DEX: 1.3,
//       CON: 1.1,
//       INT: 1.0,
//       WIS: 1.2,
//       CHA: 1.0,
//       LUCK: 1.1,
//     },
//   };

//   const factors = scalingFactors[race] || {
//     STR: 1.0,
//     DEX: 1.0,
//     CON: 1.0,
//     INT: 1.0,
//     WIS: 1.0,
//     CHA: 1.0,
//     LUCK: 1.0,
//   };

//   Object.keys(scaledStats).forEach((stat) => {
//     scaledStats[stat] = Math.floor(scaledStats[stat] * factors[stat]);
//   });

//   return scaledStats;
// }

// // Generate equipment for creatures based on their class and race
// function generateCreatureEquipment(className, race) {
//   const classData = getClassByName(className);
//   if (!classData || !classData.equipmentPreferences) {
//     return { clothes: null, armor: null, weapon: null, tool: null };
//   }

//   const equipment = {
//     clothes: null,
//     armor: null,
//     weapon: null,
//     secondHand: null,
//     back: null,
//     tool: null,
//   };

//   // Always generate clothes
//   if (
//     classData.equipmentPreferences.clothes &&
//     classData.equipmentPreferences.clothes.length > 0
//   ) {
//     const clothesType =
//       classData.equipmentPreferences.clothes[
//         Math.floor(
//           Math.random() * classData.equipmentPreferences.clothes.length
//         )
//       ];
//     equipment.clothes = generateEquipmentItem("clothes", clothesType);
//   }

//   // Generate armor for martial creatures
//   const martialClasses = ["goblin_warrior", "orc_raider", "troll_brute"];
//   if (
//     martialClasses.includes(className) &&
//     classData.equipmentPreferences.armor
//   ) {
//     const armorType =
//       classData.equipmentPreferences.armor[
//         Math.floor(Math.random() * classData.equipmentPreferences.armor.length)
//       ];
//     equipment.armor = generateEquipmentItem("armor", armorType);
//   }

//   // Generate weapon
//   if (
//     classData.equipmentPreferences.weapon &&
//     classData.equipmentPreferences.weapon.length > 0
//   ) {
//     const weaponType =
//       classData.equipmentPreferences.weapon[
//         Math.floor(Math.random() * classData.equipmentPreferences.weapon.length)
//       ];
//     equipment.weapon = generateEquipmentItem("weapon1h", weaponType);
//   }

//   // Generate shield for certain classes
//   if (
//     classData.equipmentPreferences.shield &&
//     classData.equipmentPreferences.shield.length > 0
//   ) {
//     const shieldType =
//       classData.equipmentPreferences.shield[
//         Math.floor(Math.random() * classData.equipmentPreferences.shield.length)
//       ];
//     equipment.secondHand = generateEquipmentItem("shield", shieldType);
//   }

//   // Generate tool
//   if (
//     classData.equipmentPreferences.tool &&
//     classData.equipmentPreferences.tool.length > 0
//   ) {
//     const toolType =
//       classData.equipmentPreferences.tool[
//         Math.floor(Math.random() * classData.equipmentPreferences.tool.length)
//       ];
//     equipment.tool = generateEquipmentItem("tool", toolType);
//   }

//   return equipment;
// }

// // Generate individual equipment item (simplified version)
// function generateEquipmentItem(equipmentType, itemType) {
//   // Simplified equipment generation for creatures
//   const statuses = ["worn", "damaged", "intact", "good", "excellent"];
//   const materials = ["leather", "iron", "steel", "wood", "bone"];
//   const rarities = ["poor", "common", "good", "rare"];

//   const status = statuses[Math.floor(Math.random() * statuses.length)];
//   const material = materials[Math.floor(Math.random() * materials.length)];
//   const rarity = rarities[Math.floor(Math.random() * rarities.length)];

//   return `${status} ${material} ${rarity} [${itemType}]`;
// }

// // Team composition logic
// function generateTeamComposition(requestedCount, creatureTypes, x, y) {
//   const team = [];

//   // Use hash to determine primary creature type
//   const primaryHash = hash(x, y, 0);
//   const primaryCreature =
//     creatureTypes[Math.floor(primaryHash * creatureTypes.length)];

//   // Determine team size based on creature type
//   let teamSize = requestedCount;

//   if (primaryCreature.teamComposition === "solo") {
//     teamSize = 1; // Solo creatures are always alone
//   } else if (primaryCreature.teamComposition === "solo_or_pair") {
//     teamSize = Math.min(requestedCount, 2); // Max 2 demons
//   } else if (primaryCreature.teamComposition === "pack") {
//     teamSize = Math.min(requestedCount, 4); // Max 4 for pack creatures
//   }

//   // Add primary creature
//   team.push(primaryCreature);

//   // Add allies if applicable
//   if (
//     teamSize > 1 &&
//     primaryCreature.allies &&
//     primaryCreature.allies.length > 0
//   ) {
//     const remainingSlots = teamSize - 1;

//     for (let i = 0; i < remainingSlots; i++) {
//       // Use hash to determine ally type
//       const allyHash = hash(x, y, i + 1);
//       const allyTypeName =
//         primaryCreature.allies[
//           Math.floor(allyHash * primaryCreature.allies.length)
//         ];

//       // Find ally creature template
//       const allyCreature = creatureTypes.find(
//         (creature) => creature.name === allyTypeName
//       );
//       if (allyCreature) {
//         team.push(allyCreature);
//       } else {
//         // If ally not found, add another of the same type
//         team.push(primaryCreature);
//       }
//     }
//   }

//   return team;
// }

// // Utility functions for creature messages
// function getRandomDiscoveryMessage(monster) {
//   if (monster.discoveryMessages && monster.discoveryMessages.length > 0) {
//     const randomIndex = Math.floor(
//       Math.random() * monster.discoveryMessages.length
//     );
//     return monster.discoveryMessages[randomIndex];
//   }
//   return "You find signs of a creature's presence.";
// }

// function getRandomDetectionMessage(monster) {
//   if (monster.detectionMessages && monster.detectionMessages.length > 0) {
//     const randomIndex = Math.floor(
//       Math.random() * monster.detectionMessages.length
//     );
//     return monster.detectionMessages[randomIndex];
//   }
//   return "A creature emerges from the shadows.";
// }

// function getCreatureRarityColor(rarity) {
//   switch (rarity) {
//     case "common":
//       return "#888888";
//     case "uncommon":
//       return "#00ff00";
//     case "rare":
//       return "#0080ff";
//     case "legendary":
//       return "#ff8000";
//     case "mythic":
//       return "#ff0080";
//     default:
//       return "#888888";
//   }
// }

// // Ally generation - now stat-based
// function generateAllies() {
//   const allies = [];

//   // Include player character if it exists
//   if (gameState.playerCharacter) {
//     allies.push(new Ally(gameState.playerCharacter));
//   }

//   // Include all group members (NPCs)
//   gameState.group.forEach((member) => {
//     allies.push(new Ally(member));
//   });

//   return allies;
// }

// // Combat display
// function getCombatStatus(allies, monsters, turnCount = 0) {
//   let status = `⚔️ **COMBAT STATUS** - Round ${turnCount} ⚔️\n\n`;

//   status += "👥 **Allies:**\n";
//   allies.forEach((ally, index) => {
//     const healthBar =
//       "█".repeat(Math.max(0, ally.maxHealth - ally.wounds)) +
//       "░".repeat(ally.wounds);

//     let statusText = ally.status;
//     if (ally.isUnconscious()) {
//       statusText = "😵 Unconscious";
//     } else if (ally.isDead()) {
//       statusText = "💀 Dead";
//     } else if (ally.isFleeing()) {
//       statusText = "🏃 Fleeing";
//     } else {
//       statusText = "⚔️ Active";
//     }

//     status += `${index + 1}. ${ally.name} (${
//       ally.role
//     }) - ${statusText} [${healthBar}] ${ally.currentHealth}/${
//       ally.maxHealth
//     }\n`;
//   });

//   status += "\n👹 **Enemies:**\n";
//   monsters.forEach((monster, index) => {
//     const healthBar =
//       "█".repeat(Math.max(0, monster.maxHealth - monster.wounds)) +
//       "░".repeat(monster.wounds);
//     status += `${index + 1}. ${monster.name} - ${
//       monster.status
//     } [${healthBar}] ${monster.currentHealth}/${monster.maxHealth}\n`;
//   });

//   return status;
// }

// // AI behavior - now stat-based
// function allyAI(allies, monsters, turnCount = 0) {
//   const activeAllies = allies.filter(
//     (ally) => !ally.isDead() && !ally.isFleeing() && !ally.isUnconscious()
//   );
//   const activeMonsters = monsters.filter(
//     (monster) => !monster.isDead() && !monster.isFleeing()
//   );

//   console.log(
//     `Round ${turnCount} - Ally AI: ${activeAllies.length} active allies, ${activeMonsters.length} active monsters`
//   );

//   if (activeMonsters.length === 0) {
//     console.log("Round ${turnCount} - Ally AI: No monsters to attack");
//     return;
//   }

//   activeAllies.forEach((ally) => {
//     // Allies attack the most wounded monster
//     const target = activeMonsters.reduce((prev, current) =>
//       prev.wounds > current.wounds ? prev : current
//     );

//     // Calculate hit chance based on character accuracy
//     const accuracy = calculateCharacterAccuracy(ally.character);
//     const hitRoll = Math.random() * 100;

//     if (hitRoll <= accuracy) {
//       const damage = ally.getDamage();
//       const oldHealth = target.currentHealth;
//       target.takeDamage(damage);
//       const newHealth = target.currentHealth;

//       console.log(
//         `Round ${turnCount} - ${ally.name} attacks ${target.name}: ${damage} damage (${oldHealth} → ${newHealth} HP)`
//       );
//       logEvent(`${ally.name} attacks ${target.name} for ${damage} damage!`);

//       // Progress combat skills
//       const weaponSkill = getPrimaryWeaponSkill(ally.character);
//       progressSkill(ally.character, weaponSkill);
//     } else {
//       console.log(
//         `Round ${turnCount} - ${ally.name} misses ${
//           target.name
//         } (${hitRoll.toFixed(1)} > ${accuracy})`
//       );
//       logEvent(`${ally.name} attacks ${target.name} but misses!`);
//     }

//     // Chance to flee if heavily wounded (based on character stats)
//     const courage =
//       (ally.character.stats?.CHA || 8) + (ally.character.stats?.WIS || 8);
//     const fleeThreshold = Math.max(0.1, 0.4 - (courage - 16) * 0.02); // Higher courage = less likely to flee

//     if (ally.wounds >= 3 && Math.random() < fleeThreshold) {
//       ally.flee();
//       console.log(`Round ${turnCount} - ${ally.name} flees from combat!`);
//       logEvent(`${ally.name} flees from combat!`);
//     }
//   });
// }

// function monsterAI(monsters, allies, turnCount = 0) {
//   const activeMonsters = monsters.filter(
//     (monster) => !monster.isDead() && !monster.isFleeing()
//   );
//   const activeAllies = allies.filter(
//     (ally) => !ally.isDead() && !ally.isFleeing() && !ally.isUnconscious()
//   );
//   const unconsciousAllies = allies.filter((ally) => ally.isUnconscious());

//   console.log(
//     `Round ${turnCount} - Monster AI: ${activeMonsters.length} active monsters, ${activeAllies.length} active allies, ${unconsciousAllies.length} unconscious allies`
//   );

//   if (activeAllies.length === 0 && unconsciousAllies.length === 0) {
//     console.log(`Round ${turnCount} - Monster AI: No allies to attack`);
//     return;
//   }

//   activeMonsters.forEach((monster) => {
//     // Monsters prefer to attack active allies, but will attack unconscious ones if no active allies
//     let target;
//     if (activeAllies.length > 0) {
//       target = activeAllies[Math.floor(Math.random() * activeAllies.length)];
//     } else {
//       // Attack unconscious allies (this will kill them)
//       target =
//         unconsciousAllies[Math.floor(Math.random() * unconsciousAllies.length)];
//     }

//     const damage = monster.getDamage();
//     const oldHealth = target.currentHealth;
//     const wasUnconscious = target.isUnconscious();

//     // Apply defense reduction
//     const defense = calculateCharacterDefense(target.character);
//     const finalDamage = Math.max(1, damage - defense);

//     target.takeDamage(finalDamage);
//     const newHealth = target.currentHealth;

//     if (wasUnconscious) {
//       console.log(
//         `Round ${turnCount} - ${monster.name} finishes off unconscious ${target.name}: ${finalDamage} damage (${oldHealth} → ${newHealth} HP) - ${target.name} is now DEAD`
//       );
//       logEvent(
//         `${monster.name} finishes off unconscious ${target.name}! ${target.name} is dead!`
//       );
//     } else {
//       console.log(
//         `Round ${turnCount} - ${monster.name} attacks ${target.name}: ${finalDamage} damage (${oldHealth} → ${newHealth} HP)`
//       );
//       logEvent(
//         `${monster.name} attacks ${target.name} for ${finalDamage} damage!`
//       );

//       if (target.isUnconscious()) {
//         logEvent(`${target.name} falls unconscious!`);
//       }
//     }

//     // Chance to flee if heavily wounded
//     if (monster.wounds >= 2 && Math.random() < 0.2) {
//       monster.flee();
//       console.log(`Round ${turnCount} - ${monster.name} flees from combat!`);
//       logEvent(`${monster.name} flees from combat!`);
//     }
//   });
// }

// // Main combat function
// export async function handleEnhancedCombat(ex, ey, isOnTile = false) {
//   let tile = getTile(ex, ey);
//   let entity = tile.entity;

//   // For monster caves, force entity to be "monster" to generate appropriate monsters
//   if (tile.location === "monster caves") {
//     entity = "monster";
//   }

//   // Phase 1: Initial Detection
//   const detectionBonus = calculateDetectionBonus();
//   const luckRoll = Math.floor(Math.random() * 10) + 1;
//   const baseMonsterCount = Math.floor(Math.random() * 3) + 1; // 1-3 monsters
//   const detectedCount = Math.min(
//     baseMonsterCount +
//       Math.floor(detectionBonus / 3) +
//       Math.floor(luckRoll / 3),
//     5
//   );

//   // Generate monsters first to get their descriptions
//   const monsters = generateMonsters(detectedCount, entity, ex, ey);
//   const detectionMessage = generateDetectionMessage(monsters);

//   // Phase 2: Player Choice
//   const choice = await showChoiceDialog(detectionMessage, [
//     { type: "button", label: "⚔️ Charge", value: "charge" },
//     { type: "button", label: "🗡️ Attack", value: "attack" },
//     { type: "button", label: "🥷 Stalk", value: "stalk" },
//     { type: "button", label: "📏 Keep Distance", value: "keep_distance" },
//     { type: "button", label: "🏃 Run", value: "run" },
//   ]);

//   if (choice === "run") {
//     if (isOnTile) {
//       gameState.px = gameState.prevx;
//       gameState.py = gameState.prevy;
//       await showChoiceDialog("Fled back. 😵‍💫", [
//         { type: "button", label: "OK", value: "ok" },
//       ]);
//     } else {
//       await showChoiceDialog("Fled, staying put. 😅", [
//         { type: "button", label: "OK", value: "ok" },
//       ]);
//     }
//     return false;
//   }

//   // Phase 3: Hidden Discovery Roll
//   const stealthModifier = calculateStealthModifier();
//   const discoveryRoll = Math.random() * 10 + stealthModifier;
//   const discovered = discoveryRoll < 6; // 60% base chance

//   // Phase 4: Initiative
//   const playerGoesFirst = calculateInitiative(choice, stealthModifier);

//   // Debug logging
//   console.log(
//     `Combat Debug - Choice: ${choice}, Stealth Modifier: ${stealthModifier}, Player Goes First: ${playerGoesFirst}`
//   );

//   // Phase 5: Combat Setup
//   const allies = generateAllies();

//   // Show detection messages for each monster type
//   const monsterGroups = {};
//   monsters.forEach((monster) => {
//     if (!monsterGroups[monster.name]) {
//       monsterGroups[monster.name] = [];
//     }
//     monsterGroups[monster.name].push(monster);
//   });

//   // Display detection messages for each creature type
//   for (const [monsterType, group] of Object.entries(monsterGroups)) {
//     const monster = group[0];
//     const detectionMessage = getRandomDetectionMessage(monster);
//     const count = group.length;

//     let message = detectionMessage;
//     if (count > 1) {
//       message += ` (${count} ${monsterType}s)`;
//     }

//     await showChoiceDialog(message, [
//       { type: "button", label: "Continue", value: "continue" },
//     ]);
//   }

//   console.log(
//     `Combat Setup - Monsters: ${monsters.length}, Allies: ${allies.length}`
//   );
//   console.log(
//     `Monster health: ${monsters.map(
//       (m) => m.maxHealth
//     )}, Ally health: ${allies.map((a) => a.maxHealth)}`
//   );

//   // Determine enemy visibility based on group composition
//   const outnumbered = allies.length < monsters.length;
//   const hasScouts = gameState.group.some((member) => {
//     // Use skills instead of roles to determine if group has scouts
//     const scouting = member.skills?.scouting || 0;
//     const tracking = member.skills?.tracking || 0;
//     const investigation = member.skills?.investigation || 0;
//     const navigation = member.skills?.navigation || 0;

//     // Consider someone a scout if they have relevant skills at level 2 or higher
//     return (
//       scouting >= 2 || tracking >= 2 || investigation >= 2 || navigation >= 2
//     );
//   });

//   let enemyDescription = "";
//   if (outnumbered && !hasScouts) {
//     enemyDescription =
//       "You can only see partial details of the enemy creatures.";
//   } else {
//     enemyDescription = "You have a perfect view of all enemy creatures.";
//   }

//   await showChoiceDialog(
//     `${enemyDescription}\n\n${
//       playerGoesFirst ? "You strike first!" : "The enemies attack first!"
//     }`,
//     [{ type: "button", label: "Begin Combat", value: "start" }]
//   );

//   // Phase 6: Combat Loop
//   let combatActive = true;
//   let turnCount = 0;

//   while (combatActive && turnCount < 20) {
//     // Prevent infinite loops
//     turnCount++;
//     console.log(`Combat Turn ${turnCount}`);

//     const activeAllies = allies.filter(
//       (ally) => !ally.isDead() && !ally.isFleeing()
//     );
//     const activeMonsters = monsters.filter(
//       (monster) => !monster.isDead() && !monster.isFleeing()
//     );

//     // Check win conditions
//     if (activeMonsters.length === 0) {
//       console.log(`Round ${turnCount} - VICTORY! All monsters defeated`);
//       await showChoiceDialog("Victory! All enemies defeated! 🏆", [
//         { type: "button", label: "OK", value: "ok" },
//       ]);
//       gameState.killed.add(`${ex},${ey}`);
//       gameState.killPoints += 5 * monsters.length;
//       updateStatus();
//       logEvent(`🏆 Defeated ${monsters.length} ${entity}s at (${ex},${ey})`);
//       return true;
//     }

//     if (activeAllies.length === 0) {
//       console.log(`Round ${turnCount} - DEFEAT! All allies fallen`);
//       // Player takes damage based on character stats
//       const playerDefense = gameState.playerCharacter
//         ? calculateCharacterDefense(gameState.playerCharacter)
//         : 0;
//       const baseDamage = Math.floor(Math.random() * 15) + 10;
//       const finalDamage = Math.max(1, baseDamage - playerDefense);

//       gameState.health -= finalDamage;
//       updateStatus();

//       await showChoiceDialog(
//         `Defeat! All allies fallen. You took ${finalDamage} damage. 🤕`,
//         [{ type: "button", label: "OK", value: "ok" }]
//       );

//       logEvent(`🤕 Defeated by ${entity}s at (${ex},${ey})`);

//       const death = await checkDeath();
//       if (death === "health") {
//         await showChoiceDialog("You died fighting! ☠️", [
//           { type: "button", label: "🔄 Restart Game", value: "restart" },
//         ]);
//         location.reload();
//       } else if (death === "gold") {
//         await showChoiceDialog("You paid your debt with your life! ☠️", [
//           { type: "button", label: "🔄 Restart Game", value: "restart" },
//         ]);
//         location.reload();
//       }
//       return false;
//     }

//     // Determine turn order based on initiative
//     if (playerGoesFirst || turnCount === 1) {
//       console.log(
//         `Round ${turnCount} - Player goes first (initiative won: ${playerGoesFirst})`
//       );

//       // Player turn
//       const playerAction = await showChoiceDialog(
//         getCombatStatus(allies, monsters, turnCount),
//         [
//           { type: "button", label: "⚔️ Attack", value: "attack" },
//           {
//             type: "button",
//             label: "📢 Shout to Attack",
//             value: "rally_attack",
//           },
//           { type: "button", label: "🆘 Shout for Help", value: "call_help" },
//           { type: "button", label: "🏃 Shout to Run", value: "order_retreat" },
//           { type: "button", label: "🏃 Run Away", value: "run_away" },
//         ]
//       );

//       console.log(`Round ${turnCount} - Player chose: ${playerAction}`);

//       // Resolve player action
//       switch (playerAction) {
//         case "attack":
//           const target =
//             activeMonsters[Math.floor(Math.random() * activeMonsters.length)];

//           // Calculate hit chance and damage based on player stats
//           const playerAccuracy = gameState.playerCharacter
//             ? calculateCharacterAccuracy(gameState.playerCharacter)
//             : 50;
//           const hitRoll = Math.random() * 100;

//           if (hitRoll <= playerAccuracy) {
//             const damage = gameState.playerCharacter
//               ? calculateCharacterDamage(gameState.playerCharacter)
//               : 2;
//             const oldHealth = target.currentHealth;
//             target.takeDamage(damage);
//             const newHealth = target.currentHealth;

//             console.log(
//               `Round ${turnCount} - Player attacks ${target.name}: ${damage} damage (${oldHealth} → ${newHealth} HP)`
//             );
//             logEvent(`You attack ${target.name} for ${damage} damage!`);

//             // Progress combat skills
//             if (gameState.playerCharacter) {
//               const weaponSkill = getPrimaryWeaponSkill(
//                 gameState.playerCharacter
//               );
//               progressSkill(gameState.playerCharacter, weaponSkill);
//             }
//           } else {
//             console.log(
//               `Round ${turnCount} - Player misses ${
//                 target.name
//               } (${hitRoll.toFixed(1)} > ${playerAccuracy})`
//             );
//             logEvent(`You attack ${target.name} but miss!`);
//           }
//           break;

//         case "rally_attack":
//           console.log(`Round ${turnCount} - Player rallies allies`);
//           // Boost ally attack power for this turn
//           allies.forEach((ally) => {
//             if (!ally.isDead() && !ally.isFleeing()) {
//               const oldHealth = ally.currentHealth;
//               ally.takeDamage(-1); // Heal 1 HP as rally effect
//               const newHealth = ally.currentHealth;
//               console.log(
//                 `Round ${turnCount} - ${ally.name} healed by rally: ${oldHealth} → ${newHealth} HP`
//               );
//             }
//           });
//           logEvent("You rally your allies! They gain confidence!");
//           break;

//         case "call_help":
//           console.log(`Round ${turnCount} - Player calls for help`);
//           // Chance to call for reinforcements (if any available)
//           if (Math.random() < 0.3) {
//             const newAlly = new Ally("Reinforcement", "guard");
//             allies.push(newAlly);
//             console.log(
//               `Round ${turnCount} - Reinforcement joined! Total allies: ${allies.length}`
//             );
//             logEvent("A reinforcement joins your group!");
//           } else {
//             console.log(`Round ${turnCount} - No help arrived`);
//             logEvent("No help arrives...");
//           }
//           break;

//         case "order_retreat":
//           console.log(`Round ${turnCount} - Player orders retreat`);
//           // Order allies to retreat
//           let retreatedCount = 0;
//           allies.forEach((ally) => {
//             if (!ally.isDead() && Math.random() < 0.7) {
//               ally.flee();
//               retreatedCount++;
//             }
//           });
//           console.log(
//             `Round ${turnCount} - ${retreatedCount} allies retreated`
//           );
//           logEvent("You order your allies to retreat!");
//           break;

//         case "run_away":
//           console.log(`Round ${turnCount} - Player attempts to flee`);

//           // Check if player is unconscious
//           const player = allies[0]; // Player is first ally
//           if (player && player.isUnconscious()) {
//             console.log(
//               `Round ${turnCount} - Player cannot flee while unconscious`
//             );
//             logEvent("You cannot flee while unconscious!");
//             break;
//           }

//           // Player attempts to flee - now based on stats
//           const playerSpeed = gameState.playerCharacter
//             ? (gameState.playerCharacter.stats?.DEX || 8) +
//               (gameState.playerCharacter.stats?.CON || 8)
//             : 16;
//           const fleeChance = Math.min(0.8, 0.4 + (playerSpeed - 16) * 0.02); // Higher speed = better flee chance
//           const fleeRoll = Math.random();
//           console.log(
//             `Round ${turnCount} - Flee chance: ${fleeChance.toFixed(
//               2
//             )}, Roll: ${fleeRoll.toFixed(2)}`
//           );

//           if (fleeRoll < fleeChance) {
//             console.log(`Round ${turnCount} - Player successfully fled!`);
//             await showChoiceDialog("You successfully flee! 🏃", [
//               { type: "button", label: "OK", value: "ok" },
//             ]);
//             return false;
//           } else {
//             console.log(`Round ${turnCount} - Player failed to flee`);
//             logEvent("You fail to flee!");
//           }
//           break;
//       }

//       // AI turns
//       console.log(`Round ${turnCount} - Ally AI turn`);
//       allyAI(allies, monsters, turnCount);
//       console.log(`Round ${turnCount} - Monster AI turn`);
//       monsterAI(monsters, allies, turnCount);

//       // Check for immediate victory/defeat after AI turns
//       const currentActiveAllies = allies.filter(
//         (ally) => !ally.isDead() && !ally.isFleeing()
//       );
//       const currentActiveMonsters = monsters.filter(
//         (monster) => !monster.isDead() && !monster.isFleeing()
//       );

//       if (currentActiveMonsters.length === 0) {
//         console.log(`Round ${turnCount} - VICTORY! All monsters defeated`);
//         await showChoiceDialog("Victory! All enemies defeated! 🏆", [
//           { type: "button", label: "OK", value: "ok" },
//         ]);
//         gameState.killed.add(`${ex},${ey}`);
//         gameState.killPoints += 5 * monsters.length;
//         updateStatus();
//         logEvent(`🏆 Defeated ${monsters.length} ${entity}s at (${ex},${ey})`);
//         return true;
//       }

//       if (currentActiveAllies.length === 0) {
//         console.log(`Round ${turnCount} - DEFEAT! All allies fallen`);
//         const playerDefense = gameState.playerCharacter
//           ? calculateCharacterDefense(gameState.playerCharacter)
//           : 0;
//         const baseDamage = Math.floor(Math.random() * 15) + 10;
//         const finalDamage = Math.max(1, baseDamage - playerDefense);

//         gameState.health -= finalDamage;
//         updateStatus();
//         await showChoiceDialog(
//           `Defeat! All allies fallen. You took ${finalDamage} damage. 🤕`,
//           [{ type: "button", label: "OK", value: "ok" }]
//         );
//         logEvent(`🤕 Defeated by ${entity}s at (${ex},${ey})`);
//         const death = await checkDeath();
//         if (death === "health") {
//           await showChoiceDialog("You died fighting! ☠️", [
//             { type: "button", label: "🔄 Restart Game", value: "restart" },
//           ]);
//           location.reload();
//         } else if (death === "gold") {
//           await showChoiceDialog("You paid your debt with your life! ☠️", [
//             { type: "button", label: "🔄 Restart Game", value: "restart" },
//           ]);
//           location.reload();
//         }
//         return false;
//       }
//     } else {
//       // Monsters go first
//       console.log(`Round ${turnCount} - Monsters go first (initiative lost)`);

//       console.log(`Round ${turnCount} - Monster AI turn`);
//       monsterAI(monsters, allies, turnCount);
//       console.log(`Round ${turnCount} - Ally AI turn`);
//       allyAI(allies, monsters, turnCount);

//       // Player turn
//       const playerAction = await showChoiceDialog(
//         getCombatStatus(allies, monsters, turnCount),
//         [
//           { type: "button", label: "⚔️ Attack", value: "attack" },
//           {
//             type: "button",
//             label: "📢 Shout to Attack",
//             value: "rally_attack",
//           },
//           { type: "button", label: "🆘 Shout for Help", value: "call_help" },
//           { type: "button", label: "🏃 Shout to Run", value: "order_retreat" },
//           { type: "button", label: "🏃 Run Away", value: "run_away" },
//         ]
//       );

//       console.log(`Round ${turnCount} - Player chose: ${playerAction}`);

//       // Resolve player action (same as above)
//       switch (playerAction) {
//         case "attack":
//           const target =
//             activeMonsters[Math.floor(Math.random() * activeMonsters.length)];

//           const playerAccuracy = gameState.playerCharacter
//             ? calculateCharacterAccuracy(gameState.playerCharacter)
//             : 50;
//           const hitRoll = Math.random() * 100;

//           if (hitRoll <= playerAccuracy) {
//             const damage = gameState.playerCharacter
//               ? calculateCharacterDamage(gameState.playerCharacter)
//               : 2;
//             const oldHealth = target.currentHealth;
//             target.takeDamage(damage);
//             const newHealth = target.currentHealth;

//             console.log(
//               `Round ${turnCount} - Player attacks ${target.name}: ${damage} damage (${oldHealth} → ${newHealth} HP)`
//             );
//             logEvent(`You attack ${target.name} for ${damage} damage!`);

//             if (gameState.playerCharacter) {
//               const weaponSkill = getPrimaryWeaponSkill(
//                 gameState.playerCharacter
//               );
//               progressSkill(gameState.playerCharacter, weaponSkill);
//             }
//           } else {
//             console.log(
//               `Round ${turnCount} - Player misses ${
//                 target.name
//               } (${hitRoll.toFixed(1)} > ${playerAccuracy})`
//             );
//             logEvent(`You attack ${target.name} but miss!`);
//           }
//           break;

//         case "rally_attack":
//           console.log(`Round ${turnCount} - Player rallies allies`);
//           allies.forEach((ally) => {
//             if (!ally.isDead() && !ally.isFleeing()) {
//               const oldHealth = ally.currentHealth;
//               ally.takeDamage(-1);
//               const newHealth = ally.currentHealth;
//               console.log(
//                 `Round ${turnCount} - ${ally.name} healed by rally: ${oldHealth} → ${newHealth} HP`
//               );
//             }
//           });
//           logEvent("You rally your allies! They gain confidence!");
//           break;

//         case "call_help":
//           console.log(`Round ${turnCount} - Player calls for help`);
//           if (Math.random() < 0.3) {
//             const newAlly = new Ally("Reinforcement", "guard");
//             allies.push(newAlly);
//             console.log(
//               `Round ${turnCount} - Reinforcement joined! Total allies: ${allies.length}`
//             );
//             logEvent("A reinforcement joins your group!");
//           } else {
//             console.log(`Round ${turnCount} - No help arrived`);
//             logEvent("No help arrives...");
//           }
//           break;

//         case "order_retreat":
//           console.log(`Round ${turnCount} - Player orders retreat`);
//           let retreatedCount = 0;
//           allies.forEach((ally) => {
//             if (!ally.isDead() && Math.random() < 0.7) {
//               ally.flee();
//               retreatedCount++;
//             }
//           });
//           console.log(
//             `Round ${turnCount} - ${retreatedCount} allies retreated`
//           );
//           logEvent("You order your allies to retreat!");
//           break;

//         case "run_away":
//           console.log(`Round ${turnCount} - Player attempts to flee`);

//           const player = allies[0];
//           if (player && player.isUnconscious()) {
//             console.log(
//               `Round ${turnCount} - Player cannot flee while unconscious`
//             );
//             logEvent("You cannot flee while unconscious!");
//             break;
//           }

//           const playerSpeed = gameState.playerCharacter
//             ? (gameState.playerCharacter.stats?.DEX || 8) +
//               (gameState.playerCharacter.stats?.CON || 8)
//             : 16;
//           const fleeChance = Math.min(0.8, 0.4 + (playerSpeed - 16) * 0.02);
//           const fleeRoll = Math.random();
//           console.log(
//             `Round ${turnCount} - Flee chance: ${fleeChance.toFixed(
//               2
//             )}, Roll: ${fleeRoll.toFixed(2)}`
//           );

//           if (fleeRoll < fleeChance) {
//             console.log(`Round ${turnCount} - Player successfully fled!`);
//             await showChoiceDialog("You successfully flee! 🏃", [
//               { type: "button", label: "OK", value: "ok" },
//             ]);
//             return false;
//           } else {
//             console.log(`Round ${turnCount} - Player failed to flee`);
//             logEvent("You fail to flee!");
//           }
//           break;
//       }

//       // Check for immediate victory/defeat after player action
//       const currentActiveAllies = allies.filter(
//         (ally) => !ally.isDead() && !ally.isFleeing()
//       );
//       const currentActiveMonsters = monsters.filter(
//         (monster) => !monster.isDead() && !monster.isFleeing()
//       );

//       if (currentActiveMonsters.length === 0) {
//         console.log(`Round ${turnCount} - VICTORY! All monsters defeated`);
//         await showChoiceDialog("Victory! All enemies defeated! 🏆", [
//           { type: "button", label: "OK", value: "ok" },
//         ]);
//         gameState.killed.add(`${ex},${ey}`);
//         gameState.killPoints += 5 * monsters.length;
//         updateStatus();
//         logEvent(`🏆 Defeated ${monsters.length} ${entity}s at (${ex},${ey})`);
//         return true;
//       }

//       if (currentActiveAllies.length === 0) {
//         console.log(`Round ${turnCount} - DEFEAT! All allies fallen`);
//         const playerDefense = gameState.playerCharacter
//           ? calculateCharacterDefense(gameState.playerCharacter)
//           : 0;
//         const baseDamage = Math.floor(Math.random() * 15) + 10;
//         const finalDamage = Math.max(1, baseDamage - playerDefense);

//         gameState.health -= finalDamage;
//         updateStatus();
//         await showChoiceDialog(
//           `Defeat! All allies fallen. You took ${finalDamage} damage. 🤕`,
//           [{ type: "button", label: "OK", value: "ok" }]
//         );
//         logEvent(`🤕 Defeated by ${entity}s at (${ex},${ey})`);
//         const death = await checkDeath();
//         if (death === "health") {
//           await showChoiceDialog("You died fighting! ☠️", [
//             { type: "button", label: "🔄 Restart Game", value: "restart" },
//           ]);
//           location.reload();
//         } else if (death === "gold") {
//           await showChoiceDialog("You paid your debt with your life! ☠️", [
//             { type: "button", label: "🔄 Restart Game", value: "restart" },
//           ]);
//           location.reload();
//         }
//         return false;
//       }
//     }

//     // Check if combat should continue
//     const remainingAllies = allies.filter(
//       (ally) => !ally.isDead() && !ally.isFleeing()
//     );
//     const remainingMonsters = monsters.filter(
//       (monster) => !monster.isDead() && !monster.isFleeing()
//     );

//     console.log(
//       `Round ${turnCount} - Combat Status: ${remainingAllies.length} allies, ${remainingMonsters.length} monsters remaining`
//     );

//     if (remainingAllies.length === 0 || remainingMonsters.length === 0) {
//       console.log(
//         `Round ${turnCount} - Combat ended! Allies: ${remainingAllies.length}, Monsters: ${remainingMonsters.length}`
//       );
//       combatActive = false;
//     }
//   }

//   // Combat timeout
//   console.log(`Combat timeout after ${turnCount} rounds - Both sides withdraw`);
//   await showChoiceDialog("Combat drags on... Both sides withdraw. 🤝", [
//     { type: "button", label: "OK", value: "ok" },
//   ]);

//   return false;
// }
