import { Dayjs } from "dayjs";
import * as yup from "yup";

export const contractSchema = yup.object({
  name: yup.string().required("Vui lòng nhập tên khách hàng"),
  dateContract: yup.mixed<Dayjs>().required("Vui lòng chọn ngày"),
  dateOfUse: yup.mixed<Dayjs>().required("Vui lòng chọn ngày"),
  servicePackage: yup.string().required("Vui lòng chọn gói dịch vụ"),
});

export type ContractPayload = yup.InferType<typeof contractSchema>;
