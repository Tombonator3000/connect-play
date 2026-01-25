import React from 'react';

interface ItemIconProps {
  size?: number;
  className?: string;
}

// ===== MELEE WEAPONS =====

export const KnifeIcon: React.FC<ItemIconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* Blade */}
    <path d="M19 2L9 12L7 10L17 0Z" fill="url(#knife-blade)" stroke="#374151" strokeWidth="0.5"/>
    <path d="M9 12L5 16L7 18L11 14Z" fill="#6B7280"/>
    {/* Handle */}
    <path d="M5 16L2 19L4 21L7 18Z" fill="#8B4513"/>
    <path d="M3 19L5 21L4.5 21.5L2.5 19.5Z" fill="#654321"/>
    {/* Blade highlight */}
    <path d="M18 3L10 11" stroke="white" strokeWidth="0.5" opacity="0.4"/>
    <defs>
      <linearGradient id="knife-blade" x1="19" y1="2" x2="7" y2="14">
        <stop stopColor="#E5E7EB"/>
        <stop offset="1" stopColor="#9CA3AF"/>
      </linearGradient>
    </defs>
  </svg>
);

export const ClubIcon: React.FC<ItemIconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* Club head */}
    <ellipse cx="7" cy="7" rx="5" ry="4" fill="url(#club-head)" transform="rotate(-45 7 7)"/>
    {/* Handle */}
    <path d="M10 10L20 20" stroke="#8B4513" strokeWidth="3" strokeLinecap="round"/>
    <path d="M10 10L20 20" stroke="#654321" strokeWidth="1.5" strokeLinecap="round"/>
    {/* Metal bands */}
    <circle cx="12" cy="12" r="1.5" fill="#6B7280"/>
    <defs>
      <linearGradient id="club-head" x1="2" y1="2" x2="12" y2="12">
        <stop stopColor="#A0522D"/>
        <stop offset="1" stopColor="#654321"/>
      </linearGradient>
    </defs>
  </svg>
);

export const MacheteIcon: React.FC<ItemIconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* Blade */}
    <path d="M20 2C20 2 21 3 21 4L7 18L5 16L19 2C19 2 20 2 20 2Z" fill="url(#machete-blade)" stroke="#374151" strokeWidth="0.5"/>
    {/* Blade back */}
    <path d="M20 2L21 4L20.5 4.5L19.5 2.5Z" fill="#4B5563"/>
    {/* Handle */}
    <path d="M7 18L5 16L3 18L5 20Z" fill="#8B4513"/>
    <path d="M3 18L5 20L4 21L2 19Z" fill="#654321"/>
    {/* Guard */}
    <rect x="5" y="16" width="3" height="1" fill="#D4AF37" transform="rotate(-45 5 16)"/>
    <defs>
      <linearGradient id="machete-blade" x1="20" y1="2" x2="5" y2="17">
        <stop stopColor="#D1D5DB"/>
        <stop offset="1" stopColor="#6B7280"/>
      </linearGradient>
    </defs>
  </svg>
);

// ===== RANGED WEAPONS =====

export const DerringerIcon: React.FC<ItemIconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* Barrel */}
    <rect x="10" y="9" width="12" height="4" rx="1" fill="url(#derringer-metal)"/>
    <rect x="10" y="10" width="12" height="2" fill="#4B5563"/>
    {/* Frame */}
    <path d="M4 11H11V15H8L4 19V11Z" fill="#374151"/>
    {/* Handle */}
    <path d="M4 14L8 14L8 18L4 19Z" fill="url(#derringer-grip)"/>
    {/* Trigger guard */}
    <path d="M9 15C9 17 7 17 7 17" stroke="#4B5563" strokeWidth="1" fill="none"/>
    {/* Trigger */}
    <rect x="8" y="15" width="1" height="2" fill="#6B7280"/>
    <defs>
      <linearGradient id="derringer-metal" x1="10" y1="9" x2="10" y2="13">
        <stop stopColor="#6B7280"/>
        <stop offset="1" stopColor="#374151"/>
      </linearGradient>
      <linearGradient id="derringer-grip" x1="4" y1="14" x2="8" y2="19">
        <stop stopColor="#8B4513"/>
        <stop offset="1" stopColor="#654321"/>
      </linearGradient>
    </defs>
  </svg>
);

export const RevolverIcon: React.FC<ItemIconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* Barrel */}
    <rect x="12" y="8" width="10" height="3" rx="0.5" fill="url(#revolver-barrel)"/>
    <rect x="12" y="9" width="10" height="1" fill="#4B5563"/>
    {/* Cylinder */}
    <circle cx="11" cy="9.5" r="3" fill="#4B5563"/>
    <circle cx="11" cy="9.5" r="2" fill="#374151"/>
    {/* Chamber holes */}
    <circle cx="11" cy="7.5" r="0.5" fill="#1F2937"/>
    <circle cx="12.5" cy="8.5" r="0.5" fill="#1F2937"/>
    <circle cx="12.5" cy="10.5" r="0.5" fill="#1F2937"/>
    <circle cx="11" cy="11.5" r="0.5" fill="#1F2937"/>
    <circle cx="9.5" cy="10.5" r="0.5" fill="#1F2937"/>
    <circle cx="9.5" cy="8.5" r="0.5" fill="#1F2937"/>
    {/* Frame */}
    <path d="M4 10H12V14H8L4 18V10Z" fill="#374151"/>
    {/* Handle */}
    <path d="M4 13L8 13L8 18L4 18Z" fill="url(#revolver-grip)"/>
    {/* Trigger guard */}
    <path d="M9 14C9 16 7 16 7 16" stroke="#4B5563" strokeWidth="1.5" fill="none"/>
    {/* Trigger */}
    <rect x="8" y="14" width="1" height="2" fill="#6B7280"/>
    {/* Hammer */}
    <path d="M6 8L8 8L8 10L6 10Z" fill="#4B5563"/>
    <defs>
      <linearGradient id="revolver-barrel" x1="12" y1="8" x2="12" y2="11">
        <stop stopColor="#6B7280"/>
        <stop offset="1" stopColor="#374151"/>
      </linearGradient>
      <linearGradient id="revolver-grip" x1="4" y1="13" x2="8" y2="18">
        <stop stopColor="#8B4513"/>
        <stop offset="1" stopColor="#654321"/>
      </linearGradient>
    </defs>
  </svg>
);

