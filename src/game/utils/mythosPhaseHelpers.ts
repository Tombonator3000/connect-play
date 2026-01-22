/**
 * mythosPhaseHelpers.ts
 *
 * Helper functions for the Mythos phase transition in ShadowsGame.
 * Extracted from handleMythosOverlayComplete() for clarity and testability.
 */

import { Player, Scenario, ScenarioObjective, WeatherState, WeatherCondition } from '../types';
import { getWeatherForDoom, getWeatherEffect } from '../constants';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Result of calculating doom with dark insight penalty
 */
export interface DoomCalculationResult {
  newDoom: number;
  darkInsightPenalty: number;
  baseDoomTick: number;
  affectedPlayers: Player[];
}

/**
 * Result of checking for newly completed survival objectives
 */
export interface SurvivalCompletionResult {
  newlyCompletedObjectives: ScenarioObjective[];
  hasNewCompletions: boolean;
}

/**
 * Result of weather state update for new round
 */
export interface WeatherUpdateResult {
  weatherState: WeatherState;
  weatherExpired: boolean;
  newWeatherTriggered: boolean;
  weatherMessage: string | null;
}

// ============================================================================
// DOOM CALCULATION
// ============================================================================

/**
 * Calculate the base doom tick for a round based on scenario configuration.
 * New pressure-based doom system: doom can tick 0, 1, or every N rounds.
 *
 * @param scenario - Current scenario with doom configuration
 * @param currentRound - The round number (used for doomTickEveryNRounds)
 * @returns The base doom tick amount (0 or negative number)
 */
export function calculateBaseDoomTick(
  scenario: Scenario | null,
  currentRound: number
): number {
  if (!scenario) {
    // No scenario - use legacy default of -1 per round
    return -1;
  }

  // Check for explicit doomTickPerRound setting
  const tickPerRound = scenario.doomTickPerRound;
  if (tickPerRound !== undefined) {
    return -tickPerRound; // Negative because it's a decrease
  }

  // Check for doomTickEveryNRounds (doom ticks only every N rounds)
  const tickEveryN = scenario.doomTickEveryNRounds;
  if (tickEveryN !== undefined && tickEveryN > 0) {
    // Only tick on rounds divisible by N
    if (currentRound % tickEveryN === 0) {
      return -1;
    }
    return 0; // No tick this round
  }

  // Default: NO automatic doom tick (new default for pressure-based system)
  return 0;
}

/**
 * Calculate new doom value including dark insight penalty.
 * Players with dark_insight madness cause extra doom loss.
 *
 * UPDATED: Now uses scenario-configurable doom tick instead of always -1.
 *
 * @param currentDoom - Current doom value
 * @param players - All players in the game
 * @param scenario - Current scenario with doom configuration (optional)
 * @param currentRound - Current round number (for doomTickEveryNRounds)
 * @returns Doom calculation result with penalty details
 */
export function calculateDoomWithDarkInsightPenalty(
  currentDoom: number,
  players: Player[],
  scenario?: Scenario | null,
  currentRound: number = 1
): DoomCalculationResult {
  const affectedPlayers = players.filter(
    p => !p.isDead && p.activeMadness?.type === 'dark_insight'
  );
  const darkInsightPenalty = affectedPlayers.length;

  // Get configurable base doom tick (0 by default in new system)
  const baseDoomTick = calculateBaseDoomTick(scenario ?? null, currentRound);

  // Calculate new doom: current + baseTick - darkInsightPenalty
  const newDoom = currentDoom + baseDoomTick - darkInsightPenalty;

  return {
    newDoom,
    baseDoomTick,
    darkInsightPenalty,
    affectedPlayers
  };
}

// ============================================================================
// SURVIVAL OBJECTIVE CHECKING
// ============================================================================

/**
 * Find survival objectives that were just completed this round.
 * Compares current scenario objectives with previous state.
 *
 * @param updatedScenario - Scenario with updated objectives
 * @param previousScenario - Scenario before objective updates
 * @returns Newly completed survival objectives
 */
