/**
 * ITEM PALETTE
 *
 * Panel for placing quest items on tiles.
 * Includes keys, clues, artifacts, and collectibles.
 */

import React, { useState } from 'react';
import { Key, Scroll, Star, Gem, Package, Plus, X, ChevronDown, ChevronRight, Edit2 } from 'lucide-react';
import { Item } from '../../types';

// ============================================================================
// QUEST ITEM TEMPLATES
// ============================================================================

export interface QuestItemTemplate {
  id: string;
  name: string;
  type: Item['type'];
  questItemType: 'key' | 'clue' | 'collectible' | 'artifact' | 'component';
  icon: React.ReactNode;
  description: string;
  defaultKeyId?: string;
}

const QUEST_ITEM_TEMPLATES: QuestItemTemplate[] = [
  // Keys
  { id: 'brass_key', name: 'Brass Key', type: 'key', questItemType: 'key', icon: <Key className="w-3 h-3" />, description: 'Opens a specific door', defaultKeyId: 'key_brass' },
  { id: 'iron_key', name: 'Iron Key', type: 'key', questItemType: 'key', icon: <Key className="w-3 h-3" />, description: 'Heavy iron key', defaultKeyId: 'key_iron' },
  { id: 'silver_key', name: 'Silver Key', type: 'key', questItemType: 'key', icon: <Key className="w-3 h-3" />, description: 'Ornate silver key', defaultKeyId: 'key_silver' },
  { id: 'skeleton_key', name: 'Skeleton Key', type: 'key', questItemType: 'key', icon: <Key className="w-3 h-3" />, description: 'Opens many locks', defaultKeyId: 'key_skeleton' },

  // Clues
  { id: 'journal_page', name: 'Journal Page', type: 'clue', questItemType: 'clue', icon: <Scroll className="w-3 h-3" />, description: 'Torn page with important info' },
  { id: 'photograph', name: 'Old Photograph', type: 'clue', questItemType: 'clue', icon: <Scroll className="w-3 h-3" />, description: 'Faded photograph' },
  { id: 'letter', name: 'Cryptic Letter', type: 'clue', questItemType: 'clue', icon: <Scroll className="w-3 h-3" />, description: 'Letter with hidden meaning' },
  { id: 'map_fragment', name: 'Map Fragment', type: 'clue', questItemType: 'clue', icon: <Scroll className="w-3 h-3" />, description: 'Piece of an old map' },
  { id: 'ritual_notes', name: 'Ritual Notes', type: 'clue', questItemType: 'clue', icon: <Scroll className="w-3 h-3" />, description: 'Notes on dark rituals' },

  // Collectibles
  { id: 'ancient_coin', name: 'Ancient Coin', type: 'quest_item', questItemType: 'collectible', icon: <Gem className="w-3 h-3" />, description: 'Strange coin with symbols' },
  { id: 'bone_fragment', name: 'Bone Fragment', type: 'quest_item', questItemType: 'collectible', icon: <Gem className="w-3 h-3" />, description: 'Piece of ancient bone' },
  { id: 'crystal_shard', name: 'Crystal Shard', type: 'quest_item', questItemType: 'collectible', icon: <Gem className="w-3 h-3" />, description: 'Glowing crystal piece' },
  { id: 'strange_idol', name: 'Strange Idol', type: 'quest_item', questItemType: 'collectible', icon: <Gem className="w-3 h-3" />, description: 'Small carved figurine' },

  // Artifacts
  { id: 'elder_sign', name: 'Elder Sign', type: 'relic', questItemType: 'artifact', icon: <Star className="w-3 h-3" />, description: 'Protective symbol' },
  { id: 'silver_dagger', name: 'Silver Dagger', type: 'relic', questItemType: 'artifact', icon: <Star className="w-3 h-3" />, description: 'Blessed weapon' },
  { id: 'amulet', name: 'Ancient Amulet', type: 'relic', questItemType: 'artifact', icon: <Star className="w-3 h-3" />, description: 'Mysterious amulet' },
  { id: 'necronomicon_page', name: 'Necronomicon Page', type: 'relic', questItemType: 'artifact', icon: <Star className="w-3 h-3" />, description: 'Page of forbidden knowledge' },

  // Components (for rituals)
  { id: 'black_candle', name: 'Black Candle', type: 'quest_item', questItemType: 'component', icon: <Package className="w-3 h-3" />, description: 'Required for rituals' },
  { id: 'chalk', name: 'Ritual Chalk', type: 'quest_item', questItemType: 'component', icon: <Package className="w-3 h-3" />, description: 'For drawing circles' },
  { id: 'incense', name: 'Incense', type: 'quest_item', questItemType: 'component', icon: <Package className="w-3 h-3" />, description: 'Aromatic herbs' },
  { id: 'blood_vial', name: 'Blood Vial', type: 'quest_item', questItemType: 'component', icon: <Package className="w-3 h-3" />, description: 'Contains strange blood' },
];

const CATEGORY_ICONS = {
  key: <Key className="w-3 h-3" />,
  clue: <Scroll className="w-3 h-3" />,
  collectible: <Gem className="w-3 h-3" />,
  artifact: <Star className="w-3 h-3" />,
  component: <Package className="w-3 h-3" />,
};

const CATEGORY_COLORS = {
  key: '#f59e0b',
  clue: '#3b82f6',
  collectible: '#22c55e',
  artifact: '#a855f7',
  component: '#6b7280',
};

