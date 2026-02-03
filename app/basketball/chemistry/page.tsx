'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { GameSave, Player } from '@/lib/basketball/types';
import {
  calculateTeamChemistry,
  getAllPairChemistries,
  getChemistryDescription,
  getChemistryLineColor,
  CHARACTERISTICS,
  type Characteristic
} from '@/lib/basketball/chemistry';
import { PageTutorialOverlay } from '@/components/Tutorial';
import PlayerAvatar from '@/components/PlayerAvatar';
import { sortPlayersByPosition } from '@/lib/basketball/utils';

export default function ChemistryPage() {
  const router = useRouter();
  const [gameState, setGameState] = useState<{ game: GameSave; players: Player[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGame = () => {
      const saved = localStorage.getItem('basketball_roguelike_game');
      if (saved) {
        const state = JSON.parse(saved);
        // Sort players by position for consistent ordering
        setGameState({
          ...state,
          players: sortPlayersByPosition(state.players)
        });
      }
      setLoading(false);
    };

    loadGame();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-900 via-pink-700 to-pink-600 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-900 via-pink-700 to-pink-600 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <p>No active game found.</p>
          <Link
            href="/basketball"
            className="inline-block mt-4 text-white hover:text-gray-200 transition-colors"
          >
            ← Back to Hub
          </Link>
        </div>
      </div>
    );
  }

  const { players } = gameState;
  
  // Ensure all players have characteristics (backwards compatibility)
  const validatedPlayers = players.map(p => {
    if (!p.characteristics || p.characteristics.length === 0) {
      // Generate a random characteristic for players without one
      const characteristics: Characteristic[] = ['fiery', 'laid-back', 'competitive', 'team-first', 'leader', 'showboat', 'quiet'];
      return {
        ...p,
        characteristics: [characteristics[Math.floor(Math.random() * characteristics.length)]]
      };
    }
    return p;
  });
  
  // Calculate team chemistry
  const playerCharacteristics = validatedPlayers.map(p => p.characteristics as Characteristic[]);
  const teamChemistry = calculateTeamChemistry(playerCharacteristics);
  const chemistryInfo = getChemistryDescription(teamChemistry);
  const pairChemistries = getAllPairChemistries(playerCharacteristics);

  // Pentagon positions for 5 players
  const positions = validatedPlayers.map((_, i) => {
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    return {
      x: 150 + Math.cos(angle) * 100,
      y: 150 + Math.sin(angle) * 100,
    };
  });

  return (
    <>
      <PageTutorialOverlay pageName="chemistry" />
      <div className="min-h-screen bg-gradient-to-br from-pink-900 via-pink-700 to-pink-600 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/basketball"
            className="inline-block mb-4 text-white hover:text-gray-200 transition-colors"
          >
            ← Back to Hub
          </Link>
          <h1 className="text-3xl font-bold">Team Chemistry</h1>
        </div>

        {/* Overall Chemistry Score */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">Overall Team Chemistry</h2>
              <p className="text-gray-400">{chemistryInfo.description}</p>
            </div>
            <div className="text-right">
              <div className={`text-4xl font-bold ${chemistryInfo.color}`}>
                {teamChemistry.toFixed(2)}
              </div>
              <div className={`text-lg ${chemistryInfo.color}`}>
                {chemistryInfo.label}
              </div>
              <div className="text-sm text-gray-400 mt-2">
                {teamChemistry >= 0 ? '+' : ''}{(teamChemistry * 5).toFixed(1)}% performance
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pentagon Visualization */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Chemistry Network</h2>
            <div className="flex justify-center">
              <svg width="300" height="300" className="chemistry-pentagon">
                {/* Draw connecting lines */}
                {pairChemistries.map(({ from, to, chemistry }) => {
                  const { color, glow } = getChemistryLineColor(chemistry);
                  return (
                    <line
                      key={`${from}-${to}`}
                      x1={positions[from].x}
                      y1={positions[from].y}
                      x2={positions[to].x}
                      y2={positions[to].y}
                      stroke={color}
                      strokeWidth={glow ? 3 : 2}
                      opacity={0.8}
                      filter={glow ? 'url(#glow)' : undefined}
                    />
                  );
                })}
                
                {/* Glow filter for +2 chemistry */}
                <defs>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                
                {/* Draw player nodes */}
                {validatedPlayers.map((player, i) => (
                  <g key={player.id}>
                    <foreignObject
                      x={positions[i].x - 25}
                      y={positions[i].y - 25}
                      width={50}
                      height={50}
                    >
                      <div className="flex items-center justify-center w-full h-full">
                        <PlayerAvatar
                          player={player}
                          size={50}
                          className="ring-2 ring-gray-600"
                        />
                      </div>
                    </foreignObject>
                    <text
                      x={positions[i].x}
                      y={positions[i].y + 40}
                      textAnchor="middle"
                      fontSize="12"
                      fill="white"
                      fontWeight="500"
                    >
                      {player.name.split(' ')[0]}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
            
            {/* Legend */}
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5" style={{ backgroundColor: '#00FF00' }}></div>
                <span>+2 Perfect Chemistry</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5" style={{ backgroundColor: '#90EE90' }}></div>
                <span>+1 Good Chemistry</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5" style={{ backgroundColor: '#808080' }}></div>
                <span>0 Neutral</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5" style={{ backgroundColor: '#FFD700' }}></div>
                <span>-1 Slight Clash</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5" style={{ backgroundColor: '#FF0000' }}></div>
                <span>-2 Major Clash</span>
              </div>
            </div>
          </div>

          {/* Player Characteristics */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Player Personalities</h2>
            <div className="space-y-4">
              {validatedPlayers.map((player) => {
                const chars = player.characteristics as Characteristic[];
                return (
                  <div key={player.id} className="border-b border-gray-700 pb-4 last:border-0">
                    <div className="flex items-center gap-3 mb-2">
                      <PlayerAvatar
                        player={player}
                        size={40}
                        className="ring-2 ring-gray-600"
                      />
                      <div className="font-semibold">{player.name}</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {chars.map((charId) => {
                        const char = CHARACTERISTICS[charId];
                        return (
                          <div
                            key={charId}
                            className="px-3 py-1 bg-gray-700 rounded-full text-sm flex items-center gap-1"
                            title={char.description}
                          >
                            <span>{char.emoji}</span>
                            <span>{char.name}</span>
                          </div>
                        );
                      })}
                    </div>
                    {/* Show likes/dislikes */}
                    <div className="mt-2 text-xs text-gray-400">
                      {chars.map((charId) => {
                        const char = CHARACTERISTICS[charId];
                        return (
                          <div key={charId} className="mt-1">
                            <span className="text-green-400">Likes: </span>
                            {char.likes.map(l => `${CHARACTERISTICS[l].emoji} ${CHARACTERISTICS[l].name}`).join(', ')}
                            <span className="text-red-400 ml-3">Dislikes: </span>
                            {char.dislikes.map(d => `${CHARACTERISTICS[d].emoji} ${CHARACTERISTICS[d].name}`).join(', ')}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Pair Chemistry Details */}
        <div className="bg-gray-800 rounded-lg p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">Pair Chemistry Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pairChemistries.map(({ from, to, chemistry }) => {
              const player1 = validatedPlayers[from];
              const player2 = validatedPlayers[to];
              const { color } = getChemistryLineColor(chemistry);
              
              return (
                <div key={`${from}-${to}`} className="bg-gray-700 rounded p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="font-semibold">{player1.name}</span>
                      <span className="mx-2">↔</span>
                      <span className="font-semibold">{player2.name}</span>
                    </div>
                    <div 
                      className="text-lg font-bold"
                      style={{ color }}
                    >
                      {chemistry >= 0 ? '+' : ''}{chemistry}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 mt-8">
          <h3 className="font-semibold mb-2">💡 About Chemistry</h3>
          <p className="text-sm text-gray-300">
            Team chemistry is based on player personalities. Players with compatible traits work better together, 
            while clashing personalities can hurt team performance. Chemistry affects all stats during games by up to ±10%.
          </p>
        </div>
      </div>
    </div>
    </>
  );
}

