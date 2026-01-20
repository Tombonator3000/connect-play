# Development Log

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
