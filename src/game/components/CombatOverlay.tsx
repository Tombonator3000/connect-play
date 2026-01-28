import React, { useEffect, useState, useRef } from 'react';
import { Player, Enemy } from '../types';
import { getCharacterPortrait } from '../utils/characterAssets';
import { getMonsterDisplayName } from '../utils/monsterAssets';
import { COMBAT_DC, formatDiceRolls } from '../constants/diceUtils';
import { BESTIARY } from '../constants/bestiary';
import { Heart, Brain, Flame, Shield, Skull } from 'lucide-react';
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
  /** Combat mode: player_attack = player attacks monster, enemy_attack = monster attacks player */
  mode?: 'player_attack' | 'enemy_attack';
  /** Sanity damage (only used in enemy_attack mode) */
  sanityDamage?: number;
}

/**
 * Full-screen combat overlay with support for both attack and defense modes:
 *
 * player_attack mode (default):
 * - Player portrait on left with HP/Sanity
 * - Attack dice = player's attack, Defense dice = monster's defense
 * - Damage dealt to monster
 *
 * enemy_attack mode (defense):
 * - Monster portrait on left (attacker)
 * - Attack dice = monster's attack, Defense dice = player's defense
 * - Damage dealt to player
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
  onComplete,
  mode = 'player_attack',
  sanityDamage = 0
}) => {
  const [phase, setPhase] = useState<'rolling' | 'attack_result' | 'defense_result' | 'final'>('rolling');
  const [displayAttackDice, setDisplayAttackDice] = useState<number[]>(attackRolls.map(() => 1));
  const [displayDefenseDice, setDisplayDefenseDice] = useState<number[]>(defenseRolls.map(() => 1));
  const [diceRotations, setDiceRotations] = useState<number[]>([]);

  const playerPortrait = player.customPortraitUrl || getCharacterPortrait(player.id);
  const bestiaryInfo = BESTIARY[enemy.type];
  const isDefenseMode = mode === 'enemy_attack';

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

    // In defense mode, use different colors for attack dice (red/threatening)
    const attackSuccessColor = isDefenseMode
      ? 'bg-red-900 text-red-300 ring-2 ring-red-500 scale-110'
      : 'bg-foreground text-green-600 ring-2 ring-green-500 scale-110';
    const defenseSuccessColor = isDefenseMode
      ? 'bg-foreground text-green-600 ring-2 ring-green-500 scale-110'
      : 'bg-foreground text-green-600 ring-2 ring-green-500 scale-110';

    return (
      <div
        key={`${isAttack ? 'attack' : 'defense'}-${index}`}
        className={`
          relative w-14 h-14 md:w-16 md:h-16 rounded-lg flex items-center justify-center
          text-2xl md:text-3xl font-bold shadow-lg transition-all duration-300
          ${isRolling ? 'bg-muted/80 text-muted-foreground' : ''}
          ${showResult && isSuccess ? (isAttack ? attackSuccessColor : defenseSuccessColor) : ''}
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

  // Render the attacker side (left)
  const renderAttacker = () => {
    if (isDefenseMode) {
      // Monster is the attacker in defense mode
      return (
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
            {/* Horror overlay - more intense for attacking monster */}
            <div className="absolute inset-0 bg-gradient-to-t from-red-900/60 to-red-900/20 pointer-events-none rounded-xl animate-pulse" />

            {/* Attack indicator */}
            <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-red-600 flex items-center justify-center animate-bounce shadow-lg">
              <Skull className="text-white" size={20} />
            </div>
          </div>

          {/* Enemy stats */}
          <div className="flex gap-2">
            <div className="flex items-center gap-1 px-3 py-1 bg-red-800 rounded text-white font-bold text-sm shadow-lg">
              <Heart size={14} fill="currentColor" />
              <span>{enemy.hp}</span>
            </div>
          </div>
        </div>
      );
    } else {
      // Player is the attacker in attack mode
      return (
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
      );
    }
  };

  // Render the defender side (right)
  const renderDefender = () => {
    if (isDefenseMode) {
      // Player is the defender in defense mode
      return (
        <div className="flex flex-col items-center gap-2 flex-shrink-0">
          {/* Player name */}
          <h3 className="text-lg md:text-xl font-display text-[#433422] drop-shadow-sm">
            {player.name}
          </h3>

          {/* Player Portrait Frame */}
          <div className="relative w-36 h-44 md:w-48 md:h-56 rounded-md overflow-hidden border-4 border-[#8b7355] shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
            <img
              src={playerPortrait}
              alt={player.name}
              className="w-full h-full object-cover"
            />
            {/* Overlay for atmospheric effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

            {/* Defense indicator */}
            <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-lg">
              <Shield className="text-white" size={20} />
            </div>

            {/* Damage indicator on player when hit */}
            {phase === 'final' && netDamage > 0 && (
              <div className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-red-600 flex items-center justify-center animate-bounce">
                <Flame className="text-white" size={20} />
              </div>
            )}
          </div>

          {/* Player HP bar with damage preview */}
          <div className="w-full max-w-[160px]">
            <div className="h-3 bg-gray-800 rounded-full overflow-hidden border border-[#433422]">
              <div
                className="h-full bg-gradient-to-r from-red-700 to-red-500 transition-all duration-500"
                style={{ width: `${Math.max(0, ((player.hp - (phase === 'final' ? netDamage : 0)) / player.maxHp) * 100)}%` }}
              />
            </div>
            <div className="text-center text-xs text-[#433422]/70 mt-1">
              HP: {phase === 'final' ? Math.max(0, player.hp - netDamage) : player.hp} / {player.maxHp}
            </div>
          </div>

          {/* Sanity bar */}
          <div className="w-full max-w-[160px]">
            <div className="h-3 bg-gray-800 rounded-full overflow-hidden border border-[#433422]">
              <div
                className="h-full bg-gradient-to-r from-blue-700 to-blue-500 transition-all duration-500"
                style={{ width: `${Math.max(0, ((player.sanity - (phase === 'final' ? sanityDamage : 0)) / player.maxSanity) * 100)}%` }}
              />
            </div>
            <div className="text-center text-xs text-[#433422]/70 mt-1">
              Sanity: {phase === 'final' ? Math.max(0, player.sanity - sanityDamage) : player.sanity} / {player.maxSanity}
            </div>
          </div>
        </div>
      );
    } else {
      // Monster is the defender in attack mode
      return (
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
      );
    }
  };

  // Render the final result message
  const renderFinalResult = () => {
    if (isDefenseMode) {
      // Defense mode: show damage to player
      const totalDamage = netDamage + sanityDamage;
      if (totalDamage > 0) {
        return (
          <div className={`
            mt-4 px-6 py-3 rounded-lg text-center animate-in zoom-in-90 duration-300
            bg-red-900/80 text-red-100
          `}>
            <div className="flex flex-col items-center gap-1 text-xl font-display">
              <div className="flex items-center gap-2">
                <Flame className="text-orange-400" />
                <span>HIT!</span>
              </div>
              <div className="flex items-center gap-3 text-lg">
                {netDamage > 0 && (
                  <span className="flex items-center gap-1">
                    <Heart size={16} className="text-red-400" />
                    -{netDamage} HP
                  </span>
                )}
                {sanityDamage > 0 && (
                  <span className="flex items-center gap-1">
                    <Brain size={16} className="text-purple-400" />
                    -{sanityDamage} Sanity
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      } else {
        return (
          <div className={`
            mt-4 px-6 py-3 rounded-lg text-center animate-in zoom-in-90 duration-300
            bg-green-900/80 text-green-100
          `}>
            <div className="flex items-center gap-2 text-xl font-display">
              <Shield className="text-blue-400" />
              <span>BLOCKED!</span>
            </div>
          </div>
        );
      }
    } else {
      // Attack mode: show damage to enemy
      if (netDamage > 0) {
        return (
          <div className={`
            mt-4 px-6 py-3 rounded-lg text-center animate-in zoom-in-90 duration-300
            bg-red-900/80 text-red-100
            ${isCritical ? 'ring-4 ring-gold animate-pulse' : ''}
          `}>
            <div className="flex items-center gap-2 text-xl font-display">
              <Flame className="text-orange-400" />
              <span>{netDamage} DAMAGE!</span>
              {isCritical && <span className="text-gold">CRITICAL!</span>}
            </div>
          </div>
        );
      } else {
        return (
          <div className={`
            mt-4 px-6 py-3 rounded-lg text-center animate-in zoom-in-90 duration-300
            bg-green-900/80 text-green-100
          `}>
            <span className="text-xl font-display">BLOCKED!</span>
          </div>
        );
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
      {/* Parchment-style combat board */}
      <div
        className={`relative w-[95vw] max-w-6xl h-auto py-8 px-4 md:px-8 flex items-center justify-between gap-4 ${
          isDefenseMode ? 'ring-4 ring-red-900/50' : ''
        }`}
        style={{
          background: isDefenseMode
            ? 'linear-gradient(135deg, hsl(var(--sepia)/0.95) 0%, hsl(10 30% 20% / 0.9) 100%)'
            : 'linear-gradient(135deg, hsl(var(--sepia)/0.95) 0%, hsl(var(--sepia)/0.85) 100%)',
          borderImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'40\' height=\'40\'%3E%3Cpath d=\'M0 20 Q10 0 20 20 T40 20\' fill=\'none\' stroke=\'%23433422\' stroke-width=\'2\'/%3E%3C/svg%3E") 30 round',
          boxShadow: 'inset 0 0 60px rgba(0,0,0,0.3), 0 20px 60px rgba(0,0,0,0.5)',
        }}
      >
        {/* Combat mode indicator */}
        {isDefenseMode && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-red-900/80 rounded-full text-red-100 text-sm font-bold uppercase tracking-wider">
            Enemy Attack!
          </div>
        )}

        {/* Decorative corners */}
        <div className="absolute top-2 left-2 w-16 h-16 border-l-2 border-t-2 border-[#433422] opacity-50" />
        <div className="absolute top-2 right-2 w-16 h-16 border-r-2 border-t-2 border-[#433422] opacity-50" />
        <div className="absolute bottom-2 left-2 w-16 h-16 border-l-2 border-b-2 border-[#433422] opacity-50" />
        <div className="absolute bottom-2 right-2 w-16 h-16 border-r-2 border-b-2 border-[#433422] opacity-50" />

        {/* Left Side - Attacker */}
        {renderAttacker()}

        {/* Center - Dice Area */}
        <div className="flex-1 flex flex-col items-center justify-center gap-6 min-w-0">
          {/* Attack Dice */}
          <div className="flex flex-col items-center gap-2">
            <span className={`text-xs uppercase tracking-widest font-bold ${
              isDefenseMode ? 'text-red-800' : 'text-[#433422]/70'
            }`}>
              {isDefenseMode ? 'Monster Attack' : 'Attack'}
            </span>
            <div className="flex flex-wrap justify-center gap-2 md:gap-3">
              {displayAttackDice.map((value, idx) => renderDie(value, idx, value >= COMBAT_DC, true))}
            </div>
            {phase !== 'rolling' && (
              <span className={`text-sm font-bold ${isDefenseMode ? 'text-red-800' : 'text-[#433422]'}`}>
                {attackSuccesses} {attackSuccesses === 1 ? 'skull' : 'skulls'}
              </span>
            )}
          </div>

          {/* Versus divider */}
          <div className="text-2xl font-display text-[#433422]/50 italic">vs</div>

          {/* Defense Dice */}
          <div className="flex flex-col items-center gap-2">
            <span className={`text-xs uppercase tracking-widest font-bold ${
              isDefenseMode ? 'text-blue-800' : 'text-[#433422]/70'
            }`}>
              {isDefenseMode ? 'Your Defense' : 'Defense'}
            </span>
            <div className="flex flex-wrap justify-center gap-2 md:gap-3">
              {displayDefenseDice.map((value, idx) => renderDie(value, idx, value >= COMBAT_DC, false))}
            </div>
            {(phase === 'defense_result' || phase === 'final') && (
              <span className={`text-sm font-bold ${isDefenseMode ? 'text-blue-800' : 'text-[#433422]'}`}>
                {defenseSuccesses} {defenseSuccesses === 1 ? 'shield' : 'shields'}
              </span>
            )}
          </div>

          {/* Final Result */}
          {phase === 'final' && renderFinalResult()}
        </div>

        {/* Right Side - Defender */}
        {renderDefender()}
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
