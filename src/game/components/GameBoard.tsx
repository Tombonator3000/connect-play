import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Tile, Player, Enemy, FloatingText, EnemyType, ScenarioModifier } from '../types';
import {
  User, Skull, DoorOpen, Lock, Flame, Hammer, Brain,
  BookOpen, Anchor, Church, MapPin, Building, ShoppingBag, Fish, PawPrint, Biohazard, Ghost, Bug
} from 'lucide-react';

interface GameBoardProps {
  tiles: Tile[];
  players: Player[];
  enemies: Enemy[];
  selectedEnemyId?: string | null;
  onTileClick: (q: number, r: number) => void;
  onEnemyClick?: (id: string) => void;
  floatingTexts?: FloatingText[];
  doom: number;
  activeModifiers?: ScenarioModifier[];
}

const HEX_SIZE = 95;
const VISIBILITY_RANGE = 2;
const DRAG_THRESHOLD = 5;
const HEX_POLY_POINTS = "25,0 75,0 100,50 75,100 25,100 0,50";

const getMonsterIcon = (type: EnemyType) => {
  switch (type) {
    case 'cultist':
    case 'priest':
      return { Icon: User, color: 'text-purple-300' };
    case 'deepone':
      return { Icon: Fish, color: 'text-cyan-400' };
    case 'hound':
      return { Icon: PawPrint, color: 'text-amber-600' };
    case 'ghoul':
      return { Icon: Skull, color: 'text-stone-400' };
    case 'shoggoth':
    case 'formless_spawn':
      return { Icon: Biohazard, color: 'text-green-500' };
    case 'mi-go':
    case 'byakhee':
      return { Icon: Bug, color: 'text-pink-400' };
    case 'nightgaunt':
    case 'hunting_horror':
      return { Icon: Ghost, color: 'text-slate-400' };
    default:
      return { Icon: Skull, color: 'text-red-500' };
  }
};

const getTileVisuals = (name: string, type: 'building' | 'room' | 'street') => {
  const n = name.toLowerCase();

  if (n.includes('hallway') || n.includes('corridor') || n.includes('passage')) {
    return {
      bg: 'bg-card',
      style: { backgroundImage: 'repeating-linear-gradient(90deg, hsl(var(--muted)) 0, hsl(var(--muted)) 1px, transparent 1px, transparent 10px)' },
      strokeColor: 'hsl(var(--border))',
      Icon: DoorOpen,
      iconColor: 'text-muted-foreground'
    };
  }

  if (n.includes('square') || n.includes('market')) {
    return {
      bg: 'bg-slate-800',
      style: { backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.05) 0, transparent 80%)' },
      strokeColor: 'hsl(var(--border))',
      Icon: ShoppingBag,
      iconColor: 'text-slate-400'
    };
  }

  if (n.includes('library') || n.includes('study') || n.includes('manor')) {
    return {
      bg: 'bg-amber-950',
      style: { backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 10px)' },
      strokeColor: 'hsl(var(--accent))',
      Icon: BookOpen,
      iconColor: 'text-accent'
    };
  }

  if (n.includes('church') || n.includes('crypt') || n.includes('ritual')) {
    return {
      bg: 'bg-red-950',
      style: { backgroundImage: 'radial-gradient(circle at center, hsl(0 50% 25%) 0%, transparent 80%)' },
      strokeColor: 'hsl(var(--primary))',
      Icon: Church,
      iconColor: 'text-primary'
    };
  }

  if (n.includes('dock') || n.includes('river') || n.includes('pier') || n.includes('harbor')) {
    return {
      bg: 'bg-blue-950',
      style: { backgroundImage: 'repeating-radial-gradient(circle at 50% 100%, rgba(255,255,255,0.05) 0, transparent 5px)' },
      strokeColor: 'hsl(var(--insight))',
      Icon: Anchor,
      iconColor: 'text-blue-400'
    };
  }

  if (type === 'street' || n.includes('alley')) {
    return {
      bg: 'bg-slate-900',
      style: { backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)' },
      strokeColor: 'hsl(var(--border))',
      Icon: MapPin,
      iconColor: 'text-slate-400'
    };
  }

  return { bg: 'bg-card', style: {}, strokeColor: 'hsl(var(--border))', Icon: Building, iconColor: 'text-muted-foreground' };
};

const getDoomLighting = (doom: number) => {
  const danger = Math.max(0, 1 - (doom / 12));
  let overlayColor = 'rgba(10, 20, 40, 0.4)';
  let vignetteStrength = Math.min(100, 40 + (danger * 60)) + '%';
  let animation = 'none';

  if (doom <= 3) {
    overlayColor = 'rgba(80, 0, 0, 0.3)';
    animation = 'doom-flicker 4s infinite';
  }

  const gradient = `radial-gradient(circle, transparent 20%, ${overlayColor} ${vignetteStrength}, #000 100%)`;
  return { gradient, animation };
};

