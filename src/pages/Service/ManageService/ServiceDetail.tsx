import { Radio, Skeleton, Table } from "antd";
import React from "react";
import Field from "src/shared/components/Core/Field";
import Label from "src/shared/components/Core/Label";
import useServiceStore from "src/store/useServiceStore";

export default function ServiceDetail() {
  const { isLoading } = useServiceStore();
  const columns = [
    {
      title: "STT",
      width: 60,
      render: (_text: any, _record: any, index: number) => index + 1,
    },
    { title: "Danh sách phân hệ", dataIndex: "store", key: "store" },
  ];
  return (
    <div>
      <h1 className="text-lg font-semibold text-primary">
        Thông tin gói dịch vụ
      </h1>
      <div className="flex flex-col md:flex-row gap-x-10">
        <Field className="mt-4">
          <Label text="Tên gói dịch vụ" validate={true} />
          {isLoading ? (
            <Skeleton.Input active style={{ width: "100%" }} />
          ) : (
            <div className="bg-[#D9D9D9] rounded w-full h-[44px] px-3 py-3 text-sm text-black">
              123
            </div>
          )}
        </Field>
        <Field className="mt-4">
          <div className="flex gap-4">
            <Field>
              <Label text="Thời gian sử dụng" validate={true} />
              {isLoading ? (
                <Skeleton.Input active style={{ width: "100%" }} />
              ) : (
                <div className="bg-[#D9D9D9] rounded w-full h-[44px] px-3 py-3 text-sm text-black">
                  123
                </div>
              )}
            </Field>
            <Field>
              <Label text="Đơn vị tính" validate={true} />
              {isLoading ? (
                <Skeleton.Input active style={{ width: "100%" }} />
              ) : (
                <div className="bg-[#D9D9D9] rounded w-full h-[44px] px-3 py-3 text-sm text-black">
                  123
                </div>
              )}
            </Field>
          </div>
        </Field>
      </div>
      <div className="flex flex-col md:flex-row gap-x-10">
        <Field className="mt-4">
          <Label text="Mã gói dịch vụ" validate={true} />
          {isLoading ? (
            <Skeleton.Input active style={{ width: "100%" }} />
          ) : (
            <div className="bg-[#D9D9D9] rounded w-full h-[44px] px-3 py-3 text-sm text-black">
              123
            </div>
          )}
        </Field>
        <Field className="mt-4">
          <div className="flex gap-4">
            <Field>
              <Label text="Giá trị gói dịch vụ" validate={true} />
              {isLoading ? (
                <Skeleton.Input active style={{ width: "100%" }} />
              ) : (
                <div className="bg-[#D9D9D9] rounded w-full h-[44px] px-3 py-3 text-sm text-black">
                  123
                </div>
              )}
            </Field>
            <Field>
              <Label text="Trạng thái" validate={true} />
              {isLoading ? (
                <Skeleton.Input active style={{ width: "100%" }} />
              ) : (
                <div className="bg-[#D9D9D9] rounded w-full h-[44px] px-3 py-3 text-sm text-black">
                  123
                </div>
              )}
            </Field>
          </div>
        </Field>
      </div>
      <div className="flex flex-col md:flex-row gap-x-10">
        <Field className="mt-4">
          <Label text="Hình thức gói" validate={false} />
          <Radio.Group defaultValue={true} disabled={true}>
            <Radio value={true}>Dùng thử</Radio>
            <Radio value={false}>Thương mại</Radio>
          </Radio.Group>
        </Field>
        <Field className="mt-4"> </Field>
      </div>
      <div className="flex flex-col md:flex-row gap-x-10">
        <Field className="mt-4">
          <Label text="SL cửa hàng" validate={true} />
          {isLoading ? (
            <Skeleton.Input active style={{ width: "100%" }} />
          ) : (
            <div className="bg-[#D9D9D9] rounded w-full h-[44px] px-3 py-3 text-sm text-black">
              123
            </div>
          )}
        </Field>
        <Field className="mt-4"> </Field>
      </div>
      <div className="flex w-full md:w-[50%] mt-8 justify-between">
        <h1 className="text-lg font-semibold text-primary">
          Danh sách phân quyền dịch vụ truy cập
        </h1>
      </div>
      <div className="flex w-full md:w-[50%] justify-between">
        <Table
          scroll={{ x: "max-content", y: 400 }}
          dataSource={[
            {
              store: "123",
            },
          ]}
          columns={columns}
          pagination={false}
          size="small"
        />
      </div>
    </div>
  );
}
