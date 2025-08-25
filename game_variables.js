export let px = 0, py = 0;
export let prevx = 0, prevy = 0;
export let visited = new Set(['0,0']);
export let changed = []; // {x, y, type}
export let killed = new Set();
export let seed = Math.floor(Math.random() * 1000000000); // Randomized seed for procedural generation
export let viewWidth = 21, viewHeight = 21;
export let viewDist = 3;
export let cooldown = false;
export let health = 100;
export let gold = 100;
export let food = 100;
export let water = 100;
export let tents = 2;
export let building_mats = 10;
export let wood = 10;
export let carts = 0;
export let group = [
    {role: 'explorer', bonus: {discovery: 0.2}},
    {role: 'carrier', bonus: {carry: 0.2}}
];
export let discoverPoints = 0;
export let killPoints = 0;
export let events = [];
export let moving = false;
export let moveStartTime = 0;
export let moveDuration = 0;
export let moveDx = 0;
export let moveDy = 0;

export let tileSize = 30;
export let offsetX = 0, offsetY = 0;

// Time system
export const game_start_real = Date.now();
export const game_start_date = new Date("1500-01-01T00:00:00");
export const acceleration = 720; // 1 game day per 2 real minutes (86400 seconds / 120 seconds = 720)
export let last_consume_time = Date.now();