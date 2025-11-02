// Enhanced Combat Dialog System
// Orchestrator for combat phases - delegates to specialized modules

import { gameState } from "../../gamestate/game_variables.js";
import { generateMonsters } from "./creature-generation.js";
import { generateAllies } from "./ai.js";
import {
  getCombatState,
  resetCombatState,
  setCombatStateProperty,
} from "./combat-state.js";
import { initializeCombatPositions } from "./combat-grid.js";
import { handleDetectionPhase } from "./combat-phases.js";
import { getAllMonsterTypes } from "./databases/monster-tiers.js";

export async function handleEnhancedCombatDialog(ex, ey, isOnTile = false) {
  `Starting enhanced combat dialog at (${ex}, ${ey})`;

  // Reset combat state
  const combatState = resetCombatState();

  // Generate combatants
  const allies = await generateAllies();
  setCombatStateProperty("allies", allies);

  // Generate monsters with random selection
  const baseMonsterCount = Math.floor(Math.random() * 3) + 1; // 1-3 monsters
  const groupMemberCount = gameState.group ? gameState.group.length : 1;
  const bonusMonsterCount = Math.max(1, Math.floor(groupMemberCount / 2));
  const monsterCount = baseMonsterCount + bonusMonsterCount;

  console.log("monsterCount", monsterCount);
  // Get all available monster types from database
  const monsterTypes = getAllMonsterTypes();
  const selectedTypes = monsterTypes
    .sort(() => 0.5 - Math.random())
    .slice(0, monsterCount);

  const monsters = await generateMonsters(
    monsterCount,
    selectedTypes[0],
    ex,
    ey
  );
  setCombatStateProperty("monsters", monsters);

  const state = getCombatState();
  `Generated ${state.allies.length} allies and ${state.monsters.length} monsters`;

  // Initialize positions for all combatants
  initializeCombatPositions();

  // Start with detection phase
  return await handleDetectionPhase();
}
