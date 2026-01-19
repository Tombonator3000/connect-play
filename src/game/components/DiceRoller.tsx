import React, { useEffect, useState } from 'react';
import { Sparkles, Skull, Check, X, Star } from 'lucide-react';

interface DiceRollerProps {
  values: number[];
  onComplete: () => void;
}

const DiceRoller: React.FC<DiceRollerProps> = ({ values, onComplete }) => {
  const [displayValues, setDisplayValues] = useState<number[]>(values.map(() => 1));
  const [rotations, setRotations] = useState<number[]>(values.map(() => 0));
  const [shakeOffsets, setShakeOffsets] = useState<{ x: number, y: number }[]>(values.map(() => ({ x: 0, y: 0 })));
  const [isRolling, setIsRolling] = useState(true);
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayValues(values.map(() => Math.floor(Math.random() * 6) + 1));
      setRotations(values.map(() => Math.random() * 360));
      setShakeOffsets(values.map(() => ({
        x: (Math.random() - 0.5) * 20,
        y: (Math.random() - 0.5) * 20
      })));
    }, 60);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      setDisplayValues(values);
      setRotations(values.map(() => 0));
      setShakeOffsets(values.map(() => ({ x: 0, y: 0 })));
      setIsRolling(false);
      setShowParticles(true);
      setTimeout(onComplete, 2500);
    }, 1200);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [values, onComplete]);

  const Particles = ({ type }: { type: 'crit' | 'fail' | 'normal' }) => {
    const color = type === 'crit' ? 'text-gold' : type === 'fail' ? 'text-primary' : 'text-green-400';
    const Icon = type === 'crit' ? Sparkles : type === 'fail' ? Skull : Star;

    return (
      <>
        {[...Array(12)].map((_, i) => {
          const angle = (i / 12) * 2 * Math.PI;
          const dist = type === 'crit' ? 150 : 100;
          const tx = Math.cos(angle) * dist + 'px';
          const ty = Math.sin(angle) * dist + 'px';
          return (
            <div
              key={i}
              className={`particle ${color}`}
              style={{ '--tx': tx, '--ty': ty } as React.CSSProperties}
            >
              <Icon size={type === 'crit' ? 24 : 16} />
            </div>
          );
        })}
      </>
    );
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[100] pointer-events-none">
      <div className="absolute inset-0 bg-background/70 backdrop-blur-md animate-in fade-in duration-300"></div>

      <div className="relative flex gap-8 items-center bg-card/95 px-20 py-16 rounded-3xl border-4 border-primary/50 shadow-[var(--shadow-doom)] animate-in zoom-in-90 duration-300">
        {displayValues.map((val, idx) => {
          const isCritSuccess = !isRolling && val === 6;
          const isSuccess = !isRolling && val >= 4 && val < 6;
          const isCritFail = !isRolling && val === 1;
          const isFail = !isRolling && val > 1 && val < 4;

          let containerClass = "w-32 h-32 rounded-2xl flex items-center justify-center text-7xl font-bold shadow-2xl transition-all duration-300 relative overflow-visible ";
          let textClass = "";

          if (isRolling) {
            containerClass += "bg-muted border-4 border-border text-muted-foreground scale-90 blur-[1px]";
          } else if (isCritSuccess) {
            containerClass += "bg-gradient-to-br from-amber-100 to-gold border-4 border-gold scale-125 z-20 shadow-[0_0_60px_hsla(45,90%,55%,0.8)] animate-bounce";
            textClass = "text-amber-800 drop-shadow-md";
          } else if (isSuccess) {
            containerClass += "bg-foreground border-4 border-green-600 scale-110 shadow-[0_0_30px_rgba(34,197,94,0.6)]";
            textClass = "text-green-700";
          } else if (isCritFail) {
            containerClass += "bg-red-950 border-4 border-primary rotate-12 scale-95 shadow-[var(--shadow-doom)] grayscale contrast-125";
            textClass = "text-primary line-through decoration-4 decoration-red-900";
          } else if (isFail) {
            containerClass += "bg-muted border-4 border-border opacity-70 scale-90 grayscale text-muted-foreground";
            textClass = "text-muted-foreground";
          }

          return (
            <div
              key={idx}
              className={containerClass}
              style={{
                transform: isRolling
                  ? `translate(${shakeOffsets[idx].x}px, ${shakeOffsets[idx].y}px) rotate(${rotations[idx]}deg)`
                  : isCritFail ? 'rotate(12deg)' : 'rotate(0deg)'
              }}
            >
              {!isRolling && isCritSuccess && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="absolute -top-3 -right-3"><Sparkles size={32} className="text-gold animate-[spin_3s_linear_infinite]" /></div>
                </div>
              )}

              {!isRolling && isCritFail && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="absolute top-2 right-2"><X size={24} className="text-primary" /></div>
                </div>
              )}

              {!isRolling && isSuccess && (
                <div className="absolute top-2 right-2"><Check size={24} className="text-green-600" /></div>
              )}

              <span className={`relative z-10 font-display ${textClass}`}>{val}</span>

              {showParticles && (
                <div className="absolute inset-0 pointer-events-none">
                  {isCritSuccess && <Particles type="crit" />}
                  {isSuccess && <Particles type="normal" />}
                  {isCritFail && <Particles type="fail" />}
                </div>
              )}

              {(isRolling || isSuccess) && (
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none rounded-xl"></div>
              )}
            </div>
          );
        })}
      </div>

      {!isRolling && (
        <div className="absolute bottom-20 text-center animate-in slide-in-from-bottom-8 duration-500">
          {values.some(v => v === 6) ? (
            <div className="text-gold font-display text-6xl uppercase tracking-widest drop-shadow-[0_0_20px_hsla(45,90%,55%,0.8)] animate-pulse">Critical Success!</div>
          ) : values.filter(v => v >= 4).length > 0 ? (
            <div className="text-green-400 font-display text-5xl uppercase tracking-widest drop-shadow-md">Success</div>
          ) : values.some(v => v === 1) ? (
            <div className="text-primary font-display text-6xl uppercase tracking-widest font-bold drop-shadow-[var(--shadow-doom)] animate-shake">Catastrophe!</div>
          ) : (
            <div className="text-muted-foreground font-display text-4xl uppercase tracking-widest">Failure</div>
          )}
        </div>
      )}
    </div>
  );
};

export default DiceRoller;
