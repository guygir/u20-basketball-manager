// Basketball Game Simulation Engine
// Handles possession-by-possession game simulation with realistic basketball mechanics

import type { Player, Opponent } from './types';

export interface SimulationConfig {
  playerTeam: Player[];
  opponentTeam: Opponent;
  playerTactics?: string[];
  opponentTactics?: string[];
  randomSeed?: number;
}

export interface PossessionResult {
  points: number;
  shotType: 'outside' | 'inside';
  made: boolean;
  shooter?: string;
  assister?: string;
  rebounder?: string;
  turnover: boolean;
}

export interface PlayerStats {
  points: number;
  assists: number;
  rebounds: number;
  steals: number;
  turnovers: number;
  fieldGoalsMade: number;
  fieldGoalsAttempted: number;
  threePointersMade: number;
  threePointersAttempted: number;
}

export interface TeamStats {
  [playerId: string]: PlayerStats;
}

export interface SimulationResult {
  playerScore: number;
  opponentScore: number;
  playerStats: TeamStats;
  winner: 'player' | 'opponent' | 'tie';
  playByPlay: string[];
}

interface GameState {
  playerScore: number;
  opponentScore: number;
  playerStats: TeamStats;
  playerTeam: Player[]; // Add reference to player team for stat tracking
  quarter: number;
  playByPlay: string[];
}

export class SimulationEngine {
  private rng: () => number;
  
  constructor(seed?: number) {
    // Simple seeded random number generator
    let s = seed || Date.now();
    this.rng = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  }

  /**
   * Main simulation method - simulates a full game
   */
  simulate(config: SimulationConfig): SimulationResult {
    const state: GameState = {
      playerScore: 0,
      opponentScore: 0,
      playerStats: this.initializeStats(config.playerTeam),
      playerTeam: config.playerTeam, // Store player team reference
      quarter: 1,
      playByPlay: [],
    };

    // Simulate 4 quarters (18 possessions each = ~144 total possessions for realistic scores)
    for (let quarter = 1; quarter <= 4; quarter++) {
      state.quarter = quarter;
      state.playByPlay.push(`\n--- Quarter ${quarter} ---`);
      
      // Each team gets 18 possessions per quarter (increased from 12 for higher scores)
      for (let i = 0; i < 18; i++) {
        // Player team possession
        const playerPoss = this.simulatePossession(
          config.playerTeam,
          config.opponentTeam,
          'player',
          state
        );
        state.playerScore += playerPoss.points;
        this.updateStats(state.playerStats, playerPoss, state.playerTeam);
        
        // Opponent team possession
        const oppPoss = this.simulatePossession(
          config.playerTeam,
          config.opponentTeam,
          'opponent',
          state
        );
        state.opponentScore += oppPoss.points;
      }
    }

    // Check for tie and run overtime if needed
    if (state.playerScore === state.opponentScore) {
      state.playByPlay.push(`\n--- OVERTIME ---`);
      
      // Overtime: 9 possessions each (half of a quarter)
      for (let i = 0; i < 9; i++) {
        // Player team possession
        const playerPoss = this.simulatePossession(
          config.playerTeam,
          config.opponentTeam,
          'player',
          state
        );
        state.playerScore += playerPoss.points;
        this.updateStats(state.playerStats, playerPoss, state.playerTeam);
        
        // Opponent team possession
        const oppPoss = this.simulatePossession(
          config.playerTeam,
          config.opponentTeam,
          'opponent',
          state
        );
        state.opponentScore += oppPoss.points;
      }
    }

    // Determine winner
    let winner: 'player' | 'opponent' | 'tie';
    if (state.playerScore > state.opponentScore) {
      winner = 'player';
    } else if (state.opponentScore > state.playerScore) {
      winner = 'opponent';
    } else {
      winner = 'tie';
    }

    return {
      playerScore: state.playerScore,
      opponentScore: state.opponentScore,
      playerStats: state.playerStats,
      winner,
      playByPlay: state.playByPlay,
    };
  }

