# **PROJECT MANAGEMENT PLAN**

## **Group System Transformation: From Roles to Character Stats**

### **PROJECT OVERVIEW**

Transform the simple role-based group system into a complex character progression system with stats, skills, classes, equipment, and character history.

**Current System:** Simple role-based objects with basic bonuses
**Target System:** Rich character progression with stats, skills, classes, equipment, and history

---

## **PHASE 1: FOUNDATION SYSTEMS**

_Estimated Time: 2-3 days_

### **1.1 Class Database Creation**

**File:** `interactions/combat/classes.js`
**Dependencies:** None
**Deliverables:**

- 18 class definitions (fighter, archer, brute, monk, cleric, geomancer, pyromancer, necromancer, articaster, martial-artist, ranger, explorer, paladin, alchemist, herbalist, hunter, dungeondiver, craftsman)
- Each class with stat bonuses per level
- Starting skills for each class
- Class-specific equipment preferences

**Tasks:**

- ✅ Define class stat bonus progression (e.g., Fighter: +1 STR, +1 CON, +1 DEX per level)
- ✅ Assign starting skills to each class
- ✅ Create class rarity system
- ✅ Add class descriptions and lore

### **1.2 Skill System Creation**

**File:** `interactions/skills.js`
**Dependencies:** None
**Deliverables:**

- 30+ skills across 4 categories (Combat, Exploration, Crafting, Social)
- Skill leveling mechanics (0.01-99.99 format)
- Skill-to-bonus calculation functions
- Skill progression difficulty scaling

**Tasks:**

- ✅ Define all skill names and categories (30+ skills across 7 categories)
- ✅ Implement skill leveling algorithm (0.01-99.99 format with exponential XP)
- ✅ Create skill progression difficulty curve (easy/medium/hard with multipliers)
- ✅ Add skill prerequisites and synergies
- ✅ Create skill-to-bonus mapping functions for game systems
- ✅ Implement skill experience and progression mechanics

### **1.3 Equipment System Creation**

**File:** `interactions/equipment.js`
**Dependencies:** None
**Deliverables:**

- Equipment database with status/material/quality/type structure
- Equipment skill bonuses
- Equipment durability system
- Equipment slot management (armor, weapon, tool)

**Tasks:**

- ✅ Define equipment status levels (item-specific: Clothes, Armor, Weapons, General Items)
- ✅ Define material types (cloth, leather, iron, steel, silver, gold, mithril)
- ✅ Define quality levels (poor, common, noble, legendary, mythic)
- ✅ Define equipment types (armor, weapon, tool, accessory)
- ✅ Create equipment skill bonus mappings with flat bonuses and synergy bonuses
- ✅ Implement equipment durability system with repair mechanics
- ✅ Create equipment slot management and set bonuses
- ✅ Implement equipment generation and procedural creation

### **1.4 Character Generation System**

**File:** `interactions/characterGeneration.js`
**Dependencies:** Classes, Skills, Equipment
**Deliverables:**

- Point allocation system (10 points with escalating costs)
- Procedural character creation
- Stat calculation with class bonuses
- Equipment assignment
- Race system with 11 races and regional origins
- Malus system (3 malus points = 2 bonus points)
- Enhanced character creation dialogs with race selection
- Player-specific starting equipment (clothes, weapon, skill kit)
- Skill kit system for all 48+ skills
- Error handling and fallback systems
- Dialog value extraction fixes

**Tasks:**

- ✅ Implement point allocation algorithm
- ✅ Create stat generation with randomization
- ✅ Integrate class bonuses into final stats
- ✅ Add equipment assignment logic
- ✅ Implement race system with stat/skill bonuses
- ✅ Add malus system for point allocation
- ✅ Create enhanced character creation dialogs
- ✅ Implement player starting equipment system
- ✅ Add skill kit mapping for all skills
- ✅ Fix dialog value extraction issues
- ✅ Add error handling and fallback systems
- ✅ Fix character acceptance dialog flow

### **1.4.1 Character Generation System Enhancements & Fixes**

**Files Modified:** `interactions/characterGeneration.js`, `interactions/charCreationDialog.js`, `interactions/showDialog.js`, `interactions/equipment.js`, `main.js`

**Enhancements Made:**

- **Race System Implementation**: Complete 11-race system with regional origins, stat bonuses, and skill bonuses
- **Malus System**: 3 malus points = 2 bonus points for flexible stat allocation
- **Player Starting Equipment**: Players get clothes + weapon + 1 skill kit (NPCs get random equipment)
- **Skill Kit System**: 48+ skill kits added to equipment system for all skills
- **Enhanced Dialog System**: Added select, checkbox, and number input components to showDialog.js
- **Character Creation Options**: 5 different character creation methods (random, point allocation, class selection, race selection, full custom)
- **Default Value Support**: Select elements now support defaultValue for better UX

**Bug Fixes Applied:**

- **Dialog Value Extraction**: Fixed getDialogValue function to properly handle empty strings
- **Character Acceptance Flow**: Fixed dialog restart issue when accepting characters
- **Race Selection Error**: Fixed "Race data not found" error with proper fallback handling
- **Select Element Defaults**: Fixed select elements not having default selections
- **Error Handling**: Added comprehensive error handling and fallback systems

**Technical Improvements:**

- **Error Handling**: Added try-catch blocks and fallback mechanisms
- **Debug Logging**: Added comprehensive debugging for troubleshooting
- **Code Organization**: Improved function structure and error handling
- **Integration**: Proper integration with main.js character creation loop

### **1.5 Gender and Name Generation System**

**Files:** `interactions/characterGeneration.js`, `interactions/charCreationDialog.js`
**Dependencies:** Race System
**Deliverables:**

- Gender system with race-specific stat bonuses
- Race-gender specific name databases
- Gender selection in character creation flow
- Updated character data structure with gender field
- 70/30 male/female random distribution

**Tasks:**

- ✅ Add gender field to character data structure
- ✅ Create race-gender bonus system (male: 1-2 bonus + 1 malus, female: 2-3 bonus + 1 malus)
- ✅ Implement gender-specific stat bonuses for all 11 races
- ✅ Create first name lists (30+ names per race-gender combination)
- ✅ Create last name lists (40+ names per race)
- ✅ Update character generation functions to include gender
- ✅ Add gender selection step in character creation dialog
- ✅ Update character preview to display gender
- ✅ Implement 70/30 male/female random distribution
- ✅ Update character creation flow: Race → Gender → Name → Surname → Class → Stats

### **1.5.1 Equipment System Refactoring**

