import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Tile, EdgeData, Enemy, TileObject } from '../types';
import { BESTIARY, LOCATION_DESCRIPTIONS } from '../constants';
import { useAIDescription } from '../hooks/useAIDescription';
import {
  Skull, Brain, Swords, BookOpen, Flame, Lock, Hammer, AlertTriangle,
  DoorOpen, DoorClosed, KeyRound, Ban, ArrowUpRight, ArrowDownRight,
  Square, Minus, Eye, Info, Package, Cloud, Sparkles, Moon, Radio,
  ToggleLeft, Fence, MapPin, Zap
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

// ============================================================================
// HOVER DATA TYPES
// ============================================================================

export interface HoverData {
  type: 'tile' | 'edge' | 'enemy' | 'object';
  tile?: Tile;
  edge?: EdgeData;
  enemy?: Enemy;
  object?: TileObject;
}

// ============================================================================
// CURSOR TOOLTIP COMPONENT
// ============================================================================

interface CursorTooltipProps {
  hoverData: HoverData | null;
}

export const CursorTooltip: React.FC<CursorTooltipProps> = ({ hoverData }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const isMobile = useIsMobile();

  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Show/hide tooltip based on hover data
  useEffect(() => {
    if (hoverData) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [hoverData]);

  // Don't render on mobile
  if (isMobile || !isVisible || !hoverData) {
    return null;
  }

  // Calculate position (offset from cursor)
  const tooltipX = mousePos.x + 16;
  const tooltipY = mousePos.y + 16;

  // Adjust if too close to right/bottom edge
  const maxWidth = 280;
  const adjustedX = tooltipX + maxWidth > window.innerWidth
    ? mousePos.x - maxWidth - 16
    : tooltipX;
  const adjustedY = tooltipY + 200 > window.innerHeight
    ? mousePos.y - 200 - 16
    : tooltipY;

  return createPortal(
    <div
      className="fixed z-[100] pointer-events-none transition-opacity duration-150"
      style={{
        left: adjustedX,
        top: adjustedY,
        opacity: isVisible ? 1 : 0,
      }}
    >
      <TooltipContent data={hoverData} />
    </div>,
    document.body
  );
};

// ============================================================================
// TOOLTIP CONTENT RENDERER
// ============================================================================

const TooltipContent: React.FC<{ data: HoverData }> = ({ data }) => {
  switch (data.type) {
    case 'tile':
      return data.tile ? <TileTooltipContent tile={data.tile} /> : null;
    case 'edge':
      return data.edge ? <EdgeTooltipContent edge={data.edge} /> : null;
    case 'enemy':
      return data.enemy ? <EnemyTooltipContent enemy={data.enemy} /> : null;
    case 'object':
      return data.object ? <ObjectTooltipContent object={data.object} /> : null;
    default:
      return null;
  }
};

// ============================================================================
// TILE TOOLTIP
// ============================================================================

const TileTooltipContent: React.FC<{ tile: Tile }> = ({ tile }) => {
  // Use AI-powered description with fallback to static descriptions
  const { description, isLoading, isAIGenerated } = useAIDescription(tile);

  return (
    <div className="w-[260px] bg-leather/95 border-2 border-primary/50 rounded-lg shadow-[var(--shadow-doom)] overflow-hidden">
      <div className="bg-primary/20 px-3 py-2 border-b border-primary/30">
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-primary" />
          <span className="font-bold text-sm text-parchment uppercase tracking-wide">{tile.name}</span>
        </div>
        {tile.category && (
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
            {tile.category}
          </div>
        )}
      </div>
      <div className="p-3 space-y-2">
        {isLoading ? (
          <p className="text-[11px] text-muted-foreground italic leading-relaxed animate-pulse">
            "The shadows whisper secrets..."
          </p>
        ) : description ? (
          <div className="relative">
            <p className="text-[11px] text-muted-foreground italic leading-relaxed">
              "{description}"
            </p>
            {isAIGenerated && (
              <span className="absolute -top-1 -right-1 text-[8px] text-purple-400/60" title="AI-generated">
                ✧
              </span>
            )}
          </div>
        ) : null}
        {tile.searchable && !tile.searched && (
          <div className="flex items-center gap-1 text-[10px] text-amber-400">
            <Eye size={10} />
            <span>Kan undersøkes</span>
          </div>
        )}
        {tile.hasQuestItem && (
          <div className="flex items-center gap-1 text-[10px] text-yellow-400">
            <Sparkles size={10} />
            <span>Quest-gjenstand her</span>
          </div>
        )}
        {tile.isDarkRoom && !tile.darkRoomIlluminated && (
          <div className="flex items-center gap-1 text-[10px] text-purple-400">
            <Moon size={10} />
            <span>Mørkt rom - krever lyskilde</span>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// EDGE TOOLTIP
// ============================================================================

const EdgeTooltipContent: React.FC<{ edge: EdgeData }> = ({ edge }) => {
  const edgeType = edge.type?.toLowerCase();

  // Door
  if (edgeType === 'door' && edge.doorState) {
    const doorStates: Record<string, { name: string; color: string; icon: React.ReactNode; desc: string; action: string }> = {
      open: { name: 'Åpen dør', color: 'text-green-400', icon: <DoorOpen size={14} />, desc: 'Døren står åpen.', action: 'Fri passasje.' },
      closed: { name: 'Lukket dør', color: 'text-gray-400', icon: <DoorClosed size={14} />, desc: 'En lukket dør.', action: 'Åpne (1 AP) for å passere.' },
      locked: { name: 'Låst dør', color: 'text-amber-400', icon: <Lock size={14} />, desc: 'Solid låst.', action: 'Bruk nøkkel, dirk, eller bryt opp.' },
      barricaded: { name: 'Barrikadert', color: 'text-amber-600', icon: <Hammer size={14} />, desc: 'Blokkert fra innsiden.', action: 'Bryt ned (Str DC 4, 2 AP).' },
      broken: { name: 'Knust dør', color: 'text-red-400', icon: <DoorOpen size={14} />, desc: 'Døren er ødelagt.', action: 'Fri passasje.' },
      sealed: { name: 'Forseglet', color: 'text-purple-400', icon: <Lock size={14} />, desc: 'Magisk forseglet.', action: 'Elder Sign eller Wil DC 5.' },
      puzzle: { name: 'Puzzle-dør', color: 'text-cyan-400', icon: <KeyRound size={14} />, desc: 'En gåte må løses.', action: 'Løs puslespillet.' },
    };
    const state = doorStates[edge.doorState] || doorStates.closed;

    return (
      <div className="w-[240px] bg-amber-950/95 border-2 border-amber-500/50 rounded-lg shadow-[var(--shadow-doom)] overflow-hidden">
        <div className="bg-amber-900/30 px-3 py-2 border-b border-amber-500/30">
          <div className="flex items-center gap-2">
            <span className={state.color}>{state.icon}</span>
            <span className="font-bold text-sm text-parchment uppercase tracking-wide">{state.name}</span>
          </div>
        </div>
        <div className="p-3 space-y-2">
          <p className="text-[11px] text-muted-foreground italic">{state.desc}</p>
          <div className="flex items-center gap-1 text-[9px] text-amber-400 mt-2">
            <Info size={10} />
            <span className="text-[10px] text-foreground/80">{state.action}</span>
          </div>
        </div>
      </div>
    );
  }

  // Wall
  if (edgeType === 'wall') {
    return (
      <div className="w-[200px] bg-gray-900/95 border-2 border-gray-500/50 rounded-lg shadow-[var(--shadow-doom)] overflow-hidden">
        <div className="bg-gray-800/30 px-3 py-2 border-b border-gray-500/30">
          <div className="flex items-center gap-2">
            <Minus size={14} className="text-gray-400" />
            <span className="font-bold text-sm text-parchment uppercase tracking-wide">Vegg</span>
          </div>
        </div>
        <div className="p-3">
          <p className="text-[11px] text-muted-foreground italic">"Solid murstein. Kanskje det er noe bak?"</p>
          <div className="flex items-center gap-1 text-[9px] text-gray-400 mt-2">
            <Ban size={10} />
            <span>Ikke passerbar</span>
          </div>
        </div>
      </div>
    );
  }

  // Window
  if (edgeType === 'window') {
    return (
      <div className="w-[220px] bg-blue-950/95 border-2 border-blue-500/50 rounded-lg shadow-[var(--shadow-doom)] overflow-hidden">
        <div className="bg-blue-900/30 px-3 py-2 border-b border-blue-500/30">
          <div className="flex items-center gap-2">
            <Square size={14} className="text-blue-400" />
            <span className="font-bold text-sm text-parchment uppercase tracking-wide">Vindu</span>
          </div>
        </div>
        <div className="p-3">
          <p className="text-[11px] text-muted-foreground italic">"Skittent glass. Kan klatres gjennom."</p>
          <div className="flex items-center gap-1 text-[9px] text-amber-400 mt-2">
            <Info size={10} />
            <span className="text-[10px] text-foreground/80">Klatre gjennom (Agi DC 4, 2 AP)</span>
          </div>
        </div>
      </div>
    );
  }

  // Blocked
  if (edgeType === 'blocked' && edge.blockingType) {
    const blockTypes: Record<string, { name: string; color: string; desc: string; action: string }> = {
      rubble: { name: 'Ruiner', color: 'text-stone-400', desc: 'Sammenraste murstein.', action: 'Rydd (Str DC 4, 2 AP).' },
      heavy_rubble: { name: 'Tung ruiner', color: 'text-stone-500', desc: 'Massive steinblokker.', action: 'Rydd (Str DC 5, 3 AP).' },
      collapsed: { name: 'Kollapset', color: 'text-gray-500', desc: 'Fullstendig sammenrast.', action: 'Kan ikke passeres.' },
      fire: { name: 'Brann', color: 'text-orange-400', desc: 'Flammer blokkerer veien.', action: 'Hopp over (Agi DC 4) eller slukk.' },
      barricade: { name: 'Barrikade', color: 'text-amber-600', desc: 'Provisorisk sperring.', action: 'Bryt ned (Str DC 4).' },
      locked_gate: { name: 'Låst port', color: 'text-gray-400', desc: 'Jernstenger.', action: 'Lås opp eller tving (Str DC 5).' },
      spirit_barrier: { name: 'Åndesperre', color: 'text-purple-400', desc: 'Gjennomskinnelige skikkelser.', action: 'Elder Sign eller Wil DC 5.' },
      ward: { name: 'Magisk vern', color: 'text-blue-400', desc: 'Glødende runer.', action: 'Dispel (Wil DC 5) eller kryss.' },
      chasm: { name: 'Avgrunn', color: 'text-gray-600', desc: 'Et dypt gap.', action: 'Krever spesialutstyr.' },
      flooded: { name: 'Oversvømt', color: 'text-blue-500', desc: 'Vann fyller passasjen.', action: 'Vad gjennom (+1 AP).' },
    };
    const info = blockTypes[edge.blockingType] || { name: 'Blokkert', color: 'text-red-400', desc: 'Passasjen er blokkert.', action: 'Undersøk for muligheter.' };

    return (
      <div className="w-[220px] bg-red-950/95 border-2 border-red-500/50 rounded-lg shadow-[var(--shadow-doom)] overflow-hidden">
        <div className="bg-red-900/30 px-3 py-2 border-b border-red-500/30">
          <div className="flex items-center gap-2">
            <Ban size={14} className={info.color} />
            <span className="font-bold text-sm text-parchment uppercase tracking-wide">{info.name}</span>
          </div>
          <div className="text-[10px] text-red-400 uppercase tracking-wider">Blokkert</div>
        </div>
        <div className="p-3">
          <p className="text-[11px] text-muted-foreground italic">{info.desc}</p>
          <div className="flex items-center gap-1 text-[9px] text-amber-400 mt-2">
            <Info size={10} />
            <span className="text-[10px] text-foreground/80">{info.action}</span>
          </div>
        </div>
      </div>
    );
  }

  // Stairs
  if (edgeType === 'stairs_up' || edgeType === 'stairs_down') {
    const isUp = edgeType === 'stairs_up';
    return (
      <div className="w-[200px] bg-cyan-950/95 border-2 border-cyan-500/50 rounded-lg shadow-[var(--shadow-doom)] overflow-hidden">
        <div className="bg-cyan-900/30 px-3 py-2 border-b border-cyan-500/30">
          <div className="flex items-center gap-2">
            {isUp ? <ArrowUpRight size={14} className="text-cyan-400" /> : <ArrowDownRight size={14} className="text-cyan-400" />}
            <span className="font-bold text-sm text-parchment uppercase tracking-wide">{isUp ? 'Trapp opp' : 'Trapp ned'}</span>
          </div>
        </div>
        <div className="p-3">
          <p className="text-[11px] text-muted-foreground italic">{isUp ? 'Trinnene fører oppover.' : 'Trinnene forsvinner ned i mørket.'}</p>
          <div className="flex items-center gap-1 text-[9px] text-amber-400 mt-2">
            <Info size={10} />
            <span className="text-[10px] text-foreground/80">Bruk trapp (2 AP)</span>
          </div>
        </div>
      </div>
    );
  }

  // Secret door
  if (edgeType === 'secret') {
    return (
      <div className="w-[220px] bg-purple-950/95 border-2 border-purple-500/50 rounded-lg shadow-[var(--shadow-doom)] overflow-hidden">
        <div className="bg-purple-900/30 px-3 py-2 border-b border-purple-500/30">
          <div className="flex items-center gap-2">
            <Eye size={14} className="text-purple-400" />
            <span className="font-bold text-sm text-parchment uppercase tracking-wide">
              {edge.isDiscovered ? 'Hemmelig passasje' : 'Skjult passasje'}
            </span>
          </div>
        </div>
        <div className="p-3">
          <p className="text-[11px] text-muted-foreground italic">
            {edge.isDiscovered ? 'En skjult passasje, nå avslørt.' : 'Veggen virker solid, men...'}
          </p>
          <div className="flex items-center gap-1 text-[9px] text-amber-400 mt-2">
            <Info size={10} />
            <span className="text-[10px] text-foreground/80">
              {edge.isDiscovered ? 'Passér gjennom.' : 'Undersøk (Int DC 5)'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// ============================================================================
// ENEMY TOOLTIP
// ============================================================================

const EnemyTooltipContent: React.FC<{ enemy: Enemy }> = ({ enemy }) => {
  const info = BESTIARY[enemy.type];

  return (
    <div className="w-[260px] bg-red-950/95 border-2 border-primary/50 rounded-lg shadow-[var(--shadow-doom)] overflow-hidden">
      <div className="bg-red-900/30 px-3 py-2 border-b border-primary/30">
        <div className="flex items-center gap-2">
          <Skull size={14} className="text-primary" />
          <span className="font-bold text-sm text-parchment uppercase tracking-wide">{enemy.name}</span>
        </div>
        <div className="text-[10px] text-primary/80 uppercase tracking-wider">
          {enemy.type.replace('_', ' ')}
        </div>
      </div>
      <div className="p-3 space-y-2">
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
            <p className="text-[10px] text-muted-foreground italic line-clamp-2">
              "{info.description}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// OBJECT TOOLTIP
// ============================================================================

const ObjectTooltipContent: React.FC<{ object: TileObject }> = ({ object }) => {
  const objectInfo: Record<string, { name: string; color: string; bgColor: string; borderColor: string; icon: React.ReactNode; desc: string; action: string }> = {
    fire: { name: 'Brann', color: 'text-orange-400', bgColor: 'bg-orange-950/95', borderColor: 'border-orange-500/50', icon: <Flame size={14} />, desc: 'Flammer med bevisst intensitet.', action: 'Hopp over (Agi DC 4) eller slukk.' },
    locked_door: { name: 'Låst dør', color: 'text-amber-400', bgColor: 'bg-amber-950/95', borderColor: 'border-amber-500/50', icon: <Lock size={14} />, desc: 'En solid dør med gammel lås.', action: 'Bruk nøkkel, dirk, eller bryt.' },
    rubble: { name: 'Ruiner', color: 'text-stone-400', bgColor: 'bg-stone-900/95', borderColor: 'border-stone-500/50', icon: <Hammer size={14} />, desc: 'Sammenraste murstein og tømmer.', action: 'Rydd vekk (Str DC 4).' },
    trap: { name: 'Felle', color: 'text-red-400', bgColor: 'bg-red-950/95', borderColor: 'border-red-500/50', icon: <AlertTriangle size={14} />, desc: 'En skjult mekanisme.', action: 'Deaktiver (Agi DC 4) eller utløs.' },
    gate: { name: 'Port', color: 'text-gray-400', bgColor: 'bg-gray-900/95', borderColor: 'border-gray-500/50', icon: <Fence size={14} />, desc: 'Gamle jernstenger.', action: 'Åpne eller lås opp.' },
    fog_wall: { name: 'Tåkevegg', color: 'text-purple-400', bgColor: 'bg-purple-950/95', borderColor: 'border-purple-500/50', icon: <Cloud size={14} />, desc: 'Unaturlig tåke som ikke beveger seg.', action: 'Krever spesiell gjenstand.' },
    altar: { name: 'Alter', color: 'text-purple-400', bgColor: 'bg-purple-950/95', borderColor: 'border-purple-500/50', icon: <Sparkles size={14} />, desc: 'Gammelt alter med ritualer.', action: 'Undersøk eller utfør ritual.' },
    bookshelf: { name: 'Bokhylle', color: 'text-amber-600', bgColor: 'bg-amber-950/95', borderColor: 'border-amber-600/50', icon: <BookOpen size={14} />, desc: 'Støvete bøker på ukjente språk.', action: 'Søk etter ledetråder.' },
    crate: { name: 'Kasse', color: 'text-amber-500', bgColor: 'bg-amber-950/95', borderColor: 'border-amber-500/50', icon: <Package size={14} />, desc: 'En gammel trekasse.', action: 'Søk (1 AP) for gjenstander.' },
    chest: { name: 'Kiste', color: 'text-amber-500', bgColor: 'bg-amber-950/95', borderColor: 'border-amber-500/50', icon: <Package size={14} />, desc: 'En gammel kiste.', action: 'Søk (1 AP). Kan være låst.' },
    cabinet: { name: 'Skap', color: 'text-amber-500', bgColor: 'bg-amber-950/95', borderColor: 'border-amber-500/50', icon: <Package size={14} />, desc: 'Et mørkt skap.', action: 'Søk (1 AP) for gjenstander.' },
    barricade: { name: 'Barrikade', color: 'text-amber-700', bgColor: 'bg-amber-950/95', borderColor: 'border-amber-700/50', icon: <Hammer size={14} />, desc: 'Planker stablet i hast.', action: 'Bryt ned (Str DC 4).' },
    mirror: { name: 'Speil', color: 'text-slate-300', bgColor: 'bg-slate-900/95', borderColor: 'border-slate-400/50', icon: <Moon size={14} />, desc: 'Refleksjonen virker forsinket.', action: 'Undersøk forsiktig.' },
    radio: { name: 'Radio', color: 'text-green-500', bgColor: 'bg-green-950/95', borderColor: 'border-green-500/50', icon: <Radio size={14} />, desc: 'En knitrende radio.', action: 'Lytt for informasjon.' },
    switch: { name: 'Bryter', color: 'text-yellow-500', bgColor: 'bg-yellow-950/95', borderColor: 'border-yellow-500/50', icon: <ToggleLeft size={14} />, desc: 'En mekanisk bryter.', action: 'Aktiver mekanisme.' },
    statue: { name: 'Statue', color: 'text-stone-400', bgColor: 'bg-stone-900/95', borderColor: 'border-stone-500/50', icon: <Skull size={14} />, desc: 'Øynene følger deg.', action: 'Undersøk for skjulte ting.' },
    exit_door: { name: 'Utgangsdør', color: 'text-emerald-400', bgColor: 'bg-emerald-950/95', borderColor: 'border-emerald-500/50', icon: <DoorOpen size={14} />, desc: 'Veien ut. Friheten venter.', action: 'Gå gjennom for å rømme.' },
    eldritch_portal: { name: 'Eldritch Portal', color: 'text-purple-400', bgColor: 'bg-purple-950/95', borderColor: 'border-purple-500/50', icon: <Zap size={14} />, desc: 'Et hull i virkeligheten.', action: 'Kan forsegles med Elder Sign.' },
  };

  const info = objectInfo[object.type] || { name: object.type, color: 'text-gray-400', bgColor: 'bg-gray-900/95', borderColor: 'border-gray-500/50', icon: <Package size={14} />, desc: 'Et objekt.', action: 'Undersøk.' };

  return (
    <div className={`w-[240px] ${info.bgColor} border-2 ${info.borderColor} rounded-lg shadow-[var(--shadow-doom)] overflow-hidden`}>
      <div className={`${info.bgColor} px-3 py-2 border-b ${info.borderColor.replace('border-', 'border-')}/30`}>
        <div className="flex items-center gap-2">
          <span className={info.color}>{info.icon}</span>
          <span className="font-bold text-sm text-parchment uppercase tracking-wide">{info.name}</span>
        </div>
        {object.blocking && (
          <div className="text-[10px] text-red-400 uppercase tracking-wider">Blokkerer</div>
        )}
      </div>
      <div className="p-3">
        <p className="text-[11px] text-muted-foreground italic">{info.desc}</p>
        <div className="flex items-center gap-1 text-[9px] text-amber-400 mt-2">
          <Info size={10} />
          <span className="text-[10px] text-foreground/80">{info.action}</span>
        </div>
      </div>
    </div>
  );
};

export default CursorTooltip;
