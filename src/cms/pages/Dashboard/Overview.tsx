import React, { useState, useEffect, useRef } from 'react';
import PieChart from './components/PieChart';
import BarChart from './components/BarChart';
import RatingReport from './components/RatingReport';
import MainHeader from 'src/cms/components/Headers/MainHeader';
import TotalList from './components/TotalList';
import useDashboardInfo, { DashboardRequest } from 'src/store/useDashboardStore';
import OverlayLoader from 'src/shared/components/Loading/OverlayLoader';
import dayjs, { Dayjs } from 'dayjs';
import { NoUndefinedRangeValueType } from 'rc-picker/lib/PickerInput/RangePicker';
import {
  transformOrderAmountByDate,
  transformOrderCountByDate,
  transformOrderCountPopular,
  transformProduct,
  transformRatingData,
  transformRequestByType,
  transformRequest,
  transformRequestPercentageByUser,
  transformRequestReceptionStatus,
  transformServedProduct
} from './components/dataTransform';
import { useUrlQuery } from 'src/hooks/useUrlQuery';
import { BaseDatePicker } from 'src/shared/components/Core/BaseDatePicker';
import formatPrice from 'src/shared/utils/common';
import { DatePickerProps } from 'antd';
import ColumnChart from './components/ColumnChart';
import useWindowDimensions from 'src/hooks/useWindowDimensions';
import isoWeek from 'dayjs/plugin/isoWeek';
import FilterDropdown from 'src/cms/components/Filter/FilterDropdown';
import BaseButton from 'src/shared/components/Buttons/Button';
import { GrUpdate } from 'react-icons/gr';
import GaugeChart from './components/GaugeChart';
import PercentColumnChart from './components/PercentColumnChart';
import useMediaQuery from 'src/hooks/useMediaQuery';
import { MdFastfood, MdNoFood, MdOutlineNoFood } from 'react-icons/md';
import { FiRefreshCcw } from 'react-icons/fi';
import CancelRemadeSummary from './components/CancelRemadeSummary';
import useLayoutStore from 'src/store/layoutStore';
dayjs.extend(isoWeek);

const getYearMonth = (date: Dayjs) => date.year() * 12 + date.month();

// Disabled 35 days from the selected date
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

