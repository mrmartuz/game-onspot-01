import { gameState } from './game_variables.js';

export function hash(x, y, s) {
    let n = x * 12345 + y * 6789 + s * 98765 + gameState.seed;
    n = Math.sin(n) * 43758.5453;
    return n - Math.floor(n);
}
export function getBiome(x, y) {
    let dist = Math.sqrt(x * x + y * y);
    if (dist < 50) return 'temperate';
    else if (dist < 100) return 'taiga';
    else return 'desert';
}

export function getTile(x, y) {
    const key = `${x},${y}`;
    let change = gameState.changed.find(t => t.x === x && t.y === y);
    let location = change ? change.type : 'none';
    if (location === 'none') {
        let h1 = hash(x, y, 1);
        if (h1 < 0.05) {
            const locations = ['waterfalls', 'canyon', 'geyser', 'peaks', 'monster caves', 'cave', 'ruin', 'camp', 'farm', 'outpost', 'hamlet', 'village', 'city'];
            location = locations[Math.floor(hash(x, y, 2) * locations.length)];
        }
    }
    let entity = 'none';
    let h3 = hash(x, y, 3);
    if (h3 < 0.05) {
        const entities = ['monster', 'beast', 'animal', 'npc', 'group', 'army', 'trader', 'caravan'];
        entity = entities[Math.floor(hash(x, y, 4) * entities.length)];
    }
    if (gameState.killed.has(key)) entity = 'none';

    // Compute raw height and flora
    let rawHeight = hash(x, y, 5) * 11;
    let rawFlora = hash(x, y, 6) * 11;

    // Smooth height and flora by averaging with neighbors
    let heightSum = rawHeight;
    let floraSum = rawFlora;
    let neighborCount = 1; // Include the tile itself
    const neighbors = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    neighbors.forEach(d => {
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
    neighbors.forEach(d => {
        let nh = Math.floor((hash(x + d[0], y + d[1], 5) * 11 + heightSum - rawHeight) / (neighborCount - 1));
        inclination = Math.max(inclination, Math.abs(height - nh));
    });

    // Determine terrain based on smoothed height
    let terrain = height < 4 ? 'sand' : height < 8 ? 'dirt' : 'rock';

    // Determine flora type based on biome if flora is present
    let flora_type = 'none';
    if (flora > 6) {
        let biome = getBiome(x, y);
        let flora_options = [];
        if (biome === 'temperate') {
            flora_options = ['oak', 'iris', 'tulip', 'sun-flower'];
        } else if (biome === 'taiga') {
            flora_options = ['pine', 'mushroom'];
        } else if (biome === 'desert') {
            flora_options = ['palm', 'cactus', 'dead-tree'];
        }
        if (flora_options.length > 0) {
            flora_type = flora_options[Math.floor(hash(x, y, 7) * flora_options.length)];
        }
    }

    return { height, inclination, terrain, flora, location, entity, flora_type };
}

export function getEmojiForLocation(type) {
    const map = {
        'waterfalls': '🏞️', 'canyon': '⛰️', 'geyser': '🌋', 'peaks': '🏔️',
        'monster caves': '🕷️', 'cave': '🦇', 'ruin': '🏚️', 'camp': '⛺',
        'farm': '🏡', 'outpost': '🏕️', 'hamlet': '🏠', 'village': '🏘️', 'city': '🏰'
    };
    return map[type] || '🪨';
}

export function getEmojiForFlora(type) {
    const map = {
        'oak': '🌳', 'pine': '🌲', 'palm': '🌴', 'cactus': '🌵',
        'sun-flower': '🌻', 'iris': '🪻', 'tulip': '🌷', 'mushroom': '🍄', 'dead-tree': '🪾'
    };
    return map[type] || '🍀';
}

export function getEmojiForEntity(type) {
    const map = {
        'monster': '🧌', 'beast': '🦏', 'animal': '🐎', 'npc': '🧍🏻',
        'group': '👫', 'army': '💂', 'trader': '🧑‍🎓', 'caravan': '🧑‍✈️'
    };
    return map[type] || '🥷🏻';
}

export function getGroupBonus(type) {
    return gameState.group.reduce((total, g) => total + (g.bonus[type] || 0), 0);
}

export function getNumCarriers() {
    return gameState.group.filter(g => g.role === 'carrier').length;
}

export function getMaxStorage() {
    return 50 * gameState.group.length + 50 * getNumCarriers() + 200 * gameState.carts;
}


export function getBonusForRole(role) {
    const bonuses = {
        'native-guide': {navigation: 0.2},
        'explorer': {discovery: 0.2},
        'cook': {food: 0.2},
        'guard': {combat: 0.2},
        'geologist': {resource: 0.2},
        'biologist': {plant: 0.2},
        'translator': {interact: 0.2},
        'carrier': {carry: 0.2},
        'medic': {health: 0.2},
        'navigator': {view: 1}
    };
    return bonuses[role] || {};
}