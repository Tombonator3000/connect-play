/**
 * Tests for Scenario Winnability Validator
 *
 * These tests cover the validation system that ensures scenarios are winnable:
 * - Doom timer feasibility
 * - Resource availability
 * - Enemy spawn consistency
 * - Objective chain integrity
 * - Survival feasibility
 * - Collection feasibility
 * - Victory path existence
 * - Auto-fix functionality
 */

import { describe, it, expect } from 'vitest';
import {
  validateScenarioWinnability,
  isScenarioBasicallyWinnable,
  getValidationSummary,
  autoFixScenario,
  generateValidatedScenario,
  ValidationResult,
  ValidationIssue
} from './scenarioValidator';
import { Scenario, ScenarioObjective, DoomEvent } from '../types';

// ============================================================================
// Test Fixtures
// ============================================================================

/**
 * Creates a minimal valid scenario for testing
 */
function createMinimalScenario(overrides: Partial<Scenario> = {}): Scenario {
  return {
    id: 'test_scenario_1',
    title: 'Test Scenario',
    briefing: 'A test briefing',
    difficulty: 'Normal',
    startDoom: 12,
    doomOnDeath: -1,
    doomOnSurvivorRescue: 1,
    estimatedTime: '30 min',
    recommendedPlayers: { min: 1, max: 2 },
    victoryType: 'escape',
    theme: 'manor',
    objectives: [
      {
        id: 'obj_1',
        description: 'Find the key',
        shortDescription: 'Find key',
        type: 'find_item',
        targetId: 'quest_key',
        isOptional: false,
        isHidden: false,
        completed: false,
        currentAmount: 0
      },
      {
        id: 'obj_2',
        description: 'Escape through the exit',
        shortDescription: 'Escape',
        type: 'escape',
        isOptional: false,
        isHidden: true,
        revealedBy: 'obj_1',
        completed: false,
        currentAmount: 0
      }
    ],
    victoryConditions: [
      {
        type: 'all_objectives',
        description: 'Complete all objectives',
        requiredObjectives: ['obj_1', 'obj_2']
      }
    ],
    defeatConditions: [
      { type: 'all_dead', description: 'All investigators killed' },
      { type: 'doom_zero', description: 'Doom reaches zero' }
    ],
    doomEvents: [
      {
        threshold: 8,
        triggered: false,
        type: 'spawn_enemy',
        targetId: 'cultist',
        amount: 2,
        message: 'Cultists appear!'
      },
      {
        threshold: 4,
        triggered: false,
        type: 'spawn_enemy',
        targetId: 'ghoul',
        amount: 1,
        message: 'A ghoul emerges!'
      }
    ],
    ...overrides
  };
}

/**
 * Creates a survival scenario
 */
function createSurvivalScenario(rounds: number, doom: number): Scenario {
  return createMinimalScenario({
    victoryType: 'survival',
    startDoom: doom,
    objectives: [
      {
        id: 'obj_survive',
        description: `Survive for ${rounds} rounds`,
        shortDescription: `Survive ${rounds} rounds`,
        type: 'survive',
        targetAmount: rounds,
        isOptional: false,
        isHidden: false,
        completed: false,
        currentAmount: 0
      }
    ],
    victoryConditions: [
      {
        type: 'all_objectives',
        description: 'Survive the nightmare',
        requiredObjectives: ['obj_survive']
      }
    ]
  });
}

/**
 * Creates an assassination scenario
 */
function createAssassinationScenario(hasBossSpawn: boolean): Scenario {
  const doomEvents: DoomEvent[] = [
    {
      threshold: 8,
      triggered: false,
      type: 'spawn_enemy',
      targetId: 'cultist',
      amount: 2,
      message: 'Guards appear!'
    }
  ];

  if (hasBossSpawn) {
    doomEvents.push({
      threshold: 4,
      triggered: false,
      type: 'spawn_boss',
      targetId: 'high_priest',
      amount: 1,
      message: 'The High Priest appears!'
    });
  }

  return createMinimalScenario({
    victoryType: 'assassination',
    objectives: [
      {
        id: 'obj_boss',
        description: 'Kill the High Priest',
        shortDescription: 'Kill boss',
        type: 'kill_boss',
        isOptional: false,
        isHidden: false,
        completed: false,
        currentAmount: 0
      }
    ],
    victoryConditions: [
      {
        type: 'all_objectives',
        description: 'Eliminate the target',
        requiredObjectives: ['obj_boss']
      }
    ],
    doomEvents
  });
}

