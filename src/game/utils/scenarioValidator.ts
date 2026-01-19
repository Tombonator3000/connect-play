/**
 * SCENARIO WINNABILITY VALIDATOR
 *
 * Validates that generated scenarios are actually winnable by checking:
 * 1. Doom Timer Feasibility - Is there enough time to complete objectives?
 * 2. Resource Availability - Can required items/enemies actually spawn?
 * 3. Objective Chain Integrity - Are hidden objective dependencies valid?
 * 4. Balance Analysis - Is the scenario fair given difficulty?
 *
 * This ensures players don't get impossible scenarios like:
 * - "Collect 5 artifacts" but only 3 can spawn
 * - "Survive 10 rounds" but doom starts at 8
 * - "Kill 8 enemies" but only 4 spawn via doom events
 */

import {
  Scenario,
  ScenarioObjective,
  DoomEvent,
  VictoryType,
  ObjectiveType
} from '../types';

// ============================================================================
// VALIDATION RESULT TYPES
// ============================================================================

export interface ValidationIssue {
  severity: 'error' | 'warning' | 'info';
  code: string;
  message: string;
  suggestion?: string;
  objectiveId?: string;
  details?: Record<string, unknown>;
}

export interface ValidationResult {
  isWinnable: boolean;
  confidence: number; // 0-100, how confident we are it's winnable
  issues: ValidationIssue[];
  analysis: ScenarioAnalysis;
}

export interface ScenarioAnalysis {
  estimatedMinRounds: number;
  effectiveDoomBudget: number;
  totalEnemiesFromEvents: number;
  requiredKills: number;
  requiredCollectibles: number;
  availableCollectibles: number;
  survivalRoundsRequired: number;
  hasEscapeRoute: boolean;
  hasBossSpawn: boolean;
  objectiveChainValid: boolean;
}

// ============================================================================
// GAME CONSTANTS FOR ANALYSIS
// ============================================================================

/**
 * Estimated rounds needed per action/objective type
 * These are conservative estimates assuming average luck and player skill
 */
const ROUNDS_PER_ACTION = {
  explore_tile: 1,          // Moving to and exploring a new tile
  find_item: 2,             // Average tiles to search before finding item
  kill_minion: 1,           // Killing a cultist/ghoul
  kill_elite: 2,            // Killing a stronger enemy
  kill_boss: 3,             // Killing a boss (accounting for combat rounds)
  collect_single: 1.5,      // Finding and picking up one collectible
  reach_exit: 2,            // Getting to exit once found
  perform_ritual: 1,        // Actually performing a ritual action
  find_specific_tile: 3,    // Finding a specific tile type (exit, altar, etc.)
};

/**
 * Average tiles that need to be explored to find specific items/tiles
 */
const AVERAGE_TILES_TO_FIND = {
  key: 4,                   // Keys are usually well-hidden
  exit: 5,                  // Exit typically spawns after some exploration
  altar: 4,                 // Ritual altars
  collectible: 2,           // Each collectible item
  clue: 2,                  // Investigation clues
};

/**
 * Player efficiency factor per difficulty
 * Lower difficulty = more efficient players (or we assume better luck)
 */
const EFFICIENCY_FACTOR: Record<string, number> = {
  Normal: 0.8,              // 80% efficiency - some buffer room
  Hard: 0.7,                // 70% efficiency - tighter margins
  Nightmare: 0.6            // 60% efficiency - very tight
};

// ============================================================================
// MAIN VALIDATION FUNCTION
// ============================================================================

/**
 * Validates whether a scenario is actually winnable
 * @param scenario - The scenario to validate
 * @returns ValidationResult with issues and analysis
 */
export function validateScenarioWinnability(scenario: Scenario): ValidationResult {
  const issues: ValidationIssue[] = [];
  const analysis = analyzeScenario(scenario);

  // Run all validation checks
  checkDoomTimerFeasibility(scenario, analysis, issues);
  checkResourceAvailability(scenario, analysis, issues);
  checkEnemySpawnConsistency(scenario, analysis, issues);
  checkObjectiveChainIntegrity(scenario, issues);
  checkSurvivalFeasibility(scenario, analysis, issues);
  checkCollectionFeasibility(scenario, analysis, issues);
  checkVictoryPathExists(scenario, analysis, issues);

  // Determine overall winnability
  const errors = issues.filter(i => i.severity === 'error');
  const warnings = issues.filter(i => i.severity === 'warning');

  const isWinnable = errors.length === 0;

  // Calculate confidence (100 = definitely winnable, 0 = definitely not)
  let confidence = 100;
  confidence -= errors.length * 40;  // Each error drops confidence significantly
  confidence -= warnings.length * 10; // Warnings are minor concerns
  confidence = Math.max(0, Math.min(100, confidence));

  return {
    isWinnable,
    confidence,
    issues,
    analysis
  };
}

