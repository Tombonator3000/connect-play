/**
 * Monster Portrait Images for Shadows of the 1920s
 * 
 * These images are used in enemy panels and on the game board
 */

import cultistImg from '@/assets/monsters/cultist.png';
import deeponeImg from '@/assets/monsters/deepone.png';
import ghoulImg from '@/assets/monsters/ghoul.png';
import shoggothImg from '@/assets/monsters/shoggoth.png';
import bossImg from '@/assets/monsters/boss.png';
import sniperImg from '@/assets/monsters/sniper.png';
import priestImg from '@/assets/monsters/priest.png';
import miGoImg from '@/assets/monsters/mi-go.png';
import nightgauntImg from '@/assets/monsters/nightgaunt.png';
import houndImg from '@/assets/monsters/hound.png';
import darkYoungImg from '@/assets/monsters/dark_young.png';
import byakheeImg from '@/assets/monsters/byakhee.png';
import starSpawnImg from '@/assets/monsters/star_spawn.png';
import formlessSpawnImg from '@/assets/monsters/formless_spawn.png';
import huntingHorrorImg from '@/assets/monsters/hunting_horror.png';
import moonBeastImg from '@/assets/monsters/moon_beast.png';

import { EnemyType } from '../types';

/**
 * Map enemy types to their portrait images
 * Note: New monsters use cultist image as placeholder until custom art is created
 */
export const MONSTER_PORTRAITS: Record<EnemyType, string> = {
  cultist: cultistImg,
  deepone: deeponeImg,
  ghoul: ghoulImg,
  shoggoth: shoggothImg,
  boss: bossImg,
  sniper: sniperImg,
  priest: priestImg,
  'mi-go': miGoImg,
  nightgaunt: nightgauntImg,
  hound: houndImg,
  dark_young: darkYoungImg,
  byakhee: byakheeImg,
  star_spawn: starSpawnImg,
  formless_spawn: formlessSpawnImg,
  hunting_horror: huntingHorrorImg,
  moon_beast: moonBeastImg,
  // New monsters (2026-01-22) - using placeholder images
  ghast: ghoulImg,           // Similar underground creature
  zoog: miGoImg,             // Small creature
  rat_thing: ghoulImg,       // Creature-like
  fire_vampire: bossImg,     // Eldritch entity
  dimensional_shambler: nightgauntImg, // Otherworldly
  serpent_man: deeponeImg,   // Humanoid creature
  gug: shoggothImg,          // Massive creature
  cthonian: shoggothImg,     // Massive worm
  tcho_tcho: cultistImg,     // Human-like cultist
  flying_polyp: huntingHorrorImg, // Flying horror
  lloigor: bossImg,          // Energy being
  gnoph_keh: darkYoungImg,   // Large beast
  colour_out_of_space: bossImg, // Cosmic entity
  elder_thing: starSpawnImg  // Alien being
};

/**
 * Get the portrait image for an enemy type
 * @param enemyType The type of enemy
 * @returns The image URL/path for the enemy's portrait
 */
export function getMonsterPortrait(enemyType: EnemyType): string {
  return MONSTER_PORTRAITS[enemyType] || cultistImg;
}

/**
 * Get display name for enemy type
 */
export function getMonsterDisplayName(enemyType: EnemyType): string {
  const names: Record<EnemyType, string> = {
    cultist: 'Cultist',
    deepone: 'Deep One',
    ghoul: 'Ghoul',
    shoggoth: 'Shoggoth',
    boss: 'Elder Horror',
    sniper: 'Sniper',
    priest: 'High Priest',
    'mi-go': 'Mi-Go',
    nightgaunt: 'Nightgaunt',
    hound: 'Hound of Tindalos',
    dark_young: 'Dark Young',
    byakhee: 'Byakhee',
    star_spawn: 'Star Spawn',
    formless_spawn: 'Formless Spawn',
    hunting_horror: 'Hunting Horror',
    moon_beast: 'Moon Beast',
    // New monsters (2026-01-22)
    ghast: 'Ghast',
    zoog: 'Zoog',
    rat_thing: 'Rat-Thing',
    fire_vampire: 'Fire Vampire',
    dimensional_shambler: 'Dimensional Shambler',
    serpent_man: 'Serpent Man',
    gug: 'Gug',
    cthonian: 'Cthonian',
    tcho_tcho: 'Tcho-Tcho',
    flying_polyp: 'Flying Polyp',
    lloigor: 'Lloigor',
    gnoph_keh: 'Gnoph-Keh',
    colour_out_of_space: 'Colour Out of Space',
    elder_thing: 'Elder Thing'
  };
  return names[enemyType] || enemyType;
}
