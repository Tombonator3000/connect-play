# Claude AI Integration - Todo List

## Fase 1: Dynamic Room Descriptions (Current)

### Completed
- [x] Analyse av eksisterende systemer
- [x] Identifisert integreringspunkter (CursorTooltip, ShadowsGame)

### In Progress
- [ ] Lag `src/game/services/claudeService.ts`
- [ ] Lag prompt templates for room descriptions
- [ ] Integrer med tile description system
- [ ] Legg til localStorage caching

### Todo
- [ ] Test med ulike tile-typer
- [ ] Fallback til LOCATION_DESCRIPTIONS ved API-feil
- [ ] Rate limiting / debounce for API calls
- [ ] Loading states i UI

---

## Fase 2: Dynamic Game Master (Future)

### Planning
- [ ] Design DM context interface
- [ ] Identifiser trigger-points for narration
- [ ] Design UI for DM-meldinger (toast/overlay)

### Implementation
- [ ] Extend claudeService med DM-funksjonalitet
- [ ] Lag DMContext type med spilltilstand
- [ ] Integrer i ShadowsGame for events:
  - [ ] Enemy spawn nearby
  - [ ] Low sanity warnings
  - [ ] Objective progress
  - [ ] Combat outcomes
  - [ ] Doom level changes
- [ ] Lag DMNarrationPanel komponent

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
