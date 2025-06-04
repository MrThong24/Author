import { RequestType } from "../common/enum";

export const requestTitle = (type: string) => {
    switch (type) {
      case RequestType.ORDER:
        return 'Yêu cầu gọi món';
      case RequestType.PAYMENT:
        return 'Yêu cầu thanh toán';
      default:
        return 'Yêu cầu gọi nhân viên';
    }
  };