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

    if(gameState.killed.has(key)) {
        let tile = gameState.visited.get(key);
        tile.entity = 'none';
        return tile;
    }
    if(gameState.visited.has(key)) {
        return gameState.visited.get(key);
    }

    let biome = getBiome(x, y);
    let change = gameState.changed.find(t => t.x === x && t.y === y);
    
    let entity = 'none';
    if(!gameState.killed.has(key)) {
        let h3 = hash(x, y, 3);
    if (h3 < 0.05) {
        const entities = ['monster', 'beast', 'animal', 'npc', 'group', 'army', 'trader', 'caravan'];
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
    let terrain = height < 3 ? 'sand' : height < 6 ? 'dirt' : 'rock';

    let location = change ? change.type : 'none';
    if (location === 'none') {
        let h1 = hash(x, y, 1);
        let locations = [];
        if (biome === 'desert' && terrain === 'rock') {
            if (h1 < 0.2) { // 20% chance for peaks in desert rock
                locations = ['peaks', 'peaks', 'peaks', 'volcano', 'canyon', 'geyser', 'monster caves', 'outpost']; // Bias toward peaks
            }
        } else if (terrain === 'sand') {
            if (h1 < 0.05) {
                locations = ['ruin', 'camp', 'farm', 'outpost', 'hamlet', 'village', 'city'];
            }
        } else if (terrain === 'dirt') {
            if (h1 < 0.05) {
                locations = ['cave', 'ruin', 'camp', 'farm', 'outpost', 'camp', 'hamlet', 'ruin', 'village', 'city'];
            }
        } else if (terrain === 'rock') {
            if (h1 < 0.05) {
                locations = ['waterfalls', 'outpost', 'volcano', 'geyser', 'cave', 'ruin', 'monster caves', 'camp'];
            } else {
                locations = ['peaks'];
            }
        }
        if (locations.length > 0) {
            location = locations[Math.floor(hash(x, y, 2) * locations.length)];
        }
    }
    // Determine flora type based on biome if flora is present
    let flora_type = 'none';
    if (flora > 5) {
        biome = getBiome(x, y);
        let flora_options = [];
        if (biome === 'temperate' && terrain === 'dirt') {
            flora_options = ['oak', 'iris', 'tulip', 'sun-flower', 'oak'];
        } else if (biome === 'temperate' && terrain === 'sand') {
            flora_options = ['dead-tree', 'sun-flower'];
        } else if (biome === 'taiga' && terrain === 'dirt') {
            flora_options = ['pine', 'mushroom', 'tulip', 'pine'];
        } else if (biome === 'taiga' && terrain === 'sand') {
            flora_options = ['dead-tree'];
        } else if (biome === 'desert' && terrain === 'dirt') {
            flora_options = ['palm', 'cactus', 'tulip'];
        } else if (biome === 'desert' && terrain === 'sand') {
            flora_options = ['cactus', 'dead-tree'];
        }
        if (flora_options.length > 0) {
            flora_type = flora_options[Math.floor(hash(x, y, 7) * flora_options.length)];
        }
    }

    let color = 'red';
    let r = Math.random();
    if(biome === 'temperate') {
        if(terrain === 'sand') {
            if(r < 0.25) {
                color = '#AACC00';
            } else if(r < 0.5) {
                color = '#80B918';
            } else if(r < 0.75) {
                color = '#55a630';
            } else {
                color = '#BFD200';
            }
        } else if(terrain === 'dirt') {
            if(r < 0.25) {
                color = '#AACC00';
            } else if(r < 0.5) {
                color = '#80B918';
            } else if(r < 0.75) {
                color = '#55a630';
            } else {
                color = '#2b9348';
            }            
        } else {
            if(r < 0.25) {
                color = '#174424';
            } else if(r < 0.5) {
                color = '#1b2e1b';
            } else if(r < 0.75) {
                color = '#1B1E15';
            } else {
                color = '#0b2312';
            }
        }
    } else if(biome === 'taiga') {
        if(terrain === 'sand') {
            if(r < 0.25) {
                color = '#191611';
            } else if(r < 0.5) {
                color = '#1B1E15';
            } else {
                color = '#1C2618';
            }
        } else if(terrain === 'dirt') {
            if(r < 0.25) {
                color = '#191611';
            } else if(r < 0.5) {
                color = '#1B1E15';
            } else {
                color = '#1C2618';
            }
        } else {
            if(r < 0.33) {
                color = '#191611';
            } else if(r < 0.66) {
                color = '#1B1E15';
            } else { 
                color = '#1C2618';
            }
        }
    } else if(biome === 'desert') {
        if(terrain === 'sand') {
            if(r < 0.25) {
                color = '#AACC00';
            } else if(r < 0.5) {
                color = '#80B918';
            } else if(r < 0.75) {
                color = '#D4D700';
            } else {
                color = '#BFD200';
            }
        } else if(terrain === 'dirt') {
            if(r < 0.25) {
                color = '#AACC00';
            } else if(r < 0.5) {
                color = '#80B918';
            } else if(r < 0.75) {
                color = '#D4D700';
            } else {
                color = '#BFD200';
            }
        } else {
            if(r < 0.33) {
                color = '#191611';
            } else if(r < 0.66) {
                color = '#1B1E15';
            } else {
                color = '#1C2618';
            }
        }
    }

    const tile = { height, inclination, terrain, flora, location, entity, flora_type, biome, color };
    if(gameState.visited.has(key)) {
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
        'waterfalls': '🏞️','volcano':'🌋', 'canyon': '⛰️', 'geyser': '🗻', 'peaks': '🏔️',
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
    // Get individual role bonuses
    const roleBonus = gameState.group.reduce((total, g) => {
        // Safely handle missing bonus properties
        const memberBonus = g.bonus || {};
        return total + (memberBonus[type] || 0);
    }, 0);
    
    // Add the groupBonus modifier
    const groupModifier = gameState.groupBonus[type] || 0;
    const total = roleBonus + groupModifier;
    
    // if (type === 'discovery' || type === 'carry') {
    //     console.log(`getGroupBonus(${type}): roleBonus=${roleBonus}, groupModifier=${groupModifier}, total=${total}`);
    // }
    
    return total;
}

export function getNumCarriers() {
    return gameState.group.filter(g => g.role.replace(/[^\w-]/g, '') === 'carrier').length;
}

export function getMaxStorage() {
    // Base storage: 50 per person + 50 per carrier + 200 per cart
    let baseStorage = 10 * gameState.group.length + 24 * getNumCarriers() + 200 * gameState.carts;
    
    // Apply carry bonus for additional storage capacity
    let carryBonus = gameState.groupBonus.carry || 0;
    let bonusStorage = Math.floor(baseStorage * carryBonus);
    
    return baseStorage + bonusStorage;
}


export function getBonusForRole(role) {
    // Strip emojis from role names for matching
    const cleanRole = role.replace(/[^\w-]/g, '');
    
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
    return bonuses[cleanRole] || {};
}

export function updateGroupBonus() {
    console.log('updateGroupBonus called');
    console.log('Current group:', gameState.group);
    
    // Ensure all group members have proper bonus properties
    ensureGroupBonuses();
    
    // Reset all bonuses
    Object.keys(gameState.groupBonus).forEach(key => {
        gameState.groupBonus[key] = 0;
    });
    
    // Calculate group bonuses based on role composition
    let roleCounts = {};
    gameState.group.forEach(member => {
        // Strip emojis from role names for matching
        const cleanRole = member.role.replace(/[^\w-]/g, '');
        roleCounts[cleanRole] = (roleCounts[cleanRole] || 0) + 1;
        console.log(`Member: ${member.role} -> Clean: ${cleanRole}`);
    });
    
    console.log('Role counts (cleaned):', roleCounts);
    
    // Apply bonuses based on role combinations with scaling
    if (roleCounts['native-guide'] >= 1) {
        gameState.groupBonus.navigation += 0.3;
        console.log(`Added navigation bonus: +0.3 (1+ native-guide)`);
        // Additional bonus for multiple guides
        if (roleCounts['native-guide'] >= 2) {
            gameState.groupBonus.navigation += 0.2;
            console.log(`Added navigation bonus: +0.2 (2+ native-guide)`);
        }
        if (roleCounts['native-guide'] >= 3) {
            gameState.groupBonus.navigation += 0.1;
            console.log(`Added navigation bonus: +0.1 (3+ native-guide)`);
        }
    }
    
    if (roleCounts['explorer'] >= 1) {
        gameState.groupBonus.discovery += 0.4;
        console.log(`Added discovery bonus: +0.4 (1+ explorer)`);
        // Additional bonus for multiple explorers
        if (roleCounts['explorer'] >= 2) {
            gameState.groupBonus.discovery += 0.3;
            console.log(`Added discovery bonus: +0.3 (2+ explorer)`);
        }
        if (roleCounts['explorer'] >= 3) {
            gameState.groupBonus.discovery += 0.2;
            console.log(`Added discovery bonus: +0.2 (3+ explorer)`);
        }
    }
    
    if (roleCounts['cook'] >= 1) {
        gameState.groupBonus.food += 0.3;
        console.log(`Added food bonus: +0.3 (1+ cook)`);
        // Additional bonus for multiple cooks
        if (roleCounts['cook'] >= 2) {
            gameState.groupBonus.food += 0.2;
            console.log(`Added food bonus: +0.2 (2+ cook)`);
        }
        if (roleCounts['cook'] >= 3) {
            gameState.groupBonus.food += 0.1;
            console.log(`Added food bonus: +0.1 (3+ cook)`);
        }
    }
    
    if (roleCounts['guard'] >= 1) {
        gameState.groupBonus.combat += 0.4;
        console.log(`Added combat bonus: +0.4 (1+ guard)`);
        // Additional bonus for multiple guards
        if (roleCounts['guard'] >= 2) {
            gameState.groupBonus.combat += 0.3;
            console.log(`Added combat bonus: +0.3 (2+ guard)`);
        }
        if (roleCounts['guard'] >= 3) {
            gameState.groupBonus.combat += 0.2;
            console.log(`Added combat bonus: +0.2 (3+ guard)`);
        }
    }
    
    if (roleCounts['geologist'] >= 1) {
        gameState.groupBonus.resource += 0.3;
        console.log(`Added resource bonus: +0.3 (1+ geologist)`);
        // Additional bonus for multiple geologists
        if (roleCounts['geologist'] >= 2) {
            gameState.groupBonus.resource += 0.2;
            console.log(`Added resource bonus: +0.2 (2+ geologist)`);
        }
        if (roleCounts['geologist'] >= 3) {
            gameState.groupBonus.resource += 0.1;
            console.log(`Added resource bonus: +0.1 (3+ geologist)`);
        }
    }
    
    if (roleCounts['biologist'] >= 1) {
        gameState.groupBonus.plant += 0.3;
        console.log(`Added plant bonus: +0.3 (1+ biologist)`);
        // Additional bonus for multiple biologists
        if (roleCounts['biologist'] >= 2) {
            gameState.groupBonus.plant += 0.2;
            console.log(`Added plant bonus: +0.2 (2+ biologist)`);
        }
        if (roleCounts['biologist'] >= 3) {
            gameState.groupBonus.plant += 0.1;
            console.log(`Added plant bonus: +0.1 (3+ biologist)`);
        }
    }
    
    if (roleCounts['translator'] >= 1) {
        gameState.groupBonus.interact += 0.3;
        console.log(`Added interact bonus: +0.3 (1+ translator)`);
        // Additional bonus for multiple translators
        if (roleCounts['translator'] >= 2) {
            gameState.groupBonus.interact += 0.2;
            console.log(`Added interact bonus: +0.2 (2+ translator)`);
        }
        if (roleCounts['translator'] >= 3) {
            gameState.groupBonus.interact += 0.1;
            console.log(`Added interact bonus: +0.1 (3+ translator)`);
        }
    }
    
    if (roleCounts['carrier'] >= 1) {
        gameState.groupBonus.carry += 0.4;
        console.log(`Added carry bonus: +0.4 (1+ carrier)`);
        // Additional bonus for multiple carriers
        if (roleCounts['carrier'] >= 2) {
            gameState.groupBonus.carry += 0.3;
            console.log(`Added carry bonus: +0.3 (2+ carrier)`);
        }
        if (roleCounts['carrier'] >= 3) {
            gameState.groupBonus.carry += 0.2;
            console.log(`Added carry bonus: +0.2 (3+ carrier)`);
        }
    }
    
    if (roleCounts['medic'] >= 1) {
        gameState.groupBonus.health += 0.4;
        console.log(`Added health bonus: +0.4 (1+ medic)`);
        // Additional bonus for multiple medics
        if (roleCounts['medic'] >= 2) {
            gameState.groupBonus.health += 0.3;
            console.log(`Added health bonus: +0.3 (2+ medic)`);
        }
        if (roleCounts['medic'] >= 3) {
            gameState.groupBonus.health += 0.2;
            console.log(`Added health bonus: +0.2 (3+ medic)`);
        }
    }
    
    if (roleCounts['navigator'] >= 1) {
        gameState.groupBonus.view += 1;
        console.log(`Added view bonus: +1 (1+ navigator)`);
        // Additional bonus for multiple navigators
        if (roleCounts['navigator'] >= 2) {
            gameState.groupBonus.view += 0.5;
            console.log(`Added view bonus: +0.5 (2+ navigator)`);
        }
        if (roleCounts['navigator'] >= 3) {
            gameState.groupBonus.view += 0.25;
            console.log(`Added view bonus: +0.25 (3+ navigator)`);
        }
    }
    
    // Special combination bonuses
    if (roleCounts['native-guide'] && roleCounts['navigator']) {
        gameState.groupBonus.navigation += 0.2;
        console.log(`Added navigation bonus: +0.2 (native-guide + navigator combo)`);
    }
    if (roleCounts['geologist'] && roleCounts['biologist']) {
        gameState.groupBonus.resource += 0.2;
        gameState.groupBonus.plant += 0.2;
        console.log(`Added resource/plant bonus: +0.2 (geologist + biologist combo)`);
    }
    if (roleCounts['medic'] && roleCounts['guard']) {
        gameState.groupBonus.health += 0.2;
        gameState.groupBonus.combat += 0.2;
        console.log(`Added health/combat bonus: +0.2 (medic + guard combo)`);
    }
    
    console.log('Final groupBonus:', gameState.groupBonus);
}

// In utils.js
export function colorToRGB(color) {
    const ctx = document.createElement('canvas').getContext('2d');
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return { r, g, b };
}

export function interpolateColor(color1, color2, factor) {
    const c1 = typeof color1 === 'string' ? colorToRGB(color1) : color1;
    const c2 = typeof color2 === 'string' ? colorToRGB(color2) : color2;
    const r = Math.round(c1.r + (c2.r - c1.r) * factor);
    const g = Math.round(c1.g + (c2.g - c1.g) * factor);
    const b = Math.round(c1.b + (c2.b - c1.b) * factor);
    return `rgb(${r}, ${g}, ${b})`;
}

// Function to ensure all group members have proper bonus properties
export function ensureGroupBonuses() {
    gameState.group.forEach(member => {
        if (!member.bonus || typeof member.bonus !== 'object') {
            member.bonus = getBonusForRole(member.role);
            console.log(`Fixed missing bonus for ${member.role}:`, member.bonus);
        }
    });
}

export function getEnhancedBonusForRole(role) {
    // Strip emojis from role names for matching
    const cleanRole = role.replace(/[^\w-]/g, '');
    
    // Define possible enhanced bonuses for each role
    const enhancedBonuses = {
        'native-guide': [
            {type: 'navigation', value: 0.3, description: 'Expert Navigation'},
            {type: 'view', value: 0.5, description: 'Eagle Eyes'},
            {type: 'discovery', value: 0.2, description: 'Pathfinder'}
        ],
        'explorer': [
            {type: 'discovery', value: 0.3, description: 'Master Explorer'},
            {type: 'navigation', value: 0.2, description: 'Trail Blazer'},
            {type: 'view', value: 0.5, description: 'Scout Vision'}
        ],
        'cook': [
            {type: 'food', value: 0.3, description: 'Master Chef'},
            {type: 'health', value: 0.2, description: 'Nutritionist'},
            {type: 'carry', value: 0.1, description: 'Kitchen Master'}
        ],
        'guard': [
            {type: 'combat', value: 0.3, description: 'Elite Guard'},
            {type: 'health', value: 0.2, description: 'Iron Will'},
            {type: 'view', value: 0.3, description: 'Vigilant'}
        ],
        'geologist': [
            {type: 'resource', value: 0.3, description: 'Master Geologist'},
            {type: 'discovery', value: 0.2, description: 'Mineral Expert'},
            {type: 'carry', value: 0.1, description: 'Rock Hauler'}
        ],
        'biologist': [
            {type: 'plant', value: 0.3, description: 'Master Biologist'},
            {type: 'food', value: 0.2, description: 'Herbalist'},
            {type: 'health', value: 0.1, description: 'Natural Healer'}
        ],
        'translator': [
            {type: 'interact', value: 0.3, description: 'Master Translator'},
            {type: 'discovery', value: 0.2, description: 'Cultural Expert'},
            {type: 'navigation', value: 0.1, description: 'Local Knowledge'}
        ],
        'carrier': [
            {type: 'carry', value: 0.3, description: 'Master Carrier'},
            {type: 'health', value: 0.2, description: 'Iron Back'},
            {type: 'combat', value: 0.1, description: 'Pack Defender'}
        ],
        'medic': [
            {type: 'health', value: 0.3, description: 'Master Medic'},
            {type: 'combat', value: 0.2, description: 'Battle Medic'},
            {type: 'food', value: 0.1, description: 'Dietician'}
        ],
        'navigator': [
            {type: 'view', value: 1.5, description: 'Master Navigator'},
            {type: 'navigation', value: 0.3, description: 'Path Master'},
            {type: 'discovery', value: 0.2, description: 'Terrain Expert'}
        ]
    };
    
    // Get the possible bonuses for this role
    const possibleBonuses = enhancedBonuses[cleanRole] || [];
    
    if (possibleBonuses.length === 0) {
        // Fallback: give a random bonus
        const allBonusTypes = ['navigation', 'discovery', 'food', 'combat', 'resource', 'plant', 'interact', 'carry', 'health', 'view'];
        const randomType = allBonusTypes[Math.floor(Math.random() * allBonusTypes.length)];
        return {
            type: randomType,
            value: 0.2 + Math.random() * 0.3, // 0.2 to 0.5
            description: 'Natural Talent'
        };
    }
    
    // Return a random enhanced bonus for this role
    return possibleBonuses[Math.floor(Math.random() * possibleBonuses.length)];
}

export async function checkDeath() {
    if (gameState.health <= 0) {
        return 'health';
    } else if (gameState.gold < -50) {
        return 'gold';
    }
}