/**
 * DOOR CONFIG PANEL
 *
 * Panel for configuring door states on DOOR edges.
 * Allows setting:
 * - Door state (OPEN, CLOSED, LOCKED, BARRICADED, SEALED, PUZZLE)
 * - Key ID for locked doors
 * - Lock difficulty for lockpicking
 */

import React from 'react';
import { DoorOpen, Lock, Key, ShieldQuestion, Hammer, Sparkles } from 'lucide-react';
import { DoorState } from '../../types';
import { ConnectionEdgeType } from '../../tileConnectionSystem';
import { DoorConfig } from './index';

// ============================================================================
// DOOR STATE INFO
// ============================================================================

const DOOR_STATE_INFO: Record<DoorState, { label: string; icon: React.ReactNode; color: string; description: string }> = {
  open: {
    label: 'Open',
    icon: <DoorOpen className="w-3 h-3" />,
    color: 'text-green-400',
    description: 'Door is open, free passage',
  },
  closed: {
    label: 'Closed',
    icon: <DoorOpen className="w-3 h-3" />,
    color: 'text-slate-400',
    description: '1 AP to open',
  },
  locked: {
    label: 'Locked',
    icon: <Lock className="w-3 h-3" />,
    color: 'text-amber-400',
    description: 'Requires key or lockpick',
  },
  barricaded: {
    label: 'Barricaded',
    icon: <Hammer className="w-3 h-3" />,
    color: 'text-orange-400',
    description: 'Strength check to break',
  },
  broken: {
    label: 'Broken',
    icon: <DoorOpen className="w-3 h-3" />,
    color: 'text-red-400',
    description: 'Permanently open',
  },
  sealed: {
    label: 'Sealed',
    icon: <Sparkles className="w-3 h-3" />,
    color: 'text-purple-400',
    description: 'Occult - requires ritual',
  },
  puzzle: {
    label: 'Puzzle',
    icon: <ShieldQuestion className="w-3 h-3" />,
    color: 'text-cyan-400',
    description: 'Requires puzzle solution',
  },
};

const EDGE_NAMES = ['N', 'NE', 'SE', 'S', 'SW', 'NW'];

// ============================================================================
// COMPONENT
// ============================================================================

interface DoorConfigPanelProps {
  edges: ConnectionEdgeType[];
  doorConfigs: { [edgeIndex: number]: DoorConfig } | undefined;
  onDoorConfigChange: (edgeIndex: number, config: DoorConfig | undefined) => void;
}

const DoorConfigPanel: React.FC<DoorConfigPanelProps> = ({
  edges,
  doorConfigs,
  onDoorConfigChange,
}) => {
  // Find all DOOR edges
  const doorEdges = edges
    .map((edge, index) => ({ edge, index }))
    .filter(({ edge }) => edge === 'DOOR');

  if (doorEdges.length === 0) {
    return (
      <div className="text-slate-500 text-xs text-center py-2">
        No DOOR edges on this tile
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="text-slate-300 text-xs font-medium flex items-center gap-2">
        <DoorOpen className="w-4 h-4" />
        Door Configuration
      </h4>

      {doorEdges.map(({ edge, index }) => {
        const config = doorConfigs?.[index] || { state: 'closed' as DoorState };
        const stateInfo = DOOR_STATE_INFO[config.state];

        return (
          <div
            key={index}
            className="bg-slate-700/50 rounded p-2 space-y-2"
          >
            {/* Edge label */}
            <div className="flex items-center justify-between">
              <span className="text-white text-xs font-medium">
                {EDGE_NAMES[index]} Edge
              </span>
              <span className={`text-xs ${stateInfo.color} flex items-center gap-1`}>
                {stateInfo.icon}
                {stateInfo.label}
              </span>
            </div>

            {/* State selector */}
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Door State</label>
              <select
                value={config.state}
                onChange={(e) => {
                  const newState = e.target.value as DoorState;
                  onDoorConfigChange(index, {
                    ...config,
                    state: newState,
                    // Clear keyId if not locked
                    keyId: newState === 'locked' ? config.keyId : undefined,
                    lockDifficulty: newState === 'locked' ? config.lockDifficulty || 4 : undefined,
                  });
                }}
                className="w-full bg-slate-600 text-white text-xs px-2 py-1 rounded border border-slate-500"
              >
                {Object.entries(DOOR_STATE_INFO).map(([state, info]) => (
                  <option key={state} value={state}>
                    {info.label} - {info.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Locked door options */}
            {config.state === 'locked' && (
              <>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">
                    <Key className="w-3 h-3 inline mr-1" />
                    Key ID (optional)
                  </label>
                  <input
                    type="text"
                    value={config.keyId || ''}
                    onChange={(e) => {
                      onDoorConfigChange(index, {
                        ...config,
                        keyId: e.target.value || undefined,
                      });
                    }}
                    placeholder="e.g., master_key, basement_key"
                    className="w-full bg-slate-600 text-white text-xs px-2 py-1 rounded border border-slate-500"
                  />
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Leave empty for any key to work
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">
                    <Lock className="w-3 h-3 inline mr-1" />
                    Lock Difficulty (DC)
                  </label>
                  <select
                    value={config.lockDifficulty || 4}
                    onChange={(e) => {
                      onDoorConfigChange(index, {
                        ...config,
                        lockDifficulty: parseInt(e.target.value),
                      });
                    }}
                    className="w-full bg-slate-600 text-white text-xs px-2 py-1 rounded border border-slate-500"
                  >
                    <option value={3}>DC 3 - Simple (Easy)</option>
                    <option value={4}>DC 4 - Quality (Medium)</option>
                    <option value={5}>DC 5 - Complex (Hard)</option>
                    <option value={6}>DC 6 - Masterwork (Extreme)</option>
                  </select>
                </div>
              </>
            )}

            {/* Info text */}
            <div className="text-[10px] text-slate-500 italic">
              {stateInfo.description}
            </div>
          </div>
        );
      })}

      {/* Quick actions */}
      <div className="pt-2 border-t border-slate-600">
        <div className="text-[10px] text-slate-400 mb-1">Quick Actions:</div>
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => {
              doorEdges.forEach(({ index }) => {
                onDoorConfigChange(index, { state: 'closed' });
              });
            }}
            className="text-[10px] bg-slate-600 hover:bg-slate-500 text-white px-2 py-0.5 rounded"
          >
            All Closed
          </button>
          <button
            onClick={() => {
              doorEdges.forEach(({ index }) => {
                onDoorConfigChange(index, { state: 'open' });
              });
            }}
            className="text-[10px] bg-slate-600 hover:bg-slate-500 text-white px-2 py-0.5 rounded"
          >
            All Open
          </button>
          <button
            onClick={() => {
              doorEdges.forEach(({ index }) => {
                onDoorConfigChange(index, { state: 'locked', lockDifficulty: 4 });
              });
            }}
            className="text-[10px] bg-amber-600 hover:bg-amber-500 text-white px-2 py-0.5 rounded"
          >
            All Locked
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoorConfigPanel;
