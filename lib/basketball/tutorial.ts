// Tutorial System
// Step-by-step onboarding for new players

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector for highlighting
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: 'click' | 'navigate' | 'complete';
  nextStep?: string;
  skipable?: boolean;
}

export const TUTORIAL_STEPS: Record<string, TutorialStep> = {
  welcome: {
    id: 'welcome',
    title: '🏀 Welcome to College Basketball Roguelike!',
    description: 'Build your dream college team, manage your roster, and compete for the championship! This tutorial will guide you through the basics.',
    position: 'bottom',
    action: 'click',
    nextStep: 'team-overview',
    skipable: false,
  },
  
  'team-overview': {
    id: 'team-overview',
    title: '👥 Your Team',
    description: 'You start with 5 randomly generated players. Each player has 6 key attributes that determine their performance on the court.',
    target: '.team-section',
    position: 'top',
    action: 'click',
    nextStep: 'player-stats',
  },
  
  'player-stats': {
    id: 'player-stats',
    title: '📊 Player Stats',
    description: 'Stats range from 1-20. Higher is better! The hexagon shows: Outside Offense, Inside Offense, Passing, Outside Defense, Inside Defense, and Athleticism.',
    target: '.hexagon-stats',
    position: 'right',
    action: 'click',
    nextStep: 'player-age',
  },
  
  'player-age': {
    id: 'player-age',
    title: '⏰ Player Aging & Retirement',
    description: 'Players start at age 18 and age one year per season. They RETIRE at age 21 (after 3 seasons: 18→19→20→retire), so plan ahead! Younger players improve faster with training.',
    position: 'bottom',
    action: 'click',
    nextStep: 'weekly-actions',
  },
  
  'weekly-actions': {
    id: 'weekly-actions',
    title: '⚡ Weekly Actions',
    description: 'You have 3 actions per week. Use them to train players, scout opponents, rest your team, or manage your roster. Choose wisely!',
    target: '.actions-button',
    position: 'left',
    action: 'navigate',
    nextStep: 'training',
  },
  
  training: {
    id: 'training',
    title: '💪 Training',
    description: 'Training improves player stats but increases fatigue. General training improves 2-3 random stats by 1. Focused training targets specific stats for +2.',
    position: 'top',
    action: 'click',
    nextStep: 'fatigue',
  },
  
  fatigue: {
    id: 'fatigue',
    title: '😴 Fatigue Management',
    description: 'Fatigue (0-100) reduces training effectiveness and game performance. Use the Rest action to reduce fatigue by 20. Keep your team fresh!',
    position: 'bottom',
    action: 'click',
    nextStep: 'simulation',
  },
  
  simulation: {
    id: 'simulation',
    title: '🎮 Game Simulation',
    description: 'Each week, you play one game. Win to earn coins and build your win streak! Higher difficulty and longer streaks earn more rewards.',
    target: '.simulate-button',
    position: 'top',
    action: 'click',
    nextStep: 'season-structure',
  },
  
  'season-structure': {
    id: 'season-structure',
    title: '📅 Season Structure',
    description: '14 weeks total: 11 regular season + 3 playoff weeks. Make the playoffs (6+ wins) to compete for the championship!',
    position: 'bottom',
    action: 'click',
    nextStep: 'draft',
  },
  
  draft: {
    id: 'draft',
    title: '🎯 Draft System',
    description: 'At season end, players age up. Players who reach age 21 RETIRE and are added to your Hall of Fame. Draft new 18-year-olds to replace them!',
    position: 'bottom',
    action: 'click',
    nextStep: 'progression',
  },
  
  progression: {
    id: 'progression',
    title: '⭐ Progression',
    description: 'Unlock new skills, tactics, and bonuses as you play. These persist across seasons, making each run stronger than the last!',
    position: 'bottom',
    action: 'click',
    nextStep: 'victory',
  },
  
  victory: {
    id: 'victory',
    title: '🏆 Victory Condition',
    description: 'Win the championship to beat the game! Then start a new season with your unlocks and try harder difficulties. Good luck, coach!',
    position: 'bottom',
    action: 'complete',
    skipable: false,
  },
};

export const TUTORIAL_SEQUENCE = [
  'welcome',
  'team-overview',
  'player-stats',
  'player-age',
  'weekly-actions',
  'training',
  'fatigue',
  'simulation',
  'season-structure',
  'draft',
  'progression',
  'victory',
];

