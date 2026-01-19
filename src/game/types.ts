export enum GamePhase {
  SETUP = 'setup',
  INVESTIGATOR = 'investigator',
  MYTHOS = 'mythos',
  COMBAT = 'combat',
  GAME_OVER = 'gameOver',
  MERCHANT = 'merchant',
  VICTORY = 'victory'
}

export type CharacterType = 'detective' | 'professor' | 'journalist' | 'veteran' | 'occultist' | 'doctor';

export type SkillType = 'strength' | 'agility' | 'intellect' | 'willpower';

export interface CharacterAttributes {
  strength: number;
  agility: number;
  intellect: number;
  willpower: number;
}

export interface SkillCheckResult {
  dice: number[];
  successes: number;
  dc: number;
  passed: boolean;
  skill: SkillType;
}

export interface Spell {
  id: string;
  name: string;
  cost: number;
  description: string;
  effectType: 'damage' | 'heal' | 'reveal' | 'banish';
  value: number;
  range: number;
}

// ============================================================================
// HERO QUEST STYLE COMBAT SYSTEM
// ============================================================================

/**
 * Occultist Spells - Replace heavy weapons with magic
 * Spells use Willpower dice and have limited uses per scenario
 */
export interface OccultistSpell {
  id: string;
  name: string;
  description: string;
  attackDice: number;           // Number of attack dice (0 for non-attack spells)
  useWillpower: boolean;        // Uses WIL dice instead of fixed amount
  usesPerScenario: number;      // How many times can be used per scenario
  currentUses?: number;         // Remaining uses
  effect: 'attack' | 'attack_horror' | 'banish' | 'defense' | 'utility';
  horrorDamage?: number;        // For spells that cause sanity damage to enemies
  defenseBonus?: number;        // For defensive spells
  range: number;                // 0 = self, 1+ = tiles away
}

/**
 * Hero Quest style weapon - determines total attack dice
 * In Hero Quest, the weapon IS your attack, not a bonus
 */
export interface HQWeapon {
  id: string;
  name: string;
  attackDice: number;           // Total attack dice this weapon provides
  weaponType: 'melee' | 'ranged';
  range?: number;               // For ranged weapons
  ammo?: number;                // Shots before reload (-1 = unlimited)
  notes?: string;               // Special properties
  goldCost: number;
  requiredLevel?: number;       // Level required to purchase
  silent?: boolean;             // For stealth
}

/**
 * Hero Quest style armor - determines defense dice
 */
export interface HQArmor {
  id: string;
  name: string;
  defenseDice: number;          // Total defense dice this armor provides
  goldCost: number;
  requiredLevel?: number;
  notes?: string;
}

/**
 * Combat stats for Hero Quest style combat
 * These are base values before equipment
 */
export interface CombatStats {
  baseAttackDice: number;       // Attack dice without weapon (unarmed)
  baseDefenseDice: number;      // Defense dice without armor
}

export interface Character {
  id: CharacterType;
  name: string;
  hp: number;
  maxHp: number;
  sanity: number;
  maxSanity: number;
  insight: number;
  attributes: CharacterAttributes;
  special: string;
  specialAbility: 'investigate_bonus' | 'occult_immunity' | 'combat_bonus' | 'ritual_master' | 'escape_bonus' | 'heal_bonus';
  // Hero Quest style combat stats
  baseAttackDice: number;       // Attack dice when unarmed (weapon replaces this)
  baseDefenseDice: number;      // Base defense dice (armor adds to this)
  weaponRestrictions?: string[];  // List of weapon IDs this class CANNOT use
  canCastSpells?: boolean;      // Only Occultist can cast spells
}

export type MadnessType = 'hallucination' | 'paranoia' | 'hysteria' | 'catatonia' | 'obsession' | 'amnesia' | 'night_terrors' | 'dark_insight';

