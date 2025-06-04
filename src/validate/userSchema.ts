import * as yup from 'yup';

export const userFormSchema = yup.object({
  username: yup.string().required('Username is required').min(3, 'Username must be at least 3 characters'),

  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number'),

  email: yup.string().required('Email is required').email('Must be a valid email'),

  age: yup
    .number()
    .transform((value, originalValue) => (originalValue === '' ? undefined : value))
    .required('Age is required')
    .positive('Age must be a positive number')
    .integer('Age must be an integer')
    .min(18, 'Must be at least 18 years old'),
  description: yup.string().optional()
});

export const profileSchema = yup.object({
  name: yup.string().required('Vui lòng nhập tên nhân viên').trim(),
  phone: yup
    .string()
    .matches(/^0\d{9}$/, 'Số điện thoại phải gồm 10 chữ số và bắt đầu bằng số 0')
    .required('Vui lòng nhập số điện thoại'),
  address: yup.string().optional()
});

export const storeSchema = yup.object({
  name: yup.string().required('Vui lòng nhập tên cửa hàng').trim().max(225, 'Không được vượt quá 255 ký tự'),
  email: yup.string().nullable().email('Email không hợp lệ').optional(),
  address: yup.string().optional().max(500, 'Không được vượt quá 500 ký tự'),
  phone: yup
    .string()
    .nullable() // Cho phép giá trị là null hoặc undefined
    .test('is-valid-phone', 'Số điện thoại phải gồm 10 chữ số và bắt đầu bằng số 0', (value) => {
      if (!value) return true; // Nếu giá trị là null, undefined hoặc trống, không validate
      return /^0\d{9}$/.test(value); // Kiểm tra số điện thoại hợp lệ nếu có giá trị
    })
    .optional(),
  slogan: yup.string().required('Vui lòng nhập slogan').trim(),
  bankNumber: yup
    .string()
    .matches(/^[a-zA-Z0-9]*$/, 'Số tài khoản chỉ được nhập chữ và số')
    .optional(),
  bankBin: yup.string().optional(),
  accountHolder: yup.string().optional(),
  isQRIntegrated: yup.boolean().optional(),
  kitchenDisabled: yup.boolean().optional(),
  servingQuantityConfirmationDisabled: yup.boolean().optional(),
  completingQuantityConfirmationDisabled: yup.boolean().optional(),
  qrSoundRegistered: yup.boolean().optional(),
  primaryColor: yup.string().required('Vui lòng chọn màu sắc hệ thống').trim(),
  taxCode: yup
    .string()
    .trim()
    .nullable()
    .notRequired()
    .matches(/^\d{10}(-\d{3})?$/, {
      message: 'Mã số thuế không đúng định dạng',
      excludeEmptyString: true
    }),
  bPacTemplatePath: yup.string().optional(),
  eInvoiceUsername: yup.string().optional(),
  eInvoicePassword: yup.string().optional(),
  eInvoiceUrl: yup.string().optional(),
  eInvoiceType: yup.string().optional(),
  eInvoiceFormat: yup.string().optional(),
  eInvoiceMode: yup.string().optional(),
  eInvoiceSymbol: yup.string().optional(),
  posStoreId: yup.string().optional()
});

export const configScheme = yup.object({
  primaryColor: yup.string().required('Vui lòng chọn màu sắc hệ thống').trim(),
  kitchenDisabled: yup.boolean().optional(),
  servingQuantityConfirmationDisabled: yup.boolean().optional(),
  completingQuantityConfirmationDisabled: yup.boolean().optional()
});

export const eInvoiceAuthSchema = yup.object({
  eInvoiceUsername: yup.string().required('Vui lòng nhập tên người dùng').trim(),
  eInvoicePassword: yup.string().required('Vui lòng nhập mật khẩu'),
  eInvoiceUrl: yup
    .string()
    .required('Vui lòng nhập đường dẫn đích')
    .trim()
    .max(100, 'Đường dẫn không được vượt quá 100 ký tự')
});

export const eInvoiceConfigSchema = yup.object({
  eInvoiceUsername: yup.string().required('Vui lòng nhập tên người dùng').trim(),
  eInvoicePassword: yup.string().required('Vui lòng nhập mật khẩu'),
  eInvoiceUrl: yup
    .string()
    .required('Vui lòng nhập đường dẫn đích')
    .trim()
    .max(100, 'Đường dẫn không được vượt quá 100 ký tự'),
  eInvoiceType: yup.string().optional().nullable(),
  eInvoiceFormat: yup.string().optional().nullable(),
  eInvoiceMode: yup.string().optional().nullable(),
  eInvoiceSymbol: yup.string().optional().nullable()
});

export const productSettingSchema = yup.object({
  name: yup.string().required('Vui lòng nhập tên phân loại sản phẩm').trim(),
  discountPercent: yup
    .number()
    .integer('Giá trị giảm trừ hoá đơn bán hàng phải là số nguyên')
    .transform((value, originalValue) => (originalValue === '' ? undefined : value))
    .required('Vui lòng nhập giảm trừ hoá đơn bán hàng')
    .min(0, 'Giá trị giảm trừ hoá đơn bán hàng không được nhỏ hơn 0')
    .max(100, 'Giá trị giảm trừ hoá đơn bán hàng không được lớn hơn 100%')
});

export const kitchenSettingSchema = yup.object({
  name: yup.string().required('Vui lòng nhập tên bếp').trim(),
  isPrintEnabled: yup.boolean().required('Vui lòng chọn trạng thái in'),
  zoneIds: yup.array().min(1, 'Vui lòng chọn khu vực tiếp nhận').required('Vui lòng chọn khu vực tiếp nhận'),
  productTypeIds: yup.array().min(1, 'Vui lòng chọn phân loại chế biến').required('Vui lòng chọn phân loại chế biến')
});

export type UserFormData = yup.InferType<typeof userFormSchema>;
export type ProfilePayload = yup.InferType<typeof profileSchema>;
export type StorePayload = yup.InferType<typeof storeSchema>;
export type StorePayloadPartial = Partial<yup.InferType<typeof storeSchema>>;
export type StoreConfig = yup.InferType<typeof configScheme>;
export type EInvoiceConfigPayload = yup.InferType<typeof eInvoiceConfigSchema>;
export type ProductSettingPayload = yup.InferType<typeof productSettingSchema>;
export type KitchenSettingPayload = yup.InferType<typeof kitchenSettingSchema>;