  /**
   * Simulate a single possession
   */
  private simulatePossession(
    playerTeam: Player[],
    opponentTeam: Opponent,
    offense: 'player' | 'opponent',
    state: GameState
  ): PossessionResult {
    const result: PossessionResult = {
      points: 0,
      shotType: 'inside',
      made: false,
      turnover: false,
    };

    // Check for turnover (5-15% chance based on passing)
    const turnoverChance = offense === 'player' 
      ? this.calculateTurnoverChance(playerTeam)
      : 0.10; // Opponent has fixed 10% turnover rate
    
    if (this.rng() < turnoverChance) {
      result.turnover = true;
      if (offense === 'player') {
        const turnoverPlayer = this.selectRandomPlayer(playerTeam);
        state.playByPlay.push(`Turnover by ${turnoverPlayer.name}`);
      } else {
        state.playByPlay.push(`Opponent turnover`);
      }
      return result;
    }

    // Determine shot type (inside vs outside)
    result.shotType = this.rng() < 0.6 ? 'inside' : 'outside';

    // Calculate shot quality
    let shotQuality: number;
    if (offense === 'player') {
      shotQuality = this.calculatePlayerShotQuality(playerTeam, result.shotType, opponentTeam);
      result.shooter = this.selectShooter(playerTeam, result.shotType).name;
    } else {
      shotQuality = this.calculateOpponentShotQuality(opponentTeam, result.shotType, playerTeam);
    }

    // Determine if shot is made
    const makeChance = this.shotQualityToPercentage(shotQuality, result.shotType);
    result.made = this.rng() < makeChance;

    if (result.made) {
      result.points = result.shotType === 'outside' ? 3 : 2;
      
      if (offense === 'player') {
        // Chance for assist (30-50% based on passing)
        const assistChance = this.calculateAssistChance(playerTeam);
        if (this.rng() < assistChance) {
          const assister = this.selectAssister(playerTeam, result.shooter!);
          result.assister = assister.name;
          state.playByPlay.push(
            `${result.shooter} makes ${result.shotType === 'outside' ? '3-pointer' : '2-pointer'} (assist: ${result.assister})`
          );
        } else {
          state.playByPlay.push(
            `${result.shooter} makes ${result.shotType === 'outside' ? '3-pointer' : '2-pointer'}`
          );
        }
      } else {
        // Opponent made shot
        state.playByPlay.push(
          `Opponent makes ${result.shotType === 'outside' ? '3-pointer' : '2-pointer'}`
        );
      }
    } else {
      // Missed shot - rebound opportunity
      if (offense === 'player') {
        const rebounder = this.selectRebounder(playerTeam);
        result.rebounder = rebounder.name;
        state.playByPlay.push(`${result.shooter} misses, rebound by ${result.rebounder}`);
      } else {
        // Opponent missed
        state.playByPlay.push(`Opponent misses`);
      }
    }

    return result;
  }

  /**
   * Calculate shot quality for player team
   */
  private calculatePlayerShotQuality(
    team: Player[],
    shotType: 'inside' | 'outside',
    opponent: Opponent
  ): number {
    // Get average offensive stat for shot type with fatigue penalty
    const offenseStat = shotType === 'outside' ? 'outside_offense' : 'inside_offense';
    const avgOffense = team.reduce((sum, p) => {
      // Fatigue penalty: 0-50 fatigue = no penalty, 50-100 fatigue = up to 30% penalty
      const fatiguePenalty = Math.max(0, (p.fatigue - 50) / 50) * 0.3;
      const effectiveStat = p[offenseStat] * (1 - fatiguePenalty);
      return sum + effectiveStat;
    }, 0) / team.length;
    
    // Get average athleticism with fatigue penalty
    const avgAthletics = team.reduce((sum, p) => {
      const fatiguePenalty = Math.max(0, (p.fatigue - 50) / 50) * 0.3;
      const effectiveStat = p.athleticism * (1 - fatiguePenalty);
      return sum + effectiveStat;
    }, 0) / team.length;
    
    // Get average passing with fatigue penalty
    const avgPassing = team.reduce((sum, p) => {
      const fatiguePenalty = Math.max(0, (p.fatigue - 50) / 50) * 0.3;
      const effectiveStat = p.passing * (1 - fatiguePenalty);
      return sum + effectiveStat;
    }, 0) / team.length;
    
    // Opponent defense (calculate from roster)
    const defenseStat = shotType === 'outside' ? 'outside_defense' : 'inside_defense';
    const oppDefense = opponent.roster.reduce((sum, p) => sum + p[defenseStat], 0) / opponent.roster.length;
    const oppAthletics = opponent.roster.reduce((sum, p) => sum + p.athleticism, 0) / opponent.roster.length;
    
    // Calculate shot quality
    const quality = (
      avgOffense * 1.0 +           // Primary offensive stat
      avgAthletics * 0.3 +          // Athleticism bonus
      avgPassing * 0.2 -            // Ball movement
      oppDefense * 0.8 -            // Defense resistance
      oppAthletics * 0.2            // Athletic defense
    );
    
    return quality;
  }

