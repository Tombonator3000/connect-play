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
  | 'mirror' | 'radio' | 'switch' | 'statue' | 'fog_wall' | 'exit_door'
  | 'eldritch_portal';  // Glowing purple portal - spawns enemies during Mythos phase

export type EdgeType = 'open' | 'wall' | 'door' | 'secret' | 'window' | 'stairs_up' | 'stairs_down' | 'blocked';

export type DoorState = 'open' | 'closed' | 'locked' | 'barricaded' | 'broken' | 'sealed' | 'puzzle';

export type LockType = 'simple' | 'quality' | 'complex' | 'occult';

export type ObstacleType =
  | 'rubble_light' | 'rubble_heavy' | 'collapsed' | 'fire'
  | 'water_shallow' | 'water_deep' | 'unstable_floor' | 'gas_poison'
  | 'darkness' | 'ward_circle' | 'spirit_barrier' | 'spatial_warp' | 'time_loop';

// Edge blocking types - what is blocking passage through an edge
export type EdgeBlockingType =
  | 'rubble'           // Rubble/debris blocking the path - can be cleared (Str 4)
  | 'heavy_rubble'     // Heavy rubble - harder to clear (Str 5)
  | 'collapsed'        // Fully collapsed - cannot be cleared
  | 'fire'             // Flames blocking the way - can be extinguished or jumped (Agi 4, takes 1 damage)
  | 'barricade'        // Barricaded passage - can be broken (Str 4)
  | 'locked_gate'      // Locked gate/bars - can be unlocked or forced
  | 'spirit_barrier'   // Supernatural barrier - requires Elder Sign or Willpower
  | 'ward'             // Magical ward - can be dispelled (Wil 5) or crossed (takes sanity damage)
  | 'chasm'            // Deep gap - cannot be crossed without tools
  | 'flooded';         // Flooded passage - can be waded through (extra AP)

export interface EdgeData {
  type: EdgeType;
  doorState?: DoorState;
  lockType?: LockType;
  keyId?: string;
  puzzleId?: string;
  isDiscovered?: boolean;       // For secret doors - true if player has found it
  // Blocked edge properties
  blockingType?: EdgeBlockingType;
  blockingRemovable?: boolean;
  blockingDC?: number;          // Difficulty class to clear/pass
  blockingSkill?: SkillType;    // Required skill to clear
  blockingItemRequired?: string; // Item needed to clear (e.g., 'extinguisher', 'elder_sign')
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
  // Portal-specific properties
  portalActive?: boolean;          // Is portal currently active (can spawn enemies)
  portalSpawnTypes?: EnemyType[];  // What enemy types can spawn from this portal
  portalSpawnChance?: number;      // Chance to spawn enemy each Mythos phase (0-100)
}

export type TileVisibility = 'hidden' | 'adjacent' | 'revealed' | 'visible';

export type ZoneLevel = -2 | -1 | 0 | 1 | 2;

export type TileCategory = 
  | 'nature' | 'urban' | 'street' | 'facade' | 'foyer' 
  | 'corridor' | 'room' | 'stairs' | 'basement' | 'crypt';

export type FloorType = 'wood' | 'cobblestone' | 'tile' | 'stone' | 'grass' | 'dirt' | 'water' | 'ritual';

// ============================================================================
// DARK ROOM SYSTEM - "What Lurks in the Shadows"
// ============================================================================

/**
 * Types of discoveries that can be made when illuminating a dark room
 * These range from helpful to horrifying
 */
export type DarkRoomDiscoveryType =
  | 'treasure'           // Valuable items left behind
  | 'cache'              // Hidden supplies
  | 'clue'               // Investigation clue
  | 'corpse'             // Dead body with items (and possible horror)
  | 'survivor'           // NPC survivor (rare, gives hint)
  | 'nothing'            // Just darkness
  | 'ambush'             // Hidden enemy attacks!
  | 'nest'               // Multiple weak enemies
  | 'horror'             // Something that causes sanity damage
  | 'trap'               // A trap activates
  | 'cultist_shrine'     // Occult shrine (sanity cost, but insight gain)
  | 'ancient_secret';    // Rare powerful discovery

