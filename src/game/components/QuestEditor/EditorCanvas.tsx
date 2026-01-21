/**
 * EDITOR CANVAS
 *
 * Hex-grid canvas for placing tiles in the Quest Editor.
 * Handles pan/zoom and tile rendering.
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { EditorTile, EditorTool } from './index';
import { TileTemplate, ConnectionEdgeType, rotateEdges } from '../../tileConnectionSystem';
import { MapPin, Star } from 'lucide-react';

// ============================================================================
// CONSTANTS
// ============================================================================

const HEX_SIZE = 80; // Slightly smaller than GameBoard for editor
const GRID_EXTENT = 15; // How many tiles to show in each direction

// Hex polygon points for flat-top hexagon (100x100 scale)
const HEX_POLY_POINTS = "25,0 75,0 100,50 75,100 25,100 0,50";

// Edge colors for visual debugging
const EDGE_COLORS: Record<ConnectionEdgeType, string> = {
  WALL: '#64748b',      // slate-500
  OPEN: '#22c55e',      // green-500
  DOOR: '#f59e0b',      // amber-500
  WINDOW: '#06b6d4',    // cyan-500
  STREET: '#94a3b8',    // slate-400
  NATURE: '#22c55e',    // green-500
  WATER: '#3b82f6',     // blue-500
  FACADE: '#f97316',    // orange-500
  STAIRS_UP: '#a855f7', // purple-500
  STAIRS_DOWN: '#ec4899' // pink-500
};

// Category colors for tiles
const CATEGORY_COLORS: Record<string, string> = {
  nature: '#22c55e20',
  urban: '#6b728020',
  street: '#94a3b820',
  facade: '#f9731620',
  foyer: '#f59e0b20',
  corridor: '#a8a29e20',
  room: '#d97706',
  stairs: '#a855f720',
  basement: '#57534e20',
  crypt: '#7f1d1d20',
};

// ============================================================================
// HEX MATH
// ============================================================================

function hexToPixel(q: number, r: number, size: number): { x: number; y: number } {
  const x = size * (3 / 2 * q);
  const y = size * (Math.sqrt(3) / 2 * q + Math.sqrt(3) * r);
  return { x, y };
}

function pixelToHex(x: number, y: number, size: number): { q: number; r: number } {
  const q = (2 / 3 * x) / size;
  const r = (-1 / 3 * x + Math.sqrt(3) / 3 * y) / size;
  return { q: Math.round(q), r: Math.round(r) };
}

// ============================================================================
// COMPONENT
// ============================================================================

interface EditorCanvasProps {
  tiles: Map<string, EditorTile>;
  selectedTileId: string | null;
  onTileClick: (q: number, r: number) => void;
  showGrid: boolean;
  activeTool: EditorTool;
  selectedTemplate: TileTemplate | null;
  rotation: number;
}

const EditorCanvas: React.FC<EditorCanvasProps> = ({
  tiles,
  selectedTileId,
  onTileClick,
  showGrid,
  activeTool,
  selectedTemplate,
  rotation
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredHex, setHoveredHex] = useState<{ q: number; r: number } | null>(null);

  // Center view on mount
  useEffect(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setOffset({ x: width / 2, y: height / 2 });
    }
  }, []);

  // Mouse handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && activeTool === 'pan')) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
      e.preventDefault();
    }
  }, [offset, activeTool]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }

    // Update hovered hex
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left - offset.x) / scale;
      const mouseY = (e.clientY - rect.top - offset.y) / scale;
      const hex = pixelToHex(mouseX, mouseY, HEX_SIZE);
      setHoveredHex(hex);
    }
  }, [isDragging, dragStart, offset, scale]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
    setHoveredHex(null);
  }, []);

  // Click handler
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (activeTool === 'pan') return;
    if (e.button !== 0) return;

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left - offset.x) / scale;
      const mouseY = (e.clientY - rect.top - offset.y) / scale;
      const hex = pixelToHex(mouseX, mouseY, HEX_SIZE);
      onTileClick(hex.q, hex.r);
    }
  }, [offset, scale, onTileClick, activeTool]);

  // Wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.min(2, Math.max(0.3, prev * delta)));
  }, []);

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  // Render a single hex tile
  const renderTile = (tile: EditorTile) => {
    const { x, y } = hexToPixel(tile.q, tile.r, HEX_SIZE);
    const key = `${tile.q},${tile.r}`;
    const isSelected = selectedTileId === key;
    const categoryColor = CATEGORY_COLORS[tile.category] || '#33333320';

    return (
      <g
        key={key}
        transform={`translate(${x - HEX_SIZE}, ${y - HEX_SIZE})`}
        style={{ cursor: activeTool !== 'pan' ? 'pointer' : 'move' }}
      >
        {/* Tile background */}
        <polygon
          points={HEX_POLY_POINTS}
          fill={categoryColor}
          stroke={isSelected ? '#f59e0b' : '#475569'}
          strokeWidth={isSelected ? 3 : 1}
          transform="scale(0.8)"
          style={{ transformOrigin: '50px 50px' }}
        />

        {/* Tile name */}
        <text
          x={50}
          y={45}
          textAnchor="middle"
          fill="#e2e8f0"
          fontSize={9}
          fontWeight="bold"
          transform="scale(0.8)"
          style={{ transformOrigin: '50px 50px' }}
        >
          {tile.name.length > 12 ? tile.name.substring(0, 12) + '...' : tile.name}
        </text>

        {/* Category label */}
        <text
          x={50}
          y={58}
          textAnchor="middle"
          fill="#94a3b8"
          fontSize={7}
          transform="scale(0.8)"
          style={{ transformOrigin: '50px 50px' }}
        >
          {tile.category}
        </text>

        {/* Edge indicators */}
        {renderEdgeIndicators(tile.edges)}

        {/* Start location indicator */}
        {tile.isStartLocation && (
          <g transform="translate(35, 70) scale(0.8)" style={{ transformOrigin: '50px 50px' }}>
            <Star className="w-4 h-4" fill="#22c55e" stroke="#22c55e" />
          </g>
        )}
      </g>
    );
  };

  // Render edge indicators
  const renderEdgeIndicators = (edges: ConnectionEdgeType[]) => {
    const edgePositions = [
      { x1: 25, y1: 0, x2: 75, y2: 0, cx: 50, cy: 0 },     // N
      { x1: 75, y1: 0, x2: 100, y2: 50, cx: 87, cy: 25 },  // NE
      { x1: 100, y1: 50, x2: 75, y2: 100, cx: 87, cy: 75 }, // SE
      { x1: 75, y1: 100, x2: 25, y2: 100, cx: 50, cy: 100 }, // S
      { x1: 25, y1: 100, x2: 0, y2: 50, cx: 13, cy: 75 },   // SW
      { x1: 0, y1: 50, x2: 25, y2: 0, cx: 13, cy: 25 },     // NW
    ];

    return edges.map((edge, i) => {
      const pos = edgePositions[i];
      const color = EDGE_COLORS[edge];

      // Only show non-WALL edges for clarity
      if (edge === 'WALL') return null;

      return (
        <g key={i} transform="scale(0.8)" style={{ transformOrigin: '50px 50px' }}>
          <line
            x1={pos.x1}
            y1={pos.y1}
            x2={pos.x2}
            y2={pos.y2}
            stroke={color}
            strokeWidth={3}
            strokeLinecap="round"
          />
        </g>
      );
    });
  };

  // Render grid cell (empty hex)
  const renderGridCell = (q: number, r: number) => {
    const { x, y } = hexToPixel(q, r, HEX_SIZE);
    const key = `grid_${q}_${r}`;
    const isHovered = hoveredHex?.q === q && hoveredHex?.r === r;
    const hasTile = tiles.has(`${q},${r}`);

    if (hasTile) return null; // Don't show grid under tiles

    return (
      <g
        key={key}
        transform={`translate(${x - HEX_SIZE}, ${y - HEX_SIZE})`}
      >
        <polygon
          points={HEX_POLY_POINTS}
          fill={isHovered && activeTool === 'place' && selectedTemplate ? 'rgba(245, 158, 11, 0.2)' : 'transparent'}
          stroke={showGrid ? '#334155' : 'transparent'}
          strokeWidth={1}
          strokeDasharray={showGrid ? '4,4' : 'none'}
          transform="scale(0.8)"
          style={{ transformOrigin: '50px 50px' }}
        />

        {/* Show coordinates on hover */}
        {isHovered && showGrid && (
          <text
            x={50}
            y={55}
            textAnchor="middle"
            fill="#64748b"
            fontSize={8}
            transform="scale(0.8)"
            style={{ transformOrigin: '50px 50px' }}
          >
            {q},{r}
          </text>
        )}
      </g>
    );
  };

  // Render preview of template being placed
  const renderPlacementPreview = () => {
    if (activeTool !== 'place' || !selectedTemplate || !hoveredHex) return null;
    if (tiles.has(`${hoveredHex.q},${hoveredHex.r}`)) return null;

    const { x, y } = hexToPixel(hoveredHex.q, hoveredHex.r, HEX_SIZE);
    const previewEdges = selectedTemplate.canRotate
      ? rotateEdges(selectedTemplate.edges, rotation)
      : selectedTemplate.edges;

    return (
      <g
        transform={`translate(${x - HEX_SIZE}, ${y - HEX_SIZE})`}
        style={{ opacity: 0.7, pointerEvents: 'none' }}
      >
        <polygon
          points={HEX_POLY_POINTS}
          fill="rgba(245, 158, 11, 0.3)"
          stroke="#f59e0b"
          strokeWidth={2}
          strokeDasharray="4,4"
          transform="scale(0.8)"
          style={{ transformOrigin: '50px 50px' }}
        />

        <text
          x={50}
          y={50}
          textAnchor="middle"
          fill="#f59e0b"
          fontSize={9}
          fontWeight="bold"
          transform="scale(0.8)"
          style={{ transformOrigin: '50px 50px' }}
        >
          {selectedTemplate.name}
        </text>

        {/* Preview edges */}
        {renderEdgeIndicators(previewEdges)}
      </g>
    );
  };

  // Generate grid cells
  const gridCells: JSX.Element[] = [];
  for (let q = -GRID_EXTENT; q <= GRID_EXTENT; q++) {
    for (let r = -GRID_EXTENT; r <= GRID_EXTENT; r++) {
      const cell = renderGridCell(q, r);
      if (cell) gridCells.push(cell);
    }
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-slate-950 overflow-hidden"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onWheel={handleWheel}
      style={{ cursor: isDragging ? 'grabbing' : activeTool === 'pan' ? 'grab' : 'crosshair' }}
    >
      <svg
        width="100%"
        height="100%"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          transformOrigin: '0 0'
        }}
      >
        {/* Grid cells */}
        {gridCells}

        {/* Placed tiles */}
        {Array.from(tiles.values()).map(renderTile)}

        {/* Placement preview */}
        {renderPlacementPreview()}

        {/* Origin marker */}
        <g transform="translate(-5, -5)">
          <circle cx={5} cy={5} r={4} fill="#f59e0b" opacity={0.5} />
        </g>
      </svg>

      {/* Zoom indicator */}
      <div className="absolute bottom-4 right-4 bg-slate-800/80 text-slate-300 px-2 py-1 rounded text-sm">
        {Math.round(scale * 100)}%
      </div>

      {/* Instructions overlay */}
      <div className="absolute top-4 left-4 bg-slate-800/80 text-slate-400 px-3 py-2 rounded text-xs space-y-1">
        <div>Scroll to zoom</div>
        <div>Middle-click drag to pan</div>
        <div>Click to place/select</div>
      </div>
    </div>
  );
};

export default EditorCanvas;
