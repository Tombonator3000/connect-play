/**
 * PuzzleModal - Multi-type puzzle system
 * Supports: sequence, code_lock, symbol_match, blood_ritual, astronomy
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Sparkles, Brain, X, Unlock, Lock,
  Star, Moon, Sun, Skull, Heart,
  KeyRound, Eye, Droplet, Flame,
  RotateCcw, Check
} from 'lucide-react';
import { PuzzleType } from '../types';

// ============================================================================
// SHARED TYPES AND CONSTANTS
// ============================================================================

interface PuzzleModalProps {
  type: PuzzleType;
  difficulty: number;
  onSolve: (success: boolean, cost?: { hp?: number; sanity?: number }) => void;
  code?: string;           // For code_lock puzzles
  symbols?: string[];      // For symbol_match puzzles
  hint?: string;           // Optional hint
  playerClass?: string;    // For class-specific effects (occultist blood ritual)
}

type GameState = 'showing' | 'input' | 'success' | 'fail';

// Symbol options for symbol_match puzzle
const SYMBOL_OPTIONS = [
  { id: 'star', icon: Star, name: 'Star' },
  { id: 'moon', icon: Moon, name: 'Moon' },
  { id: 'sun', icon: Sun, name: 'Sun' },
  { id: 'eye', icon: Eye, name: 'Eye' },
  { id: 'skull', icon: Skull, name: 'Skull' },
  { id: 'flame', icon: Flame, name: 'Flame' },
];

// ============================================================================
// SEQUENCE PUZZLE (Memory Pattern)
// ============================================================================

const SequencePuzzle: React.FC<{
  difficulty: number;
  onComplete: (success: boolean) => void;
}> = ({ difficulty, onComplete }) => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerInput, setPlayerInput] = useState<number[]>([]);
  const [gameState, setGameState] = useState<GameState>('showing');
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);

  // Refs for cleanup to prevent memory leaks
  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);
  const isMountedRef = useRef(true);

  const sequenceLength = difficulty + 2;

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      // Clear all pending timeouts
      timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
      timeoutRefs.current = [];
    };
  }, []);

  useEffect(() => {
    const newSeq = Array.from({ length: sequenceLength }, () => Math.floor(Math.random() * 9));
    setSequence(newSeq);
  }, [sequenceLength]);

  useEffect(() => {
    if (sequence.length > 0 && gameState === 'showing') {
      let step = 0;
      const interval = setInterval(() => {
        if (!isMountedRef.current) {
          clearInterval(interval);
          return;
        }
        if (step >= sequence.length) {
          clearInterval(interval);
          setHighlightedIndex(null);
          setGameState('input');
        } else {
          setHighlightedIndex(sequence[step]);
          // Track timeout for cleanup
          const timeout = setTimeout(() => {
            if (isMountedRef.current) {
              setHighlightedIndex(null);
            }
          }, 500);
          timeoutRefs.current.push(timeout);
          step++;
        }
      }, 800);
      return () => {
        clearInterval(interval);
        // Clear all pending timeouts when effect re-runs
        timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
        timeoutRefs.current = [];
      };
    }
  }, [sequence, gameState]);

  const handleTileClick = (index: number) => {
    if (gameState !== 'input') return;

    const newInput = [...playerInput, index];
    setPlayerInput(newInput);

    const currentStep = newInput.length - 1;
    if (newInput[currentStep] !== sequence[currentStep]) {
      setGameState('fail');
      const timeout = setTimeout(() => {
        if (isMountedRef.current) {
          onComplete(false);
        }
      }, 1500);
      timeoutRefs.current.push(timeout);
      return;
    }

    if (newInput.length === sequence.length) {
      setGameState('success');
      const timeout = setTimeout(() => {
        if (isMountedRef.current) {
          onComplete(true);
        }
      }, 1500);
      timeoutRefs.current.push(timeout);
    }
  };

  return (
    <>
      <div className="p-8 flex justify-center">
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <button
              key={i}
              disabled={gameState !== 'input'}
              onClick={() => handleTileClick(i)}
              className={`
                w-20 h-20 rounded-lg border-2 flex items-center justify-center transition-all duration-200
                ${highlightedIndex === i ? 'bg-purple-500 border-white shadow-[0_0_30px_#a855f7] scale-105' : 'bg-[#0a0a1a] border-purple-900'}
                ${gameState === 'input' ? 'hover:border-purple-400 cursor-pointer' : 'cursor-default'}
                ${gameState === 'success' ? 'bg-green-900 border-green-500' : ''}
                ${gameState === 'fail' ? 'bg-red-900 border-red-500' : ''}
              `}
            >
              <Sparkles
                size={24}
                className={`
                  transition-opacity duration-200
                  ${highlightedIndex === i ? 'opacity-100 text-white' : 'opacity-20 text-purple-800'}
                  ${gameState === 'success' ? 'text-green-400 opacity-100' : ''}
                  ${gameState === 'fail' ? 'text-red-400 opacity-100' : ''}
                `}
              />
            </button>
          ))}
        </div>
      </div>
      <StatusFooter gameState={gameState} type="sequence" />
    </>
  );
};

// ============================================================================
// CODE LOCK PUZZLE (Enter numeric code)
// ============================================================================

const CodeLockPuzzle: React.FC<{
  code: string;
  hint?: string;
  onComplete: (success: boolean) => void;
}> = ({ code, hint, onComplete }) => {
  const [input, setInput] = useState<string>('');
  const [gameState, setGameState] = useState<GameState>('input');
  const [attempts, setAttempts] = useState(3);

  // Refs for cleanup to prevent memory leaks
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleDigitClick = (digit: string) => {
    if (gameState !== 'input' || input.length >= 4) return;
    setInput(prev => prev + digit);
  };

  const handleClear = () => {
    setInput('');
  };

  const handleSubmit = () => {
    if (input === code) {
      setGameState('success');
      timeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          onComplete(true);
        }
      }, 1500);
    } else {
      setAttempts(prev => prev - 1);
      if (attempts <= 1) {
        setGameState('fail');
        timeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            onComplete(false);
          }
        }, 1500);
      } else {
        setInput('');
        // Shake animation would go here
      }
    }
  };

  return (
    <>
      <div className="p-6 flex flex-col items-center gap-4">
        {/* Code display */}
        <div className="flex gap-2">
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className={`
                w-14 h-16 rounded-lg border-2 flex items-center justify-center text-2xl font-mono font-bold
                ${gameState === 'success' ? 'bg-green-900 border-green-500 text-green-300' : ''}
                ${gameState === 'fail' ? 'bg-red-900 border-red-500 text-red-300' : ''}
                ${gameState === 'input' ? 'bg-[#0a0a1a] border-amber-700 text-amber-300' : ''}
              `}
            >
              {input[i] || '•'}
            </div>
          ))}
        </div>

        {/* Hint */}
        {hint && gameState === 'input' && (
          <p className="text-amber-400/70 text-xs italic text-center max-w-xs">
            Hint: {hint}
          </p>
        )}

        {/* Attempts remaining */}
        {gameState === 'input' && (
          <p className="text-red-400 text-xs">
            {attempts} attempt{attempts !== 1 ? 's' : ''} remaining
          </p>
        )}

        {/* Numpad */}
        {gameState === 'input' && (
          <div className="grid grid-cols-3 gap-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '✓'].map(key => (
              <button
                key={key}
                onClick={() => {
                  if (key === 'C') handleClear();
                  else if (key === '✓') handleSubmit();
                  else handleDigitClick(key);
                }}
                className={`
                  w-14 h-14 rounded-lg border-2 flex items-center justify-center text-xl font-bold transition-all
                  ${key === 'C' ? 'bg-red-900/50 border-red-700 text-red-300 hover:bg-red-800' : ''}
                  ${key === '✓' ? 'bg-green-900/50 border-green-700 text-green-300 hover:bg-green-800' : ''}
                  ${!['C', '✓'].includes(key) ? 'bg-[#0a0a1a] border-amber-900 text-amber-200 hover:border-amber-500 hover:bg-amber-900/30' : ''}
                `}
              >
                {key === '✓' ? <Check size={20} /> : key === 'C' ? <RotateCcw size={18} /> : key}
              </button>
            ))}
          </div>
        )}
      </div>
      <StatusFooter gameState={gameState} type="code_lock" />
    </>
  );
};