export const ShotgunIcon: React.FC<ItemIconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* Double barrels */}
    <rect x="8" y="9" width="14" height="2" rx="1" fill="url(#shotgun-barrel)"/>
    <rect x="8" y="12" width="14" height="2" rx="1" fill="url(#shotgun-barrel)"/>
    <line x1="8" y1="11" x2="22" y2="11" stroke="#1F2937" strokeWidth="0.5"/>
    {/* Receiver */}
    <rect x="4" y="9" width="5" height="5" rx="1" fill="#374151"/>
    {/* Stock */}
    <path d="M2 10L4 10L4 17L2 19Z" fill="url(#shotgun-stock)"/>
    {/* Trigger guard */}
    <path d="M6 14C6 16 4 16 4 16" stroke="#4B5563" strokeWidth="1.5" fill="none"/>
    {/* Trigger */}
    <rect x="5" y="14" width="1" height="1.5" fill="#6B7280"/>
    {/* Barrel highlight */}
    <line x1="10" y1="9.5" x2="20" y2="9.5" stroke="white" strokeWidth="0.3" opacity="0.3"/>
    <defs>
      <linearGradient id="shotgun-barrel" x1="8" y1="9" x2="8" y2="14">
        <stop stopColor="#4B5563"/>
        <stop offset="1" stopColor="#1F2937"/>
      </linearGradient>
      <linearGradient id="shotgun-stock" x1="2" y1="10" x2="4" y2="19">
        <stop stopColor="#A0522D"/>
        <stop offset="1" stopColor="#654321"/>
      </linearGradient>
    </defs>
  </svg>
);

export const RifleIcon: React.FC<ItemIconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* Barrel */}
    <rect x="10" y="10" width="12" height="2" rx="0.5" fill="url(#rifle-barrel)"/>
    {/* Scope */}
    <rect x="11" y="7" width="6" height="3" rx="1" fill="#374151"/>
    <circle cx="13" cy="8.5" r="1" fill="#1F2937"/>
    <circle cx="16" cy="8.5" r="1" fill="#1F2937"/>
    {/* Receiver */}
    <rect x="6" y="10" width="5" height="4" rx="1" fill="#374151"/>
    {/* Stock */}
    <path d="M2 11L6 11L6 16L2 18Z" fill="url(#rifle-stock)"/>
    {/* Trigger guard */}
    <path d="M8 14C8 16 6 16 6 16" stroke="#4B5563" strokeWidth="1" fill="none"/>
    {/* Magazine */}
    <rect x="9" y="14" width="2" height="3" rx="0.5" fill="#4B5563"/>
    <defs>
      <linearGradient id="rifle-barrel" x1="10" y1="10" x2="10" y2="12">
        <stop stopColor="#6B7280"/>
        <stop offset="1" stopColor="#374151"/>
      </linearGradient>
      <linearGradient id="rifle-stock" x1="2" y1="11" x2="6" y2="18">
        <stop stopColor="#A0522D"/>
        <stop offset="1" stopColor="#654321"/>
      </linearGradient>
    </defs>
  </svg>
);

export const TommyGunIcon: React.FC<ItemIconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* Barrel with compensator */}
    <rect x="14" y="9" width="8" height="3" rx="0.5" fill="url(#tommy-barrel)"/>
    <rect x="20" y="8" width="2" height="5" rx="0.5" fill="#374151"/>
    <line x1="21" y1="8" x2="21" y2="13" stroke="#1F2937" strokeWidth="0.3"/>
    {/* Receiver */}
    <rect x="8" y="9" width="7" height="4" rx="1" fill="#374151"/>
    {/* Stock */}
    <path d="M2 10L8 10L8 14L5 14L2 17Z" fill="url(#tommy-stock)"/>
    {/* Drum magazine */}
    <circle cx="11" cy="17" r="4" fill="#4B5563"/>
    <circle cx="11" cy="17" r="3" fill="#374151"/>
    <circle cx="11" cy="17" r="1" fill="#1F2937"/>
    {/* Foregrip */}
    <rect x="13" y="12" width="2" height="3" rx="0.5" fill="#8B4513"/>
    {/* Trigger guard */}
    <path d="M9 13C9 15 7 15 7 15" stroke="#4B5563" strokeWidth="1" fill="none"/>
    <defs>
      <linearGradient id="tommy-barrel" x1="14" y1="9" x2="14" y2="12">
        <stop stopColor="#6B7280"/>
        <stop offset="1" stopColor="#374151"/>
      </linearGradient>
      <linearGradient id="tommy-stock" x1="2" y1="10" x2="8" y2="17">
        <stop stopColor="#A0522D"/>
        <stop offset="1" stopColor="#654321"/>
      </linearGradient>
    </defs>
  </svg>
);

// ===== ARMOR =====

export const LeatherJacketIcon: React.FC<ItemIconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* Jacket body */}
    <path d="M6 6L12 4L18 6L20 20H4L6 6Z" fill="url(#leather-body)"/>
    {/* Collar */}
    <path d="M9 6L12 4L15 6L14 8H10L9 6Z" fill="#654321"/>
    {/* Left lapel */}
    <path d="M6 6L10 8L9 12L5 10Z" fill="#8B4513"/>
    {/* Right lapel */}
    <path d="M18 6L14 8L15 12L19 10Z" fill="#8B4513"/>
    {/* Zipper */}
    <line x1="12" y1="8" x2="12" y2="18" stroke="#D4AF37" strokeWidth="1"/>
    <circle cx="12" cy="9" r="0.5" fill="#D4AF37"/>
    {/* Pockets */}
    <rect x="7" y="14" width="3" height="2" rx="0.5" fill="#654321"/>
    <rect x="14" y="14" width="3" height="2" rx="0.5" fill="#654321"/>
    <defs>
      <linearGradient id="leather-body" x1="4" y1="4" x2="20" y2="20">
        <stop stopColor="#A0522D"/>
        <stop offset="1" stopColor="#654321"/>
      </linearGradient>
    </defs>
  </svg>
);

export const TrenchCoatIcon: React.FC<ItemIconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* Coat body */}
    <path d="M5 6L12 4L19 6L21 22H3L5 6Z" fill="url(#trench-body)"/>
    {/* Collar */}
    <path d="M8 6L12 4L16 6L15 9H9L8 6Z" fill="#5D4E37"/>
    {/* Belt */}
    <rect x="5" y="13" width="14" height="2" fill="#8B4513"/>
    <rect x="10" y="12" width="4" height="4" rx="0.5" fill="#D4AF37"/>
    {/* Buttons */}
    <circle cx="10" cy="10" r="0.7" fill="#4B5563"/>
    <circle cx="10" cy="17" r="0.7" fill="#4B5563"/>
    <circle cx="14" cy="10" r="0.7" fill="#4B5563"/>
    <circle cx="14" cy="17" r="0.7" fill="#4B5563"/>
    {/* Epaulettes */}
    <rect x="5" y="6" width="2" height="1" fill="#D4AF37"/>
    <rect x="17" y="6" width="2" height="1" fill="#D4AF37"/>
    <defs>
      <linearGradient id="trench-body" x1="3" y1="4" x2="21" y2="22">
        <stop stopColor="#8B7355"/>
        <stop offset="1" stopColor="#5D4E37"/>
      </linearGradient>
    </defs>
  </svg>
);

