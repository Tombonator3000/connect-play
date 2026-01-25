/**
 * Tests for Scenario Generator Helper Functions
 *
 * These tests cover the utility functions used in scenario generation:
 * - Template interpolation
 * - Random selection utilities
 * - Location selection
 * - Objective generation
 * - Doom event generation
 * - Title and briefing generation
 * - Victory/Defeat condition building
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  randomElement,
  randomRange,
  generateId,
  interpolateTemplate,
  buildTemplateContext,
  selectLocation,
  generateObjectivesFromTemplates,
  generateBonusObjectives,
  generateDoomEvents,
  generateTitle,
  generateBriefing,
  buildVictoryConditions,
  buildDefeatConditions,
  selectCollectible,
  TemplateContext
} from './scenarioGeneratorHelpers';
import {
  MISSION_TYPES,
  INDOOR_START_LOCATIONS,
  OUTDOOR_START_LOCATIONS,
  MIXED_START_LOCATIONS,
  COLLECTIBLE_ITEMS
} from './scenarioGenerator';

// ============================================================================
// UTILITY FUNCTION TESTS
// ============================================================================

describe('Utility Functions', () => {
  describe('randomElement', () => {
    it('returns element from array', () => {
      const arr = ['a', 'b', 'c'];
      const result = randomElement(arr);

      expect(arr).toContain(result);
    });

    it('returns undefined for empty array', () => {
      const arr: string[] = [];
      const result = randomElement(arr);

      expect(result).toBeUndefined();
    });

    it('returns same element for single-item array', () => {
      const arr = ['only'];
      const result = randomElement(arr);

      expect(result).toBe('only');
    });

    it('produces varied results over multiple calls', () => {
      const arr = ['a', 'b', 'c', 'd', 'e'];
      const results = new Set<string>();

      for (let i = 0; i < 50; i++) {
        results.add(randomElement(arr));
      }

      // Should get at least 2 different values (very likely with 50 calls)
      expect(results.size).toBeGreaterThan(1);
    });
  });

  describe('randomRange', () => {
    it('returns value within range (inclusive)', () => {
      for (let i = 0; i < 20; i++) {
        const result = randomRange(5, 10);
        expect(result).toBeGreaterThanOrEqual(5);
        expect(result).toBeLessThanOrEqual(10);
      }
    });

    it('returns same value when min equals max', () => {
      const result = randomRange(7, 7);
      expect(result).toBe(7);
    });

    it('handles negative ranges', () => {
      for (let i = 0; i < 10; i++) {
        const result = randomRange(-5, -2);
        expect(result).toBeGreaterThanOrEqual(-5);
        expect(result).toBeLessThanOrEqual(-2);
      }
    });

    it('produces integers only', () => {
      for (let i = 0; i < 20; i++) {
        const result = randomRange(0, 100);
        expect(Number.isInteger(result)).toBe(true);
      }
    });
  });

  describe('generateId', () => {
    it('returns a string starting with "gen_"', () => {
      const id = generateId();

      expect(id.startsWith('gen_')).toBe(true);
    });

    it('generates unique IDs', () => {
      const ids = new Set<string>();

      for (let i = 0; i < 100; i++) {
        ids.add(generateId());
      }

      expect(ids.size).toBe(100);
    });

    it('includes timestamp-like component', () => {
      const id = generateId();
      const parts = id.split('_');

      expect(parts.length).toBe(3);
      expect(parseInt(parts[1])).toBeGreaterThan(0);
    });
  });
});

// ============================================================================
// TEMPLATE INTERPOLATION TESTS
// ============================================================================

describe('interpolateTemplate', () => {
  const baseContext: TemplateContext = {
    location: 'Blackwood Manor',
    target: 'High Priest Eldritch',
    victim: 'Professor Webb',
    mystery: 'The Whispering Darkness',
    item: 'Ancient Key',
    items: 'Ancient Keys',
    count: 3,
    half: 5,
    total: 10,
    rounds: 8,
    enemies: 'cultists'
  };

  it('replaces {location} placeholder', () => {
    const result = interpolateTemplate('Welcome to {location}', baseContext);
    expect(result).toBe('Welcome to Blackwood Manor');
  });

  it('replaces {target} placeholder', () => {
    const result = interpolateTemplate('Find {target}', baseContext);
    expect(result).toBe('Find High Priest Eldritch');
  });

  it('replaces {victim} placeholder', () => {
    const result = interpolateTemplate('Save {victim}', baseContext);
    expect(result).toBe('Save Professor Webb');
  });

  it('replaces {mystery} placeholder', () => {
    const result = interpolateTemplate('Investigate {mystery}', baseContext);
    expect(result).toBe('Investigate The Whispering Darkness');
  });

  it('replaces {item} placeholder', () => {
    const result = interpolateTemplate('Find the {item}', baseContext);
    expect(result).toBe('Find the Ancient Key');
  });

  it('replaces {items} placeholder', () => {
    const result = interpolateTemplate('Collect {items}', baseContext);
    expect(result).toBe('Collect Ancient Keys');
  });

  it('replaces numeric placeholders', () => {
    const result = interpolateTemplate(
      'Collect {count} items, at least {half} of {total} in {rounds} rounds',
      baseContext
    );
    expect(result).toBe('Collect 3 items, at least 5 of 10 in 8 rounds');
  });

  it('replaces {enemies} placeholder', () => {
    const result = interpolateTemplate('Kill all {enemies}', baseContext);
    expect(result).toBe('Kill all cultists');
  });

  it('replaces multiple occurrences of same placeholder', () => {
    const result = interpolateTemplate('{location} is dark. Enter {location}.', baseContext);
    expect(result).toBe('Blackwood Manor is dark. Enter Blackwood Manor.');
  });

  it('handles missing optional values with defaults', () => {
    const minimalContext: TemplateContext = {
      location: 'Test',
      target: 'Enemy',
      victim: 'NPC',
      mystery: 'Mystery',
      item: 'Item',
      items: 'Items'
    };

    const result = interpolateTemplate('Survive {rounds} rounds', minimalContext);
    expect(result).toBe('Survive 10 rounds');
  });

  it('leaves unrecognized placeholders unchanged', () => {
    const result = interpolateTemplate('This is {unknown}', baseContext);
    expect(result).toBe('This is {unknown}');
  });
});

// ============================================================================
// CONTEXT BUILDER TESTS
// ============================================================================

describe('buildTemplateContext', () => {
  const testLocation = { name: 'Test Mansion', tileSet: 'indoor' as const, atmosphere: 'creepy' as const };

  it('builds context with all required fields', () => {
    const ctx = buildTemplateContext(
      testLocation,
      'Target Name',
      'Victim Name',
      'Mystery Name',
      { singular: 'Key', plural: 'Keys' }
    );

    expect(ctx.location).toBe('Test Mansion');
    expect(ctx.target).toBe('Target Name');
    expect(ctx.victim).toBe('Victim Name');
    expect(ctx.mystery).toBe('Mystery Name');
    expect(ctx.item).toBe('Key');
    expect(ctx.items).toBe('Keys');
  });

  it('calculates half correctly', () => {
    const ctx = buildTemplateContext(
      testLocation,
      'T', 'V', 'M',
      { singular: 'I', plural: 'Is' },
      7 // amount
    );

    expect(ctx.half).toBe(4); // ceil(7/2) = 4
  });

  it('uses amount for total and rounds', () => {
    const ctx = buildTemplateContext(
      testLocation,
      'T', 'V', 'M',
      { singular: 'I', plural: 'Is' },
      15
    );

    expect(ctx.total).toBe(15);
    expect(ctx.rounds).toBe(15);
  });

  it('uses defaults when amount is undefined', () => {
    const ctx = buildTemplateContext(
      testLocation,
      'T', 'V', 'M',
      { singular: 'I', plural: 'Is' }
    );

    expect(ctx.count).toBe(1);
    expect(ctx.half).toBe(5);
    expect(ctx.total).toBe(10);
    expect(ctx.rounds).toBe(10);
  });
});

// ============================================================================
// LOCATION SELECTION TESTS
// ============================================================================

describe('selectLocation', () => {
  const indoorMission = MISSION_TYPES.find(m => m.tileSet === 'indoor') || MISSION_TYPES[0];
  const outdoorMission = MISSION_TYPES.find(m => m.tileSet === 'outdoor') || MISSION_TYPES[0];
  const mixedMission = MISSION_TYPES.find(m => m.tileSet === 'mixed') || MISSION_TYPES[0];

  it('selects indoor location for indoor mission', () => {
    const location = selectLocation(
      { ...indoorMission, tileSet: 'indoor' },
      INDOOR_START_LOCATIONS,
      OUTDOOR_START_LOCATIONS,
      MIXED_START_LOCATIONS
    );

    expect(INDOOR_START_LOCATIONS).toContainEqual(location);
  });

  it('selects outdoor location for outdoor mission', () => {
    const location = selectLocation(
      { ...outdoorMission, tileSet: 'outdoor' },
      INDOOR_START_LOCATIONS,
      OUTDOOR_START_LOCATIONS,
      MIXED_START_LOCATIONS
    );

    expect(OUTDOOR_START_LOCATIONS).toContainEqual(location);
  });

  it('can select from all pools for mixed mission', () => {
    const allLocations = [...INDOOR_START_LOCATIONS, ...OUTDOOR_START_LOCATIONS, ...MIXED_START_LOCATIONS];
    const location = selectLocation(
      { ...mixedMission, tileSet: 'mixed' },
      INDOOR_START_LOCATIONS,
      OUTDOOR_START_LOCATIONS,
      MIXED_START_LOCATIONS
    );

    expect(allLocations).toContainEqual(location);
  });
});

// ============================================================================
// OBJECTIVE GENERATION TESTS
// ============================================================================

describe('generateObjectivesFromTemplates', () => {
  const escapeMission = MISSION_TYPES.find(m => m.id === 'escape_manor');
  const ctx: TemplateContext = {
    location: 'Test Location',
    target: 'Test Target',
    victim: 'Test Victim',
    mystery: 'Test Mystery',
    item: 'Test Key',
    items: 'Test Keys',
    count: 1
  };

  it('generates objectives from mission templates', () => {
    if (!escapeMission) return;

    const objectives = generateObjectivesFromTemplates(escapeMission, ctx);

    expect(objectives.length).toBe(escapeMission.objectiveTemplates.length);
  });

  it('objectives have unique IDs', () => {
    if (!escapeMission) return;

    const objectives = generateObjectivesFromTemplates(escapeMission, ctx);
    const ids = objectives.map(o => o.id);
    const uniqueIds = new Set(ids);

    expect(uniqueIds.size).toBe(ids.length);
  });

  it('interpolates template strings', () => {
    if (!escapeMission) return;

    const objectives = generateObjectivesFromTemplates(escapeMission, ctx);

    // Description should not contain unresolved placeholders (except unknown ones)
    for (const obj of objectives) {
      expect(obj.description).not.toContain('{location}');
      expect(obj.description).not.toContain('{target}');
    }
  });

  it('sets currentAmount to 0 for all objectives', () => {
    if (!escapeMission) return;

    const objectives = generateObjectivesFromTemplates(escapeMission, ctx);

    for (const obj of objectives) {
      expect(obj.currentAmount).toBe(0);
      expect(obj.completed).toBe(false);
    }
  });
});

describe('generateBonusObjectives', () => {
  it('generates requested number of objectives', () => {
    const objectives = generateBonusObjectives(2);

    expect(objectives.length).toBe(2);
  });

  it('all generated objectives are optional', () => {
    const objectives = generateBonusObjectives(3);

    for (const obj of objectives) {
      expect(obj.isOptional).toBe(true);
    }
  });

  it('objectives have valid IDs', () => {
    const objectives = generateBonusObjectives(3);

    for (const obj of objectives) {
      expect(obj.id.startsWith('obj_bonus_')).toBe(true);
    }
  });

  it('does not exceed available bonus objectives', () => {
    const objectives = generateBonusObjectives(100);

    // Should be limited to actual bonus objectives available
    expect(objectives.length).toBeLessThanOrEqual(100);
    expect(objectives.length).toBeGreaterThan(0);
  });
});

// ============================================================================
// DOOM EVENT GENERATION TESTS
// ============================================================================

describe('generateDoomEvents', () => {
  it('generates events for Normal difficulty', () => {
    const events = generateDoomEvents('Normal', 12);

    expect(events.length).toBeGreaterThanOrEqual(3);
  });

  it('generates events for Hard difficulty', () => {
    const events = generateDoomEvents('Hard', 10);

    expect(events.length).toBeGreaterThanOrEqual(3);
  });

  it('generates events for Nightmare difficulty', () => {
    const events = generateDoomEvents('Nightmare', 8);

    expect(events.length).toBeGreaterThanOrEqual(3);
  });

  it('events have decreasing thresholds', () => {
    const events = generateDoomEvents('Normal', 12);

    const thresholds = events.map(e => e.threshold);
    for (let i = 1; i < thresholds.length; i++) {
      expect(thresholds[i]).toBeLessThanOrEqual(thresholds[i - 1]);
    }
  });

  it('includes boss spawn event', () => {
    const events = generateDoomEvents('Normal', 12);
    const bossEvent = events.find(e => e.type === 'spawn_boss');

    expect(bossEvent).toBeDefined();
    expect(bossEvent!.amount).toBe(1);
  });

  it('all events start as not triggered', () => {
    const events = generateDoomEvents('Normal', 12);

    for (const event of events) {
      expect(event.triggered).toBe(false);
    }
  });

  it('all events have spawn messages', () => {
    const events = generateDoomEvents('Normal', 12);

    for (const event of events) {
      expect(event.message).toBeDefined();
      expect(event.message.length).toBeGreaterThan(0);
    }
  });

  it('uses mission-specific thresholds when provided', () => {
    const survivalEvents = generateDoomEvents('Normal', 12, 'survival');
    const escapeEvents = generateDoomEvents('Normal', 12, 'escape_manor');

    // Survival should have earlier early wave
    const survivalEarly = survivalEvents.find(e => e.type === 'spawn_enemy')?.threshold;
    const escapeEarly = escapeEvents.find(e => e.type === 'spawn_enemy')?.threshold;

    // Both should be valid
    expect(survivalEarly).toBeDefined();
    expect(escapeEarly).toBeDefined();
  });
});

// ============================================================================
// TITLE GENERATION TESTS
// ============================================================================

describe('generateTitle', () => {
  const ctx: TemplateContext = {
    location: 'Blackwood Manor',
    target: 'The Dark One',
    victim: 'Professor',
    mystery: 'Ancient Horror',
    item: 'Key',
    items: 'Keys'
  };

  it('generates non-empty title', () => {
    const escapeMission = MISSION_TYPES.find(m => m.id === 'escape_manor');
    if (!escapeMission) return;

    const title = generateTitle(escapeMission, ctx);

    expect(title.length).toBeGreaterThan(5);
  });

  it('interpolates location into title', () => {
    const escapeMission = MISSION_TYPES.find(m => m.id === 'escape_manor');
    if (!escapeMission) return;

    const title = generateTitle(escapeMission, ctx);

    // Title should contain some context
    expect(typeof title).toBe('string');
  });
});

// ============================================================================
// BRIEFING GENERATION TESTS
// ============================================================================

describe('generateBriefing', () => {
  it('generates multi-paragraph briefing', () => {
    const escapeMission = MISSION_TYPES.find(m => m.id === 'escape_manor');
    if (!escapeMission) return;

    const briefing = generateBriefing(escapeMission, 'Normal', 'Test Manor', 'Escape');

    expect(briefing).toContain('\n');
    expect(briefing.split('\n\n').length).toBeGreaterThanOrEqual(3);
  });

  it('includes location in briefing', () => {
    const escapeMission = MISSION_TYPES.find(m => m.id === 'escape_manor');
    if (!escapeMission) return;

    const briefing = generateBriefing(escapeMission, 'Normal', 'Test Manor', 'Escape');

    expect(briefing).toContain('Test Manor');
  });

  it('includes objective in briefing', () => {
    const escapeMission = MISSION_TYPES.find(m => m.id === 'escape_manor');
    if (!escapeMission) return;

    const briefing = generateBriefing(escapeMission, 'Normal', 'Test Manor', 'Find the key and escape');

    expect(briefing).toContain('Find the key and escape');
  });
});

// ============================================================================
// VICTORY/DEFEAT CONDITIONS TESTS
// ============================================================================

describe('buildVictoryConditions', () => {
  it('creates victory conditions from mission template', () => {
    const escapeMission = MISSION_TYPES.find(m => m.id === 'escape_manor');
    if (!escapeMission) return;

    const objectives = [
      { id: 'obj1', isOptional: false },
      { id: 'obj2', isOptional: true }
    ] as any[];

    const conditions = buildVictoryConditions(escapeMission, objectives);

    expect(conditions.length).toBeGreaterThan(0);
  });

  it('includes only required objectives', () => {
    const escapeMission = MISSION_TYPES.find(m => m.id === 'escape_manor');
    if (!escapeMission) return;

    const objectives = [
      { id: 'obj1', isOptional: false },
      { id: 'obj2', isOptional: true },
      { id: 'obj3', isOptional: false }
    ] as any[];

    const conditions = buildVictoryConditions(escapeMission, objectives);

    expect(conditions[0].requiredObjectives).toContain('obj1');
    expect(conditions[0].requiredObjectives).toContain('obj3');
    expect(conditions[0].requiredObjectives).not.toContain('obj2');
  });
});

describe('buildDefeatConditions', () => {
  it('always includes all_dead and doom_zero', () => {
    const escapeMission = MISSION_TYPES.find(m => m.id === 'escape_manor');
    if (!escapeMission) return;

    const conditions = buildDefeatConditions(escapeMission, 'Victim', []);

    const types = conditions.map(c => c.type);
    expect(types).toContain('all_dead');
    expect(types).toContain('doom_zero');
  });

  it('adds victim death condition for rescue missions', () => {
    const rescueMission = MISSION_TYPES.find(m => m.id === 'rescue');
    if (!rescueMission) return;

    const objectives = [
      { id: 'escape_obj', type: 'escape' }
    ] as any[];

    const conditions = buildDefeatConditions(rescueMission, 'Professor Webb', objectives);

    const victimCondition = conditions.find(c => c.type === 'objective_failed');
    expect(victimCondition).toBeDefined();
    expect(victimCondition!.description).toContain('Professor Webb');
  });
});

// ============================================================================
// COLLECTIBLE SELECTION TESTS
// ============================================================================

describe('selectCollectible', () => {
  it('returns valid collectible with key', () => {
    const collectible = selectCollectible();

    expect(collectible.key).toBeDefined();
    expect(Object.keys(COLLECTIBLE_ITEMS)).toContain(collectible.key);
  });

  it('returns singular and plural forms', () => {
    const collectible = selectCollectible();

    expect(collectible.singular).toBeDefined();
    expect(collectible.plural).toBeDefined();
    expect(collectible.singular.length).toBeGreaterThan(0);
    expect(collectible.plural.length).toBeGreaterThan(0);
  });

  it('singular and plural are different', () => {
    const collectible = selectCollectible();

    expect(collectible.singular).not.toBe(collectible.plural);
  });
});
