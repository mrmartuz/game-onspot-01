// Character system exports - single entry point for character generation
export {
  raceDatabase,
  getPlayerAvailableRaces,
  getPlayerAvailableRacesByRarity,
  isCreatureRace,
} from "./races.js";
export { nameDatabase } from "./names.js";
export { statGeneration, proceduralGeneration } from "./stats.js";
export { equipmentAssignment } from "./equipment-assignment.js";
export {
  characterGeneration as default,
  characterGeneration,
} from "./generation.js";

