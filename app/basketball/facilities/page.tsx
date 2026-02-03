'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadGameState, saveGameState } from '@/lib/basketball/local-storage';
import {
  FACILITIES,
  upgradeFacility,
  getAllFacilityBonuses,
  type FacilityType,
  type FacilityUpgrades,
} from '@/lib/basketball/facilities';
import Link from 'next/link';
import { PageTutorialOverlay } from '@/components/Tutorial';

export default function FacilitiesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [facilities, setFacilities] = useState<FacilityUpgrades>({
    stadium: 0,
    training: 0,
    medical: 0,
    scouting: 0,
  });
  const [coins, setCoins] = useState(0);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const gameState = loadGameState();
    
    if (!gameState) {
      router.push('/basketball');
      return;
    }

    setFacilities(gameState.game.facilities);
    setCoins(gameState.game.coins);
    setLoading(false);
  }, [router]);

  const handleUpgrade = (facilityType: FacilityType) => {
    const gameState = loadGameState();
    if (!gameState) return;

    const result = upgradeFacility(
      facilityType,
      gameState.game.facilities,
      gameState.game.coins
    );

    if (result.success && result.updatedFacilities && result.coinsSpent) {
      // Update game state
      const updatedGameState = {
        ...gameState,
        game: {
          ...gameState.game,
          facilities: result.updatedFacilities,
          coins: gameState.game.coins - result.coinsSpent,
        },
      };
      
      saveGameState(updatedGameState);
      
      setFacilities(result.updatedFacilities);
      setCoins(gameState.game.coins - result.coinsSpent);
      setMessage({ type: 'success', text: result.message });
      
      // Clear message after 5 seconds
      setTimeout(() => setMessage(null), 5000);
    } else {
      setMessage({ type: 'error', text: result.message });
      setTimeout(() => setMessage(null), 5000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <p>Loading facilities...</p>
        </div>
      </div>
    );
  }

  const bonuses = getAllFacilityBonuses(facilities);

  return (
    <>
      <PageTutorialOverlay pageName="facilities" />
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-indigo-700 to-indigo-600 p-8">
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
            <h1 className="text-4xl font-bold text-gray-800 mb-2">🏗️ Facilities</h1>
            <p className="text-gray-600 mb-4">
              Upgrade your facilities for permanent bonuses that persist across all seasons
            </p>
            <div className="flex gap-6 text-gray-600">
              <div>💰 Coins: <span className="font-bold text-green-600">{coins}</span></div>
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

        {/* Info Box */}
        <div className="bg-blue-900 bg-opacity-50 rounded-lg p-6 mb-8 border-2 border-blue-500">
          <h3 className="text-xl font-bold text-white mb-2">💡 About Facilities</h3>
          <ul className="text-gray-200 space-y-1">
            <li>• Facility upgrades are <span className="font-bold text-yellow-300">permanent</span> and persist across all seasons</li>
            <li>• Each facility has 3 levels with increasing costs (300 / 500 / 800 coins)</li>
            <li>• Upgrades provide powerful bonuses that compound over time</li>
            <li>• <span className="font-bold text-green-300">Stadium</span> is recommended first (generates more coins)</li>
          </ul>
        </div>

        {/* Facilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(Object.keys(FACILITIES) as FacilityType[]).map((facilityType) => {
            const facility = FACILITIES[facilityType];
            const currentLevel = facilities[facilityType];
            const isMaxLevel = currentLevel >= facility.levels.length;
            const nextLevel = currentLevel + 1;
            const nextLevelInfo = !isMaxLevel ? facility.levels[nextLevel - 1] : null;
            const canAfford = nextLevelInfo ? coins >= nextLevelInfo.cost : false;

            return (
              <div
                key={facilityType}
                className="bg-white rounded-lg shadow-xl p-6"
              >
                {/* Facility Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-4xl">{facility.icon}</span>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800">{facility.name}</h3>
                        <p className="text-sm text-gray-600">{facility.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600">
                      Level {currentLevel}
                    </div>
                    <div className="text-xs text-gray-600">Max: {facility.levels.length}</div>
                  </div>
                </div>

                {/* Current Bonuses */}
                {currentLevel > 0 && (
                  <div className="mb-4 p-4 bg-green-50 rounded-lg border-2 border-green-200">
                    <div className="text-sm font-bold text-green-800 mb-2">✅ Active Bonuses:</div>
                    <div className="space-y-1">
                      {facility.levels.slice(0, currentLevel).map((level, index) => (
                        <div key={index} className="text-sm text-green-700">
                          • Level {level.level}: {level.effect}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Level Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span>{currentLevel} / {facility.levels.length}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all"
                      style={{ width: `${(currentLevel / facility.levels.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Next Level Info */}
                {!isMaxLevel && nextLevelInfo && (
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                    <div className="text-sm font-bold text-blue-800 mb-2">
                      📈 Next Level ({nextLevel}):
                    </div>
                    <div className="text-sm text-blue-700 mb-2">
                      <span className="font-bold">{nextLevelInfo.effect}</span>
                    </div>
                    <div className="text-xs text-blue-600">
                      {nextLevelInfo.description}
                    </div>
                  </div>
                )}

                {/* Upgrade Button */}
                {isMaxLevel ? (
                  <div className="w-full py-3 px-6 bg-gray-200 text-gray-600 font-bold rounded-lg text-center">
                    ⭐ Max Level Reached
                  </div>
                ) : (
                  <button
                    onClick={() => handleUpgrade(facilityType)}
                    disabled={!canAfford}
                    className={`w-full py-3 px-6 font-bold rounded-lg transition-all ${
                      canAfford
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {canAfford
                      ? `Upgrade to Level ${nextLevel} (${nextLevelInfo?.cost} coins)`
                      : `Need ${nextLevelInfo?.cost} coins (have ${coins})`
                    }
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Active Bonuses Summary */}
        <div className="mt-8 bg-white rounded-lg shadow-xl p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 Active Bonuses Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Stadium</div>
              <div className="text-2xl font-bold text-green-600">
                {bonuses.stadium.level > 0 ? `${Math.round((bonuses.stadium.multiplier - 1) * 100)}%` : '0%'}
              </div>
              <div className="text-xs text-gray-600">Coin Bonus</div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Training</div>
              <div className="text-2xl font-bold text-blue-600">
                Level {bonuses.training.level}
              </div>
              <div className="text-xs text-gray-600">
                {bonuses.training.bonusStats > 0 && `+${bonuses.training.bonusStats} stat`}
                {bonuses.training.fatigueReduction > 0 && ` | -${bonuses.training.fatigueReduction} fatigue`}
                {bonuses.training.doubleChance > 0 && ` | ${bonuses.training.doubleChance * 100}% double`}
                {bonuses.training.level === 0 && 'No bonuses'}
              </div>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Medical</div>
              <div className="text-2xl font-bold text-red-600">
                Level {bonuses.medical.level}
              </div>
              <div className="text-xs text-gray-600">
                {bonuses.medical.trainingFatigueReduction > 0 && `-${bonuses.medical.trainingFatigueReduction} training fatigue`}
                {bonuses.medical.restBonus > 0 && ` | +${bonuses.medical.restBonus} rest`}
                {bonuses.medical.passiveRecovery > 0 && ` | -${bonuses.medical.passiveRecovery}/week`}
                {bonuses.medical.level === 0 && 'No bonuses'}
              </div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Scouting</div>
              <div className="text-2xl font-bold text-purple-600">
                Level {bonuses.scouting.level}
              </div>
              <div className="text-xs text-gray-600">
                {bonuses.scouting.extraProspects > 0 && `+${bonuses.scouting.extraProspects} prospect`}
                {bonuses.scouting.ratingBonus > 0 && ` | +${bonuses.scouting.ratingBonus} rating`}
                {bonuses.scouting.earlyPreview && ` | Early preview`}
                {bonuses.scouting.level === 0 && 'No bonuses'}
              </div>
            </div>
          </div>
        </div>

        {/* Hint */}
        <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 mt-8">
          <h3 className="font-semibold mb-2">💡 About Facilities</h3>
          <p className="text-sm text-gray-300">
            Upgrade your facilities to boost coin earnings from games. Training Center improves training effectiveness,
            Medical Center reduces fatigue faster, and Stadium increases game revenue. Upgrades are permanent and carry over between seasons.
          </p>
        </div>
      </div>
    </div>
    </>
  );
}

