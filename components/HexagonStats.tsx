'use client';

import React from 'react';

interface HexagonStatsProps {
  stats: {
    outsideOffense: number;
    insideOffense: number;
    outsideDefense: number;
    insideDefense: number;
    passing: number;
    athleticism: number;
  };
  size?: 'small' | 'medium' | 'large';
}

export default function HexagonStats({ stats, size = 'medium' }: HexagonStatsProps) {
  // Size configurations with extra bottom padding for "Ath" label
  const sizeConfig = {
    small: { width: 140, height: 150, fontSize: 10 },
    medium: { width: 220, height: 235, fontSize: 12 },
    large: { width: 320, height: 340, fontSize: 14 },
  };

  const config = sizeConfig[size];
  const centerX = config.width / 2;
  const centerY = (config.height / 2) - 5; // Shift center up slightly
  const radius = (config.width / 2) * 0.60;

  // Calculate hexagon points (6 points, starting from top)
  const angles = [0, 60, 120, 180, 240, 300];
  const maxValue = 20; // Stats range from 1-20

  // Stat labels and values in order
  const statData = [
    { label: 'Out Off', value: stats.outsideOffense, color: '#ef4444' },
    { label: 'In Off', value: stats.insideOffense, color: '#f97316' },
    { label: 'Pass', value: stats.passing, color: '#eab308' },
    { label: 'Ath', value: stats.athleticism, color: '#22c55e' },
    { label: 'In Def', value: stats.insideDefense, color: '#3b82f6' },
    { label: 'Out Def', value: stats.outsideDefense, color: '#8b5cf6' },
  ];

  // Calculate points for the stat polygon
  const statPoints = statData.map((stat, i) => {
    const angle = (angles[i] - 90) * (Math.PI / 180); // -90 to start from top
    const distance = (stat.value / maxValue) * radius;
    const x = centerX + distance * Math.cos(angle);
    const y = centerY + distance * Math.sin(angle);
    return { x, y };
  });

  // Calculate points for the max value hexagon (reference)
  const maxPoints = angles.map((angle) => {
    const rad = (angle - 90) * (Math.PI / 180);
    const x = centerX + radius * Math.cos(rad);
    const y = centerY + radius * Math.sin(rad);
    return { x, y };
  });

  // Create path strings
  const statPath = statPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
  const maxPath = maxPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  return (
    <div className="relative inline-block">
      <svg width={config.width} height={config.height} className="drop-shadow-lg">
        {/* Background circles for reference */}
        {[0.25, 0.5, 0.75, 1].map((scale) => (
          <circle
            key={scale}
            cx={centerX}
            cy={centerY}
            r={radius * scale}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="1"
            opacity="0.3"
          />
        ))}

        {/* Max value hexagon outline */}
        <path d={maxPath} fill="none" stroke="#d1d5db" strokeWidth="2" />

        {/* Stat value hexagon */}
        <path d={statPath} fill="rgba(59, 130, 246, 0.2)" stroke="#3b82f6" strokeWidth="2" />

        {/* Stat points and labels */}
        {statData.map((stat, i) => {
          const angle = (angles[i] - 90) * (Math.PI / 180);
          const labelDistance = radius * 1.35;
          const labelX = centerX + labelDistance * Math.cos(angle);
          const labelY = centerY + labelDistance * Math.sin(angle);

          return (
            <g key={i}>
              {/* Stat point */}
              <circle cx={statPoints[i].x} cy={statPoints[i].y} r="4" fill={stat.color} />

              {/* Stat label */}
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={config.fontSize}
                fontWeight="600"
                fill="#374151"
              >
                {stat.label}
              </text>

              {/* Stat value */}
              <text
                x={labelX}
                y={labelY + config.fontSize + 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={config.fontSize - 2}
                fill="#6b7280"
              >
                {stat.value}
              </text>
            </g>
          );
        })}

        {/* Center point */}
        <circle cx={centerX} cy={centerY} r="3" fill="#1f2937" />
      </svg>
    </div>
  );
}

