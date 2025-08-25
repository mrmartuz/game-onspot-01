export const gameState = {
    px: 0,
    py: 0,
    prevx: 0,
    prevy: 0,
    visited: new Set(['0,0']),
    changed: [], // {x, y, type}
    killed: new Set(),
    seed: Math.floor(Math.random() * 1000000000), // Randomized seed for procedural generation
    viewWidth: 21,
    viewHeight: 21,
    viewDist: 3,
    cooldown: false,
    health: 100,
    gold: 25+Math.floor(Math.random() * 10),
    food: 30+Math.floor(Math.random() * 10),
    water: 20+Math.floor(Math.random() * 10),
    tents: 2,
    building_mats: 5,
    wood: 5,
    carts: 0,
    group: [
        {role: 'explorer', bonus: {discovery: 0.2}},
        {role: 'carrier', bonus: {carry: 0.2}}
    ],
    discoverPoints: 0,
    killPoints: 0,
    events: [],
    moving: false,
    moveStartTime: 0,
    moveDuration: 0,
    moveDx: 0,
    moveDy: 0,
    tileSize: 30,
    offsetX: 0,
    offsetY: 0,
    last_consume_time: Date.now()
};

// Time system constants (unchanged, as they're immutable)
export const game_start_real = Date.now();
export const game_start_date = new Date("1500-01-01T00:00:00");
export const acceleration = 720; // 1 game day per 2 real minutes (86400 seconds / 120 seconds = 720)