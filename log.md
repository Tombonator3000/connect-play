# Development Log

## 2026-01-19: Priority 1 - Core Mechanics Implementation

### Tasks Completed

#### 1.1 Forbindelsesmatrise (Tile Connections)
- [x] Define CATEGORY_CONNECTIONS map
- [x] Define DOOR_REQUIRED_TRANSITIONS
- [x] Create validateTileConnection() function
- [x] Create helper functions (canCategoriesConnect, isDoorRequired, getValidNeighborCategories)
- [x] Create selectRandomConnectableCategory() for smart tile generation
- [x] Integrate validation in spawnRoom() function

#### 1.2 Inventory Slots System
- [x] Define InventorySlots interface (leftHand, rightHand, body, bag[4])
- [x] Define ItemSlotType and InventorySlotName types
- [x] Update Player interface to use InventorySlots
- [x] Create equipItem() / unequipItem() functions
- [x] Create isSlotCompatible(item, slot) validation
- [x] Create helper functions (createEmptyInventory, countInventoryItems, findAvailableSlot, hasKey, hasLightSource, getAllItems)
- [x] Update CharacterPanel UI to show equipment slots visually
- [x] Update combatUtils to work with new inventory system

#### 1.3 Kontekstuelle Handlinger (Context Actions)
- [x] Expand ContextAction interface with skillCheck, itemRequired, consequences
- [x] Create ContextActionTarget interface
- [x] Create getContextActions() for all obstacles and doors
- [x] Create getDoorActions() for all door states (open, closed, locked, barricaded, sealed, puzzle)
- [x] Create getObstacleActions() for all obstacle types
- [x] Create getTileObjectActions() for interactive objects
- [x] Create ContextActionBar component with visual styling
- [x] Integrate context actions in ShadowsGame state
- [x] Add handleContextAction() for executing actions
- [x] Add handleContextConsequence() for damage/sanity effects
- [x] Add handleContextActionEffect() for door/obstacle state changes

### Files Modified
- `src/game/types.ts` - Added InventorySlots, ContextAction interfaces and helper functions
- `src/game/constants.ts` - Added CATEGORY_CONNECTIONS, DOOR_REQUIRED_TRANSITIONS, validation functions
- `src/game/ShadowsGame.tsx` - Integrated new systems, added context action handlers
- `src/game/utils/combatUtils.ts` - Updated to use new inventory system
- `src/game/components/CharacterPanel.tsx` - Updated UI for slot-based inventory

### Files Created
- `src/game/utils/contextActions.ts` - Context action logic for obstacles, doors, objects
- `src/game/components/ContextActionBar.tsx` - UI component for showing available actions

### Features Implemented

#### Tile Connection System
The game now validates tile connections based on category:
- Nature tiles connect to street/urban
- Facade tiles require doors to connect to foyer
- Interior tiles have proper hierarchy (foyer -> corridor -> room)
- Basements and crypts are properly isolated

#### Inventory Slots
Players now have specific equipment slots:
- Left/Right Hand: Weapons, tools, light sources
- Body: Armor, cloaks
- Bag (4 slots): Keys, consumables, relics
- Max 7 items total
- Visual UI showing all slots

#### Context Actions
When clicking on obstacles or doors, players see specific actions:
- Locked doors: Use Key, Lockpick (Agi check), Force (Str check)
- Barricaded doors: Break Barricade (Str check)
- Sealed doors: Use Elder Sign, Break Seal (Wil check), Read Glyphs
- Fire: Extinguish (with item), Jump Through (Agi check)
- Darkness: Use Light Source, Dispel (Wil check)
- And many more obstacle types...

---

## 2026-01-19: Player Death Mechanic & Game Over States

### Tasks
1. Implement player death mechanic (HP = 0 triggers game over)
2. Win state and loss state ("finis")
3. Doom tracker = 0 triggers game over
4. Mythos phase text overlay when clicking "End Round"

### Implementation Plan
- Create `GameOverOverlay.tsx` component for win/loss states
- Create `MythosPhaseOverlay.tsx` for phase transition
- Add game over checks in `ShadowsGame.tsx`
- Check for all players dead or doom = 0 for loss
- Check scenario victory conditions for win

