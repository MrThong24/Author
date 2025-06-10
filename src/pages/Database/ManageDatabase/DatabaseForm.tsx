import React from "react";
import {
  Control,
  FieldErrors,
  UseFormClearErrors,
  UseFormSetValue,
} from "react-hook-form";
import BaseButton from "src/shared/components/Buttons/Button";
import Field from "src/shared/components/Core/Field";
import Label from "src/shared/components/Core/Label";
import FormInput from "src/shared/components/Form/FormInput";
import FormSelect from "src/shared/components/Form/FormSelect";
import { DatabasePayload } from "src/validate/databaseSchema";
import { DeleteOutlined } from "@ant-design/icons";
import { Table } from "antd";

interface DataType {
  key?: number;
  name: string;
}
interface DatabaseForm {
  control: Control<DatabasePayload>;
  errors: FieldErrors<DatabasePayload>;
  loading: boolean;
  setValue: UseFormSetValue<DatabasePayload>;
  clearErrors: UseFormClearErrors<DatabasePayload>;
  schema: DataType[];
  listSchema: any;
}
export default function DatabaseForm({
  control,
  errors,
  loading,
  setValue,
  schema,
  listSchema,
  clearErrors,
}: DatabaseForm) {
  const handleSelectPermission = (
    index: number,
    name: keyof DataType,
    value: string
  ) => {
    let updatedPermissions = [...schema];

    if (!updatedPermissions.length) {
      updatedPermissions = [{} as DataType]; // Đảm bảo có ít nhất một object hợp lệ
    }

    updatedPermissions[index] = {
      ...updatedPermissions[index],
      [name]: value,
    };

    setValue("schema", updatedPermissions);
    clearErrors(`schema.${index}.${name}`);
  };

  const handleDeleteUserRole = (index: number) => {
    const updatedPermissions = [...schema];
    updatedPermissions.splice(index, 1);
    setValue?.("schema", updatedPermissions);
  };

  const handleAddRow = () => {
    const newRow = {
      key: Date.now(),
      name: "",
    };
    const updatedPermissions = [...(schema || []), newRow];
    setValue?.("schema", updatedPermissions);
  };

  const columns = [
    {
      title: "STT",
      width: 60,
      render: (_text: any, _record: any, index: number) => index + 1,
    },
    {
      title: "Nhóm người dùng",
      dataIndex: "store",
      key: "store",
      render: (_: any, record: DataType, index: number) => (
        <FormSelect
          name={`schema.${index}.name`}
          value={record.name || undefined}
          options={listSchema}
          fieldNames={{
            label: "label",
            value: "value",
          }}
          disabled={loading}
          placeholder="Nhập tên schema"
          size={"large"}
          control={control}
          errors={errors?.schema?.[index]?.name}
          onChange={(value) => handleSelectPermission(index, "name", value)}
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
      <div className="flex flex-col md:flex-row gap-x-10">
        <Field className="mt-4">
          <Label text="Username" validate={true} />
          <FormInput
            control={control}
            name="username"
            type="text"
            placeholder="Nhập username"
            disabled={false}
            errors={errors}
            size="large"
          />
        </Field>
        <Field className="mt-4">
          <div className="flex gap-4">
            <Field className="flex-1">
              <Label text="Host" validate={true} />
              <FormInput
                control={control}
                name="host"
                type="text"
                placeholder="Nhập host"
                disabled={false}
                errors={errors}
                size="large"
              />
            </Field>
            <Field className="flex-1">
              <Label text="Port" validate={true} />
              <FormInput
                control={control}
                name="port"
                type="text"
                placeholder="Nhập port"
                disabled={false}
                errors={errors}
                size="large"
              />
            </Field>
          </div>
        </Field>
      </div>
      <div className="flex flex-col md:flex-row gap-x-10">
        <Field className="mt-4">
          <Field>
            <Label text="Password" validate={true} />
            <FormInput
              control={control}
              name="password"
              type="password"
              disabled={false}
              placeholder="••••••••••"
              errors={errors}
              size="large"
            />
          </Field>
        </Field>
        <Field className="mt-4">
          <Label text="Kiểm tra kết nối" validate={false} />
          <div>
            <BaseButton disabled={false} onClick={() => {}}>
              Kiểm tra kết nối
            </BaseButton>
          </div>
        </Field>
      </div>
      <div className="flex w-full md:w-[50%] mt-4 justify-between">
        <h1 className="text-lg font-semibold text-primary">Danh sách schema</h1>
        <BaseButton className="text-xs md:mr-5" onClick={handleAddRow}>
          Thêm mới
        </BaseButton>
      </div>
      <div className="flex w-full md:w-[50%] my-10 justify-between">
        {schema?.length > 0 && (
          <Table
            scroll={{ x: "max-content", y: 400 }}
            dataSource={schema}
            columns={columns}
            pagination={false}
            size="small"
          />
        )}
      </div>
    </div>
  );
}