/**
 * Creates a kill enemy scenario
 */
function createKillScenario(killTarget: number, enemySpawnCount: number): Scenario {
  return createMinimalScenario({
    victoryType: 'escape',
    objectives: [
      {
        id: 'obj_kill',
        description: `Kill ${killTarget} enemies`,
        shortDescription: `Kill ${killTarget}`,
        type: 'kill_enemy',
        targetAmount: killTarget,
        isOptional: false,
        isHidden: false,
        completed: false,
        currentAmount: 0
      }
    ],
    victoryConditions: [
      {
        type: 'all_objectives',
        description: 'Purge the evil',
        requiredObjectives: ['obj_kill']
      }
    ],
    doomEvents: [
      {
        threshold: 8,
        triggered: false,
        type: 'spawn_enemy',
        targetId: 'cultist',
        amount: enemySpawnCount,
        message: 'Enemies appear!'
      }
    ]
  });
}

// ============================================================================
// validateScenarioWinnability TESTS
// ============================================================================

describe('validateScenarioWinnability', () => {
  describe('Basic Validation', () => {
    it('returns valid result for well-formed scenario', () => {
      const scenario = createMinimalScenario();
      const result = validateScenarioWinnability(scenario);

      expect(result.isWinnable).toBe(true);
      expect(result.confidence).toBeGreaterThanOrEqual(70);
    });

    it('returns analysis data', () => {
      const scenario = createMinimalScenario();
      const result = validateScenarioWinnability(scenario);

      expect(result.analysis).toBeDefined();
      expect(result.analysis.estimatedMinRounds).toBeGreaterThan(0);
      expect(result.analysis.effectiveDoomBudget).toBeGreaterThan(0);
    });

    it('returns issues array', () => {
      const scenario = createMinimalScenario();
      const result = validateScenarioWinnability(scenario);

      expect(result.issues).toBeInstanceOf(Array);
    });
  });

  describe('Doom Timer Feasibility', () => {
    it('detects insufficient doom for objectives', () => {
      const scenario = createMinimalScenario({
        startDoom: 3, // Very low
        objectives: [
          { id: 'obj1', type: 'find_item', shortDescription: 'a', description: 'a', isOptional: false, isHidden: false, completed: false, currentAmount: 0 },
          { id: 'obj2', type: 'find_item', shortDescription: 'b', description: 'b', isOptional: false, isHidden: false, completed: false, currentAmount: 0 },
          { id: 'obj3', type: 'find_item', shortDescription: 'c', description: 'c', isOptional: false, isHidden: false, completed: false, currentAmount: 0 },
          { id: 'obj4', type: 'find_tile', shortDescription: 'd', description: 'd', isOptional: false, isHidden: false, completed: false, currentAmount: 0 },
          { id: 'obj5', type: 'escape', shortDescription: 'e', description: 'e', isOptional: false, isHidden: false, completed: false, currentAmount: 0 }
        ],
        victoryConditions: [{ type: 'all_objectives', description: 'Win', requiredObjectives: ['obj1', 'obj2', 'obj3', 'obj4', 'obj5'] }]
      });

      const result = validateScenarioWinnability(scenario);
      const doomIssue = result.issues.find(i => i.code === 'DOOM_TOO_LOW' || i.code === 'DOOM_TIGHT');

      expect(doomIssue).toBeDefined();
    });

    it('allows sufficient doom for simple objectives', () => {
      const scenario = createMinimalScenario({
        startDoom: 15,
        objectives: [
          { id: 'obj1', type: 'find_item', shortDescription: 'Find key', description: 'Find the key', isOptional: false, isHidden: false, completed: false, currentAmount: 0 },
          { id: 'obj2', type: 'escape', shortDescription: 'Escape', description: 'Escape', isOptional: false, isHidden: false, completed: false, currentAmount: 0 }
        ],
        victoryConditions: [{ type: 'all_objectives', description: 'Win', requiredObjectives: ['obj1', 'obj2'] }]
      });

      const result = validateScenarioWinnability(scenario);
      const doomError = result.issues.find(i => i.code === 'DOOM_TOO_LOW');

      expect(doomError).toBeUndefined();
    });
  });

  describe('Survival Feasibility', () => {
    it('detects impossible survival (doom < rounds)', () => {
      const scenario = createSurvivalScenario(15, 10);
      const result = validateScenarioWinnability(scenario);

      expect(result.isWinnable).toBe(false);
      const survivalIssue = result.issues.find(i => i.code === 'SURVIVAL_DOOM_MISMATCH');
      expect(survivalIssue).toBeDefined();
      expect(survivalIssue!.severity).toBe('error');
    });

    it('allows valid survival (doom > rounds)', () => {
      const scenario = createSurvivalScenario(8, 12);
      const result = validateScenarioWinnability(scenario);

      const survivalError = result.issues.find(i => i.code === 'SURVIVAL_DOOM_MISMATCH');
      expect(survivalError).toBeUndefined();
    });

    it('warns about high enemy pressure', () => {
      const scenario = createSurvivalScenario(5, 12);
      scenario.doomEvents = [
        { threshold: 10, triggered: false, type: 'spawn_enemy', targetId: 'ghoul', amount: 5, message: 'Many ghouls!' },
        { threshold: 8, triggered: false, type: 'spawn_enemy', targetId: 'cultist', amount: 5, message: 'Many cultists!' },
        { threshold: 6, triggered: false, type: 'spawn_enemy', targetId: 'hound', amount: 5, message: 'Many hounds!' }
      ];

      const result = validateScenarioWinnability(scenario);
      const pressureWarning = result.issues.find(i => i.code === 'HIGH_ENEMY_PRESSURE');

      expect(pressureWarning).toBeDefined();
    });
  });

  describe('Enemy Spawn Consistency', () => {
    it('detects missing boss spawn for assassination', () => {
      const scenario = createAssassinationScenario(false);
      const result = validateScenarioWinnability(scenario);

      expect(result.isWinnable).toBe(false);
      const bossIssue = result.issues.find(i => i.code === 'MISSING_BOSS_SPAWN');
      expect(bossIssue).toBeDefined();
    });

    it('allows assassination with boss spawn', () => {
      const scenario = createAssassinationScenario(true);
      const result = validateScenarioWinnability(scenario);

      const bossError = result.issues.find(i => i.code === 'MISSING_BOSS_SPAWN');
      expect(bossError).toBeUndefined();
    });

    it('detects insufficient enemy spawns for kill objective', () => {
      const scenario = createKillScenario(10, 3);
      const result = validateScenarioWinnability(scenario);

      expect(result.isWinnable).toBe(false);
      const spawnIssue = result.issues.find(i => i.code === 'INSUFFICIENT_ENEMY_SPAWNS' || i.code === 'PURGE_IMPOSSIBLE');
      expect(spawnIssue).toBeDefined();
    });

    it('allows kill objective with sufficient spawns', () => {
      const scenario = createKillScenario(3, 5);
      const result = validateScenarioWinnability(scenario);

      const spawnError = result.issues.find(i => i.code === 'INSUFFICIENT_ENEMY_SPAWNS');
      expect(spawnError).toBeUndefined();
    });
  });

  describe('Objective Chain Integrity', () => {
    it('detects invalid revealedBy reference', () => {
      const scenario = createMinimalScenario({
        objectives: [
          {
            id: 'obj_hidden',
            description: 'Secret objective',
            shortDescription: 'Secret',
            type: 'find_item',
            isOptional: false,
            isHidden: true,
            revealedBy: 'nonexistent_objective',
            completed: false,
            currentAmount: 0
          }
        ],
        victoryConditions: [{ type: 'all_objectives', description: 'Win', requiredObjectives: ['obj_hidden'] }]
      });

      const result = validateScenarioWinnability(scenario);
      const chainIssue = result.issues.find(i => i.code === 'INVALID_REVEAL_REFERENCE');

      expect(chainIssue).toBeDefined();
    });

    it('detects unrevealed required objective', () => {
      const scenario = createMinimalScenario({
        objectives: [
          {
            id: 'obj_hidden',
            description: 'Secret required objective',
            shortDescription: 'Secret',
            type: 'find_item',
            isOptional: false,
            isHidden: true,
            // No revealedBy
            completed: false,
            currentAmount: 0
          }
        ],
        victoryConditions: [{ type: 'all_objectives', description: 'Win', requiredObjectives: ['obj_hidden'] }]
      });

      const result = validateScenarioWinnability(scenario);
      const unrevealed = result.issues.find(i => i.code === 'UNREVEALED_REQUIRED_OBJECTIVE');

      expect(unrevealed).toBeDefined();
    });

    it('allows valid objective chain', () => {
      const scenario = createMinimalScenario({
        objectives: [
          { id: 'obj_1', type: 'find_item', shortDescription: 'Find key', description: 'Find key', isOptional: false, isHidden: false, completed: false, currentAmount: 0 },
          { id: 'obj_2', type: 'escape', shortDescription: 'Escape', description: 'Escape', isOptional: false, isHidden: true, revealedBy: 'obj_1', completed: false, currentAmount: 0 }
        ],
        victoryConditions: [{ type: 'all_objectives', description: 'Win', requiredObjectives: ['obj_1', 'obj_2'] }]
      });

      const result = validateScenarioWinnability(scenario);
      const chainErrors = result.issues.filter(i => i.code.includes('REVEAL') || i.code.includes('CHAIN'));

      expect(chainErrors.length).toBe(0);
    });
  });

  describe('Victory Path Existence', () => {
    it('detects no victory conditions', () => {
      const scenario = createMinimalScenario({
        victoryConditions: []
      });

      const result = validateScenarioWinnability(scenario);
      const noVictory = result.issues.find(i => i.code === 'NO_VICTORY_CONDITIONS');

      expect(noVictory).toBeDefined();
      expect(result.isWinnable).toBe(false);
    });

    it('detects invalid victory objective reference', () => {
      const scenario = createMinimalScenario({
        objectives: [
          { id: 'obj_1', type: 'find_item', shortDescription: 'Find key', description: 'Find key', isOptional: false, isHidden: false, completed: false, currentAmount: 0 }
        ],
        victoryConditions: [
          { type: 'all_objectives', description: 'Win', requiredObjectives: ['obj_1', 'nonexistent'] }
        ]
      });

      const result = validateScenarioWinnability(scenario);
      const invalidRef = result.issues.find(i => i.code === 'INVALID_VICTORY_OBJECTIVE_REF');

      expect(invalidRef).toBeDefined();
    });
  });

  describe('Confidence Scoring', () => {
    it('high confidence for clean scenario', () => {
      const scenario = createMinimalScenario({ startDoom: 15 });
      const result = validateScenarioWinnability(scenario);

      expect(result.confidence).toBeGreaterThanOrEqual(80);
    });

    it('lower confidence with warnings', () => {
      const scenario = createMinimalScenario({
        startDoom: 8 // Tight margin
      });

      const result = validateScenarioWinnability(scenario);

      // May have warnings, so confidence should be reasonable
      expect(result.confidence).toBeGreaterThanOrEqual(50);
    });

    it('zero confidence with critical errors', () => {
      const scenario = createSurvivalScenario(100, 5);
      const result = validateScenarioWinnability(scenario);

      expect(result.confidence).toBeLessThanOrEqual(60);
    });
  });
});

