// Local storage manager for Basketball Roguelike MVP
// Handles all game state persistence using localStorage

import type {
  GameSave,
  Player,
  Facilities,
  Action,
  GameResult,
  DraftProspect,
  CompleteGameState,
  RetiredPlayer,
} from './types';

const STORAGE_KEY = 'basketball_roguelike_game';

// Helper to generate UUIDs
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Load complete game state from localStorage
export function loadGameState(): CompleteGameState | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error loading game state:', error);
    return null;
  }
}

// Save complete game state to localStorage
export function saveGameState(state: CompleteGameState): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving game state:', error);
  }
}

// Clear game state
export function clearGameState(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

// Get current game
export function getCurrentGame(): GameSave | null {
  const state = loadGameState();
  return state?.game || null;
}

// Get all players for current game
export function getPlayers(gameId?: string): Player[] {
  const state = loadGameState();
  if (!state) return [];
  
  if (gameId) {
    return state.players.filter(p => p.game_save_id === gameId);
  }
  
  return state.players;
}

// Get facilities for current game
export function getFacilities(gameId?: string): Facilities | null {
  const state = loadGameState();
  if (!state) return null;
  
  if (gameId && state.facilities.game_save_id !== gameId) {
    return null;
  }
  
  return state.facilities;
}

// Get actions for current game
export function getActions(gameId?: string): Action[] {
  const state = loadGameState();
  if (!state) return [];
  
  if (gameId) {
    return state.actions.filter(a => a.game_save_id === gameId);
  }
  
  return state.actions;
}

// Get game results
export function getResults(gameId?: string): GameResult[] {
  const state = loadGameState();
  if (!state) return [];
  
  if (gameId) {
    return state.results.filter(r => r.game_save_id === gameId);
  }
  
  return state.results;
}

// Get draft prospects
export function getDraftProspects(gameId?: string): DraftProspect[] {
  const state = loadGameState();
  if (!state) return [];
  
  if (gameId) {
    return state.draftProspects.filter(d => d.game_save_id === gameId);
  }
  
  return state.draftProspects;
}

// Update game
export function updateGame(updates: Partial<GameSave>): GameSave | null {
  const state = loadGameState();
  if (!state) return null;
  
  state.game = {
    ...state.game,
    ...updates,
    updated_at: new Date().toISOString(),
  };
  
  saveGameState(state);
  return state.game;
}

// Update player
export function updatePlayer(playerId: string, updates: Partial<Player>): Player | null {
  const state = loadGameState();
  if (!state) return null;
  
  const playerIndex = state.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) return null;
  
  state.players[playerIndex] = {
    ...state.players[playerIndex],
    ...updates,
  };
  
  saveGameState(state);
  return state.players[playerIndex];
}

// Update multiple players
export function updatePlayers(updates: Array<{ id: string; updates: Partial<Player> }>): Player[] {
  const state = loadGameState();
  if (!state) return [];
  
  const updatedPlayers: Player[] = [];
  
  updates.forEach(({ id, updates: playerUpdates }) => {
    const playerIndex = state.players.findIndex(p => p.id === id);
    if (playerIndex !== -1) {
      state.players[playerIndex] = {
        ...state.players[playerIndex],
        ...playerUpdates,
      };
      updatedPlayers.push(state.players[playerIndex]);
    }
  });
  
  saveGameState(state);
  return updatedPlayers;
}

// Update facilities
export function updateFacilities(updates: Partial<Facilities>): Facilities | null {
  const state = loadGameState();
  if (!state) return null;
  
  state.facilities = {
    ...state.facilities,
    ...updates,
    updated_at: new Date().toISOString(),
  };
  
  saveGameState(state);
  return state.facilities;
}

// Add action
export function addAction(action: Omit<Action, 'id' | 'created_at'>): Action {
  const state = loadGameState();
  if (!state) throw new Error('No game state found');
  
  const newAction: Action = {
    ...action,
    id: generateId(),
    created_at: new Date().toISOString(),
  };
  
  state.actions.push(newAction);
  saveGameState(state);
  
  return newAction;
}

// Add game result
export function addGameResult(result: Omit<GameResult, 'id' | 'played_at'>): GameResult {
  const state = loadGameState();
  if (!state) throw new Error('No game state found');
  
  const newResult: GameResult = {
    ...result,
    id: generateId(),
    played_at: new Date().toISOString(),
  };
  
  state.results.push(newResult);
  saveGameState(state);
  
  return newResult;
}

