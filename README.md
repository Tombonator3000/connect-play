# Mythos Quest

Et digitalt brettspill inspirert av Hero Quest og Mansions of Madness, satt i et Lovecraft-univers fra 1920-tallet.

**Spill nå:** https://tombonator3000.github.io/connect-play/

## Om spillet

Mythos Quest er et roguelite brettspill der spillere utforsker heksagonale kart, kjemper mot monstre fra Lovecrafts mythos, og prøver å fullføre oppdrag før tiden renner ut. Spillet kombinerer taktisk kamp med ressurshåndtering og sanity-mekanikker.

Spillet kan spilles solo eller med opptil 4 spillere i hot-seat modus.

## Hvordan spille

### Starte et spill

1. Velg antall spillere (1-4)
2. Velg karakterer for hver spiller
3. Velg et scenario eller generer et tilfeldig
4. Start spillet

### Spillets gang

Hver runde består av to faser:

**Spillerfase**
- Hver spiller har 3 handlingspoeng (AP) per runde
- Bruk AP på bevegelse, kamp, undersøkelse eller andre handlinger
- Trykk "End Turn" når du er ferdig

**Mythos-fase**
- Doom-telleren synker med 1
- Doom-hendelser kan utløses ved visse terskler
- Monstre beveger seg og angriper

### Handlinger

| Handling | AP-kostnad |
|----------|------------|
| Bevege seg | 1 |
| Angripe | 1 |
| Åpne dør | 1 |
| Undersøke | 1 |
| Bruke gjenstand | 1 |
| Hvile (+1 Sanity) | 2 |

### Seier og tap

**Seier:** Fullfør alle påkrevde mål mens minst én spiller overlever.

**Tap:** Alle spillere dør, eller Doom når 0.

## Kampsystemet

Spillet bruker et Hero Quest-inspirert terningsystem.

### Angrep
1. Kast antall terninger basert på våpenet ditt
2. Tell suksesser (4, 5 eller 6 på d6)
3. Fienden kaster forsvarsterninger
4. Skade = dine suksesser minus fiendens suksesser

### Eksempel
```
Spiller med Shotgun (4 terninger): [4][2][6][5] = 3 suksesser
Ghoul forsvar (2 terninger): [3][5] = 1 suksess
Skade = 3 - 1 = 2 HP
```

## Karakterer

| Klasse | HP | Sanity | Rolle |
|--------|-----|--------|-------|
| Veteran | 6 | 3 | Kriger, kan bruke alle våpen |
| Detective | 5 | 4 | Etterforsker, finner skjulte ting |
| Professor | 3 | 6 | Lærd, kan lese okkulte tekster trygt |
| Occultist | 3 | 5 | Magiker, bruker trolldom |
| Journalist | 4 | 4 | Speider, rask bevegelse |
| Doctor | 4 | 5 | Støtte, healer effektivt |

## Sanity

Karakterer har begrenset mental helse. Sanity tapes ved:
- Å se monstre for første gang
- Lese okkulte tekster
- Se medspillere dø

Når Sanity når 0, trekkes et galskap-kort som gir en permanent tilstand. Ved tre galskap-tilstander er karakteren tapt.

## Doom-systemet

Doom-telleren representerer tiden som gjenstår. Den synker med 1 hver runde. Ved visse terskler utløses hendelser som fiende-spawning eller andre komplikasjoner.

## Quest Editor

Spillet inkluderer en komplett editor for å lage egne scenarier.

### Grunnleggende bruk

1. Åpne Quest Editor fra hovedmenyen
2. Velg en tile fra paletten til venstre
3. Klikk på kartet for å plassere tiles
4. Konfigurer tiles via panelet til høyre

### Verktøy

- **Select (S):** Velg og rediger plasserte tiles
- **Place (P):** Plasser nye tiles
- **Erase (E):** Fjern tiles
- **Rotate (R):** Roter valgt tile-mal

### Faner i høyre panel

**Tile Properties**
Rediger egenskaper for valgt tile: startposisjon, kant-typer, dører og beskrivelser.

**Monsters**
Plasser fiender på tiles. Velg fra biblioteket eller lag egne monstre.

**Items**
Plasser gjenstander spillere kan finne.

**NPCs**
Plasser ikke-spillerkarakterer med dialog.

**Goals**
Definer oppdragsmål:
- find_item: Finn en spesifikk gjenstand
- kill_enemies: Drep et antall fiender
- kill_boss: Drep en boss
- escape: Flykt via utgangen
- survive: Overlev et antall runder
- explore: Utforsk spesifikke tiles

**Triggers**
Sett opp hendelser som utløses av spillerhandlinger.

**Doom**
Konfigurer hendelser som skjer ved Doom-terskler.

**Validate**
Sjekk scenarioet for feil og advarsler.

### Preview

Trykk Preview for å teste scenarioet. Du kan:
- Simulere spillerbevegelse
- Se hvordan tåke-mekanikken fungerer
- Teste at mål er oppnåelige

### Import/Export

Scenarier kan eksporteres som JSON-filer og deles med andre. Bruk Import-knappen for å laste inn andres scenarier.

### Kampanje-editor

Lag kampanjer med flere scenarier i sekvens:
- Definer rekkefølge på scenarier
- Sett opp forgreininger basert på spillerhandlinger
- Aktiver heltefortsettelse mellom scenarier

## Teknisk informasjon

### Teknologier
- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui

### Lokal utvikling

```bash
git clone https://github.com/Tombonator3000/connect-play.git
cd connect-play
npm install
npm run dev
```

### Build

```bash
npm run build
npm run preview
```

## Dokumentasjon

- `REGELBOK.MD` - Komplett regelverk
- `game_design_bible.md` - Spilldesign-dokumentasjon
- `agents.md` - Utviklingskontekst

## Lisens

Dette prosjektet er under utvikling.
