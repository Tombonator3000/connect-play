import React, { useState } from 'react';
import { Heart, Brain, Eye, Sword, Shield, Zap, BookOpen, Target, Footprints, X, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Character, CharacterType, Player, Spell, createEmptyInventory } from '../types';
import { CHARACTERS, SPELLS, OCCULTIST_SPELLS } from '../constants';
import { getCharacterPortrait, getCharacterDisplayName } from '../utils/characterAssets';

interface CharacterSelectionScreenProps {
  selectedPlayers: Player[];
  onSelectCharacter: (player: Player) => void;
  onDeselectCharacter: (characterType: CharacterType) => void;
  onConfirm: () => void;
  onBack: () => void;
  onOpenSpellSelection: (characterType: CharacterType) => void;
}

// Detailed character information for display
const CHARACTER_DETAILS: Record<CharacterType, {
  subtitle: string;
  backstory: string;
  playstyle: string;
  strengths: string[];
  weaknesses: string[];
  weapons: string[];
}> = {
  veteran: {
    subtitle: 'Hardened Soldier',
    backstory: 'A survivor of the Great War, haunted by what he saw in the trenches. Now he hunts different monsters.',
    playstyle: 'Front-line fighter. Best for dealing damage and protecting weaker party members.',
    strengths: ['Highest HP (6)', 'Can use ALL weapons', '+1 melee attack die', 'Fearless (immune to first Horror)'],
    weaknesses: ['Low Sanity (3)', 'Weak intellect', 'No magic abilities'],
    weapons: ['All weapons available']
  },
  detective: {
    subtitle: 'Private Investigator',
    backstory: 'Former police officer, now works alone. The cases the police won\'t touch - those are his specialty.',
    playstyle: 'Primary investigator. Excels at finding clues and surviving combat.',
    strengths: ['High defense (3 dice)', '+1 Investigation die', 'Auto-finds hidden doors', 'Balanced stats'],
    weaknesses: ['Cannot use Tommy Gun', 'Average offense'],
    weapons: ['All except Tommy Gun']
  },
  professor: {
    subtitle: 'Miskatonic Scholar',
    backstory: 'Professor of ancient languages at Miskatonic University. His research led him to forbidden knowledge.',
    playstyle: 'Support and puzzle solver. Uses scholarly magic and knowledge to aid the party.',
    strengths: ['Highest Sanity (6)', 'Read occult safely', '+2 puzzle dice', '2 scholarly spells'],
    weaknesses: ['Lowest HP (3)', 'Very limited weapons', 'Weak in combat'],
    weapons: ['Knife, Derringer only']
  },
  occultist: {
    subtitle: 'Ritual Master',
    backstory: 'A practitioner of the forbidden arts. She walks a thin line between power and madness.',
    playstyle: 'Magic damage dealer. Choose 3 spells each scenario to customize your role.',
    strengths: ['Highest Willpower (5)', 'Ritual Master ability', 'Pick 3 spells per scenario', 'Can banish spirits'],
    weaknesses: ['Low HP (3)', 'Limited weapons', 'Relies on Insight for spells'],
    weapons: ['Knife, Revolver only']
  },
  journalist: {
    subtitle: 'Intrepid Reporter',
    backstory: 'A curious soul seeking the truth behind Arkham\'s dark secrets. Her camera captures more than she bargained for.',
    playstyle: 'Scout and escape artist. Great mobility and can flee dangerous situations.',
    strengths: ['+1 Movement', 'Escape Artist (flee without Horror)', 'High Agility', 'Good Intellect'],
    weaknesses: ['Average combat', 'Cannot use heavy weapons'],
    weapons: ['All except Shotgun, Tommy Gun']
  },
  doctor: {
    subtitle: 'Medical Professional',
    backstory: 'A physician who has seen too much death. Now she fights to save lives in ways medicine cannot explain.',
    playstyle: 'Primary healer. Keep the party alive and healthy.',
    strengths: ['Heals 2 HP instead of 1', 'Starts with free heal item', 'Good Willpower', 'Decent Sanity'],
    weaknesses: ['Low attack', 'Very limited weapons', 'Not combat-focused'],
    weapons: ['Knife, Derringer only']
  }
};

// Attribute bar component
const AttributeBar: React.FC<{ value: number; maxValue: number; label: string; color: string }> = ({ value, maxValue, label, color }) => (
  <div className="flex items-center gap-2">
    <span className="text-xs uppercase tracking-wider text-muted-foreground w-16">{label}</span>
    <div className="flex-1 h-2 bg-background/50 rounded-full overflow-hidden">
      <div
        className={`h-full ${color} transition-all duration-300`}
        style={{ width: `${(value / maxValue) * 100}%` }}
      />
    </div>
    <span className="text-xs font-bold w-4">{value}</span>
  </div>
);

