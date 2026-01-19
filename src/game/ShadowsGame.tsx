import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Skull, RotateCcw, ArrowLeft, Heart, Brain, Settings, History, ScrollText, Users, Package } from 'lucide-react';
import { GamePhase, GameState, Player, Tile, CharacterType, Enemy, EnemyType, Scenario, FloatingText, EdgeData, CombatState, TileCategory, ZoneLevel, createEmptyInventory, equipItem, getAllItems, isInventoryFull, ContextAction, ContextActionTarget, LegacyData, LegacyHero, ScenarioResult, HeroScenarioResult, canLevelUp } from './types';
import ContextActionBar from './components/ContextActionBar';
import { getContextActions, getDoorActions, getObstacleActions } from './utils/contextActions';
import { performSkillCheck } from './utils/combatUtils';
import { CHARACTERS, ITEMS, START_TILE, SCENARIOS, MADNESS_CONDITIONS, SPELLS, BESTIARY, INDOOR_LOCATIONS, OUTDOOR_LOCATIONS, INDOOR_CONNECTORS, OUTDOOR_CONNECTORS, getCombatModifier, SPAWN_CHANCES, validateTileConnection, selectRandomConnectableCategory, isDoorRequired, CATEGORY_ZONE_LEVELS, LOCATION_DESCRIPTIONS } from './constants';
import { hexDistance, findPath } from './hexUtils';
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
import HeroArchivePanel from './components/HeroArchivePanel';
import EquipmentStashPanel from './components/EquipmentStashPanel';
import MerchantShop from './components/MerchantShop';
import { performAttack, performHorrorCheck, calculateEnemyDamage, hasRangedWeapon, canAttackEnemy } from './utils/combatUtils';
import { processEnemyTurn, selectRandomEnemy, createEnemy, shouldSpawnMonster } from './utils/monsterAI';
import { checkVictoryConditions, checkDefeatConditions, updateObjectiveProgress, completeObjective, checkKillObjectives, checkExploreObjectives, updateSurvivalObjectives, getVisibleObjectives } from './utils/scenarioUtils';
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
  createDefaultLegacyData
} from './utils/legacyManager';
import { generateValidatedScenario, getScenarioValidationInfo } from './utils/scenarioGenerator';

const STORAGE_KEY = 'shadows_1920s_save';
const SETTINGS_KEY = 'shadows_1920s_settings';
const LEGACY_STORAGE_KEY = 'shadows_1920s_legacy';
const APP_VERSION = "1.0.0";

// Menu view modes for main menu
type MainMenuView = 'title' | 'heroArchive' | 'stash' | 'merchant';

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
  activeCombat: null,
  activePuzzle: null,
  selectedEnemyId: null,
  selectedTileId: null,
  activeScenario: null,
  activeModifiers: [],
  floatingTexts: [],
  screenShake: false,
  activeSpell: null,
  currentStepIndex: 0,
  questItemsCollected: [],
  exploredTiles: ['0,0'], // Start tile is always explored
  pendingHorrorChecks: []
};

const ROOM_SHAPES = {
  SMALL: [{ q: 0, r: 0 }],
  MEDIUM: [{ q: 0, r: 0 }, { q: 1, r: 0 }, { q: 0, r: 1 }, { q: 1, r: -1 }],
  LINEAR: [{ q: 0, r: 0 }, { q: 1, r: 0 }, { q: 2, r: 0 }]
};

