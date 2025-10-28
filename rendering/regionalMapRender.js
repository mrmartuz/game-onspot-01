import {
  getTile,
  getEmojiForFlora,
  getEmojiForLocation,
  getEmojiForEntity,
} from "./tile.js";
import { gameState } from "../gamestate/game_variables.js";
import { hash } from "../utils.js";
import { getGroupBonus } from "../utils.js";
import {
  getVisitedTile,
  getCachedTile,
  hasCachedTile,
} from "../gamestate/gameStateSetGet.js";
import {
  updateTimeColorCache,
  getCurrentGameDate,
  getTimeBasedViewDistance,
} from "../time_system.js";
import { canvas } from "../rendering.js";

export function drawRegionalMap(ctx, offsetDeltaX, offsetDeltaY) {
  updateTimeColorCache();

  // Calculate effective view distance for darkening effect
  const currentGameDate = getCurrentGameDate();
  const hour = currentGameDate.getHours();
  const minute = currentGameDate.getMinutes();
  const second = currentGameDate.getSeconds();
  const viewBonus = getGroupBonus("view");
  const effectiveViewDist = getTimeBasedViewDistance(
    gameState.viewDist,
    viewBonus,
    hour,
    minute,
    second
  );

  // Render 2 extra tiles on each side for border coverage + movement buffer
  const extraTiles = 2;

  for (let vx = -extraTiles; vx < gameState.viewWidth + extraTiles; vx++) {
    for (let vy = -extraTiles; vy < gameState.viewHeight + extraTiles; vy++) {
      let tx = gameState.px - Math.floor(gameState.viewWidth / 2) + vx;
      let ty = gameState.py - Math.floor(gameState.viewHeight / 2) + vy;
      let key = `${tx},${ty}`;
      let tile = hasCachedTile(key) ? getCachedTile(key) : getTile(tx, ty);
      let drawX = gameState.offsetX + offsetDeltaX + vx * gameState.tileSize;
      let drawY = gameState.offsetY + offsetDeltaY + vy * gameState.tileSize;

      if (!getVisitedTile(key)) {
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

      // Apply darkening overlay for tiles outside current view distance
      const distance =
        Math.abs(tx - gameState.px) + Math.abs(ty - gameState.py);
      if (distance > effectiveViewDist) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(drawX, drawY, gameState.tileSize, gameState.tileSize);
      }
    }
  }

  applyTimeOfDayOverlay(ctx);
}

function applyTimeOfDayOverlay(ctx) {
  const currentTimeOfDay = gameState.currentTimeOfDay;
  const nextTimeOfDay = gameState.nextTimeOfDay;
  const transitionFactor = gameState.transitionFactor;

  // Skip overlay during pure day for best performance
  if (currentTimeOfDay === "day" && transitionFactor === 0) return;

  // Get colors for current and next period
  const currentColor = getTimeOfDayColor(currentTimeOfDay);
  const nextColor = getTimeOfDayColor(nextTimeOfDay);

  // Blend between two overlays during transitions
  if (transitionFactor > 0 && transitionFactor < 1) {
    // During transition: apply both overlays with varying opacity
    // Draw first overlay with reduced opacity
    if (currentColor.color) {
      ctx.globalCompositeOperation = currentColor.blendMode;
      ctx.fillStyle = currentColor.color.replace(
        /[\d.]+\)$/,
        `${currentColor.alpha * (1 - transitionFactor)})`
      );
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Draw second overlay
    if (nextColor.color) {
      ctx.globalCompositeOperation = nextColor.blendMode;
      ctx.fillStyle = nextColor.color.replace(
        /[\d.]+\)$/,
        `${nextColor.alpha * transitionFactor})`
      );
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  } else {
    // Pure period (no transition)
    if (currentColor.color) {
      ctx.globalCompositeOperation = currentColor.blendMode;
      ctx.fillStyle = currentColor.color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  // Reset blend mode and alpha for next frame
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1.0;
}

function getTimeOfDayColor(timeOfDay) {
  if (timeOfDay === "night") {
    return {
      color: "rgba(15, 15, 32, 0.78)",
      blendMode: "multiply",
      alpha: 0.6,
    };
  } else if (timeOfDay === "sunrise") {
    return {
      color: "rgba(241, 189, 46, 0.3)",
      blendMode: "screen",
      alpha: 0.3,
    };
  } else if (timeOfDay === "day") {
    return { color: null, blendMode: "source-over", alpha: 0 }; // No overlay
  } else if (timeOfDay === "sunset") {
    return {
      color: "rgba(255, 150, 80, 0.4)",
      blendMode: "multiply",
      alpha: 0.4,
    };
  }
  return { color: null, blendMode: "source-over", alpha: 0 };
}
