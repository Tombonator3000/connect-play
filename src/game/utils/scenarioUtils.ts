import {
  Scenario,
  ScenarioObjective,
  VictoryCondition,
  DefeatCondition,
  Player,
  Enemy,
  Tile,
  Item,
  GameState,
  Survivor
} from '../types';

// ============================================================================
// OBJECTIVE PROGRESS TRACKING
// ============================================================================

/**
 * Updates objective progress based on game events
 */
export function updateObjectiveProgress(
  scenario: Scenario,
  objectiveId: string,
  progressAmount: number = 1
): Scenario {
  const updatedObjectives = scenario.objectives.map(obj => {
    if (obj.id === objectiveId) {
      const newAmount = (obj.currentAmount || 0) + progressAmount;
      const isComplete = obj.targetAmount ? newAmount >= obj.targetAmount : true;

      return {
        ...obj,
        currentAmount: newAmount,
        completed: isComplete
      };
    }
    return obj;
  });

  // Check if any hidden objectives should be revealed
  const revealedObjectives = updatedObjectives.map(obj => {
    if (obj.isHidden && obj.revealedBy) {
      const revealingObj = updatedObjectives.find(o => o.id === obj.revealedBy);
      if (revealingObj?.completed) {
        return { ...obj, isHidden: false };
      }
    }
    return obj;
  });

  return {
    ...scenario,
    objectives: revealedObjectives
  };
}

/**
 * Marks an objective as complete
 */
export function completeObjective(
  scenario: Scenario,
  objectiveId: string
): Scenario {
  const updatedObjectives = scenario.objectives.map(obj => {
    if (obj.id === objectiveId) {
      return { ...obj, completed: true };
    }
    return obj;
  });

  // Reveal hidden objectives that depend on this one
  const revealedObjectives = updatedObjectives.map(obj => {
    if (obj.isHidden && obj.revealedBy === objectiveId) {
      return { ...obj, isHidden: false };
    }
    return obj;
  });

  return {
    ...scenario,
    objectives: revealedObjectives
  };
}

/**
 * Gets all visible (non-hidden) objectives
 */
export function getVisibleObjectives(scenario: Scenario): ScenarioObjective[] {
  return scenario.objectives.filter(obj => !obj.isHidden);
}

/**
 * Gets required objectives (non-optional)
 */
export function getRequiredObjectives(scenario: Scenario): ScenarioObjective[] {
  return scenario.objectives.filter(obj => !obj.isOptional);
}

/**
 * Gets optional bonus objectives
 */
export function getBonusObjectives(scenario: Scenario): ScenarioObjective[] {
  return scenario.objectives.filter(obj => obj.isOptional);
}

/**
 * Calculates completion percentage for visible objectives
 */
export function getCompletionPercentage(scenario: Scenario): number {
  const visible = getVisibleObjectives(scenario);
  const required = visible.filter(obj => !obj.isOptional);

  if (required.length === 0) return 0;

  const completed = required.filter(obj => obj.completed).length;
  return Math.round((completed / required.length) * 100);
}

// ============================================================================
// VICTORY CONDITION CHECKING
// ============================================================================

export interface VictoryCheckResult {
  isVictory: boolean;
  condition?: VictoryCondition;
  message: string;
}

export interface DefeatCheckResult {
  isDefeat: boolean;
  condition?: DefeatCondition;
  message: string;
}

/**
 * Checks if victory conditions are met
 */
export function checkVictoryConditions(
  scenario: Scenario,
  gameState: {
    players: Player[];
    enemies: Enemy[];
    board: Tile[];
    round: number;
    doom: number;
    questItemsCollected: string[];
    survivors?: Survivor[];
  }
): VictoryCheckResult {
  for (const condition of scenario.victoryConditions) {
    const result = checkSingleVictoryCondition(condition, scenario, gameState);
    if (result.isVictory) {
      return result;
    }
  }

  return {
    isVictory: false,
    message: ''
  };
}

/**
 * Checks a single victory condition
 */
