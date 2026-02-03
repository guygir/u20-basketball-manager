// Player marketplace system for Basketball Roguelike

import { Player } from './types';
import { generatePlayer } from './player-generator';
import { generateId } from './local-storage';
import { GAME_CONSTANTS } from './constants';
import type { AvatarComponents } from './avatar-generator';
import { generatePlayerCharacteristics, type Characteristic } from './chemistry';

/**
 * Market Player - available for purchase
 */
export interface MarketPlayer {
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
  price: number;
  quality: 'Budget' | 'Standard' | 'Premium' | 'Elite';
  avatar_components: AvatarComponents;
}

/**
 * Generate market players for purchase
 * Returns 3-5 players with varying quality and prices
 */
export function generateMarketPlayers(
  count: number = 5,
  unlockedSkills: string[] = []
): MarketPlayer[] {
  const marketPlayers: MarketPlayer[] = [];
  const positions: Array<'PG' | 'SG' | 'SF' | 'PF' | 'C'> = ['PG', 'SG', 'SF', 'PF', 'C'];
  
  for (let i = 0; i < count; i++) {
    const position = positions[i % positions.length];
    const marketPlayer = generateMarketPlayer(position, unlockedSkills);
    marketPlayers.push(marketPlayer);
  }
  
  return marketPlayers;
}

/**
 * Generate a single market player
 */
function generateMarketPlayer(
  position: 'PG' | 'SG' | 'SF' | 'PF' | 'C',
  unlockedSkills: string[] = []
): MarketPlayer {
  // Determine quality tier (affects stats and price)
  // Use configurable balance values for easy difficulty tuning
  const marketConfig = GAME_CONSTANTS.BALANCE.MARKETPLACE;
  
  const qualityRoll = Math.random();
  let quality: 'Budget' | 'Standard' | 'Premium' | 'Elite';
  let statBonus: number;
  let basePrice: number;
  
  if (qualityRoll < 0.10) {
    // 10% Elite
    quality = 'Elite';
    statBonus = marketConfig.ELITE_BONUS;
    basePrice = marketConfig.ELITE_PRICE;
  } else if (qualityRoll < 0.30) {
    // 20% Premium
    quality = 'Premium';
    statBonus = marketConfig.PREMIUM_BONUS;
    basePrice = marketConfig.PREMIUM_PRICE;
  } else if (qualityRoll < 0.60) {
    // 30% Standard
    quality = 'Standard';
    statBonus = marketConfig.STANDARD_BONUS;
    basePrice = marketConfig.STANDARD_PRICE;
  } else {
    // 40% Budget
    quality = 'Budget';
    statBonus = marketConfig.BUDGET_BONUS;
    basePrice = marketConfig.BUDGET_PRICE;
  }
  
  // Generate age (18-20)
  const age = 18 + Math.floor(Math.random() * 3);
  
  // Age affects price (younger = more expensive) - use configurable multipliers
  const agePriceMultiplier =
    age === 18 ? marketConfig.AGE_18_MULTIPLIER :
    age === 19 ? marketConfig.AGE_19_MULTIPLIER :
    marketConfig.AGE_20_MULTIPLIER;
  const finalPrice = Math.round(basePrice * agePriceMultiplier);
  
  // Generate base player
  const basePlayer = generatePlayer('market-temp', position, age);
  
  // Apply quality bonus to stats
  const marketPlayer: MarketPlayer = {
    id: generateId(),
    name: basePlayer.name,
    position: basePlayer.position,
    age: basePlayer.age,
    outside_offense: Math.min(20, basePlayer.outside_offense + statBonus),
    inside_offense: Math.min(20, basePlayer.inside_offense + statBonus),
    passing: Math.min(20, basePlayer.passing + statBonus),
    outside_defense: Math.min(20, basePlayer.outside_defense + statBonus),
    inside_defense: Math.min(20, basePlayer.inside_defense + statBonus),
    athleticism: Math.min(20, basePlayer.athleticism + statBonus),
    overall_rating: 0, // Will calculate below
    characteristics: generatePlayerCharacteristics(),
    skills: [],
    price: finalPrice,
    quality,
    avatar_components: basePlayer.avatar_components as AvatarComponents,
  };
  
  // Calculate overall rating
  marketPlayer.overall_rating = Math.round(
    (marketPlayer.outside_offense +
      marketPlayer.inside_offense +
      marketPlayer.passing +
      marketPlayer.outside_defense +
      marketPlayer.inside_defense +
      marketPlayer.athleticism) / 6
  );
  
  // Apply unlocked skills (20% chance per skill for market players)
  if (unlockedSkills.length > 0) {
    for (const skill of unlockedSkills) {
      if (Math.random() < 0.20) {
        marketPlayer.skills.push(skill);
      }
    }
  }
  
  return marketPlayer;
}

/**
 * Convert market player to roster player
 * @param inheritedPosition - The position to assign (from replaced player)
 */
export function purchaseMarketPlayer(
  marketPlayer: MarketPlayer,
  gameId: string,
  inheritedPosition?: 'PG' | 'SG' | 'SF' | 'PF' | 'C'
): Player {
  const newPlayer: Player = {
    id: generateId(),
    game_save_id: gameId,
    name: marketPlayer.name,
    position: inheritedPosition || marketPlayer.position, // Use inherited position if provided
    age: marketPlayer.age,
    outside_offense: marketPlayer.outside_offense,
    inside_offense: marketPlayer.inside_offense,
    passing: marketPlayer.passing,
    outside_defense: marketPlayer.outside_defense,
    inside_defense: marketPlayer.inside_defense,
    athleticism: marketPlayer.athleticism,
    overall_rating: marketPlayer.overall_rating,
    fatigue: 0, // Fresh player
    characteristics: marketPlayer.characteristics,
    avatar_components: marketPlayer.avatar_components,
    skills: marketPlayer.skills,
    games_played: 0,
    total_points: 0,
    total_assists: 0,
    total_rebounds: 0,
    created_at: new Date().toISOString(),
  };
  
  return newPlayer;
}

/**
 * Calculate sell price for a player
 * Based on overall rating and age
 */
export function calculateSellPrice(player: Player): number {
  // Base price from overall rating (5-10 coins per rating point)
  const basePrice = player.overall_rating * 8;
  
  // Age multiplier (younger = more valuable)
  const ageMultiplier = player.age === 18 ? 1.5 : 
                        player.age === 19 ? 1.2 : 
                        player.age === 20 ? 1.0 : 0.5;
  
  // Skills add value (20 coins per skill)
  const skillBonus = player.skills.length * 20;
  
  const finalPrice = Math.round((basePrice * ageMultiplier) + skillBonus);
  
  // Clamp between 50-200 coins
  return Math.max(50, Math.min(200, finalPrice));
}

/**
 * Validate if player can be sold (must have 5+ players after sale)
 */
export function canSellPlayer(currentRosterSize: number): boolean {
  return currentRosterSize > 5;
}

