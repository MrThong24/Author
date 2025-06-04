import React, { useState, useEffect, useRef } from 'react';
import MainHeader from 'src/cms/components/Headers/MainHeader';
import useDashboardInfo, { DashboardRequest } from 'src/store/useDashboardStore';
import OverlayLoader from 'src/shared/components/Loading/OverlayLoader';
import dayjs, { Dayjs } from 'dayjs';
import { NoUndefinedRangeValueType } from 'rc-picker/lib/PickerInput/RangePicker';
import { useUrlQuery } from 'src/hooks/useUrlQuery';
import { DatePickerProps } from 'antd';
import isoWeek from 'dayjs/plugin/isoWeek';
import useMediaQuery from 'src/hooks/useMediaQuery';
import DualAxesChart from './components/DualAxesChart';
import AreaChart from './components/AreaChart';
import BaseButton from 'src/shared/components/Buttons/Button';
import { GrUpdate } from 'react-icons/gr';
import BaseSelect from 'src/shared/components/Core/Select';
import PieChart from './components/PieChart';
import useWindowDimensions from 'src/hooks/useWindowDimensions';
import useLayoutStore from 'src/store/layoutStore';
import { BaseDatePicker } from 'src/shared/components/Core/BaseDatePicker';
import {
  transformAmountPercentage,
  transformAreaChart,
  transformInterval,
  transformLine
} from './components/dataTransform';
import { formatCurrencyDecimalVND } from 'src/shared/common/format';
import FilterDropdown from 'src/cms/components/Filter/FilterDropdown';

dayjs.extend(isoWeek);

const getYearMonth = (date: Dayjs) => date.year() * 12 + date.month();

const disabled35DaysDate: DatePickerProps['disabledDate'] = (current, { from, type }) => {
  if (from) {
    const minDate = from.add(-34, 'days');
    const maxDate = from.add(34, 'days');

    switch (type) {
      case 'year':
        return current.year() < minDate.year() || current.year() > maxDate.year();

      case 'month':
        return getYearMonth(current) < getYearMonth(minDate) || getYearMonth(current) > getYearMonth(maxDate);

      default:
        return Math.abs(current.diff(from, 'days')) >= 35;
    }
  }

  return false;
};

const disabled7DaysDate: DatePickerProps['disabledDate'] = (current, { from, type }) => {
  if (from) {
    const minDate = from.add(-6, 'days');
    const maxDate = from.add(6, 'days');

    switch (type) {
      case 'year':
        return current.year() < minDate.year() || current.year() > maxDate.year();

      case 'month':
        return getYearMonth(current) < getYearMonth(minDate) || getYearMonth(current) > getYearMonth(maxDate);

      default:
        return Math.abs(current.diff(from, 'days')) >= 7;
    }
  }

  return false;
};

