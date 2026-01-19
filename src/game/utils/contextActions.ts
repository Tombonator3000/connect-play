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
