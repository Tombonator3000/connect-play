/**
 * MONSTER DESIGNER
 *
 * Allows users to create custom monsters with their own stats and graphics.
 * - Image upload for monster icon
 * - Define stats (hp, attackDice, defenseDice, horror)
 * - Select traits and abilities
 * - Save to localStorage for use in scenarios
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  X, Upload, Plus, Trash2, Save, Skull, Heart, Swords, Shield, Brain,
  ChevronDown, ChevronRight, Eye, Zap, FileUp, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// ============================================================================
// TYPES
// ============================================================================

export interface CustomMonster {
  id: string;
  type: string;           // Unique type identifier (like 'cultist', 'ghoul')
  name: string;
  category: 'minion' | 'warrior' | 'elite' | 'boss';
  hp: number;
  attackDice: number;
  defenseDice: number;
  horror: number;
  traits: string[];
  description: string;
  lore?: string;
  defeatFlavor?: string;
  // Custom graphics
  customImage?: string;   // Base64 encoded image
  imageScale?: number;    // Scale factor (0.5 - 2.0)
  // Behavior settings
  behaviorType?: 'aggressive' | 'defensive' | 'ranged' | 'ambusher' | 'patrol' | 'swarm';
  preferredTerrain?: string;
  specialAbilities?: string[];
  createdAt: string;
  isCustom: true;
}

interface MonsterDesignerProps {
  onClose: () => void;
  onSave: (monster: CustomMonster) => void;
  editingMonster?: CustomMonster;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CATEGORIES: { value: CustomMonster['category']; label: string; color: string; description: string }[] = [
  { value: 'minion', label: 'Minion', color: '#6b7280', description: 'Weak enemies, easy to defeat' },
  { value: 'warrior', label: 'Warrior', color: '#f59e0b', description: 'Standard threats with decent stats' },
  { value: 'elite', label: 'Elite', color: '#ef4444', description: 'Dangerous foes requiring strategy' },
  { value: 'boss', label: 'Boss', color: '#7c3aed', description: 'Scenario-ending threats' },
];

const AVAILABLE_TRAITS = [
  { id: 'flying', name: 'Flying', description: 'Can fly over obstacles and difficult terrain' },
  { id: 'fast', name: 'Fast', description: '+1 automatic success on attacks' },
  { id: 'slow', name: 'Slow', description: 'Moves at half speed' },
  { id: 'ranged', name: 'Ranged', description: 'Can attack from 2-3 tiles away' },
  { id: 'aquatic', name: 'Aquatic', description: 'Bonus in water tiles, can swim' },
  { id: 'massive', name: 'Massive', description: 'Takes up more space, hard to stop' },
  { id: 'regenerate', name: 'Regenerate', description: 'Heals 1 HP per round' },
  { id: 'ambusher', name: 'Ambusher', description: 'Gets surprise attack bonus' },
  { id: 'scavenger', name: 'Scavenger', description: 'Attracted to corpses' },
  { id: 'elite', name: 'Elite', description: 'Stronger than standard version' },
  { id: 'ethereal', name: 'Ethereal', description: 'Can pass through walls' },
  { id: 'pack_tactics', name: 'Pack Tactics', description: 'Stronger when allies nearby' },
  { id: 'terrifying', name: 'Terrifying', description: 'Extra sanity damage on sight' },
  { id: 'resistant', name: 'Resistant', description: 'Takes reduced damage from ranged' },
  { id: 'vulnerable_light', name: 'Vulnerable to Light', description: 'Takes extra damage from light sources' },
];

const BEHAVIOR_TYPES: { value: CustomMonster['behaviorType']; label: string; description: string }[] = [
  { value: 'aggressive', label: 'Aggressive', description: 'Always moves toward nearest player' },
  { value: 'defensive', label: 'Defensive', description: 'Guards an area, attacks intruders' },
  { value: 'ranged', label: 'Ranged', description: 'Keeps distance, attacks from afar' },
  { value: 'ambusher', label: 'Ambusher', description: 'Hides and waits for opportunity' },
  { value: 'patrol', label: 'Patrol', description: 'Follows a set route' },
  { value: 'swarm', label: 'Swarm', description: 'Groups up with similar monsters' },
];

const SPECIAL_ABILITIES = [
  { id: 'charge', name: 'Charge', description: 'Bonus damage when moving before attack' },
  { id: 'drag_under', name: 'Drag Under', description: 'Can pull targets into water' },
  { id: 'phasing', name: 'Phasing', description: 'Can teleport short distances' },
  { id: 'enrage', name: 'Enrage', description: 'Gets stronger when damaged' },
  { id: 'summon', name: 'Summon', description: 'Can call reinforcements' },
  { id: 'terrify', name: 'Terrify', description: 'Causes sanity damage at range' },
  { id: 'devour', name: 'Devour', description: 'Heals when defeating enemies' },
  { id: 'poison', name: 'Poison', description: 'Attacks cause ongoing damage' },
  { id: 'stun', name: 'Stun', description: 'Attacks can stun targets' },
];

const TERRAIN_TYPES = [
  'any', 'water', 'dark', 'underground', 'outdoor', 'ritual', 'urban', 'nature'
];

// Stat recommendations based on category
const STAT_RECOMMENDATIONS: Record<CustomMonster['category'], { hp: [number, number]; attack: [number, number]; defense: [number, number]; horror: [number, number] }> = {
  minion: { hp: [2, 4], attack: [1, 1], defense: [1, 2], horror: [1, 2] },
  warrior: { hp: [3, 5], attack: [2, 2], defense: [2, 3], horror: [2, 3] },
  elite: { hp: [4, 6], attack: [2, 3], defense: [2, 4], horror: [3, 4] },
  boss: { hp: [6, 10], attack: [3, 4], defense: [3, 5], horror: [4, 6] },
};

// ============================================================================
// COMPONENT
// ============================================================================

const MonsterDesigner: React.FC<MonsterDesignerProps> = ({
  onClose,
  onSave,
  editingMonster
}) => {
  // Form state
  const [name, setName] = useState(editingMonster?.name || '');
  const [typeId, setTypeId] = useState(editingMonster?.type || '');
  const [category, setCategory] = useState<CustomMonster['category']>(editingMonster?.category || 'warrior');
  const [hp, setHp] = useState(editingMonster?.hp || 3);
  const [attackDice, setAttackDice] = useState(editingMonster?.attackDice || 2);
  const [defenseDice, setDefenseDice] = useState(editingMonster?.defenseDice || 2);
  const [horror, setHorror] = useState(editingMonster?.horror || 2);
  const [traits, setTraits] = useState<string[]>(editingMonster?.traits || []);
  const [description, setDescription] = useState(editingMonster?.description || '');
  const [lore, setLore] = useState(editingMonster?.lore || '');
  const [defeatFlavor, setDefeatFlavor] = useState(editingMonster?.defeatFlavor || '');
  const [customImage, setCustomImage] = useState<string | undefined>(editingMonster?.customImage);
  const [imageScale, setImageScale] = useState(editingMonster?.imageScale || 1.0);
  const [behaviorType, setBehaviorType] = useState<CustomMonster['behaviorType']>(editingMonster?.behaviorType || 'aggressive');
  const [preferredTerrain, setPreferredTerrain] = useState(editingMonster?.preferredTerrain || 'any');
  const [specialAbilities, setSpecialAbilities] = useState<string[]>(editingMonster?.specialAbilities || []);

  // UI state
  const [isDragging, setIsDragging] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showLore, setShowLore] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Image handling
  const handleImageUpload = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 1024 * 1024) {
      alert('Image size must be less than 1MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setCustomImage(result);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageUpload(file);
  }, [handleImageUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
  }, [handleImageUpload]);

  const handleRemoveImage = useCallback(() => {
    setCustomImage(undefined);
  }, []);

  // Trait toggling
  const toggleTrait = useCallback((traitId: string) => {
    setTraits(prev =>
      prev.includes(traitId)
        ? prev.filter(t => t !== traitId)
        : [...prev, traitId]
    );
  }, []);

  // Special ability toggling
  const toggleAbility = useCallback((abilityId: string) => {
    setSpecialAbilities(prev =>
      prev.includes(abilityId)
        ? prev.filter(a => a !== abilityId)
        : [...prev, abilityId]
    );
  }, []);

  // Generate type ID from name
  const generateTypeId = useCallback((monsterName: string): string => {
    return monsterName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  }, []);

  // Auto-generate type ID when name changes
  const handleNameChange = useCallback((newName: string) => {
    setName(newName);
    if (!editingMonster) {
      setTypeId(generateTypeId(newName));
    }
  }, [editingMonster, generateTypeId]);

  // Check if stats are within recommendations
  const getStatWarning = (stat: 'hp' | 'attack' | 'defense' | 'horror', value: number): string | null => {
    const range = STAT_RECOMMENDATIONS[category][stat];
    if (value < range[0]) return `Low for ${category}`;
    if (value > range[1]) return `High for ${category}`;
    return null;
  };

  // Save monster
  const handleSave = useCallback(() => {
    if (!name.trim()) {
      alert('Please enter a name for the monster');
      return;
    }

    if (!typeId.trim()) {
      alert('Please enter a type ID for the monster');
      return;
    }

    const monster: CustomMonster = {
      id: editingMonster?.id || `custom_monster_${Date.now()}`,
      type: `custom_${typeId.trim()}`,
      name: name.trim(),
      category,
      hp,
      attackDice,
      defenseDice,
      horror,
      traits,
      description: description.trim(),
      lore: lore.trim() || undefined,
      defeatFlavor: defeatFlavor.trim() || undefined,
      customImage,
      imageScale,
      behaviorType,
      preferredTerrain: preferredTerrain !== 'any' ? preferredTerrain : undefined,
      specialAbilities: specialAbilities.length > 0 ? specialAbilities : undefined,
      createdAt: editingMonster?.createdAt || new Date().toISOString(),
      isCustom: true,
    };

    onSave(monster);
    onClose();
  }, [name, typeId, category, hp, attackDice, defenseDice, horror, traits, description, lore, defeatFlavor, customImage, imageScale, behaviorType, preferredTerrain, specialAbilities, editingMonster, onSave, onClose]);

  const selectedCategoryInfo = CATEGORIES.find(c => c.value === category);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Skull className="w-5 h-5 text-red-400" />
            {editingMonster ? 'Edit Custom Monster' : 'Create Custom Monster'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-3 gap-6">
            {/* Left Column - Basic Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
                Basic Information
              </h3>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Monster Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:border-amber-500 focus:outline-none"
                  placeholder="e.g., Shadow Walker"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Type ID *</label>
                <input
                  type="text"
                  value={typeId}
                  onChange={(e) => setTypeId(e.target.value)}
                  className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:border-amber-500 focus:outline-none font-mono text-sm"
                  placeholder="shadow_walker"
                />
                <p className="text-xs text-slate-500 mt-1">Unique identifier (auto-generated from name)</p>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.value}
                      onClick={() => setCategory(cat.value)}
                      className={`
                        p-2 rounded border text-sm transition-all text-left
                        ${category === cat.value
                          ? 'border-amber-500 bg-amber-500/20'
                          : 'border-slate-600 hover:border-slate-500 bg-slate-700/50'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="text-white font-medium">{cat.label}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{cat.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Description *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:border-amber-500 focus:outline-none h-20 resize-none"
                  placeholder="A creature of pure darkness that stalks the shadows..."
                />
              </div>

              {/* Lore section (collapsible) */}
              <div className="border-t border-slate-700 pt-3">
                <button
                  onClick={() => setShowLore(!showLore)}
                  className="flex items-center gap-2 text-slate-400 hover:text-white text-sm"
                >
                  {showLore ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  Lore & Flavor Text
                </button>

                {showLore && (
                  <div className="mt-3 space-y-3">
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Lore</label>
                      <textarea
                        value={lore}
                        onChange={(e) => setLore(e.target.value)}
                        className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:border-amber-500 focus:outline-none h-16 resize-none text-sm"
                        placeholder="Extended backstory and origin..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Defeat Flavor</label>
                      <input
                        type="text"
                        value={defeatFlavor}
                        onChange={(e) => setDefeatFlavor(e.target.value)}
                        className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:border-amber-500 focus:outline-none text-sm"
                        placeholder="The creature dissolves into mist..."
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Middle Column - Stats & Traits */}
            <div className="space-y-4">
              {/* Stats */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
                  Combat Stats
                </h3>

                <div className="bg-slate-700/50 rounded-lg p-3 space-y-3">
                  {/* HP */}
                  <div className="flex items-center gap-3">
                    <Heart className="w-5 h-5 text-red-400" />
                    <span className="text-slate-300 w-16 text-sm">HP</span>
                    <input
                      type="number"
                      value={hp}
                      onChange={(e) => setHp(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                      className="w-16 bg-slate-600 text-white px-2 py-1 rounded text-center"
                      min={1}
                      max={20}
                    />
                    <input
                      type="range"
                      value={hp}
                      onChange={(e) => setHp(parseInt(e.target.value))}
                      min={1}
                      max={20}
                      className="flex-1 accent-red-500"
                    />
                    {getStatWarning('hp', hp) && (
                      <span className="text-yellow-400 text-xs">{getStatWarning('hp', hp)}</span>
                    )}
                  </div>

                  {/* Attack */}
                  <div className="flex items-center gap-3">
                    <Swords className="w-5 h-5 text-orange-400" />
                    <span className="text-slate-300 w-16 text-sm">Attack</span>
                    <input
                      type="number"
                      value={attackDice}
                      onChange={(e) => setAttackDice(Math.max(1, Math.min(6, parseInt(e.target.value) || 1)))}
                      className="w-16 bg-slate-600 text-white px-2 py-1 rounded text-center"
                      min={1}
                      max={6}
                    />
                    <input
                      type="range"
                      value={attackDice}
                      onChange={(e) => setAttackDice(parseInt(e.target.value))}
                      min={1}
                      max={6}
                      className="flex-1 accent-orange-500"
                    />
                    {getStatWarning('attack', attackDice) && (
                      <span className="text-yellow-400 text-xs">{getStatWarning('attack', attackDice)}</span>
                    )}
                  </div>

                  {/* Defense */}
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-blue-400" />
                    <span className="text-slate-300 w-16 text-sm">Defense</span>
                    <input
                      type="number"
                      value={defenseDice}
                      onChange={(e) => setDefenseDice(Math.max(0, Math.min(6, parseInt(e.target.value) || 0)))}
                      className="w-16 bg-slate-600 text-white px-2 py-1 rounded text-center"
                      min={0}
                      max={6}
                    />
                    <input
                      type="range"
                      value={defenseDice}
                      onChange={(e) => setDefenseDice(parseInt(e.target.value))}
                      min={0}
                      max={6}
                      className="flex-1 accent-blue-500"
                    />
                    {getStatWarning('defense', defenseDice) && (
                      <span className="text-yellow-400 text-xs">{getStatWarning('defense', defenseDice)}</span>
                    )}
                  </div>

                  {/* Horror */}
                  <div className="flex items-center gap-3">
                    <Brain className="w-5 h-5 text-purple-400" />
                    <span className="text-slate-300 w-16 text-sm">Horror</span>
                    <input
                      type="number"
                      value={horror}
                      onChange={(e) => setHorror(Math.max(1, Math.min(6, parseInt(e.target.value) || 1)))}
                      className="w-16 bg-slate-600 text-white px-2 py-1 rounded text-center"
                      min={1}
                      max={6}
                    />
                    <input
                      type="range"
                      value={horror}
                      onChange={(e) => setHorror(parseInt(e.target.value))}
                      min={1}
                      max={6}
                      className="flex-1 accent-purple-500"
                    />
                    {getStatWarning('horror', horror) && (
                      <span className="text-yellow-400 text-xs">{getStatWarning('horror', horror)}</span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-500">
                  Recommended for {category}: HP {STAT_RECOMMENDATIONS[category].hp.join('-')},
                  ATK {STAT_RECOMMENDATIONS[category].attack.join('-')},
                  DEF {STAT_RECOMMENDATIONS[category].defense.join('-')},
                  HOR {STAT_RECOMMENDATIONS[category].horror.join('-')}
                </p>
              </div>

              {/* Traits */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
                  Traits ({traits.length} selected)
                </h3>

                <div className="max-h-40 overflow-y-auto space-y-1 pr-2">
                  {AVAILABLE_TRAITS.map(trait => (
                    <button
                      key={trait.id}
                      onClick={() => toggleTrait(trait.id)}
                      className={`
                        w-full flex items-center gap-2 px-2 py-1.5 rounded text-left transition-colors
                        ${traits.includes(trait.id)
                          ? 'bg-amber-600/30 border border-amber-500'
                          : 'bg-slate-700/50 hover:bg-slate-700 border border-transparent'
                        }
                      `}
                    >
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                        traits.includes(trait.id) ? 'border-amber-500 bg-amber-500' : 'border-slate-500'
                      }`}>
                        {traits.includes(trait.id) && <span className="text-white text-xs">✓</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-white text-sm">{trait.name}</span>
                        <p className="text-xs text-slate-400 truncate">{trait.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Advanced (Behavior) */}
              <div className="border-t border-slate-700 pt-3">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-slate-400 hover:text-white text-sm"
                >
                  {showAdvanced ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  AI Behavior Settings
                </button>

                {showAdvanced && (
                  <div className="mt-3 space-y-3">
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Behavior Type</label>
                      <select
                        value={behaviorType}
                        onChange={(e) => setBehaviorType(e.target.value as CustomMonster['behaviorType'])}
                        className="w-full bg-slate-700 text-white px-2 py-1.5 rounded border border-slate-600 text-sm"
                      >
                        {BEHAVIOR_TYPES.map(bt => (
                          <option key={bt.value} value={bt.value}>{bt.label} - {bt.description}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Preferred Terrain</label>
                      <select
                        value={preferredTerrain}
                        onChange={(e) => setPreferredTerrain(e.target.value)}
                        className="w-full bg-slate-700 text-white px-2 py-1.5 rounded border border-slate-600 text-sm"
                      >
                        {TERRAIN_TYPES.map(t => (
                          <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Special Abilities</label>
                      <div className="grid grid-cols-3 gap-1">
                        {SPECIAL_ABILITIES.map(ability => (
                          <button
                            key={ability.id}
                            onClick={() => toggleAbility(ability.id)}
                            title={ability.description}
                            className={`
                              px-2 py-1 rounded text-xs transition-colors
                              ${specialAbilities.includes(ability.id)
                                ? 'bg-purple-600/50 border border-purple-500 text-white'
                                : 'bg-slate-700/50 hover:bg-slate-700 text-slate-400'
                              }
                            `}
                          >
                            {ability.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Image & Preview */}
            <div className="space-y-4">
              {/* Image Upload */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
                  Monster Graphics (Optional)
                </h3>

                {!customImage ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                      border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                      ${isDragging
                        ? 'border-red-500 bg-red-500/10'
                        : 'border-slate-600 hover:border-slate-500 bg-slate-700/30'
                      }
                    `}
                  >
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-300 text-sm mb-1">Drag & drop image</p>
                    <p className="text-slate-500 text-xs">or click to browse</p>
                    <p className="text-slate-600 text-xs mt-2">Square PNG recommended</p>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="bg-slate-700 rounded-lg p-3 flex items-center justify-center">
                      <img
                        src={customImage}
                        alt="Monster preview"
                        className="max-h-32 rounded"
                        style={{ transform: `scale(${imageScale})` }}
                      />
                    </div>
                    <button
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 bg-red-600 hover:bg-red-500 text-white p-1 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute top-2 left-2 bg-slate-600 hover:bg-slate-500 text-white p-1 rounded"
                    >
                      <FileUp className="w-4 h-4" />
                    </button>

                    <div className="mt-2">
                      <label className="text-xs text-slate-400">Scale: {imageScale.toFixed(1)}x</label>
                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={imageScale}
                        onChange={(e) => setImageScale(Number(e.target.value))}
                        className="w-full accent-red-500"
                      />
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Preview Card */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Preview
                </h3>

                <div
                  className="rounded-lg p-4"
                  style={{
                    backgroundColor: `${selectedCategoryInfo?.color}20`,
                    borderLeft: `4px solid ${selectedCategoryInfo?.color}`
                  }}
                >
                  {/* Monster card preview */}
                  <div className="flex items-start gap-3">
                    {/* Image/Icon */}
                    <div
                      className="w-16 h-16 rounded-lg flex items-center justify-center overflow-hidden"
                      style={{ backgroundColor: selectedCategoryInfo?.color }}
                    >
                      {customImage ? (
                        <img
                          src={customImage}
                          alt={name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Skull className="w-8 h-8 text-white/80" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-white font-bold truncate">
                          {name || 'Unnamed Monster'}
                        </h4>
                        <span
                          className="text-xs px-2 py-0.5 rounded uppercase"
                          style={{
                            backgroundColor: selectedCategoryInfo?.color,
                            color: 'white'
                          }}
                        >
                          {category}
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs mt-1 line-clamp-2">
                        {description || 'No description'}
                      </p>
                    </div>
                  </div>

                  {/* Stats bar */}
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-600/50">
                    <div className="flex items-center gap-1 text-red-400">
                      <Heart className="w-4 h-4" />
                      <span className="font-bold">{hp}</span>
                    </div>
                    <div className="flex items-center gap-1 text-orange-400">
                      <Swords className="w-4 h-4" />
                      <span className="font-bold">{attackDice}</span>
                    </div>
                    <div className="flex items-center gap-1 text-blue-400">
                      <Shield className="w-4 h-4" />
                      <span className="font-bold">{defenseDice}</span>
                    </div>
                    <div className="flex items-center gap-1 text-purple-400">
                      <Brain className="w-4 h-4" />
                      <span className="font-bold">{horror}</span>
                    </div>
                  </div>

                  {/* Traits */}
                  {traits.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {traits.map(traitId => {
                        const trait = AVAILABLE_TRAITS.find(t => t.id === traitId);
                        return trait ? (
                          <span
                            key={traitId}
                            className="text-xs px-2 py-0.5 bg-slate-600/50 rounded text-slate-300"
                          >
                            {trait.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>

                {/* Warnings */}
                {(getStatWarning('hp', hp) || getStatWarning('attack', attackDice) ||
                  getStatWarning('defense', defenseDice) || getStatWarning('horror', horror)) && (
                  <div className="bg-yellow-500/20 border border-yellow-500/50 rounded p-2 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-yellow-300">
                      Some stats are outside the recommended range for {category}s.
                      This may affect game balance.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-700 bg-slate-800/50">
          <div className="text-xs text-slate-500">
            Custom monsters are saved locally and can be used in your scenarios
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-red-600 hover:bg-red-500 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {editingMonster ? 'Update Monster' : 'Create Monster'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonsterDesigner;
