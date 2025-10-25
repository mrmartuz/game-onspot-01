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
  const availableHeight = window.innerHeight - 98; // 49px status bar + 49px bottom bar

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

function updateBarColors() {
  const currentHour = getCurrentGameDate().getHours();
  let backgroundColor;
  let borderColor;
  if (currentHour >= 22 || currentHour < 6) {
    backgroundColor = "#050A0F"; // Night (10 PM - 6 AM)
    borderColor = "#0F1B2B";
  } else if (currentHour >= 6 && currentHour < 8) {
    backgroundColor = "#3E2B14"; // Sunrise (6 AM - 8 AM)
    borderColor = "#D8B080";
  } else if (currentHour >= 8 && currentHour < 12) {
    backgroundColor = "#193D4D"; // Morning sun (8 AM - 12 PM)
    borderColor = "#8EC0D8";
  } else if (currentHour >= 12 && currentHour < 14) {
    backgroundColor = "#3885A8"; // Midday sun (12 PM - 2 PM)
    borderColor = "#A5CEE1";
  } else if (currentHour >= 14 && currentHour < 18) {
    backgroundColor = "#193D4D"; // Afternoon sun (2 PM - 6 PM)
    borderColor = "#8EC0D8";
  } else if (currentHour >= 18 && currentHour < 20) {
    backgroundColor = "#583622"; // Sunset (6 PM - 8 PM)
    borderColor = "#C89070";
  } else {
    backgroundColor = "#23282F"; // Evening twilight (8 PM - 10 PM)
    borderColor = "#6A798E";
  }

  // Apply colors to both bars
  document.getElementById("status-bar").style.backgroundColor = backgroundColor;
  document.getElementById("bottom-bar").style.backgroundColor = backgroundColor;
  document.getElementById("status-bar").style.borderColor = borderColor;
  document.getElementById("bottom-bar").style.borderColor = borderColor;
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
    gameState.playerCharacter?.health?.current)}`;
  document.getElementById(
    "status-bar-group"
  ).innerText = `👥: ${gameState.group.length}]`;

  // Update date and discoveries
  const currentHour = getCurrentGameDate().getHours();
  let timeEmoji;

  if (currentHour >= 22 || currentHour < 6) {
    timeEmoji = "🌙"; // Night (10 PM - 6 AM)
  } else if (currentHour >= 6 && currentHour < 8) {
    timeEmoji = "🌅"; // Sunrise (6 AM - 8 AM)
  } else if (currentHour >= 8 && currentHour < 12) {
    timeEmoji = "☀️"; // Morning sun (8 AM - 12 PM)
  } else if (currentHour >= 12 && currentHour < 14) {
    timeEmoji = "🌞"; // Midday sun (12 PM - 2 PM)
  } else if (currentHour >= 14 && currentHour < 18) {
    timeEmoji = "☀️"; // Afternoon sun (2 PM - 6 PM)
  } else if (currentHour >= 18 && currentHour < 20) {
    timeEmoji = "🌇"; // Sunset (6 PM - 8 PM)
  } else {
    timeEmoji = "🌙"; // Evening twilight (8 PM - 10 PM)
  }

  document.getElementById(
    "date-button"
  ).innerText = `📜[${getCurrentGameDate().toLocaleDateString()}]${timeEmoji}[${currentHour}]`;
  document.getElementById(
    "discoveries-button"
  ).innerText = `🌟[🔍: ${Math.floor(
    gameState.discoverPoints
  )} ⚔️: ${Math.floor(gameState.killPoints)}]`;

  // Update bar colors based on time of day
  updateBarColors();
}