export const ArmoredVestIcon: React.FC<ItemIconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* Vest body */}
    <path d="M6 5L12 3L18 5L19 18H5L6 5Z" fill="url(#vest-body)"/>
    {/* Armor plates */}
    <rect x="7" y="7" width="4" height="5" rx="0.5" fill="#4B5563"/>
    <rect x="13" y="7" width="4" height="5" rx="0.5" fill="#4B5563"/>
    <rect x="7" y="13" width="4" height="4" rx="0.5" fill="#4B5563"/>
    <rect x="13" y="13" width="4" height="4" rx="0.5" fill="#4B5563"/>
    {/* Straps */}
    <rect x="5" y="8" width="2" height="1" fill="#374151"/>
    <rect x="17" y="8" width="2" height="1" fill="#374151"/>
    <rect x="5" y="12" width="2" height="1" fill="#374151"/>
    <rect x="17" y="12" width="2" height="1" fill="#374151"/>
    {/* Buckles */}
    <rect x="5" y="7.5" width="1" height="2" rx="0.2" fill="#D4AF37"/>
    <rect x="18" y="7.5" width="1" height="2" rx="0.2" fill="#D4AF37"/>
    <defs>
      <linearGradient id="vest-body" x1="5" y1="3" x2="19" y2="18">
        <stop stopColor="#374151"/>
        <stop offset="1" stopColor="#1F2937"/>
      </linearGradient>
    </defs>
  </svg>
);

// ===== TOOLS =====

export const FlashlightIcon: React.FC<ItemIconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* Light beam */}
    <path d="M2 8L8 6V14L2 12Z" fill="url(#light-beam)" opacity="0.6"/>
    {/* Head */}
    <rect x="8" y="6" width="4" height="8" rx="1" fill="url(#flash-head)"/>
    {/* Lens */}
    <circle cx="9" cy="10" r="2" fill="#FEF3C7"/>
    <circle cx="9" cy="10" r="1" fill="#FBBF24"/>
    {/* Body */}
    <rect x="12" y="7" width="8" height="6" rx="1" fill="url(#flash-body)"/>
    {/* Grip rings */}
    <rect x="14" y="7" width="1" height="6" fill="#1F2937"/>
    <rect x="17" y="7" width="1" height="6" fill="#1F2937"/>
    {/* Switch */}
    <rect x="15" y="9" width="2" height="2" rx="0.5" fill="#EF4444"/>
    <defs>
      <linearGradient id="light-beam" x1="8" y1="10" x2="2" y2="10">
        <stop stopColor="#FEF3C7"/>
        <stop offset="1" stopColor="#FEF3C7" stopOpacity="0"/>
      </linearGradient>
      <linearGradient id="flash-head" x1="8" y1="6" x2="12" y2="14">
        <stop stopColor="#6B7280"/>
        <stop offset="1" stopColor="#374151"/>
      </linearGradient>
      <linearGradient id="flash-body" x1="12" y1="7" x2="20" y2="13">
        <stop stopColor="#1F2937"/>
        <stop offset="1" stopColor="#111827"/>
      </linearGradient>
    </defs>
  </svg>
);

export const LanternIcon: React.FC<ItemIconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* Handle */}
    <path d="M9 3H15L14 5H10L9 3Z" fill="#D4AF37"/>
    <path d="M10 2C10 2 12 1 14 2" stroke="#D4AF37" strokeWidth="1" fill="none"/>
    {/* Top cap */}
    <rect x="8" y="5" width="8" height="2" rx="0.5" fill="#B45309"/>
    {/* Glass */}
    <rect x="7" y="7" width="10" height="10" rx="1" fill="url(#lantern-glass)"/>
    {/* Flame */}
    <ellipse cx="12" cy="12" rx="2" ry="3" fill="url(#flame)"/>
    <ellipse cx="12" cy="11" rx="1" ry="2" fill="#FEF3C7"/>
    {/* Base */}
    <rect x="7" y="17" width="10" height="3" rx="0.5" fill="#B45309"/>
    {/* Metal frame */}
    <line x1="7" y1="7" x2="7" y2="17" stroke="#B45309" strokeWidth="1"/>
    <line x1="17" y1="7" x2="17" y2="17" stroke="#B45309" strokeWidth="1"/>
    <defs>
      <linearGradient id="lantern-glass" x1="7" y1="7" x2="17" y2="17">
        <stop stopColor="#374151" stopOpacity="0.3"/>
        <stop offset="0.5" stopColor="#FEF3C7" stopOpacity="0.2"/>
        <stop offset="1" stopColor="#374151" stopOpacity="0.3"/>
      </linearGradient>
      <linearGradient id="flame" x1="12" y1="9" x2="12" y2="15">
        <stop stopColor="#FBBF24"/>
        <stop offset="1" stopColor="#F97316"/>
      </linearGradient>
    </defs>
  </svg>
);

export const LockpickIcon: React.FC<ItemIconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* Main pick */}
    <path d="M4 12L16 12L18 10L20 12L18 14L16 12" stroke="#9CA3AF" strokeWidth="1.5" fill="none"/>
    <path d="M18 10L20 12L18 14" fill="#6B7280"/>
    {/* Tension wrench */}
    <path d="M4 16L14 16L14 18L4 18Z" fill="#6B7280"/>
    <path d="M14 14L14 20L16 20L16 14Z" fill="#4B5563"/>
    {/* Handle wrap */}
    <rect x="4" y="10" width="3" height="4" rx="0.5" fill="#1F2937"/>
    <rect x="4" y="14" width="3" height="6" rx="0.5" fill="#1F2937"/>
    {/* Texture */}
    <line x1="5" y1="11" x2="6" y2="11" stroke="#374151" strokeWidth="0.5"/>
    <line x1="5" y1="12" x2="6" y2="12" stroke="#374151" strokeWidth="0.5"/>
    <line x1="5" y1="13" x2="6" y2="13" stroke="#374151" strokeWidth="0.5"/>
  </svg>
);

export const CrowbarIcon: React.FC<ItemIconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* Main bar */}
    <path d="M4 4L20 20" stroke="url(#crowbar-metal)" strokeWidth="3" strokeLinecap="round"/>
    {/* Curved end (pry end) */}
    <path d="M4 4C2 6 3 8 4 8L6 6" stroke="url(#crowbar-metal)" strokeWidth="3" strokeLinecap="round" fill="none"/>
    {/* Flat end */}
    <path d="M20 20L22 18M20 20L18 22" stroke="url(#crowbar-metal)" strokeWidth="2" strokeLinecap="round"/>
    {/* Highlight */}
    <path d="M5 5L19 19" stroke="white" strokeWidth="0.5" opacity="0.3"/>
    <defs>
      <linearGradient id="crowbar-metal" x1="4" y1="4" x2="20" y2="20">
        <stop stopColor="#DC2626"/>
        <stop offset="1" stopColor="#991B1B"/>
      </linearGradient>
    </defs>
  </svg>
);

// ===== CONSUMABLES =====

