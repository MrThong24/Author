import { DatePicker, Table } from "antd";
import React from "react";
import {
  Control,
  Controller,
  FieldErrors,
  UseFormClearErrors,
  UseFormSetValue,
} from "react-hook-form";
import dayjs, { Dayjs } from "dayjs";
import { ContractPayload } from "src/validate/contractSchema";
import FormDate from "src/shared/components/Form/FormDate";
import Field from "src/shared/components/Core/Field";
import Label from "src/shared/components/Core/Label";
import FormInput from "src/shared/components/Form/FormInput";
import FormSelect from "src/shared/components/Form/FormSelect";

interface ContractFormProps {
  control: Control<ContractPayload>;
  errors: FieldErrors<ContractPayload>;
  loading: boolean;
  setValue: UseFormSetValue<ContractPayload>;
  clearErrors: UseFormClearErrors<ContractPayload>;
  dataTable: any;
}

export default function ContractForm({
  control,
  errors,
  loading,
  setValue,
  clearErrors,
  dataTable,
}: ContractFormProps) {
  const columns = [
    {
      title: "STT",
      width: 60,
      render: (_text: any, _record: any, index: number) => index + 1,
    },
    { title: "Phân hệ", dataIndex: "store", key: "store" },
    ...(dataTable?.some((item: any) => item.selectedDatabase)
      ? [
          {
            title: "Cơ sở dữ liệu",
            dataIndex: "selectedDatabase",
            key: "selectedDatabase",
          },
        ]
      : []),
  ];

  return (
    <div>
      <h1 className="text-lg font-semibold text-primary">Thông tin hợp đồng</h1>
      <div className="flex flex-col md:flex-row gap-x-10">
        <Field className="mt-4">
          <Label text="Tên khách hàng" validate={true} />
          <FormInput
            control={control}
            name="name"
            type="text"
            placeholder="Tên khách hàng"
            disabled={false}
            errors={errors}
            size="large"
          />
        </Field>
        <Field className="mt-4">
          <Label text="Ngày hợp đồng" validate={true} />
          <FormDate
            control={control}
            errors={errors}
            name="dateContract"
            placeholder="Chọn ngày"
            format="DD/MM/YYYY"
            // defaultValue={dayjs()}
            disabled={loading}
            allowClear={true}
          />
        </Field>
      </div>
      <div className="flex flex-col md:flex-row gap-x-10">
        <Field className="mt-4">
          <Label text="Mã khách hàng" validate={true} />
          <div className="bg-[#D9D9D9] rounded w-full h-[40px] px-3 py-3 text-sm text-black">
            123
          </div>
        </Field>
        <Field className="mt-4"> </Field>
      </div>
      <h1 className="text-lg font-semibold text-primary mt-8">
        Thông tin gói dịch vụ
      </h1>
      <div className="flex flex-col md:flex-row gap-x-10">
        <Field className="mt-4">
          <Label text="Gói dịch vụ" validate={true} />
          <FormSelect
            disabled={loading}
            placeholder="Chọn gói dịch vụ"
            control={control}
            name="servicePackage"
            options={[
              {
                label: "123",
                value: "123",
              },
            ]}
            errors={errors}
            size="large"
          />
        </Field>
        <Field className="mt-4">
          <Label text="Thời gian sử dụng" validate={true} />
          <div className="flex gap-4 items-center">
            <div className="bg-[#D9D9D9] rounded w-full h-[40px] px-3 py-3 text-sm text-black">
              123
            </div>
            /
            <div className="bg-[#D9D9D9] rounded w-full h-[40px] px-3 py-3 text-sm text-black">
              123
            </div>
          </div>
        </Field>
      </div>
      <div className="flex flex-col md:flex-row gap-x-10">
        <Field className="mt-4">
          <Label text="Mã gói dịch vụ" validate={false} />
          <div className="bg-[#D9D9D9] rounded w-full h-[40px] px-3 py-3 text-sm text-black">
            123
          </div>
        </Field>
        <Field className="mt-4">
          <Label text="Ngày sử dụng" validate={true} />
          <div className="flex gap-4 items-start">
            <FormDate
              control={control}
              errors={errors}
              name="dateOfUse"
              placeholder="Chọn ngày"
              format="DD/MM/YYYY"
              // defaultValue={dayjs()}
              disabled={loading}
              allowClear={true}
            />
            <div className="mt-2">/</div>
            <div className="bg-[#D9D9D9] rounded w-full h-[40px] px-3 py-3 text-sm text-black">
              123
            </div>
          </div>
        </Field>
      </div>
      <div className="flex flex-col md:flex-row gap-x-10">
        <Field className="mt-4">
          <Label text="Giá trị gói (VND)" validate={false} />
          <div className="bg-[#D9D9D9] rounded w-full h-[40px] px-3 py-3 text-sm text-black">
            123
          </div>
        </Field>
        <Field className="mt-4"> </Field>
      </div>
      <h1 className="text-lg font-semibold text-primary">
        Thông tin chính sách giới hạn
      </h1>
      <div className="flex flex-col md:flex-row gap-x-10">
        <Field className="mt-4">
          <Label text="SL cửa hàng" validate={false} />
          <div className="bg-[#D9D9D9] rounded w-full h-[40px] px-3 py-3 text-sm text-black">
            123
          </div>
        </Field>
        <Field className="mt-4"> </Field>
      </div>
      <h1 className="text-lg font-semibold text-primary mt-8">
        Thông tin site - dịch vụ sử dụng
      </h1>
      <div className="flex w-full md:w-[50%] justify-between mb-6">
        <Table
          scroll={{ x: "max-content", y: 400 }}
          dataSource={dataTable}
          columns={columns}
          pagination={false}
          size="small"
        />
      </div>
    </div>
  );
}
