# Black Tiles Bug - Komplett Dokumentasjon

> **Status:** LØST (per 2026-01-28)
> **Kompleksitet:** Høy - Buggen hadde multiple rotårsaker

## Oversikt

"Black tiles"-buggen var et vedvarende problem hvor hex-tiles ble helt svarte (usynlige) når spilleren beveget seg bort fra dem. Dette var en av de mest irriterende bugs i Mythos Quest, og det krevde **6+ separate fikseforsøk** før problemet ble fullstendig løst.

---

## Symptomer

- Hex-tiles ble helt svarte når spilleren forlot dem
- Nye rom som ble spawnet var umiddelbart svarte
- Cluster-tiles (multi-rom bygninger) var ofte svarte
- Ved gjenopptakelse av lagret spill kunne tiles være svarte
- Floor textures var knapt synlige selv når tiles "fungerte"

---

## Tidslinje over Fikseforsøk

### Forsøk 1: PR #186 - Floor Texture Brightness
**Dato:** 2026-01-24 (tidlig)
**Commit:** `b0fe1bc`

**Hypotese:** Floor textures var for mørke.

**Løsning forsøkt:**
- Økte chiaroscuro overlay lightness fra ~10% til ~20-28%
- Justerte oil texture og edge light overlays

**Resultat:** ❌ Feilet - Tiles var fortsatt svarte

**Hvorfor det feilet:** Problemet var ikke visuelt (brightness), men logisk (explored tiles tracking).

---

### Forsøk 2: PR #187 - Fog Opacity Reduksjon
**Dato:** 2026-01-24
**Commit:** `cbfd657`

**Hypotese:** Fog overlay var for sterk over explored tiles.

**Løsning forsøkt:**
```typescript
// FØR
fogOpacity = isExplored ? 0.35 : 0.95;

// ETTER
fogOpacity = isExplored ? 0.15 : 0.9;
```

**Resultat:** ⚠️ Delvis - Hjalp litt, men tiles ble fortsatt svarte

**Hvorfor det kun delvis virket:** Reduserte symptomene, men løste ikke rotårsaken.

---

### Forsøk 3: PR #189 - Floor Texture + Fog Combo Fix
**Dato:** 2026-01-24
**Commit:** `f7bc05c`

**Hypotese:** Kombinasjonen av mørke floor textures OG fog overlay var problemet.

**Løsning forsøkt:**
1. Redusert fog opacity for explored tiles: `0.35` → `0.15`
2. Redusert fog for vision edge: `0.1 + dist*0.08` → `0.05 + dist*0.05`
3. Økt floor texture brightness i CSS fra ~20% til ~35% lightness

| Texture | Før | Etter |
|---------|-----|-------|
| stone-floor | hsl(0,0%,20%) | hsl(0,0%,35%) |
| wood-floor | hsl(30,15%,22%) | hsl(30,20%,38%) |
| dirt-floor | hsl(25,20%,18%) | hsl(25,25%,35%) |

**Resultat:** ⚠️ Delvis - Bedre synlighet, men tiles ble fortsatt svarte i noen tilfeller

---

### Forsøk 4: PR #190 - Explored Tiles Logic Fix
**Dato:** 2026-01-24 (sent)
**Commit:** `cca30c2`

**Hypotese:** `exploredTiles` ble ikke korrekt oppdatert ved bevegelse.

**Løsning forsøkt:**
- La til tiles fra BÅDE gammel og ny posisjon til exploredTiles
- Sørget for at nabotiles ble inkludert

**Resultat:** ⚠️ Delvis - Hjalp, men problemet dukket fortsatt opp

**Hvorfor det kun delvis virket:** Fant ikke race condition med stale state.

---

### Forsøk 5: PR #214 - Race Condition Fix
**Dato:** 2026-01-28
**Commit:** `d319a27`

**Hypotese:** Race condition mellom `spawnRoom()` og exploredTiles beregning.

**Rotårsak identifisert:**
```typescript
// FEIL: spawnRoom oppdaterer state asynkront
if (!targetTile) {
  spawnRoom(q, r, tileSet);  // setState kalles her
}

// FEIL: state.board er fortsatt gammel!
state.board.forEach(tile => {  // Nyspawnede tiles er IKKE her!
  if (distFromNew <= VISIBILITY_RANGE) {
    newExplored.add(`${tile.q},${tile.r}`);
  }
});
```

