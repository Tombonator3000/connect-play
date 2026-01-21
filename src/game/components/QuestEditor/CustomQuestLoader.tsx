/**
 * CUSTOM QUEST LOADER - Load and Play Custom Quests
 *
 * Allows players to load and play quests created with the Quest Editor.
 * Can load quests from:
 * - Saved quests in localStorage
 * - Imported JSON files
 * - Campaign quests
 *
 * Converts Quest Editor format to game-compatible Scenario format.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { X, Upload, Play, Trash2, FileText, BookOpen, Users, Skull, Package, Target, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Scenario, ScenarioObjective, Tile, Item, EnemyType, DoomEvent } from '../../types';
import { EditorTile, ScenarioMetadata } from './index';
import { EditorObjective } from './ObjectivesPanel';
import { EditorTrigger } from './TriggerPanel';
import { DoomEvent as EditorDoomEvent } from './DoomEventsPanel';
import { Campaign, CampaignQuest } from './CampaignEditor';

// ============================================================================
// TYPES
// ============================================================================

export interface SavedQuest {
  id: string;
  metadata: ScenarioMetadata;
  tiles: EditorTile[];
  objectives: EditorObjective[];
  triggers?: EditorTrigger[];
  doomEvents?: EditorDoomEvent[];
  savedAt: string;
  version: string;
}

interface CustomQuestLoaderProps {
  onClose: () => void;
  onStartQuest: (scenario: Scenario, tiles: Tile[]) => void;
}

// ============================================================================
// CONVERSION UTILITIES
// ============================================================================

/**
 * Convert EditorTile to game Tile
 */
function convertEditorTileToTile(editorTile: EditorTile, index: number): Tile {
  // Convert edges to EdgeData format
  const edges = editorTile.edges.map((edge, i) => {
    const doorConfig = editorTile.doorConfigs?.[i];
    return {
      type: edge,
      state: doorConfig?.state || (edge === 'DOOR' ? 'CLOSED' : undefined),
      keyId: doorConfig?.keyId,
      lockDifficulty: doorConfig?.lockDifficulty,
    };
  });

  // Convert monster placements to enemy spawn configuration
  const spawnEnemies: { type: EnemyType; count: number }[] = [];
  if (editorTile.monsters) {
    for (const monster of editorTile.monsters) {
      spawnEnemies.push({
        type: monster.type as EnemyType,
        count: monster.count,
      });
    }
  }

  return {
    id: index,
    q: editorTile.q,
    r: editorTile.r,
    name: editorTile.name,
    type: editorTile.category,
    edges,
    isRevealed: editorTile.isStartLocation || false,
    hasBeenExplored: false,
    connections: [],
    object: null,
    items: editorTile.items as Item[] || [],
    description: editorTile.customDescription || editorTile.description || '',
    spawnEnemies: spawnEnemies.length > 0 ? spawnEnemies : undefined,
    hasQuestItem: editorTile.items && editorTile.items.length > 0,
  };
}

/**
 * Convert EditorObjective to ScenarioObjective
 */
function convertEditorObjectiveToScenarioObjective(editorObj: EditorObjective): ScenarioObjective {
  return {
    id: editorObj.id,
    description: editorObj.description,
    shortDescription: editorObj.description.substring(0, 50),
    type: editorObj.type as ScenarioObjective['type'],
    targetId: editorObj.targetId,
    targetAmount: editorObj.targetCount || 1,
    currentAmount: 0,
    isOptional: !editorObj.isRequired,
    isHidden: editorObj.isHidden || false,
    completed: false,
    rewardInsight: editorObj.isBonus ? 2 : 1,
  };
}

/**
 * Convert EditorDoomEvent to game DoomEvent
 */
function convertEditorDoomEvent(editorEvent: EditorDoomEvent): DoomEvent {
  return {
    threshold: editorEvent.doomThreshold,
    triggered: false,
    type: editorEvent.eventType as DoomEvent['type'],
    targetId: editorEvent.targetId,
    amount: editorEvent.amount,
    message: editorEvent.message,
  };
}

/**
 * Convert saved quest to Scenario format
 */