**Files:** `interactions/equipment.js`, `interactions/characterGeneration.js`
**Dependencies:** Equipment System
**Deliverables:**

- Refactor equipment display format to: `status material rarity [type]`
- Update equipment generation to use new format
- Implement proper equipment parsing and display
- Create specialized class kits for realistic starting equipment
- Implement starting equipment rules for different class types

**Tasks:**

- ✅ Refactor equipment format from "status,material,quality,type" to "status material rarity [type]"
- ✅ Update equipment generation functions to use new format
- ✅ Update equipment display in character preview
- ✅ Implement equipment parsing for new format
- ✅ Update equipment database structure if needed
- ✅ Add whetstone to tool items for martial classes
- ✅ Create comprehensive herbalist kit with harvesting tools
- ✅ Create specialized blacksmithing kit with forge tools
- ✅ Create specialized alchemy kit with laboratory equipment
- ✅ Create specialized leatherworking kit with crafting tools
- ✅ Create specialized tailoring kit with sewing tools
- ✅ Create specialized carpentry kit with woodworking tools
- ✅ Create trader kit with weights and measurement tools
- ✅ Create dungeondiver kit with lockpicking and trap tools
- ✅ Create specialized geomancer kit with earth magic components
- ✅ Create specialized pyromancer kit with fire magic components
- ✅ Create specialized articaster kit with ice magic components
- ✅ Create specialized necromancer kit with death magic components
- ✅ Create meditation kit for monks and clerics
- ✅ Implement starting equipment rules (all characters get clothes, only martial classes get armor)
- ✅ Update character generation to use specialized kits based on class
- ✅ Ensure crafters, explorers, and mages always get appropriate class kits
- ✅ Give martial classes whetstone as their tool

**Equipment Format Implemented:**

```
armor: intact iron common [chainmail-armor]
weapon: pristine steel noble [longsword]
tool: worn leather poor [herbalist-kit]
```

**Specialized Class Kits Created:**

- **Herbalist Kit**: Basket, scythe, gloves, herb bags, drying racks, mortar and pestle, field guides
- **Blacksmithing Kit**: Tongs, hammer, flint and steel, bellows, anvil tools, quenching tank
- **Alchemy Kit**: Alembic, mortar and pestle, phials, retort, distillation apparatus, chemical components
- **Leatherworking Kit**: Awls, needles, thread, cutting knives, leather stamps, tanning tools
- **Tailoring Kit**: Needles, thread, scissors, measuring tools, patterns, fabric samples
- **Carpentry Kit**: Saws, chisels, planes, measuring tools, clamps, woodworking implements
- **Trader Kit**: Precision weights, measurement tools, inspection glasses, scales, coin scales
- **Dungeondiver Kit**: Lockpicks, trap disarming tools, rope, grappling hook, torch, investigation tools
- **Geomancer Kit**: Earth stones, crystal formations, geological hammer, Tome of Stonebinding
- **Pyromancer Kit**: Phoenix feathers, fire crystals, Tome of the Primal Flame, sulfur, charcoal
- **Articaster Kit**: Ice crystals, frost gems, Tome of Eternal Winter, snow quartz
- **Necromancer Kit**: Bone chalk, skull focus, Tome of the Grave, grave dust, black candles
- **Meditation Kit**: Prayer beads, incense, meditation mat, candles, holy symbols, sacred texts

**Starting Equipment Rules Implemented:**

- ✅ All characters always start with clothes (guaranteed)
- ✅ Only martial classes get basic armor (fighter, archer, brute, martial_artist, paladin, cleric, ranger, hunter, dungeondiver)
- ✅ Crafters get specialized crafting kits (herbalist → herbalist kit, craftsman → blacksmithing kit, alchemist → alchemy kit)
- ✅ Explorers get explorer kit (explorer, ranger, hunter) or dungeondiver kit (dungeondiver)
- ✅ Mages get specialized magic school kits (geomancer → geomancer kit, pyromancer → pyromancer kit, etc.)
- ✅ Monks and clerics get meditation kit
- ✅ Martial classes get whetstone as their tool

---

## **PHASE 2: DATA STRUCTURE MIGRATION**

_Estimated Time: 1-2 days_

### **2.1 GameState Structure Update** ✅ **COMPLETED**

**File:** `gamestate/game_variables.js`
**Dependencies:** Character Generation
**Deliverables:**

- ✅ Updated group array structure
- ✅ Character data format
- ✅ Backward compatibility removal

**Tasks:**

- ✅ Update group array to new character format
- ✅ Remove old role-based structure
- ✅ Add character ID system
- ✅ Update groupBonus structure if needed

### **2.2 Bonus Calculation System** ✅ **COMPLETED**

**File:** `utils.js`
**Dependencies:** Skills, Classes
**Deliverables:**

- ✅ New getGroupBonus function
- ✅ Skill-to-bonus mapping
- ✅ Group composition bonuses

**Tasks:**

- ✅ Replace getGroupBonus with skill-based calculation
- ✅ Create skill-to-bonus mapping system
- ✅ Implement group composition bonuses
- ✅ Update updateGroupBonus function

### **2.3 Skill-Bonus Mapping** ✅ **COMPLETED**

**File:** `utils.js` (or new `interactions/skillBonusMapping.js`)
**Dependencies:** Skills
**Deliverables:**

- ✅ Mapping of skills to game bonuses
- ✅ Bonus calculation algorithms
- ✅ Group synergy bonuses

**Tasks:**

- ✅ Map navigation skills to navigation bonus
- ✅ Map combat skills to combat bonus
- ✅ Map exploration skills to discovery bonus
- ✅ Map crafting skills to resource bonus
- ✅ Map social skills to interact bonus

---

## **PHASE 3: UI/UX UPDATES**

_Estimated Time: 2-3 days_

### **3.1 Recruitment System Implementation**

**File:** `interactions/recruitmentSystem.js` (new)
**Dependencies:** Character Generation, Classes, Time System
**Deliverables:**

- Location-based character recruitment system
- Character description system based on highest/lowest stats
- Time-based character availability with refresh mechanics
- Recruitment cost system with gold and item requirements
- Level-based recruitment restrictions

**Major Tasks:**

- [x] **3.1.1 Character Description System**

  - [x] Create stat description mappings for >12, >16, <8 thresholds
  - [x] Implement character description generation: "You find yourself in front of a [highest_stat_desc] [race] [gender], he/she is a [second-highest_stat_desc] [class]. His/her expertise lies in [skill1] and [skill2]. He/she wears [armor/cloth] and brandishes [1h weapon/2h weapon]"
  - [x] Add race, gender, class, and level information to descriptions
  - [x] Create description templates and formatting system
  - [x] Show 2 highest skills with descriptions (good >4, expert >7, master >10)

