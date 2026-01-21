/**
 * NPC PALETTE
 *
 * Panel for placing NPCs (Non-Player Characters) on tiles.
 * NPC types include:
 * - Survivors: Can be rescued (rescue objectives)
 * - Merchants: Can trade items
 * - Quest Givers: Provide secondary objectives
 * - Contacts: Provide information/clues
 * - Hostile: Initially hostile but can be reasoned with
 */

import React, { useState } from 'react';
import { Users, Plus, Trash2, ChevronDown, ChevronRight, User, ShoppingBag, MessageSquare, AlertTriangle, Heart, GitBranch } from 'lucide-react';
import { DialogTree } from './DialogEditor';

// ============================================================================
// TYPES
// ============================================================================

export type NPCType = 'survivor' | 'merchant' | 'quest_giver' | 'contact' | 'hostile';

export interface NPCPlacement {
  id: string;
  type: NPCType;
  name: string;
  description?: string;
  // Dialogue
  greeting?: string;
  dialogTree?: DialogTree; // Full conversation tree
  hasComplexDialog?: boolean; // If true, use dialogTree instead of greeting
  // For merchants
  inventory?: { itemId: string; itemName: string; price?: number }[];
  // For quest givers
  questId?: string;
  questDescription?: string;
  // For survivors
  rescueObjectiveId?: string;
  isRescued?: boolean;
  // For contacts
  clueText?: string;
  insightReward?: number;
  // For hostile
  canBeReasonedWith?: boolean;
  reasoningDC?: number; // DC for persuasion check
  // Visual
  portrait?: string;
  // State
  isHidden?: boolean;
  revealedBy?: string; // Objective or trigger ID that reveals this NPC
}

// ============================================================================
// CONSTANTS
// ============================================================================

const NPC_TYPE_INFO: Record<NPCType, {
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
}> = {
  survivor: {
    label: 'Survivor',
    description: 'A person to rescue',
    icon: Heart,
    color: 'text-pink-400',
  },
  merchant: {
    label: 'Merchant',
    description: 'Sells items for gold',
    icon: ShoppingBag,
    color: 'text-yellow-400',
  },
  quest_giver: {
    label: 'Quest Giver',
    description: 'Provides secondary objectives',
    icon: MessageSquare,
    color: 'text-blue-400',
  },
  contact: {
    label: 'Contact',
    description: 'Provides information and clues',
    icon: User,
    color: 'text-green-400',
  },
  hostile: {
    label: 'Hostile NPC',
    description: 'Can be fought or reasoned with',
    icon: AlertTriangle,
    color: 'text-red-400',
  },
};

const NPC_NAME_SUGGESTIONS: Record<NPCType, string[]> = {
  survivor: ['Frightened Scholar', 'Lost Child', 'Injured Worker', 'Trapped Nurse', 'Hiding Witness'],
  merchant: ['Shady Dealer', 'Antique Collector', 'Arms Dealer', 'Traveling Peddler', 'Black Market Contact'],
  quest_giver: ['Desperate Father', 'Paranoid Professor', 'Grieving Widow', 'Suspicious Detective', 'Worried Mayor'],
  contact: ['Informant', 'Old Librarian', 'Street Urchin', 'Bartender', 'Occult Expert'],
  hostile: ['Cult Leader', 'Possessed Villager', 'Mad Scientist', 'Corrupted Priest', 'Deep One Hybrid'],
};

const PORTRAIT_OPTIONS = [
  'detective', 'professor', 'veteran', 'journalist', 'doctor', 'occultist',
  'cultist', 'scholar', 'worker', 'child', 'priest', 'merchant', 'stranger',
];

// ============================================================================
// COMPONENT
// ============================================================================

interface NPCPaletteProps {
  npcs: NPCPlacement[];
  onNPCsChange: (npcs: NPCPlacement[]) => void;
  onEditDialog?: (npc: NPCPlacement) => void;
}

