import { Table } from "antd";
import {
  Control,
  FieldErrors,
  UseFormClearErrors,
  UseFormSetValue,
} from "react-hook-form";
import NoData from "src/components/NoData/NoData";
import BaseButton from "src/shared/components/Buttons/Button";
import BaseCheckbox from "src/shared/components/Core/Checkbox";
import Field from "src/shared/components/Core/Field";
import Label from "src/shared/components/Core/Label";
import FormInput from "src/shared/components/Form/FormInput";
import FormSelect from "src/shared/components/Form/FormSelect";
import { DeleteOutlined } from "@ant-design/icons";
import {
  EmployeePayload,
  EmployeePayloadWithOutPassword,
} from "src/validate/employeeSchema";

interface DataType {
  key?: number;
  usersGroup: string;
}

interface EmployeeForm {
  control: Control<EmployeePayload | EmployeePayloadWithOutPassword>;
  errors: FieldErrors<EmployeePayload | EmployeePayloadWithOutPassword>;
  loading: boolean;
  setValue: UseFormSetValue<EmployeePayload | EmployeePayloadWithOutPassword>;
  clearErrors: UseFormClearErrors<
    EmployeePayload | EmployeePayloadWithOutPassword
  >;
  usersPermission: DataType[];
  listCustomer: any;
  listUsersPermistion: any;
}

export default function EmployeeForm({
  control,
  errors,
  loading,
  usersPermission,
  setValue,
  clearErrors,
  listCustomer,
  listUsersPermistion,
}: EmployeeForm) {
  const handleSelectPermission = (
    index: number,
    name: keyof DataType,
    value: string
  ) => {
    let updatedPermissions = [...usersPermission];

    if (!updatedPermissions.length) {
      updatedPermissions = [{} as DataType]; // Đảm bảo có ít nhất một object hợp lệ
    }

    updatedPermissions[index] = {
      ...updatedPermissions[index],
      [name]: value,
    };

    setValue("usersPermission", updatedPermissions);
    clearErrors(`usersPermission.${index}.${name}`);
  };

  const handleDeleteUserRole = (index: number) => {
    const updatedPermissions = [...usersPermission];
    updatedPermissions.splice(index, 1);
    setValue?.("usersPermission", updatedPermissions);
  };

  const handleAddRow = () => {
    const newRow = {
      key: Date.now(),
      usersGroup: "",
    };
    const updatedPermissions = [...(usersPermission || []), newRow];
    setValue?.("usersPermission", updatedPermissions);
  };

  const columns = [
    {
      title: "STT",
      render: (_text: any, _record: any, index: number) => index + 1,
    },
    {
      title: "Nhóm người dùng",
      dataIndex: "store",
      key: "store",
      render: (_: any, record: DataType, index: number) => (
        <FormSelect
          name={`usersPermission.${index}.usersGroup`}
          value={record.usersGroup || undefined}
          options={listUsersPermistion}
          fieldNames={{
            label: "label",
            value: "value",
          }}
          disabled={loading}
          placeholder="Chọn nhóm người dùng"
          size={"large"}
          control={control}
          errors={errors?.usersPermission?.[index]?.usersGroup}
          onChange={(value) =>
            handleSelectPermission(index, "usersGroup", value)
          }
          className="ant-select-max-width"
        />
      ),
    },
    {
      title: "",
      dataIndex: "delete",
      width: "10%",
      key: "delete",
      render: (_: any, record: DataType, index: number) =>
        index !== 0 ? (
          <DeleteOutlined
            className="cursor-pointer text-xl hover:opacity-65 mb-6"
            style={{ color: "#ff4d4f" }}
            onClick={() => handleDeleteUserRole(index)}
          />
        ) : null,
    },
  ];
  return (
    <div>
      <h1 className="text-lg font-semibold text-primary">
        Thông tin tài khoản
      </h1>
      <div className="flex flex-col md:flex-row gap-x-10">
        <Field className="mt-4">
          <Label text="Tên đăng nhập" validate={true} />
          <FormInput
            control={control}
            name="loginname"
            type="text"
            placeholder="Nhập tên đăng nhập"
            disabled={false}
            errors={errors}
            size="large"
          />
        </Field>
        <Field className="mt-4">
          <Label text="Tên người dùng" validate={true} />
          <FormInput
            control={control}
            name="username"
            type="text"
            placeholder="Nhập tên người dùng"
            disabled={false}
            errors={errors}
            size="large"
          />
        </Field>
      </div>
      <div className="flex flex-col md:flex-row gap-x-10">
        <Field className="mt-4">
          <Label text="Email" validate={true} />
          <FormInput
            control={control}
            name="email"
            type="text"
            placeholder="Nhập email"
            disabled={false}
            errors={errors}
            size="large"
          />
        </Field>
        <Field className="mt-4">
          <Label text="Thuộc khách hàng" validate={true} />
          <FormSelect
            disabled={loading}
            placeholder="Chọn khách hàng"
            control={control}
            name="customer"
            showSearch
            errors={errors}
            options={listCustomer.map((users: any) => ({
              label: users.name,
              value: users.id,
            }))}
            notFoundContent={<NoData />}
            size="large"
          />
        </Field>
      </div>
      <div className="flex flex-col md:flex-row gap-x-10">
        <Field className="mt-4">
          <Label text="Số điện thoại" validate={false} />
          <FormInput
            control={control}
            name="phone"
            type="text"
            placeholder="Nhập số điện thoại"
            disabled={false}
            errors={errors}
            size="large"
          />
        </Field>
        <Field className="mt-4">
          <Label text="Quản trị hệ thống" validate={false} />
          <FormSelect
            disabled={loading}
            placeholder="Không có quyền"
            control={control}
            name="systemAdministration"
            options={[]}
            showSearch
            errors={errors}
            notFoundContent={<NoData />}
            size="large"
          />
        </Field>
      </div>
      <div className="flex flex-col md:flex-row gap-x-10">
        <Field className="mt-4">
          <Field>
            <Label text="Mật khẩu" validate={true} />
            <FormInput
              control={control}
              name="newPassword"
              type="password"
              disabled={false}
              placeholder="••••••••••"
              errors={errors}
              size="large"
            />
          </Field>
        </Field>
        <Field className="mt-4"> </Field>
      </div>
      <div className="flex flex-col md:flex-row gap-x-10">
        <Field className="mt-4">
          <Field>
            <Label text="Nhập lại mật khẩu" validate={true} />
            <FormInput
              control={control}
              name="confirmNewPassword"
              type="password"
              disabled={false}
              placeholder="••••••••••"
              errors={errors}
              size="large"
            />
          </Field>
        </Field>
        <Field className="mt-4"> </Field>
      </div>
      <div className="flex w-full md:w-[50%] mt-10 justify-between">
        <h1 className="text-lg font-semibold text-primary">
          Danh sách phân quyền dịch vụ truy cập
        </h1>
        <BaseButton className="text-xs md:mr-5" onClick={handleAddRow}>
          Thêm mới
        </BaseButton>
      </div>
      <div className="flex w-full md:w-[50%] my-10 justify-between">
        {usersPermission?.length > 0 && (
          <Table
            scroll={{ x: "max-content", y: 400 }}
            dataSource={usersPermission}
            columns={columns}
            pagination={false}
            size="small"
          />
        )}
      </div>
    </div>
  );
}
