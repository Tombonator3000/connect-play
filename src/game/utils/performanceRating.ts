/**
 * Performance Rating System
 * Calculates performance rating (S-F) based on scenario statistics
 * Provides Lovecraftian titles and descriptions for each rating
 */

import { GameStats, PerformanceRating, EnhancedScenarioResult, Player, CharacterFate, Scenario, Item } from '../types';

// ============================================================================
// RATING TITLES AND DESCRIPTIONS
// ============================================================================

interface RatingInfo {
  title: string;
  description: string;
}

const VICTORY_RATINGS: Record<PerformanceRating, RatingInfo> = {
  S: {
    title: 'Keeper of the Light',
    description: 'You emerge unscathed, a beacon against the encroaching night. The Old Ones stir in their slumber, but find no purchase here.'
  },
  A: {
    title: 'Seasoned Investigator',
    description: 'Through skill and determination, you have pushed back the darkness. Your name will be remembered in Arkham\'s annals.'
  },
  B: {
    title: 'Survivor of the Dark',
    description: 'You escaped with your life and most of your sanity. Few can claim even this much against the cosmic horrors.'
  },
  C: {
    title: 'Touched by Madness',
    description: 'You survived, but at what cost? The whispers follow you still, and your dreams will never be quite the same.'
  },
  F: {
    title: 'Pyrrhic Victor',
    description: 'Victory, yes... but the price was almost too high. The scars—visible and otherwise—will never fully heal.'
  }
};

const DEFEAT_RATINGS: Record<PerformanceRating, RatingInfo> = {
  S: {
    title: 'Valiant Fallen',
    description: 'You fought bravely to the end. Though you fell, your sacrifice was not in vain—others may yet succeed where you could not.'
  },
  A: {
    title: 'Noble Sacrifice',
    description: 'The darkness claimed you, but not before you dealt it a grievous wound. Your memory will inspire those who follow.'
  },
  B: {
    title: 'Lost to the Void',
    description: 'The cosmos has claimed another curious soul. Perhaps ignorance truly was bliss after all.'
  },
  C: {
    title: 'Consumed by Shadow',
    description: 'You were simply unprepared for what you found. The universe does not forgive such naivety.'
  },
  F: {
    title: 'Forgotten by History',
    description: 'No epitaph will mark your passing. The darkness swallows all, and it always has room for more.'
  }
};

// ============================================================================
// SCORE CALCULATION
// ============================================================================

interface ScoreBreakdown {
  survivalScore: number;        // 0-30 points
  combatScore: number;          // 0-25 points
  explorationScore: number;     // 0-20 points
  objectiveScore: number;       // 0-15 points
  sanityScore: number;          // 0-10 points
  totalScore: number;           // 0-100 points
}

/**
 * Calculates a detailed score breakdown from game statistics
 */
