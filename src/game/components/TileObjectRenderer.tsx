/**
 * TileObjectRenderer - Configuration-driven tile object rendering
 *
 * This component replaces 15+ nearly identical if/else blocks in GameBoard.tsx
 * with a single, data-driven rendering approach.
 *
 * REFACTORING: Extracted from GameBoard.tsx lines 1208-1350
 *
 * Before: 150+ lines of repetitive conditional JSX
 * After: ~50 lines of configuration + ~40 lines of rendering logic
 */

import React from 'react';
import {
  Flame, Lock, Hammer, AlertTriangle, Fence, Cloud, Sparkles,
  BookOpen, Package, Moon, Radio, ToggleLeft, Skull, DoorOpen, Zap
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export type TileObjectType =
  | 'fire' | 'locked_door' | 'rubble' | 'trap' | 'gate' | 'fog_wall'
  | 'altar' | 'bookshelf' | 'crate' | 'chest' | 'cabinet' | 'barricade'
  | 'mirror' | 'radio' | 'switch' | 'statue' | 'exit_door' | 'eldritch_portal';

interface TileObject {
  type: string;
  blocking?: boolean;
  searched?: boolean;
  portalActive?: boolean;
}

// Configuration for simple tile objects (icon + optional label)
interface SimpleTileObjectConfig {
  variant: 'simple';
  icon: LucideIcon;
  iconSize: number;
  iconClass: string;
  label?: string;
  labelClass?: string;
  /** If true, uses object.blocking to determine opacity */
  useBlockingOpacity?: boolean;
  /** If true, uses object.searched to determine opacity */
  useSearchedOpacity?: boolean;
  /** Additional wrapper class for animations */
  wrapperClass?: string;
}

// Configuration for complex tile objects with custom rendering
interface ComplexTileObjectConfig {
  variant: 'complex';
  /** Custom render function for complex objects */
  render: (object: TileObject) => React.ReactNode;
}

type TileObjectConfig = SimpleTileObjectConfig | ComplexTileObjectConfig;

// ============================================================================
// CONFIGURATION MAP
// ============================================================================

/**
 * Configuration for all tile object types.
 *
 * To add a new tile object type:
 * 1. Add entry to this map with icon, colors, and optional label
 * 2. That's it! No need to touch GameBoard.tsx
 */
export const TILE_OBJECT_CONFIGS: Record<string, TileObjectConfig> = {
  // Fire - pulsing orange flame
  fire: {
    variant: 'simple',
    icon: Flame,
    iconSize: 40,
    iconClass: 'text-orange-500 animate-pulse drop-shadow-[0_0_10px_rgba(249,115,22,0.8)]',
  },

  // Locked Door - accent colored lock
  locked_door: {
    variant: 'simple',
    icon: Lock,
    iconSize: 32,
    iconClass: 'text-accent',
    label: 'Locked',
    labelClass: 'text-[10px] font-bold text-accent uppercase tracking-widest mt-1',
    useBlockingOpacity: true,
  },

  // Rubble - stone colored hammer
  rubble: {
    variant: 'simple',
    icon: Hammer,
    iconSize: 32,
    iconClass: 'text-stone-500 rotate-12 drop-shadow-md',
  },

  // Trap - warning triangle with red glow
  trap: {
    variant: 'simple',
    icon: AlertTriangle,
    iconSize: 32,
    iconClass: 'text-red-500 animate-pulse drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]',
    label: 'Trap',
    labelClass: 'text-[10px] font-bold text-red-400 uppercase tracking-widest mt-1',
  },

  // Gate - iron fence
  gate: {
    variant: 'simple',
    icon: Fence,
    iconSize: 32,
    iconClass: 'text-gray-400',
    label: 'Gate',
    labelClass: 'text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1',
    useBlockingOpacity: true,
  },

  // Fog Wall - ethereal cloud
  fog_wall: {
    variant: 'simple',
    icon: Cloud,
    iconSize: 36,
    iconClass: 'text-purple-400/80 drop-shadow-[0_0_12px_rgba(168,85,247,0.5)]',
    label: 'Fog',
    labelClass: 'text-[10px] font-bold text-purple-400 uppercase tracking-widest mt-1',
    wrapperClass: 'animate-pulse',
  },

  // Altar - mystical sparkles
  altar: {
    variant: 'simple',
    icon: Sparkles,
    iconSize: 32,
    iconClass: 'text-purple-500 drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]',
    label: 'Altar',
    labelClass: 'text-[10px] font-bold text-purple-400 uppercase tracking-widest mt-1',
  },

  // Bookshelf - book icon with search state
  bookshelf: {
    variant: 'complex',
    render: (object) => (
      <div className={`flex flex-col items-center ${!object.searched ? 'animate-bookshelf-glow' : ''}`}>
        <BookOpen
          className={`drop-shadow-md transition-all duration-300 ${
            object.searched
              ? 'text-amber-900/60'
              : 'text-amber-600 drop-shadow-[0_0_8px_rgba(200,160,80,0.4)]'
          }`}
          size={28}
        />
        {!object.searched && (
          <span className="text-[8px] font-bold text-amber-400 uppercase tracking-widest mt-1 animate-pulse">
            Search
          </span>
        )}
      </div>
    ),
  },

  // Container types - archive/package (shared config)
  crate: {
    variant: 'simple',
    icon: Package,
    iconSize: 28,
    iconClass: 'text-amber-600',
    useSearchedOpacity: true,
  },
  chest: {
    variant: 'simple',
    icon: Package,
    iconSize: 28,
    iconClass: 'text-amber-600',
    useSearchedOpacity: true,
  },
  cabinet: {
    variant: 'simple',
    icon: Package,
    iconSize: 28,
    iconClass: 'text-amber-600',
    useSearchedOpacity: true,
  },

  // Barricade - crossed planks
  barricade: {
    variant: 'simple',
    icon: Hammer,
    iconSize: 32,
    iconClass: 'text-amber-800 rotate-45 drop-shadow-md',
  },

  // Mirror - moon reflection
  mirror: {
    variant: 'simple',
    icon: Moon,
    iconSize: 28,
    iconClass: 'text-slate-300 drop-shadow-[0_0_6px_rgba(148,163,184,0.5)]',
  },

  // Radio - communication
  radio: {
    variant: 'simple',
    icon: Radio,
    iconSize: 28,
    iconClass: 'text-green-500 animate-pulse',
  },

  // Switch - toggle
  switch: {
    variant: 'simple',
    icon: ToggleLeft,
    iconSize: 28,
    iconClass: 'text-yellow-500',
  },

  // Statue - skull (ominous)
  statue: {
    variant: 'simple',
    icon: Skull,
    iconSize: 32,
    iconClass: 'text-stone-400 drop-shadow-md',
  },

  // Exit Door - complex with beacon effect
  exit_door: {
    variant: 'complex',
    render: () => (
      <div className="relative flex flex-col items-center">
        {/* Outer beacon glow */}
        <div className="absolute inset-0 -m-8 rounded-full animate-exit-beacon opacity-80" />
        {/* Inner rotating ring */}
        <div
          className="absolute inset-0 -m-4 rounded-full animate-spin"
          style={{
            animationDuration: '8s',
            background:
              'conic-gradient(from 0deg, transparent 0%, rgba(52,211,153,0.4) 25%, transparent 50%, rgba(52,211,153,0.4) 75%, transparent 100%)',
          }}
        />
        {/* Door icon with enhanced glow */}
        <DoorOpen
          className="text-emerald-400 animate-pulse drop-shadow-[0_0_15px_rgba(52,211,153,0.8)]"
          size={40}
        />
        <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-widest mt-1 drop-shadow-[0_0_6px_rgba(52,211,153,0.8)]">
          EXIT
        </span>
        {/* Pulsing rays */}
        <div className="absolute inset-0 -m-6">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
            <div
              key={angle}
              className="absolute w-[2px] h-8 bg-gradient-to-t from-emerald-400/60 to-transparent animate-pulse"
              style={{
                left: '50%',
                top: '50%',
                transform: `translate(-50%, -100%) rotate(${angle}deg)`,
                transformOrigin: 'center bottom',
                animationDelay: `${angle / 360}s`,
              }}
            />
          ))}
        </div>
      </div>
    ),
  },

  // Eldritch Portal - complex with swirling energy
  eldritch_portal: {
    variant: 'complex',
    render: (object) => (
      <div className="relative flex flex-col items-center">
        {/* Outer glow ring */}
        <div className="absolute inset-0 -m-4 rounded-full eldritch-portal-glow animate-portal-pulse" />
        {/* Swirling energy effect */}
        <div
          className="absolute inset-0 -m-2 rounded-full animate-portal-swirl opacity-60"
          style={{
            background:
              'conic-gradient(from 0deg, rgba(128,0,255,0.4), rgba(200,100,255,0.2), rgba(128,0,255,0.4), rgba(150,50,200,0.3), rgba(128,0,255,0.4))',
          }}
        />
        {/* Portal icon */}
        <Zap
          className="text-purple-400 animate-portal-energy drop-shadow-[0_0_15px_rgba(168,85,247,0.8)]"
          size={36}
        />
        <span className="text-[9px] font-bold text-purple-300 uppercase tracking-widest mt-1 drop-shadow-[0_0_4px_rgba(128,0,255,0.6)]">
          {object.portalActive ? 'PORTAL' : 'Dormant'}
        </span>
        {/* Occasional energy flare */}
        <div className="absolute inset-0 -m-6 rounded-full animate-portal-flare bg-purple-500/30" />
      </div>
    ),
  },
};

