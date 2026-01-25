# Test Coverage Log

## Overview

This document tracks the test coverage implementation for the Shadows of the 1920s codebase.

## Test Implementation Status

| Module | Tests | Status |
|--------|-------|--------|
| `diceUtils.ts` | 48 tests | Implemented |
| `combatUtils.ts` | 76 tests | Implemented |
| `criticals.ts` | 39 tests | Implemented |
| **Total** | **163 tests** | **All Passing** |

---

## Dice Utilities (`src/game/constants/diceUtils.ts`)

**Test File:** `src/game/constants/diceUtils.test.ts`

### Constants Tests
- Combat DC value (4)
- Difficulty class thresholds (DC_EASY=3, DC_MEDIUM=4, DC_HARD=5, DC_EXTREME=6)

### `rollDice()` Tests (7 tests)
- Returns correct number of dice
- Returns values between 1-6
- Returns empty array for zero/negative dice count
- Caps dice count at 100 for memory safety
- Returns integers only

### `countSuccesses()` Tests (6 tests)
- Counts successes with default DC (4)
- Counts successes with custom DC
- Returns 0 for empty array
- Handles invalid input gracefully
- Handles edge case DCs (0, 7)

### `rollAndCount()` Tests (3 tests)
- Returns rolls array and success count
- Correctly counts successes in returned rolls
- Uses custom DC when provided

### `formatDiceRolls()` Tests (6 tests)
- Brackets successes with default DC
- Brackets successes with custom DC
- Returns dash for empty array
- Handles invalid input gracefully
- Handles all successes/failures

### `isCriticalHit()` Tests (6 tests)
- Returns true when all dice succeed
- Returns false when any die fails
- Returns false for empty array
- Handles custom DC
- Handles invalid input
- Works with single die

### `isCriticalMiss()` Tests (6 tests)
- Returns true when all dice fail
- Returns false when any die succeeds
- Returns false for empty array
- Handles custom DC
- Handles invalid input
- Works with single die

### `calculateNetDamage()` Tests (4 tests)
- Calculates attack minus defense
- Returns 0 when defense >= attack
- Never returns negative values
- Handles zero values

### `getDCDescription()` Tests (3 tests)
- Returns correct descriptions for standard DCs
- Returns "Trivial" for DCs below Easy
- Returns "Impossible" for DCs above Extreme

### `calculateSuccessProbability()` Tests (7 tests)
- Returns 0 for zero/negative dice count
- Returns 0 for zero/negative required successes
- Calculates correct probability for single die
- Calculates probability with multiple dice
- Calculates probability for multiple required successes
- Handles different DCs correctly
- Returns high probability when dice >> requirements

---

## Combat Utilities (`src/game/utils/combatUtils.ts`)

**Test File:** `src/game/utils/combatUtils.test.ts`

### `performSkillCheck()` Tests (5 tests)
- Rolls base 2 dice plus attribute value
- Includes bonus dice when provided
- Passes when at least one success
- Fails when no successes
- Includes correct DC and skill in result

### `getAttackDice()` Tests (3 tests)
- Returns base attack dice when unarmed
- Returns weapon attack dice when armed
- Picks best weapon when multiple equipped

### `canCharacterClassUseWeapon()` Tests (7 tests)
- Allows veteran to use all weapons
- Restricts detective from tommy gun
- Restricts professor to derringer/knife only
- Restricts occultist to knife/revolver
- Restricts journalist from shotgun/tommy gun
- Handles unknown character classes gracefully
- Handles weapon ID normalization

### `canUseWeapon()` Tests (1 test)
- Delegates to canCharacterClassUseWeapon

### `getWeaponAttackDice()` Tests (3 tests)
- Returns weapon info for armed player
- Returns unarmed stats when no weapon
- Indicates restricted weapon when class cannot use it

### `getDefenseDice()` Tests (3 tests)
- Returns base defense when no armor
- Adds armor defense dice
- Picks best armor when multiple sources

### `performAttack()` Tests (9 tests)
- Returns valid combat result
- Returns error result for null player
- Returns error result for null enemy
- Calculates critical hit conditions
- Calculates critical miss when all dice fail
- Applies veteran melee bonus
- Does NOT apply veteran bonus for ranged weapons
- Includes expanded crit info on critical hit

### `performDefense()` Tests (6 tests)
- Returns valid defense result
- Blocks damage equal to defense successes
- Does not block more than incoming damage
- Returns error result for null player
- Handles negative incoming damage
- Adds armor defense dice

### `performHorrorCheck()` Tests (6 tests)
- Skips check if enemy already encountered
- Causes sanity loss on failed check
- Resists horror on successful check
- Gives veteran immunity to first horror check
- Gives professor bonus dice on horror checks
- Uses higher DC for more horrifying enemies

### `calculateEnemyDamage()` Tests (7 tests)
- Returns valid damage result
- Returns error result for null enemy
- Returns error result for null player
- Calculates net damage as attack minus defense
- Deals sanity damage for sanity-type attackers
- Applies fast trait bonus
- Applies global enemy attack bonus

