/**
 * Monster Message Configuration
 * Extracted from monsterAI.ts to improve maintainability
 *
 * Contains all localized messages for monster behaviors
 */

import { EnemyType, Player, Enemy } from '../types';
import { TargetPriority } from './monsterAI';

// ============================================================================
// WAIT MESSAGES - When monster is waiting/ambushing
// ============================================================================

export const WAIT_MESSAGES: Record<EnemyType, string> = {
  ghoul: 'kryper sammen i mørket og venter...',
  nightgaunt: 'svever lydløst i skyggene...',
  cultist: 'patruljerer området...',
  deepone: 'holder seg skjult under overflaten...',
  shoggoth: 'bobler i stillhet...',
  boss: 'venter på sitt bytte...',
  sniper: 'holder siktet klart...',
  priest: 'fortsetter sine ritualer...',
  'mi-go': 'summerer i det fremmede språket...',
  hound: 'snuser etter byttet gjennom dimensjonene...',
  dark_young: 'står urørlig som et forvridd tre...',
  byakhee: 'kretser høyt over...',
  star_spawn: 'drømmer ondskapsfulle drømmer...',
  formless_spawn: 'flyter sakte i mørket...',
  hunting_horror: 'glir gjennom skyene...',
  moon_beast: 'forbereder sitt neste trekk...'
};

// ============================================================================
// PATROL MESSAGES - When monster is patrolling without a target
// ============================================================================

export const PATROL_MESSAGES: Record<EnemyType, string> = {
  cultist: 'patruljerer vaktsomt...',
  deepone: 'svømmer sakte rundt...',
  ghoul: 'snuser etter føde...',
  shoggoth: 'valser fremover...',
  boss: 'vandrer med mektig tilstedeværelse...',
  sniper: 'finner en ny posisjon...',
  priest: 'vandrer mot alteret...',
  'mi-go': 'flyr i sirkler...',
  nightgaunt: 'glir lydløst...',
  hound: 'søker gjennom vinklene...',
  dark_young: 'tramper tungt fremover...',
  byakhee: 'daler ned...',
  star_spawn: 'beveger seg med kosmisk tyngde...',
  formless_spawn: 'kryper sakte...',
  hunting_horror: 'jakter i mørket...',
  moon_beast: 'lister seg forsiktig...'
};

// ============================================================================
// ATTACK MESSAGES - When monster attacks a player
// ============================================================================

export const ATTACK_MESSAGES: Record<EnemyType, (targetName: string) => string> = {
  cultist: (targetName) => `stormer mot ${targetName} med offerkniven!`,
  deepone: (targetName) => `kaster seg mot ${targetName} med klør!`,
  ghoul: (targetName) => `hugger mot ${targetName} med skarpe tenner!`,
  shoggoth: (targetName) => `valser over ${targetName} med pseudopoder!`,
  boss: (targetName) => `knuser mot ${targetName} med kosmisk kraft!`,
  sniper: (targetName) => `trekker pistolen mot ${targetName}!`,
  priest: (targetName) => `kaster en forbannelse mot ${targetName}!`,
  'mi-go': (targetName) => `stikker med fremmed teknologi mot ${targetName}!`,
  nightgaunt: (targetName) => `griper etter ${targetName} med kalde klør!`,
  hound: (targetName) => `biter mot ${targetName} gjennom dimensjonene!`,
  dark_young: (targetName) => `slår mot ${targetName} med tentakler!`,
  byakhee: (targetName) => `stuper ned mot ${targetName}!`,
  star_spawn: (targetName) => `knuser ned på ${targetName}!`,
  formless_spawn: (targetName) => `sluker mot ${targetName}!`,
  hunting_horror: (targetName) => `dykker ned mot ${targetName}!`,
  moon_beast: (targetName) => `fyrer mot ${targetName}!`
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get wait message for an enemy
 */
export function getWaitMessage(enemy: Enemy): string {
  const message = WAIT_MESSAGES[enemy.type];
  return message ? `${enemy.name} ${message}` : `${enemy.name} venter...`;
}

/**
 * Get patrol message for an enemy
 */
export function getPatrolMessage(enemy: Enemy): string {
  const message = PATROL_MESSAGES[enemy.type];
  return message ? `${enemy.name} ${message}` : `${enemy.name} patruljerer...`;
}

/**
 * Get attack message for an enemy attacking a target
 */
export function getAttackMessage(enemy: Enemy, targetPlayer: Player): string {
  const messageGenerator = ATTACK_MESSAGES[enemy.type];
  return messageGenerator
    ? `${enemy.name} ${messageGenerator(targetPlayer.name)}`
    : `${enemy.name} angriper ${targetPlayer.name}!`;
}

/**
 * Get attack message with priority context
 * Adds flavor text based on why the monster chose this target
 */
export function getAttackMessageWithContext(
  enemy: Enemy,
  targetPlayer: Player,
  priority: TargetPriority | null
): string {
  const baseMessage = getAttackMessage(enemy, targetPlayer);

  if (!priority) return baseMessage;

  // Add context based on priority factors
  if (priority.factors.lowHp > 15) {
    return `${enemy.name} sanser svakhet! ${baseMessage}`;
  } else if (priority.factors.isolated > 0) {
    return `${enemy.name} går løs på den isolerte! ${baseMessage}`;
  } else if (priority.factors.lowSanity > 10) {
    return `${enemy.name} jakter på redsel! ${baseMessage}`;
  }

  return baseMessage;
}

/**
 * Get chase message based on enemy type and movement traits
 */
export function getChaseMessage(enemy: Enemy, targetPlayer: Player, isInWater: boolean): string {
  const isFlying = enemy.traits?.includes('flying') ?? false;
  const isAquatic = enemy.traits?.includes('aquatic') ?? false;

  if (isFlying) {
    return `${enemy.name} daler ned mot ${targetPlayer.name}!`;
  } else if (isAquatic && isInWater) {
    return `${enemy.name} glir gjennom vannet mot ${targetPlayer.name}!`;
  }

  return `${enemy.name} jakter på ${targetPlayer.name}!`;
}

/**
 * Get flee message for an enemy
 */
export function getFleeMessage(enemy: Enemy): string {
  return `${enemy.name} flykter i panikk!`;
}

/**
 * Get hesitation message for low aggression
 */
export function getHesitationMessage(enemy: Enemy): string {
  return `${enemy.name} nøler og observerer...`;
}

/**
 * Get defensive wait message
 */
export function getDefensiveMessage(enemy: Enemy): string {
  return `${enemy.name} vokter sin posisjon.`;
}

/**
 * Get ranged positioning message
 */
export function getRangedPositioningMessage(enemy: Enemy): string {
  return `${enemy.name} tar stilling for å skyte...`;
}

/**
 * Get ranged retreat message
 */
export function getRangedRetreatMessage(enemy: Enemy): string {
  return `${enemy.name} trekker seg tilbake for å sikte...`;
}

/**
 * Get ranged attack message
 */
export function getRangedAttackMessage(enemy: Enemy, targetPlayer: Player, hasCover: boolean): string {
  const coverMsg = hasCover ? ' (mot dekning)' : '';
  return `${enemy.name} avfyrer mot ${targetPlayer.name}${coverMsg}!`;
}

/**
 * Get approach message for basic pathfinding fallback
 */
export function getApproachMessage(enemy: Enemy, targetPlayer: Player): string {
  return `${enemy.name} nærmer seg ${targetPlayer.name}...`;
}

/**
 * Get generic wait message
 */
export function getGenericWaitMessage(enemy: Enemy): string {
  return `${enemy.name} venter...`;
}
