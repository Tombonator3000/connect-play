/**
 * EDGE CONFIG PANEL
 *
 * Panel for configuring individual edges on a selected tile.
 * Allows changing edge types (WALL, DOOR, OPEN, etc.) per direction.
 */

import React from 'react';
import { ConnectionEdgeType } from '../../tileConnectionSystem';
import { DoorOpen, Wall, Square, ArrowUp, ArrowDown, Eye, Droplets, TreePine, Building2 } from 'lucide-react';

// ============================================================================
// CONSTANTS
// ============================================================================

const EDGE_TYPES: ConnectionEdgeType[] = [
  'WALL', 'OPEN', 'DOOR', 'WINDOW', 'STREET', 'NATURE', 'WATER', 'FACADE', 'STAIRS_UP', 'STAIRS_DOWN'
];

const DIRECTION_NAMES = ['N', 'NE', 'SE', 'S', 'SW', 'NW'];

const EDGE_INFO: Record<ConnectionEdgeType, { label: string; color: string; icon: React.ReactNode }> = {
  WALL: { label: 'Wall', color: '#64748b', icon: <Wall className="w-3 h-3" /> },
  OPEN: { label: 'Open', color: '#22c55e', icon: <Square className="w-3 h-3" /> },
  DOOR: { label: 'Door', color: '#f59e0b', icon: <DoorOpen className="w-3 h-3" /> },
  WINDOW: { label: 'Window', color: '#06b6d4', icon: <Eye className="w-3 h-3" /> },
  STREET: { label: 'Street', color: '#94a3b8', icon: <Building2 className="w-3 h-3" /> },
  NATURE: { label: 'Nature', color: '#22c55e', icon: <TreePine className="w-3 h-3" /> },
  WATER: { label: 'Water', color: '#3b82f6', icon: <Droplets className="w-3 h-3" /> },
  FACADE: { label: 'Facade', color: '#f97316', icon: <Building2 className="w-3 h-3" /> },
  STAIRS_UP: { label: 'Stairs Up', color: '#a855f7', icon: <ArrowUp className="w-3 h-3" /> },
  STAIRS_DOWN: { label: 'Stairs Down', color: '#ec4899', icon: <ArrowDown className="w-3 h-3" /> },
};

// ============================================================================
// COMPONENT
// ============================================================================

interface EdgeConfigPanelProps {
  edges: [ConnectionEdgeType, ConnectionEdgeType, ConnectionEdgeType, ConnectionEdgeType, ConnectionEdgeType, ConnectionEdgeType];
  onEdgeChange: (index: number, newType: ConnectionEdgeType) => void;
}

const EdgeConfigPanel: React.FC<EdgeConfigPanelProps> = ({ edges, onEdgeChange }) => {
  return (
    <div className="space-y-3">
      <h4 className="text-slate-300 text-sm font-medium">Edge Configuration</h4>

      {/* Visual hex diagram */}
      <div className="relative w-full h-32 flex items-center justify-center mb-4">
        <svg viewBox="0 0 100 100" className="w-32 h-32">
          {/* Hex outline */}
          <polygon
            points="25,10 75,10 95,50 75,90 25,90 5,50"
            fill="transparent"
            stroke="#475569"
            strokeWidth="1"
          />

          {/* Edge indicators */}
          {edges.map((edge, i) => {
            const info = EDGE_INFO[edge];
            const positions = [
              { x: 50, y: 5 },   // N
              { x: 88, y: 28 },  // NE
              { x: 88, y: 72 },  // SE
              { x: 50, y: 95 },  // S
              { x: 12, y: 72 },  // SW
              { x: 12, y: 28 },  // NW
            ];
            const pos = positions[i];

            return (
              <g key={i}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={8}
                  fill={info.color}
                  stroke="#1e293b"
                  strokeWidth="2"
                  className="cursor-pointer"
                />
                <text
                  x={pos.x}
                  y={pos.y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="6"
                  fontWeight="bold"
                >
                  {DIRECTION_NAMES[i]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Edge selectors */}
      <div className="grid grid-cols-2 gap-2">
        {DIRECTION_NAMES.map((dir, index) => {
          const currentEdge = edges[index];
          const info = EDGE_INFO[currentEdge];

          return (
            <div key={dir} className="bg-slate-700/50 rounded p-2">
              <div className="flex items-center gap-1 mb-1">
                <span className="text-slate-400 text-xs font-medium w-6">{dir}</span>
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: info.color }}
                />
              </div>
              <select
                value={currentEdge}
                onChange={(e) => onEdgeChange(index, e.target.value as ConnectionEdgeType)}
                className="w-full bg-slate-600 text-white text-xs px-1.5 py-1 rounded border border-slate-500 focus:border-amber-500 focus:outline-none"
              >
                {EDGE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {EDGE_INFO[type].label}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="flex gap-1 pt-2">
        <button
          onClick={() => DIRECTION_NAMES.forEach((_, i) => onEdgeChange(i, 'WALL'))}
          className="flex-1 text-xs bg-slate-600 hover:bg-slate-500 text-slate-300 px-2 py-1 rounded"
        >
          All Walls
        </button>
        <button
          onClick={() => DIRECTION_NAMES.forEach((_, i) => onEdgeChange(i, 'OPEN'))}
          className="flex-1 text-xs bg-green-700 hover:bg-green-600 text-white px-2 py-1 rounded"
        >
          All Open
        </button>
      </div>
    </div>
  );
};

export default EdgeConfigPanel;
