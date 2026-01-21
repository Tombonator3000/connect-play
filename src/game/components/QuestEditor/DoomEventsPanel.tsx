/**
 * DOOM EVENTS PANEL
 *
 * Simplified editor for creating doom-triggered events.
 * These are events that fire when the doom counter reaches
 * specific thresholds during gameplay.
 *
 * Common doom events:
 * - Enemy reinforcements
 * - Boss spawns
 * - Environmental changes (lights out, doors lock)
 * - Sanity attacks
 * - Time warnings
 */

import React, { useState } from 'react';
import { AlertTriangle, Plus, Trash2, ChevronDown, ChevronRight, Skull, DoorOpen, Eye, MessageSquare, Volume2, Brain, Zap } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export type DoomEventActionType =
  | 'spawn_enemy'
  | 'spawn_boss'
  | 'lock_doors'
  | 'unlock_doors'
  | 'darkness'
  | 'sanity_attack'
  | 'show_message'
  | 'play_sound'
  | 'reveal_tile';

export interface DoomEventAction {
  type: DoomEventActionType;
  // Spawn actions
  enemyType?: string;
  enemyCount?: number;
  spawnTileQ?: number;
  spawnTileR?: number;
  spawnAtPlayer?: boolean;
  // Door actions
  doorTileQ?: number;
  doorTileR?: number;
  doorEdge?: number;
  allDoors?: boolean;
  // Sanity attack
  sanityDamage?: number;
  sanityMessage?: string;
  // Message/Sound
  message?: string;
  messageTitle?: string;
  soundId?: string;
  // Reveal
  revealTileQ?: number;
  revealTileR?: number;
}

export interface DoomEvent {
  id: string;
  name: string;
  doomThreshold: number;
  actions: DoomEventAction[];
  isOneTime: boolean;
  isEnabled: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const ACTION_TYPE_INFO: Record<DoomEventActionType, {
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
}> = {
  spawn_enemy: {
    label: 'Spawn Enemies',
    description: 'Spawn monsters',
    icon: Skull,
    color: 'text-red-400',
  },
  spawn_boss: {
    label: 'Spawn Boss',
    description: 'Spawn a boss monster',
    icon: Skull,
    color: 'text-purple-400',
  },
  lock_doors: {
    label: 'Lock Doors',
    description: 'Lock one or all doors',
    icon: DoorOpen,
    color: 'text-orange-400',
  },
  unlock_doors: {
    label: 'Unlock Doors',
    description: 'Unlock one or all doors',
    icon: DoorOpen,
    color: 'text-green-400',
  },
  darkness: {
    label: 'Darkness',
    description: 'Plunge area into darkness',
    icon: Eye,
    color: 'text-slate-400',
  },
  sanity_attack: {
    label: 'Sanity Attack',
    description: 'Damage all players sanity',
    icon: Brain,
    color: 'text-purple-400',
  },
  show_message: {
    label: 'Show Message',
    description: 'Display narrative text',
    icon: MessageSquare,
    color: 'text-blue-400',
  },
  play_sound: {
    label: 'Play Sound',
    description: 'Play atmosphere sound',
    icon: Volume2,
    color: 'text-cyan-400',
  },
  reveal_tile: {
    label: 'Reveal Tile',
    description: 'Reveal a hidden tile',
    icon: Eye,
    color: 'text-amber-400',
  },
};

const ENEMY_TYPES = [
  { id: 'cultist', label: 'Cultist', tier: 'minion' },
  { id: 'ghoul', label: 'Ghoul', tier: 'warrior' },
  { id: 'deep_one', label: 'Deep One', tier: 'warrior' },
  { id: 'mi_go', label: 'Mi-Go', tier: 'minion' },
  { id: 'nightgaunt', label: 'Nightgaunt', tier: 'minion' },
  { id: 'byakhee', label: 'Byakhee', tier: 'warrior' },
  { id: 'hunting_horror', label: 'Hunting Horror', tier: 'elite' },
  { id: 'dark_young', label: 'Dark Young', tier: 'elite' },
];

const BOSS_TYPES = [
  { id: 'shoggoth', label: 'Shoggoth' },
  { id: 'star_spawn', label: 'Star Spawn' },
  { id: 'dark_priest', label: 'Dark Priest' },
];

const SOUND_OPTIONS = [
  { id: 'thunder', label: 'Thunder' },
  { id: 'whispers', label: 'Whispers' },
  { id: 'scream', label: 'Scream' },
  { id: 'heartbeat', label: 'Heartbeat' },
  { id: 'monster_roar', label: 'Monster Roar' },
  { id: 'door_slam', label: 'Door Slam' },
  { id: 'bell_toll', label: 'Bell Toll' },
];

// ============================================================================
// COMPONENT
// ============================================================================

interface DoomEventsPanelProps {
  doomEvents: DoomEvent[];
  onDoomEventsChange: (events: DoomEvent[]) => void;
  startDoom: number;
}

const DoomEventsPanel: React.FC<DoomEventsPanelProps> = ({
  doomEvents,
  onDoomEventsChange,
  startDoom,
}) => {
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEventDoom, setNewEventDoom] = useState(Math.floor(startDoom / 2));

