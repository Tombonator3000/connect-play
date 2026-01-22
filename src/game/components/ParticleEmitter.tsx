import React, { useEffect, useState, useCallback, memo } from 'react';
import { ParticleConfig } from '../utils/tileEffects';

/**
 * ParticleEmitter - Reusable particle effect component
 *
 * Renders animated particles based on configuration.
 * Used for tile atmospheric effects, action feedback, and special situations.
 */

interface Particle {
  id: string;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

interface ParticleEmitterProps {
  config: ParticleConfig;
  containerWidth?: number;
  containerHeight?: number;
  active?: boolean;
}

const ParticleEmitter: React.FC<ParticleEmitterProps> = memo(({
  config,
  containerWidth = 100,
  containerHeight = 100,
  active = true
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  // Generate particles based on config
  const generateParticles = useCallback(() => {
    const newParticles: Particle[] = [];

    for (let i = 0; i < config.count; i++) {
      const size = config.sizeRange[0] + Math.random() * (config.sizeRange[1] - config.sizeRange[0]);
      const x = (containerWidth - size) * Math.random();
      const y = (containerHeight - size) * Math.random();
      const delay = (config.delay || 0) * i + Math.random() * 500;

      newParticles.push({
        id: `${config.type}-${Date.now()}-${i}`,
        x,
        y,
        size,
        delay,
        duration: config.duration + Math.random() * (config.duration * 0.2)
      });
    }

    setParticles(newParticles);
  }, [config, containerWidth, containerHeight]);

  // Initialize and regenerate particles periodically
  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    generateParticles();

    // Regenerate particles at the end of their cycle
    const totalCycleTime = config.duration + (config.delay || 0) * config.count;
    const intervalId = setInterval(generateParticles, totalCycleTime);

    return () => clearInterval(intervalId);
  }, [active, generateParticles, config.duration, config.delay, config.count]);

  if (!active || particles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map(particle => (
        <div
          key={particle.id}
          className={`absolute ${config.className}`}
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDelay: `${particle.delay}ms`,
            animationDuration: `${particle.duration}ms`,
            '--tx': `${config.spread.x * (Math.random() - 0.5)}px`,
            '--ty': `${config.spread.y * (Math.random() - 0.5)}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
});

ParticleEmitter.displayName = 'ParticleEmitter';

export default ParticleEmitter;

/**
 * TileAtmosphericEffects - Renders all atmospheric effects for a tile
 *
 * Combines particles, lighting overlays, and ambient effects
 * based on tile type configuration.
 */

interface TileAtmosphericEffectsProps {
  tileName: string;
  tileType?: string;
  isVisible: boolean;
  containerWidth?: number;
  containerHeight?: number;
}

export const TileAtmosphericEffects: React.FC<TileAtmosphericEffectsProps> = memo(({
  tileName,
  tileType,
  isVisible,
  containerWidth = 100,
  containerHeight = 100
}) => {
  // Import getTileAtmosphere dynamically to avoid circular deps
  const [config, setConfig] = useState<ReturnType<typeof import('../utils/tileEffects').getTileAtmosphere>>(null);

  useEffect(() => {
    import('../utils/tileEffects').then(({ getTileAtmosphere }) => {
      setConfig(getTileAtmosphere(tileName, tileType));
    });
  }, [tileName, tileType]);

  if (!isVisible || !config) return null;

  return (
    <div className="absolute inset-0 z-[6] pointer-events-none overflow-hidden">
      {/* Overlay effect */}
      {config.overlayClass && (
        <div className={`absolute inset-0 ${config.overlayClass}`} />
      )}

      {/* Ambient lighting effect */}
      {config.ambientClass && (
        <div className={`absolute inset-0 ${config.ambientClass}`} />
      )}

      {/* Light effects */}
      {config.lights?.map((light, idx) => (
        <div
          key={`light-${idx}`}
          className={`absolute inset-0 ${light.className}`}
          style={{
            opacity: light.intensity
          }}
        />
      ))}

      {/* Particle effects */}
      {config.particles?.map((particleConfig, idx) => (
        <ParticleEmitter
          key={`particles-${idx}`}
          config={particleConfig}
          containerWidth={containerWidth}
          containerHeight={containerHeight}
          active={isVisible}
        />
      ))}
    </div>
  );
});

TileAtmosphericEffects.displayName = 'TileAtmosphericEffects';

/**
 * ScreenEffect - Full-screen visual effect overlay
 *
 * Used for doom pulse, sanity loss, horror checks, etc.
 */

interface ScreenEffectProps {
  effectClass: string;
  duration: number;
  onComplete?: () => void;
}

export const ScreenEffect: React.FC<ScreenEffectProps> = memo(({
  effectClass,
  duration,
  onComplete
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 pointer-events-none z-[100] ${effectClass}`}
      style={{ animationDuration: `${duration}ms` }}
    />
  );
});

ScreenEffect.displayName = 'ScreenEffect';

/**
 * ActionEffect - Visual effect triggered by player/enemy actions
 *
 * Renders at a specific position with the appropriate animation.
 */

interface ActionEffectProps {
  effectClass: string;
  x: number;
  y: number;
  duration: number;
  onComplete?: () => void;
}

export const ActionEffect: React.FC<ActionEffectProps> = memo(({
  effectClass,
  x,
  y,
  duration,
  onComplete
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  if (!visible) return null;

  return (
    <div
      className={`absolute pointer-events-none z-[70] ${effectClass}`}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        animationDuration: `${duration}ms`
      }}
    />
  );
});

