/**
 * SCENARIO TEMPLATES - Quick start templates for Quest Editor
 *
 * Provides:
 * - Quick Start templates (Escape, Investigation, Boss Hunt)
 * - Pre-made tile layouts (Small Manor, Church, Warehouse)
 * - Template browser with preview
 */

import React, { useState } from 'react';
import {
  BookOpen, Play, Map, Building, Church, Warehouse, Home, Skull,
  Search, DoorOpen, Eye, Grid3X3, Check, Package, Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EditorTile, ScenarioMetadata } from './index';
import { EditorObjective } from './ObjectivesPanel';
import { TileCategory, FloorType, ZoneLevel } from '../../types';
import { ConnectionEdgeType, TileTemplate, TILE_TEMPLATES } from '../../tileConnectionSystem';

// ============================================================================
// TYPES
// ============================================================================

export interface ScenarioTemplate {
  id: string;
  name: string;
  description: string;
  category: 'quick_start' | 'layout' | 'themed';
  icon: React.ElementType;
  iconColor: string;
  difficulty: 'easy' | 'normal' | 'hard';
  estimatedTime: string;
  metadata: Partial<ScenarioMetadata>;
  tiles: EditorTile[];
  objectives: EditorObjective[];
  tags: string[];
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateId(): string {
  return `tile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function createEditorTile(
  q: number,
  r: number,
  name: string,
  category: TileCategory,
  subType: string,
  floorType: FloorType = 'wood',
  edges: ConnectionEdgeType[] = ['WALL', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL'],
  isStart: boolean = false
): EditorTile {
  return {
    id: generateId(),
    q,
    r,
    templateId: `${category}_${subType}`,
    name,
    category,
    subType,
    edges: edges as [ConnectionEdgeType, ConnectionEdgeType, ConnectionEdgeType, ConnectionEdgeType, ConnectionEdgeType, ConnectionEdgeType],
    floorType,
    zoneLevel: 'safe',
    rotation: 0,
    isStartLocation: isStart
  };
}

function createObjective(
  name: string,
  type: EditorObjective['type'],
  description: string,
  isRequired: boolean = true,
  targetCount: number = 1
): EditorObjective {
  return {
    id: `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    name,
    description,
    isRequired,
    targetCount,
    currentProgress: 0,
    isHidden: false
  };
}

// ============================================================================
// QUICK START TEMPLATES
// ============================================================================