// ============================================================================
// SCENARIO ANALYSIS
// ============================================================================

/**
 * Analyzes a scenario to extract key metrics
 */
function analyzeScenario(scenario: Scenario): ScenarioAnalysis {
  const requiredObjectives = scenario.objectives.filter(o => !o.isOptional);

  // Calculate estimated minimum rounds needed
  let estimatedMinRounds = 0;
  let requiredKills = 0;
  let requiredCollectibles = 0;
  let survivalRoundsRequired = 0;

  for (const obj of requiredObjectives) {
    switch (obj.type) {
      case 'find_item':
        estimatedMinRounds += ROUNDS_PER_ACTION.find_item;
        break;
      case 'find_tile':
        estimatedMinRounds += ROUNDS_PER_ACTION.find_specific_tile;
        break;
      case 'kill_enemy':
        requiredKills += obj.targetAmount || 1;
        estimatedMinRounds += (obj.targetAmount || 1) * ROUNDS_PER_ACTION.kill_minion;
        break;
      case 'kill_boss':
        requiredKills += 1;
        estimatedMinRounds += ROUNDS_PER_ACTION.kill_boss;
        break;
      case 'survive':
        survivalRoundsRequired = Math.max(survivalRoundsRequired, obj.targetAmount || 0);
        break;
      case 'collect':
        requiredCollectibles += obj.targetAmount || 1;
        estimatedMinRounds += (obj.targetAmount || 1) * ROUNDS_PER_ACTION.collect_single;
        break;
      case 'explore':
        estimatedMinRounds += (obj.targetAmount || 1) * ROUNDS_PER_ACTION.explore_tile;
        break;
      case 'escape':
        estimatedMinRounds += ROUNDS_PER_ACTION.reach_exit;
        break;
      case 'ritual':
        estimatedMinRounds += ROUNDS_PER_ACTION.perform_ritual;
        break;
      case 'interact':
        estimatedMinRounds += 1;
        break;
    }
  }

  // For survival, the minimum rounds IS the survival requirement
  if (survivalRoundsRequired > 0) {
    estimatedMinRounds = Math.max(estimatedMinRounds, survivalRoundsRequired);
  }

  // Calculate enemies from doom events
  let totalEnemiesFromEvents = 0;
  let hasBossSpawn = false;
  for (const event of scenario.doomEvents) {
    if (event.type === 'spawn_enemy') {
      totalEnemiesFromEvents += event.amount || 1;
    } else if (event.type === 'spawn_boss') {
      hasBossSpawn = true;
      totalEnemiesFromEvents += 1;
    }
  }

  // Calculate available collectibles (estimate based on typical spawn rates)
  // In a typical game, collectibles spawn in explored rooms
  const expectedExploredTiles = Math.floor(scenario.startDoom * 1.5); // Rough estimate
  const availableCollectibles = Math.floor(expectedExploredTiles * 0.3); // ~30% chance per tile

  // Apply efficiency factor for effective doom budget
  const efficiency = EFFICIENCY_FACTOR[scenario.difficulty] || 0.7;
  const effectiveDoomBudget = Math.floor(scenario.startDoom * efficiency);

  // Check for escape route
  const hasEscapeObjective = scenario.objectives.some(o => o.type === 'escape');
  const hasEscapeRoute = hasEscapeObjective || scenario.victoryType === 'escape';

  // Validate objective chain
  const objectiveChainValid = validateObjectiveChain(scenario.objectives);

  return {
    estimatedMinRounds,
    effectiveDoomBudget,
    totalEnemiesFromEvents,
    requiredKills,
    requiredCollectibles,
    availableCollectibles,
    survivalRoundsRequired,
    hasEscapeRoute,
    hasBossSpawn,
    objectiveChainValid
  };
}

/**
 * Validates that objective chains are properly connected
 */
function validateObjectiveChain(objectives: ScenarioObjective[]): boolean {
  const objectiveIds = new Set(objectives.map(o => o.id));

  for (const obj of objectives) {
    if (obj.revealedBy && !objectiveIds.has(obj.revealedBy)) {
      return false; // References non-existent objective
    }
  }

  // Check for circular dependencies
  for (const obj of objectives) {
    if (obj.revealedBy && hasCircularDependency(obj, objectives, new Set())) {
      return false;
    }
  }

  return true;
}

