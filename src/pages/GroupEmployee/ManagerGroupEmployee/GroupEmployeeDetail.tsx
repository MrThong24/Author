import { Checkbox, Skeleton, Switch, Table } from "antd";
import React from "react";
import BaseButton from "src/shared/components/Buttons/Button";
import Field from "src/shared/components/Core/Field";
import Label from "src/shared/components/Core/Label";
import useGroupEmployeeStore from "src/store/useGroupEmployeeStore";

export default function GroupEmployeeDetail() {
  const { isLoading } = useGroupEmployeeStore();
  const columns = [
    {
      title: "STT",
      render: (_text: any, _record: any, index: number) => index + 1,
    },
    { title: "Tên phân hệ", dataIndex: "name" },
    { title: "Sử dụng", dataIndex: "name" },
    {
      title: "Phân quyền",
      width: 180,
      render: () => (
        <div>
          <BaseButton disabled className="w-[120px]">
            06 Tính năng
          </BaseButton>
        </div>
      ),
    },
  ];
  return (
    <div>
      <h1 className="text-lg font-semibold text-primary">
        Thông tin tài khoản
      </h1>
      <div className="flex flex-col md:flex-row gap-x-10 items-center">
        <Field className="mt-4">
          <Label text="Tên nhóm" validate={true} />
          {isLoading ? (
            <Skeleton.Input active style={{ width: "100%" }} />
          ) : (
            <div className="bg-gray-200 rounded w-full h-[44px] px-3 py-3 text-sm text-black">
              123
            </div>
          )}
        </Field>
        <Field className="mt-4">
          <div className="flex gap-2 items-center">
            <Label text="Quản trị hệ thống" validate={false} />
            <Checkbox checked={false} />
          </div>
        </Field>
      </div>
      <div className="flex flex-col md:flex-row gap-x-10 items-center">
        <Field className="mt-4">
          <Label text="Mã nhóm" validate={true} />
          {isLoading ? (
            <Skeleton.Input active style={{ width: "100%" }} />
          ) : (
            <div className="bg-gray-200 rounded w-full h-[44px] px-3 py-3 text-sm text-black">
              123
            </div>
          )}
        </Field>
        <Field className="mt-4">{""}</Field>
      </div>
      <div className="flex w-full md:w-[50%] mt-10 justify-between">
        <h1 className="text-lg font-semibold text-primary">
          Danh sách phân quyền theo phân hệ
        </h1>
      </div>
      <div className="flex w-full md:w-[50%] my-10 justify-between">
        <Table
          scroll={{ x: "max-content", y: 400 }}
          dataSource={[]}
          columns={columns}
          pagination={false}
          size="small"
        />
      </div>
    </div>
  );
}
