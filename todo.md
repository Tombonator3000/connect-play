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

### Planning
- [ ] Design hint trigger logic
- [ ] Identifiser "stuck" heuristics

### Implementation
- [ ] Track player progress metrics
- [ ] Lag hint generation prompts
- [ ] Integrer med objective system
- [ ] Lag hint UI (subtle, non-intrusive)

---

## Fase 4: Scenario Generator (Future)

### Planning
- [ ] Design scenario template format
- [ ] Identifiser genererbare elementer

### Implementation
- [ ] Lag scenario generation prompts
- [ ] Integrer med Quest Editor
- [ ] Validering av genererte scenarier
- [ ] Balanserings-sjekker

---

## Fase 5: Monster Personality (Future)

### Planning
- [ ] Design personality trait system
- [ ] Identifiser narration points

### Implementation
- [ ] Extend Enemy type med personality
- [ ] Lag personality generation ved spawn
- [ ] Integrer med monsterAI for flavor text
- [ ] Combat narration basert på personality

---

## Fase 6: Event Generator (Future)

### Planning
- [ ] Design event structure for AI generation
- [ ] Identifiser context requirements

### Implementation
- [ ] Extend eventDeckManager
- [ ] Lag event generation prompts
- [ ] Validering av genererte events
- [ ] Balanserings-sjekker

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