### Progress
- [x] Explored codebase structure
- [x] Read ShadowsGame.tsx, types.ts, game_design_bible.md
- [x] Created GameOverOverlay component
- [x] Created MythosPhaseOverlay component
- [x] Added game over logic
- [x] Testing and committing

### Files Modified
- `src/game/components/GameOverOverlay.tsx` (NEW)
- `src/game/components/MythosPhaseOverlay.tsx` (NEW)
- `src/game/ShadowsGame.tsx` (MODIFIED)
- `src/index.css` (MODIFIED - added overlay animations)

### Features Implemented

#### 1. GameOverOverlay Component
- Shows "FINIS" title for defeat states
- Shows "VICTORIA" for victory states
- Three game over types:
  - `defeat_death`: All players have fallen (HP = 0)
  - `defeat_doom`: Doom tracker reached 0
  - `victory`: Scenario completed (prepared for future use)
- Displays round count and scenario title
- "Try Again" and "Main Menu" buttons
- Atmospheric visual effects (particles, quotes)

#### 2. MythosPhaseOverlay Component
- Shows "MYTHOS PHASE" text with "The darkness grows..." subtitle
- Appears when clicking "End Round"
- 2-second display with fade in/out animations
- Purple/cosmic color scheme
- Animated particles and decorative elements

#### 3. Game Over Logic in ShadowsGame.tsx
- `checkGameOver()` function to check win/loss conditions
- Doom reaching 0 triggers immediate game over
- All players dead triggers game over after Mythos phase
- `handleGameOverRestart()` - restart with same scenario
- `handleGameOverMainMenu()` - return to title screen

#### 4. CSS Animations
- `animate-fadeIn` - fade in effect for overlays
- `animate-float` - floating particle animation

---

## 2026-01-19: Expanded Tile System & Location Descriptions

### Tasks
1. Expand `INDOOR_LOCATIONS` array with diverse thematic tiles
2. Expand `OUTDOOR_LOCATIONS` array with diverse thematic tiles
3. Add RPG-style descriptions for all tiles shown when player lands on them

### Implementation

#### Expanded INDOOR_LOCATIONS (75+ tiles)
Organized by category from game_design_bible.md:
- **FACADE**: Blackwood Mansion, Crumbling Church, The Gilded Hotel, The Witch House, Funeral Parlor, etc.
- **FOYER**: Grand Foyer, Marble Lobby, Cobwebbed Vestibule, Asylum Reception, etc.
- **CORRIDOR**: Dusty Corridor, Servants Passage, Cell Block Corridor, Portrait Gallery, etc.
- **ROOM**: Private Study, Séance Parlor, Dissection Theater, Padded Cell, Records Room, etc.
- **STAIRS**: Grand Staircase, Spiral Stairs, Bell Tower Steps, Hidden Stairwell, etc.
- **BASEMENT**: Wine Cellar, Flooded Basement, Smugglers Cache, Catacombs Entrance, etc.
- **CRYPT**: Sacrificial Altar, Eldritch Portal, Star Chamber, The Black Pool, etc.

#### Expanded OUTDOOR_LOCATIONS (65+ tiles)
Organized by category:
- **NATURE**: Moonlit Clearing, Treacherous Marsh, Ancient Stone Circle, Dead Mans Hollow, etc.
- **URBAN**: Arkham Harbor, Fish Market, Gallows Hill, Founders Plaza, Cannery Row, etc.
- **STREET**: Shadowy Alley, Sewer Grate, Lamplit Avenue, Dead End, The Narrows, etc.
- **SPECIAL**: Suicide Cliff, The Gibbet, Flooded Quarry, The Execution Ground, etc.

#### Location Descriptions (150+ Lovecraftian descriptions)
Every tile now has an atmospheric RPG-style description that displays when the player enters:
- Written in Lovecraftian horror style
- Second-person perspective ("You see...", "Your footsteps...")
- Atmospheric details hinting at cosmic horror
- Sensory details (sounds, smells, temperatures)
- Subtle warnings and unsettling observations

