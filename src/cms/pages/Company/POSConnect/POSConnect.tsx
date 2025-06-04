import { yupResolver } from '@hookform/resolvers/yup';
import { Switch } from 'antd';
import { RcFile } from 'antd/es/upload';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { BiTransferAlt } from 'react-icons/bi';
import BaseButton from 'src/shared/components/Buttons/Button';
import Label from 'src/shared/components/Core/Label';
import FormInput from 'src/shared/components/Form/FormInput';
import useAuthStore from 'src/store/authStore';
import useCompanyStore from 'src/store/useCompanyStore';
import useEmployeeStore from 'src/store/useEmployeeStore';
import useStoreStore from 'src/store/useStoreStore';
import { CompanyPayload, CompanySchema, PostConnectPayload, PostConnectionSchema } from 'src/validate/companySchema';

export default function POSConnect() {
  const [editPosConnection, setEditPosConnection] = useState<boolean>(false);
  const [fileImage, setFileImage] = useState<RcFile | string>();
  const { getCurrentUser } = useAuthStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues: getPostConnectValues,
    reset: resetPostConnect
  } = useForm<PostConnectPayload>({
    resolver: yupResolver(PostConnectionSchema)
  });

  const {
    control: controlCompany,
    reset: resetCompany,
    handleSubmit: handleSubmitCompany
  } = useForm<CompanyPayload>({
    resolver: yupResolver(CompanySchema)
  });

  const { isLoading, detailCompany, posConnection, updateCompany } = useCompanyStore();
  const [loadingConnect, setLoadingConnect] = useState<boolean>(false);

  const onSubmit = async (data: PostConnectPayload) => {
    setLoadingConnect(true);
    try {
      await posConnection(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingConnect(false);
    }
  };

  useEffect(() => {
    if (detailCompany) {
      resetCompany({
        name: detailCompany?.name || '',
        taxCode: detailCompany?.taxCode || '',
        legalRepresentative: detailCompany?.legalRepresentative || '',
        address: detailCompany?.address || '',
        posIntegration: detailCompany?.posIntegration,
        posConnectionUrl: detailCompany?.posConnectionUrl || ''
      });

      resetPostConnect({
        posConnectionUrl: detailCompany?.posConnectionUrl || ''
      });

      setFileImage(detailCompany?.thumbnail || fileImage);
    }
  }, [detailCompany, resetCompany, resetPostConnect]);

  const toggleConnection = async (companyData: CompanyPayload) => {
    const { posConnectionUrl } = getPostConnectValues();

    const payload = {
      ...companyData,
      posConnectionUrl: posConnectionUrl || ''
    };

    try {
      await updateCompany(payload, fileImage as RcFile | string);
      await getCurrentUser();
      setEditPosConnection(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveOrEdit = () => {
    if (editPosConnection) {
      handleSubmit(async () => {
        await handleSubmitCompany(toggleConnection)();
        await getCurrentUser();
      })();
    } else {
      setEditPosConnection(true);
    }
  };

  return (
    <div className='p-2'>
      <div className='flex items-center gap-2'>
        <Controller
          control={controlCompany}
          name='posIntegration'
          defaultValue={detailCompany?.posIntegration || false}
          render={({ field }) => (
            <Switch
              checked={field.value}
              onChange={(checked) => {
                field.onChange(checked);
                handleSubmitCompany(toggleConnection)();
              }}
            />
          )}
        />
        <h2>Tích hợp MobiFone 1POS</h2>
      </div>
      {detailCompany?.posIntegration && (
        <>
          <h2 className='text-primary my-4'>Thông tin kết nối MobiFone 1POS</h2>
          <div className='flex flex-col mt-4 md:flex-row gap-x-10 gap-y-4'>
            <div className='flex-1'>
              <div className='flex items-center justify-between mb-1 sm:hidden '>
                <Label text='Đường dẫn đích' validate={true} />
                <div className='flex text-primary gap-1' onClick={handleSubmit(onSubmit)}>
                  <BiTransferAlt className='text-2xl font-medium' />
                  <span className='font-medium'>Đường dẫn đích</span>
                </div>
              </div>
              <div className='flex gap-2 sm:gap-4'>
                <FormInput
                  disabled={!editPosConnection}
                  control={control}
                  name='posConnectionUrl'
                  placeholder='Đường dẫn đích'
                  errors={errors}
                  size='large'
                />
                <div className='sm:inline hidden'>
                  <BaseButton
                    className='h-[40px] sm:w-fit w-[40px]'
                    variant='outlined'
                    disabled={!editPosConnection}
                    loading={loadingConnect}
                    onClick={handleSubmit(onSubmit)}
                    icon={<BiTransferAlt className='text-2xl' />}
                  >
                    <span className=''>Kiểm tra kết nối</span>
                  </BaseButton>
                </div>
              </div>
            </div>
          </div>
          <div className='flex justify-center gap-6 mt-8'>
            {editPosConnection && (
              <BaseButton
                loading={false}
                onClick={() => {
                  setEditPosConnection(false);
                  resetPostConnect({
                    posConnectionUrl: detailCompany?.posConnectionUrl || ''
                  });
                }}
                color='danger'
                className='w-[275px]'
              >
                Huỷ
              </BaseButton>
            )}
            <BaseButton loading={isLoading} onClick={handleSaveOrEdit} className='w-[275px]'>
              {editPosConnection ? 'Lưu' : 'Chỉnh sửa'}
            </BaseButton>
          </div>
        </>
      )}
    </div>
  );
}
