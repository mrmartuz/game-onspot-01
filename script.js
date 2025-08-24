// Game variables
let px = 0, py = 0;
let prevx = 0, prevy = 0;
let visited = new Set(['0,0']);
let changed = []; // {x, y, type}
let killed = new Set();
let seed = Math.floor(Math.random() * 1000000000); // Randomized seed for procedural generation
let viewWidth = 21, viewHeight = 21;
let viewDist = 3;
let cooldown = false;
let health = 100;
let gold = 100;
let food = 100;
let water = 100;
let tents = 2;
let building_mats = 10;
let wood = 10;
let carts = 0;
let group = [
    {role: 'explorer', bonus: {discovery: 0.2}},
    {role: 'carrier', bonus: {carry: 0.2}}
];
let discoverPoints = 0;
let killPoints = 0;
let events = [];
let moving = false;
let moveStartTime = 0;
let moveDuration = 0;
let moveDx = 0;
let moveDy = 0;

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
let tileSize = 30;
let offsetX = 0, offsetY = 0;

// Time system
const game_start_real = Date.now();
const game_start_date = new Date("1500-01-01T00:00:00");
const acceleration = 720; // 1 game day per 2 real minutes (86400 seconds / 120 seconds = 720)
let last_consume_time = Date.now();

function getCurrentGameDate() {
    const elapsed_real_ms = Date.now() - game_start_real;
    const elapsed_game_ms = elapsed_real_ms * acceleration;
    return new Date(game_start_date.getTime() + elapsed_game_ms);
}

function logEvent(desc) {
    events.push({date: getCurrentGameDate().toLocaleString(), desc});
}

// Resize handler
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 80;
    viewWidth = Math.floor(canvas.width / tileSize);
    if (viewWidth % 2 === 0) viewWidth--;
    viewHeight = Math.floor(canvas.height / tileSize);
    if (viewHeight % 2 === 0) viewHeight--;
    offsetX = (canvas.width - viewWidth * tileSize) / 2;
    offsetY = (canvas.height - viewHeight * tileSize) / 2;
}
window.addEventListener('resize', resize);
resize();

// Hash function for procedural generation
function hash(x, y, s) {
    let n = x * 12345 + y * 6789 + s * 98765 + seed;
    n = Math.sin(n) * 43758.5453;
    return n - Math.floor(n);
}

// Get biome based on distance from starting point
function getBiome(x, y) {
    let dist = Math.sqrt(x * x + y * y);
    if (dist < 50) return 'temperate';
    else if (dist < 100) return 'taiga';
    else return 'desert';
}