export interface Madness {
  id: string;
  type: MadnessType;
  name: string;
  description: string;
  mechanicalEffect: string;
  visualClass: string;
  audioEffect?: string;
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
  inventory: InventorySlots;
  legacyInventory?: Item[];  // For backward compatibility during migration
  spells: Spell[];
  // Hero Quest style Occultist spells
  selectedSpells?: OccultistSpell[];  // Spells chosen for this scenario (Occultist only)
  actions: number;
  isDead: boolean;
  madness: string[];
  activeMadness: Madness | null;
  traits: Trait[];
  // Legacy system - unique hero ID for persistent heroes
  heroId?: string;  // The unique LegacyHero.id for tracking between scenarios
}

export interface Item {
  id: string;
  name: string;
  type: 'weapon' | 'tool' | 'relic' | 'armor' | 'consumable' | 'key' | 'clue';
  effect: string;
  bonus?: number;           // Legacy: general bonus (being replaced by attackDice/defenseDice)
  cost?: number;            // Legacy: insight cost
  goldCost?: number;        // Gold cost for shop
  statModifier?: 'combat' | 'investigation' | 'agility' | 'physical_defense' | 'mental_defense';
  slotType?: ItemSlotType;  // Which slot this item can be equipped to
  keyId?: string;           // For keys - which locks they open
  isLightSource?: boolean;  // Whether this item provides light
  uses?: number;            // For consumables - number of uses remaining
  maxUses?: number;         // For consumables - maximum uses
  // Hero Quest style combat values
  attackDice?: number;      // For weapons: total attack dice this weapon provides
  defenseDice?: number;     // For armor: total defense dice this armor provides
  weaponType?: 'melee' | 'ranged';  // For weapons
  range?: number;           // For ranged weapons
  ammo?: number;            // Shots before reload (-1 = unlimited melee)
  silent?: boolean;         // For stealth weapons
}

// ============================================================================
// INVENTORY SLOTS SYSTEM
// ============================================================================

export type ItemSlotType = 'hand' | 'body' | 'bag';

export type InventorySlotName = 'leftHand' | 'rightHand' | 'body' | 'bag1' | 'bag2' | 'bag3' | 'bag4';

/**
 * Slot-based inventory system
 * - 2 hand slots: weapons, tools, light sources
 * - 1 body slot: armor, cloaks
 * - 4 bag slots: everything else (keys, items, clues)
 * Total capacity: 7 items
 */
export interface InventorySlots {
  leftHand: Item | null;   // Weapons, tools, light sources
  rightHand: Item | null;  // Weapons, tools, light sources
  body: Item | null;       // Armor, cloaks, vests
  bag: (Item | null)[];    // 4 slots for keys, items, clues, consumables
}

/**
 * Creates an empty inventory with all slots set to null
 */
export function createEmptyInventory(): InventorySlots {
  return {
    leftHand: null,
    rightHand: null,
    body: null,
    bag: [null, null, null, null]
  };
}

/**
 * Gets the appropriate slot type for an item
 * @param item - The item to check
 * @returns The slot type this item should go in
 */
export function getItemSlotType(item: Item): ItemSlotType {
  // Check explicit slot type first
  if (item.slotType) return item.slotType;

  // Infer from item type
  switch (item.type) {
    case 'weapon':
    case 'tool':
      return 'hand';
    case 'armor':
      return 'body';
    case 'relic':
    case 'consumable':
    case 'key':
    case 'clue':
    default:
      return 'bag';
  }
}

/**
 * Checks if an item can be equipped to a specific slot
 * @param item - The item to check
 * @param slotName - The slot name to check against
 * @returns boolean indicating if the item is compatible with the slot
 */
export function isSlotCompatible(item: Item, slotName: InventorySlotName): boolean {
  const itemSlotType = getItemSlotType(item);

  switch (slotName) {
    case 'leftHand':
    case 'rightHand':
      return itemSlotType === 'hand';
    case 'body':
      return itemSlotType === 'body';
    case 'bag1':
    case 'bag2':
    case 'bag3':
    case 'bag4':
      // Bag can hold anything, but hand/body items prefer their dedicated slots
      return true;
    default:
      return false;
  }
}

