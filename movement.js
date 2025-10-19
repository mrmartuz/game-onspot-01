import { gameState } from "./gamestate/game_variables.js";
import { getGroupBonus, getMaxStorage } from "./utils.js";
import { getTile } from "./rendering/tile.js";
import {
  addVisitedTile,
  getVisitedTile,
  addCachedTile,
  generateTile,
} from "./gamestate/gameStateSetGet.js";
import {
  getNavigationBonus,
  calculateSkillBonus,
} from "./interactions/skills.js";
import {
  calculateEquipmentWeight,
  calculateTotalEquipmentBonuses,
} from "./interactions/equipment.js";

export function move(dx, dy) {
  if (gameState.cooldown) return;
  gameState.cooldown = true;
  gameState.moving = true;
  gameState.moveStartTime = performance.now();
  let tx = gameState.px + dx;
  let ty = gameState.py + dy;
  let tile = getTile(tx, ty);

  // Calculate skill-based navigation bonuses (replacing role-based system)
  let navigationBonus = calculateGroupNavigationBonus(tile);

  // Calculate terrain-specific skill bonuses to reduce hard terrain malus
  let terrainBonus = calculateTerrainSkillBonuses(tile);

  // Calculate movement speed based on group size, slowest member, and equipment
  let groupSpeedModifier = calculateGroupSpeedModifier();

  // Apply navigation bonus to movement speed (navigation bonus makes movement faster)
  let baseDuration = 400 + tile.inclination * 80 + tile.flora * 40;
  let navigationSpeedMultiplier = Math.max(0.3, 1 - navigationBonus); // Minimum 30% of original speed
  let adjustedDuration = baseDuration * navigationSpeedMultiplier;

  // Apply terrain skill bonuses to further reduce terrain malus
  let terrainMalusReduction = Math.min(0.5, terrainBonus); // Maximum 50% terrain malus reduction
  let terrainMultiplier = 1 - terrainMalusReduction;
  adjustedDuration *= terrainMultiplier;

  // Apply group speed modifier (group size, slowest member, equipment)
  adjustedDuration *= groupSpeedModifier;

  let loadFactor = (gameState.food + gameState.water) / getMaxStorage();
  gameState.moveDuration = adjustedDuration * (1 + loadFactor * 0.5);
  gameState.moveDx = dx;
  gameState.moveDy = dy;
}

export function revealAround() {
  // Apply view bonus for increased view distance
  let viewBonus = getGroupBonus("view");
  let currentViewDist = gameState.viewDist + Math.floor(viewBonus);

  for (let dx = -currentViewDist; dx <= currentViewDist; dx++) {
    for (let dy = -currentViewDist; dy <= currentViewDist; dy++) {
      if (Math.abs(dx) + Math.abs(dy) <= currentViewDist) {
        const x = gameState.px + dx;
        const y = gameState.py + dy;
        const key = `${x},${y}`;
        if (!getVisitedTile(key)) {
          addVisitedTile(key);
          const tile = generateTile(x, y);
          addCachedTile(key, tile);
        }
      }
    }
  }
}

// Helper function to calculate group navigation bonus (replacing role-based system)
function calculateGroupNavigationBonus(tile) {
  const allCharacters = [];

  // Include player character if it exists
  if (gameState.playerCharacter) {
    allCharacters.push(gameState.playerCharacter);
  }

  // Include all group members (NPCs)
  allCharacters.push(...gameState.group);

  if (allCharacters.length === 0) {
    return 0;
  }

  // Calculate navigation bonus from all group members
  let totalNavigationBonus = 0;

  allCharacters.forEach((member) => {
    if (member.skills) {
      const memberNavigationBonus = getNavigationBonus(member.skills);
      totalNavigationBonus += memberNavigationBonus;
    }
  });

  // Apply group synergy bonus (multiple skilled navigators work better together)
  const skilledNavigators = allCharacters.filter(
    (member) =>
      member.skills &&
      (member.skills.navigation > 10 || member.skills.cartography > 10)
  ).length;

  if (skilledNavigators >= 2) {
    totalNavigationBonus *= 1.2; // 20% bonus for multiple skilled navigators
  }

  return totalNavigationBonus;
}

