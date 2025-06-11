import BaseButton from "src/shared/components/Buttons/Button";
import { useNavigate, useParams } from "react-router-dom";
import EmployeeDetail from "./EmployeeDetail";
import ModalConfirm from "src/components/Modal/ModalConfirm";
import DetailHeader from "src/components/Headers/DetailHeader";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  EmployeePayload,
  EmployeePayloadWithOutPassword,
  employeeSchema,
  employeeSchemaWithoutPassword,
} from "src/validate/employeeSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { notification } from "antd";
import useEmployeeStore from "src/store/useEmployeeStore";
import { RiKey2Line } from "react-icons/ri";
import ModalPreviewPassword from "../components/ModalPreviewPassword";
import EmployeeForm from "./EmployeeForm";
import ModalDelete from "src/components/Modal/ModalDelete";
import CustomModal from "src/shared/components/Modals/Modal";
import ModalSwitchEmployee from "../components/ModalSwitchEmployee";

export default function ManageEmployee() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [editEmployee, setEditEmployee] = useState<boolean>(false);
  const [openConfirm, setOpenConfirm] = useState<boolean>(false);
  const listSystemPermission = [
    {
      label: "Supporter",
      value: "sup",
    },
    {
      label: "Super admin",
      value: "admin",
    },
  ];
  const [modalPreviewPassword, setModalPreviewPassword] =
    useState<boolean>(false);
  const [modalUnlockAccount, setModalUnlockAccount] = useState<boolean>(false);
  const [modalSwitchStatus, setModalSwitchStatus] = useState<boolean>(false);
  const [valueSwitchStatus, setValueSwitchStatus] = useState<boolean>(false);
  const [openModalDelete, setOpenModalDelete] = useState<boolean>(false);
  const {
    dataResetPassword,
    isLoadingResetPassword,
    deleteEmployees,
    isLoading,
  } = useEmployeeStore();
  const {
    control,
    reset,
    handleSubmit,
    setValue,
    clearErrors,
    watch,
    formState: { errors },
  } = useForm<EmployeePayload | EmployeePayloadWithOutPassword>({
    resolver: yupResolver(
      id ? employeeSchemaWithoutPassword() : employeeSchema()
    ),
    defaultValues: {
      usersPermission: [
        {
          key: Date.now(),
          usersGroup: "",
        },
      ],
    },
  });
  const usersPermission = watch("usersPermission");

  const onSubmit = async (
    data: EmployeePayload | EmployeePayloadWithOutPassword
  ) => {
    try {
      const dataToSubmit: EmployeePayloadWithOutPassword = {
        ...data,
        usersPermission: data?.usersPermission?.map((item) => ({
          usersGroup: item?.usersGroup,
        })),
      };
      console.log("🇻🇳 👉 dataToSubmit", dataToSubmit);
      // if (id) {
      //   if ("username" in dataToSubmit) {
      //     delete dataToSubmit.username;
      //   }
      //   await updateEmployee(id, dataToSubmit);
      //   await getDetailEmployee(id);
      //   setEditEmployee(false);
      // } else {
      //   await createEmployee(dataToSubmit);
      //   navigate(-1);
      // }
    } catch (error) {
      console.error("Error during employee submit:", error);
    }
  };

  const handleResetPassword = async () => {
    try {
      // await resetPasswordUsers(detailEmployee?.id as string);
      setOpenConfirm(false);
      setModalPreviewPassword(true);
    } catch (error) {}
  };

  const handleCopyPassword = async () => {
    try {
      await navigator?.clipboard?.writeText(dataResetPassword || "");
      notification.success({
        message: "Sao chép mật khẩu thành công",
      });
    } catch (err) {
      notification.error({
        message: "Sao chép mật khẩu thất bại",
      });
    }
  };

  const handleDeleteEmployee = async () => {
    try {
      await deleteEmployees([id as string]);
      navigate(-1);
    } catch (error) {
      setOpenModalDelete(false);
    }
  };

  return (
    <DetailHeader
      title={
        <div className="flex w-full justify-between">
          <h2 className="text-xl font-semibold">{`${
            id ? (editEmployee ? "Chỉnh sửa" : "Chi tiết") : "Tạo mới"
          } tài khoản`}</h2>
        </div>
      }
      rightElement={
        <div className="flex items-center gap-2">
          {!editEmployee && id && (
            <BaseButton variant="outlined" onClick={() => setOpenConfirm(true)}>
              Đặt lại mật khẩu
            </BaseButton>
          )}
          {editEmployee && (
            <BaseButton
              disabled={isLoading}
              onClick={() => {
                setEditEmployee(false);
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
              if (editEmployee || !id) await handleSubmit(onSubmit)();
              else setEditEmployee(true);
            }}
            className="w-[120px]"
          >
            {editEmployee || !id ? "Lưu thông tin" : "Chỉnh sửa"}
          </BaseButton>
        </div>
      }
      handleBack={() => navigate(-1)}
    >
      {editEmployee || !id ? (
        <EmployeeForm
          control={control}
          errors={errors}
          loading={false}
          setValue={setValue}
          usersPermission={usersPermission}
          clearErrors={clearErrors}
          listSystemPermission={listSystemPermission}
          listCustomer={[
            {
              discountPercent: 5,
              id: "db6cff8e-880f-453d-ac1a-01cbdc535c17",
              name: "Đồ ăn",
            },
            {
              discountPercent: 5,
              id: "db6cff8e-880f-453d-ac1a-01cbdc535c11",
              name: "Thức uống",
            },
          ]}
          listUsersPermistion={[{ value: "123123", label: "123123123" }]}
        />
      ) : (
        <EmployeeDetail
          isLoading={false}
          handleUnlockAccount={() => setModalUnlockAccount(true)}
          valueSwitch={valueSwitchStatus}
          handleSwithStaus={() => {
            setModalSwitchStatus(true);
          }}
        />
      )}

      <ModalConfirm
        isOpen={openConfirm}
        onClose={() => setOpenConfirm(false)}
        onConfirm={handleResetPassword}
        loading={isLoadingResetPassword}
        icon={<RiKey2Line />}
      >
        <div className="text-center">
          Bạn chắc chắn muốn tái tạo mật khẩu mới cho người dùng này không?
        </div>
      </ModalConfirm>
      <ModalPreviewPassword
        isOpen={modalPreviewPassword}
        onClose={() => setModalPreviewPassword(false)}
        onConfirm={handleCopyPassword}
      />
      <ModalDelete
        loading={isLoading}
        isOpen={openModalDelete}
        onClose={() => setOpenModalDelete(false)}
        onConfirm={handleDeleteEmployee}
      >
        <div>Bạn muốn xoá nhân viên này?</div>
      </ModalDelete>
      <CustomModal
        isOpen={modalUnlockAccount}
        title="MỞ KHÓA TÀI KHOẢN"
        onClose={() => {
          setModalUnlockAccount(false);
        }}
        icon={false}
        onConfirm={() => setModalUnlockAccount(false)}
        loading={false}
      >
        Bạn có chắc muốn mở khóa tài khoản này không?
      </CustomModal>
      <ModalSwitchEmployee
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
