// API route for game simulation
// Simulates a basketball game and returns results

import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse, Player } from '@/lib/basketball/types';
import { getCurrentGame, getPlayers, saveGameState, loadGameState } from '@/lib/basketball/local-storage';
import { SimulationEngine } from '@/lib/basketball/simulation-engine';
import { generateOpponent, calculateOpponentRating } from '@/lib/basketball/opponent-generator';
import { GAME_CONSTANTS } from '@/lib/basketball/constants';
import { processSeasonEnd, type SeasonEndResult } from '@/lib/basketball/progression-system';
import { getStadiumMultiplier } from '@/lib/basketball/facilities';
import { applyTacticEffects } from '@/lib/basketball/tactics';
import { calculateTeamChemistry, getChemistryMultiplier, type Characteristic } from '@/lib/basketball/chemistry';
import { calculateGameReward, checkMilestone } from '@/lib/basketball/game-balance';
// Achievement checking moved to client side (simulate page)

interface SimulateRequest {
  gameId: string;
}

interface SimulateResponse {
  playerScore: number;
  opponentScore: number;
  won: boolean;
  playerStats: any;
  opponentName: string;
  opponentRating: number;
  playByPlay: string[];
  coinsEarned: number;
  newWeek: number;
  seasonComplete: boolean;
  championshipWon?: boolean;
  seasonEndData?: SeasonEndResult;
  milestoneAchieved?: {
    name: string;
    message: string;
    reward: number;
  };
  achievementsUnlocked?: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    reward?: number;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    // Get game state from request body (sent from client)
    const body = await request.json();
    const { gameState } = body;
    
