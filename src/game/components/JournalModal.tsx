
import React, { useState } from 'react';
import { BestiaryEntry, EnemyType } from '../types';
import { BESTIARY } from '../constants';
import { X, Book, Skull, HelpCircle, AlertTriangle } from 'lucide-react';

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
                        <div className="border-b-2 border-amber-900/50 pb-4 mb-6">
                            <h3 className="text-4xl font-display text-amber-100">{selectedEnemy.name}</h3>
                            <span className="text-xs font-bold text-amber-600 uppercase tracking-[0.2em]">Class: {selectedEnemy.type}</span>
                        </div>

                        <div className="flex gap-4 mb-8">
                             <div className="bg-black/30 p-4 rounded border border-amber-900/30 flex-1 text-center">
                                 <div className="text-2xl font-bold text-red-500">{selectedEnemy.hp}</div>
                                 <div className="text-[9px] uppercase text-amber-500/50">Vitality</div>
                             </div>
                             <div className="bg-black/30 p-4 rounded border border-amber-900/30 flex-1 text-center">
                                 <div className="text-2xl font-bold text-orange-500">{selectedEnemy.damage}</div>
                                 <div className="text-[9px] uppercase text-amber-500/50">Damage</div>
                             </div>
                             <div className="bg-black/30 p-4 rounded border border-amber-900/30 flex-1 text-center">
                                 <div className="text-2xl font-bold text-purple-500">{selectedEnemy.horror}</div>
                                 <div className="text-[9px] uppercase text-amber-500/50">Horror</div>
                             </div>
                        </div>

                        <div className="prose prose-invert prose-amber max-w-none">
                            <p className="text-lg italic text-amber-200/80 mb-6 border-l-4 border-amber-700 pl-4">
                                "{selectedEnemy.description}"
                            </p>

                            <h4 className="text-sm font-bold uppercase text-amber-500 mb-2 border-b border-amber-900/30 pb-1">Arkham Research Notes</h4>
                            <p className="text-sm text-slate-300 leading-relaxed font-serif">
                                {selectedEnemy.lore}
                            </p>
                        </div>

                        {selectedEnemy.traits && selectedEnemy.traits.length > 0 && (
                             <div className="mt-8 pt-6 border-t border-amber-900/30">
                                 <h4 className="text-sm font-bold uppercase text-amber-500 mb-3 flex items-center gap-2"><AlertTriangle size={14}/> Observed Traits</h4>
                                 <div className="flex gap-2 flex-wrap">
                                     {selectedEnemy.traits.map(trait => (
                                         <span key={trait} className="px-3 py-1 bg-amber-900/30 text-amber-300 text-xs font-bold uppercase rounded border border-amber-800/50">
                                             {trait}
                                         </span>
                                     ))}
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