// Add draft prospect
export function addDraftProspect(prospect: Omit<DraftProspect, 'id' | 'created_at'>): DraftProspect {
  const state = loadGameState();
  if (!state) throw new Error('No game state found');
  
  const newProspect: DraftProspect = {
    ...prospect,
    id: generateId(),
    created_at: new Date().toISOString(),
  };
  
  state.draftProspects.push(newProspect);
  saveGameState(state);
  
  return newProspect;
}

// Add player
export function addPlayer(player: Omit<Player, 'id' | 'created_at'>): Player {
  const state = loadGameState();
  if (!state) throw new Error('No game state found');
  
  const newPlayer: Player = {
    ...player,
    id: generateId(),
    created_at: new Date().toISOString(),
  };
  
  state.players.push(newPlayer);
  saveGameState(state);
  
  return newPlayer;
}

// Remove player
export function removePlayer(playerId: string): boolean {
  const state = loadGameState();
  if (!state) return false;
  
  const initialLength = state.players.length;
  state.players = state.players.filter(p => p.id !== playerId);
  
  if (state.players.length < initialLength) {
    saveGameState(state);
    return true;
  }
  
  return false;
}

// Create new game state
export function createNewGame(
  game: Omit<GameSave, 'id' | 'created_at' | 'updated_at' | 'last_played_at'>,
  players: Omit<Player, 'id' | 'created_at' | 'game_save_id'>[],
  facilities: Omit<Facilities, 'id' | 'created_at' | 'updated_at' | 'game_save_id'>
): CompleteGameState {
  const gameId = generateId();
  const now = new Date().toISOString();
  
  const newGame: GameSave = {
    ...game,
    id: gameId,
    created_at: now,
    updated_at: now,
    last_played_at: now,
  };
  
  const newPlayers: Player[] = players.map(p => ({
    ...p,
    id: generateId(),
    game_save_id: gameId,
    created_at: now,
  }));
  
  const newFacilities: Facilities = {
    ...facilities,
    id: generateId(),
    game_save_id: gameId,
    created_at: now,
    updated_at: now,
  };
  
  const newState: CompleteGameState = {
    game: newGame,
    players: newPlayers,
    facilities: newFacilities,
    actions: [],
    results: [],
    draftProspects: [],
    hallOfFame: [],
  };
  
  saveGameState(newState);
  return newState;
}

// Check if game exists
export function hasActiveGame(): boolean {
  const state = loadGameState();
  return state !== null && state.game.is_active;
}

// Get game statistics
export function getGameStats(gameId?: string) {
  const state = loadGameState();
  if (!state) return null;
  
  const results = gameId 
    ? state.results.filter(r => r.game_save_id === gameId)
    : state.results;
  
  const wins = results.filter(r => r.won).length;
  const losses = results.filter(r => !r.won).length;
  const totalPoints = results.reduce((sum, r) => sum + r.player_score, 0);
  const avgPoints = results.length > 0 ? totalPoints / results.length : 0;
  
  return {
    wins,
    losses,
    totalGames: results.length,
    winRate: results.length > 0 ? wins / results.length : 0,
    avgPoints: Math.round(avgPoints),
  };
}

// Get Hall of Fame players
export function getHallOfFame(): RetiredPlayer[] {
  const state = loadGameState();
  if (!state) return [];
  return state.hallOfFame || [];
}

// Add player to Hall of Fame
export function addToHallOfFame(player: Player, seasonsPlayed: number): RetiredPlayer {
  const state = loadGameState();
  if (!state) throw new Error('No game state found');
  
  const retiredPlayer: RetiredPlayer = {
    id: player.id,
    name: player.name,
    position: player.position,
    age: player.age,
    outside_offense: player.outside_offense,
    inside_offense: player.inside_offense,
    passing: player.passing,
    outside_defense: player.outside_defense,
    inside_defense: player.inside_defense,
    athleticism: player.athleticism,
    overall_rating: player.overall_rating,
    characteristics: player.characteristics,
    avatar_components: player.avatar_components,
    skills: player.skills,
    games_played: player.games_played,
    total_points: player.total_points,
    total_assists: player.total_assists,
    total_rebounds: player.total_rebounds,
    seasons_played: seasonsPlayed,
    retired_at: new Date().toISOString(),
  };
  
  console.log('[HALL OF FAME] Adding retired player:', retiredPlayer.name, 'age', retiredPlayer.age);
  
  if (!state.hallOfFame) {
    state.hallOfFame = [];
    console.log('[HALL OF FAME] Initialized empty hall of fame array');
  }
  
  state.hallOfFame.push(retiredPlayer);
  console.log('[HALL OF FAME] Hall of Fame now has', state.hallOfFame.length, 'players');
  saveGameState(state);
  console.log('[HALL OF FAME] Game state saved');
  
  return retiredPlayer;
}

