// Facility upgrade system for Basketball Roguelike

export type FacilityType = 'stadium' | 'training' | 'medical' | 'scouting';

export interface Facility {
  type: FacilityType;
  name: string;
  description: string;
  level: number;
  maxLevel: number;
  icon: string;
}

export interface FacilityLevel {
  level: number;
  cost: number;
  effect: string;
  description: string;
}

export interface FacilityUpgrades {
  stadium: number;
  training: number;
  medical: number;
  scouting: number;
}

/**
 * Facility definitions with level details
 */
export const FACILITIES: Record<FacilityType, {
  name: string;
  description: string;
  icon: string;
  levels: FacilityLevel[];
}> = {
  stadium: {
    name: 'Stadium',
    description: 'Increase coin earnings from games',
    icon: '🏟️',
    levels: [
      {
        level: 1,
        cost: 300,
        effect: '+20% coins per win',
        description: 'Upgraded seating increases ticket revenue',
      },
      {
        level: 2,
        cost: 500,
        effect: '+50% coins per win',
        description: 'Premium boxes and sponsorships boost income',
      },
      {
        level: 3,
        cost: 800,
        effect: '+100% coins per win',
        description: 'World-class arena doubles all game revenue',
      },
    ],
  },
  training: {
    name: 'Training Facility',
    description: 'Improve training effectiveness',
    icon: '🏋️',
    levels: [
      {
        level: 1,
        cost: 300,
        effect: '+1 bonus stat from training',
        description: 'Modern equipment enhances training results',
      },
      {
        level: 2,
        cost: 500,
        effect: '-5 fatigue cost for training',
        description: 'Recovery systems reduce training fatigue',
      },
      {
        level: 3,
        cost: 800,
        effect: '20% chance for double gains',
        description: 'Elite training programs maximize player development',
      },
    ],
  },
  medical: {
    name: 'Medical Center',
    description: 'Reduce fatigue and improve recovery',
    icon: '🏥',
    levels: [
      {
        level: 1,
        cost: 300,
        effect: '-5 fatigue from all training',
        description: 'Basic medical staff reduces training strain',
      },
      {
        level: 2,
        cost: 500,
        effect: 'Rest gives -30 fatigue (was -20)',
        description: 'Advanced recovery treatments improve rest',
      },
      {
        level: 3,
        cost: 800,
        effect: 'Passive -5 fatigue per week',
        description: 'World-class medical team provides ongoing care',
      },
    ],
  },
  scouting: {
    name: 'Scouting Network',
    description: 'Improve draft prospects quality',
    icon: '🔍',
    levels: [
      {
        level: 1,
        cost: 300,
        effect: '+1 draft prospect option',
        description: 'Expanded network finds more prospects',
      },
      {
        level: 2,
        cost: 500,
        effect: 'Draft prospects +2 overall rating',
        description: 'Better scouting identifies higher quality players',
      },
      {
        level: 3,
        cost: 800,
        effect: 'Preview prospects before season end',
        description: 'Elite scouts provide early draft intelligence',
      },
    ],
  },
};

/**
 * Get current facility levels from game state
 */
export function getFacilityLevels(facilities?: FacilityUpgrades): FacilityUpgrades {
  return facilities || {
    stadium: 0,
    training: 0,
    medical: 0,
    scouting: 0,
  };
}

/**
 * Get upgrade cost for next level of a facility
 */
export function getUpgradeCost(facilityType: FacilityType, currentLevel: number): number | null {
  const facility = FACILITIES[facilityType];
  const nextLevel = currentLevel + 1;
  
  if (nextLevel > facility.levels.length) {
    return null; // Max level reached
  }
  
  return facility.levels[nextLevel - 1].cost;
}

/**
 * Check if facility can be upgraded
 */
