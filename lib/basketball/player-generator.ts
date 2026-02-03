// Player generation utilities for Basketball Roguelike

import type { Player, OpponentPlayer } from './types';
import {
  GAME_CONSTANTS,
  POSITION_BONUSES,
  FIRST_NAMES,
  LAST_NAMES,
  POSITIONS,
} from './constants';
import { generateId } from './local-storage';
import { generatePlayerCharacteristics } from './chemistry';
import { generateAvatar } from './avatar-generator';

// Generate a random integer between min and max (inclusive)
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Pick a random element from an array
function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Generate a random player name
export function generatePlayerName(): string {
  const firstName = randomChoice(FIRST_NAMES);
  const lastName = randomChoice(LAST_NAMES);
  return `${firstName} ${lastName}`;
}

// Generate base attributes for a player
function generateBaseAttributes(): {
  outside_offense: number;
  inside_offense: number;
  passing: number;
  outside_defense: number;
  inside_defense: number;
  athleticism: number;
} {
  // Use configurable balance values for easy difficulty tuning
  const { BASE_MIN, BASE_MAX } = GAME_CONSTANTS.BALANCE.PLAYER_GENERATION;
  
  return {
    outside_offense: randomInt(BASE_MIN, BASE_MAX),
    inside_offense: randomInt(BASE_MIN, BASE_MAX),
    passing: randomInt(BASE_MIN, BASE_MAX),
    outside_defense: randomInt(BASE_MIN, BASE_MAX),
    inside_defense: randomInt(BASE_MIN, BASE_MAX),
    athleticism: randomInt(BASE_MIN, BASE_MAX),
  };
}

// Apply position bonuses to attributes
function applyPositionBonuses(
  attributes: ReturnType<typeof generateBaseAttributes>,
  position: typeof POSITIONS[number]
): typeof attributes {
  const bonuses = POSITION_BONUSES[position] || {};
  const result = { ...attributes };
  
  for (const [attr, bonus] of Object.entries(bonuses)) {
    if (attr in result && typeof bonus === 'number') {
      result[attr as keyof typeof result] = Math.min(
        GAME_CONSTANTS.MAX_ATTRIBUTE,
        result[attr as keyof typeof result] + bonus
      );
    }
  }
  
  return result;
}

// Calculate overall rating
function calculateOverallRating(attributes: ReturnType<typeof generateBaseAttributes>): number {
  const sum = Object.values(attributes).reduce((a, b) => a + b, 0);
  return Math.round(sum / 6);
}


// Generate a single player for the user's team
export function generatePlayer(
  gameId: string,
  position: typeof POSITIONS[number],
  age: number = GAME_CONSTANTS.DRAFT_AGE
): Omit<Player, 'id' | 'created_at'> {
  const baseAttributes = generateBaseAttributes();
  const attributes = applyPositionBonuses(baseAttributes, position);
  const overall_rating = calculateOverallRating(attributes);
  
  // Generate player name and avatar with truly random seed
  const name = generatePlayerName();
  // Use a unique random seed for each player to ensure variety
  const uniqueSeed = `${Date.now()}-${Math.random()}-${name}-${position}`;
  const avatar_components = generateAvatar(uniqueSeed, age);
  
  return {
    game_save_id: gameId,
    name,
    position,
    age,
    ...attributes,
    overall_rating,
    fatigue: 0,
    characteristics: generatePlayerCharacteristics(),
    avatar_components,
    skills: [],
    games_played: 0,
    total_points: 0,
    total_assists: 0,
    total_rebounds: 0,
  };
}

// Generate a starting roster (5 players, one per position)
export function generateStartingRoster(gameId: string): Omit<Player, 'id' | 'created_at'>[] {
  return POSITIONS.map(position => generatePlayer(gameId, position));
}

// Generate an opponent player with tier-based attributes
// NOTE: This function is not used - opponent-generator.ts has its own implementation
export function generateOpponentPlayer(
  position: typeof POSITIONS[number],
  tier: number
): OpponentPlayer {
  // Use BALANCE.OPPONENTS for consistency
  const { BASE_MIN_OFFSET, BASE_MAX_OFFSET } = GAME_CONSTANTS.BALANCE.OPPONENTS;
  const minAttr = BASE_MIN_OFFSET + tier;
  const maxAttr = BASE_MAX_OFFSET + tier;
  
  const baseAttributes = {
    outside_offense: randomInt(minAttr, maxAttr),
    inside_offense: randomInt(minAttr, maxAttr),
    passing: randomInt(minAttr, maxAttr),
    outside_defense: randomInt(minAttr, maxAttr),
    inside_defense: randomInt(minAttr, maxAttr),
    athleticism: randomInt(minAttr, maxAttr),
  };
  
  const attributes = applyPositionBonuses(baseAttributes, position);
  
  return {
    name: generatePlayerName(),
    position,
    age: randomInt(18, 21),
    ...attributes,
    skills: [],
  };
}

// Generate a complete opponent roster
export function generateOpponentRoster(tier: number): OpponentPlayer[] {
  return POSITIONS.map(position => generateOpponentPlayer(position, tier));
}