export interface TutorialProgress {
  completed: boolean;
  currentStep: string;
  completedSteps: string[];
  skipped: boolean;
  stepHistory: string[]; // Track step history for back navigation
  permanentlyDismissed: boolean; // Track if user permanently dismissed tutorial
  completedPageTutorials: string[]; // Track which page tutorials are completed
}

export function getInitialTutorialProgress(): TutorialProgress {
  return {
    completed: false,
    currentStep: 'welcome',
    completedSteps: [],
    skipped: false,
    stepHistory: [],
    permanentlyDismissed: false,
    completedPageTutorials: [],
  };
}

export function getNextStep(currentStep: string): string | null {
  const step = TUTORIAL_STEPS[currentStep];
  return step?.nextStep || null;
}

export function getTutorialProgress(): TutorialProgress {
  if (typeof window === 'undefined') {
    return getInitialTutorialProgress();
  }
  
  const saved = localStorage.getItem('basketball_tutorial_progress');
  if (!saved) {
    return getInitialTutorialProgress();
  }
  
  try {
    return JSON.parse(saved);
  } catch {
    return getInitialTutorialProgress();
  }
}

export function saveTutorialProgress(progress: TutorialProgress): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('basketball_tutorial_progress', JSON.stringify(progress));
}

export function completeTutorialStep(stepId: string): TutorialProgress {
  const progress = getTutorialProgress();
  
  if (!progress.completedSteps.includes(stepId)) {
    progress.completedSteps.push(stepId);
  }
  
  // Add current step to history before moving to next
  if (!progress.stepHistory.includes(stepId)) {
    progress.stepHistory.push(stepId);
  }
  
  const nextStep = getNextStep(stepId);
  if (nextStep) {
    progress.currentStep = nextStep;
  } else {
    progress.completed = true;
  }
  
  saveTutorialProgress(progress);
  return progress;
}

export function skipTutorial(): void {
  const progress: TutorialProgress = {
    completed: true,
    currentStep: 'victory',
    completedSteps: TUTORIAL_SEQUENCE,
    skipped: true,
    stepHistory: [],
    permanentlyDismissed: false,
    completedPageTutorials: [],
  };
  saveTutorialProgress(progress);
}

export function resetTutorial(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('basketball_tutorial_progress');
}

export function shouldShowTutorial(): boolean {
  const progress = getTutorialProgress();
  return !progress.completed && !progress.skipped && !progress.permanentlyDismissed;
}

export function getCurrentTutorialStep(): TutorialStep | null {
  const progress = getTutorialProgress();
  if (progress.completed || progress.skipped || progress.permanentlyDismissed) {
    return null;
  }
  return TUTORIAL_STEPS[progress.currentStep] || null;
}

export function getPreviousStep(currentStep: string): string | null {
  const progress = getTutorialProgress();
  const history = progress.stepHistory;
  
  if (history.length === 0) {
    return null;
  }
  
  // Return the last step in history
  return history[history.length - 1];
}

export function goToPreviousStep(): TutorialProgress {
  const progress = getTutorialProgress();
  const previousStep = progress.stepHistory.pop();
  
  if (previousStep) {
    progress.currentStep = previousStep;
    // Remove from completed steps if it was completed
    const index = progress.completedSteps.indexOf(previousStep);
    if (index > -1) {
      progress.completedSteps.splice(index, 1);
    }
  }
  
  saveTutorialProgress(progress);
  return progress;
}

export function permanentlyDismissTutorial(): void {
  const progress = getTutorialProgress();
  progress.permanentlyDismissed = true;
  progress.completed = true;
  saveTutorialProgress(progress);
}

// Per-page tutorial definitions
export interface PageTutorial {
  page: string;
  steps: TutorialStep[];
}

