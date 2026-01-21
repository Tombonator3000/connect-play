/**
 * Context Action Definitions
 *
 * Declarative configuration for context actions in Shadows of the 1920s.
 * This file separates the action definitions (data) from the action building logic.
 */

import type { ContextAction, SkillType } from '../types';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Base configuration for an action that can be enabled/disabled
 */
export interface ActionConfig {
  id: string;
  label: string;
  icon: string;
  apCost: number;
  successMessage?: string;
  failureMessage?: string;
  skillCheck?: {
    skill: SkillType;
    dc: number;
  };
  itemRequired?: string;
  consequences?: {
    success?: ActionConsequence;
    failure?: ActionConsequence;
  };
}

export interface ActionConsequence {
  type: string;
  value?: number;
  message?: string;
  damage?: number;
  sanityCost?: number;
}

/**
 * Configuration for a dynamic action where some values depend on context
 */
export interface DynamicActionConfig extends Omit<ActionConfig, 'label' | 'skillCheck'> {
  labelTemplate?: string;
  getDC?: (context: ActionContext) => number;
  getEnabled?: (context: ActionContext) => boolean;
  getReason?: (context: ActionContext) => string | undefined;
}

export interface ActionContext {
  hasItem: (itemId: string) => boolean;
  lockType?: string;
  blockingDC?: number;
  searched?: boolean;
  keyId?: string;
}

// ============================================================================
// DOOR STATE ACTION DEFINITIONS
// ============================================================================

export const DOOR_STATE_ACTIONS: Record<string, ActionConfig[]> = {
  open: [
    {
      id: 'close_door',
      label: 'Close Door',
      icon: 'interact',
      apCost: 0,
      successMessage: 'You close the door.'
    }
  ],
  closed: [
    {
      id: 'open_door',
      label: 'Open Door',
      icon: 'interact',
      apCost: 1,
      successMessage: 'You open the door.'
    }
  ],
  puzzle: [
    {
      id: 'solve_puzzle',
      label: 'Examine Puzzle',
      icon: 'intellect',
      apCost: 1,
      successMessage: 'You begin to understand the mechanism.'
    }
  ],
  broken: []
};

/**
 * Locked door actions - requires dynamic values
 */
export const LOCKED_DOOR_ACTIONS: DynamicActionConfig[] = [
  {
    id: 'use_key',
    labelTemplate: 'Use Key',
    icon: 'key',
    apCost: 1,
    successMessage: 'The lock clicks open.',
    getEnabled: (ctx) => ctx.keyId ? ctx.hasItem(ctx.keyId) : false,
    getReason: (ctx) => ctx.hasItem(ctx.keyId || '') ? undefined : 'You do not have the required key'
  },
  {
    id: 'lockpick',
    labelTemplate: 'Lockpick (Agi {dc})',
    icon: 'lockpick',
    apCost: 1,
    getDC: (ctx) => ctx.lockType === 'simple' ? 3 : ctx.lockType === 'quality' ? 4 : ctx.lockType === 'complex' ? 5 : 4,
    successMessage: 'You skillfully pick the lock.',
    failureMessage: 'The lock resists your attempts.',
    consequences: {
      failure: { type: 'trigger_alarm', message: 'The failed attempt makes noise!' }
    }
  },
  {
    id: 'force_door',
    labelTemplate: 'Force (Str {dc})',
    icon: 'force',
    apCost: 1,
    getDC: (ctx) => {
      const baseDC = ctx.lockType === 'simple' ? 3 : ctx.lockType === 'quality' ? 4 : ctx.lockType === 'complex' ? 5 : 4;
      return baseDC + 1;
    },
    successMessage: 'You break the lock with brute force!',
    failureMessage: 'The door holds firm.',
    consequences: {
      success: { type: 'break_door', message: 'The door is now broken open.' },
      failure: { type: 'trigger_alarm', message: 'The noise echoes through the building.' }
    }
  }
];

/**
 * Barricaded door actions
 */
