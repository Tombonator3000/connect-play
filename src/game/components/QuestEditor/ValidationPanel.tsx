/**
 * VALIDATION PANEL
 *
 * Panel for validating scenario configuration.
 * Checks for:
 * - Start location exists
 * - All tiles are connected
 * - Objectives are achievable (items exist, enemies placed, etc.)
 * - Required scenario metadata is filled
 */

import React, { useMemo } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Info, MapPin, Link2, Target, FileText, DoorOpen } from 'lucide-react';
import { EditorTile, ScenarioMetadata } from './index';
import { EditorObjective } from './ObjectivesPanel';
import { ConnectionEdgeType } from '../../tileConnectionSystem';
import { BESTIARY } from '../../constants';

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface ValidationIssue {
  id: string;
  severity: ValidationSeverity;
  category: 'start' | 'connectivity' | 'objectives' | 'metadata' | 'doors' | 'balance';
  message: string;
  details?: string;
  tileId?: string;
  objectiveId?: string;
}

export interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  stats: {
    totalTiles: number;
    connectedTiles: number;
    totalMonsters: number;
    totalItems: number;
    requiredObjectives: number;
    bonusObjectives: number;
  };
}

// ============================================================================
// HEX NEIGHBOR HELPERS
// ============================================================================

const HEX_DIRECTIONS = [
  { dq: 0, dr: -1 },  // N
  { dq: 1, dr: -1 },  // NE
  { dq: 1, dr: 0 },   // SE
  { dq: 0, dr: 1 },   // S
  { dq: -1, dr: 1 },  // SW
  { dq: -1, dr: 0 },  // NW
];

// Edge indices: 0=N, 1=NE, 2=SE, 3=S, 4=SW, 5=NW
// Opposite edge mapping
const OPPOSITE_EDGE: Record<number, number> = {
  0: 3,  // N -> S
  1: 4,  // NE -> SW
  2: 5,  // SE -> NW
  3: 0,  // S -> N
  4: 1,  // SW -> NE
  5: 2,  // NW -> SE
};

// Edges that can be traversed
const PASSABLE_EDGES: ConnectionEdgeType[] = [
  'OPEN', 'DOOR', 'WINDOW', 'STREET', 'NATURE', 'STAIRS_UP', 'STAIRS_DOWN', 'FACADE'
];

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

function getTileKey(q: number, r: number): string {
  return `${q},${r}`;
}

function getNeighborKey(q: number, r: number, direction: number): string {
  const dir = HEX_DIRECTIONS[direction];
  return getTileKey(q + dir.dq, r + dir.dr);
}

/**
 * Check if two adjacent tiles are connected via passable edges
 */
function areConnected(tile1: EditorTile, tile2: EditorTile, edgeIndex: number): boolean {
  const edge1 = tile1.edges[edgeIndex];
  const oppositeIndex = OPPOSITE_EDGE[edgeIndex];
  const edge2 = tile2.edges[oppositeIndex];

  // Both edges must be passable for connection
  return PASSABLE_EDGES.includes(edge1) && PASSABLE_EDGES.includes(edge2);
}

/**
 * Find all tiles reachable from a starting tile using BFS
 */
function findConnectedTiles(
  startTile: EditorTile,
  allTiles: Map<string, EditorTile>
): Set<string> {
  const visited = new Set<string>();
  const queue: EditorTile[] = [startTile];
  const startKey = getTileKey(startTile.q, startTile.r);
  visited.add(startKey);

  while (queue.length > 0) {
    const current = queue.shift()!;

    // Check all 6 directions
    for (let dir = 0; dir < 6; dir++) {
      const neighborKey = getNeighborKey(current.q, current.r, dir);

      if (visited.has(neighborKey)) continue;

      const neighbor = allTiles.get(neighborKey);
      if (!neighbor) continue;

      // Check if there's a passable connection
      if (areConnected(current, neighbor, dir)) {
        visited.add(neighborKey);
        queue.push(neighbor);
      }
    }
  }

  return visited;
}

/**
 * Validate the entire scenario
 */
