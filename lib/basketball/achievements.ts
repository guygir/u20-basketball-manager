// Achievements System
// Track player accomplishments and milestones

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'wins' | 'season' | 'team' | 'progression' | 'special';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  requirement: {
    type: 'wins' | 'streak' | 'season_wins' | 'championships' | 'perfect_season' | 'player_stat' | 'team_rating' | 'coins_earned' | 'facilities' | 'tactics' | 'chemistry';
    value: number;
  };
  reward?: {
    coins?: number;
    unlock?: string;
  };
  hidden?: boolean;
}

export const ACHIEVEMENTS: Record<string, Achievement> = {
  // Win Achievements
  first_blood: {
    id: 'first_blood',
    name: 'First Blood',
    description: 'Win your first game',
    icon: '🎯',
    category: 'wins',
    tier: 'bronze',
    requirement: { type: 'wins', value: 1 },
  },
  
  rookie_coach: {
    id: 'rookie_coach',
    name: 'Rookie Coach',
    description: 'Win 5 games',
    icon: '🏀',
    category: 'wins',
    tier: 'bronze',
    requirement: { type: 'wins', value: 5 },
  },
  
  veteran_coach: {
    id: 'veteran_coach',
    name: 'Veteran Coach',
    description: 'Win 25 games',
    icon: '⭐',
    category: 'wins',
    tier: 'silver',
    requirement: { type: 'wins', value: 25 },
  },
  
  legendary_coach: {
    id: 'legendary_coach',
    name: 'Legendary Coach',
    description: 'Win 100 games',
    icon: '👑',
    category: 'wins',
    tier: 'gold',
    requirement: { type: 'wins', value: 100 },
  },
  
  // Streak Achievements
  hot_streak: {
    id: 'hot_streak',
    name: 'Hot Streak',
    description: 'Win 3 games in a row',
    icon: '🔥',
    category: 'wins',
    tier: 'bronze',
    requirement: { type: 'streak', value: 3 },
  },
  
  unstoppable: {
    id: 'unstoppable',
    name: 'Unstoppable',
    description: 'Win 5 games in a row',
    icon: '💪',
    category: 'wins',
    tier: 'silver',
    requirement: { type: 'streak', value: 5 },
  },
  
  domination: {
    id: 'domination',
    name: 'Domination',
    description: 'Win 10 games in a row',
    icon: '⚡',
    category: 'wins',
    tier: 'gold',
    requirement: { type: 'streak', value: 10 },
  },
  
  // Season Achievements
  playoff_bound: {
    id: 'playoff_bound',
    name: 'Playoff Bound',
    description: 'Make the playoffs (6+ wins)',
    icon: '🎫',
    category: 'season',
    tier: 'bronze',
    requirement: { type: 'season_wins', value: 6 },
  },
  
  championship: {
    id: 'championship',
    name: 'Championship',
    description: 'Win the championship',
    icon: '🏆',
    category: 'season',
    tier: 'gold',
    requirement: { type: 'championships', value: 1 },
  },
  
  dynasty: {
    id: 'dynasty',
    name: 'Dynasty',
    description: 'Win 3 championships',
    icon: '👑',
    category: 'season',
    tier: 'platinum',
    requirement: { type: 'championships', value: 3 },
  },
  
  perfect_season: {
    id: 'perfect_season',
    name: 'Perfect Season',
    description: 'Win all 14 games in a season',
    icon: '🌟',
    category: 'season',
    tier: 'platinum',
    requirement: { type: 'perfect_season', value: 1 },
    hidden: true,
  },
  
  // Team Building Achievements
  superstar: {
    id: 'superstar',
    name: 'Superstar',
    description: 'Have a player with 18+ in all stats',
    icon: '⭐',
    category: 'team',
    tier: 'gold',
    requirement: { type: 'player_stat', value: 18 },
  },
  
  dream_team: {
    id: 'dream_team',
    name: 'Dream Team',
    description: 'Have a team with 80+ average rating',
    icon: '💎',
    category: 'team',
    tier: 'platinum',
    requirement: { type: 'team_rating', value: 80 },
  },
  
  perfect_chemistry: {
    id: 'perfect_chemistry',
    name: 'Perfect Chemistry',
    description: 'Achieve +2.0 team chemistry',
    icon: '🧪',
    category: 'team',
    tier: 'gold',
    requirement: { type: 'chemistry', value: 2.0 },
  },
  
  // Progression Achievements
  big_spender: {
    id: 'big_spender',
    name: 'Big Spender',
    description: 'Earn 10,000 total coins',
    icon: '💰',
    category: 'progression',
    tier: 'silver',
    requirement: { type: 'coins_earned', value: 10000 },
  },
  
  facility_master: {
    id: 'facility_master',
    name: 'Facility Master',
    description: 'Fully upgrade all 4 facilities',
    icon: '🏗️',
    category: 'progression',
    tier: 'gold',
    requirement: { type: 'facilities', value: 12 }, // 4 facilities * 3 levels
  },
  
  tactical_genius: {
    id: 'tactical_genius',
    name: 'Tactical Genius',
    description: 'Own all 10 tactics',
    icon: '📋',
    category: 'progression',
    tier: 'gold',
    requirement: { type: 'tactics', value: 10 },
  },
  
  // Special/Hidden Achievements
  underdog: {
    id: 'underdog',
    name: 'Underdog',
    description: 'Win a championship on Hard difficulty',
    icon: '🐕',
    category: 'special',
    tier: 'platinum',
    requirement: { type: 'championships', value: 1 },
    hidden: true,
  },
  
  speedrunner: {
    id: 'speedrunner',
    name: 'Speedrunner',
    description: 'Win championship in first season',
    icon: '⚡',
    category: 'special',
    tier: 'platinum',
    requirement: { type: 'championships', value: 1 },
    hidden: true,
  },
};

