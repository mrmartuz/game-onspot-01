import { gameState } from "./game_variables.js";
import { getCurrentGameDate } from "./time_system.js";
import { getMaxStorage, hash } from "./utils.js";
import { drawPlayer } from "./rendering/playerRender.js";
import { drawRegionalMap } from "./rendering/regionalMapRender.js";

export const canvas = document.getElementById("game-canvas");
export const ctx = canvas.getContext("2d");

export function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - 80;
  gameState.viewWidth = Math.floor(canvas.width / gameState.tileSize);
  if (gameState.viewWidth % 2 === 0) gameState.viewWidth--;
  gameState.viewHeight = Math.floor(canvas.height / gameState.tileSize);
  if (gameState.viewHeight % 2 === 0) gameState.viewHeight--;
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
    gameState.health
  )}`;
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