- [x] **3.1.2 Location-Based Character Generation**

  - [x] Define location types and their associated class probabilities
  - [x] Implement context-based character generation (Army/Military, Villages/Farms, Cities, Traders, Religious, Wilderness)
  - [x] Add rarity restrictions (common/uncommon only for now)
  - [x] Create outlier character generation (rare classes in unexpected locations)
  - [x] Add special location recruitment (5% chance for most locations, 1% for peaks)
  - [x] Implement special location character generation (common/uncommon medium level, rare low level)

- [x] **3.1.3 Time-Based Character Availability System**

  - [x] Implement character ID timestamp parsing for availability tracking
  - [x] Create location-specific refresh timers (Cities: 1 week 30%, 2 weeks 40%, 3 weeks 50%, etc. up to 90%)
  - [x] Add probability-based character departure system with escalating percentages
  - [x] Implement character migration to other locations (keep same stats and name, update timestamp)
  - [x] Create character removal system for expired recruits
  - [x] Add special location character migration (100% departure after 1 week)

- [x] **3.1.4 Recruitment Cost System**
  - [x] Define base gold costs (Level 1: 50g, Level 2: 120g, Level 3: 250g, etc.)
  - [x] Implement cost multipliers (Uncommon: 2x, Rare: 4x with special items)
  - [x] Add item requirements for rare classes (tomes for mages, relics for paladins)
  - [x] Create level-based cost scaling system
  - [x] Implement payment tracking and character loyalty system

**Minor Tasks:**

- [x] **3.1.5 Recruitment Interface**

  - [x] Create recruitment board dialog with 4 character slots (all visible at once)
  - [x] Implement character preview cards with name, sex, class, description
  - [x] Add recruitment buttons with cost display (only one recruitment allowed)
  - [x] Create character selection and payment confirmation
  - [x] Add "refresh" option for new character generation
  - [x] Integrate recruitment board with location interactions (visible when arriving at locations with recruits)
  - [x] Add special location recruitment as first button in location dialog

- [x] **3.1.6 Level Restriction System**

  - [x] Implement player character level-based recruitment restrictions
  - [x] Add error message for over-level recruitment attempts ("You are not so strong/smart/important to work with me")
  - [x] Create level validation system
  - [x] Add level display in character previews

- [x] **3.1.7 Integration with Existing Systems**

  - [x] Replace current group creation dialog with recruitment system
  - [x] Update gameState.group structure to use new character objects
  - [x] Integrate with existing character generation system
  - [x] Update group bonus calculations for new character format
  - [x] Remove backward compatibility with old role-based system

- [x] **3.1.8 Persistent Character Storage System**
  - [x] Implement NPC character storage in gameState.npcCharacters array
  - [x] Add deterministic character generation using hash() and game date
  - [x] Implement character persistence with position tracking (x, y, locationType)
  - [x] Add character migration system with improvement rolls
  - [x] Implement persistent character system (migrated >1 times become permanent)
  - [x] Add location-specific character counts (camp: 1-2, farm: 2-3, outpost: 2-3, hamlet: 3-4, village: 4-5, city: 4-6)
  - [x] Implement character refresh logic based on creation date and refresh intervals
  - [x] Add character migration probability system (cities: 50%, others: 30%)
  - [x] Implement character improvement during migration (20% level gain, 15% stat improvement, 10% skill improvement)
  - [x] Add save/load system integration with character cleanup

### **3.2 Group Creation Dialog Replacement** ✅ **COMPLETED**

**File:** `interactions/groupCreationDialog.js`
**Dependencies:** Recruitment System
**Deliverables:**

- Complete replacement of role-based system
- Integration with new recruitment system
- Updated group management interface

**Tasks:**

- ✅ Replace role buttons with recruitment system integration
- ✅ Update group display to show character objects instead of roles
- ✅ Add character management options (view stats, equipment, history)
- ✅ Implement group size management and cost tracking

### **3.3 Health Group Dialog Update** ✅ **COMPLETED**

**File:** `interactions/healthGroupDialog.js`
**Dependencies:** Character System
**Deliverables:**

- Character stats display
- Skill levels display
- Equipment status display
- Character history display

**Tasks:**

- ✅ Update member display to show character stats
- ✅ Add skill level indicators
- ✅ Show equipment status
- ✅ Display character history snippets

### **3.4 Character Management Interface** ✅ **COMPLETED**

**File:** `interactions/characterManagementDialog.js` (new)
**Dependencies:** Character System
**Deliverables:**

- Character detail view
- Skill progression interface
- Equipment management
- Character history viewer

**Tasks:**

- ✅ Create character detail dialog
- ✅ Add skill progression interface
- ✅ Implement equipment management
- ✅ Add character history viewer

### **3.5 Inventory Dialog Update** ✅ **COMPLETED**

**File:** `interactions/inventoryDialog.js`
**Dependencies:** Equipment System
**Deliverables:**

- Equipment management interface
- Equipment durability display
- Equipment skill bonuses display

**Tasks:**

- ✅ Update inventory to show equipment
- ✅ Add equipment durability indicators
- ✅ Display equipment skill bonuses
- ✅ Implement equipment swapping

---

## **PHASE 4: GAMEPLAY INTEGRATION**

_Estimated Time: 2-3 days_

### **4.1 Movement System Update**

**File:** `movement.js`
**Dependencies:** Skill-Bonus Mapping
**Deliverables:**

- Skill-based navigation bonuses
- Terrain-specific skill bonuses
- Movement speed calculations

**Tasks:**

- [ ] Replace role-based navigation with skill-based
- [ ] Add terrain-specific skill bonuses
- [ ] Update movement speed calculations
- [ ] Implement skill-based pathfinding

### **4.2 Combat System Update**

**File:** `interactions/combatDialog.js`, `interactions/enhancedCombatSystem.js`
**Dependencies:** Character Stats, Skills
**Deliverables:**

- Character stat-based combat
- Skill-based combat bonuses
- Equipment-based combat modifiers

**Tasks:**

- [ ] Update combat calculations to use character stats
- [ ] Add skill-based combat bonuses
- [ ] Implement equipment combat modifiers
- [ ] Update combat AI to consider character stats

### **4.3 Visibility System Update**

**File:** `movement.js` (revealAround function)
**Dependencies:** Skills, Equipment
**Deliverables:**

