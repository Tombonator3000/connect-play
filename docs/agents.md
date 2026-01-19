# Shadows of the 1920s - Development Protocols & Agent Roster

> *"Det er ikke døden vi frykter, men det vi ser før vi dør."*

This document serves as the "System Prompt" for the development team. It defines the architectural standards, coding philosophy, specialized roles, and complete system documentation required to maintain a scalable, modular codebase.

**Last Updated:** 2026-01-19
**Game Version:** 3.0
**Design Philosophy:** "Hero Quest meets Mansions of Madness"

---

## 1. Architectural Pillars (Read Before Coding)

To ensure minimal refactoring is needed as the game grows, all agents must adhere to these **Modularity Rules**:

### A. The "Single Source of Truth" Principle
*   **State Management:** The `GameState` object in `ShadowsGame.tsx` is the *only* source of truth for game logic.
*   **Immutability:** Never mutate state directly. Always use `setState(prev => ...)` patterns.
*   **Data Separation:** Static data (stats, descriptions, loot tables) belongs in `constants.ts`. Dynamic data (current HP, position) belongs in `types.ts` interfaces and the React State.

### B. Component Modularity (The "Lego" Rule)
*   **Dumb Components:** UI components (like `ActionBar`, `DiceRoller`, `CharacterPanel`) should be "dumb". They receive data via `props` and emit events via callbacks (e.g., `onAction`). They should **not** contain complex game logic or direct state mutations.
*   **Smart Containers:** `ShadowsGame.tsx` handles the "thinking" and passes the results down.
*   **Isolation:** CSS/Tailwind classes for a specific component should be self-contained within that component to prevent bleed-over.

### C. Future-Proofing
*   **Type Safety:** `types.ts` is the backbone. If a feature changes (e.g., adding "Madness Level 2"), update the Interface *first*.
*   **Asset Agnosticism:** The game renders with CSS shapes and Lucide icons by default. AI-generated images (`imageUrl`) are an enhancement layer, not a dependency. The game must look good even if the AI fails to generate an image.

### D. Data-Driven Design
*   **No Hardcoding:** Game mechanics should be driven by data in `constants.ts`, not hardcoded logic.
*   **Extensibility:** Adding a new enemy, scenario, or item should only require adding data, not changing logic.
*   **Referential Integrity:** Use IDs and references. Never duplicate data across files.

---

## 2. Active Agent Roster

### 🛠️ The Architect (Senior Frontend Engineer)
*   **Focus:** Core React Logic, Performance, State Integrity.
*   **Primary Files:** `ShadowsGame.tsx`, `types.ts`, `hexUtils.ts`
*   **Directives:**
    *   Ensure hex-grid math is precise (`hexDistance`, `lineOfSight` in `hexUtils.ts`).
    *   Keep `ShadowsGame.tsx` readable. If a `useEffect` exceeds 50 lines, extract it to a custom hook (e.g., `useEnemyAI`, `useSoundEngine`).
    *   Maintain strict TypeScript discipline. No `any`.
    *   All state changes must be immutable: `setState(prev => ({ ...prev, ... }))`
    *   Game phases flow: `SETUP` → `INVESTIGATOR` → `MYTHOS` → `COMBAT` → `EVENT` → (loop or `GAME_OVER`)

### 🎲 The Keeper (Lead Game Designer)
*   **Focus:** Balance, Mechanics, Narrative.
*   **Primary Files:** `constants.ts`, `game_design_bible.md`
*   **Directives:**
    *   Design mechanics that are data-driven. Example: Instead of hardcoding an event, add it to `EVENTS` in `constants.ts`.
    *   Balance the "Economy of Action" (Actions vs. Doom Clock).
    *   Ensure the "Cosmic Horror" theme is felt through mechanics (e.g., Sanity loss checks).
    *   Reference `game_design_bible.md` for canonical rules on skill checks, madness, and tile systems.
    *   Balance character attributes: STR/AGI/INT/WIL range 2-5.

### ⚔️ The Warlord (Combat & AI Engineer)
*   **Focus:** Combat Resolution, Monster AI, Spawning.
*   **Primary Files:** `combatUtils.ts`, `monsterAI.ts`
*   **Directives:**
    *   Combat uses 2d6 + attribute vs enemy defense.
    *   Horror checks trigger on first enemy encounter (WIL check).
    *   Monster AI behaviors: `aggressive`, `ranged`, `ambusher`, `patrol`, `hunt`.
    *   Spawn tables are doom-level dependent.
    *   Critical hits (all dice succeed) and critical fails (all dice fail) have special effects.

