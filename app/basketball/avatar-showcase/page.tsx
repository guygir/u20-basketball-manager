'use client';

import { useState } from 'react';
import PlayerAvatar from '@/components/PlayerAvatar';
import {
  FACE_SHAPES,
  FACE_SHAPE_WEIGHTS,
  SKIN_TONES,
  EYE_SHAPES,
  EYE_COLORS,
  EYE_COLOR_WEIGHTS,
  EYEBROW_SHAPES,
  NOSE_SHAPES,
  MOUTH_SHAPES,
  HAIR_STYLES,
  HAIR_COLORS,
  HAIR_COLOR_WEIGHTS,
  FACIAL_HAIR,
  ACCESSORIES,
  ACCESSORY_WEIGHTS
} from '@/lib/basketball/avatar-generator';
import type { Player } from '@/lib/basketball/types';

export default function AvatarShowcase() {
  const [selectedCategory, setSelectedCategory] = useState<string>('faceShapes');

  // Helper function to get percentage for a component
  const getPercentage = (categoryId: string, item: string): string => {
    let weight: number | undefined;
    
    switch (categoryId) {
      case 'faceShapes':
        weight = FACE_SHAPE_WEIGHTS[item as keyof typeof FACE_SHAPE_WEIGHTS];
        break;
      case 'eyeColors':
        weight = EYE_COLOR_WEIGHTS[item as keyof typeof EYE_COLOR_WEIGHTS];
        break;
      case 'hairColors':
        weight = HAIR_COLOR_WEIGHTS[item as keyof typeof HAIR_COLOR_WEIGHTS];
        break;
      case 'accessories':
        weight = ACCESSORY_WEIGHTS[item as keyof typeof ACCESSORY_WEIGHTS];
        break;
      default:
        // Equal distribution for other categories
        const category = categories.find(c => c.id === categoryId);
        if (category) {
          weight = 1 / category.items.length;
        }
    }
    
    if (weight !== undefined) {
      return `${(weight * 100).toFixed(1)}%`;
    }
    return '';
  };

  // Create a base player template
  const createTestPlayer = (overrides: any): Player => ({
    id: 'test',
    game_save_id: 'test',
    name: 'Test Player',
    position: 'PG',
    age: 20,
    outside_offense: 10,
    inside_offense: 10,
    outside_defense: 10,
    inside_defense: 10,
    passing: 10,
    athleticism: 10,
    overall_rating: 10,
    fatigue: 0,
    characteristics: [],
    avatar_components: {
      faceShape: 'oval',
      skinTone: 'tone4',
      eyes: 'almond',
      eyeColor: 'brown',
      eyebrows: 'straight',
      nose: 'straight',
      mouth: 'full',
      hairStyle: 'buzz-cut',
      hairColor: 'black',
      facialHair: 'none',
      accessories: 'none',
      ...overrides
    },
    skills: [],
    games_played: 0,
    total_points: 0,
    total_assists: 0,
    total_rebounds: 0,
    created_at: new Date().toISOString()
  });

  const categories = [
    { id: 'faceShapes', name: 'Face Shapes', items: FACE_SHAPES, key: 'faceShape' },
    { id: 'skinTones', name: 'Skin Tones', items: Object.keys(SKIN_TONES), key: 'skinTone' },
    { id: 'eyeShapes', name: 'Eye Shapes', items: EYE_SHAPES, key: 'eyes' },
    { id: 'eyeColors', name: 'Eye Colors', items: Object.keys(EYE_COLORS), key: 'eyeColor' },
    { id: 'eyebrows', name: 'Eyebrow Shapes', items: EYEBROW_SHAPES, key: 'eyebrows' },
    { id: 'noses', name: 'Nose Shapes', items: NOSE_SHAPES, key: 'nose' },
    { id: 'mouths', name: 'Mouth Shapes', items: MOUTH_SHAPES, key: 'mouth' },
    { id: 'hairStyles', name: 'Hair Styles', items: HAIR_STYLES, key: 'hairStyle' },
    { id: 'hairColors', name: 'Hair Colors', items: Object.keys(HAIR_COLORS), key: 'hairColor' },
    { id: 'facialHair', name: 'Facial Hair', items: FACIAL_HAIR, key: 'facialHair' },
    { id: 'accessories', name: 'Accessories', items: ACCESSORIES, key: 'accessories' },
  ];

  const currentCategory = categories.find(c => c.id === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Avatar Component Showcase</h1>
          <p className="text-gray-300">
            View all possible avatar components. Each component is shown with a standard base avatar.
          </p>
        </div>

        {/* Category Selector */}
        <div className="bg-white rounded-lg shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Select Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category.name} ({category.items.length})
              </button>
            ))}
          </div>
        </div>

        {/* Component Display */}
        {currentCategory && (
          <div className="bg-white rounded-lg shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {currentCategory.name} - {currentCategory.items.length} Options
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {currentCategory.items.map((item) => {
                const overrides = { [currentCategory.key]: item };
                const player = createTestPlayer(overrides);
                
                return (
                  <div key={item} className="flex flex-col items-center">
                    <div className="bg-gray-100 rounded-lg p-4 mb-2">
                      <PlayerAvatar player={player} size={80} />
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-800 break-words">
                        {item}
                      </div>
                      <div className="text-xs text-blue-600 font-semibold mt-1">
                        {getPercentage(currentCategory.id, item)}
                      </div>
                      {/* Show color swatch for color-based components */}
                      {(currentCategory.id === 'skinTones' ||
                        currentCategory.id === 'eyeColors' ||
                        currentCategory.id === 'hairColors') && (
                        <div
                          className="w-8 h-8 rounded-full border-2 border-gray-300 mx-auto mt-2"
                          style={{
                            backgroundColor:
                              currentCategory.id === 'skinTones' ? SKIN_TONES[item as keyof typeof SKIN_TONES] :
                              currentCategory.id === 'eyeColors' ? EYE_COLORS[item as keyof typeof EYE_COLORS] :
                              HAIR_COLORS[item as keyof typeof HAIR_COLORS]
                          }}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Back Button */}
        <div className="mt-8 text-center">
          <a
            href="/basketball"
            className="inline-block px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            ← Back to Hub
          </a>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
