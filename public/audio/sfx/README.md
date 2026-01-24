# Sound Effects Library - Mythos Quest

Dette er den komplette SFX-strukturen for Mythos Quest.

## Mappestruktur

```
public/audio/sfx/
├── ui/              # Brukergrensesnitt (12 filer)
├── combat/          # Kamp og våpen (22 filer)
├── movement/        # Bevegelse og fottrinn (11 filer)
├── doors/           # Dører og låser (12 filer)
├── monsters/        # Monster-lyder (24 filer)
├── atmosphere/      # Atmosfære og horror (12 filer)
├── magic/           # Magi og ritualer (15 filer)
├── items/           # Gjenstander (17 filer)
├── events/          # Spillhendelser (13 filer)
└── ambient/         # Omgivelseslyder (15 filer)
```

## Totalt: 153 SFX-filer trengs

## Filformat
- Foretrukket: `.ogg` (mindre filstørrelse, god kvalitet)
- Alternativ: `.mp3`
- Maks størrelse: 500KB per fil

## Anbefalte kilder (CC0/Royalty-Free)

1. **OpenGameArt.org** - CC0 lisensiert spillaudio
   - https://opengameart.org/content/100-cc0-sfx
   - https://opengameart.org/content/80-cc0-rpg-sfx

2. **Freesound.org** - CC0-taggede lyder
   - Filter by "0" license for public domain

3. **Sonniss GDC Audio Bundles** - Gratis profesjonelle lydpakker

---

## Detaljert filliste per mappe

### UI (`ui/`)

| Fil | Beskrivelse |
|-----|-------------|
| `click.ogg` | Knapp/meny-klikk |
| `hover.ogg` | Mouse-over på knapper |
| `confirm.ogg` | Bekreftelse/valg |
| `cancel.ogg` | Avbryt/tilbake |
| `success.ogg` | Positiv tilbakemelding |
| `error.ogg` | Negativ tilbakemelding |
| `menu-open.ogg` | Åpne meny/popup |
| `menu-close.ogg` | Lukke meny/popup |
| `notification.ogg` | Varsel/info |
| `phase-change.ogg` | Faseovergang |
| `turn-start.ogg` | Tur begynner |
| `turn-end.ogg` | Tur slutter |

### Combat (`combat/`)

**Våpen:**
| Fil | Beskrivelse |
|-----|-------------|
| `unarmed-swing.ogg` | Slag uten våpen |
| `knife-slash.ogg` | Knivhugg |
| `club-swing.ogg` | Kølle/rør-slag |
| `machete-swing.ogg` | Machete-hugg |
| `derringer-shot.ogg` | Liten pistol |
| `revolver-shot.ogg` | Revolver-skudd |
| `shotgun-blast.ogg` | Hagle-smell |
| `rifle-shot.ogg` | Rifle-skudd |
| `tommy-gun-burst.ogg` | Automatild |

**Kamp:**
| Fil | Beskrivelse |
|-----|-------------|
| `hit-flesh.ogg` | Treff på mål |
| `hit-blocked.ogg` | Blokkert treff |
| `miss.ogg` | Bom |
| `critical-hit.ogg` | Kritisk treff |
| `critical-miss.ogg` | Kritisk bom |
| `reload.ogg` | Lading av våpen |
| `empty-click.ogg` | Tom magazin |
| `player-hurt.ogg` | Spiller tar skade |
| `player-death.ogg` | Spiller dør |

**Terninger:**
| Fil | Beskrivelse |
|-----|-------------|
| `dice-roll.ogg` | Terninger kastes |
| `dice-land.ogg` | Terninger lander |
| `dice-skull.ogg` | Skull-resultat (suksess) |
| `dice-blank.ogg` | Blank resultat (feil) |

### Movement (`movement/`)

