/**
 * Mythos Phase Utilities
 *
 * REFACTORED: Extracted from the monolithic runEnemyAI function in ShadowsGame.tsx
 *
 * This module handles all the discrete phases of the Mythos turn:
 * 1. Portal spawning - Enemies emerge from active eldritch portals
 * 2. Guaranteed spawns - Quest items/tiles force-spawn to ensure winnable scenarios
 * 3. Enemy combat - Processing enemy attacks and damage
 * 4. Event card drawing - Random event cards drawn at end of mythos phase
 * 5. Phase transitions - Reset player actions and move to next phase
 *
 * Each function has a single responsibility and can be unit tested independently.
 */

import { Tile, Enemy, EnemyType, Player, Item, Scenario, LogEntry, GamePhase } from '../types';
import { ObjectiveSpawnState, checkGuaranteedSpawns, executeGuaranteedSpawns } from './objectiveSpawner';
import { processEnemyTurn } from './monsterAI';
import { calculateEnemyDamage } from './combatUtils';
import { getCombatModifier, calculateDesperateBonuses } from '../constants';
import { drawEventCard } from './eventDeckManager';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Data for a portal that can spawn enemies
 */
export interface PortalSpawnData {
  tileId: string;
  q: number;
  r: number;
  types: EnemyType[];
  chance: number;
}

/**
 * Result of portal spawn processing
 */
export interface PortalSpawnResult {
  spawns: Array<{
    enemyType: EnemyType;
    q: number;
    r: number;
  }>;
  messages: string[];
  floatingTexts: Array<{
    q: number;
    r: number;
    text: string;
    colorClass: string;
  }>;
}

/**
 * Result of guaranteed spawn processing
 */
export interface GuaranteedSpawnProcessResult {
  updatedBoard: Tile[];
  updatedSpawnState: ObjectiveSpawnState;
  messages: string[];
  floatingTexts: Array<{
    q: number;
    r: number;
    text: string;
    colorClass: string;
  }>;
  urgencyMessage: string | null;
}

/**
 * Individual attack data for processing in the component
 */
export interface ProcessedAttack {
  enemy: Enemy;
  targetPlayerId: string;
  targetPlayerName: string;
  targetPosition: { q: number; r: number };
  hpDamage: number;
  sanityDamage: number;
  isRanged: boolean;
  coverPenalty: number;
  message: string;
}

/**
 * Result of enemy combat processing
 * Note: Player updates must be done in the component using checkMadness/applyAllyDeathSanityLoss
 * since those functions depend on local component state (addFloatingText, addToLog)
 */
export interface EnemyCombatResult {
  updatedEnemies: Enemy[];
  processedAttacks: ProcessedAttack[];
  aiMessages: string[];
  floatingTexts: Array<{
    q: number;
    r: number;
    text: string;
    colorClass: string;
  }>;
  bloodstains: Array<{
    q: number;
    r: number;
    amount: number;
  }>;
  specialEvents: Array<{
    type: 'teleport' | 'phase' | 'destruction';
    enemy: Enemy;
    description: string;
  }>;
  screenShakeRequired: boolean;
}

/**
 * Result of event card drawing
 */
export interface EventCardResult {
  card: any | null;
  newDeck: any[];
  newDiscardPile: any[];
  reshuffled: boolean;
  message: string | null;
}

/**
 * Result of player reset for new turn
 */
export interface PlayerResetResult {
  resetPlayers: Player[];
}

// ============================================================================
// PORTAL SPAWNING
// ============================================================================

/**
 * Collect all active portals from the board that can spawn enemies
 */
export function collectActivePortals(board: Tile[]): PortalSpawnData[] {
  const portals: PortalSpawnData[] = [];

  for (const tile of board) {
    if (tile.object?.type === 'eldritch_portal' && tile.object.portalActive) {
      const spawnChance = tile.object.portalSpawnChance ?? 50;
      const spawnTypes = tile.object.portalSpawnTypes ?? ['cultist' as EnemyType];
      portals.push({
        tileId: tile.id,
        q: tile.q,
        r: tile.r,
        types: spawnTypes,
        chance: spawnChance
      });
    }
  }

  return portals;
}