function checkSingleVictoryCondition(
  condition: VictoryCondition,
  scenario: Scenario,
  gameState: {
    players: Player[];
    enemies: Enemy[];
    board: Tile[];
    round: number;
    doom: number;
    questItemsCollected: string[];
    survivors?: Survivor[];
  }
): VictoryCheckResult {
  // Check required objectives
  const requiredMet = condition.requiredObjectives.every(objId => {
    const obj = scenario.objectives.find(o => o.id === objId);
    return obj?.completed;
  });

  // Check "any of" objectives if specified
  let anyOfMet = true;
  if (condition.anyOfObjectives && condition.anyOfObjectives.length > 0) {
    anyOfMet = condition.anyOfObjectives.some(objId => {
      const obj = scenario.objectives.find(o => o.id === objId);
      return obj?.completed;
    });
  }

  // Run type-specific checks
  let typeCheckPassed = false;

  switch (condition.type) {
    case 'escape':
      typeCheckPassed = checkEscapeVictory(gameState, scenario);
      break;
    case 'escort':
      typeCheckPassed = checkEscortVictory(gameState, scenario);
      break;
    case 'assassination':
      typeCheckPassed = checkAssassinationVictory(scenario, gameState);
      break;
    case 'survival':
      typeCheckPassed = checkSurvivalVictory(scenario, gameState);
      break;
    case 'collection':
      typeCheckPassed = checkCollectionVictory(scenario, gameState);
      break;
    case 'ritual':
      typeCheckPassed = checkRitualVictory(scenario, gameState);
      break;
    case 'investigation':
      typeCheckPassed = checkInvestigationVictory(scenario, gameState);
      break;
    default:
      typeCheckPassed = requiredMet;
  }

  const isVictory = requiredMet && anyOfMet && typeCheckPassed;

  return {
    isVictory,
    condition: isVictory ? condition : undefined,
    message: isVictory ? getVictoryMessage(condition.type) : ''
  };
}

/**
 * Check escape victory - player must be on exit tile with required items
 * UPDATED: Now properly checks that required quest items (keys, artifacts) are collected
 * UPDATED 2: Now also checks escort objectives (NPCs that must be rescued)
 */
function checkEscapeVictory(
  gameState: {
    players: Player[];
    board: Tile[];
    questItemsCollected: string[];
    survivors?: Survivor[];
  },
  scenario?: Scenario
): boolean {
  // Check if any living player is on an exit tile
  const alivePlayers = gameState.players.filter(p => !p.isDead);

  // Find exit tile - check for exit_door object type first, then fallback to name/isGate
  const exitTile = gameState.board.find(t =>
    t.object?.type === 'exit_door' ||
    t.name.toLowerCase().includes('exit') ||
    t.isGate
  );

  if (!exitTile) return false;

  // Check if player is on exit tile
  const playerOnExit = alivePlayers.some(p =>
    p.position.q === exitTile.q && p.position.r === exitTile.r
  );

  if (!playerOnExit) return false;

  // If scenario is provided, check that required quest items are collected
  if (scenario) {
    // Find all required find_item objectives that must be completed before escape
    const requiredItemObjectives = scenario.objectives.filter(obj =>
      obj.type === 'find_item' &&
      !obj.isOptional &&
      !obj.isHidden // Only check visible objectives
    );

    // Check if all required item objectives are completed
    const allRequiredItemsFound = requiredItemObjectives.every(obj => obj.completed);

    if (!allRequiredItemsFound) {
      // Player is on exit but hasn't collected required items
      return false;
    }

    // Check escort objectives - NPCs that must be rescued before escape
    const escortObjectives = scenario.objectives.filter(obj =>
      obj.type === 'escort' && !obj.isOptional && !obj.isHidden
    );

    if (escortObjectives.length > 0) {
      // All escort objectives must be completed (survivors rescued)
      const allEscortComplete = escortObjectives.every(obj => obj.completed);
      if (!allEscortComplete) {
        return false;
      }
    }

    // Also check that the escape objective itself exists and is not hidden
    const escapeObjective = scenario.objectives.find(obj => obj.type === 'escape');
    if (escapeObjective?.isHidden) {
      // Escape objective is still hidden (prerequisites not met)
      return false;
    }
  }

  // All checks passed - player can escape
  return true;
}

/**
 * Check escort victory - required survivors must be rescued
 * Used for rescue missions where specific NPCs must reach safety
 */
