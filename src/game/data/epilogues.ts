/**
 * Epilogue System
 * Dynamic Lovecraftian narrative conclusions based on scenario type and outcome
 */

import { GameStats, VictoryType, PerformanceRating, ScenarioTheme } from '../types';

// ============================================================================
// EPILOGUE TEMPLATES BY SCENARIO TYPE
// ============================================================================

interface EpilogueTemplate {
  victory: string[];
  defeat_death: string[];
  defeat_doom: string[];
  pyrrhic: string[];  // Victory with heavy losses
}

const EPILOGUES_BY_VICTORY_TYPE: Record<VictoryType, EpilogueTemplate> = {
  escape: {
    victory: [
      'The old manor recedes into the mist behind you. As the first rays of dawn pierce the horizon, you dare to believe it is over. But in the cold logic of your investigator\'s mind, you know: doors once opened cannot be truly closed. You have glimpsed behind the veil, and the veil has glimpsed you.',
      'You run until your lungs burn, until the sounds of pursuit fade into memory. When you finally stop, gasping, you realize you can no longer remember what you were running from. Perhaps that is a mercy.',
      'The gate clangs shut behind you. Safety, or the illusion of it. You will never walk past this place without crossing to the other side of the street. Some exits lead to new prisons.',
      'Dawn finds you on the road to Arkham, clothes torn, mind reeling. The locals will ask questions. You will have no answers they would believe—or that you dare speak aloud.',
    ],
    defeat_death: [
      'The darkness was absolute in the end. Your lanterns sputtered and died, your ammunition ran dry, and one by one, the screaming stopped. Perhaps in some distant archive, a yellowed newspaper clipping will mention the disappearance. Perhaps not.',
      'They found the exit too late, or not at all. The maze had claimed them, as it was always meant to. Stone walls care nothing for human desperation.',
      'The last survivor fell within sight of freedom. So close. The universe delights in such cruel poetry.',
    ],
    defeat_doom: [
      'The ritual completes. Reality tears. Through the wound in existence, something vast becomes aware of this small, blue world. In Arkham, the citizens look up at a sky that now contains too many stars.',
      'You feel it in your bones—a cosmic shift, a wrongness that will never be made right. Whatever was meant to stay asleep has awakened. And it is hungry.',
      'The stars align for the first time in aeons. In R\'lyeh, Great Cthulhu turns in his death-sleep, and for the first time in aeons, he smiles.',
    ],
    pyrrhic: [
      'You escaped, but {deadPlayer} did not. Their screams still echo in the chambers of your memory, a symphony that will play each night until madness or death grants you silence. The mission was a success—the files say so. Your soul knows otherwise.',
      'Freedom tastes of ash and regret. You emerged, yes, but left pieces of yourself—and others—behind. Some escapes are merely slower deaths.',
    ]
  },

  investigation: {
    victory: [
      'The truth lies bare before you, terrible in its clarity. The bloodline, the summoning circles, the half-formed creatures in the cellar—it all connects to something older, something patient. You have answered one question, but a thousand more now crowd your thoughts, each more disturbing than the last.',
      'The case is closed. The evidence secured. But as you file your report, you wonder: who else knows? Who else has seen? And what will they do with that knowledge?',
      'Understanding comes, cold and unwelcome. You wish you could unknow what you have learned. But knowledge, unlike innocence, cannot be returned.',
      'The investigation concludes, but the implications stretch into infinity. You have traced one thread of the tapestry—a tapestry woven before humanity learned to walk upright.',
    ],
    defeat_death: [
      'Some mysteries kill those who seek to solve them. Your notes will be found, eventually—dismissed as the ravings of a disturbed mind. The truth will remain exactly where it prefers to be: in the shadows.',
      'They came too close to the truth. The truth defended itself, as it always does when mortals pry too deep.',
      'The investigation ends in unmarked graves and unanswered questions. Another cold case for the Arkham files.',
    ],
    defeat_doom: [
      'The investigation revealed too much, too late. Knowledge that should have remained buried now spreads like a plague. Some questions should never be asked.',
      'In seeking truth, you accelerated catastrophe. The cult needed witnesses, you see. Your horror feeds their god.',
      'The final piece of the puzzle clicks into place—the piece that ends everything. You understand now. You wish you didn\'t.',
    ],
    pyrrhic: [
      'The truth is yours, but the price was {deadPlayer}\'s life. Every word you write in your report feels like a betrayal of their sacrifice.',
      'You know what happened here. You know who did it and why. The knowledge brings no comfort—only the certainty that you will never sleep soundly again.',
    ]
  },

  assassination: {
    victory: [
      'The cult leader falls, and with them, the ritual\'s chance of completion—for now. But as you watch the life drain from their eyes, you see no fear. Only anticipation. "Another will rise," they whisper. "They always do."',
      'The target is eliminated. The immediate threat, neutralized. But looking at what they were trying to summon, you wonder if death was their punishment—or their reward.',
      'It is done. The monster wears human skin no longer. But as you clean your weapon, you cannot shake the feeling that you have merely pruned a branch of something far larger.',
      'The high priest\'s body crumples, and with it, the dark geometries that filled the air. Silence returns—natural silence, for the first time in hours. You have won a battle. The war continues.',
    ],
    defeat_death: [
      'The hunter became the hunted. Your target was better prepared, better informed, better connected to powers beyond mortal comprehension. They will not even remember your name.',
      'You came to kill a monster. The monster disagreed with this arrangement.',
      'Assassins are expendable. You were always meant to fail. Your employers knew this. You were merely the latest sacrifice to whatever lurks behind the cult.',
    ],
    defeat_doom: [
      'You killed them. You were sure you killed them. Yet the ritual completed anyway. Some sacrifices are only enhanced by violence.',
      'The target dies laughing. "Fool," they choke through bloody teeth. "You\'ve only freed me from this shell." Behind you, something vast begins to take shape.',
      'Murder was never the answer. Or perhaps it was exactly the answer, just not the one you intended. Blood spilled in ritual spaces has power. You provided the final ingredient.',
    ],
    pyrrhic: [
      'The cult leader is dead, but so is {deadPlayer}. As you stand over both bodies, you wonder which death accomplished more.',
      'Target eliminated. But looking at what it cost—at who it cost—you question whether victory is the right word.',
    ]
  },

  survival: {
    victory: [
      'Dawn breaks. You are still here. Against all reason, against all probability, you endured what the night threw against you. The sun feels like a stranger\'s touch.',
      'The siege is over. You survived the night—barely. Tomorrow, you will see if there is anything left worth surviving for.',
      'Time ran out, but not for you. The cosmic window closed, the stars drifted from their terrible alignment, and you remained when the light returned.',
      'You outlasted the darkness. Not through courage or skill, but through sheer, desperate endurance. Sometimes, that is enough.',
    ],
    defeat_death: [
      'They made it so close to sunrise. But "close" counts for nothing when the darkness is absolute.',
      'One by one, they fell. The night was patient. The night is always patient.',
      'Survival was never truly an option. The universe simply wanted to watch hope die slowly.',
    ],
    defeat_doom: [
      'You survived the night, but the night survived you too. And now it spreads beyond these walls, beyond this town, beyond anything humanity can contain.',
      'Time ran out. Not your time—the world\'s. You watched it happen. You will continue watching, for as long as the new masters permit.',
      'You endured until the end. Unfortunately, "the end" was exactly what the forces behind the darkness were waiting for.',
    ],
    pyrrhic: [
      'You survived. {deadPlayer} did not. Their sacrifice bought you minutes that stretched into salvation. You will carry their memory—and their guilt—forever.',
      'Dawn finds you alive and alone. The silence is absolute. Victory has never felt so much like defeat.',
    ]
  },

  ritual: {
    victory: [
      'The counter-ritual completes. The sigils flare and die. Whatever was trying to enter this world screams in frustration as the door slams shut. For now.',
      'Speaking words that should never be spoken, you seal what should never have been opened. The irony is not lost on you: to fight monsters, you had to become something monstrous yourself.',
      'The ritual succeeds. The cosmic balance tilts, ever so slightly, back toward sanity. But you have changed something fundamental, and the universe will remember.',
      'Ancient words, spoken in the correct order, at the precise moment. The stars realign. You have become what you sought to destroy: one who speaks with powers beyond mortal ken.',
    ],
    defeat_death: [
      'The ritual failed. Or perhaps it succeeded in a way you did not intend. Either way, those who attempted it are beyond caring about the distinction.',
      'Power demanded a price you could not pay. The ritual took what it needed and left only emptiness.',
      'You reached for forces beyond your understanding. They reached back.',
    ],
    defeat_doom: [
      'The ritual completed, yes—but the wrong one. Yours failed; theirs succeeded. What enters this world now knows your face, your name, your very soul.',
      'You spoke the words of power. But power was never yours to command. It used you as a conduit and thanked you by leaving the door open behind it.',
      'In the end, all rituals serve the same master. You simply helped it arrive faster.',
    ],
    pyrrhic: [
      'The sealing is complete, but {deadPlayer} became part of it. Their essence now holds the barrier in place. They are not dead, exactly. That might have been kinder.',
      'Success, at a cost that cannot be measured in human terms. The ritual required sacrifice. It took exactly what it needed.',
    ]
  },

  collection: {
    victory: [
      'All the artifacts are secured. In the wrong hands, they could have remade reality itself. In your hands, they simply weigh heavy—heavy with potential, heavy with responsibility.',
      'The collection is complete. Each item pulses with energy your ancestors would have called holy or profane. You know better now: such labels mean nothing to forces older than human language.',
      'Gathered and contained, the relics can no longer serve their intended purpose. But can they ever truly be destroyed? You suspect not. You have merely postponed the inevitable.',
      'The artifacts are yours—for safekeeping, you tell yourself. But late at night, you catch yourself gazing at them, wondering what would happen if you arranged them just so...',
    ],
    defeat_death: [
      'The artifacts remain scattered, their collectors dead. Others will seek them now. Others with less pure intentions.',
      'So close to completing the collection. But "close" was never close enough. The final piece cost everything.',
      'They died clutching treasures they could not keep. The universe has a dark sense of humor about such things.',
    ],
    defeat_doom: [
      'The wrong hands found the artifacts first. You feel the moment of completion—a shift in reality, a new note in the cosmic symphony. A wrong note.',
      'The collection is complete, but not by you. Somewhere, the pieces click together, and something begins to stir.',
      'In gathering the artifacts, you showed others where to look. Your failure became their blueprint for success.',
    ],
    pyrrhic: [
      'The artifacts are secured, but {deadPlayer} paid the price. You wonder if the relics were worth a human life. You suspect you will wonder for a very long time.',
      'Every piece is accounted for—at the cost of everything you held dear. Were they worth it? The question will haunt you.',
    ]
  }
};

