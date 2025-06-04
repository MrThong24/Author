import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import BaseButton from 'src/shared/components/Buttons/Button';
import { StorePayload, storeSchema } from 'src/validate/userSchema';
import ConfigGeneralDetail from './ConfigSectionDetail';
import useAuthStore from 'src/store/authStore';
import ConfigGeneralForm from './ConfigSectionForm';
import useStoreStore from 'src/store/useStoreStore';
import ModalConfirm from 'src/cms/components/Modal/ModalConfirm';

import { CiBellOn } from 'react-icons/ci';
import { RcFile } from 'antd/es/upload';

interface ConfigSectionProps {
  type: 'general' | 'payment' | string;
}

export default function ConfigSection({ type }: ConfigSectionProps) {
  const { currentUser, isLoading } = useAuthStore();
  const [editConfigGeneral, setEditConfigGeneral] = useState<boolean>(false);
  const [openConfirmEdit, setOpenConfirmEdit] = useState<boolean>(false);
  const { updateStore, getBanks, getlistPosStore, loadingPosStore } = useStoreStore();

  const {
    control,
    reset,
    setValue,
    handleSubmit,
    setError,
    getValues,
    clearErrors,
    formState: { errors }
  } = useForm<StorePayload>({
    defaultValues: { primaryColor: '#005FAB' },
    resolver: yupResolver(storeSchema)
  });

  const onSubmit = async (data: StorePayload) => {
    try {
      await updateStore(
        currentUser?.currentUserStore?.store?.id as string,
        type === 'payment'
          ? {
              isQRIntegrated: data?.isQRIntegrated || false,
              qrSoundRegistered: data?.qrSoundRegistered || false,
              bankNumber: data?.bankNumber || '',
              accountHolder: data?.accountHolder || '',
              bankBin: data?.bankBin || ''
            }
          : {
              slogan: data?.slogan || '',
              primaryColor: data?.primaryColor || '#005FAB',
              bPacTemplatePath: data?.bPacTemplatePath || '',
              qrSoundRegistered: data?.qrSoundRegistered || false,
              posStoreId: data?.posStoreId || ''
            },
        currentUser?.currentUserStore?.store?.thumbnail as RcFile | string,
        true
      );
      setEditConfigGeneral(false);
      setOpenConfirmEdit(false);
    } catch (error) {}
  };

  const onSubmitValidate = async () => {
    setOpenConfirmEdit(true);
  };

  useEffect(() => {
    if (currentUser && editConfigGeneral) {
      const { store } = currentUser?.currentUserStore || {};
      reset({
        name: store?.name || '',
        phone: store?.phone || '',
        address: store?.address || '',
        email: store?.email || '',
        slogan: store?.slogan || '',
        bankBin: store?.bankBin || '',
        bankNumber: store?.bankNumber || '',
        accountHolder: store?.accountHolder || '',
        primaryColor: store?.primaryColor || '#005FAB',
        isQRIntegrated: store?.isQRIntegrated || false,
        kitchenDisabled: store?.kitchenDisabled || false,
        servingQuantityConfirmationDisabled: store?.servingQuantityConfirmationDisabled || false,
        completingQuantityConfirmationDisabled: store?.completingQuantityConfirmationDisabled || false,
        qrSoundRegistered: store?.qrSoundRegistered || false,
        bPacTemplatePath: store?.bPacTemplatePath || '',
        taxCode: store?.taxCode || '',
        posStoreId: store?.posStoreId
      });
    }
  }, [currentUser, editConfigGeneral]);
  useEffect(() => {
    getBanks();
    if (currentUser?.currentUserStore?.store?.company?.posIntegration) {
      getlistPosStore();
    }
  }, []);

  useEffect(() => {
    setEditConfigGeneral(false);
  }, [type]);

  return (
    <div>
      {editConfigGeneral ? (
        <ConfigGeneralForm
          type={type}
          loading={false}
          control={control}
          errors={errors}
          setValue={setValue}
          clearErrors={clearErrors}
        />
      ) : (
        <ConfigGeneralDetail type={type} />
      )}
      <div className='flex items-center gap-6 justify-center mt-10'>
        {editConfigGeneral && (
          <BaseButton
            loading={false}
            onClick={() => {
              setEditConfigGeneral(false);
            }}
            color='danger'
            className='w-[190px] h-[44px]'
          >
            Huỷ
          </BaseButton>
        )}
        <BaseButton
          loading={isLoading || loadingPosStore}
          onClick={async () => {
            if (editConfigGeneral) {
              const values = getValues();
              if (type !== 'payment' && !values.posStoreId) {
                setError('posStoreId', { type: 'required', message: 'Vui lòng nhập kết nối điểm bán MobiFone 1POS' });
                return;
              }
              await handleSubmit(onSubmitValidate)();
            } else {
              setEditConfigGeneral(true);
            }
          }}
          className='w-[190px] h-[44px]'
        >
          {editConfigGeneral ? 'Lưu thông tin' : 'Chỉnh sửa'}
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
