/**
 * Context Actions System for Shadows of the 1920s
 *
 * When a player clicks on an obstacle, door, or special tile,
 * this system determines which actions are available.
 */

import {
  Player,
  Tile,
  EdgeData,
  Obstacle,
  TileObject,
  ContextAction,
  ContextActionTarget,
  DoorState,
  ObstacleType,
  EdgeBlockingType,
  hasKey,
  hasLightSource
} from '../types';

// ============================================================================
// DOOR CONTEXT ACTIONS
// ============================================================================

/**
 * Gets available actions for a door edge
 */
export function getDoorActions(
  player: Player,
  edge: EdgeData,
  tile: Tile
): ContextAction[] {
  const actions: ContextAction[] = [];

  if (edge.type !== 'door') {
    return actions;
  }

  const doorState = edge.doorState || 'closed';

  switch (doorState) {
    case 'open':
      // Already open - can close it
      actions.push({
        id: 'close_door',
        label: 'Close Door',
        icon: 'interact',
        apCost: 0, // Free action
        enabled: true,
        successMessage: 'You close the door.'
      });
      break;

    case 'closed':
      // Can simply open it
      actions.push({
        id: 'open_door',
        label: 'Open Door',
        icon: 'interact',
        apCost: 1,
        enabled: true,
        successMessage: 'You open the door.'
      });
      break;

    case 'locked':
      // Check for key first
      const hasCorrectKey = edge.keyId ? hasKey(player.inventory, edge.keyId) : false;

      actions.push({
        id: 'use_key',
        label: 'Use Key',
        icon: 'key',
        apCost: 1,
        enabled: hasCorrectKey,
        reason: hasCorrectKey ? undefined : 'You do not have the required key',
        successMessage: 'The lock clicks open.'
      });

      // Lockpick option (Agility check)
      const lockDC = edge.lockType === 'simple' ? 3 :
                     edge.lockType === 'quality' ? 4 :
                     edge.lockType === 'complex' ? 5 : 4;

      actions.push({
        id: 'lockpick',
        label: `Lockpick (Agi ${lockDC})`,
        icon: 'lockpick',
        skillCheck: { skill: 'agility', dc: lockDC },
        apCost: 1,
        enabled: true,
        successMessage: 'You skillfully pick the lock.',
        failureMessage: 'The lock resists your attempts.',
        consequences: {
          failure: { type: 'trigger_alarm', message: 'The failed attempt makes noise!' }
        }
      });

      // Force option (Strength check, harder)
      actions.push({
        id: 'force_door',
        label: `Force (Str ${lockDC + 1})`,
        icon: 'force',
        skillCheck: { skill: 'strength', dc: lockDC + 1 },
        apCost: 1,
        enabled: true,
        successMessage: 'You break the lock with brute force!',
        failureMessage: 'The door holds firm.',
        consequences: {
          success: { type: 'break_door', message: 'The door is now broken open.' },
          failure: { type: 'trigger_alarm', message: 'The noise echoes through the building.' }
        }
      });
      break;

    case 'barricaded':
      // Need Strength to break through
      actions.push({
        id: 'break_barricade',
        label: 'Break Barricade (Str 4)',
        icon: 'strength',
        skillCheck: { skill: 'strength', dc: 4 },
        apCost: 2,
        enabled: true,
        successMessage: 'You tear down the barricade!',
        failureMessage: 'The barricade is too sturdy.',
        consequences: {
          success: { type: 'break_door' },
          failure: { type: 'trigger_alarm' }
        }
      });
      break;

    case 'sealed':
      // Need Elder Sign or Occult check
      const hasElderSign = hasKey(player.inventory, 'elder_sign');

      actions.push({
        id: 'use_elder_sign',
        label: 'Use Elder Sign',
        icon: 'item',
        itemRequired: 'elder_sign',
        apCost: 1,
        enabled: hasElderSign,
        reason: hasElderSign ? undefined : 'You need an Elder Sign to break the seal',
        successMessage: 'The seal breaks with an unearthly sound!'
      });

      actions.push({
        id: 'break_seal',
        label: 'Break Seal (Wil 5)',
        icon: 'willpower',
        skillCheck: { skill: 'willpower', dc: 5 },
        apCost: 1,
        enabled: true,
        successMessage: 'Your will overcomes the seal!',
        failureMessage: 'The seal resists your mind.',
        consequences: {
          failure: { type: 'lose_sanity', value: 1 }
        }
      });

      actions.push({
        id: 'read_glyphs',
        label: 'Read Glyphs (Int 4)',
        icon: 'read',
        skillCheck: { skill: 'intellect', dc: 4 },
        apCost: 1,
        enabled: true,
        successMessage: 'The glyphs reveal a hint about the seal.',
        failureMessage: 'The symbols make no sense to you.'
      });
      break;

    case 'puzzle':
      actions.push({
        id: 'solve_puzzle',
        label: 'Examine Puzzle',
        icon: 'intellect',
        apCost: 1,
        enabled: true,
        successMessage: 'You begin to understand the mechanism.'
      });
      break;

    case 'broken':
      // Already broken, no actions needed
      break;
  }

  // Always add cancel
  actions.push({
    id: 'cancel',
    label: 'Cancel',
    icon: 'cancel',
    apCost: 0,
    enabled: true
  });

  return actions;
}

