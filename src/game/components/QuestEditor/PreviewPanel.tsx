/**
 * PREVIEW PANEL - Quest Editor Preview/Test Mode
 *
 * Allows scenario creators to preview and test their scenarios
 * before exporting. Features:
 * - Visual preview of all tiles
 * - Simulated player movement
 * - Monster/item visualization
 * - Objective tracking
 * - Fog of war toggle
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { X, Eye, EyeOff, Play, RotateCcw, ChevronLeft, ChevronRight, Target, Skull, Package, MapPin, AlertTriangle, CheckCircle2, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EditorTile, ScenarioMetadata, DoorConfig } from './index';
import { EditorObjective } from './ObjectivesPanel';
import { BESTIARY } from '../../constants';
import { ConnectionEdgeType } from '../../tileConnectionSystem';

// ============================================================================
// TYPES
// ============================================================================

interface PreviewPanelProps {
  tiles: Map<string, EditorTile>;
  objectives: EditorObjective[];
  metadata: ScenarioMetadata;
  onClose: () => void;
}

interface PreviewTile {
  id: string;
  q: number;
  r: number;
  name: string;
  category: string;
  edges: ConnectionEdgeType[];
  doorConfigs?: { [key: number]: DoorConfig };
  floorType: string;
  description?: string;
  customDescription?: string;
  isStartLocation?: boolean;
  monsters?: { type: string; count: number }[];
  items?: { id: string; name: string; type: string }[];
  isVisible: boolean;
  isExplored: boolean;
  watermarkIcon?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const HEX_SIZE = 50;
const SQRT3 = Math.sqrt(3);

// Floor type colors
const FLOOR_COLORS: Record<string, string> = {
  wood: '#8B4513',
  cobblestone: '#696969',
  tile: '#A9A9A9',
  stone: '#4a4a5a',
  grass: '#228B22',
  dirt: '#8B7355',
  water: '#1E3A5F',
  ritual: '#4B0082',
  carpet: '#8B0000',
  marble: '#F5F5F5',
};

// Category icons
const CATEGORY_ICONS: Record<string, string> = {
  foyer: '🚪',
  corridor: '🏛️',
  room: '🏠',
  basement: '🪜',
  crypt: '💀',
  nature: '🌲',
  urban: '🏙️',
  street: '🛤️',
  facade: '🏛️',
  stairs: '🪜',
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function hexToPixel(q: number, r: number, size: number): { x: number; y: number } {
  const x = size * (SQRT3 * q + SQRT3 / 2 * r);
  const y = size * (3 / 2 * r);
  return { x, y };
}

function getHexCorners(cx: number, cy: number, size: number): string {
  const corners: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i - 30);
    const x = cx + size * Math.cos(angle);
    const y = cy + size * Math.sin(angle);
    corners.push(`${x},${y}`);
  }
  return corners.join(' ');
}

function getEdgePositions(cx: number, cy: number, size: number): { x1: number; y1: number; x2: number; y2: number }[] {
  const edges: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (let i = 0; i < 6; i++) {
    const angle1 = (Math.PI / 180) * (60 * i - 30);
    const angle2 = (Math.PI / 180) * (60 * ((i + 1) % 6) - 30);
    edges.push({
      x1: cx + size * Math.cos(angle1),
      y1: cy + size * Math.sin(angle1),
      x2: cx + size * Math.cos(angle2),
      y2: cy + size * Math.sin(angle2),
    });
  }
  return edges;
}

function getHexNeighborCoord(q: number, r: number, direction: number): { q: number; r: number } {
  const directions = [
    { q: 1, r: 0 },   // 0 - East
    { q: 0, r: 1 },   // 1 - SE
    { q: -1, r: 1 },  // 2 - SW
    { q: -1, r: 0 },  // 3 - West
    { q: 0, r: -1 },  // 4 - NW
    { q: 1, r: -1 },  // 5 - NE
  ];
  const dir = directions[direction];
  return { q: q + dir.q, r: r + dir.r };
}

// ============================================================================
// PREVIEW PANEL COMPONENT
// ============================================================================

const PreviewPanel: React.FC<PreviewPanelProps> = ({
  tiles,
  objectives,
  metadata,
  onClose,
}) => {
  // State
  const [playerPosition, setPlayerPosition] = useState<{ q: number; r: number } | null>(null);
  const [showFogOfWar, setShowFogOfWar] = useState(true);
  const [exploredTiles, setExploredTiles] = useState<Set<string>>(new Set());
  const [collectedItems, setCollectedItems] = useState<Set<string>>(new Set());
  const [defeatedMonsters, setDefeatedMonsters] = useState<Set<string>>(new Set());
  const [currentDoom, setCurrentDoom] = useState(metadata.startDoom);
  const [moveHistory, setMoveHistory] = useState<{ q: number; r: number }[]>([]);
  const [showBriefing, setShowBriefing] = useState(true);

  // Find start location
  const startLocation = useMemo(() => {
    for (const tile of tiles.values()) {
      if (tile.isStartLocation) {
        return { q: tile.q, r: tile.r };
      }
    }
    // Default to first tile if no start location
    const firstTile = tiles.values().next().value;
    return firstTile ? { q: firstTile.q, r: firstTile.r } : { q: 0, r: 0 };
  }, [tiles]);

  // Initialize player position
  useEffect(() => {
    if (!playerPosition && startLocation) {
      setPlayerPosition(startLocation);
      setExploredTiles(new Set([`${startLocation.q},${startLocation.r}`]));
      setMoveHistory([startLocation]);
    }
  }, [startLocation, playerPosition]);

  // Convert editor tiles to preview tiles
  const previewTiles = useMemo((): Map<string, PreviewTile> => {
    const result = new Map<string, PreviewTile>();

    for (const [key, tile] of tiles) {
      const isVisible = !showFogOfWar || exploredTiles.has(key);
      const isAdjacent = !showFogOfWar || (playerPosition && isAdjacentToPlayer(tile.q, tile.r, playerPosition));

      result.set(key, {
        id: tile.id,
        q: tile.q,
        r: tile.r,
        name: tile.name,
        category: tile.category,
        edges: tile.edges,
        doorConfigs: tile.doorConfigs,
        floorType: tile.floorType,
        description: tile.description,
        customDescription: tile.customDescription,
        isStartLocation: tile.isStartLocation,
        monsters: tile.monsters,
        items: tile.items,
        isVisible: isVisible || isAdjacent,
        isExplored: exploredTiles.has(key),
        watermarkIcon: tile.watermarkIcon,
      });
    }

    return result;
  }, [tiles, showFogOfWar, exploredTiles, playerPosition]);

  // Check if a position is adjacent to player
  function isAdjacentToPlayer(q: number, r: number, pos: { q: number; r: number }): boolean {
    for (let i = 0; i < 6; i++) {
      const neighbor = getHexNeighborCoord(pos.q, pos.r, i);
      if (neighbor.q === q && neighbor.r === r) return true;
    }
    return false;
  }

  // Check if player can move to a tile
  const canMoveTo = useCallback((targetQ: number, targetR: number): boolean => {
    if (!playerPosition) return false;

    const currentTile = tiles.get(`${playerPosition.q},${playerPosition.r}`);
    const targetTile = tiles.get(`${targetQ},${targetR}`);

    if (!currentTile || !targetTile) return false;

    // Find which direction the target is
    for (let i = 0; i < 6; i++) {
      const neighbor = getHexNeighborCoord(playerPosition.q, playerPosition.r, i);
      if (neighbor.q === targetQ && neighbor.r === targetR) {
        // Check if the edge allows passage
        const edge = currentTile.edges[i];
        if (edge === 'WALL') return false;
        if (edge === 'DOOR') {
          const doorConfig = currentTile.doorConfigs?.[i];
          if (doorConfig?.state === 'LOCKED' || doorConfig?.state === 'SEALED') {
            return false; // For preview, locked doors block
          }
        }
        return edge === 'OPEN' || edge === 'DOOR' || edge === 'STAIRS_UP' || edge === 'STAIRS_DOWN';
      }
    }

    return false;
  }, [playerPosition, tiles]);

  // Handle tile click for movement
  const handleTileClick = useCallback((q: number, r: number) => {
    if (!playerPosition) return;

    // If clicking current tile, do nothing
    if (q === playerPosition.q && r === playerPosition.r) return;

    // Check if can move
    if (canMoveTo(q, r)) {
      setPlayerPosition({ q, r });
      setExploredTiles(prev => new Set([...prev, `${q},${r}`]));
      setMoveHistory(prev => [...prev, { q, r }]);
      setCurrentDoom(prev => Math.max(0, prev - 1));
    }
  }, [playerPosition, canMoveTo]);

  // Reset preview
  const handleReset = useCallback(() => {
    setPlayerPosition(startLocation);
    setExploredTiles(new Set([`${startLocation.q},${startLocation.r}`]));
    setMoveHistory([startLocation]);
    setCurrentDoom(metadata.startDoom);
    setCollectedItems(new Set());
    setDefeatedMonsters(new Set());
  }, [startLocation, metadata.startDoom]);

  // Undo last move
  const handleUndo = useCallback(() => {
    if (moveHistory.length > 1) {
      const newHistory = [...moveHistory];
      newHistory.pop();
      const prevPos = newHistory[newHistory.length - 1];
      setPlayerPosition(prevPos);
      setMoveHistory(newHistory);
      setCurrentDoom(prev => Math.min(metadata.startDoom, prev + 1));
    }
  }, [moveHistory, metadata.startDoom]);

  // Calculate viewport bounds
  const bounds = useMemo(() => {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    for (const tile of previewTiles.values()) {
      const { x, y } = hexToPixel(tile.q, tile.r, HEX_SIZE);
      minX = Math.min(minX, x - HEX_SIZE);
      minY = Math.min(minY, y - HEX_SIZE);
      maxX = Math.max(maxX, x + HEX_SIZE);
      maxY = Math.max(maxY, y + HEX_SIZE);
    }

    return { minX, minY, maxX, maxY, width: maxX - minX + 100, height: maxY - minY + 100 };
  }, [previewTiles]);

  // Calculate objective progress
  const objectiveProgress = useMemo(() => {
    return objectives.map(obj => {
      let completed = false;
      let progress = '';

      switch (obj.type) {
        case 'explore':
          const totalTiles = tiles.size;
          const explored = exploredTiles.size;
          completed = explored >= totalTiles;
          progress = `${explored}/${totalTiles} tiles`;
          break;
        case 'collect':
          const targetCount = obj.targetCount || 1;
          const collected = collectedItems.size;
          completed = collected >= targetCount;
          progress = `${collected}/${targetCount}`;
          break;
        case 'kill_enemies':
          const enemyCount = obj.targetCount || 1;
          completed = defeatedMonsters.size >= enemyCount;
          progress = `${defeatedMonsters.size}/${enemyCount}`;
          break;
        case 'escape':
          // Check if player is on an exit tile
          const exitTile = Array.from(tiles.values()).find(t =>
            t.edges.includes('STAIRS_DOWN') || t.edges.includes('STAIRS_UP')
          );
          if (exitTile && playerPosition) {
            completed = exitTile.q === playerPosition.q && exitTile.r === playerPosition.r;
          }
          break;
        case 'survive':
          const rounds = obj.targetCount || 5;
          const survived = metadata.startDoom - currentDoom;
          completed = survived >= rounds;
          progress = `${survived}/${rounds} rounds`;
          break;
        default:
          break;
      }

      return { ...obj, completed, progress };
    });
  }, [objectives, tiles, exploredTiles, collectedItems, defeatedMonsters, playerPosition, currentDoom, metadata.startDoom]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
      {/* Header */}
      <div className="h-14 bg-slate-800 border-b border-slate-700 flex items-center px-4 gap-4 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-slate-300 hover:text-white"
        >
          <X className="w-4 h-4 mr-2" />
          Close Preview
        </Button>

        <div className="h-6 w-px bg-slate-600" />

        <h2 className="text-white font-semibold flex-1">
          <Play className="w-4 h-4 inline mr-2 text-green-400" />
          Preview: {metadata.title}
        </h2>

        {/* Doom counter */}
        <div className="flex items-center gap-2 bg-red-900/50 px-3 py-1 rounded">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <span className="text-red-400 font-mono">DOOM: {currentDoom}</span>
        </div>

        <div className="h-6 w-px bg-slate-600" />

        {/* Controls */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowFogOfWar(!showFogOfWar)}
          className={`${showFogOfWar ? 'text-amber-400' : 'text-slate-300'} hover:text-white`}
          title={showFogOfWar ? 'Show all tiles' : 'Enable fog of war'}
        >
          {showFogOfWar ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleUndo}
          disabled={moveHistory.length <= 1}
          className="text-slate-300 hover:text-white disabled:opacity-50"
          title="Undo last move"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="text-slate-300 hover:text-white"
          title="Reset preview"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar - Objectives */}
        <div className="w-72 bg-slate-800 border-r border-slate-700 p-4 overflow-y-auto">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-purple-400" />
            Objectives
          </h3>

          <div className="space-y-2">
            {objectiveProgress.map((obj, i) => (
              <div
                key={obj.id}
                className={`p-2 rounded border ${
                  obj.completed
                    ? 'bg-green-900/30 border-green-700'
                    : obj.isRequired
                    ? 'bg-slate-700/50 border-amber-600/50'
                    : 'bg-slate-700/30 border-slate-600'
                }`}
              >
                <div className="flex items-start gap-2">
                  {obj.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm ${obj.completed ? 'text-green-300 line-through' : 'text-white'}`}>
                      {obj.description}
                    </div>
                    {obj.progress && (
                      <div className="text-xs text-slate-400 mt-1">{obj.progress}</div>
                    )}
                    {obj.isRequired && !obj.completed && (
                      <div className="text-xs text-amber-400 mt-1">Required</div>
                    )}
                    {obj.isBonus && (
                      <div className="text-xs text-purple-400 mt-1">Bonus</div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {objectives.length === 0 && (
              <div className="text-slate-500 text-sm italic">No objectives defined</div>
            )}
          </div>

          {/* Stats */}
          <div className="mt-6 pt-4 border-t border-slate-600">
            <h4 className="text-slate-400 text-xs uppercase mb-2">Preview Stats</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-slate-700/50 p-2 rounded">
                <div className="text-slate-400 text-xs">Tiles Explored</div>
                <div className="text-white">{exploredTiles.size} / {tiles.size}</div>
              </div>
              <div className="bg-slate-700/50 p-2 rounded">
                <div className="text-slate-400 text-xs">Moves Made</div>
                <div className="text-white">{moveHistory.length - 1}</div>
              </div>
            </div>
          </div>

          {/* Current tile info */}
          {playerPosition && (
            <div className="mt-4 pt-4 border-t border-slate-600">
              <h4 className="text-slate-400 text-xs uppercase mb-2">Current Location</h4>
              {(() => {
                const tile = tiles.get(`${playerPosition.q},${playerPosition.r}`);
                if (!tile) return null;
                return (
                  <div className="bg-slate-700/50 p-3 rounded">
                    <div className="text-white font-medium">{tile.name}</div>
                    <div className="text-slate-400 text-xs capitalize mt-1">{tile.category}</div>
                    {(tile.customDescription || tile.description) && (
                      <div className="text-slate-300 text-sm mt-2 italic">
                        "{tile.customDescription || tile.description}"
                      </div>
                    )}
                    {tile.monsters && tile.monsters.length > 0 && (
                      <div className="mt-2 flex items-center gap-1 text-red-400 text-sm">
                        <Skull className="w-3 h-3" />
                        {tile.monsters.map(m => `${m.count}x ${m.type}`).join(', ')}
                      </div>
                    )}
                    {tile.items && tile.items.length > 0 && (
                      <div className="mt-1 flex items-center gap-1 text-green-400 text-sm">
                        <Package className="w-3 h-3" />
                        {tile.items.map(i => i.name).join(', ')}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Center - Map */}
        <div className="flex-1 relative overflow-hidden bg-slate-900">
          {/* Briefing overlay */}
          {showBriefing && metadata.briefing && (
            <div className="absolute inset-0 bg-black/80 z-10 flex items-center justify-center p-8">
              <div className="max-w-lg bg-slate-800 rounded-lg p-6 border border-amber-600/50">
                <h3 className="text-amber-400 text-xl font-serif mb-4">{metadata.title}</h3>
                <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                  {metadata.briefing}
                </p>
                <Button
                  onClick={() => setShowBriefing(false)}
                  className="mt-6 w-full bg-amber-600 hover:bg-amber-700"
                >
                  Begin Investigation
                </Button>
              </div>
            </div>
          )}

          {/* SVG Map */}
          <svg
            className="w-full h-full"
            viewBox={`${bounds.minX - 50} ${bounds.minY - 50} ${bounds.width} ${bounds.height}`}
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              {/* Fog gradient */}
              <radialGradient id="fog-gradient">
                <stop offset="0%" stopColor="rgba(0,0,0,0)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0.8)" />
              </radialGradient>
            </defs>

            {/* Render tiles */}
            {Array.from(previewTiles.values()).map(tile => {
              const { x, y } = hexToPixel(tile.q, tile.r, HEX_SIZE);
              const isPlayerHere = playerPosition?.q === tile.q && playerPosition?.r === tile.r;
              const isClickable = playerPosition && isAdjacentToPlayer(tile.q, tile.r, playerPosition) && canMoveTo(tile.q, tile.r);
              const floorColor = FLOOR_COLORS[tile.floorType] || FLOOR_COLORS.stone;

              return (
                <g key={tile.id}>
                  {/* Tile background */}
                  <polygon
                    points={getHexCorners(x, y, HEX_SIZE - 2)}
                    fill={tile.isVisible ? floorColor : '#1a1a2e'}
                    stroke={isPlayerHere ? '#fbbf24' : isClickable ? '#60a5fa' : '#374151'}
                    strokeWidth={isPlayerHere ? 3 : isClickable ? 2 : 1}
                    opacity={tile.isExplored ? 1 : tile.isVisible ? 0.6 : 0.3}
                    className={isClickable ? 'cursor-pointer hover:brightness-125' : ''}
                    onClick={() => handleTileClick(tile.q, tile.r)}
                  />

                  {/* Edges */}
                  {tile.isVisible && getEdgePositions(x, y, HEX_SIZE - 2).map((edge, i) => {
                    const edgeType = tile.edges[i];
                    const doorConfig = tile.doorConfigs?.[i];

                    let strokeColor = 'transparent';
                    let strokeWidth = 1;

                    if (edgeType === 'WALL') {
                      strokeColor = '#6b7280';
                      strokeWidth = 3;
                    } else if (edgeType === 'DOOR') {
                      strokeColor = doorConfig?.state === 'LOCKED' ? '#ef4444' : '#92400e';
                      strokeWidth = 3;
                    } else if (edgeType === 'WINDOW') {
                      strokeColor = '#60a5fa';
                      strokeWidth = 2;
                    } else if (edgeType === 'STAIRS_UP' || edgeType === 'STAIRS_DOWN') {
                      strokeColor = '#8b5cf6';
                      strokeWidth = 2;
                    }

                    if (strokeColor === 'transparent') return null;

                    return (
                      <line
                        key={i}
                        x1={edge.x1}
                        y1={edge.y1}
                        x2={edge.x2}
                        y2={edge.y2}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                      />
                    );
                  })}

                  {/* Content when visible */}
                  {tile.isVisible && (
                    <>
                      {/* Category icon */}
                      <text
                        x={x}
                        y={y - 10}
                        textAnchor="middle"
                        fontSize="16"
                        opacity={0.5}
                      >
                        {CATEGORY_ICONS[tile.category] || '🏠'}
                      </text>

                      {/* Tile name */}
                      <text
                        x={x}
                        y={y + 5}
                        textAnchor="middle"
                        fontSize="8"
                        fill={tile.isExplored ? '#e5e7eb' : '#9ca3af'}
                        fontWeight="500"
                      >
                        {tile.name.length > 12 ? tile.name.slice(0, 10) + '...' : tile.name}
                      </text>

                      {/* Start location marker */}
                      {tile.isStartLocation && (
                        <g transform={`translate(${x + 15}, ${y - 15})`}>
                          <circle r="8" fill="#22c55e" />
                          <text x="0" y="3" textAnchor="middle" fontSize="10" fill="white">S</text>
                        </g>
                      )}

                      {/* Monster indicator */}
                      {tile.monsters && tile.monsters.length > 0 && (
                        <g transform={`translate(${x - 18}, ${y + 15})`}>
                          <circle r="8" fill="#dc2626" />
                          <text x="0" y="3" textAnchor="middle" fontSize="8" fill="white">
                            {tile.monsters.reduce((sum, m) => sum + m.count, 0)}
                          </text>
                        </g>
                      )}

                      {/* Item indicator */}
                      {tile.items && tile.items.length > 0 && (
                        <g transform={`translate(${x + 18}, ${y + 15})`}>
                          <circle r="8" fill="#22c55e" />
                          <text x="0" y="3" textAnchor="middle" fontSize="8" fill="white">
                            {tile.items.length}
                          </text>
                        </g>
                      )}
                    </>
                  )}

                  {/* Player marker */}
                  {isPlayerHere && (
                    <g transform={`translate(${x}, ${y})`}>
                      <circle r="12" fill="#fbbf24" stroke="#92400e" strokeWidth="2" />
                      <text x="0" y="4" textAnchor="middle" fontSize="14" fill="#1a1a2e">🔍</text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Instructions */}
          <div className="absolute bottom-4 left-4 bg-slate-800/90 px-4 py-2 rounded text-sm text-slate-300">
            Click adjacent tiles to move • Blue highlight = valid move
          </div>
        </div>

        {/* Right sidebar - Legend */}
        <div className="w-56 bg-slate-800 border-l border-slate-700 p-4 overflow-y-auto">
          <h3 className="text-white font-semibold mb-3">Legend</h3>

          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-amber-500" />
              <span className="text-slate-300">Player Position</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500" />
              <span className="text-slate-300">Start Location</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-600" />
              <span className="text-slate-300">Monsters</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-600" />
              <span className="text-slate-300">Items</span>
            </div>

            <div className="border-t border-slate-600 pt-3 mt-3">
              <h4 className="text-slate-400 text-xs uppercase mb-2">Edge Types</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-1 bg-gray-500" />
                  <span className="text-slate-400 text-xs">Wall</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-1 bg-amber-700" />
                  <span className="text-slate-400 text-xs">Door</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-1 bg-red-500" />
                  <span className="text-slate-400 text-xs">Locked Door</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-1 bg-purple-500" />
                  <span className="text-slate-400 text-xs">Stairs</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-1 bg-blue-400" />
                  <span className="text-slate-400 text-xs">Window</span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-600 pt-3 mt-3">
              <h4 className="text-slate-400 text-xs uppercase mb-2">Floor Types</h4>
              <div className="space-y-1">
                {Object.entries(FLOOR_COLORS).slice(0, 6).map(([type, color]) => (
                  <div key={type} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: color }} />
                    <span className="text-slate-400 text-xs capitalize">{type}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewPanel;
