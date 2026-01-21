/**
 * CAMPAIGN EDITOR - Quest Editor Campaign System
 *
 * Allows users to create and manage campaigns that consist of
 * multiple quests played in sequence, with heroes persisting
 * between quests via the Legacy system.
 *
 * Features:
 * - Create/edit/delete campaigns
 * - Add/remove quests to campaigns
 * - Define quest order with drag-and-drop
 * - Quest prerequisites and branching paths
 * - Hero/equipment persistence between quests
 * - Campaign-wide rewards and progression
 */

import React, { useState, useCallback, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, ChevronUp, ChevronDown, Save, Upload, Download, Play, BookOpen, Users, Trophy, Zap, Link2, Unlink } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ============================================================================
// TYPES
// ============================================================================

export interface CampaignQuest {
  id: string;
  questId: string; // Reference to exported quest JSON
  title: string;
  description: string;
  order: number;
  isRequired: boolean;
  prerequisites: string[]; // IDs of quests that must be completed first
  rewards: {
    xpBonus: number;
    goldBonus: number;
    unlockQuestId?: string; // Unlocks another quest when completed
    unlockItem?: string; // Item ID to give on completion
  };
  branchCondition?: {
    type: 'objective_complete' | 'item_collected' | 'enemy_killed' | 'doom_level';
    targetId?: string;
    comparison?: 'gte' | 'lte' | 'eq';
    value?: number;
    onSuccess: string; // Quest ID to go to if condition met
    onFailure: string; // Quest ID to go to if condition not met
  };
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  author: string;
  version: string;
  difficulty: 'easy' | 'normal' | 'hard' | 'nightmare';
  estimatedDuration: string; // e.g., "3-5 hours"
  quests: CampaignQuest[];
  startingQuestId: string;
  settings: {
    persistHeroes: boolean; // Heroes carry over between quests
    persistEquipment: boolean; // Equipment carries over
    sharedGold: boolean; // Gold is pooled across quests
    permadeathEnabled: boolean; // If hero dies, they're gone for campaign
    allowMerchant: boolean; // Allow merchant between quests
    startingGold: number; // Gold for new heroes
  };
  globalRewards: {
    completionXP: number;
    completionGold: number;
    completionItem?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface CampaignEditorProps {
  onBack: () => void;
  onLoadQuest?: (questId: string) => void;
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

function createNewCampaign(): Campaign {
  const now = new Date().toISOString();
  return {
    id: `campaign_${Date.now()}`,
    title: 'Untitled Campaign',
    description: '',
    author: '',
    version: '1.0',
    difficulty: 'normal',
    estimatedDuration: '2-4 hours',
    quests: [],
    startingQuestId: '',
    settings: {
      persistHeroes: true,
      persistEquipment: true,
      sharedGold: true,
      permadeathEnabled: false,
      allowMerchant: true,
      startingGold: 50,
    },
    globalRewards: {
      completionXP: 100,
      completionGold: 200,
    },
    createdAt: now,
    updatedAt: now,
  };
}

function createNewCampaignQuest(order: number): CampaignQuest {
  return {
    id: `quest_${Date.now()}_${order}`,
    questId: '',
    title: `Quest ${order + 1}`,
    description: '',
    order,
    isRequired: true,
    prerequisites: [],
    rewards: {
      xpBonus: 20,
      goldBonus: 25,
    },
  };
}

// ============================================================================
// CAMPAIGN EDITOR COMPONENT
// ============================================================================

const CampaignEditor: React.FC<CampaignEditorProps> = ({ onBack, onLoadQuest }) => {
  // State
  const [campaign, setCampaign] = useState<Campaign>(createNewCampaign());
  const [selectedQuestIndex, setSelectedQuestIndex] = useState<number | null>(null);
  const [savedCampaigns, setSavedCampaigns] = useState<{ id: string; title: string }[]>([]);
  const [showQuestSelector, setShowQuestSelector] = useState(false);
  const [availableQuests, setAvailableQuests] = useState<{ id: string; title: string }[]>([]);

  // Load saved campaigns list from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('quest_editor_campaigns');
      if (saved) {
        const campaigns = JSON.parse(saved) as Campaign[];
        setSavedCampaigns(campaigns.map(c => ({ id: c.id, title: c.title })));
      }
    } catch (error) {
      console.error('Failed to load campaigns:', error);
    }

    // Load available quests from localStorage
    try {
      const savedQuests = localStorage.getItem('quest_editor_saved_quests');
      if (savedQuests) {
        const quests = JSON.parse(savedQuests) as { id: string; metadata: { title: string } }[];
        setAvailableQuests(quests.map(q => ({ id: q.id, title: q.metadata?.title || 'Untitled' })));
      }
    } catch (error) {
      console.error('Failed to load available quests:', error);
    }
  }, []);

