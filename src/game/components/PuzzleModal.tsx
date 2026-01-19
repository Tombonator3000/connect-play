
import React, { useState, useEffect } from 'react';
import { Sparkles, Brain, X, Unlock, Lock } from 'lucide-react';

interface PuzzleModalProps {
  difficulty: number;
  onSolve: (success: boolean) => void;
}

const PuzzleModal: React.FC<PuzzleModalProps> = ({ difficulty, onSolve }) => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerInput, setPlayerInput] = useState<number[]>([]);
  const [gameState, setGameState] = useState<'showing' | 'input' | 'success' | 'fail'>('showing');
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);

  // Difficulty 3 = 4 steps, Difficulty 4 = 5 steps, etc.
  const sequenceLength = difficulty + 2;

  useEffect(() => {
    // Generate Sequence
    const newSeq = Array.from({ length: sequenceLength }, () => Math.floor(Math.random() * 9));
    setSequence(newSeq);
  }, [difficulty]);

  useEffect(() => {
    if (sequence.length > 0 && gameState === 'showing') {
      let step = 0;
      const interval = setInterval(() => {
        if (step >= sequence.length) {
          clearInterval(interval);
          setHighlightedIndex(null);
          setGameState('input');
        } else {
          setHighlightedIndex(sequence[step]);
          setTimeout(() => setHighlightedIndex(null), 500); // Light up duration
          step++;
        }
      }, 800); // Time between steps
      return () => clearInterval(interval);
    }
  }, [sequence, gameState]);

  const handleTileClick = (index: number) => {
    if (gameState !== 'input') return;

    const newInput = [...playerInput, index];
    setPlayerInput(newInput);

    // Check correctness immediately
    const currentStep = newInput.length - 1;
    if (newInput[currentStep] !== sequence[currentStep]) {
      setGameState('fail');
      setTimeout(() => onSolve(false), 1500);
      return;
    }

    if (newInput.length === sequence.length) {
      setGameState('success');
      setTimeout(() => onSolve(true), 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#16213e] border-2 border-purple-500 rounded-2xl shadow-[0_0_80px_rgba(168,85,247,0.4)] max-w-md w-full relative overflow-hidden animate-in zoom-in-95 duration-300">

        {/* Header */}
        <div className="bg-[#0a0a1a] p-4 border-b border-purple-500/30 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <Brain className="text-purple-400" size={24} />
                <h2 className="text-xl font-display text-purple-100 uppercase tracking-widest">Elder Sign Puzzle</h2>
            </div>
            <div className="text-xs text-purple-400 font-bold">
                {gameState === 'showing' ? 'MEMORIZE THE PATTERN' : gameState === 'input' ? 'REPEAT THE SEQUENCE' : gameState === 'success' ? 'UNLOCKED' : 'FAILED'}
            </div>
        </div>

        {/* Grid */}
        <div className="p-8 flex justify-center">
            <div className="grid grid-cols-3 gap-4">
                {Array.from({length: 9}).map((_, i) => (
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

        {/* Footer Status */}
        <div className="p-4 text-center border-t border-purple-900/50 bg-[#0a0a1a]">
            {gameState === 'showing' && <p className="text-purple-300/60 text-sm animate-pulse">Consulting the stars...</p>}
            {gameState === 'input' && <p className="text-white text-sm">Trace the sigil...</p>}
            {gameState === 'success' && <p className="text-green-400 font-bold tracking-widest flex items-center justify-center gap-2"><Unlock size={16}/> SEAL BROKEN</p>}
            {gameState === 'fail' && <p className="text-red-400 font-bold tracking-widest flex items-center justify-center gap-2"><Lock size={16}/> MENTAL BLOCK</p>}
        </div>

      </div>
    </div>
  );
};

export default PuzzleModal;
