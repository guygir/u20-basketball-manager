'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { GameSave, Player, Facilities } from '@/lib/basketball/types';
import { TutorialButton, TutorialOverlay } from '@/components/Tutorial';
import { sortPlayersByPosition, calculateOverallRating, getPositionLabel } from '@/lib/basketball/utils';
import { GAME_CONSTANTS } from '@/lib/basketball/constants';
import PlayerAvatar from '@/components/PlayerAvatar';

export default function BasketballHub() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [game, setGame] = useState<GameSave | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [facilities, setFacilities] = useState<Facilities | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Form state for new game
  const [teamName, setTeamName] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal');

  // Load existing game on mount and when returning to this page
  useEffect(() => {
    loadGame();
  }, []);

  // Also reload when the page is shown (after navigation)
  useEffect(() => {
    const handleRouteChange = () => {
      loadGame();
    };

    // Listen for popstate (back/forward navigation)
    window.addEventListener('popstate', handleRouteChange);
    
    // Listen for page show (when returning to page)
    window.addEventListener('pageshow', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('pageshow', handleRouteChange);
    };
  }, []);

  const loadGame = () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load from localStorage
      const stored = localStorage.getItem('basketball_roguelike_game');
      if (stored) {
        const gameState = JSON.parse(stored);
        setGame(gameState.game);
        setPlayers(gameState.players);
        setFacilities(gameState.facilities);
      }
    } catch (err) {
      console.error('Error loading game:', err);
      setError('Failed to load game');
    } finally {
      setLoading(false);
    }
  };

  const createNewGame = async () => {
    if (!teamName.trim()) {
      setError('Please enter a team name');
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const response = await fetch('/api/basketball/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team_name: teamName, difficulty }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Failed to create game');
        return;
      }

      // Save to localStorage
      const gameState = {
        game: data.data.game,
        players: data.data.players,
        facilities: data.data.facilities,
      };
      localStorage.setItem('basketball_roguelike_game', JSON.stringify(gameState));

      // Update component state
      setGame(data.data.game);
      setPlayers(data.data.players);
      setFacilities(data.data.facilities);
      setTeamName('');
    } catch (err) {
      console.error('Error creating game:', err);
      setError('Failed to create game');
    } finally {
      setCreating(false);
    }
  };

  const deleteGame = async () => {
    if (!confirm('Are you sure you want to delete this game? This cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/api/basketball/game', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        // Clear achievements when deleting game (fresh start)
        localStorage.removeItem('basketball_achievements');
        console.log('[DELETE GAME] Cleared achievements for fresh start');
        
        setGame(null);
        setPlayers([]);
        setFacilities(null);
      }
    } catch (err) {
      console.error('Error deleting game:', err);
      setError('Failed to delete game');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold text-white mb-8 text-center">
          🏀 U20 Basketball Manager
        </h1>

        {error && (
          <div className="bg-red-500 text-white p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {!game ? (
          // No active game - show create game form (NO TUTORIAL HERE)
          <div className="bg-white rounded-lg shadow-xl p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Create New Game</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Team Name
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Enter your team name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={30}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Difficulty
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {(['easy', 'normal', 'hard'] as const).map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setDifficulty(diff)}
                      className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                        difficulty === diff
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {diff.charAt(0).toUpperCase() + diff.slice(1)}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {difficulty === 'easy' && '• Easier opponents, more coins, better training'}
                  {difficulty === 'normal' && '• Balanced gameplay for a fair challenge'}
                  {difficulty === 'hard' && '• Tougher opponents, fewer coins, slower training'}
                </p>
              </div>

              <button
                onClick={createNewGame}
                disabled={creating || !teamName.trim()}
                className="w-full px-6 py-4 bg-blue-600 text-white text-xl font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {creating ? 'Creating Game...' : 'Start New Season'}
              </button>
            </div>
          </div>
        ) : (
          // Active game exists - show game info with tutorial
          <>
            <TutorialOverlay />
            
            {/* Playoff Status Banner */}
            {game.week_number > GAME_CONSTANTS.REGULAR_SEASON_WEEKS ? (
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg shadow-xl p-6 mb-6">
                <div className="text-center">
                  <h3 className="text-3xl font-bold text-white mb-2">
                    🏆 PLAYOFFS 🏆
                  </h3>
                  <p className="text-white text-lg font-semibold">
                    {game.week_number === GAME_CONSTANTS.BALANCE.PLAYOFF.QUARTERFINALS_WEEK && 'Quarterfinals - Win or Go Home!'}
                    {game.week_number === GAME_CONSTANTS.BALANCE.PLAYOFF.SEMIFINALS_WEEK && 'Semifinals - One Step from Glory!'}
                    {game.week_number === GAME_CONSTANTS.BALANCE.PLAYOFF.FINALS_WEEK && 'CHAMPIONSHIP FINALS - This is it!'}
                  </p>
                </div>
              </div>
            ) : game.wins >= GAME_CONSTANTS.BALANCE.PLAYOFF.QUALIFICATION_WINS ? (
              <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-lg shadow-xl p-6 mb-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    ✅ Playoffs Clinched!
                  </h3>
                  <p className="text-white text-lg">
                    You've qualified for the playoffs! Keep winning to improve your seed.
                  </p>
                </div>
              </div>
            ) : game.week_number >= 9 ? (
              <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-lg shadow-xl p-6 mb-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    ⚠️ Playoff Race!
                  </h3>
                  <p className="text-white text-lg">
                    Need {GAME_CONSTANTS.BALANCE.PLAYOFF.QUALIFICATION_WINS - game.wins} more win{GAME_CONSTANTS.BALANCE.PLAYOFF.QUALIFICATION_WINS - game.wins !== 1 ? 's' : ''} to make the playoffs! ({GAME_CONSTANTS.BALANCE.PLAYOFF.QUARTERFINALS_WEEK - game.week_number} game{GAME_CONSTANTS.BALANCE.PLAYOFF.QUARTERFINALS_WEEK - game.week_number !== 1 ? 's' : ''} left)
                  </p>
                </div>
              </div>
            ) : null}
            
            <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-800">{game.team_name}</h2>
                <p className="text-gray-600 mt-1">
                  Season {game.season_number} •
                  {game.week_number <= GAME_CONSTANTS.REGULAR_SEASON_WEEKS && ` Week ${game.week_number}/${GAME_CONSTANTS.REGULAR_SEASON_WEEKS} (Regular Season)`}
                  {game.week_number === GAME_CONSTANTS.BALANCE.PLAYOFF.QUARTERFINALS_WEEK && ` Week ${game.week_number} (Quarterfinals)`}
                  {game.week_number === GAME_CONSTANTS.BALANCE.PLAYOFF.SEMIFINALS_WEEK && ` Week ${game.week_number} (Semifinals)`}
                  {game.week_number === GAME_CONSTANTS.BALANCE.PLAYOFF.FINALS_WEEK && ` Week ${game.week_number} (Finals)`}
                </p>
              </div>
              <button
                onClick={deleteGame}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Game
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Record</div>
                <div className="text-2xl font-bold text-gray-800">
                  {game.wins}-{game.losses}
                </div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Coins</div>
                <div className="text-2xl font-bold text-gray-800">
                  💰 {game.coins}
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Actions</div>
                <div className="text-2xl font-bold text-gray-800">
                  {game.actions_remaining}/3
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Difficulty</div>
                <div className="text-2xl font-bold text-gray-800 capitalize">
                  {game.difficulty}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Your Roster</h3>
              <div className="space-y-2">
                {sortPlayersByPosition(players).map((player) => {
                  const calculatedOverall = calculateOverallRating(player);
                  const positionLabel = getPositionLabel(players, player);
                  
                  return (
                    <div
                      key={player.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <PlayerAvatar
                          player={player}
                          size={50}
                        />
                        <div>
                          <div className="font-medium text-gray-800">{player.name}</div>
                          <div className="text-sm text-gray-600">
                            {positionLabel} • Age {player.age} • Overall: {calculatedOverall}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Fatigue</div>
                        <div className="font-medium text-gray-800">{player.fatigue}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <button
                onClick={() => router.push('/basketball/team')}
                className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
              >
                👥 View Team
              </button>
              <button
                onClick={() => router.push('/basketball/marketplace')}
                className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors"
              >
                🏪 Marketplace
              </button>
              <button
                onClick={() => router.push('/basketball/facilities')}
                className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors"
              >
                🏗️ Facilities
              </button>
              <button
                onClick={() => router.push('/basketball/tactics')}
                className="px-6 py-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition-colors"
              >
                📋 Tactics
              </button>
              <button
                onClick={() => router.push('/basketball/chemistry')}
                className="px-6 py-3 bg-pink-600 text-white font-bold rounded-lg hover:bg-pink-700 transition-colors"
              >
                🧪 Chemistry
              </button>
              <button
                onClick={() => router.push('/basketball/achievements')}
                className="px-6 py-3 bg-yellow-600 text-white font-bold rounded-lg hover:bg-yellow-700 transition-colors"
              >
                🏆 Achievements
              </button>
              <button
                onClick={() => router.push('/basketball/hall-of-fame')}
                className="px-6 py-3 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700 transition-colors"
              >
                🎖️ Hall of Fame
              </button>
              <button
                onClick={() => router.push('/basketball/actions')}
                className="px-6 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors"
              >
                ⚡ Weekly Actions
              </button>
              <TutorialButton />
            </div>
            
            {/* Play Game Button - Separate and Bigger */}
            <button
              onClick={() => router.push('/basketball/simulate')}
              className="w-full px-8 py-6 bg-gradient-to-r from-red-600 to-red-700 text-white text-2xl font-bold rounded-lg hover:from-red-700 hover:to-red-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              🎮 Play Game
            </button>
          </div>

          {/* GitHub Button */}
          <div className="mt-8 flex justify-center">
            <a
              href="https://github.com/guygir/u20-basketball-manager"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
            >
              <span>⭐</span>
              <span>GitHub</span>
            </a>
          </div>

          {/* Contributors Welcome */}
          <p className="mt-6 text-gray-300 text-sm text-center">
            🤝 Contributors are welcome! This is an open-source project.
          </p>
          </>
        )}
      </div>
    </div>
  );
}