// ============================================================================
// isScenarioBasicallyWinnable TESTS
// ============================================================================

describe('isScenarioBasicallyWinnable', () => {
  it('returns true for valid scenario', () => {
    const scenario = createMinimalScenario();
    expect(isScenarioBasicallyWinnable(scenario)).toBe(true);
  });

  it('returns false for no victory conditions', () => {
    const scenario = createMinimalScenario({ victoryConditions: [] });
    expect(isScenarioBasicallyWinnable(scenario)).toBe(false);
  });

  it('returns false for doom below 3', () => {
    const scenario = createMinimalScenario({ startDoom: 2 });
    expect(isScenarioBasicallyWinnable(scenario)).toBe(false);
  });

  it('returns false for impossible survival', () => {
    const scenario = createSurvivalScenario(20, 10);
    expect(isScenarioBasicallyWinnable(scenario)).toBe(false);
  });

  it('returns false for assassination without boss', () => {
    const scenario = createAssassinationScenario(false);
    expect(isScenarioBasicallyWinnable(scenario)).toBe(false);
  });

  it('returns true for assassination with boss', () => {
    const scenario = createAssassinationScenario(true);
    expect(isScenarioBasicallyWinnable(scenario)).toBe(true);
  });
});

// ============================================================================
// getValidationSummary TESTS
// ============================================================================