export const BARRICADED_DOOR_ACTIONS: ActionConfig[] = [
  {
    id: 'break_barricade',
    label: 'Break Barricade (Str 4)',
    icon: 'strength',
    apCost: 2,
    skillCheck: { skill: 'strength', dc: 4 },
    successMessage: 'You tear down the barricade!',
    failureMessage: 'The barricade is too sturdy.',
    consequences: {
      success: { type: 'break_door' },
      failure: { type: 'trigger_alarm' }
    }
  }
];

/**
 * Sealed door actions - requires item check
 */
export const SEALED_DOOR_ACTIONS: DynamicActionConfig[] = [
  {
    id: 'use_elder_sign',
    labelTemplate: 'Use Elder Sign',
    icon: 'item',
    itemRequired: 'elder_sign',
    apCost: 1,
    successMessage: 'The seal breaks with an unearthly sound!',
    getEnabled: (ctx) => ctx.hasItem('elder_sign'),
    getReason: (ctx) => ctx.hasItem('elder_sign') ? undefined : 'You need an Elder Sign to break the seal'
  },
  {
    id: 'break_seal',
    labelTemplate: 'Break Seal (Wil 5)',
    icon: 'willpower',
    apCost: 1,
    getDC: () => 5,
    successMessage: 'Your will overcomes the seal!',
    failureMessage: 'The seal resists your mind.',
    consequences: {
      failure: { type: 'lose_sanity', value: 1 }
    }
  },
  {
    id: 'read_glyphs',
    labelTemplate: 'Read Glyphs (Int 4)',
    icon: 'read',
    apCost: 1,
    getDC: () => 4,
    successMessage: 'The glyphs reveal a hint about the seal.',
    failureMessage: 'The symbols make no sense to you.'
  }
];

// ============================================================================
// BLOCKED EDGE ACTION DEFINITIONS
// ============================================================================

export const BLOCKED_EDGE_ACTIONS: Record<string, (ActionConfig | DynamicActionConfig)[]> = {
  rubble: [
    {
      id: 'clear_edge_rubble',
      label: 'Clear Rubble (Str 4)',
      icon: 'strength',
      apCost: 2,
      skillCheck: { skill: 'strength', dc: 4 },
      successMessage: 'You clear the rubble from the passage!',
      failureMessage: 'The rubble is too heavy to move.',
      consequences: {
        success: { type: 'clear_edge', message: 'The passage is now open.' }
      }
    },
    {
      id: 'search_edge_rubble',
      label: 'Search Rubble (Int 3)',
      icon: 'search',
      apCost: 1,
      skillCheck: { skill: 'intellect', dc: 3 },
      successMessage: 'You find something hidden in the debris!',
      failureMessage: 'Just rocks and dust.'
    }
  ],
  heavy_rubble: [
    {
      id: 'clear_edge_heavy_rubble',
      label: 'Clear Heavy Rubble (Str 5)',
      icon: 'strength',
      apCost: 3,
      skillCheck: { skill: 'strength', dc: 5 },
      successMessage: 'With great effort, you clear the massive debris!',
      failureMessage: 'The rubble barely budges.',
      consequences: {
        success: { type: 'clear_edge', message: 'The passage is now open.' }
      }
    }
  ],
  collapsed: [
    {
      id: 'examine_collapsed',
      label: 'Examine Collapse',
      icon: 'search',
      apCost: 0,
      successMessage: 'The passage has completely collapsed. There is no way through.'
    }
  ],
  barricade: [
    {
      id: 'break_edge_barricade',
      label: 'Break Barricade (Str 4)',
      icon: 'strength',
      apCost: 2,
      skillCheck: { skill: 'strength', dc: 4 },
      successMessage: 'You smash through the barricade!',
      failureMessage: 'The barricade holds firm.',
      consequences: {
        success: { type: 'clear_edge', message: 'The barricade is destroyed.' },
        failure: { type: 'trigger_alarm', message: 'The noise echoes...' }
      }
    },
    {
      id: 'examine_edge_barricade',
      label: 'Examine Barricade',
      icon: 'search',
      apCost: 0,
      successMessage: 'Someone has hastily blocked this passage. From which side?'
    }
  ],
  chasm: [
    {
      id: 'examine_edge_chasm',
      label: 'Examine Chasm',
      icon: 'search',
      apCost: 0,
      successMessage: 'A deep chasm blocks the way. You would need a rope or plank to cross.'
    }
  ],
  flooded: [
    {
      id: 'wade_through_edge',
      label: 'Wade Through',
      icon: 'interact',
      apCost: 2,
      successMessage: 'You wade through the murky water.',
      consequences: {
        success: { type: 'pass_through' }
      }
    },
    {
      id: 'search_edge_water',
      label: 'Search Water (Int 4)',
      icon: 'search',
      apCost: 1,
      skillCheck: { skill: 'intellect', dc: 4 },
      successMessage: 'You find something beneath the surface!',
      failureMessage: 'Only murky water.'
    }
  ]
};