// ============================================================================
// BLOCKED EDGE CONTEXT ACTIONS
// ============================================================================

/**
 * Gets available actions for a blocked edge (rubble, fire, collapsed, etc.)
 */
export function getBlockedEdgeActions(
  player: Player,
  edge: EdgeData,
  tile: Tile
): ContextAction[] {
  const actions: ContextAction[] = [];

  if (edge.type !== 'blocked' || !edge.blockingType) {
    // If no specific blocking type, just show a generic message
    actions.push({
      id: 'examine_blocked',
      label: 'Examine',
      icon: 'search',
      apCost: 0,
      enabled: true,
      successMessage: 'The path is blocked. There is no way through.'
    });
    actions.push({
      id: 'cancel',
      label: 'Cancel',
      icon: 'cancel',
      apCost: 0,
      enabled: true
    });
    return actions;
  }

  switch (edge.blockingType) {
    case 'rubble':
      actions.push({
        id: 'clear_edge_rubble',
        label: 'Clear Rubble (Str 4)',
        icon: 'strength',
        skillCheck: { skill: 'strength', dc: edge.blockingDC || 4 },
        apCost: 2,
        enabled: true,
        successMessage: 'You clear the rubble from the passage!',
        failureMessage: 'The rubble is too heavy to move.',
        consequences: {
          success: { type: 'clear_edge', message: 'The passage is now open.' }
        }
      });
      actions.push({
        id: 'search_edge_rubble',
        label: 'Search Rubble (Int 3)',
        icon: 'search',
        skillCheck: { skill: 'intellect', dc: 3 },
        apCost: 1,
        enabled: true,
        successMessage: 'You find something hidden in the debris!',
        failureMessage: 'Just rocks and dust.'
      });
      break;

    case 'heavy_rubble':
      actions.push({
        id: 'clear_edge_heavy_rubble',
        label: 'Clear Heavy Rubble (Str 5)',
        icon: 'strength',
        skillCheck: { skill: 'strength', dc: edge.blockingDC || 5 },
        apCost: 3,
        enabled: true,
        successMessage: 'With great effort, you clear the massive debris!',
        failureMessage: 'The rubble barely budges.',
        consequences: {
          success: { type: 'clear_edge', message: 'The passage is now open.' }
        }
      });
      break;

    case 'collapsed':
      actions.push({
        id: 'examine_collapsed',
        label: 'Examine Collapse',
        icon: 'search',
        apCost: 0,
        enabled: true,
        successMessage: 'The passage has completely collapsed. There is no way through.'
      });
      break;

    case 'fire':
      const hasExtinguisher = hasKey(player.inventory, 'extinguisher');
      actions.push({
        id: 'extinguish_edge_fire',
        label: 'Extinguish',
        icon: 'item',
        itemRequired: 'extinguisher',
        apCost: 1,
        enabled: hasExtinguisher,
        reason: hasExtinguisher ? undefined : 'You need a fire extinguisher',
        successMessage: 'You put out the flames blocking the passage.',
        consequences: {
          success: { type: 'clear_edge' }
        }
      });
      actions.push({
        id: 'jump_through_edge_fire',
        label: 'Jump Through Fire (Agi 4)',
        icon: 'agility',
        skillCheck: { skill: 'agility', dc: edge.blockingDC || 4 },
        apCost: 1,
        enabled: true,
        successMessage: 'You leap through the flames!',
        failureMessage: 'The flames catch you!',
        consequences: {
          success: { type: 'pass_through', damage: 1, message: 'You take minor burns.' },
          failure: { type: 'take_damage', value: 2, message: 'The fire burns you badly!' }
        }
      });
      break;

    case 'barricade':
      actions.push({
        id: 'break_edge_barricade',
        label: 'Break Barricade (Str 4)',
        icon: 'strength',
        skillCheck: { skill: 'strength', dc: edge.blockingDC || 4 },
        apCost: 2,
        enabled: true,
        successMessage: 'You smash through the barricade!',
        failureMessage: 'The barricade holds firm.',
        consequences: {
          success: { type: 'clear_edge', message: 'The barricade is destroyed.' },
          failure: { type: 'trigger_alarm', message: 'The noise echoes...' }
        }
      });
      actions.push({
        id: 'examine_edge_barricade',
        label: 'Examine Barricade',
        icon: 'search',
        apCost: 0,
        enabled: true,
        successMessage: 'Someone has hastily blocked this passage. From which side?'
      });
      break;

    case 'locked_gate':
      const hasGateKey = edge.blockingItemRequired
        ? hasKey(player.inventory, edge.blockingItemRequired)
        : false;
      actions.push({
        id: 'unlock_edge_gate',
        label: 'Use Key',
        icon: 'key',
        apCost: 1,
        enabled: hasGateKey,
        reason: hasGateKey ? undefined : 'You need the correct key',
        successMessage: 'The gate unlocks with a click.',
        consequences: {
          success: { type: 'clear_edge' }
        }
      });
      actions.push({
        id: 'lockpick_edge_gate',
        label: `Lockpick (Agi ${edge.blockingDC || 4})`,
        icon: 'lockpick',
        skillCheck: { skill: 'agility', dc: edge.blockingDC || 4 },
        apCost: 1,
        enabled: true,
        successMessage: 'You pick the lock on the gate.',
        failureMessage: 'The lock resists your attempts.',
        consequences: {
          success: { type: 'clear_edge' }
        }
      });
      actions.push({
        id: 'force_edge_gate',
        label: `Force Gate (Str ${(edge.blockingDC || 4) + 1})`,
        icon: 'strength',
        skillCheck: { skill: 'strength', dc: (edge.blockingDC || 4) + 1 },
        apCost: 2,
        enabled: true,
        successMessage: 'You force the gate open!',
        failureMessage: 'The gate is too sturdy.',
        consequences: {
          success: { type: 'clear_edge' },
          failure: { type: 'trigger_alarm' }
        }
      });
      break;

    case 'spirit_barrier':
      const hasElderSign = hasKey(player.inventory, 'elder_sign');
      actions.push({
        id: 'banish_edge_spirits',
        label: 'Use Elder Sign',
        icon: 'ritual',
        itemRequired: 'elder_sign',
        apCost: 2,
        enabled: hasElderSign,
        reason: hasElderSign ? undefined : 'You need an Elder Sign to banish the spirits',
        successMessage: 'The spirits shriek and dissipate!',
        consequences: {
          success: { type: 'clear_edge' }
        }
      });
      actions.push({
        id: 'force_through_edge_spirits',
        label: 'Force Through (Wil 5)',
        icon: 'willpower',
        skillCheck: { skill: 'willpower', dc: edge.blockingDC || 5 },
        apCost: 1,
        enabled: true,
        successMessage: 'Your will overpowers the spirits!',
        failureMessage: 'The spirits tear at your mind.',
        consequences: {
          success: { type: 'pass_through' },
          failure: { type: 'lose_sanity', value: 2 }
        }
      });
      break;

    case 'ward':
      actions.push({
        id: 'dispel_edge_ward',
        label: 'Dispel Ward (Wil 5)',
        icon: 'willpower',
        skillCheck: { skill: 'willpower', dc: edge.blockingDC || 5 },
        apCost: 2,
        enabled: true,
        successMessage: 'The ward shatters!',
        failureMessage: 'The ward burns your mind.',
        consequences: {
          success: { type: 'clear_edge' },
          failure: { type: 'lose_sanity', value: 1 }
        }
      });
      actions.push({
        id: 'cross_edge_ward',
        label: 'Cross Ward (Risk Sanity)',
        icon: 'interact',
        apCost: 1,
        enabled: true,
        successMessage: 'You force yourself through the ward.',
        consequences: {
          success: { type: 'pass_through', sanityCost: 1, message: 'The ward sears your mind as you pass. -1 Sanity' }
        }
      });
      break;

    case 'chasm':
      actions.push({
        id: 'examine_edge_chasm',
        label: 'Examine Chasm',
        icon: 'search',
        apCost: 0,
        enabled: true,
        successMessage: 'A deep chasm blocks the way. You would need a rope or plank to cross.'
      });
      const hasRope = hasKey(player.inventory, 'rope');
      actions.push({
        id: 'use_rope_chasm',
        label: 'Use Rope',
        icon: 'item',
        itemRequired: 'rope',
        apCost: 2,
        enabled: hasRope,
        reason: hasRope ? undefined : 'You need a rope to cross',
        successMessage: 'You secure the rope and cross carefully.',
        consequences: {
          success: { type: 'pass_through' }
        }
      });
      break;

    case 'flooded':
      actions.push({
        id: 'wade_through_edge',
        label: 'Wade Through',
        icon: 'interact',
        apCost: 2,
        enabled: true,
        successMessage: 'You wade through the murky water.',
        consequences: {
          success: { type: 'pass_through' }
        }
      });
      actions.push({
        id: 'search_edge_water',
        label: 'Search Water (Int 4)',
        icon: 'search',
        skillCheck: { skill: 'intellect', dc: 4 },
        apCost: 1,
        enabled: true,
        successMessage: 'You find something beneath the surface!',
        failureMessage: 'Only murky water.'
      });
      break;
  }

  // Always add cancel
  actions.push({
    id: 'cancel',
    label: 'Cancel',
    icon: 'cancel',
    apCost: 0,
    enabled: true
  });

  return actions;
}