**Løsning:**
```typescript
setState(prev => {
  // FIX: Beregn explored tiles med prev.board som har nyspawnede tiles
  const newExplored = new Set(prev.exploredTiles || []);
  newExplored.add(`${q},${r}`);

  prev.board.forEach(tile => {  // RIKTIG: prev.board har nyspawnede tiles!
    if (distFromNew <= VISIBILITY_RANGE || distFromOld <= VISIBILITY_RANGE) {
      newExplored.add(`${tile.q},${tile.r}`);
    }
  });

  return { ...prev, exploredTiles: Array.from(newExplored) };
});
```

**Resultat:** ⚠️ Vesentlig forbedring - De fleste tilfeller løst, men noen edge cases gjenstod

---

### Forsøk 6: PR #217 - Comprehensive Fix (4 Problemer)
**Dato:** 2026-01-28
**Commit:** `77fd985`

**Deep audit avdekket FIRE separate problemer:**

#### Problem 1: Manglende exploredTiles ved Spillstart
**Lokasjon:** `ScenarioBriefingPopup.onBegin`

```typescript
// FEIL: exploredTiles ble aldri initialisert!
setState(prev => ({
  ...prev,
  phase: GamePhase.INVESTIGATOR,
  doom: startDoom,
  // exploredTiles ble IKKE satt her!
}));
```

**Fix:** La til `calculateInitialExploredTiles()` helper:
```typescript
const calculateInitialExploredTiles = (
  board: Tile[],
  playerPositions: { q: number; r: number }[],
  visibilityRange: number = 2
): string[] => {
  const explored = new Set<string>();
  playerPositions.forEach(playerPos => {
    board.forEach(tile => {
      const distance = hexDistance(playerPos, { q: tile.q, r: tile.r });
      if (distance <= visibilityRange) {
        explored.add(`${tile.q},${tile.r}`);
      }
    });
  });
  return Array.from(explored);
};
```

#### Problem 2: Cluster Tiles Aldri Lagt til ExploredTiles
**Lokasjon:** `spawnRoom` cluster spawn

```typescript
// FEIL: Cluster tiles ble lagt til board, men IKKE exploredTiles
setState(prev => {
  // ... legger til cluster tiles i board ...
  return { ...prev, board: syncClusterBoard };
  // exploredTiles ble IKKE oppdatert!
});
```

**Fix:**
```typescript
setState(prev => {
  // FIX: Mark all cluster tiles as explored
  const newExplored = new Set(prev.exploredTiles || []);
  for (const clusterTile of clusterTiles) {
    newExplored.add(`${clusterTile.q},${clusterTile.r}`);
  }
  return { ...prev, board: syncClusterBoard, exploredTiles: Array.from(newExplored) };
});
```

#### Problem 3 & 4: Stale State i Spells
**Lokasjon:** `true_sight` og `glimpse_beyond` spells

```typescript
// FEIL: Brukte state.exploredTiles i stedet for prev.exploredTiles
const newExplored = new Set(state.exploredTiles || []);  // STALE!
setState(prev => ({
  ...prev,
  exploredTiles: Array.from(newExplored),  // Potensielt mister tiles!
}));
```

**Fix:** Flytt beregning inn i setState:
```typescript
setState(prev => {
  const revealedTiles = prev.board.filter(...);
  const newExplored = new Set(prev.exploredTiles || []);
  // ... add tiles ...
  return { ...prev, exploredTiles: Array.from(newExplored) };
});
```

**Resultat:** ✅ Løste de fleste tilfeller

---

### Forsøk 7: PR #218 - LocalStorage Corruption Fix (FINAL)
**Dato:** 2026-01-28
**Commit:** `adb7832`

**Siste rotårsak:** Korrupt data fra localStorage!

Når state ble lastet fra localStorage, ble kritiske arrays IKKE validert:
```typescript
// GAMMEL KODE - Ingen validering
return { ...parsed, floatingTexts: [], ... };
```

Hvis `exploredTiles` var korrupt (undefined, null, eller feil type), forårsaket det:
- Black tiles (korrupt `exploredTiles`)
- "slice is not a function" feil
- Manglende event cards

**Fix 1: LocalStorage State Validering**
```typescript
// Ensure exploredTiles is always a valid array of strings
const exploredTiles = Array.isArray(parsed.exploredTiles)
  ? parsed.exploredTiles.filter((t: unknown) => typeof t === 'string')
  : ['0,0'];

// Sanitize board tiles
const board = Array.isArray(parsed.board) ? parsed.board.map((tile: Tile) => ({
  ...tile,
  items: Array.isArray(tile.items) ? tile.items : undefined,
  bloodstains: tile.bloodstains ? {
    ...tile.bloodstains,
    positions: Array.isArray(tile.bloodstains.positions) ? tile.bloodstains.positions : []
  } : undefined
})) : [START_TILE];
```

