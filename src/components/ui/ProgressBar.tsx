import { FC } from 'react';

interface ProgressBarProps {
  value: number;
  color?: string;
}

const ProgressBar: FC<ProgressBarProps> = ({ value, color = 'primary' }) => {
  const colorClasses = {
    primary: 'bg-primary-600',
    blue: 'bg-blue-400',
    light: 'bg-blue-300',
  };

  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className={`${colorClasses[color as keyof typeof colorClasses]} h-2 rounded-full`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
};

interface StatisticRowProps {
  label: string;
  value: number;
  color?: string;
}

export const StatisticRow: FC<StatisticRowProps> = ({ label, value, color }) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">{label}</span>
        <span className="text-sm font-medium text-gray-900">{value}%</span>
      </div>
      <ProgressBar value={value} color={color} />
    </div>
  );
};

export default ProgressBar;