import React from 'react';
import { Line } from '@ant-design/charts';

interface LineChartProps {
  data: { type: string; value: number }[];
  title?: string;
}

const LineChart: React.FC<LineChartProps> = ({ data, title }) => {
  const lineConfig = {
    data,
    theme: 'academy',
    xField: 'type',
    yField: 'value',
    style: {
      lineWidth: 2
    }
  };

  return <Line title={title} {...lineConfig} />;
};

export default LineChart;
