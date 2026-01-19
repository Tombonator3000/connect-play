import React, { useMemo } from 'react';
import { Cloud, CloudRain, Skull, Sparkles, CloudFog, Lightbulb, Moon, Eye } from 'lucide-react';
import { WeatherCondition, WeatherType } from '../types';
import { getWeatherEffect, getIntensityModifier } from '../constants';

/**
 * AmbientDarkClouds - Permanent ominous clouds drifting across the screen
 * Creates an ever-present feeling of dread regardless of weather conditions
 *
 * "Mørke skyer skal alltid bevege seg over hele skjermen vagt for å skape en litt uggen følelse"
 */
const AmbientDarkClouds: React.FC<{ intensity?: number }> = ({ intensity = 1 }) => {
  const clouds = useMemo(() => {
    // Layer 1: Fast-moving foreground clouds
    const foregroundClouds = Array.from({ length: 8 }, (_, i) => ({
      id: `fg-${i}`,
      size: 120 + Math.random() * 180,
      delay: i * 5 + Math.random() * 10,
      duration: 40 + Math.random() * 20,
      startY: -10 + Math.random() * 40,
      opacity: (0.08 + Math.random() * 0.12) * intensity,
      layer: 'foreground' as const
    }));

    // Layer 2: Slow-moving background clouds (parallax effect)
    const backgroundClouds = Array.from({ length: 6 }, (_, i) => ({
      id: `bg-${i}`,
      size: 200 + Math.random() * 250,
      delay: i * 8 + Math.random() * 15,
      duration: 55 + Math.random() * 25,
      startY: 5 + Math.random() * 35,
      opacity: (0.05 + Math.random() * 0.08) * intensity,
      layer: 'background' as const
    }));

    return [...backgroundClouds, ...foregroundClouds];
  }, [intensity]);

  return (
    <div className="ambient-dark-clouds absolute inset-0 overflow-hidden pointer-events-none z-10">
      {/* Subtle darkening gradient at top */}
      <div
        className="absolute inset-0 animate-ambient-dread"
        style={{
          background: 'linear-gradient(180deg, rgba(10, 10, 20, 0.15) 0%, transparent 25%, transparent 80%, rgba(10, 10, 20, 0.08) 100%)'
        }}
      />

      {/* Passing cloud shadows on the ground */}
      <div className="absolute inset-0">
        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={`shadow-${i}`}
            className="absolute w-[150%] h-[40%] animate-cloud-shadow"
            style={{
              top: `${20 + i * 25}%`,
              background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.08), transparent)',
              animationDelay: `${i * 8}s`,
              animationDuration: `${22 + i * 4}s`
            }}
          />
        ))}
      </div>

      {/* Drifting dark clouds */}
      {clouds.map(cloud => (
        <div
          key={cloud.id}
          className={`absolute ${cloud.layer === 'foreground' ? 'animate-dark-cloud-drift' : 'animate-dark-cloud-drift-slow'}`}
          style={{
            top: `${cloud.startY}%`,
            left: '-20%',
            animationDelay: `${cloud.delay}s`,
            animationDuration: `${cloud.duration}s`,
            opacity: cloud.opacity,
            filter: cloud.layer === 'background' ? 'blur(4px)' : 'blur(2px)'
          }}
        >
          <CloudFog
            size={cloud.size}
            className="text-slate-900/80"
            strokeWidth={0.5}
          />
        </div>
      ))}

      {/* Very subtle vignette for depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.08) 100%)'
        }}
      />
    </div>
  );
};

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
 * Generates unnatural glow effect - eldritch phosphorescence
 */
const UnnaturalGlowEffect: React.FC<{ count: number; intensity: number }> = ({ count, intensity }) => {
  const glowSources = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const size = 60 + Math.random() * 120;
      const delay = Math.random() * 6;
      const duration = 4 + Math.random() * 4;
      const startY = Math.random() * 100;
      const startX = Math.random() * 100;
      const hue = 100 + Math.random() * 60; // Green to cyan range

      return {
        id: i,
        size,
        delay,
        duration,
        startY,
        startX,
        hue
      };
    });
  }, [count]);

  return (
    <div className="weather-unnatural-glow absolute inset-0 overflow-hidden pointer-events-none">
      {/* Shifting color background */}
      <div
        className="absolute inset-0 animate-color-shift"
        style={{ opacity: intensity * 0.4 }}
      />

      {/* Pulsing glow overlay */}
      <div
        className="absolute inset-0 animate-unnatural-pulse"
        style={{
          background: 'radial-gradient(ellipse at 40% 60%, rgba(100, 255, 150, 0.15), transparent 70%)',
          opacity: intensity * 0.6
        }}
      />

      {/* Flickering glow sources */}
      {glowSources.map(g => (
        <div
          key={g.id}
          className="absolute animate-glow-flicker"
          style={{
            top: `${g.startY}%`,
            left: `${g.startX}%`,
            animationDelay: `${g.delay}s`,
            animationDuration: `${g.duration}s`
          }}
        >
          <div
            className="rounded-full blur-xl"
            style={{
              width: g.size,
              height: g.size,
              background: `radial-gradient(circle, hsla(${g.hue}, 80%, 60%, 0.3), transparent 70%)`,
              opacity: intensity * 0.5
            }}
          />
        </div>
      ))}

      {/* Occasional eye glimpses in the glow */}
      <div className="absolute inset-0">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={`eye-${i}`}
            className="absolute animate-glow-flicker"
            style={{
              top: `${15 + i * 20}%`,
              left: `${20 + (i % 2) * 50}%`,
              animationDelay: `${i * 2}s`,
              animationDuration: `${5 + Math.random() * 3}s`
            }}
          >
            <Eye
              size={12}
              className="text-green-400/20"
              strokeWidth={1}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Generates darkness effect - oppressive, light-eating void
 */
const DarknessEffect: React.FC<{ count: number; intensity: number }> = ({ count, intensity }) => {
  const tendrils = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const width = 30 + Math.random() * 70;
      const delay = Math.random() * 12;
      const duration = 10 + Math.random() * 8;
      const startX = Math.random() * 100;

      return {
        id: i,
        width,
        delay,
        duration,
        startX
      };
    });
  }, [count]);

  return (
    <div className="weather-darkness absolute inset-0 overflow-hidden pointer-events-none">
      {/* Deep darkness vignette */}
      <div
        className="absolute inset-0 animate-darkness-creep"
        style={{
          background: `radial-gradient(circle at center,
            rgba(0,0,0,${0.2 * intensity}) 0%,
            rgba(0,0,0,${0.5 * intensity}) 50%,
            rgba(0,0,0,${0.8 * intensity}) 100%)`
        }}
      />

      {/* Rising tendrils of darkness */}
      {tendrils.map(t => (
        <div
          key={t.id}
          className="absolute bottom-0 animate-darkness-tendril"
          style={{
            left: `${t.startX}%`,
            width: `${t.width}px`,
            height: '40%',
            background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
            animationDelay: `${t.delay}s`,
            animationDuration: `${t.duration}s`,
            opacity: intensity * 0.6
          }}
        />
      ))}

      {/* Occasional void flickers - glimpses of absolute nothing */}
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={`void-${i}`}
          className="absolute animate-void-flicker"
          style={{
            top: `${10 + i * 18}%`,
            left: `${5 + i * 22}%`,
            width: '150px',
            height: '100px',
            background: 'radial-gradient(ellipse, rgba(0,0,0,0.9), transparent 70%)',
            animationDelay: `${i * 1.5}s`
          }}
        />
      ))}

      {/* Edge darkness creeping in */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: `inset 0 0 ${100 * intensity}px ${50 * intensity}px rgba(0,0,0,0.6)`
        }}
      />
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
      case 'unnatural_glow': return <Lightbulb size={16} className="text-green-400" />;
      case 'darkness': return <Moon size={16} className="text-gray-600" />;
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
 * - ALWAYS: Ambient dark clouds for persistent dread atmosphere
 */