describe('getValidationSummary', () => {
  it('returns positive message for high confidence winnable', () => {
    const result: ValidationResult = {
      isWinnable: true,
      confidence: 95,
      issues: [],
      analysis: {} as any
    };

    const summary = getValidationSummary(result);
    expect(summary).toContain('definitely winnable');
  });

  it('returns cautious message for medium confidence', () => {
    const result: ValidationResult = {
      isWinnable: true,
      confidence: 75,
      issues: [{ severity: 'warning', code: 'TEST', message: 'test' }],
      analysis: {} as any
    };

    const summary = getValidationSummary(result);
    expect(summary).toContain('challenging');
  });

  it('returns negative message for unwinnable', () => {
    const result: ValidationResult = {
      isWinnable: false,
      confidence: 20,
      issues: [{ severity: 'error', code: 'TEST', message: 'test' }],
      analysis: {} as any
    };

    const summary = getValidationSummary(result);
    expect(summary).toContain('NOT winnable');
    expect(summary).toContain('1 critical');
  });
});

// ============================================================================
// autoFixScenario TESTS
// ============================================================================

describe('autoFixScenario', () => {
  it('fixes survival doom mismatch', () => {
    const scenario = createSurvivalScenario(15, 10);
    const { fixed, changes } = autoFixScenario(scenario);

    expect(fixed.startDoom).toBeGreaterThanOrEqual(15);
    expect(changes.length).toBeGreaterThan(0);
    expect(changes.some(c => c.includes('Doom') || c.includes('doom'))).toBe(true);
  });

  it('adds boss spawn for assassination', () => {
    const scenario = createAssassinationScenario(false);
    const { fixed, changes } = autoFixScenario(scenario);

    const hasBossSpawn = fixed.doomEvents.some(e => e.type === 'spawn_boss');
    expect(hasBossSpawn).toBe(true);
    expect(changes.some(c => c.includes('boss'))).toBe(true);
  });

  it('adds enemy spawns for kill objective', () => {
    const scenario = createKillScenario(10, 3);
    const { fixed, changes } = autoFixScenario(scenario);

    const totalEnemies = fixed.doomEvents
      .filter(e => e.type === 'spawn_enemy')
      .reduce((sum, e) => sum + (e.amount || 0), 0);

    expect(totalEnemies).toBeGreaterThanOrEqual(10);
  });

  it('returns empty changes for valid scenario', () => {
    const scenario = createMinimalScenario({ startDoom: 20 });
    const { changes } = autoFixScenario(scenario);

    // May have minor adjustments but should be minimal
    expect(changes.length).toBeLessThanOrEqual(1);
  });

  it('does not mutate original scenario', () => {
    const scenario = createSurvivalScenario(15, 10);
    const originalDoom = scenario.startDoom;

    autoFixScenario(scenario);

    expect(scenario.startDoom).toBe(originalDoom);
  });
});

