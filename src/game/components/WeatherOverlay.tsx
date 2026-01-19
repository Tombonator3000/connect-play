import React, { useMemo } from 'react';
import { Cloud, CloudRain, Skull, Sparkles } from 'lucide-react';
import { WeatherCondition, WeatherType } from '../types';
import { getWeatherEffect, getIntensityModifier } from '../constants';

interface WeatherOverlayProps {
  weather: WeatherCondition | null;
  className?: string;
}

/**
 * Generates fog particle elements
 */
const FogParticles: React.FC<{ count: number; intensity: number }> = ({ count, intensity }) => {
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const size = 40 + Math.random() * 60;
      const delay = Math.random() * 15;
      const duration = 20 + Math.random() * 15;
      const startY = Math.random() * 100;
      const startX = -20 + Math.random() * 120;
      const opacity = (0.15 + Math.random() * 0.25) * intensity;

      return {
        id: i,
        size,
        delay,
        duration,
        startY,
        startX,
        opacity
      };
    });
  }, [count, intensity]);

  return (
    <div className="weather-fog-particles absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute animate-fog-drift"
          style={{
            top: `${p.startY}%`,
            left: `${p.startX}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            opacity: p.opacity
          }}
        >
          <Cloud
            size={p.size}
            className="text-slate-400/50 blur-[2px]"
            strokeWidth={1}
          />
        </div>
      ))}
    </div>
  );
};

/**
 * Generates rain streaks
 */
const RainEffect: React.FC<{ count: number; intensity: number }> = ({ count, intensity }) => {
  const drops = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const left = Math.random() * 100;
      const delay = Math.random() * 2;
      const duration = 0.3 + Math.random() * 0.4;
      const height = 15 + Math.random() * 25;

      return {
        id: i,
        left,
        delay,
        duration,
        height
      };
    });
  }, [count]);

  return (
    <div
      className="weather-rain absolute inset-0 overflow-hidden pointer-events-none"
      style={{ opacity: 0.3 + intensity * 0.3 }}
    >
      {drops.map(d => (
        <div
          key={d.id}
          className="absolute w-[1px] bg-gradient-to-b from-transparent via-blue-300/40 to-blue-400/60 animate-rain-fall"
          style={{
            left: `${d.left}%`,
            height: `${d.height}px`,
            animationDelay: `${d.delay}s`,
            animationDuration: `${d.duration}s`
          }}
        />
      ))}
    </div>
  );
};

/**
 * Generates miasma particles (supernatural fog)
 */
const MiasmaEffect: React.FC<{ count: number; intensity: number }> = ({ count, intensity }) => {
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const size = 20 + Math.random() * 40;
      const delay = Math.random() * 8;
      const duration = 6 + Math.random() * 8;
      const startY = Math.random() * 100;
      const startX = Math.random() * 100;
      const isGreen = Math.random() > 0.5;
      const opacity = (0.2 + Math.random() * 0.3) * intensity;

      return {
        id: i,
        size,
        delay,
        duration,
        startY,
        startX,
        isGreen,
        opacity
      };
    });
  }, [count, intensity]);

  return (
    <div className="weather-miasma absolute inset-0 overflow-hidden pointer-events-none">
      {/* Base gradient overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-purple-900/20 via-transparent to-green-900/10"
        style={{ opacity: intensity * 0.5 }}
      />

      {/* Floating particles */}
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute animate-miasma-float"
          style={{
            top: `${p.startY}%`,
            left: `${p.startX}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            opacity: p.opacity
          }}
        >
          <div
            className={`rounded-full blur-lg ${
              p.isGreen
                ? 'bg-green-500/40'
                : 'bg-purple-500/40'
            }`}
            style={{
              width: p.size,
              height: p.size
            }}
          />
        </div>
      ))}

      {/* Occasional skull glimpses */}
      <div className="absolute inset-0">
        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={`skull-${i}`}
            className="absolute animate-miasma-skull"
            style={{
              top: `${20 + i * 30}%`,
              left: `${10 + i * 35}%`,
              animationDelay: `${i * 4}s`
            }}
          >
            <Skull
              size={24}
              className="text-purple-400/20"
              strokeWidth={1}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Generates cosmic static effect (reality distortion)
 */