// Dynamic blocked edge actions that need item checks
export const FIRE_EDGE_ACTIONS: DynamicActionConfig[] = [
  {
    id: 'extinguish_edge_fire',
    labelTemplate: 'Extinguish',
    icon: 'item',
    itemRequired: 'extinguisher',
    apCost: 1,
    successMessage: 'You put out the flames blocking the passage.',
    getEnabled: (ctx) => ctx.hasItem('extinguisher'),
    getReason: (ctx) => ctx.hasItem('extinguisher') ? undefined : 'You need a fire extinguisher',
    consequences: {
      success: { type: 'clear_edge' }
    }
  },
  {
    id: 'jump_through_edge_fire',
    labelTemplate: 'Jump Through Fire (Agi {dc})',
    icon: 'agility',
    apCost: 1,
    getDC: (ctx) => ctx.blockingDC || 4,
    successMessage: 'You leap through the flames!',
    failureMessage: 'The flames catch you!',
    consequences: {
      success: { type: 'pass_through', damage: 1, message: 'You take minor burns.' },
      failure: { type: 'take_damage', value: 2, message: 'The fire burns you badly!' }
    }
  }
];

export const LOCKED_GATE_EDGE_ACTIONS: DynamicActionConfig[] = [
  {
    id: 'unlock_edge_gate',
    labelTemplate: 'Use Key',
    icon: 'key',
    apCost: 1,
    successMessage: 'The gate unlocks with a click.',
    getEnabled: (ctx) => ctx.keyId ? ctx.hasItem(ctx.keyId) : false,
    getReason: (ctx) => (ctx.keyId && ctx.hasItem(ctx.keyId)) ? undefined : 'You need the correct key',
    consequences: {
      success: { type: 'clear_edge' }
    }
  },
  {
    id: 'lockpick_edge_gate',
    labelTemplate: 'Lockpick (Agi {dc})',
    icon: 'lockpick',
    apCost: 1,
    getDC: (ctx) => ctx.blockingDC || 4,
    successMessage: 'You pick the lock on the gate.',
    failureMessage: 'The lock resists your attempts.',
    consequences: {
      success: { type: 'clear_edge' }
    }
  },
  {
    id: 'force_edge_gate',
    labelTemplate: 'Force Gate (Str {dc})',
    icon: 'strength',
    apCost: 2,
    getDC: (ctx) => (ctx.blockingDC || 4) + 1,
    successMessage: 'You force the gate open!',
    failureMessage: 'The gate is too sturdy.',
    consequences: {
      success: { type: 'clear_edge' },
      failure: { type: 'trigger_alarm' }
    }
  }
];

export const SPIRIT_BARRIER_EDGE_ACTIONS: DynamicActionConfig[] = [
  {
    id: 'banish_edge_spirits',
    labelTemplate: 'Use Elder Sign',
    icon: 'ritual',
    itemRequired: 'elder_sign',
    apCost: 2,
    successMessage: 'The spirits shriek and dissipate!',
    getEnabled: (ctx) => ctx.hasItem('elder_sign'),
    getReason: (ctx) => ctx.hasItem('elder_sign') ? undefined : 'You need an Elder Sign to banish the spirits',
    consequences: {
      success: { type: 'clear_edge' }
    }
  },
  {
    id: 'force_through_edge_spirits',
    labelTemplate: 'Force Through (Wil {dc})',
    icon: 'willpower',
    apCost: 1,
    getDC: (ctx) => ctx.blockingDC || 5,
    successMessage: 'Your will overpowers the spirits!',
    failureMessage: 'The spirits tear at your mind.',
    consequences: {
      success: { type: 'pass_through' },
      failure: { type: 'lose_sanity', value: 2 }
    }
  }
];