export const MedkitIcon: React.FC<ItemIconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* Case */}
    <rect x="3" y="6" width="18" height="14" rx="2" fill="url(#medkit-case)"/>
    {/* Latch */}
    <rect x="10" y="5" width="4" height="2" rx="0.5" fill="#D4AF37"/>
    {/* Cross */}
    <rect x="10" y="9" width="4" height="8" rx="0.5" fill="white"/>
    <rect x="8" y="11" width="8" height="4" rx="0.5" fill="white"/>
    {/* Shine */}
    <rect x="4" y="7" width="2" height="4" rx="0.5" fill="white" opacity="0.2"/>
    <defs>
      <linearGradient id="medkit-case" x1="3" y1="6" x2="21" y2="20">
        <stop stopColor="#DC2626"/>
        <stop offset="1" stopColor="#991B1B"/>
      </linearGradient>
    </defs>
  </svg>
);

export const WhiskeyIcon: React.FC<ItemIconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* Bottle */}
    <path d="M8 8L8 20C8 21 9 22 10 22H14C15 22 16 21 16 20V8Z" fill="url(#whiskey-glass)"/>
    {/* Liquid */}
    <path d="M9 12V19C9 20 10 21 10 21H14C14 21 15 20 15 19V12Z" fill="#B45309"/>
    {/* Neck */}
    <rect x="10" y="4" width="4" height="5" fill="url(#whiskey-glass)"/>
    {/* Cork */}
    <rect x="10" y="2" width="4" height="3" rx="0.5" fill="#8B4513"/>
    {/* Label */}
    <rect x="9" y="14" width="6" height="4" rx="0.5" fill="#FEF3C7"/>
    <text x="12" y="17" fontSize="3" fill="#92400E" textAnchor="middle" fontWeight="bold">XXX</text>
    <defs>
      <linearGradient id="whiskey-glass" x1="8" y1="4" x2="16" y2="22">
        <stop stopColor="#4B5563" stopOpacity="0.3"/>
        <stop offset="1" stopColor="#1F2937" stopOpacity="0.5"/>
      </linearGradient>
    </defs>
  </svg>
);

export const BandagesIcon: React.FC<ItemIconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* Roll */}
    <ellipse cx="12" cy="12" rx="8" ry="8" fill="url(#bandage-roll)"/>
    <ellipse cx="12" cy="12" rx="3" ry="3" fill="#E5E7EB"/>
    {/* Wrapped end */}
    <path d="M12 4C16 4 18 8 18 8L20 6C20 6 17 2 12 2" stroke="#F5F5F4" strokeWidth="2"/>
    <path d="M20 6L22 8L20 12" stroke="#F5F5F4" strokeWidth="2" strokeLinecap="round"/>
    {/* Cross marks */}
    <text x="8" y="11" fontSize="4" fill="#DC2626">+</text>
    <text x="14" y="15" fontSize="4" fill="#DC2626">+</text>
    <defs>
      <linearGradient id="bandage-roll" x1="4" y1="4" x2="20" y2="20">
        <stop stopColor="#FAFAFA"/>
        <stop offset="1" stopColor="#E5E7EB"/>
      </linearGradient>
    </defs>
  </svg>
);

export const SedativesIcon: React.FC<ItemIconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* Bottle */}
    <rect x="7" y="8" width="10" height="14" rx="1" fill="url(#sedative-bottle)"/>
    {/* Cap */}
    <rect x="9" y="4" width="6" height="5" rx="0.5" fill="#374151"/>
    {/* Liquid */}
    <rect x="8" y="14" width="8" height="7" rx="0.5" fill="#7C3AED"/>
    {/* Label */}
    <rect x="8" y="9" width="8" height="4" rx="0.5" fill="white"/>
    <text x="12" y="12" fontSize="3" fill="#7C3AED" textAnchor="middle">Rx</text>
    {/* Shine */}
    <rect x="8" y="9" width="1" height="12" fill="white" opacity="0.2"/>
    <defs>
      <linearGradient id="sedative-bottle" x1="7" y1="8" x2="17" y2="22">
        <stop stopColor="#4B5563" stopOpacity="0.4"/>
        <stop offset="1" stopColor="#1F2937" stopOpacity="0.6"/>
      </linearGradient>
    </defs>
  </svg>
);

// ===== RELICS =====

export const ElderSignIcon: React.FC<ItemIconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* Outer glow */}
    <circle cx="12" cy="12" r="10" fill="url(#elder-glow)" opacity="0.3"/>
    {/* Stone base */}
    <circle cx="12" cy="12" r="8" fill="url(#elder-stone)"/>
    {/* Elder Sign symbol (5-pointed star with eye) */}
    <path d="M12 4L14 10L20 10L15 14L17 20L12 16L7 20L9 14L4 10L10 10Z"
          fill="none" stroke="#10B981" strokeWidth="1.5"/>
    {/* Center eye */}
    <ellipse cx="12" cy="12" rx="2" ry="1.5" fill="#10B981"/>
    <circle cx="12" cy="12" r="0.7" fill="#1F2937"/>
    {/* Rays */}
    <line x1="12" y1="6" x2="12" y2="4" stroke="#10B981" strokeWidth="0.5"/>
    <line x1="16" y1="8" x2="18" y2="6" stroke="#10B981" strokeWidth="0.5"/>
    <line x1="18" y1="12" x2="20" y2="12" stroke="#10B981" strokeWidth="0.5"/>
    <defs>
      <radialGradient id="elder-glow" cx="12" cy="12" r="10">
        <stop stopColor="#10B981"/>
        <stop offset="1" stopColor="#10B981" stopOpacity="0"/>
      </radialGradient>
      <linearGradient id="elder-stone" x1="4" y1="4" x2="20" y2="20">
        <stop stopColor="#4B5563"/>
        <stop offset="1" stopColor="#1F2937"/>
      </linearGradient>
    </defs>
  </svg>
);

export const ProtectiveWardIcon: React.FC<ItemIconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* Amulet base */}
    <path d="M12 2L20 8V16L12 22L4 16V8L12 2Z" fill="url(#ward-metal)"/>
    {/* Inner design */}
    <path d="M12 5L17 9V15L12 19L7 15V9L12 5Z" fill="#1F2937"/>
    {/* Protective runes */}
    <circle cx="12" cy="12" r="4" fill="none" stroke="#A855F7" strokeWidth="1"/>
    <circle cx="12" cy="12" r="2" fill="#A855F7" opacity="0.5"/>
    {/* Rune marks */}
    <line x1="12" y1="8" x2="12" y2="16" stroke="#A855F7" strokeWidth="0.5"/>
    <line x1="8" y1="12" x2="16" y2="12" stroke="#A855F7" strokeWidth="0.5"/>
    <line x1="9" y1="9" x2="15" y2="15" stroke="#A855F7" strokeWidth="0.5"/>
    <line x1="15" y1="9" x2="9" y2="15" stroke="#A855F7" strokeWidth="0.5"/>
    {/* Chain loop */}
    <circle cx="12" cy="2" r="1.5" fill="none" stroke="#D4AF37" strokeWidth="1"/>
    <defs>
      <linearGradient id="ward-metal" x1="4" y1="2" x2="20" y2="22">
        <stop stopColor="#9CA3AF"/>
        <stop offset="1" stopColor="#4B5563"/>
      </linearGradient>
    </defs>
  </svg>
);

