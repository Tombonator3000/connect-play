import React, { useState } from 'react';
import { Dices, Swords, Wind, BookOpen, Shield } from 'lucide-react';
import { SkillType, SkillCheckResult, Player } from '../types';

interface SkillCheckPanelProps {
  player: Player;
  skill: SkillType;
  dc: number;
  onResult: (result: SkillCheckResult) => void;
  onCancel: () => void;
  contextLabel?: string;
}

const SKILL_ICONS: Record<SkillType, React.ReactNode> = {
  strength: <Swords className="w-5 h-5" />,
  agility: <Wind className="w-5 h-5" />,
  intellect: <BookOpen className="w-5 h-5" />,
  willpower: <Shield className="w-5 h-5" />
};

const SKILL_COLORS: Record<SkillType, string> = {
  strength: 'text-health',
  agility: 'text-accent',
  intellect: 'text-insight',
  willpower: 'text-sanity'
};

const SKILL_NAMES: Record<SkillType, string> = {
  strength: 'Strength',
  agility: 'Agility',
  intellect: 'Intellect',
  willpower: 'Willpower'
};

const SkillCheckPanel: React.FC<SkillCheckPanelProps> = ({
  player,
  skill,
  dc,
  onResult,
  onCancel,
  contextLabel = 'Skill Check'
}) => {
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState<SkillCheckResult | null>(null);

  // Get attribute value from player's character attributes
  const getAttributeValue = (): number => {
    // Player extends Character which has attributes: CharacterAttributes
    return player.attributes[skill] ?? 2;
  };

  const attributeValue = getAttributeValue();
  const baseDice = 2; // Always roll 2 base dice
  const bonusDice = attributeValue; // Attribute value gives bonus dice
  const totalDice = baseDice + bonusDice;

  // Character-specific bonuses
  const getSpecialBonus = (): number => {
    if (skill === 'strength' && player.id === 'veteran') return 1;
    if (skill === 'intellect' && player.id === 'detective') return 1;
    return 0;
  };

  const specialBonus = getSpecialBonus();
  const finalDice = totalDice + specialBonus;

  const performRoll = () => {
    setRolling(true);
    
    // Simulate rolling animation
    setTimeout(() => {
      const dice = Array.from({ length: finalDice }, () => Math.floor(Math.random() * 6) + 1);
      const successes = dice.filter(d => d >= dc).length;
      const passed = successes > 0;
      
      const checkResult: SkillCheckResult = {
        dice,
        successes,
        dc,
        passed,
        skill
      };
      
      setResult(checkResult);
      setRolling(false);
    }, 1000);
  };

  const confirmResult = () => {
    if (result) {
      onResult(result);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-card border-2 border-primary rounded-2xl p-8 max-w-md w-full mx-4 shadow-[var(--shadow-doom)]">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="font-display text-2xl text-primary uppercase tracking-widest mb-2">
            {contextLabel}
          </h2>
          <div className={`flex items-center justify-center gap-2 ${SKILL_COLORS[skill]}`}>
            {SKILL_ICONS[skill]}
            <span className="text-lg font-bold">{SKILL_NAMES[skill]} Check</span>
          </div>
        </div>

        {/* Dice Info */}
        <div className="bg-background/50 rounded-xl p-4 mb-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Base Dice:</span>
            <span className="text-foreground">{baseDice}d6</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{SKILL_NAMES[skill]} Bonus:</span>
            <span className={SKILL_COLORS[skill]}>+{bonusDice}d6</span>
          </div>
          {specialBonus > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Special Ability:</span>
              <span className="text-gold">+{specialBonus}d6</span>
            </div>
          )}
          <div className="border-t border-border pt-2 flex justify-between font-bold">
            <span>Total:</span>
            <span className="text-accent">{finalDice}d6</span>
          </div>
          <div className="flex justify-between text-sm pt-2">
            <span className="text-muted-foreground">Difficulty (DC):</span>
            <span className="text-primary font-bold">{dc}+</span>
          </div>
        </div>

        {/* Roll Result */}
        {result && (
          <div className="mb-6">
            <div className="flex justify-center gap-2 mb-4">
              {result.dice.map((die, idx) => (
                <div
                  key={idx}
                  className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold border-2 transition-all ${
                    die >= dc 
                      ? 'bg-accent/20 border-accent text-accent' 
                      : 'bg-muted border-border text-muted-foreground'
                  }`}
                >
                  {die}
                </div>
              ))}
            </div>
            <div className={`text-center text-2xl font-display uppercase tracking-widest ${
              result.passed ? 'text-accent' : 'text-primary'
            }`}>
              {result.passed 
                ? `Success! (${result.successes} ${result.successes === 1 ? 'hit' : 'hits'})` 
                : 'Failed!'}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          {!result ? (
            <>
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-3 bg-muted border border-border rounded-lg text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={performRoll}
                disabled={rolling}
                className="flex-1 px-4 py-3 bg-primary border border-primary-foreground rounded-lg text-primary-foreground font-bold flex items-center justify-center gap-2 hover:brightness-110 transition-all disabled:opacity-50"
              >
                <Dices className={`w-5 h-5 ${rolling ? 'animate-spin' : ''}`} />
                {rolling ? 'Rolling...' : 'Roll'}
              </button>
            </>
          ) : (
            <button
              onClick={confirmResult}
              className="w-full px-4 py-3 bg-accent border border-accent-foreground rounded-lg text-accent-foreground font-bold hover:brightness-110 transition-all"
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillCheckPanel;
