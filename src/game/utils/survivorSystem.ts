/**
 * NPC Survivor System for Shadows of the 1920s
 * Handles survivor spawning, behavior, rescue mechanics, and rewards
 * Version 1.0 - January 2026
 */

import {
  Survivor,
  SurvivorType,
  SurvivorState,
  SurvivorSpecialAbility,
  SurvivorSpawnConfig,
  TileCategory,
  Player,
  Tile,
  Enemy
} from '../types';
import { hexDistance, getHexNeighbors, hasLineOfSight } from '../hexUtils';

// ============================================================================
// SURVIVOR TEMPLATES - Base configurations for each survivor type
// ============================================================================

export interface SurvivorTemplate {
  type: SurvivorType;
  names: string[];                    // Pool of possible names
  hp: number;
  speed: number;
  canDefendSelf: boolean;
  insightReward: number;
  sanityReward: number;
  goldReward: number;
  specialAbility?: SurvivorSpecialAbility;
  dialogues: {
    found: string[];
    following: string[];
    rescued: string[];
  };
}

export const SURVIVOR_TEMPLATES: Record<SurvivorType, SurvivorTemplate> = {
  civilian: {
    type: 'civilian',
    names: ['Thomas', 'Margaret', 'William', 'Elizabeth', 'Henry', 'Dorothy', 'Charles', 'Mary'],
    hp: 2,
    speed: 1,
    canDefendSelf: false,
    insightReward: 0,
    sanityReward: 1,
    goldReward: 25,
    dialogues: {
      found: [
        'Takk Gud! Jeg trodde aldri noen ville finne meg!',
        'Hjelp meg! De... tingene... er overalt!',
        'Er det trygt? Kan vi komme oss ut herfra?'
      ],
      following: [
        'Jeg holder meg nærme deg.',
        'Ikke forlat meg!',
        'Hva var det?!'
      ],
      rescued: [
        'Jeg skal aldri glemme det du gjorde for meg.',
        'Tusen takk! Du reddet livet mitt!',
        'Endelig trygg... tror jeg.'
      ]
    }
  },

  wounded: {
    type: 'wounded',
    names: ['Samuel', 'Agnes', 'Frederick', 'Clara', 'Arthur', 'Beatrice'],
    hp: 1,
    speed: 0, // Må bæres eller støttes
    canDefendSelf: false,
    insightReward: 0,
    sanityReward: 2,
    goldReward: 50,
    dialogues: {
      found: [
        '*stønner* Jeg... klarer ikke å gå...',
        'De angrep meg... blodet... hjelp meg...',
        'Beina mine... jeg kan ikke bevege meg...'
      ],
      following: [
        '*puster tungt*',
        'Bare litt til...',
        'Takk for at du bærer meg...'
      ],
      rescued: [
        'Jeg skylder deg livet mitt.',
        'Uten deg hadde jeg dødd der inne.',
        'En lege! Endelig!'
      ]
    }
  },

  researcher: {
    type: 'researcher',
    names: ['Dr. Armitage', 'Prof. Wilmarth', 'Dr. Peaslee', 'Prof. Webb', 'Dr. Morgan'],
    hp: 2,
    speed: 1,
    canDefendSelf: false,
    insightReward: 3,
    sanityReward: 0,
    goldReward: 75,
    specialAbility: 'knowledge',
    dialogues: {
      found: [
        'Endelig! Noen som forstår! Jeg har oppdaget noe forferdelig...',
        'Mine notater! Du må se dette - det forklarer alt!',
        'Kulten... de prøver å åpne en portal til... nei, det er for forferdelig.'
      ],
      following: [
        'Jeg har kartlagt flere av deres ritualer...',
        'Pass på symbolene - de betyr noe!',
        'Vi må ødelegge notatene deres.'
      ],
      rescued: [
        'Universitetet må vite om dette. Her, ta mine notater.',
        'Denne kunnskapen... den kan hjelpe dere stoppe dem.',
        'Vær forsiktig med det du har lært. Noen sannheter er farlige.'
      ]
    }
  },

  cultist_defector: {
    type: 'cultist_defector',
    names: ['Marcus', 'Helena', 'Silas', 'Vera', 'Edgar'],
    hp: 3,
    speed: 1,
    canDefendSelf: true,
    insightReward: 2,
    sanityReward: -1, // Deres kunnskap er forstyrrende
    goldReward: 100,
    specialAbility: 'reveal_map',
    dialogues: {
      found: [
        'Jeg... jeg var en av dem. Men jeg så sannheten - de er gale!',
        'De ville ofre meg! Deres egen bror i kulten!',
        'Jeg kjenner deres hemmeligheter. Hjelp meg, så hjelper jeg dere.'
      ],
      following: [
        'Den veien - der er det voktere.',
        'Ikke stol på noe som ser menneskelig ut.',
        'Ritualrommet er nærme. Jeg kan føle det.'
      ],
      rescued: [
        'Jeg kan aldri sone for det jeg har gjort. Men kanskje dette hjelper.',
        'Her er kartet til deres hovedkvarter. Gjør det som må gjøres.',
        'De vil jakte meg for alltid nå. Det er verdt det.'
      ]
    }
  },

  child: {
    type: 'child',
    names: ['Tommy', 'Sally', 'Billy', 'Emma', 'Jack', 'Lucy'],
    hp: 1,
    speed: 1,
    canDefendSelf: false,
    insightReward: 0,
    sanityReward: 3, // Stor sinnro-gevinst for å redde et barn
    goldReward: 0,
    specialAbility: 'calm_aura',
    dialogues: {
      found: [
        '*gråter* Hvor er mamma? Hvor er pappa?',
        'De... de tok alle sammen! Jeg gjemte meg...',
        'Er du en helt? Kan du ta meg med hjem?'
      ],
      following: [
        '*holder i hånden din*',
        'Jeg er redd... men jeg stoler på deg.',
        'Vil monstrene ta meg?'
      ],
      rescued: [
        '*klemmer deg* Takk takk takk!',
        'Du er den modigste voksne jeg vet om!',
        'Kan du finne mamma og pappa også?'
      ]
    }
  },

  asylum_patient: {
    type: 'asylum_patient',
    names: ['Patient 14', 'Den Stille', 'Cassandra', 'Ezekiel', 'Miriam'],
    hp: 2,
    speed: 1,
    canDefendSelf: false,
    insightReward: 1,
    sanityReward: -2, // Deres galskap er smittsom
    goldReward: 25,
    specialAbility: 'distraction',
    dialogues: {
      found: [
        '*ler upassende* De tror jeg er gal! Men JEG ser sannheten!',
        'Stemmene... de visste du ville komme. De vet ALT.',
        'Har du sett dem? De som går gjennom veggene?'
      ],
      following: [
        '*mumler uforståelige ord*',
        'Snart... snart ser du også...',
        'De liker deg ikke. Jeg hører dem hviske.'
      ],
      rescued: [
        'Frihet! *danser*...eller er dette et nytt rom?',
        'Du tror du reddet meg. Men hvem redder DEG?',
        '*peker på noe du ikke kan se* Se! De takker deg!'
      ]
    }
  },

  reporter: {
    type: 'reporter',
    names: ['Jack Bradshaw', 'Emily Carter', 'Richard Stone', 'Sarah Williams'],
    hp: 2,
    speed: 1,
    canDefendSelf: false,
    insightReward: 1,
    sanityReward: 0,
    goldReward: 50,
    dialogues: {
      found: [
        'Journalister går overalt for en god historie - selv hit.',
        'Folkene har rett til å vite! Hjelp meg komme ut med dette.',
        'Jeg har fotografert alt. Verden må se dette.'
      ],
      following: [
        '*tar notater* Fascinerende teknikk du har der.',
        'Hvordan staver du navnet ditt? For artikkelen.',
        'Dette blir førstesiden!'
      ],
      rescued: [
        'Historien kommer ut - med DITT navn som helt!',
        'Takk. Jeg skal sørge for at du får æren.',
        'Arkham Gazette: "MODIGE ETTERFORSKERE AVSLØRER KULTENS ONDSKAP"'
      ]
    }
  },

  occultist_ally: {
    type: 'occultist_ally',
    names: ['Morgana', 'Aleister', 'Isadora', 'Randolph', 'Cassilda'],
    hp: 3,
    speed: 1,
    canDefendSelf: true,
    insightReward: 2,
    sanityReward: 0,
    goldReward: 100,
    specialAbility: 'ward',
    dialogues: {
      found: [
        'Endelig - noen med mot nok til å kjempe mot mørket.',
        'Min beskyttelsesforbannelse holdt dem unna. Men den svekkes.',
        'Sammen kan vi stoppe ritualet. Alene er vi fortapt.'
      ],
      following: [
        '*resiterer beskyttelsesformler*',
        'Hold deg nær. Min aura beskytter oss.',
        'Jeg føler deres tilstedeværelse. De nærmer seg.'
      ],
      rescued: [
        'Ta dette amuletten - den vil beskytte deg.',
        'Du har gjort en mektig alliert i dag.',
        'Jeg vil våke over dere fra skyggene. Kall på meg om du trenger hjelp.'
      ]
    }
  }
};

