import { Player, GameSave } from './types';
import { GAME_CONSTANTS } from './constants';
import { generatePlayer } from './player-generator';
import { generateId } from './local-storage';
import type { AvatarComponents } from './avatar-generator';
import { generatePlayerCharacteristics, type Characteristic } from './chemistry';

/**
 * Draft Prospect - potential player for draft
 */
export interface DraftProspect {
  id: string;
  name: string;
  position: 'PG' | 'SG' | 'SF' | 'PF' | 'C';
  age: number;
  outside_offense: number;
  inside_offense: number;
  passing: number;
  outside_defense: number;
  inside_defense: number;
  athleticism: number;
  overall_rating: number;
  characteristics: Characteristic[];
  skills: string[];
  potential: 'Low' | 'Medium' | 'High' | 'Elite';
  avatar_components: AvatarComponents;
}

/**
 * Season End Result
 */
export interface SeasonEndResult {
  seasonComplete: boolean;
  retiringPlayers: Player[];
  seasonRewards: {
    coins: number;
    reason: string;
  }[];
  totalCoinsEarned: number;
  draftProspects: DraftProspect[];
  newSeasonNumber: number;
}

/**
 * Age all players by 1 year
 * Returns list of players who will retire (age 21)
 */
export function agePlayers(players: Player[]): { 
  agedPlayers: Player[]; 
  retiringPlayers: Player[];
} {
  const agedPlayers: Player[] = [];
  const retiringPlayers: Player[] = [];

  for (const player of players) {
    const newAge = player.age + 1;
    const agedPlayer = { ...player, age: newAge };
    
    agedPlayers.push(agedPlayer);
    
    if (newAge >= GAME_CONSTANTS.RETIREMENT_AGE) {
      retiringPlayers.push(agedPlayer);
    }
  }

  return { agedPlayers, retiringPlayers };
}

/**
 * Calculate season rewards based on performance
 */
export function calculateSeasonRewards(gameState: GameSave): {
  coins: number;
  reason: string;
}[] {
  const rewards: { coins: number; reason: string }[] = [];
  
  // Base season completion reward
  rewards.push({
    coins: GAME_CONSTANTS.SEASON_COMPLETION_REWARD,
    reason: 'Season Completion Bonus',
  });
  
  // Playoff qualification (8+ wins)
  if (gameState.wins >= 8) {
    rewards.push({
      coins: GAME_CONSTANTS.PLAYOFF_QUALIFICATION_REWARD,
      reason: 'Playoff Qualification',
    });
  }
  
  // Playoff round rewards
  if (gameState.playoff_round) {
    if (gameState.playoff_round >= 1) {
      rewards.push({
        coins: GAME_CONSTANTS.SEMIFINALS_REWARD,
        reason: 'Reached Semifinals',
      });
    }
    if (gameState.playoff_round >= 2) {
      rewards.push({
        coins: GAME_CONSTANTS.FINALS_REWARD,
        reason: 'Reached Finals',
      });
    }
    if (gameState.playoff_round >= 3) {
      rewards.push({
        coins: GAME_CONSTANTS.CHAMPIONSHIP_REWARD,
        reason: 'Championship Victory!',
      });
    }
  }
  
  return rewards;
}

/**
 * Generate draft prospects for season end
 * Always generates 5 prospects (one per position)
 */
export function generateDraftProspects(
  unlockedSkills: string[] = []
): DraftProspect[] {
  const prospects: DraftProspect[] = [];
  
  // Always generate one prospect per position
  const positions: Array<'PG' | 'SG' | 'SF' | 'PF' | 'C'> = ['PG', 'SG', 'SF', 'PF', 'C'];
  
  for (const position of positions) {
    const prospect = generateDraftProspect(position, unlockedSkills);
    prospects.push(prospect);
  }
  
  return prospects;
}

/**
 * Generate a single draft prospect
 */