// Get tile data with smoothing
function getTile(x, y) {
    const key = `${x},${y}`;
    let change = changed.find(t => t.x === x && t.y === y);
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
    if (killed.has(key)) entity = 'none';

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

// Emojis for rendering
function getEmojiForLocation(type) {
    const map = {
        'waterfalls': '🏞️', 'canyon': '⛰️', 'geyser': '🌋', 'peaks': '🏔️',
        'monster caves': '🕷️', 'cave': '🦇', 'ruin': '🏚️', 'camp': '⛺',
        'farm': '🏡', 'outpost': '🏕️', 'hamlet': '🏠', 'village': '🏘️', 'city': '🏰'
    };
    return map[type] || '🪨';
}

function getEmojiForFlora(type) {
    const map = {
        'oak': '🌳', 'pine': '🌲', 'palm': '🌴', 'cactus': '🌵',
        'sun-flower': '🌻', 'iris': '🪻', 'tulip': '🌷', 'mushroom': '🍄', 'dead-tree': '🪾'
    };
    return map[type] || '🍀';
}


function getEmojiForEntity(type) {
    const map = {
        'monster': '🧌', 'beast': '🦏', 'animal': '🐎', 'npc': '🧍🏻',
        'group': '👫', 'army': '💂', 'trader': '🧑‍🎓', 'caravan': '🧑‍✈️'
    };
    return map[type] || '🥷🏻';
}

// Draw function
function draw(offsetDeltaX, offsetDeltaY) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let vx = 0; vx < viewWidth; vx++) {
        for (let vy = 0; vy < viewHeight; vy++) {
            let tx = px - Math.floor(viewWidth / 2) + vx;
            let ty = py - Math.floor(viewHeight / 2) + vy;
            let tile = getTile(tx, ty);
            let drawX = offsetX + offsetDeltaX + vx * tileSize;
            let drawY = offsetY + offsetDeltaY + vy * tileSize;
            let key = `${tx},${ty}`;
            if (!visited.has(key)) {
                ctx.fillStyle = 'black';
                ctx.fillRect(drawX, drawY, tileSize, tileSize);
                continue;
            }
            ctx.fillStyle = tile.terrain === 'sand' ? 'yellow' : tile.terrain === 'dirt' ? 'green' : 'gray';
            ctx.fillRect(drawX, drawY, tileSize, tileSize);

            // Render grass tufts spread across the full tile
            if (tile.terrain === 'dirt' && tile.flora > 0) {
                const tuftCount = tile.flora * 3; // Up to 30 tufts at flora=10; adjust for density
                for (let i = 0; i < tuftCount; i++) {
                    // Vary green shade for depth (darker to lighter green)
                    const greenShade = Math.floor(100 + hash(tx, ty, 500 + i) * 100); // 100-200 for rgb(0, greenShade, 0)
                    ctx.fillStyle = `rgb(0, ${greenShade}, 0)`;
                    const rx = Math.floor(hash(tx, ty, 100 + i) * tileSize);
                    const baseY = drawY + Math.floor(hash(tx, ty, 200 + i) * tileSize); // Random across full height
                    const tuftWidth = 2 + Math.floor(hash(tx, ty, 300 + i) * 3); // 2-4px wide
                    const tuftHeight = 4 + Math.floor(hash(tx, ty, 400 + i) * 5); // 4-8px tall
                    ctx.fillRect(drawX + rx, baseY - tuftHeight, tuftWidth, tuftHeight); // Draw upward from base
                }
            }

            if (tile.flora_type !== 'none') {
                ctx.font = '20px serif';
                ctx.fillText(getEmojiForFlora(tile.flora_type), drawX + tileSize / 2, drawY + tileSize / 2);
            }
            // ctx.fillStyle = `rgba(0,0,0,${tile.height / 30})`;
            // ctx.fillRect(drawX, drawY, tileSize, tileSize);
            if (tile.location !== 'none') {
                ctx.font = '20px serif';
                ctx.fillText(getEmojiForLocation(tile.location), drawX + tileSize / 2, drawY + tileSize / 2);
            }
            if (tile.entity !== 'none') {
                ctx.font = '24px serif';
                ctx.fillText(getEmojiForEntity(tile.entity), drawX + tileSize / 2, drawY + tileSize / 2);
            }
        }
    }
    // Draw player
    let playerX = offsetX + Math.floor(viewWidth / 2) * tileSize + tileSize / 2;
    let playerY = offsetY + Math.floor(viewHeight / 2) * tileSize + tileSize / 2;
    ctx.fillStyle = 'blue';
    ctx.beginPath();
    ctx.arc(playerX, playerY, tileSize / 3, 0, Math.PI * 2);
    ctx.fill();
}

// Update status bar
function updateStatus() {
    document.getElementById('status-bar').innerText = `🪙: ${Math.floor(gold)} 🍞: ${Math.floor(food)} 💧: ${Math.floor(water)} ❤️‍🩹: ${Math.floor(health)} 👥: ${group.length}`;
}

// Get group bonus
function getGroupBonus(type) {
    return group.reduce((total, g) => total + (g.bonus[type] || 0), 0);
}

// Get number of carriers
function getNumCarriers() {
    return group.filter(g => g.role === 'carrier').length;
}

// Get max storage for food and water
function getMaxStorage() {
    return 50 * group.length + 50 * getNumCarriers() + 200 * carts;
}

// Time-based consumption
function timeConsumption() {
    let now = Date.now();
    let delta_real = now - last_consume_time;
    let delta_game = delta_real * acceleration;
    let days_fraction = delta_game / (86400 * 1000);
    food -= days_fraction * group.length * (1 - getGroupBonus('food'));
    water -= days_fraction * group.length;
    gold -= days_fraction * group.length * 0.5;
    if (Math.random() < 0.05 * days_fraction) {
        tents = Math.max(0, tents - 1);
    }
    last_consume_time = now;
}

