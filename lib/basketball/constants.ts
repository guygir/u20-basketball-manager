// Game balance constants for Basketball Roguelike

export const GAME_CONSTANTS = {
  // Season structure
  REGULAR_SEASON_WEEKS: 11,
  PLAYOFF_WEEKS: 3,
  TOTAL_WEEKS: 14,
  
  // Actions
  ACTIONS_PER_WEEK: 3,
  
  // Action costs and effects
  ACTIONS: {
    TRAIN_GENERAL: {
      COST: 50,
      FATIGUE_COST: 5,
      // Improvement amounts are age-based, see BALANCE.TRAINING
    },
    TRAIN_FOCUSED: {
      COST: 100,
      FATIGUE_COST: 10,
      // Improvement amounts are age-based, see BALANCE.TRAINING
    },
    REST: {
      COST: 0,
      FATIGUE_REDUCTION: 20,
    },
    SCOUT: {
      COST: 30,
    },
    PUBLIC_RELATIONS: {
      COST: 0,
      COINS_EARNED: 50,
    },
    BUY_PLAYER: {
      MIN_COST: 200,
      MAX_COST: 500,
    },
    SELL_PLAYER: {
      MIN_VALUE: 50,
      MAX_VALUE: 200,
    },
    PURCHASE_TACTIC: {
      MIN_COST: 150,
      MAX_COST: 300,
    },
    UPGRADE_FACILITY: {
      LEVEL_1_COST: 300,
      LEVEL_2_COST: 500,
      LEVEL_3_COST: 800,
    },
    // UNLOCK_SKILL: NOT IMPLEMENTED - Future feature
  },
  
  // Player attributes
  MIN_ATTRIBUTE: 1,
  MAX_ATTRIBUTE: 20,
  
  // Player ages
  DRAFT_AGE: 18,
  RETIREMENT_AGE: 21,
  
  // Roster
  ROSTER_SIZE: 5,
  
  // Starting resources
  STARTING_COINS: 300,
  
  // Training
  FOCUSED_TRAINING_BONUS: 3, // ?
  BALANCED_TRAINING_BONUS: 1, // ?
  
  // Fatigue
  FATIGUE_PER_GAME: 20,
  FATIGUE_RECOVERY_PER_WEEK: 20,
  MAX_FATIGUE: 100,
  
  // Injuries (not in MVP, but keeping for future)
  BASE_INJURY_CHANCE: 0.05,
  MEDICAL_FACILITY_REDUCTION: 0.01,
  
  // Simulation
  POSSESSIONS_PER_QUARTER: 25,
  QUARTERS: 4,
  BASE_SHOT_PROBABILITY: 0.35,
  
  // Rewards
  SEASON_COMPLETION_REWARD: 500,
  WIN_REWARD: 50,
  PLAYOFF_QUALIFICATION_REWARD: 200,
  SEMIFINALS_REWARD: 300,
  FINALS_REWARD: 500,
  CHAMPIONSHIP_REWARD: 1000,
  
  // ========================================
  // 🎯 GAME BALANCE CONFIGURATION
  // ========================================
  // Adjust these values to tune game difficulty
  // All player/opponent generation uses these ranges
  
  BALANCE: {
    // Player Generation (Starting Team & Base Stats)
    // Lower values = harder start, higher values = easier start
    PLAYER_GENERATION: {
      BASE_MIN: 4,        // Minimum starting attribute (default: 4, was 6)
      BASE_MAX: 10,       // Maximum starting attribute (default: 10, was 14)
      // Result: Average 7 per stat, ~42 total, ~7 overall rating
      // Recommended ranges: Easy (6-12), Normal (4-10), Hard (3-8)
    },
    
    // Draft Prospects (18-year-olds in draft)
    // Uses same base range as starting players, plus potential bonuses
    DRAFT_PROSPECTS: {
      BASE_MIN: 3,        // Same as starting players
      BASE_MAX: 9,       // Same as starting players
      ELITE_BONUS: 3,     // Elite prospects get +3 to all stats
      HIGH_BONUS: 2,      // High prospects get +2 to all stats
      MEDIUM_BONUS: 1,    // Medium prospects get +1 to all stats
      LOW_BONUS: 0,       // Low prospects get +0 to all stats
    },
    
    // Marketplace Players (available for purchase)
    // Uses same base range, plus quality bonuses
    MARKETPLACE: {
      BASE_MIN: 3,        // Same as starting players
      BASE_MAX: 9,       // Same as starting players
      ELITE_BONUS: 4,     // Elite market players get +4 to all stats
      PREMIUM_BONUS: 2,   // Premium get +2 to all stats
      STANDARD_BONUS: 1,  // Standard get +1 to all stats
      BUDGET_BONUS: 0,    // Budget get +0 to all stats
      // Base prices by quality tier (before age multiplier)
      ELITE_PRICE: 800,   // Elite players base price
      PREMIUM_PRICE: 500, // Premium players base price
      STANDARD_PRICE: 300,// Standard players base price
      BUDGET_PRICE: 200,  // Budget players base price
      // Age price multipliers
      AGE_18_MULTIPLIER: 1.2, // 18-year-olds cost 20% more
      AGE_19_MULTIPLIER: 1.0, // 19-year-olds at base price
      AGE_20_MULTIPLIER: 0.8, // 20-year-olds cost 20% less
    },
    
    // ========================================
    // 🎯 OPPONENT DIFFICULTY SYSTEM
    // ========================================
    // Opponents get progressively stronger throughout the season
    //
    // HOW IT WORKS:
    // 1. Week determines BASE TIER (see opponent-generator.ts calculateTier function)
    // 2. Difficulty setting modifies tier (easy: -1, normal: 0, hard: +1)
    // 3. Each opponent player's stats = BASE_MIN_OFFSET + tier to BASE_MAX_OFFSET + tier
    //
    // TIER CALCULATION (Normal Difficulty):
    // Regular Season (Weeks 1-11):
    //   baseTier = 1 + Math.floor((week - 1) * 0.4)
    //   Week 1: tier 1, Week 3: tier 1, Week 6: tier 2, Week 9: tier 3, Week 11: tier 4
    //
    // Playoffs (Weeks 12-14):
    //   baseTier = 4 + (week - 11)
    //   Week 12 (Quarterfinals): tier 5
    //   Week 13 (Semifinals): tier 6
    //   Week 14 (Finals): tier 7
    //
    // STAT CALCULATION:
    //   baseMin = BASE_MIN_OFFSET + tier
    //   baseMax = BASE_MAX_OFFSET + tier
    //   Each stat = random(baseMin, baseMax) * position multiplier
    //
    // EXAMPLES (Normal Difficulty, Current Values):
    //   Week 1 (Tier 1): Stats 6-10, avg 8
    //   Week 6 (Tier 2): Stats 7-11, avg 9
    //   Week 11 (Tier 4): Stats 9-13, avg 11
    //   Quarterfinals (Tier 5): Stats 10-14, avg 12
    //   Semifinals (Tier 6): Stats 11-15, avg 13
    //   Finals (Tier 7): Stats 12-16, avg 14
    //
    // TO ADJUST DIFFICULTY:
    // - Increase offsets = stronger opponents at all stages
    // - Decrease offsets = weaker opponents at all stages
    // - Change tier calculation in opponent-generator.ts for different progression curve
    OPPONENTS: {
      BASE_MIN_OFFSET: 5, // Minimum stat = this + tier
      BASE_MAX_OFFSET: 9, // Maximum stat = this + tier
    },
    
    // Playoff System
    PLAYOFF: {
      QUALIFICATION_WINS: 7,  // Need this many wins to reach playoffs (out of 11 games)
      QUARTERFINALS_WEEK: 12, // Week number for quarterfinals
      SEMIFINALS_WEEK: 13,    // Week number for semifinals
      FINALS_WEEK: 14,        // Week number for finals
    },
    
    // Training Effectiveness by Age
    // Younger players improve faster, older players improve slower
    TRAINING: {
      AGE_18: {
        GENERAL_ATTRIBUTES: 4,  // 4 random attributes each improve by +1
        FOCUSED_IMPROVEMENT: 3, // Single chosen attribute improves by +3
      },
      AGE_19: {
        GENERAL_ATTRIBUTES: 3,  // 3 random attributes each improve by +1
        FOCUSED_IMPROVEMENT: 2, // Single chosen attribute improves by +2
      },
      AGE_20: {
        GENERAL_ATTRIBUTES: 2,  // 2 random attribute improves by +1
        FOCUSED_IMPROVEMENT: 1, // Single chosen attribute improves by +1
      },
      AGE_21: {
        GENERAL_ATTRIBUTES: 1,  // Almost cannot train (too old)
        FOCUSED_IMPROVEMENT: 0, // Cannot train (too old)
      },
    },
  },
};

