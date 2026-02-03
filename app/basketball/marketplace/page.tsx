'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadGameState, saveGameState } from '@/lib/basketball/local-storage';
import { generateMarketPlayers, type MarketPlayer } from '@/lib/basketball/marketplace';
import { buyPlayer } from '@/lib/basketball/action-handler';
import type { Player } from '@/lib/basketball/types';
import HexagonStats from '@/components/HexagonStats';
import PlayerAvatar from '@/components/PlayerAvatar';
import Link from 'next/link';
import { PageTutorialOverlay } from '@/components/Tutorial';
import { CHARACTERISTICS, calculatePairChemistry, type Characteristic } from '@/lib/basketball/chemistry';
import { calculateOverallRating } from '@/lib/basketball/utils';

export default function MarketplacePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [marketPlayers, setMarketPlayers] = useState<MarketPlayer[]>([]);
  const [roster, setRoster] = useState<Player[]>([]);
  const [coins, setCoins] = useState(0);
  const [actionsRemaining, setActionsRemaining] = useState(0);
  
  // Buy flow state
  const [selectedMarketPlayer, setSelectedMarketPlayer] = useState<MarketPlayer | null>(null);
  const [playerToReplace, setPlayerToReplace] = useState<Player | null>(null);
  
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const gameState = loadGameState();
    
    if (!gameState) {
      router.push('/basketball');
      return;
    }

    // Generate market players (stored in localStorage for consistency during week)
    const marketKey = `basketball_market_week_${gameState.game.id}_${gameState.game.week_number}`;
    let market = localStorage.getItem(marketKey);
    
    if (!market) {
      // Generate new market for this week
      const newMarket = generateMarketPlayers(5, []); // TODO: Pass unlocked skills
      localStorage.setItem(marketKey, JSON.stringify(newMarket));
      setMarketPlayers(newMarket);
    } else {
      const parsedMarket = JSON.parse(market);
      // Validate that market players have characteristics (for backwards compatibility)
      const validatedMarket = parsedMarket.map((p: MarketPlayer) => {
        if (!p.characteristics || p.characteristics.length === 0) {
          // Regenerate this player with characteristics
          const newMarket = generateMarketPlayers(1, []);
          return { ...p, characteristics: newMarket[0].characteristics };
        }
        return p;
      });
      setMarketPlayers(validatedMarket);
    }
    
    setRoster(gameState.players);
    setCoins(gameState.game.coins);
    setActionsRemaining(gameState.game.actions_remaining);
    setLoading(false);
  }, [router]);

  const handleBuyPlayer = () => {
    if (!selectedMarketPlayer || !playerToReplace) return;

    const gameState = loadGameState();
    if (!gameState) return;

    const result = buyPlayer({
      marketPlayer: selectedMarketPlayer,
      playerToReplace,
      allPlayers: gameState.players,
      gameState: gameState.game,
    });

    if (result.success && result.updatedPlayers && result.updatedGameState) {
      // Update game state
      const updatedGameState = {
        ...gameState,
        game: {
          ...gameState.game,
          ...result.updatedGameState,
          actions_remaining: gameState.game.actions_remaining - 1,
        },
        players: result.updatedPlayers,
      };
      
      saveGameState(updatedGameState);
      
      // Remove purchased player from market
      const updatedMarket = marketPlayers.filter(p => p.id !== selectedMarketPlayer.id);
      const marketKey = `basketball_market_week_${gameState.game.id}_${gameState.game.week_number}`;
      localStorage.setItem(marketKey, JSON.stringify(updatedMarket));
      
      setMarketPlayers(updatedMarket);
      setRoster(result.updatedPlayers);
      setCoins(result.updatedGameState.coins!);
      setActionsRemaining(gameState.game.actions_remaining - 1);
      setSelectedMarketPlayer(null);
      setPlayerToReplace(null);
      setMessage({ type: 'success', text: result.message });
    } else {
      setMessage({ type: 'error', text: result.message });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <p>Loading marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageTutorialOverlay pageName="marketplace" />
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-teal-900 to-blue-900 p-8">
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
            <h1 className="text-4xl font-bold text-gray-800 mb-2">🏪 Player Marketplace</h1>
            <p className="text-gray-600 mb-4">Buy players to upgrade your roster. Each purchase replaces an existing player.</p>
            <div className="flex gap-6 text-gray-600">
              <div>💰 Coins: <span className="font-bold text-green-600">{coins}</span></div>
              <div>⚡ Actions: <span className="font-bold text-blue-600">{actionsRemaining}</span></div>
              <div>👥 Roster: <span className="font-bold">{roster.length}/5</span></div>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Available Players */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-6">Available Players</h2>
          
          {marketPlayers.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center text-gray-600">
              <p className="text-xl">No players available in the market this week.</p>
              <p className="mt-2">Check back next week for new players!</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {marketPlayers.map((player) => (
                  <div
                    key={player.id}
                    onClick={() => setSelectedMarketPlayer(player)}
                    className={`bg-white rounded-lg shadow-xl p-6 cursor-pointer transition-all ${
                      selectedMarketPlayer?.id === player.id
                        ? 'ring-4 ring-green-400 scale-105'
                        : 'hover:shadow-2xl hover:scale-102'
                    }`}
                  >
                    {/* Player Header */}
                    <div className="mb-4">
                      <div className="flex justify-between items-start gap-3 mb-2">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          <PlayerAvatar
                            player={player as any}
                            size={60}
                            className="ring-2 ring-gray-300"
                          />
                        </div>
                        
                        {/* Player Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-gray-800 truncate">{player.name}</h3>
                          <p className="text-gray-600">{player.position} • Age {player.age}</p>
                        </div>
                        
                        {/* Overall Rating */}
                        <div className="text-right flex-shrink-0">
                          <div className="text-3xl font-bold text-blue-600">{calculateOverallRating(player as any)}</div>
                          <div className="text-xs text-gray-600">OVR</div>
                        </div>
                      </div>
                      
                      {/* Quality Badge */}
                      <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                        player.quality === 'Elite' ? 'bg-purple-200 text-purple-800' :
                        player.quality === 'Premium' ? 'bg-blue-200 text-blue-800' :
                        player.quality === 'Standard' ? 'bg-green-200 text-green-800' :
                        'bg-gray-200 text-gray-800'
                      }`}>
                        {player.quality}
                      </div>
                      
                      {/* Price */}
                      <div className="mt-2 text-2xl font-bold text-green-600">
                        💰 {player.price} coins
                      </div>
                    </div>

                    {/* Hexagon Stats */}
                    <div className="flex justify-center mb-4">
                      <HexagonStats
                        stats={{
                          outsideOffense: player.outside_offense,
                          insideOffense: player.inside_offense,
                          outsideDefense: player.outside_defense,
                          insideDefense: player.inside_defense,
                          passing: player.passing,
                          athleticism: player.athleticism,
                        }}
                        size="small"
                      />
                    </div>

                    {/* Skills */}
                    {player.skills.length > 0 && (
                      <div className="mt-4">
                        <div className="text-sm font-bold text-gray-700 mb-2">Skills:</div>
                        <div className="flex flex-wrap gap-2">
                          {player.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Personality */}
                    {player.characteristics && player.characteristics.length > 0 && (
                      <div className="mt-4 border-t pt-4">
                        <div className="text-sm font-bold text-gray-700 mb-2">Personality:</div>
                        {player.characteristics.map((char, index) => {
                          const charDef = CHARACTERISTICS[char];
                          return (
                            <div key={index} className="mb-3">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg">{charDef.emoji}</span>
                                <span className="font-semibold text-gray-800">{charDef.name}</span>
                              </div>
                              <div className="text-xs text-gray-600 mb-2">{charDef.description}</div>
                              <div className="flex gap-4 text-xs">
                                <div>
                                  <span className="font-semibold text-green-700">Likes:</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {charDef.likes.map((like, i) => (
                                      <span key={i} className="px-2 py-0.5 bg-green-100 text-green-800 rounded">
                                        {CHARACTERISTICS[like].emoji} {CHARACTERISTICS[like].name}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <span className="font-semibold text-red-700">Dislikes:</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {charDef.dislikes.map((dislike, i) => (
                                      <span key={i} className="px-2 py-0.5 bg-red-100 text-red-800 rounded">
                                        {CHARACTERISTICS[dislike].emoji} {CHARACTERISTICS[dislike].name}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Chemistry with Current Team */}
                    {player.characteristics && player.characteristics.length > 0 && roster.length > 0 && (
                      <div className="mt-4 border-t pt-4">
                        <div className="text-sm font-bold text-gray-700 mb-2">Chemistry with Current Team:</div>
                        <div className="space-y-2">
                          {roster.map((rosterPlayer) => {
                            if (!rosterPlayer.characteristics || rosterPlayer.characteristics.length === 0) {
                              return null;
                            }
                            
                            // Calculate chemistry between market player and roster player
                            const chemistry = calculatePairChemistry(
                              player.characteristics as Characteristic[],
                              rosterPlayer.characteristics as Characteristic[]
                            );
                            
                            const chemistryColor =
                              chemistry === 2 ? 'text-green-600' :
                              chemistry === 1 ? 'text-green-500' :
                              chemistry === 0 ? 'text-gray-500' :
                              chemistry === -1 ? 'text-yellow-600' :
                              'text-red-600';
                            
                            const chemistryLabel =
                              chemistry === 2 ? '💚 Perfect' :
                              chemistry === 1 ? '✅ Good' :
                              chemistry === 0 ? '➖ Neutral' :
                              chemistry === -1 ? '⚠️ Clash' :
                              '❌ Major Clash';
                            
                            return (
                              <div key={rosterPlayer.id} className="flex items-center justify-between text-xs">
                                <span className="text-gray-700">{rosterPlayer.name}</span>
                                <span className={`font-semibold ${chemistryColor}`}>
                                  {chemistryLabel} ({chemistry >= 0 ? '+' : ''}{chemistry})
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        <div className="mt-2 text-xs text-gray-600 italic">
                          Average: {roster.length > 0 ? (
                            roster.reduce((sum, rosterPlayer) => {
                              if (!rosterPlayer.characteristics || rosterPlayer.characteristics.length === 0) {
                                return sum;
                              }
                              return sum + calculatePairChemistry(
                                player.characteristics as Characteristic[],
                                rosterPlayer.characteristics as Characteristic[]
                              );
                            }, 0) / roster.filter(p => p.characteristics && p.characteristics.length > 0).length
                          ).toFixed(2) : '0.00'}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Select Replacement Step */}
              {selectedMarketPlayer && (
                <div className="bg-white rounded-lg p-6 mb-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">
                    Select Player to Replace
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Choose which player on your roster will be replaced by {selectedMarketPlayer.name}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {roster.map((player) => {
                      // Calculate overall rating from current attributes
                      const calculatedOverall = Math.round(
                        (player.outside_offense +
                          player.inside_offense +
                          player.outside_defense +
                          player.inside_defense +
                          player.passing +
                          player.athleticism) / 6
                      );
                      
                      return (
                        <div
                          key={player.id}
                          onClick={() => setPlayerToReplace(player)}
                          className={`p-4 rounded-lg cursor-pointer transition-all ${
                            playerToReplace?.id === player.id
                              ? 'bg-red-100 ring-2 ring-red-400'
                              : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <PlayerAvatar
                              player={player}
                              size={50}
                              className="ring-2 ring-gray-300"
                            />
                            <div className="flex-1">
                              <div className="font-bold text-gray-800">{player.name}</div>
                              <div className="text-sm text-gray-600">{player.position} • Age {player.age}</div>
                            </div>
                            <div className="text-2xl font-bold text-blue-600">{calculatedOverall}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {playerToReplace && (
                    <button
                      onClick={handleBuyPlayer}
                      disabled={actionsRemaining === 0 || coins < selectedMarketPlayer.price}
                      className="mt-6 w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-lg transition-colors text-xl"
                    >
                      {actionsRemaining === 0 
                        ? 'No Actions Remaining'
                        : coins < selectedMarketPlayer.price
                          ? 'Not Enough Coins'
                          : `Buy ${selectedMarketPlayer.name} for ${selectedMarketPlayer.price} coins`
                      }
                    </button>
                  )}
                </div>
              )}
            </>
          )}

          {/* Hint */}
          <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 mt-8">
            <h3 className="font-semibold mb-2">💡 About the Marketplace</h3>
            <p className="text-sm text-gray-300">
              Buy and sell players to improve your roster. Younger players (age 18) cost more but have more seasons ahead.
              Elite players are expensive but powerful. Selling players gives you coins for other purchases.
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