/**
 * Detects circular dependencies in objective chains
 */
function hasCircularDependency(
  obj: ScenarioObjective,
  allObjectives: ScenarioObjective[],
  visited: Set<string>
): boolean {
  if (visited.has(obj.id)) return true;
  if (!obj.revealedBy) return false;

  visited.add(obj.id);
  const parent = allObjectives.find(o => o.id === obj.revealedBy);
  if (!parent) return false;

  return hasCircularDependency(parent, allObjectives, visited);
}

// ============================================================================
// VALIDATION CHECKS
// ============================================================================

/**
 * Check 1: Doom Timer Feasibility
 * Can players complete objectives before doom runs out?
 */
function checkDoomTimerFeasibility(
  scenario: Scenario,
  analysis: ScenarioAnalysis,
  issues: ValidationIssue[]
): void {
  // Skip for survival missions - they have different logic
  if (scenario.victoryType === 'survival') {
    return;
  }

  const doomBuffer = analysis.effectiveDoomBudget - analysis.estimatedMinRounds;

  if (doomBuffer < 0) {
    issues.push({
      severity: 'error',
      code: 'DOOM_TOO_LOW',
      message: `Insufficient doom timer: Need ~${analysis.estimatedMinRounds} rounds but only have ${analysis.effectiveDoomBudget} effective rounds (${scenario.startDoom} doom * ${EFFICIENCY_FACTOR[scenario.difficulty]} efficiency)`,
      suggestion: `Increase startDoom to at least ${Math.ceil(analysis.estimatedMinRounds / EFFICIENCY_FACTOR[scenario.difficulty])}`,
      details: {
        startDoom: scenario.startDoom,
        estimatedMinRounds: analysis.estimatedMinRounds,
        effectiveBudget: analysis.effectiveDoomBudget
      }
    });
  } else if (doomBuffer < 2) {
    issues.push({
      severity: 'warning',
      code: 'DOOM_TIGHT',
      message: `Very tight doom margin: Only ${doomBuffer} buffer rounds for unexpected events`,
      suggestion: 'Consider increasing doom by 2-3 for more comfortable gameplay'
    });
  }
}

/**
 * Check 2: Resource Availability
 * Do required items/collectibles have a chance to spawn?
 */
function checkResourceAvailability(
  scenario: Scenario,
  analysis: ScenarioAnalysis,
  issues: ValidationIssue[]
): void {
  // Check key/item objectives
  const findItemObjectives = scenario.objectives.filter(
    o => o.type === 'find_item' && !o.isOptional
  );

  for (const obj of findItemObjectives) {
    // Items should always be spawnable, but check for specific issues
    if (!obj.targetId) {
      issues.push({
        severity: 'warning',
        code: 'MISSING_TARGET_ID',
        message: `Objective "${obj.shortDescription}" has no target item ID specified`,
        objectiveId: obj.id
      });
    }
  }

  // Check escape missions have exit mechanism
  if (scenario.victoryType === 'escape') {
    const hasExitObjective = scenario.objectives.some(
      o => o.type === 'escape' || o.type === 'find_tile'
    );
    const hasKeyObjective = scenario.objectives.some(
      o => o.type === 'find_item' && o.targetId?.includes('key')
    );

    if (!hasExitObjective && !hasKeyObjective) {
      issues.push({
        severity: 'warning',
        code: 'ESCAPE_PATH_UNCLEAR',
        message: 'Escape scenario has no clear exit or key objective',
        suggestion: 'Add find_item objective for key or find_tile for exit'
      });
    }
  }
}

/**
 * Check 3: Enemy Spawn Consistency
 * Do kill objectives match the enemies that will actually spawn?
 */
