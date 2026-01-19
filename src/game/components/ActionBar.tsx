import React, { useState } from 'react';
import { Search, Sword, Heart, Package, LockOpen, Hammer, Wind, Zap, X, Eye, User, BookOpen } from 'lucide-react';
import { ContextAction, Spell } from '../types';
import { SpellTooltip } from './ItemTooltip';

interface ActionBarProps {
  onAction: (action: string, payload?: any) => void;
  actionsRemaining: number;
  isInvestigatorPhase: boolean;
  contextAction?: ContextAction | null;
  spells: Spell[];
  activeSpell: Spell | null;
  onToggleCharacter: () => void;
  showCharacter: boolean;
  onToggleInfo: () => void;
  showInfo: boolean;
}

const ActionBar: React.FC<ActionBarProps> = ({
  onAction, actionsRemaining, isInvestigatorPhase, contextAction, spells, activeSpell,
  onToggleCharacter, showCharacter, onToggleInfo, showInfo
}) => {
  const [showSpellMenu, setShowSpellMenu] = useState(false);
  const disabled = actionsRemaining <= 0 || !isInvestigatorPhase;

  const standardActions = [
    { id: 'investigate', label: 'Investigate', icon: Search, color: 'hover:text-green-400' },
    { id: 'attack', label: 'Attack', icon: Sword, color: 'hover:text-red-400' },
    { id: 'flee', label: 'Flee', icon: Wind, color: 'hover:text-cyan-400' },
    { id: 'rest', label: 'Rest', icon: Heart, color: 'hover:text-pink-400' },
    { id: 'item', label: 'Item', icon: Package, color: 'hover:text-yellow-400' }
  ];

  const getContextIcon = (type: string) => {
    switch (type) {
      case 'strength': return Hammer;
      case 'agility': return Wind;
      case 'insight': return LockOpen;
      default: return Hammer;
    }
  };

  return (
    <div className="flex items-center gap-2 md:gap-4 overflow-x-auto max-w-[90vw] md:max-w-none pb-1 md:pb-0 hide-scrollbar relative">
      <button
        onClick={onToggleCharacter}
        className={`group flex flex-col items-center justify-center w-14 h-14 md:w-20 md:h-20 rounded border transition-all duration-200 shrink-0 ${showCharacter ? 'bg-accent/20 border-accent text-accent' : 'bg-card border-border text-muted-foreground hover:border-accent hover:text-accent'}`}
      >
        <User size={20} className="mb-1" />
        <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-wider hidden md:block">Char</span>
      </button>

      <div className="w-px h-12 bg-border mx-1"></div>

      {contextAction ? (
        <button
          onClick={() => onAction('interact')}
          disabled={disabled}
          className={`
            flex items-center gap-2 md:gap-4 px-4 py-2 md:px-8 md:py-4 rounded-xl border-2
            ${disabled ? 'border-border bg-card opacity-50' : 'border-accent bg-accent/20 hover:bg-accent/40 shadow-[var(--shadow-glow)]'}
            transition-all duration-300 animate-in zoom-in shrink-0
          `}
        >
          {React.createElement(getContextIcon(contextAction.iconType), { className: "text-accent w-6 h-6 md:w-8 md:h-8" })}
          <div className="text-left">
            <div className="text-xs md:text-sm font-bold text-foreground uppercase tracking-widest">{contextAction.label}</div>
            <div className="text-[9px] md:text-[10px] text-accent/80">Diff: {contextAction.difficulty}+</div>
          </div>
        </button>
      ) : (
        <div className="flex items-center gap-1 md:gap-2">
          {standardActions.map(action => (
            <button
              key={action.id}
              disabled={disabled}
              onClick={() => onAction(action.id)}
              className={`
                group flex flex-col items-center justify-center w-14 h-14 md:w-20 md:h-20 rounded border
                ${disabled ? 'opacity-30 border-border grayscale cursor-not-allowed' : 'border-border hover:border-primary bg-card'}
                transition-all duration-200 shrink-0
              `}
            >
              <action.icon className={`mb-0 md:mb-1 transition-colors ${action.color} w-5 h-5 md:w-6 md:h-6`} />
              <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-wider text-muted-foreground group-hover:text-foreground hidden md:block">{action.label}</span>
            </button>
          ))}

          <div className="relative">
            {showSpellMenu && !disabled && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-secondary border-2 border-sanity rounded-lg shadow-[0_0_30px_hsla(280,60%,55%,0.5)] w-56 overflow-hidden z-50 animate-in slide-in-from-bottom-4 duration-200">
                <div className="bg-secondary/40 p-2 text-center text-xs font-bold text-sanity border-b border-sanity/30 uppercase tracking-widest">
                  Grimoire
                </div>
                <div className="flex flex-col max-h-60 overflow-y-auto">
                  {spells.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground italic text-xs">No spells memorized.</div>
                  ) : (
                    spells.map(spell => (
                      <SpellTooltip key={spell.id} spell={spell}>
                        <button
                          onClick={() => {
                            onAction('cast', spell);
                            setShowSpellMenu(false);
                          }}
                          className="text-left p-3 hover:bg-secondary/30 border-b border-secondary/20 group transition-colors w-full"
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-secondary-foreground font-bold text-xs uppercase group-hover:text-foreground">{spell.name}</span>
                            <span className="text-[10px] bg-background/40 px-2 py-0.5 rounded text-insight font-bold border border-insight/30 flex items-center gap-1">
                              <Eye size={10} /> {spell.cost}
                            </span>
                          </div>
                          <div className="text-[10px] text-muted-foreground italic line-clamp-2">{spell.description}</div>
                        </button>
                      </SpellTooltip>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeSpell ? (
              <button
                onClick={() => onAction('cancel_cast')}
                className="group flex flex-col items-center justify-center w-14 h-14 md:w-20 md:h-20 rounded border ml-1 md:ml-2 border-primary bg-primary/20 hover:bg-primary/40 animate-pulse transition-all duration-200 shrink-0 shadow-[var(--shadow-doom)]"
              >
                <X className="mb-0 md:mb-1 text-primary w-5 h-5 md:w-6 md:h-6" />
                <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-wider text-primary hidden md:block">Cancel</span>
              </button>
            ) : (
              spells.length > 0 && (
                <button
                  disabled={disabled}
                  onClick={() => setShowSpellMenu(!showSpellMenu)}
                  className={`
                    group flex flex-col items-center justify-center w-14 h-14 md:w-20 md:h-20 rounded border ml-1 md:ml-2
                    ${disabled ? 'opacity-30 border-border grayscale cursor-not-allowed' : 'border-sanity hover:border-sanity/70 bg-secondary/20'}
                    transition-all duration-200 shrink-0 ${showSpellMenu ? 'bg-secondary/40 border-sanity shadow-[0_0_15px_hsla(280,60%,55%,0.3)]' : ''}
                  `}
                >
                  <Zap className="mb-0 md:mb-1 transition-colors text-sanity group-hover:text-sanity/70 w-5 h-5 md:w-6 md:h-6" />
                  <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-wider text-sanity group-hover:text-foreground hidden md:block">Cast</span>
                </button>
              )
            )}
          </div>
        </div>
      )}

      <div className="ml-1 md:ml-2 pl-2 md:pl-4 border-l border-border flex flex-col justify-center items-center gap-1 md:gap-2 shrink-0">
        <div className="text-[8px] md:text-[9px] text-muted-foreground uppercase font-bold tracking-[0.2em] mb-0 md:mb-1">AP</div>
        <div className="flex gap-1 md:gap-2">
          {[1, 2].map(i => {
            const isActive = i <= actionsRemaining;
            return (
              <div
                key={i}
                className={`
                  w-3 h-3 md:w-5 md:h-5 rounded-full border-2 transition-all duration-500 flex items-center justify-center
                  ${isActive
                    ? 'bg-primary border-foreground shadow-[var(--shadow-doom)] scale-110'
                    : 'bg-transparent border-border scale-90 opacity-40'}
                `}
              >
                {isActive && <div className="w-1 md:w-1.5 h-1 md:h-1.5 bg-foreground rounded-full animate-pulse"></div>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="w-px h-12 bg-border mx-1"></div>

      <button
        onClick={onToggleInfo}
        className={`group flex flex-col items-center justify-center w-14 h-14 md:w-20 md:h-20 rounded border transition-all duration-200 shrink-0 ${showInfo ? 'bg-muted border-foreground text-foreground' : 'bg-card border-border text-muted-foreground hover:border-muted-foreground hover:text-muted-foreground'}`}
      >
        <BookOpen size={20} className="mb-1" />
        <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-wider hidden md:block">Log</span>
      </button>
    </div>
  );
};

export default ActionBar;
