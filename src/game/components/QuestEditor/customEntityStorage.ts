/**
 * CUSTOM ENTITY STORAGE
 *
 * Manages localStorage persistence for custom tiles and monsters.
 * Provides utility functions for CRUD operations.
 */

import { CustomTileTemplate } from './CustomTileCreator';
import { CustomMonster } from './MonsterDesigner';

// ============================================================================
// STORAGE KEYS
// ============================================================================

const STORAGE_KEYS = {
  CUSTOM_TILES: 'quest_editor_custom_tiles',
  CUSTOM_MONSTERS: 'quest_editor_custom_monsters',
};

// ============================================================================
// CUSTOM TILES
// ============================================================================

/**
 * Get all custom tiles from localStorage
 */
export function getCustomTiles(): CustomTileTemplate[] {
  try {
    const json = localStorage.getItem(STORAGE_KEYS.CUSTOM_TILES);
    if (!json) return [];
    const tiles = JSON.parse(json);
    return Array.isArray(tiles) ? tiles : [];
  } catch (error) {
    console.error('Failed to load custom tiles:', error);
    return [];
  }
}

/**
 * Save a custom tile to localStorage
 */
export function saveCustomTile(tile: CustomTileTemplate): void {
  try {
    const existingTiles = getCustomTiles();
    const existingIndex = existingTiles.findIndex(t => t.id === tile.id);

    if (existingIndex >= 0) {
      // Update existing tile
      existingTiles[existingIndex] = tile;
    } else {
      // Add new tile
      existingTiles.push(tile);
    }

    localStorage.setItem(STORAGE_KEYS.CUSTOM_TILES, JSON.stringify(existingTiles));
    console.log(`Custom tile "${tile.name}" saved successfully`);
  } catch (error) {
    console.error('Failed to save custom tile:', error);
    throw new Error('Failed to save custom tile');
  }
}

/**
 * Delete a custom tile from localStorage
 */
export function deleteCustomTile(tileId: string): void {
  try {
    const existingTiles = getCustomTiles();
    const filtered = existingTiles.filter(t => t.id !== tileId);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_TILES, JSON.stringify(filtered));
    console.log(`Custom tile ${tileId} deleted`);
  } catch (error) {
    console.error('Failed to delete custom tile:', error);
    throw new Error('Failed to delete custom tile');
  }
}

/**
 * Get a single custom tile by ID
 */
export function getCustomTileById(tileId: string): CustomTileTemplate | null {
  const tiles = getCustomTiles();
  return tiles.find(t => t.id === tileId) || null;
}

/**
 * Export custom tiles to JSON
 */
export function exportCustomTiles(): string {
  const tiles = getCustomTiles();
  return JSON.stringify({
    type: 'custom_tiles',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    tiles,
  }, null, 2);
}

/**
 * Import custom tiles from JSON
 */
export function importCustomTiles(json: string): { imported: number; skipped: number } {
  try {
    const data = JSON.parse(json);
    if (!data.tiles || !Array.isArray(data.tiles)) {
      throw new Error('Invalid import format');
    }

    const existingTiles = getCustomTiles();
    const existingIds = new Set(existingTiles.map(t => t.id));

    let imported = 0;
    let skipped = 0;

    for (const tile of data.tiles) {
      if (tile.isCustom && tile.id && tile.name) {
        if (existingIds.has(tile.id)) {
          skipped++;
        } else {
          existingTiles.push(tile);
          imported++;
        }
      }
    }

    localStorage.setItem(STORAGE_KEYS.CUSTOM_TILES, JSON.stringify(existingTiles));
    console.log(`Imported ${imported} custom tiles, skipped ${skipped}`);
    return { imported, skipped };
  } catch (error) {
    console.error('Failed to import custom tiles:', error);
    throw new Error('Failed to import custom tiles');
  }
}

// ============================================================================
// CUSTOM MONSTERS
// ============================================================================

/**
 * Get all custom monsters from localStorage
 */
export function getCustomMonsters(): CustomMonster[] {
  try {
    const json = localStorage.getItem(STORAGE_KEYS.CUSTOM_MONSTERS);
    if (!json) return [];
    const monsters = JSON.parse(json);
    return Array.isArray(monsters) ? monsters : [];
  } catch (error) {
    console.error('Failed to load custom monsters:', error);
    return [];
  }
}

/**
 * Save a custom monster to localStorage
 */
