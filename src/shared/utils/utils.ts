import axios, { AxiosError, HttpStatusCode } from "axios";
import dayjs from "dayjs";
import { ErrorResponse } from "src/types/utils.type";

export function isAxiosError<T>(error: unknown): error is AxiosError<T> {
  return axios.isAxiosError(error);
}

export function isAxiosUnprocessableEntityError<FormError>(
  error: unknown
): error is AxiosError<FormError> {
  return (
    isAxiosError(error) &&
    error.response?.status === HttpStatusCode.UnprocessableEntity
  );
}

export function isAxiosUnauthorizedError<UnauthorizedError>(
  error: unknown
): error is AxiosError<UnauthorizedError> {
  return (
    isAxiosError(error) &&
    error.response?.status === HttpStatusCode.Unauthorized
  );
}

export function isAxiosExpiredTokenError<UnauthorizedError>(
  error: unknown
): error is AxiosError<UnauthorizedError> {
  return (
    isAxiosUnauthorizedError<ErrorResponse<{ name: string; message: string }>>(
      error
    ) && error.response?.data?.data?.name === "EXPIRED_TOKEN"
  );
}

export const formatDate = (date: string | undefined, withTime?: boolean) => {
  if (!date) return "";
  let format = "DD/MM/YYYY";
  if (withTime) format += " HH:mm:ss";
  return dayjs(date).format(format);
};

export const formatTime = (date: string | undefined | Date) => {
  if (!date) return "";
  return dayjs(date).format("HH:mm:ss");
};

export const formatCurrency = (value: number | undefined) =>
  value ? new Intl.NumberFormat().format(value) : "";

export const generateImageURL = (
  url: string | undefined,
  posConnectionUrl?: string
) => {
  if (posConnectionUrl) {
    return `https://${posConnectionUrl}/${url}`;
  }

  return `${import.meta.env.VITE_MEDIA_SEVER_URL}${url}`;
};
