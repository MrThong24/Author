import { ColorPicker, Image, Skeleton, Switch } from 'antd';
import { imageStoreDefault } from 'src/assets/images';
import Field from 'src/shared/components/Core/Field';
import Label from 'src/shared/components/Core/Label';
import { generateImageURL } from 'src/shared/utils/utils';
import useAuthStore from 'src/store/authStore';
import useStoreStore from 'src/store/useStoreStore';

export default function StoreDetail() {
  const { currentUser, isLoading: isAuthLoading } = useAuthStore();
  const { isLoading, detailStore, banks } = useStoreStore();
  const nameBank = banks.find((bank) => bank.bin === detailStore?.bankBin);
  return (
    <div>
      <div className='flex justify-center'>
        <div className='w-[100px] h-[100px] mt-4'>
          {isLoading ? (
            <Skeleton.Image active />
          ) : (
            <Image
              src={generateImageURL(detailStore?.thumbnail) || imageStoreDefault}
              alt='avatar'
              style={{
                width: '100px',
                height: '100px',
                objectFit: 'cover'
              }}
            />
          )}
        </div>
      </div>
      <Field className='mt-6'>
        <Label text='Tên cửa hàng' validate={true} />
        {isLoading ? (
          <Skeleton.Input active style={{ width: '100%' }} />
        ) : (
          <div className='w-full h-[44px] px-3 py-3 text-sm border-gray-200 rounded-md bg-white flex items-center shadow-sm'>
            {detailStore?.name}
          </div>
        )}
      </Field>
      <div className='flex flex-col md:flex-row md:gap-4 '>
        <Field className='mt-6'>
          <Label text='Email' validate={false} />
          {isLoading ? (
            <Skeleton.Input active style={{ width: '100%' }} />
          ) : (
            <div className='w-full h-[44px] px-3 py-3 text-sm border-gray-200 rounded-md bg-white flex items-center shadow-sm'>
              {detailStore?.email}
            </div>
          )}
        </Field>
        <Field className='mt-6'>
          <Label text='Địa chỉ' validate={false} />
          {isLoading ? (
            <Skeleton.Input active style={{ width: '100%' }} />
          ) : (
            <div className='w-full h-[44px] px-3 py-3 text-sm border-gray-200 rounded-md bg-white flex items-center shadow-sm'>
              {detailStore?.address}
            </div>
          )}{' '}
        </Field>
      </div>
      <div className='flex flex-col md:flex-row md:gap-4'>
        <Field className='mt-6'>
          <Label text='Số điện thoại' validate={false} />
          {isLoading ? (
            <Skeleton.Input active style={{ width: '100%' }} />
          ) : (
            <div className='w-full h-[44px] px-3 py-3 text-sm border-gray-200 rounded-md bg-white flex items-center shadow-sm'>
              {detailStore?.phone}
            </div>
          )}
        </Field>
        <Field className='mt-6'>
          <Label text='Slogan' validate={true} />
          {isLoading ? (
            <Skeleton.Input active style={{ width: '100%' }} />
          ) : (
            <div className='w-full max-h-[100px] px-3 py-3 text-sm border-gray-200 rounded-md bg-white shadow-sm font-normal whitespace-pre-line overflow-y-auto'>
              {detailStore?.slogan}
            </div>
          )}
        </Field>
      </div>
      <div className='flex flex-col md:flex-row md:gap-4'>
        <Field className='mt-6'>
          <Label text='Tên chủ tài khoản' validate={false} />
          {isLoading ? (
            <Skeleton.Input active style={{ width: '100%' }} />
          ) : (
            <div className='w-full h-[44px] px-3 py-3 text-sm border-gray-200 rounded-md bg-white flex items-center shadow-sm'>
              {detailStore?.accountHolder}
            </div>
          )}{' '}
        </Field>
        <Field className='mt-6'>
          <Label text='Ngân hàng' validate={false} />
          {isLoading ? (
            <Skeleton.Input active style={{ width: '100%' }} />
          ) : detailStore?.bankBin ? (
            <div className='w-full h-[44px] px-3 py-3 text-sm border-gray-200 rounded-md bg-white flex items-center shadow-sm'>
              <img src={nameBank?.logo} alt={nameBank?.name} className='w-[90px] h-[40px]' />
              <h2>{nameBank?.name}</h2>
            </div>
          ) : (
            <div className='w-full h-[44px] px-3 py-3 text-sm border-gray-200 rounded-md bg-white flex items-center shadow-sm'>
              {''}
            </div>
          )}
        </Field>
      </div>
      <div className='flex flex-col md:flex-row md:gap-4'>
        <Field className='mt-6'>
          <Label text='Số tài khoản' validate={false} />
          {isLoading ? (
            <Skeleton.Input active style={{ width: '100%' }} />
          ) : (
            <div className='w-full h-[44px] px-3 py-3 text-sm border-gray-200 rounded-md bg-white flex items-center shadow-sm'>
              {detailStore?.bankNumber}
            </div>
          )}{' '}
        </Field>
        <Field className='mt-6'>
          <Label text='Mã số thuế' validate={false} />
          {isLoading ? (
            <Skeleton.Input active style={{ width: '100%' }} />
          ) : (
            <div className='w-full h-[44px] px-3 py-3 text-sm border-gray-200 rounded-md bg-white flex items-center shadow-sm'>
              {detailStore?.taxCode}
            </div>
          )}{' '}
        </Field>
      </div>
      <Field className='mt-6'>
        <Label text='Màu sắc hệ thống' validate={false} />
        {isLoading ? (
          <Skeleton.Input active style={{ width: '100%' }} />
        ) : (
          <div className='flex items-center gap-2'>
            <ColorPicker
              value={detailStore?.primaryColor || '#005FAB'}
              format='hex'
              size='large'
              showText
              open={false}
            />
          </div>
        )}
      </Field>
      {/* <div className='flex flex-col md:flex-row md:gap-4'>
        <Field className='!flex-row gap-5 items-center mt-6'>
          <Label text='Xác nhận số lượng phục vụ' validate={false} />
          {isAuthLoading ? (
            <Skeleton.Input active style={{ width: '100%' }} />
          ) : (
            <div>
              <Switch checked={!detailStore?.servingQuantityConfirmationDisabled} disabled />
            </div>
          )}
        </Field>
        <Field className='!flex-row gap-5 items-center mt-6'>
          <Label text='Xác nhận số lượng hoàn thành' validate={false} />
          {isAuthLoading ? (
            <Skeleton.Input active style={{ width: '100%' }} />
          ) : (
            <div>
              <Switch checked={!detailStore?.completingQuantityConfirmationDisabled} disabled />
            </div>
          )}
        </Field>
      </div> */}
    </div>
  );
}
