import React, { useState } from "react";
import CategoryForm from "./CategoryForm";
import { useForm } from "react-hook-form";
import { CategoryPayload, categorySchema } from "src/validate/categorySchema";
import { yupResolver } from "@hookform/resolvers/yup";
import DetailHeader from "src/components/Headers/DetailHeader";
import { useNavigate, useParams } from "react-router-dom";
import BaseButton from "src/shared/components/Buttons/Button";
import useCategoryStore from "src/store/useCategoryStore";
import CategoryDetail from "./CategoryDetail";
import { Table } from "antd";
import NoData from "src/components/NoData/NoData";

export default function ManageCategory() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [editCategory, setEditCategory] = useState<boolean>(false);
  const { isLoading } = useCategoryStore();
  const {
    control,
    reset,
    handleSubmit,
    clearErrors,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CategoryPayload>({
    resolver: yupResolver(categorySchema),
  });
  const onSubmit = async () => {};
  const columns = [
    {
      title: "STT",
      align: "center" as "left" | "right" | "center",
      render: (_text: any, _record: any, index: number) => index + 1,
    },
    {
      width: "46%",
      title: "Tên dịch vụ kết nối",
      render: (_record: any) => (
        <div className="bg-[#EEECEC] rounded-md border border-[#BFBFBF] w-full h-[40px] px-2 leading-[40px] text-sm text-black">
          {_record.name}
        </div>
      ),
    },
    {
      width: "46%",
      title: "Endpoint",
      render: (_record: any) => (
        <div className="bg-[#EEECEC] rounded-md border border-[#BFBFBF] w-full h-[40px] px-2 leading-[40px] text-sm text-black">
          {_record.endpoint}
        </div>
      ),
    },
  ];
  return (
    <DetailHeader
      title={
        <div className="flex w-full justify-between">
          <h2 className="text-xl font-semibold">{`${
            id ? (editCategory ? "Chỉnh sửa" : "Chi tiết") : "Tạo mới"
          } danh mục/tính năng`}</h2>
        </div>
      }
      rightElement={
        <div className="flex items-center gap-2">
          {editCategory && (
            <BaseButton
              disabled={false}
              onClick={() => {
                setEditCategory(false);
              }}
              color="danger"
              className="w-[120px]"
            >
              Huỷ
            </BaseButton>
          )}
          <BaseButton
            loading={isLoading}
            onClick={async () => {
              if (editCategory || !id) await handleSubmit(onSubmit)();
              else setEditCategory(true);
            }}
            className="w-[120px]"
          >
            {editCategory || !id ? "Lưu thông tin" : "Chỉnh sửa"}
          </BaseButton>
        </div>
      }
      handleBack={() => navigate(-1)}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="rounded flex items-center gap-2">
          <h2 className="font-semibold">Tên danh mục/ tính năng</h2>
          <h2>Thanh toán đơn hàng</h2>
        </div>
        <div className="rounded flex items-center gap-2">
          <h2 className="font-semibold">Mã</h2>
          <h2>Db_payment</h2>
        </div>
        <div className="rounded flex items-center gap-2">
          <h2 className="font-semibold">Loại</h2>
          <h2>Tính năng </h2>
        </div>
      </div>
      {editCategory || !id ? (
        <CategoryForm
          control={control}
          errors={errors}
          clearErrors={clearErrors}
          setValue={setValue}
          loading={false}
        />
      ) : (
        <CategoryDetail />
      )}

      <div className="flex w-full md:w-[50%] mt-10 justify-between">
        <h1 className="text-lg font-semibold text-primary">
          Danh sách dịch vụ kết nối
        </h1>
      </div>
      <div className="flex w-full md:w-[50%] mt-4 mb-10 justify-between">
        <Table
          className="w-full"
          scroll={{ x: "max-content" }}
          dataSource={[
            {
              key: "1",
              name: "Momo",
              endpoint: "/momo",
            },
            {
              key: "1",
              name: "VnPay",
              endpoint: "/vnPay",
            },
          ]}
          columns={columns}
          pagination={false}
          size="small"
          locale={{ emptyText: <NoData /> }}
        />
      </div>
    </DetailHeader>
  );
}
