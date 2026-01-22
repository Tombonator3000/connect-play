/**
 * TILE ASSET AUDIT
 * 
 * Analyzes which tiles have graphics and which are missing.
 * Used to identify assets that need to be generated.
 */

import { INDOOR_LOCATIONS, OUTDOOR_LOCATIONS } from '../constants';

// All existing tile images in src/assets/tiles/
export const EXISTING_TILE_IMAGES = [
  'alley', 'asylum', 'bedroom', 'belltower', 'billiard', 'blackpool', 'boiler', 
  'bridge', 'campsite', 'campus', 'cannery', 'cave', 'cellar', 'church', 'closet',
  'conservatory', 'courthouse', 'crossroads', 'crypt', 'deadend', 'dock', 'drawing',
  'echo', 'farmhouse', 'fireescape', 'forest', 'funeral', 'gallery', 'gallows',
  'gasworks', 'gate', 'graveyard', 'hallway', 'hangingtree', 'hospital', 'hotel',
  'idol', 'kitchen', 'lab', 'library', 'lighthouse', 'manor', 'maproom', 'market',
  'massgrave', 'mine', 'museum', 'music', 'newspaper', 'nursery', 'office', 'orchard',
  'park', 'parlor', 'petrified', 'police', 'pond', 'portal', 'quarry', 'records',
  'ritual', 'riverfront', 'ruins', 'sanctum', 'servants', 'sewer', 'shack', 'shipyard',
  'shop', 'smoking', 'square', 'starchamber', 'station', 'stonecircle', 'street',
  'swamp', 'tenement', 'tomb', 'trophy', 'underground-lake', 'warehouse', 'well', 'witchhouse'
];

/**
 * Normalize location name to match tile file naming convention
 */
export function normalizeLocationName(name: string): string {
  return name
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Check if a location has a matching tile image
 */
export function hasMatchingTileImage(locationName: string): boolean {
  const normalized = normalizeLocationName(locationName);
  
  // Direct match
  if (EXISTING_TILE_IMAGES.includes(normalized)) return true;
  
  // Partial match - check if any existing tile is contained in the location name
  for (const tile of EXISTING_TILE_IMAGES) {
    if (normalized.includes(tile) || tile.includes(normalized)) {
      return true;
    }
  }
  
  // Word-based matching
  const words = normalized.split('-');
  for (const word of words) {
    if (word.length >= 4 && EXISTING_TILE_IMAGES.some(t => t.includes(word))) {
      return true;
    }
  }
  
  return false;
}

/**
 * Find the best matching tile image for a location
 */
export function findBestTileMatch(locationName: string): string | null {
  const normalized = normalizeLocationName(locationName);
  
  // Direct match
  if (EXISTING_TILE_IMAGES.includes(normalized)) return normalized;
  
  // Check for contained matches
  for (const tile of EXISTING_TILE_IMAGES) {
    if (normalized.includes(tile)) return tile;
  }
  
  // Word matching
  const words = normalized.split('-');
  for (const word of words) {
    if (word.length >= 4) {
      const match = EXISTING_TILE_IMAGES.find(t => t.includes(word) || word.includes(t));
      if (match) return match;
    }
  }
  
  return null;
}

/**
 * Get all locations that are missing tile graphics
 */
export function getMissingTileGraphics(): { 
  indoor: { name: string; normalized: string; suggestedMatch: string | null }[];
  outdoor: { name: string; normalized: string; suggestedMatch: string | null }[];
} {
  const missing = {
    indoor: [] as { name: string; normalized: string; suggestedMatch: string | null }[],
    outdoor: [] as { name: string; normalized: string; suggestedMatch: string | null }[]
  };
  
  for (const location of INDOOR_LOCATIONS) {
    if (!hasMatchingTileImage(location)) {
      missing.indoor.push({
        name: location,
        normalized: normalizeLocationName(location),
        suggestedMatch: findBestTileMatch(location)
      });
    }
  }
  
  for (const location of OUTDOOR_LOCATIONS) {
    if (!hasMatchingTileImage(location)) {
      missing.outdoor.push({
        name: location,
        normalized: normalizeLocationName(location),
        suggestedMatch: findBestTileMatch(location)
      });
    }
  }
  
  return missing;
}

/**
 * Get statistics about tile coverage
 */
export function getTileAssetStats(): {
  totalLocations: number;
  indoorCount: number;
  outdoorCount: number;
  existingTiles: number;
  coveredLocations: number;
  missingLocations: number;
  coveragePercent: number;
} {
  const totalLocations = INDOOR_LOCATIONS.length + OUTDOOR_LOCATIONS.length;
  const missing = getMissingTileGraphics();
  const missingCount = missing.indoor.length + missing.outdoor.length;
  const coveredCount = totalLocations - missingCount;
  
  return {
    totalLocations,
    indoorCount: INDOOR_LOCATIONS.length,
    outdoorCount: OUTDOOR_LOCATIONS.length,
    existingTiles: EXISTING_TILE_IMAGES.length,
    coveredLocations: coveredCount,
    missingLocations: missingCount,
    coveragePercent: Math.round((coveredCount / totalLocations) * 100)
  };
}

// Run audit and log results
export function runTileAudit(): void {
  const stats = getTileAssetStats();
  const missing = getMissingTileGraphics();
  
  console.log('=== TILE ASSET AUDIT ===');
  console.log(`Total locations: ${stats.totalLocations}`);
  console.log(`  Indoor: ${stats.indoorCount}`);
  console.log(`  Outdoor: ${stats.outdoorCount}`);
  console.log(`Existing tile images: ${stats.existingTiles}`);
  console.log(`Covered locations: ${stats.coveredLocations} (${stats.coveragePercent}%)`);
  console.log(`Missing locations: ${stats.missingLocations}`);
  
  if (missing.indoor.length > 0) {
    console.log('\n--- MISSING INDOOR TILES ---');
    missing.indoor.forEach(m => {
      console.log(`  ${m.name} -> ${m.suggestedMatch || 'NO MATCH'}`);
    });
  }
  
  if (missing.outdoor.length > 0) {
    console.log('\n--- MISSING OUTDOOR TILES ---');
    missing.outdoor.forEach(m => {
      console.log(`  ${m.name} -> ${m.suggestedMatch || 'NO MATCH'}`);
    });
  }
}
