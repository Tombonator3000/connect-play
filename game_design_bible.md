# GAME DESIGN BIBLE
## Shadows of the 1920s
### *"Hero Quest meets Mansions of Madness"*

**Versjon 3.0**

> *"Det er ikke doden vi frykter, men det vi ser for vi dor."*

---

# INNHOLDSFORTEGNELSE

1. [DEL 1: TILE-SYSTEMET](#del-1-tile-systemet)
2. [DEL 2: HINDRINGER OG DORER](#del-2-hindringer-og-dorer)
3. [DEL 3: SKILL CHECK-SYSTEMET](#del-3-skill-check-systemet)
4. [DEL 4: GALSKAPSSYSTEMET](#del-4-galskapssystemet)
5. [DEL 5: PUZZLES OG GATER](#del-5-puzzles-og-gater)
6. [DEL 6: INVENTORY OG LOOT](#del-6-inventory-og-loot)
7. [DEL 7: TYPESCRIPT INTERFACES](#del-7-typescript-interfaces)

---

# DEL 1: TILE-SYSTEMET

## 1.1 Tile-kategorier og hierarki

Verden er delt inn i **zonenivaaer** som definerer hvor spilleren er og hvilke tiles som kan kobles sammen.

### Zone Levels

| Level | Zone | Tile Categories |
|-------|------|-----------------|
| **0** | EXTERIOR | NATURE, URBAN, STREET |
| **1** | GROUND FLOOR | FACADE, FOYER, CORRIDOR, ROOM |
| **2** | UPPER FLOORS | STAIRS, CORRIDOR, ROOM, ATTIC |
| **-1** | BASEMENT | CELLAR, TUNNEL, SEWER |
| **-2** | DEEP UNDERGROUND | CRYPT, CAVE, RITUAL_CHAMBER |

### Tile Categories

| Category | SubTypes | Funksjon |
|----------|----------|----------|
| **NATURE** | forest, marsh, coast, ruins, field, clearing | Utendors natur utenfor bebyggelse |
| **URBAN** | square, harbor, market, station, cemetery, campus | Apne urbane omrader |
| **STREET** | main, alley, back, foggy, rail, bridge | Forbindelses-tiles mellom lokasjoner |
| **FACADE** | mansion, church, asylum, warehouse, hotel, shop | Bygningsfasade med inngangsdor |
| **FOYER** | grand, lobby, reception, vestibule | Inngangsparti rett innenfor doren |
| **CORRIDOR** | hallway, servant, dark, collapsed | Gang mellom rom |
| **ROOM** | study, bedroom, kitchen, ritual, lab, gallery | Individuelle rom med funksjoner |
| **STAIRS** | grand, spiral, servant, ladder | Vertikale forbindelser |
| **BASEMENT** | cellar, storage, tunnel, sewer | Kjellernivaet |
| **CRYPT** | tomb, altar, portal, cavern | Dypeste niva - ritualer og monstre |

---

## 1.2 Edge-typer og forbindelser

Hver hex har 6 kanter (edges). Kanttypen bestemmer hva som skjer nar spilleren prover a krysse.

### Edge Types

| Edge Type | Passable | Beskrivelse |
|-----------|----------|-------------|
| **OPEN** | Ja | Fri passasje, ingen hindring |
| **WALL** | Nei | Solid vegg - kan aldri passeres |
| **DOOR** | Betinget | Standard dor - har egen state (open/closed/locked/etc) |
| **SECRET** | Skjult | Hemmelig passasje - ma oppdages for (Investigate DC 5) |
| **WINDOW** | Betinget | Kan se gjennom. Athletics DC 4 for a klatre gjennom |
| **STAIRS_UP** | Ja (+1 AP) | Trapp opp til neste zone level |
| **STAIRS_DOWN** | Ja (+1 AP) | Trapp ned til lavere zone level |
| **BLOCKED** | Nei* | Blokkert av hindring - kan kanskje fjernes |

### Forbindelsesmatrise

```
EXTERIOR (Level 0):
  NATURE <--[OPEN]--> STREET <--[OPEN]--> URBAN
                                    |
                               [OPEN/DOOR]
                                    |
                                    v
GROUND FLOOR (Level 1):        FACADE
                                    |
                                 [DOOR]    <-- KRITISK: Her er doren
                                    |
                                    v
                                 FOYER
                                    |
                            [OPEN/DOOR]
                                    |
                          +---------+---------+
                          |                   |
                          v                   v
                      CORRIDOR <--[DOOR]--> ROOM
                          |
                    [STAIRS_DOWN]
                          |
                          v
BASEMENT (Level -1):  CELLAR <--[OPEN/DOOR]--> TUNNEL
                          |
                    [STAIRS_DOWN]
                          |
                          v
DEEP (Level -2):      CRYPT <--[DOOR/SECRET]--> RITUAL
```

---

## 1.3 Visuelt tile-system

Hver tile har visuell identitet gjennom **gulvtype** og **vannmerke-ikon**.

### Gulvtyper (Floor Textures)

| FloorType | CSS Pattern | Brukes i |
|-----------|-------------|----------|
| **WOOD** | Planke-monster, varm brun | Manor, Library, Study, Bedroom |
| **COBBLESTONE** | Ujevn stein-monster, gra | Street, Alley, Square, Market |
| **TILE** | Rene fliser, hvit/gra | Hospital, Asylum, Morgue, Lab |
| **STONE** | Kald stein, mork | Crypt, Cellar, Church, Tunnel |
| **GRASS** | Gress-tekstur, gronn | Park, Cemetery, Forest edge |
| **DIRT** | Jord, mork brun | Forest, Path, Cave |
| **WATER** | Vann-animasjon, mork bla | Harbor, Sewer, Underground River |
| **RITUAL** | Okkulte symboler, lilla/rod | Ritual Chamber, Altar, Portal |

### Vannmerke-ikoner (Watermarks)

Hvert rom viser et stort, delvis gjennomsiktig ikon i bakgrunnen.

| Rom-type | Lucide Icon | Visuell beskrivelse |
|----------|-------------|---------------------|
| Library / Study | `BookOpen` | Apen bok - kunnskap og forskning |
| Bedroom | `Bed` | Seng - hvile og dromme |
| Kitchen | `Utensils` | Bestikk - mat og forsyninger |
| Laboratory | `FlaskConical` | Kolbe - vitenskap og eksperimenter |
| Ritual Chamber | `Pentagram` | Pentagram - okkult aktivitet |
| Church | `Church` | Kirke - hellig grunn |
| Forest | `TreePine` | Treer - villmark |
| Harbor | `Anchor` | Anker - sjo og havn |
| Crypt | `Skull` | Hodeskalle - dod og fare |
| Street | `Lamp` | Gatelykt - urban |
| Cemetery | `Cross` | Kors - gravplass |

---

## 1.4 Fog of War og rom-avsloering

### Tile States

| State | Visuelt | Interaksjon |
|-------|---------|-------------|
| **HIDDEN** | Ikke synlig i det hele tatt | Kan ikke interageres med |
| **ADJACENT** | "Ghost tile" - take/skisse, rod stiplet kant | Kan utforskes ved a ga dit |
| **REVEALED** | Synlig men dimmet (tidligere besokt) | Kan beveges til |
| **VISIBLE** | Fullt synlig med alle detaljer | Spiller er her eller i synsrekkevidde |

### Rom-generering (ikke enkelt-tile)

Nar spilleren gar inn i en bygning, genereres **hele rommet** (eller etasjen) pa en gang med et forhandsdefinert layout:

```typescript
// Eksempel: Liten herregard, forsteetasje
const MANOR_GROUND_FLOOR = {
  tiles: [
    { type: 'FOYER', position: {q:0, r:0}, edges: ['DOOR','WALL','DOOR','WALL','OPEN','WALL'] },
    { type: 'CORRIDOR', position: {q:0, r:-1}, edges: ['OPEN','DOOR','OPEN','WALL','STAIRS_UP','WALL'] },
    { type: 'ROOM_STUDY', position: {q:1, r:-1}, edges: ['WALL','WALL','WALL','DOOR','WALL','SECRET'] },
  ],
  connections: { exterior: 'FACADE_MANSION', basement: 'CELLAR_WINE' }
};
```

---

## 1.5 Komplett tile-katalog

### NATURE Tiles

#### Mork Skog
> *"Traerne star sa taett at selv dagslyset ikke trenger gjennom. Greiner knekker under fottene dine, men du ser ingen dyr. Stillheten er absolutt."*

- **Edges**: OPEN mot andre NATURE/STREET
- **Features**: Kan ha HIDDEN_PATH til hemmelig omrade
- **Modifiers**: -1 pa Investigate (morke)
- **Floor**: DIRT

#### Skogslysning
> *"En rund apning i skogen der manelyset slipper gjennom. I midten star en stein med inskripsjoner du ikke kjenner igjen."*

- **Edges**: OPEN mot alle retninger
- **Features**: Ritual Stone (Okkultist kan utfore riter)
- **Spawn**: 30% Kultist ved natt
- **Floor**: GRASS

#### Klippekyst
> *"Bolgene slar mot klippene langt under deg. I skumringen ser du noe i vannet - storre enn en hval, med altfor mange lemmer."*

- **Edges**: OPEN (land), BLOCKED (hav), kan ha STAIRS_DOWN til grotte
- **Features**: Horror check ved forste besok
- **Spawn**: 50% Deep One nar DOOM > 8
- **Floor**: STONE

#### Myromrade
> *"Grunnen suger pa stovlene dine. Lykter danser over overflaten - metan-gass, sier vitenskapen. Men de folger etter deg."*

- **Edges**: OPEN (langsom bevegelse: +1 AP)
- **Features**: Quicksand hazard (1d6: 1 = fanget)
- **Loot**: Kan finne druknet lik med items
- **Floor**: WATER/DIRT

#### Gammel Steinsirkel
> *"Monolitter star i en perfekt sirkel. De er dekket av symboler som skifter nar du ser bort. Luften vibrerer med en frekvens som far hodepine."*

- **Edges**: OPEN
- **Features**: Portal punkt (kan teleportere til annen steinsirkel)
- **Modifiers**: -1 Sanity ved forste besok
- **Floor**: RITUAL

---

### URBAN Tiles

#### Bytorget (Arkham Square)
> *"Hjertet av Arkham. Gasslyktene flakrer, og klokkespillet fra radhuset teller ned. Skygger beveger seg mellom eikene."*

- **Edges**: OPEN mot STREET (4+ retninger)
- **Features**: Oppslagstavle (gratis ledetrad), Fontene
- **Modifiers**: Trygt omrade - ingen fiende-spawn pa dag
- **Floor**: COBBLESTONE

#### Havna (Harbor District)
> *"Lukten av salt og rate. Fiskebatene ligger dorske ved bryggene. Ingen snakker med fremmede her - oynene deres er for store."*

- **Edges**: OPEN (land), WATER (hav)
- **Features**: Bat (kan reise til andre kyst-tiles)
- **Spawn**: 60% Deep One om natten, +1 skade her
- **Floor**: COBBLESTONE/WATER

#### Togstasjonen
> *"Den gamle stasjonen. Toget til Boston gar klokken 6. Men ingen vet nar det siste toget fra Innsmouth ankommer."*

- **Edges**: OPEN (mot by), RAIL (mot annen stasjon)
- **Features**: Rask reise til andre byer (scenario-avhengig)
- **Modifiers**: Trygt startpunkt for mange scenarier
- **Floor**: COBBLESTONE

#### Kirkegarden
> *"Gravstotter heller i umulige vinkler. En tynn take henger over bakken. Noen av navnene pa steinene er eldre enn Arkham."*

- **Edges**: OPEN (by), GATE_LOCKED (krypt-inngang)
- **Features**: Grav-tiles kan avdekkes (undersok)
- **Spawn**: 40% Ghoul om natten
- **Floor**: GRASS

#### Universitetsomradet (Miskatonic Campus)
> *"Miskatonic Universitets campus. Gotiske bygninger og epletraer. Studenter haster mellom forelesninger om ting de helst burde unngatt."*

- **Edges**: OPEN (by/gate), DOOR til Bibliotek, Museum, Laboratorier
- **Features**: Professoren: +1 pa alle kast her
- **Modifiers**: Trygt pa dag, 20% Kultist pa natt
- **Floor**: COBBLESTONE/GRASS

#### Industriomradet
> *"Fabrikkpiper rekker mot himmelen. Maskinene er stille na, men lyden av hamring hores fra undergrunnen."*

- **Edges**: OPEN (gate), DOOR til lagerbygninger
- **Features**: Kloakk-inngang (til BASEMENT)
- **Spawn**: 30% Kultist-gruppe
- **Floor**: COBBLESTONE

#### Markedsplassen
> *"Boder med varer fra nart og fjern. Noen selger fiskemat, andre selger ting som ikke burde vaere til salgs."*

- **Edges**: OPEN mot alle retninger
- **Features**: Handelsmenn (kjop/salg av items)
- **Modifiers**: Kun apen pa dag
- **Floor**: COBBLESTONE

---

### STREET Tiles

#### Hovedgaten
> *"Brosteinen glinser vatt under gasslyktene. Butikkvinduene er morke pa denne tiden, men du kjenner deg iakttatt."*

- **Edges**: OPEN (begge ender), DOOR_CLOSED (til butikker)
- **Features**: Standard forbindelses-tile
- **Floor**: COBBLESTONE

#### Morkt Smug
> *"Et trangt smug. Rotteøyne glinser i morket, og noen har skrevet symboler pa veggen med kritt - eller noe verre."*

- **Edges**: OPEN (2 ender), WALL (sider)
- **Features**: HIDDEN_DOOR mulig, Horror check ved forste besok
- **Spawn**: 25% Kultist
- **Floor**: COBBLESTONE

#### Takete Bakgate
> *"Taken sluker alt. Du ser bare noen fa meter foran. Fottrinn ekkoer - forhapentligvis dine egne."*

- **Edges**: OPEN, men redusert sikt
- **Modifiers**: -2 pa alle kast uten lyskilde
- **Features**: Fiender far overraskelsesangrep
- **Floor**: COBBLESTONE

#### Kloakkgitter
> *"Et jernrist i bakken. Under det horer du bevegelse. Og hviskinger."*

- **Edges**: OPEN (gate), STAIRS_DOWN (til kloakk/kjeller)
- **Features**: Snarvei til BASEMENT-level
- **Floor**: COBBLESTONE

---

### FACADE Tiles

#### Herregard-fasade
> *"Den forfalne fasaden vitner om fordums storhet. Vinduene stirrer ned som tomme oyehuler, og doren star pa glott."*

- **Edges**: OPEN (gate/by), DOOR_CLOSED (inn), WINDOW x2
- **Connects to**: FOYER_GRAND

#### Bibliotek-fasade
> *"Miskatonic-biblioteket. Gotiske buer skjuler en av verdens storste samlinger av forbudte tekster."*

- **Edges**: OPEN (campus), DOOR_OPEN (dagtid), DOOR_LOCKED (natt)
- **Connects to**: FOYER_LIBRARY

#### Kirke-fasade
> *"Spiret rekker mot himmelen. Innskriften over doren er slitt bort - med vilje, sier noen."*

- **Edges**: OPEN (kirkegard), DOOR_OPEN (hellig grunn)
- **Connects to**: FOYER_CHURCH

#### Asyl-fasade
> *"Arkham Asylum. Jernportene knirker. Bak vinduene hores mumling - bonner, advarsler, eller profetier."*

- **Edges**: GATE_LOCKED (hovedport), WINDOW_BARRED x3
- **Connects to**: FOYER_ASYLUM

#### Lagerbygning-fasade
> *"En falleferdig lagerbygning ved havna. Lenkene pa doren er nykuttede."*

- **Edges**: OPEN (havn), DOOR_LOCKED, RUBBLE (sideinngang)
- **Connects to**: ROOM_WAREHOUSE

---

### FOYER Tiles

#### Herregard-foyer
> *"En grand entre med forstøvet lysekrone. Trappen i midten deler seg i to. Portrettene pa veggen folger deg med blikket."*

- **Edges**: DOOR (fasade), STAIRS_UP, DOOR x2 (korridorer), DOOR_HIDDEN (mulig)
- **Floor**: WOOD

#### Bibliotek-foyer
> *"Marmorsoylere og en resepsjonsdisk. Bibliotekaren nikker kort - hun vet hvorfor du er her."*

- **Edges**: DOOR (fasade), OPEN (hovedsal), DOOR_LOCKED (arkiv)
- **Floor**: TILE

#### Hotell-lobby
> *"Resepsjonisten smiler for bredt. Plantefargen i tapetet er nesten den samme som pa gjestenes hud."*

- **Edges**: DOOR (fasade), STAIRS_UP, DOOR (spisesal)
- **Floor**: WOOD

---

### CORRIDOR Tiles

#### Stovete Korridor
> *"Stovet ligger tykt - ingen har gatt her pa ar. Men fotspor leder dypere inn. Ferske fotspor."*

- **Edges**: OPEN (begge ender), DOOR_CLOSED (sider)
- **Floor**: WOOD

#### Tjenergang
> *"En smal gang bak veggene for tjenere. Spindelvev henger som gardiner."*

- **Edges**: OPEN (ender), DOOR_HIDDEN (til hovedrom)
- **Floor**: WOOD

#### Morklagt Gang
> *"Ingen lyskilder. Du horer pusting som ikke er din egen."*

- **Edges**: OPEN, krever lyskilde
- **Spawn**: 50% skjult fiende
- **Floor**: STONE

#### Celle-korridor (Asyl)
> *"Metallgitter pa begge sider. Hendene som rekker ut er for bleke, fingrene for lange."*

- **Edges**: OPEN, DOOR_LOCKED (celler pa sidene)
- **Modifiers**: -1 Sanity ved forste besok
- **Floor**: TILE

---

### ROOM Tiles

#### Bibliotek (rom)
> *"Bokhyller mot taket. En bok ligger apen - sidene er blanke, men blekket er vatt."*

- **Edges**: DOOR (korridor), DOOR_HIDDEN (mulig)
- **Features**: +1 Investigate, Professoren: +2 Insight
- **Floor**: WOOD

#### Ritualkammer
> *"Symboler tegnet i blod. Luften er tung av roykelse og noe som aldri burde vaekkes."*

- **Edges**: DOOR_PUZZLE eller DOOR_SEALED
- **Features**: Ritual-sted, Horror check
- **Floor**: RITUAL

#### Laboratorium
> *"Glassbeholdere med ting som flyter. Instrumenter du ikke kan navngi. Noen har arbeidet her nylig."*

- **Edges**: DOOR_LOCKED
- **Features**: Medisinsk utstyr, Legen: kan lage motgift
- **Floor**: TILE

#### Sovevarelse
> *"Sengen er urort. Speilet viser deg - men refleksjonen beveger seg ikke i takt."*

- **Features**: Hvile: +2 Sanity i stedet for +1
- **Floor**: WOOD

#### Kjokken
> *"Kniver henger pa rad. Noe koker pa ovnen - ingrediensene beveger seg fremdeles."*

- **Features**: Improviserte vapen, Mat (+1 Vitality)
- **Floor**: TILE

#### Galleri
> *"Malerier stirrer ned. Oynene folger deg. Ett av dem var ikke der for."*

- **Features**: Horror check, kan ha DOOR_HIDDEN bak maleri
- **Floor**: WOOD

---

### BASEMENT Tiles

#### Vinkjeller
> *"Stovete flasker fra arstall som ikke stemmer. Bak en hylle stirrer oyne - bare flasker?"*

- **Edges**: STAIRS_UP, DOOR_HIDDEN (mulig)
- **Features**: Wine (restore Sanity), skjulte rom
- **Floor**: STONE

#### Kuldelager
> *"Iskald. Kjott henger fra kroker - noe er for stort til a vaere fra vanlige dyr."*

- **Edges**: DOOR_LOCKED
- **Features**: Horror check, kan finne bevis
- **Floor**: STONE

#### Kloakktunnel
> *"Fuktige vegger. Vannet rekker til anklene. Noe beveger seg i morket foran."*

- **Edges**: OPEN (tunnel), STAIRS_UP (til gate)
- **Modifiers**: +1 AP bevegelse, -1 Sanity ved forste besok
- **Floor**: WATER

---

### CRYPT Tiles

#### Gravkammer
> *"Steinvegger med nisjer for de dode. Noen lokk er forskjovet innenfra."*

- **Edges**: DOOR, DOOR_SEALED (indre kammer)
- **Spawn**: 60% Ghoul
- **Floor**: STONE

#### Offersted
> *"Et alter flekkete av ar med ritualer. Luften vibrerer med feil frekvens."*

- **Edges**: DOOR_SEALED
- **Features**: Ritual location, -2 Sanity ved forste besok
- **Floor**: RITUAL

#### Eldgammel Portal
> *"En steinbue dekket av symboler. Gjennom den ser du stjerner som ikke finnes pa var himmel."*

- **Edges**: PORTAL (til annen dimensjon/lokasjon)
- **Features**: Scenario-malsetting, massive Sanity-tap
- **Floor**: RITUAL

---

# DEL 2: HINDRINGER OG DORER

## 2.1 Dor-typer og states

### Door States

| State | Visuelt | Handling for a passere |
|-------|---------|------------------------|
| **OPEN** | Apen dor-ramme | Fri passasje (0 AP ekstra) |
| **CLOSED** | Lukket dor | 1 AP for a apne, deretter fri |
| **LOCKED** | Dor med las-ikon | Krever nokkel ELLER Lockpick skill check |
| **BARRICADED** | Dor med planker | Strength skill check (DC 4) for a bryte |
| **BROKEN** | Knust dor | Permanent apen, gir ingen dekning |
| **SEALED** | Glodende symboler | Occult skill check (DC 5) ELLER Elder Sign item |
| **PUZZLE** | Dor med symbol | Ma lose tilhorende puzzle |

### Door Types

| Dor-type | Krav | Handling |
|----------|------|----------|
| **Vanlig dor** | Ingen | 1 handling for a apne. Forblir apen. |
| **Last dor** | Nokkel ELLER Lockpick | Med nokkel: 1 handling. Lockpick: Agility DC 4 |
| **Barrikadert dor** | Styrke ELLER Verktoy | 2 handlinger for a bryte ned. Lager stoy. |
| **Puzzle-dor** | Los puzzle | Trigger puzzle-event. Ved suksess: apnes permanent. |
| **Hemmelig dor** | Oppdage forst | Investigate DC 4 for a finne. Deretter som vanlig. |
| **Forseglet dor** | Ritual ELLER Relikvie | Kun Okkultist kan apne, eller bruk Elder Sign. |

---

## 2.2 Las-typer og nokler

| Las-type | Lockpick DC | Nokkel | Noter |
|----------|-------------|--------|-------|
| **SIMPLE** | 3 | Common Key | Standard huslas |
| **QUALITY** | 4 | Specific Key | Kontorlas, safe |
| **COMPLEX** | 5 | Unique Key | Bank-safe, hvelv |
| **OCCULT** | 5* | Elder Sign | *Krever Occult skill, ikke Lockpick |

---

## 2.3 Fysiske hindringer

| Hindring | Blokkerer? | Fjerne | Effekt |
|----------|------------|--------|--------|
| **RUBBLE_LIGHT** | Nei | 1 AP | +1 AP for a krysse |
| **RUBBLE_HEAVY** | Ja | Str DC 4, 2 AP | Blokkerer helt til ryddet |
| **COLLAPSED** | Ja | Umulig | Permanent blokkert |
| **FIRE** | Nei* | Extinguisher | *1 Vitality skade ved passering |
| **WATER_SHALLOW** | Nei | -- | +1 AP, kan skjule items |
| **WATER_DEEP** | Nei* | -- | *Athletics DC 4 for a svomme |
| **UNSTABLE_FLOOR** | Nei* | -- | *1d6: 1-2 = fall (2 Vitality) |
| **GAS_POISON** | Nei | Gas Mask | -1 Vitality per runde i omradet |

---

## 2.4 Overnaturlige hindringer

| Hindring | Fjerne | Effekt / Visuelt |
|----------|--------|------------------|
| **DARKNESS** | Lyskilde + Occult DC 4 | Unaturlig morke. Lommelykt hjelper ikke alene. -2 alle kast. |
| **WARD_CIRCLE** | Occult DC 5 | Glodende sirkel pa gulvet. Horror check (-1 Sanity) for a krysse. |
| **SPIRIT_BARRIER** | Banish ritual | Transparente skikkelser blokkerer. Sanity -1 per forsok. |
| **SPATIAL_WARP** | Solve puzzle | Rommet folder seg. Dorer leder til feil sted. VFX: wavy distortion. |
| **TIME_LOOP** | Break sequence | Tilen resetter nar du gar ut. Ma gjore noe annerledes. |

---

# DEL 3: SKILL CHECK-SYSTEMET

## 3.1 Attributter og terskler

### Karakter-attributter

| Attributt | Range | Brukes til |
|-----------|-------|------------|
| **STRENGTH** | 2-5 | Bryte dorer, flytte rubble, melee-kamp |
| **AGILITY** | 2-5 | Unnga feller, flykte, klatre, lockpick |
| **INTELLECT** | 2-5 | Undersoke, lese tekster, lose puzzles |
| **WILLPOWER** | 2-5 | Motsta horror, okkulte handlinger, gjenvinne sanity |

### Skill Check Mekanikk

> **Kast 2d6 + attributt bonus-terninger. For hvert resultat >= DC, far du 1 suksess.**

**Eksempel**: Strength 4, DC 4
- Kast 2 + 4 = 6 terninger
- Tell hvor mange viser 4, 5, eller 6
- Trenger minst 1 suksess for a lykkes

### Difficulty Classes (DC)

| DC | Vanskelighet | Eksempler |
|----|--------------|-----------|
| **3** | Easy | Simple lock, light rubble, basic clue |
| **4** | Medium | Quality lock, barricaded door, hidden passage |
| **5** | Hard | Complex lock, occult seal, deep secret |
| **6** | Extreme | Ancient wards, eldritch puzzles |

---

## 3.2 Kontekstuelle handlinger

Nar spilleren klikker pa en hindring ved siden av seg, vises **spesifikke handlinger** i stedet for generiske knapper.

### Eksempel: Last dor

```
// Spiller klikker pa LOCKED DOOR ved siden av seg
// Action Bar oppdateres til:

[Use Key]          - Hvis spiller har riktig nokkel
[Lockpick (Agi 4)] - Agility check, DC 4
[Force (Str 5)]    - Strength check, DC 5, bryter doren
[Cancel]           - Ga tilbake
```

### Eksempel: Rubble

```
[Clear (Str 4)]    - 2 AP, fjerner rubble
[Search]           - 1 AP, Investigate for skjulte items
[Cancel]
```

### Eksempel: Occult Seal

```
[Use Elder Sign]      - Hvis spiller har item
[Break Seal (Wil 5)]  - Willpower check, -1 Sanity uansett
[Read Glyphs (Int 4)] - Intellect, gir hint
[Cancel]
```

---

## 3.3 Karakter-spesialisering

| Karakter | STR | AGI | INT | WIL | Spesialitet |
|----------|-----|-----|-----|-----|-------------|
| **Detective** | 3 | 3 | **4** | 3 | Investigate +1 die |
| **Professor** | 2 | 2 | **5** | **4** | Read occult, no Sanity loss |
| **Veteran** | **5** | 3 | 2 | 3 | Combat +1 die, Str checks |
| **Occultist** | 2 | 3 | 3 | **5** | Can perform rituals |
| **Journalist** | 2 | **4** | 4 | 3 | +1 Move, escape bonus |
| **Doctor** | 2 | 3 | **4** | **4** | Heal 2 instead of 1 |

---

# DEL 4: GALSKAPSSYSTEMET

> *"Galskap er ikke slutten. Det er en ny begynnelse - en portal til sannheter som de friske aldri vil forstaa."*

## 4.1 Sanity-mekanikk

### Sanity-tap triggers

| Trigger | Sanity-tap | Kan motstaes? |
|---------|------------|---------------|
| Se fiende forste gang | -1 | Willpower DC 4 = ingen tap |
| Lese okkult tekst | -1 | Professor: Immun |
| Se medspiller do | -2 | Nei |
| Utfore ritual | -1 til -3 | Occultist: Halvert |
| Ga gjennom Spirit Barrier | -1 | Per forsok |
| Se portal/annen dimensjon | -2 | Willpower DC 5 |
| Doom nar 0 | -ALL | Game over scenario |

### Nar Sanity nar 0

1. **Trekk et MADNESS CARD**
2. **Sanity settes til 2** (ikke 0)
3. **Madness Condition aktiveres PERMANENT**
4. **Ved 3 Madness Conditions = karakter er tapt**

---

## 4.2 Madness Conditions

| Condition | Mekanisk effekt | Visuell VFX |
|-----------|-----------------|-------------|
| **HALLUCINATIONS** | 25% sjanse for a se falske fiender. Ma bruke handling for a "angripe" dem. | Wavy distortion, false enemy sprites flicker |
| **PARANOIA** | Kan ikke sta pa samme tile som andre spillere. -1 pa alle kast nar andre er naerme. | Red color shift, heartbeat sound |
| **HYSTERIA** | Ved starten av hver runde: 50% sjanse for a miste 1 AP til ukontrollert handling. | Screen shake, random UI jitter |
| **CATATONIA** | Start med 1 mindre AP. Kan ikke bruke Flee-handling. | Desaturated colors, slow motion feel |
| **OBSESSION** | Kan ikke forlate et rom for du har undersokt ALT. Ma bruke Investigate pa hvert element. | Glowing outlines on interactables |
| **AMNESIA** | Fog of war resetter for deg hver runde. Du kan ikke se tidligere utforskede tiles. | Heavy fog overlay, blurred revealed tiles |
| **NIGHT TERRORS** | Kan ikke bruke Rest-handling. Ved Sleep-event: Sanity -1. | Dark vignette, occasional flashes |
| **DARK INSIGHT** | +2 Insight permanent. Men Doom trekker 1 ekstra per runde nar du har dette. | Purple glow on character, eldritch symbols |

---

## 4.3 Visuelle effekter (CSS)

```css
/* HALLUCINATIONS */
.madness-hallucinations {
  animation: hallucinate 4s ease-in-out infinite;
}
@keyframes hallucinate {
  0%, 100% { filter: hue-rotate(0deg); }
  50% { filter: hue-rotate(30deg) blur(1px); }
}

/* PARANOIA */
.madness-paranoia {
  animation: paranoia 2s ease-in-out infinite;
}
@keyframes paranoia {
  0%, 100% { filter: saturate(1) sepia(0); }
  50% { filter: saturate(1.5) sepia(0.3); }
}

/* HYSTERIA */
.madness-hysteria {
  animation: hysteria 0.5s ease-in-out infinite;
}
@keyframes hysteria {
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(-2px, 1px); }
  75% { transform: translate(2px, -1px); }
}

/* CATATONIA */
.madness-catatonia {
  filter: saturate(0.3) brightness(0.8);
  transition: all 0.5s ease;
}

/* AMNESIA */
.madness-amnesia .revealed-tile {
  filter: blur(3px);
  opacity: 0.4;
}

/* NIGHT TERRORS */
.madness-night-terrors {
  box-shadow: inset 0 0 100px rgba(0,0,0,0.8);
}

/* DARK INSIGHT */
.madness-dark-insight {
  animation: darkInsight 3s ease-in-out infinite;
}
@keyframes darkInsight {
  0%, 100% { box-shadow: 0 0 20px rgba(128, 0, 255, 0.3); }
  50% { box-shadow: 0 0 40px rgba(128, 0, 255, 0.6); }
}
```

---

## 4.4 Lyd-effekter (Tone.js)

| Condition | Audio Effect |
|-----------|--------------|
| **HALLUCINATIONS** | Whispers, distant voices, random stingers |
| **PARANOIA** | Heartbeat, breathing, footsteps behind |
| **HYSTERIA** | Erratic tempo, sharp stings, nervous laughter |
| **CATATONIA** | Muffled sounds, slow reverb |
| **NIGHT TERRORS** | Low droning, sudden loud sounds |
| **DARK INSIGHT** | Eldritch hum, reversed whispers, cosmic static |

---

# DEL 5: PUZZLES OG GATER

## 5.1 Puzzle-typer

| Puzzle | Mekanikk |
|--------|----------|
| **SYMBOL_MATCH** | Finn 3 symboler i andre rom, kombiner i riktig rekkefolge. |
| **CODE_LOCK** | Finn tallkode i dokumenter andre steder. |
| **PRESSURE_PLATE** | En spiller ma sta pa platen mens en annen gar gjennom. |
| **MIRROR_LIGHT** | Roter speil for a reflektere lys til en bestemt posisjon. |
| **BLOOD_RITUAL** | Ofre 1 Vitality for a apne. Okkultist: Kan bruke Sanity i stedet. |
| **ASTRONOMY** | Still inn stjernekart til riktig posisjon. Professor: automatisk suksess. |

## 5.2 Hint-system

- Hints finnes i andre tiles (dokumenter, inskripsjoner, boker)
- Investigate DC 3-4 for a finne hint
- Professor far +1 die pa puzzle-relaterte Investigate

## 5.3 Beloninger

| Resultat | Belonning |
|----------|-----------|
| Los puzzle | Apen dor + ofte Clue/Item |
| Feil (1-2 feil) | Alarm (fiende spawn) eller Trap (1 damage) |
| Feil (3+ feil) | Permanent locked - ma finne alternativ |

---

# DEL 6: INVENTORY OG LOOT

## 6.1 Inventory-slots

| Slot Type | Antall | Innhold |
|-----------|--------|---------|
| **HAND** | 2 | Vapen, verktoy, lyskilde |
| **BODY** | 1 | Rustning, kappe, vest |
| **BAG** | 4 | Alt annet (keys, items, clues) |

**Total kapasitet**: 7 items. Ma droppe for a plukke opp nytt.

## 6.2 Item-kategorier

### Vapen (HAND)
- **Pistol**: 2 damage, 6 shots
- **Shotgun**: 3 damage, 2 shots, +1 vs adjacent
- **Knife**: 1 damage, unlimited, silent
- **Torch**: 1 damage, lyskilde, kan tennes pa fyr

### Verktoy (HAND)
- **Flashlight**: Lyskilde, fjerner DARKNESS penalty
- **Lockpick Set**: +1 die pa lockpick
- **Crowbar**: +1 die pa Strength (dorer/rubble)
- **First Aid Kit**: Heal 2 Vitality, 3 uses

### Beskyttelse (BODY)
- **Leather Jacket**: -1 damage fra fysiske angrep
- **Occult Robe**: +1 Willpower vs horror
- **Gas Mask**: Immun mot GAS_POISON

### Okkulte Items (BAG)
- **Elder Sign**: Apner SEALED dorer, banish spirits
- **Necronomicon Page**: +2 Insight, -1 Sanity ved lesing
- **Ritual Candles**: Kreves for ritualer

### Nokler (BAG)
- **Common Key**: Apner SIMPLE locks
- **Specific Key**: Apner navngitt dor
- **Master Key**: Apner alle SIMPLE og QUALITY locks

## 6.3 Loot-tabeller

### Search Room (Investigate DC 3)

| d6 | Resultat |
|----|----------|
| 1 | Nothing |
| 2-3 | Common item (matches, bandage) |
| 4-5 | Useful item (flashlight, key) |
| 6 | Rare item (weapon, occult) |

### Loot Defeated Enemy

| Enemy Type | Loot |
|------------|------|
| Cultist | Ritual item, key, clue |
| Deep One | Strange artifact, gold |
| Ghoul | Nothing (gross) |
| Shoggoth | Nothing (you're lucky to be alive) |

---

# DEL 7: TYPESCRIPT INTERFACES

## Core Types

```typescript
// Enums
enum TileCategory {
  NATURE = 'NATURE',
  URBAN = 'URBAN',
  STREET = 'STREET',
  FACADE = 'FACADE',
  FOYER = 'FOYER',
  CORRIDOR = 'CORRIDOR',
  ROOM = 'ROOM',
  STAIRS = 'STAIRS',
  BASEMENT = 'BASEMENT',
  CRYPT = 'CRYPT'
}

enum EdgeType {
  OPEN = 'OPEN',
  WALL = 'WALL',
  DOOR = 'DOOR',
  SECRET = 'SECRET',
  WINDOW = 'WINDOW',
  STAIRS_UP = 'STAIRS_UP',
  STAIRS_DOWN = 'STAIRS_DOWN',
  BLOCKED = 'BLOCKED'
}

enum DoorState {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  LOCKED = 'LOCKED',
  BARRICADED = 'BARRICADED',
  BROKEN = 'BROKEN',
  SEALED = 'SEALED',
  PUZZLE = 'PUZZLE'
}

enum FloorType {
  WOOD = 'WOOD',
  COBBLESTONE = 'COBBLESTONE',
  TILE = 'TILE',
  STONE = 'STONE',
  GRASS = 'GRASS',
  DIRT = 'DIRT',
  WATER = 'WATER',
  RITUAL = 'RITUAL'
}

enum MadnessType {
  HALLUCINATIONS = 'HALLUCINATIONS',
  PARANOIA = 'PARANOIA',
  HYSTERIA = 'HYSTERIA',
  CATATONIA = 'CATATONIA',
  OBSESSION = 'OBSESSION',
  AMNESIA = 'AMNESIA',
  NIGHT_TERRORS = 'NIGHT_TERRORS',
  DARK_INSIGHT = 'DARK_INSIGHT'
}
```

## Tile Interface

```typescript
interface HexCoord {
  q: number;
  r: number;
}

interface TileEdge {
  type: EdgeType;
  doorState?: DoorState;
  lockType?: 'SIMPLE' | 'QUALITY' | 'COMPLEX' | 'OCCULT';
  keyId?: string;
  isDiscovered: boolean;
  connectedTileId?: string;
}

interface Obstacle {
  type: string;
  canRemove: boolean;
  removeRequirement?: SkillCheck;
  effect?: TileEffect;
}

interface HexTile {
  id: string;
  category: TileCategory;
  subType: string;
  name: string;
  description: string;
  position: HexCoord;
  zoneLevel: number;
  explored: boolean;
  visibility: 'HIDDEN' | 'ADJACENT' | 'REVEALED' | 'VISIBLE';
  edges: TileEdge[];  // Always 6, indexed by HexDirection
  floor: FloorType;
  watermark?: string;  // Lucide icon name
  obstacles: Obstacle[];
  items: Item[];
  enemies: Enemy[];
  features: TileFeature[];
  modifiers: TileModifier[];
}
```

## Character Interface

```typescript
interface Attributes {
  strength: number;
  agility: number;
  intellect: number;
  willpower: number;
}

interface Player {
  id: string;
  name: string;
  characterClass: string;
  position: HexCoord;
  attributes: Attributes;
  vitality: number;
  maxVitality: number;
  sanity: number;
  maxSanity: number;
  actionPoints: number;
  maxActionPoints: number;
  inventory: InventorySlots;
  madnessConditions: MadnessType[];
  specialAbility: SpecialAbility;
  isAlive: boolean;
}

interface InventorySlots {
  leftHand: Item | null;
  rightHand: Item | null;
  body: Item | null;
  bag: (Item | null)[];  // 4 slots
}
```

## Game State Interface

```typescript
interface GameState {
  phase: 'SETUP' | 'INVESTIGATOR' | 'MYTHOS' | 'COMBAT' | 'EVENT' | 'GAME_OVER';
  round: number;
  doom: number;
  maxDoom: number;
  players: Player[];
  currentPlayerIndex: number;
  tiles: Map<string, HexTile>;
  enemies: Enemy[];
  eventDeck: EventCard[];
  lootDeck: Item[];
  madnessDeck: MadnessCard[];
  journal: JournalEntry[];
  scenario: Scenario;
  activeEffects: GlobalEffect[];
}
```

## Skill Check Interface

```typescript
interface SkillCheck {
  attribute: keyof Attributes;
  dc: number;
  bonusDice?: number;
  description: string;
}

interface SkillCheckResult {
  success: boolean;
  successes: number;
  rolls: number[];
  criticalSuccess: boolean;  // All dice succeeded
  criticalFailure: boolean;  // All dice failed
}

function performSkillCheck(
  player: Player,
  check: SkillCheck
): SkillCheckResult {
  const baseDice = 2;
  const attributeValue = player.attributes[check.attribute];
  const totalDice = baseDice + attributeValue + (check.bonusDice || 0);
  
  const rolls: number[] = [];
  let successes = 0;
  
  for (let i = 0; i < totalDice; i++) {
    const roll = Math.floor(Math.random() * 6) + 1;
    rolls.push(roll);
    if (roll >= check.dc) {
      successes++;
    }
  }
  
  return {
    success: successes >= 1,
    successes,
    rolls,
    criticalSuccess: successes === totalDice,
    criticalFailure: successes === 0
  };
}
```

---

# APPENDIX: QUICK REFERENCE

## Tile Connection Rules

```
NATURE  --> STREET (OPEN)
STREET  --> URBAN (OPEN)
URBAN   --> FACADE (OPEN/DOOR)
FACADE  --> FOYER (DOOR)      <-- Entry point
FOYER   --> CORRIDOR (OPEN/DOOR)
CORRIDOR --> ROOM (DOOR)
CORRIDOR --> STAIRS (OPEN)
STAIRS  --> Different Level (STAIRS_UP/DOWN)
BASEMENT --> CRYPT (DOOR/SECRET)
```

## Action Point Costs

| Action | AP Cost |
|--------|---------|
| Move (normal) | 1 |
| Move (difficult terrain) | 2 |
| Open door | 1 |
| Investigate | 1 |
| Attack | 1 |
| Use item | 1 |
| Lockpick | 1 |
| Clear rubble | 2 |
| Rest (+1 Sanity) | 2 |
| Use stairs | 2 |

## Horror Check Quick Reference

| Threat Level | Sanity Loss | Willpower DC |
|--------------|-------------|--------------|
| Minor (cultist) | -1 | 3 |
| Moderate (ghoul) | -1 | 4 |
| Major (deep one) | -2 | 4 |
| Extreme (shoggoth) | -3 | 5 |
| Cosmic (portal) | -2 to -4 | 5 |

---

*"Ph'nglui mglw'nafh Cthulhu R'lyeh wgah'nagl fhtagn."*

**--- END OF GAME DESIGN BIBLE ---**
