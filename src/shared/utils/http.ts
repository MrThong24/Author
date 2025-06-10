import axios, { AxiosError, HttpStatusCode, type AxiosInstance } from "axios";
import { AuthResponse, RefreshTokenReponse } from "src/types/auth.type";
import {
  clearLS,
  getAccessTokenFromLS,
  getverifyTokenFromLS,
  setAccessTokenToLS,
  URL_CHOOSE_STORE,
  URL_LOGIN,
  URL_REFRESH_TOKEN,
} from "./auth";
import { ErrorResponse } from "src/types/utils.type";
import { isAxiosExpiredTokenError, isAxiosUnauthorizedError } from "./utils";
import { CustomerInfo } from "src/types/customer.type";

export class Http {
  instance: AxiosInstance;
  private accessToken: string;
  private verifyToken: string;
  private refreshTokenRequest: Promise<string> | null;
  constructor() {
    this.accessToken = getAccessTokenFromLS();
    this.verifyToken = getverifyTokenFromLS();
    this.refreshTokenRequest = null;
    this.instance = axios.create({
      baseURL: import.meta.env.VITE_BACKEND_URL,
      timeout: 120000,
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    });
    this.instance.interceptors.request.use(
      (config) => {
        if (this.accessToken && config.headers) {
          config.headers.authorization = `Bearer ${this.accessToken}`;
        }
        if (this.verifyToken && config.headers) {
          config.headers["order-info"] = this.verifyToken;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
    // Add a response interceptor
    this.instance.interceptors.response.use(
      (response) => {
        const { url } = response.config;

        if (url === URL_CHOOSE_STORE) {
          const data = response.data as AuthResponse;
          this.accessToken = data.accessToken;
          setAccessTokenToLS(this.accessToken);
        }
        return response;
      },
      (error: AxiosError) => {
        // if (this.isStoreSessionExpiredError(error)) {
        //   const setSessionExpired = useCartStore.getState().setSessionExpired;
        //   setSessionExpired(true);
        // }

        if (
          ![
            HttpStatusCode.UnprocessableEntity,
            HttpStatusCode.Unauthorized,
          ].includes(error.response?.status as number)
        ) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const data: any | undefined = error.response?.data;
          const message = data?.message || error.message;
          console.log(message);
          // toast.error(message)
        }

        if (
          isAxiosUnauthorizedError<
            ErrorResponse<{ name: string; message: string }>
          >(error)
        ) {
          const config = error.response?.config || { headers: {}, url: "" };
          const { url } = config;

          if (isAxiosExpiredTokenError(error) && url !== URL_REFRESH_TOKEN) {
            this.refreshTokenRequest = this.refreshTokenRequest
              ? this.refreshTokenRequest
              : this.handleRefreshToken().finally(() => {
                  setTimeout(() => {
                    this.refreshTokenRequest = null;
                  }, 10000);
                });
            return this.refreshTokenRequest.then((accessToken) => {
              return this.instance({
                ...config,
                headers: { ...config.headers, authorization: accessToken },
              });
            });
          }

          clearLS();
          this.accessToken = "";
          // toast.error(error.response?.data.data?.message || error.response?.data.message)
          if (!url?.includes(URL_LOGIN)) {
            window.location.reload();
          }
        }
        return Promise.reject(error);
      }
    );
  }
  private isStoreSessionExpiredError(error: AxiosError): boolean {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any

    const data: any | undefined = error.response?.data;

    return (
      data?.code === "INVALID_SESSION" || data?.code === "SESSION_NOT_FOUND"
    );
  }
  private handleRefreshToken() {
    return this.instance
      .get<RefreshTokenReponse>(URL_REFRESH_TOKEN, {
        withCredentials: true,
      })
      .then((res) => {
        const { accessToken } = res.data;
        setAccessTokenToLS(accessToken);
        this.accessToken = accessToken;
        return accessToken;
      })
      .catch((error) => {
        clearLS();
        this.accessToken = "";
        throw error;
      });
  }
}
const http = new Http().instance;
export default http;
