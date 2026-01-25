/**
 * MonsterPortrait - Animated monster portrait with trait-based effects
 * 
 * Visual effects based on monster traits:
 * - flying: Floating/hovering animation
 * - fire: Flame glow effect
 * - massive: Pulsing shadow effect
 * - fast: Blur trail effect
 * - elite: Golden border glow
 * - teleport: Flickering dimensional effect
 * - aquatic: Water ripple effect
 * - regenerate: Green healing pulse
 * - ambusher: Shadow lurking effect
 * - ranged: Targeting reticle overlay
 */

import React, { useMemo } from 'react';
import { EnemyType } from '../types';
import { BESTIARY } from '../constants';
import { getMonsterPortrait } from '../utils/monsterAssets';

interface MonsterPortraitProps {
  enemyType: EnemyType;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showTraitEffects?: boolean;
  isActive?: boolean;
  alt?: string;
}

// Size mappings
const SIZE_CLASSES: Record<string, string> = {
  sm: 'w-10 h-10',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
  xl: 'w-32 h-32'
};

// Trait to visual effect mappings
const TRAIT_EFFECTS: Record<string, {
  containerClass: string;
  imageClass: string;
  overlayClass?: string;
  glowColor?: string;
}> = {
  flying: {
    containerClass: 'animate-float',
    imageClass: '',
    glowColor: 'rgba(147, 197, 253, 0.4)' // sky blue
  },
  fire: {
    containerClass: 'animate-fire-flicker',
    imageClass: '',
    overlayClass: 'fire-overlay',
    glowColor: 'rgba(249, 115, 22, 0.6)' // orange
  },
  massive: {
    containerClass: 'animate-massive-pulse',
    imageClass: '',
    glowColor: 'rgba(139, 69, 19, 0.5)' // brown
  },
  fast: {
    containerClass: '',
    imageClass: 'animate-speed-blur',
    glowColor: 'rgba(34, 197, 94, 0.4)' // green
  },
  elite: {
    containerClass: 'animate-elite-glow',
    imageClass: '',
    glowColor: 'rgba(212, 175, 55, 0.6)' // gold
  },
  teleport: {
    containerClass: 'animate-dimensional-flicker',
    imageClass: '',
    overlayClass: 'dimensional-overlay',
    glowColor: 'rgba(168, 85, 247, 0.5)' // purple
  },
  aquatic: {
    containerClass: 'animate-water-ripple',
    imageClass: '',
    glowColor: 'rgba(34, 211, 238, 0.4)' // cyan
  },
  regenerate: {
    containerClass: 'animate-regen-pulse',
    imageClass: '',
    overlayClass: 'regen-overlay',
    glowColor: 'rgba(34, 197, 94, 0.5)' // green
  },
  ambusher: {
    containerClass: 'animate-lurk',
    imageClass: '',
    overlayClass: 'shadow-overlay',
    glowColor: 'rgba(31, 41, 55, 0.6)' // dark
  },
  ranged: {
    containerClass: '',
    imageClass: '',
    overlayClass: 'targeting-overlay',
    glowColor: 'rgba(239, 68, 68, 0.3)' // red
  },
  swarm: {
    containerClass: 'animate-swarm-jitter',
    imageClass: '',
    glowColor: 'rgba(107, 114, 128, 0.4)' // gray
  },
  scavenger: {
    containerClass: '',
    imageClass: 'animate-scavenger-sniff',
    glowColor: 'rgba(161, 98, 7, 0.4)' // amber
  },
  slow: {
    containerClass: 'animate-slow-lumber',
    imageClass: '',
    glowColor: 'rgba(75, 85, 99, 0.4)' // gray
  },
  light_sensitive: {
    containerClass: '',
    imageClass: '',
    overlayClass: 'darkness-overlay',
    glowColor: 'rgba(17, 24, 39, 0.5)' // very dark
  }
};

const MonsterPortrait: React.FC<MonsterPortraitProps> = ({
  enemyType,
  size = 'md',
  className = '',
  showTraitEffects = true,
  isActive = false,
  alt
}) => {
  const portraitUrl = getMonsterPortrait(enemyType);
  const monsterInfo = BESTIARY[enemyType];
  const traits = monsterInfo?.traits || [];

  // Calculate combined effects from all traits
  const effects = useMemo(() => {
    if (!showTraitEffects) return { containerClasses: '', imageClasses: '', overlays: [], glowColors: [] };

    const containerClasses: string[] = [];
    const imageClasses: string[] = [];
    const overlays: string[] = [];
    const glowColors: string[] = [];

    traits.forEach(trait => {
      const effect = TRAIT_EFFECTS[trait];
      if (effect) {
        if (effect.containerClass) containerClasses.push(effect.containerClass);
        if (effect.imageClass) imageClasses.push(effect.imageClass);
        if (effect.overlayClass) overlays.push(effect.overlayClass);
        if (effect.glowColor) glowColors.push(effect.glowColor);
      }
    });

    return {
      containerClasses: containerClasses.join(' '),
      imageClasses: imageClasses.join(' '),
      overlays,
      glowColors
    };
  }, [traits, showTraitEffects]);

  // Calculate box shadow from glow colors
  const boxShadow = useMemo(() => {
    if (!effects.glowColors.length) return undefined;
    
    // Combine up to 2 glow colors for multi-trait monsters
    const colors = effects.glowColors.slice(0, 2);
    if (colors.length === 1) {
      return `0 0 15px ${colors[0]}, 0 0 30px ${colors[0]}`;
    }
    return `0 0 15px ${colors[0]}, 0 0 30px ${colors[1]}`;
  }, [effects.glowColors]);

  return (
    <div 
      className={`relative ${SIZE_CLASSES[size]} ${effects.containerClasses} ${className}`}
      style={{ 
        boxShadow: isActive ? boxShadow : undefined,
        transition: 'box-shadow 0.3s ease-in-out'
      }}
    >
      {/* Main portrait image */}
      <div className={`
        w-full h-full rounded-xl overflow-hidden 
        border-2 ${isActive ? 'border-primary' : 'border-red-900/50'}
        ${isActive ? 'ring-2 ring-primary/30' : ''}
        transition-all duration-300
      `}>
        <img 
          src={portraitUrl} 
          alt={alt || monsterInfo?.name || enemyType}
          className={`w-full h-full object-cover ${effects.imageClasses}`}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.opacity = '0.5';
          }}
        />
        
        {/* Trait-based overlays */}
        {effects.overlays.map((overlay, i) => (
          <div key={i} className={`absolute inset-0 pointer-events-none ${overlay}`} />
        ))}
      </div>

      {/* Active indicator */}
      {isActive && (
        <div className="absolute -inset-1 rounded-xl border border-primary/50 animate-pulse pointer-events-none" />
      )}
    </div>
  );
};

export default MonsterPortrait;
