import * as yup from 'yup';

export const CustomerSchema = yup.object({
  name: yup.string().required('Vui lòng nhập tên khách hàng').trim(),

  phone: yup
    .string()
    .matches(/^[0-9]+$/, 'Vui lòng chỉ nhập số')
    .transform((value) => (value === '' ? null : value)) // Biến chuỗi rỗng thành null
    .notRequired() // Không bắt buộc nhập
    .nullable() // Cho phép giá trị null
  // .test(
  //   'length',
  //   'Số điện thoại phải là 10 số',
  //   (value) => !value || value.length === 10
  //   // (value) => !value || (value.length >= 10 && value.length <= 15)
  // )
});

export type CustomerPayload = yup.InferType<typeof CustomerSchema>;
