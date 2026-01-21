/**
 * Context Action Builder
 *
 * Helper functions to build ContextAction objects from configuration definitions.
 * Separates the building logic from the action definitions.
 */

import type { ContextAction, ContextActionIconType, Player, SkillType } from '../types';
import { hasKey, hasLightSource } from '../types';
import type {
  ActionConfig,
  DynamicActionConfig,
  ActionContext,
  ActionConsequence
} from './contextActionDefinitions';
import { CANCEL_ACTION } from './contextActionDefinitions';

// ============================================================================
// CONTEXT FACTORY
// ============================================================================

/**
 * Creates an ActionContext from player and edge/obstacle data
 */
export function createActionContext(
  player: Player,
  options: {
    lockType?: string;
    blockingDC?: number;
    searched?: boolean;
    keyId?: string;
    blockingItemRequired?: string;
  } = {}
): ActionContext {
  return {
    hasItem: (itemId: string) => {
      if (itemId === 'light_source') {
        return hasLightSource(player.inventory);
      }
      return hasKey(player.inventory, itemId);
    },
    lockType: options.lockType,
    blockingDC: options.blockingDC,
    searched: options.searched,
    keyId: options.keyId || options.blockingItemRequired
  };
}

// ============================================================================
// ACTION BUILDERS
// ============================================================================

/**
 * Builds a ContextAction from a static ActionConfig
 */
export function buildStaticAction(config: ActionConfig): ContextAction {
  const action: ContextAction = {
    id: config.id,
    label: config.label,
    icon: config.icon as ContextActionIconType,
    apCost: config.apCost,
    enabled: true
  };

  if (config.successMessage) {
    action.successMessage = config.successMessage;
  }
  if (config.failureMessage) {
    action.failureMessage = config.failureMessage;
  }
  if (config.skillCheck) {
    action.skillCheck = {
      skill: config.skillCheck.skill,
      dc: config.skillCheck.dc
    };
  }
  if (config.itemRequired) {
    action.itemRequired = config.itemRequired;
  }
  if (config.consequences) {
    action.consequences = config.consequences as ContextAction['consequences'];
  }

  return action;
}

/**
 * Builds a ContextAction from a DynamicActionConfig using context
 */
export function buildDynamicAction(
  config: DynamicActionConfig,
  context: ActionContext,
  skillType?: SkillType
): ContextAction {
  const dc = config.getDC ? config.getDC(context) : undefined;
  const enabled = config.getEnabled ? config.getEnabled(context) : true;
  const reason = config.getReason ? config.getReason(context) : undefined;

  // Build label from template
  let label = config.labelTemplate || '';
  if (dc !== undefined) {
    label = label.replace('{dc}', dc.toString());
  }

  const action: ContextAction = {
    id: config.id,
    label,
    icon: config.icon as ContextActionIconType,
    apCost: config.apCost,
    enabled,
    reason
  };

  if (config.successMessage) {
    action.successMessage = config.successMessage;
  }
  if (config.failureMessage) {
    action.failureMessage = config.failureMessage;
  }
  if (dc !== undefined && skillType) {
    action.skillCheck = { skill: skillType, dc };
  }
  if (config.itemRequired) {
    action.itemRequired = config.itemRequired;
  }
  if (config.consequences) {
    action.consequences = config.consequences as ContextAction['consequences'];
  }

  return action;
}

/**
 * Builds multiple actions from an array of configs
 */
export function buildActionsFromConfigs(
  configs: (ActionConfig | DynamicActionConfig)[],
  context: ActionContext
): ContextAction[] {
  return configs.map(config => {
    if ('labelTemplate' in config || 'getDC' in config || 'getEnabled' in config) {
      // Dynamic config - need to determine skill type from the action
      const skillType = inferSkillType(config as DynamicActionConfig);
      return buildDynamicAction(config as DynamicActionConfig, context, skillType);
    }
    return buildStaticAction(config as ActionConfig);
  });
}

/**
 * Infers the skill type from an action config based on its id/icon
 */
