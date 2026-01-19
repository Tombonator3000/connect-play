import { Character, CharacterType, Item, EventCard, Tile, Scenario, Madness, Spell, BestiaryEntry, EnemyType, Obstacle, ObstacleType, EdgeData } from './types';

export const SPELLS: Spell[] = [
  { id: 'wither', name: 'Wither', cost: 2, description: 'Drains life force from a target.', effectType: 'damage', value: 2, range: 3 },
  { id: 'mend', name: 'Mend Flesh', cost: 2, description: 'Knits wounds together with arcane energy.', effectType: 'heal', value: 2, range: 1 },
  { id: 'reveal', name: 'True Sight', cost: 1, description: 'Reveals hidden clues in the area.', effectType: 'reveal', value: 1, range: 0 },
  { id: 'banish', name: 'Banish', cost: 4, description: 'A powerful rite to weaken the connection to the void.', effectType: 'banish', value: 5, range: 2 }
];

export const CHARACTERS: Record<CharacterType, Character> = {
  detective: { 
    id: 'detective', name: 'The Private Eye', hp: 5, maxHp: 5, sanity: 4, maxSanity: 4, insight: 1, 
    attributes: { strength: 3, agility: 3, intellect: 4, willpower: 3 },
    special: '+1 die on Investigation', specialAbility: 'investigate_bonus'
  },
  professor: { 
    id: 'professor', name: 'The Professor', hp: 3, maxHp: 3, sanity: 6, maxSanity: 6, insight: 3, 
    attributes: { strength: 2, agility: 2, intellect: 5, willpower: 4 },
    special: 'Can read occult texts safely', specialAbility: 'occult_immunity'
  },
  journalist: { 
    id: 'journalist', name: 'The Journalist', hp: 4, maxHp: 4, sanity: 4, maxSanity: 4, insight: 1, 
    attributes: { strength: 2, agility: 4, intellect: 4, willpower: 3 },
    special: '+1 Movement, escape bonus', specialAbility: 'escape_bonus'
  },
  veteran: { 
    id: 'veteran', name: 'The Veteran', hp: 6, maxHp: 6, sanity: 3, maxSanity: 3, insight: 0, 
    attributes: { strength: 5, agility: 3, intellect: 2, willpower: 3 },
    special: '+1 die on Combat and Str checks', specialAbility: 'combat_bonus'
  },
  occultist: { 
    id: 'occultist', name: 'The Occultist', hp: 3, maxHp: 3, sanity: 5, maxSanity: 5, insight: 4, 
    attributes: { strength: 2, agility: 3, intellect: 3, willpower: 5 },
    special: 'Can perform rituals', specialAbility: 'ritual_master'
  },
  doctor: { 
    id: 'doctor', name: 'The Doctor', hp: 4, maxHp: 4, sanity: 5, maxSanity: 5, insight: 2, 
    attributes: { strength: 2, agility: 3, intellect: 4, willpower: 4 },
    special: 'Heals 2 instead of 1', specialAbility: 'heal_bonus'
  }
};

export const INDOOR_LOCATIONS = [
  'Abandoned Manor', 'Dark Cellar', 'The Library', 'Secret Crypt', 'Old Church', 'Police Station', 'Warehouse', 'Arkham Asylum', 'Historical Museum', "St. Mary's Hospital",
  'Sanitarium', 'Underground Vault', 'Dusty Attic', 'Grand Hall', 'Study Room', 'Ritual Chamber', 'Boiler Room', 'Velvet Lounge', 'Opium Den', 'Grand Theater',
  'Clock Tower Interior', 'Private Study', 'Damp Basement', 'Hidden Laboratory', 'Trophy Room'
];