const CATEGORY_LABELS = {
  key: 'Keys',
  clue: 'Clues',
  collectible: 'Collectibles',
  artifact: 'Artifacts',
  component: 'Components',
};

// ============================================================================
// COMPONENT
// ============================================================================

export interface QuestItemPlacement extends Item {
  customName?: string;
  customDescription?: string;
}

interface ItemPaletteProps {
  items: QuestItemPlacement[];
  onItemsChange: (items: QuestItemPlacement[]) => void;
}

const ItemPalette: React.FC<ItemPaletteProps> = ({ items, onItemsChange }) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['key', 'clue'])
  );
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [customName, setCustomName] = useState('');
  const [customDescription, setCustomDescription] = useState('');

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const addItem = (template: QuestItemTemplate) => {
    const newItem: QuestItemPlacement = {
      id: `${template.id}_${Date.now()}`,
      name: template.name,
      type: template.type,
      description: template.description,
      isQuestItem: true,
      questItemType: template.questItemType,
      keyId: template.defaultKeyId,
    };
    onItemsChange([...items, newItem]);
  };

  const removeItem = (itemId: string) => {
    onItemsChange(items.filter(i => i.id !== itemId));
  };

  const updateItem = (itemId: string, updates: Partial<QuestItemPlacement>) => {
    onItemsChange(items.map(i => i.id === itemId ? { ...i, ...updates } : i));
  };

  const startEditing = (item: QuestItemPlacement) => {
    setEditingItem(item.id);
    setCustomName(item.customName || item.name);
    setCustomDescription(item.customDescription || item.description || '');
  };

  const saveEditing = () => {
    if (editingItem) {
      updateItem(editingItem, {
        customName,
        customDescription,
        name: customName,
        description: customDescription,
      });
      setEditingItem(null);
    }
  };

  const groupedTemplates = QUEST_ITEM_TEMPLATES.reduce((acc, template) => {
    if (!acc[template.questItemType]) {
      acc[template.questItemType] = [];
    }
    acc[template.questItemType].push(template);
    return acc;
  }, {} as Record<string, QuestItemTemplate[]>);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-slate-300 text-sm font-medium flex items-center gap-2">
          <Package className="w-4 h-4" />
          Quest Items
        </h4>
        {items.length > 0 && (
          <span className="text-green-400 text-xs bg-green-400/20 px-2 py-0.5 rounded">
            {items.length} placed
          </span>
        )}
      </div>

      {/* Current items on tile */}
      {items.length > 0 && (
        <div className="bg-slate-700/50 rounded p-2 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs">On this tile:</span>
            <button
              onClick={() => onItemsChange([])}
              className="text-red-400 hover:text-red-300 text-xs"
            >
              Clear
            </button>
          </div>
          {items.map(item => (
            <div
              key={item.id}
              className="bg-slate-600/50 rounded px-2 py-1"
            >
              {editingItem === item.id ? (
                <div className="space-y-1">
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full bg-slate-500 text-white text-xs px-1.5 py-0.5 rounded"
                    placeholder="Item name"
                  />
                  <input
                    type="text"
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    className="w-full bg-slate-500 text-white text-xs px-1.5 py-0.5 rounded"
                    placeholder="Description"
                  />
                  <div className="flex gap-1">
                    <button
                      onClick={saveEditing}
                      className="flex-1 text-xs bg-green-600 hover:bg-green-500 text-white px-2 py-0.5 rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingItem(null)}
                      className="text-xs bg-slate-500 hover:bg-slate-400 text-white px-2 py-0.5 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: CATEGORY_COLORS[item.questItemType || 'component'] }}
                    />
                    <span className="text-white text-xs">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startEditing(item)}
                      className="w-5 h-5 bg-slate-500 hover:bg-blue-600 rounded flex items-center justify-center"
                    >
                      <Edit2 className="w-2.5 h-2.5 text-white" />
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="w-5 h-5 bg-slate-500 hover:bg-red-600 rounded flex items-center justify-center"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Item templates by category */}
      <div className="space-y-1 max-h-64 overflow-y-auto">
        {(['key', 'clue', 'collectible', 'artifact', 'component'] as const).map(category => {
          const categoryTemplates = groupedTemplates[category] || [];
          const isExpanded = expandedCategories.has(category);

          return (
            <div key={category} className="rounded overflow-hidden">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center gap-2 px-2 py-1.5 bg-slate-700/50 hover:bg-slate-700 text-left"
              >
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                )}
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: CATEGORY_COLORS[category] }}
                />
                <span className="text-xs font-medium text-white flex-1">
                  {CATEGORY_LABELS[category]}
                </span>
                <span className="text-xs text-slate-400">{categoryTemplates.length}</span>
              </button>

              {isExpanded && (
                <div className="bg-slate-800/50 p-1 space-y-0.5">
                  {categoryTemplates.map(template => (
                    <div
                      key={template.id}
                      className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-slate-700/50"
                      onClick={() => addItem(template)}
                    >
                      <span style={{ color: CATEGORY_COLORS[category] }}>
                        {template.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-white truncate">
                          {template.name}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {template.description}
                        </div>
                      </div>
                      <Plus className="w-3 h-3 text-slate-400" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Instructions */}
      <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-600">
        Click item to add. Edit to customize name/description.
      </div>
    </div>
  );
};

export default ItemPalette;