// ============================================================================
// THEME-SPECIFIC FLAVOR
// ============================================================================

const THEME_FLAVOR: Record<ScenarioTheme, { setting: string; atmosphere: string }> = {
  manor: {
    setting: 'the decrepit manor',
    atmosphere: 'The old house groans as if in relief. Or perhaps warning.'
  },
  church: {
    setting: 'the desecrated church',
    atmosphere: 'No prayers will be answered here again. Some ground cannot be reconsecrated.'
  },
  asylum: {
    setting: 'the asylum\'s rotting halls',
    atmosphere: 'The screaming has stopped. Whether in death or release, you cannot say.'
  },
  warehouse: {
    setting: 'the waterfront warehouse',
    atmosphere: 'The fog rolls in from the harbor, as if eager to hide what happened here.'
  },
  forest: {
    setting: 'the accursed woods',
    atmosphere: 'The trees still whisper, but softer now. Waiting.'
  },
  urban: {
    setting: 'the cramped streets of Arkham',
    atmosphere: 'The city resumes its rhythms. It has endured worse. It always does.'
  },
  coastal: {
    setting: 'the wave-battered shore',
    atmosphere: 'The tide recedes, taking secrets back to depths that predate humanity.'
  },
  underground: {
    setting: 'the tunnels beneath',
    atmosphere: 'The darkness down here has weight. It presses against your sanity.'
  },
  academic: {
    setting: 'the hallowed halls of Miskatonic',
    atmosphere: 'The library will lock these events away. Another forbidden wing added to the collection.'
  }
};