export const OUTDOOR_LOCATIONS = [
  'Misty Docks', 'Town Square', 'Old Lighthouse', 'Blackwood Forest', 'Graveyard', 'University Campus', 'Market District', 'River Bank', 'Train Station', 'Swamp',
  'City Park', 'Merchant Street', 'Dark Pier', 'Hanging Tree', 'Ruined Farmhouse', 'Overgrown Garden', 'Foggy Harbor', 'Lonely Crossroads', 'Cemetery Gate',
  'Stone Circle', 'Miskatonic Bridge', 'Innsmouth Wharf'
];

export const INDOOR_CONNECTORS = [
  'Narrow Hallway', 'Dark Corridor', 'Grand Staircase', 'Servant Passage', 'Dusty Landing', 'Maintenance Shaft', 'Basement Tunnel', 'Service Elevator',
  'Spiral Stairs', 'Crawlspace'
];

export const OUTDOOR_CONNECTORS = [
  'Narrow Alley', 'Cobblestone Path', 'Foggy Bridge', 'Tram Track', 'Dark Tunnel', 'Stone Steps', 'River Crossing', 'Overpass', 'Dirt Trail',
  'Winding Lane'
];

export const LOCATION_DESCRIPTIONS: Record<string, string> = {
  'Train Station': 'The last train left hours ago. The clock on the wall is shattered.',
  'Abandoned Manor': 'Dust motes dance in the stale air. Portraits seem to watch you pass.',
  'Dark Cellar': 'It smells of rot and old earth. Something scuttles in the corner.',
  'The Library': 'Rows of forbidden texts. You hear a page turn, but no one is there.',
  'Secret Crypt': 'The air is cold enough to see your breath. Ancient names are carved into the stone.',
  'Old Church': 'A sense of unease hangs heavy here. The pews are broken.',
  'Misty Docks': 'The waves lap against the rotting wood. The fog is thick here.',
  'Town Square': 'Deserted. The statue in the center looks different than you remember.',
  'Graveyard': 'The soil looks disturbed in front of several headstones.',
  'Blackwood Forest': 'The trees crowd close, their branches like grasping skeletal fingers.'
};

export const SCENARIOS: Scenario[] = [
  {
    id: 's1',
    title: 'Escape from Blackwood Manor',
    description: 'You are trapped in the haunted Blackwood estate. The doors are sealed by dark magic. You must find the key and escape before the entity claims you.',
    startDoom: 12,
    startLocation: 'Grand Hall',
    goal: 'Find the Iron Key, locate the Exit Door, and Escape.',
    specialRule: 'Indoors only. Exit Door spawns after Key is found.',
    difficulty: 'Normal',
    tileSet: 'indoor',
    victoryType: 'escape',
    steps: [
      { id: 'step1', description: 'Find the Iron Key (Investigate locations)', type: 'find_item', targetId: 'quest_key', completed: false },
      { id: 'step2', description: 'Locate the Exit Door', type: 'find_tile', targetId: 'Exit Door', completed: false },
      { id: 'step3', description: 'Unlock the Door and Escape', type: 'interact', targetId: 'Exit Door', completed: false }
    ],
    doomEvents: [
      { threshold: 8, triggered: false, type: 'spawn_enemy', targetId: 'cultist', amount: 2, message: 'The cultists have found you!' },
      { threshold: 5, triggered: false, type: 'spawn_enemy', targetId: 'ghoul', amount: 2, message: 'Hungry ghouls emerge from the shadows.' },
      { threshold: 2, triggered: false, type: 'spawn_boss', targetId: 'shoggoth', amount: 1, message: 'A Shoggoth blocks the way!' }
    ]
  },
  {
    id: 's2',
    title: 'Assassination of the High Priest',
    description: 'The Order of the Black Sun is performing a ritual to summon a Great Old One. You must silence their leader before the ritual completes.',
    startDoom: 10,
    startLocation: 'Town Square',
    goal: 'Find and kill the Dark Priest.',
    specialRule: 'Enemies are stronger. Time is short.',
    difficulty: 'Hard',
    tileSet: 'mixed',
    victoryType: 'assassination',
    steps: [
      { id: 'step1', description: 'Find the Dark Priest', type: 'find_item', targetId: 'location_intel', completed: false },
      { id: 'step2', description: 'Kill the Dark Priest', type: 'kill_enemy', targetId: 'priest', amount: 1, completed: false }
    ],
    doomEvents: [
      { threshold: 7, triggered: false, type: 'spawn_enemy', targetId: 'deepone', amount: 2, message: 'Deep Ones rise from the sewers.' },
      { threshold: 4, triggered: false, type: 'buff_enemies', message: 'The ritual empowers all enemies! (+1 HP)' },
      { threshold: 2, triggered: false, type: 'spawn_boss', targetId: 'shoggoth', message: 'The Priest summons a guardian!' }
    ]
  },
  {
    id: 's3',
    title: 'The Siege of Arkham',
    description: 'They are coming. Wave after wave of horrors. You cannot run. You can only survive.',
    startDoom: 15,
    startLocation: 'Police Station',
    goal: 'Survive for 10 rounds.',
    specialRule: 'Doom decreases every round automatically.',
    difficulty: 'Nightmare',
    tileSet: 'mixed',
    victoryType: 'survival',
    steps: [
      { id: 'step1', description: 'Survive until help arrives', type: 'survive', amount: 10, completed: false }
    ],
    doomEvents: [
      { threshold: 12, triggered: false, type: 'spawn_enemy', targetId: 'cultist', amount: 3, message: 'Wave 1: Cultists attack!' },
      { threshold: 8, triggered: false, type: 'spawn_enemy', targetId: 'ghoul', amount: 3, message: 'Wave 2: Ghouls swarm the barricades!' },
      { threshold: 4, triggered: false, type: 'spawn_boss', targetId: 'dark_young', amount: 1, message: 'Wave 3: A Dark Young appears!' }
    ]
  }
];

