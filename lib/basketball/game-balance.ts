// Game Balance and Tuning
// Fine-tuned constants and formulas for optimal gameplay experience

/**
 * Difficulty scaling configuration
 */
export const DIFFICULTY_SETTINGS = {
  easy: {
    name: 'Easy',
    description: 'Relaxed gameplay, forgiving opponents',
    opponentTierModifier: -1,
    coinMultiplier: 1.2,
    trainingEffectiveness: 1.3,
    fatigueRate: 0.7,
    marketPriceMultiplier: 0.8,
  },
  normal: {
    name: 'Normal',
    description: 'Balanced challenge, standard progression',
    opponentTierModifier: 0,
    coinMultiplier: 1.0,
    trainingEffectiveness: 1.0,
    fatigueRate: 1.0,
    marketPriceMultiplier: 1.0,
  },
  hard: {
    name: 'Hard',
    description: 'Tough opponents, slower progression',
    opponentTierModifier: 1,
    coinMultiplier: 0.8,
    trainingEffectiveness: 0.7,
    fatigueRate: 1.3,
    marketPriceMultiplier: 1.2,
  },
};

/**
 * Reward scaling based on week and performance
 */
export function calculateGameReward(
  won: boolean,
  week: number,
  difficulty: 'easy' | 'normal' | 'hard',
  winStreak: number = 0
): number {
  const settings = DIFFICULTY_SETTINGS[difficulty];
  
  // Base reward
  let baseReward = won ? 100 : 25;
  
  // Week multiplier (playoffs give more)
  const weekMultiplier = week > 11 ? 1.5 : 1.0;
  
  // Win streak bonus (up to 5 games)
  const streakBonus = Math.min(winStreak, 5) * 10;
  
  // Calculate final reward
  const reward = Math.round(
    (baseReward * weekMultiplier + streakBonus) * settings.coinMultiplier
  );
  
  return reward;
}

/**
 * Calculate training effectiveness based on difficulty and fatigue
 */
export function calculateTrainingEffectiveness(
  baseFatigue: number,
  difficulty: 'easy' | 'normal' | 'hard'
): number {
  const settings = DIFFICULTY_SETTINGS[difficulty];
  
  // Fatigue penalty (0-100 fatigue)
  // 0 fatigue = 100% effectiveness
  // 50 fatigue = 75% effectiveness
  // 100 fatigue = 50% effectiveness
  const fatiguePenalty = 1.0 - (baseFatigue / 200);
  
  return settings.trainingEffectiveness * fatiguePenalty;
}

/**
 * Calculate fatigue accumulation rate
 */
export function calculateFatigueGain(
  actionType: 'train' | 'game',
  difficulty: 'easy' | 'normal' | 'hard'
): number {
  const settings = DIFFICULTY_SETTINGS[difficulty];
  
  const baseFatigue = actionType === 'train' ? 10 : 15;
  return Math.round(baseFatigue * settings.fatigueRate);
}

/**
 * Calculate market prices based on difficulty
 */
export function calculateMarketPrice(
  basePrice: number,
  difficulty: 'easy' | 'normal' | 'hard'
): number {
  const settings = DIFFICULTY_SETTINGS[difficulty];
  return Math.round(basePrice * settings.marketPriceMultiplier);
}

/**
 * Progression milestones and rewards
 */
export const PROGRESSION_MILESTONES = {
  firstWin: {
    coins: 50,
    message: '🎉 First Victory! Keep it up!',
  },
  fiveWins: {
    coins: 100,
    message: '🔥 5 Wins! You\'re on fire!',
  },
  tenWins: {
    coins: 200,
    message: '⭐ 10 Wins! Championship material!',
  },
  winStreak3: {
    coins: 75,
    message: '🎯 3-Game Win Streak!',
  },
  winStreak5: {
    coins: 150,
    message: '💪 5-Game Win Streak! Unstoppable!',
  },
  makePlayoffs: {
    coins: 300,
    message: '🏆 Made the Playoffs!',
  },
  winChampionship: {
    coins: 500,
    message: '👑 CHAMPIONSHIP! You\'re the best!',
  },
  perfectSeason: {
    coins: 1000,
    message: '🌟 PERFECT SEASON! Legendary!',
  },
};

/**
 * Check if player has reached a milestone
 */