/**
 * Process portal spawning - roll for each portal and determine spawns
 *
 * @param portals - Array of active portals
 * @returns Spawn results with messages and floating texts
 */
export function processPortalSpawns(portals: PortalSpawnData[]): PortalSpawnResult {
  const result: PortalSpawnResult = {
    spawns: [],
    messages: [],
    floatingTexts: []
  };

  for (const portal of portals) {
    if (Math.random() * 100 < portal.chance) {
      const enemyType = portal.types[Math.floor(Math.random() * portal.types.length)];

      result.spawns.push({
        enemyType,
        q: portal.q,
        r: portal.r
      });

      result.messages.push(`⚡ En ${enemyType} kryper ut av den eldritiske portalen!`);
      result.floatingTexts.push({
        q: portal.q,
        r: portal.r,
        text: "PORTAL SPAWN!",
        colorClass: "text-purple-400"
      });
    }
  }

  return result;
}

// ============================================================================
// GUARANTEED SPAWNS
// ============================================================================

/**
 * Process guaranteed spawns to ensure scenario is winnable
 *
 * This system force-spawns quest items and tiles when doom is getting low
 * to ensure players always have a chance to complete objectives.
 *
 * @param spawnState - Current objective spawn state
 * @param scenario - Active scenario with objectives
 * @param doom - Current doom value
 * @param board - Current game board
 * @returns Updated board and spawn state with messages
 */
export function processGuaranteedSpawns(
  spawnState: ObjectiveSpawnState,
  scenario: Scenario,
  doom: number,
  board: Tile[]
): GuaranteedSpawnProcessResult | null {
  const completedObjectiveIds = scenario.objectives
    .filter(o => o.completed)
    .map(o => o.id);

  const spawnCheck = checkGuaranteedSpawns(
    spawnState,
    scenario,
    doom,
    board,
    completedObjectiveIds
  );

  // No forced spawns needed
  if (spawnCheck.forcedItems.length === 0 && spawnCheck.forcedTiles.length === 0) {
    return null;
  }

  const { updatedState, itemSpawnLocations, tileModifications } = executeGuaranteedSpawns(
    spawnState,
    spawnCheck,
    board
  );

  const messages: string[] = [];
  const floatingTexts: GuaranteedSpawnProcessResult['floatingTexts'] = [];
  let updatedBoard = [...board];

  // Log warnings
  spawnCheck.warnings.forEach(warning => {
    messages.push(`⚠️ ${warning}`);
  });

  // Add items to tiles
  for (const spawn of itemSpawnLocations) {
    const tileIndex = updatedBoard.findIndex(t => t.id === spawn.tileId);
    if (tileIndex >= 0) {
      const tile = updatedBoard[tileIndex];
      const newItem: Item = {
        id: spawn.item.id,
        name: spawn.item.name,
        description: spawn.item.description,
        type: 'quest_item',
        category: 'special',
        isQuestItem: true,
        questItemType: spawn.item.type,
        objectiveId: spawn.item.objectiveId,
      };
      updatedBoard[tileIndex] = {
        ...tile,
        items: [...(tile.items || []), newItem],
        hasQuestItem: true,
      };
      messages.push(`✨ ${spawn.item.name} har materialisert seg i ${tile.name}!`);
      floatingTexts.push({
        q: tile.q,
        r: tile.r,
        text: "QUEST ITEM!",
        colorClass: "text-yellow-400"
      });
    }
  }

  // Apply quest tile modifications
  for (const mod of tileModifications) {
    const tileIndex = updatedBoard.findIndex(t => t.id === mod.tileId);
    if (tileIndex >= 0) {
      updatedBoard[tileIndex] = {
        ...updatedBoard[tileIndex],
        ...mod.modifications,
      };
      const tile = updatedBoard[tileIndex];
      messages.push(`🌟 ${mod.questTile.name} har blitt avslørt i ${tile.name}!`);
      floatingTexts.push({
        q: tile.q,
        r: tile.r,
        text: mod.questTile.type.toUpperCase() + "!",
        colorClass: "text-purple-400"
      });
    }
  }

  // Determine urgency message
  const urgencyMessage = spawnCheck.urgency === 'critical'
    ? "📜 Doom nærmer seg! Kritiske elementer har blitt avslørt for å gi deg en sjanse..."
    : spawnCheck.urgency === 'warning'
      ? "📜 Tiden er knapp. Noen skjulte elementer har avslørt seg selv..."
      : null;

  return {
    updatedBoard,
    updatedSpawnState: updatedState,
    messages,
    floatingTexts,
    urgencyMessage
  };
}

