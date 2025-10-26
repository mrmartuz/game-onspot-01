import {
  equipmentTypes,
  equipmentMaterials,
  equipmentRarity,
  equipmentStatus,
} from "../equipment.js";
import { weaponEmoji, equipmentEmoji } from "../../gamestate/emoji-database.js";

// Equipment assignment system
export const equipmentAssignment = {
  // Helper function to determine if a weapon is 2-handed
  is2HandedWeapon: function (weaponType) {
    const twoHandedWeapons = [
      "greatsword",
      "claymore",
      "zweihander",
      "bastard-sword",
      "greataxe",
      "battleaxe",
      "war-axe",
      "vrakgul-axe",
      "maul",
      "great-hammer",
      "war-hammer",
      "gormith-hammer",
      "spear",
      "halberd",
      "poleaxe",
      "staff",
      "quarterstaff",
      "scythe",
      "pike",
      "glaive",
      "bow",
      "longbow",
      "shortbow",
      "composite-bow",
      "recurve-bow",
      "lyssarion-bow",
      "crossbow",
      "heavy-crossbow",
      "light-crossbow",
      "gormith-crossbow",
    ];
    return twoHandedWeapons.includes(weaponType.toLowerCase());
  },

  // Helper function to determine weapon category for new weapon system
  getWeaponCategory: function (weaponName) {
    const weaponType = weaponName.toLowerCase();

    // Map weapon types to specific categories - order matters for overlapping names
    if (
      weaponType.includes("greatsword") ||
      weaponType.includes("claymore") ||
      weaponType.includes("zweihander")
    )
      return "great_swords";
    if (weaponType.includes("sword") || weaponType.includes("skrith-blade"))
      return "swords";
    if (
      weaponType.includes("greataxe") ||
      weaponType.includes("battleaxe") ||
      weaponType.includes("vrakgul-axe")
    )
      return "great_axes";
    if (weaponType.includes("axe")) return "axes";
    if (
      weaponType.includes("spear") ||
      weaponType.includes("halberd") ||
      weaponType.includes("polearm") ||
      weaponType.includes("staff") ||
      weaponType.includes("quarterstaff") ||
      weaponType.includes("scythe") ||
      weaponType.includes("pike") ||
      weaponType.includes("glaive")
    )
      return "polearms";
    if (
      weaponType.includes("maul") ||
      weaponType.includes("great-hammer") ||
      weaponType.includes("gormith-hammer")
    )
      return "great_hammers";
    if (
      weaponType.includes("mace") ||
      weaponType.includes("club") ||
      weaponType.includes("warhammer") ||
      weaponType.includes("flail") ||
      weaponType.includes("morningstar")
    )
      return "hammers";
    if (
      weaponType.includes("crossbow") ||
      weaponType.includes("gormith-crossbow")
    )
      return "crossbows";
    if (weaponType.includes("bow") || weaponType.includes("lyssarion-bow"))
      return "bows";
    if (
      weaponType.includes("dagger") ||
      weaponType.includes("javelin") ||
      weaponType.includes("throwing") ||
      weaponType.includes("sling") ||
      weaponType.includes("skrith-nedle")
    )
      return "throwing";
    if (
      weaponType.includes("shield") ||
      weaponType.includes("aurethine-shield")
    )
      return "shields";

    // Default fallback
    return "swords";
  },

  // Generate starting equipment based on class preferences
  generateStartingEquipment: async function (className) {
    // Import classDatabase dynamically to avoid circular dependency
    const { classDatabase } = await import("../combat/classes.js");
    const classData = classDatabase[className];
    if (!classData || !classData.equipmentPreferences) {
      return this.generateRandomEquipment();
    }

    const equipment = {
      clothes: null,
      armor: null,
      weapon: null,
      secondHand: null,
      back: null,
      tool: null,
    };

    // ALWAYS generate clothes for all characters
    if (
      classData.equipmentPreferences.clothes &&
      classData.equipmentPreferences.clothes.length > 0
    ) {
      const clothesType =
        classData.equipmentPreferences.clothes[
          Math.floor(
            Math.random() * classData.equipmentPreferences.clothes.length
          )
        ];
      equipment.clothes = this.generateEquipmentItem("clothes", clothesType);
    } else {
      // Fallback to basic clothes if no preferences
      equipment.clothes = this.generateEquipmentItem(
        "clothes",
        "commoner-clothes"
      );
    }

    // Generate armor ONLY for martial classes
    const martialClasses = [
      "fighter",
      "archer",
      "brute",
      "martial_artist",
      "paladin",
      "cleric",
      "ranger",
      "hunter",
      "dungeondiver",
    ];
    if (
      martialClasses.includes(className) &&
      classData.equipmentPreferences.armor &&
      classData.equipmentPreferences.armor.length > 0
    ) {
      const armorType =
        classData.equipmentPreferences.armor[
          Math.floor(
            Math.random() * classData.equipmentPreferences.armor.length
          )
        ];
      equipment.armor = this.generateEquipmentItem("armor", armorType);
    }

    // Generate weapon (1h) - ALWAYS generate a weapon for all characters
    if (
      classData.equipmentPreferences.weapon &&
      classData.equipmentPreferences.weapon.length > 0
    ) {
      const weaponType =
        classData.equipmentPreferences.weapon[
          Math.floor(
            Math.random() * classData.equipmentPreferences.weapon.length
          )
        ];
      const weaponCategory = this.getWeaponCategory(weaponType);
      equipment.weapon = this.generateEquipmentItem(weaponCategory, weaponType);

      // If it's a 2-handed weapon, set secondHand to indicate occupation
      if (this.is2HandedWeapon(weaponType)) {
        equipment.secondHand = "(2h-grip)";
      }
    } else {
      // Fallback weapon if no preferences defined
      equipment.weapon = this.generateEquipmentItem("swords", "sword");
    }

    // Generate shield or second weapon (only if weapon is not 2-handed)
    if (
      equipment.secondHand !== "(2h-grip)" &&
      classData.equipmentPreferences.shield &&
      classData.equipmentPreferences.shield.length > 0
    ) {
      const shieldType =
        classData.equipmentPreferences.shield[
          Math.floor(
            Math.random() * classData.equipmentPreferences.shield.length
          )
        ];
      const shieldCategory = this.getWeaponCategory(shieldType);
      equipment.secondHand = this.generateEquipmentItem(
        shieldCategory,
        shieldType
      );
    }

    // Generate container for back slot (only containers when weapon is 2h)
    if (
      classData.equipmentPreferences.back &&
      classData.equipmentPreferences.back.length > 0
    ) {
      const backType =
        classData.equipmentPreferences.back[
          Math.floor(Math.random() * classData.equipmentPreferences.back.length)
        ];

      // If weapon is 2-handed, only allow containers in back slot
      if (equipment.secondHand === "(2h-grip)") {
        if (
          equipmentTypes.container &&
          equipmentTypes.container.items &&
          equipmentTypes.container.items.includes(backType)
        ) {
          equipment.back = this.generateEquipmentItem("container", backType);
        }
      } else {
        // For 1-handed weapons, allow weapons, ranged, or containers
        const weapon2hItems = equipmentTypes.great_swords?.items || [];
        const weapon2hAxes = equipmentTypes.great_axes?.items || [];
        const weapon2hHammers = equipmentTypes.great_hammers?.items || [];
        const polearmItems = equipmentTypes.polearms?.items || [];
        const rangedItems = equipmentTypes.bows?.items || [];
        const crossbowItems = equipmentTypes.crossbows?.items || [];
        const containerItems = equipmentTypes.container?.items || [];

        if (
          weapon2hItems.includes(backType) ||
          weapon2hAxes.includes(backType) ||
          weapon2hHammers.includes(backType) ||
          polearmItems.includes(backType)
        ) {
          const backCategory = this.getWeaponCategory(backType);
          equipment.back = this.generateEquipmentItem(backCategory, backType);
        } else if (
          rangedItems.includes(backType) ||
          crossbowItems.includes(backType)
        ) {
          const backCategory = this.getWeaponCategory(backType);
          equipment.back = this.generateEquipmentItem(backCategory, backType);
        } else if (containerItems.includes(backType)) {
          equipment.back = this.generateEquipmentItem("container", backType);
        }
      }
    }

    // Generate tool based on class type
    const crafterClasses = ["craftsman", "alchemist", "herbalist"];
    const explorerClasses = ["explorer", "ranger", "hunter", "dungeondiver"];
    const mageClasses = [
      "pyromancer",
      "necromancer",
      "articaster",
      "geomancer",
    ];

    if (martialClasses.includes(className)) {
      // Martial classes get whetstone
      equipment.tool = this.generateEquipmentItem("tool", "whetstone");
    } else if (crafterClasses.includes(className)) {
      // Crafter classes get specialized kits based on their primary skill
      if (className === "herbalist") {
        equipment.tool = this.generateEquipmentItem("tool", "herbalist-kit");
      } else if (className === "craftsman") {
        equipment.tool = this.generateEquipmentItem(
          "tool",
          "blacksmithing-kit"
        );
      } else if (className === "alchemist") {
        equipment.tool = this.generateEquipmentItem("tool", "alchemy-kit");
      }
    } else if (explorerClasses.includes(className)) {
      // Explorer classes get specialized kits
      if (className === "dungeondiver") {
        equipment.tool = this.generateEquipmentItem("tool", "dungeondiver-kit");
      } else {
        equipment.tool = this.generateEquipmentItem("tool", "explorer-kit");
      }
    } else if (mageClasses.includes(className)) {
      // Mage classes get specialized kits based on their school
      if (className === "geomancer") {
        equipment.tool = this.generateEquipmentItem("tool", "geomancer-kit");
      } else if (className === "pyromancer") {
        equipment.tool = this.generateEquipmentItem("tool", "pyromancer-kit");
      } else if (className === "articaster") {
        equipment.tool = this.generateEquipmentItem("tool", "articaster-kit");
      } else if (className === "necromancer") {
        equipment.tool = this.generateEquipmentItem("tool", "necromancer-kit");
      }
    } else if (className === "monk" || className === "cleric") {
      // Monks and clerics get meditation kit
      equipment.tool = this.generateEquipmentItem("tool", "meditation-kit");
    } else if (
      classData.equipmentPreferences.tool &&
      classData.equipmentPreferences.tool.length > 0
    ) {
      // Other classes get random tool if they have preferences
      const toolType =
        classData.equipmentPreferences.tool[
          Math.floor(Math.random() * classData.equipmentPreferences.tool.length)
        ];
      equipment.tool = this.generateEquipmentItem("tool", toolType);
    }

    return equipment;
  },

  // Generate random equipment when no class preferences
  generateRandomEquipment: function () {
    const equipment = {
      clothes: null,
      armor: null,
      weapon: null,
      secondHand: null,
      back: null,
      tool: null,
    };

    // ALWAYS generate clothes first
    equipment.clothes = this.generateEquipmentItem(
      "clothes",
      "commoner-clothes"
    );

    // ALWAYS generate weapon - this is critical for all characters
    const weaponType = "sword"; // Default fallback
    equipment.weapon = this.generateEquipmentItem("swords", weaponType);

    // If it's a 2-handed weapon, set secondHand to indicate occupation
    if (this.is2HandedWeapon(weaponType)) {
      equipment.secondHand = "(2h-grip)";
    }

    // Randomly decide which additional equipment slots to fill (0-2 more items)
    const slots = ["armor", "secondHand", "back", "tool"];
    const numSlots = Math.floor(Math.random() * 3); // 0-2 additional items
    const selectedSlots = slots
      .sort(() => 0.5 - Math.random())
      .slice(0, numSlots);

    selectedSlots.forEach((slot) => {
      let equipmentType = null;

      // Map slots to equipment types
      switch (slot) {
        case "armor":
          equipmentType = "armor";
          break;
        case "secondHand":
          // Skip if weapon is 2-handed
          if (equipment.secondHand === "(2h-grip)") {
            return;
          }
          // Randomly choose between shields
          equipmentType = "shields";
          break;
        case "back":
          // If weapon is 2-handed, only allow containers
          if (equipment.secondHand === "(2h-grip)") {
            equipmentType = "container";
          } else {
            // Randomly choose between 2h weapons, ranged, or container
            const backTypes = [
              "great_swords",
              "great_axes",
              "polearms",
              "great_hammers",
              "bows",
              "crossbows",
              "container",
            ];
            equipmentType =
              backTypes[Math.floor(Math.random() * backTypes.length)];
          }
          break;
        case "tool":
          equipmentType = "tool";
          break;
      }

      if (
        equipmentType &&
        equipmentTypes[equipmentType] &&
        equipmentTypes[equipmentType].items.length > 0
      ) {
        const itemType =
          equipmentTypes[equipmentType].items[
            Math.floor(
              Math.random() * equipmentTypes[equipmentType].items.length
            )
          ];
        equipment[slot] = this.generateEquipmentItem(equipmentType, itemType);
      }
    });

    return equipment;
  },

  // Generate individual equipment item with random properties
  generateEquipmentItem: function (equipmentType, itemType) {
    const typeData = equipmentTypes[equipmentType];
    if (!typeData) return null;

    // Random status (weighted toward better condition for starting equipment)
    const statusType = equipmentStatus[typeData.statusType];
    const statusWeights = [0.05, 0.1, 0.2, 0.3, 0.25, 0.08, 0.02]; // Weighted toward "Good" condition
    const randomStatus = this.weightedRandom(
      statusType.statuses,
      statusWeights
    );

    // Random material based on equipment type restrictions
    const materials = Object.keys(equipmentMaterials);
    const allowedMaterials = materials.filter((m) =>
      equipmentMaterials[m].allowedTypes?.includes(equipmentType)
    );

    if (allowedMaterials.length === 0) {
      console.warn(`No allowed materials for equipment type: ${equipmentType}`);
      return null;
    }

    const materialWeights = allowedMaterials.map(() => 1); // Equal weight for all allowed materials
    const randomMaterial = this.weightedRandom(
      allowedMaterials,
      materialWeights
    );

    // Random rarity (weighted toward common rarity, capped at common, floored at scrap)
    const rarities = Object.keys(equipmentRarity);
    // Only allow scrap, improvised, poor, and common rarities for starting equipment
    const allowedRarities = ["scrap", "improvised", "poor", "common"];
    const rarityWeights = [0.1, 0.2, 0.3, 0.4]; // Weighted toward common
    const randomRarity = this.weightedRandom(allowedRarities, rarityWeights);

    // Format: "emoji [item type] material rarity status"
    // Determine emoji based on equipment type
    let emoji;
    if (weaponEmoji[equipmentType]) {
      emoji = weaponEmoji[equipmentType];
    } else if (equipmentType === "container") {
      emoji = equipmentEmoji.back;
    } else {
      emoji = equipmentEmoji[equipmentType] || "⚙️";
    }

    return `${emoji} [${itemType}] ${randomMaterial} ${randomRarity} ${randomStatus.name.toLowerCase()}`;
  },

  // Weighted random selection
  weightedRandom: function (items, weights) {
    const random = Math.random();
    let cumulative = 0;

    for (let i = 0; i < items.length; i++) {
      cumulative += weights[i] || 0;
      if (random <= cumulative) {
        return items[i];
      }
    }

    return items[items.length - 1]; // Fallback
  },
};