  // ============================================================================
  // CAMPAIGN OPERATIONS
  // ============================================================================

  const handleSaveCampaign = useCallback(() => {
    try {
      const saved = localStorage.getItem('quest_editor_campaigns');
      const campaigns: Campaign[] = saved ? JSON.parse(saved) : [];
      const existingIndex = campaigns.findIndex(c => c.id === campaign.id);

      const updatedCampaign = {
        ...campaign,
        updatedAt: new Date().toISOString(),
      };

      if (existingIndex >= 0) {
        campaigns[existingIndex] = updatedCampaign;
      } else {
        campaigns.push(updatedCampaign);
      }

      localStorage.setItem('quest_editor_campaigns', JSON.stringify(campaigns));
      setSavedCampaigns(campaigns.map(c => ({ id: c.id, title: c.title })));
      alert('Campaign saved!');
    } catch (error) {
      console.error('Failed to save campaign:', error);
      alert('Failed to save campaign');
    }
  }, [campaign]);

  const handleLoadCampaign = useCallback((campaignId: string) => {
    try {
      const saved = localStorage.getItem('quest_editor_campaigns');
      if (saved) {
        const campaigns: Campaign[] = JSON.parse(saved);
        const found = campaigns.find(c => c.id === campaignId);
        if (found) {
          setCampaign(found);
          setSelectedQuestIndex(null);
        }
      }
    } catch (error) {
      console.error('Failed to load campaign:', error);
    }
  }, []);

  const handleDeleteCampaign = useCallback((campaignId: string) => {
    if (!window.confirm('Delete this campaign permanently?')) return;

    try {
      const saved = localStorage.getItem('quest_editor_campaigns');
      if (saved) {
        const campaigns: Campaign[] = JSON.parse(saved);
        const filtered = campaigns.filter(c => c.id !== campaignId);
        localStorage.setItem('quest_editor_campaigns', JSON.stringify(filtered));
        setSavedCampaigns(filtered.map(c => ({ id: c.id, title: c.title })));

        if (campaign.id === campaignId) {
          setCampaign(createNewCampaign());
        }
      }
    } catch (error) {
      console.error('Failed to delete campaign:', error);
    }
  }, [campaign.id]);

  const handleNewCampaign = useCallback(() => {
    if (campaign.quests.length > 0 && !window.confirm('Create new campaign? Unsaved changes will be lost.')) {
      return;
    }
    setCampaign(createNewCampaign());
    setSelectedQuestIndex(null);
  }, [campaign.quests.length]);

  // ============================================================================
  // QUEST OPERATIONS
  // ============================================================================

  const handleAddQuest = useCallback(() => {
    const newQuest = createNewCampaignQuest(campaign.quests.length);
    setCampaign(prev => ({
      ...prev,
      quests: [...prev.quests, newQuest],
      startingQuestId: prev.startingQuestId || newQuest.id,
    }));
    setSelectedQuestIndex(campaign.quests.length);
  }, [campaign.quests.length]);