/**
 * Gets available actions for a window edge
 */
export function getWindowEdgeActions(
  player: Player,
  edge: EdgeData,
  tile: Tile
): ContextAction[] {
  const actions: ContextAction[] = [];

  actions.push({
    id: 'climb_through_window',
    label: 'Climb Through (Agi 4)',
    icon: 'agility',
    skillCheck: { skill: 'agility', dc: 4 },
    apCost: 2,
    enabled: true,
    successMessage: 'You carefully climb through the window.',
    failureMessage: 'You slip and cut yourself on the glass.',
    consequences: {
      success: { type: 'pass_through' },
      failure: { type: 'take_damage', value: 1 }
    }
  });

  actions.push({
    id: 'break_window',
    label: 'Break Window (Str 3)',
    icon: 'strength',
    skillCheck: { skill: 'strength', dc: 3 },
    apCost: 1,
    enabled: true,
    successMessage: 'The window shatters! You can now pass freely.',
    failureMessage: 'The window holds firm.',
    consequences: {
      success: { type: 'clear_edge', message: 'The window is now broken open.' },
      failure: { type: 'trigger_alarm', message: 'The noise might attract attention.' }
    }
  });

  actions.push({
    id: 'peek_through_window',
    label: 'Peek Through',
    icon: 'search',
    apCost: 0,
    enabled: true,
    successMessage: 'You peer through the dusty glass...'
  });

  // Always add cancel
  actions.push({
    id: 'cancel',
    label: 'Cancel',
    icon: 'cancel',
    apCost: 0,
    enabled: true
  });

  return actions;
}

