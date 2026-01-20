
import React, { useState } from 'react';
import { BestiaryEntry, EnemyType } from '../types';
import { BESTIARY } from '../constants';
import { X, Book, Skull, HelpCircle, AlertTriangle, Swords, Shield, Heart, Brain, Eye } from 'lucide-react';

interface JournalModalProps {
  unlockedIds: string[]; // List of enemy types encountered
  onClose: () => void;
}

const JournalModal: React.FC<JournalModalProps> = ({ unlockedIds, onClose }) => {
  const [selectedEnemy, setSelectedEnemy] = useState<BestiaryEntry | null>(null);

  // Group enemies for sorting
  const allKeys = Object.keys(BESTIARY) as EnemyType[];

  return (
    <div className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-5xl h-[80vh] flex flex-col bg-[#1a120b] border-2 border-amber-800 rounded-lg shadow-2xl relative overflow-hidden">

        {/* Header */}
        <div className="bg-[#2a1d18] p-6 border-b border-amber-900 flex justify-between items-center relative">
            {/* CSS leather texture pattern */}
            <div className="absolute inset-0 opacity-30" style={{
              background: 'repeating-linear-gradient(45deg, rgba(139,90,43,0.1) 0px, transparent 2px, transparent 4px)'
            }}></div>
            <div className="relative z-10 flex items-center gap-4">
                <Book className="text-amber-600" size={32} />
                <div>
                    <h2 className="text-3xl font-display text-amber-100 uppercase tracking-widest">Field Guide</h2>
                    <p className="text-amber-500/60 text-sm font-serif italic">"Notes on the horrors I have witnessed..."</p>
                </div>
            </div>
            <button onClick={onClose} className="relative z-10 text-amber-500 hover:text-white transition-colors">
                <X size={24} />
            </button>
        </div>

        <div className="flex-1 flex overflow-hidden relative">
            {/* Background Texture */}
            {/* CSS aged paper texture pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
              background: 'repeating-linear-gradient(0deg, rgba(245,222,179,0.1) 0px, transparent 1px, transparent 3px)'
            }}></div>

            {/* Left: List */}
            <div className="w-1/3 border-r border-amber-900/50 overflow-y-auto p-4 bg-[#120c08]/80 backdrop-blur-sm">
                <div className="grid grid-cols-2 gap-3">
                    {allKeys.map(key => {
                        const entry = BESTIARY[key];
                        const isUnlocked = unlockedIds.includes(key);

                        return (
                            <button
                                key={key}
                                onClick={() => isUnlocked && setSelectedEnemy(entry)}
                                disabled={!isUnlocked}
                                className={`
                                    aspect-square rounded border-2 flex flex-col items-center justify-center p-2 text-center transition-all
                                    ${selectedEnemy?.type === key
                                        ? 'border-amber-500 bg-amber-900/40'
                                        : 'border-amber-900/30 bg-[#0f0a08]'
                                    }
                                    ${!isUnlocked && 'opacity-50 grayscale cursor-not-allowed'}
                                    hover:border-amber-700
                                `}
                            >
                                {isUnlocked ? (
                                    <>
                                        <Skull size={24} className="text-amber-700 mb-2" />
                                        <span className="text-[10px] font-bold text-amber-200 uppercase leading-tight">{entry.name}</span>
                                    </>
                                ) : (
                                    <>
                                        <HelpCircle size={24} className="text-slate-700 mb-2" />
                                        <span className="text-[10px] font-bold text-slate-700 uppercase leading-tight">Unknown</span>
                                    </>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Right: Details */}
            <div className="flex-1 p-8 overflow-y-auto bg-[#1a120b]/50">
                {selectedEnemy ? (
                    <div className="animate-in slide-in-from-right-4 duration-300">
                        {/* Header with name and classification */}
                        <div className="border-b-2 border-amber-900/50 pb-4 mb-6">
                            <h3 className="text-4xl font-display text-amber-100">{selectedEnemy.name}</h3>
                            <span className="text-xs font-bold text-amber-600 uppercase tracking-[0.2em]">Classification: {selectedEnemy.type}</span>
                        </div>

                        {/* Combat Stats - Color coded */}
                        <div className="grid grid-cols-5 gap-3 mb-8">
                             {/* Vitality - Red */}
                             <div className="bg-red-950/40 p-4 rounded-lg border border-red-900/50 text-center">
                                 <Heart className="mx-auto mb-1 text-red-400" size={18} />
                                 <div className="text-2xl font-bold text-red-400">{selectedEnemy.hp}</div>
                                 <div className="text-[9px] uppercase text-red-500/70 font-bold">Vitality</div>
                             </div>
                             {/* Attack Dice - Orange */}
                             <div className="bg-orange-950/40 p-4 rounded-lg border border-orange-900/50 text-center">
                                 <Swords className="mx-auto mb-1 text-orange-400" size={18} />
                                 <div className="text-2xl font-bold text-orange-400">{selectedEnemy.attackDice}</div>
                                 <div className="text-[9px] uppercase text-orange-500/70 font-bold">Attack</div>
                             </div>
                             {/* Defense Dice - Blue */}
                             <div className="bg-blue-950/40 p-4 rounded-lg border border-blue-900/50 text-center">
                                 <Shield className="mx-auto mb-1 text-blue-400" size={18} />
                                 <div className="text-2xl font-bold text-blue-400">{selectedEnemy.defenseDice}</div>
                                 <div className="text-[9px] uppercase text-blue-500/70 font-bold">Defense</div>
                             </div>
                             {/* Damage - Yellow */}
                             <div className="bg-yellow-950/40 p-4 rounded-lg border border-yellow-900/50 text-center">
                                 <Skull className="mx-auto mb-1 text-yellow-400" size={18} />
                                 <div className="text-2xl font-bold text-yellow-400">{selectedEnemy.damage}</div>
                                 <div className="text-[9px] uppercase text-yellow-500/70 font-bold">Damage</div>
                             </div>
                             {/* Horror - Purple */}
                             <div className="bg-purple-950/40 p-4 rounded-lg border border-purple-900/50 text-center">
                                 <Brain className="mx-auto mb-1 text-purple-400" size={18} />
                                 <div className="text-2xl font-bold text-purple-400">{selectedEnemy.horror}</div>
                                 <div className="text-[9px] uppercase text-purple-500/70 font-bold">Horror</div>
                             </div>
                        </div>

                        {/* Description - Amber/Gold quote style */}
                        <div className="mb-6">
                            <h4 className="text-sm font-bold uppercase text-amber-500 mb-2 flex items-center gap-2">
                                <Eye size={14} className="text-amber-500" />
                                Field Observation
                            </h4>
                            <p className="text-lg italic text-amber-200/90 border-l-4 border-amber-600 pl-4 bg-amber-950/20 py-3 rounded-r">
                                "{selectedEnemy.description}"
                            </p>
                        </div>

                        {/* Lore/Research Notes - Cyan/Teal */}
                        <div className="mb-6">
                            <h4 className="text-sm font-bold uppercase text-cyan-400 mb-2 flex items-center gap-2">
                                <Book size={14} className="text-cyan-400" />
                                Arkham Research Notes
                            </h4>
                            <p className="text-sm text-cyan-100/80 leading-relaxed font-serif bg-cyan-950/20 p-4 rounded-lg border border-cyan-900/30">
                                {selectedEnemy.lore}
                            </p>
                        </div>

                        {/* Defeat Flavor - Gray/muted */}
                        {selectedEnemy.defeatFlavor && (
                            <div className="mb-6">
                                <h4 className="text-sm font-bold uppercase text-slate-400 mb-2 flex items-center gap-2">
                                    <Skull size={14} className="text-slate-400" />
                                    Upon Defeat
                                </h4>
                                <p className="text-sm italic text-slate-400/80 leading-relaxed bg-slate-900/30 p-3 rounded border-l-2 border-slate-600">
                                    {selectedEnemy.defeatFlavor}
                                </p>
                            </div>
                        )}

                        {/* Traits - Color coded badges */}
                        {selectedEnemy.traits && selectedEnemy.traits.length > 0 && (
                             <div className="mt-6 pt-6 border-t border-amber-900/30">
                                 <h4 className="text-sm font-bold uppercase text-rose-400 mb-3 flex items-center gap-2">
                                     <AlertTriangle size={14} className="text-rose-400" />
                                     Observed Traits
                                 </h4>
                                 <div className="flex gap-2 flex-wrap">
                                     {selectedEnemy.traits.map(trait => {
                                         // Color code traits based on type
                                         const getTraitClasses = (t: string) => {
                                             if (['Flying', 'Fast', 'Aquatic'].includes(t)) {
                                                 return 'bg-sky-900/40 text-sky-300 border-sky-700/50';
                                             } else if (['Massive', 'Elite', 'Slow'].includes(t)) {
                                                 return 'bg-violet-900/40 text-violet-300 border-violet-700/50';
                                             } else if (['Regenerate', 'Ambusher', 'Ranged'].includes(t)) {
                                                 return 'bg-rose-900/40 text-rose-300 border-rose-700/50';
                                             } else if (['Scavenger'].includes(t)) {
                                                 return 'bg-lime-900/40 text-lime-300 border-lime-700/50';
                                             }
                                             return 'bg-amber-900/40 text-amber-300 border-amber-700/50';
                                         };

                                         return (
                                             <span
                                                 key={trait}
                                                 className={`px-3 py-1.5 text-xs font-bold uppercase rounded-lg border shadow-sm ${getTraitClasses(trait)}`}
                                             >
                                                 {trait}
                                             </span>
                                         );
                                     })}
                                 </div>
                             </div>
                        )}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-amber-900/30">
                        <Book size={64} className="mb-4" />
                        <p className="text-xl font-display uppercase tracking-widest">Select an Entry</p>
                    </div>
                )}
            </div>

        </div>
      </div>
    </div>
  );
};

export default JournalModal;