function inferSkillType(config: DynamicActionConfig): SkillType | undefined {
  const id = config.id.toLowerCase();
  const icon = config.icon.toLowerCase();

  if (id.includes('lockpick') || id.includes('climb') || id.includes('jump') ||
      id.includes('swim') || id.includes('disarm') || icon === 'agility') {
    return 'agility';
  }
  if (id.includes('force') || id.includes('break') || id.includes('clear') || icon === 'strength') {
    return 'strength';
  }
  if (id.includes('read') || id.includes('analyze') || id.includes('search') ||
      id.includes('examine') || id.includes('pattern') || icon === 'intellect') {
    return 'intellect';
  }
  if (id.includes('seal') || id.includes('dispel') || id.includes('ward') ||
      id.includes('spirit') || id.includes('darkness') || icon === 'willpower') {
    return 'willpower';
  }

  return undefined;
}

/**
 * Appends the cancel action to an action list
 */
export function withCancelAction(actions: ContextAction[]): ContextAction[] {
  return [...actions, buildStaticAction(CANCEL_ACTION)];
}

// ============================================================================
// SPECIALIZED BUILDERS
// ============================================================================

// ----------------------------------------------------------------------------
// Generic Dynamic Action Builder
// ----------------------------------------------------------------------------

/**
 * Callback type for resolving skill type from action id.
 * Returns SkillType if skill check should be added, null to skip, undefined to auto-infer.
 */
type SkillResolver = (actionId: string) => SkillType | null | undefined;

/**
 * Configuration for the generic dynamic action builder
 */
interface DynamicActionBuilderOptions {
  /** Default DC if config.getDC is not provided */
  defaultDC: number | ((context: ActionContext) => number);
  /** Callback to resolve skill type from action id */
  skillResolver: SkillResolver;
}

/**
 * Builds a single ContextAction from a DynamicActionConfig with skill resolution.
 * This is the core building block that eliminates duplication.
 */
function buildSingleDynamicAction(
  config: DynamicActionConfig,
  context: ActionContext,
  options: DynamicActionBuilderOptions
): ContextAction {
  // Resolve default DC (can be static or context-dependent)
  const defaultDC = typeof options.defaultDC === 'function'
    ? options.defaultDC(context)
    : options.defaultDC;

  const dc = config.getDC ? config.getDC(context) : defaultDC;
  const enabled = config.getEnabled ? config.getEnabled(context) : true;
  const reason = config.getReason ? config.getReason(context) : undefined;

  // Build label from template, replacing {dc} placeholder
  let label = config.labelTemplate || '';
  label = label.replace('{dc}', dc.toString());

  // Build base action object
  const action: ContextAction = {
    id: config.id,
    label,
    icon: config.icon as ContextActionIconType,
    apCost: config.apCost,
    enabled,
    reason
  };

  // Add optional fields
  if (config.successMessage) action.successMessage = config.successMessage;
  if (config.failureMessage) action.failureMessage = config.failureMessage;
  if (config.itemRequired) action.itemRequired = config.itemRequired;
  if (config.consequences) {
    action.consequences = config.consequences as ContextAction['consequences'];
  }

  // Resolve and add skill check
  const resolvedSkill = options.skillResolver(config.id);
  if (resolvedSkill === undefined) {
    // Auto-infer from action id/icon
    const inferredSkill = inferSkillType(config);
    if (inferredSkill) {
      action.skillCheck = { skill: inferredSkill, dc };
    }
  } else if (resolvedSkill !== null) {
    // Use explicitly resolved skill
    action.skillCheck = { skill: resolvedSkill, dc };
  }
  // If resolvedSkill === null, skip skill check entirely

  return action;
}

/**
 * Generic builder for dynamic actions with configurable skill resolution.
 * Replaces the duplicated code in buildLockedDoorActions, buildSealedDoorActions, etc.
 */
function buildDynamicActionsWithSkill(
  configs: DynamicActionConfig[],
  context: ActionContext,
  options: DynamicActionBuilderOptions
): ContextAction[] {
  return configs.map(config => buildSingleDynamicAction(config, context, options));
}

// ----------------------------------------------------------------------------
// Skill Resolvers for Different Door/Edge Types
// ----------------------------------------------------------------------------

/** Skill resolution for locked doors: lockpick → agility, force → strength, use_key → skip */
const LOCKED_DOOR_SKILL_RESOLVER: SkillResolver = (actionId) => {
  if (actionId === 'use_key') return null; // No skill check for key usage
  if (actionId === 'lockpick') return 'agility';
  return 'strength'; // force_door, break_door, etc.
};

