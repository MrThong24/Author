import * as yup from 'yup';

export const productSchema = yup.object({
  name: yup.string().required('Vui lòng nhập tên sản phẩm').trim(),
  productCategoryId: yup.string().required('Vui lòng chọn danh mục'),
  unit: yup.string().required('Vui lòng chọn tên đơn vị'),
  price: yup
    .number()
    .transform((value, originalValue) => (originalValue === '' ? undefined : value))
    .required('Vui lòng nhập giá sản phẩm')
    .min(0, 'Giá trị sản phẩm không được nhỏ hơn 0'),
  description: yup.string().optional(),
  discountPercent: yup
    .number()
    .integer('Giá trị giảm trừ hoá đơn bán hàng phải là số nguyên')
    .transform((value, originalValue) => (originalValue === '' ? undefined : value))
    .required('Vui lòng nhập giảm trừ hoá đơn bán hàng')
    .min(0, 'Giá trị giảm trừ hoá đơn bán hàng không được nhỏ hơn 0')
    .max(100, 'Giá trị giảm trừ hoá đơn bán hàng không được lớn hơn 100%'),
  translations: yup.array().of(
    yup.object({
      languageCode: yup.string().optional(),
      name: yup.string().required('Vui lòng nhập tên tiếng anh').trim(),
      description: yup.string().optional()
    })
  ),
  productTypeId: yup.string().required('Vui lòng chọn phân loại sản phẩm')
});

export type ProductPayload = yup.InferType<typeof productSchema>;
