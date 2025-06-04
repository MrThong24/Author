import { yupResolver } from '@hookform/resolvers/yup';
import { ColorPicker, Image, Skeleton, Switch } from 'antd';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { RiResetLeftLine } from 'react-icons/ri';
import { imageStoreDefault } from 'src/assets/images';
import useMediaQuery from 'src/hooks/useMediaQuery';
import BaseButton from 'src/shared/components/Buttons/Button';
import Field from 'src/shared/components/Core/Field';
import Label from 'src/shared/components/Core/Label';
import { generateImageURL } from 'src/shared/utils/utils';
import useAuthStore from 'src/store/authStore';
import useStoreStore from 'src/store/useStoreStore';
import { configScheme, StoreConfig } from 'src/validate/userSchema';

export default function ProfileStoreDetail() {
  const { currentUser, isLoading } = useAuthStore();
  const { banks } = useStoreStore();
  const nameBank = banks.find((bank) => bank.bin === currentUser?.currentUserStore?.store?.bankBin);
  return (
    <div>
      <div className='flex justify-center'>
        <div className='w-[100px] h-[100px]'>
          {isLoading ? (
            <Skeleton.Image active />
          ) : (
            <Image
              src={generateImageURL(currentUser?.currentUserStore?.store?.thumbnail) || imageStoreDefault}
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
            {currentUser?.currentUserStore?.store.name}
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
              {currentUser?.currentUserStore?.store.email}
            </div>
          )}
        </Field>
        <Field className='mt-6'>
          <Label text='Địa chỉ' validate={false} />
          {isLoading ? (
            <Skeleton.Input active style={{ width: '100%' }} />
          ) : (
            <div className='w-full h-[44px] px-3 py-3 text-sm border-gray-200 rounded-md bg-white flex items-center shadow-sm'>
              {currentUser?.currentUserStore?.store.address}
            </div>
          )}
        </Field>
      </div>

      <Field className='mt-6'>
        <Label text='Số điện thoại' validate={false} />
        {isLoading ? (
          <Skeleton.Input active style={{ width: '100%' }} />
        ) : (
          <div className='w-full md:w-[calc(50%-0.5rem)] h-[44px] px-3 py-3 text-sm border-gray-200 rounded-md bg-white flex items-center shadow-sm'>
            {currentUser?.currentUserStore?.store.phone}
          </div>
        )}
      </Field>
      {/* <div className='mt-4'>
        <div className='hidden md:block text-gray-500 font-medium text-base'>Thông tin ngân hàng</div>
        <div className='flex flex-col md:grid md:grid-cols-2 sm:gap-4'>
          <div className='flex flex-col md:flex-row md:gap-4'>
            <Field className='mt-2 md:mt-4'>
              <Label text='STK' validate={false} />
              {isLoading ? (
                <Skeleton.Input active style={{ width: '100%' }} />
              ) : (
                <div className='w-full h-[44px] px-3 py-3 text-sm border-gray-200 rounded-md bg-white flex items-center shadow-sm'>
                  {currentUser?.currentUserStore?.store.bankNumber}
                </div>
              )}
            </Field>
            <Field className='mt-4'>
              <Label text='Tên chủ tài khoản' validate={false} />
              {isLoading ? (
                <Skeleton.Input active style={{ width: '100%' }} />
              ) : (
                <div className='w-full h-[44px] px-3 py-3 text-sm border-gray-200 rounded-md bg-white flex items-center shadow-sm'>
                  {currentUser?.currentUserStore?.store.accountHolder}
                </div>
              )}
            </Field>
          </div>

          <Field className='mt-4'>
            <Label text='Ngân hàng' validate={false} />
            {isLoading ? (
              <Skeleton.Input active style={{ width: '100%' }} />
            ) : currentUser?.currentUserStore?.store?.bankBin ? (
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
      </div> */}
      {/* <Field className='mt-6'>
          <Label text='Mã số thuế' validate={false} />
          {isLoading ? (
            <Skeleton.Input active style={{ width: '100%' }} />
          ) : (
            <div className='w-full h-[44px] px-3 py-3 text-sm border-gray-200 rounded-md bg-white flex items-center shadow-sm'>
              {currentUser?.currentUserStore?.store?.taxCode}
            </div>
          )}{' '}
        </Field> */}
      {/* <div className='mt-4'>
        <div className='hidden md:block text-gray-500 font-medium text-base'>Cài đặt hệ thống</div>
        <div className='flex flex-col md:flex-row md:gap-4'>
          <Field className='mt-2'>
            <Label text='Slogan' validate={true} />
            {isLoading ? (
              <Skeleton.Input active style={{ width: '100%' }} />
            ) : (
              <div className='w-full max-h-[100px] px-3 py-3 text-sm border-gray-200 rounded-md bg-white shadow-sm font-normal whitespace-pre-line overflow-y-auto'>
                {currentUser?.currentUserStore?.store.slogan}
              </div>
            )}
          </Field>
          <Field className='mt-2'>
            <Label text='Màu sắc hệ thống' validate={false} />
            {isLoading ? (
              <Skeleton.Input active style={{ width: '100%' }} />
            ) : (
              <div className='flex items-center gap-2'>
                <ColorPicker
                  value={currentUser?.currentUserStore?.store?.primaryColor || '#005FAB'}
                  format='hex'
                  size='large'
                  showText
                  open={false}
                />
              </div>
            )}
          </Field>
        </div>
      </div> */}
      {/* <div className='mt-4'>
        <div className='hidden md:block text-gray-500 font-medium text-base'>Cấu hình in</div>
        <div className='flex flex-col md:flex-row md:gap-4'>
          <Field className='mt-4'>
            <Label text='Đường dẫn template máy in' validate={false} />
            {isLoading ? (
              <Skeleton.Input active style={{ width: '100%' }} />
            ) : (
              <div className='w-full h-[44px] px-3 py-3 text-sm border-gray-200 rounded-md bg-white flex items-center shadow-sm'>
                {currentUser?.currentUserStore?.store?.bPacTemplatePath}
              </div>
            )}
          </Field>
        </div>
      </div> */}
      {/* <div className='mt-4'>
        <div className='hidden md:block text-gray-500 font-medium text-base mb-2'>Cấu hình thanh toán</div>
        <div className='flex flex-col md:flex-row md:gap-4'>
          <Field className='!flex-row gap-5 items-center mt-2'>
            {isLoading ? (
              <Skeleton.Input active style={{ width: '100%' }} />
            ) : (
              <div>
                <Switch value={currentUser?.currentUserStore?.store?.isQRIntegrated} disabled />
              </div>
            )}
            <Label text='Sử dụng QR loa thần tài' validate={false} />
          </Field>
          <Field className='!flex-row gap-5 items-center mt-2'>
            {isLoading ? (
              <Skeleton.Input active style={{ width: '100%' }} />
            ) : (
              <div>
                <Switch checked={currentUser?.currentUserStore?.store?.qrSoundRegistered} disabled />
              </div>
            )}
            <Label text='Thông báo đơn hàng thanh toán' validate={false} />
          </Field>
        </div>
      </div> */}
      {/* <div className='mt-2 md:mt-4'>
        <div className='hidden md:block text-gray-500 font-medium text-base'>Cấu hình bếp</div>
        <div className='flex flex-col md:flex-row md:gap-4'>
          <Field className='!flex-row gap-5 items-center mt-2'>
            {isLoading ? (
              <Skeleton.Input active style={{ width: '100%' }} />
            ) : (
              <div>
                <Switch checked={!currentUser?.currentUserStore?.store?.kitchenDisabled} disabled />
              </div>
            )}
            <Label text='Chế độ bếp' validate={false} />
          </Field>
          <Field className='!flex-row gap-5 items-center mt-4 md:mt-2'>
            {isLoading ? (
              <Skeleton.Input active style={{ width: '100%' }} />
            ) : (
              <div>
                <Switch
                  checked={!currentUser?.currentUserStore?.store?.completingQuantityConfirmationDisabled}
                  disabled
                />
              </div>
            )}
            <Label text='Xác nhận số lượng hoàn thành' validate={false} />
          </Field>
        </div>
      </div> */}

      {/* <div className='mt-4'>
        <div className='hidden md:block text-gray-500 font-medium text-base mb-2'>Cấu hình yêu cầu phục vụ</div>
        <Field className='!flex-row gap-5 items-center mt-2'>
          {isLoading ? (
            <Skeleton.Input active style={{ width: '100%' }} />
          ) : (
            <div>
              <Switch checked={!currentUser?.currentUserStore?.store?.servingQuantityConfirmationDisabled} disabled />
            </div>
          )}
          <Label text='Xác nhận số lượng phục vụ' validate={false} />
        </Field>
      </div> */}
    </div>
  );
}
