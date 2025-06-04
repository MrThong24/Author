import * as yup from 'yup';

export const eInvoiceOrderSchema = yup.object({
  eInvoiceType: yup.string().required('Vui lòng chọn loại'),
  eInvoiceFormat: yup.string().required('Vui lòng chọn kiểu'),
  eInvoiceMode: yup.string().required('Vui lòng chọn hình thức'),
  eInvoiceSymbol: yup.string().required('Vui lòng chọn ký hiệu'),
  paymentMethod: yup.string().required('Vui lòng chọn phương thức thanh toán'),
  vendorCompanyName: yup.string().optional().required('Vui lòng nhập tên cửa hàng'),
  vendorAddress: yup.string().optional().nullable(),
  vendorPhone: yup.string().optional().nullable(),
  vendorEmail: yup.string().optional().nullable(),
  vendorBankName: yup.string().optional().nullable(),
  vendorBankNumber: yup.string().optional().nullable(),
  vendorTaxCode: yup.string().optional().nullable(),
  customerName: yup.string().optional().nullable(),
  customerPhone: yup.string().optional().nullable(),
  customerEmail: yup.string().nullable().email('Email không hợp lệ').optional(),
  customerAddress: yup.string().optional().nullable(),
  customerBankName: yup.string().optional().nullable(),
  customerBankNumber: yup.string().optional().nullable(),
  customerTaxCode: yup
      .string()
      .matches(/^\d{10}(-\d{3})?$/, {
        message: 'Mã số thuế không đúng định dạng',
        excludeEmptyString: true
      })
      .optional()
      .nullable(),
});

export type EInvoiceOrderPayload = yup.InferType<typeof eInvoiceOrderSchema>;
