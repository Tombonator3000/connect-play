/**
 * movementUtils.ts
 *
 * Utility functions for validating player movement on the hex grid.
 * Extracted from ShadowsGame.tsx to reduce complexity and avoid code duplication.
 *
 * The main purpose is to check if movement between tiles is blocked by edges
 * (walls, doors, windows, stairs, etc.) and provide appropriate feedback.
 */

import { EdgeData, Tile } from '../types';
import { getEdgeDirection, getOppositeEdgeDirection } from '../hexUtils';

/**
 * Result of checking a single edge for blocking
 */
export interface EdgeBlockResult {
  blocked: boolean;
  message: string;
  showContextActions: boolean;
  // If blocked, which tile should show context actions (used by ShadowsGame)
  contextTileId?: string;
  // Which edge index triggered the block (for showing context actions on specific edge)
  contextEdgeIndex?: number;
}

/**
 * Result of validating movement between two tiles
 */
export interface MovementValidationResult {
  allowed: boolean;
  message: string;
  showContextActions: boolean;
  contextTileId?: string;
  contextEdgeIndex?: number;
  // For stairs, we need to know AP cost
  requiresExtraAP?: boolean;
  apCost?: number;
}

/**
 * Check if a single edge blocks movement and return details
 *
 * @param edge - The edge data to check
 * @param tileId - The ID of the tile this edge belongs to
 * @param edgeIndex - The index of this edge (0-5)
 * @param isSourceTile - Whether this is the source tile (leaving from) vs target (entering to)
 * @returns EdgeBlockResult with blocking status and context
 */
export function checkEdgeBlocking(
  edge: EdgeData | undefined,
  tileId: string,
  edgeIndex: number,
  isSourceTile: boolean
): EdgeBlockResult {
  // No edge or undefined = no blocking
  if (!edge) {
    return { blocked: false, message: '', showContextActions: false };
  }

  // Wall - always blocks
  if (edge.type === 'wall') {
    return {
      blocked: true,
      message: 'BLOCKED: A solid wall prevents passage.',
      showContextActions: false,
      contextTileId: tileId,
      contextEdgeIndex: edgeIndex,
    };
  }

  // Blocked edge (rubble, collapsed, etc.)
  if (edge.type === 'blocked') {
    const blockingDesc = edge.blockingType
      ? edge.blockingType.replace('_', ' ')
      : 'debris';
    const formattedDesc = blockingDesc.charAt(0).toUpperCase() + blockingDesc.slice(1);

    return {
      blocked: true,
      message: `BLOCKED: ${formattedDesc} blocks the way.`,
      showContextActions: true,
      contextTileId: tileId,
      contextEdgeIndex: edgeIndex,
    };
  }

  // Window - requires Athletics check
  if (edge.type === 'window') {
    return {
      blocked: true,
      message: 'WINDOW: Cannot pass through window (Athletics DC 4 required).',
      showContextActions: true,
      contextTileId: tileId,
      contextEdgeIndex: edgeIndex,
    };
  }

  // Stairs - require extra AP, show context actions
  if (edge.type === 'stairs_up' || edge.type === 'stairs_down') {
    const direction = edge.type === 'stairs_up' ? 'opp' : 'ned';
    return {
      blocked: true, // "Blocked" in the sense that normal movement doesn't work
      message: `TRAPP: Trappen går ${direction}. Bruk 2 AP for å passere.`,
      showContextActions: true,
      contextTileId: tileId,
      contextEdgeIndex: edgeIndex,
    };
  }

  // Door - check if it's open or broken (passable) vs closed/locked (blocked)
  if (edge.type === 'door') {
    const isPassable = edge.doorState === 'open' || edge.doorState === 'broken';

    if (!isPassable) {
      const doorMessage = edge.doorState === 'locked'
        ? 'Døren er låst'
        : edge.doorState || 'lukket';

      // Different message format for source vs target
      const message = isSourceTile
        ? `DØR: ${edge.doorState === 'locked' ? 'Døren er låst' : 'Døren er lukket'}. Du må åpne den først.`
        : `DOOR: ${doorMessage}.`;

      return {
        blocked: true,
        message,
        showContextActions: true,
        contextTileId: tileId,
        contextEdgeIndex: edgeIndex,
      };
    }
  }

  // Secret doors are treated as walls until discovered
  if (edge.type === 'secret' && !edge.isDiscovered) {
    return {
      blocked: true,
      message: 'BLOCKED: A solid wall prevents passage.',
      showContextActions: false,
      contextTileId: tileId,
      contextEdgeIndex: edgeIndex,
    };
  }

  // Edge type allows passage
  return { blocked: false, message: '', showContextActions: false };
}

/**
 * Validate movement between two adjacent tiles by checking both edges
 *
 * In hex grid movement, we need to check both:
 * 1. The edge on the source tile (the side we're leaving from)
 * 2. The edge on the target tile (the side we're entering from)
 *
 * If either edge blocks passage, movement is not allowed.
 *
 * @param sourceTile - The tile the player is currently on
 * @param targetTile - The tile the player wants to move to
 * @param edgeFromSource - Edge index on source tile (0-5) pointing toward target
 * @param edgeFromTarget - Edge index on target tile (0-5) pointing toward source
 * @returns MovementValidationResult with blocking status and context
 */
export function validateMovementEdges(
  sourceTile: Tile | undefined,
  targetTile: Tile | undefined,
  edgeFromSource: number,
  edgeFromTarget: number
): MovementValidationResult {
  // Default: movement allowed
  const allowedResult: MovementValidationResult = {
    allowed: true,
    message: '',
    showContextActions: false,
  };

  // Check source tile's edge (the side we're leaving from)
  if (sourceTile && edgeFromSource !== -1 && sourceTile.edges?.[edgeFromSource]) {
    const sourceEdge = sourceTile.edges[edgeFromSource];
    const sourceResult = checkEdgeBlocking(sourceEdge, sourceTile.id, edgeFromSource, true);

    if (sourceResult.blocked) {
      return {
        allowed: false,
        message: sourceResult.message,
        showContextActions: sourceResult.showContextActions,
        contextTileId: sourceResult.contextTileId,
        contextEdgeIndex: sourceResult.contextEdgeIndex,
      };
    }
  }

  // Check target tile's edge (the side we're entering from)
  if (targetTile && edgeFromTarget !== -1 && targetTile.edges?.[edgeFromTarget]) {
    const targetEdge = targetTile.edges[edgeFromTarget];
    const targetResult = checkEdgeBlocking(targetEdge, targetTile.id, edgeFromTarget, false);

    if (targetResult.blocked) {
      return {
        allowed: false,
        message: targetResult.message,
        showContextActions: targetResult.showContextActions,
        contextTileId: targetResult.contextTileId,
        contextEdgeIndex: targetResult.contextEdgeIndex,
      };
    }
  }

  return allowedResult;
}

// Re-export hex utility functions from hexUtils for convenience
// These are commonly needed when validating movement
export { getEdgeDirection, getOppositeEdgeDirection } from '../hexUtils';
export { hexDistance } from '../hexUtils';
