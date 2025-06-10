import * as yup from "yup";

export const serviceSchema = yup.object({
  name: yup.string().required("Vui lòng nhập gói dịch vụ"),
  timeCount: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === "" ? undefined : value
    )
    .required("Vui lòng nhập thời gian giới hạn"),
  unit: yup.string().required("Vui lòng đơn vị tính"),
  code: yup.string().required("Vui lòng nhập mã gói dịch vụ"),
  valuePackage: yup.string().required("Vui lòng nhập mã gói dịch vụ"),
  formPackage: yup.boolean().optional(),
  countStore: yup.number().optional(),
  subsystem: yup
    .array()
    .of(
      yup.object().shape({
        key: yup.number().optional(),
        name: yup.string().required("Tên phân hệ là bắt buộc"),
      })
    )
    .min(1, "Phân hệ truy cập là bắt buộc")
    .required("Phân hệ truy cập là bắt buộc"),
});

export type ServicePayload = yup.InferType<typeof serviceSchema>;
