import React, { useEffect, useState, useRef } from 'react';
import { Player, Enemy } from '../types';
import { getCharacterPortrait } from '../utils/characterAssets';
import { getMonsterDisplayName } from '../utils/monsterAssets';
import { COMBAT_DC, formatDiceRolls } from '../constants/diceUtils';
import { BESTIARY } from '../constants/bestiary';
import { Heart, Brain, Flame } from 'lucide-react';
import MonsterPortrait from './MonsterPortrait';

interface CombatOverlayProps {
  player: Player;
  enemy: Enemy;
  attackRolls: number[];
  defenseRolls: number[];
  attackSuccesses: number;
  defenseSuccesses: number;
  netDamage: number;
  isCritical: boolean;
  onComplete: () => void;
}

/**
 * Full-screen combat overlay in the style of the reference image:
 * - Player portrait on left with HP/Sanity
 * - Dice in center with animated rolls
 * - Monster portrait on right with name and damage indicator
 */
const CombatOverlay: React.FC<CombatOverlayProps> = ({
  player,
  enemy,
  attackRolls,
  defenseRolls,
  attackSuccesses,
  defenseSuccesses,
  netDamage,
  isCritical,
  onComplete
}) => {
  const [phase, setPhase] = useState<'rolling' | 'attack_result' | 'defense_result' | 'final'>('rolling');
  const [displayAttackDice, setDisplayAttackDice] = useState<number[]>(attackRolls.map(() => 1));
  const [displayDefenseDice, setDisplayDefenseDice] = useState<number[]>(defenseRolls.map(() => 1));
  const [diceRotations, setDiceRotations] = useState<number[]>([]);

  const playerPortrait = player.customPortraitUrl || getCharacterPortrait(player.id);
  const bestiaryInfo = BESTIARY[enemy.type];

  // Use ref to store onComplete callback to avoid useEffect dependency issues
  // This prevents the animation from restarting when onComplete reference changes
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Animate dice rolling
  useEffect(() => {
    const allDice = [...attackRolls, ...defenseRolls];
    setDiceRotations(allDice.map(() => 0));

    // Rolling animation
    const rollInterval = setInterval(() => {
      setDisplayAttackDice(attackRolls.map(() => Math.floor(Math.random() * 6) + 1));
      setDisplayDefenseDice(defenseRolls.map(() => Math.floor(Math.random() * 6) + 1));
      setDiceRotations(prev => prev.map(() => Math.random() * 360));
    }, 80);

    // Stop rolling and show results
    const stopRolling = setTimeout(() => {
      clearInterval(rollInterval);
      setDisplayAttackDice(attackRolls);
      setDisplayDefenseDice(defenseRolls);
      setDiceRotations(allDice.map(() => 0));
      setPhase('attack_result');

      // Show defense after a moment
      setTimeout(() => {
        setPhase('defense_result');

        // Show final result
        setTimeout(() => {
          setPhase('final');

          // Auto-close after showing result
          setTimeout(() => {
            onCompleteRef.current();
          }, 2000);
        }, 800);
      }, 1000);
    }, 1000);

    return () => {
      clearInterval(rollInterval);
      clearTimeout(stopRolling);
    };
  }, [attackRolls, defenseRolls]);

  const renderDie = (value: number, index: number, isSuccess: boolean, isAttack: boolean) => {
    const rotation = diceRotations[isAttack ? index : attackRolls.length + index] || 0;
    const isRolling = phase === 'rolling';
    const showResult = isAttack ? phase !== 'rolling' : phase === 'defense_result' || phase === 'final';

    return (
      <div
        key={`${isAttack ? 'attack' : 'defense'}-${index}`}
        className={`
          relative w-14 h-14 md:w-16 md:h-16 rounded-lg flex items-center justify-center
          text-2xl md:text-3xl font-bold shadow-lg transition-all duration-300
          ${isRolling ? 'bg-muted/80 text-muted-foreground' : ''}
          ${showResult && isSuccess ? 'bg-foreground text-green-600 ring-2 ring-green-500 scale-110' : ''}
          ${showResult && !isSuccess ? 'bg-muted text-muted-foreground opacity-60' : ''}
        `}
        style={{
          transform: isRolling ? `rotate(${rotation}deg)` : 'rotate(0deg)',
        }}
      >
        {/* Pip display for dice */}
        <DiceFace value={value} />
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
      {/* Parchment-style combat board */}
      <div
        className="relative w-[95vw] max-w-6xl h-auto py-8 px-4 md:px-8 flex items-center justify-between gap-4"
        style={{
          background: 'linear-gradient(135deg, hsl(var(--sepia)/0.95) 0%, hsl(var(--sepia)/0.85) 100%)',
          borderImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'40\' height=\'40\'%3E%3Cpath d=\'M0 20 Q10 0 20 20 T40 20\' fill=\'none\' stroke=\'%23433422\' stroke-width=\'2\'/%3E%3C/svg%3E") 30 round',
          boxShadow: 'inset 0 0 60px rgba(0,0,0,0.3), 0 20px 60px rgba(0,0,0,0.5)',
        }}
      >
        {/* Decorative corners */}
        <div className="absolute top-2 left-2 w-16 h-16 border-l-2 border-t-2 border-[#433422] opacity-50" />
        <div className="absolute top-2 right-2 w-16 h-16 border-r-2 border-t-2 border-[#433422] opacity-50" />
        <div className="absolute bottom-2 left-2 w-16 h-16 border-l-2 border-b-2 border-[#433422] opacity-50" />
        <div className="absolute bottom-2 right-2 w-16 h-16 border-r-2 border-b-2 border-[#433422] opacity-50" />

        {/* Left Side - Player */}
        <div className="flex flex-col items-center gap-2 flex-shrink-0">
          {/* Player Portrait Frame */}
          <div className="relative w-36 h-44 md:w-48 md:h-56 rounded-md overflow-hidden border-4 border-[#8b7355] shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
            <img
              src={playerPortrait}
              alt={player.name}
              className="w-full h-full object-cover"
            />
            {/* Overlay for atmospheric effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
          </div>

          {/* HP and Sanity indicators */}
          <div className="flex gap-2">
            <div className="flex items-center gap-1 px-3 py-1 bg-red-600 rounded text-white font-bold text-sm shadow-lg">
              <Heart size={14} fill="currentColor" />
              <span>{player.hp}</span>
            </div>
            <div className="flex items-center gap-1 px-3 py-1 bg-blue-600 rounded text-white font-bold text-sm shadow-lg">
              <Brain size={14} />
              <span>{player.sanity}</span>
            </div>
          </div>
        </div>

        {/* Center - Dice Area */}
        <div className="flex-1 flex flex-col items-center justify-center gap-6 min-w-0">
          {/* Attack Dice */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-[#433422]/70 font-bold">Attack</span>
            <div className="flex flex-wrap justify-center gap-2 md:gap-3">
              {displayAttackDice.map((value, idx) => renderDie(value, idx, value >= COMBAT_DC, true))}
            </div>
            {phase !== 'rolling' && (
              <span className="text-sm font-bold text-[#433422]">
                {attackSuccesses} {attackSuccesses === 1 ? 'skull' : 'skulls'}
              </span>
            )}
          </div>

          {/* Versus divider */}
          <div className="text-2xl font-display text-[#433422]/50 italic">vs</div>

          {/* Defense Dice */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-[#433422]/70 font-bold">Defense</span>
            <div className="flex flex-wrap justify-center gap-2 md:gap-3">
              {displayDefenseDice.map((value, idx) => renderDie(value, idx, value >= COMBAT_DC, false))}
            </div>
            {(phase === 'defense_result' || phase === 'final') && (
              <span className="text-sm font-bold text-[#433422]">
                {defenseSuccesses} {defenseSuccesses === 1 ? 'shield' : 'shields'}
              </span>
            )}
          </div>

          {/* Final Result */}
          {phase === 'final' && (
            <div className={`
              mt-4 px-6 py-3 rounded-lg text-center animate-in zoom-in-90 duration-300
              ${netDamage > 0 ? 'bg-red-900/80 text-red-100' : 'bg-green-900/80 text-green-100'}
              ${isCritical ? 'ring-4 ring-gold animate-pulse' : ''}
            `}>
              {netDamage > 0 ? (
                <div className="flex items-center gap-2 text-xl font-display">
                  <Flame className="text-orange-400" />
                  <span>{netDamage} DAMAGE!</span>
                  {isCritical && <span className="text-gold">CRITICAL!</span>}
                </div>
              ) : (
                <span className="text-xl font-display">BLOCKED!</span>
              )}
            </div>
          )}
        </div>

        {/* Right Side - Enemy */}
        <div className="flex flex-col items-center gap-2 flex-shrink-0">
          {/* Enemy name */}
          <h3 className="text-lg md:text-xl font-display text-[#433422] drop-shadow-sm">
            {getMonsterDisplayName(enemy.type)}
          </h3>

          {/* Enemy Portrait with Trait Effects */}
          <div className="relative w-36 h-44 md:w-48 md:h-56">
            <MonsterPortrait 
              enemyType={enemy.type}
              size="xl"
              showTraitEffects={true}
              isActive={phase === 'final' && netDamage > 0}
              className="w-full h-full border-4 border-[#6b4423] shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]"
            />
            {/* Horror overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-red-900/40 to-transparent pointer-events-none rounded-xl" />

            {/* Damage indicator on enemy */}
            {phase === 'final' && netDamage > 0 && (
              <div className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-red-600 flex items-center justify-center animate-bounce">
                <Flame className="text-white" size={20} />
              </div>
            )}
          </div>

          {/* Enemy HP bar */}
          <div className="w-full max-w-[160px]">
            <div className="h-3 bg-gray-800 rounded-full overflow-hidden border border-[#433422]">
              <div
                className="h-full bg-gradient-to-r from-red-700 to-red-500 transition-all duration-500"
                style={{ width: `${Math.max(0, ((enemy.hp - netDamage) / enemy.maxHp) * 100)}%` }}
              />
            </div>
            <div className="text-center text-xs text-[#433422]/70 mt-1">
              HP: {Math.max(0, enemy.hp - netDamage)} / {enemy.maxHp}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Render dice face with pips (dots)
 */
const DiceFace: React.FC<{ value: number }> = ({ value }) => {
  const pipPositions: Record<number, string[]> = {
    1: ['center'],
    2: ['top-right', 'bottom-left'],
    3: ['top-right', 'center', 'bottom-left'],
    4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
    5: ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'],
    6: ['top-left', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-right'],
  };

  const positions = pipPositions[value] || pipPositions[1];

  const getPositionClass = (pos: string) => {
    switch (pos) {
      case 'top-left': return 'top-1.5 left-1.5';
      case 'top-right': return 'top-1.5 right-1.5';
      case 'middle-left': return 'top-1/2 -translate-y-1/2 left-1.5';
      case 'middle-right': return 'top-1/2 -translate-y-1/2 right-1.5';
      case 'bottom-left': return 'bottom-1.5 left-1.5';
      case 'bottom-right': return 'bottom-1.5 right-1.5';
      case 'center': return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
      default: return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
    }
  };

  return (
    <div className="relative w-full h-full bg-black rounded-lg">
      {positions.map((pos, idx) => (
        <div
          key={idx}
          className={`absolute w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-white ${getPositionClass(pos)}`}
        />
      ))}
    </div>
  );
};

export default CombatOverlay;
