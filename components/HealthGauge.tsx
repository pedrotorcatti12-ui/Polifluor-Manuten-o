import React from 'react';

interface HealthGaugeProps {
  score: number;
  size?: number;
}

export const HealthGauge: React.FC<HealthGaugeProps> = ({ score, size = 160 }) => {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = () => {
    if (score < 50) return '#ef4444'; // red-500
    if (score < 80) return '#eab308'; // yellow-500
    return '#22c55e'; // green-500
  };

  return (
    <div style={{ width: size, height: size, position: 'relative' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="stroke-gray-200 dark:stroke-gray-700"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={getColor()}
          fill="none"
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
            transition: 'stroke-dashoffset 0.5s ease-out',
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-gray-900 dark:text-white" style={{ color: getColor() }}>
          {Math.round(score)}%
        </span>
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Saúde do Sistema</span>
      </div>
    </div>
  );
};
