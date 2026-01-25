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
// New monsters (2026-01-25) - AI generated portraits
import ghastImg from '@/assets/monsters/ghast.png';
import zoogImg from '@/assets/monsters/zoog.png';
import ratThingImg from '@/assets/monsters/rat_thing.png';
import fireVampireImg from '@/assets/monsters/fire_vampire.png';
import dimensionalShamblerImg from '@/assets/monsters/dimensional_shambler.png';
import serpentManImg from '@/assets/monsters/serpent_man.png';
import gugImg from '@/assets/monsters/gug.png';
import cthonianImg from '@/assets/monsters/cthonian.png';
import tchoTchoImg from '@/assets/monsters/tcho_tcho.png';
import flyingPolypImg from '@/assets/monsters/flying_polyp.png';
import lloigorImg from '@/assets/monsters/lloigor.png';
import gnophKehImg from '@/assets/monsters/gnoph_keh.png';
import colourOutOfSpaceImg from '@/assets/monsters/colour_out_of_space.png';
import elderThingImg from '@/assets/monsters/elder_thing.png';

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
  // New monsters (2026-01-25) - unique portraits
  ghast: ghastImg,
  zoog: zoogImg,
  rat_thing: ratThingImg,
  fire_vampire: fireVampireImg,
  dimensional_shambler: dimensionalShamblerImg,
  serpent_man: serpentManImg,
  gug: gugImg,
  cthonian: cthonianImg,
  tcho_tcho: tchoTchoImg,
  flying_polyp: flyingPolypImg,
  lloigor: lloigorImg,
  gnoph_keh: gnophKehImg,
  colour_out_of_space: colourOutOfSpaceImg,
  elder_thing: elderThingImg
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