export function validateScenario(
  tiles: Map<string, EditorTile>,
  objectives: EditorObjective[],
  metadata: ScenarioMetadata
): ValidationResult {
  const issues: ValidationIssue[] = [];
  const tilesArray = Array.from(tiles.values());

  // Stats
  const stats = {
    totalTiles: tilesArray.length,
    connectedTiles: 0,
    totalMonsters: 0,
    totalItems: 0,
    requiredObjectives: objectives.filter(o => o.isRequired && !o.isBonus).length,
    bonusObjectives: objectives.filter(o => o.isBonus).length,
  };

  // Count monsters and items
  tilesArray.forEach(tile => {
    if (tile.monsters) {
      stats.totalMonsters += tile.monsters.reduce((sum, m) => sum + m.count, 0);
    }
    if (tile.items) {
      stats.totalItems += tile.items.length;
    }
  });

  // ============================================================================
  // 1. START LOCATION VALIDATION
  // ============================================================================

  const startTiles = tilesArray.filter(t => t.isStartLocation);

  if (startTiles.length === 0) {
    issues.push({
      id: 'no_start',
      severity: 'error',
      category: 'start',
      message: 'No start location defined',
      details: 'Select a tile and mark it as "Start Location" in the properties panel.',
    });
  } else if (startTiles.length > 1) {
    issues.push({
      id: 'multiple_starts',
      severity: 'warning',
      category: 'start',
      message: `Multiple start locations (${startTiles.length})`,
      details: 'Only one start location should be defined. The first one will be used.',
    });
  }

  // ============================================================================
  // 2. CONNECTIVITY VALIDATION
  // ============================================================================

  if (tilesArray.length > 0) {
    // Use start tile or first tile as reference
    const referenceTile = startTiles[0] || tilesArray[0];
    const connectedSet = findConnectedTiles(referenceTile, tiles);
    stats.connectedTiles = connectedSet.size;

    // Find disconnected tiles
    const disconnectedTiles = tilesArray.filter(
      t => !connectedSet.has(getTileKey(t.q, t.r))
    );

    if (disconnectedTiles.length > 0) {
      issues.push({
        id: 'disconnected_tiles',
        severity: 'error',
        category: 'connectivity',
        message: `${disconnectedTiles.length} tile(s) not reachable`,
        details: `Tiles at: ${disconnectedTiles.slice(0, 5).map(t => `(${t.q},${t.r})`).join(', ')}${disconnectedTiles.length > 5 ? '...' : ''}. Check edge connections.`,
      });
    }

    // Check for dead ends (tiles with only one connection) - just informational
    const deadEnds = tilesArray.filter(tile => {
      let connections = 0;
      for (let dir = 0; dir < 6; dir++) {
        const neighborKey = getNeighborKey(tile.q, tile.r, dir);
        const neighbor = tiles.get(neighborKey);
        if (neighbor && areConnected(tile, neighbor, dir)) {
          connections++;
        }
      }
      return connections === 1;
    });

    if (deadEnds.length > 3) {
      issues.push({
        id: 'many_dead_ends',
        severity: 'info',
        category: 'connectivity',
        message: `${deadEnds.length} dead-end tiles`,
        details: 'Consider adding more connections for exploration variety.',
      });
    }
  }

  // ============================================================================
  // 3. DOOR VALIDATION
  // ============================================================================

  // Check for mismatched door edges (one side is DOOR, other is not)
  tilesArray.forEach(tile => {
    for (let dir = 0; dir < 6; dir++) {
      const edge = tile.edges[dir];
      const neighborKey = getNeighborKey(tile.q, tile.r, dir);
      const neighbor = tiles.get(neighborKey);

      if (neighbor) {
        const oppositeIndex = OPPOSITE_EDGE[dir];
        const neighborEdge = neighbor.edges[oppositeIndex];

        // Check for door mismatch
        if (edge === 'DOOR' && neighborEdge !== 'DOOR' && neighborEdge !== 'OPEN') {
          issues.push({
            id: `door_mismatch_${tile.id}_${dir}`,
            severity: 'warning',
            category: 'doors',
            message: `Door mismatch at (${tile.q},${tile.r})`,
            details: `Edge ${dir} is DOOR but neighbor has ${neighborEdge}. Consider making both sides DOOR.`,
            tileId: tile.id,
          });
        }
      }
    }
  });

  // ============================================================================
  // 4. OBJECTIVES VALIDATION
  // ============================================================================

  if (objectives.length === 0) {
    issues.push({
      id: 'no_objectives',
      severity: 'warning',
      category: 'objectives',
      message: 'No objectives defined',
      details: 'Add at least one objective for the scenario to be playable.',
    });
  }

  // Check that required objectives exist
  const requiredObjectives = objectives.filter(o => o.isRequired && !o.isBonus);
  if (requiredObjectives.length === 0 && objectives.length > 0) {
    issues.push({
      id: 'no_required',
      severity: 'warning',
      category: 'objectives',
      message: 'No required objectives',
      details: 'At least one objective should be marked as required for victory.',
    });
  }

  // Validate individual objectives
  objectives.forEach(objective => {
    const typeNeedsTarget = ['find_item', 'kill_enemies', 'kill_boss', 'rescue', 'collect'].includes(objective.type);
    const typeNeedsAmount = ['kill_enemies', 'survive', 'explore', 'collect', 'investigate'].includes(objective.type);

    // Check target ID for objectives that need it
    if (typeNeedsTarget && !objective.targetId) {
      issues.push({
        id: `obj_no_target_${objective.id}`,
        severity: 'warning',
        category: 'objectives',
        message: `"${objective.description}" missing target`,
        details: `${objective.type} objective requires a target ID.`,
        objectiveId: objective.id,
      });
    }

    // Check amount for objectives that need it
    if (typeNeedsAmount && (!objective.targetAmount || objective.targetAmount < 1)) {
      issues.push({
        id: `obj_no_amount_${objective.id}`,
        severity: 'warning',
        category: 'objectives',
        message: `"${objective.description}" missing amount`,
        details: `${objective.type} objective requires a target amount.`,
        objectiveId: objective.id,
      });
    }

    // Validate kill_boss - check if boss type exists in BESTIARY
    if (objective.type === 'kill_boss' && objective.targetId) {
      const bossExists = BESTIARY.some(e => e.type === objective.targetId);
      const isBossPlaced = tilesArray.some(
        t => t.monsters?.some(m => m.type === objective.targetId)
      );

      if (!bossExists) {
        issues.push({
          id: `obj_invalid_boss_${objective.id}`,
          severity: 'warning',
          category: 'objectives',
          message: `Boss "${objective.targetId}" not found in bestiary`,
          details: 'Make sure the target ID matches a valid enemy type.',
          objectiveId: objective.id,
        });
      } else if (!isBossPlaced) {
        issues.push({
          id: `obj_boss_not_placed_${objective.id}`,
          severity: 'warning',
          category: 'objectives',
          message: `Boss "${objective.targetId}" not placed on any tile`,
          details: 'Place the boss monster on a tile for this objective to be completable.',
          objectiveId: objective.id,
        });
      }
    }

    // Validate find_item - check if item is placed
    if (objective.type === 'find_item' && objective.targetId) {
      const itemPlaced = tilesArray.some(
        t => t.items?.some(i => i.id === objective.targetId || i.name?.toLowerCase().includes(objective.targetId!.toLowerCase()))
      );

      if (!itemPlaced) {
        issues.push({
          id: `obj_item_not_placed_${objective.id}`,
          severity: 'warning',
          category: 'objectives',
          message: `Item "${objective.targetId}" not placed`,
          details: 'Place the required item on a tile for this objective to be completable.',
          objectiveId: objective.id,
        });
      }
    }

    // Validate collect - check if enough items are placed
    if (objective.type === 'collect' && objective.targetId && objective.targetAmount) {
      const matchingItems = tilesArray.reduce((count, t) => {
        if (!t.items) return count;
        return count + t.items.filter(
          i => i.id === objective.targetId ||
               i.name?.toLowerCase().includes(objective.targetId!.toLowerCase()) ||
               i.subtype === objective.targetId
        ).length;
      }, 0);

      if (matchingItems < objective.targetAmount) {
        issues.push({
          id: `obj_not_enough_items_${objective.id}`,
          severity: 'warning',
          category: 'objectives',
          message: `Not enough "${objective.targetId}" items`,
          details: `Need ${objective.targetAmount} but only ${matchingItems} placed.`,
          objectiveId: objective.id,
        });
      }
    }

    // Validate kill_enemies - check if enough enemies are placed
    if (objective.type === 'kill_enemies' && objective.targetAmount) {
      const targetType = objective.targetId;
      let enemyCount = 0;

      tilesArray.forEach(t => {
        if (!t.monsters) return;
        t.monsters.forEach(m => {
          if (!targetType || m.type === targetType) {
            enemyCount += m.count;
          }
        });
      });

      if (enemyCount < objective.targetAmount) {
        issues.push({
          id: `obj_not_enough_enemies_${objective.id}`,
          severity: 'warning',
          category: 'objectives',
          message: `Not enough enemies for "${objective.description}"`,
          details: `Need ${objective.targetAmount} ${targetType || 'enemies'} but only ${enemyCount} placed.`,
          objectiveId: objective.id,
        });
      }
    }

    // Check revealedBy references
    if (objective.revealedBy) {
      const revealer = objectives.find(o => o.id === objective.revealedBy);
      if (!revealer) {
        issues.push({
          id: `obj_invalid_revealer_${objective.id}`,
          severity: 'warning',
          category: 'objectives',
          message: `"${objective.description}" references unknown objective`,
          details: `"revealedBy" references objective that doesn't exist.`,
          objectiveId: objective.id,
        });
      }
    }
  });

  // ============================================================================
  // 5. METADATA VALIDATION
  // ============================================================================

  if (!metadata.title || metadata.title === 'Untitled Scenario') {
    issues.push({
      id: 'no_title',
      severity: 'info',
      category: 'metadata',
      message: 'Scenario title not set',
      details: 'Consider giving your scenario a descriptive title.',
    });
  }

  if (!metadata.briefing) {
    issues.push({
      id: 'no_briefing',
      severity: 'info',
      category: 'metadata',
      message: 'No briefing text',
      details: 'Add a briefing to set the scene for players.',
    });
  }

  if (metadata.startDoom < 6) {
    issues.push({
      id: 'low_doom',
      severity: 'warning',
      category: 'balance',
      message: `Low starting doom (${metadata.startDoom})`,
      details: 'Very low doom values can make the scenario extremely difficult.',
    });
  }

  // ============================================================================
  // 6. BALANCE CHECKS
  // ============================================================================

  // Check if there are too many monsters
  if (stats.totalMonsters > stats.totalTiles * 2) {
    issues.push({
      id: 'too_many_monsters',
      severity: 'warning',
      category: 'balance',
      message: `High monster density (${stats.totalMonsters} monsters)`,
      details: 'Consider reducing monster count for better balance.',
    });
  }

  // Check if there are no monsters at all
  if (stats.totalMonsters === 0 && objectives.some(o => o.type === 'kill_enemies' || o.type === 'kill_boss')) {
    issues.push({
      id: 'no_monsters',
      severity: 'error',
      category: 'objectives',
      message: 'Kill objective but no monsters placed',
      details: 'Place monsters on tiles or remove kill objectives.',
    });
  }

  // ============================================================================
  // RESULT
  // ============================================================================

  const hasErrors = issues.some(i => i.severity === 'error');

  return {
    isValid: !hasErrors,
    issues,
    stats,
  };
}

