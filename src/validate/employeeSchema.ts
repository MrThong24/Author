import { passwordRegex } from "src/shared/utils/regex";
import * as yup from "yup";

export const employeeSchema = () =>
  yup.object({
    loginname: yup
      .string()
      .required("Vui lòng nhập tên đăng nhập")
      .min(6, "Tên đăng nhập phải có ít nhất 6 ký tự")
      .max(50, "Tên đăng nhập không được quá 50 ký tự"),
    username: yup
      .string()
      .required("Vui lòng nhập tên người dùng")
      .max(50, "Tên người dùng không được quá 50 ký tự"),
    email: yup
      .string()
      .required("Vui lòng nhập email")
      .email("Vui lòng nhập đúng định dạng email"),
    customer: yup.string().required("Vui lòng nhập thuộc khách hàng"),
    phone: yup.string().optional().nullable(),
    newPassword: yup
      .string()
      .required("Vui lòng nhập mật khẩu")
      .matches(
        passwordRegex,
        "Mật khẩu phải có ít nhất 8 ký tự  bao gồm một chữ hoa, một chữ thường, một số và một kí tự đặc biệt"
      ),
    systemAdministration: yup.string().optional(),
    confirmNewPassword: yup
      .string()
      .required("Vui lòng nhập mật khẩu")
      .oneOf([yup.ref("newPassword")], "Vui lòng nhập đúng với mật khẩu mới")
      .matches(
        passwordRegex,
        "Mật khẩu phải có ít nhất 8 ký tự  bao gồm một chữ hoa, một chữ thường, một số và một kí tự đặc biệt"
      ),
    usersPermission: yup
      .array()
      .of(
        yup.object().shape({
          key: yup.number().optional(),
          usersGroup: yup.string().required("Nhóm người dùng là bắt buộc"),
        })
      )
      .min(1, "Phân quyền dịch vụ truy cập là bắt buộc")
      .required("Phân quyền dịch vụ truy cập là bắt buộc"),
  });

export const employeeSchemaWithoutPassword = () =>
  employeeSchema().omit(["newPassword", "username"]);

export type EmployeePayload = yup.InferType<ReturnType<typeof employeeSchema>>;
export type EmployeePayloadWithOutPassword = yup.InferType<
  ReturnType<typeof employeeSchemaWithoutPassword>
>;
