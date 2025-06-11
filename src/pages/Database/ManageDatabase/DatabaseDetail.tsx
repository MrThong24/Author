import { Skeleton, Table } from "antd";
import React from "react";
import NoData from "src/components/NoData/NoData";
import BaseButton from "src/shared/components/Buttons/Button";
import Field from "src/shared/components/Core/Field";
import Label from "src/shared/components/Core/Label";
import useDatabaseStore from "src/store/useDatabaseStore";

export default function DatabaseDetail() {
  const { isLoading } = useDatabaseStore();
  const columns = [
    {
      title: "STT",
      width: 60,
      align: "center" as "left" | "right" | "center",
      render: (_text: any, _record: any, index: number) => index + 1,
    },
    { width: "40%", title: "Tên schema", dataIndex: "name" },
    { title: "Dịch vụ", dataIndex: "service" },
  ];
  return (
    <div>
      <div className="flex flex-col md:flex-row gap-x-10">
        <Field className="mt-4">
          <Label text="Username" validate={true} />
          {isLoading ? (
            <Skeleton.Input active style={{ width: "100%" }} />
          ) : (
            <div className="bg-[#EEECEC] rounded-md border border-[#BFBFBF] w-full h-[40px] px-2 leading-[40px] text-sm text-black">
              123
            </div>
          )}
        </Field>
        <Field className="mt-4">
          <div className="flex gap-4">
            <Field>
              <Label text="Host" validate={true} />
              {isLoading ? (
                <Skeleton.Input active style={{ width: "100%" }} />
              ) : (
                <div className="bg-[#EEECEC] rounded-md border border-[#BFBFBF] w-full h-[40px] px-2 leading-[40px] text-sm text-black">
                  123
                </div>
              )}
            </Field>
            <Field>
              <Label text="Port" validate={true} />
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
          <Label text="Password" validate={true} />
          {isLoading ? (
            <Skeleton.Input active style={{ width: "100%" }} />
          ) : (
            <div className="bg-[#EEECEC] rounded-md border border-[#BFBFBF] w-full h-[40px] px-2 leading-[40px] text-sm text-black">
              123
            </div>
          )}
        </Field>
        <Field className="mt-4">
          <Label text="Kiểm tra kết nối" validate={true} />
          {isLoading ? (
            <Skeleton.Input active style={{ width: "100%" }} />
          ) : (
            <div>
              <BaseButton disabled={false} onClick={() => {}}>
                Kiểm tra kết nối
              </BaseButton>
            </div>
          )}
        </Field>
      </div>
      <div className="flex w-full md:w-[50%] mt-4 justify-between">
        <h1 className="text-lg font-semibold text-primary">Danh sách schema</h1>
      </div>
      <div className="flex w-full md:w-[50%] my-8 mt-4 justify-between">
        <Table
          scroll={{ x: "max-content" }}
          dataSource={[]}
          className="w-full"
          columns={columns}
          pagination={false}
          size="small"
          locale={{ emptyText: <NoData /> }}
        />
      </div>
    </div>
  );
}
