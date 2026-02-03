'use client';

import React from 'react';
import type { Player } from '@/lib/basketball/types';
import {
  type AvatarComponents,
  getSkinToneColor,
  getEyeColor,
  getHairColor,
} from '@/lib/basketball/avatar-generator';

interface PlayerAvatarProps {
  player: Player;
  size?: number;
  className?: string;
}

export default function PlayerAvatar({ player, size = 100, className = '' }: PlayerAvatarProps) {
  // Get avatar components from player data
  const components = player.avatar_components as AvatarComponents | null;
  
  if (!components) {
    // Fallback: simple colored circle with initials
    const initials = player.name.split(' ').map(n => n[0]).join('').slice(0, 2);
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
    const colorIndex = player.name.charCodeAt(0) % colors.length;
    
    return (
      <div 
        className={`flex items-center justify-center rounded-full font-bold text-white ${className}`}
        style={{ 
          width: size, 
          height: size, 
          backgroundColor: colors[colorIndex],
          fontSize: size * 0.4 
        }}
      >
        {initials}
      </div>
    );
  }
  
  const skinColor = getSkinToneColor(components.skinTone);
  const eyeColor = getEyeColor(components.eyeColor);
  const hairColor = getHairColor(components.hairColor);
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={`player-avatar ${className}`}
      style={{ display: 'block' }}
    >
      {/* Background */}
      <rect width="200" height="200" fill="#f3f4f6" />
      
      {/* Face Shape */}
      <FaceShape type={components.faceShape} color={skinColor} />
      
      {/* Hair (back layer for long hair) */}
      {['long', 'afro', 'dreadlocks'].includes(components.hairStyle) && (
        <HairBack style={components.hairStyle} color={hairColor} />
      )}
      
      {/* Ears */}
      <Ears skinColor={skinColor} />
      
      {/* Eyes */}
      <Eyes shape={components.eyes} color={eyeColor} />
      
      {/* Eyebrows */}
      <Eyebrows shape={components.eyebrows} color={hairColor} />
      
      {/* Nose */}
      <Nose shape={components.nose} skinColor={skinColor} />
      
      {/* Mouth */}
      <Mouth shape={components.mouth} />
      
      {/* Facial Hair */}
      {components.facialHair !== 'none' && (
        <FacialHair type={components.facialHair} color={hairColor} />
      )}
      
      {/* Hair (front layer) */}
      {!['long', 'afro', 'dreadlocks', 'bald'].includes(components.hairStyle) && (
        <HairFront style={components.hairStyle} color={hairColor} />
      )}
      
      {/* Accessories */}
      {components.accessories !== 'none' && (
        <Accessories type={components.accessories} />
      )}
    </svg>
  );
}

// Face Shape Component
function FaceShape({ type, color }: { type: string; color: string }) {
  switch (type) {
    case 'round':
      return <circle cx="100" cy="110" r="75" fill={color} />;
    case 'square':
      return <rect x="35" y="35" width="130" height="150" rx="15" fill={color} />;
    case 'heart':
      return <path d="M 100 40 Q 140 40 160 80 Q 160 120 100 180 Q 40 120 40 80 Q 60 40 100 40" fill={color} />;
    case 'diamond':
      return <path d="M 100 30 L 160 110 L 100 190 L 40 110 Z" fill={color} />;
    case 'triangle':
      return <path d="M 100 40 L 170 180 L 30 180 Z" fill={color} />;
    case 'oblong':
      return <ellipse cx="100" cy="110" rx="55" ry="95" fill={color} />;
    case 'rectangle':
      return <rect x="40" y="30" width="120" height="160" rx="10" fill={color} />;
    case 'pear':
      return <path d="M 100 40 Q 70 40 50 80 Q 40 120 60 160 Q 80 190 100 190 Q 120 190 140 160 Q 160 120 150 80 Q 130 40 100 40" fill={color} />;
    case 'inverted-triangle':
      return <path d="M 30 40 L 170 40 L 100 180 Z" fill={color} />;
    case 'oval':
    default:
      return <ellipse cx="100" cy="110" rx="65" ry="85" fill={color} />;
  }
}