### `canAttackEnemy()` Tests (5 tests)
- Allows melee attack on adjacent enemy
- Prevents melee attack on distant enemy
- Allows ranged attack within range
- Prevents ranged attack beyond range
- Indicates restricted weapon

### `hasRangedWeapon()` Tests (3 tests)
- Returns true with ranged weapon
- Returns false with melee weapon
- Returns false when unarmed

### `getCombatPreview()` Tests (2 tests)
- Returns attack and defense dice info
- Includes veteran melee bonus in breakdown

### `getDefensePreview()` Tests (1 test)
- Returns defense dice count

### `getPlayerDefenseDice()` Tests (2 tests)
- Returns base defense dice when no armor
- Adds armor bonus to defense dice

### `applyCriticalBonus()` Tests (6 tests)
- Grants free attack for extra_attack
- Heals HP for heal_hp
- Does not exceed max HP
- Grants insight for gain_insight
- Recovers sanity for recover_sanity
- Handles unknown bonus type

### `applyCriticalPenalty()` Tests (4 tests)
- Triggers counter attack for counter_attack
- Applies AP loss for lose_ap
- Attracts enemy for attract_enemy
- Handles unknown penalty type

### `getCombatPreviewWithDesperate()` Tests (4 tests)
- Shows desperate bonuses when HP is low
- Shows attack dice bonus when sanity critically low
- Does not show desperate bonuses at full HP
- Includes weapon and armor info

---

## Critical Hit/Miss System (`src/game/constants/criticals.ts`)

**Test File:** `src/game/constants/criticals.test.ts`

### `CRITICAL_BONUSES` Tests (7 tests)
- Has at least 3 bonus options
- Has required properties on each bonus
- Includes extra_attack bonus
- Includes heal_hp bonus
- Includes gain_insight bonus
- Includes recover_sanity bonus
- Has unique IDs

### `CRITICAL_PENALTIES` Tests (7 tests)
- Has at least 3 penalty options
- Has required properties on each penalty
- Includes counter_attack penalty
- Includes lose_ap penalty
- Includes drop_item penalty
- Includes attract_enemy penalty
- Has unique IDs

### `getRandomCriticalBonuses()` Tests (7 tests)
- Returns requested number of bonuses
- Returns all unique bonuses
- Does not return more than available
- Returns empty array for zero count
- Returns empty array for negative count
- Returns valid bonus objects
- Returns different bonuses on subsequent calls (randomness)

### `getRandomCriticalPenalty()` Tests (4 tests)
- Returns a valid penalty
- Returns penalty from CRITICAL_PENALTIES array
- Returns different penalties on subsequent calls
- Returns fallback when array is empty

### `getCriticalBonus()` Tests (5 tests)
- Returns bonus by ID (extra_attack)
- Returns heal_hp bonus
- Returns gain_insight bonus
- Returns recover_sanity bonus
- Returns null for unknown ID

### `getCriticalPenalty()` Tests (5 tests)
- Returns penalty by ID (counter_attack)
- Returns lose_ap penalty
- Returns drop_item penalty
- Returns attract_enemy penalty
- Returns null for unknown ID

### Integration Tests (4 tests)
- Supports critical hit flow: roll -> get bonuses -> select
- Supports critical miss flow: roll -> get penalty
- Has consistent effect structures for bonuses
- Has consistent effect structures for penalties

---

## Test Fixtures

The test suite includes reusable fixtures for creating mock objects:

### `createMockPlayer()`
Creates a mock player with sensible defaults:
- Detective class with standard attributes
- Empty inventory
- Full HP/Sanity
- Default position at origin

### `createMockEnemy()`
Creates a mock enemy:
- Cultist type
- Standard combat stats
- Adjacent position

### `createMockWeapon()`
Creates a mock weapon item:
- Configurable attack dice
- Configurable range and type

### `createMockArmor()`
Creates a mock armor item:
- Configurable defense dice

---

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npx vitest run src/game/constants/diceUtils.test.ts
```

---

## Recommended Next Steps

### Tier 2: Game Systems (Priority)
1. `scenarioGenerator.ts` - Random scenario creation
2. `scenarioValidator.ts` - Winnability validation
3. `monsterAI.ts` - Enemy decision logic
4. `tileConnectionSystem.ts` - Hex grid connectivity
5. `survivorSystem.ts` - Character traits
6. `objectiveSpawner.ts` - Objective placement
7. `mythosPhaseUtils.ts` - Phase progression

### Tier 3: Components & Hooks
1. Game components (GameBoard, CombatOverlay, etc.)
2. Custom hooks (useAIGameMaster, useAudio, useVisualEffects)
3. Quest editor components

### Tier 4: Services (Requires Mocking)
1. `claudeService.ts` - AI API calls
2. `ttsService.ts` - Text-to-speech

---

## Last Updated

**Date:** 2026-01-25
**Tests Added:** 163
**Tests Passing:** 163 (100%)
**Coverage Focus:** Dice/Combat Utilities (Core Gameplay)
