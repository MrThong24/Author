import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { PaymentMethod } from 'src/shared/common/enum';
import { formatCurrencyDecimalVND } from 'src/shared/common/format';
import formatPrice from 'src/shared/utils/common';

dayjs.extend(isSameOrBefore);
import {
  AmountPercentage,
  BarDataType,
  ColumnDataType,
  CountChange,
  CustomerCount,
  OrderAmount,
  OrderChartItem,
  OrderCount,
  OrderCountPopular,
  PercentColumnChart,
  PieDataType,
  Product,
  RateDataType,
  Request,
  RequestPercentageByUser,
  RequestReceptionStatus,
  RequestType,
  ServedProduct
} from 'src/types/dashboard.type';

const formatData = (value: number, total: number) => {
  return parseFloat(((value / total) * 100).toFixed(2));
};

// Chart: Báo cáo thời gian xử lý yêu cầu
export const transformRequest = (data?: Request): PieDataType[] => {
  if (!data || data.totalRequests === 0) return [];

  const percentageData = [
    {
      type: `0-5 phút (${formatData(data.less5m, data.totalRequests)}%)`,
      value: formatData(data.less5m, data.totalRequests)
    },
    {
      type: `5-10 phút (${formatData(data.less10m, data.totalRequests)}%)`,
      value: formatData(data.less10m, data.totalRequests)
    },
    {
      type: `10-15 phút (${formatData(data.less15m, data.totalRequests)}%)`,
      value: formatData(data.less15m, data.totalRequests)
    },
    {
      type: `>15 phút (${formatData(data.over15m, data.totalRequests)}%)`,
      value: formatData(data.over15m, data.totalRequests)
    }
  ].filter((item) => item.value > 0);

  return percentageData.length > 0 ? percentageData : [{ type: '0-5 phút', value: 100 }];
};

// Chart: Báo cáo số lượng tiếp nhận xử lý đơn theo nhân viên
export const transformRequestPercentageByUser = (data?: RequestPercentageByUser[]): PieDataType[] => {
  if (!data?.length) return [];
  return data.map((item) => ({
    type: `${item.name} (${parseFloat(item.percentage.toFixed(2))}%)`,
    value: parseFloat(item.percentage.toFixed(2)) || 0
  }));
};

// Chart: Phương thức thanh toán phổ biến
export const transformOrderCountPopular = (data?: OrderCountPopular): PieDataType[] => {
  if (!data?.count) return [];
  return [
    { type: `Tiền mặt (${formatData(data.countCash, data.count)}%)`, value: formatData(data.countCash, data.count) },
    {
      type: `Chuyển khoản (${formatData(data.countBankTransfer, data.count)}%)`,
      value: formatData(data.countBankTransfer, data.count)
    }
  ];
};

// Chart: Tình trạng tiếp nhận
export const transformRequestReceptionStatus = (data?: RequestReceptionStatus[]): PercentColumnChart[] => {
  const types: Record<string, string> = {
    STAFF: 'Nhân viên',
    PAYMENT: 'Thanh toán',
    ORDER: 'Gọi món'
  };

  const statusGroups: Record<string, string> = {
    CONFIRMED: 'Đã xác nhận',
    PENDING: 'Chờ xử lý',
    CANCELED: 'Đã huỷ'
  };

  const allTypes = Object.keys(types);
  const allStatus = Object.keys(statusGroups);

  const result: PercentColumnChart[] = [];

  for (const type of allTypes) {
    for (const status of allStatus) {
      const match = data?.find((item) => item.type === type && item.statusGroup === status);
      result.push({
        type: types[type],
        statusGroup: statusGroups[status],
        count: match?.count ?? 0
      });
    }
  }

  return result;
};

// Chart: Tổng số lượng yêu cầu
export const transformRequestByType = (data?: RequestType[]): BarDataType[] => {
  const defaultTypes = ['STAFF', 'ORDER', 'PAYMENT'] as const;

  const map = new Map<string, number>();
  (data ?? []).forEach((item) => {
    map.set(item.type, parseInt(item.count, 10));
  });

  return defaultTypes.map((type) => ({
    type: type === 'STAFF' ? 'Yêu cầu hỗ trợ' : type === 'ORDER' ? 'Yêu cầu đặt món' : 'Yêu cầu thanh toán',
    value: map.get(type) ?? 0
  }));
};

// Chart: Top 5 món bán chạy nhất
export const transformProduct = (data?: Product[]): BarDataType[] =>
  (data ?? []).map((item) => ({
    type: item.name,
    value: item.count
  }));

// Chart: Báo cáo số lượng đơn hàng
export const transformOrderCountByDate = (
  data?: OrderCount[],
  startDate?: string,
  endDate?: string
): ColumnDataType[] => {
  if (!startDate || !endDate) return [];
  const dateMap = new Map<string, number>();
  (data ?? []).forEach((item) => {
    dateMap.set(item.date, item?.count);
  });

  const start = dayjs(startDate);
  const end = dayjs(endDate);

  const result: ColumnDataType[] = [];
  let current = start;

  while (current.isSameOrBefore(end, 'day')) {
    const dateStr = current.format('YYYY-MM-DD');
    result.push({
      type: current.format('DD/MM/YYYY'),
      value: dateMap.get(dateStr) ?? 0
    });
    current = current.add(1, 'day');
  }

  return result;
};

