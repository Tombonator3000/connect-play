import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Item, Spell, Enemy, EnemyType } from '../types';
import { BESTIARY } from '../constants';
import { Sword, Search, Zap, ShieldCheck, Cross, FileQuestion, Eye, Skull, Brain, Swords, BookOpen } from 'lucide-react';

interface ItemTooltipProps {
  item: Item;
  children: React.ReactNode;
}

export const ItemTooltip: React.FC<ItemTooltipProps> = ({ item, children }) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'weapon': return 'text-red-400';
      case 'tool': return 'text-green-400';
      case 'relic': return 'text-purple-400';
      case 'armor': return 'text-blue-400';
      case 'consumable': return 'text-yellow-400';
      default: return 'text-muted-foreground';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'weapon': return <Sword size={12} />;
      case 'tool': return <Search size={12} />;
      case 'relic': return <Zap size={12} />;
      case 'armor': return <ShieldCheck size={12} />;
      case 'consumable': return <Cross size={12} />;
      default: return <FileQuestion size={12} />;
    }
  };

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="max-w-64 bg-secondary border-2 border-primary/50 p-0 shadow-[var(--shadow-doom)]"
        >
          <div className="bg-primary/20 px-3 py-2 border-b border-primary/30">
            <div className="flex items-center gap-2">
              <span className={getTypeColor(item.type)}>{getTypeIcon(item.type)}</span>
              <span className="font-bold text-sm text-foreground">{item.name}</span>
            </div>
            <div className={`text-[10px] uppercase tracking-wider ${getTypeColor(item.type)}`}>
              {item.type}
            </div>
          </div>
          <div className="p-3 space-y-2">
            {item.effect && (
              <p className="text-xs text-muted-foreground italic">{item.effect}</p>
            )}
            <div className="flex flex-wrap gap-2 text-[10px]">
              {item.bonus !== undefined && item.bonus !== 0 && (
                <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded border border-green-500/30">
                  +{item.bonus} Bonus
                </span>
              )}
              {item.cost !== undefined && (
                <span className="bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded border border-yellow-500/30">
                  Cost: {item.cost} AP
                </span>
              )}
              {item.statModifier && (
                <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30">
                  +{item.statModifier}
                </span>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

interface SpellTooltipProps {
  spell: Spell;
  children: React.ReactNode;
}

export const SpellTooltip: React.FC<SpellTooltipProps> = ({ spell, children }) => {
  const getEffectColor = (effectType: string) => {
    switch (effectType) {
      case 'damage': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'heal': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'sanity': return 'text-purple-400 bg-purple-500/20 border-purple-500/30';
      case 'buff': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'debuff': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      default: return 'text-muted-foreground bg-muted/20 border-muted/30';
    }
  };

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="max-w-64 bg-secondary border-2 border-sanity/50 p-0 shadow-[0_0_20px_hsla(280,60%,55%,0.3)]"
        >
          <div className="bg-sanity/20 px-3 py-2 border-b border-sanity/30">
            <div className="flex items-center justify-between gap-3">
              <span className="font-bold text-sm text-foreground">{spell.name}</span>
              <span className="flex items-center gap-1 text-insight text-xs font-bold bg-background/40 px-2 py-0.5 rounded border border-insight/30">
                <Eye size={10} /> {spell.cost}
              </span>
            </div>
          </div>
          <div className="p-3 space-y-2">
            <p className="text-xs text-muted-foreground italic">{spell.description}</p>
            <div className="flex flex-wrap gap-2 text-[10px]">
              <span className={`px-2 py-0.5 rounded border ${getEffectColor(spell.effectType)}`}>
                {spell.effectType}: {spell.value}
              </span>
              {spell.range && (
                <span className="bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/30">
                  Range: {spell.range}
                </span>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

interface EnemyTooltipProps {
  enemy: Enemy;
  children: React.ReactNode;
}

export const EnemyTooltip: React.FC<EnemyTooltipProps> = ({ enemy, children }) => {
  const info = BESTIARY[enemy.type];
  
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="max-w-72 bg-red-950/95 border-2 border-primary/50 p-0 shadow-[var(--shadow-doom)]"
        >
          <div className="bg-red-900/30 px-3 py-2 border-b border-primary/30">
            <div className="flex items-center gap-2">
              <Skull size={14} className="text-primary" />
              <span className="font-bold text-sm text-foreground uppercase tracking-wide">{enemy.name}</span>
            </div>
            <div className="text-[10px] text-primary/80 uppercase tracking-wider">
              {enemy.type.replace('_', ' ')}
            </div>
          </div>
          <div className="p-3 space-y-3">
            <div className="flex gap-3">
              <div className="flex items-center gap-1.5 bg-background/30 px-2 py-1 rounded border border-red-900/30">
                <Swords size={12} className="text-primary" />
                <span className="text-xs font-bold text-foreground">{enemy.damage}</span>
                <span className="text-[9px] text-muted-foreground">DMG</span>
              </div>
              <div className="flex items-center gap-1.5 bg-background/30 px-2 py-1 rounded border border-secondary/30">
                <Brain size={12} className="text-sanity" />
                <span className="text-xs font-bold text-foreground">{enemy.horror}</span>
                <span className="text-[9px] text-muted-foreground">HOR</span>
              </div>
            </div>
            
            {enemy.traits && enemy.traits.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {enemy.traits.map(trait => (
                  <span key={trait} className="px-1.5 py-0.5 bg-red-900/30 text-red-300 text-[9px] font-bold uppercase rounded border border-red-800/50">
                    {trait}
                  </span>
                ))}
              </div>
            )}
            
            {info && (
              <div className="pt-2 border-t border-primary/20">
                <div className="flex items-center gap-1 text-[9px] text-primary uppercase tracking-wider mb-1">
                  <BookOpen size={10} />
                  <span>Lore</span>
                </div>
                <p className="text-[11px] text-muted-foreground italic leading-relaxed line-clamp-3">
                  "{info.description}"
                </p>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};