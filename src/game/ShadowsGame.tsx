import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { Skull, RotateCcw, ArrowLeft, Heart, Brain, Settings, History, ScrollText, Users, Package, X, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import { GamePhase, GameState, Player, Tile, CharacterType, Enemy, EnemyType, Scenario, FloatingText, EdgeData, CombatState, TileCategory, ZoneLevel, createEmptyInventory, equipItem, getAllItems, isInventoryFull, ContextAction, ContextActionTarget, LegacyData, LegacyHero, ScenarioResult, HeroScenarioResult, canLevelUp, createDefaultWeatherState, WeatherType, WeatherCondition, Item, InventorySlotName, hasLightSource, DarkRoomContent, OccultistSpell, SpellParticleType, LogEntry, detectLogCategory, getLogCategoryClasses, LevelUpBonus, SurvivorTrait, GameStats, createInitialGameStats } from './types';
import ContextActionBar from './components/ContextActionBar';
import { getContextActions, getDoorActions, getObstacleActions } from './utils/contextActions';
import { performSkillCheck } from './utils/combatUtils';
import { CHARACTERS, ITEMS, START_TILE, SCENARIOS, MADNESS_CONDITIONS, SPELLS, OCCULTIST_SPELLS, BESTIARY, INDOOR_LOCATIONS, OUTDOOR_LOCATIONS, INDOOR_CONNECTORS, OUTDOOR_CONNECTORS, getCombatModifier, SPAWN_CHANCES, validateTileConnection, selectRandomConnectableCategory, isDoorRequired, CATEGORY_ZONE_LEVELS, LOCATION_DESCRIPTIONS, getWeatherForDoom, getWeatherEffect, calculateWeatherAgilityPenalty, rollWeatherHorror, WEATHER_EFFECTS, getDarkRoomItem, DARK_ROOM_LOOT_TABLES, getAvailableSurvivorTraits, getEnemyLoot } from './constants';
import { hexDistance, findPath, getEdgeDirection, getOppositeEdgeDirection } from './hexUtils';
import { validateMovementEdges } from './utils/movementUtils';
import GameBoard from './components/GameBoard';
import CharacterPanel from './components/CharacterPanel';
import EnemyPanel from './components/EnemyPanel';
import ActionBar from './components/ActionBar';
import DiceRoller from './components/DiceRoller';
import MainMenu from './components/MainMenu';
import OptionsMenu, { GameSettings, DEFAULT_SETTINGS } from './components/OptionsMenu';
import GameOverOverlay, { GameOverType } from './components/GameOverOverlay';
import MythosPhaseOverlay from './components/MythosPhaseOverlay';
import ScenarioBriefingPopup from './components/ScenarioBriefingPopup';
import ScenarioInfoModal from './components/ScenarioInfoModal';
import HeroArchivePanel from './components/HeroArchivePanel';
import EquipmentStashPanel from './components/EquipmentStashPanel';
import MerchantShop from './components/MerchantShop';
import { performAttack, performHorrorCheck, calculateEnemyDamage, hasRangedWeapon, canAttackEnemy } from './utils/combatUtils';
import { processEnemyTurn, selectRandomEnemy, createEnemy, shouldSpawnMonster } from './utils/monsterAI';
import { checkVictoryConditions, checkDefeatConditions, updateObjectiveProgress, completeObjective, checkKillObjectives, checkExploreObjectives, updateSurvivalObjectives, getVisibleObjectives } from './utils/scenarioUtils';
import PuzzleModal from './components/PuzzleModal';
import EventModal from './components/EventModal';
import SpellSelectionModal from './components/SpellSelectionModal';
import LevelUpModal from './components/LevelUpModal';
import SurvivorTraitModal from './components/SurvivorTraitModal';
import FieldGuidePanel from './components/FieldGuidePanel';
import CharacterSelectionScreen from './components/CharacterSelectionScreen';
import SaveLoadModal from './components/SaveLoadModal';
import QuestEditor, { CustomQuestLoader, CampaignPlayManager, convertQuestToScenario } from './components/QuestEditor';
// Lazy load heavy visual effects libraries to prevent blocking game startup
// These use pixi.js and three.js which can cause WebGL initialization issues
const AdvancedParticles = lazy(() => import('./components/AdvancedParticles'));
const ShaderEffects = lazy(() => import('./components/ShaderEffects'));
import { autoSave } from './utils/saveManager';
import {
  loadLegacyData,
  saveLegacyData,
  addHeroToArchive,
  updateHero,
  getLivingHeroes,
  legacyHeroToPlayer,
  updateLegacyHeroFromPlayer,
  processScenarioCompletion,
  calculateScenarioGoldReward,
  calculateScenarioXPReward,
  killHero,
  addXPToHero,
  addGoldToHero,
  createDefaultLegacyData,
  applyLevelUpBonus
} from './utils/legacyManager';
import { generateValidatedScenario, getScenarioValidationInfo } from './utils/scenarioGenerator';
import {
  gatherConstraints,
  findValidTemplates,
  selectWeightedTemplate,
  createTileFromTemplate,
  TileTemplate,
  TILE_TEMPLATES,
  getTemplatesByCategory,
  getClustersForCategory,
  ROOM_CLUSTERS,
  RoomCluster,
  ConnectionEdgeType,
  rotateEdges,
  getNeighborTiles,
  synchronizeEdgesWithNeighbors,
  boardArrayToMap,
  boardMapToArray
} from './tileConnectionSystem';
import {
  initializeObjectiveSpawns,
  shouldSpawnQuestItem,
  shouldRevealQuestTile,
  shouldSpawnQuestTile,
  collectQuestItem,
  onTileExplored,
  QUEST_ITEM_NAMES,
  ObjectiveSpawnState,
  checkGuaranteedSpawns,
  executeGuaranteedSpawns,
  getSpawnStatus,
  GuaranteedSpawnResult
} from './utils/objectiveSpawner';
import { getThemedTilePreferences } from './utils/scenarioGenerator';
import {
  createShuffledEventDeck,
  drawEventCard,
  discardEventCard,
  resolveEventEffect,
  performEventSkillCheck,
  getDeckState
} from './utils/eventDeckManager';
import {
  initializeAudio,
  playSound,
} from './utils/audioManager';
import {
  calculateDoomWithDarkInsightPenalty,
  findNewlyCompletedSurvivalObjectives,
  processWeatherForNewRound
} from './utils/mythosPhaseHelpers';
import {
  collectActivePortals,
  processPortalSpawns,
  processGuaranteedSpawns,
  processEnemyCombatPhase,
  applyDamageToPlayer,
  tryDrawEventCard,
  resetPlayersForNewTurn,
  shouldApplyMadnessEffects,
  areAllPlayersDead
} from './utils/mythosPhaseUtils';
import {
  processActionEffect,
  ActionEffectContext,
  ActionEffectResult,
  getAdjacentPosition
} from './utils/contextActionEffects';
import {
  getCategoryTilePool,
  getFloorTypeForCategory,
  createFallbackEdges,
  createFallbackTile,
  selectRandomRoomName,
  categoryMatchesTileSet,
  processQuestItemOnNewTile,
  calculateEnemySpawnPosition,
  createFallbackSpawnResult
} from './utils/roomSpawnHelpers';
import {
  shouldSpawnSurvivor,
  selectSurvivorType,
  createSurvivor,
  processSurvivorTurn,
  startFollowing,
  rescueSurvivor,
  killSurvivor,
  useSurvivorAbility,
  SURVIVOR_TEMPLATES
} from './utils/survivorSystem';

const STORAGE_KEY = 'shadows_1920s_save';
const SETTINGS_KEY = 'shadows_1920s_settings';
const LEGACY_STORAGE_KEY = 'shadows_1920s_legacy';
const APP_VERSION = "1.0.0";

// Menu view modes for main menu
type MainMenuView = 'title' | 'heroArchive' | 'stash' | 'merchant' | 'questEditor' | 'customQuest' | 'campaign';

const DEFAULT_STATE: GameState = {
  phase: GamePhase.SETUP,
  doom: 12,
  round: 1,
  players: [],
  activePlayerIndex: 0,
  board: [START_TILE],
  enemies: [],
  encounteredEnemies: [],
  cluesFound: 0,
  log: [],
  lastDiceRoll: null,
  activeEvent: null,
  eventDeck: createShuffledEventDeck(),
  eventDiscardPile: [],
  activeCombat: null,
  activePuzzle: null,
  selectedEnemyId: null,
  selectedTileId: null,
  activeScenario: null,
  activeModifiers: [],
  floatingTexts: [],
  spellParticles: [],
  screenShake: false,
  activeSpell: null,
  activeOccultistSpell: null,
  currentStepIndex: 0,
  questItemsCollected: [],
  exploredTiles: ['0,0'], // Start tile is always explored
  pendingHorrorChecks: [],
  weatherState: createDefaultWeatherState(),
  survivors: [],
  rescuedSurvivors: [],
  globalEnemyAttackBonus: 0
};

const ROOM_SHAPES = {
  SMALL: [{ q: 0, r: 0 }],
  MEDIUM: [{ q: 0, r: 0 }, { q: 1, r: 0 }, { q: 0, r: 1 }, { q: 1, r: -1 }],
  LINEAR: [{ q: 0, r: 0 }, { q: 1, r: 0 }, { q: 2, r: 0 }]
};

const ShadowsGame: React.FC = () => {
  const isMobile = useIsMobile();
  const [isMainMenuOpen, setIsMainMenuOpen] = useState(true);
  const [mainMenuView, setMainMenuView] = useState<MainMenuView>('title');
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [showLeftPanel, setShowLeftPanel] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [showMythosOverlay, setShowMythosOverlay] = useState(false);
  const [showBriefing, setShowBriefing] = useState(false);
  const [gameOverType, setGameOverType] = useState<GameOverType | null>(null);
  const [showFieldGuide, setShowFieldGuide] = useState(false);

  // Occultist Spell Selection state
  const [showSpellSelection, setShowSpellSelection] = useState(false);
  const [pendingOccultistCharacter, setPendingOccultistCharacter] = useState<CharacterType | null>(null);

  // Legacy Occultist Spell Selection state
  const [pendingLegacyOccultists, setPendingLegacyOccultists] = useState<LegacyHero[]>([]);
  const [currentLegacyOccultistIndex, setCurrentLegacyOccultistIndex] = useState(0);

  // Character Selection Screen state
  const [showCharacterSelection, setShowCharacterSelection] = useState(false);

  // Save/Load Modal state
  const [showSaveLoadModal, setShowSaveLoadModal] = useState(false);

  // Context Action state
  const [activeContextTarget, setActiveContextTarget] = useState<ContextActionTarget | null>(null);
  const [contextActions, setContextActions] = useState<ContextAction[]>([]);

  // Legacy System State
  const [legacyData, setLegacyData] = useState<LegacyData>(() => loadLegacyData());
  const [selectedLegacyHeroIds, setSelectedLegacyHeroIds] = useState<string[]>([]);
  const [showMerchantShop, setShowMerchantShop] = useState(false);
  const [showStashPanel, setShowStashPanel] = useState(false);
  const [showScenarioInfo, setShowScenarioInfo] = useState(false);
  const [lastScenarioResult, setLastScenarioResult] = useState<ScenarioResult | null>(null);
  const [heroKillCounts, setHeroKillCounts] = useState<Record<string, number>>({});

  // Level-Up Modal State
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [levelUpQueue, setLevelUpQueue] = useState<{ heroId: string; newLevel: number }[]>([]);
  const [currentLevelUpHero, setCurrentLevelUpHero] = useState<LegacyHero | null>(null);

  // Survivor Trait Modal State (for permadeath heroes)
  const [showSurvivorTraitModal, setShowSurvivorTraitModal] = useState(false);
  const [survivorTraitQueue, setSurvivorTraitQueue] = useState<string[]>([]); // Hero IDs
  const [currentSurvivorHero, setCurrentSurvivorHero] = useState<LegacyHero | null>(null);

  // Difficulty selection for random scenario
  const [selectedDifficulty, setSelectedDifficulty] = useState<'Normal' | 'Hard' | 'Nightmare' | null>(null);

  // Generate random scenario based on difficulty using validated dynamic generator
  const getRandomScenario = useCallback((difficulty: 'Normal' | 'Hard' | 'Nightmare'): Scenario => {
    // Use the validated scenario generator that ensures winnability
    const result = generateValidatedScenario(difficulty);

    // Log validation info for debugging
    if (result.wasFixed) {
      console.log(`[ScenarioValidator] Applied ${result.fixChanges.length} fixes:`, result.fixChanges);
    }
    if (result.validation.issues.length > 0) {
      console.log(`[ScenarioValidator] Validation issues:`, result.validation.issues);
    }
    console.log(`[ScenarioValidator] Confidence: ${result.validation.confidence}% | Attempts: ${result.attempts}`);

    return result.scenario;
  }, []);

  // Game settings with localStorage persistence
  const [settings, setSettings] = useState<GameSettings>(() => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch (e) { console.error(e); }
    }
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const [state, setState] = useState<GameState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...parsed, floatingTexts: [], spellParticles: [], screenShake: false, activeSpell: null, activeOccultistSpell: null };
      } catch (e) { console.error(e); }
    }
    return DEFAULT_STATE;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Save legacy data when it changes
  useEffect(() => {
    saveLegacyData(legacyData);
  }, [legacyData]);

  // ============================================================================
  // MYTHOS PHASE - REFACTORED
  // Previously ~280 lines, now ~100 lines using extracted utilities
  // See: src/game/utils/mythosPhaseUtils.ts for the extracted logic
  // ============================================================================
  useEffect(() => {
    if (state.phase === GamePhase.MYTHOS) {
      addToLog("Mythos-fasen vekkes. Eldgamle hjul snurrer i morket.");

      const runEnemyAI = async () => {
        // === STEP 1: PORTAL SPAWNING ===
        const portals = collectActivePortals(state.board);
        const portalResult = processPortalSpawns(portals);

        // Execute portal spawns
        for (const spawn of portalResult.spawns) {
          spawnEnemy(spawn.enemyType, spawn.q, spawn.r);
        }
        portalResult.messages.forEach(msg => addToLog(msg));
        portalResult.floatingTexts.forEach(ft => addFloatingText(ft.q, ft.r, ft.text, ft.colorClass));

        // === STEP 2: GUARANTEED SPAWNS (quest items/tiles) ===
        if (state.objectiveSpawnState && state.activeScenario) {
          const guaranteedResult = processGuaranteedSpawns(
            state.objectiveSpawnState,
            state.activeScenario,
            state.doom,
            state.board
          );

          if (guaranteedResult) {
            guaranteedResult.messages.forEach(msg => addToLog(msg));
            guaranteedResult.floatingTexts.forEach(ft => addFloatingText(ft.q, ft.r, ft.text, ft.colorClass));

            setState(prev => {
              const newLog = guaranteedResult.urgencyMessage
                ? [{
                    timestamp: new Date().toLocaleTimeString(),
                    message: guaranteedResult.urgencyMessage,
                    category: 'quest_progress' as const
                  }, ...prev.log].slice(0, 50)
                : prev.log;
              return {
                ...prev,
                board: guaranteedResult.updatedBoard,
                objectiveSpawnState: guaranteedResult.updatedSpawnState,
                log: newLog,
              };
            });
          }
        }

        // === STEP 3: ENEMY COMBAT ===
        const combatResult = processEnemyCombatPhase(
          state.enemies,
          state.players,
          state.board,
          state.doom,
          state.globalEnemyAttackBonus || 0
        );

        // Log AI messages and special events
        combatResult.aiMessages.forEach(msg => addToLog(msg));
        for (const event of combatResult.specialEvents) {
          addToLog(`⚡ ${event.description}`);
          if (event.type === 'teleport') {
            addFloatingText(event.enemy.position.q, event.enemy.position.r, "✦ TELEPORT ✦", "text-accent");
            triggerScreenShake();
          }
        }

        // Apply damage to players (using component's checkMadness/applyAllyDeathSanityLoss)
        let updatedPlayers = [...state.players];
        for (const attack of combatResult.processedAttacks) {
          addToLog(attack.message);
          addFloatingText(attack.targetPosition.q, attack.targetPosition.r,
            `-${attack.hpDamage} HP${attack.sanityDamage > 0 ? ` -${attack.sanityDamage} SAN` : ''}`,
            "text-primary");
          triggerScreenShake();
          // Advanced visual effects for player damage
          triggerAdvancedEffect(attack.hpDamage >= 3 ? 'critical-hit' : 'player-hit');
          if (attack.sanityDamage > 0) triggerAdvancedEffect('sanity-loss');

          if (attack.hpDamage > 0) {
            addBloodstains(attack.targetPosition.q, attack.targetPosition.r, attack.hpDamage);
          }

          let newlyDeadPlayerId: string | null = null;
          updatedPlayers = updatedPlayers.map(p => {
            if (p.id === attack.targetPlayerId) {
              const { updatedPlayer, newlyDead } = applyDamageToPlayer(p, attack.hpDamage, attack.sanityDamage);
              if (newlyDead) {
                addToLog(`${p.name} har falt for morket...`);
                newlyDeadPlayerId = p.id;
              }
              return checkMadness(updatedPlayer);
            }
            return p;
          });

          if (newlyDeadPlayerId) {
            updatedPlayers = applyAllyDeathSanityLoss(newlyDeadPlayerId, updatedPlayers);
          }
        }

        // CRITICAL: Save damaged players to state immediately
        // This ensures HP/Sanity changes persist before setTimeout callback
        if (combatResult.processedAttacks.length > 0) {
          setState(prev => ({
            ...prev,
            players: updatedPlayers
          }));
        }

        // === STEP 3.5: SURVIVOR TURN PROCESSING ===
        if (state.survivors && state.survivors.length > 0) {
          const survivorResult = processSurvivorTurn(
            state.survivors,
            updatedPlayers,
            combatResult.updatedEnemies,
            state.board
          );

          // Log survivor messages
          survivorResult.messages.forEach(msg => addToLog(msg));

          // Handle panic events
          for (const panicEvent of survivorResult.panicEvents) {
            addToLog(`⚠️ ${panicEvent.message}`);
            addFloatingText(
              panicEvent.survivor.position.q,
              panicEvent.survivor.position.r,
              "PANIC!",
              "text-yellow-400"
            );
          }

          // Update survivors state
          setState(prev => ({
            ...prev,
            survivors: survivorResult.updatedSurvivors
          }));
        }

        // === STEP 4: DOOM EVENTS ===
        checkDoomEvents(state.doom - 1);

        // === STEP 5: EVENT CARD DRAWING ===
        const eventResult = tryDrawEventCard(state.eventDeck, state.eventDiscardPile, state.doom);
        if (eventResult) {
          if (eventResult.message) addToLog(eventResult.message);
          setState(prev => ({
            ...prev,
            eventDeck: eventResult.newDeck,
            eventDiscardPile: eventResult.newDiscardPile,
            activeEvent: eventResult.card
          }));
          playSound('eventCard');
          addToLog(`📜 EVENT: ${eventResult.card.title}`);
        }

        // === STEP 6: (Moved to STEP 7) ===
        // Game over check is now in phase transition to account for event card effects

        // === STEP 7: PHASE TRANSITION ===
        // CRITICAL: Use prev.players in the callback to get the CURRENT state
        // This ensures event card effects (HP/Sanity changes) are not overwritten
        // by the closure-captured 'updatedPlayers' from earlier in this function
        setTimeout(() => {
          setState(prev => {
            // Check for game over with CURRENT player state (event cards might have healed)
            if (areAllPlayersDead(prev.players)) {
              playSound('defeat');
              addToLog("All investigators have fallen. The darkness claims victory.");
              setGameOverType('defeat_death');
              return {
                ...prev,
                enemies: combatResult.updatedEnemies.filter(e => e.hp > 0),
                phase: GamePhase.GAME_OVER,
                players: prev.players
              };
            }

            // Use prev.players to include any changes from event card resolution
            const { resetPlayers } = resetPlayersForNewTurn(prev.players);

            // Find the first alive player for new round
            let firstAliveIndex = 0;
            for (let i = 0; i < resetPlayers.length; i++) {
              if (!resetPlayers[i].isDead) {
                firstAliveIndex = i;
                break;
              }
            }

            const { shouldApply, playerIndex } = shouldApplyMadnessEffects(resetPlayers);
            if (shouldApply && playerIndex === firstAliveIndex) {
              resetPlayers[firstAliveIndex] = applyMadnessTurnStartEffects(resetPlayers[firstAliveIndex]);
            }
            return {
              ...prev,
              enemies: combatResult.updatedEnemies.filter(e => e.hp > 0),
              phase: GamePhase.INVESTIGATOR,
              activePlayerIndex: firstAliveIndex,
              players: resetPlayers
            };
          });
          addToLog("En ny dag gryr...");
        }, 1200);
      };

      runEnemyAI();
    }
  }, [state.phase]);

  // Check and trigger doom events
  const checkDoomEvents = useCallback((currentDoom: number) => {
    if (!state.activeScenario) return;

    state.activeScenario.doomEvents.forEach(event => {
      if (!event.triggered && currentDoom <= event.threshold) {
        addToLog(event.message);
        triggerScreenShake();

        if (event.type === 'spawn_enemy' || event.type === 'spawn_boss') {
          // Runtime validation: ensure targetId is a valid EnemyType
          const targetId = event.targetId;
          if (!targetId || !(targetId in BESTIARY)) {
            console.warn(`Invalid enemy type in doom event: ${targetId}. Falling back to 'cultist'.`);
          }
          const spawnType: EnemyType = (targetId && targetId in BESTIARY)
            ? targetId as EnemyType
            : 'cultist';
          const count = event.amount || 1;

          // Spawn near a random player
          const alivePlayers = state.players.filter(p => !p.isDead);
          if (alivePlayers.length > 0) {
            const targetPlayer = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
            for (let i = 0; i < count; i++) {
              const offsetQ = Math.floor(Math.random() * 3) - 1;
              const offsetR = Math.floor(Math.random() * 3) - 1;
              spawnEnemy(spawnType, targetPlayer.position.q + offsetQ + 1, targetPlayer.position.r + offsetR);
            }
          }
        }

        // Mark event as triggered
        setState(prev => ({
          ...prev,
          activeScenario: prev.activeScenario ? {
            ...prev.activeScenario,
            doomEvents: prev.activeScenario.doomEvents.map(e =>
              e.threshold === event.threshold ? { ...e, triggered: true } : e
            )
          } : null
        }));
      }
    });
  }, [state.activeScenario, state.players]);

  const addToLog = (message: string) => {
    const entry: LogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      message,
      category: detectLogCategory(message)
    };
    setState(prev => ({ ...prev, log: [entry, ...prev.log].slice(0, 50) }));
  };

  const triggerScreenShake = () => {
    setState(prev => ({ ...prev, screenShake: true }));
    setTimeout(() => setState(prev => ({ ...prev, screenShake: false })), 500);
  };

  // Advanced visual effects helper - emits GPU-accelerated particles and shaders
  const triggerAdvancedEffect = useCallback((
    preset: 'player-hit' | 'player-death' | 'enemy-hit' | 'enemy-death' | 'critical-hit' | 'sanity-loss' | 'sanity-zero' | 'spell-cast' | 'portal-open' | 'doom-tick' | 'victory' | 'horror-check-fail',
    screenX?: number,
    screenY?: number
  ) => {
    // Only trigger if advanced effects are enabled
    if (!settings.advancedParticles && !settings.shaderEffects) return;

    const x = screenX ?? window.innerWidth / 2;
    const y = screenY ?? window.innerHeight / 2;

    const emitFn = (window as any).__emitAdvancedParticles;
    const shaderFn = (window as any).__triggerShaderEffect;

    switch (preset) {
      case 'player-hit':
        if (emitFn && settings.advancedParticles) emitFn(x, y, 'blood-splatter');
        if (shaderFn && settings.shaderEffects) shaderFn('sanity-distortion', 0.3, 300);
        break;
      case 'player-death':
        if (emitFn && settings.advancedParticles) {
          emitFn(x, y, 'death-essence');
          emitFn(x, y, 'blood-splatter');
        }
        if (shaderFn && settings.shaderEffects) shaderFn('death-fade', 1, 2000);
        break;
      case 'enemy-hit':
        if (emitFn && settings.advancedParticles) emitFn(x, y, 'combat-hit');
        break;
      case 'enemy-death':
        if (emitFn && settings.advancedParticles) emitFn(x, y, 'death-essence');
        if (shaderFn && settings.shaderEffects) shaderFn('doom-pulse', 0.2, 500);
        break;
      case 'critical-hit':
        if (emitFn && settings.advancedParticles) {
          emitFn(x, y, 'combat-hit');
          emitFn(x, y, 'fire-embers');
        }
        if (shaderFn && settings.shaderEffects) shaderFn('doom-pulse', 0.5, 400);
        break;
      case 'sanity-loss':
        if (emitFn && settings.advancedParticles) emitFn(x, y, 'sanity-drain');
        if (shaderFn && settings.shaderEffects) shaderFn('sanity-distortion', 0.5, 800);
        break;
      case 'sanity-zero':
        if (emitFn && settings.advancedParticles) {
          emitFn(x, y, 'eldritch-mist');
          emitFn(x, y, 'tentacle-burst');
        }
        if (shaderFn && settings.shaderEffects) shaderFn('madness-glitch', 1, 2000);
        break;
      case 'spell-cast':
        if (emitFn && settings.advancedParticles) emitFn(x, y, 'magic-burst');
        if (shaderFn && settings.shaderEffects) shaderFn('ritual-glow', 0.6, 1000);
        break;
      case 'portal-open':
        if (emitFn && settings.advancedParticles) emitFn(x, y, 'portal-vortex');
        if (shaderFn && settings.shaderEffects) shaderFn('portal-warp', 1, 1500);
        break;
      case 'doom-tick':
        if (shaderFn && settings.shaderEffects) shaderFn('doom-pulse', 0.3, 500);
        break;
      case 'victory':
        if (emitFn && settings.advancedParticles) {
          emitFn(x, y, 'holy-light');
          emitFn(x, y, 'magic-burst');
        }
        if (shaderFn && settings.shaderEffects) shaderFn('ritual-glow', 0.8, 2000);
        break;
      case 'horror-check-fail':
        if (emitFn && settings.advancedParticles) {
          emitFn(x, y, 'sanity-drain');
          emitFn(x, y, 'eldritch-mist');
        }
        if (shaderFn && settings.shaderEffects) shaderFn('cosmic-horror', 0.7, 1200);
        break;
    }
  }, [settings.advancedParticles, settings.shaderEffects]);

  const addFloatingText = (q: number, r: number, content: string, colorClass: string) => {
    const id = `ft-${Date.now()}`;
    setState(prev => ({
      ...prev,
      floatingTexts: [...prev.floatingTexts, { id, q, r, content, colorClass, randomOffset: { x: (Math.random() - 0.5) * 40, y: (Math.random() - 0.5) * 40 } }]
    }));
    setTimeout(() => {
      setState(prev => ({ ...prev, floatingTexts: prev.floatingTexts.filter(t => t.id !== id) }));
    }, 2000);
  };

  // Add blood stains to a tile when damage is dealt
  const addBloodstains = useCallback((q: number, r: number, damageAmount: number) => {
    const stainCount = Math.min(Math.ceil(damageAmount / 2), 4); // 1-4 stains based on damage
    const positions = Array.from({ length: stainCount }, () => ({
      x: 20 + Math.random() * 60, // 20-80% of tile width
      y: 20 + Math.random() * 60, // 20-80% of tile height
      rotation: Math.random() * 360,
      size: 15 + Math.random() * 20 // 15-35px
    }));

    setState(prev => ({
      ...prev,
      board: prev.board.map(tile => {
        if (tile.q === q && tile.r === r) {
          const existingStains = tile.bloodstains || { count: 0, positions: [] };
          return {
            ...tile,
            bloodstains: {
              count: Math.min(existingStains.count + stainCount, 8), // Max 8 stains per tile
              positions: [...existingStains.positions, ...positions].slice(-8),
              fadeTime: 0 // Reset fade time
            }
          };
        }
        return tile;
      })
    }));
  }, []);

  // Trigger fog reveal animation for a tile
  const triggerFogReveal = useCallback((q: number, r: number) => {
    setState(prev => ({
      ...prev,
      board: prev.board.map(tile => {
        if (tile.q === q && tile.r === r && !tile.explored) {
          return { ...tile, fogRevealAnimation: 'revealing' as const };
        }
        return tile;
      })
    }));

    // Clear the animation after it completes
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        board: prev.board.map(tile => {
          if (tile.q === q && tile.r === r) {
            return { ...tile, fogRevealAnimation: 'revealed' as const, explored: true };
          }
          return tile;
        })
      }));
    }, 1200);
  }, []);

  // Emit spell particle effects
  const emitSpellEffect = (
    startQ: number,
    startR: number,
    type: SpellParticleType,
    targetQ?: number,
    targetR?: number
  ) => {
    // Particle configuration per spell type
    const particleConfig: Record<string, { duration: number; count: number; size: 'sm' | 'md' | 'lg'; animation: 'projectile' | 'burst' | 'radiate' | 'implode' | 'orbit' | 'float'; color: string }> = {
      wither: { duration: 800, count: 8, size: 'md', animation: 'projectile', color: 'wither' },
      eldritch_bolt: { duration: 600, count: 12, size: 'lg', animation: 'projectile', color: 'eldritch' },
      mend_flesh: { duration: 1200, count: 15, size: 'sm', animation: 'burst', color: 'mend' },
      true_sight: { duration: 1500, count: 20, size: 'sm', animation: 'radiate', color: 'sight' },
      banish: { duration: 1000, count: 16, size: 'md', animation: 'implode', color: 'banish' },
      mind_blast: { duration: 600, count: 10, size: 'md', animation: 'burst', color: 'mind' },
      dark_shield: { duration: 1500, count: 12, size: 'md', animation: 'orbit', color: 'shield' },
      explosion: { duration: 500, count: 12, size: 'md', animation: 'burst', color: 'banish' },
      blood: { duration: 600, count: 8, size: 'sm', animation: 'burst', color: 'blood' },
      smoke: { duration: 1200, count: 10, size: 'lg', animation: 'float', color: 'smoke' },
      sparkle: { duration: 800, count: 6, size: 'sm', animation: 'burst', color: 'sparkle' },
      item_collect: { duration: 1000, count: 8, size: 'md', animation: 'float', color: 'item-collect' }
    };

    const config = particleConfig[type] || particleConfig.sparkle;
    const id = `sp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const particle = {
      id,
      type,
      startQ,
      startR,
      targetQ,
      targetR,
      startTime: Date.now(),
      duration: config.duration,
      color: config.color,
      size: config.size,
      count: config.count,
      animation: config.animation
    };

    setState(prev => ({
      ...prev,
      spellParticles: [...prev.spellParticles, particle]
    }));

    // Auto-remove particle after duration + buffer
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        spellParticles: prev.spellParticles.filter(p => p.id !== id)
      }));
    }, config.duration + 200);
  };

  const checkMadness = (player: Player) => {
    if (player.sanity <= 0 && !player.activeMadness) {
      const newMadness = MADNESS_CONDITIONS[Math.floor(Math.random() * MADNESS_CONDITIONS.length)];
      const updatedMadnessList = [...player.madness, newMadness.id];

      addToLog(`${player.name} has cracked. Madness sets in: ${newMadness.name}!`);
      addFloatingText(player.position.q, player.position.r, "MENTAL BREAK", "text-sanity");
      triggerScreenShake();
      triggerAdvancedEffect('sanity-zero');

      // Check for 3 madness conditions = character permanently lost
      if (updatedMadnessList.length >= 3) {
        addToLog(`${player.name} has accumulated 3 madness conditions and is PERMANENTLY LOST to insanity!`);
        addFloatingText(player.position.q, player.position.r, "LOST TO MADNESS", "text-danger");
        return {
          ...player,
          sanity: 0,
          activeMadness: newMadness,
          madness: updatedMadnessList,
          isDead: true  // Treat as dead for game mechanics
        };
      }

      return {
        ...player,
        sanity: Math.floor(player.maxSanity / 2),
        activeMadness: newMadness,
        madness: updatedMadnessList
      };
    }
    return player;
  };

  // Apply madness effects at the start of a player's turn
  const applyMadnessTurnStartEffects = (player: Player): Player => {
    if (!player.activeMadness || player.isDead) return player;

    let updatedPlayer = { ...player };
    const madnessType = player.activeMadness.type;

    switch (madnessType) {
      case 'catatonia':
        // Catatonia: -1 AP permanently
        updatedPlayer.actions = Math.max(0, updatedPlayer.actions - 1);
        addToLog(`${player.name}'s catatonia reduces their actions by 1.`);
        addFloatingText(player.position.q, player.position.r, "-1 AP (Catatonia)", "text-warning");
        break;

      case 'hysteria':
        // Hysteria: 50% chance to lose 1 AP
        if (Math.random() < 0.5) {
          updatedPlayer.actions = Math.max(0, updatedPlayer.actions - 1);
          addToLog(`${player.name} loses control momentarily! -1 AP from hysteria.`);
          addFloatingText(player.position.q, player.position.r, "-1 AP (Hysteria)", "text-warning");
        }
        break;

      case 'dark_insight':
        // Dark Insight: +2 Insight (permanent effect handled here for visibility)
        // The doom penalty is handled in handleMythosOverlayComplete
        if (!player.traits?.some(t => t.id === 'dark_insight_bonus')) {
          addToLog(`${player.name}'s dark insight grants forbidden knowledge...`);
        }
        break;
    }

    return updatedPlayer;
  };

  // Apply sanity loss to other players when witnessing ally death
  const applyAllyDeathSanityLoss = (deadPlayerId: string, allPlayers: Player[]): Player[] => {
    const ALLY_DEATH_SANITY_LOSS = 2;
    return allPlayers.map(p => {
      if (p.id !== deadPlayerId && !p.isDead) {
        const newSanity = Math.max(0, p.sanity - ALLY_DEATH_SANITY_LOSS);
        addFloatingText(p.position.q, p.position.r, `-${ALLY_DEATH_SANITY_LOSS} SAN`, "text-sanity");
        addToLog(`${p.name} witnesses their ally fall - sanity shaken!`);
        return checkMadness({ ...p, sanity: newSanity });
      }
      return p;
    });
  };

  // Check for game over conditions (both victory and defeat)
  const checkGameOver = useCallback((players: Player[], doom: number) => {
    // First check for victory conditions if scenario is active
    if (state.activeScenario) {
      const victoryResult = checkVictoryConditions(state.activeScenario, {
        players,
        enemies: state.enemies,
        board: state.board,
        round: state.round,
        doom,
        questItemsCollected: state.questItemsCollected,
        survivors: state.survivors
      });

      if (victoryResult.isVictory) {
        addToLog(victoryResult.message);
        setGameOverType('victory');
        triggerAdvancedEffect('victory');
        setState(prev => ({ ...prev, phase: GamePhase.GAME_OVER }));
        return true;
      }

      // Check defeat conditions using new system
      const defeatResult = checkDefeatConditions(state.activeScenario, {
        players,
        doom,
        round: state.round,
        survivors: state.survivors
      });

      if (defeatResult.isDefeat) {
        addToLog(defeatResult.message);
        setGameOverType(defeatResult.condition?.type === 'doom_zero' ? 'defeat_doom' : 'defeat_death');
        triggerAdvancedEffect(defeatResult.condition?.type === 'doom_zero' ? 'doom-tick' : 'player-death');
        setState(prev => ({ ...prev, phase: GamePhase.GAME_OVER }));
        return true;
      }
    }

    // Fallback checks for when no scenario is active
    // Check if all players are dead
    const allPlayersDead = players.length > 0 && players.every(p => p.isDead);
    if (allPlayersDead) {
      addToLog("All investigators have fallen. The darkness claims victory.");
      setGameOverType('defeat_death');
      triggerAdvancedEffect('player-death');
      setState(prev => ({ ...prev, phase: GamePhase.GAME_OVER }));
      return true;
    }

    // Check if doom has reached 0
    if (doom <= 0) {
      addToLog("The doom counter has reached zero. The Old Ones stir...");
      setGameOverType('defeat_doom');
      triggerAdvancedEffect('doom-tick');
      setState(prev => ({ ...prev, phase: GamePhase.GAME_OVER }));
      return true;
    }

    return false;
  }, [state.activeScenario, state.enemies, state.board, state.round, state.questItemsCollected]);

  // Check victory conditions whenever scenario objectives are updated
  useEffect(() => {
    // Skip if no scenario, game is over, or still in setup
    if (!state.activeScenario || state.phase === GamePhase.GAME_OVER || state.phase === GamePhase.SETUP) {
      return;
    }

    const victoryResult = checkVictoryConditions(state.activeScenario, {
      players: state.players,
      enemies: state.enemies,
      board: state.board,
      round: state.round,
      doom: state.doom,
      questItemsCollected: state.questItemsCollected,
      survivors: state.survivors
    });

    if (victoryResult.isVictory) {
      addToLog(victoryResult.message);
      setGameOverType('victory');
      setState(prev => ({ ...prev, phase: GamePhase.GAME_OVER }));
    }
  }, [state.activeScenario, state.players, state.enemies, state.board, state.round, state.doom, state.questItemsCollected, state.survivors, state.phase]);

  // ============================================================================
  // LEGACY SYSTEM HANDLERS
  // ============================================================================

  // Handle creating a new legacy hero
  const handleCreateLegacyHero = useCallback((hero: LegacyHero) => {
    setLegacyData(prev => addHeroToArchive(prev, hero));
    addToLog(`New investigator created: ${hero.name}`);
  }, []);

  // Handle selecting a legacy hero for the mission
  const handleSelectLegacyHero = useCallback((hero: LegacyHero) => {
    if (selectedLegacyHeroIds.includes(hero.id)) {
      // Deselect
      setSelectedLegacyHeroIds(prev => prev.filter(id => id !== hero.id));
    } else {
      // Select (max 4)
      if (selectedLegacyHeroIds.length < 4) {
        setSelectedLegacyHeroIds(prev => [...prev, hero.id]);
      }
    }
  }, [selectedLegacyHeroIds]);

  // Handle updating a legacy hero (level up, equipment changes)
  const handleUpdateLegacyHero = useCallback((hero: LegacyHero) => {
    setLegacyData(prev => updateHero(prev, hero));
  }, []);

  // Convert selected legacy heroes to players and start game
  const handleStartGameWithLegacyHeroes = useCallback(() => {
    const selectedHeroes = selectedLegacyHeroIds
      .map(id => legacyData.heroes.find(h => h.id === id))
      .filter((h): h is LegacyHero => h !== undefined && !h.isDead);

    if (selectedHeroes.length === 0) return;

    // Check if any selected heroes are Occultists (they need spell selection)
    const occultistHeroes = selectedHeroes.filter(h => h.characterClass === 'occultist');

    if (occultistHeroes.length > 0) {
      // Convert non-occultist heroes to players first
      const nonOccultistPlayers: Player[] = selectedHeroes
        .filter(h => h.characterClass !== 'occultist')
        .map(hero => legacyHeroToPlayer(hero));

      // Initialize kill counts for all heroes
      const initialKillCounts: Record<string, number> = {};
      selectedHeroes.forEach(hero => {
        initialKillCounts[hero.id] = 0;
      });
      setHeroKillCounts(initialKillCounts);

      // Merge all selected heroes' previously encountered enemies for Field Guide
      const allEncounteredEnemies = selectedHeroes.flatMap(hero => hero.encounteredEnemies || []);
      const uniqueEncounteredEnemies = [...new Set(allEncounteredEnemies)];

      // Set non-occultist players to state
      setState(prev => ({
        ...prev,
        players: nonOccultistPlayers,
        encounteredEnemies: uniqueEncounteredEnemies
      }));

      // Start spell selection flow for occultists
      setPendingLegacyOccultists(occultistHeroes);
      setCurrentLegacyOccultistIndex(0);
      setShowSpellSelection(true);
      return;
    }

    // No occultists - proceed normally
    const players: Player[] = selectedHeroes.map(hero => legacyHeroToPlayer(hero));

    // Initialize kill counts tracking
    const initialKillCounts: Record<string, number> = {};
    selectedHeroes.forEach(hero => {
      initialKillCounts[hero.id] = 0;
    });
    setHeroKillCounts(initialKillCounts);

    // Merge all selected heroes' previously encountered enemies for Field Guide
    const allEncounteredEnemies = selectedHeroes.flatMap(hero => hero.encounteredEnemies || []);
    const uniqueEncounteredEnemies = [...new Set(allEncounteredEnemies)];

    setState(prev => ({
      ...prev,
      players,
      encounteredEnemies: uniqueEncounteredEnemies
    }));

    setMainMenuView('title');
  }, [selectedLegacyHeroIds, legacyData.heroes]);

  // Handle scenario completion (victory or defeat with survivors)
  const handleScenarioComplete = useCallback((victory: boolean) => {
    if (!state.activeScenario) return;

    const difficulty = state.activeScenario.difficulty;
    const completedBonusObjectives = state.activeScenario.objectives.filter(
      obj => obj.isOptional && obj.completed
    ).length;

    // Track heroes that need level-up selection or survivor trait selection
    const pendingLevelUps: { heroId: string; newLevel: number }[] = [];
    const pendingSurvivorTraits: string[] = [];

    // Calculate rewards
    const goldReward = calculateScenarioGoldReward(victory, difficulty, completedBonusObjectives);
    const xpReward = calculateScenarioXPReward(victory, difficulty, 0, completedBonusObjectives);

    // Build hero results
    const heroResults: HeroScenarioResult[] = state.players.map(player => {
      // Find the corresponding legacy hero using player.heroId or player.id
      // (player.id is now set to hero.id in legacyHeroToPlayer)
      const heroId = player.heroId || player.id;
      const legacyHero = legacyData.heroes.find(h => h.id === heroId);

      const survived = !player.isDead;
      const killCount = heroKillCounts[heroId] || 0;

      // Calculate individual rewards
      const individualGold = survived
        ? Math.floor((goldReward.base + goldReward.bonus) / state.players.filter(p => !p.isDead).length)
        : 0;
      const individualXP = survived
        ? xpReward.base + (killCount * 2) + (completedBonusObjectives > 0 ? xpReward.bonus : 0)
        : Math.floor(xpReward.base / 3); // Small XP even if died

      // Collect items found during scenario (from inventory)
      const itemsFound = getAllItems(player.inventory).filter(item =>
        item.id.startsWith('shop_') === false // Don't count shop items as "found"
      );

      return {
        heroId,  // Use the resolved heroId
        survived,
        xpEarned: individualXP,
        goldEarned: individualGold,
        killCount,
        insightEarned: player.insight,
        itemsFound: survived ? [] : itemsFound, // If died, items go to stash
        leveledUp: false,
        newLevel: undefined
      };
    });

    // Create scenario result
    const result: ScenarioResult = {
      scenarioId: state.activeScenario.id,
      victory,
      roundsPlayed: state.round,
      heroResults,
      totalGoldEarned: goldReward.base + goldReward.bonus,
      totalXPEarned: xpReward.base + xpReward.bonus + xpReward.kills
    };

    // Process completion and update legacy data
    let updatedLegacyData = { ...legacyData };

    // Update each hero in legacy data
    heroResults.forEach(heroResult => {
      const hero = updatedLegacyData.heroes.find(h => h.id === heroResult.heroId);
      if (!hero) return;

      if (!heroResult.survived) {
        // Permadeath
        updatedLegacyData = killHero(
          updatedLegacyData,
          hero.id,
          state.activeScenario!.id,
          'Fell during the investigation'
        );
      } else {
        // Apply rewards
        let updatedHero = { ...hero };
        updatedHero = addXPToHero(updatedHero, heroResult.xpEarned);
        updatedHero = addGoldToHero(updatedHero, heroResult.goldEarned);
        updatedHero.totalKills += heroResult.killCount;
        updatedHero.totalInsightEarned += heroResult.insightEarned;
        updatedHero.lastPlayed = new Date().toISOString();

        // Check for level up
        if (canLevelUp(updatedHero)) {
          heroResult.leveledUp = true;
          heroResult.newLevel = updatedHero.level + 1;
          // Add to level-up queue
          pendingLevelUps.push({ heroId: hero.id, newLevel: heroResult.newLevel });
        }

        // Update survivor streak for permadeath heroes
        if (hero.hasPermadeath) {
          updatedHero.scenariosSurvivedStreak = (updatedHero.scenariosSurvivedStreak || 0) + 1;

          // Check if they've reached a survivor trait milestone (3 or 6 scenarios)
          const streakMilestones = [3, 6];
          const chosenTraits = updatedHero.survivorTraits || [];
          const availableTraits = getAvailableSurvivorTraits(updatedHero.scenariosSurvivedStreak, chosenTraits);

          // If they just hit a milestone and have traits to choose
          if (streakMilestones.includes(updatedHero.scenariosSurvivedStreak) && availableTraits.length > 0) {
            pendingSurvivorTraits.push(hero.id);
          }
        }

        // Track scenario
        if (victory && !updatedHero.scenariosCompleted.includes(state.activeScenario!.id)) {
          updatedHero.scenariosCompleted.push(state.activeScenario!.id);
        } else if (!victory && !updatedHero.scenariosFailed.includes(state.activeScenario!.id)) {
          updatedHero.scenariosFailed.push(state.activeScenario!.id);
        }

        // Find corresponding player and update equipment
        const player = state.players.find(p => p.id === hero.characterClass);
        if (player) {
          updatedHero.equipment = { ...player.inventory, bag: [...player.inventory.bag] };
        }

        // Sync encountered enemies for Field Guide persistence
        // Merge the current session's encounters with the hero's lifetime encounters
        const existingEncountered = updatedHero.encounteredEnemies || [];
        const sessionEncountered = state.encounteredEnemies || [];
        const mergedEncountered = [...new Set([...existingEncountered, ...sessionEncountered])];
        updatedHero.encounteredEnemies = mergedEncountered;

        updatedLegacyData = updateHero(updatedLegacyData, updatedHero);
      }
    });

    // Update global stats
    updatedLegacyData.totalScenariosAttempted++;
    if (victory) {
      updatedLegacyData.totalScenariosCompleted++;
    }
    updatedLegacyData.totalGoldEarned += result.totalGoldEarned;

    setLegacyData(updatedLegacyData);
    saveLegacyData(updatedLegacyData);  // CRITICAL: Persist permadeath and scenario results to localStorage
    setLastScenarioResult(result);

    // Queue up level-up modals
    if (pendingLevelUps.length > 0) {
      setLevelUpQueue(pendingLevelUps);
      // Start with first hero in queue
      const firstLevelUp = pendingLevelUps[0];
      const heroToLevel = updatedLegacyData.heroes.find(h => h.id === firstLevelUp.heroId);
      if (heroToLevel) {
        setCurrentLevelUpHero(heroToLevel);
        setShowLevelUpModal(true);
      }
    }

    // Queue up survivor trait modals
    if (pendingSurvivorTraits.length > 0) {
      setSurvivorTraitQueue(pendingSurvivorTraits);
    }

    // Show merchant shop if there are survivors
    const survivors = heroResults.filter(r => r.survived);
    if (survivors.length > 0) {
      setShowMerchantShop(true);
    }
  }, [state.activeScenario, state.players, state.round, legacyData, selectedLegacyHeroIds, heroKillCounts]);

  // Track kills during gameplay
  const incrementHeroKills = useCallback((heroId: string) => {
    setHeroKillCounts(prev => ({
      ...prev,
      [heroId]: (prev[heroId] || 0) + 1
    }));
  }, []);

  // Handle level-up bonus selection
  const handleLevelUpBonusSelect = useCallback((bonus: LevelUpBonus) => {
    if (!currentLevelUpHero) return;

    // Apply the bonus to the hero
    const updatedHero = applyLevelUpBonus(currentLevelUpHero, bonus);
    // Also increment the level
    updatedHero.level = (currentLevelUpHero.level || 1) + 1;

    // Update legacy data
    const updatedLegacyData = updateHero(legacyData, updatedHero);
    setLegacyData(updatedLegacyData);
    saveLegacyData(updatedLegacyData);

    // Move to next hero in queue or close modal
    const remainingQueue = levelUpQueue.slice(1);
    if (remainingQueue.length > 0) {
      setLevelUpQueue(remainingQueue);
      const nextLevelUp = remainingQueue[0];
      const nextHero = updatedLegacyData.heroes.find(h => h.id === nextLevelUp.heroId);
      if (nextHero) {
        setCurrentLevelUpHero(nextHero);
      } else {
        setShowLevelUpModal(false);
        setCurrentLevelUpHero(null);
      }
    } else {
      setShowLevelUpModal(false);
      setCurrentLevelUpHero(null);
      setLevelUpQueue([]);

      // After all level-ups are done, check if we need survivor trait selection
      if (survivorTraitQueue.length > 0) {
        const firstHeroId = survivorTraitQueue[0];
        const hero = updatedLegacyData.heroes.find(h => h.id === firstHeroId);
        if (hero) {
          setCurrentSurvivorHero(hero);
          setShowSurvivorTraitModal(true);
        }
      }
    }

    addToLog(`${updatedHero.name} reached Level ${updatedHero.level}!`);
  }, [currentLevelUpHero, legacyData, levelUpQueue, survivorTraitQueue, addToLog]);

  // Handle survivor trait selection
  const handleSurvivorTraitSelect = useCallback((trait: SurvivorTrait) => {
    if (!currentSurvivorHero) return;

    // Apply the trait to the hero
    const updatedHero: LegacyHero = {
      ...currentSurvivorHero,
      survivorTraits: [...(currentSurvivorHero.survivorTraits || []), trait.id]
    };

    // Apply trait effects
    if (trait.effect.type === 'bonus_hp') {
      updatedHero.maxHp = (updatedHero.maxHp || 6) + trait.effect.value;
      if (trait.effect.sanityCost) {
        updatedHero.maxSanity = Math.max(1, (updatedHero.maxSanity || 6) - trait.effect.sanityCost);
      }
    } else if (trait.effect.type === 'bonus_attack_die') {
      updatedHero.bonusAttackDice = (updatedHero.bonusAttackDice || 0) + trait.effect.value;
    }

    // Update legacy data
    const updatedLegacyData = updateHero(legacyData, updatedHero);
    setLegacyData(updatedLegacyData);
    saveLegacyData(updatedLegacyData);

    // Move to next hero or close modal
    const remainingQueue = survivorTraitQueue.slice(1);
    if (remainingQueue.length > 0) {
      setSurvivorTraitQueue(remainingQueue);
      const nextHeroId = remainingQueue[0];
      const nextHero = updatedLegacyData.heroes.find(h => h.id === nextHeroId);
      if (nextHero) {
        setCurrentSurvivorHero(nextHero);
      } else {
        setShowSurvivorTraitModal(false);
        setCurrentSurvivorHero(null);
      }
    } else {
      setShowSurvivorTraitModal(false);
      setCurrentSurvivorHero(null);
      setSurvivorTraitQueue([]);
    }

    addToLog(`${updatedHero.name} gained the "${trait.name}" survivor trait!`);
  }, [currentSurvivorHero, legacyData, survivorTraitQueue, addToLog]);

  // Skip survivor trait selection (can choose later)
  const handleSkipSurvivorTrait = useCallback(() => {
    const remainingQueue = survivorTraitQueue.slice(1);
    if (remainingQueue.length > 0) {
      setSurvivorTraitQueue(remainingQueue);
      const nextHeroId = remainingQueue[0];
      const nextHero = legacyData.heroes.find(h => h.id === nextHeroId);
      if (nextHero) {
        setCurrentSurvivorHero(nextHero);
      } else {
        setShowSurvivorTraitModal(false);
        setCurrentSurvivorHero(null);
      }
    } else {
      setShowSurvivorTraitModal(false);
      setCurrentSurvivorHero(null);
      setSurvivorTraitQueue([]);
    }
  }, [survivorTraitQueue, legacyData.heroes]);

  // ============================================================================
  // INVENTORY MANAGEMENT HANDLERS
  // ============================================================================

  // Handle using a consumable item (healing, etc.)
  const handleUseItem = useCallback((item: Item, slotName: InventorySlotName) => {
    const activePlayer = state.players[state.activePlayerIndex];
    if (!activePlayer || state.phase !== GamePhase.INVESTIGATOR) return;

    // Handle occult texts/relics that grant insight but cost sanity
    const isOccultText = item.type === 'relic' &&
      (item.effect.toLowerCase().includes('insight') ||
       item.name.toLowerCase().includes('necronomicon') ||
       item.name.toLowerCase().includes('tome'));

    if (isOccultText) {
      const insightGain = item.bonus || 3;
      const sanityCost = 1;

      // Professor is immune to sanity loss from reading occult texts
      const isProfessor = activePlayer.id === 'professor' || activePlayer.specialAbility === 'occult_immunity';
      const actualSanityCost = isProfessor ? 0 : sanityCost;

      if (isProfessor) {
        addToLog(`${activePlayer.name} reads ${item.name} with scholarly detachment. +${insightGain} Insight (no sanity loss - Professor ability).`);
      } else {
        addToLog(`${activePlayer.name} reads ${item.name}. The forbidden knowledge burns into your mind. +${insightGain} Insight, -${sanityCost} Sanity.`);
        addFloatingText(activePlayer.position.q, activePlayer.position.r, `-${sanityCost} SAN`, "text-sanity");
      }
      addFloatingText(activePlayer.position.q, activePlayer.position.r, `+${insightGain} INSIGHT`, "text-purple-400");

      setState(prev => ({
        ...prev,
        players: prev.players.map((p, i) => {
          if (i !== prev.activePlayerIndex) return p;
          const newSanity = Math.max(0, p.sanity - actualSanityCost);
          return checkMadness({
            ...p,
            insight: p.insight + insightGain,
            sanity: newSanity,
            actions: p.actions - 1
          });
        })
      }));
      return;
    }

    // Only consumables can be used directly (for non-occult items)
    if (item.type !== 'consumable') {
      addToLog(`${item.name} cannot be used directly.`);
      return;
    }

    // Check if item has uses remaining
    if (item.uses !== undefined && item.uses <= 0) {
      addToLog(`${item.name} is depleted.`);
      return;
    }

    // Apply item effect
    let hpHealed = 0;
    let sanityHealed = 0;
    let message = '';

    // Parse effect - look for HP or Sanity healing
    if (item.effect.toLowerCase().includes('hp') || item.effect.toLowerCase().includes('health')) {
      hpHealed = item.bonus || 1;
    }
    if (item.effect.toLowerCase().includes('sanity') || item.effect.toLowerCase().includes('san')) {
      sanityHealed = item.bonus || 1;
    }

    // Apply healing
    const newHp = Math.min(activePlayer.maxHp, activePlayer.hp + hpHealed);
    const newSanity = Math.min(activePlayer.maxSanity, activePlayer.sanity + sanityHealed);

    // Build message
    const effects: string[] = [];
    if (hpHealed > 0) effects.push(`+${newHp - activePlayer.hp} HP`);
    if (sanityHealed > 0) effects.push(`+${newSanity - activePlayer.sanity} Sanity`);
    message = `${activePlayer.name} uses ${item.name}. ${effects.join(', ')}.`;

    addToLog(message);
    if (hpHealed > 0) {
      addFloatingText(activePlayer.position.q, activePlayer.position.r, `+${newHp - activePlayer.hp} HP`, "text-health");
    }
    if (sanityHealed > 0) {
      addFloatingText(activePlayer.position.q, activePlayer.position.r, `+${newSanity - activePlayer.sanity} SAN`, "text-sanity");
    }

    // Update player state and decrement item uses
    setState(prev => ({
      ...prev,
      players: prev.players.map((p, i) => {
        if (i !== prev.activePlayerIndex) return p;

        // Create updated inventory
        const newInventory = { ...p.inventory, bag: [...p.inventory.bag] };

        // Find and update/remove the item
        const updateItemInSlot = (currentItem: Item | null): Item | null => {
          if (!currentItem || currentItem.id !== item.id) return currentItem;

          // Decrement uses
          if (currentItem.uses !== undefined) {
            const newUses = currentItem.uses - 1;
            if (newUses <= 0) {
              return null; // Remove depleted item
            }
            return { ...currentItem, uses: newUses };
          }
          return null; // Single-use item without uses count
        };

        // Update the correct slot
        switch (slotName) {
          case 'leftHand':
            newInventory.leftHand = updateItemInSlot(newInventory.leftHand);
            break;
          case 'rightHand':
            newInventory.rightHand = updateItemInSlot(newInventory.rightHand);
            break;
          case 'body':
            newInventory.body = updateItemInSlot(newInventory.body);
            break;
          case 'bag1':
            newInventory.bag[0] = updateItemInSlot(newInventory.bag[0]);
            break;
          case 'bag2':
            newInventory.bag[1] = updateItemInSlot(newInventory.bag[1]);
            break;
          case 'bag3':
            newInventory.bag[2] = updateItemInSlot(newInventory.bag[2]);
            break;
          case 'bag4':
            newInventory.bag[3] = updateItemInSlot(newInventory.bag[3]);
            break;
        }

        return {
          ...p,
          hp: newHp,
          sanity: newSanity,
          inventory: newInventory
        };
      })
    }));
  }, [state.players, state.activePlayerIndex, state.phase]);

  // Handle unequipping an item from hand/body to bag
  const handleUnequipItem = useCallback((slotName: InventorySlotName) => {
    const activePlayer = state.players[state.activePlayerIndex];
    if (!activePlayer) return;

    // Get the item from the slot
    let item: Item | null = null;
    switch (slotName) {
      case 'leftHand':
        item = activePlayer.inventory.leftHand;
        break;
      case 'rightHand':
        item = activePlayer.inventory.rightHand;
        break;
      case 'body':
        item = activePlayer.inventory.body;
        break;
      default:
        return; // Can't unequip from bag
    }

    if (!item) return;

    // Find an empty bag slot
    const emptyBagIndex = activePlayer.inventory.bag.findIndex(slot => slot === null);
    if (emptyBagIndex === -1) {
      addToLog(`Cannot unequip ${item.name} - bag is full!`);
      return;
    }

    addToLog(`${activePlayer.name} unequips ${item.name}.`);

    setState(prev => ({
      ...prev,
      players: prev.players.map((p, i) => {
        if (i !== prev.activePlayerIndex) return p;

        const newInventory = { ...p.inventory, bag: [...p.inventory.bag] };

        // Move item to bag
        newInventory.bag[emptyBagIndex] = item;

        // Clear the source slot
        switch (slotName) {
          case 'leftHand':
            newInventory.leftHand = null;
            break;
          case 'rightHand':
            newInventory.rightHand = null;
            break;
          case 'body':
            newInventory.body = null;
            break;
        }

        return { ...p, inventory: newInventory };
      })
    }));
  }, [state.players, state.activePlayerIndex]);

  // Handle equipping an item from bag to hand slot
  const handleEquipFromBag = useCallback((bagIndex: number, targetSlot: 'leftHand' | 'rightHand') => {
    const activePlayer = state.players[state.activePlayerIndex];
    if (!activePlayer) return;

    const item = activePlayer.inventory.bag[bagIndex];
    if (!item) return;

    // Check if target slot is empty
    const targetItem = targetSlot === 'leftHand' ? activePlayer.inventory.leftHand : activePlayer.inventory.rightHand;
    if (targetItem) {
      addToLog(`${targetSlot === 'leftHand' ? 'Left hand' : 'Right hand'} is already occupied!`);
      return;
    }

    // Check if item can be equipped to hand (weapon or tool)
    if (item.type !== 'weapon' && item.type !== 'tool') {
      addToLog(`${item.name} cannot be equipped to hands.`);
      return;
    }

    addToLog(`${activePlayer.name} equips ${item.name} to ${targetSlot === 'leftHand' ? 'left hand' : 'right hand'}.`);

    setState(prev => ({
      ...prev,
      players: prev.players.map((p, i) => {
        if (i !== prev.activePlayerIndex) return p;

        const newInventory = { ...p.inventory, bag: [...p.inventory.bag] };

        // Move item to hand
        if (targetSlot === 'leftHand') {
          newInventory.leftHand = item;
        } else {
          newInventory.rightHand = item;
        }

        // Clear bag slot
        newInventory.bag[bagIndex] = null;

        return { ...p, inventory: newInventory };
      })
    }));
  }, [state.players, state.activePlayerIndex]);

  // Handle dropping an item
  const handleDropItem = useCallback((slotName: InventorySlotName) => {
    const activePlayer = state.players[state.activePlayerIndex];
    if (!activePlayer) return;

    // Get the item name for logging
    let itemName = 'item';
    switch (slotName) {
      case 'leftHand':
        itemName = activePlayer.inventory.leftHand?.name || 'item';
        break;
      case 'rightHand':
        itemName = activePlayer.inventory.rightHand?.name || 'item';
        break;
      case 'body':
        itemName = activePlayer.inventory.body?.name || 'item';
        break;
      case 'bag1':
        itemName = activePlayer.inventory.bag[0]?.name || 'item';
        break;
      case 'bag2':
        itemName = activePlayer.inventory.bag[1]?.name || 'item';
        break;
      case 'bag3':
        itemName = activePlayer.inventory.bag[2]?.name || 'item';
        break;
      case 'bag4':
        itemName = activePlayer.inventory.bag[3]?.name || 'item';
        break;
    }

    addToLog(`${activePlayer.name} drops ${itemName}.`);

    setState(prev => ({
      ...prev,
      players: prev.players.map((p, i) => {
        if (i !== prev.activePlayerIndex) return p;

        const newInventory = { ...p.inventory, bag: [...p.inventory.bag] };

        // Clear the slot
        switch (slotName) {
          case 'leftHand':
            newInventory.leftHand = null;
            break;
          case 'rightHand':
            newInventory.rightHand = null;
            break;
          case 'body':
            newInventory.body = null;
            break;
          case 'bag1':
            newInventory.bag[0] = null;
            break;
          case 'bag2':
            newInventory.bag[1] = null;
            break;
          case 'bag3':
            newInventory.bag[2] = null;
            break;
          case 'bag4':
            newInventory.bag[3] = null;
            break;
        }

        return { ...p, inventory: newInventory };
      })
    }));
  }, [state.players, state.activePlayerIndex]);

  // Handle finishing merchant shop
  const handleMerchantFinish = useCallback(() => {
    setShowMerchantShop(false);
    setLastScenarioResult(null);
    setSelectedLegacyHeroIds([]);
    setHeroKillCounts({});
    setState(DEFAULT_STATE);
    setIsMainMenuOpen(true);
    setMainMenuView('title');
  }, []);

  // Handle showing context actions for a tile/obstacle
  const showContextActions = useCallback((tile: Tile, edgeIndex?: number) => {
    const activePlayer = state.players[state.activePlayerIndex];
    if (!activePlayer) return;

    let target: ContextActionTarget;
    let actions: ContextAction[];

    if (edgeIndex !== undefined && tile.edges[edgeIndex]) {
      // Edge/door interaction
      target = {
        type: 'edge',
        tileId: tile.id,
        edgeIndex,
        edge: tile.edges[edgeIndex]
      };
      actions = getDoorActions(activePlayer, tile.edges[edgeIndex], tile);
    } else if (tile.obstacle) {
      // Obstacle interaction
      target = {
        type: 'obstacle',
        tileId: tile.id,
        obstacle: tile.obstacle
      };
      actions = getObstacleActions(activePlayer, tile.obstacle, tile);
    } else if (tile.object) {
      // Object interaction
      target = {
        type: 'object',
        tileId: tile.id,
        object: tile.object
      };
      actions = getContextActions(activePlayer, target, tile);
    } else {
      // General tile interaction
      target = {
        type: 'tile',
        tileId: tile.id
      };
      actions = getContextActions(activePlayer, target, tile);
    }

    setActiveContextTarget(target);
    setContextActions(actions);
  }, [state.players, state.activePlayerIndex]);

  // Handle executing a context action
  const handleContextAction = useCallback((action: ContextAction) => {
    const activePlayer = state.players[state.activePlayerIndex];
    if (!activePlayer || !activeContextTarget) return;

    // Cancel action
    if (action.id === 'cancel') {
      setActiveContextTarget(null);
      setContextActions([]);
      return;
    }

    // Check AP cost
    if (activePlayer.actions < action.apCost) {
      addToLog(`Not enough actions for ${action.label}`);
      return;
    }

    // Special handling for puzzle doors - opens PuzzleModal instead of normal flow
    if (action.id === 'solve_puzzle') {
      addToLog('You examine the puzzle mechanism...');
      const tile = state.board.find(t => t.id === activeContextTarget.tileId);
      const edge = tile?.edges[activeContextTarget.edgeIndex ?? 0];
      const puzzleDifficulty = edge?.lockType === 'complex' ? 5 :
                               edge?.lockType === 'quality' ? 4 : 3;
      // Use puzzle type from edge, or pick a random type if not specified
      const puzzleTypes: import('./types').PuzzleType[] = ['sequence', 'code_lock', 'symbol_match', 'pressure_plate', 'astronomy', 'mirror_light'];
      const puzzleType = edge?.puzzleType || puzzleTypes[Math.floor(Math.random() * puzzleTypes.length)];
      setState(prev => ({
        ...prev,
        activePuzzle: {
          type: puzzleType,
          difficulty: puzzleDifficulty,
          targetTileId: activeContextTarget.tileId
        },
        players: prev.players.map((p, i) =>
          i === prev.activePlayerIndex ? { ...p, actions: p.actions - action.apCost } : p
        )
      }));
      // Don't close context menu yet - puzzle modal will handle it
      return;
    }

    // Perform skill check if required
    if (action.skillCheck) {
      // Calculate weather penalty for agility checks
      let bonusDice = action.skillCheck.bonusDice || 0;
      if (action.skillCheck.skill === 'agility' && state.weatherState.global) {
        const weatherPenalty = calculateWeatherAgilityPenalty(state.weatherState.global);
        if (weatherPenalty > 0) {
          bonusDice -= weatherPenalty;
          const weatherEffect = getWeatherEffect(state.weatherState.global.type);
          addToLog(`${weatherEffect.name} gjør det vanskeligere (-${weatherPenalty} terning)`);
        }
      }

      const result = performSkillCheck(
        activePlayer,
        action.skillCheck.skill,
        action.skillCheck.dc,
        bonusDice
      );

      setState(prev => ({ ...prev, lastDiceRoll: result.dice }));

      if (result.passed) {
        addToLog(action.successMessage || `${action.label} succeeded!`);
        addFloatingText(activePlayer.position.q, activePlayer.position.r, "SUCCESS!", "text-accent");

        // Handle success consequences
        if (action.consequences?.success) {
          handleContextConsequence(action.consequences.success, activePlayer);
        }

        // Handle specific actions
        handleContextActionEffect(action, true);
      } else {
        addToLog(action.failureMessage || `${action.label} failed.`);
        addFloatingText(activePlayer.position.q, activePlayer.position.r, "FAILED", "text-primary");

        // Handle failure consequences
        if (action.consequences?.failure) {
          handleContextConsequence(action.consequences.failure, activePlayer);
        }
      }

      // Deduct AP
      setState(prev => ({
        ...prev,
        players: prev.players.map((p, i) =>
          i === prev.activePlayerIndex ? { ...p, actions: p.actions - action.apCost } : p
        )
      }));
    } else {
      // No skill check needed - automatic success
      addToLog(action.successMessage || `${action.label} completed.`);

      // Handle success consequences (some actions have consequences even without skill check)
      if (action.consequences?.success) {
        handleContextConsequence(action.consequences.success, activePlayer);
      }

      handleContextActionEffect(action, true);

      // Deduct AP
      if (action.apCost > 0) {
        setState(prev => ({
          ...prev,
          players: prev.players.map((p, i) =>
            i === prev.activePlayerIndex ? { ...p, actions: p.actions - action.apCost } : p
          )
        }));
      }
    }

    // Close context menu
    setActiveContextTarget(null);
    setContextActions([]);
  }, [state.players, state.activePlayerIndex, activeContextTarget]);

  // Handle context action consequences (damage, sanity loss, etc.)
  const handleContextConsequence = useCallback((
    consequence: { type: string; value?: number; message?: string },
    player: Player
  ) => {
    switch (consequence.type) {
      case 'take_damage':
        const dmgValue = consequence.value || 1;
        setState(prev => ({
          ...prev,
          players: prev.players.map((p, i) =>
            i === prev.activePlayerIndex ? {
              ...p,
              hp: Math.max(0, p.hp - dmgValue),
              isDead: p.hp - dmgValue <= 0
            } : p
          )
        }));
        addFloatingText(player.position.q, player.position.r, `-${dmgValue} HP`, "text-health");
        if (consequence.message) addToLog(consequence.message);
        break;

      case 'lose_sanity':
        const sanValue = consequence.value || 1;
        setState(prev => ({
          ...prev,
          players: prev.players.map((p, i) =>
            i === prev.activePlayerIndex ? checkMadness({
              ...p,
              sanity: Math.max(0, p.sanity - sanValue)
            }) : p
          )
        }));
        addFloatingText(player.position.q, player.position.r, `-${sanValue} SAN`, "text-sanity");
        if (consequence.message) addToLog(consequence.message);
        break;

      case 'trigger_alarm':
        addToLog(consequence.message || "An alarm is triggered!");
        // Could spawn enemies here
        break;

      case 'remove_obstacle':
        if (activeContextTarget?.tileId) {
          setState(prev => ({
            ...prev,
            board: prev.board.map(t =>
              t.id === activeContextTarget.tileId ? { ...t, obstacle: undefined } : t
            )
          }));
        }
        break;

    }
  }, [activeContextTarget]);

  // Spawn enemy helper - must be defined before functions that use it
  // UPDATED: Now includes doom modification based on scenario config (pressure-based doom)
  const spawnEnemy = useCallback((type: EnemyType, q: number, r: number, applyDoomPenalty: boolean = true) => {
    const bestiary = BESTIARY[type];
    if (!bestiary) return;

    const newEnemy: Enemy = {
      id: `enemy-${Date.now()}-${Math.random()}`,
      name: bestiary.name,
      type: type,
      hp: bestiary.hp,
      maxHp: bestiary.hp,
      damage: bestiary.damage,
      horror: bestiary.horror,
      speed: 1,
      position: { q, r },
      visionRange: 3,
      attackRange: 1,
      attackType: 'melee',
      traits: bestiary.traits
    };

    setState(prev => {
      // Calculate doom penalty for monster spawn (pressure-based doom system)
      let doomPenalty = 0;
      if (applyDoomPenalty) {
        // Use scenario config or default to -1 per spawn
        doomPenalty = prev.activeScenario?.doomOnMonsterSpawn ?? -1;
      }
      const newDoom = Math.max(0, prev.doom + doomPenalty);

      return {
        ...prev,
        enemies: [...prev.enemies, newEnemy],
        doom: newDoom
      };
    });
    playSound('enemySpawn');
    addToLog(`A ${bestiary.name} emerges from the shadows!`);

    // Emit spawn particle effect - eldritch portal manifestation
    emitSpellEffect(q, r, 'banish'); // Uses implode animation reversed visually
  }, []);

  /**
   * LOGICAL TILE CONNECTION SYSTEM
   * Uses template-based tile generation with edge compatibility matching.
   * Each tile template has predefined edges (WALL, DOOR, OPEN, etc.) that
   * must match with neighboring tiles - like puzzle pieces.
   */
  const spawnRoom = useCallback((startQ: number, startR: number, tileSet: 'indoor' | 'outdoor' | 'mixed') => {
    const roomId = `room-${Date.now()}`;

    // Build a map of existing tiles for quick lookup
    const boardMap = new Map<string, Tile>();
    state.board.forEach(t => boardMap.set(`${t.q},${t.r}`, t));

    // Check if position already has a tile
    if (boardMap.has(`${startQ},${startR}`)) {
      return;
    }

    // Find the tile we're coming from (source tile)
    const adjacentTiles = state.board.filter(t => hexDistance({ q: t.q, r: t.r }, { q: startQ, r: startR }) === 1);
    const sourceTile = adjacentTiles[0];
    const sourceCategory = sourceTile?.category || (tileSet === 'indoor' ? 'foyer' : 'street');

    // Gather edge constraints from all neighbors
    const constraints = gatherConstraints(boardMap, startQ, startR);

    // Get neighboring tiles for affinity calculations
    const neighborTiles = getNeighborTiles(boardMap, startQ, startR);

    // Find all valid templates that match the constraints (with affinity support)
    const validMatches = findValidTemplates(constraints, sourceCategory as TileCategory, neighborTiles);

    // Filter by tile set preference using helper
    const filteredByTileSet = validMatches.filter(match =>
      categoryMatchesTileSet(match.template.category as TileCategory, tileSet)
    );

    // Apply theme-based tile preferences from scenario
    // This ensures tiles match the quest context (e.g. manor quests get indoor tiles, not sewers)
    const scenarioTheme = state.activeScenario?.theme;
    const themePreferences = scenarioTheme ? getThemedTilePreferences(scenarioTheme) : null;

    let filteredMatches = filteredByTileSet;
    if (themePreferences) {
      // Score and filter tiles based on theme preferences
      filteredMatches = filteredByTileSet.map(match => {
        const tileName = match.template.name.toLowerCase();
        const tileId = match.template.id.toLowerCase();

        // Check if tile matches preferred names (bonus)
        const isPreferred = themePreferences.preferredNames.some(
          pref => tileName.includes(pref) || tileId.includes(pref)
        );

        // Check if tile should be avoided (penalty)
        const isAvoided = themePreferences.avoidNames.some(
          avoid => tileName.includes(avoid) || tileId.includes(avoid)
        );

        // Adjust match score based on theme
        let adjustedScore = match.matchScore;
        if (isPreferred) {
          adjustedScore *= 2.5;  // Strong bonus for preferred tiles
        }
        if (isAvoided) {
          adjustedScore *= 0.1;  // Heavy penalty for avoided tiles
        }

        return { ...match, matchScore: Math.round(adjustedScore) };
      }).filter(match => {
        // Filter out heavily penalized tiles if we have alternatives
        const tileName = match.template.name.toLowerCase();
        const tileId = match.template.id.toLowerCase();
        const isAvoided = themePreferences.avoidNames.some(
          avoid => tileName.includes(avoid) || tileId.includes(avoid)
        );
        // Only filter out avoided tiles if we have non-avoided alternatives
        return !isAvoided || filteredByTileSet.length <= 3;
      });
    }

    // Use filtered if available, otherwise fall back to all valid
    const matchesToUse = filteredMatches.length > 0 ? filteredMatches : validMatches;

    if (matchesToUse.length === 0) {
      // Fallback: Use legacy system if no templates match
      console.warn(`No valid templates for (${startQ},${startR}), using fallback`);

      // Use consolidated fallback helper to reduce code duplication
      const fallbackResult = createFallbackSpawnResult({
        startQ,
        startR,
        sourceCategory: sourceCategory as TileCategory,
        tileSet,
        roomId,
        boardMap,
        locationDescriptions: LOCATION_DESCRIPTIONS,
        selectCategoryFn: selectRandomConnectableCategory
      });

      // Synchronize edges with neighboring tiles using functional setState
      setState(prev => {
        const prevBoardMap = boardArrayToMap(prev.board);
        const syncBoardMap = synchronizeEdgesWithNeighbors(fallbackResult.tile, prevBoardMap);
        const syncBoard = boardMapToArray(syncBoardMap);
        return { ...prev, board: syncBoard };
      });

      // Log all messages from the fallback result
      fallbackResult.logMessages.forEach(msg => addToLog(msg));

      return;
    }

    // Select a template using weighted random selection
    const selected = selectWeightedTemplate(matchesToUse);
    if (!selected) {
      // Fallback: Create a basic tile if template selection fails (should never happen, but safety net)
      console.warn(`Template selection failed for (${startQ},${startR}), using fallback`);

      // Use consolidated fallback helper to reduce code duplication
      const fallbackResult = createFallbackSpawnResult({
        startQ,
        startR,
        sourceCategory: sourceCategory as TileCategory,
        tileSet,
        roomId,
        boardMap,
        locationDescriptions: LOCATION_DESCRIPTIONS,
        selectCategoryFn: selectRandomConnectableCategory
      });

      // Synchronize edges with neighboring tiles using functional setState
      setState(prev => {
        const prevBoardMap = boardArrayToMap(prev.board);
        const syncBoardMap = synchronizeEdgesWithNeighbors(fallbackResult.tile, prevBoardMap);
        const syncBoard = boardMapToArray(syncBoardMap);
        return { ...prev, board: syncBoard };
      });

      // Log all messages from the fallback result
      fallbackResult.logMessages.forEach(msg => addToLog(msg));

      return;
    }

    // Check if we should spawn a room cluster instead of single tile
    // (30% chance when entering a building from facade or entering from street)
    const shouldSpawnCluster =
      (sourceCategory === 'facade' || sourceCategory === 'street') &&
      ['foyer', 'facade'].includes(selected.template.category) &&
      Math.random() < 0.3;

    if (shouldSpawnCluster) {
      // Try to spawn a room cluster
      const clusters = getClustersForCategory(selected.template.category);
      if (clusters.length > 0) {
        const cluster = clusters[Math.floor(Math.random() * clusters.length)];
        const clusterTiles = instantiateRoomCluster(cluster, startQ, startR, boardMap);

        if (clusterTiles.length > 0) {
          // Synchronize edges for each cluster tile using functional setState to avoid stale closure
          setState(prev => {
            let clusterBoardMap = boardArrayToMap(prev.board);
            for (const clusterTile of clusterTiles) {
              clusterBoardMap = synchronizeEdgesWithNeighbors(clusterTile, clusterBoardMap);
            }
            const syncClusterBoard = boardMapToArray(clusterBoardMap);
            return { ...prev, board: syncClusterBoard };
          });
          addToLog(`UTFORSKET: ${cluster.name}. [BUILDING]`);
          addToLog(cluster.description);

          // Spawn enemies in cluster
          const firstTile = clusterTiles[0];
          if (shouldSpawnMonster(firstTile, state.doom, state.enemies, true)) {
            const enemyType = selectRandomEnemy(firstTile.category, state.doom);
            if (enemyType) {
              const spawnPos = calculateEnemySpawnPosition(startQ, startR);
              spawnEnemy(enemyType, spawnPos.q, spawnPos.r);
            }
          }

          return;
        }
      }
    }

    // Create single tile from selected template
    const newTile = createTileFromTemplate(selected.template, startQ, startR, selected.rotation);
    newTile.roomId = roomId;
    newTile.visibility = 'visible';
    newTile.explored = true;

    const newTiles: Tile[] = [newTile];

    // Check for quest item/tile spawning on new tile
    let updatedObjectiveSpawnState = state.objectiveSpawnState;
    let finalTile = newTile;

    if (state.objectiveSpawnState && state.activeScenario) {
      const completedObjectiveIds = state.activeScenario.objectives
        .filter(o => o.completed)
        .map(o => o.id);

      const exploreResult = onTileExplored(
        state.objectiveSpawnState,
        newTile,
        state.activeScenario,
        completedObjectiveIds
      );

      updatedObjectiveSpawnState = exploreResult.updatedState;

      // If a quest item spawned, add it to the tile
      if (exploreResult.spawnedItem) {
        const questItem: Item = {
          id: exploreResult.spawnedItem.id,
          name: exploreResult.spawnedItem.name,
          description: exploreResult.spawnedItem.description,
          type: 'quest_item',
          category: 'special',
          isQuestItem: true,
          questItemType: exploreResult.spawnedItem.type,
          objectiveId: exploreResult.spawnedItem.objectiveId,
        };
        finalTile = {
          ...finalTile,
          items: [...(finalTile.items || []), questItem],
          hasQuestItem: true,
        };
        addToLog(`📦 Noe viktig er gjemt i ${newTile.name}... Søk nøye!`);
      }

      // If a quest tile spawned, modify the tile
      if (exploreResult.spawnedQuestTile && exploreResult.tileModifications) {
        finalTile = { ...finalTile, ...exploreResult.tileModifications };
        addToLog(`⭐ VIKTIG LOKASJON: ${exploreResult.spawnedQuestTile.name} funnet!`);
      }
    }

    // Synchronize edges with neighboring tiles (fixes window/door linking)
    // Use functional setState to avoid stale closure bug where tiles could be lost
    setState(prev => {
      const currentBoardMap = boardArrayToMap(prev.board);
      const synchronizedBoardMap = synchronizeEdgesWithNeighbors(finalTile, currentBoardMap);
      const synchronizedBoard = boardMapToArray(synchronizedBoardMap);
      return {
        ...prev,
        board: synchronizedBoard,
        objectiveSpawnState: updatedObjectiveSpawnState
      };
    });
    addToLog(`UTFORSKET: ${finalTile.name}. [${finalTile.category?.toUpperCase() || 'UNKNOWN'}]`);

    // Show atmospheric description from template or location descriptions
    if (selected.template.description) {
      addToLog(selected.template.description);
    } else {
      const locationDescription = LOCATION_DESCRIPTIONS[finalTile.name];
      if (locationDescription) {
        addToLog(locationDescription);
      }
    }

    // Check explore objectives
    if (state.activeScenario) {
      const exploreCheck = checkExploreObjectives(state.activeScenario, finalTile.name, finalTile.id);
      if (exploreCheck.objective) {
        const updatedScenario = exploreCheck.shouldComplete
          ? completeObjective(state.activeScenario, exploreCheck.objective.id)
          : updateObjectiveProgress(state.activeScenario, exploreCheck.objective.id, 1);

        setState(prev => ({ ...prev, activeScenario: updatedScenario }));

        if (exploreCheck.shouldComplete) {
          addToLog(`OBJECTIVE COMPLETE: ${exploreCheck.objective.shortDescription}`);

          // DOOM BONUS: Completing objectives pushes back the darkness (pressure-based doom)
          const doomBonus = state.activeScenario?.doomOnObjectiveComplete ?? 1;
          if (doomBonus > 0) {
            addToLog(`Your progress weakens the darkness! (+${doomBonus} doom)`);
            setState(prev => ({
              ...prev,
              doom: Math.min(prev.activeScenario?.startDoom || 15, prev.doom + doomBonus)
            }));
          }
        }
      }
    }

    // Spawn enemies based on template settings
    const template = selected.template;
    const shouldSpawn = template.enemySpawnChance
      ? Math.random() * 100 < template.enemySpawnChance
      : shouldSpawnMonster(newTile, state.doom, state.enemies, true);

    if (shouldSpawn) {
      const possibleEnemies = template.possibleEnemies;
      const enemyType = possibleEnemies && possibleEnemies.length > 0
        ? possibleEnemies[Math.floor(Math.random() * possibleEnemies.length)] as EnemyType
        : selectRandomEnemy(newTile.category, state.doom);

      if (enemyType) {
        const spawnPos = calculateEnemySpawnPosition(startQ, startR);
        spawnEnemy(enemyType, spawnPos.q, spawnPos.r);
      }
    }
  }, [state.board, state.doom, state.enemies, state.activeScenario, state.objectiveSpawnState, spawnEnemy]);

  // Handle specific action effects (opening doors, etc.)
  // REFACTORED: Now uses processActionEffect from contextActionEffects.ts
  // Original 470-line switch statement extracted into modular, testable functions
  const handleContextActionEffect = useCallback((action: ContextAction, success: boolean) => {
    if (!activeContextTarget || !success) return;

    const tile = state.board.find(t => t.id === activeContextTarget.tileId);
    if (!tile) return;

    // Build context for effect processing
    const ctx: ActionEffectContext = {
      tileId: activeContextTarget.tileId,
      edgeIndex: activeContextTarget.edgeIndex,
      board: state.board,
      players: state.players,
      activePlayerIndex: state.activePlayerIndex,
      activeScenario: state.activeScenario,
      objectiveSpawnState: state.objectiveSpawnState,
      questItemsCollected: state.questItemsCollected,
      survivors: state.survivors,
      targetSurvivorId: activeContextTarget.survivor?.id
    };

    // Special handling for door opening - trigger fog reveal before state update
    if (['open_door', 'use_key', 'lockpick'].includes(action.id) && activeContextTarget.edgeIndex !== undefined) {
      const adjacentPos = getAdjacentPosition(tile, activeContextTarget.edgeIndex);
      if (adjacentPos) {
        triggerFogReveal(adjacentPos.q, adjacentPos.r);
      }
    }

    // Process the action effect using the refactored module
    const result: ActionEffectResult = processActionEffect(action.id, ctx);

    // Apply log messages
    if (result.logMessages) {
      result.logMessages.forEach(msg => addToLog(msg));
    }

    // Apply floating text
    if (result.floatingText) {
      addFloatingText(
        result.floatingText.q,
        result.floatingText.r,
        result.floatingText.text,
        result.floatingText.colorClass
      );
    }

    // Apply spell particle effect (e.g., item collection animation)
    if (result.spellParticle) {
      emitSpellEffect(
        result.spellParticle.startQ,
        result.spellParticle.startR,
        result.spellParticle.type
      );
    }

    // Spawn boss for final confrontation
    if (result.spawnBoss) {
      const bossInfo = result.spawnBoss;
      addToLog(bossInfo.message);
      addFloatingText(player.position.q, player.position.r, 'BOSS!', 'text-red-500');

      // Find a suitable spawn location near the player
      const spawnPos = calculateEnemySpawnPosition(
        state.board,
        state.players,
        state.enemies,
        player.position
      );

      if (spawnPos) {
        const bossEnemy = createEnemy(bossInfo.type as EnemyType, spawnPos.q, spawnPos.r);
        setState(prev => ({
          ...prev,
          enemies: [...prev.enemies, bossEnemy]
        }));
      }
    }

    // Apply state updates
    if (result.board || result.players || result.activeScenario !== undefined ||
        result.objectiveSpawnState !== undefined || result.questItemsCollected ||
        result.survivors) {
      setState(prev => {
        let updatedState = {
          ...prev,
          ...(result.board && { board: result.board }),
          ...(result.players && { players: result.players }),
          ...(result.activeScenario !== undefined && { activeScenario: result.activeScenario }),
          ...(result.objectiveSpawnState !== undefined && { objectiveSpawnState: result.objectiveSpawnState }),
          ...(result.questItemsCollected && { questItemsCollected: result.questItemsCollected }),
          ...(result.survivors && { survivors: result.survivors })
        };

        // Apply survivor rewards (doom bonus, player sanity/etc)
        if (result.survivorRewards) {
          const rewards = result.survivorRewards;
          const activePlayer = updatedState.players[updatedState.activePlayerIndex];

          // Apply doom bonus
          if (rewards.doomBonus && rewards.doomBonus > 0) {
            const maxDoom = prev.activeScenario?.startDoom || 15;
            updatedState = {
              ...updatedState,
              doom: Math.min(maxDoom, updatedState.doom + rewards.doomBonus)
            };
          }

          // Apply sanity reward/penalty to active player
          if (rewards.sanity && activePlayer) {
            const newSanity = Math.max(0, Math.min(activePlayer.maxSanity, activePlayer.sanity + rewards.sanity));
            updatedState = {
              ...updatedState,
              players: updatedState.players.map((p, i) =>
                i === updatedState.activePlayerIndex ? { ...p, sanity: newSanity } : p
              )
            };
          }

          // Apply insight reward (stored on player or global)
          if (rewards.insight && rewards.insight > 0 && activePlayer) {
            updatedState = {
              ...updatedState,
              players: updatedState.players.map((p, i) =>
                i === updatedState.activePlayerIndex
                  ? { ...p, insight: (p.insight || 0) + rewards.insight! }
                  : p
              )
            };
          }
        }

        return updatedState;
      });
    }

    // Handle pass-through movement (climbing windows, wading through water, etc.)
    if (result.movePlayerThroughEdge && activeContextTarget.edgeIndex !== undefined) {
      const adjPos = getAdjacentPosition(tile, activeContextTarget.edgeIndex);
      if (adjPos) {
        const existingTile = state.board.find(t => t.q === adjPos.q && t.r === adjPos.r);
        const activePlayer = state.players[state.activePlayerIndex];

        // Spawn room if needed
        if (!existingTile) {
          spawnRoom(adjPos.q, adjPos.r, state.activeScenario?.tileSet || 'mixed');
        }

        // Move player to the adjacent position
        setState(prev => ({
          ...prev,
          players: prev.players.map((p, i) =>
            i === prev.activePlayerIndex ? { ...p, position: adjPos } : p
          ),
          exploredTiles: [...new Set([...(prev.exploredTiles || []), `${adjPos.q},${adjPos.r}`])]
        }));

        const targetName = existingTile?.name || 'ukjent område';
        addToLog(`${activePlayer?.name || 'Investigator'} passerer gjennom til ${targetName}.`);
      }
    }
  }, [activeContextTarget, state.board, state.activeScenario, state.objectiveSpawnState, state.questItemsCollected, state.players, state.activePlayerIndex, state.survivors, spawnRoom]);

  // NOTE: The following cases were part of the old 470-line switch statement
  // They have been refactored into contextActionEffects.ts - DO NOT REINTRODUCE
  // Old cases: force_door, break_barricade, close_door, clear_rubble, extinguish,
  // search_tile, search_books, search_container, search_rubble, search_water,
  // search_statue, open_gate, force_gate, disarm_trap, trigger_trap, dispel_fog,
  // clear_edge_*, break_edge_*, unlock_edge_*, lockpick_edge_*, extinguish_edge_*,
  // dispel_edge_*, banish_edge_*, break_window, search_edge_*, perform_ritual,
  // seal_portal, flip_switch, escape, pickup_quest_item_*

  // Handle puzzle completion (from PuzzleModal)
  // Now supports cost parameter for blood_ritual puzzles
  const handlePuzzleSolve = useCallback((success: boolean, cost?: { hp?: number; sanity?: number }) => {
    const activePlayer = state.players[state.activePlayerIndex];
    const puzzleTarget = state.activePuzzle;

    if (!puzzleTarget || !activePlayer) {
      setState(prev => ({ ...prev, activePuzzle: null }));
      setActiveContextTarget(null);
      setContextActions([]);
      return;
    }

    if (success) {
      // Log different messages based on puzzle type
      const puzzleMessages: Record<string, string> = {
        sequence: 'PUZZLE SOLVED! The mechanism clicks and the door opens.',
        code_lock: 'CODE ACCEPTED! The lock disengages with a satisfying click.',
        symbol_match: 'SYMBOLS ALIGNED! Ancient power flows and the seal breaks.',
        blood_ritual: 'THE SEAL ACCEPTS YOUR OFFERING! The blood price is paid.',
        astronomy: 'THE STARS ALIGN! Celestial harmony grants passage.',
        pressure_plate: 'PLATE ACTIVATED! The mechanism engages.',
      };
      addToLog(puzzleMessages[puzzleTarget.type] || puzzleMessages.sequence);
      addFloatingText(activePlayer.position.q, activePlayer.position.r, "UNLOCKED!", "text-accent");

      // Find the tile and open the puzzle door
      const tileId = puzzleTarget.targetTileId;

      // Calculate player updates (HP/Sanity cost for blood_ritual)
      let playerUpdate = activePlayer;
      if (cost) {
        if (cost.hp && cost.hp > 0) {
          playerUpdate = { ...playerUpdate, hp: Math.max(0, playerUpdate.hp - cost.hp) };
          addFloatingText(activePlayer.position.q, activePlayer.position.r, `-${cost.hp} HP`, "text-red-500");
          addToLog(`You sacrifice ${cost.hp} HP to break the blood seal.`);
        }
        if (cost.sanity && cost.sanity > 0) {
          playerUpdate = checkMadness({ ...playerUpdate, sanity: Math.max(0, playerUpdate.sanity - cost.sanity) });
          addFloatingText(activePlayer.position.q, activePlayer.position.r, `-${cost.sanity} SAN`, "text-sanity");
          addToLog(`You sacrifice ${cost.sanity} Sanity to break the blood seal.`);
        }
      }

      setState(prev => ({
        ...prev,
        activePuzzle: null,
        players: prev.players.map((p, i) => i === prev.activePlayerIndex ? playerUpdate : p),
        board: prev.board.map(t => {
          if (t.id === tileId) {
            // Find the puzzle door edge and open it
            const newEdges = [...t.edges] as [EdgeData, EdgeData, EdgeData, EdgeData, EdgeData, EdgeData];
            for (let i = 0; i < 6; i++) {
              if (newEdges[i].type === 'door' && newEdges[i].doorState === 'puzzle') {
                newEdges[i] = { ...newEdges[i], doorState: 'open' };
              }
            }
            // Also remove any locked_door object
            return { ...t, edges: newEdges, object: t.object?.type === 'locked_door' ? undefined : t.object };
          }
          return t;
        })
      }));
    } else {
      // Different failure messages by puzzle type
      const failMessages: Record<string, string> = {
        sequence: 'PUZZLE FAILED! Your mind reels from the eldritch symbols.',
        code_lock: 'WRONG CODE! The mechanism locks up, damaging your confidence.',
        symbol_match: 'WRONG PATTERN! The ancient symbols burn into your memory.',
        blood_ritual: 'YOU REFUSE THE PRICE. The seal remains unmoved.',
        astronomy: 'MISALIGNED! The stars mock your feeble attempt.',
        pressure_plate: 'RELEASED! The mechanism resets.',
      };
      addToLog(failMessages[puzzleTarget.type] || failMessages.sequence);

      // Blood ritual refusal doesn't cost sanity
      if (puzzleTarget.type !== 'blood_ritual') {
        addFloatingText(activePlayer.position.q, activePlayer.position.r, "-1 SAN", "text-sanity");
        setState(prev => ({
          ...prev,
          activePuzzle: null,
          players: prev.players.map((p, i) =>
            i === prev.activePlayerIndex ? checkMadness({
              ...p,
              sanity: Math.max(0, p.sanity - 1)
            }) : p
          )
        }));
      } else {
        setState(prev => ({ ...prev, activePuzzle: null }));
      }
    }

    // Close context menu
    setActiveContextTarget(null);
    setContextActions([]);
  }, [state.players, state.activePlayerIndex, state.activePuzzle, checkMadness]);

  // Handle event card resolution
  const handleEventResolve = useCallback(() => {
    // Use a single setState to ensure we work with the current state
    setState(prev => {
      const event = prev.activeEvent;
      if (!event) {
        return { ...prev, activeEvent: null };
      }

      const activePlayer = prev.players[prev.activePlayerIndex] || prev.players.find(p => !p.isDead);
      if (!activePlayer) {
        // No valid player, just dismiss the event
        return {
          ...prev,
          activeEvent: null,
          eventDiscardPile: discardEventCard(event, prev.eventDiscardPile)
        };
      }

      // Check if event has a skill check
      let skillCheckPassed = false;
      if (event.skillCheck) {
        const checkResult = performEventSkillCheck(
          activePlayer,
          event.skillCheck.attribute,
          event.skillCheck.dc
        );
        skillCheckPassed = checkResult.success;

        // Log the skill check result (schedule for after state update)
        const attrName = event.skillCheck.attribute.charAt(0).toUpperCase() + event.skillCheck.attribute.slice(1);
        setTimeout(() => {
          addToLog(`${activePlayer.name} makes a ${attrName} check (DC ${event.skillCheck!.dc}): ${checkResult.rolls.join(', ')} = ${checkResult.successes} successes - ${skillCheckPassed ? 'SUCCESS!' : 'FAILED!'}`);
        }, 0);
      }

      // Resolve the event effect using the CURRENT state (prev)
      const { updatedState, logMessages, spawnEnemies, weatherChange, itemReward } = resolveEventEffect(
        event,
        prev,
        prev.activePlayerIndex,
        skillCheckPassed
      );

      // Handle item rewards (schedule for after state update)
      if (itemReward && !skillCheckPassed) {
        setTimeout(() => {
          handleEventItemReward(itemReward.playerId, itemReward.itemId);
        }, 100);
      }

      // Log all messages from the event (schedule for after state update)
      setTimeout(() => {
        logMessages.forEach(msg => addToLog(msg));
      }, 0);

      // Handle enemy spawning (schedule for after state update)
      if (spawnEnemies && spawnEnemies.count > 0 && !skillCheckPassed) {
        const alivePlayers = prev.players.filter(p => !p.isDead);
        const targetPlayer = spawnEnemies.nearPlayerId
          ? prev.players.find(p => p.id === spawnEnemies.nearPlayerId)
          : alivePlayers[Math.floor(Math.random() * alivePlayers.length)];

        if (targetPlayer) {
          // Spawn enemies near the target player
          const spawnType = (spawnEnemies.type in BESTIARY) ? spawnEnemies.type as EnemyType : 'cultist';
          for (let i = 0; i < spawnEnemies.count; i++) {
            const offsetQ = Math.floor(Math.random() * 3) - 1;
            const offsetR = Math.floor(Math.random() * 3) - 1;
            // Use setTimeout to spawn after state update
            setTimeout(() => {
              spawnEnemy(spawnType, targetPlayer.position.q + offsetQ + 1, targetPlayer.position.r + offsetR);
            }, (i + 1) * 200);
          }
          setTimeout(() => {
            addFloatingText(targetPlayer.position.q, targetPlayer.position.r, `${spawnEnemies.count} ${spawnEnemies.type}!`, "text-primary");
            triggerScreenShake();
          }, 50);
        }
      }

      // Build the new state
      let newState = {
        ...prev,
        ...updatedState,
        activeEvent: null,
        eventDiscardPile: discardEventCard(event, prev.eventDiscardPile)
      };

      // Handle weather change
      if (weatherChange && !skillCheckPassed) {
        const newWeatherCondition: WeatherCondition = {
          type: weatherChange.type as WeatherType,
          intensity: 'moderate',
          duration: weatherChange.duration,
        };
        newState = {
          ...newState,
          weatherState: {
            ...prev.weatherState,
            global: newWeatherCondition,
          }
        };
      }

      return newState;
    });
  }, [addToLog, addFloatingText, triggerScreenShake, spawnEnemy]);

  /**
   * Handle item rewards from event cards
   */
  const handleEventItemReward = useCallback((playerId: string, itemId: string) => {
    // Find the item in ITEMS array
    const item = ITEMS.find(i => i.id === itemId);
    if (!item) {
      addToLog(`Could not find item: ${itemId}`);
      return;
    }

    setState(prev => {
      const playerIdx = prev.players.findIndex(p => p.id === playerId);
      if (playerIdx === -1) return prev;

      const player = prev.players[playerIdx];

      // Find an empty bag slot
      const emptyBagIndex = player.inventory.bag.findIndex(slot => slot === null);
      if (emptyBagIndex === -1) {
        // No room - log and skip
        setTimeout(() => addToLog(`${player.name} has no room for ${item.name}!`), 0);
        return prev;
      }

      // Add item to inventory
      const newPlayers = prev.players.map((p, idx) => {
        if (idx !== playerIdx) return p;
        const newInventory = { ...p.inventory, bag: [...p.inventory.bag] };
        newInventory.bag[emptyBagIndex] = { ...item, slotType: 'bag' };
        return { ...p, inventory: newInventory };
      });

      setTimeout(() => {
        addToLog(`${player.name} received ${item.name}!`);
        addFloatingText(player.position.q, player.position.r, `+${item.name}`, "text-yellow-400");
      }, 0);

      return { ...prev, players: newPlayers };
    });
  }, [addToLog, addFloatingText]);

  /**
   * Instantiate a room cluster at the given world position
   */
  const instantiateRoomCluster = (
    cluster: RoomCluster,
    worldQ: number,
    worldR: number,
    boardMap: Map<string, Tile>
  ): Tile[] => {
    const tiles: Tile[] = [];
    const clusterRoomId = `cluster-${Date.now()}`;

    for (const tileData of cluster.tiles) {
      const q = worldQ + tileData.localQ;
      const r = worldR + tileData.localR;

      // Skip if tile already exists
      if (boardMap.has(`${q},${r}`)) {
        continue;
      }

      const tile = createTileFromTemplate(tileData.template, q, r, tileData.rotation);
      tile.roomId = clusterRoomId;
      tile.visibility = 'visible';
      tile.explored = true;

      tiles.push(tile);
      boardMap.set(`${q},${r}`, tile); // Update map for subsequent tiles
    }

    return tiles;
  };

  const handleAction = (actionType: string, payload?: any) => {
    const activePlayer = state.players[state.activePlayerIndex];
    if (!activePlayer || activePlayer.actions <= 0 || activePlayer.isDead || state.phase !== GamePhase.INVESTIGATOR) return;

    switch (actionType) {
      case 'move':
        const { q, r } = payload;
        const targetTile = state.board.find(t => t.q === q && t.r === r);

        // Check if target tile is adjacent to player (distance 1)
        const distanceToTarget = hexDistance(activePlayer.position, { q, r });
        const isAdjacent = distanceToTarget === 1;

        // When clicking on the tile you're standing on, show context actions
        // This allows picking up quest items, searching, interacting with objects
        if (distanceToTarget === 0) {
          const currentTile = state.board.find(t => t.q === q && t.r === r);
          if (currentTile) {
            // Check if tile has quest items, is searchable, or has objects to interact with
            const hasQuestItems = currentTile.items && currentTile.items.some(item => item.isQuestItem);
            const hasInteractableObject = currentTile.object && !currentTile.object.blocking;
            const isSearchable = currentTile.searchable && !currentTile.searched;

            if (hasQuestItems || hasInteractableObject || isSearchable) {
              setState(prev => ({ ...prev, selectedTileId: currentTile.id }));
              showContextActions(currentTile);
              return;
            }
          }
          return;
        }

        // Block movement/interaction to non-adjacent tiles
        // Don't reveal ANY information about distant tiles to preserve exploration
        if (!isAdjacent) {
          // Only show message if tile exists and is within sight range (2 tiles)
          // For farther tiles, don't even acknowledge they exist
          if (targetTile && distanceToTarget <= 2) {
            addToLog(`For langt unna. Du kan bare bevege deg til tilstøtende tiles.`);
          }
          return;
        }

        // From here, we know the target is adjacent (distance 1)

        // Check for blocking objects - show context menu for adjacent tiles
        if (targetTile?.object?.blocking) {
          setState(prev => ({ ...prev, selectedTileId: targetTile.id }));
          showContextActions(targetTile);
          addToLog(`PATH BLOCKED: ${targetTile.object.type}.`);
          return;
        }

        // Check for blocking obstacles - show context menu for adjacent tiles
        if (targetTile?.obstacle?.blocking) {
          setState(prev => ({ ...prev, selectedTileId: targetTile.id }));
          showContextActions(targetTile);
          addToLog(`PATH BLOCKED: ${targetTile.obstacle.type.replace('_', ' ')}.`);
          return;
        }

        // Check for blocked edges (walls, blocked, windows, doors, stairs) between tiles
        // Uses validateMovementEdges from movementUtils to avoid code duplication
        const sourcePos = activePlayer.position;
        const sourceTile = state.board.find(t => t.q === sourcePos.q && t.r === sourcePos.r);
        const edgeFromSource = getEdgeDirection(sourcePos, { q, r });
        const edgeFromTarget = edgeFromSource !== -1 ? getOppositeEdgeDirection(edgeFromSource) : -1;

        const edgeValidation = validateMovementEdges(sourceTile, targetTile, edgeFromSource, edgeFromTarget);
        if (!edgeValidation.allowed) {
          addToLog(edgeValidation.message);
          if (edgeValidation.showContextActions && edgeValidation.contextTileId) {
            const contextTile = state.board.find(t => t.id === edgeValidation.contextTileId);
            if (contextTile) {
              setState(prev => ({ ...prev, selectedTileId: contextTile.id }));
              showContextActions(contextTile, edgeValidation.contextEdgeIndex);
            }
          }
          return;
        }

        // Paranoia: Cannot share tile with other players
        if (activePlayer.activeMadness?.type === 'paranoia') {
          const playersOnTargetTile = state.players.filter(
            p => p.id !== activePlayer.id && !p.isDead && p.position.q === q && p.position.r === r
          );
          if (playersOnTargetTile.length > 0) {
            addToLog(`${activePlayer.name}'s paranoia prevents them from approaching others!`);
            addFloatingText(activePlayer.position.q, activePlayer.position.r, "PARANOIA!", "text-sanity");
            return;
          }
        }

        if (!targetTile) {
          spawnRoom(q, r, state.activeScenario?.tileSet || 'mixed');
        }

        // Check for hazards (trap/fire) on the tile being entered - deal damage
        const tileToEnter = state.board.find(t => t.q === q && t.r === r);
        let hazardDamage = 0;
        let hazardMessage = '';

        // Check for trap object
        if (tileToEnter?.object?.type === 'trap') {
          hazardDamage = 2;
          hazardMessage = `${activePlayer.name} triggers a trap! -${hazardDamage} HP`;
          // Remove trap after triggered
          setState(prev => ({
            ...prev,
            board: prev.board.map(t =>
              t.q === q && t.r === r ? { ...t, object: undefined } : t
            )
          }));
        }

        // Check for fire object
        if (tileToEnter?.object?.type === 'fire') {
          hazardDamage = 1;
          hazardMessage = `${activePlayer.name} moves through flames! -${hazardDamage} HP`;
        }

        // Check for fire obstacle
        if (tileToEnter?.obstacle?.type === 'fire') {
          hazardDamage = 1;
          hazardMessage = `${activePlayer.name} is burned by fire! -${hazardDamage} HP`;
        }

        // Tile-based sanity triggers on first visit
        const isFirstVisit = !state.exploredTiles?.includes(`${q},${r}`);
        let tileSanityLoss = 0;
        if (isFirstVisit && tileToEnter) {
          const tileName = tileToEnter.name?.toLowerCase() || '';
          const tileCategory = tileToEnter.category?.toLowerCase() || '';

          // Define scary tiles and their sanity costs
          const SCARY_TILES: Record<string, { sanityLoss: number; message: string }> = {
            'sacrificial altar': { sanityLoss: 2, message: 'The altar is stained with centuries of unspeakable offerings.' },
            'eldritch portal': { sanityLoss: 2, message: 'Through the portal, you glimpse geometries that hurt to perceive.' },
            'ancient stone circle': { sanityLoss: 1, message: 'The monoliths hum with wrongness. The carvings shift when you look away.' },
            'coastal cliffs': { sanityLoss: 1, message: 'Something in the waves below whispers promises of oblivion.' },
            'cell corridor': { sanityLoss: 1, message: 'The hands reaching through the bars are too pale, the fingers too long.' },
            'sewer access': { sanityLoss: 1, message: 'Things live down here that have never seen the sun.' },
            'sewer grate': { sanityLoss: 1, message: 'Something below reaches up with too many fingers.' },
            'secret crypt': { sanityLoss: 1, message: 'The cold is unnatural. Some names carved here are still legible.' },
            'bone ossuary': { sanityLoss: 1, message: 'Thousands of skulls watch you with empty sockets.' },
            'forgotten tomb': { sanityLoss: 1, message: 'The dust has been disturbed recently. From the inside.' },
          };

          // Check crypt category for base sanity loss
          if (tileCategory === 'crypt' && !SCARY_TILES[tileName]) {
            tileSanityLoss = 1;
            addToLog(`The crypt's ancient evil seeps into your mind. -1 Sanity`);
          }

          // Check for specific scary tile names
          for (const [name, data] of Object.entries(SCARY_TILES)) {
            if (tileName.includes(name.toLowerCase())) {
              tileSanityLoss = data.sanityLoss;
              addToLog(`${data.message} -${tileSanityLoss} Sanity`);
              break;
            }
          }

          if (tileSanityLoss > 0) {
            addFloatingText(q, r, `-${tileSanityLoss} SAN`, "text-sanity");
          }
        }

        // Mark ONLY the current tile as explored (not adjacent tiles)
        // Adjacent tiles should show as "UTFORSK" (red) until the player actually visits them
        const newExplored = new Set(state.exploredTiles || []);
        newExplored.add(`${q},${r}`);

        // Apply movement and hazard damage
        if (hazardDamage > 0) {
          addToLog(hazardMessage);
          addFloatingText(q, r, `-${hazardDamage} HP`, "text-health");
          triggerScreenShake();
        }

        // Dark Room Discovery - check if player is entering a dark room with a light source
        let darkRoomEffects = { sanityChange: 0, insightGain: 0, trapDamage: 0, itemFound: null as Item | null, enemySpawn: null as { type: EnemyType, count: number } | null };
        let boardUpdates: ((board: Tile[]) => Tile[])[] = [];

        const enteredTile = state.board.find(t => t.q === q && t.r === r);

        // Log atmospheric description when entering a tile (for already explored tiles)
        // New tiles log their description during generation, but revisited tiles need to show it again
        if (enteredTile && enteredTile.explored) {
          const description = enteredTile.description || LOCATION_DESCRIPTIONS[enteredTile.name];
          if (description) {
            addToLog(description);
          }
        }

        if (enteredTile?.isDarkRoom && !enteredTile.darkRoomIlluminated && hasLightSource(activePlayer.inventory)) {
          // Illuminate the dark room!
          addToLog(`${activePlayer.name} shines light into the darkness...`);
          addFloatingText(q, r, "ILLUMINATED", "text-amber-400");

          const content = enteredTile.darkRoomContent;
          if (content) {
            // Show discovery description
            addToLog(`📖 ${content.description}`);

            // Apply effects based on discovery type
            switch (content.discoveryType) {
              case 'treasure':
              case 'cache':
              case 'corpse':
              case 'ancient_secret':
                // Items require searching after illumination
                addToLog(`Something glitters in the light. Search to investigate.`);
                break;

              case 'clue':
                darkRoomEffects.insightGain = content.insightGain || 1;
                addToLog(`+${darkRoomEffects.insightGain} Insight from the discovery.`);
                addFloatingText(q, r, `+${darkRoomEffects.insightGain} INSIGHT`, "text-purple-400");
                break;

              case 'survivor':
                darkRoomEffects.sanityChange = content.sanityEffect || 1;
                darkRoomEffects.insightGain = content.insightGain || 2;
                addToLog(`A survivor! They share what they know before fleeing.`);
                addFloatingText(q, r, `+${darkRoomEffects.insightGain} INSIGHT`, "text-purple-400");
                break;

              case 'nothing':
                addToLog(`Just shadows. The darkness held nothing but your own fear.`);
                break;

              case 'ambush':
              case 'nest':
                const enemyType = content.enemyTypes?.[0] || 'ghoul';
                const enemyCount = content.enemyCount || 1;
                darkRoomEffects.enemySpawn = { type: enemyType, count: enemyCount };
                addToLog(`⚠️ AMBUSH! ${enemyCount} ${enemyType}(s) attack from the shadows!`);
                addFloatingText(q, r, "AMBUSH!", "text-red-500");
                triggerScreenShake();
                break;

              case 'horror':
                darkRoomEffects.sanityChange = content.sanityEffect || -2;
                addToLog(`Your light reveals something that should not exist. -${Math.abs(darkRoomEffects.sanityChange)} Sanity`);
                addFloatingText(q, r, `${darkRoomEffects.sanityChange} SAN`, "text-sanity");
                triggerScreenShake();
                break;

              case 'trap':
                darkRoomEffects.trapDamage = content.trapDamage || 2;
                addToLog(`CLICK! A trap triggers! -${darkRoomEffects.trapDamage} HP`);
                addFloatingText(q, r, `-${darkRoomEffects.trapDamage} HP`, "text-health");
                triggerScreenShake();
                break;

              case 'cultist_shrine':
                darkRoomEffects.sanityChange = content.sanityEffect || -1;
                darkRoomEffects.insightGain = content.insightGain || 3;
                addToLog(`A cultist shrine. The knowledge costs you, but enlightens. -1 Sanity, +${darkRoomEffects.insightGain} Insight`);
                addFloatingText(q, r, `+${darkRoomEffects.insightGain} INSIGHT`, "text-purple-400");
                break;
            }

            // Mark tile as illuminated
            boardUpdates.push((board) => board.map(t =>
              t.q === q && t.r === r
                ? { ...t, darkRoomIlluminated: true, darkRoomContent: { ...content, isRevealed: true } }
                : t
            ));
          }
        }

        // Spawn enemies from dark room ambush
        if (darkRoomEffects.enemySpawn) {
          const { type, count } = darkRoomEffects.enemySpawn;
          for (let i = 0; i < count; i++) {
            const newEnemy = createEnemy(type, { q, r });
            setState(prev => ({
              ...prev,
              enemies: [...prev.enemies, newEnemy]
            }));
          }
        }

        // SURVIVOR SPAWN SYSTEM - Check if a survivor should spawn on first visit
        if (isFirstVisit && enteredTile && !darkRoomEffects.enemySpawn) {
          if (shouldSpawnSurvivor(enteredTile, state.doom, state.survivors || [], true)) {
            const survivorType = selectSurvivorType(enteredTile.category, state.doom);
            if (survivorType) {
              const newSurvivor = createSurvivor(survivorType, { q, r });
              const template = SURVIVOR_TEMPLATES[survivorType];
              addToLog(`SURVIVOR FOUND: ${newSurvivor.name} (${template.type}) is hiding here!`);
              addToLog(`"${newSurvivor.foundDialogue}"`);
              addFloatingText(q, r, "SURVIVOR!", "text-green-400");
              setState(prev => ({
                ...prev,
                survivors: [...(prev.survivors || []), newSurvivor]
              }));
            }
          }
        }

        // Calculate total damage from hazards and dark room traps
        const totalDamage = hazardDamage + darkRoomEffects.trapDamage;

        setState(prev => {
          // Apply board updates
          let updatedBoard = prev.board;
          for (const update of boardUpdates) {
            updatedBoard = update(updatedBoard);
          }

          return {
            ...prev,
            board: updatedBoard,
            players: prev.players.map((p, i) => {
              if (i !== prev.activePlayerIndex) return p;
              const newHp = Math.max(0, p.hp - totalDamage);
              // Apply both dark room effects and tile-based sanity loss
              const totalSanityChange = darkRoomEffects.sanityChange - tileSanityLoss;
              const newSanity = Math.max(0, Math.min(p.maxSanity, p.sanity + totalSanityChange));
              const newInsight = p.insight + darkRoomEffects.insightGain;
              const updatedPlayer = {
                ...p,
                position: { q, r },
                actions: p.actions - 1,
                hp: newHp,
                sanity: newSanity,
                insight: newInsight,
                isDead: newHp <= 0
              };
              // Check for madness trigger from sanity loss
              return checkMadness(updatedPlayer);
            }),
            exploredTiles: Array.from(newExplored)
          };
        });
        break;

      case 'rest':
        // Night Terrors blocks rest action
        if (activePlayer.activeMadness?.type === 'night_terrors') {
          addToLog(`${activePlayer.name} cannot rest - night terrors haunt every attempt at sleep!`);
          addFloatingText(activePlayer.position.q, activePlayer.position.r, "CANNOT REST", "text-sanity");
          return;
        }
        setState(prev => ({
          ...prev,
          players: prev.players.map((p, i) => i === prev.activePlayerIndex ? { ...p, hp: Math.min(p.maxHp, p.hp + 1), sanity: Math.min(p.maxSanity, p.sanity + 1), actions: p.actions - 1 } : p)
        }));
        addToLog(`${activePlayer.name} rested.`);
        break;

      case 'investigate':
        const diceCount = 1 + activePlayer.insight + (activePlayer.id === 'detective' ? 1 : 0);
        const iRoll = Array.from({ length: diceCount }, () => Math.floor(Math.random() * 6) + 1);
        setState(prev => ({ ...prev, lastDiceRoll: iRoll }));
        break;

      case 'attack':
        const targetEnemy = state.enemies.find(e => e.id === state.selectedEnemyId);
        if (!targetEnemy) return;

        // Check if can attack (includes range, weapon restrictions, and line-of-sight)
        const isRanged = hasRangedWeapon(activePlayer);
        const { canAttack, reason, isRestricted } = canAttackEnemy(activePlayer, targetEnemy, state.board);
        if (!canAttack) {
          addToLog(reason);
          return;
        }
        // Warn if player is attacking with restricted weapon (treated as unarmed)
        if (isRestricted) {
          addToLog(reason);
        }

        // Check for horror check first if not encountered
        const enemyTypeKey = targetEnemy.type;
        if (!state.encounteredEnemies.includes(enemyTypeKey)) {
          const horrorResult = performHorrorCheck(activePlayer, targetEnemy, false);
          addToLog(horrorResult.message);

          if (!horrorResult.resisted) {
            addFloatingText(activePlayer.position.q, activePlayer.position.r, `-${horrorResult.sanityLoss} SAN`, "text-sanity");
            setState(prev => ({
              ...prev,
              encounteredEnemies: [...prev.encounteredEnemies, enemyTypeKey],
              players: prev.players.map((p, i) => i === prev.activePlayerIndex ? checkMadness({
                ...p,
                sanity: Math.max(0, p.sanity - horrorResult.sanityLoss)
              }) : p),
              lastDiceRoll: horrorResult.rolls
            }));
            // Horror check uses action but doesn't prevent attack this turn
          } else {
            setState(prev => ({
              ...prev,
              encounteredEnemies: [...prev.encounteredEnemies, enemyTypeKey]
            }));
          }
        }

        // Perform the attack using new combat system
        const combatResult = performAttack(activePlayer, targetEnemy, isRanged);
        playSound('attack');
        playSound('diceRoll');
        setState(prev => ({
          ...prev,
          lastDiceRoll: combatResult.rolls,
          activeCombat: {
            playerId: activePlayer.id,
            enemyId: targetEnemy.id,
            phase: 'player_attack',
            playerRoll: combatResult.rolls,
            playerDamageDealt: combatResult.damage
          }
        }));
        break;

      case 'cast':
        // Cast spell - payload is the Spell object
        const spell = payload;
        if (!spell) {
          addToLog(`No spell selected.`);
          return;
        }

        // Check if player has enough Insight
        if (activePlayer.insight < spell.cost) {
          addToLog(`Not enough Insight to cast ${spell.name}. Need ${spell.cost}, have ${activePlayer.insight}.`);
          addFloatingText(activePlayer.position.q, activePlayer.position.r, "NOT ENOUGH INSIGHT", "text-muted-foreground");
          return;
        }

        // For damage/banish spells, need a target enemy
        if (spell.effectType === 'damage' || spell.effectType === 'banish') {
          const spellTarget = state.enemies.find(e => e.id === state.selectedEnemyId);
          if (!spellTarget) {
            // Set active spell and wait for target selection
            setState(prev => ({ ...prev, activeSpell: spell }));
            addToLog(`Select a target for ${spell.name}. Range: ${spell.range} tiles.`);
            return;
          }

          // Check range
          const distance = hexDistance(activePlayer.position, spellTarget.position);
          if (distance > spell.range) {
            addToLog(`${spellTarget.name} is out of range for ${spell.name}. Max range: ${spell.range}, distance: ${distance}.`);
            addFloatingText(activePlayer.position.q, activePlayer.position.r, "OUT OF RANGE", "text-muted-foreground");
            return;
          }

          // Perform the spell effect
          if (spell.effectType === 'damage') {
            playSound('spellCast');
            addToLog(`${activePlayer.name} casts ${spell.name}! Eldritch energy strikes ${spellTarget.name} for ${spell.value} damage.`);
            addFloatingText(spellTarget.position.q, spellTarget.position.r, `-${spell.value} HP`, "text-sanity");
            addFloatingText(activePlayer.position.q, activePlayer.position.r, `-${spell.cost} INSIGHT`, "text-insight");

            // Emit spell particle effect - wither uses dark purple projectile
            const spellEffectType = spell.id === 'wither' ? 'wither' : 'eldritch_bolt';
            emitSpellEffect(
              activePlayer.position.q,
              activePlayer.position.r,
              spellEffectType,
              spellTarget.position.q,
              spellTarget.position.r
            );

            triggerScreenShake();
            triggerAdvancedEffect('spell-cast');

            // Add blood stains when spell damage is dealt
            if (spell.value > 0) {
              addBloodstains(spellTarget.position.q, spellTarget.position.r, spell.value);
            }

            const newEnemyHp = spellTarget.hp - spell.value;
            const isKilled = newEnemyHp <= 0;

            if (isKilled) {
              const bestiary = BESTIARY[spellTarget.type];
              addToLog(bestiary.defeatFlavor || `${spellTarget.name} is destroyed by arcane power!`);
              addFloatingText(spellTarget.position.q, spellTarget.position.r, "DESTROYED!", "text-accent");

              // Track kill for legacy
              const heroId = activePlayer.heroId || activePlayer.id;
              incrementHeroKills(heroId);

              // ENEMY LOOT DROP SYSTEM (Spell kills)
              const spellLoot = getEnemyLoot(spellTarget.type);
              if (spellLoot.gold > 0 || spellLoot.items.length > 0) {
                if (spellLoot.gold > 0) {
                  addToLog(`LOOT: +${spellLoot.gold} gull fra ${spellTarget.name}!`);
                  addFloatingText(spellTarget.position.q, spellTarget.position.r, `+${spellLoot.gold} GOLD`, "text-yellow-400");
                  // Note: Gold tracking handled by legacy system on scenario completion
                  addFloatingText(spellTarget.position.q, spellTarget.position.r, `+${spellLoot.gold} GOLD`, "text-yellow-400");
                }
                for (const item of spellLoot.items) {
                  if (!isInventoryFull(activePlayer.inventory)) {
                    const equipResult = equipItem(activePlayer.inventory, item);
                    addToLog(`LOOT: Fant ${item.name} fra ${spellTarget.name}!`);
                    addFloatingText(spellTarget.position.q, spellTarget.position.r, item.name.toUpperCase(), "text-accent");
                    setState(prev => ({
                      ...prev,
                      players: prev.players.map((p, i) =>
                        i === prev.activePlayerIndex
                          ? { ...p, inventory: equipResult.newInventory }
                          : p
                      )
                    }));
                  } else {
                    addToLog(`LOOT: ${item.name} droppet pa bakken (inventar fullt)!`);
                    setState(prev => ({
                      ...prev,
                      board: prev.board.map(t =>
                        t.q === spellTarget.position.q && t.r === spellTarget.position.r
                          ? { ...t, items: [...(t.items || []), item] }
                          : t
                      )
                    }));
                  }
                }
              }

              // Update kill objectives
              if (state.activeScenario) {
                const killCheck = checkKillObjectives(state.activeScenario, spellTarget.type);
                if (killCheck.objective) {
                  const updatedScenario = killCheck.shouldComplete
                    ? completeObjective(state.activeScenario, killCheck.objective.id)
                    : updateObjectiveProgress(state.activeScenario, killCheck.objective.id, 1);
                  setState(prev => ({ ...prev, activeScenario: updatedScenario }));
                  if (killCheck.shouldComplete) {
                    addToLog(`OBJECTIVE COMPLETE: ${killCheck.objective.shortDescription}`);
                    // DOOM BONUS for kill objective completion
                    const doomBonus = state.activeScenario?.doomOnObjectiveComplete ?? 1;
                    if (doomBonus > 0) {
                      addToLog(`Your progress weakens the darkness! (+${doomBonus} doom)`);
                      setState(prev => ({
                        ...prev,
                        doom: Math.min(prev.activeScenario?.startDoom || 15, prev.doom + doomBonus)
                      }));
                    }
                  }
                }
              }
            }

            setState(prev => ({
              ...prev,
              enemies: prev.enemies.map(e => e.id === spellTarget.id ? { ...e, hp: newEnemyHp, isDying: isKilled } : e).filter(e => e.hp > 0),
              players: prev.players.map((p, i) => i === prev.activePlayerIndex ? {
                ...p,
                insight: p.insight - spell.cost,
                actions: p.actions - 1
              } : p),
              activeSpell: null,
              selectedEnemyId: isKilled ? null : prev.selectedEnemyId
            }));
          } else if (spell.effectType === 'banish') {
            // Banish only works on weak enemies (HP <= spell.value)
            if (spellTarget.hp > spell.value) {
              addToLog(`${spellTarget.name} is too powerful to banish. Max HP for banish: ${spell.value}.`);
              addFloatingText(activePlayer.position.q, activePlayer.position.r, "TOO POWERFUL", "text-muted-foreground");
              return;
            }

            addToLog(`${activePlayer.name} casts ${spell.name}! ${spellTarget.name} is banished to the void!`);
            addFloatingText(spellTarget.position.q, spellTarget.position.r, "BANISHED!", "text-sanity");
            addFloatingText(activePlayer.position.q, activePlayer.position.r, `-${spell.cost} INSIGHT`, "text-insight");

            // Emit banish particle effect - red void implosion at target
            emitSpellEffect(
              spellTarget.position.q,
              spellTarget.position.r,
              'banish'
            );

            triggerScreenShake();

            // Track kill for legacy
            const heroId = activePlayer.heroId || activePlayer.id;
            incrementHeroKills(heroId);

            setState(prev => ({
              ...prev,
              enemies: prev.enemies.filter(e => e.id !== spellTarget.id),
              players: prev.players.map((p, i) => i === prev.activePlayerIndex ? {
                ...p,
                insight: p.insight - spell.cost,
                actions: p.actions - 1
              } : p),
              activeSpell: null,
              selectedEnemyId: null
            }));
          }
        } else if (spell.effectType === 'heal') {
          // Heal spell - heals the caster
          const healAmount = Math.min(spell.value, activePlayer.maxHp - activePlayer.hp);
          if (healAmount <= 0) {
            addToLog(`${activePlayer.name} is already at full health.`);
            return;
          }

          addToLog(`${activePlayer.name} casts ${spell.name}! Wounds knit together, healing ${healAmount} HP.`);
          addFloatingText(activePlayer.position.q, activePlayer.position.r, `+${healAmount} HP`, "text-health");
          addFloatingText(activePlayer.position.q, activePlayer.position.r, `-${spell.cost} INSIGHT`, "text-insight");

          // Emit mend flesh particle effect - golden healing sparkles
          emitSpellEffect(
            activePlayer.position.q,
            activePlayer.position.r,
            'mend_flesh'
          );

          setState(prev => ({
            ...prev,
            players: prev.players.map((p, i) => i === prev.activePlayerIndex ? {
              ...p,
              hp: Math.min(p.maxHp, p.hp + spell.value),
              insight: p.insight - spell.cost,
              actions: p.actions - 1
            } : p),
            activeSpell: null
          }));
        } else if (spell.effectType === 'reveal') {
          // Reveal spell - reveals hidden clues/areas
          addToLog(`${activePlayer.name} casts ${spell.name}! Hidden truths are revealed...`);
          addFloatingText(activePlayer.position.q, activePlayer.position.r, "REVELATION!", "text-sanity");
          addFloatingText(activePlayer.position.q, activePlayer.position.r, `-${spell.cost} INSIGHT`, "text-insight");

          // Emit true sight particle effect - blue mystical eye radiating outward
          emitSpellEffect(
            activePlayer.position.q,
            activePlayer.position.r,
            'true_sight'
          );

          // Reveal all tiles within range
          const revealedTiles = state.board.filter(t =>
            hexDistance(activePlayer.position, { q: t.q, r: t.r }) <= spell.range
          );

          const newExplored = new Set(state.exploredTiles || []);
          revealedTiles.forEach(t => {
            newExplored.add(`${t.q},${t.r}`);
          });

          setState(prev => ({
            ...prev,
            players: prev.players.map((p, i) => i === prev.activePlayerIndex ? {
              ...p,
              insight: p.insight - spell.cost + spell.value, // Gain insight from revelation
              actions: p.actions - 1
            } : p),
            exploredTiles: Array.from(newExplored),
            activeSpell: null
          }));

          addToLog(`Revealed ${revealedTiles.length} areas. Gained ${spell.value} Insight from the revelation.`);
        }
        break;

      case 'cancel_cast':
        setState(prev => ({ ...prev, activeSpell: null, activeOccultistSpell: null }));
        addToLog(`Spell casting cancelled.`);
        break;

      case 'cast_occultist':
        // Cast Occultist spell - Hero Quest style with attack dice and limited uses
        // Handle both direct spell selection and target selection (from enemy_click)
        const payloadData = payload as OccultistSpell | { spell: OccultistSpell; targetEnemyId: string };
        const occSpell = payloadData && 'spell' in payloadData ? payloadData.spell : payloadData as OccultistSpell;
        const targetEnemyId = payloadData && 'targetEnemyId' in payloadData ? payloadData.targetEnemyId : state.selectedEnemyId;

        if (!occSpell) {
          addToLog(`No spell selected.`);
          return;
        }

        // Check remaining uses
        const remainingUses = occSpell.currentUses ?? occSpell.usesPerScenario;
        const isUnlimited = occSpell.usesPerScenario === -1;
        if (!isUnlimited && remainingUses <= 0) {
          addToLog(`${occSpell.name} has no uses remaining this scenario.`);
          addFloatingText(activePlayer.position.q, activePlayer.position.r, "NO USES LEFT", "text-muted-foreground");
          return;
        }

        // Handle different spell effects
        if (occSpell.effect === 'attack' || occSpell.effect === 'attack_horror' || occSpell.effect === 'banish') {
          // These spells need a target
          const occTarget = state.enemies.find(e => e.id === targetEnemyId);
          if (!occTarget) {
            // Set active spell and wait for target selection
            setState(prev => ({ ...prev, activeOccultistSpell: occSpell }));
            addToLog(`Select a target for ${occSpell.name}. Range: ${occSpell.range} tiles.`);
            return;
          }

          // Check range
          const occDistance = hexDistance(activePlayer.position, occTarget.position);
          if (occDistance > occSpell.range) {
            addToLog(`${occTarget.name} is out of range for ${occSpell.name}. Max range: ${occSpell.range}, distance: ${occDistance}.`);
            addFloatingText(activePlayer.position.q, activePlayer.position.r, "OUT OF RANGE", "text-muted-foreground");
            return;
          }

          if (occSpell.effect === 'attack' || occSpell.effect === 'attack_horror') {
            // Roll attack dice
            const attackDice = occSpell.attackDice;
            const rolls: number[] = [];
            let skulls = 0;
            for (let i = 0; i < attackDice; i++) {
              const roll = Math.floor(Math.random() * 6) + 1;
              rolls.push(roll);
              if (roll >= 4) skulls++;
            }

            // Show dice roll
            setState(prev => ({ ...prev, lastDiceRoll: rolls }));

            // Calculate damage (skulls vs enemy defense)
            const enemyDefense = BESTIARY[occTarget.type]?.defenseDice || 1;
            const defenseRolls: number[] = [];
            let shields = 0;
            for (let i = 0; i < enemyDefense; i++) {
              const roll = Math.floor(Math.random() * 6) + 1;
              defenseRolls.push(roll);
              if (roll >= 4) shields++;
            }

            const occDamage = Math.max(0, skulls - shields);

            addToLog(`${activePlayer.name} casts ${occSpell.name}! Rolled ${attackDice}🎲: [${rolls.join(', ')}] = ${skulls} skulls vs ${shields} shields = ${occDamage} damage!`);

            if (occDamage > 0) {
              addFloatingText(occTarget.position.q, occTarget.position.r, `-${occDamage} HP`, "text-sanity");
            } else {
              addFloatingText(occTarget.position.q, occTarget.position.r, "BLOCKED!", "text-muted-foreground");
            }

            // Emit spell particle effect
            emitSpellEffect(
              activePlayer.position.q,
              activePlayer.position.r,
              occSpell.id === 'eldritch_bolt' ? 'eldritch_bolt' : occSpell.id === 'mind_blast' ? 'mind_blast' : 'eldritch_bolt',
              occTarget.position.q,
              occTarget.position.r
            );

            triggerScreenShake();

            const newOccEnemyHp = occTarget.hp - occDamage;
            const occIsKilled = newOccEnemyHp <= 0;

            // Apply horror damage if attack_horror
            if (occSpell.effect === 'attack_horror' && occSpell.horrorDamage) {
              addToLog(`The psychic assault also causes ${occSpell.horrorDamage} Horror damage!`);
              addFloatingText(occTarget.position.q, occTarget.position.r, `-${occSpell.horrorDamage} SAN`, "text-insight");
            }

            if (occIsKilled) {
              const bestiary = BESTIARY[occTarget.type];
              addToLog(bestiary.defeatFlavor || `${occTarget.name} is destroyed by arcane power!`);
              addFloatingText(occTarget.position.q, occTarget.position.r, "DESTROYED!", "text-accent");

              const heroId = activePlayer.heroId || activePlayer.id;
              incrementHeroKills(heroId);

              // ENEMY LOOT DROP SYSTEM (Occultist spell kills)
              const occLoot = getEnemyLoot(occTarget.type);
              if (occLoot.gold > 0 || occLoot.items.length > 0) {
                if (occLoot.gold > 0) {
                  addToLog(`LOOT: +${occLoot.gold} gull fra ${occTarget.name}!`);
                  addFloatingText(occTarget.position.q, occTarget.position.r, `+${occLoot.gold} GOLD`, "text-yellow-400");
                  // Note: Gold tracking handled by legacy system on scenario completion
                  addFloatingText(occTarget.position.q, occTarget.position.r, `+${occLoot.gold} GOLD`, "text-yellow-400");
                }
                for (const item of occLoot.items) {
                  if (!isInventoryFull(activePlayer.inventory)) {
                    const equipResult = equipItem(activePlayer.inventory, item);
                    addToLog(`LOOT: Fant ${item.name} fra ${occTarget.name}!`);
                    addFloatingText(occTarget.position.q, occTarget.position.r, item.name.toUpperCase(), "text-accent");
                    setState(prev => ({
                      ...prev,
                      players: prev.players.map((p, i) =>
                        i === prev.activePlayerIndex
                          ? { ...p, inventory: equipResult.newInventory }
                          : p
                      )
                    }));
                  } else {
                    addToLog(`LOOT: ${item.name} droppet pa bakken (inventar fullt)!`);
                    setState(prev => ({
                      ...prev,
                      board: prev.board.map(t =>
                        t.q === occTarget.position.q && t.r === occTarget.position.r
                          ? { ...t, items: [...(t.items || []), item] }
                          : t
                      )
                    }));
                  }
                }
              }
            }

            // Update spell uses and player state
            setState(prev => ({
              ...prev,
              enemies: prev.enemies.map(e => e.id === occTarget.id ? { ...e, hp: newOccEnemyHp, isDying: occIsKilled } : e).filter(e => e.hp > 0),
              players: prev.players.map((p, i) => i === prev.activePlayerIndex ? {
                ...p,
                actions: p.actions - 1,
                selectedSpells: p.selectedSpells?.map(s =>
                  s.id === occSpell.id && s.usesPerScenario !== -1
                    ? { ...s, currentUses: (s.currentUses ?? s.usesPerScenario) - 1 }
                    : s
                )
              } : p),
              activeOccultistSpell: null,
              selectedEnemyId: occIsKilled ? null : prev.selectedEnemyId
            }));

          } else if (occSpell.effect === 'banish') {
            // Banish uses Willpower check vs DC 5
            const willpower = activePlayer.attributes?.willpower || 3;
            const banishDice = 2 + willpower;
            const banishRolls: number[] = [];
            let successes = 0;
            for (let i = 0; i < banishDice; i++) {
              const roll = Math.floor(Math.random() * 6) + 1;
              banishRolls.push(roll);
              if (roll >= 5) successes++;
            }

            setState(prev => ({ ...prev, lastDiceRoll: banishRolls }));

            if (successes > 0 && occTarget.hp <= 3) {
              addToLog(`${activePlayer.name} casts ${occSpell.name}! Rolled ${banishDice}🎲: [${banishRolls.join(', ')}] = ${successes} successes! ${occTarget.name} is banished to the void!`);
              addFloatingText(occTarget.position.q, occTarget.position.r, "BANISHED!", "text-sanity");

              emitSpellEffect(occTarget.position.q, occTarget.position.r, 'banish');
              triggerScreenShake();

              const heroId = activePlayer.heroId || activePlayer.id;
              incrementHeroKills(heroId);

              setState(prev => ({
                ...prev,
                enemies: prev.enemies.filter(e => e.id !== occTarget.id),
                players: prev.players.map((p, i) => i === prev.activePlayerIndex ? {
                  ...p,
                  actions: p.actions - 1,
                  selectedSpells: p.selectedSpells?.map(s =>
                    s.id === occSpell.id ? { ...s, currentUses: (s.currentUses ?? s.usesPerScenario) - 1 } : s
                  )
                } : p),
                activeOccultistSpell: null,
                selectedEnemyId: null
              }));
            } else if (occTarget.hp > 3) {
              addToLog(`${occTarget.name} is too powerful to banish! Only enemies with 3 or less HP can be banished.`);
              addFloatingText(activePlayer.position.q, activePlayer.position.r, "TOO POWERFUL", "text-muted-foreground");
            } else {
              addToLog(`${activePlayer.name} casts ${occSpell.name} but fails! Rolled ${banishDice}🎲: [${banishRolls.join(', ')}] = ${successes} successes (need 1+).`);
              addFloatingText(activePlayer.position.q, activePlayer.position.r, "FAILED!", "text-muted-foreground");

              // Still consume the use
              setState(prev => ({
                ...prev,
                players: prev.players.map((p, i) => i === prev.activePlayerIndex ? {
                  ...p,
                  actions: p.actions - 1,
                  selectedSpells: p.selectedSpells?.map(s =>
                    s.id === occSpell.id ? { ...s, currentUses: (s.currentUses ?? s.usesPerScenario) - 1 } : s
                  )
                } : p),
                activeOccultistSpell: null
              }));
            }
          }

        } else if (occSpell.effect === 'defense') {
          // Dark Shield - +2 defense this round
          addToLog(`${activePlayer.name} casts ${occSpell.name}! Shadows coalesce into a protective barrier. +${occSpell.defenseBonus} Defense this round.`);
          addFloatingText(activePlayer.position.q, activePlayer.position.r, `+${occSpell.defenseBonus} DEFENSE`, "text-blue-400");

          emitSpellEffect(activePlayer.position.q, activePlayer.position.r, 'dark_shield');

          setState(prev => ({
            ...prev,
            players: prev.players.map((p, i) => i === prev.activePlayerIndex ? {
              ...p,
              actions: p.actions - 1,
              tempDefenseBonus: (p.tempDefenseBonus || 0) + (occSpell.defenseBonus || 0),
              selectedSpells: p.selectedSpells?.map(s =>
                s.id === occSpell.id ? { ...s, currentUses: (s.currentUses ?? s.usesPerScenario) - 1 } : s
              )
            } : p),
            activeOccultistSpell: null
          }));

        } else if (occSpell.effect === 'utility') {
          // Glimpse Beyond - reveal tiles in range
          addToLog(`${activePlayer.name} casts ${occSpell.name}! Visions of the unseen flood your mind...`);
          addFloatingText(activePlayer.position.q, activePlayer.position.r, "REVELATION!", "text-cyan-400");

          emitSpellEffect(activePlayer.position.q, activePlayer.position.r, 'true_sight');

          const revealedOccTiles = state.board.filter(t =>
            hexDistance(activePlayer.position, { q: t.q, r: t.r }) <= occSpell.range
          );

          const newOccExplored = new Set(state.exploredTiles || []);
          revealedOccTiles.forEach(t => {
            newOccExplored.add(`${t.q},${t.r}`);
          });

          setState(prev => ({
            ...prev,
            players: prev.players.map((p, i) => i === prev.activePlayerIndex ? {
              ...p,
              actions: p.actions - 1,
              selectedSpells: p.selectedSpells?.map(s =>
                s.id === occSpell.id ? { ...s, currentUses: (s.currentUses ?? s.usesPerScenario) - 1 } : s
              )
            } : p),
            exploredTiles: Array.from(newOccExplored),
            activeOccultistSpell: null
          }));

          addToLog(`Revealed ${revealedOccTiles.length} areas within range ${occSpell.range}.`);
        }
        break;

      case 'enemy_click':
        // If we have an active spell that needs a target, cast it on this enemy
        if (state.activeSpell) {
          // Set selectedEnemyId first, then cast
          setState(prev => ({ ...prev, selectedEnemyId: payload.id }));
          handleAction('cast', state.activeSpell);
          return;
        }
        // If we have an active occultist spell that needs a target, cast it on this enemy
        if (state.activeOccultistSpell) {
          // Pass enemy ID directly with the spell to avoid state timing issues
          handleAction('cast_occultist', { spell: state.activeOccultistSpell, targetEnemyId: payload.id });
          return;
        }
        setState(prev => ({ ...prev, selectedEnemyId: payload.id }));
        break;
    }
  };

  const resolveDiceResult = () => {
    const roll = state.lastDiceRoll;
    if (!roll) return;
    const successes = roll.filter(v => v >= 4).length;
    const activePlayer = state.players[state.activePlayerIndex];

    if (state.activeCombat) {
      const combat = state.activeCombat;
      const enemy = state.enemies.find(e => e.id === combat.enemyId);

      if (enemy) {
        const damage = combat.playerDamageDealt || successes;
        const criticalHit = successes === roll.length && roll.length > 0;
        const criticalMiss = successes === 0;

        if (damage > 0 && !criticalMiss) {
          const newEnemyHp = enemy.hp - damage;
          const isKilled = newEnemyHp <= 0;

          if (criticalHit) {
            addToLog(`KRITISK TREFF! ${activePlayer.name} knuser ${enemy.name} for ${damage} skade!`);
          } else {
            addToLog(`TREFF! ${activePlayer.name} gjor ${damage} skade til ${enemy.name}.`);
          }

          addFloatingText(enemy.position.q, enemy.position.r, `-${damage} HP`, "text-primary");
          triggerScreenShake();

          // Add blood stains when damage is dealt to enemies
          addBloodstains(enemy.position.q, enemy.position.r, damage);

          if (isKilled) {
            const bestiary = BESTIARY[enemy.type];
            addToLog(bestiary.defeatFlavor || `${enemy.name} er beseiret!`);
            addFloatingText(enemy.position.q, enemy.position.r, "DREPT!", "text-accent");

            // Track kill for legacy hero XP rewards
            const heroId = activePlayer.heroId || activePlayer.id;
            incrementHeroKills(heroId);

            // ENEMY LOOT DROP SYSTEM
            const loot = getEnemyLoot(enemy.type);
            if (loot.gold > 0 || loot.items.length > 0) {
              // Add gold to player
              if (loot.gold > 0) {
                addToLog(`LOOT: +${loot.gold} gull fra ${enemy.name}!`);
                addFloatingText(enemy.position.q, enemy.position.r, `+${loot.gold} GOLD`, "text-yellow-400");
                // Note: Gold tracking handled by legacy system on scenario completion
                addFloatingText(enemy.position.q, enemy.position.r, `+${loot.gold} GOLD`, "text-yellow-400");
              }

              // Add items to inventory or drop on ground
              for (const item of loot.items) {
                if (!isInventoryFull(activePlayer.inventory)) {
                  const equipResult = equipItem(activePlayer.inventory, item);
                  addToLog(`LOOT: Fant ${item.name} fra ${enemy.name}!`);
                  addFloatingText(enemy.position.q, enemy.position.r, item.name.toUpperCase(), "text-accent");
                  setState(prev => ({
                    ...prev,
                    players: prev.players.map((p, i) =>
                      i === prev.activePlayerIndex
                        ? { ...p, inventory: equipResult.newInventory }
                        : p
                    )
                  }));
                } else {
                  // Drop item on the tile
                  addToLog(`LOOT: ${item.name} droppet pa bakken (inventar fullt)!`);
                  addFloatingText(enemy.position.q, enemy.position.r, "DROPPED: " + item.name, "text-muted-foreground");
                  setState(prev => ({
                    ...prev,
                    board: prev.board.map(t =>
                      t.q === enemy.position.q && t.r === enemy.position.r
                        ? { ...t, items: [...(t.items || []), item] }
                        : t
                    )
                  }));
                }
              }
            }

            // DOOM BONUS: Check if elite/boss kill grants doom (pressure-based doom system)
            const isEliteOrBoss = enemy.traits?.includes('elite') ||
                                  enemy.traits?.includes('massive') ||
                                  ['shoggoth', 'star_spawn', 'boss', 'high_priest', 'dark_young'].includes(enemy.type);
            if (isEliteOrBoss) {
              const doomBonus = state.activeScenario?.doomOnEliteKill ?? 1;
              if (doomBonus > 0) {
                addToLog(`The darkness retreats! (+${doomBonus} doom)`);
                addFloatingText(enemy.position.q, enemy.position.r, `+${doomBonus} DOOM`, "text-green-400");
                setState(prev => ({ ...prev, doom: Math.min(prev.activeScenario?.startDoom || 15, prev.doom + doomBonus) }));
              }
            }

            // Update kill objectives
            if (state.activeScenario) {
              const killCheck = checkKillObjectives(state.activeScenario, enemy.type);
              if (killCheck.objective) {
                const updatedScenario = killCheck.shouldComplete
                  ? completeObjective(state.activeScenario, killCheck.objective.id)
                  : updateObjectiveProgress(state.activeScenario, killCheck.objective.id, 1);

                setState(prev => ({ ...prev, activeScenario: updatedScenario }));

                if (killCheck.shouldComplete) {
                  addToLog(`OBJECTIVE COMPLETE: ${killCheck.objective.shortDescription}`);
                  addFloatingText(activePlayer.position.q, activePlayer.position.r, "OBJECTIVE!", "text-accent");
                  // DOOM BONUS for kill objective completion (pressure-based doom)
                  const doomBonus = state.activeScenario?.doomOnObjectiveComplete ?? 1;
                  if (doomBonus > 0) {
                    addToLog(`Your progress weakens the darkness! (+${doomBonus} doom)`);
                    setState(prev => ({
                      ...prev,
                      doom: Math.min(prev.activeScenario?.startDoom || 15, prev.doom + doomBonus)
                    }));
                  }
                }
              }
            }
          }

          setState(prev => ({
            ...prev,
            enemies: prev.enemies.map(e => e.id === enemy.id ? { ...e, hp: newEnemyHp, isDying: isKilled } : e).filter(e => e.hp > 0),
            players: prev.players.map((p, i) => i === prev.activePlayerIndex ? { ...p, actions: p.actions - 1 } : p),
            lastDiceRoll: null,
            activeCombat: null,
            selectedEnemyId: isKilled ? null : prev.selectedEnemyId,
            // Update game stats for attack
            gameStats: prev.gameStats ? {
              ...prev.gameStats,
              totalDamageDealt: prev.gameStats.totalDamageDealt + damage,
              enemiesKilled: isKilled ? prev.gameStats.enemiesKilled + 1 : prev.gameStats.enemiesKilled,
              bossesDefeated: isKilled && isEliteOrBoss ? [...prev.gameStats.bossesDefeated, enemy.name] : prev.gameStats.bossesDefeated,
              criticalHits: criticalHit ? prev.gameStats.criticalHits + 1 : prev.gameStats.criticalHits
            } : undefined
          }));
        } else {
          addToLog(`BOMMERT! ${activePlayer.name} treffer ikke ${enemy.name}.`);
          setState(prev => ({
            ...prev,
            players: prev.players.map((p, i) => i === prev.activePlayerIndex ? { ...p, actions: p.actions - 1 } : p),
            lastDiceRoll: null,
            activeCombat: null,
            // Track misses in stats
            gameStats: prev.gameStats ? {
              ...prev.gameStats,
              criticalMisses: criticalMiss ? prev.gameStats.criticalMisses + 1 : prev.gameStats.criticalMisses
            } : undefined
          }));
        }
      }
    } else {
      // Investigation roll
      if (successes > 0) {
        // Check if player is on an illuminated dark room with items to find
        const currentTile = state.board.find(t =>
          t.q === activePlayer.position.q && t.r === activePlayer.position.r
        );
        const darkRoomContent = currentTile?.darkRoomIlluminated && currentTile?.darkRoomContent;
        const hasDarkRoomLoot = darkRoomContent &&
          darkRoomContent.requiresSearch &&
          darkRoomContent.items &&
          darkRoomContent.items.length > 0;

        let itemToFind: Item | null = null;

        if (hasDarkRoomLoot && darkRoomContent) {
          // Find item from dark room loot table
          const itemId = darkRoomContent.items[0];
          // Look up item in loot tables
          for (const [tableKey, items] of Object.entries(DARK_ROOM_LOOT_TABLES)) {
            const found = items.find(item => item.id === itemId);
            if (found) {
              itemToFind = found as Item;
              break;
            }
          }
          // If not in loot tables, check regular items
          if (!itemToFind) {
            itemToFind = ITEMS.find(item => item.id === itemId) || null;
          }
          // Fall back to random loot table item
          if (!itemToFind && itemId.startsWith('random_')) {
            const tableKey = itemId as keyof typeof DARK_ROOM_LOOT_TABLES;
            const tableItems = DARK_ROOM_LOOT_TABLES[tableKey];
            if (tableItems) {
              itemToFind = tableItems[Math.floor(Math.random() * tableItems.length)] as Item;
            }
          }
        }

        // Use dark room item or random item
        const randomItem = itemToFind || ITEMS[Math.floor(Math.random() * ITEMS.length)];

        // Use new inventory slot system
        if (isInventoryFull(activePlayer.inventory)) {
          addToLog(`FUNNET: ${randomItem.name}! Men inventaret er fullt.`);
          addFloatingText(activePlayer.position.q, activePlayer.position.r, "INVENTORY FULL!", "text-muted-foreground");
          setState(prev => ({
            ...prev,
            players: prev.players.map((p, i) => i === prev.activePlayerIndex ? { ...p, actions: p.actions - 1 } : p),
            lastDiceRoll: null
          }));
        } else {
          const equipResult = equipItem(activePlayer.inventory, randomItem);
          const darkRoomMessage = hasDarkRoomLoot ? " fra skjulestedet i mørket" : "";
          addToLog(`FUNNET: ${randomItem.name}${darkRoomMessage}!`);
          addFloatingText(activePlayer.position.q, activePlayer.position.r, "GJENSTAND FUNNET", "text-accent");

          // If found from dark room, mark the content as collected
          let boardUpdate = (board: Tile[]) => board;
          if (hasDarkRoomLoot && currentTile) {
            boardUpdate = (board: Tile[]) => board.map(t =>
              t.q === currentTile.q && t.r === currentTile.r && t.darkRoomContent
                ? { ...t, darkRoomContent: { ...t.darkRoomContent, items: [], requiresSearch: false } }
                : t
            );
          }

          setState(prev => ({
            ...prev,
            board: boardUpdate(prev.board),
            players: prev.players.map((p, i) => i === prev.activePlayerIndex ? {
              ...p,
              inventory: equipResult.newInventory,
              actions: p.actions - 1
            } : p),
            lastDiceRoll: null
          }));
        }
      } else {
        addToLog(`INGENTING FUNNET.`);
        setState(prev => ({
          ...prev,
          players: prev.players.map((p, i) => i === prev.activePlayerIndex ? { ...p, actions: p.actions - 1 } : p),
          lastDiceRoll: null
        }));
      }
    }
  };

  // Helper function to find the next alive player index
  const findNextAlivePlayerIndex = (players: Player[], startIndex: number): number => {
    // First, check if there are any alive players at all
    const hasAlivePlayers = players.some(p => !p.isDead);
    if (!hasAlivePlayers) return -1; // No alive players

    // Search from startIndex to end
    for (let i = startIndex; i < players.length; i++) {
      if (!players[i].isDead) return i;
    }
    // If not found, return -1 (means end of round)
    return -1;
  };

  const handleNextTurn = () => {
    // Find next alive player starting from the player after current
    const nextAliveIndex = findNextAlivePlayerIndex(state.players, state.activePlayerIndex + 1);
    const isEndOfRound = nextAliveIndex === -1;

    if (isEndOfRound) {
      // Check if game should end before transitioning
      const newDoom = state.doom - 1;
      if (newDoom <= 0) {
        addToLog("The doom counter has reached zero. The Old Ones stir...");
        setGameOverType('defeat_doom');
        setState(prev => ({ ...prev, phase: GamePhase.GAME_OVER, doom: 0 }));
        return;
      }

      // Show Mythos phase overlay
      setShowMythosOverlay(true);
    } else {
      // Apply madness turn start effects to next alive player
      setState(prev => {
        const nextPlayer = prev.players[nextAliveIndex];
        if (nextPlayer && nextPlayer.activeMadness) {
          const updatedPlayers = [...prev.players];
          updatedPlayers[nextAliveIndex] = applyMadnessTurnStartEffects(nextPlayer);
          return { ...prev, activePlayerIndex: nextAliveIndex, activeSpell: null, activeOccultistSpell: null, players: updatedPlayers };
        }
        return { ...prev, activePlayerIndex: nextAliveIndex, activeSpell: null, activeOccultistSpell: null };
      });
    }
  };

  const handleMythosOverlayComplete = () => {
    setShowMythosOverlay(false);

    // 1. Calculate new round
    const newRound = state.round + 1;

    // 2. Update survival objectives
    let updatedScenario = state.activeScenario;
    let survivalDoomBonus = 0;
    if (state.activeScenario) {
      updatedScenario = updateSurvivalObjectives(state.activeScenario, newRound);

      // Log newly completed survival objectives
      const { newlyCompletedObjectives } = findNewlyCompletedSurvivalObjectives(
        updatedScenario,
        state.activeScenario
      );
      newlyCompletedObjectives.forEach(obj => {
        addToLog(`OBJECTIVE COMPLETE: ${obj.shortDescription}`);
        // DOOM BONUS for survival objective completion (pressure-based doom)
        const doomBonus = state.activeScenario?.doomOnObjectiveComplete ?? 1;
        if (doomBonus > 0) {
          addToLog(`Your perseverance weakens the darkness! (+${doomBonus} doom)`);
          survivalDoomBonus += doomBonus;
        }
      });
    }

    // 3. Calculate doom with dark insight penalty (using new configurable system)
    const doomResult = calculateDoomWithDarkInsightPenalty(
      state.doom,
      state.players,
      state.activeScenario,
      newRound
    );
    // Add survival objective doom bonus to final doom calculation
    const maxDoom = state.activeScenario?.startDoom || 15;
    const newDoom = Math.min(maxDoom, Math.max(0, doomResult.newDoom + survivalDoomBonus));

    // Log doom changes based on new pressure-based system
    if (doomResult.baseDoomTick < 0) {
      addToLog(`DOOM: The darkness grows closer... (${doomResult.baseDoomTick} doom)`);
    }

    // Log dark insight effects
    if (doomResult.darkInsightPenalty > 0) {
      doomResult.affectedPlayers.forEach(p => {
        addToLog(`${p.name}'s dark insight accelerates the doom! (-1 extra doom)`);
        addFloatingText(p.position.q, p.position.r, "-1 DOOM", "text-danger");
      });
    }

    // 4. Process weather for new round
    const weatherResult = processWeatherForNewRound(state.weatherState, newDoom);
    const newWeatherState = weatherResult.weatherState;

    // Log weather changes
    if (weatherResult.weatherMessage) {
      addToLog(weatherResult.weatherMessage);
    }

    // 5. Check victory conditions
    if (updatedScenario) {
      const victoryResult = checkVictoryConditions(updatedScenario, {
        players: state.players,
        enemies: state.enemies,
        board: state.board,
        round: newRound,
        doom: newDoom,
        questItemsCollected: state.questItemsCollected,
        survivors: state.survivors
      });

      if (victoryResult.isVictory) {
        playSound('victory');
        addToLog(victoryResult.message);
        setGameOverType('victory');
        setState(prev => ({
          ...prev,
          phase: GamePhase.GAME_OVER,
          doom: newDoom,
          round: newRound,
          activeScenario: updatedScenario,
          weatherState: newWeatherState
        }));
        return;
      }

      // 6. Check defeat conditions
      const defeatResult = checkDefeatConditions(updatedScenario, {
        players: state.players,
        doom: newDoom,
        round: newRound,
        survivors: state.survivors
      });

      if (defeatResult.isDefeat) {
        playSound('defeat');
        addToLog(defeatResult.message);
        setGameOverType(defeatResult.condition?.type === 'doom_zero' ? 'defeat_doom' : 'defeat_death');
        setState(prev => ({
          ...prev,
          phase: GamePhase.GAME_OVER,
          doom: newDoom,
          round: newRound,
          activeScenario: updatedScenario,
          weatherState: newWeatherState
        }));
        return;
      }
    }

    // 7. Transition to next round - find first alive player
    let firstAliveIndex = 0;
    for (let i = 0; i < state.players.length; i++) {
      if (!state.players[i].isDead) {
        firstAliveIndex = i;
        break;
      }
    }

    setState(prev => ({
      ...prev,
      phase: GamePhase.MYTHOS,
      activePlayerIndex: firstAliveIndex,
      doom: newDoom,
      round: newRound,
      activeSpell: null,
      activeOccultistSpell: null,
      activeScenario: updatedScenario,
      weatherState: newWeatherState
    }));
  };

  const activePlayer = state.players[state.activePlayerIndex] || null;
  const selectedEnemy = state.enemies.find(e => e.id === state.selectedEnemyId);

  const handleResetData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState(DEFAULT_STATE);
    setIsMainMenuOpen(true);
  };

  const handleGameOverRestart = () => {
    setGameOverType(null);
    setSelectedLegacyHeroIds([]);
    setHeroKillCounts({});
    setState(prev => ({
      ...DEFAULT_STATE,
      activeScenario: prev.activeScenario,
      phase: GamePhase.SETUP
    }));
  };

  const handleGameOverMainMenu = () => {
    // Process scenario completion before going to main menu
    const victory = gameOverType === 'victory';
    const hasSurvivors = state.players.some(p => !p.isDead);

    // CRITICAL: Always process scenario completion for legacy heroes
    // This handles permadeath - dead heroes MUST be marked as isDead via killHero()
    // Previous bug: (victory || hasSurvivors) condition prevented killHero from being
    // called when all players died, so permadeath heroes were never marked dead
    if (selectedLegacyHeroIds.length > 0) {
      handleScenarioComplete(victory);
    }

    setGameOverType(null);
    setState(DEFAULT_STATE);
    setIsMainMenuOpen(true);
    setMainMenuView('title');
  };

  return (
    <div className={`h-screen w-screen bg-background text-foreground overflow-hidden select-none font-serif relative transition-all duration-1000 ${state.screenShake && !settings.reduceMotion ? 'animate-shake' : ''} ${activePlayer?.activeMadness?.visualClass || ''}`}>
      {/* Options Menu */}
      <OptionsMenu
        isOpen={isOptionsOpen}
        onClose={() => setIsOptionsOpen(false)}
        settings={settings}
        onSettingsChange={setSettings}
        onResetData={handleResetData}
      />

      {/* Advanced Visual Effects (GPU-accelerated) - only load when enabled */}
      {settings.advancedParticles && settings.particles && (
        <Suspense fallback={null}>
          <AdvancedParticles
            enabled={true}
            quality={settings.effectsQuality}
          />
        </Suspense>
      )}

      {/* WebGL Shader Effects - only load when enabled */}
      {settings.shaderEffects && (
        <Suspense fallback={null}>
          <ShaderEffects
            enabled={true}
            quality={settings.effectsQuality}
            sanityLevel={activePlayer && CHARACTERS[activePlayer.character] ? activePlayer.sanity / (CHARACTERS[activePlayer.character].maxSanity || 4) : 1}
            doomLevel={state.activeScenario ? (state.activeScenario.doom.max - state.doom) / state.activeScenario.doom.max : 0}
          />
        </Suspense>
      )}

      {isMainMenuOpen && mainMenuView === 'title' && (
        <MainMenu
          onNewGame={() => {
            setSelectedLegacyHeroIds([]);
            setState({ ...DEFAULT_STATE, phase: GamePhase.SETUP });
            setIsMainMenuOpen(false);
          }}
          onContinue={() => setIsMainMenuOpen(false)}
          onOptions={() => setIsOptionsOpen(true)}
          canContinue={state.phase !== GamePhase.SETUP}
          version={APP_VERSION}
          // Legacy system buttons
          onHeroArchive={() => setMainMenuView('heroArchive')}
          onStash={() => setMainMenuView('stash')}
          onSaveLoad={() => {
            setIsMainMenuOpen(false);
            setShowSaveLoadModal(true);
          }}
          heroCount={getLivingHeroes(legacyData).length}
          stashCount={legacyData.stash.items.length}
          // Quest Editor and Custom Quest
          onQuestEditor={() => setMainMenuView('questEditor')}
          onCustomQuest={() => setMainMenuView('customQuest')}
          // Campaign Play
          onCampaignPlay={() => setMainMenuView('campaign')}
        />
      )}

      {isMainMenuOpen && mainMenuView === 'heroArchive' && (
        <HeroArchivePanel
          legacyData={legacyData}
          onSelectHero={handleSelectLegacyHero}
          onCreateHero={handleCreateLegacyHero}
          onUpdateHero={handleUpdateLegacyHero}
          onBack={() => setMainMenuView('title')}
          onStartNewGame={() => {
            // Navigate to scenario selection with selected heroes
            setMainMenuView('title');
            setState(prev => ({ ...prev, phase: GamePhase.SETUP, activeScenario: null }));
            setIsMainMenuOpen(false);
          }}
          maxHeroesSelectable={4}
          selectedHeroIds={selectedLegacyHeroIds}
        />
      )}

      {/* Quest Editor */}
      {isMainMenuOpen && mainMenuView === 'questEditor' && (
        <QuestEditor
          onBack={() => setMainMenuView('title')}
        />
      )}

      {/* Custom Quest Loader */}
      {isMainMenuOpen && mainMenuView === 'customQuest' && (
        <CustomQuestLoader
          onClose={() => setMainMenuView('title')}
          onStartQuest={(scenario, tiles) => {
            // Start custom quest with the converted scenario
            setState(prev => ({
              ...DEFAULT_STATE,
              phase: GamePhase.SETUP,
              activeScenario: scenario,
              board: tiles,
            }));
            setMainMenuView('title');
            setIsMainMenuOpen(false);
          }}
        />
      )}

      {/* Campaign Play Manager */}
      {isMainMenuOpen && mainMenuView === 'campaign' && (
        <CampaignPlayManager
          legacyData={legacyData}
          onBack={() => setMainMenuView('title')}
          onStartQuest={(questId, campaign, progress) => {
            // Load the quest and start it
            try {
              const savedQuests = localStorage.getItem('quest_editor_quests');
              if (savedQuests) {
                const quests = JSON.parse(savedQuests);
                const quest = quests.find((q: any) => q.id === questId);
                if (quest) {
                  // Convert quest to scenario and tiles
                  const { scenario, tiles } = convertQuestToScenario(quest);

                  // Store campaign context for post-quest handling
                  localStorage.setItem('active_campaign_context', JSON.stringify({ campaign, progress }));

                  setState(prev => ({
                    ...DEFAULT_STATE,
                    phase: GamePhase.SETUP,
                    activeScenario: scenario,
                    board: tiles,
                  }));
                  setMainMenuView('title');
                  setIsMainMenuOpen(false);
                }
              }
            } catch (error) {
              console.error('Failed to start campaign quest:', error);
            }
          }}
          onSelectHeroes={(heroes) => {
            setSelectedLegacyHeroIds(heroes.map(h => h.id));
          }}
          onOpenMerchant={(heroes, sharedGold) => {
            // Open merchant with campaign heroes
            setSelectedLegacyHeroIds(heroes.map(h => h.id));
            setShowMerchantShop(true);
          }}
          onUpdateLegacyData={(data) => {
            setLegacyData(data);
            saveLegacyData(data);
          }}
        />
      )}

      {/* Equipment Stash Panel */}
      {(mainMenuView === 'stash' || showStashPanel) && (
        <EquipmentStashPanel
          stash={legacyData.stash}
          heroes={getLivingHeroes(legacyData)}
          onStashUpdate={(stash) => setLegacyData(prev => ({ ...prev, stash }))}
          onHeroUpdate={handleUpdateLegacyHero}
          onClose={() => {
            setMainMenuView('title');
            setShowStashPanel(false);
          }}
        />
      )}

      {/* Merchant Shop after scenario completion */}
      {showMerchantShop && (
        <MerchantShop
          heroes={getLivingHeroes(legacyData).filter(h =>
            selectedLegacyHeroIds.includes(h.id) && !h.isDead
          )}
          stash={legacyData.stash}
          scenarioResult={lastScenarioResult || undefined}
          onHeroUpdate={handleUpdateLegacyHero}
          onStashUpdate={(stash) => setLegacyData(prev => ({ ...prev, stash }))}
          onFinish={handleMerchantFinish}
        />
      )}

      {state.phase === GamePhase.SETUP && !isMainMenuOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center p-8 bg-background overflow-y-auto">
          {!state.activeScenario ? (
            <div className="bg-card p-12 rounded-2xl border-2 border-primary shadow-[var(--shadow-doom)] max-w-4xl w-full text-center">
              <div className="flex justify-between items-center mb-8 border-b border-border pb-4">
                <button onClick={() => setIsMainMenuOpen(true)} className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-xs uppercase tracking-widest transition-colors"><RotateCcw size={16} /> Back to Title</button>
                <h1 className="text-3xl font-display text-primary italic uppercase tracking-widest">New Case</h1>
              </div>

              {/* Difficulty Selection */}
              <div className="mb-8">
                <h2 className="text-xl text-muted-foreground mb-6 uppercase tracking-wider">Select Difficulty</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Normal Difficulty */}
                  <button
                    onClick={() => {
                      const scenario = getRandomScenario('Normal');
                      setSelectedDifficulty('Normal');
                      setState(prev => ({ ...prev, activeScenario: scenario }));
                    }}
                    className="p-6 bg-background border-2 border-emerald-700 hover:border-emerald-500 rounded-xl text-center transition-all group hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                  >
                    <div className="text-4xl mb-3">&#9733;&#9733;</div>
                    <h3 className="text-2xl font-bold text-emerald-400 mb-2">Normal</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                      Standard difficulty. Good for learning the game mechanics.
                    </p>
                    <div className="text-xs text-emerald-500 font-mono">
                      9 mission types &times; endless combinations
                    </div>
                  </button>

                  {/* Hard Difficulty */}
                  <button
                    onClick={() => {
                      const scenario = getRandomScenario('Hard');
                      setSelectedDifficulty('Hard');
                      setState(prev => ({ ...prev, activeScenario: scenario }));
                    }}
                    className="p-6 bg-background border-2 border-amber-700 hover:border-amber-500 rounded-xl text-center transition-all group hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                  >
                    <div className="text-4xl mb-3">&#9733;&#9733;&#9733;</div>
                    <h3 className="text-2xl font-bold text-amber-400 mb-2">Hard</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                      Challenging scenarios. Requires strategic thinking and teamwork.
                    </p>
                    <div className="text-xs text-amber-500 font-mono">
                      Stronger enemies &amp; tougher bosses
                    </div>
                  </button>

                  {/* Nightmare Difficulty */}
                  <button
                    onClick={() => {
                      const scenario = getRandomScenario('Nightmare');
                      setSelectedDifficulty('Nightmare');
                      setState(prev => ({ ...prev, activeScenario: scenario }));
                    }}
                    className="p-6 bg-background border-2 border-red-700 hover:border-red-500 rounded-xl text-center transition-all group hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                  >
                    <div className="text-4xl mb-3">&#9733;&#9733;&#9733;&#9733;</div>
                    <h3 className="text-2xl font-bold text-red-400 mb-2">Nightmare</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                      Brutal difficulty. Only for experienced investigators.
                    </p>
                    <div className="text-xs text-red-500 font-mono">
                      Cosmic horrors await
                    </div>
                  </button>
                </div>
              </div>

              {/* Scenario Pool Info */}
              <div className="border-t border-border pt-6">
                <p className="text-xs text-muted-foreground italic">
                  Each case is dynamically generated from element pools.
                  <br />
                  9 mission types &bull; 23 locations &bull; 100+ unique combinations
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-card p-12 rounded-2xl border-2 border-primary shadow-[var(--shadow-doom)] max-w-5xl w-full text-center">
              <div className="flex justify-between items-center mb-8 border-b border-border pb-4">
                <button onClick={() => {
                  setSelectedDifficulty(null);
                  setState(prev => ({ ...prev, activeScenario: null, players: [] }));
                }} className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-xs uppercase tracking-widest transition-colors"><ArrowLeft size={16} /> Back</button>
                <h1 className="text-2xl font-display text-primary uppercase tracking-[0.2em]">{state.activeScenario.title}</h1>
              </div>

              {/* Show selected difficulty and scenario info */}
              <div className="mb-6 p-4 bg-background/50 border border-border rounded-lg">
                <div className="flex items-center justify-center gap-4 text-sm mb-3">
                  <span className={`px-3 py-1 rounded-full border ${
                    selectedDifficulty === 'Normal' ? 'border-emerald-500 text-emerald-400' :
                    selectedDifficulty === 'Hard' ? 'border-amber-500 text-amber-400' :
                    selectedDifficulty === 'Nightmare' ? 'border-red-500 text-red-400' :
                    'border-border text-muted-foreground'
                  }`}>
                    {selectedDifficulty || state.activeScenario.difficulty}
                  </span>
                  <span className="text-muted-foreground">|</span>
                  <span className={`px-3 py-1 rounded-full border border-primary/50 text-primary`}>
                    {state.activeScenario.victoryType.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="text-center mb-3">
                  <p className="text-xs text-muted-foreground italic">{state.activeScenario.description}</p>
                </div>
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <span>Start: {state.activeScenario.startLocation}</span>
                  <span className="text-primary">|</span>
                  <span>Doom: {state.activeScenario.startDoom}</span>
                  <span className="text-primary">|</span>
                  <span>{state.activeScenario.estimatedTime}</span>
                </div>
                {/* Re-roll button */}
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={() => {
                      if (selectedDifficulty) {
                        const newScenario = getRandomScenario(selectedDifficulty);
                        setState(prev => ({ ...prev, activeScenario: newScenario, players: [] }));
                      }
                    }}
                    className="px-4 py-2 text-xs uppercase tracking-wider border border-primary/50 rounded-lg text-primary hover:bg-primary/10 transition-colors flex items-center gap-2"
                  >
                    <RotateCcw size={14} />
                    Generate New Case
                  </button>
                </div>
              </div>

              {/* Mode selection tabs */}
              <div className="flex justify-center gap-4 mb-8">
                <button
                  onClick={() => {
                    setSelectedLegacyHeroIds([]);
                    setState(prev => ({ ...prev, players: [] }));
                  }}
                  className={`px-6 py-3 rounded-lg border-2 transition-all ${
                    selectedLegacyHeroIds.length === 0
                      ? 'border-primary bg-primary/20 text-primary'
                      : 'border-border text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  <Users size={20} className="inline mr-2" />
                  Classic Mode
                  <span className="block text-xs opacity-70">New investigators each game</span>
                </button>
                <button
                  onClick={() => {
                    setState(prev => ({ ...prev, players: [] }));
                    setMainMenuView('heroArchive');
                    setIsMainMenuOpen(true);
                  }}
                  className={`px-6 py-3 rounded-lg border-2 transition-all ${
                    selectedLegacyHeroIds.length > 0
                      ? 'border-amber-500 bg-amber-500/20 text-amber-400'
                      : 'border-border text-muted-foreground hover:border-amber-500/50'
                  }`}
                >
                  <Package size={20} className="inline mr-2" />
                  Legacy Mode
                  <span className="block text-xs opacity-70">Persistent heroes with XP & gold</span>
                </button>
              </div>

              {/* Selected Legacy Heroes */}
              {selectedLegacyHeroIds.length > 0 && (
                <div className="mb-8 p-4 bg-amber-900/20 border border-amber-700 rounded-xl">
                  <h3 className="text-amber-400 font-bold mb-3">Selected Legacy Heroes ({selectedLegacyHeroIds.length}/4)</h3>
                  <div className="flex justify-center gap-4 flex-wrap">
                    {selectedLegacyHeroIds.map(heroId => {
                      const hero = legacyData.heroes.find(h => h.id === heroId);
                      if (!hero) return null;
                      return (
                        <div key={heroId} className="px-4 py-2 bg-amber-900/30 border border-amber-600 rounded-lg">
                          <span className="font-bold text-amber-200">{hero.name}</span>
                          <span className="text-xs text-amber-400 ml-2">Lv{hero.level} {hero.characterClass}</span>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => {
                      setMainMenuView('heroArchive');
                      setIsMainMenuOpen(true);
                    }}
                    className="mt-3 px-4 py-1 text-sm text-amber-400 hover:text-amber-300 underline"
                  >
                    Change Selection
                  </button>
                </div>
              )}

              {/* Classic mode character selection */}
              {selectedLegacyHeroIds.length === 0 && (
                <div className="mb-8">
                  {/* View detailed character selection button */}
                  <div className="flex justify-center mb-6">
                    <button
                      onClick={() => setShowCharacterSelection(true)}
                      className="px-6 py-3 bg-primary/10 border-2 border-primary rounded-xl text-primary hover:bg-primary/20 transition-all flex items-center gap-2"
                    >
                      <Users size={20} />
                      Open Character Selection
                      <span className="text-xs opacity-70 ml-2">(Detailed View)</span>
                    </button>
                  </div>

                  {/* Quick selection grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {(Object.keys(CHARACTERS) as CharacterType[]).map(type => {
                      const isSelected = !!state.players.find(p => p.id === type);
                      return (
                        <button key={type} onClick={() => {
                          const char = CHARACTERS[type];

                          if (isSelected) {
                            // Deselect character
                            setState(prev => ({
                              ...prev,
                              players: prev.players.filter(p => p.id !== type)
                            }));
                            return;
                          }

                          // For Occultist, show spell selection modal first
                          if (type === 'occultist') {
                            setPendingOccultistCharacter(type);
                            setShowSpellSelection(true);
                            return;
                          }

                          // Assign spells based on character class (Hero Quest style)
                          // Professor (Wizard) = Limited scholarly spells (True Sight, Mend Flesh)
                          const characterSpells = type === 'professor'
                            ? SPELLS.filter(s => s.id === 'reveal' || s.id === 'mend')
                            : [];

                          setState(prev => ({
                            ...prev,
                            players: [...prev.players, {
                              ...char,
                              position: { q: 0, r: 0 },
                              inventory: createEmptyInventory(),
                              spells: characterSpells,
                              selectedSpells: undefined,
                              actions: 2,
                              maxActions: 2,  // Base actions for non-legacy players
                              isDead: false,
                              madness: [],
                              activeMadness: null,
                              traits: []
                            }]
                          }));
                        }} className={`p-4 bg-background border-2 rounded-xl transition-all ${isSelected ? 'border-primary shadow-[var(--shadow-doom)] scale-105' : 'border-border opacity-60'}`}>
                          <div className="text-lg font-bold text-foreground uppercase tracking-tighter">{CHARACTERS[type].name}</div>
                          <div className="flex justify-center gap-4 text-xs font-bold mt-2">
                            <span className="text-health flex items-center gap-1"><Heart size={12} /> {CHARACTERS[type].hp}</span>
                            <span className="text-sanity flex items-center gap-1"><Brain size={12} /> {CHARACTERS[type].sanity}</span>
                          </div>
                          {type === 'occultist' && (
                            <div className="text-xs text-purple-400 mt-1">Select 3 Spells</div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Start button */}
              <button
                disabled={state.players.length === 0 && selectedLegacyHeroIds.length === 0}
                onClick={() => {
                  // If legacy mode, convert heroes to players first
                  if (selectedLegacyHeroIds.length > 0) {
                    handleStartGameWithLegacyHeroes();
                  }
                  setShowBriefing(true);
                }}
                className={`px-12 py-4 font-display text-2xl tracking-[0.3em] uppercase border-2 transition-all ${
                  (state.players.length > 0 || selectedLegacyHeroIds.length > 0)
                    ? 'bg-primary border-foreground text-primary-foreground shadow-[var(--shadow-doom)]'
                    : 'bg-muted border-border text-muted-foreground cursor-not-allowed'
                }`}
              >
                Assemble Team
              </button>
            </div>
          )}
        </div>
      )}

      {/* Scenario Briefing Popup */}
      {showBriefing && state.activeScenario && (
        <ScenarioBriefingPopup
          scenario={state.activeScenario}
          playerCount={state.players.length}
          onBegin={async () => {
            setShowBriefing(false);
            // Initialize audio system on game start (requires user interaction)
            await initializeAudio();
            playSound('success');
            // Initialize objective spawn state for quest items and tiles
            const objectiveSpawnState = initializeObjectiveSpawns(state.activeScenario!);
            // Initialize game stats for tracking performance
            const startDoom = state.activeScenario?.startDoom || 12;
            const initialGameStats = createInitialGameStats(state.players, startDoom);
            initialGameStats.totalObjectives = state.activeScenario?.objectives.length || 0;
            setState(prev => ({
              ...prev,
              phase: GamePhase.INVESTIGATOR,
              doom: startDoom,
              objectiveSpawnState,  // Track quest items and tiles
              gameStats: initialGameStats  // Track performance statistics
            }));
            addToLog("The investigation begins.");
            addToLog(`SCENARIO: ${state.activeScenario?.title}`);
            addToLog(`GOAL: ${state.activeScenario?.goal}`);
            // Log info about quest items to find
            if (objectiveSpawnState.questItems.length > 0) {
              addToLog(`Hints: ${objectiveSpawnState.questItems.length} key items must be found to complete your objectives.`);
            }
            spawnEnemy('cultist', 1, 0);
          }}
        />
      )}

      {state.phase !== GamePhase.SETUP && !isMainMenuOpen && (
        <>
          {/* Top Header Bar - Responsive */}
          <div className={`fixed ${isMobile ? 'top-2 left-2 right-2' : 'top-6 left-1/2 -translate-x-1/2 max-w-xl w-full'} z-50 flex items-center gap-2 md:gap-4`}>
            <TooltipProvider delayDuration={300}>
              <div className={`flex-1 bg-leather/90 border-2 border-primary ${isMobile ? 'rounded-xl p-2' : 'rounded-2xl p-4'} shadow-[var(--shadow-doom)] backdrop-blur-md text-center`}>
                <div className={`flex items-center justify-center ${isMobile ? 'gap-4' : 'gap-8'} ${isMobile ? 'text-[9px]' : 'text-[10px] md:text-xs'} font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] text-muted-foreground`}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="flex items-center gap-1 md:gap-2 cursor-help">
                        <History size={isMobile ? 12 : 14} /> R: <span className="text-foreground">{state.round}</span>
                        <Info size={isMobile ? 10 : 12} className="opacity-50 hover:opacity-100 transition-opacity" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs bg-card border-2 border-primary/50 p-3 shadow-[var(--shadow-doom)]">
                      <div className="space-y-1">
                        <p className="font-bold text-foreground flex items-center gap-2"><History size={14} /> Round Counter</p>
                        <p className="text-xs text-muted-foreground normal-case tracking-normal">Current game round. Each round, all investigators take their turns before the Mythos phase triggers. Some scenarios have time limits based on rounds.</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                  <span className={`${isMobile ? 'w-1 h-1' : 'w-1.5 h-1.5'} bg-primary rounded-full`}></span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="flex items-center gap-1 md:gap-2 cursor-help">
                        <Skull size={isMobile ? 12 : 14} /> D: <span className="text-primary">{state.doom}</span>
                        <Info size={isMobile ? 10 : 12} className="opacity-50 hover:opacity-100 transition-opacity" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs bg-card border-2 border-primary/50 p-3 shadow-[var(--shadow-doom)]">
                      <div className="space-y-1">
                        <p className="font-bold text-primary flex items-center gap-2"><Skull size={14} /> Doom Counter</p>
                        <p className="text-xs text-muted-foreground normal-case tracking-normal">The doom counter decreases each round. When it reaches 0, darkness consumes all and the game is lost. Some events may trigger at specific doom levels.</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </TooltipProvider>
            {/* Scenario Info Button */}
            {state.activeScenario && (
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setShowScenarioInfo(true)}
                      className={`bg-leather/90 border-2 border-primary ${isMobile ? 'rounded-lg p-2' : 'rounded-xl p-3'} text-primary transition-colors hover:bg-background/50 active:scale-95`}
                    >
                      <ScrollText size={isMobile ? 20 : 24} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-card border-2 border-primary/50 p-2 shadow-[var(--shadow-doom)]">
                    <p className="text-xs">View Mission Briefing</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <button onClick={() => setIsMainMenuOpen(true)} className={`bg-leather/90 border-2 border-primary ${isMobile ? 'rounded-lg p-2' : 'rounded-xl p-3'} text-primary transition-colors hover:bg-background/50 active:scale-95`}><Settings size={isMobile ? 20 : 24} /></button>
          </div>

          <div className="absolute inset-0 z-0">
            <GameBoard
              tiles={state.board}
              players={state.players}
              enemies={state.enemies}
              selectedEnemyId={state.selectedEnemyId}
              onTileClick={(q, r) => handleAction('move', { q, r })}
              onEnemyClick={(id) => handleAction('enemy_click', { id })}
              floatingTexts={state.floatingTexts}
              spellParticles={state.spellParticles}
              doom={state.doom}
              activeModifiers={state.activeModifiers}
              exploredTiles={new Set(state.exploredTiles || [])}
              weatherState={state.weatherState}
              activePlayerIndex={state.activePlayerIndex}
            />
          </div>

          {/* Character Panel - Fullscreen modal on mobile, slide-in on desktop */}
          {/* Only show if player exists and is NOT dead */}
          {activePlayer && !activePlayer.isDead && showLeftPanel && (
            isMobile ? (
              <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md overflow-y-auto">
                <div className="sticky top-0 z-10 flex items-center justify-between p-3 bg-leather/95 border-b border-border">
                  <h2 className="text-sm font-bold text-parchment uppercase tracking-wider">Character</h2>
                  <button onClick={() => setShowLeftPanel(false)} className="p-2 rounded-lg bg-card border border-border active:scale-95">
                    <X size={20} className="text-muted-foreground" />
                  </button>
                </div>
                <div className="p-3">
                  <CharacterPanel
                    player={activePlayer}
                    onUseItem={handleUseItem}
                    onUnequipItem={handleUnequipItem}
                    onEquipFromBag={handleEquipFromBag}
                    onDropItem={handleDropItem}
                    objectives={state.activeScenario?.objectives}
                  />
                </div>
              </div>
            ) : (
              <div className={`fixed top-1/2 -translate-y-1/2 left-6 h-[80vh] w-80 z-40 transition-all translate-x-0 opacity-100`}>
                <CharacterPanel
                  player={activePlayer}
                  onUseItem={handleUseItem}
                  onUnequipItem={handleUnequipItem}
                  onEquipFromBag={handleEquipFromBag}
                  onDropItem={handleDropItem}
                  objectives={state.activeScenario?.objectives}
                />
              </div>
            )
          )}

          {/* Desktop-only hidden state for character panel */}
          {activePlayer && !activePlayer.isDead && !showLeftPanel && !isMobile && (
            <div className="fixed top-1/2 -translate-y-1/2 left-6 h-[80vh] w-80 z-40 transition-all -translate-x-[calc(100%+40px)] opacity-0 pointer-events-none" />
          )}

          {/* Journal/Enemy Panel - Fullscreen modal on mobile, slide-in on desktop */}
          {showRightPanel && (
            isMobile ? (
              <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md overflow-y-auto">
                <div className="sticky top-0 z-10 flex items-center justify-between p-3 bg-leather/95 border-b border-border">
                  <h2 className="text-sm font-bold text-parchment uppercase tracking-wider flex items-center gap-2">
                    <ScrollText size={16} className="text-primary" />
                    {selectedEnemy ? 'Enemy Details' : 'Field Journal'}
                  </h2>
                  <button onClick={() => { setShowRightPanel(false); setState(prev => ({ ...prev, selectedEnemyId: null })); }} className="p-2 rounded-lg bg-card border border-border active:scale-95">
                    <X size={20} className="text-muted-foreground" />
                  </button>
                </div>
                <div className="p-3">
                  {selectedEnemy ? (
                    <EnemyPanel enemy={selectedEnemy} onClose={() => setState(prev => ({ ...prev, selectedEnemyId: null }))} />
                  ) : (
                    <div className="space-y-3">
                      {state.log.map((entry, i) => (
                                        <div key={i} className={`text-sm font-serif italic leading-relaxed border-b border-border/30 pb-2 ${getLogCategoryClasses(entry.category)}`}>
                                          <span className="text-muted-foreground/50">[{entry.timestamp}]</span> {entry.message}
                                        </div>
                                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className={`fixed top-1/2 -translate-y-1/2 right-6 h-[80vh] w-80 z-40 transition-all translate-x-0 opacity-100`}>
                {selectedEnemy ? (
                  <EnemyPanel enemy={selectedEnemy} onClose={() => setState(prev => ({ ...prev, selectedEnemyId: null }))} />
                ) : (
                  <div className="bg-leather/95 border-2 border-primary rounded-2xl h-full flex flex-col overflow-hidden shadow-2xl">
                    <div className="p-4 border-b border-border bg-background/40 flex items-center gap-3">
                      <ScrollText size={18} className="text-primary" />
                      <h3 className="text-xs font-bold text-parchment uppercase tracking-[0.2em]">Field Journal</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
                      {state.log.map((entry, i) => (
                                        <div key={i} className={`text-sm font-serif italic leading-relaxed border-b border-border/30 pb-2 ${getLogCategoryClasses(entry.category)}`}>
                                          <span className="text-muted-foreground/50">[{entry.timestamp}]</span> {entry.message}
                                        </div>
                                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          )}

          {/* Desktop-only hidden state for right panel */}
          {!showRightPanel && !isMobile && (
            <div className="fixed top-1/2 -translate-y-1/2 right-6 h-[80vh] w-80 z-40 transition-all translate-x-[calc(100%+40px)] opacity-0 pointer-events-none" />
          )}

          {/* Footer Action Bar - Responsive */}
          <footer className={`fixed bottom-0 left-0 right-0 ${isMobile ? 'h-20 pb-2 px-2' : 'h-24 pb-4 px-4'} bg-gradient-to-t from-background to-transparent z-50 flex items-center justify-center gap-2 md:gap-4`}>
            <ActionBar
              onAction={handleAction}
              actionsRemaining={activePlayer?.actions || 0}
              isInvestigatorPhase={state.phase === GamePhase.INVESTIGATOR}
              spells={activePlayer?.spells || []}
              occultistSpells={activePlayer?.selectedSpells}
              activeSpell={state.activeSpell}
              activeOccultistSpell={state.activeOccultistSpell}
              showCharacter={showLeftPanel}
              onToggleCharacter={() => setShowLeftPanel(!showLeftPanel)}
              showInfo={showRightPanel}
              onToggleInfo={() => setShowRightPanel(!showRightPanel)}
              showFieldGuide={showFieldGuide}
              onToggleFieldGuide={() => setShowFieldGuide(!showFieldGuide)}
              contextAction={null}
            />
            <button
              onClick={handleNextTurn}
              disabled={activePlayer?.isDead}
              className={`${isMobile ? 'px-4 py-3 text-xs' : 'px-8 py-4'} bg-primary text-primary-foreground font-bold rounded-xl uppercase tracking-widest hover:scale-110 active:scale-95 transition-all shadow-[var(--shadow-doom)] disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isMobile
                ? (findNextAlivePlayerIndex(state.players, state.activePlayerIndex + 1) === -1 ? "End" : "Next")
                : (findNextAlivePlayerIndex(state.players, state.activePlayerIndex + 1) === -1 ? "End Round" : "Next Turn")
              }
            </button>
          </footer>
        </>
      )}

      {state.lastDiceRoll && <DiceRoller values={state.lastDiceRoll} onComplete={resolveDiceResult} />}

      {/* Context Action Bar */}
      {activeContextTarget && contextActions.length > 0 && activePlayer && (
        <ContextActionBar
          actions={contextActions}
          onActionSelect={handleContextAction}
          targetName={
            activeContextTarget.type === 'edge' ? 'Door' :
            activeContextTarget.type === 'obstacle' ? activeContextTarget.obstacle?.type.replace('_', ' ') || 'Obstacle' :
            activeContextTarget.type === 'object' ? activeContextTarget.object?.type.replace('_', ' ') || 'Object' :
            state.board.find(t => t.id === activeContextTarget.tileId)?.name || 'Area'
          }
          playerActions={activePlayer.actions}
        />
      )}

      {/* Mythos Phase Overlay */}
      <MythosPhaseOverlay
        isVisible={showMythosOverlay}
        onComplete={handleMythosOverlayComplete}
      />

      {/* Puzzle Modal - Supports multiple puzzle types */}
      {state.activePuzzle && (
        <PuzzleModal
          type={state.activePuzzle.type}
          difficulty={state.activePuzzle.difficulty}
          onSolve={handlePuzzleSolve}
          code={state.activePuzzle.code}
          symbols={state.activePuzzle.symbols}
          hint={state.activePuzzle.hint}
          playerClass={state.players[state.activePlayerIndex]?.id}
        />
      )}

      {/* Event Card Modal - Shows drawn event cards during MYTHOS phase */}
      {state.activeEvent && (
        <EventModal
          event={state.activeEvent}
          onResolve={handleEventResolve}
        />
      )}

      {/* Field Guide - Monster Bestiary */}
      {showFieldGuide && (
        <FieldGuidePanel
          encounteredEnemies={state.encounteredEnemies}
          onClose={() => setShowFieldGuide(false)}
        />
      )}

      {/* Occultist Spell Selection Modal (for new character creation) */}
      {showSpellSelection && pendingOccultistCharacter && (
        <SpellSelectionModal
          availableSpells={OCCULTIST_SPELLS}
          maxSelections={3}
          heroName={CHARACTERS[pendingOccultistCharacter].name}
          onConfirm={(selectedSpells: OccultistSpell[]) => {
            const char = CHARACTERS[pendingOccultistCharacter];
            setState(prev => ({
              ...prev,
              players: [...prev.players, {
                ...char,
                position: { q: 0, r: 0 },
                inventory: createEmptyInventory(),
                spells: [], // Legacy spells empty for Occultist with new system
                selectedSpells: selectedSpells, // New OccultistSpell system
                actions: 2,
                maxActions: 2,  // Base actions for non-legacy players
                isDead: false,
                madness: [],
                activeMadness: null,
                traits: []
              }]
            }));
            setShowSpellSelection(false);
            setPendingOccultistCharacter(null);
          }}
          onCancel={() => {
            setShowSpellSelection(false);
            setPendingOccultistCharacter(null);
          }}
        />
      )}

      {/* Legacy Occultist Spell Selection Modal (for legacy heroes) */}
      {showSpellSelection && pendingLegacyOccultists.length > 0 && !pendingOccultistCharacter && (
        <SpellSelectionModal
          availableSpells={OCCULTIST_SPELLS}
          maxSelections={3}
          heroName={pendingLegacyOccultists[currentLegacyOccultistIndex]?.name || 'The Occultist'}
          onConfirm={(selectedSpells: OccultistSpell[]) => {
            const currentOccultist = pendingLegacyOccultists[currentLegacyOccultistIndex];
            if (!currentOccultist) return;

            // Convert legacy hero to player with selected spells
            const newPlayer = legacyHeroToPlayer(currentOccultist);
            newPlayer.selectedSpells = selectedSpells;

            setState(prev => ({
              ...prev,
              players: [...prev.players, newPlayer]
            }));

            // Check if there are more occultists to process
            const nextIndex = currentLegacyOccultistIndex + 1;
            if (nextIndex < pendingLegacyOccultists.length) {
              // Move to next occultist
              setCurrentLegacyOccultistIndex(nextIndex);
            } else {
              // All occultists have selected spells, finish setup
              setShowSpellSelection(false);
              setPendingLegacyOccultists([]);
              setCurrentLegacyOccultistIndex(0);
              setMainMenuView('title');
            }
          }}
          onCancel={() => {
            // Cancel all - remove already added players and reset
            setState(prev => ({
              ...prev,
              players: prev.players.filter(p =>
                !pendingLegacyOccultists.some(o => o.id === p.heroId)
              )
            }));
            setShowSpellSelection(false);
            setPendingLegacyOccultists([]);
            setCurrentLegacyOccultistIndex(0);
          }}
        />
      )}

      {/* Level-Up Modal */}
      {showLevelUpModal && currentLevelUpHero && (
        <LevelUpModal
          hero={currentLevelUpHero}
          newLevel={levelUpQueue[0]?.newLevel || currentLevelUpHero.level + 1}
          onConfirm={handleLevelUpBonusSelect}
        />
      )}

      {/* Survivor Trait Modal (Permadeath Heroes) */}
      {showSurvivorTraitModal && currentSurvivorHero && (
        <SurvivorTraitModal
          hero={currentSurvivorHero}
          availableTraits={getAvailableSurvivorTraits(
            currentSurvivorHero.scenariosSurvivedStreak || 0,
            currentSurvivorHero.survivorTraits || []
          )}
          onConfirm={handleSurvivorTraitSelect}
          onSkip={handleSkipSurvivorTrait}
        />
      )}

      {/* Character Selection Screen */}
      {showCharacterSelection && (
        <CharacterSelectionScreen
          selectedPlayers={state.players}
          onSelectCharacter={(player: Player) => {
            setState(prev => ({
              ...prev,
              players: [...prev.players, player]
            }));
          }}
          onDeselectCharacter={(characterType: CharacterType) => {
            setState(prev => ({
              ...prev,
              players: prev.players.filter(p => p.id !== characterType)
            }));
          }}
          onConfirm={() => {
            setShowCharacterSelection(false);
          }}
          onBack={() => {
            setShowCharacterSelection(false);
          }}
          onOpenSpellSelection={(characterType: CharacterType) => {
            setPendingOccultistCharacter(characterType);
            setShowSpellSelection(true);
          }}
        />
      )}

      {/* Save/Load Modal */}
      <SaveLoadModal
        isOpen={showSaveLoadModal}
        onClose={() => setShowSaveLoadModal(false)}
        legacyData={legacyData}
        gameState={state}
        onLoadLegacyData={(data) => {
          setLegacyData(data);
          saveLegacyData(data);
        }}
        onLoadGameState={(loadedState) => {
          setState(prev => ({
            ...prev,
            ...loadedState
          }));
        }}
      />

      {/* Scenario Info Modal */}
      {showScenarioInfo && state.activeScenario && (
        <ScenarioInfoModal
          scenario={state.activeScenario}
          currentDoom={state.doom}
          currentRound={state.round}
          onClose={() => setShowScenarioInfo(false)}
        />
      )}

      {/* Game Over Overlay */}
      {gameOverType && (
        <GameOverOverlay
          type={gameOverType}
          scenarioTitle={state.activeScenario?.title}
          round={state.round}
          onRestart={handleGameOverRestart}
          onMainMenu={handleGameOverMainMenu}
          stats={state.gameStats}
          players={state.players}
          scenario={state.activeScenario}
          isLegacyMode={isLegacyMode}
        />
      )}
    </div>
  );
};

export default ShadowsGame;
