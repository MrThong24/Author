import * as yup from 'yup';

export const CompanySchema = yup.object({
  name: yup.string().trim().required('Vui lòng nhập tên công ty'),
  taxCode: yup
    .string()
    .trim()
    .nullable()
    .notRequired()
    .matches(/^\d{10}(-\d{3})?$/, {
      message: 'Mã số thuế không đúng định dạng',
      excludeEmptyString: true
    }),
  legalRepresentative: yup.string().optional(),
  address: yup.string().optional(),
  posIntegration: yup.boolean().optional(),
  posConnectionUrl: yup.string().optional()
});

export const PostConnectionSchema = yup.object({
  posConnectionUrl: yup.string().trim().required('Vui lòng nhập đường dẫn đích')
});

export type CompanyPayload = yup.InferType<typeof CompanySchema>;
export type PostConnectPayload = yup.InferType<typeof PostConnectionSchema>;
