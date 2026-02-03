'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadGameState, saveGameState } from '@/lib/basketball/local-storage';
import {
  getAllTactics,
  getTacticsByCategory,
  purchaseTactic,
  getTacticEffectsSummary,
  type Tactic,
  type TacticCategory,
} from '@/lib/basketball/tactics';
import Link from 'next/link';
import { PageTutorialOverlay } from '@/components/Tutorial';

type ViewMode = 'purchase' | 'manage';

export default function TacticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('purchase');
  const [ownedTactics, setOwnedTactics] = useState<string[]>([]);
  const [activeTactics, setActiveTactics] = useState<string[]>([]);
  const [coins, setCoins] = useState(0);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<TacticCategory | 'all'>('all');

  useEffect(() => {
    const gameState = loadGameState();
    
    if (!gameState) {
      router.push('/basketball');
      return;
    }

    setOwnedTactics(gameState.game.owned_tactics);
    setActiveTactics(gameState.game.active_tactics);
    setCoins(gameState.game.coins);
    setLoading(false);
  }, [router]);

  const handlePurchase = (tacticId: string) => {
    const gameState = loadGameState();
    if (!gameState) return;

    const result = purchaseTactic(tacticId, gameState.game.owned_tactics, gameState.game.coins);

    if (result.success && result.updatedTactics && result.coinsSpent) {
      const updatedGameState = {
        ...gameState,
        game: {
          ...gameState.game,
          owned_tactics: result.updatedTactics,
          coins: gameState.game.coins - result.coinsSpent,
        },
      };
      
      saveGameState(updatedGameState);
      
      setOwnedTactics(result.updatedTactics);
      setCoins(gameState.game.coins - result.coinsSpent);
      setMessage({ type: 'success', text: result.message });
      
      setTimeout(() => setMessage(null), 5000);
    } else {
      setMessage({ type: 'error', text: result.message });
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleToggleActive = (tacticId: string) => {
    const gameState = loadGameState();
    if (!gameState) return;

    let newActiveTactics: string[];

    if (activeTactics.includes(tacticId)) {
      // Remove from active
      newActiveTactics = activeTactics.filter(id => id !== tacticId);
      setMessage({ type: 'success', text: 'Tactic deactivated' });
    } else {
      // Add to active (max 3)
      if (activeTactics.length >= 3) {
        setMessage({ type: 'error', text: 'Maximum 3 tactics can be active at once' });
        setTimeout(() => setMessage(null), 3000);
        return;
      }
      newActiveTactics = [...activeTactics, tacticId];
      setMessage({ type: 'success', text: 'Tactic activated' });
    }

    const updatedGameState = {
      ...gameState,
      game: {
        ...gameState.game,
        active_tactics: newActiveTactics,
      },
    };
    
    saveGameState(updatedGameState);
    setActiveTactics(newActiveTactics);
    setTimeout(() => setMessage(null), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <p>Loading tactics...</p>
        </div>
      </div>
    );
  }

  const allTactics = getAllTactics();
  const filteredTactics = selectedCategory === 'all' 
    ? allTactics 
    : getTacticsByCategory(selectedCategory);

  const availableTactics = filteredTactics.filter(t => !ownedTactics.includes(t.id));
  const ownedTacticsList = filteredTactics.filter(t => ownedTactics.includes(t.id));

  return (
    <>
      <PageTutorialOverlay pageName="tactics" />
      <div className="min-h-screen bg-gradient-to-br from-orange-900 via-orange-700 to-orange-600 p-8">
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
            <h1 className="text-4xl font-bold text-gray-800 mb-2">📋 Tactics</h1>
            <p className="text-gray-600 mb-4">
              Purchase and equip tactics to gain strategic advantages in games
            </p>
            <div className="flex gap-6 text-gray-600">
              <div>💰 Coins: <span className="font-bold text-green-600">{coins}</span></div>
              <div>📚 Owned: <span className="font-bold text-blue-600">{ownedTactics.length}/{allTactics.length}</span></div>
              <div>⚡ Active: <span className="font-bold text-orange-600">{activeTactics.length}/3</span></div>
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

        {/* Active Tactics Summary */}
        {activeTactics.length > 0 && (
          <div className="bg-orange-900 bg-opacity-50 rounded-lg p-6 mb-8 border-2 border-orange-500">
            <h3 className="text-xl font-bold text-white mb-3">⚡ Active Tactics Effects</h3>
            <div className="space-y-2">
              {getTacticEffectsSummary(activeTactics).map((effect, index) => (
                <div key={index} className="text-gray-200 text-sm">
                  {effect}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View Mode Toggle */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setViewMode('purchase')}
            className={`flex-1 py-4 px-6 rounded-lg font-bold text-xl transition-all ${
              viewMode === 'purchase'
                ? 'bg-green-600 text-white shadow-xl scale-105'
                : 'bg-white text-gray-800 hover:bg-gray-100'
            }`}
          >
            🛒 Purchase Tactics
          </button>
          <button
            onClick={() => setViewMode('manage')}
            className={`flex-1 py-4 px-6 rounded-lg font-bold text-xl transition-all ${
              viewMode === 'manage'
                ? 'bg-blue-600 text-white shadow-xl scale-105'
                : 'bg-white text-gray-800 hover:bg-gray-100'
            }`}
          >
            ⚙️ Manage Tactics ({ownedTactics.length})
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {(['all', 'offense', 'defense', 'balanced'] as const).map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-bold whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? 'bg-white text-gray-800 shadow-lg'
                  : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
              }`}
            >
              {category === 'all' ? '🎯 All' :
               category === 'offense' ? '⚔️ Offense' :
               category === 'defense' ? '🛡️ Defense' :
               '⚖️ Balanced'}
            </button>
          ))}
        </div>

        {/* Purchase View */}
        {viewMode === 'purchase' && (
          <div>
            <h2 className="text-3xl font-bold text-white mb-6">
              Available Tactics ({availableTactics.length})
            </h2>
            
            {availableTactics.length === 0 ? (
              <div className="bg-white rounded-lg p-8 text-center text-gray-600">
                <p className="text-xl">You own all tactics in this category! 🎉</p>
                <p className="mt-2">Try a different category or manage your active tactics.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableTactics.map((tactic) => (
                  <TacticCard
                    key={tactic.id}
                    tactic={tactic}
                    isOwned={false}
                    isActive={false}
                    coins={coins}
                    onPurchase={handlePurchase}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Manage View */}
        {viewMode === 'manage' && (
          <div>
            <h2 className="text-3xl font-bold text-white mb-6">
              Your Tactics ({ownedTacticsList.length})
            </h2>
            
            {ownedTacticsList.length === 0 ? (
              <div className="bg-white rounded-lg p-8 text-center text-gray-600">
                <p className="text-xl">You don't own any tactics yet.</p>
                <p className="mt-2">Purchase tactics to use them in games!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ownedTacticsList.map((tactic) => (
                  <TacticCard
                    key={tactic.id}
                    tactic={tactic}
                    isOwned={true}
                    isActive={activeTactics.includes(tactic.id)}
                    coins={coins}
                    onToggleActive={handleToggleActive}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Hint */}
        <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 mt-8">
          <h3 className="font-semibold mb-2 text-white">💡 About Tactics</h3>
          <p className="text-sm text-gray-300">
            Purchase tactics to gain strategic advantages in games. You can have up to 3 tactics active at once.
            Tactics provide stat boosts, special abilities, or counter specific opponent strategies. Owned tactics persist across seasons.
          </p>
        </div>
      </div>
    </div>
    </>
  );
}

// Tactic Card Component
function TacticCard({
  tactic,
  isOwned,
  isActive,
  coins,
  onPurchase,
  onToggleActive,
}: {
  tactic: Tactic;
  isOwned: boolean;
  isActive: boolean;
  coins: number;
  onPurchase?: (id: string) => void;
  onToggleActive?: (id: string) => void;
}) {
  const canAfford = coins >= tactic.cost;

  return (
    <div className={`bg-white rounded-lg shadow-xl p-6 ${
      isActive ? 'ring-4 ring-orange-400' : ''
    }`}>
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-4xl">{tactic.icon}</span>
            <div>
              <h3 className="text-xl font-bold text-gray-800">{tactic.name}</h3>
              <span className={`text-xs px-2 py-1 rounded-full ${
                tactic.category === 'offense' ? 'bg-red-100 text-red-800' :
                tactic.category === 'defense' ? 'bg-blue-100 text-blue-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {tactic.category}
              </span>
            </div>
          </div>
          {isActive && (
            <span className="text-orange-600 font-bold text-sm">⚡ ACTIVE</span>
          )}
        </div>
        <p className="text-sm text-gray-600">{tactic.description}</p>
      </div>

      {/* Effects */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-xs font-bold text-gray-700 mb-2">Effects:</div>
        <div className="space-y-1">
          {Object.entries(tactic.effects).map(([stat, value]) => {
            if (!value) return null;
            const sign = value > 0 ? '+' : '';
            const color = value > 0 ? 'text-green-600' : 'text-red-600';
            const statName = stat.replace(/([A-Z])/g, ' $1').trim();
            return (
              <div key={stat} className={`text-xs ${color}`}>
                {sign}{value}% {statName}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Button */}
      {!isOwned ? (
        <button
          onClick={() => onPurchase?.(tactic.id)}
          disabled={!canAfford}
          className={`w-full py-3 px-4 font-bold rounded-lg transition-all ${
            canAfford
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {canAfford
            ? `Purchase (${tactic.cost} coins)`
            : `Need ${tactic.cost} coins`
          }
        </button>
      ) : (
        <button
          onClick={() => onToggleActive?.(tactic.id)}
          className={`w-full py-3 px-4 font-bold rounded-lg transition-all ${
            isActive
              ? 'bg-orange-600 hover:bg-orange-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isActive ? 'Deactivate' : 'Activate'}
        </button>
      )}
    </div>
  );
}

