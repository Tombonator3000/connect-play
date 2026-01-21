# Bug Tracker - Mythos Quest

> Sist oppdatert: 2026-01-21

---

## Status Oversikt

| Status | Antall |
|--------|--------|
| **FIKSET** | 3 |
| **BEKREFTET** | 2 |
| **TIL VERIFISERING** | 2 |
| **LITEN RISIKO** | 5 |

---

## FIKSET

### BUG-012: `as any` i MerchantShop.tsx for weapon restriction check (FIKSET 2026-01-21)

**Fil:** `src/game/components/MerchantShop.tsx:220`

**Kode før:**
```typescript
const isWeaponRestrictedForHero = useCallback((weaponId: string, itemType: string): boolean => {
  if (!activeHero || itemType !== 'weapon') return false;

  // Create a minimal player-like object for canUseWeapon check
  const mockPlayer = {
    id: activeHero.characterClass,
    specialAbility: CHARACTERS[activeHero.characterClass as keyof typeof CHARACTERS]?.specialAbility || '',
    inventory: { leftHand: null, rightHand: null, body: null, bag: [] },
    attributes: { strength: 0, agility: 0, intelligence: 0, willpower: 0 }
  } as any;

  return !canUseWeapon(mockPlayer, weaponId);
}, [activeHero]);
```

**Problem:** `as any` ble brukt for å lage et mock Player-objekt fordi `canUseWeapon` krevde et helt `Player` objekt, selv om funksjonen bare brukte `player.id` for å sjekke våpenrestriksjoner.

**Løsning:**
1. Opprettet ny funksjon `canCharacterClassUseWeapon(characterClass, weaponId)` i `combatUtils.ts` som gjør det faktiske arbeidet
2. Refaktorerte `canUseWeapon(player, weaponId)` til å være en wrapper rundt den nye funksjonen
3. Oppdaterte MerchantShop til å bruke `canCharacterClassUseWeapon` direkte med `activeHero.characterClass`

**Kode etter:**
```typescript
const isWeaponRestrictedForHero = useCallback((weaponId: string, itemType: string): boolean => {
  if (!activeHero || itemType !== 'weapon') return false;

  // Use canCharacterClassUseWeapon directly with the character class
  // This avoids the need for creating mock Player objects with type assertions
  return !canCharacterClassUseWeapon(activeHero.characterClass, weaponId);
}, [activeHero]);
```

**Severity:** LOW (fungerte, men dårlig praksis) → FIKSET

---

### BUG-001: Unødvendig `as any` type assertion i SkillCheckPanel (FIKSET 2026-01-21)

**Fil:** `src/game/components/SkillCheckPanel.tsx:49`

**Kode før:**
```typescript
const attrs = (player as any).attributes;
```

**Problem:** `Player` extends `Character` som har `attributes: CharacterAttributes`. Type assertion er unødvendig og kan skjule TypeScript-feil.

**Løsning:** Fjernet `as any` og bruker direkte property access.

**Severity:** LOW (fungerer, men dårlig praksis)

---

### BUG-002: `as any` i ShadowsGame.tsx particle system (FIKSET 2026-01-21)

**Fil:** `src/game/ShadowsGame.tsx:625`

**Kode før:**
```typescript
const emitSpellEffect = (
  startQ: number,
  startR: number,
  type: 'wither' | 'eldritch_bolt' | ...,  // inline union type
  ...
) => {
  const particle = {
    id,
    type: type as any,  // <-- Farlig type assertion
    // ...
  };
};
```

**Problem:** `as any` ble brukt for å omgå type-sjekker fordi funksjonsparameteren brukte en inline union type i stedet for den definerte `SpellParticleType`.

**Løsning:**
1. Importert `SpellParticleType` fra `types.ts`
2. Endret funksjonssignaturen til å bruke `SpellParticleType` direkte
3. Fjernet `as any` - TypeScript kan nå validere at alle particle typer er gyldige

**Kode etter:**
```typescript
const emitSpellEffect = (
  startQ: number,
  startR: number,
  type: SpellParticleType,  // <-- Bruker definert type
  ...
) => {
  const particle = {
    id,
    type,  // <-- Ingen type assertion nødvendig
    // ...
  };
};
```

**Severity:** MEDIUM (fikset)

---

## BEKREFTET (Trenger fiks)

### BUG-003: `as EnemyType` uten validering

**Fil:** `src/game/ShadowsGame.tsx:493`

**Kode:**
```typescript
const spawnType = event.targetId as EnemyType;
```

**Problem:** `event.targetId` castes til `EnemyType` uten runtime validering. Hvis `targetId` inneholder en ugyldig verdi, vil koden feile runtime.

**Severity:** MEDIUM

---

### BUG-004: Race condition i state updates + logging

