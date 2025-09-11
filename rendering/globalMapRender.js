// globalMapRender.js
import { gameState } from "../gamestate/game_variables.js";
import { getTile } from "../rendering/tile.js";
import { getEmojiForLocation } from "../rendering/tile.js";
import { getEmojiForEntity } from "../rendering/tile.js";

// constants.js
const GLOBAL_MAP_CONSTANTS = {
  TILE_SIZE: 20, // 3x3 pixels for global map tiles (can be 2 for 2x2)
  BIOME_COLORS: {
    temperate: { base: "#55a630", peaks: "#161a1d" },
    taiga: { base: "#1C5B41", peaks: "#060e0b" }, // Light blue tint for peaks
    desert: { base: "#D4D700", peaks: "#5C410F" }, // Yellowish tint for peaks
  },
  LOCATION_COLOR: {
    city: "#D4D700", // Vibrant orange for cities
    village: "#D4D700", // Vibrant orange for villages
    camp: "#D4D700", // Vibrant orange for camps
    outpost: "#D4D700", // Red for outposts
    hamlet: "#D4D700", // Red for
    ruin: "#D4D700", // Red for caves and monster caves
    farm: "#b1a7a6", // Red for caves and monster caves
    cave: "#808080", // Gray for caves
    "monster caves": "#808080", // Gray for monster caves
    peaks: "#161a1d", // DarkGray for peaks
    volcano: "#e6c229", // Yellow for volcanoes
    waterfall: "#4682b4", // Blue for waterfalls
    canyon: "#4682b4", // Blue for canyons
    geyser: "#4682b4", // Blue for geysers
  },
  LOCATION_EMOJI: {
    city: getEmojiForLocation("city"), // City emoji
    village: getEmojiForLocation("village"), // Village emoji
    camp: getEmojiForLocation("camp"), // Camp emoji
    outpost: getEmojiForLocation("outpost"), // Outpost emoji
    hamlet: getEmojiForLocation("hamlet"), // Hamlet emoji (same as village)
    ruin: getEmojiForLocation("ruin"), // Ruin emoji
    farm: getEmojiForLocation("farm"), // Farm emoji
    cave: getEmojiForLocation("cave"), // Cave emoji
    "monster caves": getEmojiForLocation("monster caves"), // Monster cave emoji
    peaks: getEmojiForLocation("peaks"), // Mountain peaks emoji
    volcano: getEmojiForLocation("volcano"), // Volcano emoji
    waterfall: getEmojiForLocation("waterfall"), // Waterfall emoji
    canyon: getEmojiForLocation("canyon"), // Canyon emoji
    geyser: getEmojiForLocation("geyser"), // Geyser emoji
  },
  CAVE_COLOR: "#808080", // Red for caves and monster caves
  ENTITY_COLORS: {
    monster: "#660708", // Red for monsters
    animal: "#fdf0d5", // Light gray for animals and monsters
    humanoids: "#669bbc", // Pink for groups, armies, NPCs, traders, caravans
  },
  ENTITY_EMOJI: {
    monster: getEmojiForEntity("monster"), // Monster emoji
    animal: getEmojiForEntity("animal"), // Animal emoji
    npc: getEmojiForEntity("npc"), // Humanoid emoji
    group: getEmojiForEntity("group"), // Humanoid emoji
    army: getEmojiForEntity("army"), // Humanoid emoji
    trader: getEmojiForEntity("trader"), // Humanoid emoji
    caravan: getEmojiForEntity("caravan"), // Humanoid emoji
  },
};

export const MAP_MODES = {
  REGIONAL: "regional",
  GLOBAL: "global",
};

