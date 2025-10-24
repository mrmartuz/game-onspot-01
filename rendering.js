import { gameState } from "./gamestate/game_variables.js";
import { getCurrentGameDate } from "./time_system.js";
import { getMaxStorage, hash } from "./utils.js";
import { drawPlayer } from "./rendering/playerRender.js";
import { drawRegionalMap } from "./rendering/regionalMapRender.js";
import { drawGlobalMap } from "./rendering/globalMapRender.js";

export const canvas = document.getElementById("game-canvas");
export const ctx = canvas.getContext("2d");

export function resize() {
  // Get available space (viewport minus status bars)
  const availableWidth = window.innerWidth;
  const availableHeight = window.innerHeight - 80; // 50px status bar + 30px bottom bar

  // Calculate aspect ratio
  const aspectRatio = availableWidth / availableHeight;

  // Determine if we're in portrait or landscape mode
  const isPortrait = aspectRatio < 1;

  let canvasWidth, canvasHeight;

  if (isPortrait) {
    // In portrait mode, limit width to maintain square-ish tiles
    canvasWidth = Math.min(availableWidth, availableHeight * 0.9); // Max 90% of height
    canvasHeight = availableHeight;
  } else {
    // In landscape mode, limit height to maintain square-ish tiles
    canvasWidth = availableWidth;
    canvasHeight = Math.min(availableHeight, availableWidth * 0.9); // Max 90% of width
  }

  // Set canvas dimensions
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  // Calculate optimal tile size based on canvas dimensions
  // Aim for roughly 8-10 tiles visible in the smaller dimension for much better visibility
  const minDimension = Math.min(canvasWidth, canvasHeight);
  const optimalTileSize = Math.floor(minDimension / 9); // 9 tiles in smaller dimension
  gameState.tileSize = Math.max(40, Math.min(80, optimalTileSize)); // Clamp between 40-80px

  // Update sprite sizes proportionally
  gameState.spriteSizeLocation = Math.floor(gameState.tileSize * 0.8);
  gameState.spriteSizeEntity = Math.floor(gameState.tileSize * 0.48);
  gameState.spriteSizeFlora = Math.floor(gameState.tileSize * 0.4);

  // Calculate view dimensions based on actual canvas size
  gameState.viewWidth = Math.floor(canvas.width / gameState.tileSize);
  if (gameState.viewWidth % 2 === 0) gameState.viewWidth--;
  gameState.viewHeight = Math.floor(canvas.height / gameState.tileSize);
  if (gameState.viewHeight % 2 === 0) gameState.viewHeight--;

  // Center the canvas content
  gameState.offsetX =
    (canvas.width - gameState.viewWidth * gameState.tileSize) / 2;
  gameState.offsetY =
    (canvas.height - gameState.viewHeight * gameState.tileSize) / 2;
}

export function draw(offsetDeltaX, offsetDeltaY) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  if (gameState.mapType === "regional") {
    drawRegionalMap(ctx, offsetDeltaX, offsetDeltaY);
  } else if (gameState.mapType === "global") {
    drawGlobalMap(ctx);
  }
  drawPlayer(ctx);
}

export function updateStatus() {
  // Update individual stat elements
  document.getElementById("gold-button").innerText = `[🪙: ${Math.floor(
    gameState.gold
  )}]`;

  // Update inventory elements
  document.getElementById("status-bar-food").innerText = `[🍞: ${Math.floor(
    gameState.food
  )}`;
  document.getElementById("status-bar-water").innerText = `💧: ${Math.floor(
    gameState.water
  )}`;
  document.getElementById("status-bar-cart").innerText = `🛒: ${Math.floor(
    getMaxStorage()
  )}]`;

  // Update group elements
  document.getElementById("status-bar-health").innerText = `[❤️‍🩹: ${Math.floor(
    gameState.playerCharacter?.health?.current || gameState.health
  )}/${Math.floor(gameState.playerCharacter?.health?.max || gameState.health)}`;
  document.getElementById(
    "status-bar-group"
  ).innerText = `👥: ${gameState.group.length}]`;

  // Update date and discoveries
  document.getElementById(
    "date-button"
  ).innerText = `📜[${getCurrentGameDate().toLocaleDateString()}]⌚[${getCurrentGameDate().getHours()}]`;
  document.getElementById(
    "discoveries-button"
  ).innerText = `🌟[🔍: ${Math.floor(
    gameState.discoverPoints
  )} ⚔️: ${Math.floor(gameState.killPoints)}]`;
}