export const WARD_EDGE_ACTIONS: DynamicActionConfig[] = [
  {
    id: 'dispel_edge_ward',
    labelTemplate: 'Dispel Ward (Wil {dc})',
    icon: 'willpower',
    apCost: 2,
    getDC: (ctx) => ctx.blockingDC || 5,
    successMessage: 'The ward shatters!',
    failureMessage: 'The ward burns your mind.',
    consequences: {
      success: { type: 'clear_edge' },
      failure: { type: 'lose_sanity', value: 1 }
    }
  },
  {
    id: 'cross_edge_ward',
    labelTemplate: 'Cross Ward (Risk Sanity)',
    icon: 'interact',
    apCost: 1,
    successMessage: 'You force yourself through the ward.',
    consequences: {
      success: { type: 'pass_through', sanityCost: 1, message: 'The ward sears your mind as you pass. -1 Sanity' }
    }
  }
];

export const CHASM_WITH_ROPE_ACTIONS: DynamicActionConfig[] = [
  {
    id: 'use_rope_chasm',
    labelTemplate: 'Use Rope',
    icon: 'item',
    itemRequired: 'rope',
    apCost: 2,
    successMessage: 'You secure the rope and cross carefully.',
    getEnabled: (ctx) => ctx.hasItem('rope'),
    getReason: (ctx) => ctx.hasItem('rope') ? undefined : 'You need a rope to cross',
    consequences: {
      success: { type: 'pass_through' }
    }
  }
];

// ============================================================================
// OBSTACLE ACTION DEFINITIONS
// ============================================================================

export const OBSTACLE_ACTIONS: Record<string, (ActionConfig | DynamicActionConfig)[]> = {
  rubble_light: [
    {
      id: 'clear_rubble',
      label: 'Clear Rubble',
      icon: 'strength',
      apCost: 1,
      successMessage: 'You clear the rubble out of the way.'
    },
    {
      id: 'search_rubble',
      label: 'Search Rubble',
      icon: 'search',
      apCost: 1,
      skillCheck: { skill: 'intellect', dc: 3 },
      successMessage: 'You find something hidden in the rubble!',
      failureMessage: 'Nothing useful here.'
    }
  ],
  rubble_heavy: [
    {
      id: 'clear_rubble',
      label: 'Clear Heavy Rubble (Str 4)',
      icon: 'strength',
      apCost: 2,
      skillCheck: { skill: 'strength', dc: 4 },
      successMessage: 'With great effort, you clear the rubble.',
      failureMessage: 'The rubble is too heavy.'
    }
  ],
  collapsed: [
    {
      id: 'examine_collapse',
      label: 'Examine',
      icon: 'search',
      apCost: 0,
      successMessage: 'This area has completely collapsed. There is no way through.'
    }
  ],
  water_shallow: [
    {
      id: 'wade_through',
      label: 'Wade Through',
      icon: 'interact',
      apCost: 2,
      successMessage: 'You wade through the murky water.'
    },
    {
      id: 'search_water',
      label: 'Search Water',
      icon: 'search',
      apCost: 1,
      skillCheck: { skill: 'intellect', dc: 4 },
      successMessage: 'You find something beneath the surface!',
      failureMessage: 'Only murky water.'
    }
  ],
  water_deep: [
    {
      id: 'swim_across',
      label: 'Swim Across (Agi 4)',
      icon: 'agility',
      apCost: 2,
      skillCheck: { skill: 'agility', dc: 4 },
      successMessage: 'You swim through the dark water.',
      failureMessage: 'The water is too treacherous!',
      consequences: {
        failure: { type: 'take_damage', value: 1 }
      }
    }
  ],
  unstable_floor: [
    {
      id: 'cross_carefully',
      label: 'Cross Carefully (Agi 4)',
      icon: 'agility',
      apCost: 1,
      skillCheck: { skill: 'agility', dc: 4 },
      successMessage: 'You carefully navigate the unstable floor.',
      failureMessage: 'The floor gives way beneath you!',
      consequences: {
        failure: { type: 'take_damage', value: 2 }
      }
    }
  ],
  ward_circle: [
    {
      id: 'cross_ward',
      label: 'Cross Ward (Wil 5)',
      icon: 'willpower',
      apCost: 1,
      skillCheck: { skill: 'willpower', dc: 5 },
      successMessage: 'You steel yourself and cross the ward.',
      failureMessage: 'The ward burns your mind!',
      consequences: {
        failure: { type: 'lose_sanity', value: 1 }
      }
    },
    {
      id: 'dispel_ward',
      label: 'Dispel Ward (Int 5)',
      icon: 'intellect',
      apCost: 2,
      skillCheck: { skill: 'intellect', dc: 5 },
      successMessage: 'You unravel the ward with occult knowledge.',
      failureMessage: 'The ward is beyond your understanding.',
      consequences: {
        success: { type: 'remove_obstacle' },
        failure: { type: 'lose_sanity', value: 1 }
      }
    }
  ],
  spatial_warp: [
    {
      id: 'analyze_warp',
      label: 'Analyze Distortion (Int 5)',
      icon: 'intellect',
      apCost: 1,
      skillCheck: { skill: 'intellect', dc: 5 },
      successMessage: 'You begin to understand the spatial anomaly.',
      failureMessage: 'The geometry defies comprehension.',
      consequences: {
        failure: { type: 'lose_sanity', value: 1 }
      }
    }
  ],
  time_loop: [
    {
      id: 'break_loop',
      label: 'Find the Pattern (Int 5)',
      icon: 'intellect',
      apCost: 1,
      skillCheck: { skill: 'intellect', dc: 5 },
      successMessage: 'You recognize the pattern in the loop!',
      failureMessage: 'Time continues to repeat...'
    }
  ]
};