  const handleRemoveQuest = useCallback((index: number) => {
    setCampaign(prev => {
      const newQuests = prev.quests.filter((_, i) => i !== index);
      // Reorder remaining quests
      newQuests.forEach((q, i) => q.order = i);
      // Update starting quest if needed
      let newStartingId = prev.startingQuestId;
      if (prev.quests[index]?.id === prev.startingQuestId) {
        newStartingId = newQuests[0]?.id || '';
      }
      return {
        ...prev,
        quests: newQuests,
        startingQuestId: newStartingId,
      };
    });
    if (selectedQuestIndex === index) {
      setSelectedQuestIndex(null);
    } else if (selectedQuestIndex !== null && selectedQuestIndex > index) {
      setSelectedQuestIndex(selectedQuestIndex - 1);
    }
  }, [selectedQuestIndex]);

  const handleMoveQuest = useCallback((index: number, direction: 'up' | 'down') => {
    setCampaign(prev => {
      const newQuests = [...prev.quests];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;

      if (targetIndex < 0 || targetIndex >= newQuests.length) return prev;

      [newQuests[index], newQuests[targetIndex]] = [newQuests[targetIndex], newQuests[index]];
      newQuests.forEach((q, i) => q.order = i);

      return { ...prev, quests: newQuests };
    });

    if (selectedQuestIndex === index) {
      setSelectedQuestIndex(direction === 'up' ? index - 1 : index + 1);
    }
  }, [selectedQuestIndex]);

  const handleUpdateQuest = useCallback((index: number, updates: Partial<CampaignQuest>) => {
    setCampaign(prev => ({
      ...prev,
      quests: prev.quests.map((q, i) => i === index ? { ...q, ...updates } : q),
    }));
  }, []);

  // ============================================================================
  // EXPORT/IMPORT
  // ============================================================================

