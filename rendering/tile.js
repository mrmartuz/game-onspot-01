import { gameState } from "../game_variables.js";
import { hash } from "../utils.js";

export function getBiome(x, y) {
  let dist = Math.sqrt(x * x + y * y);
  if (dist < 50) return "temperate";
  else if (dist < 100) return "taiga";
  else return "desert";
}

export function getTile(x, y) {
  const key = `${x},${y}`;

  if (gameState.killed.has(key)) {
    let tile = gameState.visited.get(key);
    tile.entity = "none";
    return tile;
  }
  if (gameState.visited.has(key)) {
    return gameState.visited.get(key);
  }

  let biome = getBiome(x, y);
  let change = gameState.changed.find((t) => t.x === x && t.y === y);

  let entity = "none";
  if (!gameState.killed.has(key)) {
    let h3 = hash(x, y, 3);
    if (h3 < 0.05) {
      const entities = [
        "monster",
        "beast",
        "animal",
        "npc",
        "group",
        "army",
        "trader",
        "caravan",
      ];
      entity = entities[Math.floor(hash(x, y, 4) * entities.length)];
    }
  }
  // Compute raw height and flora
  let rawHeight = hash(x, y, 5) * 11;
  let rawFlora = hash(x, y, 6) * 11;

  // Smooth height and flora by averaging with neighbors
  let heightSum = rawHeight;
  let floraSum = rawFlora;
  let neighborCount = 1; // Include the tile itself
  const neighbors = [
    [0, -1],
    [0, 1],
    [-1, 0],
    [1, 0],
  ];
  neighbors.forEach((d) => {
    let nx = x + d[0];
    let ny = y + d[1];
    heightSum += hash(nx, ny, 5) * 11;
    floraSum += hash(nx, ny, 6) * 11;
    neighborCount++;
  });
  let smoothedHeight = heightSum / neighborCount;
  let smoothedFlora = floraSum / neighborCount;

  // Round to integers for consistency
  let height = Math.floor(smoothedHeight);
  let flora = Math.floor(smoothedFlora);

  // Calculate inclination based on smoothed height
  let inclination = 0;
  neighbors.forEach((d) => {
    let nh = Math.floor(
      (hash(x + d[0], y + d[1], 5) * 11 + heightSum - rawHeight) /
        (neighborCount - 1)
    );
    inclination = Math.max(inclination, Math.abs(height - nh));
  });

  // Determine terrain based on smoothed height
  let terrain = height < 3 ? "sand" : height < 6 ? "dirt" : "rock";

  let location = change ? change.type : "none";
  if (location === "none") {
    let h1 = hash(x, y, 1);
    let locations = [];
    if (biome === "desert" && terrain === "rock") {
      if (h1 < 0.2) {
        // 20% chance for peaks in desert rock
        locations = [
          "peaks",
          "peaks",
          "peaks",
          "volcano",
          "canyon",
          "geyser",
          "monster caves",
          "outpost",
        ]; // Bias toward peaks
      }
    } else if (terrain === "sand") {
      if (h1 < 0.05) {
        locations = [
          "ruin",
          "camp",
          "farm",
          "outpost",
          "hamlet",
          "village",
          "city",
        ];
      }
    } else if (terrain === "dirt") {
      if (h1 < 0.05) {
        locations = [
          "cave",
          "ruin",
          "camp",
          "farm",
          "outpost",
          "camp",
          "hamlet",
          "ruin",
          "village",
          "city",
        ];
      }
    } else if (terrain === "rock") {
      if (h1 < 0.05) {
        locations = [
          "waterfalls",
          "outpost",
          "volcano",
          "geyser",
          "cave",
          "ruin",
          "monster caves",
          "camp",
        ];
      } else {
        locations = ["peaks"];
      }
    }
    if (locations.length > 0) {
      location = locations[Math.floor(hash(x, y, 2) * locations.length)];
    }
  }
  // Determine flora type based on biome if flora is present
  let flora_type = "none";
  if (flora > 5) {
    biome = getBiome(x, y);
    let flora_options = [];
    if (biome === "temperate" && terrain === "dirt") {
      flora_options = ["oak", "iris", "tulip", "sun-flower", "oak"];
    } else if (biome === "temperate" && terrain === "sand") {
      flora_options = ["dead-tree", "sun-flower"];
    } else if (biome === "taiga" && terrain === "dirt") {
      flora_options = ["pine", "mushroom", "tulip", "pine"];
    } else if (biome === "taiga" && terrain === "sand") {
      flora_options = ["dead-tree"];
    } else if (biome === "desert" && terrain === "dirt") {
      flora_options = ["palm", "cactus", "tulip"];
    } else if (biome === "desert" && terrain === "sand") {
      flora_options = ["cactus", "dead-tree"];
    }
    if (flora_options.length > 0) {
      flora_type =
        flora_options[Math.floor(hash(x, y, 7) * flora_options.length)];
    }
  }

  let color = "red";
  let r = hash(x, y, 8);
  if (biome === "temperate") {
    if (terrain === "sand") {
      if (r < 0.25) {
        color = "#AACC00";
      } else if (r < 0.5) {
        color = "#80B918";
      } else if (r < 0.75) {
        color = "#55a630";
      } else {
        color = "#BFD200";
      }
    } else if (terrain === "dirt") {
      if (r < 0.25) {
        color = "#AACC00";
      } else if (r < 0.5) {
        color = "#80B918";
      } else if (r < 0.75) {
        color = "#55a630";
      } else {
        color = "#2b9348";
      }
    } else {
      if (r < 0.25) {
        color = "#174424";
      } else if (r < 0.5) {
        color = "#1b2e1b";
      } else if (r < 0.75) {
        color = "#1B1E15";
      } else {
        color = "#0b2312";
      }
    }
  } else if (biome === "taiga") {
    if (terrain === "sand") {
      if (r < 0.25) {
        color = "#191611";
      } else if (r < 0.5) {
        color = "#1B1E15";
      } else {
        color = "#1C2618";
      }
    } else if (terrain === "dirt") {
      if (r < 0.25) {
        color = "#191611";
      } else if (r < 0.5) {
        color = "#1B1E15";
      } else {
        color = "#1C2618";
      }
    } else {
      if (r < 0.33) {
        color = "#191611";
      } else if (r < 0.66) {
        color = "#1B1E15";
      } else {
        color = "#1C2618";
      }
    }
  } else if (biome === "desert") {
    if (terrain === "sand") {
      if (r < 0.25) {
        color = "#AACC00";
      } else if (r < 0.5) {
        color = "#80B918";
      } else if (r < 0.75) {
        color = "#D4D700";
      } else {
        color = "#BFD200";
      }
    } else if (terrain === "dirt") {
      if (r < 0.25) {
        color = "#AACC00";
      } else if (r < 0.5) {
        color = "#80B918";
      } else if (r < 0.75) {
        color = "#D4D700";
      } else {
        color = "#BFD200";
      }
    } else {
      if (r < 0.33) {
        color = "#191611";
      } else if (r < 0.66) {
        color = "#1B1E15";
      } else {
        color = "#1C2618";
      }
    }
  }

  const tile = {
    height,
    inclination,
    terrain,
    flora,
    location,
    entity,
    flora_type,
    biome,
    color,
  };

  // TODO refactor to save only x,y and nothing else need to make array game_variable.visited as Set
  if (gameState.visited.has(key)) {
    gameState.visited.set(key, tile);
  }
  return tile;
}

