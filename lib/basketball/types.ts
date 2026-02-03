// Core game types for Basketball Roguelike
// Local MVP version - uses in-memory storage

export interface FacilityUpgrades {
  stadium: number;
  training: number;
  medical: number;
  scouting: number;
}

export interface GameSave {
  id: string;
  user_id: string;
  season_number: number;
  week_number: number;
  is_active: boolean;
  wins: number;
  losses: number;
  win_streak: number;
  playoff_round: number | null;
  coins: number;
  actions_remaining: number;
  team_name: string;
  difficulty: 'easy' | 'normal' | 'hard';
  facilities: FacilityUpgrades;
  owned_tactics: string[];
  active_tactics: string[];
  milestones_achieved: string[];
  last_played_at: string;
  created_at: string;
  updated_at: string;
}

export interface Player {
  id: string;
  game_save_id: string;
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
  fatigue: number;
  characteristics: string[];
  avatar_components: Record<string, any>;
  skills: string[];
  games_played: number;
  total_points: number;
  total_assists: number;
  total_rebounds: number;
  created_at: string;
  // Track improvements this week (reset after game)
  weekly_improvements?: {
    outside_offense?: number;
    inside_offense?: number;
    passing?: number;
    outside_defense?: number;
    inside_defense?: number;
    athleticism?: number;
    fatigue?: number;
  };
}

export interface Opponent {
  id: string;
  team_name: string;
  team_color: string;
  tier: number;
  week_range: number[];
  roster: OpponentPlayer[];
  tactics: string[];
  created_at: string;
}

export interface OpponentPlayer {
  name: string;
  position: 'PG' | 'SG' | 'SF' | 'PF' | 'C';
  age: number;
  outside_offense: number;
  inside_offense: number;
  passing: number;
  outside_defense: number;
  inside_defense: number;
  athleticism: number;
  skills: string[];
}

export interface GameResult {
  id: string;
  game_save_id: string;
  season_number: number;
  week_number: number;
  opponent_id: string;
  opponent_name: string;
  player_score: number;
  opponent_score: number;
  won: boolean;
  player_stats: PlayerStats[];
  team_stats: TeamStats;
  simulation_seed: number | null;
  tactics_used: string[];
  played_at: string;
}

export interface PlayerStats {
  player_id: string;
  player_name: string;
  points: number;
  assists: number;
  rebounds: number;
  field_goals_made: number;
  field_goals_attempted: number;
  three_pointers_made: number;
  three_pointers_attempted: number;
}

export interface TeamStats {
  total_points: number;
  field_goal_percentage: number;
  three_point_percentage: number;
  total_rebounds: number;
  total_assists: number;
}

export interface Unlock {
  id: string;
  user_id: string;
  unlock_type: 'skill' | 'tactic' | 'facility' | 'bonus';
  unlock_id: string;
  unlock_name: string;
  unlock_description: string | null;
  cost_coins: number;
  requires_championship: boolean;
  unlocked_at: string;
}

export interface Action {
  id: string;
  game_save_id: string;
  season_number: number;
  week_number: number;
  action_number: number;
  action_type: 'train' | 'buy_player' | 'sell_player' | 'buy_tactic' | 'buy_skill' | 'scout' | 'rest' | 'upgrade_facility';
  action_data: any;
  coins_spent: number;
  success: boolean;
  result_data: any;
  created_at: string;
}

export interface Facilities {
  id: string;
  game_save_id: string;
  gym_level: number;
  court_level: number;
  medical_level: number;
  analytics_level: number;
  created_at: string;
  updated_at: string;
}

export interface DraftProspect {
  id: string;
  game_save_id: string;
  name: string;
  position: 'PG' | 'SG' | 'SF' | 'PF' | 'C';
  outside_offense: number;
  inside_offense: number;
  passing: number;
  outside_defense: number;
  inside_defense: number;
  athleticism: number;
  potential_skills: string[];
  is_drafted: boolean;
  created_at: string;
}

// Retired player for Hall of Fame
export interface RetiredPlayer {
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
  characteristics: string[];
  avatar_components: Record<string, any>;
  skills: string[];
  games_played: number;
  total_points: number;
  total_assists: number;
  total_rebounds: number;
  seasons_played: number;
  retired_at: string;
}

// Complete game state for local storage
export interface CompleteGameState {
  game: GameSave;
  players: Player[];
  facilities: Facilities;
  actions: Action[];
  results: GameResult[];
  draftProspects: DraftProspect[];
  hallOfFame: RetiredPlayer[];
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CreateGameRequest {
  team_name: string;
  difficulty: 'easy' | 'normal' | 'hard';
}

export interface CreateGameResponse {
  game: GameSave;
  players: Player[];
  facilities: Facilities;
}

export interface SimulateGameRequest {
  game_id: string;
  tactics?: string[];
}

export interface SimulateGameResponse {
  result: GameResult;
  updated_game: GameSave;
  updated_players: Player[];
}

export interface TakeActionRequest {
  game_id: string;
  action_type: Action['action_type'];
  action_data: any;
}

export interface TakeActionResponse {
  action: Action;
  updated_game: GameSave;
  updated_players?: Player[];
  updated_facilities?: Facilities;
}

