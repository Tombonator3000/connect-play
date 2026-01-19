# Shadows of the 1920s - Development Log

## 2026-01-19

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
