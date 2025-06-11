import { yupResolver } from "@hookform/resolvers/yup";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import DetailHeader from "src/components/Headers/DetailHeader";
import BaseButton from "src/shared/components/Buttons/Button";
import useDatabaseStore from "src/store/useDatabaseStore";
import { DatabasePayload, databaseSchema } from "src/validate/databaseSchema";
import DatabaseForm from "./DatabaseForm";
import DatabaseDetail from "./DatabaseDetail";

export default function ManageDatabase() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [editDatabase, setEditDatabase] = useState<boolean>(false);
  const { isLoading } = useDatabaseStore();
  const {
    control,
    reset,
    handleSubmit,
    clearErrors,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DatabasePayload>({
    resolver: yupResolver(databaseSchema),
    defaultValues: {
      schema: [
        {
          key: Date.now(),
          name: "",
          service: "",
        },
      ],
    },
  });
  const schema = watch("schema");
  const onSubmit = async (data: DatabasePayload) => {
    console.log("🇻🇳 👉 data", data);
  };
  return (
    <DetailHeader
      title={
        <div className="flex w-full justify-between">
          <h2 className="text-xl font-semibold">{`${
            id ? (editDatabase ? "Chỉnh sửa" : "Chi tiết") : "Tạo mới"
          } cơ sỡ dữ liệu`}</h2>
        </div>
      }
      rightElement={
        <div className="flex items-center gap-2">
          {editDatabase && (
            <BaseButton
              disabled={false}
              onClick={() => {
                setEditDatabase(false);
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
              if (editDatabase || !id) await handleSubmit(onSubmit)();
              else setEditDatabase(true);
            }}
            className="w-[120px]"
          >
            {editDatabase || !id ? "Lưu thông tin" : "Chỉnh sửa"}
          </BaseButton>
        </div>
      }
      handleBack={() => navigate("/database")}
    >
      {editDatabase || !id ? (
        <DatabaseForm
          control={control}
          clearErrors={clearErrors}
          setValue={setValue}
          errors={errors}
          loading={isLoading}
          schema={schema}
          listSchema={[
            { label: "label1", value: "value1" },
            { label: "label2", value: "value2" },
          ]}
        />
      ) : (
        <DatabaseDetail />
      )}
    </DetailHeader>
  );
}
