
import React from 'react';
import { EventCard } from '../types';
import { Skull, AlertTriangle, Zap } from 'lucide-react';

interface EventModalProps {
  event: EventCard;
  onResolve: () => void;
}

const EventModal: React.FC<EventModalProps> = ({ event, onResolve }) => {
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6 backdrop-blur-md">
      <div className="bg-[#16213e] border-2 border-[#e94560] rounded-lg max-w-md w-full shadow-[0_0_50px_rgba(233,69,96,0.3)] animate-in slide-in-from-bottom-8 duration-500">
        <div className="bg-[#1a1a2e] p-4 flex items-center justify-between border-b border-[#e94560]/30">
          <h3 className="text-[#e94560] font-display text-2xl italic">{event.title}</h3>
          <AlertTriangle className="text-[#e94560]" size={20} />
        </div>

        <div className="p-8 text-center">
          {/* CSS gradient instead of external image */}
          <div className="mb-6 h-32 w-full rounded border border-slate-700 opacity-60" style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f1a 100%)'
          }}></div>

          <p className="text-lg text-slate-200 italic mb-8 font-serif">"{event.description}"</p>

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/40 rounded-full border border-slate-700 text-sm font-bold uppercase tracking-widest text-[#e94560]">
             <Zap size={16} /> Effect: {event.effectType === 'spawn' ? 'A monster appears!' : `${event.effectType} ${event.value > 0 ? '+' : ''}${event.value}`}
          </div>
        </div>

        <div className="p-4 bg-[#1a1a2e] flex justify-center border-t border-slate-800">
          <button
            onClick={onResolve}
            className="w-full py-3 bg-[#e94560] hover:bg-[#c9354d] text-white font-bold rounded uppercase tracking-widest transition-colors shadow-lg"
          >
            I must face this...
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