**Fottrinn per gulvtype:**
| Fil | FloorType |
|-----|-----------|
| `step-wood.ogg` | WOOD |
| `step-cobblestone.ogg` | COBBLESTONE |
| `step-tile.ogg` | TILE |
| `step-stone.ogg` | STONE |
| `step-grass.ogg` | GRASS |
| `step-dirt.ogg` | DIRT |
| `step-water.ogg` | WATER |
| `step-ritual.ogg` | RITUAL |

**Trapper:**
| Fil | Beskrivelse |
|-----|-------------|
| `stairs-up.ogg` | Gå opp trapp |
| `stairs-down.ogg` | Gå ned trapp |
| `ladder-climb.ogg` | Klatre på stige |

### Doors (`doors/`)

| Fil | Beskrivelse |
|-----|-------------|
| `door-open.ogg` | Åpne vanlig dør |
| `door-close.ogg` | Lukke dør |
| `door-locked.ogg` | Prøve låst dør |
| `door-unlock-key.ogg` | Låse opp med nøkkel |
| `door-unlock-pick.ogg` | Dirke opp lås |
| `door-break.ogg` | Bryte ned dør |
| `door-creak.ogg` | Knirkende dør |
| `door-secret.ogg` | Finne hemmelig dør |
| `door-sealed.ogg` | Forseglet dør |
| `door-puzzle.ogg` | Puzzle-dør aktivert |
| `window-open.ogg` | Åpne vindu |
| `window-break.ogg` | Knuse vindu |

### Monsters (`monsters/`)

**Minions:**
| Fil | Monster |
|-----|---------|
| `cultist-spawn.ogg` | Kultist |
| `cultist-attack.ogg` | Kultist angrep |
| `cultist-death.ogg` | Kultist dør |
| `mi-go-spawn.ogg` | Mi-Go |
| `mi-go-buzz.ogg` | Mi-Go vinger |
| `nightgaunt-spawn.ogg` | Nightgaunt |

**Warriors:**
| Fil | Monster |
|-----|---------|
| `ghoul-spawn.ogg` | Ghoul |
| `ghoul-growl.ogg` | Ghoul knurring |
| `ghoul-attack.ogg` | Ghoul angrep |
| `ghoul-death.ogg` | Ghoul dør |
| `deep-one-spawn.ogg` | Deep One |
| `deep-one-gurgle.ogg` | Deep One lyder |
| `deep-one-attack.ogg` | Deep One angrep |
| `deep-one-death.ogg` | Deep One dør |
| `hound-howl.ogg` | Hound of Tindalos |
| `formless-spawn.ogg` | Formless Spawn |

**Elites:**
| Fil | Monster |
|-----|---------|
| `dark-priest-chant.ogg` | Dark Priest |
| `hunting-horror-screech.ogg` | Hunting Horror |
| `dark-young-roar.ogg` | Dark Young |

**Bosses:**
| Fil | Monster |
|-----|---------|
| `shoggoth-mass.ogg` | Shoggoth |
| `shoggoth-attack.ogg` | Shoggoth angrep |
| `star-spawn-awaken.ogg` | Star Spawn |
| `ancient-one-presence.ogg` | Ancient One |

### Atmosphere (`atmosphere/`)

| Fil | Beskrivelse |
|-----|-------------|
| `sanity-loss.ogg` | Sanity-tap |
| `sanity-critical.ogg` | Sanity når 0 |
| `horror-sting.ogg` | Horror-sjekk moment |
| `horror-fail.ogg` | Feilet horror-sjekk |
| `horror-pass.ogg` | Bestått horror-sjekk |
| `whispers.ogg` | Hviskende stemmer (HALLUCINATIONS) |
| `heartbeat.ogg` | Bankende hjerte (PARANOIA) |
| `hysteria-laugh.ogg` | Hysterisk latter (HYSTERIA) |
| `static-cosmic.ogg` | Kosmisk statisk (DARK INSIGHT) |
| `tinnitus.ogg` | Øresus |
| `breath-heavy.ogg` | Tung pust |
| `madness-trigger.ogg` | Galskap aktiveres |

