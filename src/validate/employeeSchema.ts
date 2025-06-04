import { passwordRegex } from 'src/shared/utils/regex';
import * as yup from 'yup';

export const employeeSchema = (isPosIntegration: boolean) =>
  yup.object({
    name: yup.string().required('Vui lòng nhập tên nhân viên').trim(),
    phone: yup
      .string()
      .matches(/^0\d{9}$/, 'Số điện thoại phải gồm 10 chữ số và bắt đầu bằng số 0')
      .required('Vui lòng nhập số điện thoại'),
    address: yup.string().optional(),
    username: yup
      .string()
      .required('Vui lòng nhập tên tài khoản')
      .matches(/^(?!.[&=_'<>+,-]{1})(?!.\.\.)(?!\.$)(?!^\.)[a-zA-Z0-9.]+$/, 'Tên tài khoản không hợp lệ'),
    password: yup
      .string()
      .required('Vui lòng nhập mật khẩu')
      .matches(
        passwordRegex,
        'Mật khẩu phải có ít nhất 8 ký tự  bao gồm một chữ hoa, một chữ thường, một số và một kí tự đặc biệt'
      ),
    userStores: yup
      .array()
      .of(
        yup.object().shape({
          key: yup.number().optional(),
          role: yup.string().nullable().required('Vai trò là bắt buộc'),
          storeId: yup.string().nullable().required('Cửa hàng là bắt buộc')
        })
      )
      .min(1, 'Phân quyền dịch vụ truy cập là bắt buộc')
      .required('Phân quyền dịch vụ truy cập là bắt buộc'),
    posUserId: isPosIntegration
      ? yup.string().required('Vui lòng nhập kết nối điểm bán MobiFone 1POS')
      : yup.string().notRequired()
  });

export const employeeSchemaWithoutPassword = (isPosIntegration: boolean) =>
  employeeSchema(isPosIntegration).omit(['password', 'username']);

export type EmployeePayload = yup.InferType<ReturnType<typeof employeeSchema>>;
export type EmployeePayloadWithOutPassword = yup.InferType<ReturnType<typeof employeeSchemaWithoutPassword>>;
