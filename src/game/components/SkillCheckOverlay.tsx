import React, { useEffect, useState, useRef } from 'react';
import { Player, SkillCheckState, SkillType } from '../types';
import { getCharacterPortrait } from '../utils/characterAssets';
import { COMBAT_DC } from '../constants/diceUtils';
import { Heart, Brain, Lock, Hammer, KeyRound, Shield, Sparkles, X, Check } from 'lucide-react';

interface SkillCheckOverlayProps {
  player: Player;
  skillCheckState: SkillCheckState;
  onComplete: (passed: boolean) => void;
}

/**
 * Full-screen skill check overlay with dice animation
 *
 * Shows CombatOverlay-style presentation for force/lockpick door actions.
 * Player portrait on left, target (door) on right, dice rolling in center.
 */
const SkillCheckOverlay: React.FC<SkillCheckOverlayProps> = ({
  player,
  skillCheckState,
  onComplete,
}) => {
  const [phase, setPhase] = useState<'rolling' | 'result' | 'final'>('rolling');
  const [displayDice, setDisplayDice] = useState<number[]>(skillCheckState.rolls.map(() => 1));
  const [diceRotations, setDiceRotations] = useState<number[]>([]);

  const playerPortrait = player.customPortraitUrl || getCharacterPortrait(player.id);

  // Use ref to store onComplete callback to avoid useEffect dependency issues
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Store passed result in ref to avoid stale closures
  const passedRef = useRef(skillCheckState.passed);
  passedRef.current = skillCheckState.passed;

  // Animate dice rolling
  useEffect(() => {
    setDiceRotations(skillCheckState.rolls.map(() => 0));

    // Rolling animation
    const rollInterval = setInterval(() => {
      setDisplayDice(skillCheckState.rolls.map(() => Math.floor(Math.random() * 6) + 1));
      setDiceRotations(prev => prev.map(() => Math.random() * 360));
    }, 80);

    // Stop rolling and show results
    const stopRolling = setTimeout(() => {
      clearInterval(rollInterval);
      setDisplayDice(skillCheckState.rolls);
      setDiceRotations(skillCheckState.rolls.map(() => 0));
      setPhase('result');

      // Show final result
      setTimeout(() => {
        setPhase('final');

        // Auto-close after showing result
        setTimeout(() => {
          onCompleteRef.current(passedRef.current);
        }, 2000);
      }, 800);
    }, 1000);

    return () => {
      clearInterval(rollInterval);
      clearTimeout(stopRolling);
    };
  }, [skillCheckState.rolls]);

  const renderDie = (value: number, index: number, isSuccess: boolean) => {
    const rotation = diceRotations[index] || 0;
    const isRolling = phase === 'rolling';
    const showResult = phase !== 'rolling';

    return (
      <div
        key={`die-${index}`}
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
        <DiceFace value={value} />
      </div>
    );
  };

  // Get skill display info
  const getSkillInfo = (skill: SkillType) => {
    switch (skill) {
      case 'strength':
        return { name: 'Styrke', icon: Hammer, color: 'text-red-500' };
      case 'agility':
        return { name: 'Smidighet', icon: KeyRound, color: 'text-green-500' };
      case 'intellect':
        return { name: 'Intellekt', icon: Brain, color: 'text-blue-500' };
      case 'willpower':
        return { name: 'Viljestyrke', icon: Shield, color: 'text-purple-500' };
      default:
        return { name: skill, icon: Sparkles, color: 'text-amber-500' };
    }
  };

  // Get check type display info
  const getCheckTypeInfo = (checkType: SkillCheckState['checkType']) => {
    switch (checkType) {
      case 'force_door':
        return { title: 'FORCE DOOR', icon: Hammer, bgColor: 'from-red-900/80 to-orange-900/80' };
      case 'lockpick':
        return { title: 'LOCKPICK', icon: Lock, bgColor: 'from-gray-800/80 to-slate-900/80' };
      case 'break_barricade':
        return { title: 'BREAK BARRICADE', icon: Hammer, bgColor: 'from-amber-900/80 to-orange-900/80' };
      default:
        return { title: 'SKILL CHECK', icon: Sparkles, bgColor: 'from-indigo-900/80 to-purple-900/80' };
    }
  };

  const skillInfo = getSkillInfo(skillCheckState.skill);
  const checkTypeInfo = getCheckTypeInfo(skillCheckState.checkType);
  const SkillIcon = skillInfo.icon;
  const CheckTypeIcon = checkTypeInfo.icon;

  // Render the result message
  const renderResult = () => {
    if (skillCheckState.passed) {
      return (
        <div className={`
          mt-4 px-6 py-3 rounded-lg text-center animate-in zoom-in-90 duration-300
          bg-green-900/80 text-green-100
          ${skillCheckState.isCritical ? 'ring-4 ring-gold animate-pulse' : ''}
        `}>
          <div className="flex items-center justify-center gap-2 text-xl font-display">
            <Check className="text-green-400" size={24} />
            <span>SUCCESS!</span>
            {skillCheckState.isCritical && <span className="text-gold">CRITICAL!</span>}
          </div>
          {skillCheckState.successMessage && (
            <div className="text-sm mt-1 opacity-80">{skillCheckState.successMessage}</div>
          )}
        </div>
      );
    } else {
      return (
        <div className="mt-4 px-6 py-3 rounded-lg text-center animate-in zoom-in-90 duration-300 bg-red-900/80 text-red-100">
          <div className="flex items-center justify-center gap-2 text-xl font-display">
            <X className="text-red-400" size={24} />
            <span>FAILED!</span>
          </div>
          {skillCheckState.failureMessage && (
            <div className="text-sm mt-1 opacity-80">{skillCheckState.failureMessage}</div>
          )}
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
      {/* Parchment-style skill check board */}
      <div
        className="relative w-[95vw] max-w-4xl h-auto py-8 px-4 md:px-8 flex flex-col items-center"
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

        {/* Header with check type */}
        <div className={`px-6 py-2 rounded-full bg-gradient-to-r ${checkTypeInfo.bgColor} text-white font-display text-lg mb-6 flex items-center gap-2`}>
          <CheckTypeIcon size={20} />
          <span>{checkTypeInfo.title}</span>
        </div>

        {/* Main content area */}
        <div className="flex items-center justify-between w-full gap-4 md:gap-8">
          {/* Left Side - Player */}
          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <h3 className="text-lg md:text-xl font-display text-[#433422] drop-shadow-sm">
              {player.name}
            </h3>

            {/* Player Portrait */}
            <div className="relative w-28 h-36 md:w-36 md:h-44 rounded-md overflow-hidden border-4 border-[#8b7355] shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
              <img
                src={playerPortrait}
                alt={player.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
            </div>

            {/* Skill indicator */}
            <div className={`flex items-center gap-1 px-3 py-1 bg-[#433422] rounded text-white font-bold text-sm shadow-lg`}>
              <SkillIcon size={14} className={skillInfo.color} />
              <span>{skillInfo.name}: {skillCheckState.diceCount}d6</span>
            </div>
          </div>

          {/* Center - Dice Area */}
          <div className="flex-1 flex flex-col items-center justify-center gap-4 min-w-0">
            {/* DC indicator */}
            <div className="text-center">
              <span className="text-xs uppercase tracking-widest font-bold text-[#433422]/70">
                Difficulty
              </span>
              <div className="text-3xl font-display text-[#433422]">
                DC {skillCheckState.dc}
              </div>
              <span className="text-xs text-[#433422]/60">
                (Need {skillCheckState.dc}+ on each die)
              </span>
            </div>

            {/* Dice display */}
            <div className="flex flex-wrap justify-center gap-2 md:gap-3">
              {displayDice.map((value, idx) => renderDie(value, idx, value >= skillCheckState.dc))}
            </div>

            {/* Successes count */}
            {phase !== 'rolling' && (
              <div className="text-center animate-in fade-in duration-300">
                <span className="text-sm font-bold text-[#433422]">
                  {skillCheckState.successes} {skillCheckState.successes === 1 ? 'success' : 'successes'}
                </span>
                <span className="text-sm text-[#433422]/70"> / Need 1+</span>
              </div>
            )}

            {/* Final Result */}
            {phase === 'final' && renderResult()}
          </div>

          {/* Right Side - Target (Door) */}
          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <h3 className="text-lg md:text-xl font-display text-[#433422] drop-shadow-sm">
              {skillCheckState.targetDescription}
            </h3>

            {/* Target visual */}
            <div className={`relative w-28 h-36 md:w-36 md:h-44 rounded-md overflow-hidden border-4 border-[#6b4423] shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] bg-gradient-to-br ${checkTypeInfo.bgColor} flex items-center justify-center`}>
              <CheckTypeIcon size={64} className="text-white/60" />

              {/* Lock indicator for lockpick */}
              {skillCheckState.checkType === 'lockpick' && (
                <div className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-amber-600 flex items-center justify-center">
                  <Lock className="text-white" size={20} />
                </div>
              )}

              {/* Force indicator */}
              {skillCheckState.checkType === 'force_door' && (
                <div className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-red-600 flex items-center justify-center animate-pulse">
                  <Hammer className="text-white" size={20} />
                </div>
              )}

              {/* Success/failure overlay */}
              {phase === 'final' && (
                <div className={`absolute inset-0 flex items-center justify-center ${
                  skillCheckState.passed
                    ? 'bg-green-500/30'
                    : 'bg-red-500/30'
                } animate-in fade-in duration-300`}>
                  {skillCheckState.passed ? (
                    <Check size={48} className="text-green-400" />
                  ) : (
                    <X size={48} className="text-red-400" />
                  )}
                </div>
              )}
            </div>

            {/* Target info */}
            <div className="flex items-center gap-1 px-3 py-1 bg-[#6b4423] rounded text-white font-bold text-sm shadow-lg">
              <Lock size={14} />
              <span>DC {skillCheckState.dc}</span>
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

export default SkillCheckOverlay;
