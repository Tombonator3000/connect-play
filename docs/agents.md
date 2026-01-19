# Shadows of the 1920s - Agent Instructions

## Project Overview
Lovecraft-inspired roguelike board game built with React, TypeScript, and Tailwind CSS.

## Key Files
- `src/game/ShadowsGame.tsx` - Main game component
- `src/game/types.ts` - Type definitions
- `src/game/constants.ts` - Game constants (characters, items, scenarios)
- `public/docs/game_design_bible.docx` - Full game design document

## Design System
- Font: Cinzel Decorative (display), Crimson Pro (body)
- Colors: doom (red), sanity (purple), health (red), insight (blue), sepia, gold
- Use semantic tokens from index.css

## Current Branch
Working on: `main`

## Implemented Systems
1. ✅ Skill Check System (STR/AGI/INT/WIL attributes, DC-based)
2. ✅ Madness System (8 conditions with CSS effects)
3. ✅ Edge Types & Obstacles (13 obstacle types, 7 door states)
4. ✅ Options Menu (Audio, Display, Gameplay, Asset Studio, System tabs)

## Pending Systems
- Fog of War (4 visibility states)
- Puzzles (6 types from bible)
- Audio implementation (Tone.js / ElevenLabs)
