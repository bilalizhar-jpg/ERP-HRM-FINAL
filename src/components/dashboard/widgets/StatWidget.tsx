import React from 'react';
import { WidgetContainer } from '../WidgetContainer';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatWidgetProps {
  id: string;
  title: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  size?: 'small' | 'medium' | 'large' | 'full';
}

export const StatWidget: React.FC<StatWidgetProps> = ({
  id,
  title,
  value,
  trend,
  icon,
  size = 'small',
}) => {
  return (
    <WidgetContainer id={id} title={title} size={size}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              <span>{Math.abs(trend.value)}% from last period</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            {icon}
          </div>
        )}
      </div>
    </WidgetContainer>
  );
};