- Skill-based view distance
- Equipment-based visibility bonuses
- Scouting skill integration

**Tasks:**

- [ ] Implement skill-based view distance calculation
- [ ] Add equipment visibility bonuses
- [ ] Integrate scouting skills
- [ ] Update fog of war system

### **4.4 Interaction System Update**

**File:** `interactions/tileInteraction.js`, `interactions/handleChoice.js`
**Dependencies:** Skills, Character Stats
**Deliverables:**

- Skill-based interaction checks
- Character stat-based success rates
- Skill progression triggers

**Tasks:**

- [ ] Add skill checks to interactions
- [ ] Implement stat-based success rates
- [ ] Add skill progression triggers
- [ ] Update interaction outcomes

---

## **PHASE 5: ADVANCED FEATURES**

_Estimated Time: 2-3 days_

### **5.1 Skill Progression System**

**File:** `interactions/skillProgression.js` (new)
**Dependencies:** Skills, Character System
**Deliverables:**

- Skill experience gain system
- Skill level progression
- Skill progression notifications

**Tasks:**

- [ ] Implement skill experience gain
- [ ] Add skill level progression logic
- [ ] Create skill progression notifications
- [ ] Add skill progression UI

### **5.2 Class Leveling System**

**File:** `interactions/classLeveling.js` (new)
**Dependencies:** Classes, Skills
**Deliverables:**

- Class level progression
- Class level requirements
- Class level bonuses

**Tasks:**

- [ ] Implement class level progression
- [ ] Add class level requirements
- [ ] Implement class level bonuses
- [ ] Add class level UI

### **5.3 Equipment Durability System**

**File:** `interactions/equipmentDurability.js` (new)
**Dependencies:** Equipment System
**Deliverables:**

- Equipment wear and tear
- Equipment repair system
- Equipment replacement

**Tasks:**

- [ ] Implement equipment durability
- [ ] Add equipment repair system
- [ ] Create equipment replacement logic
- [ ] Add equipment maintenance UI

### **5.4 Character History System**

**File:** `interactions/characterHistory.js` (new)
**Dependencies:** Character System
**Deliverables:**

- Character event tracking
- History display system
- Character relationship tracking

**Tasks:**

- [ ] Implement character event tracking
- [ ] Create history display system
- [ ] Add character relationship tracking
- [ ] Implement history search/filter

---

## **PHASE 6: TESTING & POLISH**

_Estimated Time: 1-2 days_

### **6.1 Systems Integration Testing**

**Dependencies:** All previous phases
**Deliverables:**

- All systems working together
- No breaking changes
- Performance optimization

**Tasks:**

- [ ] Test character creation flow
- [ ] Test skill progression mechanics
- [ ] Test equipment system functionality
- [ ] Test bonus calculations
- [ ] Performance optimization
- [ ] Bug fixes and polish

---

## **DETAILED TECHNICAL SPECIFICATIONS**

### **Character Data Structure**

```javascript
{
  id: "char_1703123456789_123", // Timestamp-based ID for availability tracking
  firstName: "Marcus",
  lastName: "Ironhand",
  gender: "male",
  race: "Human",
  class: "fighter",
  classLevel: 2,
  stats: {
    STR: 15, DEX: 12, CON: 14, INT: 10, WIS: 11, CHA: 9, LUCK: 8
  },
  skills: {
    "swordfighting": 3.45,
    "intimidation": 2.12,
    "blacksmithing": 1.78
  },
  health: { current: 45, max: 50 },
  equipment: {
    armor: "intact iron noble [chainmail-armor]",
    weapon: "intact steel common [longsword]",
    tool: "worn leather poor [backpack]"
  },
  history: "Marcus joined the group after proving his worth in the tavern brawl...",
  recruitmentCost: { gold: 50, items: [] },
  locationAvailability: {
    locationType: "city",
    availableUntil: "2024-12-15T00:00:00Z",
    refreshDate: "2024-12-01T00:00:00Z"
  }
}
```

### **NPC Character Storage Data Structure**

```javascript
// gameState.npcCharacters array structure
[
  {
    character: {
      // Full character object as defined above
      id: "char_1703123456789_123",
      firstName: "Marcus",
      lastName: "Ironhand",
      // ... all character properties
    },
    position: {
      x: 15, // Map X coordinate
      y: 23, // Map Y coordinate
      locationType: "city", // Location type (city, village, etc.)
    },
    migrationCount: 0, // Number of times character has migrated
    isPersistent: false, // Whether character is permanent (migrated >1 times)
  },
];
```

### **Character Migration Data Structure**

```javascript
// Character improvement during migration
{
  levelGain: {
    probability: 0.2,          // 20% chance
    amount: 1                  // Gain 1 level
  },
  statImprovement: {
    probability: 0.15,         // 15% chance
    amount: 1,                 // Improve random stat by 1
    stats: ["STR", "DEX", "CON", "INT", "WIS", "CHA"] // Excludes LUCK
  },
  skillImprovement: {
    probability: 0.1,         // 10% chance
    amount: 0.5                // Improve random skill by 0.5
  }
}
```

### **Recruitment System Data Structure**

