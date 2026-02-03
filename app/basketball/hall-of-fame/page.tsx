'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getHallOfFame } from '@/lib/basketball/local-storage';
import type { RetiredPlayer } from '@/lib/basketball/types';
import Link from 'next/link';
import HexagonStats from '@/components/HexagonStats';
import PlayerAvatar from '@/components/PlayerAvatar';
import { calculateOverallRating } from '@/lib/basketball/utils';

export default function HallOfFamePage() {
  const router = useRouter();
  const [hallOfFame, setHallOfFame] = useState<RetiredPlayer[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<RetiredPlayer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const players = getHallOfFame();
    // Sort by total points (descending)
    const sortedPlayers = [...players].sort((a, b) => b.total_points - a.total_points);
    setHallOfFame(sortedPlayers);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-600 via-yellow-500 to-orange-500 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-600 via-yellow-500 to-orange-500 p-8">
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
            <h1 className="text-4xl font-bold text-gray-800 mb-2">🏆 Hall of Fame 🏆</h1>
            <p className="text-gray-600">
              Honoring the legends who have retired from your team
            </p>
          </div>
        </div>

        {hallOfFame.length === 0 ? (
          <div className="bg-white rounded-lg shadow-xl p-8 text-center">
            <p className="text-gray-600 text-lg">
              No players have retired yet. Complete a season to see your first Hall of Fame inductees!
            </p>
          </div>
        ) : (
          <>
            {/* Hall of Fame Stats Table */}
            <div className="bg-white rounded-lg shadow-xl p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">All-Time Greats</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left py-2 px-3">Rank</th>
                      <th className="text-left py-2 px-3">Player</th>
                      <th className="text-center py-2 px-3">Pos</th>
                      <th className="text-center py-2 px-3">OVR</th>
                      <th className="text-center py-2 px-3">Stats</th>
                      <th className="text-center py-2 px-3">Seasons</th>
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
                    {hallOfFame.map((player, index) => {
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
                        <tr
                          key={player.id}
                          className="border-b border-gray-200 hover:bg-yellow-50 cursor-pointer"
                          onClick={() => setSelectedPlayer(player)}
                        >
                          <td className="py-3 px-3 font-bold text-yellow-600">#{index + 1}</td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-3">
                              <PlayerAvatar
                                player={player as any}
                                size={40}
                              />
                              <div className="font-semibold">{player.name}</div>
                            </div>
                          </td>
                          <td className="text-center py-3 px-3">{player.position}</td>
                          <td className="text-center py-3 px-3 font-bold">{calculateOverallRating(player as any)}</td>
                          <td className="py-3 px-3">
                            <div className="flex justify-center">
                              <HexagonStats
                                stats={{
                                  outsideOffense: player.outside_offense,
                                  insideOffense: player.inside_offense,
                                  passing: player.passing,
                                  outsideDefense: player.outside_defense,
                                  insideDefense: player.inside_defense,
                                  athleticism: player.athleticism,
                                }}
                                size="small"
                              />
                            </div>
                          </td>
                          <td className="text-center py-3 px-3">{player.seasons_played}</td>
                          <td className="text-center py-3 px-3">{player.games_played}</td>
                          <td className="text-center py-3 px-3 font-bold text-blue-600">{ppg}</td>
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

            {/* Selected Player Details */}
            {selectedPlayer && (
              <div className="bg-white rounded-lg shadow-xl p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Player Details</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column - Avatar and Basic Info */}
                  <div>
                    <div className="flex items-start gap-6 mb-6">
                      <PlayerAvatar
                        player={selectedPlayer as any}
                        size={120}
                      />
                      <div>
                        <h3 className="text-3xl font-bold text-gray-800 mb-2">{selectedPlayer.name}</h3>
                        <div className="space-y-1 text-gray-600">
                          <p><span className="font-semibold">Position:</span> {selectedPlayer.position}</p>
                          <p><span className="font-semibold">Retired at Age:</span> {selectedPlayer.age}</p>
                          <p><span className="font-semibold">Overall Rating:</span> {calculateOverallRating(selectedPlayer as any)}</p>
                          <p><span className="font-semibold">Seasons Played:</span> {selectedPlayer.seasons_played}</p>
                        </div>
                      </div>
                    </div>

                    {/* Career Stats */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-bold text-gray-800 mb-3">Career Statistics</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-2xl font-bold text-blue-600">
                            {selectedPlayer.games_played > 0 
                              ? (selectedPlayer.total_points / selectedPlayer.games_played).toFixed(1)
                              : '0.0'}
                          </div>
                          <div className="text-sm text-gray-600">Points Per Game</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-600">
                            {selectedPlayer.games_played > 0 
                              ? (selectedPlayer.total_rebounds / selectedPlayer.games_played).toFixed(1)
                              : '0.0'}
                          </div>
                          <div className="text-sm text-gray-600">Rebounds Per Game</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-purple-600">
                            {selectedPlayer.games_played > 0 
                              ? (selectedPlayer.total_assists / selectedPlayer.games_played).toFixed(1)
                              : '0.0'}
                          </div>
                          <div className="text-sm text-gray-600">Assists Per Game</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-gray-800">{selectedPlayer.games_played}</div>
                          <div className="text-sm text-gray-600">Games Played</div>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-300">
                        <h5 className="font-semibold text-gray-700 mb-2">Career Totals</h5>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <div className="font-bold text-gray-800">{selectedPlayer.total_points}</div>
                            <div className="text-gray-600">Points</div>
                          </div>
                          <div>
                            <div className="font-bold text-gray-800">{selectedPlayer.total_rebounds}</div>
                            <div className="text-gray-600">Rebounds</div>
                          </div>
                          <div>
                            <div className="font-bold text-gray-800">{selectedPlayer.total_assists}</div>
                            <div className="text-gray-600">Assists</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Attributes and Skills */}
                  <div>
                    <div className="mb-6">
                      <h4 className="font-bold text-gray-800 mb-3">Final Attributes</h4>
                      <HexagonStats
                        stats={{
                          outsideOffense: selectedPlayer.outside_offense,
                          insideOffense: selectedPlayer.inside_offense,
                          passing: selectedPlayer.passing,
                          outsideDefense: selectedPlayer.outside_defense,
                          insideDefense: selectedPlayer.inside_defense,
                          athleticism: selectedPlayer.athleticism,
                        }}
                        size="large"
                      />
                    </div>

                    {selectedPlayer.skills.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <h4 className="font-bold text-gray-800 mb-3">Skills Mastered</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedPlayer.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedPlayer.characteristics.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-bold text-gray-800 mb-3">Personality</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedPlayer.characteristics.map((char, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                            >
                              {char}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Hint */}
        <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 mt-8">
          <h3 className="font-semibold mb-2">💡 About Hall of Fame</h3>
          <p className="text-sm text-gray-300">
            Players who retire at age 21 are automatically inducted into your Hall of Fame.
            View their career stats and remember your greatest players. Hall of Fame persists across all your games.
          </p>
        </div>
      </div>
    </div>
  );
}

