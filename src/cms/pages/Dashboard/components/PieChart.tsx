import React, { useEffect, useRef, useState } from 'react';
import { Pie } from '@ant-design/charts';
import { useTheme } from 'src/provider/ThemeContext';

interface PieChartProps {
  data: { type: string; value: number }[];
  title?: string;
  height?: number;
  loading?: boolean;
  legendPosition?: 'top' | 'right';
  textInner?: string;
  chartKey: number;
  fontSize?: number;
  fontSizeLable?: number;
}

const PieChart: React.FC<PieChartProps> = ({
  title,
  data,
  height,
  loading = false,
  legendPosition = 'top',
  textInner,
  fontSize = 14,
  fontSizeLable = 12,
  chartKey
}) => {
  const totalValue = data.reduce((sum, item) => sum + item.value, 0); // Tổng giá trị
  const { theme } = useTheme();
  if (loading || totalValue === 0) {
    return (
      <div className='h-[200px] flex  justify-center items-center'>
        <p className='text-center text-gray-500 mt-4'>Không có dữ liệu để hiển thị</p>
      </div>
    );
  }
  const pieConfig = {
    data,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: false,
    theme: 'academy',
    tooltip: (d: any, index: any, data: any, column: any) => {
      return {
        value: `${data[index].type}`
      };
    },

    legend: {
      color: {
        position: legendPosition,
        itemLabelFontSize: fontSizeLable,
        layout: {
          justifyContent: 'center'
        }
      }
    },
    innerRadius: 0.5,
    ...(textInner && {
      annotations: [
        {
          type: 'text',
          style: {
            text: textInner,
            x: '50%',
            y: '50%',
            textAlign: 'center',
            fontSize: fontSize,
            fontStyle: 'bold',
            fill: theme.primary
          },
          tooltip: false
        }
      ]
    })
  };

  return <Pie {...pieConfig} height={height} />;
};

export default PieChart;
