/**
 * Tile Image Assets Module
 *
 * This module centralizes all tile image imports and the mapping logic
 * that was previously embedded in GameBoard.tsx (~530 lines).
 *
 * REFACTORED: Extracted from GameBoard.tsx for better maintainability
 * and separation of concerns.
 *
 * Usage:
 *   import { getTileImage, TILE_IMAGES } from './utils/tileImageAssets';
 *   const image = getTileImage("Miskatonic Library");
 */

// ============================================================================
// TILE IMAGE IMPORTS
// ============================================================================

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
// New tiles 2026-01-28
import tileGrandfoyer from '@/assets/tiles/tile-grandfoyer.png';
import tilePaddedcell from '@/assets/tiles/tile-paddedcell.png';
import tileDissectiontheater from '@/assets/tiles/tile-dissectiontheater.png';
import tileFloodedbasement from '@/assets/tiles/tile-floodedbasement.png';
import tileOssuary from '@/assets/tiles/tile-ossuary.png';
import tileVault from '@/assets/tiles/tile-vault.png';
import tileMaintenancetunnel from '@/assets/tiles/tile-maintenancetunnel.png';
import tileCavern from '@/assets/tiles/tile-cavern.png';
import tilePit from '@/assets/tiles/tile-pit.png';
import tileMoor from '@/assets/tiles/tile-moor.png';
import tileInnsmouthwharf from '@/assets/tiles/tile-innsmouthwharf.png';
import tileIndustrial from '@/assets/tiles/tile-industrial.png';
import tileGibbet from '@/assets/tiles/tile-gibbet.png';
import tilePortraitgallery from '@/assets/tiles/tile-portraitgallery.png';
import tileStormdrain from '@/assets/tiles/tile-stormdrain.png';

// ============================================================================
// TILE NAME TO IMAGE MAPPING
// ============================================================================

/**
 * Maps tile name keywords to their corresponding image assets.
 * The lookup is case-insensitive and uses substring matching.
 *
 * Organization:
 * - Grouped by category (Libraries, Churches, Water, etc.)
 * - Multiple keywords can map to the same image
 * - Order matters for substring matching - more specific first
 */