export function drawGlobalMap(ctx) {
  // Clear the canvas
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Calculate the view boundaries based on camera position
  const tileSize = GLOBAL_MAP_CONSTANTS.TILE_SIZE;
  const viewWidth = Math.floor(ctx.canvas.width / tileSize);
  const viewHeight = Math.floor(ctx.canvas.height / tileSize);
  const cameraX = gameState.cameraX || gameState.px; // Default to player position
  const cameraY = gameState.cameraY || gameState.py;
  const startX = Math.floor(cameraX - viewWidth / 2);
  const startY = Math.floor(cameraY - viewHeight / 2);
  const endX = startX + viewWidth;
  const endY = startY + viewHeight;

  // Render only visited tiles within the view
  for (let tx = startX; tx <= endX; tx++) {
    for (let ty = startY; ty <= endY; ty++) {
      const key = `${tx},${ty}`;
      if (!gameState.visited.has(key)) {
        ctx.fillStyle = "slategray"; // Unvisited tiles are black
        const drawX = (tx - startX) * tileSize;
        const drawY = (ty - startY) * tileSize;
        ctx.fillRect(drawX, drawY, tileSize, tileSize);
      } else {
        const tile = getTile(tx, ty);
        ctx.fillStyle = getTileColor(tile);
        const drawX = (tx - startX) * tileSize;
        const drawY = (ty - startY) * tileSize;
        ctx.fillRect(drawX, drawY, tileSize, tileSize);

        // Draw emoji for locations
        const emoji = getLocationEmoji(tile);
        if (emoji) {
          drawEmoji(ctx, emoji, drawX, drawY, tileSize);
        }
        const entityEmoji = getEntityEmoji(tile);
        if (entityEmoji) {
          drawEmoji(ctx, entityEmoji, drawX, drawY, tileSize);
        }
      }
    }
  }

  // Draw the player as a distinct marker (e.g., a white 3x3 square)
  const playerDrawX = (gameState.px - startX) * tileSize;
  const playerDrawY = (gameState.py - startY) * tileSize;
  ctx.fillStyle = "white";
  ctx.fillRect(playerDrawX, playerDrawY, tileSize, tileSize);
}

function getTileColor(tile) {
  const { biome, terrain, location, entity } = tile;
  const { BIOME_COLORS, LOCATION_COLOR, CAVE_COLOR, ENTITY_COLORS } =
    GLOBAL_MAP_CONSTANTS;

  // Prioritize entity colors
  if (entity !== "none") {
    if (["monster", "beast", "animal"].includes(entity)) {
      return ENTITY_COLORS.animals;
    }
    if (["npc", "group", "army", "trader", "caravan"].includes(entity)) {
      return ENTITY_COLORS.humanoids;
    }
  }

  // Then location colors (but skip peaks and volcano as they use biome colors)
  if (location !== "none") {
    if (["cave", "monster caves"].includes(location)) {
      return CAVE_COLOR;
    }
    if (["peaks", "volcano"].includes(location)) {
      return BIOME_COLORS[biome].peaks;
    }
    if (["waterfall", "canyon", "geyser"].includes(location)) {
      return LOCATION_COLOR[location];
    }
    if (
      ["outpost", "ruin", "farm", "hamlet", "village", "city", "camp"].includes(
        location
      )
    ) {
      return LOCATION_COLOR[location];
    }
    return LOCATION_COLOR[location] || BIOME_COLORS[biome].base;
  }
  // Finally, biome-based colors
  return BIOME_COLORS[biome].base;
}

function getLocationEmoji(tile) {
  const { location } = tile;
  const { LOCATION_EMOJI } = GLOBAL_MAP_CONSTANTS;

  if (location !== "none" && LOCATION_EMOJI[location]) {
    return LOCATION_EMOJI[location];
  }
  return null;
}

function getEntityEmoji(tile) {
  const { entity } = tile;
  const { ENTITY_EMOJI } = GLOBAL_MAP_CONSTANTS;
  if (entity !== "none" && ENTITY_EMOJI[entity]) {
    return ENTITY_EMOJI[entity];
  }
  return null;
}

function drawEmoji(ctx, emoji, x, y, tileSize) {
  // Set font size to fit within the tile
  const fontSize = Math.floor(tileSize * 0.8);
  ctx.font = `${fontSize}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Draw emoji centered in the tile
  const centerX = x + tileSize / 2;
  const centerY = y + tileSize / 2;
  ctx.fillText(emoji, centerX, centerY);
}

export function centerCameraOnPlayer() {
  gameState.cameraX = gameState.px;
  gameState.cameraY = gameState.py;
}
