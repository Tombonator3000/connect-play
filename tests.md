# Test Coverage Log

## Overview

This document tracks the test coverage implementation for the Shadows of the 1920s codebase.

## Test Implementation Status

| Module | Tests | Status |
|--------|-------|--------|
| `diceUtils.ts` | 48 tests | ✅ Implemented |
| `combatUtils.ts` | 76 tests | ✅ Implemented |
| `criticals.ts` | 39 tests | ✅ Implemented |
| `scenarioGenerator.ts` | 58 tests | ✅ Implemented |
| `scenarioGeneratorHelpers.ts` | 57 tests | ✅ Implemented |
| `scenarioValidator.ts` | 42 tests | ✅ Implemented |
| `monsterAI.ts` | 54 tests | ✅ Implemented |
| `tileConnectionSystem.ts` | 141 tests | ✅ Implemented |
| `survivorSystem.ts` | 77 tests | ✅ Implemented |
| `objectiveSpawner.ts` | 55 tests | ✅ Implemented |
| `mythosPhaseUtils.ts` | 39 tests | ✅ Implemented |
| **Total** | **686 tests** | **All Passing** |

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

## Scenario Generator (`src/game/utils/scenarioGenerator.ts`)

**Test File:** `src/game/utils/scenarioGenerator.test.ts`

### Configuration Constants Tests
- MISSION_TYPES array contains required types
- LOCATION_POOLS has entries for all themes
- ENEMY_POOLS has entries for all themes
- THEME_ENEMY_MAPPING maps mission types to themes

### Narrative Content Tests
- NARRATIVE_TEMPLATES contains required templates
- Templates have proper structure with scenes and text arrays
- RANDOM_TITLES contains themed title options
- RANDOM_BRIEFINGS contains themed briefing templates

### `generateRandomScenario()` Tests
- Returns valid scenario with required fields
- Generates objectives based on mission type
- Creates location entries with proper structure
- Produces syntactically correct story content

### `generateScenarioPool()` Tests
- Generates requested number of scenarios
- Uses specified theme when provided
- Returns array of valid scenarios

### `generateValidatedScenario()` Tests
- Returns validated scenario
- Scenario passes winnability checks

---

## Scenario Generator Helpers (`src/game/utils/scenarioGeneratorHelpers.ts`)

**Test File:** `src/game/utils/scenarioGeneratorHelpers.test.ts`

### Utility Functions Tests
- `randomElement()` returns valid array element
- `randomRange()` returns value within bounds
- `generateId()` creates unique identifiers

### Template Interpolation Tests
- `interpolateTemplate()` replaces placeholders
- Handles multiple placeholders
- Preserves text without placeholders

### Context Building Tests
- `buildNarrativeContext()` includes theme elements
- Context contains villain and location info

### Location Generation Tests
- `generateLocations()` creates valid location arrays
- Locations have proper hex positioning
- Respects count parameters

### Objective Generation Tests
- `generateObjectives()` creates mission-specific objectives
- Kill objectives have enemy targets
- Collect objectives have item requirements
- Survival objectives have turn counts

### Doom Events Tests
- `generateDoomEvents()` creates timed events
- Events have doom thresholds
- Events include descriptions and effects

### Title/Briefing Generation Tests
- `generateTitle()` creates themed titles
- `generateBriefing()` creates narrative briefings

---

## Scenario Validator (`src/game/utils/scenarioValidator.ts`)

**Test File:** `src/game/utils/scenarioValidator.test.ts`

### `validateScenarioWinnability()` Tests
- Returns valid result for winnable scenarios
- Identifies missing required items
- Identifies unreachable objectives
- Calculates objective completion feasibility

### `isScenarioBasicallyWinnable()` Tests
- Returns true for valid scenarios
- Returns false for impossible scenarios
- Handles edge cases gracefully

### `getValidationSummary()` Tests
- Generates human-readable summary
- Lists all issues found
- Provides recommendations

### `autoFixScenario()` Tests
- Adds missing quest items
- Adjusts impossible turn counts
- Places required enemies for kill objectives

### Integration Tests
- `generateValidatedScenario()` produces winnable scenarios
- Validation catches common scenario bugs

---

## Monster AI (`src/game/utils/monsterAI.ts`)