export const TILE_IMAGES: Record<string, string> = {
  // ===== LIBRARIES AND STUDIES =====
  library: tileLibrary,
  study: tileLibrary,
  reading: tileLibrary,
  archive: tileLibrary,
  orne: tileLibrary,

  // ===== CHURCHES AND RELIGIOUS =====
  church: tileChurch,
  chapel: tileChurch,
  shrine: tileChurch,
  narthex: tileChurch,

  // ===== DOCKS AND WATER =====
  dock: tileDock,
  pier: tileDock,
  harbor: tileDock,
  wharf: tileInnsmouthwharf,
  innsmouthwharf: tileInnsmouthwharf,
  waterfront: tileDock,
  innsmouth: tileInnsmouthwharf,

  // ===== TOWN SQUARES =====
  square: tileSquare,
  plaza: tileSquare,
  courtyard: tileSquare,
  founders: tileSquare,

  // ===== GRAVEYARD AND CEMETERY =====
  graveyard: tileGraveyard,
  cemetery: tileGraveyard,
  burial: tileGraveyard,

  // ===== HALLWAYS AND CORRIDORS =====
  hallway: tileHallway,
  corridor: tileHallway,
  passage: tileHallway,
  stair: tileHallway,
  landing: tileHallway,
  spiral: tileHallway,
  rickety: tileHallway,
  crumbling: tileHallway,

  // ===== ALLEYS =====
  alley: tileAlley,
  lane: tileAlley,
  back: tileAlley,
  narrows: tileAlley,

  // ===== CRYPTS AND UNDERGROUND =====
  crypt: tileCrypt,
  vault: tileVault,
  ossuary: tileOssuary,
  catacomb: tileCrypt,
  pit: tilePit,

  // ===== TRAIN STATION =====
  station: tileStation,
  train: tileStation,
  platform: tileStation,
  tram: tileStation,
  rail: tileStation,

  // ===== POLICE =====
  police: tilePolice,
  precinct: tilePolice,
  jail: tilePolice,

  // ===== MUSEUM =====
  museum: tileMuseum,
  exhibit: tileMuseum,

  // ===== HOSPITAL =====
  hospital: tileHospital,
  ward: tileHospital,
  morgue: tileHospital,
  medical: tileHospital,
  charity: tileHospital,

  // ===== ASYLUM =====
  asylum: tileAsylum,
  padded: tilePaddedcell,
  paddedcell: tilePaddedcell,
  cell: tileAsylum,

  // ===== STREETS =====
  street: tileStreet,
  road: tileStreet,
  cobblestone: tileStreet,
  avenue: tileStreet,

  // ===== MANOR AND MANSION =====
  manor: tileManor,
  mansion: tileManor,
  foyer: tileGrandfoyer,
  grandfoyer: tileGrandfoyer,
  lobby: tileGrandfoyer,
  vestibule: tileManor,
  atrium: tileManor,
  blackwood: tileManor,

  // ===== CELLAR AND BASEMENT =====
  cellar: tileCellar,
  basement: tileCellar,
  storage: tileCellar,
  cold: tileCellar,
  flooded: tileFloodedbasement,
  floodedbasement: tileFloodedbasement,
  coal: tileCellar,
  root: tileCellar,
  maintenance: tileMaintenancetunnel,
  maintenancetunnel: tileMaintenancetunnel,
  smuggler: tileCellar,

  // ===== FOREST AND NATURE =====
  forest: tileForest,
  woods: tileForest,
  clearing: tileForest,
  grove: tileForest,
  hollow: tileForest,
  whispering: tileForest,

  // ===== RITUAL =====
  ritual: tileRitual,
  altar: tileRitual,
  sacrific: tileRitual,
  occult: tileRitual,
  pentagram: tileRitual,

  // ===== WAREHOUSE AND INDUSTRIAL =====
  warehouse: tileWarehouse,
  factory: tileWarehouse,
  industrial: tileIndustrial,
  industrialquarter: tileIndustrial,
  derelict: tileWarehouse,

  // ===== HOTEL =====
  hotel: tileHotel,
  inn: tileHotel,
  silver: tileHotel,
  gilded: tileHotel,

  // ===== LABORATORY =====
  lab: tileLab,
  laboratory: tileLab,
  dissection: tileDissectiontheater,
  dissectiontheater: tileDissectiontheater,
  hidden: tileLab,

  // ===== BEDROOM =====
  bedroom: tileBedroom,
  bed: tileBedroom,
  sleep: tileBedroom,
  guest: tileBedroom,
  quarters: tileBedroom,

  // ===== SEWER =====
  sewer: tileSewer,
  tunnel: tileSewer,
  drain: tileStormdrain,
  stormdrain: tileStormdrain,
  storm: tileStormdrain,

  // ===== SWAMP AND MOOR =====
  swamp: tileSwamp,
  marsh: tileSwamp,
  bog: tileSwamp,
  moor: tileMoor,
  treacherous: tileSwamp,

  // ===== LIGHTHOUSE =====
  lighthouse: tileLighthouse,
  coast: tileLighthouse,
  cliff: tileLighthouse,
  suicide: tileLighthouse,

  // ===== MARKET =====
  market: tileMarket,
  fish: tileMarket,
  merchant: tileMarket,

  // ===== SHOP =====
  shop: tileShop,
  antique: tileShop,
  dusty: tileShop,

  // ===== CAMPUS =====
  campus: tileCampus,
  university: tileCampus,
  faculty: tileCampus,
  miskatonic: tileCampus,

  // ===== CAVE =====
  cave: tileCave,
  cavern: tileCavern,
  ancient: tileCave,

  // ===== BRIDGE =====
  bridge: tileBridge,
  crossing: tileBridge,
  overpass: tileBridge,
  iron: tileBridge,

  // ===== KITCHEN AND DINING =====
  kitchen: tileKitchen,
  pantry: tileKitchen,
  forgotten: tileKitchen,
  dining: tileKitchen,

  // ===== PARK =====
  park: tilePark,
  garden: tilePark,
  city: tilePark,

  // ===== PARLOR / SEANCE =====
  parlor: tileParlor,
  seance: tileParlor,
  séance: tileParlor,

  // ===== NURSERY =====
  nursery: tileNursery,

  // ===== MUSIC ROOM =====
  music: tileMusic,
  piano: tileMusic,

  // ===== CONSERVATORY =====
  conservatory: tileConservatory,
  sun: tileConservatory,

  // ===== BILLIARD ROOM =====
  billiard: tileBilliard,
  pool: tileBilliard,

  // ===== TROPHY AND GALLERY ROOMS =====
  trophy: tileTrophy,
  hunting: tileTrophy,
  portrait: tilePortraitgallery,
  portraitgallery: tilePortraitgallery,

  // ===== DRAWING ROOM =====
  drawing: tileDrawing,
  sitting: tileDrawing,

  // ===== OFFICE =====
  office: tileOffice,
  locked: tileOffice,
  private: tileOffice,

  // ===== BOILER ROOM =====
  boiler: tileBoiler,
  furnace: tileBoiler,

  // ===== TOMB =====
  tomb: tileTomb,
  sarcophagus: tileTomb,

  // ===== UNDERGROUND LAKE =====
  lake: tileUndergroundLake,

  // ===== PORTAL =====
  portal: tilePortal,
  eldritch: tilePortal,
  dimensional: tilePortal,

  // ===== SANCTUM =====
  sanctum: tileSanctum,
  cultist: tileSanctum,

  // ===== COURTHOUSE =====
  courthouse: tileCourthouse,
  court: tileCourthouse,

  // ===== NEWSPAPER =====
  newspaper: tileNewspaper,
  press: tileNewspaper,
  printing: tileNewspaper,

  // ===== SHIPYARD =====
  shipyard: tileShipyard,

  // ===== GASWORKS =====
  gasworks: tileGasworks,

  // ===== CANNERY =====
  cannery: tileCannery,

  // ===== CROSSROADS =====
  crossroads: tileCrossroads,

  // ===== DEAD END =====
  deadend: tileDeadend,

  // ===== FUNERAL PARLOR =====
  funeral: tileFuneral,
  embalming: tileFuneral,
  casket: tileFuneral,

  // ===== WELL =====
  well: tileWell,

  // ===== GALLOWS AND GIBBET =====
  gallows: tileGallows,
  gibbet: tileGibbet,
  execution: tileGibbet,

  // ===== QUARRY =====
  quarry: tileQuarry,

  // ===== CAMPSITE =====
  campsite: tileCampsite,

  // ===== SHACK =====
  shack: tileShack,
  hermit: tileShack,

  // ===== FARMHOUSE AND FARM =====
  farmhouse: tileFarmhouse,
  farm: tileFarmhouse,
  field: tileFarmhouse,

  // ===== HANGING TREE =====
  hangingtree: tileHangingtree,

  // ===== STONE CIRCLE =====
  stonecircle: tileStonecircle,

  // ===== ORCHARD =====
  orchard: tileOrchard,
  blighted: tileOrchard,

  // ===== RUINS =====
  ruins: tileRuins,
  overgrown: tileRuins,

  // ===== MINE =====
  mine: tileMine,
  collapsed: tileMine,

  // ===== POND =====
  pond: tilePond,
  stagnant: tilePond,

  // ===== TENEMENT =====
  tenement: tileTenement,
  condemned: tileTenement,
  immigrant: tileTenement,

  // ===== WITCH HOUSE =====
  witch: tileWitchhouse,

  // ===== BELL TOWER =====
  bell: tileBelltower,
  tower: tileBelltower,

  // ===== GALLERY ===== (portrait already mapped above in CRYPTS section for tilePortraitgallery)
  gallery: tileGallery,

  // ===== RECORDS ROOM =====
  records: tileRecords,
  filing: tileRecords,

  // ===== MAP ROOM =====
  map: tileMaproom,
  nautical: tileMaproom,

  // ===== SMOKING LOUNGE =====
  smoking: tileSmoking,
  cigar: tileSmoking,

  // ===== SERVANTS QUARTERS =====
  servants: tileServants,
  servant: tileServants,

  // ===== CLOSET =====
  closet: tileCloset,
  linen: tileCloset,

  // ===== GATE =====
  gate: tileGate,

  // ===== RIVERFRONT =====
  riverfront: tileRiverfront,
  river: tileRiverfront,

  // ===== FIRE ESCAPE =====
  fire: tileFireescape,
  escape: tileFireescape,
  emergency: tileFireescape,

  // ===== STAR CHAMBER =====
  star: tileStarchamber,
  chamber: tileStarchamber,
  astronomical: tileStarchamber,

  // ===== MASS GRAVE =====
  mass: tileMassgrave,
  grave: tileMassgrave,

  // ===== IDOL CHAMBER =====
  idol: tileIdol,

  // ===== BLACK POOL =====
  blackpool: tileBlackpool,

  // ===== ECHO CHAMBER =====
  echo: tileEcho,

  // ===== PETRIFIED GARDEN =====
  petrified: tilePetrified,

  // ===== ADDITIONAL MAPPINGS FOR COMPOUND NAMES =====
  townhouse: tileManor,
  reception: tileManor,
  service: tileHallway,
  floor: tileHallway,
  tasting: tileCellar,
  rats: tileSewer,
  // pit already mapped in CRYPTS section
  standing: tileStonecircle,
  devils: tileGraveyard,
  dead: tileDeadend,
  hanging: tileHangingtree,

  // ===== ADDITIONAL MAPPINGS (2026-01-21) =====
  boathouse: tileDock,
  tide: tileDock,
  sentinel: tileForest,
  shore: tileDock,
  cistern: tileSewer,
  workshop: tileCellar,
  prison: tileCrypt,
  observatory: tileStarchamber,
  pawn: tileShop,
  arms: tileHotel,
  attic: tileManor,
  bathroom: tileHospital,
  apartment: tileTenement,
  junction: tileHallway,
  almshouse: tileTenement,
  stalls: tileMarket,
  fountain: tileSquare,
  corner: tileStreet,
  deserted: tileStreet,
  shrouded: tileForest,
  rocky: tileDock,
  fetid: tileSwamp,
  curious: tileShop,
  ice: tileCellar,
  midnight: tileShop
};

// ============================================================================
// TILE IMAGE LOOKUP FUNCTION
// ============================================================================

/**
 * Get the tile image URL for a given tile name.
 *
 * Performs case-insensitive substring matching against the TILE_IMAGES map.
 * Returns null if no matching image is found.
 *
 * @param tileName - The name of the tile (e.g., "Miskatonic Library", "Dark Alley")
 * @returns The image URL string or null if no match found
 *
 * @example
 * getTileImage("Miskatonic Library") // Returns tileLibrary
 * getTileImage("Unknown Room") // Returns null
 */
export function getTileImage(tileName: string): string | null {
  const nameLower = tileName.toLowerCase();

  for (const [key, image] of Object.entries(TILE_IMAGES)) {
    if (nameLower.includes(key)) {
      return image;
    }
  }

  return null;
}
