'use client';

export interface StatChangeProps {
  value: number;
  showZero?: boolean;
}

export function StatChange({ value, showZero = false }: StatChangeProps) {
  if (value === 0 && !showZero) return null;

  const isPositive = value > 0;
  const color = isPositive ? 'text-green-500' : 'text-red-500';
  const icon = isPositive ? '↑' : '↓';
  const sign = isPositive ? '+' : '';

  return (
    <span className={`${color} font-semibold text-sm animate-slideUp`}>
      {icon} {sign}{value}
    </span>
  );
}

export function StatBadge({
  label,
  value,
  change,
  color = 'blue',
}: {
  label: string;
  value: number;
  change?: number;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
}) {
  const colors = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
    yellow: 'bg-yellow-600',
    purple: 'bg-purple-600',
  };

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-700 rounded-full">
      <span className="text-gray-400 text-sm">{label}:</span>
      <span className="text-white font-bold">{value}</span>
      {change !== undefined && change !== 0 && (
        <StatChange value={change} />
      )}
    </div>
  );
}

export function ProgressBar({
  value,
  max,
  label,
  color = 'blue',
  showPercentage = true,
}: {
  value: number;
  max: number;
  label?: string;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
  showPercentage?: boolean;
}) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
  };

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between mb-1">
          <span className="text-sm text-gray-400">{label}</span>
          {showPercentage && (
            <span className="text-sm text-gray-400">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${colors[color]} transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

