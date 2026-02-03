import { Player, GameSave, Opponent } from './types';
import { GAME_CONSTANTS } from './constants';
import { MarketPlayer, purchaseMarketPlayer, calculateSellPrice, canSellPlayer } from './marketplace';
// Action result types
export interface ActionResult {
  success: boolean;
  message: string;
  updatedPlayers?: Player[];
  updatedGameState?: Partial<GameSave>;
  scoutedOpponent?: Opponent;
}

export interface TrainGeneralParams {
  player: Player;
  gameState: GameSave;
}

export interface TrainFocusedParams {
  player: Player;
  attribute: 'outside_offense' | 'inside_offense' | 'passing' | 'outside_defense' | 'inside_defense' | 'athleticism';
  gameState: GameSave;
}

export interface RestTeamParams {
  players: Player[];
  gameState: GameSave;
}

export interface PublicRelationsParams {
  gameState: GameSave;
}

export interface ScoutOpponentParams {
  opponent: Opponent;
  gameState: GameSave;
}

/**
 * Train Player (General)
 * - Increases random attributes by +1 each (age-scaled)
 * - Age 18: 3 attributes, Age 19: 2 attributes, Age 20: 1 attribute, Age 21: Cannot train
 * - Adds +5 fatigue to the player
 * - Costs 50 coins
 */
export function trainPlayerGeneral({ player, gameState }: TrainGeneralParams): ActionResult {
  const cost = GAME_CONSTANTS.ACTIONS.TRAIN_GENERAL.COST;
  
  // Check if player can train based on age
  if (player.age >= 21) {
    return {
      success: false,
      message: `${player.name} is too old to train (age ${player.age}). Players cannot improve after age 20.`,
    };
  }
  
  // Check if player has enough coins
  if (gameState.coins < cost) {
    return {
      success: false,
      message: `Not enough coins. Need ${cost}, have ${gameState.coins}`,
    };
  }
  
  // Check if player fatigue is too high
  if (player.fatigue >= 90) {
    return {
      success: false,
      message: `${player.name} is too fatigued to train (${player.fatigue}/100). Rest first.`,
    };
  }
  
  // Determine number of attributes to improve based on age
  // Uses configurable BALANCE.TRAINING values
  const trainingConfig = GAME_CONSTANTS.BALANCE.TRAINING;
  let numAttributes: number;
  
  if (player.age === 18) {
    numAttributes = trainingConfig.AGE_18.GENERAL_ATTRIBUTES;
  } else if (player.age === 19) {
    numAttributes = trainingConfig.AGE_19.GENERAL_ATTRIBUTES;
  } else if (player.age === 20) {
    numAttributes = trainingConfig.AGE_20.GENERAL_ATTRIBUTES;
  } else {
    numAttributes = trainingConfig.AGE_21.GENERAL_ATTRIBUTES;
  }
  
  // Select random attributes to improve
  const attributes: Array<keyof Pick<Player, 'outside_offense' | 'inside_offense' | 'passing' | 'outside_defense' | 'inside_defense' | 'athleticism'>> = [
    'outside_offense',
    'inside_offense',
    'passing',
    'outside_defense',
    'inside_defense',
    'athleticism',
  ];
  
  // Shuffle and pick attributes based on age
  const shuffled = [...attributes].sort(() => Math.random() - 0.5);
  const selectedAttributes = shuffled.slice(0, numAttributes);
  
  // Create updated player
  const updatedPlayer = { ...player };
  const improvements: string[] = [];
  
  // Initialize weekly_improvements if not exists
  if (!updatedPlayer.weekly_improvements) {
    updatedPlayer.weekly_improvements = {};
  }
  
  for (const attr of selectedAttributes) {
    const currentValue = updatedPlayer[attr];
    if (currentValue < 20) {
      const improvement = Math.min(1, 20 - currentValue);
      updatedPlayer[attr] = currentValue + improvement;
      
      // Track weekly improvement
      updatedPlayer.weekly_improvements[attr] = (updatedPlayer.weekly_improvements[attr] || 0) + improvement;
      
      improvements.push(`${attr.replace(/_/g, ' ')}: ${currentValue} → ${updatedPlayer[attr]}`);
    }
  }
  
  // Add fatigue
  const fatigueIncrease = GAME_CONSTANTS.ACTIONS.TRAIN_GENERAL.FATIGUE_COST;
  updatedPlayer.fatigue = Math.min(100, updatedPlayer.fatigue + fatigueIncrease);
  updatedPlayer.weekly_improvements.fatigue = (updatedPlayer.weekly_improvements.fatigue || 0) + fatigueIncrease;
  
  // Update game state
  const updatedGameState: Partial<GameSave> = {
    coins: gameState.coins - cost,
    actions_remaining: gameState.actions_remaining - 1,
  };
  
  return {
    success: true,
    message: `${player.name} trained! Improved: ${improvements.join(', ')}. Fatigue: ${player.fatigue} → ${updatedPlayer.fatigue}`,
    updatedPlayers: [updatedPlayer],
    updatedGameState,
  };
}

