import React, { useState, useEffect } from 'react';
import { Player, Item, countInventoryItems, InventorySlotName, CharacterType, EarnedBadge, ScenarioObjective } from '../types';
import { Heart, Brain, Eye, Star, Backpack, Sword, Search, Zap, ShieldCheck, Cross, FileQuestion, User, Hand, Shirt, Key, X, ArrowRight, Trash2, Pill, Award, Ban, FileText, Gem, Sparkles, Package, ChevronDown, ChevronUp, Target, BookOpen, ScrollText } from 'lucide-react';
import { ItemTooltip } from './ItemTooltip';
import { getCharacterPortrait, getCharacterDisplayName } from '../utils/characterAssets';
import { getItemIcon as getSpecificItemIcon } from './ItemIcons';
import BadgeDisplay from './BadgeDisplay';
import DesperateIndicator from './DesperateIndicator';
import { canCharacterClassUseWeapon } from '../utils/combatUtils';

interface CharacterPanelProps {
  player: Player | null;
  onUseItem?: (item: Item, slotName: InventorySlotName) => void;
  onUnequipItem?: (slotName: InventorySlotName) => void;
  onEquipFromBag?: (bagIndex: number, targetSlot: 'leftHand' | 'rightHand') => void;
  onDropItem?: (slotName: InventorySlotName) => void;
  earnedBadges?: EarnedBadge[];  // Earned badges to display
  objectives?: ScenarioObjective[];  // Current scenario objectives for linking quest items
}

// Quest item type colors and icons
const QUEST_ITEM_STYLES: Record<string, { bg: string; border: string; text: string; icon: React.ReactNode; label: string }> = {
  key: {
    bg: 'bg-amber-900/40',
    border: 'border-amber-500/60',
    text: 'text-amber-300',
    icon: <Key size={12} className="text-amber-400" />,
    label: 'Key'
  },
  clue: {
    bg: 'bg-blue-900/40',
    border: 'border-blue-500/60',
    text: 'text-blue-300',
    icon: <FileText size={12} className="text-blue-400" />,
    label: 'Clue'
  },
  artifact: {
    bg: 'bg-purple-900/40',
    border: 'border-purple-500/60',
    text: 'text-purple-300',
    icon: <Gem size={12} className="text-purple-400" />,
    label: 'Artifact'
  },
  collectible: {
    bg: 'bg-yellow-900/40',
    border: 'border-yellow-500/60',
    text: 'text-yellow-300',
    icon: <Star size={12} className="text-yellow-400" />,
    label: 'Collectible'
  },
  component: {
    bg: 'bg-cyan-900/40',
    border: 'border-cyan-500/60',
    text: 'text-cyan-300',
    icon: <Package size={12} className="text-cyan-400" />,
    label: 'Component'
  },
  default: {
    bg: 'bg-yellow-900/30',
    border: 'border-yellow-600/50',
    text: 'text-yellow-200',
    icon: <Sparkles size={12} className="text-yellow-400" />,
    label: 'Quest Item'
  }
};

const getQuestItemStyle = (item: Item) => {
  // First check questItemType, then fall back to item.type for keys/clues
  const typeKey = item.questItemType || (item.type === 'key' ? 'key' : item.type === 'clue' ? 'clue' : item.type === 'relic' ? 'artifact' : 'default');
  return QUEST_ITEM_STYLES[typeKey] || QUEST_ITEM_STYLES.default;
};