```javascript
// Location-based character availability
const locationCharacterAvailability = {
  city: {
    refreshInterval: 14, // days
    classProbabilities: {
      alchemist: 0.15,
      craftsman: 0.15,
      explorer: 0.12,
      dungeondiver: 0.12,
      hunter: 0.1,
      herbalist: 0.1,
      cleric: 0.08,
      monk: 0.08,
      paladin: 0.05, // rare
      pyromancer: 0.03, // rare
      articaster: 0.02, // rare
    },
  },
  village: {
    refreshInterval: 90, // days
    classProbabilities: {
      herbalist: 0.2,
      craftsman: 0.18,
      hunter: 0.15,
      ranger: 0.15,
      fighter: 0.12,
      dungeondiver: 0.1,
      brute: 0.1,
    },
  },
  army: {
    refreshInterval: 90, // days
    classProbabilities: {
      fighter: 0.25,
      archer: 0.2,
      brute: 0.15,
      paladin: 0.12,
      martial_artist: 0.1,
      pyromancer: 0.08, // rare combat mage
      articaster: 0.05, // rare combat mage
      cleric: 0.05,
    },
  },
  // Special locations with rare recruitment opportunities
  waterfalls: {
    refreshInterval: 180, // days
    recruitmentChance: 0.05, // 5% chance to find recruitable character
    classProbabilities: {
      ranger: 0.4,
      explorer: 0.3,
      herbalist: 0.2,
      monk: 0.1,
    },
  },
  volcano: {
    refreshInterval: 180, // days
    recruitmentChance: 0.05, // 5% chance to find recruitable character
    classProbabilities: {
      pyromancer: 0.5,
      fighter: 0.3,
      explorer: 0.2,
    },
  },
  canyon: {
    refreshInterval: 180, // days
    recruitmentChance: 0.05, // 5% chance to find recruitable character
    classProbabilities: {
      ranger: 0.4,
      hunter: 0.3,
      explorer: 0.2,
      dungeondiver: 0.1,
    },
  },
  geyser: {
    refreshInterval: 180, // days
    recruitmentChance: 0.05, // 5% chance to find recruitable character
    classProbabilities: {
      herbalist: 0.4,
      alchemist: 0.3,
      explorer: 0.2,
      monk: 0.1,
    },
  },
  "monster caves": {
    refreshInterval: 180, // days
    recruitmentChance: 0.05, // 5% chance to find recruitable character
    classProbabilities: {
      dungeondiver: 0.4,
      fighter: 0.3,
      necromancer: 0.2,
      brute: 0.1,
    },
  },
  cave: {
    refreshInterval: 180, // days
    recruitmentChance: 0.05, // 5% chance to find recruitable character
    classProbabilities: {
      dungeondiver: 0.4,
      explorer: 0.3,
      fighter: 0.2,
      necromancer: 0.1,
    },
  },
  ruin: {
    refreshInterval: 180, // days
    recruitmentChance: 0.05, // 5% chance to find recruitable character
    classProbabilities: {
      explorer: 0.4,
      dungeondiver: 0.3,
      necromancer: 0.2,
      alchemist: 0.1,
    },
  },
};

// Character description system
const statDescriptions = {
  high: {
    12: {
      STR: ["Strong", "Muscular", "Brawny"],
      DEX: ["Agile", "Nimble", "Deft"],
      CON: ["Hardy", "Sturdy", "Resilient"],
      INT: ["Clever", "Sharp", "Astute"],
      WIS: ["Wise", "Prudent", "Insightful"],
      CHA: ["Charismatic", "Charming", "Eloquent"],
    },
    16: {
      STR: ["Massive", "Titanic", "Herculean"],
      DEX: ["Swift", "Blinding", "Feline"],
      CON: ["Ironclad", "Unbreakable", "Enduring"],
      INT: ["Genius", "Brilliant", "Visionary"],
      WIS: ["Sage", "Prophetic", "Enlightened"],
      CHA: ["Magnetic", "Radiant", "Commanding"],
    },
  },
  low: {
    8: {
      STR: ["Weak", "Frail", "Feeble"],
      DEX: ["Clumsy", "Slow", "Awkward"],
      CON: ["Fragile", "Delicate", "Vulnerable"],
      INT: ["Dull", "Simple", "Naive"],
      WIS: ["Foolish", "Reckless", "Unwise"],
      CHA: ["Uncharismatic", "Repulsive", "Offensive"],
    },
  },
};

// Skill description thresholds
const skillDescriptions = {
  good: 4, // Skill > 4: "good [skillname]"
  expert: 7, // Skill > 7: "expert [skillname]"
  master: 10, // Skill > 10: "master [skillname]"
};

// Character description template
const characterDescriptionTemplate =
  "You find yourself in front of a [highest_stat_desc] [race] [gender], he/she is a [second_highest_stat_desc] [class]. His/her expertise lies in [skill1] and [skill2]. He/she wears [armor/cloth] and brandishes [1h_weapon/2h_weapon]";

// Recruitment cost system
const recruitmentCosts = {
  baseCosts: {
    1: 50, // Level 1: 50 gold
    2: 120, // Level 2: 120 gold
    3: 250, // Level 3: 250 gold
    4: 500, // Level 4: 500 gold
    5: 1000, // Level 5: 1000 gold
  },
  rarityMultipliers: {
    common: 1.0,
    uncommon: 2.0,
    rare: 4.0,
    legendary: 8.0,
  },
  rareItemRequirements: {
    pyromancer: ["tome_of_fire", "phoenix_feather"],
    articaster: ["tome_of_ice", "frost_crystal"],
    geomancer: ["tome_of_earth", "earth_stone"],
    necromancer: ["tome_of_death", "skull_focus"],
    paladin: ["holy_relic", "divine_blessing"],
    cleric: ["sacred_symbol", "holy_water"],
  },
};
```

### **Class System**

- **18 Classes:** fighter, archer, brute, monk, cleric, geomancer, pyromancer, necromancer, articaster, martial-artist, ranger, explorer, paladin, alchemist, herbalist, hunter, dungeondiver, craftsman
- **Stat Bonuses:** Each class gains specific stat bonuses per level
- **Starting Skills:** Each class begins with specific skills at level 1-2
- **Equipment Preferences:** Classes prefer certain equipment types

### **Race System**

- **11 Races** with regional origins and stat/skill bonuses:
  - **Human** (Aurenith) - Versatile and adaptable, balanced stats with +1 LUCK
  - **Elf** (Lyssarion) - Graceful and wise, +2 DEX/WIS, +1 INT/CHA, bonuses to archery/meditation/nature_magic
  - **Dwarf** (Gromthar) - Strong and sturdy, +2 STR/CON, +1 INT, bonuses to blacksmithing/mining/stonework
  - **Orc** (Vrakgul) - Powerful warriors, +2 STR, +1 CON/DEX, bonuses to intimidation/swordfighting/tactics
  - **Goblin** (Skrixel) - Agile and cunning, +2 DEX, +1 INT/LUCK, bonuses to stealth/lockpicking/trap_disarming
  - **Demon** (Zarthorym) - Dark magic users, +2 INT, +1 STR/CHA, bonuses to fire_magic/death_magic/intimidation
  - **Angel** (Celvayne) - Divine beings, +2 WIS, +1 INT/CHA, bonuses to divine_magic/healing/meditation
  - **Undead** (Nethrogar) - Death-touched, +2 CON, +1 INT/WIS, bonuses to death_magic/intimidation/stealth
  - **Draconic** (Vyrascor) - Dragon-blooded, +2 STR, +1 CON/CHA, bonuses to fire_magic/intimidation/swordfighting
  - **Fishman** (Thaloryn) - Aquatic beings, +2 CON, +1 DEX/WIS, bonuses to swimming/survival/healing
  - **Birdman** (Sylvarith) - Aerial beings, +2 DEX, +1 WIS/LUCK, bonuses to scouting/navigation/acrobatics
