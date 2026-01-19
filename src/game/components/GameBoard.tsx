import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Tile, Player, Enemy, FloatingText, EnemyType, ScenarioModifier, WeatherState } from '../types';
import {
  User, Skull, DoorOpen, Lock, Flame, Hammer, Brain,
  BookOpen, Anchor, Church, MapPin, Building, ShoppingBag, Fish, PawPrint, Biohazard, Ghost, Bug, Search,
  Trees, AlertTriangle, Fence, Cloud, Archive, Radio, ToggleLeft, Sparkles, Moon, Package, CircleSlash
} from 'lucide-react';
import { EnemyTooltip } from './ItemTooltip';
import WeatherOverlay from './WeatherOverlay';
import { calculateWeatherVision, weatherHidesEnemy } from '../constants';

// Import AI-generated tile images
import tileLibrary from '@/assets/tiles/tile-library.png';
import tileChurch from '@/assets/tiles/tile-church.png';
import tileDock from '@/assets/tiles/tile-dock.png';
import tileSquare from '@/assets/tiles/tile-square.png';
import tileGraveyard from '@/assets/tiles/tile-graveyard.png';
import tileHallway from '@/assets/tiles/tile-hallway.png';
import tileAlley from '@/assets/tiles/tile-alley.png';
import tileCrypt from '@/assets/tiles/tile-crypt.png';
import tileStation from '@/assets/tiles/tile-station.png';
import tilePolice from '@/assets/tiles/tile-police.png';
import tileMuseum from '@/assets/tiles/tile-museum.png';
import tileHospital from '@/assets/tiles/tile-hospital.png';
import tileAsylum from '@/assets/tiles/tile-asylum.png';
import tileStreet from '@/assets/tiles/tile-street.png';
import tileManor from '@/assets/tiles/tile-manor.png';
import tileCellar from '@/assets/tiles/tile-cellar.png';
import tileForest from '@/assets/tiles/tile-forest.png';
import tileRitual from '@/assets/tiles/tile-ritual.png';
import tileWarehouse from '@/assets/tiles/tile-warehouse.png';
import tileHotel from '@/assets/tiles/tile-hotel.png';
import tileLab from '@/assets/tiles/tile-lab.png';
import tileBedroom from '@/assets/tiles/tile-bedroom.png';
import tileSewer from '@/assets/tiles/tile-sewer.png';
import tileSwamp from '@/assets/tiles/tile-swamp.png';
import tileLighthouse from '@/assets/tiles/tile-lighthouse.png';
import tileMarket from '@/assets/tiles/tile-market.png';
import tileCampus from '@/assets/tiles/tile-campus.png';
import tileShop from '@/assets/tiles/tile-shop.png';
import tileCave from '@/assets/tiles/tile-cave.png';
import tileBridge from '@/assets/tiles/tile-bridge.png';
import tileKitchen from '@/assets/tiles/tile-kitchen.png';
import tilePark from '@/assets/tiles/tile-park.png';
// New tiles
import tileParlor from '@/assets/tiles/tile-parlor.png';
import tileNursery from '@/assets/tiles/tile-nursery.png';
import tileMusic from '@/assets/tiles/tile-music.png';
import tileConservatory from '@/assets/tiles/tile-conservatory.png';
import tileBilliard from '@/assets/tiles/tile-billiard.png';
import tileTrophy from '@/assets/tiles/tile-trophy.png';
import tileDrawing from '@/assets/tiles/tile-drawing.png';
import tileOffice from '@/assets/tiles/tile-office.png';
import tileBoiler from '@/assets/tiles/tile-boiler.png';
import tileTomb from '@/assets/tiles/tile-tomb.png';
import tileUndergroundLake from '@/assets/tiles/tile-underground-lake.png';
import tilePortal from '@/assets/tiles/tile-portal.png';
import tileSanctum from '@/assets/tiles/tile-sanctum.png';
import tileCourthouse from '@/assets/tiles/tile-courthouse.png';
import tileNewspaper from '@/assets/tiles/tile-newspaper.png';
import tileShipyard from '@/assets/tiles/tile-shipyard.png';
import tileGasworks from '@/assets/tiles/tile-gasworks.png';
import tileCannery from '@/assets/tiles/tile-cannery.png';
import tileCrossroads from '@/assets/tiles/tile-crossroads.png';
import tileDeadend from '@/assets/tiles/tile-deadend.png';
import tileFuneral from '@/assets/tiles/tile-funeral.png';
import tileWell from '@/assets/tiles/tile-well.png';
import tileGallows from '@/assets/tiles/tile-gallows.png';
import tileQuarry from '@/assets/tiles/tile-quarry.png';
import tileCampsite from '@/assets/tiles/tile-campsite.png';
import tileShack from '@/assets/tiles/tile-shack.png';
import tileFarmhouse from '@/assets/tiles/tile-farmhouse.png';
import tileHangingtree from '@/assets/tiles/tile-hangingtree.png';
import tileStonecircle from '@/assets/tiles/tile-stonecircle.png';
import tileOrchard from '@/assets/tiles/tile-orchard.png';
import tileRuins from '@/assets/tiles/tile-ruins.png';
import tileMine from '@/assets/tiles/tile-mine.png';
import tilePond from '@/assets/tiles/tile-pond.png';
import tileTenement from '@/assets/tiles/tile-tenement.png';
import tileWitchhouse from '@/assets/tiles/tile-witchhouse.png';
import tileBelltower from '@/assets/tiles/tile-belltower.png';
import tileGallery from '@/assets/tiles/tile-gallery.png';
import tileRecords from '@/assets/tiles/tile-records.png';
import tileMaproom from '@/assets/tiles/tile-maproom.png';
import tileSmoking from '@/assets/tiles/tile-smoking.png';
import tileServants from '@/assets/tiles/tile-servants.png';
import tileCloset from '@/assets/tiles/tile-closet.png';
import tileGate from '@/assets/tiles/tile-gate.png';
import tileRiverfront from '@/assets/tiles/tile-riverfront.png';
import tileFireescape from '@/assets/tiles/tile-fireescape.png';
import tileStarchamber from '@/assets/tiles/tile-starchamber.png';
import tileMassgrave from '@/assets/tiles/tile-massgrave.png';
import tileIdol from '@/assets/tiles/tile-idol.png';
import tileBlackpool from '@/assets/tiles/tile-blackpool.png';
import tileEcho from '@/assets/tiles/tile-echo.png';
import tilePetrified from '@/assets/tiles/tile-petrified.png';

