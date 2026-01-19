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

import React, { useState, useMemo } from 'react';
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
  countInventoryItems
} from '../types';
import {
  getDefaultShopInventory,
  purchaseShopItem,
  getAllEquippedItems,
  getXPProgress,
  addItemToStash
} from '../utils/legacyManager';
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
  Target
} from 'lucide-react';

interface MerchantShopProps {
  heroes: LegacyHero[];
  stash: EquipmentStash;
  scenarioResult?: ScenarioResult;
  onHeroUpdate: (hero: LegacyHero) => void;
  onStashUpdate: (stash: EquipmentStash) => void;
  onFinish: () => void;
}

type ShopCategory = 'weapons' | 'tools' | 'armor' | 'consumables' | 'relics';

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

  const renderShopItem = (shopItem: ShopItem) => {
    const canAfford = activeHero && activeHero.gold >= shopItem.goldCost;
    const meetsLevel = !shopItem.requiredLevel || (activeHero && activeHero.level >= shopItem.requiredLevel);
    const inStock = shopItem.stock !== 0;
    const hasSpace = activeHero && countInventoryItems(activeHero.equipment) < 7;
    const canBuy = canAfford && meetsLevel && inStock && hasSpace;

    return (
      <div
        key={shopItem.item.id}
        className={`
          p-4 rounded-lg border-2 transition-all
          ${canBuy
            ? 'border-stone-600 bg-stone-800/50 hover:border-amber-500'
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
          {!inStock ? 'Out of Stock' : !hasSpace ? 'Inventory Full' : !canAfford ? 'Not Enough Gold' : 'Purchase'}
        </button>
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
                      Inventory ({countInventoryItems(activeHero.equipment)}/7)
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