export const PAGE_TUTORIALS: Record<string, PageTutorial> = {
  team: {
    page: 'team',
    steps: [
      {
        id: 'team-page-intro',
        title: '👥 Team Management',
        description: 'This is your team roster. View all 5 players and their stats. Click on a player to see detailed information.',
        position: 'bottom',
        action: 'click',
        nextStep: 'team-page-hexagon',
      },
      {
        id: 'team-page-hexagon',
        title: '📊 Hexagon Stats',
        description: 'The hexagon shows 6 key attributes. Larger area = better overall player. Look for balanced shapes or specialized strengths.',
        target: '.hexagon-stats',
        position: 'right',
        action: 'click',
        nextStep: 'team-page-actions',
      },
      {
        id: 'team-page-actions',
        title: '⚡ Quick Actions',
        description: 'Use the navigation buttons to access marketplace, facilities, tactics, and chemistry pages.',
        position: 'bottom',
        action: 'complete',
      },
    ],
  },
  
  marketplace: {
    page: 'marketplace',
    steps: [
      {
        id: 'marketplace-intro',
        title: '🏪 Player Marketplace',
        description: 'Buy players here to improve your roster. The market refreshes weekly with new players. Look for young players (age 18) with high potential!',
        position: 'bottom',
        action: 'click',
        nextStep: 'marketplace-buying',
      },
      {
        id: 'marketplace-buying',
        title: '💰 Buying Players',
        description: 'Click "Buy" to purchase a player. They\'ll replace your selected roster spot. Make sure you have enough coins!',
        position: 'bottom',
        action: 'complete',
      },
    ],
  },
  
  facilities: {
    page: 'facilities',
    steps: [
      {
        id: 'facilities-intro',
        title: '🏗️ Facility Upgrades',
        description: 'Upgrade 4 facilities to boost your team. Each facility has 3 levels with increasing benefits and costs.',
        position: 'bottom',
        action: 'click',
        nextStep: 'facilities-stadium',
      },
      {
        id: 'facilities-stadium',
        title: '🏟️ Stadium',
        description: 'Stadium upgrades increase coin rewards from games. Higher levels = more coins per win. Essential for long-term success!',
        position: 'bottom',
        action: 'click',
        nextStep: 'facilities-training',
      },
      {
        id: 'facilities-training',
        title: '💪 Training Center',
        description: 'Better training facilities improve training effectiveness. Players gain more stats per training action.',
        position: 'bottom',
        action: 'click',
        nextStep: 'facilities-medical',
      },
      {
        id: 'facilities-medical',
        title: '🏥 Medical Facility',
        description: 'Medical upgrades reduce fatigue gain and improve rest effectiveness. Keep your team fresh for games!',
        position: 'bottom',
        action: 'click',
        nextStep: 'facilities-scouting',
      },
      {
        id: 'facilities-scouting',
        title: '🔍 Scouting Department',
        description: 'Scouting reveals opponent stats before games. Higher levels show more detailed information.',
        position: 'bottom',
        action: 'complete',
      },
    ],
  },
  
  tactics: {
    page: 'tactics',
    steps: [
      {
        id: 'tactics-intro',
        title: '📋 Tactics System',
        description: 'Purchase and activate up to 3 tactics to boost your team. Each tactic modifies stats by percentages.',
        position: 'bottom',
        action: 'click',
        nextStep: 'tactics-purchase',
      },
      {
        id: 'tactics-purchase',
        title: '🛒 Purchasing Tactics',
        description: 'Buy tactics with coins. Once purchased, they\'re permanently unlocked. Choose tactics that complement your team\'s strengths!',
        position: 'bottom',
        action: 'click',
        nextStep: 'tactics-activate',
      },
      {
        id: 'tactics-activate',
        title: '✅ Activating Tactics',
        description: 'Activate up to 3 tactics at once. Active tactics apply their bonuses to all games. Experiment to find the best combination!',
        position: 'bottom',
        action: 'complete',
      },
    ],
  },
  
  chemistry: {
    page: 'chemistry',
    steps: [
      {
        id: 'chemistry-intro',
        title: '🧪 Team Chemistry',
        description: 'Players have personality traits that affect team chemistry. Good chemistry boosts all stats by up to 10%!',
        position: 'bottom',
        action: 'click',
        nextStep: 'chemistry-traits',
      },
      {
        id: 'chemistry-traits',
        title: '🎭 Personality Traits',
        description: 'Each player has 1 personality trait. Traits have likes and dislikes. Build a team with compatible personalities!',
        position: 'bottom',
        action: 'click',
        nextStep: 'chemistry-bonus',
      },
      {
        id: 'chemistry-bonus',
        title: '📈 Chemistry Bonus',
        description: 'Chemistry ranges from -10% to +10%. Positive chemistry boosts all stats. Negative chemistry reduces them. Balance is key!',
        position: 'bottom',
        action: 'complete',
      },
    ],
  },
  
  achievements: {
    page: 'achievements',
    steps: [
      {
        id: 'achievements-intro',
        title: '🏆 Achievements',
        description: 'Track your progress with achievements. Complete challenges to earn rewards and bragging rights!',
        position: 'bottom',
        action: 'click',
        nextStep: 'achievements-rewards',
      },
      {
        id: 'achievements-rewards',
        title: '🎁 Achievement Rewards',
        description: 'Some achievements grant coin rewards. Others unlock new features or provide permanent bonuses.',
        position: 'bottom',
        action: 'complete',
      },
    ],
  },
  
  actions: {
    page: 'actions',
    steps: [
      {
        id: 'actions-intro',
        title: '⚡ Weekly Actions',
        description: 'You have 3 actions per week. Use them wisely! Actions include training, scouting, resting, and more.',
        position: 'bottom',
        action: 'click',
        nextStep: 'actions-training',
      },
      {
        id: 'actions-training',
        title: '💪 Training Actions',
        description: 'Train players to improve their stats. General training improves 2-3 random stats. Focused training targets specific stats.',
        position: 'bottom',
        action: 'click',
        nextStep: 'actions-rest',
      },
      {
        id: 'actions-rest',
        title: '😴 Rest Action',
        description: 'Rest reduces team fatigue by 20. Use it when fatigue is high to maintain performance and training effectiveness.',
        position: 'bottom',
        action: 'click',
        nextStep: 'actions-scout',
      },
      {
        id: 'actions-scout',
        title: '🔍 Scout Action',
        description: 'Scout your next opponent to reveal their stats. Better scouting facilities provide more detailed information.',
        position: 'bottom',
        action: 'complete',
      },
    ],
  },
  
  simulate: {
    page: 'simulate',
    steps: [
      {
        id: 'simulate-intro',
        title: '🎮 Game Simulation',
        description: 'Simulate your weekly game here. Your team\'s stats, tactics, and chemistry determine the outcome.',
        position: 'bottom',
        action: 'click',
        nextStep: 'simulate-results',
      },
      {
        id: 'simulate-results',
        title: '📊 Game Results',
        description: 'After simulation, view detailed results including score, player performance, and coin rewards. Learn from each game!',
        position: 'bottom',
        action: 'complete',
      },
    ],
  },
};