### 🎨 The Visionary (AI Art Director)
*   **Focus:** Visuals, Immersion, "Juice".
*   **Primary Files:** `AssetLibrary.ts`, `GameBoard.tsx`, `src/assets/tiles/`
*   **Model:** `gemini-2.5-flash-image` (via AssetLibrary.ts).
*   **Directives:**
    *   Write prompts that emphasize *atmosphere* over realism. Keywords: "Oil painting", "1920s", "Lovecraftian", "Chiaroscuro".
    *   Ensure generated assets are cached in `GameState` (via `imageUrl`) so they don't disappear on re-render.
    *   Provide fallbacks for when generation is pending.
    *   **84 tile images** generated with 90° top-down perspective.
    *   Tile naming convention: `tile-{type}.png` (e.g., `tile-library.png`).

### 🎹 The Virtuoso (Audio Specialist)
*   **Focus:** Soundscape, Feedback.
*   **Stack:** `Tone.js`
*   **Directives:**
    *   Audio must be non-blocking.
    *   Use procedural generation for ambience (LFOs, Filters) rather than loading large static MP3s.
    *   Create distinct "Stingers" for gameplay feedback (Success, Fail, Horror, Combat).
    *   Madness conditions have specific audio profiles (see Section 8).

### 🕵️ The Investigator (QA & Refactoring)
*   **Focus:** Edge Cases, Save/Load Stability.
*   **Primary Files:** `Settings.ts`, `localStorage` handlers
*   **Directives:**
    *   Verify `localStorage` serialization works for complex objects (like deeply nested Arrays).
    *   Ensure the game doesn't crash if an AI request fails (Network boundaries).
    *   Test fog of war state persistence.
    *   Validate scenario completion conditions.

---

## 3. Key Files Reference

### Core Game Files
| File | Purpose |
|------|---------|
| `src/game/ShadowsGame.tsx` | Main game component & state management |
| `src/game/types.ts` | All TypeScript interfaces & enums |
| `src/game/constants.ts` | Static game data (characters, items, scenarios, bestiary) |
| `src/game/hexUtils.ts` | Hex grid math utilities |

### Utility Modules
| File | Purpose |
|------|---------|
| `src/game/utils/skillCheck.ts` | Skill check dice rolling logic (2d6 + attribute) |
| `src/game/utils/combatUtils.ts` | Combat resolution, damage calculation, horror checks |
| `src/game/utils/monsterAI.ts` | Monster behavior, spawning, pathfinding |
| `src/game/utils/Settings.ts` | Settings persistence to localStorage |
| `src/game/utils/AssetLibrary.ts` | Asset management, caching, AI prompt templates |

### Documentation
| File | Purpose |
|------|---------|
| `docs/agents.md` | This file - development protocols |
| `docs/log.md` | Development session log |
| `game_design_bible.md` | Canonical game rules and mechanics |
| `public/docs/game_design_bible.docx` | Original design document |

### Assets
| Directory | Contents |
|-----------|----------|
| `src/assets/tiles/` | 84 AI-generated tile images (top-down perspective) |

---

## 4. Component Inventory

### Core Components
| Component | File | Purpose |
|-----------|------|---------|
| `GameBoard` | `components/GameBoard.tsx` | Hex grid rendering & fog of war |
| `ActionBar` | `components/ActionBar.tsx` | Player action buttons |
| `CharacterPanel` | `components/CharacterPanel.tsx` | Player stats & inventory |
| `EnemyPanel` | `components/EnemyPanel.tsx` | Selected enemy info |
| `DiceRoller` | `components/DiceRoller.tsx` | Dice roll visualization |
| `MainMenu` | `components/MainMenu.tsx` | Title screen & scenario select |

### Modal Components
| Component | File | Purpose |
|-----------|------|---------|
| `OptionsMenu` | `components/OptionsMenu.tsx` | Settings (Audio, Display, Gameplay) |
| `EventModal` | `components/EventModal.tsx` | Event card display |
| `JournalModal` | `components/JournalModal.tsx` | Field Guide / Bestiary |
| `MerchantShop` | `components/MerchantShop.tsx` | Buy/sell items |
| `PuzzleModal` | `components/PuzzleModal.tsx` | Memory sequence puzzles |
| `SkillCheckPanel` | `components/SkillCheckPanel.tsx` | Skill check UI |