// ============================================================================
// ENEMY COMBAT PROCESSING
// ============================================================================

/**
 * Process enemy AI decisions and calculate damage
 *
 * Uses the enhanced AI system with smart targeting and special abilities.
 * Handles ranged attacks, cover penalties, and sanity damage.
 *
 * NOTE: This function returns processed attack data. The component must
 * apply damage to players using its local checkMadness/applyAllyDeathSanityLoss
 * functions since they depend on component state (addFloatingText, addToLog).
 *
 * @param enemies - All enemies on the board
 * @param players - All players
 * @param board - Current game board
 * @param doom - Current doom value (affects combat modifiers)
 * @param globalEnemyAttackBonus - Bonus from buff_enemies events
 * @returns Combat results with processed attacks (player updates done in component)
 */
export function processEnemyCombatPhase(
  enemies: Enemy[],
  players: Player[],
  board: Tile[],
  doom: number,
  globalEnemyAttackBonus: number = 0
): EnemyCombatResult {
  const result: EnemyCombatResult = {
    updatedEnemies: [],
    processedAttacks: [],
    aiMessages: [],
    floatingTexts: [],
    bloodstains: [],
    specialEvents: [],
    screenShakeRequired: false
  };

  // Use the enhanced AI system
  const { updatedEnemies, attacks, messages, specialEvents } = processEnemyTurn(
    enemies,
    players,
    board
  );

  result.updatedEnemies = updatedEnemies;
  result.aiMessages = [...messages];
  result.specialEvents = specialEvents || [];

  // Get combat modifier based on doom
  const combatModifier = getCombatModifier(doom);

  // Process attacks and prepare data for component to apply
  for (const attack of attacks) {
    const { enemy, targetPlayer, isRanged, coverPenalty } = attack;

    // Calculate damage including global enemy attack bonus
    const { hpDamage, sanityDamage, message } = calculateEnemyDamage(
      enemy,
      targetPlayer,
      globalEnemyAttackBonus
    );

    // Apply cover penalty for ranged attacks
    const coverReduction = isRanged && coverPenalty ? Math.min(coverPenalty, hpDamage) : 0;
    const totalHpDamage = Math.max(0, hpDamage + combatModifier.enemyDamageBonus - coverReduction);

    // Build attack message
    let attackMessage: string;
    if (isRanged) {
      const coverMsg = coverReduction > 0 ? ` (${coverReduction} blokkert av dekning)` : '';
      attackMessage = `🎯 ${message}${coverMsg}`;
    } else {
      attackMessage = message;
    }

    // Store processed attack data
    result.processedAttacks.push({
      enemy,
      targetPlayerId: targetPlayer.id,
      targetPlayerName: targetPlayer.name,
      targetPosition: { ...targetPlayer.position },
      hpDamage: totalHpDamage,
      sanityDamage,
      isRanged: !!isRanged,
      coverPenalty: coverPenalty || 0,
      message: attackMessage
    });

    // Prepare floating text
    const damageText = `-${totalHpDamage} HP${sanityDamage > 0 ? ` -${sanityDamage} SAN` : ''}`;
    result.floatingTexts.push({
      q: targetPlayer.position.q,
      r: targetPlayer.position.r,
      text: damageText,
      colorClass: "text-primary"
    });

    // Prepare bloodstains when physical damage is dealt
    if (totalHpDamage > 0) {
      result.bloodstains.push({
        q: targetPlayer.position.q,
        r: targetPlayer.position.r,
        amount: totalHpDamage
      });
      result.screenShakeRequired = true;
    }
  }

  return result;
}