/**
 * Counts the total number of items in an inventory
 * @param inventory - The inventory to count
 * @returns Total number of items
 */
export function countInventoryItems(inventory: InventorySlots): number {
  let count = 0;
  if (inventory.leftHand) count++;
  if (inventory.rightHand) count++;
  if (inventory.body) count++;
  count += inventory.bag.filter(item => item !== null).length;
  return count;
}

/**
 * Checks if the inventory is full (7 items max)
 * @param inventory - The inventory to check
 * @returns boolean indicating if inventory is full
 */
export function isInventoryFull(inventory: InventorySlots): boolean {
  return countInventoryItems(inventory) >= 7;
}

/**
 * Finds the first available slot for an item
 * @param inventory - The current inventory
 * @param item - The item to find a slot for
 * @returns The slot name or null if no slot available
 */
export function findAvailableSlot(inventory: InventorySlots, item: Item): InventorySlotName | null {
  const slotType = getItemSlotType(item);

  // Try preferred slots first
  if (slotType === 'hand') {
    if (!inventory.leftHand) return 'leftHand';
    if (!inventory.rightHand) return 'rightHand';
  } else if (slotType === 'body') {
    if (!inventory.body) return 'body';
  }

  // Fall back to bag slots
  for (let i = 0; i < inventory.bag.length; i++) {
    if (!inventory.bag[i]) {
      return `bag${i + 1}` as InventorySlotName;
    }
  }

  return null;
}

export interface EquipResult {
  success: boolean;
  newInventory: InventorySlots;
  droppedItem?: Item;
  message: string;
}

/**
 * Equips an item to a specific slot
 * @param inventory - The current inventory
 * @param item - The item to equip
 * @param slotName - Optional specific slot (if not provided, auto-selects)
 * @returns EquipResult with new inventory state
 */
export function equipItem(
  inventory: InventorySlots,
  item: Item,
  slotName?: InventorySlotName
): EquipResult {
  const newInventory = { ...inventory, bag: [...inventory.bag] };

  // Auto-select slot if not specified
  const targetSlot = slotName || findAvailableSlot(inventory, item);

  if (!targetSlot) {
    return {
      success: false,
      newInventory: inventory,
      message: 'Inventory is full'
    };
  }

  // Check slot compatibility
  if (!isSlotCompatible(item, targetSlot)) {
    return {
      success: false,
      newInventory: inventory,
      message: `${item.name} cannot be equipped to ${targetSlot}`
    };
  }

  let droppedItem: Item | undefined;

  // Handle the slot assignment
  switch (targetSlot) {
    case 'leftHand':
      droppedItem = newInventory.leftHand || undefined;
      newInventory.leftHand = item;
      break;
    case 'rightHand':
      droppedItem = newInventory.rightHand || undefined;
      newInventory.rightHand = item;
      break;
    case 'body':
      droppedItem = newInventory.body || undefined;
      newInventory.body = item;
      break;
    case 'bag1':
      droppedItem = newInventory.bag[0] || undefined;
      newInventory.bag[0] = item;
      break;
    case 'bag2':
      droppedItem = newInventory.bag[1] || undefined;
      newInventory.bag[1] = item;
      break;
    case 'bag3':
      droppedItem = newInventory.bag[2] || undefined;
      newInventory.bag[2] = item;
      break;
    case 'bag4':
      droppedItem = newInventory.bag[3] || undefined;
      newInventory.bag[3] = item;
      break;
  }

  return {
    success: true,
    newInventory,
    droppedItem,
    message: droppedItem
      ? `Equipped ${item.name}, dropped ${droppedItem.name}`
      : `Equipped ${item.name}`
  };
}

/**
 * Unequips an item from a slot
 * @param inventory - The current inventory
 * @param slotName - The slot to unequip from
 * @returns The unequipped item and new inventory state
 */
