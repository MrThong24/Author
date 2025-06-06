import axios, { AxiosError, HttpStatusCode } from 'axios';
import dayjs from 'dayjs';
import { RequestCounts } from 'src/types/request.type';
import { ErrorResponse } from 'src/types/utils.type';
import { RequestProductStatus } from '../common/enum';

export function isAxiosError<T>(error: unknown): error is AxiosError<T> {
  return axios.isAxiosError(error);
}

export function isAxiosUnprocessableEntityError<FormError>(error: unknown): error is AxiosError<FormError> {
  return isAxiosError(error) && error.response?.status === HttpStatusCode.UnprocessableEntity;
}

export function isAxiosUnauthorizedError<UnauthorizedError>(error: unknown): error is AxiosError<UnauthorizedError> {
  return isAxiosError(error) && error.response?.status === HttpStatusCode.Unauthorized;
}

export function isAxiosExpiredTokenError<UnauthorizedError>(error: unknown): error is AxiosError<UnauthorizedError> {
  return (
    isAxiosUnauthorizedError<ErrorResponse<{ name: string; message: string }>>(error) &&
    error.response?.data?.data?.name === 'EXPIRED_TOKEN'
  );
}

export const formatDate = (date: string | undefined, withTime?: boolean) => {
  if (!date) return '';
  let format = 'DD/MM/YYYY';
  if (withTime) format += ' HH:mm:ss';
  return dayjs(date).format(format);
};

export const formatTime = (date: string | undefined | Date) => {
  if (!date) return '';
  return dayjs(date).format('HH:mm:ss');
};

export const formatCurrency = (value: number | undefined) => (value ? new Intl.NumberFormat().format(value) : '');

export const getConfirmMessage = ({ SERVED, PENDING, INPROGRESS, REJECTED }: RequestCounts, fromTable?: Boolean) => {
  if (!fromTable && REJECTED && !SERVED) {
    return 'Đơn hàng không có món thanh toán. Vui lòng kiểm tra lại. Yêu cầu thanh toán sẽ được hủy';
  }
  if (!SERVED && !INPROGRESS) {
    return 'Phiên này không có yêu cầu gọi món hoặc chưa được xác nhận, bạn có muốn đóng phiên đặt món của khách không?';
  }
  if (PENDING && INPROGRESS) {
    return 'Còn yêu cầu món chưa xác nhận phục vụ và đang thực hiện. Bạn có chắc muốn tiếp tục hoàn tất để thanh toán đơn hàng không?';
  }
  if (PENDING) {
    return 'Còn yêu cầu chưa phục vụ, vui lòng kiểm tra trước khi thực hiện thanh toán. Bạn có muốn bỏ qua các yêu cầu chưa xác nhận?';
  }
  if (INPROGRESS) {
    return 'Còn yêu cầu đang thực hiện. Bạn có muốn tiếp tục không?';
  }

  return '';
};
export const getStatusLabel = (status: RequestProductStatus) => {
  switch (status) {
    case RequestProductStatus.REMADE:
      return { text: 'Làm lại', className: 'bg-warning text-main' };
    case RequestProductStatus.SERVED:
      return { text: 'Đã hoàn thành', className: 'bg-green-100 !text-green-800' };
    case RequestProductStatus.CANCELED:
      return { text: 'Đã hủy', className: 'bg-red-100 text-red-600' };
    case RequestProductStatus.COMPLETED:
      return { text: 'Đã chế biến', className: 'bg-primary text-white' };
    case RequestProductStatus.INPROGRESS:
      return { text: 'Đang thực hiện', className: 'bg-yellow-100 !text-yellow-700' };
    default:
      return { text: 'Chưa xác nhận', className: 'bg-danger' };
  }
};
export const generateImageURL = (url: string | undefined, posConnectionUrl?: string) => {
  if (posConnectionUrl) {
    return `https://${posConnectionUrl}/${url}`;
  }

  return `${import.meta.env.VITE_MEDIA_SEVER_URL}${url}`;
};

export const calcTaxReduction = (amount: number | undefined, discountPercent: number) => {
  if (!amount || !discountPercent) return 0;
  return Math.round((amount * discountPercent) / 100);
};

export const calculateSaleInvoiceDiscount = (amount: number | undefined) => {
  if (!amount) return 0;
  return Math.round((amount * 20) / 100);
};

export const downLoadFileFromBlob = (blob: Blob, fileName: string) => {
  const path = window.URL.createObjectURL(new Blob([blob]));
  const link = document.createElement('a');
  link.href = path;
  link.setAttribute('download', fileName || 'file.xlsx');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