export function getPageTutorial(pageName: string): TutorialStep[] {
  return PAGE_TUTORIALS[pageName]?.steps || [];
}

export function shouldShowPageTutorial(pageName: string): boolean {
  if (typeof window === 'undefined') return false;
  
  const progress = getTutorialProgress();
  
  // Don't show page tutorials if main tutorial is not completed
  if (!progress.completed && !progress.skipped) {
    return false;
  }
  
  // Don't show if permanently dismissed
  if (progress.permanentlyDismissed) {
    return false;
  }
  
  // Check if this page tutorial was already completed
  return !progress.completedPageTutorials.includes(pageName);
}

export function completePageTutorial(pageName: string): void {
  const progress = getTutorialProgress();
  
  if (!progress.completedPageTutorials.includes(pageName)) {
    progress.completedPageTutorials.push(pageName);
    saveTutorialProgress(progress);
  }
}

export function getPageTutorialProgress(pageName: string): {
  currentStepIndex: number;
  totalSteps: number;
  currentStep: TutorialStep | null;
} {
  const steps = getPageTutorial(pageName);
  
  if (steps.length === 0) {
    return {
      currentStepIndex: 0,
      totalSteps: 0,
      currentStep: null,
    };
  }
  
  // For page tutorials, we'll track progress separately
  const pageProgress = typeof window !== 'undefined'
    ? localStorage.getItem(`basketball_page_tutorial_${pageName}`)
    : null;
  
  const currentStepIndex = pageProgress ? parseInt(pageProgress, 10) : 0;
  
  return {
    currentStepIndex,
    totalSteps: steps.length,
    currentStep: steps[currentStepIndex] || null,
  };
}

export function advancePageTutorial(pageName: string): boolean {
  if (typeof window === 'undefined') return false;
  
  const { currentStepIndex, totalSteps } = getPageTutorialProgress(pageName);
  const nextIndex = currentStepIndex + 1;
  
  if (nextIndex >= totalSteps) {
    // Tutorial complete
    completePageTutorial(pageName);
    localStorage.removeItem(`basketball_page_tutorial_${pageName}`);
    return true;
  }
  
  localStorage.setItem(`basketball_page_tutorial_${pageName}`, nextIndex.toString());
  return false;
}

export function skipPageTutorial(pageName: string): void {
  completePageTutorial(pageName);
  if (typeof window !== 'undefined') {
    localStorage.removeItem(`basketball_page_tutorial_${pageName}`);
  }
}

