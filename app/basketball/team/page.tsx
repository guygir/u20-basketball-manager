'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GameSave, Player } from '@/lib/basketball/types';
import { getCurrentGame, getPlayers } from '@/lib/basketball/local-storage';
import PlayerCard from '@/components/PlayerCard';
import Link from 'next/link';
import { PageTutorialOverlay } from '@/components/Tutorial';
import { sortPlayersByPosition, calculateOverallRating } from '@/lib/basketball/utils';
import { GAME_CONSTANTS } from '@/lib/basketball/constants';
import HexagonStats from '@/components/HexagonStats';
import PlayerAvatar from '@/components/PlayerAvatar';
import { CHARACTERISTICS, type Characteristic, calculatePairChemistry } from '@/lib/basketball/chemistry';

export default function TeamPage() {
  const router = useRouter();
  const [game, setGame] = useState<GameSave | null>(null);
  const [roster, setRoster] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentGame = getCurrentGame();
    if (!currentGame) {
      router.push('/basketball');
      return;
    }
    const players = getPlayers(currentGame.id);
    setGame(currentGame);
    setRoster(sortPlayersByPosition(players));
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  if (!game) {
    return null;
  }

  // Calculate team stats
  const teamOverall = roster.length > 0 ? Math.round(
    roster.reduce((sum: number, player: Player) => {
      const playerOverall =
        (player.outside_offense +
          player.inside_offense +
          player.outside_defense +
          player.inside_defense +
          player.passing +
          player.athleticism) /
        6;
      return sum + playerOverall;
    }, 0) / roster.length
  ) : 0;

  const avgFatigue = roster.length > 0 ? Math.round(
    roster.reduce((sum: number, player: Player) => sum + player.fatigue, 0) / roster.length
  ) : 0;

  return (
    <>
      <PageTutorialOverlay pageName="team" />
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-blue-600 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/basketball"
            className="inline-block mb-4 text-white hover:text-gray-200 transition-colors"
          >
            ← Back to Hub
          </Link>
          <div className="bg-white rounded-lg shadow-xl p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold text-gray-800 mb-2">{game.team_name}</h1>
                <p className="text-gray-600">
                  Season {game.season_number} •
                  {game.week_number <= GAME_CONSTANTS.REGULAR_SEASON_WEEKS && ` Week ${game.week_number}/${GAME_CONSTANTS.REGULAR_SEASON_WEEKS} (Regular Season)`}
                  {game.week_number === GAME_CONSTANTS.BALANCE.PLAYOFF.QUARTERFINALS_WEEK && ` Week ${game.week_number} (Quarterfinals)`}
                  {game.week_number === GAME_CONSTANTS.BALANCE.PLAYOFF.SEMIFINALS_WEEK && ` Week ${game.week_number} (Semifinals)`}
                  {game.week_number === GAME_CONSTANTS.BALANCE.PLAYOFF.FINALS_WEEK && ` Week ${game.week_number} (Finals)`}
                </p>
              </div>
              <div className="text-right">
                <div className="text-5xl font-bold text-blue-600">{teamOverall}</div>
                <div className="text-sm text-gray-600">Team Overall</div>
              </div>
            </div>

            {/* Team Stats */}
            <div className="grid grid-cols-4 gap-4 mt-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-gray-800">{game.wins}-{game.losses}</div>
                <div className="text-sm text-gray-600">Record</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-gray-800">{game.coins}</div>
                <div className="text-sm text-gray-600">Coins</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-gray-800">{avgFatigue}%</div>
                <div className="text-sm text-gray-600">Avg Fatigue</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-gray-800">{game.actions_remaining}</div>
                <div className="text-sm text-gray-600">Actions Left</div>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Improvements Summary */}
        {roster.some(p => p.weekly_improvements && Object.keys(p.weekly_improvements).length > 0) && (
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">This Week's Training Summary</h2>
              <div className="space-y-3">
                {roster.map((player) => {
                  if (!player.weekly_improvements || Object.keys(player.weekly_improvements).length === 0) {
                    return null;
                  }
                  
                  const improvements = [];
                  const attrs = ['outside_offense', 'inside_offense', 'passing', 'outside_defense', 'inside_defense', 'athleticism'] as const;
                  
                  for (const attr of attrs) {
                    const improvement = player.weekly_improvements[attr];
                    if (improvement && improvement > 0) {
                      const baseValue = player[attr] - improvement;
                      improvements.push(
                        <span key={attr} className="inline-block mr-4">
                          <span className="text-gray-600">{attr.replace(/_/g, ' ')}: </span>
                          <span className="font-medium">{baseValue}</span>
                          <span className="text-green-600 font-bold"> +{improvement}</span>
                          <span className="text-gray-400"> → {player[attr]}</span>
                        </span>
                      );
                    }
                  }
                  
                  if (improvements.length === 0) return null;
                  
                  return (
                    <div key={player.id} className="bg-gray-50 p-3 rounded-lg">
                      <div className="font-bold text-gray-800 mb-2">{player.name} ({player.position})</div>
                      <div className="text-sm flex flex-wrap gap-y-1">
                        {improvements}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Roster */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-6">Your Roster</h2>
          {roster.length === 0 ? (
            <div className="bg-white rounded-lg shadow-xl p-8 text-center">
              <p className="text-gray-600">No players in roster</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {[...roster]
                .sort((a, b) => {
                  // Sort by position: PG, SG, SF, PF, C
                  const positionOrder = { PG: 1, SG: 2, SF: 3, PF: 4, C: 5 };
                  return positionOrder[a.position] - positionOrder[b.position];
                })
                .map((player: Player) => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    onSelect={setSelectedPlayer}
                    selected={selectedPlayer?.id === player.id}
                    showDetails={false}
                  />
                ))}
            </div>
          )}
        </div>

        {/* Player Details Modal */}
        {selectedPlayer && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedPlayer(null)}
          >
            <div
              className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-lg">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <PlayerAvatar
                      player={selectedPlayer}
                      size={80}
                      className="ring-4 ring-white/30"
                    />
                    <div>
                      <h2 className="text-3xl font-bold">{selectedPlayer.name}</h2>
                      <p className="text-lg opacity-90">
                        {selectedPlayer.position} • Age {selectedPlayer.age} • Overall {calculateOverallRating(selectedPlayer)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedPlayer(null)}
                    className="text-white hover:text-gray-200 text-3xl font-bold leading-none"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* Hexagon Stats */}
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Attributes</h3>
                  <div className="flex justify-center">
                    <HexagonStats
                      stats={{
                        outsideOffense: selectedPlayer.outside_offense,
                        insideOffense: selectedPlayer.inside_offense,
                        outsideDefense: selectedPlayer.outside_defense,
                        insideDefense: selectedPlayer.inside_defense,
                        passing: selectedPlayer.passing,
                        athleticism: selectedPlayer.athleticism,
                      }}
                      size="large"
                    />
                  </div>
                </div>

                {/* Personality */}
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Personality</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {selectedPlayer.characteristics && selectedPlayer.characteristics.length > 0 ? (
                      <div className="space-y-3">
                        {selectedPlayer.characteristics.map((charId: string) => {
                          const char = CHARACTERISTICS[charId as Characteristic];
                          return (
                            <div key={charId} className="flex items-start gap-3">
                              <span className="text-3xl">{char.emoji}</span>
                              <div className="flex-1">
                                <div className="font-bold text-gray-800">{char.name}</div>
                                <div className="text-sm text-gray-600">{char.description}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-gray-600">No personality traits</p>
                    )}
                  </div>
                </div>

                {/* Chemistry Preferences */}
                {selectedPlayer.characteristics && selectedPlayer.characteristics.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Chemistry</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Likes */}
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="font-bold text-green-800 mb-2">✓ Likes</div>
                        <div className="space-y-1">
                          {selectedPlayer.characteristics.flatMap((charId: string) => {
                            const char = CHARACTERISTICS[charId as Characteristic];
                            return char.likes.map(likeId => {
                              const likedChar = CHARACTERISTICS[likeId];
                              return (
                                <div key={`${charId}-${likeId}`} className="text-sm text-green-700">
                                  {likedChar.emoji} {likedChar.name}
                                </div>
                              );
                            });
                          })}
                        </div>
                      </div>

                      {/* Dislikes */}
                      <div className="bg-red-50 rounded-lg p-4">
                        <div className="font-bold text-red-800 mb-2">✗ Dislikes</div>
                        <div className="space-y-1">
                          {selectedPlayer.characteristics.flatMap((charId: string) => {
                            const char = CHARACTERISTICS[charId as Characteristic];
                            return char.dislikes.map(dislikeId => {
                              const dislikedChar = CHARACTERISTICS[dislikeId];
                              return (
                                <div key={`${charId}-${dislikeId}`} className="text-sm text-red-700">
                                  {dislikedChar.emoji} {dislikedChar.name}
                                </div>
                              );
                            });
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Team Chemistry */}
                {selectedPlayer.characteristics && selectedPlayer.characteristics.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Team Chemistry</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-gray-600 text-sm mb-2">Chemistry with teammates</div>
                      <div className="text-3xl font-bold text-gray-800">
                        {(() => {
                          const otherPlayers = roster.filter((p: Player) => p.id !== selectedPlayer.id);
                          if (otherPlayers.length === 0) return 'N/A';
                          
                          let totalChemistry = 0;
                          otherPlayers.forEach((teammate: Player) => {
                            totalChemistry += calculatePairChemistry(
                              (selectedPlayer.characteristics || []) as Characteristic[],
                              (teammate.characteristics || []) as Characteristic[]
                            );
                          });
                          
                          const avgChemistry = totalChemistry / otherPlayers.length;
                          const sign = avgChemistry > 0 ? '+' : '';
                          const color = avgChemistry > 0 ? 'text-green-600' : avgChemistry < 0 ? 'text-red-600' : 'text-gray-800';
                          
                          return (
                            <span className={color}>
                              {sign}{avgChemistry.toFixed(1)}
                            </span>
                          );
                        })()}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Average chemistry bonus with {roster.filter((p: Player) => p.id !== selectedPlayer.id).length} teammates
                      </div>
                    </div>
                  </div>
                )}

                {/* Additional Stats */}
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Status</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-gray-600 text-sm">Fatigue</div>
                      <div className="text-2xl font-bold text-gray-800">{selectedPlayer.fatigue}%</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-gray-600 text-sm">Games Played</div>
                      <div className="text-2xl font-bold text-gray-800">{selectedPlayer.games_played || 0}</div>
                    </div>
                  </div>
                </div>

                {/* Career Stats */}
                {!!(selectedPlayer.total_points || selectedPlayer.total_assists || selectedPlayer.total_rebounds) && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Career Stats</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-gray-800">{selectedPlayer.total_points || 0}</div>
                        <div className="text-sm text-gray-600">Points</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-gray-800">{selectedPlayer.total_assists || 0}</div>
                        <div className="text-sm text-gray-600">Assists</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-gray-800">{selectedPlayer.total_rebounds || 0}</div>
                        <div className="text-sm text-gray-600">Rebounds</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Season Stats */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Season Stats</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-2 px-3">Player</th>
                    <th className="text-center py-2 px-3">GP</th>
                    <th className="text-center py-2 px-3">PPG</th>
                    <th className="text-center py-2 px-3">RPG</th>
                    <th className="text-center py-2 px-3">APG</th>
                    <th className="text-center py-2 px-3">Total PTS</th>
                    <th className="text-center py-2 px-3">Total REB</th>
                    <th className="text-center py-2 px-3">Total AST</th>
                  </tr>
                </thead>
                <tbody>
                  {[...roster]
                    .sort((a, b) => {
                      const positionOrder = { PG: 1, SG: 2, SF: 3, PF: 4, C: 5 };
                      return positionOrder[a.position] - positionOrder[b.position];
                    })
                    .map((player) => {
                      const ppg = player.games_played > 0
                        ? (player.total_points / player.games_played).toFixed(1)
                        : '0.0';
                      const rpg = player.games_played > 0
                        ? (player.total_rebounds / player.games_played).toFixed(1)
                        : '0.0';
                      const apg = player.games_played > 0
                        ? (player.total_assists / player.games_played).toFixed(1)
                        : '0.0';
                      
                      return (
                        <tr key={player.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="py-3 px-3">
                            <div className="font-semibold">{player.name}</div>
                            <div className="text-sm text-gray-600">{player.position}</div>
                          </td>
                          <td className="text-center py-3 px-3">{player.games_played}</td>
                          <td className="text-center py-3 px-3 font-bold">{ppg}</td>
                          <td className="text-center py-3 px-3">{rpg}</td>
                          <td className="text-center py-3 px-3">{apg}</td>
                          <td className="text-center py-3 px-3 text-sm text-gray-600">{player.total_points}</td>
                          <td className="text-center py-3 px-3 text-sm text-gray-600">{player.total_rebounds}</td>
                          <td className="text-center py-3 px-3 text-sm text-gray-600">{player.total_assists}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Hint */}
        <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 mt-8">
          <h3 className="font-semibold mb-2">💡 About Your Team</h3>
          <p className="text-sm text-gray-300">
            Players age from 18 to 21, retiring after 3 seasons. Train younger players more effectively.
            Monitor fatigue levels - tired players perform worse in games. Overall rating is calculated from all six attributes.
          </p>
        </div>
      </div>
    </div>
    </>
  );
}

