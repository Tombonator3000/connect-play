/**
 * PREVIEW PANEL - Quest Editor Preview/Test Mode
 *
 * Full game-like preview with AI-generated tile graphics.
 * Features:
 * - AI tile images matching the main game
 * - Pan & zoom with mouse/touch
 * - Simulated player movement
 * - Monster/item visualization
 * - Objective tracking
 * - Fog of war toggle
 */

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { X, Eye, EyeOff, Play, RotateCcw, ChevronLeft, Target, Skull, Package, AlertTriangle, CheckCircle2, Circle, ZoomIn, ZoomOut, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EditorTile, ScenarioMetadata, DoorConfig } from './index';
import { EditorObjective } from './ObjectivesPanel';
import { ConnectionEdgeType } from '../../tileConnectionSystem';

// Import AI-generated tile images (same as GameBoard)
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

// ============================================================================
// TILE IMAGE MAPPING (same as GameBoard)
// ============================================================================

const TILE_IMAGES: Record<string, string> = {
  library: tileLibrary, study: tileLibrary, reading: tileLibrary, archive: tileLibrary, orne: tileLibrary,
  church: tileChurch, chapel: tileChurch, shrine: tileChurch, narthex: tileChurch,
  dock: tileDock, pier: tileDock, harbor: tileDock, wharf: tileDock, waterfront: tileDock, innsmouth: tileDock,
  square: tileSquare, plaza: tileSquare, courtyard: tileSquare, founders: tileSquare,
  graveyard: tileGraveyard, cemetery: tileGraveyard, burial: tileGraveyard,
  hallway: tileHallway, corridor: tileHallway, passage: tileHallway, stair: tileHallway, landing: tileHallway, spiral: tileHallway, rickety: tileHallway, crumbling: tileHallway,
  alley: tileAlley, lane: tileAlley, back: tileAlley, narrows: tileAlley,
  crypt: tileCrypt, vault: tileCrypt, ossuary: tileCrypt, catacomb: tileCrypt,
  station: tileStation, train: tileStation, platform: tileStation, tram: tileStation, rail: tileStation,
  police: tilePolice, precinct: tilePolice, jail: tilePolice,
  museum: tileMuseum, exhibit: tileMuseum,
  hospital: tileHospital, ward: tileHospital, morgue: tileHospital, medical: tileHospital, charity: tileHospital,
  asylum: tileAsylum, padded: tileAsylum, cell: tileAsylum,
  street: tileStreet, road: tileStreet, cobblestone: tileStreet, avenue: tileStreet,
  manor: tileManor, mansion: tileManor, foyer: tileManor, lobby: tileManor, vestibule: tileManor, atrium: tileManor, blackwood: tileManor,
  cellar: tileCellar, basement: tileCellar, storage: tileCellar, cold: tileCellar, flooded: tileCellar, coal: tileCellar, root: tileCellar, maintenance: tileCellar, smuggler: tileCellar,
  forest: tileForest, woods: tileForest, clearing: tileForest, grove: tileForest, hollow: tileForest, whispering: tileForest,
  ritual: tileRitual, altar: tileRitual, sacrific: tileRitual, occult: tileRitual, pentagram: tileRitual,
  warehouse: tileWarehouse, factory: tileWarehouse, industrial: tileWarehouse, derelict: tileWarehouse,
  hotel: tileHotel, inn: tileHotel, silver: tileHotel, gilded: tileHotel,
  lab: tileLab, laboratory: tileLab, dissection: tileLab, hidden: tileLab,
  bedroom: tileBedroom, bed: tileBedroom, sleep: tileBedroom, guest: tileBedroom, quarters: tileBedroom,
  sewer: tileSewer, tunnel: tileSewer, drain: tileSewer, storm: tileSewer,
  swamp: tileSwamp, marsh: tileSwamp, bog: tileSwamp, moor: tileSwamp, treacherous: tileSwamp,
  lighthouse: tileLighthouse, coast: tileLighthouse, cliff: tileLighthouse, suicide: tileLighthouse,
  market: tileMarket, fish: tileMarket, merchant: tileMarket,
  shop: tileShop, antique: tileShop, dusty: tileShop,
  campus: tileCampus, university: tileCampus, faculty: tileCampus, miskatonic: tileCampus,
  cave: tileCave, cavern: tileCave, ancient: tileCave,
  bridge: tileBridge, crossing: tileBridge, overpass: tileBridge, iron: tileBridge,
  kitchen: tileKitchen, dining: tileKitchen, pantry: tileKitchen,
  park: tilePark, garden: tilePark, pond: tilePark,
  parlor: tileParlor, sitting: tileParlor,
  nursery: tileNursery,
  music: tileMusic, ballroom: tileMusic,
  conservatory: tileConservatory, greenhouse: tileConservatory,
  billiard: tileBilliard, game: tileBilliard,
  trophy: tileTrophy, hunting: tileTrophy,
  drawing: tileDrawing, art: tileDrawing,
  office: tileOffice, desk: tileOffice,
  boiler: tileBoiler, furnace: tileBoiler,
  tomb: tileTomb, mausoleum: tileTomb,
  lake: tileUndergroundLake, underground: tileUndergroundLake,
  portal: tilePortal, gateway: tilePortal,
  sanctum: tileSanctum, inner: tileSanctum,
  courthouse: tileCourthouse, court: tileCourthouse,
  newspaper: tileNewspaper, press: tileNewspaper,
  shipyard: tileShipyard, drydock: tileShipyard,
  gasworks: tileGasworks, gas: tileGasworks,
  cannery: tileCannery, processing: tileCannery,
  crossroads: tileCrossroads, intersection: tileCrossroads,
  deadend: tileDeadend, dead: tileDeadend,
  funeral: tileFuneral, mortuary: tileFuneral,
  well: tileWell, cistern: tileWell,
  gallows: tileGallows, gibbet: tileGallows, execution: tileGallows,
  quarry: tileQuarry,
  campsite: tileCampsite,
  shack: tileShack, hermit: tileShack,
  farmhouse: tileFarmhouse, farm: tileFarmhouse, field: tileFarmhouse,
  hangingtree: tileHangingtree, hanging: tileHangingtree,
  stonecircle: tileStonecircle, standing: tileStonecircle,
  orchard: tileOrchard, blighted: tileOrchard,
  ruins: tileRuins, overgrown: tileRuins,
  mine: tileMine, collapsed: tileMine,
  stagnant: tilePond,
  tenement: tileTenement, condemned: tileTenement, immigrant: tileTenement,
  witch: tileWitchhouse,
  bell: tileBelltower, tower: tileBelltower,
  gallery: tileGallery, portrait: tileGallery,
  records: tileRecords, filing: tileRecords,
  map: tileMaproom, nautical: tileMaproom,
  smoking: tileSmoking, cigar: tileSmoking,
  servants: tileServants, servant: tileServants,
  closet: tileCloset, linen: tileCloset,
  gate: tileGate,
  riverfront: tileRiverfront, river: tileRiverfront,
  fire: tileFireescape, escape: tileFireescape, emergency: tileFireescape,
  star: tileStarchamber, chamber: tileStarchamber, astronomical: tileStarchamber,
  mass: tileMassgrave, grave: tileMassgrave,
  idol: tileIdol,
  blackpool: tileBlackpool,
  echo: tileEcho,
  petrified: tilePetrified,
  townhouse: tileManor, reception: tileManor,
  service: tileHallway, floor: tileHallway,
  tasting: tileCellar, rats: tileSewer, pit: tileCrypt,
  devils: tileGraveyard, boathouse: tileDock, tide: tileDock,
  sentinel: tileForest, shore: tileDock, workshop: tileCellar,
  prison: tileCrypt, observatory: tileStarchamber, pawn: tileShop,
  arms: tileHotel, attic: tileManor, bathroom: tileHospital,
  apartment: tileTenement, junction: tileHallway, almshouse: tileTenement,
  stalls: tileMarket, fountain: tileSquare, corner: tileStreet,
  deserted: tileStreet, shrouded: tileForest, rocky: tileDock,
  fetid: tileSwamp, curious: tileShop, ice: tileCellar, midnight: tileShop
};