// Map tile names to generated images
const TILE_IMAGES: Record<string, string> = {
  // Libraries and studies
  library: tileLibrary,
  study: tileLibrary,
  reading: tileLibrary,
  archive: tileLibrary,
  orne: tileLibrary,
  
  // Churches and religious
  church: tileChurch,
  chapel: tileChurch,
  shrine: tileChurch,
  narthex: tileChurch,
  
  // Docks and water
  dock: tileDock,
  pier: tileDock,
  harbor: tileDock,
  wharf: tileDock,
  waterfront: tileDock,
  innsmouth: tileDock,
  
  // Town squares
  square: tileSquare,
  plaza: tileSquare,
  courtyard: tileSquare,
  founders: tileSquare,
  
  // Graveyard and cemetery
  graveyard: tileGraveyard,
  cemetery: tileGraveyard,
  burial: tileGraveyard,
  
  // Hallways and corridors
  hallway: tileHallway,
  corridor: tileHallway,
  passage: tileHallway,
  stair: tileHallway,
  landing: tileHallway,
  spiral: tileHallway,
  rickety: tileHallway,
  crumbling: tileHallway,
  
  // Alleys
  alley: tileAlley,
  lane: tileAlley,
  back: tileAlley,
  narrows: tileAlley,
  
  // Crypts and underground
  crypt: tileCrypt,
  vault: tileCrypt,
  ossuary: tileCrypt,
  catacomb: tileCrypt,
  
  // Train station
  station: tileStation,
  train: tileStation,
  platform: tileStation,
  tram: tileStation,
  rail: tileStation,
  
  // Police
  police: tilePolice,
  precinct: tilePolice,
  jail: tilePolice,
  
  // Museum
  museum: tileMuseum,
  exhibit: tileMuseum,
  
  // Hospital
  hospital: tileHospital,
  ward: tileHospital,
  morgue: tileHospital,
  medical: tileHospital,
  charity: tileHospital,
  
  // Asylum
  asylum: tileAsylum,
  padded: tileAsylum,
  cell: tileAsylum,
  
  // Streets
  street: tileStreet,
  road: tileStreet,
  cobblestone: tileStreet,
  avenue: tileStreet,
  
  // Manor and mansion
  manor: tileManor,
  mansion: tileManor,
  foyer: tileManor,
  lobby: tileManor,
  vestibule: tileManor,
  atrium: tileManor,
  blackwood: tileManor,
  
  // Cellar and basement
  cellar: tileCellar,
  basement: tileCellar,
  storage: tileCellar,
  cold: tileCellar,
  flooded: tileCellar,
  coal: tileCellar,
  root: tileCellar,
  maintenance: tileCellar,
  smuggler: tileCellar,
  
  // Forest and nature
  forest: tileForest,
  woods: tileForest,
  clearing: tileForest,
  grove: tileForest,
  hollow: tileForest,
  whispering: tileForest,
  
  // Ritual
  ritual: tileRitual,
  altar: tileRitual,
  sacrific: tileRitual,
  occult: tileRitual,
  pentagram: tileRitual,
  
  // Warehouse
  warehouse: tileWarehouse,
  factory: tileWarehouse,
  industrial: tileWarehouse,
  derelict: tileWarehouse,
  
  // Hotel
  hotel: tileHotel,
  inn: tileHotel,
  silver: tileHotel,
  gilded: tileHotel,
  
  // Laboratory
  lab: tileLab,
  laboratory: tileLab,
  dissection: tileLab,
  hidden: tileLab,
  
  // Bedroom
  bedroom: tileBedroom,
  bed: tileBedroom,
  sleep: tileBedroom,
  guest: tileBedroom,
  quarters: tileBedroom,
  
  // Sewer
  sewer: tileSewer,
  tunnel: tileSewer,
  drain: tileSewer,
  storm: tileSewer,
  
  // Swamp
  swamp: tileSwamp,
  marsh: tileSwamp,
  bog: tileSwamp,
  moor: tileSwamp,
  treacherous: tileSwamp,
  
  // Lighthouse
  lighthouse: tileLighthouse,
  coast: tileLighthouse,
  cliff: tileLighthouse,
  suicide: tileLighthouse,
  
  // Market
  market: tileMarket,
  fish: tileMarket,
  merchant: tileMarket,
  
  // Shop
  shop: tileShop,
  antique: tileShop,
  dusty: tileShop,
  
  // Campus
  campus: tileCampus,
  university: tileCampus,
  faculty: tileCampus,
  miskatonic: tileCampus,
  
  // Cave
  cave: tileCave,
  cavern: tileCave,
  ancient: tileCave,
  
  // Bridge
  bridge: tileBridge,
  crossing: tileBridge,
  overpass: tileBridge,
  iron: tileBridge,
  
  // Kitchen
  kitchen: tileKitchen,
  pantry: tileKitchen,
  forgotten: tileKitchen,
  
  // Park
  park: tilePark,
  garden: tilePark,
  city: tilePark,
  
  // === NEW TILES ===
  
  // Parlor / Séance
  parlor: tileParlor,
  seance: tileParlor,
  séance: tileParlor,
  
  // Nursery
  nursery: tileNursery,
  
  // Music Room
  music: tileMusic,
  piano: tileMusic,
  
  // Conservatory
  conservatory: tileConservatory,
  sun: tileConservatory,
  
  // Billiard Room
  billiard: tileBilliard,
  pool: tileBilliard,
  
  // Trophy Room
  trophy: tileTrophy,
  hunting: tileTrophy,
  
  // Drawing Room
  drawing: tileDrawing,
  sitting: tileDrawing,
  
  // Office
  office: tileOffice,
  locked: tileOffice,
  private: tileOffice,
  
  // Boiler Room
  boiler: tileBoiler,
  furnace: tileBoiler,
  
  // Tomb
  tomb: tileTomb,
  sarcophagus: tileTomb,
  
  // Underground Lake
  lake: tileUndergroundLake,
  
  // Portal
  portal: tilePortal,
  eldritch: tilePortal,
  dimensional: tilePortal,
  
  // Sanctum
  sanctum: tileSanctum,
  cultist: tileSanctum,
  
  // Courthouse
  courthouse: tileCourthouse,
  court: tileCourthouse,
  
  // Newspaper
  newspaper: tileNewspaper,
  press: tileNewspaper,
  printing: tileNewspaper,
  
  // Shipyard
  shipyard: tileShipyard,
  
  // Gasworks
  gasworks: tileGasworks,
  
  // Cannery
  cannery: tileCannery,
  
  // Crossroads
  crossroads: tileCrossroads,
  
  // Dead End
  deadend: tileDeadend,
  
  // Funeral Parlor
  funeral: tileFuneral,
  embalming: tileFuneral,
  casket: tileFuneral,
  
  // Well
  well: tileWell,
  
  // Gallows
  gallows: tileGallows,
  gibbet: tileGallows,
  execution: tileGallows,
  
  // Quarry
  quarry: tileQuarry,
  
  // Campsite
  campsite: tileCampsite,
  
  // Shack
  shack: tileShack,
  hermit: tileShack,
  
  // Farmhouse
  farmhouse: tileFarmhouse,
  
  // Hanging Tree
  hangingtree: tileHangingtree,
  
  // Stone Circle
  stonecircle: tileStonecircle,
  
  // Orchard
  orchard: tileOrchard,
  blighted: tileOrchard,
  
  // Ruins
  ruins: tileRuins,
  overgrown: tileRuins,
  
  // Mine
  mine: tileMine,
  collapsed: tileMine,
  
  // Pond
  pond: tilePond,
  stagnant: tilePond,
  
  // Tenement
  tenement: tileTenement,
  condemned: tileTenement,
  immigrant: tileTenement,
  
  // Witch House
  witch: tileWitchhouse,
  
  // Bell Tower
  bell: tileBelltower,
  tower: tileBelltower,
  
  // Gallery
  gallery: tileGallery,
  portrait: tileGallery,
  
  // Records Room
  records: tileRecords,
  filing: tileRecords,
  
  // Map Room
  map: tileMaproom,
  nautical: tileMaproom,
  
  // Smoking Lounge
  smoking: tileSmoking,
  cigar: tileSmoking,
  
  // Servants Quarters
  servants: tileServants,
  servant: tileServants,
  
  // Closet
  closet: tileCloset,
  linen: tileCloset,
  
  // Gate
  gate: tileGate,
  
  // Riverfront
  riverfront: tileRiverfront,
  river: tileRiverfront,
  
  // Fire Escape
  fire: tileFireescape,
  escape: tileFireescape,
  emergency: tileFireescape,
  
  // Star Chamber
  star: tileStarchamber,
  chamber: tileStarchamber,
  astronomical: tileStarchamber,
  
  // Mass Grave
  mass: tileMassgrave,
  grave: tileMassgrave,
  
  // Idol Chamber
  idol: tileIdol,
  
  // Black Pool
  blackpool: tileBlackpool,
  
  // Echo Chamber
  echo: tileEcho,
  
  // Petrified Garden
  petrified: tilePetrified
};

