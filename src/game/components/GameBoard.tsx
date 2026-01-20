import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Tile, Player, Enemy, FloatingText, SpellParticle, EnemyType, ScenarioModifier, WeatherState, EdgeData, CharacterType } from '../types';
import {
  User, Skull, DoorOpen, Lock, Flame, Hammer, Brain,
  BookOpen, Anchor, Church, MapPin, Building, ShoppingBag, Fish, PawPrint, Biohazard, Ghost, Bug, Search,
  Trees, AlertTriangle, Fence, Cloud, Archive, Radio, ToggleLeft, Sparkles, Moon, Package, CircleSlash,
  Zap, Droplet, Key, Star, FileText, Gem
} from 'lucide-react';
import { EnemyTooltip, TileObjectTooltip, EdgeFeatureTooltip } from './ItemTooltip';
import WeatherOverlay from './WeatherOverlay';
import { calculateWeatherVision, weatherHidesEnemy, getDarkRoomDisplayState } from '../constants';
import { Flashlight } from 'lucide-react';
import { getCharacterPortrait } from '../utils/characterAssets';
import { getMonsterPortrait } from '../utils/monsterAssets';
import { getEdgeIconInfo, getEdgeIconPosition } from './EdgeIcons';
import { calculateCombinedOffset } from '../utils/entityPositioning';

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
  spellParticles?: SpellParticle[];
  doom: number;
  activeModifiers?: ScenarioModifier[];
  exploredTiles?: Set<string>;
  weatherState?: WeatherState;
}

const HEX_SIZE = 95;
const VISIBILITY_RANGE = 2;
const DRAG_THRESHOLD = 5;
const HEX_POLY_POINTS = "25,0 75,0 100,50 75,100 25,100 0,50";

// Hex edge endpoints for flat-top hexagon (0-100 scale)
// Edges: [N, NE, SE, S, SW, NW]
const HEX_EDGE_POINTS: Array<{ x1: number; y1: number; x2: number; y2: number }> = [
  { x1: 25, y1: 0, x2: 75, y2: 0 },      // 0: North (top)
  { x1: 75, y1: 0, x2: 100, y2: 50 },    // 1: North-East (top-right)
  { x1: 100, y1: 50, x2: 75, y2: 100 },  // 2: South-East (bottom-right)
  { x1: 75, y1: 100, x2: 25, y2: 100 },  // 3: South (bottom)
  { x1: 25, y1: 100, x2: 0, y2: 50 },    // 4: South-West (bottom-left)
  { x1: 0, y1: 50, x2: 25, y2: 0 },      // 5: North-West (top-left)
];

// Check if an edge type represents a dead end (impassable)
const isDeadEndEdge = (edgeType: string | undefined): boolean => {
  if (!edgeType) return false;
  return edgeType === 'wall' || edgeType === 'blocked';
};