const CharacterPanel: React.FC<CharacterPanelProps> = ({
  player,
  onUseItem,
  onUnequipItem,
  onEquipFromBag,
  onDropItem,
  earnedBadges = [],
  objectives = []
}) => {
  const [selectedSlot, setSelectedSlot] = useState<InventorySlotName | null>(null);
  const [showSlotMenu, setShowSlotMenu] = useState(false);
  const [questItemsExpanded, setQuestItemsExpanded] = useState(true);
  const [inspectedQuestItem, setInspectedQuestItem] = useState<Item | null>(null);
  const [portraitError, setPortraitError] = useState(false);

  // Reset portrait error when player changes
  useEffect(() => {
    setPortraitError(false);
  }, [player?.id]);

  if (!player) return null;

  // Defensive: ensure inventory exists with default values
  const inventory = inventory || {
    leftHand: null,
    rightHand: null,
    body: null,
    bag: [null, null, null, null],
    questItems: []
  };

  const hpPercent = (player.hp / player.maxHp) * 100;
  const sanPercent = (player.sanity / player.maxSanity) * 100;
  const inventoryCount = countInventoryItems(inventory);

  // Get item from slot
  const getItemFromSlot = (slotName: InventorySlotName): Item | null => {
    const bag = inventory.bag || [];
    switch (slotName) {
      case 'leftHand': return inventory.leftHand;
      case 'rightHand': return inventory.rightHand;
      case 'body': return inventory.body;
      case 'bag1': return bag[0] || null;
      case 'bag2': return bag[1] || null;
      case 'bag3': return bag[2] || null;
      case 'bag4': return bag[3] || null;
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
  const getItemIcon = (type: string, itemId?: string, questItemType?: string) => {
    // Try to get specific item icon first (now with type and questItemType)
    if (itemId) {
      const SpecificIcon = getSpecificItemIcon(itemId, type, questItemType);
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
      case 'clue': return <FileQuestion size={18} />;
      case 'quest_item': return <Star size={18} className="text-yellow-400" />;
      default: return <FileQuestion size={18} />;
    }
  };

  const renderSlot = (item: Item | null, label: string, slotIcon: React.ReactNode, slotName: InventorySlotName) => {
    const isSelected = selectedSlot === slotName && showSlotMenu;

    // Check if weapon is restricted for this character class
    const isRestricted = item?.type === 'weapon' && player.id
      ? !canCharacterClassUseWeapon(player.id as CharacterType, item.id)
      : false;

    const slotContent = (
      <div
        onClick={() => item && handleSlotClick(slotName, item)}
        className={`aspect-square border-2 rounded-lg flex flex-col items-center justify-center transition-all relative ${
          item
            ? `bg-leather border-parchment text-parchment hover:border-accent hover:shadow-[var(--shadow-glow)] cursor-pointer ${isSelected ? 'border-accent ring-2 ring-accent/50' : ''} ${isRestricted ? 'opacity-60 border-red-500/50' : ''}`
            : 'bg-background/40 border-border opacity-50 cursor-default'
        }`}
      >
        {item ? getItemIcon(item.type, item.id, item.questItemType) : slotIcon}
        <span className="text-[8px] uppercase tracking-wider mt-1 opacity-60">{label}</span>
        {/* Weapon restriction indicator */}
        {isRestricted && (
          <div className="absolute -top-1 -right-1 bg-red-600 rounded-full p-0.5" title={`${player.id} kan ikke bruke dette vapenet`}>
            <Ban size={10} className="text-white" />
          </div>
        )}
        {/* Usage indicator for consumables */}
        {item && item.type === 'consumable' && item.uses !== undefined && (
          <span className="absolute top-0.5 right-0.5 text-[7px] bg-accent text-background px-1 rounded-full font-bold">
            {item.uses}
          </span>
        )}
      </div>
    );
    return item ? (
      <ItemTooltip item={item} isRestricted={isRestricted}>
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
            {!portraitError ? (
              <img
                src={player.customPortraitUrl || getCharacterPortrait(player.id as CharacterType)}
                alt={player.name}
                className="w-full h-full object-cover"
                onError={() => setPortraitError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <User size={40} />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <h2 className="text-2xl font-display italic text-parchment tracking-wide leading-none truncate">{player.name}</h2>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mt-2">{getCharacterDisplayName(player.id as CharacterType)}</div>
            {/* Achievement Badges */}
            {earnedBadges.length > 0 && (
              <div className="mt-2 flex items-center gap-1">
                <Award size={10} className="text-amber-400 opacity-60" />
                <BadgeDisplay
                  earnedBadges={earnedBadges}
                  maxDisplay={4}
                  size="sm"
                  showTooltip={true}
                />
              </div>
            )}
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

          {/* Desperate Measures Indicator */}
          <DesperateIndicator
            hp={player.hp}
            sanity={player.sanity}
            compact={false}
            className="mt-3"
          />
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
            {renderSlot(inventory.leftHand, 'L.Hand', <Hand size={16} className="opacity-40" />, 'leftHand')}
            {renderSlot(inventory.body, 'Body', <Shirt size={16} className="opacity-40" />, 'body')}
            {renderSlot(inventory.rightHand, 'R.Hand', <Hand size={16} className="opacity-40 scale-x-[-1]" />, 'rightHand')}
          </div>

          {/* Bag Slots */}
          <div className="mt-2">
            <h4 className="text-[9px] text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1">
              <Backpack size={10} /> Bag
            </h4>
            <div className="grid grid-cols-4 gap-2">
              {(inventory.bag || [null, null, null, null]).map((item, index) => (
                <div key={index}>
                  {renderSlot(item, `${index + 1}`, <FileQuestion size={14} className="opacity-40" />, `bag${index + 1}` as InventorySlotName)}
                </div>
              ))}
            </div>
          </div>

          {/* Quest Items Section - Enhanced with color coding */}
          {inventory.questItems && inventory.questItems.length > 0 && (
            <div className="mt-4 pt-3 border-t border-yellow-600/30">
              <button
                onClick={() => setQuestItemsExpanded(!questItemsExpanded)}
                className="w-full flex items-center justify-between text-[9px] text-yellow-400 uppercase tracking-widest mb-2 hover:text-yellow-300 transition-colors"
              >
                <span className="flex items-center gap-1">
                  <Star size={10} className="text-yellow-400" /> Quest Items ({inventory.questItems.length})
                </span>
                {questItemsExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>

              {questItemsExpanded && (
                <div className="flex flex-wrap gap-2 animate-fadeIn">
                  {inventory.questItems.map((item, index) => {
                    const style = getQuestItemStyle(item);
                    // Find the linked objective for this quest item
                    const linkedObjective = item.objectiveId
                      ? objectives.find(obj => obj.id === item.objectiveId)
                      : null;
                    return (
                      <div
                        key={item.id || index}
                        onClick={() => setInspectedQuestItem(item)}
                        className={`flex items-center gap-1.5 px-2 py-1.5 ${style.bg} border ${style.border} rounded-lg cursor-pointer hover:brightness-125 hover:scale-105 transition-all group`}
                        title="Klikk for å undersøke"
                      >
                        <div className="flex-shrink-0">
                          {style.icon}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className={`text-xs ${style.text} font-medium truncate max-w-[100px]`}>{item.name}</span>
                          {linkedObjective ? (
                            <span className="text-[8px] text-cyan-400/80 flex items-center gap-0.5 truncate max-w-[100px]" title={linkedObjective.shortDescription}>
                              <Target size={8} className="flex-shrink-0" />
                              <span className="truncate">{linkedObjective.shortDescription}</span>
                            </span>
                          ) : (
                            <span className="text-[8px] text-muted-foreground opacity-70">{style.label}</span>
                          )}
                        </div>
                        <ScrollText size={10} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Collapsed view - show count by type */}
              {!questItemsExpanded && (
                <div className="flex gap-2 items-center text-[10px] text-muted-foreground">
                  {(() => {
                    const counts: Record<string, number> = {};
                    inventory.questItems.forEach(item => {
                      const typeKey = item.questItemType || (item.type === 'key' ? 'key' : item.type === 'clue' ? 'clue' : 'default');
                      counts[typeKey] = (counts[typeKey] || 0) + 1;
                    });
                    return Object.entries(counts).map(([type, count]) => {
                      const style = QUEST_ITEM_STYLES[type] || QUEST_ITEM_STYLES.default;
                      return (
                        <span key={type} className={`flex items-center gap-1 ${style.text}`}>
                          {style.icon} {count}
                        </span>
                      );
                    });
                  })()}
                </div>
              )}
            </div>
          )}
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
                        {!inventory.leftHand && (
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
                        {!inventory.rightHand && (
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
                        {inventory.leftHand && inventory.rightHand && (
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

        {/* Quest Item Inspect Modal */}
        {inspectedQuestItem && (
          <div className="mt-4 p-4 bg-background/95 border-2 border-yellow-600/60 rounded-lg animate-fadeIn shadow-[0_0_20px_rgba(202,138,4,0.3)]">
            {(() => {
              const style = getQuestItemStyle(inspectedQuestItem);
              const linkedObjective = inspectedQuestItem.objectiveId
                ? objectives.find(obj => obj.id === inspectedQuestItem.objectiveId)
                : null;

              return (
                <>
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3 pb-2 border-b border-yellow-600/30">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 ${style.bg} border ${style.border} rounded-lg`}>
                        {style.icon}
                      </div>
                      <div>
                        <h4 className={`text-sm font-bold ${style.text}`}>{inspectedQuestItem.name}</h4>
                        <span className="text-[9px] uppercase tracking-wider text-muted-foreground">{style.label}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setInspectedQuestItem(null)}
                      className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Description */}
                  {inspectedQuestItem.description && (
                    <div className="mb-3">
                      <div className="flex items-center gap-1.5 text-[9px] text-amber-400 uppercase tracking-wider mb-1">
                        <BookOpen size={10} />
                        <span>Beskrivelse</span>
                      </div>
                      <p className="text-xs text-sepia italic leading-relaxed bg-leather/30 p-2 rounded border border-primary/20">
                        "{inspectedQuestItem.description}"
                      </p>
                    </div>
                  )}

                  {/* Linked Objective */}
                  {linkedObjective && (
                    <div className="mb-3">
                      <div className="flex items-center gap-1.5 text-[9px] text-cyan-400 uppercase tracking-wider mb-1">
                        <Target size={10} />
                        <span>Relatert mål</span>
                      </div>
                      <div className="bg-cyan-950/30 border border-cyan-500/30 rounded p-2">
                        <p className="text-xs text-cyan-300 font-medium">{linkedObjective.shortDescription}</p>
                        {linkedObjective.description && (
                          <p className="text-[10px] text-cyan-400/70 mt-1">{linkedObjective.description}</p>
                        )}
                        {linkedObjective.completed && (
                          <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-green-500/20 text-green-400 text-[9px] uppercase tracking-wider rounded border border-green-500/30">
                            <Star size={8} /> Fullført
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Item Type Info */}
                  <div className="flex flex-wrap gap-2 text-[10px]">
                    {inspectedQuestItem.questItemType === 'key' && (
                      <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
                        <Key size={10} /> Kan åpne låste dører
                      </span>
                    )}
                    {inspectedQuestItem.questItemType === 'clue' && (
                      <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30 flex items-center gap-1">
                        <Search size={10} /> Ledetråd
                      </span>
                    )}
                    {inspectedQuestItem.questItemType === 'collectible' && (
                      <span className="bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded border border-yellow-500/30 flex items-center gap-1">
                        <Star size={10} /> Samleobjekt
                      </span>
                    )}
                    {inspectedQuestItem.questItemType === 'artifact' && (
                      <span className="bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded border border-purple-500/30 flex items-center gap-1">
                        <Gem size={10} /> Artefakt
                      </span>
                    )}
                    {inspectedQuestItem.questItemType === 'component' && (
                      <span className="bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/30 flex items-center gap-1">
                        <Package size={10} /> Ritual-komponent
                      </span>
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
