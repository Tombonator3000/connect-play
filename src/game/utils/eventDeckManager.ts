/**
 * EVENT DECK MANAGER
 * Handles shuffling, drawing, and cycling of event cards
 * Based on Mansions of Madness / Arkham Horror deck mechanics
 */

import { EventCard, GameState, Player, WeatherType, WeatherIntensity } from '../types';
import { EVENTS, ENEMIES } from '../constants';

// ============================================================================
// DECK INITIALIZATION
// ============================================================================

/**
 * Create a shuffled copy of the event deck
 * Uses Fisher-Yates shuffle for true randomization
 */
export function createShuffledEventDeck(): EventCard[] {
  const deck = [...EVENTS];
  return shuffleArray(deck);
}

/**
 * Fisher-Yates shuffle algorithm
 * Produces unbiased permutation
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ============================================================================
// DECK OPERATIONS
// ============================================================================

/**
 * Draw the top card from the event deck
 * If deck is empty, shuffles discard pile back into deck
 * Returns null if both deck and discard are empty (shouldn't happen)
 */
export function drawEventCard(
  eventDeck: EventCard[],
  eventDiscardPile: EventCard[],
  currentDoom: number
): {
  card: EventCard | null;
  newDeck: EventCard[];
  newDiscardPile: EventCard[];
  reshuffled: boolean;
} {
  let deck = [...eventDeck];
  let discard = [...eventDiscardPile];
  let reshuffled = false;

  // If deck is empty, reshuffle discard pile
  if (deck.length === 0) {
    if (discard.length === 0) {
      // Both empty - shouldn't happen, but handle gracefully
      return { card: null, newDeck: [], newDiscardPile: [], reshuffled: false };
    }
    deck = shuffleArray(discard);
    discard = [];
    reshuffled = true;
  }

  // Draw top card
  const card = deck.shift() || null;

  // If card has doom threshold, check if it should be skipped
  if (card && card.doomThreshold !== undefined && currentDoom > card.doomThreshold) {
    // Card requires lower doom - put it at bottom and draw another
    deck.push(card);
    return drawEventCard(deck, discard, currentDoom);
  }

  return {
    card,
    newDeck: deck,
    newDiscardPile: discard,
    reshuffled
  };
}

/**
 * Discard a card to the discard pile
 */
export function discardEventCard(
  card: EventCard,
  discardPile: EventCard[]
): EventCard[] {
  return [...discardPile, card];
}

/**
 * Get the number of cards remaining in the deck
 */
export function getDeckCount(eventDeck: EventCard[]): number {
  return eventDeck.length;
}

/**
 * Get the number of cards in the discard pile
 */
export function getDiscardCount(discardPile: EventCard[]): number {
  return discardPile.length;
}

// ============================================================================
// EVENT EFFECT RESOLUTION
// ============================================================================

/**
 * Apply the effects of an event card to the game state
 * Returns updated state and log messages
 */
