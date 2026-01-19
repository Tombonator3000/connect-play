import React from 'react';
import { Player, Item } from '../types';
import { Heart, Brain, Eye, Star, Backpack, Sword, Search, Zap, ShieldCheck, Cross, FileQuestion, User } from 'lucide-react';

interface CharacterPanelProps {
  player: Player | null;
}

const CharacterPanel: React.FC<CharacterPanelProps> = ({ player }) => {
  if (!player) return null;

  const hpPercent = (player.hp / player.maxHp) * 100;
  const sanPercent = (player.sanity / player.maxSanity) * 100;

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'weapon': return <Sword size={18} />;
      case 'tool': return <Search size={18} />;
      case 'relic': return <Zap size={18} />;
      case 'armor': return <ShieldCheck size={18} />;
      case 'consumable': return <Cross size={18} />;
      default: return <FileQuestion size={18} />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-leather text-sepia font-serif relative overflow-hidden border-2 border-primary rounded-2xl shadow-[var(--shadow-doom)]">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/leather.png')] opacity-30 pointer-events-none"></div>
      <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.8)] pointer-events-none"></div>

      <div className="p-6 pb-4 border-b-2 border-border relative z-10 shrink-0">
        <div className="flex gap-4 items-start">
          <div className="w-20 h-20 rounded-xl border-4 border-leather shadow-lg overflow-hidden bg-background shrink-0">
            <div className="w-full h-full flex items-center justify-center text-muted-foreground"><User size={40} /></div>
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <h2 className="text-2xl font-display italic text-parchment tracking-wide leading-none truncate">{player.name}</h2>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mt-2">{player.id}</div>
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

        <div className="pt-4 border-t-2 border-border">
          <h3 className="text-[10px] font-bold text-parchment uppercase tracking-widest mb-3 flex items-center gap-2">
            <Backpack size={12} /> Inventory ({player.inventory.length}/6)
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 6 }).map((_, index) => {
              const item = player.inventory[index];
              return (
                <div key={index} className={`aspect-square border-2 rounded-lg flex items-center justify-center transition-all ${item ? 'bg-leather border-parchment text-parchment' : 'bg-background/40 border-border opacity-30'}`}>
                  {item && getItemIcon(item.type)}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterPanel;