function checkEnemySpawnConsistency(
  scenario: Scenario,
  analysis: ScenarioAnalysis,
  issues: ValidationIssue[]
): void {
  if (analysis.requiredKills > 0) {
    // Check if doom events will spawn enough enemies
    if (analysis.totalEnemiesFromEvents < analysis.requiredKills) {
      issues.push({
        severity: 'error',
        code: 'INSUFFICIENT_ENEMY_SPAWNS',
        message: `Kill objective requires ${analysis.requiredKills} kills, but doom events only spawn ${analysis.totalEnemiesFromEvents} enemies`,
        suggestion: `Add more spawn_enemy doom events or reduce kill target to ${analysis.totalEnemiesFromEvents}`,
        details: {
          requiredKills: analysis.requiredKills,
          enemiesFromEvents: analysis.totalEnemiesFromEvents
        }
      });
    }
  }

  // Check assassination missions have boss spawn
  if (scenario.victoryType === 'assassination') {
    const hasBossKillObjective = scenario.objectives.some(o => o.type === 'kill_boss');

    if (hasBossKillObjective && !analysis.hasBossSpawn) {
      issues.push({
        severity: 'error',
        code: 'MISSING_BOSS_SPAWN',
        message: 'Assassination mission requires boss kill but no boss spawns in doom events',
        suggestion: 'Add a spawn_boss doom event'
      });
    }
  }

  // Check purge missions
  const purgeObjective = scenario.objectives.find(
    o => o.type === 'kill_enemy' && !o.isOptional && (o.targetAmount || 0) > 3
  );

  if (purgeObjective) {
    const requiredEnemies = purgeObjective.targetAmount || 0;

    if (analysis.totalEnemiesFromEvents < requiredEnemies) {
      issues.push({
        severity: 'error',
        code: 'PURGE_IMPOSSIBLE',
        message: `Purge objective requires ${requiredEnemies} enemy kills but only ${analysis.totalEnemiesFromEvents} will spawn`,
        suggestion: 'Increase enemy spawn amounts in doom events',
        objectiveId: purgeObjective.id
      });
    }
  }
}

/**
 * Check 4: Objective Chain Integrity
 * Are hidden objectives properly linked?
 */
function checkObjectiveChainIntegrity(
  scenario: Scenario,
  issues: ValidationIssue[]
): void {
  const objectiveIds = new Set(scenario.objectives.map(o => o.id));

  for (const obj of scenario.objectives) {
    // Check revealedBy references exist
    if (obj.revealedBy && !objectiveIds.has(obj.revealedBy)) {
      issues.push({
        severity: 'error',
        code: 'INVALID_REVEAL_REFERENCE',
        message: `Objective "${obj.shortDescription}" references non-existent parent "${obj.revealedBy}"`,
        objectiveId: obj.id
      });
    }

    // Check for hidden objectives without reveal triggers
    if (obj.isHidden && !obj.revealedBy && !obj.isOptional) {
      issues.push({
        severity: 'error',
        code: 'UNREVEALED_REQUIRED_OBJECTIVE',
        message: `Required objective "${obj.shortDescription}" is hidden but has no revealedBy trigger`,
        suggestion: 'Either add revealedBy or set isHidden to false',
        objectiveId: obj.id
      });
    }
  }

  // Check victory conditions reference valid objectives
  for (const condition of scenario.victoryConditions) {
    for (const reqObjId of condition.requiredObjectives) {
      if (!objectiveIds.has(reqObjId)) {
        issues.push({
          severity: 'error',
          code: 'INVALID_VICTORY_OBJECTIVE_REF',
          message: `Victory condition references non-existent objective "${reqObjId}"`,
          details: { conditionType: condition.type }
        });
      }
    }
  }
}

/**
 * Check 5: Survival Feasibility
 * Can players survive the required number of rounds?
 */
function checkSurvivalFeasibility(
  scenario: Scenario,
  analysis: ScenarioAnalysis,
  issues: ValidationIssue[]
): void {
  if (analysis.survivalRoundsRequired === 0) return;

  // For survival missions, doom should be HIGHER than required rounds
  // (doom decreases each round, players need to survive until requirement is met)
  if (scenario.startDoom < analysis.survivalRoundsRequired) {
    issues.push({
      severity: 'error',
      code: 'SURVIVAL_DOOM_MISMATCH',
      message: `Survival requires ${analysis.survivalRoundsRequired} rounds but doom is only ${scenario.startDoom}`,
      suggestion: `Increase startDoom to at least ${analysis.survivalRoundsRequired + 2}`,
      details: {
        survivalRequired: analysis.survivalRoundsRequired,
        startDoom: scenario.startDoom
      }
    });
  }

  // Check enemy pressure isn't overwhelming
  const enemiesPerRound = analysis.totalEnemiesFromEvents / analysis.survivalRoundsRequired;
  if (enemiesPerRound > 2) {
    issues.push({
      severity: 'warning',
      code: 'HIGH_ENEMY_PRESSURE',
      message: `High enemy spawn rate (~${enemiesPerRound.toFixed(1)}/round) during survival`,
      suggestion: 'Consider spreading enemy spawns more evenly'
    });
  }
}