// Position bonuses for player generation
export const POSITION_BONUSES: Record<string, Partial<Record<string, number>>> = {
  PG: { passing: 2, outside_offense: 1 },
  SG: { outside_offense: 2, athleticism: 1 },
  SF: { athleticism: 2, outside_defense: 1 },
  PF: { inside_offense: 2, inside_defense: 1 },
  C: { inside_defense: 2, inside_offense: 1 },
};

// Available skills
export const SKILLS = {
  // Offensive skills
  clutch_gene: {
    name: 'Clutch Gene',
    description: '+15% shooting in close games',
    cost: 500,
  },
  hot_hand: {
    name: 'Hot Hand',
    description: '+10% shooting after making 2 consecutive shots',
    cost: 400,
  },
  ankle_breaker: {
    name: 'Ankle Breaker',
    description: '+20% chance to create open shot',
    cost: 450,
  },
  
  // Defensive skills
  lockdown: {
    name: 'Lockdown Defender',
    description: '+3 to all defensive attributes',
    cost: 500,
  },
  rim_protector: {
    name: 'Rim Protector',
    description: '+25% block chance on inside shots',
    cost: 450,
  },
  ball_hawk: {
    name: 'Ball Hawk',
    description: '+20% steal chance',
    cost: 400,
  },
  
  // Utility skills
  floor_general: {
    name: 'Floor General',
    description: '+2 passing, teammates get +1 to all attributes',
    cost: 600,
  },
  energy_boost: {
    name: 'Energy Boost',
    description: '-50% fatigue accumulation',
    cost: 500,
  },
  mentor: {
    name: 'Mentor',
    description: 'Teammates gain +10% training effectiveness',
    cost: 550,
  },
};

