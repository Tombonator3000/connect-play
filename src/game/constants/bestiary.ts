/**
 * BESTIARY - Enemy Definitions
 * Hero Quest Style Dice System
 *
 * attackDice: Number of dice the monster rolls when attacking
 * defenseDice: Number of dice the monster rolls when defending (blocking hits)
 * Each die that shows skull (4+) is a hit/block
 */

import { BestiaryEntry, EnemyType } from '../types';

export const BESTIARY: Record<EnemyType, BestiaryEntry> = {
  // --- MINIONS (1 attack die, 1 defense die) ---
  cultist: {
    name: 'Cultist', type: 'cultist', hp: 2, damage: 1,
    attackDice: 1, defenseDice: 1, horror: 1,
    description: 'A brainwashed servant of the Outer Gods.',
    lore: 'Recruited from the desperate and the mad.',
    defeatFlavor: 'The cultist collapses, a dark amulet shattering.',
    traits: []
  },
  'mi-go': {
    name: 'Mi-Go', type: 'mi-go', hp: 3, damage: 1,
    attackDice: 1, defenseDice: 2, horror: 1,
    description: 'A fungoid crustacean from Yuggoth.',
    lore: 'Fungi from Yuggoth who fly through space.',
    traits: ['flying'],
    defeatFlavor: 'The body disintegrates.'
  },
  nightgaunt: {
    name: 'Nightgaunt', type: 'nightgaunt', hp: 3, damage: 1,
    attackDice: 1, defenseDice: 2, horror: 1,
    description: 'A faceless, horned flyer.',
    lore: 'Faceless servants of Nodens.',
    traits: ['flying'],
    defeatFlavor: 'It vanishes into the night sky.'
  },
  moon_beast: {
    name: 'Moon-Beast', type: 'moon_beast', hp: 4, damage: 1,
    attackDice: 1, defenseDice: 2, horror: 2,
    description: 'Sadistic torturers from the moon.',
    lore: 'Sadistic beings from the Dreamlands.',
    traits: ['ranged'],
    defeatFlavor: 'The abomination falls silent.'
  },

  // --- WARRIORS (2 attack dice, 2 defense dice) ---
  ghoul: {
    name: 'Ghoul', type: 'ghoul', hp: 3, damage: 2,
    attackDice: 2, defenseDice: 2, horror: 2,
    description: 'A flesh-eating subterranean dweller.',
    lore: 'Subterranean dwellers that feast on the dead.',
    defeatFlavor: 'It collapses into grave dirt.',
    traits: ['scavenger']
  },
  deepone: {
    name: 'Deep One', type: 'deepone', hp: 3, damage: 2,
    attackDice: 2, defenseDice: 2, horror: 2,
    description: 'An immortal amphibious humanoid.',
    lore: 'Immortal servants of Father Dagon.',
    defeatFlavor: 'The creature dissolves into brine.',
    traits: ['aquatic']
  },
  sniper: {
    name: 'Cultist Sniper', type: 'sniper', hp: 2, damage: 2,
    attackDice: 2, defenseDice: 1, horror: 1,
    description: 'A cultist armed with a long-range rifle.',
    lore: 'Chosen for their steady hands and lack of remorse.',
    traits: ['ranged'],
    defeatFlavor: 'The sniper falls from their perch.'
  },
  byakhee: {
    name: 'Byakhee', type: 'byakhee', hp: 3, damage: 2,
    attackDice: 2, defenseDice: 2, horror: 1,
    description: 'An interstellar steed.',
    lore: 'Interstellar steeds serving Hastur.',
    traits: ['flying', 'fast'],
    defeatFlavor: 'It dissolves into cosmic dust.'
  },
  formless_spawn: {
    name: 'Formless Spawn', type: 'formless_spawn', hp: 5, damage: 2,
    attackDice: 2, defenseDice: 3, horror: 2,
    description: 'Black ooze of Tsathoggua.',
    lore: 'Living puddles of black ichor.',
    traits: ['regenerate'],
    defeatFlavor: 'The ooze evaporates into foul steam.'
  },
  hound: {
    name: 'Hound of Tindalos', type: 'hound', hp: 4, damage: 2,
    attackDice: 2, defenseDice: 2, horror: 3,
    description: 'A predator from the angles of time.',
    lore: 'Predators that inhabit the angles of time.',
    traits: ['fast', 'ambusher'],
    defeatFlavor: 'The beast recedes into the angles.'
  },

  // --- ELITES (2-3 attack dice, 2-3 defense dice) ---
  priest: {
    name: 'Dark Priest', type: 'priest', hp: 5, damage: 2,
    attackDice: 2, defenseDice: 3, horror: 3,
    description: 'A high-ranking member of the cult, channeling dark energies.',
    lore: 'They have traded their humanity for forbidden power.',
    traits: ['elite'],
    defeatFlavor: 'The priest screams as the darkness consumes them.'
  },
  hunting_horror: {
    name: 'Hunting Horror', type: 'hunting_horror', hp: 4, damage: 3,
    attackDice: 3, defenseDice: 2, horror: 3,
    description: 'A viper of the void.',
    lore: 'A serpentine entity that serves Nyarlathotep.',
    traits: ['fast', 'flying'],
    defeatFlavor: 'It coils in and vanishes.'
  },
  dark_young: {
    name: 'Dark Young', type: 'dark_young', hp: 6, damage: 2,
    attackDice: 3, defenseDice: 3, horror: 3,
    description: 'Offspring of Shub-Niggurath.',
    lore: 'The Black Goat of the Woods.',
    traits: ['massive'],
    defeatFlavor: 'The monstrosity withers.'
  },

  // --- BOSSES (3-4 attack dice, 3-4 defense dice) ---
  shoggoth: {
    name: 'Shoggoth', type: 'shoggoth', hp: 6, damage: 3,
    attackDice: 3, defenseDice: 4, horror: 4,
    description: 'A protoplasmic mass of eyes and mouths.',
    lore: 'A nightmarish slave race created by the Elder Things.',
    traits: ['massive', 'slow'],
    defeatFlavor: 'The massive form loses cohesion.'
  },
  star_spawn: {
    name: 'Star Spawn', type: 'star_spawn', hp: 8, damage: 3,
    attackDice: 4, defenseDice: 4, horror: 5,
    description: 'A colossal kin of Cthulhu.',
    lore: 'Smaller versions of the Great Dreamer.',
    traits: ['massive'],
    defeatFlavor: 'The entity liquefies into green ooze.'
  },
  boss: {
    name: 'Ancient One', type: 'boss', hp: 10, damage: 4,
    attackDice: 4, defenseDice: 5, horror: 6,
    description: 'An avatar of cosmic destruction.',
    lore: 'An intrusion from outside the ordered universe.',
    traits: ['massive'],
    defeatFlavor: 'The avatar is pulled back into the void.'
  },

  // --- NEW MINIONS ---
  ghast: {
    name: 'Ghast', type: 'ghast', hp: 3, damage: 1,
    attackDice: 1, defenseDice: 1, horror: 2,
    description: 'A blind, hooved humanoid from the underworld.',
    lore: 'Ghasts dwell in the vaults of Zin where sunlight never reaches. They hunt by sound and smell.',
    traits: ['scavenger', 'light_sensitive'],
    defeatFlavor: 'The ghast collapses, its eyeless face frozen in a snarl.'
  },
  zoog: {
    name: 'Zoog', type: 'zoog', hp: 1, damage: 1,
    attackDice: 1, defenseDice: 1, horror: 1,
    description: 'A small, brown rodent-like creature with tentacles.',
    lore: 'Intelligent and cunning, zoogs inhabit the Enchanted Wood. They speak in high-pitched voices.',
    traits: ['swarm', 'fast'],
    defeatFlavor: 'The zoog squeals and vanishes into the shadows.'
  },
  rat_thing: {
    name: 'Rat-Thing', type: 'rat_thing', hp: 2, damage: 1,
    attackDice: 1, defenseDice: 1, horror: 2,
    description: 'A hybrid of rat and something disturbingly human.',
    lore: 'Brown Jenkin and its kin - witch familiars with human-like faces and tiny hands.',
    traits: ['fast', 'ambusher'],
    defeatFlavor: 'The abomination twitches and goes still, its human-like eyes glazing over.'
  },
  fire_vampire: {
    name: 'Fire Vampire', type: 'fire_vampire', hp: 3, damage: 2,
    attackDice: 1, defenseDice: 2, horror: 2,
    description: 'A living flame from beyond the stars.',
    lore: 'Servants of Cthugha, these beings of living fire descend from the cosmos to consume.',
    traits: ['flying', 'fire'],
    defeatFlavor: 'The flame sputters and extinguishes with an unearthly shriek.'
  },

  // --- NEW WARRIORS ---
  dimensional_shambler: {
    name: 'Dimensional Shambler', type: 'dimensional_shambler', hp: 4, damage: 2,
    attackDice: 2, defenseDice: 2, horror: 3,
    description: 'A gaunt, ape-like being that walks between dimensions.',
    lore: 'These creatures can step through the fabric of reality, appearing and disappearing at will.',
    traits: ['teleport', 'ambusher'],
    defeatFlavor: 'The shambler folds in on itself and vanishes into another dimension.'
  },
  serpent_man: {
    name: 'Serpent Man', type: 'serpent_man', hp: 4, damage: 2,
    attackDice: 2, defenseDice: 2, horror: 2,
    description: 'An ancient reptilian humanoid with hypnotic powers.',
    lore: 'Remnants of a pre-human civilization, serpent men can disguise themselves as humans.',
    traits: ['elite', 'ranged'],
    defeatFlavor: 'The serpent man hisses and collapses, its disguise failing.'
  },
  gug: {
    name: 'Gug', type: 'gug', hp: 6, damage: 2,
    attackDice: 2, defenseDice: 3, horror: 3,
    description: 'A towering giant with a vertical mouth and four arms.',
    lore: 'Banished to the underworld by the Great Ones, gugs hunt in the lightless depths.',
    traits: ['massive', 'slow'],
    defeatFlavor: 'The gug crashes to the ground, its vertical maw gaping in death.'
  },
  cthonian: {
    name: 'Cthonian', type: 'cthonian', hp: 5, damage: 2,
    attackDice: 2, defenseDice: 3, horror: 3,
    description: 'A massive burrowing worm with tentacles.',
    lore: 'These subterranean horrors communicate telepathically and can cause earthquakes.',
    traits: ['burrow', 'massive'],
    defeatFlavor: 'The worm-thing convulses and sinks back into the earth.'
  },
  tcho_tcho: {
    name: 'Tcho-Tcho', type: 'tcho_tcho', hp: 3, damage: 2,
    attackDice: 2, defenseDice: 1, horror: 1,
    description: 'A degenerate human who worships the Great Old Ones.',
    lore: 'The Tcho-Tcho people practice dark rituals and cannibalism in service to alien gods.',
    traits: ['ranged'],
    defeatFlavor: 'The Tcho-Tcho falls, clutching a profane idol.'
  },

  // --- NEW ELITES ---
  flying_polyp: {
    name: 'Flying Polyp', type: 'flying_polyp', hp: 7, damage: 3,
    attackDice: 3, defenseDice: 3, horror: 4,
    description: 'A partially invisible entity that controls the wind.',
    lore: 'Ancient enemies of the Great Race, polyps dwell in cyclopean ruins beneath the earth.',
    traits: ['flying', 'invisible', 'massive'],
    defeatFlavor: 'The polyp shrieks with an alien wind and dissipates.'
  },
  lloigor: {
    name: 'Lloigor', type: 'lloigor', hp: 6, damage: 3,
    attackDice: 3, defenseDice: 2, horror: 4,
    description: 'A being of pure malevolent energy.',
    lore: 'The Many-Angled Ones can manifest as invisible vortexes or serpentine forms.',
    traits: ['invisible', 'telekinesis'],
    defeatFlavor: 'The lloigor howls and retreats to its angular dimension.'
  },
  gnoph_keh: {
    name: 'Gnoph-Keh', type: 'gnoph_keh', hp: 6, damage: 3,
    attackDice: 3, defenseDice: 3, horror: 3,
    description: 'A six-limbed arctic horror with sharp horns.',
    lore: 'These territorial beasts can summon blizzards and serve Ithaqua, the Wind-Walker.',
    traits: ['fast', 'cold'],
    defeatFlavor: 'The gnoph-keh lets out a final howl and the temperature rises.'
  },

  // --- NEW BOSSES ---
  colour_out_of_space: {
    name: 'Colour Out of Space', type: 'colour_out_of_space', hp: 8, damage: 3,
    attackDice: 3, defenseDice: 4, horror: 5,
    description: 'An alien entity of incomprehensible color that drains life.',
    lore: 'This parasitic being arrived on a meteorite and slowly consumes all life around it.',
    traits: ['drain', 'invisible', 'massive'],
    defeatFlavor: 'The colour shrieks silently and shoots back toward the stars.'
  },
  elder_thing: {
    name: 'Elder Thing', type: 'elder_thing', hp: 7, damage: 3,
    attackDice: 3, defenseDice: 4, horror: 4,
    description: 'A barrel-shaped being with starfish-like appendages.',
    lore: 'The Old Ones created the shoggoths and built cities across primordial Earth.',
    traits: ['aquatic', 'elite'],
    defeatFlavor: 'The elder thing falls, its alien mind finally silenced.'
  }
};

/**
 * Get bestiary entry by enemy type with error handling
 */
export function getBestiaryEntry(enemyType: EnemyType): BestiaryEntry | null {
  const entry = BESTIARY[enemyType];
  if (!entry) {
    console.warn(`[Bestiary] Unknown enemy type: ${enemyType}`);
    return null;
  }
  return entry;
}

/**
 * Get enemy attack dice with fallback
 */
export function getEnemyAttackDice(enemyType: EnemyType): number {
  const entry = BESTIARY[enemyType];
  return entry?.attackDice ?? 1;
}

/**
 * Get enemy defense dice with fallback
 */
export function getEnemyDefenseDice(enemyType: EnemyType): number {
  const entry = BESTIARY[enemyType];
  return entry?.defenseDice ?? 1;
}

/**
 * Get enemy horror rating with fallback
 */
export function getEnemyHorror(enemyType: EnemyType): number {
  const entry = BESTIARY[enemyType];
  return entry?.horror ?? 1;
}
