export const URL_LOGIN = "/auth/login";
export const URL_CHOOSE_STORE = "/auth/choose-store";
export const URL_CHANGE_PASSWORD = "/auth/change-password";
export const URL_CURRENT_USER = "auth/current-user";
export const URL_REFRESH_TOKEN = "/auth/refresh";
export const URL_CUSTOMER = "start-order/";
export const URL_JOINORDER = "join-order";
export const URL_CHANGE_LANGUAGE = "change-language";
export const URL_CHOOSE_KITCHEN = "/auth/choose-kitchen";
export const LocalStorageEventTarget = new EventTarget();

export const setAccessTokenToLS = (accessToken: string) => {
  localStorage.setItem("accessToken", accessToken);
};

export const setverifyTokenToLS = (verifyToken: string) => {
  localStorage.setItem("verifyToken", verifyToken);
};

export const setCustomerInfo = (info: {
  customerId: string;
  customerName: string | null;
  tableName: string;
  zoneName: string;
  storeName: string;
}) => {
  const customerInfo = {
    ...info,
    customerName: info.customerName || "Khách hàng ẩn danh",
  };
  localStorage.setItem("customerInfo", JSON.stringify(customerInfo));
};

export const getCustomerInfo = () => {
  const customerInfo = localStorage.getItem("customerInfo");
  return customerInfo ? JSON.parse(customerInfo) : null;
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