// Get tile image based on name
const getTileImage = (tileName: string): string | null => {
  const nameLower = tileName.toLowerCase();
  for (const [key, image] of Object.entries(TILE_IMAGES)) {
    if (nameLower.includes(key)) {
      return image;
    }
  }
  return null;
};

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
  exploredTiles?: Set<string>;
  weatherState?: WeatherState;
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

// Board Game Aesthetic - Tile Visual System with oil painting style
const getTileVisuals = (name: string, type: 'building' | 'room' | 'street') => {
  const n = name.toLowerCase();

  // Connectors - Narrow passages
  if (n.includes('hallway') || n.includes('corridor') || n.includes('passage') || n.includes('stair')) {
    return {
      floorClass: 'tile-darkwood',
      glowClass: '',
      strokeColor: 'hsl(25 30% 25%)',
      Icon: DoorOpen,
      iconColor: 'text-amber-700'
    };
  }

  // Outdoor - Town squares and markets
  if (n.includes('square') || n.includes('market')) {
    return {
      floorClass: 'tile-cobblestone',
      glowClass: 'animate-gaslight',
      strokeColor: 'hsl(45 40% 30%)',
      Icon: ShoppingBag,
      iconColor: 'text-amber-600'
    };
  }

  // Indoor - Libraries and studies
  if (n.includes('library') || n.includes('study') || n.includes('manor')) {
    return {
      floorClass: 'tile-carpet',
      glowClass: 'gaslight-glow',
      strokeColor: 'hsl(35 50% 35%)',
      Icon: BookOpen,
      iconColor: 'text-amber-500'
    };
  }

  // Supernatural - Churches, crypts, ritual chambers
  if (n.includes('church') || n.includes('crypt') || n.includes('ritual')) {
    return {
      floorClass: 'tile-stone',
      glowClass: 'ritual-glow',
      strokeColor: 'hsl(348 50% 40%)',
      Icon: Church,
      iconColor: 'text-red-600'
    };
  }

  // Water locations - Docks, rivers, harbors
  if (n.includes('dock') || n.includes('river') || n.includes('pier') || n.includes('harbor') || n.includes('lighthouse')) {
    return {
      floorClass: 'tile-water',
      glowClass: '',
      strokeColor: 'hsl(200 50% 35%)',
      Icon: Anchor,
      iconColor: 'text-blue-400'
    };
  }

  // Supernatural outdoor - Graveyard, swamp, forest
  if (n.includes('graveyard') || n.includes('cemetery') || n.includes('swamp') || n.includes('forest')) {
    return {
      floorClass: 'tile-stone',
      glowClass: 'eldritch-glow',
      strokeColor: 'hsl(120 40% 25%)',
      Icon: n.includes('graveyard') || n.includes('cemetery') ? Skull : Trees,
      iconColor: 'text-green-600'
    };
  }

  // Streets and alleys
  if (type === 'street' || n.includes('alley') || n.includes('street')) {
    return {
      floorClass: 'tile-cobblestone',
      glowClass: '',
      strokeColor: 'hsl(230 20% 25%)',
      Icon: MapPin,
      iconColor: 'text-slate-500'
    };
  }

  // Default indoor
  return { 
    floorClass: 'tile-stone', 
    glowClass: '', 
    strokeColor: 'hsl(230 20% 25%)', 
    Icon: Building, 
    iconColor: 'text-muted-foreground'
  };
};

