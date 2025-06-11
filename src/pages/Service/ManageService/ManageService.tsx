import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import DetailHeader from "src/components/Headers/DetailHeader";
import DatabaseForm from "src/pages/Database/ManageDatabase/DatabaseForm";
import BaseButton from "src/shared/components/Buttons/Button";
import useDatabaseStore from "src/store/useDatabaseStore";
import { ServicePayload, serviceSchema } from "src/validate/serviceSchema";
import ServiceForm from "./ServiceForm";
import ServiceDetail from "./ServiceDetail";
import ModalConfirm from "src/components/Modal/ModalConfirm";
import { LuStore } from "react-icons/lu";
import ModalSwitchService from "../components/ModalSwitchService";

export default function ManageService() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [editService, setEditService] = useState<boolean>(false);
  const [modalSwitchStatus, setModalSwitchStatus] = useState<boolean>(false);
  const [valueSwitchStatus, setValueSwitchStatus] = useState<boolean>(false);
  const { isLoading } = useDatabaseStore();
  const {
    control,
    reset,
    handleSubmit,
    clearErrors,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ServicePayload>({
    resolver: yupResolver(serviceSchema),
    defaultValues: {
      subsystem: [
        {
          key: Date.now(),
          name: "",
        },
      ],
    },
  });
  const subsystem = watch("subsystem");
  const onSubmit = async () => {};
  return (
    <DetailHeader
      title={
        <div className="flex w-full justify-between">
          <h2 className="text-xl font-semibold">{`${id ? (editService ? "Chỉnh sửa" : "Chi tiết") : "Tạo mới"} gói dịch vụ`}</h2>
        </div>
      }
      rightElement={
        <div className="flex items-center gap-2">
          {editService && (
            <BaseButton
              disabled={false}
              onClick={() => {
                setEditService(false);
              }}
              color="danger"
              className="w-[120px]"
            >
              Huỷ
            </BaseButton>
          )}
          <BaseButton loading={isLoading} onClick={() => {}}>
            Xem lịch sử điều chỉnh
          </BaseButton>
          <BaseButton
            loading={isLoading}
            onClick={() => {
              setModalSwitchStatus(true);
            }}
          >
            Ngưng sử dụng
          </BaseButton>
          <BaseButton
            loading={isLoading}
            onClick={async () => {
              if (editService || !id) await handleSubmit(onSubmit)();
              else setEditService(true);
            }}
          >
            {editService || !id ? "Lưu thông tin" : "Chỉnh sửa"}
          </BaseButton>
        </div>
      }
      handleBack={() => navigate("/service")}
    >
      {editService || !id ? (
        <ServiceForm
          control={control}
          clearErrors={clearErrors}
          setValue={setValue}
          errors={errors}
          loading={isLoading}
          subsystem={subsystem}
          listSubSystem={[{ value: "123123", lable: "123123123" }]}
        />
      ) : (
        <ServiceDetail />
      )}

      <ModalSwitchService
        valueSwitchStatus={valueSwitchStatus}
        isOpen={modalSwitchStatus}
        onClose={() => {
          setModalSwitchStatus(false);
        }}
        onConfirm={() => {
          setValueSwitchStatus((pre) => !pre);
          setModalSwitchStatus(false);
        }}
      />
    </DetailHeader>
  );
}
