import React from 'react';
import { EventCard } from '../types';
import { Skull, AlertTriangle, Zap, Heart, Brain, Eye, Cloud, Users, Shield, Sparkles } from 'lucide-react';
import { getEventImage } from '../utils/eventAssets';

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
      return <Heart className="text-primary" size={20} />;
    case 'spawn':
      return <Skull className="text-primary" size={20} />;
    case 'insight':
      return <Eye className="text-accent" size={20} />;
    case 'doom':
      return <AlertTriangle className="text-gold" size={20} />;
    case 'weather':
      return <Cloud className="text-muted-foreground" size={20} />;
    case 'buff_enemies':
      return <Users className="text-primary" size={20} />;
    case 'debuff_player':
      return <Shield className="text-muted-foreground" size={20} />;
    case 'item':
      return <Sparkles className="text-gold" size={20} />;
    default:
      return <Zap className="text-primary" size={20} />;
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

const EventModal: React.FC<EventModalProps> = ({ event, onResolve }) => {
  const hasSkillCheck = !!event.skillCheck;
  const hasSecondaryEffect = !!event.secondaryEffect;
  const eventImage = getEventImage(event.effectType);

  return (
    <div className="fixed inset-0 bg-background/80 z-50 flex items-center justify-center p-6 backdrop-blur-md">
      <div className="bg-card border-2 border-primary rounded-lg max-w-md w-full shadow-[0_0_50px_hsl(var(--primary)/0.3)] animate-in slide-in-from-bottom-8 duration-500">
        {/* Header */}
        <div className="bg-muted p-4 flex items-center justify-between border-b border-primary/30">
          <h3 className="text-primary font-display text-2xl italic">{event.title}</h3>
          {getEffectIcon(event.effectType)}
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          {/* Atmospheric event image */}
          <div className="mb-6 h-40 w-full rounded overflow-hidden border border-border">
            <img
              src={eventImage}
              alt={event.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback if image fails to load
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>

          {/* Description */}
          <p className="text-lg text-foreground/90 italic mb-4 font-serif leading-relaxed">
            "{event.description}"
          </p>

          {/* Flavor text */}
          {event.flavorText && (
            <p className="text-sm text-muted-foreground italic mb-4 opacity-75">
              — {event.flavorText}
            </p>
          )}

          {/* Skill check warning */}
          {hasSkillCheck && (
            <div className="mb-4 p-3 bg-gold/20 border border-gold/50 rounded text-sm text-gold">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Shield size={16} />
                <span className="font-bold uppercase tracking-wider">Skill Check Available</span>
              </div>
              <p className="text-gold/80">
                {event.skillCheck!.attribute.charAt(0).toUpperCase() + event.skillCheck!.attribute.slice(1)} DC {event.skillCheck!.dc}
              </p>
            </div>
          )}

          {/* Primary effect */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-full border border-border text-sm font-bold uppercase tracking-widest text-primary">
            {getEffectIcon(event.effectType)}
            {getEffectDescription(event)}
          </div>

          {/* Secondary effect */}
          {hasSecondaryEffect && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-muted/50 rounded-full border border-border text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {getEffectIcon(event.secondaryEffect!.type)}
              {event.secondaryEffect!.value > 0 ? '+' : ''}{event.secondaryEffect!.value} {event.secondaryEffect!.type.replace('_', ' ')}
            </div>
          )}

          {/* Doom threshold indicator */}
          {event.doomThreshold !== undefined && (
            <p className="mt-4 text-xs text-primary/70 italic">
              Only triggers when Doom ≤ {event.doomThreshold}
            </p>
          )}
        </div>

        {/* Action button */}
        <div className="p-4 bg-muted flex justify-center border-t border-border">
          <button
            onClick={onResolve}
            className="w-full py-3 bg-primary hover:bg-primary/80 text-primary-foreground font-bold rounded uppercase tracking-widest transition-colors shadow-lg hover:shadow-[0_0_20px_hsl(var(--primary)/0.4)]"
          >
            {hasSkillCheck ? 'Face the Challenge...' : 'I must face this...'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