// Doom-based atmospheric lighting - Chiaroscuro effect
const getDoomLighting = (doom: number) => {
  const danger = Math.max(0, 1 - (doom / 12));
  let overlayColor = 'hsla(210, 50%, 10%, 0.4)';
  let vignetteStrength = Math.min(100, 40 + (danger * 60)) + '%';
  let animation = 'none';
  let additionalGlow = 'none';

  if (doom <= 3) {
    overlayColor = 'hsla(0, 60%, 20%, 0.35)';
    animation = 'doom-flicker 4s infinite';
    additionalGlow = 'inset 0 0 100px hsla(348, 60%, 40%, 0.15)';
  } else if (doom <= 6) {
    overlayColor = 'hsla(280, 40%, 15%, 0.3)';
    additionalGlow = 'inset 0 0 80px hsla(280, 50%, 30%, 0.1)';
  }

  const gradient = `radial-gradient(circle, transparent 20%, ${overlayColor} ${vignetteStrength}, hsl(230, 25%, 3%) 100%)`;
  return { gradient, animation, additionalGlow };
};

const GameBoard: React.FC<GameBoardProps> = ({
  tiles, players, enemies, selectedEnemyId, onTileClick, onEnemyClick, floatingTexts = [], doom, activeModifiers = [], exploredTiles = new Set(), weatherState
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

  const hexDistance = (q1: number, r1: number, q2: number, r2: number) => {
    return (Math.abs(q1 - q2) + Math.abs(q1 + r1 - q2 - r2) + Math.abs(r1 - r2)) / 2;
  };

  const { visibleTiles, tileDistances } = useMemo(() => {
    const visible = new Set<string>();
    const distances = new Map<string, number>();
    // Base vision range, modified by scenario modifiers
    let baseRange = activeModifiers.some(m => m.effect === 'reduced_vision') ? 1 : VISIBILITY_RANGE;
    // Apply weather vision reduction
    const effectiveRange = weatherState?.global
      ? calculateWeatherVision(baseRange, weatherState.global)
      : baseRange;

    players.filter(p => !p.isDead).forEach(p => {
      tiles.forEach(t => {
        const d = hexDistance(p.position.q, p.position.r, t.q, t.r);
        const key = `${t.q},${t.r}`;
        if (d <= effectiveRange) {
          visible.add(key);
          const existing = distances.get(key);
          if (existing === undefined || d < existing) {
            distances.set(key, d);
          }
        }
      });
    });
    return { visibleTiles: visible, tileDistances: distances };
  }, [players, tiles, activeModifiers, weatherState]);

  const possibleMoves = useMemo(() => {
    const moves: { q: number, r: number, isExplore: boolean }[] = [];
    tiles.forEach(tile => {
      if (visibleTiles.has(`${tile.q},${tile.r}`)) {
        const neighbors = [
          { q: tile.q + 1, r: tile.r }, { q: tile.q + 1, r: tile.r - 1 }, { q: tile.q, r: tile.r - 1 },
          { q: tile.q - 1, r: tile.r }, { q: tile.q - 1, r: tile.r + 1 }, { q: tile.q, r: tile.r + 1 }
        ];
        neighbors.forEach(n => {
          if (!tiles.some(t => t.q === n.q && t.r === n.r) && !moves.some(m => m.q === n.q && m.r === n.r)) {
            const isExplore = !exploredTiles.has(`${n.q},${n.r}`);
            moves.push({ ...n, isExplore });
          }
        });
      }
    });
    return moves;
  }, [tiles, visibleTiles, exploredTiles]);

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
      {/* Doom-based chiaroscuro lighting overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-20 transition-all duration-1000"
        style={{
          background: lighting.gradient,
          animation: lighting.animation,
          mixBlendMode: 'overlay',
          boxShadow: lighting.additionalGlow
        }}
      />

      {/* Weather overlay - "The Whispering Elements" */}
      <WeatherOverlay weather={weatherState?.global || null} />

      <div
        style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`, transition: isDragging ? 'none' : 'transform 0.1s ease-out' }}
        className="absolute top-0 left-0 will-change-transform z-10"
      >
        {tiles.map(tile => {
          const { x, y } = hexToPixel(tile.q, tile.r);
          const tileKey = `${tile.q},${tile.r}`;
          const isVisible = visibleTiles.has(tileKey);
          const isExplored = exploredTiles.has(tileKey);
          const distance = tileDistances.get(tileKey) ?? Infinity;
          const visual = getTileVisuals(tile.name, tile.type);

          // Calculate fog opacity based on visibility and exploration
          let fogOpacity = 0;
          if (!isVisible) {
            fogOpacity = isExplored ? 0.7 : 0.95; // Explored but not visible vs never seen
          } else if (distance > 1) {
            fogOpacity = 0.2 + (distance - 1) * 0.15; // Gradient fog at edges
          }

          const tileImage = getTileImage(tile.name);

          return (
            <div
              key={tile.id}
              className="absolute flex items-center justify-center transition-all duration-500"
              style={{ width: `${HEX_SIZE * 2}px`, height: `${HEX_SIZE * 1.732}px`, left: `${x - HEX_SIZE}px`, top: `${y - HEX_SIZE * 0.866}px` }}
              onClick={() => { if (!hasDragged.current) onTileClick(tile.q, tile.r); }}
            >
              {/* Board game tile with AI-generated oil painting texture */}
              <div className={`absolute inset-0 hex-clip transition-all duration-500 ${visual.floorClass} ${visual.glowClass} overflow-hidden group`}>
                {/* AI-generated tile image - MUST be on top with z-index */}
                {tileImage ? (
                  <img 
                    src={tileImage}
                    alt={tile.name}
                    className="absolute inset-0 w-full h-full object-cover z-[1]"
                  />
                ) : null}
                
                {/* Chiaroscuro lighting overlay - semi-transparent */}
                <div className="absolute inset-0 z-[2] chiaroscuro-overlay pointer-events-none opacity-40" />
                
                {/* Oil painting texture - subtle */}
                <div className="absolute inset-0 z-[3] oil-texture pointer-events-none opacity-30" />
                
                {/* Tile icon - only show if no image */}
                {!tileImage && (
                  <div className={`relative z-10 flex flex-col items-center justify-center h-full pointer-events-none transition-opacity ${isVisible ? 'opacity-30 group-hover:opacity-50' : 'opacity-10'}`}>
                    <visual.Icon size={32} className={visual.iconColor} />
                  </div>
                )}

                {tile.object && isVisible && (
                  <div className="absolute inset-0 flex items-center justify-center z-20 animate-in zoom-in duration-300">
                    {/* Fire - pulsing orange flame */}
                    {tile.object.type === 'fire' && <Flame className="text-orange-500 animate-pulse drop-shadow-[0_0_10px_rgba(249,115,22,0.8)]" size={40} />}

                    {/* Locked Door - accent colored lock */}
                    {tile.object.type === 'locked_door' && (
                      <div className="flex flex-col items-center">
                        <Lock className={`text-accent ${tile.object.blocking ? 'opacity-100' : 'opacity-30'}`} size={32} />
                        <span className="text-[10px] font-bold text-accent uppercase tracking-widest mt-1">Locked</span>
                      </div>
                    )}

                    {/* Rubble - stone colored hammer */}
                    {tile.object.type === 'rubble' && <Hammer className="text-stone-500 rotate-12 drop-shadow-md" size={32} />}

                    {/* Trap - warning triangle with red glow */}
                    {tile.object.type === 'trap' && (
                      <div className="flex flex-col items-center">
                        <AlertTriangle className="text-red-500 animate-pulse drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]" size={32} />
                        <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest mt-1">Trap</span>
                      </div>
                    )}

                    {/* Gate - iron fence */}
                    {tile.object.type === 'gate' && (
                      <div className="flex flex-col items-center">
                        <Fence className={`text-gray-400 ${tile.object.blocking ? 'opacity-100' : 'opacity-40'}`} size={32} />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Gate</span>
                      </div>
                    )}

                    {/* Fog Wall - ethereal cloud */}
                    {tile.object.type === 'fog_wall' && (
                      <div className="flex flex-col items-center animate-pulse">
                        <Cloud className="text-purple-400/80 drop-shadow-[0_0_12px_rgba(168,85,247,0.5)]" size={36} />
                        <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mt-1">Fog</span>
                      </div>
                    )}

                    {/* Altar - mystical sparkles */}
                    {tile.object.type === 'altar' && (
                      <div className="flex flex-col items-center">
                        <Sparkles className="text-purple-500 drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]" size={32} />
                        <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mt-1">Altar</span>
                      </div>
                    )}

                    {/* Bookshelf - book icon */}
                    {tile.object.type === 'bookshelf' && <BookOpen className="text-amber-700 drop-shadow-md" size={28} />}

                    {/* Container types - archive/package */}
                    {(tile.object.type === 'crate' || tile.object.type === 'chest' || tile.object.type === 'cabinet') && (
                      <Package className={`text-amber-600 ${tile.object.searched ? 'opacity-40' : 'opacity-100'}`} size={28} />
                    )}

                    {/* Barricade - crossed planks */}
                    {tile.object.type === 'barricade' && <Hammer className="text-amber-800 rotate-45 drop-shadow-md" size={32} />}

                    {/* Mirror - moon reflection */}
                    {tile.object.type === 'mirror' && <Moon className="text-slate-300 drop-shadow-[0_0_6px_rgba(148,163,184,0.5)]" size={28} />}

                    {/* Radio - communication */}
                    {tile.object.type === 'radio' && <Radio className="text-green-500 animate-pulse" size={28} />}

                    {/* Switch - toggle */}
                    {tile.object.type === 'switch' && <ToggleLeft className="text-yellow-500" size={28} />}

                    {/* Statue - skull (ominous) */}
                    {tile.object.type === 'statue' && <Skull className="text-stone-400 drop-shadow-md" size={32} />}

                    {/* Exit Door - escape route */}
                    {tile.object.type === 'exit_door' && (
                      <div className="flex flex-col items-center animate-pulse">
                        <DoorOpen className="text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.6)]" size={36} />
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mt-1">Exit</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Dead-end indicator - shows when tile has only one exit */}
                {tile.isDeadEnd && isVisible && !tile.object && (
                  <div className="absolute bottom-2 right-2 z-20">
                    <CircleSlash className="text-red-500/50" size={16} />
                  </div>
                )}

                {isVisible && (
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    <span className="text-[8px] font-bold text-foreground/50 uppercase tracking-[0.2em]">{tile.name}</span>
                  </div>
                )}

                {/* Enhanced fog of war overlay */}
                <div 
                  className="absolute inset-0 z-30 pointer-events-none transition-all duration-700"
                  style={{ 
                    background: fogOpacity > 0.5 
                      ? `radial-gradient(circle at center, rgba(0,0,0,${fogOpacity * 0.8}) 0%, rgba(0,0,0,${fogOpacity}) 100%)`
                      : `radial-gradient(circle at center, transparent 30%, rgba(0,0,0,${fogOpacity}) 100%)`,
                    opacity: fogOpacity > 0 ? 1 : 0
                  }}
                />
                
                {/* Unexplored overlay with mysterious effect */}
                {!isExplored && !isVisible && (
                  <div className="absolute inset-0 z-40 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-slate-900/95 to-black/90" />
                    <div className="absolute inset-0 opacity-20" style={{
                      backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.4\'/%3E%3C/svg%3E")',
                    }} />
                  </div>
                )}
              </div>
              
              {/* Hex border with visibility-based styling */}
              <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none z-10">
                <polygon 
                  points={HEX_POLY_POINTS} 
                  fill="none" 
                  stroke={isVisible ? visual.strokeColor : 'rgba(100,100,100,0.2)'} 
                  strokeWidth={isVisible ? "1.5" : "0.5"} 
                  className={`transition-all duration-500 ${isVisible ? 'opacity-40' : 'opacity-20'}`}
                />
              </svg>
            </div>
          );
        })}

        {possibleMoves.map((move, i) => {
          const { x, y } = hexToPixel(move.q, move.r);
          const isExploreAction = move.isExplore;
          
          return (
            <div
              key={`move-${i}`}
              className="absolute flex items-center justify-center cursor-pointer transition-all z-20 group"
              style={{ width: `${HEX_SIZE * 2}px`, height: `${HEX_SIZE * 1.732}px`, left: `${x - HEX_SIZE}px`, top: `${y - HEX_SIZE * 0.866}px` }}
              onClick={() => { if (!hasDragged.current) onTileClick(move.q, move.r); }}
            >
              {/* Hex background */}
              <div className={`absolute inset-0 hex-clip flex items-center justify-center transition-all duration-300 ${
                isExploreAction 
                  ? 'bg-primary/10 group-hover:bg-primary/25' 
                  : 'bg-white/5 group-hover:bg-white/15'
              }`}>
                {isExploreAction ? (
                  <div className="flex flex-col items-center opacity-60 group-hover:opacity-100 transition-opacity">
                    <Search size={24} className="text-primary mb-1" />
                    <span className="text-[9px] font-bold text-primary uppercase tracking-[0.15em]">Utforsk</span>
                  </div>
                ) : (
                  <MapPin className="text-white/30 group-hover:text-white/60 transition-colors" size={24} />
                )}
              </div>
              
              {/* Hex border - dashed for unexplored, solid hover for explored */}
              <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
                <polygon 
                  points={HEX_POLY_POINTS} 
                  fill="none" 
                  stroke={isExploreAction ? "hsl(var(--primary))" : "rgba(255,255,255,0.3)"} 
                  strokeWidth={isExploreAction ? "2" : "1"} 
                  strokeDasharray={isExploreAction ? "6,4" : "4,4"} 
                  className={`transition-all duration-300 ${isExploreAction ? 'opacity-60 group-hover:opacity-100' : 'opacity-40 group-hover:opacity-80'}`}
                />
              </svg>
              
              {/* Glow effect for explore tiles */}
              {isExploreAction && (
                <div className="absolute inset-4 hex-clip bg-primary/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              )}
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

          // Calculate distance from nearest player for weather hiding
          const distanceFromPlayers = players.filter(p => !p.isDead).map(p =>
            hexDistance(p.position.q, p.position.r, enemy.position.q, enemy.position.r)
          );
          const minDistance = Math.min(...distanceFromPlayers);
          const isHiddenByWeather = weatherState?.global && weatherHidesEnemy(weatherState.global, minDistance);
          const weatherOpacity = isHiddenByWeather ? 0.3 : 1;

          return (
            <EnemyTooltip key={enemy.id} enemy={enemy}>
              <div
                className="absolute w-14 h-14 transition-all duration-500 z-40 cursor-pointer"
                style={{
                  left: `${x - 28}px`,
                  top: `${y - 28}px`,
                  transform: isSelected ? 'scale(1.2)' : 'scale(1)',
                  opacity: weatherOpacity,
                  filter: isHiddenByWeather ? 'blur(2px)' : 'none'
                }}
                onClick={(e) => { e.stopPropagation(); if (!hasDragged.current && onEnemyClick) onEnemyClick(enemy.id); }}
              >
                <div className={`w-full h-full rounded-full bg-red-950 border-2 ${isSelected ? 'border-primary shadow-[var(--shadow-doom)]' : 'border-red-900 shadow-[0_0_20px_rgba(220,38,38,0.3)]'} flex items-center justify-center overflow-hidden relative`}>
                  <MonsterVisual.Icon className={MonsterVisual.color} size={24} />
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-black"><div className="h-full bg-health" style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }} /></div>
                </div>
              </div>
            </EnemyTooltip>
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