function generateDraftProspect(
  position: 'PG' | 'SG' | 'SF' | 'PF' | 'C',
  unlockedSkills: string[] = []
): DraftProspect {
  // Generate base player at age 18 (use temporary ID for draft prospect)
  const basePlayer = generatePlayer('draft-temp', position, GAME_CONSTANTS.DRAFT_AGE);
  
  // Determine potential (affects stat ranges)
  // Use configurable balance values for easy difficulty tuning
  const { ELITE_BONUS, HIGH_BONUS, MEDIUM_BONUS, LOW_BONUS } = GAME_CONSTANTS.BALANCE.DRAFT_PROSPECTS;
  
  const potentialRoll = Math.random();
  let potential: 'Low' | 'Medium' | 'High' | 'Elite';
  let statBonus = 0;
  
  if (potentialRoll < 0.05) {
    potential = 'Elite';
    statBonus = ELITE_BONUS;
  } else if (potentialRoll < 0.20) {
    potential = 'High';
    statBonus = HIGH_BONUS;
  } else if (potentialRoll < 0.50) {
    potential = 'Medium';
    statBonus = MEDIUM_BONUS;
  } else {
    potential = 'Low';
    statBonus = LOW_BONUS;
  }
  
  // Apply potential bonus to stats
  const prospect: DraftProspect = {
    id: generateId(),
    name: basePlayer.name,
    position: basePlayer.position,
    age: GAME_CONSTANTS.DRAFT_AGE,
    outside_offense: Math.min(20, basePlayer.outside_offense + statBonus),
    inside_offense: Math.min(20, basePlayer.inside_offense + statBonus),
    passing: Math.min(20, basePlayer.passing + statBonus),
    outside_defense: Math.min(20, basePlayer.outside_defense + statBonus),
    inside_defense: Math.min(20, basePlayer.inside_defense + statBonus),
    athleticism: Math.min(20, basePlayer.athleticism + statBonus),
    overall_rating: 0, // Will calculate below
    characteristics: generatePlayerCharacteristics(),
    skills: [],
    potential,
    avatar_components: basePlayer.avatar_components as AvatarComponents,
  };
  
  // Calculate overall rating
  prospect.overall_rating = Math.round(
    (prospect.outside_offense +
      prospect.inside_offense +
      prospect.passing +
      prospect.outside_defense +
      prospect.inside_defense +
      prospect.athleticism) / 6
  );
  
  // Apply unlocked skills (30% chance per skill)
  if (unlockedSkills.length > 0) {
    for (const skill of unlockedSkills) {
      if (Math.random() < 0.30) {
        prospect.skills.push(skill);
      }
    }
  }
  
  return prospect;
}

/**
 * Process season end - age players, calculate rewards, generate draft
 */
export function processSeasonEnd(
  gameState: GameSave,
  players: Player[],
  unlockedSkills: string[] = []
): SeasonEndResult {
  // Age all players
  const { agedPlayers, retiringPlayers } = agePlayers(players);
  
  // Calculate rewards
  const seasonRewards = calculateSeasonRewards(gameState);
  const totalCoinsEarned = seasonRewards.reduce((sum, r) => sum + r.coins, 0);
  
  // Generate draft prospects (always 5, one per position)
  const draftProspects = generateDraftProspects(unlockedSkills);
  
  return {
    seasonComplete: true,
    retiringPlayers,
    seasonRewards,
    totalCoinsEarned,
    draftProspects,
    newSeasonNumber: gameState.season_number + 1,
  };
}

/**
 * Select a draft prospect and create new player
 * @param inheritedPosition - The position to assign (from replaced player)
 */
export function selectDraftProspect(
  prospect: DraftProspect,
  gameId: string,
  inheritedPosition?: 'PG' | 'SG' | 'SF' | 'PF' | 'C'
): Player {
  const newPlayer: Player = {
    id: generateId(),
    game_save_id: gameId,
    name: prospect.name,
    position: inheritedPosition || prospect.position, // Use inherited position if provided
    age: prospect.age,
    outside_offense: prospect.outside_offense,
    inside_offense: prospect.inside_offense,
    passing: prospect.passing,
    outside_defense: prospect.outside_defense,
    inside_defense: prospect.inside_defense,
    athleticism: prospect.athleticism,
    overall_rating: prospect.overall_rating,
    fatigue: 0,
    characteristics: prospect.characteristics,
    avatar_components: prospect.avatar_components,
    skills: prospect.skills,
    games_played: 0,
    total_points: 0,
    total_assists: 0,
    total_rebounds: 0,
    created_at: new Date().toISOString(),
  };
  
  return newPlayer;
}

/**
 * Check if season is complete (week 14 finished)
 */
export function isSeasonComplete(weekNumber: number): boolean {
  return weekNumber > GAME_CONSTANTS.TOTAL_WEEKS;
}

/**
 * Check if current week is playoffs
 */
export function isPlayoffWeek(weekNumber: number): boolean {
  return weekNumber >= (GAME_CONSTANTS.REGULAR_SEASON_WEEKS + 1);
}

/**
 * Get playoff round name
 */
export function getPlayoffRoundName(weekNumber: number): string {
  const playoffWeek = weekNumber - GAME_CONSTANTS.REGULAR_SEASON_WEEKS;
  
  switch (playoffWeek) {
    case 1:
      return 'Quarterfinals';
    case 2:
      return 'Semifinals';
    case 3:
      return 'Finals';
    default:
      return 'Playoffs';
  }
}

