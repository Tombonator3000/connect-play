/**
 * SCENARIO GENERATOR HELPERS
 *
 * Extracted helper functions for generateRandomScenario() to improve
 * readability, testability, and reduce code duplication.
 *
 * Key improvements:
 * - Single interpolateTemplate() for all string replacements (eliminates 9x duplication)
 * - Focused functions for each generation step
 * - Clear separation of concerns
 */

import {
  ScenarioObjective,
  DoomEvent,
  VictoryCondition,
  DefeatCondition
} from '../types';

import {
  MissionType,
  ObjectiveTemplate,
  LocationOption,
  ENEMY_POOLS,
  BOSS_POOL,
  BRIEFING_OPENINGS,
  BRIEFING_MIDDLES,
  BRIEFING_CLOSINGS,
  TITLE_TEMPLATES,
  BONUS_OBJECTIVES,
  COLLECTIBLE_ITEMS
} from './scenarioGenerator';

// ============================================================================
// TEMPLATE CONTEXT TYPE
// ============================================================================

/**
 * Context object containing all interpolation values.
 * Passed to interpolateTemplate() for consistent string replacements.
 */
export interface TemplateContext {
  location: string;
  target: string;
  victim: string;
  mystery: string;
  item: string;       // singular collectible name
  items: string;      // plural collectible name
  count?: number;
  half?: number;
  total?: number;
  rounds?: number;
  enemies?: string;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Select random element from array
 */
export function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Generate random integer in range [min, max]
 */
export function randomRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate unique scenario ID
 */
export function generateId(): string {
  return `gen_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// ============================================================================
// STRING INTERPOLATION
// ============================================================================

/**
 * Interpolate a template string with context values.
 * Replaces all {placeholder} patterns with values from context.
 *
 * This eliminates the repeated 9x .replace() chains throughout the codebase.
 *
 * @example
 * interpolateTemplate('Find the {item} at {location}', {
 *   location: 'Blackwood Manor',
 *   item: 'Silver Key',
 *   ...
 * })
 * // Returns: 'Find the Silver Key at Blackwood Manor'
 */
export function interpolateTemplate(template: string, ctx: TemplateContext): string {
  return template
    .replace(/{location}/g, ctx.location)
    .replace(/{target}/g, ctx.target)
    .replace(/{victim}/g, ctx.victim)
    .replace(/{mystery}/g, ctx.mystery)
    .replace(/{item}/g, ctx.item)
    .replace(/{items}/g, ctx.items)
    .replace(/{count}/g, String(ctx.count ?? 1))
    .replace(/{half}/g, String(ctx.half ?? 5))
    .replace(/{total}/g, String(ctx.total ?? 10))
    .replace(/{rounds}/g, String(ctx.rounds ?? 10))
    .replace(/{enemies}/g, ctx.enemies ?? 'enemies');
}

// ============================================================================
// CONTEXT BUILDERS
// ============================================================================

/**
 * Build a template context from generated scenario elements.
 * Centralizes all context creation for consistent interpolation.
 */
export function buildTemplateContext(
  location: LocationOption,
  target: string,
  victim: string,
  mystery: string,
  collectible: { singular: string; plural: string },
  amount?: number
): TemplateContext {
  return {
    location: location.name,
    target,
    victim,
    mystery,
    item: collectible.singular,
    items: collectible.plural,
    count: amount ?? 1,
    half: Math.ceil((amount ?? 10) / 2),
    total: amount ?? 10,
    rounds: amount ?? 10
  };
}

// ============================================================================
// LOCATION SELECTION
// ============================================================================

/**
 * Select appropriate location based on mission tileset requirements.
 */
export function selectLocation(
  missionType: MissionType,
  indoorLocations: LocationOption[],
  outdoorLocations: LocationOption[],
  mixedLocations: LocationOption[]
): LocationOption {
  let pool: LocationOption[];

  switch (missionType.tileSet) {
    case 'indoor':
      pool = indoorLocations;
      break;
    case 'outdoor':
      pool = outdoorLocations;
      break;
    default:
      pool = [...indoorLocations, ...outdoorLocations, ...mixedLocations];
  }

  return randomElement(pool);
}

// ============================================================================
// OBJECTIVE GENERATION
// ============================================================================

/**
 * Generate objectives from mission type templates.
 * Handles template interpolation, target selection, and amount ranges.
 */
export function generateObjectivesFromTemplates(
  missionType: MissionType,
  ctx: TemplateContext
): ScenarioObjective[] {
  const objectives: ScenarioObjective[] = [];

  missionType.objectiveTemplates.forEach((template, index) => {
    const amount = template.targetAmount
      ? randomRange(template.targetAmount.min, template.targetAmount.max)
      : undefined;

    const targetId = template.targetIdOptions
      ? randomElement(template.targetIdOptions)
      : undefined;

    // Update context with objective-specific values
    const objCtx: TemplateContext = {
      ...ctx,
      count: amount ?? ctx.count,
      half: Math.ceil((amount ?? 10) / 2),
      total: amount ?? 10
    };

    const objective: ScenarioObjective = {
      id: `obj_${template.id}_${index}`,
      description: interpolateTemplate(template.descriptionTemplate, objCtx),
      shortDescription: interpolateTemplate(template.shortDescriptionTemplate, objCtx),
      type: template.type,
      targetId,
      targetAmount: amount,
      currentAmount: 0,
      isOptional: template.isOptional,
      isHidden: template.isHidden,
      revealedBy: template.revealedByIndex !== undefined
        ? `obj_${missionType.objectiveTemplates[template.revealedByIndex].id}_${template.revealedByIndex}`
        : undefined,
      completed: false,
      rewardInsight: template.rewardInsight,
      rewardItem: template.rewardItemOptions
        ? randomElement(template.rewardItemOptions)
        : undefined
    };

    objectives.push(objective);
  });

  return objectives;
}

/**
 * Generate bonus objectives from the shared pool.
 */
export function generateBonusObjectives(count: number): ScenarioObjective[] {
  const objectives: ScenarioObjective[] = [];
  const shuffled = [...BONUS_OBJECTIVES].sort(() => Math.random() - 0.5);

  for (let i = 0; i < count && i < shuffled.length; i++) {
    const template = shuffled[i];
    const amount = template.targetAmount
      ? randomRange(template.targetAmount.min, template.targetAmount.max)
      : undefined;

    objectives.push({
      id: `obj_bonus_${i}`,
      description: template.descriptionTemplate,
      shortDescription: template.shortDescriptionTemplate.replace(/{count}/g, String(amount ?? 1)),
      type: template.type,
      targetId: template.targetIdOptions ? randomElement(template.targetIdOptions) : undefined,
      targetAmount: amount,
      currentAmount: 0,
      isOptional: true,
      isHidden: template.isHidden,
      completed: false,
      rewardInsight: template.rewardInsight,
      rewardItem: template.rewardItemOptions
        ? randomElement(template.rewardItemOptions)
        : undefined
    });
  }

  return objectives;
}

// ============================================================================
// DOOM EVENT GENERATION
// ============================================================================

/** Doom threshold percentages for enemy wave timing */
const DOOM_THRESHOLDS = {
  early: 0.55,  // First encounter - gives exploration time
  mid: 0.35,    // Pressure builds
  late: 0.15    // Boss appears near finale
} as const;

/**
 * Generate doom events for scenario based on difficulty.
 * Creates early, mid, and late (boss) waves with appropriate timing.
 */
export function generateDoomEvents(
  difficulty: 'Normal' | 'Hard' | 'Nightmare',
  baseDoom: number
): DoomEvent[] {
  const enemyPool = ENEMY_POOLS[difficulty];
  const events: DoomEvent[] = [];

  // Early wave
  const earlyEnemy = randomElement(enemyPool);
  events.push({
    threshold: Math.ceil(baseDoom * DOOM_THRESHOLDS.early),
    triggered: false,
    type: 'spawn_enemy',
    targetId: earlyEnemy.type,
    amount: randomRange(earlyEnemy.amount.min, earlyEnemy.amount.max),
    message: earlyEnemy.message
  });

  // Mid wave
  const midEnemy = randomElement(enemyPool);
  events.push({
    threshold: Math.ceil(baseDoom * DOOM_THRESHOLDS.mid),
    triggered: false,
    type: 'spawn_enemy',
    targetId: midEnemy.type,
    amount: randomRange(midEnemy.amount.min, midEnemy.amount.max),
    message: midEnemy.message
  });

  // Late wave - boss
  const boss = selectBossForDifficulty(difficulty);
  events.push({
    threshold: Math.ceil(baseDoom * DOOM_THRESHOLDS.late),
    triggered: false,
    type: 'spawn_boss',
    targetId: boss.type,
    amount: 1,
    message: boss.spawnMessage
  });

  return events;
}

/**
 * Select appropriate boss based on difficulty level.
 */
function selectBossForDifficulty(difficulty: 'Normal' | 'Hard' | 'Nightmare') {
  const available = BOSS_POOL.filter(b =>
    difficulty === 'Nightmare' ||
    (difficulty === 'Hard' && b.difficulty !== 'Nightmare') ||
    (difficulty === 'Normal' && b.difficulty === 'Normal')
  );
  return randomElement(available);
}

// ============================================================================
// TITLE GENERATION
// ============================================================================

/**
 * Generate scenario title from templates.
 */
export function generateTitle(
  missionType: MissionType,
  ctx: TemplateContext
): string {
  const templates = TITLE_TEMPLATES[missionType.id]
    || TITLE_TEMPLATES[missionType.victoryType]
    || [`The ${ctx.location} Incident`];

  return interpolateTemplate(randomElement(templates), ctx);
}

// ============================================================================
// BRIEFING GENERATION
// ============================================================================

/**
 * Generate narrative briefing for scenario.
 * Combines opening, middle (mission-specific), and closing (difficulty-specific).
 */
export function generateBriefing(
  missionType: MissionType,
  difficulty: 'Normal' | 'Hard' | 'Nightmare',
  location: string,
  goal: string
): string {
  const opening = randomElement(BRIEFING_OPENINGS);
  const middleOptions = BRIEFING_MIDDLES[missionType.victoryType] || BRIEFING_MIDDLES.escape;
  const middle = randomElement(middleOptions);
  const closing = randomElement(BRIEFING_CLOSINGS[difficulty]);

  return `${opening}

${middle}

${closing}

Location: ${location}
Objective: ${goal}`;
}

// ============================================================================
// VICTORY/DEFEAT CONDITIONS
// ============================================================================

/**
 * Build victory conditions from mission type template.
 */
export function buildVictoryConditions(
  missionType: MissionType,
  objectives: ScenarioObjective[]
): VictoryCondition[] {
  const requiredObjectiveIds = objectives
    .filter(o => !o.isOptional)
    .map(o => o.id);

  return [{
    ...missionType.victoryConditionTemplate,
    requiredObjectives: requiredObjectiveIds
  }];
}

/**
 * Build defeat conditions for scenario.
 * Adds standard conditions plus mission-specific ones (e.g., rescue victim death).
 */
export function buildDefeatConditions(
  missionType: MissionType,
  victim: string,
  objectives: ScenarioObjective[]
): DefeatCondition[] {
  const conditions: DefeatCondition[] = [
    { type: 'all_dead', description: 'All investigators have been killed' },
    { type: 'doom_zero', description: 'The doom counter reaches zero' }
  ];

  // Rescue missions have victim death condition
  if (missionType.id === 'rescue') {
    const escapeObjective = objectives.find(o => o.type === 'escape');
    if (escapeObjective) {
      conditions.push({
        type: 'objective_failed',
        description: `${victim} has been killed`,
        objectiveId: escapeObjective.id
      });
    }
  }

  return conditions;
}

// ============================================================================
// COLLECTIBLE SELECTION
// ============================================================================

/**
 * Select random collectible item with singular/plural names.
 */
export function selectCollectible(): { key: string; singular: string; plural: string } {
  const key = randomElement(Object.keys(COLLECTIBLE_ITEMS));
  return {
    key,
    ...COLLECTIBLE_ITEMS[key]
  };
}