// ============================================================================
// OBSTACLE CONTEXT ACTIONS
// ============================================================================

/**
 * Gets available actions for an obstacle
 */
export function getObstacleActions(
  player: Player,
  obstacle: Obstacle,
  tile: Tile
): ContextAction[] {
  const actions: ContextAction[] = [];

  switch (obstacle.type) {
    case 'rubble_light':
      actions.push({
        id: 'clear_rubble',
        label: 'Clear Rubble',
        icon: 'strength',
        apCost: 1,
        enabled: true,
        successMessage: 'You clear the rubble out of the way.'
      });
      actions.push({
        id: 'search_rubble',
        label: 'Search Rubble',
        icon: 'search',
        skillCheck: { skill: 'intellect', dc: 3 },
        apCost: 1,
        enabled: true,
        successMessage: 'You find something hidden in the rubble!',
        failureMessage: 'Nothing useful here.'
      });
      break;

    case 'rubble_heavy':
      actions.push({
        id: 'clear_rubble',
        label: 'Clear Heavy Rubble (Str 4)',
        icon: 'strength',
        skillCheck: { skill: 'strength', dc: 4 },
        apCost: 2,
        enabled: true,
        successMessage: 'With great effort, you clear the rubble.',
        failureMessage: 'The rubble is too heavy.'
      });
      break;

    case 'collapsed':
      actions.push({
        id: 'examine_collapse',
        label: 'Examine',
        icon: 'search',
        apCost: 0,
        enabled: true,
        successMessage: 'This area has completely collapsed. There is no way through.'
      });
      break;

    case 'fire':
      const hasExtinguisher = hasKey(player.inventory, 'extinguisher');
      actions.push({
        id: 'extinguish',
        label: 'Extinguish',
        icon: 'item',
        itemRequired: 'extinguisher',
        apCost: 1,
        enabled: hasExtinguisher,
        reason: hasExtinguisher ? undefined : 'You need a fire extinguisher',
        successMessage: 'You put out the flames.'
      });
      actions.push({
        id: 'jump_fire',
        label: 'Jump Through (Agi 4)',
        icon: 'agility',
        skillCheck: { skill: 'agility', dc: 4 },
        apCost: 1,
        enabled: true,
        successMessage: 'You leap through the flames!',
        failureMessage: 'The flames lick at you.',
        consequences: {
          failure: { type: 'take_damage', value: 1 }
        }
      });
      break;

    case 'water_shallow':
      actions.push({
        id: 'wade_through',
        label: 'Wade Through',
        icon: 'interact',
        apCost: 2, // Extra AP cost
        enabled: true,
        successMessage: 'You wade through the murky water.'
      });
      actions.push({
        id: 'search_water',
        label: 'Search Water',
        icon: 'search',
        skillCheck: { skill: 'intellect', dc: 4 },
        apCost: 1,
        enabled: true,
        successMessage: 'You find something beneath the surface!',
        failureMessage: 'Only murky water.'
      });
      break;

    case 'water_deep':
      actions.push({
        id: 'swim_across',
        label: 'Swim Across (Agi 4)',
        icon: 'agility',
        skillCheck: { skill: 'agility', dc: 4 },
        apCost: 2,
        enabled: true,
        successMessage: 'You swim through the dark water.',
        failureMessage: 'The water is too treacherous!',
        consequences: {
          failure: { type: 'take_damage', value: 1 }
        }
      });
      break;

    case 'unstable_floor':
      actions.push({
        id: 'cross_carefully',
        label: 'Cross Carefully (Agi 4)',
        icon: 'agility',
        skillCheck: { skill: 'agility', dc: 4 },
        apCost: 1,
        enabled: true,
        successMessage: 'You carefully navigate the unstable floor.',
        failureMessage: 'The floor gives way beneath you!',
        consequences: {
          failure: { type: 'take_damage', value: 2 }
        }
      });
      break;

    case 'gas_poison':
      const hasGasMask = hasKey(player.inventory, 'gas_mask');
      actions.push({
        id: 'use_mask',
        label: 'Use Gas Mask',
        icon: 'item',
        itemRequired: 'gas_mask',
        apCost: 0,
        enabled: hasGasMask,
        reason: hasGasMask ? undefined : 'You need a gas mask to enter safely',
        successMessage: 'Your gas mask protects you from the fumes.'
      });
      actions.push({
        id: 'hold_breath',
        label: 'Hold Breath (Pass quickly)',
        icon: 'interact',
        apCost: 1,
        enabled: true,
        successMessage: 'You hold your breath and rush through.',
        consequences: {
          success: { type: 'take_damage', value: 1, message: 'The poison still affects you slightly.' }
        }
      });
      break;

    case 'darkness':
      const hasLight = hasLightSource(player.inventory);
      actions.push({
        id: 'use_light',
        label: 'Use Light Source',
        icon: 'light',
        apCost: 0,
        enabled: hasLight,
        reason: hasLight ? undefined : 'You need a light source',
        successMessage: 'Your light pushes back the darkness.'
      });
      actions.push({
        id: 'dispel_darkness',
        label: 'Dispel (Wil 4)',
        icon: 'willpower',
        skillCheck: { skill: 'willpower', dc: 4 },
        itemRequired: 'light_source', // Must have light to attempt
        apCost: 1,
        enabled: hasLight,
        reason: hasLight ? undefined : 'You need a light source to attempt this',
        successMessage: 'Your will banishes the unnatural darkness!',
        failureMessage: 'The darkness seems to mock your efforts.'
      });
      break;

    case 'ward_circle':
      actions.push({
        id: 'cross_ward',
        label: 'Cross Ward (Wil 5)',
        icon: 'willpower',
        skillCheck: { skill: 'willpower', dc: 5 },
        apCost: 1,
        enabled: true,
        successMessage: 'You steel yourself and cross the ward.',
        failureMessage: 'The ward burns your mind!',
        consequences: {
          failure: { type: 'lose_sanity', value: 1 }
        }
      });
      actions.push({
        id: 'dispel_ward',
        label: 'Dispel Ward (Int 5)',
        icon: 'intellect',
        skillCheck: { skill: 'intellect', dc: 5 },
        apCost: 2,
        enabled: true,
        successMessage: 'You unravel the ward with occult knowledge.',
        failureMessage: 'The ward is beyond your understanding.',
        consequences: {
          success: { type: 'remove_obstacle' },
          failure: { type: 'lose_sanity', value: 1 }
        }
      });
      break;

    case 'spirit_barrier':
      const hasElderSignItem = hasKey(player.inventory, 'elder_sign');
      actions.push({
        id: 'banish_spirits',
        label: 'Banish Spirits',
        icon: 'ritual',
        itemRequired: 'elder_sign',
        apCost: 2,
        enabled: hasElderSignItem,
        reason: hasElderSignItem ? undefined : 'You need an Elder Sign to banish the spirits',
        successMessage: 'The spirits shriek and fade away!',
        consequences: {
          success: { type: 'remove_obstacle' }
        }
      });
      actions.push({
        id: 'force_through',
        label: 'Force Through (Wil 5)',
        icon: 'willpower',
        skillCheck: { skill: 'willpower', dc: 5 },
        apCost: 1,
        enabled: true,
        successMessage: 'You push through the barrier!',
        failureMessage: 'The spirits tear at your mind.',
        consequences: {
          failure: { type: 'lose_sanity', value: 2 }
        }
      });
      break;

    case 'spatial_warp':
      actions.push({
        id: 'analyze_warp',
        label: 'Analyze Distortion (Int 5)',
        icon: 'intellect',
        skillCheck: { skill: 'intellect', dc: 5 },
        apCost: 1,
        enabled: true,
        successMessage: 'You begin to understand the spatial anomaly.',
        failureMessage: 'The geometry defies comprehension.',
        consequences: {
          failure: { type: 'lose_sanity', value: 1 }
        }
      });
      break;

    case 'time_loop':
      actions.push({
        id: 'break_loop',
        label: 'Find the Pattern (Int 5)',
        icon: 'intellect',
        skillCheck: { skill: 'intellect', dc: 5 },
        apCost: 1,
        enabled: true,
        successMessage: 'You recognize the pattern in the loop!',
        failureMessage: 'Time continues to repeat...'
      });
      break;
  }

  // Always add cancel
  actions.push({
    id: 'cancel',
    label: 'Cancel',
    icon: 'cancel',
    apCost: 0,
    enabled: true
  });

  return actions;
}

