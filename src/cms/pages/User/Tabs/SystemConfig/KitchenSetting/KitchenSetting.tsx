import { yupResolver } from '@hookform/resolvers/yup';
import { Radio, Switch, TableColumnsType } from 'antd';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import DataTable from 'src/cms/components/Table/DataTable';
import { removeVietnameseAccents } from 'src/shared/common/format';
import BaseButton from 'src/shared/components/Buttons/Button';
import Field from 'src/shared/components/Core/Field';
import Label from 'src/shared/components/Core/Label';
import FormInput from 'src/shared/components/Form/FormInput';
import FormSelect from 'src/shared/components/Form/FormSelect';
import CustomModal from 'src/shared/components/Modals/Modal';
import useAuthStore from 'src/store/authStore';
import useStoreStore from 'src/store/useStoreStore';
import useZoneStore from 'src/store/useZoneStore';
import { KitchenSettingPayload, StorePayload, kitchenSettingSchema, storeSchema } from 'src/validate/userSchema';
import { EditOutlined } from '@ant-design/icons';
import NoData from 'src/cms/components/NoData/NoData';
import { useTableConfig } from 'src/hooks/useTable';
import ModalDelete from 'src/cms/components/Modal/ModalDelete';
import { FaRegTrashAlt } from 'react-icons/fa';
import { KitchenDetailSetting, KitchenSettings } from 'src/types/store.type';
import { RcFile } from 'antd/es/upload';

