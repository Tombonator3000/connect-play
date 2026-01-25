# Mythos Quest - Todo List

---

## Manglende Grafikk (Identifisert 2026-01-25)

### ✅ Høy Prioritet: Monster-Grafikk (14 stk) - FERDIG 2026-01-25

Alle monstre har nå unike AI-genererte portretter:

| Monster | Status |
|---------|--------|
| ghast | ✅ Generert |
| zoog | ✅ Generert |
| rat_thing | ✅ Generert |
| fire_vampire | ✅ Generert |
| dimensional_shambler | ✅ Generert |
| serpent_man | ✅ Generert |
| gug | ✅ Generert |
| cthonian | ✅ Generert |
| tcho_tcho | ✅ Generert |
| flying_polyp | ✅ Generert |
| lloigor | ✅ Generert |
| gnoph_keh | ✅ Generert |
| colour_out_of_space | ✅ Generert |
| elder_thing | ✅ Generert |

**Filplassering:** `/src/assets/monsters/`

### Medium Prioritet: Item-Ikoner

Item-kategorier som kun vises som tekstliste:

- [ ] **Armor-ikoner** (5+ typer)
  - Leather vest, Chain mail, Heavy coat, Reinforced jacket, etc.
- [ ] **Tool-ikoner** (8+ typer)
  - Lock pick, Crowbar, Rope, Flashlight, First aid kit, etc.
- [ ] **Consumable-ikoner** (6+ typer)
  - Bandages, Morphine, Whiskey, Ancient tome, etc.
- [ ] **Key/Clue-ikoner** (scenario-spesifikke)
  - Library key, Safe combination, Strange artifact, etc.
- [ ] **Relic-ikoner** (5+ typer)
  - Elder Sign, Powder of Ibn Ghazi, Silver dagger, etc.

**Nåværende løsning:** Tekstbasert liste uten ikoner
**Mulig løsning:** SVG-ikoner som våpnene bruker

### Lav Prioritet: Forbedringsforslag

- [ ] Animated monster sprites (idle, attack)
- [ ] Item rarity-based glow effects
- [ ] Character ability icons

---

# Claude AI Integration - Todo List

## Fase 1: Dynamic Room Descriptions ✅ FERDIG

### Completed
- [x] Analyse av eksisterende systemer
- [x] Identifisert integreringspunkter (CursorTooltip, ShadowsGame)
- [x] Lag `src/game/services/claudeService.ts`
- [x] Lag prompt templates for room descriptions
- [x] Integrer med tile description system
- [x] Legg til localStorage caching
- [x] Fallback til LOCATION_DESCRIPTIONS ved API-feil
- [x] Rate limiting / debounce for API calls
- [x] Loading states i UI

---

## Fase 2: Dynamic Game Master ✅ FERDIG (2026-01-25)

### Completed
- [x] Design DM context interface (`GMNarrationContext`)
- [x] Identifiser trigger-points for narration (16 typer)
- [x] Design UI for DM-meldinger (DMNarrationPanel)
- [x] Extend claudeService med DM-funksjonalitet
- [x] Lag DMContext type med spilltilstand
- [x] Lag `useAIGameMaster` hook med:
  - [x] Priority queue system
  - [x] Cooldown mellom meldinger
  - [x] Settings persistence
- [x] Integrer i ShadowsGame for events:
  - [x] Enemy spawn nearby
  - [x] Boss encounters
  - [x] Exploration narration
  - [x] Doom level changes
  - [x] Phase changes
  - [x] Objective completion
- [x] Lag DMNarrationPanel komponent med:
  - [x] Typewriter effekt
  - [x] Auto-dismiss
  - [x] Farge-skjemaer per type
  - [x] Dekorative elementer

### Remaining (minor) - ✅ FERDIG 2026-01-25
- [x] Koble combat-triggere (start/victory/defeat)
- [x] Koble sanity-triggere
- [x] Koble item discovery triggere
- [x] Settings-knapp i game UI

---

## Fase 3: Adaptive Hints System (Future)

> **Status:** Ikke startet
> **Avhengigheter:** Fase 2 (GM Narration) ✅

### Planning
- [ ] Design hint trigger logic
- [ ] Identifiser "stuck" heuristics (tid på samme tile, mange runder uten progress, etc.)
- [ ] Definere hint-typer (objective hints, combat tips, exploration suggestions)

