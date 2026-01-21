/**
 * Save Manager - Handles offline save/load functionality
 *
 * Features:
 * - Export save data as downloadable JSON file
 * - Import save data from uploaded file
 * - Full game state backup and restore
 * - Legacy data export/import
 * - Auto-save functionality
 */

import { LegacyData, GameState, createDefaultLegacyData } from '../types';

// ============================================================================
// STORAGE KEYS
// ============================================================================

export const SAVE_KEYS = {
  LEGACY: 'shadows_1920s_legacy',
  GAME_STATE: 'shadows_1920s_gamestate',
  SETTINGS: 'shadows_1920s_settings',
  AUTO_SAVE: 'shadows_1920s_autosave'
};

export const SAVE_VERSION = 2;

// ============================================================================
// SAVE DATA TYPES
// ============================================================================

export interface SaveFile {
  version: number;
  timestamp: string;
  type: 'full' | 'legacy' | 'gamestate';
  legacyData?: LegacyData;
  gameState?: Partial<GameState>;
  settings?: Record<string, unknown>;
}

export interface SaveSlot {
  id: string;
  name: string;
  timestamp: string;
  type: 'full' | 'legacy' | 'gamestate';
  heroCount?: number;
  gold?: number;
  scenarioTitle?: string;
}

// ============================================================================
// EXPORT FUNCTIONS
// ============================================================================

/**
 * Export legacy data as downloadable JSON file
 */
export function exportLegacyData(legacyData: LegacyData): void {
  const saveFile: SaveFile = {
    version: SAVE_VERSION,
    timestamp: new Date().toISOString(),
    type: 'legacy',
    legacyData
  };

  downloadSaveFile(saveFile, `mythos-quest-heroes-${formatDateForFilename()}.json`);
}

/**
 * Export full game state (legacy + current game)
 */
export function exportFullSave(legacyData: LegacyData, gameState?: Partial<GameState>): void {
  const settings = loadSettings();

  const saveFile: SaveFile = {
    version: SAVE_VERSION,
    timestamp: new Date().toISOString(),
    type: 'full',
    legacyData,
    gameState: gameState ? sanitizeGameState(gameState) : undefined,
    settings
  };

  downloadSaveFile(saveFile, `mythos-quest-fullsave-${formatDateForFilename()}.json`);
}

/**
 * Export current game state only (for mid-game saves)
 */
export function exportGameState(gameState: Partial<GameState>): void {
  const saveFile: SaveFile = {
    version: SAVE_VERSION,
    timestamp: new Date().toISOString(),
    type: 'gamestate',
    gameState: sanitizeGameState(gameState)
  };

  downloadSaveFile(saveFile, `mythos-quest-scenario-${formatDateForFilename()}.json`);
}

// ============================================================================
// IMPORT FUNCTIONS
// ============================================================================

/**
 * Import save file from uploaded file
 */
export async function importSaveFile(file: File): Promise<{
  success: boolean;
  saveFile?: SaveFile;
  error?: string;
}> {
  try {
    const text = await file.text();
    const data = JSON.parse(text);

    // Validate save file structure
    if (!data.version || !data.type || !data.timestamp) {
      return { success: false, error: 'Invalid save file format' };
    }

    // Handle version migrations
    const saveFile = migrateSaveFile(data);

    // Validate data based on type
    if (saveFile.type === 'legacy' || saveFile.type === 'full') {
      if (!saveFile.legacyData) {
        return { success: false, error: 'Missing legacy data in save file' };
      }
      if (!validateLegacyData(saveFile.legacyData)) {
        return { success: false, error: 'Invalid legacy data structure' };
      }
    }

    return { success: true, saveFile };
  } catch (error) {
    console.error('Failed to import save file:', error);
    return { success: false, error: 'Failed to parse save file' };
  }
}

/**
 * Apply imported save file to game
 */
export function applySaveFile(saveFile: SaveFile): {
  legacyData?: LegacyData;
  gameState?: Partial<GameState>;
  settings?: Record<string, unknown>;
} {
  const result: {
    legacyData?: LegacyData;
    gameState?: Partial<GameState>;
    settings?: Record<string, unknown>;
  } = {};

  if (saveFile.legacyData) {
    result.legacyData = saveFile.legacyData;
    // Save to localStorage
    localStorage.setItem(SAVE_KEYS.LEGACY, JSON.stringify(saveFile.legacyData));
  }

  if (saveFile.gameState) {
    result.gameState = saveFile.gameState;
  }

  if (saveFile.settings) {
    result.settings = saveFile.settings;
    localStorage.setItem(SAVE_KEYS.SETTINGS, JSON.stringify(saveFile.settings));
  }

  return result;
}

// ============================================================================
// AUTO-SAVE FUNCTIONS
// ============================================================================

/**
 * Auto-save game state to localStorage
 */
export function autoSave(legacyData: LegacyData, gameState?: Partial<GameState>): void {
  const autoSaveData = {
    version: SAVE_VERSION,
    timestamp: new Date().toISOString(),
    legacyData,
    gameState: gameState ? sanitizeGameState(gameState) : undefined
  };

  localStorage.setItem(SAVE_KEYS.AUTO_SAVE, JSON.stringify(autoSaveData));
}

/**
 * Load auto-saved game state
 */
