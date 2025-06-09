import { passwordRegex } from "src/shared/utils/regex";
import * as yup from "yup";

export const categorySchema = yup.object({
  url: yup.string().required("Vui lòng nhập url"),
  endpoint: yup.string().required("Vui lòng Endpoint"),
  description: yup.string().optional(),
});

export type CategoryPayload = yup.InferType<typeof categorySchema>;
