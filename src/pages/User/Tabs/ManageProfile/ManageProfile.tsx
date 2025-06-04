import { useForm } from "react-hook-form";
import useAuthStore from "src/store/authStore";
import { useEffect, useState } from "react";
import BaseButton from "src/shared/components/Buttons/Button";
import { yupResolver } from "@hookform/resolvers/yup";
import { profileSchema, ProfilePayload } from "src/validate/userSchema";
import ModalConfirm from "src/components/Modal/ModalConfirm";
import { CiBellOn } from "react-icons/ci";
import { RcFile, UploadChangeParam } from "antd/es/upload";
import useProfileStore from "src/store/useProfileStore";
import ProfileForm from "./ProfileForm";
import ProfileDetail from "./ProfileDetail";
import { generateImageURL } from "src/shared/utils/utils";

export default function ManageInfoAccount() {
  const { currentUser, isLoading: loadingCurrent } = useAuthStore();
  const { updateProfile, isLoading } = useProfileStore();
  const [editProfile, setEditProfile] = useState<boolean>(false);
  const [openConfirmEdit, setOpenConfirmEdit] = useState<boolean>(false);
  const [errorImage, setErrorImage] = useState<boolean>(false);
  const [fileImage, setFileImage] = useState<RcFile | string>();
  const {
    control,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfilePayload>({
    resolver: yupResolver(profileSchema),
  });

  const onSubmit = async (data: ProfilePayload) => {
    try {
      await updateProfile(data, fileImage as RcFile | string);
      setEditProfile(false);
      setOpenConfirmEdit(false);
    } catch (error) {}
  };

  const onSubmitValidate = () => {
    setOpenConfirmEdit(true);
  };

  const handleFileChange = async (info: UploadChangeParam) => {
    setFileImage(info?.file?.originFileObj);
    setErrorImage(false);
  };

  useEffect(() => {
    if (currentUser) {
      reset({
        name: currentUser?.name,
        phone: currentUser?.phone || "",
        address: currentUser?.address || "",
      });
      setFileImage(currentUser?.avatar);
    }
  }, []);

  return (
    <div>
      {editProfile ? (
        <ProfileForm
          errorImage={errorImage}
          control={control}
          errors={errors}
          onFileChange={handleFileChange}
        />
      ) : (
        <ProfileDetail />
      )}
      <div className="flex items-center gap-6 justify-center mt-10">
        {editProfile && (
          <BaseButton
            loading={false}
            onClick={() => {
              setEditProfile(false);
              reset({
                name: currentUser?.name,
                phone: currentUser?.phone || "",
                address: currentUser?.address || "",
              });
              setFileImage(currentUser?.avatar);
            }}
            color="danger"
            className="w-[190px] h-[44px]"
          >
            Huỷ
          </BaseButton>
        )}
        <BaseButton
          loading={loadingCurrent}
          onClick={async () => {
            if (!editProfile) {
              setEditProfile(true);
            } else await handleSubmit(onSubmitValidate)();
          }}
          className="w-[190px] h-[44px]"
        >
          {editProfile ? "Lưu thông tin" : "Chỉnh sửa"}
        </BaseButton>
      </div>
      <ModalConfirm
        isOpen={openConfirmEdit}
        onClose={() => setOpenConfirmEdit(false)}
        onConfirm={handleSubmit(onSubmit)}
        loading={isLoading}
        icon={<CiBellOn />}
      >
        Bạn muốn lưu các thay đổi?
      </ModalConfirm>
    </div>
  );
}
