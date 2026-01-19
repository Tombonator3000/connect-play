import React, { useState, useEffect, useCallback } from 'react';
import { Skull, RotateCcw, ArrowLeft, Heart, Brain, Settings, History, ScrollText } from 'lucide-react';
import { GamePhase, GameState, Player, Tile, CharacterType, Enemy, EnemyType, Scenario, FloatingText, EdgeData } from './types';
import { CHARACTERS, ITEMS, START_TILE, SCENARIOS, MADNESS_CONDITIONS, SPELLS, BESTIARY, INDOOR_LOCATIONS, OUTDOOR_LOCATIONS, INDOOR_CONNECTORS, OUTDOOR_CONNECTORS } from './constants';
import { hexDistance, findPath } from './hexUtils';
import GameBoard from './components/GameBoard';
import CharacterPanel from './components/CharacterPanel';
import EnemyPanel from './components/EnemyPanel';
import ActionBar from './components/ActionBar';
import DiceRoller from './components/DiceRoller';
import MainMenu from './components/MainMenu';
import OptionsMenu, { GameSettings, DEFAULT_SETTINGS } from './components/OptionsMenu';

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
  exploredTiles: ['0,0'] // Start tile is always explored
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
      addToLog("The Mythos awakens. Ancient gears turn in the darkness.");
      const processEnemyAI = async () => {
        let updatedEnemies = [...state.enemies];
        let updatedPlayers = [...state.players];

        for (let i = 0; i < updatedEnemies.length; i++) {
          const enemy = updatedEnemies[i];
          const alivePlayers = updatedPlayers.filter(p => !p.isDead);
          if (alivePlayers.length === 0) continue;

          const nearestPlayer = alivePlayers.sort((a, b) =>
            hexDistance(enemy.position, a.position) - hexDistance(enemy.position, b.position)
          )[0];

          const dist = hexDistance(enemy.position, nearestPlayer.position);

          if (dist <= enemy.attackRange) {
            addToLog(`The ${enemy.name} strikes ${nearestPlayer.name}!`);
            addFloatingText(nearestPlayer.position.q, nearestPlayer.position.r, `-${enemy.damage} HP`, "text-primary");
            triggerScreenShake();

            updatedPlayers = updatedPlayers.map(p => {
              if (p.id === nearestPlayer.id) {
                const newHp = Math.max(0, p.hp - enemy.damage);
                const newSanity = Math.max(0, p.sanity - enemy.horror);
                const isDead = newHp <= 0;
                if (isDead) addToLog(`${p.name} has fallen to the darkness...`);
                return checkMadness({ ...p, hp: newHp, sanity: newSanity, isDead });
              }
              return p;
            });
          } else {
            const enemyBlockers = new Set(updatedEnemies.filter(e => e.id !== enemy.id).map(e => `${e.position.q},${e.position.r}`));
            const path = findPath(enemy.position, [nearestPlayer.position], state.board, enemyBlockers, false);
            if (path && path.length > 1) {
              updatedEnemies[i] = { ...enemy, position: path[1] };
            }
          }
        }

        setTimeout(() => {
          setState(prev => ({
            ...prev,
            enemies: updatedEnemies,
            phase: GamePhase.INVESTIGATOR,
            activePlayerIndex: 0,
            players: updatedPlayers.map(p => ({ ...p, actions: p.isDead ? 0 : 2 }))
          }));
          addToLog("A new day breaks...");
        }, 1000);
      };
      processEnemyAI();
    }
  }, [state.phase]);

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
      addToLog(`ENTERED: ${roomName}.`);
      if (Math.random() > 0.7) spawnEnemy('cultist', startQ, startR);
    }
  }, [state.board, spawnEnemy]);

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
        const combatRoll = Array.from({ length: 1 + (activePlayer.id === 'veteran' ? 1 : 0) }, () => Math.floor(Math.random() * 6) + 1);
        setState(prev => ({ ...prev, lastDiceRoll: combatRoll, activeCombat: { playerId: activePlayer.id, enemyId: targetEnemy.id } }));
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
      const enemy = state.enemies.find(e => e.id === state.activeCombat?.enemyId);
      if (enemy && successes > 0) {
        addToLog(`HIT: ${activePlayer.name} deals ${successes} damage.`);
        addFloatingText(enemy.position.q, enemy.position.r, `-${successes} HP`, "text-primary");
        triggerScreenShake();
        setState(prev => ({
          ...prev,
          enemies: prev.enemies.map(e => e.id === enemy.id ? { ...e, hp: e.hp - successes } : e).filter(e => e.hp > 0),
          players: prev.players.map((p, i) => i === prev.activePlayerIndex ? { ...p, actions: p.actions - 1 } : p),
          lastDiceRoll: null,
          activeCombat: null
        }));
      } else {
        addToLog(`MISS! Attack failed.`);
        setState(prev => ({ ...prev, players: prev.players.map((p, i) => i === prev.activePlayerIndex ? { ...p, actions: p.actions - 1 } : p), lastDiceRoll: null, activeCombat: null }));
      }
    } else {
      if (successes > 0) {
        const randomItem = ITEMS[Math.floor(Math.random() * ITEMS.length)];
        addToLog(`FOUND: ${randomItem.name}!`);
        addFloatingText(activePlayer.position.q, activePlayer.position.r, "ITEM FOUND", "text-accent");
        setState(prev => ({
          ...prev,
          players: prev.players.map((p, i) => i === prev.activePlayerIndex ? { ...p, inventory: [...p.inventory, randomItem].slice(0, 6), actions: p.actions - 1 } : p),
          lastDiceRoll: null
        }));
      } else {
        addToLog(`NOTHING FOUND.`);
        setState(prev => ({ ...prev, players: prev.players.map((p, i) => i === prev.activePlayerIndex ? { ...p, actions: p.actions - 1 } : p), lastDiceRoll: null }));
      }
    }
  };

  const handleNextTurn = () => {
    setState(prev => {
      const nextIndex = prev.activePlayerIndex + 1;
      const isEndOfRound = nextIndex >= prev.players.length;
      if (isEndOfRound) {
        return { ...prev, phase: GamePhase.MYTHOS, activePlayerIndex: 0, doom: prev.doom - 1, round: prev.round + 1, activeSpell: null };
      }
      return { ...prev, activePlayerIndex: nextIndex, activeSpell: null };
    });
  };

  const activePlayer = state.players[state.activePlayerIndex] || null;
  const selectedEnemy = state.enemies.find(e => e.id === state.selectedEnemyId);

  const handleResetData = () => {
    localStorage.removeItem(STORAGE_KEY);
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
    </div>
  );
};

export default ShadowsGame;