// ============================================================================
// COMPONENT
// ============================================================================

interface ValidationPanelProps {
  tiles: Map<string, EditorTile>;
  objectives: EditorObjective[];
  metadata: ScenarioMetadata;
  onSelectTile?: (tileId: string) => void;
}

const ValidationPanel: React.FC<ValidationPanelProps> = ({
  tiles,
  objectives,
  metadata,
  onSelectTile,
}) => {
  const validation = useMemo(
    () => validateScenario(tiles, objectives, metadata),
    [tiles, objectives, metadata]
  );

  const errorCount = validation.issues.filter(i => i.severity === 'error').length;
  const warningCount = validation.issues.filter(i => i.severity === 'warning').length;
  const infoCount = validation.issues.filter(i => i.severity === 'info').length;

  const getSeverityIcon = (severity: ValidationSeverity) => {
    switch (severity) {
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  const getCategoryIcon = (category: ValidationIssue['category']) => {
    switch (category) {
      case 'start':
        return <MapPin className="w-3 h-3" />;
      case 'connectivity':
        return <Link2 className="w-3 h-3" />;
      case 'objectives':
        return <Target className="w-3 h-3" />;
      case 'metadata':
        return <FileText className="w-3 h-3" />;
      case 'doors':
        return <DoorOpen className="w-3 h-3" />;
      case 'balance':
        return <AlertTriangle className="w-3 h-3" />;
    }
  };

  return (
    <div className="space-y-3">
      {/* Status header */}
      <div className={`p-3 rounded-lg ${validation.isValid ? 'bg-green-900/30 border border-green-600/50' : 'bg-red-900/30 border border-red-600/50'}`}>
        <div className="flex items-center gap-2">
          {validation.isValid ? (
            <>
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-medium">Scenario is valid</span>
            </>
          ) : (
            <>
              <XCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-400 font-medium">Issues found</span>
            </>
          )}
        </div>

        {/* Issue counts */}
        <div className="flex gap-4 mt-2 text-xs">
          {errorCount > 0 && (
            <span className="text-red-400">{errorCount} error{errorCount !== 1 ? 's' : ''}</span>
          )}
          {warningCount > 0 && (
            <span className="text-amber-400">{warningCount} warning{warningCount !== 1 ? 's' : ''}</span>
          )}
          {infoCount > 0 && (
            <span className="text-blue-400">{infoCount} info</span>
          )}
          {validation.issues.length === 0 && (
            <span className="text-slate-400">No issues</span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-slate-700/50 rounded p-2">
          <div className="text-slate-400">Tiles</div>
          <div className="text-white font-medium">
            {validation.stats.connectedTiles}/{validation.stats.totalTiles} connected
          </div>
        </div>
        <div className="bg-slate-700/50 rounded p-2">
          <div className="text-slate-400">Monsters</div>
          <div className="text-white font-medium">{validation.stats.totalMonsters}</div>
        </div>
        <div className="bg-slate-700/50 rounded p-2">
          <div className="text-slate-400">Items</div>
          <div className="text-white font-medium">{validation.stats.totalItems}</div>
        </div>
        <div className="bg-slate-700/50 rounded p-2">
          <div className="text-slate-400">Objectives</div>
          <div className="text-white font-medium">
            {validation.stats.requiredObjectives} req, {validation.stats.bonusObjectives} bonus
          </div>
        </div>
      </div>

      {/* Issues list */}
      {validation.issues.length > 0 && (
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {validation.issues.map(issue => (
            <div
              key={issue.id}
              className={`p-2 rounded text-xs ${
                issue.severity === 'error'
                  ? 'bg-red-900/30 border border-red-600/30'
                  : issue.severity === 'warning'
                  ? 'bg-amber-900/30 border border-amber-600/30'
                  : 'bg-slate-700/50 border border-slate-600/30'
              } ${issue.tileId && onSelectTile ? 'cursor-pointer hover:brightness-110' : ''}`}
              onClick={() => {
                if (issue.tileId && onSelectTile) {
                  onSelectTile(issue.tileId);
                }
              }}
            >
              <div className="flex items-start gap-2">
                {getSeverityIcon(issue.severity)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 text-white">
                    {getCategoryIcon(issue.category)}
                    <span className="font-medium">{issue.message}</span>
                  </div>
                  {issue.details && (
                    <div className="text-slate-400 mt-0.5 text-[10px]">{issue.details}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ValidationPanel;
