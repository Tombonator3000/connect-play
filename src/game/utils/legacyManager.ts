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
  SkillMasteryType,
  XP_THRESHOLDS,
  getLevelFromXP,
  getXPForNextLevel,
  canLevelUp,
  createDefaultLegacyData,
  createEmptyInventory,
  ShopItem,
  ShopInventory
} from '../types';
import { CHARACTERS, SPELLS, HQ_WEAPONS, HQ_ARMOR } from '../constants';

// Re-export for external consumers
export { createDefaultLegacyData };

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
  const character = CHARACTERS[characterClass];
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
  const character = CHARACTERS[characterClass];
  return character?.maxHp || 6;
}

/**
 * Get base Sanity for a character class
 */
export function getBaseSanityForClass(characterClass: CharacterType): number {
  const character = CHARACTERS[characterClass];
  return character?.maxSanity || 6;
}

/**
 * Create a new legacy hero
 */
export function createLegacyHero(
  name: string,
  characterClass: CharacterType,
  portraitIndex: number = 0,
  hasPermadeath: boolean = false
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
    isDead: false,
    hasPermadeath,
    // Extended leveling system (v2)
    bonusActionPoints: 0,
    bonusAttackDice: 0,
    bonusDefenseDice: 0,
    skillMasteries: [],
    milestones: [],
    // Survivor tracking
    scenariosSurvivedStreak: 0,
    survivorTraits: [],
    survivorTitle: undefined,
    // Class-specific bonuses
    classBonuses: [],
    // Field Guide - persistent monster encounters
    encounteredEnemies: []
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
// DEATH AND PERMADEATH
// ============================================================================

/**
 * Handle hero death - behavior depends on hasPermadeath flag
 * - hasPermadeath = true: Hero is permanently dead (goes to memorial)
 * - hasPermadeath = false: Hero loses equipment but can continue playing
 */
export function killHero(
  data: LegacyData,
  heroId: string,
  scenarioId: string,
  deathCause: string
): LegacyData {
  const hero = getHeroById(data, heroId);
  if (!hero) return data;

  // Move any equipped items to stash regardless of permadeath
  const itemsFromHero = getAllEquippedItems(hero.equipment);
  const updatedStash = addItemsToStash(data.stash, itemsFromHero);

  if (hero.hasPermadeath) {
    // Permadeath hero - permanently dead, goes to memorial
    const deadHero: LegacyHero = {
      ...hero,
      isDead: true,
      deathScenario: scenarioId,
      deathCause,
      equipment: createEmptyInventory(),
      lastPlayed: new Date().toISOString()
    };

    return {
      ...data,
      heroes: data.heroes.map(h => h.id === heroId ? deadHero : h),
      stash: updatedStash
    };
  } else {
    // Non-permadeath hero - loses equipment but survives
    const survivedHero: LegacyHero = {
      ...hero,
      equipment: createEmptyInventory(),
      lastPlayed: new Date().toISOString()
    };

    return {
      ...data,
      heroes: data.heroes.map(h => h.id === heroId ? survivedHero : h),
      stash: updatedStash
    };
  }
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
  let updatedHero: LegacyHero = {
    ...hero,
    levelUpBonuses: [...hero.levelUpBonuses, levelUpChoice],
    // Ensure arrays exist for older heroes
    skillMasteries: hero.skillMasteries || [],
    milestones: hero.milestones || [],
    survivorTraits: hero.survivorTraits || [],
    classBonuses: hero.classBonuses || []
  };

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
    case 'actionPoint':
      updatedHero.bonusActionPoints = (updatedHero.bonusActionPoints || 0) + bonus.value;
      break;
    case 'attackDie':
      updatedHero.bonusAttackDice = (updatedHero.bonusAttackDice || 0) + bonus.value;
      break;
    case 'defenseDie':
      updatedHero.bonusDefenseDice = (updatedHero.bonusDefenseDice || 0) + bonus.value;
      break;
    case 'skillMastery':
      if (!updatedHero.skillMasteries.includes(bonus.skill)) {
        updatedHero.skillMasteries = [...updatedHero.skillMasteries, bonus.skill];
      }
      break;
  }

  return updatedHero;
}

