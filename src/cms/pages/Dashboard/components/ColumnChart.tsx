import React, { useEffect, useRef, useState } from 'react';
import { Column } from '@ant-design/charts';
import formatPrice from 'src/shared/utils/common';
import dayjs from 'dayjs';
import useLayoutStore from 'src/store/layoutStore';

interface ColumnChartProps {
  data: { type: string; value: number }[];
  title?: string;
  height?: number;
  xLabel?: string;
  yLabel?: string;
  separator?: string;
  vndTooltipFormat?: boolean;
  labelVisible?: boolean;
  loading?: boolean;
  color?: string;
  numberOfScroll?: number;
  chartKey: number;
}

const ColumnChart: React.FC<ColumnChartProps> = ({
  title,
  data,
  height,
  xLabel = '',
  yLabel = '',
  separator = ':',
  vndTooltipFormat = false,
  labelVisible = true,
  loading = false,
  color,
  numberOfScroll = 7,
  chartKey
}) => {
  const totalValue = data.reduce((sum, item) => sum + item.value, 0); // Tổng giá trị

  const showScrollbar = data.length > numberOfScroll;
  if (loading || totalValue === 0) {
    return (
      <div className='h-[200px] flex justify-center items-center'>
        <p className='text-center text-gray-500 mt-4'>Không có dữ liệu để hiển thị</p>
      </div>
    );
  }
  const columnConfig = {
    data,
    xField: 'type',
    yField: 'value',
    theme: 'academy',
    colorField: color ? color : 'type',
    label: labelVisible
      ? {
          style: {
            fill: '#FFFFFF',
            fontWeight: 'bold'
          }
        }
      : false,
    interaction: {
      tooltip: {
        render: (event: any, { title, items }: any) => {
          return `${xLabel} ${title} ${separator} ${yLabel} ${vndTooltipFormat ? `${formatPrice(items[0].value)} VNĐ` : items[0].value}`;
        }
      }
    },
    axis: {
      y: {
        labelFormatter: (val: any) => {
          if (Number.isInteger(val)) {
            return `${val}`;
          }
          return '';
        }
      }
    },
    scrollbar: showScrollbar ? { x: {} } : undefined,
    legend: false,
    columnWidthRatio: 2
  };

  return <Column title={title} {...columnConfig} sizeField={30} height={height} />;
};

export default ColumnChart;
