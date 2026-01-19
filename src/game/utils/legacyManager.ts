/**
 * Legacy Manager - Handles persistent hero data between scenarios
 *
 * Features:
 * - Hero archiving and retrieval
 * - Gold economy
 * - XP and leveling (1-5)
 * - Equipment stash
 * - Permadeath tracking
 * - LocalStorage persistence
 */

import {
  LegacyData,
  LegacyHero,
  EquipmentStash,
  CharacterType,
  CharacterAttributes,
  InventorySlots,
  Item,
  Player,
  ScenarioResult,
  HeroScenarioResult,
  LevelUpBonus,
  XP_THRESHOLDS,
  getLevelFromXP,
  getXPForNextLevel,
  canLevelUp,
  createDefaultLegacyData,
  createEmptyInventory,
  ShopItem,
  ShopInventory
} from '../types';
import { CHARACTERS } from '../constants';

// ============================================================================
// STORAGE KEYS
// ============================================================================

const LEGACY_STORAGE_KEY = 'shadows_1920s_legacy';
const LEGACY_VERSION = 1;

// ============================================================================
// CORE PERSISTENCE FUNCTIONS
// ============================================================================

/**
 * Load legacy data from localStorage
 */
export function loadLegacyData(): LegacyData {
  try {
    const saved = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved) as LegacyData;
      // Handle version migrations if needed
      if (data.version < LEGACY_VERSION) {
        return migrateLegacyData(data);
      }
      return data;
    }
  } catch (error) {
    console.error('Failed to load legacy data:', error);
  }
  return createDefaultLegacyData();
}

/**
 * Save legacy data to localStorage
 */
export function saveLegacyData(data: LegacyData): void {
  try {
    data.lastSaved = new Date().toISOString();
    localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save legacy data:', error);
  }
}

/**
 * Migrate legacy data between versions
 */
function migrateLegacyData(oldData: LegacyData): LegacyData {
  // Future migrations would go here
  return { ...oldData, version: LEGACY_VERSION };
}

/**
 * Reset all legacy data (use with caution!)
 */
export function resetLegacyData(): LegacyData {
  const newData = createDefaultLegacyData();
  saveLegacyData(newData);
  return newData;
}

// ============================================================================
// HERO MANAGEMENT
// ============================================================================

/**
 * Generate unique hero ID
 */