  const toggleEvent = (id: string) => {
    setExpandedEvents(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const addEvent = () => {
    const newEvent: DoomEvent = {
      id: `doom_event_${Date.now()}`,
      name: `Doom ${newEventDoom} Event`,
      doomThreshold: newEventDoom,
      actions: [],
      isOneTime: true,
      isEnabled: true,
    };
    onDoomEventsChange([...doomEvents, newEvent]);
    setExpandedEvents(prev => new Set(prev).add(newEvent.id));
    setShowAddForm(false);
  };

  const removeEvent = (id: string) => {
    onDoomEventsChange(doomEvents.filter(e => e.id !== id));
  };

  const updateEvent = (id: string, updates: Partial<DoomEvent>) => {
    onDoomEventsChange(doomEvents.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const addAction = (eventId: string, actionType: DoomEventActionType) => {
    const event = doomEvents.find(e => e.id === eventId);
    if (!event) return;

    const newAction: DoomEventAction = {
      type: actionType,
      ...(actionType === 'spawn_enemy' && { enemyType: 'cultist', enemyCount: 2, spawnAtPlayer: true }),
      ...(actionType === 'spawn_boss' && { enemyType: 'shoggoth', spawnAtPlayer: false }),
      ...(actionType === 'sanity_attack' && { sanityDamage: 1, sanityMessage: 'The darkness closes in...' }),
      ...(actionType === 'show_message' && { messageTitle: 'Warning', message: 'Time is running out...' }),
      ...(actionType === 'play_sound' && { soundId: 'thunder' }),
      ...(actionType === 'lock_doors' && { allDoors: true }),
      ...(actionType === 'unlock_doors' && { allDoors: false }),
    };

    updateEvent(eventId, { actions: [...event.actions, newAction] });
  };

  const removeAction = (eventId: string, actionIndex: number) => {
    const event = doomEvents.find(e => e.id === eventId);
    if (!event) return;
    updateEvent(eventId, { actions: event.actions.filter((_, i) => i !== actionIndex) });
  };

  const updateAction = (eventId: string, actionIndex: number, updates: Partial<DoomEventAction>) => {
    const event = doomEvents.find(e => e.id === eventId);
    if (!event) return;
    const newActions = event.actions.map((a, i) => i === actionIndex ? { ...a, ...updates } : a);
    updateEvent(eventId, { actions: newActions });
  };

  // Sort events by doom threshold (descending)
  const sortedEvents = [...doomEvents].sort((a, b) => b.doomThreshold - a.doomThreshold);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-slate-300 text-sm font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          Doom Events
        </h4>
        <span className="text-red-400 text-xs bg-red-400/20 px-2 py-0.5 rounded">
          Start Doom: {startDoom}
        </span>
      </div>

      {/* Doom timeline visualization */}
      <div className="bg-slate-700/50 rounded p-2">
        <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-1">
          <span>DOOM TIMELINE</span>
        </div>
        <div className="relative h-6 bg-gradient-to-r from-green-900 via-yellow-900 to-red-900 rounded overflow-hidden">
          {/* Event markers */}
          {sortedEvents.map(event => {
            const position = ((startDoom - event.doomThreshold) / startDoom) * 100;
            return (
              <div
                key={event.id}
                className="absolute top-0 bottom-0 w-0.5 bg-white/80"
                style={{ left: `${Math.min(100, Math.max(0, position))}%` }}
                title={`${event.name} at Doom ${event.doomThreshold}`}
              />
            );
          })}
          {/* Labels */}
          <div className="absolute left-1 top-1 text-[9px] text-white/70">{startDoom}</div>
          <div className="absolute right-1 top-1 text-[9px] text-white/70">0</div>
        </div>
      </div>

      {/* Events list */}
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {sortedEvents.map((event) => {
          const isExpanded = expandedEvents.has(event.id);

          return (
            <div
              key={event.id}
              className={`rounded border ${
                event.isEnabled
                  ? 'border-red-600/50 bg-red-900/20'
                  : 'border-slate-600 bg-slate-700/30 opacity-60'
              }`}
            >
              {/* Header */}
              <div
                className="flex items-center gap-2 px-2 py-1.5 cursor-pointer"
                onClick={() => toggleEvent(event.id)}
              >
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                )}
                <div className="w-8 h-5 bg-red-600/50 rounded flex items-center justify-center text-[10px] text-white font-mono shrink-0">
                  {event.doomThreshold}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-white truncate">{event.name}</div>
                  <div className="text-[10px] text-slate-400">
                    {event.actions.length} action{event.actions.length !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {event.isOneTime && (
                    <span className="text-[9px] bg-slate-600 px-1 rounded text-slate-300">1x</span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeEvent(event.id);
                    }}
                    className="w-5 h-5 bg-slate-600 hover:bg-red-600 rounded flex items-center justify-center"
                  >
                    <Trash2 className="w-3 h-3 text-white" />
                  </button>
                </div>
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <div className="px-2 pb-2 space-y-3 border-t border-slate-600/50 pt-2">
                  {/* Name and threshold */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Event Name</label>
                      <input
                        type="text"
                        value={event.name}
                        onChange={(e) => updateEvent(event.id, { name: e.target.value })}
                        className="w-full bg-slate-600 text-white text-xs px-2 py-1 rounded border border-slate-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Doom Threshold</label>
                      <input
                        type="number"
                        value={event.doomThreshold}
                        onChange={(e) => updateEvent(event.id, { doomThreshold: parseInt(e.target.value) || 0 })}
                        className="w-full bg-slate-600 text-white text-xs px-2 py-1 rounded border border-slate-500"
                        min={0}
                        max={startDoom}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="bg-slate-700/50 rounded p-2">
                    <div className="text-[10px] text-red-400 uppercase mb-2">
                      Actions ({event.actions.length})
                    </div>

                    {event.actions.map((action, actionIndex) => {
                      const actionInfo = ACTION_TYPE_INFO[action.type];
                      const ActionIcon = actionInfo.icon;

                      return (
                        <div key={actionIndex} className="bg-slate-600/50 rounded p-2 mb-2">
                          <div className="flex items-center gap-2 mb-2">
                            <ActionIcon className={`w-3 h-3 ${actionInfo.color}`} />
                            <span className="text-xs text-white flex-1">{actionInfo.label}</span>
                            <button
                              onClick={() => removeAction(event.id, actionIndex)}
                              className="w-4 h-4 bg-red-600/50 hover:bg-red-600 rounded flex items-center justify-center"
                            >
                              <Trash2 className="w-2.5 h-2.5 text-white" />
                            </button>
                          </div>

                          {/* Action-specific fields */}
                          {action.type === 'spawn_enemy' && (
                            <div className="space-y-1">
                              <select
                                value={action.enemyType || 'cultist'}
                                onChange={(e) => updateAction(event.id, actionIndex, { enemyType: e.target.value })}
                                className="w-full bg-slate-700 text-white text-[10px] px-1 py-0.5 rounded"
                              >
                                {ENEMY_TYPES.map(t => (
                                  <option key={t.id} value={t.id}>{t.label} ({t.tier})</option>
                                ))}
                              </select>
                              <div className="flex gap-1">
                                <input
                                  type="number"
                                  value={action.enemyCount ?? 2}
                                  onChange={(e) => updateAction(event.id, actionIndex, { enemyCount: parseInt(e.target.value) })}
                                  className="w-16 bg-slate-700 text-white text-[10px] px-1 py-0.5 rounded"
                                  min={1}
                                  placeholder="Count"
                                />
                                <label className="flex items-center gap-1 text-[10px] text-slate-300">
                                  <input
                                    type="checkbox"
                                    checked={action.spawnAtPlayer ?? true}
                                    onChange={(e) => updateAction(event.id, actionIndex, { spawnAtPlayer: e.target.checked })}
                                  />
                                  Near player
                                </label>
                              </div>
                              {!action.spawnAtPlayer && (
                                <div className="flex gap-1">
                                  <input
                                    type="number"
                                    value={action.spawnTileQ ?? 0}
                                    onChange={(e) => updateAction(event.id, actionIndex, { spawnTileQ: parseInt(e.target.value) })}
                                    className="flex-1 bg-slate-700 text-white text-[10px] px-1 py-0.5 rounded"
                                    placeholder="Q"
                                  />
                                  <input
                                    type="number"
                                    value={action.spawnTileR ?? 0}
                                    onChange={(e) => updateAction(event.id, actionIndex, { spawnTileR: parseInt(e.target.value) })}
                                    className="flex-1 bg-slate-700 text-white text-[10px] px-1 py-0.5 rounded"
                                    placeholder="R"
                                  />
                                </div>
                              )}
                            </div>
                          )}

                          {action.type === 'spawn_boss' && (
                            <div className="space-y-1">
                              <select
                                value={action.enemyType || 'shoggoth'}
                                onChange={(e) => updateAction(event.id, actionIndex, { enemyType: e.target.value })}
                                className="w-full bg-slate-700 text-white text-[10px] px-1 py-0.5 rounded"
                              >
                                {BOSS_TYPES.map(t => (
                                  <option key={t.id} value={t.id}>{t.label}</option>
                                ))}
                              </select>
                              <div className="flex gap-1">
                                <input
                                  type="number"
                                  value={action.spawnTileQ ?? 0}
                                  onChange={(e) => updateAction(event.id, actionIndex, { spawnTileQ: parseInt(e.target.value) })}
                                  className="flex-1 bg-slate-700 text-white text-[10px] px-1 py-0.5 rounded"
                                  placeholder="Spawn Q"
                                />
                                <input
                                  type="number"
                                  value={action.spawnTileR ?? 0}
                                  onChange={(e) => updateAction(event.id, actionIndex, { spawnTileR: parseInt(e.target.value) })}
                                  className="flex-1 bg-slate-700 text-white text-[10px] px-1 py-0.5 rounded"
                                  placeholder="Spawn R"
                                />
                              </div>
                            </div>
                          )}

                          {(action.type === 'lock_doors' || action.type === 'unlock_doors') && (
                            <div className="space-y-1">
                              <label className="flex items-center gap-1 text-[10px] text-slate-300">
                                <input
                                  type="checkbox"
                                  checked={action.allDoors ?? true}
                                  onChange={(e) => updateAction(event.id, actionIndex, { allDoors: e.target.checked })}
                                />
                                All doors
                              </label>
                              {!action.allDoors && (
                                <div className="flex gap-1">
                                  <input
                                    type="number"
                                    value={action.doorTileQ ?? 0}
                                    onChange={(e) => updateAction(event.id, actionIndex, { doorTileQ: parseInt(e.target.value) })}
                                    className="flex-1 bg-slate-700 text-white text-[10px] px-1 py-0.5 rounded"
                                    placeholder="Q"
                                  />
                                  <input
                                    type="number"
                                    value={action.doorTileR ?? 0}
                                    onChange={(e) => updateAction(event.id, actionIndex, { doorTileR: parseInt(e.target.value) })}
                                    className="flex-1 bg-slate-700 text-white text-[10px] px-1 py-0.5 rounded"
                                    placeholder="R"
                                  />
                                  <input
                                    type="number"
                                    value={action.doorEdge ?? 0}
                                    onChange={(e) => updateAction(event.id, actionIndex, { doorEdge: parseInt(e.target.value) })}
                                    className="w-12 bg-slate-700 text-white text-[10px] px-1 py-0.5 rounded"
                                    min={0}
                                    max={5}
                                    placeholder="Edge"
                                  />
                                </div>
                              )}
                            </div>
                          )}

                          {action.type === 'sanity_attack' && (
                            <div className="space-y-1">
                              <input
                                type="number"
                                value={action.sanityDamage ?? 1}
                                onChange={(e) => updateAction(event.id, actionIndex, { sanityDamage: parseInt(e.target.value) })}
                                className="w-full bg-slate-700 text-white text-[10px] px-1 py-0.5 rounded"
                                min={1}
                                placeholder="Sanity damage"
                              />
                              <input
                                type="text"
                                value={action.sanityMessage || ''}
                                onChange={(e) => updateAction(event.id, actionIndex, { sanityMessage: e.target.value })}
                                className="w-full bg-slate-700 text-white text-[10px] px-1 py-0.5 rounded"
                                placeholder="Message shown"
                              />
                            </div>
                          )}

                          {action.type === 'show_message' && (
                            <div className="space-y-1">
                              <input
                                type="text"
                                value={action.messageTitle || ''}
                                onChange={(e) => updateAction(event.id, actionIndex, { messageTitle: e.target.value })}
                                className="w-full bg-slate-700 text-white text-[10px] px-1 py-0.5 rounded"
                                placeholder="Title"
                              />
                              <textarea
                                value={action.message || ''}
                                onChange={(e) => updateAction(event.id, actionIndex, { message: e.target.value })}
                                className="w-full bg-slate-700 text-white text-[10px] px-1 py-0.5 rounded h-12 resize-none"
                                placeholder="Message..."
                              />
                            </div>
                          )}

                          {action.type === 'play_sound' && (
                            <select
                              value={action.soundId || 'thunder'}
                              onChange={(e) => updateAction(event.id, actionIndex, { soundId: e.target.value })}
                              className="w-full bg-slate-700 text-white text-[10px] px-1 py-0.5 rounded"
                            >
                              {SOUND_OPTIONS.map(s => (
                                <option key={s.id} value={s.id}>{s.label}</option>
                              ))}
                            </select>
                          )}

                          {action.type === 'reveal_tile' && (
                            <div className="flex gap-1">
                              <input
                                type="number"
                                value={action.revealTileQ ?? 0}
                                onChange={(e) => updateAction(event.id, actionIndex, { revealTileQ: parseInt(e.target.value) })}
                                className="flex-1 bg-slate-700 text-white text-[10px] px-1 py-0.5 rounded"
                                placeholder="Q"
                              />
                              <input
                                type="number"
                                value={action.revealTileR ?? 0}
                                onChange={(e) => updateAction(event.id, actionIndex, { revealTileR: parseInt(e.target.value) })}
                                className="flex-1 bg-slate-700 text-white text-[10px] px-1 py-0.5 rounded"
                                placeholder="R"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Quick add action buttons */}
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(ACTION_TYPE_INFO).map(([type, info]) => (
                        <button
                          key={type}
                          onClick={() => addAction(event.id, type as DoomEventActionType)}
                          className="text-[9px] bg-red-700/50 hover:bg-red-600 text-white px-1.5 py-0.5 rounded flex items-center gap-0.5"
                        >
                          <info.icon className={`w-2.5 h-2.5 ${info.color}`} />
                          {info.label.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Flags */}
                  <div className="flex gap-3">
                    <label className="flex items-center gap-1 text-xs text-white cursor-pointer">
                      <input
                        type="checkbox"
                        checked={event.isEnabled}
                        onChange={(e) => updateEvent(event.id, { isEnabled: e.target.checked })}
                        className="accent-green-500"
                      />
                      Enabled
                    </label>
                    <label className="flex items-center gap-1 text-xs text-white cursor-pointer">
                      <input
                        type="checkbox"
                        checked={event.isOneTime}
                        onChange={(e) => updateEvent(event.id, { isOneTime: e.target.checked })}
                        className="accent-yellow-500"
                      />
                      One-time
                    </label>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {doomEvents.length === 0 && !showAddForm && (
          <div className="text-center text-slate-500 text-xs py-4">
            No doom events. Add events that trigger at doom thresholds.
          </div>
        )}
      </div>

      {/* Add form */}
      {showAddForm ? (
        <div className="bg-slate-700/50 rounded p-2 space-y-2">
          <div>
            <label className="text-[10px] text-slate-400 block mb-0.5">Doom Threshold</label>
            <input
              type="number"
              value={newEventDoom}
              onChange={(e) => setNewEventDoom(parseInt(e.target.value) || 0)}
              className="w-full bg-slate-600 text-white text-xs px-2 py-1 rounded border border-slate-500"
              min={0}
              max={startDoom}
            />
          </div>
          <div className="flex gap-1">
            <button
              onClick={addEvent}
              className="flex-1 text-xs bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded"
            >
              Add Doom Event
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-xs bg-slate-600 hover:bg-slate-500 text-white px-2 py-1 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full flex items-center justify-center gap-1 text-xs bg-slate-700 hover:bg-slate-600 text-white px-2 py-2 rounded"
        >
          <Plus className="w-3 h-3" />
          Add Doom Event
        </button>
      )}

      {/* Quick templates */}
      <div className="pt-2 border-t border-slate-600">
        <div className="text-[10px] text-slate-400 mb-1">Quick Templates:</div>
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => {
              const newEvent: DoomEvent = {
                id: `doom_event_${Date.now()}`,
                name: 'Reinforcements',
                doomThreshold: Math.floor(startDoom * 0.6),
                actions: [
                  { type: 'spawn_enemy', enemyType: 'cultist', enemyCount: 3, spawnAtPlayer: true },
                  { type: 'show_message', messageTitle: 'Reinforcements!', message: 'More cultists arrive!' },
                ],
                isOneTime: true,
                isEnabled: true,
              };
              onDoomEventsChange([...doomEvents, newEvent]);
            }}
            className="text-[10px] bg-slate-600 hover:bg-slate-500 text-white px-2 py-0.5 rounded"
          >
            Reinforcements
          </button>
          <button
            onClick={() => {
              const newEvent: DoomEvent = {
                id: `doom_event_${Date.now()}`,
                name: 'Boss Awakens',
                doomThreshold: 3,
                actions: [
                  { type: 'spawn_boss', enemyType: 'shoggoth', spawnTileQ: 0, spawnTileR: 0 },
                  { type: 'play_sound', soundId: 'monster_roar' },
                  { type: 'show_message', messageTitle: 'TERROR!', message: 'Something massive awakens from the depths!' },
                ],
                isOneTime: true,
                isEnabled: true,
              };
              onDoomEventsChange([...doomEvents, newEvent]);
            }}
            className="text-[10px] bg-slate-600 hover:bg-slate-500 text-white px-2 py-0.5 rounded"
          >
            Boss Spawn
          </button>
          <button
            onClick={() => {
              const newEvent: DoomEvent = {
                id: `doom_event_${Date.now()}`,
                name: 'Darkness Falls',
                doomThreshold: Math.floor(startDoom * 0.4),
                actions: [
                  { type: 'darkness' },
                  { type: 'sanity_attack', sanityDamage: 1, sanityMessage: 'The lights go out. You feel something watching...' },
                ],
                isOneTime: true,
                isEnabled: true,
              };
              onDoomEventsChange([...doomEvents, newEvent]);
            }}
            className="text-[10px] bg-slate-600 hover:bg-slate-500 text-white px-2 py-0.5 rounded"
          >
            Darkness
          </button>
          <button
            onClick={() => {
              const newEvent: DoomEvent = {
                id: `doom_event_${Date.now()}`,
                name: 'Final Warning',
                doomThreshold: 1,
                actions: [
                  { type: 'show_message', messageTitle: 'DOOM APPROACHES', message: 'You have almost no time left. Escape now or face oblivion!' },
                  { type: 'play_sound', soundId: 'bell_toll' },
                ],
                isOneTime: true,
                isEnabled: true,
              };
              onDoomEventsChange([...doomEvents, newEvent]);
            }}
            className="text-[10px] bg-slate-600 hover:bg-slate-500 text-white px-2 py-0.5 rounded"
          >
            Final Warning
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoomEventsPanel;