  const handleExportCampaign = useCallback(() => {
    const json = JSON.stringify(campaign, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campaign_${campaign.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [campaign]);

  const handleImportCampaign = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string) as Campaign;
          if (data.id && data.quests && Array.isArray(data.quests)) {
            setCampaign(data);
            setSelectedQuestIndex(null);
          } else {
            alert('Invalid campaign file format');
          }
        } catch (err) {
          console.error('Failed to import campaign:', err);
          alert('Failed to import campaign');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, []);

  // ============================================================================
  // RENDER
  // ============================================================================

  const selectedQuest = selectedQuestIndex !== null ? campaign.quests[selectedQuestIndex] : null;

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-900 overflow-hidden">
      {/* Header */}
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

        <h2 className="text-white font-semibold flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-purple-400" />
          Campaign Editor
        </h2>

        <div className="flex-1" />

        {/* File operations */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNewCampaign}
          className="text-slate-300 hover:text-white"
        >
          <Plus className="w-4 h-4 mr-1" />
          New
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleImportCampaign}
          className="text-slate-300 hover:text-white"
        >
          <Upload className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleExportCampaign}
          className="text-slate-300 hover:text-white"
        >
          <Download className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSaveCampaign}
          className="text-green-400 hover:text-green-300"
        >
          <Save className="w-4 h-4 mr-1" />
          Save
        </Button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar - Campaign list and info */}
        <div className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col overflow-hidden">
          {/* Campaign metadata */}
          <div className="p-4 border-b border-slate-600 space-y-3">
            <div>
              <label className="text-slate-400 text-xs block mb-1">Campaign Title</label>
              <input
                type="text"
                value={campaign.title}
                onChange={(e) => setCampaign(prev => ({ ...prev, title: e.target.value }))}
                className="w-full bg-slate-700 text-white px-2 py-1 rounded text-sm border border-slate-600"
                placeholder="Campaign Title"
              />
            </div>
            <div>
              <label className="text-slate-400 text-xs block mb-1">Author</label>
              <input
                type="text"
                value={campaign.author}
                onChange={(e) => setCampaign(prev => ({ ...prev, author: e.target.value }))}
                className="w-full bg-slate-700 text-white px-2 py-1 rounded text-sm border border-slate-600"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="text-slate-400 text-xs block mb-1">Description</label>
              <textarea
                value={campaign.description}
                onChange={(e) => setCampaign(prev => ({ ...prev, description: e.target.value }))}
                className="w-full bg-slate-700 text-white px-2 py-1 rounded text-sm border border-slate-600 h-16 resize-none"
                placeholder="What is this campaign about?"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 text-xs block mb-1">Difficulty</label>
                <select
                  value={campaign.difficulty}
                  onChange={(e) => setCampaign(prev => ({ ...prev, difficulty: e.target.value as Campaign['difficulty'] }))}
                  className="w-full bg-slate-700 text-white px-2 py-1 rounded text-sm border border-slate-600"
                >
                  <option value="easy">Easy</option>
                  <option value="normal">Normal</option>
                  <option value="hard">Hard</option>
                  <option value="nightmare">Nightmare</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 text-xs block mb-1">Duration</label>
                <input
                  type="text"
                  value={campaign.estimatedDuration}
                  onChange={(e) => setCampaign(prev => ({ ...prev, estimatedDuration: e.target.value }))}
                  className="w-full bg-slate-700 text-white px-2 py-1 rounded text-sm border border-slate-600"
                  placeholder="2-4 hours"
                />
              </div>
            </div>
          </div>

          {/* Campaign settings */}
          <div className="p-4 border-b border-slate-600 space-y-2">
            <h4 className="text-slate-400 text-xs uppercase">Campaign Settings</h4>
            <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
              <input
                type="checkbox"
                checked={campaign.settings.persistHeroes}
                onChange={(e) => setCampaign(prev => ({
                  ...prev,
                  settings: { ...prev.settings, persistHeroes: e.target.checked }
                }))}
                className="accent-amber-500"
              />
              Heroes persist between quests
            </label>
            <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
              <input
                type="checkbox"
                checked={campaign.settings.persistEquipment}
                onChange={(e) => setCampaign(prev => ({
                  ...prev,
                  settings: { ...prev.settings, persistEquipment: e.target.checked }
                }))}
                className="accent-amber-500"
              />
              Equipment persists
            </label>
            <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
              <input
                type="checkbox"
                checked={campaign.settings.sharedGold}
                onChange={(e) => setCampaign(prev => ({
                  ...prev,
                  settings: { ...prev.settings, sharedGold: e.target.checked }
                }))}
                className="accent-amber-500"
              />
              Shared gold pool
            </label>
            <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
              <input
                type="checkbox"
                checked={campaign.settings.permadeathEnabled}
                onChange={(e) => setCampaign(prev => ({
                  ...prev,
                  settings: { ...prev.settings, permadeathEnabled: e.target.checked }
                }))}
                className="accent-red-500"
              />
              Permadeath enabled
            </label>
            <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
              <input
                type="checkbox"
                checked={campaign.settings.allowMerchant}
                onChange={(e) => setCampaign(prev => ({
                  ...prev,
                  settings: { ...prev.settings, allowMerchant: e.target.checked }
                }))}
                className="accent-amber-500"
              />
              Merchant between quests
            </label>
            <div>
              <label className="text-slate-400 text-xs block mb-1">Starting Gold</label>
              <input
                type="number"
                value={campaign.settings.startingGold}
                onChange={(e) => setCampaign(prev => ({
                  ...prev,
                  settings: { ...prev.settings, startingGold: parseInt(e.target.value) || 0 }
                }))}
                className="w-full bg-slate-700 text-white px-2 py-1 rounded text-sm border border-slate-600"
                min={0}
              />
            </div>
          </div>

          {/* Saved campaigns */}
          <div className="flex-1 overflow-y-auto p-4">
            <h4 className="text-slate-400 text-xs uppercase mb-2">Saved Campaigns</h4>
            {savedCampaigns.length === 0 ? (
              <p className="text-slate-500 text-sm italic">No saved campaigns</p>
            ) : (
              <div className="space-y-2">
                {savedCampaigns.map(c => (
                  <div
                    key={c.id}
                    className={`p-2 rounded border cursor-pointer transition-colors ${
                      campaign.id === c.id
                        ? 'bg-purple-900/30 border-purple-600'
                        : 'bg-slate-700/50 border-slate-600 hover:bg-slate-700'
                    }`}
                    onClick={() => handleLoadCampaign(c.id)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white text-sm">{c.title}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCampaign(c.id);
                        }}
                        className="text-red-400 hover:text-red-300 h-6 w-6 p-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center - Quest list */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Quest list header */}
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Quests ({campaign.quests.length})
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddQuest}
              className="text-green-400 hover:text-green-300"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Quest
            </Button>
          </div>

          {/* Quest list */}
          <div className="flex-1 overflow-y-auto p-4">
            {campaign.quests.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500">No quests in this campaign yet</p>
                <p className="text-slate-600 text-sm mt-1">Click "Add Quest" to get started</p>
              </div>
            ) : (
              <div className="space-y-2">
                {campaign.quests.map((quest, index) => (
                  <div
                    key={quest.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedQuestIndex === index
                        ? 'bg-amber-900/30 border-amber-600'
                        : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                    }`}
                    onClick={() => setSelectedQuestIndex(index)}
                  >
                    <div className="flex items-center gap-3">
                      {/* Order number */}
                      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {index + 1}
                      </div>

                      {/* Quest info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium truncate">{quest.title}</span>
                          {quest.id === campaign.startingQuestId && (
                            <span className="text-xs bg-green-600 text-white px-1.5 py-0.5 rounded">Start</span>
                          )}
                          {quest.isRequired && (
                            <span className="text-xs bg-amber-600 text-white px-1.5 py-0.5 rounded">Required</span>
                          )}
                        </div>
                        <div className="text-slate-400 text-xs truncate">
                          {quest.description || 'No description'}
                        </div>
                        {quest.prerequisites.length > 0 && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-purple-400">
                            <Link2 className="w-3 h-3" />
                            Requires: {quest.prerequisites.map(id =>
                              campaign.quests.find(q => q.id === id)?.title || id
                            ).join(', ')}
                          </div>
                        )}
                      </div>

                      {/* Move buttons */}
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={index === 0}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveQuest(index, 'up');
                          }}
                          className="h-6 w-6 p-0 text-slate-400 hover:text-white disabled:opacity-30"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={index === campaign.quests.length - 1}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveQuest(index, 'down');
                          }}
                          className="h-6 w-6 p-0 text-slate-400 hover:text-white disabled:opacity-30"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Delete button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveQuest(index);
                        }}
                        className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar - Quest details */}
        <div className="w-80 bg-slate-800 border-l border-slate-700 overflow-y-auto">
          {selectedQuest ? (
            <div className="p-4 space-y-4">
              <h3 className="text-white font-semibold">Quest Details</h3>

              <div>
                <label className="text-slate-400 text-xs block mb-1">Quest Title</label>
                <input
                  type="text"
                  value={selectedQuest.title}
                  onChange={(e) => handleUpdateQuest(selectedQuestIndex!, { title: e.target.value })}
                  className="w-full bg-slate-700 text-white px-2 py-1 rounded text-sm border border-slate-600"
                />
              </div>

              <div>
                <label className="text-slate-400 text-xs block mb-1">Description</label>
                <textarea
                  value={selectedQuest.description}
                  onChange={(e) => handleUpdateQuest(selectedQuestIndex!, { description: e.target.value })}
                  className="w-full bg-slate-700 text-white px-2 py-1 rounded text-sm border border-slate-600 h-20 resize-none"
                />
              </div>

              <div>
                <label className="text-slate-400 text-xs block mb-1">Quest File ID</label>
                <input
                  type="text"
                  value={selectedQuest.questId}
                  onChange={(e) => handleUpdateQuest(selectedQuestIndex!, { questId: e.target.value })}
                  className="w-full bg-slate-700 text-white px-2 py-1 rounded text-sm border border-slate-600"
                  placeholder="Enter quest file ID"
                />
                {availableQuests.length > 0 && (
                  <select
                    value={selectedQuest.questId}
                    onChange={(e) => handleUpdateQuest(selectedQuestIndex!, { questId: e.target.value })}
                    className="w-full bg-slate-700 text-white px-2 py-1 rounded text-sm border border-slate-600 mt-1"
                  >
                    <option value="">-- Select saved quest --</option>
                    {availableQuests.map(q => (
                      <option key={q.id} value={q.id}>{q.title}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="border-t border-slate-600 pt-4">
                <h4 className="text-slate-400 text-xs uppercase mb-2">Quest Settings</h4>
                <label className="flex items-center gap-2 text-sm text-white cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={selectedQuest.isRequired}
                    onChange={(e) => handleUpdateQuest(selectedQuestIndex!, { isRequired: e.target.checked })}
                    className="accent-amber-500"
                  />
                  Required to complete campaign
                </label>
                <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedQuest.id === campaign.startingQuestId}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setCampaign(prev => ({ ...prev, startingQuestId: selectedQuest.id }));
                      }
                    }}
                    className="accent-green-500"
                  />
                  Starting quest
                </label>
              </div>

              <div className="border-t border-slate-600 pt-4">
                <h4 className="text-slate-400 text-xs uppercase mb-2">Quest Rewards</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-400 text-xs block mb-1">Bonus XP</label>
                    <input
                      type="number"
                      value={selectedQuest.rewards.xpBonus}
                      onChange={(e) => handleUpdateQuest(selectedQuestIndex!, {
                        rewards: { ...selectedQuest.rewards, xpBonus: parseInt(e.target.value) || 0 }
                      })}
                      className="w-full bg-slate-700 text-white px-2 py-1 rounded text-sm border border-slate-600"
                      min={0}
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs block mb-1">Bonus Gold</label>
                    <input
                      type="number"
                      value={selectedQuest.rewards.goldBonus}
                      onChange={(e) => handleUpdateQuest(selectedQuestIndex!, {
                        rewards: { ...selectedQuest.rewards, goldBonus: parseInt(e.target.value) || 0 }
                      })}
                      className="w-full bg-slate-700 text-white px-2 py-1 rounded text-sm border border-slate-600"
                      min={0}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-600 pt-4">
                <h4 className="text-slate-400 text-xs uppercase mb-2">Prerequisites</h4>
                <p className="text-slate-500 text-xs mb-2">Quests that must be completed before this one</p>
                {campaign.quests.filter(q => q.id !== selectedQuest.id).map(quest => (
                  <label key={quest.id} className="flex items-center gap-2 text-sm text-white cursor-pointer mb-1">
                    <input
                      type="checkbox"
                      checked={selectedQuest.prerequisites.includes(quest.id)}
                      onChange={(e) => {
                        const newPrereqs = e.target.checked
                          ? [...selectedQuest.prerequisites, quest.id]
                          : selectedQuest.prerequisites.filter(id => id !== quest.id);
                        handleUpdateQuest(selectedQuestIndex!, { prerequisites: newPrereqs });
                      }}
                      className="accent-purple-500"
                    />
                    {quest.title}
                  </label>
                ))}
                {campaign.quests.filter(q => q.id !== selectedQuest.id).length === 0 && (
                  <p className="text-slate-500 text-xs italic">No other quests to select</p>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 text-center">
              <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500">Select a quest to edit its details</p>
            </div>
          )}

          {/* Global rewards section */}
          <div className="p-4 border-t border-slate-600">
            <h4 className="text-slate-400 text-xs uppercase mb-2">Campaign Completion Rewards</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 text-xs block mb-1">Completion XP</label>
                <input
                  type="number"
                  value={campaign.globalRewards.completionXP}
                  onChange={(e) => setCampaign(prev => ({
                    ...prev,
                    globalRewards: { ...prev.globalRewards, completionXP: parseInt(e.target.value) || 0 }
                  }))}
                  className="w-full bg-slate-700 text-white px-2 py-1 rounded text-sm border border-slate-600"
                  min={0}
                />
              </div>
              <div>
                <label className="text-slate-400 text-xs block mb-1">Completion Gold</label>
                <input
                  type="number"
                  value={campaign.globalRewards.completionGold}
                  onChange={(e) => setCampaign(prev => ({
                    ...prev,
                    globalRewards: { ...prev.globalRewards, completionGold: parseInt(e.target.value) || 0 }
                  }))}
                  className="w-full bg-slate-700 text-white px-2 py-1 rounded text-sm border border-slate-600"
                  min={0}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignEditor;
