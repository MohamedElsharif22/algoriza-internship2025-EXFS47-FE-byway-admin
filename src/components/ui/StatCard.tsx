import { FC } from 'react';
import { Card, CardContent } from './Card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: {
    value: string;
    direction: 'up' | 'down';
  };
  className?: string;
}

const StatCard: FC<StatCardProps> = ({ title, value, icon: Icon, trend, className }) => {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center">
            <Icon className="w-6 h-6 text-primary-600" />
          </div>
          <div className="ml-4 flex-1">
            <h3 className="text-2xl font-semibold text-gray-900">{value}</h3>
            <p className="text-sm text-gray-500">{title}</p>
          </div>
          {trend && (
            <div className="ml-auto">
              <span
                className={`inline-flex items-center text-sm font-medium ${
                  trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {trend.direction === 'up' ? '↑' : '↓'} {trend.value}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;