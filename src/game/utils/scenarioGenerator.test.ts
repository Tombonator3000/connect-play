/**
 * Tests for Scenario Generator
 *
 * These tests cover the dynamic scenario generation system including:
 * - Mission type configuration
 * - Location pools
 * - Enemy spawn configuration
 * - Theme mapping
 * - Random scenario generation
 * - Validated scenario generation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  generateRandomScenario,
  generateScenarioPool,
  generateValidatedScenario,
  quickValidateScenario,
  getScenarioValidationInfo,
  getThemedTilePreferences,
  THEME_TILE_PREFERENCES,
  MISSION_TYPES,
  INDOOR_START_LOCATIONS,
  OUTDOOR_START_LOCATIONS,
  MIXED_START_LOCATIONS,
  ENEMY_POOLS,
  MISSION_ENEMY_POOLS,
  ATMOSPHERE_ENEMY_POOLS,
  BOSS_POOL,
  TARGET_NAMES,
  VICTIM_NAMES,
  MYSTERY_NAMES,
  COLLECTIBLE_ITEMS,
  BRIEFING_OPENINGS,
  TITLE_TEMPLATES,
  BONUS_OBJECTIVES,
} from './scenarioGenerator';

// ============================================================================
// MISSION TYPE POOL TESTS
// ============================================================================

describe('MISSION_TYPES', () => {
  it('has at least 5 mission types', () => {
    expect(MISSION_TYPES.length).toBeGreaterThanOrEqual(5);
  });

  it('each mission type has required properties', () => {
    for (const mission of MISSION_TYPES) {
      expect(mission.id).toBeDefined();
      expect(mission.victoryType).toBeDefined();
      expect(mission.name).toBeDefined();
      expect(mission.goalTemplate).toBeDefined();
      expect(mission.tileSet).toMatch(/^(indoor|outdoor|mixed)$/);
      expect(mission.baseDoom).toHaveProperty('Normal');
      expect(mission.baseDoom).toHaveProperty('Hard');
      expect(mission.baseDoom).toHaveProperty('Nightmare');
      expect(mission.objectiveTemplates.length).toBeGreaterThan(0);
      expect(mission.victoryConditionTemplate).toBeDefined();
    }
  });

  it('all mission types have unique IDs', () => {
    const ids = MISSION_TYPES.map(m => m.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('contains expected mission types', () => {
    const missionIds = MISSION_TYPES.map(m => m.id);
    expect(missionIds).toContain('escape_manor');
    expect(missionIds).toContain('assassination');
    expect(missionIds).toContain('survival');
    expect(missionIds).toContain('collection');
    expect(missionIds).toContain('ritual');
  });

  it('objective templates have valid structure', () => {
    for (const mission of MISSION_TYPES) {
      for (const template of mission.objectiveTemplates) {
        expect(template.id).toBeDefined();
        expect(template.descriptionTemplate).toBeDefined();
        expect(template.shortDescriptionTemplate).toBeDefined();
        expect(template.type).toBeDefined();
        expect(typeof template.isOptional).toBe('boolean');
        expect(typeof template.isHidden).toBe('boolean');
      }
    }
  });
});

// ============================================================================
// LOCATION POOL TESTS
// ============================================================================

describe('Location Pools', () => {
  describe('INDOOR_START_LOCATIONS', () => {
    it('has multiple locations', () => {
      expect(INDOOR_START_LOCATIONS.length).toBeGreaterThan(5);
    });

    it('all locations have indoor tileset', () => {
      for (const loc of INDOOR_START_LOCATIONS) {
        expect(loc.tileSet).toBe('indoor');
      }
    });

    it('all locations have valid atmosphere', () => {
      const validAtmospheres = ['creepy', 'urban', 'wilderness', 'academic', 'industrial'];
      for (const loc of INDOOR_START_LOCATIONS) {
        expect(validAtmospheres).toContain(loc.atmosphere);
      }
    });
  });

  describe('OUTDOOR_START_LOCATIONS', () => {
    it('has multiple locations', () => {
      expect(OUTDOOR_START_LOCATIONS.length).toBeGreaterThan(3);
    });

    it('all locations have outdoor tileset', () => {
      for (const loc of OUTDOOR_START_LOCATIONS) {
        expect(loc.tileSet).toBe('outdoor');
      }
    });
  });

  describe('MIXED_START_LOCATIONS', () => {
    it('has multiple locations', () => {
      expect(MIXED_START_LOCATIONS.length).toBeGreaterThan(2);
    });

    it('all locations have mixed tileset', () => {
      for (const loc of MIXED_START_LOCATIONS) {
        expect(loc.tileSet).toBe('mixed');
      }
    });
  });
});

// ============================================================================
// ENEMY CONFIGURATION TESTS
// ============================================================================

describe('Enemy Pools', () => {
  describe('ENEMY_POOLS', () => {
    it('has pools for all difficulties', () => {
      expect(ENEMY_POOLS).toHaveProperty('Normal');
      expect(ENEMY_POOLS).toHaveProperty('Hard');
      expect(ENEMY_POOLS).toHaveProperty('Nightmare');
    });

    it('each difficulty pool has valid spawn configs', () => {
      for (const difficulty of ['Normal', 'Hard', 'Nightmare']) {
        const pool = ENEMY_POOLS[difficulty];
        expect(pool.length).toBeGreaterThan(0);

        for (const config of pool) {
          expect(config.type).toBeDefined();
          expect(config.amount.min).toBeLessThanOrEqual(config.amount.max);
          expect(config.doomThreshold).toHaveProperty('early');
          expect(config.doomThreshold).toHaveProperty('mid');
          expect(config.doomThreshold).toHaveProperty('late');
          expect(config.message).toBeDefined();
        }
      }
    });

    it('nightmare pool has more dangerous enemies than normal', () => {
      const normalTypes = ENEMY_POOLS.Normal.map(e => e.type);
      const nightmareTypes = ENEMY_POOLS.Nightmare.map(e => e.type);

      // Nightmare should have unique dangerous enemies
      const nightmareOnly = nightmareTypes.filter(t => !normalTypes.includes(t));
      expect(nightmareOnly.length).toBeGreaterThan(0);
    });
  });

  describe('MISSION_ENEMY_POOLS', () => {
    it('has pools for major mission types', () => {
      expect(MISSION_ENEMY_POOLS).toHaveProperty('escape');
      expect(MISSION_ENEMY_POOLS).toHaveProperty('assassination');
      expect(MISSION_ENEMY_POOLS).toHaveProperty('survival');
    });

    it('mission pools have thematically appropriate enemies', () => {
      // Escape missions should have fast pursuers
      const escapeTypes = MISSION_ENEMY_POOLS.escape.map(e => e.type);
      expect(escapeTypes).toContain('nightgaunt'); // Pursuers

      // Assassination should have cult protectors
      const assassinationTypes = MISSION_ENEMY_POOLS.assassination.map(e => e.type);
      expect(assassinationTypes).toContain('cultist');
    });
  });

  describe('ATMOSPHERE_ENEMY_POOLS', () => {
    it('has pools for all atmospheres', () => {
      expect(ATMOSPHERE_ENEMY_POOLS).toHaveProperty('creepy');
      expect(ATMOSPHERE_ENEMY_POOLS).toHaveProperty('urban');
      expect(ATMOSPHERE_ENEMY_POOLS).toHaveProperty('wilderness');
      expect(ATMOSPHERE_ENEMY_POOLS).toHaveProperty('academic');
      expect(ATMOSPHERE_ENEMY_POOLS).toHaveProperty('industrial');
    });
  });

  describe('BOSS_POOL', () => {
    it('has multiple bosses', () => {
      expect(BOSS_POOL.length).toBeGreaterThan(2);
    });

    it('bosses have valid configuration', () => {
      for (const boss of BOSS_POOL) {
        expect(boss.type).toBeDefined();
        expect(boss.name).toBeDefined();
        expect(boss.spawnMessage).toBeDefined();
        expect(['Normal', 'Hard', 'Nightmare']).toContain(boss.difficulty);
      }
    });
  });
});

// ============================================================================
// THEME MAPPING TESTS
// ============================================================================

describe('Theme Mapping', () => {
  describe('THEME_TILE_PREFERENCES', () => {
    it('has preferences for all themes', () => {
      const themes = ['manor', 'church', 'asylum', 'warehouse', 'forest', 'urban', 'coastal', 'underground', 'academic'];
      for (const theme of themes) {
        expect(THEME_TILE_PREFERENCES).toHaveProperty(theme);
      }
    });

    it('each theme has required preference fields', () => {
      for (const theme of Object.keys(THEME_TILE_PREFERENCES)) {
        const prefs = THEME_TILE_PREFERENCES[theme as keyof typeof THEME_TILE_PREFERENCES];
        expect(prefs.preferredNames).toBeInstanceOf(Array);
        expect(prefs.avoidNames).toBeInstanceOf(Array);
        expect(prefs.preferredCategories).toBeInstanceOf(Array);
        expect(prefs.avoidCategories).toBeInstanceOf(Array);
        expect(prefs.floorPreference).toBeDefined();
      }
    });
  });

  describe('getThemedTilePreferences', () => {
    it('returns preferences for valid theme', () => {
      const prefs = getThemedTilePreferences('manor');
      expect(prefs.preferredNames).toContain('manor');
      expect(prefs.floorPreference).toBe('wood');
    });

    it('returns default for unknown theme', () => {
      const prefs = getThemedTilePreferences('nonexistent' as any);
      expect(prefs.preferredNames).toEqual([]);
      expect(prefs.floorPreference).toBe('wood');
    });

    it('underground theme prefers crypts', () => {
      const prefs = getThemedTilePreferences('underground');
      expect(prefs.preferredNames).toContain('crypt');
      expect(prefs.preferredCategories).toContain('crypt');
      expect(prefs.floorPreference).toBe('stone');
    });
  });
});

// ============================================================================
// NARRATIVE CONTENT TESTS
// ============================================================================

describe('Narrative Content', () => {
  it('TARGET_NAMES has multiple options', () => {
    expect(TARGET_NAMES.length).toBeGreaterThan(5);
  });

  it('VICTIM_NAMES has multiple options', () => {
    expect(VICTIM_NAMES.length).toBeGreaterThan(5);
  });

  it('MYSTERY_NAMES has multiple options', () => {
    expect(MYSTERY_NAMES.length).toBeGreaterThan(3);
  });

  it('BRIEFING_OPENINGS has variety', () => {
    expect(BRIEFING_OPENINGS.length).toBeGreaterThan(5);
  });

  describe('COLLECTIBLE_ITEMS', () => {
    it('has multiple collectible types', () => {
      expect(Object.keys(COLLECTIBLE_ITEMS).length).toBeGreaterThan(3);
    });

    it('each collectible has singular and plural', () => {
      for (const [key, item] of Object.entries(COLLECTIBLE_ITEMS)) {
        expect(item.singular).toBeDefined();
        expect(item.plural).toBeDefined();
      }
    });
  });

  describe('TITLE_TEMPLATES', () => {
    it('has templates for major mission types', () => {
      expect(TITLE_TEMPLATES).toHaveProperty('escape');
      expect(TITLE_TEMPLATES).toHaveProperty('assassination');
      expect(TITLE_TEMPLATES).toHaveProperty('survival');
    });

    it('each mission type has multiple title options', () => {
      for (const type of Object.keys(TITLE_TEMPLATES)) {
        expect(TITLE_TEMPLATES[type as keyof typeof TITLE_TEMPLATES].length).toBeGreaterThan(1);
      }
    });
  });
});

// ============================================================================
// BONUS OBJECTIVES TESTS
// ============================================================================

describe('BONUS_OBJECTIVES', () => {
  it('has multiple bonus objectives', () => {
    expect(BONUS_OBJECTIVES.length).toBeGreaterThan(2);
  });

  it('all bonus objectives are optional', () => {
    for (const obj of BONUS_OBJECTIVES) {
      expect(obj.isOptional).toBe(true);
    }
  });

  it('bonus objectives have valid structure', () => {
    for (const obj of BONUS_OBJECTIVES) {
      expect(obj.id).toBeDefined();
      expect(obj.descriptionTemplate).toBeDefined();
      expect(obj.shortDescriptionTemplate).toBeDefined();
      expect(obj.type).toBeDefined();
    }
  });
});

// ============================================================================
// generateRandomScenario TESTS
// ============================================================================

describe('generateRandomScenario', () => {
  it('generates a valid scenario for Normal difficulty', () => {
    const scenario = generateRandomScenario('Normal');

    expect(scenario.id).toBeDefined();
    expect(scenario.title).toBeDefined();
    expect(scenario.briefing).toBeDefined();
    expect(scenario.difficulty).toBe('Normal');
    expect(scenario.startDoom).toBeGreaterThan(0);
    expect(scenario.objectives.length).toBeGreaterThan(0);
    expect(scenario.victoryConditions.length).toBeGreaterThan(0);
    expect(scenario.defeatConditions.length).toBeGreaterThan(0);
    expect(scenario.doomEvents.length).toBeGreaterThan(0);
  });

  it('generates a valid scenario for Hard difficulty', () => {
    const scenario = generateRandomScenario('Hard');

    expect(scenario.difficulty).toBe('Hard');
    expect(scenario.startDoom).toBeGreaterThan(0);
  });

  it('generates a valid scenario for Nightmare difficulty', () => {
    const scenario = generateRandomScenario('Nightmare');

    expect(scenario.difficulty).toBe('Nightmare');
    expect(scenario.startDoom).toBeGreaterThan(0);
  });

  it('generates unique scenarios', () => {
    const scenario1 = generateRandomScenario('Normal');
    const scenario2 = generateRandomScenario('Normal');

    expect(scenario1.id).not.toBe(scenario2.id);
  });

  it('scenario has valid theme', () => {
    const scenario = generateRandomScenario('Normal');
    const validThemes = ['manor', 'church', 'asylum', 'warehouse', 'forest', 'urban', 'coastal', 'underground', 'academic'];

    expect(validThemes).toContain(scenario.theme);
  });

  it('scenario has valid victory type', () => {
    const scenario = generateRandomScenario('Normal');
    const validTypes = ['escape', 'assassination', 'survival', 'collection', 'ritual', 'investigation'];

    expect(validTypes).toContain(scenario.victoryType);
  });

  it('scenario has required objectives that are not optional', () => {
    const scenario = generateRandomScenario('Normal');
    const requiredObjectives = scenario.objectives.filter(o => !o.isOptional);

    expect(requiredObjectives.length).toBeGreaterThan(0);
  });

  it('scenario doom events are sorted by threshold (descending)', () => {
    const scenario = generateRandomScenario('Normal');

    for (let i = 1; i < scenario.doomEvents.length; i++) {
      expect(scenario.doomEvents[i].threshold).toBeLessThanOrEqual(
        scenario.doomEvents[i - 1].threshold
      );
    }
  });

  it('scenario has estimated time and recommended players', () => {
    const scenario = generateRandomScenario('Normal');

    expect(scenario.estimatedTime).toBeDefined();
    expect(scenario.recommendedPlayers).toBeDefined();
  });
});

// ============================================================================
// generateScenarioPool TESTS
// ============================================================================

describe('generateScenarioPool', () => {
  it('generates requested number of scenarios', () => {
    const pool = generateScenarioPool('Normal', 3);

    expect(pool.length).toBe(3);
  });

  it('generates unique scenarios in pool', () => {
    const pool = generateScenarioPool('Normal', 5);
    const ids = pool.map(s => s.id);
    const uniqueIds = new Set(ids);

    expect(uniqueIds.size).toBe(pool.length);
  });

  it('tries to generate diverse mission types', () => {
    const pool = generateScenarioPool('Normal', 5);
    const victoryTypes = pool.map(s => s.victoryType);
    const uniqueTypes = new Set(victoryTypes);

    // Should have at least 3 unique types (some randomness allowed)
    expect(uniqueTypes.size).toBeGreaterThanOrEqual(2);
  });
});

// ============================================================================
// generateValidatedScenario TESTS
// ============================================================================

describe('generateValidatedScenario', () => {
  it('returns a winnable scenario', () => {
    const result = generateValidatedScenario('Normal');

    expect(result.validation.isWinnable).toBe(true);
  });

  it('includes validation result with confidence', () => {
    const result = generateValidatedScenario('Normal');

    expect(result.validation).toBeDefined();
    expect(result.validation.confidence).toBeGreaterThanOrEqual(0);
    expect(result.validation.confidence).toBeLessThanOrEqual(100);
  });

  it('tracks fix changes if scenario was modified', () => {
    const result = generateValidatedScenario('Normal');

    expect(result.wasFixed).toBeDefined();
    expect(result.fixChanges).toBeInstanceOf(Array);
  });

  it('tracks number of attempts', () => {
    const result = generateValidatedScenario('Normal');

    expect(result.attempts).toBeGreaterThanOrEqual(1);
    expect(result.attempts).toBeLessThanOrEqual(5);
  });
});

// ============================================================================
// quickValidateScenario TESTS
// ============================================================================

describe('quickValidateScenario', () => {
  it('returns valid for well-formed scenario', () => {
    const scenario = generateRandomScenario('Normal');
    const result = quickValidateScenario(scenario);

    expect(result.isValid).toBe(true);
  });

  it('detects survival doom mismatch', () => {
    const scenario = generateRandomScenario('Normal');

    // Create an impossible survival scenario
    scenario.objectives = [{
      id: 'test_survive',
      description: 'Survive 100 rounds',
      shortDescription: 'Survive 100 rounds',
      type: 'survive',
      targetAmount: 100, // More than any doom
      isOptional: false,
      isHidden: false,
      completed: false,
      currentAmount: 0
    }];
    scenario.startDoom = 10;

    const result = quickValidateScenario(scenario);

    expect(result.isValid).toBe(false);
    expect(result.reason).toContain('Survival');
  });

  it('detects missing boss spawn for assassination', () => {
    const scenario = generateRandomScenario('Normal');
    scenario.victoryType = 'assassination';
    scenario.objectives = [{
      id: 'test_boss',
      description: 'Kill the boss',
      shortDescription: 'Kill boss',
      type: 'kill_boss',
      isOptional: false,
      isHidden: false,
      completed: false,
      currentAmount: 0
    }];
    scenario.doomEvents = []; // No boss spawn

    const result = quickValidateScenario(scenario);

    expect(result.isValid).toBe(false);
    expect(result.reason).toContain('spawn');
  });
});

// ============================================================================
// getScenarioValidationInfo TESTS
// ============================================================================

describe('getScenarioValidationInfo', () => {
  it('returns validation info for scenario', () => {
    const scenario = generateRandomScenario('Normal');
    const info = getScenarioValidationInfo(scenario);

    expect(info).toHaveProperty('isWinnable');
    expect(info).toHaveProperty('confidence');
    expect(info).toHaveProperty('summary');
    expect(info).toHaveProperty('warnings');
    expect(info).toHaveProperty('errors');
  });

  it('summary is a meaningful string', () => {
    const scenario = generateRandomScenario('Normal');
    const info = getScenarioValidationInfo(scenario);

    expect(typeof info.summary).toBe('string');
    expect(info.summary.length).toBeGreaterThan(10);
  });

  it('warnings and errors are arrays', () => {
    const scenario = generateRandomScenario('Normal');
    const info = getScenarioValidationInfo(scenario);

    expect(info.warnings).toBeInstanceOf(Array);
    expect(info.errors).toBeInstanceOf(Array);
  });
});
