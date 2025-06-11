import { Checkbox, Drawer, Switch, Table } from "antd";
import React, { useState } from "react";
import {
  Control,
  Controller,
  FieldErrors,
  UseFormClearErrors,
  UseFormSetValue,
  UseWatchProps,
} from "react-hook-form";
import { FaChevronLeft } from "react-icons/fa";
import BaseButton from "src/shared/components/Buttons/Button";
import Field from "src/shared/components/Core/Field";
import Label from "src/shared/components/Core/Label";
import FormInput from "src/shared/components/Form/FormInput";
import { GroupEmployeePayload } from "src/validate/groupEmployeeSchema";
import CustomDrawer from "../components/CustomDrawer";

const data: any[] = [
  {
    key: 1,
    name: "Quản lý đơn hàng",
    age: "MO_INVOICE",
    children: [
      {
        key: 11,
        name: "Xem danh sách đơn hàng",
        age: "MO_INVOICE",
      },
      {
        key: 12,
        name: "Xem chi tiết đơn hàng",
        age: "MO_INVOICE",
        children: [
          {
            key: 121,
            name: "Thanh toán đơn hàng",
            age: "MO_INVOICE",
          },
        ],
      },
    ],
  },
];

interface DataType {
  key?: number;
  name?: string;
  use?: boolean;
  list?: any;
}
interface GroupEmployeeForm {
  control: Control<GroupEmployeePayload>;
  errors: FieldErrors<GroupEmployeePayload>;
  loading: boolean;
  setValue: UseFormSetValue<GroupEmployeePayload>;
  clearErrors: UseFormClearErrors<GroupEmployeePayload>;
  usersPermission: DataType[];
}

export default function GroupEmployeeForm({
  control,
  errors,
  loading,
  setValue,
  usersPermission,
}: GroupEmployeeForm) {
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [dataDrawer, setDataDrawer] = useState<any[]>(data);
  const [selectedKeys, setSelectedKeys] = useState<any[]>([]);
  const handleSaveSelection =
    (index: number) => (selectedKeys: React.Key[]) => {
      setValue(`usersPermission.${index}.list`, selectedKeys);
    };
  const columns = [
    {
      title: "STT",
      render: (_text: any, _record: any, index: number) => index + 1,
    },
    {
      title: "Tên phân hệ",
      render: (_: any, record: DataType, index: number) => (
        <div>
          <Controller
            control={control}
            name={`usersPermission.${index}.name`}
            defaultValue={record.name}
            render={({ field }) => <h2>{field.value}</h2>}
          />
        </div>
      ),
    },
    {
      title: "Sử dựng",
      render: (_: any, record: DataType, index: number) => (
        <div>
          <Controller
            control={control}
            name={`usersPermission.${index}.use`}
            defaultValue={record.use ?? false}
            render={({ field }) => (
              <Checkbox
                checked={field.value}
                onChange={(checked) => field.onChange(checked)}
                disabled={loading}
              />
            )}
          />
        </div>
      ),
    },
    {
      title: "Phân quyền",
      width: 180,
      render: (_: any, record: DataType, index: number) => {
        return (
          <div>
            <Controller
              control={control}
              name={`usersPermission.${index}.list`}
              defaultValue={record.list}
              render={({ field }) => (
                <BaseButton
                  onClick={() => {
                    const currentList = field.value || [];
                    setSelectedKeys(currentList);
                    setCurrentIndex(index);
                    setDrawerVisible(true);
                  }}
                  className="w-[120px]"
                >
                  Tính năng{" "}
                  {field.value?.length ? `(${field.value.length})` : ""}
                </BaseButton>
              )}
            />
          </div>
        );
      },
    },
  ];
  return (
    <div>
      <h1 className="text-lg font-semibold text-primary">
        Thông tin tài khoản
      </h1>
      <div className="flex flex-col md:flex-row gap-x-10 ">
        <Field className="mt-4">
          <Label text="Tên nhóm" validate={true} />
          <FormInput
            control={control}
            name="groupName"
            type="text"
            placeholder="Nhập tên nhóm"
            disabled={false}
            errors={errors}
            size="large"
          />
        </Field>
        <Field className="mt-4">
          <div className="flex gap-2 items-center">
            <Label text="Quản trị hệ thống" validate={false} />
            <Controller
              control={control}
              name="systemAdministration"
              defaultValue={false}
              render={({ field }) => (
                <Checkbox
                  checked={field.value}
                  onChange={(checked) => {
                    field.onChange(checked);
                  }}
                />
              )}
            />
          </div>
        </Field>
      </div>
      <div className="flex flex-col md:flex-row gap-x-10">
        <Field className="mt-4">
          <Label text="Mã nhóm" validate={true} />
          <FormInput
            control={control}
            name="groupCode"
            type="text"
            placeholder="Nhập mã nhóm"
            disabled={false}
            errors={errors}
            size="large"
          />
        </Field>
        <Field className="mt-4"> </Field>
      </div>
      <div className="flex w-full md:w-[50%] mt-10 justify-between">
        <h1 className="text-lg font-semibold text-primary">
          Danh sách phân quyền theo phân hệ
        </h1>
      </div>
      <div className="flex w-full md:w-[50%] my-10 justify-between">
        <Table
          scroll={{ x: "max-content", y: 400 }}
          dataSource={usersPermission}
          columns={columns}
          pagination={false}
          size="small"
        />
      </div>
      <CustomDrawer
        onClose={() => {
          setDrawerVisible(false);
          setDataDrawer(data);
        }}
        open={drawerVisible}
        dataDrawer={dataDrawer}
        onSaveSelection={handleSaveSelection(currentIndex)}
        initialSelectedKeys={selectedKeys}
      />
    </div>
  );
}
