// Chemistry System
// Personality-based relationships between players

export type Characteristic = 
  | 'fiery'
  | 'laid-back'
  | 'competitive'
  | 'team-first'
  | 'leader'
  | 'showboat'
  | 'quiet';

export interface CharacteristicDefinition {
  id: Characteristic;
  name: string;
  emoji: string;
  description: string;
  likes: Characteristic[];
  dislikes: Characteristic[];
}

/**
 * All 7 personality characteristics with their relationships
 */
export const CHARACTERISTICS: Record<Characteristic, CharacteristicDefinition> = {
  fiery: {
    id: 'fiery',
    name: 'Fiery',
    emoji: '🔥',
    description: 'Passionate, intense, emotional players who play with their heart on their sleeve',
    likes: ['competitive', 'leader'],
    dislikes: ['laid-back', 'quiet'],
  },
  'laid-back': {
    id: 'laid-back',
    name: 'Laid-Back',
    emoji: '🧊',
    description: 'Calm, relaxed players who don\'t get rattled under pressure',
    likes: ['quiet', 'team-first'],
    dislikes: ['fiery', 'showboat'],
  },
  competitive: {
    id: 'competitive',
    name: 'Competitive',
    emoji: '🎯',
    description: 'Ultra-competitive players who hate losing and push everyone to win',
    likes: ['fiery', 'leader'],
    dislikes: ['laid-back', 'quiet'],
  },
  'team-first': {
    id: 'team-first',
    name: 'Team-First',
    emoji: '🤝',
    description: 'Selfless players who prioritize team success over personal glory',
    likes: ['leader', 'quiet'],
    dislikes: ['showboat'],
  },
  leader: {
    id: 'leader',
    name: 'Leader',
    emoji: '👑',
    description: 'Natural leaders who organize and motivate the team',
    likes: ['competitive', 'team-first'],
    dislikes: ['quiet'],
  },
  showboat: {
    id: 'showboat',
    name: 'Showboat',
    emoji: '🎪',
    description: 'Flashy players who love the spotlight and entertaining crowds',
    likes: ['fiery', 'competitive'],
    dislikes: ['laid-back', 'team-first'],
  },
  quiet: {
    id: 'quiet',
    name: 'Quiet',
    emoji: '🤫',
    description: 'Reserved players who let their game do the talking',
    likes: ['laid-back', 'team-first'],
    dislikes: ['fiery', 'showboat'],
  },
};

/**
 * Get a random characteristic
 */
export function getRandomCharacteristic(): Characteristic {
  const characteristics: Characteristic[] = [
    'fiery',
    'laid-back',
    'competitive',
    'team-first',
    'leader',
    'showboat',
    'quiet',
  ];
  return characteristics[Math.floor(Math.random() * characteristics.length)];
}

/**
 * Get 1 random characteristic for a player
 * Each player has exactly one personality trait
 */
export function generatePlayerCharacteristics(): Characteristic[] {
  return [getRandomCharacteristic()];
}

/**
 * Calculate chemistry between two players
 * Returns a value from -2 to +2
 */
export function calculatePairChemistry(
  playerACharacteristics: Characteristic[],
  playerBCharacteristics: Characteristic[]
): number {
  let chemistry = 0;
  
  // Check Player A's characteristics against Player B's preferences
  for (const charA of playerACharacteristics) {
    for (const charB of playerBCharacteristics) {
      const defB = CHARACTERISTICS[charB];
      if (defB.likes.includes(charA)) {
        chemistry += 1;
      }
      if (defB.dislikes.includes(charA)) {
        chemistry -= 1;
      }
    }
  }
  
  // Check Player B's characteristics against Player A's preferences
  for (const charB of playerBCharacteristics) {
    for (const charA of playerACharacteristics) {
      const defA = CHARACTERISTICS[charA];
      if (defA.likes.includes(charB)) {
        chemistry += 1;
      }
      if (defA.dislikes.includes(charB)) {
        chemistry -= 1;
      }
    }
  }
  
  // Clamp to -2 to +2 range
  return Math.max(-2, Math.min(2, chemistry));
}

/**
 * Calculate team chemistry score
 * Returns average chemistry across all player pairs (-2.0 to +2.0)
 */
export function calculateTeamChemistry(
  playerCharacteristics: Characteristic[][]
): number {
  if (playerCharacteristics.length < 2) {
    return 0;
  }
  
  let totalChemistry = 0;
  let pairCount = 0;
  
  // Calculate chemistry for all pairs
  for (let i = 0; i < playerCharacteristics.length; i++) {
    for (let j = i + 1; j < playerCharacteristics.length; j++) {
      const pairChemistry = calculatePairChemistry(
        playerCharacteristics[i],
        playerCharacteristics[j]
      );
      totalChemistry += pairChemistry;
      pairCount++;
    }
  }
  
  // Return average chemistry
  return pairCount > 0 ? totalChemistry / pairCount : 0;
}

/**
 * Get chemistry multiplier for simulation
 * Chemistry score of +2.0 gives 1.10x multiplier (10% boost)
 * Chemistry score of -2.0 gives 0.90x multiplier (10% penalty)
 */
export function getChemistryMultiplier(teamChemistry: number): number {
  return 1.0 + (teamChemistry * 0.05);
}

/**
 * Get all pair chemistries for visualization
 */
export function getAllPairChemistries(
  playerCharacteristics: Characteristic[][]
): Array<{ from: number; to: number; chemistry: number }> {
  const pairs: Array<{ from: number; to: number; chemistry: number }> = [];
  
  for (let i = 0; i < playerCharacteristics.length; i++) {
    for (let j = i + 1; j < playerCharacteristics.length; j++) {
      const chemistry = calculatePairChemistry(
        playerCharacteristics[i],
        playerCharacteristics[j]
      );
      pairs.push({ from: i, to: j, chemistry });
    }
  }
  
  return pairs;
}

/**
 * Get chemistry description
 */
export function getChemistryDescription(chemistry: number): {
  label: string;
  color: string;
  description: string;
} {
  if (chemistry >= 1.5) {
    return {
      label: 'Excellent',
      color: 'text-green-500',
      description: 'Team has great chemistry! Players work together seamlessly.',
    };
  } else if (chemistry >= 0.5) {
    return {
      label: 'Good',
      color: 'text-green-400',
      description: 'Team chemistry is positive. Players get along well.',
    };
  } else if (chemistry >= -0.5) {
    return {
      label: 'Neutral',
      color: 'text-gray-400',
      description: 'Team chemistry is neutral. No major issues or bonuses.',
    };
  } else if (chemistry >= -1.5) {
    return {
      label: 'Poor',
      color: 'text-yellow-500',
      description: 'Team chemistry is lacking. Some personality clashes.',
    };
  } else {
    return {
      label: 'Terrible',
      color: 'text-red-500',
      description: 'Team chemistry is awful! Major personality conflicts.',
    };
  }
}

/**
 * Get line color for chemistry visualization
 */
export function getChemistryLineColor(chemistry: number): {
  color: string;
  glow: boolean;
} {
  if (chemistry === 2) return { color: '#00FF00', glow: true };
  if (chemistry === 1) return { color: '#90EE90', glow: false };
  if (chemistry === 0) return { color: '#808080', glow: false };
  if (chemistry === -1) return { color: '#FFD700', glow: false };
  if (chemistry === -2) return { color: '#FF0000', glow: false };
  return { color: '#808080', glow: false };
}

