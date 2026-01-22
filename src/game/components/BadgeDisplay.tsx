/**
 * BadgeDisplay - Achievement Badge Display Component
 *
 * Shows earned achievement badges on character cards and hero panels.
 * Badges are visual rewards for accomplishments like:
 * - Surviving scenarios
 * - Killing bosses
 * - Finding lore
 * - Completing challenges
 *
 * Rarity Levels:
 * - Bronze: Basic achievements
 * - Silver: Intermediate achievements
 * - Gold: Advanced achievements
 * - Legendary: Exceptional achievements
 */

import React, { useState } from 'react';
import {
  Award, Trophy, Star, Crown, Shield,
  Skull, BookOpen, Heart, Footprints, Zap
} from 'lucide-react';
import { EarnedBadge, AchievementBadge, BadgeRarity } from '../types';
import { ACHIEVEMENT_BADGES } from '../constants';

interface BadgeDisplayProps {
  earnedBadges: EarnedBadge[];
  maxDisplay?: number;     // Max badges to show before "more" indicator
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  className?: string;
}

// Get badge data by ID
const getBadgeById = (badgeId: string): AchievementBadge | undefined => {
  return ACHIEVEMENT_BADGES.find(b => b.id === badgeId);
};

// Get color classes for rarity
const getRarityColors = (rarity: BadgeRarity) => {
  switch (rarity) {
    case 'bronze':
      return {
        border: 'border-amber-700',
        bg: 'bg-gradient-to-br from-amber-800 to-amber-950',
        text: 'text-amber-300',
        glow: ''
      };
    case 'silver':
      return {
        border: 'border-gray-400',
        bg: 'bg-gradient-to-br from-gray-400 to-gray-600',
        text: 'text-gray-100',
        glow: 'shadow-[0_0_8px_rgba(156,163,175,0.5)]'
      };
    case 'gold':
      return {
        border: 'border-yellow-500',
        bg: 'bg-gradient-to-br from-yellow-500 to-amber-600',
        text: 'text-yellow-100',
        glow: 'shadow-[0_0_12px_rgba(250,204,21,0.6)]'
      };
    case 'legendary':
      return {
        border: 'border-purple-400',
        bg: 'bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600',
        text: 'text-white',
        glow: 'shadow-[0_0_16px_rgba(168,85,247,0.7)] animate-pulse'
      };
    default:
      return {
        border: 'border-gray-600',
        bg: 'bg-gray-800',
        text: 'text-gray-300',
        glow: ''
      };
  }
};

// Get size classes
const getSizeClasses = (size: 'sm' | 'md' | 'lg') => {
  switch (size) {
    case 'sm':
      return {
        container: 'w-6 h-6',
        icon: 10,
        text: 'text-[8px]'
      };
    case 'md':
      return {
        container: 'w-8 h-8',
        icon: 14,
        text: 'text-[10px]'
      };
    case 'lg':
      return {
        container: 'w-10 h-10',
        icon: 18,
        text: 'text-xs'
      };
  }
};

// Tooltip component
const BadgeTooltip: React.FC<{
  badge: AchievementBadge;
  earned: EarnedBadge;
  children: React.ReactNode;
}> = ({ badge, earned, children }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const colors = getRarityColors(badge.rarity);

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {children}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className={`
            p-3 rounded-lg border-2 ${colors.border} bg-gray-900 shadow-xl
            min-w-[180px] max-w-[220px]
          `}>
            {/* Badge Name */}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{badge.icon}</span>
              <span className={`font-bold ${colors.text}`}>{badge.name}</span>
            </div>

            {/* Rarity */}
            <div className={`text-[10px] uppercase tracking-wide ${colors.text} opacity-70 mb-2`}>
              {badge.rarity}
            </div>

            {/* Description */}
            <p className="text-xs text-gray-300 mb-2">{badge.description}</p>

            {/* Reward (if any) */}
            {badge.reward && (
              <div className="text-[10px] text-green-400 pt-1 border-t border-gray-700">
                Belønning: {badge.reward.type === 'title' ? badge.reward.value : `+${badge.reward.value}`}
              </div>
            )}

            {/* Earned info */}
            <div className="text-[9px] text-gray-500 mt-2 pt-1 border-t border-gray-700">
              Opptjent: {new Date(earned.earnedDate).toLocaleDateString('nb-NO')}
              {earned.earnedByHeroName && (
                <span className="ml-1">av {earned.earnedByHeroName}</span>
              )}
            </div>
          </div>
          {/* Tooltip arrow */}
          <div className={`absolute left-1/2 -translate-x-1/2 top-full w-2 h-2 rotate-45 ${colors.bg} border-r border-b ${colors.border}`} />
        </div>
      )}
    </div>
  );
};