export function unequipItem(
  inventory: InventorySlots,
  slotName: InventorySlotName
): { item: Item | null; newInventory: InventorySlots } {
  const newInventory = { ...inventory, bag: [...inventory.bag] };
  let item: Item | null = null;

  switch (slotName) {
    case 'leftHand':
      item = newInventory.leftHand;
      newInventory.leftHand = null;
      break;
    case 'rightHand':
      item = newInventory.rightHand;
      newInventory.rightHand = null;
      break;
    case 'body':
      item = newInventory.body;
      newInventory.body = null;
      break;
    case 'bag1':
      item = newInventory.bag[0];
      newInventory.bag[0] = null;
      break;
    case 'bag2':
      item = newInventory.bag[1];
      newInventory.bag[1] = null;
      break;
    case 'bag3':
      item = newInventory.bag[2];
      newInventory.bag[2] = null;
      break;
    case 'bag4':
      item = newInventory.bag[3];
      newInventory.bag[3] = null;
      break;
  }

  return { item, newInventory };
}

/**
 * Checks if a player has a specific key
 * @param inventory - The player's inventory
 * @param keyId - The key ID to check for
 * @returns boolean indicating if player has the key
 */
export function hasKey(inventory: InventorySlots, keyId: string): boolean {
  const allItems = [
    inventory.leftHand,
    inventory.rightHand,
    inventory.body,
    ...inventory.bag
  ].filter((item): item is Item => item !== null);

  return allItems.some(item => item.type === 'key' && item.keyId === keyId);
}

/**
 * Checks if a player has a light source equipped
 * @param inventory - The player's inventory
 * @returns boolean indicating if player has a light source
 */
export function hasLightSource(inventory: InventorySlots): boolean {
  return !!(
    (inventory.leftHand?.isLightSource) ||
    (inventory.rightHand?.isLightSource)
  );
}

/**
 * Gets all items from inventory as a flat array (for backward compatibility)
 * @param inventory - The inventory to flatten
 * @returns Array of all items
 */
export function getAllItems(inventory: InventorySlots): Item[] {
  return [
    inventory.leftHand,
    inventory.rightHand,
    inventory.body,
    ...inventory.bag
  ].filter((item): item is Item => item !== null);
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
  damage: number;           // Legacy: base damage (kept for backwards compatibility)
  attackDice: number;       // Hero Quest style: number of dice monster rolls to attack
  defenseDice: number;      // Hero Quest style: number of dice monster rolls to defend
  horror: number;
  traits?: string[];
  defeatFlavor?: string;
}

export type TileObjectType =
  | 'altar' | 'bookshelf' | 'crate' | 'chest' | 'cabinet'
  | 'gate' | 'barricade' | 'locked_door' | 'rubble' | 'fire' | 'trap'
  | 'mirror' | 'radio' | 'switch' | 'statue' | 'fog_wall' | 'exit_door';

export type EdgeType = 'open' | 'wall' | 'door' | 'secret' | 'window' | 'stairs_up' | 'stairs_down' | 'blocked';

export type DoorState = 'open' | 'closed' | 'locked' | 'barricaded' | 'broken' | 'sealed' | 'puzzle';

export type LockType = 'simple' | 'quality' | 'complex' | 'occult';

export type ObstacleType = 
  | 'rubble_light' | 'rubble_heavy' | 'collapsed' | 'fire' 
  | 'water_shallow' | 'water_deep' | 'unstable_floor' | 'gas_poison'
  | 'darkness' | 'ward_circle' | 'spirit_barrier' | 'spatial_warp' | 'time_loop';

export interface EdgeData {
  type: EdgeType;
  doorState?: DoorState;
  lockType?: LockType;
  keyId?: string;
  puzzleId?: string;
}

export interface Obstacle {
  type: ObstacleType;
  blocking: boolean;
  removable: boolean;
  skillRequired?: SkillType;
  dc?: number;
  apCost?: number;
  damage?: number;
  itemRequired?: string;
  effect?: string;
}

export interface TileObject {
  type: TileObjectType;
  searched: boolean;
  blocking?: boolean;
  health?: number;
  difficulty?: number;
  reqSkill?: SkillType;
}

export type TileVisibility = 'hidden' | 'adjacent' | 'revealed' | 'visible';