// ============================================================================
// EPILOGUE GENERATOR
// ============================================================================

export interface EpilogueContext {
  victoryType: VictoryType;
  outcome: 'victory' | 'defeat_death' | 'defeat_doom';
  stats: GameStats;
  rating: PerformanceRating;
  theme?: ScenarioTheme;
  deadPlayerNames?: string[];
}

/**
 * Generates a dynamic epilogue based on scenario context
 */
export function generateEpilogue(context: EpilogueContext): string {
  const { victoryType, outcome, stats, rating, theme, deadPlayerNames } = context;

  // Get base epilogue template
  const templates = EPILOGUES_BY_VICTORY_TYPE[victoryType];

  // Determine which template set to use
  let templateSet: string[];
  const isPyrrhic = outcome === 'victory' && stats.playerDeaths.length > 0;

  if (isPyrrhic && templates.pyrrhic.length > 0) {
    templateSet = templates.pyrrhic;
  } else {
    templateSet = templates[outcome];
  }

  // Select a random template
  let epilogue = templateSet[Math.floor(Math.random() * templateSet.length)];

  // Replace placeholders
  if (deadPlayerNames && deadPlayerNames.length > 0) {
    epilogue = epilogue.replace('{deadPlayer}', deadPlayerNames[0]);
  }

  // Add theme-specific flavor if available
  if (theme && THEME_FLAVOR[theme]) {
    const flavor = THEME_FLAVOR[theme];
    epilogue += `\n\n${flavor.atmosphere}`;
  }

  // Add rating-specific suffix
  epilogue += '\n\n' + getRatingSuffix(rating, outcome === 'victory');

  return epilogue;
}