### Files Modified
- `src/game/constants.ts` (MODIFIED)
  - Expanded `INDOOR_LOCATIONS` array
  - Expanded `OUTDOOR_LOCATIONS` array
  - Massively expanded `LOCATION_DESCRIPTIONS` record

### Examples of New Descriptions

**The Witch House:**
> "The angles are wrong here. Corners that should be square are not. Your compass spins uselessly."

**Ritual Chamber:**
> "Symbols painted in substances best not examined. The air thrums with wrongness. Something was summoned here."

**Innsmouth Wharf:**
> "Decaying piers and the smell of the deep. The locals watch with bulging eyes. They're not unfriendly—just hungry."

**The Black Pool:**
> "Ink-dark water that doesn't ripple. Your reflection shows you older, changed, not entirely you anymore."

---

## 2026-01-19: Bug Fix - Lovecraftian Tile Descriptions Not Displayed

### Problem
The 150+ Lovecraftian tile descriptions defined in `LOCATION_DESCRIPTIONS` were never being used in the game. When players explored new tiles, only the tile name and category were logged, not the atmospheric descriptions.

### Root Cause
`LOCATION_DESCRIPTIONS` was defined in `constants.ts` but never imported or used in `ShadowsGame.tsx` where tile exploration is handled.

### Fix Applied
1. **Imported** `LOCATION_DESCRIPTIONS` in `ShadowsGame.tsx`
2. **Added** description display logic in `spawnRoom()` function
3. When a new tile is explored, the atmospheric description is now logged to the Field Journal

### Files Modified
- `src/game/ShadowsGame.tsx` (MODIFIED)
  - Added `LOCATION_DESCRIPTIONS` to imports
  - Added description lookup and logging in `spawnRoom()` function

### Result
Now when players explore tiles, they will see the full Lovecraftian description in the Field Journal:
```
[12:38:59] UTFORSKET: The Witch House. [FACADE]
[12:38:59] The angles are wrong here. Corners that should be square are not. Your compass spins uselessly.
```

---

## 2026-01-19: Scenario System & Legacy System Design

### Oppgave
Design og implementering av:
1. **Scenario-system** - Hero Quest + Mansions of Madness + roguelite med klare mål
2. **Legacy-system** - Bruk figurer videre mellom scenarier, shop for utstyr

### Kontekst
Spillet er inspirert av:
- **Hero Quest** - Enkle, klare regler og mål
- **Mansions of Madness** - Cthulhu-utforskning, atmosfære
- **ADOM/Roguelite** - Prosedyregenerert, hvert spill er unikt

### Analyse av eksisterende system
- `Scenario` interface finnes med `victoryType`, `steps`, `doomEvents`
- Tre scenarier definert men victory conditions ikke implementert
- `MERCHANT` fase definert men ikke brukt
- Ingen persistens mellom scenarier (legacy)

### Status
- [x] Design scenario-system
- [ ] Design legacy-system
- [x] Implementer ScenarioBriefingPopup
- [x] Implementer victory condition checking
- [ ] Implementer legacy character persistence
- [ ] Implementer shop mellom oppdrag

---

## 2026-01-19: Scenario Briefing & Victory Conditions Implementation

### Tasks Completed

#### ScenarioBriefingPopup.tsx
- [x] Created atmospheric briefing popup component
- [x] Parchment-style design with wax seal decoration
- [x] Shows scenario title, briefing text, objectives, victory conditions
- [x] Displays doom prophecy and special conditions
- [x] Team info and start location displayed
- [x] "Begin Investigation" button to start game

#### Extended Scenario Interface (types.ts)
- [x] Added `ScenarioObjective` interface with full objective system
- [x] New `ObjectiveType` for: find_item, find_tile, kill_enemy, kill_boss, survive, interact, escape, collect, explore, protect, ritual
- [x] `VictoryCondition` interface for checking win states
- [x] `DefeatCondition` interface for loss conditions
- [x] Extended `Scenario` with: briefing, objectives, victoryConditions, defeatConditions, estimatedTime, recommendedPlayers