/**
 * Represents what is hidden in a dark room until illuminated
 */
export interface DarkRoomContent {
  discoveryType: DarkRoomDiscoveryType;
  description: string;           // Flavor text when revealed
  items?: string[];              // Item IDs to spawn
  enemyTypes?: EnemyType[];      // Enemy types to spawn
  enemyCount?: number;           // How many enemies
  sanityEffect?: number;         // Positive = gain, negative = lose
  insightGain?: number;          // Insight gained from discovery
  trapDamage?: number;           // Damage if it's a trap
  isRevealed: boolean;           // Has this been illuminated?
  requiresSearch?: boolean;      // Must search after illuminating to get items
}

/**
 * Creates a dark room content based on discovery type
 */
export function createDarkRoomContent(type: DarkRoomDiscoveryType): DarkRoomContent {
  const base: DarkRoomContent = {
    discoveryType: type,
    description: '',
    isRevealed: false
  };

  switch (type) {
    case 'treasure':
      return { ...base, description: 'Your light reveals a forgotten stash—someone left in a hurry.', items: ['random_valuable'], requiresSearch: true };
    case 'cache':
      return { ...base, description: 'Emergency supplies, hidden from looters. Still intact.', items: ['random_supplies'], requiresSearch: true };
    case 'clue':
      return { ...base, description: 'Writing on the wall, only visible in the light. A warning? A message?', insightGain: 1 };
    case 'corpse':
      return { ...base, description: 'A body. Long dead. Their final possession still clutched in frozen fingers.', items: ['random_from_corpse'], sanityEffect: -1, requiresSearch: true };
    case 'survivor':
      return { ...base, description: 'Eyes blink in your light. A survivor! They whisper a warning before fleeing.', insightGain: 2, sanityEffect: 1 };
    case 'nothing':
      return { ...base, description: 'Just shadows. The darkness held nothing but your own fear.' };
    case 'ambush':
      return { ...base, description: 'MOVEMENT! Something lunges from the darkness!', enemyTypes: ['ghoul'], enemyCount: 1 };
    case 'nest':
      return { ...base, description: 'You\'ve disturbed a nest. Shapes scatter and hiss in the sudden light.', enemyTypes: ['cultist'], enemyCount: 2 };
    case 'horror':
      return { ...base, description: 'Your light reveals something that should not exist. You cannot unsee it.', sanityEffect: -2 };
    case 'trap':
      return { ...base, description: 'CLICK. Your light triggered something. Too late to dodge.', trapDamage: 2 };
    case 'cultist_shrine':
      return { ...base, description: 'A makeshift altar. Symbols of power. Knowledge has a price.', sanityEffect: -1, insightGain: 3 };
    case 'ancient_secret':
      return { ...base, description: 'Ancient writing covers the walls. This place predates the building above.', items: ['rare_relic'], insightGain: 2 };
    default:
      return base;
  }
}