// ============================================================================
// SYMBOL MATCH PUZZLE (Match symbols in order)
// ============================================================================

const SymbolMatchPuzzle: React.FC<{
  targetSymbols: string[];
  onComplete: (success: boolean) => void;
}> = ({ targetSymbols, onComplete }) => {
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([]);
  const [gameState, setGameState] = useState<GameState>('input');
  const [showTarget, setShowTarget] = useState(true);

  // Refs for cleanup to prevent memory leaks
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Show target symbols for 3 seconds, then hide
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isMountedRef.current) {
        setShowTarget(false);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleSymbolClick = (symbolId: string) => {
    if (gameState !== 'input') return;
    if (selectedSymbols.length >= 3) return;

    const newSelection = [...selectedSymbols, symbolId];
    setSelectedSymbols(newSelection);

    // Check if complete
    if (newSelection.length === 3) {
      const isCorrect = newSelection.every((s, i) => s === targetSymbols[i]);
      if (isCorrect) {
        setGameState('success');
        timeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            onComplete(true);
          }
        }, 1500);
      } else {
        setGameState('fail');
        timeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            onComplete(false);
          }
        }, 1500);
      }
    }
  };

  const handleReset = () => {
    setSelectedSymbols([]);
  };

  return (
    <>
      <div className="p-6 flex flex-col items-center gap-4">
        {/* Target symbols (shown briefly) */}
        {showTarget && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10 animate-pulse">
            <p className="text-purple-300 mb-4 text-sm">MEMORIZE THIS SEQUENCE</p>
            <div className="flex gap-4">
              {targetSymbols.map((symbolId, i) => {
                const symbol = SYMBOL_OPTIONS.find(s => s.id === symbolId);
                if (!symbol) return null;
                const Icon = symbol.icon;
                return (
                  <div key={i} className="w-16 h-16 bg-purple-900 border-2 border-purple-400 rounded-lg flex items-center justify-center">
                    <Icon size={32} className="text-purple-300" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Selected symbols display */}
        <div className="flex gap-2 mb-4">
          {[0, 1, 2].map(i => {
            const symbolId = selectedSymbols[i];
            const symbol = symbolId ? SYMBOL_OPTIONS.find(s => s.id === symbolId) : null;
            return (
              <div
                key={i}
                className={`
                  w-16 h-16 rounded-lg border-2 flex items-center justify-center
                  ${gameState === 'success' ? 'bg-green-900 border-green-500' : ''}
                  ${gameState === 'fail' ? 'bg-red-900 border-red-500' : ''}
                  ${gameState === 'input' ? 'bg-[#0a0a1a] border-purple-700' : ''}
                `}
              >
                {symbol && <symbol.icon size={28} className={
                  gameState === 'success' ? 'text-green-300' :
                  gameState === 'fail' ? 'text-red-300' : 'text-purple-300'
                } />}
              </div>
            );
          })}
        </div>

        {/* Symbol options */}
        {gameState === 'input' && (
          <>
            <div className="grid grid-cols-3 gap-3">
              {SYMBOL_OPTIONS.map(symbol => {
                const Icon = symbol.icon;
                return (
                  <button
                    key={symbol.id}
                    onClick={() => handleSymbolClick(symbol.id)}
                    className="w-16 h-16 bg-[#0a0a1a] border-2 border-purple-900 rounded-lg flex items-center justify-center hover:border-purple-400 hover:bg-purple-900/30 transition-all"
                  >
                    <Icon size={28} className="text-purple-400" />
                  </button>
                );
              })}
            </div>
            <button
              onClick={handleReset}
              className="text-purple-400 text-sm flex items-center gap-1 hover:text-purple-300 mt-2"
            >
              <RotateCcw size={14} /> Reset
            </button>
          </>
        )}
      </div>
      <StatusFooter gameState={gameState} type="symbol_match" />
    </>
  );
};

// ============================================================================
// BLOOD RITUAL PUZZLE (Sacrifice HP or Sanity)
// ============================================================================

const BloodRitualPuzzle: React.FC<{
  difficulty: number;
  playerClass?: string;
  onComplete: (success: boolean, cost?: { hp?: number; sanity?: number }) => void;
}> = ({ difficulty, playerClass, onComplete }) => {
  const [selectedCost, setSelectedCost] = useState<'hp' | 'sanity' | null>(null);
  const [gameState, setGameState] = useState<GameState>('input');

  // Refs for cleanup to prevent memory leaks
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Calculate costs based on difficulty
  const hpCost = Math.max(1, difficulty - 1);
  const sanityCost = Math.max(1, difficulty - 2);

  // Occultist can use sanity instead of HP with reduced cost
  const isOccultist = playerClass === 'occultist';
  const adjustedSanityCost = isOccultist ? Math.max(1, sanityCost - 1) : sanityCost;

  const handleSacrifice = (type: 'hp' | 'sanity') => {
    setSelectedCost(type);
    setGameState('success');

    timeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        onComplete(true, {
          hp: type === 'hp' ? hpCost : 0,
          sanity: type === 'sanity' ? adjustedSanityCost : 0,
        });
      }
    }, 1500);
  };

  const handleRefuse = () => {
    setGameState('fail');
    timeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        onComplete(false);
      }
    }, 1500);
  };

  return (
    <>
      <div className="p-6 flex flex-col items-center gap-6">
        {/* Ritual description */}
        <p className="text-red-300/80 text-center text-sm max-w-xs">
          The seal demands a blood price. Choose your sacrifice to break it.
        </p>

        {/* Sacrifice options */}
        {gameState === 'input' && (
          <div className="flex gap-4">
            {/* HP sacrifice */}
            <button
              onClick={() => handleSacrifice('hp')}
              className="flex flex-col items-center gap-2 p-4 bg-red-900/30 border-2 border-red-700 rounded-lg hover:bg-red-800/40 hover:border-red-500 transition-all"
            >
              <Heart className="text-red-400" size={32} />
              <span className="text-red-300 font-bold">-{hpCost} HP</span>
              <span className="text-red-400/60 text-xs">Blood Price</span>
            </button>

            {/* Sanity sacrifice */}
            <button
              onClick={() => handleSacrifice('sanity')}
              className="flex flex-col items-center gap-2 p-4 bg-purple-900/30 border-2 border-purple-700 rounded-lg hover:bg-purple-800/40 hover:border-purple-500 transition-all"
            >
              <Brain className="text-purple-400" size={32} />
              <span className="text-purple-300 font-bold">-{adjustedSanityCost} SAN</span>
              <span className="text-purple-400/60 text-xs">
                {isOccultist ? 'Occultist Bonus' : 'Mind Price'}
              </span>
            </button>
          </div>
        )}

        {/* Refuse option */}
        {gameState === 'input' && (
          <button
            onClick={handleRefuse}
            className="text-gray-500 text-sm hover:text-gray-400 transition-colors"
          >
            Refuse (Door remains sealed)
          </button>
        )}

        {/* Success display */}
        {gameState === 'success' && (
          <div className="flex flex-col items-center gap-2 animate-pulse">
            <Droplet className="text-red-500" size={48} />
            <p className="text-red-300">The seal accepts your offering...</p>
          </div>
        )}
      </div>
      <StatusFooter gameState={gameState} type="blood_ritual" />
    </>
  );
};