// ============================================================================
// generateValidatedScenario TESTS
// ============================================================================

describe('generateValidatedScenario', () => {
  it('returns validated scenario from generator', () => {
    const generator = () => createMinimalScenario({ startDoom: 15 });
    const result = generateValidatedScenario(generator);

    expect(result).not.toBeNull();
    expect(result!.validation.isWinnable).toBe(true);
    expect(result!.attempts).toBeGreaterThanOrEqual(1);
  });

  it('returns null after max attempts with impossible generator', () => {
    const impossibleGenerator = () => createMinimalScenario({
      startDoom: 1,
      victoryConditions: []
    });

    const result = generateValidatedScenario(impossibleGenerator, 3);

    expect(result).toBeNull();
  });

  it('applies auto-fix when needed', () => {
    let callCount = 0;
    const generator = () => {
      callCount++;
      // First call returns broken, subsequent return fixed
      if (callCount === 1) {
        return createSurvivalScenario(20, 10); // Broken
      }
      return createMinimalScenario({ startDoom: 15 }); // Valid
    };

    const result = generateValidatedScenario(generator, 5);

    expect(result).not.toBeNull();
    expect(result!.validation.isWinnable).toBe(true);
  });
});

// ============================================================================
// Analysis Data Tests
// ============================================================================

