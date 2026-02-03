'use client';

import React from 'react';
import { Player } from '@/lib/basketball/types';
import HexagonStats from './HexagonStats';
import PlayerAvatar from './PlayerAvatar';

interface PlayerCardProps {
  player: Player;
  onSelect?: (player: Player) => void;
  selected?: boolean;
  showDetails?: boolean;
}

export default function PlayerCard({ player, onSelect, selected = false, showDetails = false }: PlayerCardProps) {
  const positionColors: Record<string, string> = {
    PG: 'bg-blue-500',
    SG: 'bg-green-500',
    SF: 'bg-yellow-500',
    PF: 'bg-orange-500',
    C: 'bg-red-500',
  };

  const positionColor = positionColors[player.position] || 'bg-gray-500';

  // Calculate overall rating (average of all stats)
  const overall = Math.round(
    (player.outside_offense +
      player.inside_offense +
      player.outside_defense +
      player.inside_defense +
      player.passing +
      player.athleticism) /
      6
  );

  return (
    <div
      className={`
        relative bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-200
        ${selected ? 'ring-4 ring-blue-500 scale-105' : 'hover:shadow-xl hover:scale-102'}
        ${onSelect ? 'cursor-pointer' : ''}
      `}
      onClick={() => onSelect?.(player)}
    >
      {/* Header */}
      <div className={`${positionColor} text-white p-4`}>
        <div className="flex justify-between items-start gap-3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <PlayerAvatar
              player={player}
              size={60}
              className="ring-2 ring-white/30"
            />
          </div>
          
          {/* Player Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold truncate">{player.name}</h3>
            <p className="text-sm opacity-90">
              {player.position} • Age {player.age}
            </p>
          </div>
          
          {/* Overall Rating */}
          <div className="text-right flex-shrink-0">
            <div className="text-3xl font-bold">{overall}</div>
            <div className="text-xs opacity-90">OVR</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="p-4">
        {showDetails ? (
          <div className="space-y-4">
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
                size="medium"
              />
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-gray-50 p-2 rounded">
                <div className="text-gray-600">Fatigue</div>
                <div className="font-semibold">{player.fatigue}%</div>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <div className="text-gray-600">Age</div>
                <div className="font-semibold">{player.age}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 text-sm">
            {/* Helper function to display stat with improvement */}
            {(() => {
              type StatKey = 'outside_offense' | 'inside_offense' | 'passing' | 'outside_defense' | 'inside_defense' | 'athleticism';
              
              const renderStat = (label: string, value: number, attr: StatKey) => {
                const improvement = player.weekly_improvements?.[attr];
                const hasImprovement = improvement && improvement > 0;
                const baseValue = hasImprovement ? value - improvement : value;
                
                return (
                  <div key={attr}>
                    <div className="text-gray-600">{label}</div>
                    <div className="font-semibold">
                      {hasImprovement ? (
                        <>
                          {baseValue}
                          <span className="text-green-600 font-bold">+{improvement}</span>
                        </>
                      ) : (
                        value
                      )}
                    </div>
                  </div>
                );
              };
              
              return (
                <>
                  {renderStat('Out Off', player.outside_offense, 'outside_offense')}
                  {renderStat('In Off', player.inside_offense, 'inside_offense')}
                  {renderStat('Out Def', player.outside_defense, 'outside_defense')}
                  {renderStat('In Def', player.inside_defense, 'inside_defense')}
                  {renderStat('Passing', player.passing, 'passing')}
                  {renderStat('Athleticism', player.athleticism, 'athleticism')}
                </>
              );
            })()}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-4 py-2 text-xs text-gray-600 flex justify-between">
        <span>Fatigue: {player.fatigue}%</span>
        <span>Age: {player.age}</span>
      </div>
    </div>
  );
}

