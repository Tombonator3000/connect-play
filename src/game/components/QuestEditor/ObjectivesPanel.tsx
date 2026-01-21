/**
 * OBJECTIVES PANEL
 *
 * Panel for defining scenario objectives.
 * Supports different objective types: find_item, kill_enemies, escape, survival, etc.
 */

import React, { useState } from 'react';
import { Target, Plus, Trash2, ChevronDown, ChevronRight, Eye, EyeOff, Star } from 'lucide-react';

// ============================================================================
// OBJECTIVE TYPES
// ============================================================================

export type ObjectiveType =
  | 'find_item'
  | 'kill_enemies'
  | 'kill_boss'
  | 'escape'
  | 'survive'
  | 'perform_ritual'
  | 'explore'
  | 'rescue'
  | 'collect'
  | 'investigate';

export interface EditorObjective {
  id: string;
  type: ObjectiveType;
  description: string;
  targetId?: string;       // Item ID, enemy type, or tile ID
  targetAmount?: number;   // For collect/kill objectives
  isRequired: boolean;     // Must complete for victory
  isHidden: boolean;       // Hidden until revealed
  revealedBy?: string;     // ID of objective that reveals this one
  isBonus: boolean;        // Bonus objective (optional)
  insightReward?: number;  // Insight gained on completion
}

const OBJECTIVE_TYPE_INFO: Record<ObjectiveType, { label: string; description: string; hasTarget: boolean; hasAmount: boolean }> = {
  find_item: { label: 'Find Item', description: 'Locate a specific item', hasTarget: true, hasAmount: false },
  kill_enemies: { label: 'Kill Enemies', description: 'Defeat a number of enemies', hasTarget: true, hasAmount: true },
  kill_boss: { label: 'Kill Boss', description: 'Defeat a specific boss', hasTarget: true, hasAmount: false },
  escape: { label: 'Escape', description: 'Reach the exit', hasTarget: false, hasAmount: false },
  survive: { label: 'Survive', description: 'Survive for X rounds', hasTarget: false, hasAmount: true },
  perform_ritual: { label: 'Perform Ritual', description: 'Complete a ritual', hasTarget: true, hasAmount: false },
  explore: { label: 'Explore', description: 'Discover specific tiles', hasTarget: true, hasAmount: true },
  rescue: { label: 'Rescue', description: 'Save an NPC', hasTarget: true, hasAmount: false },
  collect: { label: 'Collect', description: 'Gather X collectibles', hasTarget: true, hasAmount: true },
  investigate: { label: 'Investigate', description: 'Find clues', hasTarget: false, hasAmount: true },
};

// ============================================================================
// COMPONENT
// ============================================================================

interface ObjectivesPanelProps {
  objectives: EditorObjective[];
  onObjectivesChange: (objectives: EditorObjective[]) => void;
}