function checkEscortVictory(
  gameState: {
    players: Player[];
    board: Tile[];
    survivors?: Survivor[];
  },
  scenario?: Scenario
): boolean {
  if (!scenario) return false;

  // Find escort objectives
  const escortObjectives = scenario.objectives.filter(obj =>
    obj.type === 'escort' && !obj.isOptional
  );

  if (escortObjectives.length === 0) {
    // No escort objectives - check if all required objectives are complete
    const requiredObjectives = scenario.objectives.filter(obj => !obj.isOptional);
    return requiredObjectives.every(obj => obj.completed);
  }

  // Check if all escort objectives are completed
  const allEscortComplete = escortObjectives.every(obj => obj.completed);

  if (!allEscortComplete && gameState.survivors) {
    // Check if required survivors are rescued
    const requiredRescueCount = escortObjectives.reduce(
      (sum, obj) => sum + (obj.targetAmount || 1), 0
    );
    const rescuedCount = gameState.survivors.filter(s => s.state === 'rescued').length;

    if (rescuedCount < requiredRescueCount) {
      return false;
    }
  }

  // Check if player is on exit with all escort requirements met
  const alivePlayers = gameState.players.filter(p => !p.isDead);
  const exitTile = gameState.board.find(t =>
    t.object?.type === 'exit_door' ||
    t.name.toLowerCase().includes('exit') ||
    t.isGate
  );

  if (!exitTile) return false;

  const playerOnExit = alivePlayers.some(p =>
    p.position.q === exitTile.q && p.position.r === exitTile.r
  );

  return playerOnExit && allEscortComplete;
}

/**
 * Check assassination victory - target boss/enemy must be dead
 */
function checkAssassinationVictory(
  scenario: Scenario,
  gameState: { enemies: Enemy[] }
): boolean {
  const assassinationObjective = scenario.objectives.find(
    obj => obj.type === 'kill_boss' && !obj.isOptional
  );

  if (!assassinationObjective) return false;

  // Check if the target is NOT in the enemies list (i.e., killed)
  const targetType = assassinationObjective.targetId;
  const targetAlive = gameState.enemies.some(e => e.type === targetType);

  return !targetAlive && assassinationObjective.completed;
}

/**
 * Check survival victory - survived required number of rounds
 */
function checkSurvivalVictory(
  scenario: Scenario,
  gameState: { round: number; players: Player[] }
): boolean {
  const survivalObjective = scenario.objectives.find(
    obj => obj.type === 'survive' && !obj.isOptional && !obj.isHidden
  );

  if (!survivalObjective) return false;

  const requiredRounds = survivalObjective.targetAmount || 10;
  const hasLivingPlayers = gameState.players.some(p => !p.isDead);

  return gameState.round >= requiredRounds && hasLivingPlayers;
}

/**
 * Check collection victory - collected required items
 */
function checkCollectionVictory(
  scenario: Scenario,
  gameState: { questItemsCollected: string[] }
): boolean {
  const collectionObjectives = scenario.objectives.filter(
    obj => obj.type === 'collect' && !obj.isOptional
  );

  return collectionObjectives.every(obj => obj.completed);
}

/**
 * Check ritual victory - performed required ritual
 */
function checkRitualVictory(
  scenario: Scenario,
  _gameState: unknown
): boolean {
  const ritualObjective = scenario.objectives.find(
    obj => obj.type === 'ritual' && !obj.isOptional
  );

  return ritualObjective?.completed || false;
}

/**
 * Check investigation victory - all required investigation objectives complete
 * This includes: collect (gathering clues), find_item, find_tile, and interact (final confrontation)
 */
function checkInvestigationVictory(
  scenario: Scenario,
  _gameState: unknown
): boolean {
  // Investigation missions require ALL non-optional, non-hidden objectives to be complete
  const investigationObjectives = scenario.objectives.filter(
    obj => !obj.isOptional && !obj.isHidden &&
           (obj.type === 'collect' || obj.type === 'find_item' ||
            obj.type === 'find_tile' || obj.type === 'interact')
  );

  return investigationObjectives.length > 0 &&
         investigationObjectives.every(obj => obj.completed);
}

// ============================================================================
// DEFEAT CONDITION CHECKING
// ============================================================================

/**
 * Checks if defeat conditions are met
 */
export function checkDefeatConditions(
  scenario: Scenario,
  gameState: {
    players: Player[];
    doom: number;
    round: number;
    survivors?: Survivor[];
  }
): DefeatCheckResult {
  for (const condition of scenario.defeatConditions) {
    const result = checkSingleDefeatCondition(condition, scenario, gameState);
    if (result.isDefeat) {
      return result;
    }
  }

  return {
    isDefeat: false,
    message: ''
  };
}

