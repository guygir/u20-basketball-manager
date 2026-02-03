// Opponent Team Generator
// Creates AI opponents with balanced rosters based on week/difficulty

import type { Opponent, OpponentPlayer } from './types';
import { GAME_CONSTANTS } from './constants';

const TEAM_NAMES = [
  'Thunder', 'Lightning', 'Storm', 'Blaze', 'Inferno',
  'Frost', 'Ice', 'Avalanche', 'Titans', 'Giants',
  'Warriors', 'Knights', 'Dragons', 'Phoenix', 'Eagles',
  'Wolves', 'Bears', 'Lions', 'Tigers', 'Panthers',
  'Sharks', 'Vipers', 'Cobras', 'Raptors', 'Hawks',
];

const TEAM_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e',
];

const FIRST_NAMES = [
  'James', 'Michael', 'Chris', 'Kevin', 'Anthony',
  'Marcus', 'Tyler', 'Brandon', 'Jordan', 'Alex',
  'Ryan', 'Jason', 'David', 'Daniel', 'Matthew',
  'Andrew', 'Joshua', 'Justin', 'Eric', 'Brian',
];

const LAST_NAMES = [
  'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia',
  'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez',
  'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
  'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee',
];

/**
 * Generate an opponent team for a specific week and difficulty
 */
export function generateOpponent(
  week: number,
  difficulty: 'easy' | 'normal' | 'hard',
  seed?: number
): Opponent {
  const rng = createRNG(seed || Date.now() + week);
  
  // Calculate tier based on week (1-11 regular season, 12-14 playoffs)
  const tier = calculateTier(week, difficulty);
  
  // Generate team name and color
  const teamName = selectRandom(TEAM_NAMES, rng);
  const teamColor = selectRandom(TEAM_COLORS, rng);
  
  // Generate roster (5 players)
  const roster: OpponentPlayer[] = [];
  const positions: Array<'PG' | 'SG' | 'SF' | 'PF' | 'C'> = ['PG', 'SG', 'SF', 'PF', 'C'];
  
  for (const position of positions) {
    roster.push(generateOpponentPlayer(position, tier, rng));
  }
  
  // Select tactics based on tier
  const tactics = selectTactics(tier, rng);
  
  return {
    id: `opponent-week-${week}-${Date.now()}`,
    team_name: teamName,
    team_color: teamColor,
    tier,
    week_range: [week, week],
    roster,
    tactics,
    created_at: new Date().toISOString(),
  };
}

/**
 * Calculate opponent tier based on week and difficulty
 */
function calculateTier(week: number, difficulty: 'easy' | 'normal' | 'hard'): number {
  let baseTier: number;
  
  if (week <= 11) {
    // Regular season: gradual difficulty increase
    // Week 1: tier 1-2
    // Week 11: tier 4-5
    baseTier = 1 + Math.floor((week - 1) * 0.4);
  } else {
    // Playoffs: high tier opponents
    // Week 12 (Quarterfinals): tier 5
    // Week 13 (Semifinals): tier 6
    // Week 14 (Finals): tier 7
    baseTier = 4 + (week - 11);
  }
  
  // Adjust for difficulty
  const difficultyModifier = {
    easy: -1,
    normal: 0,
    hard: 1,
  }[difficulty];
  
  const tier = baseTier + difficultyModifier;
  
  // Clamp between 1 and 7
  return Math.max(1, Math.min(7, tier));
}

/**
 * Generate a single opponent player
 */
function generateOpponentPlayer(
  position: 'PG' | 'SG' | 'SF' | 'PF' | 'C',
  tier: number,
  rng: () => number
): OpponentPlayer {
  // Base stats increase with tier
  // Use configurable balance values for easy difficulty tuning
  // Tier 1: BASE_MIN_OFFSET+tier to BASE_MAX_OFFSET+tier
  // Tier 4: BASE_MIN_OFFSET+4 to BASE_MAX_OFFSET+4
  // Tier 7: BASE_MIN_OFFSET+7 to BASE_MAX_OFFSET+7
  const { BASE_MIN_OFFSET, BASE_MAX_OFFSET } = GAME_CONSTANTS.BALANCE.OPPONENTS;
  const baseMin = BASE_MIN_OFFSET + tier;
  const baseMax = BASE_MAX_OFFSET + tier;
  
  // Position-specific stat distributions
  const stats = generatePositionStats(position, baseMin, baseMax, rng);
  
  // Generate name
  const firstName = selectRandom(FIRST_NAMES, rng);
  const lastName = selectRandom(LAST_NAMES, rng);
  const name = `${firstName} ${lastName}`;
  
  // Age (18-21)
  const age = 18 + Math.floor(rng() * 4);
  
  // Skills (higher tier = more skills)
  const numSkills = Math.min(3, Math.floor(tier / 2));
  const skills: string[] = [];
  const availableSkills = ['Sharpshooter', 'Lockdown', 'Playmaker', 'Rebounder', 'Clutch'];
  for (let i = 0; i < numSkills; i++) {
    const skill = availableSkills[Math.floor(rng() * availableSkills.length)];
    if (!skills.includes(skill)) {
      skills.push(skill);
    }
  }
  
  return {
    name,
    position,
    age,
    ...stats,
    skills,
  };
}

