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

interface EquipmentStashPanelProps {
  stash: EquipmentStash;
  heroes: LegacyHero[];
  onStashUpdate: (stash: EquipmentStash) => void;
  onHeroUpdate: (hero: LegacyHero) => void;
  onClose: () => void;
}

type SortOption = 'name' | 'type' | 'recent';
type FilterOption = 'all' | 'weapon' | 'tool' | 'armor' | 'consumable' | 'relic' | 'key' | 'clue';

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

  const renderItemCard = (item: Item, isSelected: boolean, onClick: () => void) => (
    <div
      className={`
        p-3 rounded-lg border-2 cursor-pointer transition-all
        ${isSelected ? 'border-amber-500 ring-2 ring-amber-500/50' : 'border-stone-600 hover:border-stone-500'}
        ${getItemTypeColor(item.type)}
      `}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-1">
        <span className="font-medium text-sm">{item.name}</span>
        <span className="text-xs uppercase opacity-70">{item.type}</span>
      </div>
      <p className="text-xs opacity-80">{item.effect}</p>
      {item.uses !== undefined && (
        <div className="text-xs mt-1 opacity-60">
          Uses: {item.uses}/{item.maxUses || item.uses}
        </div>
      )}
    </div>
  );

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
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-stone-300">Stored Items</h3>
              <div className="flex gap-2">
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value as FilterOption)}
                  className="px-2 py-1 bg-stone-700 border border-stone-600 rounded text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="weapon">Weapons</option>
                  <option value="tool">Tools</option>
                  <option value="armor">Armor</option>
                  <option value="consumable">Consumables</option>
                  <option value="relic">Relics</option>
                  <option value="key">Keys</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="px-2 py-1 bg-stone-700 border border-stone-600 rounded text-sm"
                >
                  <option value="recent">Recent</option>
                  <option value="name">Name</option>
                  <option value="type">Type</option>
                </select>
              </div>
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