// Helper function to calculate terrain-specific skill bonuses
function calculateTerrainSkillBonuses(tile) {
  const allCharacters = [];

  // Include player character if it exists
  if (gameState.playerCharacter) {
    allCharacters.push(gameState.playerCharacter);
  }

  // Include all group members (NPCs)
  allCharacters.push(...gameState.group);

  if (allCharacters.length === 0) {
    return 0;
  }

  let terrainBonus = 0;

  allCharacters.forEach((member) => {
    if (member.skills) {
      // Navigation skill helps on all terrain
      if (member.skills.navigation && member.skills.navigation > 0) {
        terrainBonus += member.skills.navigation * 0.01; // 1% per skill level
      }

      // Cartography helps with complex terrain
      if (
        member.skills.cartography &&
        member.skills.cartography > 0 &&
        tile.inclination > 3
      ) {
        terrainBonus += member.skills.cartography * 0.015; // 1.5% per skill level on steep terrain
      }

      // Survival helps in harsh environments
      if (
        member.skills.survival &&
        member.skills.survival > 0 &&
        tile.flora > 5
      ) {
        terrainBonus += member.skills.survival * 0.01; // 1% per skill level in dense flora
      }

      // Climbing helps with elevation changes
      if (
        member.skills.climbing &&
        member.skills.climbing > 0 &&
        tile.inclination > 2
      ) {
        terrainBonus += member.skills.climbing * 0.02; // 2% per skill level on slopes
      }

      // Swimming helps in water-heavy terrain
      if (
        member.skills.swimming &&
        member.skills.swimming > 0 &&
        tile.water > 3
      ) {
        terrainBonus += member.skills.swimming * 0.015; // 1.5% per skill level in water
      }

      // Scouting helps avoid difficult terrain
      if (
        member.skills.scouting &&
        member.skills.scouting > 0 &&
        (tile.inclination > 2 || tile.flora > 3)
      ) {
        terrainBonus += member.skills.scouting * 0.01; // 1% per skill level for terrain awareness
      }
    }
  });

  return terrainBonus;
}

// Helper function to calculate group speed modifier based on group size, slowest member, and equipment
function calculateGroupSpeedModifier() {
  const allCharacters = [];

  // Include player character if it exists
  if (gameState.playerCharacter) {
    allCharacters.push(gameState.playerCharacter);
  }

  // Include all group members (NPCs)
  allCharacters.push(...gameState.group);

  if (allCharacters.length === 0) {
    return 1.0;
  }

  // Calculate individual character speed modifiers
  let characterSpeedModifiers = allCharacters.map((member) => {
    let speedModifier = 1.0;

    // Base speed from DEX stat
    const dexStat = member.stats?.DEX || 8;
    const dexSpeedBonus = (dexStat - 8) * 0.02; // 2% per point above/below 8
    speedModifier += dexSpeedBonus;

    // Equipment weight penalty
    if (member.equipment) {
      let totalWeight = 0;
      Object.values(member.equipment).forEach((equipmentString) => {
        if (equipmentString) {
          totalWeight += calculateEquipmentWeight(equipmentString);
        }
      });

      // Weight penalty: 1% per 5 weight units
      const weightPenalty = Math.min(0.3, totalWeight * 0.002); // Maximum 30% penalty
      speedModifier -= weightPenalty;
    }

    // Equipment skill bonuses for movement
    if (member.equipment) {
      const navigationBonus =
        calculateTotalEquipmentBonuses(member.equipment, "navigation") * 0.01;
      const survivalBonus =
        calculateTotalEquipmentBonuses(member.equipment, "survival") * 0.005;
      speedModifier += navigationBonus + survivalBonus;
    }

    return Math.max(0.3, speedModifier); // Minimum 30% speed
  });

  // Group coordination penalty based on size
  const groupSize = allCharacters.length;
  let coordinationPenalty = 0;
  if (groupSize > 4) {
    coordinationPenalty = (groupSize - 4) * 0.05; // 5% penalty per member over 4
  }

  // Use slowest member's speed (group moves at pace of slowest member)
  const slowestSpeed = Math.min(...characterSpeedModifiers);

  // Apply coordination penalty
  const finalSpeedModifier = slowestSpeed * (1 - coordinationPenalty);

  return Math.max(0.2, finalSpeedModifier); // Minimum 20% speed
}