// Available tactics
export const TACTICS = {
  // Offensive
  fast_break: {
    name: 'Fast Break',
    description: '+10% outside shooting, +5% athleticism bonus',
    cost: 300,
  },
  pick_and_roll: {
    name: 'Pick & Roll',
    description: '+15% inside shooting, +10% passing bonus',
    cost: 350,
  },
  post_up_offense: {
    name: 'Post-Up Offense',
    description: '+20% inside shooting',
    cost: 300,
  },
  three_point_offense: {
    name: '3-Point Offense',
    description: '+20% outside shooting',
    cost: 300,
  },
  motion_offense: {
    name: 'Motion Offense',
    description: '+10% all shooting, requires high passing',
    cost: 400,
  },
  
  // Defensive
  man_to_man_defense: {
    name: 'Man-to-Man Defense',
    description: '+10% all defense',
    cost: 300,
  },
  zone_defense: {
    name: 'Zone Defense',
    description: '+15% inside defense, -5% outside defense',
    cost: 300,
  },
  press_defense: {
    name: 'Press Defense',
    description: '+20% steal chance, +10% fatigue',
    cost: 350,
  },
  switch_defense: {
    name: 'Switch Defense',
    description: '+10% defense, requires high athleticism',
    cost: 400,
  },
};

// Player name pools
export const FIRST_NAMES = [
  'James', 'Michael', 'Chris', 'Kevin', 'Anthony',
  'Marcus', 'Tyler', 'Jordan', 'Brandon', 'Derek',
  'Alex', 'Ryan', 'Jason', 'David', 'Daniel',
  'Kyle', 'Justin', 'Eric', 'Brian', 'Steven',
  'Matthew', 'Andrew', 'Joshua', 'Nicholas', 'Aaron',
  'Zachary', 'Cameron', 'Connor', 'Dylan', 'Ethan',
];

export const LAST_NAMES = [
  'Johnson', 'Williams', 'Brown', 'Davis', 'Miller',
  'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas',
  'Jackson', 'White', 'Harris', 'Martin', 'Thompson',
  'Garcia', 'Martinez', 'Robinson', 'Clark', 'Rodriguez',
  'Lewis', 'Lee', 'Walker', 'Hall', 'Allen',
  'Young', 'King', 'Wright', 'Lopez', 'Hill',
];

// Team name pools
export const TEAM_ADJECTIVES = [
  'Thunder', 'Lightning', 'Storm', 'Blaze', 'Frost',
  'Shadow', 'Phoenix', 'Dragon', 'Titan', 'Viper',
  'Hawk', 'Wolf', 'Bear', 'Lion', 'Eagle',
  'Cobra', 'Panther', 'Falcon', 'Raven', 'Shark',
  'Crimson', 'Golden', 'Silver', 'Steel', 'Iron',
];