export interface Tile {
  id: string;
  q: number;
  r: number;
  name: string;
  description?: string;  // Atmospheric Lovecraftian description shown when entering tile
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
  // Local weather effect on this specific tile
  localWeather?: {
    type: WeatherType;
    intensity: WeatherIntensity;
    duration: number; // Rounds remaining (-1 = permanent)
    source?: 'ritual' | 'event' | 'tile_feature'; // What caused this weather
  };
  // Dark room system - requires light source to see contents
  isDarkRoom?: boolean;           // Is this room shrouded in darkness?
  darkRoomContent?: DarkRoomContent;  // Hidden content revealed when illuminated
  darkRoomIlluminated?: boolean;  // Has this dark room been illuminated?
  // Blood trail system - visual indicator of combat
  bloodstains?: {
    count: number;              // Number of bloodstains (affects visual intensity)
    positions: Array<{x: number; y: number; rotation: number; size: number}>;  // Random positions within tile
    fadeTime?: number;          // Rounds until blood fades (optional)
  };
  // Fog of war reveal animation state
  fogRevealAnimation?: 'revealing' | 'revealed';  // For flicker effect when fog clears
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

export type ScenarioTheme = 'manor' | 'church' | 'asylum' | 'warehouse' | 'forest' | 'urban' | 'coastal' | 'underground' | 'academic';

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
  theme?: ScenarioTheme;         // Theme determines which tiles spawn (forest, manor, church, etc.)
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
  type: 'open_door' | 'break_door' | 'remove_obstacle' | 'trigger_alarm' | 'take_damage' | 'lose_sanity' | 'gain_item' | 'reveal_secret' | 'clear_edge' | 'pass_through';
  value?: number;
  damage?: number;           // For effects that cause damage
  sanityCost?: number;       // For effects that cost sanity
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

// ============================================================================
// SPELL PARTICLE EFFECTS SYSTEM
// ============================================================================

/**
 * Types of spell particle effects
 * Each type has unique visuals and animations
 */
export type SpellParticleType =
  | 'wither'           // Dark purple energy drain - flies from caster to target
  | 'eldritch_bolt'    // Glowing eldritch projectile
  | 'mend_flesh'       // Golden healing sparkles around target
  | 'true_sight'       // Blue mystical eye particles radiating outward
  | 'banish'           // Red void implosion effect at target
  | 'mind_blast'       // Pink/purple shockwave
  | 'dark_shield'      // Dark swirling protective aura
  | 'explosion'        // General impact explosion
  | 'blood'            // Blood splatter for damage
  | 'smoke'            // Dissipation/death smoke
  | 'sparkle';         // Generic magical sparkle

/**
 * A single spell particle for visual effects
 */
export interface SpellParticle {
  id: string;
  type: SpellParticleType;
  // Starting position (hex coordinates)
  startQ: number;
  startR: number;
  // Target position (hex coordinates) - for projectiles
  targetQ?: number;
  targetR?: number;
  // Timing
  startTime: number;           // When particle was created (Date.now())
  duration: number;            // How long particle lasts (ms)
  // Visual properties
  color: string;               // Tailwind color class or hex
  size: 'sm' | 'md' | 'lg';    // Particle size
  count: number;               // Number of particles in this effect
  // Animation type
  animation: 'projectile' | 'burst' | 'radiate' | 'implode' | 'orbit' | 'float';
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

// ============================================================================
// PUZZLE SYSTEM - "The Seals Must Be Broken"
// ============================================================================

/**
 * Types of puzzles that can appear on doors and obstacles
 * Each type has unique mechanics and difficulty scaling
 */
export type PuzzleType =
  | 'sequence'       // Memory pattern - recall lit sequence (existing)
  | 'code_lock'      // Enter a numeric code found elsewhere
  | 'symbol_match'   // Match 3 ancient symbols in correct order
  | 'blood_ritual'   // Sacrifice HP or Sanity to open
  | 'astronomy'      // Align rotating star dials
  | 'pressure_plate'; // Co-op - someone must stand on plate

/**
 * Active puzzle state during puzzle interaction
 */
export interface ActivePuzzle {
  type: PuzzleType;
  difficulty: number;
  targetTileId: string;
  // Optional data for specific puzzle types
  code?: string;           // For code_lock - the correct code (hidden from UI)
  symbols?: string[];      // For symbol_match - the correct symbol sequence
  requiredCost?: {         // For blood_ritual
    hp?: number;
    sanity?: number;
  };
  hint?: string;           // Optional hint text for the puzzle
}

// ============================================================================
// WEATHER SYSTEM - "The Whispering Elements"
// ============================================================================

/**
 * Weather types that can affect the game board
 * Each weather has visual and gameplay effects
 */
export type WeatherType =
  | 'clear'          // No weather effect
  | 'fog'            // Reduces visibility, hides enemies
  | 'rain'           // Reduces agility, affects ranged combat
  | 'miasma'         // Supernatural fog, sanity drain
  | 'cosmic_static'  // Reality distortion, movement penalty
  | 'unnatural_glow' // Eldritch light, affects enemy behavior, horror checks
  | 'darkness';      // Oppressive darkness, severe vision reduction

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
  // Enhanced AI state
  lastActionRound?: number;
  consecutivePatrolMoves?: number;
  hasUsedSpecialAbility?: boolean;
  packLeaderId?: string;           // For pack/herd behavior
  fleeingFromPlayerId?: string;    // For fleeing behavior
  ambushPosition?: { q: number; r: number };  // Where ambusher is waiting
}

// ============================================================================
// ENHANCED MONSTER AI SYSTEM - Unique Behaviors Per Monster Type
// ============================================================================

/**
 * Special abilities that monsters can use during combat or movement
 */
export type MonsterSpecialAbility =
  | 'charge'          // Cultist: Rush attack for +1 damage
  | 'pack_tactics'    // Ghoul: +1 attack die per adjacent ghoul
  | 'drag_under'      // Deep One: Pull player into water
  | 'phasing'         // Nightgaunt: Move through walls
  | 'teleport'        // Hound: Teleport through angles
  | 'enrage'          // Shoggoth: Double attack when HP < 50%
  | 'summon'          // Priest: Summon 1-2 cultists
  | 'snipe'           // Sniper: +1 attack die at max range
  | 'swoop'           // Byakhee: Fly down, attack, fly up
  | 'regenerate'      // Formless Spawn: Heal 1 HP per turn
  | 'terrify'         // Hunting Horror: Force sanity check on sight
  | 'ranged_shot'     // Mi-Go/Moon Beast: Ranged attack
  | 'ritual'          // Dark Young: Increase doom by 1
  | 'cosmic_presence' // Star Spawn: All players -1 sanity per turn in range
  | 'devour';         // Boss: Instant kill on crit

/**
 * Monster combat style - how they approach fights
 */
export type MonsterCombatStyle =
  | 'berserker'       // Always charges, never retreats
  | 'cautious'        // Attacks when advantageous, retreats when hurt
  | 'tactical'        // Uses cover, flanks, coordinates with allies
  | 'hit_and_run'     // Attack then move away
  | 'siege'           // Stays at range, bombards
  | 'swarm'           // Coordinates with same type
  | 'ambush';         // Waits for opportunity, then strikes hard

/**
 * Extended monster personality traits
 */
export interface MonsterPersonality {
  aggressionLevel: number;        // 0-100: How likely to attack vs patrol
  cowardiceThreshold: number;     // HP% at which monster considers fleeing
  packMentality: boolean;         // Seeks out others of same type
  territorialRange: number;       // Tiles from spawn point before returning
  preferredTerrain?: TileCategory[];  // Tile types monster prefers
  avoidsTerrain?: TileCategory[];     // Tile types monster avoids
  combatStyle: MonsterCombatStyle;
  specialAbilities: MonsterSpecialAbility[];
  callForHelpChance: number;      // 0-100: Chance to alert nearby monsters
}

// ============================================================================
// NPC SURVIVOR SYSTEM
// ============================================================================

/**
 * Types of NPC survivors players can find and rescue
 */
export type SurvivorType =
  | 'civilian'        // Regular person, no special abilities
  | 'wounded'         // Needs medical attention, moves slowly
  | 'researcher'      // Gives clue/insight when rescued
  | 'cultist_defector'// Former cultist, knows enemy locations
  | 'child'           // Vulnerable, bonus sanity if saved
  | 'asylum_patient'  // Unstable, may help or hinder
  | 'reporter'        // Documents events, bonus XP
  | 'occultist_ally'; // Can cast protective spell

/**
 * Survivor state
 */
export type SurvivorState =
  | 'hidden'          // Not yet discovered
  | 'found'           // Discovered but not rescued
  | 'following'       // Following a player
  | 'rescued'         // Successfully evacuated
  | 'dead'            // Killed by monsters
  | 'captured';       // Taken by enemies

/**
 * NPC Survivor - Rescuable NPCs that provide benefits
 */
export interface Survivor {
  id: string;
  name: string;
  type: SurvivorType;
  state: SurvivorState;
  position: { q: number; r: number };
  hp: number;
  maxHp: number;
  followingPlayerId?: string;     // Which player they're following