const ESCAPE_TEMPLATE: ScenarioTemplate = {
  id: 'escape_basic',
  name: 'Escape the Manor',
  description: 'A classic escape scenario. Fight through enemies to reach the exit before doom rises.',
  category: 'quick_start',
  icon: DoorOpen,
  iconColor: 'text-green-400',
  difficulty: 'normal',
  estimatedTime: '30-45 min',
  metadata: {
    title: 'Escape the Manor',
    description: 'Darkness has fallen. The only way out is through the front gates.',
    briefing: 'You must escape the manor before the ancient evil fully awakens. Find your way to the exit and survive!',
    startDoom: 10,
    difficulty: 'normal',
    theme: 'gothic'
  },
  tiles: [
    createEditorTile(0, 0, 'Study', 'interior_room', 'study', 'wood', ['WALL', 'DOOR', 'WALL', 'WALL', 'WALL', 'WALL'], true),
    createEditorTile(1, 0, 'Hallway', 'corridor', 'hallway', 'wood', ['DOOR', 'OPEN', 'WALL', 'WALL', 'OPEN', 'WALL']),
    createEditorTile(2, 0, 'Dining Room', 'interior_room', 'dining', 'wood', ['WALL', 'OPEN', 'DOOR', 'WALL', 'WALL', 'OPEN']),
    createEditorTile(2, 1, 'Kitchen', 'utility', 'kitchen', 'stone', ['WALL', 'WALL', 'WALL', 'WALL', 'DOOR', 'WALL']),
    createEditorTile(3, 0, 'Foyer', 'entrance', 'entrance_hall', 'marble', ['OPEN', 'WALL', 'WALL', 'DOOR', 'WALL', 'WALL']),
    createEditorTile(4, 0, 'Exit Gate', 'outdoor', 'courtyard', 'dirt', ['DOOR', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL']),
  ],
  objectives: [
    createObjective('Escape the Manor', 'escape', 'Reach the exit gate to escape'),
    createObjective('Survive', 'survive', 'Keep at least one investigator alive', true, 1)
  ],
  tags: ['escape', 'horror', 'combat', 'beginner-friendly']
};

const INVESTIGATION_TEMPLATE: ScenarioTemplate = {
  id: 'investigation_basic',
  name: 'The Mystery',
  description: 'Gather clues and uncover the truth. Focus on exploration and investigation.',
  category: 'quick_start',
  icon: Search,
  iconColor: 'text-blue-400',
  difficulty: 'normal',
  estimatedTime: '45-60 min',
  metadata: {
    title: 'The Mystery',
    description: 'Strange occurrences plague the old library. Investigate and discover what lurks within.',
    briefing: 'Reports of missing researchers and strange sounds have drawn your attention. Find the clues and uncover the truth before it is too late.',
    startDoom: 12,
    difficulty: 'normal',
    theme: 'investigation'
  },
  tiles: [
    createEditorTile(0, 0, 'Library Entrance', 'entrance', 'entrance_hall', 'marble', ['WALL', 'OPEN', 'WALL', 'WALL', 'WALL', 'WALL'], true),
    createEditorTile(1, 0, 'Main Hall', 'interior_room', 'grand_hall', 'marble', ['OPEN', 'OPEN', 'WALL', 'DOOR', 'OPEN', 'WALL']),
    createEditorTile(1, -1, 'Reading Room', 'interior_room', 'study', 'wood', ['WALL', 'WALL', 'OPEN', 'WALL', 'WALL', 'WALL']),
    createEditorTile(2, 0, 'Archives', 'storage', 'archive', 'wood', ['OPEN', 'DOOR', 'WALL', 'WALL', 'WALL', 'OPEN']),
    createEditorTile(3, 0, 'Restricted Section', 'interior_room', 'ritual_chamber', 'stone', ['DOOR', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL']),
    createEditorTile(2, 1, 'Storage', 'storage', 'storage', 'stone', ['WALL', 'WALL', 'DOOR', 'WALL', 'WALL', 'WALL']),
  ],
  objectives: [
    createObjective('Find 3 Clues', 'collect', 'Discover clues hidden throughout the library', true, 3),
    createObjective('Uncover the Secret', 'interact', 'Find the entrance to the hidden chamber'),
    createObjective('Survive', 'survive', 'Keep at least one investigator alive', true, 1)
  ],
  tags: ['investigation', 'clues', 'exploration', 'mystery']
};

const BOSS_HUNT_TEMPLATE: ScenarioTemplate = {
  id: 'boss_hunt_basic',
  name: 'Boss Hunt',
  description: 'Track down and defeat a powerful enemy. Combat-focused with high stakes.',
  category: 'quick_start',
  icon: Skull,
  iconColor: 'text-red-400',
  difficulty: 'hard',
  estimatedTime: '45-60 min',
  metadata: {
    title: 'The Beast Below',
    description: 'A terrible creature lurks in the depths. You must destroy it before it destroys everything.',
    briefing: 'An ancient evil has awakened in the caverns below the town. Descend into darkness and put an end to its reign of terror.',
    startDoom: 8,
    difficulty: 'hard',
    theme: 'combat'
  },
  tiles: [
    createEditorTile(0, 0, 'Cave Entrance', 'outdoor', 'forest_clearing', 'dirt', ['WALL', 'OPEN', 'WALL', 'WALL', 'WALL', 'WALL'], true),
    createEditorTile(1, 0, 'Tunnel', 'corridor', 'tunnel', 'stone', ['OPEN', 'OPEN', 'WALL', 'WALL', 'WALL', 'WALL']),
    createEditorTile(2, 0, 'Cavern', 'interior_room', 'cavern', 'stone', ['OPEN', 'OPEN', 'OPEN', 'WALL', 'WALL', 'WALL']),
    createEditorTile(3, 0, 'Deep Cavern', 'interior_room', 'cavern', 'stone', ['OPEN', 'WALL', 'WALL', 'DOOR', 'WALL', 'WALL']),
    createEditorTile(2, 1, 'Side Passage', 'corridor', 'tunnel', 'stone', ['WALL', 'WALL', 'OPEN', 'WALL', 'WALL', 'WALL']),
    createEditorTile(4, 0, 'Boss Lair', 'interior_room', 'ritual_chamber', 'stone', ['DOOR', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL']),
  ],
  objectives: [
    createObjective('Kill the Beast', 'kill_boss', 'Defeat the ancient creature', true, 1),
    createObjective('Find Weakness', 'collect', 'Discover a weakness in side passages', false, 1),
    createObjective('Survive', 'survive', 'Keep at least one investigator alive', true, 1)
  ],
  tags: ['boss', 'combat', 'dungeon', 'challenging']
};

// ============================================================================
// PRE-MADE LAYOUTS
// ============================================================================

const SMALL_MANOR_LAYOUT: ScenarioTemplate = {
  id: 'layout_small_manor',
  name: 'Small Manor',
  description: 'A cozy Victorian manor with 8 rooms. Perfect for short scenarios.',
  category: 'layout',
  icon: Home,
  iconColor: 'text-amber-400',
  difficulty: 'easy',
  estimatedTime: '20-30 min',
  metadata: {
    title: 'The Manor',
    description: 'A small manor awaits investigation.',
    briefing: 'Enter the manor and complete your objectives.',
    startDoom: 12,
    difficulty: 'normal',
    theme: 'gothic'
  },
  tiles: [
    createEditorTile(0, 0, 'Entrance Hall', 'entrance', 'entrance_hall', 'marble', ['WALL', 'OPEN', 'WALL', 'DOOR', 'WALL', 'WALL'], true),
    createEditorTile(1, 0, 'Parlor', 'interior_room', 'sitting_room', 'wood', ['OPEN', 'WALL', 'WALL', 'WALL', 'OPEN', 'WALL']),
    createEditorTile(0, -1, 'Study', 'interior_room', 'study', 'wood', ['WALL', 'WALL', 'DOOR', 'WALL', 'WALL', 'WALL']),
    createEditorTile(1, 1, 'Dining Room', 'interior_room', 'dining', 'wood', ['WALL', 'WALL', 'OPEN', 'DOOR', 'WALL', 'WALL']),
    createEditorTile(2, 1, 'Kitchen', 'utility', 'kitchen', 'stone', ['WALL', 'WALL', 'DOOR', 'WALL', 'WALL', 'WALL']),
    createEditorTile(-1, 0, 'Hallway', 'corridor', 'hallway', 'wood', ['DOOR', 'WALL', 'WALL', 'WALL', 'OPEN', 'WALL']),
    createEditorTile(-1, 1, 'Cellar Stairs', 'corridor', 'stairs', 'stone', ['WALL', 'WALL', 'OPEN', 'WALL', 'DOOR', 'WALL']),
    createEditorTile(-1, 2, 'Cellar', 'storage', 'cellar', 'stone', ['WALL', 'WALL', 'DOOR', 'WALL', 'WALL', 'WALL']),
  ],
  objectives: [],
  tags: ['manor', 'indoor', 'small', 'gothic']
};

const CHURCH_LAYOUT: ScenarioTemplate = {
  id: 'layout_church',
  name: 'Abandoned Church',
  description: 'A Gothic church with nave, altar, and crypts. Great for occult scenarios.',
  category: 'layout',
  icon: Church,
  iconColor: 'text-purple-400',
  difficulty: 'normal',
  estimatedTime: '30-40 min',
  metadata: {
    title: 'The Church',
    description: 'An abandoned church hides dark secrets.',
    briefing: 'Investigate the abandoned church.',
    startDoom: 10,
    difficulty: 'normal',
    theme: 'occult'
  },
  tiles: [
    createEditorTile(0, 0, 'Church Entrance', 'entrance', 'entrance_hall', 'stone', ['WALL', 'OPEN', 'WALL', 'WALL', 'WALL', 'WALL'], true),
    createEditorTile(1, 0, 'Nave', 'interior_room', 'grand_hall', 'stone', ['OPEN', 'OPEN', 'WALL', 'WALL', 'WALL', 'WALL']),
    createEditorTile(2, 0, 'Altar', 'interior_room', 'ritual_chamber', 'stone', ['OPEN', 'WALL', 'DOOR', 'DOOR', 'WALL', 'WALL']),
    createEditorTile(3, 0, 'Vestry', 'interior_room', 'study', 'wood', ['DOOR', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL']),
    createEditorTile(2, 1, 'Crypt Entrance', 'corridor', 'stairs', 'stone', ['WALL', 'WALL', 'DOOR', 'WALL', 'OPEN', 'WALL']),
    createEditorTile(2, 2, 'Crypt', 'storage', 'cellar', 'stone', ['WALL', 'WALL', 'OPEN', 'WALL', 'WALL', 'WALL']),
    createEditorTile(0, 1, 'Bell Tower Base', 'corridor', 'stairs', 'stone', ['WALL', 'WALL', 'WALL', 'WALL', 'OPEN', 'WALL']),
    createEditorTile(0, 2, 'Bell Tower', 'interior_room', 'tower', 'stone', ['WALL', 'WALL', 'OPEN', 'WALL', 'WALL', 'WALL']),
  ],
  objectives: [],
  tags: ['church', 'occult', 'crypts', 'gothic']
};

const WAREHOUSE_LAYOUT: ScenarioTemplate = {
  id: 'layout_warehouse',
  name: 'Dockside Warehouse',
  description: 'An industrial warehouse complex. Good for noir and gangster scenarios.',
  category: 'layout',
  icon: Warehouse,
  iconColor: 'text-gray-400',
  difficulty: 'normal',
  estimatedTime: '25-35 min',
  metadata: {
    title: 'The Warehouse',
    description: 'A suspicious warehouse at the docks.',
    briefing: 'Investigate the warehouse.',
    startDoom: 10,
    difficulty: 'normal',
    theme: 'noir'
  },
  tiles: [
    createEditorTile(0, 0, 'Loading Dock', 'entrance', 'entrance_hall', 'concrete', ['WALL', 'OPEN', 'WALL', 'WALL', 'OPEN', 'WALL'], true),
    createEditorTile(1, 0, 'Main Floor', 'storage', 'warehouse', 'concrete', ['OPEN', 'OPEN', 'WALL', 'WALL', 'WALL', 'OPEN']),
    createEditorTile(2, 0, 'Storage Area', 'storage', 'storage', 'concrete', ['OPEN', 'WALL', 'WALL', 'DOOR', 'WALL', 'WALL']),
    createEditorTile(2, -1, 'Office', 'interior_room', 'study', 'wood', ['WALL', 'WALL', 'WALL', 'WALL', 'DOOR', 'WALL']),
    createEditorTile(0, 1, 'Side Entrance', 'entrance', 'side_entrance', 'concrete', ['WALL', 'WALL', 'OPEN', 'WALL', 'WALL', 'WALL']),
    createEditorTile(1, 1, 'Back Storage', 'storage', 'warehouse', 'concrete', ['WALL', 'OPEN', 'WALL', 'WALL', 'WALL', 'WALL']),
  ],
  objectives: [],
  tags: ['warehouse', 'industrial', 'noir', 'docks']
};

// ============================================================================
// ALL TEMPLATES
// ============================================================================

export const SCENARIO_TEMPLATES: ScenarioTemplate[] = [
  // Quick Start
  ESCAPE_TEMPLATE,
  INVESTIGATION_TEMPLATE,
  BOSS_HUNT_TEMPLATE,
  // Layouts
  SMALL_MANOR_LAYOUT,
  CHURCH_LAYOUT,
  WAREHOUSE_LAYOUT,
];

// ============================================================================
// COMPONENT
// ============================================================================

interface ScenarioTemplatesProps {
  onSelectTemplate: (template: ScenarioTemplate) => void;
  onClose: () => void;
}

const ScenarioTemplates: React.FC<ScenarioTemplatesProps> = ({ onSelectTemplate, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'quick_start' | 'layout'>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<ScenarioTemplate | null>(null);

  const filteredTemplates = selectedCategory === 'all'
    ? SCENARIO_TEMPLATES
    : SCENARIO_TEMPLATES.filter(t => t.category === selectedCategory);

  const handleUseTemplate = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-lg border border-slate-600 w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-600 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            Scenario Templates
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm"
          >
            Cancel
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 p-4 border-b border-slate-700">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded text-sm font-medium ${
              selectedCategory === 'all'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            All Templates
          </button>
          <button
            onClick={() => setSelectedCategory('quick_start')}
            className={`px-4 py-2 rounded text-sm font-medium ${
              selectedCategory === 'quick_start'
                ? 'bg-green-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <Play className="w-4 h-4 inline mr-1" />
            Quick Start
          </button>
          <button
            onClick={() => setSelectedCategory('layout')}
            className={`px-4 py-2 rounded text-sm font-medium ${
              selectedCategory === 'layout'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <Grid3X3 className="w-4 h-4 inline mr-1" />
            Layouts
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Template list */}
          <div className="w-1/2 overflow-y-auto p-4 border-r border-slate-700">
            <div className="grid gap-3">
              {filteredTemplates.map(template => {
                const Icon = template.icon;
                return (
                  <div
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedTemplate?.id === template.id
                        ? 'bg-slate-700 border-amber-500'
                        : 'bg-slate-800 border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-slate-600 flex items-center justify-center ${template.iconColor}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium">{template.name}</h3>
                        <p className="text-slate-400 text-sm line-clamp-2 mt-1">
                          {template.description}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            template.difficulty === 'easy' ? 'bg-green-700 text-green-200' :
                            template.difficulty === 'normal' ? 'bg-amber-700 text-amber-200' :
                            'bg-red-700 text-red-200'
                          }`}>
                            {template.difficulty}
                          </span>
                          <span className="text-xs text-slate-500">
                            {template.estimatedTime}
                          </span>
                          <span className="text-xs text-slate-500">
                            {template.tiles.length} tiles
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Preview panel */}
          <div className="w-1/2 overflow-y-auto p-4 bg-slate-900/50">
            {selectedTemplate ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {React.createElement(selectedTemplate.icon, {
                    className: `w-8 h-8 ${selectedTemplate.iconColor}`
                  })}
                  <div>
                    <h3 className="text-xl font-bold text-white">{selectedTemplate.name}</h3>
                    <p className="text-slate-400 text-sm">{selectedTemplate.category === 'quick_start' ? 'Quick Start Template' : 'Layout Template'}</p>
                  </div>
                </div>

                <p className="text-slate-300">{selectedTemplate.description}</p>

                {/* Metadata preview */}
                {selectedTemplate.metadata.briefing && (
                  <div className="p-3 bg-slate-800 rounded-lg">
                    <h4 className="text-amber-400 text-sm font-medium mb-2">Briefing</h4>
                    <p className="text-slate-300 text-sm">{selectedTemplate.metadata.briefing}</p>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-800 rounded-lg">
                    <div className="text-slate-400 text-xs uppercase">Tiles</div>
                    <div className="text-2xl font-bold text-white">{selectedTemplate.tiles.length}</div>
                  </div>
                  <div className="p-3 bg-slate-800 rounded-lg">
                    <div className="text-slate-400 text-xs uppercase">Objectives</div>
                    <div className="text-2xl font-bold text-white">{selectedTemplate.objectives.length}</div>
                  </div>
                  <div className="p-3 bg-slate-800 rounded-lg">
                    <div className="text-slate-400 text-xs uppercase">Starting Doom</div>
                    <div className="text-2xl font-bold text-red-400">{selectedTemplate.metadata.startDoom}</div>
                  </div>
                  <div className="p-3 bg-slate-800 rounded-lg">
                    <div className="text-slate-400 text-xs uppercase">Est. Time</div>
                    <div className="text-xl font-bold text-white">{selectedTemplate.estimatedTime}</div>
                  </div>
                </div>

                {/* Objectives list */}
                {selectedTemplate.objectives.length > 0 && (
                  <div className="p-3 bg-slate-800 rounded-lg">
                    <h4 className="text-amber-400 text-sm font-medium mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Objectives
                    </h4>
                    <div className="space-y-2">
                      {selectedTemplate.objectives.map(obj => (
                        <div key={obj.id} className="flex items-center gap-2 text-sm">
                          {obj.isRequired ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Package className="w-4 h-4 text-blue-400" />
                          )}
                          <span className="text-white">{obj.name}</span>
                          <span className="text-slate-500">- {obj.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.tags.map(tag => (
                    <span key={tag} className="text-xs px-2 py-1 bg-slate-700 text-slate-300 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">
                <div className="text-center">
                  <Eye className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Select a template to preview</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-600 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-slate-600 text-slate-300"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUseTemplate}
            disabled={!selectedTemplate}
            className="bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50"
          >
            Use Template
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ScenarioTemplates;
