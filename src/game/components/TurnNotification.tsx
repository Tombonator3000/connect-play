
import React from 'react';
import { Player } from '../types';

interface TurnNotificationProps {
  player: Player | null;
  phase: string;
}

const TurnNotification: React.FC<TurnNotificationProps> = ({ player, phase }) => {
  if (phase === 'mythos') {
      return (
        <div className="fixed top-1/3 left-0 right-0 z-[100] pointer-events-none flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
            <div className="bg-black/60 backdrop-blur-sm w-full py-8 border-y-2 border-purple-900/50 flex flex-col items-center">
                <h2 className="text-6xl font-display text-purple-500 uppercase tracking-[0.2em] drop-shadow-[0_0_15px_rgba(168,85,247,0.8)] animate-pulse">
                    Mythos Phase
                </h2>
                <p className="text-purple-300 font-serif italic text-xl mt-2">The darkness grows...</p>
            </div>
        </div>
      );
  }

  if (!player) return null;

  return (
    <div className="fixed top-1/3 left-0 right-0 z-[100] pointer-events-none flex flex-col items-center justify-center animate-in slide-in-from-left duration-500 fade-out-0">
      <div className="bg-gradient-to-r from-transparent via-[#16213e]/90 to-transparent w-full py-6 flex flex-col items-center relative overflow-hidden">
        {/* Decorative Lines */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#e94560] to-transparent opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#e94560] to-transparent opacity-50"></div>

        <div className="flex items-center gap-4">
            <div className="text-left">
                <h2 className="text-5xl font-display text-slate-100 uppercase tracking-widest drop-shadow-md">
                    {player.name}
                </h2>
                <p className="text-[#e94560] font-bold text-sm uppercase tracking-[0.4em] translate-x-1">
                    Investigator Turn
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default TurnNotification;