// Dynamic obstacle actions
export const FIRE_OBSTACLE_ACTIONS: DynamicActionConfig[] = [
  {
    id: 'extinguish',
    labelTemplate: 'Extinguish',
    icon: 'item',
    itemRequired: 'extinguisher',
    apCost: 1,
    successMessage: 'You put out the flames.',
    getEnabled: (ctx) => ctx.hasItem('extinguisher'),
    getReason: (ctx) => ctx.hasItem('extinguisher') ? undefined : 'You need a fire extinguisher'
  },
  {
    id: 'jump_fire',
    labelTemplate: 'Jump Through (Agi 4)',
    icon: 'agility',
    apCost: 1,
    getDC: () => 4,
    successMessage: 'You leap through the flames!',
    failureMessage: 'The flames lick at you.',
    consequences: {
      failure: { type: 'take_damage', value: 1 }
    }
  }
];

export const GAS_POISON_ACTIONS: DynamicActionConfig[] = [
  {
    id: 'use_mask',
    labelTemplate: 'Use Gas Mask',
    icon: 'item',
    itemRequired: 'gas_mask',
    apCost: 0,
    successMessage: 'Your gas mask protects you from the fumes.',
    getEnabled: (ctx) => ctx.hasItem('gas_mask'),
    getReason: (ctx) => ctx.hasItem('gas_mask') ? undefined : 'You need a gas mask to enter safely'
  },
  {
    id: 'hold_breath',
    labelTemplate: 'Hold Breath (Pass quickly)',
    icon: 'interact',
    apCost: 1,
    successMessage: 'You hold your breath and rush through.',
    consequences: {
      success: { type: 'take_damage', value: 1, message: 'The poison still affects you slightly.' }
    }
  }
];