// Update resources on move (gathering only)
function updateResources(tile) {
    food += tile.flora * 0.1 * (1 + getGroupBonus('plant'));
    food = Math.min(food, getMaxStorage());
    if (Math.random() < 0.05 * (1 + getGroupBonus('resource'))) wood += 1;
    water = Math.min(water, getMaxStorage());
}

// Handle combat
function handleCombat(ex, ey, isOnTile = false) {
    let tile = getTile(ex, ey);
    let entity = tile.entity;
    let input = prompt(`Hostile ${entity} at (${ex},${ey})! 1:⚔️ Attack, 2:🌬️ Flee`);
    if (input === '2') {
        if (isOnTile) {
            px = prevx;
            py = prevy;
            alert('Fled back. 😵‍💫');
        } else {
            alert('Fled, staying put. 😅');
        }
        return false;
    }
    let combatBonus = getGroupBonus('combat');
    let success = Math.random() < 0.5 + combatBonus;
    if (success) {
        alert('Victory! 🏆');
        killed.add(`${ex},${ey}`);
        killPoints += 5;
        logEvent(`🏆 Defeated ${entity} at (${ex},${ey})`);
        return true;
    } else {
        alert('Defeat! Took damage.🤕');
        health -= isOnTile ? 20 : 10;
        logEvent(`🤕 Defeated by ${entity} at (${ex},${ey})`);
        return false;
    }
}

// Check adjacent monsters
function checkAdjacentMonsters() {
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            if (dx === 0 && dy === 0) continue;
            let tile = getTile(px + dx, py + dy);
            if (tile.entity === 'monster' || tile.entity === 'beast') {
                handleCombat(px + dx, py + dy);
            }
        }
    }
}

// Check tile interaction
function checkTileInteraction(tile) {
    if (['monster', 'beast'].includes(tile.entity)) {
        handleCombat(px, py, true);
        return;
    }
    if (tile.location !== 'none' || tile.entity !== 'none') {
        if (['waterfalls', 'canyon', 'geyser', 'peaks', 'monster caves', 'cave', 'ruin'].includes(tile.location)) {
            discoverPoints += 10;
            alert(`Discovered ${tile.location}! 🌟`);
            logEvent(`🌟 Discovered ${tile.location} at (${px},${py})`);
        }
        let options = ['1: 🚶 Leave'];
        if (['camp', 'outpost'].includes(tile.location)) options.push('2: 😴 Rest');
        if (['outpost', 'hamlet', 'village', 'city'].includes(tile.location) || ['trader', 'caravan'].includes(tile.entity)) {
            options.push('3: 🪙 Trade');
            options.push('4: 🧍🏻 Hire');
        }
        if (tile.location === 'city') options.push('5: 🪙 Sell discoveries');
        if (tile.location === 'village') options.push('6: 🏹 Sell hunts');
        let msg = `At ${tile.location} ${tile.entity}\n${options.join('\n')}`;
        let choice = prompt(msg);
        handleChoice(choice, tile);
    }
}

