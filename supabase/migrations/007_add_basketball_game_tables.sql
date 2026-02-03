-- ============================================================================
-- BASKETBALL ROGUELIKE DATABASE SCHEMA
-- Migration: 007_add_basketball_game_tables.sql
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- GAME SAVES TABLE
-- Stores the main game state for each user's active season
-- ============================================================================
CREATE TABLE IF NOT EXISTS basketball_game_saves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Season tracking
  season_number INTEGER NOT NULL DEFAULT 1,
  week_number INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Game state
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  playoff_round INTEGER DEFAULT NULL, -- NULL = regular season, 1 = quarters, 2 = semis, 3 = finals
  
  -- Resources
  coins INTEGER NOT NULL DEFAULT 1000,
  actions_remaining INTEGER NOT NULL DEFAULT 3,
  
  -- Metadata
  team_name TEXT DEFAULT 'My Team',
  difficulty TEXT DEFAULT 'normal', -- 'easy', 'normal', 'hard'
  last_played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_week CHECK (week_number >= 1 AND week_number <= 14),
  CONSTRAINT valid_playoff_round CHECK (playoff_round IS NULL OR (playoff_round >= 1 AND playoff_round <= 3)),
  CONSTRAINT one_active_save_per_user UNIQUE (user_id, is_active)
);

-- ============================================================================
-- PLAYERS TABLE
-- Stores individual player data for each game save
-- ============================================================================
CREATE TABLE IF NOT EXISTS basketball_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_save_id UUID NOT NULL REFERENCES basketball_game_saves(id) ON DELETE CASCADE,
  
  -- Player identity
  name TEXT NOT NULL,
  position TEXT NOT NULL, -- 'PG', 'SG', 'SF', 'PF', 'C'
  age INTEGER NOT NULL,
  
  -- Core attributes (1-20 scale)
  outside_offense INTEGER NOT NULL DEFAULT 10,
  inside_offense INTEGER NOT NULL DEFAULT 10,
  passing INTEGER NOT NULL DEFAULT 10,
  outside_defense INTEGER NOT NULL DEFAULT 10,
  inside_defense INTEGER NOT NULL DEFAULT 10,
  athleticism INTEGER NOT NULL DEFAULT 10,
  
  -- Derived stats
  overall_rating INTEGER GENERATED ALWAYS AS (
    (outside_offense + inside_offense + passing + outside_defense + inside_defense + athleticism) / 6
  ) STORED,
  
  -- Player state
  fatigue INTEGER NOT NULL DEFAULT 0, -- 0-100, higher = more tired (NO INJURIES in MVP)
  
  -- Chemistry system (personality traits)
  characteristics TEXT[] DEFAULT '{}', -- e.g., ['fiery', 'competitive']
  
  -- Avatar system (visual components)
  avatar_components JSONB DEFAULT '{}'::jsonb, -- Stores all avatar component choices
  
  -- Skills (array of skill IDs)
  skills TEXT[] DEFAULT '{}',
  
  -- Career stats
  games_played INTEGER NOT NULL DEFAULT 0,
  total_points INTEGER NOT NULL DEFAULT 0,
  total_assists INTEGER NOT NULL DEFAULT 0,
  total_rebounds INTEGER NOT NULL DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_position CHECK (position IN ('PG', 'SG', 'SF', 'PF', 'C')),
  CONSTRAINT valid_age CHECK (age >= 18 AND age <= 21),
  CONSTRAINT valid_attributes CHECK (
    outside_offense BETWEEN 1 AND 20 AND
    inside_offense BETWEEN 1 AND 20 AND
    passing BETWEEN 1 AND 20 AND
    outside_defense BETWEEN 1 AND 20 AND
    inside_defense BETWEEN 1 AND 20 AND
    athleticism BETWEEN 1 AND 20
  ),
  CONSTRAINT valid_fatigue CHECK (fatigue >= 0 AND fatigue <= 100)
);