// Chart: Báo cáo doanh thu
export const transformOrderAmountByDate = (
  data?: OrderAmount[],
  startDate?: string,
  endDate?: string | Date
): ColumnDataType[] => {
  if (!startDate || !endDate) return [];

  const dateMap = new Map<string, number>();
  (data ?? []).forEach((item) => {
    dateMap.set(item.date, item.totalAmount);
  });

  const start = dayjs(startDate);
  const end = dayjs(endDate);

  const result: ColumnDataType[] = [];
  let current = start;

  while (current.isSameOrBefore(end, 'day')) {
    const dateStr = current.format('YYYY-MM-DD');
    result.push({
      type: current.format('DD/MM/YYYY'),
      value: dateMap.get(dateStr) ?? 0
    });
    current = current.add(1, 'day');
  }

  return result;
};

// Báo cáo chỉ số đánh giá theo tiêu chí
export const transformRatingData = (data?: {
  result?: { name?: string; averageStars?: string }[];
  total?: number;
}): RateDataType => ({
  ratings: (data?.result ?? [])
    .filter((item) => item.name && item.averageStars)
    .map((item) => ({ name: item.name || 'Unknown', value: parseFloat(item.averageStars ?? '0') })),
  totalRating: data?.total ?? 0
});

// Chart: Trạng thái phục vụ món
export const transformServedProduct = (data?: ServedProduct[]): PieDataType[] => {
  if (!data?.length) return [];
  const total = data.reduce((sum, item) => sum + item.count, 0);

  const statusMap: Record<string, string> = {
    SERVED: 'Đã phục vụ',
    COMPLETED: 'Đã chế biến',
    INPROGRESS: 'Đang chế biến'
  };

  return data.map((item) => ({
    type: `${statusMap[item.status]}: ${item.count} (${formatData(item.count, total)}%)`,
    value: item.count
  }));
};

export const transformInterval = (
  data?: OrderAmount[],
  startDate?: dayjs.Dayjs,
  endDate?: dayjs.Dayjs
): ColumnDataType[] => {
  if (!startDate || !endDate) return [];

  const statusMap: Record<string, string> = {
    BANK_TRANSFER: 'Chuyển khoản',
    CASH: 'Tiền mặt'
  };

  // Gom dữ liệu theo date + type để tiện lookup
  const dataMap = new Map<string, number>();
  (data ?? []).forEach((item) => {
    const key = `${item.date}_${item.type}`;
    dataMap.set(key, item.totalAmount);
  });

  const result: ColumnDataType[] = [];
  let current = startDate;

  while (current.isSameOrBefore(endDate, 'day')) {
    const dateStr = current.format('YYYY-MM-DD');

    Object.keys(statusMap).forEach((typeKey) => {
      const key = `${dateStr}_${typeKey}`;
      result.push({
        type: statusMap[typeKey],
        value: dataMap.get(key) ?? 0,
        date: dateStr
      });
    });

    current = current.add(1, 'day');
  }

  return result;
};

export const transformLine = (
  data?: CustomerCount[],
  startDate?: dayjs.Dayjs,
  endDate?: dayjs.Dayjs,
  name: string = ''
): { date: string; count: number; name: string }[] => {
  if (!startDate || !endDate) return [];

  const dataMap = new Map<string, number>();

  (data ?? []).forEach((item) => {
    const key = item.date;
    dataMap.set(key, item.count);
  });

  const result: { date: string; count: number; name: string }[] = [];
  let current = startDate;

  while (current.isSameOrBefore(endDate, 'day')) {
    const dateStr = current.format('YYYY-MM-DD');
    result.push({
      date: dateStr,
      name, // dùng tên truyền vào
      count: dataMap.get(dateStr) ?? 0
    });

    current = current.add(1, 'day');
  }

  return result;
};

export const transformAreaChart = (
  data?: OrderChartItem[],
  startDate?: dayjs.Dayjs,
  endDate?: dayjs.Dayjs
): { value: number; index: number }[] => {
  if (!startDate || !endDate || !data?.length) return [];
  const numberOfDays = endDate.diff(startDate, 'day') + 1;
  startDate = startDate.subtract(numberOfDays, 'day');
  const dataMap = new Map<string, number>();
  (data ?? []).forEach((item) => {
    const key = item.date;
    dataMap.set(key, item?.count || item?.totalAmount);
  });
  const result: { value: number; index: number }[] = [];
  let current = startDate;
  let i = 0;
  while (current.isSameOrBefore(endDate, 'day')) {
    const dateStr = current.format('YYYY-MM-DD');
    result.push({
      value: dataMap.get(dateStr) ?? 0,
      index: i
    });

    i++;
    current = current.add(1, 'day');
  }
  return result;
};

export const transformAmountPercentage = (data?: AmountPercentage[]): PieDataType[] => {
  if (!data?.length) return [];

  return data.map((item) => ({
    // type: `${item?.name} (${formatData(item.price, total)}%)`,
    type: `${item?.name} (${formatPrice(item.price)}VND)`,
    value: item.price
  }));
};