const CharacterSelectionScreen: React.FC<CharacterSelectionScreenProps> = ({
  selectedPlayers,
  onSelectCharacter,
  onDeselectCharacter,
  onConfirm,
  onBack,
  onOpenSpellSelection
}) => {
  const [focusedCharacter, setFocusedCharacter] = useState<CharacterType>('veteran');
  const characterTypes = Object.keys(CHARACTERS) as CharacterType[];

  const isSelected = (type: CharacterType) => selectedPlayers.some(p => p.id === type);
  const character = CHARACTERS[focusedCharacter];
  const details = CHARACTER_DETAILS[focusedCharacter];

  const handleSelectCharacter = (type: CharacterType) => {
    if (isSelected(type)) {
      onDeselectCharacter(type);
      return;
    }

    // For Occultist, trigger spell selection
    if (type === 'occultist') {
      onOpenSpellSelection(type);
      return;
    }

    const char = CHARACTERS[type];
    // Professor gets scholarly spells
    const characterSpells = type === 'professor'
      ? SPELLS.filter(s => s.id === 'reveal' || s.id === 'mend')
      : [];

    const player: Player = {
      ...char,
      position: { q: 0, r: 0 },
      inventory: createEmptyInventory(),
      spells: characterSpells,
      selectedSpells: undefined,
      actions: 2,
      maxActions: 2,  // Base actions for non-legacy players
      isDead: false,
      madness: [],
      activeMadness: null,
      traits: []
    };

    onSelectCharacter(player);
  };

  const navigateCharacter = (direction: 'prev' | 'next') => {
    const currentIndex = characterTypes.indexOf(focusedCharacter);
    const newIndex = direction === 'next'
      ? (currentIndex + 1) % characterTypes.length
      : (currentIndex - 1 + characterTypes.length) % characterTypes.length;
    setFocusedCharacter(characterTypes[newIndex]);
  };

  return (
    <div className="fixed inset-0 z-[70] bg-background flex">
      {/* Left side - Character portraits */}
      <div className="w-1/3 border-r border-border p-6 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm"
          >
            <ChevronLeft size={16} />
            Back
          </button>
          <h2 className="text-xl font-display text-primary uppercase tracking-widest">Choose Investigator</h2>
        </div>

        {/* Character grid */}
        <div className="grid grid-cols-2 gap-4 flex-1">
          {characterTypes.map(type => {
            const char = CHARACTERS[type];
            const selected = isSelected(type);
            const focused = focusedCharacter === type;

            return (
              <div
                key={type}
                onClick={() => setFocusedCharacter(type)}
                onDoubleClick={() => handleSelectCharacter(type)}
                className={`relative cursor-pointer rounded-xl overflow-hidden transition-all duration-300 ${
                  focused ? 'ring-2 ring-primary scale-105 z-10' : ''
                } ${selected ? 'ring-2 ring-green-500' : ''}`}
              >
                {/* Portrait */}
                <div className="aspect-[3/4] relative">
                  <img
                    src={getCharacterPortrait(type)}
                    alt={char.name}
                    className={`w-full h-full object-cover transition-all ${
                      selected ? 'brightness-100' : focused ? 'brightness-90' : 'brightness-50'
                    }`}
                  />

                  {/* Selection overlay */}
                  {selected && (
                    <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                      <div className="bg-green-500 rounded-full p-2">
                        <Check size={24} className="text-white" />
                      </div>
                    </div>
                  )}

                  {/* Name banner */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3">
                    <h3 className="text-sm font-bold text-white truncate">{char.name}</h3>
                    <div className="flex gap-2 text-xs">
                      <span className="text-red-400 flex items-center gap-1">
                        <Heart size={10} /> {char.hp}
                      </span>
                      <span className="text-purple-400 flex items-center gap-1">
                        <Brain size={10} /> {char.sanity}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selection count */}
        <div className="mt-4 p-4 bg-card rounded-xl border border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Selected: {selectedPlayers.length}/4</span>
            <button
              disabled={selectedPlayers.length === 0}
              onClick={onConfirm}
              className={`px-6 py-2 rounded-lg font-bold uppercase tracking-wider transition-all ${
                selectedPlayers.length > 0
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
            >
              Begin Investigation
            </button>
          </div>
        </div>
      </div>

      {/* Right side - Character details */}
      <div className="flex-1 p-8 overflow-y-auto">
        {/* Navigation arrows */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigateCharacter('prev')}
            className="p-2 rounded-lg bg-card border border-border hover:border-primary transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-4xl font-display text-primary uppercase tracking-[0.3em]">
            {character.name}
          </h1>
          <button
            onClick={() => navigateCharacter('next')}
            className="p-2 rounded-lg bg-card border border-border hover:border-primary transition-colors"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Large portrait and info */}
        <div className="grid grid-cols-2 gap-8">
          {/* Portrait column */}
          <div>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl mb-6">
              <img
                src={getCharacterPortrait(focusedCharacter)}
                alt={character.name}
                className="w-full aspect-[3/4] object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6">
                <p className="text-xl text-primary font-display uppercase tracking-wider">{details.subtitle}</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => handleSelectCharacter(focusedCharacter)}
                className={`flex-1 py-4 rounded-xl font-bold uppercase tracking-wider transition-all ${
                  isSelected(focusedCharacter)
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                }`}
              >
                {isSelected(focusedCharacter) ? (
                  <><X size={20} className="inline mr-2" /> Remove</>
                ) : (
                  <><Check size={20} className="inline mr-2" /> Select</>
                )}
              </button>
            </div>
          </div>

          {/* Stats and info column */}
          <div className="space-y-6">
            {/* Backstory */}
            <div className="bg-card p-6 rounded-xl border border-border">
              <h3 className="text-sm uppercase tracking-wider text-primary mb-3 flex items-center gap-2">
                <BookOpen size={14} /> Background
              </h3>
              <p className="text-sm text-muted-foreground italic leading-relaxed">
                "{details.backstory}"
              </p>
            </div>

            {/* Combat stats */}
            <div className="bg-card p-6 rounded-xl border border-border">
              <h3 className="text-sm uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
                <Sword size={14} /> Combat Stats
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                  <Heart className="text-red-400" size={20} />
                  <div>
                    <div className="text-xs text-muted-foreground">Health</div>
                    <div className="text-xl font-bold">{character.hp}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                  <Brain className="text-purple-400" size={20} />
                  <div>
                    <div className="text-xs text-muted-foreground">Sanity</div>
                    <div className="text-xl font-bold">{character.sanity}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                  <Sword className="text-red-500" size={20} />
                  <div>
                    <div className="text-xs text-muted-foreground">Attack Dice</div>
                    <div className="text-xl font-bold">{character.baseAttackDice}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                  <Shield className="text-blue-400" size={20} />
                  <div>
                    <div className="text-xs text-muted-foreground">Defense Dice</div>
                    <div className="text-xl font-bold">{character.baseDefenseDice}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Attributes */}
            <div className="bg-card p-6 rounded-xl border border-border">
              <h3 className="text-sm uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
                <Target size={14} /> Attributes
              </h3>
              <div className="space-y-3">
                <AttributeBar value={character.attributes.strength} maxValue={5} label="STR" color="bg-red-500" />
                <AttributeBar value={character.attributes.agility} maxValue={5} label="AGI" color="bg-green-500" />
                <AttributeBar value={character.attributes.intellect} maxValue={5} label="INT" color="bg-blue-500" />
                <AttributeBar value={character.attributes.willpower} maxValue={5} label="WIL" color="bg-purple-500" />
              </div>
            </div>

            {/* Playstyle */}
            <div className="bg-card p-6 rounded-xl border border-border">
              <h3 className="text-sm uppercase tracking-wider text-primary mb-3 flex items-center gap-2">
                <Footprints size={14} /> Playstyle
              </h3>
              <p className="text-sm text-foreground leading-relaxed">
                {details.playstyle}
              </p>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-950/30 p-4 rounded-xl border border-green-800">
                <h3 className="text-sm uppercase tracking-wider text-green-400 mb-3">Strengths</h3>
                <ul className="space-y-2">
                  {details.strengths.map((str, i) => (
                    <li key={i} className="text-xs text-green-300 flex items-start gap-2">
                      <Check size={12} className="mt-0.5 flex-shrink-0" />
                      {str}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-red-950/30 p-4 rounded-xl border border-red-800">
                <h3 className="text-sm uppercase tracking-wider text-red-400 mb-3">Weaknesses</h3>
                <ul className="space-y-2">
                  {details.weaknesses.map((weak, i) => (
                    <li key={i} className="text-xs text-red-300 flex items-start gap-2">
                      <X size={12} className="mt-0.5 flex-shrink-0" />
                      {weak}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Weapons */}
            <div className="bg-card p-4 rounded-xl border border-border">
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Available Weapons</h3>
              <p className="text-sm text-foreground">{details.weapons.join(', ')}</p>
            </div>

            {/* Special ability */}
            <div className="bg-primary/10 p-4 rounded-xl border border-primary">
              <h3 className="text-sm uppercase tracking-wider text-primary mb-2 flex items-center gap-2">
                <Zap size={14} /> Special Ability
              </h3>
              <p className="text-sm text-foreground">{character.special}</p>
            </div>

            {/* Occultist spell note */}
            {focusedCharacter === 'occultist' && (
              <div className="bg-purple-950/30 p-4 rounded-xl border border-purple-700">
                <h3 className="text-sm uppercase tracking-wider text-purple-400 mb-2">Spell Selection</h3>
                <p className="text-xs text-purple-300">
                  The Occultist can choose 3 spells at the start of each scenario from a pool of {OCCULTIST_SPELLS.length} available spells.
                  This allows you to customize your role for each mission.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterSelectionScreen;