/**
 * Generate stats based on position archetype
 */
function generatePositionStats(
  position: 'PG' | 'SG' | 'SF' | 'PF' | 'C',
  baseMin: number,
  baseMax: number,
  rng: () => number
): {
  outside_offense: number;
  inside_offense: number;
  passing: number;
  outside_defense: number;
  inside_defense: number;
  athleticism: number;
} {
  const randomStat = (min: number, max: number) => {
    return Math.floor(min + rng() * (max - min + 1));
  };
  
  // Position archetypes with stat priorities
  const archetypes = {
    PG: {
      outside_offense: 1.2,  // Strong
      inside_offense: 0.8,   // Weak
      passing: 1.3,          // Very strong
      outside_defense: 1.0,  // Average
      inside_defense: 0.7,   // Weak
      athleticism: 1.1,      // Above average
    },
    SG: {
      outside_offense: 1.3,  // Very strong
      inside_offense: 0.9,   // Below average
      passing: 0.9,          // Below average
      outside_defense: 1.1,  // Above average
      inside_defense: 0.8,   // Weak
      athleticism: 1.2,      // Strong
    },
    SF: {
      outside_offense: 1.1,  // Above average
      inside_offense: 1.0,   // Average
      passing: 1.0,          // Average
      outside_defense: 1.1,  // Above average
      inside_defense: 1.0,   // Average
      athleticism: 1.2,      // Strong
    },
    PF: {
      outside_offense: 0.8,  // Weak
      inside_offense: 1.2,   // Strong
      passing: 0.8,          // Weak
      outside_defense: 0.9,  // Below average
      inside_defense: 1.3,   // Very strong
      athleticism: 1.1,      // Above average
    },
    C: {
      outside_offense: 0.6,  // Very weak
      inside_offense: 1.3,   // Very strong
      passing: 0.7,          // Weak
      outside_defense: 0.8,  // Weak
      inside_defense: 1.4,   // Extremely strong
      athleticism: 0.9,      // Below average
    },
  };
  
  const archetype = archetypes[position];
  
  return {
    outside_offense: randomStat(
      Math.floor(baseMin * archetype.outside_offense),
      Math.floor(baseMax * archetype.outside_offense)
    ),
    inside_offense: randomStat(
      Math.floor(baseMin * archetype.inside_offense),
      Math.floor(baseMax * archetype.inside_offense)
    ),
    passing: randomStat(
      Math.floor(baseMin * archetype.passing),
      Math.floor(baseMax * archetype.passing)
    ),
    outside_defense: randomStat(
      Math.floor(baseMin * archetype.outside_defense),
      Math.floor(baseMax * archetype.outside_defense)
    ),
    inside_defense: randomStat(
      Math.floor(baseMin * archetype.inside_defense),
      Math.floor(baseMax * archetype.inside_defense)
    ),
    athleticism: randomStat(
      Math.floor(baseMin * archetype.athleticism),
      Math.floor(baseMax * archetype.athleticism)
    ),
  };
}

/**
 * Select tactics for opponent based on tier
 */
function selectTactics(tier: number, rng: () => number): string[] {
  const allTactics = [
    'Fast Break',
    'Zone Defense',
    'Pick and Roll',
    'Post Up',
    'Three Point Focus',
  ];
  
  // Higher tier = more tactics
  const numTactics = Math.min(3, Math.floor(tier / 2));
  const tactics: string[] = [];
  
  for (let i = 0; i < numTactics; i++) {
    const tactic = selectRandom(allTactics, rng);
    if (!tactics.includes(tactic)) {
      tactics.push(tactic);
    }
  }
  
  return tactics;
}

/**
 * Simple seeded RNG
 */
function createRNG(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/**
 * Select random item from array
 */
function selectRandom<T>(array: T[], rng: () => number): T {
  return array[Math.floor(rng() * array.length)];
}

/**
 * Calculate opponent team overall rating (for display)
 */
export function calculateOpponentRating(opponent: Opponent): number {
  if (opponent.roster.length === 0) return 0;
  
  const totalRating = opponent.roster.reduce((sum, player) => {
    const playerRating = (
      player.outside_offense +
      player.inside_offense +
      player.passing +
      player.outside_defense +
      player.inside_defense +
      player.athleticism
    ) / 6;
    return sum + playerRating;
  }, 0);
  
  return Math.round(totalRating / opponent.roster.length);
}