### Implementation
- [ ] Track player progress metrics i game state
- [ ] Lag hint generation prompts for Claude API
- [ ] Integrer med objective system for kontekstuell relevans
- [ ] Lag hint UI (subtle toast, integrert i GM panel)
- [ ] Cooldown-system for å unngå hint-spam

---

## Fase 4: AI-Enhanced Scenario Narratives (Future) - REVIDERT

> **Status:** Ikke startet
> **Merk:** Algoritmisk scenario generator eksisterer allerede i `scenarioGenerator.ts`

### Eksisterende System
Vi har allerede en komplett scenario generator med:
- 9 mission types (escape, assassination, survival, collection, rescue, investigation, ritual, seal_portal, purge)
- Automatic location/enemy/doom event generation
- Winnability validation (`scenarioValidator.ts`)
- 100+ unike kombinasjoner

### Revidert Scope: AI Enhancement (ikke erstatning)
- [ ] AI-genererte briefings som utvider template-baserte briefings
- [ ] Dynamiske plot twists basert på spillerhandlinger
- [ ] Personaliserte narrative hooks basert på valgt karakter
- [ ] AI-forbedret location descriptions for genererte tiles

### Implementation
- [ ] Lag prompts for briefing enhancement
- [ ] Integrer med eksisterende `generateRandomScenario()`
- [ ] Cache AI-generert innhold per scenario-seed
- [ ] Fallback til template-briefings ved API-feil

---

## Fase 5: Monster Personality & Combat Narration (Future)

> **Status:** Ikke startet
> **Prioritet:** Medium - gir god atmosfære

### Planning
- [ ] Design personality trait system (aggressive, cunning, fearful, ancient, hungry)
- [ ] Identifiser narration points (spawn, attack, damage, flee, death)
- [ ] Definere personality-to-behavior mapping

### Implementation
- [ ] Extend `Enemy` type med `personality?: MonsterPersonality`
- [ ] Lag personality generation ved spawn (basert på enemy type + context)
- [ ] AI-generert flavor text for combat actions
- [ ] Integrer med DMNarrationPanel for combat narration
- [ ] Cache personality per enemy instance

---

## Fase 6: AI-Enhanced Doom Events (Future) - REVIDERT

> **Status:** Ikke startet
> **Merk:** Doom events genereres allerede i `scenarioGeneratorHelpers.ts`

### Eksisterende System
- Doom events med enemy spawns og boss encounters
- Mission-specific og atmosphere-specific enemy pools
- Threshold-basert triggering

### Revidert Scope: AI Enhancement
- [ ] AI-genererte event descriptions (utover standard messages)
- [ ] Dynamiske events basert på spillsituasjon
- [ ] "Random encounters" generert av AI mid-game
- [ ] Narrative konsekvenser av doom events

### Implementation
- [ ] Extend `DoomEvent` type med `aiDescription?: string`
- [ ] Lag prompts for contextual event narration
- [ ] Integrer med GM system for event announcements
- [ ] Balanserings-sjekker for AI-genererte encounters

---

## Technical Debt / Improvements

### API & Infrastructure
- [ ] Server-side proxy for API key security
- [ ] Caching layer (Redis/similar for prod)
- [ ] Rate limiting implementation
- [ ] Error handling & retry logic

### Performance
- [ ] Pre-generate content pool at build time
- [ ] Lazy loading of AI features
- [ ] Bundle size optimization

### Testing
- [ ] Unit tests for claudeService
- [ ] Integration tests for AI features
- [ ] Mock API responses for dev

---

## Configuration

### Environment Variables Needed
```env
VITE_CLAUDE_API_KEY=your-api-key  # For dev only
VITE_CLAUDE_API_URL=https://api.anthropic.com  # Or proxy URL
VITE_ENABLE_AI_FEATURES=true  # Feature flag
```

### Feature Flags
- `enableAIDescriptions` - Room descriptions
- `enableAIDM` - Game Master narration
- `enableAIHints` - Adaptive hints
- `enableAIScenarios` - Scenario generation

---

## Notes

### Prompt Engineering Guidelines
1. Keep prompts concise (<500 tokens input)
2. Use consistent tone: "Lovecraftian, 1920s, dread without gore"
3. Include context but don't over-specify
4. Request short outputs (1-3 sentences)

### Caching Strategy
1. Cache by tile name + features hash
2. localStorage for client-side
3. Consider IndexedDB for larger cache
4. Expiry: 7 days or clear on version bump

### API Cost Considerations
- Use Haiku for descriptions (cheapest)
- Batch requests where possible
- Pre-generate common content
- Implement usage tracking
