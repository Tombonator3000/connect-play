/**
 * EquipmentStashPanel - Shared storage for items between scenarios
 *
 * Features:
 * - View all items in stash
 * - Transfer items to/from heroes
 * - Sort and filter items
 * - View item details
 */

import React, { useState, useMemo } from 'react';
import {
  EquipmentStash,
  LegacyHero,
  Item,
  InventorySlots,
  equipItem,
  getAllItems,
  findAvailableSlot,
  countInventoryItems
} from '../types';
import {
  addItemToStash,
  removeItemFromStash,
  getAllEquippedItems,
  isStashFull
} from '../utils/legacyManager';
import {
  Sword, Search, Shield, Cross, Zap, Key, FileText, Package,
  SortAsc, Filter, X, ArrowRight, ArrowLeft, Sparkles
} from 'lucide-react';

interface EquipmentStashPanelProps {
  stash: EquipmentStash;
  heroes: LegacyHero[];
  onStashUpdate: (stash: EquipmentStash) => void;
  onHeroUpdate: (hero: LegacyHero) => void;
  onClose: () => void;
}

type SortOption = 'name' | 'type' | 'recent';
type FilterOption = 'all' | 'weapon' | 'tool' | 'armor' | 'consumable' | 'relic' | 'key' | 'clue';

// Filter button configuration
const FILTER_BUTTONS: { value: FilterOption; label: string; icon: React.ReactNode; color: string }[] = [
  { value: 'all', label: 'All', icon: <Package size={14} />, color: 'bg-stone-600 hover:bg-stone-500 text-stone-200' },
  { value: 'weapon', label: 'Weapons', icon: <Sword size={14} />, color: 'bg-red-900/50 hover:bg-red-800/50 text-red-300' },
  { value: 'tool', label: 'Tools', icon: <Search size={14} />, color: 'bg-blue-900/50 hover:bg-blue-800/50 text-blue-300' },
  { value: 'armor', label: 'Armor', icon: <Shield size={14} />, color: 'bg-amber-900/50 hover:bg-amber-800/50 text-amber-300' },
  { value: 'consumable', label: 'Consumables', icon: <Cross size={14} />, color: 'bg-green-900/50 hover:bg-green-800/50 text-green-300' },
  { value: 'relic', label: 'Relics', icon: <Zap size={14} />, color: 'bg-purple-900/50 hover:bg-purple-800/50 text-purple-300' },
  { value: 'key', label: 'Keys', icon: <Key size={14} />, color: 'bg-yellow-900/50 hover:bg-yellow-800/50 text-yellow-300' },
  { value: 'clue', label: 'Clues', icon: <FileText size={14} />, color: 'bg-cyan-900/50 hover:bg-cyan-800/50 text-cyan-300' },
];

