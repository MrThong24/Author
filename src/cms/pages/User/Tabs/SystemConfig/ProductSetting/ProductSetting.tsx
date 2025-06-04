import { yupResolver } from '@hookform/resolvers/yup';
import { Switch, TableColumnsType } from 'antd';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import NoData from 'src/cms/components/NoData/NoData';
import DataTable from 'src/cms/components/Table/DataTable';
import BaseButton from 'src/shared/components/Buttons/Button';
import Field from 'src/shared/components/Core/Field';
import Label from 'src/shared/components/Core/Label';
import FormInput from 'src/shared/components/Form/FormInput';
import CustomModal from 'src/shared/components/Modals/Modal';
import useAuthStore from 'src/store/authStore';
import useStoreStore from 'src/store/useStoreStore';
import { ProductSettingPayload, StorePayload, productSettingSchema, storeSchema } from 'src/validate/userSchema';
import { EditOutlined } from '@ant-design/icons';
import { useTableConfig } from 'src/hooks/useTable';
import { FaRegTrashAlt } from 'react-icons/fa';
import ModalDelete from 'src/cms/components/Modal/ModalDelete';
import { ProductSettings } from 'src/types/store.type';
import { RcFile } from 'antd/es/upload';

export default function ProductSetting() {
  const { currentUser } = useAuthStore();
  const {
    updateStore,
    createProductSetting,
    fetchProductSettings,
    updateProductSetting,
    isLoading,
    productSettings,
    totalProductSettings,
    deleteProductSettings
  } = useStoreStore();
  const [isProductModal, setIsProductModal] = useState<boolean>(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [openModalDelete, setOpenModalDelete] = useState<boolean>(false);
  const [detailProductSetting, setDetailProductSetting] = useState<ProductSettings | null>(null);
  const [filters] = useState<any>({});

  const { tableProps } = useTableConfig<ProductSettings, any>({
    data: productSettings,
    totalItems: totalProductSettings,
    isLoading,
    fetchData: fetchProductSettings,
    filters: filters
  });

  const {
    control: switchControl,
    handleSubmit: handleSwitchSubmit,
    reset: resetSwitch
  } = useForm<StorePayload>({
    mode: 'onChange',
    resolver: yupResolver(storeSchema)
  });

  const handleChangeSwitch = async (data: StorePayload) => {
    await updateStore(
      currentUser?.currentUserStore?.store?.id as string,
      {
        servingQuantityConfirmationDisabled: data?.servingQuantityConfirmationDisabled || false,
        qrSoundRegistered: data?.qrSoundRegistered || false
      },
      currentUser?.currentUserStore?.store?.thumbnail as RcFile | string,
      true
    );
  };

  useEffect(() => {
    if (currentUser) {
      const { store } = currentUser?.currentUserStore || {};
      resetSwitch({
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
        taxCode: store?.taxCode || ''
      });
    }
  }, [currentUser, resetSwitch]);

  const {
    control,
    reset,
    handleSubmit,
    formState: { errors }
  } = useForm<ProductSettingPayload>({
    resolver: yupResolver(productSettingSchema),
    defaultValues: {
      discountPercent: 0
    }
  });

  const columns: TableColumnsType<ProductSettings> = [
    {
      title: 'Phân loại',
      dataIndex: 'name',
      render: (text: string) => (
        <div className='truncate ' title={text}>
          {text}
        </div>
      )
    },
    { title: 'Giảm trừ HDBH', dataIndex: 'discountPercent', render: (value: number) => `${value}%` },
    {
      fixed: 'right',
      title: 'Tác vụ',
      render: (value: ProductSettings) => (
        <div>
          <BaseButton
            className={`w-[44px] h-[34px] rounded-md overflow-hidden`}
            variant='filled'
            onClick={() => {
              setIsProductModal(true);
              setDetailProductSetting(value);
              reset({
                name: value?.name,
                discountPercent: value?.discountPercent
              });
            }}
          >
            <EditOutlined className='text-primary text-[20px] font-bold' />
          </BaseButton>
        </div>
      )
    }
  ];

  const handleRowSelectionChange = async (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const handleSubmitProductType = async (data: ProductSettingPayload) => {
    try {
      if (detailProductSetting) {
        await updateProductSetting(detailProductSetting.id, data);
      } else {
        await createProductSetting(data);
      }
      await fetchProductSettings();
      reset();
      setIsProductModal(false);
      setDetailProductSetting(null);
    } catch (error) {
      setIsProductModal(false);
    }
  };

  const handleDeleteProductSettings = async () => {
    try {
      await deleteProductSettings(selectedRowKeys);
      await fetchProductSettings();
      setSelectedRowKeys([]);
      setOpenModalDelete(false);
    } catch (error) {
      setSelectedRowKeys([]);
      setOpenModalDelete(false);
    }
  };

  return (
    <div>
      <div>
        <h2 className='hidden md:block text-gray-500 font-bold text-lg mb-2'>Cài đặt yêu cầu phục vụ</h2>
        <Field className='!flex-row gap-5 items-center mt-4'>
          <div>
            <Controller
              control={switchControl}
              name='servingQuantityConfirmationDisabled'
              defaultValue={currentUser?.currentUserStore?.store?.servingQuantityConfirmationDisabled || false}
              render={({ field }) => (
                <Switch
                  checked={!field.value}
                  onChange={(checked) => {
                    field.onChange(!checked);
                    handleSwitchSubmit(handleChangeSwitch)();
                  }}
                />
              )}
            />
          </div>
          <Label
            className='text-sm md:text-base'
            text='Xác nhận số lượng phục vụ trước khi hoàn thành giao món đến khách hàng'
            validate={false}
          />
        </Field>
      </div>
      <div className='flex items-center justify-between my-4'>
        <h2 className='hidden md:block text-gray-500 font-bold text-lg mb-2'>Phân loại sản phẩm</h2>
        <div className='flex gap-2 items-center'>
          {selectedRowKeys?.length > 0 && (
            <BaseButton
              icon={<FaRegTrashAlt className='text-lg' />}
              color='danger'
              onClick={() => setOpenModalDelete(true)}
              variant='solid'
              className='md:py-[12px] py-[16px]'
            >
              Xoá
            </BaseButton>
          )}
          <BaseButton
            className='md:py-[12px] py-[16px]'
            onClick={() => {
              setIsProductModal(true);

              reset({
                name: '',
                discountPercent: 0
              });
            }}
          >
            Thêm mới
          </BaseButton>
        </div>
      </div>
      <DataTable<ProductSettings>
        rowKey='id'
        columns={columns}
        {...tableProps}
        rowSelectionEnabled
        rowSelectionType='checkbox'
        selectedRowKeys={selectedRowKeys}
        onSelectedRowsChange={(newSelectedRowKeys) => {
          handleRowSelectionChange(newSelectedRowKeys);
        }}
        scroll={!!productSettings?.length ? { x: 'max-content' } : {}}
        locale={{ emptyText: <NoData /> }}
        showPagination={true}
      />
      <CustomModal
        isOpen={isProductModal}
        title={detailProductSetting ? 'Chỉnh sửa thông tin phân loại' : 'Nhập thông tin phân loại'}
        onClose={() => {
          setIsProductModal(false);
          reset({ name: '', discountPercent: 0 });
          setDetailProductSetting(null);
        }}
        onConfirm={handleSubmit(handleSubmitProductType)}
        confirmLabel={detailProductSetting ? 'Cập nhật' : 'Tạo phân loại'}
        loading={isLoading}
      >
        <form onSubmit={handleSubmit(handleSubmitProductType)} className='w-full'>
          <Field className='mt-4'>
            <Label text='Tên phân loại sản phẩm' validate={true} />
            <FormInput
              control={control}
              name='name'
              type='text'
              placeholder='Tên phân loại sản phẩm'
              disabled={false}
              errors={errors}
              size='large'
              className={`w-full`}
            />
          </Field>
          <Field className='mt-4'>
            <Label text='Giá trị Giảm trừ HDBH' validate={true} />
            <FormInput
              control={control}
              name='discountPercent'
              type='number'
              defaultValue={0}
              min={0}
              placeholder='Nhập số'
              errors={errors}
              size='large'
              suffix='%'
            />
          </Field>
          <button type='submit' style={{ display: 'none' }} />
        </form>
      </CustomModal>

      <ModalDelete
        isOpen={openModalDelete}
        onClose={() => setOpenModalDelete(false)}
        onConfirm={handleDeleteProductSettings}
        loading={isLoading}
      >
        <h2>Bạn muốn xoá phân loại sản phẩm này?</h2>
      </ModalDelete>
    </div>
  );
}
