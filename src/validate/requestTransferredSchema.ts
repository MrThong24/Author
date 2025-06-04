import * as yup from 'yup';

export const requestTransferredSchema = yup.object({
  count: yup.number().optional(),
  reason: yup.string().trim().required('Vui lòng nhập lý do')
});

export type RequestTransferredPayload = yup.InferType<typeof requestTransferredSchema>;

export const requestReMadeSchema = yup.object().shape({
  reasons: yup.array().of(yup.string().required('Vui lòng nhập lý do'))
});
export type RequestReMadePayload = yup.InferType<typeof requestReMadeSchema>;
