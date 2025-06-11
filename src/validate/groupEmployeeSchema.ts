import * as yup from "yup";

export const groupEmployeeSchema = () =>
  yup.object({
    groupName: yup.string().required("Vui lòng nhập tên nhóm"),
    groupCode: yup.string().required("Vui lòng nhập mã nhóm"),
    systemAdministration: yup.boolean().optional(),
    usersPermission: yup.array().of(
      yup.object().shape({
        key: yup.number().optional(),
        name: yup.string().optional(),
        use: yup.boolean().optional(),
        list: yup.array().optional(),
      })
    ),
  });

export type GroupEmployeePayload = yup.InferType<
  ReturnType<typeof groupEmployeeSchema>
>;