/**
 * Check 6: Collection Feasibility
 * Can players collect enough items?
 */
function checkCollectionFeasibility(
  scenario: Scenario,
  analysis: ScenarioAnalysis,
  issues: ValidationIssue[]
): void {
  if (analysis.requiredCollectibles === 0) return;

  // Check if there's theoretically enough tiles to find collectibles
  if (analysis.availableCollectibles < analysis.requiredCollectibles) {
    issues.push({
      severity: 'warning',
      code: 'COLLECTION_UNLIKELY',
      message: `Collection objective requires ${analysis.requiredCollectibles} items but estimated availability is only ${analysis.availableCollectibles}`,
      suggestion: 'Consider reducing collection target or increasing doom timer for more exploration',
      details: {
        required: analysis.requiredCollectibles,
        estimated: analysis.availableCollectibles
      }
    });
  }

  // Check collection objectives have reasonable targets
  const collectionObjectives = scenario.objectives.filter(
    o => o.type === 'collect' && !o.isOptional
  );

  for (const obj of collectionObjectives) {
    if ((obj.targetAmount || 0) > 5) {
      issues.push({
        severity: 'warning',
        code: 'HIGH_COLLECTION_TARGET',
        message: `Collection objective "${obj.shortDescription}" has high target (${obj.targetAmount})`,
        suggestion: 'Consider reducing to 3-4 for better player experience',
        objectiveId: obj.id
      });
    }
  }
}

/**
 * Check 7: Victory Path Exists
 * Is there at least one way to win?
 */
function checkVictoryPathExists(
  scenario: Scenario,
  analysis: ScenarioAnalysis,
  issues: ValidationIssue[]
): void {
  // Check we have at least one victory condition
  if (scenario.victoryConditions.length === 0) {
    issues.push({
      severity: 'error',
      code: 'NO_VICTORY_CONDITIONS',
      message: 'Scenario has no victory conditions defined',
      suggestion: 'Add at least one victory condition'
    });
    return;
  }

  // Check at least one victory condition is achievable
  let hasAchievableCondition = false;

  for (const condition of scenario.victoryConditions) {
    const requiredObjs = condition.requiredObjectives
      .map(id => scenario.objectives.find(o => o.id === id))
      .filter((o): o is ScenarioObjective => o !== undefined);

    // Check all required objectives are defined and not impossible
    const allDefined = requiredObjs.length === condition.requiredObjectives.length;
    const noneImpossible = requiredObjs.every(o => !isObjectiveImpossible(o, scenario, analysis));

    if (allDefined && noneImpossible) {
      hasAchievableCondition = true;
      break;
    }
  }

  if (!hasAchievableCondition) {
    issues.push({
      severity: 'error',
      code: 'NO_ACHIEVABLE_VICTORY',
      message: 'No achievable victory condition found - all paths are blocked',
      suggestion: 'Review objective requirements and enemy spawns'
    });
  }
}

/**
 * Helper: Check if a specific objective is impossible to complete
 */
function isObjectiveImpossible(
  obj: ScenarioObjective,
  scenario: Scenario,
  analysis: ScenarioAnalysis
): boolean {
  switch (obj.type) {
    case 'kill_boss':
      // Impossible if no boss spawns
      return !analysis.hasBossSpawn;

    case 'kill_enemy':
      // Impossible if not enough enemies spawn
      return (obj.targetAmount || 1) > analysis.totalEnemiesFromEvents;

    case 'survive':
      // Impossible if doom is less than required rounds
      return (obj.targetAmount || 0) > scenario.startDoom;

    default:
      return false;
  }
}

// ============================================================================
// UTILITY FUNCTIONS FOR EXTERNAL USE
// ============================================================================

/**
 * Quick check if scenario passes basic validation
 * Use this for fast filtering before detailed analysis
 */
export function isScenarioBasicallyWinnable(scenario: Scenario): boolean {
  // Quick checks that don't require full analysis

  // Must have victory conditions
  if (scenario.victoryConditions.length === 0) return false;

  // Must have at least some doom
  if (scenario.startDoom < 3) return false;

  // Survival check
  const survivalObj = scenario.objectives.find(o => o.type === 'survive' && !o.isOptional);
  if (survivalObj && (survivalObj.targetAmount || 0) > scenario.startDoom) {
    return false;
  }

  // Boss check for assassination
  if (scenario.victoryType === 'assassination') {
    const hasBossSpawn = scenario.doomEvents.some(e => e.type === 'spawn_boss');
    if (!hasBossSpawn) return false;
  }

  return true;
}