// ============================================================================
// TILE OBJECT CONTEXT ACTIONS
// ============================================================================

/**
 * Gets available actions for a tile object
 */
export function getTileObjectActions(
  player: Player,
  object: TileObject,
  tile: Tile
): ContextAction[] {
  const actions: ContextAction[] = [];

  switch (object.type) {
    case 'altar':
      actions.push({
        id: 'examine_altar',
        label: 'Examine Altar',
        icon: 'search',
        apCost: 1,
        enabled: true,
        successMessage: 'Dark symbols cover the altar surface.'
      });
      actions.push({
        id: 'perform_ritual',
        label: 'Perform Ritual (Wil 5)',
        icon: 'ritual',
        skillCheck: { skill: 'willpower', dc: 5 },
        apCost: 2,
        enabled: true,
        successMessage: 'The ritual yields forbidden knowledge.',
        failureMessage: 'The ritual backfires!',
        consequences: {
          failure: { type: 'lose_sanity', value: 2 }
        }
      });
      break;

    case 'bookshelf':
      actions.push({
        id: 'search_books',
        label: 'Search Books',
        icon: 'search',
        skillCheck: { skill: 'intellect', dc: 3 },
        apCost: 1,
        enabled: !object.searched,
        reason: object.searched ? 'Already searched' : undefined,
        successMessage: 'You find useful information!',
        failureMessage: 'Nothing of interest.'
      });
      break;

    case 'crate':
    case 'chest':
    case 'cabinet':
      const searchDC = object.type === 'chest' ? 4 : 3;
      actions.push({
        id: 'search_container',
        label: `Search (Int ${searchDC})`,
        icon: 'search',
        skillCheck: { skill: 'intellect', dc: searchDC },
        apCost: 1,
        enabled: !object.searched,
        reason: object.searched ? 'Already searched' : undefined,
        successMessage: 'You find something useful!',
        failureMessage: 'Empty.'
      });
      break;

    case 'locked_door':
      // Delegate to door actions
      break;

    case 'barricade':
      actions.push({
        id: 'destroy_barricade',
        label: 'Destroy Barricade (Str 4)',
        icon: 'strength',
        skillCheck: { skill: 'strength', dc: 4 },
        apCost: 2,
        enabled: true,
        successMessage: 'The barricade crumbles!',
        failureMessage: 'The barricade holds.'
      });
      break;

    case 'mirror':
      actions.push({
        id: 'examine_mirror',
        label: 'Examine Mirror',
        icon: 'search',
        apCost: 1,
        enabled: true,
        successMessage: 'Your reflection stares back... but something is wrong.',
        consequences: {
          success: { type: 'lose_sanity', value: 1, message: 'Your reflection moves differently than you.' }
        }
      });
      break;

    case 'radio':
      actions.push({
        id: 'use_radio',
        label: 'Use Radio',
        icon: 'interact',
        apCost: 1,
        enabled: true,
        successMessage: 'Static crackles... then whispers in a language you almost understand.'
      });
      break;

    case 'switch':
      actions.push({
        id: 'flip_switch',
        label: 'Flip Switch',
        icon: 'interact',
        apCost: 0,
        enabled: true,
        successMessage: 'Click. Something changes elsewhere.'
      });
      break;

    case 'statue':
      actions.push({
        id: 'examine_statue',
        label: 'Examine Statue',
        icon: 'search',
        apCost: 1,
        enabled: true,
        successMessage: 'The statue depicts something that should not exist.'
      });
      actions.push({
        id: 'search_statue',
        label: 'Search for secrets (Int 4)',
        icon: 'search',
        skillCheck: { skill: 'intellect', dc: 4 },
        apCost: 1,
        enabled: !object.searched,
        reason: object.searched ? 'Already searched' : undefined,
        successMessage: 'You find a hidden compartment!',
        failureMessage: 'Just a disturbing statue.'
      });
      break;

    case 'exit_door':
      actions.push({
        id: 'escape',
        label: 'ESCAPE!',
        icon: 'interact',
        apCost: 1,
        enabled: true,
        successMessage: 'Freedom at last!'
      });
      break;

    case 'trap':
      actions.push({
        id: 'disarm_trap',
        label: 'Disarm Trap (Agi 4)',
        icon: 'agility',
        skillCheck: { skill: 'agility', dc: 4 },
        apCost: 1,
        enabled: true,
        successMessage: 'You carefully disarm the trap mechanism.',
        failureMessage: 'The trap triggers!',
        consequences: {
          success: { type: 'remove_obstacle', message: 'The trap is now safe.' },
          failure: { type: 'take_damage', value: 2, message: 'The trap springs on you!' }
        }
      });
      actions.push({
        id: 'examine_trap',
        label: 'Examine Trap (Int 3)',
        icon: 'intellect',
        skillCheck: { skill: 'intellect', dc: 3 },
        apCost: 1,
        enabled: true,
        successMessage: 'You identify the trap mechanism and weak points.',
        failureMessage: 'The trap mechanism is too complex.'
      });
      actions.push({
        id: 'trigger_trap',
        label: 'Trigger from Distance',
        icon: 'interact',
        apCost: 1,
        enabled: true,
        successMessage: 'The trap triggers harmlessly.',
        consequences: {
          success: { type: 'remove_obstacle', message: 'The trap is spent.' }
        }
      });
      break;

    case 'fog_wall':
      actions.push({
        id: 'dispel_fog',
        label: 'Dispel Fog (Wil 4)',
        icon: 'willpower',
        skillCheck: { skill: 'willpower', dc: 4 },
        apCost: 1,
        enabled: true,
        successMessage: 'Your will parts the unnatural fog!',
        failureMessage: 'The fog resists your attempts.',
        consequences: {
          success: { type: 'remove_obstacle' },
          failure: { type: 'lose_sanity', value: 1 }
        }
      });
      actions.push({
        id: 'pass_through_fog',
        label: 'Pass Through',
        icon: 'interact',
        apCost: 1,
        enabled: true,
        successMessage: 'You blindly pass through the fog.',
        consequences: {
          success: { type: 'lose_sanity', value: 1, message: 'The fog whispers secrets you cannot unhear.' }
        }
      });
      break;

    case 'gate':
      const hasGateKey = hasKey(player.inventory, 'gate_key');
      actions.push({
        id: 'open_gate',
        label: 'Open Gate',
        icon: 'key',
        apCost: 1,
        enabled: hasGateKey,
        reason: hasGateKey ? undefined : 'You need a gate key',
        successMessage: 'The gate creaks open.'
      });
      actions.push({
        id: 'climb_gate',
        label: 'Climb Over (Agi 4)',
        icon: 'agility',
        skillCheck: { skill: 'agility', dc: 4 },
        apCost: 2,
        enabled: true,
        successMessage: 'You clamber over the gate.',
        failureMessage: 'You slip and fall back.',
        consequences: {
          failure: { type: 'take_damage', value: 1 }
        }
      });
      actions.push({
        id: 'force_gate',
        label: 'Force Gate (Str 5)',
        icon: 'strength',
        skillCheck: { skill: 'strength', dc: 5 },
        apCost: 2,
        enabled: true,
        successMessage: 'The gate bursts open!',
        failureMessage: 'The gate is too sturdy.'
      });
      break;
  }

  // Always add cancel
  actions.push({
    id: 'cancel',
    label: 'Cancel',
    icon: 'cancel',
    apCost: 0,
    enabled: true
  });

  return actions;
}

