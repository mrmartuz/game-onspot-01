import {
  equipmentTypes,
  equipmentMaterials,
  equipmentRarity,
  equipmentStatus,
} from "../equipment.js";

// Equipment assignment system
export const equipmentAssignment = {
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

    // Generate weapon (1h)
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
      equipment.weapon = this.generateEquipmentItem("weapon1h", weaponType);
    }

    // Generate shield or second weapon
    if (
      classData.equipmentPreferences.shield &&
      classData.equipmentPreferences.shield.length > 0
    ) {
      const shieldType =
        classData.equipmentPreferences.shield[
          Math.floor(
            Math.random() * classData.equipmentPreferences.shield.length
          )
        ];
      equipment.secondHand = this.generateEquipmentItem("shield", shieldType);
    }

    // Generate 2h weapon or container for back slot
    if (
      classData.equipmentPreferences.back &&
      classData.equipmentPreferences.back.length > 0
    ) {
      const backType =
        classData.equipmentPreferences.back[
          Math.floor(Math.random() * classData.equipmentPreferences.back.length)
        ];
      // Determine if it's a weapon or container
      const weapon2hItems = equipmentTypes.weapon2h.items;
      const rangedItems = equipmentTypes.ranged.items;
      const containerItems = equipmentTypes.container.items;

      if (weapon2hItems.includes(backType)) {
        equipment.back = this.generateEquipmentItem("weapon2h", backType);
      } else if (rangedItems.includes(backType)) {
        equipment.back = this.generateEquipmentItem("ranged", backType);
      } else if (containerItems.includes(backType)) {
        equipment.back = this.generateEquipmentItem("container", backType);
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

    // Randomly decide which additional equipment slots to fill (1-3 more items)
    const slots = ["armor", "weapon", "secondHand", "back", "tool"];
    const numSlots = 1 + Math.floor(Math.random() * 3);
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
        case "weapon":
          equipmentType = "weapon1h";
          break;
        case "secondHand":
          equipmentType = "shield";
          break;
        case "back":
          // Randomly choose between 2h weapon, ranged, or container
          const backTypes = ["weapon2h", "ranged", "container"];
          equipmentType =
            backTypes[Math.floor(Math.random() * backTypes.length)];
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

    // Random rarity (weighted toward common rarity)
    const rarities = Object.keys(equipmentRarity);
    const rarityWeights = [0.05, 0.1, 0.15, 0.5, 0.15, 0.03, 0.015, 0.005]; // Weighted toward common
    const randomRarity = this.weightedRandom(rarities, rarityWeights);

    // Format: "status material rarity [itemType]"
    return `${randomStatus.name.toLowerCase()} ${randomMaterial} ${randomRarity} [${itemType}]`;
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