/**
 * Checks a single defeat condition
 */
function checkSingleDefeatCondition(
  condition: DefeatCondition,
  scenario: Scenario,
  gameState: {
    players: Player[];
    doom: number;
    round: number;
    survivors?: Survivor[];
  }
): DefeatCheckResult {
  switch (condition.type) {
    case 'all_dead':
      const allDead = gameState.players.length > 0 &&
                      gameState.players.every(p => p.isDead);
      return {
        isDefeat: allDead,
        condition: allDead ? condition : undefined,
        message: allDead ? 'All investigators have fallen. The darkness claims victory.' : ''
      };

    case 'doom_zero':
      const doomZero = gameState.doom <= 0;
      return {
        isDefeat: doomZero,
        condition: doomZero ? condition : undefined,
        message: doomZero ? 'The doom counter reaches zero. The Old Ones stir...' : ''
      };

    case 'objective_failed':
      if (condition.objectiveId) {
        const obj = scenario.objectives.find(o => o.id === condition.objectiveId);
        // Check if objective has a failed condition that was met
        if (obj?.failedCondition === 'all_dead' && gameState.players.every(p => p.isDead)) {
          return {
            isDefeat: true,
            condition,
            message: condition.description
          };
        }

        // Check for NPC death condition (escort missions)
        if (obj?.failedCondition === 'npc_death' && gameState.survivors) {
          // Check if any required escort NPC has died
          const deadEscortNpc = gameState.survivors.find(s =>
            s.state === 'dead' && obj.type === 'escort'
          );
          if (deadEscortNpc) {
            return {
              isDefeat: true,
              condition,
              message: condition.description || `${deadEscortNpc.name} has been killed. The mission has failed.`
            };
          }
        }

        // Check for escort objective with specific NPC ID
        if (obj?.type === 'escort' && (condition as any).npcId && gameState.survivors) {
          const escortNpc = gameState.survivors.find(s => s.id === (condition as any).npcId);
          if (escortNpc?.state === 'dead') {
            return {
              isDefeat: true,
              condition,
              message: condition.description || `${escortNpc.name} has been killed.`
            };
          }
        }
      }
      return { isDefeat: false, message: '' };

    case 'npc_death':
      // Direct NPC death defeat condition
      if (gameState.survivors) {
        const requiredNpcId = (condition as any).npcId;
        if (requiredNpcId) {
          const npc = gameState.survivors.find(s => s.id === requiredNpcId);
          if (npc?.state === 'dead') {
            return {
              isDefeat: true,
              condition,
              message: condition.description || `${npc.name} has been killed. You have failed.`
            };
          }
        } else {
          // Check if ANY following NPC has died (for generic escort scenarios)
          const deadFollower = gameState.survivors.find(s =>
            s.state === 'dead' && s.followingPlayerId
          );
          if (deadFollower) {
            return {
              isDefeat: true,
              condition,
              message: condition.description || `${deadFollower.name} has been killed.`
            };
          }
        }
      }
      return { isDefeat: false, message: '' };

    case 'time_expired':
      // Could add round limit checking here
      return { isDefeat: false, message: '' };

    default:
      return { isDefeat: false, message: '' };
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Gets a flavor message for victory type
 */
function getVictoryMessage(victoryType: string): string {
  switch (victoryType) {
    case 'escape':
      return 'You have escaped! The nightmare is over... for now.';
    case 'escort':
      return 'All survivors have been rescued! Their stories will be told.';
    case 'assassination':
      return 'The threat has been eliminated. The ritual is stopped.';
    case 'survival':
      return 'Dawn breaks over Arkham. You have survived the night.';
    case 'collection':
      return 'All artifacts have been gathered. The seal is complete.';
    case 'ritual':
      return 'The counter-ritual is complete. The barrier holds.';
    case 'investigation':
      return 'The truth has been uncovered. Knowledge is your weapon.';
    default:
      return 'Victory is yours!';
  }
}

/**
 * Get objective progress text for display
 */
export function getObjectiveProgressText(objective: ScenarioObjective): string {
  if (objective.completed) {
    return 'COMPLETE';
  }

  if (objective.targetAmount && objective.targetAmount > 1) {
    const current = objective.currentAmount || 0;
    return `${current}/${objective.targetAmount}`;
  }

  return 'In Progress';
}

/**
 * Check if a specific item trigger should update objectives
 */
export function checkItemObjectives(
  scenario: Scenario,
  itemId: string
): { objective: ScenarioObjective | null; shouldComplete: boolean } {
  const matchingObjective = scenario.objectives.find(
    obj => obj.type === 'find_item' && obj.targetId === itemId && !obj.completed
  );

  if (matchingObjective) {
    return {
      objective: matchingObjective,
      shouldComplete: true
    };
  }

  // Check for collection objectives
  const collectObjective = scenario.objectives.find(
    obj => obj.type === 'collect' && obj.targetId === itemId && !obj.completed
  );

  if (collectObjective) {
    const newAmount = (collectObjective.currentAmount || 0) + 1;
    return {
      objective: collectObjective,
      shouldComplete: newAmount >= (collectObjective.targetAmount || 1)
    };
  }

  return { objective: null, shouldComplete: false };
}

/**
 * Check if killing an enemy should update objectives
 */
export function checkKillObjectives(
  scenario: Scenario,
  enemyType: string
): { objective: ScenarioObjective | null; shouldComplete: boolean } {
  // Check for kill_boss objectives
  const bossObjective = scenario.objectives.find(
    obj => obj.type === 'kill_boss' && obj.targetId === enemyType && !obj.completed
  );

  if (bossObjective) {
    return { objective: bossObjective, shouldComplete: true };
  }

  // Check for kill_enemy objectives
  const killObjective = scenario.objectives.find(
    obj => obj.type === 'kill_enemy' && obj.targetId === enemyType && !obj.completed
  );

  if (killObjective) {
    const newAmount = (killObjective.currentAmount || 0) + 1;
    return {
      objective: killObjective,
      shouldComplete: newAmount >= (killObjective.targetAmount || 1)
    };
  }

  // Check for final_confrontation interact objectives (killed the final boss)
  // This handles investigation missions where the "confront_truth" objective
  // requires killing the spawned boss
  const isBossType = ['shoggoth', 'star_spawn', 'dark_young', 'hunting_horror', 'ancient_one'].includes(enemyType);
  if (isBossType) {
    const confrontObjective = scenario.objectives.find(
      obj => obj.type === 'interact' &&
             obj.targetId?.includes('final_confrontation') &&
             !obj.completed &&
             !obj.isHidden
    );

    if (confrontObjective) {
      return { objective: confrontObjective, shouldComplete: true };
    }
  }

  return { objective: null, shouldComplete: false };
}

/**
 * Check if exploring a tile should update objectives
 */
export function checkExploreObjectives(
  scenario: Scenario,
  tileName: string,
  tileId: string
): { objective: ScenarioObjective | null; shouldComplete: boolean } {
  const tileObjective = scenario.objectives.find(
    obj => obj.type === 'find_tile' &&
    (obj.targetId === tileName || obj.targetId === tileId) &&
    !obj.completed
  );

  if (tileObjective) {
    return { objective: tileObjective, shouldComplete: true };
  }

  // Check for explore objectives (count-based)
  const exploreObjective = scenario.objectives.find(
    obj => obj.type === 'explore' && !obj.completed
  );

  if (exploreObjective) {
    const newAmount = (exploreObjective.currentAmount || 0) + 1;
    return {
      objective: exploreObjective,
      shouldComplete: newAmount >= (exploreObjective.targetAmount || 1)
    };
  }

  return { objective: null, shouldComplete: false };
}

/**
 * Update survival objectives based on current round
 */
export function updateSurvivalObjectives(
  scenario: Scenario,
  currentRound: number
): Scenario {
  const updatedObjectives = scenario.objectives.map(obj => {
    if (obj.type === 'survive' && !obj.completed) {
      const targetRounds = obj.targetAmount || 10;
      const isComplete = currentRound >= targetRounds;

      return {
        ...obj,
        currentAmount: currentRound,
        completed: isComplete
      };
    }
    return obj;
  });

  // Reveal hidden objectives
  const revealedObjectives = updatedObjectives.map(obj => {
    if (obj.isHidden && obj.revealedBy) {
      const revealingObj = updatedObjectives.find(o => o.id === obj.revealedBy);
      if (revealingObj?.completed) {
        return { ...obj, isHidden: false };
      }
    }
    return obj;
  });

  return {
    ...scenario,
    objectives: revealedObjectives
  };
}