/**
 * Train Player (Focused)
 * - Increases chosen attribute (age-scaled)
 * - Age 18: +3, Age 19: +2, Age 20: +1, Age 21: Cannot train
 * - Adds +10 fatigue to the player
 * - Costs 100 coins
 */
export function trainPlayerFocused({ player, attribute, gameState }: TrainFocusedParams): ActionResult {
  const cost = GAME_CONSTANTS.ACTIONS.TRAIN_FOCUSED.COST;
  
  // Check if player can train based on age
  if (player.age >= 21) {
    return {
      success: false,
      message: `${player.name} is too old to train (age ${player.age}). Players cannot improve after age 20.`,
    };
  }
  
  // Check if player has enough coins
  if (gameState.coins < cost) {
    return {
      success: false,
      message: `Not enough coins. Need ${cost}, have ${gameState.coins}`,
    };
  }
  
  // Check if player fatigue is too high
  if (player.fatigue >= 85) {
    return {
      success: false,
      message: `${player.name} is too fatigued to train (${player.fatigue}/100). Rest first.`,
    };
  }
  
  // Check if attribute is already maxed
  const currentValue = player[attribute];
  if (currentValue >= 20) {
    return {
      success: false,
      message: `${player.name}'s ${attribute.replace(/_/g, ' ')} is already maxed at 20`,
    };
  }
  
  // Determine improvement amount based on age
  // Uses configurable BALANCE.TRAINING values
  const trainingConfig = GAME_CONSTANTS.BALANCE.TRAINING;
  let improvementAmount: number;
  
  if (player.age === 18) {
    improvementAmount = trainingConfig.AGE_18.FOCUSED_IMPROVEMENT;
  } else if (player.age === 19) {
    improvementAmount = trainingConfig.AGE_19.FOCUSED_IMPROVEMENT;
  } else if (player.age === 20) {
    improvementAmount = trainingConfig.AGE_20.FOCUSED_IMPROVEMENT;
  } else {
    improvementAmount = trainingConfig.AGE_21.FOCUSED_IMPROVEMENT;
  }
  
  // Create updated player
  const updatedPlayer = { ...player };
  
  // Initialize weekly_improvements if not exists
  if (!updatedPlayer.weekly_improvements) {
    updatedPlayer.weekly_improvements = {};
  }
  
  const improvement = Math.min(improvementAmount, 20 - currentValue);
  updatedPlayer[attribute] = currentValue + improvement;
  
  // Track weekly improvement
  updatedPlayer.weekly_improvements[attribute] = (updatedPlayer.weekly_improvements[attribute] || 0) + improvement;
  
  // Add fatigue
  const fatigueIncrease = GAME_CONSTANTS.ACTIONS.TRAIN_FOCUSED.FATIGUE_COST;
  updatedPlayer.fatigue = Math.min(100, updatedPlayer.fatigue + fatigueIncrease);
  updatedPlayer.weekly_improvements.fatigue = (updatedPlayer.weekly_improvements.fatigue || 0) + fatigueIncrease;
  
  // Update game state
  const updatedGameState: Partial<GameSave> = {
    coins: gameState.coins - cost,
    actions_remaining: gameState.actions_remaining - 1,
  };
  
  return {
    success: true,
    message: `${player.name} focused training! ${attribute.replace(/_/g, ' ')}: ${currentValue} → ${updatedPlayer[attribute]}. Fatigue: ${player.fatigue} → ${updatedPlayer.fatigue}`,
    updatedPlayers: [updatedPlayer],
    updatedGameState,
  };
}

/**
 * Rest Team
 * - Reduces fatigue by -20 for ALL players
 * - Free action (no coin cost)
 */
export function restTeam({ players, gameState }: RestTeamParams): ActionResult {
  // Check if any player has fatigue to reduce
  const hasFatigue = players.some(p => p.fatigue > 0);
  if (!hasFatigue) {
    return {
      success: false,
      message: 'Team has no fatigue to reduce',
    };
  }
  
  // Create updated players with reduced fatigue
  const updatedPlayers = players.map(player => {
    const fatigueReduction = GAME_CONSTANTS.ACTIONS.REST.FATIGUE_REDUCTION;
    const newFatigue = Math.max(0, player.fatigue - fatigueReduction);
    
    return {
      ...player,
      fatigue: newFatigue,
      weekly_improvements: {
        ...(player.weekly_improvements || {}),
        fatigue: (player.weekly_improvements?.fatigue || 0) - fatigueReduction,
      },
    };
  });
  
  // Update game state
  const updatedGameState: Partial<GameSave> = {
    actions_remaining: gameState.actions_remaining - 1,
  };
  
  const avgFatigueBefore = Math.round(players.reduce((sum, p) => sum + p.fatigue, 0) / players.length);
  const avgFatigueAfter = Math.round(updatedPlayers.reduce((sum, p) => sum + p.fatigue, 0) / updatedPlayers.length);
  
  return {
    success: true,
    message: `Team rested! Average fatigue: ${avgFatigueBefore} → ${avgFatigueAfter}`,
    updatedPlayers,
    updatedGameState,
  };
}