// Hair Back Layer
function HairBack({ style, color }: { style: string; color: string }) {
  if (style === 'afro') {
    return <circle cx="100" cy="70" r="80" fill={color} />;
  }
  if (style === 'long') {
    return (
      <g>
        <ellipse cx="60" cy="100" rx="25" ry="60" fill={color} />
        <ellipse cx="140" cy="100" rx="25" ry="60" fill={color} />
      </g>
    );
  }
  return null;
}

// Ears
function Ears({ skinColor }: { skinColor: string }) {
  return (
    <g>
      <ellipse cx="40" cy="100" rx="12" ry="18" fill={skinColor} />
      <ellipse cx="160" cy="100" rx="12" ry="18" fill={skinColor} />
    </g>
  );
}

// Eyes Component
function Eyes({ shape, color }: { shape: string; color: string }) {
  const eyeY = 95;
  const leftX = 75;
  const rightX = 125;
  
  // Round eyes - larger circles
  if (shape === 'round') {
    return (
      <g>
        <circle cx={leftX} cy={eyeY} r="12" fill="white" />
        <circle cx={leftX} cy={eyeY} r="7" fill={color} />
        <circle cx={leftX} cy={eyeY - 2} r="2" fill="white" opacity="0.8" />
        
        <circle cx={rightX} cy={eyeY} r="12" fill="white" />
        <circle cx={rightX} cy={eyeY} r="7" fill={color} />
        <circle cx={rightX} cy={eyeY - 2} r="2" fill="white" opacity="0.8" />
      </g>
    );
  }
  
  // Almond eyes - elongated ellipse
  if (shape === 'almond') {
    return (
      <g>
        <ellipse cx={leftX} cy={eyeY} rx="12" ry="10" fill="white" />
        <circle cx={leftX} cy={eyeY} r="6" fill={color} />
        <circle cx={leftX} cy={eyeY - 2} r="2" fill="white" opacity="0.8" />
        
        <ellipse cx={rightX} cy={eyeY} rx="12" ry="10" fill="white" />
        <circle cx={rightX} cy={eyeY} r="6" fill={color} />
        <circle cx={rightX} cy={eyeY - 2} r="2" fill="white" opacity="0.8" />
      </g>
    );
  }
  
  // Hooded eyes - with upper lid
  if (shape === 'hooded') {
    return (
      <g>
        <ellipse cx={leftX} cy={eyeY} rx="10" ry="12" fill="white" />
        <circle cx={leftX} cy={eyeY} r="6" fill={color} />
        <path d={`M ${leftX - 12} ${eyeY - 8} Q ${leftX} ${eyeY - 5} ${leftX + 12} ${eyeY - 8}`} fill="none" stroke="#8B7355" strokeWidth="2" />
        
        <ellipse cx={rightX} cy={eyeY} rx="10" ry="12" fill="white" />
        <circle cx={rightX} cy={eyeY} r="6" fill={color} />
        <path d={`M ${rightX - 12} ${eyeY - 8} Q ${rightX} ${eyeY - 5} ${rightX + 12} ${eyeY - 8}`} fill="none" stroke="#8B7355" strokeWidth="2" />
      </g>
    );
  }
  
  // Upturned eyes - angled up at outer corners
  if (shape === 'upturned') {
    return (
      <g>
        <ellipse cx={leftX} cy={eyeY} rx="10" ry="12" transform={`rotate(-10 ${leftX} ${eyeY})`} fill="white" />
        <circle cx={leftX} cy={eyeY} r="6" fill={color} />
        
        <ellipse cx={rightX} cy={eyeY} rx="10" ry="12" transform={`rotate(10 ${rightX} ${eyeY})`} fill="white" />
        <circle cx={rightX} cy={eyeY} r="6" fill={color} />
      </g>
    );
  }
  
  // Downturned eyes - angled down at outer corners
  if (shape === 'downturned') {
    return (
      <g>
        <ellipse cx={leftX} cy={eyeY} rx="10" ry="12" transform={`rotate(10 ${leftX} ${eyeY})`} fill="white" />
        <circle cx={leftX} cy={eyeY} r="6" fill={color} />
        
        <ellipse cx={rightX} cy={eyeY} rx="10" ry="12" transform={`rotate(-10 ${rightX} ${eyeY})`} fill="white" />
        <circle cx={rightX} cy={eyeY} r="6" fill={color} />
      </g>
    );
  }
  
  // Monolid eyes - flatter, less visible lid
  if (shape === 'monolid') {
    return (
      <g>
        <ellipse cx={leftX} cy={eyeY} rx="11" ry="8" fill="white" />
        <circle cx={leftX} cy={eyeY} r="5" fill={color} />
        
        <ellipse cx={rightX} cy={eyeY} rx="11" ry="8" fill="white" />
        <circle cx={rightX} cy={eyeY} r="5" fill={color} />
      </g>
    );
  }
  
  // Deep-set eyes - appear more recessed
  if (shape === 'deep-set') {
    return (
      <g>
        <ellipse cx={leftX} cy={eyeY + 2} rx="9" ry="11" fill="white" />
        <circle cx={leftX} cy={eyeY + 2} r="5" fill={color} />
        <ellipse cx={leftX} cy={eyeY - 5} rx="12" ry="4" fill="#D3D3D3" opacity="0.3" />
        
        <ellipse cx={rightX} cy={eyeY + 2} rx="9" ry="11" fill="white" />
        <circle cx={rightX} cy={eyeY + 2} r="5" fill={color} />
        <ellipse cx={rightX} cy={eyeY - 5} rx="12" ry="4" fill="#D3D3D3" opacity="0.3" />
      </g>
    );
  }
  
  // Close-set eyes
  if (shape === 'close-set') {
    return (
      <g>
        <ellipse cx="85" cy={eyeY} rx="10" ry="14" fill="white" />
        <circle cx="85" cy={eyeY} r="6" fill={color} />
        <circle cx="85" cy={eyeY - 2} r="2" fill="white" opacity="0.8" />
        
        <ellipse cx="115" cy={eyeY} rx="10" ry="14" fill="white" />
        <circle cx="115" cy={eyeY} r="6" fill={color} />
        <circle cx="115" cy={eyeY - 2} r="2" fill="white" opacity="0.8" />
      </g>
    );
  }
  
  // Wide-set eyes
  if (shape === 'wide-set') {
    return (
      <g>
        <ellipse cx="70" cy={eyeY} rx="10" ry="14" fill="white" />
        <circle cx="70" cy={eyeY} r="6" fill={color} />
        <circle cx="70" cy={eyeY - 2} r="2" fill="white" opacity="0.8" />
        
        <ellipse cx="130" cy={eyeY} rx="10" ry="14" fill="white" />
        <circle cx="130" cy={eyeY} r="6" fill={color} />
        <circle cx="130" cy={eyeY - 2} r="2" fill="white" opacity="0.8" />
      </g>
    );
  }
  
  // Protruding eyes - larger and more prominent
  if (shape === 'protruding') {
    return (
      <g>
        <circle cx={leftX} cy={eyeY} r="14" fill="white" />
        <circle cx={leftX} cy={eyeY} r="8" fill={color} />
        <circle cx={leftX} cy={eyeY - 2} r="2" fill="white" opacity="0.8" />
        
        <circle cx={rightX} cy={eyeY} r="14" fill="white" />
        <circle cx={rightX} cy={eyeY} r="8" fill={color} />
        <circle cx={rightX} cy={eyeY - 2} r="2" fill="white" opacity="0.8" />
      </g>
    );
  }
  
  // Small eyes
  if (shape === 'small') {
    return (
      <g>
        <ellipse cx={leftX} cy={eyeY} rx="8" ry="10" fill="white" />
        <circle cx={leftX} cy={eyeY} r="5" fill={color} />
        
        <ellipse cx={rightX} cy={eyeY} rx="8" ry="10" fill="white" />
        <circle cx={rightX} cy={eyeY} r="5" fill={color} />
      </g>
    );
  }
  
  // Large eyes
  if (shape === 'large') {
    return (
      <g>
        <ellipse cx={leftX} cy={eyeY} rx="13" ry="16" fill="white" />
        <circle cx={leftX} cy={eyeY} r="8" fill={color} />
        <circle cx={leftX} cy={eyeY - 2} r="2" fill="white" opacity="0.8" />
        
        <ellipse cx={rightX} cy={eyeY} rx="13" ry="16" fill="white" />
        <circle cx={rightX} cy={eyeY} r="8" fill={color} />
        <circle cx={rightX} cy={eyeY - 2} r="2" fill="white" opacity="0.8" />
      </g>
    );
  }
  
  // Default
  return (
    <g>
      <ellipse cx={leftX} cy={eyeY} rx="10" ry="14" fill="white" />
      <circle cx={leftX} cy={eyeY} r="6" fill={color} />
      <circle cx={leftX} cy={eyeY - 2} r="2" fill="white" opacity="0.8" />
      
      <ellipse cx={rightX} cy={eyeY} rx="10" ry="14" fill="white" />
      <circle cx={rightX} cy={eyeY} r="6" fill={color} />
      <circle cx={rightX} cy={eyeY - 2} r="2" fill="white" opacity="0.8" />
    </g>
  );
}

