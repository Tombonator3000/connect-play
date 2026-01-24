import React, { useRef, useEffect, useCallback } from 'react';
import * as PIXI from 'pixi.js';

// Particle effect types available
export type ParticleEffectType =
  | 'blood-splatter'
  | 'magic-burst'
  | 'fire-embers'
  | 'portal-vortex'
  | 'sanity-drain'
  | 'eldritch-mist'
  | 'combat-hit'
  | 'death-essence'
  | 'holy-light'
  | 'tentacle-burst';

interface ParticleConfig {
  count: number;
  lifetime: number;
  speed: { min: number; max: number };
  scale: { start: number; end: number };
  alpha: { start: number; end: number };
  color: number[];
  gravity: number;
  spread: number;
  rotation: boolean;
}

const EFFECT_CONFIGS: Record<ParticleEffectType, ParticleConfig> = {
  'blood-splatter': {
    count: 30,
    lifetime: 800,
    speed: { min: 2, max: 8 },
    scale: { start: 1, end: 0.2 },
    alpha: { start: 1, end: 0 },
    color: [0x8B0000, 0xDC143C, 0x4A0000],
    gravity: 0.15,
    spread: Math.PI * 2,
    rotation: true,
  },
  'magic-burst': {
    count: 50,
    lifetime: 1200,
    speed: { min: 1, max: 5 },
    scale: { start: 0.8, end: 0 },
    alpha: { start: 1, end: 0 },
    color: [0x9B59B6, 0x8E44AD, 0xE91E63],
    gravity: -0.05,
    spread: Math.PI * 2,
    rotation: true,
  },
  'fire-embers': {
    count: 40,
    lifetime: 1500,
    speed: { min: 0.5, max: 3 },
    scale: { start: 0.6, end: 0 },
    alpha: { start: 1, end: 0 },
    color: [0xFF6B35, 0xFF8C42, 0xFFD93D],
    gravity: -0.08,
    spread: Math.PI * 0.5,
    rotation: false,
  },
  'portal-vortex': {
    count: 80,
    lifetime: 2000,
    speed: { min: 2, max: 6 },
    scale: { start: 0.5, end: 1.5 },
    alpha: { start: 0.8, end: 0 },
    color: [0x00CED1, 0x9400D3, 0x4B0082],
    gravity: 0,
    spread: Math.PI * 2,
    rotation: true,
  },
  'sanity-drain': {
    count: 25,
    lifetime: 1800,
    speed: { min: 0.3, max: 1.5 },
    scale: { start: 1.2, end: 0.3 },
    alpha: { start: 0.6, end: 0 },
    color: [0x1a1a2e, 0x16213e, 0x0f3460],
    gravity: -0.02,
    spread: Math.PI * 2,
    rotation: true,
  },
  'eldritch-mist': {
    count: 60,
    lifetime: 3000,
    speed: { min: 0.2, max: 1 },
    scale: { start: 2, end: 3 },
    alpha: { start: 0.3, end: 0 },
    color: [0x2E1A47, 0x4A1A6B, 0x6B2D8A],
    gravity: -0.01,
    spread: Math.PI * 2,
    rotation: true,
  },
  'combat-hit': {
    count: 20,
    lifetime: 400,
    speed: { min: 4, max: 12 },
    scale: { start: 0.8, end: 0.1 },
    alpha: { start: 1, end: 0 },
    color: [0xFFFFFF, 0xFFD700, 0xFF4500],
    gravity: 0.2,
    spread: Math.PI * 0.8,
    rotation: true,
  },
  'death-essence': {
    count: 45,
    lifetime: 2500,
    speed: { min: 0.5, max: 2 },
    scale: { start: 1, end: 2 },
    alpha: { start: 0.7, end: 0 },
    color: [0x1C1C1C, 0x2D2D2D, 0x8B0000],
    gravity: -0.03,
    spread: Math.PI * 2,
    rotation: true,
  },
  'holy-light': {
    count: 35,
    lifetime: 1000,
    speed: { min: 1, max: 4 },
    scale: { start: 1.5, end: 0 },
    alpha: { start: 0.9, end: 0 },
    color: [0xFFD700, 0xFFF8DC, 0xFFFACD],
    gravity: -0.1,
    spread: Math.PI * 2,
    rotation: false,
  },
  'tentacle-burst': {
    count: 55,
    lifetime: 1600,
    speed: { min: 1, max: 4 },
    scale: { start: 0.4, end: 1.2 },
    alpha: { start: 0.8, end: 0 },
    color: [0x2E0854, 0x4A0E6B, 0x1A0530],
    gravity: 0.02,
    spread: Math.PI * 2,
    rotation: true,
  },
};

