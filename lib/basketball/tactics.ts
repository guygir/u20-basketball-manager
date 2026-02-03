// Tactics system for Basketball Roguelike

export type TacticCategory = 'offense' | 'defense' | 'balanced';

export interface Tactic {
  id: string;
  name: string;
  description: string;
  category: TacticCategory;
  cost: number;
  icon: string;
  effects: {
    outsideOffense?: number;
    insideOffense?: number;
    passing?: number;
    outsideDefense?: number;
    insideDefense?: number;
    athleticism?: number;
  };
}

/**
 * All available tactics in the game
 */
export const AVAILABLE_TACTICS: Record<string, Tactic> = {
  fast_break: {
    id: 'fast_break',
    name: 'Fast Break',
    description: 'Push the pace and run in transition',
    category: 'offense',
    cost: 150,
    icon: '⚡',
    effects: {
      athleticism: 10,
      outsideOffense: 5,
      insideDefense: -5,
    },
  },
  zone_defense: {
    id: 'zone_defense',
    name: 'Zone Defense',
    description: 'Pack the paint and protect the rim',
    category: 'defense',
    cost: 150,
    icon: '🛡️',
    effects: {
      insideDefense: 15,
      outsideDefense: 5,
      outsideOffense: -10,
    },
  },
  pick_and_roll: {
    id: 'pick_and_roll',
    name: 'Pick and Roll',
    description: 'Use screens to create scoring opportunities',
    category: 'offense',
    cost: 200,
    icon: '🔄',
    effects: {
      passing: 20,
      insideOffense: 10,
      athleticism: 5,
    },
  },
  three_point_shooting: {
    id: 'three_point_shooting',
    name: '3-Point Shooting',
    description: 'Spread the floor and shoot from deep',
    category: 'offense',
    cost: 200,
    icon: '🎯',
    effects: {
      outsideOffense: 20,
      passing: 5,
      insideOffense: -10,
    },
  },
  man_to_man: {
    id: 'man_to_man',
    name: 'Man-to-Man Defense',
    description: 'Tight individual defense on every player',
    category: 'defense',
    cost: 150,
    icon: '👤',
    effects: {
      outsideDefense: 10,
      insideDefense: 10,
      athleticism: 5,
    },
  },
  full_court_press: {
    id: 'full_court_press',
    name: 'Full Court Press',
    description: 'Apply pressure the entire length of the court',
    category: 'defense',
    cost: 250,
    icon: '🔥',
    effects: {
      outsideDefense: 15,
      athleticism: 10,
      insideDefense: -10,
    },
  },
  motion_offense: {
    id: 'motion_offense',
    name: 'Motion Offense',
    description: 'Constant movement and ball sharing',
    category: 'offense',
    cost: 200,
    icon: '🌀',
    effects: {
      passing: 15,
      outsideOffense: 10,
      insideOffense: 5,
    },
  },
  post_up: {
    id: 'post_up',
    name: 'Post-Up Game',
    description: 'Feed the big men in the paint',
    category: 'offense',
    cost: 150,
    icon: '💪',
    effects: {
      insideOffense: 20,
      passing: 5,
      athleticism: -5,
    },
  },
  balanced_attack: {
    id: 'balanced_attack',
    name: 'Balanced Attack',
    description: 'Mix of inside and outside scoring',
    category: 'balanced',
    cost: 250,
    icon: '⚖️',
    effects: {
      outsideOffense: 10,
      insideOffense: 10,
      passing: 10,
    },
  },
  defensive_focus: {
    id: 'defensive_focus',
    name: 'Defensive Focus',
    description: 'Prioritize stops over scoring',
    category: 'balanced',
    cost: 250,
    icon: '🔒',
    effects: {
      outsideDefense: 15,
      insideDefense: 15,
      outsideOffense: -10,
      insideOffense: -10,
    },
  },
};

/**
 * Get tactics by category
 */
export function getTacticsByCategory(category: TacticCategory): Tactic[] {
  return Object.values(AVAILABLE_TACTICS).filter(t => t.category === category);
}

/**
 * Get all tactics as array
 */
export function getAllTactics(): Tactic[] {
  return Object.values(AVAILABLE_TACTICS);
}

/**
 * Get tactic by ID
 */
export function getTacticById(id: string): Tactic | undefined {
  return AVAILABLE_TACTICS[id];
}

/**
 * Check if player can purchase tactic
 */
export function canPurchaseTactic(
  tacticId: string,
  ownedTactics: string[],
  coins: number
): { canPurchase: boolean; reason?: string } {
  const tactic = getTacticById(tacticId);
  
  if (!tactic) {
    return { canPurchase: false, reason: 'Tactic not found' };
  }
  
  if (ownedTactics.includes(tacticId)) {
    return { canPurchase: false, reason: 'Already owned' };
  }
  
  if (coins < tactic.cost) {
    return { canPurchase: false, reason: `Need ${tactic.cost} coins, have ${coins}` };
  }
  
  return { canPurchase: true };
}

/**
 * Purchase a tactic
 */
export function purchaseTactic(
  tacticId: string,
  ownedTactics: string[],
  coins: number
): {
  success: boolean;
  message: string;
  updatedTactics?: string[];
  coinsSpent?: number;
} {
  const { canPurchase, reason } = canPurchaseTactic(tacticId, ownedTactics, coins);
  
  if (!canPurchase) {
    return {
      success: false,
      message: reason || 'Cannot purchase tactic',
    };
  }
  
  const tactic = getTacticById(tacticId)!;
  
  return {
    success: true,
    message: `Purchased ${tactic.name}! ${tactic.description}`,
    updatedTactics: [...ownedTactics, tacticId],
    coinsSpent: tactic.cost,
  };
}

/**
 * Apply tactic effects to player stats
 * Returns modified stats (percentage-based)
 */
export function applyTacticEffects(
  baseStats: {
    outsideOffense: number;
    insideOffense: number;
    passing: number;
    outsideDefense: number;
    insideDefense: number;
    athleticism: number;
  },
  activeTactics: string[]
): typeof baseStats {
  const modifiedStats = { ...baseStats };
  
  for (const tacticId of activeTactics) {
    const tactic = getTacticById(tacticId);
    if (!tactic) continue;
    
    // Apply percentage-based effects
    for (const [stat, effect] of Object.entries(tactic.effects)) {
      if (effect && stat in modifiedStats) {
        const key = stat as keyof typeof modifiedStats;
        // Effect is a percentage modifier (e.g., +10 means +10%)
        modifiedStats[key] = Math.round(modifiedStats[key] * (1 + effect / 100));
        // Clamp between 1 and 30 (extended range for tactics)
        modifiedStats[key] = Math.max(1, Math.min(30, modifiedStats[key]));
      }
    }
  }
  
  return modifiedStats;
}

/**
 * Get summary of active tactic effects
 */
export function getTacticEffectsSummary(activeTactics: string[]): string[] {
  const summary: string[] = [];
  
  for (const tacticId of activeTactics) {
    const tactic = getTacticById(tacticId);
    if (!tactic) continue;
    
    const effects: string[] = [];
    for (const [stat, value] of Object.entries(tactic.effects)) {
      if (value) {
        const sign = value > 0 ? '+' : '';
        const statName = stat.replace(/([A-Z])/g, ' $1').trim();
        effects.push(`${sign}${value}% ${statName}`);
      }
    }
    
    summary.push(`${tactic.icon} ${tactic.name}: ${effects.join(', ')}`);
  }
  
  return summary;
}