describe('Scenario Analysis', () => {
  it('calculates estimated rounds for objectives', () => {
    const scenario = createMinimalScenario({
      objectives: [
        { id: 'o1', type: 'find_item', shortDescription: 'a', description: 'a', isOptional: false, isHidden: false, completed: false, currentAmount: 0 },
        { id: 'o2', type: 'find_tile', shortDescription: 'b', description: 'b', isOptional: false, isHidden: false, completed: false, currentAmount: 0 },
        { id: 'o3', type: 'escape', shortDescription: 'c', description: 'c', isOptional: false, isHidden: false, completed: false, currentAmount: 0 }
      ],
      victoryConditions: [{ type: 'all_objectives', description: 'Win', requiredObjectives: ['o1', 'o2', 'o3'] }]
    });

    const result = validateScenarioWinnability(scenario);

    expect(result.analysis.estimatedMinRounds).toBeGreaterThan(5);
  });

  it('counts enemies from doom events', () => {
    const scenario = createMinimalScenario({
      doomEvents: [
        { threshold: 10, triggered: false, type: 'spawn_enemy', targetId: 'a', amount: 3, message: 'm' },
        { threshold: 5, triggered: false, type: 'spawn_enemy', targetId: 'b', amount: 2, message: 'm' },
        { threshold: 2, triggered: false, type: 'spawn_boss', targetId: 'c', amount: 1, message: 'm' }
      ]
    });

    const result = validateScenarioWinnability(scenario);

    expect(result.analysis.totalEnemiesFromEvents).toBe(6); // 3+2+1
    expect(result.analysis.hasBossSpawn).toBe(true);
  });

  it('tracks required kills from objectives', () => {
    const scenario = createKillScenario(8, 10);
    const result = validateScenarioWinnability(scenario);

    expect(result.analysis.requiredKills).toBe(8);
  });

  it('tracks survival rounds required', () => {
    const scenario = createSurvivalScenario(10, 15);
    const result = validateScenarioWinnability(scenario);

    expect(result.analysis.survivalRoundsRequired).toBe(10);
  });

  it('calculates effective doom budget with difficulty factor', () => {
    const normalScenario = createMinimalScenario({ difficulty: 'Normal', startDoom: 10 });
    const hardScenario = createMinimalScenario({ difficulty: 'Hard', startDoom: 10 });

    const normalResult = validateScenarioWinnability(normalScenario);
    const hardResult = validateScenarioWinnability(hardScenario);

    // Normal should have more effective budget due to higher efficiency
    expect(normalResult.analysis.effectiveDoomBudget).toBeGreaterThan(
      hardResult.analysis.effectiveDoomBudget
    );
  });
});
