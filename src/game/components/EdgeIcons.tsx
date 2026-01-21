import React from 'react';
import {
  DoorOpen,
  DoorClosed,
  Lock,
  Square,
  LayoutGrid,
  ArrowUp,
  ArrowDown,
  X,
  Eye,
  Sparkles,
  Puzzle,
  Ban,
  Flame,
  AlertTriangle
} from 'lucide-react';

// Edge types from the game design bible
export type EdgeIconType =
  | 'wall'
  | 'door_open'
  | 'door_closed'
  | 'door_locked'
  | 'door_barricaded'
  | 'door_broken'
  | 'door_sealed'
  | 'door_puzzle'
  | 'window'
  | 'secret'
  | 'stairs_up'
  | 'stairs_down'
  | 'blocked'
  | 'open';

interface EdgeIconProps {
  type: string;
  doorState?: string;
  size?: number;
  className?: string;
}

// Determine icon based on edge type and door state
export function getEdgeIconInfo(type: string, doorState?: string): {
  Icon: React.ComponentType<{ size?: string | number; className?: string }>;
  color: string;
  label: string;
  bgColor: string;
} | null {
  const normalizedType = type?.toLowerCase() || '';
  const normalizedDoorState = doorState?.toLowerCase() || '';

  // Walls
  if (normalizedType === 'wall' || normalizedType === 'blocked') {
    return {
      Icon: X,
      color: 'text-red-900',
      label: 'Wall',
      bgColor: 'bg-stone-800/90'
    };
  }

  // Windows
  if (normalizedType === 'window') {
    return {
      Icon: LayoutGrid,
      color: 'text-cyan-300',
      label: 'Window',
      bgColor: 'bg-cyan-900/80'
    };
  }

  // Stairs
  if (normalizedType === 'stairs_up' || normalizedType === 'stairsup') {
    return {
      Icon: ArrowUp,
      color: 'text-amber-300',
      label: 'Stairs Up',
      bgColor: 'bg-amber-900/80'
    };
  }

  if (normalizedType === 'stairs_down' || normalizedType === 'stairsdown') {
    return {
      Icon: ArrowDown,
      color: 'text-amber-300',
      label: 'Stairs Down',
      bgColor: 'bg-amber-900/80'
    };
  }

  // Secret doors (only show if discovered)
  if (normalizedType === 'secret') {
    return {
      Icon: Eye,
      color: 'text-purple-300',
      label: 'Secret',
      bgColor: 'bg-purple-900/80'
    };
  }

  // Doors - check state
  if (normalizedType === 'door') {
    switch (normalizedDoorState) {
      case 'open':
        return {
          Icon: DoorOpen,
          color: 'text-green-300',
          label: 'Open Door',
          bgColor: 'bg-green-900/80'
        };
      case 'closed':
        return {
          Icon: DoorClosed,
          color: 'text-amber-200',
          label: 'Closed Door',
          bgColor: 'bg-amber-900/80'
        };
      case 'locked':
        return {
          Icon: Lock,
          color: 'text-red-300',
          label: 'Locked Door',
          bgColor: 'bg-red-900/80'
        };
      case 'barricaded':
        return {
          Icon: Ban,
          color: 'text-orange-300',
          label: 'Barricaded',
          bgColor: 'bg-orange-900/80'
        };
      case 'broken':
        return {
          Icon: AlertTriangle,
          color: 'text-gray-400',
          label: 'Broken Door',
          bgColor: 'bg-gray-800/80'
        };
      case 'sealed':
        return {
          Icon: Sparkles,
          color: 'text-purple-300',
          label: 'Sealed Door',
          bgColor: 'bg-purple-900/80'
        };
      case 'puzzle':
        return {
          Icon: Puzzle,
          color: 'text-blue-300',
          label: 'Puzzle Door',
          bgColor: 'bg-blue-900/80'
        };
      default:
        // Default to closed door if state unknown
        return {
          Icon: DoorClosed,
          color: 'text-amber-200',
          label: 'Door',
          bgColor: 'bg-amber-900/80'
        };
    }
  }

  // Open edges don't need icons
  if (normalizedType === 'open' || normalizedType === '') {
    return null;
  }

  return null;
}

// SVG path for edge icon rendering within hex
export const EdgeIcon: React.FC<EdgeIconProps> = ({ type, doorState, size = 12, className = '' }) => {
  const iconInfo = getEdgeIconInfo(type, doorState);

  if (!iconInfo) return null;

  const { Icon, color } = iconInfo;

  return (
    <Icon size={size} className={`${color} ${className}`} />
  );
};

// Get rotation angle for edge based on direction (0-5)
export function getEdgeRotation(edgeIndex: number): number {
  // Each edge is 60 degrees apart, starting from top (north)
  // 0: N (top), 1: NE, 2: SE, 3: S (bottom), 4: SW, 5: NW
  return edgeIndex * 60;
}

// Calculate position for edge icon on hex border
export function getEdgeIconPosition(edgeIndex: number, hexSize: number = 50): { x: number; y: number; rotation: number } {
  // Hex center is at (50, 50) in viewBox 0-100
  const centerX = 50;
  const centerY = 50;
  const radius = 42; // Distance from center to edge midpoint

  // Starting from top (north = 0), going clockwise
  // Angles: 0=top, 60=NE, 120=SE, 180=bottom, 240=SW, 300=NW
  const angleOffset = -90; // Start from top
  const angleDeg = edgeIndex * 60 + angleOffset;
  const angleRad = (angleDeg * Math.PI) / 180;

  const x = centerX + radius * Math.cos(angleRad);
  const y = centerY + radius * Math.sin(angleRad);

  // Rotation for the icon itself (perpendicular to edge)
  const rotation = edgeIndex * 60;

  return { x, y, rotation };
}

export default EdgeIcon;