interface Particle {
  sprite: PIXI.Graphics;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  config: ParticleConfig;
  rotationSpeed: number;
}

interface AdvancedParticlesProps {
  enabled: boolean;
  quality: 'low' | 'medium' | 'high' | 'ultra';
  width?: number;
  height?: number;
}

const QUALITY_MULTIPLIERS = {
  low: 0.3,
  medium: 0.6,
  high: 1,
  ultra: 1.5,
};

const AdvancedParticles: React.FC<AdvancedParticlesProps> = ({
  enabled,
  quality,
  width = window.innerWidth,
  height = window.innerHeight,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);

  // Initialize Pixi.js application
  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const initPixi = async () => {
      const app = new PIXI.Application();
      await app.init({
        width,
        height,
        backgroundAlpha: 0,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });

      containerRef.current?.appendChild(app.canvas as HTMLCanvasElement);
      appRef.current = app;

      // Start animation loop
      const animate = () => {
        updateParticles();
        animationRef.current = requestAnimationFrame(animate);
      };
      animate();
    };

    initPixi();

    return () => {
      cancelAnimationFrame(animationRef.current);
      if (appRef.current) {
        appRef.current.destroy(true, { children: true });
        appRef.current = null;
      }
      particlesRef.current = [];
    };
  }, [enabled, width, height]);

  const updateParticles = useCallback(() => {
    const app = appRef.current;
    if (!app) return;

    const now = Date.now();
    const toRemove: number[] = [];

    particlesRef.current.forEach((particle, index) => {
      const elapsed = now - particle.life;
      const progress = elapsed / particle.maxLife;

      if (progress >= 1) {
        toRemove.push(index);
        app.stage.removeChild(particle.sprite);
        particle.sprite.destroy();
        return;
      }

      // Update position
      particle.sprite.x += particle.vx;
      particle.sprite.y += particle.vy;
      particle.vy += particle.config.gravity;

      // Update scale
      const scaleLerp = particle.config.scale.start +
        (particle.config.scale.end - particle.config.scale.start) * progress;
      particle.sprite.scale.set(scaleLerp);

      // Update alpha
      const alphaLerp = particle.config.alpha.start +
        (particle.config.alpha.end - particle.config.alpha.start) * progress;
      particle.sprite.alpha = alphaLerp;

      // Update rotation
      if (particle.config.rotation) {
        particle.sprite.rotation += particle.rotationSpeed;
      }
    });

    // Remove dead particles
    for (let i = toRemove.length - 1; i >= 0; i--) {
      particlesRef.current.splice(toRemove[i], 1);
    }
  }, []);

  const emitParticles = useCallback((
    x: number,
    y: number,
    effectType: ParticleEffectType,
    direction?: number
  ) => {
    const app = appRef.current;
    if (!app || !enabled) return;

    const config = EFFECT_CONFIGS[effectType];
    const qualityMultiplier = QUALITY_MULTIPLIERS[quality];
    const particleCount = Math.floor(config.count * qualityMultiplier);

    for (let i = 0; i < particleCount; i++) {
      const color = config.color[Math.floor(Math.random() * config.color.length)];

      // Create particle graphics
      const particle = new PIXI.Graphics();
      particle.circle(0, 0, 3 + Math.random() * 4);
      particle.fill(color);

      particle.x = x;
      particle.y = y;

      // Calculate velocity
      const angle = direction !== undefined
        ? direction + (Math.random() - 0.5) * config.spread
        : Math.random() * config.spread;
      const speed = config.speed.min + Math.random() * (config.speed.max - config.speed.min);

      const particleData: Particle = {
        sprite: particle,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: Date.now(),
        maxLife: config.lifetime * (0.8 + Math.random() * 0.4),
        config,
        rotationSpeed: config.rotation ? (Math.random() - 0.5) * 0.2 : 0,
      };

      particle.scale.set(config.scale.start);
      particle.alpha = config.alpha.start;

      app.stage.addChild(particle);
      particlesRef.current.push(particleData);
    }
  }, [enabled, quality]);

  // Expose emit function globally for other components to use
  useEffect(() => {
    if (enabled) {
      (window as any).__emitAdvancedParticles = emitParticles;
    }
    return () => {
      delete (window as any).__emitAdvancedParticles;
    };
  }, [emitParticles, enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-[100]"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};

// Hook for emitting particles from other components
export const useAdvancedParticles = () => {
  const emit = useCallback((
    x: number,
    y: number,
    effectType: ParticleEffectType,
    direction?: number
  ) => {
    const emitFn = (window as any).__emitAdvancedParticles;
    if (emitFn) {
      emitFn(x, y, effectType, direction);
    }
  }, []);

  return { emit };
};

export default AdvancedParticles;
