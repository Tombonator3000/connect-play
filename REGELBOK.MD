# REGELBOK
## Shadows of the 1920s

**Versjon 1.0** | *Hero Quest meets Mansions of Madness*

> *"Det er ikke doden vi frykter, men det vi ser for vi dor."*

---

# INNHOLDSFORTEGNELSE

1. [KAMPSYSTEMET (Hero Quest-stil)](#del-1-kampsystemet-hero-quest-stil)
2. [KARAKTERER](#del-2-karakterer)
3. [VAPEN](#del-3-vapen)
4. [RUSTNING](#del-4-rustning)
5. [MONSTRE (Bestiary)](#del-5-monstre-bestiary)
6. [SKILL CHECKS](#del-6-skill-checks)
7. [INVENTORY-SYSTEMET](#del-7-inventory-systemet)
8. [SANITY OG GALSKAP](#del-8-sanity-og-galskap)
9. [LEGACY-SYSTEMET](#del-9-legacy-systemet)
10. [SCENARIO-REGLER](#del-10-scenario-regler)

---

# DEL 1: KAMPSYSTEMET (Hero Quest-stil)

## 1.1 Grunnleggende konsept

Spillet bruker et **Hero Quest-inspirert terningsystem** der vapenet BESTEMMER antall angrepsterninger direkte (ikke bonuser pa toppen av attributter).

## 1.2 Terning-regler

- **Suksess-terskel (DC)**: 4, 5, eller 6 pa en d6 teller som suksess
- **Sjanse per terning**: 50% (3 av 6 sider)
- **Suksesser kalles**: "Skulls" (angrep) eller "Shields" (forsvar)

## 1.3 Angrepsflyt

```
ANGREP:
1. Kast [Vapen-terninger]
2. Tell "skulls" (4, 5, 6 pa d6)
3. = Potensiell skade

FORSVAR:
1. Fienden kaster [Forsvarsterninger]
2. Tell "shields" (4, 5, 6 pa d6)
3. = Blokkert skade

RESULTAT:
Skade = Skulls - Shields (minimum 0)
```

## 1.4 Kritiske treff og bom

| Resultat | Betingelse | Effekt |
|----------|------------|--------|
| **Kritisk treff** | Alle angrepsterninger traff OG mer enn forsvar | +1 bonus skade |
| **Kritisk bom** | Ingen angrepsterninger traff | Ingen skade |

## 1.5 Klassebonus i kamp

- **Veteran**: +1 angrepsterning med narkampvapen (melee)
- Andre klasser har ingen kampbonus (men har andre fordeler)

## 1.6 Eksempel pa kamp

**Veteran med Shotgun (4 terninger) vs Ghoul (2 forsvarsterninger):**

```
Veteran kaster 4d6: [4] [2] [6] [5] = 3 skulls
Ghoul kaster 2d6: [3] [5] = 1 shield
Skade = 3 - 1 = 2 HP mot Ghoul
```

**Ghoul (2 angrepsterninger) vs Spiller med Leather Jacket (2 forsvarsterninger):**

```
Ghoul kaster 2d6: [5] [4] = 2 skulls
Spiller kaster 2d6: [6] [2] = 1 shield
Skade = 2 - 1 = 1 HP mot spiller
```

---

# DEL 2: KARAKTERER

## 2.1 Karakteroversikt

Alle karakterer er mappet fra Hero Quest-klasser:

| 1920s Klasse | Hero Quest | Rolle | Base Attack | Base Defense | HP | Sanity |
|--------------|------------|-------|-------------|--------------|-----|--------|
| **Veteran** | Barbarian | Fighter | 3 | 2 | 6 | 3 |
| **Detective** | Dwarf | Investigator | 2 | 3 | 5 | 4 |
| **Professor** | Wizard | Scholar | 1 | 2 | 3 | 6 |
| **Occultist** | Elf | Hybrid (spells) | 2 | 2 | 3 | 5 |
| **Journalist** | Rogue | Scout | 2 | 2 | 4 | 4 |
| **Doctor** | Healer | Support | 1 | 2 | 4 | 5 |

## 2.2 Attributter

Hver karakter har fire attributter (verdi 2-5):

| Attributt | Brukes til |
|-----------|------------|
| **Strength (STR)** | Bryte dorer, flytte rubble, melee-sjekker |
| **Agility (AGI)** | Unnga feller, flykte, klatre, lockpick |
| **Intellect (INT)** | Undersoke, lese tekster, lose puzzles |
| **Willpower (WIL)** | Motsta horror, okkulte handlinger, gjenvinne sanity |

## 2.3 Karakterdetaljer

### The Veteran (Barbarian)

**Stats**: HP 6 | Sanity 3 | STR 5 | AGI 3 | INT 2 | WIL 3

**Spesialiteter:**
- Kan bruke ALLE vapen
- +1 angrepsterning med narkampvapen
- **Fearless**: Immun mot forste Horror check

**Vapenrestriksjoner**: Ingen

---

### The Private Eye / Detective (Dwarf)

**Stats**: HP 5 | Sanity 4 | STR 3 | AGI 3 | INT 4 | WIL 3

**Spesialiteter:**
- +1 terning pa Investigation
- **Sharp Eye**: Finner skjulte dorer automatisk

**Vapenrestriksjoner**: Kan ikke bruke Tommy Gun

---

### The Professor (Wizard)

**Stats**: HP 3 | Sanity 6 | STR 2 | AGI 2 | INT 5 | WIL 4

**Spesialiteter:**
- Kan lese okkulte tekster uten Sanity-tap
- **Knowledge**: +2 terninger pa puzzles

**Vapenrestriksjoner**: Kan KUN bruke Derringer og Knife

---

### The Occultist (Elf)

**Stats**: HP 3 | Sanity 5 | STR 2 | AGI 3 | INT 3 | WIL 5

**Spesialiteter:**
- **Ritual Master**: Bruker SPELLS i stedet for tunge vapen
- Velger 3 spells for hvert scenario

**Vapenrestriksjoner**: Kan kun bruke Knife og Revolver

---

### The Journalist (Rogue)

**Stats**: HP 4 | Sanity 4 | STR 2 | AGI 4 | INT 4 | WIL 3

**Spesialiteter:**
- +1 Movement
- **Escape Artist**: Kan flykte uten Horror check

**Vapenrestriksjoner**: Kan ikke bruke Shotgun eller Tommy Gun

---

### The Doctor (Healer)

**Stats**: HP 4 | Sanity 5 | STR 2 | AGI 3 | INT 4 | WIL 4

**Spesialiteter:**
- Healer 2 HP i stedet for 1
- **Medical Kit**: Starter med gratis heal item

**Vapenrestriksjoner**: Kan KUN bruke Derringer og Knife

---

# DEL 3: VAPEN

## 3.1 Narkampvapen (Melee)

| Vapen | Attack Dice | Pris | Notater |
|-------|-------------|------|---------|
| Unarmed | 1 | - | Alle starter med dette |
| Knife | 2 | $50 | Stille, skjult |
| Club / Pipe | 2 | $30 | Improvisert |
| Machete | 3 | $150 | Tungt blad |

## 3.2 Skytevapen (Ranged)

| Vapen | Attack Dice | Rekkevidde | Ammo | Pris | Notater |
|-------|-------------|------------|------|------|---------|
| Derringer | 2 | 2 tiles | 2 | $100 | Skjult, lommestorrelse |
| Revolver | 3 | 3 tiles | 6 | $200 | Standard sidvapen |
| Shotgun | 4 | 2 tiles | 2 | $400 | Ødeleggende pa nart hold |
| Rifle | 3 | 5 tiles | 5 | $350 | Lang rekkevidde |
| Tommy Gun | 5 | 3 tiles | 20 | $800 | Sjelden, Level 2+ |

## 3.3 Vapenrestriksjoner per klasse

| Karakter | Kan bruke | Kan IKKE bruke |
|----------|-----------|----------------|
| Veteran | ALT | - |
| Detective | Alt unntatt Tommy Gun | Tommy Gun |
| Professor | Knife, Derringer | Revolver, Shotgun, Rifle, Tommy Gun, Machete |
| Occultist | Knife, Revolver | Shotgun, Rifle, Tommy Gun, Machete |
| Journalist | Knife, Derringer, Revolver, Rifle | Shotgun, Tommy Gun |
| Doctor | Knife, Derringer | Revolver, Shotgun, Rifle, Tommy Gun, Machete |

---

# DEL 4: RUSTNING

## 4.1 Rustningsoversikt

Rustning legger til forsvarsterninger oppå din base defense.

| Rustning | Defense Dice | Pris | Notater |
|----------|--------------|------|---------|
| Ingen | +0 | - | Kun base defense |
| Leather Jacket | +1 | $100 | Lett beskyttelse |
| Trench Coat | +1 | $150 | Skjuler vapen |
| Armored Vest | +2 | $500 | Militær kvalitet, Level 2+ |

## 4.2 Forsvarsterninger

**Total Defense Dice = Base Defense + Armor Dice**

**Eksempel:**
- Detective (Base 3) + Leather Jacket (+1) = 4 forsvarsterninger
- Veteran (Base 2) + Armored Vest (+2) = 4 forsvarsterninger

---

# DEL 5: MONSTRE (Bestiary)

## 5.1 Monster-kategorier

Monstre er delt inn i fire kategorier etter trussel-niva:

### MINIONS (Svake)

| Monster | HP | Attack Dice | Defense Dice | Horror | Traits |
|---------|-----|-------------|--------------|--------|--------|
| Cultist | 2 | 1 | 1 | 1 | - |
| Mi-Go | 3 | 1 | 2 | 1 | Flying |
| Nightgaunt | 3 | 1 | 2 | 1 | Flying |
| Moon-Beast | 4 | 1 | 2 | 2 | Ranged |

### WARRIORS (Standard)

| Monster | HP | Attack Dice | Defense Dice | Horror | Traits |
|---------|-----|-------------|--------------|--------|--------|
| Ghoul | 3 | 2 | 2 | 2 | Scavenger |
| Deep One | 3 | 2 | 2 | 2 | Aquatic |
| Cultist Sniper | 2 | 2 | 1 | 1 | Ranged |
| Byakhee | 3 | 2 | 2 | 1 | Flying, Fast |
| Formless Spawn | 5 | 2 | 3 | 2 | Regenerate |
| Hound of Tindalos | 4 | 2 | 2 | 3 | Fast, Ambusher |

### ELITES (Sterke)

| Monster | HP | Attack Dice | Defense Dice | Horror | Traits |
|---------|-----|-------------|--------------|--------|--------|
| Dark Priest | 5 | 2 | 3 | 3 | Elite |
| Hunting Horror | 4 | 3 | 2 | 3 | Fast, Flying |
| Dark Young | 6 | 3 | 3 | 3 | Massive |

### BOSSES (Veldig sterke)

| Monster | HP | Attack Dice | Defense Dice | Horror | Traits |
|---------|-----|-------------|--------------|--------|--------|
| Shoggoth | 6 | 3 | 4 | 4 | Massive, Slow |
| Star Spawn | 8 | 4 | 4 | 5 | Massive |
| Ancient One | 10 | 4 | 5 | 6 | Massive |

## 5.2 Monster Traits

| Trait | Effekt |
|-------|--------|
| **Flying** | Kan fly over hindringer |
| **Fast** | +1 suksess pa angrep |
| **Ranged** | Kan angripe pa avstand |
| **Massive** | Tar opp mer plass |
| **Slow** | Beveger seg saktere |
| **Aquatic** | Bonus i vann-tiles |
| **Regenerate** | Healer HP over tid |
| **Ambusher** | Overraskelsesangrep |
| **Scavenger** | Tiltrukket av lik |
| **Elite** | Sterkere enn vanlig |

## 5.3 Monster-beskrivelser

### Cultist
*"A brainwashed servant of the Outer Gods. Recruited from the desperate and the mad."*

### Ghoul
*"A flesh-eating subterranean dweller that feasts on the dead. It collapses into grave dirt when defeated."*

### Deep One
*"An immortal amphibious humanoid. Immortal servants of Father Dagon. The creature dissolves into brine when killed."*

### Shoggoth
*"A protoplasmic mass of eyes and mouths. A nightmarish slave race created by the Elder Things."*

### Star Spawn
*"A colossal kin of Cthulhu. Smaller versions of the Great Dreamer himself."*

### Ancient One
*"An avatar of cosmic destruction. An intrusion from outside the ordered universe."*

---

# DEL 6: SKILL CHECKS

## 6.1 Skill Check-formel

```
Total Terninger = 2 (base) + Attributt-verdi + Bonuser
```

For hver terning som viser >= DC, far du 1 suksess. Du trenger minst 1 suksess for a lykkes.

## 6.2 Difficulty Classes (DC)

| DC | Vanskelighet | Eksempler |
|----|--------------|-----------|
| **3** | Easy | Enkle laser, lett rubble, grunnleggende ledetrad |
| **4** | Medium | Kvalitetslas, barrikadert dor, skjult passasje |
| **5** | Hard | Komplekse laser, okkulte segl, dype hemmeligheter |
| **6** | Extreme | Eldgamle vokter-segl, eldritch puzzles |

## 6.3 Eksempel pa Skill Check

**Detective (INT 4) prover a finne skjult dor (DC 4):**
```
Base: 2 terninger
INT bonus: 4 terninger
Class bonus: +1 (investigate_bonus)
Total: 7 terninger

Kaster 7d6: [5] [2] [4] [1] [6] [3] [4]
Suksesser (>= 4): 4 stykker
Resultat: SUKSESS!
```

## 6.4 Kontekstuelle handlinger

### Eksempel: Last dor

| Handling | Krav | Skill Check |
|----------|------|-------------|
| Use Key | Har riktig nokkel | Automatisk |
| Lockpick | - | Agility DC 4 |
| Force | - | Strength DC 5 (bryter doren) |

### Eksempel: Okkult segl

| Handling | Krav | Skill Check |
|----------|------|-------------|
| Use Elder Sign | Har Elder Sign | Automatisk |
| Break Seal | - | Willpower DC 5, -1 Sanity |
| Read Glyphs | - | Intellect DC 4 (gir hint) |

---

# DEL 7: INVENTORY-SYSTEMET

## 7.1 Inventory Slots

| Slot Type | Antall | Innhold |
|-----------|--------|---------|
| **Hand** | 2 | Vapen, verktoy, lyskilde |
| **Body** | 1 | Rustning, kappe, vest |
| **Bag** | 4 | Alt annet (keys, items, clues) |

**Total kapasitet**: 7 items. Ma droppe for a plukke opp nytt.

## 7.2 Item-kategorier

### Vapen (HAND)
Se DEL 3: VAPEN

### Verktoy (HAND)

| Item | Effekt | Pris |
|------|--------|------|
| Flashlight | Lyskilde, fjerner DARKNESS penalty | $50 |
| Oil Lantern | Lyskilde, kan tennes pa fyr | $75 |
| Lockpick Set | +1 terning pa lockpicking | $100 |
| Crowbar | +1 terning pa a tvinge dorer | $75 |

### Beskyttelse (BODY)
Se DEL 4: RUSTNING

### Okkulte Items (BAG)

| Item | Effekt | Pris |
|------|--------|------|
| Elder Sign | Apner forseglede dorer, banish spirits | $750 |
| Protective Ward | +1 terning pa Horror checks | $300 |
| Necronomicon | +3 Insight, -1 Sanity per lesing | $400 |

### Forbruksvarer (BAG)

| Item | Effekt | Pris |
|------|--------|------|
| First Aid Kit | Heal 2 HP, 3 bruk | $100 |
| Bandage | Heal 1 HP | $25 |
| Old Whiskey | +1 Sanity, -1 terning neste runde | $30 |

---

# DEL 8: SANITY OG GALSKAP

## 8.1 Sanity-tap

| Trigger | Sanity-tap | Kan motstaes? |
|---------|------------|---------------|
| Se fiende forste gang | -1 til -6 (basert pa Horror) | Willpower check |
| Lese okkult tekst | -1 | Professor: Immun |
| Se medspiller do | -2 | Nei |
| Utfore ritual | -1 til -3 | Occultist: Halvert |
| Se portal/annen dimensjon | -2 | Willpower DC 5 |

## 8.2 Horror Check

Nar du ser en fiende for forste gang:
1. Kast 2 + WIL terninger mot DC basert pa fienden
2. Lykkes = ingen Sanity-tap
3. Feiler = mister Sanity lik fiendens Horror-verdi

**Veteran er immun mot forste Horror check (Fearless)**

## 8.3 Nar Sanity nar 0

1. Trekk et **MADNESS CARD**
2. Sanity settes til 2 (ikke 0)
3. Madness Condition aktiveres PERMANENT
4. Ved 3 Madness Conditions = karakter er tapt

## 8.4 Madness Conditions

| Tilstand | Mekanisk effekt |
|----------|-----------------|
| **Hallucinations** | 25% sjanse for falske fiender |
| **Paranoia** | Kan ikke sta pa samme tile som andre spillere |
| **Hysteria** | 50% sjanse for a miste 1 AP ved rundestart |
| **Catatonia** | Start med 1 mindre AP, kan ikke flykte |
| **Obsession** | Ma undersoke ALT for du kan forlate et rom |
| **Amnesia** | Fog of war resetter for deg hver runde |
| **Night Terrors** | Kan ikke bruke Rest-handling |
| **Dark Insight** | +2 Insight, men Doom trekker 1 ekstra per runde |

---

# DEL 9: LEGACY-SYSTEMET

## 9.1 Persistent Heroes

I Legacy-modus kan du bruke samme helt i flere scenarier:
- Helter beholder utstyr mellom spill
- Tjen gull og XP fra scenarier
- Level opp (1-5) med stat-bonuser
- **PERMADEATH**: Dode helter er borte for alltid

## 9.2 XP og Leveling

| Level | XP Krav | Akkumulert |
|-------|---------|------------|
| 1 | 0 | Start |
| 2 | 50 | 50 |
| 3 | 150 | 150 |
| 4 | 300 | 300 |
| 5 | 500 | Max |

## 9.3 Level Up Bonuser

Ved hvert level far du velge EN bonus:
- +1 til en attributt (STR/AGI/INT/WIL)
- +2 Max HP
- +1 Max Sanity

## 9.4 Gull-okonomi

**Tjen gull fra:**
- Fullforte scenarier (basert pa vanskelighetsgrad)
- Bonus-mal
- Drept fiender

**Bruk gull pa:**
- Vapen og rustning
- Verktoy
- Forbruksvarer
- Sjeldne relikvier

## 9.5 Equipment Stash

- Delt lagring mellom alle helter
- Maks 20 items
- Utstyr fra dode/pensjonerte helter gar til stash

---

# DEL 10: SCENARIO-REGLER

## 10.1 Scenario-typer

| Type | Mal | Seiers-betingelse |
|------|-----|-------------------|
| **Escape** | Flykt fra stedet | Na utgangen med required items |
| **Assassination** | Drep malet | Drep boss-fienden |
| **Survival** | Overlev | Overlev X runder |
| **Collection** | Samle items | Finn alle required items |
| **Investigation** | Undersoking | Oppdag sannheten |
| **Ritual** | Utfor ritual | Fullfør ritualet |

## 10.2 Doom Tracker

- Starter pa scenario-definert verdi (vanligvis 8-12)
- Synker med 1 per runde
- **Doom Events** trigges ved terskler
- **Doom = 0 = Game Over**

## 10.3 Doom Events

Typiske doom events:
- **Fiende-spawn**: Flere fiender dukker opp
- **Boss-spawn**: Boss-fiende ankommer
- **Sanity hit**: Alle mister Sanity
- **Buff enemies**: Fiender blir sterkere

## 10.4 Vanskelighetsgrader

| Grad | Doom Start | Fiender | Loot |
|------|------------|---------|------|
| **Normal** | 12 | Standard | Normal |
| **Hard** | 10 | +25% | Normal |
| **Nightmare** | 8 | +50% | Redusert |

## 10.5 Seier og tap

**Seier:**
- Fullfør alle pakreved objectives
- Minst en spiller overlever

**Tap:**
- Alle spillere dor (HP = 0)
- Doom nar 0
- Kritisk objective feiler

---

# APPENDIX: QUICK REFERENCE

## Action Point Costs

| Handling | AP-kostnad |
|----------|------------|
| Bevege (normal) | 1 |
| Bevege (vanskelig terreng) | 2 |
| Apne dor | 1 |
| Undersoke | 1 |
| Angrep | 1 |
| Bruk item | 1 |
| Lockpick | 1 |
| Rydd rubble | 2 |
| Hvile (+1 Sanity) | 2 |
| Bruk trapp | 2 |

## Combat Quick Reference

```
SPILLER ANGRIPER:
1. Kast [Vapen Dice]
2. Tell skulls (4, 5, 6)
3. Fiende kaster [Defense Dice]
4. Tell shields (4, 5, 6)
5. Skade = Skulls - Shields

FIENDE ANGRIPER:
1. Fiende kaster [Attack Dice]
2. Tell skulls
3. Spiller kaster [Base + Armor Dice]
4. Tell shields
5. Skade = Skulls - Shields
```

## Horror Check Quick Reference

| Trussel | Sanity-tap | Willpower DC |
|---------|------------|--------------|
| Minor (cultist) | -1 | 3 |
| Moderate (ghoul) | -2 | 4 |
| Major (deep one) | -2 | 4 |
| Extreme (shoggoth) | -4 | 5 |
| Cosmic (star spawn) | -5 | 5 |
| Avatar (ancient one) | -6 | 5 |

---

# OCCULTIST SPELLS

## Tilgjengelige Spells

| Spell | Effekt | Dice | Bruk per scenario | Range |
|-------|--------|------|-------------------|-------|
| **Eldritch Bolt** | 3 attack dice | Fixed 3 | Ubegrenset (1/runde) | 3 |
| **Mind Blast** | 2 attack + Horror pa fiende | Fixed 2 | 2 | 2 |
| **Banish** | Fjerner svak fiende (HP <= 3) | WIL DC 5 | 2 | 2 |
| **Dark Shield** | +2 Defense denne runden | Auto | 3 | Self |
| **Glimpse Beyond** | Se alle tiles i 3 range | Auto | 1 | 3 |

Occultist velger 3 spells for hvert scenario starter.

---

*"Ph'nglui mglw'nafh Cthulhu R'lyeh wgah'nagl fhtagn."*

**--- END OF REGELBOK ---**