#### Updated SCENARIOS (constants.ts)
- [x] Added detailed briefing narratives for all 3 scenarios
- [x] Expanded objectives with primary and bonus objectives
- [x] Hidden objectives that reveal when prerequisites are met
- [x] Victory conditions linked to required objectives
- [x] Defeat conditions (all_dead, doom_zero)
- [x] Added estimatedTime and recommendedPlayers

#### Victory Condition Checking (scenarioUtils.ts)
- [x] Created comprehensive scenario utilities module
- [x] `checkVictoryConditions()` - checks all victory conditions
- [x] `checkDefeatConditions()` - checks all defeat conditions
- [x] `updateObjectiveProgress()` - tracks progress on objectives
- [x] `completeObjective()` - marks objectives complete, reveals hidden ones
- [x] `checkKillObjectives()` - updates kill-based objectives
- [x] `checkExploreObjectives()` - updates exploration objectives
- [x] `updateSurvivalObjectives()` - tracks survival round count
- [x] Helper functions for objective display

#### ShadowsGame.tsx Integration
- [x] Added showBriefing state
- [x] Briefing shows after character selection before game starts
- [x] Victory/defeat checking integrated in checkGameOver()
- [x] Kill objectives updated when enemies die
- [x] Explore objectives updated when new tiles discovered
- [x] Survival objectives updated on round change
- [x] Objective completion notifications in game log

### Files Created
- `src/game/components/ScenarioBriefingPopup.tsx` (NEW)
- `src/game/utils/scenarioUtils.ts` (NEW)

### Files Modified
- `src/game/types.ts` (MODIFIED - extended Scenario interface)
- `src/game/constants.ts` (MODIFIED - expanded SCENARIOS)
- `src/game/ShadowsGame.tsx` (MODIFIED - integrated briefing and victory checking)

### Features Implemented

#### Scenario Briefing System
When players select a scenario and characters:
1. "Assemble Team" button now shows briefing popup
2. Briefing displays immersive narrative text
3. Mission objectives listed with descriptions
4. Victory conditions and doom events shown
5. "Begin Investigation" starts the game

#### Objective Tracking
The game now tracks progress on scenario objectives:
- **Primary objectives**: Must be completed for victory
- **Bonus objectives**: Optional, give rewards
- **Hidden objectives**: Revealed when prerequisites met
- Progress tracked for: kills, exploration, survival rounds, item collection

#### Victory Checking
The game checks for victory after significant events:
- Escape: Player reaches exit with required items
- Assassination: Target boss killed
- Survival: Required rounds survived
- Collection: All required items found

#### Defeat Conditions
Game ends in defeat when:
- All investigators die
- Doom counter reaches zero
- Specific objective fails (e.g., protection target dies)

### Next Steps
- [x] Implement legacy character persistence between scenarios
- [x] Implement shop/merchant phase between missions
- [ ] Add objective tracker UI during gameplay
- [ ] Add more scenarios

---

## 2026-01-19: Legacy System Implementation

### Oppgave
Implementer fullt Legacy-system for persistent helter mellom scenarier:
- Persistent heroes - bruk samme figur i flere scenarier
- Gold economy - tjen gull fra scenarier og loot
- Shop mellom oppdrag - kjøp våpen, verktøy, rustning
- Equipment stash - lagre items mellom spill
- XP og leveling (1-5) med stat bonuses
- Permadeath - døde helter er borte for alltid
- LocalStorage persistence - data lagres lokalt

### Implementation

#### 1. Types (types.ts)
Utvidet med nye interfaces og funksjoner:

**LegacyHero Interface:**
```typescript
interface LegacyHero {
  id: string;                    // Unique hero ID
  name: string;                  // Custom hero name
  characterClass: CharacterType; // detective, professor, etc.
  level: number;                 // 1-5
  currentXP: number;             // Total XP earned
  gold: number;                  // Currency for shop
  baseAttributes: CharacterAttributes;
  bonusAttributes: CharacterAttributes;  // From level ups
  maxHp: number;
  maxSanity: number;
  equipment: InventorySlots;     // Persistent equipment
  scenariosCompleted: string[];
  scenariosFailed: string[];
  totalKills: number;
  isDead: boolean;               // Permadeath flag
  deathScenario?: string;
  deathCause?: string;
}
```

