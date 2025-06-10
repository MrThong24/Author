import { Radio, Table } from "antd";
import React from "react";
import {
  Control,
  Controller,
  FieldErrors,
  UseFormClearErrors,
  UseFormSetValue,
} from "react-hook-form";
import BaseButton from "src/shared/components/Buttons/Button";
import Field from "src/shared/components/Core/Field";
import Label from "src/shared/components/Core/Label";
import FormInput from "src/shared/components/Form/FormInput";
import FormSelect from "src/shared/components/Form/FormSelect";
import { ServicePayload } from "src/validate/serviceSchema";
import { DeleteOutlined } from "@ant-design/icons";

interface DataType {
  key?: number;
  name: string;
}
interface ServiceForm {
  control: Control<ServicePayload>;
  errors: FieldErrors<ServicePayload>;
  loading: boolean;
  setValue: UseFormSetValue<ServicePayload>;
  clearErrors: UseFormClearErrors<ServicePayload>;
  subsystem: DataType[];
  listSubSystem: any;
}
export default function ServiceForm({
  control,
  errors,
  loading,
  setValue,
  clearErrors,
  subsystem,
  listSubSystem,
}: ServiceForm) {
  const handleSelectPermission = (
    index: number,
    name: keyof DataType,
    value: string
  ) => {
    let updatedPermissions = [...subsystem];

    if (!updatedPermissions.length) {
      updatedPermissions = [{} as DataType]; // Đảm bảo có ít nhất một object hợp lệ
    }

    updatedPermissions[index] = {
      ...updatedPermissions[index],
      [name]: value,
    };

    setValue("subsystem", updatedPermissions);
    clearErrors(`subsystem.${index}.${name}`);
  };

  const handleDeleteUserRole = (index: number) => {
    const updatedPermissions = [...subsystem];
    updatedPermissions.splice(index, 1);
    setValue?.("subsystem", updatedPermissions);
  };

  const handleAddRow = () => {
    const newRow = {
      key: Date.now(),
      name: "",
    };
    const updatedPermissions = [...(subsystem || []), newRow];
    setValue?.("subsystem", updatedPermissions);
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
          name={`subsystem.${index}.name`}
          value={record.name || undefined}
          options={listSubSystem}
          fieldNames={{
            label: "label",
            value: "value",
          }}
          disabled={loading}
          placeholder="Chọn nhóm người dùng"
          size={"large"}
          control={control}
          errors={errors?.subsystem?.[index]?.name}
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
      <h1 className="text-lg font-semibold text-primary">
        Thông tin gói dịch vụ
      </h1>
      <div className="flex flex-col md:flex-row gap-x-10">
        <Field className="mt-4">
          <Label text="Tên gói dịch vụ" validate={true} />
          <FormInput
            control={control}
            name="name"
            type="text"
            placeholder="Nhập tên database"
            disabled={false}
            errors={errors}
            size="large"
          />
        </Field>
        <Field className="mt-4">
          <div className="flex gap-4">
            <Field className="flex-1">
              <Label text="Thời gian giới hạn" validate={true} />
              <FormInput
                control={control}
                name="timeCount"
                type="number"
                placeholder="Nhập số"
                disabled={false}
                errors={errors}
                size="large"
              />
            </Field>
            <Field className="flex-1">
              <Label text="Đơn vị tính" validate={true} />
              <FormSelect
                disabled={loading}
                placeholder="Đơn vị tính"
                control={control}
                name="unit"
                options={[]}
                errors={errors}
                size="large"
              />
            </Field>
          </div>
        </Field>
      </div>
      <div className="flex flex-col md:flex-row gap-x-10">
        <Field className="mt-4">
          <Label text="Mã gói dịch vụ" validate={true} />
          <FormInput
            control={control}
            name="code"
            type="text"
            placeholder="Nhập mã gói dịch vụ"
            disabled={false}
            errors={errors}
            size="large"
          />
        </Field>
        <Field className="mt-4">
          <Label text="Giá trị gói dịch vụ (VND)" validate={true} />
          <FormInput
            control={control}
            name="valuePackage"
            type="number"
            placeholder=""
            disabled={false}
            errors={errors}
            size="large"
          />
        </Field>
      </div>
      <div className="flex flex-col md:flex-row gap-x-10">
        <Field className="mt-4">
          <Label text="Hình thức gói" validate={true} />
          <Controller
            name="formPackage"
            control={control}
            render={({ field }) => (
              <Radio.Group defaultValue={true} {...field} value={field.value}>
                <Radio value={true}>Dùng thử</Radio>
                <Radio value={false}>Thương mại</Radio>
              </Radio.Group>
            )}
          />
        </Field>
        <Field className="mt-4"> </Field>
      </div>
      <h1 className="text-lg font-semibold text-primary mt-4">
        Thông tin chính sách giới hạn
      </h1>
      <div className="flex flex-col md:flex-row gap-x-10">
        <Field className="mt-4">
          <Label text="SL cửa hàng" validate={true} />
          <FormInput
            control={control}
            name="countStore"
            type="text"
            placeholder="Nhập số"
            disabled={false}
            errors={errors}
            size="large"
          />
        </Field>
        <Field className="mt-4"> </Field>
      </div>
      <div className="flex w-full md:w-[50%] mt-4 justify-between">
        <h1 className="text-lg font-semibold text-primary">
          Thông tin phân hệ sử dụng
        </h1>
        <BaseButton className="text-xs md:mr-5" onClick={handleAddRow}>
          Thêm mới
        </BaseButton>
      </div>
      <div className="flex w-full md:w-[50%] my-10 justify-between">
        {subsystem?.length > 0 && (
          <Table
            scroll={{ x: "max-content", y: 400 }}
            dataSource={subsystem}
            columns={columns}
            pagination={false}
            size="small"
          />
        )}
      </div>
    </div>
  );
}
