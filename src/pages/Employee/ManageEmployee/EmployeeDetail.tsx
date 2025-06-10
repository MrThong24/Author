import { Skeleton, Switch, Table } from "antd";
import BaseCheckbox from "src/shared/components/Core/Checkbox";
import Field from "src/shared/components/Core/Field";
import Label from "src/shared/components/Core/Label";

export default function EmployeeDetail({ isLoading }: { isLoading: boolean }) {
  const columns = [
    {
      title: "STT",
      width: 60,
      render: (_text: any, _record: any, index: number) => index + 1,
    },
    { title: "Nhóm người dùng", dataIndex: "store", key: "store" },
  ];
  const handleSwith = async (value: boolean) => {
    console.log("🇻🇳 👉 value", value);
    try {
    } catch (error) {}
  };
  return (
    <div>
      <h1 className="text-lg font-semibold text-primary">
        Thông tin tài khoản
      </h1>
      <div className="flex flex-col md:flex-row gap-x-10">
        <Field className="mt-4">
          <Label text="Tên đăng nhập" validate={true} />
          {isLoading ? (
            <Skeleton.Input active style={{ width: "100%" }} />
          ) : (
            <div className="bg-[#EEECEC] rounded w-full h-[44px] px-3 py-3 text-sm text-black">
              123
            </div>
          )}
        </Field>
        <Field className="mt-4">
          <Label text="Tên người dùng" validate={true} />
          {isLoading ? (
            <Skeleton.Input active style={{ width: "100%" }} />
          ) : (
            <div className="bg-[#EEECEC] rounded w-full h-[44px] px-3 py-3 text-sm text-black">
              123
            </div>
          )}
        </Field>
      </div>
      <div className="flex flex-col md:flex-row gap-x-10">
        <Field className="mt-4">
          <Label text="Email" validate={true} />
          {isLoading ? (
            <Skeleton.Input active style={{ width: "100%" }} />
          ) : (
            <div className="bg-[#EEECEC] rounded w-full h-[44px] px-3 py-3 text-sm text-black">
              123
            </div>
          )}
        </Field>
        <Field className="mt-4">
          <Label text="Thuộc khách hàng" validate={true} />
          {isLoading ? (
            <Skeleton.Input active style={{ width: "100%" }} />
          ) : (
            <div className="bg-[#EEECEC] rounded w-full h-[44px] px-3 py-3 text-sm text-black">
              123
            </div>
          )}
        </Field>
      </div>
      <div className="flex flex-col md:flex-row gap-x-10">
        <Field className="mt-4">
          <Label text="Số điện thoại" validate={false} />
          {isLoading ? (
            <Skeleton.Input active style={{ width: "100%" }} />
          ) : (
            <div className="bg-[#EEECEC] rounded w-full h-[44px] px-3 py-3 text-sm text-black">
              123
            </div>
          )}
        </Field>
        <Field className="mt-4">
          <Label text="Quản trị hệ thống" validate={false} />
          {isLoading ? (
            <Skeleton.Input active style={{ width: "100%" }} />
          ) : (
            <div className="bg-[#EEECEC] rounded w-full h-[44px] px-3 py-3 text-sm text-black">
              123
            </div>
          )}
        </Field>
      </div>
      <div className="flex flex-col md:flex-row gap-x-10 mt-4">
        <Label text="Trạng thái TK" />
        <Switch
          onChange={(checked) => {
            handleSwith(checked);
          }}
          className="w-[40px]"
        />
      </div>
      <div className="flex w-full md:w-[50%] mt-8 justify-between">
        <h1 className="text-lg font-semibold text-primary">
          Danh sách phân quyền dịch vụ truy cập
        </h1>
      </div>
      <div className="flex w-full md:w-[50%] my-10 justify-between">
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