export type ZoneLevel = -2 | -1 | 0 | 1 | 2;

export type TileCategory = 
  | 'nature' | 'urban' | 'street' | 'facade' | 'foyer' 
  | 'corridor' | 'room' | 'stairs' | 'basement' | 'crypt';

export type FloorType = 'wood' | 'cobblestone' | 'tile' | 'stone' | 'grass' | 'dirt' | 'water' | 'ritual';

export interface Tile {
  id: string;
  q: number;
  r: number;
  name: string;
  type: 'building' | 'room' | 'street';
  category?: TileCategory;
  zoneLevel: ZoneLevel;
  floorType: FloorType;
  visibility: TileVisibility;
  edges: [EdgeData, EdgeData, EdgeData, EdgeData, EdgeData, EdgeData]; // 6 hex edges
  obstacle?: Obstacle;
  roomId?: string;
  explored: boolean;
  hasWater?: boolean;
  searchable: boolean;
  searched: boolean;
  object?: TileObject;
  isGate?: boolean;
  watermarkIcon?: string;
  isDeadEnd?: boolean; // Marks tiles with only one exit
}

export type VictoryType = 'escape' | 'assassination' | 'collection' | 'survival' | 'ritual' | 'investigation';

export type ObjectiveType =
  | 'find_item'      // Find a specific item
  | 'find_tile'      // Discover a specific tile type
  | 'kill_enemy'     // Kill specific enemy type(s)
  | 'kill_boss'      // Kill a boss enemy
  | 'survive'        // Survive for X rounds
  | 'interact'       // Interact with specific object
  | 'escape'         // Reach exit and leave
  | 'collect'        // Collect X of something
  | 'explore'        // Explore X tiles
  | 'protect'        // Keep someone/something alive
  | 'ritual';        // Perform a ritual action

export interface ScenarioObjective {
  id: string;
  description: string;
  shortDescription: string;  // For UI display
  type: ObjectiveType;
  targetId?: string;         // Item ID, Enemy type, Tile name, etc.
  targetAmount?: number;     // How many needed (default 1)
  currentAmount?: number;    // Current progress
  isOptional: boolean;       // Required or bonus
  isHidden: boolean;         // Revealed when discovered
  revealedBy?: string;       // Objective ID that reveals this
  completed: boolean;
  failedCondition?: string;  // What causes this to fail
  rewardInsight?: number;    // Insight gained on completion
  rewardItem?: string;       // Item ID given on completion
}

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
  type: 'spawn_enemy' | 'buff_enemies' | 'sanity_hit' | 'spawn_boss' | 'unlock_area' | 'narrative';
  targetId?: string;
  amount?: number;
  message: string;
}

export interface VictoryCondition {
  type: VictoryType;
  description: string;
  checkFunction: string;  // Name of function to check (evaluated in game)
  requiredObjectives: string[];  // Objective IDs that must be completed
  anyOfObjectives?: string[];    // Any one of these objectives
}

export interface DefeatCondition {
  type: 'all_dead' | 'doom_zero' | 'objective_failed' | 'time_expired';
  description: string;
  objectiveId?: string;  // For objective_failed type
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  briefing: string;              // Longer narrative briefing text
  startDoom: number;
  startLocation: string;
  specialRule: string;
  difficulty: 'Normal' | 'Hard' | 'Nightmare';
  tileSet: 'indoor' | 'outdoor' | 'mixed';
  goal: string;
  victoryType: VictoryType;
  steps: ScenarioStep[];         // Legacy - for backward compatibility
  objectives: ScenarioObjective[]; // New detailed objectives
  victoryConditions: VictoryCondition[];
  defeatConditions: DefeatCondition[];
  doomEvents: DoomEvent[];
  estimatedTime?: string;        // e.g. "30-45 min"
  recommendedPlayers?: string;   // e.g. "2-4"
}

// ============================================================================
// CONTEXT ACTIONS SYSTEM
// ============================================================================

