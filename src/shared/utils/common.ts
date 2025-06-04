import { GetProp, message, UploadProps } from 'antd';
import { RequestProduct } from 'src/types/request.type';

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

export default function formatPrice(value: number, locale: string = 'vi-VN'): string {
  return new Intl.NumberFormat(locale).format(value);
}
export const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};
export const beforeUploadImage = (file: FileType) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isJpgOrPng) {
    message.error('Bạn chỉ có thể tải lên tệp JPG/PNG!');
  }
  const isLt2M = file.size / 1024 / 1024 < 20;
  if (!isLt2M) {
    message.error('Hình ảnh phải nhỏ hơn 20MB!');
  }
  return isJpgOrPng && isLt2M;
};

export const getUpdateRequestProductQuantity = (requestProduct: RequestProduct) => {
  return {
    quantity: requestProduct.quantity,
    completedQuantity: requestProduct.completedQuantity,
    servedQuantity: requestProduct.servedQuantity,
    status: requestProduct.status,
    requestProductHistories: requestProduct.requestProductHistories
  };
};
