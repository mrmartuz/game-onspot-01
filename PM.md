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

- [ ] Define class stat bonus progression (e.g., Fighter: +1 STR, +1 CON, +1 DEX per level)
- [ ] Assign starting skills to each class
- [ ] Create class rarity system
- [ ] Add class descriptions and lore

### **1.2 Skill System Creation**

**File:** `interactions/skills.js`
**Dependencies:** None
**Deliverables:**

- 30+ skills across 4 categories (Combat, Exploration, Crafting, Social)
- Skill leveling mechanics (0.01-99.99 format)
- Skill-to-bonus calculation functions
- Skill progression difficulty scaling

**Tasks:**

- [ ] Define all skill names and categories
- [ ] Implement skill leveling algorithm
- [ ] Create skill progression difficulty curve
- [ ] Add skill prerequisites and synergies

### **1.3 Equipment System Creation**

**File:** `interactions/equipment.js`
**Dependencies:** None
**Deliverables:**

- Equipment database with status/material/quality/type structure
- Equipment skill bonuses
- Equipment durability system
- Equipment slot management (armor, weapon, tool)

**Tasks:**

- [ ] Define equipment status levels (worn, intact, pristine)
- [ ] Define material types (cloth, leather, iron, steel, etc.)
- [ ] Define quality levels (poor, common, noble, legendary)
- [ ] Define equipment types (armor, weapon, tool, accessory)
- [ ] Create equipment skill bonus mappings

### **1.4 Character Generation System**

**File:** `interactions/characterGeneration.js`
**Dependencies:** Classes, Skills, Equipment
**Deliverables:**

- Point allocation system (10 points with escalating costs)
- Procedural character creation
- Stat calculation with class bonuses
- Equipment assignment

**Tasks:**

- [ ] Implement point allocation algorithm
- [ ] Create stat generation with randomization
- [ ] Integrate class bonuses into final stats
- [ ] Add equipment assignment logic

### **1.5 Name Generation System**

**File:** `interactions/nameGeneration.js`
**Dependencies:** None
**Deliverables:**

- First name database
- Last name database
- Name generation functions
- Cultural/regional name variations

**Tasks:**

- [ ] Create first name lists (100+ names)
- [ ] Create last name lists (100+ names)
- [ ] Implement name generation algorithm
- [ ] Add cultural variations

---

## **PHASE 2: DATA STRUCTURE MIGRATION**

_Estimated Time: 1-2 days_

### **2.1 GameState Structure Update**

**File:** `gamestate/game_variables.js`
**Dependencies:** Character Generation
**Deliverables:**

- Updated group array structure
- Character data format
- Backward compatibility removal

**Tasks:**

- [ ] Update group array to new character format
- [ ] Remove old role-based structure
- [ ] Add character ID system
- [ ] Update groupBonus structure if needed

### **2.2 Bonus Calculation System**

**File:** `utils.js`
**Dependencies:** Skills, Classes
**Deliverables:**

- New getGroupBonus function
- Skill-to-bonus mapping
- Group composition bonuses

**Tasks:**

- [ ] Replace getGroupBonus with skill-based calculation
- [ ] Create skill-to-bonus mapping system
- [ ] Implement group composition bonuses
- [ ] Update updateGroupBonus function

### **2.3 Skill-Bonus Mapping**

**File:** `utils.js` (or new `interactions/skillBonusMapping.js`)
**Dependencies:** Skills
**Deliverables:**

- Mapping of skills to game bonuses
- Bonus calculation algorithms
- Group synergy bonuses

**Tasks:**

- [ ] Map navigation skills to navigation bonus
- [ ] Map combat skills to combat bonus
- [ ] Map exploration skills to discovery bonus
- [ ] Map crafting skills to resource bonus
- [ ] Map social skills to interact bonus

---

## **PHASE 3: UI/UX UPDATES**

_Estimated Time: 2-3 days_

### **3.1 Group Creation Dialog Update**

**File:** `interactions/groupCreationDialog.js`
**Dependencies:** Character Generation, Classes
**Deliverables:**

- Character selection interface
- Class preview system
- Stat preview before recruitment

**Tasks:**

- [ ] Replace role buttons with class selection
- [ ] Add character preview (stats, skills, equipment)
- [ ] Implement character generation in dialog
- [ ] Add character customization options

### **3.2 Health Group Dialog Update**

**File:** `interactions/healthGroupDialog.js`
**Dependencies:** Character System
**Deliverables:**

- Character stats display
- Skill levels display
- Equipment status display
- Character history display

**Tasks:**

- [ ] Update member display to show character stats
- [ ] Add skill level indicators
- [ ] Show equipment status
- [ ] Display character history snippets

### **3.3 Character Management Interface**

**File:** `interactions/characterManagementDialog.js` (new)
**Dependencies:** Character System
**Deliverables:**

- Character detail view
- Skill progression interface
- Equipment management
- Character history viewer

**Tasks:**

- [ ] Create character detail dialog
- [ ] Add skill progression interface
- [ ] Implement equipment management
- [ ] Add character history viewer

### **3.4 Inventory Dialog Update**

**File:** `interactions/inventoryDialog.js`
**Dependencies:** Equipment System
**Deliverables:**

- Equipment management interface
- Equipment durability display
- Equipment skill bonuses display

**Tasks:**

- [ ] Update inventory to show equipment
- [ ] Add equipment durability indicators
- [ ] Display equipment skill bonuses
- [ ] Implement equipment swapping

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
  id: "char_001",
  firstName: "Marcus",
  lastName: "Ironhand",
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
    armor: "intact,iron,noble,chainmail",
    weapon: "intact,steel,common,longsword",
    tool: "worn,leather,poor,backpack"
  },
  history: "Marcus joined the group after proving his worth in the tavern brawl..."
}
```

### **Class System**

- **18 Classes:** fighter, archer, brute, monk, cleric, geomancer, pyromancer, necromancer, articaster, martial-artist, ranger, explorer, paladin, alchemist, herbalist, hunter, dungeondiver, craftsman
- **Stat Bonuses:** Each class gains specific stat bonuses per level
- **Starting Skills:** Each class begins with specific skills at level 1-2
- **Equipment Preferences:** Classes prefer certain equipment types

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
- **Format:** "status,material,quality,type" (e.g., "intact,iron,noble,chainmail")

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

- `interactions/combat/classes.js` - Class definitions
- `interactions/skills.js` - Skill system
- `interactions/equipment.js` - Equipment database
- `interactions/characterGeneration.js` - Character creation logic
- `interactions/nameGeneration.js` - Name generation
- `interactions/characterManagementDialog.js` - Character management UI
- `interactions/skillProgression.js` - Skill progression system
- `interactions/classLeveling.js` - Class leveling system
- `interactions/equipmentDurability.js` - Equipment durability
- `interactions/characterHistory.js` - Character history system

---

## **PROGRESS TRACKING**

- [ ] Phase 1 Complete
- [ ] Phase 2 Complete
- [ ] Phase 3 Complete
- [ ] Phase 4 Complete
- [ ] Phase 5 Complete
- [ ] Phase 6 Complete
- [ ] Project Complete

**Last Updated:** [Date]
**Current Phase:** Phase 1 - Foundation Systems
**Overall Progress:** 0% Complete
