import { Skeleton, Table } from "antd";
import React from "react";
import { MdOutlineDateRange } from "react-icons/md";
import { RequestStatusBadge } from "src/components/Badge/RequestStatusBadge";
import Field from "src/shared/components/Core/Field";
import Label from "src/shared/components/Core/Label";
import useCustomerStore from "src/store/useCustomerStore";

export default function InfoLincense() {
  const { isLoading } = useCustomerStore();
  const columns = [
    {
      title: "STT",
      width: 60,
      render: (_text: any, _record: any, index: number) => index + 1,
    },
    { title: "Phân hệ", dataIndex: "store", key: "store" },
    ...([]?.some((item: any) => item.selectedDatabase) // Check if any item has selectedDatabase
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
          {isLoading ? (
            <Skeleton.Input active style={{ width: "100%" }} />
          ) : (
            <div className="bg-[#EEECEC] rounded-md border border-[#BFBFBF] w-full h-[40px] px-2 leading-[40px] text-sm text-black">
              123
            </div>
          )}
        </Field>
        <Field className="mt-4">
          <div className="flex gap-4 items-center">
            <Field>
              <Label text="Ngày hợp đồng" validate={true} />
              {isLoading ? (
                <Skeleton.Input active style={{ width: "100%" }} />
              ) : (
                <div className="bg-[#EEECEC] rounded-md border border-[#BFBFBF] w-full h-[40px] px-2 leading-[40px] text-sm text-black flex justify-between items-center">
                  <span>123</span>
                  <MdOutlineDateRange size={24} color="gray" />
                </div>
              )}
            </Field>
            <Field>
              <Label text="Mã hợp đồng" validate={true} />
              {isLoading ? (
                <Skeleton.Input active style={{ width: "100%" }} />
              ) : (
                <div className="bg-[#EEECEC] rounded-md border border-[#BFBFBF] w-full h-[40px] px-2 leading-[40px] text-sm text-black">
                  123
                </div>
              )}
            </Field>
          </div>
        </Field>
      </div>
      <div className="flex flex-col md:flex-row gap-x-10">
        <Field className="mt-4">
          <Label text="Mã khác hàng" validate={true} />
          {isLoading ? (
            <Skeleton.Input active style={{ width: "100%" }} />
          ) : (
            <div className="bg-[#EEECEC] rounded-md border border-[#BFBFBF] w-full h-[40px] px-2 leading-[40px] text-sm text-black">
              123
            </div>
          )}
        </Field>
        <Field className="mt-4"> </Field>
      </div>
      <h1 className="text-lg font-semibold text-primary">Thông tin gói</h1>
      <div className="flex flex-col md:flex-row gap-x-10">
        <Field className="mt-4">
          <Label text="Tên gói dịch vụ " validate={true} />
          {isLoading ? (
            <Skeleton.Input active style={{ width: "100%" }} />
          ) : (
            <div className="bg-[#EEECEC] rounded-md border border-[#BFBFBF] w-full h-[40px] px-2 leading-[40px] text-sm text-black">
              123
            </div>
          )}
        </Field>
        <Field className="mt-4">
          <div className="flex gap-4 items-center">
            <Field>
              <Label text="Thời gian giới hạn" validate={true} />
              {isLoading ? (
                <Skeleton.Input active style={{ width: "100%" }} />
              ) : (
                <div className="bg-[#EEECEC] rounded-md border border-[#BFBFBF] w-full h-[40px] px-2 leading-[40px] text-sm text-black">
                  123
                </div>
              )}
            </Field>
            <Field>
              <Label text="Đơn vị tính" validate={true} />
              {isLoading ? (
                <Skeleton.Input active style={{ width: "100%" }} />
              ) : (
                <div className="bg-[#EEECEC] rounded-md border border-[#BFBFBF] w-full h-[40px] px-2 leading-[40px] text-sm text-black">
                  123
                </div>
              )}
            </Field>
          </div>
        </Field>
      </div>
      <div className="flex flex-col md:flex-row gap-x-10">
        <Field className="mt-4">
          <Label text="Mã gói dịch vụ " validate={true} />
          {isLoading ? (
            <Skeleton.Input active style={{ width: "100%" }} />
          ) : (
            <div className="bg-[#EEECEC] rounded-md border border-[#BFBFBF] w-full h-[40px] px-2 leading-[40px] text-sm text-black">
              123
            </div>
          )}
        </Field>
        <Field className="mt-4">
          <div className="flex gap-4 items-center">
            <Field>
              <Label text="Ngày bắt đầu" validate={true} />
              {isLoading ? (
                <Skeleton.Input active style={{ width: "100%" }} />
              ) : (
                <div className="bg-[#EEECEC] rounded-md border border-[#BFBFBF] w-full h-[40px] px-2 leading-[40px] text-sm text-black flex justify-between items-center">
                  <span>123</span>
                  <MdOutlineDateRange size={24} color="gray" />
                </div>
              )}
            </Field>
            <Field>
              <Label text="Ngày kết thúc" validate={true} />
              {isLoading ? (
                <Skeleton.Input active style={{ width: "100%" }} />
              ) : (
                <div className="bg-[#EEECEC] rounded-md border border-[#BFBFBF] w-full h-[40px] px-2 leading-[40px] text-sm text-black flex justify-between items-center">
                  <span>123</span>
                  <MdOutlineDateRange size={24} color="gray" />
                </div>
              )}
            </Field>
          </div>
        </Field>
      </div>
      <div className="flex flex-col md:flex-row gap-x-10">
        <Field className="mt-4">
          <Label text="Trạng thái" validate={true} />
          {isLoading ? (
            <Skeleton.Input active style={{ width: "100%" }} />
          ) : (
            <div>{RequestStatusBadge("")}</div>
          )}
        </Field>
        <Field className="mt-4">
          <div className="flex gap-4 items-center">
            <Field>
              <Label text="Thời gian sử dụng" validate={true} />
              {isLoading ? (
                <Skeleton.Input active style={{ width: "100%" }} />
              ) : (
                <div className="bg-[#EEECEC] rounded-md border border-[#BFBFBF] w-full h-[40px] px-2 leading-[40px] text-sm text-black flex justify-between items-center">
                  <span>123</span>
                  <MdOutlineDateRange size={24} color="gray" />
                </div>
              )}
            </Field>
            <Field>
              <Label text="Thời gian còn lại" validate={true} />
              {isLoading ? (
                <Skeleton.Input active style={{ width: "100%" }} />
              ) : (
                <div className="bg-[#EEECEC] rounded-md border border-[#BFBFBF] w-full h-[40px] px-2 leading-[40px] text-sm text-black">
                  <span>123</span>
                </div>
              )}
            </Field>
          </div>
        </Field>
      </div>
      <h1 className="text-lg font-semibold text-primary">
        Thông tin chính sách giới hạn
      </h1>
      <div className="flex flex-col md:flex-row gap-x-10">
        <Field className="mt-4">
          <Label text="SL cửa hàng" validate={true} />
          {isLoading ? (
            <Skeleton.Input active style={{ width: "100%" }} />
          ) : (
            <div className="bg-[#EEECEC] rounded-md border border-[#BFBFBF] w-full h-[40px] px-2 leading-[40px] text-sm text-black">
              123
            </div>
          )}
        </Field>
        <Field className="mt-4"> </Field>
      </div>
      <h1 className="text-lg font-semibold text-primary mt-8">
        Thông tin site - dịch vụ sử dụng
      </h1>
      <div className="flex w-full md:w-[50%] justify-between mb-6">
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
