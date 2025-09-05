import { gameState } from "../game_variables.js";

export function drawPlayer(ctx) {
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

