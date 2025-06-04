import { useEffect, useState } from 'react';
import { ColorPicker, Switch } from 'antd';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { configScheme, StoreConfig } from 'src/validate/userSchema';
import { RiResetLeftLine } from 'react-icons/ri';
import Field from 'src/shared/components/Core/Field';
import Label from 'src/shared/components/Core/Label';
import BaseButton from 'src/shared/components/Buttons/Button';
import useAuthStore from 'src/store/authStore';
import useStoreStore from 'src/store/useStoreStore';
import ModalConfirm from 'src/cms/components/Modal/ModalConfirm';
import { FaCheck } from 'react-icons/fa6';

export default function Configuration() {
  const { currentUser, isLoading } = useAuthStore();
  const [confirmModal, setConfirmModal] = useState(false);
  const { updateConfigStore } = useStoreStore();
  const [kitchenOpen, setKitchenOpen] = useState(true);
  const {
    control,
    reset,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<StoreConfig>({
    defaultValues: { primaryColor: '#005FAB' },
    resolver: yupResolver(configScheme)
  });
  const onChange = (checked: boolean) => {
    setKitchenOpen(checked);
  };
  const onSubmit = async (data: StoreConfig) => {
    try {
      await updateConfigStore(currentUser?.currentUserStore?.storeId as string, {
        ...data,
        kitchenDisabled: !kitchenOpen
      });
      setConfirmModal(false);
    } catch (error) {
      setConfirmModal(false);
    }
  };
  useEffect(() => {
    setKitchenOpen(!currentUser?.currentUserStore?.store?.kitchenDisabled);
    reset({
      primaryColor: currentUser?.currentUserStore?.store?.primaryColor
    });
  }, [currentUser]);

  return (
    <div>
      <h3 className='text-lg font-bold'>Cấu hình</h3>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 lg:gap-12 '>
        <Field className='mt-4'>
          <Label text='Màu sắc hệ thống' validate={true} />
          <div className='flex items-center gap-4'>
            <Controller
              name='primaryColor'
              control={control}
              render={({ field, fieldState }) => (
                <ColorPicker
                  {...field}
                  {...fieldState}
                  defaultValue='#005FAB'
                  format={'hex'}
                  size='large'
                  showText
                  onChange={(value) => {
                    field.onChange(value?.toHexString());
                  }}
                  className='w-full'
                />
              )}
            />
            <BaseButton
              variant='filled'
              className='h-full py-2 px-3'
              override='#d3e4eb'
              textColor='#005FAB'
              onClick={() => {
                setValue('primaryColor', '#005FAB');
              }}
            >
              <RiResetLeftLine className='text-xl' />
            </BaseButton>
          </div>
        </Field>
        <Field className='mt-4 '>
          <Label text='Chế độ bếp' validate={false} />
          <div className='flex items-center justify-between bg-white rounded-lg border-[1px] border-gray-300 px-2 h-[40px]'>
            <span>{kitchenOpen ? 'Bật' : 'Tắt'}</span>
            <Switch value={kitchenOpen} onChange={onChange} />
          </div>
        </Field>
      </div>
      <div className='text-center mt-8'>
        <BaseButton onClick={() => setConfirmModal(true)} loading={isLoading} className='w-[120px]'>
          Lưu thông tin
        </BaseButton>
      </div>
      <ModalConfirm
        icon={<FaCheck />}
        isOpen={confirmModal}
        onClose={() => setConfirmModal(false)}
        onConfirm={async () => {
          handleSubmit(onSubmit)();
        }}
      >
        <span className='text-base font-normal text-gray-600'>Bạn có muốn lưu các thay đổi?</span>
      </ModalConfirm>
    </div>
  );
}
