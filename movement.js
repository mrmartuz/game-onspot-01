import { gameState } from "./gamestate/game_variables.js";
import { getGroupBonus, getMaxStorage } from "./utils.js";
import { getTile } from "./rendering/tile.js";
import {
  addVisitedTile,
  getVisitedTile,
  addCachedTile,
  generateTile,
} from "./gamestate/gameStateSetGet.js";
import { getNavigationBonus } from "./interactions/skills.js";

export function move(dx, dy) {
  if (gameState.cooldown) return;
  gameState.cooldown = true;
  gameState.moving = true;
  gameState.moveStartTime = performance.now();
  let tx = gameState.px + dx;
  let ty = gameState.py + dy;
  let tile = getTile(tx, ty);
  let navigationBonus = getGroupBonus("navigation");

  // Apply skill-based navigation bonuses from all group members
  gameState.group.forEach((member) => {
    if (member.skills) {
      const memberNavigationBonus = getNavigationBonus(member.skills);
      navigationBonus += memberNavigationBonus;
    }
  });

  // Apply terrain-specific bonuses based on character skills
  gameState.group.forEach((member) => {
    if (member.skills) {
      // Navigation skill helps on all terrain
      if (member.skills.navigation && member.skills.navigation > 0) {
        navigationBonus += member.skills.navigation * 0.01; // 1% per skill level
      }

      // Cartography helps with complex terrain
      if (
        member.skills.cartography &&
        member.skills.cartography > 0 &&
        tile.inclination > 3
      ) {
        navigationBonus += member.skills.cartography * 0.015; // 1.5% per skill level on steep terrain
      }

      // Survival helps in harsh environments
      if (
        member.skills.survival &&
        member.skills.survival > 0 &&
        tile.flora > 5
      ) {
        navigationBonus += member.skills.survival * 0.01; // 1% per skill level in dense flora
      }

      // Climbing helps with elevation changes
      if (
        member.skills.climbing &&
        member.skills.climbing > 0 &&
        tile.inclination > 2
      ) {
        navigationBonus += member.skills.climbing * 0.02; // 2% per skill level on slopes
      }
    }
  });

  // Apply navigation bonus to movement speed (navigation bonus makes movement faster)
  let baseDuration = 400 + tile.inclination * 80 + tile.flora * 40;
  let navigationSpeedMultiplier = Math.max(0.3, 1 - navigationBonus); // Minimum 30% of original speed
  let adjustedDuration = baseDuration * navigationSpeedMultiplier;

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