// Eyebrows Component
function Eyebrows({ shape, color }: { shape: string; color: string }) {
  const y = 78;
  
  if (shape === 'straight') {
    return (
      <g>
        <path d={`M 60 ${y} L 90 ${y}`} stroke={color} strokeWidth="3" strokeLinecap="round" />
        <path d={`M 110 ${y} L 140 ${y}`} stroke={color} strokeWidth="3" strokeLinecap="round" />
      </g>
    );
  }
  
  if (shape === 'arched') {
    return (
      <g>
        <path d={`M 60 ${y + 2} Q 75 ${y - 8} 90 ${y + 2}`} stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d={`M 110 ${y + 2} Q 125 ${y - 8} 140 ${y + 2}`} stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
    );
  }
  
  if (shape === 'rounded') {
    return (
      <g>
        <path d={`M 60 ${y} Q 75 ${y - 4} 90 ${y}`} stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d={`M 110 ${y} Q 125 ${y - 4} 140 ${y}`} stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
    );
  }
  
  if (shape === 's-shaped') {
    return (
      <g>
        <path d={`M 60 ${y} Q 70 ${y - 3} 75 ${y} Q 80 ${y + 2} 90 ${y}`} stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d={`M 110 ${y} Q 120 ${y + 2} 125 ${y} Q 130 ${y - 3} 140 ${y}`} stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
    );
  }
  
  if (shape === 'angled') {
    return (
      <g>
        <path d={`M 60 ${y + 2} L 75 ${y - 5} L 90 ${y}`} stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d={`M 110 ${y} L 125 ${y - 5} L 140 ${y + 2}`} stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    );
  }
  
  if (shape === 'flat') {
    return (
      <g>
        <path d={`M 60 ${y} L 90 ${y - 1}`} stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d={`M 110 ${y - 1} L 140 ${y}`} stroke={color} strokeWidth="2" strokeLinecap="round" />
      </g>
    );
  }
  
  if (shape === 'bushy') {
    return (
      <g>
        <path d={`M 60 ${y} Q 75 ${y - 5} 90 ${y}`} stroke={color} strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d={`M 110 ${y} Q 125 ${y - 5} 140 ${y}`} stroke={color} strokeWidth="5" fill="none" strokeLinecap="round" />
      </g>
    );
  }
  
  if (shape === 'thin') {
    return (
      <g>
        <path d={`M 60 ${y} Q 75 ${y - 3} 90 ${y}`} stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d={`M 110 ${y} Q 125 ${y - 3} 140 ${y}`} stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </g>
    );
  }
  
  // Default: straight
  return (
    <g>
      <path d={`M 60 ${y} L 90 ${y}`} stroke={color} strokeWidth="3" strokeLinecap="round" />
      <path d={`M 110 ${y} L 140 ${y}`} stroke={color} strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}

// Nose Component
function Nose({ shape, skinColor }: { shape: string; skinColor: string }) {
  const darkerSkin = adjustColor(skinColor, -20);
  
  if (shape === 'straight') {
    return (
      <g>
        <line x1="100" y1="100" x2="95" y2="120" stroke={darkerSkin} strokeWidth="2" />
        <line x1="95" y1="120" x2="105" y2="120" stroke={darkerSkin} strokeWidth="2" />
      </g>
    );
  }
  
  if (shape === 'roman') {
    return (
      <g>
        <path d="M 100 95 Q 102 105 100 115 L 95 120 L 105 120" stroke={darkerSkin} strokeWidth="2" fill="none" />
      </g>
    );
  }
  
  if (shape === 'button') {
    return <ellipse cx="100" cy="115" rx="8" ry="6" fill={darkerSkin} />;
  }
  
  if (shape === 'hawk') {
    return (
      <g>
        <path d="M 100 95 Q 98 105 96 115 L 92 120 L 105 120" stroke={darkerSkin} strokeWidth="2" fill="none" />
      </g>
    );
  }
  
  if (shape === 'snub') {
    return (
      <g>
        <ellipse cx="100" cy="112" rx="9" ry="7" fill={darkerSkin} />
        <line x1="95" y1="118" x2="105" y2="118" stroke={darkerSkin} strokeWidth="2" />
      </g>
    );
  }
  
  if (shape === 'greek') {
    return (
      <g>
        <line x1="100" y1="90" x2="100" y2="120" stroke={darkerSkin} strokeWidth="2" />
        <line x1="95" y1="120" x2="105" y2="120" stroke={darkerSkin} strokeWidth="2" />
      </g>
    );
  }
  
  if (shape === 'bulbous') {
    return (
      <g>
        <ellipse cx="100" cy="115" rx="11" ry="10" fill={darkerSkin} />
        <line x1="93" y1="122" x2="107" y2="122" stroke={darkerSkin} strokeWidth="2" />
      </g>
    );
  }
  
  if (shape === 'narrow') {
    return (
      <g>
        <line x1="100" y1="100" x2="98" y2="120" stroke={darkerSkin} strokeWidth="1.5" />
        <line x1="98" y1="120" x2="102" y2="120" stroke={darkerSkin} strokeWidth="1.5" />
      </g>
    );
  }
  
  // Default: straight
  return (
    <g>
      <line x1="100" y1="100" x2="95" y2="120" stroke={darkerSkin} strokeWidth="2" />
      <line x1="95" y1="120" x2="105" y2="120" stroke={darkerSkin} strokeWidth="2" />
    </g>
  );
}

// Mouth Component
function Mouth({ shape }: { shape: string }) {
  const y = 140;
  
  if (shape === 'full') {
    return (
      <g>
        <path d={`M 80 ${y} Q 100 ${y + 5} 120 ${y}`} stroke="#8B4513" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d={`M 85 ${y + 2} Q 100 ${y + 6} 115 ${y + 2}`} stroke="#FF6B9D" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
    );
  }
  
  if (shape === 'thin') {
    return <line x1="85" y1={y} x2="115" y2={y} stroke="#8B4513" strokeWidth="1.5" strokeLinecap="round" />;
  }
  
  if (shape === 'wide') {
    return <path d={`M 70 ${y} Q 100 ${y + 5} 130 ${y}`} stroke="#8B4513" strokeWidth="2" fill="none" strokeLinecap="round" />;
  }
  
  if (shape === 'small') {
    return <line x1="90" y1={y} x2="110" y2={y} stroke="#8B4513" strokeWidth="2" strokeLinecap="round" />;
  }
  
  if (shape === 'bow') {
    return (
      <g>
        <path d={`M 80 ${y} Q 90 ${y - 2} 100 ${y} Q 110 ${y - 2} 120 ${y}`} stroke="#8B4513" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
    );
  }
  
  if (shape === 'straight') {
    return <line x1="85" y1={y} x2="115" y2={y} stroke="#8B4513" strokeWidth="2" strokeLinecap="round" />;
  }
  
  if (shape === 'upturned') {
    return <path d={`M 80 ${y} Q 100 ${y + 8} 120 ${y}`} stroke="#8B4513" strokeWidth="2" fill="none" strokeLinecap="round" />;
  }
  
  if (shape === 'downturned') {
    return <path d={`M 80 ${y} Q 100 ${y - 5} 120 ${y}`} stroke="#8B4513" strokeWidth="2" fill="none" strokeLinecap="round" />;
  }
  
  if (shape === 'asymmetric') {
    return <path d={`M 80 ${y} Q 95 ${y + 3} 100 ${y} Q 110 ${y - 2} 120 ${y + 1}`} stroke="#8B4513" strokeWidth="2" fill="none" strokeLinecap="round" />;
  }
  
  if (shape === 'pouty') {
    return (
      <g>
        <path d={`M 80 ${y} Q 100 ${y + 6} 120 ${y}`} stroke="#8B4513" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <ellipse cx="100" cy={y + 4} rx="15" ry="6" fill="#FF6B9D" opacity="0.3" />
      </g>
    );
  }
  
  // Default: neutral
  return <line x1="85" y1={y} x2="115" y2={y} stroke="#8B4513" strokeWidth="2" strokeLinecap="round" />;
}

// Facial Hair Component
function FacialHair({ type, color }: { type: string; color: string }) {
  if (type === 'stubble') {
    return (
      <g opacity="0.3">
        <ellipse cx="100" cy="155" rx="35" ry="20" fill={color} />
      </g>
    );
  }
  
  if (type === 'full-beard') {
    return (
      <g>
        <ellipse cx="100" cy="160" rx="45" ry="30" fill={color} />
        <rect x="70" y="140" width="60" height="20" fill={color} />
      </g>
    );
  }
  
  if (type === 'goatee') {
    return <ellipse cx="100" cy="160" rx="15" ry="20" fill={color} />;
  }
  
  if (type === 'mustache') {
    return (
      <g>
        <ellipse cx="85" cy="138" rx="18" ry="6" fill={color} />
        <ellipse cx="115" cy="138" rx="18" ry="6" fill={color} />
      </g>
    );
  }
  
  if (type === 'van-dyke') {
    return (
      <g>
        {/* Mustache */}
        <ellipse cx="85" cy="138" rx="18" ry="6" fill={color} />
        <ellipse cx="115" cy="138" rx="18" ry="6" fill={color} />
        {/* Goatee */}
        <ellipse cx="100" cy="160" rx="12" ry="18" fill={color} />
      </g>
    );
  }
  
  if (type === 'soul-patch') {
    return <ellipse cx="100" cy="155" rx="8" ry="12" fill={color} />;
  }
  
  if (type === 'sideburns') {
    return (
      <g>
        <rect x="35" y="100" width="10" height="40" rx="3" fill={color} />
        <rect x="155" y="100" width="10" height="40" rx="3" fill={color} />
      </g>
    );
  }
  
  return null;
}

// Hair Front Layer
function HairFront({ style, color }: { style: string; color: string }) {
  if (style === 'bald') {
    return null;
  }
  
  if (style === 'buzz-cut' || style === 'crew-cut') {
    return (
      <path
        d="M 35 90 Q 50 30 100 25 Q 150 30 165 90"
        fill={color}
      />
    );
  }
  
  if (style === 'fade') {
    return (
      <g>
        <path d="M 35 95 Q 50 35 100 30 Q 150 35 165 95" fill={color} />
        <path d="M 45 100 Q 55 50 100 45 Q 145 50 155 100" fill={color} opacity="0.7" />
      </g>
    );
  }
  
  if (style === 'spiky') {
    return (
      <g>
        <path d="M 60 80 L 55 40 L 65 80" fill={color} />
        <path d="M 80 75 L 80 30 L 85 75" fill={color} />
        <path d="M 100 70 L 100 25 L 105 70" fill={color} />
        <path d="M 120 75 L 120 30 L 125 75" fill={color} />
        <path d="M 140 80 L 145 40 L 135 80" fill={color} />
      </g>
    );
  }
  
  if (style === 'mohawk') {
    return (
      <g>
        <rect x="85" y="20" width="30" height="70" fill={color} />
        <path d="M 85 20 Q 100 10 115 20" fill={color} />
      </g>
    );
  }
  
  if (style === 'cornrows') {
    return (
      <g>
        <path d="M 40 85 Q 45 40 50 85" stroke={color} strokeWidth="4" fill="none" />
        <path d="M 55 80 Q 60 35 65 80" stroke={color} strokeWidth="4" fill="none" />
        <path d="M 70 75 Q 75 30 80 75" stroke={color} strokeWidth="4" fill="none" />
        <path d="M 85 70 Q 90 28 95 70" stroke={color} strokeWidth="4" fill="none" />
        <path d="M 100 68 Q 100 25 100 68" stroke={color} strokeWidth="4" fill="none" />
        <path d="M 105 70 Q 110 28 115 70" stroke={color} strokeWidth="4" fill="none" />
        <path d="M 120 75 Q 125 30 130 75" stroke={color} strokeWidth="4" fill="none" />
        <path d="M 135 80 Q 140 35 145 80" stroke={color} strokeWidth="4" fill="none" />
        <path d="M 150 85 Q 155 40 160 85" stroke={color} strokeWidth="4" fill="none" />
      </g>
    );
  }
  
  if (style === 'short-curly') {
    return (
      <g>
        <circle cx="60" cy="60" r="12" fill={color} />
        <circle cx="80" cy="50" r="13" fill={color} />
        <circle cx="100" cy="45" r="14" fill={color} />
        <circle cx="120" cy="50" r="13" fill={color} />
        <circle cx="140" cy="60" r="12" fill={color} />
        <path d="M 35 85 Q 50 70 100 70 Q 150 70 165 85" fill={color} />
      </g>
    );
  }
  
  if (style === 'medium-wavy') {
    return (
      <g>
        <path d="M 35 85 Q 50 30 100 25 Q 150 30 165 85" fill={color} />
        <path d="M 40 90 Q 50 75 60 85 Q 70 95 80 85 Q 90 75 100 85 Q 110 95 120 85 Q 130 75 140 85 Q 150 95 160 90" stroke={color} strokeWidth="3" fill="none" />
      </g>
    );
  }
  
  if (style === 'slicked-back') {
    return (
      <g>
        <path d="M 35 85 Q 50 30 100 20 Q 150 30 165 85" fill={color} />
        <path d="M 50 70 Q 75 25 100 22" stroke={color} strokeWidth="2" fill="none" opacity="0.5" />
        <path d="M 150 70 Q 125 25 100 22" stroke={color} strokeWidth="2" fill="none" opacity="0.5" />
      </g>
    );
  }
  
  if (style === 'side-part') {
    return (
      <g>
        <path d="M 35 85 Q 50 30 95 25 Q 150 30 165 85" fill={color} />
        <line x1="95" y1="25" x2="95" y2="70" stroke="#000" strokeWidth="1" opacity="0.3" />
      </g>
    );
  }
  
  if (style === 'receding') {
    return (
      <g>
        <path d="M 45 95 Q 55 40 100 30 Q 145 40 155 95" fill={color} />
        <path d="M 45 95 Q 50 85 55 95" fill={color} />
        <path d="M 155 95 Q 150 85 145 95" fill={color} />
      </g>
    );
  }
  
  if (style === 'dreadlocks') {
    // Dreadlocks handled in HairBack, return null for front
    return null;
  }
  
  // Default: short hair
  return (
    <path
      d="M 35 85 Q 50 30 100 25 Q 150 30 165 85 L 165 95 Q 150 90 100 90 Q 50 90 35 95 Z"
      fill={color}
    />
  );
}

// Accessories Component
function Accessories({ type }: { type: string }) {
  if (type === 'glasses') {
    return (
      <g>
        <rect x="60" y="88" width="25" height="20" rx="3" fill="none" stroke="#333" strokeWidth="2" />
        <rect x="115" y="88" width="25" height="20" rx="3" fill="none" stroke="#333" strokeWidth="2" />
        <line x1="85" y1="98" x2="115" y2="98" stroke="#333" strokeWidth="2" />
      </g>
    );
  }
  
  if (type === 'sunglasses') {
    return (
      <g>
        <rect x="60" y="88" width="25" height="20" rx="3" fill="#222" stroke="#000" strokeWidth="2" />
        <rect x="115" y="88" width="25" height="20" rx="3" fill="#222" stroke="#000" strokeWidth="2" />
        <line x1="85" y1="98" x2="115" y2="98" stroke="#000" strokeWidth="2" />
      </g>
    );
  }
  
  if (type === 'headband') {
    return (
      <rect x="30" y="65" width="140" height="8" fill="#E74C3C" rx="2" />
    );
  }
  
  if (type === 'earring') {
    return (
      <g>
        <circle cx="160" cy="105" r="4" fill="#FFD700" stroke="#DAA520" strokeWidth="1" />
      </g>
    );
  }
  
  if (type === 'bandana') {
    return (
      <g>
        <path d="M 30 70 L 170 70 L 165 80 L 35 80 Z" fill="#FF6347" />
        <circle cx="175" cy="75" r="6" fill="#FF6347" />
        <circle cx="178" cy="78" r="2" fill="#FFF" />
        <circle cx="172" cy="78" r="2" fill="#FFF" />
      </g>
    );
  }
  
  return null;
}

// Helper function to adjust color brightness
function adjustColor(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