// ============================================================================
// SURVIVOR SPAWN CONFIGURATION
// ============================================================================

export const SURVIVOR_SPAWN_CONFIG: SurvivorSpawnConfig[] = [
  { type: 'civilian', weight: 30, minDoom: 0, maxDoom: 255, preferredTiles: ['room', 'corridor', 'urban'] },
  { type: 'wounded', weight: 15, minDoom: 0, maxDoom: 10, preferredTiles: ['corridor', 'basement', 'crypt'] },
  { type: 'researcher', weight: 10, minDoom: 0, maxDoom: 255, preferredTiles: ['room', 'foyer'] },
  { type: 'cultist_defector', weight: 5, minDoom: 0, maxDoom: 6, preferredTiles: ['crypt', 'basement', 'room'] },
  { type: 'child', weight: 8, minDoom: 0, maxDoom: 255, preferredTiles: ['room', 'corridor', 'nature'] },
  { type: 'asylum_patient', weight: 7, minDoom: 0, maxDoom: 8, preferredTiles: ['corridor', 'basement', 'crypt'] },
  { type: 'reporter', weight: 12, minDoom: 0, maxDoom: 255, preferredTiles: ['urban', 'street', 'facade'] },
  { type: 'occultist_ally', weight: 3, minDoom: 0, maxDoom: 5, preferredTiles: ['crypt', 'room'] }
];

