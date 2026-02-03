'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loadGameState, saveGameState, generateId, addToHallOfFame } from '@/lib/basketball/local-storage';
import { selectDraftProspect, type DraftProspect } from '@/lib/basketball/progression-system';
import { generatePlayer } from '@/lib/basketball/player-generator';
import type { Player } from '@/lib/basketball/types';
import HexagonStats from '@/components/HexagonStats';
import PlayerAvatar from '@/components/PlayerAvatar';
import { calculateOverallRating, sortPlayersByPosition, getPositionLabel } from '@/lib/basketball/utils';

type DraftStep = 'select-prospect' | 'select-replacement';

export default function DraftPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [draftStep, setDraftStep] = useState<DraftStep>('select-prospect');
  const [draftProspects, setDraftProspects] = useState<DraftProspect[]>([]);
  const [retiringPlayers, setRetiringPlayers] = useState<Player[]>([]);
  const [currentRoster, setCurrentRoster] = useState<Player[]>([]);
  const [selectedProspect, setSelectedProspect] = useState<DraftProspect | null>(null);
  const [selectedReplacement, setSelectedReplacement] = useState<Player | null>(null);

  useEffect(() => {
    const gameState = loadGameState();
    
    if (!gameState) {
      router.push('/basketball');
      return;
    }

    // Check if we have season end data in localStorage
    const seasonEndDataStr = localStorage.getItem('basketball_season_end_data');
    if (!seasonEndDataStr) {
      // No draft needed, go back to hub
      router.push('/basketball');
      return;
    }

    const seasonEndData = JSON.parse(seasonEndDataStr);
    const retiringPlayersList = seasonEndData.retiringPlayers || [];
    
    setDraftProspects(seasonEndData.draftProspects);
    setRetiringPlayers(retiringPlayersList);
    setCurrentRoster(gameState.players);
    
    // EDGE CASE: If all 5 players are retiring, skip to auto-draft mode
    // In this case, we don't need user to select replacement since everyone is leaving
    if (retiringPlayersList.length === 5) {
      console.log('[DRAFT] All 5 players retiring - entering auto-draft mode');
      setDraftStep('select-prospect'); // User still picks ONE prospect
    }
    
    setLoading(false);
  }, [router]);

  const handleSelectProspect = (prospect: DraftProspect) => {
    setSelectedProspect(prospect);
  };

  const handleConfirmProspect = () => {
    if (!selectedProspect) return;
    
    // EDGE CASE: If all 5 players are retiring, skip replacement step
    // and directly process the draft with auto-generated roster
    if (retiringPlayers.length === 5) {
      handleAllPlayersRetiringDraft();
    } else {
      setDraftStep('select-replacement');
    }
  };
  
  const handleAllPlayersRetiringDraft = () => {
    if (!selectedProspect) return;

    let gameState = loadGameState();
    if (!gameState) return;
    
    console.log('[DRAFT] All players retiring - auto-generating full roster');
    console.log('[DRAFT] Initial load - Hall of Fame has', gameState.hallOfFame?.length || 0, 'players');

    // Add all retiring players to Hall of Fame
    retiringPlayers.forEach(retiringPlayer => {
      // Calculate seasons played: age 18, 19, 20 = 3 seasons before retiring at 21
      const seasonsPlayed = retiringPlayer.age - 18;
      addToHallOfFame(retiringPlayer, seasonsPlayed);
    });
    
    // RELOAD game state to get updated Hall of Fame
    gameState = loadGameState();
    if (!gameState) return;
    
    console.log('[DRAFT] After adding to Hall of Fame - Hall of Fame has', gameState.hallOfFame?.length || 0, 'players');
    
    // Create completely new roster with the selected prospect
    const positions: Array<'PG' | 'SG' | 'SF' | 'PF' | 'C'> = ['PG', 'SG', 'SF', 'PF', 'C'];
    const updatedRoster: Player[] = [];
    
    // Add the selected prospect at their natural position
    const draftedPlayer = selectDraftProspect(selectedProspect, gameState.game.id, selectedProspect.position);
    updatedRoster.push(draftedPlayer);
    
    // Fill remaining 4 positions with auto-generated 18-year-olds
    positions.forEach(position => {
      if (position !== selectedProspect.position) {
        const fillerPlayerBase = generatePlayer(gameState.game.id, position, 18);
        const fillerPlayer: Player = {
          ...fillerPlayerBase,
          id: generateId(),
          created_at: new Date().toISOString(),
        };
        updatedRoster.push(fillerPlayer);
      }
    });

    // Advance to new season - preserve Hall of Fame!
    const updatedGameState = {
      ...gameState,
      game: {
        ...gameState.game,
        season_number: gameState.game.season_number + 1,
        week_number: 1,
        wins: 0,
        losses: 0,
        playoff_round: null,
        actions_remaining: 3,
      },
      players: updatedRoster,
      hallOfFame: gameState.hallOfFame || [],
    };

    console.log('[DRAFT] Preserving Hall of Fame with', updatedGameState.hallOfFame.length, 'players');

    // Save updated game state
    saveGameState(updatedGameState);
    
    console.log('[DRAFT] Game state saved for new season (all players retired)');

    // Clear season end data
    localStorage.removeItem('basketball_season_end_data');

    // Redirect to team page
    router.push('/basketball/team');
  };

  const handleSelectReplacement = (player: Player) => {
    setSelectedReplacement(player);
  };

  const handleConfirmReplacement = () => {
    if (!selectedProspect || !selectedReplacement) return;

    let gameState = loadGameState();
    if (!gameState) return;
    
    console.log('[DRAFT] Initial load - Hall of Fame has', gameState.hallOfFame?.length || 0, 'players');

    // Create new player from prospect, inheriting the replaced player's position
    const newPlayer = selectDraftProspect(selectedProspect, gameState.game.id, selectedReplacement.position);
    
    // Add retiring players to Hall of Fame before removing them
    retiringPlayers.forEach(retiringPlayer => {
      // Calculate seasons played: age 18, 19, 20 = 3 seasons before retiring at 21
      const seasonsPlayed = retiringPlayer.age - 18;
      addToHallOfFame(retiringPlayer, seasonsPlayed);
    });
    
    // RELOAD game state to get updated Hall of Fame
    gameState = loadGameState();
    if (!gameState) return;
    
    console.log('[DRAFT] After adding to Hall of Fame - Hall of Fame has', gameState.hallOfFame?.length || 0, 'players');
    
    // Remove selected replacement from roster
    let updatedRoster = gameState.players.filter(p => p.id !== selectedReplacement.id);
    
    // Remove all retiring players (age 21)
    updatedRoster = updatedRoster.filter(
      p => !retiringPlayers.some(rp => rp.id === p.id)
    );
    
    // Add drafted player
    updatedRoster.push(newPlayer);
    
    // Fill roster to 5 players if needed (with random 18-year-olds)
    const positions: Array<'PG' | 'SG' | 'SF' | 'PF' | 'C'> = ['PG', 'SG', 'SF', 'PF', 'C'];
    while (updatedRoster.length < 5) {
      // Find missing position
      const existingPositions = updatedRoster.map(p => p.position);
      const missingPosition = positions.find(pos => !existingPositions.includes(pos)) || positions[0];
      
      const fillerPlayerBase = generatePlayer(gameState.game.id, missingPosition, 18);
      const fillerPlayer: Player = {
        ...fillerPlayerBase,
        id: generateId(),
        created_at: new Date().toISOString(),
      };
      updatedRoster.push(fillerPlayer);
    }

    // Advance to new season - preserve Hall of Fame!
    const updatedGameState = {
      ...gameState,
      game: {
        ...gameState.game,
        season_number: gameState.game.season_number + 1,
        week_number: 1,
        wins: 0,
        losses: 0,
        playoff_round: null,
        actions_remaining: 3,
      },
      players: updatedRoster,
      hallOfFame: gameState.hallOfFame || [], // Explicitly preserve Hall of Fame
    };

    console.log('[DRAFT] Preserving Hall of Fame with', updatedGameState.hallOfFame.length, 'players');

    // Save updated game state
    saveGameState(updatedGameState);
    
    console.log('[DRAFT] Game state saved for new season');

    // Clear season end data
    localStorage.removeItem('basketball_season_end_data');

    // Redirect to team page
    router.push('/basketball/team');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <p>Loading draft...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Link */}
        <Link
          href="/basketball"
          className="inline-block mb-4 text-white hover:text-gray-200 transition-colors"
        >
          ← Back to Hub
        </Link>
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">🏀 Draft Day 🏀</h1>
          <p className="text-xl text-gray-300">
            {draftStep === 'select-prospect'
              ? retiringPlayers.length === 5
                ? 'Select Your First Player for the New Roster'
                : 'Step 1: Select a Draft Prospect'
              : 'Step 2: Choose Player to Replace'}
          </p>
        </div>

        {/* Retiring Players Notice */}
        {retiringPlayers.length > 0 && (
          <div className="bg-red-900 bg-opacity-50 rounded-lg p-4 mb-6 border-2 border-red-500">
            <h3 className="text-xl font-bold text-white mb-2">
              {retiringPlayers.length === 5 ? '🔄 Complete Roster Rebuild' : '⚠️ Retiring Players'}
            </h3>
            <p className="text-gray-200 mb-2">
              {retiringPlayers.length === 5
                ? 'All 5 players have reached age 21 and will retire. You will draft 1 player and 4 others will be auto-generated (all age 18).'
                : 'The following players have reached age 21 and will retire after the draft:'}
            </p>
            <div className="flex flex-wrap gap-2">
              {retiringPlayers.map(player => (
                <span key={player.id} className="px-3 py-1 bg-red-700 text-white rounded-full text-sm">
                  {player.name} ({player.position})
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Select Prospect */}
        {draftStep === 'select-prospect' && (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-6">Available Prospects</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {draftProspects.map((prospect) => (
                  <div
                    key={prospect.id}
                    onClick={() => handleSelectProspect(prospect)}
                    className={`bg-white rounded-lg shadow-xl p-6 cursor-pointer transition-all ${
                      selectedProspect?.id === prospect.id
                        ? 'ring-4 ring-yellow-400 scale-105'
                        : 'hover:shadow-2xl hover:scale-102'
                    }`}
                  >
                    {/* Prospect Header */}
                    <div className="mb-4">
                      <div className="flex justify-between items-start gap-3 mb-2">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          <PlayerAvatar
                            player={prospect as any}
                            size={60}
                            className="ring-2 ring-gray-300"
                          />
                        </div>
                        
                        {/* Prospect Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-gray-800 truncate">{prospect.name}</h3>
                          <p className="text-gray-600">{prospect.position} • Age {prospect.age}</p>
                        </div>
                        
                        {/* Overall Rating */}
                        <div className="text-right flex-shrink-0">
                          <div className="text-3xl font-bold text-blue-600">{calculateOverallRating(prospect as any)}</div>
                          <div className="text-xs text-gray-600">OVR</div>
                        </div>
                      </div>
                      
                      {/* Potential Badge */}
                      <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                        prospect.potential === 'Elite' ? 'bg-purple-200 text-purple-800' :
                        prospect.potential === 'High' ? 'bg-blue-200 text-blue-800' :
                        prospect.potential === 'Medium' ? 'bg-green-200 text-green-800' :
                        'bg-gray-200 text-gray-800'
                      }`}>
                        {prospect.potential} Potential
                      </div>
                    </div>

                    {/* Hexagon Stats */}
                    <div className="flex justify-center mb-4">
                      <HexagonStats
                        stats={{
                          outsideOffense: prospect.outside_offense,
                          insideOffense: prospect.inside_offense,
                          outsideDefense: prospect.outside_defense,
                          insideDefense: prospect.inside_defense,
                          passing: prospect.passing,
                          athleticism: prospect.athleticism,
                        }}
                        size="small"
                      />
                    </div>

                    {/* Skills */}
                    {prospect.skills.length > 0 && (
                      <div className="mt-4">
                        <div className="text-sm font-bold text-gray-700 mb-2">Skills:</div>
                        <div className="flex flex-wrap gap-2">
                          {prospect.skills.map((skill, index) => (
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
                  </div>
                ))}
              </div>
            </div>

            {/* Confirm Prospect Button */}
            {selectedProspect && (
              <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
                <button
                  onClick={handleConfirmProspect}
                  className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-4 px-8 rounded-lg shadow-2xl transition-all text-xl"
                >
                  Draft {selectedProspect.name} →
                </button>
              </div>
            )}
          </>
        )}

        {/* Step 2: Select Replacement */}
        {draftStep === 'select-replacement' && selectedProspect && (
          <>
            {/* Show Selected Prospect */}
            <div className="bg-green-900 bg-opacity-50 rounded-lg p-6 mb-8 border-2 border-green-500">
              <h3 className="text-xl font-bold text-white mb-2">✅ Drafted: {selectedProspect.name}</h3>
              <p className="text-gray-200">
                {selectedProspect.position} • Overall: {calculateOverallRating(selectedProspect as any)} • {selectedProspect.potential} Potential
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-6">Select Player to Replace</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentRoster.map((player) => {
                  const isRetiring = retiringPlayers.some(rp => rp.id === player.id);
                  
                  return (
                    <div
                      key={player.id}
                      onClick={() => !isRetiring && handleSelectReplacement(player)}
                      className={`bg-white rounded-lg shadow-xl p-6 transition-all ${
                        isRetiring 
                          ? 'opacity-50 cursor-not-allowed' 
                          : selectedReplacement?.id === player.id
                            ? 'ring-4 ring-red-400 scale-105 cursor-pointer'
                            : 'hover:shadow-2xl hover:scale-102 cursor-pointer'
                      }`}
                    >
                      {/* Player Header */}
                      <div className="mb-4">
                        <div className="flex justify-between items-start gap-3 mb-2">
                          {/* Avatar */}
                          <div className="flex-shrink-0">
                            <PlayerAvatar
                              player={player}
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
                            <div className="text-3xl font-bold text-blue-600">{calculateOverallRating(player)}</div>
                            <div className="text-xs text-gray-600">OVR</div>
                          </div>
                        </div>
                        
                        {isRetiring && (
                          <div className="inline-block px-3 py-1 rounded-full text-sm font-bold bg-red-200 text-red-800">
                            Retiring (Auto-removed)
                          </div>
                        )}
                      </div>

                      {/* Hexagon Stats */}
                      <div className="flex justify-center">
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
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Confirm Replacement Button */}
            {selectedReplacement && (
              <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
                <button
                  onClick={handleConfirmReplacement}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-8 rounded-lg shadow-2xl transition-all text-xl"
                >
                  Replace {selectedReplacement.name} with {selectedProspect.name} →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

