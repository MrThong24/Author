import { useForm } from "react-hook-form";
import useAuthStore from "src/store/authStore";
import { useEffect, useState } from "react";
import BaseButton from "src/shared/components/Buttons/Button";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  eInvoiceConfigSchema,
  EInvoiceConfigPayload,
  eInvoiceAuthSchema,
} from "src/validate/userSchema";
import ModalConfirm from "src/components/Modal/ModalConfirm";
import { CiBellOn } from "react-icons/ci";
import ProfileEInvoiceDetail from "./ProfileEInvoiceDetail";
import ProfileEInvoiceForm from "./ProfileEInvoiceForm";
import useStoreStore from "src/store/useStoreStore";
import {
  eInvoiceTypes,
  eInvoiceFormats,
  eInvoiceModes,
} from "src/shared/common/constant";

export default function ManageProfileEInvoice() {
  const { currentUser, isLoading: loadingCurrent } = useAuthStore();
  const {
    isLoading,
    isChecking,
    eInvoiceConfig,
    getEInvoiceConfig,
    getListSymbols,
    listSymbol,
    updateEInvoiceConfig,
    checkEInvoiceConnection,
  } = useStoreStore();
  const [editStore, setEditStore] = useState<boolean>(false);
  const [openConfirmEdit, setOpenConfirmEdit] = useState<boolean>(false);
  const {
    control,
    reset,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EInvoiceConfigPayload>({
    mode: "onChange",
    resolver: yupResolver(
      eInvoiceConfig?.eInvoicePassword
        ? eInvoiceConfigSchema
        : eInvoiceAuthSchema
    ),
  });

  const eInvoiceUrl = watch("eInvoiceUrl");
  const eInvoiceUsername = watch("eInvoiceUsername");
  const eInvoicePassword = watch("eInvoicePassword");
  const eInvoiceType = watch("eInvoiceType");
  const eInvoiceFormat = watch("eInvoiceFormat");
  const eInvoiceMode = watch("eInvoiceMode");
  const eInvoiceSymbol = watch("eInvoiceSymbol");

  const handleCheckConnection = async () => {
    const data = editStore
      ? {
          eInvoiceUrl: eInvoiceUrl || "",
          eInvoiceUsername: eInvoiceUsername || "",
          eInvoicePassword: eInvoicePassword || "",
        }
      : {
          eInvoiceUrl: eInvoiceUrl || eInvoiceConfig?.eInvoiceUrl || "",
          eInvoiceUsername:
            eInvoiceUsername || eInvoiceConfig?.eInvoiceUsername || "",
          eInvoicePassword:
            eInvoicePassword || eInvoiceConfig?.eInvoicePassword || "",
        };
    await checkEInvoiceConnection(data);
  };

  const onSubmit = async (data: EInvoiceConfigPayload) => {
    try {
      await updateEInvoiceConfig(data);
      setEditStore(false);
      setOpenConfirmEdit(false);
    } catch (error) {}
  };
  const onSubmitValidate = async (data: EInvoiceConfigPayload) => {
    const isConnectable = await checkEInvoiceConnection(data, true);
    if (isConnectable) {
      setOpenConfirmEdit(true);
    }
  };

  useEffect(() => {
    if (eInvoiceConfig?.eInvoicePassword && editStore) {
      reset({
        eInvoiceUrl: eInvoiceConfig?.eInvoiceUrl || "",
        eInvoiceUsername: eInvoiceConfig?.eInvoiceUsername || "",
        eInvoicePassword: eInvoiceConfig?.eInvoicePassword || "",
        eInvoiceType:
          eInvoiceConfig?.eInvoiceType || eInvoiceConfig?.eInvoiceSymbol
            ? eInvoiceTypes[0].value
            : "2",
        eInvoiceFormat:
          eInvoiceConfig?.eInvoiceFormat || eInvoiceConfig?.eInvoiceSymbol
            ? eInvoiceFormats[0].value
            : "M",
        eInvoiceMode:
          eInvoiceConfig?.eInvoiceMode || eInvoiceConfig?.eInvoiceSymbol
            ? eInvoiceModes[0].value
            : "C",
        eInvoiceSymbol: eInvoiceConfig?.eInvoiceSymbol || "2C25MPS",
      });
    }
    if (!editStore) {
      reset({
        eInvoiceUrl: eInvoiceConfig?.eInvoiceUrl || "",
        eInvoiceUsername: eInvoiceConfig?.eInvoiceUsername || "",
        eInvoicePassword: eInvoiceConfig?.eInvoicePassword || "",
      });
    }
  }, [eInvoiceConfig, editStore]);

  useEffect(() => {
    getEInvoiceConfig();
  }, []);

  useEffect(() => {
    if (eInvoiceConfig?.eInvoicePassword) getListSymbols();
  }, [eInvoiceConfig]);

  useEffect(() => {
    if (eInvoiceFormat && eInvoiceMode && eInvoiceType && listSymbol) {
      const symbol = listSymbol.find(
        (item) =>
          eInvoiceType === item.lhdon.toString() &&
          eInvoiceFormat === item.khdon &&
          eInvoiceMode === item.hthuc
      );
      if (symbol) setValue("eInvoiceSymbol", symbol?.khhdon || "");
      else setValue("eInvoiceSymbol", "");
    } else setValue("eInvoiceSymbol", "");
  }, [eInvoiceFormat, eInvoiceMode, eInvoiceType, listSymbol, editStore]);

  useEffect(() => {
    if (eInvoiceSymbol) {
      const match = eInvoiceSymbol.match(/^(\d)([A-Z])[0-9]*([A-Z])/);
      if (match) {
        const [_, eInvoiceType, eInvoiceMode, eInvoiceFormat] = match;
        setValue("eInvoiceType", eInvoiceType);
        setValue("eInvoiceMode", eInvoiceMode);
        setValue("eInvoiceFormat", eInvoiceFormat);
      }
    }
  }, [eInvoiceSymbol]);

  return (
    <div>
      {/* <h3 className='text-lg font-bold'>Thông tin cửa hàng</h3> */}
      <div className="mt-4">
        {editStore ? (
          <ProfileEInvoiceForm
            loading={false}
            control={control}
            errors={errors}
            setValue={setValue}
            eInvoiceFormat={eInvoiceFormat}
            listSymbol={listSymbol}
            isConfigurable={!!eInvoiceConfig?.eInvoicePassword}
            isChecking={isChecking}
            handleCheckConnection={handleCheckConnection}
          />
        ) : (
          <ProfileEInvoiceDetail
            isChecking={isChecking}
            eInvoiceConfig={eInvoiceConfig as EInvoiceConfigPayload}
            handleCheckConnection={handleCheckConnection}
          />
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
            loading={loadingCurrent || isChecking}
            onClick={async () => {
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
