# Development Log

## 2026-01-20: Cast Spell Action - "The Arcane Arts"

### Oppgave
Implementere en "Cast Spell" action i action bar for hero-karakterer som kan bruke magi (Occultist). Denne handlingen lar spillere velge en spell fra karakterens spell-liste, forbruke nødvendig Insight-kostnad, og anvende spell-effekten.

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