export function findNewlyCompletedSurvivalObjectives(
  updatedScenario: Scenario,
  previousScenario: Scenario
): SurvivalCompletionResult {
  const currentCompleted = updatedScenario.objectives.filter(
    obj => obj.type === 'survive' && obj.completed
  );
  const previouslyCompleted = previousScenario.objectives.filter(
    obj => obj.type === 'survive' && obj.completed
  );

  const newlyCompletedObjectives = currentCompleted.filter(
    obj => !previouslyCompleted.some(prev => prev.id === obj.id)
  );

  return {
    newlyCompletedObjectives,
    hasNewCompletions: newlyCompletedObjectives.length > 0
  };
}

// ============================================================================
// WEATHER STATE MANAGEMENT
// ============================================================================

/**
 * Update weather duration for the new round.
 * Decrements weather duration and removes expired weather.
 *
 * @param weatherState - Current weather state
 * @returns Updated weather state with expiration info
 */
export function updateWeatherDuration(
  weatherState: WeatherState
): { weatherState: WeatherState; expired: boolean } {
  if (!weatherState.global) {
    return { weatherState, expired: false };
  }

  // Duration of -1 means permanent weather
  if (weatherState.global.duration < 0) {
    return { weatherState, expired: false };
  }

  const newDuration = weatherState.global.duration - 1;

  if (newDuration <= 0) {
    // Weather expires
    return {
      weatherState: { ...weatherState, global: null },
      expired: true
    };
  }

  // Decrement duration
  return {
    weatherState: {
      ...weatherState,
      global: {
        ...weatherState.global,
        duration: newDuration
      }
    },
    expired: false
  };
}

/**
 * Check if doom level should trigger new weather.
 * Only triggers if no current weather is active.
 *
 * @param doom - Current doom value
 * @param currentWeatherState - Current weather state
 * @returns New weather state if triggered, null otherwise
 */
export function checkForNewWeatherFromDoom(
  doom: number,
  currentWeatherState: WeatherState
): { weatherState: WeatherState; weatherEffect: ReturnType<typeof getWeatherEffect> } | null {
  // Don't trigger new weather if already has global weather
  if (currentWeatherState.global) {
    return null;
  }

  const potentialWeather = getWeatherForDoom(doom);
  if (!potentialWeather) {
    return null;
  }

  const effect = getWeatherEffect(potentialWeather);
  const newWeatherState: WeatherState = {
    ...currentWeatherState,
    global: {
      type: potentialWeather,
      intensity: doom <= 3 ? 'heavy' : doom <= 6 ? 'moderate' : 'light',
      duration: -1 // Permanent until doom changes
    },
    isTransitioning: true,
    transitionProgress: 0
  };

  return {
    weatherState: newWeatherState,
    weatherEffect: effect
  };
}

/**
 * Process all weather updates for a new round.
 * Combines duration update and doom-based weather triggering.
 *
 * @param currentWeatherState - Current weather state
 * @param newDoom - New doom value for this round
 * @returns Complete weather update result
 */
export function processWeatherForNewRound(
  currentWeatherState: WeatherState,
  newDoom: number
): WeatherUpdateResult {
  // First, update weather duration
  const { weatherState: afterDuration, expired } = updateWeatherDuration(currentWeatherState);

  let finalWeatherState = afterDuration;
  let newWeatherTriggered = false;
  let weatherMessage: string | null = null;

  if (expired) {
    weatherMessage = "Været letter noe...";
  }

  // Then check for new weather from doom (only if no current weather)
  const newWeatherResult = checkForNewWeatherFromDoom(newDoom, finalWeatherState);
  if (newWeatherResult) {
    finalWeatherState = newWeatherResult.weatherState;
    newWeatherTriggered = true;
    weatherMessage = `WEATHER: ${newWeatherResult.weatherEffect.name} - ${newWeatherResult.weatherEffect.description}`;
  }

  return {
    weatherState: finalWeatherState,
    weatherExpired: expired,
    newWeatherTriggered,
    weatherMessage
  };
}