- **Regional Origins:** Each race hails from a specific region in the game world
- **Stat Modifiers:** Races provide permanent stat bonuses/penalties to base character stats
- **Skill Bonuses:** Races grant +1 bonuses to specific skills, reflecting racial aptitudes

### **Skill System**

- **30+ Skills** across 4 categories:
  - **Combat:** swordfighting, archery, polearms, unarmed, shieldwork
  - **Exploration:** navigation, tracking, cartography, survival, climbing, swimming, scouting, stealth
  - **Crafting:** blacksmithing, alchemy, leatherworking, tailoring, cooking, jewelcrafting, enchanting, herbalism, carpentry, scribing
  - **Social:** diplomacy, bartering, intimidation, persuasion, animal-handling, lockpicking, trap-disarming, lore-knowledge, arcana, investigation, insight, performance, deception, sleight-of-hand

### **Equipment System**

- **Status:** worn, intact, pristine
- **Material:** cloth, leather, iron, steel, silver, gold, mithril
- **Quality:** poor, common, noble, legendary, mythic
- **Type:** armor, weapon, tool, accessory
- **Format:** "status material rarity [type]" (e.g., "intact iron noble [chainmail-armor]")
- **Skill Kits:** 48+ skill-specific equipment items providing skill bonuses
- **Player Starting Equipment:** clothes + weapon + 1 skill kit (based on class)
- **NPC Equipment:** Random equipment based on class preferences

### **Recruitment System**

- **Location Types:** city, village, army, trader, religious, wilderness, waterfalls, volcano, canyon, geyser, peaks, monster caves, cave, ruin
- **Character Availability:** Time-based with location-specific refresh intervals (Cities: 1 week 30%, 2 weeks 40%, 3 weeks 50%, etc. up to 90%)
- **Character Descriptions:** "You find yourself in front of a [highest_stat_desc] [race] [gender], he/she is a [second_highest_stat_desc] [class]. His/her expertise lies in [skill1] and [skill2]. He/she wears [armor/cloth] and brandishes [1h_weapon/2h_weapon]"
- **Skill Descriptions:** Show 2 highest skills with descriptions (good >4, expert >7, master >10)
- **Recruitment Costs:** Level-based gold costs (Level 1: 50g, Level 2: 120g, Level 3: 250g) with rarity multipliers (Uncommon: 2x, Rare: 4x with special items)
- **Level Restrictions:** Players can only recruit characters of equal or lower level (based on player character level)
- **Character Migration:** Expired characters keep same stats and name, update timestamp when moving to other locations
- **Recruitment Interface:** Show all 4 characters at once, allow only one recruitment per visit
- **Special Locations:** Rare recruitment opportunities (5% chance for most locations, 1% for peaks) with location-flavored classes
- **Special Location Migration:** Characters in special locations depart 100% after 1 week
- **Integration:** Recruitment board visible when arriving at locations with recruits, special location recruitment as first button in location dialog

### **Persistent Character Storage System**

- **Storage Structure:** `gameState.npcCharacters` array containing objects with character data, position, migration count, and persistence status
- **Deterministic Generation:** Characters generated using `hash(x, y, gameDate)` for consistent results across game sessions
- **Position Tracking:** Each character stored with `{x, y, locationType}` coordinates for location-based retrieval
- **Character Counts by Location:**
  - **Camp (⛺):** 1-2 characters (hunters, rangers, fighters, dungeondivers)
  - **Farm (🏡):** 2-3 characters (herbalists, craftsmen, hunters, rangers)
  - **Outpost (🏕️):** 2-3 characters (fighters, archers, hunters, rangers, dungeondivers)
  - **Hamlet (🏠):** 3-4 characters (herbalists, craftsmen, hunters, rangers, fighters, dungeondivers)
  - **Village (🏘️):** 4-5 characters (herbalists, craftsmen, hunters, rangers, fighters, dungeondivers, brutes)
  - **City (🏰):** 4-6 characters (alchemists, craftsmen, explorers, dungeondivers, hunters, herbalists, clerics, monks, paladins, pyromancers, articasters)
- **Character Migration System:**
  - **Migration Probability:** Cities 50%, other locations 30%
  - **Migration Destinations:** Characters migrate to other regular locations (not special locations)
  - **Character Improvement During Migration:**
    - 20% chance to gain 1 level
    - 15% chance to improve random stat by 1
    - 10% chance to improve random skill by 0.5
- **Persistent Character System:**
  - Characters that migrate more than once become permanent NPCs
  - Permanent characters are never deleted (except death)
  - Permanent characters occasionally appear in recruitment boards
  - Migration count tracked in `npcData.migrationCount`
  - Persistence status tracked in `npcData.isPersistent`
- **Character Refresh Logic:**
  - Refresh triggered when player accesses recruitment board
  - Characters checked against creation date from character ID timestamp
  - Characters older than refresh interval roll for migration/vanishing
  - Refresh intervals: Cities 14 days, Villages/Hamlets 90 days, Special locations 180 days
- **Save/Load Integration:**
  - Characters cleaned up before saving (remove expired non-persistent characters)
  - Persistent characters always saved regardless of age
  - Character cleanup happens automatically during save process
- **Character Lifecycle:**
  1. **Generation:** Deterministic character created based on location and game date
  2. **Storage:** Character stored with position and metadata
  3. **Availability:** Character available for recruitment until refresh interval
  4. **Migration/Vanishing:** Character either migrates to new location or vanishes
  5. **Improvement:** Migrating characters may gain levels, stats, or skills
  6. **Persistence:** Characters migrating multiple times become permanent
  7. **Cleanup:** Non-persistent expired characters removed during save

### **Character Generation Features**

- **Point Allocation System:** 10 points with escalating costs and malus system (3 malus = 2 bonus)
- **Race System:** 11 races with regional origins, stat bonuses, and skill bonuses
- **Character Creation Methods:** 5 different creation options (random, point allocation, class selection, race selection, full custom)
- **Enhanced Dialog System:** Select, checkbox, and number input components
- **Error Handling:** Comprehensive fallback systems and error recovery
- **Player Character Storage:** Accepted characters stored in gameState.playerCharacter

### **Bonus Calculation System**