/** Skill resolution for sealed doors: break_seal → willpower, read_glyphs → intellect */
const SEALED_DOOR_SKILL_RESOLVER: SkillResolver = (actionId) => {
  if (actionId === 'break_seal') return 'willpower';
  if (actionId === 'read_glyphs') return 'intellect';
  if (actionId === 'use_elder_sign') return null; // No skill check for item usage
  return null; // No skill check by default
};

/** Skill resolution for blocked edges: auto-infer from action id */
const BLOCKED_EDGE_SKILL_RESOLVER: SkillResolver = () => undefined; // Auto-infer

// ----------------------------------------------------------------------------
// Public Specialized Builders (now using generic builder)
// ----------------------------------------------------------------------------

/**
 * Builds locked door actions with context-aware DC and key checking.
 * Uses generic builder with locked door skill resolution.
 */
export function buildLockedDoorActions(
  context: ActionContext,
  configs: DynamicActionConfig[]
): ContextAction[] {
  return buildDynamicActionsWithSkill(configs, context, {
    defaultDC: 4,
    skillResolver: LOCKED_DOOR_SKILL_RESOLVER
  });
}

/**
 * Builds sealed door actions.
 * Uses generic builder with sealed door skill resolution.
 */
export function buildSealedDoorActions(
  context: ActionContext,
  configs: DynamicActionConfig[]
): ContextAction[] {
  return buildDynamicActionsWithSkill(configs, context, {
    defaultDC: 5,
    skillResolver: SEALED_DOOR_SKILL_RESOLVER
  });
}

/**
 * Builds edge actions with blocking DC support.
 * Uses generic builder with auto-inferred skills and context-dependent default DC.
 */
export function buildBlockedEdgeActions(
  context: ActionContext,
  configs: (ActionConfig | DynamicActionConfig)[]
): ContextAction[] {
  return configs.map(config => {
    // Handle static configs separately
    if (!('getDC' in config) && !('getEnabled' in config) && !('labelTemplate' in config)) {
      return buildStaticAction(config as ActionConfig);
    }

    // Dynamic config - use generic builder
    return buildSingleDynamicAction(config as DynamicActionConfig, context, {
      defaultDC: (ctx) => ctx.blockingDC || 4,
      skillResolver: BLOCKED_EDGE_SKILL_RESOLVER
    });
  });
}

/**
 * Builds searchable container actions
 */
export function buildSearchableActions(
  context: ActionContext,
  searchDC: number
): ContextAction[] {
  const searched = context.searched || false;

  return [{
    id: 'search_container',
    label: `Search (Int ${searchDC})`,
    icon: 'search',
    skillCheck: { skill: 'intellect', dc: searchDC },
    apCost: 1,
    enabled: !searched,
    reason: searched ? 'Already searched' : undefined,
    successMessage: 'You find something useful!',
    failureMessage: 'Empty.'
  }];
}

/**
 * Builds bookshelf search actions
 */
export function buildBookshelfActions(context: ActionContext): ContextAction[] {
  const searched = context.searched || false;

  return [{
    id: 'search_books',
    label: 'Search Books',
    icon: 'search',
    skillCheck: { skill: 'intellect', dc: 3 },
    apCost: 1,
    enabled: !searched,
    reason: searched ? 'Already searched' : undefined,
    successMessage: 'You find useful information!',
    failureMessage: 'Nothing of interest.'
  }];
}

/**
 * Builds statue actions including optional search
 */
export function buildStatueActions(context: ActionContext): ContextAction[] {
  const searched = context.searched || false;

  return [
    {
      id: 'examine_statue',
      label: 'Examine Statue',
      icon: 'search',
      apCost: 1,
      enabled: true,
      successMessage: 'The statue depicts something that should not exist.'
    },
    {
      id: 'search_statue',
      label: 'Search for secrets (Int 4)',
      icon: 'search',
      skillCheck: { skill: 'intellect', dc: 4 },
      apCost: 1,
      enabled: !searched,
      reason: searched ? 'Already searched' : undefined,
      successMessage: 'You find a hidden compartment!',
      failureMessage: 'Just a disturbing statue.'
    }
  ];
}