// Handle interaction choice
function handleChoice(choice, tile) {
    if (choice === '2') { // Rest
        health = Math.min(100, health + 10 * (1 + getGroupBonus('health')));
        food -= group.length * 0.5;
        water -= group.length * 0.5;
        alert('Rested. 😴');
        logEvent('😴 Rested');
    } else if (choice === '3') { // Trade
        let t = prompt('1: 📥 Buy food 🍞 (10 for 10g), 2: 📥 Buy water 💧 (10 for 10g), 3: 📤 Sell wood 🪵 (5 for 10g), 4: 📥 Buy cart 🛒 (100g for 1)');
        let tradeDesc = '';
        let max_storage = getMaxStorage();
        if (t === '1' && gold >= 10 && food + 10 <= max_storage) { 
            food += 10; 
            gold -= 10; 
            tradeDesc = '📥 Bought 10 food 🍞 for 10g'; 
        } else if (t === '1') {
            alert('Not enough gold or storage! ⚠️');
        }
        if (t === '2' && gold >= 10 && water + 10 <= max_storage) { 
            water += 10; 
            gold -= 10; 
            tradeDesc = '📥 Bought 10 water 💧 for 10g'; 
        } else if (t === '2') {
            alert('Not enough gold or storage! ⚠️');
        }
        if (t === '3' && wood >= 5) { 
            wood -= 5; 
            gold += 10; 
            tradeDesc = '📤 Sold 5 wood 🪵 for 10g'; 
        } else if (t === '3') {
            alert('Not enough wood! ⚠️');
        }
        if (t === '4' && gold >= 100) { 
            carts += 1; 
            gold -= 100; 
            tradeDesc = '📥 Bought cart 🛒 for 100g'; 
        } else if (t === '4') {
            alert('Not enough gold! ⚠️');
        }
        if (tradeDesc) {
            logEvent(tradeDesc);
        }
    } else if (choice === '4') { // Hire
        const roles = ['native-guide👲🏻', 'cook🧑🏻‍🍳', 'guard💂🏻', 'geologist🧑🏻‍🔬', 'biologist🧑🏻‍🔬', 'translator👳🏻', 'carrier🧑🏻‍🔧', 'medic🧑🏻‍⚕️', 'navigator🧑🏻‍✈️'];
        let hires = [];
        for (let i = 0; i < 3; i++) {
            let r = roles[Math.floor(Math.random() * roles.length)];
            let cost = 50 + Math.floor(Math.random() * 50);
            hires.push(`${i+1}: ${r} for ${cost}g`);
        }
        let c = prompt(hires.join('\n'));
        if (c && ['1','2','3'].includes(c)) {
            let idx = parseInt(c) - 1;
            let [ , role, , costStr ] = hires[idx].split(' ');
            let cost = parseInt(costStr);
            if (gold >= cost) {
                group.push({role, bonus: getBonusForRole(role)});
                gold -= cost;
                alert(`Hired ${role}! 👏`);
                logEvent(`🧍🏻 Hired ${role} for ${cost}g`);
            } else alert('Not enough gold! ⚠️');
        }
    } else if (choice === '5') { // Sell discoveries
        gold += discoverPoints;
        logEvent(`🪙 Sold discoveries for ${discoverPoints}g`);
        discoverPoints = 0;
        alert('Sold discoveries! 🪙');
    } else if (choice === '6') { // Sell hunts
        gold += killPoints;
        logEvent(`🪙 Sold hunts for ${killPoints}g`);
        killPoints = 0;
        alert('Sold hunts! 🪙');
    }
}