- **Navigation Bonus:** Sum of Navigation + Cartography + Scouting skills
- **Discovery Bonus:** Highest of Investigation + Lore Knowledge + Arcana skills
- **Combat Bonus:** Sum of Combat skills (swordfighting, archery, etc.)
- **Food Bonus:** Sum of Cooking + Survival + Herbalism skills
- **Resource Bonus:** Sum of Crafting skills (blacksmithing, carpentry, etc.)
- **Plant Bonus:** Sum of Herbalism + Survival skills
- **Interact Bonus:** Sum of Social skills (diplomacy, persuasion, etc.)
- **Carry Bonus:** Based on STR stat
- **Health Bonus:** Sum of Healing + Herbalism skills
- **View Bonus:** Highest Scouting + Tracking skills (determines view distance)

---

## **RISK ASSESSMENT & MITIGATION**

### **High Risk Items:**

1. **Data Migration**: Breaking existing save games
   - _Mitigation_: Clear documentation, no backward compatibility
2. **Performance**: Complex calculations affecting game speed
   - _Mitigation_: Optimize calculations, cache results
3. **UI Complexity**: Overwhelming character management interface
   - _Mitigation_: Progressive disclosure, clear navigation

### **Medium Risk Items:**

1. **Skill Balance**: Skills too powerful or too weak
   - _Mitigation_: Extensive testing, iterative balancing
2. **Equipment Complexity**: Too many equipment options
   - _Mitigation_: Start simple, add complexity gradually

---

## **SUCCESS CRITERIA**

- [ ] All 18 classes implemented with unique stat bonuses
- [ ] 30+ skills across 4 categories working
- [ ] Equipment system with durability and bonuses
- [ ] Character creation with point allocation
- [ ] Skill-based bonus calculations working
- [ ] All game systems using new character stats
- [ ] No performance degradation
- [ ] All tests passing

---

## **TIMELINE ESTIMATE**

- **Phase 1**: 2-3 days (Foundation)
- **Phase 2**: 1-2 days (Migration)
- **Phase 3**: 2-3 days (UI/UX)
- **Phase 4**: 2-3 days (Integration)
- **Phase 5**: 2-3 days (Advanced)
- **Phase 6**: 1-2 days (Testing)

**Total Estimated Time: 10-16 days**

---

## **FILES TO MODIFY**

### **Existing Files:**

- `gamestate/game_variables.js` - Update group structure
- `utils.js` - Replace bonus calculation system
- `movement.js` - Update navigation and visibility
- `interactions/groupCreationDialog.js` - New character creation
- `interactions/healthGroupDialog.js` - Display new character stats
- `interactions/combatDialog.js` - Use character combat stats
- `interactions/enhancedCombatSystem.js` - Integrate character stats
- `interactions/tileInteraction.js` - Skill-based interactions
- `interactions/handleChoice.js` - Character stat integration

### **New Files to Create:**

- `interactions/combat/classes.js` - Class definitions ✅ **COMPLETED**
- `interactions/skills.js` - Skill system ✅ **COMPLETED**
- `interactions/equipment.js` - Equipment database ✅ **COMPLETED**
- `interactions/characterGeneration.js` - Character creation logic ✅ **COMPLETED**
- `interactions/recruitmentSystem.js` - Location-based recruitment system
- `interactions/characterManagementDialog.js` - Character management UI
- `interactions/skillProgression.js` - Skill progression system
- `interactions/classLeveling.js` - Class leveling system
- `interactions/equipmentDurability.js` - Equipment durability
- `interactions/characterHistory.js` - Character history system

---

## **PROGRESS TRACKING**

- ✅ Phase 1 Complete (Foundation Systems)
- ✅ Phase 2 Complete (Data Structure Migration)
  - ✅ Phase 2.1 Complete (GameState Structure Update)
  - ✅ Phase 2.2 Complete (Bonus Calculation System)
  - ✅ Phase 2.3 Complete (Skill-Bonus Mapping)
- ✅ Phase 3 Complete (UI/UX Updates)
  - ✅ Phase 3.1 Complete (Recruitment System Implementation)
  - ✅ Phase 3.2 Complete (Group Creation Dialog Replacement)
  - ✅ Phase 3.3 Complete (Health Group Dialog Update)
  - ✅ Phase 3.4 Complete (Character Management Interface)
  - ✅ Phase 3.5 Complete (Inventory Dialog Update)
- [ ] Phase 4 Complete (Gameplay Integration)
- [ ] Phase 5 Complete (Advanced Features)
- [ ] Phase 6 Complete (Testing & Polish)
- [ ] Project Complete

**Last Updated:** December 2024
**Current Phase:** Phase 4 - Gameplay Integration (Movement System Update)
**Overall Progress:** 60% Complete (Phase 1 + Phase 2 + Phase 3 Complete)

---

## **RECENT UPDATES & FIXES**

### **Character Generation System Enhancements (December 2024)**

**Completed Features:**

- ✅ **Race System**: 11 races with regional origins, stat bonuses, and skill bonuses
- ✅ **Malus System**: 3 malus points = 2 bonus points for flexible stat allocation
- ✅ **Player Starting Equipment**: Clothes + weapon + 1 skill kit system
- ✅ **Skill Kit System**: 48+ skill-specific equipment items added to equipment.js
- ✅ **Enhanced Dialog System**: Select, checkbox, and number input components
- ✅ **Character Creation Methods**: 5 different creation options implemented
- ✅ **Error Handling**: Comprehensive fallback systems and error recovery

**Bug Fixes Applied:**

- ✅ **Dialog Value Extraction**: Fixed getDialogValue function to handle empty strings
- ✅ **Character Acceptance Flow**: Fixed dialog restart issue when accepting characters
- ✅ **Race Selection Error**: Fixed "Race data not found" error with fallback handling
- ✅ **Select Element Defaults**: Fixed select elements not having default selections
- ✅ **Integration Issues**: Fixed main.js character creation loop integration

**Files Modified:**

- `interactions/characterGeneration.js` - Core character generation logic
- `interactions/charCreationDialog.js` - Enhanced character creation dialogs
- `interactions/showDialog.js` - Enhanced dialog system with new components
- `interactions/equipment.js` - Added skill kit system
- `main.js` - Fixed character creation loop integration

**Technical Improvements:**

- Enhanced error handling with try-catch blocks and fallback mechanisms
- Comprehensive debug logging for troubleshooting
- Improved code organization and function structure
- Better integration between dialog system and character generation

### **Recruitment System Implementation Plan (December 2024)**

**System Overview:**

The recruitment system will completely replace the current role-based group creation system with a location-based character recruitment system. Players will be able to recruit characters from different locations based on context-appropriate classes, with time-based availability and cost requirements.

**Key Features:**