### Magic (`magic/`)

| Fil | Spell/Ritual |
|-----|--------------|
| `spell-cast.ogg` | Generisk spell |
| `eldritch-bolt.ogg` | Eldritch Bolt |
| `mind-blast.ogg` | Mind Blast |
| `banish.ogg` | Banish |
| `dark-shield.ogg` | Dark Shield |
| `glimpse-beyond.ogg` | Glimpse Beyond |
| `true-sight.ogg` | True Sight |
| `mend-flesh.ogg` | Mend Flesh |
| `ritual-start.ogg` | Ritual begynner |
| `ritual-chant.ogg` | Ritual-messing |
| `ritual-complete.ogg` | Ritual fullført |
| `ritual-fail.ogg` | Ritual feilet |
| `elder-sign.ogg` | Elder Sign brukt |
| `ward-break.ogg` | Bryte ward/seal |

### Items (`items/`)

| Fil | Beskrivelse |
|-----|-------------|
| `pickup-generic.ogg` | Plukke opp gjenstand |
| `pickup-weapon.ogg` | Plukke opp våpen |
| `pickup-key.ogg` | Plukke opp nøkkel |
| `pickup-clue.ogg` | Finne ledetråd |
| `pickup-gold.ogg` | Finne gull |
| `drop-item.ogg` | Legge fra seg |
| `equip.ogg` | Ta på utstyr |
| `unequip.ogg` | Ta av utstyr |
| `use-heal.ogg` | Bruke First Aid |
| `use-whiskey.ogg` | Drikke whiskey |
| `use-flashlight.ogg` | Lommelykt på |
| `use-lantern.ogg` | Tenne lanterne |
| `read-book.ogg` | Lese bok |
| `search-start.ogg` | Begynne søk |
| `search-found.ogg` | Fant noe |
| `search-nothing.ogg` | Fant ingenting |

### Events (`events/`)

| Fil | Beskrivelse |
|-----|-------------|
| `doom-tick.ogg` | Doom trekker ned |
| `doom-event.ogg` | Doom-terskel nådd |
| `doom-critical.ogg` | Doom nesten 0 |
| `doom-zero.ogg` | Game Over fra Doom |
| `event-card-draw.ogg` | Trekke Event Card |
| `event-positive.ogg` | Positiv event |
| `event-negative.ogg` | Negativ event |
| `objective-complete.ogg` | Mål fullført |
| `objective-fail.ogg` | Mål feilet |
| `scenario-victory.ogg` | Seier |
| `scenario-defeat.ogg` | Nederlag |
| `level-up.ogg` | Level opp |
| `new-clue.ogg` | Ny ledetråd |
| `secret-found.ogg` | Hemmelighet avslørt |

### Ambient (`ambient/`)

**Vær:**
| Fil | Weather |
|-----|---------|
| `rain-light.ogg` | Lett regn (loop) |
| `rain-heavy.ogg` | Kraftig regn (loop) |
| `thunder-distant.ogg` | Fjern torden |
| `thunder-close.ogg` | Nær torden |
| `wind-light.ogg` | Lett vind (loop) |
| `wind-howling.ogg` | Ulende vind (loop) |
| `fog-ambience.ogg` | Tåke (loop) |

**Tiles:**
| Fil | Location |
|-----|----------|
| `ambient-forest.ogg` | Skog (loop) |
| `ambient-marsh.ogg` | Myr (loop) |
| `ambient-coast.ogg` | Kyst (loop) |
| `ambient-urban.ogg` | By (loop) |
| `ambient-church.ogg` | Kirke (loop) |
| `ambient-crypt.ogg` | Krypt (loop) |
| `ambient-sewer.ogg` | Kloakk (loop) |
| `ambient-asylum.ogg` | Asyl (loop) |
