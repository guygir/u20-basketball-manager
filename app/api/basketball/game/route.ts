// API route for basketball game management (Local MVP version)
// Uses localStorage instead of Supabase

import { NextRequest, NextResponse } from 'next/server';
import type { CreateGameRequest, CreateGameResponse, ApiResponse } from '@/lib/basketball/types';
import { createNewGame, getCurrentGame, hasActiveGame } from '@/lib/basketball/local-storage';
import { generateStartingRoster } from '@/lib/basketball/player-generator';
import { GAME_CONSTANTS } from '@/lib/basketball/constants';

// GET - Get current active game
export async function GET(request: NextRequest) {
  try {
    const game = getCurrentGame();
    
    if (!game) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'No active game found',
      }, { status: 404 });
    }
    
    return NextResponse.json<ApiResponse>({
      success: true,
      data: { game },
    });
  } catch (error) {
    console.error('Error getting game:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to get game',
    }, { status: 500 });
  }
}

// POST - Create new game
export async function POST(request: NextRequest) {
  try {
    const body: CreateGameRequest = await request.json();
    const { team_name, difficulty } = body;
    
    // Validate input
    if (!team_name || team_name.trim().length === 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Team name is required',
      }, { status: 400 });
    }
    
    if (!['easy', 'normal', 'hard'].includes(difficulty)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid difficulty level',
      }, { status: 400 });
    }
    
    // Check if there's already an active game
    if (hasActiveGame()) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'An active game already exists. Delete it first to create a new one.',
      }, { status: 409 });
    }
    
    // Create new game state
    const gameState = createNewGame(
      {
        user_id: 'local-user', // For local MVP, we use a fixed user ID
        season_number: 1,
        week_number: 1,
        is_active: true,
        wins: 0,
        losses: 0,
        win_streak: 0,
        playoff_round: null,
        coins: GAME_CONSTANTS.STARTING_COINS,
        actions_remaining: GAME_CONSTANTS.ACTIONS_PER_WEEK,
        team_name: team_name.trim(),
        difficulty,
        facilities: {
          stadium: 0,
          training: 0,
          medical: 0,
          scouting: 0,
        },
        owned_tactics: [],
        active_tactics: [],
        milestones_achieved: [],
      },
      generateStartingRoster('temp-id').map(p => ({
        ...p,
        game_save_id: undefined as any, // Will be set by createNewGame
      })),
      {
        gym_level: 0,
        court_level: 0,
        medical_level: 0,
        analytics_level: 0,
      }
    );
    
    const response: CreateGameResponse = {
      game: gameState.game,
      players: gameState.players,
      facilities: gameState.facilities,
    };
    
    return NextResponse.json<ApiResponse<CreateGameResponse>>({
      success: true,
      data: response,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating game:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to create game',
    }, { status: 500 });
  }
}

// DELETE - Delete current game
export async function DELETE(request: NextRequest) {
  try {
    const { clearGameState } = await import('@/lib/basketball/local-storage');
    
    clearGameState();
    
    return NextResponse.json<ApiResponse>({
      success: true,
      data: { message: 'Game deleted successfully' },
    });
  } catch (error) {
    console.error('Error deleting game:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to delete game',
    }, { status: 500 });
  }
}

