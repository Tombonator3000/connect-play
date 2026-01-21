/**
 * TRIGGER PANEL
 *
 * Panel for defining scenario triggers - events that happen
 * in response to player actions or game state changes.
 *
 * Trigger types:
 * - objective_complete: When an objective is completed
 * - tile_enter: When player enters a specific tile
 * - doom_threshold: When doom reaches a certain value
 * - item_pickup: When player picks up a specific item
 * - enemy_killed: When a specific enemy type is killed
 *
 * Actions:
 * - spawn_enemy: Spawn enemies on a tile
 * - unlock_door: Unlock a locked door
 * - reveal_tile: Make a hidden tile visible
 * - add_item: Add an item to a tile
 * - modify_doom: Change the doom counter
 * - show_message: Display a narrative message
 * - play_sound: Play a sound effect
 */

import React, { useState } from 'react';
import { Zap, Plus, Trash2, ChevronDown, ChevronRight, AlertTriangle, Skull, Package, DoorOpen, Eye, MessageSquare, Volume2 } from 'lucide-react';
import { EditorObjective } from './ObjectivesPanel';

// ============================================================================
// TYPES
// ============================================================================

export type TriggerType =
  | 'objective_complete'
  | 'tile_enter'
  | 'doom_threshold'
  | 'item_pickup'
  | 'enemy_killed'
  | 'round_start';

export type ActionType =
  | 'spawn_enemy'
  | 'unlock_door'
  | 'reveal_tile'
  | 'add_item'
  | 'modify_doom'
  | 'show_message'
  | 'play_sound'
  | 'complete_objective';

export interface TriggerAction {
  type: ActionType;
  // For spawn_enemy
  enemyType?: string;
  enemyCount?: number;
  targetTileQ?: number;
  targetTileR?: number;
  // For unlock_door
  doorTileQ?: number;
  doorTileR?: number;
  doorEdgeIndex?: number;
  // For reveal_tile
  revealTileQ?: number;
  revealTileR?: number;
  // For add_item
  itemId?: string;
  itemName?: string;
  // For modify_doom
  doomChange?: number;
  // For show_message
  message?: string;
  messageTitle?: string;
  // For play_sound
  soundId?: string;
  // For complete_objective
  objectiveId?: string;
}

export interface EditorTrigger {
  id: string;
  name: string;
  type: TriggerType;
  // Condition parameters
  objectiveId?: string;       // For objective_complete
  tileQ?: number;             // For tile_enter
  tileR?: number;
  doomValue?: number;         // For doom_threshold
  doomComparison?: 'lte' | 'gte' | 'eq';  // Less than or equal, greater than or equal, equal
  itemId?: string;            // For item_pickup
  enemyType?: string;         // For enemy_killed
  enemyCount?: number;        // How many must be killed
  roundNumber?: number;       // For round_start
  // Actions to perform
  actions: TriggerAction[];
  // Flags
  isOneTime: boolean;         // Only fire once per scenario
  isEnabled: boolean;         // Can be disabled
  delay?: number;             // Delay in rounds before firing
}

// ============================================================================
// CONSTANTS
// ============================================================================

const TRIGGER_TYPE_INFO: Record<TriggerType, { label: string; description: string; icon: React.ElementType }> = {
  objective_complete: { label: 'Objective Complete', description: 'When an objective is completed', icon: Zap },
  tile_enter: { label: 'Tile Enter', description: 'When player enters a tile', icon: Eye },
  doom_threshold: { label: 'Doom Threshold', description: 'When doom reaches a value', icon: AlertTriangle },
  item_pickup: { label: 'Item Pickup', description: 'When item is picked up', icon: Package },
  enemy_killed: { label: 'Enemy Killed', description: 'When enemies are killed', icon: Skull },
  round_start: { label: 'Round Start', description: 'At the start of a specific round', icon: Zap },
};

