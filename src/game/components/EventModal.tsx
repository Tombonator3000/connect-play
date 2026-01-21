import React from 'react';
import { EventCard } from '../types';
import { Skull, AlertTriangle, Zap, Heart, Brain, Eye, Cloud, Users, Shield, Sparkles } from 'lucide-react';

interface EventModalProps {
  event: EventCard;
  onResolve: () => void;
}

// Get icon based on effect type
const getEffectIcon = (effectType: string) => {
  switch (effectType) {
    case 'sanity':
    case 'all_sanity':
      return <Brain className="text-purple-400" size={20} />;
    case 'health':
    case 'all_health':
      return <Heart className="text-red-400" size={20} />;
    case 'spawn':
      return <Skull className="text-red-500" size={20} />;
    case 'insight':
      return <Eye className="text-blue-400" size={20} />;
    case 'doom':
      return <AlertTriangle className="text-yellow-500" size={20} />;
    case 'weather':
      return <Cloud className="text-gray-400" size={20} />;
    case 'buff_enemies':
      return <Users className="text-red-400" size={20} />;
    case 'debuff_player':
      return <Shield className="text-gray-500" size={20} />;
    case 'item':
      return <Sparkles className="text-yellow-400" size={20} />;
    default:
      return <Zap className="text-[#e94560]" size={20} />;
  }
};

// Get effect description for display
const getEffectDescription = (event: EventCard): string => {
  const { effectType, value, spawnType, weatherType } = event;

  switch (effectType) {
    case 'sanity':
      return value > 0 ? `+${value} Sanity` : `${value} Sanity`;
    case 'all_sanity':
      return value > 0 ? `All: +${value} Sanity` : `All: ${value} Sanity`;
    case 'health':
      return value > 0 ? `+${value} HP` : `${value} HP`;
    case 'all_health':
      return value > 0 ? `All: +${value} HP` : `All: ${value} HP`;
    case 'spawn':
      return `${Math.abs(value)} ${spawnType || 'enemy'} appears!`;
    case 'insight':
      return `+${value} Insight`;
    case 'doom':
      return value > 0 ? `Doom +${value}` : `Doom ${value}`;
    case 'weather':
      return `${(weatherType || 'weather').replace('_', ' ')} (${Math.abs(value)} rounds)`;
    case 'buff_enemies':
      return `Enemies +${value} attack`;
    case 'debuff_player':
      return `Weakened`;
    case 'item':
      return `Found supplies!`;
    default:
      return `Effect: ${effectType}`;
  }
};

// Get background gradient based on event severity
const getBackgroundGradient = (event: EventCard): string => {
  const { effectType, value } = event;

  // Positive events
  if (
    (effectType === 'sanity' && value > 0) ||
    (effectType === 'health' && value > 0) ||
    (effectType === 'insight' && value > 0) ||
    (effectType === 'doom' && value > 0) ||
    effectType === 'item'
  ) {
    return 'linear-gradient(135deg, #1a2e1a 0%, #16213e 50%, #0f1f0f 100%)';
  }

  // Spawn events (danger)
  if (effectType === 'spawn') {
    return 'linear-gradient(135deg, #2e1a1a 0%, #3e1616 50%, #1f0f0f 100%)';
  }

  // Weather events (neutral)
  if (effectType === 'weather') {
    return 'linear-gradient(135deg, #1a1a2e 0%, #162e3e 50%, #0f0f1f 100%)';
  }

  // Default (negative)
  return 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f1a 100%)';
};

const EventModal: React.FC<EventModalProps> = ({ event, onResolve }) => {
  const hasSkillCheck = !!event.skillCheck;
  const hasSecondaryEffect = !!event.secondaryEffect;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6 backdrop-blur-md">
      <div className="bg-[#16213e] border-2 border-[#e94560] rounded-lg max-w-md w-full shadow-[0_0_50px_rgba(233,69,96,0.3)] animate-in slide-in-from-bottom-8 duration-500">
        {/* Header */}
        <div className="bg-[#1a1a2e] p-4 flex items-center justify-between border-b border-[#e94560]/30">
          <h3 className="text-[#e94560] font-display text-2xl italic">{event.title}</h3>
          {getEffectIcon(event.effectType)}
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          {/* Atmospheric background */}
          <div
            className="mb-6 h-28 w-full rounded border border-slate-700 opacity-70 flex items-center justify-center"
            style={{ background: getBackgroundGradient(event) }}
          >
            <div className="text-6xl opacity-30">
              {event.effectType === 'spawn' && '👁️'}
              {event.effectType === 'sanity' && (event.value < 0 ? '🌀' : '✨')}
              {event.effectType === 'health' && (event.value < 0 ? '💀' : '❤️')}
              {event.effectType === 'doom' && '⏳'}
              {event.effectType === 'weather' && '🌫️'}
              {event.effectType === 'insight' && '📖'}
              {event.effectType === 'all_sanity' && '😱'}
              {event.effectType === 'item' && '🎁'}
              {event.effectType === 'buff_enemies' && '👹'}
            </div>
          </div>

          {/* Description */}
          <p className="text-lg text-slate-200 italic mb-4 font-serif leading-relaxed">
            "{event.description}"
          </p>

          {/* Flavor text */}
          {event.flavorText && (
            <p className="text-sm text-slate-400 italic mb-4 opacity-75">
              — {event.flavorText}
            </p>
          )}

          {/* Skill check warning */}
          {hasSkillCheck && (
            <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-600/50 rounded text-sm text-yellow-200">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Shield size={16} />
                <span className="font-bold uppercase tracking-wider">Skill Check Available</span>
              </div>
              <p className="text-yellow-300/80">
                {event.skillCheck!.attribute.charAt(0).toUpperCase() + event.skillCheck!.attribute.slice(1)} DC {event.skillCheck!.dc}
              </p>
            </div>
          )}

          {/* Primary effect */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/40 rounded-full border border-slate-700 text-sm font-bold uppercase tracking-widest text-[#e94560]">
            {getEffectIcon(event.effectType)}
            {getEffectDescription(event)}
          </div>

          {/* Secondary effect */}
          {hasSecondaryEffect && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-black/30 rounded-full border border-slate-600 text-xs font-bold uppercase tracking-wider text-slate-400">
              {getEffectIcon(event.secondaryEffect!.type)}
              {event.secondaryEffect!.value > 0 ? '+' : ''}{event.secondaryEffect!.value} {event.secondaryEffect!.type.replace('_', ' ')}
            </div>
          )}

          {/* Doom threshold indicator */}
          {event.doomThreshold !== undefined && (
            <p className="mt-4 text-xs text-red-400/70 italic">
              Only triggers when Doom ≤ {event.doomThreshold}
            </p>
          )}
        </div>

        {/* Action button */}
        <div className="p-4 bg-[#1a1a2e] flex justify-center border-t border-slate-800">
          <button
            onClick={onResolve}
            className="w-full py-3 bg-[#e94560] hover:bg-[#c9354d] text-white font-bold rounded uppercase tracking-widest transition-colors shadow-lg hover:shadow-[0_0_20px_rgba(233,69,96,0.4)]"
          >
            {hasSkillCheck ? 'Face the Challenge...' : 'I must face this...'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