export function canUpgradeFacility(
  facilityType: FacilityType,
  currentLevel: number,
  coins: number
): { canUpgrade: boolean; reason?: string } {
  const facility = FACILITIES[facilityType];
  
  if (currentLevel >= facility.levels.length) {
    return { canUpgrade: false, reason: 'Max level reached' };
  }
  
  const cost = getUpgradeCost(facilityType, currentLevel);
  if (cost === null) {
    return { canUpgrade: false, reason: 'Max level reached' };
  }
  
  if (coins < cost) {
    return { canUpgrade: false, reason: `Need ${cost} coins, have ${coins}` };
  }
  
  return { canUpgrade: true };
}

/**
 * Upgrade a facility
 */
export function upgradeFacility(
  facilityType: FacilityType,
  currentFacilities: FacilityUpgrades,
  coins: number
): {
  success: boolean;
  message: string;
  updatedFacilities?: FacilityUpgrades;
  coinsSpent?: number;
} {
  const currentLevel = currentFacilities[facilityType];
  const { canUpgrade, reason } = canUpgradeFacility(facilityType, currentLevel, coins);
  
  if (!canUpgrade) {
    return {
      success: false,
      message: reason || 'Cannot upgrade facility',
    };
  }
  
  const cost = getUpgradeCost(facilityType, currentLevel)!;
  const newLevel = currentLevel + 1;
  const facility = FACILITIES[facilityType];
  const levelInfo = facility.levels[newLevel - 1];
  
  const updatedFacilities = {
    ...currentFacilities,
    [facilityType]: newLevel,
  };
  
  return {
    success: true,
    message: `Upgraded ${facility.name} to Level ${newLevel}! ${levelInfo.effect}`,
    updatedFacilities,
    coinsSpent: cost,
  };
}

/**
 * Calculate coin multiplier from stadium level
 */
export function getStadiumMultiplier(stadiumLevel: number): number {
  switch (stadiumLevel) {
    case 1: return 1.20; // +20%
    case 2: return 1.50; // +50%
    case 3: return 2.00; // +100%
    default: return 1.00; // No bonus
  }
}

/**
 * Calculate training bonus from training facility level
 */
export function getTrainingBonus(trainingLevel: number): {
  bonusStats: number;
  fatigueReduction: number;
  doubleChance: number;
} {
  return {
    bonusStats: trainingLevel >= 1 ? 1 : 0,
    fatigueReduction: trainingLevel >= 2 ? 5 : 0,
    doubleChance: trainingLevel >= 3 ? 0.20 : 0,
  };
}

/**
 * Calculate fatigue reduction from medical center level
 */
export function getMedicalBonus(medicalLevel: number): {
  trainingFatigueReduction: number;
  restBonus: number;
  passiveRecovery: number;
} {
  return {
    trainingFatigueReduction: medicalLevel >= 1 ? 5 : 0,
    restBonus: medicalLevel >= 2 ? 10 : 0, // Rest gives -30 instead of -20
    passiveRecovery: medicalLevel >= 3 ? 5 : 0,
  };
}

/**
 * Calculate scouting bonuses
 */
export function getScoutingBonus(scoutingLevel: number): {
  extraProspects: number;
  ratingBonus: number;
  earlyPreview: boolean;
} {
  return {
    extraProspects: scoutingLevel >= 1 ? 1 : 0,
    ratingBonus: scoutingLevel >= 2 ? 2 : 0,
    earlyPreview: scoutingLevel >= 3,
  };
}

/**
 * Get all active facility bonuses
 */
export function getAllFacilityBonuses(facilities: FacilityUpgrades) {
  return {
    stadium: {
      level: facilities.stadium,
      multiplier: getStadiumMultiplier(facilities.stadium),
    },
    training: {
      level: facilities.training,
      ...getTrainingBonus(facilities.training),
    },
    medical: {
      level: facilities.medical,
      ...getMedicalBonus(facilities.medical),
    },
    scouting: {
      level: facilities.scouting,
      ...getScoutingBonus(facilities.scouting),
    },
  };
}