// Single badge component
const Badge: React.FC<{
  badge: AchievementBadge;
  earned: EarnedBadge;
  size: 'sm' | 'md' | 'lg';
  showTooltip: boolean;
}> = ({ badge, earned, size, showTooltip }) => {
  const colors = getRarityColors(badge.rarity);
  const sizeClass = getSizeClasses(size);

  const badgeContent = (
    <div
      className={`
        ${sizeClass.container} rounded-full border-2 ${colors.border}
        ${colors.bg} ${colors.glow}
        flex items-center justify-center cursor-help
        transition-transform hover:scale-110
      `}
      title={showTooltip ? undefined : badge.name}
    >
      <span className={sizeClass.text}>{badge.icon}</span>
    </div>
  );

  if (showTooltip) {
    return (
      <BadgeTooltip badge={badge} earned={earned}>
        {badgeContent}
      </BadgeTooltip>
    );
  }

  return badgeContent;
};

// "More badges" indicator
const MoreBadgesIndicator: React.FC<{
  count: number;
  size: 'sm' | 'md' | 'lg';
}> = ({ count, size }) => {
  const sizeClass = getSizeClasses(size);

  return (
    <div
      className={`
        ${sizeClass.container} rounded-full border-2 border-gray-600
        bg-gray-800 flex items-center justify-center
      `}
      title={`+${count} flere badges`}
    >
      <span className={`${sizeClass.text} text-gray-400 font-bold`}>+{count}</span>
    </div>
  );
};

const BadgeDisplay: React.FC<BadgeDisplayProps> = ({
  earnedBadges,
  maxDisplay = 5,
  size = 'md',
  showTooltip = true,
  className = ''
}) => {
  // Sort badges by rarity (legendary first) and date (newest first)
  const sortedBadges = [...earnedBadges].sort((a, b) => {
    const badgeA = getBadgeById(a.badgeId);
    const badgeB = getBadgeById(b.badgeId);
    if (!badgeA || !badgeB) return 0;

    const rarityOrder: Record<BadgeRarity, number> = {
      legendary: 0,
      gold: 1,
      silver: 2,
      bronze: 3
    };

    const rarityDiff = rarityOrder[badgeA.rarity] - rarityOrder[badgeB.rarity];
    if (rarityDiff !== 0) return rarityDiff;

    return new Date(b.earnedDate).getTime() - new Date(a.earnedDate).getTime();
  });

  // Split into visible and overflow
  const visibleBadges = sortedBadges.slice(0, maxDisplay);
  const overflowCount = Math.max(0, sortedBadges.length - maxDisplay);

  if (earnedBadges.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {visibleBadges.map(earned => {
        const badge = getBadgeById(earned.badgeId);
        if (!badge) return null;

        return (
          <Badge
            key={earned.badgeId}
            badge={badge}
            earned={earned}
            size={size}
            showTooltip={showTooltip}
          />
        );
      })}
      {overflowCount > 0 && (
        <MoreBadgesIndicator count={overflowCount} size={size} />
      )}
    </div>
  );
};

export default BadgeDisplay;

// Export individual components for flexible use
export { Badge, BadgeTooltip, MoreBadgesIndicator };
