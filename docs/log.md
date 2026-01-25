# Shadows of the 1920s - Development Log

## 2026-01-25

### Session 14 - Monster Graphics & Item Icons

#### Monster Portraits Generated (14 nye):
AI-genererte Lovecraft-portretter for alle monstre som manglet unike bilder:
- **Ghast** - Blek, langlemmet skapning fra krypter
- **Zoog** - Liten flaggermus-rotte fra Dreamlands
- **Rat-Thing** - Brown Jenkin-inspirert heksefamiliar
- **Fire Vampire** - Levende flammevesen fra verdensrommet
- **Dimensional Shambler** - Grå dimensjonsreisende med tentakler
- **Serpent Man** - Reptilhumanoid magiker
- **Gug** - Massiv firarmet skapning
- **Cthonian** - Kjempeorm med telepatiske evner
- **Tcho-Tcho** - Degenerert menneskestamme
- **Flying Polyp** - Semi-synlig eldgammel rase
- **Lloigor** - Energivesen med lyn-silhuett
- **Gnoph-Keh** - Arktisk seksbent beist
- **Colour Out of Space** - Prismatisk kosmisk entitet
- **Elder Thing** - Antarktisk alien fra At the Mountains of Madness

#### Item Icons Added (12 nye SVG-ikoner):
- **Tools**: Rope, Grappling Hook
- **Consumables**: Morphine (syringe), Smelling Salts, Ancient Tome
- **Armor**: Chain Mail, Heavy Coat, Leather Vest
- **Relics**: Silver Dagger, Powder of Ibn Ghazi
- **Weapons**: Axe, Crossbow

#### Build-feil fikset:
- **claudeService.ts** - Endret `state.weatherCondition` til `state.weatherState?.global`

#### Filer endret:
- `src/game/utils/monsterAssets.ts` - Nye monster-importer og mappinger
- `src/game/utils/AssetLibrary.ts` - Oppdatert MONSTER_PORTRAITS
- `src/game/components/ItemIcons.tsx` - 12 nye SVG-ikoner
- `src/game/components/MonsterPortrait.tsx` - **NY** - Animert monster-portrett med trait-effekter
- `src/game/components/EnemyPanel.tsx` - Bruker MonsterPortrait
- `src/game/components/CombatOverlay.tsx` - Bruker MonsterPortrait
- `src/game/services/claudeService.ts` - Build-fix
- `src/index.css` - 14 nye animasjoner for monster-traits
- `src/assets/monsters/ghast.png` → `elder_thing.png` (14 bilder)

---

## 2026-01-21

### Session 13 - Audio Structure & Build Fixes

#### Build-feil fikset:
- **audioManager.ts:131** - Fjernet ugyldig `frequency` property fra MetalSynth
- **eventDeckManager.ts** - Endret `ENEMIES` import til `BESTIARY`, fikset `vitality/maxVitality` → `hp/maxHp`
- **contextActionEffects.ts** - Fikset `SpawnedQuestItem` import og `equipResult.inventory` → `newInventory`
- **contextActionBuilder.ts** - La til type casting for `icon as ContextActionIconType`
- **contextActions.ts** - Fjernet ugyldig `obstacle.searched` referanse
- **monsterDecisionHelpers.ts** - Fikset `MonsterPersonality` import fra types.ts
- **survivorSystem.ts** - Fikset `distraction` objekt-struktur
- **SaveLoadModal.tsx** - Endret `legacyData.gold` → `legacyData.totalGoldEarned`
- **saveManager.ts** - Oppdatert validering og migrering for LegacyData

#### Audio mappestruktur opprettet:
- `public/audio/sfx/` - Lydeffekter med README
- `public/audio/music/` - Bakgrunnsmusikk med README
- Lastet ned `rain-loop.ogg` fra OpenGameArt (CC0)
- README-filer med liste over nødvendige SFX og gratis kilder

#### Filer endret:
- `src/game/utils/audioManager.ts`
- `src/game/utils/eventDeckManager.ts`
- `src/game/utils/contextActionEffects.ts`
- `src/game/utils/contextActionBuilder.ts`
- `src/game/utils/contextActions.ts`
- `src/game/utils/monsterDecisionHelpers.ts`
- `src/game/utils/survivorSystem.ts`
- `src/game/utils/saveManager.ts`
- `src/game/components/SaveLoadModal.tsx`