export const NecronomiconIcon: React.FC<ItemIconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* Book cover */}
    <path d="M4 3H18C19 3 20 4 20 5V21C20 21 19 22 18 22H4V3Z" fill="url(#necro-cover)"/>
    {/* Spine */}
    <rect x="4" y="3" width="2" height="19" fill="#1F2937"/>
    {/* Pages */}
    <rect x="6" y="4" width="12" height="17" fill="#F5F5F4"/>
    {/* Creepy face emblem */}
    <circle cx="12" cy="12" r="5" fill="#1F2937"/>
    {/* Eyes */}
    <circle cx="10" cy="11" r="1" fill="#DC2626"/>
    <circle cx="14" cy="11" r="1" fill="#DC2626"/>
    {/* Mouth */}
    <path d="M9 14C9 14 12 16 15 14" stroke="#DC2626" strokeWidth="0.5" fill="none"/>
    {/* Tentacles */}
    <path d="M7 15C7 15 6 18 8 19" stroke="#4B5563" strokeWidth="0.5"/>
    <path d="M17 15C17 15 18 18 16 19" stroke="#4B5563" strokeWidth="0.5"/>
    {/* Binding */}
    <rect x="4" y="6" width="16" height="1" fill="#D4AF37" opacity="0.5"/>
    <rect x="4" y="18" width="16" height="1" fill="#D4AF37" opacity="0.5"/>
    <defs>
      <linearGradient id="necro-cover" x1="4" y1="3" x2="20" y2="22">
        <stop stopColor="#4B5563"/>
        <stop offset="1" stopColor="#1F2937"/>
      </linearGradient>
    </defs>
  </svg>
);

// ===== QUEST ITEMS =====

export const QuestKeyIcon: React.FC<ItemIconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* Glow effect */}
    <circle cx="12" cy="12" r="10" fill="url(#key-glow)" opacity="0.4"/>
    {/* Key head (ornate) */}
    <circle cx="8" cy="8" r="5" fill="none" stroke="url(#key-metal)" strokeWidth="2"/>
    <circle cx="8" cy="8" r="2" fill="#D4AF37"/>
    {/* Key shaft */}
    <rect x="11" y="7" width="10" height="2" fill="url(#key-metal)"/>
    {/* Key teeth */}
    <rect x="17" y="9" width="2" height="3" fill="#D4AF37"/>
    <rect x="19" y="9" width="2" height="2" fill="#D4AF37"/>
    {/* Sparkle */}
    <circle cx="6" cy="6" r="1" fill="white" opacity="0.8"/>
    <defs>
      <radialGradient id="key-glow" cx="12" cy="12" r="10">
        <stop stopColor="#FBBF24"/>
        <stop offset="1" stopColor="#FBBF24" stopOpacity="0"/>
      </radialGradient>
      <linearGradient id="key-metal" x1="4" y1="4" x2="21" y2="12">
        <stop stopColor="#FDE68A"/>
        <stop offset="0.5" stopColor="#D4AF37"/>
        <stop offset="1" stopColor="#B45309"/>
      </linearGradient>
    </defs>
  </svg>
);

export const QuestClueIcon: React.FC<ItemIconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* Glow effect */}
    <circle cx="12" cy="12" r="10" fill="url(#clue-glow)" opacity="0.3"/>
    {/* Paper/document */}
    <path d="M6 3H15L18 6V21H6V3Z" fill="#FEF3C7"/>
    <path d="M15 3V6H18" fill="none" stroke="#D4AF37" strokeWidth="1"/>
    {/* Text lines */}
    <rect x="8" y="8" width="8" height="1" fill="#92400E"/>
    <rect x="8" y="11" width="6" height="1" fill="#92400E"/>
    <rect x="8" y="14" width="7" height="1" fill="#92400E"/>
    <rect x="8" y="17" width="5" height="1" fill="#92400E"/>
    {/* Magnifying glass overlay */}
    <circle cx="16" cy="17" r="4" fill="none" stroke="#3B82F6" strokeWidth="1.5"/>
    <line x1="19" y1="20" x2="22" y2="23" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
    <defs>
      <radialGradient id="clue-glow" cx="12" cy="12" r="10">
        <stop stopColor="#3B82F6"/>
        <stop offset="1" stopColor="#3B82F6" stopOpacity="0"/>
      </radialGradient>
    </defs>
  </svg>
);

export const QuestArtifactIcon: React.FC<ItemIconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* Glow effect */}
    <circle cx="12" cy="12" r="10" fill="url(#artifact-glow)" opacity="0.4"/>
    {/* Crystal/gem shape */}
    <path d="M12 2L20 10L12 22L4 10L12 2Z" fill="url(#artifact-crystal)"/>
    {/* Facets */}
    <path d="M12 2L12 22" stroke="#E9D5FF" strokeWidth="0.5" opacity="0.5"/>
    <path d="M4 10L20 10" stroke="#E9D5FF" strokeWidth="0.5" opacity="0.5"/>
    <path d="M12 2L4 10L12 12L20 10L12 2Z" fill="#A855F7" opacity="0.4"/>
    {/* Sparkles */}
    <circle cx="10" cy="8" r="1" fill="white" opacity="0.9"/>
    <circle cx="14" cy="14" r="0.5" fill="white" opacity="0.7"/>
    <defs>
      <radialGradient id="artifact-glow" cx="12" cy="12" r="10">
        <stop stopColor="#A855F7"/>
        <stop offset="1" stopColor="#A855F7" stopOpacity="0"/>
      </radialGradient>
      <linearGradient id="artifact-crystal" x1="4" y1="2" x2="20" y2="22">
        <stop stopColor="#E9D5FF"/>
        <stop offset="0.5" stopColor="#A855F7"/>
        <stop offset="1" stopColor="#7C3AED"/>
      </linearGradient>
    </defs>
  </svg>
);

export const QuestCollectibleIcon: React.FC<ItemIconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* Glow effect */}
    <circle cx="12" cy="12" r="10" fill="url(#collect-glow)" opacity="0.3"/>
    {/* Star shape */}
    <path d="M12 2L14.5 9H22L16 14L18.5 21L12 17L5.5 21L8 14L2 9H9.5L12 2Z"
          fill="url(#collect-star)" stroke="#FDE68A" strokeWidth="0.5"/>
    {/* Center shine */}
    <circle cx="12" cy="12" r="2" fill="#FEF3C7"/>
    <defs>
      <radialGradient id="collect-glow" cx="12" cy="12" r="10">
        <stop stopColor="#FBBF24"/>
        <stop offset="1" stopColor="#FBBF24" stopOpacity="0"/>
      </radialGradient>
      <linearGradient id="collect-star" x1="2" y1="2" x2="22" y2="22">
        <stop stopColor="#FDE68A"/>
        <stop offset="0.5" stopColor="#FBBF24"/>
        <stop offset="1" stopColor="#D97706"/>
      </linearGradient>
    </defs>
  </svg>
);