/**
 * Get human-readable summary of validation result
 */
export function getValidationSummary(result: ValidationResult): string {
  if (result.isWinnable) {
    if (result.confidence >= 90) {
      return 'Scenario is definitely winnable with good strategy.';
    } else if (result.confidence >= 70) {
      return 'Scenario is winnable but may be challenging.';
    } else {
      return 'Scenario is technically winnable but has some concerns.';
    }
  } else {
    const errorCount = result.issues.filter(i => i.severity === 'error').length;
    return `Scenario is NOT winnable - ${errorCount} critical issue(s) found.`;
  }
}

/**
 * Auto-fix common issues in a scenario
 * Returns a fixed copy of the scenario
 */
export function autoFixScenario(scenario: Scenario): { fixed: Scenario; changes: string[] } {
  const changes: string[] = [];
  let fixed = { ...scenario, doomEvents: [...scenario.doomEvents], objectives: [...scenario.objectives] };

  // Fix 1: Survival doom mismatch
  const survivalObj = fixed.objectives.find(o => o.type === 'survive' && !o.isOptional);
  if (survivalObj && (survivalObj.targetAmount || 0) > fixed.startDoom) {
    const newDoom = (survivalObj.targetAmount || 0) + 4;
    changes.push(`Increased startDoom from ${fixed.startDoom} to ${newDoom} for survival feasibility`);
    fixed.startDoom = newDoom;
  }

  // Fix 2: Missing boss spawn for assassination
  if (fixed.victoryType === 'assassination') {
    const hasBossSpawn = fixed.doomEvents.some(e => e.type === 'spawn_boss');
    if (!hasBossSpawn) {
      const bossEvent: DoomEvent = {
        threshold: Math.ceil(fixed.startDoom * 0.3),
        triggered: false,
        type: 'spawn_boss',
        targetId: 'boss',
        amount: 1,
        message: 'The cult leader emerges from the shadows!'
      };
      fixed.doomEvents.push(bossEvent);
      changes.push('Added boss spawn event for assassination mission');
    }
  }

  // Fix 3: Insufficient enemy spawns for kill objectives
  const killObj = fixed.objectives.find(o => o.type === 'kill_enemy' && !o.isOptional);
  if (killObj && (killObj.targetAmount || 0) > 0) {
    const currentEnemies = fixed.doomEvents
      .filter(e => e.type === 'spawn_enemy')
      .reduce((sum, e) => sum + (e.amount || 0), 0);

    if (currentEnemies < (killObj.targetAmount || 0)) {
      const deficit = (killObj.targetAmount || 0) - currentEnemies;
      const newEvent: DoomEvent = {
        threshold: Math.ceil(fixed.startDoom * 0.6),
        triggered: false,
        type: 'spawn_enemy',
        targetId: killObj.targetId || 'cultist',
        amount: deficit,
        message: 'More enemies emerge!'
      };
      fixed.doomEvents.push(newEvent);
      changes.push(`Added enemy spawn event for ${deficit} additional enemies`);
    }
  }

  // Fix 4: Low doom for complexity
  const requiredObjectives = fixed.objectives.filter(o => !o.isOptional);
  const estimatedRounds = requiredObjectives.length * 2; // Rough estimate
  const minDoom = Math.ceil(estimatedRounds / 0.7); // Account for 70% efficiency

  if (fixed.startDoom < minDoom) {
    changes.push(`Increased startDoom from ${fixed.startDoom} to ${minDoom} for objective complexity`);
    fixed.startDoom = minDoom;
  }

  return { fixed, changes };
}

/**
 * Generate a validated scenario (loops until valid)
 * Use with caution - could theoretically loop forever with bad configuration
 */
export function generateValidatedScenario(
  generateFn: () => Scenario,
  maxAttempts: number = 10
): { scenario: Scenario; attempts: number; validation: ValidationResult } | null {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const scenario = generateFn();
    const validation = validateScenarioWinnability(scenario);

    if (validation.isWinnable) {
      return { scenario, attempts: attempt, validation };
    }

    // Try auto-fix
    const { fixed, changes } = autoFixScenario(scenario);
    if (changes.length > 0) {
      const revalidation = validateScenarioWinnability(fixed);
      if (revalidation.isWinnable) {
        return { scenario: fixed, attempts: attempt, validation: revalidation };
      }
    }
  }

  return null;
}