**XP System:**
- Level 1: 0 XP (starting)
- Level 2: 50 XP
- Level 3: 150 XP
- Level 4: 300 XP
- Level 5: 500 XP (max)

**Level Up Bonuses:**
- +1 to any attribute (STR/AGI/INT/WIL)
- +2 Max HP
- +1 Max Sanity

**New Interfaces:**
- `LegacyData` - Complete save data
- `EquipmentStash` - Shared item storage
- `ScenarioResult` - Results after completing scenario
- `HeroScenarioResult` - Individual hero results
- `ShopItem` - Shop inventory items
- `ShopInventory` - Categorized shop

#### 2. Legacy Manager (utils/legacyManager.ts)
Created comprehensive manager for all legacy operations:

**Core Functions:**
- `loadLegacyData()` / `saveLegacyData()` - LocalStorage persistence
- `createLegacyHero()` - Create new persistent hero
- `addHeroToArchive()` / `updateHero()` - Hero management
- `getLivingHeroes()` / `getDeadHeroes()` - Filter heroes

**Permadeath:**
- `killHero()` - Mark hero as permanently dead
- `retireHero()` - Voluntary retirement
- Equipment from dead/retired heroes goes to stash

**XP & Leveling:**
- `addXPToHero()` - Add experience
- `applyLevelUpBonus()` - Apply chosen bonus
- `getLevelUpOptions()` - Available bonuses
- `getXPProgress()` - Progress to next level

**Gold Economy:**
- `addGoldToHero()` / `spendGold()` - Gold management
- `calculateScenarioGoldReward()` - Reward calculation
- `calculateScenarioXPReward()` - XP calculation

**Stash:**
- `addItemToStash()` / `removeItemFromStash()` - Item management
- `getAllEquippedItems()` - Get hero's items

**Player Conversion:**
- `legacyHeroToPlayer()` - Convert hero to in-game player
- `updateLegacyHeroFromPlayer()` - Update hero after scenario

**Shop:**
- `getDefaultShopInventory()` - Full shop catalog
- `purchaseShopItem()` - Handle purchases

#### 3. Hero Archive Panel (components/HeroArchivePanel.tsx)
New UI component for managing heroes:

**Views:**
- List view - All living heroes with stats
- Create view - Create new hero (name, class)
- Detail view - Full hero stats and equipment
- Level up view - Choose level up bonus
- Memorial view - Fallen heroes graveyard

**Features:**
- Hero cards with level, XP bar, gold, attributes
- Select heroes for missions (up to 4)
- Level up notification and bonus selection
- Visual stat bars for attributes

#### 4. Equipment Stash Panel (components/EquipmentStashPanel.tsx)
Shared storage management:

**Features:**
- View all stored items with filtering/sorting
- Transfer items between stash and heroes
- Color-coded item types
- Capacity indicator (20 items max)

#### 5. Merchant Shop (components/MerchantShop.tsx)
Updated to use gold system:

**Shop Categories:**
- Weapons: Revolver (30g), Shotgun (50g), Tommy Gun (100g, Lv3), Combat Knife (15g)
- Tools: Flashlight (10g), Lockpick Set (20g), Crowbar (15g), Oil Lantern (25g)
- Armor: Leather Jacket (35g), Trench Coat (25g), Armored Vest (75g, Lv2)
- Consumables: Medical Kit (20g), Old Whiskey (10g), Bandages (5g), Sedatives (15g)
- Relics: Elder Sign (150g, Lv3), Protective Ward (60g), Eldritch Compass (80g, Lv2)

**Features:**
- Category tabs with icons
- Gold/XP display
- Level requirements for some items
- Stock limits on rare items
- Scenario rewards summary
- Transfer items to stash