function getBonusForRole(role) {
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

// Reveal tiles within view distance
function revealAround() {
    let currentViewDist = viewDist + Math.floor(getGroupBonus('view'));
    for (let ddx = -currentViewDist; ddx <= currentViewDist; ddx++) {
        for (let ddy = -currentViewDist; ddy <= currentViewDist; ddy++) {
            if (Math.sqrt(ddx * ddx + ddy * ddy) <= currentViewDist) {
                visited.add(`${px + ddx},${py + ddy}`);
            }
        }
    }
}

// Movement function
function move(dx, dy) {
    if (cooldown) return;
    cooldown = true;
    moving = true;
    moveStartTime = performance.now();
    let tx = px + dx;
    let ty = py + dy;
    let tile = getTile(tx, ty);
    let navigationBonus = getGroupBonus('navigation');
    group.forEach(g => {
        if (g.role === 'navigator' && tile.terrain === 'dirt' && tile.flora < 6) {
            navigationBonus += 0.2;
        } else if (g.role === 'native-guide' && tile.flora >= 6) {
            navigationBonus += 0.2;
        } else if (g.role === 'explorer' && tile.location !== 'none' && tile.flora < 3) {
            navigationBonus += 0.2;
        }
    });
    let baseDuration = (400 + tile.inclination * 80 + tile.flora * 40) * (1 - navigationBonus);
    let loadFactor = (food + water) / getMaxStorage();
    moveDuration = baseDuration * (1 + loadFactor * 0.5);
    moveDx = dx;
    moveDy = dy;
}

// Button listeners (use click for tap)
const directions = [
    {id: 'btn-n', dx: 0, dy: -1},
    {id: 'btn-ne', dx: 1, dy: -1},
    {id: 'btn-e', dx: 1, dy: 0},
    {id: 'btn-se', dx: 1, dy: 1},
    {id: 'btn-s', dx: 0, dy: 1},
    {id: 'btn-sw', dx: -1, dy: 1},
    {id: 'btn-w', dx: -1, dy: 0},
    {id: 'btn-nw', dx: -1, dy: -1}
];
directions.forEach(dir => {
    document.getElementById(dir.id).addEventListener('click', () => move(dir.dx, dir.dy));
});

// Show menu function
function showMenu() {
    let inv = `❤️‍🩹 Health: ${health} 🪙 Gold: ${gold} 🍞 Food: ${food.toFixed(1)} 💧 Water: ${water.toFixed(1)} ⛺ Tents: ${tents} 🧱 Mats: ${building_mats} 🪵 Wood: ${wood}`;
    let grp = group.map(g => g.role).join(', ');
    let msg = `${inv}\n👥 Group: ${grp}\n1: ❌ Close, 2: 🏗️ Build camp ⛺ (5 🧱 mats, 5 🪵 wood), 3: 🏗️ Build outpost 🏕️ (10 🧱 mats, 10 🪵 wood)`;
    let choice = prompt(msg);
    if (choice === '2' || choice === '3') {
        let costMats = choice === '2' ? 5 : 10;
        let costWood = choice === '2' ? 5 : 10;
        let type = choice === '2' ? 'camp' : 'outpost';
        if (building_mats >= costMats && wood >= costWood) {
            let dirStr = prompt('Direction: N NE E SE S SW W NW');
            const dmap = {
                'N': {dx:0,dy:-1}, 'NE':{dx:1,dy:-1}, 'E':{dx:1,dy:0}, 'SE':{dx:1,dy:1},
                'S':{dx:0,dy:1}, 'SW':{dx:-1,dy:1}, 'W':{dx:-1,dy:0}, 'NW':{dx:-1,dy:-1}
            };
            let d = dmap[dirStr ? dirStr.toUpperCase() : ''];
            if (d) {
                let bx = px + d.dx;
                let by = py + d.dy;
                let btile = getTile(bx, by);
                if (btile.location === 'none' && btile.entity === 'none') {
                    changed.push({x: bx, y: by, type});
                    building_mats -= costMats;
                    wood -= costWood;
                    alert(`Built ${type}! 🏗️`);
                    logEvent(`🏗️ Built ${type} at (${bx},${by})`);
                } else alert('Cannot build there. 🚫');
            } else alert('Invalid direction. ❓');
        } else alert('Not enough materials! ⚠️');
    }
}

// Tap on player for menu
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    let rect = canvas.getBoundingClientRect();
    let touchX = e.touches[0].clientX - rect.left;
    let touchY = e.touches[0].clientY - rect.top;
    let vx = Math.floor((touchX - offsetX) / tileSize);
    let vy = Math.floor((touchY - offsetY) / tileSize);
    let centerV = Math.floor(viewWidth / 2);
    if (vx === centerV && vy === centerV) {
        showMenu();
    }
});

// Tap on status bar for menu
document.getElementById('status-bar').addEventListener('touchstart', (e) => {
    e.preventDefault();
    showMenu();
});

// Tap on date bar for events
document.getElementById('date-bar').addEventListener('touchstart', (e) => {
    e.preventDefault();
    const list = events.map(ev => `${ev.date}: ${ev.desc}`).join('\n');
    alert(list || 'No events yet. 📜');
});

// Update date bar
setInterval(() => {
    document.getElementById('date-bar').innerText = getCurrentGameDate().toLocaleString();
}, 1000);

// Time consumption interval
setInterval(timeConsumption, 1000);

// Initial reveal at start
revealAround();

// Game loop
function loop() {
    let offsetDeltaX = 0;
    let offsetDeltaY = 0;
    if (moving) {
        let now = performance.now();
        let fraction = (now - moveStartTime) / moveDuration;
        if (fraction >= 1) {
            fraction = 1;
            moving = false;
            prevx = px;
            prevy = py;
            px += moveDx;
            py += moveDy;
            visited.add(`${px},${py}`);
            revealAround();
            let tile = getTile(px, py);
            updateResources(tile);
            checkAdjacentMonsters();
            checkTileInteraction(tile);
            if (health <= 0 || gold < -50) {
                alert('Game Over! ☠️');
                // Reset game (simple)
                location.reload();
            }
            cooldown = false;
        }
        offsetDeltaX = -fraction * moveDx * tileSize;
        offsetDeltaY = -fraction * moveDy * tileSize;
    }
    draw(offsetDeltaX, offsetDeltaY);
    updateStatus();
    requestAnimationFrame(loop);
}
loop();