**Fix 2: Defensive Array Checks i GameBoard**
```typescript
// bloodstains positions
{tile.bloodstains && tile.bloodstains.count > 0 && Array.isArray(tile.bloodstains.positions) && ...}

// tile items
{isVisible && Array.isArray(tile.items) && tile.items.length > 0 && ...}
```

**Resultat:** ✅ KOMPLETT LØSNING

---

## Teknisk Forklaring

### Hvorfor Tiles Ble Svarte

GameBoard sin fog opacity logikk:
```typescript
if (!isVisible) {
  fogOpacity = isExplored ? 0.15 : 0.9;  // 0.9 = SVART!
}
```

En tile som var i `board` men IKKE i `exploredTiles` fikk `fogOpacity=0.9`, som effektivt gjorde den svart.

### Visibility Konstanter
```typescript
const VISIBILITY_RANGE = 2;  // Spilleren ser 2 hex i alle retninger
```

### ExploredTiles Data Flow
```
Spiller beveger → spawnRoom() → board oppdateres → exploredTiles må oppdateres
                                     ↓
                              Hvis exploredTiles IKKE oppdateres
                                     ↓
                              Tile er i board men ikke i exploredTiles
                                     ↓
                              fogOpacity = 0.9 → SVART TILE!
```

---

## Alle Rotårsaker (Oppsummert)

| # | Rotårsak | Lokasjon | PR |
|---|----------|----------|-----|
| 1 | Fog opacity for høy | GameBoard.tsx | #189 |
| 2 | Floor textures for mørke | index.css | #189 |
| 3 | Race condition: stale state.board | handleAction 'move' | #214 |
| 4 | exploredTiles ikke initialisert ved start | onBegin callback | #217 |
| 5 | Cluster tiles ikke lagt til exploredTiles | spawnRoom cluster | #217 |
| 6 | Stale state i true_sight spell | handleAction 'cast' | #217 |
| 7 | Stale state i glimpse_beyond spell | handleAction 'cast_occultist' | #217 |
| 8 | Korrupt localStorage data | useState initializer | #218 |

---

## Endrede Filer (Totalt)

| Fil | Endringer |
|-----|-----------|
| `src/game/components/GameBoard.tsx` | Fog opacity, Array.isArray guards |
| `src/game/ShadowsGame.tsx` | exploredTiles beregning, localStorage validering, calculateInitialExploredTiles() |
| `src/index.css` | Floor texture brightness |

---

## Lærdommer

1. **En "enkel" visuell bug kan ha multiple rotårsaker** - Det tok 7 forsøk å finne alle problemene.

2. **React state updates er asynkrone** - Bruk alltid `prev` i setState, ikke `state`.

3. **Valider ALLTID data fra localStorage** - Korrupt data kan forårsake subtile bugs.

4. **Defensive programming** - Bruk `Array.isArray()` før array-operasjoner.

5. **Deep audits er verdifulle** - Uten grundig gjennomgang av hele kodebasen ville vi ikke funnet alle 8 rotårsakene.

---

## Git Commits Relatert til Denne Buggen

```
692dfa3 Merge pull request #218 from Tombonator3000/claude/fix-black-tiles-bug-oaceo
adb7832 fix: Prevent black tiles and slice errors from corrupted localStorage
bf38f5e Merge pull request #217 from Tombonator3000/claude/fix-black-tiles-bug-i0rAj
77fd985 fix: Comprehensive fix for black tiles bug
e8855df Merge pull request #214 from Tombonator3000/claude/fix-player-tile-black-amFSb
d319a27 Fix: Tiles turning black when player leaves - race condition fix
93c8cc6 Merge pull request #190 from Tombonator3000/claude/fix-explored-tiles-logic-2wedQ
cca30c2 Fix hex tiles turning black when player moves away
9449e7e Merge pull request #189 from Tombonator3000/claude/fix-hex-tile-color-Cy9WX
f7bc05c Fix hex tiles turning black when player moves away
ddb9eca Merge pull request #187 from Tombonator3000/claude/fix-hex-tile-color-UA6Q8
cbfd657 Fix hex tile visibility - tiles no longer appear black when player moves
737359e Merge pull request #186 from Tombonator3000/claude/fix-hex-tile-color-IfLRa
b0fe1bc Fix hex tile visibility - tiles no longer appear black
```

---

*Dokumentasjon opprettet: 2026-01-29*