---

### Session 12 - Bug Fixes & Game Mechanics

#### TypeScript Build-feil fikset:
- **ShadowsGame.tsx:2205** - Endret `state.exploredTiles?.has()` til `includes()` (exploredTiles er string[], ikke Set<string>)
- **ShadowsGame.tsx:2741** - Endret `BESTIARY[occTarget.type]?.defense` til `defenseDice` for å matche BestiaryEntry interface
- **types.ts:152** - La til `tempDefenseBonus?: number` i Player interface for midlertidige forsvarsbonus fra trylleformler
- **EdgeIcons.tsx & ItemTooltip.tsx** - Fikset Lucide icon type-kompatibilitet (`size?: string | number`)

#### BUG-003: EnemyType validering
- La til runtime type guard for `event.targetId as EnemyType` i checkDoomEvents
- Sjekker nå at targetId faktisk finnes i BESTIARY før casting
- Fallback til 'cultist' ved ugyldig type med console.warn

#### BUG-004: Race condition i logging
- Flyttet urgency-logging inn i setState callback for å sikre korrekt timing
- Kombinerer nå board-update og log-update i samme setState

#### Kampmekanikker implementert (fra REGELBOK.MD):
- **Veteran melee-bonus**: +1 angrepsterning kun med nærkampvåpen (ikke ranged)
- **Kritiske treff**: Når ALLE angrepsterninger treffer (>=4) = +1 bonus skade
- Begge funksjoner oppdatert i `performAttack()` og `getCombatPreview()` i combatUtils.ts

#### Vapenrestriksjoner i MerchantShop:
- Importert `canUseWeapon` fra combatUtils.ts
- La til visuell feedback med "Restricted" badge og rød border for våpen helten ikke kan bruke
- Deaktivert kjøp-knapp med "Cannot Use" tekst for restringerte våpen

#### Verifiserte allerede implementerte systemer:
- **PuzzleModal-integrasjon**: Fungerer via `state.activePuzzle` og `handlePuzzleSolve`
- **Save/Load system**: SaveLoadModal er koblet til UI med eksport/import/auto-save
- **Event Card basics**: EventModal og EVENTS konstanter finnes

#### Pending (for fremtidige sesjoner):
- Event Card deck cycling (shuffling og trekking ved doom-milepæler)
- Audio (Tone.js / ElevenLabs)
- Weather-effekter fra doom-nivå
- Legacy XP/Leveling mellom scenarier

### Filer endret denne sesjonen:
- `src/game/ShadowsGame.tsx` - exploredTiles, defenseDice, EnemyType-validering, race condition fix
- `src/game/types.ts` - tempDefenseBonus i Player interface
- `src/game/components/EdgeIcons.tsx` - Lucide icon type fix
- `src/game/components/ItemTooltip.tsx` - Lucide icon type fix
- `src/game/utils/combatUtils.ts` - Veteran melee-only bonus, kritiske treff dokumentasjon
- `src/game/components/MerchantShop.tsx` - Vapenrestriksjoner-feedback i UI

---

## 2026-01-19

### Session 11 - Massive Tile Asset Expansion (52 nye tiles)
Generert 52 nye tile-bilder med 90-graders top-down perspektiv. Totalt 84 tiles nå.

**Innendørs rom (18 nye):** parlor, nursery, music, conservatory, billiard, trophy, drawing, office, boiler, smoking, servants, closet, maproom, records, gallery, belltower, witchhouse, tenement

**Urban/Industriell (11 nye):** courthouse, newspaper, shipyard, gasworks, cannery, crossroads, deadend, funeral, gate, riverfront, fireescape

**Natur/Utendørs (12 nye):** well, gallows, quarry, campsite, shack, farmhouse, hangingtree, stonecircle, orchard, ruins, mine, pond

**Overnaturlig/Crypt (11 nye):** tomb, underground-lake, portal, sanctum, starchamber, massgrave, idol, blackpool, echo, petrified

### Session 10 - Regenerate All Tiles with Top-Down Perspective

### Tiles Regenerated (32 total):
- **Indoor/Building**: library, church, police, museum, hospital, asylum, manor, hallway, cellar, hotel, lab, bedroom, kitchen, shop, lighthouse
- **Urban/Street**: station, street, alley, square, market, campus, warehouse
- **Nature**: forest, graveyard, swamp, park, cave, bridge
- **Supernatural**: ritual, crypt, sewer