const getTileImage = (tileName: string): string | null => {
  const nameLower = tileName.toLowerCase();
  for (const [key, image] of Object.entries(TILE_IMAGES)) {
    if (nameLower.includes(key)) {
      return image;
    }
  }
  return null;
};

// ============================================================================
// TYPES
// ============================================================================

interface PreviewPanelProps {
  tiles: Map<string, EditorTile>;
  objectives: EditorObjective[];
  metadata: ScenarioMetadata;
  onClose: () => void;
}

interface PreviewTile {
  id: string;
  q: number;
  r: number;
  name: string;
  category: string;
  edges: ConnectionEdgeType[];
  doorConfigs?: { [key: number]: DoorConfig };
  floorType: string;
  description?: string;
  customDescription?: string;
  isStartLocation?: boolean;
  monsters?: { type: string; count: number }[];
  items?: { id: string; name: string; type: string }[];
  npcs?: { id: string; type: string; name: string }[];
  isVisible: boolean;
  isExplored: boolean;
  watermarkIcon?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const HEX_SIZE = 95; // Same as main game
const DRAG_THRESHOLD = 15;
const TAP_TIME_THRESHOLD = 350;

// Hex neighbor directions (flat-top hexagon)
const HEX_NEIGHBORS = [
  { q: 1, r: 0 },   // East
  { q: 0, r: 1 },   // Southeast
  { q: -1, r: 1 },  // Southwest
  { q: -1, r: 0 },  // West
  { q: 0, r: -1 },  // Northwest
  { q: 1, r: -1 },  // Northeast
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function hexToPixel(q: number, r: number): { x: number; y: number } {
  const x = HEX_SIZE * (3 / 2 * q);
  const y = HEX_SIZE * (Math.sqrt(3) / 2 * q + Math.sqrt(3) * r);
  return { x, y };
}

function getHexNeighborCoord(q: number, r: number, direction: number): { q: number; r: number } {
  const dir = HEX_NEIGHBORS[direction];
  return { q: q + dir.q, r: r + dir.r };
}

// ============================================================================
// PREVIEW PANEL COMPONENT
// ============================================================================

const PreviewPanel: React.FC<PreviewPanelProps> = ({
  tiles,
  objectives,
  metadata,
  onClose,
}) => {
  // State
  const containerRef = useRef<HTMLDivElement>(null);
  const [playerPosition, setPlayerPosition] = useState<{ q: number; r: number } | null>(null);
  const [showFogOfWar, setShowFogOfWar] = useState(true);
  const [exploredTiles, setExploredTiles] = useState<Set<string>>(new Set());
  const [collectedItems, setCollectedItems] = useState<Set<string>>(new Set());
  const [defeatedMonsters, setDefeatedMonsters] = useState<Set<string>>(new Set());
  const [currentDoom, setCurrentDoom] = useState(metadata.startDoom);
  const [moveHistory, setMoveHistory] = useState<{ q: number; r: number }[]>([]);
  const [showBriefing, setShowBriefing] = useState(true);

  // Pan & zoom state
  const [scale, setScale] = useState(0.7);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragStartRaw, setDragStartRaw] = useState({ x: 0, y: 0 });
  const hasDragged = useRef(false);
  const touchStartTime = useRef<number>(0);

  // Find start location
  const startLocation = useMemo(() => {
    for (const tile of tiles.values()) {
      if (tile.isStartLocation) {
        return { q: tile.q, r: tile.r };
      }
    }
    const firstTile = tiles.values().next().value;
    return firstTile ? { q: firstTile.q, r: firstTile.r } : { q: 0, r: 0 };
  }, [tiles]);

  // Initialize player position and center view
  useEffect(() => {
    if (!playerPosition && startLocation && containerRef.current) {
      setPlayerPosition(startLocation);
      setExploredTiles(new Set([`${startLocation.q},${startLocation.r}`]));
      setMoveHistory([startLocation]);

      // Center view on start location
      const { width, height } = containerRef.current.getBoundingClientRect();
      const startPixel = hexToPixel(startLocation.q, startLocation.r);
      setPosition({
        x: width / 2 - startPixel.x * scale,
        y: height / 2 - startPixel.y * scale
      });
    }
  }, [startLocation, playerPosition, scale]);

  // Convert editor tiles to preview tiles
  const previewTiles = useMemo((): Map<string, PreviewTile> => {
    const result = new Map<string, PreviewTile>();

    for (const [key, tile] of tiles) {
      const isVisible = !showFogOfWar || exploredTiles.has(key);
      const isAdjacent = !showFogOfWar || (playerPosition && isAdjacentToPlayer(tile.q, tile.r, playerPosition));

      result.set(key, {
        id: tile.id,
        q: tile.q,
        r: tile.r,
        name: tile.name,
        category: tile.category,
        edges: tile.edges,
        doorConfigs: tile.doorConfigs,
        floorType: tile.floorType,
        description: tile.description,
        customDescription: tile.customDescription,
        isStartLocation: tile.isStartLocation,
        monsters: tile.monsters,
        items: tile.items,
        npcs: tile.npcs,
        isVisible: isVisible || isAdjacent,
        isExplored: exploredTiles.has(key),
        watermarkIcon: tile.watermarkIcon,
      });
    }

    return result;
  }, [tiles, showFogOfWar, exploredTiles, playerPosition]);

  // Check if a position is adjacent to player
  function isAdjacentToPlayer(q: number, r: number, pos: { q: number; r: number }): boolean {
    for (let i = 0; i < 6; i++) {
      const neighbor = getHexNeighborCoord(pos.q, pos.r, i);
      if (neighbor.q === q && neighbor.r === r) return true;
    }
    return false;
  }

  // Find direction from current to target tile
  function findDirection(fromQ: number, fromR: number, toQ: number, toR: number): number {
    for (let i = 0; i < 6; i++) {
      const neighbor = getHexNeighborCoord(fromQ, fromR, i);
      if (neighbor.q === toQ && neighbor.r === toR) return i;
    }
    return -1;
  }

  // Check if player can move to a tile
  const canMoveTo = useCallback((targetQ: number, targetR: number): boolean => {
    if (!playerPosition) return false;

    const currentTile = tiles.get(`${playerPosition.q},${playerPosition.r}`);
    const targetTile = tiles.get(`${targetQ},${targetR}`);

    if (!currentTile || !targetTile) return false;

    const direction = findDirection(playerPosition.q, playerPosition.r, targetQ, targetR);
    if (direction === -1) return false;

    const edge = currentTile.edges[direction];
    if (edge === 'WALL') return false;
    if (edge === 'DOOR') {
      const doorConfig = currentTile.doorConfigs?.[direction];
      if (doorConfig?.state === 'locked' || doorConfig?.state === 'sealed') {
        return false;
      }
    }
    return edge === 'OPEN' || edge === 'DOOR' || edge === 'STAIRS_UP' || edge === 'STAIRS_DOWN' || edge === 'WINDOW';
  }, [playerPosition, tiles]);

  // Handle tile click for movement
  const handleTileClick = useCallback((q: number, r: number) => {
    if (!playerPosition || hasDragged.current) return;

    if (q === playerPosition.q && r === playerPosition.r) return;

    if (canMoveTo(q, r)) {
      setPlayerPosition({ q, r });
      setExploredTiles(prev => new Set([...prev, `${q},${r}`]));
      setMoveHistory(prev => [...prev, { q, r }]);
      setCurrentDoom(prev => Math.max(0, prev - 1));
    }
  }, [playerPosition, canMoveTo]);

  // Reset preview
  const handleReset = useCallback(() => {
    setPlayerPosition(startLocation);
    setExploredTiles(new Set([`${startLocation.q},${startLocation.r}`]));
    setMoveHistory([startLocation]);
    setCurrentDoom(metadata.startDoom);
    setCollectedItems(new Set());
    setDefeatedMonsters(new Set());
    setShowBriefing(true);
  }, [startLocation, metadata.startDoom]);

  // Undo last move
  const handleUndo = useCallback(() => {
    if (moveHistory.length > 1) {
      const newHistory = [...moveHistory];
      newHistory.pop();
      const prevPos = newHistory[newHistory.length - 1];
      setPlayerPosition(prevPos);
      setMoveHistory(newHistory);
      setCurrentDoom(prev => Math.min(metadata.startDoom, prev + 1));
    }
  }, [moveHistory, metadata.startDoom]);

  // Mouse handlers for pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    setDragStartRaw({ x: e.clientX, y: e.clientY });
    hasDragged.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    if (Math.hypot(e.clientX - dragStartRaw.x, e.clientY - dragStartRaw.y) > DRAG_THRESHOLD) {
      hasDragged.current = true;
    }
    setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - position.x, y: e.touches[0].clientY - position.y });
      setDragStartRaw({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      hasDragged.current = false;
      touchStartTime.current = Date.now();
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      const touch = e.touches[0];
      if (Math.hypot(touch.clientX - dragStartRaw.x, touch.clientY - dragStartRaw.y) > DRAG_THRESHOLD) {
        hasDragged.current = true;
      }
      setPosition({ x: touch.clientX - dragStart.x, y: touch.clientY - dragStart.y });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Zoom with buttons
  const handleZoomIn = () => setScale(prev => Math.min(prev * 1.2, 2));
  const handleZoomOut = () => setScale(prev => Math.max(prev / 1.2, 0.3));

  // Wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.min(Math.max(prev * delta, 0.3), 2));
  }, []);

  // Calculate objective progress
  const objectiveProgress = useMemo(() => {
    return objectives.map(obj => {
      let completed = false;
      let progress = '';

      switch (obj.type) {
        case 'explore':
          const totalTiles = tiles.size;
          const explored = exploredTiles.size;
          completed = explored >= totalTiles;
          progress = `${explored}/${totalTiles} tiles`;
          break;
        case 'collect':
          const targetCount = obj.targetAmount || 1;
          const collected = collectedItems.size;
          completed = collected >= targetCount;
          progress = `${collected}/${targetCount}`;
          break;
        case 'kill_enemies':
          const enemyCount = obj.targetAmount || 1;
          completed = defeatedMonsters.size >= enemyCount;
          progress = `${defeatedMonsters.size}/${enemyCount}`;
          break;
        case 'escape':
          const exitTile = Array.from(tiles.values()).find(t =>
            t.edges.includes('STAIRS_DOWN') || t.edges.includes('STAIRS_UP')
          );
          if (exitTile && playerPosition) {
            completed = exitTile.q === playerPosition.q && exitTile.r === playerPosition.r;
          }
          break;
        case 'survive':
          const rounds = obj.targetAmount || 5;
          const survived = metadata.startDoom - currentDoom;
          completed = survived >= rounds;
          progress = `${survived}/${rounds} rounds`;
          break;
        default:
          break;
      }

      return { ...obj, completed, progress };
    });
  }, [objectives, tiles, exploredTiles, collectedItems, defeatedMonsters, playerPosition, currentDoom, metadata.startDoom]);

  // Current tile info
  const currentTile = playerPosition ? tiles.get(`${playerPosition.q},${playerPosition.r}`) : null;

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col">
      {/* Header */}
      <div className="h-14 bg-slate-800 border-b border-slate-700 flex items-center px-4 gap-4 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-slate-300 hover:text-white"
        >
          <X className="w-4 h-4 mr-2" />
          Close Preview
        </Button>

        <div className="h-6 w-px bg-slate-600" />

        <h2 className="text-white font-semibold flex-1">
          <Play className="w-4 h-4 inline mr-2 text-green-400" />
          Preview: {metadata.title}
        </h2>

        {/* Doom counter */}
        <div className="flex items-center gap-2 bg-red-900/50 px-3 py-1 rounded">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <span className="text-red-400 font-mono">DOOM: {currentDoom}</span>
        </div>

        <div className="h-6 w-px bg-slate-600" />

        {/* Zoom controls */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={handleZoomOut} className="text-slate-300 hover:text-white">
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-slate-400 text-xs w-12 text-center">{Math.round(scale * 100)}%</span>
          <Button variant="ghost" size="sm" onClick={handleZoomIn} className="text-slate-300 hover:text-white">
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>

        <div className="h-6 w-px bg-slate-600" />

        {/* Controls */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowFogOfWar(!showFogOfWar)}
          className={`${showFogOfWar ? 'text-amber-400' : 'text-slate-300'} hover:text-white`}
          title={showFogOfWar ? 'Show all tiles' : 'Enable fog of war'}
        >
          {showFogOfWar ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleUndo}
          disabled={moveHistory.length <= 1}
          className="text-slate-300 hover:text-white disabled:opacity-50"
          title="Undo last move"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="text-slate-300 hover:text-white"
          title="Reset preview"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar - Objectives */}
        <div className="w-72 bg-slate-800 border-r border-slate-700 p-4 overflow-y-auto">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-purple-400" />
            Objectives
          </h3>

          <div className="space-y-2">
            {objectiveProgress.map((obj) => (
              <div
                key={obj.id}
                className={`p-2 rounded border ${
                  obj.completed
                    ? 'bg-green-900/30 border-green-700'
                    : obj.isRequired
                    ? 'bg-slate-700/50 border-amber-600/50'
                    : 'bg-slate-700/30 border-slate-600'
                }`}
              >
                <div className="flex items-start gap-2">
                  {obj.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm ${obj.completed ? 'text-green-300 line-through' : 'text-white'}`}>
                      {obj.description}
                    </div>
                    {obj.progress && (
                      <div className="text-xs text-slate-400 mt-1">{obj.progress}</div>
                    )}
                    {obj.isRequired && !obj.completed && (
                      <div className="text-xs text-amber-400 mt-1">Required</div>
                    )}
                    {obj.isBonus && (
                      <div className="text-xs text-purple-400 mt-1">Bonus</div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {objectives.length === 0 && (
              <div className="text-slate-500 text-sm italic">No objectives defined</div>
            )}
          </div>

          {/* Stats */}
          <div className="mt-6 pt-4 border-t border-slate-600">
            <h4 className="text-slate-400 text-xs uppercase mb-2">Preview Stats</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-slate-700/50 p-2 rounded">
                <div className="text-slate-400 text-xs">Tiles Explored</div>
                <div className="text-white">{exploredTiles.size} / {tiles.size}</div>
              </div>
              <div className="bg-slate-700/50 p-2 rounded">
                <div className="text-slate-400 text-xs">Moves Made</div>
                <div className="text-white">{moveHistory.length - 1}</div>
              </div>
            </div>
          </div>

          {/* Current tile info */}
          {currentTile && (
            <div className="mt-4 pt-4 border-t border-slate-600">
              <h4 className="text-slate-400 text-xs uppercase mb-2">Current Location</h4>
              <div className="bg-slate-700/50 p-3 rounded">
                <div className="text-white font-medium">{currentTile.name}</div>
                <div className="text-slate-400 text-xs capitalize mt-1">{currentTile.category}</div>
                {(currentTile.customDescription || currentTile.description) && (
                  <div className="text-slate-300 text-sm mt-2 italic">
                    "{currentTile.customDescription || currentTile.description}"
                  </div>
                )}
                {currentTile.monsters && currentTile.monsters.length > 0 && (
                  <div className="mt-2 flex items-center gap-1 text-red-400 text-sm">
                    <Skull className="w-3 h-3" />
                    {currentTile.monsters.map(m => `${m.count}x ${m.type}`).join(', ')}
                  </div>
                )}
                {currentTile.items && currentTile.items.length > 0 && (
                  <div className="mt-1 flex items-center gap-1 text-green-400 text-sm">
                    <Package className="w-3 h-3" />
                    {currentTile.items.map(i => i.name).join(', ')}
                  </div>
                )}
                {currentTile.npcs && currentTile.npcs.length > 0 && (
                  <div className="mt-1 flex items-center gap-1 text-cyan-400 text-sm">
                    <Users className="w-3 h-3" />
                    {currentTile.npcs.map(n => n.name).join(', ')}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Center - Map with real tile graphics */}
        <div
          ref={containerRef}
          className="flex-1 relative overflow-hidden bg-slate-900 cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
        >
          {/* Briefing overlay */}
          {showBriefing && metadata.briefing && (
            <div className="absolute inset-0 bg-black/80 z-20 flex items-center justify-center p-8">
              <div className="max-w-lg bg-slate-800 rounded-lg p-6 border border-amber-600/50">
                <h3 className="text-amber-400 text-xl font-serif mb-4">{metadata.title}</h3>
                <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                  {metadata.briefing}
                </p>
                <Button
                  onClick={() => setShowBriefing(false)}
                  className="mt-6 w-full bg-amber-600 hover:bg-amber-700"
                >
                  Begin Investigation
                </Button>
              </div>
            </div>
          )}

          {/* Tile container with transform */}
          <div
            className="absolute"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transformOrigin: '0 0',
            }}
          >
            {Array.from(previewTiles.values()).map(tile => {
              const { x, y } = hexToPixel(tile.q, tile.r);
              const isPlayerHere = playerPosition?.q === tile.q && playerPosition?.r === tile.r;
              const isClickable = playerPosition && isAdjacentToPlayer(tile.q, tile.r, playerPosition) && canMoveTo(tile.q, tile.r);
              const tileImage = getTileImage(tile.name);

              return (
                <div
                  key={tile.id}
                  className={`absolute transition-all duration-150 ${isClickable ? 'cursor-pointer' : ''}`}
                  style={{
                    left: x - HEX_SIZE / 2,
                    top: y - HEX_SIZE / 2,
                    width: HEX_SIZE,
                    height: HEX_SIZE,
                  }}
                  onClick={() => handleTileClick(tile.q, tile.r)}
                >
                  {/* Hexagonal tile with clipping */}
                  <div
                    className={`absolute inset-0 hex-clip overflow-hidden transition-all duration-150 ${
                      isPlayerHere ? 'ring-4 ring-amber-400 ring-offset-2 ring-offset-slate-900' : ''
                    } ${isClickable ? 'ring-2 ring-blue-400/60 hover:ring-blue-400 hover:brightness-125' : ''}`}
                    style={{
                      clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
                      opacity: tile.isVisible ? (tile.isExplored ? 1 : 0.6) : 0.2,
                    }}
                  >
                    {/* Tile image or fallback color */}
                    {tileImage ? (
                      <img
                        src={tileImage}
                        alt={tile.name}
                        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                        draggable={false}
                      />
                    ) : (
                      <div
                        className="absolute inset-0"
                        style={{ backgroundColor: getFloorColor(tile.floorType) }}
                      />
                    )}

                    {/* Fog overlay for unexplored */}
                    {!tile.isExplored && tile.isVisible && (
                      <div className="absolute inset-0 bg-black/40 pointer-events-none" />
                    )}
                  </div>

                  {/* Edge indicators */}
                  {tile.isVisible && tile.edges.map((edge, i) => {
                    if (edge === 'OPEN') return null;
                    const edgeStyle = getEdgeStyle(edge, tile.doorConfigs?.[i]);
                    if (!edgeStyle) return null;

                    const angle = i * 60 - 30;
                    return (
                      <div
                        key={i}
                        className="absolute pointer-events-none"
                        style={{
                          left: '50%',
                          top: '50%',
                          width: HEX_SIZE * 0.45,
                          height: 4,
                          backgroundColor: edgeStyle.color,
                          transformOrigin: 'left center',
                          transform: `rotate(${angle}deg) translateY(-50%)`,
                          boxShadow: edgeStyle.glow,
                        }}
                      />
                    );
                  })}

                  {/* Tile name label */}
                  {tile.isVisible && (
                    <div className="absolute inset-0 flex items-end justify-center pb-1 pointer-events-none">
                      <span className="text-[8px] text-white/80 font-medium bg-black/50 px-1 rounded truncate max-w-[80%]">
                        {tile.name.length > 14 ? tile.name.slice(0, 12) + '...' : tile.name}
                      </span>
                    </div>
                  )}

                  {/* Content indicators */}
                  {tile.isVisible && (
                    <div className="absolute top-1 right-1 flex flex-col gap-1 pointer-events-none">
                      {/* Start location */}
                      {tile.isStartLocation && (
                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-[10px] text-white font-bold shadow-lg">
                          S
                        </div>
                      )}

                      {/* Monster indicator */}
                      {tile.monsters && tile.monsters.length > 0 && (
                        <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
                          <span className="text-[10px] text-white font-bold">
                            {tile.monsters.reduce((sum, m) => sum + m.count, 0)}
                          </span>
                        </div>
                      )}

                      {/* Item indicator */}
                      {tile.items && tile.items.length > 0 && (
                        <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center shadow-lg">
                          <span className="text-[10px] text-white font-bold">{tile.items.length}</span>
                        </div>
                      )}

                      {/* NPC indicator */}
                      {tile.npcs && tile.npcs.length > 0 && (
                        <div className="w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center shadow-lg">
                          <span className="text-[10px] text-white font-bold">{tile.npcs.length}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Player marker */}
                  {isPlayerHere && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-10 h-10 rounded-full bg-amber-500 border-3 border-amber-300 flex items-center justify-center shadow-lg animate-pulse">
                        <span className="text-lg">🔍</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Instructions */}
          <div className="absolute bottom-4 left-4 bg-slate-800/90 px-4 py-2 rounded text-sm text-slate-300">
            Click adjacent tiles to move • Blue highlight = valid move • Scroll to zoom • Drag to pan
          </div>
        </div>

        {/* Right sidebar - Legend */}
        <div className="w-56 bg-slate-800 border-l border-slate-700 p-4 overflow-y-auto">
          <h3 className="text-white font-semibold mb-3">Legend</h3>

          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-amber-500" />
              <span className="text-slate-300">Player Position</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500" />
              <span className="text-slate-300">Start Location</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-600" />
              <span className="text-slate-300">Monsters</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-600" />
              <span className="text-slate-300">Items</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-cyan-500" />
              <span className="text-slate-300">NPCs</span>
            </div>

            <div className="border-t border-slate-600 pt-3 mt-3">
              <h4 className="text-slate-400 text-xs uppercase mb-2">Edge Types</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-1 bg-gray-500" />
                  <span className="text-slate-400 text-xs">Wall</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-1 bg-amber-700" />
                  <span className="text-slate-400 text-xs">Door</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-1 bg-red-500" />
                  <span className="text-slate-400 text-xs">Locked Door</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-1 bg-purple-500" />
                  <span className="text-slate-400 text-xs">Stairs</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-1 bg-blue-400" />
                  <span className="text-slate-400 text-xs">Window</span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-600 pt-3 mt-3">
              <h4 className="text-slate-400 text-xs uppercase mb-2">Controls</h4>
              <div className="text-slate-400 text-xs space-y-1">
                <div>• Click adjacent tile to move</div>
                <div>• Drag to pan the map</div>
                <div>• Scroll or +/- to zoom</div>
                <div>• Eye icon toggles fog</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions
function getFloorColor(floorType: string): string {
  const colors: Record<string, string> = {
    wood: '#8B4513',
    cobblestone: '#696969',
    tile: '#A9A9A9',
    stone: '#4a4a5a',
    grass: '#228B22',
    dirt: '#8B7355',
    water: '#1E3A5F',
    ritual: '#4B0082',
    carpet: '#8B0000',
    marble: '#F5F5F5',
  };
  return colors[floorType] || colors.stone;
}

function getEdgeStyle(edge: ConnectionEdgeType, doorConfig?: DoorConfig): { color: string; glow?: string } | null {
  switch (edge) {
    case 'WALL':
      return { color: '#6b7280' };
    case 'DOOR':
      if (doorConfig?.state === 'locked' || doorConfig?.state === 'sealed') {
        return { color: '#ef4444', glow: '0 0 6px #ef4444' };
      }
      return { color: '#92400e' };
    case 'WINDOW':
      return { color: '#60a5fa' };
    case 'STAIRS_UP':
    case 'STAIRS_DOWN':
      return { color: '#8b5cf6', glow: '0 0 6px #8b5cf6' };
    default:
      return null;
  }
}

export default PreviewPanel;