const CosmicStaticEffect: React.FC<{ count: number; intensity: number }> = ({ count, intensity }) => {
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const size = 2 + Math.random() * 6;
      const delay = Math.random() * 3;
      const duration = 0.5 + Math.random() * 1.5;
      const startY = Math.random() * 100;
      const startX = Math.random() * 100;
      const isSparkle = Math.random() > 0.7;

      return {
        id: i,
        size,
        delay,
        duration,
        startY,
        startX,
        isSparkle
      };
    });
  }, [count]);

  return (
    <div className="weather-cosmic-static absolute inset-0 overflow-hidden pointer-events-none">
      {/* Static noise overlay */}
      <div
        className="absolute inset-0 animate-cosmic-noise"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.15'/%3E%3C/svg%3E")`,
          opacity: intensity * 0.4,
          mixBlendMode: 'overlay'
        }}
      />

      {/* Color distortion bars */}
      <div
        className="absolute inset-0 animate-cosmic-glitch"
        style={{ opacity: intensity * 0.15 }}
      >
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={`bar-${i}`}
            className="absolute w-full h-[2px] animate-glitch-bar"
            style={{
              top: `${10 + i * 20}%`,
              background: `linear-gradient(90deg,
                transparent 0%,
                rgba(255,0,255,0.3) ${20 + Math.random() * 20}%,
                rgba(0,255,255,0.3) ${50 + Math.random() * 20}%,
                transparent 100%)`,
              animationDelay: `${i * 0.5}s`
            }}
          />
        ))}
      </div>

      {/* Static particles */}
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute animate-cosmic-flicker"
          style={{
            top: `${p.startY}%`,
            left: `${p.startX}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`
          }}
        >
          {p.isSparkle ? (
            <Sparkles
              size={p.size * 3}
              className="text-cyan-300/50"
              strokeWidth={1}
            />
          ) : (
            <div
              className="bg-white/60 rounded-full"
              style={{
                width: p.size,
                height: p.size
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
};

/**
 * Weather indicator showing current weather condition
 */
const WeatherIndicator: React.FC<{ weather: WeatherCondition }> = ({ weather }) => {
  const effect = getWeatherEffect(weather.type);

  const getWeatherIcon = () => {
    switch (weather.type) {
      case 'fog': return <Cloud size={16} className="text-slate-300" />;
      case 'rain': return <CloudRain size={16} className="text-blue-300" />;
      case 'miasma': return <Skull size={16} className="text-purple-400" />;
      case 'cosmic_static': return <Sparkles size={16} className="text-cyan-300" />;
      default: return null;
    }
  };

  if (weather.type === 'clear') return null;

  return (
    <div className="absolute top-4 left-4 z-50 flex items-center gap-2 bg-card/80 backdrop-blur-sm border border-border rounded-lg px-3 py-2 animate-fadeIn">
      {getWeatherIcon()}
      <div className="flex flex-col">
        <span className="text-xs font-bold text-foreground">{effect.name}</span>
        <span className="text-[10px] text-muted-foreground capitalize">{weather.intensity}</span>
      </div>
      {weather.duration > 0 && (
        <span className="text-[10px] text-muted-foreground ml-2">
          {weather.duration} rnd
        </span>
      )}
    </div>
  );
};

/**
 * WeatherOverlay - Renders weather visual effects over the game board
 *
 * Supports:
 * - Fog: Drifting cloud particles
 * - Rain: Diagonal rain streaks
 * - Miasma: Purple/green supernatural particles
 * - Cosmic Static: Reality distortion with noise and glitches
 */
const WeatherOverlay: React.FC<WeatherOverlayProps> = ({ weather, className = '' }) => {
  if (!weather || weather.type === 'clear') return null;

  const effect = getWeatherEffect(weather.type);
  const intensity = getIntensityModifier(weather.intensity);
  const particleCount = Math.floor(effect.particleCount * intensity);

  return (
    <div
      className={`weather-overlay absolute inset-0 pointer-events-none z-30 ${effect.visualClass} ${className}`}
      style={{ opacity: effect.opacity * intensity }}
    >
      {/* Weather indicator */}
      <WeatherIndicator weather={weather} />

      {/* Weather-specific effects */}
      {weather.type === 'fog' && (
        <FogParticles count={particleCount} intensity={intensity} />
      )}

      {weather.type === 'rain' && (
        <RainEffect count={particleCount} intensity={intensity} />
      )}

      {weather.type === 'miasma' && (
        <MiasmaEffect count={particleCount} intensity={intensity} />
      )}

      {weather.type === 'cosmic_static' && (
        <CosmicStaticEffect count={particleCount} intensity={intensity} />
      )}

      {/* Vignette overlay for all weather */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.3) 100%)'
        }}
      />
    </div>
  );
};

export default WeatherOverlay;
