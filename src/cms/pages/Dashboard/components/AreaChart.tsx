import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Tiny } from '@ant-design/plots';
import { IoCaretDownOutline, IoCaretUpOutline } from 'react-icons/io5';
import { useTheme } from 'src/provider/ThemeContext';
import { IoMdArrowDown, IoMdArrowUp } from 'react-icons/io';
import { formatCurrencyDecimalVND } from 'src/shared/common/format';

type DataItem = {
  value: number;
  index: number;
};
interface AreaProps {
  data: DataItem[];
  chartKey: number;
  percentChange: number;
  subTitle: string;
  current: number;
  previous: number;
  isDecrease: boolean;
}

const AreaChart: React.FC<AreaProps> = ({ data, chartKey, percentChange, subTitle, current, previous, isDecrease }) => {
  const { theme } = useTheme();

  const isCurrency = subTitle?.toLowerCase().includes('vnd');
  const formattedCurrent = isCurrency ? formatCurrencyDecimalVND(current) : current;
  const formattedPrevious = isCurrency ? formatCurrencyDecimalVND(previous) : previous;
  const hasData = useMemo(() => data?.some((item) => item.value > 0), [data]);
  const config = {
    data,
    height: 80,
    autoFit: true,
    shape: 'smooth',
    xField: 'index',
    yField: 'value',
    style: {
      fill: `linear-gradient(-90deg, white 0%, ${isDecrease ? theme.danger : theme.successGreen} 100%)`,
      fillOpacity: 0.6
    },
    line: {
      shape: 'smooth',
      style: {
        stroke: isDecrease ? theme.danger : theme.successGreen,
        lineWidth: 2
      }
    }
  };

  return (
    <div className='flex sm:block items-center gap-2 sm:gap-0 px-2 sm:px-8 sm:py-4 '>
      <div className='flex flex-1 flex-col sm:flex-row justify-center sm:gap-4 my-4'>
        <div className='text-start sm:text-center flex-1'>
          <span className='text-primary text-[18px] smtext-[20px] font-semibold'>{formattedCurrent}</span>
          <br className='hidden sm:block' />
          <span>{subTitle}</span>
        </div>
        <h2 className='w-px h-auto bg-gray-300'></h2>
        <div className='text-start sm:text-center flex-1 '>
          <div className='hidden sm:flex items-center justify-center gap-1'>
            {isDecrease ? (
              <IoCaretDownOutline className='text-danger' size={32} />
            ) : (
              <IoCaretUpOutline className='text-darkGreen' size={32} />
            )}
            {previous !== 0 && (
              <span className='text-[20px] font-semibold'>
                {Math.abs(percentChange) % 1 === 0
                  ? `${Math.abs(percentChange).toFixed(0)}%`
                  : `${Math.abs(percentChange).toFixed(2)}%`}
              </span>
            )}
          </div>
          <div className='flex items-center sm:hidden mt-2'>
            {isDecrease ? (
              <IoMdArrowDown className='text-danger' size={16} />
            ) : (
              <IoMdArrowUp className='text-darkGreen' size={16} />
            )}
            {previous !== 0 && (
              <span className={`${isDecrease ? 'text-danger' : 'text-darkGreen'} mr-2`}>
                {Math.abs(percentChange) % 1 === 0
                  ? `${Math.abs(percentChange).toFixed(0)}%`
                  : `${Math.abs(percentChange).toFixed(2)}%`}
              </span>
            )}
            <span>
              ( vs {formattedPrevious} {subTitle})
            </span>
          </div>

          <span className='hidden sm:flex justify-center'>
            (vs {formattedPrevious} {subTitle})
          </span>
        </div>
      </div>
      {hasData ? <Tiny.Area {...config} key={chartKey} /> : <div className='h-20'></div>}
    </div>
  );
};

export default AreaChart;