/**
 * Apply attack damage to a player and determine if they died
 *
 * This is a pure function for calculating player state after damage.
 * Use with the component's checkMadness function afterwards.
 *
 * @param player - Target player
 * @param hpDamage - HP damage to apply
 * @param sanityDamage - Sanity damage to apply
 * @returns Updated player state and whether they died
 */
export function applyDamageToPlayer(
  player: Player,
  hpDamage: number,
  sanityDamage: number
): { updatedPlayer: Player; newlyDead: boolean } {
  const newHp = Math.max(0, player.hp - hpDamage);
  const newSanity = Math.max(0, player.sanity - sanityDamage);
  const wasDead = player.isDead;
  const isDead = newHp <= 0;

  return {
    updatedPlayer: { ...player, hp: newHp, sanity: newSanity, isDead },
    newlyDead: isDead && !wasDead
  };
}

// ============================================================================
// EVENT CARD DRAWING
// ============================================================================

/**
 * Attempt to draw an event card (50% chance)
 *
 * @param eventDeck - Current event deck
 * @param eventDiscardPile - Current discard pile
 * @param doom - Current doom value
 * @returns Event card result or null if no card drawn
 */
export function tryDrawEventCard(
  eventDeck: any[],
  eventDiscardPile: any[],
  doom: number
): EventCardResult | null {
  // 50% chance to draw an event card
  if (Math.random() >= 0.5) {
    return null;
  }

  const { card, newDeck, newDiscardPile, reshuffled } = drawEventCard(
    eventDeck,
    eventDiscardPile,
    doom
  );

  if (!card) {
    return null;
  }

  return {
    card,
    newDeck,
    newDiscardPile,
    reshuffled,
    message: reshuffled ? "📜 Event-kortstokken ble blandet på nytt." : null
  };
}

// ============================================================================
// PHASE TRANSITIONS
// ============================================================================

/**
 * Reset players' action points for a new investigator turn
 *
 * Applies action penalties and clears temporary effects.
 * NOTE: Madness effects must be applied separately in the component
 * using applyMadnessTurnStartEffects since it depends on component state.
 *
 * @param players - Current players
 * @returns Players with reset action points
 */
export function resetPlayersForNewTurn(players: Player[]): PlayerResetResult {
  const resetPlayers = players.map(p => {
    // Use maxActions if available (from level bonuses), otherwise default to 2
    const baseActions = p.isDead ? 0 : (p.maxActions || 2);
    const penalty = p.apPenaltyNextTurn || 0;

    // DESPERATE MEASURES: Add bonus AP from Adrenaline (HP = 1)
    const desperateBonuses = calculateDesperateBonuses(p.hp, p.sanity);
    const finalActions = Math.max(0, baseActions - penalty + desperateBonuses.bonusAP);

    // JOURNALIST BONUS: +1 free movement per turn (escape_bonus specialAbility)
    const freeMovesRemaining = p.specialAbility === 'escape_bonus' && !p.isDead ? 1 : 0;

    // Clear the penalty after applying it
    return { ...p, actions: finalActions, apPenaltyNextTurn: undefined, freeMovesRemaining };
  });

  return { resetPlayers };
}

/**
 * Check if the first player needs madness effects applied
 * Used to determine if applyMadnessTurnStartEffects should be called
 */
export function shouldApplyMadnessEffects(players: Player[]): { shouldApply: boolean; playerIndex: number } {
  const firstPlayer = players[0];
  if (firstPlayer && !firstPlayer.isDead && firstPlayer.activeMadness) {
    return { shouldApply: true, playerIndex: 0 };
  }
  return { shouldApply: false, playerIndex: -1 };
}

/**
 * Check if all players are dead
 */
export function areAllPlayersDead(players: Player[]): boolean {
  return players.every(p => p.isDead);
}

// ============================================================================
// HELPER EXPORTS FOR TESTING
// ============================================================================

/**
 * Create a structured log entry
 */
export function createLogEntry(message: string, category: string): LogEntry {
  return {
    timestamp: new Date().toLocaleTimeString(),
    message,
    category: category as LogEntry['category']
  };
}
