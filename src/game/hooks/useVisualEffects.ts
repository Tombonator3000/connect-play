import { useCallback, useMemo } from 'react';
import type { ParticleEffectType } from '../components/AdvancedParticles';
import type { ShaderEffectType } from '../components/ShaderEffects';

// Helper to get screen position from game coordinates
export const getScreenPosition = (
  gameX: number,
  gameY: number,
  boardRect?: DOMRect
): { x: number; y: number } => {
  if (boardRect) {
    return {
      x: boardRect.left + gameX,
      y: boardRect.top + gameY,
    };
  }
  return { x: gameX, y: gameY };
};

// Preset effect combinations for common game events
export type GameEffectPreset =
  | 'player-hit'
  | 'player-death'
  | 'enemy-hit'
  | 'enemy-death'
  | 'critical-hit'
  | 'sanity-loss'
  | 'sanity-zero'
  | 'spell-cast'
  | 'portal-open'
  | 'doom-tick'
  | 'victory'
  | 'horror-check-fail';

interface VisualEffectsAPI {
  // Emit particles at a position
  emitParticles: (
    x: number,
    y: number,
    type: ParticleEffectType,
    direction?: number
  ) => void;

  // Trigger screen-wide shader effect
  triggerShader: (
    type: ShaderEffectType,
    intensity?: number,
    duration?: number
  ) => void;

  // Use a preset combination of effects
  triggerPreset: (
    preset: GameEffectPreset,
    x?: number,
    y?: number
  ) => void;

  // Check if advanced effects are available
  isAvailable: boolean;
}

// Hook to use visual effects from any component
export const useVisualEffects = (): VisualEffectsAPI => {
  const emitParticles = useCallback((
    x: number,
    y: number,
    type: ParticleEffectType,
    direction?: number
  ) => {
    const emitFn = (window as any).__emitAdvancedParticles;
    if (emitFn) {
      emitFn(x, y, type, direction);
    }
  }, []);

  const triggerShader = useCallback((
    type: ShaderEffectType,
    intensity: number = 1,
    duration: number = 1000
  ) => {
    const triggerFn = (window as any).__triggerShaderEffect;
    if (triggerFn) {
      triggerFn(type, intensity, duration);
    }
  }, []);

  const triggerPreset = useCallback((
    preset: GameEffectPreset,
    x: number = window.innerWidth / 2,
    y: number = window.innerHeight / 2
  ) => {
    switch (preset) {
      case 'player-hit':
        emitParticles(x, y, 'blood-splatter');
        triggerShader('sanity-distortion', 0.3, 300);
        break;

      case 'player-death':
        emitParticles(x, y, 'death-essence');
        emitParticles(x, y, 'blood-splatter');
        triggerShader('death-fade', 1, 2000);
        break;

      case 'enemy-hit':
        emitParticles(x, y, 'combat-hit');
        break;

      case 'enemy-death':
        emitParticles(x, y, 'death-essence');
        triggerShader('doom-pulse', 0.2, 500);
        break;

      case 'critical-hit':
        emitParticles(x, y, 'combat-hit');
        emitParticles(x, y, 'fire-embers');
        triggerShader('doom-pulse', 0.5, 400);
        break;

      case 'sanity-loss':
        emitParticles(x, y, 'sanity-drain');
        triggerShader('sanity-distortion', 0.5, 800);
        break;

      case 'sanity-zero':
        emitParticles(x, y, 'eldritch-mist');
        emitParticles(x, y, 'tentacle-burst');
        triggerShader('madness-glitch', 1, 2000);
        break;

      case 'spell-cast':
        emitParticles(x, y, 'magic-burst');
        triggerShader('ritual-glow', 0.6, 1000);
        break;

      case 'portal-open':
        emitParticles(x, y, 'portal-vortex');
        triggerShader('portal-warp', 1, 1500);
        break;

      case 'doom-tick':
        triggerShader('doom-pulse', 0.3, 500);
        break;

      case 'victory':
        emitParticles(x, y, 'holy-light');
        emitParticles(x, y, 'magic-burst');
        triggerShader('ritual-glow', 0.8, 2000);
        break;

      case 'horror-check-fail':
        emitParticles(x, y, 'sanity-drain');
        emitParticles(x, y, 'eldritch-mist');
        triggerShader('cosmic-horror', 0.7, 1200);
        break;
    }
  }, [emitParticles, triggerShader]);

  const isAvailable = useMemo(() => {
    return !!(
      (window as any).__emitAdvancedParticles ||
      (window as any).__triggerShaderEffect
    );
  }, []);

  return {
    emitParticles,
    triggerShader,
    triggerPreset,
    isAvailable,
  };
};

export default useVisualEffects;
