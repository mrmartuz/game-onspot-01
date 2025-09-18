import { gameState } from "./game_variables.js";
import { getTile } from "../rendering/tile.js";

export function addVisitedTile(key) {
  if (!gameState.visited.has(key)) {
    gameState.visited.add(key);
  }
}

export function isVisited(key) {
  return gameState.visited.has(key);
}

export function getAllVisited() {
  return Array.from(gameState.visited);
}

export function clearVisited() {
  gameState.visited.clear();
}

export function generateTile(x, y) {
  const key = `${x},${y}`;
  const tile = getTile(x, y);
  addCachedTile(key, tile);
  return tile;
}

export function addCachedTile(key, tile) {
  gameState.cachedTiles.set(key, tile);
}

export function getCachedTile(key) {
  return gameState.cachedTiles.get(key);
}

export function hasCachedTile(key) {
  return gameState.cachedTiles.has(key);
}

export function clearCachedTiles() {
  gameState.cachedTiles.clear();
}

export function getVisitedTile(key) {
  return gameState.visited.has(key);
}

export function getKilledTile(key) {
  return gameState.killed.has(key);
}