// ============================================================================
// MAIN CONTEXT ACTION FUNCTION
// ============================================================================

/**
 * Gets all available context actions for a target
 */
export function getContextActions(
  player: Player,
  target: ContextActionTarget,
  tile: Tile
): ContextAction[] {
  switch (target.type) {
    case 'edge':
      if (target.edge) {
        // Route to appropriate edge action handler based on edge type
        if (target.edge.type === 'blocked') {
          return getBlockedEdgeActions(player, target.edge, tile);
        }
        if (target.edge.type === 'window') {
          return getWindowEdgeActions(player, target.edge, tile);
        }
        // Default to door actions for door type edges
        return getDoorActions(player, target.edge, tile);
      }
      break;
    case 'obstacle':
      if (target.obstacle) {
        return getObstacleActions(player, target.obstacle, tile);
      }
      break;
    case 'object':
      if (target.object) {
        return getTileObjectActions(player, target.object, tile);
      }
      break;
    case 'tile':
      // General tile actions (search, etc.)
      const actions: ContextAction[] = [];
      if (tile.searchable && !tile.searched) {
        actions.push({
          id: 'search_tile',
          label: 'Search Area (Int 3)',
          icon: 'search',
          skillCheck: { skill: 'intellect', dc: 3 },
          apCost: 1,
          enabled: true,
          successMessage: 'You find something!',
          failureMessage: 'Nothing here.'
        });
      }
      actions.push({
        id: 'cancel',
        label: 'Cancel',
        icon: 'cancel',
        apCost: 0,
        enabled: true
      });
      return actions;
  }

  return [{
    id: 'cancel',
    label: 'Cancel',
    icon: 'cancel',
    apCost: 0,
    enabled: true
  }];
}

/**
 * Gets actions specifically for when player clicks on a secret door (once discovered)
 */
export function getSecretDoorActions(
  player: Player,
  isDiscovered: boolean
): ContextAction[] {
  if (!isDiscovered) {
    return [{
      id: 'investigate',
      label: 'Investigate (Int 5)',
      icon: 'search',
      skillCheck: { skill: 'intellect', dc: 5 },
      apCost: 1,
      enabled: true,
      successMessage: 'You discover a hidden passage!',
      failureMessage: 'You find nothing unusual.',
      consequences: {
        success: { type: 'reveal_secret' }
      }
    }, {
      id: 'cancel',
      label: 'Cancel',
      icon: 'cancel',
      apCost: 0,
      enabled: true
    }];
  }

  return [{
    id: 'use_secret_door',
    label: 'Use Secret Passage',
    icon: 'interact',
    apCost: 1,
    enabled: true,
    successMessage: 'You slip through the secret passage.'
  }, {
    id: 'cancel',
    label: 'Cancel',
    icon: 'cancel',
    apCost: 0,
    enabled: true
  }];
}