---

### Session 9 - Fix Tile Image Display
- **Root cause identified**: Tile images were imported correctly but not rendering due to:
  1. `backgroundImage` CSS approach didn't work properly with dynamic imports
  2. Overlays (`chiaroscuro-overlay`, `oil-texture`) had no z-index and opacity controls
  3. CSS classes were missing from index.css
- **Fix applied**:
  - Changed from `backgroundImage` to proper `<img>` tag with `object-cover`
  - Added explicit `z-index` values (`z-[1]`, `z-[2]`, `z-[3]`) to layer properly
  - Reduced overlay opacity (40% and 30%) so images show through
  - Added missing CSS classes to index.css (chiaroscuro-overlay, oil-texture, tile textures)
- All 32 tile images now display correctly on the game board

### Files Modified This Session
- `src/index.css` - Added ~100 lines of board game aesthetic CSS classes

---

### Session 8 - Complete Tile Image Generation
- **Generated 24 new AI tile images** for all major location types:
  - **Urban**: Train Station, Police Precinct, Museum, Hospital, Asylum, Street, Campus, Market
  - **Nature**: Forest, Swamp, Park, Cave, Bridge, Lighthouse
  - **Indoor**: Manor, Cellar, Warehouse, Hotel, Laboratory, Bedroom, Kitchen, Shop
  - **Supernatural**: Ritual Chamber, Sewer
- **Fixed Build Errors**:
  - Fixed ZoneLevel type in ShadowsGame.tsx
  - Fixed ContextAction interface usage in ActionBar.tsx (iconType → icon, difficulty → skillCheck.dc)
  - Fixed InventorySlots usage in MerchantShop.tsx (slot-based inventory system)
  - Removed duplicate keys in constants.ts LOCATION_DESCRIPTIONS
- **Updated GameBoard.tsx** with comprehensive tile image mapping:
  - 170+ keyword mappings to 32 unique tile images
  - Intelligent fallback matching for location names

### Files Created This Session
- `src/assets/tiles/tile-station.png` - Train station platform
- `src/assets/tiles/tile-police.png` - Police precinct interior
- `src/assets/tiles/tile-museum.png` - Museum exhibition hall
- `src/assets/tiles/tile-hospital.png` - Hospital ward
- `src/assets/tiles/tile-asylum.png` - Asylum cell block
- `src/assets/tiles/tile-street.png` - Night street with gas lamps
- `src/assets/tiles/tile-manor.png` - Victorian mansion foyer
- `src/assets/tiles/tile-cellar.png` - Underground wine cellar
- `src/assets/tiles/tile-forest.png` - Moonlit forest clearing with standing stones
- `src/assets/tiles/tile-ritual.png` - Dark ritual chamber with pentagram
- `src/assets/tiles/tile-warehouse.png` - Industrial warehouse
- `src/assets/tiles/tile-hotel.png` - Grand hotel lobby
- `src/assets/tiles/tile-lab.png` - Victorian laboratory
- `src/assets/tiles/tile-bedroom.png` - Four-poster bedroom
- `src/assets/tiles/tile-sewer.png` - Underground sewer tunnel
- `src/assets/tiles/tile-swamp.png` - Foggy swamp with dead trees
- `src/assets/tiles/tile-lighthouse.png` - Coastal lighthouse interior
- `src/assets/tiles/tile-market.png` - Fish market at night
- `src/assets/tiles/tile-campus.png` - University courtyard
- `src/assets/tiles/tile-shop.png` - Antique curiosity shop
- `src/assets/tiles/tile-cave.png` - Underground cave with fungi
- `src/assets/tiles/tile-bridge.png` - Stone bridge over misty river
- `src/assets/tiles/tile-kitchen.png` - Victorian kitchen
- `src/assets/tiles/tile-park.png` - City park at night

### Files Modified This Session
- `src/game/components/GameBoard.tsx` - Extended TILE_IMAGES mapping with all new tiles
- `src/game/ShadowsGame.tsx` - Fixed ZoneLevel type import
- `src/game/components/ActionBar.tsx` - Fixed ContextAction property access
- `src/game/components/MerchantShop.tsx` - Fixed inventory slot system usage
- `src/game/constants.ts` - Removed duplicate LOCATION_DESCRIPTIONS entries