// Generate draft prospects for a season
export function generateDraftProspects(
  gameId: string,
  count: number = 10
): Array<Omit<Player, 'id' | 'created_at' | 'game_save_id' | 'games_played' | 'total_points' | 'total_assists' | 'total_rebounds'>> {
  const prospects: Array<Omit<Player, 'id' | 'created_at' | 'game_save_id' | 'games_played' | 'total_points' | 'total_assists' | 'total_rebounds'>> = [];
  
  for (let i = 0; i < count; i++) {
    const position = randomChoice([...POSITIONS] as Array<typeof POSITIONS[number]>);
    const baseAttributes = generateBaseAttributes();
    const attributes = applyPositionBonuses(baseAttributes, position);
    const overall_rating = calculateOverallRating(attributes);
    
    // Draft prospects have slightly varied attributes
    const variance = randomInt(-2, 2);
    const adjustedAttributes = {
      outside_offense: Math.max(GAME_CONSTANTS.MIN_ATTRIBUTE, Math.min(GAME_CONSTANTS.MAX_ATTRIBUTE, attributes.outside_offense + variance)),
      inside_offense: Math.max(GAME_CONSTANTS.MIN_ATTRIBUTE, Math.min(GAME_CONSTANTS.MAX_ATTRIBUTE, attributes.inside_offense + variance)),
      passing: Math.max(GAME_CONSTANTS.MIN_ATTRIBUTE, Math.min(GAME_CONSTANTS.MAX_ATTRIBUTE, attributes.passing + variance)),
      outside_defense: Math.max(GAME_CONSTANTS.MIN_ATTRIBUTE, Math.min(GAME_CONSTANTS.MAX_ATTRIBUTE, attributes.outside_defense + variance)),
      inside_defense: Math.max(GAME_CONSTANTS.MIN_ATTRIBUTE, Math.min(GAME_CONSTANTS.MAX_ATTRIBUTE, attributes.inside_defense + variance)),
      athleticism: Math.max(GAME_CONSTANTS.MIN_ATTRIBUTE, Math.min(GAME_CONSTANTS.MAX_ATTRIBUTE, attributes.athleticism + variance)),
    };
    
    prospects.push({
      name: generatePlayerName(),
      position,
      age: GAME_CONSTANTS.DRAFT_AGE,
      ...adjustedAttributes,
      overall_rating: calculateOverallRating(adjustedAttributes),
      fatigue: 0,
      characteristics: generatePlayerCharacteristics(),
      avatar_components: {},
      skills: [],
    });
  }
  
  return prospects;
}

// Age a player (increase age, potentially decrease attributes)
export function agePlayer(player: Player): Partial<Player> {
  const newAge = player.age + 1;
  
  // If player reaches retirement age, they're done
  if (newAge > GAME_CONSTANTS.RETIREMENT_AGE) {
    return { age: newAge };
  }
  
  // Players at age 20-21 might see slight attribute decline
  if (newAge >= 20) {
    const declineChance = 0.3; // 30% chance per attribute
    const updates: Partial<Player> = { age: newAge };
    
    const attributes = [
      'outside_offense',
      'inside_offense',
      'passing',
      'outside_defense',
      'inside_defense',
      'athleticism',
    ] as const;
    
    attributes.forEach(attr => {
      if (Math.random() < declineChance) {
        const currentValue = player[attr];
        updates[attr] = Math.max(GAME_CONSTANTS.MIN_ATTRIBUTE, currentValue - 1);
      }
    });
    
    return updates;
  }
  
  return { age: newAge };
}

// Train a player (increase specific attribute)
export function trainPlayer(
  player: Player,
  attribute: keyof Pick<Player, 'outside_offense' | 'inside_offense' | 'passing' | 'outside_defense' | 'inside_defense' | 'athleticism'>,
  bonus: number = GAME_CONSTANTS.FOCUSED_TRAINING_BONUS
): Partial<Player> {
  const currentValue = player[attribute];
  const newValue = Math.min(GAME_CONSTANTS.MAX_ATTRIBUTE, currentValue + bonus);
  
  return {
    [attribute]: newValue,
  };
}

// Rest a player (reduce fatigue)
export function restPlayer(player: Player, amount: number = GAME_CONSTANTS.FATIGUE_RECOVERY_PER_WEEK): Partial<Player> {
  return {
    fatigue: Math.max(0, player.fatigue - amount),
  };
}

// Add fatigue to a player after a game
export function addFatigue(player: Player, amount: number = GAME_CONSTANTS.FATIGUE_PER_GAME): Partial<Player> {
  return {
    fatigue: Math.min(GAME_CONSTANTS.MAX_FATIGUE, player.fatigue + amount),
  };
}

// Check if a player should retire
export function shouldRetire(player: Player): boolean {
  return player.age > GAME_CONSTANTS.RETIREMENT_AGE;
}

// Get players that need to be replaced (retired)
export function getRetiringPlayers(players: Player[]): Player[] {
  return players.filter(shouldRetire);
}