/**
 * Get available level up options based on hero level
 * Some bonuses are only available at higher levels
 */
export function getLevelUpOptions(heroLevel: number = 1): LevelUpBonus[] {
  const baseOptions: LevelUpBonus[] = [
    { type: 'attribute', attribute: 'strength' },
    { type: 'attribute', attribute: 'agility' },
    { type: 'attribute', attribute: 'intellect' },
    { type: 'attribute', attribute: 'willpower' },
    { type: 'maxHp', value: 2 },
    { type: 'maxSanity', value: 1 }
  ];

  // Skill mastery available from level 2+
  if (heroLevel >= 2) {
    baseOptions.push(
      { type: 'skillMastery', skill: 'investigation' },
      { type: 'skillMastery', skill: 'combat' },
      { type: 'skillMastery', skill: 'occult' },
      { type: 'skillMastery', skill: 'athletics' }
    );
  }

  // Attack/Defense dice available from level 4+
  if (heroLevel >= 4) {
    baseOptions.push(
      { type: 'attackDie', value: 1 },
      { type: 'defenseDie', value: 1 }
    );
  }

  return baseOptions;
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
 * Now uses hero.id as the player ID to enable proper hero-player mapping
 * Includes all leveling bonuses (AP, attack/defense dice, milestones)
 */
export function legacyHeroToPlayer(hero: LegacyHero): Player {
  const character = CHARACTERS[hero.characterClass];

  const effectiveAttributes: CharacterAttributes = {
    strength: hero.baseAttributes.strength + hero.bonusAttributes.strength,
    agility: hero.baseAttributes.agility + hero.bonusAttributes.agility,
    intellect: hero.baseAttributes.intellect + hero.bonusAttributes.intellect,
    willpower: hero.baseAttributes.willpower + hero.bonusAttributes.willpower
  };

  // Professor gets scholarly spells (True Sight, Mend Flesh) automatically
  // Occultist gets spells via SpellSelectionModal (handled in ShadowsGame.tsx)
  const characterSpells = hero.characterClass === 'professor'
    ? SPELLS.filter(s => s.id === 'reveal' || s.id === 'mend')
    : [];

  // Calculate automatic AP bonus based on level (level 3 = +1, level 5 = +2)
  const automaticAPBonus = hero.level >= 5 ? 2 : hero.level >= 3 ? 1 : 0;
  const manualAPBonus = hero.bonusActionPoints || 0;
  const totalActions = 2 + automaticAPBonus + manualAPBonus;

  // Calculate attack/defense dice bonuses
  const bonusAttackDice = hero.bonusAttackDice || 0;
  const bonusDefenseDice = hero.bonusDefenseDice || 0;

  // Level 5 milestone "Legend" gives +1 starting Insight
  const startingInsight = hero.level >= 5 ? 1 : 0;

  return {
    id: hero.characterClass,  // Use character class as the id (CharacterType)
    heroId: hero.id,  // Store unique hero ID for tracking
    name: hero.name,
    hp: hero.maxHp,
    maxHp: hero.maxHp,
    sanity: hero.maxSanity,
    maxSanity: hero.maxSanity,
    insight: startingInsight, // Level 5 heroes start with +1 Insight
    attributes: effectiveAttributes,
    special: character?.special || '',
    specialAbility: character?.specialAbility || 'investigate_bonus',
    // Hero Quest combat stats with level bonuses
    baseAttackDice: (character?.baseAttackDice || 1) + bonusAttackDice,
    baseDefenseDice: (character?.baseDefenseDice || 1) + bonusDefenseDice,
    position: { q: 0, r: 0 },
    // Start each scenario with fresh quest items (never inherit from previous scenarios)
    inventory: { ...hero.equipment, bag: [...hero.equipment.bag], questItems: [] },
    spells: characterSpells,
    actions: totalActions,
    maxActions: totalActions,  // Store max actions for turn reset
    isDead: false,
    madness: [],
    activeMadness: null,
    traits: [],
    // Custom portrait from legacy hero
    customPortraitUrl: hero.customPortraitUrl
  };
}

/**
 * Update a LegacyHero from Player state after scenario
 * If hero has permadeath enabled and didn't survive, they are permanently dead (isDead: true)
 * If hero doesn't have permadeath and didn't survive, they lose their equipment but can continue playing
 */
export function updateLegacyHeroFromPlayer(
  hero: LegacyHero,
  player: Player,
  survived: boolean
): LegacyHero {
  if (!survived) {
    if (hero.hasPermadeath) {
      // Permadeath hero dies permanently - goes to memorial
      return {
        ...hero,
        isDead: true,
        lastPlayed: new Date().toISOString()
      };
    } else {
      // Non-permadeath hero loses their equipped items but survives
      // They keep their stats, XP, gold, etc.
      return {
        ...hero,
        equipment: createEmptyInventory(), // Lose all equipment
        lastPlayed: new Date().toISOString()
      };
    }
  }

  // Keep equipment that survived the scenario, but ALWAYS clear quest items
  // Quest items are scenario-specific and should never persist between scenarios
  return {
    ...hero,
    equipment: {
      ...player.inventory,
      bag: [...player.inventory.bag],
      questItems: []  // Always clear quest items between scenarios
    },
    lastPlayed: new Date().toISOString()
  };
}

// ============================================================================
// SHOP SYSTEM
// ============================================================================

/**
 * Default shop inventory - dynamically generated from HQ_WEAPONS and HQ_ARMOR
 * All weapons and armor from constants.ts are now available in the shop!
 */
export function getDefaultShopInventory(): ShopInventory {
  // Generate weapon shop items from HQ_WEAPONS (skip 'unarmed')
  const weapons: ShopItem[] = HQ_WEAPONS
    .filter(w => w.id !== 'unarmed')
    .map(weapon => {
      // Build effect description
      const effects: string[] = [];
      effects.push(`${weapon.attackDice} attack dice`);
      if (weapon.weaponType === 'ranged') {
        effects.push(`range ${weapon.range || 2}`);
        if (weapon.ammo && weapon.ammo > 0) effects.push(`${weapon.ammo} shots`);
      }
      if (weapon.silent) effects.push('silent');
      if (weapon.notes) effects.push(weapon.notes);

      // Determine stock based on rarity (goldCost)
      let stock = -1; // unlimited
      if (weapon.goldCost >= 400) stock = 1;
      else if (weapon.goldCost >= 200) stock = 2;
      else if (weapon.goldCost >= 100) stock = 3;

      // Shop gold cost is adjusted (roughly 10-20% of original)
      const shopGoldCost = Math.max(10, Math.round(weapon.goldCost / 5));

      return {
        item: {
          id: `shop_${weapon.id}`,
          name: weapon.name,
          type: 'weapon' as const,
          effect: effects.join(', '),
          attackDice: weapon.attackDice,
          weaponType: weapon.weaponType,
          range: weapon.range,
          ammo: weapon.ammo,
          silent: weapon.silent,
          slotType: 'hand' as const
        },
        goldCost: shopGoldCost,
        stock,
        requiredLevel: weapon.requiredLevel,
        isNew: ['brass_knuckles', 'fire_axe', 'cavalry_saber', 'sledgehammer', 'ceremonial_dagger', 'switchblade', 'war_trophy_club', 'flare_gun', 'crossbow', 'hunting_rifle', 'sawed_off', 'luger', 'throwing_knives'].includes(weapon.id)
      };
    });

  // Generate armor shop items from HQ_ARMOR (skip 'none')
  const armor: ShopItem[] = HQ_ARMOR
    .filter(a => a.id !== 'none')
    .map(armorItem => {
      // Build effect description
      const effects: string[] = [];
      effects.push(`+${armorItem.defenseDice} defense ${armorItem.defenseDice === 1 ? 'die' : 'dice'}`);
      if (armorItem.notes) effects.push(armorItem.notes);

      // Determine stock based on rarity
      let stock = -1;
      if (armorItem.goldCost >= 500) stock = 1;
      else if (armorItem.goldCost >= 300) stock = 2;

      // Shop gold cost adjusted
      const shopGoldCost = Math.max(15, Math.round(armorItem.goldCost / 5));

      return {
        item: {
          id: `shop_${armorItem.id}`,
          name: armorItem.name,
          type: 'armor' as const,
          effect: effects.join(', '),
          defenseDice: armorItem.defenseDice,
          slotType: 'body' as const
        },
        goldCost: shopGoldCost,
        stock,
        requiredLevel: armorItem.requiredLevel,
        isNew: ['wool_overcoat', 'police_vest', 'cultist_robes', 'ritual_vestments', 'explorers_jacket', 'sailors_coat', 'chain_mail_vest', 'elder_mantle'].includes(armorItem.id)
      };
    });

  return {
    weapons,
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
      },
      {
        item: { id: 'shop_rope', name: 'Climbing Rope', type: 'tool', effect: '+1 die on climbing checks', bonus: 1, slotType: 'bag' },
        goldCost: 15,
        stock: -1,
        isNew: true
      },
      {
        item: { id: 'shop_binoculars', name: 'Binoculars', type: 'tool', effect: 'Reveal adjacent tiles', slotType: 'bag' },
        goldCost: 30,
        stock: 2,
        isNew: true
      }
    ],
    armor,
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
      },
      {
        item: { id: 'shop_stimpak', name: 'Adrenaline Shot', type: 'consumable', effect: '+1 action this turn', uses: 1, maxUses: 1, slotType: 'bag' },
        goldCost: 35,
        stock: 2,
        requiredLevel: 2,
        isNew: true
      },
      {
        item: { id: 'shop_antidote', name: 'Antidote', type: 'consumable', effect: 'Cures poison', uses: 1, maxUses: 1, slotType: 'bag' },
        goldCost: 20,
        stock: 3,
        isNew: true
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
      },
      {
        item: { id: 'shop_silver_mirror', name: 'Silver Mirror', type: 'relic', effect: '+1 die vs spirits, reveals hidden enemies', slotType: 'bag' },
        goldCost: 100,
        stock: 1,
        requiredLevel: 2,
        isNew: true
      },
      {
        item: { id: 'shop_binding_chains', name: 'Binding Chains', type: 'relic', effect: 'Immobilize enemy for 1 turn', slotType: 'bag' },
        goldCost: 120,
        stock: 1,
        requiredLevel: 3,
        isNew: true
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

// ============================================================================
// SELL SYSTEM - The Fence buys items at reduced prices
// ============================================================================

/**
 * Sell price modifier - The Fence pays 50% of shop value
 * This is standard for roguelite games - you buy high, sell low
 */
const SELL_PRICE_MODIFIER = 0.5;

/**
 * Base prices for items (matches shop prices)
 * Used to calculate sell value for both shop items and loot
 */
const ITEM_BASE_PRICES: Record<string, number> = {
  // Weapons
  'shop_revolver': 30,
  'shop_shotgun': 50,
  'shop_tommy': 100,
  'shop_knife': 15,
  'revolver': 30,
  'shotgun': 50,
  'tommy_gun': 100,
  'knife': 15,
  'derringer': 20,
  'rifle': 60,
  'machete': 25,

  // Tools
  'shop_flashlight': 10,
  'shop_lockpick': 20,
  'shop_crowbar': 15,
  'shop_lantern': 25,
  'flashlight': 10,
  'lockpick': 20,
  'crowbar': 15,
  'lantern': 25,
  'rope': 10,

  // Armor
  'shop_leather': 35,
  'shop_trench': 25,
  'shop_vest': 75,
  'leather_jacket': 35,
  'trench_coat': 25,
  'armored_vest': 75,

  // Consumables
  'shop_medkit': 20,
  'shop_whiskey': 10,
  'shop_bandage': 5,
  'shop_sedative': 15,
  'medkit': 20,
  'first_aid': 20,
  'whiskey': 10,
  'bandage': 5,
  'bandages': 5,
  'sedative': 15,
  'sedatives': 15,

  // Relics
  'shop_elder_sign': 150,
  'shop_ward': 60,
  'shop_compass': 80,
  'elder_sign': 150,
  'protective_ward': 60,
  'eldritch_compass': 80,
  'necronomicon': 100,
  'ritual_candles': 15,

  // Keys (low value - common items)
  'key': 2,
  'common_key': 2,
  'specific_key': 5,
  'master_key': 25
};

/**
 * Default prices by item type for items not in the price list
 */
const DEFAULT_PRICES_BY_TYPE: Record<string, number> = {
  'weapon': 20,
  'tool': 10,
  'armor': 30,
  'consumable': 8,
  'relic': 50,
  'key': 2,
  'clue': 5,
  'artifact': 40
};

/**
 * Get the base price for an item (what Fence would normally sell it for)
 */
export function getItemBasePrice(item: Item): number {
  // First check by exact ID
  if (ITEM_BASE_PRICES[item.id]) {
    return ITEM_BASE_PRICES[item.id];
  }

  // Check by lowercase ID
  const lowerId = item.id.toLowerCase();
  if (ITEM_BASE_PRICES[lowerId]) {
    return ITEM_BASE_PRICES[lowerId];
  }

  // Check by name (lowercase, replace spaces with underscores)
  const nameKey = item.name.toLowerCase().replace(/\s+/g, '_');
  if (ITEM_BASE_PRICES[nameKey]) {
    return ITEM_BASE_PRICES[nameKey];
  }

  // Fall back to type-based pricing
  if (item.type && DEFAULT_PRICES_BY_TYPE[item.type]) {
    return DEFAULT_PRICES_BY_TYPE[item.type];
  }

  // Ultimate fallback
  return 5;
}

/**
 * Get the sell price for an item (what The Fence will pay)
 * Returns 50% of base price, minimum 1 gold
 */
export function getItemSellPrice(item: Item): number {
  const basePrice = getItemBasePrice(item);
  const sellPrice = Math.floor(basePrice * SELL_PRICE_MODIFIER);
  return Math.max(1, sellPrice); // Minimum 1 gold
}

/**
 * Sell an item to The Fence
 * Removes item from hero inventory and adds gold
 */
export function sellItemToFence(
  hero: LegacyHero,
  item: Item
): { hero: LegacyHero; success: boolean; goldEarned: number; message: string } {
  const sellPrice = getItemSellPrice(item);

  // Remove item from hero equipment
  const newEquipment = { ...hero.equipment, bag: [...hero.equipment.bag] };
  let itemRemoved = false;

  if (newEquipment.leftHand?.id === item.id) {
    newEquipment.leftHand = null;
    itemRemoved = true;
  } else if (newEquipment.rightHand?.id === item.id) {
    newEquipment.rightHand = null;
    itemRemoved = true;
  } else if (newEquipment.body?.id === item.id) {
    newEquipment.body = null;
    itemRemoved = true;
  } else {
    const bagIdx = newEquipment.bag.findIndex(i => i?.id === item.id);
    if (bagIdx !== -1) {
      newEquipment.bag[bagIdx] = null;
      itemRemoved = true;
    }
  }

  if (!itemRemoved) {
    return {
      hero,
      success: false,
      goldEarned: 0,
      message: `Could not find ${item.name} in inventory`
    };
  }

  // Add gold to hero
  const updatedHero: LegacyHero = {
    ...hero,
    equipment: newEquipment,
    gold: hero.gold + sellPrice
  };

  return {
    hero: updatedHero,
    success: true,
    goldEarned: sellPrice,
    message: `Sold ${item.name} for ${sellPrice} gold`
  };
}

/**
 * Sell an item from the stash
 * Removes item from stash and returns gold value
 */
export function sellStashItem(
  stash: EquipmentStash,
  itemIndex: number
): { stash: EquipmentStash; success: boolean; goldEarned: number; message: string } {
  if (itemIndex < 0 || itemIndex >= stash.items.length) {
    return {
      stash,
      success: false,
      goldEarned: 0,
      message: 'Item not found in stash'
    };
  }

  const item = stash.items[itemIndex];
  const sellPrice = getItemSellPrice(item);

  // Remove item from stash
  const newItems = [...stash.items];
  newItems.splice(itemIndex, 1);

  return {
    stash: { ...stash, items: newItems },
    success: true,
    goldEarned: sellPrice,
    message: `Sold ${item.name} for ${sellPrice} gold`
  };
}
