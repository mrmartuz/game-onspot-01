// Base stat ranges and point allocation system
export const statGeneration = {
  // Base stat ranges (before point allocation)
  baseStats: {
    STR: 8, // Base strength
    DEX: 8, // Base dexterity
    CON: 8, // Base constitution
    INT: 8, // Base intelligence
    WIS: 8, // Base wisdom
    CHA: 8, // Base charisma
    LUCK: 8, // Base luck (not included in point allocation)
  },

  // Point allocation system (10 points with escalating costs + malus system)
  pointAllocation: {
    totalPoints: 10,
    escalatingCosts: true, // Each additional point in a stat costs more
    maxStatValue: 18, // Maximum stat value after allocation
    minStatValue: 5, // Minimum stat value (allows malus)
    malusSystem: true, // 3 malus points = 2 bonus points
  },

  // Cost calculation for escalating point allocation with malus system
  getPointCost: function (currentValue, desiredValue) {
    if (!this.escalatingCosts) {
      return desiredValue - currentValue;
    }

    let totalCost = 0;

    if (desiredValue > currentValue) {
      // Bonus points (above base)
      for (let i = currentValue; i < desiredValue; i++) {
        totalCost += i - this.baseStats.STR + 1;
      }
    } else if (desiredValue < currentValue) {
      // Malus points (below base) - 3 malus points = 2 bonus points
      const malusPoints = currentValue - desiredValue;
      const bonusPointsGained = Math.floor((malusPoints * 2) / 3);
      totalCost = -bonusPointsGained; // Negative cost = points gained
    }

    return totalCost;
  },

  // Calculate remaining points after allocation (including malus system)
  calculateRemainingPoints: function (allocatedStats) {
    let usedPoints = 0;
    let malusBonusPoints = 0;

    Object.keys(this.baseStats).forEach((stat) => {
      if (stat !== "LUCK") {
        // LUCK not included in point allocation
        const allocated = allocatedStats[stat] || this.baseStats[stat];
        const cost = this.getPointCost(this.baseStats[stat], allocated);

        if (cost < 0) {
          // Malus points gained
          malusBonusPoints += Math.abs(cost);
        } else {
          // Bonus points spent
          usedPoints += cost;
        }
      }
    });

    return this.pointAllocation.totalPoints + malusBonusPoints - usedPoints;
  },
};

// Procedural character generation
export const proceduralGeneration = {
  // Generate random gender with 70/30 male/female distribution
  generateRandomGender: function () {
    const random = Math.random();
    return random < 0.7 ? "male" : "female";
  },

  // Generate random stats within reasonable ranges
  generateRandomStats: function () {
    const stats = { ...statGeneration.baseStats };

    // Randomly distribute points across stats (excluding LUCK)
    const statsToAllocate = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];
    let remainingPoints = statGeneration.pointAllocation.totalPoints;

    // Randomly allocate points
    while (remainingPoints > 0) {
      const randomStat =
        statsToAllocate[Math.floor(Math.random() * statsToAllocate.length)];
      const currentValue = stats[randomStat];

      // Don't exceed max value
      if (currentValue < statGeneration.pointAllocation.maxStatValue) {
        const cost = statGeneration.getPointCost(
          currentValue,
          currentValue + 1
        );
        if (cost <= remainingPoints) {
          stats[randomStat]++;
          remainingPoints -= cost;
        } else {
          // If we can't afford the next point, try a different stat
          const affordableStats = statsToAllocate.filter((stat) => {
            const nextCost = statGeneration.getPointCost(
              stats[stat],
              stats[stat] + 1
            );
            return (
              nextCost <= remainingPoints &&
              stats[stat] < statGeneration.pointAllocation.maxStatValue
            );
          });

          if (affordableStats.length === 0) break;

          const affordableStat =
            affordableStats[Math.floor(Math.random() * affordableStats.length)];
          const affordableCost = statGeneration.getPointCost(
            stats[affordableStat],
            stats[affordableStat] + 1
          );
          stats[affordableStat]++;
          remainingPoints -= affordableCost;
        }
      } else {
        // Remove this stat from consideration if it's at max
        const index = statsToAllocate.indexOf(randomStat);
        if (index > -1) {
          statsToAllocate.splice(index, 1);
        }
        if (statsToAllocate.length === 0) break;
      }
    }

    // Randomly generate LUCK (8-12 range)
    stats.LUCK = 8 + Math.floor(Math.random() * 5);

    return stats;
  },

  // Generate random class based on rarity with very low probability for uncommon/rare
  generateRandomClass: async function () {
    // Import classDatabase dynamically to avoid circular dependency
    const { classDatabase } = await import("../combat/classes.js");
    const classes = Object.keys(classDatabase);
    const rarityWeights = {
      common: 0.938, // 93.8% chance for common classes
      uncommon: 0.05, // 5% chance for uncommon classes (very low)
      rare: 0.01, // 1% chance for rare classes (very rare)
      legendary: 0.005, // 0.2% chance for legendary classes (extremely rare)
    };

    const random = Math.random();
    let targetRarity = "common";
    let cumulative = 0;

    for (const [rarity, weight] of Object.entries(rarityWeights)) {
      cumulative += weight;
      if (random <= cumulative) {
        targetRarity = rarity;
        break;
      }
    }

    // Filter classes by target rarity
    const classesOfRarity = classes.filter(
      (className) => classDatabase[className].rarity === targetRarity
    );

    if (classesOfRarity.length === 0) {
      // Fallback to common classes if none found
      return classes.filter(
        (className) => classDatabase[className].rarity === "common"
      )[
        Math.floor(
          Math.random() *
            classes.filter(
              (className) => classDatabase[className].rarity === "common"
            ).length
        )
      ];
    }

    return classesOfRarity[Math.floor(Math.random() * classesOfRarity.length)];
  },
};