const ObjectivesPanel: React.FC<ObjectivesPanelProps> = ({ objectives, onObjectivesChange }) => {
  const [expandedObjectives, setExpandedObjectives] = useState<Set<string>>(new Set());
  const [showAddForm, setShowAddForm] = useState(false);
  const [newObjectiveType, setNewObjectiveType] = useState<ObjectiveType>('find_item');

  const toggleObjective = (id: string) => {
    setExpandedObjectives(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const addObjective = () => {
    const typeInfo = OBJECTIVE_TYPE_INFO[newObjectiveType];
    const newObjective: EditorObjective = {
      id: `obj_${Date.now()}`,
      type: newObjectiveType,
      description: `${typeInfo.label} objective`,
      isRequired: true,
      isHidden: false,
      isBonus: false,
      targetAmount: typeInfo.hasAmount ? 1 : undefined,
    };
    onObjectivesChange([...objectives, newObjective]);
    setExpandedObjectives(prev => new Set(prev).add(newObjective.id));
    setShowAddForm(false);
  };

  const removeObjective = (id: string) => {
    onObjectivesChange(objectives.filter(o => o.id !== id));
  };

  const updateObjective = (id: string, updates: Partial<EditorObjective>) => {
    onObjectivesChange(objectives.map(o => o.id === id ? { ...o, ...updates } : o));
  };

  const requiredCount = objectives.filter(o => o.isRequired && !o.isBonus).length;
  const bonusCount = objectives.filter(o => o.isBonus).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-slate-300 text-sm font-medium flex items-center gap-2">
          <Target className="w-4 h-4" />
          Objectives
        </h4>
        <div className="flex items-center gap-2">
          {requiredCount > 0 && (
            <span className="text-red-400 text-xs bg-red-400/20 px-2 py-0.5 rounded">
              {requiredCount} required
            </span>
          )}
          {bonusCount > 0 && (
            <span className="text-amber-400 text-xs bg-amber-400/20 px-2 py-0.5 rounded">
              {bonusCount} bonus
            </span>
          )}
        </div>
      </div>

      {/* Objectives list */}
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {objectives.map((objective, index) => {
          const typeInfo = OBJECTIVE_TYPE_INFO[objective.type];
          const isExpanded = expandedObjectives.has(objective.id);

          return (
            <div
              key={objective.id}
              className={`rounded border ${
                objective.isBonus
                  ? 'border-amber-600/50 bg-amber-900/20'
                  : objective.isRequired
                  ? 'border-red-600/50 bg-red-900/20'
                  : 'border-slate-600 bg-slate-700/50'
              }`}
            >
              {/* Header */}
              <div
                className="flex items-center gap-2 px-2 py-1.5 cursor-pointer"
                onClick={() => toggleObjective(objective.id)}
              >
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                )}
                <span className="text-xs text-slate-400 w-4">{index + 1}.</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-white truncate">
                    {objective.description}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {typeInfo.label}
                    {objective.targetAmount && ` (${objective.targetAmount})`}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {objective.isHidden && <EyeOff className="w-3 h-3 text-slate-500" />}
                  {objective.isBonus && <Star className="w-3 h-3 text-amber-400" />}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeObjective(objective.id);
                    }}
                    className="w-5 h-5 bg-slate-600 hover:bg-red-600 rounded flex items-center justify-center"
                  >
                    <Trash2 className="w-3 h-3 text-white" />
                  </button>
                </div>
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <div className="px-2 pb-2 space-y-2 border-t border-slate-600/50 pt-2">
                  {/* Description */}
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Description</label>
                    <input
                      type="text"
                      value={objective.description}
                      onChange={(e) => updateObjective(objective.id, { description: e.target.value })}
                      className="w-full bg-slate-600 text-white text-xs px-2 py-1 rounded border border-slate-500"
                      placeholder="Objective description"
                    />
                  </div>

                  {/* Target ID */}
                  {typeInfo.hasTarget && (
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Target ID</label>
                      <input
                        type="text"
                        value={objective.targetId || ''}
                        onChange={(e) => updateObjective(objective.id, { targetId: e.target.value })}
                        className="w-full bg-slate-600 text-white text-xs px-2 py-1 rounded border border-slate-500"
                        placeholder="Item ID, enemy type, etc."
                      />
                    </div>
                  )}

                  {/* Target Amount */}
                  {typeInfo.hasAmount && (
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Amount</label>
                      <input
                        type="number"
                        value={objective.targetAmount || 1}
                        onChange={(e) => updateObjective(objective.id, { targetAmount: parseInt(e.target.value) || 1 })}
                        className="w-full bg-slate-600 text-white text-xs px-2 py-1 rounded border border-slate-500"
                        min={1}
                      />
                    </div>
                  )}

                  {/* Insight Reward */}
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Insight Reward</label>
                    <input
                      type="number"
                      value={objective.insightReward || 0}
                      onChange={(e) => updateObjective(objective.id, { insightReward: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-600 text-white text-xs px-2 py-1 rounded border border-slate-500"
                      min={0}
                    />
                  </div>

                  {/* Revealed By */}
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Revealed By (Objective ID)</label>
                    <select
                      value={objective.revealedBy || ''}
                      onChange={(e) => updateObjective(objective.id, { revealedBy: e.target.value || undefined })}
                      className="w-full bg-slate-600 text-white text-xs px-2 py-1 rounded border border-slate-500"
                    >
                      <option value="">Always visible</option>
                      {objectives
                        .filter(o => o.id !== objective.id)
                        .map(o => (
                          <option key={o.id} value={o.id}>
                            {o.description.substring(0, 30)}...
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Flags */}
                  <div className="flex flex-wrap gap-2">
                    <label className="flex items-center gap-1 text-xs text-white cursor-pointer">
                      <input
                        type="checkbox"
                        checked={objective.isRequired}
                        onChange={(e) => updateObjective(objective.id, { isRequired: e.target.checked })}
                        className="accent-red-500"
                      />
                      Required
                    </label>
                    <label className="flex items-center gap-1 text-xs text-white cursor-pointer">
                      <input
                        type="checkbox"
                        checked={objective.isHidden}
                        onChange={(e) => updateObjective(objective.id, { isHidden: e.target.checked })}
                        className="accent-slate-500"
                      />
                      Hidden
                    </label>
                    <label className="flex items-center gap-1 text-xs text-white cursor-pointer">
                      <input
                        type="checkbox"
                        checked={objective.isBonus}
                        onChange={(e) => updateObjective(objective.id, { isBonus: e.target.checked, isRequired: e.target.checked ? false : objective.isRequired })}
                        className="accent-amber-500"
                      />
                      Bonus
                    </label>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {objectives.length === 0 && !showAddForm && (
          <div className="text-center text-slate-500 text-xs py-4">
            No objectives defined. Add one to get started.
          </div>
        )}
      </div>

      {/* Add form */}
      {showAddForm ? (
        <div className="bg-slate-700/50 rounded p-2 space-y-2">
          <div>
            <label className="text-[10px] text-slate-400 block mb-0.5">Objective Type</label>
            <select
              value={newObjectiveType}
              onChange={(e) => setNewObjectiveType(e.target.value as ObjectiveType)}
              className="w-full bg-slate-600 text-white text-xs px-2 py-1 rounded border border-slate-500"
            >
              {Object.entries(OBJECTIVE_TYPE_INFO).map(([type, info]) => (
                <option key={type} value={type}>
                  {info.label} - {info.description}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-1">
            <button
              onClick={addObjective}
              className="flex-1 text-xs bg-green-600 hover:bg-green-500 text-white px-2 py-1 rounded"
            >
              Add Objective
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
          Add Objective
        </button>
      )}

      {/* Quick templates */}
      <div className="pt-2 border-t border-slate-600">
        <div className="text-[10px] text-slate-400 mb-1">Quick Templates:</div>
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => {
              onObjectivesChange([
                ...objectives,
                { id: `obj_${Date.now()}_1`, type: 'find_item', description: 'Find the key', isRequired: true, isHidden: false, isBonus: false, targetId: 'key' },
                { id: `obj_${Date.now()}_2`, type: 'escape', description: 'Escape', isRequired: true, isHidden: true, isBonus: false, revealedBy: `obj_${Date.now()}_1` },
              ]);
            }}
            className="text-[10px] bg-slate-600 hover:bg-slate-500 text-white px-2 py-0.5 rounded"
          >
            Escape
          </button>
          <button
            onClick={() => {
              onObjectivesChange([
                ...objectives,
                { id: `obj_${Date.now()}_1`, type: 'survive', description: 'Survive 5 rounds', targetAmount: 5, isRequired: true, isHidden: false, isBonus: false },
              ]);
            }}
            className="text-[10px] bg-slate-600 hover:bg-slate-500 text-white px-2 py-0.5 rounded"
          >
            Survival
          </button>
          <button
            onClick={() => {
              onObjectivesChange([
                ...objectives,
                { id: `obj_${Date.now()}_1`, type: 'kill_boss', description: 'Kill the boss', targetId: 'shoggoth', isRequired: true, isHidden: false, isBonus: false },
              ]);
            }}
            className="text-[10px] bg-slate-600 hover:bg-slate-500 text-white px-2 py-0.5 rounded"
          >
            Boss Kill
          </button>
          <button
            onClick={() => {
              onObjectivesChange([
                ...objectives,
                { id: `obj_${Date.now()}_1`, type: 'collect', description: 'Collect 3 artifacts', targetId: 'artifact', targetAmount: 3, isRequired: true, isHidden: false, isBonus: false },
              ]);
            }}
            className="text-[10px] bg-slate-600 hover:bg-slate-500 text-white px-2 py-0.5 rounded"
          >
            Collect
          </button>
        </div>
      </div>
    </div>
  );
};

export default ObjectivesPanel;
