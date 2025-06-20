import { Skeleton } from "antd";
import React from "react";
import Field from "src/shared/components/Core/Field";
import Label from "src/shared/components/Core/Label";

export default function CategoryDetail() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-primary mb-2">Thông tin API</h2>
      <div className="flex flex-col md:flex-row gap-x-10">
        <Field>
          <Label text="Url" className="text-sm" validate={true} />
          {false ? (
            <Skeleton.Input active style={{ width: "100%" }} />
          ) : (
            <div className="bg-[#EEECEC] rounded-md border border-[#BFBFBF] w-full h-[40px] px-2 leading-[40px] text-sm text-black">
              123
            </div>
          )}
        </Field>
        <Field>
          <Label text="Endpoint" className="text-sm" validate={true} />
          {false ? (
            <Skeleton.Input active style={{ width: "100%" }} />
          ) : (
            <div className="bg-[#EEECEC] rounded-md border border-[#BFBFBF] w-full h-[40px] px-2 leading-[40px] text-sm text-black">
              123
            </div>
          )}
        </Field>
      </div>
      <div className="mt-4 md:mt-10">
        <Label text="Mô tả" validate={false} />
        {false ? (
          <Skeleton.Input active style={{ width: "100%" }} />
        ) : (
          <div className="bg-[#EEECEC] rounded-md border border-[#BFBFBF] w-full px-2 leading-[40px] text-sm text-black break-words">
            123
          </div>
        )}
      </div>
    </div>
  );
}