export const DARKNESS_OBSTACLE_ACTIONS: DynamicActionConfig[] = [
  {
    id: 'use_light',
    labelTemplate: 'Use Light Source',
    icon: 'light',
    apCost: 0,
    successMessage: 'Your light pushes back the darkness.',
    getEnabled: (ctx) => ctx.hasItem('light_source'),
    getReason: (ctx) => ctx.hasItem('light_source') ? undefined : 'You need a light source'
  },
  {
    id: 'dispel_darkness',
    labelTemplate: 'Dispel (Wil 4)',
    icon: 'willpower',
    itemRequired: 'light_source',
    apCost: 1,
    getDC: () => 4,
    successMessage: 'Your will banishes the unnatural darkness!',
    failureMessage: 'The darkness seems to mock your efforts.',
    getEnabled: (ctx) => ctx.hasItem('light_source'),
    getReason: (ctx) => ctx.hasItem('light_source') ? undefined : 'You need a light source to attempt this'
  }
];

export const SPIRIT_BARRIER_OBSTACLE_ACTIONS: DynamicActionConfig[] = [
  {
    id: 'banish_spirits',
    labelTemplate: 'Banish Spirits',
    icon: 'ritual',
    itemRequired: 'elder_sign',
    apCost: 2,
    successMessage: 'The spirits shriek and fade away!',
    getEnabled: (ctx) => ctx.hasItem('elder_sign'),
    getReason: (ctx) => ctx.hasItem('elder_sign') ? undefined : 'You need an Elder Sign to banish the spirits',
    consequences: {
      success: { type: 'remove_obstacle' }
    }
  },
  {
    id: 'force_through',
    labelTemplate: 'Force Through (Wil 5)',
    icon: 'willpower',
    apCost: 1,
    getDC: () => 5,
    successMessage: 'You push through the barrier!',
    failureMessage: 'The spirits tear at your mind.',
    consequences: {
      failure: { type: 'lose_sanity', value: 2 }
    }
  }
];

// ============================================================================
// TILE OBJECT ACTION DEFINITIONS
// ============================================================================

export const TILE_OBJECT_ACTIONS: Record<string, (ActionConfig | DynamicActionConfig)[]> = {
  altar: [
    {
      id: 'examine_altar',
      label: 'Examine Altar',
      icon: 'search',
      apCost: 1,
      successMessage: 'Dark symbols cover the altar surface.'
    },
    {
      id: 'perform_ritual',
      label: 'Perform Ritual (Wil 5)',
      icon: 'ritual',
      apCost: 2,
      skillCheck: { skill: 'willpower', dc: 5 },
      successMessage: 'The ritual yields forbidden knowledge.',
      failureMessage: 'The ritual backfires!',
      consequences: {
        failure: { type: 'lose_sanity', value: 2 }
      }
    }
  ],
  barricade: [
    {
      id: 'destroy_barricade',
      label: 'Destroy Barricade (Str 4)',
      icon: 'strength',
      apCost: 2,
      skillCheck: { skill: 'strength', dc: 4 },
      successMessage: 'The barricade crumbles!',
      failureMessage: 'The barricade holds.'
    }
  ],
  mirror: [
    {
      id: 'examine_mirror',
      label: 'Examine Mirror',
      icon: 'search',
      apCost: 1,
      successMessage: 'Your reflection stares back... but something is wrong.',
      consequences: {
        success: { type: 'lose_sanity', value: 1, message: 'Your reflection moves differently than you.' }
      }
    }
  ],
  radio: [
    {
      id: 'use_radio',
      label: 'Use Radio',
      icon: 'interact',
      apCost: 1,
      successMessage: 'Static crackles... then whispers in a language you almost understand.'
    }
  ],
  switch: [
    {
      id: 'flip_switch',
      label: 'Flip Switch',
      icon: 'interact',
      apCost: 0,
      successMessage: 'Click. Something changes elsewhere.'
    }
  ],
  statue: [
    {
      id: 'examine_statue',
      label: 'Examine Statue',
      icon: 'search',
      apCost: 1,
      successMessage: 'The statue depicts something that should not exist.'
    }
  ],
  exit_door: [
    {
      id: 'escape',
      label: 'ESCAPE!',
      icon: 'interact',
      apCost: 1,
      successMessage: 'Freedom at last!'
    }
  ],
  fog_wall: [
    {
      id: 'dispel_fog',
      label: 'Dispel Fog (Wil 4)',
      icon: 'willpower',
      apCost: 1,
      skillCheck: { skill: 'willpower', dc: 4 },
      successMessage: 'Your will parts the unnatural fog!',
      failureMessage: 'The fog resists your attempts.',
      consequences: {
        success: { type: 'remove_obstacle' },
        failure: { type: 'lose_sanity', value: 1 }
      }
    },
    {
      id: 'pass_through_fog',
      label: 'Pass Through',
      icon: 'interact',
      apCost: 1,
      successMessage: 'You blindly pass through the fog.',
      consequences: {
        success: { type: 'lose_sanity', value: 1, message: 'The fog whispers secrets you cannot unhear.' }
      }
    }
  ],
  eldritch_portal: [
    {
      id: 'examine_portal',
      label: 'Undersøk Portal',
      icon: 'search',
      apCost: 1,
      successMessage: 'Du stirrer inn i det lilla lyset. Noe stirrer tilbake.',
      consequences: {
        success: { type: 'lose_sanity', value: 1, message: 'Synet av det hinsidige brenner i sinnet.' }
      }
    },
    {
      id: 'seal_portal',
      label: 'Forsegle Portal (Elder Sign)',
      icon: 'ritual',
      apCost: 2,
      itemRequired: 'elder_sign',
      successMessage: 'Elder Sign lyser med eldgammelt lys - portalen lukkes!',
      getEnabled: (ctx) => ctx.hasItem('elder_sign'),
      getReason: (ctx) => ctx.hasItem('elder_sign') ? undefined : 'Du trenger et Elder Sign for å forsegle portalen',
      consequences: {
        success: { type: 'remove_obstacle', message: 'Portalen kollapser inn i seg selv.' }
      }
    },
    {
      id: 'attempt_close_portal',
      label: 'Prøv å Lukke (Wil 6)',
      icon: 'willpower',
      apCost: 2,
      skillCheck: { skill: 'willpower', dc: 6 },
      successMessage: 'Din vilje tvinger riftet delvis lukket!',
      failureMessage: 'Portalen motstår dine forsøk.',
      consequences: {
        failure: { type: 'lose_sanity', value: 2, message: 'Noe strekker seg ut fra riftet...' }
      }
    }
  ],
  locked_door: []
};