  /**
   * Calculate shot quality for opponent team
   */
  private calculateOpponentShotQuality(
    opponent: Opponent,
    shotType: 'inside' | 'outside',
    playerTeam: Player[]
  ): number {
    // Opponent offense (calculate from roster)
    const offenseStat = shotType === 'outside' ? 'outside_offense' : 'inside_offense';
    const oppOffense = opponent.roster.reduce((sum, p) => sum + p[offenseStat], 0) / opponent.roster.length;
    const oppAthletics = opponent.roster.reduce((sum, p) => sum + p.athleticism, 0) / opponent.roster.length;
    const oppPassing = opponent.roster.reduce((sum, p) => sum + p.passing, 0) / opponent.roster.length;
    
    // Player defense with fatigue penalty
    const defenseStat = shotType === 'outside' ? 'outside_defense' : 'inside_defense';
    const avgDefense = playerTeam.reduce((sum, p) => {
      // Fatigue penalty: 0-50 fatigue = no penalty, 50-100 fatigue = up to 30% penalty
      const fatiguePenalty = Math.max(0, (p.fatigue - 50) / 50) * 0.3;
      const effectiveStat = p[defenseStat] * (1 - fatiguePenalty);
      return sum + effectiveStat;
    }, 0) / playerTeam.length;
    
    const avgAthletics = playerTeam.reduce((sum, p) => {
      const fatiguePenalty = Math.max(0, (p.fatigue - 50) / 50) * 0.3;
      const effectiveStat = p.athleticism * (1 - fatiguePenalty);
      return sum + effectiveStat;
    }, 0) / playerTeam.length;
    
    // Calculate shot quality
    const quality = (
      oppOffense * 1.0 +            // Opponent offense
      oppAthletics * 0.3 +          // Opponent athleticism
      oppPassing * 0.2 -            // Opponent ball movement
      avgDefense * 0.8 -            // Player defense
      avgAthletics * 0.2            // Athletic defense
    );
    
    return quality;
  }

  /**
   * Convert shot quality to make percentage
   */
  private shotQualityToPercentage(quality: number, shotType: 'inside' | 'outside'): number {
    // Base percentages
    const basePercentage = shotType === 'outside' ? 0.35 : 0.50;
    
    // Quality affects percentage (quality typically ranges from -10 to +30)
    // Each point of quality = ~1% change
    const percentage = basePercentage + (quality * 0.01);
    
    // Clamp between 20% and 70%
    return Math.max(0.20, Math.min(0.70, percentage));
  }

  /**
   * Calculate turnover chance based on team passing
   */
  private calculateTurnoverChance(team: Player[]): number {
    const avgPassing = team.reduce((sum, p) => sum + p.passing, 0) / team.length;
    
    // Base 15% turnover rate, reduced by passing skill
    // High passing (15+) = ~5% turnovers
    // Low passing (5) = ~15% turnovers
    return Math.max(0.05, 0.15 - (avgPassing * 0.005));
  }

