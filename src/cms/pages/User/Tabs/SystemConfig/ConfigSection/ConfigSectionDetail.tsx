import { ColorPicker, Skeleton, Switch } from 'antd';
import Field from 'src/shared/components/Core/Field';
import Label from 'src/shared/components/Core/Label';
import useAuthStore from 'src/store/authStore';
import useStoreStore from 'src/store/useStoreStore';

interface ConfigSectionProps {
  type: 'general' | 'payment' | string;
}
export default function ConfigGeneralDetail({ type }: ConfigSectionProps) {
  const { currentUser, isLoading } = useAuthStore();
  const { banks, listPosStore, loadingPosStore } = useStoreStore();
  const nameBank = banks.find((bank) => bank.bin === currentUser?.currentUserStore?.store?.bankBin);

  return (
    <>
      {type === 'general' && (
        <div>
          <div>
            <div className='text-gray-500 font-bold text-lg mb-2'>Cài đặt hệ thống</div>
            <div className='flex flex-col xl:flex-row md:gap-4'>
              <Field className='mt-2'>
                <Label text='Slogan' validate={true} />
                {isLoading || loadingPosStore ? (
                  <Skeleton.Input active style={{ width: '100%' }} />
                ) : (
                  <div className='w-full max-h-[100px] px-3 py-3 text-sm border-gray-200 rounded-md bg-white shadow-sm font-normal whitespace-pre-line overflow-y-auto'>
                    {currentUser?.currentUserStore?.store.slogan}
                  </div>
                )}
              </Field>
              <Field className='mt-2'>
                <Label text='Màu sắc hệ thống' validate={false} />
                {isLoading || loadingPosStore ? (
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
          </div>
          <div className='mt-6'>
            <div className='text-gray-500 font-bold text-lg'>Cấu hình in QRCode</div>
            <div className='flex flex-col xl:flex-row md:gap-4'>
              <Field className='mt-4'>
                <Label text='Đường dẫn template máy in' validate={false} />
                {isLoading || loadingPosStore ? (
                  <Skeleton.Input active style={{ width: '100%' }} />
                ) : (
                  <div className='w-full h-[44px] px-3 py-3 text-sm border-gray-200 rounded-md bg-white flex items-center shadow-sm'>
                    {currentUser?.currentUserStore?.store?.bPacTemplatePath}
                  </div>
                )}
              </Field>
            </div>
            {currentUser?.currentUserStore?.store?.company?.posIntegration && (
              <div className='flex flex-col xl:flex-row md:gap-4'>
                <Field className='mt-4'>
                  <Label text='Kết nối điểm bán MobiFone 1POS' validate={true} />
                  {isLoading || loadingPosStore ? (
                    <Skeleton.Input active style={{ width: '100%' }} />
                  ) : (
                    <div className='w-full h-[44px] px-3 py-3 text-sm border-gray-200 rounded-md bg-white flex items-center shadow-sm'>
                      {listPosStore?.find((item) => item?.id === currentUser?.currentUserStore?.store?.posStoreId)
                        ?.name || ''}
                    </div>
                  )}
                </Field>
              </div>
            )}
          </div>
        </div>
      )}
      {type === 'payment' && (
        <div>
          <div className='text-gray-500 font-bold text-lg mb-2'>Cấu hình thanh toán</div>
          <div className='flex flex-col md:gap-4'>
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
          <div className='mt-4'>
            <div className='text-gray-500 font-bold text-lg'>Thông tin ngân hàng</div>
            <div className='flex flex-col xl:grid xl:grid-cols-2 xl:gap-4'>
              <div className='flex flex-col 2xl:flex-row md:gap-4'>
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
          </div>
        </div>
      )}
    </>
  );
}