// ============================================================================
// SURVIVOR SPAWNING
// ============================================================================

/**
 * Select a random survivor type based on spawn weights and conditions
 */
export function selectSurvivorType(
  tileCategory: TileCategory,
  currentDoom: number
): SurvivorType | null {
  // Filter valid spawns
  const validSpawns = SURVIVOR_SPAWN_CONFIG.filter(config =>
    currentDoom >= config.minDoom &&
    currentDoom <= config.maxDoom &&
    config.preferredTiles.includes(tileCategory)
  );

  if (validSpawns.length === 0) return null;

  // Weighted random selection
  const totalWeight = validSpawns.reduce((sum, c) => sum + c.weight, 0);
  let random = Math.random() * totalWeight;

  for (const config of validSpawns) {
    random -= config.weight;
    if (random <= 0) return config.type;
  }

  return validSpawns[0].type;
}

/**
 * Create a new survivor at the given position
 */
export function createSurvivor(
  type: SurvivorType,
  position: { q: number; r: number }
): Survivor {
  const template = SURVIVOR_TEMPLATES[type];
  const name = template.names[Math.floor(Math.random() * template.names.length)];

  return {
    id: `survivor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    type,
    state: 'hidden',
    position: { ...position },
    hp: template.hp,
    maxHp: template.hp,
    speed: template.speed,
    canDefendSelf: template.canDefendSelf,
    panicLevel: type === 'asylum_patient' ? 80 : 30,
    insightReward: template.insightReward,
    sanityReward: template.sanityReward,
    goldReward: template.goldReward,
    specialAbility: template.specialAbility,
    foundDialogue: template.dialogues.found[Math.floor(Math.random() * template.dialogues.found.length)],
    followDialogue: template.dialogues.following[Math.floor(Math.random() * template.dialogues.following.length)],
    rescuedDialogue: template.dialogues.rescued[Math.floor(Math.random() * template.dialogues.rescued.length)]
  };
}

/**
 * Check if a survivor should spawn when entering a tile
 */
export function shouldSpawnSurvivor(
  tile: Tile,
  currentDoom: number,
  existingSurvivors: Survivor[],
  isFirstVisit: boolean
): boolean {
  // Only spawn on first visit
  if (!isFirstVisit) return false;

  // Limit total survivors
  if (existingSurvivors.filter(s => s.state !== 'rescued' && s.state !== 'dead').length >= 3) {
    return false;
  }

  // Base chance (lower than enemies)
  const baseChance = 0.08;

  // Category modifier
  let categoryMod = 0;
  if (tile.category === 'room' || tile.category === 'corridor') categoryMod = 0.05;
  if (tile.category === 'crypt' || tile.category === 'basement') categoryMod = 0.03;

  // Doom modifier (more survivors when doom is lower - more desperate)
  const doomMod = (12 - currentDoom) * 0.005;

  const finalChance = Math.max(0.02, Math.min(0.2, baseChance + categoryMod + doomMod));

  return Math.random() < finalChance;
}

// ============================================================================
// SURVIVOR BEHAVIOR
// ============================================================================

/**
 * Process survivor AI for a turn
 * Survivors follow their assigned player or panic if alone with enemies nearby
 */
export function processSurvivorTurn(
  survivors: Survivor[],
  players: Player[],
  enemies: Enemy[],
  tiles: Tile[]
): {
  updatedSurvivors: Survivor[];
  messages: string[];
  panicEvents: Array<{ survivor: Survivor; message: string }>;
} {
  const updatedSurvivors: Survivor[] = [];
  const messages: string[] = [];
  const panicEvents: Array<{ survivor: Survivor; message: string }> = [];

  for (const survivor of survivors) {
    // Skip rescued or dead survivors
    if (survivor.state === 'rescued' || survivor.state === 'dead') {
      updatedSurvivors.push(survivor);
      continue;
    }

    let updated = { ...survivor };

    // Check for nearby enemies
    const nearbyEnemies = enemies.filter(e =>
      hexDistance(e.position, survivor.position) <= 2
    );

    // Update panic level
    if (nearbyEnemies.length > 0) {
      updated.panicLevel = Math.min(100, updated.panicLevel + 20 * nearbyEnemies.length);
    } else if (survivor.followingPlayerId) {
      updated.panicLevel = Math.max(0, updated.panicLevel - 10);
    }

    // Following behavior
    if (survivor.state === 'following' && survivor.followingPlayerId) {
      const leader = players.find(p => p.id === survivor.followingPlayerId);

      if (leader && !leader.isDead) {
        const distance = hexDistance(survivor.position, leader.position);

        // Move toward leader if too far
        if (distance > 1 && updated.speed > 0) {
          const newPos = moveToward(survivor.position, leader.position, tiles, enemies, survivors);
          if (newPos) {
            updated.position = newPos;
          }
        }

        // Panic check if enemies nearby
        if (nearbyEnemies.length > 0 && updated.panicLevel >= 80) {
          panicEvents.push({
            survivor: updated,
            message: `${survivor.name} skriker av redsel!`
          });
        }
      } else {
        // Leader is dead - survivor is now alone
        updated.state = 'found';
        updated.followingPlayerId = undefined;
        updated.panicLevel = Math.min(100, updated.panicLevel + 30);
        messages.push(`${survivor.name} er nå alene og redd!`);
      }
    }

    // Hidden survivors can be discovered by players walking adjacent
    if (survivor.state === 'hidden') {
      const adjacentPlayer = players.find(p =>
        !p.isDead && hexDistance(p.position, survivor.position) <= 1
      );
      if (adjacentPlayer) {
        updated.state = 'found';
        messages.push(`${adjacentPlayer.name} finner ${survivor.name}!`);
      }
    }

    updatedSurvivors.push(updated);
  }

  return { updatedSurvivors, messages, panicEvents };
}

/**
 * Move survivor toward a target position
 */
function moveToward(
  from: { q: number; r: number },
  to: { q: number; r: number },
  tiles: Tile[],
  enemies: Enemy[],
  survivors: Survivor[]
): { q: number; r: number } | null {
  const neighbors = getHexNeighbors(from);
  const occupiedPositions = new Set([
    ...enemies.map(e => `${e.position.q},${e.position.r}`),
    ...survivors.map(s => `${s.position.q},${s.position.r}`)
  ]);

  let bestPos: { q: number; r: number } | null = null;
  let bestDist = hexDistance(from, to);

  for (const pos of neighbors) {
    const key = `${pos.q},${pos.r}`;
    if (occupiedPositions.has(key)) continue;

    const tile = tiles.find(t => t.q === pos.q && t.r === pos.r);
    if (!tile || tile.obstacle?.blocking) continue;

    const dist = hexDistance(pos, to);
    if (dist < bestDist) {
      bestDist = dist;
      bestPos = pos;
    }
  }

  return bestPos;
}

// ============================================================================
// SURVIVOR INTERACTIONS
// ============================================================================

/**
 * Start following a player
 */
export function startFollowing(
  survivor: Survivor,
  player: Player
): Survivor {
  return {
    ...survivor,
    state: 'following',
    followingPlayerId: player.id,
    panicLevel: Math.max(0, survivor.panicLevel - 20)
  };
}

/**
 * Rescue a survivor (they reach exit or objective)
 */
export function rescueSurvivor(
  survivor: Survivor
): { survivor: Survivor; rewards: { insight: number; sanity: number; gold: number; item?: string } } {
  return {
    survivor: {
      ...survivor,
      state: 'rescued'
    },
    rewards: {
      insight: survivor.insightReward,
      sanity: survivor.sanityReward,
      gold: survivor.goldReward,
      item: survivor.itemReward
    }
  };
}

/**
 * Kill a survivor (monster attack)
 */
export function killSurvivor(
  survivor: Survivor,
  killer: Enemy
): { survivor: Survivor; sanityLoss: number; message: string } {
  // Different sanity loss based on survivor type
  let sanityLoss = 1;
  if (survivor.type === 'child') sanityLoss = 3;
  if (survivor.type === 'wounded') sanityLoss = 2;

  const messages: Record<SurvivorType, string> = {
    civilian: `${killer.name} dreper ${survivor.name}! Deres skrik gjenlyder...`,
    wounded: `${killer.name} gjør ende på den sårede ${survivor.name}!`,
    researcher: `${killer.name} sliter ${survivor.name} i stykker! Notatene spres over gulvet...`,
    cultist_defector: `${killer.name} finner avhopperen ${survivor.name}! Kulten har fått sin hevn.`,
    child: `${killer.name} angriper ${survivor.name}! Et barns skrik...`,
    asylum_patient: `${killer.name} stilner ${survivor.name}s gale latter for godt.`,
    reporter: `${killer.name} dreper ${survivor.name}! Historien dør med ham.`,
    occultist_ally: `${killer.name} overvinner ${survivor.name}s beskyttelsesmagi!`
  };

  return {
    survivor: {
      ...survivor,
      state: 'dead',
      hp: 0
    },
    sanityLoss,
    message: messages[survivor.type]
  };
}

// ============================================================================
// SURVIVOR SPECIAL ABILITIES
// ============================================================================

/**
 * Use a survivor's special ability
 */
export function useSurvivorAbility(
  survivor: Survivor,
  players: Player[],
  tiles: Tile[]
): {
  survivor: Survivor;
  effects: {
    healed?: { playerId: string; amount: number }[];
    revealed?: { q: number; r: number }[];
    ward?: { position: { q: number; r: number }; duration: number };
    distraction?: { position: { q: number; r: number } };
    knowledge?: { message: string };
    calmAura?: { sanityBonus: number };
  };
  message: string;
} | null {
  if (!survivor.specialAbility || survivor.abilityUsed) return null;

  const effects: {
    healed?: { playerId: string; amount: number }[];
    revealed?: { q: number; r: number }[];
    ward?: { position: { q: number; r: number }; duration: number };
    distraction?: { position: { q: number; r: number } };
    knowledge?: { message: string };
    calmAura?: { sanityBonus: number };
  } = {};

  let message = '';

  switch (survivor.specialAbility) {
    case 'heal_party':
      effects.healed = players
        .filter(p => !p.isDead && hexDistance(p.position, survivor.position) <= 2)
        .map(p => ({ playerId: p.id, amount: 1 }));
      message = `${survivor.name} bruker sin helbredende evne! Alle i nærheten føler seg bedre.`;
      break;

    case 'reveal_map':
      const revealed: { q: number; r: number }[] = [];
      for (let dq = -2; dq <= 2; dq++) {
        for (let dr = -2; dr <= 2; dr++) {
          if (Math.abs(dq + dr) <= 2) {
            revealed.push({ q: survivor.position.q + dq, r: survivor.position.r + dr });
          }
        }
      }
      effects.revealed = revealed;
      message = `${survivor.name} avslører nærliggende områder basert på sin kunnskap.`;
      break;

    case 'ward':
      effects.ward = {
        position: { ...survivor.position },
        duration: 3
      };
      message = `${survivor.name} kaster en beskyttelsessirkel! Fiender kan ikke entre området.`;
      break;

    case 'distraction':
      effects.distraction = { ...survivor.position };
      message = `${survivor.name} skaper en avledning! Fiender trekkes mot lyden.`;
      break;

    case 'knowledge':
      const knowledgeMessages = [
        'Kulten frykter eldgamle symboler. Elder Signs kan stoppe dem.',
        'Deres ritual krever blod. Unngå offerplassene.',
        'Mesteren kan påkalles ved å ødelegge de fire søylene.',
        'De kan ikke se deg hvis du holder deg i skyggene.',
        'Skapningene fra dypet hater ild.'
      ];
      effects.knowledge = {
        message: knowledgeMessages[Math.floor(Math.random() * knowledgeMessages.length)]
      };
      message = `${survivor.name} deler viktig kunnskap: "${effects.knowledge.message}"`;
      break;

    case 'calm_aura':
      effects.calmAura = { sanityBonus: 1 };
      message = `${survivor.name}s beroligende tilstedeværelse gir alle ro i sinnet.`;
      break;
  }

  return {
    survivor: { ...survivor, abilityUsed: true },
    effects,
    message
  };
}

// ============================================================================
// ENEMY TARGETING SURVIVORS
// ============================================================================

/**
 * Check if an enemy should target a survivor instead of a player
 */
export function shouldTargetSurvivor(
  enemy: Enemy,
  survivors: Survivor[],
  players: Player[],
  tiles: Tile[]
): Survivor | null {
  // Only some enemy types hunt survivors
  const hunterTypes = ['ghoul', 'cultist', 'hound', 'nightgaunt'];
  if (!hunterTypes.includes(enemy.type)) return null;

  const visibleSurvivors = survivors.filter(s =>
    (s.state === 'found' || s.state === 'following') &&
    hexDistance(enemy.position, s.position) <= enemy.visionRange &&
    hasLineOfSight(enemy.position, s.position, tiles, enemy.visionRange)
  );

  if (visibleSurvivors.length === 0) return null;

  // Ghouls always prefer wounded/weak targets
  if (enemy.type === 'ghoul') {
    const wounded = visibleSurvivors.find(s => s.type === 'wounded' || s.hp === 1);
    if (wounded) return wounded;
  }

  // Cultists target defectors with priority
  if (enemy.type === 'cultist') {
    const defector = visibleSurvivors.find(s => s.type === 'cultist_defector');
    if (defector) return defector;
  }

  // Nightgaunts prefer isolated, panicked survivors
  if (enemy.type === 'nightgaunt') {
    const panicked = visibleSurvivors
      .filter(s => s.panicLevel >= 60)
      .sort((a, b) => b.panicLevel - a.panicLevel)[0];
    if (panicked) return panicked;
  }

  // 30% chance to target closest survivor instead of player
  if (Math.random() < 0.3) {
    return visibleSurvivors
      .sort((a, b) => hexDistance(enemy.position, a.position) - hexDistance(enemy.position, b.position))[0];
  }

  return null;
}