export function convertQuestToScenario(quest: SavedQuest): { scenario: Scenario; tiles: Tile[] } {
  // Find start tile
  const startTile = quest.tiles.find(t => t.isStartLocation);
  const startLocation = startTile ? `${startTile.q},${startTile.r}` : '0,0';

  // Convert tiles
  const tiles = quest.tiles.map((t, i) => convertEditorTileToTile(t, i));

  // Convert objectives
  const objectives = quest.objectives.map(convertEditorObjectiveToScenarioObjective);

  // Convert doom events
  const doomEvents = (quest.doomEvents || []).map(convertEditorDoomEvent);

  // Determine victory type from objectives
  let victoryType: Scenario['victoryType'] = 'investigation';
  const hasEscape = objectives.some(o => o.type === 'escape');
  const hasKill = objectives.some(o => o.type === 'kill_enemy' || o.type === 'kill_boss');
  const hasCollect = objectives.some(o => o.type === 'collect' || o.type === 'find_item');
  const hasSurvive = objectives.some(o => o.type === 'survive');

  if (hasEscape) victoryType = 'escape';
  else if (hasKill) victoryType = 'assassination';
  else if (hasCollect) victoryType = 'collection';
  else if (hasSurvive) victoryType = 'survival';

  // Create scenario
  const scenario: Scenario = {
    id: quest.id,
    title: quest.metadata.title,
    description: quest.metadata.description,
    briefing: quest.metadata.briefing,
    startDoom: quest.metadata.startDoom,
    startLocation,
    specialRule: 'Custom quest created with Quest Editor',
    difficulty: quest.metadata.difficulty === 'easy' ? 'Normal' :
                quest.metadata.difficulty === 'normal' ? 'Normal' :
                quest.metadata.difficulty === 'hard' ? 'Hard' : 'Nightmare',
    tileSet: 'mixed',
    theme: quest.metadata.theme as Scenario['theme'] || 'manor',
    goal: objectives.filter(o => !o.isOptional).map(o => o.shortDescription).join(', ') || 'Complete the investigation',
    victoryType,
    steps: [],
    objectives,
    victoryConditions: [{
      type: victoryType,
      description: 'Complete all required objectives',
      checkFunction: 'checkAllRequiredObjectives',
      requiredObjectives: objectives.filter(o => !o.isOptional).map(o => o.id),
    }],
    defeatConditions: [
      { type: 'all_dead', description: 'All investigators have perished' },
      { type: 'doom_zero', description: 'The doom clock has reached zero' },
    ],
    doomEvents,
    estimatedTime: '30-60 min',
    recommendedPlayers: '1-4',
  };

  return { scenario, tiles };
}

// ============================================================================
// CUSTOM QUEST LOADER COMPONENT
// ============================================================================