const DEFAULT_EDGES: [EdgeData, EdgeData, EdgeData, EdgeData, EdgeData, EdgeData] = [
  { type: 'open' }, { type: 'open' }, { type: 'open' }, { type: 'open' }, { type: 'open' }, { type: 'open' }
];

export const START_TILE: Tile = {
  id: 'start', q: 0, r: 0, name: 'Train Station', type: 'street', 
  category: 'urban', zoneLevel: 0, floorType: 'cobblestone', visibility: 'visible',
  edges: DEFAULT_EDGES, explored: true, searchable: true, searched: false,
  watermarkIcon: 'Train'
};

export const BESTIARY: Record<EnemyType, BestiaryEntry> = {
  cultist: {
    name: 'Cultist', type: 'cultist', hp: 2, damage: 1, horror: 1,
    description: 'A brainwashed servant of the Outer Gods.',
    lore: 'Recruited from the desperate and the mad.',
    defeatFlavor: 'The cultist collapses, a dark amulet shattering.',
    traits: []
  },
  ghoul: {
    name: 'Ghoul', type: 'ghoul', hp: 3, damage: 2, horror: 2,
    description: 'A flesh-eating subterranean dweller.',
    lore: 'Subterranean dwellers that feast on the dead.',
    defeatFlavor: 'It collapses into grave dirt.',
    traits: ['scavenger']
  },
  deepone: {
    name: 'Deep One', type: 'deepone', hp: 3, damage: 2, horror: 2,
    description: 'An immortal amphibious humanoid.',
    lore: 'Immortal servants of Father Dagon.',
    defeatFlavor: 'The creature dissolves into brine.',
    traits: ['aquatic']
  },
  shoggoth: {
    name: 'Shoggoth', type: 'shoggoth', hp: 6, damage: 3, horror: 4,
    description: 'A protoplasmic mass of eyes and mouths.',
    lore: 'A nightmarish slave race created by the Elder Things.',
    traits: ['massive', 'slow'],
    defeatFlavor: 'The massive form loses cohesion.'
  },
  sniper: {
    name: 'Cultist Sniper', type: 'sniper', hp: 2, damage: 2, horror: 1,
    description: 'A cultist armed with a long-range rifle.',
    lore: 'Chosen for their steady hands and lack of remorse.',
    traits: ['ranged'],
    defeatFlavor: 'The sniper falls from their perch.'
  },
  priest: {
    name: 'Dark Priest', type: 'priest', hp: 5, damage: 2, horror: 3,
    description: 'A high-ranking member of the cult, channeling dark energies.',
    lore: 'They have traded their humanity for forbidden power.',
    traits: ['elite'],
    defeatFlavor: 'The priest screams as the darkness consumes them.'
  },
  'mi-go': {
    name: 'Mi-Go', type: 'mi-go', hp: 3, damage: 1, horror: 1,
    description: 'A fungoid crustacean from Yuggoth.',
    lore: 'Fungi from Yuggoth who fly through space.',
    traits: ['flying'],
    defeatFlavor: 'The body disintegrates.'
  },
  nightgaunt: {
    name: 'Nightgaunt', type: 'nightgaunt', hp: 3, damage: 1, horror: 1,
    description: 'A faceless, horned flyer.',
    lore: 'Faceless servants of Nodens.',
    traits: ['flying'],
    defeatFlavor: 'It vanishes into the night sky.'
  },
  hound: {
    name: 'Hound of Tindalos', type: 'hound', hp: 4, damage: 2, horror: 3,
    description: 'A predator from the angles of time.',
    lore: 'Predators that inhabit the angles of time.',
    traits: ['fast', 'ambusher'],
    defeatFlavor: 'The beast recedes into the angles.'
  },
  dark_young: {
    name: 'Dark Young', type: 'dark_young', hp: 6, damage: 2, horror: 3,
    description: 'Offspring of Shub-Niggurath.',
    lore: 'The Black Goat of the Woods.',
    traits: ['massive'],
    defeatFlavor: 'The monstrosity withers.'
  },
  byakhee: {
    name: 'Byakhee', type: 'byakhee', hp: 3, damage: 2, horror: 1,
    description: 'An interstellar steed.',
    lore: 'Interstellar steeds serving Hastur.',
    traits: ['flying', 'fast'],
    defeatFlavor: 'It dissolves into cosmic dust.'
  },
  star_spawn: {
    name: 'Star Spawn', type: 'star_spawn', hp: 8, damage: 3, horror: 5,
    description: 'A colossal kin of Cthulhu.',
    lore: 'Smaller versions of the Great Dreamer.',
    traits: ['massive'],
    defeatFlavor: 'The entity liquefies into green ooze.'
  },
  formless_spawn: {
    name: 'Formless Spawn', type: 'formless_spawn', hp: 5, damage: 2, horror: 2,
    description: 'Black ooze of Tsathoggua.',
    lore: 'Living puddles of black ichor.',
    traits: ['regenerate'],
    defeatFlavor: 'The ooze evaporates into foul steam.'
  },
  hunting_horror: {
    name: 'Hunting Horror', type: 'hunting_horror', hp: 4, damage: 3, horror: 3,
    description: 'A viper of the void.',
    lore: 'A serpentine entity that serves Nyarlathotep.',
    traits: ['fast', 'flying'],
    defeatFlavor: 'It coils in and vanishes.'
  },
  moon_beast: {
    name: 'Moon-Beast', type: 'moon_beast', hp: 4, damage: 1, horror: 2,
    description: 'Sadistic torturers from the moon.',
    lore: 'Sadistic beings from the Dreamlands.',
    traits: ['ranged'],
    defeatFlavor: 'The abomination falls silent.'
  },
  boss: {
    name: 'Ancient One', type: 'boss', hp: 10, damage: 4, horror: 6,
    description: 'An avatar of cosmic destruction.',
    lore: 'An intrusion from outside the ordered universe.',
    traits: ['massive'],
    defeatFlavor: 'The avatar is pulled back into the void.'
  }
};

