/**
 * DIALOG EDITOR - Create conversation trees for NPCs
 *
 * Features:
 * - Visual conversation tree builder
 * - Multiple dialog options with branching
 * - Conditions for showing options (items, stats, completed objectives)
 * - Effects when options are selected (give items, trigger events, reveal info)
 * - Preview dialog flow
 */

import React, { useState, useCallback } from 'react';
import {
  MessageSquare, Plus, Trash2, ChevronDown, ChevronRight, Edit2, Check, X,
  ArrowRight, GitBranch, Gift, Eye, AlertTriangle, Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// ============================================================================
// TYPES
// ============================================================================

export type DialogConditionType =
  | 'none'              // Always show
  | 'has_item'          // Player has specific item
  | 'has_insight'       // Player has X insight
  | 'objective_complete' // Specific objective completed
  | 'objective_active'  // Specific objective is active
  | 'has_gold'          // Player has X gold
  | 'stat_check';       // Attribute >= value

export type DialogEffectType =
  | 'none'              // No effect
  | 'give_item'         // Give item to player
  | 'take_item'         // Remove item from player
  | 'give_gold'         // Give gold
  | 'take_gold'         // Take gold
  | 'give_insight'      // Give insight
  | 'reveal_objective'  // Reveal hidden objective
  | 'complete_objective' // Mark objective as complete
  | 'trigger_event'     // Trigger a game event
  | 'set_flag'          // Set a story flag
  | 'heal'              // Heal HP
  | 'heal_sanity';      // Restore sanity

export interface DialogCondition {
  type: DialogConditionType;
  itemId?: string;
  objectiveId?: string;
  statName?: 'strength' | 'agility' | 'intellect' | 'willpower';
  value?: number;
}

export interface DialogEffect {
  type: DialogEffectType;
  itemId?: string;
  itemName?: string;
  objectiveId?: string;
  eventId?: string;
  flagName?: string;
  value?: number;
}

export interface DialogOption {
  id: string;
  text: string;           // What player says/chooses
  condition?: DialogCondition;
  effects?: DialogEffect[];
  nextNodeId?: string;    // ID of next dialog node, or null to end
  isExit?: boolean;       // If true, this ends the conversation
}

export interface DialogNode {
  id: string;
  npcText: string;        // What NPC says
  options: DialogOption[];
  isRoot?: boolean;       // Is this the first node?
}

export interface DialogTree {
  id: string;
  name: string;
  nodes: DialogNode[];
  rootNodeId: string;
}

interface DialogEditorProps {
  dialogTree?: DialogTree;
  onChange: (tree: DialogTree) => void;
  availableItems?: { id: string; name: string }[];
  availableObjectives?: { id: string; name: string }[];
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateId(): string {
  return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function createEmptyDialogTree(name: string = 'New Dialog'): DialogTree {
  const rootNode: DialogNode = {
    id: generateId(),
    npcText: 'Hello, traveler.',
    options: [
      { id: generateId(), text: 'Hello.', isExit: true }
    ],
    isRoot: true
  };

  return {
    id: generateId(),
    name,
    nodes: [rootNode],
    rootNodeId: rootNode.id
  };
}

// ============================================================================
// CONDITION EDITOR SUB-COMPONENT
// ============================================================================

interface ConditionEditorProps {
  condition?: DialogCondition;
  onChange: (condition: DialogCondition | undefined) => void;
  availableItems?: { id: string; name: string }[];
  availableObjectives?: { id: string; name: string }[];
}

const ConditionEditor: React.FC<ConditionEditorProps> = ({
  condition,
  onChange,
  availableItems = [],
  availableObjectives = []
}) => {
  const type = condition?.type || 'none';

  return (
    <div className="space-y-2 p-2 bg-slate-700/50 rounded">
      <div className="text-[10px] text-amber-400 uppercase">Show Option If</div>
      <select
        value={type}
        onChange={(e) => {
          const newType = e.target.value as DialogConditionType;
          if (newType === 'none') {
            onChange(undefined);
          } else {
            onChange({ type: newType });
          }
        }}
        className="w-full bg-slate-600 text-white text-xs px-2 py-1 rounded border border-slate-500"
      >
        <option value="none">Always</option>
        <option value="has_item">Has Item</option>
        <option value="has_insight">Has Insight</option>
        <option value="has_gold">Has Gold</option>
        <option value="objective_complete">Objective Complete</option>
        <option value="objective_active">Objective Active</option>
        <option value="stat_check">Stat Check</option>
      </select>

      {type === 'has_item' && (
        <select
          value={condition?.itemId || ''}
          onChange={(e) => onChange({ ...condition!, itemId: e.target.value })}
          className="w-full bg-slate-600 text-white text-xs px-2 py-1 rounded border border-slate-500"
        >
          <option value="">Select item...</option>
          {availableItems.map(item => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
      )}

      {(type === 'has_insight' || type === 'has_gold') && (
        <input
          type="number"
          value={condition?.value ?? 1}
          onChange={(e) => onChange({ ...condition!, value: parseInt(e.target.value) })}
          className="w-full bg-slate-600 text-white text-xs px-2 py-1 rounded border border-slate-500"
          min={1}
          placeholder={type === 'has_insight' ? 'Min insight' : 'Min gold'}
        />
      )}

      {(type === 'objective_complete' || type === 'objective_active') && (
        <select
          value={condition?.objectiveId || ''}
          onChange={(e) => onChange({ ...condition!, objectiveId: e.target.value })}
          className="w-full bg-slate-600 text-white text-xs px-2 py-1 rounded border border-slate-500"
        >
          <option value="">Select objective...</option>
          {availableObjectives.map(obj => (
            <option key={obj.id} value={obj.id}>{obj.name}</option>
          ))}
        </select>
      )}

      {type === 'stat_check' && (
        <div className="flex gap-1">
          <select
            value={condition?.statName || 'intellect'}
            onChange={(e) => onChange({ ...condition!, statName: e.target.value as any })}
            className="flex-1 bg-slate-600 text-white text-xs px-2 py-1 rounded border border-slate-500"
          >
            <option value="strength">Strength</option>
            <option value="agility">Agility</option>
            <option value="intellect">Intellect</option>
            <option value="willpower">Willpower</option>
          </select>
          <input
            type="number"
            value={condition?.value ?? 3}
            onChange={(e) => onChange({ ...condition!, value: parseInt(e.target.value) })}
            className="w-16 bg-slate-600 text-white text-xs px-2 py-1 rounded border border-slate-500"
            min={1}
            max={6}
          />
        </div>
      )}
    </div>
  );
};

// ============================================================================
// EFFECT EDITOR SUB-COMPONENT
// ============================================================================

interface EffectEditorProps {
  effects?: DialogEffect[];
  onChange: (effects: DialogEffect[]) => void;
  availableItems?: { id: string; name: string }[];
  availableObjectives?: { id: string; name: string }[];
}

const EffectEditor: React.FC<EffectEditorProps> = ({
  effects = [],
  onChange,
  availableItems = [],
  availableObjectives = []
}) => {
  const addEffect = () => {
    onChange([...effects, { type: 'none' }]);
  };

  const updateEffect = (index: number, effect: DialogEffect) => {
    const newEffects = [...effects];
    newEffects[index] = effect;
    onChange(newEffects);
  };

  const removeEffect = (index: number) => {
    onChange(effects.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2 p-2 bg-slate-700/50 rounded">
      <div className="flex items-center justify-between">
        <div className="text-[10px] text-green-400 uppercase">Effects</div>
        <button
          onClick={addEffect}
          className="text-[10px] bg-green-600/50 hover:bg-green-600 text-white px-2 py-0.5 rounded"
        >
          + Add
        </button>
      </div>

      {effects.map((effect, index) => (
        <div key={index} className="flex gap-1 items-start">
          <div className="flex-1 space-y-1">
            <select
              value={effect.type}
              onChange={(e) => updateEffect(index, { ...effect, type: e.target.value as DialogEffectType })}
              className="w-full bg-slate-600 text-white text-[10px] px-1 py-0.5 rounded"
            >
              <option value="none">No Effect</option>
              <option value="give_item">Give Item</option>
              <option value="take_item">Take Item</option>
              <option value="give_gold">Give Gold</option>
              <option value="take_gold">Take Gold</option>
              <option value="give_insight">Give Insight</option>
              <option value="heal">Heal HP</option>
              <option value="heal_sanity">Restore Sanity</option>
              <option value="reveal_objective">Reveal Objective</option>
              <option value="complete_objective">Complete Objective</option>
              <option value="set_flag">Set Flag</option>
            </select>

            {(effect.type === 'give_item' || effect.type === 'take_item') && (
              <select
                value={effect.itemId || ''}
                onChange={(e) => updateEffect(index, { ...effect, itemId: e.target.value })}
                className="w-full bg-slate-600 text-white text-[10px] px-1 py-0.5 rounded"
              >
                <option value="">Select item...</option>
                {availableItems.map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            )}

            {['give_gold', 'take_gold', 'give_insight', 'heal', 'heal_sanity'].includes(effect.type) && (
              <input
                type="number"
                value={effect.value ?? 1}
                onChange={(e) => updateEffect(index, { ...effect, value: parseInt(e.target.value) })}
                className="w-full bg-slate-600 text-white text-[10px] px-1 py-0.5 rounded"
                min={1}
              />
            )}

            {(effect.type === 'reveal_objective' || effect.type === 'complete_objective') && (
              <select
                value={effect.objectiveId || ''}
                onChange={(e) => updateEffect(index, { ...effect, objectiveId: e.target.value })}
                className="w-full bg-slate-600 text-white text-[10px] px-1 py-0.5 rounded"
              >
                <option value="">Select objective...</option>
                {availableObjectives.map(obj => (
                  <option key={obj.id} value={obj.id}>{obj.name}</option>
                ))}
              </select>
            )}

            {effect.type === 'set_flag' && (
              <input
                type="text"
                value={effect.flagName || ''}
                onChange={(e) => updateEffect(index, { ...effect, flagName: e.target.value })}
                className="w-full bg-slate-600 text-white text-[10px] px-1 py-0.5 rounded"
                placeholder="Flag name"
              />
            )}
          </div>
          <button
            onClick={() => removeEffect(index)}
            className="w-5 h-5 bg-red-600/50 hover:bg-red-600 rounded flex items-center justify-center shrink-0"
          >
            <X className="w-3 h-3 text-white" />
          </button>
        </div>
      ))}

      {effects.length === 0 && (
        <div className="text-[10px] text-slate-500 text-center py-1">No effects</div>
      )}
    </div>
  );
};

// ============================================================================
// DIALOG NODE EDITOR SUB-COMPONENT
// ============================================================================

interface DialogNodeEditorProps {
  node: DialogNode;
  allNodes: DialogNode[];
  onUpdate: (node: DialogNode) => void;
  onDelete: () => void;
  onAddNode: (afterOptionId: string) => string; // Returns new node ID
  availableItems?: { id: string; name: string }[];
  availableObjectives?: { id: string; name: string }[];
}

const DialogNodeEditor: React.FC<DialogNodeEditorProps> = ({
  node,
  allNodes,
  onUpdate,
  onDelete,
  onAddNode,
  availableItems,
  availableObjectives
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [expandedOptions, setExpandedOptions] = useState<Set<string>>(new Set());

  const toggleOption = (optionId: string) => {
    setExpandedOptions(prev => {
      const next = new Set(prev);
      if (next.has(optionId)) {
        next.delete(optionId);
      } else {
        next.add(optionId);
      }
      return next;
    });
  };

  const addOption = () => {
    const newOption: DialogOption = {
      id: generateId(),
      text: 'New option',
      isExit: true
    };
    onUpdate({
      ...node,
      options: [...node.options, newOption]
    });
  };

  const updateOption = (optionId: string, updates: Partial<DialogOption>) => {
    onUpdate({
      ...node,
      options: node.options.map(opt =>
        opt.id === optionId ? { ...opt, ...updates } : opt
      )
    });
  };

  const removeOption = (optionId: string) => {
    if (node.options.length <= 1) return; // Must have at least one option
    onUpdate({
      ...node,
      options: node.options.filter(opt => opt.id !== optionId)
    });
  };

  const handleLinkToNewNode = (optionId: string) => {
    const newNodeId = onAddNode(optionId);
    updateOption(optionId, { nextNodeId: newNodeId, isExit: false });
  };

  return (
    <div className={`rounded border ${node.isRoot ? 'border-amber-600/50 bg-amber-900/10' : 'border-slate-600 bg-slate-800/50'}`}>
      {/* Node header */}
      <div
        className="flex items-center gap-2 px-3 py-2 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-400" />
        )}
        <MessageSquare className={`w-4 h-4 ${node.isRoot ? 'text-amber-400' : 'text-cyan-400'}`} />
        <div className="flex-1 min-w-0">
          <div className="text-sm text-white truncate">
            {node.npcText.substring(0, 40)}...
          </div>
          <div className="text-[10px] text-slate-500">
            {node.options.length} option{node.options.length !== 1 ? 's' : ''}
            {node.isRoot && <span className="text-amber-400 ml-2">(ROOT)</span>}
          </div>
        </div>
        {!node.isRoot && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="w-6 h-6 bg-slate-600 hover:bg-red-600 rounded flex items-center justify-center"
          >
            <Trash2 className="w-3 h-3 text-white" />
          </button>
        )}
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-3 pb-3 space-y-3 border-t border-slate-600/50 pt-3">
          {/* NPC Text */}
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">NPC Says</label>
            <textarea
              value={node.npcText}
              onChange={(e) => onUpdate({ ...node, npcText: e.target.value })}
              className="w-full bg-slate-700 text-white text-sm px-2 py-1.5 rounded border border-slate-500 resize-none"
              rows={3}
              placeholder="What the NPC says..."
            />
          </div>

          {/* Options */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] text-slate-400">Player Options</label>
              <button
                onClick={addOption}
                className="text-[10px] bg-cyan-600/50 hover:bg-cyan-600 text-white px-2 py-0.5 rounded"
              >
                + Add Option
              </button>
            </div>

            <div className="space-y-2">
              {node.options.map((option, optIndex) => {
                const isOptionExpanded = expandedOptions.has(option.id);
                const linkedNode = option.nextNodeId
                  ? allNodes.find(n => n.id === option.nextNodeId)
                  : null;

                return (
                  <div
                    key={option.id}
                    className={`rounded border ${option.isExit ? 'border-red-600/30 bg-red-900/10' : 'border-blue-600/30 bg-blue-900/10'}`}
                  >
                    {/* Option header */}
                    <div className="flex items-center gap-2 px-2 py-1.5">
                      <button
                        onClick={() => toggleOption(option.id)}
                        className="p-0.5"
                      >
                        {isOptionExpanded ? (
                          <ChevronDown className="w-3 h-3 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-3 h-3 text-slate-400" />
                        )}
                      </button>
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) => updateOption(option.id, { text: e.target.value })}
                        className="flex-1 bg-transparent text-white text-xs border-none focus:outline-none"
                        placeholder="Player says..."
                      />
                      <div className="flex items-center gap-1">
                        {option.condition && option.condition.type !== 'none' && (
                          <Eye className="w-3 h-3 text-amber-400" title="Has condition" />
                        )}
                        {option.effects && option.effects.length > 0 && (
                          <Gift className="w-3 h-3 text-green-400" title="Has effects" />
                        )}
                        {linkedNode && (
                          <ArrowRight className="w-3 h-3 text-blue-400" title={`Links to: ${linkedNode.npcText.substring(0, 20)}...`} />
                        )}
                        {option.isExit && (
                          <X className="w-3 h-3 text-red-400" title="Ends conversation" />
                        )}
                      </div>
                      {node.options.length > 1 && (
                        <button
                          onClick={() => removeOption(option.id)}
                          className="w-5 h-5 bg-slate-600 hover:bg-red-600 rounded flex items-center justify-center"
                        >
                          <Trash2 className="w-2.5 h-2.5 text-white" />
                        </button>
                      )}
                    </div>

                    {/* Expanded option content */}
                    {isOptionExpanded && (
                      <div className="px-2 pb-2 space-y-2 border-t border-slate-600/30 pt-2 ml-4">
                        {/* Condition */}
                        <ConditionEditor
                          condition={option.condition}
                          onChange={(condition) => updateOption(option.id, { condition })}
                          availableItems={availableItems}
                          availableObjectives={availableObjectives}
                        />

                        {/* Effects */}
                        <EffectEditor
                          effects={option.effects}
                          onChange={(effects) => updateOption(option.id, { effects })}
                          availableItems={availableItems}
                          availableObjectives={availableObjectives}
                        />

                        {/* Link/Exit controls */}
                        <div className="p-2 bg-slate-700/50 rounded">
                          <div className="text-[10px] text-blue-400 uppercase mb-2">After Selection</div>
                          <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
                              <input
                                type="checkbox"
                                checked={option.isExit ?? false}
                                onChange={(e) => updateOption(option.id, {
                                  isExit: e.target.checked,
                                  nextNodeId: e.target.checked ? undefined : option.nextNodeId
                                })}
                                className="accent-red-500"
                              />
                              End Conversation
                            </label>

                            {!option.isExit && (
                              <div className="flex gap-1">
                                <select
                                  value={option.nextNodeId || ''}
                                  onChange={(e) => updateOption(option.id, {
                                    nextNodeId: e.target.value || undefined
                                  })}
                                  className="flex-1 bg-slate-600 text-white text-[10px] px-1 py-1 rounded"
                                >
                                  <option value="">Continue to...</option>
                                  {allNodes.filter(n => n.id !== node.id).map(n => (
                                    <option key={n.id} value={n.id}>
                                      {n.npcText.substring(0, 30)}...
                                    </option>
                                  ))}
                                </select>
                                <button
                                  onClick={() => handleLinkToNewNode(option.id)}
                                  className="px-2 py-1 bg-blue-600/50 hover:bg-blue-600 text-white text-[10px] rounded"
                                >
                                  + New
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const DialogEditor: React.FC<DialogEditorProps> = ({
  dialogTree,
  onChange,
  availableItems = [],
  availableObjectives = []
}) => {
  const [tree, setTree] = useState<DialogTree>(() =>
    dialogTree || createEmptyDialogTree()
  );
  const [previewMode, setPreviewMode] = useState(false);
  const [previewNodeId, setPreviewNodeId] = useState<string | null>(null);

  // Sync external changes
  React.useEffect(() => {
    if (dialogTree) {
      setTree(dialogTree);
    }
  }, [dialogTree]);

  // Update parent when tree changes
  const updateTree = useCallback((newTree: DialogTree) => {
    setTree(newTree);
    onChange(newTree);
  }, [onChange]);

  const addNode = useCallback((afterOptionId?: string): string => {
    const newNode: DialogNode = {
      id: generateId(),
      npcText: 'New dialog node',
      options: [{ id: generateId(), text: 'Continue', isExit: true }]
    };

    updateTree({
      ...tree,
      nodes: [...tree.nodes, newNode]
    });

    return newNode.id;
  }, [tree, updateTree]);

  const updateNode = useCallback((node: DialogNode) => {
    updateTree({
      ...tree,
      nodes: tree.nodes.map(n => n.id === node.id ? node : n)
    });
  }, [tree, updateTree]);

  const deleteNode = useCallback((nodeId: string) => {
    // Don't delete root node
    const node = tree.nodes.find(n => n.id === nodeId);
    if (node?.isRoot) return;

    // Remove references to this node
    const updatedNodes = tree.nodes
      .filter(n => n.id !== nodeId)
      .map(n => ({
        ...n,
        options: n.options.map(opt =>
          opt.nextNodeId === nodeId
            ? { ...opt, nextNodeId: undefined, isExit: true }
            : opt
        )
      }));

    updateTree({
      ...tree,
      nodes: updatedNodes
    });
  }, [tree, updateTree]);

  const startPreview = useCallback(() => {
    setPreviewNodeId(tree.rootNodeId);
    setPreviewMode(true);
  }, [tree.rootNodeId]);

  const renderPreview = () => {
    const currentNode = tree.nodes.find(n => n.id === previewNodeId);
    if (!currentNode) {
      return (
        <div className="text-center p-8">
          <p className="text-slate-400">Conversation ended.</p>
          <button
            onClick={() => setPreviewMode(false)}
            className="mt-4 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded"
          >
            Exit Preview
          </button>
        </div>
      );
    }

    return (
      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-amber-400 font-medium">Dialog Preview</h3>
          <button
            onClick={() => setPreviewMode(false)}
            className="text-xs bg-slate-600 hover:bg-slate-500 text-white px-3 py-1 rounded"
          >
            Exit Preview
          </button>
        </div>

        {/* NPC Speech */}
        <div className="p-4 bg-slate-700 rounded-lg">
          <div className="text-[10px] text-cyan-400 uppercase mb-1">NPC</div>
          <p className="text-white">{currentNode.npcText}</p>
        </div>

        {/* Player Options */}
        <div className="space-y-2">
          {currentNode.options.map(option => (
            <button
              key={option.id}
              onClick={() => {
                if (option.isExit) {
                  setPreviewNodeId(null);
                } else if (option.nextNodeId) {
                  setPreviewNodeId(option.nextNodeId);
                } else {
                  setPreviewNodeId(null);
                }
              }}
              className="w-full p-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-amber-500 rounded-lg text-left transition-colors"
            >
              <span className="text-amber-200">{option.text}</span>
              {option.condition && option.condition.type !== 'none' && (
                <span className="ml-2 text-[10px] text-amber-400">[conditional]</span>
              )}
              {option.effects && option.effects.length > 0 && (
                <span className="ml-2 text-[10px] text-green-400">[{option.effects.length} effect(s)]</span>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-600">
        <div className="flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-cyan-400" />
          <input
            type="text"
            value={tree.name}
            onChange={(e) => updateTree({ ...tree, name: e.target.value })}
            className="bg-transparent text-white font-medium border-none focus:outline-none focus:ring-1 focus:ring-cyan-500 rounded px-1"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={startPreview}
            className="text-xs bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded flex items-center gap-1"
          >
            <Eye className="w-3 h-3" />
            Preview
          </button>
          <button
            onClick={() => addNode()}
            className="text-xs bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            Add Node
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {previewMode ? (
          renderPreview()
        ) : (
          <div className="space-y-3">
            {/* Sort nodes: root first, then others */}
            {[...tree.nodes]
              .sort((a, b) => {
                if (a.isRoot) return -1;
                if (b.isRoot) return 1;
                return 0;
              })
              .map(node => (
                <DialogNodeEditor
                  key={node.id}
                  node={node}
                  allNodes={tree.nodes}
                  onUpdate={updateNode}
                  onDelete={() => deleteNode(node.id)}
                  onAddNode={addNode}
                  availableItems={availableItems}
                  availableObjectives={availableObjectives}
                />
              ))}

            {tree.nodes.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No dialog nodes yet.</p>
                <button
                  onClick={() => {
                    const rootNode: DialogNode = {
                      id: generateId(),
                      npcText: 'Hello, traveler.',
                      options: [{ id: generateId(), text: 'Hello.', isExit: true }],
                      isRoot: true
                    };
                    updateTree({
                      ...tree,
                      nodes: [rootNode],
                      rootNodeId: rootNode.id
                    });
                  }}
                  className="mt-2 text-xs bg-cyan-600/50 hover:bg-cyan-600 text-white px-3 py-1.5 rounded"
                >
                  Create Root Node
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DialogEditor;
