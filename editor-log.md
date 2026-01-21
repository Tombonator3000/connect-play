# Quest Editor Development Log

## 2026-01-21: Campaign Play Integration Session

### Status ved start
- CampaignEditor.tsx eksisterer med full UI for å lage kampanjer
- CustomQuestLoader.tsx eksisterer for å laste enkelt-quests
- NPCPalette.tsx har NPC-plassering, men mangler dialog-system
- Campaign play er IKKE integrert i hovedspillet

---

## IMPLEMENTERT DENNE SESJONEN

### PRIORITET 1: Campaign Play Integration - IMPLEMENTERT

**Nye filer opprettet:**
- `CampaignPlayManager.tsx` - Full kampanje-spillhåndtering med:
  - Kampanjeliste og valg
  - Hero-valg for kampanjer
  - Quest-progresjon mellom quests
  - Shared gold pool tracking
  - Campaign progress lagring i localStorage
  - Mellom-quest UI med merchant-tilgang

**Endringer i eksisterende filer:**
- `MainMenu.tsx` - Lagt til "Play Campaign" knapp
- `ShadowsGame.tsx` - Integrert CampaignPlayManager, lagt til 'campaign' i MainMenuView
- `CustomQuestLoader.tsx` - Eksportert `convertQuestToScenario` og `SavedQuest`
- `index.tsx` - Eksportert alle nye komponenter

### PRIORITET 2: NPC Dialog System - IMPLEMENTERT

**Nye filer opprettet:**
- `DialogEditor.tsx` - Full dialog-tree builder med:
  - Visuelle dialog-noder
  - Branching conversation trees
  - Conditions (has_item, has_insight, stat_check, etc.)
  - Effects (give_item, give_gold, reveal_objective, etc.)
  - Preview-modus for testing av dialogen

**Endringer i eksisterende filer:**
- `NPCPalette.tsx` - Integrert dialog-editor:
  - Lagt til `dialogTree` og `hasComplexDialog` i NPCPlacement
  - Toggle mellom enkel greeting og kompleks dialog
  - Knapp for å åpne DialogEditor

### PRIORITET 3: Scenario Templates - IMPLEMENTERT

**Nye filer opprettet:**
- `ScenarioTemplates.tsx` - Template browser med:
  - **Quick Start Templates:**
    - "Escape the Manor" - Klassisk escape-scenario
    - "The Mystery" - Investigation-fokusert
    - "Boss Hunt" - Combat-fokusert boss-scenario
  - **Pre-made Layouts:**
    - Small Manor (8 tiles)
    - Abandoned Church (8 tiles, gothic)
    - Dockside Warehouse (6 tiles, noir)
  - Template preview med stats, objectives, briefing
  - Kategori-filtrering (All, Quick Start, Layouts)

---

## RESTERENDE OPPGAVER (til fremtidige sesjoner)

### PRIORITET 4: Visual Improvements (IKKE STARTET)

**Må implementeres:**
- [ ] Tile connection visualization (linjer mellom koblede tiles)
- [ ] Mini-map for store scenarios
- [ ] Drag-and-drop tiles (kan flytte tiles)
- [ ] Bulk editing av monstre/items

**Forslag til implementering:**
- Tile connections: Bruk SVG overlay på canvas med linjer
- Mini-map: Separate canvas med skalert visning
- Drag-and-drop: Implementer onDragStart/onDrop events på tiles
- Bulk editing: Multi-select modus med shift+click

### PRIORITET 5: Quality of Life (IKKE STARTET)

**Må implementeres:**
- [ ] Keyboard shortcuts panel (vise alle shortcuts)
- [ ] Auto-save funksjon (lagre hvert 30 sek)
- [ ] Quest complexity/difficulty estimator

**Forslag til implementering:**
- Keyboard shortcuts: Overlay panel med alle tilgjengelige shortcuts
- Auto-save: useEffect med setInterval, lagre til localStorage
- Complexity estimator:
  - Basere på tile-count, monster-count, objective-count
  - Vis estimert spilletid
  - Advare om ubalansert vanskelighetsgrad

---

## Tekniske Notater

### Campaign Context Storage
Kampanje-kontekst lagres i localStorage som `active_campaign_context` når et quest startes.
Dette brukes etter quest-completion for å:
- Oppdatere campaign progress
- Tildele bonus XP/gold
- Gå til neste quest

### Dialog Tree Structure
```typescript
DialogTree {
  id: string
  name: string
  nodes: DialogNode[]
  rootNodeId: string
}

DialogNode {
  id: string
  npcText: string
  options: DialogOption[]
  isRoot?: boolean
}

DialogOption {
  id: string
  text: string
  condition?: DialogCondition
  effects?: DialogEffect[]
  nextNodeId?: string
  isExit?: boolean
}
```

### Scenario Template Usage
Templates inneholder:
- Pre-konfigurerte tiles med edges
- Pre-definerte objectives
- Metadata (title, briefing, doom, difficulty)

Når bruker velger en template:
1. Tiles kopieres til editor
2. Objectives kopieres
3. Metadata fylles ut
4. Bruker kan tilpasse videre
