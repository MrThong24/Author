import React, { useCallback } from 'react';
import { DualAxes } from '@ant-design/plots';
import { formatCurrencyDecimalVND } from 'src/shared/common/format';

interface DualAxesProps {
  dataCol: { date: string | Date; value: number; type: string }[];
  dataLine: { date: string | Date; count: number; name: string }[];
  chartKey: number;
}

const DualAxesChart: React.FC<DualAxesProps> = ({ dataCol, dataLine, chartKey }) => {
  const getTooltipItems = useCallback(
    ({ name, count }: { name: string; count: number }) => ({
      name,
      value: count
    }),
    []
  );

  const getTooltipDataCol = useCallback(({ name, value }: { name: string; value: number }) => {
    return {
      name,
      value: formatCurrencyDecimalVND(value)
    };
  }, []);

  const formatYAxisLabelLeft = useCallback((value: number) => {
    const num = Number(value);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)} triệu`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed()} nghìn`;
    }
    return num.toString();
  }, []);

  const formatYAxisLabelRight = useCallback((value: number) => {
    if (Number.isInteger(value)) {
      return `${value}`;
    }
    return '';
  }, []);

  const hasData = dataCol.some((item) => item.value > 0) || dataLine.some((item) => item.count > 0);

  if (!hasData) {
    return (
      <div className='h-[200px] flex justify-center items-center'>
        <p className='text-center text-gray-500 mt-4'>Không có dữ liệu để hiển thị</p>
      </div>
    );
  }
  const config = {
    xField: 'date',
    children: [
      {
        data: dataCol,
        type: 'interval',
        yField: 'value',
        colorField: 'type',
        autoFit: true,
        groupField: 'type',
        group: true,
        style: { maxWidth: 80 },
        tooltip: {
          items: [getTooltipDataCol]
        },
        interaction: {
          elementHighlight: { background: true }
        },
        axis: {
          y: dataCol.some((item) => item.value > 0)
            ? {
                labelFormatter: formatYAxisLabelLeft
              }
            : false
        }
      },
      {
        data: dataLine,
        type: 'line',
        yField: 'count',
        colorField: 'name',
        autoFit: true,
        style: { lineWidth: 2 },
        axis: {
          y: dataLine.some((item) => item.count > 0)
            ? { position: 'right', labelFormatter: formatYAxisLabelRight }
            : false
        },
        scale: { series: { independent: true } },
        tooltip: {
          items: [getTooltipItems]
        },
        interaction: {
          tooltip: {
            crosshairs: false,
            marker: true
          }
        }
      }
    ]
  };
  return <DualAxes {...config} keyField={chartKey} />;
};

export default DualAxesChart;
