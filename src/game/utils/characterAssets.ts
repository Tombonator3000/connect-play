/**
 * Character Profile Images for Shadows of the 1920s
 * 
 * These images are used in character sheets and player icons
 */

import veteranImg from '@/assets/characters/veteran.png';
import privateEyeImg from '@/assets/characters/private-eye.png';
import professorImg from '@/assets/characters/professor.png';
import occultistImg from '@/assets/characters/occultist.png';
import journalistImg from '@/assets/characters/journalist.png';
import doctorImg from '@/assets/characters/doctor.png';

import { CharacterType } from '../types';

/**
 * Map character types to their profile images
 */
export const CHARACTER_PORTRAITS: Record<CharacterType, string> = {
  veteran: veteranImg,
  detective: privateEyeImg,
  professor: professorImg,
  occultist: occultistImg,
  journalist: journalistImg,
  doctor: doctorImg
};

/**
 * Get the profile image for a character type
 * @param characterType The type of character
 * @returns The image URL/path for the character's portrait
 */
export function getCharacterPortrait(characterType: CharacterType): string {
  return CHARACTER_PORTRAITS[characterType] || privateEyeImg;
}

/**
 * Get display name for character type
 */
export function getCharacterDisplayName(characterType: CharacterType): string {
  const names: Record<CharacterType, string> = {
    veteran: 'The Veteran',
    detective: 'The Private Eye',
    professor: 'The Professor',
    occultist: 'The Occultist',
    journalist: 'The Journalist',
    doctor: 'The Doctor'
  };
  return names[characterType] || characterType;
}
