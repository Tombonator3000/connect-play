# Shadows of the 1920s - Development Log

## 2026-01-19

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

### Session 4 - Context-Sensitive Tooltips
- Created `src/game/components/ItemTooltip.tsx` with `ItemTooltip`, `SpellTooltip`, and `EnemyTooltip` components
- Added tooltips to inventory items in CharacterPanel showing name, type, effect, bonus, cost, and stat modifiers
- Added tooltips to spells in ActionBar grimoire menu showing name, cost, description, effect type, value, and range
- Added tooltips to enemies on GameBoard showing name, type, damage, horror, traits, and bestiary lore
- Uses shadcn Tooltip component with custom styling matching game aesthetic

### Files Created/Modified This Session
- `src/game/components/ItemTooltip.tsx` - Tooltip components for items, spells, and enemies
- `src/game/components/CharacterPanel.tsx` - Added item tooltips
- `src/game/components/ActionBar.tsx` - Added spell tooltips
- `src/game/components/GameBoard.tsx` - Added enemy tooltips

---

## Notes
- Game Design Bible located at: `public/docs/game_design_bible.docx`
- Working branch: `main`
- Settings stored in: `shadows_1920s_settings` (localStorage)
- Game saves stored in: `shadows_1920s_save` (localStorage)
