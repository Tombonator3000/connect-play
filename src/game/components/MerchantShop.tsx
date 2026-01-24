/**
 * MerchantShop - Shop interface for purchasing equipment between scenarios
 *
 * Features:
 * - Browse items by category
 * - Purchase with gold (Legacy system)
 * - View hero inventory and stats
 * - Transfer items to stash
 * - Archive survivors after purchase
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  LegacyHero,
  Item,
  ShopItem,
  ShopInventory,
  EquipmentStash,
  ScenarioResult,
  HeroScenarioResult,
  equipItem,
  findAvailableSlot,
  countInventoryItems,
  canBuyBagSlot,
  getNextBagSlotPrice,
  getTotalBagSlots,
  EXTRA_BAG_SLOT_PRICES
} from '../types';
import {
  getDefaultShopInventory,
  purchaseShopItem,
  getAllEquippedItems,
  getXPProgress,
  addItemToStash,
  getItemSellPrice,
  sellItemToFence,
  sellStashItem
} from '../utils/legacyManager';
import { canCharacterClassUseWeapon } from '../utils/combatUtils';
import {
  ShoppingBag,
  Sword,
  Wrench,
  Shield,
  Heart,
  Sparkles,
  Coins,
  Star,
  Package,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Trophy,
  Skull,
  Target,
  HandCoins,
  Warehouse,
  Ban,
  Hammer,
  FlaskConical,
  Check,
  AlertCircle,
  Flame,
  Backpack,
  Plus
} from 'lucide-react';
import { CraftingRecipe } from '../types';
import { CRAFTING_RECIPES, canCraftRecipe, getCraftedItem } from '../constants';

interface MerchantShopProps {
  heroes: LegacyHero[];
  stash: EquipmentStash;
  scenarioResult?: ScenarioResult;
  onHeroUpdate: (hero: LegacyHero) => void;
  onStashUpdate: (stash: EquipmentStash) => void;
  onFinish: () => void;
}

type ShopCategory = 'weapons' | 'tools' | 'armor' | 'consumables' | 'relics';
type ShopMode = 'buy' | 'sell' | 'craft' | 'services';
type SellSource = 'inventory' | 'stash';

// Crafting costs gold instead of AP when done at the Fence
const CRAFT_GOLD_COST_MULTIPLIER = 5; // Each AP cost becomes 5 gold

const MerchantShop: React.FC<MerchantShopProps> = ({
  heroes,
  stash,
  scenarioResult,
  onHeroUpdate,
  onStashUpdate,
  onFinish
}) => {
  const [selectedHeroId, setSelectedHeroId] = useState<string>(heroes[0]?.id || '');
  const [selectedCategory, setSelectedCategory] = useState<ShopCategory>('weapons');
  const [shopInventory, setShopInventory] = useState<ShopInventory>(getDefaultShopInventory());
  const [showRewards, setShowRewards] = useState(!!scenarioResult);
  const [purchaseMessage, setPurchaseMessage] = useState<string | null>(null);
  const [shopMode, setShopMode] = useState<ShopMode>('buy');
  const [sellSource, setSellSource] = useState<SellSource>('inventory');

  const activeHero = useMemo(
    () => heroes.find(h => h.id === selectedHeroId),
    [heroes, selectedHeroId]
  );

  const heroResult = useMemo(
    () => scenarioResult?.heroResults.find(r => r.heroId === selectedHeroId),
    [scenarioResult, selectedHeroId]
  );

  const categoryItems = useMemo(() => {
    return shopInventory[selectedCategory];
  }, [shopInventory, selectedCategory]);

  const getCategoryIcon = (category: ShopCategory) => {
    switch (category) {
      case 'weapons': return <Sword size={16} />;
      case 'tools': return <Wrench size={16} />;
      case 'armor': return <Shield size={16} />;
      case 'consumables': return <Heart size={16} />;
      case 'relics': return <Sparkles size={16} />;
    }
  };

  const getCategoryColor = (category: ShopCategory) => {
    switch (category) {
      case 'weapons': return 'text-red-400 border-red-700 bg-red-900/20';
      case 'tools': return 'text-blue-400 border-blue-700 bg-blue-900/20';
      case 'armor': return 'text-amber-400 border-amber-700 bg-amber-900/20';
      case 'consumables': return 'text-green-400 border-green-700 bg-green-900/20';
      case 'relics': return 'text-purple-400 border-purple-700 bg-purple-900/20';
    }
  };

  const handlePurchase = (shopItem: ShopItem) => {
    if (!activeHero) return;

    const result = purchaseShopItem(activeHero, shopItem);

    if (result.success) {
      // Equip the item
      const slot = findAvailableSlot(result.hero.equipment, shopItem.item);
      if (slot) {
        const equipResult = equipItem(result.hero.equipment, shopItem.item, slot);
        if (equipResult.success) {
          result.hero = { ...result.hero, equipment: equipResult.newInventory };
        }
      }

      // Update shop stock
      setShopInventory(prev => ({
        ...prev,
        [selectedCategory]: prev[selectedCategory].map(si =>
          si.item.id === shopItem.item.id ? { ...si, stock: shopItem.stock } : si
        )
      }));

      setPurchaseMessage(`Purchased ${shopItem.item.name}!`);
      setTimeout(() => setPurchaseMessage(null), 2000);
    } else {
      setPurchaseMessage(result.message);
      setTimeout(() => setPurchaseMessage(null), 2000);
    }

    onHeroUpdate(result.hero);
  };

  const handleTransferToStash = (item: Item) => {
    if (!activeHero) return;

    const newStash = addItemToStash(stash, item);
    if (!newStash) {
      setPurchaseMessage('Stash is full!');
      setTimeout(() => setPurchaseMessage(null), 2000);
      return;
    }

    // Remove from hero
    const newEquipment = { ...activeHero.equipment, bag: [...activeHero.equipment.bag] };
    if (newEquipment.leftHand?.id === item.id) newEquipment.leftHand = null;
    else if (newEquipment.rightHand?.id === item.id) newEquipment.rightHand = null;
    else if (newEquipment.body?.id === item.id) newEquipment.body = null;
    else {
      const idx = newEquipment.bag.findIndex(i => i?.id === item.id);
      if (idx !== -1) newEquipment.bag[idx] = null;
    }

    onHeroUpdate({ ...activeHero, equipment: newEquipment });
    onStashUpdate(newStash);
    setPurchaseMessage(`${item.name} transferred to stash`);
    setTimeout(() => setPurchaseMessage(null), 2000);
  };

  // Handle selling items from hero inventory
  const handleSellFromInventory = (item: Item) => {
    if (!activeHero) return;

    const result = sellItemToFence(activeHero, item);
    if (result.success) {
      onHeroUpdate(result.hero);
      setPurchaseMessage(`Sold ${item.name} for ${result.goldEarned} gold!`);
    } else {
      setPurchaseMessage(result.message);
    }
    setTimeout(() => setPurchaseMessage(null), 2000);
  };

  // Handle selling items from stash
  const handleSellFromStash = (itemIndex: number) => {
    if (!activeHero) return;

    const result = sellStashItem(stash, itemIndex);
    if (result.success) {
      // Add gold to the active hero
      onHeroUpdate({ ...activeHero, gold: activeHero.gold + result.goldEarned });
      onStashUpdate(result.stash);
      setPurchaseMessage(`Sold for ${result.goldEarned} gold!`);
    } else {
      setPurchaseMessage(result.message);
    }
    setTimeout(() => setPurchaseMessage(null), 2000);
  };

  // Helper to check if a weapon is restricted for the active hero
  const isWeaponRestrictedForHero = useCallback((weaponId: string, itemType: string): boolean => {
    if (!activeHero || itemType !== 'weapon') return false;

    // Use canCharacterClassUseWeapon directly with the character class
    // This avoids the need for creating mock Player objects with type assertions
    return !canCharacterClassUseWeapon(activeHero.characterClass, weaponId);
  }, [activeHero]);

  const renderShopItem = (shopItem: ShopItem) => {
    const canAfford = activeHero && activeHero.gold >= shopItem.goldCost;
    const meetsLevel = !shopItem.requiredLevel || (activeHero && activeHero.level >= shopItem.requiredLevel);
    const inStock = shopItem.stock !== 0;
    const maxItems = activeHero ? 3 + getTotalBagSlots(activeHero.extraBagSlots || 0) : 7;
    const hasSpace = activeHero && countInventoryItems(activeHero.equipment) < maxItems;

    // Check weapon restrictions for the active hero's class
    const isWeaponRestricted = isWeaponRestrictedForHero(shopItem.item.id, shopItem.item.type);

    const canBuy = canAfford && meetsLevel && inStock && hasSpace && !isWeaponRestricted;

    return (
      <div
        key={shopItem.item.id}
        className={`
          p-4 rounded-lg border-2 transition-all
          ${canBuy
            ? 'border-stone-600 bg-stone-800/50 hover:border-amber-500'
            : isWeaponRestricted
              ? 'border-red-800 bg-red-900/20 opacity-70'
              : 'border-stone-700 bg-stone-900/50 opacity-60'
          }
        `}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            {getCategoryIcon(selectedCategory)}
            <span className="font-bold text-stone-200">{shopItem.item.name}</span>
            {shopItem.isNew && (
              <span className="px-1.5 py-0.5 bg-green-600 text-green-100 text-[10px] rounded uppercase">New</span>
            )}
            {isWeaponRestricted && (
              <span className="px-1.5 py-0.5 bg-red-700 text-red-100 text-[10px] rounded uppercase flex items-center gap-1">
                <Ban size={10} /> Restricted
              </span>
            )}
          </div>
          <div className="text-right">
            <div className={`flex items-center gap-1 ${canAfford ? 'text-yellow-400' : 'text-red-400'}`}>
              <Coins size={14} />
              <span className="font-bold">{shopItem.goldCost}</span>
            </div>
            {shopItem.stock > 0 && (
              <div className="text-xs text-stone-500">Stock: {shopItem.stock}</div>
            )}
          </div>
        </div>

        <p className="text-xs text-stone-400 mb-3">{shopItem.item.effect}</p>

        {shopItem.requiredLevel && !meetsLevel && (
          <div className="text-xs text-amber-500 mb-2 flex items-center gap-1">
            <Star size={12} /> Requires Level {shopItem.requiredLevel}
          </div>
        )}

        {isWeaponRestricted && (
          <div className="text-xs text-red-400 mb-2 flex items-center gap-1">
            <Ban size={12} /> {activeHero?.name || 'This class'} cannot use this weapon
          </div>
        )}

        <button
          onClick={() => handlePurchase(shopItem)}
          disabled={!canBuy}
          className={`
            w-full py-2 rounded text-sm font-bold uppercase tracking-wider transition-all
            ${canBuy
              ? 'bg-amber-700 hover:bg-amber-600 text-amber-100'
              : 'bg-stone-800 text-stone-600 cursor-not-allowed'
            }
          `}
        >
          {isWeaponRestricted ? 'Cannot Use' : !inStock ? 'Out of Stock' : !hasSpace ? 'Inventory Full' : !canAfford ? 'Not Enough Gold' : 'Purchase'}
        </button>
      </div>
    );
  };

  // Render an item for sale (from inventory or stash)
  const renderSellItem = (item: Item, source: 'inventory' | 'stash', index?: number) => {
    const sellPrice = getItemSellPrice(item);

    return (
      <div
        key={`${source}-${item.id}-${index}`}
        className="p-4 rounded-lg border-2 border-stone-600 bg-stone-800/50 hover:border-green-500 transition-all"
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-200">{item.name}</span>
            <span className="px-1.5 py-0.5 bg-stone-700 text-stone-400 text-[10px] rounded uppercase">
              {item.type || 'item'}
            </span>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-green-400">
              <Coins size={14} />
              <span className="font-bold">+{sellPrice}</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-stone-400 mb-3">{item.effect || 'No special effect'}</p>

        <button
          onClick={() => {
            if (source === 'inventory') {
              handleSellFromInventory(item);
            } else if (index !== undefined) {
              handleSellFromStash(index);
            }
          }}
          className="w-full py-2 rounded text-sm font-bold uppercase tracking-wider transition-all bg-green-700 hover:bg-green-600 text-green-100"
        >
          Sell for {sellPrice} gold
        </button>
      </div>
    );
  };

  // Render the sell panel content
  const renderSellPanel = () => {
    const inventoryItems = activeHero ? getAllEquippedItems(activeHero.equipment) : [];
    const stashItems = stash.items;

    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Sell source tabs */}
        <div className="flex gap-2 p-4 border-b border-stone-700 bg-stone-900">
          <button
            onClick={() => setSellSource('inventory')}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all
              ${sellSource === 'inventory'
                ? 'border-green-600 bg-green-900/30 text-green-400'
                : 'border-stone-700 bg-stone-800 text-stone-400 hover:border-stone-600'
              }
            `}
          >
            <Package size={16} />
            My Inventory ({inventoryItems.length})
          </button>
          <button
            onClick={() => setSellSource('stash')}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all
              ${sellSource === 'stash'
                ? 'border-green-600 bg-green-900/30 text-green-400'
                : 'border-stone-700 bg-stone-800 text-stone-400 hover:border-stone-600'
              }
            `}
          >
            <Warehouse size={16} />
            Stash ({stashItems.length})
          </button>
        </div>

        {/* Sell items grid */}
        <div className="flex-1 p-4 overflow-y-auto">
          {sellSource === 'inventory' ? (
            inventoryItems.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {inventoryItems.map((item, idx) => renderSellItem(item, 'inventory', idx))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-stone-500">
                <Package size={48} className="mb-4 opacity-50" />
                <p className="text-lg">No items in inventory to sell</p>
                <p className="text-sm">Find loot during scenarios or check your stash</p>
              </div>
            )
          ) : (
            stashItems.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {stashItems.map((item, idx) => renderSellItem(item, 'stash', idx))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-stone-500">
                <Warehouse size={48} className="mb-4 opacity-50" />
                <p className="text-lg">Stash is empty</p>
                <p className="text-sm">Transfer items from your inventory or find loot</p>
              </div>
            )
          )}
        </div>
      </div>
    );
  };

  // Render the crafting panel content
  const renderCraftingPanel = () => {
    if (!activeHero) {
      return (
        <div className="flex-1 flex items-center justify-center text-stone-500">
          <p>Select a hero to craft items</p>
        </div>
      );
    }

    // Get hero's inventory as flat array
    const inventoryItems = getAllEquippedItems(activeHero.equipment);

    // Calculate craftability for each recipe
    const recipeStatuses = CRAFTING_RECIPES.map(recipe => {
      const craftability = canCraftRecipe(recipe, inventoryItems);
      const goldCost = recipe.apCost * CRAFT_GOLD_COST_MULTIPLIER;
      const canAfford = activeHero.gold >= goldCost;
      return {
        recipe,
        ...craftability,
        goldCost,
        canAfford
      };
    });

    const availableRecipes = recipeStatuses.filter(r => r.canCraft && r.canAfford);
    const unavailableRecipes = recipeStatuses.filter(r => !r.canCraft || !r.canAfford);

    const handleCraft = (recipe: CraftingRecipe, goldCost: number) => {
      if (!activeHero) return;

      // Check gold
      if (activeHero.gold < goldCost) {
        setPurchaseMessage('Not enough gold!');
        setTimeout(() => setPurchaseMessage(null), 2000);
        return;
      }

      // Get the crafted item
      const craftedItem = getCraftedItem(recipe.result.itemId);
      if (!craftedItem) {
        setPurchaseMessage('Recipe result not found!');
        setTimeout(() => setPurchaseMessage(null), 2000);
        return;
      }

      // Remove ingredients from inventory
      let newEquipment = { ...activeHero.equipment, bag: [...activeHero.equipment.bag] };
      for (const ingredient of recipe.ingredients) {
        for (let i = 0; i < ingredient.quantity; i++) {
          // Find and remove the ingredient
          if (newEquipment.leftHand?.id === ingredient.itemId || newEquipment.leftHand?.id === `shop_${ingredient.itemId}`) {
            newEquipment.leftHand = null;
          } else if (newEquipment.rightHand?.id === ingredient.itemId || newEquipment.rightHand?.id === `shop_${ingredient.itemId}`) {
            newEquipment.rightHand = null;
          } else if (newEquipment.body?.id === ingredient.itemId || newEquipment.body?.id === `shop_${ingredient.itemId}`) {
            newEquipment.body = null;
          } else {
            const idx = newEquipment.bag.findIndex(item => item?.id === ingredient.itemId || item?.id === `shop_${ingredient.itemId}`);
            if (idx !== -1) {
              newEquipment.bag[idx] = null;
            }
          }
        }
      }

      // Add crafted item to inventory
      const slot = findAvailableSlot(newEquipment, craftedItem);
      if (slot) {
        const equipResult = equipItem(newEquipment, craftedItem, slot);
        if (equipResult.success) {
          newEquipment = equipResult.newInventory;
        }
      }

      // Deduct gold and update hero
      const updatedHero: LegacyHero = {
        ...activeHero,
        gold: activeHero.gold - goldCost,
        equipment: newEquipment
      };

      onHeroUpdate(updatedHero);
      setPurchaseMessage(`Crafted ${craftedItem.name}!`);
      setTimeout(() => setPurchaseMessage(null), 2000);
    };

    const getRecipeTypeIcon = (recipe: CraftingRecipe) => {
      const item = getCraftedItem(recipe.result.itemId);
      if (!item) return <FlaskConical size={20} />;
      switch (item.type) {
        case 'weapon': return <Sword size={20} />;
        case 'armor': return <Shield size={20} />;
        case 'tool': return <Wrench size={20} />;
        case 'consumable': return <Flame size={20} />;
        default: return <FlaskConical size={20} />;
      }
    };

    const getRecipeTypeColor = (recipe: CraftingRecipe, canCraft: boolean, canAfford: boolean) => {
      if (!canCraft || !canAfford) return 'border-stone-700 bg-stone-900/50 text-stone-500';
      const item = getCraftedItem(recipe.result.itemId);
      if (!item) return 'border-stone-600 bg-stone-800/50 text-stone-400';
      switch (item.type) {
        case 'weapon': return 'border-red-700 bg-red-900/20 text-red-400';
        case 'armor': return 'border-blue-700 bg-blue-900/20 text-blue-400';
        case 'tool': return 'border-green-700 bg-green-900/20 text-green-400';
        case 'consumable': return 'border-orange-700 bg-orange-900/20 text-orange-400';
        default: return 'border-purple-700 bg-purple-900/20 text-purple-400';
      }
    };

    const renderRecipeCard = (status: typeof recipeStatuses[0]) => {
      const { recipe, canCraft, canAfford, goldCost, missingItems } = status;
      const craftedItem = getCraftedItem(recipe.result.itemId);
      const isAvailable = canCraft && canAfford;

      return (
        <div
          key={recipe.id}
          className={`
            relative p-4 rounded-lg border-2 transition-all
            ${getRecipeTypeColor(recipe, canCraft, canAfford)}
            ${isAvailable ? 'hover:scale-[1.02]' : 'opacity-70'}
          `}
        >
          {/* Header */}
          <div className="flex items-start gap-3 mb-3">
            <div className="p-2 rounded-lg bg-black/30">
              {getRecipeTypeIcon(recipe)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm truncate">{recipe.name}</h3>
              <p className="text-xs opacity-70 line-clamp-2">{recipe.description}</p>
            </div>
          </div>

          {/* Result preview */}
          {craftedItem && (
            <div className="mb-3 p-2 bg-black/20 rounded text-xs">
              <span className="text-stone-400">Creates: </span>
              <span className="text-amber-400 font-semibold">{craftedItem.name}</span>
              {craftedItem.effect && (
                <span className="text-green-400 block mt-1">{craftedItem.effect}</span>
              )}
            </div>
          )}

          {/* Ingredients */}
          <div className="flex flex-wrap gap-1 mb-3">
            {recipe.ingredients.map((ing, i) => {
              const hasMissing = missingItems.includes(ing.itemId);
              return (
                <span
                  key={i}
                  className={`text-[10px] px-1.5 py-0.5 rounded ${
                    hasMissing
                      ? 'bg-red-900/50 text-red-300'
                      : 'bg-green-900/50 text-green-300'
                  }`}
                >
                  {ing.quantity}x {ing.itemId.replace(/_/g, ' ')}
                </span>
              );
            })}
          </div>

          {/* Cost and Craft button */}
          <div className="flex items-center justify-between">
            <span className={`flex items-center gap-1 text-sm font-bold ${canAfford ? 'text-amber-400' : 'text-red-400'}`}>
              <Coins size={14} /> {goldCost}g
            </span>
            <button
              onClick={() => handleCraft(recipe, goldCost)}
              disabled={!isAvailable}
              className={`
                px-3 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-1
                ${isAvailable
                  ? 'bg-orange-600 hover:bg-orange-500 text-white'
                  : 'bg-stone-700 text-stone-500 cursor-not-allowed'
                }
              `}
            >
              <Hammer size={14} />
              Craft
            </button>
          </div>

          {/* Unavailable reason */}
          {!isAvailable && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
              <div className="text-center text-xs">
                {!canCraft && <p className="text-red-400">Missing ingredients</p>}
                {canCraft && !canAfford && <p className="text-amber-400">Not enough gold</p>}
              </div>
            </div>
          )}
        </div>
      );
    };

    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Crafting info header */}
        <div className="p-4 border-b border-stone-700 bg-stone-900">
          <div className="flex items-center gap-2">
            <Hammer size={20} className="text-orange-400" />
            <span className="text-stone-300">
              The Fence will craft items for a fee of <span className="text-amber-400 font-bold">{CRAFT_GOLD_COST_MULTIPLIER}g</span> per complexity
            </span>
          </div>
        </div>

        {/* Recipes grid */}
        <div className="flex-1 p-4 overflow-y-auto">
          {/* Available recipes */}
          {availableRecipes.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-green-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Check size={14} />
                Available ({availableRecipes.length})
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {availableRecipes.map(status => renderRecipeCard(status))}
              </div>
            </div>
          )}

          {/* Unavailable recipes */}
          {unavailableRecipes.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <AlertCircle size={14} />
                Unavailable ({unavailableRecipes.length})
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {unavailableRecipes.map(status => renderRecipeCard(status))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {CRAFTING_RECIPES.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-stone-500">
              <FlaskConical size={48} className="mb-4 opacity-50" />
              <p className="text-lg">No recipes available</p>
              <p className="text-sm">Find recipe scrolls during scenarios</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Handle buying extra bag slot
  const handleBuyBagSlot = () => {
    if (!activeHero) return;

    // Check if hero can buy more slots
    if (!canBuyBagSlot(activeHero)) {
      setPurchaseMessage(`Max slots for Level ${activeHero.level}!`);
      setTimeout(() => setPurchaseMessage(null), 2000);
      return;
    }

    const price = getNextBagSlotPrice(activeHero.extraBagSlots);

    // Check if hero can afford
    if (activeHero.gold < price) {
      setPurchaseMessage('Not enough gold!');
      setTimeout(() => setPurchaseMessage(null), 2000);
      return;
    }

    // Purchase the slot
    const updatedHero: LegacyHero = {
      ...activeHero,
      gold: activeHero.gold - price,
      extraBagSlots: activeHero.extraBagSlots + 1,
      // Extend bag array with one more null slot
      equipment: {
        ...activeHero.equipment,
        bag: [...activeHero.equipment.bag, null]
      }
    };

    onHeroUpdate(updatedHero);
    setPurchaseMessage(`Purchased bag slot! (${getTotalBagSlots(updatedHero.extraBagSlots)} total)`);
    setTimeout(() => setPurchaseMessage(null), 2000);
  };

  // Render the services panel content
  const renderServicesPanel = () => {
    if (!activeHero) {
      return (
        <div className="flex-1 flex items-center justify-center text-stone-500">
          <p>Select a hero to use services</p>
        </div>
      );
    }

    const currentExtraSlots = activeHero.extraBagSlots || 0;
    const maxExtraSlots = activeHero.level;
    const canBuyMore = canBuyBagSlot(activeHero);
    const nextSlotPrice = canBuyMore ? getNextBagSlotPrice(currentExtraSlots) : 0;
    const canAfford = activeHero.gold >= nextSlotPrice;

    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Services info header */}
        <div className="p-4 border-b border-stone-700 bg-stone-900">
          <div className="flex items-center gap-2">
            <Backpack size={20} className="text-cyan-400" />
            <span className="text-stone-300">
              The Fence offers special services to expand your carrying capacity
            </span>
          </div>
        </div>

        {/* Services content */}
        <div className="flex-1 p-4 overflow-y-auto">
          {/* Bag Slot Upgrade */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-cyan-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Backpack size={18} />
              Inventory Expansion
            </h3>

            <div className={`
              p-6 rounded-lg border-2 transition-all max-w-lg
              ${canBuyMore && canAfford
                ? 'border-cyan-600 bg-cyan-900/20 hover:border-cyan-400'
                : 'border-stone-700 bg-stone-900/50'
              }
            `}>
              {/* Current status */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-stone-400">Current Bag Slots:</span>
                  <span className="text-lg font-bold text-cyan-400">
                    {getTotalBagSlots(currentExtraSlots)}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-stone-400">Extra Slots Purchased:</span>
                  <span className="text-cyan-300">
                    {currentExtraSlots} / {maxExtraSlots}
                  </span>
                </div>
                <p className="text-xs text-stone-500 italic">
                  Max extra slots = Hero Level (currently Level {activeHero.level})
                </p>
              </div>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="h-3 bg-stone-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 transition-all"
                    style={{ width: `${(currentExtraSlots / 5) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-stone-500 mt-1">
                  <span>Base (4)</span>
                  <span>Max (9)</span>
                </div>
              </div>

              {/* Price list */}
              <div className="mb-4 p-3 bg-black/30 rounded-lg">
                <p className="text-xs text-stone-500 uppercase tracking-wider mb-2">Slot Prices:</p>
                <div className="grid grid-cols-5 gap-2">
                  {Object.entries(EXTRA_BAG_SLOT_PRICES).map(([slot, price]) => {
                    const slotNum = parseInt(slot);
                    const isPurchased = slotNum <= currentExtraSlots;
                    const isNext = slotNum === currentExtraSlots + 1;
                    const isLocked = slotNum > maxExtraSlots;
                    return (
                      <div
                        key={slot}
                        className={`
                          p-2 rounded text-center text-xs
                          ${isPurchased ? 'bg-cyan-900/50 text-cyan-400' : ''}
                          ${isNext && !isLocked ? 'bg-amber-900/50 text-amber-400 ring-2 ring-amber-500' : ''}
                          ${isLocked ? 'bg-stone-800/50 text-stone-600' : ''}
                          ${!isPurchased && !isNext && !isLocked ? 'bg-stone-800/50 text-stone-400' : ''}
                        `}
                      >
                        <div className="font-bold">+{slot}</div>
                        <div className={isPurchased ? 'text-green-400' : ''}>
                          {isPurchased ? '✓' : isLocked ? '🔒' : `${price}g`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Purchase button */}
              {canBuyMore ? (
                <button
                  onClick={handleBuyBagSlot}
                  disabled={!canAfford}
                  className={`
                    w-full py-3 rounded-lg font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all
                    ${canAfford
                      ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                      : 'bg-stone-700 text-stone-500 cursor-not-allowed'
                    }
                  `}
                >
                  <Plus size={18} />
                  Buy Slot #{currentExtraSlots + 1}
                  <Coins size={16} className="ml-2" />
                  <span className="text-amber-300">{nextSlotPrice}</span>
                </button>
              ) : (
                <div className="w-full py-3 rounded-lg bg-stone-700 text-stone-400 text-center font-bold uppercase tracking-wider">
                  {currentExtraSlots >= 5 ? (
                    'Maximum Capacity Reached!'
                  ) : (
                    `Level Up to Unlock More (Need Level ${currentExtraSlots + 1})`
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderRewardsPanel = () => {
    if (!scenarioResult) return null;

    return (
      <div className="mb-6 bg-stone-800/50 rounded-lg border border-stone-700 overflow-hidden">
        <button
          className="w-full p-4 flex justify-between items-center hover:bg-stone-700/30 transition-colors"
          onClick={() => setShowRewards(!showRewards)}
        >
          <div className="flex items-center gap-3">
            {scenarioResult.victory ? (
              <Trophy className="text-yellow-400" size={24} />
            ) : (
              <Skull className="text-red-400" size={24} />
            )}
            <div className="text-left">
              <h3 className="font-bold text-lg">
                {scenarioResult.victory ? 'Victory!' : 'Defeat'}
              </h3>
              <p className="text-sm text-stone-400">
                Round {scenarioResult.roundsPlayed} - {scenarioResult.totalGoldEarned} gold earned
              </p>
            </div>
          </div>
          {showRewards ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>

        {showRewards && (
          <div className="p-4 border-t border-stone-700 space-y-3">
            {scenarioResult.heroResults.map(result => {
              const hero = heroes.find(h => h.id === result.heroId);
              if (!hero) return null;

              return (
                <div
                  key={result.heroId}
                  className={`
                    p-3 rounded-lg border
                    ${result.survived
                      ? 'border-green-700 bg-green-900/20'
                      : 'border-red-700 bg-red-900/20'
                    }
                  `}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className={result.survived ? 'text-green-400' : 'text-red-400'}>
                        {result.survived ? '✓' : '✗'}
                      </span>
                      <span className="font-medium">{hero.name}</span>
                      {result.leveledUp && (
                        <span className="px-2 py-0.5 bg-yellow-600 text-yellow-100 text-xs rounded">
                          LEVEL UP!
                        </span>
                      )}
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span className="text-yellow-400">+{result.goldEarned} gold</span>
                      <span className="text-blue-400">+{result.xpEarned} XP</span>
                      <span className="text-red-400">{result.killCount} kills</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[150] bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-xl">
      <div className="w-full max-w-6xl h-[90vh] flex flex-col bg-stone-900 border-2 border-amber-700 rounded-xl overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="bg-stone-950 p-4 border-b border-amber-700 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-amber-900/30 p-3 rounded-full border border-amber-600">
              <ShoppingBag className="text-amber-500" size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-amber-100 uppercase tracking-wider">The Fence</h2>
              <p className="text-amber-500/60 text-sm italic">"I trade in curious things for curious minds..."</p>
            </div>
          </div>

          {/* Hero selector */}
          <div className="flex items-center gap-4">
            <div className="text-right mr-4">
              <div className="text-xs text-stone-500 uppercase tracking-wider mb-1">Customer</div>
              <div className="flex gap-2">
                {heroes.filter(h => !h.isDead).map(hero => (
                  <button
                    key={hero.id}
                    onClick={() => setSelectedHeroId(hero.id)}
                    className={`
                      px-3 py-1.5 rounded border text-sm font-bold transition-all
                      ${hero.id === selectedHeroId
                        ? 'bg-amber-600 text-amber-100 border-amber-400'
                        : 'bg-stone-800 text-stone-400 border-stone-700 hover:border-amber-700'
                      }
                    `}
                  >
                    {hero.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Rewards panel (if scenario just completed) */}
        {scenarioResult && (
          <div className="px-4 pt-4">
            {renderRewardsPanel()}
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 flex overflow-hidden">

          {/* Left: Hero info */}
          <div className="w-72 bg-stone-950 p-4 border-r border-stone-700 flex flex-col overflow-y-auto">
            {activeHero && (
              <>
                {/* Hero stats */}
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-amber-200 mb-1">{activeHero.name}</h3>
                  <p className="text-sm text-stone-400 capitalize mb-3">
                    Level {activeHero.level} {activeHero.characterClass}
                  </p>

                  {/* Gold */}
                  <div className="flex items-center gap-2 p-3 bg-yellow-900/20 border border-yellow-700 rounded-lg mb-3">
                    <Coins className="text-yellow-400" size={24} />
                    <span className="text-2xl font-bold text-yellow-400">{activeHero.gold}</span>
                    <span className="text-sm text-yellow-600">Gold</span>
                  </div>

                  {/* XP bar */}
                  {activeHero.level < 5 && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-stone-400 mb-1">
                        <span>XP to Level {activeHero.level + 1}</span>
                        <span>{getXPProgress(activeHero).current}/{getXPProgress(activeHero).needed}</span>
                      </div>
                      <div className="h-2 bg-stone-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500"
                          style={{ width: `${getXPProgress(activeHero).percent}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Inventory */}
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-xs text-stone-500 uppercase tracking-wider font-bold">
                      Inventory ({countInventoryItems(activeHero.equipment)}/{3 + getTotalBagSlots(activeHero.extraBagSlots || 0)})
                    </h4>
                  </div>

                  <div className="space-y-2">
                    {getAllEquippedItems(activeHero.equipment).map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2 bg-stone-800 rounded border border-stone-700 group"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-stone-300">{item.name}</span>
                          <button
                            onClick={() => handleTransferToStash(item)}
                            className="opacity-0 group-hover:opacity-100 text-xs text-amber-400 hover:text-amber-300 transition-opacity"
                            title="Transfer to stash"
                          >
                            <Package size={14} />
                          </button>
                        </div>
                        <p className="text-xs text-stone-500">{item.effect}</p>
                      </div>
                    ))}
                    {countInventoryItems(activeHero.equipment) === 0 && (
                      <p className="text-stone-600 italic text-sm text-center py-4">
                        Empty pockets...
                      </p>
                    )}
                  </div>
                </div>

                {/* Stash info */}
                <div className="mt-4 pt-4 border-t border-stone-700">
                  <div className="flex items-center gap-2 text-sm text-stone-400">
                    <Package size={16} />
                    <span>Stash: {stash.items.length}/{stash.maxCapacity} items</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right: Shop */}
          <div className="flex-1 flex flex-col overflow-hidden">

            {/* Buy/Sell Mode Toggle */}
            <div className="flex gap-2 p-4 border-b border-stone-700 bg-stone-950">
              <button
                onClick={() => setShopMode('buy')}
                className={`
                  flex items-center gap-2 px-6 py-2 rounded-lg border-2 transition-all font-bold uppercase tracking-wider
                  ${shopMode === 'buy'
                    ? 'border-amber-500 bg-amber-900/30 text-amber-400'
                    : 'border-stone-700 bg-stone-800 text-stone-400 hover:border-stone-600'
                  }
                `}
              >
                <ShoppingBag size={18} />
                Buy
              </button>
              <button
                onClick={() => setShopMode('sell')}
                className={`
                  flex items-center gap-2 px-6 py-2 rounded-lg border-2 transition-all font-bold uppercase tracking-wider
                  ${shopMode === 'sell'
                    ? 'border-green-500 bg-green-900/30 text-green-400'
                    : 'border-stone-700 bg-stone-800 text-stone-400 hover:border-stone-600'
                  }
                `}
              >
                <HandCoins size={18} />
                Sell
              </button>
              <button
                onClick={() => setShopMode('craft')}
                className={`
                  flex items-center gap-2 px-6 py-2 rounded-lg border-2 transition-all font-bold uppercase tracking-wider
                  ${shopMode === 'craft'
                    ? 'border-orange-500 bg-orange-900/30 text-orange-400'
                    : 'border-stone-700 bg-stone-800 text-stone-400 hover:border-stone-600'
                  }
                `}
              >
                <Hammer size={18} />
                Craft
              </button>
              <button
                onClick={() => setShopMode('services')}
                className={`
                  flex items-center gap-2 px-6 py-2 rounded-lg border-2 transition-all font-bold uppercase tracking-wider
                  ${shopMode === 'services'
                    ? 'border-cyan-500 bg-cyan-900/30 text-cyan-400'
                    : 'border-stone-700 bg-stone-800 text-stone-400 hover:border-stone-600'
                  }
                `}
              >
                <Backpack size={18} />
                Services
              </button>
              <div className="flex-1" />
              {shopMode === 'sell' && (
                <div className="flex items-center gap-2 text-sm text-stone-500 italic">
                  <span>The Fence pays 50% of shop value</span>
                </div>
              )}
              {shopMode === 'craft' && (
                <div className="flex items-center gap-2 text-sm text-stone-500 italic">
                  <span>Crafting fee: {CRAFT_GOLD_COST_MULTIPLIER}g per AP</span>
                </div>
              )}
            </div>

            {shopMode === 'buy' && (
              <>
                {/* Category tabs */}
                <div className="flex gap-2 p-4 border-b border-stone-700 bg-stone-900">
                  {(['weapons', 'tools', 'armor', 'consumables', 'relics'] as ShopCategory[]).map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`
                        flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all capitalize
                        ${category === selectedCategory
                          ? getCategoryColor(category)
                          : 'border-stone-700 bg-stone-800 text-stone-400 hover:border-stone-600'
                        }
                      `}
                    >
                      {getCategoryIcon(category)}
                      {category}
                    </button>
                  ))}
                </div>

                {/* Items grid */}
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryItems.map(renderShopItem)}
                  </div>
                </div>
              </>
            )}
            {shopMode === 'sell' && renderSellPanel()}
            {shopMode === 'craft' && renderCraftingPanel()}
            {shopMode === 'services' && renderServicesPanel()}
          </div>
        </div>

        {/* Purchase message */}
        {purchaseMessage && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-6 py-3 bg-stone-800 border-2 border-amber-500 rounded-lg shadow-2xl animate-pulse">
            <p className="text-amber-200 font-bold">{purchaseMessage}</p>
          </div>
        )}

        {/* Footer */}
        <div className="bg-stone-950 p-4 border-t border-amber-700 flex justify-between items-center">
          <div className="text-sm text-stone-500">
            <span className="text-amber-400">Tip:</span> Items transfer to your stash when you finish shopping
          </div>
          <button
            onClick={onFinish}
            className="px-8 py-3 bg-green-700 hover:bg-green-600 text-green-100 font-bold uppercase tracking-wider rounded-lg flex items-center gap-3 transition-all shadow-lg"
          >
            Finish & Archive Survivors <ArrowRight size={18} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default MerchantShop;
