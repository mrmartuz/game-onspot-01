import { gameState } from "./game_variables.js";
import { getCurrentGameDate } from "./time_system.js";
import {
  getTile,
  getEmojiForFlora,
  getEmojiForLocation,
  getEmojiForEntity,
} from "./rendering/tile.js";
import { getMaxStorage, hash } from "./utils.js";

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

  for (let vx = 0; vx < gameState.viewWidth; vx++) {
    for (let vy = 0; vy < gameState.viewHeight; vy++) {
      let tx = gameState.px - Math.floor(gameState.viewWidth / 2) + vx;
      let ty = gameState.py - Math.floor(gameState.viewHeight / 2) + vy;
      let tile = getTile(tx, ty);
      let drawX = gameState.offsetX + offsetDeltaX + vx * gameState.tileSize;
      let drawY = gameState.offsetY + offsetDeltaY + vy * gameState.tileSize;
      let key = `${tx},${ty}`;
      if (!gameState.visited.has(key)) {
        ctx.fillStyle = "black";
        ctx.fillRect(drawX, drawY, gameState.tileSize, gameState.tileSize);
        continue;
      }

      ctx.fillStyle = tile.color || "red";

      ctx.fillRect(drawX, drawY, gameState.tileSize, gameState.tileSize);
      // Render grass tufts spread across the full tile
      if (tile.flora > 0) {
        const tuftCount = tile.flora * 3; // Up to 30 tufts at flora=10; adjust for density
        if (tile.terrain === "dirt") {
          for (let i = 0; i < tuftCount; i++) {
            // Vary green shade for depth (darker to lighter green)
            const greenShade = Math.floor(100 + hash(tx, ty, 500 + i) * 100); // 100-200 for rgb(0, greenShade, 0)
            ctx.fillStyle = `rgb(0, ${greenShade}, 0)`;
            const rx = Math.floor(hash(tx, ty, 100 + i) * gameState.tileSize);
            const baseY =
              drawY + Math.floor(hash(tx, ty, 200 + i) * gameState.tileSize); // Random across full height
            const tuftWidth = 2 + Math.floor(hash(tx, ty, 300 + i) * 3); // 2-4px wide
            const tuftHeight = 4 + Math.floor(hash(tx, ty, 400 + i) * 5); // 4-8px tall
            ctx.fillRect(drawX + rx, baseY - tuftHeight, tuftWidth, tuftHeight); // Draw upward from base
          }
        }
        if (tile.terrain === "sand") {
          for (let i = 0; i < tuftCount; i++) {
            const yellowShade = Math.floor(100 + hash(tx, ty, 500 + i) * 100); // 100-200 for rgb(0, greenShade, 0)
            ctx.fillStyle = `rgb(180, ${yellowShade}, 0)`;
            const rx = Math.floor(hash(tx, ty, 100 + i) * gameState.tileSize);
            const baseY =
              drawY + Math.floor(hash(tx, ty, 200 + i) * gameState.tileSize); // Random across full height
            const tuftWidth = 2; // 2-4px wide
            const tuftHeight = 2; // 4-8px tall
            ctx.fillRect(drawX + rx, baseY - tuftHeight, tuftWidth, tuftHeight); // Draw upward from base
          }
        }
      }

      if (tile.flora_type !== "none") {
        ctx.font = `${gameState.spriteSizeFlora}px serif`;
        ctx.fillText(
          getEmojiForFlora(tile.flora_type),
          drawX + gameState.tileSize / 2,
          drawY + gameState.tileSize / 2
        );
      }
      if (tile.location !== "none") {
        ctx.font = `${gameState.spriteSizeLocation}px serif`;
        ctx.fillText(
          getEmojiForLocation(tile.location),
          drawX + gameState.tileSize / 2,
          drawY + gameState.tileSize / 2
        );
      }
      if (tile.entity !== "none") {
        ctx.font = `${gameState.spriteSizeEntity}px serif`;
        ctx.fillText(
          getEmojiForEntity(tile.entity),
          drawX + gameState.tileSize / 2,
          drawY + gameState.tileSize / 2
        );
      }
    }
  }
  drawPlayer();
}

function drawPlayer() {
  // Draw player
  let playerX =
    gameState.offsetX +
    Math.floor(gameState.viewWidth / 2) * gameState.tileSize +
    gameState.tileSize / 2;
  let playerY =
    gameState.offsetY +
    Math.floor(gameState.viewHeight / 2) * gameState.tileSize +
    gameState.tileSize / 2;
  ctx.fillStyle = "blue";
  ctx.beginPath();
  ctx.arc(playerX, playerY, gameState.tileSize / 3, 0, Math.PI * 2);
  ctx.fill();
  let player = "🛡️";
  ctx.font = `${gameState.tileSize}px serif`;
  ctx.fillText(player, playerX, playerY + gameState.tileSize / 10);
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