// ============================================================================
// ASTRONOMY PUZZLE (Rotate dials to align stars)
// ============================================================================

const AstronomyPuzzle: React.FC<{
  difficulty: number;
  onComplete: (success: boolean) => void;
}> = ({ difficulty, onComplete }) => {
  // Generate target positions based on difficulty
  const dialCount = Math.min(4, difficulty);
  const [targetPositions] = useState<number[]>(() =>
    Array.from({ length: dialCount }, () => Math.floor(Math.random() * 8))
  );
  const [currentPositions, setCurrentPositions] = useState<number[]>(() =>
    Array.from({ length: dialCount }, () => Math.floor(Math.random() * 8))
  );
  const [gameState, setGameState] = useState<GameState>('input');

  // Refs for cleanup to prevent memory leaks
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const rotateDial = (dialIndex: number) => {
    if (gameState !== 'input') return;

    const newPositions = [...currentPositions];
    newPositions[dialIndex] = (newPositions[dialIndex] + 1) % 8;
    setCurrentPositions(newPositions);

    // Check if all dials are aligned
    if (newPositions.every((pos, i) => pos === targetPositions[i])) {
      setGameState('success');
      timeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          onComplete(true);
        }
      }, 1500);
    }
  };

  // Star positions around the dial (8 positions)
  const getStarPosition = (index: number, dialPosition: number) => {
    const angle = ((index - dialPosition) * 45 - 90) * (Math.PI / 180);
    const radius = 28;
    return {
      left: `${50 + Math.cos(angle) * radius}%`,
      top: `${50 + Math.sin(angle) * radius}%`,
    };
  };

  return (
    <>
      <div className="p-6 flex flex-col items-center gap-4">
        <p className="text-blue-300/80 text-sm text-center">
          Rotate the star charts to align with the Elder constellation
        </p>

        {/* Target constellation (small hint) */}
        <div className="flex gap-2 mb-2">
          {targetPositions.map((pos, i) => (
            <div key={i} className="text-xs text-blue-400/50">
              ★{pos + 1}
            </div>
          ))}
        </div>

        {/* Dials */}
        <div className="flex gap-4">
          {currentPositions.map((position, dialIndex) => (
            <button
              key={dialIndex}
              onClick={() => rotateDial(dialIndex)}
              disabled={gameState !== 'input'}
              className={`
                relative w-20 h-20 rounded-full border-2 transition-all
                ${gameState === 'success' ? 'bg-blue-900 border-blue-400' : 'bg-[#0a0a1a] border-blue-900'}
                ${gameState === 'input' ? 'hover:border-blue-500 cursor-pointer' : ''}
              `}
            >
              {/* Stars around the dial */}
              {[0, 1, 2, 3, 4, 5, 6, 7].map(starIndex => {
                const style = getStarPosition(starIndex, position);
                const isTarget = starIndex === 0; // Top position is target
                return (
                  <Star
                    key={starIndex}
                    size={isTarget ? 14 : 10}
                    className={`
                      absolute transform -translate-x-1/2 -translate-y-1/2 transition-all
                      ${isTarget ? 'text-yellow-400' : 'text-blue-700'}
                      ${gameState === 'success' && isTarget ? 'text-green-400' : ''}
                    `}
                    style={style}
                    fill={isTarget ? 'currentColor' : 'none'}
                  />
                );
              })}
              {/* Center indicator */}
              <div className={`
                absolute top-1/2 left-1/2 w-3 h-3 rounded-full transform -translate-x-1/2 -translate-y-1/2
                ${currentPositions[dialIndex] === targetPositions[dialIndex] ? 'bg-green-500' : 'bg-blue-700'}
              `} />
            </button>
          ))}
        </div>

        {/* Instructions */}
        {gameState === 'input' && (
          <p className="text-blue-400/60 text-xs">Click to rotate • Align the bright star to the top</p>
        )}
      </div>
      <StatusFooter gameState={gameState} type="astronomy" />
    </>
  );
};