export type ContextActionIconType =
  | 'strength' | 'agility' | 'intellect' | 'willpower'
  | 'key' | 'lockpick' | 'force' | 'search' | 'interact'
  | 'read' | 'ritual' | 'cancel' | 'light' | 'item';

export interface SkillCheckRequirement {
  skill: SkillType;
  dc: number;
  bonusDice?: number;
}

/**
 * Represents a contextual action that can be performed on a tile, obstacle, or edge
 */
export interface ContextAction {
  id: string;
  label: string;
  icon: ContextActionIconType;
  skillCheck?: SkillCheckRequirement;
  itemRequired?: string;       // Item ID required to perform this action
  keyRequired?: string;        // Key ID required (for locked doors)
  apCost: number;
  enabled: boolean;
  reason?: string;             // Why the action is disabled
  successMessage?: string;     // Message to show on success
  failureMessage?: string;     // Message to show on failure
  consequences?: {
    success?: ContextActionEffect;
    failure?: ContextActionEffect;
  };
}

export interface ContextActionEffect {
  type: 'open_door' | 'break_door' | 'remove_obstacle' | 'trigger_alarm' | 'take_damage' | 'lose_sanity' | 'gain_item' | 'reveal_secret';
  value?: number;
  targetId?: string;
  message?: string;
}