const WeatherOverlay: React.FC<WeatherOverlayProps> = ({ weather, className = '' }) => {
  // Always render ambient dark clouds for the eerie atmosphere
  // Weather effects layer on top of this base dread
  const hasActiveWeather = weather && weather.type !== 'clear';
  const effect = hasActiveWeather ? getWeatherEffect(weather.type) : null;
  const intensity = hasActiveWeather ? getIntensityModifier(weather.intensity) : 1;
  const particleCount = effect ? Math.floor(effect.particleCount * intensity) : 0;

  return (
    <div className={`weather-system absolute inset-0 pointer-events-none z-30 ${className}`}>
      {/* ALWAYS VISIBLE: Ambient dark clouds - "The Ever-Present Dread" */}
      <AmbientDarkClouds intensity={1} />

      {/* Active weather effects (if any) */}
      {hasActiveWeather && effect && (
        <div
          className={`weather-overlay absolute inset-0 pointer-events-none ${effect.visualClass}`}
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

          {weather.type === 'unnatural_glow' && (
            <UnnaturalGlowEffect count={particleCount} intensity={intensity} />
          )}

          {weather.type === 'darkness' && (
            <DarknessEffect count={particleCount} intensity={intensity} />
          )}

          {/* Vignette overlay for active weather */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.3) 100%)'
            }}
          />
        </div>
      )}
    </div>
  );
};

// Export AmbientDarkClouds separately for use without full weather system
export { AmbientDarkClouds };
export default WeatherOverlay;
