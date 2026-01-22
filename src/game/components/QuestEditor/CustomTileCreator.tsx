/**
 * CUSTOM TILE CREATOR
 *
 * Allows users to create custom tiles with their own graphics.
 * - Image upload (drag & drop or file picker)
 * - Define tile properties (name, category, edges, floor type, etc.)
 * - Save to localStorage for use in scenarios
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  X, Upload, Image as ImageIcon, Plus, Trash2, Save,
  ChevronDown, ChevronRight, Eye, Download, FileUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TileCategory, FloorType, ZoneLevel } from '../../types';
import { ConnectionEdgeType } from '../../tileConnectionSystem';

// ============================================================================
// TYPES
// ============================================================================

export interface CustomTileTemplate {
  id: string;
  name: string;
  category: TileCategory;
  subType: string;
  description: string;
  floorType: FloorType;
  zoneLevel: ZoneLevel;
  edges: [ConnectionEdgeType, ConnectionEdgeType, ConnectionEdgeType, ConnectionEdgeType, ConnectionEdgeType, ConnectionEdgeType];
  canRotate: boolean;
  watermarkIcon?: string;
  // Custom graphics
  customImage?: string; // Base64 encoded image
  imageScale?: number;  // Scale factor for the image (0.5 - 2.0)
  createdAt: string;
  isCustom: true;
}

interface CustomTileCreatorProps {
  onClose: () => void;
  onSave: (tile: CustomTileTemplate) => void;
  editingTile?: CustomTileTemplate;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CATEGORIES: { value: TileCategory; label: string }[] = [
  { value: 'nature', label: 'Nature' },
  { value: 'urban', label: 'Urban' },
  { value: 'street', label: 'Street' },
  { value: 'facade', label: 'Facade' },
  { value: 'foyer', label: 'Foyer' },
  { value: 'corridor', label: 'Corridor' },
  { value: 'room', label: 'Room' },
  { value: 'stairs', label: 'Stairs' },
  { value: 'basement', label: 'Basement' },
  { value: 'crypt', label: 'Crypt' },
];

const FLOOR_TYPES: { value: FloorType; label: string }[] = [
  { value: 'wood', label: 'Wood' },
  { value: 'cobblestone', label: 'Cobblestone' },
  { value: 'tile', label: 'Tile' },
  { value: 'stone', label: 'Stone' },
  { value: 'grass', label: 'Grass' },
  { value: 'dirt', label: 'Dirt' },
  { value: 'water', label: 'Water' },
  { value: 'ritual', label: 'Ritual' },
];

const ZONE_LEVELS: { value: ZoneLevel; label: string }[] = [
  { value: -2, label: '-2 (Deep Underground)' },
  { value: -1, label: '-1 (Basement)' },
  { value: 0, label: '0 (Exterior/Ground)' },
  { value: 1, label: '1 (Ground Floor)' },
  { value: 2, label: '2 (Upper Floors)' },
];

const EDGE_TYPES: { value: ConnectionEdgeType; label: string; color: string }[] = [
  { value: 'WALL', label: 'Wall', color: '#4b5563' },
  { value: 'OPEN', label: 'Open', color: '#22c55e' },
  { value: 'DOOR', label: 'Door', color: '#f59e0b' },
  { value: 'WINDOW', label: 'Window', color: '#06b6d4' },
  { value: 'STREET', label: 'Street', color: '#94a3b8' },
  { value: 'NATURE', label: 'Nature', color: '#16a34a' },
  { value: 'WATER', label: 'Water', color: '#3b82f6' },
  { value: 'FACADE', label: 'Facade', color: '#f97316' },
  { value: 'STAIRS_UP', label: 'Stairs Up', color: '#a855f7' },
  { value: 'STAIRS_DOWN', label: 'Stairs Down', color: '#7c3aed' },
];

const EDGE_LABELS = ['Top-Right', 'Right', 'Bottom-Right', 'Bottom-Left', 'Left', 'Top-Left'];

const WATERMARK_ICONS = [
  'none', 'BookOpen', 'Bed', 'Utensils', 'FlaskConical', 'Church',
  'TreePine', 'Anchor', 'Skull', 'Lamp', 'Cross', 'Star',
  'Moon', 'Eye', 'Flame', 'Key', 'Lock', 'Scroll'
];

// ============================================================================
// COMPONENT
// ============================================================================

const CustomTileCreator: React.FC<CustomTileCreatorProps> = ({
  onClose,
  onSave,
  editingTile
}) => {
  // Form state
  const [name, setName] = useState(editingTile?.name || '');
  const [category, setCategory] = useState<TileCategory>(editingTile?.category || 'room');
  const [subType, setSubType] = useState(editingTile?.subType || 'custom');
  const [description, setDescription] = useState(editingTile?.description || '');
  const [floorType, setFloorType] = useState<FloorType>(editingTile?.floorType || 'wood');
  const [zoneLevel, setZoneLevel] = useState<ZoneLevel>(editingTile?.zoneLevel || 1);
  const [edges, setEdges] = useState<[ConnectionEdgeType, ConnectionEdgeType, ConnectionEdgeType, ConnectionEdgeType, ConnectionEdgeType, ConnectionEdgeType]>(
    editingTile?.edges || ['WALL', 'DOOR', 'WALL', 'WALL', 'WALL', 'WALL']
  );
  const [canRotate, setCanRotate] = useState(editingTile?.canRotate ?? true);
  const [watermarkIcon, setWatermarkIcon] = useState(editingTile?.watermarkIcon || 'none');
  const [customImage, setCustomImage] = useState<string | undefined>(editingTile?.customImage);
  const [imageScale, setImageScale] = useState(editingTile?.imageScale || 1.0);

  // UI state
  const [isDragging, setIsDragging] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Image handling
  const handleImageUpload = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Limit file size to 1MB
    if (file.size > 1024 * 1024) {
      alert('Image size must be less than 1MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setCustomImage(result);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleImageUpload(file);
    }
  }, [handleImageUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  }, [handleImageUpload]);

  const handleRemoveImage = useCallback(() => {
    setCustomImage(undefined);
  }, []);

  // Edge editing
  const handleEdgeChange = useCallback((index: number, value: ConnectionEdgeType) => {
    setEdges(prev => {
      const newEdges = [...prev] as typeof prev;
      newEdges[index] = value;
      return newEdges;
    });
  }, []);

  // Save tile
  const handleSave = useCallback(() => {
    if (!name.trim()) {
      alert('Please enter a name for the tile');
      return;
    }

    const tile: CustomTileTemplate = {
      id: editingTile?.id || `custom_tile_${Date.now()}`,
      name: name.trim(),
      category,
      subType: subType.trim() || 'custom',
      description: description.trim(),
      floorType,
      zoneLevel,
      edges,
      canRotate,
      watermarkIcon: watermarkIcon !== 'none' ? watermarkIcon : undefined,
      customImage,
      imageScale,
      createdAt: editingTile?.createdAt || new Date().toISOString(),
      isCustom: true,
    };

    onSave(tile);
    onClose();
  }, [name, category, subType, description, floorType, zoneLevel, edges, canRotate, watermarkIcon, customImage, imageScale, editingTile, onSave, onClose]);

  // Get floor color for preview
  const getFloorColor = (floor: FloorType): string => {
    const colors: Record<FloorType, string> = {
      wood: '#8B4513',
      cobblestone: '#708090',
      tile: '#E0E0E0',
      stone: '#4A4A4A',
      grass: '#228B22',
      dirt: '#8B5A2B',
      water: '#1E90FF',
      ritual: '#4B0082',
    };
    return colors[floor] || '#4A4A4A';
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-amber-400" />
            {editingTile ? 'Edit Custom Tile' : 'Create Custom Tile'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column - Form */}
            <div className="space-y-4">
              {/* Basic Info */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
                  Basic Information
                </h3>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:border-amber-500 focus:outline-none"
                    placeholder="e.g., Ancient Library"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as TileCategory)}
                      className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:border-amber-500 focus:outline-none"
                    >
                      {CATEGORIES.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Sub-Type</label>
                    <input
                      type="text"
                      value={subType}
                      onChange={(e) => setSubType(e.target.value)}
                      className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:border-amber-500 focus:outline-none"
                      placeholder="e.g., forbidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:border-amber-500 focus:outline-none h-20 resize-none"
                    placeholder="A mysterious chamber filled with ancient tomes..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Floor Type</label>
                    <select
                      value={floorType}
                      onChange={(e) => setFloorType(e.target.value as FloorType)}
                      className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:border-amber-500 focus:outline-none"
                    >
                      {FLOOR_TYPES.map(f => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Zone Level</label>
                    <select
                      value={zoneLevel}
                      onChange={(e) => setZoneLevel(Number(e.target.value) as ZoneLevel)}
                      className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:border-amber-500 focus:outline-none"
                    >
                      {ZONE_LEVELS.map(z => (
                        <option key={z.value} value={z.value}>{z.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Edges */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
                  Edge Configuration (6 sides)
                </h3>

                <div className="grid grid-cols-2 gap-2">
                  {edges.map((edge, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 w-20">{EDGE_LABELS[index]}</span>
                      <select
                        value={edge}
                        onChange={(e) => handleEdgeChange(index, e.target.value as ConnectionEdgeType)}
                        className="flex-1 bg-slate-700 text-white px-2 py-1 rounded border border-slate-600 text-sm"
                      >
                        {EDGE_TYPES.map(et => (
                          <option key={et.value} value={et.value}>{et.label}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>

                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={canRotate}
                    onChange={(e) => setCanRotate(e.target.checked)}
                    className="accent-amber-500"
                  />
                  <span className="text-sm">Allow rotation in editor</span>
                </label>
              </div>

              {/* Advanced Options */}
              <div className="border-t border-slate-700 pt-3">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-slate-400 hover:text-white text-sm"
                >
                  {showAdvanced ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  Advanced Options
                </button>

                {showAdvanced && (
                  <div className="mt-3 space-y-3">
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Watermark Icon</label>
                      <select
                        value={watermarkIcon}
                        onChange={(e) => setWatermarkIcon(e.target.value)}
                        className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:border-amber-500 focus:outline-none"
                      >
                        {WATERMARK_ICONS.map(icon => (
                          <option key={icon} value={icon}>
                            {icon === 'none' ? 'None' : icon}
                          </option>
                        ))}
                      </select>
                    </div>

                    {customImage && (
                      <div>
                        <label className="block text-sm text-slate-400 mb-1">
                          Image Scale: {imageScale.toFixed(1)}x
                        </label>
                        <input
                          type="range"
                          min="0.5"
                          max="2"
                          step="0.1"
                          value={imageScale}
                          onChange={(e) => setImageScale(Number(e.target.value))}
                          className="w-full accent-amber-500"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Image Upload & Preview */}
            <div className="space-y-4">
              {/* Image Upload */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
                  Custom Graphics (Optional)
                </h3>

                {!customImage ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                      border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                      ${isDragging
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-slate-600 hover:border-slate-500 bg-slate-700/30'
                      }
                    `}
                  >
                    <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-300 mb-1">
                      Drag & drop an image here
                    </p>
                    <p className="text-slate-500 text-sm">
                      or click to browse (max 1MB)
                    </p>
                    <p className="text-slate-600 text-xs mt-2">
                      Recommended: Square PNG, 200x200px or larger
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="bg-slate-700 rounded-lg p-4">
                      <img
                        src={customImage}
                        alt="Custom tile preview"
                        className="max-h-48 mx-auto rounded"
                        style={{ transform: `scale(${imageScale})` }}
                      />
                    </div>
                    <button
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 bg-red-600 hover:bg-red-500 text-white p-1 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute top-2 left-2 bg-slate-600 hover:bg-slate-500 text-white p-1 rounded"
                    >
                      <FileUp className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Preview */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Preview
                </h3>

                <div className="bg-slate-900 rounded-lg p-6 flex items-center justify-center">
                  {/* Hex preview */}
                  <div className="relative">
                    <svg width="160" height="140" viewBox="0 0 160 140">
                      {/* Hex shape */}
                      <polygon
                        points="80,10 145,45 145,95 80,130 15,95 15,45"
                        fill={getFloorColor(floorType)}
                        stroke="#374151"
                        strokeWidth="2"
                      />

                      {/* Custom image overlay */}
                      {customImage && (
                        <clipPath id="hexClip">
                          <polygon points="80,12 143,46 143,94 80,128 17,94 17,46" />
                        </clipPath>
                      )}
                      {customImage && (
                        <image
                          href={customImage}
                          x="15"
                          y="10"
                          width="130"
                          height="120"
                          clipPath="url(#hexClip)"
                          preserveAspectRatio="xMidYMid slice"
                          opacity="0.9"
                        />
                      )}

                      {/* Edge indicators */}
                      {edges.map((edge, i) => {
                        const edgeType = EDGE_TYPES.find(et => et.value === edge);
                        const angles = [30, 90, 150, 210, 270, 330];
                        const angle = angles[i] * (Math.PI / 180);
                        const cx = 80 + Math.cos(angle) * 55;
                        const cy = 70 + Math.sin(angle) * 45;

                        return (
                          <circle
                            key={i}
                            cx={cx}
                            cy={cy}
                            r="8"
                            fill={edgeType?.color || '#4b5563'}
                            stroke="#1e293b"
                            strokeWidth="2"
                          />
                        );
                      })}
                    </svg>

                    {/* Tile name */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      {!customImage && (
                        <span className="text-white text-xs font-medium text-center px-2 bg-black/50 rounded">
                          {name || 'Unnamed'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Edge legend */}
                <div className="flex flex-wrap gap-2 justify-center">
                  {edges.map((edge, i) => {
                    const edgeType = EDGE_TYPES.find(et => et.value === edge);
                    return (
                      <div key={i} className="flex items-center gap-1 text-xs">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: edgeType?.color }}
                        />
                        <span className="text-slate-400">{EDGE_LABELS[i]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-700 bg-slate-800/50">
          <div className="text-xs text-slate-500">
            Custom tiles are saved locally and can be used in your scenarios
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-amber-600 hover:bg-amber-500 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {editingTile ? 'Update Tile' : 'Create Tile'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomTileCreator;