export function resolveEventEffect(
  event: EventCard,
  state: GameState,
  targetPlayerIndex?: number,
  skillCheckPassed?: boolean
): {
  updatedState: Partial<GameState>;
  logMessages: string[];
  spawnEnemies?: { type: string; count: number; nearPlayerId: string };
  weatherChange?: { type: WeatherType; duration: number };
} {
  const logMessages: string[] = [];
  const updatedState: Partial<GameState> = {};
  let spawnEnemies: { type: string; count: number; nearPlayerId: string } | undefined;
  let weatherChange: { type: WeatherType; duration: number } | undefined;

  // If skill check was available and passed, skip the effect
  if (event.skillCheck && skillCheckPassed) {
    logMessages.push(`[EVENT] ${event.skillCheck.successDescription}`);
    return { updatedState, logMessages };
  }

  // Show failure description if skill check failed
  if (event.skillCheck && !skillCheckPassed) {
    logMessages.push(`[EVENT] ${event.skillCheck.failureDescription}`);
  }

  // Target player (active player if not specified)
  const targetIdx = targetPlayerIndex ?? state.activePlayerIndex;
  const players = [...state.players];

  // Apply primary effect
  const primaryResult = applyEffect(
    event.effectType,
    event.value,
    players,
    targetIdx,
    state,
    event
  );
  logMessages.push(...primaryResult.logMessages);
  if (primaryResult.spawnEnemies) spawnEnemies = primaryResult.spawnEnemies;
  if (primaryResult.weatherChange) weatherChange = primaryResult.weatherChange;
  if (primaryResult.doomChange !== undefined) {
    updatedState.doom = Math.max(0, state.doom + primaryResult.doomChange);
  }

  // Apply secondary effect if present
  if (event.secondaryEffect) {
    const secondaryResult = applyEffect(
      event.secondaryEffect.type,
      event.secondaryEffect.value,
      players,
      targetIdx,
      state,
      event
    );
    logMessages.push(...secondaryResult.logMessages);
    if (secondaryResult.spawnEnemies && !spawnEnemies) {
      spawnEnemies = secondaryResult.spawnEnemies;
    }
    if (secondaryResult.weatherChange && !weatherChange) {
      weatherChange = secondaryResult.weatherChange;
    }
    if (secondaryResult.doomChange !== undefined) {
      const currentDoom = updatedState.doom ?? state.doom;
      updatedState.doom = Math.max(0, currentDoom + secondaryResult.doomChange);
    }
  }

  updatedState.players = players;

  return { updatedState, logMessages, spawnEnemies, weatherChange };
}

/**
 * Apply a single effect type
 */
function applyEffect(
  effectType: string,
  value: number,
  players: Player[],
  targetIdx: number,
  state: GameState,
  event: EventCard
): {
  logMessages: string[];
  spawnEnemies?: { type: string; count: number; nearPlayerId: string };
  weatherChange?: { type: WeatherType; duration: number };
  doomChange?: number;
} {
  const logMessages: string[] = [];
  const targetPlayer = players[targetIdx];

  switch (effectType) {
    case 'sanity': {
      const newSanity = Math.max(0, Math.min(targetPlayer.maxSanity, targetPlayer.sanity + value));
      const actualChange = newSanity - targetPlayer.sanity;
      players[targetIdx] = { ...targetPlayer, sanity: newSanity };
      if (actualChange !== 0) {
        logMessages.push(`${targetPlayer.name} ${actualChange > 0 ? 'gains' : 'loses'} ${Math.abs(actualChange)} Sanity`);
      }
      break;
    }

    case 'health': {
      const newHealth = Math.max(0, Math.min(targetPlayer.maxVitality, targetPlayer.vitality + value));
      const actualChange = newHealth - targetPlayer.vitality;
      players[targetIdx] = { ...targetPlayer, vitality: newHealth };
      if (actualChange !== 0) {
        logMessages.push(`${targetPlayer.name} ${actualChange > 0 ? 'heals' : 'takes'} ${Math.abs(actualChange)} HP`);
      }
      break;
    }

    case 'all_sanity': {
      players.forEach((player, idx) => {
        if (player.vitality > 0) {
          const newSanity = Math.max(0, Math.min(player.maxSanity, player.sanity + value));
          players[idx] = { ...player, sanity: newSanity };
        }
      });
      logMessages.push(`All players ${value > 0 ? 'gain' : 'lose'} ${Math.abs(value)} Sanity`);
      break;
    }

    case 'all_health': {
      players.forEach((player, idx) => {
        if (player.vitality > 0) {
          const newHealth = Math.max(0, Math.min(player.maxVitality, player.vitality + value));
          players[idx] = { ...player, vitality: newHealth };
        }
      });
      logMessages.push(`All players ${value > 0 ? 'heal' : 'take'} ${Math.abs(value)} HP`);
      break;
    }

    case 'insight': {
      const newInsight = Math.max(0, (targetPlayer.insight || 0) + value);
      players[targetIdx] = { ...targetPlayer, insight: newInsight };
      logMessages.push(`${targetPlayer.name} gains ${value} Insight`);
      break;
    }

    case 'doom': {
      return { logMessages: [`Doom ${value > 0 ? 'increases' : 'decreases'} by ${Math.abs(value)}`], doomChange: value };
    }

    case 'spawn': {
      const spawnType = event.spawnType || 'cultist';
      const count = Math.abs(value);
      const alivePlayers = players.filter(p => p.vitality > 0);
      const randomPlayer = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
      logMessages.push(`${count} ${spawnType}(s) appear!`);
      return {
        logMessages,
        spawnEnemies: { type: spawnType, count, nearPlayerId: randomPlayer?.id || '' }
      };
    }

    case 'weather': {
      const weatherType = (event.weatherType as WeatherType) || 'fog';
      const duration = Math.abs(value);
      logMessages.push(`${weatherType.replace('_', ' ')} settles over the area (${duration} rounds)`);
      return {
        logMessages,
        weatherChange: { type: weatherType, duration }
      };
    }

    case 'buff_enemies': {
      // Enemies get +1 attack die until end of scenario
      // This would need to be tracked in game state - for now just log
      logMessages.push(`Enemies grow stronger! +${value} attack die`);
      break;
    }

    case 'debuff_player': {
      // Player gets -1 AP next turn
      // This would need a debuff system - for now apply small sanity hit
      const newSanity = Math.max(0, targetPlayer.sanity - 1);
      players[targetIdx] = { ...targetPlayer, sanity: newSanity };
      logMessages.push(`${targetPlayer.name} feels weakened (-1 Sanity)`);
      break;
    }

    case 'item': {
      // Grant an item - would need inventory integration
      logMessages.push(`${targetPlayer.name} finds supplies!`);
      break;
    }

    case 'teleport': {
      // Move player to random explored tile - complex, skip for now
      logMessages.push(`${targetPlayer.name} feels disoriented...`);
      break;
    }
  }

  return { logMessages };
}

