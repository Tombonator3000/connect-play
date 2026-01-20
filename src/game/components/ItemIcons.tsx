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

// ===== ITEM ICON MAPPING =====

export type ItemIconId =
  | 'knife' | 'club' | 'machete'
  | 'derringer' | 'rev' | 'shot' | 'rifle' | 'tommy'
  | 'leather_jacket' | 'trench_coat' | 'armored_vest'
  | 'flash' | 'lantern' | 'lockpick' | 'crowbar'
  | 'med' | 'whiskey' | 'bandages' | 'sedatives'
  | 'elder_sign' | 'protective_ward' | 'book';

export const ITEM_ICONS: Record<ItemIconId, React.FC<ItemIconProps>> = {
  // Melee weapons
  knife: KnifeIcon,
  club: ClubIcon,
  machete: MacheteIcon,
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
  // Tools
  flash: FlashlightIcon,
  lantern: LanternIcon,
  lockpick: LockpickIcon,
  crowbar: CrowbarIcon,
  // Consumables
  med: MedkitIcon,
  whiskey: WhiskeyIcon,
  bandages: BandagesIcon,
  sedatives: SedativesIcon,
  // Relics
  elder_sign: ElderSignIcon,
  protective_ward: ProtectiveWardIcon,
  book: NecronomiconIcon,
};

// Helper function to get item icon by ID
export function getItemIcon(itemId: string): React.FC<ItemIconProps> | null {
  const normalizedId = itemId.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  return ITEM_ICONS[normalizedId as ItemIconId] || null;
}

export default ITEM_ICONS;