  // Behavior
  speed: number;                  // Movement speed (1 = normal, 0 = can't move alone)
  canDefendSelf: boolean;         // Can fight back against monsters
  panicLevel: number;             // 0-100, affects behavior

  // Rewards
  insightReward: number;          // Insight gained when rescued
  sanityReward: number;           // Sanity restored when rescued
  goldReward: number;             // Gold reward for rescue
  itemReward?: string;            // Specific item given on rescue
  clueReward?: string;            // Clue revealed on rescue

  // Special abilities
  specialAbility?: SurvivorSpecialAbility;
  abilityUsed?: boolean;

  // Dialogue
  foundDialogue: string;          // What they say when found
  followDialogue: string;         // What they say when following
  rescuedDialogue: string;        // What they say when rescued
}

/**
 * Special abilities survivors can provide
 */
export type SurvivorSpecialAbility =
  | 'heal_party'      // Heals 1 HP to all party members
  | 'reveal_map'      // Reveals nearby hidden tiles
  | 'ward'            // Creates protective barrier
  | 'distraction'     // Draws enemy attention
  | 'knowledge'       // Reveals enemy weaknesses
  | 'calm_aura';      // Reduces sanity loss nearby

/**
 * Survivor spawn configuration
 */
export interface SurvivorSpawnConfig {
  type: SurvivorType;
  weight: number;                 // Spawn probability weight
  minDoom: number;                // Minimum doom to spawn
  maxDoom: number;                // Maximum doom to spawn
  preferredTiles: TileCategory[]; // Where they're likely to be found
}

// Extended Enemy with AI state
export interface EnemyWithAI extends Enemy {
  aiState?: MonsterAIState;
  lastMoveRound?: number;
  personality?: MonsterPersonality;  // Enhanced personality traits
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
  spellParticles: SpellParticle[];  // Active spell visual effects
  screenShake: boolean;
  activeSpell: Spell | null;
  activeOccultistSpell: OccultistSpell | null;  // Hero Quest style spell waiting for target
  currentStepIndex: number;
  questItemsCollected: string[];
  exploredTiles: string[];
  pendingHorrorChecks: string[]; // Enemy IDs that need horror checks
  weatherState: WeatherState;    // Active weather conditions
  survivors: Survivor[];         // NPC survivors on the map
  rescuedSurvivors: string[];    // IDs of successfully rescued survivors
  // Quest item spawning state - tracks which items need to spawn and where
  objectiveSpawnState?: {
    questItems: {
      id: string;
      objectiveId: string;
      type: 'key' | 'clue' | 'collectible' | 'artifact' | 'component';
      name: string;
      description: string;
      spawned: boolean;
      spawnedOnTileId?: string;
      collected: boolean;
    }[];
    questTiles: {
      id: string;
      objectiveId: string;
      type: 'exit' | 'altar' | 'ritual_point' | 'npc_location' | 'boss_room';
      name: string;
      spawned: boolean;
      revealed: boolean;
      revealCondition?: 'objective_complete' | 'item_found' | 'doom_threshold';
      revealObjectiveId?: string;
    }[];
    tilesExplored: number;
    itemsCollected: number;
  };
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
  isDead: boolean;                      // Died in scenario
  hasPermadeath: boolean;               // If true, death is permanent - hero goes to memorial and is unplayable
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
