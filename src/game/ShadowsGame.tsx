import React, { useState, useEffect, useCallback } from 'react';
import { Skull, RotateCcw, ArrowLeft, Heart, Brain, Settings, History, ScrollText } from 'lucide-react';
import { GamePhase, GameState, Player, Tile, CharacterType, Enemy, EnemyType, Scenario, FloatingText, EdgeData, CombatState } from './types';
import { CHARACTERS, ITEMS, START_TILE, SCENARIOS, MADNESS_CONDITIONS, SPELLS, BESTIARY, INDOOR_LOCATIONS, OUTDOOR_LOCATIONS, INDOOR_CONNECTORS, OUTDOOR_CONNECTORS, getCombatModifier, SPAWN_CHANCES } from './constants';
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
import { performAttack, performHorrorCheck, calculateEnemyDamage, hasRangedWeapon, canAttackEnemy } from './utils/combatUtils';
import { processEnemyTurn, selectRandomEnemy, createEnemy, shouldSpawnMonster } from './utils/monsterAI';

const STORAGE_KEY = 'shadows_1920s_save';
const SETTINGS_KEY = 'shadows_1920s_settings';
const APP_VERSION = "1.0.0";

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
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [showLeftPanel, setShowLeftPanel] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [showMythosOverlay, setShowMythosOverlay] = useState(false);
  const [gameOverType, setGameOverType] = useState<GameOverType | null>(null);

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

  // Check for game over conditions
  const checkGameOver = useCallback((players: Player[], doom: number) => {
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
  }, []);

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
    const pool = isConnector
      ? (tileSet === 'indoor' ? INDOOR_CONNECTORS : OUTDOOR_CONNECTORS)
      : (tileSet === 'indoor' ? INDOOR_LOCATIONS : OUTDOOR_LOCATIONS);
    const roomName = pool[Math.floor(Math.random() * pool.length)];
    const shape = isConnector ? ROOM_SHAPES.LINEAR : ROOM_SHAPES.MEDIUM;

    // Determine category and floor type based on tile set
    const getCategory = () => {
      if (isConnector) return tileSet === 'indoor' ? 'corridor' : 'street';
      if (tileSet === 'indoor') return 'room';
      return 'urban';
    };
    
    const getFloorType = () => {
      if (tileSet === 'indoor') return isConnector ? 'wood' : 'wood';
      return 'cobblestone';
    };

    const defaultEdges: [EdgeData, EdgeData, EdgeData, EdgeData, EdgeData, EdgeData] = [
      { type: 'open' }, { type: 'open' }, { type: 'open' }, { type: 'open' }, { type: 'open' }, { type: 'open' }
    ];

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
          category: getCategory(),
          zoneLevel: tileSet === 'indoor' ? 1 : 0,
          floorType: getFloorType(),
          visibility: 'visible',
          edges: defaultEdges,
          roomId,
          explored: true,
          searchable: !isConnector,
          searched: false
        });
      }
    });

    if (newTiles.length > 0) {
      setState(prev => ({ ...prev, board: [...prev.board, ...newTiles] }));
      addToLog(`UTFORSKET: ${roomName}.`);

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

  const handleAction = (actionType: string, payload?: any) => {
    const activePlayer = state.players[state.activePlayerIndex];
    if (!activePlayer || activePlayer.actions <= 0 || activePlayer.isDead || state.phase !== GamePhase.INVESTIGATOR) return;

    switch (actionType) {
      case 'move':
        const { q, r } = payload;
        const targetTile = state.board.find(t => t.q === q && t.r === r);
        if (targetTile?.object?.blocking) {
          setState(prev => ({ ...prev, selectedTileId: targetTile.id }));
          addToLog(`PATH BLOCKED: ${targetTile.object.type}.`);
          return;
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
        addToLog(`FUNNET: ${randomItem.name}!`);
        addFloatingText(activePlayer.position.q, activePlayer.position.r, "GJENSTAND FUNNET", "text-accent");
        setState(prev => ({
          ...prev,
          players: prev.players.map((p, i) => i === prev.activePlayerIndex ? {
            ...p,
            inventory: [...p.inventory, randomItem].slice(0, 6),
            actions: p.actions - 1
          } : p),
          lastDiceRoll: null
        }));
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
    setState(prev => ({
      ...prev,
      phase: GamePhase.MYTHOS,
      activePlayerIndex: 0,
      doom: prev.doom - 1,
      round: prev.round + 1,
      activeSpell: null
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
    setState(prev => ({
      ...DEFAULT_STATE,
      activeScenario: prev.activeScenario,
      phase: GamePhase.SETUP
    }));
  };

  const handleGameOverMainMenu = () => {
    setGameOverType(null);
    setState(DEFAULT_STATE);
    setIsMainMenuOpen(true);
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

      {isMainMenuOpen && (
        <MainMenu
          onNewGame={() => { setState({ ...DEFAULT_STATE, phase: GamePhase.SETUP }); setIsMainMenuOpen(false); }}
          onContinue={() => setIsMainMenuOpen(false)}
          onOptions={() => setIsOptionsOpen(true)}
          canContinue={state.phase !== GamePhase.SETUP}
          version={APP_VERSION}
        />
      )}

      {state.phase === GamePhase.SETUP && !isMainMenuOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center p-8 bg-background overflow-y-auto">
          {!state.activeScenario ? (
            <div className="bg-card p-12 rounded-2xl border-2 border-primary shadow-[var(--shadow-doom)] max-w-4xl w-full text-center">
              <div className="flex justify-between items-center mb-8 border-b border-border pb-4">
                <button onClick={() => setIsMainMenuOpen(true)} className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-xs uppercase tracking-widest transition-colors"><RotateCcw size={16} /> Back to Title</button>
                <h1 className="text-3xl font-display text-primary italic uppercase tracking-widest">Select a Case File</h1>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {SCENARIOS.map(s => (
                  <button key={s.id} onClick={() => setState(prev => ({ ...prev, activeScenario: s }))} className="p-6 bg-background border border-border hover:border-primary rounded-xl text-left transition-all group">
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary mb-2">{s.title}</h3>
                    <p className="text-xs text-muted-foreground italic leading-relaxed">{s.description}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-card p-12 rounded-2xl border-2 border-primary shadow-[var(--shadow-doom)] max-w-4xl w-full text-center">
              <div className="flex justify-between items-center mb-8 border-b border-border pb-4">
                <button onClick={() => setState(prev => ({ ...prev, activeScenario: null }))} className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-xs uppercase tracking-widest transition-colors"><ArrowLeft size={16} /> Back</button>
                <h1 className="text-2xl font-display text-primary uppercase tracking-[0.2em]">{state.activeScenario.title}</h1>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12">
                {(Object.keys(CHARACTERS) as CharacterType[]).map(type => {
                  const isSelected = !!state.players.find(p => p.id === type);
                  return (
                    <button key={type} onClick={() => {
                      const char = CHARACTERS[type];
                      setState(prev => ({
                        ...prev,
                        players: isSelected ? prev.players.filter(p => p.id !== type) : [...prev.players, { ...char, position: { q: 0, r: 0 }, inventory: [], spells: (type === 'occultist' ? [SPELLS[0]] : []), actions: 2, isDead: false, madness: [], activeMadness: null, traits: [] }]
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
              <button disabled={state.players.length === 0} onClick={() => {
                setState(prev => ({ ...prev, phase: GamePhase.INVESTIGATOR, doom: prev.activeScenario?.startDoom || 12 }));
                addToLog("The investigation begins.");
                spawnEnemy('cultist', 1, 0);
              }} className={`px-12 py-4 font-display text-2xl tracking-[0.3em] uppercase border-2 transition-all ${state.players.length > 0 ? 'bg-primary border-foreground text-primary-foreground shadow-[var(--shadow-doom)]' : 'bg-muted border-border text-muted-foreground cursor-not-allowed'}`}>Assemble Team</button>
            </div>
          )}
        </div>
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