const RevenueTracking: React.FC = () => {
  const { getQuery } = useUrlQuery();
  const { getDashboardRevenueTracking, isLoading, dashboardRevenueTracking } = useDashboardInfo();
  const isMobile = useMediaQuery('(max-width: 767px)');
  const [filters, setFilters] = useState<DashboardRequest>({
    startDate: getQuery('startDate') || dayjs().subtract(6, 'day').startOf('day'),
    endDate: getQuery('endDate') || dayjs().endOf('day')
  });
  const { collapsed } = useLayoutStore();
  const [activeTab, setActiveTab] = useState<'week' | 'month'>('week');
  const { width } = useWindowDimensions();
  const chartHeight = width > 1536 ? 280 : 300;
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartKey, setChartKey] = useState(0);
  const isFirstRun = useRef(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handleTabClick = (tab: string) => {
    setActiveTab(tab as 'week' | 'month');
  };

  useEffect(() => {
    getDashboardRevenueTracking(filters);
  }, [filters]);

  const handleFilterDateRange = (value: NoUndefinedRangeValueType<Dayjs> | null) => {
    const _filters = { ...filters };
    const startDate = value?.[0] ? dayjs(value?.[0]) : undefined;
    _filters.startDate = startDate;
    if (value?.[1]?.toString().includes('17:00:00')) {
      const endDate = value?.[1] ? dayjs(value?.[1]).add(1, 'day').subtract(1, 'second') : undefined;
      _filters.endDate = endDate;
    }
    setFilters(_filters);
  };

  useEffect(() => {
    if (isFirstRun.current) {
      setTimeout(() => {
        isFirstRun.current = false;
      }, 300);
      return;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setChartKey((prev) => prev + 1);
    }, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [collapsed, width]);

  const chartData = [
    {
      title: 'Doanh thu',
      data: dashboardRevenueTracking?.orderAmountChanged,
      subTitle: 'VND'
    },
    {
      title: 'Đơn hàng',
      data: dashboardRevenueTracking?.orderCountChanged,
      subTitle: 'Đơn hàng'
    },
    {
      title: 'Khách hàng',
      data: dashboardRevenueTracking?.customerCountChanged,
      subTitle: 'Khách'
    },
    {
      title: 'Số lượng món sử dụng',
      data: dashboardRevenueTracking?.productCountChanged,
      subTitle: 'Món'
    }
  ];
  return (
    <OverlayLoader spinning={isLoading}>
      <MainHeader
        title={
          <div className='flex items-center justify-between pr-6'>
            <h2 className='hidden sm:block text-[16px] sm:text-xl xl:text-2xl sm:w-auto '>
              Báo cáo theo dõi doanh thu
            </h2>
            <div className='flex items-center'>
              <div className='ml-2 block xl:hidden'>
                <BaseSelect
                  className='w-[80px] !text-white [&_.ant-select-arrow]:!text-white [&_.ant-select-selection-item]:!text-white [&_.ant-select-selector]:!bg-[var(--primary)] [&_.ant-select-selector]:!rounded-[20px]'
                  value={activeTab}
                  onChange={handleTabClick}
                  options={[
                    {
                      value: 'week',
                      label: 'Tuần'
                    },
                    {
                      value: 'month',
                      label: 'Tháng'
                    }
                  ]}
                />
              </div>
              <div className='mx-2 block xl:hidden'>
                <FilterDropdown
                  filtersFields={[
                    {
                      label: 'Thời gian',
                      type: 'date-range',
                      datePickerProps: {
                        allowClear: false,
                        placeholder: ['Ngày bắt đầu', 'Ngày kết thúc'],
                        disabledDate: activeTab === 'week' ? disabled7DaysDate : disabled35DaysDate
                      }
                    }
                  ]}
                  filters={filters}
                  position='bottomCenter'
                  setFilters={setFilters}
                />
              </div>

              <div className='flex items-center overflow-hidden'>
                <div className='rounded-lg hidden xl:flex items-center gap-4 mr-2'>
                  <h2 className='text-sm ml-2 whitespace-nowrap'>Báo cáo</h2>
                  <BaseSelect
                    className='w-[100px] !text-white [&_.ant-select-arrow]:!text-white [&_.ant-select-selection-item]:!text-white [&_.ant-select-selector]:!bg-[var(--primary)] [&_.ant-select-selector]:!rounded-[20px]'
                    value={activeTab}
                    onChange={handleTabClick}
                    options={[
                      {
                        value: 'week',
                        label: 'Tuần'
                      },
                      {
                        value: 'month',
                        label: 'Tháng'
                      }
                    ]}
                  />
                </div>
                <div className='bg-white rounded-lg hidden xl:block xl:mb-1 '>
                  <BaseDatePicker.RangePicker
                    disabledDate={activeTab === 'week' ? disabled7DaysDate : disabled35DaysDate}
                    value={
                      filters.startDate && filters.endDate ? [dayjs(filters.startDate), dayjs(filters.endDate)] : null
                    }
                    onChange={(value) => handleFilterDateRange(value)}
                    placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
                    allowClear={false}
                    maxDate={dayjs().endOf('day')}
                  />
                </div>
                <BaseButton
                  icon={<GrUpdate />}
                  className='rounded-md px-4 py-2 ml-2'
                  onClick={() => getDashboardRevenueTracking(filters)}
                >
                  {!isMobile ? 'Cập nhật' : ''}
                </BaseButton>
              </div>
            </div>
          </div>
        }
      >
        <div ref={chartRef}>
          <div className='flex items-center gap-2 justify-between mb-4'>
            <h2 className='sm:hidden text-[16px] font-bold '>Báo cáo theo dõi doanh thu</h2>
          </div>
          <div className='grid grid-cols-1'>
            <div className='shadow-base rounded-md bg-white'>
              <h3 className='font-semibold text-base px-4 pt-4'>Tổng quan doanh thu</h3>
              <DualAxesChart
                dataCol={transformInterval(
                  dashboardRevenueTracking?.orderAmount,
                  dayjs(filters.startDate),
                  dayjs(filters.endDate)
                )}
                dataLine={[
                  ...transformLine(
                    dashboardRevenueTracking?.customerCount,
                    dayjs(filters.startDate),
                    dayjs(filters.endDate),
                    'SL khách hàng'
                  ),
                  ...transformLine(
                    dashboardRevenueTracking?.orderCount,
                    dayjs(filters.startDate),
                    dayjs(filters.endDate),
                    'SL đơn hàng'
                  ),
                  ...transformLine(
                    dashboardRevenueTracking?.productCount,
                    dayjs(filters.startDate),
                    dayjs(filters.endDate),
                    'SL món'
                  )
                ]}
                chartKey={chartKey}
              />
            </div>
            {/* Chart: Doanh thu - Đơn Hàng - Khách Hàng - SL Món SD*/}
            <div className='grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-4 lg:gap-6 mt-6'>
              {chartData.map((item, index) => (
                <div key={index} className='shadow-base rounded-md bg-white'>
                  <h2 className='font-semibold text-base px-4 pt-4 text-start sm:text-center'>{item.title}</h2>
                  {item.data?.chart && (
                    <AreaChart
                      data={transformAreaChart(item.data.chart, dayjs(filters.startDate), dayjs(filters.endDate))}
                      chartKey={chartKey}
                      percentChange={((item.data.current - item.data.previous) / item.data.previous) * 100 || 0}
                      isDecrease={(item.data.current || 0) < (item.data.previous || 0)}
                      current={item.data.current}
                      previous={item.data.previous}
                      subTitle={item.subTitle}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-4 lg:gap-6 mt-6 mb-6 '>
              <div className='shadow-base rounded-md bg-white'>
                <h3 className='font-semibold text-base px-4 pt-4'>Tỷ lệ doanh thu theo món (ĐVT:1.000VND)</h3>
                <PieChart
                  chartKey={chartKey}
                  data={transformAmountPercentage(dashboardRevenueTracking?.productAmountPercentage)}
                  height={chartHeight}
                  loading={isLoading}
                  textInner={`${formatCurrencyDecimalVND(dashboardRevenueTracking?.productAmountPercentage?.reduce((sum, item) => sum + item.amount, 0) as number)}\nVND`}
                  fontSize={isMobile ? 12 : 14}
                  fontSizeLable={11}
                  legendPosition={'top'}
                />
              </div>
            </div>
          </div>
        </div>
      </MainHeader>
    </OverlayLoader>
  );
};

export default RevenueTracking;
