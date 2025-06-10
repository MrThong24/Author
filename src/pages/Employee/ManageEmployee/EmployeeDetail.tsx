import { Skeleton, Switch, Table } from "antd";
import BaseButton from "src/shared/components/Buttons/Button";
import Field from "src/shared/components/Core/Field";
import Label from "src/shared/components/Core/Label";

export default function EmployeeDetail({
  isLoading,
  handleUnlockAccount,
  handleSwithStaus,
  valueSwitch,
}: {
  isLoading: boolean;
  valueSwitch: boolean;
  handleUnlockAccount: () => void;
  handleSwithStaus: (value: boolean) => void;
}) {
  const columns = [
    {
      title: "STT",
      width: 60,
      render: (_text: any, _record: any, index: number) => index + 1,
    },
    { title: "Nhóm người dùng", dataIndex: "store", key: "store" },
  ];
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
            <div className="bg-[#EEECEC] rounded-md border border-[#BFBFBF] w-full h-[40px] px-2 leading-[40px] text-sm text-black">
              123
            </div>
          )}
        </Field>
        <Field className="mt-4">
          <Label text="Tên người dùng" validate={true} />
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
          <Label text="Email" validate={true} />
          {isLoading ? (
            <Skeleton.Input active style={{ width: "100%" }} />
          ) : (
            <div className="bg-[#EEECEC] rounded-md border border-[#BFBFBF] w-full h-[40px] px-2 leading-[40px] text-sm text-black">
              123
            </div>
          )}
        </Field>
        <Field className="mt-4">
          <Label text="Thuộc khách hàng" validate={true} />
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
          <Label text="Số điện thoại" validate={false} />
          {isLoading ? (
            <Skeleton.Input active style={{ width: "100%" }} />
          ) : (
            <div className="bg-[#EEECEC] rounded-md border border-[#BFBFBF] w-full h-[40px] px-2 leading-[40px] text-sm text-black">
              123
            </div>
          )}
        </Field>
        <Field className="mt-4">
          <Label text="Quản trị hệ thống" validate={false} />
          {isLoading ? (
            <Skeleton.Input active style={{ width: "100%" }} />
          ) : (
            <div className="bg-[#EEECEC] rounded-md border border-[#BFBFBF] w-full h-[40px] px-2 leading-[40px] text-sm text-black">
              123
            </div>
          )}
        </Field>
      </div>
      <div className="flex flex-row gap-x-10">
        <Field className="mt-4">
          <Label text="Trạng thái TK" />
          <Switch
            value={valueSwitch}
            onChange={(checked) => {
              handleSwithStaus(checked);
            }}
            className="w-[40px]"
          />
        </Field>
        <Field className="mt-4">
          <Label text="Mở khoá" validate={false} />
          {isLoading ? (
            <Skeleton.Input active style={{ width: "100%" }} />
          ) : (
            <div>
              <BaseButton onClick={handleUnlockAccount} loading={isLoading}>
                Mở khoá tài khoản
              </BaseButton>
            </div>
          )}
        </Field>
      </div>
      <div className="flex w-full md:w-[50%] mt-10 justify-between">
        <h1 className="text-lg font-semibold text-primary">
          Danh sách phân quyền dịch vụ truy cập
        </h1>
      </div>
      <div className="flex w-full md:w-[50%] mt-4 mb-10 justify-between">
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
