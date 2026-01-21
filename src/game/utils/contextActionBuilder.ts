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

/**
 * Builds locked door actions with context-aware DC and key checking
 */
export function buildLockedDoorActions(
  context: ActionContext,
  configs: DynamicActionConfig[]
): ContextAction[] {
  return configs.map(config => {
    const dc = config.getDC ? config.getDC(context) : 4;
    const enabled = config.getEnabled ? config.getEnabled(context) : true;
    const reason = config.getReason ? config.getReason(context) : undefined;

    let label = config.labelTemplate || '';
    label = label.replace('{dc}', dc.toString());

    const action: ContextAction = {
      id: config.id,
      label,
      icon: config.icon as ContextActionIconType,
      apCost: config.apCost,
      enabled,
      reason
    };

    if (config.successMessage) action.successMessage = config.successMessage;
    if (config.failureMessage) action.failureMessage = config.failureMessage;
    if (config.itemRequired) action.itemRequired = config.itemRequired;
    if (config.consequences) {
      action.consequences = config.consequences as ContextAction['consequences'];
    }

    // Add skill check for non-key actions
    if (config.id !== 'use_key') {
      const skillType = config.id === 'lockpick' ? 'agility' : 'strength';
      action.skillCheck = { skill: skillType, dc };
    }

    return action;
  });
}

/**
 * Builds sealed door actions
 */
export function buildSealedDoorActions(
  context: ActionContext,
  configs: DynamicActionConfig[]
): ContextAction[] {
  return configs.map(config => {
    const dc = config.getDC ? config.getDC(context) : 5;
    const enabled = config.getEnabled ? config.getEnabled(context) : true;
    const reason = config.getReason ? config.getReason(context) : undefined;

    let label = config.labelTemplate || '';

    const action: ContextAction = {
      id: config.id,
      label,
      icon: config.icon as ContextActionIconType,
      apCost: config.apCost,
      enabled,
      reason
    };

    if (config.successMessage) action.successMessage = config.successMessage;
    if (config.failureMessage) action.failureMessage = config.failureMessage;
    if (config.itemRequired) action.itemRequired = config.itemRequired;
    if (config.consequences) {
      action.consequences = config.consequences as ContextAction['consequences'];
    }

    // Add skill check based on action type
    if (config.id === 'break_seal') {
      action.skillCheck = { skill: 'willpower', dc };
    } else if (config.id === 'read_glyphs') {
      action.skillCheck = { skill: 'intellect', dc };
    }

    return action;
  });
}

/**
 * Builds edge actions with blocking DC support
 */
export function buildBlockedEdgeActions(
  context: ActionContext,
  configs: (ActionConfig | DynamicActionConfig)[]
): ContextAction[] {
  return configs.map(config => {
    if ('getDC' in config || 'getEnabled' in config) {
      const dynConfig = config as DynamicActionConfig;
      const dc = dynConfig.getDC ? dynConfig.getDC(context) : context.blockingDC || 4;
      const enabled = dynConfig.getEnabled ? dynConfig.getEnabled(context) : true;
      const reason = dynConfig.getReason ? dynConfig.getReason(context) : undefined;

      let label = dynConfig.labelTemplate || '';
      label = label.replace('{dc}', dc.toString());

      const action: ContextAction = {
        id: dynConfig.id,
        label,
        icon: dynConfig.icon as ContextActionIconType,
        apCost: dynConfig.apCost,
        enabled,
        reason
      };

      if (dynConfig.successMessage) action.successMessage = dynConfig.successMessage;
      if (dynConfig.failureMessage) action.failureMessage = dynConfig.failureMessage;
      if (dynConfig.itemRequired) action.itemRequired = dynConfig.itemRequired;
      if (dynConfig.consequences) {
        action.consequences = dynConfig.consequences as ContextAction['consequences'];
      }

      // Infer skill type and add check
      const skillType = inferSkillType(dynConfig);
      if (skillType) {
        action.skillCheck = { skill: skillType, dc };
      }

      return action;
    }
    return buildStaticAction(config as ActionConfig);
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