---

### Session 7 - Combat System & Monster AI
- **Combat System Implementation**:
  - Created `combatUtils.ts` with full combat resolution logic
  - Attack rolls using 2d6 + STR/weapon bonus vs enemy defense
  - Horror checks when first encountering enemies (WIL check)
  - Critical hits (all dice succeed) and critical fails (all dice fail)
  - Weapon damage bonuses and enemy damage reduction
- **Monster AI System**:
  - Created `monsterAI.ts` with intelligent monster behavior
  - Monster spawning system based on tile type and doom level
  - Patrol behavior for idle monsters
  - Hunting behavior when player is spotted
  - Different AI behaviors per enemy type (aggressive, ranged, ambusher)
  - Vision range and detection system
- **Types & Constants Updates**:
  - Added CombatResult, MonsterBehavior interfaces
  - Added spawn tables and AI behavior definitions
  - Monster trait effects (flying, fast, ranged, etc.)

### Files Created This Session
- `src/game/utils/combatUtils.ts` - Combat resolution and damage calculation
- `src/game/utils/monsterAI.ts` - Monster behavior and spawning logic

### Files Modified This Session
- `src/game/types.ts` - Added combat and AI interfaces
- `src/game/constants.ts` - Added spawn tables and AI configs
- `src/game/ShadowsGame.tsx` - Integrated combat and AI systems

---

### Session 6 - Board Game Aesthetic & AI Tile Generation
- Implemented complete 1920s oil painting board game aesthetic:
  - **Chiaroscuro lighting** with dramatic light/dark contrasts
  - **Color palette**: Sepia browns, Prussian blue, Lovecraftian green, coagulated red
  - New CSS tile textures: darkwood, marble, carpet, stone, cobblestone, water
  - Added gaslight-glow, eldritch-glow, and ritual-glow effects
- **AI-Generated Tile Images**:
  - Generated 8 unique oil painting tiles: library, church, dock, square, graveyard, hallway, alley, crypt
  - Tiles stored in `src/assets/tiles/`
  - Images automatically applied based on tile name matching
- Created `src/game/AssetLibrary.ts` with:
  - Strict prompt engineering for AI image generation
  - Tile category system (indoor, outdoor, connector, supernatural)
  - Floor texture definitions
  - Edge visual effects
- Updated `index.css` with board game aesthetic tokens and animations
- Updated `tailwind.config.ts` with new color palette

### Files Created This Session
- `src/game/AssetLibrary.ts` - Asset generation prompts and tile visual definitions
- `src/assets/tiles/tile-library.png` - AI-generated library tile
- `src/assets/tiles/tile-church.png` - AI-generated church/ritual tile
- `src/assets/tiles/tile-dock.png` - AI-generated dock tile
- `src/assets/tiles/tile-square.png` - AI-generated town square tile
- `src/assets/tiles/tile-graveyard.png` - AI-generated graveyard tile
- `src/assets/tiles/tile-hallway.png` - AI-generated hallway tile
- `src/assets/tiles/tile-alley.png` - AI-generated alley tile
- `src/assets/tiles/tile-crypt.png` - AI-generated crypt tile

### Files Modified This Session
- `src/game/components/GameBoard.tsx` - Added tile image imports and board game styling
- `src/index.css` - Added tile texture classes and chiaroscuro effects
- `tailwind.config.ts` - Added board game color palette
- `src/game/ShadowsGame.tsx` - Added activePuzzle to DEFAULT_STATE

---

