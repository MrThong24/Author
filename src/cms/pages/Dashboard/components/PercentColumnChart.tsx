import React from 'react';
import { Column } from '@ant-design/charts';

interface PercentColumnChartProps {
  data: { type: string; statusGroup: string; count: number }[];
  height?: number;
}

const PercentColumnChart: React.FC<PercentColumnChartProps> = ({ height, data }) => {
  const config = {
    data,
    xField: 'type',
    yField: 'count',
    theme: 'academy',
    colorField: 'statusGroup',
    percent: true,
    stack: true,
    interaction: {
      tooltip: {
        shared: true
      }
    },
    tooltip: { channel: 'y0', valueFormatter: '.0%' },
    axis: {
      y: {
        labelFormatter: (val: any) => {
          return val * 100 + '%';
        }
      }
    },
    legend: {
      color: {
        position: 'top',
        itemLabelFontSize: 12,
        layout: {
          justifyContent: 'center'
        }
      }
    }
  };
  return <Column {...config} height={height} sizeField={50} />;
};

export default PercentColumnChart;