export const QuestComponentIcon: React.FC<ItemIconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* Glow effect */}
    <circle cx="12" cy="12" r="10" fill="url(#comp-glow)" opacity="0.3"/>
    {/* Gear shape */}
    <path d="M12 4L14 6L18 6L18 10L20 12L18 14L18 18L14 18L12 20L10 18L6 18L6 14L4 12L6 10L6 6L10 6L12 4Z"
          fill="url(#comp-metal)"/>
    {/* Center hole */}
    <circle cx="12" cy="12" r="3" fill="#1F2937"/>
    {/* Inner detail */}
    <circle cx="12" cy="12" r="1.5" fill="none" stroke="#22D3EE" strokeWidth="0.5"/>
    {/* Sparkle */}
    <circle cx="9" cy="9" r="0.8" fill="white" opacity="0.7"/>
    <defs>
      <radialGradient id="comp-glow" cx="12" cy="12" r="10">
        <stop stopColor="#22D3EE"/>
        <stop offset="1" stopColor="#22D3EE" stopOpacity="0"/>
      </radialGradient>
      <linearGradient id="comp-metal" x1="4" y1="4" x2="20" y2="20">
        <stop stopColor="#67E8F9"/>
        <stop offset="0.5" stopColor="#22D3EE"/>
        <stop offset="1" stopColor="#0891B2"/>
      </linearGradient>
    </defs>
  </svg>
);

// ===== ADDITIONAL TOOLS =====

export const RopeIcon: React.FC<ItemIconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* Coiled rope */}
    <ellipse cx="12" cy="14" rx="8" ry="4" fill="none" stroke="#A0522D" strokeWidth="2"/>
    <ellipse cx="12" cy="12" rx="7" ry="3.5" fill="none" stroke="#8B4513" strokeWidth="2"/>
    <ellipse cx="12" cy="10" rx="6" ry="3" fill="none" stroke="#A0522D" strokeWidth="2"/>
    <ellipse cx="12" cy="8" rx="5" ry="2.5" fill="none" stroke="#8B4513" strokeWidth="2"/>
    {/* Rope end */}
    <path d="M17 8C17 8 19 6 20 8" stroke="#A0522D" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const GrapplingHookIcon: React.FC<ItemIconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* Hook */}
    <path d="M12 4L8 10L12 14L16 10L12 4Z" fill="url(#hook-metal)"/>
    {/* Prongs */}
    <path d="M8 10C6 12 6 14 8 14" stroke="#6B7280" strokeWidth="2" strokeLinecap="round"/>
    <path d="M16 10C18 12 18 14 16 14" stroke="#6B7280" strokeWidth="2" strokeLinecap="round"/>
    {/* Ring */}
    <circle cx="12" cy="6" r="2" fill="none" stroke="#D4AF37" strokeWidth="1.5"/>
    {/* Rope */}
    <path d="M12 8L12 22" stroke="#A0522D" strokeWidth="2" strokeDasharray="2 2"/>
    <defs>
      <linearGradient id="hook-metal" x1="8" y1="4" x2="16" y2="14">
        <stop stopColor="#9CA3AF"/>
        <stop offset="1" stopColor="#4B5563"/>
      </linearGradient>
    </defs>
  </svg>
);

// ===== ADDITIONAL CONSUMABLES =====

export const MorphineIcon: React.FC<ItemIconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* Syringe body */}
    <rect x="4" y="10" width="14" height="4" rx="1" fill="url(#syringe-glass)"/>
    {/* Liquid */}
    <rect x="5" y="11" width="8" height="2" fill="#22C55E"/>
    {/* Needle */}
    <path d="M18 12L22 12" stroke="#9CA3AF" strokeWidth="1"/>
    <path d="M22 12L23 11.5L23 12.5L22 12Z" fill="#9CA3AF"/>
    {/* Plunger */}
    <rect x="2" y="11" width="3" height="2" fill="#374151"/>
    {/* Grip rings */}
    <rect x="3" y="9" width="1" height="6" fill="#4B5563"/>
    {/* Measurement marks */}
    <line x1="7" y1="10" x2="7" y2="14" stroke="#374151" strokeWidth="0.5"/>
    <line x1="10" y1="10" x2="10" y2="14" stroke="#374151" strokeWidth="0.5"/>
    <line x1="13" y1="10" x2="13" y2="14" stroke="#374151" strokeWidth="0.5"/>
    <defs>
      <linearGradient id="syringe-glass" x1="4" y1="10" x2="18" y2="14">
        <stop stopColor="#E5E7EB" stopOpacity="0.6"/>
        <stop offset="1" stopColor="#9CA3AF" stopOpacity="0.4"/>
      </linearGradient>
    </defs>
  </svg>
);

export const SmellingSaltsIcon: React.FC<ItemIconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* Small bottle */}
    <rect x="8" y="10" width="8" height="10" rx="1" fill="url(#salts-bottle)"/>
    {/* Cap */}
    <rect x="9" y="7" width="6" height="4" rx="0.5" fill="#1F2937"/>
    {/* Vapors */}
    <path d="M10 5C10 3 11 2 12 2" stroke="#A855F7" strokeWidth="1" opacity="0.6"/>
    <path d="M12 6C12 4 13 3 14 3" stroke="#A855F7" strokeWidth="1" opacity="0.4"/>
    <path d="M11 4C11 2 10 1 9 1" stroke="#A855F7" strokeWidth="1" opacity="0.5"/>
    {/* Label */}
    <rect x="9" y="13" width="6" height="4" rx="0.5" fill="white"/>
    <text x="12" y="16" fontSize="3" fill="#4B5563" textAnchor="middle">NH₃</text>
    <defs>
      <linearGradient id="salts-bottle" x1="8" y1="10" x2="16" y2="20">
        <stop stopColor="#4B5563" stopOpacity="0.5"/>
        <stop offset="1" stopColor="#1F2937" stopOpacity="0.7"/>
      </linearGradient>
    </defs>
  </svg>
);

export const AncientTomeIcon: React.FC<ItemIconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* Book cover */}
    <path d="M4 3H18C19 3 20 4 20 5V19C20 20 19 21 18 21H4V3Z" fill="url(#tome-cover)"/>
    {/* Spine */}
    <rect x="4" y="3" width="2" height="18" fill="#654321"/>
    {/* Pages */}
    <rect x="6" y="4" width="12" height="16" fill="#FEF3C7"/>
    {/* Mystical symbol */}
    <circle cx="12" cy="12" r="4" fill="none" stroke="#7C3AED" strokeWidth="1"/>
    <path d="M12 8L14 11L12 16L10 11Z" fill="#7C3AED"/>
    {/* Corner decorations */}
    <path d="M7 5L9 5L7 7Z" fill="#D4AF37"/>
    <path d="M17 5L17 7L15 5Z" fill="#D4AF37"/>
    <path d="M7 19L9 19L7 17Z" fill="#D4AF37"/>
    <path d="M17 19L17 17L15 19Z" fill="#D4AF37"/>
    <defs>
      <linearGradient id="tome-cover" x1="4" y1="3" x2="20" y2="21">
        <stop stopColor="#8B4513"/>
        <stop offset="1" stopColor="#654321"/>
      </linearGradient>
    </defs>
  </svg>
);