export interface ContextActionTarget {
  type: 'tile' | 'obstacle' | 'edge' | 'object';
  tileId: string;
  edgeIndex?: number;          // For edge targets (0-5)
  obstacle?: Obstacle;
  object?: TileObject;
  edge?: EdgeData;
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

export interface GameSettings {
  audio: {
    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;
    muted: boolean;
  };
  graphics: {
    highContrast: boolean;
    reduceMotion: boolean;
    particles: boolean;
  };
  gameplay: {
    showGrid: boolean;
    fastMode: boolean;
  };
}

export interface ActivePuzzle {
  type: 'sequence';
  difficulty: number;
  targetTileId: string;
}

// ============================================================================
// WEATHER SYSTEM - "The Whispering Elements"
// ============================================================================

/**
 * Weather types that can affect the game board
 * Each weather has visual and gameplay effects
 */
export type WeatherType = 'clear' | 'fog' | 'rain' | 'miasma' | 'cosmic_static';

/**
 * Intensity levels for weather effects
 */
export type WeatherIntensity = 'light' | 'moderate' | 'heavy';

/**
 * Weather condition affecting the game
 */
export interface WeatherCondition {
  type: WeatherType;
  intensity: WeatherIntensity;
  duration: number;              // Rounds remaining (-1 for permanent)
  sourceId?: string;             // Tile or event that caused this weather
  affectedTiles?: string[];      // Specific tiles affected (null = global)
}

/**
 * Weather effect definitions - gameplay impact
 */
export interface WeatherEffect {
  type: WeatherType;
  name: string;
  description: string;
  visualClass: string;           // CSS class for visual effect
  // Gameplay effects
  visionReduction: number;       // Reduce vision range by this amount (0-2)
  agilityPenalty: number;        // Penalty to Agility checks (0-2)
  movementCost: number;          // Extra AP cost for movement (0-1)
  horrorChance: number;          // % chance to trigger minor horror check (0-25)
  sanityDrain: number;           // Sanity lost per round in weather (0-1)
  // Special effects
  hidesEnemies: boolean;         // Enemies harder to see
  blocksRanged: boolean;         // Ranged attacks blocked
  // Visual settings
  opacity: number;               // 0-1 for overlay opacity
  particleCount: number;         // Number of particles to render
  animationSpeed: 'slow' | 'medium' | 'fast';
}

/**
 * Active weather state for the game
 */
export interface WeatherState {
  global: WeatherCondition | null;        // Global weather affecting entire board
  local: WeatherCondition[];              // Local weather zones (e.g., miasma on specific tiles)
  transitionProgress: number;             // 0-100 for weather transition animation
  isTransitioning: boolean;
}

/**
 * Creates default weather state (clear weather)
 */
export function createDefaultWeatherState(): WeatherState {
  return {
    global: null,
    local: [],
    transitionProgress: 100,
    isTransitioning: false
  };
}

// Combat system types
export interface CombatState {
  enemyId: string;
  playerId: string;
  phase: 'player_attack' | 'enemy_attack' | 'horror_check' | 'resolved';
  playerRoll?: number[];
  enemyDamageDealt?: number;
  playerDamageDealt?: number;
}

// Monster AI types
export type MonsterBehavior = 'aggressive' | 'defensive' | 'ranged' | 'ambusher' | 'patrol' | 'swarm';
export type MonsterState = 'idle' | 'patrol' | 'alert' | 'hunting' | 'fleeing';

export interface MonsterAIState {
  state: MonsterState;
  targetPlayerId?: string;
  lastKnownPlayerPos?: { q: number; r: number };
  alertLevel: number; // 0-100
}

// Extended Enemy with AI state
export interface EnemyWithAI extends Enemy {
  aiState?: MonsterAIState;
  lastMoveRound?: number;
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
  activeCombat: CombatState | null;
  activePuzzle: ActivePuzzle | null;
  selectedEnemyId: string | null;
  selectedTileId: string | null;
  activeScenario: Scenario | null;
  activeModifiers: ScenarioModifier[];
  floatingTexts: FloatingText[];
  screenShake: boolean;
  activeSpell: Spell | null;
  currentStepIndex: number;
  questItemsCollected: string[];
  exploredTiles: string[];
  pendingHorrorChecks: string[]; // Enemy IDs that need horror checks
  weatherState: WeatherState;    // Active weather conditions
}

// ============================================================================
// LEGACY SYSTEM - Persistent Heroes & Progression
// ============================================================================

/**
 * XP thresholds for each level (1-5)
 * Level 1: 0 XP (starting)
 * Level 2: 50 XP
 * Level 3: 150 XP
 * Level 4: 300 XP
 * Level 5: 500 XP (max)
 */
export const XP_THRESHOLDS: Record<number, number> = {
  1: 0,
  2: 50,
  3: 150,
  4: 300,
  5: 500
};

/**
 * Stat bonuses per level
 * Each level grants +1 to a chosen stat or +2 max HP or +1 max Sanity
 */
export type LevelUpBonus =
  | { type: 'attribute'; attribute: keyof CharacterAttributes }
  | { type: 'maxHp'; value: 2 }
  | { type: 'maxSanity'; value: 1 };

export interface LevelUpChoice {
  level: number;
  bonus: LevelUpBonus;
}

/**
 * A persistent hero that survives between scenarios
 */
export interface LegacyHero {
  // Identity
  id: string;                           // Unique hero ID (UUID)
  name: string;                         // Custom hero name
  characterClass: CharacterType;        // detective, professor, etc.
  portraitIndex: number;                // Which portrait to use (0-3)

  // Progression
  level: number;                        // 1-5
  currentXP: number;                    // Total XP earned
  levelUpBonuses: LevelUpChoice[];      // Bonuses chosen at each level

  // Economy
  gold: number;                         // Currency for shop

  // Base stats (modified by level bonuses)
  baseAttributes: CharacterAttributes;  // Starting attributes for class
  bonusAttributes: CharacterAttributes; // Accumulated from level ups
  maxHp: number;                        // Modified by level bonuses
  maxSanity: number;                    // Modified by level bonuses

  // Equipment
  equipment: InventorySlots;            // Persistent equipment

  // History
  scenariosCompleted: string[];         // Scenario IDs completed
  scenariosFailed: string[];            // Scenario IDs failed (but survived)
  totalKills: number;                   // Total enemies defeated
  totalInsightEarned: number;           // Lifetime insight
  dateCreated: string;                  // ISO date string
  lastPlayed: string;                   // ISO date string