function calculateScoreBreakdown(
  stats: GameStats,
  isVictory: boolean
): ScoreBreakdown {
  // Survival Score (0-30)
  // Based on: players alive, doom remaining, rounds survived
  let survivalScore = 0;
  if (isVictory) {
    // All players alive = 15 points, partial = proportional
    survivalScore += Math.round((stats.playersAlive / stats.playersStarted) * 15);
    // Doom remaining: higher doom = better
    const doomPercentRemaining = stats.doomAtEnd / stats.doomAtStart;
    survivalScore += Math.round(doomPercentRemaining * 10);
    // Quick completion bonus (fewer rounds = better)
    const quicknessBonus = Math.max(0, 5 - Math.floor(stats.roundsSurvived / 5));
    survivalScore += quicknessBonus;
  } else {
    // Defeat: partial credit for survival effort
    survivalScore += Math.round((stats.playersAlive / stats.playersStarted) * 10);
    survivalScore += Math.min(10, stats.roundsSurvived); // Cap at 10 for rounds survived
  }
  survivalScore = Math.min(30, survivalScore);

  // Combat Score (0-25)
  // Based on: enemies killed, bosses, critical hits, damage efficiency
  let combatScore = 0;
  combatScore += Math.min(10, stats.enemiesKilled); // Up to 10 points for kills
  combatScore += stats.bossesDefeated.length * 5; // 5 points per boss
  combatScore += Math.min(5, stats.criticalHits); // Up to 5 for crits
  // Damage efficiency: dealt more than taken
  if (stats.totalDamageTaken > 0) {
    const damageRatio = stats.totalDamageDealt / stats.totalDamageTaken;
    combatScore += Math.min(5, Math.floor(damageRatio));
  } else if (stats.totalDamageDealt > 0) {
    combatScore += 5; // Perfect combat - no damage taken
  }
  combatScore = Math.min(25, combatScore);

  // Exploration Score (0-20)
  // Based on: tiles explored, secrets found, dark rooms
  let explorationScore = 0;
  explorationScore += Math.min(10, Math.floor(stats.tilesExplored / 2)); // Up to 10 for exploration
  explorationScore += stats.secretsFound * 3; // 3 per secret
  explorationScore += stats.darkRoomsIlluminated * 2; // 2 per dark room
  explorationScore = Math.min(20, explorationScore);

  // Objective Score (0-15)
  // Based on: objectives completed, optional objectives
  let objectiveScore = 0;
  if (stats.totalObjectives > 0) {
    objectiveScore += Math.round((stats.objectivesCompleted / stats.totalObjectives) * 10);
  }
  objectiveScore += stats.optionalObjectivesCompleted * 2.5; // 2.5 per optional
  objectiveScore += stats.questItemsCollected; // 1 per quest item
  objectiveScore = Math.min(15, objectiveScore);

  // Sanity Score (0-10)
  // Based on: horror checks passed, sanity preserved, no madness
  let sanityScore = 0;
  if (stats.horrorChecksPerformed > 0) {
    const passRate = stats.horrorChecksPassed / stats.horrorChecksPerformed;
    sanityScore += Math.round(passRate * 5);
  } else {
    sanityScore += 5; // No horror checks = full points
  }
  // Penalty for acquiring madness
  sanityScore -= stats.madnessesAcquired.length * 2;
  // Bonus for sanity management
  if (stats.totalSanityRecovered >= stats.totalSanityLost * 0.5) {
    sanityScore += 3;
  }
  sanityScore = Math.max(0, Math.min(10, sanityScore));

  const totalScore = survivalScore + combatScore + explorationScore + objectiveScore + sanityScore;

  return {
    survivalScore,
    combatScore,
    explorationScore,
    objectiveScore,
    sanityScore,
    totalScore
  };
}

/**
 * Converts a total score (0-100) to a performance rating
 */