const CustomQuestLoader: React.FC<CustomQuestLoaderProps> = ({ onClose, onStartQuest }) => {
  // State
  const [savedQuests, setSavedQuests] = useState<SavedQuest[]>([]);
  const [savedCampaigns, setSavedCampaigns] = useState<Campaign[]>([]);
  const [selectedQuest, setSelectedQuest] = useState<SavedQuest | null>(null);
  const [view, setView] = useState<'quests' | 'campaigns'>('quests');
  const [error, setError] = useState<string | null>(null);

  // Load saved quests and campaigns
  useEffect(() => {
    try {
      const questsJson = localStorage.getItem('quest_editor_saved_quests');
      if (questsJson) {
        setSavedQuests(JSON.parse(questsJson));
      }

      const campaignsJson = localStorage.getItem('quest_editor_campaigns');
      if (campaignsJson) {
        setSavedCampaigns(JSON.parse(campaignsJson));
      }
    } catch (err) {
      console.error('Failed to load saved data:', err);
    }
  }, []);

  // Import quest from file
  const handleImportQuest = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);

          // Validate quest structure
          if (!data.metadata || !data.tiles || !Array.isArray(data.tiles)) {
            setError('Invalid quest file format');
            return;
          }

          const quest: SavedQuest = {
            id: data.metadata.id || `imported_${Date.now()}`,
            metadata: data.metadata,
            tiles: data.tiles,
            objectives: data.objectives || [],
            triggers: data.triggers || [],
            doomEvents: data.doomEvents || [],
            savedAt: data.exportedAt || new Date().toISOString(),
            version: data.version || '1.0',
          };

          // Add to saved quests
          setSavedQuests(prev => {
            const existing = prev.findIndex(q => q.id === quest.id);
            if (existing >= 0) {
              const newQuests = [...prev];
              newQuests[existing] = quest;
              localStorage.setItem('quest_editor_saved_quests', JSON.stringify(newQuests));
              return newQuests;
            }
            const newQuests = [...prev, quest];
            localStorage.setItem('quest_editor_saved_quests', JSON.stringify(newQuests));
            return newQuests;
          });

          setSelectedQuest(quest);
          setError(null);
        } catch (err) {
          console.error('Failed to import quest:', err);
          setError('Failed to parse quest file');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, []);

  // Delete quest
  const handleDeleteQuest = useCallback((questId: string) => {
    if (!window.confirm('Delete this quest?')) return;

    setSavedQuests(prev => {
      const newQuests = prev.filter(q => q.id !== questId);
      localStorage.setItem('quest_editor_saved_quests', JSON.stringify(newQuests));
      return newQuests;
    });

    if (selectedQuest?.id === questId) {
      setSelectedQuest(null);
    }
  }, [selectedQuest]);

  // Start quest
  const handleStartQuest = useCallback(() => {
    if (!selectedQuest) return;

    try {
      const { scenario, tiles } = convertQuestToScenario(selectedQuest);
      onStartQuest(scenario, tiles);
    } catch (err) {
      console.error('Failed to start quest:', err);
      setError('Failed to convert quest to playable format');
    }
  }, [selectedQuest, onStartQuest]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
      {/* Header */}
      <div className="h-14 bg-slate-800 border-b border-slate-700 flex items-center px-4 gap-4 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-slate-300 hover:text-white"
        >
          <X className="w-4 h-4 mr-2" />
          Close
        </Button>

        <div className="h-6 w-px bg-slate-600" />

        <h2 className="text-white font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5 text-amber-400" />
          Custom Quest Loader
        </h2>

        <div className="flex-1" />

        {/* View toggle */}
        <div className="flex bg-slate-700 rounded p-1">
          <button
            onClick={() => setView('quests')}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              view === 'quests' ? 'bg-amber-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            Quests
          </button>
          <button
            onClick={() => setView('campaigns')}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              view === 'campaigns' ? 'bg-purple-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            Campaigns
          </button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleImportQuest}
          className="text-green-400 hover:text-green-300"
        >
          <Upload className="w-4 h-4 mr-1" />
          Import
        </Button>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-900/50 border-b border-red-700 px-4 py-2 text-red-300 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Quest list */}
        <div className="w-96 bg-slate-800 border-r border-slate-700 overflow-y-auto p-4">
          {view === 'quests' ? (
            <>
              <h3 className="text-white font-semibold mb-3">Saved Quests</h3>
              {savedQuests.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-500">No saved quests</p>
                  <p className="text-slate-600 text-sm mt-1">Create quests in Quest Editor or import a JSON file</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {savedQuests.map(quest => (
                    <div
                      key={quest.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedQuest?.id === quest.id
                          ? 'bg-amber-900/30 border-amber-600'
                          : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
                      }`}
                      onClick={() => setSelectedQuest(quest)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-medium truncate">{quest.metadata.title}</div>
                          <div className="text-slate-400 text-xs mt-1">
                            {quest.tiles.length} tiles • {quest.objectives.length} objectives
                          </div>
                          <div className="text-slate-500 text-xs mt-1">
                            Saved: {new Date(quest.savedAt).toLocaleDateString()}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteQuest(quest.id);
                          }}
                          className="text-red-400 hover:text-red-300 h-8 w-8 p-0 shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <h3 className="text-white font-semibold mb-3">Saved Campaigns</h3>
              {savedCampaigns.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-500">No saved campaigns</p>
                  <p className="text-slate-600 text-sm mt-1">Create campaigns in Quest Editor</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {savedCampaigns.map(campaign => (
                    <div
                      key={campaign.id}
                      className="p-3 rounded-lg border bg-slate-700/50 border-slate-600"
                    >
                      <div className="text-white font-medium">{campaign.title}</div>
                      <div className="text-slate-400 text-xs mt-1">
                        {campaign.quests.length} quests • {campaign.difficulty}
                      </div>
                      <div className="text-purple-400 text-xs mt-1">
                        Campaign play coming soon
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Quest details */}
        <div className="flex-1 p-6 overflow-y-auto">
          {selectedQuest ? (
            <div className="max-w-2xl mx-auto">
              {/* Quest header */}
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-white mb-2">{selectedQuest.metadata.title}</h1>
                <div className="flex items-center gap-4 text-sm">
                  <span className={`px-2 py-1 rounded ${
                    selectedQuest.metadata.difficulty === 'easy' ? 'bg-green-600' :
                    selectedQuest.metadata.difficulty === 'normal' ? 'bg-amber-600' :
                    selectedQuest.metadata.difficulty === 'hard' ? 'bg-red-600' : 'bg-purple-600'
                  } text-white`}>
                    {selectedQuest.metadata.difficulty}
                  </span>
                  <span className="text-slate-400">
                    Doom: {selectedQuest.metadata.startDoom}
                  </span>
                </div>
              </div>

              {/* Description */}
              {selectedQuest.metadata.description && (
                <div className="mb-6">
                  <h3 className="text-slate-400 text-sm uppercase mb-2">Description</h3>
                  <p className="text-slate-300">{selectedQuest.metadata.description}</p>
                </div>
              )}

              {/* Briefing */}
              {selectedQuest.metadata.briefing && (
                <div className="mb-6 p-4 bg-slate-800 rounded-lg border border-slate-600">
                  <h3 className="text-amber-400 text-sm uppercase mb-2">Briefing</h3>
                  <p className="text-slate-300 italic whitespace-pre-line">{selectedQuest.metadata.briefing}</p>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-slate-800 rounded-lg text-center">
                  <div className="text-2xl font-bold text-white">{selectedQuest.tiles.length}</div>
                  <div className="text-slate-400 text-sm">Tiles</div>
                </div>
                <div className="p-4 bg-slate-800 rounded-lg text-center">
                  <div className="text-2xl font-bold text-white">{selectedQuest.objectives.length}</div>
                  <div className="text-slate-400 text-sm">Objectives</div>
                </div>
                <div className="p-4 bg-slate-800 rounded-lg text-center">
                  <div className="text-2xl font-bold text-white">
                    {selectedQuest.tiles.reduce((sum, t) => sum + (t.monsters?.reduce((s, m) => s + m.count, 0) || 0), 0)}
                  </div>
                  <div className="text-slate-400 text-sm">Enemies</div>
                </div>
              </div>

              {/* Objectives */}
              <div className="mb-6">
                <h3 className="text-slate-400 text-sm uppercase mb-2">Objectives</h3>
                <div className="space-y-2">
                  {selectedQuest.objectives.map(obj => (
                    <div key={obj.id} className="flex items-center gap-2 p-2 bg-slate-800 rounded">
                      <Target className={`w-4 h-4 ${obj.isRequired ? 'text-amber-400' : 'text-slate-400'}`} />
                      <span className="text-white flex-1">{obj.description}</span>
                      {obj.isRequired && <span className="text-amber-400 text-xs">Required</span>}
                      {obj.isBonus && <span className="text-purple-400 text-xs">Bonus</span>}
                    </div>
                  ))}
                  {selectedQuest.objectives.length === 0 && (
                    <p className="text-slate-500 italic">No objectives defined</p>
                  )}
                </div>
              </div>

              {/* Start button */}
              <Button
                onClick={handleStartQuest}
                className="w-full py-6 text-lg bg-green-600 hover:bg-green-700 text-white"
              >
                <Play className="w-6 h-6 mr-2" />
                Start Quest
              </Button>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-500 text-lg">Select a quest to view details</p>
                <p className="text-slate-600 text-sm mt-2">Or import a quest file using the button above</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomQuestLoader;