-- ============================================================================
-- OPPONENTS TABLE
-- Pre-generated AI opponent teams
-- ============================================================================
CREATE TABLE IF NOT EXISTS basketball_opponents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Team identity
  team_name TEXT NOT NULL UNIQUE,
  team_color TEXT NOT NULL DEFAULT '#000000',
  
  -- Difficulty
  tier INTEGER NOT NULL, -- 1 (easiest) to 5 (hardest)
  week_range INTEGER[] NOT NULL, -- [min_week, max_week] when this team appears
  
  -- Team composition (JSONB for flexibility)
  roster JSONB NOT NULL, -- Array of player objects with attributes
  tactics TEXT[] DEFAULT '{}',
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_tier CHECK (tier >= 1 AND tier <= 5)
);

-- ============================================================================
-- GAME RESULTS TABLE
-- Historical record of all games played
-- ============================================================================
CREATE TABLE IF NOT EXISTS basketball_game_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_save_id UUID NOT NULL REFERENCES basketball_game_saves(id) ON DELETE CASCADE,
  
  -- Game context
  season_number INTEGER NOT NULL,
  week_number INTEGER NOT NULL,
  opponent_id UUID NOT NULL REFERENCES basketball_opponents(id),
  
  -- Scores
  player_score INTEGER NOT NULL,
  opponent_score INTEGER NOT NULL,
  won BOOLEAN NOT NULL,
  
  -- Game stats (JSONB for flexibility)
  player_stats JSONB NOT NULL, -- Individual player performances
  team_stats JSONB NOT NULL, -- Team totals
  
  -- Simulation details
  simulation_seed INTEGER, -- For reproducibility
  tactics_used TEXT[],
  
  -- Metadata
  played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_scores CHECK (player_score >= 0 AND opponent_score >= 0)
);

-- ============================================================================
-- UNLOCKS TABLE
-- Meta-progression: permanent unlocks across all runs
-- ============================================================================
CREATE TABLE IF NOT EXISTS basketball_unlocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Unlock details
  unlock_type TEXT NOT NULL, -- 'skill', 'tactic', 'facility', 'bonus'
  unlock_id TEXT NOT NULL, -- Identifier for the specific unlock
  unlock_name TEXT NOT NULL,
  unlock_description TEXT,
  
  -- Cost and requirements
  cost_coins INTEGER NOT NULL DEFAULT 0,
  requires_championship BOOLEAN NOT NULL DEFAULT false,
  
  -- Metadata
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_unlock_type CHECK (unlock_type IN ('skill', 'tactic', 'facility', 'bonus')),
  CONSTRAINT unique_user_unlock UNIQUE (user_id, unlock_type, unlock_id)
);

-- ============================================================================
-- ACTIONS TABLE
-- Track weekly actions taken by players
-- ============================================================================
CREATE TABLE IF NOT EXISTS basketball_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_save_id UUID NOT NULL REFERENCES basketball_game_saves(id) ON DELETE CASCADE,
  
  -- Action context
  season_number INTEGER NOT NULL,
  week_number INTEGER NOT NULL,
  action_number INTEGER NOT NULL, -- 1, 2, or 3
  
  -- Action details
  action_type TEXT NOT NULL, -- 'train', 'buy_player', 'sell_player', 'buy_tactic', 'buy_skill', 'scout', 'rest', 'upgrade_facility'
  action_data JSONB NOT NULL, -- Specific action parameters
  
  -- Costs
  coins_spent INTEGER NOT NULL DEFAULT 0,
  
  -- Results
  success BOOLEAN NOT NULL DEFAULT true,
  result_data JSONB, -- Outcome details
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_action_number CHECK (action_number >= 1 AND action_number <= 3),
  CONSTRAINT valid_action_type CHECK (action_type IN (
    'train', 'buy_player', 'sell_player', 'buy_tactic', 'buy_skill', 
    'scout', 'rest', 'upgrade_facility'
  ))
);