// ===== ADDITIONAL ARMOR =====

export const ChainMailIcon: React.FC<ItemIconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* Shirt shape */}
    <path d="M6 6L8 4H16L18 6V10L20 12V20H4V12L6 10V6Z" fill="url(#chainmail-metal)"/>
    {/* Chain pattern - rows of interlocking circles */}
    <g stroke="#6B7280" strokeWidth="0.5" fill="none">
      <circle cx="8" cy="8" r="1.5"/><circle cx="11" cy="8" r="1.5"/><circle cx="14" cy="8" r="1.5"/><circle cx="17" cy="8" r="1.5"/>
      <circle cx="6.5" cy="10.5" r="1.5"/><circle cx="9.5" cy="10.5" r="1.5"/><circle cx="12.5" cy="10.5" r="1.5"/><circle cx="15.5" cy="10.5" r="1.5"/><circle cx="18.5" cy="10.5" r="1.5"/>
      <circle cx="8" cy="13" r="1.5"/><circle cx="11" cy="13" r="1.5"/><circle cx="14" cy="13" r="1.5"/><circle cx="17" cy="13" r="1.5"/>
      <circle cx="6.5" cy="15.5" r="1.5"/><circle cx="9.5" cy="15.5" r="1.5"/><circle cx="12.5" cy="15.5" r="1.5"/><circle cx="15.5" cy="15.5" r="1.5"/><circle cx="18.5" cy="15.5" r="1.5"/>
      <circle cx="8" cy="18" r="1.5"/><circle cx="11" cy="18" r="1.5"/><circle cx="14" cy="18" r="1.5"/><circle cx="17" cy="18" r="1.5"/>
    </g>
    <defs>
      <linearGradient id="chainmail-metal" x1="4" y1="4" x2="20" y2="20">
        <stop stopColor="#9CA3AF"/>
        <stop offset="1" stopColor="#4B5563"/>
      </linearGradient>
    </defs>
  </svg>
);

export const HeavyCoatIcon: React.FC<ItemIconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* Coat body */}
    <path d="M6 6L8 3H16L18 6V22H6V6Z" fill="url(#coat-fabric)"/>
    {/* Collar */}
    <path d="M8 3L10 6H14L16 3" stroke="#1F2937" strokeWidth="1" fill="#374151"/>
    {/* Lapels */}
    <path d="M10 6L8 12L10 12Z" fill="#374151"/>
    <path d="M14 6L16 12L14 12Z" fill="#374151"/>
    {/* Buttons */}
    <circle cx="12" cy="10" r="0.8" fill="#D4AF37"/>
    <circle cx="12" cy="13" r="0.8" fill="#D4AF37"/>
    <circle cx="12" cy="16" r="0.8" fill="#D4AF37"/>
    <circle cx="12" cy="19" r="0.8" fill="#D4AF37"/>
    {/* Pockets */}
    <rect x="7" y="14" width="3" height="2" rx="0.5" fill="#374151"/>
    <rect x="14" y="14" width="3" height="2" rx="0.5" fill="#374151"/>
    <defs>
      <linearGradient id="coat-fabric" x1="6" y1="3" x2="18" y2="22">
        <stop stopColor="#4B5563"/>
        <stop offset="1" stopColor="#1F2937"/>
      </linearGradient>
    </defs>
  </svg>
);

export const LeatherVestIcon: React.FC<ItemIconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* Vest body */}
    <path d="M6 5L8 3H16L18 5V20H14V22H10V20H6V5Z" fill="url(#vest-leather)"/>
    {/* V-neck */}
    <path d="M10 3L12 8L14 3" fill="#1F2937"/>
    {/* Stitching */}
    <line x1="8" y1="5" x2="8" y2="19" stroke="#654321" strokeWidth="0.5" strokeDasharray="2 1"/>
    <line x1="16" y1="5" x2="16" y2="19" stroke="#654321" strokeWidth="0.5" strokeDasharray="2 1"/>
    {/* Buttons */}
    <circle cx="10" cy="10" r="0.7" fill="#B45309"/>
    <circle cx="10" cy="13" r="0.7" fill="#B45309"/>
    <circle cx="10" cy="16" r="0.7" fill="#B45309"/>
    <defs>
      <linearGradient id="vest-leather" x1="6" y1="3" x2="18" y2="22">
        <stop stopColor="#A0522D"/>
        <stop offset="1" stopColor="#654321"/>
      </linearGradient>
    </defs>
  </svg>
);

// ===== ADDITIONAL RELICS =====

export const SilverDaggerIcon: React.FC<ItemIconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* Glow */}
    <ellipse cx="12" cy="12" rx="10" ry="10" fill="url(#silver-glow)" opacity="0.3"/>
    {/* Blade */}
    <path d="M18 3L13 11L12 14L11 11L6 3L12 2L18 3Z" fill="url(#silver-blade)" stroke="#9CA3AF" strokeWidth="0.5"/>
    {/* Fuller */}
    <line x1="12" y1="4" x2="12" y2="11" stroke="#E5E7EB" strokeWidth="1"/>
    {/* Guard */}
    <rect x="9" y="14" width="6" height="2" rx="0.5" fill="#D4AF37"/>
    {/* Handle */}
    <rect x="10" y="16" width="4" height="5" rx="0.5" fill="url(#dagger-handle)"/>
    {/* Pommel */}
    <circle cx="12" cy="22" r="1.5" fill="#D4AF37"/>
    {/* Sparkle */}
    <circle cx="14" cy="5" r="0.5" fill="white" opacity="0.8"/>
    <defs>
      <radialGradient id="silver-glow" cx="12" cy="12" r="10">
        <stop stopColor="#E5E7EB"/>
        <stop offset="1" stopColor="#E5E7EB" stopOpacity="0"/>
      </radialGradient>
      <linearGradient id="silver-blade" x1="6" y1="2" x2="18" y2="14">
        <stop stopColor="#F3F4F6"/>
        <stop offset="0.5" stopColor="#D1D5DB"/>
        <stop offset="1" stopColor="#9CA3AF"/>
      </linearGradient>
      <linearGradient id="dagger-handle" x1="10" y1="16" x2="14" y2="21">
        <stop stopColor="#1F2937"/>
        <stop offset="1" stopColor="#111827"/>
      </linearGradient>
    </defs>
  </svg>
);

