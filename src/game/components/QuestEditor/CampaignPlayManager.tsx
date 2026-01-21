/**
 * CAMPAIGN PLAY MANAGER - Play campaigns created with Campaign Editor
 *
 * Handles:
 * - Campaign selection and loading
 * - Quest progression within campaigns
 * - Hero persistence (XP, gold, equipment) between quests
 * - Between-quest screens (merchant, level up, results)
 * - Campaign completion tracking
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  ArrowLeft, Play, Users, Trophy, Skull, Coins, Package, ShoppingBag,
  ChevronRight, CheckCircle, Lock, AlertTriangle, BookOpen, Zap, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Campaign, CampaignQuest } from './CampaignEditor';
import { LegacyData, LegacyHero, Scenario, Tile, canLevelUp } from '../../types';
import { getLivingHeroes, getXPProgress } from '../../utils/legacyManager';

// ============================================================================
// TYPES
// ============================================================================

export interface CampaignProgress {
  campaignId: string;
  currentQuestIndex: number;
  completedQuestIds: string[];
  failedQuestIds: string[];
  heroIds: string[]; // Heroes participating in this campaign
  sharedGold: number;
  startedAt: string;
  lastPlayedAt: string;
}

export interface CampaignPlayState {
  campaign: Campaign;
  progress: CampaignProgress;
  phase: 'select_heroes' | 'quest_preview' | 'between_quests' | 'playing' | 'completed' | 'failed';
}

interface CampaignPlayManagerProps {
  legacyData: LegacyData;
  onBack: () => void;
  onStartQuest: (questId: string, campaign: Campaign, progress: CampaignProgress) => void;
  onSelectHeroes: (heroes: LegacyHero[]) => void;
  onOpenMerchant: (heroes: LegacyHero[], sharedGold: number) => void;
  onUpdateLegacyData: (data: LegacyData) => void;
}

// ============================================================================
// STORAGE
// ============================================================================

const CAMPAIGN_PROGRESS_KEY = 'quest_editor_campaign_progress';

function loadCampaignProgress(): CampaignProgress[] {
  try {
    const saved = localStorage.getItem(CAMPAIGN_PROGRESS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load campaign progress:', error);
  }
  return [];
}

function saveCampaignProgress(progressList: CampaignProgress[]): void {
  try {
    localStorage.setItem(CAMPAIGN_PROGRESS_KEY, JSON.stringify(progressList));
  } catch (error) {
    console.error('Failed to save campaign progress:', error);
  }
}

function loadCampaigns(): Campaign[] {
  try {
    const saved = localStorage.getItem('quest_editor_campaigns');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load campaigns:', error);
  }
  return [];
}

// ============================================================================
// COMPONENT
// ============================================================================

const CampaignPlayManager: React.FC<CampaignPlayManagerProps> = ({
  legacyData,
  onBack,
  onStartQuest,
  onSelectHeroes,
  onOpenMerchant,
  onUpdateLegacyData
}) => {
  // State
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [progressList, setProgressList] = useState<CampaignProgress[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [selectedProgress, setSelectedProgress] = useState<CampaignProgress | null>(null);
  const [view, setView] = useState<'list' | 'detail' | 'heroes' | 'between'>('list');
  const [selectedHeroIds, setSelectedHeroIds] = useState<string[]>([]);

  const livingHeroes = useMemo(() => getLivingHeroes(legacyData), [legacyData]);

  // Load data on mount
  useEffect(() => {
    setCampaigns(loadCampaigns());
    setProgressList(loadCampaignProgress());
  }, []);

  // ============================================================================
  // CAMPAIGN OPERATIONS
  // ============================================================================

  const getProgressForCampaign = useCallback((campaignId: string): CampaignProgress | undefined => {
    return progressList.find(p => p.campaignId === campaignId);
  }, [progressList]);

  const startNewCampaign = useCallback((campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setSelectedProgress(null);
    setSelectedHeroIds([]);
    setView('heroes');
  }, []);

  const continueCampaign = useCallback((campaign: Campaign, progress: CampaignProgress) => {
    setSelectedCampaign(campaign);
    setSelectedProgress(progress);
    setSelectedHeroIds(progress.heroIds);
    setView('between');
  }, []);

  const handleSelectHero = useCallback((heroId: string) => {
    setSelectedHeroIds(prev => {
      if (prev.includes(heroId)) {
        return prev.filter(id => id !== heroId);
      }
      if (prev.length >= 4) return prev; // Max 4 heroes
      return [...prev, heroId];
    });
  }, []);

  const handleConfirmHeroes = useCallback(() => {
    if (!selectedCampaign || selectedHeroIds.length === 0) return;

    // Create or update progress
    const now = new Date().toISOString();
    const newProgress: CampaignProgress = selectedProgress || {
      campaignId: selectedCampaign.id,
      currentQuestIndex: 0,
      completedQuestIds: [],
      failedQuestIds: [],
      heroIds: selectedHeroIds,
      sharedGold: selectedCampaign.settings.sharedGold ? selectedCampaign.settings.startingGold : 0,
      startedAt: now,
      lastPlayedAt: now
    };

    // Update hero IDs if changed
    newProgress.heroIds = selectedHeroIds;
    newProgress.lastPlayedAt = now;

    // Save progress
    const updatedProgressList = progressList.filter(p => p.campaignId !== selectedCampaign.id);
    updatedProgressList.push(newProgress);
    setProgressList(updatedProgressList);
    saveCampaignProgress(updatedProgressList);

    setSelectedProgress(newProgress);
    setView('between');
  }, [selectedCampaign, selectedHeroIds, selectedProgress, progressList]);

  const handleStartQuest = useCallback(() => {
    if (!selectedCampaign || !selectedProgress) return;

    const currentQuest = selectedCampaign.quests[selectedProgress.currentQuestIndex];
    if (!currentQuest) return;

    onStartQuest(currentQuest.questId, selectedCampaign, selectedProgress);
  }, [selectedCampaign, selectedProgress, onStartQuest]);

  const getNextQuestIndex = useCallback((): number | null => {
    if (!selectedCampaign || !selectedProgress) return null;

    // Find first quest that isn't completed
    for (let i = 0; i < selectedCampaign.quests.length; i++) {
      const quest = selectedCampaign.quests[i];
      if (!selectedProgress.completedQuestIds.includes(quest.id)) {
        // Check prerequisites
        const prereqsMet = quest.prerequisites.every(prereqId =>
          selectedProgress.completedQuestIds.includes(prereqId)
        );
        if (prereqsMet) {
          return i;
        }
      }
    }
    return null;
  }, [selectedCampaign, selectedProgress]);

  const isCampaignComplete = useMemo(() => {
    if (!selectedCampaign || !selectedProgress) return false;

    const requiredQuests = selectedCampaign.quests.filter(q => q.isRequired);
    return requiredQuests.every(q => selectedProgress.completedQuestIds.includes(q.id));
  }, [selectedCampaign, selectedProgress]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderCampaignCard = (campaign: Campaign) => {
    const progress = getProgressForCampaign(campaign.id);
    const completedCount = progress?.completedQuestIds.length || 0;
    const totalQuests = campaign.quests.length;
    const hasProgress = progress && completedCount > 0;

    return (
      <div
        key={campaign.id}
        className={`p-4 rounded-lg border cursor-pointer transition-all ${
          selectedCampaign?.id === campaign.id
            ? 'bg-purple-900/30 border-purple-600'
            : 'bg-slate-800 border-slate-700 hover:border-slate-600'
        }`}
        onClick={() => {
          setSelectedCampaign(campaign);
          setView('detail');
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold truncate">{campaign.title}</h3>
            <p className="text-slate-400 text-sm mt-1 line-clamp-2">{campaign.description}</p>

            <div className="flex items-center gap-3 mt-2 text-xs">
              <span className={`px-2 py-0.5 rounded ${
                campaign.difficulty === 'easy' ? 'bg-green-700 text-green-200' :
                campaign.difficulty === 'normal' ? 'bg-amber-700 text-amber-200' :
                campaign.difficulty === 'hard' ? 'bg-red-700 text-red-200' :
                'bg-purple-700 text-purple-200'
              }`}>
                {campaign.difficulty}
              </span>
              <span className="text-slate-500">{totalQuests} quests</span>
              <span className="text-slate-500">{campaign.estimatedDuration}</span>
            </div>
          </div>

          {hasProgress && (
            <div className="text-right shrink-0">
              <div className="text-amber-400 text-sm font-medium">In Progress</div>
              <div className="text-slate-400 text-xs">{completedCount}/{totalQuests} complete</div>
            </div>
          )}
        </div>

        {hasProgress && (
          <div className="mt-3">
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-purple-400"
                style={{ width: `${(completedCount / totalQuests) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderHeroCard = (hero: LegacyHero) => {
    const isSelected = selectedHeroIds.includes(hero.id);
    const xpProgress = getXPProgress(hero);
    const needsLevelUp = canLevelUp(hero);

    return (
      <div
        key={hero.id}
        className={`p-3 rounded-lg border cursor-pointer transition-all ${
          isSelected
            ? 'bg-amber-900/30 border-amber-500'
            : 'bg-slate-800 border-slate-700 hover:border-slate-600'
        } ${needsLevelUp ? 'ring-2 ring-yellow-400' : ''}`}
        onClick={() => handleSelectHero(hero.id)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-xl">
            {hero.characterClass === 'detective' && '🔍'}
            {hero.characterClass === 'professor' && '📚'}
            {hero.characterClass === 'veteran' && '⚔️'}
            {hero.characterClass === 'occultist' && '🔮'}
            {hero.characterClass === 'journalist' && '📰'}
            {hero.characterClass === 'doctor' && '💉'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-white font-medium truncate">{hero.name}</span>
              <span className="text-amber-400 text-xs">Lv.{hero.level}</span>
              {needsLevelUp && (
                <span className="text-yellow-400 text-xs animate-pulse">LEVEL UP!</span>
              )}
            </div>
            <div className="text-slate-400 text-xs capitalize">{hero.characterClass}</div>
          </div>
          <div className="text-right text-xs">
            <div className="text-yellow-400 flex items-center gap-1">
              <Coins className="w-3 h-3" />
              {hero.gold}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ============================================================================
  // RENDER VIEWS
  // ============================================================================

  const renderCampaignList = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-purple-400" />
          Campaigns
        </h2>
      </div>

      {campaigns.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">No campaigns available</p>
          <p className="text-slate-500 text-sm mt-2">
            Create campaigns in the Quest Editor to play them here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map(campaign => renderCampaignCard(campaign))}
        </div>
      )}
    </div>
  );

  const renderCampaignDetail = () => {
    if (!selectedCampaign) return null;

    const progress = getProgressForCampaign(selectedCampaign.id);

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <button
            onClick={() => setView('list')}
            className="p-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white">{selectedCampaign.title}</h2>
            <p className="text-slate-400 mt-1">{selectedCampaign.description}</p>
          </div>
        </div>

        {/* Campaign info */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-slate-800 rounded-lg text-center">
            <div className="text-2xl font-bold text-white">{selectedCampaign.quests.length}</div>
            <div className="text-slate-400 text-sm">Quests</div>
          </div>
          <div className="p-4 bg-slate-800 rounded-lg text-center">
            <div className={`text-2xl font-bold ${
              selectedCampaign.difficulty === 'easy' ? 'text-green-400' :
              selectedCampaign.difficulty === 'normal' ? 'text-amber-400' :
              selectedCampaign.difficulty === 'hard' ? 'text-red-400' :
              'text-purple-400'
            }`}>
              {selectedCampaign.difficulty}
            </div>
            <div className="text-slate-400 text-sm">Difficulty</div>
          </div>
          <div className="p-4 bg-slate-800 rounded-lg text-center">
            <div className="text-2xl font-bold text-white">{selectedCampaign.estimatedDuration}</div>
            <div className="text-slate-400 text-sm">Duration</div>
          </div>
        </div>

        {/* Campaign settings */}
        <div className="p-4 bg-slate-800 rounded-lg">
          <h3 className="text-amber-400 font-medium mb-3">Campaign Rules</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2 text-slate-300">
              {selectedCampaign.settings.persistHeroes ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <X className="w-4 h-4 text-red-400" />
              )}
              Heroes persist between quests
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              {selectedCampaign.settings.persistEquipment ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <X className="w-4 h-4 text-red-400" />
              )}
              Equipment carries over
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              {selectedCampaign.settings.sharedGold ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <X className="w-4 h-4 text-red-400" />
              )}
              Shared gold pool
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              {selectedCampaign.settings.permadeathEnabled ? (
                <AlertTriangle className="w-4 h-4 text-red-400" />
              ) : (
                <CheckCircle className="w-4 h-4 text-green-400" />
              )}
              {selectedCampaign.settings.permadeathEnabled ? 'Permadeath ON' : 'No permadeath'}
            </div>
          </div>
        </div>

        {/* Quest list */}
        <div className="p-4 bg-slate-800 rounded-lg">
          <h3 className="text-amber-400 font-medium mb-3">Quests</h3>
          <div className="space-y-2">
            {selectedCampaign.quests.map((quest, index) => {
              const isCompleted = progress?.completedQuestIds.includes(quest.id);
              const isFailed = progress?.failedQuestIds.includes(quest.id);
              const isCurrent = progress?.currentQuestIndex === index;

              return (
                <div
                  key={quest.id}
                  className={`flex items-center gap-3 p-2 rounded ${
                    isCompleted ? 'bg-green-900/20' :
                    isFailed ? 'bg-red-900/20' :
                    isCurrent ? 'bg-amber-900/20' :
                    'bg-slate-700/50'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    isCompleted ? 'bg-green-600 text-white' :
                    isFailed ? 'bg-red-600 text-white' :
                    isCurrent ? 'bg-amber-600 text-white' :
                    'bg-slate-600 text-slate-400'
                  }`}>
                    {isCompleted ? '✓' : isFailed ? '✗' : index + 1}
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium ${
                      isCompleted ? 'text-green-400' :
                      isFailed ? 'text-red-400' :
                      isCurrent ? 'text-amber-400' :
                      'text-white'
                    }`}>
                      {quest.title}
                    </div>
                    {quest.description && (
                      <div className="text-slate-500 text-xs">{quest.description}</div>
                    )}
                  </div>
                  {quest.isRequired && (
                    <span className="text-amber-400 text-xs">Required</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          {progress ? (
            <Button
              onClick={() => continueCampaign(selectedCampaign, progress)}
              className="flex-1 py-4 bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Play className="w-5 h-5 mr-2" />
              Continue Campaign
            </Button>
          ) : (
            <Button
              onClick={() => startNewCampaign(selectedCampaign)}
              className="flex-1 py-4 bg-green-600 hover:bg-green-700 text-white"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Campaign
            </Button>
          )}
        </div>
      </div>
    );
  };

  const renderHeroSelection = () => {
    if (!selectedCampaign) return null;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <button
            onClick={() => setView('detail')}
            className="p-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white">Select Heroes</h2>
            <p className="text-slate-400 mt-1">
              Choose up to 4 heroes for "{selectedCampaign.title}"
            </p>
          </div>
        </div>

        {/* Hero list */}
        {livingHeroes.length === 0 ? (
          <div className="text-center py-12 bg-slate-800 rounded-lg">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No heroes available</p>
            <p className="text-slate-500 text-sm mt-2">
              Create heroes in the Hero Archive first
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {livingHeroes.map(hero => renderHeroCard(hero))}
          </div>
        )}

        {/* Selected count */}
        <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
          <div className="text-slate-400">
            Selected: <span className="text-white font-bold">{selectedHeroIds.length}/4</span> heroes
          </div>
          {selectedCampaign.settings.sharedGold && (
            <div className="text-slate-400">
              Starting Gold: <span className="text-yellow-400 font-bold">
                {selectedCampaign.settings.startingGold}
              </span>
            </div>
          )}
        </div>

        {/* Confirm button */}
        <Button
          onClick={handleConfirmHeroes}
          disabled={selectedHeroIds.length === 0}
          className="w-full py-4 bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50"
        >
          Confirm Heroes ({selectedHeroIds.length})
        </Button>
      </div>
    );
  };

  const renderBetweenQuests = () => {
    if (!selectedCampaign || !selectedProgress) return null;

    const nextQuestIndex = getNextQuestIndex();
    const nextQuest = nextQuestIndex !== null ? selectedCampaign.quests[nextQuestIndex] : null;
    const selectedHeroes = selectedHeroIds
      .map(id => legacyData.heroes.find(h => h.id === id))
      .filter((h): h is LegacyHero => h !== undefined);

    // Check if any hero needs level up
    const heroesNeedLevelUp = selectedHeroes.filter(h => canLevelUp(h));

    if (isCampaignComplete) {
      return (
        <div className="text-center py-12 space-y-6">
          <Trophy className="w-20 h-20 text-yellow-400 mx-auto" />
          <h2 className="text-3xl font-bold text-yellow-400">Campaign Complete!</h2>
          <p className="text-slate-300 text-lg">
            Congratulations! You have completed "{selectedCampaign.title}"
          </p>
          <div className="p-6 bg-slate-800 rounded-lg max-w-md mx-auto">
            <h3 className="text-amber-400 font-medium mb-4">Completion Rewards</h3>
            <div className="space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-slate-400">Bonus XP</span>
                <span className="text-blue-400">+{selectedCampaign.globalRewards.completionXP}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Bonus Gold</span>
                <span className="text-yellow-400">+{selectedCampaign.globalRewards.completionGold}</span>
              </div>
            </div>
          </div>
          <Button
            onClick={onBack}
            className="py-3 px-8 bg-purple-600 hover:bg-purple-700"
          >
            Return to Menu
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <button
            onClick={() => setView('list')}
            className="p-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white">{selectedCampaign.title}</h2>
            <p className="text-slate-400 mt-1">
              Quest {selectedProgress.completedQuestIds.length + 1} of {selectedCampaign.quests.length}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="p-4 bg-slate-800 rounded-lg">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-400">Campaign Progress</span>
            <span className="text-white">
              {selectedProgress.completedQuestIds.length}/{selectedCampaign.quests.length}
            </span>
          </div>
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-purple-400"
              style={{
                width: `${(selectedProgress.completedQuestIds.length / selectedCampaign.quests.length) * 100}%`
              }}
            />
          </div>
        </div>

        {/* Shared gold pool */}
        {selectedCampaign.settings.sharedGold && (
          <div className="p-4 bg-slate-800 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-yellow-400" />
              <span className="text-slate-300">Shared Gold Pool</span>
            </div>
            <span className="text-2xl font-bold text-yellow-400">{selectedProgress.sharedGold}</span>
          </div>
        )}

        {/* Heroes status */}
        <div className="p-4 bg-slate-800 rounded-lg">
          <h3 className="text-amber-400 font-medium mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Your Party
          </h3>
          <div className="space-y-2">
            {selectedHeroes.map(hero => (
              <div key={hero.id} className="flex items-center gap-3 p-2 bg-slate-700/50 rounded">
                <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center">
                  {hero.characterClass === 'detective' && '🔍'}
                  {hero.characterClass === 'professor' && '📚'}
                  {hero.characterClass === 'veteran' && '⚔️'}
                  {hero.characterClass === 'occultist' && '🔮'}
                  {hero.characterClass === 'journalist' && '📰'}
                  {hero.characterClass === 'doctor' && '💉'}
                </div>
                <div className="flex-1">
                  <span className="text-white">{hero.name}</span>
                  <span className="text-slate-500 text-sm ml-2">Lv.{hero.level}</span>
                  {canLevelUp(hero) && (
                    <span className="text-yellow-400 text-xs ml-2 animate-pulse">LEVEL UP!</span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-red-400">HP:{hero.maxHp}</span>
                  <span className="text-purple-400">SAN:{hero.maxSanity}</span>
                  {!selectedCampaign.settings.sharedGold && (
                    <span className="text-yellow-400">${hero.gold}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Level up warning */}
        {heroesNeedLevelUp.length > 0 && (
          <div className="p-4 bg-yellow-900/30 border border-yellow-600 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-400">
              <Star className="w-5 h-5" />
              <span className="font-medium">
                {heroesNeedLevelUp.length} hero{heroesNeedLevelUp.length > 1 ? 'es' : ''} can level up!
              </span>
            </div>
            <p className="text-yellow-300/70 text-sm mt-1">
              Visit the Hero Archive to apply level up bonuses before the next quest.
            </p>
          </div>
        )}

        {/* Next quest preview */}
        {nextQuest && (
          <div className="p-4 bg-slate-800 rounded-lg">
            <h3 className="text-amber-400 font-medium mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Next Quest
            </h3>
            <div className="p-3 bg-slate-700/50 rounded">
              <div className="text-white font-medium text-lg">{nextQuest.title}</div>
              {nextQuest.description && (
                <p className="text-slate-400 text-sm mt-1">{nextQuest.description}</p>
              )}
              <div className="flex items-center gap-4 mt-3 text-xs">
                {nextQuest.isRequired && (
                  <span className="text-amber-400">Required</span>
                )}
                <span className="text-green-400">+{nextQuest.rewards.xpBonus} XP</span>
                <span className="text-yellow-400">+{nextQuest.rewards.goldBonus} Gold</span>
              </div>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          {selectedCampaign.settings.allowMerchant && (
            <Button
              onClick={() => onOpenMerchant(selectedHeroes, selectedProgress.sharedGold)}
              variant="outline"
              className="flex-1 py-4 border-yellow-600 text-yellow-400 hover:bg-yellow-900/20"
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              Visit Merchant
            </Button>
          )}
          <Button
            onClick={handleStartQuest}
            disabled={!nextQuest}
            className="flex-1 py-4 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
          >
            <Play className="w-5 h-5 mr-2" />
            {nextQuest ? 'Start Quest' : 'No Quest Available'}
          </Button>
        </div>
      </div>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

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
          Campaign Play
        </h2>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto">
          {view === 'list' && renderCampaignList()}
          {view === 'detail' && renderCampaignDetail()}
          {view === 'heroes' && renderHeroSelection()}
          {view === 'between' && renderBetweenQuests()}
        </div>
      </div>
    </div>
  );
};

// Need to import X icon
import { X } from 'lucide-react';

export default CampaignPlayManager;
