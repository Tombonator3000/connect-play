import React, { useState } from 'react';
import { Search, Sword, Heart, LockOpen, Hammer, Wind, Zap, X, Eye, User, BookOpen, Skull, Sparkles } from 'lucide-react';
import { ContextAction, Spell, OccultistSpell } from '../types';
import { SpellTooltip } from './ItemTooltip';
import { useIsMobile } from '@/hooks/use-mobile';

interface ActionBarProps {
  onAction: (action: string, payload?: any) => void;
  actionsRemaining: number;
  maxActions: number;  // Maximum actions per turn (includes level bonuses)
  isInvestigatorPhase: boolean;
  contextAction?: ContextAction | null;
  spells: Spell[];
  occultistSpells?: OccultistSpell[];  // Hero Quest style spells for Occultist
  activeSpell: Spell | null;
  activeOccultistSpell?: OccultistSpell | null;  // Currently casting occultist spell
  onToggleCharacter: () => void;
  showCharacter: boolean;
  onToggleInfo: () => void;
  showInfo: boolean;
  onToggleFieldGuide?: () => void;
  showFieldGuide?: boolean;
}

const ActionBar: React.FC<ActionBarProps> = ({
  onAction, actionsRemaining, maxActions, isInvestigatorPhase, contextAction, spells, occultistSpells,
  activeSpell, activeOccultistSpell,
  onToggleCharacter, showCharacter, onToggleInfo, showInfo, onToggleFieldGuide, showFieldGuide
}) => {
  const [showSpellMenu, setShowSpellMenu] = useState(false);
  const disabled = actionsRemaining <= 0 || !isInvestigatorPhase;
  const isMobile = useIsMobile();

  // Check if player has any spells (either legacy or occultist)
  const hasLegacySpells = spells.length > 0;
  const hasOccultistSpells = occultistSpells && occultistSpells.length > 0;
  const hasAnySpells = hasLegacySpells || hasOccultistSpells;
  const isAnyCastActive = activeSpell !== null || activeOccultistSpell !== null;

  // Button sizes optimized for touch (minimum 44x44px for mobile)
  const buttonSize = isMobile ? 'w-12 h-12' : 'w-14 h-14 md:w-20 md:h-20';
  const iconSize = isMobile ? 18 : 20;

  const standardActions = [
    { id: 'investigate', label: 'Investigate', icon: Search, color: 'hover:text-green-400' },
    { id: 'attack', label: 'Attack', icon: Sword, color: 'hover:text-red-400' },
    { id: 'rest', label: 'Rest', icon: Heart, color: 'hover:text-pink-400' }
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
    <div className={`flex items-center gap-1 ${isMobile ? 'gap-1' : 'gap-2 md:gap-4'} overflow-x-auto overflow-y-visible max-w-[95vw] md:max-w-none pb-1 md:pb-0 hide-scrollbar relative`}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleCharacter();
        }}
        className={`group flex flex-col items-center justify-center ${buttonSize} rounded border transition-all duration-200 shrink-0 active:scale-95 ${showCharacter ? 'bg-accent/20 border-accent text-accent' : 'bg-card border-border text-muted-foreground hover:border-accent hover:text-accent'}`}
      >
        <User size={iconSize} className={isMobile ? '' : 'mb-1'} />
        {!isMobile && <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-wider hidden md:block">Char</span>}
      </button>

      <div className={`w-px ${isMobile ? 'h-8' : 'h-12'} bg-border mx-0.5 md:mx-1`}></div>

      {contextAction ? (
        <button
          onClick={() => onAction('interact')}
          disabled={disabled}
          className={`
            flex items-center gap-2 md:gap-4 px-3 py-2 md:px-8 md:py-4 rounded-xl border-2
            ${disabled ? 'border-border bg-card opacity-50' : 'border-accent bg-accent/20 hover:bg-accent/40 active:scale-95 shadow-[var(--shadow-glow)]'}
            transition-all duration-300 animate-in zoom-in shrink-0
          `}
        >
          {React.createElement(getContextIcon(contextAction.icon), { className: `text-accent ${isMobile ? 'w-5 h-5' : 'w-6 h-6 md:w-8 md:h-8'}` })}
          <div className="text-left">
            <div className={`${isMobile ? 'text-[10px]' : 'text-xs md:text-sm'} font-bold text-foreground uppercase tracking-widest`}>{contextAction.label}</div>
            <div className="text-[9px] md:text-[10px] text-accent/80">{contextAction.skillCheck ? `DC: ${contextAction.skillCheck.dc}+` : `AP: ${contextAction.apCost}`}</div>
          </div>
        </button>
      ) : (
        <div className={`flex items-center ${isMobile ? 'gap-1' : 'gap-1 md:gap-2'}`}>
          {standardActions.map(action => (
            <button
              key={action.id}
              disabled={disabled}
              onClick={() => onAction(action.id)}
              className={`
                group flex flex-col items-center justify-center ${buttonSize} rounded border
                ${disabled ? 'opacity-30 border-border grayscale cursor-not-allowed' : 'border-border hover:border-primary active:scale-95 bg-card'}
                transition-all duration-200 shrink-0
              `}
            >
              <action.icon className={`${isMobile ? '' : 'mb-0 md:mb-1'} transition-colors ${action.color} ${isMobile ? 'w-5 h-5' : 'w-5 h-5 md:w-6 md:h-6'}`} />
              {!isMobile && <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-wider text-muted-foreground group-hover:text-foreground hidden md:block">{action.label}</span>}
            </button>
          ))}

          <div className="relative" style={{ overflow: 'visible' }}>
            {showSpellMenu && !disabled && (
              <div className="fixed bottom-28 md:bottom-32 left-1/2 -translate-x-1/2 bg-secondary border-2 border-sanity rounded-lg shadow-[0_0_30px_hsla(280,60%,55%,0.5)] w-64 overflow-hidden z-[100] animate-in slide-in-from-bottom-4 duration-200">
                <div className="bg-secondary/40 p-2 text-center text-xs font-bold text-sanity border-b border-sanity/30 uppercase tracking-widest">
                  Grimoire
                </div>
                <div className="flex flex-col max-h-72 overflow-y-auto">
                  {!hasAnySpells ? (
                    <div className="p-4 text-center text-muted-foreground italic text-xs">No spells memorized.</div>
                  ) : (
                    <>
                      {/* Legacy Spells (Professor/Doctor) - Insight cost based */}
                      {hasLegacySpells && spells.map(spell => (
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
                      ))}

                      {/* Occultist Spells - Attack dice based with limited uses */}
                      {hasOccultistSpells && occultistSpells!.map(spell => {
                        const remainingUses = spell.currentUses ?? spell.usesPerScenario;
                        const isUnlimited = spell.usesPerScenario === -1;
                        const isUsable = isUnlimited || remainingUses > 0;

                        // Get effect color
                        const effectColor = spell.effect === 'attack' || spell.effect === 'attack_horror'
                          ? 'text-red-400 border-red-400/30 bg-red-950/30'
                          : spell.effect === 'defense'
                            ? 'text-blue-400 border-blue-400/30 bg-blue-950/30'
                            : spell.effect === 'banish'
                              ? 'text-purple-400 border-purple-400/30 bg-purple-950/30'
                              : 'text-cyan-400 border-cyan-400/30 bg-cyan-950/30';

                        return (
                          <button
                            key={spell.id}
                            disabled={!isUsable}
                            onClick={() => {
                              if (isUsable) {
                                onAction('cast_occultist', spell);
                                setShowSpellMenu(false);
                              }
                            }}
                            className={`text-left p-3 border-b border-secondary/20 group transition-colors w-full ${
                              isUsable ? 'hover:bg-secondary/30' : 'opacity-50 cursor-not-allowed'
                            }`}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-secondary-foreground font-bold text-xs uppercase group-hover:text-foreground flex items-center gap-1">
                                <Sparkles size={10} className="text-sanity" />
                                {spell.name}
                              </span>
                              <div className="flex items-center gap-1">
                                {spell.attackDice > 0 && (
                                  <span className="text-[10px] bg-background/40 px-1.5 py-0.5 rounded text-red-400 font-bold border border-red-400/30">
                                    {spell.attackDice}🎲
                                  </span>
                                )}
                                {spell.defenseBonus && (
                                  <span className="text-[10px] bg-background/40 px-1.5 py-0.5 rounded text-blue-400 font-bold border border-blue-400/30">
                                    +{spell.defenseBonus}🛡
                                  </span>
                                )}
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${effectColor}`}>
                                  {isUnlimited ? '∞' : `${remainingUses}/${spell.usesPerScenario}`}
                                </span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="text-[10px] text-muted-foreground italic line-clamp-2 flex-1 mr-2">{spell.description}</div>
                              {spell.range > 0 && (
                                <span className="text-[9px] text-muted-foreground">Range: {spell.range}</span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </>
                  )}
                </div>
              </div>
            )}

            {isAnyCastActive ? (
              <button
                onClick={() => onAction('cancel_cast')}
                className={`group flex flex-col items-center justify-center ${buttonSize} rounded border ml-0.5 md:ml-2 border-primary bg-primary/20 hover:bg-primary/40 active:scale-95 animate-pulse transition-all duration-200 shrink-0 shadow-[var(--shadow-doom)]`}
              >
                <X className={`${isMobile ? '' : 'mb-0 md:mb-1'} text-primary ${isMobile ? 'w-5 h-5' : 'w-5 h-5 md:w-6 md:h-6'}`} />
                {!isMobile && <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-wider text-primary hidden md:block">Cancel</span>}
              </button>
            ) : (
              hasAnySpells && (
                <button
                  disabled={disabled}
                  onClick={() => setShowSpellMenu(!showSpellMenu)}
                  className={`
                    group flex flex-col items-center justify-center ${buttonSize} rounded border ml-0.5 md:ml-2
                    ${disabled ? 'opacity-30 border-border grayscale cursor-not-allowed' : 'border-sanity hover:border-sanity/70 active:scale-95 bg-secondary/20'}
                    transition-all duration-200 shrink-0 ${showSpellMenu ? 'bg-secondary/40 border-sanity shadow-[0_0_15px_hsla(280,60%,55%,0.3)]' : ''}
                  `}
                >
                  <Zap className={`${isMobile ? '' : 'mb-0 md:mb-1'} transition-colors text-sanity group-hover:text-sanity/70 ${isMobile ? 'w-5 h-5' : 'w-5 h-5 md:w-6 md:h-6'}`} />
                  {!isMobile && <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-wider text-sanity group-hover:text-foreground hidden md:block">Cast</span>}
                </button>
              )
            )}
          </div>
        </div>
      )}

      <div className={`ml-0.5 md:ml-2 pl-1 md:pl-4 border-l border-border flex flex-col justify-center items-center gap-0.5 md:gap-2 shrink-0`}>
        <div className={`${isMobile ? 'text-[7px]' : 'text-[8px] md:text-[9px]'} text-muted-foreground uppercase font-bold tracking-[0.2em]`}>AP</div>
        <div className={`flex ${isMobile ? 'gap-1' : 'gap-1 md:gap-2'}`}>
          {Array.from({ length: maxActions }, (_, i) => i + 1).map(i => {
            const isActive = i <= actionsRemaining;
            return (
              <div
                key={i}
                className={`
                  ${isMobile ? 'w-3 h-3' : 'w-3 h-3 md:w-5 md:h-5'} rounded-full border-2 transition-all duration-500 flex items-center justify-center
                  ${isActive
                    ? 'bg-primary border-foreground shadow-[var(--shadow-doom)] scale-110'
                    : 'bg-transparent border-border scale-90 opacity-40'}
                `}
              >
                {isActive && <div className={`${isMobile ? 'w-1 h-1' : 'w-1 md:w-1.5 h-1 md:h-1.5'} bg-foreground rounded-full animate-pulse`}></div>}
              </div>
            );
          })}
        </div>
      </div>

      <div className={`w-px ${isMobile ? 'h-8' : 'h-12'} bg-border mx-0.5 md:mx-1`}></div>

      {onToggleFieldGuide && (
        <button
          onClick={onToggleFieldGuide}
          className={`group flex flex-col items-center justify-center ${buttonSize} rounded border transition-all duration-200 shrink-0 active:scale-95 ${showFieldGuide ? 'bg-amber-900/30 border-amber-500 text-amber-400' : 'bg-card border-border text-muted-foreground hover:border-amber-600 hover:text-amber-500'}`}
        >
          <Skull size={iconSize} className={isMobile ? '' : 'mb-1'} />
          {!isMobile && <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-wider hidden md:block">Guide</span>}
        </button>
      )}

      <button
        onClick={onToggleInfo}
        className={`group flex flex-col items-center justify-center ${buttonSize} rounded border transition-all duration-200 shrink-0 active:scale-95 ${showInfo ? 'bg-muted border-foreground text-foreground' : 'bg-card border-border text-muted-foreground hover:border-muted-foreground hover:text-muted-foreground'}`}
      >
        <BookOpen size={iconSize} className={isMobile ? '' : 'mb-1'} />
        {!isMobile && <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-wider hidden md:block">Log</span>}
      </button>
    </div>
  );
};

export default ActionBar;