function scoreToRating(score: number, isVictory: boolean): PerformanceRating {
  if (isVictory) {
    if (score >= 85) return 'S';
    if (score >= 70) return 'A';
    if (score >= 50) return 'B';
    if (score >= 30) return 'C';
    return 'F';
  } else {
    // Defeat ratings are more lenient - reward good effort even in loss
    if (score >= 60) return 'S';
    if (score >= 45) return 'A';
    if (score >= 30) return 'B';
    if (score >= 15) return 'C';
    return 'F';
  }
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Calculates the performance rating based on game statistics
 */
export function calculatePerformanceRating(
  stats: GameStats,
  isVictory: boolean
): { rating: PerformanceRating; score: number; breakdown: ScoreBreakdown } {
  const breakdown = calculateScoreBreakdown(stats, isVictory);
  const rating = scoreToRating(breakdown.totalScore, isVictory);

  return {
    rating,
    score: breakdown.totalScore,
    breakdown
  };
}

/**
 * Gets the rating title and description
 */
export function getRatingInfo(rating: PerformanceRating, isVictory: boolean): RatingInfo {
  return isVictory ? VICTORY_RATINGS[rating] : DEFEAT_RATINGS[rating];
}

/**
 * Generates character fates for all players at scenario end
 */
export function generateCharacterFates(
  players: Player[],
  stats: GameStats,
  isVictory: boolean
): CharacterFate[] {
  return players.map(player => {
    const survived = !player.isDead;
    const madnessAcquired = player.madness || [];

    // Generate personal epilogue based on state
    let personalEpilogue = '';
    if (!survived) {
      personalEpilogue = getDeathEpilogue(player);
    } else if (madnessAcquired.length > 0) {
      personalEpilogue = getMadnessEpilogue(player, madnessAcquired);
    } else if (player.hp <= 2) {
      personalEpilogue = getWoundedEpilogue(player);
    } else if (player.sanity <= 1) {
      personalEpilogue = getLowSanityEpilogue(player);
    } else {
      personalEpilogue = getHealthyEpilogue(player, isVictory);
    }

    // Calculate kill count (estimate based on stats distribution)
    const killCount = Math.floor(stats.enemiesKilled / Math.max(1, stats.playersAlive));

    return {
      playerId: player.id,
      name: player.name,
      characterClass: player.id as any,  // CharacterType
      survived,
      finalHp: player.hp,
      maxHp: player.maxHp,
      finalSanity: player.sanity,
      maxSanity: player.maxSanity,
      madnessAcquired,
      personalEpilogue,
      killCount
    };
  });
}

// ============================================================================
// CHARACTER EPILOGUE GENERATORS
// ============================================================================

function getDeathEpilogue(player: Player): string {
  const deathEpilogues: Record<string, string> = {
    detective: 'The case remains unsolved. Another name added to the missing persons files of Arkham.',
    professor: 'Their final notes, scrawled in a shaking hand, speak of impossible geometries.',
    veteran: 'They died as they lived—facing the darkness without flinching. A soldier\'s end.',
    journalist: 'The story that could have exposed everything dies with them. Some truths are too dangerous.',
    occultist: 'The very forces they sought to master claimed them in the end. The cosmos demands balance.',
    doctor: 'Even their skill could not save them from what lurks beyond medicine\'s reach.'
  };
  return deathEpilogues[player.id] || 'Another soul lost to the encroaching dark.';
}

function getMadnessEpilogue(player: Player, madness: string[]): string {
  const madnessName = madness[madness.length - 1] || 'unknown';
  const madnessEpilogues: Record<string, string> = {
    hallucination: 'The walls still breathe. They always did. You just see it now.',
    paranoia: 'Trust no one. They\'re watching. They\'re always watching.',
    hysteria: 'The laughter bubbles up unbidden. You\'ve seen the cosmic joke.',
    catatonia: 'Sometimes, stillness is the only defense against what moves in the dark.',
    obsession: 'There\'s always more to find. Always one more secret. Always.',
    amnesia: 'Blessed forgetfulness. Would that it could erase what truly matters.',
    night_terrors: 'Sleep offers no escape now. It never will again.',
    dark_insight: 'You understand now. The terrible, beautiful pattern of everything.'
  };
  return madnessEpilogues[madnessName] || 'Something has changed in their eyes. Something that will never change back.';
}

function getWoundedEpilogue(player: Player): string {
  const woundedEpilogues: Record<string, string[]> = {
    detective: [
      'The scars will fade. The memories won\'t.',
      'Another case closed, another price paid in flesh.'
    ],
    professor: [
      'Knowledge extracted at a painful cost.',
      'The body heals; the mind catalogs what it has learned.'
    ],
    veteran: [
      'New wounds to add to the old. The war never truly ended.',
      'Battered but unbowed. They\'ve survived worse. Haven\'t they?'
    ],
    journalist: [
      'Every scar is a story. Every story must be told.',
      'The truth demands sacrifice. They paid willingly.'
    ],
    occultist: [
      'Pain is merely another form of energy. Energy can be channeled.',
      'The flesh is weak, but the will remains iron.'
    ],
    doctor: [
      'Physician, heal thyself—if only it were that simple.',
      'They know exactly how close they came. That knowledge cuts deepest.'
    ]
  };
  const epilogues = woundedEpilogues[player.id] || ['Wounded in body, but not in spirit.'];
  return epilogues[Math.floor(Math.random() * epilogues.length)];
}

function getLowSanityEpilogue(player: Player): string {
  return 'The experience has left its mark. They stare into distances no one else can see, ' +
    'and sometimes, late at night, they whisper to things that aren\'t there. Perhaps.';
}

function getHealthyEpilogue(player: Player, isVictory: boolean): string {
  if (!isVictory) {
    return 'They escaped with body and mind intact—a rare gift when facing the unknown. ' +
      'But escape is not the same as victory.';
  }

  const healthyEpilogues: Record<string, string> = {
    detective: 'Case closed—for now. The files go into the cabinet marked "Unexplained." There are many such files.',
    professor: 'The research continues. This was but one data point in an infinite equation.',
    veteran: 'Mission accomplished. They salute fallen comrades, living and otherwise, then march on.',
    journalist: 'The story writes itself. Whether anyone will believe it is another matter entirely.',
    occultist: 'The ritual worked. The balance holds. But such workings always carry a deferred cost.',
    doctor: 'Everyone lives. For now. In their line of work, that\'s the best anyone can hope for.'
  };
  return healthyEpilogues[player.id] || 'Against all odds, they emerged whole. The universe does not often permit such outcomes.';
}

/**
 * Generates consequences (positive and negative outcomes) from the scenario
 */
export function generateConsequences(
  stats: GameStats,
  scenario: Scenario | null,
  isVictory: boolean
): { positive: string[]; negative: string[] } {
  const positive: string[] = [];
  const negative: string[] = [];

  // Victory-specific consequences
  if (isVictory) {
    positive.push('The immediate threat has been neutralized.');

    if (stats.bossesDefeated.length > 0) {
      positive.push(`${stats.bossesDefeated.join(' and ')} ${stats.bossesDefeated.length > 1 ? 'were' : 'was'} destroyed.`);
    }

    if (stats.playersAlive === stats.playersStarted) {
      positive.push('All investigators survived the ordeal.');
    }

    if (stats.doomAtEnd > stats.doomAtStart * 0.5) {
      positive.push('The cosmic alignment was disrupted in time.');
    }

    if (stats.survivorsRescued > 0) {
      positive.push(`${stats.survivorsRescued} survivor${stats.survivorsRescued > 1 ? 's were' : ' was'} rescued.`);
    }
  } else {
    // Defeat consequences
    negative.push('The investigation has failed. The darkness grows stronger.');

    if (stats.doomAtEnd <= 0) {
      negative.push('The ritual was completed. Something has awakened.');
    }
  }

  // Common consequences based on stats
  if (stats.playerDeaths.length > 0) {
    negative.push(`${stats.playerDeaths.join(', ')} did not survive.`);
  }

  if (stats.madnessesAcquired.length > 0) {
    negative.push('Some investigators have been permanently affected by what they witnessed.');
  }

  if (stats.survivorsLost > 0) {
    negative.push(`${stats.survivorsLost} survivor${stats.survivorsLost > 1 ? 's were' : ' was'} lost.`);
  }

  if (stats.secretsFound > 2) {
    positive.push('Important secrets were uncovered that may aid future investigations.');
  }

  if (stats.questItemsCollected > 3) {
    positive.push('Valuable evidence was gathered for the archives.');
  }

  return { positive, negative };
}

/**
 * Calculates legacy rewards (gold and XP) based on performance
 */
export function calculateLegacyRewards(
  stats: GameStats,
  rating: PerformanceRating,
  isVictory: boolean,
  difficulty: 'Normal' | 'Hard' | 'Nightmare'
): { goldEarned: number; xpEarned: number; bonusGold: number; bonusXP: number } {
  // Base rewards by difficulty
  const difficultyMultiplier = {
    Normal: 1.0,
    Hard: 1.5,
    Nightmare: 2.0
  };

  const mult = difficultyMultiplier[difficulty];

  // Base values
  let baseGold = isVictory ? 100 : 25;
  let baseXP = isVictory ? 50 : 10;

  // Apply difficulty multiplier
  baseGold = Math.round(baseGold * mult);
  baseXP = Math.round(baseXP * mult);

  // Rating bonuses
  const ratingBonus = {
    S: { gold: 100, xp: 50 },
    A: { gold: 50, xp: 25 },
    B: { gold: 25, xp: 15 },
    C: { gold: 10, xp: 5 },
    F: { gold: 0, xp: 0 }
  };

  let bonusGold = Math.round(ratingBonus[rating].gold * mult);
  let bonusXP = Math.round(ratingBonus[rating].xp * mult);

  // Additional bonuses
  bonusGold += stats.bossesDefeated.length * 25; // Boss kills
  bonusGold += stats.survivorsRescued * 15;      // Rescued survivors
  bonusGold += stats.secretsFound * 10;          // Secrets found
  bonusGold += stats.goldFound;                  // Found gold

  bonusXP += stats.bossesDefeated.length * 15;   // Boss kills
  bonusXP += stats.enemiesKilled * 2;            // Enemy kills (capped)
  bonusXP = Math.min(bonusXP, baseXP + 100);     // Cap bonus XP

  return {
    goldEarned: baseGold,
    xpEarned: baseXP,
    bonusGold,
    bonusXP
  };
}
