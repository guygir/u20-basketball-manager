'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ACHIEVEMENTS,
  loadAchievementProgress,
  getAchievementsByCategory,
  getAchievementStats,
  type Achievement,
  type AchievementProgress,
} from '@/lib/basketball/achievements';
import { PageTutorialOverlay } from '@/components/Tutorial';

export default function AchievementsPage() {
  const router = useRouter();
  const [progress, setProgress] = useState<AchievementProgress | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | Achievement['category']>('all');
  const [stats, setStats] = useState<ReturnType<typeof getAchievementStats> | null>(null);

  useEffect(() => {
    const loadedProgress = loadAchievementProgress();
    setProgress(loadedProgress);
    setStats(getAchievementStats());
  }, []);

  if (!progress || !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-900 via-yellow-700 to-yellow-600 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const categories: Array<{ id: 'all' | Achievement['category']; name: string; icon: string }> = [
    { id: 'all', name: 'All', icon: '🏆' },
    { id: 'wins', name: 'Wins', icon: '🎯' },
    { id: 'season', name: 'Season', icon: '📅' },
    { id: 'team', name: 'Team', icon: '👥' },
    { id: 'progression', name: 'Progression', icon: '⭐' },
    { id: 'special', name: 'Special', icon: '✨' },
  ];

  const tierColors = {
    bronze: 'border-orange-700 bg-orange-900/20',
    silver: 'border-gray-400 bg-gray-700/20',
    gold: 'border-yellow-500 bg-yellow-900/20',
    platinum: 'border-cyan-400 bg-cyan-900/20',
  };

  const tierIcons = {
    bronze: '🥉',
    silver: '🥈',
    gold: '🥇',
    platinum: '💎',
  };

  const filteredAchievements = selectedCategory === 'all'
    ? Object.values(ACHIEVEMENTS)
    : getAchievementsByCategory(selectedCategory);

  // Show all achievements, but hide details for locked hidden ones
  const visibleAchievements = filteredAchievements;

  return (
    <>
      <PageTutorialOverlay pageName="achievements" />
      <div className="min-h-screen bg-gradient-to-br from-yellow-900 via-yellow-700 to-yellow-600 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/basketball"
            className="inline-block mb-4 text-white hover:text-gray-200 transition-colors"
          >
            ← Back to Hub
          </Link>
          <h1 className="text-3xl font-bold">🏆 Achievements</h1>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <div className="text-4xl font-bold text-blue-500">{stats.unlocked}</div>
            <div className="text-gray-400 mt-2">Unlocked</div>
            <div className="text-sm text-gray-500">of {stats.total}</div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <div className="text-4xl font-bold text-green-500">{stats.percentage}%</div>
            <div className="text-gray-400 mt-2">Completion</div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="text-sm text-gray-400 mb-2">By Tier</div>
            <div className="space-y-1 text-sm">
              {Object.entries(stats.byTier).map(([tier, data]) => (
                <div key={tier} className="flex justify-between">
                  <span className="capitalize">{tierIcons[tier as keyof typeof tierIcons]} {tier}:</span>
                  <span className="text-gray-300">{data.unlocked}/{data.total}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="text-sm text-gray-400 mb-2">Progress</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Total Wins:</span>
                <span className="text-gray-300">{progress.totalWins}</span>
              </div>
              <div className="flex justify-between">
                <span>Best Streak:</span>
                <span className="text-gray-300">{progress.bestWinStreak}</span>
              </div>
              <div className="flex justify-between">
                <span>Championships:</span>
                <span className="text-gray-300">{progress.totalChampionships}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`
                px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors
                ${selectedCategory === cat.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }
              `}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleAchievements.map(achievement => {
            const isUnlocked = progress.unlockedAchievements.includes(achievement.id);
            const isHiddenAndLocked = achievement.hidden && !isUnlocked;
            
            return (
              <div
                key={achievement.id}
                className={`
                  rounded-lg p-6 border-2 transition-all
                  ${isUnlocked
                    ? `${tierColors[achievement.tier]} animate-slideUp`
                    : 'border-gray-700 bg-gray-800/50 opacity-60'
                  }
                `}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="text-4xl">{isHiddenAndLocked ? '❓' : achievement.icon}</div>
                  <div className="text-2xl">{isHiddenAndLocked ? '❓' : tierIcons[achievement.tier]}</div>
                </div>
                
                {/* Title */}
                <h3 className={`text-lg font-bold mb-2 ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                  {isHiddenAndLocked ? '???' : achievement.name}
                </h3>
                
                {/* Description */}
                <p className={`text-sm mb-4 ${isUnlocked ? 'text-gray-300' : 'text-gray-600'}`}>
                  {isHiddenAndLocked ? 'Hidden achievement - unlock to reveal!' : achievement.description}
                </p>
                
                {/* Reward */}
                {!isHiddenAndLocked && achievement.reward?.coins && (
                  <div className={`text-sm ${isUnlocked ? 'text-yellow-500' : 'text-gray-600'}`}>
                    💰 Reward: {achievement.reward.coins} coins
                  </div>
                )}
                
                {/* Unlocked Badge */}
                {isUnlocked && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <div className="text-xs text-green-500 font-semibold">
                      ✓ UNLOCKED
                    </div>
                  </div>
                )}
                
                {/* Locked Badge */}
                {!isUnlocked && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <div className="text-xs text-gray-600 font-semibold">
                      🔒 {isHiddenAndLocked ? 'HIDDEN' : 'LOCKED'}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {visibleAchievements.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-xl mb-2">No achievements in this category yet</p>
            <p className="text-sm">Keep playing to unlock more!</p>
          </div>
        )}

        {/* Hint */}
        <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 mt-8">
          <h3 className="font-semibold mb-2">💡 About Achievements</h3>
          <p className="text-sm text-gray-300">
            Achievements are cosmetic milestones that track your progress across all games. They persist even if you delete your save.
            Some achievements are hidden until unlocked. Achievements are purely for bragging rights - no gameplay bonuses!
          </p>
        </div>
      </div>
    </div>
    </>
  );
}