**Fil:** `src/game/ShadowsGame.tsx:343-351`

**Kode:**
```typescript
setState(prev => ({
  ...prev,
  board: updatedBoard,
  objectiveSpawnState: updatedState,
}));

// Log urgency status after state is set
if (spawnCheck.urgency === 'critical') {
  addToLog("📜 Doom nærmer seg...");
}
```

**Problem:** Logger skrives etter `setState`, men React state updates er asynkrone. Loggmeldinger kan vises før state faktisk oppdateres visuelt.

**Severity:** MEDIUM (UI timing issue, ikke kritisk)

---

## TIL VERIFISERING

### BUG-005: PuzzleModal attempts-logikk

**Fil:** `src/game/components/PuzzleModal.tsx:220`

**Kode:**
```typescript
setAttempts(prev => prev - 1);
if (attempts <= 1) {
  setGameState('fail');
  // ...
}
```

**Observasjon:** Sjekker `attempts <= 1` etter å ha kalt `setAttempts`. Pga React state semantikk brukes den GAMLE verdien av `attempts` i if-sjekken. Dette KAN være tilsiktet, men bør verifiseres.

**Analyse:** Hvis spilleren starter med 3 forsøk, får de faktisk 3 forsøk før fail. Dette virker korrekt.

**Severity:** LOW (sannsynligvis OK, men verdt å dokumentere)

---

### BUG-006: Array bounds i monsterAI.ts

**Fil:** `src/game/utils/monsterAI.ts` (flere steder)

**Steder:**
- Linje 213, 555, 1103, 1181

**Observasjon:** Flere steder aksesserer `[0]` på sorterte arrays.

**Status:** VERIFISERT OK - Alle steder har eksisterende null/length sjekker før aksess:
- Linje 213: `visiblePlayers.length === 0` sjekk på linje 203
- Linje 555: `candidates.length === 0` sjekk på linje 551
- Linje 1103: `visiblePlayers.length === 0` sjekk på linje 1078
- Linje 1181: `validMoves.length === 0` sjekk på linje 1168

**Severity:** NONE (falsk positiv)

---

## LITEN RISIKO (Dokumentert, ikke kritisk)

### BUG-007: Callback i useEffect dependency array

**Fil:** `src/game/components/DiceRoller.tsx:40`

**Kode:**
```typescript
}, [values, onComplete]);  // <-- onComplete er en callback
```

**Problem:** Hvis parent-komponenten gjenskaper `onComplete` callback på hver render, vil effect kjøre på nytt og potensielt restarte animasjonen.

**Severity:** LOW (har cleanup, men kan føre til unødvendige re-renders)

---

### BUG-008: Closure variable i PuzzleModal interval

**Fil:** `src/game/components/PuzzleModal.tsx:79-101`

**Problem:** `step` variabel er captured i closure og inkrementeres. Korrekt cleanup finnes, men pattern er fragilt.

**Severity:** LOW

---

### BUG-009: Enemy type fallback uten validering

**Fil:** `src/game/ShadowsGame.tsx:2304`

**Kode:**
```typescript
const enemyType = content.enemyTypes?.[0] || 'ghoul';
```

**Problem:** Fallback til 'ghoul' hvis array er tom eller undefined, men validerer ikke at array-innholdet er gyldig.

**Severity:** LOW

---

### BUG-010: Swallowed error i AssetGenerationService

**Fil:** `src/game/utils/AssetGenerationService.ts:285`

**Kode:**
```typescript
const errorData = await response.json().catch(() => ({}));
```

**Problem:** Fanger JSON parse-feil stille med tom objekt. Kan skjule reelle API-feil.

**Severity:** LOW

---

### BUG-011: Config array bounds antakelse

**Fil:** `src/game/constants.ts:2827`

**Kode:**
```typescript
content.enemyCount = config.count[0] + Math.floor(Math.random() * (config.count[1] - config.count[0] + 1));
```

**Problem:** Antar at `config.count` er et array med minst 2 elementer. Ingen sjekk om `config.count[1] < config.count[0]`.

**Severity:** LOW (data er hardkodet, ikke brukerinput)

---

## Arkitektur-notater

### Pattern som bør unngås

1. **`as any` assertions** - Bruk proper types eller generics
2. **`as SomeType` uten runtime validering** - Legg til type guards
3. **Callbacks i dependency arrays** - Bruk `useCallback` i parent
4. **Post-setState logging** - Bruk `useEffect` for timing-avhengig logging

### Anbefalte forbedringer

- Fjern alle `as any` i prosjektet
- Legg til type guards for runtime validering av event data
- Vurder å bruke `useCallback` konsekvent for callbacks sendt som props

---

*Oppdatert av: Claude Code Agent*