- **Location-Based Recruitment:** Different location types (cities, villages, armies, special locations) will have different character pools
- **Time-Based Availability:** Characters will be available for limited time periods with escalating departure probabilities
- **Character Descriptions:** Dynamic descriptions based on 2 highest stats, 1 lowest stat, 2 highest skills, and 1 lowest skill
- **Cost System:** Level-based gold costs with rarity multipliers and special item requirements for rare classes
- **Level Restrictions:** Players can only recruit characters of equal or lower level (based on player character level)
- **Character Migration:** Expired characters keep same stats and name, update timestamp when moving to other locations
- **Recruitment Interface:** Show all 4 characters at once, allow only one recruitment per visit

**Implementation Priority:**

1. **Phase 3.1.1:** Character Description System (Highest Priority)
2. **Phase 3.1.2:** Location-Based Character Generation
3. **Phase 3.1.3:** Time-Based Character Availability System
4. **Phase 3.1.4:** Recruitment Cost System
5. **Phase 3.1.5:** Recruitment Interface
6. **Phase 3.1.6:** Level Restriction System
7. **Phase 3.1.7:** Integration with Existing Systems

**Files to Create:**

- `interactions/recruitmentSystem.js` - Core recruitment system logic
- `interactions/recruitmentDialog.js` - Recruitment board interface
- `interactions/characterPreviewDialog.js` - Character preview and details

**Files to Modify:**

- `interactions/groupCreationDialog.js` - Replace with recruitment system integration
- `gamestate/game_variables.js` - Add recruitment-related game state
- `time_system.js` - Add character availability tracking
- `interactions/tileInteraction.js` - Add recruitment location interactions

### **Health Group Dialog Integration (December 2024)**

**Completed Features:**

- ✅ **Character Management Integration**: Health Group Dialog now includes direct access to Character Management Interface
- ✅ **Enhanced Character Display**: Updated character display with race emojis and improved formatting
- ✅ **Consistent UI**: Character display now matches the Character Management Interface styling
- ✅ **Seamless Navigation**: Users can access detailed character management from the health dialog
- ✅ **Detailed Breakdown Integration**: Character management also accessible from bonus breakdown dialog

**Integration Features:**

- **Main Health Dialog**: Added "👥 Character Management" button to main health group dialog
- **Detailed Breakdown Dialog**: Added character management access to bonus breakdown dialog
- **Enhanced Character Display**:
  - Added race emojis to character display (consistent with character management)
  - Improved formatting with gender and level information
  - Better visual consistency across all character displays
- **Seamless Navigation**: Users can navigate between health dialog and character management seamlessly

**Files Modified:**

- `interactions/healthGroupDialog.js` - Integrated character management interface and enhanced character display

**Technical Improvements:**

- Consistent emoji mappings between health dialog and character management
- Enhanced character information display with race and gender
- Seamless navigation flow between different character management interfaces
- Improved user experience with unified character display formatting

### **Character Management Interface Implementation (December 2024)**

**Completed Features:**

- ✅ **Character Management Dialog**: Complete character management interface with player and group member management
- ✅ **Character Detail Views**: Comprehensive character information display including stats, skills, equipment, and history
- ✅ **Skill Progression Interface**: Detailed skill breakdown by category (Combat, Magic, Exploration, Crafting, Social, Other)
- ✅ **Equipment Management**: Equipment display with durability status and skill bonus information
- ✅ **Character History Viewer**: Character background and event tracking system
- ✅ **Group Overview**: Group composition analysis with class distribution and active bonuses
- ✅ **Main Menu Integration**: Character management accessible from main menu and inventory dialog
- ✅ **Inventory Dialog Enhancement**: Updated inventory to show all character equipment

**Character Management Features:**

- **Player Character Management**: Full player character details with stats, skills, equipment, and history
- **Group Member Management**: Individual group member details with selection interface
- **Skill Categorization**: Skills organized by category with level descriptions (Novice, Good, Expert, Master)
- **Equipment Display**: Equipment shown with status, material, rarity, and type information
- **Character History**: Character background and recruitment information
- **Group Analysis**: Group composition, class distribution, and active bonus breakdown

**Integration Points:**

- **Main Menu**: Character Management option added to main menu (click on player)
- **Inventory Dialog**: Character Management button added to inventory dialog
- **Navigation**: Seamless navigation between character management and other game systems

**Files Created:**

- `interactions/characterManagementDialog.js` - Complete character management interface

**Files Modified:**

- `interactions/showMenu.js` - Added character management option to main menu
- `interactions/inventoryDialog.js` - Enhanced inventory dialog with equipment display and character management integration

**Technical Improvements:**

- Comprehensive character data display with emoji icons for classes and races
- Skill progression interface with categorized skill display
- Equipment management with durability and bonus information
- Character history tracking and display
- Group overview with composition analysis and bonus breakdown
- Seamless integration with existing game systems

### **Equipment System Refactoring (December 2024)**

**Completed Features:**

- ✅ **Equipment Format Refactoring**: Updated from "status,material,quality,type" to "status material rarity [type]" format
- ✅ **Specialized Class Kits**: Created 13 specialized equipment kits for different class types
- ✅ **Starting Equipment Rules**: Implemented realistic starting equipment based on class specialization
- ✅ **Magic School Kits**: Created unique kits for each magic school (geomancer, pyromancer, articaster, necromancer)
- ✅ **Crafting Specialization**: Separated broad crafting into specialized kits (blacksmithing, alchemy, leatherworking, tailoring, carpentry)
- ✅ **Professional Kits**: Added trader kit for bartering and dungeondiver kit for lockpicking/trap disarming

**Equipment Kits Created:**

- **Crafting Kits**: Herbalist, Blacksmithing, Alchemy, Leatherworking, Tailoring, Carpentry
- **Professional Kits**: Trader, Dungeondiver, Meditation
- **Magic School Kits**: Geomancer, Pyromancer, Articaster, Necromancer
- **Exploration Kits**: Explorer (for general exploration classes)

**Starting Equipment Rules:**

- All characters guaranteed to start with clothes
- Only martial classes receive armor (9 martial classes identified)
- Each class type gets appropriate specialized kit
- Martial classes receive whetstone as tool
- Focused skill bonuses (+4 to primary skill instead of spread across multiple skills)

**Files Modified:**

- `interactions/equipment.js` - Added 13 specialized kits with unique components and skill bonuses
- `interactions/characterGeneration.js` - Updated equipment generation logic for class-specific kits

**Technical Improvements:**

- Realistic equipment components for each profession
- Thematic spellbooks for each magic school
- Appropriate skill bonuses focused on primary class abilities
- Balanced pricing based on kit complexity and materials