// ============================================================================
// STATUS FOOTER COMPONENT
// ============================================================================

const StatusFooter: React.FC<{ gameState: GameState; type: PuzzleType }> = ({ gameState, type }) => {
  const messages: Record<PuzzleType, { showing: string; input: string; success: string; fail: string }> = {
    sequence: {
      showing: 'Consulting the stars...',
      input: 'Trace the sigil...',
      success: 'SEAL BROKEN',
      fail: 'MENTAL BLOCK',
    },
    code_lock: {
      showing: 'Reading the mechanism...',
      input: 'Enter the code...',
      success: 'LOCK OPENED',
      fail: 'MECHANISM JAMMED',
    },
    symbol_match: {
      showing: 'Ancient symbols appear...',
      input: 'Match the symbols...',
      success: 'SYMBOLS ALIGNED',
      fail: 'WRONG PATTERN',
    },
    blood_ritual: {
      showing: 'The seal pulses...',
      input: 'Choose your sacrifice...',
      success: 'OFFERING ACCEPTED',
      fail: 'SEAL REMAINS',
    },
    astronomy: {
      showing: 'Stars begin to shine...',
      input: 'Align the constellation...',
      success: 'STARS ALIGNED',
      fail: 'MISALIGNED',
    },
    pressure_plate: {
      showing: 'A mechanism clicks...',
      input: 'Stand on the plate...',
      success: 'PLATE ACTIVATED',
      fail: 'PLATE RELEASED',
    },
  };

  const msg = messages[type] || messages.sequence;

  return (
    <div className="p-4 text-center border-t border-purple-900/50 bg-[#0a0a1a]">
      {gameState === 'showing' && <p className="text-purple-300/60 text-sm animate-pulse">{msg.showing}</p>}
      {gameState === 'input' && <p className="text-white text-sm">{msg.input}</p>}
      {gameState === 'success' && (
        <p className="text-green-400 font-bold tracking-widest flex items-center justify-center gap-2">
          <Unlock size={16} /> {msg.success}
        </p>
      )}
      {gameState === 'fail' && (
        <p className="text-red-400 font-bold tracking-widest flex items-center justify-center gap-2">
          <Lock size={16} /> {msg.fail}
        </p>
      )}
    </div>
  );
};