function generateHeroId(): string {
  return `hero_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get base attributes for a character class
 */
export function getBaseAttributesForClass(characterClass: CharacterType): CharacterAttributes {
  const character = CHARACTERS.find(c => c.id === characterClass);
  if (character) {
    return { ...character.attributes };
  }
  // Default balanced stats
  return { strength: 3, agility: 3, intellect: 3, willpower: 3 };
}

/**
 * Get base HP for a character class
 */
export function getBaseHpForClass(characterClass: CharacterType): number {
  const character = CHARACTERS.find(c => c.id === characterClass);
  return character?.maxHp || 6;
}

/**
 * Get base Sanity for a character class
 */
export function getBaseSanityForClass(characterClass: CharacterType): number {
  const character = CHARACTERS.find(c => c.id === characterClass);
  return character?.maxSanity || 6;
}

/**
 * Create a new legacy hero
 */
export function createLegacyHero(
  name: string,
  characterClass: CharacterType,
  portraitIndex: number = 0
): LegacyHero {
  const baseAttributes = getBaseAttributesForClass(characterClass);
  const now = new Date().toISOString();

  return {
    id: generateHeroId(),
    name,
    characterClass,
    portraitIndex,
    level: 1,
    currentXP: 0,
    levelUpBonuses: [],
    gold: 0,
    baseAttributes,
    bonusAttributes: { strength: 0, agility: 0, intellect: 0, willpower: 0 },
    maxHp: getBaseHpForClass(characterClass),
    maxSanity: getBaseSanityForClass(characterClass),
    equipment: createEmptyInventory(),
    scenariosCompleted: [],
    scenariosFailed: [],
    totalKills: 0,
    totalInsightEarned: 0,
    dateCreated: now,
    lastPlayed: now,
    isRetired: false,
    isDead: false
  };
}

/**
 * Add a new hero to the archive
 */
export function addHeroToArchive(data: LegacyData, hero: LegacyHero): LegacyData {
  return {
    ...data,
    heroes: [...data.heroes, hero]
  };
}

/**
 * Get all living heroes (not dead, not retired)
 */
export function getLivingHeroes(data: LegacyData): LegacyHero[] {
  return data.heroes.filter(h => !h.isDead && !h.isRetired);
}

/**
 * Get all dead heroes (for memorial/graveyard)
 */
export function getDeadHeroes(data: LegacyData): LegacyHero[] {
  return data.heroes.filter(h => h.isDead);
}

/**
 * Get a specific hero by ID
 */
export function getHeroById(data: LegacyData, heroId: string): LegacyHero | undefined {
  return data.heroes.find(h => h.id === heroId);
}

/**
 * Update a hero in the archive
 */
export function updateHero(data: LegacyData, updatedHero: LegacyHero): LegacyData {
  return {
    ...data,
    heroes: data.heroes.map(h => h.id === updatedHero.id ? updatedHero : h)
  };
}

/**
 * Delete a hero permanently (use with caution!)
 */
export function deleteHero(data: LegacyData, heroId: string): LegacyData {
  return {
    ...data,
    heroes: data.heroes.filter(h => h.id !== heroId)
  };
}

// ============================================================================
// PERMADEATH
// ============================================================================

/**
 * Mark a hero as dead (permadeath)
 */
export function killHero(
  data: LegacyData,
  heroId: string,
  scenarioId: string,
  deathCause: string
): LegacyData {
  const hero = getHeroById(data, heroId);
  if (!hero) return data;

  const deadHero: LegacyHero = {
    ...hero,
    isDead: true,
    deathScenario: scenarioId,
    deathCause,
    lastPlayed: new Date().toISOString()
  };

  // Move any equipped items to stash before death
  const itemsFromHero = getAllEquippedItems(hero.equipment);
  const updatedStash = addItemsToStash(data.stash, itemsFromHero);

  return {
    ...data,
    heroes: data.heroes.map(h => h.id === heroId ? { ...deadHero, equipment: createEmptyInventory() } : h),
    stash: updatedStash
  };
}

/**
 * Retire a hero (voluntary, not death)
 */
export function retireHero(data: LegacyData, heroId: string): LegacyData {
  const hero = getHeroById(data, heroId);
  if (!hero) return data;

  // Move equipment to stash
  const itemsFromHero = getAllEquippedItems(hero.equipment);
  const updatedStash = addItemsToStash(data.stash, itemsFromHero);

  return {
    ...data,
    heroes: data.heroes.map(h =>
      h.id === heroId
        ? { ...h, isRetired: true, equipment: createEmptyInventory(), lastPlayed: new Date().toISOString() }
        : h
    ),
    stash: updatedStash
  };
}

// ============================================================================
// XP AND LEVELING
// ============================================================================

/**
 * Add XP to a hero
 */
export function addXPToHero(hero: LegacyHero, xpGained: number): LegacyHero {
  const newXP = hero.currentXP + xpGained;
  const newLevel = getLevelFromXP(newXP);

  return {
    ...hero,
    currentXP: newXP,
    level: Math.max(hero.level, newLevel) // Level can only go up, not down
  };
}

/**
 * Apply a level up bonus to a hero
 */
export function applyLevelUpBonus(hero: LegacyHero, bonus: LevelUpBonus): LegacyHero {
  const levelUpChoice = { level: hero.level, bonus };
  let updatedHero = { ...hero, levelUpBonuses: [...hero.levelUpBonuses, levelUpChoice] };

  switch (bonus.type) {
    case 'attribute':
      updatedHero.bonusAttributes = {
        ...updatedHero.bonusAttributes,
        [bonus.attribute]: updatedHero.bonusAttributes[bonus.attribute] + 1
      };
      break;
    case 'maxHp':
      updatedHero.maxHp += bonus.value;
      break;
    case 'maxSanity':
      updatedHero.maxSanity += bonus.value;
      break;
  }

  return updatedHero;
}

/**
 * Get available level up options
 */
export function getLevelUpOptions(): LevelUpBonus[] {
  return [
    { type: 'attribute', attribute: 'strength' },
    { type: 'attribute', attribute: 'agility' },
    { type: 'attribute', attribute: 'intellect' },
    { type: 'attribute', attribute: 'willpower' },
    { type: 'maxHp', value: 2 },
    { type: 'maxSanity', value: 1 }
  ];
}

/**
 * Calculate XP progress for display
 */
export function getXPProgress(hero: LegacyHero): { current: number; needed: number; percent: number } {
  if (hero.level >= 5) {
    return { current: hero.currentXP, needed: 0, percent: 100 };
  }

  const currentThreshold = XP_THRESHOLDS[hero.level];
  const nextThreshold = XP_THRESHOLDS[hero.level + 1];
  const xpInLevel = hero.currentXP - currentThreshold;
  const xpNeeded = nextThreshold - currentThreshold;
  const percent = Math.floor((xpInLevel / xpNeeded) * 100);

  return { current: xpInLevel, needed: xpNeeded, percent };
}

// ============================================================================
// GOLD ECONOMY
// ============================================================================

/**
 * Add gold to a hero
 */
export function addGoldToHero(hero: LegacyHero, goldGained: number): LegacyHero {
  return {
    ...hero,
    gold: hero.gold + goldGained
  };
}

/**
 * Spend gold from a hero (returns null if insufficient)
 */
export function spendGold(hero: LegacyHero, amount: number): LegacyHero | null {
  if (hero.gold < amount) return null;
  return {
    ...hero,
    gold: hero.gold - amount
  };
}

/**
 * Calculate gold rewards for scenario completion
 */
export function calculateScenarioGoldReward(
  victory: boolean,
  difficulty: 'Normal' | 'Hard' | 'Nightmare',
  bonusObjectivesCompleted: number
): { base: number; bonus: number } {
  const difficultyMultiplier = { Normal: 1, Hard: 1.5, Nightmare: 2 };
  const baseGold = victory ? 25 : 5; // Small consolation prize for defeat
  const bonusGold = bonusObjectivesCompleted * 10;

  return {
    base: Math.floor(baseGold * difficultyMultiplier[difficulty]),
    bonus: Math.floor(bonusGold * difficultyMultiplier[difficulty])
  };
}

/**
 * Calculate XP rewards for scenario completion
 */
export function calculateScenarioXPReward(
  victory: boolean,
  difficulty: 'Normal' | 'Hard' | 'Nightmare',
  killCount: number,
  bonusObjectivesCompleted: number
): { base: number; kills: number; bonus: number } {
  const difficultyMultiplier = { Normal: 1, Hard: 1.5, Nightmare: 2 };
  const baseXP = victory ? 30 : 10;
  const killXP = killCount * 2;
  const bonusXP = bonusObjectivesCompleted * 15;

  return {
    base: Math.floor(baseXP * difficultyMultiplier[difficulty]),
    kills: Math.floor(killXP * difficultyMultiplier[difficulty]),
    bonus: Math.floor(bonusXP * difficultyMultiplier[difficulty])
  };
}

// ============================================================================
// EQUIPMENT STASH
// ============================================================================

/**
 * Get all equipped items from inventory slots
 */
export function getAllEquippedItems(inventory: InventorySlots): Item[] {
  const items: Item[] = [];
  if (inventory.leftHand) items.push(inventory.leftHand);
  if (inventory.rightHand) items.push(inventory.rightHand);
  if (inventory.body) items.push(inventory.body);
  inventory.bag.forEach(item => {
    if (item) items.push(item);
  });
  return items;
}

/**
 * Add items to stash
 */
export function addItemsToStash(stash: EquipmentStash, items: Item[]): EquipmentStash {
  const newItems = [...stash.items];
  for (const item of items) {
    if (newItems.length < stash.maxCapacity) {
      newItems.push(item);
    }
  }
  return { ...stash, items: newItems };
}

/**
 * Add single item to stash
 */
export function addItemToStash(stash: EquipmentStash, item: Item): EquipmentStash | null {
  if (stash.items.length >= stash.maxCapacity) return null;
  return { ...stash, items: [...stash.items, item] };
}

/**
 * Remove item from stash by index
 */
export function removeItemFromStash(stash: EquipmentStash, index: number): { stash: EquipmentStash; item: Item | null } {
  if (index < 0 || index >= stash.items.length) {
    return { stash, item: null };
  }
  const item = stash.items[index];
  const newItems = [...stash.items];
  newItems.splice(index, 1);
  return { stash: { ...stash, items: newItems }, item };
}

/**
 * Check if stash is full
 */
export function isStashFull(stash: EquipmentStash): boolean {
  return stash.items.length >= stash.maxCapacity;
}

// ============================================================================
// SCENARIO COMPLETION
// ============================================================================

/**
 * Process scenario completion and update legacy data
 */
export function processScenarioCompletion(
  data: LegacyData,
  result: ScenarioResult
): LegacyData {
  let updatedData = { ...data };

  // Update global stats
  updatedData.totalScenariosAttempted++;
  if (result.victory) {
    updatedData.totalScenariosCompleted++;
  }
  updatedData.totalGoldEarned += result.totalGoldEarned;

  // Process each hero's results
  for (const heroResult of result.heroResults) {
    const hero = getHeroById(updatedData, heroResult.heroId);
    if (!hero) continue;

    if (!heroResult.survived) {
      // Hero died - permadeath
      updatedData = killHero(
        updatedData,
        heroResult.heroId,
        result.scenarioId,
        'Fell during the investigation'
      );
    } else {
      // Hero survived - apply rewards
      let updatedHero = { ...hero };

      // Add XP
      updatedHero = addXPToHero(updatedHero, heroResult.xpEarned);

      // Add gold
      updatedHero = addGoldToHero(updatedHero, heroResult.goldEarned);

      // Update stats
      updatedHero.totalKills += heroResult.killCount;
      updatedHero.totalInsightEarned += heroResult.insightEarned;
      updatedHero.lastPlayed = new Date().toISOString();

      // Track scenario
      if (result.victory) {
        if (!updatedHero.scenariosCompleted.includes(result.scenarioId)) {
          updatedHero.scenariosCompleted.push(result.scenarioId);
        }
      } else {
        if (!updatedHero.scenariosFailed.includes(result.scenarioId)) {
          updatedHero.scenariosFailed.push(result.scenarioId);
        }
      }

      updatedData = updateHero(updatedData, updatedHero);

      // Add found items to stash
      updatedData.stash = addItemsToStash(updatedData.stash, heroResult.itemsFound);
    }
  }

  return updatedData;
}

// ============================================================================
// CONVERT BETWEEN PLAYER AND LEGACY HERO
// ============================================================================

/**
 * Convert a LegacyHero to a Player for in-game use
 */
export function legacyHeroToPlayer(hero: LegacyHero): Player {
  const character = CHARACTERS.find(c => c.id === hero.characterClass);

  const effectiveAttributes: CharacterAttributes = {
    strength: hero.baseAttributes.strength + hero.bonusAttributes.strength,
    agility: hero.baseAttributes.agility + hero.bonusAttributes.agility,
    intellect: hero.baseAttributes.intellect + hero.bonusAttributes.intellect,
    willpower: hero.baseAttributes.willpower + hero.bonusAttributes.willpower
  };

  return {
    id: hero.characterClass,
    name: hero.name,
    hp: hero.maxHp,
    maxHp: hero.maxHp,
    sanity: hero.maxSanity,
    maxSanity: hero.maxSanity,
    insight: 0, // Reset for new scenario
    attributes: effectiveAttributes,
    special: character?.special || '',
    specialAbility: character?.specialAbility || 'investigate_bonus',
    position: { q: 0, r: 0 },
    inventory: { ...hero.equipment, bag: [...hero.equipment.bag] },
    spells: [],
    actions: 2,
    isDead: false,
    madness: [],
    activeMadness: null,
    traits: []
  };
}

/**
 * Update a LegacyHero from Player state after scenario
 */
export function updateLegacyHeroFromPlayer(
  hero: LegacyHero,
  player: Player,
  survived: boolean
): LegacyHero {
  if (!survived) {
    return { ...hero, isDead: true };
  }

  return {
    ...hero,
    // Keep equipment that survived the scenario
    equipment: { ...player.inventory, bag: [...player.inventory.bag] },
    lastPlayed: new Date().toISOString()
  };
}

// ============================================================================
// SHOP SYSTEM
// ============================================================================

/**
 * Default shop inventory
 */
export function getDefaultShopInventory(): ShopInventory {
  return {
    weapons: [
      {
        item: { id: 'shop_revolver', name: 'Revolver', type: 'weapon', effect: '+2 combat damage', bonus: 2, slotType: 'hand' },
        goldCost: 30,
        stock: -1
      },
      {
        item: { id: 'shop_shotgun', name: 'Shotgun', type: 'weapon', effect: '+3 combat damage, short range', bonus: 3, slotType: 'hand' },
        goldCost: 50,
        stock: 2
      },
      {
        item: { id: 'shop_tommy', name: 'Tommy Gun', type: 'weapon', effect: '+4 combat damage, automatic', bonus: 4, slotType: 'hand' },
        goldCost: 100,
        stock: 1,
        requiredLevel: 3
      },
      {
        item: { id: 'shop_knife', name: 'Combat Knife', type: 'weapon', effect: '+1 combat damage, silent', bonus: 1, slotType: 'hand' },
        goldCost: 15,
        stock: -1
      }
    ],
    tools: [
      {
        item: { id: 'shop_flashlight', name: 'Flashlight', type: 'tool', effect: 'Provides light', isLightSource: true, slotType: 'hand' },
        goldCost: 10,
        stock: -1
      },
      {
        item: { id: 'shop_lockpick', name: 'Lockpick Set', type: 'tool', effect: '+1 die on lockpick checks', bonus: 1, slotType: 'hand' },
        goldCost: 20,
        stock: -1
      },
      {
        item: { id: 'shop_crowbar', name: 'Crowbar', type: 'tool', effect: '+1 die on strength checks', bonus: 1, slotType: 'hand' },
        goldCost: 15,
        stock: -1
      },
      {
        item: { id: 'shop_lantern', name: 'Oil Lantern', type: 'tool', effect: 'Provides bright light, can be thrown', isLightSource: true, slotType: 'hand' },
        goldCost: 25,
        stock: 3
      }
    ],
    armor: [
      {
        item: { id: 'shop_leather', name: 'Leather Jacket', type: 'armor', effect: '-1 damage from physical attacks', slotType: 'body' },
        goldCost: 35,
        stock: -1
      },
      {
        item: { id: 'shop_trench', name: 'Trench Coat', type: 'armor', effect: '+1 bag slot equivalent', slotType: 'body' },
        goldCost: 25,
        stock: -1
      },
      {
        item: { id: 'shop_vest', name: 'Armored Vest', type: 'armor', effect: '-2 damage from physical attacks', slotType: 'body' },
        goldCost: 75,
        stock: 1,
        requiredLevel: 2
      }
    ],
    consumables: [
      {
        item: { id: 'shop_medkit', name: 'Medical Kit', type: 'consumable', effect: 'Heal 3 HP', uses: 2, maxUses: 2, slotType: 'bag' },
        goldCost: 20,
        stock: -1
      },
      {
        item: { id: 'shop_whiskey', name: 'Old Whiskey', type: 'consumable', effect: 'Restore 2 Sanity', uses: 1, maxUses: 1, slotType: 'bag' },
        goldCost: 10,
        stock: -1
      },
      {
        item: { id: 'shop_bandage', name: 'Bandages', type: 'consumable', effect: 'Heal 1 HP', uses: 3, maxUses: 3, slotType: 'bag' },
        goldCost: 5,
        stock: -1
      },
      {
        item: { id: 'shop_sedative', name: 'Sedatives', type: 'consumable', effect: 'Restore 3 Sanity, -1 action next turn', uses: 1, maxUses: 1, slotType: 'bag' },
        goldCost: 15,
        stock: 5
      }
    ],
    relics: [
      {
        item: { id: 'shop_elder_sign', name: 'Elder Sign', type: 'relic', effect: 'Open sealed doors, banish spirits', slotType: 'bag' },
        goldCost: 150,
        stock: 1,
        requiredLevel: 3
      },
      {
        item: { id: 'shop_ward', name: 'Protective Ward', type: 'relic', effect: 'Reduce horror damage by 1', slotType: 'bag' },
        goldCost: 60,
        stock: 2
      },
      {
        item: { id: 'shop_compass', name: 'Eldritch Compass', type: 'relic', effect: 'Reveals adjacent hidden tiles', slotType: 'bag' },
        goldCost: 80,
        stock: 1,
        requiredLevel: 2
      }
    ]
  };
}

/**
 * Purchase an item from the shop
 */
export function purchaseShopItem(
  hero: LegacyHero,
  shopItem: ShopItem
): { hero: LegacyHero; success: boolean; message: string } {
  // Check level requirement
  if (shopItem.requiredLevel && hero.level < shopItem.requiredLevel) {
    return { hero, success: false, message: `Requires level ${shopItem.requiredLevel}` };
  }

  // Check gold
  if (hero.gold < shopItem.goldCost) {
    return { hero, success: false, message: 'Not enough gold' };
  }

  // Check stock
  if (shopItem.stock === 0) {
    return { hero, success: false, message: 'Out of stock' };
  }

  // Check inventory space (simplified check)
  const itemCount = getAllEquippedItems(hero.equipment).length;
  if (itemCount >= 7) {
    return { hero, success: false, message: 'Inventory full' };
  }

  // Make purchase
  const updatedHero = spendGold(hero, shopItem.goldCost);
  if (!updatedHero) {
    return { hero, success: false, message: 'Transaction failed' };
  }

  // Decrement stock if not unlimited
  if (shopItem.stock > 0) {
    shopItem.stock--;
  }

  return {
    hero: updatedHero,
    success: true,
    message: `Purchased ${shopItem.item.name} for ${shopItem.goldCost} gold`
  };
}
