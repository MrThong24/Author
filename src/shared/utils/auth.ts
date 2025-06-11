export const URL_LOGIN = "/auth/login";
export const URL_CHOOSE_STORE = "/auth/choose-store";
export const URL_CURRENT_USER = "auth/current-user";
export const URL_REFRESH_TOKEN = "/auth/refresh";
export const LocalStorageEventTarget = new EventTarget();

export const setAccessTokenToLS = (accessToken: string) => {
  localStorage.setItem("accessToken", accessToken);
};

export const setverifyTokenToLS = (verifyToken: string) => {
  localStorage.setItem("verifyToken", verifyToken);
};

export const clearLS = () => {
  localStorage.removeItem("accessToken");
  const clearLSEvent = new Event("clearLS");
  LocalStorageEventTarget.dispatchEvent(clearLSEvent);
};

export const getAccessTokenFromLS = () =>
  localStorage.getItem("accessToken") || "";
export const getverifyTokenFromLS = () =>
  localStorage.getItem("verifyToken") || "";
