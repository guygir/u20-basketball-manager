import { NextResponse } from 'next/server';
import {
  trainPlayerGeneral,
  trainPlayerFocused,
  restTeam,
  publicRelations,
  scoutOpponent,
  ActionResult,
} from '@/lib/basketball/action-handler';
import { Player, GameSave, Opponent } from '@/lib/basketball/types';
import { generateOpponent } from '@/lib/basketball/opponent-generator';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { actionType, gameState, players, playerId, attribute, opponent } = body;

    // Validate required fields
    if (!actionType || !gameState || !players) {
      return NextResponse.json(
        { error: 'Missing required fields: actionType, gameState, players' },
        { status: 400 }
      );
    }

    // Validate actions remaining
    if (gameState.actions_remaining <= 0) {
      return NextResponse.json(
        { error: 'No actions remaining this week' },
        { status: 400 }
      );
    }

    let result: ActionResult;

    switch (actionType) {
      case 'train_general': {
        // Find the player
        if (!playerId) {
          return NextResponse.json(
            { error: 'playerId required for training' },
            { status: 400 }
          );
        }

        const player = players.find((p: Player) => p.id === playerId);
        if (!player) {
          return NextResponse.json(
            { error: 'Player not found' },
            { status: 404 }
          );
        }

        result = trainPlayerGeneral({ player, gameState });
        break;
      }

      case 'train_focused': {
        // Find the player
        if (!playerId || !attribute) {
          return NextResponse.json(
            { error: 'playerId and attribute required for focused training' },
            { status: 400 }
          );
        }

        const player = players.find((p: Player) => p.id === playerId);
        if (!player) {
          return NextResponse.json(
            { error: 'Player not found' },
            { status: 404 }
          );
        }

        // Validate attribute
        const validAttributes = [
          'outside_offense',
          'inside_offense',
          'passing',
          'outside_defense',
          'inside_defense',
          'athleticism',
        ];
        if (!validAttributes.includes(attribute)) {
          return NextResponse.json(
            { error: 'Invalid attribute' },
            { status: 400 }
          );
        }

        result = trainPlayerFocused({ player, attribute, gameState });
        break;
      }

      case 'rest': {
        result = restTeam({ players, gameState });
        break;
      }

      case 'public_relations': {
        result = publicRelations({ gameState });
        break;
      }

      case 'scout': {
        // Generate or use provided opponent
        let opponentToScout: Opponent;
        
        if (opponent) {
          opponentToScout = opponent;
        } else {
          // Generate opponent for current week
          opponentToScout = generateOpponent(
            gameState.week_number,
            gameState.difficulty
          );
        }

        result = scoutOpponent({ opponent: opponentToScout, gameState });
        break;
      }

      default:
        return NextResponse.json(
          { error: `Unknown action type: ${actionType}` },
          { status: 400 }
        );
    }

    // Return the result
    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      updatedPlayers: result.updatedPlayers,
      updatedGameState: result.updatedGameState,
      scoutedOpponent: result.scoutedOpponent,
    });
  } catch (error) {
    console.error('Actions API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

