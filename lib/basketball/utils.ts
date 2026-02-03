// Utility functions for Basketball Roguelike

import type { Player } from './types';

/**
 * Sort players by their position in team order (PG, SG, SF, PF, C)
 */
export function sortPlayersByPosition(players: Player[]): Player[] {
  const positionOrder = { 'PG': 0, 'SG': 1, 'SF': 2, 'PF': 3, 'C': 4 };
  return [...players].sort((a, b) => {
    return positionOrder[a.position as keyof typeof positionOrder] - 
           positionOrder[b.position as keyof typeof positionOrder];
  });
}

/**
 * Calculate overall rating from player attributes
 */
export function calculateOverallRating(player: Player): number {
  return Math.round(
    (player.outside_offense +
      player.inside_offense +
      player.outside_defense +
      player.inside_defense +
      player.passing +
      player.athleticism) / 6
  );
}

/**
 * Get team position for a player based on their index in sorted roster
 */
export function getTeamPosition(players: Player[], player: Player): string {
  const sorted = sortPlayersByPosition(players);
  const index = sorted.findIndex(p => p.id === player.id);
  const teamPositions = ['PG', 'SG', 'SF', 'PF', 'C'];
  return teamPositions[index] || player.position;
}

/**
 * Get team position label with natural position if different
 */
export function getPositionLabel(players: Player[], player: Player): string {
  const teamPosition = getTeamPosition(players, player);
  if (teamPosition !== player.position) {
    return `${teamPosition} (Natural: ${player.position})`;
  }
  return teamPosition;
}