// Check if an edge is a window (semi-blocked - can see through but hard to pass)
const isWindowEdge = (edgeType: string | undefined): boolean => {
  if (!edgeType) return false;
  return edgeType === 'window';
};

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
  tiles, players, enemies, selectedEnemyId, onTileClick, onEnemyClick, floatingTexts = [], spellParticles = [], doom, activeModifiers = [], exploredTiles = new Set(), weatherState
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasDragged = useRef(false);
  const [scale, setScale] = useState(0.8);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragStartRaw, setDragStartRaw] = useState({ x: 0, y: 0 });

  // Touch-specific state for pinch-to-zoom
  const lastTouchDistance = useRef<number | null>(null);
  const lastTouchCenter = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setPosition({ x: width / 2, y: height / 2 });
    }
  }, []);

  // Mouse handlers
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

  // Touch handlers for mobile
  const getTouchDistance = (touches: React.TouchList) => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.hypot(dx, dy);
  };

  const getTouchCenter = (touches: React.TouchList) => {
    if (touches.length < 2) {
      return { x: touches[0].clientX, y: touches[0].clientY };
    }
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2
    };
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      // Single touch - start drag
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - position.x, y: e.touches[0].clientY - position.y });
      setDragStartRaw({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      hasDragged.current = false;
    } else if (e.touches.length === 2) {
      // Two touches - prepare for pinch zoom
      lastTouchDistance.current = getTouchDistance(e.touches);
      lastTouchCenter.current = getTouchCenter(e.touches);
      setIsDragging(false);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      // Single touch - drag/pan
      const touch = e.touches[0];
      if (Math.hypot(touch.clientX - dragStartRaw.x, touch.clientY - dragStartRaw.y) > DRAG_THRESHOLD) {
        hasDragged.current = true;
      }
      setPosition({ x: touch.clientX - dragStart.x, y: touch.clientY - dragStart.y });
    } else if (e.touches.length === 2) {
      // Two touches - pinch to zoom
      const newDistance = getTouchDistance(e.touches);
      const newCenter = getTouchCenter(e.touches);

      if (lastTouchDistance.current && lastTouchDistance.current > 0) {
        const scaleDelta = newDistance / lastTouchDistance.current;
        setScale(prev => Math.min(Math.max(prev * scaleDelta, 0.3), 2.5));
        hasDragged.current = true;
      }

      // Also pan while pinching
      if (lastTouchCenter.current) {
        const dx = newCenter.x - lastTouchCenter.current.x;
        const dy = newCenter.y - lastTouchCenter.current.y;
        setPosition(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      }

      lastTouchDistance.current = newDistance;
      lastTouchCenter.current = newCenter;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length === 0) {
      setIsDragging(false);
      lastTouchDistance.current = null;
      lastTouchCenter.current = null;
    } else if (e.touches.length === 1) {
      // Went from 2 fingers to 1 - restart single-touch drag
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - position.x, y: e.touches[0].clientY - position.y });
      setDragStartRaw({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      lastTouchDistance.current = null;
      lastTouchCenter.current = null;
    }
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
      className="w-full h-full overflow-hidden relative cursor-move bg-background touch-none select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
      onWheel={(e) => setScale(prev => Math.min(Math.max(prev + (e.deltaY > 0 ? -0.1 : 0.1), 0.3), 2.5))}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
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

          // Determine 3D depth class based on zone level
          const depthClass = tile.zoneLevel < 0 ? 'hex-3d-depth-sunken' : tile.zoneLevel > 0 ? 'hex-3d-depth-elevated' : 'hex-3d-depth';

          return (
            <div
              key={tile.id}
              className="absolute flex items-center justify-center transition-all duration-500"
              style={{ width: `${HEX_SIZE * 2}px`, height: `${HEX_SIZE * 1.732}px`, left: `${x - HEX_SIZE}px`, top: `${y - HEX_SIZE * 0.866}px` }}
              onClick={() => { if (!hasDragged.current) onTileClick(tile.q, tile.r); }}
            >
              {/* Board game tile with AI-generated oil painting texture and 3D depth */}
              <div className={`absolute inset-0 hex-clip transition-all duration-500 ${visual.floorClass} ${visual.glowClass} ${isVisible ? depthClass : ''} overflow-hidden group`}>
                {/* AI-generated tile image - MUST be on top with z-index */}
                {tileImage ? (
                  <img 
                    src={tileImage}
                    alt={tile.name}
                    className="absolute inset-0 w-full h-full object-cover z-[1]"
                  />
                ) : null}
                
                {/* Chiaroscuro lighting overlay - very subtle for visibility */}
                <div className="absolute inset-0 z-[2] chiaroscuro-overlay pointer-events-none opacity-20" />

                {/* Oil painting texture - minimal for visibility */}
                <div className="absolute inset-0 z-[3] oil-texture pointer-events-none opacity-15" />

                {/* 3D edge lighting effect - subtle */}
                <div className="absolute inset-0 z-[4] hex-3d-edge-light pointer-events-none opacity-30" />

                {/* Blood stains - visual indicator of combat */}
                {tile.bloodstains && tile.bloodstains.count > 0 && isVisible && (
                  <div className="absolute inset-0 z-[5] pointer-events-none">
                    {tile.bloodstains.positions.slice(0, Math.min(tile.bloodstains.count, 5)).map((pos, i) => (
                      <div
                        key={`blood-${i}`}
                        className="absolute blood-stain animate-blood-splatter"
                        style={{
                          left: `${pos.x}%`,
                          top: `${pos.y}%`,
                          width: `${pos.size}px`,
                          height: `${pos.size}px`,
                          transform: `translate(-50%, -50%) rotate(${pos.rotation}deg)`,
                          '--rotation': `${pos.rotation}deg`,
                          opacity: Math.max(0.5, 1 - (tile.bloodstains.fadeTime || 0) * 0.1)
                        } as React.CSSProperties}
                      />
                    ))}
                  </div>
                )}

                {/* Tile icon - only show if no image */}
                {!tileImage && (
                  <div className={`relative z-10 flex flex-col items-center justify-center h-full pointer-events-none transition-opacity ${isVisible ? 'opacity-30 group-hover:opacity-50' : 'opacity-10'}`}>
                    <visual.Icon size={32} className={visual.iconColor} />
                  </div>
                )}

                {tile.object && isVisible && (
                  <TileObjectTooltip object={tile.object}>
                    <div className="absolute inset-0 flex items-center justify-center z-20 animate-in zoom-in duration-300 cursor-help">
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

                      {/* Bookshelf - book icon with search state */}
                      {tile.object.type === 'bookshelf' && (
                        <div className={`flex flex-col items-center ${!tile.object.searched ? 'animate-bookshelf-glow' : ''}`}>
                          <BookOpen
                            className={`drop-shadow-md transition-all duration-300 ${
                              tile.object.searched
                                ? 'text-amber-900/60'
                                : 'text-amber-600 drop-shadow-[0_0_8px_rgba(200,160,80,0.4)]'
                            }`}
                            size={28}
                          />
                          {!tile.object.searched && (
                            <span className="text-[8px] font-bold text-amber-400 uppercase tracking-widest mt-1 animate-pulse">Search</span>
                          )}
                        </div>
                      )}

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

                      {/* Exit Door - escape route with prominent beacon effect */}
                      {tile.object.type === 'exit_door' && (
                        <div className="relative flex flex-col items-center">
                          {/* Outer beacon glow */}
                          <div className="absolute inset-0 -m-8 rounded-full animate-exit-beacon opacity-80" />
                          {/* Inner rotating ring */}
                          <div className="absolute inset-0 -m-4 rounded-full animate-spin"
                            style={{
                              animationDuration: '8s',
                              background: 'conic-gradient(from 0deg, transparent 0%, rgba(52,211,153,0.4) 25%, transparent 50%, rgba(52,211,153,0.4) 75%, transparent 100%)'
                            }}
                          />
                          {/* Door icon with enhanced glow */}
                          <DoorOpen
                            className="text-emerald-400 animate-pulse drop-shadow-[0_0_15px_rgba(52,211,153,0.8)]"
                            size={40}
                          />
                          <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-widest mt-1 drop-shadow-[0_0_6px_rgba(52,211,153,0.8)]">
                            EXIT
                          </span>
                          {/* Pulsing rays */}
                          <div className="absolute inset-0 -m-6">
                            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                              <div
                                key={angle}
                                className="absolute w-[2px] h-8 bg-gradient-to-t from-emerald-400/60 to-transparent animate-pulse"
                                style={{
                                  left: '50%',
                                  top: '50%',
                                  transform: `translate(-50%, -100%) rotate(${angle}deg)`,
                                  transformOrigin: 'center bottom',
                                  animationDelay: `${angle / 360}s`
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Eldritch Portal - glowing purple gateway that spawns enemies */}
                      {tile.object.type === 'eldritch_portal' && (
                        <div className="relative flex flex-col items-center">
                          {/* Outer glow ring */}
                          <div className="absolute inset-0 -m-4 rounded-full eldritch-portal-glow animate-portal-pulse" />
                          {/* Swirling energy effect */}
                          <div className="absolute inset-0 -m-2 rounded-full animate-portal-swirl opacity-60" style={{
                            background: 'conic-gradient(from 0deg, rgba(128,0,255,0.4), rgba(200,100,255,0.2), rgba(128,0,255,0.4), rgba(150,50,200,0.3), rgba(128,0,255,0.4))'
                          }} />
                          {/* Portal icon */}
                          <Zap
                            className="text-purple-400 animate-portal-energy drop-shadow-[0_0_15px_rgba(168,85,247,0.8)]"
                            size={36}
                          />
                          <span className="text-[9px] font-bold text-purple-300 uppercase tracking-widest mt-1 drop-shadow-[0_0_4px_rgba(128,0,255,0.6)]">
                            {tile.object.portalActive ? 'PORTAL' : 'Dormant'}
                          </span>
                          {/* Occasional energy flare */}
                          <div className="absolute inset-0 -m-6 rounded-full animate-portal-flare bg-purple-500/30" />
                        </div>
                      )}
                    </div>
                  </TileObjectTooltip>
                )}

                {/* Quest Item Indicators - Shows glowing items on tiles */}
                {isVisible && tile.items && tile.items.length > 0 && (
                  <div className="absolute inset-0 flex items-end justify-center z-[21] pointer-events-none pb-4">
                    <div className="flex gap-1">
                      {tile.items.slice(0, 3).map((item, idx) => {
                        // Determine icon based on quest item type
                        const getQuestItemIcon = () => {
                          if (item.questItemType === 'key' || item.type === 'key') {
                            return <Key className="text-amber-400" size={20} />;
                          } else if (item.questItemType === 'clue' || item.type === 'clue') {
                            return <FileText className="text-blue-400" size={20} />;
                          } else if (item.questItemType === 'artifact' || item.type === 'relic') {
                            return <Gem className="text-purple-400" size={20} />;
                          } else if (item.questItemType === 'collectible') {
                            return <Star className="text-yellow-400" size={20} />;
                          } else {
                            return <Sparkles className="text-cyan-400" size={20} />;
                          }
                        };

                        return (
                          <div
                            key={item.id || idx}
                            className="relative animate-pulse"
                            title={item.name}
                          >
                            {/* Glow ring */}
                            <div className="absolute inset-0 -m-2 rounded-full animate-quest-item-glow"
                              style={{
                                background: item.questItemType === 'key' || item.type === 'key'
                                  ? 'radial-gradient(circle, rgba(251,191,36,0.6) 0%, transparent 70%)'
                                  : item.questItemType === 'clue' || item.type === 'clue'
                                  ? 'radial-gradient(circle, rgba(96,165,250,0.6) 0%, transparent 70%)'
                                  : item.questItemType === 'artifact' || item.type === 'relic'
                                  ? 'radial-gradient(circle, rgba(168,85,247,0.6) 0%, transparent 70%)'
                                  : 'radial-gradient(circle, rgba(34,211,238,0.6) 0%, transparent 70%)'
                              }}
                            />
                            {/* Icon */}
                            <div className="relative drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
                              {getQuestItemIcon()}
                            </div>
                          </div>
                        );
                      })}
                      {tile.items.length > 3 && (
                        <span className="text-xs text-white/80 font-bold ml-1">+{tile.items.length - 3}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Quest Tile Indicator - Special glow for quest-critical tiles (exit, altar, etc.) */}
                {isVisible && tile.hasQuestItem && (
                  <div className="absolute inset-0 z-[7] pointer-events-none">
                    <div
                      className="absolute inset-2 rounded-lg animate-quest-tile-pulse"
                      style={{
                        boxShadow: '0 0 20px rgba(52, 211, 153, 0.5), inset 0 0 15px rgba(52, 211, 153, 0.2)',
                        border: '2px solid rgba(52, 211, 153, 0.4)'
                      }}
                    />
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
                
                {/* Unexplored overlay with animated shadow mist effect */}
                {!isExplored && !isVisible && (
                  <div className="absolute inset-0 z-40 pointer-events-none overflow-hidden">
                    {/* Base dark layer */}
                    <div className="absolute inset-0 fog-of-war-unexplored" />
                    {/* Animated mist layer 1 - slow drift */}
                    <div className="absolute inset-0 animate-fog-mist-drift opacity-70" style={{
                      background: 'radial-gradient(ellipse at 40% 30%, rgba(40, 30, 60, 0.8) 0%, transparent 60%)',
                    }} />
                    {/* Animated mist layer 2 - swirl */}
                    <div className="absolute inset-0 animate-fog-mist-swirl opacity-60" style={{
                      background: 'radial-gradient(ellipse at 60% 70%, rgba(30, 25, 50, 0.7) 0%, transparent 55%)',
                    }} />
                    {/* Tendrils effect */}
                    <div className="absolute inset-0 animate-fog-tendril opacity-50" style={{
                      background: 'linear-gradient(180deg, rgba(20,15,35,0.9) 0%, transparent 40%, transparent 60%, rgba(20,15,35,0.9) 100%)',
                    }} />
                    {/* Noise texture */}
                    <div className="absolute inset-0 opacity-25" style={{
                      backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.6\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.5\'/%3E%3C/svg%3E")',
                    }} />
                  </div>
                )}

                {/* Fog reveal flicker animation - plays when tile transitions from unexplored to visible */}
                {tile.fogRevealAnimation === 'revealing' && (
                  <div className="absolute inset-0 z-45 pointer-events-none">
                    <div className="absolute inset-0 animate-fog-reveal-flicker fog-of-war-unexplored" />
                    <div className="absolute inset-0 fog-reveal-shimmer" />
                  </div>
                )}

                {/* Local Weather Effects - Rain/Fog particles on specific tiles */}
                {tile.localWeather && isVisible && (
                  <div className="absolute inset-0 z-[6] pointer-events-none overflow-hidden">
                    {/* Local Fog Effect */}
                    {tile.localWeather.type === 'fog' && (
                      <>
                        <div className="absolute inset-0 local-fog-overlay animate-local-fog-pulse" />
                        <div className="absolute inset-0 animate-local-fog-drift opacity-60" style={{
                          background: `radial-gradient(ellipse at ${30 + Math.random() * 40}% ${30 + Math.random() * 40}%, rgba(180, 190, 210, 0.4) 0%, transparent 60%)`
                        }} />
                      </>
                    )}

                    {/* Local Rain Effect */}
                    {tile.localWeather.type === 'rain' && (
                      <>
                        <div className="absolute inset-0 local-rain-overlay" />
                        {/* Rain drops */}
                        {Array.from({ length: Math.min(tile.localWeather.intensity === 'heavy' ? 12 : tile.localWeather.intensity === 'moderate' ? 8 : 4, 12) }).map((_, i) => (
                          <div
                            key={`rain-${i}`}
                            className="absolute w-[2px] h-[10px] bg-gradient-to-b from-transparent via-blue-300/40 to-blue-400/60 animate-rain-drop"
                            style={{
                              left: `${10 + (i * 8) % 80}%`,
                              top: '-10px',
                              '--duration': `${0.4 + Math.random() * 0.3}s`,
                              '--delay': `${Math.random() * 0.5}s`,
                              animationDelay: `${Math.random() * 0.5}s`
                            } as React.CSSProperties}
                          />
                        ))}
                      </>
                    )}

                    {/* Local Miasma Effect */}
                    {tile.localWeather.type === 'miasma' && (
                      <>
                        <div className="absolute inset-0 animate-miasma-float opacity-70" style={{
                          background: 'radial-gradient(ellipse at center, rgba(100, 80, 150, 0.3) 0%, rgba(80, 100, 80, 0.2) 50%, transparent 100%)'
                        }} />
                        <div className="absolute inset-0 animate-miasma-skull opacity-30">
                          <Skull className="absolute text-purple-300/20" size={24} style={{ left: '40%', top: '30%' }} />
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Dark Room Overlay - requires flashlight to see contents */}
                {tile.isDarkRoom && isVisible && !tile.darkRoomIlluminated && (() => {
                  const currentPlayer = players[0]; // Check first player (can be extended for multiplayer)
                  const darkState = getDarkRoomDisplayState(tile, currentPlayer);

                  if (darkState === 'dark') {
                    return (
                      <div className="absolute inset-0 z-35 pointer-events-none animate-darkness-pulse">
                        {/* Dark overlay with swirling darkness effect */}
                        <div
                          className="absolute inset-0"
                          style={{
                            background: 'radial-gradient(circle at center, rgba(0,0,0,0.7) 0%, rgba(10,5,20,0.9) 70%, rgba(0,0,0,0.95) 100%)'
                          }}
                        />
                        {/* Animated darkness tendrils */}
                        <div className="absolute inset-0 opacity-60 animate-darkness-swirl" style={{
                          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'dark\'%3E%3CfeTurbulence type=\'turbulence\' baseFrequency=\'0.02\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23dark)\' opacity=\'0.5\'/%3E%3C/svg%3E")',
                        }} />
                        {/* Flashlight required indicator */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                          <Flashlight className="text-amber-300/60 animate-pulse" size={28} />
                          <span className="text-[8px] font-bold text-amber-300/60 uppercase tracking-wider">Darkness</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
              
              {/* Hex border with visibility-based styling */}
              <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none z-10">
                {/* Exit tile glow border */}
                {isVisible && tile.object?.type === 'exit_door' && (
                  <>
                    <defs>
                      <filter id={`exit-glow-${tile.id}`} x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    <polygon
                      points={HEX_POLY_POINTS}
                      fill="none"
                      stroke="rgba(52, 211, 153, 0.8)"
                      strokeWidth="4"
                      filter={`url(#exit-glow-${tile.id})`}
                      className="animate-pulse"
                    />
                  </>
                )}
                {/* Quest item tile glow border */}
                {isVisible && tile.hasQuestItem && tile.object?.type !== 'exit_door' && (
                  <>
                    <defs>
                      <filter id={`quest-glow-${tile.id}`} x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    <polygon
                      points={HEX_POLY_POINTS}
                      fill="none"
                      stroke="rgba(251, 191, 36, 0.6)"
                      strokeWidth="3"
                      filter={`url(#quest-glow-${tile.id})`}
                      className="animate-pulse"
                    />
                  </>
                )}
                <polygon
                  points={HEX_POLY_POINTS}
                  fill="none"
                  stroke={isVisible ? visual.strokeColor : 'rgba(100,100,100,0.2)'}
                  strokeWidth={isVisible ? "1.5" : "0.5"}
                  className={`transition-all duration-500 ${isVisible ? 'opacity-40' : 'opacity-20'}`}
                />
                {/* Edge indicators with icons - walls, doors, windows, stairs, etc. */}
                {isVisible && tile.edges && tile.edges.map((edge: EdgeData, edgeIndex: number) => {
                  const points = HEX_EDGE_POINTS[edgeIndex];
                  if (!points) return null;

                  // Calculate midpoint and edge properties
                  const midX = (points.x1 + points.x2) / 2;
                  const midY = (points.y1 + points.y2) / 2;
                  const edgeType = edge?.type?.toLowerCase() || '';
                  const doorState = edge?.doorState?.toLowerCase() || '';

                  // Skip open/empty edges
                  if (!edgeType || edgeType === 'open') return null;

                  // Get icon info for this edge type
                  const iconInfo = getEdgeIconInfo(edgeType, doorState);

                  // Determine edge rendering based on type
                  const isWall = edgeType === 'wall' || edgeType === 'blocked';
                  const isWindow = edgeType === 'window';
                  const isDoor = edgeType === 'door';
                  const isStairs = edgeType.includes('stairs');
                  const isSecret = edgeType === 'secret';

                  // Calculate icon position and rotation
                  const iconPos = getEdgeIconPosition(edgeIndex);
                  const iconRotation = edgeIndex * 60;

                  return (
                    <g key={`edge-${edgeIndex}`}>
                      {/* Wall rendering */}
                      {isWall && (
                        <>
                          <line
                            x1={points.x1} y1={points.y1} x2={points.x2} y2={points.y2}
                            stroke="hsl(0, 10%, 15%)" strokeWidth="5" strokeLinecap="round" className="opacity-80"
                          />
                          <line
                            x1={points.x1} y1={points.y1} x2={points.x2} y2={points.y2}
                            stroke="hsl(20, 15%, 25%)" strokeWidth="2" strokeLinecap="round" className="opacity-90"
                          />
                          {/* Brick pattern indicator */}
                          <g transform={`translate(${midX}, ${midY})`}>
                            <rect x="-6" y="-3" width="12" height="6" fill="hsl(20, 25%, 20%)" rx="1" className="opacity-70" />
                            <line x1="-6" y1="0" x2="6" y2="0" stroke="hsl(20, 15%, 15%)" strokeWidth="0.5" />
                            <line x1="0" y1="-3" x2="0" y2="0" stroke="hsl(20, 15%, 15%)" strokeWidth="0.5" />
                            <line x1="-3" y1="0" x2="-3" y2="3" stroke="hsl(20, 15%, 15%)" strokeWidth="0.5" />
                            <line x1="3" y1="0" x2="3" y2="3" stroke="hsl(20, 15%, 15%)" strokeWidth="0.5" />
                          </g>
                        </>
                      )}

                      {/* Window rendering */}
                      {isWindow && (
                        <>
                          <line
                            x1={points.x1} y1={points.y1} x2={points.x2} y2={points.y2}
                            stroke="hsl(200, 30%, 30%)" strokeWidth="4" strokeLinecap="round" className="opacity-70"
                          />
                          <line
                            x1={points.x1} y1={points.y1} x2={points.x2} y2={points.y2}
                            stroke="hsl(200, 50%, 70%)" strokeWidth="2" strokeLinecap="round"
                            strokeDasharray="6,3" className="opacity-60"
                          />
                          {/* Window icon */}
                          <g transform={`translate(${midX}, ${midY})`}>
                            <rect x="-5" y="-5" width="10" height="10" fill="hsl(200, 40%, 25%)" rx="1" className="opacity-80" />
                            <rect x="-4" y="-4" width="3" height="3" fill="hsl(200, 60%, 70%)" className="opacity-50" />
                            <rect x="1" y="-4" width="3" height="3" fill="hsl(200, 60%, 70%)" className="opacity-50" />
                            <rect x="-4" y="1" width="3" height="3" fill="hsl(200, 60%, 70%)" className="opacity-50" />
                            <rect x="1" y="1" width="3" height="3" fill="hsl(200, 60%, 70%)" className="opacity-50" />
                          </g>
                        </>
                      )}

                      {/* Door rendering */}
                      {isDoor && (
                        <>
                          <line
                            x1={points.x1} y1={points.y1} x2={points.x2} y2={points.y2}
                            stroke={doorState === 'open' ? 'hsl(120, 30%, 30%)' : doorState === 'locked' ? 'hsl(0, 40%, 30%)' : 'hsl(35, 40%, 30%)'}
                            strokeWidth="4" strokeLinecap="round" className="opacity-70"
                          />
                          {/* Door icon based on state */}
                          <g transform={`translate(${midX}, ${midY})`}>
                            <rect x="-6" y="-7" width="12" height="14" fill={doorState === 'open' ? 'hsl(120, 30%, 25%)' : doorState === 'locked' ? 'hsl(0, 40%, 25%)' : 'hsl(35, 50%, 25%)'} rx="1" className="opacity-90" />
                            {doorState === 'open' ? (
                              // Open door icon - door ajar
                              <>
                                <rect x="-4" y="-5" width="6" height="10" fill="hsl(120, 40%, 35%)" rx="0.5" transform="skewY(-10)" />
                                <circle cx="1" cy="0" r="1" fill="hsl(45, 60%, 50%)" />
                              </>
                            ) : doorState === 'locked' ? (
                              // Locked door icon - with lock
                              <>
                                <rect x="-3" y="-4" width="6" height="8" fill="hsl(35, 50%, 35%)" rx="0.5" />
                                <rect x="-1.5" y="-1" width="3" height="3" fill="hsl(45, 60%, 40%)" rx="0.5" />
                                <circle cx="0" cy="-3" r="1.5" fill="none" stroke="hsl(45, 60%, 40%)" strokeWidth="1" />
                              </>
                            ) : doorState === 'barricaded' ? (
                              // Barricaded door - with planks
                              <>
                                <rect x="-3" y="-4" width="6" height="8" fill="hsl(35, 50%, 35%)" rx="0.5" />
                                <line x1="-5" y1="-3" x2="5" y2="3" stroke="hsl(30, 40%, 45%)" strokeWidth="2" />
                                <line x1="-5" y1="3" x2="5" y2="-3" stroke="hsl(30, 40%, 45%)" strokeWidth="2" />
                              </>
                            ) : doorState === 'sealed' ? (
                              // Sealed door - with glowing symbols
                              <>
                                <rect x="-3" y="-4" width="6" height="8" fill="hsl(280, 50%, 25%)" rx="0.5" />
                                <circle cx="0" cy="0" r="2" fill="none" stroke="hsl(280, 70%, 60%)" strokeWidth="0.5" className="opacity-80" />
                                <text x="0" y="1" fontSize="4" fill="hsl(280, 70%, 70%)" textAnchor="middle" className="opacity-90">*</text>
                              </>
                            ) : doorState === 'puzzle' ? (
                              // Puzzle door - with symbol
                              <>
                                <rect x="-3" y="-4" width="6" height="8" fill="hsl(220, 50%, 30%)" rx="0.5" />
                                <text x="0" y="2" fontSize="6" fill="hsl(220, 70%, 70%)" textAnchor="middle">?</text>
                              </>
                            ) : (
                              // Closed door - default
                              <>
                                <rect x="-3" y="-4" width="6" height="8" fill="hsl(35, 50%, 35%)" rx="0.5" />
                                <circle cx="2" cy="0" r="1" fill="hsl(45, 60%, 50%)" />
                              </>
                            )}
                          </g>
                        </>
                      )}

                      {/* Stairs rendering */}
                      {isStairs && (
                        <>
                          <line
                            x1={points.x1} y1={points.y1} x2={points.x2} y2={points.y2}
                            stroke="hsl(40, 30%, 35%)" strokeWidth="4" strokeLinecap="round" className="opacity-70"
                          />
                          <g transform={`translate(${midX}, ${midY})`}>
                            <rect x="-6" y="-6" width="12" height="12" fill="hsl(40, 25%, 20%)" rx="1" className="opacity-90" />
                            {/* Stair steps */}
                            {edgeType.includes('up') ? (
                              <>
                                <rect x="-4" y="2" width="8" height="2" fill="hsl(40, 30%, 40%)" />
                                <rect x="-3" y="0" width="6" height="2" fill="hsl(40, 30%, 45%)" />
                                <rect x="-2" y="-2" width="4" height="2" fill="hsl(40, 30%, 50%)" />
                                <polygon points="0,-5 3,-2 -3,-2" fill="hsl(120, 50%, 50%)" className="opacity-80" />
                              </>
                            ) : (
                              <>
                                <rect x="-2" y="2" width="4" height="2" fill="hsl(40, 30%, 40%)" />
                                <rect x="-3" y="0" width="6" height="2" fill="hsl(40, 30%, 45%)" />
                                <rect x="-4" y="-2" width="8" height="2" fill="hsl(40, 30%, 50%)" />
                                <polygon points="0,5 3,2 -3,2" fill="hsl(0, 50%, 50%)" className="opacity-80" />
                              </>
                            )}
                          </g>
                        </>
                      )}

                      {/* Secret door rendering (only if discovered) */}
                      {isSecret && edge?.isDiscovered && (
                        <>
                          <line
                            x1={points.x1} y1={points.y1} x2={points.x2} y2={points.y2}
                            stroke="hsl(280, 40%, 35%)" strokeWidth="3" strokeLinecap="round"
                            strokeDasharray="4,4" className="opacity-60"
                          />
                          <g transform={`translate(${midX}, ${midY})`}>
                            <circle cx="0" cy="0" r="5" fill="hsl(280, 40%, 20%)" className="opacity-80" />
                            <circle cx="0" cy="0" r="2" fill="hsl(280, 60%, 60%)" className="opacity-70" />
                          </g>
                        </>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Edge tooltip triggers - hoverable areas over edge indicators */}
              {isVisible && tile.edges && tile.edges.map((edge: EdgeData, edgeIndex: number) => {
                const points = HEX_EDGE_POINTS[edgeIndex];
                if (!points) return null;

                const edgeType = edge?.type?.toLowerCase() || '';

                // Skip open/empty edges - no tooltip needed
                if (!edgeType || edgeType === 'open') return null;

                // Calculate midpoint position (in percentage for positioning)
                const midX = ((points.x1 + points.x2) / 2);
                const midY = ((points.y1 + points.y2) / 2);

                return (
                  <EdgeFeatureTooltip key={`edge-tooltip-${edgeIndex}`} edge={edge}>
                    <div
                      className="absolute z-25 cursor-help opacity-0 hover:opacity-100 transition-opacity"
                      style={{
                        left: `${midX}%`,
                        top: `${midY}%`,
                        transform: 'translate(-50%, -50%)',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.1)',
                      }}
                    />
                  </EdgeFeatureTooltip>
                );
              })}
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

        {players.map((player, playerIndex) => {
          if (player.isDead) return null;
          const { x, y } = hexToPixel(player.position.q, player.position.r);
          const portraitUrl = getCharacterPortrait(player.id as CharacterType);

          // Calculate offset for multiple entities on same tile
          const alivePlayers = players.filter(p => !p.isDead);
          const playersAtSamePos = alivePlayers.filter(
            p => p.position.q === player.position.q && p.position.r === player.position.r
          );
          const enemiesAtSamePos = enemies.filter(
            e => e.position.q === player.position.q && e.position.r === player.position.r
          );
          const playerIndexAtPos = playersAtSamePos.findIndex(p => p.id === player.id);
          const offset = calculateCombinedOffset(
            'player',
            playerIndexAtPos,
            playersAtSamePos.length,
            enemiesAtSamePos.length
          );

          return (
            <div key={player.id} className="absolute w-12 h-12 rounded-full border-2 border-foreground shadow-[0_0_25px_rgba(255,255,255,0.4)] flex items-center justify-center bg-card z-30 transition-all duration-500 overflow-hidden" style={{ left: `${x - 24 + offset.x}px`, top: `${y - 24 + offset.y}px` }}>
              <img 
                src={portraitUrl} 
                alt={player.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              <User className="text-foreground absolute opacity-0 peer-error:opacity-100" size={20} />
              <div className="absolute inset-0 bg-accent/20 rounded-full animate-lantern pointer-events-none blur-[24px] scale-[4]" />
              {player.activeMadness && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-sanity border border-foreground rounded-full flex items-center justify-center animate-pulse">
                  <Brain size={10} className="text-foreground" />
                </div>
              )}
            </div>
          );
        })}

        {enemies.map((enemy, enemyIndex) => {
          if (!visibleTiles.has(`${enemy.position.q},${enemy.position.r}`)) return null;
          const { x, y } = hexToPixel(enemy.position.q, enemy.position.r);
          const monsterPortrait = getMonsterPortrait(enemy.type);
          const isSelected = selectedEnemyId === enemy.id;

          // Calculate offset for multiple entities on same tile
          const alivePlayers = players.filter(p => !p.isDead);
          const playersAtSamePos = alivePlayers.filter(
            p => p.position.q === enemy.position.q && p.position.r === enemy.position.r
          );
          const enemiesAtSamePos = enemies.filter(
            e => e.position.q === enemy.position.q && e.position.r === enemy.position.r
          );
          const enemyIndexAtPos = enemiesAtSamePos.findIndex(e => e.id === enemy.id);
          const offset = calculateCombinedOffset(
            'enemy',
            enemyIndexAtPos,
            playersAtSamePos.length,
            enemiesAtSamePos.length
          );

          // Calculate distance from nearest player for weather hiding
          const distanceFromPlayers = alivePlayers.map(p =>
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
                  left: `${x - 28 + offset.x}px`,
                  top: `${y - 28 + offset.y}px`,
                  transform: isSelected ? 'scale(1.2)' : 'scale(1)',
                  opacity: weatherOpacity,
                  filter: isHiddenByWeather ? 'blur(2px)' : 'none'
                }}
                onClick={(e) => { e.stopPropagation(); if (!hasDragged.current && onEnemyClick) onEnemyClick(enemy.id); }}
              >
                <div className={`w-full h-full rounded-full border-2 ${isSelected ? 'border-primary shadow-[var(--shadow-doom)]' : 'border-red-900 shadow-[0_0_20px_rgba(220,38,38,0.3)]'} overflow-hidden relative`}>
                  <img 
                    src={monsterPortrait} 
                    alt={enemy.name}
                    className="w-full h-full object-cover"
                  />
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

        {/* Spell Particle Effects */}
        {spellParticles.map(particle => {
          const startPos = hexToPixel(particle.startQ, particle.startR);
          const hasTarget = particle.targetQ !== undefined && particle.targetR !== undefined;
          const targetPos = hasTarget ? hexToPixel(particle.targetQ!, particle.targetR!) : startPos;

          // Calculate direction vector for projectile particles
          const dx = targetPos.x - startPos.x;
          const dy = targetPos.y - startPos.y;

          // Get particle type class
          const particleTypeClass = {
            wither: 'spell-particle-wither',
            eldritch_bolt: 'spell-particle-eldritch',
            mend_flesh: 'spell-particle-mend',
            true_sight: 'spell-particle-sight',
            banish: 'spell-particle-banish',
            mind_blast: 'spell-particle-mind',
            dark_shield: 'spell-particle-shield',
            explosion: 'spell-particle-banish',
            blood: 'spell-particle-blood',
            smoke: 'spell-particle-smoke',
            sparkle: 'spell-particle-sparkle'
          }[particle.type] || 'spell-particle-sparkle';

          const sizeClass = `spell-particle-${particle.size}`;

          // Get animation class based on spell type
          const getAnimationClass = () => {
            switch (particle.type) {
              case 'wither': return 'animate-wither-projectile';
              case 'eldritch_bolt': return 'animate-eldritch-bolt';
              case 'mend_flesh': return 'animate-mend-sparkle';
              case 'true_sight': return 'animate-true-sight-radiate';
              case 'banish': return 'animate-banish-vortex';
              case 'mind_blast': return 'animate-mind-blast-wave';
              case 'dark_shield': return 'animate-dark-shield-orbit';
              case 'explosion': return 'animate-explosion-burst';
              case 'blood': return 'animate-blood-splatter';
              case 'smoke': return 'animate-smoke-rise';
              case 'sparkle': return 'animate-sparkle-twinkle';
              default: return 'animate-sparkle-twinkle';
            }
          };

          // Generate multiple particles for the effect
          return Array.from({ length: particle.count }).map((_, index) => {
            // Randomize particle positions and trajectories
            const angle = (index / particle.count) * Math.PI * 2;
            const spreadRadius = 30 + Math.random() * 20;
            const randomDelay = Math.random() * 200;

            // Calculate individual particle offset
            let offsetX, offsetY;
            if (particle.animation === 'projectile' && hasTarget) {
              // Projectile: slight spread along the path
              const spread = (Math.random() - 0.5) * 20;
              offsetX = spread;
              offsetY = spread;
            } else if (particle.animation === 'radiate') {
              // Radiate: spread outward from center
              offsetX = Math.cos(angle) * spreadRadius;
              offsetY = Math.sin(angle) * spreadRadius;
            } else if (particle.animation === 'implode') {
              // Implode: start spread out, move to center
              offsetX = Math.cos(angle) * spreadRadius;
              offsetY = Math.sin(angle) * spreadRadius;
            } else if (particle.animation === 'orbit') {
              // Orbit: circular path around center
              offsetX = Math.cos(angle + index * 0.5) * 40;
              offsetY = Math.sin(angle + index * 0.5) * 40;
            } else {
              // Burst: random spread
              offsetX = (Math.random() - 0.5) * 60;
              offsetY = (Math.random() - 0.5) * 60;
            }

            return (
              <div
                key={`${particle.id}-${index}`}
                className={`spell-particle ${particleTypeClass} ${sizeClass} ${getAnimationClass()}`}
                style={{
                  left: `${startPos.x + 50}px`,
                  top: `${startPos.y + 50}px`,
                  zIndex: 70,
                  '--tx': `${hasTarget ? dx : offsetX}px`,
                  '--ty': `${hasTarget ? dy : offsetY}px`,
                  '--duration': `${particle.duration}ms`,
                  animationDelay: `${randomDelay}ms`,
                  animationDuration: `${particle.duration}ms`
                } as React.CSSProperties}
              />
            );
          });
        })}
      </div>
    </div>
  );
};

export default GameBoard;
