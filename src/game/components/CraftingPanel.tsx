/**
 * CraftingPanel - Item Crafting Interface
 *
 * Allows players to combine items to create new, more powerful items.
 * Shows available recipes, required ingredients, and crafting cost.
 *
 * Features:
 * - Recipe list with availability status
 * - Ingredient requirements display
 * - AP cost indicator
 * - Skill check requirements (if any)
 * - Crafting action with result
 */

import React, { useState, useMemo } from 'react';
import {
  Hammer, X, Check, AlertCircle, Package,
  Zap, Sparkles, ChevronRight, FlaskConical,
  Sword, Shield, Wrench, Flame
} from 'lucide-react';
import { CraftingRecipe, Item, Player, CraftingResult, SkillType } from '../types';
import {
  CRAFTING_RECIPES,
  canCraftRecipe,
  getCraftedItem
} from '../constants';

interface CraftingPanelProps {
  player: Player;
  onCraft: (recipe: CraftingRecipe) => CraftingResult | null;
  onClose: () => void;
}

// Get icon for recipe result type
const getRecipeIcon = (recipe: CraftingRecipe) => {
  const craftedItem = getCraftedItem(recipe.result.itemId);
  if (!craftedItem) return FlaskConical;

  switch (craftedItem.type) {
    case 'weapon': return Sword;
    case 'armor': return Shield;
    case 'tool': return Wrench;
    case 'consumable': return Flame;
    default: return FlaskConical;
  }
};

// Get color based on recipe complexity/result
const getRecipeColor = (recipe: CraftingRecipe, canCraft: boolean) => {
  if (!canCraft) return 'text-gray-500 border-gray-700 bg-gray-900/50';

  const item = getCraftedItem(recipe.result.itemId);
  if (!item) return 'text-gray-400 border-gray-600 bg-gray-800/50';

  switch (item.type) {
    case 'weapon': return 'text-red-400 border-red-700 bg-red-900/30';
    case 'armor': return 'text-blue-400 border-blue-700 bg-blue-900/30';
    case 'tool': return 'text-green-400 border-green-700 bg-green-900/30';
    case 'consumable': return 'text-orange-400 border-orange-700 bg-orange-900/30';
    default: return 'text-purple-400 border-purple-700 bg-purple-900/30';
  }
};

// Get skill name in Norwegian
const getSkillName = (skill: SkillType): string => {
  const names: Record<SkillType, string> = {
    strength: 'Styrke',
    agility: 'Smidighet',
    intellect: 'Intellekt',
    willpower: 'Viljestyrke'
  };
  return names[skill] || skill;
};

// Get all items from player inventory as flat array
const getInventoryItems = (player: Player): Item[] => {
  const items: Item[] = [];
  if (player.inventory.leftHand) items.push(player.inventory.leftHand);
  if (player.inventory.rightHand) items.push(player.inventory.rightHand);
  if (player.inventory.body) items.push(player.inventory.body);
  player.inventory.bag.forEach(item => {
    if (item) items.push(item);
  });
  return items;
};

