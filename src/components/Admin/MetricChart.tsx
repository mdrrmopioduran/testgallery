import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface DataPoint {
  label: string;
  value: number;
  date?: string;
}

interface MetricChartProps {
  title: string;
  data: DataPoint[];
  type?: 'bar' | 'line' | 'area';
  color?: string;
  height?: number;
  showTrend?: boolean;
}

const MetricChart: React.FC<MetricChartProps> = ({
  title,
  data,
  type = 'bar',
  color = '#3B82F6',
  height = 200,
  showTrend = true
}) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  
  // Calculate trend
  const firstValue = data[0]?.value || 0;
  const lastValue = data[data.length - 1]?.value || 0;
  const trendPercentage = firstValue > 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;
  const isPositiveTrend = trendPercentage >= 0;

  const renderBarChart = () => (
    <div className="flex items-end space-x-1" style={{ height: `${height}px` }}>
      {data.map((point, index) => {
        const barHeight = maxValue > 0 ? (point.value / maxValue) * (height - 40) : 0;
        return (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div
              className="w-full rounded-t transition-all duration-300 hover:opacity-80 cursor-pointer"
              style={{ 
                height: `${barHeight}px`,
                backgroundColor: color,
                minHeight: '2px'
              }}
              title={`${point.label}: ${point.value}`}
            />
            <span className="text-xs text-gray-500 mt-2 truncate w-full text-center">
              {point.label}
            </span>
          </div>
        );
      })}
    </div>
  );

  const renderLineChart = () => {
    const points = data.map((point, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = maxValue > 0 ? 100 - ((point.value - minValue) / (maxValue - minValue)) * 80 : 50;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div style={{ height: `${height}px` }} className="relative">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="2"
            points={points}
            className="transition-all duration-300"
          />
          {data.map((point, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = maxValue > 0 ? 100 - ((point.value - minValue) / (maxValue - minValue)) * 80 : 50;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="1"
                fill={color}
                className="hover:r-2 transition-all duration-200 cursor-pointer"
              >
                <title>{`${point.label}: ${point.value}`}</title>
              </circle>
            );
          })}
        </svg>
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500">
          {data.map((point, index) => (
            <span key={index} className="truncate">
              {point.label}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderAreaChart = () => {
    const points = data.map((point, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = maxValue > 0 ? 100 - ((point.value - minValue) / (maxValue - minValue)) * 80 : 50;
      return `${x},${y}`;
    }).join(' ');

    const areaPoints = `0,100 ${points} 100,100`;

    return (
      <div style={{ height: `${height}px` }} className="relative">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polygon
            fill={`${color}20`}
            stroke={color}
            strokeWidth="2"
            points={areaPoints}
            className="transition-all duration-300"
          />
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="2"
            points={points}
          />
        </svg>
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500">
          {data.map((point, index) => (
            <span key={index} className="truncate">
              {point.label}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderChart = () => {
    switch (type) {
      case 'line':
        return renderLineChart();
      case 'area':
        return renderAreaChart();
      default:
        return renderBarChart();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-blue-900">{title}</h3>
        {showTrend && (
          <div className="flex items-center space-x-1">
            {isPositiveTrend ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            <span className={`text-sm font-medium ${
              isPositiveTrend ? 'text-green-600' : 'text-red-600'
            }`}>
              {Math.abs(trendPercentage).toFixed(1)}%
            </span>
          </div>
        )}
      </div>
      {renderChart()}
    </div>
  );
};

export default MetricChart;