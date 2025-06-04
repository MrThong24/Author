import { useForm } from "react-hook-form";
import useAuthStore from "src/store/authStore";
import { useEffect, useState } from "react";
import BaseButton from "src/shared/components/Buttons/Button";
import { yupResolver } from "@hookform/resolvers/yup";
import { storeSchema, StorePayload } from "src/validate/userSchema";
import ModalConfirm from "src/components/Modal/ModalConfirm";
import { CiBellOn } from "react-icons/ci";
import InfoStoreForm from "./ProfileStoreForm";
import { RcFile, UploadChangeParam } from "antd/es/upload";
import InfoStoreDetail from "./ProfileStoreDetail";
import useStoreStore from "src/store/useStoreStore";

export default function ManageProfileStore() {
  const { currentUser, isLoading: loadingCurrent } = useAuthStore();
  const { updateStore, isLoading, getBanks } = useStoreStore();
  const [editStore, setEditStore] = useState<boolean>(false);
  const [openConfirmEdit, setOpenConfirmEdit] = useState<boolean>(false);
  const [errorImage, setErrorImage] = useState<boolean>(false);
  const [fileImage, setFileImage] = useState<RcFile | string>();
  const {
    control,
    reset,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<StorePayload>({
    mode: "onChange",
    resolver: yupResolver(storeSchema),
  });
  const onSubmit = async (data: StorePayload) => {
    try {
      await updateStore(
        currentUser?.currentUserStore?.store?.id as string,
        data,
        fileImage as RcFile | string
      );
      setEditStore(false);
      setOpenConfirmEdit(false);
    } catch (error) {}
  };
  const onSubmitValidate = async () => {
    setOpenConfirmEdit(true);
  };
  const handleFileChange = async (info: UploadChangeParam) => {
    setFileImage(info?.file?.originFileObj);
    setErrorImage(false);
  };

  useEffect(() => {
    if (currentUser && editStore) {
      const { store } = currentUser?.currentUserStore || {};
      reset({
        name: store?.name || "",
        phone: store?.phone || "",
        address: store?.address || "",
        email: store?.email || "",
        slogan: store?.slogan || "",
        bankBin: store?.bankBin || "",
        bankNumber: store?.bankNumber || "",
        accountHolder: store?.accountHolder || "",
        primaryColor: store?.primaryColor || "#005FAB",
        isQRIntegrated: store?.isQRIntegrated || false,
        kitchenDisabled: store?.kitchenDisabled || false,
        servingQuantityConfirmationDisabled:
          store?.servingQuantityConfirmationDisabled || false,
        completingQuantityConfirmationDisabled:
          store?.completingQuantityConfirmationDisabled || false,
        qrSoundRegistered: store?.qrSoundRegistered || false,
        bPacTemplatePath: store?.bPacTemplatePath || "",
        taxCode: store?.taxCode || "",
      });
      setFileImage(currentUser?.currentUserStore?.store?.thumbnail);
      setErrorImage(false);
    }
  }, [currentUser, editStore]);
  useEffect(() => {
    getBanks();
  }, []);
  return (
    <div>
      {/* <h3 className='text-lg font-bold'>Thông tin cửa hàng</h3> */}
      <div className="mt-4">
        {editStore ? (
          <InfoStoreForm
            loading={false}
            onFileChange={handleFileChange}
            control={control}
            errors={errors}
            errorImage={errorImage}
            setValue={setValue}
          />
        ) : (
          <InfoStoreDetail />
        )}
        <div className="flex items-center gap-6 justify-center mt-10 mb-16">
          {editStore && (
            <BaseButton
              loading={false}
              onClick={() => {
                setEditStore(false);
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
              if (editStore && !fileImage) {
                setErrorImage(true);
                return;
              }
              if (editStore) await handleSubmit(onSubmitValidate)();
              else setEditStore(true);
            }}
            className="w-[190px] h-[44px]"
          >
            {editStore ? "Lưu thông tin" : "Chỉnh sửa"}
          </BaseButton>
        </div>
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
