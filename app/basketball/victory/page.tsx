'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loadGameState } from '@/lib/basketball/local-storage';
import { loadAchievementProgress } from '@/lib/basketball/achievements';
import { sortPlayersByPosition, calculateOverallRating } from '@/lib/basketball/utils';
import type { Player } from '@/lib/basketball/types';

export default function VictoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [gameState, setGameState] = useState<any>(null);
  const [achievements, setAchievements] = useState<any>(null);

  useEffect(() => {
    const state = loadGameState();
    const achievementData = loadAchievementProgress();
    
    if (!state) {
      router.push('/basketball');
      return;
    }
    
    setGameState(state);
    setAchievements(achievementData);
    setLoading(false);
  }, [router]);

  const handleContinuePlaying = () => {
    // Navigate to draft page to continue with next season
    router.push('/basketball/draft');
  };

  if (loading || !gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  const sortedPlayers = sortPlayersByPosition(gameState.players);
  const totalGames = gameState.game.wins + gameState.game.losses;
  const winPercentage = totalGames > 0 ? Math.round((gameState.game.wins / totalGames) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Victory Banner */}
        <div className="text-center mb-12 animate-pulse">
          <h1 className="text-8xl font-bold text-white mb-4 drop-shadow-2xl">
            🏆 CHAMPIONS! 🏆
          </h1>
          <p className="text-4xl font-bold text-white drop-shadow-lg">
            {gameState.game.team_name}
          </p>
          <p className="text-2xl text-white mt-2">
            Season {gameState.game.season_number} Champions
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-2xl p-6 text-center">
            <div className="text-4xl mb-2">🏀</div>
            <div className="text-3xl font-bold text-gray-800">{gameState.game.season_number}</div>
            <div className="text-gray-600">Seasons Played</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-2xl p-6 text-center">
            <div className="text-4xl mb-2">📊</div>
            <div className="text-3xl font-bold text-gray-800">
              {gameState.game.wins}-{gameState.game.losses}
            </div>
            <div className="text-gray-600">Season Record ({winPercentage}%)</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-2xl p-6 text-center">
            <div className="text-4xl mb-2">💰</div>
            <div className="text-3xl font-bold text-gray-800">{gameState.game.coins}</div>
            <div className="text-gray-600">Coins</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-2xl p-6 text-center">
            <div className="text-4xl mb-2">🏆</div>
            <div className="text-3xl font-bold text-gray-800">
              {gameState.game.championships_won || 1}
            </div>
            <div className="text-gray-600">Championships</div>
          </div>
        </div>

        {/* Championship Roster */}
        <div className="bg-white rounded-lg shadow-2xl p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            🌟 Championship Roster 🌟
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedPlayers.map((player: Player) => {
              const overall = calculateOverallRating(player);
              return (
                <div key={player.id} className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border-2 border-yellow-400">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-bold text-gray-800 text-lg">{player.name}</div>
                      <div className="text-sm text-gray-600">{player.position} • Age {player.age}</div>
                    </div>
                    <div className="text-2xl font-bold text-yellow-600">{overall}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs text-gray-600">
                    <div>OUT-O: {player.outside_offense}</div>
                    <div>IN-O: {player.inside_offense}</div>
                    <div>OUT-D: {player.outside_defense}</div>
                    <div>IN-D: {player.inside_defense}</div>
                    <div>PASS: {player.passing}</div>
                    <div>ATH: {player.athleticism}</div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {player.games_played} GP • {Math.round(player.total_points / Math.max(1, player.games_played))} PPG
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hall of Fame */}
        {gameState.hallOfFame && gameState.hallOfFame.length > 0 && (
          <div className="bg-white rounded-lg shadow-2xl p-8 mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
              🎖️ Hall of Fame
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gameState.hallOfFame.slice(0, 6).map((player: any, index: number) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <div className="font-bold text-gray-800">{player.name}</div>
                  <div className="text-sm text-gray-600">{player.position} • Retired at {player.age}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {player.games_played} GP • {player.total_points} PTS • {player.total_assists} AST • {player.total_rebounds} REB
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Achievements */}
        {achievements && achievements.unlockedAchievements.length > 0 && (
          <div className="bg-white rounded-lg shadow-2xl p-8 mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
              🏆 Achievements Unlocked
            </h2>
            <div className="text-center text-2xl font-bold text-gray-800 mb-4">
              {achievements.unlockedAchievements.length} / {Object.keys(require('@/lib/basketball/achievements').ACHIEVEMENTS).length}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {achievements.unlockedAchievements.slice(0, 12).map((id: string) => {
                const achievement = require('@/lib/basketball/achievements').ACHIEVEMENTS[id];
                return achievement ? (
                  <div key={id} className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-4xl mb-1">{achievement.icon}</div>
                    <div className="text-xs font-semibold text-gray-800">{achievement.name}</div>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <button
            onClick={handleContinuePlaying}
            className="px-12 py-6 bg-green-600 hover:bg-green-700 text-white text-2xl font-bold rounded-lg shadow-2xl transition-colors"
          >
            Continue Playing →
          </button>
          
          <Link
            href="/basketball"
            className="px-12 py-6 bg-blue-600 hover:bg-blue-700 text-white text-2xl font-bold rounded-lg shadow-2xl transition-colors text-center"
          >
            Return to Hub
          </Link>
        </div>

        <p className="text-center text-white mt-8 text-lg">
          Keep playing to unlock more achievements and build your dynasty!
        </p>
      </div>
    </div>
  );
}