const Overview: React.FC = () => {
  const { getQuery } = useUrlQuery();
  const { getDashboardInfo, isLoading, dashboard } = useDashboardInfo();
  const { width } = useWindowDimensions();
  const isMobile = useMediaQuery('(max-width: 767px)');
  const [filters, setFilters] = useState<DashboardRequest>({
    startDate: getQuery('startDate') || dayjs().subtract(6, 'day').startOf('day'),
    endDate: getQuery('endDate') || dayjs().endOf('day')
  });
  const [chartKey, setChartKey] = useState(0);
  const isFirstRun = useRef(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { collapsed } = useLayoutStore();
  useEffect(() => {
    getDashboardInfo(filters);
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
  const chartHeight = width > 1536 ? 280 : 300;
  const total = (dashboard?.order?.totalBankTransfer ?? 0) + (dashboard?.order?.totalCash ?? 0);

  const formatDate = (date?: string | Dayjs): string | undefined => {
    if (!date) return undefined;
    return dayjs(date).format('YYYY-MM-DD'); // ép về dayjs rồi format
  };
  useEffect(() => {
    if (isFirstRun.current) {
      setTimeout(() => {
        isFirstRun.current = false;
      }, 500);
      return;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setChartKey((prev) => prev + 1);
    }, 500);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [collapsed, width]);
  return (
    <OverlayLoader spinning={isLoading}>
      <MainHeader
        title={
          <div className='flex items-center justify-between pr-6'>
            <h2 className='sm:block text-[16px] sm:text-xl xl:text-2xl sm:w-auto '>Dashboard - Tổng quan</h2>
            <div className='flex items-center'>
              <div className='mr-4 block xl:hidden'>
                <FilterDropdown
                  filtersFields={[
                    {
                      label: 'Thời gian',
                      type: 'date-range',
                      datePickerProps: {
                        allowClear: false,
                        placeholder: ['Ngày bắt đầu', 'Ngày kết thúc'],
                        disabledDate: disabled35DaysDate
                      }
                    }
                  ]}
                  filters={filters}
                  setFilters={setFilters}
                  position='bottomCenter'
                />
              </div>
              <div className='flex items-center overflow-hidden'>
                <div className='bg-white rounded-lg hidden xl:block xl:mb-1 '>
                  <BaseDatePicker.RangePicker
                    disabledDate={disabled35DaysDate}
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
                  onClick={() => getDashboardInfo(filters)}
                >
                  {!isMobile ? 'Cập nhật' : ''}
                </BaseButton>
              </div>
            </div>
          </div>
        }
      >
        <TotalList
          data={[
            {
              title: 'Tổng đơn hàng',
              value: dashboard?.order?.total ?? '0'
            },
            {
              title: 'Tổng chuyển khoản',
              value: dashboard?.order?.totalBankTransfer ? `${formatPrice(dashboard?.order?.totalBankTransfer)}` : '0'
            },
            {
              title: 'Tổng tiền mặt',
              value: dashboard?.order?.totalCash ? `${formatPrice(dashboard?.order?.totalCash)}` : '0'
            },
            {
              title: 'Tổng doanh thu',
              value: total ? `${formatPrice(total)}` : '0'
            }
          ]}
        />
        <div>
          <h3 className='font-semibold text-base py-6'>Báo cáo tính trạng sử dụng</h3>
          <div className='grid grid-cols-1  md:grid-cols-2 2xl:grid-cols-3 gap-4 lg:gap-6'>
            <div className='shadow-base rounded-md bg-white'>
              <h3 className='font-semibold text-base px-4 pt-4'>Tổng số lượng yêu cầu</h3>
              <BarChart
                data={transformRequestByType(dashboard?.requestByType)}
                height={chartHeight}
                loading={isLoading}
                color='#7987FF'
                chartKey={chartKey}
              />
            </div>
            <div className='shadow-base rounded-md bg-white p-4'>
              <h3 className='text-base font-semibold'>Thời gian đặt món trung bình</h3>
              <GaugeChart target={dashboard?.averageOrderingTime?.averageMinutes || 0} />
            </div>
            <div className='shadow-base rounded-md bg-white'>
              <h3 className='font-semibold text-base px-4 pt-4'>Top 5 món bán chạy nhất</h3>
              <BarChart
                data={transformProduct(dashboard?.productBestSeller)}
                height={chartHeight}
                loading={isLoading}
                barSize={20}
                chartKey={chartKey}
              />
            </div>
          </div>
        </div>
        <div>
          <h3 className='font-semibold text-base py-6'>Báo cáo doanh thu</h3>
          <div className='grid grid-cols-1  md:grid-cols-2 2xl:grid-cols-3 gap-4  lg:gap-6'>
            <div className='shadow-base rounded-md bg-white 2xl:col-span-2'>
              <h3 className='font-semibold text-base px-4 pt-4'>Báo cáo doanh thu</h3>
              <ColumnChart
                xLabel='Ngày:'
                separator='-'
                vndTooltipFormat={true}
                labelVisible={false}
                yLabel='Doanh thu:'
                data={transformOrderAmountByDate(
                  dashboard?.orderAmountByDate,
                  formatDate(filters?.startDate),
                  formatDate(filters?.endDate)
                )}
                height={chartHeight}
                loading={isLoading}
                color='#F765A3'
                chartKey={chartKey}
              />
            </div>
            <div className='shadow-base rounded-md bg-white'>
              <h3 className='font-semibold text-base px-4 pt-4'>Phương thức thanh toán phổ biến</h3>
              <PieChart
                data={transformOrderCountPopular(dashboard?.orderCountPopular)}
                height={chartHeight}
                loading={isLoading}
                legendPosition={isMobile ? 'top' : 'right'}
                chartKey={chartKey}
              />
            </div>
          </div>
        </div>
        <div>
          <h3 className='font-semibold text-base py-6'>Báo cáo tình trạng xử lý các yêu cầu</h3>
          <div className='grid grid-cols-1  md:grid-cols-2 2xl:grid-cols-3 gap-4  lg:gap-6'>
            <div className='shadow-base rounded-md bg-white'>
              <h3 className='font-semibold text-base px-4 pt-4'>Báo cáo thời gian tiếp nhận xử lý yêu cầu</h3>
              <PieChart
                data={transformRequest(dashboard?.requestConfirmed)}
                height={chartHeight}
                loading={isLoading}
                legendPosition={isMobile ? 'top' : 'right'}
                chartKey={chartKey}
              />
            </div>
            <div className='shadow-base rounded-md bg-white'>
              <h3 className='font-semibold text-base px-4 pt-4'>Tình trạng tiếp nhận</h3>
              <PercentColumnChart
                data={transformRequestReceptionStatus(dashboard?.requestReceptionStatus)}
                height={chartHeight}
              />
            </div>
            <div className='shadow-base rounded-md bg-white'>
              <h3 className='font-semibold text-base px-4 pt-4'>Trạng thái phục vụ món</h3>
              <PieChart
                data={transformServedProduct(dashboard?.servedProduct)}
                height={chartHeight}
                loading={isLoading}
                legendPosition={isMobile ? 'top' : 'right'}
                textInner={`Tổng số:\n${dashboard?.servedProduct?.reduce((sum, item) => sum + item.count, 0)} món`}
                chartKey={chartKey}
              />
            </div>
            <div className='shadow-base rounded-md bg-white'>
              <CancelRemadeSummary data={dashboard?.canceledProduct} />
            </div>
            <div className='shadow-base rounded-md bg-white'>
              <h3 className='font-semibold text-base px-4 pt-4'>Báo cáo thời gian hoàn thành phục vụ</h3>
              <PieChart
                data={transformRequest(dashboard?.requestServed)}
                height={chartHeight}
                loading={isLoading}
                legendPosition={isMobile ? 'top' : 'right'}
                chartKey={chartKey}
              />
            </div>
            <div className='shadow-base rounded-md bg-white'>
              <h3 className='font-semibold text-base px-4 pt-4'>Top 5 các món yêu cầu làm lại nhiều nhất</h3>
              <BarChart
                data={transformProduct(dashboard?.productBestRemade)}
                height={chartHeight}
                loading={isLoading}
                barSize={20}
                chartKey={chartKey}
              />
            </div>
          </div>
        </div>
        <div className='pb-6'>
          <h3 className='font-semibold text-base py-6'>Báo cáo khác</h3>
          <div className='grid grid-cols-1  md:grid-cols-2 2xl:grid-cols-3 gap-4  lg:gap-6'>
            <div className='shadow-base rounded-md bg-white'>
              <h3 className='font-semibold text-base px-4 pt-4'>Báo cáo SL tiếp nhận xử lý y/c theo nhân viên</h3>
              <PieChart
                data={transformRequestPercentageByUser(dashboard?.requestPercentageByUser)}
                height={chartHeight}
                loading={isLoading}
                legendPosition={isMobile ? 'top' : 'right'}
                chartKey={chartKey}
              />
            </div>
            <div className='shadow-base rounded-md bg-white p-4'>
              <h3 className='text-base font-semibold'>Báo cáo chỉ số đánh giá theo tiêu chí</h3>
              <RatingReport
                ratings={transformRatingData(dashboard?.averageStarsByCriteria).ratings}
                totalRating={transformRatingData(dashboard?.averageStarsByCriteria).totalRating}
              />
            </div>
            <div className='shadow-base rounded-md bg-white'>
              <h3 className='font-semibold text-base px-4 pt-4'>Báo cáo số lượng đơn hàng</h3>
              <ColumnChart
                xLabel='Ngày:'
                separator='-'
                yLabel='Số lượng:'
                data={transformOrderCountByDate(
                  dashboard?.orderCountByDate,
                  formatDate(filters?.startDate),
                  formatDate(filters?.endDate)
                )}
                height={chartHeight}
                loading={isLoading}
                chartKey={chartKey}
              />
            </div>
          </div>
        </div>
      </MainHeader>
    </OverlayLoader>
  );
};

export default Overview;
