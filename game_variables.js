import { getTile } from './utils.js';

export const gameState = {
    px: 0,
    py: 0,
    prevx: 0,
    prevy: 0,
    visited: new Map(),
    changed: [], // {x, y, type}
    killed: new Set(),
    seed: Math.floor(Math.random() * 1000000000), // Randomized seed for procedural generation
    viewWidth: 21,
    viewHeight: 21,
    viewDist: 3,
    cooldown: false,
    health: 100,
    gold: 1000+Math.floor(Math.random() * 1000),
    food: 20,
    water: 20,
    tents: 2,
    building_mats: 10,
    wood: 10,
    carts: 0,
    group: [
        {role: 'explorer🔍'},
        {role: 'carrier📦'},
    ],
    groupBonus: {
        'navigation': 0,
        'discovery': 0,
        'food': 0,
        'combat': 0,
        'resource': 0,
        'plant': 0,
        'interact': 0,
        'carry': 0,
        'health': 0,
        'view': 0
    },
    discoverPoints: 0,
    killPoints: 0,
    events: [],
    discoveredLocations: [], // Track discovered locations separately from event logs
    moving: false,
    moveStartTime: 0,
    moveDuration: 0,
    moveDx: 0,
    moveDy: 0,
    tileSize: 50,
    spriteSizeLocation: 40,
    spriteSizeEntity: 24,
    spriteSizeFlora: 20,
    offsetX: 0,
    offsetY: 0,
    last_consume_time: Date.now()
};

// Time system constants (unchanged, as they're immutable)
export const game_start_real = Date.now();
export const game_start_date = new Date(`${(Math.floor(Math.random() * 300) + Math.floor(Math.random() * 300)).toString().padStart(4, '0')}-${(Math.floor(Math.random() * 12) + 1).toString().padStart(2, '0')}-${(Math.floor(Math.random() * 28) + 1).toString().padStart(2, '0')}T${(Math.floor(Math.random() * 24)).toString().padStart(2, '0')}:00:00`);
export const acceleration = 720; // 1 game day per 2 real minutes (86400 seconds / 120 seconds = 720)