// ============================================================================
// SKILL CHECK FOR EVENTS
// ============================================================================

/**
 * Perform a skill check for an event
 * Returns true if the check is passed
 */
export function performEventSkillCheck(
  player: Player,
  attribute: 'strength' | 'agility' | 'intellect' | 'willpower',
  dc: number
): {
  success: boolean;
  rolls: number[];
  successes: number;
} {
  const baseDice = 2;
  const attributeValue = player.attributes[attribute];
  const totalDice = baseDice + attributeValue;

  const rolls: number[] = [];
  let successes = 0;

  for (let i = 0; i < totalDice; i++) {
    const roll = Math.floor(Math.random() * 6) + 1;
    rolls.push(roll);
    if (roll >= dc) {
      successes++;
    }
  }

  return {
    success: successes >= 1,
    rolls,
    successes
  };
}

// ============================================================================
// DECK STATE HELPERS
// ============================================================================

/**
 * Get a summary of the current deck state
 */
export function getDeckState(eventDeck: EventCard[], discardPile: EventCard[]): {
  deckSize: number;
  discardSize: number;
  totalCards: number;
  percentRemaining: number;
} {
  const deckSize = eventDeck.length;
  const discardSize = discardPile.length;
  const totalCards = deckSize + discardSize;
  const percentRemaining = totalCards > 0 ? Math.round((deckSize / totalCards) * 100) : 0;

  return { deckSize, discardSize, totalCards, percentRemaining };
}

/**
 * Peek at the top card without drawing (for preview/debug)
 */
export function peekTopCard(eventDeck: EventCard[]): EventCard | null {
  return eventDeck[0] || null;
}

/**
 * Force reshuffle (for game events that require it)
 */
export function forceReshuffle(
  eventDeck: EventCard[],
  discardPile: EventCard[]
): EventCard[] {
  const allCards = [...eventDeck, ...discardPile];
  return shuffleArray(allCards);
}