// Skill-based pathfinding system
export function findOptimalPath(
  startX,
  startY,
  targetX,
  targetY,
  maxDistance = 10
) {
  const allCharacters = [];

  // Include player character if it exists
  if (gameState.playerCharacter) {
    allCharacters.push(gameState.playerCharacter);
  }

  // Include all group members (NPCs)
  allCharacters.push(...gameState.group);

  if (allCharacters.length === 0) {
    return null; // No pathfinding without characters
  }

  // Calculate group pathfinding skills
  const pathfindingSkills = calculateGroupPathfindingSkills(allCharacters);

  // Use A* pathfinding with skill-based cost calculation
  const path = findPathWithSkills(
    startX,
    startY,
    targetX,
    targetY,
    pathfindingSkills,
    maxDistance
  );

  return path;
}

// Calculate group pathfinding skills for optimal route selection
function calculateGroupPathfindingSkills(characters) {
  let totalNavigation = 0;
  let totalCartography = 0;
  let totalScouting = 0;
  let totalSurvival = 0;
  let maxClimbing = 0;
  let maxSwimming = 0;

  characters.forEach((member) => {
    if (member.skills) {
      totalNavigation += member.skills.navigation || 0;
      totalCartography += member.skills.cartography || 0;
      totalScouting += member.skills.scouting || 0;
      totalSurvival += member.skills.survival || 0;
      maxClimbing = Math.max(maxClimbing, member.skills.climbing || 0);
      maxSwimming = Math.max(maxSwimming, member.skills.swimming || 0);
    }
  });

  return {
    navigation: totalNavigation,
    cartography: totalCartography,
    scouting: totalScouting,
    survival: totalSurvival,
    climbing: maxClimbing,
    swimming: maxSwimming,
  };
}

// A* pathfinding with skill-based terrain cost calculation
function findPathWithSkills(
  startX,
  startY,
  targetX,
  targetY,
  skills,
  maxDistance
) {
  const openSet = [];
  const closedSet = new Set();
  const cameFrom = new Map();
  const gScore = new Map();
  const fScore = new Map();

  const startKey = `${startX},${startY}`;
  const targetKey = `${targetX},${targetY}`;

  // Initialize starting node
  openSet.push({ x: startX, y: startY });
  gScore.set(startKey, 0);
  fScore.set(startKey, heuristic(startX, startY, targetX, targetY));

  while (openSet.length > 0) {
    // Find node with lowest fScore
    let currentIndex = 0;
    for (let i = 1; i < openSet.length; i++) {
      const currentKey = `${openSet[currentIndex].x},${openSet[currentIndex].y}`;
      const testKey = `${openSet[i].x},${openSet[i].y}`;
      if (fScore.get(testKey) < fScore.get(currentKey)) {
        currentIndex = i;
      }
    }

    const current = openSet.splice(currentIndex, 1)[0];
    const currentKey = `${current.x},${current.y}`;
    closedSet.add(currentKey);

    // Check if we reached the target
    if (current.x === targetX && current.y === targetY) {
      return reconstructPath(cameFrom, currentKey);
    }

    // Check if we've exceeded max distance
    if (
      Math.abs(current.x - startX) + Math.abs(current.y - startY) >
      maxDistance
    ) {
      continue;
    }

    // Explore neighbors
    const neighbors = [
      { x: current.x + 1, y: current.y },
      { x: current.x - 1, y: current.y },
      { x: current.x, y: current.y + 1 },
      { x: current.x, y: current.y - 1 },
      // Diagonal movement (more expensive)
      { x: current.x + 1, y: current.y + 1 },
      { x: current.x + 1, y: current.y - 1 },
      { x: current.x - 1, y: current.y + 1 },
      { x: current.x - 1, y: current.y - 1 },
    ];

    neighbors.forEach((neighbor) => {
      const neighborKey = `${neighbor.x},${neighbor.y}`;

      if (closedSet.has(neighborKey)) {
        return;
      }

      // Calculate movement cost based on terrain and skills
      const movementCost = calculateTerrainMovementCost(
        neighbor.x,
        neighbor.y,
        skills
      );

      if (movementCost === Infinity) {
        return; // Impassable terrain
      }

      const tentativeGScore = gScore.get(currentKey) + movementCost;

      if (
        !openSet.some((node) => node.x === neighbor.x && node.y === neighbor.y)
      ) {
        openSet.push(neighbor);
      } else if (tentativeGScore >= (gScore.get(neighborKey) || Infinity)) {
        return;
      }

      cameFrom.set(neighborKey, currentKey);
      gScore.set(neighborKey, tentativeGScore);
      fScore.set(
        neighborKey,
        tentativeGScore + heuristic(neighbor.x, neighbor.y, targetX, targetY)
      );
    });
  }

  return null; // No path found
}

