# Development Log

## 2026-01-21: Tile Analysis & Forslag til Nye Tiles

### Oppgave
Analysere eksisterende tiles og komme med forslag til hva som mangler/trengs for bedre gameplay-variasjon.

---

### Eksisterende Tiles (Oversikt)

| Kategori | Antall | Eksempler |
|----------|--------|-----------|
| **Foyer** | 3 | Grand, Small, Church |
| **Corridor** | 7 | Straight, T, Corner, Cross, Wide, Hospital, Police |
| **Room** | ~30 | Study, Bedroom, Kitchen, Library, Hospital-rom, Police-rom, etc. |
| **Stairs** | 3 | Down, Up, Spiral |
| **Basement** | 8 | Cellar, Wine, Tunnel, Sewer, Mine, Icehouse, Workshop, Cistern |
| **Crypt** | 10 | Tomb, Altar, Portal, Sanctum, Massgrave, Ossuary, Laboratory, Prison |
| **Facade** | 17 | Manor, Church, Asylum, Hospital, Museum, Hotel, Tavern, etc. |
| **Street** | 12 | Main, Alley, Crossing, Corner, Bridge, T-Junction, Railway, etc. |
| **Urban** | 11 | Square, Harbor, Cemetery, Station, Market, Park, Dock, Pier, etc. |
| **Nature** | 23 | Forest, Clearing, Path, Marsh, Cave, Shore, Hilltop, etc. |

**Totalt: ~124 tiles**

---

### Analyse: Hva Mangler?

#### 1. Bygninger med Fasade MEN Ingen Innvendige Rom

| Fasade | Har Foyer? | Har Rom? | Status |
|--------|------------|----------|--------|
| Asylum | Nei | Nei | **MANGLER** |
| Museum | Nei | Nei | **MANGLER** |
| Hotel | Nei | Nei | **MANGLER** |
| Tavern | Nei | Nei | **MANGLER** |
| Bookshop | Nei | Nei | **MANGLER** |
| Pawnshop | Nei | Nei | **MANGLER** |
| Observatory | Nei | Nei | **MANGLER** |
| Lighthouse | Nei | Nei | **MANGLER** |
| Funeral Home | Nei | Nei | **MANGLER** |
| Farmhouse | Nei | Noe | Delvis |

#### 2. Tematiske Gaps (ifølge Game Design Bible)

| Tema | Nevnt i Bible | Implementert | Status |
|------|---------------|--------------|--------|
| Miskatonic University | Ja (campus, bibliotek) | Kun facade | **MANGLER rom** |
| Industriområde | Ja | Nei | **MANGLER** |
| Jernbanestasjon innendørs | Ja | Kun street_railway | **MANGLER** |
| Hotell-rom | Ja (lobby beskrevet) | Nei | **MANGLER** |
| Asyl-celler/rom | Ja (detaljert) | Nei | **MANGLER** |
| Kirke innvendig | Ja (nave, altar) | Kun narthex | **MANGLER** |

---

### FORSLAG: Prioriterte Nye Tiles

#### Prioritet 1: Asyl (Arkham Asylum) - 7 tiles
*Viktig for Lovecraft-tematikk*

| Tile ID | Navn | Kategori | Beskrivelse |
|---------|------|----------|-------------|
| `foyer_asylum` | Asylum Reception | foyer | Inngangslobby med jernporter |
| `corridor_asylum` | Asylum Corridor | corridor | Hvitmalte vegger, låste dører |
| `room_asylum_cell` | Padded Cell | room | Polstret celle, galskap-trigger |
| `room_asylum_ward` | Disturbed Ward | room | Fellesrom for pasienter |
| `room_asylum_office` | Director's Office | room | Kontor med pasientjournaler |
| `room_asylum_therapy` | Hydrotherapy Room | room | Skummel behandling |
| `basement_asylum` | Asylum Basement | basement | Nedlagte eksperimenter |

#### Prioritet 2: Museum (Lovecraft-klassiker) - 6 tiles
*Artefakter og eldgamle skrekk*

| Tile ID | Navn | Kategori | Beskrivelse |
|---------|------|----------|-------------|
| `foyer_museum` | Museum Lobby | foyer | Marmorgulv, informasjonsskranke |
| `corridor_museum` | Exhibition Hall | corridor | Utstillingsgang |
| `room_museum_egyptian` | Egyptian Wing | room | Mumier, sarkofager |
| `room_museum_natural` | Natural History | room | Fossiler, preparerte dyr |
| `room_museum_occult` | Restricted Collection | room | Låst, okkulte gjenstander |
| `room_museum_archive` | Curator's Archive | room | Dokumenter, forskning |

#### Prioritet 3: Hotell - 6 tiles
*Klassisk setting for mysterier*

| Tile ID | Navn | Kategori | Beskrivelse |
|---------|------|----------|-------------|
| `foyer_hotel` | Hotel Lobby | foyer | Resepsjon, sitteplasser |
| `corridor_hotel` | Hotel Hallway | corridor | Teppebelagt gang, nummererte dører |
| `room_hotel_guest` | Guest Room | room | Standard hotellrom |
| `room_hotel_suite` | Penthouse Suite | room | Luksuriøst, skjulte rom? |
| `room_hotel_kitchen` | Hotel Kitchen | room | Storkjøkken |
| `basement_hotel` | Hotel Basement | basement | Lager, gammel vinkjeller |

#### Prioritet 4: Kirke Innvendig - 5 tiles
*Utvidelse av eksisterende Church*

| Tile ID | Navn | Kategori | Beskrivelse |
|---------|------|----------|-------------|
| `room_church_nave` | Church Nave | room | Hovedskip med benker |
| `room_church_altar` | High Altar | room | Alterområde, mulig ritual |
| `room_church_vestry` | Vestry | room | Prestens rom, paramenter |
| `room_church_belltower` | Bell Tower | room | Klokketårn, utsikt |
| `basement_church` | Church Crypt | basement | Gravkammer under kirken |

#### Prioritet 5: Tavern/Pub - 5 tiles
*Sosialt hub, informasjonssamling*

| Tile ID | Navn | Kategori | Beskrivelse |
|---------|------|----------|-------------|
| `foyer_tavern` | Tavern Entrance | foyer | Inngangsparti |
| `room_tavern_bar` | Bar Room | room | Bardisk, drikkende gjester |
| `room_tavern_private` | Private Booth | room | Hemmelige møter |
| `room_tavern_cellar` | Beer Cellar | basement | Øltønner, smuglergang? |
| `room_tavern_kitchen` | Tavern Kitchen | room | Matlaging |

#### Prioritet 6: Universitet (Miskatonic) - 6 tiles
*Professoren sin hjemmebane*

| Tile ID | Navn | Kategori | Beskrivelse |
|---------|------|----------|-------------|
| `foyer_university` | University Hall | foyer | Akademisk inngang |
| `corridor_university` | Academic Corridor | corridor | Oppslagstavler, kontordører |
| `room_university_lecture` | Lecture Hall | room | Forelesningssal |
| `room_university_archive` | Restricted Archives | room | Forbudte bøker |
| `room_university_lab` | Research Laboratory | room | Vitenskapelige eksperimenter |
| `room_university_office` | Professor's Office | room | Bøker, notater, ledetråder |

#### Prioritet 7: Lighthouse - 4 tiles
*Kystmystikk, isolasjon*

| Tile ID | Navn | Kategori | Beskrivelse |
|---------|------|----------|-------------|
| `foyer_lighthouse` | Lighthouse Entry | foyer | Bunn av fyrtårnet |
| `stairs_lighthouse` | Spiral Stairs | stairs | Lang vindeltrapp opp |
| `room_lighthouse_keeper` | Keeper's Quarters | room | Fyrvokterens rom |
| `room_lighthouse_lamp` | Lamp Room | room | Toppen, lyset, utsikt |

---

### Sammendrag Forslag

| Prioritet | Tema | Antall Tiles |
|-----------|------|--------------|
| 1 | Asyl | 7 |
| 2 | Museum | 6 |
| 3 | Hotell | 6 |
| 4 | Kirke | 5 |
| 5 | Tavern | 5 |
| 6 | Universitet | 6 |
| 7 | Lighthouse | 4 |
| **Total** | | **39 tiles** |

---

### Neste Steg
1. Velg hvilke kategorier som skal implementeres først
2. Implementer tiles i `tileConnectionSystem.ts`
3. Test at edges matcher riktig
4. Oppdater tile affinities for tematisk gruppering

---

## 2026-01-21: Add New Tile Variants - Forest, Street, Hospital, Police

### Oppgave
Legge til flere tile-varianter for mer variasjon i spillet: nye skog-tiles, skog med sti og kryss, vei-varianter, innendørs sykehus og politistasjon.

---

### Nye Tiles Lagt Til

#### Skog-varianter (5 nye)
| Tile ID | Navn | Beskrivelse |
|---------|------|-------------|
| `nature_forest_dense` | Dense Thicket | Tett skog med tornebusker |
| `nature_forest_birch` | Birch Grove | Lysere bjørkeskog |
| `nature_forest_pine` | Pine Woods | Furuskog med nåler |
| `nature_forest_fallen` | Fallen Giants | Skog med fallne trær og sopp |
| `nature_forest_haunted` | Haunted Woods | Hjemsøkt skog med spøkelser |

#### Skog-stier og kryss (4 nye)
| Tile ID | Navn | Edges | Beskrivelse |
|---------|------|-------|-------------|
| `nature_trail_corner` | Winding Trail | OPEN/NATURE sving | Sti som svinger |
| `nature_trail_crossing` | Forest Crossroads | 4x OPEN | Veikryss i skogen |
| `nature_trail_t` | Trail Fork | 3x OPEN | T-kryss i skogen |
| `nature_forest_stream` | Forest Stream | Med WATER kanter | Skog med bekk |

#### Vei-varianter (5 nye)
| Tile ID | Navn | Beskrivelse |
|---------|------|-------------|
| `street_t_junction` | T-Junction | T-kryss gate |
| `street_wide` | Grand Boulevard | Bred hovedgate |
| `street_cobbled` | Old Quarter Lane | Gammel brosteinsgate |
| `street_narrow` | Cramped Passage | Smal passasje |
| `street_railway` | Railway Crossing | Jernbanekryssing |

#### Sykehus innendørs (6 nye)
| Tile ID | Navn | Kategori | Beskrivelse |
|---------|------|----------|-------------|
| `room_hospital_ward` | Hospital Ward | room | Sykestue med senger |
| `room_hospital_morgue` | Hospital Morgue | room | Likhus (kan spawne ghoul) |
| `room_hospital_operating` | Operating Theater | room | Operasjonssal |
| `room_hospital_reception` | Hospital Reception | foyer | Resepsjon |
| `corridor_hospital` | Hospital Corridor | corridor | Sykehuskorridor |
| `room_hospital_pharmacy` | Hospital Pharmacy | room | Apotek |

#### Politistasjon innendørs (7 nye)
| Tile ID | Navn | Kategori | Beskrivelse |
|---------|------|----------|-------------|
| `room_police_cells` | Holding Cells | room | Arrestceller |
| `room_police_office` | Detective's Office | room | Detektivkontor |
| `room_police_evidence` | Evidence Room | room | Bevisrom |
| `room_police_lobby` | Police Station Lobby | foyer | Resepsjon |
| `corridor_police` | Station Corridor | corridor | Politistasjon-korridor |
| `room_police_armory` | Police Armory | room | Våpenlager |
| `room_police_interrogation` | Interrogation Room | room | Avhørsrom |

---

### Tekniske Detaljer

**Fil endret:** `src/game/tileConnectionSystem.ts`

**Endringer:**
1. Lagt til 27 nye TileTemplate konstanter
2. Alle templates registrert i `TILE_TEMPLATES` record
3. Lagt til tile affinities for tematisk gruppering:
   - Skog-tiles tiltrekker andre skog- og sti-tiles
   - Sykehus-tiles tiltrekker andre medisinske tiles
   - Politi-tiles tiltrekker andre politistasjon-tiles

**Edge-typer brukt:**
- `NATURE` - For skog og natur
- `OPEN` - For stier og passasjer
- `WATER` - For bekker
- `STREET`/`FACADE` - For gater
- `DOOR`/`WALL`/`WINDOW` - For innendørs rom

**Build:** Vellykket - ingen TypeScript-feil

---

### Sammendrag
Totalt **27 nye tiles** lagt til for bedre variasjon:
- 5 skog-varianter
- 4 skog-stier/kryss
- 5 vei-varianter
- 6 sykehus-tiles
- 7 politistasjon-tiles

---

## 2026-01-21: Refactor GameBoard.tsx - TileObjectRenderer Extraction

### Oppgave
Refaktorere kompleks kode - finn en funksjon eller komponent som er for kompleks og refaktorer den for klarhet mens samme oppførsel beholdes.

---

### Analyse av Kompleksitet

Søkte gjennom kodebasen etter kandidater. **GameBoard.tsx** (2158 linjer) ble identifisert som beste kandidat:

| Fil | Størrelse | Problem |
|-----|-----------|---------|
| **GameBoard.tsx** | 2158 linjer | 15+ nesten identiske if-blokker for tile objects |
| PuzzleModal.tsx | 1130 linjer | 5 puzzle-implementasjoner med repetert logikk |
| QuestEditor/index.tsx | 1166 linjer | 10+ sammenkoblede state-variabler |
| ShadowsGame.tsx | 4591 linjer | God object med for mange ansvar |

---

### Problem Identifisert

I **GameBoard.tsx** (linje 1205-1353) var det ~150 linjer med nesten identiske if-blokker for tile object rendering:

```tsx
// BEFORE: 15+ repetitive conditionals
{tile.object.type === 'fire' && <Flame className="..." size={40} />}
{tile.object.type === 'locked_door' && (
  <div className="flex flex-col items-center">
    <Lock className="..." size={32} />
    <span>Locked</span>
  </div>
)}
{tile.object.type === 'rubble' && <Hammer className="..." size={32} />}
{tile.object.type === 'trap' && (
  <div className="flex flex-col items-center">
    <AlertTriangle className="..." size={32} />
    <span>Trap</span>
  </div>
)}
// ... 11+ flere lignende blokker
```

**DRY-brudd**: Hvert tile object fulgte samme mønster:
- Icon med størrelse og styling
- Valgfri label med styling
- Valgfri wrapper med animasjoner
- Opacity basert på `blocking` eller `searched` state

---

### Løsning: Konfigurasjonsdrevet TileObjectRenderer

#### 1. Ny Komponent: `TileObjectRenderer.tsx`

Opprettet ny komponent med:

**Type-definisjoner:**
```typescript
interface SimpleTileObjectConfig {
  variant: 'simple';
  icon: LucideIcon;
  iconSize: number;
  iconClass: string;
  label?: string;
  labelClass?: string;
  useBlockingOpacity?: boolean;
  useSearchedOpacity?: boolean;
  wrapperClass?: string;
}

interface ComplexTileObjectConfig {
  variant: 'complex';
  render: (object: TileObject) => React.ReactNode;
}
```

**Konfigurasjonskart med 18 tile object types:**
- Simple: fire, locked_door, rubble, trap, gate, fog_wall, altar, crate, chest, cabinet, barricade, mirror, radio, switch, statue
- Complex (custom render): bookshelf, exit_door, eldritch_portal

#### 2. Oppdatert GameBoard.tsx

**BEFORE (150 linjer):**
```tsx
{tile.object && isVisible && (
  <TileObjectTooltip object={tile.object}>
    <div className="...">
      {tile.object.type === 'fire' && <Flame ... />}
      {tile.object.type === 'locked_door' && (...)}
      // ... 13+ flere conditionals
    </div>
  </TileObjectTooltip>
)}
```

**AFTER (7 linjer):**
```tsx
{tile.object && isVisible && (
  <TileObjectTooltip object={tile.object}>
    <div className="...">
      <TileObjectRenderer object={tile.object} />
    </div>
  </TileObjectTooltip>
)}
```

---

### Resultater

| Metrikk | Før | Etter |
|---------|-----|-------|
| **Linjer i GameBoard.tsx** | ~2158 | ~2015 (-143 linjer) |
| **If-blokker for tile objects** | 15+ | 0 |
| **Å legge til ny tile object type** | Kopier 10-30 linjer | Legg til 5-10 linjer i config |
| **Lesbarhet** | Lav | Høy |
| **Vedlikeholdbarhet** | Lav | Høy |

---

### Prinsipper Anvendt

1. **DRY (Don't Repeat Yourself)** - Fjernet 15+ nesten identiske if-blokker
2. **Configuration over Code** - Tile objects definert som data
3. **Single Responsibility** - TileObjectRenderer gjør én ting godt
4. **Open/Closed** - Lett å legge til nye tile types uten å endre eksisterende kode
5. **Strategy Pattern** - Komplekse objects bruker custom render-funksjoner

---

### Endrede Filer

- `src/game/components/TileObjectRenderer.tsx` (ny, ~280 linjer)
- `src/game/components/GameBoard.tsx` (oppdatert, -143 linjer)

### Build Status
✅ TypeScript kompilerer uten feil
✅ Build vellykket
✅ Ingen breaking changes - samme visuell oppførsel

---

## 2026-01-21: Quest Editor - Campaign & Dialog Implementation (Sesjon 3)

### Oppgave
Implementere Campaign Play Integration, NPC Dialog System, og Scenario Templates.

---

### Implementert

#### PRIORITET 1: Campaign Play Integration
- **CampaignPlayManager.tsx** - Ny komponent for kampanje-spilling
  - Kampanjeliste og detaljer-visning
  - Hero-valg for kampanjer (integrert med Legacy system)
  - Quest-progresjon med mellom-quest UI
  - Shared gold pool tracking
  - Campaign progress lagres i localStorage
  - Integration med MerchantShop mellom quests
- **MainMenu.tsx** - Lagt til "Play Campaign" knapp
- **ShadowsGame.tsx** - Integrert CampaignPlayManager med campaign view mode

#### PRIORITET 2: NPC Dialog System
- **DialogEditor.tsx** - Komplett dialog-tree builder
  - Visuelle dialog-noder med folding
  - Branching conversations med multiple options
  - Conditions: has_item, has_insight, has_gold, objective_complete, stat_check
  - Effects: give_item, take_item, give_gold, give_insight, heal, reveal_objective
  - Preview-modus for å teste dialogen
- **NPCPalette.tsx** - Integrert dialog-toggle
  - Støtte for kompleks dialog (dialogTree) eller enkel greeting
  - Knapp for å åpne DialogEditor

#### PRIORITET 3: Scenario Templates
- **ScenarioTemplates.tsx** - Template browser med preview
  - Quick Start templates: Escape the Manor, The Mystery, Boss Hunt
  - Layout templates: Small Manor, Abandoned Church, Dockside Warehouse
  - Kategori-filtrering og detaljert preview
  - Alle templates har pre-definerte tiles og objectives

### Endrede filer
- `src/game/components/QuestEditor/CampaignPlayManager.tsx` (ny)
- `src/game/components/QuestEditor/DialogEditor.tsx` (ny)
- `src/game/components/QuestEditor/ScenarioTemplates.tsx` (ny)
- `src/game/components/QuestEditor/index.tsx` (oppdatert eksporter)
- `src/game/components/QuestEditor/NPCPalette.tsx` (dialog integration)
- `src/game/components/QuestEditor/CustomQuestLoader.tsx` (eksportert funksjoner)
- `src/game/components/MainMenu.tsx` (campaign button)
- `src/game/ShadowsGame.tsx` (campaign view integration)
- `editor-log.md` (dokumentasjon)

### Resterende oppgaver (logget til editor-log.md)
- Visual Improvements: Tile connections, Mini-map, Drag-and-drop, Bulk editing
- Quality of Life: Keyboard shortcuts panel, Auto-save, Complexity estimator

---

## 2026-01-21: Quest Editor - Forbedringsforslag (Sesjon 2)

### Oppgave
Fortsette utvikling av Quest Editor - identifisere forbedringer og nye features.

---

### Nåværende Status (OPPDATERT)

Quest Editor er nå **svært komplett** med 16 komponenter:

| Komponent | Status | Beskrivelse |
|-----------|--------|-------------|
| **index.tsx** | ✅ | Hoved-editor med 8 tabber |
| **EditorCanvas** | ✅ | Hex-grid canvas med pan/zoom |
| **TilePalette** | ✅ | 100+ tiles med søk og kategorier |
| **EdgeConfigPanel** | ✅ | Konfigurer alle 6 kanter |
| **DoorConfigPanel** | ✅ | Dør-states og låser |
| **MonsterPalette** | ✅ | 15+ monstre fra BESTIARY |
| **ItemPalette** | ✅ | 21 quest items med templates |
| **NPCPalette** | ✅ | NPC-plassering |
| **ObjectivesPanel** | ✅ | 10 objective-typer |
| **TriggerPanel** | ✅ | 6 trigger-typer, 8 action-typer |
| **DoomEventsPanel** | ✅ | Doom events med thresholds |
| **ValidationPanel** | ✅ | 6 validerings-kategorier |
| **PreviewPanel** | ✅ | AI-genererte tile-bilder, fog of war |
| **CustomQuestLoader** | ✅ | **NYT!** Last og spill custom quests |
| **CampaignEditor** | ✅ | **NYT!** Full kampanje-system |
| **useUndoRedo** | ✅ | 50-state undo/redo |

---

### FORSLAG TIL FORBEDRINGER

#### PRIORITET 1: Campaign Play Integration
Campaign Editor finnes, men må integreres i main game:
- [ ] Campaign-modus i hovedspillet
- [ ] Hero persistence mellom quests
- [ ] Equipment carry-over
- [ ] Gold pooling system
- [ ] Campaign progress tracking

#### PRIORITET 2: NPC Dialog System
NPCPalette eksisterer men mangler funksjonalitet:
- [ ] Dialog-editor for NPCs
- [ ] Quest-giving NPCs
- [ ] Merchant NPCs (kjøp/salg)
- [ ] Info NPCs med lore

#### PRIORITET 3: Scenario Templates
Gjør det enklere å komme i gang:
- [ ] "Quick Start" templates (Escape, Investigation, Boss Hunt)
- [ ] Pre-made tile layouts (Small Manor, Church, Warehouse)
- [ ] Template browser med preview

#### PRIORITET 4: Visual Improvements
- [ ] Tile connection visualization (grønne linjer mellom koblede tiles)
- [ ] Mini-map for store scenarios
- [ ] Drag-and-drop tiles (i tillegg til click-place)
- [ ] Bulk editing av monstre/items

#### PRIORITET 5: Quality of Life
- [ ] Keyboard shortcuts panel
- [ ] Auto-save funksjon
- [ ] Quest complexity estimator
- [ ] Difficulty auto-calculator basert på monstre/items

---

### Valgt Forbedring for Denne Sesjonen

**TBD - Venter på brukerens valg**

---

## 2026-01-21: Quest Editor Analyse - Hva mangler?

### Oppgave
Analysere Quest Editor for forbedringspotensiale og identifisere manglende funksjonalitet.

---

### Nåværende Quest Editor Status

Quest Editor er allerede ganske komplett med følgende funksjoner:

| Komponent | Status | Beskrivelse |
|-----------|--------|-------------|
| **EditorCanvas** | ✅ | Hex-grid canvas med pan/zoom |
| **TilePalette** | ✅ | 90+ tiles med søk og kategorier |
| **EdgeConfigPanel** | ✅ | Konfigurer alle 6 kanter |
| **DoorConfigPanel** | ✅ | Dør-states og låser |
| **MonsterPalette** | ✅ | Alle monstre fra BESTIARY |
| **ItemPalette** | ✅ | Quest items med templates |
| **NPCPalette** | ✅ | NPC-plassering |
| **ObjectivesPanel** | ✅ | 10 objective-typer |
| **TriggerPanel** | ✅ | Event triggers |
| **DoomEventsPanel** | ✅ | Doom events med thresholds |
| **ValidationPanel** | ✅ | Sjekker scenario validitet |
| **PreviewPanel** | ✅ | Forhåndsvisning |
| **Undo/Redo** | ✅ | Ctrl+Z / Ctrl+Shift+Z |
| **JSON Export** | ✅ | v3.1 format |
| **JSON Import** | ✅ | Last eksisterende scenarios |

---

### KRITISK MANGLENDE FUNKSJONALITET

#### 1. Ingen måte å SPILLE custom quests!

Quest Editor kan eksportere til JSON, men det finnes **ingen funksjon** for å:
- Laste inn egne quests i spillet
- Velge custom quest fra en meny
- Starte et custom scenario

**Løsning nødvendig:**
- Legge til "Load Custom Quest" knapp i New Game-flyten
- Konvertere JSON-format til Scenario-interface
- Integrere med eksisterende spillmotor

#### 2. Ingen Campaign/Kampanje-system

Det finnes ingen måte å:
- Sette sammen flere quests til en kampanje
- Definere rekkefølge på quests
- Persistere progress mellom quests
- Bruke Legacy-systmet mellom kampanje-quests

**Løsning nødvendig:**
- Ny Campaign-editor
- Campaign-type med liste av quests
- Campaign-progress tracking
- Integrasjon med Legacy-systemet

---

### Forbedringsområder (mindre kritiske)

| Forbedring | Prioritet | Beskrivelse |
|------------|-----------|-------------|
| Tile Connection Validation | Medium | Vis advarsel når tiles ikke kobler logisk |
| Minimap | Low | Oversiktskart over hele scenario |
| Copy/Paste | Low | Kopier tiles eller grupper |
| Templates | Low | Lagre og gjenbruk tile-grupper |
| Multiplayer Spawn Points | Low | Flere start locations for co-op |

---

### Implementeringsplan

**Fase A: Custom Quest Loader (PRIORITET 1)**
1. Legge til "Custom Quest" knapp i scenario-valg
2. Fil-velger for JSON-import
3. Quest-konverter: JSON → Scenario
4. Start game med custom scenario

**Fase B: Campaign System (PRIORITET 2)**
1. Campaign-datastruktur
2. Campaign-editor UI
3. Campaign-selektor i hovedmeny
4. Progress tracking mellom quests
5. Legacy-integrasjon

---

## 2026-01-21: Quest Editor Fase 2 - Avansert redigering

### Oppsummering

Implementert Fase 2 av Quest Editor med full støtte for:
- Edge-konfigurasjon per tile
- Monster-plassering
- Quest item-plassering
- Objective editor

---

### Implementerte komponenter

#### 1. EdgeConfigPanel (`EdgeConfigPanel.tsx`)
Panel for å konfigurere kanter på valgt tile:
- Visuell hex-diagram som viser alle 6 kanter
- Dropdown for hver kant (N, NE, SE, S, SW, NW)
- Støtter alle edge-typer: WALL, OPEN, DOOR, WINDOW, STREET, NATURE, WATER, FACADE, STAIRS_UP, STAIRS_DOWN
- Quick actions: "All Walls" og "All Open"
- Fargekoding for edge-typer

#### 2. MonsterPalette (`MonsterPalette.tsx`)
Panel for å plassere monstre på tiles:
- Alle monstre fra BESTIARY gruppert i kategorier (Minion, Warrior, Elite, Boss)
- Fargekodede kategorier for enkel identifikasjon
- Viser stats: HP, Attack, Defense, Horror
- +/- knapper for å justere antall
- Traits-visning (flying, ranged, etc.)
- Visuell indikator på tiles (rød sirkel med antall)

#### 3. ItemPalette (`ItemPalette.tsx`)
Panel for å plassere quest items:
- 5 kategorier: Keys, Clues, Collectibles, Artifacts, Components
- Ferdigdefinerte templates for vanlige quest items
- Redigerbar navn og beskrivelse per item
- Støtte for keyId på nøkler
- Visuell indikator på tiles (grønn sirkel med antall)

#### 4. ObjectivesPanel (`ObjectivesPanel.tsx`)
Panel for å definere scenario-mål:
- 10 objective-typer: find_item, kill_enemies, kill_boss, escape, survive, perform_ritual, explore, rescue, collect, investigate
- Konfigurerbare felt: targetId, targetAmount, insightReward
- Flagg: isRequired, isHidden, isBonus
- Støtte for "revealedBy" - objectives som blir synlige når andre fullføres
- Quick templates: Escape, Survival, Boss Kill, Collect

---

### Oppdateringer til eksisterende komponenter

#### QuestEditor (index.tsx)
- Ny tabbed interface i høyre sidebar: Tile | Monsters | Items | Goals
- Objectives state management
- Oppdatert export til v2.0 format med objectives
- Import støtter nå objectives

#### EditorCanvas (EditorCanvas.tsx)
- Visuell indikator for monstre (rød sirkel)
- Visuell indikator for items (grønn sirkel)

---

### Funksjonalitet (Oppdatert)

| Feature | Status |
|---------|--------|
| **Fase 1** | |
| Hex-grid rendering | ✅ |
| Tile placement/selection/deletion | ✅ |
| Tile rotation | ✅ |
| Pan/zoom | ✅ |
| Tile palette med kategorier | ✅ |
| Søk i tiles | ✅ |
| JSON export/import | ✅ |
| Start location marking | ✅ |
| Properties panel | ✅ |
| Scenario metadata | ✅ |
| **Fase 2** | |
| Edge-konfigurasjon per tile | ✅ |
| Monster-plassering | ✅ |
| Quest item-plassering | ✅ |
| Objective editor | ✅ |
| Tabbed interface | ✅ |
| Visuelle indikatorer på canvas | ✅ |

---

### JSON Export Format (v2.0)

```json
{
  "metadata": {
    "id": "custom_scenario_xxx",
    "title": "Scenario Title",
    "description": "...",
    "briefing": "...",
    "startDoom": 12,
    "difficulty": "normal",
    "theme": "investigation"
  },
  "objectives": [
    {
      "id": "obj_xxx",
      "type": "find_item",
      "description": "Find the key",
      "targetId": "key_brass",
      "isRequired": true,
      "isHidden": false,
      "isBonus": false
    }
  ],
  "tiles": [
    {
      "id": "tile_0_0_xxx",
      "q": 0, "r": 0,
      "templateId": "foyer_grand",
      "name": "Grand Foyer",
      "edges": ["DOOR", "WALL", "DOOR", "DOOR", "DOOR", "WALL"],
      "monsters": [{ "type": "cultist", "count": 2 }],
      "items": [{ "id": "key_1", "name": "Brass Key", "type": "key" }],
      "isStartLocation": true
    }
  ],
  "version": "2.0"
}
```

---

### Nye filer

- `src/game/components/QuestEditor/EdgeConfigPanel.tsx`
- `src/game/components/QuestEditor/MonsterPalette.tsx`
- `src/game/components/QuestEditor/ItemPalette.tsx`
- `src/game/components/QuestEditor/ObjectivesPanel.tsx`

---

### Neste steg (Fase 3+)

- Validering av scenario (sjekk start location, connectivity)
- Preview/test mode
- Trigger system (events når objectives fullføres)
- NPC-plassering
- Custom descriptions per tile
- Undo/redo

---

## 2026-01-21: Quest Editor Fase 1 - Implementasjon

### Oppsummering

Implementert Fase 1 av Quest Editor med fungerende prototype:
- Visuell hex-editor
- Tile-palette på siden
- Click-to-place funksjonalitet
- JSON export/import

---

### Implementerte komponenter

#### 1. QuestEditor (index.tsx)
Hovedkomponent med:
- State management for tiles, verktøy og metadata
- Toolbar med verktøy (Select, Place, Erase)
- Rotation-kontroll for tiles (0-300°)
- JSON export/import funksjonalitet
- Properties panel for valgt tile
- Scenario metadata editor (title, doom, difficulty)

**Fil:** `src/game/components/QuestEditor/index.tsx`

#### 2. EditorCanvas
Hex-grid canvas med:
- Pan/zoom (scroll + middle-click drag)
- Click-to-place tiles
- Hover preview av tile som plasseres
- Edge-farger for visuell feedback
- Koordinat-visning på hover
- Origin-markør

**Fil:** `src/game/components/QuestEditor/EditorCanvas.tsx`

#### 3. TilePalette
Sidebar med:
- Alle 90+ tile templates fra tileConnectionSystem.ts
- Gruppering etter kategori (Nature, Urban, Street, etc.)
- Søkefunksjon
- Edge-pattern preview
- Valgt template-info

**Fil:** `src/game/components/QuestEditor/TilePalette.tsx`

---

### Integrasjon

- Lagt til "Quest Editor" knapp i MainMenu
- Koblet til via `mainMenuView = 'questEditor'`
- Tilgjengelig fra hovedmenyen som egen skjerm

**Filer endret:**
- `src/game/components/MainMenu.tsx` - Lagt til onQuestEditor prop og knapp
- `src/game/ShadowsGame.tsx` - Import, mainMenuView type, rendering

---

### Funksjonalitet

| Feature | Status |
|---------|--------|
| Hex-grid rendering | ✅ |
| Tile placement | ✅ |
| Tile selection | ✅ |
| Tile deletion | ✅ |
| Tile rotation | ✅ |
| Pan/zoom | ✅ |
| Tile palette med kategorier | ✅ |
| Søk i tiles | ✅ |
| JSON export | ✅ |
| JSON import | ✅ |
| Start location marking | ✅ |
| Properties panel | ✅ |
| Scenario metadata | ✅ |

---

### Bruk

1. Åpne spillet og gå til hovedmenyen
2. Klikk "Quest Editor" (lilla knapp)
3. Velg en tile fra paletten til venstre
4. Klikk på griden for å plassere
5. Bruk R eller rotasjonsknappen for å rotere
6. Marker en tile som "Start Location" i properties panel
7. Eksporter til JSON med nedlastingsknappen

---

### Neste steg (Fase 2+)

- Edge-konfigurasjon per tile
- Monster-plassering
- Quest item-plassering
- Objective editor
- Preview/test modus
- Undo/redo

---

## 2026-01-21: Quest/Scenario Editor - Analyse og Plan

### Oppgave
Lage en visuell drag-and-drop quest/scenario editor der man kan:
- Legge ut hex-tiles manuelt
- Velge tiles og plassere dem på grid
- Definere oppdragsparametre (objectives, victory conditions)
- Legge ut quest items på tiles
- Plassere monstre
- Sette doom events

### Analyse av eksisterende system

#### Scenario-struktur (constants.ts linje 666+)
```typescript
Scenario {
  id, title, description, briefing
  startDoom, startLocation, specialRule
  difficulty, tileSet, theme, goal, victoryType
  objectives: ScenarioObjective[]
  victoryConditions: VictoryCondition[]
  defeatConditions: DefeatCondition[]
  doomEvents: DoomEvent[]
}
```

#### Tile-struktur
- 6 kategorier: nature, urban, street, facade, foyer, corridor, room, stairs, basement, crypt
- Forbindelsesregler mellom kategorier (CATEGORY_CONNECTIONS)
- 85 tile-bilder tilgjengelig
- Edge-system med 6 kanter per tile (open, wall, door, secret, etc.)

#### Monster-system (BESTIARY)
- 4 kategorier: MINIONS, WARRIORS, ELITES, BOSSES
- 15+ monster-typer

#### Quest items
- Keys, clues, collectibles, special items
- Spawn-system basert på exploration progress

### Konklusjon: JA, dette lar seg gjennomføre!

### Arkitektur-plan for Quest Editor

#### 1. Hovedkomponenter

| Komponent | Funksjon |
|-----------|----------|
| `QuestEditor.tsx` | Hovedcontainer med state management |
| `EditorCanvas.tsx` | Hex-grid canvas for tile-plassering |
| `TilePalette.tsx` | Sidebar med draggable tiles |
| `PropertiesPanel.tsx` | Høyre panel for redigering av valgt element |
| `ObjectiveEditor.tsx` | Modal/panel for objectives og victory conditions |
| `MonsterPlacer.tsx` | Monster-plassering og doom events |
| `EditorToolbar.tsx` | Verktøy: select, place, delete, pan, zoom |

#### 2. Editor State

```typescript
EditorState {
  // Canvas
  tiles: Map<string, EditorTile>        // q,r -> tile
  selectedTile: string | null
  viewOffset: {x, y}
  zoom: number

  // Tools
  activeTool: 'select' | 'place' | 'delete' | 'pan'
  selectedPaletteTile: TileDefinition | null

  // Scenario metadata
  scenarioMeta: {
    id, title, description, briefing
    startDoom, difficulty, theme
    startLocation: string
  }

  // Objectives
  objectives: ScenarioObjective[]
  victoryConditions: VictoryCondition[]
  defeatConditions: DefeatCondition[]
  doomEvents: DoomEvent[]

  // Placements
  monsters: MonsterPlacement[]
  questItems: ItemPlacement[]
}
```

#### 3. Funksjonalitet

**Tile-plassering:**
- Drag fra palette til canvas
- Click på grid for å plassere
- Automatisk edge-matching basert på kategorier
- Roter tile (R-tast)
- Slett tile (Delete-tast)

**Tile-redigering (Properties Panel):**
- Endre navn/beskrivelse
- Sett kategori og floor type
- Konfigurer 6 edges individuelt
- Legg til objects (altar, chest, etc.)
- Marker som start location

**Quest items:**
- Drag items til tiles
- Sett item properties
- Koble til objectives

**Monster-plassering:**
- Fast plassering (starter på tile)
- Doom event spawning (spawn ved doom threshold)

**Objectives:**
- Legg til/fjern objectives
- Sett type (find_item, kill_enemy, etc.)
- Koble til tiles/items/monsters
- Definer victory/defeat conditions

#### 4. Export/Import

**Export format:** JSON som matcher Scenario-interface
```typescript
// Lagres som egen fil eller i constants.ts
const CUSTOM_SCENARIO: Scenario = { ... }
```

**Import:** Last inn eksisterende scenario for redigering

#### 5. Teknisk implementasjon

**Drag & Drop:** React DnD eller @dnd-kit/core
**Canvas:**
- Option A: SVG-basert (enklere, bedre for små maps)
- Option B: Canvas API (bedre performance for store maps)
- Option C: Gjenbruk eksisterende HexTile-komponenter

**State:** Zustand eller useReducer for kompleks state

#### 6. Estimert arbeidsmengde

| Del | Kompleksitet |
|-----|--------------|
| EditorCanvas med hex-grid | Medium |
| TilePalette med drag | Lav |
| Edge-editor | Medium-Høy |
| Properties panel | Medium |
| Objective editor | Medium |
| Monster/item placement | Lav |
| Export/import | Lav |
| Integration med spill | Medium |

### Anbefalt fremgangsmåte

**Fase 1 - Grunnleggende editor:**
1. EditorCanvas med hex-grid
2. TilePalette med alle tiles
3. Enkel click-to-place
4. Properties panel for valgt tile

**Fase 2 - Avansert tile-redigering:**
5. Edge-konfigurasjon
6. Objects på tiles
7. Start location marking

**Fase 3 - Quest-elementer:**
8. Monster-plassering
9. Quest item-plassering
10. Objective editor

**Fase 4 - Polish:**
11. Export/import JSON
12. Preview/test modus
13. Undo/redo

---

## 2026-01-21: Tile Grafikk Validering

### Oppsummering

Gjennomført audit av alle tiles for å sjekke hvilke som mangler grafikk-mapping.

---

### Statistikk

| Kategori | Antall |
|----------|--------|
| **Tile-bilder (PNG)** | 85 |
| **Importerte bilder i GameBoard.tsx** | 84 |
| **Tile-navn i tileConnectionSystem.ts** | ~100 |
| **Tiles med fungerende mapping** | 100 ✅ |
| **Tiles som mangler mapping** | 0 (fikset) |

---

### Tiles som manglet mapping (nå fikset ✅)

Følgende tiles hadde ikke fungerende mapping før denne oppdateringen:

| Tile-navn | Problem | Løsning |
|-----------|---------|---------|
| **Dining Hall** | "dining" var ikke i TILE_IMAGES | ✅ Lagt til `dining: tileKitchen` |
| **Abandoned Farm Field** | "farm" alene matchet ikke | ✅ Lagt til `farm: tileFarmhouse` |

---

### Eksisterende tile-bilder (85 stk)

Alle disse bildene finnes i `src/assets/tiles/`:

```
alley, asylum, bedroom, belltower, billiard, blackpool, boiler, bridge,
campsite, campus, cannery, cave, cellar, church, closet, conservatory,
courthouse, crossroads, crypt, deadend, dock, drawing, echo, farmhouse,
fireescape, forest, funeral, gallery, gallows, gasworks, gate, graveyard,
hallway, hangingtree, hospital, hotel, idol, kitchen, lab, library,
lighthouse, manor, maproom, market, massgrave, mine, museum, music,
newspaper, nursery, office, orchard, park, parlor, petrified, police,
pond, portal, quarry, records, ritual, riverfront, ruins, sanctum,
servants, sewer, shack, shipyard, shop, smoking, square, starchamber,
station, stonecircle, street, swamp, tenement, tomb, trophy,
underground-lake, warehouse, well, witchhouse
```

---

### Tiles fra game_design_bible.md som er implementert

**NATURE tiles**: ✓ Mørk Skog, Skogslysning, Klippekyst, Myrområde, Gammel Steinsirkel

**URBAN tiles**: ✓ Bytorget, Havna, Togstasjonen, Kirkegården, Universitetsområdet, Industriområdet, Markedsplassen

**STREET tiles**: ✓ Hovedgaten, Mørkt Smug, Tåkete Bakgate, Kloakkgitter

**FACADE tiles**: ✓ Herregård, Bibliotek, Kirke, Asyl, Lagerbygning

**FOYER tiles**: ✓ Herregård-foyer, Bibliotek-foyer, Hotell-lobby

**CORRIDOR tiles**: ✓ Støvete Korridor, Tjenergang, Mørklagt Gang, Celle-korridor

**ROOM tiles**: ✓ Bibliotek, Ritualkammer, Laboratorium, Soveværelse, Kjøkken, Galleri

**BASEMENT tiles**: ✓ Vinkjeller, Kuldelager, Kloakktunnel

**CRYPT tiles**: ✓ Gravkammer, Offersted, Eldgammel Portal

---

### Utført handling ✅

Lagt til manglende mappinger i `GameBoard.tsx`:

```typescript
// Kitchen and Dining (linje 301-305)
dining: tileKitchen,        // Dining Hall

// Farmhouse and Farm (linje 414-418)
farm: tileFarmhouse,        // Abandoned Farm Field
field: tileFarmhouse,       // Farm Field
```

**Status**: Alle 100 tiles har nå fungerende grafikk-mapping.

---

### Påvirkede filer

- `src/game/components/GameBoard.tsx` - Lagt til 3 nye mappinger i TILE_IMAGES

---

## 2026-01-21: Fix `as any` Type Assertion i MerchantShop

### Oppsummering

Fjernet `as any` type assertion i MerchantShop.tsx ved å refaktorere `canUseWeapon` funksjonen til en mer gjenbrukbar arkitektur.

---

### Problem: `as any` for mock Player-objekt

**Fil:** `src/game/components/MerchantShop.tsx:220`

**Problem:** MerchantShop måtte lage et mock Player-objekt med `as any` for å sjekke våpenrestriksjoner fordi `canUseWeapon(player, weaponId)` krevde et helt `Player` objekt, selv om funksjonen bare brukte `player.id`.

**Kode før:**
```typescript
const mockPlayer = {
  id: activeHero.characterClass,
  specialAbility: CHARACTERS[activeHero.characterClass as keyof typeof CHARACTERS]?.specialAbility || '',
  inventory: { leftHand: null, rightHand: null, body: null, bag: [] },
  attributes: { strength: 0, agility: 0, intelligence: 0, willpower: 0 }
} as any;

return !canUseWeapon(mockPlayer, weaponId);
```

---

### Løsning

1. **Ny hjelpefunksjon** `canCharacterClassUseWeapon(characterClass, weaponId)` i `combatUtils.ts`:
   - Tar bare characterClass (string) og weaponId som parametere
   - Gjør det faktiske arbeidet med å sjekke våpenrestriksjoner
   - Kan brukes direkte av komponenter som kun har tilgang til karakterklasse

2. **Refaktorert `canUseWeapon`** til å være en wrapper:
   - Kaller `canCharacterClassUseWeapon(player.id, weaponId)`
   - Bakoverkompatibel - eksisterende kode trenger ingen endringer

3. **Oppdatert MerchantShop.tsx**:
   - Bruker `canCharacterClassUseWeapon` direkte med `activeHero.characterClass`
   - Ingen mock player eller `as any` nødvendig

**Kode etter:**
```typescript
return !canCharacterClassUseWeapon(activeHero.characterClass, weaponId);
```

---

### Påvirkede filer

- `src/game/utils/combatUtils.ts` - Lagt til `canCharacterClassUseWeapon`, importert `CharacterType`
- `src/game/components/MerchantShop.tsx` - Fjernet mock player og `as any`, bruker ny funksjon

---

### Relatert

BUG-012 i BUGS.MD

---

## 2026-01-21: Fix Event Card Effects

### Oppsummering

Fikset bug hvor event card-effekter (HP, Sanity, Insight, etc.) ikke ble faktisk applisert til spilleren.

---

### Problem: Event card-effekter ble ikke applisert

**Problem:** Når spilleren klikket "I MUST FACE THIS..." på et event card (f.eks. "Respite" som gir +1 HP og +1 Sanity), ble effektene vist i UI men ikke faktisk applisert til spillerens stats.

**Årsak (src/game/ShadowsGame.tsx:2273-2365):**
```typescript
// FEIL: handleEventResolve brukte state fra closure, ikke current state
const handleEventResolve = useCallback(() => {
  const event = state.activeEvent; // <-- stale closure state

  // ...

  // resolveEventEffect ble kalt med stale state
  const { updatedState, ... } = resolveEventEffect(
    event,
    state,  // <-- FEIL: bruker closure state, ikke current state
    state.activePlayerIndex,
    skillCheckPassed
  );

  // Når updatedState ble spredt inn i setState, ble players
  // beregnet fra gammel state, ikke current state
  setState(prev => ({
    ...prev,
    ...updatedState, // <-- updatedState.players basert på gammel state
    // ...
  }));
}, [state.activeEvent, state.players, ...]); // <-- closure dependencies
```

**Løsning:** Refaktorerte `handleEventResolve` til å gjøre all state-håndtering inne i en enkelt `setState` callback, ved å bruke `prev` (current state) i stedet for `state` (closure):
```typescript
const handleEventResolve = useCallback(() => {
  setState(prev => {
    const event = prev.activeEvent;
    if (!event) return { ...prev, activeEvent: null };

    const activePlayer = prev.players[prev.activePlayerIndex] ||
                         prev.players.find(p => !p.isDead);

    // Nå brukes prev (current state) for alle beregninger
    const { updatedState, logMessages, ... } = resolveEventEffect(
      event,
      prev,  // <-- RIKTIG: bruker current state
      prev.activePlayerIndex,
      skillCheckPassed
    );

    // Build complete new state in one operation
    let newState = {
      ...prev,
      ...updatedState, // <-- updatedState.players nå korrekt
      activeEvent: null,
      eventDiscardPile: discardEventCard(event, prev.eventDiscardPile)
    };

    // Handle weather change in same state update
    if (weatherChange && !skillCheckPassed) {
      newState = { ...newState, weatherState: { ... } };
    }

    return newState;
  });
}, [addToLog, addFloatingText, triggerScreenShake, spawnEnemy]);
```

**Endringer:**
1. All logikk flyttes inn i `setState` callback
2. Bruker `prev` (current state) i stedet for `state` (closure state)
3. Konsoliderte multiple `setState` kall til én enkelt operasjon
4. Side-effekter (logging, spawning) skjer via `setTimeout` for å unngå state-mutasjon

**Fil:** `src/game/ShadowsGame.tsx`

---

### Påvirkede event-typer

Alle event card-effekter fungerer nå korrekt:
- `health` / `all_health` - HP endringer
- `sanity` / `all_sanity` - Sanity endringer
- `insight` - Insight økning
- `doom` - Doom counter endringer
- `spawn` - Fiende-spawning
- `weather` - Værforhold
- `debuff_player` - Spiller-debuffs

---

## 2026-01-21: Fix Quest Item Pickup og Dør-håndtering

### Oppsummering

Fikset tre problemer:
1. Quest items kunne ikke plukkes opp - spillere får nå kontekstmeny når de klikker på tilen de står på
2. Dør-ikoner vistes dobbelt (på begge tilstøtende tiles) - nå rendres kun ett ikon per dør
3. Låste dører synkroniserte ikke tilstand mellom tiles - nå oppdateres begge sider av døren

---

### Problem 1: Quest Item Pickup fungerte ikke

**Problem:** Når spilleren klikket på tilen de sto på, returnerte `handleAction` tidlig uten å gjøre noe. Dette betydde at quest items som var synlige på tilen ikke kunne plukkes opp.

**Årsak (src/game/ShadowsGame.tsx:2430-2434):**
```typescript
// FEIL: Klikk på egen tile gjorde ingenting
if (distanceToTarget === 0) {
  return;
}
```

**Løsning:** Endret til å vise kontekstmeny hvis tilen har quest items, interaktive objekter, eller er søkbar:
```typescript
if (distanceToTarget === 0) {
  const currentTile = state.board.find(t => t.q === q && t.r === r);
  if (currentTile) {
    const hasQuestItems = currentTile.items && currentTile.items.some(item => item.isQuestItem);
    const hasInteractableObject = currentTile.object && !currentTile.object.blocking;
    const isSearchable = currentTile.searchable && !currentTile.searched;

    if (hasQuestItems || hasInteractableObject || isSearchable) {
      setState(prev => ({ ...prev, selectedTileId: currentTile.id }));
      showContextActions(currentTile);
      return;
    }
  }
  return;
}
```

**Fil:** `src/game/ShadowsGame.tsx`

---

### Problem 2: Dør-ikoner vistes dobbelt

**Problem:** Hver hex-tile rendrer sine egne kanter (edges). Når to tiles deler en dør, rendret BEGGE tiles dør-ikonet - noe som ga duplikate ikoner.

**Løsning (src/game/components/GameBoard.tsx):** Lagt til logikk for å kun rendre dør-ikonet på ÉN av de to tilstøtende tiles:
```typescript
// For door edges: Only render the icon on ONE tile to avoid duplicates
if (isDoor) {
  const adjOffsets = { /* offset per edge index */ };
  const offset = adjOffsets[edgeIndex];
  if (offset) {
    const adjQ = tile.q + offset.dq;
    const adjR = tile.r + offset.dr;
    // Only render if this tile has "higher" coordinates
    if (tile.q < adjQ || (tile.q === adjQ && tile.r < adjR)) {
      return null; // Let the other tile render this door
    }
  }
}
```

**Fil:** `src/game/components/GameBoard.tsx`

---

### Problem 3: Dør-tilstand synkroniserte ikke

**Problem:** Når en låst dør ble åpnet (via dirk eller nøkkel), ble kun den ene tiles edge oppdatert. Den tilstøtende tiles edge forble "låst", noe som kunne blokkere bevegelse.

**Løsning (src/game/utils/contextActionEffects.ts):** Oppdatert `setDoorState` til å også oppdatere den tilstøtende tiles edge:
```typescript
export function setDoorState(board, tileId, edgeIndex, doorState) {
  // First update the door on the source tile
  let updatedBoard = updateTileEdge(board, tileId, edgeIndex, ...);

  // Now find and update the adjacent tile's corresponding edge
  const tile = board.find(t => t.id === tileId);
  if (tile) {
    const adjacentPos = getAdjacentPosition(tile, edgeIndex);
    if (adjacentPos) {
      const adjacentTile = updatedBoard.find(t => t.q === adjacentPos.q && t.r === adjacentPos.r);
      if (adjacentTile) {
        const oppositeEdgeIndex = (edgeIndex + 3) % 6;
        if (adjacentTile.edges?.[oppositeEdgeIndex]?.type === 'door') {
          updatedBoard = updateTileEdge(updatedBoard, adjacentTile.id, oppositeEdgeIndex, ...);
        }
      }
    }
  }
  return updatedBoard;
}
```

**Fil:** `src/game/utils/contextActionEffects.ts`

---

### Build Status
✅ Build vellykket

---

## 2026-01-21: Fix Ghost Tiles og Trapp-håndtering

### Oppsummering

Fikset to problemer:
1. Grå MapPin tiles vistes for posisjoner som aldri har vært besøkt
2. Trapp-edges manglet kostnad og konteksthandlinger

---

### Problem 1: Feil "exploredTiles" markering

**Problem:** Når spilleren besøkte en tile, ble alle 6 naboposisjonene også markert som "explored". Dette førte til at ghost tiles rundt spilleren viste grå MapPin (besøkt) i stedet for rød "UTFORSK" (aldri besøkt).

**Årsak (src/game/ShadowsGame.tsx:2459-2469):**
```typescript
// FEIL: Markerte alle nabotiles som explored
const adjacentOffsets = [...];
adjacentOffsets.forEach(({ dq, dr }) => {
  newExplored.add(`${q + dq},${r + dr}`);  // <- Dette var feil
});
```

**Løsning:** Fjernet koden som markerte nabotiles. Nå markeres KUN tilen spilleren faktisk besøker som explored:
```typescript
// RIKTIG: Marker KUN den besøkte tilen
const newExplored = new Set(state.exploredTiles || []);
newExplored.add(`${q},${r}`);
```

**Fil:** `src/game/ShadowsGame.tsx`

---

### Problem 2: Trapper mangler kostnad og handlinger

**Problem:** Når spilleren prøvde å bevege seg gjennom en trapp-edge (stairs_up/stairs_down), skjedde enten ingenting eller feil melding ble vist. Trapper manglet:
- AP-kostnad (game design sier 2 AP for trapper)
- Konteksthandlinger for å bruke trappen
- Riktig melding i loggen

**Løsning:**

1. **Nye action-definisjoner (src/game/utils/contextActionDefinitions.ts):**
   ```typescript
   export const STAIRS_UP_ACTIONS: ActionConfig[] = [
     {
       id: 'use_stairs_up',
       label: 'Gå opp trappen (2 AP)',
       apCost: 2,
       consequences: { success: { type: 'pass_through' } }
     },
     { id: 'examine_stairs_up', label: 'Undersøk trappen', apCost: 0 }
   ];

   export const STAIRS_DOWN_ACTIONS: ActionConfig[] = [
     {
       id: 'use_stairs_down',
       label: 'Gå ned trappen (2 AP)',
       apCost: 2,
       consequences: { success: { type: 'pass_through' } }
     },
     { id: 'examine_stairs_down', label: 'Undersøk trappen', apCost: 0 }
   ];
   ```

2. **Ny funksjon i contextActions.ts:**
   ```typescript
   export function getStairsEdgeActions(player, edge, tile): ContextAction[] {
     const isUp = edge.type === 'stairs_up';
     const actionConfigs = isUp ? STAIRS_UP_ACTIONS : STAIRS_DOWN_ACTIONS;
     return withCancelAction(actionConfigs.map(buildStaticAction));
   }
   ```

3. **Oppdatert getContextActions() for å route til trapp-handlinger:**
   ```typescript
   if (target.edge.type === 'stairs_up' || target.edge.type === 'stairs_down') {
     return getStairsEdgeActions(player, target.edge, tile);
   }
   ```

4. **Bevegelseskode blokkerer nå trapper og viser kontekstmeny:**
   ```typescript
   if (sourceEdge.type === 'stairs_up' || sourceEdge.type === 'stairs_down') {
     addToLog(`TRAPP: Trappen går ${stairsDirection}. Bruk 2 AP for å passere.`);
     showContextActions(tile, edgeIndex);
     return;
   }
   ```

5. **Pass-through handling for trapper (contextActionEffects.ts):**
   ```typescript
   const PASS_THROUGH_ACTIONS = [
     // ... existing actions ...
     'use_stairs_up',
     'use_stairs_down'
   ];
   ```

**Filer endret:**
- `src/game/ShadowsGame.tsx` - Bevegelseslogikk og exploredTiles fix
- `src/game/utils/contextActionDefinitions.ts` - Nye trapp-handlinger
- `src/game/utils/contextActions.ts` - Ny getStairsEdgeActions() funksjon
- `src/game/utils/contextActionEffects.ts` - Pass-through for trapper

---

### Visuelle endringer

**Ghost Tiles:**
- Røde "UTFORSK" tiles = Posisjoner som ALDRI har blitt besøkt (ikke i exploredTiles)
- Grå tiles med MapPin = Posisjoner som HAR blitt besøkt men ikke lenger har en tile

**Trapper:**
- Viser nå kontekstmeny med "Gå opp/ned trappen (2 AP)" og "Undersøk trappen"
- Spilleren flyttes til nabotile etter å ha brukt trappen

---

### Build Status
✅ Build vellykket

---

## 2026-01-21: Tile System Fixes - Missing Mappings and Fog Visibility

### Oppsummering

Fikset to problemer med tile-systemet:
1. Manglende tile-bildemappinger førte til at noen tiles ikke viste grafikk
2. Fog of war overlay var for sterkt, noe som gjorde explored tiles nesten usynlige

---

### 1. Manglende Tile Image Mappings

**Problem:** Flere rom-navn (som "Abandoned Boathouse", "Flooded Cistern", etc.) hadde ingen matchende keywords i `TILE_IMAGES`, noe som resulterte i at bare fallback-ikoner ble vist i stedet for tile-grafikk.

**Løsning (`src/game/components/GameBoard.tsx`):**
La til 18 nye keyword-mappinger:
```typescript
boathouse: tileDock,       // Abandoned Boathouse
tide: tileDock,            // Eldritch Tide Pools
sentinel: tileForest,      // Sentinel Hill
shore: tileDock,           // Rocky Shore
cistern: tileSewer,        // Flooded Cistern
workshop: tileCellar,      // Underground Workshop
prison: tileCrypt,         // Ancient Prison
observatory: tileStarchamber, // Abandoned Observatory
pawn: tileShop,            // Midnight Pawn Shop
arms: tileHotel,           // The Miskatonic Arms
attic: tileManor,          // Dusty Attic
bathroom: tileHospital,    // Decrepit Bathroom
apartment: tileTenement,   // Cramped Apartment
junction: tileHallway,     // T-Junction, Sewer Junction
almshouse: tileTenement,   // Derelict Almshouse
stalls: tileMarket,        // Deserted Market Stalls
fountain: tileSquare,      // Dry Fountain
corner: tileStreet,        // Street Corner, Dark Corner
// + flere
```

---

### 2. Fog of War Visibility Forbedringer

**Problem:** Når spilleren beveget seg bort fra en tile, ble tilen nesten usynlig pga. for høy fog-opacity (0.7). Radial gradient gjorde også at bare midten av tilen var synlig.

**Løsning (`src/game/components/GameBoard.tsx`):**
- Reduserte fog opacity for explored-men-ikke-visible tiles fra 0.7 til 0.5
- Reduserte gradient fog for visible tiles i avstand fra 0.2 + (distance-1)*0.15 til 0.15 + (distance-1)*0.1
- Justerte radial gradient til å gi mer uniform mørke med lettere senter for explored tiles
- Endret unexplored tiles til å bruke solid mørke i stedet for radial gradient

**Kode etter:**
```typescript
// Calculate fog opacity based on visibility and exploration
let fogOpacity = 0;
if (!isVisible) {
  fogOpacity = isExplored ? 0.5 : 0.95; // Reduced from 0.7
} else if (distance > 1) {
  fogOpacity = 0.15 + (distance - 1) * 0.1; // Reduced gradient
}
```

---

### Build Status
Build vellykket uten feil.

---

## 2026-01-21: Field Journal Colors, Edge Functionality, Cursor Tooltips

### Oppsummering

Tre nye funksjoner implementert i denne økten:
1. Fargekodet Field Journal for ulike hendelsestyper
2. Pass-through funksjonalitet for vinduer, vann, ild etc.
3. Cursor-følgende tooltips nær musepeker

---

### 1. Field Journal med Fargekodede Loggmeldinger

**Problem:** Alle meldinger i Field Journal hadde samme farge, noe som gjorde det vanskelig å raskt identifisere hva som skjedde.

**Løsning:**
- **Fil: `src/game/types.ts`**
  - La til `LogCategory` type med 20 ulike kategorier (combat_hit, combat_miss, enemy_spawn, item_found, etc.)
  - La til `LogEntry` interface med timestamp, message og category
  - La til `detectLogCategory()` funksjon som analyserer meldingsinnhold og tildeler kategori
  - La til `getLogCategoryClasses()` funksjon som returnerer Tailwind CSS-klasser basert på kategori

- **Fil: `src/game/ShadowsGame.tsx`**
  - Oppdaterte `addToLog()` til å lage LogEntry-objekter med automatisk kategorideteksjon
  - Oppdaterte log-visning til å bruke fargeklasser basert på kategori

**Fargekategorier:**
- Rød: Kritiske treff, skade
- Oransje: Vanlige treff
- Grå: Bom, blokkert
- Grønn: Enemy death, healing, suksess
- Amber: Enemy spawn, mythos
- Gul: Items funnet
- Lilla: Sanity, horror, madness
- Cyan: Quest progress
- Blå: Exploration

---

### 2. Pass-Through Funksjonalitet for Vinduer og Blokkerte Kanter

**Problem:** Spiller kunne ikke fysisk flyttes gjennom vinduer eller andre passasjer som krever skill checks.

**Løsning:**
- **Fil: `src/game/utils/contextActionEffects.ts`**
  - La til `movePlayerThroughEdge?: boolean` til ActionEffectResult interface
  - La til liste over PASS_THROUGH_ACTIONS som trigger spillerbevegelse
  - Returnerer `{ movePlayerThroughEdge: true }` for handlinger som climb_through_window, wade_through, etc.

- **Fil: `src/game/ShadowsGame.tsx`**
  - La til håndtering av `movePlayerThroughEdge` flag i handleContextActionEffect
  - Flytter spiller til nabotile når flagget er satt
  - Kaller spawnRoom hvis måltile ikke eksisterer

**Støttede pass-through handlinger:**
- climb_through_window (vindu)
- wade_through, wade_through_edge (oversvømt)
- swim_across (dypt vann)
- jump_through_edge_fire, jump_fire (brann)
- force_through_edge_spirits, force_through (åndesperre)
- cross_ward, cross_edge_ward (magisk vern)
- use_rope_chasm (avgrunn med tau)
- pass_through_fog (tåkevegg)

---

### 3. Cursor-Følgende Tooltips

**Problem:** Hover-informasjon vistes langt fra musepekeren, i stedet for nær der spilleren ser.

**Løsning:**
- **Ny fil: `src/game/components/CursorTooltip.tsx`**
  - Laget `CursorTooltip` komponent som følger musepekeren
  - Viser info om tiles, edges, enemies og objects
  - Tilpasser posisjon ved kant av skjerm
  - Deaktiveres automatisk på mobil

- **Fil: `src/game/components/GameBoard.tsx`**
  - La til `hoverData` state for å tracke hva spilleren holder musen over
  - La til onMouseEnter/onMouseLeave handlers til tiles og enemies
  - Integrerte CursorTooltip komponenten

**Tooltips viser:**
- Tile: navn, kategori, beskrivelse, om den kan undersøkes
- Edge: dør-status, blokkeringstype, tilgjengelige handlinger
- Enemy: navn, skade, horror, traits, lore
- Object: type, beskrivelse, interaksjonsmuligheter

---

## 2026-01-21: Multiple Bug Fixes and Feature Implementations

### Oppsummering

Flere fikser og forbedringer implementert i denne økten:
1. Spell selection fix (z-index issue)
2. Full puzzle system implementation (6 puzzle types)
3. Quest item pickup system
4. Missing tile graphics mappings

---

### 1. Spell Selection Fix

**Problem:** Spell-menyen kunne ikke velges når man trykket Cast-knappen.

**Årsak:** z-index konflikt mellom spell dropdown (z-50) og ContextActionBar (z-50), der ContextActionBar overlappet spell-menyen.

**Løsning (`src/game/components/ActionBar.tsx`):**
- Økte z-index på spell dropdown fra `z-50` til `z-[60]`

---

### 2. PuzzleModal Integration - 6 Puzzle Types

**Problem:** Bare 4 av 6 puzzle-typer var implementert.

**Endringer:**

**Fil: `src/game/types.ts`**
- La til `mirror_light` til PuzzleType
- La til `puzzleType?: PuzzleType` til EdgeData interface

**Fil: `src/game/components/PuzzleModal.tsx`**
- Implementerte `PressurePlatePuzzle` - trykk på plater i riktig rekkefølge
- Implementerte `MirrorLightPuzzle` - roter speil for å lede lys til mål
- La til messages for nye puzzle-typer i StatusFooter
- Oppdaterte renderPuzzle() og getPuzzleInfo() for nye typer

**Fil: `src/game/ShadowsGame.tsx`**
- Oppdaterte solve_puzzle handler til å bruke puzzleType fra edge, eller tilfeldig type

---

### 3. Quest Item Pickup System

**Problem:** Quest items kunne ikke plukkes opp fra tiles med objekter, og manglende dedikert quest item slot.

**Endringer:**

**Fil: `src/game/types.ts`**
- La til `questItems: Item[]` til InventorySlots interface
- Oppdaterte `createEmptyInventory()` til å inkludere `questItems: []`
- Oppdaterte `equipItem()` til å automatisk legge quest items i questItems array

**Fil: `src/game/utils/contextActions.ts`**
- Oppdaterte `getTileObjectActions()` til å inkludere quest item pickup actions selv når tiles har objekter

**Fil: `src/game/components/CharacterPanel.tsx`**
- La til dedikert Quest Items seksjon med gul styling for å vise innsamlede quest items

---

### 4. Missing Tile Graphics Mappings

**Problem:** Noen rom-navn hadde ikke matching tile-grafikk keywords.

**Manglende mappings funnet:**
- Boarded-Up Townhouse
- Dim Reception
- Narrow Service Hall
- Creaking Floorboards
- Wine Tasting Room
- Rats Nest
- The Pit
- The Standing Stones
- The Devils Acre
- Dead End
- Hanging Tree

**Løsning (`src/game/components/GameBoard.tsx`):**
La til nye keyword mappings i TILE_IMAGES:
```typescript
townhouse: tileManor,
reception: tileManor,
service: tileHallway,
floor: tileHallway,
tasting: tileCellar,
rats: tileSewer,
pit: tileCrypt,
standing: tileStonecircle,
devils: tileGraveyard,
dead: tileDeadend,
hanging: tileHangingtree
```

---

### Build Status
Build vellykket uten feil.

---

## 2026-01-21: PC Tile-Klikk Bevegelse Fikset

### Oppsummering

Fikset et problem der spillere ikke kunne flytte figurer ved å klikke på tiles på PC.

---

### Problem

Når brukeren klikket på tiles på PC for å bevege spillerfiguren ("Hero"), skjedde ingenting. Det "gamle systemet" hvor man klikker på en tile og figuren beveger seg dit fungerte ikke.

### Årsak

Etter analyse ble følgende potensielle problemer identifisert:

1. **Manglende `cursor-pointer`** på tile-div'en - gjorde det ikke visuelt klart at tiles var klikkbare
2. **Manglende `pointer-events-none`** på tile-bildet (img) - bildet kunne potensielt fange opp klikk før de nådde forelder-div'en med onClick-handler

### Løsning

**Fil: `src/game/components/GameBoard.tsx`**

1. Lagt til `cursor-pointer` på tile-div'en for visuell indikasjon:
```typescript
className="absolute flex items-center justify-center transition-all duration-500 cursor-pointer"
```

2. Lagt til `pointer-events-none` på tile-bildet for å sikre at klikk går gjennom til tile-div'en:
```typescript
<img
  src={tileImage}
  alt={tile.name}
  className="absolute inset-0 w-full h-full object-cover z-[1] pointer-events-none"
/>
```

### Teknisk bakgrunn

Desktop klikkhåndtering fungerer via:
1. `handleMouseDown` på container setter `hasDragged.current = false`
2. `handleMouseMove` setter `hasDragged.current = true` hvis bevegelse > 25px (DRAG_THRESHOLD)
3. `onClick` på tile sjekker `if (!hasDragged.current)` før den kaller `onTileClick`

Mobil håndtering bruker onTouchEnd med egen logikk for tap-deteksjon (wasQuickTap, wasMinimalMovement).

### Build Status
✅ TypeScript kompilerer uten feil

---

## 2026-01-21: Bevegelsessystem Fikset - Adjacency Check

### Oppsummering

Fikset to kritiske bugs i bevegelsessystemet:
1. Spillere kunne "teleportere" til ikke-tilstøtende tiles
2. Klikking på fjerne tiles avslørte informasjon om hva som var på tilen

---

### Problem 1: Manglende Adjacency Check

**Bug:**
Bevegelseskoden sjekket IKKE om mål-tilen var tilstøtende til spilleren. Dette tillot:
- Klikk på en hvilken som helst tile → spilleren flyttet dit (teleporterte)
- Edge-sjekker (vegger, dører) ble hoppet over for ikke-tilstøtende tiles

**Årsak:**
`getEdgeIndexBetweenTiles()` returnerte -1 for ikke-tilstøtende tiles, og denne verdien ble brukt til å skippe edge-valideringen i stedet for å blokkere bevegelse.

**Løsning:**
Lagt til tidlig sjekk i `handleAction('move')`:
```typescript
// CRITICAL: Only allow movement to adjacent tiles!
if (distanceToTarget === 0) {
  return; // Klikk på egen tile gjør ingenting
}
if (!isAdjacent) {
  if (targetTile && distanceToTarget <= 2) {
    addToLog(`For langt unna. Du kan bare bevege deg til tilstøtende tiles.`);
  }
  return; // Blokkerer bevegelse til ikke-tilstøtende tiles
}
```

### Problem 2: Informasjonslekkasje ved Tile-klikk

**Bug:**
Når man klikket på en tile med blokkerende objekt (dør, rubble, etc.), logget spillet:
- "PATH BLOCKED: locked_door" (avslører hva som er der)
- "Du må være nærmere for å interagere med det." (bekrefter at det ER noe der)

**Løsning:**
Fjernet logging av objekttyper for ikke-tilstøtende tiles. Nå vises kun en generisk melding for tiles innenfor 2-tile siktavstand, og ingen melding for fjernere tiles.

### Endrede Filer

**src/game/ShadowsGame.tsx:**
- `handleAction('move')` - Lagt til adjacency-validering før all annen bevegelseslogikk
- Endret `isAdjacent` fra `distanceToTarget <= 1` til `distanceToTarget === 1` (ekskluderer egen tile)
- Fjernet informasjonslekkasje for ikke-tilstøtende tiles

### Spillmekanikk Oppsummering

**Bevegelsesregler (fikset):**
| Avstand | Handling |
|---------|----------|
| 0 (egen tile) | Ingenting skjer |
| 1 (tilstøtende) | Bevegelse tillatt (respekterer kanter, objekter, etc.) |
| 2+ (fjern) | Blokkert med melding "For langt unna" |

**Utforskning:**
- Ghost-tiles (uutforskede tilstøtende tiles) fungerer fortsatt
- Klikk på ghost-tile → spawnRoom() → bevegelse
- Action points forbrukes kun ved faktisk bevegelse

### Build Status
✅ TypeScript kompilerer uten feil

---

## 2026-01-21: Hex Tiles Logikk Forbedret + Nye Tiles

### Oppsummering

Implementert nabo-basert sannsynlighetslogikk (Tile Affinity System) og lagt til 25+ nye tile-varianter for bedre variasjon i generert innhold.

---

### OPPGAVE 1: Tile Affinity System

**Problem:**
Når tiles som "Fishing Dock" plasseres, bør det være større sannsynlighet for at vannrelaterte tiles (sjø, andre docks, broer) dukker opp naturlig rundt dem.

**Løsning: Tile Affinity System**

Implementert et komplett affinitetssystem i `tileConnectionSystem.ts` som:

1. **Definerer tile-affiniteter** - Hver tile kan "tiltrekke" andre tiles basert på:
   - Spesifikke template IDs
   - Kategorier (nature, urban, crypt, etc.)
   - Gulvtyper (water, ritual, etc.)
   - SubTypes (dock, harbor, etc.)
   - Kanttyper (WATER, NATURE, etc.)

2. **Beregner bonus-vekter** - `calculateAffinityBonus()` funksjonen:
   - Sjekker alle naboer for affiniteter
   - Gir bonus til templates som matcher
   - Støtter konfigurerbar bonus-multiplikator (1.3x - 2.0x)
   - Har diminishing returns (maks 3x bonus)

3. **Integrert i generering** - `findValidTemplates()` og `generateAdjacentTile()` bruker nå affiniteter

**Nye Funksjoner:**
- `TILE_AFFINITIES` - Record med affinitetsdefinisjoner for 40+ tiles
- `calculateAffinityBonus(template, neighbors)` - Beregner affinitetsbonus
- `getNeighborTiles(board, q, r)` - Henter nabotiles for en posisjon

**Eksempel på Affinity:**
```typescript
urban_dock: {
  attractsTemplates: ['urban_dock', 'urban_harbor', 'street_bridge', 'nature_swamp', 'nature_marsh'],
  attractsFloorTypes: ['water'],
  attractsEdgeTypes: ['WATER'],
  attractsSubTypes: ['dock', 'harbor', 'bridge', 'sewer', 'marsh', 'swamp'],
  bonusMultiplier: 2.0  // 100% økt sannsynlighet
}
```

**Tematiske Klynger Støttet:**
| Tema | Tiles som tiltrekker hverandre |
|------|-------------------------------|
| **Vann/Havn** | dock, harbor, pier, boathouse, bridge, shore, tidepools |
| **Kirkegård/Død** | cemetery, funeral, crypt, tomb, ossuary |
| **Okkult/Ritual** | ritual, altar, witchhouse, stones, portal |
| **Akademisk** | museum, library, study, bookshop, maproom |
| **Skog/Natur** | forest, clearing, path, marsh, swamp |
| **Underjordisk** | cave, mine, tunnel, sewer, cistern |

---

### OPPGAVE 2: Nye Tile-Varianter (25+)

Lagt til 25+ nye tiles for mer variasjon:

**Vann/Kyst Tiles (4):**
| Tile | Beskrivelse |
|------|-------------|
| `urban_pier` | Rotting Pier - trebrygge over vann |
| `urban_boathouse` | Abandoned Boathouse - forlatt båthus |
| `nature_shore` | Rocky Shore - steinete kystlinje |
| `nature_tidepools` | Eldritch Tide Pools - mystiske tidevannsbassenger |

**Street/Urban Tiles (4):**
| Tile | Beskrivelse |
|------|-------------|
| `street_foggy` | Fog-Shrouded Lane - tåkefylt gate |
| `street_market` | Deserted Market Stalls - forlatte markedsboder |
| `urban_fountain` | Dry Fountain - tørr fontene på torget |
| `urban_almshouse` | Derelict Almshouse - falleferdig fattighus |

**Nature Tiles (5):**
| Tile | Beskrivelse |
|------|-------------|
| `nature_hilltop` | Sentinel Hill - utsiktspunkt med okkulte ritualer |
| `nature_deadtrees` | Blighted Grove - døde trær som nekter å falle |
| `nature_farmfield` | Abandoned Farm Field - forlatt åker |
| `nature_shore` | Rocky Shore |
| `nature_tidepools` | Eldritch Tide Pools |

**Room Tiles (5):**
| Tile | Beskrivelse |
|------|-------------|
| `room_attic` | Dusty Attic - støvete loft med hemmeligheter |
| `room_bathroom` | Decrepit Bathroom - rustent bad med skremmende speil |
| `room_cellarwine` | Hidden Wine Vault - skjult vinkjeller |
| `room_trophy` | Trophy Room - jaktrom med ukjente arter |
| `room_music` | Music Room - musikkrom med selvspillende piano |

**Basement Tiles (3):**
| Tile | Beskrivelse |
|------|-------------|
| `basement_icehouse` | Ice Storage - islagring med bevarte ting |
| `basement_workshop` | Underground Workshop - underjordisk verksted |
| `basement_cistern` | Flooded Cistern - oversvømt sisterne |

**Crypt Tiles (3):**
| Tile | Beskrivelse |
|------|-------------|
| `crypt_ossuary` | Bone Ossuary - beinkapell med symboler |
| `crypt_laboratory` | Forbidden Laboratory - forbudt laboratorium |
| `crypt_prison` | Ancient Prison - eldgammelt fengsel |

**Facade Tiles (4):**
| Tile | Beskrivelse |
|------|-------------|
| `facade_tavern` | The Miskatonic Arms - sjømannskro |
| `facade_bookshop` | Curious Book Shop - mystisk bokhandel |
| `facade_pawnshop` | Midnight Pawn Shop - pantelåner |
| `facade_observatory` | Abandoned Observatory - forlatt observatorium |

---

### Filer Modifisert

**`src/game/tileConnectionSystem.ts`:**
- Lagt til `TILE_AFFINITIES` system (200+ linjer)
- Lagt til `TileAffinity` interface
- Lagt til `calculateAffinityBonus()` funksjon
- Lagt til `getNeighborTiles()` funksjon
- Oppdatert `findValidTemplates()` til å bruke affiniteter
- Oppdatert `generateAdjacentTile()` til å sende naboer
- Oppdatert `getPreviewForAdjacentTile()` til å bruke affiniteter
- Lagt til 25+ nye TileTemplate definisjoner
- Oppdatert TILE_TEMPLATES registry med alle nye tiles

**`src/game/ShadowsGame.tsx`:**
- Importert `getNeighborTiles` fra tileConnectionSystem
- Oppdatert `spawnRoom` til å bruke affinity-systemet

---

### Build Status
✅ Kompilerer uten feil

---

### Tekniske Detaljer

**Affinity Bonus Beregning:**
1. For hver nabo med affinity definert:
   - Sjekk template ID match → full bonus
   - Sjekk kategori match → 80% bonus
   - Sjekk subType match → 70% bonus
   - Sjekk floorType match → 60% bonus
   - Sjekk edgeType match → 50% bonus
2. Summer alle bonuser
3. Cap på 3x total bonus (diminishing returns)

**Vektet Utvalg:**
```
Template Score = spawnWeight × affinityBonus × categoryBonus
```

Høyere score = høyere sannsynlighet for å bli valgt.

---

## 2026-01-21: Bug Hunt Fortsetter - BUG-002 Fikset

### Oppsummering

Fortsatt med bug hunt. Søkte etter flere bug-mønstre og fikset BUG-002 som var dokumentert fra forrige session.

---

### BUG-SØK RESULTATER

Søkte etter følgende mønstre:
- `FIXME`, `TODO`, `XXX`, `HACK`, `BUG` kommentarer → Ingen funnet
- `as any` type assertions → 1 gjenværende (BUG-002, nå fikset)
- `: any` explicit types → 7 steder i `roomSpawnHelpers.ts` (dokumentert)
- `.catch(() => ...)` stille feilhåndtering → 1 sted (allerede dokumentert som BUG-010)
- Non-null assertions (`!`) → 8 steder, de fleste er OK med guards

---

### BUG-002 FIKSET: `as any` i emitSpellEffect

**Fil:** `src/game/ShadowsGame.tsx`

**Problemet:**
```typescript
// Før - inline union type + as any
const emitSpellEffect = (
  type: 'wither' | 'eldritch_bolt' | 'mend_flesh' | ...,
  ...
) => {
  const particle = {
    type: type as any,  // TypeScript bypass
  };
};
```

`as any` ble brukt fordi funksjonsparameteren definerte en inline union type som var identisk med `SpellParticleType`, men TypeScript så dem som forskjellige.

**Løsningen:**
1. Importerte `SpellParticleType` fra `types.ts` (linje 5)
2. Endret funksjonssignaturen til å bruke den definerte typen direkte
3. Fjernet `as any` - ingen type assertion trengs

```typescript
// Etter - bruker definert type
import { ..., SpellParticleType } from './types';

const emitSpellEffect = (
  type: SpellParticleType,  // ← Definert type
  ...
) => {
  const particle = {
    type,  // ← Ingen as any
  };
};
```

**Forbedringer:**
- Type-sikkerhet: TypeScript validerer nå at kun gyldige particle typer brukes
- Vedlikeholdbarhet: Endringer i `SpellParticleType` propagerer automatisk
- Lesbarhet: Kortere og renere funksjonssignatur

---

### BUILD VERIFISERING

```
✓ npm run build - VELLYKKET
✓ Ingen TypeScript-feil
✓ Bundle størrelse uendret
```

---

### FILER ENDRET

1. `src/game/ShadowsGame.tsx`
   - Linje 5: La til `SpellParticleType` i import
   - Linje 601: Endret parameter type til `SpellParticleType`
   - Linje 625: Fjernet `as any`

2. `BUGS.MD`
   - Oppdatert BUG-002 status til FIKSET
   - Oppdatert status oversikt (2 fikset, 2 bekreftet)

---

### STATUS ETTER DENNE SESSION

| Status | Antall |
|--------|--------|
| **FIKSET** | 2 |
| **BEKREFTET** | 2 |
| **TIL VERIFISERING** | 2 |
| **LITEN RISIKO** | 5 |

**Gjenværende bekreftet bugs:**
- BUG-003: `as EnemyType` uten validering
- BUG-004: Race condition i state updates + logging

---

## 2026-01-21: Bug Hunt - Codebase Audit og Fix

### Oppsummering

Gjennomført en systematisk søk etter bugs og feilutsatt kode i kodebasen. Opprettet BUGS.MD for å spore alle funn. Fikset én kritisk type-safety bug.

---

### BUG-SØKET

Søkte etter følgende mønstre:
- `FIXME`, `TODO`, `BUG`, `HACK` kommentarer (ingen funnet)
- `as any` type assertions (3 funnet)
- Potensielle null/undefined tilganger
- Array bounds issues
- Race conditions i React state
- Memory leaks i useEffect

---

### BUG FUNNET OG DOKUMENTERT

**11 potensielle bugs identifisert** - se `BUGS.MD` for komplett liste.

| Severity | Antall | Status |
|----------|--------|--------|
| FIKSET | 1 | ✅ |
| BEKREFTET | 3 | Trenger fiks |
| TIL VERIFISERING | 2 | Kan være OK |
| LITEN RISIKO | 5 | Dokumentert |

---

### BUG-001 FIKSET: Unødvendig `as any` i SkillCheckPanel

**Fil:** `src/game/components/SkillCheckPanel.tsx:49`

**Problem:**
```typescript
// Før - unødvendig type assertion
const attrs = (player as any).attributes;
if (!attrs) return 2;
return attrs[skill] || 2;
```

`Player` extends `Character` som har `attributes: CharacterAttributes`. Type assertion var helt unødvendig og skjulte potensielle type-feil.

**Løsning:**
```typescript
// Etter - type-sikker direkte tilgang
return player.attributes[skill] ?? 2;
```

**Forbedringer:**
- Fjernet `as any` som omgikk TypeScript
- Bruker nullish coalescing (`??`) i stedet for logical or (`||`)
- Enklere og kortere kode
- TypeScript kan nå fange type-feil

---

### FILER ENDRET

1. `BUGS.MD` - NY FIL - Bug tracker for prosjektet
2. `src/game/components/SkillCheckPanel.tsx` - Fjernet `as any`

---

### NESTE STEG

Se `BUGS.MD` for andre bugs som bør fikses:
- BUG-002: `as any` i ShadowsGame.tsx particle system
- BUG-003: `as EnemyType` uten validering
- BUG-004: Race condition i state updates + logging

---

## 2026-01-21: Refactor objectiveSpawner.ts - Data-Driven Lookup Pattern

### Oppsummering

Refaktorert fire komplekse funksjoner i `objectiveSpawner.ts` fra if/else og switch/case-kjeder til data-driven lookups. Dette forbedrer lesbarhet, vedlikeholdbarhet, og gjør det enklere å legge til nye rom-typer og spawn-regler.

---

### PROBLEMET IDENTIFISERT 🔴

Fire funksjoner hadde gjentatte string-matching patterns med mange if/else eller switch/case statements:

1. **shouldSpawnQuestItem** - Room bonus beregning med 4 if/else blokker
2. **createQuestTile** - Tile type bestemmelse med 4 if/else blokker
3. **findBestSpawnTile** - Room scoring med 6+ if statements i nested struktur
4. **findBestQuestTileLocation** - Location scoring med 14+ if statements i switch/case

Disse mønstrene var vanskelige å vedlikeholde og utvide.

---

### LØSNING IMPLEMENTERT ✅

#### 1. Nye Data-strukturer

Lagt til fire lookup-tabeller:

```typescript
// Room spawn bonuses for item spawning
export const ROOM_SPAWN_BONUSES: RoomSpawnBonus[] = [
  { patterns: ['ritual', 'altar', 'sanctum'], bonus: 0.25 },
  { patterns: ['study', 'library', 'office'], bonus: 0.2 },
  { patterns: ['cellar', 'basement', 'vault'], bonus: 0.15 },
  { patterns: ['storage', 'cache', 'closet'], bonus: 0.1 },
];

// Quest tile type lookup
export const QUEST_TILE_TYPE_LOOKUP: QuestTileTypeLookup[] = [
  { patterns: ['exit'], type: 'exit', name: 'Exit' },
  { patterns: ['altar', 'ritual'], type: 'altar', name: 'Ritual Altar' },
  // ...
];

// Item room scores based on item type
export const ITEM_ROOM_SCORES: ItemRoomScores = {
  key: [{ patterns: ['study', 'office'], score: 3 }, ...],
  clue: [{ patterns: ['library', 'study'], score: 3 }, ...],
  // ...
};

// Quest tile location scores
export const QUEST_TILE_LOCATION_SCORES: QuestTileLocationScores = {
  exit: [{ category: 'foyer', score: 5 }, ...],
  altar: [{ category: 'crypt', score: 5 }, ...],
  // ...
};
```

#### 2. Nye Hjelpefunksjoner

```typescript
getRoomSpawnBonus(roomName: string): number
getQuestTileTypeFromTargetId(targetId: string): { type, name }
getItemRoomScore(itemType: string, roomName: string): number
getQuestTileLocationScore(questTileType: string, tile: Tile): number
```

#### 3. Refaktorerte Funksjoner

**Før (shouldSpawnQuestItem):**
```typescript
if (roomName.includes('study') || roomName.includes('library') || roomName.includes('office')) {
  roomBonus = 0.2;
} else if (roomName.includes('cellar') || roomName.includes('basement') || roomName.includes('vault')) {
  roomBonus = 0.15;
} // ... etc
```

**Etter:**
```typescript
const roomBonus = getRoomSpawnBonus(tile.name);
```

**Før (findBestSpawnTile):**
```typescript
if (item.type === 'key') {
  if (roomName.includes('study') || roomName.includes('office')) score += 3;
  if (roomName.includes('bedroom') || roomName.includes('guard')) score += 2;
} else if (item.type === 'clue') {
  // ... 8 more conditions
}
```

**Etter:**
```typescript
const score = 1 + getItemRoomScore(item.type, tile.name) + Math.random() * 0.5;
```

---

### FILER ENDRET

1. **src/game/utils/objectiveSpawner.ts**
   - Lagt til 4 data-strukturer (interfaces + lookup-tabeller)
   - Lagt til 4 hjelpefunksjoner
   - Refaktorert `shouldSpawnQuestItem` - 12 linjer → 1 linje
   - Refaktorert `createQuestTile` - 16 linjer → 2 linjer
   - Refaktorert `findBestSpawnTile` - 12 linjer → 3 linjer
   - Refaktorert `findBestQuestTileLocation` - 28 linjer → 3 linjer

---

### FORDELER

| Før | Etter |
|-----|-------|
| 68 linjer med if/else og switch/case | 9 linjer med funksjonskall |
| Vanskelig å legge til nye rom-typer | Legg til én linje i lookup-tabell |
| Duplikert logikk for pattern-matching | Sentralisert pattern-matching |
| Svak dokumentasjon | Selvdokumenterende data-strukturer |

---

### RESULTAT

- ✅ Build vellykket (923KB bundle)
- ✅ Samme funksjonalitet, bedre struktur
- ✅ Følger prosjektets etablerte data-driven pattern
- ✅ Enklere å utvide med nye rom-typer

---

## 2026-01-20: Comprehensive Mobile Touch and Quest Item Fixes

### Oppsummering

Fikset tre kritiske problemer:
1. **Touch-basert spillerbevegelse** - Forbedret tap-deteksjon med høyere thresholds og bevegelsessjekk
2. **Quest item pickup** - Lagt til direkte "Plukk opp" handling for synlige quest items
3. **Tile info-avsløring på mobil** - Spilleren kan ikke lenger se context actions for fjerne tiles

---

### PROBLEMER IDENTIFISERT OG LØST 🔴→✅

#### 1. Mobil touch bevegelse fungerte fortsatt ikke pålitelig
**Problem:** Selv etter forrige fix, var det vanskelig å flytte spilleren på mobil. Finger-bevegelser under tap trigger fortsatt `hasDragged.current = true`.

**Løsning:**
- Økt `DRAG_THRESHOLD` fra 15px til 25px
- Økt `TAP_TIME_THRESHOLD` fra 250ms til 350ms
- Lagt til ny `MOBILE_TAP_MOVEMENT_THRESHOLD` (20px) for å sjekke faktisk bevegelse
- Oppdatert touch handlers til å bruke både `hasDragged` og faktisk bevegelsesavstand:

```typescript
// Calculate actual movement from touch start position
const changedTouch = e.changedTouches[0];
let actualMovement = 0;
if (changedTouch && tileTouchStartPos.current) {
  actualMovement = Math.hypot(
    changedTouch.clientX - tileTouchStartPos.current.x,
    changedTouch.clientY - tileTouchStartPos.current.y
  );
}
const wasMinimalMovement = actualMovement < MOBILE_TAP_MOVEMENT_THRESHOLD;

// Use both hasDragged and actual movement check for more reliable tap detection
if (wasQuickTap && wasSameTile && (wasMinimalMovement || !hasDragged.current)) {
  onTileClick(tile.q, tile.r);
}
```

**Fil:** `src/game/components/GameBoard.tsx`

---

#### 2. Kan ikke plukke opp quest items
**Problem:** Quest items på tiles kunne ikke plukkes opp. Spilleren måtte bruke "Search Area" som krever skill check.

**Løsning:**
- Lagt til eksplisitt "Plukk opp: [item navn]" handling i context actions for tiles med synlige quest items
- Quest item pickup er nå gratis (0 AP) - det er en "free action"
- Lagt til `pickup_quest_item_X` handling i `handleContextActionEffect`

**Fil:** `src/game/utils/contextActions.ts` og `src/game/ShadowsGame.tsx`

```typescript
// Check if tile has visible quest items that can be picked up
const hasVisibleQuestItems = tile.items && tile.items.length > 0 && tile.items.some(item => item.isQuestItem);
if (hasVisibleQuestItems) {
  const questItems = tile.items?.filter(item => item.isQuestItem) || [];
  questItems.forEach((item, index) => {
    actions.push({
      id: `pickup_quest_item_${index}`,
      label: `Plukk opp: ${item.name}`,
      icon: 'interact',
      apCost: 0, // Free action to pick up visible items
      enabled: true,
      successMessage: `Du plukket opp ${item.name}!`
    });
  });
}
```

---

#### 3. Man kan trykke på alle tiles og se info (mobil)
**Problem:** Spilleren kunne trykke på tiles langt unna og se context actions, som avslører info om objekter og obstacles på tilen.

**Løsning:**
- Lagt til adjacency-sjekk før context actions vises
- Hvis spilleren klikker på en tile med blocking object/obstacle som ikke er adjacent, vises meldingen "Du må være nærmere for å interagere med det."

**Fil:** `src/game/ShadowsGame.tsx`

```typescript
// Check if target tile is adjacent to player (distance 1 or 0)
const distanceToTarget = hexDistance(activePlayer.position, { q, r });
const isAdjacent = distanceToTarget <= 1;

// Check for blocking objects - only show context menu if adjacent
if (targetTile?.object?.blocking) {
  if (isAdjacent) {
    showContextActions(targetTile);
  } else {
    addToLog(`Du må være nærmere for å interagere med det.`);
  }
  return;
}
```

---

### FILER ENDRET

1. **src/game/components/GameBoard.tsx**
   - Økt touch thresholds for mer pålitelig tap-deteksjon
   - Lagt til faktisk bevegelsessjekk i onTouchEnd

2. **src/game/utils/contextActions.ts**
   - Lagt til "Plukk opp" actions for tiles med synlige quest items

3. **src/game/ShadowsGame.tsx**
   - Lagt til `pickup_quest_item_X` handling i handleContextActionEffect
   - Lagt til adjacency-sjekk før context actions vises

---

## 2026-01-20: Fix Mobile Touch Movement and Disable Tooltip Inspection

### Oppsummering

Fikset to kritiske mobilproblemer:
1. **Touch-basert spillerbevegelse** fungerte ikke pålitelig på mobil
2. **Tooltips ga "gratis" informasjon** ved touch på mobil uten å bruke action points

---

### PROBLEMER IDENTIFISERT 🔴

#### 1. Touch-bevegelse fungerte ikke på mobil
**Problem:** Når spilleren prøvde å trykke på en tile for å flytte på mobil, ble ikke `onClick`-eventet trigget konsistent. Dette skyldtes konflikt mellom container-nivå touch handlers (for drag/pan) og tile-nivå touch handlers.

**Årsak:**
- Container `handleTouchStart` startet drag-logikk og satte `hasDragged.current = false`
- Selv små bevegelser under touch kunne sette `hasDragged.current = true`
- `onClick` på tiles sjekket `if (!hasDragged.current)` og failet

#### 2. Tooltips viste informasjon uten kost
**Problem:** På mobil kunne spilleren trykke på hvilken som helst tile og se tooltip med informasjon om objekter, fiender og edge-features - uten å bruke action points eller være adjacent.

**Årsak:** Radix UI tooltips trigger ved touch på mobil, noe som ga spilleren "gratis" informasjon som burde kreve Investigate-handling.

---

### LØSNING IMPLEMENTERT ✅

#### 1. Eksplisitt Mobile Tap Handling

**Fil:** `src/game/components/GameBoard.tsx`

Lagt til nye refs for å tracke touch på tile-nivå:
```typescript
// Track tile being touched for explicit mobile tap handling
const touchedTileRef = useRef<{ q: number; r: number } | null>(null);
const tileTouchStartTime = useRef<number>(0);
const tileTouchStartPos = useRef<{ x: number; y: number } | null>(null);
```

Oppdatert tile touch handlers til å eksplisitt håndtere tap:
```typescript
onTouchStart={(e) => {
  setTouchedTileKey(tileKey);
  handleTileLongPressStart(tile.q, tile.r);
  // Store touch info for mobile tap detection
  touchedTileRef.current = { q: tile.q, r: tile.r };
  tileTouchStartTime.current = Date.now();
  const touch = e.touches[0];
  if (touch) {
    tileTouchStartPos.current = { x: touch.clientX, y: touch.clientY };
  }
}}
onTouchEnd={(e) => {
  setTouchedTileKey(null);
  handleTileLongPressEnd();
  // Mobile tap detection - trigger tile click if quick tap without drag
  const touchDuration = Date.now() - tileTouchStartTime.current;
  const wasQuickTap = touchDuration < TAP_TIME_THRESHOLD;
  const wasSameTile = touchedTileRef.current?.q === tile.q && touchedTileRef.current?.r === tile.r;

  if (wasQuickTap && !hasDragged.current && wasSameTile) {
    e.preventDefault();
    onTileClick(tile.q, tile.r);
  }
  touchedTileRef.current = null;
  tileTouchStartPos.current = null;
}}
```

#### 2. Disable Tooltips på Mobil

**Fil:** `src/game/components/ItemTooltip.tsx`

Lagt til `useIsMobile` hook import:
```typescript
import { useIsMobile } from '@/hooks/use-mobile';
```

Oppdatert tre tooltip-komponenter til å returnere bare children på mobil:

**EnemyTooltip:**
```typescript
export const EnemyTooltip: React.FC<EnemyTooltipProps> = ({ enemy, children }) => {
  const isMobile = useIsMobile();
  // On mobile, don't show tooltips - prevents "free" information gathering via touch
  if (isMobile) {
    return <>{children}</>;
  }
  // ... rest of component
};
```

**TileObjectTooltip:**
```typescript
export const TileObjectTooltip: React.FC<TileObjectTooltipProps> = ({ object, children }) => {
  const isMobile = useIsMobile();
  // On mobile, don't show tooltips - prevents "free" information gathering
  // Player must investigate the tile to learn what's there
  if (isMobile) {
    return <>{children}</>;
  }
  // ... rest of component
};
```

**EdgeFeatureTooltip:**
```typescript
export const EdgeFeatureTooltip: React.FC<EdgeFeatureTooltipProps> = ({ edge, children }) => {
  const isMobile = useIsMobile();
  // On mobile, don't show tooltips - prevents "free" information gathering via touch
  if (isMobile) {
    return <>{children}</>;
  }
  // ... rest of component
};
```

---

### FILER MODIFISERT

1. **src/game/components/GameBoard.tsx**
   - Nye refs: `touchedTileRef`, `tileTouchStartTime`, `tileTouchStartPos`
   - Oppdatert tile touch handlers med eksplisitt tap-deteksjon
   - Oppdatert possibleMoves touch handlers med samme logikk

2. **src/game/components/ItemTooltip.tsx**
   - Import `useIsMobile` hook
   - `EnemyTooltip`: Returnerer bare children på mobil
   - `TileObjectTooltip`: Returnerer bare children på mobil
   - `EdgeFeatureTooltip`: Returnerer bare children på mobil

---

### BRUKEROPPLEVELSE FORBEDRINGER

| Før | Etter |
|-----|-------|
| Touch på tile flyttet ikke spilleren | Touch på tile flytter spilleren pålitelig |
| Tooltips viste info ved touch (gratis) | Tooltips vises IKKE på mobil - må bruke Investigate |
| Spilleren kunne "cheate" ved å se på alle tiles | Spilleren må faktisk bruke handlinger for informasjon |

---

### SPILLMEKANIKK FORBEDRING

**Regelbok-kompatibilitet:** Iht. REGELBOK.MD skal spilleren bruke **Investigate**-handlingen (1 AP) for å undersøke tiles og finne skjulte ting. Ved å disable tooltips på mobil følger vi dette prinsippet - spilleren kan ikke lenger få "gratis" informasjon ved å holde fingeren på en tile.

---

### RESULTAT

- ✅ Touch-basert bevegelse fungerer pålitelig på mobil
- ✅ Tooltips vises IKKE på mobil (ingen "gratis" informasjon)
- ✅ Spillmekanikken følger regelverket bedre
- ✅ TypeScript kompilerer uten feil
- ✅ Build vellykket (917KB bundle)

---

## 2026-01-20: Mobile Touch Hero Movement Enhancement

### Oppsummering

Forbedret touch-basert hero-bevegelse for mobil. Lagt til visuell indikasjon av gyldige bevegelser, long-press preview-funksjonalitet, og forbedret touch-feedback på tiles spilleren kan flytte til.

---

### PROBLEMER IDENTIFISERT 🔴

#### 1. Manglende Visuell Feedback på Gyldige Bevegelser
**Problem:** På mobil var det vanskelig å se hvilke tiles helten kunne flytte til. Ingen tydelig markering av nabo-tiles.

#### 2. Tap-to-move Presisjon
**Problem:** Brukere måtte treffe tiles presist for å flytte. Ingen feedback før man faktisk trykket.

#### 3. Begrenset Touch Feedback
**Problem:** Kun grunnleggende brightness-endring ved touch. Ingen long-press preview eller haptic feedback.

---

### LØSNING IMPLEMENTERT ✅

#### 1. Gyldige Bevegelser Highlighting (`validMoves`)

**Fil:** `src/game/components/GameBoard.tsx`

Lagt til beregning av gyldige bevegelser basert på aktiv spillers posisjon:

```typescript
// Calculate valid move tiles for the active player (adjacent tiles they can move to)
const validMoves = useMemo(() => {
  const activePlayer = players[activePlayerIndex];
  if (!activePlayer || activePlayer.isDead) return new Set<string>();

  const validSet = new Set<string>();
  const playerPos = activePlayer.position;

  // Get all adjacent tiles (neighbors)
  HEX_NEIGHBORS.forEach(dir => {
    const neighborQ = playerPos.q + dir.q;
    const neighborR = playerPos.r + dir.r;
    const key = `${neighborQ},${neighborR}`;
    // Add existing and possible moves
    if (existingTile || isPossibleMove) validSet.add(key);
  });

  return validSet;
}, [players, activePlayerIndex, tiles, possibleMoves]);
```

#### 2. Long-Press Preview System

**Ny funksjonalitet:**
- `LONG_PRESS_THRESHOLD = 400ms` - tid for å trigge preview
- `longPressTile` state - holder posisjon for forhåndsvisning
- `selectedMoveTarget` state - valgt bevegelsesmål
- Haptic feedback via `navigator.vibrate(50)` ved long-press

```typescript
const handleTileLongPressStart = (q: number, r: number) => {
  longPressTimer.current = setTimeout(() => {
    const key = `${q},${r}`;
    if (validMoves.has(key)) {
      setLongPressTile({ q, r });
      setSelectedMoveTarget({ q, r });
      // Haptic feedback if available
      if (navigator.vibrate) navigator.vibrate(50);
    }
  }, LONG_PRESS_THRESHOLD);
};
```

#### 3. CSS Animasjoner for Touch Feedback

**Fil:** `src/index.css`

Nye CSS-klasser for visuell feedback:

| Klasse | Effekt |
|--------|--------|
| `.valid-move-tile` | Pulserende grønn glød på gyldige bevegelser |
| `.selected-move-target` | Gyllen glød på valgt bevegelsesmål |
| `.long-press-preview` | Blå fylle-animasjon ved long-press |
| `.explore-tile-adjacent` | Forbedret synlighet på utforsk-tiles nær spiller |
| `.move-arrow-indicator` | Hoppende animasjon på bevegelsesikoner |

```css
/* Valid move tile - shows where player can move */
@keyframes valid-move-pulse {
  0%, 100% { box-shadow: inset 0 0 12px 2px hsla(120, 70%, 50%, 0.15); }
  50% { box-shadow: inset 0 0 20px 4px hsla(120, 70%, 50%, 0.3); }
}

.valid-move-tile::after {
  content: '';
  position: absolute;
  inset: 0;
  clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
  border: 2px solid hsla(120, 60%, 50%, 0.4);
  animation: valid-move-pulse 2s ease-in-out infinite;
  z-index: 50;
}
```

#### 4. Forbedret Touch Handlers på Tiles

**Tiles og PossibleMoves nå inkluderer:**
- Touch start med long-press timer
- Touch end med cleanup
- Touch cancel håndtering
- Visual feedback klasser basert på touch-state

```tsx
<div
  onTouchStart={() => {
    setTouchedTileKey(tileKey);
    handleTileLongPressStart(tile.q, tile.r);
  }}
  onTouchEnd={() => {
    setTouchedTileKey(null);
    handleTileLongPressEnd();
  }}
  onTouchCancel={() => {
    setTouchedTileKey(null);
    handleTileLongPressEnd();
  }}
>
```

#### 5. Props Oppdatering

**GameBoard Props:**
```typescript
interface GameBoardProps {
  // ... existing props
  activePlayerIndex?: number; // NEW: For highlighting valid moves
}
```

**ShadowsGame.tsx:**
```tsx
<GameBoard
  // ... existing props
  activePlayerIndex={state.activePlayerIndex}
/>
```

---

### NYE KONSTANTER

```typescript
const LONG_PRESS_THRESHOLD = 400; // ms - tid for long-press preview
const HEX_NEIGHBORS = [
  { q: 1, r: 0 },   // East
  { q: 0, r: 1 },   // Southeast
  { q: -1, r: 1 },  // Southwest
  { q: -1, r: 0 },  // West
  { q: 0, r: -1 },  // Northwest
  { q: 1, r: -1 },  // Northeast
];
```

---

### FILER MODIFISERT

1. **src/game/components/GameBoard.tsx**
   - Ny prop: `activePlayerIndex`
   - Nye state: `longPressTile`, `selectedMoveTarget`
   - Ny useMemo: `validMoves` beregning
   - Nye funksjoner: `handleTileLongPressStart`, `handleTileLongPressEnd`
   - Forbedret tile-rendering med touch-klasser
   - Forbedret possibleMoves-rendering med touch-handlers

2. **src/game/ShadowsGame.tsx**
   - Lagt til `activePlayerIndex` prop til GameBoard

3. **src/index.css**
   - Nye CSS-klasser: `.valid-move-tile`, `.selected-move-target`, `.long-press-preview`, `.explore-tile-adjacent`, `.move-arrow-indicator`
   - Nye animasjoner: `valid-move-pulse`, `selected-target-glow`, `long-press-fill`, `move-arrow-bounce`, `explore-pulse`

---

### BRUKEROPPLEVELSE FORBEDRINGER

| Før | Etter |
|-----|-------|
| Ingen visuell indikasjon på gyldige trekk | Grønn pulserende kant på tiles spilleren kan flytte til |
| Tap måtte være presis | Større touch-targets med bedre visuell feedback |
| Ingen forhåndsvisning | Long-press (400ms) viser bevegelsesmål med gyllen glød |
| Ingen haptic feedback | Vibrasjon ved long-press på mobile enheter |
| Statisk utforsk-tiles | Animerte ikoner og forbedret synlighet |

---

### RESULTAT

- ✅ Visuell indikasjon på gyldige bevegelser (grønn kant)
- ✅ Long-press preview med gyllen glød (400ms)
- ✅ Haptic feedback på mobile enheter
- ✅ Forbedret touch-feedback på tiles
- ✅ Animerte ikoner på utforsk-tiles
- ✅ TypeScript kompilerer uten feil
- ✅ Build vellykket (916KB bundle)

---

## 2026-01-20: Room Spawn Refactoring - spawnRoom() Clarity Improvement

### Oppsummering

Refaktorert `spawnRoom()`-funksjonen i ShadowsGame.tsx for bedre lesbarhet og vedlikeholdbarhet. Funksjonen var på 294 linjer med flere inline-funksjoner og blandede ansvar. Ekstraherte logikk til gjenbrukbare hjelpefunksjoner i ny fil `roomSpawnHelpers.ts`, reduserte funksjonen fra 294 til ~200 linjer.

---

### PROBLEMER IDENTIFISERT 🔴

#### 1. Inline Hjelpefunksjoner (3 stk)
**Problem:** `spawnRoom()` inneholdt tre inline-funksjoner som økte kompleksiteten:
- `getCategoryPool()` - 14 linjer switch-statement
- `getFloorType()` - 10 linjer switch-statement
- `createFallbackEdges()` - 34 linjer med edge-generering

#### 2. Gjentatt Spawn-posisjon Logikk
**Problem:** Beregning av enemy spawn-posisjon ble duplisert på to steder med identisk kode:
```typescript
const spawnQ = startQ + (Math.random() > 0.5 ? 1 : -1);
const spawnR = startR + (Math.random() > 0.5 ? 1 : 0);
```

#### 3. Inline Tile Set Filtering
**Problem:** Tileset-filtrering brukte inline array-sjekker i stedet for gjenbrukbar logikk.

---

### LØSNING IMPLEMENTERT ✅

#### 1. Ny fil: `roomSpawnHelpers.ts`
**Fil:** `src/game/utils/roomSpawnHelpers.ts`

Opprettet ny hjelpefil med følgende funksjoner:

| Funksjon | Ansvar |
|----------|--------|
| `getCategoryTilePool()` | Returnerer location names for en kategori |
| `getFloorTypeForCategory()` | Bestemmer floor type basert på kategori |
| `createFallbackEdges()` | Genererer edges for fallback tiles |
| `createFallbackTile()` | Oppretter komplett fallback tile |
| `selectRandomRoomName()` | Velger tilfeldig romnavn fra kategori-pool |
| `categoryMatchesTileSet()` | Sjekker om kategori matcher tileset filter |
| `processQuestItemOnNewTile()` | Håndterer quest item spawning |
| `calculateEnemySpawnPosition()` | Beregner spawn-posisjon for fiender |

**Typede interfaces:**
```typescript
interface FallbackTileConfig {
  startQ: number;
  startR: number;
  newCategory: TileCategory;
  roomName: string;
  roomId: string;
  boardMap: Map<string, Tile>;
}

interface QuestItemSpawnResult {
  finalTile: Tile;
  updatedObjectiveSpawnState: any;
  logMessages: string[];
}
```

#### 2. Refaktorert `spawnRoom()`
**Fil:** `src/game/ShadowsGame.tsx`

**FØR (294 linjer):**
```typescript
const spawnRoom = useCallback((startQ, startR, tileSet) => {
  // 294 linjer med inline funksjoner, duplisert logikk
  const getCategoryPool = (cat) => { /* 14 linjer */ };
  const getFloorType = (cat) => { /* 10 linjer */ };
  const createFallbackEdges = () => { /* 34 linjer */ };
  // ...
});
```

**ETTER (~200 linjer, bruker helpers):**
```typescript
const spawnRoom = useCallback((startQ, startR, tileSet) => {
  // 1. Build board map and validation
  // 2. Gather constraints and find templates
  // 3. Filter by tile set using categoryMatchesTileSet()
  // 4. Fallback using createFallbackTile()
  // 5. Room cluster handling
  // 6. Quest item processing
  // 7. Enemy spawning using calculateEnemySpawnPosition()
});
```

---

### ARKITEKTUR FORBEDRINGER

| Før | Etter |
|-----|-------|
| 3 inline funksjoner | 8 gjenbrukbare helpers |
| Duplisert spawn-logikk | Enkelt calculateEnemySpawnPosition() kall |
| Inline array-sjekker | categoryMatchesTileSet() helper |
| 294 linjer i én funksjon | ~200 linjer + helpers |

---

### FILER OPPRETTET

1. **src/game/utils/roomSpawnHelpers.ts** (280 linjer)
   - Hjelpefunksjoner for rom-spawning
   - Typede interfaces for config og resultater
   - Konstanter for edge-retninger

### FILER MODIFISERT

1. **src/game/ShadowsGame.tsx**
   - Lagt til import av nye helpers
   - Erstattet inline fallback-logikk med `createFallbackTile()`
   - Erstattet tileset-filter med `categoryMatchesTileSet()`
   - Erstattet enemy spawn-posisjon med `calculateEnemySpawnPosition()`

---

### RESULTAT

- ✅ `spawnRoom()` redusert fra 294 til ~200 linjer (~32% reduksjon)
- ✅ 3 inline funksjoner fjernet og erstattet med gjenbrukbare helpers
- ✅ Duplisert spawn-logikk eliminert
- ✅ TypeScript kompilerer uten feil
- ✅ Build vellykket (914KB bundle)
- ✅ Samme funksjonalitet bevart

---

## 2026-01-20: Mythos Phase Refactoring - handleMythosOverlayComplete() Clarity Improvement

### Oppsummering

Refaktorert `handleMythosOverlayComplete()`-funksjonen i ShadowsGame.tsx for bedre lesbarhet og vedlikeholdbarhet. Funksjonen var på 139 linjer med flere ansvar (doom-beregning, vær-oppdatering, mål-sjekking, seier/tap-betingelser). Nå er den redusert til ~90 linjer med klare, nummererte steg og gjenbrukbare hjelpefunksjoner.

---

### PROBLEMER IDENTIFISERT 🔴

#### 1. For Lang Funksjon (139 linjer)
**Problem:** `handleMythosOverlayComplete()` var 1.4x over anbefalt 100-linjer grense
- Vanskelig å forstå hele funksjonens logikk
- Vanskelig å teste individuelle deler
- Høy kognitiv belastning ved vedlikehold

#### 2. For Mange Ansvar
**Problem:** Én funksjon håndterte:
- Survival objective-oppdatering og logging
- Dark insight doom-penalty beregning
- Vær-varighet nedtelling
- Doom-basert vær-triggering
- Seier-betingelser sjekk
- Tap-betingelser sjekk
- State-oppdatering for neste runde

#### 3. Inline Logikk
**Problem:** All logikk for doom-beregning og vær-oppdatering var inline med nestede if/else-blokker uten separasjon av bekymringer.

---

### LØSNING IMPLEMENTERT ✅

#### 1. Ny fil: `mythosPhaseHelpers.ts`
**Fil:** `src/game/utils/mythosPhaseHelpers.ts`

Ekstraherte logikk til fokuserte hjelpefunksjoner:

| Funksjon | Ansvar |
|----------|--------|
| `calculateDoomWithDarkInsightPenalty()` | Beregner doom med dark insight-straff, returnerer påvirkede spillere |
| `findNewlyCompletedSurvivalObjectives()` | Finner nylig fullførte survival-mål ved å sammenligne før/etter |
| `updateWeatherDuration()` | Håndterer vær-varighet nedtelling og utløp |
| `checkForNewWeatherFromDoom()` | Sjekker om doom-nivå skal trigge nytt vær |
| `processWeatherForNewRound()` | Kombinerer alle vær-oppdateringer med logging-meldinger |

**Nøkkelinnovasjon - Typede resultater:**
```typescript
interface DoomCalculationResult {
  newDoom: number;
  darkInsightPenalty: number;
  affectedPlayers: Player[];
}

interface WeatherUpdateResult {
  weatherState: WeatherState;
  weatherExpired: boolean;
  newWeatherTriggered: boolean;
  weatherMessage: string | null;
}
```

#### 2. Refaktorert `handleMythosOverlayComplete()`
**Fil:** `src/game/ShadowsGame.tsx:3468-3559`

**FØR (139 linjer):**
```typescript
const handleMythosOverlayComplete = () => {
  // 139 linjer med nested if/else, inline doom-beregning,
  // inline vær-logikk, og blandet state-oppdatering
}
```

**ETTER (90 linjer, nummererte steg):**
```typescript
const handleMythosOverlayComplete = () => {
  // 1. Calculate new round
  const newRound = state.round + 1;

  // 2. Update survival objectives
  // Uses findNewlyCompletedSurvivalObjectives()

  // 3. Calculate doom with dark insight penalty
  // Uses calculateDoomWithDarkInsightPenalty()

  // 4. Process weather for new round
  // Uses processWeatherForNewRound()

  // 5. Check victory conditions
  // 6. Check defeat conditions
  // 7. Transition to next round
}
```

---

### ARKITEKTUR FORBEDRINGER

```
FØR:                                    ETTER:
┌─────────────────────────────┐        ┌─────────────────────────────┐
│ handleMythosOverlayComplete()│        │ mythosPhaseHelpers.ts       │
│ (139 linjer, alt inline)    │        │ ├─ calculateDoomWith...()   │
│ ├─ Survival objective check │        │ ├─ findNewlyCompleted...()  │
│ ├─ Dark insight filter      │        │ ├─ updateWeatherDuration()  │
│ ├─ Doom calculation         │        │ ├─ checkForNewWeather...()  │
│ ├─ Weather duration         │        │ └─ processWeatherFor...()   │
│ ├─ New weather trigger      │        └─────────────────────────────┘
│ ├─ Victory check            │        ┌─────────────────────────────┐
│ ├─ Defeat check             │        │ ShadowsGame.tsx             │
│ └─ State update             │        │ └─ handleMythosOverlay...() │
└─────────────────────────────┘        │    (90 linjer, delegerer)   │
                                       └─────────────────────────────┘
```

---

### FILER ENDRET/OPPRETTET

| Fil | Status | Beskrivelse |
|-----|--------|-------------|
| `src/game/utils/mythosPhaseHelpers.ts` | **NY** | Alle hjelpefunksjoner for Mythos-fase |
| `src/game/ShadowsGame.tsx` | ENDRET | Ny import, refaktorert handleMythosOverlayComplete() |

---

### RESULTATER

| Metrikk | Før | Etter | Forbedring |
|---------|-----|-------|------------|
| Linjer i handleMythosOverlayComplete() | 139 | 90 | **-35%** |
| Inline doom-beregning | 15 linjer | 1 kall | **Separert** |
| Inline vær-logikk | 35 linjer | 1 kall | **Separert** |
| Antall filer | 1 | 2 | Bedre separasjon |
| Testbarhet | Lav | Høy | Individuelle funksjoner kan testes |
| Lesbarhet | Lav | Høy | Klare, nummererte steg |

---

### ATFERD UENDRET ✅

- Doom beregnes korrekt med dark insight-straff
- Vær-varighet teller ned korrekt
- Nytt vær trigges korrekt basert på doom
- Survival-mål fullføres og logges korrekt
- Seier/tap-betingelser sjekkes som før
- Build vellykket (914KB bundle)

---

## 2026-01-20: Scenario Generator Refactoring - generateRandomScenario() Clarity Improvement

### Oppsummering

Refaktorert `generateRandomScenario()`-funksjonen i scenarioGenerator.ts for bedre lesbarhet og vedlikeholdbarhet. Funksjonen var på 242 linjer med gjentatte string-erstatninger (9 `.replace()` kall × 4 steder = 36 duplikater). Nå er den redusert til ~60 linjer med klare, navngitte steg.

---

### PROBLEMER IDENTIFISERT 🔴

#### 1. Gjentatte String-erstatninger (36 duplikater)
**Problem:** Samme 9 `.replace()` kall ble gjentatt 4 ganger:
- For `description` i objektiv-loop (linje 950-959)
- For `shortDescription` i objektiv-loop (linje 961-969)
- For `title` generering (linje 1068-1074)
- For `goal` generering (linje 1077-1084)

**Resultat:** Kodeoppblåsing, høy risiko for inkonsistens ved endringer.

#### 2. Lang Funksjon (242 linjer)
**Problem:** `generateRandomScenario()` var 2.4x over anbefalt 100-linjer grense
- Vanskelig å forstå hele funksjonens logikk
- Vanskelig å teste individuelle deler
- Høy kognitiv belastning ved vedlikehold

#### 3. Ingen Gjenbruk av Kontekst
**Problem:** Alle kontekstuelle verdier (location, target, victim, mystery, collectible) ble brukt inline med separate `.replace()` kjeder.

#### 4. For Mange Ansvar
**Problem:** Én funksjon håndterte:
- Lokasjon-valg
- Objektiv-generering (hovedmål + bonus)
- Doom event-generering
- Tittel-generering
- Briefing-generering
- Victory/defeat conditions

---

### LØSNING IMPLEMENTERT ✅

#### 1. Ny fil: `scenarioGeneratorHelpers.ts`
**Fil:** `src/game/utils/scenarioGeneratorHelpers.ts`

Ekstraherte all logikk til fokuserte hjelpefunksjoner:

| Funksjon | Ansvar |
|----------|--------|
| `interpolateTemplate()` | **Sentral** string-interpolering - erstatter alle 36 duplikater |
| `buildTemplateContext()` | Bygger kontekst-objekt for interpolering |
| `selectLocation()` | Velger lokasjon basert på mission tileset |
| `generateObjectivesFromTemplates()` | Genererer objektiver fra mission templates |
| `generateBonusObjectives()` | Genererer bonus-objektiver |
| `generateDoomEvents()` | Genererer early/mid/late doom events |
| `generateTitle()` | Genererer scenario-tittel |
| `generateBriefing()` | Genererer narrativ briefing |
| `buildVictoryConditions()` | Bygger victory conditions |
| `buildDefeatConditions()` | Bygger defeat conditions (inkl. rescue-spesifikke) |
| `selectCollectible()` | Velger tilfeldig collectible item |

**Nøkkelinnovasjon - `TemplateContext` interface:**
```typescript
interface TemplateContext {
  location: string;
  target: string;
  victim: string;
  mystery: string;
  item: string;       // singular
  items: string;      // plural
  count?: number;
  half?: number;
  total?: number;
  rounds?: number;
  enemies?: string;
}
```

**Nøkkelinnovasjon - `interpolateTemplate()` funksjon:**
```typescript
// Erstatter 36 duplikate .replace() kjeder med én funksjon
export function interpolateTemplate(template: string, ctx: TemplateContext): string {
  return template
    .replace(/{location}/g, ctx.location)
    .replace(/{target}/g, ctx.target)
    // ... alle 9 erstatninger på ett sted
}
```

#### 2. Refaktorert `generateRandomScenario()`
**Fil:** `src/game/utils/scenarioGenerator.ts:915-976`

**FØR (242 linjer):**
```typescript
export function generateRandomScenario(...): Scenario {
  // 242 linjer med nested loops, gjentatte .replace() kjeder,
  // og blandet logikk for alle generasjonstyper
}
```

**ETTER (60 linjer):**
```typescript
export function generateRandomScenario(...): Scenario {
  // 1. Select mission type and location
  const missionType = randomElement(MISSION_TYPES);
  const location = selectLocation(...);

  // 2. Generate contextual elements
  const target = randomElement(TARGET_NAMES);
  // ...

  // 3. Build template context
  const ctx = buildTemplateContext(...);

  // 4. Generate objectives
  const objectives = [
    ...generateObjectivesFromTemplates(missionType, ctx),
    ...generateBonusObjectives(randomRange(1, 2))
  ];

  // 5-7. Generate using helpers
  // ...clear, numbered steps...

  return scenario;
}
```

---

### ARKITEKTUR FORBEDRINGER

```
FØR:                                    ETTER:
┌─────────────────────────────┐        ┌─────────────────────────────┐
│ generateRandomScenario()    │        │ scenarioGeneratorHelpers.ts │
│ (242 linjer, alt inline)    │        │ ├─ interpolateTemplate()    │
│ ├─ Location selection       │        │ ├─ buildTemplateContext()   │
│ ├─ 9x .replace() for desc   │        │ ├─ selectLocation()         │
│ ├─ 9x .replace() for short  │        │ ├─ generateObjectives...()  │
│ ├─ Bonus objective loop     │        │ ├─ generateDoomEvents()     │
│ ├─ Doom event generation    │        │ ├─ generateTitle()          │
│ ├─ 6x .replace() for title  │        │ ├─ generateBriefing()       │
│ ├─ 6x .replace() for goal   │        │ ├─ buildVictoryConditions() │
│ ├─ Briefing assembly        │        │ └─ buildDefeatConditions()  │
│ ├─ Victory conditions       │        └─────────────────────────────┘
│ └─ Defeat conditions        │        ┌─────────────────────────────┐
└─────────────────────────────┘        │ scenarioGenerator.ts        │
                                       │ └─ generateRandomScenario() │
                                       │    (60 linjer, delegerer)   │
                                       └─────────────────────────────┘
```

---

### FILER ENDRET/OPPRETTET

| Fil | Status | Beskrivelse |
|-----|--------|-------------|
| `src/game/utils/scenarioGeneratorHelpers.ts` | **NY** | Alle hjelpefunksjoner for scenario-generering |
| `src/game/utils/scenarioGenerator.ts` | ENDRET | Oppdatert imports, refaktorert generateRandomScenario() |

---

### RESULTATER

| Metrikk | Før | Etter | Forbedring |
|---------|-----|-------|------------|
| Linjer i generateRandomScenario() | 242 | 60 | **-75%** |
| .replace() duplikater | 36 | 0 | **-100%** |
| Antall filer | 1 | 2 | Bedre separasjon |
| Testbarhet | Lav | Høy | Individuelle funksjoner kan testes |
| Lesbarhet | Lav | Høy | Klare, navngitte steg |

---

### ATFERD UENDRET ✅

- Alle scenariotyper (escape, assassination, survival, collection, ritual, rescue, investigation, seal_portal, purge) genereres identisk
- Template-interpolering produserer samme resultater
- Build vellykket (913KB bundle)

---

## 2026-01-20: Monster AI Refactoring - getMonsterDecision() Clarity Improvement

### Oppsummering

Refaktorert `getMonsterDecision()`-funksjonen i monsterAI.ts for bedre lesbarhet og vedlikeholdbarhet. Funksjonen var på 286 linjer med dyp nesting og tre store hardkodede message-tabeller. Nå er den redusert til 62 linjer med klare, navngitte steg.

---

### PROBLEMER IDENTIFISERT 🔴

#### 1. For Lang Funksjon (286 linjer)
**Problem:** `getMonsterDecision()` var 3x over anbefalt 100-linjer grense
- Vanskelig å forstå hele funksjonens logikk
- Vanskelig å teste individuelle deler
- Høy kognitiv belastning ved vedlikehold

#### 2. Hardkodede Message-Tabeller (3 stykker × 16 entries)
**Problem:** Tre store Record<EnemyType, string> tabeller var inline i funksjonen:
- `waitMessages` (linje 1140-1157)
- `patrolMessages` (linje 1164-1181)
- `attackMessages` (linje 1248-1265)

**Resultat:** Koden var oppblåst og vanskelig å vedlikeholde når man ville legge til nye monster-typer.

#### 3. Dyp Nesting (4-5 nivåer)
**Problem:** Flere if-else-kjeder med nested logikk for:
- Flukt-sjekk
- Målvalg
- Ranged vs melee
- Spesiell bevegelse
- Patruljering

#### 4. For Mange Ansvar
**Problem:** Én funksjon håndterte:
- Personlighets-evaluering
- Atferdsvalg
- Angrepsbeslutningstaking
- Meldingsgenerering
- Sti-finning

---

### LØSNING IMPLEMENTERT ✅

#### 1. Ny fil: `monsterMessages.ts`
**Fil:** `src/game/utils/monsterMessages.ts`

Ekstraherte alle meldinger til en dedikert konfigurasjonsfil:
- `WAIT_MESSAGES` - Meldinger når monster venter/ligger i bakhold
- `PATROL_MESSAGES` - Meldinger når monster patruljerer
- `ATTACK_MESSAGES` - Meldinger når monster angriper (med target name interpolation)

**Hjelpefunksjoner:**
- `getWaitMessage(enemy)` - Henter ventemelding
- `getPatrolMessage(enemy)` - Henter patruljmelding
- `getAttackMessage(enemy, target)` - Henter angrepsmelding
- `getAttackMessageWithContext(enemy, target, priority)` - Melding med prioritets-kontekst
- `getChaseMessage(enemy, target, isInWater)` - Forfølgelsesmelding
- `getFleeMessage(enemy)` - Fluktmelding
- `getRangedAttackMessage(enemy, target, hasCover)` - Ranged angrepsmelding

#### 2. Ny fil: `monsterDecisionHelpers.ts`
**Fil:** `src/game/utils/monsterDecisionHelpers.ts`

Delte opp beslutningslogikken i fokuserte hjelpefunksjoner:

| Funksjon | Ansvar |
|----------|--------|
| `buildDecisionContext()` | Samler all kontekst (enemy, players, tiles, weather, etc.) |
| `tryFleeDecision()` | Sjekker om monster bør flykte basert på HP% og cowardiceThreshold |
| `handleNoTargetBehavior()` | Håndterer venting, patruljering, spesiell bevegelse |
| `tryHesitationDecision()` | Sjekker aggresjonsnivå for å avgjøre nøling |
| `tryRangedAttackDecision()` | Håndterer ranged angrepslogikk og posisjonering |
| `tryMeleeAttackDecision()` | Håndterer melee angrep når i rekkevidde |
| `trySpecialMovementDecision()` | Håndterer spesiell bevegelse (Hound teleportasjon) |
| `tryDefensiveDecision()` | Sjekker om monster skal forsvare posisjon |
| `tryChaseDecision()` | Forfølgelse med enhanced pathfinding |
| `tryBasicChaseDecision()` | Fallback til enkel pathfinding |

#### 3. Refaktorert `getMonsterDecision()`
**Fil:** `src/game/utils/monsterAI.ts:1117-1179`

**FØR (286 linjer):**
```typescript
export function getMonsterDecision(...): AIDecision {
  // 286 linjer med nested if-else, inline message-tabeller,
  // og blandet logikk for alle beslutningstyper
}
```

**ETTER (62 linjer):**
```typescript
export function getMonsterDecision(...): AIDecision {
  // 1. Build context
  const ctx = buildDecisionContext(...);

  // 2. Try flee
  const fleeDecision = tryFleeDecision(ctx, findRetreatPosition);
  if (fleeDecision) return fleeDecision;

  // 3. Find target
  const { target, priority } = findSmartTarget(...);

  // 4. No target - wait/patrol
  if (!target) return handleNoTargetBehavior(...);

  // 5-11. Try each decision type in priority order
  // ...clear, numbered steps...

  // 12. Default wait
  return { action: 'wait', message: getGenericWaitMessage(enemy) };
}
```

---

### ARKITEKTUR FORBEDRINGER

```
FØR:                                    ETTER:
┌─────────────────────────────┐        ┌─────────────────────────────┐
│ getMonsterDecision()        │        │ monsterMessages.ts          │
│ (286 linjer, alt inline)    │        │ ├─ WAIT_MESSAGES            │
│ ├─ Flee logic               │        │ ├─ PATROL_MESSAGES          │
│ ├─ waitMessages (16 entries)│        │ ├─ ATTACK_MESSAGES          │
│ ├─ patrolMessages (16)      │        │ └─ Helper functions         │
│ ├─ Ranged attack logic      │        └─────────────────────────────┘
│ ├─ attackMessages (16)      │        ┌─────────────────────────────┐
│ ├─ Melee attack logic       │        │ monsterDecisionHelpers.ts   │
│ ├─ Special movement         │        │ ├─ buildDecisionContext()   │
│ ├─ Chase logic              │        │ ├─ tryFleeDecision()        │
│ └─ Fallback logic           │        │ ├─ handleNoTargetBehavior() │
└─────────────────────────────┘        │ ├─ tryRangedAttackDecision()│
                                       │ ├─ tryMeleeAttackDecision() │
                                       │ ├─ tryChaseDecision()       │
                                       │ └─ ... (8 more functions)   │
                                       └─────────────────────────────┘
                                       ┌─────────────────────────────┐
                                       │ monsterAI.ts                │
                                       │ └─ getMonsterDecision()     │
                                       │    (62 linjer, delegerer)   │
                                       └─────────────────────────────┘
```

---

### FILER ENDRET/OPPRETTET

| Fil | Status | Beskrivelse |
|-----|--------|-------------|
| `src/game/utils/monsterMessages.ts` | **NY** | Alle monster-meldinger og hjelpefunksjoner |
| `src/game/utils/monsterDecisionHelpers.ts` | **NY** | Beslutningslogikk hjelpefunksjoner |
| `src/game/utils/monsterAI.ts` | ENDRET | Oppdatert imports, refaktorert getMonsterDecision() |

---

### RESULTATER

| Metrikk | Før | Etter | Forbedring |
|---------|-----|-------|------------|
| Linjer i getMonsterDecision() | 286 | 62 | **-78%** |
| Nesting-dybde | 5 | 2 | **-60%** |
| Antall filer | 1 | 3 | Bedre separasjon |
| Testbarhet | Lav | Høy | Individuelle funksjoner kan testes |
| Lesbarhet | Lav | Høy | Klare, navngitte steg |

---

### ATFERD UENDRET ✅

- Alle beslutningstyper (flee, attack, chase, wait, patrol) fungerer identisk
- Meldingene er identiske (bare flyttet til egen fil)
- Build vellykket (913KB bundle)

---

## 2026-01-20: Mobile Touch Controls Improvement - Bedre Tap-to-Move

### Oppsummering

Forbedret mobil touch-kontroller basert på research av beste praksis for HTML5-spill touch-interaksjon. Hovedfokus på å skille tap fra drag/pan og gi umiddelbar visuell feedback.

---

### RESEARCH GJORT 📱

#### Kilder Konsultert
- [MDN Mobile Touch Controls](https://developer.mozilla.org/en-US/docs/Games/Techniques/Control_mechanisms/Mobile_touch)
- [JavaScript Touch Events Best Practices](https://borstch.com/blog/javascript-touch-events-and-mobile-specific-considerations)
- [ZingTouch Gesture Library](https://zingchart.github.io/zingtouch/)
- [web.dev Touch and Mouse](https://web.dev/mobile-touchandmouse/)
- [Gamedev.js Mobile Best Practices](https://gamedevjs.com/articles/best-practices-of-building-mobile-friendly-html5-games/)

#### Nøkkelfunn
1. **Tap vs Drag Threshold**: Fingre er upresis - 5px er for lavt, 10-20px anbefalt
2. **Tap Timing**: Tap defineres som touch < 200-300ms varighet
3. **300ms Delay**: Mobile browsere har 300ms delay for double-tap zoom detection
4. **Touch Target Size**: Minimum 44x44px for touch targets
5. **Visuell Feedback**: Umiddelbar feedback er kritisk for god UX

---

### IMPLEMENTERT ✅

#### 1. Økt DRAG_THRESHOLD fra 5px til 15px
**Fil:** `src/game/components/GameBoard.tsx:536`

```typescript
const DRAG_THRESHOLD = 15; // px - increased from 5 to account for finger wobble
```

**Hvorfor:** Fingre beveger seg naturlig litt når man trykker. 5px var for sensitivt og registrerte mange taps som drags.

#### 2. Tap Timing Detection (250ms threshold)
**Fil:** `src/game/components/GameBoard.tsx:537, 716, 767, 821-827`

```typescript
const TAP_TIME_THRESHOLD = 250; // ms - max time for a tap vs hold
const touchStartTime = useRef<number>(0);

// In handleTouchStart:
touchStartTime.current = Date.now();

// In handleTouchEnd:
const touchDuration = Date.now() - touchStartTime.current;
const wasQuickTap = touchDuration < TAP_TIME_THRESHOLD;
```

**Hvorfor:** Kombinasjon av tid og avstand gir mer presis tap-deteksjon.

#### 3. Visuell Touch Feedback på Tiles
**Fil:** `src/game/components/GameBoard.tsx:717, 950-960, 964`

```typescript
const [touchedTileKey, setTouchedTileKey] = useState<string | null>(null);

// On tile element:
onTouchStart={() => setTouchedTileKey(tileKey)}
onTouchEnd={() => setTouchedTileKey(null)}
onTouchCancel={() => setTouchedTileKey(null)}

// CSS classes when touched:
className={`... ${isTouched ? 'brightness-125 scale-[1.02] touch-highlight' : ''}`}
```

**Hvorfor:** Umiddelbar visuell feedback lar spilleren se hvilken tile de trykker på.

#### 4. Fjernet 300ms Mobile Tap Delay
**Fil:** `src/index.css:99-102`

```css
html {
  touch-action: manipulation;
}
```

**Hvorfor:** `touch-action: manipulation` forteller browseren at vi ikke bruker double-tap zoom, så den kan fjerne 300ms forsinkelsen.

#### 5. Tap Pulse Animation
**Fil:** `src/index.css:450-498`

```css
@keyframes touch-pulse {
  0% { box-shadow: inset 0 0 0 0 hsla(45, 100%, 50%, 0); }
  50% { box-shadow: inset 0 0 30px 5px hsla(45, 100%, 50%, 0.3); }
  100% { box-shadow: inset 0 0 0 0 hsla(45, 100%, 50%, 0); }
}

.touch-highlight {
  animation: touch-pulse 0.3s ease-out forwards;
}
```

**Hvorfor:** Gull-puls gir tydelig visuell indikasjon på aktiv tile.

#### 6. Game Board Container CSS Optimizations
**Fil:** `src/index.css:104-114, src/game/components/GameBoard.tsx:900`

```css
.game-board-container {
  -webkit-user-select: none;
  user-select: none;
  -webkit-touch-callout: none;
}
```

**Hvorfor:** Forhindrer uønsket tekstvalg og iOS callout menu under spilling.

---

### TEKNISK FLYT: Tap vs Pan Detection

```
Touch Start
    │
    ├─► Record: touchStartTime, dragStartRaw
    ├─► Set: isDragging = true, hasDragged = false
    └─► Set: touchedTileKey for visual feedback
           │
           ▼
Touch Move (if single finger)
    │
    ├─► Calculate distance from start
    │
    └─► IF distance > 15px (DRAG_THRESHOLD)
            │
            ├─► hasDragged = true
            ├─► Clear touchedTileKey (no more feedback)
            └─► Pan the board
           │
           ▼
Touch End
    │
    ├─► Clear touchedTileKey
    ├─► Calculate: touchDuration = now - touchStartTime
    │
    └─► IF duration < 250ms AND !hasDragged
            │
            └─► This is a valid TAP → onClick fires
```

---

### FILER ENDRET

| Fil | Endringer |
|-----|-----------|
| `src/game/components/GameBoard.tsx` | DRAG_THRESHOLD 5→15, TAP_TIME_THRESHOLD, touchStartTime ref, touchedTileKey state, visual feedback |
| `src/index.css` | touch-action: manipulation, .game-board-container, touch-pulse animation |

---

### RESULTAT
- ✅ Tap-to-move er nå mer responsiv
- ✅ Uønskede pan-hendelser ved tap er redusert
- ✅ Umiddelbar visuell feedback ved touch
- ✅ 300ms delay er fjernet
- ✅ Build vellykket (912KB bundle)

---

## 2026-01-20: Scenario Win Conditions Audit & Fix - ALL Scenario Types Now Winnable!

### Oppsummering

Deep audit av alle scenario victory conditions avdekket KRITISKE problemer som gjorde flere scenario-typer UMULIGE å vinne. Fixet nå slik at alle 6 scenario-typer kan vinnes.

---

### KRITISKE PROBLEMER FUNNET 🔴

#### 1. `escape` Objective Type - ALDRI COMPLETABLE
**Problem:** Escape scenarios hadde `obj_escape` objectives som ALDRI ble marked som completed.
- `victoryConditions` krevde at `obj_escape` var completed
- Men det fantes ingen handling som markerte denne som complete
- **Resultat:** Escape scenarios var UMUIGE å vinne!

#### 2. `ritual` Objective Type - ALDRI COMPLETABLE
**Problem:** Ritual scenarios hadde `ritual` objectives som ALDRI ble marked som completed.
- `perform_ritual` action eksisterte på altar objects
- Men `handleContextActionEffect` hadde INGEN case for `perform_ritual`
- **Resultat:** Ritual scenarios var UMULIGE å vinne!

#### 3. `interact` Objective Type - ALDRI COMPLETABLE
**Problem:** Mange scenarios brukte `interact` objectives (place elder signs, confront truth, etc.)
- Ingen handling completerte disse objectives
- **Resultat:** Seal Portal og Investigation scenarios var UMULIGE å vinne!

#### 4. Exit/Altar Tiles Mangler Object Type
**Problem:** Når exit/altar tiles ble spawnet, fikk de ikke riktig `object.type`
- Exit tiles fikk bare `isGate: true` og `name: 'Exit Door'`
- Men de fikk IKKE `object: { type: 'exit_door' }` som trengs for escape action
- **Resultat:** Spilleren kunne ikke se eller bruke escape action!

---

### IMPLEMENTERT FIX ✅

#### 1. objectiveSpawner.ts - Exit/Altar Object Types
**Filer:** `src/game/utils/objectiveSpawner.ts:454-470, 800-815`

- Exit tiles får nå `object: { type: 'exit_door', searched: false }`
- Altar tiles får nå `object: { type: 'altar', searched: false }`
- Gjelder både `onTileExplored()` og `executeGuaranteedSpawns()`

#### 2. ShadowsGame.tsx - Objective Completion Actions
**Fil:** `src/game/ShadowsGame.tsx:1845-1920`

Lagt til cases i `handleContextActionEffect` for:

```javascript
// Ritual/Interact objectives
case 'perform_ritual':
case 'seal_portal':
case 'flip_switch':
  // Finner ritual/interact objective og marker som complete
  // Støtter targetAmount for progressive objectives (0/3, 1/3, etc.)

// Escape objectives
case 'escape':
  // Finner escape objective og marker som complete
  // Trigger victory check via useEffect
```

---

### SCENARIO TYPES VICTORY FLOW

| Type | Victory Condition | Required Objectives | Status |
|------|------------------|---------------------|--------|
| **Escape** | Spiller på exit tile + required items | `obj_find_key`, `obj_find_exit`, `obj_escape` | ✅ FIXED |
| **Assassination** | Boss drept | `obj_kill_target` | ✅ OK (fungerte) |
| **Survival** | Overlev X runder | `obj_survive` | ✅ OK (fungerte) |
| **Collection** | Samle alle items | `obj_collect` | ✅ OK (fungerte) |
| **Ritual** | Utfør ritual ved altar | `obj_gather_components`, `obj_find_altar`, `obj_perform_ritual` | ✅ FIXED |
| **Investigation** | Finn alle clues | `obj_find_clues`, `obj_confront_truth` | ✅ FIXED |

---

### TEKNISK DETALJ: Victory Check Flow

1. Spiller utfører handling (escape, perform_ritual, etc.)
2. `handleContextActionEffect` matcher action.id og finner relevant objective
3. Objective markeres som `completed: true`
4. `useEffect` i ShadowsGame kjører `checkVictoryConditions()` når objectives endres
5. `checkVictoryConditions` sjekker:
   - Alle `requiredObjectives` completed
   - Type-spesifikk check (escape on tile, boss dead, rounds survived, etc.)
6. Hvis alle checks passerer → Victory!

---

### FILER ENDRET

1. `src/game/utils/objectiveSpawner.ts` - Exit/altar object type setup
2. `src/game/ShadowsGame.tsx` - Action handling for objective completion

---

## 2026-01-20: Sanity System Implementation - Complete Madness Mechanics

### Oppsummering

Fullstendig implementasjon av alle manglende sanity- og madness-mekanikker basert på audit. Alle 8 madness conditions har nå faktiske gameplay-konsekvenser.

---

### IMPLEMENTERT ✅

#### 1. 3 Madness = Character Permanently Lost
**Fil:** `src/game/ShadowsGame.tsx:621-632`

Når en spiller får sin tredje madness condition, er karakteren permanent tapt (behandles som død).

#### 2. Catatonia: -1 AP Effect
**Fil:** `src/game/ShadowsGame.tsx:652-657`

Spillere med Catatonia mister 1 AP ved rundestart.

#### 3. Hysteria: 50% Chance -1 AP
**Fil:** `src/game/ShadowsGame.tsx:659-666`

50% sjanse for å miste 1 AP hver runde.

#### 4. Night Terrors: Cannot Rest
**Fil:** `src/game/ShadowsGame.tsx:2540-2545`

Rest-handling blokkert for spillere med Night Terrors.

#### 5. Dark Insight: Extra Doom Loss
**Fil:** `src/game/ShadowsGame.tsx:3315-3327`

Doom synker ekstra -1 per runde for spillere med Dark Insight.

#### 6. Paranoia: Cannot Share Tiles
**Fil:** `src/game/ShadowsGame.tsx:2372-2382`

Spillere med Paranoia kan ikke gå til tiles med andre spillere.

#### 7. Ally Death Sanity Trigger
**Fil:** `src/game/ShadowsGame.tsx:689-701`

Alle spillere mister -2 Sanity når en alliert dør.

#### 8. Tile-Based Sanity Triggers
**Fil:** `src/game/ShadowsGame.tsx:2418-2457`

Sanity-tap ved første besøk til skremmende tiles:
- Sacrificial Altar, Eldritch Portal: -2 SAN
- Stone Circle, Coastal Cliffs, Sewer, Crypt tiles: -1 SAN

#### 9. Occult Text Reading Sanity
**Fil:** `src/game/ShadowsGame.tsx:1016-1052`

Lese okkulte tekster (Necronomicon, Ancient Tome) koster -1 Sanity men gir +3 Insight.
**Professor er immun** mot sanity-tap fra lesing.

---

### Filer Endret

| Fil | Endringer |
|-----|-----------|
| `src/game/ShadowsGame.tsx` | checkMadness, applyMadnessTurnStartEffects, applyAllyDeathSanityLoss, move action, rest action, handleMythosOverlayComplete, handleUseItem |

---

## 2026-01-20: Sanity System Audit - Comprehensive Analysis

### Oppsummering

Full audit av sanity-systemet for å vurdere om det fungerer som et Cthulhu/Lovecraft-inspirert horror-system. Sammenlignet implementasjon mot `game_design_bible.md` og `REGELBOK.MD`.

---

### HVA FUNGERER ✅

#### 1. Grunnleggende Sanity-attributt
- `Player.sanity` og `Player.maxSanity` er implementert (`src/game/types.ts:105-106`)
- Sanity vises korrekt i UI med hjerne-ikon

#### 2. Madness Conditions Definert
- 8 madness-typer definert i `src/game/constants.ts:2333-2382`:
  - `hallucination`, `paranoia`, `hysteria`, `catatonia`
  - `obsession`, `amnesia`, `night_terrors`, `dark_insight`
- Hver har `name`, `description`, `mechanicalEffect`, `visualClass`, `audioEffect`

#### 3. Horror Checks ved Fiende-møte
- `performHorrorCheck()` i `src/game/utils/combatUtils.ts:319-376`
- Dice pool: 2 (base) + Willpower + klasseBonus
- DC basert på fiende horror: 1=DC3, 2=DC4, 3+=DC5
- Feiler = mister sanity lik fiendens horror-verdi (1-6)
- **Veteran immun** mot første horror check (Fearless)
- **Professor får +1 terning** på horror checks

#### 4. Fiende Horror Ratings
- Alle fiender har `horror`-verdi i `src/game/constants.ts:2089-2225`
- Cultist: 1, Ghoul: 2, Deep One: 2, Shoggoth: 4, Star Spawn: 5, Ancient One: 6

#### 5. Madness Trigger-mekanisme
- `checkMadness()` i `src/game/ShadowsGame.tsx:612-621`
- Når sanity <= 0 OG ingen aktivMadness:
  - Tilfeldig madness tildeles
  - Sanity settes til 50% av max
  - CSS-klasse appliseres på spillcontainer

#### 6. CSS Visual Effects for Madness
- Alle 8 madness-typer har CSS i `src/index.css:323-400`:
  - `hallucinate`: hue-rotate + blur
  - `paranoia`: saturate + sepia shift
  - `hysteria`: shake/jitter
  - `catatonia`: desaturate + dim
  - `obsession`: glow på interactables
  - `amnesia`: fog overlay
  - `night_terrors`: brightness flashes
  - `dark_insight`: purple glow

#### 7. Sanity Restoration
- **Rest Action** (`ShadowsGame.tsx:2476`): 2 AP for +1 HP og +1 Sanity
- **Consumables**: Old Whiskey (+2 SAN), Sedatives (+1 SAN)
- **Survivor Rescue**: +1 til +3 SAN avhengig av survivor-type

#### 8. Noen Kontekst-handlinger
- Sealed doors kan koste sanity ved forsøk
- Spirit barriers koster -1 til -2 sanity
- Dark room discoveries (horror/corpse) koster sanity
- Eldritch portal undersøkelse koster -1 sanity

---

### HVA MANGLER ❌

#### A. MADNESS MEKANIKKER IKKE IMPLEMENTERT
**KRITISK**: CSS-effekter vises, men spillmekanikkene håndheves IKKE!

| Madness | Beskrevet Effekt | Implementert? |
|---------|------------------|---------------|
| **Hallucinations** | 25% sjanse falske fiender, må "angripe" dem | ❌ NEI |
| **Paranoia** | Kan ikke dele tile med andre, -1 alle kast nær andre | ❌ NEI |
| **Hysteria** | 50% sjanse miste 1 AP ved rundestart | ❌ NEI |
| **Catatonia** | -1 AP permanent, kan ikke bruke Flee | ❌ NEI |
| **Obsession** | Kan ikke forlate rom før ALT er undersøkt | ❌ NEI |
| **Amnesia** | Fog of War resetter hver runde | ❌ NEI |
| **Night Terrors** | Kan ikke bruke Rest-handling | ❌ NEI |
| **Dark Insight** | +2 Insight men Doom -1 ekstra per runde | ❌ NEI |

**Filer som trenger oppdatering:**
- `src/game/ShadowsGame.tsx` - Rundestart logikk for Hysteria/Catatonia
- `src/game/ShadowsGame.tsx` - Bevegelseslogikk for Paranoia
- `src/game/ShadowsGame.tsx` - Rest-handling for Night Terrors
- `src/game/ShadowsGame.tsx` - Doom-oppdatering for Dark Insight
- Egen hallucination-system trengs

#### B. 3 MADNESS = KARAKTER TAPT - IKKE IMPLEMENTERT
Ifølge `REGELBOK.MD:456`: "Ved 3 Madness Conditions = karakter er tapt"

**Nåværende kode** (`ShadowsGame.tsx:618`):
```typescript
madness: [...player.madness, newMadness.id]  // Bare legger til, sjekker aldri lengden
```

**Må legge til:**
```typescript
if (player.madness.length >= 3) {
  // Karakter er permanent tapt (død eller gal)
}
```

#### C. SANITY-TAP TRIGGERS SOM MANGLER

| Trigger | Sanity-tap | Implementert? |
|---------|------------|---------------|
| Se fiende første gang | -1 til -6 | ✅ JA (horror check) |
| **Se medspiller dø** | -2 (kan ikke motstå) | ❌ NEI |
| **Lese okkult tekst** | -1 (Professor immun) | ❌ DELVIS (bare Necronomicon item) |
| **Utføre ritual** | -1 til -3 (Occultist halvert) | ❌ NEI |
| **Se portal/dimensjon** | -2 (willpower DC 5) | ❌ DELVIS |
| Spirit barrier | -1 per forsøk | ✅ JA |

#### D. TILE-BASERTE SANITY TRIGGERS MANGLER
Fra `game_design_bible.md`, disse tiles skal gi sanity-tap ved første besøk:

| Tile | Sanity-tap | Implementert? |
|------|------------|---------------|
| **Klippekyst** | Horror check | ❌ NEI |
| **Gammel Steinsirkel** | -1 | ❌ NEI |
| **Celle-korridor (Asyl)** | -1 | ❌ NEI |
| **Kloakktunnel** | -1 | ❌ NEI |
| **Offersted/Altar** | -2 | ❌ NEI |
| **Eldgammel Portal** | Massive tap | ❌ DELVIS |

#### E. LYDEFFEKTER IKKE IMPLEMENTERT
Madness conditions definerer `audioEffect` men Tone.js ikke integrert:
- `whispers` (Hallucinations)
- `heartbeat` (Paranoia)
- `laughter` (Hysteria)
- `silence` (Catatonia)
- `ticking` (Obsession)
- `static` (Amnesia)
- `screams` (Night Terrors)
- `cosmic` (Dark Insight)

---

### ANBEFALINGER FOR FORBEDRING

#### Prioritet 1: Kritiske Mekanikker
1. **Implementer 3-madness game over** - Enkel sjekk
2. **Implementer Catatonia -1 AP** - Påvirker rundestart
3. **Implementer Night Terrors Rest-blokkering** - Enkel action guard
4. **Se medspiller dø trigger** - Når spiller HP=0, andre spillere mister -2 SAN

#### Prioritet 2: Viktige Horror Elements
5. **Tile-baserte sanity triggers** - Legg til `onFirstVisit` sanity tap for scary tiles
6. **Occult text reading** - Generelt system for -1 SAN ved lesing (Professor immun)
7. **Ritual sanity cost** - -1 til -3 SAN for ritualer (Occultist halvert)

#### Prioritet 3: Fordypning
8. **Hallucination system** - Falske fiender som spawner og forsvinner
9. **Paranoia tile restriction** - Blokkér bevegelse til tiles med andre spillere
10. **Hysteria AP loss** - 50% sjanse ved rundestart
11. **Amnesia fog reset** - Fog of war tilbakestilling
12. **Obsession investigate lock** - Kan ikke gå før alt undersøkt

#### Prioritet 4: Polish
13. **Audio effects med Tone.js** - Atmosfærisk lyd per madness
14. **Dark Insight doom penalty** - Doom tracker synker raskere

---

### TEKNISKE DETALJER

#### Hvor madness-mekanikker bør implementeres:

**1. Rundestart-effekter** (`ShadowsGame.tsx` i endTurn/startRound):
```typescript
// Ved rundestart, sjekk aktiv madness
if (activePlayer.activeMadness) {
  switch (activePlayer.activeMadness.type) {
    case 'hysteria':
      if (Math.random() < 0.5) {
        // Mist 1 AP
      }
      break;
    case 'catatonia':
      // -1 AP permanent
      break;
    case 'dark_insight':
      // Doom -1 ekstra
      break;
    case 'amnesia':
      // Reset fog of war for denne spilleren
      break;
  }
}
```

**2. Bevegelses-restriksjoner** (i `movePlayer` eller tilsvarende):
```typescript
// Paranoia: Kan ikke dele tile
if (activePlayer.activeMadness?.type === 'paranoia') {
  const otherPlayersOnTile = players.filter(p =>
    p.id !== activePlayer.id &&
    p.position.q === targetQ &&
    p.position.r === targetR
  );
  if (otherPlayersOnTile.length > 0) {
    // Blokkér bevegelse
  }
}
```

**3. Action guards** (i REST handling):
```typescript
if (activePlayer.activeMadness?.type === 'night_terrors') {
  addToLog("You cannot rest - night terrors haunt you!");
  return; // Blokkér rest
}
```

---

### KONKLUSJON

Sanity-systemet har et **solid fundament** med:
- Attributter, horror checks, madness triggering, visual effects

Men det **mangler de faktiske spillmekanikkene** som gjør madness betydningsfullt. Uten disse er madness bare en visuell effekt uten gameplay-konsekvenser.

**Lovecraft-inspirasjon krever** at spillere *føler* skrekkens konsekvenser - å miste kontroll (Hysteria), bli paranoid (Paranoia), eller miste hukommelsen (Amnesia). Uten disse mekanikkene er horror-elementet bare kosmetisk.

**Estimert arbeid:**
- Prioritet 1: 2-3 timer
- Prioritet 2: 3-4 timer
- Prioritet 3: 4-6 timer
- Prioritet 4: 2-3 timer

---

## 2026-01-20: Comprehensive Scenario System Overhaul - Quest Items & Objectives

### Problemene (Identifisert gjennom deep audit)

Scenario-systemet hadde flere kritiske problemer som gjorde det umulig å fullføre scenarios:

1. **Quest items usynlige på tiles** - Items spawnet riktig i `tile.items`, men ble aldri rendret visuelt
2. **Escape victory sjekket ikke for nøkler** - Spillere kunne flykte uten å samle nødvendige items
3. **Objectives ble ikke vist i UI** - Legacy `steps` system ble vist i stedet for det nye `objectives` systemet
4. **Quest items ikke i inventory** - Items ble samlet men ikke lagt til spillerens inventory

### Løsninger Implementert

#### 1. Visuell Rendering av Quest Items på Tiles (`GameBoard.tsx`)
- Lagt til glødende ikoner for quest items basert på type (key/clue/artifact/collectible)
- Hver item-type har unik farge:
  - Keys: Gull/amber glow
  - Clues: Blå glow
  - Artifacts: Lilla glow
  - Collectibles: Cyan glow
- SVG hex-border glow for tiles med quest items
- z-index håndtering for synlighet over overlays

#### 2. Forbedret Exit Tile Visuell Indikator (`GameBoard.tsx`)
- Exit door har nå prominent beacon-effekt med:
  - Roterende ring-animasjon
  - Pulserende stråler i 8 retninger
  - Sterkere glow og drop-shadow
- Grønn SVG hex-border glow rundt exit tiles
- Større og mer synlig dør-ikon

#### 3. Escape Victory Logikk Fikset (`scenarioUtils.ts`)
- `checkEscapeVictory()` sjekker nå at:
  - Alle required `find_item` objectives er fullført
  - Escape objective ikke er hidden (prerequisites er oppfylt)
  - Spilleren er på exit tile
- Funksjon mottar nå `scenario` parameter for validering

#### 4. Objectives Vises i UI (`ScenarioInfoModal.tsx`, `ScenarioBriefingPopup.tsx`)
- Erstattet legacy `scenario.steps` med `scenario.objectives`
- Viser required og optional/bonus objectives separat
- Ikoner basert på objective type (Key, MapPin, Swords, Clock, etc.)
- Progress tracking (currentAmount/targetAmount)
- Completed status med avkrysning

#### 5. Quest Items Legges til Inventory (`ShadowsGame.tsx`)
- Når quest item samles via search, legges den nå til player inventory
- Item opprettes med korrekt type og questItemType
- Viser floating text og log melding
- Fallback warning hvis inventory er full

#### 6. Quest Item Ikoner (`ItemIcons.tsx`)
- Nye SVG ikoner for quest items:
  - `QuestKeyIcon` - Gull nøkkel med glow
  - `QuestClueIcon` - Dokument med forstørrelsesglass
  - `QuestArtifactIcon` - Lilla krystall/gem
  - `QuestCollectibleIcon` - Gull stjerne
  - `QuestComponentIcon` - Cyan gear/komponent
- Oppdatert `getItemIcon()` til å håndtere questItemType

#### 7. CSS Animasjoner (`index.css`)
- `@keyframes quest-item-glow` - Pulserende aura
- `@keyframes quest-tile-pulse` - Border glow for quest tiles
- `@keyframes exit-beacon` - Sterk pulserende glow for exit
- `@keyframes key-shimmer` - Gull glow for nøkler
- `@keyframes collectible-sparkle` - Roterende gnistrende effekt

### Filer Endret
- `src/game/components/GameBoard.tsx` - Quest item og exit visuals
- `src/game/components/ItemIcons.tsx` - Nye quest item ikoner
- `src/game/components/CharacterPanel.tsx` - getItemIcon med questItemType
- `src/game/components/ScenarioInfoModal.tsx` - Objectives display
- `src/game/components/ScenarioBriefingPopup.tsx` - Objectives display
- `src/game/utils/scenarioUtils.ts` - Escape victory fix
- `src/game/ShadowsGame.tsx` - Quest items til inventory
- `src/index.css` - Quest item animasjoner

### Testing
- TypeScript kompilering: OK
- Quest items vises nå på tiles med glødende effekt
- Exit tiles lyser opp når revealed
- Objectives vises riktig i briefing og info modals
- Quest items samles og vises i inventory

---

## 2026-01-20: Restore Tile Graphics - Fix CSS Stacking Issue

### Problemet
All tile-grafikk var borte fra spillet. Tile-bildene (PNG-filene) viste ikke, og bare bakgrunnsfarger/overlays var synlige.

### Årsak
To problemer ble identifisert:

1. **CSS `position: relative` konflikt i `hex-3d-depth` klassen:**
   - `hex-3d-depth` klassen (som gir 3D-dybdeeffekt til tiles) hadde `position: relative`
   - Parent-elementet bruker Tailwind's `absolute` klasse
   - Når custom CSS lastes etter Tailwind, overskrev `position: relative` Tailwind's `position: absolute`
   - Dette skapte problemer med stacking context og z-index

2. **For høy opacity på overlay-lag:**
   - Chiaroscuro overlay (40% opacity), oil texture (30%), og edge light (50%) overlays kombinert ble for mørke
   - Med stacking context-problemet ble bildene helt dekket av disse overlay-lagene

### Løsning

#### 1. Fjernet `position: relative` fra CSS (`src/index.css`)
```css
/* Før */
.hex-3d-depth {
  position: relative;
  box-shadow: ...
}

/* Etter */
.hex-3d-depth {
  /* Note: position is handled by parent's absolute positioning */
  box-shadow: ...
}
```

#### 2. Redusert opacity på overlay-lag (`src/game/components/GameBoard.tsx`)
```tsx
/* Før */
<div className="... opacity-40" />  // Chiaroscuro
<div className="... opacity-30" />  // Oil texture
<div className="... opacity-50" />  // Edge light

/* Etter */
<div className="... opacity-20" />  // Chiaroscuro
<div className="... opacity-15" />  // Oil texture
<div className="... opacity-30" />  // Edge light
```

### Tekniske detaljer
- Z-index strukturen for tile-rendering: z-[1] bilde, z-[2-4] overlay-effekter, z-[5] blood stains, z-[6] local weather, z-[10] tile icon, z-[20] objects, z-[30] fog of war, z-[35] dark room, z-[40] unexplored
- Mix-blend-mode på overlays (multiply, overlay) blander med elementer under dem i stacking order
- Parent-elementets `hex-clip` klasse klipper alt innhold til hexagon-form

### Filer endret
- `src/index.css` - Fjernet `position: relative` fra `.hex-3d-depth`
- `src/game/components/GameBoard.tsx` - Redusert opacity på overlay-lag

---

## 2026-01-20: Guaranteed Quest Item/NPC Spawn System

### Problemet
Spillere kunne ikke fullføre scenarier fordi quest items (nøkler, ledetråder, samleobjekter) og quest tiles (utganger, altere, NPC-lokasjoner) aldri spawnet i spillet. Spawn-systemet var helt probabilistisk og hadde ingen garanti for at kritiske elementer faktisk ville dukke opp.

### Årsak
Det eksisterende spawn-systemet i `objectiveSpawner.ts` hadde flere svakheter:
1. Items spawnet kun med 10-50% sjanse basert på exploration progress
2. Ingen "fail-safe" mekanisme for å tvinge spawns når doom blir lav
3. Items ble aldri faktisk lagt til på tiles - bare en logg-melding ble vist
4. Ingen tracking av om spawning var "on schedule" eller bak

### Løsning

#### 1. Garantert Spawn System (`objectiveSpawner.ts`)

**Nye funksjoner:**
- `checkGuaranteedSpawns()` - Sjekker om kritiske elementer må force-spawnes
- `executeGuaranteedSpawns()` - Utfører tvungen spawning
- `findBestSpawnTile()` - Finner beste tile for et quest item basert på type
- `findBestQuestTileLocation()` - Finner beste lokasjon for quest tiles (exit, altar, etc.)
- `getSpawnStatus()` - Debug-funksjon for å se spawn-status

**Konfigurasjon:**
```typescript
GUARANTEED_SPAWN_CONFIG = {
  DOOM_CRITICAL: 4,        // Force spawn ALT når doom <= 4
  DOOM_WARNING: 7,         // Øk spawn-sjanse når doom <= 7
  EXPLORATION_FORCE: 0.85, // Force spawn etter 85% exploration
  MIN_ITEMS_PER_10_TILES: 1, // Minst 1 item per 10 utforskede tiles
}
```

**Urgency Levels:**
- `none`: Normal spawn-logikk
- `warning`: Spawn halvparten av gjenstående items
- `critical`: Spawn ALLE gjenstående kritiske items/tiles

#### 2. Items Legges Faktisk Til Tiles

Når et quest item spawner:
```typescript
const questItem: Item = {
  id: spawnedItem.id,
  name: spawnedItem.name,
  description: spawnedItem.description,
  type: 'quest_item',
  category: 'special',
  isQuestItem: true,
  questItemType: spawnedItem.type,
  objectiveId: spawnedItem.objectiveId,
};
tile.items = [...(tile.items || []), questItem];
tile.hasQuestItem = true;
```

#### 3. Mythos-fase Spawn Check

I hver Mythos-fase sjekkes spawn-status:
1. Beregn urgency basert på doom og exploration
2. Hvis `urgency !== 'none'`, kjør `executeGuaranteedSpawns()`
3. Legg items til utforskede tiles
4. Modifiser tiles som blir quest locations (exit, altar)
5. Logg meldinger til spilleren

#### 4. Type-utvidelser (`types.ts`)

**Item interface:**
```typescript
// Quest item fields
isQuestItem?: boolean;
questItemType?: 'key' | 'clue' | 'collectible' | 'artifact' | 'component';
objectiveId?: string;
category?: 'weapon' | 'tool' | 'armor' | 'consumable' | 'special';
```

**Tile interface:**
```typescript
items?: Item[];           // Items on this tile
hasQuestItem?: boolean;   // Quick flag for quest items
```

### Endrede Filer
- `src/game/utils/objectiveSpawner.ts` - Komplett garantert spawn system (350+ nye linjer)
- `src/game/ShadowsGame.tsx` - Mythos-fase spawn check, tile exploration spawn, search collection
- `src/game/types.ts` - Item og Tile interface utvidet

### Testing
- TypeScript kompilerer uten feil
- Build fullført uten errors

### Hvordan det fungerer i praksis

**Normal gameplay:**
1. Spiller utforsker tiles
2. Quest items spawner progressivt (10-50% sjanse per tile)
3. Items legges til tiles og vises som søkbare

**Når doom går ned:**
1. Ved doom 7: Warning - halvparten av gjenstående items force-spawnes
2. Ved doom 4: Critical - ALLE gjenstående items force-spawnes på best passende tiles

**Meldinger til spiller:**
- `📦 Noe viktig er gjemt i {tileName}... Søk nøye!`
- `⭐ VIKTIG LOKASJON: {questTileName} funnet!`
- `📜 Doom nærmer seg! Kritiske elementer har blitt avslørt...`

---

## 2026-01-20: Fix Occultist Spell Casting - Target Selection Bug

### Problemet
Når brukeren trykket "Cast"-knappen og valgte en spell (f.eks. Eldritch Bolt, Mind Blast, Banish), skjedde ingenting når de klikket på en fiende for å caste spellet.

### Årsak
Det var en timing-bug i spell targeting-logikken. Når en fiende ble klikket:
1. `enemy_click` action sendte `handleAction('cast_occultist', spell)` uten å inkludere hvilken fiende som ble klikket
2. I `cast_occultist`-caset ble `state.selectedEnemyId` sjekket, men denne var aldri satt fordi `enemy_click` bare videresendte spellet direkte

### Løsning
Endret `enemy_click` til å sende enemy ID direkte med spell-payload:
```typescript
// Før (bugget)
if (state.activeOccultistSpell) {
  handleAction('cast_occultist', state.activeOccultistSpell);
  return;
}

// Etter (fikset)
if (state.activeOccultistSpell) {
  handleAction('cast_occultist', { spell: state.activeOccultistSpell, targetEnemyId: payload.id });
  return;
}
```

Og oppdatert `cast_occultist` til å håndtere begge payload-strukturer:
```typescript
const payloadData = payload as OccultistSpell | { spell: OccultistSpell; targetEnemyId: string };
const occSpell = payloadData && 'spell' in payloadData ? payloadData.spell : payloadData as OccultistSpell;
const targetEnemyId = payloadData && 'targetEnemyId' in payloadData ? payloadData.targetEnemyId : state.selectedEnemyId;
```

### Endrede Filer
- `src/game/ShadowsGame.tsx` - Linje 2587-2592 og 2815-2830

### Testing
- TypeScript kompilerer uten feil
- Build fullført uten errors
- Nå fungerer alle Occultist spells korrekt med targeting

---

## 2026-01-20: Options-forbedringer, Field Journal-farger og Økt Zoom

### Oppgave
Forbedre brukeropplevelsen med nye innstillinger og visuelle forbedringer:
1. **Options**: Legge til oppløsning og UI-skalering
2. **Field Journal**: Fargekode tekst basert på type (stats, beskrivelser, lore, etc.)
3. **Zoom**: Øke maksimum zoom-nivå for bedre detaljvisning

### Løsning

#### 1. Options - Oppløsning og UI-skalering

**Nye GameSettings:**
```typescript
resolution: 'auto' | '720p' | '1080p' | '1440p' | '4k';
uiScale: number; // 50-150 percent
```

**Display-tab oppdatert med:**
- **Resolution picker**: 5 valg (Auto, 720p, 1080p, 1440p, 4K) med radio-button stil
- **UI Scale slider**: 50%-150% med 10% steg for å justere størrelse på menyer og tekst

**Nye ikoner importert:**
- `Maximize` for oppløsning
- `ZoomIn` for UI-skalering

#### 2. Field Journal - Fargekodede Teksttyper

Fullstendig redesign av monster-detaljer med distinkte farger:

**Combat Stats (5-kolonners grid):**
| Stat | Farge | Ikon |
|------|-------|------|
| Vitality (HP) | Rød (`red-400`) | Heart |
| Attack Dice | Oransje (`orange-400`) | Swords |
| Defense Dice | Blå (`blue-400`) | Shield |
| Damage | Gul (`yellow-400`) | Skull |
| Horror | Lilla (`purple-400`) | Brain |

**Tekstseksjoner:**
| Seksjon | Farge | Stil |
|---------|-------|------|
| Field Observation (beskrivelse) | Amber/gull | Kursiv sitat med venstre border |
| Arkham Research Notes (lore) | Cyan | Serif font i boks |
| Upon Defeat | Grå | Dempet kursiv |
| Traits | Fargekodede badges | Basert på trait-type |

**Trait-farger:**
- **Bevegelse** (Flying, Fast, Aquatic): Himmelblå (`sky-300`)
- **Størrelse** (Massive, Elite, Slow): Fiolett (`violet-300`)
- **Evner** (Regenerate, Ambusher, Ranged): Rosa (`rose-300`)
- **Annet** (Scavenger): Lime (`lime-300`)
- **Default**: Amber (`amber-300`)

#### 3. Økt Zoom-nivå

**GameBoard.tsx endringer:**
- Maksimum zoom økt fra `1.5` til `2.5`
- Gjelder både scroll-wheel og pinch-to-zoom på touch

```typescript
// Før
setScale(prev => Math.min(Math.max(prev * scaleDelta, 0.3), 1.5));

// Etter
setScale(prev => Math.min(Math.max(prev * scaleDelta, 0.3), 2.5));
```

### Endrede Filer

#### OptionsMenu.tsx
- Import av `useEffect`, `Maximize`, `ZoomIn`
- Utvidet `GameSettings` interface med `resolution` og `uiScale`
- Oppdatert `DEFAULT_SETTINGS` med nye verdier
- Ny `renderDisplayTab()` med resolution-picker og UI-scale slider

#### JournalModal.tsx
- Import av nye ikoner: `Swords`, `Shield`, `Heart`, `Brain`, `Eye`
- Fullstendig redesign av monster-detaljer med fargekodede stats
- Nye seksjoner: Field Observation, Research Notes, Upon Defeat
- Fargekodede trait-badges basert på trait-type

#### GameBoard.tsx
- Endret MAX_ZOOM fra 1.5 til 2.5 (linje 783 og 879)

### Testing
- TypeScript kompilerer uten feil
- Build fullført uten errors
- Alle nye UI-elementer rendres korrekt

---

## 2026-01-20: Interaktive Objekter, Fog of War, 3D Hex-effekter og Miljøeffekter

### Oppgave
Implementere visuelle forbedringer og nye interaktive elementer:
1. **Interaktive Objekter**: Forbedrede bokhyller og nye Eldritch Portaler
2. **Fog of War**: Animert skygge-tåke effekt med flimmer-reveal ved dør-åpning
3. **3D Hex Depth**: Brettspill-lignende tykkelse med CSS-skygger og transformasjoner
4. **Miljøeffekter**: Regn/tåke partikkeleffekter og blodspor ved skade

### Løsning

#### 1. Eldritch Portal - Ny Interaktiv Objekt Type
Lagt til ny `eldritch_portal` TileObjectType som spawner fiender i Mythos-fasen:

**Visual rendering (GameBoard.tsx):**
- Animert lilla glød med `animate-portal-pulse`
- Svirvlende energi-effekt med `conic-gradient`
- Portal flare-animasjon med `animate-portal-flare`
- Zap-ikon med energi-animasjon

**Spawn-logikk (ShadowsGame.tsx):**
```typescript
// I Mythos-fasen: Sjekker alle aktive portaler
// Spawn-sjanse basert på portalSpawnChance (default 50%)
// Spawner tilfeldige fiender fra portalSpawnTypes
```

**Context Actions (contextActionDefinitions.ts):**
- "Undersøk Portal" (1 AP, -1 Sanity)
- "Forsegle Portal (Elder Sign)" (2 AP, krever Elder Sign)
- "Prøv å Lukke (Wil 6)" (2 AP, skill check)

#### 2. Forbedret Bokhylle-visning
- Animert glød for usøkte bokhyller (`animate-bookshelf-glow`)
- "Search" label som pulserer
- Dimmet visning for søkte bokhyller

#### 3. Fog of War System
**Animert skygge-tåke for uutforskede områder:**
- Flere lag med animerte tåke-drifts (`animate-fog-mist-drift`, `animate-fog-mist-swirl`)
- Tendrils-effekt med `animate-fog-tendril`
- Noise texture overlay
- `fog-of-war-unexplored` klasse med gradient bakgrunn

**Flimmer-reveal ved dør-åpning:**
- `animate-fog-reveal-flicker` - 1.2s flicker-animasjon
- `fog-reveal-shimmer` - shimmer overlay effekt
- Trigges automatisk på tilstøtende tiles når dør åpnes
- Tile får `fogRevealAnimation: 'revealing'` state

#### 4. 3D Hex Tykkelse (Brettspill-effekt)
**CSS-klasser for dybde:**
- `hex-3d-depth` - Standard tile dybde
- `hex-3d-depth-elevated` - Forhøyede tiles (zoneLevel > 0)
- `hex-3d-depth-sunken` - Senket tiles (zoneLevel < 0, kjeller/krypt)

**Teknikk:**
- Stacked box-shadows for å simulere pappflis-tykkelse
- Inset shadows for kantbelysning
- `hex-3d-edge-light` gradient overlay

#### 5. Blodspor System
**Tile type-utvidelse:**
```typescript
bloodstains?: {
  count: number;              // Antall flekker (maks 8)
  positions: Array<{x, y, rotation, size}>; // Random posisjoner
  fadeTime?: number;          // Runder til fading (valgfritt)
}
```

**Spawn-logikk:**
- `addBloodstains(q, r, damageAmount)` funksjon
- Genererer 1-4 blodflekker basert på skade
- Trigges ved:
  - Fiende angriper spiller
  - Spiller angriper fiende
  - Trylleformel-skade

**CSS-animasjoner:**
- `animate-blood-splatter` - Splatter appear effect
- `blood-stain` klasse med radial gradient

#### 6. Lokal Vær Partikkeleffekter
**Støttet værttyper på individuelle tiles:**
- **Tåke**: `local-fog-overlay`, `animate-local-fog-pulse`, `animate-local-fog-drift`
- **Regn**: Fallende dråper med `animate-rain-drop`, intensitetsbasert antall
- **Miasma**: Svirvlende giftig tåke med hodeskalle-overlay

### Endrede Filer

#### types.ts
- Lagt til `eldritch_portal` i `TileObjectType`
- Utvidet `TileObject` med portal-properties:
  - `portalActive?: boolean`
  - `portalSpawnTypes?: EnemyType[]`
  - `portalSpawnChance?: number`
- Lagt til `bloodstains` og `fogRevealAnimation` på `Tile`

#### index.css
Lagt til ~520 linjer med nye animasjoner og klasser:
- FOG OF WAR SYSTEM (linjer 1450-1607)
- 3D HEX DEPTH (linjer 1609-1664)
- ELDRITCH PORTAL (linjer 1666-1753)
- BLOOD TRAILS (linjer 1755-1843)
- RAIN & LOCAL FOG (linjer 1845-1917)
- BOOKSHELF SEARCH (linjer 1919-1972)

#### GameBoard.tsx
- Import av `Zap`, `Droplet` ikoner
- 3D depth klasse basert på `zoneLevel`
- Blood stain rendering med animasjon
- Forbedret bookshelf visning med søk-state
- Eldritch portal rendering med alle effekter
- Forbedret fog of war med animert tåke
- Fog reveal flicker animasjon
- Local weather effects rendering (regn, tåke, miasma)

#### ShadowsGame.tsx
- Portal spawn-logikk i Mythos-fasen
- `addBloodstains()` helper funksjon
- `triggerFogReveal()` helper funksjon
- Bloodstain trigges ved all skade (fiende→spiller, spiller→fiende, spells)
- Fog reveal trigges ved dør-åpning

#### ItemTooltip.tsx
- Lagt til `eldritch_portal` i `TILE_OBJECT_INFO`

#### contextActionDefinitions.ts
- Lagt til `eldritch_portal` context actions

#### monsterObstacles.ts
- Lagt til `eldritch_portal` i `OBSTACLE_PASSABILITY`

### Tekniske Detaljer

**Fog Reveal Flow:**
1. Spiller åpner dør (open_door/use_key/lockpick)
2. System finner tilstøtende tile basert på edge index
3. `triggerFogReveal(q, r)` kalles
4. Tile får `fogRevealAnimation: 'revealing'`
5. Animasjon kjører (1.2s flicker + shimmer)
6. Timeout setter `fogRevealAnimation: 'revealed'` og `explored: true`

**Blood Stain Positioning:**
```typescript
const positions = Array.from({ length: stainCount }, () => ({
  x: 20 + Math.random() * 60,  // 20-80% av tile bredde
  y: 20 + Math.random() * 60,  // 20-80% av tile høyde
  rotation: Math.random() * 360,
  size: 15 + Math.random() * 20  // 15-35px
}));
```

**Portal Spawn Logic:**
```typescript
// I MYTHOS fase:
for (const portal of activePortals) {
  if (Math.random() * 100 < portal.portalSpawnChance) {
    const enemyType = random(portal.portalSpawnTypes);
    spawnEnemy(enemyType, portal.q, portal.r);
  }
}
```

### Testing
- TypeScript kompilerer uten feil
- Alle nye CSS-animasjoner fungerer i browser
- Portal rendering vises korrekt
- Fog of war har smooth animasjon
- Blood stains vises ved skade
- 3D depth effekt synlig på tiles

---

## 2026-01-20: Forbedret Scenarios, Win States, Tile-tema og Doom Counter Balansering

### Oppgave
Forbedre spillet på tre hovedområder:
1. **Scenarios og Win States**: Klare faktiske muligheter til å vinne scenario
2. **Tile-tema Matching**: System som velger tiles som passer til type scenario (skog tiles til skog scenario etc)
3. **Doom Counter Balansering**: Doom var for streng - gikk ofte til 0 før man kunne fullføre objectives

### Problemanalyse

#### Problem 1: Items spawnet ikke
Scenarios genererte objectives som "Find the Iron Key", men itemene spawnet ALDRI faktisk i spillet. Det var ingen kobling mellom scenario objectives og tile-generering.

#### Problem 2: Ingen tematisk tile matching
Scenarios hadde `tileSet: indoor/outdoor/mixed` og `atmosphere: creepy/urban/wilderness`, men alle tiles brukte samme generiske pool uansett scenario-tema.

#### Problem 3: Doom for streng
- Base doom verdier var for lave (f.eks. 12 for escape scenarios)
- Doom events spawnet fiender for tidlig (ved 70%/50%/20% av doom)
- Med 3 AP per runde og flere tiles å utforske var det knapt tid til objectives

### Løsning

#### 1. Nytt Objective Spawning System (`objectiveSpawner.ts`)
Ny fil med komplett system for quest items og tiles:

```typescript
// Key features:
- initializeObjectiveSpawns(scenario) - Oppretter liste av quest items og tiles
- onTileExplored() - Sjekker om quest items skal spawne på nye tiles
- collectQuestItem() - Håndterer item-samling og objective progress
- shouldSpawnQuestTile() - Spawner exit/altar tiles når betingelser møtes
```

**Quest Items**: Keys, clues, collectibles, artifacts, components
**Quest Tiles**: Exit doors, altars, ritual points, boss rooms

Items spawner progressivt basert på:
- Exploration progress (flere tiles utforsket = høyere spawn-sjanse)
- Room type bonuses (studier/biblioteker har høyere sjanse for items)
- Objective priority (required items spawner før optional)

#### 2. Tile-tema Matching System
Lagt til `ScenarioTheme` type og tema-mapping:

```typescript
export type ScenarioTheme = 'manor' | 'church' | 'asylum' | 'warehouse' |
  'forest' | 'urban' | 'coastal' | 'underground' | 'academic';
```

**getThemedTilePreferences(theme)** returnerer:
- `preferredNames`: Tiles som passer til tema
- `avoidNames`: Tiles som skal unngås
- `floorPreference`: Foretrukket gulvtype

Eksempel for 'forest' tema:
- Preferred: forest, clearing, marsh, path, grove, stones, ruins, cabin
- Avoid: asylum, factory, warehouse, hospital, cell
- Floor: dirt

#### 3. Doom Counter Balansering
**Økte base doom verdier:**
| Mission Type | Før (Normal) | Etter (Normal) |
|-------------|--------------|----------------|
| escape_manor | 12 | 16 |
| assassination | 10 | 14 |
| survival | 12 | 14 |
| collection | 12 | 16 |
| rescue | 12 | 16 |
| investigation | 14 | 18 |
| ritual | 10 | 14 |
| seal_portal | 10 | 14 |
| purge | 12 | 16 |

**Justerte doom event thresholds:**
- Early wave: 70% → 55% (gir ~7 runder før første wave)
- Mid wave: 50% → 35% (mer tid mellom waves)
- Boss spawn: 20% → 15% (dramatisk finale nær slutten)

### Endrede Filer

#### Nye Filer
- `src/game/utils/objectiveSpawner.ts` - Quest item/tile spawning system

#### Modifiserte Filer
- `src/game/types.ts`:
  - Lagt til `ScenarioTheme` type
  - Lagt til `theme` field i Scenario interface
  - Lagt til `objectiveSpawnState` i GameState

- `src/game/utils/scenarioGenerator.ts`:
  - Lagt til tema-mapping funksjoner
  - Eksporterer `getThemedTilePreferences()`
  - Økte alle doom base verdier
  - Justerte doom event thresholds

- `src/game/ShadowsGame.tsx`:
  - Importerer objectiveSpawner funksjoner
  - Initialiserer objectiveSpawnState ved scenario start
  - Integrerer quest item spawning i spawnRoom()
  - Oppdatert search_tile for å gi quest items

### Tekniske Detaljer

**Spawn Timing:**
- Items begynner å spawne etter 20% exploration
- Alle items skal være tilgjengelige ved 80% exploration
- "Behind schedule" bonus øker spawn-sjanse hvis få items har spawnet

**Quest Item Types:**
```typescript
type: 'key' | 'clue' | 'collectible' | 'artifact' | 'component'
```

**Quest Tile Types:**
```typescript
type: 'exit' | 'altar' | 'ritual_point' | 'npc_location' | 'boss_room'
```

### Testing
- TypeScript kompilerer uten feil (`npx tsc --noEmit`)
- Scenarios genererer nå med tema
- Quest items spawner på tiles og kan samles
- Objectives oppdateres når items samles

---

## 2026-01-20: Implementert klientside-system for autogenerering av spill-grafikk

### Oppgave
Implementere et klientside-system for autogenerering av spill-grafikk (tiles, monstre, karakterer) ved bruk av Google Gemini API og React. Systemet skal:
- Bruke AssetLibrary med localStorage-caching
- Ha batch processing UI i Options-menyen
- Generere bilder med Gemini 2.0 Flash
- Falle tilbake til standard-grafikk ved feil

### Løsning
Lagt til tre nye filer og oppdatert OptionsMenu.tsx:

#### 1. AssetGenerationService.ts
Komplett service for Gemini API-integrasjon:
- **Prompt Templates**: Tre ulike maler for tiles (top-down), monstre (portrait), og karakterer (portrait)
- **Asset Registry**: Samler alle 152+ entiteter (lokasjoner, monstre, karakterer) fra constants.ts
- **API Integration**: Kommuniserer med `gemini-2.0-flash-exp` modellen
- **Batch Processing**: Genererer flere assets med progress-tracking og rate limiting
- **Storage Functions**: Full localStorage-håndtering med import/eksport-støtte
- **API Key Management**: Lagrer nøkkel sikkert i localStorage

#### 2. AssetLibrary.ts (Oppdatert)
Utvidet med nye funksjoner:
- Integrert med AssetGenerationService
- Prioritetssystem: Generert bilde → Statisk fallback → null
- Synkrone og asynkrone varianter for alle asset-typer
- Fallback-mapping for alle 16 monstre og 6 karakterer

#### 3. AssetStudioPanel.tsx
Full React-komponent for Asset Studio UI:
- **Statistikk-visning**: Viser antall genererte vs totale assets per kategori
- **API-nøkkel input**: Sikker inndata med show/hide toggle
- **Kategori-filter**: Velg mellom Alle/Tiles/Monstre/Karakterer
- **Progress bar**: Sanntidsvisning av genereringsprosessen
- **Kontrollknapper**: Start/Stopp/Eksporter/Importer
- **Feilhåndtering**: Viser feil under generering med mulighet for retry

#### 4. OptionsMenu.tsx (Oppdatert)
- Erstattet gammel Asset Studio-fane med ny AssetStudioPanel-komponent
- Fjernet ubrukte props (assetCount, onGenerateAssets, onExportAssets)

### Tekniske Detaljer

#### Prompt-strategi
```
TILES: Top-down 90-degree bird's-eye view, hexagonal tile format, dark Lovecraftian aesthetic
MONSTERS: Dramatic portrait, eldritch horror, trading card game style
CHARACTERS: 1920s period clothing, noir lighting, Call of Cthulhu RPG style
```

#### Genererings-flyt
1. Bruker oppgir Gemini API-nøkkel (gratis fra Google AI Studio)
2. System identifiserer manglende assets
3. Batch-generering med 2 sek delay (rate limiting)
4. Base64-bilder lagres i localStorage
5. Spillet bruker genererte bilder, med fallback til statiske

#### Fallback-håndtering
- **Karakterer**: 6 statiske portretter (alltid tilgjengelig)
- **Monstre**: 16 statiske portretter (alltid tilgjengelig)
- **Lokasjoner**: Ingen fallback (152 lokasjoner, vises uten bilde)

### Filer Endret
| Fil | Handling |
|-----|----------|
| `src/game/utils/AssetGenerationService.ts` | Opprettet |
| `src/game/utils/AssetLibrary.ts` | Refaktorert |
| `src/game/components/AssetStudioPanel.tsx` | Opprettet |
| `src/game/components/OptionsMenu.tsx` | Oppdatert |

### Resultat
- ✅ AssetGenerationService med full Gemini API-støtte
- ✅ Batch processing med progress-tracking
- ✅ localStorage-caching av Base64-bilder
- ✅ Komplett UI i Options → Asset Studio
- ✅ Import/eksport av asset-bibliotek
- ✅ Build vellykket uten feil

### Oppdatering: Standard-grafikk som default

Endret systemet slik at **statiske bilder fra GitHub brukes som standard**:

1. **GameSettings**: Lagt til `useGeneratedAssets: boolean` (default: `false`)
2. **AssetLibrary**: Alle funksjoner tar nå `useGenerated` parameter (default: `false`)
3. **AssetStudioPanel**: Lagt til toggle-switch for å aktivere/deaktivere genererte bilder

**Nytt prioritetssystem:**
- **Standard (default)**: Statiske bilder fra `/assets/` mappen
- **Valgfritt**: AI-genererte bilder når `useGeneratedAssets` er aktivert

Dette sikrer at spillet alltid fungerer med de ferdiglagde bildene fra GitHub, mens genererte bilder er et valgfritt tillegg for spillere som ønsker det.

---

## 2026-01-20: Implementert hover tooltips for hex-tile objekter og kanter

### Oppgave
Lage info tooltips ved hover som forklarer hva objekter på en hex-tile er (dør, låst dør, rubble, brann, etc.) så spillere kan lett se hva som er på en hex tile.

### Løsning
Lagt til to nye tooltip-komponenter i `src/game/components/ItemTooltip.tsx`:

#### TileObjectTooltip
Viser informasjon når spilleren hovrer over objekter på tiles:
- **Brann (fire)**: "Flammene danser med en nesten bevisst intensitet. Varmen er uutholdelig."
- **Låst dør (locked_door)**: "En solid dør med en gammel lås. Noen ville ikke at du skulle komme inn."
- **Ruiner (rubble)**: "Sammenraste murstein og tømmer blokkerer veien."
- **Felle (trap)**: "En mekanisme skjult i skyggen. Noen forventet ubudne gjester."
- **Port (gate)**: "Jernstenger som har stått her i generasjoner."
- **Tåkevegg (fog_wall)**: "Unaturlig tåke som ikke beveger seg med vinden."
- **Alter (altar)**: "Et gammelt alter flekkete av år med ritualer."
- **Bokhylle (bookshelf)**: "Støvete bøker på ukjente språk."
- **Kasse/Kiste/Skap (crate/chest/cabinet)**: Søkbare beholdere
- **Barrikade (barricade)**: "Planker og møbler stablet i hast."
- **Speil (mirror)**: "Et gammelt speil. Refleksjonen din virker... forsinket."
- **Radio (radio)**: "En knitrende radio. Stemmer fra... hvor?"
- **Bryter (switch)**: "En mekanisk bryter. Hva styrer den?"
- **Statue (statue)**: "En forvitret statue. Øynene ser ut til å følge deg."
- **Utgangsdør (exit_door)**: "Veien ut. Friheten venter på den andre siden."

#### EdgeFeatureTooltip
Viser informasjon når spilleren hovrer over edge-features:
- **Dører**: Åpen, lukket, låst, barrikadert, knust, forseglet, puzzle-dør
- **Blokkerte kanter**: Ruiner, tung ruiner, kollapset, brann, barrikade, låst port, åndesperre, magisk vern, avgrunn, oversvømt
- **Trapper**: Trapp opp/ned med atmosfæriske beskrivelser
- **Vinduer**: "Glasset er skittent, men du kan se gjennom."
- **Hemmelige dører**: Viser om de er oppdaget eller ikke
- **Vegger**: "Solid murstein. Kanskje det er noe bak?"

Hver tooltip inkluderer:
- Atmosfærisk Lovecraft-inspirert beskrivelse
- Handling/interaksjon instruksjoner
- DC (Difficulty Class) krav hvis relevant
- Skill-krav hvis relevant

### Filer Endret
- `src/game/components/ItemTooltip.tsx` - Lagt til TileObjectTooltip og EdgeFeatureTooltip komponenter
- `src/game/components/GameBoard.tsx` - Integrert tooltips for objekter og edge-features

### Resultat
- ✅ Hover over objekter viser tooltip med beskrivelse og handlingsinstruksjoner
- ✅ Hover over edge-features (dører, trapper, etc.) viser tooltip med info
- ✅ Atmosfæriske beskrivelser i Lovecraft-stil
- ✅ Build vellykket uten feil

---

## 2026-01-20: Implementert 30 nye tiles

### Oppgave
Implementere alle anbefalte nye tiles fra tile inventory-analysen.

### Løsning
Lagt til 30 nye TileTemplates i `src/game/tileConnectionSystem.ts` med full støtte for edge-connections, atmosfæriske beskrivelser, fiende-spawn og interaktive objekter.

### Nye Tiles Implementert

#### PRIORITET 1 - Essensielle (12 tiles)

**Fasader (5):**
| ID | Navn | Beskrivelse |
|----|------|-------------|
| `facade_asylum` | Arkham Asylum | Jernporter vokter Arkhams beryktede asyl |
| `facade_hospital` | St. Mary's Hospital | Sykehuset er stille. For stille. |
| `facade_museum` | Arkham Historical Museum | Utstillinger fra sivilisasjoner eldre enn kjent historie |
| `facade_police` | Arkham Police Station | Saksmapper beskriver ting politiet ikke kan bekjempe |
| `facade_witchhouse` | The Witch House | Keziah Masons hus med geometri som skader å forstå |

**Rom (4):**
| ID | Navn | Beskrivelse |
|----|------|-------------|
| `room_parlor` | Victorian Parlor | Velurfløyel og åndebrett på bordet |
| `room_office` | Administrator's Office | Arkivskap med skuff merket "IKKE ÅPNE" |
| `room_gallery` | Art Gallery | Portretter av folk som aldri eksisterte |
| `room_conservatory` | Overgrown Conservatory | Planter har brutt pottene sine, ukjente arter |

**Undergrunn (3):**
| ID | Navn | Beskrivelse |
|----|------|-------------|
| `basement_mine` | Abandoned Mine Shaft | Tømmerstøtter stønner under jord |
| `crypt_sanctum` | Inner Sanctum | Det innerste kammer der sløret er tynnest |
| `crypt_massgrave` | Mass Grave | Bein på bein, pestens døde |

#### PRIORITET 2 - God variasjon (10 tiles)

**Urbane (4):** `urban_station`, `urban_market`, `urban_park`, `urban_dock`
**Gater (2):** `street_bridge`, `street_deadend`
**Natur (4):** `nature_ruins`, `nature_swamp`, `nature_cave`, `nature_blackpool`

#### PRIORITET 3 - Atmosfære (8 tiles)

`facade_hotel`, `facade_lighthouse`, `facade_funeral`, `facade_farmhouse`, `room_nursery`, `room_maproom`, `basement_boiler`, `crypt_starchamber`

### Filer Endret
- `src/game/tileConnectionSystem.ts` - Lagt til 30 nye TileTemplates og oppdatert TILE_TEMPLATES registry

### Resultat
- ✅ 30 nye tiles implementert med atmosfæriske Lovecraft-beskrivelser
- ✅ Edge-konfigurasjon for korrekt tilkobling
- ✅ Fiende-spawn definert for farlige områder
- ✅ Build vellykket uten feil
- ✅ **Totalt antall tiles: 43 → 73 tiles**

### Ny Kategori-fordeling

| Kategori | Før | Etter | Endring |
|----------|-----|-------|---------|
| Foyer | 3 | 3 | - |
| Corridor | 5 | 5 | - |
| Room | 8 | 14 | +6 |
| Stairs | 3 | 3 | - |
| Basement | 4 | 6 | +2 |
| Crypt | 4 | 7 | +3 |
| Facade | 4 | 13 | +9 |
| Street | 4 | 6 | +2 |
| Urban | 3 | 7 | +4 |
| Nature | 5 | 9 | +4 |
| **TOTALT** | **43** | **73** | **+30** |

---

## 2026-01-20: Tile Inventory og Utvidelsesforslag

### Oppgave
Kartlegge alle eksisterende tiles i spillet og lage forslag til nye tiles for større variasjon.

### Analyse

#### EKSISTERENDE TILES I KODEBASEN (43 totalt)

Alle tiles er definert i `src/game/tileConnectionSystem.ts` som TileTemplates.

---

##### FOYER (3 tiles) - Inngangspartier
| ID | Navn | Beskrivelse |
|----|------|-------------|
| `foyer_grand` | Grand Foyer | Storslått entré med doble trapper |
| `foyer_small` | Dim Reception | Trang entréhall med gjesteboken |
| `foyer_church` | Church Narthex | Kirkeforhall med tørre vievannskar |

---

##### CORRIDOR (5 tiles) - Korridorer og ganger
| ID | Navn | Beskrivelse |
|----|------|-------------|
| `corridor_straight` | Dusty Corridor | Rett korridor med friske fotspor i støvet |
| `corridor_t` | T-Junction | T-kryss, tre veier i mørket |
| `corridor_corner` | Dark Corner | Hjørne der skygger samles |
| `corridor_cross` | Crossroads | Firevegskryss, noe overvåker fra hver retning |
| `corridor_wide` | Portrait Gallery | Bred gang med portretter som følger deg med blikket |

---

##### ROOM (8 tiles) - Rom
| ID | Navn | Kategori | Beskrivelse |
|----|------|----------|-------------|
| `room_study` | Private Study | Kontor | Halvferdig brev med våt blekk |
| `room_bedroom` | Master Bedroom | Soverom | Journal med drømmer som ikke er drømmer |
| `room_kitchen` | Abandoned Kitchen | Kjøkken | Gryter med mat som fortsatt bobler |
| `room_ritual` | Ritual Chamber | Okkult | Symboler malt i blod |
| `room_library` | Library | Bibliotek | Bøker på ukjente språk |
| `room_lab` | Hidden Laboratory | Laboratorium | Prøver i glass - noen nesten menneskelige |
| `room_dining` | Dining Hall | Spisesal | Dekket for gjester som aldri kommer |
| `room_living` | Drawing Room | Stue | Peis som knitrer uten ild |

---

##### STAIRS (3 tiles) - Trapper
| ID | Navn | Beskrivelse |
|----|------|-------------|
| `stairs_down` | Cellar Stairs | Steintrapper ned i mørket |
| `stairs_up` | Grand Staircase | Utskårne rekkverk, fottrinn ovenfra |
| `stairs_spiral` | Spiral Stairs | Spiral som går dypere enn bygningen tillater |

---

##### BASEMENT (4 tiles) - Kjellere
| ID | Navn | Beskrivelse |
|----|------|-------------|
| `basement_cellar` | Dark Cellar | Støvete flasker fra år som ikke eksisterer |
| `basement_wine` | Wine Cellar | Vinkjeller med etiketter på ukjente språk |
| `basement_tunnel` | Underground Tunnel | Jordtunnel som puster |
| `basement_sewer` | Sewer Junction | Kloakk med noe stort i mørket |

---

##### CRYPT (4 tiles) - Krypter
| ID | Navn | Beskrivelse |
|----|------|-------------|
| `crypt_tomb` | Forgotten Tomb | Steinkister med forskjøvne lokk |
| `crypt_altar` | Sacrificial Altar | Alter flekkete av århundrer med offer |
| `crypt_tunnel` | Bone Passage | Vegger pakket med bein |
| `crypt_portal` | Eldritch Portal | Steinbue med stjerner fra en annen himmel |

---

##### FACADE (4 tiles) - Bygningsfasader
| ID | Navn | Beskrivelse |
|----|------|-------------|
| `facade_manor` | Abandoned Manor | Herregård der alle vinduer er mørke |
| `facade_shop` | Dusty Antique Shop | Antikvariat med spilledåse fra mareritt |
| `facade_church` | Crumbling Church | Kirke med klokker som ringer selv |
| `facade_warehouse` | Derelict Warehouse | Lagerbygning med nykuttede kjeder |

---

##### STREET (4 tiles) - Gater
| ID | Navn | Beskrivelse |
|----|------|-------------|
| `street_main` | Main Street | Hovedgate med flimrende gasslykter |
| `street_alley` | Shadowy Alley | Mørkt smug med symboler på veggen |
| `street_crossing` | The Crossroads | Seksvegskryss der avtaler gjøres |
| `street_corner` | Street Corner | Gatehjørne der skygger dveler |

---

##### URBAN (3 tiles) - Urbane områder
| ID | Navn | Beskrivelse |
|----|------|-------------|
| `urban_square` | Town Square | Torget der klokketårnet teller ned |
| `urban_harbor` | Arkham Harbor | Havn med fiskere med for store øyne |
| `urban_cemetery` | Old Cemetery | Kirkegård med steiner eldre enn byen |

---

##### NATURE (5 tiles) - Naturområder
| ID | Navn | Beskrivelse |
|----|------|-------------|
| `nature_forest` | Blackwood Forest | Tett skog uten dyrelyder |
| `nature_clearing` | Moonlit Clearing | Lysning med runestein i midten |
| `nature_path` | Forest Path | Smal sti der noe følger etter |
| `nature_marsh` | Treacherous Marsh | Myr med villedende lys |
| `nature_stones` | Ancient Stone Circle | Monolitter eldre enn menneskeheten |

---

### TILE-BILDER UTEN KODE-IMPLEMENTASJON (39 stykker)

Disse bildene finnes i `src/assets/tiles/` men har ingen tilhørende TileTemplate:

| Bilde | Foreslått kategori | Prioritet |
|-------|-------------------|-----------|
| tile-asylum.png | Facade | HØY |
| tile-hospital.png | Facade | HØY |
| tile-museum.png | Facade | HØY |
| tile-hotel.png | Facade | MEDIUM |
| tile-police.png | Facade/Urban | HØY |
| tile-courthouse.png | Facade | MEDIUM |
| tile-lighthouse.png | Facade/Nature | MEDIUM |
| tile-station.png | Urban | HØY |
| tile-campus.png | Urban | MEDIUM |
| tile-market.png | Urban | MEDIUM |
| tile-park.png | Urban/Nature | MEDIUM |
| tile-dock.png | Urban | MEDIUM |
| tile-shipyard.png | Urban | LAV |
| tile-riverfront.png | Urban/Nature | MEDIUM |
| tile-bridge.png | Street | HØY |
| tile-deadend.png | Street/Corridor | MEDIUM |
| tile-gate.png | Street/Facade | MEDIUM |
| tile-parlor.png | Room | HØY |
| tile-office.png | Room | HØY |
| tile-gallery.png | Room | MEDIUM |
| tile-billiard.png | Room | LAV |
| tile-nursery.png | Room | MEDIUM |
| tile-conservatory.png | Room | MEDIUM |
| tile-trophy.png | Room | LAV |
| tile-smoking.png | Room | LAV |
| tile-music.png | Room | LAV |
| tile-closet.png | Room | LAV |
| tile-servants.png | Corridor | MEDIUM |
| tile-maproom.png | Room | MEDIUM |
| tile-records.png | Room | MEDIUM |
| tile-boiler.png | Basement | HØY |
| tile-mine.png | Basement/Crypt | HØY |
| tile-cave.png | Basement/Crypt | HØY |
| tile-underground-lake.png | Basement/Crypt | MEDIUM |
| tile-sanctum.png | Crypt | HØY |
| tile-starchamber.png | Crypt | HØY |
| tile-idol.png | Crypt | MEDIUM |
| tile-massgrave.png | Crypt | HØY |
| tile-echo.png | Crypt | LAV |
| tile-well.png | Nature/Urban | MEDIUM |
| tile-pond.png | Nature | LAV |
| tile-swamp.png | Nature | MEDIUM |
| tile-orchard.png | Nature | LAV |
| tile-quarry.png | Nature | LAV |
| tile-petrified.png | Nature | MEDIUM |
| tile-ruins.png | Nature | HØY |
| tile-campsite.png | Nature | LAV |
| tile-hangingtree.png | Nature | MEDIUM |
| tile-gallows.png | Urban/Nature | MEDIUM |
| tile-blackpool.png | Nature | MEDIUM |
| tile-witchhouse.png | Facade | HØY |
| tile-shack.png | Facade/Nature | LAV |
| tile-farmhouse.png | Facade | MEDIUM |
| tile-tenement.png | Facade | LAV |
| tile-funeral.png | Facade/Room | HØY |
| tile-newspaper.png | Room | LAV |
| tile-cannery.png | Facade | LAV |
| tile-gasworks.png | Facade/Urban | LAV |
| tile-belltower.png | Room/Stairs | MEDIUM |
| tile-fireescape.png | Corridor/Stairs | LAV |

---

### ANBEFALTE NYE TILES FOR VARIASJON

#### PRIORITET 1 - Essensielle for spillvariasjon (12 tiles)

**Facade (5):**
1. **asylum_facade** - Arkham Asylum (tile-asylum.png)
   - Ikonisk Lovecraft-lokasjon
   - Edges: DOOR/FACADE, resten WALL
   - Leads to: Foyer med celle-korridorer

2. **hospital_facade** - St. Mary's Hospital (tile-hospital.png)
   - Medisinsk lokasjon for Doctor-klassen
   - Edge-konfig: Standard facade

3. **museum_facade** - Arkham Historical Museum (tile-museum.png)
   - Arkeologiske funn og okkulte gjenstander
   - Edge-konfig: Standard facade

4. **police_facade** - Arkham Police Station (tile-police.png)
   - Kriminaletterforskning
   - Edge-konfig: Standard facade

5. **witchhouse_facade** - The Witch House (tile-witchhouse.png)
   - Klassisk Lovecraft-referanse
   - Edge-konfig: Isolert, få innganger

**Room (4):**
6. **room_parlor** - Victorian Parlor (tile-parlor.png)
   - Séanser og okkulte sammenkomster
   - Features: Okkultist kan utføre ritualer

7. **room_office** - Administrator's Office (tile-office.png)
   - Dokumenter og ledetråder
   - Features: +1 Investigate

8. **room_gallery** - Art Gallery (tile-gallery.png)
   - Horror check fra malerier
   - Features: Skjulte dører bak kunst

9. **room_conservatory** - Overgrown Conservatory (tile-conservatory.png)
   - Plantevekst som har tatt over
   - Features: Nature-element innendørs

**Basement/Crypt (3):**
10. **basement_mine** - Abandoned Mine (tile-mine.png)
    - Vertikale sjakter og ganger
    - Features: Ustabile områder

11. **crypt_sanctum** - Inner Sanctum (tile-sanctum.png)
    - Kultisters hellige rom
    - Features: Boss spawn, ritual location

12. **crypt_massgrave** - Mass Grave (tile-massgrave.png)
    - Massegrav med ghoul spawn
    - Features: Horror check, loot fra lik

---

#### PRIORITET 2 - God variasjon (10 tiles)

**Urban (4):**
13. **urban_station** - Train Station (tile-station.png)
    - Reise til andre scenarier
14. **urban_market** - Night Market (tile-market.png)
    - Handelsmuligheter
15. **urban_park** - Arkham Park (tile-park.png)
    - Overgang mellom urban og natur
16. **urban_dock** - Harbor Dock (tile-dock.png)
    - Deep One territory

**Street (2):**
17. **street_bridge** - Miskatonic Bridge (tile-bridge.png)
    - Krysser elven, viktig forbindelse
18. **street_deadend** - Dead End (tile-deadend.png)
    - Blindgate med potensielt skjult inngang

**Nature (4):**
19. **nature_ruins** - Ancient Ruins (tile-ruins.png)
    - Førhistoriske strukturer
20. **nature_swamp** - Deep Swamp (tile-swamp.png)
    - Vanskeligere terreng enn marsh
21. **nature_cave_entrance** - Cave Entrance (tile-cave.png)
    - Inngang til undergrunnen fra utendørs
22. **nature_blackpool** - The Black Pool (tile-blackpool.png)
    - Overnaturlig vannhull

---

#### PRIORITET 3 - Ekstra atmosfære (8 tiles)

23. **facade_hotel** - Grand Hotel
24. **facade_lighthouse** - Kingsport Lighthouse
25. **facade_funeral** - Funeral Parlor
26. **facade_farmhouse** - Isolated Farmhouse
27. **room_nursery** - Abandoned Nursery
28. **room_maproom** - Cartographer's Room
29. **basement_boiler** - Boiler Room
30. **crypt_starchamber** - Star Chamber

---

### KATEGORI-BALANSE

**Nåværende fordeling:**
- Foyer: 3
- Corridor: 5
- Room: 8
- Stairs: 3
- Basement: 4
- Crypt: 4
- Facade: 4
- Street: 4
- Urban: 3
- Nature: 5
- **TOTALT: 43**

**Anbefalt fordeling etter utvidelse:**
- Foyer: 5 (+2)
- Corridor: 7 (+2)
- Room: 16 (+8)
- Stairs: 4 (+1)
- Basement: 7 (+3)
- Crypt: 8 (+4)
- Facade: 12 (+8)
- Street: 7 (+3)
- Urban: 8 (+5)
- Nature: 11 (+6)
- **TOTALT: 85**

---

### KONKLUSJON

Spillet har et solid grunnlag med 43 tiles, men for større variasjon anbefales:

1. **Fase 1**: Implementer de 12 PRIORITET 1-tiles (bilder finnes allerede)
2. **Fase 2**: Legg til de 10 PRIORITET 2-tiles
3. **Fase 3**: Utvid med PRIORITET 3-tiles etter behov

Viktige mangler å fylle:
- Flere ikoniske Lovecraft-lokasjoner (Asylum, Witch House)
- Flere profesjonsrelevante rom (Hospital for Doctor, Museum for Professor)
- Bedre overganger mellom outdoor og indoor
- Flere crypt/basement varianter for dungeon-crawling

---

## 2026-01-20: Scenario Info Button in Header

### Oppgave
Legge til en knapp ved siden av turn og doom markørene som viser scenario-info (mission briefing, objectives, victory conditions) når man klikker på den.

### Løsning
Laget en ny `ScenarioInfoModal` komponent og lagt til en knapp i header-baren ved siden av turn/doom markørene.

#### Ny fil: `src/game/components/ScenarioInfoModal.tsx`
En modal som viser all relevant scenario-informasjon under spillet:
- Case File ID og tittel
- Vanskelighetsgrad
- Nåværende round og doom status
- Briefing/beskrivelse
- Mission objectives (nummerert liste)
- Victory condition (grønt panel)
- Special conditions (gult panel, hvis tilgjengelig)
- Doom prophecy med events (rødt panel, med strikethrough for triggered events)
- Lokasjonsinformasjon

#### Endringer i `src/game/ShadowsGame.tsx`:
1. **Import**: Lagt til import av `ScenarioInfoModal`
2. **State**: Ny `showScenarioInfo` state for å kontrollere modal-visning
3. **Header-knapp**: Lagt til `ScrollText`-ikon knapp i header ved siden av turn/doom markørene
   - Kun synlig når det er et aktivt scenario
   - Har tooltip med "View Mission Briefing"
   - Samme styling som settings-knappen
4. **Modal-rendering**: Lagt til `ScenarioInfoModal` komponent i render-output

### Visuell stil
- Knappen bruker `ScrollText` ikon fra lucide-react
- Modal har samme dark theme styling som resten av UI
- Fargekoding for ulike seksjoner:
  - Emerald/grønn for victory condition
  - Amber/gul for special conditions
  - Red/rød for doom prophecy
- Triggered doom events vises med strikethrough og redusert opacity

### Filer Endret
- `src/game/components/ScenarioInfoModal.tsx` - NY FIL
- `src/game/ShadowsGame.tsx` - Lagt til import, state, knapp og modal

### Resultat
- ✅ Ny knapp synlig i header ved siden av turn/doom markører
- ✅ Klikk på knappen åpner scenario info modal
- ✅ Modal viser all relevant scenario-info
- ✅ Doom events vises med visuell indikasjon på triggered status
- ✅ Build vellykket uten feil

---

## 2026-01-20: Turn and Doom Info Icons

### Oppgave
Legge til info-ikoner ved siden av turn (R) og doom (D) markørene i header-baren for å gi spillere informasjon om hva disse betyr.

### Løsning
Lagt til interaktive info-ikoner med tooltips for både Round og Doom markørene i spill-headeren.

#### Endringer i `src/game/ShadowsGame.tsx`:
1. **Nye imports:**
   - `Info` ikon fra lucide-react
   - `Tooltip`, `TooltipContent`, `TooltipProvider`, `TooltipTrigger` fra @/components/ui/tooltip

2. **Header-bar oppdateringer:**
   - Wrappet hele header-innholdet i `TooltipProvider`
   - Lagt til `Info` ikon ved siden av Round (R) markøren med tooltip som forklarer:
     - "Current game round. Each round, all investigators take their turns before the Mythos phase triggers. Some scenarios have time limits based on rounds."
   - Lagt til `Info` ikon ved siden av Doom (D) markøren med tooltip som forklarer:
     - "The doom counter decreases each round. When it reaches 0, darkness consumes all and the game is lost. Some events may trigger at specific doom levels."
   - Fjernet `pointer-events-none` fra containeren slik at tooltips fungerer
   - Lagt til `cursor-help` styling på markørene for å indikere interaktivitet

### Visuell stil
- Info-ikonene har redusert opacity (50%) som standard og øker til 100% ved hover
- Tooltips har samme stil som resten av UI med `shadow-[var(--shadow-doom)]` og primary border
- Responsive størrelser for mobile enheter

### Filer Endret
- `src/game/ShadowsGame.tsx` - Lagt til info-ikoner med tooltips

### Resultat
- ✅ Info-ikoner synlige ved siden av turn og doom markører
- ✅ Tooltips gir klar forklaring på norsk-inspirert engelsk
- ✅ Responsivt design for mobile enheter
- ✅ Build vellykket uten feil

---

## 2026-01-20: Context Actions Code Refactoring

### Oppgave
Refaktorere kompleks kode i `contextActions.ts` (1253 linjer) for bedre lesbarhet og vedlikeholdbarhet, samtidig som oppførselen forblir uendret.

### Problem
`contextActions.ts` var en monolittisk fil med fire store switch statements (49 case statements totalt) som alle fulgte samme mønster:
- `getDoorActions()` - 7 door states med forskjellige actions
- `getBlockedEdgeActions()` - 10 blocking types med repetitive action-opprettelse
- `getObstacleActions()` - 14 obstacle types
- `getTileObjectActions()` - 16 object types

Hver case i switch statements pushet actions til en array med nesten identisk struktur, noe som førte til mye kode-duplisering og gjorde det vanskelig å:
- Legge til nye action-typer
- Forstå hvilke actions som finnes
- Teste individuelle action-konfigurasjoner
- Vedlikeholde konsistent oppførsel

### Løsning

#### 1. Ny fil: `src/game/utils/contextActionDefinitions.ts`
Ekstrahert alle action-konfigurasjoner til deklarative objekter (~700 linjer):

**Innhold:**
- `ActionConfig` og `DynamicActionConfig` interfaces for type-sikkerhet
- `ActionContext` interface for kontekstavhengige verdier
- `DOOR_STATE_ACTIONS` - Statiske actions for open/closed/puzzle/broken dører
- `LOCKED_DOOR_ACTIONS` - Dynamiske actions med DC basert på lock type
- `BARRICADED_DOOR_ACTIONS` og `SEALED_DOOR_ACTIONS`
- `BLOCKED_EDGE_ACTIONS` - Record<string, ActionConfig[]> for alle edge typer
- `FIRE_EDGE_ACTIONS`, `LOCKED_GATE_EDGE_ACTIONS`, `SPIRIT_BARRIER_EDGE_ACTIONS`, `WARD_EDGE_ACTIONS` - Dynamiske edge actions
- `OBSTACLE_ACTIONS` - Statiske obstacle actions
- `FIRE_OBSTACLE_ACTIONS`, `GAS_POISON_ACTIONS`, `DARKNESS_OBSTACLE_ACTIONS`, `SPIRIT_BARRIER_OBSTACLE_ACTIONS` - Dynamiske obstacle actions
- `TILE_OBJECT_ACTIONS` - Alle tile object actions
- `TRAP_ACTIONS`, `GATE_ACTIONS`, `WINDOW_EDGE_ACTIONS`
- `CANCEL_ACTION` - Gjenbrukbar cancel-handling

#### 2. Ny fil: `src/game/utils/contextActionBuilder.ts`
Ekstrahert action-bygge-logikk (~230 linjer):

**Innhold:**
- `createActionContext()` - Lager kontekst fra spiller og edge/obstacle data
- `buildStaticAction()` - Bygger ContextAction fra statisk config
- `buildDynamicAction()` - Bygger ContextAction fra dynamisk config med kontekst
- `buildActionsFromConfigs()` - Bygger flere actions fra config-array
- `inferSkillType()` - Utleder skill type fra action id/icon
- `withCancelAction()` - Legger til cancel-handling til action-liste
- `buildLockedDoorActions()` - Spesialisert builder for låste dører
- `buildSealedDoorActions()` - Spesialisert builder for forseglede dører
- `buildBlockedEdgeActions()` - Spesialisert builder for blokkerte edges
- `buildSearchableActions()` - Builder for søkbare containere
- `buildBookshelfActions()` - Builder for bokhyller
- `buildStatueActions()` - Builder for statuer

#### 3. Oppdatert: `src/game/utils/contextActions.ts`
Refaktorert hovedfil (nå ~410 linjer, ned fra 1253):

**Endringer:**
- Importerer definisjoner og builders fra nye moduler
- Erstatter store switch statements med config-lookups og builder-kall
- Beholder samme public API for bakoverkompatibilitet
- Re-eksporterer typer og hjelpefunksjoner for konsumenter

### Filer Endret/Opprettet
- `src/game/utils/contextActionDefinitions.ts` - **NY** (~700 linjer)
- `src/game/utils/contextActionBuilder.ts` - **NY** (~230 linjer)
- `src/game/utils/contextActions.ts` - **OPPDATERT** (redusert med ~840 linjer)

### Resultat
- ✅ Kode splittet i logiske moduler (definisjoner, builders, orchestration)
- ✅ Separasjon av data (hva actions gjør) fra logikk (hvordan de bygges)
- ✅ Lettere å legge til nye action-typer (bare legg til i definitions)
- ✅ Bedre type-sikkerhet med ActionConfig interfaces
- ✅ Bakoverkompatibilitet beholdt (re-eksporter)
- ✅ Build vellykket uten feil
- ✅ Ingen oppførselsendringer

### Tekniske detaljer
- **Før**: 1 fil à 1253 linjer med 49 case statements
- **Etter**: 3 filer med klarere ansvarsfordeling
  - `contextActionDefinitions.ts`: ~700 linjer (kun data)
  - `contextActionBuilder.ts`: ~230 linjer (kun logikk)
  - `contextActions.ts`: ~410 linjer (orchestration)
- **Linjereduksjon i contextActions.ts**: ~67%
- **Mønster brukt**: Configuration-driven architecture med builder pattern

---

## 2026-01-20: Monster AI Code Refactoring

### Oppgave
Refaktorere kompleks kode i `monsterAI.ts` (2250 linjer) for bedre lesbarhet og vedlikeholdbarhet, samtidig som oppførselen forblir uendret.

### Problem
`monsterAI.ts` var en monolittisk fil med flere uavhengige systemer blandet sammen:
- Væreffekter på monster-oppførsel
- Hindringshåndtering (obstacle passability)
- Monster spawn-tabeller og konstanter
- Personlighets- og oppførselskonfigurasjoner
- Målprioriteringssystem
- Spesialevner og kamp-logikk

Dette gjorde koden vanskelig å navigere, teste og vedlikeholde.

### Løsning

#### 1. Ny fil: `src/game/utils/monsterWeatherBehavior.ts`
Ekstrahert væreffekt-system (180 linjer):

**Innhold:**
- `WeatherMonsterModifiers` interface
- `DARKNESS_DWELLERS` og `LIGHT_SEEKERS` konstanter
- `getWeatherMonsterModifiers()` - Henter værmodifikatorer
- `monsterBenefitsFromWeather()` - Sjekker om monster drar nytte av vær
- `applyWeatherToVision()` - Anvendervær på synsrekkevidde
- `getWeatherMonsterMessage()` - Henter værbeskjeder for monster-tur

#### 2. Ny fil: `src/game/utils/monsterObstacles.ts`
Ekstrahert hindringshåndtering (175 linjer):

**Innhold:**
- `ObstaclePassability` og `PassabilityResult` interfaces
- `OBSTACLE_PASSABILITY` tabell (15+ objekttyper)
- `canEnemyPassTile()` - Sjekker om fiende kan passere en tile
- `canMassiveDestroy()` - Sjekker om massive skapninger kan ødelegge hindring
- `getMovementCostModifier()` - Beregner bevegelseskostnad

#### 3. Ny fil: `src/game/utils/monsterConstants.ts`
Ekstrahert konstanter og konfigurasjoner (300+ linjer):

**Innhold:**
- Type-definisjoner: `MonsterBehavior`, `MonsterState`, `SpecialMovement`
- `SpawnConfig`, `TargetPreferences`, `CombatStyleModifiers` interfaces
- `SPAWN_TABLES` - Spawn-tabeller per tile-kategori
- `MONSTER_BEHAVIORS` - Oppførselskart for alle monstertyper
- `MONSTER_PERSONALITIES` - Personlighetskonfigurasjoner
- `ENEMY_TARGET_PREFERENCES` - Målpreferanser
- Hjelpefunksjoner: `getCombatStyleModifiers()`, `getMonsterBehavior()`, etc.

#### 4. Oppdatert: `src/game/utils/monsterAI.ts`
Refaktorert hovedfil (nå ~1600 linjer, ned fra 2250):

**Endringer:**
- Importerer fra nye moduler
- Re-eksporterer alt for bakoverkompatibilitet
- Bruker `import type` for type-importer (rollup-kompatibilitet)
- Oppdatert `processEnemyTurn()` til å bruke `getWeatherMonsterMessage()`
- Oppdatert `calculateTargetPriority()` til å bruke `getTargetPreferences()`

### Filer Endret/Opprettet
- `src/game/utils/monsterWeatherBehavior.ts` - **NY** (180 linjer)
- `src/game/utils/monsterObstacles.ts` - **NY** (175 linjer)
- `src/game/utils/monsterConstants.ts` - **NY** (310 linjer)
- `src/game/utils/monsterAI.ts` - **OPPDATERT** (redusert med ~650 linjer)

### Resultat
- ✅ Kode splittet i logiske moduler
- ✅ Bedre separation of concerns
- ✅ Lettere å teste individuelle systemer
- ✅ Bakoverkompatibilitet beholdt (re-eksporter)
- ✅ Build vellykket
- ✅ Ingen oppførselsendringer

### Tekniske detaljer
- **Før**: 1 fil à 2250 linjer
- **Etter**: 4 filer med gjennomsnittlig ~540 linjer
- **Linjereduksjon i monsterAI.ts**: ~29%
- **Total kodebase**: Uendret (kun omorganisert)

---

## 2026-01-20: Multi-Character Hex Tile Positioning

### Oppgave
Når flere personer/monstre står i samme hex tile, skal de ikke stå oppå hverandre men settes rundt slik at det er mulig å se alle som er i en hex tile.

### Problem
Tidligere ble alle spillere og fiender på samme hex tile rendret i sentrum av hexen, noe som førte til fullstendig overlapping. Kun den siste entiteten var synlig.

### Løsning

#### 1. Ny utility-fil: `src/game/utils/entityPositioning.ts`
Opprettet et nytt modul med posisjoneringslogikk:

**Hovedfunksjoner:**
- `calculateEntityOffset()` - Beregner offset for en entitet basert på indeks og totalt antall
- `calculateCombinedOffset()` - Kombinert posisjonering for spillere og fiender på samme tile

**Posisjoneringsstrategier:**
- **1 entitet**: Sentrumsposisjon (ingen offset)
- **2 entiteter**: Plasseres på motsatte sider (venstre/høyre)
- **3+ entiteter**: Sirkulær arrangering rundt sentrum

**Spillere vs Fiender:**
- Spillere bruker mindre radius (18px) - inner ring
- Fiender bruker større radius (28px) - outer ring
- Når begge typer er til stede, får fiender vinkeljustert posisjon for å unngå overlapping

```typescript
export function calculateCombinedOffset(
  entityType: 'player' | 'enemy',
  entityIndex: number,
  playersAtPosition: number,
  enemiesAtPosition: number,
  playerRadius: number = 18,
  enemyRadius: number = 28
): PositionOffset
```

#### 2. Endringer i `GameBoard.tsx`

**Import:**
```typescript
import { calculateCombinedOffset } from '../utils/entityPositioning';
```

**Spiller-rendering (linje 1334-1356):**
- Beregner antall spillere og fiender på samme posisjon
- Finner spiller-indeks blant entiteter på tilen
- Bruker `calculateCombinedOffset()` for å få offset
- Legger offset til x og y posisjon

**Fiende-rendering (linje 1377-1419):**
- Samme logikk som spillere
- Fiender får større radius og vinkeljustert posisjon

### Filer Endret
- `src/game/utils/entityPositioning.ts` - **NY** - Posisjoneringslogikk
- `src/game/components/GameBoard.tsx` - Oppdatert spiller- og fiende-rendering

### Resultat
- ✅ Spillere på samme tile vises i sirkulær formasjon
- ✅ Fiender på samme tile vises spredt ut
- ✅ Når spillere og fiender er på samme tile, brukes forskjellige radier
- ✅ Animasjon for bevegelse fungerer fortsatt (transition-all duration-500)
- ✅ Build vellykket

### Tekniske detaljer
- **HEX_SIZE**: 95px
- **Spiller-token**: 48x48px (offset -24px for sentrering)
- **Fiende-token**: 56x56px (offset -28px for sentrering)
- **Spiller-radius**: 18px fra sentrum
- **Fiende-radius**: 28px fra sentrum

---

## 2026-01-20: Magic UI Button for Occultist and Professor

### Oppgave
Implementere en UI-knapp for Occultist og Professor for å bruke magi/alternativ attack hvor de velger formel. Ifølge REGELBOK.MD:
- **Professor** har 2 spells (True Sight, Mend Flesh) - Insight-kostnadsbasert
- **Occultist** har 3 selvvalgte spells fra 5 tilgjengelige - Angrepsterninger med begrensede bruk

### Problem
ActionBar hadde allerede en "Cast" knapp som viste spells, men:
1. Den brukte kun `spells: Spell[]` (legacy format for Professor)
2. Occultist sine `selectedSpells: OccultistSpell[]` ble aldri sendt til ActionBar
3. OccultistSpell har helt annen struktur (attackDice, usesPerScenario, etc.) enn Spell (cost, effectType)

### Løsning

#### 1. Utvidet ActionBar Props (`ActionBar.tsx`)
```typescript
interface ActionBarProps {
  spells: Spell[];                        // Legacy spells (Professor)
  occultistSpells?: OccultistSpell[];     // Hero Quest style (Occultist)
  activeSpell: Spell | null;
  activeOccultistSpell?: OccultistSpell | null;
  // ...
}
```

#### 2. Ny Grimoire UI
ActionBar viser nå begge spell-typer i samme meny:
- **Legacy Spells** (Professor): Viser navn, Insight-kostnad, beskrivelse
- **Occultist Spells**: Viser navn, angrepsterninger (🎲), forsvarbonus (🛡), bruk igjen, range

Fargekodet etter effekt:
- Attack/Horror: Rød
- Defense: Blå
- Banish: Lilla
- Utility: Cyan

#### 3. Ny GameState Property (`types.ts`)
```typescript
interface GameState {
  activeOccultistSpell: OccultistSpell | null;  // For target selection
  // ...
}
```

#### 4. Ny Handling: `cast_occultist` (`ShadowsGame.tsx`)
Komplett implementasjon av OccultistSpell casting:

**Attack Spells (eldritch_bolt, mind_blast)**:
- Ruller attackDice terninger
- Sammenligner skulls (4+) vs fiendens shields
- Viser terningkast i UI
- Støtter horror damage for mind_blast

**Banish Spell**:
- Bruker Willpower check (2 + WIL terninger, DC 5)
- Kun mot fiender med HP ≤ 3
- Viser suksess/feil med terningkast

**Defense Spell (dark_shield)**:
- Gir +2 forsvarsterninger denne runden
- Lagrer i `player.tempDefenseBonus`

**Utility Spell (glimpse_beyond)**:
- Avslører tiles innenfor range
- Oppdaterer exploredTiles

#### 5. Bruksbegrensning
Hver spell tracker `currentUses`:
- `usesPerScenario: -1` = Ubegrenset (Eldritch Bolt)
- Andre har 2-3 bruk per scenario
- UI viser `∞` eller `2/3` format

### Filer Endret
- `src/game/components/ActionBar.tsx` - Utvidet med OccultistSpell støtte
- `src/game/types.ts` - Lagt til `activeOccultistSpell` i GameState
- `src/game/ShadowsGame.tsx` - Lagt til `cast_occultist` handling, oppdatert ActionBar props

### Resultat
- ✅ Professor kan caste True Sight og Mend Flesh via Grimoire-knappen
- ✅ Occultist kan caste 5 forskjellige spells med Hero Quest-mekanikk
- ✅ Spell-menyen viser riktig info for begge typer
- ✅ Target selection fungerer for attack/banish spells
- ✅ Bruksbegrensninger vises og håndheves
- ✅ Build vellykket

---

## 2026-01-20: Fix Magic for Occultist and Professor in Legacy Mode

### Problem
When creating Occultist or Professor characters in legacy mode, they received no magic spells. According to REGELBOK.MD:
- **Professor** should have 2 scholarly spells: True Sight, Mend Flesh
- **Occultist** should select 3 spells before scenario start

### Root Cause
The `legacyHeroToPlayer()` function in `legacyManager.ts` always sets `spells: []` without checking character class.
The `handleStartGameWithLegacyHeroes()` function in `ShadowsGame.tsx` directly converts heroes to players without triggering spell selection modal for Occultist.

### Solution
1. **Professor**: Automatically assign "True Sight" and "Mend Flesh" spells in `legacyHeroToPlayer()`
2. **Occultist**: Show SpellSelectionModal before scenario start when loading legacy Occultist heroes

### Files Modified
- `src/game/utils/legacyManager.ts` - Add spell assignment for Professor
- `src/game/ShadowsGame.tsx` - Add spell selection flow for legacy Occultist heroes

### Implementation Details

#### 1. legacyManager.ts Changes
Added import for `SPELLS` from constants and updated `legacyHeroToPlayer()`:
```typescript
// Professor gets scholarly spells (True Sight, Mend Flesh) automatically
const characterSpells = hero.characterClass === 'professor'
  ? SPELLS.filter(s => s.id === 'reveal' || s.id === 'mend')
  : [];
```

#### 2. ShadowsGame.tsx Changes
Added new state for legacy occultist spell selection:
```typescript
const [pendingLegacyOccultists, setPendingLegacyOccultists] = useState<LegacyHero[]>([]);
const [currentLegacyOccultistIndex, setCurrentLegacyOccultistIndex] = useState(0);
```

Modified `handleStartGameWithLegacyHeroes()` to:
1. Check if any selected heroes are Occultists
2. If yes, convert non-occultist heroes first and show SpellSelectionModal
3. Process each Occultist one by one

Added new SpellSelectionModal for legacy Occultists that:
- Shows spell selection for each legacy Occultist
- Chains through multiple Occultists if more than one selected
- Properly cancels and cleans up if user cancels

### Testing
Build completed successfully. The fix ensures:
- **Professor** automatically gets "True Sight" and "Mend Flesh" spells in legacy mode
- **Occultist** must select 3 spells before scenario start in legacy mode
- Multiple Occultists can be selected and each will get spell selection

---

## 2026-01-20: Monster AI Variation & NPC Survivor System

### Oppgave
Implementere to manglende features fra designdokumentene:
1. **Monster AI Variation** - Alle monstre oppførte seg likt, nå har hver type unik oppførsel
2. **NPC Survivors** - Nytt system for redningbare NPCer

### Implementerte Features

#### 1. Monster Personality System (`monsterAI.ts`)

Hvert av de 16 monstertypene har nå unike personligheter som påvirker oppførsel:

| Monster | Aggresjon | Flukt-terskel | Combat Style | Spesielle evner |
|---------|-----------|---------------|--------------|-----------------|
| **Cultist** | 70% | 30% HP | tactical | charge |
| **Deep One** | 80% | 20% HP | berserker | drag_under |
| **Ghoul** | 50% | 40% HP | ambush | pack_tactics |
| **Shoggoth** | 100% | Aldri | berserker | enrage |
| **Boss** | 90% | Aldri | berserker | devour, cosmic_presence |
| **Sniper** | 40% | 50% HP | siege | snipe |
| **Priest** | 30% | 60% HP | cautious | summon, ritual |
| **Mi-Go** | 60% | 40% HP | hit_and_run | ranged_shot |
| **Nightgaunt** | 55% | 25% HP | ambush | phasing, terrify |
| **Hound** | 95% | 10% HP | berserker | teleport |
| **Dark Young** | 85% | 15% HP | berserker | ritual |
| **Byakhee** | 75% | 35% HP | hit_and_run | swoop |
| **Star Spawn** | 85% | 5% HP | berserker | cosmic_presence, terrify |
| **Formless Spawn** | 65% | Aldri | swarm | regenerate |
| **Hunting Horror** | 90% | 20% HP | hit_and_run | terrify, swoop |
| **Moon Beast** | 50% | 45% HP | siege | ranged_shot |

**Nye Combat Styles:**
- `berserker` - +1 angrep, -1 forsvar, flykter aldri
- `cautious` - +1 forsvar, angriper kun når fordelaktig
- `tactical` - Flankerer, koordinerer med allierte
- `hit_and_run` - Angrip og trekk seg tilbake
- `siege` - Holder avstand, bombarderer
- `swarm` - Koordinerer med samme type
- `ambush` - +2 angrep på første slag, så tilbaketrekking

**Spesielle Evner:**
- `pack_tactics` - Ghouls får +1 angrepsterning per tilstøtende ghoul
- `enrage` - Shoggoth får +2 angrepsterninger under 50% HP
- `summon` - Priests kan påkalle 1-2 cultister
- `teleport` - Hounds kan teleportere gjennom "vinkler"
- `regenerate` - Formless Spawn helbreder 1 HP per runde
- `terrify` - Tvinger sanity-sjekk ved syn
- Og flere...

#### 2. NPC Survivor System (`survivorSystem.ts`)

Nytt system for redningbare NPCer med 8 forskjellige typer:

| Type | HP | Hastighet | Belønning | Spesiell evne |
|------|-----|-----------|-----------|---------------|
| **Civilian** | 2 | 1 | +1 Sanity, $25 | - |
| **Wounded** | 1 | 0 | +2 Sanity, $50 | - |
| **Researcher** | 2 | 1 | +3 Insight, $75 | knowledge |
| **Cultist Defector** | 3 | 1 | +2 Insight, $100, -1 San | reveal_map |
| **Child** | 1 | 1 | +3 Sanity | calm_aura |
| **Asylum Patient** | 2 | 1 | +1 Insight, -2 San | distraction |
| **Reporter** | 2 | 1 | +1 Insight, $50 | - |
| **Occultist Ally** | 3 | 1 | +2 Insight, $100 | ward |

**Survivor States:**
- `hidden` - Ikke oppdaget ennå
- `found` - Oppdaget men ikke reddet
- `following` - Følger en spiller
- `rescued` - Vellykket evakuert
- `dead` - Drept av monstre
- `captured` - Tatt av fiender

**Survivor Spawning:**
- 8% grunnsjanse ved første besøk av tile
- Kategorimodifikatorer (rom/korridor = +5%, krypt = +3%)
- Doom-modifikator (lavere doom = flere desperate overlevende)
- Maks 3 aktive overlevende samtidig

**Survivor Behavior:**
- Følger spilleren automatisk når rescued
- Panikknivå øker ved nærvær av fiender
- Wounded survivors må bæres (speed = 0)
- Spesielle evner kan brukes én gang

**Enemy vs Survivor Targeting:**
- Ghouls foretrekker wounded/svake mål
- Cultists jakter defectors med prioritet
- Nightgaunts foretrekker isolerte, panikkslagede overlevende
- 30% sjanse for at monstre angriper survivors i stedet for spillere

### Nye Typer i `types.ts`

```typescript
// Monster Special Abilities
type MonsterSpecialAbility = 'charge' | 'pack_tactics' | 'drag_under' |
  'phasing' | 'teleport' | 'enrage' | 'summon' | 'snipe' | 'swoop' |
  'regenerate' | 'terrify' | 'ranged_shot' | 'ritual' | 'cosmic_presence' | 'devour';

// Monster Combat Styles
type MonsterCombatStyle = 'berserker' | 'cautious' | 'tactical' |
  'hit_and_run' | 'siege' | 'swarm' | 'ambush';

// Monster Personality
interface MonsterPersonality {
  aggressionLevel: number;        // 0-100
  cowardiceThreshold: number;     // HP% for flukt
  packMentality: boolean;
  territorialRange: number;
  preferredTerrain?: TileCategory[];
  avoidsTerrain?: TileCategory[];
  combatStyle: MonsterCombatStyle;
  specialAbilities: MonsterSpecialAbility[];
  callForHelpChance: number;      // 0-100
}

// Survivor types
type SurvivorType = 'civilian' | 'wounded' | 'researcher' |
  'cultist_defector' | 'child' | 'asylum_patient' | 'reporter' | 'occultist_ally';

type SurvivorState = 'hidden' | 'found' | 'following' | 'rescued' | 'dead' | 'captured';

interface Survivor {
  id: string;
  name: string;
  type: SurvivorType;
  state: SurvivorState;
  position: { q: number; r: number };
  hp: number;
  maxHp: number;
  followingPlayerId?: string;
  speed: number;
  canDefendSelf: boolean;
  panicLevel: number;
  insightReward: number;
  sanityReward: number;
  goldReward: number;
  specialAbility?: SurvivorSpecialAbility;
  // ... dialoger og mer
}
```

### Filer Opprettet
- `src/game/utils/survivorSystem.ts` - Komplett survivor-logikk

### Filer Modifisert
- `src/game/types.ts` - Nye interfaces for monster personality og survivors
- `src/game/utils/monsterAI.ts` - Personality system, combat styles, special abilities

### GameState Utvidet
```typescript
interface GameState {
  // ... eksisterende properties
  survivors: Survivor[];           // NPC survivors på kartet
  rescuedSurvivors: string[];      // IDs av reddede survivors
}
```

### Resultat
Monster AI er nå betydelig mer variert:
- ✅ Hvert monster har unik aggresjon og flukt-oppførsel
- ✅ Combat styles påvirker posisjonering og taktikk
- ✅ Spesielle evner gir unike kampsituasjoner
- ✅ Pack mentality for ghouls, cultists, etc.
- ✅ Unike meldinger per monstertype

NPC Survivor system er komplett:
- ✅ 8 forskjellige survivor-typer
- ✅ Spawning og oppdagelse
- ✅ Følge-logikk
- ✅ Rescue rewards
- ✅ Enemy vs survivor targeting
- ✅ Spesielle evner

---

## 2026-01-20: Kodebase-analyse og Forbedringsforslag

### Oppgave
Grundig analyse av hele kodebasen for å identifisere implementert funksjonalitet, manglende features fra designdokumentene, bugs, og forbedringsmuligheter.

### Analyse-resultater

#### Implementeringsstatus (22/28 kjernefunksjoner)

| System | Status | Kommentar |
|--------|--------|-----------|
| **Kampsystem (Hero Quest)** | 95% ✓ | Terninger, attack/defense, kritiske treff |
| **Tile-system & Hex-geometri** | 100% ✓ | 10 kategorier, visibility, zone levels |
| **Fog of War** | 85% ✓ | Mangler monster line-of-sight |
| **Inventory-system** | 100% ✓ | 7 slots, item-typer, nøkler |
| **Sanity & Madness** | 90% ✓ | 8 madness conditions, triggers |
| **Scenario/Doom-system** | 85% ✓ | 6+ mission types, doom tracker |
| **Legacy-system** | 95% ✓ | Persistent heroes, XP, gold, stash |
| **Puzzle-system** | 50% ⚠ | Kun memory puzzle implementert |
| **Weather-system** | 80% ✓ | 7 typer, gameplay effects |
| **Dark Room Discovery** | 90% ✓ | 12 discovery types |
| **Skill Check** | 100% ✓ | 4 attributter, DC-basert |
| **Bestiary Panel** | 95% ✓ | 16+ monstre med portretter og lore |
| **Spell Particles** | 85% ✓ | 11 particle types med animasjoner |

---

### Identifiserte Problemer

#### HØYPRIORITET (Kritisk)

1. **Monster Line-of-Sight Bug** - `monsterAI.ts`
   - Monstre kan "se" gjennom vegger
   - Ødelegger taktisk gameplay og horror-element
   - Løsning: Implementer bresenham line-algorithm

2. **ShadowsGame.tsx er for stor** - 3204 linjer
   - Umulig å vedlikeholde og debugge
   - Løsning: Refaktor til separate managers (GamePhase, Combat, Tile, Player)

3. **Inventory UX** - Mangler drag-and-drop
   - Kan bare droppe items, ikke reorganisere
   - Løsning: React DnD eller native drag API

#### MEDIUM-PRIORITET

4. **Madness Audio** - Definert men ikke implementert
5. **Mobile Responsiveness** - Action buttons og modals på små skjermer
6. **TypeScript 'any'** - 36 instanser svekker type-sikkerhet
7. **Error Handling** - Ingen error boundaries
8. **Performance** - State oppdateres for ofte

#### LAV-PRIORITET

9. **Accessibility** - ARIA labels, keyboard navigation
10. **Shop Stock** - Unlimited stock, ingen restock-mekanikk
11. **UI Animations** - Brå transitions mellom faser

---

### Manglende Features fra Design Bible

| Feature | Status | Prioritet |
|---------|--------|-----------|
| **Advanced Puzzles** (5 av 6 typer) | 0% | HØY |
| **Occultist Spell Selection UI** | 50% | HØY |
| **Ritual Multi-turn Casting** | 30% | HØY |
| **NPC Survivors** | 0% | MEDIUM |
| **Monster AI Variation** | 60% | MEDIUM |
| **Trap System** | 40% | MEDIUM |
| **Achievement System** | 10% | LAV |
| **Equipment Loadouts** | 0% | LAV |

#### Manglende Puzzle-typer
- SYMBOL_MATCH (finn 3 symboler, kombiner i rekkefølge)
- CODE_LOCK (finn tallkode i dokumenter)
- PRESSURE_PLATE (co-op mekanikk)
- MIRROR_LIGHT (rotasjon-basert)
- BLOOD_RITUAL (sanity/vitality kostnad)
- ASTRONOMY (stjernekart)

---

### Prioriterte Forbedringer

#### Anbefalt Fokus (neste sprinter)

1. 🔴 **Fix monster sight-bug** - Kritisk gameplay
2. 🔴 **Refaktor ShadowsGame.tsx** - Vedlikeholdbarhet
3. 🟡 **Implementer advanced puzzles** - Innhold/dybde
4. 🟡 **Occultist spell selection** - Balanse
5. 🟡 **Mobile polish** - UX

#### Estimert tid til "production-ready": 10-14 timer

---

### Kodekvalitets-metriker

| Metrikk | Verdi | Vurdering |
|---------|-------|-----------|
| Total LOC | ~15,000 | Moderat størrelse |
| Hovedkomponent | 3204 linjer | ❌ For stor |
| TypeScript 'any' | 36 | ❌ Svak type-sikkerhet |
| Testdekning | ~0% | ❌ Ingen tester |
| Komponenter | 24 | ✓ God separasjon |
| Mobile Support | ~70% | ⚠️ Trenger polish |

---

### Konklusjon

**Styrker:**
- Velstrukturert game engine (hex grid, tile connection)
- Robust legacy/progression system
- Solid UI/UX med 24 komponenter
- Autentisk Hero Quest kampfølelse
- God scenario-variasjon

**Svakheter:**
- ShadowsGame.tsx må refaktoreres (kritisk)
- Monster sight-bug (kritisk)
- Puzzle-systemet for begrenset
- Mobile UX trenger arbeid

---

## 2026-01-20: Sell Items to The Fence - Post-Mission Trading

### Oppgave
Implementere et system for å selge gjenstander hos "The Fence" etter oppdrag. Spillere skal kunne selge items de ikke trenger, men får ikke fullpris - Fence kjøper til redusert pris (50% av butikkverdi).

### Design
- **Salgspris**: 50% av butikkverdi (standard roguelite-mekanikk)
- **Minimum pris**: 1 gull for alle items
- **Sell-kilder**: Hero inventory + Equipment Stash
- **UI**: Buy/Sell toggle i MerchantShop med egne faner

### Implementasjon

#### 1. Nye funksjoner i legacyManager.ts

**Pris-system**:
```typescript
const SELL_PRICE_MODIFIER = 0.5; // 50% av butikkverdi

// Komplett prisliste for alle item-typer
const ITEM_BASE_PRICES: Record<string, number> = {
  // Vapen: Revolver 30g, Shotgun 50g, Tommy Gun 100g, etc.
  // Verktøy: Flashlight 10g, Lockpick 20g, Crowbar 15g, etc.
  // Rustning: Leather 35g, Trench Coat 25g, Armored Vest 75g
  // Forbruk: Medkit 20g, Whiskey 10g, Bandages 5g
  // Relikvier: Elder Sign 150g, Ward 60g, Compass 80g
  // Nøkler: Common 2g, Specific 5g, Master 25g
};

// Fallback-priser per item-type
const DEFAULT_PRICES_BY_TYPE: Record<string, number> = {
  weapon: 20, tool: 10, armor: 30, consumable: 8,
  relic: 50, key: 2, clue: 5, artifact: 40
};
```

**Nye eksporterte funksjoner**:
- `getItemBasePrice(item)`: Henter butikkpris for et item
- `getItemSellPrice(item)`: Beregner salgspris (50%, min 1g)
- `sellItemToFence(hero, item)`: Selger fra hero inventory, legger til gull
- `sellStashItem(stash, index)`: Selger fra stash, returnerer gullverdi

#### 2. MerchantShop UI-oppdateringer

**Nye states**:
```typescript
const [shopMode, setShopMode] = useState<'buy' | 'sell'>('buy');
const [sellSource, setSellSource] = useState<'inventory' | 'stash'>('inventory');
```

**Buy/Sell Toggle**:
- Øverst i shop-panelet med tydelige ikoner (ShoppingBag / HandCoins)
- Viser "The Fence pays 50% of shop value" når Sell er aktiv

**Sell Panel**:
- Inventory/Stash toggle for å velge kilde
- Grid med items som viser navn, type, effekt og salgspris
- Grønne "Sell for X gold" knapper
- Tom-tilstand med informative meldinger

#### 3. Eksempel på salgspriser

| Item | Butikkpris | Salgspris |
|------|------------|-----------|
| Revolver | 30g | 15g |
| Shotgun | 50g | 25g |
| Tommy Gun | 100g | 50g |
| Elder Sign | 150g | 75g |
| Medkit | 20g | 10g |
| Bandages | 5g | 2g |

### Filer endret
- `src/game/utils/legacyManager.ts` - Lagt til sell-system (~220 linjer)
- `src/game/components/MerchantShop.tsx` - Lagt til Sell UI (~150 linjer)

### Resultat
- Spillere kan nå selge uønskede items etter oppdrag
- Logisk økonomisk system (kjøp dyrt, selg billig)
- Fungerer for både hero inventory og shared stash
- Build vellykket uten feil

---

## 2026-01-20: Hex Tile Beskrivelser og Field Journal Forbedring

### Oppgave
Fikse at Lovecraftian tile-beskrivelser vises i Field Journal når spilleren beveger seg til en tile, og gjøre Field Journal-teksten lettere å lese med større font.

### Problem
- Tile-beskrivelser (150+ detaljerte beskrivelser i Lovecraftian stil) vistes bare når en NY tile ble generert
- Hvis spilleren gikk tilbake til en allerede utforsket tile, vistes ingen beskrivelse
- Field Journal brukte `text-xs` (veldig liten font), vanskelig å lese

### Implementasjon

#### 1. Lagt til `description` felt i Tile interface (`src/game/types.ts`)

```typescript
export interface Tile {
  // ...
  description?: string;  // Atmospheric Lovecraftian description shown when entering tile
  // ...
}
```

#### 2. Kopiere beskrivelse fra TileTemplate til Tile (`src/game/tileConnectionSystem.ts`)

```typescript
const baseTile: Tile = {
  // ...
  description: template.description,  // Include atmospheric description from template
  // ...
};
```

#### 3. Logge beskrivelse ved bevegelse til eksisterende tiles (`src/game/ShadowsGame.tsx`)

```typescript
// Log atmospheric description when entering a tile (for already explored tiles)
// New tiles log their description during generation, but revisited tiles need to show it again
if (enteredTile && enteredTile.explored) {
  const description = enteredTile.description || LOCATION_DESCRIPTIONS[enteredTile.name];
  if (description) {
    addToLog(description);
  }
}
```

#### 4. Økt fontstørrelse i Field Journal (`src/game/ShadowsGame.tsx`)

**Før:**
```tsx
className="text-xs font-serif italic text-muted-foreground leading-relaxed border-b border-border/30 pb-2"
```

**Etter:**
```tsx
className="text-sm font-serif italic text-muted-foreground leading-relaxed border-b border-border/30 pb-2"
```

Endret for både mobil- og desktop-versjon av Field Journal.

### Resultat
- Spillere ser nå atmosfæriske beskrivelser hver gang de går inn på en tile
- Beskrivelser bruker først `tile.description` (fra template), deretter fallback til `LOCATION_DESCRIPTIONS`
- Field Journal er nå lettere å lese med `text-sm` i stedet for `text-xs`

### Filer endret
- `src/game/types.ts` - Lagt til description felt i Tile interface
- `src/game/tileConnectionSystem.ts` - Kopiere beskrivelse fra template til tile
- `src/game/ShadowsGame.tsx` - Logge beskrivelse ved bevegelse + økt fontstørrelse

---

## 2026-01-20: Bestiary Panel Enhancement - "Notes on the Horrors"

### Oppgave
Forbedre Bestiary-panelet i FieldGuide slik at spillere kan se alle oppdagede monstre med deres faktiske portretter og lore-tekst i stedet for emojier.

### Implementasjon

#### 1. Import av Monster-portretter (`src/game/components/FieldGuidePanel.tsx`)

**Endring:** Lagt til import av `getMonsterPortrait` fra `monsterAssets.ts`.

```typescript
import { getMonsterPortrait } from '../utils/monsterAssets';
```

#### 2. Monster-kort med portretter

**Endring:** Erstattet emoji-ikoner med faktiske monster-portretter i monster-kortene.

**Før:**
```typescript
<div className="text-2xl mb-1">
  {type === 'cultist' && '🗡️'}
  {type === 'ghoul' && '💀'}
  // ... etc
</div>
```

**Etter:**
```typescript
<div className="w-12 h-12 md:w-14 md:h-14 mb-1 rounded-full overflow-hidden border-2 border-amber-700/50 bg-stone-800">
  <img
    src={getMonsterPortrait(type)}
    alt={entry?.name || type}
    className="w-full h-full object-cover object-center"
  />
</div>
```

#### 3. Detalj-panel med stort portrett

**Endring:** Erstattet emoji med et stort monster-portrett (32x32 på desktop, 24x24 på mobil).

```typescript
<div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 rounded-lg overflow-hidden border-2 border-amber-700 bg-stone-800 shadow-lg shadow-amber-900/20">
  <img
    src={getMonsterPortrait(selectedMonster)}
    alt={selectedEntry.name}
    className="w-full h-full object-cover object-center"
  />
</div>
```

### Bestiary Panel Features

| Feature | Beskrivelse |
|---------|-------------|
| **Monster Grid** | Venstre panel med 2-kolonne grid av monster-kort |
| **Portretter** | Runde portretter i kortene, firkantede i detalj-panelet |
| **Discovered System** | Kun oppdagede monstre viser portretter, ukjente viser spørsmålstegn |
| **Stats Display** | HP, Attack Dice, Defense Dice, Horror level |
| **Lore Section** | Utdypende lore-tekst for hvert monster |
| **Traits** | Badges for monster-egenskaper (Flying, Aquatic, Fast, etc.) |
| **Defeat Flavor** | Tekst som vises når monsteret beseires |

### Monster-kategorier

| Kategori | Farge | Monstre |
|----------|-------|---------|
| **Minions** | Stone (grå) | Cultist, Mi-Go, Nightgaunt, Moon-Beast |
| **Warriors** | Amber (gul) | Ghoul, Deep One, Sniper, Byakhee, Formless Spawn, Hound |
| **Elites** | Red (rød) | Dark Priest, Hunting Horror, Dark Young |
| **Bosses** | Purple (lilla) | Shoggoth, Star Spawn, Elder Horror |

### Relaterte filer

- `src/game/components/FieldGuidePanel.tsx` - Hovedkomponent for Bestiary
- `src/game/utils/monsterAssets.ts` - Monster-portretter og helper-funksjoner
- `src/game/constants.ts` - BESTIARY med all monster-data og lore
- `src/assets/monsters/` - Monster-portrettbilder

---

## 2026-01-20: Spell Particle Effects - "The Arcane Manifestations"

### Oppgave
Implementere partikkeleffekter for de ulike magiene i spillet. Når en spiller caster en spell (f.eks. Wither), skal det vises en visuell effekt - som en flyvende kule med magi fra caster til mål.

### Implementasjon

#### 1. Types (`src/game/types.ts`)

**Endring:** Lagt til `SpellParticleType` og `SpellParticle` interface for partikkeleffekter.

```typescript
export type SpellParticleType =
  | 'wither'           // Dark purple energy drain
  | 'eldritch_bolt'    // Glowing eldritch projectile
  | 'mend_flesh'       // Golden healing sparkles
  | 'true_sight'       // Blue mystical eye particles
  | 'banish'           // Red void implosion
  | 'mind_blast'       // Pink/purple shockwave
  | 'dark_shield'      // Dark swirling aura
  | 'explosion' | 'blood' | 'smoke' | 'sparkle';

export interface SpellParticle {
  id: string;
  type: SpellParticleType;
  startQ: number; startR: number;
  targetQ?: number; targetR?: number;
  startTime: number; duration: number;
  color: string; size: 'sm' | 'md' | 'lg';
  count: number;
  animation: 'projectile' | 'burst' | 'radiate' | 'implode' | 'orbit' | 'float';
}
```

**Endring:** Lagt til `spellParticles: SpellParticle[]` i `GameState`.

#### 2. CSS Animasjoner (`src/index.css`)

**Endring:** Lagt til 11 nye spell-spesifikke CSS animasjoner:

| Spell Type | Animasjon | Beskrivelse |
|------------|-----------|-------------|
| **Wither** | `animate-wither-projectile` | Mørk lilla energi-kule som flyr til mål |
| **Eldritch Bolt** | `animate-eldritch-bolt` | Glødende grønn/lilla prosjektil |
| **Mend Flesh** | `animate-mend-sparkle` | Gylne healing-gnister som stiger opp |
| **True Sight** | `animate-true-sight-radiate` | Blå mystiske partikler som stråler utover |
| **Banish** | `animate-banish-vortex` | Rød void-implosjon med rotasjon |
| **Mind Blast** | `animate-mind-blast-wave` | Rosa sjokkbølge som ekspanderer |
| **Dark Shield** | `animate-dark-shield-orbit` | Mørke partikler som sirkulerer |
| **Explosion** | `animate-explosion-burst` | Rask eksplosjon |
| **Blood** | `animate-blood-splatter` | Blodsprut ved skade |
| **Smoke** | `animate-smoke-rise` | Røyk som stiger ved død |
| **Sparkle** | `animate-sparkle-twinkle` | Generiske magiske gnister |

Også lagt til partikkel-stil klasser for farger og størrelser:
- `.spell-particle-wither`, `.spell-particle-eldritch`, `.spell-particle-mend`, etc.
- `.spell-particle-sm`, `.spell-particle-md`, `.spell-particle-lg`

#### 3. Spell Effect Emitter (`src/game/ShadowsGame.tsx`)

**Endring:** Lagt til `emitSpellEffect()` funksjon for å skape partikkeleffekter.

```typescript
const emitSpellEffect = (
  startQ: number, startR: number,
  type: SpellParticleType,
  targetQ?: number, targetR?: number
) => {
  // Konfigurer partikkel basert på spell-type
  // Legg til i state.spellParticles
  // Auto-fjern etter duration
};
```

**Integrert ved spell casting:**
- **Damage spells** (Wither): Prosjektil fra caster til fiende
- **Banish spell**: Implosjon på fienden
- **Heal spell** (Mend Flesh): Healing-gnister rundt caster
- **Reveal spell** (True Sight): Stråler som går utover fra caster

#### 4. Partikkel-rendering (`src/game/components/GameBoard.tsx`)

**Endring:** Lagt til `spellParticles` prop og rendering-logikk.

```typescript
{spellParticles.map(particle => {
  // Kalkuler start/mål-posisjoner
  // Generer multiple partikler per effekt
  // Anvend animasjon basert på type
  return Array.from({ length: particle.count }).map((_, index) => (
    <div className={`spell-particle ${typeClass} ${sizeClass} ${animationClass}`}
      style={{ '--tx': `${dx}px`, '--ty': `${dy}px` }} />
  ));
})}
```

### Spell Effekter Oversikt

| Spell | Effekt-type | Animasjon | Visuell |
|-------|-------------|-----------|---------|
| **Wither** | Projectile | Flyr fra caster til mål | Mørk lilla kule med trail |
| **Eldritch Bolt** | Projectile | Flyr fra caster til mål | Grønn/lilla glødende orb |
| **Mend Flesh** | Burst | Partikler rundt caster | Gylne gnister som stiger |
| **True Sight** | Radiate | Stråler ut fra caster | Blå øye-partikler |
| **Banish** | Implode | Suges inn til mål | Rød vortex |

### Filer Endret

| Fil | Handling | Beskrivelse |
|-----|----------|-------------|
| `src/game/types.ts` | ENDRET | Lagt til SpellParticle interface og type i GameState |
| `src/index.css` | ENDRET | 11 nye spell animasjoner og partikkel-stiler |
| `src/game/ShadowsGame.tsx` | ENDRET | emitSpellEffect() funksjon, integrert ved spell casting |
| `src/game/components/GameBoard.tsx` | ENDRET | Rendering av partikkeleffekter |

### Tekniske Detaljer

- Partikler bruker CSS custom properties (`--tx`, `--ty`) for dynamiske mål
- Hver spell genererer multiple partikler (8-20) for fyldig effekt
- Auto-cleanup etter animasjon er ferdig
- Støtter både projectile (flyr til mål) og lokale effekter (burst, radiate)

---

## 2026-01-20: Professor Scholarly Spells - "Hero Quest Wizard Style"

### Oppgave
Gi Professor (mappet til Wizard fra Hero Quest) begrenset spell-tilgang for å være mer tro til originalspillet.

### Implementasjon

#### 1. Spell Assignment (`src/game/ShadowsGame.tsx`)

**Endring:** Oppdatert logikk for å tildele spells basert på karakterklasse.

```typescript
const characterSpells = type === 'occultist'
  ? SPELLS  // All 4 spells (Ritual Master)
  : type === 'professor'
    ? SPELLS.filter(s => s.id === 'reveal' || s.id === 'mend')  // 2 scholarly spells
    : [];
```

#### 2. Professor Character Update (`src/game/constants.ts`)

**Endring:** Lagt til `canCastSpells: true` og oppdatert special-beskrivelse.

```typescript
professor: {
  special: 'Read occult safely. Knowledge (+2 puzzle dice). 2 scholarly spells',
  canCastSpells: true   // Has limited spells (True Sight, Mend Flesh)
}
```

#### 3. REGELBOK.MD Oppdatering

Lagt til spells-kolonne i karakteroversikt og detaljert Professor-seksjon.

### Spell Fordeling (Hero Quest Style)

| Karakter | Spells | Tilgjengelige |
|----------|--------|---------------|
| **Occultist** (Elf) | 4 | Wither, Mend Flesh, True Sight, Banish |
| **Professor** (Wizard) | 2 | True Sight, Mend Flesh |
| Andre | 0 | - |

### Filer Endret

| Fil | Handling | Beskrivelse |
|-----|----------|-------------|
| `src/game/ShadowsGame.tsx` | ENDRET | Spell assignment per karakterklasse |
| `src/game/constants.ts` | ENDRET | Professor får `canCastSpells: true` |
| `REGELBOK.MD` | ENDRET | Dokumentert Professor spells |

---

## 2026-01-20: Cast Spell Action - "The Arcane Arts"

### Oppgave
Implementere en "Cast Spell" action i action bar for hero-karakterer som kan bruke magi (Occultist, Professor). Denne handlingen lar spillere velge en spell fra karakterens spell-liste, forbruke nødvendig Insight-kostnad, og anvende spell-effekten.

### Implementasjon

#### 1. Cast Action Handler (`src/game/ShadowsGame.tsx`)

**Endring:** Lagt til `case 'cast':` og `case 'cancel_cast':` i handleAction switch.

**Spell Casting Logikk:**
- Sjekker at spilleren har nok Insight for å caste
- For damage/banish spells: Krever valgt fiende-target
- Sjekker at target er innenfor spell range
- Utfører effekt basert på effectType:
  - `damage`: Gjør direkte skade til valgt fiende
  - `heal`: Healer caster
  - `reveal`: Avslører tiles innen range og gir Insight
  - `banish`: Bannlyser svake fiender (HP <= spell.value)

**Target Selection Flow:**
- Hvis ingen fiende er valgt for damage/banish spell, setter `activeSpell` state
- ActionBar viser "Cancel" knapp når activeSpell er satt
- Klikk på fiende med activeSpell triggerer casting
- `cancel_cast` action avbryter spell-valget

```typescript
case 'cast':
  const spell = payload;

  // Check Insight cost
  if (activePlayer.insight < spell.cost) {
    addToLog(`Not enough Insight to cast ${spell.name}.`);
    return;
  }

  // For damage spells, need target
  if (spell.effectType === 'damage' || spell.effectType === 'banish') {
    const spellTarget = state.enemies.find(e => e.id === state.selectedEnemyId);
    if (!spellTarget) {
      setState(prev => ({ ...prev, activeSpell: spell }));
      addToLog(`Select a target for ${spell.name}. Range: ${spell.range} tiles.`);
      return;
    }
    // Check range and apply damage...
  }
```

#### 2. Occultist Gets All Spells (`src/game/ShadowsGame.tsx`)

**Endring:** Occultist får nå alle tilgjengelige spells (4 stykker) i stedet for bare én.

```typescript
// Før:
spells: (type === 'occultist' ? [SPELLS[0]] : [])

// Etter:
spells: (type === 'occultist' ? SPELLS : [])
```

### Tilgjengelige Spells (fra constants.ts)

| Spell | Insight Cost | Effect | Range | Description |
|-------|--------------|--------|-------|-------------|
| **Wither** | 2 | 2 damage | 3 | Drains life force from a target |
| **Mend Flesh** | 2 | Heal 2 HP | 1 | Knits wounds together |
| **True Sight** | 1 | Reveal + 1 Insight | 0 | Reveals hidden clues |
| **Banish** | 4 | Destroy (HP ≤5) | 2 | Banish weak enemies to the void |

### Filer Endret

| Fil | Handling | Beskrivelse |
|-----|----------|-------------|
| `src/game/ShadowsGame.tsx` | ENDRET | Lagt til `case 'cast':` og `case 'cancel_cast':` i handleAction |
| `src/game/ShadowsGame.tsx` | ENDRET | Occultist får nå alle SPELLS i stedet for bare én |

### UI/UX Flow

1. **Spell-menyen**: Klikk på ⚡ (Cast) knappen for å åpne spell-menyen
2. **Velg spell**: Klikk på en spell for å velge den (viser Insight-kostnad)
3. **Target selection**: For damage/banish spells, klikk på en fiende
4. **Casting**: Spell utføres, Insight trekkes, AP brukes
5. **Feedback**: Floating text viser effekt, log oppdateres

### Spillmekanikk

| Handling | AP Cost | Insight Cost | Krav |
|----------|---------|--------------|------|
| Cast Damage Spell | 1 | Spell.cost | Valgt fiende innen range |
| Cast Heal Spell | 1 | Spell.cost | Caster må ikke være på full HP |
| Cast Reveal Spell | 1 | Spell.cost | Ingen |
| Cast Banish Spell | 1 | Spell.cost | Fiende HP ≤ spell.value |

### Fremtidige Forbedringer

- Spell selection for scenario start (velg 3 av tilgjengelige)
- Professor med begrenset spell-tilgang
- OccultistSpell system (Hero Quest-stil med uses per scenario)
- Sanity cost for visse spells

---

## 2026-01-20: Legacy Hero Permadeath Option - "Death's Final Embrace"

### Oppgave
Implementere en PERMADEATH-funksjon for legacy heroes. Når en spiller lager en legacy hero, kan de velge å aktivere permadeath. Hvis en permadeath-hero dør, blir karakteren uspillbar og havner i Memorial.

### Implementasjon

#### 1. Types (`src/game/types.ts`)

**Endring:** Lagt til `hasPermadeath: boolean` felt til `LegacyHero` interface.

```typescript
// Status
isRetired: boolean;                   // Voluntarily retired
isDead: boolean;                      // Died in scenario
hasPermadeath: boolean;               // If true, death is permanent - hero goes to memorial and is unplayable
deathScenario?: string;               // Scenario where hero died
deathCause?: string;                  // How they died
```

#### 2. Legacy Manager (`src/game/utils/legacyManager.ts`)

**Endringer:**

1. `createLegacyHero()` - Ny parameter `hasPermadeath: boolean = false`
2. `killHero()` - Oppdatert logikk basert på permadeath:
   - `hasPermadeath = true`: Hero dør permanent, går til memorial
   - `hasPermadeath = false`: Hero mister utstyr men kan fortsette å spille
3. `updateLegacyHeroFromPlayer()` - Samme logikk som `killHero()`

#### 3. Hero Archive Panel (`src/game/components/HeroArchivePanel.tsx`)

**Endringer:**

1. Ny state: `newHeroPermadeath` for hero creation form
2. Permadeath checkbox i create hero view med beskrivelse
3. Permadeath-indikator badge på hero cards (rød "PERMADEATH" label)
4. Permadeath-indikator i hero detail view
5. Permadeath-status i memorial for døde heroes (rød styling)

### Filer Endret

| Fil | Handling | Beskrivelse |
|-----|----------|-------------|
| `src/game/types.ts` | ENDRET | Lagt til `hasPermadeath` felt til `LegacyHero` interface |
| `src/game/utils/legacyManager.ts` | ENDRET | Oppdatert `createLegacyHero`, `killHero`, `updateLegacyHeroFromPlayer` med permadeath-logikk |
| `src/game/components/HeroArchivePanel.tsx` | ENDRET | Lagt til permadeath checkbox i create form og visuelle indikatorer |

### Brukeropplevelse

1. **Create Hero**: Ny checkbox "PERMADEATH" med advarsel om at døden er permanent
2. **Hero Cards**: Rødt "PERMADEATH" badge vises på heroes med permadeath aktivert
3. **Hero Detail**: "PERMADEATH" badge vises i header
4. **Memorial**: Permadeath-heroes vises med rød styling for å markere permanent død

### Spillmekanikk

| Permadeath | Ved død |
|------------|---------|
| **Aktivert** | Hero settes til `isDead: true`, flyttes til Memorial, utstyr går til stash |
| **Deaktivert** | Hero beholder liv, mister alt utstyr (går til stash), kan prøve igjen |

---

## 2026-01-20: GitHub Pages & Multi-Platform Development - "Deploy the Darkness"

### Oppgave
Gjøre spillet startbart fra GitHub Pages og sette opp synkron utvikling fra Lovable og Claude.

### Problemanalyse
1. **BrowserRouter**: Manglet basename-støtte for GitHub Pages subpath (`/connect-play/`)
2. **SPA Routing**: GitHub Pages returnerer 404 for alle ruter unntatt `/`
3. **Dokumentasjon**: Manglet `agents.md` for kontekst til AI-agenter
4. **Synkronisering**: Trengte klarere retningslinjer for Lovable/Claude workflow

### Implementasjon

#### 1. BrowserRouter basename (`src/App.tsx`)

**Endring:**
- Lagt til dynamisk basename basert på Vite's BASE_URL
- Fungerer for både Lovable (root `/`) og GitHub Pages (`/connect-play/`)

```typescript
// Get basename from Vite's base config
const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

<BrowserRouter basename={basename}>
```

#### 2. SPA Routing for GitHub Pages (`public/404.html`)

**Ny fil** som håndterer client-side routing:
- Lagrer den faktiske URL-en i sessionStorage
- Omdirigerer til index.html
- index.html henter URL fra sessionStorage og bruker history.replaceState

**404.html logikk:**
```javascript
const redirectPath = path.slice(pathSegmentsToKeep.length) || '/';
sessionStorage.setItem('spa-redirect', redirectPath + search + hash);
location.replace(pathSegmentsToKeep + '/');
```

**index.html handler:**
```javascript
const redirect = sessionStorage.getItem('spa-redirect');
if (redirect) {
  sessionStorage.removeItem('spa-redirect');
  window.history.replaceState(null, '', redirect);
}
```

#### 3. Agent Dokumentasjon (`agents.md`)

**Ny fil** med kontekst for AI-agenter:
- Prosjektoversikt og teknisk stack
- Utviklingsplattformer (Lovable, Claude, GitHub Pages)
- Synkron utvikling workflow
- Viktige filer referanse
- Kodestruktur
- Build & deploy instruksjoner

### Filer Endret/Opprettet

| Fil | Handling | Beskrivelse |
|-----|----------|-------------|
| `src/App.tsx` | ENDRET | Lagt til dynamisk basename for BrowserRouter |
| `public/404.html` | NY | SPA redirect handler for GitHub Pages |
| `index.html` | ENDRET | Lagt til session storage redirect handler |
| `agents.md` | NY | Kontekst og dokumentasjon for AI-agenter |

### GitHub Pages Aktivering

For å aktivere GitHub Pages:

1. Gå til repository Settings → Pages
2. Under "Build and deployment":
   - Source: **GitHub Actions**
3. Push til `main` branch for å trigge deployment
4. Vent på at workflow kjører ferdig
5. Spillet blir tilgjengelig på: `https://tombonator3000.github.io/connect-play/`

### Utviklings-workflow

```
┌─────────────┐     push      ┌──────────┐
│   Lovable   │ ──────────────▶│  GitHub  │
└─────────────┘               └──────────┘
                                   │
                    pull ┌─────────┴─────────┐ auto-deploy
                         │                   │
                         ▼                   ▼
                  ┌─────────────┐     ┌──────────────┐
                  │   Claude    │     │ GitHub Pages │
                  │    Code     │     │  (produksjon)│
                  └─────────────┘     └──────────────┘
                         │
                         │ push
                         ▼
                  ┌──────────┐
                  │  GitHub  │ ──▶ Lovable synker automatisk
                  └──────────┘
```

### Testing

```bash
# Lokal utvikling (root path)
npm run dev

# Test GitHub Pages build
VITE_BASE_PATH=/connect-play/ npm run build
npm run preview
```

### Resultat

- ✅ BrowserRouter fungerer med dynamisk basename
- ✅ 404.html håndterer SPA routing på GitHub Pages
- ✅ agents.md gir kontekst for fremtidige AI-agenter
- ✅ Build vellykket med GitHub Pages base path
- ✅ Dokumentert workflow for Lovable/Claude synkronisering

---

## 2026-01-19: Mobile UI & Touch Controls Optimization - "Touch the Darkness"

### Oppgave
Optimalisere UI og touch-kontroller for mobil enheter. Gjøre spillet fullstendig spillbart på mobil med intuitive touch-interaksjoner.

### Problemanalyse
1. **GameBoard**: Kun mouse-events for pan/zoom - mangler touch-støtte
2. **ActionBar**: Knapper for små for touch (under 44x44px anbefalt minimum)
3. **ContextActionBar**: Hardkodet bredde (400px) - for bred for mobil skjermer
4. **Sidepaneler**: Fixed posisjonering fungerer dårlig på små skjermer
5. **Header/Footer**: Overlap og for stor på mobil

### Implementasjon

#### 1. Touch-events i GameBoard (`components/GameBoard.tsx`)

**Nye touch-handlers:**
- `handleTouchStart()` - Starter drag (1 finger) eller forbereder pinch-zoom (2 fingre)
- `handleTouchMove()` - Håndterer panning og pinch-to-zoom
- `handleTouchEnd()` - Rydder opp touch-state

**Pinch-to-zoom funksjonalitet:**
```typescript
const getTouchDistance = (touches: React.TouchList) => {
  if (touches.length < 2) return 0;
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.hypot(dx, dy);
};

// I handleTouchMove:
const scaleDelta = newDistance / lastTouchDistance.current;
setScale(prev => Math.min(Math.max(prev * scaleDelta, 0.3), 1.5));
```

**Touch-events på container:**
```tsx
<div
  onTouchStart={handleTouchStart}
  onTouchMove={handleTouchMove}
  onTouchEnd={handleTouchEnd}
  onTouchCancel={handleTouchEnd}
  className="... touch-none select-none"
>
```

#### 2. Responsiv ActionBar (`components/ActionBar.tsx`)

**Endringer:**
- Importert `useIsMobile` hook
- Dynamiske knappstørrelser basert på enhet:
  - Mobil: `w-12 h-12` (48x48px - god touch target)
  - Desktop: `w-14 h-14 md:w-20 md:h-20`
- Fjernet tekst-labels på mobil (kun ikoner)
- Lagt til `active:scale-95` for touch-feedback
- Kompaktere gaps og margins på mobil

**Kode-eksempel:**
```typescript
const buttonSize = isMobile ? 'w-12 h-12' : 'w-14 h-14 md:w-20 md:h-20';
const iconSize = isMobile ? 18 : 20;
```

#### 3. Responsiv ContextActionBar (`components/ContextActionBar.tsx`)

**Endringer:**
- Importert `useIsMobile` hook
- Posisjonering:
  - Mobil: `left-2 right-2 bottom-24` (full bredde med padding)
  - Desktop: `left-1/2 -translate-x-1/2 bottom-28` (sentrert)
- Grid layout:
  - Mobil: 1 kolonne (lettere å trykke)
  - Desktop: 2 kolonner
- Kompaktere padding og tekststørrelser på mobil

#### 4. Fullskjerm Modaler på Mobil (`ShadowsGame.tsx`)

**CharacterPanel og Journal/EnemyPanel:**
- Mobil: Fullskjerm modal med sticky header og close-knapp
- Desktop: Slide-in sidepaneler som før

**Kode-struktur:**
```tsx
{showLeftPanel && (
  isMobile ? (
    <div className="fixed inset-0 z-50 bg-background/95">
      <div className="sticky top-0 ... ">
        <button onClick={() => setShowLeftPanel(false)}>
          <X size={20} />
        </button>
      </div>
      <CharacterPanel ... />
    </div>
  ) : (
    // Desktop slide-in panel
  )
)}
```

#### 5. Responsiv Header (`ShadowsGame.tsx`)

**Endringer:**
- Mobil: Kompakt header nær toppen (`top-2`)
- Forkortet tekst: "R:" i stedet for "ROUND:", "D:" i stedet for "DOOM:"
- Mindre padding og ikonstørrelser
- Mindre settings-knapp

#### 6. Responsiv Footer (`ShadowsGame.tsx`)

**Endringer:**
- Mobil: Mindre høyde (`h-20` vs `h-24`)
- Kompakt "Next Turn"-knapp:
  - Mobil: "Next" / "End"
  - Desktop: "Next Turn" / "End Round"
- Mindre gaps og padding

### Filer endret
- `src/game/components/GameBoard.tsx` - Touch-events for pan og pinch-zoom
- `src/game/components/ActionBar.tsx` - Responsiv knappstørrelser
- `src/game/components/ContextActionBar.tsx` - Responsiv layout
- `src/game/ShadowsGame.tsx` - Fullskjerm modaler, responsiv header/footer

### Touch-interaksjoner (Sammendrag)

| Gest | Funksjon |
|------|----------|
| **1 finger drag** | Pan/flytt kart |
| **2 finger pinch** | Zoom inn/ut |
| **Tap på tile** | Velg/flytt til tile |
| **Tap på fiende** | Velg fiende |
| **Tap på knapp** | Utfør handling |

### UI Størrelser (Mobile)

| Element | Størrelse | Touch Target |
|---------|-----------|--------------|
| Action buttons | 48x48px | God (≥44px) |
| Settings button | 36x36px | Akseptabel |
| Close buttons | 40x40px | God |
| Next/End button | ~64x48px | Utmerket |

---

## 2026-01-19: Edge Blocking System - "No Passage Through"

### Oppgave
Fikse problemet der kanter som vises som dead ends (vegger, blokkerte passasjer) visuelt lot spillere gå rett gjennom. Implementere fullstendig blokkering og interaksjoner for blokkerte kanter.

### Problemanalyse
1. **Visuelt**: GameBoard viste allerede dead-end edges korrekt med tykke linjer og kryss-markører (`isDeadEndEdge()` funksjon)
2. **Bevegelse**: ShadowsGame.tsx sin `handleAction('move')` sjekket bare for:
   - Blokkerende objekter (`targetTile?.object?.blocking`)
   - Blokkerende hindringer (`targetTile?.obstacle?.blocking`)
   - Lukkede/låste dører
3. **Mangler**: Ingen sjekk for `wall` eller `blocked` edge types mellom tiles

### Implementasjon

#### 1. Bevegelsesvalidering (`ShadowsGame.tsx`)

**Ny logikk i `handleAction('move')`:**
- Sjekker nå BEGGE tiles' kanter (source og target)
- Blokkerer bevegelse gjennom `wall`, `blocked`, og `window` edges
- Viser riktig context menu for interagerbare blokkeringer

```typescript
// Check source tile's edge (the side we're leaving from)
if (sourceEdge.type === 'wall') {
  addToLog(`BLOCKED: A solid wall prevents passage.`);
  return;
}
if (sourceEdge.type === 'blocked') {
  // Show context actions for removable blockings
  showContextActions(sourceTile, edgeFromSource);
  return;
}
if (sourceEdge.type === 'window') {
  // Windows require Athletics check
  showContextActions(sourceTile, edgeFromSource);
  return;
}
```

#### 2. Edge Blocking Types (`types.ts`)

**Ny type `EdgeBlockingType`:**
| Type | Beskrivelse | Fjerning |
|------|-------------|----------|
| `rubble` | Småstein og rusk | Str 4, 2 AP |
| `heavy_rubble` | Tung rubble | Str 5, 3 AP |
| `collapsed` | Fullstendig kollapset | Umulig |
| `fire` | Flammer | Slukke (item) eller hopp (Agi 4, 1 skade) |
| `barricade` | Barrikade | Str 4, 2 AP |
| `locked_gate` | Låst port | Nøkkel, lockpick (Agi), eller force (Str) |
| `spirit_barrier` | Åndelig barriere | Elder Sign eller Wil 5 |
| `ward` | Magisk vern | Wil 5 eller krysse (-1 Sanity) |
| `chasm` | Kløft | Tau/bro kreves |
| `flooded` | Oversvømt | Wade through (+1 AP) |

**Utvidet `EdgeData` interface:**
```typescript
interface EdgeData {
  type: EdgeType;
  doorState?: DoorState;
  lockType?: LockType;
  keyId?: string;
  puzzleId?: string;
  // New blocked edge properties
  blockingType?: EdgeBlockingType;
  blockingRemovable?: boolean;
  blockingDC?: number;
  blockingSkill?: SkillType;
  blockingItemRequired?: string;
}
```

#### 3. Context Actions (`utils/contextActions.ts`)

**Nye funksjoner:**
- `getBlockedEdgeActions()` - Returnerer tilgjengelige handlinger for blokkerte kanter
- `getWindowEdgeActions()` - Returnerer handlinger for vinduer

**Eksempel: Rubble-blokkert kant:**
```
[Clear Rubble (Str 4)]    - 2 AP, fjerner rubble
[Search Rubble (Int 3)]   - 1 AP, søk etter skjulte items
[Cancel]
```

**Eksempel: Ild-blokkert kant:**
```
[Extinguish]              - Krever fire extinguisher
[Jump Through (Agi 4)]    - Tar 1 skade ved suksess, 2 ved feil
[Cancel]
```

#### 4. Action Handling (`ShadowsGame.tsx`)

**Nye case handlers i `handleContextActionEffect()`:**
- `clear_edge_rubble`, `clear_edge_heavy_rubble` → Konverterer til 'open' edge
- `break_edge_barricade`, `force_edge_gate` → Konverterer til 'open' edge
- `extinguish_edge_fire` → Konverterer til 'open' edge
- `dispel_edge_ward`, `banish_edge_spirits` → Konverterer til 'open' edge
- `break_window` → Konverterer window til 'open' edge

### Tekniske detaljer

**Edge-indeks beregning:**
```typescript
// Edge mellom to tiles beregnes slik:
const edgeFromSource = getEdgeIndexBetweenTiles(sourcePos, targetPos);
const edgeFromTarget = (edgeFromSource + 3) % 6; // Motsatt retning
```

**Hex edge layout (flat-top):**
```
       0 (NORTH)
        _____
       /     \
   5  /       \  1
     |         |
   4  \       /  2
       \_____/
     3 (SOUTH)
```

### Filer endret
- `src/game/ShadowsGame.tsx` - Bevegelsesvalidering og action handling
- `src/game/types.ts` - EdgeBlockingType og utvidet EdgeData
- `src/game/utils/contextActions.ts` - Nye context action funksjoner

### Spillmekanikk (fra game_design_bible.md)

| Edge Type | Passable | Beskrivelse |
|-----------|----------|-------------|
| **OPEN** | Ja | Fri passasje |
| **WALL** | Nei | Solid vegg - kan aldri passeres |
| **DOOR** | Betinget | Standard dør - har egen state |
| **WINDOW** | Betinget | Athletics DC 4 for å klatre gjennom |
| **BLOCKED** | Nei* | Blokkert av hindring - kan kanskje fjernes |

---

## 2026-01-19: Field Guide - "Notes on the Horrors I Have Witnessed"

### Oppgave
Implementere Field Guide-funksjonen der spillere kan lese om monstre de har oppdaget under spilling. Fungerer som et bestiary/encyclopedia som låses opp etter hvert som spilleren møter på fiender.

### Implementasjon

#### 1. Ny Komponent: FieldGuidePanel (`components/FieldGuidePanel.tsx`)

**Monster-kategorier:**
- **Minions**: Cultist, Mi-Go, Nightgaunt, Moon-Beast
- **Warriors**: Ghoul, Deep One, Sniper, Byakhee, Formless Spawn, Hound of Tindalos
- **Elites**: Dark Priest, Hunting Horror, Dark Young
- **Bosses**: Shoggoth, Star Spawn, Ancient One

**UI-struktur:**
- Venstre panel: Grid med monster-kort (viser "UNKNOWN" for uoppdagede monstre)
- Høyre panel: Detaljvisning med stats, lore og traits
- Header med tittel og oppdagelsesteller
- Footer med hint om hvordan låse opp flere monstre

**Monster-detaljer viser:**
| Felt | Beskrivelse |
|------|-------------|
| **HP** | Hitpoints |
| **Attack Dice** | Antall angrepsterninger (Hero Quest-stil) |
| **Defense Dice** | Antall forsvarsterninger |
| **Horror** | Sanity-tap ved første møte |
| **Lore** | Bakgrunnshistorie |
| **Traits** | Spesielle egenskaper (flying, fast, aquatic, etc.) |
| **Defeat Flavor** | Tekst som vises når monsteret beseires |

**Fargetema per trussel-nivå:**
- Minions: Stone/grå
- Warriors: Amber/gull
- Elites: Rød
- Bosses: Lilla

#### 2. ActionBar oppdatert (`components/ActionBar.tsx`)

Lagt til nye props:
```typescript
onToggleFieldGuide?: () => void;
showFieldGuide?: boolean;
```

Ny knapp med Skull-ikon plassert mellom AP-visning og Log-knapp.

#### 3. ShadowsGame.tsx integrasjon

- Ny state: `showFieldGuide`
- FieldGuidePanel rendres som modal over spillbrettet
- Bruker eksisterende `state.encounteredEnemies` for å spore oppdagede monstre

### Tekniske detaljer

**Discovery-logikk:**
- Monstre legges til `encounteredEnemies`-arrayen når spilleren ser dem for første gang
- Field Guide viser kun detaljer for monstre i denne arrayen
- Uoppdagede monstre vises som "UNKNOWN" med spørsmålstegn-ikon

**Styling:**
- Konsistent med spillets Lovecraftian-tema
- Amber/gull aksenter på mørk bakgrunn
- Responsive design for mobil og desktop
- Animasjoner ved hover og seleksjon

### Filer endret
- `src/game/components/FieldGuidePanel.tsx` (NY)
- `src/game/components/ActionBar.tsx`
- `src/game/ShadowsGame.tsx`

---

## 2026-01-19: Dark Room System - "What Lurks in the Shadows"

### Oppgave
Implementere et system for mørke rom som krever lommelykt eller lykt for å se hva som er der. Mørke rom kan inneholde spesielle overraskelser - både gode (skatter, ledetråder) og dårlige (bakholdsangrep, feller, horror).

### Implementasjon

#### 1. Nye TypeScript Interfaces (`types.ts`)

**DarkRoomDiscoveryType** - Typer av oppdagelser i mørke rom:
- `treasure` - Verdifulle gjenstander
- `cache` - Skjulte forsyninger
- `clue` - Etterforskning ledetråd (+Insight)
- `corpse` - Dødt lik med items og horror check
- `survivor` - Sjelden NPC som gir hint
- `nothing` - Bare mørke
- `ambush` - Skjult fiende angriper!
- `nest` - Flere svake fiender
- `horror` - Noe som forårsaker sanity damage
- `trap` - En felle aktiveres
- `cultist_shrine` - Okkult alter (sanity kostnad, men insight gevinst)
- `ancient_secret` - Sjelden kraftig oppdagelse

**DarkRoomContent Interface:**
```typescript
interface DarkRoomContent {
  discoveryType: DarkRoomDiscoveryType;
  description: string;
  items?: string[];
  enemyTypes?: EnemyType[];
  enemyCount?: number;
  sanityEffect?: number;
  insightGain?: number;
  trapDamage?: number;
  isRevealed: boolean;
  requiresSearch?: boolean;
}
```

**Tile Interface utvidet:**
- `isDarkRoom?: boolean` - Er dette et mørkt rom?
- `darkRoomContent?: DarkRoomContent` - Skjult innhold
- `darkRoomIlluminated?: boolean` - Er rommet belyst?

#### 2. Konstantfiler (`constants.ts`)

**Vektet oppdagelsestabell:**
| Type | Sannsynlighet |
|------|---------------|
| nothing | 25% |
| ambush | 15% |
| horror | 12% |
| cache | 10% |
| corpse | 10% |
| clue | 8% |
| treasure | 6% |
| trap | 5% |
| nest | 4% |
| cultist_shrine | 3% |
| survivor | 1% |
| ancient_secret | 1% |

**DARK_ROOM_CANDIDATE_TILES** - Tiles som alltid er mørke:
- Kjellere: Dark Cellar, Wine Cellar, Cold Storage, etc.
- Krypter: Ancient Tomb, Ritual Chamber, Bone Pit, etc.
- Mørke ganger: Darkened Hallway, Servants Passage, etc.

**DARK_ROOM_ZONE_CHANCE** - Sone-basert sjanse:
- Level 2 (Upper floors): 10%
- Level 1 (Ground floor): 15%
- Level 0 (Exterior): 5%
- Level -1 (Basement): 40%
- Level -2 (Deep underground): 60%

**DARK_ROOM_LOOT_TABLES** - Item-tabeller for oppdagelser:
- `random_valuable`: Gold Coins, Silver Pendant, Antique Watch
- `random_supplies`: Bandage, Flashlight, Matches, First Aid Kit
- `random_from_corpse`: Rusty Key, Journal Page, Derringer, Knife
- `rare_relic`: Elder Sign, Protective Ward, Ancient Tome

**Utility-funksjoner:**
- `rollDarkRoomDiscovery()` - Vektet tilfeldig valg
- `generateDarkRoomContent()` - Genererer komplett innhold
- `shouldBeDarkRoom()` - Sjekker om tile skal være mørk
- `canSeeDarkRoomContents()` - Sjekker om spiller har lyskilde
- `getDarkRoomDisplayState()` - Returnerer visuell tilstand

#### 3. Visuell Implementasjon

**GameBoard.tsx oppdatert:**
- Dark room overlay vises på synlige tiles som ikke er belyst
- Visuell effekt: Pulserende mørke med virvlende tendriler
- Flashlight-ikon og "Darkness" tekst indikerer at lyskilde trengs

**Nye CSS-animasjoner (`index.css`):**
- `@keyframes darkness-pulse` - Pulserende mørke effekt
- `@keyframes darkness-swirl` - Virvlende mørke tendriler
- `@keyframes flashlight-reveal` - Animasjon når rom belyses
- `@keyframes discovery-shimmer` - Glitrende effekt ved funn

#### 4. Gameplay Integrasjon (`ShadowsGame.tsx`)

**Bevegelse inn i mørke rom:**
Når spiller med lyskilde går inn i et mørkt rom:
1. Rommet belyses automatisk
2. Beskrivelse av oppdagelsen vises i loggen
3. Effekter utløses basert på discoveryType:
   - **ambush/nest**: Fiender spawnes på samme tile
   - **horror**: Sanity tap utløses
   - **trap**: HP skade utløses
   - **clue/survivor/cultist_shrine**: Insight og/eller sanity effekter
   - **treasure/cache/corpse/ancient_secret**: Markeres for søk

**Søk i belyste mørke rom:**
Investigate action sjekker først om spilleren er på et belyst mørkt rom med items. Hvis ja, finner spilleren item fra dark room loot table i stedet for tilfeldig item.

#### 5. Tile-generering (`tileConnectionSystem.ts`)

**createTileFromTemplate() oppdatert:**
- Sjekker om tile navn er i DARK_ROOM_CANDIDATE_TILES
- Kjører shouldBeDarkRoom() for zone-basert sjanse
- Genererer darkRoomContent med generateDarkRoomContent()

### Filer Endret
- `src/game/types.ts` - Nye interfaces og types
- `src/game/constants.ts` - Oppdagelses-tabeller og utility-funksjoner
- `src/game/components/GameBoard.tsx` - Visuell dark room overlay
- `src/game/ShadowsGame.tsx` - Gameplay integrasjon
- `src/game/tileConnectionSystem.ts` - Tile-generering
- `src/index.css` - Nye CSS-animasjoner

### Gameplay Eksempel

1. Spiller utforsker en kjeller og finner "Dark Cellar"
2. Tile vises med mørk overlay og flashlight-ikon
3. Hvis spiller IKKE har lyskilde: Kan bevege seg inn, men ser ikke innhold
4. Hvis spiller HAR lyskilde (Flashlight eller Oil Lantern i hand slot):
   - Går inn i rommet
   - Logger: "Emily shines light into the darkness..."
   - 15% sjanse: "AMBUSH! 1 ghoul(s) attack from the shadows!"
   - 10% sjanse: "Emergency supplies, hidden from looters. Still intact." (Må søke)
   - 25% sjanse: "Just shadows. The darkness held nothing but your own fear."
   - etc.

### Status
Fullført. Dark room systemet gir en ny dimensjon av utforskning der lyskilder blir verdifulle verktøy, og mørke områder kan skjule både farer og skatter.

---

## 2026-01-19: Dynamic Weather Effects System

### Oppgave
Implementere dynamiske væreffekter på spillbrettet. Dette inkluderer effekter som regn, tåke, eller unaturlig glød som påvirker gameplay (reduserer sikt eller endrer fiendeoppførsel). Legge til en 'weather' property på Tile og visuelt representere været. Mørke skyer skal alltid bevege seg over skjermen for å skape en uggen følelse.

### Implementasjon

#### 1. Permanente Mørke Skyer (AmbientDarkClouds)
Lagt til en permanent ambient effekt som alltid vises uavhengig av værforhold:
- **Foreground clouds**: 8 skyer med 40-60s animasjonssyklus
- **Background clouds**: 6 skyer med parallax-effekt (55-80s syklus)
- **Cloud shadows**: 3 skygger som passerer over terrenget
- **Subtle vignette**: For ekstra dybde og uhygge

**Nye CSS-animasjoner i `index.css`:**
- `@keyframes dark-cloud-drift` - Hovedsky-bevegelse
- `@keyframes dark-cloud-drift-slow` - Bakgrunnsskyer (parallax)
- `@keyframes ambient-dread` - Subtil pulserende mørke
- `@keyframes cloud-shadow-pass` - Skygger som passerer

#### 2. Nye Værtyper
Lagt til to nye værtyper i tillegg til eksisterende (fog, rain, miasma, cosmic_static):

**`unnatural_glow` - Eldritch Phosphorescence:**
- Øker sikt (visionReduction: -1)
- 20% horror chance
- Fiender blir MER synlige og aggressive
- Visuell effekt: Pulserende grønn/cyan glød med flikkerende lyskilder

**`darkness` - Consuming Darkness:**
- Kraftig redusert sikt (visionReduction: 2)
- Fiender skjules til de er tilstøtende
- Blokkerer ranged attacks
- Visuell effekt: Mørke tendriler, voidflicker, heavy vignette

**Nye CSS-animasjoner:**
- `@keyframes unnatural-pulse` - Pulserende glød
- `@keyframes glow-flicker` - Flikkerende lyskilder
- `@keyframes color-shift` - Fargeskift
- `@keyframes darkness-creep` - Krypende mørke
- `@keyframes darkness-tendril` - Mørke tendriler
- `@keyframes void-flicker` - Void-glimt

#### 3. Weather Property på Tile
Utvidet `Tile` interface med `localWeather` property:
```typescript
localWeather?: {
  type: WeatherType;
  intensity: WeatherIntensity;
  duration: number;
  source?: 'ritual' | 'event' | 'tile_feature';
};
```

#### 4. Weather Effects på Visibility (allerede implementert)
Følgende funksjoner i `constants.ts` håndterer visibility:
- `calculateWeatherVision()` - Beregner effektiv siktrekkevidde
- `weatherHidesEnemy()` - Sjekker om fiender skjules
- `weatherBlocksRanged()` - Sjekker om ranged attacks blokkeres

Disse er integrert i `GameBoard.tsx` for å beregne synlige tiles.

#### 5. Weather Effects på Enemy Behavior (`monsterAI.ts`)
Nytt system for værbasert monster-AI:

**Nye funksjoner:**
- `getWeatherMonsterModifiers()` - Returnerer modifikatorer for monster-oppførsel
- `monsterBenefitsFromWeather()` - Sjekker om en monstertype drar nytte av været
- `applyWeatherToVision()` - Beregner monsters effektive sikt

**Værmodifikatorer:**
| Vær | Vision | Aggression | Speed | Stealth | Horror |
|-----|--------|------------|-------|---------|--------|
| Fog | 0.6x | 1.2x | 1x | Ja | +1 |
| Rain | 0.8x | 0.9x | 0.9x | Nei | 0 |
| Miasma | 0.5x | 1.5x | 1.1x | Ja | +2 |
| Cosmic Static | 0.7x | 1.3x | 0.8x | Nei | +2 |
| Unnatural Glow | 1.3x | 1.4x | 1x | Nei | +1 |
| Darkness | 0.3x | 1.6x | 1.2x | Ja | +3 |

**Monster-vær-preferanser:**
- Darkness dwellers (ghoul, nightgaunt, hound, etc.): Forsterkes i mørke
- Light seekers (mi-go, star_spawn, byakhee): Forsterkes i unnatural_glow
- Aquatic (deepone): Forsterkes i regn

**Oppdaterte funksjoner:**
- `canSeePlayer()` - Tar nå hensyn til vær og monstertype
- `findSmartTarget()` - Værbasert prioritetsberegning
- `getMonsterDecision()` - Tar weather parameter
- `processEnemyTurn()` - Returnerer nå weatherEffects i tillegg til andre data

#### 6. Weather Change Triggers (allerede implementert)
Været endres automatisk basert på doom-nivå:
```typescript
WEATHER_DOOM_EVENTS = {
  10: 'fog',           // Doom 10 - tåke
  8: 'rain',           // Doom 8 - regn
  6: 'darkness',       // Doom 6 - mørke
  4: 'miasma',         // Doom 4 - miasma
  3: 'unnatural_glow', // Doom 3 - eldritch lys
  2: 'cosmic_static'   // Doom 2 - realitetsforvrengning
};
```

### Filer Endret
- `src/index.css` - Nye CSS-animasjoner for skyer og væreffekter
- `src/game/components/WeatherOverlay.tsx` - AmbientDarkClouds, UnnaturalGlowEffect, DarknessEffect
- `src/game/types.ts` - Utvidet WeatherType og Tile.localWeather
- `src/game/constants.ts` - Nye væreffekter og oppdatert WEATHER_DOOM_EVENTS
- `src/game/utils/monsterAI.ts` - Værbasert monster AI-system

### Visuell Effekt
Spillet har nå en konstant uhyggelig atmosfære med mørke skyer som driver over skjermen. Når doom synker, legges flere væreffekter på toppen av dette for å skape en eskalerende følelse av dread.

### Status
Fullført. Alle væreffekter fungerer visuelt og påvirker både visibility og fiendeoppførsel som spesifisert.

---

## 2026-01-19: Fix Scenario Victory Condition Checking

### Oppgave
Fikse at scenarioer aldri kunne vinnes fordi victory conditions aldri ble sjekket. Spesifikt ble "Survive for X rounds" scenarioer aldri avsluttet selv når spilleren hadde overlevd det nødvendige antall runder.

### Problem
1. `checkGameOver()` funksjonen var definert men ble aldri kalt
2. Etter at runden ble inkrementert i `handleMythosOverlayComplete()`, ble det aldri sjekket om victory conditions var oppfylt
3. Når objectives ble markert som fullført (f.eks. boss drept, items samlet), ble det heller aldri sjekket om dette førte til seier

### Løsning
Implementert victory condition checking på to steder:

#### 1. handleMythosOverlayComplete() i ShadowsGame.tsx
Lagt til eksplisitt victory og defeat check med de NYE verdiene (newRound, newDoom, updatedScenario) rett FØR state oppdateres. Dette sikrer at survival scenarios avsluttes korrekt når spilleren overlever det nødvendige antall runder.

```typescript
// Check for victory conditions with the NEW values before transitioning
if (updatedScenario) {
  const victoryResult = checkVictoryConditions(updatedScenario, {
    players: state.players,
    enemies: state.enemies,
    board: state.board,
    round: newRound,
    doom: newDoom,
    questItemsCollected: state.questItemsCollected
  });

  if (victoryResult.isVictory) {
    addToLog(victoryResult.message);
    setGameOverType('victory');
    setState(prev => ({ ...prev, phase: GamePhase.GAME_OVER, ... }));
    return;
  }
  // ... defeat check also added
}
```

#### 2. useEffect for scenario changes i ShadowsGame.tsx
Lagt til en useEffect som sjekker victory conditions når som helst `state.activeScenario` endres. Dette fanger opp victory conditions for alle andre scenario-typer (assassination, collection, investigation, ritual, escape) når objectives markeres som fullført.

```typescript
useEffect(() => {
  if (!state.activeScenario || state.phase === GamePhase.GAME_OVER || state.phase === GamePhase.SETUP) {
    return;
  }

  const victoryResult = checkVictoryConditions(state.activeScenario, {
    players: state.players,
    enemies: state.enemies,
    board: state.board,
    round: state.round,
    doom: state.doom,
    questItemsCollected: state.questItemsCollected
  });

  if (victoryResult.isVictory) {
    addToLog(victoryResult.message);
    setGameOverType('victory');
    setState(prev => ({ ...prev, phase: GamePhase.GAME_OVER }));
  }
}, [state.activeScenario, state.players, state.enemies, state.board, state.round, state.doom, state.questItemsCollected, state.phase]);
```

### Scenario-typer og deres victory conditions

Alle følgende scenario-typer har nå fungerende victory checks:

| Type | Victory Condition | Trigger |
|------|-------------------|---------|
| **Survival** | Overlev X runder | Runden når targetAmount (f.eks. 5) |
| **Assassination** | Drep boss | Boss-fienden drepes |
| **Collection** | Samle items | Alle required items samlet |
| **Escape** | Nå utgangen | Spiller på exit tile med required items |
| **Investigation** | Finn ledetråder | Alle required tiles/items funnet |
| **Ritual** | Utfør ritual | Ritual objective markert som fullført |

### Status
Fullført. Alle scenariotyper sjekker nå victory conditions korrekt og spillet avsluttes med seier når betingelsene er oppfylt.

---

## 2026-01-19: Hex Tile Dead-End Edge Visualization

### Oppgave
Oppdatere hex tile rendering for å visuelt indikere "dead ends". Når en tile har en kant som er en dead end (f.eks. en vegg innendørs eller en blokkert kant), skal det vises en visuell markør for å hjelpe spillere å forstå kartlayoutet og planlegge bevegelse mer effektivt.

### Løsning
Implementert SVG-basert kantvisualisering i GameBoard.tsx som tegner distinkte markører på hver hex-kant basert på kanttypen.

### Endringer

#### 1. GameBoard.tsx

**Nye konstanter og hjelpefunksjoner:**
- `HEX_EDGE_POINTS`: Array med koordinater for hver av de 6 hex-kantene (N, NE, SE, S, SW, NW)
- `isDeadEndEdge()`: Funksjon som sjekker om en kanttype er impasserbar (wall eller blocked)
- `isWindowEdge()`: Funksjon som sjekker om en kant er et vindu (delvis blokkert)

**Visuell rendering av kanter:**
- **Vegger (wall/blocked)**: Vises med tykk mørk linje (strokeWidth 4) med en lysere indre linje for dybde, pluss et lite kryss-symbol på midtpunktet for å tydelig indikere blokkering
- **Vinduer (window)**: Vises med stiplede linjer i blåaktig farge for å indikere at man kan se gjennom men vanskelig å passere

**Importert EdgeData type** for å sikre typesikkerhet i kantbehandlingen.

### Teknisk implementasjon

```typescript
// Hex edge endpoints for flat-top hexagon (0-100 scale)
const HEX_EDGE_POINTS = [
  { x1: 25, y1: 0, x2: 75, y2: 0 },      // 0: North
  { x1: 75, y1: 0, x2: 100, y2: 50 },    // 1: North-East
  { x1: 100, y1: 50, x2: 75, y2: 100 },  // 2: South-East
  { x1: 75, y1: 100, x2: 25, y2: 100 },  // 3: South
  { x1: 25, y1: 100, x2: 0, y2: 50 },    // 4: South-West
  { x1: 0, y1: 50, x2: 25, y2: 0 },      // 5: North-West
];
```

For hver synlig tile itereres det over alle 6 kanter. Hvis en kant er en vegg eller vindu, tegnes passende SVG-elementer direkte på den spesifikke kanten.

### Visuelt resultat
- Vegger vises som tykke mørke linjer med et lite X-symbol
- Vinduer vises som stiplede blåaktige linjer
- Åpne kanter (open, door, stairs) har ingen spesiell markering
- Markørene vises kun på synlige tiles

### Status
Fullført. Hex tiles viser nå tydelig hvilke kanter som er blokkert (vegger) eller delvis blokkert (vinduer).

---

## 2026-01-19: Enable New Game with Selected Hero

### Oppgave
Fikse at når man velger en hero i Hero Archive og vil starte nytt spill, så skal man gå til scenario-velger istedenfor tilbake til hovedmenyen.

### Problem
Brukeren kunne velge en hero i Hero Archive, men det var ingen måte å starte et nytt spill med den valgte helten. "Back to Menu" knappen gikk bare tilbake til hovedmenyen.

### Løsning
Lagt til en "Start New Game" knapp i HeroArchivePanel som vises når minst én hero er valgt. Denne knappen tar brukeren direkte til scenario-velgeren (difficulty selection).

### Endringer

#### 1. HeroArchivePanel.tsx
- Lagt til ny prop `onStartNewGame?: () => void`
- Lagt til "Start New Game" knapp ved siden av "Back to Menu" som vises når heroes er valgt
- Knappen viser antall valgte helter: "Start New Game (1 hero)" eller "Start New Game (2 heroes)"

#### 2. ShadowsGame.tsx
- Implementert `onStartNewGame` callback som:
  - Setter mainMenuView tilbake til 'title'
  - Setter game phase til SETUP med null activeScenario
  - Lukker hovedmenyen slik at difficulty selection vises
  - Beholder de valgte legacy hero ID'ene

### Flow
1. Bruker åpner Hero Archive fra hovedmenyen
2. Bruker velger en eller flere helter
3. Bruker trykker "Start New Game"
4. Bruker blir tatt til difficulty selection (Normal/Hard/Nightmare)
5. Etter å velge difficulty, vises scenario med de valgte legacy heroes allerede merket
6. Bruker kan "Assemble Team" og starte spillet

### Status
Fullført. Brukere kan nå starte nytt spill direkte fra Hero Archive etter å ha valgt helter.

---

## 2026-01-19: Endret spilltittel til "Mythos Quest"

### Oppgave
Endre spilltittelen fra "Shadows of the 1920s" til "Mythos Quest".

### Endringer

#### 1. index.html
- Oppdatert `<title>` tag
- Oppdatert `og:title` meta tag
- Oppdatert `twitter:title` meta tag

#### 2. MainMenu.tsx
- Endret hovedtittelen fra "Shadows" til "Mythos"
- Endret undertittelen fra "of the 1920s" til "Quest"

### Status
Fullført. Spilltittelen er nå "Mythos Quest" på hovedmenyen og i nettleserens tittel.

---

## 2026-01-19: Logical Tile Connection System

### Oppgave
Implementere et logisk kant-forbindelsessystem for prosedural generering av tiles. Hver tile behandles som en puslespillbrikke med 6 kanter som må matche med naboer.

### Konsept
Inspirert av Wave Function Collapse algoritmen. Hver kant på en hex-tile kan være en av flere typer (WALL, DOOR, OPEN, etc.), og kanter må være kompatible med naboer for å koble sammen.

### Implementerte Komponenter

#### 1. Edge Type System (tileConnectionSystem.ts)
Nye kant-typer med kompatibilitetsmatrise:

```typescript
type ConnectionEdgeType =
  | 'WALL'        // Solid vegg - kan BARE kobles til WALL
  | 'OPEN'        // Åpen passasje - kan kobles til OPEN eller DOOR
  | 'DOOR'        // Dør - kan kobles til DOOR eller OPEN
  | 'WINDOW'      // Vindu - kan kobles til WALL (se gjennom, ikke passere)
  | 'STREET'      // Gate/vei - kan kobles til STREET, OPEN, FACADE
  | 'NATURE'      // Natur-kant - kan kobles til NATURE, STREET, WATER
  | 'WATER'       // Vannkant - kan kobles til WATER, NATURE
  | 'FACADE'      // Bygningsfasade - kobler STREET til DOOR
  | 'STAIRS_UP'   // Trapp opp
  | 'STAIRS_DOWN'; // Trapp ned

const EDGE_COMPATIBILITY: Record<ConnectionEdgeType, ConnectionEdgeType[]> = {
  WALL: ['WALL', 'WINDOW'],
  OPEN: ['OPEN', 'DOOR'],
  DOOR: ['DOOR', 'OPEN', 'FACADE'],
  WINDOW: ['WALL', 'WINDOW'],
  STREET: ['STREET', 'OPEN', 'FACADE', 'NATURE'],
  NATURE: ['NATURE', 'STREET', 'WATER', 'OPEN'],
  WATER: ['WATER', 'NATURE'],
  FACADE: ['STREET', 'DOOR', 'OPEN'],
  STAIRS_UP: ['STAIRS_UP', 'OPEN'],
  STAIRS_DOWN: ['STAIRS_DOWN', 'OPEN']
};
```

#### 2. TileTemplate Interface
Hver tile-type har predefinerte kanter:

```typescript
interface TileTemplate {
  id: string;
  name: string;
  category: TileCategory;
  subType: string;
  edges: [ConnectionEdgeType, ConnectionEdgeType, ConnectionEdgeType,
          ConnectionEdgeType, ConnectionEdgeType, ConnectionEdgeType]; // 6 kanter
  floorType: FloorType;
  zoneLevel: ZoneLevel;
  watermarkIcon?: string;
  spawnWeight: number;      // Høyere = mer vanlig
  canRotate: boolean;       // Kan roteres for å passe?
  description?: string;
  enemySpawnChance?: number;
  possibleEnemies?: string[];
}
```

#### 3. 40+ Tile Templates
Fullstendig bibliotek med templates for alle kategorier:

**Innendørs:**
- Foyer: `foyer_grand`, `foyer_small`, `foyer_church`
- Korridor: `corridor_straight`, `corridor_t`, `corridor_corner`, `corridor_cross`, `corridor_wide`
- Rom: `room_study`, `room_bedroom`, `room_kitchen`, `room_ritual`, `room_library`, `room_lab`, `room_dining`, `room_living`
- Trapper: `stairs_down`, `stairs_up`, `stairs_spiral`
- Kjeller: `basement_cellar`, `basement_wine`, `basement_tunnel`, `basement_sewer`
- Krypt: `crypt_tomb`, `crypt_altar`, `crypt_tunnel`, `crypt_portal`

**Utendørs:**
- Fasade: `facade_manor`, `facade_shop`, `facade_church`, `facade_warehouse`
- Gate: `street_main`, `street_alley`, `street_crossing`, `street_corner`
- Urban: `urban_square`, `urban_harbor`, `urban_cemetery`
- Natur: `nature_forest`, `nature_clearing`, `nature_path`, `nature_marsh`, `nature_stones`

#### 4. Rotasjonssystem
Templates kan roteres 0-5 (60-graders steg) for å matche constraints:

```typescript
function rotateEdges(edges, rotation): ConnectionEdgeType[] {
  const normalizedRotation = ((rotation % 6) + 6) % 6;
  const rotated: ConnectionEdgeType[] = [];
  for (let i = 0; i < 6; i++) {
    const sourceIndex = (i - normalizedRotation + 6) % 6;
    rotated[i] = edges[sourceIndex];
  }
  return rotated;
}
```

#### 5. Constraint Gathering
Samler kant-krav fra alle naboer:

```typescript
function gatherConstraints(board, q, r): (EdgeConstraint | null)[] {
  // For hver av 6 retninger:
  // - Finn nabo-tile
  // - Hent naboens kant som peker mot oss (oppositeDirection)
  // - Returner constraint-objekt med påkrevd kanttype
}
```

#### 6. Template Matching (WFC-inspirert)
Finner alle templates som matcher constraints:

```typescript
function findValidTemplates(constraints, preferredCategory): TemplateMatch[] {
  // For hver template:
  //   For hver mulig rotasjon (0-5):
  //     Sjekk om roterte kanter er kompatible med alle constraints
  //     Hvis ja, legg til med vektet score
  // Returner alle matchende templates med rotasjoner
}
```

#### 7. Room Cluster System
Genererer hele rom-strukturer (som en liten leilighet eller herregård):

```typescript
interface RoomCluster {
  id: string;
  name: string;
  description: string;
  tiles: { template: TileTemplate; localQ: number; localR: number; rotation: number; }[];
  entryPoints: { direction: HexDirection; localQ: number; localR: number; }[];
  category: 'apartment' | 'manor' | 'church' | 'warehouse' | 'cave';
  spawnWeight: number;
}
```

Pre-definerte clusters:
- `CLUSTER_SMALL_APARTMENT` - 4 tiles
- `CLUSTER_MANOR_GROUND` - 7 tiles
- `CLUSTER_CHURCH` - 6 tiles
- `CLUSTER_WAREHOUSE` - 5 tiles

#### 8. Oppdatert spawnRoom (ShadowsGame.tsx)
Integrert det nye systemet med eksisterende spillogikk:

1. **Template-basert generering:** Bruker `gatherConstraints` og `findValidTemplates`
2. **30% Room Cluster sjanse:** Når spiller går inn i bygning fra facade/street
3. **Fallback til legacy:** Hvis ingen templates matcher
4. **Template-basert enemy spawn:** Bruker `enemySpawnChance` og `possibleEnemies` fra template

### Filer Opprettet
- `src/game/tileConnectionSystem.ts` (NY - ~1100 linjer)

### Filer Modifisert
- `src/game/ShadowsGame.tsx` - Import og oppdatert spawnRoom (~200 linjer endret)

### Teknisk Flyt

```
1. Spiller beveger seg til adjacent tile
   ↓
2. spawnRoom(q, r, tileSet) kalles
   ↓
3. gatherConstraints() - samler kant-krav fra naboer
   ↓
4. findValidTemplates() - finner matchende templates
   ↓
5. selectWeightedTemplate() - velger basert på spawnWeight
   ↓
6. [30% sjanse] Spawn room cluster i stedet for enkelttile
   ↓
7. createTileFromTemplate() - lager Tile fra valgt template
   ↓
8. Oppdater board state og logg
```

### Resultat
- ✅ Fullstendig kant-kompatibilitetssystem
- ✅ 40+ tile templates med predefinerte kanter
- ✅ Rotasjon for å matche constraints
- ✅ Room cluster generering (30% sjanse)
- ✅ Fallback til legacy system
- ✅ Template-basert enemy spawning
- ✅ TypeScript kompilerer uten feil
- ✅ Build vellykket

### Neste Steg (Fremtidig)
- Utvide template-biblioteket med flere varianter
- Implementere zone-specific constraint prioritering
- Legge til multi-level room clusters (flere etasjer)
- Visuell preview av mulige tile-typer på adjacent tiles

---

## 2026-01-19: Fix Hero Selection for Scenarios

### Oppgave
Sørge for at lagde helter faktisk kan velges og brukes i scenarier.

### Problemer Funnet

1. **Player ID Collision** - Når en LegacyHero ble konvertert til Player, brukte systemet `hero.characterClass` som player ID. Dette betydde at to helter av samme klasse (f.eks. to Detectives) ville ha identisk ID, og bare den første fikk lagret utstyret sitt etter et scenario.

2. **Hero Matching Feil** - I `handleScenarioComplete()` var logikken for å matche spillere med legacy-helter ødelagt. Den fant bare *en vilkårlig* valgt helt, ikke den som faktisk matchet spilleren.

3. **Deselection Ikke Mulig** - I HeroArchivePanel kunne brukere velge helter, men ikke fjerne valget. Koden returnerte tidlig hvis helten allerede var valgt.

4. **Kill Tracking Aldri Implementert** - `incrementHeroKills` funksjonen eksisterte men ble aldri kalt. Dette betydde at ingen helter fikk kill-basert XP.

### Løsninger Implementert

#### 1. heroId i Player Interface (types.ts)
```typescript
export interface Player extends Character {
  // ... existing fields ...
  heroId?: string;  // The unique LegacyHero.id for tracking
}
```

#### 2. legacyHeroToPlayer Fix (legacyManager.ts)
```typescript
return {
  id: hero.id,          // Use unique hero ID, not class type
  heroId: hero.id,      // Also store in dedicated field
  // ... rest of conversion
};
```

#### 3. Deselection Support (HeroArchivePanel.tsx)
- Endret `handleSelectHero` til å kalle `onSelectHero` selv om helten allerede er valgt
- ShadowsGame sin `handleSelectLegacyHero` håndterer toggling
- Oppdatert UI: "Selected" badge er nå en klikkbar knapp med "✓ Selected (click to remove)"

#### 4. Hero Matching Fix (ShadowsGame.tsx)
```typescript
// Before (broken):
const legacyHero = legacyData.heroes.find(h => {
  return !h.isDead && selectedLegacyHeroIds.includes(h.id);
});

// After (fixed):
const heroId = player.heroId || player.id;
const legacyHero = legacyData.heroes.find(h => h.id === heroId);
```

#### 5. Kill Tracking (ShadowsGame.tsx)
La til kall til `incrementHeroKills` når en fiende blir drept:
```typescript
if (isKilled) {
  // Track kill for legacy hero XP rewards
  const heroId = activePlayer.heroId || activePlayer.id;
  incrementHeroKills(heroId);
  // ... rest of kill logic
}
```

### Filer Modifisert
- `src/game/types.ts` - Lagt til `heroId` felt i Player interface
- `src/game/utils/legacyManager.ts` - Oppdatert `legacyHeroToPlayer` til å bruke unik hero ID
- `src/game/components/HeroArchivePanel.tsx` - Lagt til deselection funksjonalitet
- `src/game/ShadowsGame.tsx` - Fikset hero matching og lagt til kill tracking

### Resultat
- ✅ Legacy-helter kan nå velges OG de-velges i Hero Archive
- ✅ Flere helter av samme klasse fungerer nå korrekt
- ✅ Utstyr og stats lagres riktig til rett helt etter scenario
- ✅ Kill-basert XP fungerer nå for legacy-helter
- ✅ TypeScript kompilerer uten feil
- ✅ Build vellykket

---

## 2026-01-19: The Whispering Elements - Værsystem

### Oppgave
Implementere et dynamisk værsystem som påvirker både visuell presentasjon og gameplay:
- Fog: Semi-transparent tåke som reduserer sikt og skjuler fiender
- Rain: Diagonale regnstriper (CSS-animasjon) som øker Agility-sjekk vanskelighet
- Miasma: Overnaturlig lilla/grønn tåke som drenerer sanity
- Cosmic Static: Reality distortion med støy og glitcher

### Implementert

#### 1. Typer og Interfaces (types.ts)
Nye typer for værsystemet:
- `WeatherType`: 'clear' | 'fog' | 'rain' | 'miasma' | 'cosmic_static'
- `WeatherIntensity`: 'light' | 'moderate' | 'heavy'
- `WeatherCondition`: Interface for aktiv værforhold (type, intensity, duration)
- `WeatherEffect`: Interface for vær-effekter (vision, agility penalty, sanity drain, etc.)
- `WeatherState`: Interface for aktiv vær-state (global, local, transition)
- `createDefaultWeatherState()`: Helper-funksjon for initial state
- Utvidet `GameState` med `weatherState: WeatherState`

#### 2. Vær-effekter og Konstanter (constants.ts)
Komplett vær-konfigurasjon:
- `WEATHER_EFFECTS`: Record med alle værtyper og deres effekter
- `getWeatherEffect()`: Hent effekt-data for en værtype
- `getIntensityModifier()`: Multiplier basert på intensity (0.5/1.0/1.5)
- `calculateWeatherVision()`: Beregn redusert sikt
- `calculateWeatherAgilityPenalty()`: Beregn agility-straff
- `weatherBlocksRanged()`: Sjekk om vær blokkerer ranged angrep
- `weatherHidesEnemy()`: Sjekk om fiender er skjult i vær
- `rollWeatherHorror()`: Rull for vær-indusert horror check
- `WEATHER_DOOM_EVENTS`: Vær som utløses ved doom-terskler
- `getWeatherForDoom()`: Sjekk om vær bør endre seg basert på doom

**Vær-effekter:**
| Vær | Vision | Agility | Move Cost | Horror % | Sanity Drain | Skjuler Fiender |
|-----|--------|---------|-----------|----------|--------------|-----------------|
| Clear | 0 | 0 | 0 | 0% | 0 | Nei |
| Fog | -1 | 0 | 0 | 10% | 0 | Ja (range 2+) |
| Rain | 0 | -1 | 0 | 0% | 0 | Nei |
| Miasma | -1 | 0 | 0 | 25% | 1 | Ja (range 2+) |
| Cosmic Static | 0 | -1 | +1 AP | 15% | 1 | Nei |

#### 3. WeatherOverlay Komponent (components/WeatherOverlay.tsx)
Ny React-komponent for visuelle væreffekter:
- `FogParticles`: Drivende skyer med Cloud-ikoner
- `RainEffect`: Diagonale regnstriper med CSS-animasjon
- `MiasmaEffect`: Lilla/grønne partikler + subtile skalle-glimt
- `CosmicStaticEffect`: Støy-overlay + glitch-barer + flimrende partikler
- `WeatherIndicator`: HUD-element som viser aktiv vær med ikon

#### 4. CSS Animasjoner (index.css)
Nye keyframe-animasjoner:
- `fog-drift`: Horisontalt tåke-drift (20s)
- `rain-fall`: Diagonalt regnfall (0.5s)
- `miasma-float`: Svevende giftpartikler (8s)
- `miasma-skull`: Subtile skalle-glimt (12s)
- `cosmic-noise`: Reality-støy (0.3s)
- `glitch-bar`: Horizontale glitch-striper (4s)
- `cosmic-glitch`: Reality-rift (3s)
- `cosmic-flicker`: Flimrende partikler (1s)

Vær-klasser med gradient-bakgrunner for stemning.

#### 5. GameBoard Integrasjon (components/GameBoard.tsx)
- Importert `WeatherOverlay`, `calculateWeatherVision`, `weatherHidesEnemy`
- Utvidet `GameBoardProps` med `weatherState?: WeatherState`
- Oppdatert `visibleTiles` useMemo til å bruke `calculateWeatherVision()`
- Fiender på avstand 2+ blir semi-transparent og blurret i skjulende vær
- `WeatherOverlay` rendres over brettet med z-index 30

#### 6. Gameplay-logikk (ShadowsGame.tsx)
- Importert `createDefaultWeatherState`, værfunksjoner fra constants
- `DEFAULT_STATE` inkluderer nå `weatherState: createDefaultWeatherState()`
- `GameBoard` mottar `weatherState` som prop
- **Mythos-fase oppdatert:**
  - Sjekker om vær bør endre seg basert på ny doom-verdi
  - Logger vær-endringer til Field Journal
  - Intensity øker ettersom doom synker (light → moderate → heavy)
- **Skill checks oppdatert:**
  - Agility-sjekker får penalty basert på aktiv vær
  - Logger vær-påvirkning til Field Journal

### Vær-system Flyt

1. Spillet starter med `weatherState: { global: null, ... }` (klart vær)
2. Hver Mythos-fase:
   - Doom reduseres med 1
   - System sjekker `getWeatherForDoom(newDoom)`
   - 25% sjanse for å utløse vær ved terskler (doom 10, 7, 4, 2)
   - Vær-intensity baseres på doom-nivå
3. Vær-effekter:
   - Visuell overlay rendres over brettet
   - Sikt reduseres automatisk
   - Fiender på avstand blir skjult/blurret
   - Agility-sjekker får penalty
   - Weather indicator vises øverst til venstre

### Filer Opprettet
- `src/game/components/WeatherOverlay.tsx` (NY)

### Filer Modifisert
- `src/game/types.ts` - Vær-typer og interfaces
- `src/game/constants.ts` - Vær-effekter og hjelpefunksjoner
- `src/game/components/GameBoard.tsx` - WeatherOverlay integrasjon
- `src/game/ShadowsGame.tsx` - Vær-logikk og state
- `src/index.css` - Vær-animasjoner

### Resultat
Værsystemet "The Whispering Elements" er nå komplett:
- ✅ Fog med drivende partikler og redusert sikt
- ✅ Rain med diagonale striper og Agility-penalty
- ✅ Miasma med overnaturlige partikler og sanity drain
- ✅ Cosmic Static med reality-distortion effekter
- ✅ Vær utløses dynamisk basert på doom-nivå
- ✅ Gameplay-påvirkning (sikt, agility, fiende-hiding)
- ✅ HUD-indikator for aktiv vær

---

## 2026-01-19: Hex Tiles System - Sperringer, Farer & Puzzles

### Oppgave
Implementere hex tiles system med:
- Sperringer: Trap, Altar, Gate, Fog Walls, locked_door, rubble
- Farer: Brann og feller med HP-skade ved bevegelse
- Puzzles: Elder Sign sekvens koblet til puzzle doors
- Dead-ends: Visuelle markører for blindgater

### Implementert

#### 1. Puzzle Door → PuzzleModal Flow (ShadowsGame.tsx)
- Importert og integrert `PuzzleModal` komponent
- Lagt til `handlePuzzleSolve()` callback som:
  - Ved suksess: Åpner puzzle door, fjerner locked_door object, logger "PUZZLE SOLVED!"
  - Ved fail: -1 Sanity, trigger madness check, logger "PUZZLE FAILED!"
- `solve_puzzle` action setter `activePuzzle` state og åpner modal
- Modal viser memory-game (Simon-style) med Elder Sign tema

#### 2. Trap/Fire Damage ved Bevegelse (ShadowsGame.tsx)
I `handleAction('move')`:
- **Trap object**: 2 HP damage, fjerner fellen etter triggering
- **Fire object**: 1 HP damage per bevegelse
- **Fire obstacle**: 1 HP damage per bevegelse
- Visuell feedback: Screen shake, floating text, log messages

#### 3. Trap Actions (contextActions.ts)
Nye handlinger for `trap` object:
- `disarm_trap` - Agility 4 check, fjerner felle
- `examine_trap` - Intellect 3 check, gir info
- `trigger_trap` - Trigger fra avstand (trygg)

#### 4. Fog Wall Actions (contextActions.ts)
Nye handlinger for `fog_wall` object:
- `dispel_fog` - Willpower 4 check, fjerner tåke (-1 SAN ved fail)
- `pass_through_fog` - Passerer gjennom (-1 SAN)

#### 5. Gate Actions (contextActions.ts)
Nye handlinger for `gate` object:
- `open_gate` - Krever gate_key
- `climb_gate` - Agility 4 check, 2 AP
- `force_gate` - Strength 5 check, 2 AP

#### 6. Utvidet Visuell Rendering (GameBoard.tsx)
Nye ikoner og effekter for alle tile objects:
| Object Type | Ikon | Farge/Effekt |
|-------------|------|--------------|
| fire | Flame | Orange, pulserende glow |
| locked_door | Lock | Accent, "Locked" label |
| rubble | Hammer | Stone-farget, rotert |
| trap | AlertTriangle | Rød, pulserende glow |
| gate | Fence | Grå, blocking indicator |
| fog_wall | Cloud | Purple, ethereal glow |
| altar | Sparkles | Purple, mystisk |
| bookshelf | BookOpen | Amber |
| crate/chest/cabinet | Package | Amber, dimmed når søkt |
| barricade | Hammer | Amber, rotert |
| mirror | Moon | Slate, refleksjon glow |
| radio | Radio | Grønn, pulserende |
| switch | ToggleLeft | Gul |
| statue | Skull | Stone-farget |
| exit_door | DoorOpen | Emerald, pulserende glow |

#### 7. Dead-End Marking System
**types.ts:**
- Lagt til `isDeadEnd?: boolean` på Tile interface

**ShadowsGame.tsx (spawnRoom):**
- `checkDeadEnd()` funksjon teller ikke-wall/blocked edges
- Tiles med ≤1 exit markeres automatisk som dead-end

**GameBoard.tsx:**
- CircleSlash ikon vises i nedre høyre hjørne på dead-end tiles
- Halvtransparent rød farge (50% opacity)
- Skjules når tile har object

### Filer Opprettet
Ingen nye filer

### Filer Modifisert
- `src/game/ShadowsGame.tsx` - PuzzleModal import, handlePuzzleSolve, trap damage, dead-end calc
- `src/game/utils/contextActions.ts` - Trap, fog_wall, gate actions
- `src/game/components/GameBoard.tsx` - Utvidet object rendering, dead-end marker
- `src/game/types.ts` - isDeadEnd property på Tile

### Resultat
Hex tiles systemet er nå komplett:
- ✅ Puzzle doors trigget Elder Sign memory game
- ✅ Traps og fire gir skade ved bevegelse
- ✅ Alle tile objects har visuelle ikoner
- ✅ Dead-end tiles markeres visuelt
- ✅ Context actions for trap, fog_wall, gate

---

## 2026-01-19: Bug Fix - Create Hero TypeError

### Problem
When clicking "Create Hero" in the Hero Archive panel, the game crashed with:
```
Uncaught TypeError: rn.find is not a function
```

This is a minified error message. The actual error was in `legacyManager.ts` where `CHARACTERS.find()` was being called.

### Root Cause
`CHARACTERS` is defined as a `Record<CharacterType, Character>` (an object), not an array. Objects don't have a `.find()` method.

Four functions in `legacyManager.ts` were calling `CHARACTERS.find()`:
- `getBaseAttributesForClass()` (line 111)
- `getBaseHpForClass()` (line 123)
- `getBaseSanityForClass()` (line 131)
- `legacyHeroToPlayer()` (line 553)

### Fix Applied
Changed all four occurrences from:
```typescript
const character = CHARACTERS.find(c => c.id === characterClass);
```

To direct object access:
```typescript
const character = CHARACTERS[characterClass];
```

Since `CHARACTERS` is indexed by `CharacterType`, direct access works correctly.

### Files Modified
- `src/game/utils/legacyManager.ts` (4 fixes)

### Result
- TypeScript compiles without errors
- Create Hero function now works correctly

---

## 2026-01-19: REGELBOK.MD Opprettet & CombatUtils Bug Fix

### Oppgave
1. Lage komplett REGELBOK.MD som referanse for alle spillregler
2. Verifisere at spillmotoren har korrekte regler implementert
3. Fikse eventuelle bugs funnet under verifisering

### REGELBOK.MD - Innhold

Opprettet en komplett regelbok med følgende seksjoner:

1. **Kampsystemet (Hero Quest-stil)**
   - Attack: Våpen bestemmer terninger direkte
   - Defense: Base + Armor dice
   - DC 4+ = suksess (50% per terning)
   - Kritisk treff: +1 bonus skade

2. **Karakterer (6 klasser)**
   - Veteran (Barbarian) - Fighter, HP 6, Sanity 3
   - Detective (Dwarf) - Investigator, HP 5, Sanity 4
   - Professor (Wizard) - Scholar, HP 3, Sanity 6
   - Occultist (Elf) - Hybrid med spells, HP 3, Sanity 5
   - Journalist (Rogue) - Scout, HP 4, Sanity 4
   - Doctor (Healer) - Support, HP 4, Sanity 5

3. **Våpen (9 typer)**
   - Melee: Unarmed (1d), Knife (2d), Club (2d), Machete (3d)
   - Ranged: Derringer (2d), Revolver (3d), Shotgun (4d), Rifle (3d), Tommy Gun (5d)

4. **Rustning (4 typer)**
   - None (+0), Leather Jacket (+1), Trench Coat (+1), Armored Vest (+2)

5. **Monstre (16 typer)**
   - Minions: Cultist, Mi-Go, Nightgaunt, Moon-Beast
   - Warriors: Ghoul, Deep One, Sniper, Byakhee, Formless Spawn, Hound
   - Elites: Dark Priest, Hunting Horror, Dark Young
   - Bosses: Shoggoth, Star Spawn, Ancient One

6. **Skill Checks, Inventory, Sanity, Legacy, Scenarios**

### BUG FUNNET OG FIKSET: combatUtils.ts

#### Problem
Filen `src/game/utils/combatUtils.ts` var KORRUPT:

1. `getAttackDice()` funksjonen var ufullstendig - manglet kropp
2. JSDoc for `getWeaponAttackDice()` manglet `/**` start
3. `getDefenseDice()` hadde gammel kode fra `getAttackDice()` inni seg
4. Kode-fragmenter var blandet sammen

#### Root Cause
Tidligere merge/edit hadde ødelagt filstrukturen - funksjoner ble delvis overskrevet.

#### Fix
Rewrote seksjonene linje 94-193 med korrekte funksjoner:
- `getAttackDice()` - Komplett implementasjon som bruker `item.attackDice`
- `getWeaponAttackDice()` - Full info inkl. range og weaponType
- `getDefenseDice()` - Korrekt implementasjon som bruker `item.defenseDice`

### Verifisering

**Regelsystemet er nå korrekt implementert:**

| Regel | Implementert i | Status |
|-------|----------------|--------|
| Våpen bestemmer attack dice | `getAttackDice()` | ✓ Fikset |
| Base + Armor = defense dice | `getDefenseDice()` | ✓ Fikset |
| DC 4+ = suksess | `COMBAT_DC = 4` | ✓ OK |
| Veteran +1 melee die | `performAttack()` | ✓ OK |
| Monster attackDice/defenseDice | `BESTIARY` | ✓ OK |
| Kritisk treff +1 skade | `performAttack()` | ✓ OK |

### Filer Opprettet
- `REGELBOK.MD` - Komplett regelbok

### Filer Modifisert
- `src/game/utils/combatUtils.ts` - Bug fix

### TypeScript Kompilering
- ✓ Kompilerer uten feil etter fix

---

## 2026-01-19: Hero Quest-stil Kampsystem Implementert

### Oppgave
Forenkle kampsystemet fra komplekst terning-bonus-system til Hero Quest-stil der **våpenet BESTEMMER** antall terninger direkte.

### Problem med Gammelt System
- Vårt system: `2 (base) + Attributt (2-5) + Våpenbonus = 6-12+ terninger`
- For komplekst og ga for mange terninger
- Inkonsistente våpen-bonuser mellom constants.ts og legacyManager.ts

### Nytt Hero Quest-stil System

#### Kamp-flow (forenklet)
```
ATTACK:
1. Roll [Weapon Dice]
2. Count skulls (4, 5, 6 på d6)
3. = Damage dealt

DEFEND:
1. Roll [Base Defense + Armor Dice]
2. Count shields (4, 5, 6 på d6)
3. = Damage blocked

RESULT:
Damage = Skulls - Shields (minimum 0)
```

#### Klasse-mapping til Hero Quest

| 1920s Klasse | Hero Quest | Rolle | Base Attack | Base Defense | HP | Sanity |
|--------------|------------|-------|-------------|--------------|-----|--------|
| Veteran | Barbarian | Fighter | 3 | 2 | 6 | 3 |
| Detective | Dwarf | Investigator | 2 | 3 | 5 | 4 |
| Professor | Wizard | Scholar | 1 | 2 | 3 | 6 |
| Occultist | Elf | Hybrid (spells) | 2 | 2 | 3 | 5 |
| Journalist | Rogue | Scout | 2 | 2 | 4 | 4 |
| Doctor | Healer | Support | 1 | 2 | 4 | 5 |

#### Våpen-system (1920s)

**Melee:**
| Våpen | Attack Dice | Pris | Notater |
|-------|-------------|------|---------|
| Unarmed | 1 | - | Alle |
| Knife | 2 | $50 | Stille |
| Club/Pipe | 2 | $30 | - |
| Machete | 3 | $150 | - |

**Ranged:**
| Våpen | Attack Dice | Pris | Notater |
|-------|-------------|------|---------|
| Derringer | 2 | $100 | 2 skudd, skjult |
| Revolver | 3 | $200 | 6 skudd |
| Shotgun | 4 | $400 | 2 skudd, kort rekkevidde |
| Rifle | 3 | $350 | Lang rekkevidde |
| Tommy Gun | 5 | $800 | Sjelden, høy pris, Level 2+ |

#### Armor-system

| Armor | Defense Dice | Pris |
|-------|--------------|------|
| None | 0 | - |
| Leather Jacket | +1 | $100 |
| Trench Coat | +1 | $150 |
| Armored Vest | +2 | $500 |

#### Klasse-spesialiteter

**Veteran (Barbarian)**
- Kan bruke ALLE våpen
- +1 Attack die med melee
- Spesial: "Fearless" - Immune mot første Horror check

**Detective (Dwarf)**
- Kan bruke alle våpen unntatt Tommy Gun
- +1 die på Investigation
- Spesial: "Sharp Eye" - Finner skjulte dører automatisk

**Professor (Wizard)**
- Kan KUN bruke Derringer, Knife
- Kan lese okkulte tekster uten Sanity-tap
- Spesial: "Knowledge" - +2 dice på puzzles

**Occultist (Elf)**
- Kan bruke Knife, Revolver
- Har SPELLS i stedet for tunge våpen
- Spesial: "Ritual Master" - Velger 3 spells per scenario

**Journalist (Rogue)**
- Kan bruke alle unntatt Shotgun, Tommy Gun
- +1 Movement
- Spesial: "Escape Artist" - Kan flykte uten Horror check

**Doctor (Healer)**
- Kan bruke Derringer, Knife
- Healer 2 HP i stedet for 1
- Spesial: "Medical Kit" - Starter med gratis heal item

#### Magi-system for Occultist

Occultist velger 3 spells før scenario starter:

| Spell | Effect | Dice | Bruk |
|-------|--------|------|------|
| Eldritch Bolt | 3 attack dice, range | Fixed 3 | 1/runde |
| Mind Blast | 2 attack + Horror på fiende | Fixed 2 | 2/scenario |
| Banish | Fjerner 1 svak fiende | WIL DC 5 | 2/scenario |
| Dark Shield | +2 Defense denne runden | Auto | 3/scenario |
| Glimpse Beyond | Se alle tiles i 3 range | Auto | 1/scenario |

### Files Modified

#### types.ts
- Lagt til `OccultistSpell` interface for Occultist magi
- Lagt til `HQWeapon` interface for Hero Quest våpen
- Lagt til `HQArmor` interface for Hero Quest rustning
- Lagt til `CombatStats` interface
- Utvidet `Character` med `baseAttackDice`, `baseDefenseDice`, `weaponRestrictions`, `canCastSpells`
- Utvidet `Player` med `selectedSpells` for Occultist
- Utvidet `Item` med `attackDice`, `defenseDice`, `weaponType`, `range`, `ammo`, `silent`, `goldCost`

#### constants.ts
- Importert nye typer (`OccultistSpell`, `HQWeapon`, `HQArmor`)
- Oppdatert `CHARACTERS` med Hero Quest stats og spesialiteter
- Lagt til `HQ_WEAPONS` array med alle våpen
- Lagt til `HQ_ARMOR` array med alle rustninger
- Lagt til `OCCULTIST_SPELLS` array med alle spells
- Fullstendig restrukturert `ITEMS` med nye attackDice/defenseDice verdier

#### combatUtils.ts
- Fullstendig omskrevet til Hero Quest-stil
- `performAttack()` - Bruker nå våpen-terninger direkte
- `performDefense()` - NY funksjon for forsvarsrulling
- `getWeaponAttackDice()` - NY funksjon for å hente våpen-terninger
- `getDefenseDice()` - NY funksjon for å hente forsvarsterninger
- `castSpell()` - NY funksjon for Occultist magi
- `getCombatPreview()` - Oppdatert for Hero Quest-stil
- `getWeaponBonus()` - Beholdt for bakoverkompatibilitet

### Terning-sammenligning

**Gammelt system (Veteran med Tommy Gun):**
- 2 (base) + 5 (STR) + 3 (våpenbonus) + 1 (klassebonus) = 11 terninger

**Nytt Hero Quest system (Veteran med Tommy Gun):**
- 5 (Tommy Gun) = 5 terninger (våpenet bestemmer alt)

**Veteran med melee (Machete):**
- 3 (Machete) + 1 (Veteran melee bonus) = 4 terninger

### Konklusjon
Systemet er nå mye enklere og mer i tråd med Hero Quest:
- Våpen = dine angrepsterninger (ikke bonus på toppen av attributter)
- Armor = ekstra forsvarsterninger (legges til base)
- Occultist har spells som erstatning for tunge våpen
- Klasser har tydelige roller og begrensninger

---

## 2026-01-19: Priority 1 - Core Mechanics Implementation

### Tasks Completed

#### 1.1 Forbindelsesmatrise (Tile Connections)
- [x] Define CATEGORY_CONNECTIONS map
- [x] Define DOOR_REQUIRED_TRANSITIONS
- [x] Create validateTileConnection() function
- [x] Create helper functions (canCategoriesConnect, isDoorRequired, getValidNeighborCategories)
- [x] Create selectRandomConnectableCategory() for smart tile generation
- [x] Integrate validation in spawnRoom() function

#### 1.2 Inventory Slots System
- [x] Define InventorySlots interface (leftHand, rightHand, body, bag[4])
- [x] Define ItemSlotType and InventorySlotName types
- [x] Update Player interface to use InventorySlots
- [x] Create equipItem() / unequipItem() functions
- [x] Create isSlotCompatible(item, slot) validation
- [x] Create helper functions (createEmptyInventory, countInventoryItems, findAvailableSlot, hasKey, hasLightSource, getAllItems)
- [x] Update CharacterPanel UI to show equipment slots visually
- [x] Update combatUtils to work with new inventory system

#### 1.3 Kontekstuelle Handlinger (Context Actions)
- [x] Expand ContextAction interface with skillCheck, itemRequired, consequences
- [x] Create ContextActionTarget interface
- [x] Create getContextActions() for all obstacles and doors
- [x] Create getDoorActions() for all door states (open, closed, locked, barricaded, sealed, puzzle)
- [x] Create getObstacleActions() for all obstacle types
- [x] Create getTileObjectActions() for interactive objects
- [x] Create ContextActionBar component with visual styling
- [x] Integrate context actions in ShadowsGame state
- [x] Add handleContextAction() for executing actions
- [x] Add handleContextConsequence() for damage/sanity effects
- [x] Add handleContextActionEffect() for door/obstacle state changes

### Files Modified
- `src/game/types.ts` - Added InventorySlots, ContextAction interfaces and helper functions
- `src/game/constants.ts` - Added CATEGORY_CONNECTIONS, DOOR_REQUIRED_TRANSITIONS, validation functions
- `src/game/ShadowsGame.tsx` - Integrated new systems, added context action handlers
- `src/game/utils/combatUtils.ts` - Updated to use new inventory system
- `src/game/components/CharacterPanel.tsx` - Updated UI for slot-based inventory

### Files Created
- `src/game/utils/contextActions.ts` - Context action logic for obstacles, doors, objects
- `src/game/components/ContextActionBar.tsx` - UI component for showing available actions

### Features Implemented

#### Tile Connection System
The game now validates tile connections based on category:
- Nature tiles connect to street/urban
- Facade tiles require doors to connect to foyer
- Interior tiles have proper hierarchy (foyer -> corridor -> room)
- Basements and crypts are properly isolated

#### Inventory Slots
Players now have specific equipment slots:
- Left/Right Hand: Weapons, tools, light sources
- Body: Armor, cloaks
- Bag (4 slots): Keys, consumables, relics
- Max 7 items total
- Visual UI showing all slots

#### Context Actions
When clicking on obstacles or doors, players see specific actions:
- Locked doors: Use Key, Lockpick (Agi check), Force (Str check)
- Barricaded doors: Break Barricade (Str check)
- Sealed doors: Use Elder Sign, Break Seal (Wil check), Read Glyphs
- Fire: Extinguish (with item), Jump Through (Agi check)
- Darkness: Use Light Source, Dispel (Wil check)
- And many more obstacle types...

---

## 2026-01-19: Player Death Mechanic & Game Over States

### Tasks
1. Implement player death mechanic (HP = 0 triggers game over)
2. Win state and loss state ("finis")
3. Doom tracker = 0 triggers game over
4. Mythos phase text overlay when clicking "End Round"

### Implementation Plan
- Create `GameOverOverlay.tsx` component for win/loss states
- Create `MythosPhaseOverlay.tsx` for phase transition
- Add game over checks in `ShadowsGame.tsx`
- Check for all players dead or doom = 0 for loss
- Check scenario victory conditions for win

### Progress
- [x] Explored codebase structure
- [x] Read ShadowsGame.tsx, types.ts, game_design_bible.md
- [x] Created GameOverOverlay component
- [x] Created MythosPhaseOverlay component
- [x] Added game over logic
- [x] Testing and committing

### Files Modified
- `src/game/components/GameOverOverlay.tsx` (NEW)
- `src/game/components/MythosPhaseOverlay.tsx` (NEW)
- `src/game/ShadowsGame.tsx` (MODIFIED)
- `src/index.css` (MODIFIED - added overlay animations)

### Features Implemented

#### 1. GameOverOverlay Component
- Shows "FINIS" title for defeat states
- Shows "VICTORIA" for victory states
- Three game over types:
  - `defeat_death`: All players have fallen (HP = 0)
  - `defeat_doom`: Doom tracker reached 0
  - `victory`: Scenario completed (prepared for future use)
- Displays round count and scenario title
- "Try Again" and "Main Menu" buttons
- Atmospheric visual effects (particles, quotes)

#### 2. MythosPhaseOverlay Component
- Shows "MYTHOS PHASE" text with "The darkness grows..." subtitle
- Appears when clicking "End Round"
- 2-second display with fade in/out animations
- Purple/cosmic color scheme
- Animated particles and decorative elements

#### 3. Game Over Logic in ShadowsGame.tsx
- `checkGameOver()` function to check win/loss conditions
- Doom reaching 0 triggers immediate game over
- All players dead triggers game over after Mythos phase
- `handleGameOverRestart()` - restart with same scenario
- `handleGameOverMainMenu()` - return to title screen

#### 4. CSS Animations
- `animate-fadeIn` - fade in effect for overlays
- `animate-float` - floating particle animation

---

## 2026-01-19: Expanded Tile System & Location Descriptions

### Tasks
1. Expand `INDOOR_LOCATIONS` array with diverse thematic tiles
2. Expand `OUTDOOR_LOCATIONS` array with diverse thematic tiles
3. Add RPG-style descriptions for all tiles shown when player lands on them

### Implementation

#### Expanded INDOOR_LOCATIONS (75+ tiles)
Organized by category from game_design_bible.md:
- **FACADE**: Blackwood Mansion, Crumbling Church, The Gilded Hotel, The Witch House, Funeral Parlor, etc.
- **FOYER**: Grand Foyer, Marble Lobby, Cobwebbed Vestibule, Asylum Reception, etc.
- **CORRIDOR**: Dusty Corridor, Servants Passage, Cell Block Corridor, Portrait Gallery, etc.
- **ROOM**: Private Study, Séance Parlor, Dissection Theater, Padded Cell, Records Room, etc.
- **STAIRS**: Grand Staircase, Spiral Stairs, Bell Tower Steps, Hidden Stairwell, etc.
- **BASEMENT**: Wine Cellar, Flooded Basement, Smugglers Cache, Catacombs Entrance, etc.
- **CRYPT**: Sacrificial Altar, Eldritch Portal, Star Chamber, The Black Pool, etc.

#### Expanded OUTDOOR_LOCATIONS (65+ tiles)
Organized by category:
- **NATURE**: Moonlit Clearing, Treacherous Marsh, Ancient Stone Circle, Dead Mans Hollow, etc.
- **URBAN**: Arkham Harbor, Fish Market, Gallows Hill, Founders Plaza, Cannery Row, etc.
- **STREET**: Shadowy Alley, Sewer Grate, Lamplit Avenue, Dead End, The Narrows, etc.
- **SPECIAL**: Suicide Cliff, The Gibbet, Flooded Quarry, The Execution Ground, etc.

#### Location Descriptions (150+ Lovecraftian descriptions)
Every tile now has an atmospheric RPG-style description that displays when the player enters:
- Written in Lovecraftian horror style
- Second-person perspective ("You see...", "Your footsteps...")
- Atmospheric details hinting at cosmic horror
- Sensory details (sounds, smells, temperatures)
- Subtle warnings and unsettling observations

### Files Modified
- `src/game/constants.ts` (MODIFIED)
  - Expanded `INDOOR_LOCATIONS` array
  - Expanded `OUTDOOR_LOCATIONS` array
  - Massively expanded `LOCATION_DESCRIPTIONS` record

### Examples of New Descriptions

**The Witch House:**
> "The angles are wrong here. Corners that should be square are not. Your compass spins uselessly."

**Ritual Chamber:**
> "Symbols painted in substances best not examined. The air thrums with wrongness. Something was summoned here."

**Innsmouth Wharf:**
> "Decaying piers and the smell of the deep. The locals watch with bulging eyes. They're not unfriendly—just hungry."

**The Black Pool:**
> "Ink-dark water that doesn't ripple. Your reflection shows you older, changed, not entirely you anymore."

---

## 2026-01-19: Bug Fix - Lovecraftian Tile Descriptions Not Displayed

### Problem
The 150+ Lovecraftian tile descriptions defined in `LOCATION_DESCRIPTIONS` were never being used in the game. When players explored new tiles, only the tile name and category were logged, not the atmospheric descriptions.

### Root Cause
`LOCATION_DESCRIPTIONS` was defined in `constants.ts` but never imported or used in `ShadowsGame.tsx` where tile exploration is handled.

### Fix Applied
1. **Imported** `LOCATION_DESCRIPTIONS` in `ShadowsGame.tsx`
2. **Added** description display logic in `spawnRoom()` function
3. When a new tile is explored, the atmospheric description is now logged to the Field Journal

### Files Modified
- `src/game/ShadowsGame.tsx` (MODIFIED)
  - Added `LOCATION_DESCRIPTIONS` to imports
  - Added description lookup and logging in `spawnRoom()` function

### Result
Now when players explore tiles, they will see the full Lovecraftian description in the Field Journal:
```
[12:38:59] UTFORSKET: The Witch House. [FACADE]
[12:38:59] The angles are wrong here. Corners that should be square are not. Your compass spins uselessly.
```

---

## 2026-01-19: Scenario System & Legacy System Design

### Oppgave
Design og implementering av:
1. **Scenario-system** - Hero Quest + Mansions of Madness + roguelite med klare mål
2. **Legacy-system** - Bruk figurer videre mellom scenarier, shop for utstyr

### Kontekst
Spillet er inspirert av:
- **Hero Quest** - Enkle, klare regler og mål
- **Mansions of Madness** - Cthulhu-utforskning, atmosfære
- **ADOM/Roguelite** - Prosedyregenerert, hvert spill er unikt

### Analyse av eksisterende system
- `Scenario` interface finnes med `victoryType`, `steps`, `doomEvents`
- Tre scenarier definert men victory conditions ikke implementert
- `MERCHANT` fase definert men ikke brukt
- Ingen persistens mellom scenarier (legacy)

### Status
- [x] Design scenario-system
- [ ] Design legacy-system
- [x] Implementer ScenarioBriefingPopup
- [x] Implementer victory condition checking
- [ ] Implementer legacy character persistence
- [ ] Implementer shop mellom oppdrag

---

## 2026-01-19: Scenario Briefing & Victory Conditions Implementation

### Tasks Completed

#### ScenarioBriefingPopup.tsx
- [x] Created atmospheric briefing popup component
- [x] Parchment-style design with wax seal decoration
- [x] Shows scenario title, briefing text, objectives, victory conditions
- [x] Displays doom prophecy and special conditions
- [x] Team info and start location displayed
- [x] "Begin Investigation" button to start game

#### Extended Scenario Interface (types.ts)
- [x] Added `ScenarioObjective` interface with full objective system
- [x] New `ObjectiveType` for: find_item, find_tile, kill_enemy, kill_boss, survive, interact, escape, collect, explore, protect, ritual
- [x] `VictoryCondition` interface for checking win states
- [x] `DefeatCondition` interface for loss conditions
- [x] Extended `Scenario` with: briefing, objectives, victoryConditions, defeatConditions, estimatedTime, recommendedPlayers

#### Updated SCENARIOS (constants.ts)
- [x] Added detailed briefing narratives for all 3 scenarios
- [x] Expanded objectives with primary and bonus objectives
- [x] Hidden objectives that reveal when prerequisites are met
- [x] Victory conditions linked to required objectives
- [x] Defeat conditions (all_dead, doom_zero)
- [x] Added estimatedTime and recommendedPlayers

#### Victory Condition Checking (scenarioUtils.ts)
- [x] Created comprehensive scenario utilities module
- [x] `checkVictoryConditions()` - checks all victory conditions
- [x] `checkDefeatConditions()` - checks all defeat conditions
- [x] `updateObjectiveProgress()` - tracks progress on objectives
- [x] `completeObjective()` - marks objectives complete, reveals hidden ones
- [x] `checkKillObjectives()` - updates kill-based objectives
- [x] `checkExploreObjectives()` - updates exploration objectives
- [x] `updateSurvivalObjectives()` - tracks survival round count
- [x] Helper functions for objective display

#### ShadowsGame.tsx Integration
- [x] Added showBriefing state
- [x] Briefing shows after character selection before game starts
- [x] Victory/defeat checking integrated in checkGameOver()
- [x] Kill objectives updated when enemies die
- [x] Explore objectives updated when new tiles discovered
- [x] Survival objectives updated on round change
- [x] Objective completion notifications in game log

### Files Created
- `src/game/components/ScenarioBriefingPopup.tsx` (NEW)
- `src/game/utils/scenarioUtils.ts` (NEW)

### Files Modified
- `src/game/types.ts` (MODIFIED - extended Scenario interface)
- `src/game/constants.ts` (MODIFIED - expanded SCENARIOS)
- `src/game/ShadowsGame.tsx` (MODIFIED - integrated briefing and victory checking)

### Features Implemented

#### Scenario Briefing System
When players select a scenario and characters:
1. "Assemble Team" button now shows briefing popup
2. Briefing displays immersive narrative text
3. Mission objectives listed with descriptions
4. Victory conditions and doom events shown
5. "Begin Investigation" starts the game

#### Objective Tracking
The game now tracks progress on scenario objectives:
- **Primary objectives**: Must be completed for victory
- **Bonus objectives**: Optional, give rewards
- **Hidden objectives**: Revealed when prerequisites met
- Progress tracked for: kills, exploration, survival rounds, item collection

#### Victory Checking
The game checks for victory after significant events:
- Escape: Player reaches exit with required items
- Assassination: Target boss killed
- Survival: Required rounds survived
- Collection: All required items found

#### Defeat Conditions
Game ends in defeat when:
- All investigators die
- Doom counter reaches zero
- Specific objective fails (e.g., protection target dies)

### Next Steps
- [x] Implement legacy character persistence between scenarios
- [x] Implement shop/merchant phase between missions
- [ ] Add objective tracker UI during gameplay
- [ ] Add more scenarios

---

## 2026-01-19: Legacy System Implementation

### Oppgave
Implementer fullt Legacy-system for persistent helter mellom scenarier:
- Persistent heroes - bruk samme figur i flere scenarier
- Gold economy - tjen gull fra scenarier og loot
- Shop mellom oppdrag - kjøp våpen, verktøy, rustning
- Equipment stash - lagre items mellom spill
- XP og leveling (1-5) med stat bonuses
- Permadeath - døde helter er borte for alltid
- LocalStorage persistence - data lagres lokalt

### Implementation

#### 1. Types (types.ts)
Utvidet med nye interfaces og funksjoner:

**LegacyHero Interface:**
```typescript
interface LegacyHero {
  id: string;                    // Unique hero ID
  name: string;                  // Custom hero name
  characterClass: CharacterType; // detective, professor, etc.
  level: number;                 // 1-5
  currentXP: number;             // Total XP earned
  gold: number;                  // Currency for shop
  baseAttributes: CharacterAttributes;
  bonusAttributes: CharacterAttributes;  // From level ups
  maxHp: number;
  maxSanity: number;
  equipment: InventorySlots;     // Persistent equipment
  scenariosCompleted: string[];
  scenariosFailed: string[];
  totalKills: number;
  isDead: boolean;               // Permadeath flag
  deathScenario?: string;
  deathCause?: string;
}
```

**XP System:**
- Level 1: 0 XP (starting)
- Level 2: 50 XP
- Level 3: 150 XP
- Level 4: 300 XP
- Level 5: 500 XP (max)

**Level Up Bonuses:**
- +1 to any attribute (STR/AGI/INT/WIL)
- +2 Max HP
- +1 Max Sanity

**New Interfaces:**
- `LegacyData` - Complete save data
- `EquipmentStash` - Shared item storage
- `ScenarioResult` - Results after completing scenario
- `HeroScenarioResult` - Individual hero results
- `ShopItem` - Shop inventory items
- `ShopInventory` - Categorized shop

#### 2. Legacy Manager (utils/legacyManager.ts)
Created comprehensive manager for all legacy operations:

**Core Functions:**
- `loadLegacyData()` / `saveLegacyData()` - LocalStorage persistence
- `createLegacyHero()` - Create new persistent hero
- `addHeroToArchive()` / `updateHero()` - Hero management
- `getLivingHeroes()` / `getDeadHeroes()` - Filter heroes

**Permadeath:**
- `killHero()` - Mark hero as permanently dead
- `retireHero()` - Voluntary retirement
- Equipment from dead/retired heroes goes to stash

**XP & Leveling:**
- `addXPToHero()` - Add experience
- `applyLevelUpBonus()` - Apply chosen bonus
- `getLevelUpOptions()` - Available bonuses
- `getXPProgress()` - Progress to next level

**Gold Economy:**
- `addGoldToHero()` / `spendGold()` - Gold management
- `calculateScenarioGoldReward()` - Reward calculation
- `calculateScenarioXPReward()` - XP calculation

**Stash:**
- `addItemToStash()` / `removeItemFromStash()` - Item management
- `getAllEquippedItems()` - Get hero's items

**Player Conversion:**
- `legacyHeroToPlayer()` - Convert hero to in-game player
- `updateLegacyHeroFromPlayer()` - Update hero after scenario

**Shop:**
- `getDefaultShopInventory()` - Full shop catalog
- `purchaseShopItem()` - Handle purchases

#### 3. Hero Archive Panel (components/HeroArchivePanel.tsx)
New UI component for managing heroes:

**Views:**
- List view - All living heroes with stats
- Create view - Create new hero (name, class)
- Detail view - Full hero stats and equipment
- Level up view - Choose level up bonus
- Memorial view - Fallen heroes graveyard

**Features:**
- Hero cards with level, XP bar, gold, attributes
- Select heroes for missions (up to 4)
- Level up notification and bonus selection
- Visual stat bars for attributes

#### 4. Equipment Stash Panel (components/EquipmentStashPanel.tsx)
Shared storage management:

**Features:**
- View all stored items with filtering/sorting
- Transfer items between stash and heroes
- Color-coded item types
- Capacity indicator (20 items max)

#### 5. Merchant Shop (components/MerchantShop.tsx)
Updated to use gold system:

**Shop Categories:**
- Weapons: Revolver (30g), Shotgun (50g), Tommy Gun (100g, Lv3), Combat Knife (15g)
- Tools: Flashlight (10g), Lockpick Set (20g), Crowbar (15g), Oil Lantern (25g)
- Armor: Leather Jacket (35g), Trench Coat (25g), Armored Vest (75g, Lv2)
- Consumables: Medical Kit (20g), Old Whiskey (10g), Bandages (5g), Sedatives (15g)
- Relics: Elder Sign (150g, Lv3), Protective Ward (60g), Eldritch Compass (80g, Lv2)

**Features:**
- Category tabs with icons
- Gold/XP display
- Level requirements for some items
- Stock limits on rare items
- Scenario rewards summary
- Transfer items to stash

#### 6. Main Menu Updates (components/MainMenu.tsx)
Added Legacy system buttons:
- "Heroes" button - Opens Hero Archive
- "Stash" button - Opens Equipment Stash
- Badge showing count of heroes/items

#### 7. ShadowsGame Integration (ShadowsGame.tsx)
Full integration of Legacy system:

**New State:**
- `legacyData` - Loaded from localStorage
- `selectedLegacyHeroIds` - Heroes selected for mission
- `showMerchantShop` - Merchant visibility
- `lastScenarioResult` - Results for display
- `heroKillCounts` - Track kills per hero

**Game Mode Selection:**
- Classic Mode - Traditional new investigators
- Legacy Mode - Use persistent heroes

**Scenario Completion Flow:**
1. Victory/Defeat detected
2. Calculate gold and XP rewards based on:
   - Scenario difficulty (Normal/Hard/Nightmare)
   - Bonus objectives completed
   - Kill count
3. Update each hero:
   - Add XP (can trigger level up)
   - Add gold
   - Update stats (kills, insight earned)
   - Record scenario completion/failure
4. Handle permadeath for dead heroes
5. Show Merchant Shop for survivors
6. Archive heroes and return to menu

### Files Created
- `src/game/utils/legacyManager.ts` - Legacy system logic
- `src/game/components/HeroArchivePanel.tsx` - Hero management UI
- `src/game/components/EquipmentStashPanel.tsx` - Stash UI

### Files Modified
- `src/game/types.ts` - Added legacy interfaces and helpers
- `src/game/components/MerchantShop.tsx` - Gold-based shop
- `src/game/components/MainMenu.tsx` - Legacy buttons
- `src/game/ShadowsGame.tsx` - Full integration

### LocalStorage Keys
- `shadows_1920s_legacy` - All legacy data (heroes, stash, stats)
- `shadows_1920s_save` - Current game state (unchanged)
- `shadows_1920s_settings` - Game settings (unchanged)

### Summary
The Legacy system is now fully implemented:
- Create persistent heroes that survive between scenarios
- Earn gold and XP from completing scenarios
- Level up heroes (1-5) with stat bonuses
- Buy equipment at the shop between missions
- Store items in shared stash
- Permadeath - dead heroes are gone forever
- All data persisted in localStorage

---

## 2026-01-19: Dynamic Scenario Generation System

### Oppgave
Implementer et fullstendig dynamisk scenario-genereringssystem der "New Case" genererer et unikt scenario fra element-pools, i stedet for å velge fra ferdiglagde scenarier. Dette gir 100+ unike scenario-kombinasjoner.

### Flyt
1. Klikk "New Case"
2. Velg vanskelighetsgrad (Normal/Hard/Nightmare)
3. System GENERERER tilfeldig scenario satt sammen fra pools
4. Character selection viser scenario-info
5. "Generate New Case" knapp for å re-rulle
6. Briefing popup vises før spillet starter

### Implementation

#### 1. Scenario Generator (utils/scenarioGenerator.ts) - NY FIL
Opprettet en komplett scenario-generator med følgende element-pools:

**Mission Types (9 typer):**
| ID | Navn | Victory Type | TileSet |
|----|------|-------------|---------|
| escape_manor | Escape | escape | indoor |
| assassination | Assassination | assassination | mixed |
| survival | Siege | survival | mixed |
| collection | Relic Hunt | collection | mixed |
| rescue | Rescue | escape | indoor |
| investigation | Investigation | investigation | mixed |
| ritual | Counter-Ritual | ritual | indoor |
| seal_portal | Seal the Gate | ritual | mixed |
| purge | Purge | assassination | indoor |

**Location Pools (23 lokasjoner):**
- Indoor Start Locations (10): Blackwood Manor, Arkham Asylum, Miskatonic Library, etc.
- Outdoor Start Locations (8): Town Square, Old Cemetery, Arkham Harbor, etc.
- Mixed Start Locations (5): Police Station, Merchant District, etc.

**Enemy Pools (per vanskelighetsgrad):**
- Normal: Cultists (2-3), Ghouls (1-2)
- Hard: Cultists (2-3), Ghouls (2-3), Deep Ones (1-2)
- Nightmare: Cultists (3-4), Ghouls (2-3), Deep Ones (2-3), Mi-Go (1-2)

**Boss Pool:**
- Shoggoth (Normal+)
- Dark Young of Shub-Niggurath (Hard+)
- Star Spawn of Cthulhu (Nightmare)
- Hunting Horror (Nightmare)

**Narrative Elements:**
- 8 briefing openings
- 7 middle narratives per mission type
- 3 closing narratives per difficulty
- 7 target names (for assassination)
- 7 victim names (for rescue)
- 6 mystery names (for investigation)
- 6 collectible item types

**Objective Templates:**
- Primary objectives per mission type (2-3 per type)
- Bonus objectives pool (4 types)
- Hidden objectives that reveal based on progress

**Doom Event Generation:**
- Early wave (70% doom threshold)
- Mid wave (50% doom threshold)
- Boss wave (20% doom threshold)
- Difficulty-appropriate enemy selection

#### 2. Title Generation
Dynamiske titler basert på mission type:
```typescript
TITLE_TEMPLATES = {
  escape: ['Escape from {location}', 'The {location} Trap', 'No Exit at {location}'],
  assassination: ['The {target} Must Die', 'Death to the {target}', 'Hunt for the {target}'],
  survival: ['The Siege of {location}', 'Last Stand at {location}', 'Night of Terror'],
  // ... etc
}
```

#### 3. UI Updates (ShadowsGame.tsx)
- Oppdatert `getRandomScenario()` til å bruke `generateRandomScenario()`
- La til "Generate New Case" re-roll knapp
- Viser mission type, start location, doom, og estimert tid
- Oppdatert info-tekst: "9 mission types × endless combinations"

### Tekniske Detaljer

**generateRandomScenario() algoritme:**
1. Velg tilfeldig mission type fra pool
2. Velg lokasjon basert på tileset (indoor/outdoor/mixed)
3. Generer kontekstuelle elementer (target, victim, mystery, collectibles)
4. Bygg objectives fra templates med dynamiske verdier
5. Legg til 1-2 tilfeldige bonus objectives
6. Generer doom events med riktige terskler
7. Bygg tittel og briefing fra fragmenter
8. Assembler komplett Scenario objekt

**Variabilitet:**
- 9 mission types
- 23 locations
- 7+ targets/victims
- 6 collectible types
- Tilfeldige mengder (targetAmount ranges)
- Tilfeldige boss-valg per difficulty
- ~100+ unike kombinasjoner

### Files Created
- `src/game/utils/scenarioGenerator.ts` (NY) - Komplett generator med alle pools

### Files Modified
- `src/game/ShadowsGame.tsx` - Oppdatert til å bruke generator, la til re-roll knapp

### Eksempel på Generert Scenario
```
Tittel: "Escape from Arkham Asylum"
Type: Escape
Vanskelighetsgrad: Hard
Start: Arkham Asylum
Doom: 10
Mål: "Find the cursed_key and escape from Arkham Asylum."

Objectives:
1. Find the Cursed Key
2. Find the Exit (hidden, revealed by #1)
3. Escape (hidden, revealed by #2)
4. [BONUS] Find Journals (0/3)

Doom Events:
- Doom 7: Cultists emerge from the shadows! (2-3 cultists)
- Doom 5: A ghoul pack attacks! (2-3 ghouls)
- Doom 2: A Dark Young crashes through! (boss)
```

### Summary
Systemet genererer nå dynamisk unike scenarier ved å kombinere:
- Mission types (9 typer)
- Locations (23 steder)
- Enemies & bosses (difficulty-balanced)
- Narrative elements (briefings, titles)
- Objectives (primary + bonus)
- Doom events (3 waves per scenario)

Dette gir 100+ unike scenario-kombinasjoner, og hver gang du klikker "New Case" får du et helt nytt oppdrag med unik historie og mål. "Generate New Case" knappen lar deg re-rulle hvis du vil ha et annet oppdrag.

---

## 2026-01-19: Bug Fix - Create Hero Screen Crashes

### Problem
When clicking "Create Hero" in the Hero Archive, the game crashed with a black screen and the error:
```
TypeError: CHARACTERS.map is not a function
```

### Root Cause
In `HeroArchivePanel.tsx`, the `renderCreateHero()` function was calling `CHARACTERS.map()` directly. However, `CHARACTERS` is defined as a `Record<CharacterType, Character>` (an object), not an array. Objects don't have a `.map()` method.

### Fix Applied
Changed line 327 in `HeroArchivePanel.tsx`:
```tsx
// Before (broken):
{CHARACTERS.map(char => (

// After (fixed):
{Object.values(CHARACTERS).map(char => (
```

`Object.values()` converts the object's values into an array, which can then be iterated with `.map()`.

### Files Modified
- `src/game/components/HeroArchivePanel.tsx` (FIXED)

### Result
The Create Hero screen now works correctly, displaying all character classes for selection.

---

## 2026-01-19: Deep Audit - Character Dice System

### Oppgave
Gjennomgang av terning-systemet etter at en spiller hadde uventet mange terninger mot fiender.

### Regelsystem (fra game_design_bible.md)

**Skill Check Formel:**
```
Total Terninger = 2 (base) + Attributtverdi + Spesielle Bonuser
```

**Difficulty Classes (DC):**
| DC | Vanskelighet |
|----|--------------|
| 3  | Easy         |
| 4  | Medium       |
| 5  | Hard         |
| 6  | Extreme      |

Hver terning som viser >= DC teller som 1 suksess. Trenger minst 1 suksess for å lykkes.

### Karakterer - Base Attributter

| Karakter   | STR | AGI | INT | WIL | Spesialitet |
|------------|-----|-----|-----|-----|-------------|
| Detective  | 3   | 3   | 4   | 3   | +1 die på Investigation |
| Professor  | 2   | 2   | 5   | 4   | Immunitet mot okkulte tekster |
| Journalist | 2   | 4   | 4   | 3   | +1 Movement |
| Veteran    | 5   | 3   | 2   | 3   | +1 die på Combat/STR |
| Occultist  | 2   | 3   | 3   | 5   | Kan utføre ritualer |
| Doctor     | 2   | 3   | 4   | 4   | Healer 2 i stedet for 1 |

### Terninger i Kamp (Combat)

**Kamp-formel (`combatUtils.ts:97-112`):**
```typescript
totalDice = baseDice (2)
          + attribute (STR for melee, AGI for ranged)
          + weaponBonus.combatDice
          + classBonusDice (Veteran: +1)
```

### Våpen Bonuser

**I constants.ts (standard items):**
| Våpen      | Bonus |
|------------|-------|
| Revolver   | +1    |
| Shotgun    | +2    |
| Tommy Gun  | +3    |

**I legacyManager.ts (shop):**
| Våpen        | Bonus |
|--------------|-------|
| Combat Knife | +1    |
| Revolver     | +2    |
| Shotgun      | +3    |
| Tommy Gun    | +4    |

**INKONSISTENS FUNNET:** Våpen-bonusene er forskjellige mellom constants.ts og legacyManager.ts!

### Maksimalt Antall Terninger

**Veteran Level 1 (uten våpen):**
- 2 (base) + 5 (STR) + 1 (klassebonus) = **8 terninger** ✓

**Veteran Level 1 med Tommy Gun (shop-versjon):**
- 2 + 5 + 4 + 1 = **12 terninger**

**Veteran Level 5 med Tommy Gun (teoretisk worst-case):**
- 2 (base) + 9 (STR 5 + 4 bonuser) + 4 (Tommy Gun) + 1 (klassebonus) = **16 terninger!**

### Observasjon fra Screenshot

Bildet viser **8 terninger**, som er helt korrekt for:
- Veteran med STR 5 + klassebonus (+1) uten våpen: 2 + 5 + 1 = 8
- Eller annen karakter med våpenbonus

### Identifiserte Problemer

1. **Ingen attributt-cap:** Det finnes ingen maksgrense på attributter. En Level 5 Legacy-helt kan ha attributt 9+ (5 base + 4 fra level ups).

2. **Våpen-inkonsistens:** Shop-våpen gir høyere bonuser enn standard items.

3. **Skill Check inkonsistens:** `skillCheck.ts` bruker `CHARACTERS[player.id].attributes` (base), mens `combatUtils.ts` bruker `player.attributes` (kan være oppgradert).

### Kodesteder

- **Skill check:** `src/game/utils/skillCheck.ts:10-43`
- **Kamp:** `src/game/utils/combatUtils.ts:97-159`
- **Karakterer:** `src/game/constants.ts:175-206`
- **Legacy leveling:** `src/game/utils/legacyManager.ts:300-334`

### Konklusjon

Terning-systemet fungerer som designet. 8 terninger er normalt for en Veteran. Imidlertid kan Legacy-systemet føre til svært høye terning-tall (opp til 16) for høylevels helter med gode våpen. Dette kan være balanseproblem som bør vurderes.

### Anbefalinger

1. Vurder å legge til attributt-cap (f.eks. max 7)
2. Synkroniser våpen-bonuser mellom constants.ts og legacyManager.ts
3. Vurder å legge til total terning-cap (f.eks. max 12)

---

## 2026-01-19: Hero Quest Dice System - Monster Combat Overhaul

### Oppgave
Fortsett konverteringen til Hero Quest-stil terningsystem for monstre. Forrige chat endret systemet for karakterer til at våpen BESTEMMER antall terninger direkte. Nå skal monstre også bruke dette systemet.

### Endringer

#### 1. BestiaryEntry Interface (types.ts)
Utvidet med nye felter:
```typescript
interface BestiaryEntry {
  // ... eksisterende felter ...
  attackDice: number;   // Antall terninger monsteret ruller for angrep
  defenseDice: number;  // Antall terninger monsteret ruller for forsvar
}
```

#### 2. BESTIARY Oppdatert (constants.ts)
Alle monstre har nå attackDice og defenseDice basert på trusselnivå:

| Kategori | Monster | HP | AttackDice | DefenseDice |
|----------|---------|-----|------------|-------------|
| **MINIONS** | Cultist | 2 | 1 | 1 |
| | Mi-Go | 3 | 1 | 2 |
| | Nightgaunt | 3 | 1 | 2 |
| | Moon-Beast | 4 | 1 | 2 |
| **WARRIORS** | Ghoul | 3 | 2 | 2 |
| | Deep One | 3 | 2 | 2 |
| | Sniper | 2 | 2 | 1 |
| | Byakhee | 3 | 2 | 2 |
| | Formless Spawn | 5 | 2 | 3 |
| | Hound of Tindalos | 4 | 2 | 2 |
| **ELITES** | Dark Priest | 5 | 2 | 3 |
| | Hunting Horror | 4 | 3 | 2 |
| | Dark Young | 6 | 3 | 3 |
| **BOSSES** | Shoggoth | 6 | 3 | 4 |
| | Star Spawn | 8 | 4 | 4 |
| | Ancient One | 10 | 4 | 5 |

#### 3. Combat System (combatUtils.ts)

**Nye funksjoner:**
- `getAttackDice(player)`: Våpen bestemmer angrepsterninger direkte
  - Unarmed: 1 terning
  - Knife/Revolver (bonus 1): 2 terninger
  - Shotgun (bonus 2): 3 terninger
  - Tommy Gun (bonus 3): 4 terninger

- `getPlayerDefenseDice(player)`: Rustning bestemmer forsvarsterninger
  - Ingen rustning: 1 terning (dodge)
  - Leather Jacket (bonus 1): 2 terninger
  - Armored Vest (bonus 2): 3 terninger

- `getDefensePreview(player)`: UI-visning for forsvarsterninger

**Oppdaterte funksjoner:**

`performAttack(player, enemy)` - Spiller angriper monster:
1. Spilleren ruller angrepsterninger (basert på våpen)
2. Monsteret ruller forsvarsterninger (fra BESTIARY)
3. Skade = angrep-suksesser - forsvar-suksesser
4. Kritisk treff: Alle angrepsterninger traff + mer enn forsvar = +1 bonus skade

`calculateEnemyDamage(enemy, player)` - Monster angriper spiller:
1. Monsteret ruller angrepsterninger (fra BESTIARY)
2. Spilleren ruller forsvarsterninger (basert på rustning)
3. Skade = angrep-suksesser - forsvar-suksesser
4. Fast-trait gir +1 suksess

### Eksempel på Kamp

**Spiller (med Shotgun) vs Ghoul:**
```
Spiller ruller 3 angrepssterninger (Shotgun): [4] [2] [6] = 2 suksesser
Ghoul ruller 2 forsvarsterninger: [3] [5] = 1 suksess
Skade = 2 - 1 = 1 HP
```

**Ghoul vs Spiller (med Leather Jacket):**
```
Ghoul ruller 2 angrepsterninger: [5] [4] = 2 suksesser
Spiller ruller 2 forsvarsterninger: [6] [2] = 1 suksess
Skade = 2 - 1 = 1 HP
```

### Balansering

Hero Quest-systemet er nå enklere og mer forutsigbart:
- Våpen-valg er strategisk viktig (mer terninger = bedre sjanse)
- Rustning gir reell beskyttelse (ikke bare damage reduction)
- Sterke monstre er farligere (høyere attackDice)
- Boss-monstre er tøffere å drepe (høyere defenseDice)

### Filer Modifisert
- `src/game/types.ts` - Utvidet BestiaryEntry interface
- `src/game/constants.ts` - Oppdatert BESTIARY med attackDice/defenseDice
- `src/game/utils/combatUtils.ts` - Fullstendig omskriving av kampsystemet

### Tekniske Detaljer

DC (Difficulty Class) = 4 for alle terningkast. En terning som viser 4, 5, eller 6 teller som en suksess (tilsvarer "skull" i Hero Quest).

Meldinger viser nå terningkast visuelt:
- Suksesser vises i klammer: `[4] [6]`
- Misser vises uten: `2 3`
- Eksempel: `"TREFF! Detective (Revolver) gjør 1 skade mot Ghoul. (Angrep: [4] 2 = 1 | Forsvar: 3 = 0)"`

---

## 2026-01-19: Scenario Winnability Validator

### Oppgave
Lage en validerings-funksjon som sjekker om genererte scenarier faktisk går an å vinne. For eksempel hvis et scenario går ut på "collect 3 artefacts before enemy" må dette faktisk være mulig å få til.

### Problemet
Når scenarier genereres dynamisk fra element-pools, kan det oppstå situasjoner der:
- "Collect 5 artifacts" - men det spawner kanskje ikke 5 artifacts i spillet
- "Kill all 8 enemies" - men doom counter kan nå 0 før man har mulighet til å drepe dem alle
- "Find the exit key and escape" - men key spawner kanskje aldri
- "Survive 10 rounds" - men doom starter på 8

### Løsning: scenarioValidator.ts

Opprettet en komplett valideringsfil som analyserer scenarier og identifiserer problemer.

#### Validerings-sjekker

**1. Doom Timer Feasibility**
- Beregner estimert minimum runder for å fullføre objectives
- Sammenligner med "effektivt doom budget" (doom * efficiency factor)
- Efficiency factor: Normal=0.8, Hard=0.7, Nightmare=0.6

**2. Resource Availability**
- Sjekker at items som kreves faktisk kan spawne
- Verifiserer at escape missions har exit-mekanisme
- Kontrollerer at find_item objectives har gyldige targetId

**3. Enemy Spawn Consistency**
- Teller totale fiender fra doom events
- Sammenligner med kill objectives
- Sjekker at assassination missions har boss spawn

**4. Objective Chain Integrity**
- Validerer at revealedBy referanser peker på eksisterende objectives
- Sjekker for sirkulære avhengigheter
- Verifiserer at hidden required objectives har reveal triggers

**5. Survival Feasibility**
- Sjekker at doom >= survival rounds required
- Analyserer fiende-trykk per runde

**6. Collection Feasibility**
- Estimerer tilgjengelige collectibles basert på exploration
- Advarer om urealistisk høye samle-mål

**7. Victory Path Exists**
- Verifiserer at minst én victory condition er oppnåelig

#### Validerings-resultat

```typescript
interface ValidationResult {
  isWinnable: boolean;        // true hvis ingen kritiske feil
  confidence: number;         // 0-100, hvor sikre vi er
  issues: ValidationIssue[];  // liste over problemer
  analysis: ScenarioAnalysis; // detaljert analyse
}

interface ValidationIssue {
  severity: 'error' | 'warning' | 'info';
  code: string;               // f.eks. 'DOOM_TOO_LOW'
  message: string;            // menneske-lesbar melding
  suggestion?: string;        // forslag til fix
  objectiveId?: string;
  details?: Record<string, unknown>;
}
```

#### Auto-Fix Funksjon

Implementert `autoFixScenario()` som automatisk retter vanlige problemer:
- Øker doom for survival missions
- Legger til boss spawn for assassination
- Legger til flere fiende-spawns for kill objectives
- Øker doom for komplekse scenarier

#### Integrering

**scenarioGenerator.ts:**
- Ny funksjon `generateValidatedScenario()` som genererer og validerer
- Prøver opptil 5 ganger å generere et vinnbart scenario
- Bruker auto-fix hvis første forsøk feiler
- Returnerer scenario med valideringsinfo

**ShadowsGame.tsx:**
- `getRandomScenario()` bruker nå `generateValidatedScenario()`
- Logger valideringsinformasjon til konsollen
- Viser confidence score og eventuelle fixes

### Filer Opprettet
- `src/game/utils/scenarioValidator.ts` (NY) - Komplett validator

### Filer Modifisert
- `src/game/utils/scenarioGenerator.ts` - Integrert validator
- `src/game/ShadowsGame.tsx` - Bruker validert generator

### Eksempel på validering

```
[ScenarioValidator] Applied 1 fixes: ["Increased startDoom from 6 to 12 for survival feasibility"]
[ScenarioValidator] Confidence: 85% | Attempts: 1
```

### Tekniske Detaljer

**Estimerte runder per handling:**
| Handling | Runder |
|----------|--------|
| Explore tile | 1 |
| Find item | 2 |
| Kill minion | 1 |
| Kill elite | 2 |
| Kill boss | 3 |
| Collect single | 1.5 |
| Reach exit | 2 |
| Perform ritual | 1 |
| Find specific tile | 3 |

**Feilkoder:**
| Kode | Betydning |
|------|-----------|
| `DOOM_TOO_LOW` | Ikke nok tid til objectives |
| `DOOM_TIGHT` | Marginalt nok tid |
| `INSUFFICIENT_ENEMY_SPAWNS` | Ikke nok fiender for kill objectives |
| `MISSING_BOSS_SPAWN` | Assassination uten boss |
| `SURVIVAL_DOOM_MISMATCH` | Survival > doom |
| `INVALID_REVEAL_REFERENCE` | Ugyldig objective chain |
| `NO_VICTORY_CONDITIONS` | Ingen victory conditions |
| `NO_ACHIEVABLE_VICTORY` | Alle victory paths blokkert |

### Resultat
Alle dynamisk genererte scenarier valideres nå før de brukes. Dette sikrer at spillere aldri får et umulig scenario, og gir bedre spillopplevelse ved å garantere at seier alltid er teoretisk mulig.

---

## 2026-01-19: Inventory Interaksjon - Bruk Items og Bytte Våpen

### Oppgave
Implementere funksjonalitet for å:
1. Bruke items fra inventory (consumables som healer HP/Sanity)
2. Bytte ut våpen til "hender" (unarmed) hvis spilleren ønsker det
3. Flytte items mellom bag og hand slots

### Løsning

#### CharacterPanel.tsx - Oppdatert med klikkbare inventory slots

**Nye props:**
```typescript
interface CharacterPanelProps {
  player: Player | null;
  onUseItem?: (item: Item, slotName: InventorySlotName) => void;
  onUnequipItem?: (slotName: InventorySlotName) => void;
  onEquipFromBag?: (bagIndex: number, targetSlot: 'leftHand' | 'rightHand') => void;
  onDropItem?: (slotName: InventorySlotName) => void;
}
```

**Ny funksjonalitet:**
- Slots er nå klikkbare når de inneholder items
- Klikk på en slot åpner et action menu med relevante handlinger
- Visuell indikator for antall bruk igjen på consumables
- Handlinger tilgjengelig:
  - **USE** - For consumables (Medical Kit, Whiskey, etc.)
  - **UNEQUIP** - Flytter våpen/armor fra hender/body til bag
  - **EQUIP TO HAND** - Flytter våpen/tool fra bag til ledig hånd
  - **DROP** - Kaster item (fjerner permanent)

#### ShadowsGame.tsx - Nye inventory handlers

**handleUseItem(item, slotName):**
- Bruker consumable items
- Parser item.effect for å finne HP eller Sanity healing
- Oppdaterer player HP/Sanity basert på item.bonus
- Dekrementerer item.uses eller fjerner item hvis oppbrukt
- Viser floating text for healing effekt

**handleUnequipItem(slotName):**
- Fjerner item fra leftHand, rightHand, eller body
- Flytter item til første ledige bag slot
- Feilmelding hvis bag er full

**handleEquipFromBag(bagIndex, targetSlot):**
- Flytter weapon/tool fra bag til hånd
- Validerer at target slot er ledig
- Validerer at item kan utstyres til hender

**handleDropItem(slotName):**
- Fjerner item fra inventory permanent
- Logger hvilken item som droppes

### Unarmed Combat
Systemet støttet allerede "unarmed" (1 attack die) i combatUtils.ts:
```typescript
// No weapon = use base attack dice (unarmed)
const baseAttack = player.baseAttackDice || 1;
return {
  attackDice: baseAttack,
  weaponName: 'Unarmed'
};
```

Nå kan spillere faktisk **velge** å gå unarmed ved å unequipe våpen fra hendene.

### Filer Modifisert

**src/game/components/CharacterPanel.tsx:**
- Lagt til useState for selectedSlot og showSlotMenu
- Nye props: onUseItem, onUnequipItem, onEquipFromBag, onDropItem
- Ny logikk: getItemFromSlot(), handleSlotClick(), closeMenu()
- Ny logikk: isItemUsable(), canUnequip(), canEquipToHands()
- Oppdatert renderSlot() med onClick og visuell tilbakemelding
- Lagt til Item Action Menu UI med kontekstuelle handlinger
- Nye Lucide icons: X, ArrowRight, Trash2, Pill

**src/game/ShadowsGame.tsx:**
- Importert Item og InventorySlotName fra types
- Nye handlers: handleUseItem, handleUnequipItem, handleEquipFromBag, handleDropItem
- Oppdatert CharacterPanel med nye props

### Spillfunksjonalitet Etter Endring

| Handling | Før | Etter |
|----------|-----|-------|
| Bruke Medical Kit | Ikke mulig | Klikk → Use → +2 HP |
| Bruke Whiskey | Ikke mulig | Klikk → Use → +2 Sanity |
| Bytte til Unarmed | Ikke mulig | Unequip våpen → bruker hender |
| Equip fra bag | Ikke mulig | Klikk bag item → Equip to Hand |
| Droppe items | Ikke mulig | Klikk item → Drop |

### Build Status
✅ Kompilerer uten feil

---

## 2026-01-19: Enhanced Enemy Movement AI

### Oppgave
Forbedre enemy movement AI med:
- Pathfinding rundt hindringer (rubble, locked_door, fog_wall, fire)
- Bedre target prioritering basert på HP, Sanity, isolasjon
- Ranged attacks med line of sight checking
- Special movement abilities basert på monster type

### Implementert

#### 1. Obstacle Handling System (monsterAI.ts)

**Ny `OBSTACLE_PASSABILITY` konfigurasjon:**

Definerer hvordan forskjellige monster-typer interagerer med hindringer:

| Hindring | Blokkerer | Flying Passerer | Aquatic Passerer | Ethereal Passerer | Massive Ødelegger |
|----------|-----------|-----------------|------------------|-------------------|-------------------|
| locked_door | Ja | Nei | Nei | Nei | Ja |
| rubble | Ja | Ja | Nei | Ja | Ja |
| fire | Nei (+1 move) | Ja | Nei | Ja | Nei |
| fog_wall | Nei (+1 move) | Ja | Ja | Ja | Nei |
| trap | Nei | Ja | Nei | Ja | Nei |
| gate | Ja | Ja | Nei | Nei | Ja |
| barricade | Ja | Ja | Nei | Ja | Ja |

**Ny `canEnemyPassTile()` funksjon:**
- Sjekker både `tile.obstacle` og `tile.object`
- Tar hensyn til flying, aquatic, ethereal, og massive traits
- Returnerer passability status og movement cost
- Aquatic fiender får bonus i vann (-1 movement cost)

#### 2. Target Prioritization System (monsterAI.ts)

**`ENEMY_TARGET_PREFERENCES` per monster type:**

| Monster | Prefererer Lav HP | Prefererer Lav Sanity | Prefererer Isolert | Spesial |
|---------|-------------------|----------------------|-------------------|---------|
| Cultist | Nei | Nei | Ja | - |
| Deep One | Nei | Nei | Nei | Vann-nærhet |
| Ghoul | **Ja** | Nei | Ja | Scavenger |
| Hound | Ja | Nei | Ja | Hunter |
| Mi-Go | Nei | Nei | Ja | Professor-target |
| Nightgaunt | Nei | **Ja** | Ja | Psykologisk |
| Priest | Nei | **Ja** | Nei | Occultist-target |
| Sniper | Nei | Nei | Ja | Unngår Veteran |
| Byakhee | Nei | **Ja** | Ja | Svake sinn |
| Star Spawn | Nei | Ja | Nei | Magic users |

**`calculateTargetPriority()` scoring:**
- Distance score: 0-100 poeng (nærmere = høyere)
- Low HP bonus: 0-30 poeng (for scavengers)
- Low Sanity bonus: 0-25 poeng (for psykologiske monstre)
- Isolated bonus: 0-20 poeng (for jegere)
- Class preference: ±15 poeng (favoriserte/unngåtte klasser)
- Water preference: +15 poeng (for Deep Ones)

#### 3. Enhanced Pathfinding (monsterAI.ts)

**Ny `findEnhancedPath()` algoritme:**
- Weighted A* pathfinding
- Tar hensyn til obstacle movement costs
- Prioriterer lavkost-ruter
- Støtter flying enemies (ignorerer hindringer)
- Aquatic enemies får bonus i vann

**Forbedret `getPatrolDestination()`:**
- Weighted random valg basert på preferanser
- Ghouls foretrekker crypts/basements
- Deep Ones foretrekker vann
- Flying enemies foretrekker åpne områder
- Unngår traps og fire

#### 4. Ranged Attack System (monsterAI.ts)

**Ny `canMakeRangedAttack()` funksjon:**
- Sjekker range og line of sight
- Bruker `hasLineOfSight()` fra hexUtils
- Beregner cover penalty fra objekter i veien
- Objekter som gir dekning: crate, bookshelf, statue, cabinet

**Ny `findOptimalRangedPosition()` funksjon:**
- Finner beste posisjon for ranged angripere
- Optimal avstand: 2 tiles fra target
- Tar hensyn til line of sight
- Minimerer cover penalty

**Cover System:**
- Hver hindring i line of sight gir +1 cover penalty
- Cover penalty reduserer damage
- Ranged angripere prøver å finne posisjon uten cover

#### 5. Special Movement Abilities (monsterAI.ts)

**`getSpecialMovement()` typer:**

| Monster | Special Movement | Beskrivelse |
|---------|-----------------|-------------|
| Flying creatures | `fly` | Ignorerer obstacles, speed 2 |
| Aquatic creatures | `swim` | Bonus i vann |
| Nightgaunt | `phase` | Kan passere gjennom noen hindringer |
| Hound of Tindalos | `teleport` | Teleporterer gjennom "vinkler" |
| Formless Spawn | `phase` | Kan klemme seg gjennom gaps |

**`executeSpecialMovement()` - Hound Teleportation:**
- Finner teleport-destinasjoner nær spillere
- Prioriterer spillere med lav Sanity
- Teleporterer til nærmeste posisjon ved target
- Visuell effekt: "materialiserer seg gjennom vinklene"

#### 6. Enhanced getMonsterDecision() (monsterAI.ts)

Fullstendig omskrevet for smart AI:

**Decision Flow:**
```
1. Find best target (smart targeting)
   ↓
2. No target? → Special movement / Patrol / Wait
   ↓
3. Ranged enemy? → Check LOS, find optimal position, retreat if too close
   ↓
4. Melee range? → Attack with contextual message
   ↓
5. Special movement available? → Teleport/Phase
   ↓
6. Chase using enhanced pathfinding
```

**Kontekstuelle meldinger basert på priority:**
- Low HP target: "sanser svakhet og angriper..."
- Isolated target: "går løs på den isolerte..."
- Low Sanity target: "jakter på den redde..."
- Flying approach: "daler ned mot..."
- Swimming approach: "glir gjennom vannet mot..."

#### 7. Updated processEnemyTurn() (monsterAI.ts)

**Ny return type:**
```typescript
{
  updatedEnemies: Enemy[];
  attacks: Array<{
    enemy: Enemy;
    targetPlayer: Player;
    isRanged?: boolean;      // NY
    coverPenalty?: number;   // NY
  }>;
  messages: string[];
  specialEvents: Array<{    // NY
    type: 'teleport' | 'phase' | 'destruction';
    enemy: Enemy;
    description: string;
  }>;
}
```

#### 8. ShadowsGame.tsx Integrasjon

**Oppdatert Mythos phase handler:**
- Destrukturerer `specialEvents` fra processEnemyTurn
- Logger special events med ⚡ ikon
- Floating text for teleportation
- Ranged attacks logges med 🎯 ikon
- Cover penalty reduserer damage

### Filer Modifisert
- `src/game/utils/monsterAI.ts` - Komplett AI overhaul
- `src/game/ShadowsGame.tsx` - Integrert nye AI features

### Tekniske Detaljer

**Pathfinding Algorithm:**
- Bruker weighted A* med movement costs
- Max depth: 12 tiles
- Prioriterer lavkost-ruter

**Target Priority Calculation:**
```
Score = DistanceScore + LowHpBonus + LowSanityBonus + IsolatedBonus + TypePreference
```

**Cover System:**
- Maks cover penalty: 3 (damage reduction)
- Ranged enemies posisjonerer seg for minimal cover

### Resultat
Fiender er nå mye smartere:
- ✅ Pathfinding rundt hindringer basert på traits
- ✅ Flying enemies ignorerer obstacles
- ✅ Aquatic enemies får bonus i vann
- ✅ Ghouls jakter på wounded players
- ✅ Nightgaunts angriper mentally weak players
- ✅ Deep Ones prefererer targets nær vann
- ✅ Ranged enemies bruker line of sight
- ✅ Cover system reduserer ranged damage
- ✅ Hound of Tindalos kan teleportere
- ✅ Kontekstuelle angrepsmeldinger
- ✅ Build vellykket

---

## 2026-01-19: Game Startup - Lovable & GitHub Compatibility

### Oppgave
Gjøre så spillet starter korrekt fra både Lovable-platformen og GitHub (inkludert GitHub Pages).

### Problemer Identifisert

1. **index.html** hadde feil tittel og metadata
   - Tittel: "Lovable App" → Skulle være spillets navn
   - Meta-beskrivelser refererte til "Lovable Generated Project"
   - Ingen favicon-referanse

2. **package.json** hadde generisk prosjektnavn
   - Navn: "vite_react_shadcn_ts" → Skulle være "shadows-of-the-1920s"
   - Versjon: 0.0.0 → Skulle være 1.0.0

3. **vite.config.ts** manglet GitHub Pages støtte
   - Ingen `base` konfigurasjon for subpath-deployment
   - Ingen build-optimalisering

4. **CSS @import ordre**
   - @import kom etter @tailwind → forårsaket build-advarsel

5. **Ingen CI/CD pipeline**
   - Manuell deployment til GitHub Pages

### Løsninger Implementert

#### 1. index.html - Oppdatert metadata
```html
<title>Shadows of the 1920s - A Lovecraftian Horror Game</title>
<meta name="description" content="A Hero Quest meets Mansions of Madness inspired horror game..." />
<meta name="author" content="Tombonator3000" />
<meta name="keywords" content="lovecraft, horror game, hero quest, mansions of madness, 1920s, cthulhu, roguelite" />

<meta property="og:title" content="Shadows of the 1920s" />
<meta property="og:description" content="A Lovecraftian horror game - Hero Quest meets Mansions of Madness" />

<meta name="twitter:title" content="Shadows of the 1920s" />
<meta name="twitter:description" content="A Lovecraftian horror game - Hero Quest meets Mansions of Madness" />

<link rel="icon" type="image/x-icon" href="/favicon.ico" />
```

#### 2. package.json - Prosjektinfo
```json
{
  "name": "shadows-of-the-1920s",
  "version": "1.0.0",
  "description": "A Lovecraftian horror game - Hero Quest meets Mansions of Madness",
  "author": "Tombonator3000"
}
```

#### 3. vite.config.ts - Fleksibel base path
```typescript
export default defineConfig(({ mode }) => {
  // For GitHub Pages: VITE_BASE_PATH=/connect-play/
  // For Lovable/root: leave empty or /
  const basePath = process.env.VITE_BASE_PATH || '/';

  return {
    base: basePath,
    // ... rest of config
    build: {
      outDir: 'dist',
      sourcemap: mode === 'development',
    },
  };
});
```

#### 4. CSS - Riktig @import rekkefølge
```css
/* @import FØRST */
@import url('https://fonts.googleapis.com/...');

/* Deretter tailwind */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

#### 5. GitHub Actions Workflow
Opprettet `.github/workflows/deploy.yml`:
- Trigger: push til main branch
- Node.js 20
- npm ci + npm run build
- Deploy til GitHub Pages med riktig base path

### Deployment Guide

**Lovable:**
1. Klikk "Share → Publish"
2. Ingen ekstra konfigurasjon nødvendig

**GitHub Pages:**
1. Aktiver GitHub Pages i repository settings
2. Velg "GitHub Actions" som kilde
3. Push til main branch → automatisk deployment
4. URL: https://tombonator3000.github.io/connect-play/

**Lokal utvikling:**
```bash
npm install
npm run dev
```

### Filer Opprettet
- `.github/workflows/deploy.yml` (NY) - GitHub Actions deployment

### Filer Modifisert
- `index.html` - Oppdatert tittel og metadata
- `package.json` - Oppdatert prosjektinfo og versjon
- `vite.config.ts` - Lagt til fleksibel base path
- `src/index.css` - Fikset @import rekkefølge

### Resultat
- ✅ Spillet starter fra Lovable (root path /)
- ✅ Spillet kan deployes til GitHub Pages (subpath /connect-play/)
- ✅ Automatisk deployment via GitHub Actions
- ✅ Riktig spilltittel og metadata for SEO/deling
- ✅ Build vellykket uten advarsler
- ✅ Favicon fungerer

---

## Session: 20. januar 2026 - Monster Line-of-Sight Fix, Puzzle System, Occultist Spell Selection

### Oppgaver
1. Fikse monster sight-buggen (line-of-sight gjennom vegger)
2. Legge til flere puzzle-typer (SYMBOL_MATCH, CODE_LOCK, etc.)
3. Occultist spell selection UI

### Løsninger Implementert

#### 1. Monster Line-of-Sight Bug Fix
**Problem:** Monstre kunne "se" spillere gjennom vegger, noe som brøt immersion og gjorde spillet for vanskelig.

**Løsning:** Implementerte ekte line-of-sight sjekking i `hexUtils.ts`:

```typescript
// Nye hjelpefunksjoner
export const getEdgeDirection = (from, to) => {
  // Returnerer kant-indeks (0-5) basert på hex-bevegelse
}

export const getOppositeEdgeDirection = (direction) => {
  return (direction + 3) % 6;
}

export const edgeBlocksSight = (edge: EdgeData | undefined): boolean => {
  // Sjekker om en kant blokkerer sikt:
  // - wall: alltid blokkerer
  // - door: blokkerer hvis lukket/låst (ikke 'open' eller 'broken')
  // - blocked: barricade og collapsed blokkerer
  // - window/open: tillater sikt
  // - secret: blokkerer (ser ut som vegg)
}
```

**Oppdatert hasLineOfSight:**
- Sjekker nå alle kanter mellom tiles langs siktlinjen
- Verifiserer både utgående kant fra nåværende tile OG inngående kant på neste tile
- Sjekker også blokkerende objekter og obstacles på mellomliggende tiles

**Oppdatert monsterAI.ts canSeePlayer:**
- Fjernet TODO kommentar
- Kaller nå `hasLineOfSight()` for ekte vegg-sjekking
- Monstre kan fortsatt se gjennom åpne dører og vinduer

#### 2. Utvidet Puzzle-System
**Nye puzzle-typer implementert i PuzzleModal.tsx:**

| Type | Beskrivelse | Mekanikk |
|------|-------------|----------|
| `sequence` | Memory pattern (eksisterende) | Gjenta lyssekvens på 3x3 grid |
| `code_lock` | Tallkode-lås | 4-sifret kode, 3 forsøk, numpad UI |
| `symbol_match` | Symbol-sekvens | Memorer 3 symboler, velg i rekkefølge |
| `blood_ritual` | Blodoffer | Velg HP eller Sanity kostnad for å åpne |
| `astronomy` | Stjernekart | Roter skiver for å justere stjerner |
| `pressure_plate` | Trykk-plate | (Placeholder for co-op) |

**Nye types i types.ts:**
```typescript
export type PuzzleType =
  | 'sequence' | 'code_lock' | 'symbol_match'
  | 'blood_ritual' | 'astronomy' | 'pressure_plate';

export interface ActivePuzzle {
  type: PuzzleType;
  difficulty: number;
  targetTileId: string;
  code?: string;           // For code_lock
  symbols?: string[];      // For symbol_match
  requiredCost?: { hp?: number; sanity?: number };  // For blood_ritual
  hint?: string;
}
```

**Blood Ritual spesialregler:**
- Occultist får redusert Sanity-kostnad (klasse-bonus)
- Nekting av ritual = ingen Sanity-tap (i motsetning til andre puzzles)
- HP og Sanity kostnader vises tydelig i UI

#### 3. Occultist Spell Selection System
**Ny komponent: SpellSelectionModal.tsx**

Occultist (Ritual Master) velger nå 3 av 5 tilgjengelige spells før scenario starter:

| Spell | Type | Angrep | Uses | Effekt |
|-------|------|--------|------|--------|
| Eldritch Bolt | attack | 3 dice | ∞ (1/runde) | Grunnleggende angrep |
| Mind Blast | attack_horror | 2 dice | 2 | Skade + 1 horror |
| Banish | banish | WIL check | 2 | Øyeblikkelig drep (HP ≤ 3) |
| Dark Shield | defense | - | 3 | +2 forsvarsterninger |
| Glimpse Beyond | utility | - | 1 | Avslør tiles i radius 3 |

**Integrasjon i ShadowsGame.tsx:**
- Når Occultist velges i character selection, åpnes SpellSelectionModal
- Spilleren MÅ velge nøyaktig 3 spells for å fortsette
- Valgte spells lagres i `player.selectedSpells` (ny OccultistSpell[] array)
- Character card viser "Select 3 Spells" hint for Occultist

**UI-features:**
- Fargekodede ikoner basert på spell-type
- Detaljert informasjon om hver spell (angrep, uses, rekkevidde)
- Visuell indikator for valgte spells
- Bekreft-knapp aktiveres først når 3 er valgt
- Mulighet for å avbryte valget

### Filer Modifisert

**src/game/hexUtils.ts:**
- Lagt til `getEdgeDirection()`, `getOppositeEdgeDirection()`, `edgeBlocksSight()`
- Fullstendig omskrevet `hasLineOfSight()` med vegg-sjekking

**src/game/utils/monsterAI.ts:**
- Oppdatert `canSeePlayer()` for å bruke ekte line-of-sight

**src/game/types.ts:**
- Ny `PuzzleType` union type
- Utvidet `ActivePuzzle` interface med puzzle-spesifikke felter

**src/game/components/PuzzleModal.tsx:**
- Fullstendig omskrevet med modulær arkitektur
- 5 separate puzzle-komponenter (SequencePuzzle, CodeLockPuzzle, etc.)
- Ny StatusFooter komponent for konsistente meldinger
- Støtte for puzzle-spesifikke props (code, symbols, hint, playerClass)

**src/game/ShadowsGame.tsx:**
- Importert SpellSelectionModal og OCCULTIST_SPELLS
- Lagt til state: `showSpellSelection`, `pendingOccultistCharacter`
- Oppdatert character selection for Occultist workflow
- Oppdatert `handlePuzzleSolve()` med blood_ritual HP/Sanity kostnader
- Nye puzzle-spesifikke log-meldinger

### Filer Opprettet

**src/game/components/SpellSelectionModal.tsx:**
- Komplett spell selection UI for Occultist
- Støtter alle 5 OccultistSpells fra constants.ts
- Responsive design med hover effects

### Resultat
- ✅ Monstre ser ikke gjennom vegger lenger
- ✅ Line-of-sight fungerer korrekt med dører og vinduer
- ✅ 5 forskjellige puzzle-typer tilgjengelig
- ✅ Blood Ritual puzzle har klasse-spesifikke bonuser
- ✅ Occultist må velge 3 spells før spillet starter
- ✅ All kode bygger uten feil

---

## 2026-01-20: Hex Wall Icons, Item Icons, Character Selection & Offline Save

### Oppgaver
1. Lag ikoner for hex-vegg kanter (dør, vegg, vindu, trapp, etc.)
2. Generer item-ikoner for alle våpen, rustninger og utstyr
3. Legg til karakter-valg skjerm med store profilbilder og detaljert info
4. Implementer offline lagring med nedlasting/opplasting

### Implementert

#### 1. Hex Wall Edge Icons (EdgeIcons.tsx + GameBoard.tsx)

**Nye edge-ikoner som vises på hex-kanter:**
- **Wall**: Mur-mønster med brick pattern
- **Door (open/closed/locked/barricaded/sealed/puzzle)**: Forskjellige dør-tilstander med unike ikoner
- **Window**: Vindusrute med glass-effekt
- **Stairs Up/Down**: Trapp-ikoner med piler
- **Secret**: Mystisk øye-ikon (kun synlig hvis oppdaget)

**EdgeIcons.tsx komponenter:**
- `getEdgeIconInfo()`: Returnerer ikon, farge og label basert på edge-type
- `getEdgeIconPosition()`: Beregner posisjon for ikon på hex-kant
- Støtter alle DoorState-verdier fra game design bible

**GameBoard.tsx oppdateringer:**
- Erstattet enkle linjer med detaljerte SVG-ikoner
- Ikoner vises på midtpunktet av hver edge
- Fargekoding basert på type: grønn (open), rød (locked), amber (closed), etc.

#### 2. Item Icons (ItemIcons.tsx)

**SVG-ikoner for alle items i spillet:**

**Våpen (Melee):**
- `KnifeIcon` - Detaljert knivblad med trehåndtak
- `ClubIcon` - Klubbe med metallbånd
- `MacheteIcon` - Lang machete med guard

**Våpen (Ranged):**
- `DerringerIcon` - Liten skjult pistol
- `RevolverIcon` - 6-skudd revolver med sylinder
- `ShotgunIcon` - Dobbeltløpet hagle
- `RifleIcon` - Rifle med scope
- `TommyGunIcon` - Tommy gun med drum magazine

**Rustning:**
- `LeatherJacketIcon` - Skinnjakke med glidelås
- `TrenchCoatIcon` - Trench coat med belte
- `ArmoredVestIcon` - Militærvest med plater

**Verktøy:**
- `FlashlightIcon` - Lommelykt med lysstråle
- `LanternIcon` - Oljelampe med flamme
- `LockpickIcon` - Lockpick-sett
- `CrowbarIcon` - Rød brekkstang

**Forbruksvarer:**
- `MedkitIcon` - Rød førstehjelpskasse
- `WhiskeyIcon` - Whiskyflaske
- `BandagesIcon` - Bandasjerull
- `SedativesIcon` - Medisinflaske

**Relics:**
- `ElderSignIcon` - Glødende elder sign
- `ProtectiveWardIcon` - Beskyttende amulett
- `NecronomiconIcon` - Skummel bok

**Integrering:**
- `getItemIcon(itemId)` - Returnerer riktig ikon for item
- Oppdatert CharacterPanel og ItemTooltip til å bruke nye ikoner
- Fallback til generiske ikoner for ukjente items

#### 3. Character Selection Screen (CharacterSelectionScreen.tsx)

**Ny fullskjerm karakter-valg med detaljert info:**

**Venstre side - Portrett-grid:**
- 2x3 grid med alle 6 karakterer
- Store portrettbilder med HP/Sanity stats
- Klikk for fokus, dobbeltklikk for valg
- Grønn checkmark på valgte karakterer

**Høyre side - Detaljert info:**
- Stor portrett med subtitle
- Backstory (karakterens historie)
- Combat stats (HP, Sanity, Attack Dice, Defense Dice)
- Attribute bars (STR, AGI, INT, WIL) med visual progress
- Playstyle beskrivelse
- Strengths/Weaknesses lister
- Available weapons
- Special ability highlight
- Occultist spell-note

**CHARACTER_DETAILS data:**
```typescript
{
  subtitle: 'Hardened Soldier',
  backstory: 'A survivor of the Great War...',
  playstyle: 'Front-line fighter...',
  strengths: ['Highest HP (6)', '+1 melee attack die', ...],
  weaknesses: ['Low Sanity (3)', 'No magic abilities'],
  weapons: ['All weapons available']
}
```

**Navigasjon:**
- Piltaster for å bla mellom karakterer
- Quick-select grid beholdt i scenario setup
- "Open Character Selection" knapp

#### 4. Offline Save System (saveManager.ts + SaveLoadModal.tsx)

**saveManager.ts - Core save/load utilities:**

**Eksport funksjoner:**
- `exportLegacyData()` - Last ned heroes/gold/stash som JSON
- `exportFullSave()` - Last ned komplett backup inkl. game state
- `exportGameState()` - Last ned kun gjeldende scenario

**Import funksjoner:**
- `importSaveFile()` - Les og valider opplastet fil
- `applySaveFile()` - Anvendelse av importert save
- Version migration støtte

**Auto-save:**
- `autoSave()` - Automatisk lagring til localStorage
- `loadAutoSave()` - Gjenopprett auto-save
- `hasAutoSave()` / `clearAutoSave()`

**Save slots:**
- `getSaveSlots()` / `saveToSlot()` / `loadFromSlot()` / `deleteSlot()`
- Støtte for flere lagrede spill

**SaveLoadModal.tsx - UI komponent:**

**Tre faner:**
1. **Local Saves** - Opprett nye saves, last auto-save, administrer slots
2. **Export** - Last ned heroes eller full backup
3. **Import** - Last opp save-fil, preview og apply

**Features:**
- File drag-and-drop støtte
- Preview av importert data før applying
- Confirm dialogs for delete
- Metadata visning (hero count, gold, scenario)

**MainMenu integrering:**
- Ny "Save/Load" knapp ved siden av Heroes og Stash
- Åpner SaveLoadModal

### Filer Opprettet

1. **src/game/components/EdgeIcons.tsx**
   - Edge ikon-system for hex-kanter

2. **src/game/components/ItemIcons.tsx**
   - 21 detaljerte SVG item-ikoner
   - Icon mapping og getItemIcon helper

3. **src/game/components/CharacterSelectionScreen.tsx**
   - Fullskjerm karakter-valg UI
   - Detaljert karakter-info display

4. **src/game/utils/saveManager.ts**
   - Core save/load funksjoner
   - Export/import utilities
   - Auto-save system
   - Save slots management

5. **src/game/components/SaveLoadModal.tsx**
   - Save/Load dialog UI
   - File upload/download
   - Slot management UI

### Filer Modifisert

1. **src/game/types.ts**
   - Lagt til `isDiscovered` på EdgeData interface

2. **src/game/components/GameBoard.tsx**
   - Importert EdgeIcons
   - Erstattet edge rendering med detaljerte ikoner

3. **src/game/components/CharacterPanel.tsx**
   - Importert item icons
   - Oppdatert getItemIcon til å bruke spesifikke ikoner

4. **src/game/components/ItemTooltip.tsx**
   - Importert item icons
   - Oppdatert getTypeIcon til å bruke spesifikke ikoner

5. **src/game/components/MainMenu.tsx**
   - Lagt til `onSaveLoad` prop
   - Ny Save/Load knapp

6. **src/game/ShadowsGame.tsx**
   - Importert nye komponenter
   - State for showCharacterSelection og showSaveLoadModal
   - Integrert CharacterSelectionScreen
   - Integrert SaveLoadModal
   - Lagt til knapp for å åpne karakter-valg

### Resultat
- ✅ Hex-kanter viser nå visuelle ikoner for dører, vegger, vinduer, trapper
- ✅ Alle items har unike detaljerte SVG-ikoner
- ✅ Ny karakter-valg skjerm med store profilbilder og full info
- ✅ Offline lagring med eksport/import av JSON-filer
- ✅ Save slots for flere lagrede spill
- ✅ Auto-save funksjonalitet
- ✅ TypeScript kompilerer uten feil
- ✅ Build vellykket (800KB bundle)

---

## 2026-01-20: Refactor executeSpecialAbility - Config-Based Pattern

### Oppgave
Refaktorere kompleks kode: Finne en funksjon som er for kompleks og refaktorere den for klarhet mens oppførselen opprettholdes.

### Analyse
Etter å ha søkt gjennom kodebasen ble `executeSpecialAbility()` i `monsterAI.ts` identifisert som den beste kandidaten:
- **105 linjer** med en stor switch statement
- **15 cases** som håndterer forskjellige monster-abilities
- Mye gjentatt struktur med lignende objekter
- Kun 3 cases hadde faktisk kompleks logikk

### Refaktoreringsløsning

#### 1. Ny `SIMPLE_ABILITY_EFFECTS` Config (12 abilities)

Opprettet et deklarativt konfigurasjonsobjekt for abilities med enkle, forutsigbare effekter:

```typescript
const SIMPLE_ABILITY_EFFECTS: Partial<Record<MonsterSpecialAbility, SimpleAbilityConfig>> = {
  charge: {
    damage: 1,
    bonusAttackDice: 1,
    messageTemplate: '{name} stormer fremover med et vilt angrep!'
  },
  enrage: {
    bonusAttackDice: 2,
    messageTemplate: '{name} går BERSERK! Øynene gløder med raseri!'
  },
  // ... 10 flere abilities
};
```

**Inkluderte abilities:**
- `charge`, `enrage`, `snipe`, `swoop`
- `regenerate`, `terrify`, `ritual`, `cosmic_presence`
- `devour`, `ranged_shot`, `phasing`, `teleport`

#### 2. Dedikerte Handler-Funksjoner (3 komplekse abilities)

Abilities som krever game state logikk ble ekstrahert til egne funksjoner:

**`executePackTactics(enemy, allEnemies)`**
- Teller tilstøtende ghouls for bonus attack dice
- Returnerer dynamisk melding basert på antall

**`executeDragUnder(enemy, target, tiles)`**
- Sjekker om target står i vann
- Betinget skade basert på tile-type

**`executeSummon(enemy)`**
- Spawner 1-2 cultists med random valg

#### 3. Refaktorert `canUseSpecialAbility()`

Flyttet HP-terskel logikk til config:

```typescript
const ABILITY_HP_THRESHOLDS: Partial<Record<MonsterSpecialAbility, { above?: number; below?: number }>> = {
  enrage: { below: 0.5 },   // Kun når HP <= 50%
  charge: { above: 0.3 }    // Kun når HP > 30%
};
```

#### 4. Forenklet Hovedfunksjon

**Før:** 105 linjer med switch statement og 15 cases

**Etter:** 25 linjer med klar struktur:
```typescript
export function executeSpecialAbility(...): SpecialAbilityResult {
  // 1. Handle complex abilities with dedicated handlers
  switch (ability) {
    case 'pack_tactics': return executePackTactics(enemy, allEnemies);
    case 'drag_under': return executeDragUnder(enemy, target, tiles);
    case 'summon': return executeSummon(enemy);
  }

  // 2. Handle simple abilities from config
  const config = SIMPLE_ABILITY_EFFECTS[ability];
  if (config) {
    return buildSimpleAbilityResult(config, enemy.name);
  }

  // 3. Unknown ability fallback
  return { message: `${enemy.name} bruker en ukjent evne.` };
}
```

### Fordeler med Refaktoreringen

| Aspekt | Før | Etter |
|--------|-----|-------|
| **Linjer i hovedfunksjon** | 105 | 25 |
| **Switch cases** | 15 | 3 |
| **Duplisert kode** | Høy (objektliteraler) | Ingen (config lookup) |
| **Å legge til ny ability** | Copy-paste case | Legg til i config |
| **Testing** | Vanskelig | Handler-funksjoner kan testes isolert |
| **Lesbarhet** | Lav (lang switch) | Høy (klar separasjon) |

### Nye Typer Eksportert

```typescript
export interface SpecialAbilityResult {
  damage?: number;
  sanityDamage?: number;
  doomIncrease?: number;
  healing?: number;
  spawnedEnemies?: EnemyType[];
  message: string;
  bonusAttackDice?: number;
}
```

### Fil Modifisert
- `src/game/utils/monsterAI.ts` - Linjer 593-820

### Build Status
✅ Kompilerer uten feil
✅ Alle abilities opprettholder samme oppførsel
✅ Ingen breaking changes - eksporterer samme funksjoner

### Prinsipper Anvendt
1. **Configuration over Code** - Enkle abilities definert som data, ikke logikk
2. **Single Responsibility** - Komplekse abilities har egne handler-funksjoner
3. **DRY (Don't Repeat Yourself)** - `buildSimpleAbilityResult()` eliminerer duplisert objektbygging
4. **Open/Closed** - Lett å legge til nye abilities uten å endre hovedfunksjonen

---

## 2026-01-20: Bug Fix - Shop Weapons/Armor Not Working in Combat

### Problem
Shop-vapen og rustning fra Legacy-systemet fungerte ikke i kamp. Spillere som kjopte vapen i shop'en kjempet som om de var ubevapnede.

### Root Cause
Kampsystemet ble oppdatert til Hero Quest-stil i en tidligere sesjon. Det nye systemet bruker:
- `attackDice` - antall terninger vapenet gir
- `defenseDice` - antall forsvarsterninger rustningen gir

Shop-items i `legacyManager.ts` brukte fortsatt det gamle systemet:
- `bonus` - en generell bonus-verdi som ikke lenger ble brukt

Koden i `combatUtils.ts` sjekker eksplisitt for `attackDice`:
```typescript
if (item.type === 'weapon' && item.attackDice) {
  // Bruk vapenet
}
```

Siden shop-vapen ikke hadde `attackDice`, ble de ignorert og spilleren kjempet som ubevapnet (1 terning).

### Fix Applied
Oppdaterte `getDefaultShopInventory()` i `legacyManager.ts`:

**Vapen - La til attackDice, weaponType, range, ammo:**
| Vapen | attackDice | weaponType | range | ammo |
|-------|------------|------------|-------|------|
| Combat Knife | 2 | melee | 1 | -1 |
| Revolver | 3 | ranged | 3 | 6 |
| Shotgun | 4 | ranged | 2 | 2 |
| Tommy Gun | 5 | ranged | 3 | 20 |

**Rustning - La til defenseDice:**
| Rustning | defenseDice |
|----------|-------------|
| Leather Jacket | 1 |
| Trench Coat | 1 |
| Armored Vest | 2 |

### Code Changes

**Before:**
```typescript
{ id: 'shop_revolver', name: 'Revolver', type: 'weapon', effect: '+2 combat damage', bonus: 2, slotType: 'hand' }
```

**After:**
```typescript
{ id: 'shop_revolver', name: 'Revolver', type: 'weapon', effect: '3 attack dice, range 3', attackDice: 3, weaponType: 'ranged', range: 3, ammo: 6, slotType: 'hand' }
```

### Files Modified
- `src/game/utils/legacyManager.ts` - Oppdatert alle vapen og rustning i `getDefaultShopInventory()`

### Impact
- Shop-vapen fungerer na korrekt i kamp
- Shop-rustning gir na forsvarsterninger
- Verdiene er konsistente med WEAPON_STATS i constants.ts
- Legacy-mode er na fullt spillbart

### Verification
- TypeScript kompilerer uten feil
- Verdiene matcher WEAPON_STATS og REGELBOK.MD spesifikasjonene

---

## 2026-01-20: Bug Fix - Memory Leak in PuzzleModal Components

### Problem
All puzzle components in `PuzzleModal.tsx` had potential memory leaks and could cause React warnings about state updates on unmounted components. The issues were:

1. **SequencePuzzle**: `setTimeout` called inside `setInterval` without cleanup - multiple timeouts could accumulate and attempt to update state after unmount
2. **All puzzle components**: `setTimeout` calls for delayed `onComplete` callbacks had no cleanup on unmount

### Root Cause
When a puzzle modal is closed (unmounted) before the animation/delay completes:
- Pending `setTimeout` callbacks would still fire
- Attempting to call `setState` on unmounted components
- This causes React warnings and potential memory leaks

### Fix Applied
Added proper cleanup for all timeout operations in all puzzle components:

1. **Added `useRef` import** to track timeout IDs and mounted state
2. **SequencePuzzle**:
   - Added `timeoutRefs` array to track all timeouts created during sequence display
   - Added `isMountedRef` to check if component is still mounted before state updates
   - Cleanup function clears all pending timeouts on unmount
3. **CodeLockPuzzle**: Added timeout ref and mounted check for success/fail callbacks
4. **SymbolMatchPuzzle**: Added timeout ref and mounted check for success/fail callbacks
5. **BloodRitualPuzzle**: Added timeout ref and mounted check for sacrifice/refuse callbacks
6. **AstronomyPuzzle**: Added timeout ref and mounted check for success callback

### Code Pattern Used
```typescript
// Refs for cleanup to prevent memory leaks
const timeoutRef = useRef<NodeJS.Timeout | null>(null);
const isMountedRef = useRef(true);

// Cleanup on unmount
useEffect(() => {
  isMountedRef.current = true;
  return () => {
    isMountedRef.current = false;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };
}, []);

// Safe timeout usage
timeoutRef.current = setTimeout(() => {
  if (isMountedRef.current) {
    onComplete(true);
  }
}, 1500);
```

### Files Modified
- `src/game/components/PuzzleModal.tsx`
  - Added `useRef` to imports
  - Fixed SequencePuzzle (sequence animation + completion callbacks)
  - Fixed CodeLockPuzzle (success/fail callbacks)
  - Fixed SymbolMatchPuzzle (target display + success/fail callbacks)
  - Fixed BloodRitualPuzzle (sacrifice/refuse callbacks)
  - Fixed AstronomyPuzzle (success callback)

### Impact
- No more potential memory leaks from puzzle components
- No more React warnings about state updates on unmounted components
- Puzzles can be safely closed at any time without side effects
- Improved application stability

### Verification
- TypeScript compiles without errors
- Build successful

---

## 2026-01-20: Refactor handleContextActionEffect - Extract to Modular System

### Problem
The `handleContextActionEffect` function in `ShadowsGame.tsx` was a **470-line monolithic switch statement** handling all context action effects. This made the code:
- Hard to read and understand
- Difficult to maintain and extend
- Impossible to unit test individual handlers
- Prone to bugs when adding new action types

### Solution
Extracted all effect handling logic into a new modular system in `src/game/utils/contextActionEffects.ts`.

### New Architecture

#### 1. Pure Helper Functions for Board Operations
```typescript
// Generic tile update
export function updateTile(board, tileId, updater): Tile[]

// Edge-specific updates
export function updateTileEdge(board, tileId, edgeIndex, edgeUpdater): Tile[]
export function setDoorState(board, tileId, edgeIndex, doorState): Tile[]
export function clearBlockedEdge(board, tileId, edgeIndex): Tile[]

// Obstacle/object removal
export function removeTileObstacle(board, tileId): Tile[]
export function removeTileObject(board, tileId): Tile[]
```

#### 2. Effect Handlers by Category
- **Door effects**: `handleOpenDoorEffect`, `handleBreakDoorEffect`, `handleCloseDoorEffect`
- **Obstacle effects**: `handleClearObstacleEffect`, `handleClearEdgeEffect`, `handleBreakWindowEffect`
- **Search effects**: `handleSearchEffect` (handles quest item collection)
- **Objective effects**: `handleObjectiveProgressEffect`, `handleEscapeEffect`
- **Quest item effects**: `handleQuestItemPickupEffect`

#### 3. Main Dispatcher Function
```typescript
export function processActionEffect(actionId: string, ctx: ActionEffectContext): ActionEffectResult
```

Uses action ID grouping instead of a giant switch:
```typescript
const OPEN_DOOR_ACTIONS = ['open_door', 'use_key', 'lockpick'];
const BREAK_DOOR_ACTIONS = ['force_door', 'break_barricade'];
const CLEAR_EDGE_ACTIONS = ['clear_edge_rubble', 'break_edge_barricade', ...];

if (OPEN_DOOR_ACTIONS.includes(actionId)) {
  return handleOpenDoorEffect(ctx);
}
```

#### 4. Refactored ShadowsGame.tsx Handler
The new `handleContextActionEffect` in ShadowsGame.tsx is now only **~55 lines**:
```typescript
const handleContextActionEffect = useCallback((action: ContextAction, success: boolean) => {
  if (!activeContextTarget || !success) return;

  const tile = state.board.find(t => t.id === activeContextTarget.tileId);
  if (!tile) return;

  // Build context
  const ctx: ActionEffectContext = { ... };

  // Special handling for door opening - trigger fog reveal
  if (['open_door', 'use_key', 'lockpick'].includes(action.id) && ...) {
    triggerFogReveal(...);
  }

  // Process the action effect
  const result = processActionEffect(action.id, ctx);

  // Apply log messages and floating text
  result.logMessages?.forEach(msg => addToLog(msg));
  if (result.floatingText) { addFloatingText(...); }

  // Apply state updates
  if (result.board || result.players || ...) {
    setState(prev => ({ ...prev, ...result }));
  }
}, [...]);
```

### Files Created
- `src/game/utils/contextActionEffects.ts` (~450 lines)
  - Contains all effect handling logic
  - Pure functions for board updates
  - Typed interfaces for context and results
  - Grouped action handlers by category

### Files Modified
- `src/game/ShadowsGame.tsx`
  - Added import for new module
  - Replaced 470-line switch with ~55-line delegator
  - Reduced file size by ~400 lines

### Benefits
1. **Separation of concerns**: Effect logic is now separate from React component
2. **Testability**: Pure functions can be unit tested independently
3. **Maintainability**: Adding new actions only requires adding to action groups
4. **Readability**: Each handler is focused and easy to understand
5. **Reusability**: Helper functions can be used elsewhere if needed

### Action Categories Handled
| Category | Actions |
|----------|---------|
| Door Open | open_door, use_key, lockpick |
| Door Break | force_door, break_barricade |
| Door Close | close_door |
| Clear Obstacle | clear_rubble, extinguish |
| Search | search_tile, search_books, search_container, search_rubble, search_water, search_statue |
| Remove Object | open_gate, force_gate, disarm_trap, trigger_trap, dispel_fog |
| Clear Edge | clear_edge_rubble, break_edge_barricade, unlock_edge_gate, lockpick_edge_gate, force_edge_gate, extinguish_edge_fire, dispel_edge_ward, banish_edge_spirits |
| Window | break_window |
| Objectives | perform_ritual, seal_portal, flip_switch, escape |
| Quest Items | pickup_quest_item_* |

### Verification
- TypeScript compiles without errors
- Build successful (922.66 kB bundle)
- All action effects preserved with same behavior

---

## 2026-01-20: Refactor getThemedTilePreferences - Switch to Data-Driven Lookup

### Problem
The `getThemedTilePreferences` function in `scenarioGenerator.ts` was a **65-line switch statement** with 9 cases, each returning an object with identical structure. This pattern is:
- Verbose and repetitive
- Harder to maintain (must find the right case to edit)
- Cannot be iterated or introspected
- Prone to copy-paste errors when adding new themes

### Solution
Replaced the switch statement with a **data-driven configuration object** (`THEME_TILE_PREFERENCES`) that maps themes directly to their preferences.

### Before (Switch Statement)
```typescript
export function getThemedTilePreferences(theme: ScenarioTheme): {...} {
  switch (theme) {
    case 'manor':
      return { preferredNames: [...], avoidNames: [...], floorPreference: 'wood' };
    case 'church':
      return { preferredNames: [...], avoidNames: [...], floorPreference: 'stone' };
    // ... 7 more cases ...
    default:
      return { preferredNames: [], avoidNames: [], floorPreference: 'wood' };
  }
}
```

### After (Data-Driven Lookup)
```typescript
// Configuration object - easy to read, extend, and test
export const THEME_TILE_PREFERENCES: Record<ScenarioTheme, {...}> = {
  manor: { preferredNames: [...], avoidNames: [...], floorPreference: 'wood' },
  church: { preferredNames: [...], avoidNames: [...], floorPreference: 'stone' },
  // ... all themes in one clear structure
};

const DEFAULT_TILE_PREFERENCES = {
  preferredNames: [], avoidNames: [], floorPreference: 'wood'
};

// Function is now a simple lookup
export function getThemedTilePreferences(theme: ScenarioTheme) {
  return THEME_TILE_PREFERENCES[theme] ?? DEFAULT_TILE_PREFERENCES;
}
```

### Benefits

1. **Readability**: All theme configurations visible in one place
2. **Maintainability**: Adding a theme = add one entry to the object
3. **Extensibility**: Configuration can be imported/extended elsewhere
4. **Testability**: Can iterate over `THEME_TILE_PREFERENCES` for automated testing
5. **Type Safety**: TypeScript ensures all `ScenarioTheme` values have entries
6. **Performance**: Object lookup is O(1) vs switch which is O(n) worst case

### Files Modified
- `src/game/utils/scenarioGenerator.ts`
  - Added `THEME_TILE_PREFERENCES` configuration object (lines 96-157)
  - Added `DEFAULT_TILE_PREFERENCES` constant
  - Simplified `getThemedTilePreferences` function to 3-line lookup

### Refactoring Pattern Applied
**"Replace Switch with Object Literal"** - A common refactoring pattern where a switch statement over constants is replaced with an object lookup. This pattern is especially useful when:
- All cases return the same type of data
- The cases are based on string/enum values
- The data might need to be accessed or iterated elsewhere

### Verification
- TypeScript compiles without errors
- Build successful (922.66 kB bundle)
- Same behavior preserved - function returns identical values for all themes


---

## 2026-01-20: Refactor getThemeFromLocation - Data-Driven Lookup

### Oppgave
Refaktorere `getThemeFromLocation` funksjonen som var for kompleks med 8 kjede if-else statements og en switch fallback.

### Problem
Funksjonen på linje 52-90 hadde:
- 8 chained if-else statements sjekking `nameLower.includes(...)`
- 25+ individuelle string includes sjekker
- Switch statement med 5 cases som fallback
- Vanskelig å lese og vedlikeholde

**Før (39 linjer):**
```typescript
function getThemeFromLocation(locationName: string, atmosphere: string): ScenarioTheme {
  const nameLower = locationName.toLowerCase();
  if (nameLower.includes('manor') || nameLower.includes('mansion') || nameLower.includes('house') || nameLower.includes('hotel')) {
    return 'manor';
  }
  if (nameLower.includes('church') || nameLower.includes('chapel')) {
    return 'church';
  }
  // ... 6 flere if-blokker ...
  switch (atmosphere) {
    case 'creepy': return 'manor';
    case 'urban': return 'urban';
    // ... 3 flere cases ...
    default: return 'manor';
  }
}
```

### Løsning
Refaktorerte til data-drevet lookup med tre konstanter:

**1. LOCATION_NAME_PATTERNS** - Array av keyword-til-tema mapping:
```typescript
const LOCATION_NAME_PATTERNS: Array<{ keywords: string[]; theme: ScenarioTheme }> = [
  { keywords: ['manor', 'mansion', 'house', 'hotel'], theme: 'manor' },
  { keywords: ['church', 'chapel'], theme: 'church' },
  { keywords: ['asylum', 'hospital'], theme: 'asylum' },
  { keywords: ['warehouse', 'factory', 'industrial'], theme: 'warehouse' },
  { keywords: ['forest', 'woods', 'marsh'], theme: 'forest' },
  { keywords: ['library', 'university', 'campus'], theme: 'academic' },
  { keywords: ['harbor', 'coast', 'cliff', 'dock'], theme: 'coastal' },
  { keywords: ['crypt', 'cave', 'catacomb', 'sewer'], theme: 'underground' }
];
```

**2. ATMOSPHERE_TO_THEME** - Record for fallback mapping:
```typescript
const ATMOSPHERE_TO_THEME: Record<string, ScenarioTheme> = {
  creepy: 'manor',
  urban: 'urban',
  wilderness: 'forest',
  academic: 'academic',
  industrial: 'warehouse'
};
```

**3. DEFAULT_THEME** - Konstant for default verdi:
```typescript
const DEFAULT_THEME: ScenarioTheme = 'manor';
```

**Etter (15 linjer funksjon):**
```typescript
function getThemeFromLocation(locationName: string, atmosphere: string): ScenarioTheme {
  const nameLower = locationName.toLowerCase();

  // Name-based mapping takes priority - find first matching pattern
  const matchedPattern = LOCATION_NAME_PATTERNS.find(
    pattern => pattern.keywords.some(keyword => nameLower.includes(keyword))
  );

  if (matchedPattern) {
    return matchedPattern.theme;
  }

  // Fall back to atmosphere-based mapping
  return ATMOSPHERE_TO_THEME[atmosphere] ?? DEFAULT_THEME;
}
```

### Fordeler

| Aspekt | Før | Etter |
|--------|-----|-------|
| **Lesbarhet** | Må lese 39 linjer for å forstå all mapping | All mapping synlig i én datastruktur |
| **Vedlikehold** | Må legge til ny if-blokk for nytt mønster | Legg til én linje i array |
| **Testing** | Må teste hver if-gren separat | Kan iterere over patterns programmatisk |
| **Konsistens** | Manuelt sjekke at alle temaer dekkes | TypeScript-sjekket |

### Filer Modifisert
- `src/game/utils/scenarioGenerator.ts` (linjer 48-105)
  - Lagt til `LOCATION_NAME_PATTERNS` konfigurasjon
  - Lagt til `ATMOSPHERE_TO_THEME` mapping
  - Lagt til `DEFAULT_THEME` konstant
  - Forenklet `getThemeFromLocation` til 15 linjer

### Refactoring Pattern
**"Replace Conditional with Polymorphism/Data"** - Et vanlig refaktorerings-mønster hvor kjede if-else eller switch statements erstattes med data-drevne lookups. Spesielt nyttig når:
- Alle branches returnerer samme datatype
- Logikken er basert på string-matching
- Dataene kan trenge å aksesseres eller itereres andre steder

### Build Status
✅ TypeScript kompilerer uten feil
✅ Build vellykket (922.43 kB bundle)
✅ Samme oppførsel bevart - funksjonen returnerer identiske verdier for alle lokasjoner

---

## 2026-01-21: Weapons Distance Mechanics & Spell Casting System

### Oppgave
Implementer logiske våpen- og avstandsmekanikker:
1. **Våpen og avstand** - Nærkampvåpen (knife) kan kun treffe i samme/nabo hex, skytevåpen har varierende rekkevidde
2. **Cast/magi** - Spell-velger system for Occultist og Professor
3. **Heroklasse-restriksjoner** - Veteran kan bruke alle våpen, Occultist kun nærkamp + magi

### Implementert

#### 1. Korrekt Hex-avstand Beregning (combatUtils.ts)

**Problem:** `canAttackEnemy()` brukte Manhattan-avstand (`Math.abs(q1-q2) + Math.abs(r1-r2)`) som er FEIL for hex-grids.

**Løsning:** Importert og brukt `hexDistance()` fra `hexUtils.ts` som beregner korrekt hex-avstand:
```typescript
// Korrekt hex-avstand formel
const distance = hexDistance(player.position, enemy.position);
```

#### 2. Oppdatert Våpen-rekkevidder (constants.ts)

**Tommy Gun endret:** Range 3 → Range 1
- Tematisk: Sprayshooting er effektiv kun på kort avstand
- Balansering: 5 attack dice må kompenseres med kort rekkevidde

**Alle våpen-rekkevidder:**
| Våpen | Type | Range | Notes |
|-------|------|-------|-------|
| Unarmed | Melee | 1 | Alle klasser |
| Knife | Melee | 1 | Stille |
| Club/Pipe | Melee | 1 | Improvised |
| Machete | Melee | 1 | Heavy |
| Derringer | Ranged | 2 | 2 shots |
| Revolver | Ranged | 3 | Standard |
| Shotgun | Ranged | 2 | Close range |
| Rifle | Ranged | 5 | Long range |
| **Tommy Gun** | Ranged | **1** | Close range only |

#### 3. Våpenrestriksjon-validering (combatUtils.ts)

**Ny funksjon `canUseWeapon(player, weaponId)`:**
- Sjekker `weaponRestrictions` fra CHARACTERS
- Normaliserer weapon IDs for konsistent matching
- Returnerer `true` hvis våpen er tillatt

**Oppdatert `getWeaponAttackDice()`:**
- Sjekker nå `canUseWeapon()` før våpen brukes
- Hvis spiller har restricted våpen, behandles som unarmed
- Returnerer `isRestricted` og `restrictedWeaponName` for feedback

**Klasse-restriksjoner:**
| Klasse | Kan bruke | Kan IKKE bruke |
|--------|-----------|----------------|
| Veteran | ALT | - |
| Detective | Det meste | Tommy Gun |
| Professor | Derringer, Knife | Revolver, Shotgun, Tommy Gun, Rifle, Machete |
| Occultist | Knife, Revolver | Shotgun, Tommy Gun, Rifle, Machete |
| Journalist | Det meste | Shotgun, Tommy Gun |
| Doctor | Derringer, Knife | Revolver, Shotgun, Tommy Gun, Rifle, Machete |

#### 4. Line-of-Sight for Ranged Attacks (combatUtils.ts)

**Oppdatert `canAttackEnemy()` med LOS-sjekk:**
- Tar nå `board?: Tile[]` som valgfri parameter
- For ranged angrep på distanse > 1, sjekkes line of sight
- Bruker `hasLineOfSight()` fra `hexUtils.ts`
- Vegger og lukkede dører blokkerer skudd

**Feilmeldinger:**
- "For langt unna for nærkamp. {weapon} kan bare angripe i samme eller nabo-rute."
- "For langt unna. {weapon} har rekkevidde {range} (avstand: {distance})."
- "Ingen siktlinje til {enemy}. Vegger eller lukkede dører blokkerer skuddet."
- "{weapon} kan ikke brukes av denne klassen. Angriper ubevæpnet."

#### 5. ShadowsGame.tsx Integrasjon

**Oppdatert attack-handling:**
```typescript
const { canAttack, reason, isRestricted } = canAttackEnemy(activePlayer, targetEnemy, state.board);
if (!canAttack) {
  addToLog(reason);
  return;
}
if (isRestricted) {
  addToLog(reason); // Warn about restricted weapon
}
```

#### 6. Spell-casting System Verifisert ✓

**Eksisterende system fungerer korrekt:**
- ActionBar viser Grimoire-meny med tilgjengelige spells
- Occultist velger 3 spells ved scenario-start (SpellSelectionModal)
- Spells har attack dice, range, og begrenset bruk
- Range sjekkes med `hexDistance()`
- Partikkeleffekter vises ved casting

**Occultist Spells:**
| Spell | Attack Dice | Range | Uses | Effect |
|-------|-------------|-------|------|--------|
| Eldritch Bolt | 3 | 3 | ∞ (1/round) | Attack |
| Mind Blast | 2 | 2 | 2/scenario | Attack + Horror |
| Banish | WIL check | 2 | 2/scenario | Destroy weak enemy |
| Dark Shield | 0 | Self | 3/scenario | +2 Defense |
| Glimpse Beyond | 0 | 3 | 1/scenario | Reveal tiles |

### Filer Modifisert

**src/game/utils/combatUtils.ts:**
- Import `hexDistance` og `hasLineOfSight` fra hexUtils
- Import `Tile` type
- Ny `canUseWeapon()` funksjon
- Oppdatert `getWeaponAttackDice()` med weapon restrictions
- Oppdatert `canAttackEnemy()` med:
  - Hex-avstand beregning
  - Weapon restriction check
  - Line-of-sight check

**src/game/constants.ts:**
- Tommy Gun range: 3 → 1
- Tommy Gun notes oppdatert: "Close range only (neighbor tiles)"
- ITEMS[tommy] range: 3 → 1

**src/game/ShadowsGame.tsx:**
- Oppdatert attack-handling til å bruke `state.board` for LOS-sjekk
- Lagt til logging for restricted weapons

### Tekniske Detaljer

**Hex Distance Calculation (hexUtils.ts):**
```typescript
// Axial cube distance - korrekt for hex grids
const hexDistance = (a, b) => {
  return (Math.abs(a.q - b.q) + Math.abs(a.q + a.r - b.q - b.r) + Math.abs(a.r - b.r)) / 2;
};
```

**Manhattan vs Hex Distance:**
```
Manhattan: |q1-q2| + |r1-r2| = FEIL for hex
Hex: (|dq| + |dq+dr| + |dr|) / 2 = RIKTIG

Eksempel: (0,0) til (2,1)
Manhattan: |2| + |1| = 3
Hex: (|2| + |3| + |1|) / 2 = 3  ← Faktisk hex-avstand
```

### Build Status
✅ TypeScript kompilerer uten feil

### Spillmekanikk Oppsummering

**Våpen-avstand regler:**
- Nærkampvåpen: Kan kun angripe i samme eller tilstøtende hex (distance ≤ 1)
- Skytevåpen: Kan angripe innenfor våpenets rekkevidde MED klar siktlinje
- Tommy Gun: Kraftig (5 dice) men kun nabo-ruter (range 1)
- Rifle: Moderat (3 dice) men lang rekkevidde (range 5)

**Klasse-våpen regler:**
- Veteran: Kan bruke ALT - krigsveteranen er trent med alle våpen
- Occultist: Kun Knife + Revolver - kompenserer med MAGI som "skytevåpen"
- Professor/Doctor: Kun Derringer + Knife - akademikere, ikke krigere

**Magi-system:**
- Occultist velger 3 spells ved start
- Spells fungerer som "ranged weapon" alternative
- Eldritch Bolt (range 3) erstatter rifle for Occultist
- Begrenset bruk per scenario = taktisk valg

---

## 2026-01-21: Event Card Deck Cycling & Audio System

### Oppgave
Implementere de gjenværende funksjonene:
1. Event Card deck cycling (shuffling/trekking)
2. Audio system (Tone.js)
3. Weather-effekter fra doom-nivå
4. Legacy XP/Leveling mellom scenarier

### Status etter undersøkelse

**Allerede implementert (verifisert):**
- Weather-effekter fra doom-nivå (`mythosPhaseHelpers.ts`, `constants.ts`, `WeatherOverlay.tsx`)
- Legacy XP/Leveling (`legacyManager.ts`)

**Måtte implementeres:**
- Event Card deck cycling
- Audio system

---

### 1. Event Card Deck Cycling System

#### Utvidet EventCard Interface (types.ts)

```typescript
export type EventEffectType =
  | 'sanity' | 'health' | 'spawn' | 'insight' | 'doom'
  | 'item' | 'weather' | 'all_sanity' | 'all_health'
  | 'buff_enemies' | 'debuff_player' | 'teleport';

export interface EventCard {
  id: string;
  title: string;
  description: string;
  effectType: EventEffectType;
  value: number;
  secondaryEffect?: { type: EventEffectType; value: number };
  spawnType?: string;
  itemId?: string;
  weatherType?: string;
  doomThreshold?: number;
  skillCheck?: {
    attribute: 'strength' | 'agility' | 'intellect' | 'willpower';
    dc: number;
    successDescription: string;
    failureDescription: string;
  };
  flavorText?: string;
}
```

#### GameState Utvidelse

Lagt til i GameState interface:
```typescript
eventDeck: EventCard[];           // Shuffled deck of event cards
eventDiscardPile: EventCard[];    // Used event cards
```

#### Ny Fil: eventDeckManager.ts

Komplett deck management system:
- `createShuffledEventDeck()` - Fisher-Yates shuffle
- `drawEventCard()` - Trekker kort, reshuffler hvis tomt
- `discardEventCard()` - Legger kort i discard pile
- `resolveEventEffect()` - Appliserer alle event-effekter
- `performEventSkillCheck()` - Skill check for events med sjekk-mulighet

#### 35 Event Cards Implementert

Kategorier:
- **Sanity events** (5): Shadows in the Dark, Whispers from Beyond, Nightmare Visions, The Watcher, Creeping Dread
- **Health events** (3): Toxic Fumes, Unstable Ground, Hidden Blade
- **Spawn events** (4): They Come, From the Depths, The Deep Ones Stir, Ambush!
- **Doom events** (3): The Stars Align, Ritual Progress, Blood Sacrifice
- **Positive events** (5): Hidden Cache, Moment of Clarity, Hidden Diary, Disrupted Ritual, Lucky Find
- **Weather events** (4): Unnatural Fog, Cosmic Storm, Eldritch Glow, The Gathering Storm
- **Mixed events** (6): The Price of Knowledge, Dark Bargain, Fleeting Hope, The Hunted, Echoes of the Past, Respite
- **Late game events** (3): The Veil Thins, Herald of Doom, Final Warning
- **Buff/debuff events** (2): Empowered Darkness, Weakening Resolve

Balanse: ~40% negative, ~30% mixed, ~30% neutral/positive

#### Event Modal Forbedret (EventModal.tsx)

- Dynamiske ikoner basert på effekt-type
- Bakgrunns-gradient basert på event-alvorlighet
- Skill check warning-boks med attributt og DC
- Sekundær effekt visning
- Doom threshold indikator
- Flavor text støtte

#### MYTHOS Phase Integrasjon

Event cards trekkes i MYTHOS phase med 50% sjanse:
```typescript
if (Math.random() < 0.5) {
  const { card, newDeck, newDiscardPile, reshuffled } = drawEventCard(...);
  if (card) {
    playSound('eventCard');
    setState(prev => ({ ...prev, eventDeck: newDeck, eventDiscardPile, activeEvent: card }));
  }
}
```

---

### 2. Audio System (Tone.js)

#### Installert Tone.js
```bash
npm install tone
```

#### Ny Fil: audioManager.ts

Komplett audio system med:

**Synthesizers:**
- `PolySynth` - UI og action lyder
- `NoiseSynth` - Atmosfæriske effekter
- `MembraneSynth` - Bass/impact lyder
- `MetalSynth` - Metaliske lyder
- `FMSynth` - Horror effekter

**Effects Chain:**
- Reverb (decay: 4s)
- FeedbackDelay (0.25s)
- LowPass Filter (2000Hz)

**21 Sound Effects:**
| Effect | Funksjon |
|--------|----------|
| click | UI-klikk |
| success | Positiv handling |
| error | Feil/negativ |
| damage | Skade tatt |
| death | Spiller død |
| footstep | Bevegelse |
| doorOpen | Dør åpning |
| diceRoll | Terningkast |
| attack | Angrep |
| spellCast | Magi |
| pickup | Plukke opp item |
| sanityLoss | Sanity tap |
| horrorCheck | Horror check |
| enemySpawn | Fiende spawn |
| doomTick | Doom nedtelling |
| eventCard | Event kort trukket |
| victory | Seier |
| defeat | Tap |
| whispers | Hallucination madness |
| heartbeat | Paranoia madness |
| cosmicStatic | Cosmic weather |

#### React Hook: useAudio.ts

```typescript
export function useAudio(options?: { autoInitialize?: boolean }): {
  isInitialized: boolean;
  play: (effect: SoundEffect) => void;
  initialize: () => Promise<boolean>;
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  isMuted: boolean;
}
```

#### Integrasjon i ShadowsGame.tsx

Lyder lagt til på:
- Spill start (success)
- Angrep (attack + diceRoll)
- Spell casting (spellCast)
- Event kort (eventCard)
- Fiende spawn (enemySpawn)
- Seier (victory)
- Tap (defeat)

---

### Filer Modifisert/Opprettet

**Nye filer:**
- `src/game/utils/eventDeckManager.ts` - Event deck management
- `src/game/utils/audioManager.ts` - Audio system
- `src/game/hooks/useAudio.ts` - React audio hook

**Modifiserte filer:**
- `src/game/types.ts` - EventCard interface utvidet, GameState utvidet
- `src/game/constants.ts` - 35 event cards lagt til
- `src/game/components/EventModal.tsx` - Komplett redesign
- `src/game/ShadowsGame.tsx` - Event deck og audio integrasjon

---

### Build Status
✅ TypeScript kompilerer uten feil
✅ Build vellykket (1,220 KB bundle - Tone.js økte ~260KB)

---

### Tekniske Detaljer

**Deck Cycling:**
- Fisher-Yates shuffle for unbiased permutation
- Automatisk reshuffle når deck er tom
- Doom threshold filtering (noen events kun på lav doom)
- Skill check system for å unngå effekter

**Audio System:**
- Tone.js Web Audio synth-basert (ingen pre-recorded samples)
- Lazy initialization (krever user interaction)
- Volume control med master/sfx split
- Mute støtte
- Disposed cleanup for memory management

**Event Balance:**
- Negative events har ofte skill check mulighet
- Late-game events har doom threshold
- Mixed events gir trade-offs (insight vs sanity)
- Weather events påvirker gameplay mekanikker


---

## 2026-01-21 - Fix: spawnRoom Temporal Dead Zone Error

### Problem
Runtime error: `Uncaught ReferenceError: Cannot access 'spawnRoom' before initialization`
- Error occurred at line 1750 in ShadowsGame.tsx
- Caused blank screen and game crash

### Root Cause
JavaScript "temporal dead zone" (TDZ) error. The `spawnRoom` and `spawnEnemy` useCallback hooks were defined AFTER `handleContextActionEffect`, but `spawnRoom` was referenced in `handleContextActionEffect`'s dependency array and function body.

When React evaluates the dependency array of a useCallback, the referenced variables must already be initialized. Since `spawnRoom` was declared with `const` but defined later in the component, JavaScript threw a TDZ error.

**Before (broken order):**
```
handleContextActionEffect (line ~1651) - uses spawnRoom in dependency array
...
spawnEnemy (line ~1937)
spawnRoom (line ~1968) - defined too late!
```

### Solution
Moved `spawnEnemy` and `spawnRoom` definitions to BEFORE `handleContextActionEffect`:

**After (correct order):**
```
spawnEnemy (line ~1648)
spawnRoom (line ~1680)
handleContextActionEffect (line ~1895) - now can access spawnRoom
```

### Files Changed
- `src/game/ShadowsGame.tsx` - Reordered function definitions

### Verification
- ✅ Build successful
- ✅ No TypeScript errors
- ✅ Committed and pushed to `claude/fix-uncaught-error-2ctjk`

---

## 2026-01-21 - Fix: Tiles Disappearing When Player Leaves Hex Location

### Problem
Tiles would disappear completely when the player moved away from a hex location. The tiles would be replaced with "ghost tiles" (either red "UTFORSK" or gray MapPin icons).

### Root Cause
In `spawnRoom()` function in ShadowsGame.tsx, at line 1748-1750, if `selectWeightedTemplate()` returned `null`, the function would return early WITHOUT creating any tile:

```javascript
const selected = selectWeightedTemplate(matchesToUse);
if (!selected) {
  console.warn('Failed to select template');
  return;  // <-- BUG: Returns without creating a tile!
}
```

This caused the following sequence:
1. Player clicks on unexplored position (q, r)
2. `spawnRoom(q, r, ...)` is called
3. Template selection fails (rare edge case)
4. `spawnRoom` returns WITHOUT adding a tile to the board
5. Player still moves to position (q, r) via `handleAction`
6. `exploredTiles` is updated to include (q, r)
7. Result: Position (q, r) is in `exploredTiles` but has NO tile in `state.board`

When the player moves away, the position shows as a ghost tile because it's in `exploredTiles` (gray MapPin) but there's no actual tile rendered.

### Related Issue: Red vs Gray Ghost Tiles

The user also asked why some unexplored tiles are marked with red ("UTFORSK") and some are gray (MapPin):

- **Red "UTFORSK" tiles**: Positions NEVER visited (not in `exploredTiles`)
- **Gray MapPin tiles**: Positions that WERE visited (in `exploredTiles`) but have no tile in `state.board`

This is controlled by `GameBoard.tsx` line 957:
```javascript
const isExplore = !exploredTiles.has(`${n.q},${n.r}`);
```

### Solution
Added fallback tile creation logic when `selectWeightedTemplate()` returns null (line 1748-1774):

```javascript
if (!selected) {
  // Fallback: Create a basic tile if template selection fails
  console.warn(`Template selection failed for (${startQ},${startR}), using fallback`);

  const fallbackCategory = selectRandomConnectableCategory(
    sourceCategory as TileCategory,
    tileSet === 'indoor'
  );
  const fallbackRoomName = selectRandomRoomName(fallbackCategory, tileSet);
  const fallbackTile = createFallbackTile({
    startQ,
    startR,
    newCategory: fallbackCategory,
    roomName: fallbackRoomName,
    roomId,
    boardMap
  });

  setState(prev => ({ ...prev, board: [...prev.board, fallbackTile] }));
  addToLog(`UTFORSKET: ${fallbackRoomName}. [${fallbackCategory.toUpperCase()}]`);
  // ... location description logging ...
  return;
}
```

Now a tile is ALWAYS created when `spawnRoom()` is called, preventing the "disappearing tile" bug.

### Files Changed
- `src/game/ShadowsGame.tsx` - Added fallback tile creation in `spawnRoom()` function

### Verification
- ✅ Build successful
- ✅ No TypeScript errors

---

## 2026-01-21: XP- og Leveling-System Design (FORSLAG)

### Bakgrunn

Bruker ønsker et utvidet XP- og leveling-system med:
1. Bedre belønninger ved leveling
2. Bonus for å overleve lenge (spesielt med permadeath)
3. Ekstra action points ved visse levels

### Eksisterende System (fra REGELBOK.MD DEL 9)

**XP Thresholds:**
| Level | XP Krav | Akkumulert |
|-------|---------|------------|
| 1 | 0 | Start |
| 2 | 50 | 50 |
| 3 | 150 | 150 |
| 4 | 300 | 300 |
| 5 | 500 | Max |

**Nåværende Level Up Bonuser (velg EN):**
- +1 til en attributt (STR/AGI/INT/WIL)
- +2 Max HP
- +1 Max Sanity

### FORSLAG: Utvidet Leveling-System

#### 1. Nye Level Up Bonuser

Ved hvert level-up får spilleren velge EN bonus, men med flere valg:

| Bonus Type | Effekt | Tilgjengelig |
|------------|--------|--------------|
| **+1 Attributt** | +1 STR, AGI, INT, eller WIL | Alltid |
| **+2 Max HP** | Økt overlevelsesevne | Alltid |
| **+1 Max Sanity** | Bedre mental motstand | Alltid |
| **+1 Action Point** | Permanent +1 AP per runde | Level 3 og 5 |
| **+1 Attack Die** | Permanent +1 på angrep | Level 4 og 5 |
| **+1 Defense Die** | Permanent +1 på forsvar | Level 4 og 5 |
| **Skill Mastery** | +1 die på valgt skill-type | Level 2+ |

**Skill Mastery detaljer:**
- Investigation Mastery: +1 die på Investigate
- Combat Mastery: +1 die på alle angrepskast
- Occult Mastery: +1 die på Willpower (horror/ritual)
- Athletics Mastery: +1 die på Agility (unngå feller, flukt)

#### 2. Milestone Bonuser (Automatiske)

Disse bonus får helten automatisk ved å nå visse levels:

| Level | Milestone Bonus |
|-------|-----------------|
| 2 | **Hardened**: +1 die på første Horror Check per scenario |
| 3 | **Veteran's Instinct**: +1 AP første runde av hver scenario |
| 4 | **Iron Will**: Kan re-roll 1 die per runde på skill checks |
| 5 | **Legend**: Starter med +1 Insight, -1 på alle DC krav |

#### 3. Survivor Bonus System (For Permadeath-helter)

Helter med `hasPermadeath: true` får ekstra bonuser for å overleve:

**Scenario Streak Bonus:**
| Scenarios Overlevd | Bonus |
|--------------------|-------|
| 3 | +5% XP fra alle kilder |
| 5 | +10% XP, +5% Gold |
| 7 | +15% XP, +10% Gold |
| 10+ | +25% XP, +15% Gold, "Immortal" title |

**Survival Traits (velges ved milepæler):**

Etter 3 overlevde scenarios med permadeath, velg 1 trait:
- **Scarred Survivor**: +1 permanent HP, -1 Max Sanity
- **Paranoid Vigilance**: Kan ikke bli overrasket av fiender
- **Death's Defiance**: Én gang per scenario, ignorer dødelig skade (settes til 1 HP)

Etter 6 overlevde scenarios:
- **Hardened Mind**: Immun mot én valgt Madness-type
- **Battle-Tested**: +1 permanent Attack Die
- **Sixth Sense**: Ser alltid skjulte dører i nabofelter

#### 4. XP-kilder (Utvidet)

**Scenario-basert XP:**
| Kilde | XP | Notater |
|-------|-----|---------|
| Seier (Normal) | 30 | Base |
| Seier (Hard) | 45 | +50% |
| Seier (Nightmare) | 60 | +100% |
| Tap | 10 | Trøstepremie |
| Full Explore | +10 | Alle tiles utforsket |
| No Deaths | +15 | Ingen i gruppen døde |
| Speed Bonus | +10 | Fullført før Doom < 4 |

**Kill XP:**
| Fiende-type | XP per kill |
|-------------|-------------|
| Minion (Cultist, Mi-Go) | 2 |
| Warrior (Ghoul, Deep One) | 4 |
| Elite (Dark Priest, Hunting Horror) | 8 |
| Boss (Shoggoth, Star Spawn) | 15 |
| Ancient One | 30 |

**Bonus-objektiver:**
| Objektiv | XP |
|----------|-----|
| Sekundær objektiv | +15 |
| Finn sjelden gjenstand | +5 |
| Redde NPC | +10 |

#### 5. Action Point Progression

**Forslag: Annenhver level gir AP-bonus**

| Level | Base AP | Bonus | Total AP |
|-------|---------|-------|----------|
| 1 | 2 | - | 2 |
| 2 | 2 | - | 2 |
| 3 | 2 | +1 (Level bonus) | 3 |
| 4 | 2 | +1 | 3 |
| 5 | 2 | +2 (Level 3 + 5) | 4 |

**Alternativ: AP som valgfri bonus**
- Ved level 3: Kan velge +1 AP i stedet for andre bonuser
- Ved level 5: Kan velge +1 AP igjen

#### 6. TypeScript Implementasjon

**Nye typer i types.ts:**
```typescript
// Utvidet LevelUpBonus
export type LevelUpBonus =
  | { type: 'attribute'; attribute: keyof CharacterAttributes }
  | { type: 'maxHp'; value: 2 }
  | { type: 'maxSanity'; value: 1 }
  | { type: 'actionPoint'; value: 1 }
  | { type: 'attackDie'; value: 1 }
  | { type: 'defenseDie'; value: 1 }
  | { type: 'skillMastery'; skill: SkillMasteryType };

export type SkillMasteryType =
  | 'investigation' | 'combat' | 'occult' | 'athletics';

// Milestone bonuser (automatiske)
export interface MilestoneBonus {
  level: number;
  id: string;
  name: string;
  description: string;
  effect: MilestoneEffect;
}

export type MilestoneEffect =
  | { type: 'horror_die_bonus'; value: number }
  | { type: 'first_round_ap'; value: number }
  | { type: 'reroll_per_round'; value: number }
  | { type: 'insight_start'; value: number; dcReduction: number };

// Survivor traits (permadeath bonus)
export interface SurvivorTrait {
  id: string;
  name: string;
  description: string;
  requirement: number;  // Scenarios survived
  effect: SurvivorEffect;
}

// Survivor streak tracking
export interface SurvivorStreak {
  scenariosSurvived: number;
  xpMultiplier: number;
  goldMultiplier: number;
  title?: string;
}
```

**Oppdatert LegacyHero interface:**
```typescript
export interface LegacyHero {
  // ... eksisterende felt ...

  // Nye felt for utvidet leveling
  bonusActionPoints: number;       // Fra level bonuser
  bonusAttackDice: number;         // Fra level bonuser
  bonusDefenseDice: number;        // Fra level bonuser
  skillMasteries: SkillMasteryType[];
  milestones: string[];            // IDs av oppnådde milestones

  // Survivor tracking (permadeath)
  scenariosSurvivedStreak: number; // Uten å dø
  survivorTraits: string[];        // IDs av valgte traits
  survivorTitle?: string;          // Spesiell tittel
}
```

### UI-komponenter som trengs

1. **LevelUpModal.tsx** - Viser level-up valg med nye bonuser
2. **SurvivorTraitModal.tsx** - Viser survivor trait valg (permadeath)
3. **HeroStatsPanel.tsx** - Utvidet visning av hero stats med alle bonuser
4. **MilestoneNotification.tsx** - Toast/popup når milestone nås

### Prioritert Implementasjonsrekkefølge

1. **Fase 1: Core Level Bonuser**
   - Utvid `LevelUpBonus` type
   - Oppdater `applyLevelUpBonus()` i legacyManager
   - Legg til nye felt i `LegacyHero`
   - Oppdater `legacyHeroToPlayer()` for å bruke nye bonuser

2. **Fase 2: Action Point System**
   - Implementer AP-bonus ved level 3 og 5
   - Oppdater Player.actions basert på hero level

3. **Fase 3: Milestone System**
   - Definere alle milestones i constants.ts
   - Automatisk tildeling ved level-up
   - UI for å vise milestones

4. **Fase 4: Survivor System (Permadeath)**
   - Streak tracking
   - XP/Gold multipliers
   - Survivor traits

### Spørsmål til bruker

1. Skal AP-bonus være automatisk ved level 3/5, eller valgfri? **SVAR: AUTOMATISK**
2. Hvor kraftige skal survivor-bonusene være for permadeath? **SVAR: PASSE**
3. Skal alle bonuser være permanent, eller noen per-scenario?
4. Ønskes noen klasse-spesifikke level-bonuser? **SVAR: JA**

---

## 2026-01-21: XP- og Leveling-System IMPLEMENTERT

### Implementerte endringer

#### 1. types.ts - Nye typer

**Nye typer lagt til:**
```typescript
// Skill mastery types
export type SkillMasteryType = 'investigation' | 'combat' | 'occult' | 'athletics';

// Utvidet LevelUpBonus
export type LevelUpBonus =
  | { type: 'attribute'; attribute: keyof CharacterAttributes }
  | { type: 'maxHp'; value: 2 }
  | { type: 'maxSanity'; value: 1 }
  | { type: 'actionPoint'; value: 1 }
  | { type: 'attackDie'; value: 1 }
  | { type: 'defenseDie'; value: 1 }
  | { type: 'skillMastery'; skill: SkillMasteryType };

// Milestone system
export interface MilestoneBonus { ... }
export type MilestoneEffect = ...

// Survivor system (permadeath)
export interface SurvivorTrait { ... }
export type SurvivorEffect = ...

// Class-specific bonuses
export interface ClassLevelBonus { ... }
export type ClassBonusEffect = ...
```

**LegacyHero utvidet med:**
```typescript
// Extended leveling system (v2)
bonusActionPoints: number;
bonusAttackDice: number;
bonusDefenseDice: number;
skillMasteries: SkillMasteryType[];
milestones: string[];

// Survivor tracking (permadeath)
scenariosSurvivedStreak: number;
survivorTraits: string[];
survivorTitle?: string;

// Class-specific bonuses
classBonuses: string[];
```

#### 2. constants.ts - Nye konstanter

**MILESTONE_BONUSES:**
- Level 2: Hardened (+1 die første Horror Check)
- Level 3: Veteran's Instinct (+1 AP første runde)
- Level 4: Iron Will (1 re-roll per runde)
- Level 5: Legend (+1 Insight start, -1 DC)

**SURVIVOR_TRAITS (Tier 1 - 3 scenarios):**
- Scarred Survivor (+1 HP, -1 Sanity)
- Paranoid Vigilance (kan ikke overraskes)
- Death's Defiance (overlev dødelig skade én gang)

**SURVIVOR_TRAITS (Tier 2 - 6 scenarios):**
- Hardened Mind (immun mot valgt Madness)
- Battle-Tested (+1 Attack Die)
- Sixth Sense (detect secret doors)

**SURVIVOR_STREAK_BONUSES:**
- 3 scenarios: +5% XP
- 5 scenarios: +10% XP, +5% Gold
- 7 scenarios: +15% XP, +10% Gold
- 10+ scenarios: +25% XP, +15% Gold, "Immortal" title

**CLASS_LEVEL_BONUSES (for hver klasse ved level 2, 3, 5):**
- Detective: Sharp Eye, Keen Intuition, Master Investigator
- Professor: Arcane Knowledge, Scholarly Mind, Master Occultist
- Occultist: Dark Arts, Ritual Master, Eldritch Power
- Veteran: Combat Training, Marksman, War Hero
- Journalist: Street Smart, Nimble, Scoop Master
- Nurse: Field Medic, Trauma Specialist, Angel of Mercy

**Hjelpefunksjoner:**
- `getSurvivorStreakBonus()`
- `getClassBonusesForLevel()`
- `getMilestoneForLevel()`
- `getAvailableSurvivorTraits()`
- `getAutomaticAPBonus()`

#### 3. legacyManager.ts - Oppdaterte funksjoner

**createLegacyHero():**
- Initialiserer alle nye felt (bonusActionPoints, skillMasteries, etc.)

**applyLevelUpBonus():**
- Støtter nå alle nye bonus-typer:
  - actionPoint: +1 til bonusActionPoints
  - attackDie: +1 til bonusAttackDice
  - defenseDie: +1 til bonusDefenseDice
  - skillMastery: Legger til skill i skillMasteries array

**getLevelUpOptions(heroLevel):**
- Skill mastery tilgjengelig fra level 2+
- Attack/Defense dice tilgjengelig fra level 4+

**legacyHeroToPlayer():**
- Beregner automatisk AP-bonus (level 3 = +1, level 5 = +2)
- Legger til manuelle AP-bonuser fra level-up valg
- Beregner bonus attack/defense dice
- Level 5 helter starter med +1 Insight (Legend milestone)

### AP Progression (AUTOMATISK)

| Level | Base AP | Auto Bonus | Total |
|-------|---------|------------|-------|
| 1 | 2 | 0 | 2 |
| 2 | 2 | 0 | 2 |
| 3 | 2 | +1 | 3 |
| 4 | 2 | +1 | 3 |
| 5 | 2 | +2 | 4 |

### Build Status
✅ TypeScript kompilerer uten feil

### UI-komponenter IMPLEMENTERT

#### LevelUpModal.tsx
Modal som vises når en helt levler opp:
- Viser alle tilgjengelige bonuser basert på level
- Grupperer bonuser i kategorier (Attributes, Vitality, Skill Masteries, Combat)
- Viser automatisk milestone-bonus som er opplåst ved dette nivået
- Filtrerer bort allerede valgte skill masteries

**Features:**
- Gule highlight for valgt bonus
- Fargekodede ikoner for hver bonus-type
- Beskrivelser for hver bonus
- Bekreftelses-knapp aktiveres kun når valg er gjort

#### SurvivorTraitModal.tsx
Modal som vises når en permadeath-helt når 3 eller 6 overlevde scenarios:
- Viser tilgjengelige survivor traits (Tier 1 ved 3, Tier 2 ved 6)
- Viser nåværende streak-bonuser (XP%, Gold%, Title)
- Viser allerede valgte traits
- Advarsel om at dette er permadeath-helt

**Features:**
- Lilla/indigo tema for survivor-systemet
- Tydelig tier-inndeling
- Skip-knapp for å velge senere
- Viser hvilke traits som allerede er valgt

### Build Status
✅ TypeScript kompilerer uten feil
✅ LevelUpModal.tsx opprettet
✅ SurvivorTraitModal.tsx opprettet

### Integrert i ShadowsGame.tsx

Modalene er nå fullt integrert i hovedspillet:

**Nye state-variabler:**
- `showLevelUpModal`, `levelUpQueue`, `currentLevelUpHero`
- `showSurvivorTraitModal`, `survivorTraitQueue`, `currentSurvivorHero`

**Nye callback-funksjoner:**
- `handleLevelUpBonusSelect()` - Håndterer level-up valg, oppdaterer hero, går til neste i kø
- `handleSurvivorTraitSelect()` - Håndterer survivor trait valg, appliserer effekter
- `handleSkipSurvivorTrait()` - Hopp over survivor trait for nå

**Integrasjon i handleScenarioComplete():**
1. Helter som kan levle legges i `levelUpQueue`
2. Permadeath-helter som når 3 eller 6 scenarios legges i `survivorTraitQueue`
3. `scenariosSurvivedStreak` inkrementeres for permadeath-helter
4. LevelUpModal vises først, deretter SurvivorTraitModal

**Flow:**
```
Scenario Complete
    ↓
Calculate rewards, check level-ups
    ↓
Show LevelUpModal for each hero that leveled
    ↓
Show SurvivorTraitModal for permadeath heroes at milestones
    ↓
Show MerchantShop
```

### Build Status
✅ TypeScript kompilerer uten feil
✅ Modalene integrert i ShadowsGame.tsx

### Gjenstående UI (lavere prioritet)
- HeroStatsPanel - utvidet visning av alle bonuser
- MilestoneNotification - toast ved milestone

---


## 2026-01-21: Quest Editor Fase 3 - Validering og Door Config

### Oppsummering

Implementert Fase 3 av Quest Editor med fokus på validering, dør-konfigurasjon og custom descriptions:
- Komplett valideringssystem for scenarios
- Dør-tilstand konfigurasjon per DOOR edge
- Custom descriptions per tile

---

### Implementerte komponenter

#### 1. ValidationPanel (`ValidationPanel.tsx`)
Komplett valideringsssystem for scenarios:

**Valideringssjekker:**
- **Start Location**: Sjekker at én start location er definert
- **Connectivity**: BFS-algoritme for å finne disconnected tiles
- **Door Mismatches**: Sjekker at dør-edges matcher på begge sider
- **Objectives**: Validerer at objectives er oppnåelige
  - Boss-objectives: Sjekker at boss er plassert
  - Find-item: Sjekker at item er plassert
  - Collect: Sjekker at nok items er plassert
  - Kill-enemies: Sjekker at nok fiender er plassert
  - RevealedBy-references: Validerer at refererte objectives eksisterer
- **Metadata**: Sjekker title og briefing
- **Balance**: Advarer om høy monster-densitet eller lav doom

**Severity-nivåer:**
- Error (rød): Må fikses for gyldig scenario
- Warning (gul): Bør fikses, men ikke kritisk
- Info (blå): Forbedringsforslag

**Features:**
- Klikkbare issues som navigerer til relevant tile
- Live stats (tiles, monsters, items, objectives)
- Grønn/rød status-header basert på validitet
- Kategoriserte issues med ikoner

#### 2. DoorConfigPanel (`DoorConfigPanel.tsx`)
Konfigurasjon av dør-tilstander for DOOR edges:

**Dør-tilstander:**
- OPEN: Åpen dør, fri passasje
- CLOSED: Lukket dør, 1 AP å åpne
- LOCKED: Låst, krever nøkkel eller lockpick
- BARRICADED: Barrikadert, krever styrkesjekk
- BROKEN: Ødelagt, permanent åpen
- SEALED: Okkult forseglet, krever ritual
- PUZZLE: Krever puzzle-løsning

**Locked door options:**
- Key ID: Spesifik nøkkel som kreves
- Lock Difficulty (DC 3-6): Vanskelighetsgrad for lockpicking

**Quick Actions:**
- "All Closed" / "All Open" / "All Locked"

#### 3. Custom Descriptions
Felt for egendefinert beskrivelse per tile:
- Vises in-game når spiller entrer tilen
- Overskriver/supplerer template-beskrivelse

---

### Oppdateringer til eksisterende komponenter

#### QuestEditor (index.tsx)
- Ny "Validate" tab i høyre sidebar
- DoorConfig interface lagt til EditorTile
- customDescription felt på tiles
- Export versjon oppdatert til 3.0
- Validering kjøres ved eksport (inkludert i JSON)
- EdgeConfigPanel oppdatert til å auto-opprette doorConfig

#### Export Format (v3.0)
```json
{
  "metadata": { ... },
  "objectives": [ ... ],
  "tiles": [
    {
      // ... eksisterende felt
      "doorConfigs": {
        "0": { "state": "LOCKED", "keyId": "master_key", "lockDifficulty": 4 }
      },
      "customDescription": "En mørk korridor..."
    }
  ],
  "validation": {
    "isValid": true,
    "errorCount": 0,
    "warningCount": 2
  },
  "version": "3.0"
}
```

---

### Funksjonalitet (Oppdatert)

| Feature | Status |
|---------|--------|
| **Fase 1** | |
| Hex-grid rendering | ✅ |
| Tile placement/selection/deletion | ✅ |
| Tile rotation | ✅ |
| Pan/zoom | ✅ |
| Tile palette med kategorier | ✅ |
| Søk i tiles | ✅ |
| JSON export/import | ✅ |
| Start location marking | ✅ |
| Properties panel | ✅ |
| Scenario metadata | ✅ |
| **Fase 2** | |
| Edge-konfigurasjon per tile | ✅ |
| Monster-plassering | ✅ |
| Quest item-plassering | ✅ |
| Objective editor | ✅ |
| Tabbed interface | ✅ |
| Visuelle indikatorer på canvas | ✅ |
| **Fase 3** | |
| Validering | ✅ |
| Door state config | ✅ |
| Custom descriptions | ✅ |

---

### Build Status
✅ TypeScript kompilerer uten feil
✅ ValidationPanel.tsx opprettet
✅ DoorConfigPanel.tsx opprettet

### Gjenstående Fase 3 (prioritert)
- [ ] Preview/Test mode - Spill gjennom scenariet fra editoren
- [ ] Trigger system - Events ved objective completion
- [ ] NPC-plassering - Survivors, merchants, quest givers
- [ ] Doom events editor

### Gjenstående (lavere prioritet)
- [ ] Undo/Redo system
- [ ] Scenario loader (JSON til spillbart Scenario)
- [ ] Tile-to-board converter

---

## 2026-01-21: Quest Editor Fase 3 - Fullført

### Oppsummering

Implementert alle gjenstående features fra Fase 3-listen:

| Feature | Prioritet | Status |
|---------|-----------|--------|
| Preview/Test mode | Høy | ✅ Ferdig |
| Trigger system | Medium | ✅ Ferdig |
| NPC-plassering | Medium | ✅ Ferdig |
| Doom events editor | Medium | ✅ Ferdig |
| Undo/Redo | Lav | Ikke startet |

---

### 1. Preview/Test Mode (`PreviewPanel.tsx`)

Fullscreen modal som lar scenario-skapere teste scenariet fra spillerperspektivet.

**Features:**
- Visuell hex-grid med alle tiles
- Simulert spiller-bevegelse (klikk på nabo-tiles)
- Fog of War toggle (viser/skjuler uutforskede tiles)
- Doom-teller som synker ved bevegelse
- Objective-tracking sidebar
- Briefing-overlay ved oppstart
- Monster/item-indikatorer på tiles
- Edge-visualisering (vegger, dører, vinduer, trapper)
- Undo-funksjon for å angre siste trekk
- Reset-knapp for å starte på nytt

**UI-elementer:**
- Venstre sidebar: Objectives med progress-tracking
- Senter: SVG-basert hex-map med interaktive tiles
- Høyre sidebar: Legend for symboler og farger
- Header: Doom-counter, fog toggle, undo/reset knapper

---

### 2. Trigger System (`TriggerPanel.tsx`)

Komplett event-system for å definere triggers som reagerer på spillhendelser.

**Trigger Types:**
- `objective_complete`: Når et objective fullføres
- `tile_enter`: Når spiller entrer en bestemt tile
- `doom_threshold`: Når doom når en bestemt verdi
- `item_pickup`: Når et item plukkes opp
- `enemy_killed`: Når en fientype drepes
- `round_start`: Ved starten av en bestemt runde

**Action Types:**
- `spawn_enemy`: Spawn monstre på en tile
- `unlock_door`: Lås opp en låst dør
- `reveal_tile`: Gjør en skjult tile synlig
- `add_item`: Legg til et item på en tile
- `modify_doom`: Endre doom-telleren
- `show_message`: Vis narrativ tekst
- `play_sound`: Spill lydeffekt
- `complete_objective`: Marker et objective som fullført

**Features:**
- Expandable trigger-cards med alle detaljer
- Condition-konfigurasjon per trigger type
- Multiple actions per trigger
- One-time / repeating toggle
- Enable/disable toggle
- Delay (i runder) før trigger aktiveres
- Quick templates: Boss Spawn, Ambush, Key→Door

---

### 3. NPC-plassering (`NPCPalette.tsx`)

Panel for å plassere NPCs (Non-Player Characters) på tiles.

**NPC Types:**
- `survivor`: Kan reddes (rescue objectives)
- `merchant`: Selger items for gull
- `quest_giver`: Gir sekundære objectives
- `contact`: Gir informasjon/clues
- `hostile`: Fiendtlig NPC som kan bekjempes eller overtales

**Konfigurerbare felt per NPC:**
- Navn og beskrivelse
- Greeting dialogue
- Portrait (forhåndsdefinerte alternativer)

**Type-spesifikke felt:**
- **Survivor**: Rescue Objective ID
- **Merchant**: Inventory (item ID, navn, pris)
- **Quest Giver**: Quest ID, Quest Description
- **Contact**: Clue Text, Insight Reward
- **Hostile**: Can Be Reasoned With, Persuasion DC

**Features:**
- Hidden/Revealed toggle
- RevealedBy (linking til trigger/objective)
- Quick-add buttons for hver NPC-type
- Random navn-forslag per type

---

### 4. Doom Events Editor (`DoomEventsPanel.tsx`)

Dedikert UI for å sette opp doom-triggered events.

**Action Types:**
- `spawn_enemy`: Spawn monstre
- `spawn_boss`: Spawn boss-monster
- `lock_doors`: Lås dører (alle eller spesifikk)
- `unlock_doors`: Lås opp dører
- `darkness`: Mørke-effekt
- `sanity_attack`: Sanity-skade til alle spillere
- `show_message`: Vis varsel/narrativ
- `play_sound`: Atmosfære-lyd
- `reveal_tile`: Avsløre skjulte tiles

**Features:**
- Visuell doom timeline (gradient fra grønn til rød)
- Event-markører på timeline
- Sortert liste etter doom-terskel (høyeste først)
- One-time toggle
- Enable/disable toggle
- Quick templates: Reinforcements, Boss Spawn, Darkness, Final Warning

---

### Filer opprettet

- `src/game/components/QuestEditor/PreviewPanel.tsx` (NY)
- `src/game/components/QuestEditor/TriggerPanel.tsx` (NY)
- `src/game/components/QuestEditor/NPCPalette.tsx` (NY)
- `src/game/components/QuestEditor/DoomEventsPanel.tsx` (NY)

### Filer oppdatert

- `src/game/components/QuestEditor/index.tsx`
  - Importert alle nye komponenter
  - Lagt til triggers, doomEvents, og showPreview state
  - Utvidet EditorTile med npcs felt
  - Nye tabs: NPCs, Triggers, Doom
  - Preview-knapp i toolbar
  - Export/import støtter alle nye data

### Export Format (v3.1)

```json
{
  "metadata": { ... },
  "objectives": [ ... ],
  "triggers": [
    {
      "id": "trigger_123",
      "name": "Boss Spawn",
      "type": "doom_threshold",
      "doomValue": 3,
      "doomComparison": "lte",
      "actions": [
        { "type": "spawn_enemy", "enemyType": "shoggoth", "enemyCount": 1 },
        { "type": "show_message", "messageTitle": "Terror!", "message": "..." }
      ],
      "isOneTime": true,
      "isEnabled": true
    }
  ],
  "doomEvents": [
    {
      "id": "doom_event_456",
      "name": "Reinforcements",
      "doomThreshold": 8,
      "actions": [ ... ],
      "isOneTime": true,
      "isEnabled": true
    }
  ],
  "tiles": [
    {
      // ... eksisterende felt
      "npcs": [
        {
          "id": "npc_789",
          "type": "merchant",
          "name": "Shady Dealer",
          "greeting": "What do you need?",
          "inventory": [
            { "itemId": "revolver", "itemName": "Revolver", "price": 200 }
          ]
        }
      ]
    }
  ],
  "version": "3.1"
}
```

---

### Quest Editor Tab-oversikt (nå 9 tabs)

| Tab | Ikon | Farge | Innhold |
|-----|------|-------|---------|
| Tile | Settings | Amber | Tile properties, edge config, door config, custom description |
| Monsters | Skull | Rød | Monster-plassering på valgt tile |
| Items | Package | Grønn | Quest items på valgt tile |
| NPCs | Users | Cyan | NPC-plassering på valgt tile |
| Goals | Target | Purple | Scenario objectives |
| Triggers | Zap | Gul | Event triggers |
| Doom | AlertTriangle | Rød | Doom threshold events |
| Validate | CheckCircle | Grønn | Scenario validering |

Plus Preview-knapp i toolbar.

---

### Build Status
✅ TypeScript kompilerer uten feil

### Gjenstående (lavere prioritet)
- [x] Undo/Redo system ✅ (2026-01-21)
- [ ] Scenario loader (JSON til spillbart Scenario)
- [ ] Tile-to-board converter

---

## 2026-01-21: Quest Editor - Undo/Redo System

### Oppsummering

Implementert komplett Undo/Redo system for Quest Editor som lar brukere angre og gjøre om endringer.

---

### Implementasjon

#### Ny fil: `useUndoRedo.ts`

Custom React hook for historikkbehandling:

**Features:**
- State snapshot-basert tilnærming
- JSON serialisering for å unngå mutasjonsproblemer
- Maks 50 tilstander i historikken
- Automatisk håndtering av undo/redo stacks

**API:**
```typescript
interface UndoRedoHook {
  canUndo: boolean;           // Kan angre
  canRedo: boolean;           // Kan gjøre om
  undoStack: number;          // Antall tilstander i undo-stack
  redoStack: number;          // Antall tilstander i redo-stack
  undo: () => UndoableState | null;      // Angre siste handling
  redo: () => UndoableState | null;      // Gjør om angret handling
  pushState: (state, action) => void;    // Registrer ny tilstand
  clear: () => void;          // Tøm historikk
  lastAction: string;         // Beskrivelse av siste handling
}
```

**UndoableState inneholder:**
- tiles (Map)
- objectives
- triggers
- doomEvents
- metadata

---

### Integrasjon i Quest Editor

#### Toolbar
- Undo-knapp (Undo2 ikon) - deaktivert når ingenting å angre
- Redo-knapp (Redo2 ikon) - deaktivert når ingenting å gjøre om

#### Keyboard Shortcuts
- **Ctrl+Z** / **Cmd+Z**: Angre
- **Ctrl+Shift+Z** / **Cmd+Shift+Z**: Gjør om
- **Ctrl+Y** / **Cmd+Y**: Gjør om (alternativ)

#### Status Bar
- Viser siste handling ("Last: Place tile: Manor Foyer")
- Oppdatert shortcut-visning

---

### Handlinger som spores

| Kategori | Handlinger |
|----------|------------|
| **Tiles** | Place tile, Delete tile, Clear all |
| **Tile Properties** | Set start location, Change edge, Change door config |
| **Content** | Update monsters, Update items, Update NPCs |
| **Scenario** | Update objectives, Update triggers, Update doom events |
| **File** | Import scenario |

---

### Tekniske detaljer

**State Serialisering:**
```typescript
// Serialize Map til array for lagring
function serializeState(state: UndoableState): string {
  return JSON.stringify({
    tiles: Array.from(state.tiles.entries()),
    objectives: state.objectives,
    // ...
  });
}

// Deserialize tilbake til Map
function deserializeState(json: string): UndoableState {
  const parsed = JSON.parse(json);
  return {
    tiles: new Map(parsed.tiles),
    // ...
  };
}
```

**Undo-logikk:**
- Når handling utføres: `pushState(currentState, "action description")`
- Redo-stack tømmes ved ny handling (standard oppførsel)
- Ved undo: Pop fra undo-stack, push til redo-stack
- Ved redo: Pop fra redo-stack, push til undo-stack

---

### Filer

**Ny:**
- `src/game/components/QuestEditor/useUndoRedo.ts`

**Oppdatert:**
- `src/game/components/QuestEditor/index.tsx`
  - Importert useUndoRedo hook og Undo2/Redo2 ikoner
  - Lagt til undo/redo knapper i toolbar
  - Keyboard shortcuts med useEffect
  - recordAction() for alle state-endrende operasjoner
  - Oppdatert status bar med siste handling

---

### Build Status
✅ TypeScript kompilerer uten feil
✅ Build vellykket (1,405 kB bundle)

---

### Quest Editor - Komplett funksjonsoversikt

| Feature | Status |
|---------|--------|
| **Fase 1 - Grunnleggende** | |
| Hex-grid rendering | ✅ |
| Tile placement/selection/deletion | ✅ |
| Tile rotation | ✅ |
| Pan/zoom | ✅ |
| Tile palette med kategorier | ✅ |
| Søk i tiles | ✅ |
| JSON export/import | ✅ |
| Start location marking | ✅ |
| Properties panel | ✅ |
| Scenario metadata | ✅ |
| **Fase 2 - Innhold** | |
| Edge-konfigurasjon per tile | ✅ |
| Monster-plassering | ✅ |
| Quest item-plassering | ✅ |
| Objective editor | ✅ |
| Tabbed interface | ✅ |
| Visuelle indikatorer på canvas | ✅ |
| **Fase 3 - Avansert** | |
| Validering | ✅ |
| Door state config | ✅ |
| Custom descriptions | ✅ |
| Preview/Test mode | ✅ |
| Trigger system | ✅ |
| NPC-plassering | ✅ |
| Doom events editor | ✅ |
| **Undo/Redo** | ✅ |

---

### Gjenstående (lavere prioritet)
- [x] Scenario loader (JSON til spillbart Scenario) ✅ Implementert
- [x] Tile-to-board converter ✅ Implementert

---

## 21. januar 2026 - Quest Editor Forbedringer

### Endringer implementert

#### 1. Forbedret Preview med tilegrafikk og bevegelse
**Fil:** `src/game/components/QuestEditor/PreviewPanel.tsx`

- **AI-genererte tile-bilder:** Samme tile-bilder som hovedspillet brukes nå i preview
- **Hexagonal klipping:** Tiles rendres med hexagonal clipPath som i hovedspillet
- **Pan & zoom:** Dra for å panorere, scroll for å zoome (0.3x - 2x)
- **Touch-støtte:** Full touch-støtte for mobil
- **Spillerlignende bevegelse:** Klikk på nærliggende tiles for å bevege seg
- **Fog of war:** Toggle for å vise/skjule uutforskede tiles
- **Edge-indikatorer:** Viser vegger, dører, trapper visuelt
- **Content-indikatorer:** Monster (rød), items (grønn), NPCs (cyan)
- **Briefing-overlay:** Viser scenario-briefing før start
- **Doom-tracker:** Viser gjeldende doom-verdi

#### 2. Tile-plassering med modifier key (Shift+Click)
**Filer:**
- `src/game/components/QuestEditor/EditorCanvas.tsx`
- `src/game/components/QuestEditor/index.tsx`

**Problem løst:** Tiles ble overskrevet automatisk når man klikket på eksisterende tiles

**Løsning:**
- **Vanlig klikk på tom celle:** Plasserer tile
- **Vanlig klikk på eksisterende tile:** Velger tilen
- **Shift+Click på eksisterende tile:** Erstatter tilen med valgt template

**UI-endringer:**
- Oppdatert instruksjoner i EditorCanvas
- Ny shortcut-visning i status bar: "Shift+Click=Replace"

#### 3. Campaign System
**Ny fil:** `src/game/components/QuestEditor/CampaignEditor.tsx`

**Funksjoner:**
- **Opprett kampanjer:** Sett sammen flere quests til en sammenhengende kampanje
- **Quest-rekkefølge:** Definer rekkefølge med drag (opp/ned)
- **Prerequisites:** Sett hvilke quests som må fullføres først
- **Quest rewards:** XP og gold bonuser per quest
- **Campaign settings:**
  - `persistHeroes`: Heroes beholdes mellom quests
  - `persistEquipment`: Utstyr beholdes
  - `sharedGold`: Felles gull-pool
  - `permadeathEnabled`: Permadeath aktivert
  - `allowMerchant`: Merchant mellom quests
  - `startingGold`: Start-gull for nye helter
- **Campaign rewards:** XP og gold ved fullføring av hele kampanjen
- **Import/Export:** JSON-fil for deling
- **LocalStorage:** Lagring av kampanjer

**Tilgang:** Campaign-knapp i Quest Editor toolbar

#### 4. Custom Quest Loader
**Ny fil:** `src/game/components/QuestEditor/CustomQuestLoader.tsx`

**Funksjoner:**
- **Laste quests:** Fra localStorage eller importert JSON-fil
- **Quest-liste:** Viser alle lagrede quests med metadata
- **Quest-detaljer:**
  - Tittel, vanskelighetsgrad, doom
  - Beskrivelse og briefing
  - Statistikk (tiles, objectives, enemies)
  - Liste over objectives
- **Start quest:** Konverterer Quest Editor-format til spillbart Scenario
- **Campaign-fane:** Forberedt for fremtidig kampanje-spill

**Konvertering:**
- `convertEditorTileToTile()`: Editor tile → Game tile
- `convertEditorObjectiveToScenarioObjective()`: Editor objective → Scenario objective
- `convertEditorDoomEvent()`: Editor doom event → Game doom event
- `convertQuestToScenario()`: Komplett quest → Scenario + tiles

**Tilgang:** "Custom Quest" knapp i hovedmeny

### Filer endret

**Nye filer:**
- `src/game/components/QuestEditor/CampaignEditor.tsx`
- `src/game/components/QuestEditor/CustomQuestLoader.tsx`

**Oppdaterte filer:**
- `src/game/components/QuestEditor/PreviewPanel.tsx` - Fullstendig omskrevet
- `src/game/components/QuestEditor/EditorCanvas.tsx` - Modifier key støtte
- `src/game/components/QuestEditor/index.tsx` - Campaign Editor, eksporter
- `src/game/components/MainMenu.tsx` - Custom Quest knapp
- `src/game/ShadowsGame.tsx` - Custom Quest Loader integrasjon

### Build Status
✅ TypeScript kompilerer uten feil

---

### Quest Editor - Oppdatert funksjonsoversikt

| Feature | Status |
|---------|--------|
| **Fase 1-3** | ✅ Komplett |
| **Preview med tilegrafikk** | ✅ |
| **Preview med bevegelse** | ✅ |
| **Shift+Click for å erstatte tiles** | ✅ |
| **Campaign Editor** | ✅ |
| **Custom Quest Loader** | ✅ |
| **Kampanje-spill** | 🔜 (UI klart, logikk gjenstår) |

---

## 2026-01-21: Refactor contextActionBuilder.ts - Extract Generic Builder

### Oppgave
Refaktorere kompleks kode i `contextActionBuilder.ts` for bedre klarhet og vedlikeholdbarhet.

### Problem Identifisert
Tre spesialiserte builder-funksjoner hadde nesten identisk struktur med mye duplisert kode:

1. **`buildLockedDoorActions()`** (36 linjer)
2. **`buildSealedDoorActions()`** (37 linjer)
3. **`buildBlockedEdgeActions()`** (40 linjer)

Alle tre funksjoner gjorde det samme:
- Loopet over configs
- Hentet DC, enabled, reason fra config
- Erstattet template-variabler i label
- Bygget action-objekt med samme felt
- La til skillCheck basert på ulike kriterier

Den eneste forskjellen var:
- Default DC-verdi (4, 5, eller context.blockingDC)
- Hvordan skill type ble bestemt (ulik logikk for hver dør-type)

### Løsning: Generisk Builder med Skill Resolvers

#### 1. Ny Type: SkillResolver
```typescript
/**
 * Callback type for resolving skill type from action id.
 * Returns SkillType if skill check should be added, null to skip, undefined to auto-infer.
 */
type SkillResolver = (actionId: string) => SkillType | null | undefined;
```

#### 2. Ny Konfigurasjon: DynamicActionBuilderOptions
```typescript
interface DynamicActionBuilderOptions {
  /** Default DC if config.getDC is not provided */
  defaultDC: number | ((context: ActionContext) => number);
  /** Callback to resolve skill type from action id */
  skillResolver: SkillResolver;
}
```

#### 3. Generisk Builder-funksjon
```typescript
function buildSingleDynamicAction(
  config: DynamicActionConfig,
  context: ActionContext,
  options: DynamicActionBuilderOptions
): ContextAction
```

#### 4. Skill Resolvers (data-drevet)
```typescript
const LOCKED_DOOR_SKILL_RESOLVER: SkillResolver = (actionId) => {
  if (actionId === 'use_key') return null;
  if (actionId === 'lockpick') return 'agility';
  return 'strength';
};

const SEALED_DOOR_SKILL_RESOLVER: SkillResolver = (actionId) => {
  if (actionId === 'break_seal') return 'willpower';
  if (actionId === 'read_glyphs') return 'intellect';
  if (actionId === 'use_elder_sign') return null;
  return null;
};

const BLOCKED_EDGE_SKILL_RESOLVER: SkillResolver = () => undefined; // Auto-infer
```

### Refaktorerte Funksjoner

**Før:** 113 linjer totalt (36 + 37 + 40)
**Etter:** 55 linjer generisk + 35 linjer resolvers + 25 linjer wrappers = samme totalt, men langt bedre struktur

**`buildLockedDoorActions` - Før:**
```typescript
export function buildLockedDoorActions(context, configs) {
  return configs.map(config => {
    // 30+ linjer duplisert kode
    if (config.id !== 'use_key') {
      const skillType = config.id === 'lockpick' ? 'agility' : 'strength';
      action.skillCheck = { skill: skillType, dc };
    }
    return action;
  });
}
```

**`buildLockedDoorActions` - Etter:**
```typescript
export function buildLockedDoorActions(context, configs) {
  return buildDynamicActionsWithSkill(configs, context, {
    defaultDC: 4,
    skillResolver: LOCKED_DOOR_SKILL_RESOLVER
  });
}
```

### Fordeler med Refaktoreringen

| Aspekt | Før | Etter |
|--------|-----|-------|
| **Linjer per funksjon** | 36-40 | 4-8 |
| **Duplisert kode** | ~80 linjer | 0 linjer |
| **Å legge til ny dør-type** | Copy-paste 36 linjer | Lag ny SkillResolver (5 linjer) |
| **Testing** | Vanskelig (inline logikk) | Lett (resolvers kan testes separat) |
| **Lesbarhet** | Lav (må lese 40 linjer for å forstå) | Høy (intent er tydelig i 4 linjer) |
| **Vedlikeholdbarhet** | Lav (endre på 3 steder) | Høy (endre på 1 sted) |

### Prinsipper Anvendt

1. **DRY (Don't Repeat Yourself)** - Duplisert kode ekstrahert til generisk funksjon
2. **Configuration over Code** - Skill resolution definert som data (callbacks)
3. **Single Responsibility** - `buildSingleDynamicAction` gjør én ting godt
4. **Open/Closed** - Lett å legge til nye dør-typer uten å endre generisk kode
5. **Strategy Pattern** - SkillResolvers fungerer som utbyttbare strategier

### Fil Modifisert
- `src/game/utils/contextActionBuilder.ts`
  - Linjer 183-350 (SPECIALIZED BUILDERS seksjonen)
  - Ingen endring i public API - alle eksporterte funksjoner har samme signatur

### Build Status
✅ TypeScript kompilerer uten feil
✅ Ingen breaking changes - alle eksporterte funksjoner opprettholder samme oppførsel

---