**Test File:** `src/game/utils/monsterAI.test.ts`

### Flanking & Pack Tactics Tests
- `calculateFlankingBonus()` rewards surrounding enemies
- `calculatePackBonus()` rewards nearby allies
- Combined bonuses affect combat decisions

### Target Prioritization Tests
- `prioritizeTargets()` ranks players by threat
- Considers player HP, position, and equipment
- Weights wounded players higher

### Pathfinding Tests
- `findPathToTarget()` finds valid routes
- Avoids blocked tiles
- Handles unreachable targets

### Special Movement Tests
- Teleport-capable enemies bypass walls
- Flying enemies ignore terrain
- Phase-shift enemies have special movement

### Ranged Attack Tests
- `canAttackFromRange()` checks line of sight
- `calculateCoverPenalty()` applies terrain modifiers
- Ranged enemies prefer distance

### Special Abilities Tests
- `processSpecialAbility()` handles unique powers
- Fear effects cause sanity damage
- Summoning creates new enemies

### Flee/Morale Tests
- `shouldFlee()` checks morale thresholds
- Wounded enemies may retreat
- Boss enemies never flee

### Turn Processing Tests
- `processEnemyTurn()` handles full AI cycle
- Enemies move then attack
- Returns updated enemy states

---

## Tile Connection System (`src/game/tileConnectionSystem.ts`)

**Test File:** `src/game/tileConnectionSystem.test.ts`

### Edge Compatibility Tests (30 tests)
- `isEdgeCompatible()` validates matching edges
- Door-to-door connections valid
- Open-to-open connections valid
- Wall-to-wall compatible but not traversable
- Mismatched edges rejected

### Direction Utilities Tests (18 tests)
- `getOppositeDirection()` returns correct opposite
- `getAdjacentDirections()` returns neighbors
- Direction wrapping handles edge cases

### Edge Rotation Tests (24 tests)
- `rotateEdges()` applies rotation correctly
- 60° increments supported
- Full 360° returns original

### Tile Template Tests (69 tests)
- Foyer templates (9 tests)
- Corridor templates (12 tests)
- Room templates (9 tests)
- Stairs templates (9 tests)
- Basement templates (6 tests)
- Crypt templates (6 tests)
- Facade templates (9 tests)
- Street templates (6 tests)
- Nature templates (3 tests)

---

## Survivor System (`src/game/utils/survivorSystem.ts`)

**Test File:** `src/game/utils/survivorSystem.test.ts`

### Template Tests (12 tests)
- `SURVIVOR_TEMPLATES` contains all types
- Templates have required properties
- Abilities have proper effects

### Spawn Configuration Tests (6 tests)
- Spawn chance within valid range
- Required tiles for spawning
- Max survivors per game

### `selectSurvivorType()` Tests (6 tests)
- Returns valid survivor type
- Respects scenario theme
- Randomization works correctly

### `createSurvivor()` Tests (9 tests)
- Creates survivor with proper stats
- Assigns unique ID
- Sets correct position

### `shouldSpawnSurvivor()` Tests (12 tests)
- Returns true when conditions met
- Returns false at max capacity
- Considers exploration progress

### `startFollowing()` Tests (6 tests)
- Updates survivor state
- Links to rescue player
- Clears previous follower

### `rescueSurvivor()` Tests (9 tests)
- Awards rescue points
- Triggers survivor ability
- Updates game state

### `killSurvivor()` Tests (6 tests)
- Removes survivor from game
- Triggers sanity loss for nearby players
- Updates statistics

### `useSurvivorAbility()` Tests (6 tests)
- Applies ability effect
- Respects cooldowns
- Returns updated state

### `shouldTargetSurvivor()` Tests (3 tests)
- Enemies may target survivors
- Considers survivor value

### `processSurvivorTurn()` Tests (2 tests)
- Survivors follow their rescuer
- Idle survivors may wander

---

## Objective Spawner (`src/game/utils/objectiveSpawner.ts`)

**Test File:** `src/game/utils/objectiveSpawner.test.ts`

### Lookup Helper Tests (6 tests)
- `getQuestItemDefinition()` returns correct item
- `getQuestTileDefinition()` returns correct tile
- Returns undefined for unknown types