  // Status
  isRetired: boolean;                   // Voluntarily retired
  isDead: boolean;                      // Permadeath - cannot be used again
  deathScenario?: string;               // Scenario where hero died
  deathCause?: string;                  // How they died
}

/**
 * Rewards earned from completing a scenario
 */
export interface ScenarioRewards {
  baseGold: number;                     // Base gold for completion
  bonusGold: number;                    // Bonus for optional objectives
  baseXP: number;                       // Base XP for completion
  bonusXP: number;                      // Bonus XP
  lootItems: Item[];                    // Items found during scenario
}

/**
 * Equipment stash - shared storage between scenarios
 */
export interface EquipmentStash {
  items: Item[];                        // Stored items
  maxCapacity: number;                  // Max items (default 20)
}

/**
 * Complete legacy save data stored in localStorage
 */
export interface LegacyData {
  version: number;                      // Save format version
  heroes: LegacyHero[];                 // All created heroes (alive and dead)
  stash: EquipmentStash;                // Shared equipment storage
  totalGoldEarned: number;              // Lifetime gold
  totalScenariosCompleted: number;      // All-time completions
  totalScenariosAttempted: number;      // All-time attempts
  unlockedScenarios: string[];          // Scenarios available to play
  achievements: string[];               // Achievement IDs unlocked
  lastSaved: string;                    // ISO date string
}

/**
 * Shop item with price and availability
 */
export interface ShopItem {
  item: Item;
  goldCost: number;
  insightCost?: number;                 // Alternative insight cost
  stock: number;                        // -1 for unlimited
  requiredLevel?: number;               // Min hero level to purchase
  isNew?: boolean;                      // Highlight as new item
}

/**
 * Shop inventory for merchant phase
 */
export interface ShopInventory {
  weapons: ShopItem[];
  tools: ShopItem[];
  armor: ShopItem[];
  consumables: ShopItem[];
  relics: ShopItem[];
}

/**
 * Result of a completed scenario for legacy system
 */
export interface ScenarioResult {
  scenarioId: string;
  victory: boolean;
  roundsPlayed: number;
  heroResults: HeroScenarioResult[];
  totalGoldEarned: number;
  totalXPEarned: number;
}

export interface HeroScenarioResult {
  heroId: string;
  survived: boolean;
  xpEarned: number;
  goldEarned: number;
  killCount: number;
  insightEarned: number;
  itemsFound: Item[];
  leveledUp: boolean;
  newLevel?: number;
}

/**
 * Helper function to calculate effective attributes including level bonuses
 */
export function getEffectiveAttributes(hero: LegacyHero): CharacterAttributes {
  return {
    strength: hero.baseAttributes.strength + hero.bonusAttributes.strength,
    agility: hero.baseAttributes.agility + hero.bonusAttributes.agility,
    intellect: hero.baseAttributes.intellect + hero.bonusAttributes.intellect,
    willpower: hero.baseAttributes.willpower + hero.bonusAttributes.willpower
  };
}

/**
 * Calculate level from XP
 */
export function getLevelFromXP(xp: number): number {
  if (xp >= XP_THRESHOLDS[5]) return 5;
  if (xp >= XP_THRESHOLDS[4]) return 4;
  if (xp >= XP_THRESHOLDS[3]) return 3;
  if (xp >= XP_THRESHOLDS[2]) return 2;
  return 1;
}

/**
 * Calculate XP needed for next level
 */
export function getXPForNextLevel(currentLevel: number): number {
  if (currentLevel >= 5) return 0; // Max level
  return XP_THRESHOLDS[currentLevel + 1];
}

/**
 * Check if hero can level up
 */
export function canLevelUp(hero: LegacyHero): boolean {
  const newLevel = getLevelFromXP(hero.currentXP);
  return newLevel > hero.level && hero.level < 5;
}

/**
 * Default empty legacy data
 */
export function createDefaultLegacyData(): LegacyData {
  return {
    version: 1,
    heroes: [],
    stash: {
      items: [],
      maxCapacity: 20
    },
    totalGoldEarned: 0,
    totalScenariosCompleted: 0,
    totalScenariosAttempted: 0,
    unlockedScenarios: ['s1'], // First scenario unlocked by default
    achievements: [],
    lastSaved: new Date().toISOString()
  };
}