const GameBoard: React.FC<GameBoardProps> = ({
  tiles, players, enemies, selectedEnemyId, onTileClick, onEnemyClick, floatingTexts = [], doom, activeModifiers = []
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasDragged = useRef(false);
  const [scale, setScale] = useState(0.8);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragStartRaw, setDragStartRaw] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setPosition({ x: width / 2, y: height / 2 });
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    setDragStartRaw({ x: e.clientX, y: e.clientY });
    hasDragged.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    if (Math.hypot(e.clientX - dragStartRaw.x, e.clientY - dragStartRaw.y) > DRAG_THRESHOLD) hasDragged.current = true;
    setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const hexToPixel = (q: number, r: number) => {
    const x = HEX_SIZE * (3 / 2 * q);
    const y = HEX_SIZE * (Math.sqrt(3) / 2 * q + Math.sqrt(3) * r);
    return { x, y };
  };

  const visibleTiles = useMemo(() => {
    const visible = new Set<string>();
    const range = activeModifiers.some(m => m.effect === 'reduced_vision') ? 1 : VISIBILITY_RANGE;
    players.filter(p => !p.isDead).forEach(p => {
      tiles.forEach(t => {
        const d = (Math.abs(p.position.q - t.q) + Math.abs(p.position.q + p.position.r - t.q - t.r) + Math.abs(p.position.r - t.r)) / 2;
        if (d <= range) visible.add(`${t.q},${t.r}`);
      });
    });
    return visible;
  }, [players, tiles, activeModifiers]);

  const possibleMoves = useMemo(() => {
    const moves: { q: number, r: number }[] = [];
    tiles.forEach(tile => {
      if (visibleTiles.has(`${tile.q},${tile.r}`)) {
        const neighbors = [
          { q: tile.q + 1, r: tile.r }, { q: tile.q + 1, r: tile.r - 1 }, { q: tile.q, r: tile.r - 1 },
          { q: tile.q - 1, r: tile.r }, { q: tile.q - 1, r: tile.r + 1 }, { q: tile.q, r: tile.r + 1 }
        ];
        neighbors.forEach(n => {
          if (!tiles.some(t => t.q === n.q && t.r === n.r) && !moves.some(m => m.q === n.q && m.r === n.r)) moves.push(n);
        });
      }
    });
    return moves;
  }, [tiles, visibleTiles]);

  const lighting = getDoomLighting(doom);

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden relative cursor-move bg-background touch-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
      onWheel={(e) => setScale(prev => Math.min(Math.max(prev + (e.deltaY > 0 ? -0.1 : 0.1), 0.3), 1.5))}
    >
      <div
        className="absolute inset-0 pointer-events-none z-20 transition-all duration-1000"
        style={{ background: lighting.gradient, animation: lighting.animation, mixBlendMode: 'overlay' }}
      />

      <div
        style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`, transition: isDragging ? 'none' : 'transform 0.1s ease-out' }}
        className="absolute top-0 left-0 will-change-transform z-10"
      >
        {tiles.map(tile => {
          const { x, y } = hexToPixel(tile.q, tile.r);
          const isVisible = visibleTiles.has(`${tile.q},${tile.r}`);
          const visual = getTileVisuals(tile.name, tile.type);

          return (
            <div
              key={tile.id}
              className="absolute flex items-center justify-center transition-all duration-500"
              style={{ width: `${HEX_SIZE * 2}px`, height: `${HEX_SIZE * 1.732}px`, left: `${x - HEX_SIZE}px`, top: `${y - HEX_SIZE * 0.866}px` }}
              onClick={() => { if (!hasDragged.current) onTileClick(tile.q, tile.r); }}
            >
              <div className={`absolute inset-0 hex-clip transition-all duration-500 ${visual.bg} relative overflow-hidden group`}>
                <div className="absolute inset-0 opacity-10" style={visual.style} />
                
                <div className="relative z-10 flex flex-col items-center opacity-30 pointer-events-none group-hover:opacity-50 transition-opacity">
                  <visual.Icon size={32} className={visual.iconColor} />
                </div>

                {tile.object && (
                  <div className="absolute inset-0 flex items-center justify-center z-20 animate-in zoom-in duration-300">
                    {tile.object.type === 'fire' && <Flame className="text-orange-500 animate-pulse drop-shadow-[0_0_10px_rgba(249,115,22,0.8)]" size={40} />}
                    {tile.object.type === 'locked_door' && (
                      <div className="flex flex-col items-center">
                        <Lock className={`text-accent ${tile.object.blocking ? 'opacity-100' : 'opacity-30'}`} size={32} />
                        <span className="text-[10px] font-bold text-accent uppercase tracking-widest mt-1">Locked</span>
                      </div>
                    )}
                    {tile.object.type === 'rubble' && <Hammer className="text-stone-500 rotate-12 drop-shadow-md" size={32} />}
                  </div>
                )}

                {isVisible && (
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    <span className="text-[8px] font-bold text-foreground/50 uppercase tracking-[0.2em]">{tile.name}</span>
                  </div>
                )}

                <div className={`absolute inset-0 transition-opacity duration-1000 bg-black z-30 pointer-events-none ${isVisible ? 'opacity-0' : 'opacity-85'}`} />
              </div>
              <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none z-10">
                <polygon points={HEX_POLY_POINTS} fill="none" stroke={visual.strokeColor} strokeWidth="1.5" className="opacity-40" />
              </svg>
            </div>
          );
        })}

        {possibleMoves.map((move, i) => {
          const { x, y } = hexToPixel(move.q, move.r);
          return (
            <div
              key={`move-${i}`}
              className="absolute flex items-center justify-center cursor-pointer transition-opacity z-20 group"
              style={{ width: `${HEX_SIZE * 2}px`, height: `${HEX_SIZE * 1.732}px`, left: `${x - HEX_SIZE}px`, top: `${y - HEX_SIZE * 0.866}px` }}
              onClick={() => { if (!hasDragged.current) onTileClick(move.q, move.r); }}
            >
              <div className="absolute inset-0 hex-clip bg-white/5 border border-white/10 flex items-center justify-center opacity-40 group-hover:opacity-80 transition-all">
                <MapPin className="text-white/20" size={24} />
              </div>
              <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full overflow-visible">
                <polygon points={HEX_POLY_POINTS} fill="none" stroke="rgba(233,69,96,0.3)" strokeWidth="1" strokeDasharray="4,4" className="group-hover:stroke-primary group-hover:stroke-[2px] transition-all" />
              </svg>
            </div>
          );
        })}

        {players.map(player => {
          if (player.isDead) return null;
          const { x, y } = hexToPixel(player.position.q, player.position.r);
          return (
            <div key={player.id} className="absolute w-12 h-12 rounded-full border-2 border-foreground shadow-[0_0_25px_rgba(255,255,255,0.4)] flex items-center justify-center bg-card z-30 transition-all duration-500" style={{ left: `${x - 24}px`, top: `${y - 24}px` }}>
              <User className="text-foreground" size={20} />
              <div className="absolute inset-0 bg-accent/20 rounded-full animate-lantern pointer-events-none blur-[24px] scale-[4]" />
              {player.activeMadness && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-sanity border border-foreground rounded-full flex items-center justify-center animate-pulse">
                  <Brain size={10} className="text-foreground" />
                </div>
              )}
            </div>
          );
        })}

        {enemies.map(enemy => {
          if (!visibleTiles.has(`${enemy.position.q},${enemy.position.r}`)) return null;
          const { x, y } = hexToPixel(enemy.position.q, enemy.position.r);
          const MonsterVisual = getMonsterIcon(enemy.type);
          const isSelected = selectedEnemyId === enemy.id;
          return (
            <div key={enemy.id} className="absolute w-14 h-14 transition-all duration-500 z-40 cursor-pointer" style={{ left: `${x - 28}px`, top: `${y - 28}px`, transform: isSelected ? 'scale(1.2)' : 'scale(1)' }} onClick={(e) => { e.stopPropagation(); if (!hasDragged.current && onEnemyClick) onEnemyClick(enemy.id); }}>
              <div className={`w-full h-full rounded-full bg-red-950 border-2 ${isSelected ? 'border-primary shadow-[var(--shadow-doom)]' : 'border-red-900 shadow-[0_0_20px_rgba(220,38,38,0.3)]'} flex items-center justify-center overflow-hidden relative`}>
                <MonsterVisual.Icon className={MonsterVisual.color} size={24} />
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black"><div className="h-full bg-health" style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }} /></div>
              </div>
            </div>
          );
        })}

        {floatingTexts.map(ft => {
          const { x, y } = hexToPixel(ft.q, ft.r);
          return <div key={ft.id} className={`absolute z-[60] pointer-events-none font-bold text-sm md:text-lg animate-float-up text-stroke-sm whitespace-nowrap ${ft.colorClass}`} style={{ left: `${x + ft.randomOffset.x}px`, top: `${y - 40 + ft.randomOffset.y}px` }}>{ft.content}</div>;
        })}
      </div>
    </div>
  );
};

export default GameBoard;
