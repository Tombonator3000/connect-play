# Shadows of the 1920s - Development Log

## 2026-01-19

### Session 9 - Fix Tile Image Display
- **Fixed missing CSS classes** that prevented tile images from showing:
  - Added `.chiaroscuro-overlay` class for dramatic shadow effects
  - Added `.oil-texture` class for canvas painting effect
  - Added tile floor texture classes: `.tile-darkwood`, `.tile-cobblestone`, `.tile-stone`, `.tile-carpet`, `.tile-marble`, `.tile-water`
  - Added glow effect classes: `.gaslight-glow`, `.ritual-glow`, `.eldritch-glow`
  - Added `.animate-gaslight` keyframe animation
- **Root cause**: GameBoard.tsx referenced CSS classes that were never added to index.css
- All 32 tile images are now visible on the game board

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
