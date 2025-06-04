import React, { useEffect, useRef, useState } from 'react';
import { Bar } from '@ant-design/charts';
import useWindowDimensions from 'src/hooks/useWindowDimensions';
import useLayoutStore from 'src/store/layoutStore';

interface BarChartProps {
  data: { type: string; value: number }[];
  title?: string;
  height?: number;
  loading?: boolean;
  color?: string;
  barSize?: number;
  chartKey: number;
}

const BarChart: React.FC<BarChartProps> = ({ title, data, height, color, loading = false, barSize = 30, chartKey }) => {
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  if (loading || totalValue === 0) {
    return (
      <div className='h-[200px] flex justify-center items-center'>
        <p className='text-center text-gray-500 mt-4'>Không có dữ liệu để hiển thị</p>
      </div>
    );
  }

  const barConfig = {
    data,
    xField: 'type',
    yField: 'value',
    theme: 'academy',
    color: color || undefined, // Fixed: Use color prop correctly
    label: {
      style: {
        fill: '#FFFFFF',
        fontWeight: 'bold'
      }
    },
    style: {
      maxWidth: 20
    },
    interaction: {
      tooltip: {
        render: (event: any, { title, items }: any) => `${title}: ${items[0]?.value || ''}`
      }
    },
    axis: {
      y: {
        labelFormatter: (val: any) => (Number.isInteger(val) ? `${val}` : '')
      }
    },
    legend: false
  };

  return <Bar height={height} {...barConfig} />;
};

export default BarChart;