const ACTION_TYPE_INFO: Record<ActionType, { label: string; description: string; icon: React.ElementType }> = {
  spawn_enemy: { label: 'Spawn Enemy', description: 'Spawn enemies on a tile', icon: Skull },
  unlock_door: { label: 'Unlock Door', description: 'Unlock a locked door', icon: DoorOpen },
  reveal_tile: { label: 'Reveal Tile', description: 'Make a tile visible', icon: Eye },
  add_item: { label: 'Add Item', description: 'Add an item to a tile', icon: Package },
  modify_doom: { label: 'Modify Doom', description: 'Change doom counter', icon: AlertTriangle },
  show_message: { label: 'Show Message', description: 'Display a message', icon: MessageSquare },
  play_sound: { label: 'Play Sound', description: 'Play a sound effect', icon: Volume2 },
  complete_objective: { label: 'Complete Objective', description: 'Mark an objective complete', icon: Zap },
};

const ENEMY_TYPES = [
  'cultist', 'ghoul', 'deep_one', 'mi_go', 'nightgaunt', 'byakhee',
  'hunting_horror', 'dark_young', 'shoggoth', 'star_spawn'
];

const SOUND_IDS = [
  'door_open', 'door_locked', 'monster_spawn', 'item_pickup',
  'horror', 'ritual', 'thunder', 'whispers', 'scream'
];

// ============================================================================
// COMPONENT
// ============================================================================

interface TriggerPanelProps {
  triggers: EditorTrigger[];
  onTriggersChange: (triggers: EditorTrigger[]) => void;
  objectives: EditorObjective[];
}