  /**
   * Calculate assist chance based on team passing
   */
  private calculateAssistChance(team: Player[]): number {
    const avgPassing = team.reduce((sum, p) => sum + p.passing, 0) / team.length;
    
    // Base 30% assist rate, increased by passing skill
    // High passing (15+) = ~50% assists
    // Low passing (5) = ~30% assists
    return Math.min(0.50, 0.30 + (avgPassing * 0.01));
  }

  /**
   * Select shooter based on shot type
   */
  private selectShooter(team: Player[], shotType: 'inside' | 'outside'): Player {
    const stat = shotType === 'outside' ? 'outside_offense' : 'inside_offense';
    
    // Weight selection by stat value
    const weights = team.map(p => p[stat]);
    return this.weightedRandomSelect(team, weights);
  }

  /**
   * Select assister (player with high passing)
   */
  private selectAssister(team: Player[], excludeName: string): Player {
    const eligiblePlayers = team.filter(p => p.name !== excludeName);
    const weights = eligiblePlayers.map(p => p.passing);
    return this.weightedRandomSelect(eligiblePlayers, weights);
  }

  /**
   * Select rebounder (player with high athleticism + inside stats)
   */
  private selectRebounder(team: Player[]): Player {
    const weights = team.map(p => p.athleticism + p.inside_defense);
    return this.weightedRandomSelect(team, weights);
  }

  /**
   * Select random player from team
   */
  private selectRandomPlayer(team: Player[]): Player {
    return team[Math.floor(this.rng() * team.length)];
  }

  /**
   * Weighted random selection
   */
  private weightedRandomSelect<T>(items: T[], weights: number[]): T {
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let random = this.rng() * totalWeight;
    
    for (let i = 0; i < items.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return items[i];
      }
    }
    
    return items[items.length - 1];
  }

  /**
   * Initialize stats tracking for all players
   */
  private initializeStats(team: Player[]): TeamStats {
    const stats: TeamStats = {};
    
    for (const player of team) {
      stats[player.id] = {
        points: 0,
        assists: 0,
        rebounds: 0,
        steals: 0,
        turnovers: 0,
        fieldGoalsMade: 0,
        fieldGoalsAttempted: 0,
        threePointersMade: 0,
        threePointersAttempted: 0,
      };
    }
    
    return stats;
  }

  /**
   * Update player stats based on possession result
   */
  private updateStats(teamStats: TeamStats, possession: PossessionResult, playerTeam: Player[]): void {
    // Handle turnovers
    if (possession.turnover) {
      // Turnovers are team-level, distribute randomly
      const playerIds = Object.keys(teamStats);
      if (playerIds.length > 0) {
        const randomPlayerId = playerIds[Math.floor(Math.random() * playerIds.length)];
        teamStats[randomPlayerId].turnovers++;
      }
      return;
    }

    if (!possession.shooter) return;

    // Find shooter by name
    const shooter = playerTeam.find(p => p.name === possession.shooter);
    if (!shooter || !teamStats[shooter.id]) return;
    
    const shooterStats = teamStats[shooter.id];
    
    // Track shot attempts and makes
    if (possession.shotType === 'outside') {
      shooterStats.threePointersAttempted++;
      shooterStats.fieldGoalsAttempted++;
      if (possession.made) {
        shooterStats.threePointersMade++;
        shooterStats.fieldGoalsMade++;
        shooterStats.points += 3;
      }
    } else {
      shooterStats.fieldGoalsAttempted++;
      if (possession.made) {
        shooterStats.fieldGoalsMade++;
        shooterStats.points += 2;
      }
    }

    // Track assists (find assister by name)
    if (possession.assister && possession.made) {
      const assister = playerTeam.find(p => p.name === possession.assister);
      if (assister && teamStats[assister.id]) {
        teamStats[assister.id].assists++;
      }
    }

    // Track rebounds (find rebounder by name)
    if (possession.rebounder && !possession.made) {
      const rebounder = playerTeam.find(p => p.name === possession.rebounder);
      if (rebounder && teamStats[rebounder.id]) {
        teamStats[rebounder.id].rebounds++;
      }
    }
  }
}