export function checkMilestone(
  wins: number,
  losses: number,
  week: number,
  winStreak: number
): { reached: boolean; milestone?: keyof typeof PROGRESSION_MILESTONES; reward?: number; message?: string } {
  // First win
  if (wins === 1 && losses === 0) {
    return {
      reached: true,
      milestone: 'firstWin',
      reward: PROGRESSION_MILESTONES.firstWin.coins,
      message: PROGRESSION_MILESTONES.firstWin.message,
    };
  }
  
  // 5 wins
  if (wins === 5) {
    return {
      reached: true,
      milestone: 'fiveWins',
      reward: PROGRESSION_MILESTONES.fiveWins.coins,
      message: PROGRESSION_MILESTONES.fiveWins.message,
    };
  }
  
  // 10 wins
  if (wins === 10) {
    return {
      reached: true,
      milestone: 'tenWins',
      reward: PROGRESSION_MILESTONES.tenWins.coins,
      message: PROGRESSION_MILESTONES.tenWins.message,
    };
  }
  
  // Win streaks
  if (winStreak === 3) {
    return {
      reached: true,
      milestone: 'winStreak3',
      reward: PROGRESSION_MILESTONES.winStreak3.coins,
      message: PROGRESSION_MILESTONES.winStreak3.message,
    };
  }
  
  if (winStreak === 5) {
    return {
      reached: true,
      milestone: 'winStreak5',
      reward: PROGRESSION_MILESTONES.winStreak5.coins,
      message: PROGRESSION_MILESTONES.winStreak5.message,
    };
  }
  
  // Made playoffs (week 12)
  if (week === 12 && wins >= 6) {
    return {
      reached: true,
      milestone: 'makePlayoffs',
      reward: PROGRESSION_MILESTONES.makePlayoffs.coins,
      message: PROGRESSION_MILESTONES.makePlayoffs.message,
    };
  }
  
  return { reached: false };
}

/**
 * Calculate optimal starting stats for new players
 */
export function getStartingPlayerStats(difficulty: 'easy' | 'normal' | 'hard'): {
  min: number;
  max: number;
} {
  switch (difficulty) {
    case 'easy':
      return { min: 8, max: 14 }; // Slightly better starting players
    case 'normal':
      return { min: 6, max: 14 }; // Standard range
    case 'hard':
      return { min: 5, max: 12 }; // Weaker starting players
  }
}

/**
 * Calculate stat improvement from training
 */
export function calculateStatImprovement(
  currentStat: number,
  playerAge: number,
  difficulty: 'easy' | 'normal' | 'hard'
): number {
  // Younger players improve faster
  const ageFactor = playerAge === 18 ? 1.2 : playerAge === 19 ? 1.0 : 0.8;
  
  // Diminishing returns for high stats
  const statFactor = currentStat < 10 ? 1.2 : currentStat < 15 ? 1.0 : 0.7;
  
  // Difficulty modifier
  const difficultyFactor = DIFFICULTY_SETTINGS[difficulty].trainingEffectiveness;
  
  // Base improvement is 1, modified by factors
  const improvement = 1 * ageFactor * statFactor * difficultyFactor;
  
  // Round and ensure at least 1 improvement
  return Math.max(1, Math.round(improvement));
}

/**
 * Economy balance - coin sources and sinks
 */
export const ECONOMY_BALANCE = {
  // Income sources (per season)
  expectedWinReward: 100 * 11, // ~1100 coins from wins
  expectedLossReward: 25 * 3, // ~75 coins from losses
  milestoneRewards: 500, // ~500 from milestones
  totalIncome: 1675, // Expected total per season
  
  // Expenses (per season)
  trainingCosts: 50 * 15, // ~750 for training
  facilityCosts: 300, // ~300 for one facility upgrade
  tacticsCosts: 200, // ~200 for one tactic
  marketCosts: 300, // ~300 for player transactions
  totalExpenses: 1550, // Expected total per season
  
  // Net surplus: ~125 coins per season (allows for mistakes)
};

/**
 * Validate game balance
 */
export function validateBalance(): {
  balanced: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  // Check income vs expenses
  const surplus = ECONOMY_BALANCE.totalIncome - ECONOMY_BALANCE.totalExpenses;
  if (surplus < 0) {
    issues.push('Negative coin surplus - players will run out of money');
  }
  if (surplus > 500) {
    issues.push('Too much coin surplus - game may be too easy');
  }
  
  // Check difficulty scaling
  const easyMultiplier = DIFFICULTY_SETTINGS.easy.coinMultiplier;
  const hardMultiplier = DIFFICULTY_SETTINGS.hard.coinMultiplier;
  if (easyMultiplier / hardMultiplier > 2) {
    issues.push('Difficulty coin multipliers too extreme');
  }
  
  return {
    balanced: issues.length === 0,
    issues,
  };
}