export const ITEMS: Item[] = [
  { id: 'rev', name: 'Revolver', type: 'weapon', effect: '+1 Combat Die', bonus: 1, cost: 3, statModifier: 'combat' },
  { id: 'shot', name: 'Shotgun', type: 'weapon', effect: '+2 Combat Dice', bonus: 2, cost: 5, statModifier: 'combat' },
  { id: 'tommy', name: 'Tommy Gun', type: 'weapon', effect: '+3 Combat Dice', bonus: 3, cost: 10, statModifier: 'combat' },
  { id: 'med', name: 'Medical Kit', type: 'consumable', effect: 'Heal 2 HP', bonus: 2, cost: 3 },
  { id: 'whiskey', name: 'Old Whiskey', type: 'consumable', effect: 'Heal 2 Sanity', bonus: 2, cost: 2 },
  { id: 'flash', name: 'Flashlight', type: 'tool', effect: '+1 Investigation Die', bonus: 1, cost: 2, statModifier: 'investigation' },
  { id: 'book', name: 'Necronomicon', type: 'relic', effect: '+3 Insight, -1 Sanity', bonus: 3, cost: 8 }
];

export const EVENTS: EventCard[] = [
  { id: 'e1', title: 'Shadows in the Dark', description: 'You feel watched. Lose 1 Sanity.', effectType: 'sanity', value: -1 },
  { id: 'e2', title: 'Hidden Diary', description: 'Found important notes! +1 Insight.', effectType: 'insight', value: 1 },
  { id: 'e3', title: 'Dark Ritual', description: 'You stumble upon a ceremony!', effectType: 'spawn', value: 1 }
];