-- ============================================================================
-- FACILITIES TABLE
-- Infrastructure upgrades for each game save
-- ============================================================================
CREATE TABLE IF NOT EXISTS basketball_facilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_save_id UUID NOT NULL REFERENCES basketball_game_saves(id) ON DELETE CASCADE,
  
  -- Facility types and levels
  gym_level INTEGER NOT NULL DEFAULT 0, -- Improves physical training
  court_level INTEGER NOT NULL DEFAULT 0, -- Improves skill training
  medical_level INTEGER NOT NULL DEFAULT 0, -- Reduces injury risk/duration
  analytics_level INTEGER NOT NULL DEFAULT 0, -- Better opponent scouting
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_facility_levels CHECK (
    gym_level >= 0 AND gym_level <= 5 AND
    court_level >= 0 AND court_level <= 5 AND
    medical_level >= 0 AND medical_level <= 5 AND
    analytics_level >= 0 AND analytics_level <= 5
  ),
  CONSTRAINT one_facility_per_save UNIQUE (game_save_id)
);

-- ============================================================================
-- DRAFT PROSPECTS TABLE
-- Pool of available draft picks
-- ============================================================================
CREATE TABLE IF NOT EXISTS basketball_draft_prospects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_save_id UUID NOT NULL REFERENCES basketball_game_saves(id) ON DELETE CASCADE,
  
  -- Prospect identity
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  
  -- Attributes (1-20 scale)
  outside_offense INTEGER NOT NULL,
  inside_offense INTEGER NOT NULL,
  passing INTEGER NOT NULL,
  outside_defense INTEGER NOT NULL,
  inside_defense INTEGER NOT NULL,
  athleticism INTEGER NOT NULL,
  
  -- Potential skills (from unlocks)
  potential_skills TEXT[] DEFAULT '{}',
  
  -- Draft state
  is_drafted BOOLEAN NOT NULL DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_prospect_position CHECK (position IN ('PG', 'SG', 'SF', 'PF', 'C')),
  CONSTRAINT valid_prospect_attributes CHECK (
    outside_offense BETWEEN 1 AND 20 AND
    inside_offense BETWEEN 1 AND 20 AND
    passing BETWEEN 1 AND 20 AND
    outside_defense BETWEEN 1 AND 20 AND
    inside_defense BETWEEN 1 AND 20 AND
    athleticism BETWEEN 1 AND 20
  )
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Game saves indexes
CREATE INDEX IF NOT EXISTS idx_basketball_game_saves_user ON basketball_game_saves(user_id);
CREATE INDEX IF NOT EXISTS idx_basketball_game_saves_active ON basketball_game_saves(user_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_basketball_game_saves_last_played ON basketball_game_saves(last_played_at DESC);

-- Players indexes
CREATE INDEX IF NOT EXISTS idx_basketball_players_game_save ON basketball_players(game_save_id);
CREATE INDEX IF NOT EXISTS idx_basketball_players_position ON basketball_players(position);
CREATE INDEX IF NOT EXISTS idx_basketball_players_age ON basketball_players(age);
CREATE INDEX IF NOT EXISTS idx_basketball_players_overall ON basketball_players(overall_rating DESC);

-- Opponents indexes
CREATE INDEX IF NOT EXISTS idx_basketball_opponents_tier ON basketball_opponents(tier);
CREATE INDEX IF NOT EXISTS idx_basketball_opponents_name ON basketball_opponents(team_name);

-- Game results indexes
CREATE INDEX IF NOT EXISTS idx_basketball_game_results_game_save ON basketball_game_results(game_save_id);
CREATE INDEX IF NOT EXISTS idx_basketball_game_results_season_week ON basketball_game_results(season_number, week_number);
CREATE INDEX IF NOT EXISTS idx_basketball_game_results_played_at ON basketball_game_results(played_at DESC);

-- Unlocks indexes
CREATE INDEX IF NOT EXISTS idx_basketball_unlocks_user ON basketball_unlocks(user_id);
CREATE INDEX IF NOT EXISTS idx_basketball_unlocks_type ON basketball_unlocks(unlock_type);

-- Actions indexes
CREATE INDEX IF NOT EXISTS idx_basketball_actions_game_save ON basketball_actions(game_save_id);
CREATE INDEX IF NOT EXISTS idx_basketball_actions_week ON basketball_actions(season_number, week_number);

-- Draft prospects indexes
CREATE INDEX IF NOT EXISTS idx_basketball_draft_prospects_game_save ON basketball_draft_prospects(game_save_id);
CREATE INDEX IF NOT EXISTS idx_basketball_draft_prospects_drafted ON basketball_draft_prospects(is_drafted);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE basketball_game_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE basketball_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE basketball_opponents ENABLE ROW LEVEL SECURITY;
ALTER TABLE basketball_game_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE basketball_unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE basketball_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE basketball_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE basketball_draft_prospects ENABLE ROW LEVEL SECURITY;

-- Game saves policies
CREATE POLICY "Users can view their own game saves"
  ON basketball_game_saves FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own game saves"
  ON basketball_game_saves FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own game saves"
  ON basketball_game_saves FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own game saves"
  ON basketball_game_saves FOR DELETE
  USING (auth.uid() = user_id);

-- Players policies
CREATE POLICY "Users can view players in their game saves"
  ON basketball_players FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM basketball_game_saves
      WHERE basketball_game_saves.id = basketball_players.game_save_id
      AND basketball_game_saves.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage players in their game saves"
  ON basketball_players FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM basketball_game_saves
      WHERE basketball_game_saves.id = basketball_players.game_save_id
      AND basketball_game_saves.user_id = auth.uid()
    )
  );