// Calculate movement cost for a tile based on terrain and group skills
function calculateTerrainMovementCost(x, y, skills) {
  const tile = getTile(x, y);

  // Base cost
  let cost = 1;

  // Terrain difficulty modifiers
  cost += tile.inclination * 0.3; // Steep terrain is harder
  cost += tile.flora * 0.2; // Dense vegetation slows movement
  cost += tile.water * 0.4; // Water is much harder to traverse

  // Skill-based cost reductions
  if (skills.navigation > 0) {
    cost *= Math.max(0.5, 1 - skills.navigation * 0.01); // Navigation reduces all terrain costs
  }

  if (tile.inclination > 2 && skills.climbing > 0) {
    cost *= Math.max(0.3, 1 - skills.climbing * 0.02); // Climbing helps with elevation
  }

  if (tile.flora > 3 && skills.survival > 0) {
    cost *= Math.max(0.4, 1 - skills.survival * 0.015); // Survival helps in dense vegetation
  }

  if (tile.water > 2 && skills.swimming > 0) {
    cost *= Math.max(0.2, 1 - skills.swimming * 0.03); // Swimming helps in water
  }

  if (tile.inclination > 3 && skills.cartography > 0) {
    cost *= Math.max(0.6, 1 - skills.cartography * 0.01); // Cartography helps with complex terrain
  }

  // Check for impassable terrain
  if (tile.inclination > 8 && skills.climbing < 20) {
    return Infinity; // Too steep without climbing skill
  }

  if (tile.water > 6 && skills.swimming < 15) {
    return Infinity; // Too much water without swimming skill
  }

  return Math.max(0.1, cost); // Minimum cost of 0.1
}

// Heuristic function for A* (Manhattan distance)
function heuristic(x1, y1, x2, y2) {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

// Reconstruct path from cameFrom map
function reconstructPath(cameFrom, currentKey) {
  const path = [];
  let current = currentKey;

  while (current) {
    const [x, y] = current.split(",").map(Number);
    path.unshift({ x, y });
    current = cameFrom.get(current);
  }

  return path;
}

// Get suggested movement direction based on optimal pathfinding
export function getSuggestedMovement(targetX, targetY) {
  const path = findOptimalPath(gameState.px, gameState.py, targetX, targetY);

  if (!path || path.length < 2) {
    return null; // No path found or already at target
  }

  // Return the next step in the path
  const nextStep = path[1];
  return {
    dx: nextStep.x - gameState.px,
    dy: nextStep.y - gameState.py,
  };
}