export const MADNESS_CONDITIONS: Madness[] = [
  { 
    id: 'm1', type: 'hallucination', name: 'Hallucinations', 
    description: 'You see things that are not there.',
    mechanicalEffect: '25% chance to see false enemies. Must use action to "attack" them.',
    visualClass: 'madness-hallucination', audioEffect: 'whispers'
  },
  { 
    id: 'm2', type: 'paranoia', name: 'Paranoia', 
    description: 'Trust no one. They are all watching.',
    mechanicalEffect: 'Cannot share tile with allies. -1 on all rolls when others are near.',
    visualClass: 'madness-paranoia', audioEffect: 'heartbeat'
  },
  { 
    id: 'm3', type: 'hysteria', name: 'Hysteria', 
    description: 'Your mind fractures into chaos.',
    mechanicalEffect: '50% chance to lose 1 AP to uncontrolled action each round.',
    visualClass: 'madness-hysteria', audioEffect: 'laughter'
  },
  { 
    id: 'm4', type: 'catatonia', name: 'Catatonia', 
    description: 'You freeze, unable to move.',
    mechanicalEffect: '-1 AP per turn. Cannot use Flee action.',
    visualClass: 'madness-catatonia', audioEffect: 'silence'
  },
  { 
    id: 'm5', type: 'obsession', name: 'Obsession', 
    description: 'You must know everything about this place.',
    mechanicalEffect: 'Cannot leave room until all elements are investigated.',
    visualClass: 'madness-obsession', audioEffect: 'ticking'
  },
  { 
    id: 'm6', type: 'amnesia', name: 'Amnesia', 
    description: 'Where am I? What is this place?',
    mechanicalEffect: 'Fog of War resets each round. Cannot see previously explored tiles.',
    visualClass: 'madness-amnesia', audioEffect: 'static'
  },
  { 
    id: 'm7', type: 'night_terrors', name: 'Night Terrors', 
    description: 'Sleep brings only horrors.',
    mechanicalEffect: 'Cannot use Rest action. Sleep events cause -1 Sanity.',
    visualClass: 'madness-night-terrors', audioEffect: 'screams'
  },
  { 
    id: 'm8', type: 'dark_insight', name: 'Dark Insight', 
    description: 'You see the truth behind the veil.',
    mechanicalEffect: '+2 Insight permanent. But Doom decreases 1 extra per round.',
    visualClass: 'madness-dark-insight', audioEffect: 'cosmic'
  }
];