const CraftingPanel: React.FC<CraftingPanelProps> = ({
  player,
  onCraft,
  onClose
}) => {
  const [selectedRecipe, setSelectedRecipe] = useState<CraftingRecipe | null>(null);
  const [craftingResult, setCraftingResult] = useState<CraftingResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Get player's inventory as flat array
  const inventory = useMemo(() => getInventoryItems(player), [player]);

  // Calculate craftability for each recipe
  const recipeStatus = useMemo(() => {
    return CRAFTING_RECIPES.map(recipe => ({
      recipe,
      ...canCraftRecipe(recipe, inventory),
      hasEnoughAP: player.actions >= recipe.apCost
    }));
  }, [inventory, player.actions]);

  // Available recipes (can craft)
  const availableRecipes = recipeStatus.filter(r => r.canCraft && r.hasEnoughAP);
  const unavailableRecipes = recipeStatus.filter(r => !r.canCraft || !r.hasEnoughAP);

  const handleCraft = () => {
    if (!selectedRecipe) return;

    const result = onCraft(selectedRecipe);
    if (result) {
      setCraftingResult(result);
      setShowResult(true);

      // Auto-close result after delay
      setTimeout(() => {
        setShowResult(false);
        setCraftingResult(null);
        if (result.success) {
          setSelectedRecipe(null);
        }
      }, 3000);
    }
  };

  const renderRecipeCard = (
    status: { recipe: CraftingRecipe; canCraft: boolean; missingItems: string[]; hasEnoughAP: boolean },
    index: number
  ) => {
    const { recipe, canCraft, missingItems, hasEnoughAP } = status;
    const Icon = getRecipeIcon(recipe);
    const colorClass = getRecipeColor(recipe, canCraft && hasEnoughAP);
    const isSelected = selectedRecipe?.id === recipe.id;
    const craftedItem = getCraftedItem(recipe.result.itemId);

    return (
      <button
        key={recipe.id}
        onClick={() => (canCraft && hasEnoughAP) ? setSelectedRecipe(recipe) : null}
        disabled={!canCraft || !hasEnoughAP}
        className={`
          relative p-3 rounded-lg border-2 transition-all duration-200 text-left w-full
          ${colorClass}
          ${isSelected
            ? 'ring-2 ring-yellow-400 border-yellow-400 scale-[1.02]'
            : canCraft && hasEnoughAP
              ? 'hover:scale-[1.01] hover:brightness-110 cursor-pointer'
              : 'opacity-60 cursor-not-allowed'
          }
        `}
      >
        {isSelected && (
          <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1 z-10">
            <Check size={12} className="text-gray-900" />
          </div>
        )}

        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-black/30">
            <Icon size={24} />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm truncate">{recipe.name}</h3>
            <p className="text-xs opacity-70 line-clamp-2">{recipe.description}</p>

            {/* Ingredients */}
            <div className="flex flex-wrap gap-1 mt-2">
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

            {/* Cost & Requirements */}
            <div className="flex items-center gap-2 mt-2 text-[10px]">
              <span className={`flex items-center gap-1 ${hasEnoughAP ? 'text-yellow-400' : 'text-red-400'}`}>
                <Zap size={10} /> {recipe.apCost} AP
              </span>
              {recipe.skillCheck && (
                <span className="text-purple-400 flex items-center gap-1">
                  <AlertCircle size={10} />
                  {getSkillName(recipe.skillCheck.skill)} DC{recipe.skillCheck.dc}
                </span>
              )}
            </div>
          </div>
        </div>
      </button>
    );
  };

  const renderSelectedRecipeDetails = () => {
    if (!selectedRecipe) return null;

    const craftedItem = getCraftedItem(selectedRecipe.result.itemId);
    const status = recipeStatus.find(r => r.recipe.id === selectedRecipe.id);

    return (
      <div className="bg-gray-800/80 rounded-lg p-4 border border-gray-700">
        <h3 className="text-lg font-bold text-yellow-400 mb-2 flex items-center gap-2">
          <Sparkles size={20} />
          {selectedRecipe.name}
        </h3>

        {/* Result Item Preview */}
        {craftedItem && (
          <div className="bg-black/30 rounded-lg p-3 mb-3">
            <div className="text-sm text-gray-300 mb-1">Resultat:</div>
            <div className="flex items-center gap-2">
              <Package size={16} className="text-amber-400" />
              <span className="font-semibold">{craftedItem.name}</span>
            </div>
            <div className="text-xs text-green-400 mt-1">{craftedItem.effect}</div>
            {craftedItem.description && (
              <div className="text-xs text-gray-400 mt-1 italic">{craftedItem.description}</div>
            )}
          </div>
        )}

        {/* Ingredients Required */}
        <div className="space-y-2 mb-3">
          <div className="text-sm text-gray-300">Ingredienser:</div>
          {selectedRecipe.ingredients.map((ing, i) => {
            const hasItem = !status?.missingItems.includes(ing.itemId);
            return (
              <div
                key={i}
                className={`flex items-center gap-2 text-sm ${hasItem ? 'text-green-400' : 'text-red-400'}`}
              >
                {hasItem ? <Check size={14} /> : <X size={14} />}
                <span>{ing.quantity}x {ing.itemId.replace(/_/g, ' ')}</span>
              </div>
            );
          })}
        </div>

        {/* Skill Check Warning */}
        {selectedRecipe.skillCheck && (
          <div className="bg-purple-900/30 rounded p-2 text-xs text-purple-300 mb-3">
            <AlertCircle size={12} className="inline mr-1" />
            Krever {getSkillName(selectedRecipe.skillCheck.skill)} sjekk (DC {selectedRecipe.skillCheck.dc})
          </div>
        )}

        {/* Craft Button */}
        <button
          onClick={handleCraft}
          disabled={!status?.canCraft || !status?.hasEnoughAP}
          className={`
            w-full py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-2
            ${status?.canCraft && status?.hasEnoughAP
              ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          <Hammer size={18} />
          Craft ({selectedRecipe.apCost} AP)
        </button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border-2 border-amber-700 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-900/50 to-orange-900/50 p-4 border-b border-amber-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Hammer size={28} className="text-amber-400" />
            <div>
              <h2 className="text-xl font-bold text-amber-300">Crafting</h2>
              <p className="text-sm text-gray-400">Kombiner items for å lage nye</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* Result Overlay */}
        {showResult && craftingResult && (
          <div className={`
            absolute inset-0 z-20 flex items-center justify-center bg-black/80
            ${craftingResult.success ? 'animate-pulse' : ''}
          `}>
            <div className={`
              p-6 rounded-xl border-2 text-center
              ${craftingResult.success
                ? 'bg-green-900/90 border-green-500'
                : 'bg-red-900/90 border-red-500'
              }
            `}>
              {craftingResult.success ? (
                <>
                  <Sparkles size={48} className="text-yellow-400 mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-green-300">Crafting Vellykket!</h3>
                </>
              ) : (
                <>
                  <X size={48} className="text-red-400 mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-red-300">Crafting Feilet</h3>
                </>
              )}
              <p className="text-gray-300 mt-2">{craftingResult.message}</p>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Recipe List */}
          <div className="w-1/2 border-r border-gray-700 p-4 overflow-y-auto">
            {/* Available Recipes */}
            {availableRecipes.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-green-400 mb-2 uppercase tracking-wide flex items-center gap-2">
                  <Check size={14} />
                  Tilgjengelige ({availableRecipes.length})
                </h3>
                <div className="space-y-2">
                  {availableRecipes.map((status, i) => renderRecipeCard(status, i))}
                </div>
              </div>
            )}

            {/* Unavailable Recipes */}
            {unavailableRecipes.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide flex items-center gap-2">
                  <AlertCircle size={14} />
                  Mangler ingredienser ({unavailableRecipes.length})
                </h3>
                <div className="space-y-2">
                  {unavailableRecipes.map((status, i) => renderRecipeCard(status, i))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {recipeStatus.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <FlaskConical size={48} className="mx-auto mb-3 opacity-50" />
                <p>Ingen oppskrifter tilgjengelig</p>
              </div>
            )}
          </div>

          {/* Selected Recipe Details */}
          <div className="w-1/2 p-4 overflow-y-auto">
            {selectedRecipe ? (
              renderSelectedRecipeDetails()
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <ChevronRight size={48} className="mx-auto mb-3 opacity-50" />
                  <p>Velg en oppskrift for å se detaljer</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-700 flex items-center justify-between bg-gray-800/50">
          <div className="text-sm text-gray-400">
            <Zap size={14} className="inline mr-1 text-yellow-400" />
            Tilgjengelige AP: <span className="font-bold text-white">{player.actions}</span>
          </div>
          <div className="text-sm text-gray-400">
            <Package size={14} className="inline mr-1 text-amber-400" />
            Items: <span className="font-bold text-white">{inventory.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CraftingPanel;
