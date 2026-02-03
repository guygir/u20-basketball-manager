'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentGame, getPlayers } from '@/lib/basketball/local-storage';
import type { GameSave, Player } from '@/lib/basketball/types';
import Link from 'next/link';
import { PageTutorialOverlay } from '@/components/Tutorial';
import { sortPlayersByPosition, getPositionLabel } from '@/lib/basketball/utils';
import { checkAchievements, ACHIEVEMENTS } from '@/lib/basketball/achievements';
import { GAME_CONSTANTS } from '@/lib/basketball/constants';

export default function SimulatePage() {
  const router = useRouter();
  const [game, setGame] = useState<GameSave | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const currentGame = getCurrentGame();
    if (!currentGame) {
      router.push('/basketball');
      return;
    }
    
    const roster = getPlayers(currentGame.id);
    const sortedRoster = sortPlayersByPosition(roster);
    setGame(currentGame);
    setPlayers(sortedRoster);
    setLoading(false);
  }, [router]);

  const handleSimulate = async () => {
    if (!game) return;

    setSimulating(true);
    setError(null);

    try {
      // Load complete game state from localStorage
      const gameStateStr = localStorage.getItem('basketball_roguelike_game');
      if (!gameStateStr) {
        setError('Game state not found');
        setSimulating(false);
        return;
      }

      const gameState = JSON.parse(gameStateStr);

      const response = await fetch('/api/basketball/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameState }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Failed to simulate game');
        return;
      }

      // Save updated game state to localStorage
      if (data.data.updatedGameState) {
        localStorage.setItem('basketball_roguelike_game', JSON.stringify(data.data.updatedGameState));
        
        // Check for achievements on client side (after game state is saved)
        const newAchievements = checkAchievements({
          wins: data.data.updatedGameState.game.wins,
          winStreak: data.data.updatedGameState.game.win_streak,
          coins: data.data.updatedGameState.game.coins,
          difficulty: data.data.updatedGameState.game.difficulty,
          seasonNumber: data.data.updatedGameState.game.season_number,
          weekNumber: data.data.updatedGameState.game.week_number,
          facilities: data.data.updatedGameState.game.facilities,
          ownedTactics: data.data.updatedGameState.game.owned_tactics,
          players: data.data.updatedGameState.players,
        });
        
        // Add achievements to result for display
        if (newAchievements.length > 0) {
          data.data.achievementsUnlocked = newAchievements.map(id => {
            const achievement = ACHIEVEMENTS[id];
            return {
              id: achievement.id,
              name: achievement.name,
              description: achievement.description,
              icon: achievement.icon,
            };
          });
        }
      }

      // If season complete, save season end data for draft page
      if (data.data.seasonComplete && data.data.seasonEndData) {
        localStorage.setItem('basketball_season_end_data', JSON.stringify(data.data.seasonEndData));
      }

      setResult(data.data);
    } catch (err) {
      console.error('Error simulating game:', err);
      setError('Failed to simulate game');
    } finally {
      setSimulating(false);
    }
  };

  const handleContinue = () => {
    if (result?.championshipWon) {
      // Navigate to victory screen for championship celebration
      router.push('/basketball/victory');
    } else if (result?.seasonComplete) {
      // Navigate to draft page for season end
      router.push('/basketball/draft');
    } else {
      // Go back to hub for next week
      router.push('/basketball');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-700 to-red-600 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  if (!game) {
    return null;
  }

  // Determine if this is a playoff game
  const isPlayoffs = game.week_number >= GAME_CONSTANTS.BALANCE.PLAYOFF.QUARTERFINALS_WEEK;
  const playoffRound =
    game.week_number === GAME_CONSTANTS.BALANCE.PLAYOFF.QUARTERFINALS_WEEK ? 'Quarterfinals' :
    game.week_number === GAME_CONSTANTS.BALANCE.PLAYOFF.SEMIFINALS_WEEK ? 'Semifinals' :
    game.week_number === GAME_CONSTANTS.BALANCE.PLAYOFF.FINALS_WEEK ? 'Championship Finals' :
    null;

  return (
    <>
      <PageTutorialOverlay pageName="simulate" />
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-700 to-red-600 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Playoff Banner */}
        {isPlayoffs && (
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg shadow-2xl p-6 mb-6 border-4 border-yellow-300">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-white mb-2 animate-pulse">
                🏆 PLAYOFFS - {playoffRound} 🏆
              </h2>
              <p className="text-white text-xl font-semibold">
                Win or Go Home! This is elimination basketball!
              </p>
            </div>
          </div>
        )}
        
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/basketball"
            className="inline-block mb-4 text-white hover:text-gray-200 transition-colors"
          >
            ← Back to Hub
          </Link>
          <div className="bg-white rounded-lg shadow-xl p-6">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              {isPlayoffs ? `${playoffRound} Game` : `Week ${game.week_number} Game`}
            </h1>
            <p className="text-gray-600">
              Season {game.season_number} • {game.team_name}
              {isPlayoffs && ' • PLAYOFFS'}
            </p>
          </div>
        </div>

        {/* Pre-game or Results */}
        {!result ? (
          <div className="bg-white rounded-lg shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Ready to Play?</h2>
            
            {/* Team Status */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Your Team</h3>
              <div className="grid grid-cols-1 gap-2">
                {players.map((player) => (
                  <div key={player.id} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                    <div>
                      <span className="font-semibold">{player.name}</span>
                      <span className="text-gray-600 ml-2">({getPositionLabel(players, player)})</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Fatigue: {player.fatigue}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <button
              onClick={handleSimulate}
              disabled={simulating}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-lg transition-colors text-xl"
            >
              {simulating ? 'Simulating Game...' : 'Play Game'}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Final Score */}
            <div className="bg-white rounded-lg shadow-xl p-8">
              <h2 className="text-3xl font-bold text-center mb-6">
                {result.won ? (
                  <span className="text-green-600">Victory! 🏆</span>
                ) : (
                  <span className="text-red-600">Defeat</span>
                )}
              </h2>
              
              <div className="flex justify-center items-center gap-8 mb-6">
                <div className="text-center">
                  <div className="text-gray-600 mb-2">{game.team_name}</div>
                  <div className="text-5xl font-bold text-blue-600">{result.playerScore}</div>
                </div>
                <div className="text-3xl text-gray-400">-</div>
                <div className="text-center">
                  <div className="text-gray-600 mb-2">{result.opponentName}</div>
                  <div className="text-5xl font-bold text-red-600">{result.opponentScore}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-6 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">+{result.coinsEarned}</div>
                  <div className="text-sm text-gray-600">Coins Earned</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">{game.wins + (result.won ? 1 : 0)}-{game.losses + (result.won ? 0 : 1)}</div>
                  <div className="text-sm text-gray-600">Record</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">Week {result.newWeek}</div>
                  <div className="text-sm text-gray-600">Next Week</div>
                </div>
              </div>
            </div>

            {/* Player Stats */}
            <div className="bg-white rounded-lg shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Player Stats</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left py-2 px-3">Player</th>
                      <th className="text-center py-2 px-3">PTS</th>
                      <th className="text-center py-2 px-3">REB</th>
                      <th className="text-center py-2 px-3">AST</th>
                      <th className="text-center py-2 px-3">FG</th>
                      <th className="text-center py-2 px-3">3PT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {players.map((player) => {
                      const stats = result.playerStats[player.id];
                      if (!stats) return null;
                      
                      const fgPct = stats.fieldGoalsAttempted > 0
                        ? Math.round((stats.fieldGoalsMade / stats.fieldGoalsAttempted) * 100)
                        : 0;
                      const threePct = stats.threePointersAttempted > 0
                        ? Math.round((stats.threePointersMade / stats.threePointersAttempted) * 100)
                        : 0;
                      
                      return (
                        <tr key={player.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="py-3 px-3">
                            <div className="font-semibold">{player.name}</div>
                            <div className="text-sm text-gray-600">{getPositionLabel(players, player)}</div>
                          </td>
                          <td className="text-center py-3 px-3 font-bold">{stats.points}</td>
                          <td className="text-center py-3 px-3">{stats.rebounds}</td>
                          <td className="text-center py-3 px-3">{stats.assists}</td>
                          <td className="text-center py-3 px-3 text-sm">
                            {stats.fieldGoalsMade}/{stats.fieldGoalsAttempted}
                            <div className="text-gray-600">{fgPct}%</div>
                          </td>
                          <td className="text-center py-3 px-3 text-sm">
                            {stats.threePointersMade}/{stats.threePointersAttempted}
                            <div className="text-gray-600">{threePct}%</div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Achievement Notifications */}
            {result.achievementsUnlocked && result.achievementsUnlocked.length > 0 && (
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-xl p-6">
                <h3 className="text-2xl font-bold text-white text-center mb-4">
                  🎉 Achievements Unlocked! 🎉
                </h3>
                <div className="space-y-3">
                  {result.achievementsUnlocked.map((achievement: any) => (
                    <div key={achievement.id} className="bg-white rounded-lg p-4 flex items-center space-x-4">
                      <div className="text-4xl">{achievement.icon}</div>
                      <div>
                        <div className="font-bold text-gray-800 text-lg">{achievement.name}</div>
                        <div className="text-gray-600 text-sm">{achievement.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Season End Rewards */}
            {result.seasonComplete && result.seasonEndData && (
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg shadow-xl p-8">
                <h2 className="text-3xl font-bold text-white text-center mb-6">
                  🏆 Season {result.seasonEndData.newSeasonNumber - 1} Complete! 🏆
                </h2>
                
                <div className="bg-white rounded-lg p-6 mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Season Rewards</h3>
                  <div className="space-y-2">
                    {result.seasonEndData.seasonRewards.map((reward: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span className="text-gray-700">{reward.reason}</span>
                        <span className="text-green-600 font-bold">+{reward.coins} coins</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center p-3 bg-green-100 rounded border-2 border-green-500">
                      <span className="text-gray-800 font-bold">Total Earned</span>
                      <span className="text-green-600 font-bold text-xl">+{result.seasonEndData.totalCoinsEarned} coins</span>
                    </div>
                  </div>
                </div>

                {result.seasonEndData.retiringPlayers.length > 0 && (
                  <div className="bg-white rounded-lg p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Retiring Players</h3>
                    <div className="space-y-2">
                      {result.seasonEndData.retiringPlayers.map((player: any) => (
                        <div key={player.id} className="flex justify-between items-center p-3 bg-red-50 rounded">
                          <div>
                            <span className="font-bold text-gray-800">{player.name}</span>
                            <span className="text-gray-600 ml-2">({player.position})</span>
                          </div>
                          <span className="text-red-600">Age {player.age} - Retiring</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-gray-600 mt-4 text-center">
                      You'll draft {result.seasonEndData.draftProspects.length} new player{result.seasonEndData.draftProspects.length > 1 ? 's' : ''}
                      {result.seasonEndData.retiringPlayers.length > 0
                        ? ` (1 for new season + ${result.seasonEndData.retiringPlayers.length} to replace retiring player${result.seasonEndData.retiringPlayers.length > 1 ? 's' : ''})`
                        : ' for the new season'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Play by Play */}
            <div className="bg-white rounded-lg shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Play by Play</h3>
              <div className="max-h-96 overflow-y-auto bg-gray-50 p-4 rounded font-mono text-sm">
                {result.playByPlay.map((play: string, index: number) => (
                  <div key={index} className="mb-1">
                    {play}
                  </div>
                ))}
              </div>
            </div>

            {/* Continue Button */}
            <button
              onClick={handleContinue}
              className={`w-full font-bold py-4 px-6 rounded-lg transition-colors text-xl ${
                result.seasonComplete
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-gray-900'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {result.seasonComplete ? 'Proceed to Draft →' : 'Continue to Next Week'}
            </button>
          </div>
        )}
      </div>
    </div>
    </>
  );
}