/**
 * Gets a suffix based on the performance rating
 */
function getRatingSuffix(rating: PerformanceRating, isVictory: boolean): string {
  if (isVictory) {
    switch (rating) {
      case 'S':
        return 'This was as close to a perfect outcome as the cosmos allows. Cherish it—such moments are rare indeed.';
      case 'A':
        return 'A commendable effort. The forces of darkness will think twice before crossing your path again.';
      case 'B':
        return 'Success, earned through perseverance. Not elegant, perhaps, but effective.';
      case 'C':
        return 'Survival is its own reward. Most who face such horrors fare far worse.';
      case 'F':
        return 'Victory by the narrowest of margins. Next time, you may not be so fortunate.';
    }
  } else {
    switch (rating) {
      case 'S':
        return 'Even in defeat, you fought with distinction. Your struggle will not be forgotten.';
      case 'A':
        return 'You came closer to success than most. Small comfort, but comfort nonetheless.';
      case 'B':
        return 'The forces arrayed against you were formidable. There is no shame in this outcome.';
      case 'C':
        return 'Perhaps you were simply not ready. Perhaps no one ever is.';
      case 'F':
        return 'The darkness does not celebrate. It simply continues, as it always has, as it always will.';
    }
  }
}

// ============================================================================
// STATIC QUOTES FOR DECORATION
// ============================================================================

export const LOVECRAFTIAN_QUOTES = [
  '"The oldest and strongest emotion of mankind is fear, and the oldest and strongest kind of fear is fear of the unknown."',
  '"That is not dead which can eternal lie, and with strange aeons even death may die."',
  '"The most merciful thing in the world is the inability of the human mind to correlate all its contents."',
  '"Ph\'nglui mglw\'nafh Cthulhu R\'lyeh wgah\'nagl fhtagn."',
  '"In the end, it is not the darkness we fear, but what we become in the light."',
  '"Madness is not the end. It is merely a different kind of beginning."',
  '"We live on a placid island of ignorance in the midst of black seas of infinity."',
  '"The dreams came first, as they always do. It was only later I realized: they were never dreams at all."',
  '"Some doors, once opened, can never truly be closed."',
  '"The stars are right. The stars are always right. We simply lack the wisdom to read them."'
];

/**
 * Gets a random Lovecraftian quote
 */
export function getRandomQuote(): string {
  return LOVECRAFTIAN_QUOTES[Math.floor(Math.random() * LOVECRAFTIAN_QUOTES.length)];
}

// ============================================================================
// MADNESS ACQUISITION MESSAGES
// ============================================================================

export const MADNESS_MESSAGES: Record<string, string> = {
  hallucination: 'The walls breathe now. They always did, you\'ve realized. You just didn\'t see it before.',
  paranoia: 'They\'re watching. They\'re always watching. Trust no one. Not even yourself.',
  hysteria: 'The laughter bubbles up from somewhere deep inside. You can\'t stop it. Why would you want to?',
  catatonia: 'Movement seems... optional. Everything seems optional. Why struggle against the void?',
  obsession: 'There\'s more here. There\'s always more. You have to find it. You HAVE to.',
  amnesia: 'Where... where are you? How did you get here? Does it matter anymore?',
  night_terrors: 'Sleep is no escape now. Sleep is when they come. They always come.',
  dark_insight: 'You see it now. The pattern. The terrible, beautiful pattern of everything.'
};

/**
 * Gets the message for acquiring a specific madness type
 */
export function getMadnessAcquisitionMessage(madnessType: string): string {
  return MADNESS_MESSAGES[madnessType] || 'Something has changed inside you. Something that can never change back.';
}
