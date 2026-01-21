/**
 * TILE PALETTE
 *
 * Sidebar showing all available tile templates organized by category.
 * Click to select a template for placement.
 */

import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Search } from 'lucide-react';
import { TileTemplate, TILE_TEMPLATES, ConnectionEdgeType, rotateEdges } from '../../tileConnectionSystem';
import { TileCategory } from '../../types';

// ============================================================================
// CONSTANTS
// ============================================================================

// Category display order and labels
const CATEGORY_ORDER: { category: TileCategory; label: string; color: string }[] = [
  { category: 'nature', label: 'Nature', color: '#22c55e' },
  { category: 'urban', label: 'Urban', color: '#6b7280' },
  { category: 'street', label: 'Street', color: '#94a3b8' },
  { category: 'facade', label: 'Facade', color: '#f97316' },
  { category: 'foyer', label: 'Foyer', color: '#f59e0b' },
  { category: 'corridor', label: 'Corridor', color: '#a8a29e' },
  { category: 'room', label: 'Room', color: '#d97706' },
  { category: 'stairs', label: 'Stairs', color: '#a855f7' },
  { category: 'basement', label: 'Basement', color: '#57534e' },
  { category: 'crypt', label: 'Crypt', color: '#991b1b' },
];

// Edge type abbreviations for display
const EDGE_ABBREV: Record<ConnectionEdgeType, string> = {
  WALL: 'W',
  OPEN: 'O',
  DOOR: 'D',
  WINDOW: 'Wi',
  STREET: 'St',
  NATURE: 'N',
  WATER: 'Wa',
  FACADE: 'F',
  STAIRS_UP: '↑',
  STAIRS_DOWN: '↓',
};

// ============================================================================
// COMPONENT
// ============================================================================

interface TilePaletteProps {
  selectedTemplate: TileTemplate | null;
  onSelectTemplate: (template: TileTemplate) => void;
  rotation: number;
}

const TilePalette: React.FC<TilePaletteProps> = ({
  selectedTemplate,
  onSelectTemplate,
  rotation
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<TileCategory>>(
    new Set(['foyer', 'corridor', 'room']) // Start with common categories expanded
  );

  // Group templates by category
  const templatesByCategory = useMemo(() => {
    const grouped = new Map<TileCategory, TileTemplate[]>();

    for (const template of Object.values(TILE_TEMPLATES)) {
      const category = template.category;
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category)!.push(template);
    }

    // Sort templates within each category by name
    grouped.forEach((templates, category) => {
      templates.sort((a, b) => a.name.localeCompare(b.name));
    });

    return grouped;
  }, []);

  // Filter templates by search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return templatesByCategory;
    }

    const query = searchQuery.toLowerCase();
    const filtered = new Map<TileCategory, TileTemplate[]>();

    templatesByCategory.forEach((templates, category) => {
      const matching = templates.filter(t =>
        t.name.toLowerCase().includes(query) ||
        t.subType.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query)
      );
      if (matching.length > 0) {
        filtered.set(category, matching);
      }
    });

    return filtered;
  }, [templatesByCategory, searchQuery]);

  // Toggle category expansion
  const toggleCategory = (category: TileCategory) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  // Render edge pattern preview
  const renderEdgePattern = (edges: ConnectionEdgeType[], canRotate: boolean) => {
    const displayEdges = canRotate ? rotateEdges(
      edges as [ConnectionEdgeType, ConnectionEdgeType, ConnectionEdgeType, ConnectionEdgeType, ConnectionEdgeType, ConnectionEdgeType],
      rotation
    ) : edges;

    return (
      <div className="flex gap-0.5 text-[8px] font-mono">
        {displayEdges.map((edge, i) => (
          <span
            key={i}
            className={`
              px-0.5 rounded
              ${edge === 'WALL' ? 'bg-slate-600 text-slate-400' : ''}
              ${edge === 'OPEN' ? 'bg-green-900/50 text-green-400' : ''}
              ${edge === 'DOOR' ? 'bg-amber-900/50 text-amber-400' : ''}
              ${edge === 'STAIRS_UP' || edge === 'STAIRS_DOWN' ? 'bg-purple-900/50 text-purple-400' : ''}
              ${edge === 'STREET' ? 'bg-slate-700 text-slate-300' : ''}
              ${edge === 'NATURE' ? 'bg-green-900/50 text-green-300' : ''}
              ${edge === 'WATER' ? 'bg-blue-900/50 text-blue-400' : ''}
              ${edge === 'FACADE' ? 'bg-orange-900/50 text-orange-400' : ''}
              ${edge === 'WINDOW' ? 'bg-cyan-900/50 text-cyan-400' : ''}
            `}
          >
            {EDGE_ABBREV[edge]}
          </span>
        ))}
      </div>
    );
  };

  // Render a single template item
  const renderTemplateItem = (template: TileTemplate) => {
    const isSelected = selectedTemplate?.id === template.id;

    return (
      <div
        key={template.id}
        onClick={() => onSelectTemplate(template)}
        className={`
          p-2 rounded cursor-pointer transition-all
          ${isSelected
            ? 'bg-amber-600/30 border border-amber-500'
            : 'bg-slate-700/50 hover:bg-slate-700 border border-transparent'
          }
        `}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">
              {template.name}
            </div>
            <div className="text-xs text-slate-400">
              {template.subType}
              {template.canRotate && (
                <span className="ml-1 text-purple-400">↻</span>
              )}
            </div>
          </div>
          <div className="text-xs text-slate-500">
            Z{template.zoneLevel}
          </div>
        </div>

        {/* Edge pattern */}
        <div className="mt-1">
          {renderEdgePattern(template.edges, template.canRotate)}
        </div>

        {/* Floor type indicator */}
        <div className="mt-1 text-[10px] text-slate-500 capitalize">
          {template.floorType} floor
        </div>
      </div>
    );
  };

  return (
    <div className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-slate-700">
        <h2 className="text-white font-semibold mb-2">Tile Palette</h2>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tiles..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-700 text-white text-sm rounded border border-slate-600 focus:border-amber-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Category list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {CATEGORY_ORDER.map(({ category, label, color }) => {
          const templates = filteredCategories.get(category);
          if (!templates || templates.length === 0) return null;

          const isExpanded = expandedCategories.has(category) || searchQuery.trim().length > 0;

          return (
            <div key={category} className="rounded overflow-hidden">
              {/* Category header */}
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center gap-2 px-2 py-1.5 bg-slate-700/50 hover:bg-slate-700 text-left transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm font-medium text-white flex-1">{label}</span>
                <span className="text-xs text-slate-400">{templates.length}</span>
              </button>

              {/* Templates */}
              {isExpanded && (
                <div className="space-y-1 p-1 bg-slate-800/50">
                  {templates.map(renderTemplateItem)}
                </div>
              )}
            </div>
          );
        })}

        {filteredCategories.size === 0 && (
          <div className="text-center text-slate-500 py-8">
            No tiles match "{searchQuery}"
          </div>
        )}
      </div>

      {/* Selected template info */}
      {selectedTemplate && (
        <div className="p-3 border-t border-slate-700 bg-slate-700/30">
          <div className="text-xs text-slate-400 mb-1">Selected:</div>
          <div className="text-sm font-medium text-amber-400">{selectedTemplate.name}</div>
          {selectedTemplate.description && (
            <div className="text-xs text-slate-400 mt-1 italic line-clamp-2">
              "{selectedTemplate.description}"
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="p-2 border-t border-slate-700 text-xs text-slate-500 text-center">
        {Object.keys(TILE_TEMPLATES).length} templates available
      </div>
    </div>
  );
};

export default TilePalette;
