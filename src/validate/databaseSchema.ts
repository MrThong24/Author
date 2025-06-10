import { passwordRegex } from "src/shared/utils/regex";
import * as yup from "yup";

export const databaseSchema = yup.object({
  username: yup.string().required("Vui lòng nhập username"),
  password: yup
    .string()
    .required("Vui lòng nhập mật khẩu")
    .matches(
      passwordRegex,
      "Mật khẩu phải có ít nhất 8 ký tự  bao gồm một chữ hoa, một chữ thường, một số và một kí tự đặc biệt"
    ),
  host: yup.string().required("Vui lòng nhập host"),
  port: yup.string().required("Vui lòng nhập port"),
  schema: yup
    .array()
    .of(
      yup.object().shape({
        key: yup.number().optional(),
        name: yup.string().required("Tên schema bắt buộc"),
      })
    )
    .min(1, "Schema là bắt buộc")
    .required("Schema là bắt buộc"),
});

export type DatabasePayload = yup.InferType<typeof databaseSchema>;