export const PowderOfIbnGhaziIcon: React.FC<ItemIconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* Pouch */}
    <path d="M6 10C6 8 8 6 12 6C16 6 18 8 18 10V18C18 20 16 22 12 22C8 22 6 20 6 18V10Z" fill="url(#pouch-leather)"/>
    {/* Drawstring */}
    <path d="M8 8C8 8 10 10 12 10C14 10 16 8 16 8" stroke="#D4AF37" strokeWidth="1"/>
    <circle cx="10" cy="6" r="1" fill="#D4AF37"/>
    <circle cx="14" cy="6" r="1" fill="#D4AF37"/>
    {/* Magical dust escaping */}
    <circle cx="11" cy="4" r="0.5" fill="#A855F7" opacity="0.8"/>
    <circle cx="13" cy="3" r="0.5" fill="#A855F7" opacity="0.6"/>
    <circle cx="10" cy="2" r="0.5" fill="#A855F7" opacity="0.4"/>
    <circle cx="14" cy="1" r="0.5" fill="#A855F7" opacity="0.3"/>
    {/* Mystical symbol on pouch */}
    <path d="M12 12L14 15L12 18L10 15Z" fill="#7C3AED" opacity="0.7"/>
    <defs>
      <linearGradient id="pouch-leather" x1="6" y1="6" x2="18" y2="22">
        <stop stopColor="#8B4513"/>
        <stop offset="1" stopColor="#654321"/>
      </linearGradient>
    </defs>
  </svg>
);

export const AxeIcon: React.FC<ItemIconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* Handle */}
    <rect x="10" y="6" width="4" height="16" rx="0.5" fill="url(#axe-handle)"/>
    {/* Axe head */}
    <path d="M6 4C4 6 4 10 6 12L14 8L6 4Z" fill="url(#axe-blade)" stroke="#4B5563" strokeWidth="0.5"/>
    {/* Blade edge */}
    <path d="M6 4C4 6 4 10 6 12" stroke="#E5E7EB" strokeWidth="1"/>
    {/* Binding */}
    <rect x="9" y="8" width="6" height="2" fill="#8B4513"/>
    <rect x="9" y="7" width="6" height="1" fill="#654321"/>
    <defs>
      <linearGradient id="axe-handle" x1="10" y1="6" x2="14" y2="22">
        <stop stopColor="#A0522D"/>
        <stop offset="1" stopColor="#654321"/>
      </linearGradient>
      <linearGradient id="axe-blade" x1="4" y1="4" x2="14" y2="12">
        <stop stopColor="#9CA3AF"/>
        <stop offset="1" stopColor="#4B5563"/>
      </linearGradient>
    </defs>
  </svg>
);

export const CrossbowIcon: React.FC<ItemIconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* Stock */}
    <rect x="10" y="10" width="12" height="4" rx="0.5" fill="url(#crossbow-stock)"/>
    {/* Bow arms */}
    <path d="M4 6C6 4 10 4 12 6" stroke="#8B4513" strokeWidth="2" fill="none"/>
    <path d="M4 18C6 20 10 20 12 18" stroke="#8B4513" strokeWidth="2" fill="none"/>
    {/* String */}
    <line x1="4" y1="6" x2="4" y2="18" stroke="#D4AF37" strokeWidth="1"/>
    {/* Bolt */}
    <rect x="6" y="11" width="8" height="2" fill="#6B7280"/>
    <path d="M4 12L6 11V13L4 12Z" fill="#4B5563"/>
    {/* Trigger mechanism */}
    <rect x="14" y="14" width="2" height="3" fill="#374151"/>
    {/* Sight */}
    <rect x="10" y="9" width="1" height="2" fill="#4B5563"/>
    <defs>
      <linearGradient id="crossbow-stock" x1="10" y1="10" x2="22" y2="14">
        <stop stopColor="#A0522D"/>
        <stop offset="1" stopColor="#654321"/>
      </linearGradient>
    </defs>
  </svg>
);

// ===== ITEM ICON MAPPING =====

export type ItemIconId =
  | 'knife' | 'club' | 'machete' | 'axe' | 'crossbow'
  | 'derringer' | 'rev' | 'shot' | 'rifle' | 'tommy'
  | 'leather_jacket' | 'trench_coat' | 'armored_vest' | 'chain_mail' | 'heavy_coat' | 'leather_vest'
  | 'flash' | 'lantern' | 'lockpick' | 'crowbar' | 'rope' | 'grappling_hook'
  | 'med' | 'whiskey' | 'bandages' | 'sedatives' | 'morphine' | 'smelling_salts' | 'ancient_tome'
  | 'elder_sign' | 'protective_ward' | 'book' | 'silver_dagger' | 'powder_ibn_ghazi'
  | 'quest_key' | 'quest_clue' | 'quest_artifact' | 'quest_collectible' | 'quest_component' | 'quest_item';

export const ITEM_ICONS: Record<ItemIconId, React.FC<ItemIconProps>> = {
  // Melee weapons
  knife: KnifeIcon,
  club: ClubIcon,
  machete: MacheteIcon,
  axe: AxeIcon,
  crossbow: CrossbowIcon,
  // Ranged weapons
  derringer: DerringerIcon,
  rev: RevolverIcon,
  shot: ShotgunIcon,
  rifle: RifleIcon,
  tommy: TommyGunIcon,
  // Armor
  leather_jacket: LeatherJacketIcon,
  trench_coat: TrenchCoatIcon,
  armored_vest: ArmoredVestIcon,
  chain_mail: ChainMailIcon,
  heavy_coat: HeavyCoatIcon,
  leather_vest: LeatherVestIcon,
  // Tools
  flash: FlashlightIcon,
  lantern: LanternIcon,
  lockpick: LockpickIcon,
  crowbar: CrowbarIcon,
  rope: RopeIcon,
  grappling_hook: GrapplingHookIcon,
  // Consumables
  med: MedkitIcon,
  whiskey: WhiskeyIcon,
  bandages: BandagesIcon,
  sedatives: SedativesIcon,
  morphine: MorphineIcon,
  smelling_salts: SmellingSaltsIcon,
  ancient_tome: AncientTomeIcon,
  // Relics
  elder_sign: ElderSignIcon,
  protective_ward: ProtectiveWardIcon,
  book: NecronomiconIcon,
  silver_dagger: SilverDaggerIcon,
  powder_ibn_ghazi: PowderOfIbnGhaziIcon,
  // Quest items
  quest_key: QuestKeyIcon,
  quest_clue: QuestClueIcon,
  quest_artifact: QuestArtifactIcon,
  quest_collectible: QuestCollectibleIcon,
  quest_component: QuestComponentIcon,
  quest_item: QuestCollectibleIcon, // Default quest item icon
};

// Helper function to get item icon by ID or type
export function getItemIcon(itemId: string, itemType?: string, questItemType?: string): React.FC<ItemIconProps> | null {
  // Handle quest items by their questItemType
  if (itemType === 'quest_item' && questItemType) {
    switch (questItemType) {
      case 'key': return QuestKeyIcon;
      case 'clue': return QuestClueIcon;
      case 'artifact': return QuestArtifactIcon;
      case 'collectible': return QuestCollectibleIcon;
      case 'component': return QuestComponentIcon;
    }
  }

  // Handle key type items
  if (itemType === 'key') {
    return QuestKeyIcon;
  }

  // Handle clue type items
  if (itemType === 'clue') {
    return QuestClueIcon;
  }

  const normalizedId = itemId.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  return ITEM_ICONS[normalizedId as ItemIconId] || null;
}

export default ITEM_ICONS;
