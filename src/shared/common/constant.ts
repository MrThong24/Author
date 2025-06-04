import { OrderStatus, PaymentMethod, RoleType, TableStatus } from './enum';

export const roleTypes = [
  {
    label: 'Chủ cửa hàng',
    value: RoleType.STORE_OWNER
  },
  {
    label: 'Nhân viên',
    value: RoleType.STAFF
  },
  {
    label: 'Bếp',
    value: RoleType.CHEF
  },
  {
    label: 'Quản lý',
    value: RoleType.MANAGER
  }
];

export const roleOwnerTypes = [
  {
    label: 'Bếp',
    value: RoleType.CHEF
  },
  {
    label: 'Nhân viên',
    value: RoleType.STAFF
  },
  {
    label: 'Quản lý',
    value: RoleType.MANAGER
  }
];

export const roleManagerTypes = [
  {
    label: 'Bếp',
    value: RoleType.CHEF
  },
  {
    label: 'Nhân viên',
    value: RoleType.STAFF
  }
];

export const tableStatus = [
  {
    label: 'Bàn trống',
    value: TableStatus.EMPTY
  },
  {
    label: 'Đang sử dụng',
    value: TableStatus.OCCUPIED
  }
];

// export const problems = [
//   { value: 'Món ăn', title: 'Món ăn' },
//   { value: 'Không gian', title: 'Không gian' },
//   { value: 'Nhân viên', title: 'Nhân viên' },
//   { value: 'Chất lượng dịch vụ', title: 'Chất lượng dịch vụ' },
//   { value: 'Khác', title: 'Khác' }
// ];

export const problems = [
  { value: 'Món ăn', title: 'problems.food' },
  { value: 'Không gian', title: 'problems.space' },
  { value: 'Nhân viên', title: 'problems.staff' },
  { value: 'Chất lượng dịch vụ', title: 'problems.serviceQuality' },
  { value: 'Khác', title: 'problems.other' }
];

export const orderStatus = [
  {
    label: 'Đã thanh toán',
    value: OrderStatus.PAID
  },
  {
    label: 'Chưa thanh toán',
    value: OrderStatus.UNPAID
  }
];

export const paymentOptions = [
  {
    value: PaymentMethod.BANK_TRANSFER,
    label: 'Chuyển khoản'
  },
  {
    value: PaymentMethod.CASH,
    label: 'Tiền mặt'
  }
];

export const eInvoiceTypes = [
  {
    label: 'Hóa Đơn GTGT',
    value: '1'
  },
  {
    label: 'Hóa Đơn Bán Hàng',
    value: '2'
  }
];

export const eInvoiceFormats = [
  {
    label: 'Hóa đơn khởi tạo từ máy tính tiền',
    value: 'M'
  },
  {
    label: 'Tự đăng ký sử dụng',
    value: 'T'
  }
];

export const eInvoiceModes = [
  {
    label: 'Có mã',
    value: 'C'
  },
  {
    label: 'Không mã',
    value: 'K'
  }
];
