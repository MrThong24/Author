import exp from 'constants';
import { Dayjs } from 'dayjs';

interface OrderInfo {
  total: number;
  totalBankTransfer: number | null;
  totalCash: number | null;
}

export interface Request {
  totalRequests: number;
  less5m: number;
  less10m: number;
  less15m: number;
  over15m: number;
}

export interface RequestType {
  type: string;
  count: string;
}

export interface OrderCount {
  date: string;
  totalOrder?: number;
  count: number;
}

export interface OrderAmount {
  date: string | Date;
  totalAmount: number;
  value: number;
  type?: string;
}
export interface CustomerCount {
  date: string | Date;
  count: string;
  name: string;
}
export interface RequestPercentageByUser {
  userId: string;
  name: string;
  percentage: number;
}
interface RatingCriteria {
  id: string;
  name: string;
  averageStars: string;
}
interface AverageStarsByCriteria {
  result: RatingCriteria[];
  total: number;
}
interface AverageOrderingTime {
  averageMinutes: number;
}
export interface Product {
  count: number;
  id: string;
  name: string;
}
export interface OrderCountPopular {
  count: number;
  countBankTransfer: number;
  countCash: number;
}
export interface RequestReceptionStatus {
  type: 'ORDER' | 'PAYMENT' | 'REQUEST';
  statusGroup: 'CONFIRMED' | 'PENDING' | 'CANCELED';
  count: number;
}

export interface PercentColumnChart {
  type: string;
  statusGroup: string;
  count: number;
}
export interface ServedProduct {
  status: string;
  count: number;
}
export interface CanceledProduct {
  CANCELED: number;
  REMADE: number;
}
export type OrderChartItem = {
  date: string;
  count: number;
  totalAmount: number;
};

export type CountChange = {
  current: number;
  previous: number;
  chart: OrderChartItem[];
};
export interface AmountPercentage {
  amount: number;
  name: string;
  price: number;
  productId: string;
}

export interface DashboardData {
  order: OrderInfo;
  requestConfirmed: Request;
  requestByType: RequestType[];
  orderCountByDate: OrderCount[];
  orderAmountByDate: OrderAmount[];
  requestPercentageByUser: RequestPercentageByUser[];
  averageStarsByCriteria: AverageStarsByCriteria;
  averageOrderingTime: AverageOrderingTime;
  productBestSeller: Product[];
  productBestRemade: Product[];
  orderCountPopular: OrderCountPopular;
  requestReceptionStatus: RequestReceptionStatus[];
  servedProduct: ServedProduct[];
  canceledProduct: CanceledProduct;
  requestServed: Request;
}
export interface DashboardRevenueTrackingData {
  orderAmount: OrderAmount[];
  customerCount: CustomerCount[];
  orderCount: CustomerCount[];
  productCount: CustomerCount[];
  orderCountChanged: CountChange;
  customerCountChanged: CountChange;
  orderAmountChanged: CountChange;
  productCountChanged: CountChange;
  productAmountPercentage: AmountPercentage[];
}
export interface PieDataType {
  type: string;
  value: number;
}
export interface RateDataType {
  ratings: { name: string; value: number }[];
  totalRating: number;
}
export interface BarDataType {
  type: string;
  value: number;
}
export interface ColumnDataType {
  type: string;
  value: number;
  date: Date | string;
}