const NPCPalette: React.FC<NPCPaletteProps> = ({ npcs, onNPCsChange, onEditDialog }) => {
  const [expandedNPCs, setExpandedNPCs] = useState<Set<string>>(new Set());
  const [showAddForm, setShowAddForm] = useState(false);
  const [newNPCType, setNewNPCType] = useState<NPCType>('survivor');

  const toggleNPC = (id: string) => {
    setExpandedNPCs(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const addNPC = () => {
    const typeInfo = NPC_TYPE_INFO[newNPCType];
    const nameSuggestions = NPC_NAME_SUGGESTIONS[newNPCType];
    const randomName = nameSuggestions[Math.floor(Math.random() * nameSuggestions.length)];

    const newNPC: NPCPlacement = {
      id: `npc_${Date.now()}`,
      type: newNPCType,
      name: randomName,
      greeting: `A ${typeInfo.label.toLowerCase()} awaits...`,
      ...(newNPCType === 'merchant' && { inventory: [] }),
      ...(newNPCType === 'contact' && { insightReward: 1 }),
      ...(newNPCType === 'hostile' && { canBeReasonedWith: true, reasoningDC: 4 }),
    };

    onNPCsChange([...npcs, newNPC]);
    setExpandedNPCs(prev => new Set(prev).add(newNPC.id));
    setShowAddForm(false);
  };

  const removeNPC = (id: string) => {
    onNPCsChange(npcs.filter(n => n.id !== id));
  };

  const updateNPC = (id: string, updates: Partial<NPCPlacement>) => {
    onNPCsChange(npcs.map(n => n.id === id ? { ...n, ...updates } : n));
  };

  const addMerchantItem = (npcId: string) => {
    const npc = npcs.find(n => n.id === npcId);
    if (!npc) return;

    const newItem = { itemId: `item_${Date.now()}`, itemName: 'New Item', price: 100 };
    updateNPC(npcId, {
      inventory: [...(npc.inventory || []), newItem],
    });
  };

  const removeMerchantItem = (npcId: string, itemIndex: number) => {
    const npc = npcs.find(n => n.id === npcId);
    if (!npc) return;

    const newInventory = (npc.inventory || []).filter((_, i) => i !== itemIndex);
    updateNPC(npcId, { inventory: newInventory });
  };

  const updateMerchantItem = (
    npcId: string,
    itemIndex: number,
    updates: Partial<{ itemId: string; itemName: string; price: number }>
  ) => {
    const npc = npcs.find(n => n.id === npcId);
    if (!npc) return;

    const newInventory = (npc.inventory || []).map((item, i) =>
      i === itemIndex ? { ...item, ...updates } : item
    );
    updateNPC(npcId, { inventory: newInventory });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-slate-300 text-sm font-medium flex items-center gap-2">
          <Users className="w-4 h-4 text-cyan-400" />
          NPCs on this Tile
        </h4>
        <span className="text-slate-500 text-xs">{npcs.length} NPC{npcs.length !== 1 ? 's' : ''}</span>
      </div>

      {/* NPC list */}
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {npcs.map((npc) => {
          const typeInfo = NPC_TYPE_INFO[npc.type];
          const TypeIcon = typeInfo.icon;
          const isExpanded = expandedNPCs.has(npc.id);

          return (
            <div
              key={npc.id}
              className={`rounded border ${
                npc.isHidden
                  ? 'border-slate-600 bg-slate-700/30 opacity-60'
                  : 'border-cyan-600/50 bg-cyan-900/20'
              }`}
            >
              {/* Header */}
              <div
                className="flex items-center gap-2 px-2 py-1.5 cursor-pointer"
                onClick={() => toggleNPC(npc.id)}
              >
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                )}
                <TypeIcon className={`w-3 h-3 ${typeInfo.color} shrink-0`} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-white truncate">{npc.name}</div>
                  <div className="text-[10px] text-slate-400">{typeInfo.label}</div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeNPC(npc.id);
                  }}
                  className="w-5 h-5 bg-slate-600 hover:bg-red-600 rounded flex items-center justify-center shrink-0"
                >
                  <Trash2 className="w-3 h-3 text-white" />
                </button>
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <div className="px-2 pb-2 space-y-2 border-t border-slate-600/50 pt-2">
                  {/* Name */}
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Name</label>
                    <input
                      type="text"
                      value={npc.name}
                      onChange={(e) => updateNPC(npc.id, { name: e.target.value })}
                      className="w-full bg-slate-600 text-white text-xs px-2 py-1 rounded border border-slate-500"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Description</label>
                    <textarea
                      value={npc.description || ''}
                      onChange={(e) => updateNPC(npc.id, { description: e.target.value })}
                      className="w-full bg-slate-600 text-white text-xs px-2 py-1 rounded border border-slate-500 h-12 resize-none"
                      placeholder="Visual description of the NPC..."
                    />
                  </div>

                  {/* Greeting / Dialog */}
                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="text-[10px] text-slate-400">Dialogue</label>
                      <label className="flex items-center gap-1 text-[10px] text-slate-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={npc.hasComplexDialog ?? false}
                          onChange={(e) => updateNPC(npc.id, { hasComplexDialog: e.target.checked })}
                          className="accent-cyan-500 w-3 h-3"
                        />
                        Complex Dialog
                      </label>
                    </div>
                    {!npc.hasComplexDialog ? (
                      <textarea
                        value={npc.greeting || ''}
                        onChange={(e) => updateNPC(npc.id, { greeting: e.target.value })}
                        className="w-full bg-slate-600 text-white text-xs px-2 py-1 rounded border border-slate-500 h-12 resize-none"
                        placeholder="What they say when approached..."
                      />
                    ) : (
                      <div className="space-y-1">
                        <button
                          onClick={() => onEditDialog?.(npc)}
                          className="w-full flex items-center justify-center gap-1 text-xs bg-cyan-700/50 hover:bg-cyan-600 text-white px-2 py-2 rounded border border-cyan-600"
                        >
                          <GitBranch className="w-3 h-3" />
                          Edit Conversation Tree
                        </button>
                        {npc.dialogTree && (
                          <div className="text-[10px] text-cyan-400 text-center">
                            {npc.dialogTree.nodes.length} dialog node(s)
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Portrait */}
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Portrait</label>
                    <select
                      value={npc.portrait || ''}
                      onChange={(e) => updateNPC(npc.id, { portrait: e.target.value || undefined })}
                      className="w-full bg-slate-600 text-white text-xs px-2 py-1 rounded border border-slate-500"
                    >
                      <option value="">Default</option>
                      {PORTRAIT_OPTIONS.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  {/* Type-specific fields */}

                  {/* Survivor */}
                  {npc.type === 'survivor' && (
                    <div className="bg-pink-900/20 rounded p-2 space-y-2">
                      <div className="text-[10px] text-pink-400 uppercase">Rescue Settings</div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Rescue Objective ID</label>
                        <input
                          type="text"
                          value={npc.rescueObjectiveId || ''}
                          onChange={(e) => updateNPC(npc.id, { rescueObjectiveId: e.target.value })}
                          className="w-full bg-slate-700 text-white text-xs px-2 py-1 rounded border border-slate-500"
                          placeholder="Links to a rescue objective"
                        />
                      </div>
                    </div>
                  )}

                  {/* Merchant */}
                  {npc.type === 'merchant' && (
                    <div className="bg-yellow-900/20 rounded p-2 space-y-2">
                      <div className="text-[10px] text-yellow-400 uppercase">Inventory</div>
                      {(npc.inventory || []).map((item, i) => (
                        <div key={i} className="flex gap-1 items-center">
                          <input
                            type="text"
                            value={item.itemId}
                            onChange={(e) => updateMerchantItem(npc.id, i, { itemId: e.target.value })}
                            className="flex-1 bg-slate-700 text-white text-[10px] px-1 py-0.5 rounded"
                            placeholder="Item ID"
                          />
                          <input
                            type="text"
                            value={item.itemName}
                            onChange={(e) => updateMerchantItem(npc.id, i, { itemName: e.target.value })}
                            className="flex-1 bg-slate-700 text-white text-[10px] px-1 py-0.5 rounded"
                            placeholder="Name"
                          />
                          <input
                            type="number"
                            value={item.price ?? 100}
                            onChange={(e) => updateMerchantItem(npc.id, i, { price: parseInt(e.target.value) })}
                            className="w-16 bg-slate-700 text-white text-[10px] px-1 py-0.5 rounded"
                            placeholder="$"
                          />
                          <button
                            onClick={() => removeMerchantItem(npc.id, i)}
                            className="w-4 h-4 bg-red-600/50 hover:bg-red-600 rounded flex items-center justify-center"
                          >
                            <Trash2 className="w-2.5 h-2.5 text-white" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addMerchantItem(npc.id)}
                        className="text-[10px] bg-yellow-700/50 hover:bg-yellow-600 text-white px-2 py-0.5 rounded w-full"
                      >
                        + Add Item
                      </button>
                    </div>
                  )}

                  {/* Quest Giver */}
                  {npc.type === 'quest_giver' && (
                    <div className="bg-blue-900/20 rounded p-2 space-y-2">
                      <div className="text-[10px] text-blue-400 uppercase">Quest Settings</div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Quest ID</label>
                        <input
                          type="text"
                          value={npc.questId || ''}
                          onChange={(e) => updateNPC(npc.id, { questId: e.target.value })}
                          className="w-full bg-slate-700 text-white text-xs px-2 py-1 rounded border border-slate-500"
                          placeholder="Links to an objective"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Quest Description</label>
                        <textarea
                          value={npc.questDescription || ''}
                          onChange={(e) => updateNPC(npc.id, { questDescription: e.target.value })}
                          className="w-full bg-slate-700 text-white text-xs px-2 py-1 rounded border border-slate-500 h-12 resize-none"
                          placeholder="What quest they give..."
                        />
                      </div>
                    </div>
                  )}

                  {/* Contact */}
                  {npc.type === 'contact' && (
                    <div className="bg-green-900/20 rounded p-2 space-y-2">
                      <div className="text-[10px] text-green-400 uppercase">Information</div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Clue Text</label>
                        <textarea
                          value={npc.clueText || ''}
                          onChange={(e) => updateNPC(npc.id, { clueText: e.target.value })}
                          className="w-full bg-slate-700 text-white text-xs px-2 py-1 rounded border border-slate-500 h-16 resize-none"
                          placeholder="Information they provide..."
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Insight Reward</label>
                        <input
                          type="number"
                          value={npc.insightReward ?? 1}
                          onChange={(e) => updateNPC(npc.id, { insightReward: parseInt(e.target.value) })}
                          className="w-full bg-slate-700 text-white text-xs px-2 py-1 rounded border border-slate-500"
                          min={0}
                        />
                      </div>
                    </div>
                  )}

                  {/* Hostile */}
                  {npc.type === 'hostile' && (
                    <div className="bg-red-900/20 rounded p-2 space-y-2">
                      <div className="text-[10px] text-red-400 uppercase">Hostile Settings</div>
                      <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
                        <input
                          type="checkbox"
                          checked={npc.canBeReasonedWith ?? false}
                          onChange={(e) => updateNPC(npc.id, { canBeReasonedWith: e.target.checked })}
                          className="accent-red-500"
                        />
                        Can Be Reasoned With
                      </label>
                      {npc.canBeReasonedWith && (
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">Persuasion DC</label>
                          <input
                            type="number"
                            value={npc.reasoningDC ?? 4}
                            onChange={(e) => updateNPC(npc.id, { reasoningDC: parseInt(e.target.value) })}
                            className="w-full bg-slate-700 text-white text-xs px-2 py-1 rounded border border-slate-500"
                            min={3}
                            max={6}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Visibility flags */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-600">
                    <label className="flex items-center gap-1 text-xs text-white cursor-pointer">
                      <input
                        type="checkbox"
                        checked={npc.isHidden ?? false}
                        onChange={(e) => updateNPC(npc.id, { isHidden: e.target.checked })}
                        className="accent-slate-500"
                      />
                      Hidden
                    </label>
                  </div>
                  {npc.isHidden && (
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Revealed By (ID)</label>
                      <input
                        type="text"
                        value={npc.revealedBy || ''}
                        onChange={(e) => updateNPC(npc.id, { revealedBy: e.target.value || undefined })}
                        className="w-full bg-slate-600 text-white text-xs px-2 py-1 rounded border border-slate-500"
                        placeholder="Objective or trigger ID"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {npcs.length === 0 && !showAddForm && (
          <div className="text-center text-slate-500 text-xs py-4">
            No NPCs on this tile. Add one to create interactions.
          </div>
        )}
      </div>

      {/* Add form */}
      {showAddForm ? (
        <div className="bg-slate-700/50 rounded p-2 space-y-2">
          <div>
            <label className="text-[10px] text-slate-400 block mb-0.5">NPC Type</label>
            <select
              value={newNPCType}
              onChange={(e) => setNewNPCType(e.target.value as NPCType)}
              className="w-full bg-slate-600 text-white text-xs px-2 py-1 rounded border border-slate-500"
            >
              {Object.entries(NPC_TYPE_INFO).map(([type, info]) => (
                <option key={type} value={type}>
                  {info.label} - {info.description}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-1">
            <button
              onClick={addNPC}
              className="flex-1 text-xs bg-cyan-600 hover:bg-cyan-500 text-white px-2 py-1 rounded"
            >
              Add NPC
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
          Add NPC
        </button>
      )}

      {/* Quick templates */}
      <div className="pt-2 border-t border-slate-600">
        <div className="text-[10px] text-slate-400 mb-1">Quick Add:</div>
        <div className="flex flex-wrap gap-1">
          {Object.entries(NPC_TYPE_INFO).map(([type, info]) => {
            const Icon = info.icon;
            return (
              <button
                key={type}
                onClick={() => {
                  setNewNPCType(type as NPCType);
                  setTimeout(addNPC, 0);
                }}
                className={`text-[10px] bg-slate-600 hover:bg-slate-500 text-white px-2 py-0.5 rounded flex items-center gap-1`}
              >
                <Icon className={`w-2.5 h-2.5 ${info.color}`} />
                {info.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default NPCPalette;