// Searchable objects (bookshelf, crate, chest, cabinet)
export const SEARCHABLE_OBJECT_ACTIONS: DynamicActionConfig[] = [
  {
    id: 'search_container',
    labelTemplate: 'Search (Int {dc})',
    icon: 'search',
    apCost: 1,
    getDC: () => 3,
    successMessage: 'You find something useful!',
    failureMessage: 'Empty.',
    getEnabled: (ctx) => !ctx.searched,
    getReason: (ctx) => ctx.searched ? 'Already searched' : undefined
  }
];

export const STATUE_SEARCH_ACTION: DynamicActionConfig = {
  id: 'search_statue',
  labelTemplate: 'Search for secrets (Int 4)',
  icon: 'search',
  apCost: 1,
  getDC: () => 4,
  successMessage: 'You find a hidden compartment!',
  failureMessage: 'Just a disturbing statue.',
  getEnabled: (ctx) => !ctx.searched,
  getReason: (ctx) => ctx.searched ? 'Already searched' : undefined
};

export const TRAP_ACTIONS: ActionConfig[] = [
  {
    id: 'disarm_trap',
    label: 'Disarm Trap (Agi 4)',
    icon: 'agility',
    apCost: 1,
    skillCheck: { skill: 'agility', dc: 4 },
    successMessage: 'You carefully disarm the trap mechanism.',
    failureMessage: 'The trap triggers!',
    consequences: {
      success: { type: 'remove_obstacle', message: 'The trap is now safe.' },
      failure: { type: 'take_damage', value: 2, message: 'The trap springs on you!' }
    }
  },
  {
    id: 'examine_trap',
    label: 'Examine Trap (Int 3)',
    icon: 'intellect',
    apCost: 1,
    skillCheck: { skill: 'intellect', dc: 3 },
    successMessage: 'You identify the trap mechanism and weak points.',
    failureMessage: 'The trap mechanism is too complex.'
  },
  {
    id: 'trigger_trap',
    label: 'Trigger from Distance',
    icon: 'interact',
    apCost: 1,
    successMessage: 'The trap triggers harmlessly.',
    consequences: {
      success: { type: 'remove_obstacle', message: 'The trap is spent.' }
    }
  }
];