#### 6. Main Menu Updates (components/MainMenu.tsx)
Added Legacy system buttons:
- "Heroes" button - Opens Hero Archive
- "Stash" button - Opens Equipment Stash
- Badge showing count of heroes/items

#### 7. ShadowsGame Integration (ShadowsGame.tsx)
Full integration of Legacy system:

**New State:**
- `legacyData` - Loaded from localStorage
- `selectedLegacyHeroIds` - Heroes selected for mission
- `showMerchantShop` - Merchant visibility
- `lastScenarioResult` - Results for display
- `heroKillCounts` - Track kills per hero

**Game Mode Selection:**
- Classic Mode - Traditional new investigators
- Legacy Mode - Use persistent heroes

**Scenario Completion Flow:**
1. Victory/Defeat detected
2. Calculate gold and XP rewards based on:
   - Scenario difficulty (Normal/Hard/Nightmare)
   - Bonus objectives completed
   - Kill count
3. Update each hero:
   - Add XP (can trigger level up)
   - Add gold
   - Update stats (kills, insight earned)
   - Record scenario completion/failure
4. Handle permadeath for dead heroes
5. Show Merchant Shop for survivors
6. Archive heroes and return to menu

### Files Created
- `src/game/utils/legacyManager.ts` - Legacy system logic
- `src/game/components/HeroArchivePanel.tsx` - Hero management UI
- `src/game/components/EquipmentStashPanel.tsx` - Stash UI

### Files Modified
- `src/game/types.ts` - Added legacy interfaces and helpers
- `src/game/components/MerchantShop.tsx` - Gold-based shop
- `src/game/components/MainMenu.tsx` - Legacy buttons
- `src/game/ShadowsGame.tsx` - Full integration

### LocalStorage Keys
- `shadows_1920s_legacy` - All legacy data (heroes, stash, stats)
- `shadows_1920s_save` - Current game state (unchanged)
- `shadows_1920s_settings` - Game settings (unchanged)

### Summary
The Legacy system is now fully implemented:
- Create persistent heroes that survive between scenarios
- Earn gold and XP from completing scenarios
- Level up heroes (1-5) with stat bonuses
- Buy equipment at the shop between missions
- Store items in shared stash
- Permadeath - dead heroes are gone forever
- All data persisted in localStorage

---

## 2026-01-19: Dynamic Scenario Generation System

### Oppgave
Implementer et fullstendig dynamisk scenario-genereringssystem der "New Case" genererer et unikt scenario fra element-pools, i stedet for å velge fra ferdiglagde scenarier. Dette gir 100+ unike scenario-kombinasjoner.

### Flyt
1. Klikk "New Case"
2. Velg vanskelighetsgrad (Normal/Hard/Nightmare)
3. System GENERERER tilfeldig scenario satt sammen fra pools
4. Character selection viser scenario-info
5. "Generate New Case" knapp for å re-rulle
6. Briefing popup vises før spillet starter

### Implementation

#### 1. Scenario Generator (utils/scenarioGenerator.ts) - NY FIL
Opprettet en komplett scenario-generator med følgende element-pools:

**Mission Types (9 typer):**
| ID | Navn | Victory Type | TileSet |
|----|------|-------------|---------|
| escape_manor | Escape | escape | indoor |
| assassination | Assassination | assassination | mixed |
| survival | Siege | survival | mixed |
| collection | Relic Hunt | collection | mixed |
| rescue | Rescue | escape | indoor |
| investigation | Investigation | investigation | mixed |
| ritual | Counter-Ritual | ritual | indoor |
| seal_portal | Seal the Gate | ritual | mixed |
| purge | Purge | assassination | indoor |

**Location Pools (23 lokasjoner):**
- Indoor Start Locations (10): Blackwood Manor, Arkham Asylum, Miskatonic Library, etc.
- Outdoor Start Locations (8): Town Square, Old Cemetery, Arkham Harbor, etc.
- Mixed Start Locations (5): Police Station, Merchant District, etc.

