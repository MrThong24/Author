import { ColorPicker, Space, Switch } from 'antd';
import { Control, Controller, FieldErrors, UseFormClearErrors, UseFormSetValue } from 'react-hook-form';
import { RiResetLeftLine } from 'react-icons/ri';
import NoData from 'src/cms/components/NoData/NoData';
import useMediaQuery from 'src/hooks/useMediaQuery';
import BaseButton from 'src/shared/components/Buttons/Button';
import Field from 'src/shared/components/Core/Field';
import Label from 'src/shared/components/Core/Label';
import FormInput from 'src/shared/components/Form/FormInput';
import FormSelect from 'src/shared/components/Form/FormSelect';
import useAuthStore from 'src/store/authStore';
import useStoreStore from 'src/store/useStoreStore';
import { StorePayload } from 'src/validate/userSchema';

interface ConfigGeneralFormProps {
  control: Control<StorePayload>;
  errors: FieldErrors<StorePayload>;
  loading: boolean;
  type: 'general' | 'payment' | string;
  setValue: UseFormSetValue<StorePayload>;
  clearErrors: UseFormClearErrors<StorePayload>;
}
export default function ConfigGeneralForm({ control, errors, setValue, type, clearErrors }: ConfigGeneralFormProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { banks, listPosStore } = useStoreStore();
  const { currentUser } = useAuthStore();

  return (
    <>
      {type === 'general' && (
        <div>
          <div className='text-gray-500 font-bold text-lg mb-2'>Cài đặt hệ thống</div>
          <div className='flex flex-col xl:flex-row gap-x-10'>
            <Field className='mt-2'>
              <Label text='Slogan' validate={true} />
              <FormInput
                rows={2}
                control={control}
                name='slogan'
                type='textarea'
                disabled={false}
                placeholder='Slogan'
                errors={errors}
                size='large'
              />
            </Field>
          </div>
          <div className='mt-2'>
            <Field>
              <Label text='Màu sắc hệ thống' validate={false} />
              <div className='flex items-center'>
                <Controller
                  name='primaryColor'
                  control={control}
                  render={({ field, fieldState }) => (
                    <ColorPicker
                      {...field}
                      {...fieldState}
                      defaultValue='#005FAB'
                      format='hex'
                      size='large'
                      showText
                      onChange={(value) => {
                        field.onChange(value?.toHexString());
                      }}
                    />
                  )}
                />
                <BaseButton
                  variant='filled'
                  className='h-full bg-transparent'
                  override='transparent'
                  onClick={() => {
                    setValue('primaryColor', '#005FAB');
                  }}
                >
                  <div className='bg-orange-50 p-3 rounded-lg'>
                    <RiResetLeftLine className='text-xl rotate-[-90deg] text-[#D1542B]' />
                  </div>
                </BaseButton>
              </div>
            </Field>
          </div>
          <div className='mt-4'>
            <div className='text-gray-500 font-bold text-lg mb-2'>Cấu hình in</div>
            <Field className='mt-4'>
              <Label text='Đường dẫn template máy in' validate={false} />
              <FormInput
                control={control}
                name='bPacTemplatePath'
                type='text'
                placeholder='Đường dẫn template máy in'
                disabled={false}
                errors={errors}
                size='large'
                className={`w-full ${!isMobile ? 'md:w-[calc(100%-10px)]' : ''}`}
              />
            </Field>
            {currentUser?.currentUserStore?.store?.company?.posIntegration && (
              <Field className='mt-4'>
                <Label text='Kết nối điểm bán MobiFone 1POS' validate={true} />
                <FormSelect
                  disabled={false}
                  placeholder='Kết nối điểm bán MobiFone 1POS'
                  control={control}
                  name='posStoreId'
                  options={listPosStore?.map((pos) => ({
                    label: pos?.name,
                    value: pos?.id
                  }))}
                  onChange={(value) => {
                    setValue('posStoreId', value);
                    if (value) {
                      clearErrors('posStoreId');
                    }
                  }}
                  errors={errors}
                  notFoundContent={<NoData />}
                  size='large'
                />
              </Field>
            )}
          </div>
        </div>
      )}
      {type === 'payment' && (
        <div>
          <div className='text-gray-500 font-bold text-lg mb-2'>Cấu hình thanh toán</div>
          <div className='flex flex-col md:gap-4'>
            <Field className='!flex-row gap-5 items-center mt-2'>
              <div>
                <Controller
                  control={control}
                  name='isQRIntegrated'
                  defaultValue={false}
                  render={({ field }) => <Switch checked={field.value} onChange={field.onChange} />}
                />
              </div>
              <Label text='Sử dụng QR loa thần tài' validate={false} />
            </Field>
            <Field className='!flex-row gap-5 items-center mt-2'>
              <div>
                <Controller
                  control={control}
                  name='qrSoundRegistered'
                  defaultValue={false}
                  render={({ field }) => (
                    <Switch checked={field.value} onChange={(checked) => field.onChange(checked)} />
                  )}
                />
              </div>
              <Label text='Thông báo đơn hàng thanh toán' validate={false} />
            </Field>
          </div>
          <div className='text-gray-500 font-bold text-lg mb-2 mt-4'>Thông tin ngân hàng</div>
          <div className='flex flex-col xl:grid xl:grid-cols-2 sm:gap-4'>
            <div className='flex flex-col xl:flex-row'>
              <Field className='mt-4'>
                <Label text='STK' validate={false} />
                <FormInput
                  control={control}
                  name='bankNumber'
                  type='text'
                  placeholder='Số tài khoản'
                  disabled={false}
                  errors={errors}
                  size='large'
                  className={`w-full ${!isMobile ? 'md:w-[calc(100%-10px)]' : ''}`}
                />
              </Field>
              <Field className='mt-4'>
                <Label text='Tên chủ tài khoản' validate={false} />
                <FormInput
                  control={control}
                  name='accountHolder'
                  type='text'
                  placeholder='Tên chủ tài khoản'
                  disabled={false}
                  errors={errors}
                  size='large'
                  className={`w-full ${!isMobile ? 'md:w-[calc(100%-10px)]' : ''}`}
                />
              </Field>
            </div>
            <Field className='mt-4'>
              <Label text='Ngân hàng' validate={false} />
              <FormSelect
                control={control}
                name='bankBin'
                showSearch
                allowClear
                onChange={(value) => {
                  setValue('bankBin', value || '');
                }}
                placeholder='Chọn ngân hàng'
                optionFilterProp='label'
                filterSort={(optionA, optionB) =>
                  ((optionA?.label as string) ?? '')
                    .toLowerCase()
                    .localeCompare(((optionB?.label as string) ?? '').toLowerCase())
                }
                optionRender={(option) => {
                  return (
                    <Space>
                      <img src={option.data.emoji} alt={option.data.emoji} style={{ width: 50, height: 30 }} />
                      <span>{option.data.label}</span>
                    </Space>
                  );
                }}
                options={banks?.map((item) => {
                  return {
                    value: item.bin,
                    label: item.shortName,
                    emoji: item.logo
                  };
                })}
                size='large'
              />
            </Field>
          </div>
        </div>
      )}
    </>
  );
}