// ============================================================================
// RENDER FUNCTIONS
// ============================================================================

/**
 * Renders a simple tile object based on configuration
 */
function renderSimpleTileObject(
  config: SimpleTileObjectConfig,
  object: TileObject
): React.ReactNode {
  const Icon = config.icon;

  // Calculate opacity based on object state
  let opacityClass = 'opacity-100';
  if (config.useBlockingOpacity && !object.blocking) {
    opacityClass = 'opacity-30';
  } else if (config.useSearchedOpacity && object.searched) {
    opacityClass = 'opacity-40';
  }

  const wrapperClass = config.wrapperClass || '';
  const hasLabel = config.label && config.labelClass;

  if (hasLabel) {
    return (
      <div className={`flex flex-col items-center ${wrapperClass}`}>
        <Icon className={`${config.iconClass} ${opacityClass}`} size={config.iconSize} />
        <span className={config.labelClass}>{config.label}</span>
      </div>
    );
  }

  return (
    <div className={wrapperClass}>
      <Icon className={`${config.iconClass} ${opacityClass}`} size={config.iconSize} />
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface TileObjectRendererProps {
  object: TileObject;
}

/**
 * TileObjectRenderer - Renders tile objects using configuration-driven approach
 *
 * Usage:
 * ```tsx
 * <TileObjectRenderer object={tile.object} />
 * ```
 *
 * Instead of:
 * ```tsx
 * {tile.object.type === 'fire' && <Flame ... />}
 * {tile.object.type === 'locked_door' && <div><Lock .../><span>...</span></div>}
 * {tile.object.type === 'rubble' && <Hammer ... />}
 * // ... 15+ more conditionals
 * ```
 */
export const TileObjectRenderer: React.FC<TileObjectRendererProps> = ({ object }) => {
  const config = TILE_OBJECT_CONFIGS[object.type];

  // Unknown object type - return null
  if (!config) {
    return null;
  }

  // Complex objects have custom render functions
  if (config.variant === 'complex') {
    return <>{config.render(object)}</>;
  }

  // Simple objects use configuration-driven rendering
  return <>{renderSimpleTileObject(config, object)}</>;
};

export default TileObjectRenderer;
