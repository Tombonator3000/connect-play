/**
 * QUEST EDITOR - Fase 1
 *
 * Visuell hex-editor for å lage scenarios manuelt.
 * Lar brukeren plassere tiles på et grid og eksportere til JSON.
 */

import React, { useState, useCallback, useRef } from 'react';
import { ArrowLeft, Download, Trash2, RotateCw, Save, Upload, Grid3X3, Eraser, MousePointer } from 'lucide-react';
import { TileTemplate, ConnectionEdgeType, rotateEdges } from '../../tileConnectionSystem';
import { TileCategory, FloorType, ZoneLevel, EdgeData, Item } from '../../types';
import { Button } from '@/components/ui/button';
import EditorCanvas from './EditorCanvas';
import TilePalette from './TilePalette';

// ============================================================================
// EDITOR TYPES
// ============================================================================

export interface EditorTile {
  id: string;
  q: number;
  r: number;
  templateId: string;
  name: string;
  category: TileCategory;
  subType: string;
  edges: [ConnectionEdgeType, ConnectionEdgeType, ConnectionEdgeType, ConnectionEdgeType, ConnectionEdgeType, ConnectionEdgeType];
  floorType: FloorType;
  zoneLevel: ZoneLevel;
  rotation: number; // 0-5, number of 60-degree rotations
  description?: string;
  watermarkIcon?: string;
  // Placement data
  isStartLocation?: boolean;
  monsters?: { type: string; count: number }[];
  items?: Item[];
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

  // View state
  const [showGrid, setShowGrid] = useState(true);

  // Ref for file input
  const fileInputRef = useRef<HTMLInputElement>(null);

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

      setTiles(prev => {
        const newTiles = new Map(prev);
        newTiles.set(key, newTile);
        return newTiles;
      });

      setSelectedTileId(key);
    }
  }, [activeTool, selectedTemplate, rotation, tiles, selectedTileId]);

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
    if (tiles.size > 0 && window.confirm('Clear all tiles? This cannot be undone.')) {
      setTiles(new Map());
      setSelectedTileId(null);
    }
  }, [tiles.size]);

  // ============================================================================
  // JSON EXPORT
  // ============================================================================

  const handleExport = useCallback(() => {
    const tilesArray = Array.from(tiles.values());

    // Convert to scenario-compatible format
    const exportData = {
      metadata,
      tiles: tilesArray.map(tile => ({
        id: tile.id,
        q: tile.q,
        r: tile.r,
        templateId: tile.templateId,
        name: tile.name,
        category: tile.category,
        subType: tile.subType,
        edges: tile.edges,
        floorType: tile.floorType,
        zoneLevel: tile.zoneLevel,
        rotation: tile.rotation,
        description: tile.description,
        watermarkIcon: tile.watermarkIcon,
        isStartLocation: tile.isStartLocation,
        monsters: tile.monsters,
        items: tile.items,
      })),
      exportedAt: new Date().toISOString(),
      version: '1.0'
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
  }, [tiles, metadata]);

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
          const newTiles = new Map<string, EditorTile>();

          for (const tile of data.tiles) {
            const key = getTileKey(tile.q, tile.r);
            newTiles.set(key, tile as EditorTile);
          }

          setTiles(newTiles);

          if (data.metadata) {
            setMetadata(data.metadata);
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
  }, []);

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

        {/* Right sidebar - Properties panel */}
        <div className="w-72 bg-slate-800 border-l border-slate-700 p-4 overflow-y-auto">
          <h3 className="text-white font-semibold mb-4">Properties</h3>

          {selectedTile ? (
            <div className="space-y-4">
              <div>
                <label className="text-slate-400 text-sm">Name</label>
                <div className="text-white">{selectedTile.name}</div>
              </div>

              <div>
                <label className="text-slate-400 text-sm">Category</label>
                <div className="text-white capitalize">{selectedTile.category}</div>
              </div>

              <div>
                <label className="text-slate-400 text-sm">Position</label>
                <div className="text-white">q: {selectedTile.q}, r: {selectedTile.r}</div>
              </div>

              <div>
                <label className="text-slate-400 text-sm">Zone Level</label>
                <div className="text-white">{selectedTile.zoneLevel}</div>
              </div>

              <div>
                <label className="text-slate-400 text-sm">Floor Type</label>
                <div className="text-white capitalize">{selectedTile.floorType}</div>
              </div>

              <div>
                <label className="text-slate-400 text-sm">Edges</label>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  {['N', 'NE', 'SE', 'S', 'SW', 'NW'].map((dir, i) => (
                    <div key={dir} className="text-slate-300">
                      {dir}: <span className="text-amber-400">{selectedTile.edges[i]}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-600 pt-4">
                <label className="flex items-center gap-2 text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTile.isStartLocation || false}
                    onChange={(e) => {
                      const key = getTileKey(selectedTile.q, selectedTile.r);
                      setTiles(prev => {
                        const newTiles = new Map(prev);
                        const tile = newTiles.get(key);
                        if (tile) {
                          // If setting as start, clear other start locations
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
                  Start Location
                </label>
              </div>

              {selectedTile.description && (
                <div>
                  <label className="text-slate-400 text-sm">Description</label>
                  <div className="text-slate-300 text-sm italic">"{selectedTile.description}"</div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-slate-500 text-sm">
              Select a tile to view its properties
            </div>
          )}

          {/* Scenario metadata section */}
          <div className="mt-8 pt-4 border-t border-slate-600">
            <h3 className="text-white font-semibold mb-4">Scenario Settings</h3>

            <div className="space-y-3">
              <div>
                <label className="text-slate-400 text-sm block mb-1">Start Doom</label>
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
                <label className="text-slate-400 text-sm block mb-1">Difficulty</label>
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
                <label className="text-slate-400 text-sm block mb-1">Description</label>
                <textarea
                  value={metadata.description}
                  onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-slate-700 text-white px-2 py-1 rounded text-sm border border-slate-600 h-20 resize-none"
                  placeholder="Scenario description..."
                />
              </div>
            </div>
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
        <span className="ml-auto">
          Keyboard: S=Select, P=Place, E=Erase, R=Rotate, Delete=Remove selected
        </span>
      </div>
    </div>
  );
};

export default QuestEditor;
