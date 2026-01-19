export enum GamePhase {
  SETUP = 'setup',
  INVESTIGATOR = 'investigator',
  MYTHOS = 'mythos',
  COMBAT = 'combat',
  GAME_OVER = 'gameOver',
  VICTORY = 'victory'
}

export type CharacterType = 'detective' | 'professor' | 'journalist' | 'veteran' | 'occultist' | 'doctor';

export interface Spell {
  id: string;
  name: string;
  cost: number;
  description: string;
  effectType: 'damage' | 'heal' | 'reveal' | 'banish';
  value: number;
  range: number;
}

export interface Character {
  id: CharacterType;
  name: string;
  hp: number;
  maxHp: number;
  sanity: number;
  maxSanity: number;
  insight: number;
  special: string;
}

export interface Madness {
  id: string;
  name: string;
  description: string;
  effect: string;
  visualClass: string;
}

export interface Trait {
  id: string;
  name: string;
  description: string;
  type: 'positive' | 'negative';
  effect: 'combat_bonus' | 'sanity_regen' | 'max_hp_down' | 'fragile_mind' | 'scavenger' | 'runner';
}

export interface Player extends Character {
  position: { q: number; r: number };
  inventory: Item[];
  spells: Spell[];
  actions: number;
  isDead: boolean;
  madness: string[];
  activeMadness: Madness | null;
  traits: Trait[];
}

export interface Item {
  id: string;
  name: string;
  type: 'weapon' | 'tool' | 'relic' | 'armor' | 'consumable';
  effect: string;
  bonus?: number;
  cost?: number;
  statModifier?: 'combat' | 'investigation' | 'agility' | 'physical_defense' | 'mental_defense';
}

export type EnemyAttackType = 'melee' | 'ranged' | 'sanity' | 'doom';

export type EnemyType =
  | 'cultist' | 'deepone' | 'ghoul' | 'shoggoth' | 'boss'
  | 'sniper' | 'priest' | 'mi-go' | 'nightgaunt' | 'hound'
  | 'dark_young' | 'byakhee' | 'star_spawn' | 'formless_spawn'
  | 'hunting_horror' | 'moon_beast';

export interface Enemy {
  id: string;
  name: string;
  type: EnemyType;
  hp: number;
  maxHp: number;
  damage: number;
  horror: number;
  speed: number;
  position: { q: number; r: number };
  visionRange: number;
  attackRange: number;
  attackType: EnemyAttackType;
  traits?: string[];
  isDying?: boolean;
}

export interface BestiaryEntry {
  name: string;
  type: EnemyType;
  description: string;
  lore: string;
  hp: number;
  damage: number;
  horror: number;
  traits?: string[];
  defeatFlavor?: string;
}

export type TileObjectType =
  | 'altar' | 'bookshelf' | 'crate' | 'chest' | 'cabinet'
  | 'gate' | 'barricade' | 'locked_door' | 'rubble' | 'fire' | 'trap'
  | 'mirror' | 'radio' | 'switch' | 'statue' | 'fog_wall' | 'exit_door';

export interface TileObject {
  type: TileObjectType;
  searched: boolean;
  blocking?: boolean;
  health?: number;
  difficulty?: number;
  reqSkill?: 'strength' | 'insight' | 'agility';
}

export interface Tile {
  id: string;
  q: number;
  r: number;
  name: string;
  type: 'building' | 'room' | 'street';
  category?: 'connector' | 'location';
  roomId?: string;
  explored: boolean;
  hasWater?: boolean;
  searchable: boolean;
  searched: boolean;
  object?: TileObject;
  isGate?: boolean;
}

export type VictoryType = 'escape' | 'assassination' | 'collection' | 'survival';

export interface ScenarioStep {
  id: string;
  description: string;
  type: 'find_item' | 'find_tile' | 'kill_enemy' | 'survive' | 'interact';
  targetId?: string;
  amount?: number;
  completed: boolean;
}

export interface DoomEvent {
  threshold: number;
  triggered: boolean;
  type: 'spawn_enemy' | 'buff_enemies' | 'sanity_hit' | 'spawn_boss';
  targetId?: string;
  amount?: number;
  message: string;
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  startDoom: number;
  startLocation: string;
  specialRule: string;
  difficulty: 'Normal' | 'Hard' | 'Nightmare';
  tileSet: 'indoor' | 'outdoor' | 'mixed';
  goal: string;
  victoryType: VictoryType;
  steps: ScenarioStep[];
  doomEvents: DoomEvent[];
}

export interface ContextAction {
  id: string;
  label: string;
  iconType: 'strength' | 'insight' | 'agility' | 'interact';
  difficulty: number;
}

export interface FloatingText {
  id: string;
  q: number;
  r: number;
  content: string;
  colorClass: string;
  randomOffset: { x: number; y: number };
}

export interface ScenarioModifier {
  id: string;
  name: string;
  description: string;
  effect: 'reduced_vision' | 'extra_doom' | 'strong_enemies' | 'less_items';
}

export interface EventCard {
  id: string;
  title: string;
  description: string;
  effectType: 'sanity' | 'health' | 'spawn' | 'insight' | 'doom';
  value: number;
}

export interface GameState {
  phase: GamePhase;
  doom: number;
  round: number;
  players: Player[];
  activePlayerIndex: number;
  board: Tile[];
  enemies: Enemy[];
  encounteredEnemies: string[];
  cluesFound: number;
  log: string[];
  lastDiceRoll: number[] | null;
  activeEvent: EventCard | null;
  activeCombat: { enemyId: string; playerId: string } | null;
  selectedEnemyId: string | null;
  selectedTileId: string | null;
  activeScenario: Scenario | null;
  activeModifiers: ScenarioModifier[];
  floatingTexts: FloatingText[];
  screenShake: boolean;
  activeSpell: Spell | null;
  currentStepIndex: number;
  questItemsCollected: string[];
}
