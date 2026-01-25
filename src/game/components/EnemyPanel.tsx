import React from 'react';
import { Enemy } from '../types';
import { BESTIARY } from '../constants';
import { Skull, Swords, Brain, Activity, BookOpen, X, Shield } from 'lucide-react';
import { getMonsterDisplayName } from '../utils/monsterAssets';
import MonsterPortrait from './MonsterPortrait';

interface EnemyPanelProps {
  enemy: Enemy;
  onClose?: () => void;
}

const EnemyPanel: React.FC<EnemyPanelProps> = ({ enemy, onClose }) => {
  const hpPercent = (enemy.hp / enemy.maxHp) * 100;
  const info = BESTIARY[enemy.type];

  return (
    <div className="bg-red-950/95 backdrop-blur-2xl border-2 border-primary rounded-2xl shadow-[var(--shadow-doom)] overflow-hidden animate-in slide-in-from-right duration-300 w-full h-full flex flex-col">
      <div className="bg-red-900/20 p-4 border-b border-primary/30 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <MonsterPortrait 
            enemyType={enemy.type} 
            size="sm" 
            showTraitEffects={true}
            isActive={true}
          />
          <div>
            <h2 className="text-xl font-display text-foreground italic tracking-tight uppercase">{enemy.name}</h2>
            <div className="text-[9px] text-primary uppercase tracking-widest">{getMonsterDisplayName(enemy.type)}</div>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-primary hover:text-foreground transition-colors p-1">
            <X size={20} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/leather.png')] opacity-10 pointer-events-none"></div>

        <div className="p-6 space-y-6 relative z-10">
          {/* Monster Portrait with Trait Effects */}
          <div className="flex justify-center">
            <MonsterPortrait 
              enemyType={enemy.type} 
              size="lg" 
              showTraitEffects={true}
              isActive={true}
              className="border-4 border-red-900 shadow-[var(--shadow-doom)]"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1 text-[10px] font-bold text-primary uppercase tracking-widest">
              <span className="flex items-center gap-1"><Activity size={12} /> HP</span>
              <span>{enemy.hp} / {enemy.maxHp}</span>
            </div>
            <div className="h-2 bg-background rounded-full overflow-hidden border border-border">
              <div className="h-full bg-gradient-to-r from-red-900 to-red-600 transition-all duration-700 shadow-[0_0_15px_rgba(239,68,68,0.5)]" style={{ width: `${hpPercent}%` }}></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-background/40 border border-red-900/30 p-3 rounded-xl flex flex-col items-center">
              <Swords size={18} className="text-primary mb-1" />
              <span className="text-lg font-bold text-foreground">{enemy.damage}</span>
              <span className="text-[8px] text-muted-foreground uppercase tracking-widest">Combat</span>
            </div>
            <div className="bg-background/40 border border-secondary/30 p-3 rounded-xl flex flex-col items-center">
              <Brain size={18} className="text-sanity mb-1" />
              <span className="text-lg font-bold text-foreground">{enemy.horror}</span>
              <span className="text-[8px] text-muted-foreground uppercase tracking-widest">Horror</span>
            </div>
          </div>

          {enemy.traits && enemy.traits.length > 0 && (
            <div className="pt-4 border-t border-primary/20">
              <div className="text-[9px] text-primary uppercase tracking-[0.2em] font-bold mb-2 flex items-center gap-2">
                <Shield size={10} /> Special Abilities
              </div>
              <div className="flex flex-wrap gap-2">
                {enemy.traits.map(trait => (
                  <span key={trait} className="px-2 py-0.5 bg-red-900/30 text-red-300 text-[10px] font-bold uppercase rounded border border-red-800/50">
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-primary/20">
            <div className="text-[9px] text-primary uppercase tracking-[0.2em] font-bold mb-2 flex items-center gap-2">
              <BookOpen size={10} /> Research Notes
            </div>
            <p className="text-sm text-muted-foreground italic font-serif leading-relaxed">
              "{info?.description || 'A creature of unknown origin.'}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnemyPanel;
