import React, { useState } from 'react';
import { Player, Item, countInventoryItems, InventorySlotName, CharacterType } from '../types';
import { Heart, Brain, Eye, Star, Backpack, Sword, Search, Zap, ShieldCheck, Cross, FileQuestion, User, Hand, Shirt, Key, X, ArrowRight, Trash2, Pill } from 'lucide-react';
import { ItemTooltip } from './ItemTooltip';
import { getCharacterPortrait, getCharacterDisplayName } from '../utils/characterAssets';
import { getItemIcon as getSpecificItemIcon } from './ItemIcons';
interface CharacterPanelProps {
  player: Player | null;
  onUseItem?: (item: Item, slotName: InventorySlotName) => void;
  onUnequipItem?: (slotName: InventorySlotName) => void;
  onEquipFromBag?: (bagIndex: number, targetSlot: 'leftHand' | 'rightHand') => void;
  onDropItem?: (slotName: InventorySlotName) => void;
}

const CharacterPanel: React.FC<CharacterPanelProps> = ({
  player,
  onUseItem,
  onUnequipItem,
  onEquipFromBag,
  onDropItem
}) => {
  const [selectedSlot, setSelectedSlot] = useState<InventorySlotName | null>(null);
  const [showSlotMenu, setShowSlotMenu] = useState(false);

  if (!player) return null;

  const hpPercent = (player.hp / player.maxHp) * 100;
  const sanPercent = (player.sanity / player.maxSanity) * 100;
  const inventoryCount = countInventoryItems(player.inventory);

  // Get item from slot
  const getItemFromSlot = (slotName: InventorySlotName): Item | null => {
    switch (slotName) {
      case 'leftHand': return player.inventory.leftHand;
      case 'rightHand': return player.inventory.rightHand;
      case 'body': return player.inventory.body;
      case 'bag1': return player.inventory.bag[0];
      case 'bag2': return player.inventory.bag[1];
      case 'bag3': return player.inventory.bag[2];
      case 'bag4': return player.inventory.bag[3];
      default: return null;
    }
  };

  // Handle slot click
  const handleSlotClick = (slotName: InventorySlotName, item: Item | null) => {
    if (!item) return; // Don't show menu for empty slots
    setSelectedSlot(slotName);
    setShowSlotMenu(true);
  };

  // Close the menu
  const closeMenu = () => {
    setSelectedSlot(null);
    setShowSlotMenu(false);
  };

  // Check if item is usable (consumable with uses remaining)
  const isItemUsable = (item: Item): boolean => {
    return item.type === 'consumable' && (item.uses === undefined || item.uses > 0);
  };

  // Check if item can be unequipped (weapons/tools in hands, armor on body)
  const canUnequip = (slotName: InventorySlotName, item: Item): boolean => {
    if (slotName === 'leftHand' || slotName === 'rightHand') {
      return item.type === 'weapon' || item.type === 'tool';
    }
    if (slotName === 'body') {
      return item.type === 'armor';
    }
    return false;
  };

  // Check if bag item can be equipped to hands
  const canEquipToHands = (item: Item): boolean => {
    return item.type === 'weapon' || item.type === 'tool';
  };

  // Get item icon - first try specific icon, then fall back to generic
  const getItemIcon = (type: string, itemId?: string) => {
    // Try to get specific item icon first
    if (itemId) {
      const SpecificIcon = getSpecificItemIcon(itemId);
      if (SpecificIcon) {
        return <SpecificIcon size={24} />;
      }
    }
    // Fall back to generic type icons
    switch (type) {
      case 'weapon': return <Sword size={18} />;
      case 'tool': return <Search size={18} />;
      case 'relic': return <Zap size={18} />;
      case 'armor': return <ShieldCheck size={18} />;
      case 'consumable': return <Cross size={18} />;
      case 'key': return <Key size={18} />;
      default: return <FileQuestion size={18} />;
    }
  };

  const renderSlot = (item: Item | null, label: string, slotIcon: React.ReactNode, slotName: InventorySlotName) => {
    const isSelected = selectedSlot === slotName && showSlotMenu;
    const slotContent = (
      <div
        onClick={() => item && handleSlotClick(slotName, item)}
        className={`aspect-square border-2 rounded-lg flex flex-col items-center justify-center transition-all relative ${
          item
            ? `bg-leather border-parchment text-parchment hover:border-accent hover:shadow-[var(--shadow-glow)] cursor-pointer ${isSelected ? 'border-accent ring-2 ring-accent/50' : ''}`
            : 'bg-background/40 border-border opacity-50 cursor-default'
        }`}
      >
        {item ? getItemIcon(item.type, item.id) : slotIcon}
        <span className="text-[8px] uppercase tracking-wider mt-1 opacity-60">{label}</span>
        {/* Usage indicator for consumables */}
        {item && item.type === 'consumable' && item.uses !== undefined && (
          <span className="absolute top-0.5 right-0.5 text-[7px] bg-accent text-background px-1 rounded-full font-bold">
            {item.uses}
          </span>
        )}
      </div>
    );
    return item ? (
      <ItemTooltip item={item}>
        {slotContent}
      </ItemTooltip>
    ) : slotContent;
  };

  return (
    <div className="h-full flex flex-col bg-leather text-sepia font-serif relative overflow-hidden border-2 border-primary rounded-2xl shadow-[var(--shadow-doom)]">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/leather.png')] opacity-30 pointer-events-none"></div>
      <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.8)] pointer-events-none"></div>

      <div className="p-6 pb-4 border-b-2 border-border relative z-10 shrink-0">
        <div className="flex gap-4 items-start">
          <div className="w-20 h-20 rounded-xl border-4 border-leather shadow-lg overflow-hidden bg-background shrink-0">
            <img 
              src={getCharacterPortrait(player.id as CharacterType)} 
              alt={player.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-muted-foreground"><svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>';
              }}
            />
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <h2 className="text-2xl font-display italic text-parchment tracking-wide leading-none truncate">{player.name}</h2>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mt-2">{getCharacterDisplayName(player.id as CharacterType)}</div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10 custom-scrollbar">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-end mb-1 px-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-health flex items-center gap-1"><Heart size={10} fill="currentColor" /> Vitality</span>
              <span className="text-sm font-display text-parchment">{player.hp} / {player.maxHp}</span>
            </div>
            <div className="h-2.5 bg-background border border-border p-[1px] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-red-900 to-red-500 transition-all duration-700" style={{ width: `${hpPercent}%` }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-end mb-1 px-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-sanity flex items-center gap-1"><Brain size={10} fill="currentColor" /> Sanity</span>
              <span className="text-sm font-display text-parchment">{player.sanity} / {player.maxSanity}</span>
            </div>
            <div className="h-2.5 bg-background border border-border p-[1px] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-900 to-purple-500 transition-all duration-700" style={{ width: `${sanPercent}%` }}></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card border border-border p-3 rounded flex flex-col items-center">
            <span className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1">Insight</span>
            <div className="flex items-center gap-2 text-parchment">
              <Eye size={16} />
              <span className="text-xl font-bold">{player.insight}</span>
            </div>
          </div>
          <div className="bg-card border border-border p-3 rounded flex flex-col items-center">
            <span className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1">Actions</span>
            <div className="flex items-center gap-2 text-parchment">
              <Star size={16} />
              <span className="text-xl font-bold">{player.actions}</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border/50">
          <h3 className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Ability</h3>
          <p className="text-sm text-sepia italic">"{player.special}"</p>
        </div>

        {/* Equipment Slots */}
        <div className="pt-4 border-t-2 border-border">
          <h3 className="text-[10px] font-bold text-parchment uppercase tracking-widest mb-3 flex items-center gap-2">
            <Backpack size={12} /> Equipment ({inventoryCount}/7)
          </h3>

          {/* Hand and Body Slots */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {renderSlot(player.inventory.leftHand, 'L.Hand', <Hand size={16} className="opacity-40" />, 'leftHand')}
            {renderSlot(player.inventory.body, 'Body', <Shirt size={16} className="opacity-40" />, 'body')}
            {renderSlot(player.inventory.rightHand, 'R.Hand', <Hand size={16} className="opacity-40 scale-x-[-1]" />, 'rightHand')}
          </div>

          {/* Bag Slots */}
          <div className="mt-2">
            <h4 className="text-[9px] text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1">
              <Backpack size={10} /> Bag
            </h4>
            <div className="grid grid-cols-4 gap-2">
              {player.inventory.bag.map((item, index) => (
                <div key={index}>
                  {renderSlot(item, `${index + 1}`, <FileQuestion size={14} className="opacity-40" />, `bag${index + 1}` as InventorySlotName)}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Item Action Menu */}
        {showSlotMenu && selectedSlot && (
          <div className="mt-4 p-3 bg-background/80 border-2 border-accent rounded-lg animate-fadeIn">
            {(() => {
              const item = getItemFromSlot(selectedSlot);
              if (!item) return null;

              const bagSlots: InventorySlotName[] = ['bag1', 'bag2', 'bag3', 'bag4'];
              const isBagSlot = bagSlots.includes(selectedSlot);
              const isHandSlot = selectedSlot === 'leftHand' || selectedSlot === 'rightHand';

              return (
                <>
                  {/* Item header */}
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
                    <div>
                      <h4 className="text-sm font-bold text-parchment">{item.name}</h4>
                      <p className="text-[10px] text-muted-foreground">{item.effect}</p>
                    </div>
                    <button
                      onClick={closeMenu}
                      className="p-1 text-muted-foreground hover:text-foreground"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Action buttons */}
                  <div className="space-y-2">
                    {/* USE - for consumables */}
                    {isItemUsable(item) && onUseItem && (
                      <button
                        onClick={() => {
                          onUseItem(item, selectedSlot);
                          closeMenu();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 bg-accent/20 hover:bg-accent/40 border border-accent rounded-lg text-accent text-sm font-medium transition-colors"
                      >
                        <Pill size={14} />
                        Use {item.uses !== undefined ? `(${item.uses} left)` : ''}
                      </button>
                    )}

                    {/* UNEQUIP - for weapons/armor in hand/body slots */}
                    {canUnequip(selectedSlot, item) && onUnequipItem && (
                      <button
                        onClick={() => {
                          onUnequipItem(selectedSlot);
                          closeMenu();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 bg-amber-500/20 hover:bg-amber-500/40 border border-amber-500 rounded-lg text-amber-400 text-sm font-medium transition-colors"
                      >
                        <ArrowRight size={14} />
                        Unequip to Bag
                      </button>
                    )}

                    {/* EQUIP TO HAND - for weapons/tools in bag */}
                    {isBagSlot && canEquipToHands(item) && onEquipFromBag && (
                      <>
                        {!player.inventory.leftHand && (
                          <button
                            onClick={() => {
                              const bagIndex = parseInt(selectedSlot.replace('bag', '')) - 1;
                              onEquipFromBag(bagIndex, 'leftHand');
                              closeMenu();
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/40 border border-emerald-500 rounded-lg text-emerald-400 text-sm font-medium transition-colors"
                          >
                            <Hand size={14} />
                            Equip to Left Hand
                          </button>
                        )}
                        {!player.inventory.rightHand && (
                          <button
                            onClick={() => {
                              const bagIndex = parseInt(selectedSlot.replace('bag', '')) - 1;
                              onEquipFromBag(bagIndex, 'rightHand');
                              closeMenu();
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/40 border border-emerald-500 rounded-lg text-emerald-400 text-sm font-medium transition-colors"
                          >
                            <Hand size={14} className="scale-x-[-1]" />
                            Equip to Right Hand
                          </button>
                        )}
                        {player.inventory.leftHand && player.inventory.rightHand && (
                          <p className="text-xs text-muted-foreground italic text-center py-2">
                            Both hands are full. Unequip a weapon first.
                          </p>
                        )}
                      </>
                    )}

                    {/* DROP - for any item */}
                    {onDropItem && (
                      <button
                        onClick={() => {
                          onDropItem(selectedSlot);
                          closeMenu();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/40 border border-red-500 rounded-lg text-red-400 text-sm font-medium transition-colors"
                      >
                        <Trash2 size={14} />
                        Drop Item
                      </button>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

export default CharacterPanel;