export default function KitchenSetting() {
  const { currentUser } = useAuthStore();
  const { zones, fetchZones } = useZoneStore();
  const {
    updateStore,
    productSettings,
    kitchenSettings,
    fetchKitchenSettings,
    createKitchenSetting,
    isLoading,
    totalKitchenSettings,
    updateKitchenSetting,
    deleteKitchenSettings,
    getDetailKitchenSetting,
    detailKitchenSetting,
    fetchProductSettings,
    clearDetailKitchenSetting
  } = useStoreStore();
  const [isKitchenModal, setIsKitchenModal] = useState<boolean>(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [openModalDelete, setOpenModalDelete] = useState<boolean>(false);
  const [filters] = useState<any>({});

  const { tableProps } = useTableConfig<KitchenSettings, any>({
    data: kitchenSettings,
    totalItems: totalKitchenSettings,
    isLoading,
    fetchData: fetchKitchenSettings,
    filters: filters
  });

  const {
    control: swithchControl,
    handleSubmit: handleSwitchSubmit,
    reset: resetSwitch
  } = useForm<StorePayload>({
    mode: 'onChange',
    resolver: yupResolver(storeSchema)
  });

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

  const handleChangeSwitch = async (data: StorePayload) => {
    await updateStore(
      currentUser?.currentUserStore?.store?.id as string,
      {
        kitchenDisabled: data?.kitchenDisabled || false,
        completingQuantityConfirmationDisabled: data?.completingQuantityConfirmationDisabled || false,
        qrSoundRegistered: data?.qrSoundRegistered || false
      },
      currentUser?.currentUserStore?.store?.thumbnail as RcFile | string,
      true
    );
  };

  const {
    control,
    reset,
    handleSubmit,
    formState: { errors }
  } = useForm<KitchenSettingPayload>({
    resolver: yupResolver(kitchenSettingSchema),
    defaultValues: {
      isPrintEnabled: false
    }
  });

  const columns: TableColumnsType<KitchenSettings> = [
    { title: 'Tên bếp', dataIndex: 'name' },
    {
      title: 'Khu vực tiếp nhận',
      render: (value: KitchenSettings) => `${value.zoneCount} khu vực`
    },
    { title: 'In phiếu bếp', render: (value: KitchenSettings) => (value.isPrintEnabled ? 'Có' : 'Không') },

    {
      fixed: 'right',
      title: 'Tác vụ',
      render: (value: KitchenDetailSetting, index) => {
        return (
          <div>
            <BaseButton
              className='w-[44px] h-[34px] rounded-md overflow-hidden'
              variant='filled'
              onClick={async () => {
                await getDetailKitchenSetting(value.id);
                setIsKitchenModal(true);
              }}
            >
              <EditOutlined className='text-primary text-[20px] font-bold' />
            </BaseButton>
          </div>
        );
      }
    }
  ];

  const handleSubmitKitchen = async (data: KitchenSettingPayload) => {
    try {
      if (detailKitchenSetting) {
        await updateKitchenSetting(detailKitchenSetting.id, data);
      } else {
        await createKitchenSetting(data);
      }
      await fetchKitchenSettings();
      reset({
        name: '',
        productTypeIds: [],
        zoneIds: [],
        isPrintEnabled: true
      });
      setIsKitchenModal(false);
      clearDetailKitchenSetting();
    } catch (error) {
      setIsKitchenModal(false);
    }
  };

  const handleRowSelectionChange = async (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const handleDeleteKitchenSettings = async () => {
    try {
      await deleteKitchenSettings(selectedRowKeys);
      await fetchKitchenSettings();
      setSelectedRowKeys([]);
      setOpenModalDelete(false);
    } catch (error) {
      setSelectedRowKeys([]);
      setOpenModalDelete(false);
    }
  };

  useEffect(() => {
    if (detailKitchenSetting) {
      reset({
        name: detailKitchenSetting?.name || '',
        productTypeIds: detailKitchenSetting?.kitchenProductTypes?.map((p) => p.productTypeId) || [],
        zoneIds: detailKitchenSetting?.kitchenZones?.map((z) => z.zoneId) || [],
        isPrintEnabled: detailKitchenSetting?.isPrintEnabled ?? true
      });
    }
  }, [detailKitchenSetting]);

  useEffect(() => {
    fetchZones();
    fetchProductSettings();
  }, []);
  return (
    <div>
      <div>
        <h2 className='hidden md:block text-gray-500 font-bold text-lg mb-2'>Cài đặt bếp</h2>
        <Field className='!flex-row gap-5 items-center mt-4'>
          <Controller
            control={swithchControl}
            name='kitchenDisabled'
            defaultValue={currentUser?.currentUserStore?.store?.kitchenDisabled || false}
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
          <Label className='text-sm md:text-base' text='Chế độ bếp' validate={false} />
        </Field>
        <Field className='!flex-row gap-5 items-center mt-4'>
          <Controller
            control={swithchControl}
            name='completingQuantityConfirmationDisabled'
            defaultValue={currentUser?.currentUserStore?.store?.completingQuantityConfirmationDisabled || false}
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
          <Label className='text-sm md:text-base' text='Xác nhận số lượng hoàn thành' validate={false} />
        </Field>
      </div>
      <div className='flex items-center justify-between my-4'>
        <h2 className='hidden md:block text-gray-500 font-bold text-lg mb-2'>Danh sách bếp</h2>
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
              setIsKitchenModal(true);
            }}
          >
            Thêm mới
          </BaseButton>
        </div>
      </div>
      <DataTable<any>
        rowKey='id'
        columns={columns}
        {...tableProps}
        rowSelectionEnabled
        rowSelectionType='checkbox'
        selectedRowKeys={selectedRowKeys}
        onSelectedRowsChange={(newSelectedRowKeys) => {
          handleRowSelectionChange(newSelectedRowKeys);
        }}
        scroll={!!kitchenSettings?.length ? { x: 'max-content' } : {}}
        locale={{ emptyText: <NoData /> }}
        showPagination={true}
      />
      <CustomModal
        isOpen={isKitchenModal}
        title={detailKitchenSetting ? 'Chỉnh sửa thông tin bếp' : 'Nhập thông tin bếp'}
        onClose={() => {
          setIsKitchenModal(false);
          reset({
            name: '',
            productTypeIds: [],
            zoneIds: [],
            isPrintEnabled: true
          });
          clearDetailKitchenSetting();
        }}
        onConfirm={handleSubmit(handleSubmitKitchen)}
        confirmLabel={detailKitchenSetting ? 'Cập nhật' : 'Tạo bếp'}
        loading={isLoading}
      >
        <form onSubmit={handleSubmit(handleSubmitKitchen)} className='w-full'>
          <Field className='mt-4'>
            <Label text='Tên bếp' validate={true} />
            <FormInput
              control={control}
              name='name'
              type='text'
              placeholder='Nhập tên bếp'
              disabled={false}
              errors={errors}
              size='large'
              className={`w-full`}
            />
          </Field>
          <Field className='mt-4'>
            <Label text='Phân loại chế biến' validate={true} />
            <FormSelect
              mode='multiple'
              control={control}
              disabled={false}
              name='productTypeIds'
              options={productSettings.map((product) => ({
                value: product.id,
                label: product.name
              }))}
              errors={errors}
              size='large'
              placeholder='Chọn phân loại chế biến'
              showSearch
              notFoundContent={<NoData />}
              filterOption={(input, option) =>
                typeof option?.label === 'string' &&
                removeVietnameseAccents(option.label).includes(removeVietnameseAccents(input))
              }
            />
          </Field>
          <Field>
            <Label text='In phiếu bếp' validate={true} />
            <Controller
              name='isPrintEnabled'
              control={control}
              render={({ field }) => (
                <Radio.Group {...field} value={field.value}>
                  <Radio value={true}>Có</Radio>
                  <Radio value={false}>Không</Radio>
                </Radio.Group>
              )}
            />
          </Field>
          <Field className='mt-4'>
            <Label text='Khu vực tiếp nhận' validate={true} />
            <FormSelect
              mode='multiple'
              control={control}
              disabled={false}
              name='zoneIds'
              options={zones.map((zone) => ({
                value: zone.id,
                label: zone.name
              }))}
              errors={errors}
              size='large'
              placeholder='Chọn khu vực tiếp nhận'
              showSearch
              filterOption={(input, option) =>
                typeof option?.label === 'string' &&
                removeVietnameseAccents(option.label).includes(removeVietnameseAccents(input))
              }
            />
          </Field>
          <button type='submit' style={{ display: 'none' }} />
        </form>
      </CustomModal>
      <ModalDelete
        isOpen={openModalDelete}
        onClose={() => setOpenModalDelete(false)}
        onConfirm={handleDeleteKitchenSettings}
        loading={isLoading}
      >
        <h2>Bạn muốn xoá thông tin bếp này?</h2>
      </ModalDelete>
    </div>
  );
}
