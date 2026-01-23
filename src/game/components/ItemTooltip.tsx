import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Item, Spell, Enemy, EnemyType, TileObject, TileObjectType, EdgeData, DoorState, EdgeBlockingType } from '../types';
import { BESTIARY } from '../constants';
import {
  Sword, Search, Zap, ShieldCheck, Cross, FileQuestion, Eye, Skull, Brain, Swords, BookOpen,
  Flame, Lock, Hammer, AlertTriangle, Fence, Cloud, Sparkles, Package, Moon, Radio, ToggleLeft,
  DoorOpen, DoorClosed, KeyRound, Ban, ArrowUpRight, ArrowDownRight, Square, Minus, Info,
  Target, Crosshair, Shield, Box
} from 'lucide-react';
import { getItemIcon as getSpecificItemIcon } from './ItemIcons';
import { useIsMobile } from '@/hooks/use-mobile';

interface ItemTooltipProps {
  item: Item;
  children: React.ReactNode;
  isRestricted?: boolean;  // Whether this weapon is restricted for the current character
  compareWith?: Item | null;  // Item to compare against (e.g., currently equipped weapon)
}

export const ItemTooltip: React.FC<ItemTooltipProps> = ({ item, children, isRestricted = false, compareWith }) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'weapon': return 'text-red-400';
      case 'tool': return 'text-green-400';
      case 'relic': return 'text-purple-400';
      case 'armor': return 'text-blue-400';
      case 'consumable': return 'text-yellow-400';
      default: return 'text-muted-foreground';
    }
  };

  const getTypeIcon = (type: string, itemId?: string) => {
    // Try specific item icon first
    if (itemId) {
      const SpecificIcon = getSpecificItemIcon(itemId);
      if (SpecificIcon) {
        return <SpecificIcon size={16} />;
      }
    }
    // Fall back to generic type icons
    switch (type) {
      case 'weapon': return <Sword size={12} />;
      case 'tool': return <Search size={12} />;
      case 'relic': return <Zap size={12} />;
      case 'armor': return <ShieldCheck size={12} />;
      case 'consumable': return <Cross size={12} />;
      default: return <FileQuestion size={12} />;
    }
  };

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="max-w-64 bg-secondary border-2 border-primary/50 p-0 shadow-[var(--shadow-doom)]"
        >
          <div className="bg-primary/20 px-3 py-2 border-b border-primary/30">
            <div className="flex items-center gap-2">
              <span className={getTypeColor(item.type)}>{getTypeIcon(item.type, item.id)}</span>
              <span className="font-bold text-sm text-foreground">{item.name}</span>
            </div>
            <div className={`text-[10px] uppercase tracking-wider ${getTypeColor(item.type)}`}>
              {item.type}
            </div>
          </div>
          <div className="p-3 space-y-2">
            {/* Weapon restriction warning */}
            {isRestricted && (
              <div className="flex items-center gap-2 bg-red-500/20 text-red-400 px-2 py-1 rounded border border-red-500/30 mb-2">
                <Ban size={14} />
                <span className="text-xs font-bold">RESTRICTED - Behandles som unarmed</span>
              </div>
            )}
            {item.effect && (
              <p className="text-xs text-muted-foreground italic">{item.effect}</p>
            )}

            {/* Weapon stats - enhanced display */}
            {item.type === 'weapon' && (
              <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                {item.attackDice !== undefined && (
                  <div className="flex items-center gap-1.5 bg-red-500/20 text-red-400 px-2 py-1 rounded border border-red-500/30">
                    <Swords size={12} />
                    <span className="font-bold">{item.attackDice}</span>
                    <span className="opacity-70">dice</span>
                    {compareWith?.attackDice !== undefined && item.attackDice !== compareWith.attackDice && (
                      <span className={item.attackDice > compareWith.attackDice ? 'text-green-400 font-bold' : 'text-red-300 font-bold'}>
                        ({item.attackDice > compareWith.attackDice ? '+' : ''}{item.attackDice - compareWith.attackDice})
                      </span>
                    )}
                  </div>
                )}
                {item.range !== undefined && (
                  <div className="flex items-center gap-1.5 bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded border border-cyan-500/30">
                    <Target size={12} />
                    <span className="font-bold">{item.range}</span>
                    <span className="opacity-70">range</span>
                    {compareWith?.range !== undefined && item.range !== compareWith.range && (
                      <span className={item.range > compareWith.range ? 'text-green-400 font-bold' : 'text-red-300 font-bold'}>
                        ({item.range > compareWith.range ? '+' : ''}{item.range - compareWith.range})
                      </span>
                    )}
                  </div>
                )}
                {item.ammo !== undefined && (
                  <div className="flex items-center gap-1.5 bg-amber-500/20 text-amber-400 px-2 py-1 rounded border border-amber-500/30">
                    <Crosshair size={12} />
                    <span className="font-bold">{item.ammo}</span>
                    <span className="opacity-70">ammo</span>
                  </div>
                )}
                {item.weaponType && (
                  <div className="flex items-center gap-1.5 bg-gray-500/20 text-gray-400 px-2 py-1 rounded border border-gray-500/30">
                    {item.weaponType === 'melee' ? <Sword size={12} /> : <Crosshair size={12} />}
                    <span className="capitalize">{item.weaponType}</span>
                  </div>
                )}
              </div>
            )}

            {/* Armor stats */}
            {item.type === 'armor' && item.defenseDice !== undefined && (
              <div className="flex items-center gap-1.5 bg-blue-500/20 text-blue-400 px-2 py-1 rounded border border-blue-500/30 text-[10px]">
                <Shield size={12} />
                <span className="font-bold">+{item.defenseDice}</span>
                <span className="opacity-70">defense dice</span>
                {compareWith?.defenseDice !== undefined && item.defenseDice !== compareWith.defenseDice && (
                  <span className={item.defenseDice > compareWith.defenseDice ? 'text-green-400 font-bold' : 'text-red-300 font-bold'}>
                    ({item.defenseDice > compareWith.defenseDice ? '+' : ''}{item.defenseDice - compareWith.defenseDice})
                  </span>
                )}
              </div>
            )}

            {/* Consumable uses */}
            {item.type === 'consumable' && item.uses !== undefined && (
              <div className="flex items-center gap-1.5 bg-green-500/20 text-green-400 px-2 py-1 rounded border border-green-500/30 text-[10px]">
                <Box size={12} />
                <span className="font-bold">{item.uses}</span>
                <span className="opacity-70">/ {item.maxUses || item.uses} uses</span>
              </div>
            )}

            {/* Other stats */}
            <div className="flex flex-wrap gap-2 text-[10px]">
              {item.bonus !== undefined && item.bonus !== 0 && (
                <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded border border-green-500/30">
                  +{item.bonus} Bonus
                </span>
              )}
              {item.cost !== undefined && (
                <span className="bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded border border-yellow-500/30">
                  Cost: {item.cost} AP
                </span>
              )}
              {item.statModifier && (
                <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30">
                  +{item.statModifier}
                </span>
              )}
              {item.silent && (
                <span className="bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded border border-purple-500/30">
                  Silent
                </span>
              )}
              {item.isLightSource && (
                <span className="bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded border border-yellow-500/30">
                  Light Source
                </span>
              )}
            </div>

            {/* Comparison indicator */}
            {compareWith && (
              <div className="mt-2 pt-2 border-t border-white/10 text-[9px] text-muted-foreground">
                Sammenlignet med: {compareWith.name}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

interface SpellTooltipProps {
  spell: Spell;
  children: React.ReactNode;
}

export const SpellTooltip: React.FC<SpellTooltipProps> = ({ spell, children }) => {
  const getEffectColor = (effectType: string) => {
    switch (effectType) {
      case 'damage': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'heal': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'sanity': return 'text-purple-400 bg-purple-500/20 border-purple-500/30';
      case 'buff': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'debuff': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      default: return 'text-muted-foreground bg-muted/20 border-muted/30';
    }
  };

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="max-w-64 bg-secondary border-2 border-sanity/50 p-0 shadow-[0_0_20px_hsla(280,60%,55%,0.3)]"
        >
          <div className="bg-sanity/20 px-3 py-2 border-b border-sanity/30">
            <div className="flex items-center justify-between gap-3">
              <span className="font-bold text-sm text-foreground">{spell.name}</span>
              <span className="flex items-center gap-1 text-insight text-xs font-bold bg-background/40 px-2 py-0.5 rounded border border-insight/30">
                <Eye size={10} /> {spell.cost}
              </span>
            </div>
          </div>
          <div className="p-3 space-y-2">
            <p className="text-xs text-muted-foreground italic">{spell.description}</p>
            <div className="flex flex-wrap gap-2 text-[10px]">
              <span className={`px-2 py-0.5 rounded border ${getEffectColor(spell.effectType)}`}>
                {spell.effectType}: {spell.value}
              </span>
              {spell.range && (
                <span className="bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/30">
                  Range: {spell.range}
                </span>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

interface EnemyTooltipProps {
  enemy: Enemy;
  children: React.ReactNode;
}

export const EnemyTooltip: React.FC<EnemyTooltipProps> = ({ enemy, children }) => {
  const info = BESTIARY[enemy.type];
  const isMobile = useIsMobile();

  // On mobile, don't show tooltips - prevents "free" information gathering via touch
  if (isMobile) {
    return <>{children}</>;
  }

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="max-w-72 bg-red-950/95 border-2 border-primary/50 p-0 shadow-[var(--shadow-doom)]"
        >
          <div className="bg-red-900/30 px-3 py-2 border-b border-primary/30">
            <div className="flex items-center gap-2">
              <Skull size={14} className="text-primary" />
              <span className="font-bold text-sm text-foreground uppercase tracking-wide">{enemy.name}</span>
            </div>
            <div className="text-[10px] text-primary/80 uppercase tracking-wider">
              {enemy.type.replace('_', ' ')}
            </div>
          </div>
          <div className="p-3 space-y-3">
            <div className="flex gap-3">
              <div className="flex items-center gap-1.5 bg-background/30 px-2 py-1 rounded border border-red-900/30">
                <Swords size={12} className="text-primary" />
                <span className="text-xs font-bold text-foreground">{enemy.damage}</span>
                <span className="text-[9px] text-muted-foreground">DMG</span>
              </div>
              <div className="flex items-center gap-1.5 bg-background/30 px-2 py-1 rounded border border-secondary/30">
                <Brain size={12} className="text-sanity" />
                <span className="text-xs font-bold text-foreground">{enemy.horror}</span>
                <span className="text-[9px] text-muted-foreground">HOR</span>
              </div>
            </div>
            
            {enemy.traits && enemy.traits.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {enemy.traits.map(trait => (
                  <span key={trait} className="px-1.5 py-0.5 bg-red-900/30 text-red-300 text-[9px] font-bold uppercase rounded border border-red-800/50">
                    {trait}
                  </span>
                ))}
              </div>
            )}
            
            {info && (
              <div className="pt-2 border-t border-primary/20">
                <div className="flex items-center gap-1 text-[9px] text-primary uppercase tracking-wider mb-1">
                  <BookOpen size={10} />
                  <span>Lore</span>
                </div>
                <p className="text-[11px] text-muted-foreground italic leading-relaxed line-clamp-3">
                  "{info.description}"
                </p>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// ============================================================================
// TILE OBJECT TOOLTIP - For objects on hex tiles
// ============================================================================

// Object information database with Lovecraftian descriptions
const TILE_OBJECT_INFO: Record<TileObjectType, {
  name: string;
  description: string;
  interaction?: string;
  icon: React.ComponentType<{ size?: string | number; className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  fire: {
    name: 'Brann',
    description: 'Flammene danser med en nesten bevisst intensitet. Varmen er uutholdelig.',
    interaction: 'Kan hoppes over (Agility DC 4, tar 1 skade) eller slukkes med brannslukker.',
    icon: Flame,
    color: 'text-orange-400',
    bgColor: 'bg-orange-950/95',
    borderColor: 'border-orange-500/50'
  },
  locked_door: {
    name: 'Låst dør',
    description: 'En solid dør med en gammel lås. Noen ville ikke at du skulle komme inn.',
    interaction: 'Bruk nøkkel, dirk (Agility DC 4), eller bryt opp (Strength DC 5).',
    icon: Lock,
    color: 'text-amber-400',
    bgColor: 'bg-amber-950/95',
    borderColor: 'border-amber-500/50'
  },
  rubble: {
    name: 'Ruiner',
    description: 'Sammenraste murstein og tømmer blokkerer veien. Noe har forårsaket dette.',
    interaction: 'Rydd vekk (Strength DC 4, 2 AP).',
    icon: Hammer,
    color: 'text-stone-400',
    bgColor: 'bg-stone-900/95',
    borderColor: 'border-stone-500/50'
  },
  trap: {
    name: 'Felle',
    description: 'En mekanisme skjult i skyggen. Noen forventet ubudne gjester.',
    interaction: 'Deaktiver (Agility DC 4) eller utløs (tar skade).',
    icon: AlertTriangle,
    color: 'text-red-400',
    bgColor: 'bg-red-950/95',
    borderColor: 'border-red-500/50'
  },
  gate: {
    name: 'Port',
    description: 'Jernstenger som har stått her i generasjoner. Rusten forteller historier.',
    interaction: 'Åpne eller lås opp avhengig av tilstand.',
    icon: Fence,
    color: 'text-gray-400',
    bgColor: 'bg-gray-900/95',
    borderColor: 'border-gray-500/50'
  },
  fog_wall: {
    name: 'Tåkevegg',
    description: 'Unaturlig tåke som ikke beveger seg med vinden. Den virker... bevisst.',
    interaction: 'Krever spesiell gjenstand eller ritual for å passere.',
    icon: Cloud,
    color: 'text-purple-400',
    bgColor: 'bg-purple-950/95',
    borderColor: 'border-purple-500/50'
  },
  altar: {
    name: 'Alter',
    description: 'Et gammelt alter flekkete av år med ritualer. Luften vibrerer rundt det.',
    interaction: 'Undersøk for ledetråder eller utfør ritualer (Occultist).',
    icon: Sparkles,
    color: 'text-purple-400',
    bgColor: 'bg-purple-950/95',
    borderColor: 'border-purple-500/50'
  },
  bookshelf: {
    name: 'Bokhylle',
    description: 'Støvete bøker på ukjente språk. Noen av titlene får deg til å føle deg uvel.',
    interaction: 'Søk etter ledetråder eller okkulte tekster (+1 Insight, -1 Sanity).',
    icon: BookOpen,
    color: 'text-amber-600',
    bgColor: 'bg-amber-950/95',
    borderColor: 'border-amber-600/50'
  },
  crate: {
    name: 'Kasse',
    description: 'En gammel trekasse. Innholdet er ukjent.',
    interaction: 'Søk (1 AP) for å finne gjenstander.',
    icon: Package,
    color: 'text-amber-500',
    bgColor: 'bg-amber-950/95',
    borderColor: 'border-amber-500/50'
  },
  chest: {
    name: 'Kiste',
    description: 'En gammel kiste. Kanskje låst, kanskje ikke.',
    interaction: 'Søk (1 AP) for å finne gjenstander. Kan være låst.',
    icon: Package,
    color: 'text-amber-500',
    bgColor: 'bg-amber-950/95',
    borderColor: 'border-amber-500/50'
  },
  cabinet: {
    name: 'Skap',
    description: 'Et mørkt skap. Dørene står på gløtt.',
    interaction: 'Søk (1 AP) for å finne gjenstander.',
    icon: Package,
    color: 'text-amber-500',
    bgColor: 'bg-amber-950/95',
    borderColor: 'border-amber-500/50'
  },
  barricade: {
    name: 'Barrikade',
    description: 'Planker og møbler stablet i hast. Noen prøvde å holde noe ute.',
    interaction: 'Bryt ned (Strength DC 4, 2 AP). Lager støy!',
    icon: Hammer,
    color: 'text-amber-700',
    bgColor: 'bg-amber-950/95',
    borderColor: 'border-amber-700/50'
  },
  mirror: {
    name: 'Speil',
    description: 'Et gammelt speil. Refleksjonen din virker... forsinket.',
    interaction: 'Undersøk forsiktig. Kan avsløre skjulte ting.',
    icon: Moon,
    color: 'text-slate-300',
    bgColor: 'bg-slate-900/95',
    borderColor: 'border-slate-400/50'
  },
  radio: {
    name: 'Radio',
    description: 'En knitrende radio. Stemmer fra... hvor?',
    interaction: 'Lytt for informasjon eller kontakt.',
    icon: Radio,
    color: 'text-green-500',
    bgColor: 'bg-green-950/95',
    borderColor: 'border-green-500/50'
  },
  switch: {
    name: 'Bryter',
    description: 'En mekanisk bryter. Hva styrer den?',
    interaction: 'Aktiver for å utløse mekanisme.',
    icon: ToggleLeft,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-950/95',
    borderColor: 'border-yellow-500/50'
  },
  statue: {
    name: 'Statue',
    description: 'En forvitret statue. Ansiktet er fortært av tid, men øynene ser ut til å følge deg.',
    interaction: 'Undersøk for skjulte rom eller mekanismer.',
    icon: Skull,
    color: 'text-stone-400',
    bgColor: 'bg-stone-900/95',
    borderColor: 'border-stone-500/50'
  },
  exit_door: {
    name: 'Utgangsdør',
    description: 'Veien ut. Friheten venter på den andre siden.',
    interaction: 'Gå gjennom for å rømme (må ha nødvendige gjenstander).',
    icon: DoorOpen,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-950/95',
    borderColor: 'border-emerald-500/50'
  },
  eldritch_portal: {
    name: 'Eldritch Portal',
    description: 'Et gapende hull i virkeligheten. Lilla lys pulserer fra den andre siden, og noe stirrer tilbake.',
    interaction: 'Fiender spawner her i Mythos-fasen. Kan forsegles med Elder Signs eller ritualer.',
    icon: Zap,
    color: 'text-purple-400',
    bgColor: 'bg-purple-950/95',
    borderColor: 'border-purple-500/50'
  }
};

interface TileObjectTooltipProps {
  object: TileObject;
  children: React.ReactNode;
}

export const TileObjectTooltip: React.FC<TileObjectTooltipProps> = ({ object, children }) => {
  const info = TILE_OBJECT_INFO[object.type];
  const isMobile = useIsMobile();

  if (!info) return <>{children}</>;

  // On mobile, don't show tooltips - prevents "free" information gathering via touch
  // Player must investigate the tile to learn what's there
  if (isMobile) {
    return <>{children}</>;
  }

  const IconComponent = info.icon;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className={`max-w-72 ${info.bgColor} border-2 ${info.borderColor} p-0 shadow-[var(--shadow-doom)]`}
        >
          <div className={`${info.bgColor} px-3 py-2 border-b ${info.borderColor.replace('border-', 'border-')}/30`}>
            <div className="flex items-center gap-2">
              <IconComponent size={14} className={info.color} />
              <span className="font-bold text-sm text-foreground uppercase tracking-wide">{info.name}</span>
            </div>
            {object.blocking && (
              <div className="text-[10px] text-red-400 uppercase tracking-wider mt-0.5">
                Blokkerer passasje
              </div>
            )}
            {object.searched && (
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
                Allerede undersøkt
              </div>
            )}
          </div>
          <div className="p-3 space-y-2">
            <p className="text-[11px] text-muted-foreground italic leading-relaxed">
              "{info.description}"
            </p>
            {info.interaction && (
              <div className="pt-2 border-t border-white/10">
                <div className="flex items-center gap-1 text-[9px] text-amber-400 uppercase tracking-wider mb-1">
                  <Info size={10} />
                  <span>Handling</span>
                </div>
                <p className="text-[10px] text-foreground/80">
                  {info.interaction}
                </p>
              </div>
            )}
            {object.difficulty && (
              <div className="flex gap-2 text-[10px]">
                <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded border border-red-500/30">
                  DC {object.difficulty}
                </span>
                {object.reqSkill && (
                  <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30">
                    {object.reqSkill.charAt(0).toUpperCase() + object.reqSkill.slice(1)}
                  </span>
                )}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// ============================================================================
// EDGE FEATURE TOOLTIP - For edges on hex tiles (doors, stairs, etc.)
// ============================================================================

// Door state information
const DOOR_STATE_INFO: Record<DoorState, {
  name: string;
  description: string;
  interaction: string;
  color: string;
}> = {
  open: {
    name: 'Åpen dør',
    description: 'Døren står åpen. Hva som åpnet den er uvisst.',
    interaction: 'Fri passasje.',
    color: 'text-green-400'
  },
  closed: {
    name: 'Lukket dør',
    description: 'En lukket dør. Hvem vet hva som venter på andre siden.',
    interaction: 'Åpne (1 AP) for å passere.',
    color: 'text-gray-400'
  },
  locked: {
    name: 'Låst dør',
    description: 'Solid låst. Noen ville ikke at du skulle komme inn.',
    interaction: 'Bruk nøkkel, dirk (Agility DC 4), eller bryt opp (Strength DC 5).',
    color: 'text-amber-400'
  },
  barricaded: {
    name: 'Barrikadert dør',
    description: 'Blokkert fra innsiden. Noen prøvde desperat å holde noe ute.',
    interaction: 'Bryt ned (Strength DC 4, 2 AP). Lager støy!',
    color: 'text-amber-600'
  },
  broken: {
    name: 'Knust dør',
    description: 'Døren er ødelagt. Noe kom seg gjennom.',
    interaction: 'Fri passasje. Gir ingen dekning.',
    color: 'text-red-400'
  },
  sealed: {
    name: 'Forseglet dør',
    description: 'Glødende symboler holder døren lukket. Ikke av denne verden.',
    interaction: 'Occult check (Willpower DC 5) eller bruk Elder Sign.',
    color: 'text-purple-400'
  },
  puzzle: {
    name: 'Puzzle-dør',
    description: 'Mystiske symboler dekker overflaten. En gåte må løses.',
    interaction: 'Løs puslespillet for å åpne.',
    color: 'text-cyan-400'
  }
};

// Edge blocking type information
const EDGE_BLOCKING_INFO: Record<EdgeBlockingType, {
  name: string;
  description: string;
  interaction: string;
  color: string;
}> = {
  rubble: {
    name: 'Ruiner',
    description: 'Sammenraste murstein blokkerer passasjen.',
    interaction: 'Rydd (Strength DC 4, 2 AP).',
    color: 'text-stone-400'
  },
  heavy_rubble: {
    name: 'Tung ruiner',
    description: 'Massive steinblokker. Nesten umulig å flytte.',
    interaction: 'Rydd (Strength DC 5, 3 AP).',
    color: 'text-stone-500'
  },
  collapsed: {
    name: 'Kollapset',
    description: 'Fullstendig sammenrast. Ingen vei gjennom.',
    interaction: 'Kan ikke passeres.',
    color: 'text-gray-500'
  },
  fire: {
    name: 'Brann',
    description: 'Flammer blokkerer veien. Varmen er intens.',
    interaction: 'Hopp over (Agility DC 4, tar 1 skade) eller slukk.',
    color: 'text-orange-400'
  },
  barricade: {
    name: 'Barrikade',
    description: 'Provisorisk sperring av møbler og planker.',
    interaction: 'Bryt ned (Strength DC 4).',
    color: 'text-amber-600'
  },
  locked_gate: {
    name: 'Låst port',
    description: 'Jernstenger holder deg ute. Eller holder noe inne.',
    interaction: 'Lås opp eller tving åpen (Strength DC 5).',
    color: 'text-gray-400'
  },
  spirit_barrier: {
    name: 'Åndesperre',
    description: 'Gjennomskinnelige skikkelser blokkerer veien.',
    interaction: 'Elder Sign eller Willpower DC 5. -1 Sanity per forsøk.',
    color: 'text-purple-400'
  },
  ward: {
    name: 'Magisk vern',
    description: 'Glødende runer i luften. Eldgammel beskyttelse.',
    interaction: 'Dispel (Willpower DC 5) eller kryss (-1 Sanity).',
    color: 'text-blue-400'
  },
  chasm: {
    name: 'Avgrunn',
    description: 'Et dypt gap. Bunnen er ikke synlig.',
    interaction: 'Kan ikke krysses uten spesialutstyr.',
    color: 'text-gray-600'
  },
  flooded: {
    name: 'Oversvømt',
    description: 'Vann fyller passasjen. Mørkt og kaldt.',
    interaction: 'Vad gjennom (+1 AP). Kan skjule farer.',
    color: 'text-blue-500'
  }
};

interface EdgeFeatureTooltipProps {
  edge: EdgeData;
  children: React.ReactNode;
}

export const EdgeFeatureTooltip: React.FC<EdgeFeatureTooltipProps> = ({ edge, children }) => {
  const isMobile = useIsMobile();

  // On mobile, don't show tooltips - prevents "free" information gathering via touch
  if (isMobile) {
    return <>{children}</>;
  }

  // Determine what type of feature this edge has
  const edgeType = edge.type?.toLowerCase();

  // Handle doors
  if (edgeType === 'door' && edge.doorState) {
    const doorInfo = DOOR_STATE_INFO[edge.doorState];
    if (!doorInfo) return <>{children}</>;

    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            {children}
          </TooltipTrigger>
          <TooltipContent
            side="top"
            className="max-w-64 bg-secondary border-2 border-amber-500/50 p-0 shadow-[var(--shadow-doom)]"
          >
            <div className="bg-amber-900/30 px-3 py-2 border-b border-amber-500/30">
              <div className="flex items-center gap-2">
                {edge.doorState === 'open' || edge.doorState === 'broken' ? (
                  <DoorOpen size={14} className={doorInfo.color} />
                ) : edge.doorState === 'locked' || edge.doorState === 'sealed' ? (
                  <Lock size={14} className={doorInfo.color} />
                ) : (
                  <DoorClosed size={14} className={doorInfo.color} />
                )}
                <span className="font-bold text-sm text-foreground uppercase tracking-wide">{doorInfo.name}</span>
              </div>
              {edge.lockType && (
                <div className="text-[10px] text-amber-400 uppercase tracking-wider mt-0.5">
                  {edge.lockType} lås
                </div>
              )}
            </div>
            <div className="p-3 space-y-2">
              <p className="text-[11px] text-muted-foreground italic leading-relaxed">
                "{doorInfo.description}"
              </p>
              <div className="pt-2 border-t border-white/10">
                <div className="flex items-center gap-1 text-[9px] text-amber-400 uppercase tracking-wider mb-1">
                  <Info size={10} />
                  <span>Handling</span>
                </div>
                <p className="text-[10px] text-foreground/80">
                  {doorInfo.interaction}
                </p>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Handle blocked edges
  if (edgeType === 'blocked' && edge.blockingType) {
    const blockInfo = EDGE_BLOCKING_INFO[edge.blockingType];
    if (!blockInfo) return <>{children}</>;

    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            {children}
          </TooltipTrigger>
          <TooltipContent
            side="top"
            className="max-w-64 bg-secondary border-2 border-red-500/50 p-0 shadow-[var(--shadow-doom)]"
          >
            <div className="bg-red-900/30 px-3 py-2 border-b border-red-500/30">
              <div className="flex items-center gap-2">
                <Ban size={14} className={blockInfo.color} />
                <span className="font-bold text-sm text-foreground uppercase tracking-wide">{blockInfo.name}</span>
              </div>
              <div className="text-[10px] text-red-400 uppercase tracking-wider mt-0.5">
                Blokkert passasje
              </div>
            </div>
            <div className="p-3 space-y-2">
              <p className="text-[11px] text-muted-foreground italic leading-relaxed">
                "{blockInfo.description}"
              </p>
              <div className="pt-2 border-t border-white/10">
                <div className="flex items-center gap-1 text-[9px] text-amber-400 uppercase tracking-wider mb-1">
                  <Info size={10} />
                  <span>Handling</span>
                </div>
                <p className="text-[10px] text-foreground/80">
                  {blockInfo.interaction}
                </p>
              </div>
              {edge.blockingDC && (
                <div className="flex gap-2 text-[10px]">
                  <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded border border-red-500/30">
                    DC {edge.blockingDC}
                  </span>
                  {edge.blockingSkill && (
                    <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30">
                      {edge.blockingSkill.charAt(0).toUpperCase() + edge.blockingSkill.slice(1)}
                    </span>
                  )}
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Handle stairs
  if (edgeType === 'stairs_up' || edgeType === 'stairs_down') {
    const isUp = edgeType === 'stairs_up';
    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            {children}
          </TooltipTrigger>
          <TooltipContent
            side="top"
            className="max-w-64 bg-secondary border-2 border-cyan-500/50 p-0 shadow-[var(--shadow-doom)]"
          >
            <div className="bg-cyan-900/30 px-3 py-2 border-b border-cyan-500/30">
              <div className="flex items-center gap-2">
                {isUp ? (
                  <ArrowUpRight size={14} className="text-cyan-400" />
                ) : (
                  <ArrowDownRight size={14} className="text-cyan-400" />
                )}
                <span className="font-bold text-sm text-foreground uppercase tracking-wide">
                  {isUp ? 'Trapp opp' : 'Trapp ned'}
                </span>
              </div>
            </div>
            <div className="p-3 space-y-2">
              <p className="text-[11px] text-muted-foreground italic leading-relaxed">
                "{isUp ? 'Trinnene fører oppover. Hva venter i etasjen over?' : 'Trinnene forsvinner ned i mørket. Dypere. Alltid dypere.'}"
              </p>
              <div className="pt-2 border-t border-white/10">
                <div className="flex items-center gap-1 text-[9px] text-amber-400 uppercase tracking-wider mb-1">
                  <Info size={10} />
                  <span>Handling</span>
                </div>
                <p className="text-[10px] text-foreground/80">
                  Bruk trapp (2 AP) for å skifte etasje.
                </p>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Handle windows
  if (edgeType === 'window') {
    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            {children}
          </TooltipTrigger>
          <TooltipContent
            side="top"
            className="max-w-64 bg-secondary border-2 border-blue-500/50 p-0 shadow-[var(--shadow-doom)]"
          >
            <div className="bg-blue-900/30 px-3 py-2 border-b border-blue-500/30">
              <div className="flex items-center gap-2">
                <Square size={14} className="text-blue-400" />
                <span className="font-bold text-sm text-foreground uppercase tracking-wide">Vindu</span>
              </div>
            </div>
            <div className="p-3 space-y-2">
              <p className="text-[11px] text-muted-foreground italic leading-relaxed">
                "Glasset er skittent, men du kan se gjennom. Kanskje du også kan klatre?"
              </p>
              <div className="pt-2 border-t border-white/10">
                <div className="flex items-center gap-1 text-[9px] text-amber-400 uppercase tracking-wider mb-1">
                  <Info size={10} />
                  <span>Handling</span>
                </div>
                <p className="text-[10px] text-foreground/80">
                  Se gjennom (gratis) eller klatre gjennom (Agility DC 4).
                </p>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Handle secret doors
  if (edgeType === 'secret') {
    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            {children}
          </TooltipTrigger>
          <TooltipContent
            side="top"
            className="max-w-64 bg-secondary border-2 border-purple-500/50 p-0 shadow-[var(--shadow-doom)]"
          >
            <div className="bg-purple-900/30 px-3 py-2 border-b border-purple-500/30">
              <div className="flex items-center gap-2">
                <Eye size={14} className="text-purple-400" />
                <span className="font-bold text-sm text-foreground uppercase tracking-wide">
                  {edge.isDiscovered ? 'Hemmelig passasje' : 'Skjult passasje'}
                </span>
              </div>
            </div>
            <div className="p-3 space-y-2">
              <p className="text-[11px] text-muted-foreground italic leading-relaxed">
                "{edge.isDiscovered
                  ? 'En skjult passasje, nå avslørt. Hvem bygde denne, og hvorfor?'
                  : 'Veggen virker solid, men noe stemmer ikke...'}"
              </p>
              <div className="pt-2 border-t border-white/10">
                <div className="flex items-center gap-1 text-[9px] text-amber-400 uppercase tracking-wider mb-1">
                  <Info size={10} />
                  <span>Handling</span>
                </div>
                <p className="text-[10px] text-foreground/80">
                  {edge.isDiscovered
                    ? 'Passér gjennom den skjulte passasjen.'
                    : 'Undersøk (Investigate DC 5) for å oppdage.'}
                </p>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Handle walls
  if (edgeType === 'wall') {
    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            {children}
          </TooltipTrigger>
          <TooltipContent
            side="top"
            className="max-w-64 bg-secondary border-2 border-gray-500/50 p-0 shadow-[var(--shadow-doom)]"
          >
            <div className="bg-gray-800/30 px-3 py-2 border-b border-gray-500/30">
              <div className="flex items-center gap-2">
                <Minus size={14} className="text-gray-400" />
                <span className="font-bold text-sm text-foreground uppercase tracking-wide">Vegg</span>
              </div>
            </div>
            <div className="p-3 space-y-2">
              <p className="text-[11px] text-muted-foreground italic leading-relaxed">
                "Solid murstein. Kanskje det er noe bak?"
              </p>
              <div className="pt-2 border-t border-white/10">
                <div className="flex items-center gap-1 text-[9px] text-gray-400 uppercase tracking-wider mb-1">
                  <Ban size={10} />
                  <span>Ikke passerbar</span>
                </div>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Default - no tooltip
  return <>{children}</>;
};