export interface AchievementProgress {
  unlockedAchievements: string[];
  progress: Record<string, number>;
  totalCoinsEarned: number;
  totalWins: number;
  totalChampionships: number;
  bestWinStreak: number;
  lastSeasonWins?: number; // Track wins from last check to calculate delta
}

export function getInitialAchievementProgress(): AchievementProgress {
  return {
    unlockedAchievements: [],
    progress: {},
    totalCoinsEarned: 0,
    totalWins: 0,
    totalChampionships: 0,
    bestWinStreak: 0,
    lastSeasonWins: 0,
  };
}

export function loadAchievementProgress(): AchievementProgress {
  if (typeof window === 'undefined') {
    return getInitialAchievementProgress();
  }
  
  const saved = localStorage.getItem('basketball_achievements');
  if (!saved) {
    return getInitialAchievementProgress();
  }
  
  try {
    return JSON.parse(saved);
  } catch {
    return getInitialAchievementProgress();
  }
}

export function saveAchievementProgress(progress: AchievementProgress): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('basketball_achievements', JSON.stringify(progress));
}

export function checkAchievements(gameState: {
  wins: number;
  winStreak: number;
  coins: number;
  difficulty: string;
  seasonNumber: number;
  weekNumber: number;
  facilities?: any;
  ownedTactics?: string[];
  players?: any[];
}): string[] {
  const progress = loadAchievementProgress();
  const newlyUnlocked: string[] = [];
  
  console.log('[ACHIEVEMENTS] Current progress:', {
    totalWins: progress.totalWins,
    lastSeasonWins: progress.lastSeasonWins,
    currentSeasonWins: gameState.wins,
    unlockedCount: progress.unlockedAchievements.length,
    unlocked: progress.unlockedAchievements
  });
  
  // Update progress tracking
  // For totalWins: if current season wins decreased (new season started), add the delta
  // Otherwise, just update to current value
  if (gameState.wins < (progress.lastSeasonWins || 0)) {
    // New season detected - wins reset to lower value
    // Add previous season's wins to total
    console.log('[ACHIEVEMENTS] New season detected! Adding', progress.lastSeasonWins, 'to totalWins');
    progress.totalWins += (progress.lastSeasonWins || 0);
  }
  progress.lastSeasonWins = gameState.wins;
  
  // Current lifetime wins = accumulated total + current season wins
  const lifetimeWins = progress.totalWins + gameState.wins;
  console.log('[ACHIEVEMENTS] Lifetime wins:', lifetimeWins, '(total:', progress.totalWins, '+ current:', gameState.wins, ')');
  progress.bestWinStreak = Math.max(progress.bestWinStreak, gameState.winStreak);
  
  // Check each achievement
  for (const [id, achievement] of Object.entries(ACHIEVEMENTS)) {
    // Skip if already unlocked
    if (progress.unlockedAchievements.includes(id)) {
      continue;
    }
    
    let unlocked = false;
    
    switch (achievement.requirement.type) {
      case 'wins':
        // Use lifetime total wins, not current season wins
        unlocked = lifetimeWins >= achievement.requirement.value;
        break;
      case 'streak':
        unlocked = gameState.winStreak >= achievement.requirement.value;
        break;
      case 'season_wins':
        // This checks wins in current season only
        unlocked = gameState.wins >= achievement.requirement.value;
        break;
      case 'championships':
        unlocked = progress.totalChampionships >= achievement.requirement.value;
        break;
      case 'coins_earned':
        unlocked = progress.totalCoinsEarned >= achievement.requirement.value;
        break;
      case 'facilities':
        if (gameState.facilities) {
          const totalLevels = Object.values(gameState.facilities).reduce((a: number, b: any) => a + b, 0);
          unlocked = totalLevels >= achievement.requirement.value;
        }
        break;
      case 'tactics':
        unlocked = (gameState.ownedTactics?.length || 0) >= achievement.requirement.value;
        break;
    }
    
    if (unlocked) {
      console.log('[ACHIEVEMENTS] Unlocking:', id, achievement.name);
      progress.unlockedAchievements.push(id);
      newlyUnlocked.push(id);
    }
  }
  
  console.log('[ACHIEVEMENTS] Saving progress with', progress.unlockedAchievements.length, 'unlocked achievements');
  saveAchievementProgress(progress);
  console.log('[ACHIEVEMENTS] Returning', newlyUnlocked.length, 'newly unlocked:', newlyUnlocked);
  return newlyUnlocked;
}

export function getAchievementsByCategory(category: Achievement['category']): Achievement[] {
  return Object.values(ACHIEVEMENTS).filter(a => a.category === category);
}

export function getAchievementStats(): {
  total: number;
  unlocked: number;
  percentage: number;
  byTier: Record<string, { total: number; unlocked: number }>;
} {
  const progress = loadAchievementProgress();
  const total = Object.keys(ACHIEVEMENTS).length;
  const unlocked = progress.unlockedAchievements.length;
  
  const byTier: Record<string, { total: number; unlocked: number }> = {
    bronze: { total: 0, unlocked: 0 },
    silver: { total: 0, unlocked: 0 },
    gold: { total: 0, unlocked: 0 },
    platinum: { total: 0, unlocked: 0 },
  };
  
  for (const achievement of Object.values(ACHIEVEMENTS)) {
    byTier[achievement.tier].total++;
    if (progress.unlockedAchievements.includes(achievement.id)) {
      byTier[achievement.tier].unlocked++;
    }
  }
  
  return {
    total,
    unlocked,
    percentage: Math.round((unlocked / total) * 100),
    byTier,
  };
}