const ShadowsGame: React.FC = () => {
  const [isMainMenuOpen, setIsMainMenuOpen] = useState(true);
  const [mainMenuView, setMainMenuView] = useState<MainMenuView>('title');
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [showLeftPanel, setShowLeftPanel] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [showMythosOverlay, setShowMythosOverlay] = useState(false);
  const [showBriefing, setShowBriefing] = useState(false);
  const [gameOverType, setGameOverType] = useState<GameOverType | null>(null);

  // Context Action state
  const [activeContextTarget, setActiveContextTarget] = useState<ContextActionTarget | null>(null);
  const [contextActions, setContextActions] = useState<ContextAction[]>([]);

  // Legacy System State
  const [legacyData, setLegacyData] = useState<LegacyData>(() => loadLegacyData());
  const [selectedLegacyHeroIds, setSelectedLegacyHeroIds] = useState<string[]>([]);
  const [showMerchantShop, setShowMerchantShop] = useState(false);
  const [showStashPanel, setShowStashPanel] = useState(false);
  const [lastScenarioResult, setLastScenarioResult] = useState<ScenarioResult | null>(null);
  const [heroKillCounts, setHeroKillCounts] = useState<Record<string, number>>({});

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
        return { ...parsed, floatingTexts: [], screenShake: false, activeSpell: null };
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

  useEffect(() => {
    if (state.phase === GamePhase.MYTHOS) {
      addToLog("Mythos-fasen vekkes. Eldgamle hjul snurrer i morket.");

      const runEnemyAI = async () => {
        // Use the new AI system
        const { updatedEnemies, attacks, messages } = processEnemyTurn(
          state.enemies,
          state.players,
          state.board
        );

        // Log AI messages
        messages.forEach(msg => addToLog(msg));

        // Process attacks
        let updatedPlayers = [...state.players];
        const combatModifier = getCombatModifier(state.doom);

        for (const { enemy, targetPlayer } of attacks) {
          const { hpDamage, sanityDamage, message } = calculateEnemyDamage(enemy, targetPlayer);
          const totalHpDamage = hpDamage + combatModifier.enemyDamageBonus;

          addToLog(message);
          addFloatingText(
            targetPlayer.position.q,
            targetPlayer.position.r,
            `-${totalHpDamage} HP${sanityDamage > 0 ? ` -${sanityDamage} SAN` : ''}`,
            "text-primary"
          );
          triggerScreenShake();

          updatedPlayers = updatedPlayers.map(p => {
            if (p.id === targetPlayer.id) {
              const newHp = Math.max(0, p.hp - totalHpDamage);
              const newSanity = Math.max(0, p.sanity - sanityDamage);
              const isDead = newHp <= 0;
              if (isDead) addToLog(`${p.name} har falt for morket...`);
              return checkMadness({ ...p, hp: newHp, sanity: newSanity, isDead });
            }
            return p;
          });
        }

        // Check for doom events
        checkDoomEvents(state.doom - 1);

        // Check for game over after enemy attacks
        const allDead = updatedPlayers.every(p => p.isDead);
        if (allDead) {
          setTimeout(() => {
            addToLog("All investigators have fallen. The darkness claims victory.");
            setGameOverType('defeat_death');
            setState(prev => ({
              ...prev,
              enemies: updatedEnemies.filter(e => e.hp > 0),
              phase: GamePhase.GAME_OVER,
              players: updatedPlayers
            }));
          }, 1200);
          return;
        }

        // Transition back to investigator phase after a delay
        setTimeout(() => {
          setState(prev => ({
            ...prev,
            enemies: updatedEnemies.filter(e => e.hp > 0),
            phase: GamePhase.INVESTIGATOR,
            activePlayerIndex: 0,
            players: updatedPlayers.map(p => ({ ...p, actions: p.isDead ? 0 : 2 }))
          }));
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
          const spawnType = event.targetId as EnemyType;
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
    setState(prev => ({ ...prev, log: [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev.log].slice(0, 50) }));
  };

  const triggerScreenShake = () => {
    setState(prev => ({ ...prev, screenShake: true }));
    setTimeout(() => setState(prev => ({ ...prev, screenShake: false })), 500);
  };

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

  const checkMadness = (player: Player) => {
    if (player.sanity <= 0 && !player.activeMadness) {
      const newMadness = MADNESS_CONDITIONS[Math.floor(Math.random() * MADNESS_CONDITIONS.length)];
      addToLog(`${player.name} has cracked. Madness sets in: ${newMadness.name}!`);
      addFloatingText(player.position.q, player.position.r, "MENTAL BREAK", "text-sanity");
      triggerScreenShake();
      return { ...player, sanity: Math.floor(player.maxSanity / 2), activeMadness: newMadness, madness: [...player.madness, newMadness.id] };
    }
    return player;
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
        questItemsCollected: state.questItemsCollected
      });

      if (victoryResult.isVictory) {
        addToLog(victoryResult.message);
        setGameOverType('victory');
        setState(prev => ({ ...prev, phase: GamePhase.GAME_OVER }));
        return true;
      }

      // Check defeat conditions using new system
      const defeatResult = checkDefeatConditions(state.activeScenario, {
        players,
        doom,
        round: state.round
      });

      if (defeatResult.isDefeat) {
        addToLog(defeatResult.message);
        setGameOverType(defeatResult.condition?.type === 'doom_zero' ? 'defeat_doom' : 'defeat_death');
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
      setState(prev => ({ ...prev, phase: GamePhase.GAME_OVER }));
      return true;
    }

    // Check if doom has reached 0
    if (doom <= 0) {
      addToLog("The doom counter has reached zero. The Old Ones stir...");
      setGameOverType('defeat_doom');
      setState(prev => ({ ...prev, phase: GamePhase.GAME_OVER }));
      return true;
    }

    return false;
  }, [state.activeScenario, state.enemies, state.board, state.round, state.questItemsCollected]);

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

    const players: Player[] = selectedHeroes.map(hero => legacyHeroToPlayer(hero));

    // Initialize kill counts tracking
    const initialKillCounts: Record<string, number> = {};
    selectedHeroes.forEach(hero => {
      initialKillCounts[hero.id] = 0;
    });
    setHeroKillCounts(initialKillCounts);

    setState(prev => ({
      ...prev,
      players
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

    // Calculate rewards
    const goldReward = calculateScenarioGoldReward(victory, difficulty, completedBonusObjectives);
    const xpReward = calculateScenarioXPReward(victory, difficulty, 0, completedBonusObjectives);

    // Build hero results
    const heroResults: HeroScenarioResult[] = state.players.map(player => {
      // Find the corresponding legacy hero
      const legacyHero = legacyData.heroes.find(h => {
        // Match by character class since player.id is the class type
        return !h.isDead && selectedLegacyHeroIds.includes(h.id);
      });

      const survived = !player.isDead;
      const killCount = heroKillCounts[legacyHero?.id || ''] || 0;

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
        heroId: legacyHero?.id || player.id,
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
    setLastScenarioResult(result);

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

    // Perform skill check if required
    if (action.skillCheck) {
      const result = performSkillCheck(
        activePlayer,
        action.skillCheck.skill,
        action.skillCheck.dc,
        action.skillCheck.bonusDice
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

  // Handle specific action effects (opening doors, etc.)
  const handleContextActionEffect = useCallback((action: ContextAction, success: boolean) => {
    if (!activeContextTarget || !success) return;

    const tile = state.board.find(t => t.id === activeContextTarget.tileId);
    if (!tile) return;

    switch (action.id) {
      case 'open_door':
      case 'use_key':
      case 'lockpick':
        if (activeContextTarget.edgeIndex !== undefined) {
          setState(prev => ({
            ...prev,
            board: prev.board.map(t => {
              if (t.id === tile.id) {
                const newEdges = [...t.edges] as [EdgeData, EdgeData, EdgeData, EdgeData, EdgeData, EdgeData];
                newEdges[activeContextTarget.edgeIndex!] = {
                  ...newEdges[activeContextTarget.edgeIndex!],
                  doorState: 'open'
                };
                return { ...t, edges: newEdges };
              }
              return t;
            })
          }));
        }
        break;

      case 'force_door':
      case 'break_barricade':
        if (activeContextTarget.edgeIndex !== undefined) {
          setState(prev => ({
            ...prev,
            board: prev.board.map(t => {
              if (t.id === tile.id) {
                const newEdges = [...t.edges] as [EdgeData, EdgeData, EdgeData, EdgeData, EdgeData, EdgeData];
                newEdges[activeContextTarget.edgeIndex!] = {
                  ...newEdges[activeContextTarget.edgeIndex!],
                  doorState: 'broken'
                };
                return { ...t, edges: newEdges };
              }
              return t;
            })
          }));
        }
        break;

      case 'close_door':
        if (activeContextTarget.edgeIndex !== undefined) {
          setState(prev => ({
            ...prev,
            board: prev.board.map(t => {
              if (t.id === tile.id) {
                const newEdges = [...t.edges] as [EdgeData, EdgeData, EdgeData, EdgeData, EdgeData, EdgeData];
                newEdges[activeContextTarget.edgeIndex!] = {
                  ...newEdges[activeContextTarget.edgeIndex!],
                  doorState: 'closed'
                };
                return { ...t, edges: newEdges };
              }
              return t;
            })
          }));
        }
        break;

      case 'clear_rubble':
      case 'extinguish':
        setState(prev => ({
          ...prev,
          board: prev.board.map(t =>
            t.id === tile.id ? { ...t, obstacle: undefined } : t
          )
        }));
        break;

      case 'search_tile':
      case 'search_books':
      case 'search_container':
      case 'search_rubble':
      case 'search_water':
      case 'search_statue':
        // Mark as searched and potentially give item
        setState(prev => ({
          ...prev,
          board: prev.board.map(t => {
            if (t.id === tile.id) {
              if (t.object) {
                return { ...t, searched: true, object: { ...t.object, searched: true } };
              }
              return { ...t, searched: true };
            }
            return t;
          })
        }));
        // Could add random item here
        break;
    }
  }, [activeContextTarget, state.board]);

  const spawnEnemy = useCallback((type: EnemyType, q: number, r: number) => {
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

    setState(prev => ({ ...prev, enemies: [...prev.enemies, newEnemy] }));
    addToLog(`A ${bestiary.name} emerges from the shadows!`);
  }, []);

  const spawnRoom = useCallback((startQ: number, startR: number, tileSet: 'indoor' | 'outdoor' | 'mixed') => {
    const roomId = `room-${Date.now()}`;
    const isConnector = Math.random() > 0.6;

    // Find adjacent tiles to determine valid category
    const adjacentTiles = state.board.filter(t => hexDistance({ q: t.q, r: t.r }, { q: startQ, r: startR }) === 1);
    const sourceCategory = adjacentTiles[0]?.category || (tileSet === 'indoor' ? 'foyer' : 'street');

    // Use tile connection validation to select appropriate category
    const newCategory = selectRandomConnectableCategory(
      sourceCategory as TileCategory,
      tileSet === 'indoor'
    );

    // Validate the connection
    const validation = validateTileConnection(sourceCategory as TileCategory, newCategory, false);

    // Select location pool based on validated category
    const getCategoryPool = (cat: TileCategory) => {
      switch (cat) {
        case 'nature': return OUTDOOR_LOCATIONS.filter((_, i) => i < 15);
        case 'urban': return OUTDOOR_LOCATIONS.filter((_, i) => i >= 15 && i < 35);
        case 'street': return OUTDOOR_CONNECTORS;
        case 'facade': return INDOOR_LOCATIONS.filter((_, i) => i < 14);
        case 'foyer': return INDOOR_LOCATIONS.filter((_, i) => i >= 14 && i < 24);
        case 'corridor': return INDOOR_CONNECTORS;
        case 'room': return INDOOR_LOCATIONS.filter((_, i) => i >= 24 && i < 49);
        case 'stairs': return INDOOR_LOCATIONS.filter((_, i) => i >= 49 && i < 59);
        case 'basement': return INDOOR_LOCATIONS.filter((_, i) => i >= 59 && i < 74);
        case 'crypt': return INDOOR_LOCATIONS.filter((_, i) => i >= 74);
        default: return tileSet === 'indoor' ? INDOOR_LOCATIONS : OUTDOOR_LOCATIONS;
      }
    };

    const pool = getCategoryPool(newCategory);
    const roomName = pool.length > 0
      ? pool[Math.floor(Math.random() * pool.length)]
      : (isConnector
        ? (tileSet === 'indoor' ? INDOOR_CONNECTORS : OUTDOOR_CONNECTORS)
        : (tileSet === 'indoor' ? INDOOR_LOCATIONS : OUTDOOR_LOCATIONS))[Math.floor(Math.random() * 10)];

    const shape = isConnector ? ROOM_SHAPES.LINEAR : ROOM_SHAPES.MEDIUM;

    // Get floor type based on category
    const getFloorType = (cat: TileCategory): 'wood' | 'cobblestone' | 'tile' | 'stone' | 'grass' | 'dirt' | 'water' | 'ritual' => {
      switch (cat) {
        case 'nature': return Math.random() > 0.5 ? 'grass' : 'dirt';
        case 'urban': case 'street': return 'cobblestone';
        case 'facade': case 'foyer': case 'corridor': case 'room': return 'wood';
        case 'stairs': return 'stone';
        case 'basement': return 'stone';
        case 'crypt': return Math.random() > 0.7 ? 'ritual' : 'stone';
        default: return 'wood';
      }
    };

    // Create edges based on tile connection validation
    const createEdges = (): [EdgeData, EdgeData, EdgeData, EdgeData, EdgeData, EdgeData] => {
      const edges: EdgeData[] = [];
      for (let i = 0; i < 6; i++) {
        // Check if this edge connects to an existing tile
        const edgeDirections = [
          { dq: 1, dr: 0 }, { dq: 1, dr: -1 }, { dq: 0, dr: -1 },
          { dq: -1, dr: 0 }, { dq: -1, dr: 1 }, { dq: 0, dr: 1 }
        ];
        const neighborQ = startQ + edgeDirections[i].dq;
        const neighborR = startR + edgeDirections[i].dr;
        const neighborTile = state.board.find(t => t.q === neighborQ && t.r === neighborR);

        if (neighborTile && neighborTile.category) {
          const edgeValidation = validateTileConnection(
            newCategory,
            neighborTile.category as TileCategory,
            false
          );
          if (edgeValidation.requiresDoor) {
            edges.push({ type: 'door', doorState: 'closed' });
          } else if (!edgeValidation.isValid) {
            edges.push({ type: 'wall' });
          } else {
            edges.push({ type: 'open' });
          }
        } else {
          edges.push({ type: 'open' });
        }
      }
      return edges as [EdgeData, EdgeData, EdgeData, EdgeData, EdgeData, EdgeData];
    };

    const newTiles: Tile[] = [];
    shape.forEach((offset, idx) => {
      const q = startQ + offset.q;
      const r = startR + offset.r;
      if (!state.board.some(t => t.q === q && t.r === r)) {
        newTiles.push({
          id: `tile-${Date.now()}-${Math.random()}`,
          q, r,
          name: roomName,
          type: isConnector ? 'street' : 'room',
          category: newCategory,
          zoneLevel: (CATEGORY_ZONE_LEVELS[newCategory] || 0) as ZoneLevel,
          floorType: getFloorType(newCategory),
          visibility: 'visible',
          edges: idx === 0 ? createEdges() : [
            { type: 'open' }, { type: 'open' }, { type: 'open' },
            { type: 'open' }, { type: 'open' }, { type: 'open' }
          ],
          roomId,
          explored: true,
          searchable: !isConnector && !['facade', 'street', 'nature'].includes(newCategory),
          searched: false
        });
      }
    });

    if (newTiles.length > 0) {
      setState(prev => ({ ...prev, board: [...prev.board, ...newTiles] }));
      addToLog(`UTFORSKET: ${roomName}. [${newCategory.toUpperCase()}]`);

      // Show atmospheric Lovecraftian description if available
      const locationDescription = LOCATION_DESCRIPTIONS[roomName];
      if (locationDescription) {
        addToLog(locationDescription);
      }

      // Check explore objectives
      if (state.activeScenario) {
        const tile = newTiles[0];
        const exploreCheck = checkExploreObjectives(state.activeScenario, roomName, tile.id);
        if (exploreCheck.objective) {
          const updatedScenario = exploreCheck.shouldComplete
            ? completeObjective(state.activeScenario, exploreCheck.objective.id)
            : updateObjectiveProgress(state.activeScenario, exploreCheck.objective.id, 1);

          setState(prev => ({ ...prev, activeScenario: updatedScenario }));

          if (exploreCheck.shouldComplete) {
            addToLog(`OBJECTIVE COMPLETE: ${exploreCheck.objective.shortDescription}`);
          }
        }
      }

      // Use new spawn system
      const tile = newTiles[0];
      const isFirstVisit = true; // New tiles are always first visit
      if (shouldSpawnMonster(tile, state.doom, state.enemies, isFirstVisit)) {
        const enemyType = selectRandomEnemy(tile.category, state.doom);
        if (enemyType) {
          // Spawn at a slight offset from player
          const spawnQ = startQ + (Math.random() > 0.5 ? 1 : -1);
          const spawnR = startR + (Math.random() > 0.5 ? 1 : 0);
          spawnEnemy(enemyType, spawnQ, spawnR);
        }
      }
    }
  }, [state.board, state.doom, state.enemies, spawnEnemy]);

  // Helper function to get edge index between two tiles
  const getEdgeIndexBetweenTiles = (from: { q: number; r: number }, to: { q: number; r: number }): number => {
    const dq = to.q - from.q;
    const dr = to.r - from.r;

    // Hex edge directions (pointy-top orientation)
    // 0: +q, 1: +q-r, 2: -r, 3: -q, 4: -q+r, 5: +r
    if (dq === 1 && dr === 0) return 0;
    if (dq === 1 && dr === -1) return 1;
    if (dq === 0 && dr === -1) return 2;
    if (dq === -1 && dr === 0) return 3;
    if (dq === -1 && dr === 1) return 4;
    if (dq === 0 && dr === 1) return 5;

    return -1; // Not adjacent
  };

  const handleAction = (actionType: string, payload?: any) => {
    const activePlayer = state.players[state.activePlayerIndex];
    if (!activePlayer || activePlayer.actions <= 0 || activePlayer.isDead || state.phase !== GamePhase.INVESTIGATOR) return;

    switch (actionType) {
      case 'move':
        const { q, r } = payload;
        const targetTile = state.board.find(t => t.q === q && t.r === r);

        // Check for blocking objects - show context menu
        if (targetTile?.object?.blocking) {
          setState(prev => ({ ...prev, selectedTileId: targetTile.id }));
          showContextActions(targetTile);
          addToLog(`PATH BLOCKED: ${targetTile.object.type}.`);
          return;
        }

        // Check for blocking obstacles - show context menu
        if (targetTile?.obstacle?.blocking) {
          setState(prev => ({ ...prev, selectedTileId: targetTile.id }));
          showContextActions(targetTile);
          addToLog(`PATH BLOCKED: ${targetTile.obstacle.type.replace('_', ' ')}.`);
          return;
        }

        // Check for closed/locked doors on the edge we're crossing
        if (targetTile) {
          // Calculate which edge we're crossing to reach this tile
          const sourcePos = activePlayer.position;
          const edgeIndex = getEdgeIndexBetweenTiles(sourcePos, { q, r });
          if (edgeIndex !== -1 && targetTile.edges[edgeIndex]) {
            const edge = targetTile.edges[edgeIndex];
            if (edge.type === 'door' && edge.doorState !== 'open' && edge.doorState !== 'broken') {
              setState(prev => ({ ...prev, selectedTileId: targetTile.id }));
              showContextActions(targetTile, edgeIndex);
              addToLog(`DOOR: ${edge.doorState || 'closed'}.`);
              return;
            }
          }
        }

        if (!targetTile) {
          spawnRoom(q, r, state.activeScenario?.tileSet || 'mixed');
        }
        // Mark tile and surrounding tiles as explored
        const newExplored = new Set(state.exploredTiles || []);
        newExplored.add(`${q},${r}`);
        // Also mark adjacent tiles as explored (visibility range)
        const adjacentOffsets = [
          { dq: 1, dr: 0 }, { dq: 1, dr: -1 }, { dq: 0, dr: -1 },
          { dq: -1, dr: 0 }, { dq: -1, dr: 1 }, { dq: 0, dr: 1 }
        ];
        adjacentOffsets.forEach(({ dq, dr }) => {
          newExplored.add(`${q + dq},${r + dr}`);
        });
        
        setState(prev => ({
          ...prev,
          players: prev.players.map((p, i) => i === prev.activePlayerIndex ? { ...p, position: { q, r }, actions: p.actions - 1 } : p),
          exploredTiles: Array.from(newExplored)
        }));
        break;

      case 'rest':
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

        // Check if can attack
        const isRanged = hasRangedWeapon(activePlayer);
        const { canAttack, reason } = canAttackEnemy(activePlayer, targetEnemy, isRanged);
        if (!canAttack) {
          addToLog(reason);
          return;
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

      case 'enemy_click':
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

          if (isKilled) {
            const bestiary = BESTIARY[enemy.type];
            addToLog(bestiary.defeatFlavor || `${enemy.name} er beseiret!`);
            addFloatingText(enemy.position.q, enemy.position.r, "DREPT!", "text-accent");

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
            selectedEnemyId: isKilled ? null : prev.selectedEnemyId
          }));
        } else {
          addToLog(`BOMMERT! ${activePlayer.name} treffer ikke ${enemy.name}.`);
          setState(prev => ({
            ...prev,
            players: prev.players.map((p, i) => i === prev.activePlayerIndex ? { ...p, actions: p.actions - 1 } : p),
            lastDiceRoll: null,
            activeCombat: null
          }));
        }
      }
    } else {
      // Investigation roll
      if (successes > 0) {
        const randomItem = ITEMS[Math.floor(Math.random() * ITEMS.length)];

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
          addToLog(`FUNNET: ${randomItem.name}!`);
          addFloatingText(activePlayer.position.q, activePlayer.position.r, "GJENSTAND FUNNET", "text-accent");
          setState(prev => ({
            ...prev,
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

  const handleNextTurn = () => {
    const nextIndex = state.activePlayerIndex + 1;
    const isEndOfRound = nextIndex >= state.players.length;

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
      setState(prev => ({ ...prev, activePlayerIndex: nextIndex, activeSpell: null }));
    }
  };

  const handleMythosOverlayComplete = () => {
    setShowMythosOverlay(false);

    // Update survival objectives based on new round
    const newRound = state.round + 1;
    let updatedScenario = state.activeScenario;

    if (state.activeScenario) {
      updatedScenario = updateSurvivalObjectives(state.activeScenario, newRound);

      // Check if any survival objective was just completed
      const survivalObjectives = updatedScenario.objectives.filter(
        obj => obj.type === 'survive' && obj.completed
      );
      const previouslyCompleted = state.activeScenario.objectives.filter(
        obj => obj.type === 'survive' && obj.completed
      );

      if (survivalObjectives.length > previouslyCompleted.length) {
        const newlyCompleted = survivalObjectives.find(
          obj => !previouslyCompleted.some(prev => prev.id === obj.id)
        );
        if (newlyCompleted) {
          addToLog(`OBJECTIVE COMPLETE: ${newlyCompleted.shortDescription}`);
        }
      }
    }

    setState(prev => ({
      ...prev,
      phase: GamePhase.MYTHOS,
      activePlayerIndex: 0,
      doom: prev.doom - 1,
      round: newRound,
      activeSpell: null,
      activeScenario: updatedScenario
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

    if (selectedLegacyHeroIds.length > 0 && (victory || hasSurvivors)) {
      // Process legacy rewards
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
          heroCount={getLivingHeroes(legacyData).length}
          stashCount={legacyData.stash.items.length}
        />
      )}

      {isMainMenuOpen && mainMenuView === 'heroArchive' && (
        <HeroArchivePanel
          legacyData={legacyData}
          onSelectHero={handleSelectLegacyHero}
          onCreateHero={handleCreateLegacyHero}
          onUpdateHero={handleUpdateLegacyHero}
          onBack={() => setMainMenuView('title')}
          maxHeroesSelectable={4}
          selectedHeroIds={selectedLegacyHeroIds}
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
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12">
                  {(Object.keys(CHARACTERS) as CharacterType[]).map(type => {
                    const isSelected = !!state.players.find(p => p.id === type);
                    return (
                      <button key={type} onClick={() => {
                        const char = CHARACTERS[type];
                        setState(prev => ({
                          ...prev,
                          players: isSelected ? prev.players.filter(p => p.id !== type) : [...prev.players, { ...char, position: { q: 0, r: 0 }, inventory: createEmptyInventory(), spells: (type === 'occultist' ? [SPELLS[0]] : []), actions: 2, isDead: false, madness: [], activeMadness: null, traits: [] }]
                        }));
                      }} className={`p-4 bg-background border-2 rounded-xl transition-all ${isSelected ? 'border-primary shadow-[var(--shadow-doom)] scale-105' : 'border-border opacity-60'}`}>
                        <div className="text-lg font-bold text-foreground uppercase tracking-tighter">{CHARACTERS[type].name}</div>
                        <div className="flex justify-center gap-4 text-xs font-bold mt-2">
                          <span className="text-health flex items-center gap-1"><Heart size={12} /> {CHARACTERS[type].hp}</span>
                          <span className="text-sanity flex items-center gap-1"><Brain size={12} /> {CHARACTERS[type].sanity}</span>
                        </div>
                      </button>
                    );
                  })}
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
          onBegin={() => {
            setShowBriefing(false);
            setState(prev => ({
              ...prev,
              phase: GamePhase.INVESTIGATOR,
              doom: prev.activeScenario?.startDoom || 12
            }));
            addToLog("The investigation begins.");
            addToLog(`SCENARIO: ${state.activeScenario?.title}`);
            addToLog(`GOAL: ${state.activeScenario?.goal}`);
            spawnEnemy('cultist', 1, 0);
          }}
        />
      )}

      {state.phase !== GamePhase.SETUP && !isMainMenuOpen && (
        <>
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl flex items-center gap-4">
            <div className="flex-1 bg-leather/90 border-2 border-primary rounded-2xl p-4 shadow-[var(--shadow-doom)] backdrop-blur-md text-center pointer-events-none">
              <div className="flex items-center justify-center gap-8 text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground mb-1">
                <span className="flex items-center gap-2"><History size={14} /> ROUND: <span className="text-foreground">{state.round}</span></span>
                <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                <span className="flex items-center gap-2"><Skull size={14} /> DOOM: <span className="text-primary">{state.doom}</span></span>
              </div>
            </div>
            <button onClick={() => setIsMainMenuOpen(true)} className="bg-leather/90 border-2 border-primary rounded-xl p-3 text-primary transition-colors hover:bg-background/50"><Settings size={24} /></button>
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
              doom={state.doom} 
              activeModifiers={state.activeModifiers}
              exploredTiles={new Set(state.exploredTiles || [])}
            />
          </div>

          {activePlayer && (
            <div className={`fixed top-1/2 -translate-y-1/2 left-6 h-[80vh] w-80 z-40 transition-all ${showLeftPanel ? 'translate-x-0 opacity-100' : '-translate-x-[calc(100%+40px)] opacity-0'}`}>
              <CharacterPanel player={activePlayer} />
            </div>
          )}

          <div className={`fixed top-1/2 -translate-y-1/2 right-6 h-[80vh] w-80 z-40 transition-all ${showRightPanel ? 'translate-x-0 opacity-100' : 'translate-x-[calc(100%+40px)] opacity-0'}`}>
            {selectedEnemy ? (
              <EnemyPanel enemy={selectedEnemy} onClose={() => setState(prev => ({ ...prev, selectedEnemyId: null }))} />
            ) : (
              <div className="bg-leather/95 border-2 border-primary rounded-2xl h-full flex flex-col overflow-hidden shadow-2xl">
                <div className="p-4 border-b border-border bg-background/40 flex items-center gap-3">
                  <ScrollText size={18} className="text-primary" />
                  <h3 className="text-xs font-bold text-parchment uppercase tracking-[0.2em]">Field Journal</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
                  {state.log.map((entry, i) => <div key={i} className="text-xs font-serif italic text-muted-foreground leading-relaxed border-b border-border/30 pb-2">{entry}</div>)}
                </div>
              </div>
            )}
          </div>

          <footer className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent z-50 flex items-center justify-center gap-4 px-4 pb-4">
            <ActionBar
              onAction={handleAction}
              actionsRemaining={activePlayer?.actions || 0}
              isInvestigatorPhase={state.phase === GamePhase.INVESTIGATOR}
              spells={activePlayer?.spells || []}
              activeSpell={state.activeSpell}
              showCharacter={showLeftPanel}
              onToggleCharacter={() => setShowLeftPanel(!showLeftPanel)}
              showInfo={showRightPanel}
              onToggleInfo={() => setShowRightPanel(!showRightPanel)}
              contextAction={null}
            />
            <button onClick={handleNextTurn} className="px-8 py-4 bg-primary text-primary-foreground font-bold rounded-xl uppercase tracking-widest hover:scale-110 active:scale-95 transition-all shadow-[var(--shadow-doom)]">
              {state.activePlayerIndex === state.players.length - 1 ? "End Round" : "Next Turn"}
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

      {/* Game Over Overlay */}
      {gameOverType && (
        <GameOverOverlay
          type={gameOverType}
          scenarioTitle={state.activeScenario?.title}
          round={state.round}
          onRestart={handleGameOverRestart}
          onMainMenu={handleGameOverMainMenu}
        />
      )}
    </div>
  );
};

export default ShadowsGame;
