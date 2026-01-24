import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, ChromaticAberration, Noise, Vignette, Bloom, Glitch } from '@react-three/postprocessing';
import { BlendFunction, GlitchMode } from 'postprocessing';
import * as THREE from 'three';

// Available shader effect types
export type ShaderEffectType =
  | 'sanity-distortion'
  | 'portal-warp'
  | 'doom-pulse'
  | 'eldritch-vision'
  | 'death-fade'
  | 'madness-glitch'
  | 'cosmic-horror'
  | 'ritual-glow'
  | 'none';

interface ShaderState {
  activeEffect: ShaderEffectType;
  intensity: number;
  duration: number;
  startTime: number;
}

interface ShaderEffectsProps {
  enabled: boolean;
  quality: 'low' | 'medium' | 'high' | 'ultra';
  sanityLevel?: number; // 0-1, affects distortion
  doomLevel?: number; // 0-1, affects red vignette
}

const QUALITY_SETTINGS = {
  low: { samples: 1, multisampling: 0 },
  medium: { samples: 2, multisampling: 2 },
  high: { samples: 4, multisampling: 4 },
  ultra: { samples: 8, multisampling: 8 },
};

// Custom shader for reality distortion
const DistortionShader = {
  uniforms: {
    tDiffuse: { value: null },
    time: { value: 0 },
    intensity: { value: 0 },
    sanity: { value: 1 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float time;
    uniform float intensity;
    uniform float sanity;
    varying vec2 vUv;

    void main() {
      vec2 uv = vUv;

      // Sanity-based distortion
      float distortAmount = (1.0 - sanity) * intensity * 0.02;
      uv.x += sin(uv.y * 20.0 + time * 2.0) * distortAmount;
      uv.y += cos(uv.x * 20.0 + time * 2.0) * distortAmount;

      // Chromatic separation based on sanity
      float chromaOffset = (1.0 - sanity) * intensity * 0.005;
      vec4 r = texture2D(tDiffuse, uv + vec2(chromaOffset, 0.0));
      vec4 g = texture2D(tDiffuse, uv);
      vec4 b = texture2D(tDiffuse, uv - vec2(chromaOffset, 0.0));

      gl_FragColor = vec4(r.r, g.g, b.b, 1.0);
    }
  `,
};

// Effects component that renders inside Canvas
const Effects: React.FC<{
  quality: 'low' | 'medium' | 'high' | 'ultra';
  sanityLevel: number;
  doomLevel: number;
  activeEffect: ShaderEffectType;
  effectIntensity: number;
}> = ({ quality, sanityLevel, doomLevel, activeEffect, effectIntensity }) => {
  const settings = QUALITY_SETTINGS[quality];

  // Calculate effect parameters based on game state
  const chromaticOffset = new THREE.Vector2(
    (1 - sanityLevel) * 0.003 * effectIntensity,
    (1 - sanityLevel) * 0.002 * effectIntensity
  );

  const vignetteIntensity = 0.3 + doomLevel * 0.5;
  const noiseOpacity = (1 - sanityLevel) * 0.15 * effectIntensity;

  const showGlitch = activeEffect === 'madness-glitch' || activeEffect === 'cosmic-horror';
  const showBloom = activeEffect === 'ritual-glow' || activeEffect === 'portal-warp';

  return (
    <EffectComposer multisampling={settings.multisampling}>
      {/* Always-on subtle effects based on game state */}
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={chromaticOffset}
        radialModulation={false}
        modulationOffset={0}
      />

      <Vignette
        offset={0.3}
        darkness={vignetteIntensity}
        blendFunction={BlendFunction.NORMAL}
      />

      <Noise
        premultiply
        blendFunction={BlendFunction.ADD}
        opacity={noiseOpacity}
      />

      {/* Conditional effects */}
      {showBloom && (
        <Bloom
          intensity={effectIntensity * 0.5}
          luminanceThreshold={0.6}
          luminanceSmoothing={0.9}
        />
      )}

      {showGlitch && (
        <Glitch
          delay={new THREE.Vector2(0.5, 1)}
          duration={new THREE.Vector2(0.1, 0.3)}
          strength={new THREE.Vector2(0.1, 0.2)}
          mode={GlitchMode.SPORADIC}
          active
          ratio={0.85}
        />
      )}
    </EffectComposer>
  );
};

// Invisible plane that captures the screen
const ScreenCapture: React.FC = () => {
  return null; // The effects are applied as post-processing
};

const ShaderEffects: React.FC<ShaderEffectsProps> = ({
  enabled,
  quality,
  sanityLevel = 1,
  doomLevel = 0,
}) => {
  const [shaderState, setShaderState] = useState<ShaderState>({
    activeEffect: 'none',
    intensity: 0,
    duration: 0,
    startTime: 0,
  });

  const triggerEffect = useCallback((
    effect: ShaderEffectType,
    intensity: number = 1,
    duration: number = 1000
  ) => {
    setShaderState({
      activeEffect: effect,
      intensity,
      duration,
      startTime: Date.now(),
    });
  }, []);

  // Auto-clear effect after duration
  useEffect(() => {
    if (shaderState.activeEffect === 'none') return;

    const timeout = setTimeout(() => {
      setShaderState(prev => ({ ...prev, activeEffect: 'none', intensity: 0 }));
    }, shaderState.duration);

    return () => clearTimeout(timeout);
  }, [shaderState.activeEffect, shaderState.duration, shaderState.startTime]);

  // Expose trigger function globally
  useEffect(() => {
    if (enabled) {
      (window as any).__triggerShaderEffect = triggerEffect;
    }
    return () => {
      delete (window as any).__triggerShaderEffect;
    };
  }, [triggerEffect, enabled]);

  // Calculate current intensity with fade
  const currentIntensity = useCallback(() => {
    if (shaderState.activeEffect === 'none') return 0;
    const elapsed = Date.now() - shaderState.startTime;
    const progress = Math.min(elapsed / shaderState.duration, 1);
    // Fade in then fade out
    const fade = progress < 0.2
      ? progress / 0.2
      : progress > 0.8
        ? (1 - progress) / 0.2
        : 1;
    return shaderState.intensity * fade;
  }, [shaderState]);

  if (!enabled) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[99]" style={{ mixBlendMode: 'normal' }}>
      <Canvas
        gl={{
          alpha: true,
          antialias: quality !== 'low',
          powerPreference: 'high-performance',
        }}
        style={{ background: 'transparent', pointerEvents: 'none' }}
      >
        <ScreenCapture />
        <Effects
          quality={quality}
          sanityLevel={sanityLevel}
          doomLevel={doomLevel}
          activeEffect={shaderState.activeEffect}
          effectIntensity={currentIntensity()}
        />
      </Canvas>
    </div>
  );
};

// Hook for triggering shader effects from other components
export const useShaderEffects = () => {
  const trigger = useCallback((
    effect: ShaderEffectType,
    intensity?: number,
    duration?: number
  ) => {
    const triggerFn = (window as any).__triggerShaderEffect;
    if (triggerFn) {
      triggerFn(effect, intensity, duration);
    }
  }, []);

  return { trigger };
};

export default ShaderEffects;