export function updateTile(x, y) {
  const key = `${x},${y}`;
  if (gameState.visited.has(key)) {
    const tile = getTile(x, y); // Regenerate tile to reflect changes
    gameState.visited.set(key, tile);
  }
}

export function getEmojiForLocation(type) {
  const map = {
    waterfalls: "🏞️",
    volcano: "🌋",
    canyon: "⛰️",
    geyser: "🗻",
    peaks: "🏔️",
    "monster caves": "🕷️",
    cave: "🦇",
    ruin: "🏚️",
    camp: "⛺",
    farm: "🏡",
    outpost: "🏕️",
    hamlet: "🏠",
    village: "🏘️",
    city: "🏰",
  };
  return map[type] || "🪨";
}

export function getEmojiForFlora(type) {
  const map = {
    oak: "🌳",
    pine: "🌲",
    palm: "🌴",
    cactus: "🌵",
    "sun-flower": "🌻",
    iris: "🪻",
    tulip: "🌷",
    mushroom: "🍄",
    "dead-tree": "🌵",
  };
  return map[type] || "🍀";
}

export function getEmojiForEntity(type) {
  const map = {
    monster: "🧌",
    beast: "🦏",
    animal: "🐎",
    npc: "🧍🏻",
    group: "👫",
    army: "💂",
    trader: "🧑‍🎓",
    caravan: "🧑‍✈️",
  };
  return map[type] || "🥷🏻";
}

export function colorToRGB(color) {
  const ctx = document.createElement("canvas").getContext("2d");
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return { r, g, b };
}

export function interpolateColor(color1, color2, factor) {
  const c1 = typeof color1 === "string" ? colorToRGB(color1) : color1;
  const c2 = typeof color2 === "string" ? colorToRGB(color2) : color2;
  const r = Math.round(c1.r + (c2.r - c1.r) * factor);
  const g = Math.round(c1.g + (c2.g - c1.g) * factor);
  const b = Math.round(c1.b + (c2.b - c1.b) * factor);
  return `rgb(${r}, ${g}, ${b})`;
}