const TriggerPanel: React.FC<TriggerPanelProps> = ({
  triggers,
  onTriggersChange,
  objectives,
}) => {
  const [expandedTriggers, setExpandedTriggers] = useState<Set<string>>(new Set());
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTriggerType, setNewTriggerType] = useState<TriggerType>('objective_complete');

  const toggleTrigger = (id: string) => {
    setExpandedTriggers(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const addTrigger = () => {
    const typeInfo = TRIGGER_TYPE_INFO[newTriggerType];
    const newTrigger: EditorTrigger = {
      id: `trigger_${Date.now()}`,
      name: `New ${typeInfo.label} Trigger`,
      type: newTriggerType,
      actions: [],
      isOneTime: true,
      isEnabled: true,
    };
    onTriggersChange([...triggers, newTrigger]);
    setExpandedTriggers(prev => new Set(prev).add(newTrigger.id));
    setShowAddForm(false);
  };

  const removeTrigger = (id: string) => {
    onTriggersChange(triggers.filter(t => t.id !== id));
  };

  const updateTrigger = (id: string, updates: Partial<EditorTrigger>) => {
    onTriggersChange(triggers.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const addAction = (triggerId: string, actionType: ActionType) => {
    const trigger = triggers.find(t => t.id === triggerId);
    if (!trigger) return;

    const newAction: TriggerAction = {
      type: actionType,
      ...(actionType === 'spawn_enemy' && { enemyType: 'cultist', enemyCount: 1 }),
      ...(actionType === 'modify_doom' && { doomChange: -1 }),
      ...(actionType === 'show_message' && { message: 'Something happens...', messageTitle: 'Event' }),
    };

    updateTrigger(triggerId, {
      actions: [...trigger.actions, newAction],
    });
  };

  const removeAction = (triggerId: string, actionIndex: number) => {
    const trigger = triggers.find(t => t.id === triggerId);
    if (!trigger) return;

    const newActions = trigger.actions.filter((_, i) => i !== actionIndex);
    updateTrigger(triggerId, { actions: newActions });
  };

  const updateAction = (triggerId: string, actionIndex: number, updates: Partial<TriggerAction>) => {
    const trigger = triggers.find(t => t.id === triggerId);
    if (!trigger) return;

    const newActions = trigger.actions.map((action, i) =>
      i === actionIndex ? { ...action, ...updates } : action
    );
    updateTrigger(triggerId, { actions: newActions });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-slate-300 text-sm font-medium flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-400" />
          Triggers
        </h4>
        <span className="text-slate-500 text-xs">
          {triggers.length} trigger{triggers.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Triggers list */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {triggers.map((trigger) => {
          const typeInfo = TRIGGER_TYPE_INFO[trigger.type];
          const TypeIcon = typeInfo.icon;
          const isExpanded = expandedTriggers.has(trigger.id);

          return (
            <div
              key={trigger.id}
              className={`rounded border ${
                trigger.isEnabled
                  ? 'border-yellow-600/50 bg-yellow-900/20'
                  : 'border-slate-600 bg-slate-700/30 opacity-60'
              }`}
            >
              {/* Header */}
              <div
                className="flex items-center gap-2 px-2 py-1.5 cursor-pointer"
                onClick={() => toggleTrigger(trigger.id)}
              >
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                )}
                <TypeIcon className="w-3 h-3 text-yellow-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-white truncate">
                    {trigger.name}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {typeInfo.label} → {trigger.actions.length} action{trigger.actions.length !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {trigger.isOneTime && (
                    <span className="text-[9px] bg-slate-600 px-1 rounded text-slate-300">1x</span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTrigger(trigger.id);
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
                  {/* Trigger name */}
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Name</label>
                    <input
                      type="text"
                      value={trigger.name}
                      onChange={(e) => updateTrigger(trigger.id, { name: e.target.value })}
                      className="w-full bg-slate-600 text-white text-xs px-2 py-1 rounded border border-slate-500"
                    />
                  </div>

                  {/* Trigger-specific conditions */}
                  <div className="bg-slate-700/50 p-2 rounded">
                    <div className="text-[10px] text-yellow-400 uppercase mb-2">Condition</div>

                    {trigger.type === 'objective_complete' && (
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Objective</label>
                        <select
                          value={trigger.objectiveId || ''}
                          onChange={(e) => updateTrigger(trigger.id, { objectiveId: e.target.value })}
                          className="w-full bg-slate-600 text-white text-xs px-2 py-1 rounded border border-slate-500"
                        >
                          <option value="">Select objective...</option>
                          {objectives.map(obj => (
                            <option key={obj.id} value={obj.id}>
                              {obj.description}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {trigger.type === 'tile_enter' && (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">Tile Q</label>
                          <input
                            type="number"
                            value={trigger.tileQ ?? 0}
                            onChange={(e) => updateTrigger(trigger.id, { tileQ: parseInt(e.target.value) })}
                            className="w-full bg-slate-600 text-white text-xs px-2 py-1 rounded border border-slate-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">Tile R</label>
                          <input
                            type="number"
                            value={trigger.tileR ?? 0}
                            onChange={(e) => updateTrigger(trigger.id, { tileR: parseInt(e.target.value) })}
                            className="w-full bg-slate-600 text-white text-xs px-2 py-1 rounded border border-slate-500"
                          />
                        </div>
                      </div>
                    )}

                    {trigger.type === 'doom_threshold' && (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">Comparison</label>
                          <select
                            value={trigger.doomComparison || 'lte'}
                            onChange={(e) => updateTrigger(trigger.id, { doomComparison: e.target.value as EditorTrigger['doomComparison'] })}
                            className="w-full bg-slate-600 text-white text-xs px-2 py-1 rounded border border-slate-500"
                          >
                            <option value="lte">≤ (Less/Equal)</option>
                            <option value="gte">≥ (Greater/Equal)</option>
                            <option value="eq">= (Equal)</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">Doom Value</label>
                          <input
                            type="number"
                            value={trigger.doomValue ?? 5}
                            onChange={(e) => updateTrigger(trigger.id, { doomValue: parseInt(e.target.value) })}
                            className="w-full bg-slate-600 text-white text-xs px-2 py-1 rounded border border-slate-500"
                            min={0}
                          />
                        </div>
                      </div>
                    )}

                    {trigger.type === 'item_pickup' && (
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Item ID</label>
                        <input
                          type="text"
                          value={trigger.itemId || ''}
                          onChange={(e) => updateTrigger(trigger.id, { itemId: e.target.value })}
                          className="w-full bg-slate-600 text-white text-xs px-2 py-1 rounded border border-slate-500"
                          placeholder="e.g., brass_key"
                        />
                      </div>
                    )}

                    {trigger.type === 'enemy_killed' && (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">Enemy Type</label>
                          <select
                            value={trigger.enemyType || 'cultist'}
                            onChange={(e) => updateTrigger(trigger.id, { enemyType: e.target.value })}
                            className="w-full bg-slate-600 text-white text-xs px-2 py-1 rounded border border-slate-500"
                          >
                            {ENEMY_TYPES.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">Count</label>
                          <input
                            type="number"
                            value={trigger.enemyCount ?? 1}
                            onChange={(e) => updateTrigger(trigger.id, { enemyCount: parseInt(e.target.value) })}
                            className="w-full bg-slate-600 text-white text-xs px-2 py-1 rounded border border-slate-500"
                            min={1}
                          />
                        </div>
                      </div>
                    )}

                    {trigger.type === 'round_start' && (
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Round Number</label>
                        <input
                          type="number"
                          value={trigger.roundNumber ?? 1}
                          onChange={(e) => updateTrigger(trigger.id, { roundNumber: parseInt(e.target.value) })}
                          className="w-full bg-slate-600 text-white text-xs px-2 py-1 rounded border border-slate-500"
                          min={1}
                        />
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="bg-slate-700/50 p-2 rounded">
                    <div className="text-[10px] text-green-400 uppercase mb-2">
                      Actions ({trigger.actions.length})
                    </div>

                    {trigger.actions.map((action, actionIndex) => {
                      const actionInfo = ACTION_TYPE_INFO[action.type];
                      const ActionIcon = actionInfo.icon;

                      return (
                        <div key={actionIndex} className="bg-slate-600/50 rounded p-2 mb-2">
                          <div className="flex items-center gap-2 mb-2">
                            <ActionIcon className="w-3 h-3 text-green-400" />
                            <span className="text-xs text-white flex-1">{actionInfo.label}</span>
                            <button
                              onClick={() => removeAction(trigger.id, actionIndex)}
                              className="w-4 h-4 bg-red-600/50 hover:bg-red-600 rounded flex items-center justify-center"
                            >
                              <Trash2 className="w-2.5 h-2.5 text-white" />
                            </button>
                          </div>

                          {/* Action-specific fields */}
                          {action.type === 'spawn_enemy' && (
                            <div className="space-y-1">
                              <div className="grid grid-cols-2 gap-1">
                                <select
                                  value={action.enemyType || 'cultist'}
                                  onChange={(e) => updateAction(trigger.id, actionIndex, { enemyType: e.target.value })}
                                  className="bg-slate-700 text-white text-[10px] px-1 py-0.5 rounded"
                                >
                                  {ENEMY_TYPES.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                  ))}
                                </select>
                                <input
                                  type="number"
                                  value={action.enemyCount ?? 1}
                                  onChange={(e) => updateAction(trigger.id, actionIndex, { enemyCount: parseInt(e.target.value) })}
                                  className="bg-slate-700 text-white text-[10px] px-1 py-0.5 rounded"
                                  min={1}
                                  placeholder="Count"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-1">
                                <input
                                  type="number"
                                  value={action.targetTileQ ?? 0}
                                  onChange={(e) => updateAction(trigger.id, actionIndex, { targetTileQ: parseInt(e.target.value) })}
                                  className="bg-slate-700 text-white text-[10px] px-1 py-0.5 rounded"
                                  placeholder="Tile Q"
                                />
                                <input
                                  type="number"
                                  value={action.targetTileR ?? 0}
                                  onChange={(e) => updateAction(trigger.id, actionIndex, { targetTileR: parseInt(e.target.value) })}
                                  className="bg-slate-700 text-white text-[10px] px-1 py-0.5 rounded"
                                  placeholder="Tile R"
                                />
                              </div>
                            </div>
                          )}

                          {action.type === 'unlock_door' && (
                            <div className="grid grid-cols-3 gap-1">
                              <input
                                type="number"
                                value={action.doorTileQ ?? 0}
                                onChange={(e) => updateAction(trigger.id, actionIndex, { doorTileQ: parseInt(e.target.value) })}
                                className="bg-slate-700 text-white text-[10px] px-1 py-0.5 rounded"
                                placeholder="Q"
                              />
                              <input
                                type="number"
                                value={action.doorTileR ?? 0}
                                onChange={(e) => updateAction(trigger.id, actionIndex, { doorTileR: parseInt(e.target.value) })}
                                className="bg-slate-700 text-white text-[10px] px-1 py-0.5 rounded"
                                placeholder="R"
                              />
                              <input
                                type="number"
                                value={action.doorEdgeIndex ?? 0}
                                onChange={(e) => updateAction(trigger.id, actionIndex, { doorEdgeIndex: parseInt(e.target.value) })}
                                className="bg-slate-700 text-white text-[10px] px-1 py-0.5 rounded"
                                min={0}
                                max={5}
                                placeholder="Edge"
                              />
                            </div>
                          )}

                          {action.type === 'reveal_tile' && (
                            <div className="grid grid-cols-2 gap-1">
                              <input
                                type="number"
                                value={action.revealTileQ ?? 0}
                                onChange={(e) => updateAction(trigger.id, actionIndex, { revealTileQ: parseInt(e.target.value) })}
                                className="bg-slate-700 text-white text-[10px] px-1 py-0.5 rounded"
                                placeholder="Tile Q"
                              />
                              <input
                                type="number"
                                value={action.revealTileR ?? 0}
                                onChange={(e) => updateAction(trigger.id, actionIndex, { revealTileR: parseInt(e.target.value) })}
                                className="bg-slate-700 text-white text-[10px] px-1 py-0.5 rounded"
                                placeholder="Tile R"
                              />
                            </div>
                          )}

                          {action.type === 'add_item' && (
                            <div className="space-y-1">
                              <input
                                type="text"
                                value={action.itemId || ''}
                                onChange={(e) => updateAction(trigger.id, actionIndex, { itemId: e.target.value })}
                                className="w-full bg-slate-700 text-white text-[10px] px-1 py-0.5 rounded"
                                placeholder="Item ID"
                              />
                              <input
                                type="text"
                                value={action.itemName || ''}
                                onChange={(e) => updateAction(trigger.id, actionIndex, { itemName: e.target.value })}
                                className="w-full bg-slate-700 text-white text-[10px] px-1 py-0.5 rounded"
                                placeholder="Item Name"
                              />
                            </div>
                          )}

                          {action.type === 'modify_doom' && (
                            <input
                              type="number"
                              value={action.doomChange ?? 0}
                              onChange={(e) => updateAction(trigger.id, actionIndex, { doomChange: parseInt(e.target.value) })}
                              className="w-full bg-slate-700 text-white text-[10px] px-1 py-0.5 rounded"
                              placeholder="Change (+/-)"
                            />
                          )}

                          {action.type === 'show_message' && (
                            <div className="space-y-1">
                              <input
                                type="text"
                                value={action.messageTitle || ''}
                                onChange={(e) => updateAction(trigger.id, actionIndex, { messageTitle: e.target.value })}
                                className="w-full bg-slate-700 text-white text-[10px] px-1 py-0.5 rounded"
                                placeholder="Title"
                              />
                              <textarea
                                value={action.message || ''}
                                onChange={(e) => updateAction(trigger.id, actionIndex, { message: e.target.value })}
                                className="w-full bg-slate-700 text-white text-[10px] px-1 py-0.5 rounded h-12 resize-none"
                                placeholder="Message text..."
                              />
                            </div>
                          )}

                          {action.type === 'play_sound' && (
                            <select
                              value={action.soundId || 'monster_spawn'}
                              onChange={(e) => updateAction(trigger.id, actionIndex, { soundId: e.target.value })}
                              className="w-full bg-slate-700 text-white text-[10px] px-1 py-0.5 rounded"
                            >
                              {SOUND_IDS.map(id => (
                                <option key={id} value={id}>{id}</option>
                              ))}
                            </select>
                          )}

                          {action.type === 'complete_objective' && (
                            <select
                              value={action.objectiveId || ''}
                              onChange={(e) => updateAction(trigger.id, actionIndex, { objectiveId: e.target.value })}
                              className="w-full bg-slate-700 text-white text-[10px] px-1 py-0.5 rounded"
                            >
                              <option value="">Select objective...</option>
                              {objectives.map(obj => (
                                <option key={obj.id} value={obj.id}>
                                  {obj.description}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      );
                    })}

                    {/* Add action button */}
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(ACTION_TYPE_INFO).map(([type, info]) => (
                        <button
                          key={type}
                          onClick={() => addAction(trigger.id, type as ActionType)}
                          className="text-[9px] bg-green-700/50 hover:bg-green-600 text-white px-1.5 py-0.5 rounded flex items-center gap-0.5"
                        >
                          <info.icon className="w-2.5 h-2.5" />
                          {info.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Flags */}
                  <div className="flex flex-wrap gap-3">
                    <label className="flex items-center gap-1 text-xs text-white cursor-pointer">
                      <input
                        type="checkbox"
                        checked={trigger.isEnabled}
                        onChange={(e) => updateTrigger(trigger.id, { isEnabled: e.target.checked })}
                        className="accent-green-500"
                      />
                      Enabled
                    </label>
                    <label className="flex items-center gap-1 text-xs text-white cursor-pointer">
                      <input
                        type="checkbox"
                        checked={trigger.isOneTime}
                        onChange={(e) => updateTrigger(trigger.id, { isOneTime: e.target.checked })}
                        className="accent-yellow-500"
                      />
                      One-time
                    </label>
                  </div>

                  {/* Delay */}
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Delay (rounds)</label>
                    <input
                      type="number"
                      value={trigger.delay ?? 0}
                      onChange={(e) => updateTrigger(trigger.id, { delay: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-600 text-white text-xs px-2 py-1 rounded border border-slate-500"
                      min={0}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {triggers.length === 0 && !showAddForm && (
          <div className="text-center text-slate-500 text-xs py-4">
            No triggers defined. Triggers react to game events.
          </div>
        )}
      </div>

      {/* Add form */}
      {showAddForm ? (
        <div className="bg-slate-700/50 rounded p-2 space-y-2">
          <div>
            <label className="text-[10px] text-slate-400 block mb-0.5">Trigger Type</label>
            <select
              value={newTriggerType}
              onChange={(e) => setNewTriggerType(e.target.value as TriggerType)}
              className="w-full bg-slate-600 text-white text-xs px-2 py-1 rounded border border-slate-500"
            >
              {Object.entries(TRIGGER_TYPE_INFO).map(([type, info]) => (
                <option key={type} value={type}>
                  {info.label} - {info.description}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-1">
            <button
              onClick={addTrigger}
              className="flex-1 text-xs bg-yellow-600 hover:bg-yellow-500 text-white px-2 py-1 rounded"
            >
              Add Trigger
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
          Add Trigger
        </button>
      )}

      {/* Quick templates */}
      <div className="pt-2 border-t border-slate-600">
        <div className="text-[10px] text-slate-400 mb-1">Quick Templates:</div>
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => {
              const newTrigger: EditorTrigger = {
                id: `trigger_${Date.now()}`,
                name: 'Boss Spawn on Low Doom',
                type: 'doom_threshold',
                doomValue: 5,
                doomComparison: 'lte',
                actions: [
                  { type: 'spawn_enemy', enemyType: 'shoggoth', enemyCount: 1, targetTileQ: 0, targetTileR: 0 },
                  { type: 'show_message', messageTitle: 'Terror!', message: 'Something massive awakens...' },
                ],
                isOneTime: true,
                isEnabled: true,
              };
              onTriggersChange([...triggers, newTrigger]);
            }}
            className="text-[10px] bg-slate-600 hover:bg-slate-500 text-white px-2 py-0.5 rounded"
          >
            Boss Spawn
          </button>
          <button
            onClick={() => {
              const newTrigger: EditorTrigger = {
                id: `trigger_${Date.now()}`,
                name: 'Ambush on Tile Enter',
                type: 'tile_enter',
                tileQ: 0,
                tileR: 0,
                actions: [
                  { type: 'spawn_enemy', enemyType: 'ghoul', enemyCount: 2 },
                  { type: 'show_message', messageTitle: 'Ambush!', message: 'Creatures emerge from the shadows!' },
                ],
                isOneTime: true,
                isEnabled: true,
              };
              onTriggersChange([...triggers, newTrigger]);
            }}
            className="text-[10px] bg-slate-600 hover:bg-slate-500 text-white px-2 py-0.5 rounded"
          >
            Ambush
          </button>
          <button
            onClick={() => {
              const newTrigger: EditorTrigger = {
                id: `trigger_${Date.now()}`,
                name: 'Door Unlock on Key',
                type: 'item_pickup',
                itemId: 'brass_key',
                actions: [
                  { type: 'unlock_door', doorTileQ: 0, doorTileR: 0, doorEdgeIndex: 0 },
                  { type: 'show_message', messageTitle: 'Click', message: 'You hear a lock open somewhere...' },
                ],
                isOneTime: true,
                isEnabled: true,
              };
              onTriggersChange([...triggers, newTrigger]);
            }}
            className="text-[10px] bg-slate-600 hover:bg-slate-500 text-white px-2 py-0.5 rounded"
          >
            Key → Door
          </button>
        </div>
      </div>
    </div>
  );
};

export default TriggerPanel;