**Enemy Pools (per vanskelighetsgrad):**
- Normal: Cultists (2-3), Ghouls (1-2)
- Hard: Cultists (2-3), Ghouls (2-3), Deep Ones (1-2)
- Nightmare: Cultists (3-4), Ghouls (2-3), Deep Ones (2-3), Mi-Go (1-2)

**Boss Pool:**
- Shoggoth (Normal+)
- Dark Young of Shub-Niggurath (Hard+)
- Star Spawn of Cthulhu (Nightmare)
- Hunting Horror (Nightmare)

**Narrative Elements:**
- 8 briefing openings
- 7 middle narratives per mission type
- 3 closing narratives per difficulty
- 7 target names (for assassination)
- 7 victim names (for rescue)
- 6 mystery names (for investigation)
- 6 collectible item types

**Objective Templates:**
- Primary objectives per mission type (2-3 per type)
- Bonus objectives pool (4 types)
- Hidden objectives that reveal based on progress

**Doom Event Generation:**
- Early wave (70% doom threshold)
- Mid wave (50% doom threshold)
- Boss wave (20% doom threshold)
- Difficulty-appropriate enemy selection

#### 2. Title Generation
Dynamiske titler basert på mission type:
```typescript
TITLE_TEMPLATES = {
  escape: ['Escape from {location}', 'The {location} Trap', 'No Exit at {location}'],
  assassination: ['The {target} Must Die', 'Death to the {target}', 'Hunt for the {target}'],
  survival: ['The Siege of {location}', 'Last Stand at {location}', 'Night of Terror'],
  // ... etc
}
```

#### 3. UI Updates (ShadowsGame.tsx)
- Oppdatert `getRandomScenario()` til å bruke `generateRandomScenario()`
- La til "Generate New Case" re-roll knapp
- Viser mission type, start location, doom, og estimert tid
- Oppdatert info-tekst: "9 mission types × endless combinations"

### Tekniske Detaljer

**generateRandomScenario() algoritme:**
1. Velg tilfeldig mission type fra pool
2. Velg lokasjon basert på tileset (indoor/outdoor/mixed)
3. Generer kontekstuelle elementer (target, victim, mystery, collectibles)
4. Bygg objectives fra templates med dynamiske verdier
5. Legg til 1-2 tilfeldige bonus objectives
6. Generer doom events med riktige terskler
7. Bygg tittel og briefing fra fragmenter
8. Assembler komplett Scenario objekt

**Variabilitet:**
- 9 mission types
- 23 locations
- 7+ targets/victims
- 6 collectible types
- Tilfeldige mengder (targetAmount ranges)
- Tilfeldige boss-valg per difficulty
- ~100+ unike kombinasjoner

### Files Created
- `src/game/utils/scenarioGenerator.ts` (NY) - Komplett generator med alle pools

### Files Modified
- `src/game/ShadowsGame.tsx` - Oppdatert til å bruke generator, la til re-roll knapp

### Eksempel på Generert Scenario
```
Tittel: "Escape from Arkham Asylum"
Type: Escape
Vanskelighetsgrad: Hard
Start: Arkham Asylum
Doom: 10
Mål: "Find the cursed_key and escape from Arkham Asylum."

Objectives:
1. Find the Cursed Key
2. Find the Exit (hidden, revealed by #1)
3. Escape (hidden, revealed by #2)
4. [BONUS] Find Journals (0/3)

Doom Events:
- Doom 7: Cultists emerge from the shadows! (2-3 cultists)
- Doom 5: A ghoul pack attacks! (2-3 ghouls)
- Doom 2: A Dark Young crashes through! (boss)
```

### Summary
Systemet genererer nå dynamisk unike scenarier ved å kombinere:
- Mission types (9 typer)
- Locations (23 steder)
- Enemies & bosses (difficulty-balanced)
- Narrative elements (briefings, titles)
- Objectives (primary + bonus)
- Doom events (3 waves per scenario)

Dette gir 100+ unike scenario-kombinasjoner, og hver gang du klikker "New Case" får du et helt nytt oppdrag med unik historie og mål. "Generate New Case" knappen lar deg re-rulle hvis du vil ha et annet oppdrag.
