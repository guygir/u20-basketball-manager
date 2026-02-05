'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentGame, getPlayers, saveGameState, loadGameState } from '@/lib/basketball/local-storage';
import { GameSave, Player, Opponent } from '@/lib/basketball/types';
import { GAME_CONSTANTS } from '@/lib/basketball/constants';
import { generateOpponent } from '@/lib/basketball/opponent-generator';
import { PageTutorialOverlay } from '@/components/Tutorial';
import { sortPlayersByPosition, calculateOverallRating } from '@/lib/basketball/utils';

export default function ActionsPage() {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameSave | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Action selection state
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [selectedAttribute, setSelectedAttribute] = useState<string>('');
  const [scoutedOpponent, setScoutedOpponent] = useState<Opponent | null>(null);

  useEffect(() => {
    loadGameData();
  }, []);

  const loadGameData = () => {
    const game = getCurrentGame();
    const playerList = getPlayers();

    if (!game) {
      router.push('/basketball');
      return;
    }

    setGameState(game);
    setPlayers(sortPlayersByPosition(playerList));
    setLoading(false);
  };

  const executeAction = async () => {
    if (!gameState || !selectedAction) return;

    setActionInProgress(true);
    setMessage(null);

    try {
      // Prepare request body based on action type
      const requestBody: any = {
        actionType: selectedAction,
        gameState,
        players,
      };

      if (selectedAction === 'train_general' || selectedAction === 'train_focused') {
        if (!selectedPlayer) {
          setMessage({ type: 'error', text: 'Please select a player to train' });
          setActionInProgress(false);
          return;
        }
        requestBody.playerId = selectedPlayer;
      }

      if (selectedAction === 'train_focused') {
        if (!selectedAttribute) {
          setMessage({ type: 'error', text: 'Please select an attribute to train' });
          setActionInProgress(false);
          return;
        }
        requestBody.attribute = selectedAttribute;
      }

      if (selectedAction === 'scout') {
        // Generate opponent for scouting
        const opponent = generateOpponent(gameState.week_number, gameState.difficulty);
        requestBody.opponent = opponent;
      }

      // Call API
      const response = await fetch('/api/basketball/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({ type: 'error', text: data.error || 'Action failed' });
        setActionInProgress(false);
        return;
      }

      // Update local state
      const updatedGameState = { ...gameState, ...data.updatedGameState };
      
      let updatedPlayers = [...players];
      if (data.updatedPlayers) {
        // Merge updated players
        data.updatedPlayers.forEach((updatedPlayer: Player) => {
          const index = updatedPlayers.findIndex(p => p.id === updatedPlayer.id);
          if (index !== -1) {
            updatedPlayers[index] = updatedPlayer;
          }
        });
      }

      // Save to localStorage
      const currentState = loadGameState();
      if (currentState) {
        saveGameState({
          ...currentState,
          game: updatedGameState,
          players: updatedPlayers,
        });
      }

      // Update UI state
      setGameState(updatedGameState);
      setPlayers(updatedPlayers);
      setMessage({ type: 'success', text: data.message });

      // If scouting, show opponent
      if (data.scoutedOpponent) {
        setScoutedOpponent(data.scoutedOpponent);
      }

      // Reset selection
      setSelectedAction('');
      setSelectedPlayer('');
      setSelectedAttribute('');
    } catch (error) {
      console.error('Action error:', error);
      setMessage({ type: 'error', text: 'Failed to execute action' });
    } finally {
      setActionInProgress(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-700 to-purple-600 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!gameState) {
    return null;
  }

  const avgFatigue = Math.round(players.reduce((sum, p) => sum + p.fatigue, 0) / players.length);

  return (
    <>
      <PageTutorialOverlay pageName="actions" />
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-700 to-purple-600 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/basketball"
            className="inline-block mb-4 text-white hover:text-gray-200 transition-colors"
          >
            ← Back to Hub
          </Link>
          <h1 className="text-4xl font-bold mb-2">Weekly Actions</h1>
          <div className="flex gap-6 text-lg">
            <span>Week {gameState.week_number} of {GAME_CONSTANTS.TOTAL_WEEKS}</span>
            <span>Actions Remaining: <span className="font-bold text-yellow-400">{gameState.actions_remaining}</span></span>
            <span>Coins: <span className="font-bold text-green-400">{gameState.coins}</span></span>
            <span>Avg Fatigue: <span className={avgFatigue > 50 ? 'text-red-400' : 'text-green-400'}>{avgFatigue}</span></span>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded ${message.type === 'success' ? 'bg-green-900 border border-green-600' : 'bg-red-900 border border-red-600'}`}>
            {message.text}
          </div>
        )}

        {/* Action Selection */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Select Action</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Train General */}
            <button
              onClick={() => {
                setSelectedAction('train_general');
                setScoutedOpponent(null);
              }}
              className={`p-4 rounded border-2 transition ${
                selectedAction === 'train_general'
                  ? 'border-blue-500 bg-blue-900'
                  : 'border-gray-600 hover:border-gray-500'
              }`}
            >
              <div className="font-bold text-lg mb-1">Train Player (General)</div>
              <div className="text-sm text-gray-400 mb-2">+1 to random attributes (age-based)</div>
              <div className="text-xs text-gray-500">
                Age 18: {GAME_CONSTANTS.BALANCE.TRAINING.AGE_18.GENERAL_ATTRIBUTES} attrs •
                Age 19: {GAME_CONSTANTS.BALANCE.TRAINING.AGE_19.GENERAL_ATTRIBUTES} attrs •
                Age 20: {GAME_CONSTANTS.BALANCE.TRAINING.AGE_20.GENERAL_ATTRIBUTES} attr
                {GAME_CONSTANTS.BALANCE.TRAINING.AGE_21.GENERAL_ATTRIBUTES > 0 && (
                  <> • Age 21: {GAME_CONSTANTS.BALANCE.TRAINING.AGE_21.GENERAL_ATTRIBUTES} attrs</>
                )}
              </div>
              <div className="text-yellow-400">Cost: {GAME_CONSTANTS.ACTIONS.TRAIN_GENERAL.COST} coins</div>
              <div className="text-red-400 text-sm">+{GAME_CONSTANTS.ACTIONS.TRAIN_GENERAL.FATIGUE_COST} fatigue</div>
            </button>

            {/* Train Focused */}
            <button
              onClick={() => {
                setSelectedAction('train_focused');
                setScoutedOpponent(null);
              }}
              className={`p-4 rounded border-2 transition ${
                selectedAction === 'train_focused'
                  ? 'border-blue-500 bg-blue-900'
                  : 'border-gray-600 hover:border-gray-500'
              }`}
            >
              <div className="font-bold text-lg mb-1">Train Player (Focused)</div>
              <div className="text-sm text-gray-400 mb-2">Improve chosen attribute (age-based)</div>
              <div className="text-xs text-gray-500">
                Age 18: +{GAME_CONSTANTS.BALANCE.TRAINING.AGE_18.FOCUSED_IMPROVEMENT} •
                Age 19: +{GAME_CONSTANTS.BALANCE.TRAINING.AGE_19.FOCUSED_IMPROVEMENT} •
                Age 20: +{GAME_CONSTANTS.BALANCE.TRAINING.AGE_20.FOCUSED_IMPROVEMENT}
                {GAME_CONSTANTS.BALANCE.TRAINING.AGE_21.FOCUSED_IMPROVEMENT > 0 && (
                  <> • Age 21: +{GAME_CONSTANTS.BALANCE.TRAINING.AGE_21.FOCUSED_IMPROVEMENT}</>
                )}
              </div>
              <div className="text-yellow-400">Cost: {GAME_CONSTANTS.ACTIONS.TRAIN_FOCUSED.COST} coins</div>
              <div className="text-red-400 text-sm">+{GAME_CONSTANTS.ACTIONS.TRAIN_FOCUSED.FATIGUE_COST} fatigue</div>
            </button>

            {/* Rest Team */}
            <button
              onClick={() => {
                setSelectedAction('rest');
                setScoutedOpponent(null);
              }}
              className={`p-4 rounded border-2 transition ${
                selectedAction === 'rest'
                  ? 'border-green-500 bg-green-900'
                  : 'border-gray-600 hover:border-gray-500'
              }`}
            >
              <div className="font-bold text-lg mb-1">Rest Team</div>
              <div className="text-sm text-gray-400 mb-2">-{GAME_CONSTANTS.ACTIONS.REST.FATIGUE_REDUCTION} fatigue for all players</div>
              <div className="text-green-400">Cost: FREE</div>
            </button>

            {/* Public Relations */}
            <button
              onClick={() => {
                setSelectedAction('public_relations');
                setScoutedOpponent(null);
              }}
              className={`p-4 rounded border-2 transition ${
                selectedAction === 'public_relations'
                  ? 'border-yellow-500 bg-yellow-900'
                  : 'border-gray-600 hover:border-gray-500'
              }`}
            >
              <div className="font-bold text-lg mb-1">Public Relations</div>
              <div className="text-sm text-gray-400 mb-2">Earn coins through PR activities</div>
              <div className="text-green-400">Earn: +{GAME_CONSTANTS.ACTIONS.PUBLIC_RELATIONS.COINS_EARNED} coins</div>
              <div className="text-green-400">Cost: FREE</div>
            </button>

            {/* Scout Opponent */}
            <button
              onClick={() => {
                setSelectedAction('scout');
                setScoutedOpponent(null);
              }}
              className={`p-4 rounded border-2 transition ${
                selectedAction === 'scout'
                  ? 'border-purple-500 bg-purple-900'
                  : 'border-gray-600 hover:border-gray-500'
              }`}
            >
              <div className="font-bold text-lg mb-1">Scout Opponent</div>
              <div className="text-sm text-gray-400 mb-2">Reveal next opponent's stats</div>
              <div className="text-yellow-400">Cost: {GAME_CONSTANTS.ACTIONS.SCOUT.COST} coins</div>
            </button>
          </div>

          {/* Player Selection (for training) */}
          {(selectedAction === 'train_general' || selectedAction === 'train_focused') && (
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-3">Select Player</h3>
              <div className="grid grid-cols-1 gap-2">
                {players.map((player) => {
                  const calculatedOverall = calculateOverallRating(player);
                  
                  return (
                    <button
                      key={player.id}
                      onClick={() => setSelectedPlayer(player.id)}
                      className={`p-3 rounded border-2 text-left transition ${
                        selectedPlayer === player.id
                          ? 'border-blue-500 bg-blue-900'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-bold">{player.name}</span>
                          <span className="ml-2 text-gray-400">({player.position})</span>
                          <span className="ml-2 text-sm">Overall: {calculatedOverall}</span>
                        </div>
                        <div className="text-sm">
                          <span className={player.fatigue > 50 ? 'text-red-400' : 'text-green-400'}>
                            Fatigue: {player.fatigue}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Attribute Selection (for focused training) */}
          {selectedAction === 'train_focused' && selectedPlayer && (
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-3">Select Attribute</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'outside_offense', label: 'Outside Offense' },
                  { key: 'inside_offense', label: 'Inside Offense' },
                  { key: 'passing', label: 'Passing' },
                  { key: 'outside_defense', label: 'Outside Defense' },
                  { key: 'inside_defense', label: 'Inside Defense' },
                  { key: 'athleticism', label: 'Athleticism' },
                ].map((attr) => {
                  const player = players.find(p => p.id === selectedPlayer);
                  const currentValue = player ? (player[attr.key as keyof Player] as number) : 0;
                  return (
                    <button
                      key={attr.key}
                      onClick={() => setSelectedAttribute(attr.key)}
                      className={`p-3 rounded border-2 transition ${
                        selectedAttribute === attr.key
                          ? 'border-blue-500 bg-blue-900'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <div className="font-bold">{attr.label}</div>
                      <div className="text-sm text-gray-400">Current: {currentValue}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Execute Button */}
          <button
            onClick={executeAction}
            disabled={
              actionInProgress ||
              !selectedAction ||
              gameState.actions_remaining <= 0 ||
              (selectedAction === 'train_general' && !selectedPlayer) ||
              (selectedAction === 'train_focused' && (!selectedPlayer || !selectedAttribute))
            }
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded transition"
          >
            {actionInProgress ? 'Executing...' : 'Execute Action'}
          </button>
        </div>

        {/* Scouted Opponent */}
        {scoutedOpponent && (
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Scouted: {scoutedOpponent.team_name}</h2>
            <div className="mb-4">
              <span className="text-gray-400">Tier: </span>
              <span className="font-bold">{scoutedOpponent.tier}</span>
            </div>
            <h3 className="text-xl font-bold mb-3">Roster</h3>
            <div className="space-y-2">
              {scoutedOpponent.roster.map((player, index) => (
                <div key={index} className="bg-gray-700 p-3 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <span className="font-bold">{player.name}</span>
                      <span className="ml-2 text-gray-400">({player.position})</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>Out Off: {player.outside_offense}</div>
                    <div>In Off: {player.inside_offense}</div>
                    <div>Pass: {player.passing}</div>
                    <div>Out Def: {player.outside_defense}</div>
                    <div>In Def: {player.inside_defense}</div>
                    <div>Ath: {player.athleticism}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-4">
          <button
            onClick={() => router.push('/basketball/team')}
            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded transition"
          >
            View Team
          </button>
          <button
            onClick={() => router.push('/basketball/simulate')}
            disabled={gameState.actions_remaining > 0}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded transition"
          >
            {gameState.actions_remaining > 0 ? `Use ${gameState.actions_remaining} Actions First` : 'Play Game'}
          </button>
        </div>

        {/* Hint */}
        <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 mt-8">
          <h3 className="font-semibold mb-2">💡 About Weekly Actions</h3>
          <p className="text-sm text-gray-300">
            You have 3 actions per week to prepare for your game. Train players to improve their stats,
            scout opponents to learn their strengths, rest your team to reduce fatigue, or manage your roster and facilities.
            Choose wisely - actions don't carry over to the next week!
          </p>
        </div>
      </div>
    </div>
    </>
  );
}