export function saveCustomMonster(monster: CustomMonster): void {
  try {
    const existingMonsters = getCustomMonsters();
    const existingIndex = existingMonsters.findIndex(m => m.id === monster.id);

    if (existingIndex >= 0) {
      // Update existing monster
      existingMonsters[existingIndex] = monster;
    } else {
      // Add new monster
      existingMonsters.push(monster);
    }

    localStorage.setItem(STORAGE_KEYS.CUSTOM_MONSTERS, JSON.stringify(existingMonsters));
    console.log(`Custom monster "${monster.name}" saved successfully`);
  } catch (error) {
    console.error('Failed to save custom monster:', error);
    throw new Error('Failed to save custom monster');
  }
}

/**
 * Delete a custom monster from localStorage
 */
export function deleteCustomMonster(monsterId: string): void {
  try {
    const existingMonsters = getCustomMonsters();
    const filtered = existingMonsters.filter(m => m.id !== monsterId);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_MONSTERS, JSON.stringify(filtered));
    console.log(`Custom monster ${monsterId} deleted`);
  } catch (error) {
    console.error('Failed to delete custom monster:', error);
    throw new Error('Failed to delete custom monster');
  }
}

/**
 * Get a single custom monster by ID
 */
export function getCustomMonsterById(monsterId: string): CustomMonster | null {
  const monsters = getCustomMonsters();
  return monsters.find(m => m.id === monsterId) || null;
}

/**
 * Get a custom monster by type
 */
export function getCustomMonsterByType(type: string): CustomMonster | null {
  const monsters = getCustomMonsters();
  return monsters.find(m => m.type === type) || null;
}

/**
 * Export custom monsters to JSON
 */
export function exportCustomMonsters(): string {
  const monsters = getCustomMonsters();
  return JSON.stringify({
    type: 'custom_monsters',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    monsters,
  }, null, 2);
}

/**
 * Import custom monsters from JSON
 */
export function importCustomMonsters(json: string): { imported: number; skipped: number } {
  try {
    const data = JSON.parse(json);
    if (!data.monsters || !Array.isArray(data.monsters)) {
      throw new Error('Invalid import format');
    }

    const existingMonsters = getCustomMonsters();
    const existingIds = new Set(existingMonsters.map(m => m.id));

    let imported = 0;
    let skipped = 0;

    for (const monster of data.monsters) {
      if (monster.isCustom && monster.id && monster.name) {
        if (existingIds.has(monster.id)) {
          skipped++;
        } else {
          existingMonsters.push(monster);
          imported++;
        }
      }
    }

    localStorage.setItem(STORAGE_KEYS.CUSTOM_MONSTERS, JSON.stringify(existingMonsters));
    console.log(`Imported ${imported} custom monsters, skipped ${skipped}`);
    return { imported, skipped };
  } catch (error) {
    console.error('Failed to import custom monsters:', error);
    throw new Error('Failed to import custom monsters');
  }
}

// ============================================================================
// COMBINED OPERATIONS
// ============================================================================

/**
 * Export all custom content (tiles + monsters)
 */
export function exportAllCustomContent(): string {
  const tiles = getCustomTiles();
  const monsters = getCustomMonsters();

  return JSON.stringify({
    type: 'custom_content_bundle',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    tiles,
    monsters,
  }, null, 2);
}

/**
 * Import all custom content from JSON
 */
export function importAllCustomContent(json: string): { tiles: { imported: number; skipped: number }; monsters: { imported: number; skipped: number } } {
  try {
    const data = JSON.parse(json);

    let tilesResult = { imported: 0, skipped: 0 };
    let monstersResult = { imported: 0, skipped: 0 };

    if (data.tiles && Array.isArray(data.tiles)) {
      tilesResult = importCustomTiles(JSON.stringify({ tiles: data.tiles }));
    }

    if (data.monsters && Array.isArray(data.monsters)) {
      monstersResult = importCustomMonsters(JSON.stringify({ monsters: data.monsters }));
    }

    return { tiles: tilesResult, monsters: monstersResult };
  } catch (error) {
    console.error('Failed to import custom content:', error);
    throw new Error('Failed to import custom content');
  }
}

/**
 * Get total count of custom content
 */
export function getCustomContentCount(): { tiles: number; monsters: number } {
  return {
    tiles: getCustomTiles().length,
    monsters: getCustomMonsters().length,
  };
}

/**
 * Clear all custom content (with confirmation)
 */
export function clearAllCustomContent(): void {
  localStorage.removeItem(STORAGE_KEYS.CUSTOM_TILES);
  localStorage.removeItem(STORAGE_KEYS.CUSTOM_MONSTERS);
  console.log('All custom content cleared');
}