### Utility Components
| Component | File | Purpose |
|-----------|------|---------|
| `ItemTooltip` | `components/ItemTooltip.tsx` | Hover tooltips for items/spells/enemies |
| `TurnNotification` | `components/TurnNotification.tsx` | Phase/turn announcements |

---

## 5. Implemented Systems

### ✅ Complete
| System | Description | Key Files |
|--------|-------------|-----------|
| **Skill Check** | STR/AGI/INT/WIL attributes, DC-based 2d6 + attribute dice | `skillCheck.ts` |
| **Combat** | Attack rolls, horror checks, critical hits/fails, weapon bonuses | `combatUtils.ts` |
| **Monster AI** | Patrol, hunt, spawn tables, vision detection | `monsterAI.ts` |
| **Madness** | 8 conditions with CSS visual effects and audio cues | `types.ts`, `index.css` |
| **Edge & Obstacles** | 13 obstacle types, 7 door states, lockpick mechanics | `constants.ts` |
| **Options Menu** | Audio, Display, Gameplay, Asset Studio, System tabs | `OptionsMenu.tsx` |
| **Fog of War** | 4 visibility states, gradient-based distance, memory effect | `GameBoard.tsx` |
| **Tooltips** | Context-sensitive Item, Spell, and Enemy tooltips | `ItemTooltip.tsx` |
| **Scenario System** | 15 scenarios with difficulty-based random selection | `constants.ts` |
| **Tile System** | 84 AI-generated tiles with 170+ keyword mappings | `GameBoard.tsx` |

### 🚧 Pending Systems
| System | Status | Notes |
|--------|--------|-------|
| **Puzzles** | Modal created | 6 types from bible, needs integration |
| **Audio** | Planned | Tone.js for procedural, ElevenLabs for voice |
| **Merchant** | Phase added | Shop UI exists, needs integration |
| **Event Deck** | Partial | Card structure exists, cycling pending |
| **Save/Load** | Partial | Structure exists in localStorage |

### 📊 Game Statistics
- **Investigators:** 6 playable classes
- **Enemies:** 16 types in bestiary
- **Scenarios:** 15 available
- **Tiles:** 84 unique images
- **Madness Conditions:** 8 types

---

## 6. Design System

### Typography
- **Display Font:** Cinzel Decorative (titles, headers)
- **Body Font:** Crimson Pro (descriptions, body text)
- **System:** Monospace for game data/stats

### Color Tokens (from index.css)
| Token | Hex | Usage |
|-------|-----|-------|
| `--doom` | `#8B0000` | Doom counter, danger elements |
| `--sanity` | `#6B21A8` | Sanity meter, purple accents |
| `--health` | `#991B1B` | HP indicators, damage |
| `--insight` | `#059669` | Insight points, knowledge |
| `--sepia` | `#D4A574` | Aged paper textures |
| `--gold` | `#F59E0B` | Amber/gold accents |
| `--prussian` | `#003153` | Shadows, night sky |
| `--eldritch` | `#1A4D2E` | Lovecraftian green, supernatural |

### Floor Textures (CSS Classes)
| Class | Usage |
|-------|-------|
| `.floor-darkwood` | Manor, Library, Study, Bedroom |
| `.floor-cobblestone` | Street, Alley, Square, Market |
| `.floor-tile` | Hospital, Asylum, Lab |
| `.floor-stone` | Crypt, Cellar, Church |
| `.floor-grass` | Park, Cemetery, Forest |
| `.floor-water` | Harbor, Sewer, Underground |
| `.floor-ritual` | Ritual Chamber, Altar, Portal |

### Visual Effects
| Effect | Class | Usage |
|--------|-------|-------|
| Chiaroscuro | `.chiaroscuro-overlay` | Dramatic light/dark contrast |
| Oil texture | `.oil-texture` | Painting aesthetic |
| Gaslight glow | `.gaslight-glow` | Indoor lighting |
| Eldritch glow | `.eldritch-glow` | Supernatural elements |
| Ritual glow | `.ritual-glow` | Occult symbols |

---

## 7. Character System

