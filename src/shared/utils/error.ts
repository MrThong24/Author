import { message, notification } from 'antd';
import axios from 'axios';

interface ShowErrorArgument {
  error: unknown;
  title: string;
  message?: string;
  hideNotification?: boolean;
}
type ShowErrorWithoutTitle = Omit<ShowErrorArgument, 'title'>;

export const showError = ({
  error,
  title = '',
  message = 'Lỗi không xác định',
  hideNotification = false
}: ShowErrorArgument) => {
  console.error(error);
  if (axios.isAxiosError(error)) {
    message = Array.isArray(error?.response?.data?.errors)
      ? error?.response?.data?.errors[0]?.constraints[Object.keys(error?.response?.data?.errors[0]?.constraints)[0]]
      : error?.response?.data?.message || error?.response?.data || error?.message || message;
  }
  if (!hideNotification)
    notification.error({
      message: title,
      description: message
    });
};
export const showErrorMessage = ({
  error,
  message: defaultMessage = 'Lỗi không xác định',
  hideNotification = false
}: ShowErrorWithoutTitle) => {
  let errorMessage = defaultMessage;
  if (axios.isAxiosError(error)) {
    errorMessage = error?.response?.data?.message || error?.message || defaultMessage;
  }
  if (!hideNotification) {
    message.error(errorMessage);
  }
};
