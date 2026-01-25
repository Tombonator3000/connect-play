import React, { useEffect, useState, useRef } from 'react';

interface MythosPhaseOverlayProps {
  isVisible: boolean;
  onComplete: () => void;
}

const MythosPhaseOverlay: React.FC<MythosPhaseOverlayProps> = ({
  isVisible,
  onComplete,
}) => {
  const [phase, setPhase] = useState<'entering' | 'visible' | 'exiting' | 'hidden'>('hidden');
  // Use ref to store onComplete to avoid re-triggering useEffect on every render
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (isVisible) {
      setPhase('entering');

      // Show for 2 seconds then exit
      const showTimer = setTimeout(() => {
        setPhase('visible');
      }, 100);

      const exitTimer = setTimeout(() => {
        setPhase('exiting');
      }, 2000);

      const hideTimer = setTimeout(() => {
        setPhase('hidden');
        onCompleteRef.current();
      }, 2500);

      return () => {
        clearTimeout(showTimer);
        clearTimeout(exitTimer);
        clearTimeout(hideTimer);
      };
    } else {
      setPhase('hidden');
    }
  }, [isVisible]);

  if (phase === 'hidden') return null;

  return (
    <div
      className={`fixed inset-0 z-[90] flex items-center justify-center pointer-events-none transition-opacity duration-500 ${
        phase === 'entering' ? 'opacity-0' :
        phase === 'visible' ? 'opacity-100' :
        'opacity-0'
      }`}
    >
      {/* Dark overlay with gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-950/80 via-background/90 to-purple-950/80" />

      {/* Horizontal lines */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[200px]">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" />
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" />
      </div>

      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-purple-400 rounded-full animate-float opacity-40"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative text-center">
        {/* Title */}
        <h1
          className={`text-5xl md:text-7xl font-display tracking-[0.4em] uppercase text-transparent bg-clip-text bg-gradient-to-b from-purple-300 via-purple-400 to-purple-600 mb-4 transition-transform duration-700 ${
            phase === 'visible' ? 'scale-100' : 'scale-95'
          }`}
        >
          Mythos Phase
        </h1>

        {/* Subtitle */}
        <p
          className={`text-lg md:text-xl text-purple-300/80 italic font-serif transition-all duration-700 delay-200 ${
            phase === 'visible' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          The darkness grows...
        </p>

        {/* Decorative element */}
        <div className={`mt-8 flex justify-center gap-2 transition-opacity duration-500 delay-300 ${
          phase === 'visible' ? 'opacity-100' : 'opacity-0'
        }`}>
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MythosPhaseOverlay;
