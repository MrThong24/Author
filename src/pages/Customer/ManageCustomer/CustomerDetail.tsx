import { ColorPicker, Skeleton } from "antd";
import React from "react";
import { RequestStatusBadge } from "src/components/Badge/RequestStatusBadge";
import Field from "src/shared/components/Core/Field";
import Label from "src/shared/components/Core/Label";
import useCustomerStore from "src/store/useCustomer";

export default function CustomerDetail() {
  const { isLoading } = useCustomerStore();
  return (
    <div>
      <h1 className="text-lg font-semibold text-primary mt-2">
        Thông tin khách hàng
      </h1>
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
          <Label text="Email" validate={false} />
          {isLoading ? (
            <Skeleton.Input active style={{ width: "100%" }} />
          ) : (
            <div className="bg-[#EEECEC] rounded-md border border-[#BFBFBF] w-full h-[40px] px-2 leading-[40px] text-sm text-black">
              123
            </div>
          )}
        </Field>
      </div>
      <div className="flex flex-col md:flex-row gap-x-10">
        <Field className="mt-4">
          <Label text="Mã khách hàng" validate={true} />
          {isLoading ? (
            <Skeleton.Input active style={{ width: "100%" }} />
          ) : (
            <div className="bg-[#EEECEC] rounded-md border border-[#BFBFBF] w-full h-[40px] px-2 leading-[40px] text-sm text-black">
              123
            </div>
          )}
        </Field>
        <Field className="mt-4">
          <div className="flex items-center gap-4">
            <Field>
              <Label text="SĐT" validate={false} />
              {isLoading ? (
                <Skeleton.Input active style={{ width: "100%" }} />
              ) : (
                <div className="bg-[#EEECEC] rounded-md border border-[#BFBFBF] w-full h-[40px] px-2 leading-[40px] text-sm text-black">
                  123
                </div>
              )}
            </Field>
            <Field>
              <Label text="Trạng thái" validate={false} />
              {isLoading ? (
                <Skeleton.Input active style={{ width: "100%" }} />
              ) : (
                <div>{RequestStatusBadge("")}</div>
              )}
            </Field>
          </div>
        </Field>
      </div>
      <h1 className="text-lg font-semibold text-primary mt-2">
        Thông tin hệ thống
      </h1>
      <div className="flex flex-col md:flex-row gap-x-10">
        <Field className="mt-4">
          <Label text="Domain" validate={true} />
          {isLoading ? (
            <Skeleton.Input active style={{ width: "100%" }} />
          ) : (
            <div className="bg-[#EEECEC] rounded-md border border-[#BFBFBF] w-full h-[40px] px-2 leading-[40px] text-sm text-black">
              123
            </div>
          )}
        </Field>
        <Field className="mt-4">
          <Label text="Địa chỉ" validate={false} />
          {isLoading ? (
            <Skeleton.Input active style={{ width: "100%" }} />
          ) : (
            <div className="bg-[#EEECEC] rounded-md border border-[#BFBFBF] w-full h-[40px] px-2 leading-[40px] text-sm text-black">
              123
            </div>
          )}
        </Field>
      </div>
      <div className="flex flex-col md:flex-row gap-x-10">
        <Field className="mt-6">
          <Label text="Màu sắc hệ thống" validate={false} />
          {isLoading ? (
            <Skeleton.Input active style={{ width: "100%" }} />
          ) : (
            <div className="flex items-center gap-2">
              <ColorPicker
                value={"#005FAB"}
                format="hex"
                size="large"
                showText
                open={false}
              />
            </div>
          )}
        </Field>
        <Field className="mt-4">
          <Label text="SĐT liên hệ" validate={false} />
          {isLoading ? (
            <Skeleton.Input active style={{ width: "100%" }} />
          ) : (
            <div className="bg-[#EEECEC] rounded-md border border-[#BFBFBF] w-full h-[40px] px-2 leading-[40px] text-sm text-black">
              123
            </div>
          )}
        </Field>
      </div>
      <div className="flex flex-col md:flex-row gap-x-10">
        <Field className="mt-6">
          <Label text="Logo" validate={false} />
          {isLoading ? (
            <Skeleton.Input active style={{ width: "100%" }} />
          ) : (
            <div className="flex items-center gap-2"></div>
          )}
        </Field>
        <Field className="mt-4">
          <Label text="Tên đơn vị liên hệ" validate={false} />
          {isLoading ? (
            <Skeleton.Input active style={{ width: "100%" }} />
          ) : (
            <div className="bg-[#EEECEC] rounded-md border border-[#BFBFBF] w-full h-[40px] px-2 leading-[40px] text-sm text-black">
              123
            </div>
          )}
        </Field>
      </div>
    </div>
  );
}