-- Opponents policies (public read)
CREATE POLICY "Anyone can view opponents"
  ON basketball_opponents FOR SELECT
  TO authenticated
  USING (true);

-- Game results policies
CREATE POLICY "Users can view their game results"
  ON basketball_game_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM basketball_game_saves
      WHERE basketball_game_saves.id = basketball_game_results.game_save_id
      AND basketball_game_saves.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create game results for their saves"
  ON basketball_game_results FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM basketball_game_saves
      WHERE basketball_game_saves.id = basketball_game_results.game_save_id
      AND basketball_game_saves.user_id = auth.uid()
    )
  );

-- Unlocks policies
CREATE POLICY "Users can view their own unlocks"
  ON basketball_unlocks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own unlocks"
  ON basketball_unlocks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Actions policies
CREATE POLICY "Users can view actions in their game saves"
  ON basketball_actions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM basketball_game_saves
      WHERE basketball_game_saves.id = basketball_actions.game_save_id
      AND basketball_game_saves.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create actions in their game saves"
  ON basketball_actions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM basketball_game_saves
      WHERE basketball_game_saves.id = basketball_actions.game_save_id
      AND basketball_game_saves.user_id = auth.uid()
    )
  );

-- Facilities policies
CREATE POLICY "Users can view facilities in their game saves"
  ON basketball_facilities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM basketball_game_saves
      WHERE basketball_game_saves.id = basketball_facilities.game_save_id
      AND basketball_game_saves.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage facilities in their game saves"
  ON basketball_facilities FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM basketball_game_saves
      WHERE basketball_game_saves.id = basketball_facilities.game_save_id
      AND basketball_game_saves.user_id = auth.uid()
    )
  );

-- Draft prospects policies
CREATE POLICY "Users can view draft prospects in their game saves"
  ON basketball_draft_prospects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM basketball_game_saves
      WHERE basketball_game_saves.id = basketball_draft_prospects.game_save_id
      AND basketball_game_saves.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage draft prospects in their game saves"
  ON basketball_draft_prospects FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM basketball_game_saves
      WHERE basketball_game_saves.id = basketball_draft_prospects.game_save_id
      AND basketball_game_saves.user_id = auth.uid()
    )
  );

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for game_saves updated_at
CREATE TRIGGER update_basketball_game_saves_updated_at
  BEFORE UPDATE ON basketball_game_saves
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for facilities updated_at
CREATE TRIGGER update_basketball_facilities_updated_at
  BEFORE UPDATE ON basketball_facilities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create facilities when game save is created
CREATE OR REPLACE FUNCTION create_facilities_for_game_save()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO basketball_facilities (game_save_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create facilities
CREATE TRIGGER create_facilities_on_game_save
  AFTER INSERT ON basketball_game_saves
  FOR EACH ROW
  EXECUTE FUNCTION create_facilities_for_game_save();

-- Made with Bob
