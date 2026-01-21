/**
 * QUEST EDITOR - Fase 2
 *
 * Visuell hex-editor for å lage scenarios manuelt.
 * Inkluderer:
 * - Fase 1: Tile placement, rotation, export/import
 * - Fase 2: Edge-konfigurasjon, monster/item placement, objectives
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ArrowLeft, Download, Trash2, RotateCw, Save, Upload, Grid3X3, Eraser, MousePointer, Skull, Package, Target, Settings, CheckCircle, Play, Zap, Users, AlertTriangle, Undo2, Redo2 } from 'lucide-react';
import useUndoRedo, { UndoableState } from './useUndoRedo';
import { TileTemplate, ConnectionEdgeType, rotateEdges } from '../../tileConnectionSystem';
import { TileCategory, FloorType, ZoneLevel, EdgeData, Item, EnemyType, DoorState } from '../../types';
import { Button } from '@/components/ui/button';
import EditorCanvas from './EditorCanvas';
import TilePalette from './TilePalette';
import EdgeConfigPanel from './EdgeConfigPanel';
import MonsterPalette, { MonsterPlacement } from './MonsterPalette';
import ItemPalette, { QuestItemPlacement } from './ItemPalette';
import ObjectivesPanel, { EditorObjective } from './ObjectivesPanel';
import ValidationPanel, { validateScenario } from './ValidationPanel';
import DoorConfigPanel from './DoorConfigPanel';
import PreviewPanel from './PreviewPanel';
import TriggerPanel, { EditorTrigger } from './TriggerPanel';
import NPCPalette, { NPCPlacement } from './NPCPalette';
import DoomEventsPanel, { DoomEvent } from './DoomEventsPanel';

// ============================================================================
// RIGHT PANEL TABS
// ============================================================================

type RightPanelTab = 'properties' | 'monsters' | 'items' | 'npcs' | 'objectives' | 'triggers' | 'doom' | 'validate';

// ============================================================================
// EDITOR TYPES
// ============================================================================

// Door configuration for DOOR edges
export interface DoorConfig {
  state: DoorState;
  keyId?: string;        // ID of key required to unlock
  lockDifficulty?: number; // DC for lockpicking (3-6)
}

export interface EditorTile {
  id: string;
  q: number;
  r: number;
  templateId: string;
  name: string;
  category: TileCategory;
  subType: string;
  edges: [ConnectionEdgeType, ConnectionEdgeType, ConnectionEdgeType, ConnectionEdgeType, ConnectionEdgeType, ConnectionEdgeType];
  // Door configurations - only for edges that are DOOR type
  doorConfigs?: { [edgeIndex: number]: DoorConfig };
  floorType: FloorType;
  zoneLevel: ZoneLevel;
  rotation: number; // 0-5, number of 60-degree rotations
  description?: string;
  watermarkIcon?: string;
  customDescription?: string; // Custom description shown in-game
  // Placement data
  isStartLocation?: boolean;
  monsters?: { type: string; count: number }[];
  items?: Item[];
  npcs?: NPCPlacement[];
}

export interface ScenarioMetadata {
  id: string;
  title: string;
  description: string;
  briefing: string;
  startDoom: number;
  difficulty: 'easy' | 'normal' | 'hard' | 'nightmare';
  theme: string;
}

export type EditorTool = 'select' | 'place' | 'erase' | 'pan';

interface QuestEditorProps {
  onBack: () => void;
}

// ============================================================================
// QUEST EDITOR COMPONENT
// ============================================================================

const QuestEditor: React.FC<QuestEditorProps> = ({ onBack }) => {
  // Editor state
  const [tiles, setTiles] = useState<Map<string, EditorTile>>(new Map());
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<EditorTool>('place');
  const [selectedTemplate, setSelectedTemplate] = useState<TileTemplate | null>(null);
  const [rotation, setRotation] = useState<number>(0);

  // Scenario metadata
  const [metadata, setMetadata] = useState<ScenarioMetadata>({
    id: `custom_scenario_${Date.now()}`,
    title: 'Untitled Scenario',
    description: '',
    briefing: '',
    startDoom: 12,
    difficulty: 'normal',
    theme: 'investigation'
  });

  // Objectives state
  const [objectives, setObjectives] = useState<EditorObjective[]>([]);

  // Triggers state
  const [triggers, setTriggers] = useState<EditorTrigger[]>([]);

  // Doom events state
  const [doomEvents, setDoomEvents] = useState<DoomEvent[]>([]);

  // View state
  const [showGrid, setShowGrid] = useState(true);
  const [rightPanelTab, setRightPanelTab] = useState<RightPanelTab>('properties');
  const [showPreview, setShowPreview] = useState(false);

  // Undo/Redo
  const {
    canUndo,
    canRedo,
    undo,
    redo,
    pushState,
    clear: clearHistory,
    lastAction,
    undoStack,
    redoStack
  } = useUndoRedo();

  // Ref for file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ============================================================================
  // UNDO/REDO HELPERS
  // ============================================================================

  // Get current state for undo/redo
  const getCurrentState = useCallback((): UndoableState => ({
    tiles,
    objectives,
    triggers,
    doomEvents,
    metadata,
  }), [tiles, objectives, triggers, doomEvents, metadata]);

  // Apply a state from undo/redo
  const applyState = useCallback((state: UndoableState) => {
    setTiles(state.tiles as Map<string, EditorTile>);
    setObjectives(state.objectives as EditorObjective[]);
    setTriggers(state.triggers as EditorTrigger[]);
    setDoomEvents(state.doomEvents as DoomEvent[]);
    setMetadata(state.metadata as ScenarioMetadata);
  }, []);

  // Push current state with action description (for tracking changes)
  const recordAction = useCallback((action: string) => {
    pushState(getCurrentState(), action);
  }, [pushState, getCurrentState]);

  // Handle undo
  const handleUndo = useCallback(() => {
    const previousState = undo();
    if (previousState) {
      applyState(previousState);
    }
  }, [undo, applyState]);

  // Handle redo
  const handleRedo = useCallback(() => {
    const nextState = redo();
    if (nextState) {
      applyState(nextState);
    }
  }, [redo, applyState]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo: Ctrl/Cmd + Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      // Redo: Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y
      if ((e.ctrlKey || e.metaKey) && ((e.key === 'z' && e.shiftKey) || e.key === 'y')) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Initialize undo history with initial state
  useEffect(() => {
    if (undoStack === 0) {
      pushState(getCurrentState(), 'Initial state');
    }
  }, []);  // Only run once on mount

  // Wrapper functions with undo tracking
  const updateTileWithUndo = useCallback((
    tileKey: string,
    updater: (tile: EditorTile) => EditorTile,
    actionDescription: string
  ) => {
    recordAction(actionDescription);
    setTiles(prev => {
      const newTiles = new Map(prev);
      const tile = newTiles.get(tileKey);
      if (tile) {
        newTiles.set(tileKey, updater(tile));
      }
      return newTiles;
    });
  }, [recordAction]);

  const updateObjectivesWithUndo = useCallback((
    newObjectives: EditorObjective[],
    actionDescription: string
  ) => {
    recordAction(actionDescription);
    setObjectives(newObjectives);
  }, [recordAction]);

  const updateTriggersWithUndo = useCallback((
    newTriggers: EditorTrigger[],
    actionDescription: string
  ) => {
    recordAction(actionDescription);
    setTriggers(newTriggers);
  }, [recordAction]);

  const updateDoomEventsWithUndo = useCallback((
    newDoomEvents: DoomEvent[],
    actionDescription: string
  ) => {
    recordAction(actionDescription);
    setDoomEvents(newDoomEvents);
  }, [recordAction]);

  const updateMetadataWithUndo = useCallback((
    newMetadata: ScenarioMetadata,
    actionDescription: string
  ) => {
    recordAction(actionDescription);
    setMetadata(newMetadata);
  }, [recordAction]);

  // ============================================================================
  // TILE KEY HELPERS
  // ============================================================================

  const getTileKey = (q: number, r: number): string => `${q},${r}`;

  // ============================================================================
  // TILE PLACEMENT
  // ============================================================================

  const handleCanvasClick = useCallback((q: number, r: number) => {
    const key = getTileKey(q, r);

    if (activeTool === 'select') {
      const existingTile = tiles.get(key);
      setSelectedTileId(existingTile ? key : null);
      return;
    }

    if (activeTool === 'erase') {
      const existingTile = tiles.get(key);
      if (existingTile) {
        recordAction(`Delete tile: ${existingTile.name}`);
      }
      setTiles(prev => {
        const newTiles = new Map(prev);
        newTiles.delete(key);
        return newTiles;
      });
      if (selectedTileId === key) {
        setSelectedTileId(null);
      }
      return;
    }

    if (activeTool === 'place' && selectedTemplate) {
      const rotatedEdges = selectedTemplate.canRotate
        ? rotateEdges(selectedTemplate.edges, rotation)
        : selectedTemplate.edges;

      const newTile: EditorTile = {
        id: `tile_${q}_${r}_${Date.now()}`,
        q,
        r,
        templateId: selectedTemplate.id,
        name: selectedTemplate.name,
        category: selectedTemplate.category,
        subType: selectedTemplate.subType,
        edges: rotatedEdges,
        floorType: selectedTemplate.floorType,
        zoneLevel: selectedTemplate.zoneLevel,
        rotation: selectedTemplate.canRotate ? rotation : 0,
        description: selectedTemplate.description,
        watermarkIcon: selectedTemplate.watermarkIcon,
      };

      recordAction(`Place tile: ${selectedTemplate.name}`);
      setTiles(prev => {
        const newTiles = new Map(prev);
        newTiles.set(key, newTile);
        return newTiles;
      });

      setSelectedTileId(key);
    }
  }, [activeTool, selectedTemplate, rotation, tiles, selectedTileId, recordAction]);

  // ============================================================================
  // TEMPLATE SELECTION
  // ============================================================================

  const handleSelectTemplate = useCallback((template: TileTemplate) => {
    setSelectedTemplate(template);
    setActiveTool('place');
    setRotation(0);
  }, []);

  // ============================================================================
  // ROTATION
  // ============================================================================

  const handleRotate = useCallback(() => {
    setRotation(prev => (prev + 1) % 6);
  }, []);

  // ============================================================================
  // CLEAR ALL
  // ============================================================================

  const handleClearAll = useCallback(() => {
    if (tiles.size > 0 && window.confirm('Clear all tiles? You can undo this action.')) {
      recordAction('Clear all tiles');
      setTiles(new Map());
      setSelectedTileId(null);
    }
  }, [tiles.size, recordAction]);

  // ============================================================================
  // JSON EXPORT
  // ============================================================================

  const handleExport = useCallback(() => {
    const tilesArray = Array.from(tiles.values());

    // Validate before export
    const validation = validateScenario(tiles, objectives, metadata);

    // Convert to scenario-compatible format
    const exportData = {
      metadata,
      objectives,
      triggers,
      doomEvents,
      tiles: tilesArray.map(tile => ({
        id: tile.id,
        q: tile.q,
        r: tile.r,
        templateId: tile.templateId,
        name: tile.name,
        category: tile.category,
        subType: tile.subType,
        edges: tile.edges,
        doorConfigs: tile.doorConfigs,
        floorType: tile.floorType,
        zoneLevel: tile.zoneLevel,
        rotation: tile.rotation,
        description: tile.description,
        customDescription: tile.customDescription,
        watermarkIcon: tile.watermarkIcon,
        isStartLocation: tile.isStartLocation,
        monsters: tile.monsters,
        items: tile.items,
        npcs: tile.npcs,
      })),
      validation: {
        isValid: validation.isValid,
        errorCount: validation.issues.filter(i => i.severity === 'error').length,
        warningCount: validation.issues.filter(i => i.severity === 'warning').length,
      },
      exportedAt: new Date().toISOString(),
      version: '3.1'  // Updated version for Triggers
    };

    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `scenario_${metadata.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [tiles, metadata, objectives]);

  // ============================================================================
  // JSON IMPORT
  // ============================================================================

  const handleImport = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);

        // Validate and import
        if (data.tiles && Array.isArray(data.tiles)) {
          recordAction(`Import scenario: ${data.metadata?.title || file.name}`);

          const newTiles = new Map<string, EditorTile>();

          for (const tile of data.tiles) {
            const key = getTileKey(tile.q, tile.r);
            newTiles.set(key, tile as EditorTile);
          }

          setTiles(newTiles);

          if (data.metadata) {
            setMetadata(data.metadata);
          }

          if (data.objectives && Array.isArray(data.objectives)) {
            setObjectives(data.objectives);
          }

          if (data.triggers && Array.isArray(data.triggers)) {
            setTriggers(data.triggers);
          }

          if (data.doomEvents && Array.isArray(data.doomEvents)) {
            setDoomEvents(data.doomEvents);
          }

          setSelectedTileId(null);
        }
      } catch (err) {
        console.error('Failed to import scenario:', err);
        alert('Failed to import scenario. Invalid JSON format.');
      }
    };
    reader.readAsText(file);

    // Reset input
    e.target.value = '';
  }, [recordAction]);

  // ============================================================================
  // RENDER
  // ============================================================================

  const selectedTile = selectedTileId ? tiles.get(selectedTileId) : null;

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-900 overflow-hidden">
      {/* Top toolbar */}
      <div className="h-14 bg-slate-800 border-b border-slate-700 flex items-center px-4 gap-4 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-slate-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="h-6 w-px bg-slate-600" />

        <div className="flex-1 flex items-center gap-2">
          <input
            type="text"
            value={metadata.title}
            onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
            className="bg-slate-700 text-white px-3 py-1 rounded text-sm w-64 border border-slate-600 focus:border-amber-500 focus:outline-none"
            placeholder="Scenario Title"
          />
        </div>

        {/* Tool buttons */}
        <div className="flex items-center gap-1 bg-slate-700/50 rounded-lg p-1">
          <Button
            variant={activeTool === 'select' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTool('select')}
            className={activeTool === 'select' ? 'bg-amber-600' : 'text-slate-300'}
            title="Select tool (S)"
          >
            <MousePointer className="w-4 h-4" />
          </Button>
          <Button
            variant={activeTool === 'place' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTool('place')}
            className={activeTool === 'place' ? 'bg-amber-600' : 'text-slate-300'}
            title="Place tool (P)"
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={activeTool === 'erase' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTool('erase')}
            className={activeTool === 'erase' ? 'bg-red-600' : 'text-slate-300'}
            title="Erase tool (E)"
          >
            <Eraser className="w-4 h-4" />
          </Button>
        </div>

        <div className="h-6 w-px bg-slate-600" />

        {/* Rotation button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRotate}
          disabled={!selectedTemplate?.canRotate}
          className="text-slate-300 hover:text-white disabled:opacity-50"
          title="Rotate tile (R)"
        >
          <RotateCw className="w-4 h-4 mr-1" />
          {rotation * 60}°
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowGrid(!showGrid)}
          className={`${showGrid ? 'text-amber-400' : 'text-slate-300'} hover:text-white`}
          title="Toggle grid"
        >
          <Grid3X3 className="w-4 h-4" />
        </Button>

        <div className="h-6 w-px bg-slate-600" />

        {/* Preview button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowPreview(true)}
          disabled={tiles.size === 0}
          className="text-green-400 hover:text-green-300 disabled:opacity-50"
          title="Preview scenario"
        >
          <Play className="w-4 h-4 mr-1" />
          Preview
        </Button>

        <div className="h-6 w-px bg-slate-600" />

        {/* Undo/Redo */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUndo}
            disabled={!canUndo}
            className="text-slate-300 hover:text-white disabled:opacity-30"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRedo}
            disabled={!canRedo}
            className="text-slate-300 hover:text-white disabled:opacity-30"
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 className="w-4 h-4" />
          </Button>
        </div>

        <div className="h-6 w-px bg-slate-600" />

        {/* File operations */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleImport}
          className="text-slate-300 hover:text-white"
          title="Import scenario"
        >
          <Upload className="w-4 h-4" />
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileSelect}
          className="hidden"
        />

        <Button
          variant="ghost"
          size="sm"
          onClick={handleExport}
          className="text-slate-300 hover:text-white"
          title="Export scenario"
        >
          <Download className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearAll}
          className="text-red-400 hover:text-red-300"
          title="Clear all tiles"
        >
          <Trash2 className="w-4 h-4" />
        </Button>

        <div className="text-slate-400 text-sm">
          {tiles.size} tiles
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar - Tile palette */}
        <TilePalette
          selectedTemplate={selectedTemplate}
          onSelectTemplate={handleSelectTemplate}
          rotation={rotation}
        />

        {/* Center - Canvas */}
        <div className="flex-1 relative">
          <EditorCanvas
            tiles={tiles}
            selectedTileId={selectedTileId}
            onTileClick={handleCanvasClick}
            showGrid={showGrid}
            activeTool={activeTool}
            selectedTemplate={selectedTemplate}
            rotation={rotation}
          />
        </div>

        {/* Right sidebar - Tabbed panel */}
        <div className="w-80 bg-slate-800 border-l border-slate-700 flex flex-col overflow-hidden">
          {/* Tab buttons */}
          <div className="flex border-b border-slate-700 shrink-0">
            <button
              onClick={() => setRightPanelTab('properties')}
              className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 text-xs font-medium transition-colors ${
                rightPanelTab === 'properties'
                  ? 'bg-slate-700 text-amber-400 border-b-2 border-amber-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              Tile
            </button>
            <button
              onClick={() => setRightPanelTab('monsters')}
              className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 text-xs font-medium transition-colors ${
                rightPanelTab === 'monsters'
                  ? 'bg-slate-700 text-red-400 border-b-2 border-red-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Skull className="w-3.5 h-3.5" />
              Monsters
            </button>
            <button
              onClick={() => setRightPanelTab('items')}
              className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 text-xs font-medium transition-colors ${
                rightPanelTab === 'items'
                  ? 'bg-slate-700 text-green-400 border-b-2 border-green-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              Items
            </button>
            <button
              onClick={() => setRightPanelTab('npcs')}
              className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 text-xs font-medium transition-colors ${
                rightPanelTab === 'npcs'
                  ? 'bg-slate-700 text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              NPCs
            </button>
            <button
              onClick={() => setRightPanelTab('objectives')}
              className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 text-xs font-medium transition-colors ${
                rightPanelTab === 'objectives'
                  ? 'bg-slate-700 text-purple-400 border-b-2 border-purple-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              Goals
            </button>
            <button
              onClick={() => setRightPanelTab('triggers')}
              className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 text-xs font-medium transition-colors ${
                rightPanelTab === 'triggers'
                  ? 'bg-slate-700 text-yellow-400 border-b-2 border-yellow-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              Triggers
            </button>
            <button
              onClick={() => setRightPanelTab('doom')}
              className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 text-xs font-medium transition-colors ${
                rightPanelTab === 'doom'
                  ? 'bg-slate-700 text-red-400 border-b-2 border-red-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Doom
            </button>
            <button
              onClick={() => setRightPanelTab('validate')}
              className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 text-xs font-medium transition-colors ${
                rightPanelTab === 'validate'
                  ? 'bg-slate-700 text-green-400 border-b-2 border-green-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Validate
            </button>
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* PROPERTIES TAB */}
            {rightPanelTab === 'properties' && (
              <>
                {selectedTile ? (
                  <div className="space-y-4">
                    {/* Basic info */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-slate-400 text-xs">Name</span>
                        <div className="text-white truncate">{selectedTile.name}</div>
                      </div>
                      <div>
                        <span className="text-slate-400 text-xs">Category</span>
                        <div className="text-white capitalize">{selectedTile.category}</div>
                      </div>
                      <div>
                        <span className="text-slate-400 text-xs">Position</span>
                        <div className="text-white">q:{selectedTile.q}, r:{selectedTile.r}</div>
                      </div>
                      <div>
                        <span className="text-slate-400 text-xs">Zone</span>
                        <div className="text-white">{selectedTile.zoneLevel}</div>
                      </div>
                    </div>

                    {/* Start location */}
                    <div className="border-t border-slate-600 pt-3">
                      <label className="flex items-center gap-2 text-white cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedTile.isStartLocation || false}
                          onChange={(e) => {
                            const key = getTileKey(selectedTile.q, selectedTile.r);
                            recordAction(e.target.checked ? 'Set start location' : 'Remove start location');
                            setTiles(prev => {
                              const newTiles = new Map(prev);
                              const tile = newTiles.get(key);
                              if (tile) {
                                if (e.target.checked) {
                                  newTiles.forEach((t, k) => {
                                    if (t.isStartLocation) {
                                      newTiles.set(k, { ...t, isStartLocation: false });
                                    }
                                  });
                                }
                                newTiles.set(key, { ...tile, isStartLocation: e.target.checked });
                              }
                              return newTiles;
                            });
                          }}
                          className="accent-amber-500"
                        />
                        <span className="text-sm">Start Location</span>
                      </label>
                    </div>

                    {/* Edge Configuration */}
                    <div className="border-t border-slate-600 pt-3">
                      <EdgeConfigPanel
                        edges={selectedTile.edges}
                        onEdgeChange={(index, newType) => {
                          const key = getTileKey(selectedTile.q, selectedTile.r);
                          recordAction(`Change edge ${index} to ${newType}`);
                          setTiles(prev => {
                            const newTiles = new Map(prev);
                            const tile = newTiles.get(key);
                            if (tile) {
                              const newEdges = [...tile.edges] as typeof tile.edges;
                              newEdges[index] = newType;
                              // Also update doorConfigs when edge changes to/from DOOR
                              let doorConfigs = { ...tile.doorConfigs };
                              if (newType === 'DOOR' && !doorConfigs[index]) {
                                doorConfigs[index] = { state: 'CLOSED' };
                              } else if (newType !== 'DOOR' && doorConfigs[index]) {
                                delete doorConfigs[index];
                              }
                              newTiles.set(key, { ...tile, edges: newEdges, doorConfigs });
                            }
                            return newTiles;
                          });
                        }}
                      />
                    </div>

                    {/* Door Configuration (only if there are DOOR edges) */}
                    {selectedTile.edges.some(e => e === 'DOOR') && (
                      <div className="border-t border-slate-600 pt-3">
                        <DoorConfigPanel
                          edges={selectedTile.edges}
                          doorConfigs={selectedTile.doorConfigs}
                          onDoorConfigChange={(edgeIndex, config) => {
                            const key = getTileKey(selectedTile.q, selectedTile.r);
                            recordAction(`Change door ${edgeIndex} config`);
                            setTiles(prev => {
                              const newTiles = new Map(prev);
                              const tile = newTiles.get(key);
                              if (tile) {
                                const doorConfigs = { ...tile.doorConfigs };
                                if (config) {
                                  doorConfigs[edgeIndex] = config;
                                } else {
                                  delete doorConfigs[edgeIndex];
                                }
                                newTiles.set(key, { ...tile, doorConfigs });
                              }
                              return newTiles;
                            });
                          }}
                        />
                      </div>
                    )}

                    {/* Custom Description */}
                    <div className="border-t border-slate-600 pt-3">
                      <label className="text-slate-400 text-xs block mb-1">Custom In-Game Description</label>
                      <textarea
                        value={selectedTile.customDescription || ''}
                        onChange={(e) => {
                          const key = getTileKey(selectedTile.q, selectedTile.r);
                          setTiles(prev => {
                            const newTiles = new Map(prev);
                            const tile = newTiles.get(key);
                            if (tile) {
                              newTiles.set(key, { ...tile, customDescription: e.target.value || undefined });
                            }
                            return newTiles;
                          });
                        }}
                        className="w-full bg-slate-700 text-white px-2 py-1 rounded text-sm border border-slate-600 h-16 resize-none"
                        placeholder="Custom description shown when player enters this tile..."
                      />
                    </div>

                    {selectedTile.description && (
                      <div className="border-t border-slate-600 pt-3">
                        <span className="text-slate-400 text-xs">Template Description</span>
                        <div className="text-slate-300 text-sm italic mt-1">"{selectedTile.description}"</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-slate-500 text-sm text-center py-8">
                    Select a tile to view and edit its properties
                  </div>
                )}

                {/* Scenario metadata section */}
                <div className="mt-6 pt-4 border-t border-slate-600">
                  <h3 className="text-white font-semibold mb-3">Scenario Settings</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-slate-400 text-xs block mb-1">Start Doom</label>
                      <input
                        type="number"
                        value={metadata.startDoom}
                        onChange={(e) => setMetadata(prev => ({ ...prev, startDoom: parseInt(e.target.value) || 12 }))}
                        className="w-full bg-slate-700 text-white px-2 py-1 rounded text-sm border border-slate-600"
                        min={1}
                        max={20}
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-xs block mb-1">Difficulty</label>
                      <select
                        value={metadata.difficulty}
                        onChange={(e) => setMetadata(prev => ({ ...prev, difficulty: e.target.value as ScenarioMetadata['difficulty'] }))}
                        className="w-full bg-slate-700 text-white px-2 py-1 rounded text-sm border border-slate-600"
                      >
                        <option value="easy">Easy</option>
                        <option value="normal">Normal</option>
                        <option value="hard">Hard</option>
                        <option value="nightmare">Nightmare</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-400 text-xs block mb-1">Briefing</label>
                      <textarea
                        value={metadata.briefing}
                        onChange={(e) => setMetadata(prev => ({ ...prev, briefing: e.target.value }))}
                        className="w-full bg-slate-700 text-white px-2 py-1 rounded text-sm border border-slate-600 h-16 resize-none"
                        placeholder="Opening text shown to player..."
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-xs block mb-1">Description</label>
                      <textarea
                        value={metadata.description}
                        onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full bg-slate-700 text-white px-2 py-1 rounded text-sm border border-slate-600 h-16 resize-none"
                        placeholder="Scenario description..."
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* MONSTERS TAB */}
            {rightPanelTab === 'monsters' && (
              <>
                {selectedTile ? (
                  <MonsterPalette
                    monsters={(selectedTile.monsters || []) as MonsterPlacement[]}
                    onMonstersChange={(monsters) => {
                      const key = getTileKey(selectedTile.q, selectedTile.r);
                      recordAction('Update monsters');
                      setTiles(prev => {
                        const newTiles = new Map(prev);
                        const tile = newTiles.get(key);
                        if (tile) {
                          newTiles.set(key, { ...tile, monsters });
                        }
                        return newTiles;
                      });
                    }}
                  />
                ) : (
                  <div className="text-slate-500 text-sm text-center py-8">
                    Select a tile to place monsters
                  </div>
                )}
              </>
            )}

            {/* ITEMS TAB */}
            {rightPanelTab === 'items' && (
              <>
                {selectedTile ? (
                  <ItemPalette
                    items={(selectedTile.items || []) as QuestItemPlacement[]}
                    onItemsChange={(items) => {
                      const key = getTileKey(selectedTile.q, selectedTile.r);
                      recordAction('Update items');
                      setTiles(prev => {
                        const newTiles = new Map(prev);
                        const tile = newTiles.get(key);
                        if (tile) {
                          newTiles.set(key, { ...tile, items });
                        }
                        return newTiles;
                      });
                    }}
                  />
                ) : (
                  <div className="text-slate-500 text-sm text-center py-8">
                    Select a tile to place items
                  </div>
                )}
              </>
            )}

            {/* NPCS TAB */}
            {rightPanelTab === 'npcs' && (
              <>
                {selectedTile ? (
                  <NPCPalette
                    npcs={(selectedTile.npcs || []) as NPCPlacement[]}
                    onNPCsChange={(npcs) => {
                      const key = getTileKey(selectedTile.q, selectedTile.r);
                      recordAction('Update NPCs');
                      setTiles(prev => {
                        const newTiles = new Map(prev);
                        const tile = newTiles.get(key);
                        if (tile) {
                          newTiles.set(key, { ...tile, npcs });
                        }
                        return newTiles;
                      });
                    }}
                  />
                ) : (
                  <div className="text-slate-500 text-sm text-center py-8">
                    Select a tile to place NPCs
                  </div>
                )}
              </>
            )}

            {/* OBJECTIVES TAB */}
            {rightPanelTab === 'objectives' && (
              <ObjectivesPanel
                objectives={objectives}
                onObjectivesChange={(newObjectives) => {
                  recordAction('Update objectives');
                  setObjectives(newObjectives);
                }}
              />
            )}

            {/* TRIGGERS TAB */}
            {rightPanelTab === 'triggers' && (
              <TriggerPanel
                triggers={triggers}
                onTriggersChange={(newTriggers) => {
                  recordAction('Update triggers');
                  setTriggers(newTriggers);
                }}
                objectives={objectives}
              />
            )}

            {/* DOOM EVENTS TAB */}
            {rightPanelTab === 'doom' && (
              <DoomEventsPanel
                doomEvents={doomEvents}
                onDoomEventsChange={(newDoomEvents) => {
                  recordAction('Update doom events');
                  setDoomEvents(newDoomEvents);
                }}
                startDoom={metadata.startDoom}
              />
            )}

            {/* VALIDATE TAB */}
            {rightPanelTab === 'validate' && (
              <ValidationPanel
                tiles={tiles}
                objectives={objectives}
                metadata={metadata}
                onSelectTile={(tileId) => {
                  // Find tile by id and select it
                  const tile = Array.from(tiles.values()).find(t => t.id === tileId);
                  if (tile) {
                    const key = getTileKey(tile.q, tile.r);
                    setSelectedTileId(key);
                    setRightPanelTab('properties');
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="h-8 bg-slate-800 border-t border-slate-700 flex items-center px-4 text-sm text-slate-400 shrink-0">
        <span>
          {activeTool === 'place' && selectedTemplate
            ? `Placing: ${selectedTemplate.name}`
            : activeTool === 'erase'
            ? 'Click to erase tiles'
            : activeTool === 'select'
            ? 'Click to select tiles'
            : 'Select a tool'}
        </span>
        {lastAction && (
          <span className="ml-4 text-slate-500 text-xs">
            Last: {lastAction}
          </span>
        )}
        <span className="ml-auto text-xs">
          Ctrl+Z=Undo | Ctrl+Shift+Z=Redo | S=Select | P=Place | E=Erase | R=Rotate
        </span>
      </div>

      {/* Preview Panel */}
      {showPreview && (
        <PreviewPanel
          tiles={tiles}
          objectives={objectives}
          metadata={metadata}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};

export default QuestEditor;