    if (!gameState || !gameState.game || !gameState.players) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid game state provided',
      }, { status: 400 });
    }

    const game = gameState.game;
    const players = gameState.players;
    
    if (players.length !== 5) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid roster size. Must have exactly 5 players.',
      }, { status: 400 });
    }

    // Generate opponent for current week
    const opponent = generateOpponent(
      game.week_number,
      game.difficulty,
      Date.now() + game.week_number
    );

    // Calculate team chemistry
    const playerCharacteristics = players.map((p: Player) => p.characteristics as Characteristic[]);
    const teamChemistry = calculateTeamChemistry(playerCharacteristics);
    const chemistryMultiplier = getChemistryMultiplier(teamChemistry);

    // Apply active tactics and chemistry to player stats
    const activeTactics = game.active_tactics || [];
    const modifiedPlayers = players.map((player: Player) => {
      // First apply tactics
      const modifiedStats = applyTacticEffects({
        outsideOffense: player.outside_offense,
        insideOffense: player.inside_offense,
        passing: player.passing,
        outsideDefense: player.outside_defense,
        insideDefense: player.inside_defense,
        athleticism: player.athleticism,
      }, activeTactics);
      
      // Then apply chemistry multiplier
      const finalStats = {
        outside_offense: Math.round(modifiedStats.outsideOffense * chemistryMultiplier),
        inside_offense: Math.round(modifiedStats.insideOffense * chemistryMultiplier),
        passing: Math.round(modifiedStats.passing * chemistryMultiplier),
        outside_defense: Math.round(modifiedStats.outsideDefense * chemistryMultiplier),
        inside_defense: Math.round(modifiedStats.insideDefense * chemistryMultiplier),
        athleticism: Math.round(modifiedStats.athleticism * chemistryMultiplier),
      };
      
      // Clamp to valid range (1-30)
      return {
        ...player,
        outside_offense: Math.max(1, Math.min(30, finalStats.outside_offense)),
        inside_offense: Math.max(1, Math.min(30, finalStats.inside_offense)),
        passing: Math.max(1, Math.min(30, finalStats.passing)),
        outside_defense: Math.max(1, Math.min(30, finalStats.outside_defense)),
        inside_defense: Math.max(1, Math.min(30, finalStats.inside_defense)),
        athleticism: Math.max(1, Math.min(30, finalStats.athleticism)),
      };
    });

    // Run simulation with modified stats
    const engine = new SimulationEngine(Date.now());
    const result = engine.simulate({
      playerTeam: modifiedPlayers,
      opponentTeam: opponent,
      playerTactics: activeTactics,
      opponentTactics: opponent.tactics,
    });

    // Determine if won
    const won = result.winner === 'player';

    // Update win streak
    const previousWinStreak = gameState.game.win_streak || 0;
    if (won) {
      gameState.game.win_streak = previousWinStreak + 1;
      gameState.game.wins++;
    } else {
      gameState.game.win_streak = 0;
      gameState.game.losses++;
    }

    // Calculate coins earned with improved balance system
    const baseReward = calculateGameReward(
      won,
      game.week_number,
      game.difficulty,
      previousWinStreak
    );
    const stadiumMultiplier = getStadiumMultiplier(gameState.game.facilities.stadium);
    const coinsEarned = Math.round(baseReward * stadiumMultiplier);

    // Check for milestone achievements
    let milestoneBonus = 0;
    let milestoneMessage = '';
    const milestone = checkMilestone(
      gameState.game.wins,
      gameState.game.losses,
      game.week_number,
      gameState.game.win_streak
    );
    
    if (milestone.reached && milestone.milestone) {
      // Check if milestone not already achieved
      if (!gameState.game.milestones_achieved.includes(milestone.milestone)) {
        gameState.game.milestones_achieved.push(milestone.milestone);
        milestoneBonus = milestone.reward || 0;
        milestoneMessage = milestone.message || '';
      }
    }

    // Add coins (base + milestone bonus)
    gameState.game.coins += coinsEarned + milestoneBonus;

    // Update player stats (add to career totals)
    for (const player of gameState.players) {
      const playerGameStats = result.playerStats[player.id];
      if (playerGameStats) {
        player.games_played++;
        player.total_points += playerGameStats.points;
        player.total_assists += playerGameStats.assists;
        player.total_rebounds += playerGameStats.rebounds;
      }

      // Increase fatigue (5-15% per game based on minutes played)
      const fatigueIncrease = 10 + Math.floor(Math.random() * 5);
      player.fatigue = Math.min(100, player.fatigue + fatigueIncrease);
    }

    // Check if season is complete
    // Season ends if:
    // 1. Completed all weeks (won championship)
    // 2. Failed to qualify for playoffs (< required wins after regular season)
    // 3. Lost in playoffs
    const isPlayoffWeek = game.week_number > GAME_CONSTANTS.REGULAR_SEASON_WEEKS;
    const didNotQualify = game.week_number === GAME_CONSTANTS.REGULAR_SEASON_WEEKS &&
                          gameState.game.wins < GAME_CONSTANTS.BALANCE.PLAYOFF.QUALIFICATION_WINS;
    const eliminatedInPlayoffs = isPlayoffWeek && !won;
    const completedAllWeeks = game.week_number >= GAME_CONSTANTS.TOTAL_WEEKS;
    
    const seasonComplete = completedAllWeeks || didNotQualify || eliminatedInPlayoffs;
    let seasonEndData: SeasonEndResult | undefined;
    
    // Check if this is a championship win (Finals + won the game)
    const isChampionshipWin = game.week_number === GAME_CONSTANTS.TOTAL_WEEKS && won;
    
    if (seasonComplete) {
      // Track championship wins
      if (isChampionshipWin) {
        gameState.game.championships_won = (gameState.game.championships_won || 0) + 1;
      }
      
      // Process season end - age players, calculate rewards, generate draft
      seasonEndData = processSeasonEnd(
        gameState.game,
        gameState.players,
        [] // TODO: Get unlocked skills from user's unlocks
      );
      
      // Add season rewards to coins
      gameState.game.coins += seasonEndData.totalCoinsEarned;
      
      // IMPORTANT: Update players with aged versions in gameState
      // The draft page will use these aged players
      gameState.players = seasonEndData.retiringPlayers.length > 0
        ? gameState.players.map((p: Player) => {
            const agedPlayer = seasonEndData!.retiringPlayers.find(rp => rp.id === p.id);
            if (agedPlayer) return agedPlayer;
            // If not in retiring list, age manually
            return { ...p, age: p.age + 1 };
          })
        : gameState.players.map((p: Player) => ({ ...p, age: p.age + 1 }));
      
      // Note: We don't advance to new season yet - user must complete draft first
      // The draft page will handle replacing retiring players and advancing season
    } else {
      // Advance to next week
      gameState.game.week_number++;
      gameState.game.actions_remaining = GAME_CONSTANTS.ACTIONS_PER_WEEK;
      
      // Reset weekly improvements for all players (improvements are now permanent)
      gameState.players = gameState.players.map((player: Player) => ({
        ...player,
        weekly_improvements: {},
      }));
    }

    // NOTE: Achievement checking moved to client side (simulate page)
    // because it needs access to localStorage which doesn't exist on server

    // Prepare response with updated game state
    const response: SimulateResponse = {
      playerScore: result.playerScore,
      opponentScore: result.opponentScore,
      won,
      playerStats: result.playerStats,
      opponentName: opponent.team_name,
      opponentRating: calculateOpponentRating(opponent),
      playByPlay: result.playByPlay,
      coinsEarned: coinsEarned + milestoneBonus,
      newWeek: gameState.game.week_number,
      seasonComplete,
      championshipWon: isChampionshipWin,
      seasonEndData,
      milestoneAchieved: milestone.reached ? {
        name: milestone.milestone!,
        message: milestoneMessage,
        reward: milestoneBonus,
      } : undefined,
      // achievementsUnlocked will be checked on client side
    };

    return NextResponse.json<ApiResponse<SimulateResponse & { updatedGameState: typeof gameState }>>({
      success: true,
      data: { ...response, updatedGameState: gameState },
    }, { status: 200 });

  } catch (error) {
    console.error('Error simulating game:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to simulate game',
    }, { status: 500 });
  }
}