/**
 * Public Relations
 * - Earn 50 coins through PR activities
 * - Free action (no coin cost)
 */
export function publicRelations({ gameState }: PublicRelationsParams): ActionResult {
  const coinsEarned = GAME_CONSTANTS.ACTIONS.PUBLIC_RELATIONS.COINS_EARNED;
  
  // Update game state
  const updatedGameState: Partial<GameSave> = {
    coins: gameState.coins + coinsEarned,
    actions_remaining: gameState.actions_remaining - 1,
  };
  
  return {
    success: true,
    message: `Public relations successful! Earned ${coinsEarned} coins. Total: ${updatedGameState.coins}`,
    updatedGameState,
  };
}

/**
 * Scout Opponent
 * - Reveals next opponent's roster and stats
 * - Costs 30 coins
 */
export function scoutOpponent({ opponent, gameState }: ScoutOpponentParams): ActionResult {
  const cost = GAME_CONSTANTS.ACTIONS.SCOUT.COST;
  
  // Check if player has enough coins
  if (gameState.coins < cost) {
    return {
      success: false,
      message: `Not enough coins. Need ${cost}, have ${gameState.coins}`,
    };
  }
  
  // Update game state
  const updatedGameState: Partial<GameSave> = {
    coins: gameState.coins - cost,
    actions_remaining: gameState.actions_remaining - 1,
  };
  
  return {
    success: true,
    message: `Scouted ${opponent.team_name}! View their roster and stats.`,
    updatedGameState,
    scoutedOpponent: opponent,
  };
}

/**
 * Calculate overall rating for a player
 */
export function calculateOverallRating(player: Player): number {
  return Math.round(
    (player.outside_offense +
      player.inside_offense +
      player.passing +
      player.outside_defense +
      player.inside_defense +
      player.athleticism) / 6
  );
}

/**
 * Get recommended action based on game state
 */
export function getRecommendedAction(gameState: GameSave, players: Player[]): string {
  const avgFatigue = players.reduce((sum, p) => sum + p.fatigue, 0) / players.length;
  const coins = gameState.coins;
  const week = gameState.week_number;
  
  // High fatigue - recommend rest
  if (avgFatigue > 50) {
    return 'rest';
  }
  
  // Before playoffs - recommend scout
  if (week >= 11 && coins >= 30) {
    return 'scout';
  }
  
  // Low coins - recommend rest or general training
  if (coins < 100) {
    if (coins >= 50) {
      return 'train_general';
    }
    return 'rest';
  }
  
  // Default - focused training
  return 'train_focused';
}


export interface BuyPlayerParams {
  marketPlayer: MarketPlayer;
  playerToReplace: Player;
  allPlayers: Player[];
  gameState: GameSave;
}

export interface SellPlayerParams {
  player: Player;
  allPlayers: Player[];
  gameState: GameSave;
}

/**
 * Buy Player from Market
 * - Purchase a market player to replace a roster player
 * - Costs 200-500 coins depending on player quality
 * - New player starts with 0 fatigue
 */
export function buyPlayer({ marketPlayer, playerToReplace, allPlayers, gameState }: BuyPlayerParams): ActionResult {
  const cost = marketPlayer.price;
  
  // Check if player has enough coins
  if (gameState.coins < cost) {
    return {
      success: false,
      message: `Not enough coins. Need ${cost}, have ${gameState.coins}`,
    };
  }
  
  // Convert market player to roster player, inheriting the replaced player's position
  const newPlayer = purchaseMarketPlayer(marketPlayer, gameState.id, playerToReplace.position);
  
  // Replace the selected player
  const updatedPlayers = allPlayers.map(p =>
    p.id === playerToReplace.id ? newPlayer : p
  );
  
  return {
    success: true,
    message: `Purchased ${newPlayer.name} for ${cost} coins. Now playing ${newPlayer.position} (natural position: ${marketPlayer.position}). Replaced ${playerToReplace.name}.`,
    updatedPlayers,
    updatedGameState: {
      coins: gameState.coins - cost,
    },
  };
}

/**
 * Sell Player
 * - Sell a roster player for coins
 * - Receive 50-200 coins based on player rating and age
 * - Cannot sell if it would leave roster below 5 players
 */
export function sellPlayer({ player, allPlayers, gameState }: SellPlayerParams): ActionResult {
  // Check if can sell (must have more than 5 players)
  if (!canSellPlayer(allPlayers.length)) {
    return {
      success: false,
      message: `Cannot sell player. Must maintain at least 5 players on roster.`,
    };
  }
  
  // Calculate sell price
  const sellPrice = calculateSellPrice(player);
  
  // Remove player from roster
  const updatedPlayers = allPlayers.filter(p => p.id !== player.id);
  
  return {
    success: true,
    message: `Sold ${player.name} (${player.position}) for ${sellPrice} coins.`,
    updatedPlayers,
    updatedGameState: {
      coins: gameState.coins + sellPrice,
    },
  };
}