### Session 5 - External Repo Sync & Documentation
- Synced missing components from external repo (https://github.com/Tombonator3000/https-github.com-Tombonator3000)
- **New Components Added:**
  - `EventModal.tsx` - Event card display modal
  - `JournalModal.tsx` - Field Guide / Bestiary modal
  - `MerchantShop.tsx` - Buy/sell items interface
  - `PuzzleModal.tsx` - Memory sequence puzzle (Elder Sign)
  - `TurnNotification.tsx` - Phase/turn announcements
- **New Utilities Added:**
  - `utils/AssetLibrary.ts` - Asset management & caching system
  - `utils/Settings.ts` - Settings persistence helpers
- **Types Updated:**
  - Added `GamePhase.MERCHANT` enum value
  - Added `GameSettings` interface for settings persistence
  - Added `ActivePuzzle` interface for puzzle state
  - Added `activePuzzle` to `GameState`
- **Documentation Overhaul:**
  - Rewrote `agents.md` with full Development Protocols & Agent Roster
  - Added Component Inventory, Implemented Systems, Design System sections
  - Updated Key Files Reference

### Files Created This Session
- `src/game/components/EventModal.tsx`
- `src/game/components/JournalModal.tsx`
- `src/game/components/MerchantShop.tsx`
- `src/game/components/PuzzleModal.tsx`
- `src/game/components/TurnNotification.tsx`
- `src/game/utils/AssetLibrary.ts`
- `src/game/utils/Settings.ts`

### Files Modified This Session
- `src/game/types.ts` - Added GameSettings, ActivePuzzle, MERCHANT phase
- `docs/agents.md` - Complete rewrite with agent roster template

---

### Session 1 - Initial Import
- Imported game from GitHub repo
- Implemented Lovecraft design system (colors, fonts, animations)
- Created 6 investigator classes with attributes
- Added 16 enemy types with bestiary
- Implemented 3 scenarios

### Session 2 - Game Design Bible Integration
- Parsed and stored `game_design_bible.docx` in `public/docs/`
- **Skill Check System**: Added STR/AGI/INT/WIL attributes (2-5 range)
  - Detective: INT 4, Veteran: STR 5, Occultist: WIL 5
  - DC-based rolling: 2d6 + attribute bonus, count >= DC
- **Madness System**: Expanded to 8 conditions
  - Hallucination, Paranoia, Hysteria, Catatonia
  - Obsession, Amnesia, Night Terrors, Dark Insight
  - Each with CSS VFX and audio effect references
- **Edge Types**: OPEN, WALL, DOOR, SECRET, WINDOW, STAIRS
- **Obstacles**: 13 types (rubble, fire, water, darkness, ward_circle, etc.)
- Created `SkillCheckPanel.tsx` component
- Created `skillCheck.ts` utility functions

### Session 3 - Options Menu ✅ COMPLETE
- Implemented full Options menu with 5 tabs matching reference screenshots:
  - **Audio Tab**: Master Volume, Music Volume, SFX Volume sliders (0-100%)
  - **Display Tab**: High Contrast, Reduce Motion, Particles toggles
  - **Gameplay Tab**: Show Grid, Fast Mode toggles  
  - **Asset Studio Tab**: Generate Missing assets button, Export JSON button
  - **System Tab**: Reset All Game Data with confirmation dialog
- Created `src/game/components/OptionsMenu.tsx` component
- Added `GameSettings` interface with defaults
- Settings persist to localStorage under `shadows_1920s_settings` key
- Integrated with MainMenu - Options button now opens the menu
- Reduce Motion setting now affects screen shake animation
- Reset Data clears game save and returns to main menu

### Session 4 - Context-Sensitive Tooltips & Fog of War
- Created `src/game/components/ItemTooltip.tsx` with `ItemTooltip`, `SpellTooltip`, and `EnemyTooltip` components
- Added tooltips to inventory items, spells, and enemies
- **Fog of War System**:
  - Gradient visibility based on distance from player (closer = clearer)
  - Explored vs unexplored tile tracking in GameState
  - "UTFORSK" button on unexplored adjacent hexes
  - Mysterious noise overlay on never-explored tiles
  - Explored but not visible tiles show dimmed (memory effect)
  - Added `exploredTiles` to GameState type

### Files Created/Modified This Session
- `src/game/components/ItemTooltip.tsx` - Tooltip components for items, spells, and enemies
- `src/game/components/CharacterPanel.tsx` - Added item tooltips
- `src/game/components/ActionBar.tsx` - Added spell tooltips
- `src/game/components/GameBoard.tsx` - Enhanced fog of war with explore indicators
- `src/game/types.ts` - Added exploredTiles to GameState
- `src/game/ShadowsGame.tsx` - Track explored tiles on movement

---

## Notes
- Game Design Bible located at: `public/docs/game_design_bible.docx`
- Working branch: `main`
- Settings stored in: `shadows_1920s_settings` (localStorage)
- Game saves stored in: `shadows_1920s_save` (localStorage)
