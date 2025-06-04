import React from 'react';
import { Gauge, GaugeConfig } from '@ant-design/plots';

interface GaugeChartProps {
  target: number;
}

const COLOR_LEGENDS = [
  { range: [0, 2], label: '0 - 2 phút', color: '#4cd696' },
  { range: [2, 4], label: '2 - 4 phút', color: '#37A2DA' },
  { range: [4, 6], label: '4 - 6 phút', color: '#ffa462' },
  { range: [6, 8], label: '>6 phút', color: '#FD666D' }
];

const GaugeChart: React.FC<GaugeChartProps> = ({ target }) => {
  const config: GaugeConfig = {
    autoFit: true,
    height: 300,
    theme: 'academy',
    data: {
      target: target > 8 ? 8 : target,
      total: 8,
      thresholds: COLOR_LEGENDS.map((item) => item.range[1])
    },
    style: {
      textContent: (target: number, total: number) => ``
    },
    axis: {
      y: {
        labelFormatter: (val: any) => {
          if (val == 8) {
            return `Max`;
          }
          return val;
        }
      }
    },
    legend: false,
    scale: {
      color: {
        range: COLOR_LEGENDS.map((item) => item.color)
      }
    }
  };

  return (
    <div className='flex flex-col items-center relative overflow-hidden'>
      <Gauge {...config} />
      <div className='flex justify-center mt-4 space-x-6 absolute bottom-4'>
        {COLOR_LEGENDS.map((item, index) => (
          <div key={index} className='flex items-center space-x-2'>
            <div className='w-3 h-3 rounded-sm' style={{ backgroundColor: item.color }}></div>
            <span className='text-xs text-gray-700 font-normal'>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GaugeChart;