export const TEAM_NOUNS = [
  'Warriors', 'Knights', 'Legends', 'Champions', 'Elite',
  'Force', 'Squad', 'Dynasty', 'Empire', 'Alliance',
  'Guardians', 'Defenders', 'Strikers', 'Titans', 'Heroes',
  'Crusaders', 'Sentinels', 'Avengers', 'Conquerors', 'Victors',
];

// Team colors
export const TEAM_COLORS = [
  '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF',
  '#00FFFF', '#FFA500', '#800080', '#008000', '#000080',
  '#FF1493', '#00CED1', '#FFD700', '#DC143C', '#4B0082',
];

// Positions
export const POSITIONS = ['PG', 'SG', 'SF', 'PF', 'C'] as const;

// Position names
export const POSITION_NAMES: Record<string, string> = {
  PG: 'Point Guard',
  SG: 'Shooting Guard',
  SF: 'Small Forward',
  PF: 'Power Forward',
  C: 'Center',
};

// Attribute names
export const ATTRIBUTE_NAMES: Record<string, string> = {
  outside_offense: 'Outside Offense',
  inside_offense: 'Inside Offense',
  passing: 'Passing',
  outside_defense: 'Outside Defense',
  inside_defense: 'Inside Defense',
  athleticism: 'Athleticism',
};

// Difficulty modifiers
export const DIFFICULTY_MODIFIERS = {
  easy: {
    opponent_attribute_multiplier: 0.85,
    coin_multiplier: 1.2,
    training_multiplier: 1.1,
  },
  normal: {
    opponent_attribute_multiplier: 1.0,
    coin_multiplier: 1.0,
    training_multiplier: 1.0,
  },
  hard: {
    opponent_attribute_multiplier: 1.15,
    coin_multiplier: 0.8,
    training_multiplier: 0.9,
  },
};

// Facility upgrade costs
export const FACILITY_COSTS = {
  gym: [100, 250, 500, 1000, 2000],
  court: [100, 250, 500, 1000, 2000],
  medical: [150, 300, 600, 1200, 2400],
  analytics: [150, 300, 600, 1200, 2400],
};

// Facility bonuses
export const FACILITY_BONUSES = {
  gym: {
    1: { athleticism_training: 0.1 },
    2: { athleticism_training: 0.2 },
    3: { athleticism_training: 0.3 },
    4: { athleticism_training: 0.4 },
    5: { athleticism_training: 0.5 },
  },
  court: {
    1: { skill_training: 0.1 },
    2: { skill_training: 0.2 },
    3: { skill_training: 0.3 },
    4: { skill_training: 0.4 },
    5: { skill_training: 0.5 },
  },
  medical: {
    1: { fatigue_recovery: 0.1 },
    2: { fatigue_recovery: 0.2 },
    3: { fatigue_recovery: 0.3 },
    4: { fatigue_recovery: 0.4 },
    5: { fatigue_recovery: 0.5 },
  },
  analytics: {
    1: { scouting_bonus: 0.1 },
    2: { scouting_bonus: 0.2 },
    3: { scouting_bonus: 0.3 },
    4: { scouting_bonus: 0.4 },
    5: { scouting_bonus: 0.5 },
  },
};

// Chemistry characteristics
export const CHARACTERISTICS = [
  'fiery',
  'calm',
  'competitive',
  'supportive',
  'serious',
  'playful',
  'leader',
] as const;

// Chemistry compatibility (LIKE/DISLIKE relationships)
export const CHEMISTRY_COMPATIBILITY: Record<string, { likes: string[]; dislikes: string[] }> = {
  fiery: { likes: ['competitive', 'leader'], dislikes: ['calm'] },
  calm: { likes: ['supportive', 'serious'], dislikes: ['fiery'] },
  competitive: { likes: ['fiery', 'leader'], dislikes: ['playful'] },
  supportive: { likes: ['calm', 'playful'], dislikes: ['serious'] },
  serious: { likes: ['calm', 'leader'], dislikes: ['supportive', 'playful'] },
  playful: { likes: ['supportive'], dislikes: ['competitive', 'serious'] },
  leader: { likes: ['competitive', 'serious'], dislikes: [] },
};