### Investigator Classes
| Class | STR | AGI | INT | WIL | Special Ability |
|-------|-----|-----|-----|-----|-----------------|
| **Detective** | 3 | 3 | **4** | 3 | Investigate +1 die |
| **Professor** | 2 | 2 | **5** | **4** | Read occult, no Sanity loss |
| **Veteran** | **5** | 3 | 2 | 3 | Combat +1 die, Str checks |
| **Occultist** | 2 | 3 | 3 | **5** | Can perform rituals |
| **Journalist** | 2 | **4** | 4 | 3 | +1 Move, escape bonus |
| **Doctor** | 2 | 3 | **4** | **4** | Heal 2 instead of 1 |

### Attribute Usage
| Attribute | Used For |
|-----------|----------|
| **STRENGTH** | Melee combat, breaking doors, moving rubble |
| **AGILITY** | Ranged combat, lockpicking, dodging, climbing |
| **INTELLECT** | Investigation, puzzles, reading texts |
| **WILLPOWER** | Horror checks, occult actions, sanity recovery |

---

## 8. Madness System

### Conditions & Effects
| Condition | Mechanical Effect | Visual VFX | Audio |
|-----------|-------------------|------------|-------|
| **HALLUCINATIONS** | 25% false enemies, must "attack" them | Wavy distortion, flicker | Whispers |
| **PARANOIA** | Cannot share tile, -1 near others | Red shift, heartbeat | Heartbeat |
| **HYSTERIA** | 50% lose 1 AP to random action | Screen shake, jitter | Erratic tempo |
| **CATATONIA** | -1 AP, cannot Flee | Desaturated, slow | Muffled sounds |
| **OBSESSION** | Must investigate ALL before leaving | Glowing outlines | -- |
| **AMNESIA** | Fog resets each round | Heavy blur | -- |
| **NIGHT TERRORS** | Cannot Rest, Sleep = -1 Sanity | Dark vignette | Droning |
| **DARK INSIGHT** | +2 Insight, +1 Doom per round | Purple glow | Cosmic static |

### Sanity Loss Triggers
| Trigger | Loss | Can Resist? |
|---------|------|-------------|
| First enemy sight | -1 | WIL DC 4 |
| Read occult text | -1 | Professor immune |
| Ally death | -2 | No |
| Perform ritual | -1 to -3 | Occultist halved |
| See portal | -2 | WIL DC 5 |

---

## 9. Combat Quick Reference

### Attack Resolution
```
Roll: 2d6 + STR (melee) or 2d6 + AGI (ranged)
Count successes >= Enemy Defense
1+ success = Hit, apply weapon damage
Critical: All dice succeed = double damage
Critical Fail: All dice fail = weapon jam/drop
```

### Horror Check (First Encounter)
```
Roll: 2d6 + WIL vs Enemy Horror DC
Fail = Sanity loss based on enemy type
```

### Enemy Threat Levels
| Level | Sanity Loss | WIL DC | Examples |
|-------|-------------|--------|----------|
| Minor | -1 | 3 | Cultist |
| Moderate | -1 | 4 | Ghoul |
| Major | -2 | 4 | Deep One |
| Extreme | -3 | 5 | Shoggoth |
| Cosmic | -2 to -4 | 5 | Portal, Great Old One |

---

## 10. Action Point Costs

| Action | AP | Notes |
|--------|-----|-------|
| Move (normal) | 1 | Per hex |
| Move (difficult) | 2 | Water, rubble |
| Open door | 1 | |
| Investigate | 1 | INT check |
| Attack | 1 | |
| Use item | 1 | |
| Lockpick | 1 | AGI check |
| Clear rubble | 2 | STR check |
| Rest | 2 | +1 Sanity |
| Use stairs | 2 | Change level |

---

## 11. Storage & Persistence

### localStorage Keys
| Key | Contents |
|-----|----------|
| `shadows_1920s_settings` | Audio, display, gameplay settings |
| `shadows_1920s_save` | Game state, player progress |
| `shadows_1920s_assets_v1` | Cached AI-generated images |

### Working Branch
- **Current:** `main`
- **Repo:** `Tombonator3000/connect-play`

---

## 12. Development Workflow

### Before Coding
1. Read relevant sections of `game_design_bible.md`
2. Check `docs/log.md` for recent changes
3. Review `types.ts` for interface definitions

### After Coding
1. Update `docs/log.md` with session summary
2. Run build to verify no type errors
3. Test affected systems manually

### Commit Message Format
```
<type>: <description>

Types: feat, fix, refactor, style, docs, test
```

---

*"Ph'nglui mglw'nafh Cthulhu R'lyeh wgah'nagl fhtagn."*

**--- END OF AGENTS DOCUMENTATION ---**
