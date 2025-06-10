import { Dayjs } from "dayjs";
import * as yup from "yup";

export const customerSchema = yup.object({
  name: yup.string().required("Vui lòng nhập tên khách hàng"),
});

export type CustomerPayload = yup.InferType<typeof customerSchema>;