// ============================================================================
// MAIN PUZZLE MODAL
// ============================================================================

const PuzzleModal: React.FC<PuzzleModalProps> = ({
  type,
  difficulty,
  onSolve,
  code,
  symbols,
  hint,
  playerClass
}) => {
  // Get title and icon based on puzzle type
  const getPuzzleInfo = () => {
    switch (type) {
      case 'code_lock':
        return { title: 'Combination Lock', icon: KeyRound, color: 'amber' };
      case 'symbol_match':
        return { title: 'Symbol Seal', icon: Eye, color: 'purple' };
      case 'blood_ritual':
        return { title: 'Blood Seal', icon: Droplet, color: 'red' };
      case 'astronomy':
        return { title: 'Star Chart', icon: Star, color: 'blue' };
      case 'pressure_plate':
        return { title: 'Pressure Plate', icon: Sparkles, color: 'green' };
      default:
        return { title: 'Elder Sign Puzzle', icon: Brain, color: 'purple' };
    }
  };

  const { title, icon: Icon, color } = getPuzzleInfo();

  // Generate symbols if not provided
  const puzzleSymbols = symbols || Array.from({ length: 3 }, () =>
    SYMBOL_OPTIONS[Math.floor(Math.random() * SYMBOL_OPTIONS.length)].id
  );

  // Generate code if not provided
  const puzzleCode = code || String(1000 + Math.floor(Math.random() * 9000));

  const renderPuzzle = () => {
    switch (type) {
      case 'code_lock':
        return <CodeLockPuzzle code={puzzleCode} hint={hint} onComplete={onSolve} />;
      case 'symbol_match':
        return <SymbolMatchPuzzle targetSymbols={puzzleSymbols} onComplete={onSolve} />;
      case 'blood_ritual':
        return <BloodRitualPuzzle difficulty={difficulty} playerClass={playerClass} onComplete={onSolve} />;
      case 'astronomy':
        return <AstronomyPuzzle difficulty={difficulty} onComplete={onSolve} />;
      default:
        return <SequencePuzzle difficulty={difficulty} onComplete={onSolve} />;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className={`bg-[#16213e] border-2 border-${color}-500 rounded-2xl shadow-[0_0_80px_rgba(168,85,247,0.4)] max-w-md w-full relative overflow-hidden animate-in zoom-in-95 duration-300`}>
        {/* Header */}
        <div className="bg-[#0a0a1a] p-4 border-b border-purple-500/30 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Icon className={`text-${color}-400`} size={24} />
            <h2 className="text-xl font-display text-purple-100 uppercase tracking-widest">{title}</h2>
          </div>
          <div className="text-xs text-purple-400 font-bold">
            DIFFICULTY {difficulty}
          </div>
        </div>

        {/* Puzzle content */}
        {renderPuzzle()}
      </div>
    </div>
  );
};

export default PuzzleModal;