ActionEffect.displayName = 'ActionEffect';

/**
 * DoomOverlay - Persistent overlay when doom is critical
 *
 * Shows the doom critical vignette effect when doom <= 3
 */

interface DoomOverlayProps {
  doomLevel: number;
  maxDoom: number;
}

export const DoomOverlay: React.FC<DoomOverlayProps> = memo(({
  doomLevel,
  maxDoom
}) => {
  const isCritical = doomLevel <= 3;
  const isLow = doomLevel <= Math.floor(maxDoom / 2);

  if (!isLow) return null;

  return (
    <div
      className={`fixed inset-0 pointer-events-none z-[90] transition-opacity duration-1000 ${
        isCritical ? 'doom-critical-overlay' : ''
      }`}
      style={{
        boxShadow: isCritical
          ? 'inset 0 0 100px 40px rgba(50, 0, 0, 0.6)'
          : `inset 0 0 60px 20px rgba(30, 0, 0, ${0.3 * (1 - doomLevel / maxDoom)})`
      }}
    />
  );
});

DoomOverlay.displayName = 'DoomOverlay';

/**
 * SanityOverlay - Visual distortion based on sanity level
 *
 * Shows increasing distortion as sanity decreases
 */

interface SanityOverlayProps {
  sanityLevel: number;
  maxSanity: number;
  hasMadness: boolean;
}

export const SanityOverlay: React.FC<SanityOverlayProps> = memo(({
  sanityLevel,
  maxSanity,
  hasMadness
}) => {
  const sanityPercent = sanityLevel / maxSanity;
  const isLow = sanityPercent <= 0.3;

  if (sanityPercent > 0.5 && !hasMadness) return null;

  return (
    <div
      className={`fixed inset-0 pointer-events-none z-[89] transition-all duration-500`}
      style={{
        filter: hasMadness
          ? `hue-rotate(${10 - sanityPercent * 10}deg) saturate(${1 + (1 - sanityPercent) * 0.3})`
          : isLow
          ? `saturate(${0.8 + sanityPercent * 0.2})`
          : 'none',
        opacity: hasMadness ? 0.3 : isLow ? 0.2 : 0
      }}
    >
      {hasMadness && (
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at ${50 + Math.sin(Date.now() / 2000) * 10}% ${50 + Math.cos(Date.now() / 3000) * 10}%, rgba(128, 0, 128, 0.1), transparent 70%)`
          }}
        />
      )}
    </div>
  );
});

SanityOverlay.displayName = 'SanityOverlay';
