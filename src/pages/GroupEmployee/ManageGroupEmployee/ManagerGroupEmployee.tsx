import { useState } from "react";
import GroupEmployeeForm from "./GroupEmployeeForm";
import DetailHeader from "src/components/Headers/DetailHeader";
import { useNavigate, useParams } from "react-router-dom";
import BaseButton from "src/shared/components/Buttons/Button";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import useGroupEmployeeStore from "src/store/useGroupEmployeeStore";
import {
  GroupEmployeePayload,
  groupEmployeeSchema,
} from "src/validate/groupEmployeeSchema";
import GroupEmployeeDetail from "./GroupEmployeeDetail";

export default function ManagerGroupEmployee() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [editGroupEmployee, setEditGroupEmployee] = useState<boolean>(false);
  const [openConfirm, setOpenConfirm] = useState<boolean>(false);
  const [openModalDelete, setOpenModalDelete] = useState<boolean>(false);
  const { isLoading } = useGroupEmployeeStore();
  const {
    control,
    reset,
    handleSubmit,
    setValue,
    clearErrors,
    watch,
    formState: { errors },
  } = useForm<GroupEmployeePayload>({
    resolver: yupResolver(groupEmployeeSchema()),
    defaultValues: {},
  });
  const usersPermission = watch("usersPermission") || [];
  const onSubmit = async (data: GroupEmployeePayload) => {
    console.log("🇻🇳 👉 data", data);
  };
  return (
    <DetailHeader
      title={
        <div className="flex w-full justify-between">
          <h2 className="text-xl font-semibold">{`${id ? (editGroupEmployee ? "Chỉnh sửa" : "Chi tiết") : "Tạo mới"} nhóm người dùng`}</h2>
        </div>
      }
      rightElement={
        <div className="flex items-center gap-2">
          {(editGroupEmployee || !id) && (
            <BaseButton
              disabled={isLoading}
              onClick={() => {
                setEditGroupEmployee(false);
              }}
              color="danger"
              className="w-[120px]"
            >
              {editGroupEmployee || !id ? "Huỷ" : "Xoá"}
            </BaseButton>
          )}
          <BaseButton
            loading={isLoading}
            onClick={async () => {
              if (editGroupEmployee || !id) await handleSubmit(onSubmit)();
              else setEditGroupEmployee(true);
            }}
            className="w-[120px]"
          >
            {editGroupEmployee || !id ? "Lưu thông tin" : "Chỉnh sửa"}
          </BaseButton>
        </div>
      }
      handleBack={() => navigate(-1)}
    >
      {editGroupEmployee || !id ? (
        <GroupEmployeeForm
          control={control}
          errors={errors}
          loading={isLoading}
          setValue={setValue}
          clearErrors={clearErrors}
          usersPermission={usersPermission}
        />
      ) : (
        <GroupEmployeeDetail />
      )}
    </DetailHeader>
  );
}