export const EquipmentStashPanel: React.FC<EquipmentStashPanelProps> = ({
  stash,
  heroes,
  onStashUpdate,
  onHeroUpdate,
  onClose
}) => {
  const [selectedStashIndex, setSelectedStashIndex] = useState<number | null>(null);
  const [selectedHeroId, setSelectedHeroId] = useState<string | null>(null);
  const [selectedHeroItemIndex, setSelectedHeroItemIndex] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');

  const selectedHero = useMemo(
    () => heroes.find(h => h.id === selectedHeroId),
    [heroes, selectedHeroId]
  );

  // Count items by type for filter badges
  const itemCounts = useMemo(() => {
    const counts: Record<string, number> = { all: stash.items.length };
    stash.items.forEach(item => {
      counts[item.type] = (counts[item.type] || 0) + 1;
    });
    return counts;
  }, [stash.items]);

  const filteredStashItems = useMemo(() => {
    let items = stash.items.map((item, index) => ({ item, originalIndex: index }));

    // Filter
    if (filterBy !== 'all') {
      items = items.filter(({ item }) => item.type === filterBy);
    }

    // Sort
    switch (sortBy) {
      case 'name':
        items.sort((a, b) => a.item.name.localeCompare(b.item.name));
        break;
      case 'type':
        items.sort((a, b) => a.item.type.localeCompare(b.item.type));
        break;
      case 'recent':
      default:
        // Keep original order (most recent last)
        break;
    }

    return items;
  }, [stash.items, sortBy, filterBy]);

  const getItemTypeColor = (type: Item['type']): string => {
    switch (type) {
      case 'weapon': return 'text-red-400 bg-red-900/30 border-red-700';
      case 'tool': return 'text-blue-400 bg-blue-900/30 border-blue-700';
      case 'armor': return 'text-amber-400 bg-amber-900/30 border-amber-700';
      case 'consumable': return 'text-green-400 bg-green-900/30 border-green-700';
      case 'relic': return 'text-purple-400 bg-purple-900/30 border-purple-700';
      case 'key': return 'text-yellow-400 bg-yellow-900/30 border-yellow-700';
      case 'clue': return 'text-cyan-400 bg-cyan-900/30 border-cyan-700';
      default: return 'text-stone-400 bg-stone-900/30 border-stone-700';
    }
  };

  const handleTransferToHero = () => {
    if (selectedStashIndex === null || !selectedHero) return;

    const heroItemCount = countInventoryItems(selectedHero.equipment);
    if (heroItemCount >= 7) {
      alert('Hero inventory is full!');
      return;
    }

    const { stash: newStash, item } = removeItemFromStash(stash, selectedStashIndex);
    if (!item) return;

    const slot = findAvailableSlot(selectedHero.equipment, item);
    if (!slot) {
      alert('No suitable slot available!');
      return;
    }

    const { success, newInventory } = equipItem(selectedHero.equipment, item, slot);
    if (!success) {
      alert('Failed to equip item!');
      return;
    }

    onStashUpdate(newStash);
    onHeroUpdate({ ...selectedHero, equipment: newInventory });
    setSelectedStashIndex(null);
  };

  const handleTransferToStash = () => {
    if (selectedHeroItemIndex === null || !selectedHero) return;

    if (isStashFull(stash)) {
      alert('Stash is full!');
      return;
    }

    const heroItems = getAllEquippedItems(selectedHero.equipment);
    const item = heroItems[selectedHeroItemIndex];
    if (!item) return;

    // Find and remove item from hero's equipment
    const newEquipment: InventorySlots = { ...selectedHero.equipment, bag: [...selectedHero.equipment.bag] };

    if (newEquipment.leftHand?.id === item.id) {
      newEquipment.leftHand = null;
    } else if (newEquipment.rightHand?.id === item.id) {
      newEquipment.rightHand = null;
    } else if (newEquipment.body?.id === item.id) {
      newEquipment.body = null;
    } else {
      const bagIndex = newEquipment.bag.findIndex(i => i?.id === item.id);
      if (bagIndex !== -1) {
        newEquipment.bag[bagIndex] = null;
      }
    }

    const newStash = addItemToStash(stash, item);
    if (!newStash) {
      alert('Failed to add item to stash!');
      return;
    }

    onStashUpdate(newStash);
    onHeroUpdate({ ...selectedHero, equipment: newEquipment });
    setSelectedHeroItemIndex(null);
  };

  const renderItemCard = (item: Item, isSelected: boolean, onClick: () => void) => {
    // Check if this is a quest item (shouldn't be in stash normally)
    const isQuestItem = item.type === 'quest_item' || item.questItemType;

    return (
      <div
        className={`
          p-3 rounded-lg border-2 cursor-pointer transition-all relative
          ${isSelected ? 'border-amber-500 ring-2 ring-amber-500/50 scale-[1.02]' : 'border-stone-600 hover:border-stone-500 hover:scale-[1.01]'}
          ${getItemTypeColor(item.type)}
          ${isQuestItem ? 'opacity-60' : ''}
        `}
        onClick={onClick}
      >
        {/* Quest item warning */}
        {isQuestItem && (
          <div className="absolute -top-2 -right-2 bg-yellow-600 text-yellow-100 text-[9px] px-1.5 py-0.5 rounded-full font-bold">
            QUEST
          </div>
        )}

        <div className="flex justify-between items-start mb-1">
          <span className="font-medium text-sm">{item.name}</span>
          <span className="text-xs uppercase opacity-70">{item.type}</span>
        </div>
        <p className="text-xs opacity-80 line-clamp-2">{item.effect}</p>

        {/* Stats row */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {item.attackDice !== undefined && (
            <span className="flex items-center gap-1 text-[10px] bg-red-500/30 text-red-300 px-1.5 py-0.5 rounded">
              <Sword size={10} /> {item.attackDice}
            </span>
          )}
          {item.defenseDice !== undefined && (
            <span className="flex items-center gap-1 text-[10px] bg-blue-500/30 text-blue-300 px-1.5 py-0.5 rounded">
              <Shield size={10} /> +{item.defenseDice}
            </span>
          )}
          {item.range !== undefined && (
            <span className="text-[10px] bg-cyan-500/30 text-cyan-300 px-1.5 py-0.5 rounded">
              R:{item.range}
            </span>
          )}
          {item.uses !== undefined && (
            <span className="text-[10px] bg-green-500/30 text-green-300 px-1.5 py-0.5 rounded">
              {item.uses}/{item.maxUses || item.uses}
            </span>
          )}
        </div>
      </div>
    );
  };

  const renderHeroEquipment = (hero: LegacyHero) => {
    const items = getAllEquippedItems(hero.equipment);
    const isSelected = selectedHeroId === hero.id;

    return (
      <div
        key={hero.id}
        className={`
          p-4 rounded-lg border-2 transition-all cursor-pointer
          ${isSelected ? 'border-amber-500 bg-amber-900/20' : 'border-stone-600 bg-stone-800/50 hover:border-stone-500'}
        `}
        onClick={() => {
          setSelectedHeroId(isSelected ? null : hero.id);
          setSelectedHeroItemIndex(null);
        }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-stone-700 flex items-center justify-center">
            <span className="text-lg">
              {hero.characterClass === 'detective' && '🔍'}
              {hero.characterClass === 'professor' && '📚'}
              {hero.characterClass === 'veteran' && '⚔️'}
              {hero.characterClass === 'occultist' && '🔮'}
              {hero.characterClass === 'journalist' && '📰'}
              {hero.characterClass === 'doctor' && '💉'}
            </span>
          </div>
          <div>
            <h3 className="font-bold text-amber-200">{hero.name}</h3>
            <p className="text-xs text-stone-400">Items: {items.length}/7</p>
          </div>
        </div>

        {isSelected && (
          <div className="space-y-2">
            {items.length > 0 ? (
              items.map((item, index) => (
                <div
                  key={index}
                  className={`
                    p-2 rounded border cursor-pointer transition-all
                    ${selectedHeroItemIndex === index
                      ? 'border-amber-500 bg-amber-900/30'
                      : 'border-stone-600 bg-stone-700/50 hover:border-stone-500'
                    }
                  `}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedHeroItemIndex(selectedHeroItemIndex === index ? null : index);
                  }}
                >
                  <div className="text-sm text-amber-200">{item.name}</div>
                  <div className="text-xs text-stone-400">{item.effect}</div>
                </div>
              ))
            ) : (
              <p className="text-sm text-stone-500 text-center py-2">No items</p>
            )}

            {selectedHeroItemIndex !== null && (
              <button
                className="w-full py-2 mt-2 bg-amber-700 hover:bg-amber-600 text-amber-100 rounded transition-colors text-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleTransferToStash();
                }}
              >
                Transfer to Stash
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-stone-900 border-2 border-stone-700 rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-stone-700 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-amber-200">Equipment Stash</h2>
            <p className="text-sm text-stone-400">
              {stash.items.length}/{stash.maxCapacity} items stored
            </p>
          </div>
          <button
            className="p-2 bg-stone-700 hover:bg-stone-600 rounded-lg transition-colors"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Stash section */}
          <div className="flex-1 p-4 border-r border-stone-700 overflow-y-auto">
            {/* Header with sort */}
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-bold text-stone-300 flex items-center gap-2">
                <Package size={18} />
                Stored Items
              </h3>
              <div className="flex items-center gap-2">
                <SortAsc size={14} className="text-stone-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="px-2 py-1 bg-stone-700 border border-stone-600 rounded text-sm cursor-pointer hover:bg-stone-600 transition-colors"
                >
                  <option value="recent">Recent</option>
                  <option value="name">Name</option>
                  <option value="type">Type</option>
                </select>
              </div>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap gap-1.5 mb-4 pb-3 border-b border-stone-700">
              {FILTER_BUTTONS.map(({ value, label, icon, color }) => {
                const count = itemCounts[value] || 0;
                const isActive = filterBy === value;
                // Hide filter buttons that have 0 items (except 'all')
                if (count === 0 && value !== 'all') return null;

                return (
                  <button
                    key={value}
                    onClick={() => setFilterBy(value)}
                    className={`
                      flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all
                      ${isActive
                        ? `${color} ring-2 ring-amber-500/50`
                        : 'bg-stone-700/50 hover:bg-stone-600/50 text-stone-400'
                      }
                    `}
                  >
                    {icon}
                    <span>{label}</span>
                    {count > 0 && (
                      <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-white/20' : 'bg-stone-600'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {filteredStashItems.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {filteredStashItems.map(({ item, originalIndex }) =>
                  renderItemCard(
                    item,
                    selectedStashIndex === originalIndex,
                    () => setSelectedStashIndex(
                      selectedStashIndex === originalIndex ? null : originalIndex
                    )
                  )
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-stone-500">
                {stash.items.length === 0
                  ? 'No items in stash'
                  : 'No items match filter'}
              </div>
            )}

            {selectedStashIndex !== null && selectedHero && (
              <button
                className="w-full py-3 mt-4 bg-amber-700 hover:bg-amber-600 text-amber-100 rounded-lg transition-colors"
                onClick={handleTransferToHero}
              >
                Give to {selectedHero.name}
              </button>
            )}
          </div>

          {/* Heroes section */}
          <div className="w-80 p-4 overflow-y-auto bg-stone-800/30">
            <h3 className="text-lg font-bold text-stone-300 mb-4">Heroes</h3>
            {heroes.length > 0 ? (
              <div className="space-y-3">
                {heroes.filter(h => !h.isDead && !h.isRetired).map(hero =>
                  renderHeroEquipment(hero)
                )}
              </div>
            ) : (
              <p className="text-center text-stone-500 py-4">No heroes available</p>
            )}

            {!selectedHero && selectedStashIndex !== null && (
              <p className="text-center text-amber-400 text-sm mt-4">
                Select a hero to transfer item
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-700 bg-stone-800/50">
          <div className="flex justify-between items-center text-sm text-stone-400">
            <span>Tip: Transfer equipment between heroes before starting a scenario</span>
            <div className="flex gap-4">
              <span className="text-red-400">Weapons</span>
              <span className="text-blue-400">Tools</span>
              <span className="text-amber-400">Armor</span>
              <span className="text-green-400">Consumables</span>
              <span className="text-purple-400">Relics</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentStashPanel;