### Quest Item Definition Tests (9 tests)
- All quest item types defined
- Items have required properties
- Descriptions are localized (Norwegian)

### Initialization Tests (6 tests)
- `initializeObjectiveSpawnState()` creates valid state
- State tracks all scenario objectives
- Pity timer initialized correctly

### Spawn Probability Tests (12 tests)
- `calculateSpawnProbability()` increases over time
- Pity timer affects probability
- Caps at maximum probability

### Quest Tile Reveal Tests (6 tests)
- `shouldRevealQuestTile()` checks conditions
- Returns true when prerequisites met
- Returns false for already revealed

### Collection Tests (6 tests)
- `collectQuestItem()` updates state
- Marks objective progress
- Handles multiple items per objective

### Tile Exploration Tests (3 tests)
- `processTileExploration()` may spawn items
- Updates pity timer on no spawn

### Guaranteed Spawn Tests (6 tests)
- `checkGuaranteedSpawns()` detects critical state
- Forces spawns when doom is low
- Returns urgency level

### Immediate Spawn Tests (3 tests)
- `spawnRevealedQuestTileImmediately()` places tiles
- Selects best available location

### Spawn Status Tests (3 tests)
- `getObjectiveSpawnStatus()` returns progress
- Tracks spawned vs required items

### Victory Helper Tests (3 tests)
- `shouldSpawnVictoryTile()` checks conditions
- Returns true when all objectives complete

---

## Mythos Phase Utils (`src/game/utils/mythosPhaseUtils.ts`)

**Test File:** `src/game/utils/mythosPhaseUtils.test.ts`

### Portal Spawning Tests (10 tests)
- `collectActivePortals()` finds active portals
- Ignores inactive portals
- Uses default spawn parameters
- `processPortalSpawns()` rolls for spawns
- Randomly selects enemy types
- Creates floating text messages

### Combat Processing Tests (6 tests)
- `applyDamageToPlayer()` reduces HP/sanity
- Marks player as dead at 0 HP
- Reports newly dead status
- Clamps at minimum 0

### Event Card Tests (2 tests)
- `tryDrawEventCard()` has 50% chance
- Returns null when no draw

### Phase Transition Tests (16 tests)
- `resetPlayersForNewTurn()` restores actions
- Uses maxActions when available
- Applies AP penalties
- Dead players get 0 base actions
- Journalists get free movement
- `shouldApplyMadnessEffects()` checks madness
- `areAllPlayersDead()` checks game over

### Helper Function Tests (2 tests)
- `createLogEntry()` formats correctly

### Integration Flow Tests (3 tests)
- Complete mythos phase flow
- Player death handling
- Game over detection

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

### Tier 2: Game Systems ✅ COMPLETE
All 7 modules fully tested:
1. ✅ `scenarioGenerator.ts` - Random scenario creation (58 tests)
2. ✅ `scenarioValidator.ts` - Winnability validation (42 tests)
3. ✅ `monsterAI.ts` - Enemy decision logic (54 tests)
4. ✅ `tileConnectionSystem.ts` - Hex grid connectivity (141 tests)
5. ✅ `survivorSystem.ts` - NPC rescue system (77 tests)
6. ✅ `objectiveSpawner.ts` - Quest item/tile placement (55 tests)
7. ✅ `mythosPhaseUtils.ts` - Mythos phase progression (39 tests)

### Tier 3: Components & Hooks (Next Priority)
1. Game components (GameBoard, CombatOverlay, etc.)
2. Custom hooks (useAIGameMaster, useAudio, useVisualEffects)
3. Quest editor components

### Tier 4: Services (Requires Mocking)
1. `claudeService.ts` - AI API calls
2. `ttsService.ts` - Text-to-speech

---

## Last Updated

**Date:** 2026-01-25
**Tests Added:** 686
**Tests Passing:** 686 (100%)
**Coverage Focus:** Core Utilities + Complete Tier 2 Game Systems

### Recent Updates (2026-01-25)
- Added complete Tier 2 test coverage (+523 tests)
- Scenario generation and validation fully tested
- Monster AI decision logic fully tested
- Tile connection system fully tested
- Survivor NPC system fully tested
- Objective spawner system fully tested
- Mythos phase utilities fully tested