// Obstacles from the Game Design Bible
export const OBSTACLES: Record<ObstacleType, Obstacle> = {
  rubble_light: { type: 'rubble_light', blocking: false, removable: true, apCost: 1, effect: '+1 AP to cross' },
  rubble_heavy: { type: 'rubble_heavy', blocking: true, removable: true, skillRequired: 'strength', dc: 4, apCost: 2 },
  collapsed: { type: 'collapsed', blocking: true, removable: false, effect: 'Permanently blocked' },
  fire: { type: 'fire', blocking: false, removable: true, damage: 1, itemRequired: 'extinguisher', effect: '1 HP damage on pass' },
  water_shallow: { type: 'water_shallow', blocking: false, removable: false, apCost: 1, effect: 'May hide items' },
  water_deep: { type: 'water_deep', blocking: false, removable: false, skillRequired: 'agility', dc: 4, effect: 'Must swim' },
  unstable_floor: { type: 'unstable_floor', blocking: false, removable: false, effect: '1d6: 1-2 = fall (2 HP damage)' },
  gas_poison: { type: 'gas_poison', blocking: false, removable: true, itemRequired: 'gas_mask', damage: 1, effect: '-1 HP per round in area' },
  darkness: { type: 'darkness', blocking: false, removable: true, skillRequired: 'willpower', dc: 4, itemRequired: 'light_source', effect: '-2 all rolls' },
  ward_circle: { type: 'ward_circle', blocking: false, removable: true, skillRequired: 'willpower', dc: 5, damage: 1, effect: 'Sanity -1 to cross without removing' },
  spirit_barrier: { type: 'spirit_barrier', blocking: true, removable: true, itemRequired: 'banish_ritual', damage: 1, effect: 'Sanity -1 per attempt to pass' },
  spatial_warp: { type: 'spatial_warp', blocking: false, removable: true, effect: 'Doors lead to wrong places. Solve puzzle to fix.' },
  time_loop: { type: 'time_loop', blocking: false, removable: true, effect: 'Tile resets when you leave. Must break sequence.' }
};

// Monster spawn configuration
export interface SpawnConfig {
  type: EnemyType;
  weight: number;
  minDoom: number;
  maxDoom: number;
}

// Base spawn chances by tile category
export const SPAWN_CHANCES: Record<string, number> = {
  nature: 0.25,
  urban: 0.15,
  street: 0.20,
  facade: 0.10,
  foyer: 0.15,
  corridor: 0.30,
  room: 0.25,
  stairs: 0.20,
  basement: 0.35,
  crypt: 0.45,
  default: 0.20
};

// Monster movement speeds
export const MONSTER_SPEEDS: Partial<Record<EnemyType, number>> = {
  hound: 2,
  byakhee: 2,
  hunting_horror: 2,
  shoggoth: 1, // Actually slow, but massive
  formless_spawn: 1,
  cultist: 1,
  ghoul: 1,
  deepone: 1
};

// Combat difficulty modifiers by doom level
export const DOOM_COMBAT_MODIFIERS = {
  high: { doomMin: 10, enemyDamageBonus: 0, playerDiceBonus: 0 },
  medium: { doomMin: 5, enemyDamageBonus: 1, playerDiceBonus: 0 },
  low: { doomMin: 0, enemyDamageBonus: 2, playerDiceBonus: -1 }
};

// Get combat modifier based on current doom
export function getCombatModifier(doom: number) {
  if (doom >= 10) return DOOM_COMBAT_MODIFIERS.high;
  if (doom >= 5) return DOOM_COMBAT_MODIFIERS.medium;
  return DOOM_COMBAT_MODIFIERS.low;
}