export function loadAutoSave(): SaveFile | null {
  try {
    const saved = localStorage.getItem(SAVE_KEYS.AUTO_SAVE);
    if (!saved) return null;

    const data = JSON.parse(saved);
    return {
      version: data.version || 1,
      timestamp: data.timestamp || new Date().toISOString(),
      type: 'full',
      legacyData: data.legacyData,
      gameState: data.gameState
    };
  } catch (error) {
    console.error('Failed to load auto-save:', error);
    return null;
  }
}

/**
 * Check if auto-save exists
 */
export function hasAutoSave(): boolean {
  return !!localStorage.getItem(SAVE_KEYS.AUTO_SAVE);
}

/**
 * Clear auto-save
 */
export function clearAutoSave(): void {
  localStorage.removeItem(SAVE_KEYS.AUTO_SAVE);
}

// ============================================================================
// SAVE SLOTS (for multiple save files in localStorage)
// ============================================================================

/**
 * Get list of save slots
 */
export function getSaveSlots(): SaveSlot[] {
  try {
    const slotsJson = localStorage.getItem('shadows_1920s_saveslots');
    if (!slotsJson) return [];
    return JSON.parse(slotsJson);
  } catch {
    return [];
  }
}

/**
 * Save to a specific slot
 */
export function saveToSlot(slotId: string, name: string, legacyData: LegacyData, gameState?: Partial<GameState>): void {
  const saveFile: SaveFile = {
    version: SAVE_VERSION,
    timestamp: new Date().toISOString(),
    type: gameState ? 'full' : 'legacy',
    legacyData,
    gameState: gameState ? sanitizeGameState(gameState) : undefined
  };

  // Save the data
  localStorage.setItem(`shadows_1920s_slot_${slotId}`, JSON.stringify(saveFile));

  // Update slots list
  const slots = getSaveSlots();
  const existingIndex = slots.findIndex(s => s.id === slotId);

  const slot: SaveSlot = {
    id: slotId,
    name,
    timestamp: saveFile.timestamp,
    type: saveFile.type,
    heroCount: legacyData.heroes.length,
    gold: legacyData.totalGoldEarned || 0,
    scenarioTitle: gameState?.activeScenario?.title
  };

  if (existingIndex >= 0) {
    slots[existingIndex] = slot;
  } else {
    slots.push(slot);
  }

  localStorage.setItem('shadows_1920s_saveslots', JSON.stringify(slots));
}

/**
 * Load from a specific slot
 */
export function loadFromSlot(slotId: string): SaveFile | null {
  try {
    const saved = localStorage.getItem(`shadows_1920s_slot_${slotId}`);
    if (!saved) return null;
    return JSON.parse(saved);
  } catch {
    return null;
  }
}

/**
 * Delete a save slot
 */
export function deleteSlot(slotId: string): void {
  localStorage.removeItem(`shadows_1920s_slot_${slotId}`);

  const slots = getSaveSlots();
  const filtered = slots.filter(s => s.id !== slotId);
  localStorage.setItem('shadows_1920s_saveslots', JSON.stringify(filtered));
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Download save file to user's computer
 */
function downloadSaveFile(saveFile: SaveFile, filename: string): void {
  const json = JSON.stringify(saveFile, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Format date for filename
 */
function formatDateForFilename(): string {
  const now = new Date();
  return now.toISOString().slice(0, 19).replace(/[T:]/g, '-');
}

/**
 * Sanitize game state for saving (remove functions, circular references)
 */
function sanitizeGameState(state: Partial<GameState>): Partial<GameState> {
  return JSON.parse(JSON.stringify(state));
}

/**
 * Load settings from localStorage
 */
function loadSettings(): Record<string, unknown> {
  try {
    const saved = localStorage.getItem(SAVE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

/**
 * Migrate save file to latest version
 */
function migrateSaveFile(data: SaveFile): SaveFile {
  let migrated = { ...data };

  // Version 1 -> 2: Add missing fields
  if (migrated.version < 2) {
    if (migrated.legacyData) {
      // Ensure stash exists
      if (!migrated.legacyData.stash) {
        migrated.legacyData.stash = { items: [], maxCapacity: 20 };
      }
    }
    migrated.version = 2;
  }

  return migrated;
}

/**
 * Validate legacy data structure
 */
function validateLegacyData(data: LegacyData): boolean {
  if (!data) return false;
  if (typeof data.totalGoldEarned !== 'number') return false;
  if (!Array.isArray(data.heroes)) return false;
  if (!data.stash || !Array.isArray(data.stash.items)) return false;
  return true;
}

// ============================================================================
// CLOUD SAVE PLACEHOLDER (for future implementation)
// ============================================================================

/**
 * Future cloud save integration point
 */
export interface CloudSaveProvider {
  save(data: SaveFile): Promise<void>;
  load(): Promise<SaveFile | null>;
  list(): Promise<SaveSlot[]>;
  delete(id: string): Promise<void>;
}

// Placeholder for cloud integration
export const cloudSave: CloudSaveProvider | null = null;

export default {
  exportLegacyData,
  exportFullSave,
  exportGameState,
  importSaveFile,
  applySaveFile,
  autoSave,
  loadAutoSave,
  hasAutoSave,
  clearAutoSave,
  getSaveSlots,
  saveToSlot,
  loadFromSlot,
  deleteSlot
};