export const GATE_ACTIONS: DynamicActionConfig[] = [
  {
    id: 'open_gate',
    labelTemplate: 'Open Gate',
    icon: 'key',
    apCost: 1,
    successMessage: 'The gate creaks open.',
    getEnabled: (ctx) => ctx.hasItem('gate_key'),
    getReason: (ctx) => ctx.hasItem('gate_key') ? undefined : 'You need a gate key'
  },
  {
    id: 'climb_gate',
    labelTemplate: 'Climb Over (Agi 4)',
    icon: 'agility',
    apCost: 2,
    getDC: () => 4,
    successMessage: 'You clamber over the gate.',
    failureMessage: 'You slip and fall back.',
    consequences: {
      failure: { type: 'take_damage', value: 1 }
    }
  },
  {
    id: 'force_gate',
    labelTemplate: 'Force Gate (Str 5)',
    icon: 'strength',
    apCost: 2,
    getDC: () => 5,
    successMessage: 'The gate bursts open!',
    failureMessage: 'The gate is too sturdy.'
  }
];

// ============================================================================
// CANCEL ACTION (used by all)
// ============================================================================

export const CANCEL_ACTION: ActionConfig = {
  id: 'cancel',
  label: 'Cancel',
  icon: 'cancel',
  apCost: 0
};

// ============================================================================
// WINDOW EDGE ACTIONS
// ============================================================================

export const WINDOW_EDGE_ACTIONS: ActionConfig[] = [
  {
    id: 'climb_through_window',
    label: 'Climb Through (Agi 4)',
    icon: 'agility',
    apCost: 2,
    skillCheck: { skill: 'agility', dc: 4 },
    successMessage: 'You carefully climb through the window.',
    failureMessage: 'You slip and cut yourself on the glass.',
    consequences: {
      success: { type: 'pass_through' },
      failure: { type: 'take_damage', value: 1 }
    }
  },
  {
    id: 'break_window',
    label: 'Break Window (Str 3)',
    icon: 'strength',
    apCost: 1,
    skillCheck: { skill: 'strength', dc: 3 },
    successMessage: 'The window shatters! You can now pass freely.',
    failureMessage: 'The window holds firm.',
    consequences: {
      success: { type: 'clear_edge', message: 'The window is now broken open.' },
      failure: { type: 'trigger_alarm', message: 'The noise might attract attention.' }
    }
  },
  {
    id: 'peek_through_window',
    label: 'Peek Through',
    icon: 'search',
    apCost: 0,
    successMessage: 'You peer through the dusty glass...'
  }
];

// ============================================================================
// STAIRS EDGE ACTIONS
// ============================================================================

export const STAIRS_UP_ACTIONS: ActionConfig[] = [
  {
    id: 'use_stairs_up',
    label: 'Gå opp trappen (2 AP)',
    icon: 'interact',
    apCost: 2,
    successMessage: 'Du går opp trappen.',
    consequences: {
      success: { type: 'pass_through' }
    }
  },
  {
    id: 'examine_stairs_up',
    label: 'Undersøk trappen',
    icon: 'search',
    apCost: 0,
    successMessage: 'Trappen fører oppover til neste etasje.'
  }
];

export const STAIRS_DOWN_ACTIONS: ActionConfig[] = [
  {
    id: 'use_stairs_down',
    label: 'Gå ned trappen (2 AP)',
    icon: 'interact',
    apCost: 2,
    successMessage: 'Du går ned trappen inn i mørket.',
    consequences: {
      success: { type: 'pass_through' }
    }
  },
  {
    id: 'examine_stairs_down',
    label: 'Undersøk trappen',
    icon: 'search',
    apCost: 0,
    successMessage: 'Trappen forsvinner ned i mørket under.'
  }
];
