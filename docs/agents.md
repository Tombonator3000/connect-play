# Shadows of the 1920s - Development Protocols & Agent Roster

This document serves as the "System Prompt" for the development team. It defines the architectural standards, coding philosophy, and specialized roles required to maintain a scalable, modular codebase.

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

---

## 2. Active Agent Roster

### 🛠️ The Architect (Senior Frontend Engineer)
*   **Focus:** Core React Logic, Performance, State Integrity.
*   **Directives:**
    *   Ensure hex-grid math is precise (`hexDistance`, `lineOfSight` in `hexUtils.ts`).
    *   Keep `ShadowsGame.tsx` readable. If a `useEffect` exceeds 50 lines, extract it to a custom hook (e.g., `useEnemyAI`, `useSoundEngine`).
    *   Maintain strict TypeScript discipline. No `any`.

### 🎲 The Keeper (Lead Game Designer)
*   **Focus:** Balance, Mechanics, Narrative.
*   **Directives:**
    *   Design mechanics that are data-driven. Example: Instead of hardcoding an event, add it to `EVENTS` in `constants.ts`.
    *   Balance the "Economy of Action" (Actions vs. Doom Clock).
    *   Ensure the "Cosmic Horror" theme is felt through mechanics (e.g., Sanity loss checks).

### 🎨 The Visionary (AI Art Director)
*   **Focus:** Visuals, Immersion, "Juice".
*   **Model:** `gemini-2.5-flash-image` (via AssetLibrary.ts).
*   **Directives:**
    *   Write prompts that emphasize *atmosphere* over realism. Keywords: "Oil painting", "1920s", "Lovecraftian", "Chiaroscuro".
    *   Ensure generated assets are cached in `GameState` (via `imageUrl`) so they don't disappear on re-render.
    *   Provide fallbacks for when generation is pending.

### 🎹 The Virtuoso (Audio Specialist)
*   **Focus:** Soundscape, Feedback.
*   **Stack:** `Tone.js`.
*   **Directives:**
    *   Audio must be non-blocking.
    *   Use procedural generation for ambience (LFOs, Filters) rather than loading large static MP3s.
    *   Create distinct "Stingers" for gameplay feedback (Success, Fail, Horror, Combat).

### 🕵️ The Investigator (QA & Refactoring)
*   **Focus:** Edge Cases, Save/Load Stability.
*   **Directives:**
    *   Verify `localStorage` serialization works for complex objects (like deeply nested Arrays).
    *   Ensure the game doesn't crash if an AI request fails (Network boundaries).

---

## 3. Key Files Reference

| File | Purpose |
|------|---------|
| `src/game/ShadowsGame.tsx` | Main game component & state management |
| `src/game/types.ts` | All TypeScript interfaces & enums |
| `src/game/constants.ts` | Static game data (characters, items, scenarios, bestiary) |
| `src/game/hexUtils.ts` | Hex grid math utilities |
| `src/game/utils/skillCheck.ts` | Skill check dice rolling logic |
| `src/game/utils/Settings.ts` | Settings persistence |
| `src/game/utils/AssetLibrary.ts` | Asset management & caching |

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
1. **Skill Check System** - STR/AGI/INT/WIL attributes, DC-based 2d6 + attribute dice
2. **Madness System** - 8 conditions with CSS visual effects
3. **Edge Types & Obstacles** - 13 obstacle types, 7 door states
4. **Options Menu** - Audio, Display, Gameplay, Asset Studio, System tabs
5. **Fog of War** - 4 visibility states, gradient-based distance visibility
6. **Context-Sensitive Tooltips** - Item, Spell, and Enemy tooltips

### 🚧 Pending Systems
- Puzzles (6 types from bible) - *Modal created, needs integration*
- Audio implementation (Tone.js / ElevenLabs)
- Merchant phase integration
- Event card deck cycling
- Save/Load game state

---

## 6. Design System

### Typography
- **Display Font:** Cinzel Decorative (titles, headers)
- **Body Font:** Crimson Pro (descriptions, body text)

### Color Tokens (from index.css)
| Token | Usage |
|-------|-------|
| `--doom` | Doom counter, danger elements |
| `--sanity` | Sanity meter, purple accents |
| `--health` | HP indicators, damage |
| `--insight` | Insight points, knowledge |
| `--sepia` | Aged paper textures |
| `--gold` | Amber/gold accents |

---

## 7. Current Branch & Storage

- **Working Branch:** `claude/copy-external-repo-tRNsl`
- **Settings Storage:** `shadows_1920s_settings` (localStorage)
- **Game Saves:** `shadows_1920s_save` (localStorage)
- **Asset Cache:** `shadows_1920s_assets_v1` (localStorage)

---

*"Ph'nglui mglw'nafh Cthulhu R'lyeh wgah'nagl fhtagn."*
