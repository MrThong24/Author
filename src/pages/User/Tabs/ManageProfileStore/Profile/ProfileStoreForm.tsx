import { ColorPicker, GetProp, Space, Switch, Upload, UploadProps } from 'antd';
import ImgCrop from 'antd-img-crop';
import { UploadChangeParam } from 'antd/es/upload';
import { useEffect, useState } from 'react';
import { Control, Controller, FieldErrors, useForm, UseFormSetValue } from 'react-hook-form';
import BaseButton from 'src/shared/components/Buttons/Button';
import Field from 'src/shared/components/Core/Field';
import Label from 'src/shared/components/Core/Label';
import FormInput from 'src/shared/components/Form/FormInput';
import { configScheme, StoreConfig, StorePayload } from 'src/validate/userSchema';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { beforeUploadImage } from 'src/shared/utils/common';
import useAuthStore from 'src/store/authStore';
import FormSelect from 'src/shared/components/Form/FormSelect';
import useStoreStore from 'src/store/useStoreStore';
import { RiResetLeftLine } from 'react-icons/ri';
import { yupResolver } from '@hookform/resolvers/yup';
import useMediaQuery from 'src/hooks/useMediaQuery';
import { generateImageURL } from 'src/shared/utils/utils';

interface ProfileStoreForm {
  control: Control<StorePayload>;
  errors: FieldErrors<StorePayload>;
  onFileChange: (file: UploadChangeParam) => void;
  errorImage: boolean;
  loading: boolean;
  setValue: UseFormSetValue<StorePayload>;
}

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

const getBase64 = (img: FileType, callback: (url: string) => void) => {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result as string));
  reader.readAsDataURL(img);
};

export default function ProfileStoreForm({ control, errors, errorImage, onFileChange, setValue }: ProfileStoreForm) {
  const { currentUser } = useAuthStore();
  const [loadingImage, setLoadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | undefined>();
  const { banks } = useStoreStore();
  type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];
  const isMobile = useMediaQuery('(max-width: 768px)');
  const handleChange: UploadProps['onChange'] = (info) => {
    if (info.file.status === 'uploading') {
      setLoadingImage(true);
      return;
    }
    if (info.file.status === 'done' || info.file.status === 'error') {
      onFileChange(info);
      getBase64(info.file.originFileObj as FileType, (url) => {
        setLoadingImage(false);
        setImagePreview(url);
      });
    }
  };

  const uploadButton = (
    <BaseButton style={{ border: 0, background: 'none' }}>
      {loadingImage ? (
        <LoadingOutlined className='text-[28px]' />
      ) : (
        <PlusOutlined className={`text-[28px] ${errorImage ? `text-danger` : `text-primary`}`} />
      )}
    </BaseButton>
  );

  useEffect(() => {
    if (currentUser) {
      setImagePreview(generateImageURL(currentUser?.currentUserStore?.store?.thumbnail));
    }
  }, [currentUser]);

  return (
    <div>
      <div className='flex justify-center'>
        <ImgCrop showGrid showReset>
          <Upload
            name='avatar'
            listType='picture-card'
            className='avatar-uploader overflow-hidden'
            showUploadList={false}
            beforeUpload={beforeUploadImage}
            onChange={handleChange}
            accept='.jpg,.png'
          >
            {imagePreview && !loadingImage ? (
              <img
                src={imagePreview}
                alt='avatar'
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '5px',
                  objectFit: 'cover'
                }}
              />
            ) : (
              uploadButton
            )}
          </Upload>
        </ImgCrop>
        {/* <p className={`${errorImage ? 'text-danger' : `text-primary`} text-[12px] mt-2`}></p> */}
      </div>
      <Field className='mt-4'>
        <Label text='Tên cửa hàng' validate={true} />
        <FormInput
          control={control}
          name='name'
          type='text'
          disabled={false}
          placeholder='Tên cửa hàng'
          errors={errors}
          size='large'
        />
      </Field>
      <div className='flex flex-col md:flex-row gap-x-10'>
        <Field className='mt-4'>
          <Label text='Email' validate={false} />
          <FormInput
            control={control}
            name='email'
            type='text'
            placeholder='Email'
            disabled={false}
            errors={errors}
            size='large'
          />
        </Field>
        <Field className='mt-4'>
          <Label text='Địa chỉ' validate={false} />
          <FormInput
            control={control}
            name='address'
            type='text'
            placeholder='Địa chỉ'
            disabled={false}
            errors={errors}
            size='large'
          />
        </Field>
      </div>
      <Field className='hideArrowsNumber mt-4'>
        <Label text='Số điện thoại' validate={false} />
        <FormInput
          control={control}
          name='phone'
          type='number'
          placeholder='Số điện thoại'
          disabled={false}
          errors={errors}
          size='large'
          className={`w-full ${!isMobile ? 'md:w-[calc(50%-20px)]' : ''}`}
        />
      </Field>
      {/* <div className='flex flex-col md:grid md:grid-cols-2 sm:gap-4'>
        <div className='flex flex-col md:flex-row'>
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
      </div> */}
      {/* <Field className='mt-4'>
          <Label text='Mã số thuế' validate={false} />
          <FormInput
            control={control}
            name='taxCode'
            type='text'
            placeholder='Nhập mã số thuế'
            errors={errors}
            size='large'
          />
        </Field> */}
      {/* <div className='flex flex-col md:flex-row gap-x-10'>
        <Field className='mt-4'>
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
        <Field className='mt-2'>
          <Label text='Màu sắc hệ thống' validate={false} />
          <div className='flex items-center gap-2'>
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
        <div className='hidden md:block text-gray-500 font-medium text-base mb-2'>Cấu hình in</div>
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
      </div> */}
      {/* <div className='mt-4'>
        <div className='hidden md:block text-gray-500 font-medium text-base mb-2'>Cấu hình thanh toán</div>
        <div className='flex flex-col md:flex-row md:gap-4'>
          <Field className='!flex-row gap-5 items-center mt-4'>
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
          <Field className='!flex-row gap-5 items-center mt-4'>
            <div>
              <Controller
                control={control}
                name='qrSoundRegistered'
                defaultValue={false}
                render={({ field }) => <Switch checked={field.value} onChange={(checked) => field.onChange(checked)} />}
              />
            </div>
            <Label text='Thông báo đơn hàng thanh toán' validate={false} />
          </Field>
        </div>
      </div> */}
      {/* <div className='mt-2 md:mt-4'>
        <div className='hidden md:block text-gray-500 font-medium text-base'>Cấu hình bếp</div>
        <div className='flex flex-col md:flex-row md:gap-4'>
          <Field className='!flex-row gap-5 items-center mt-4'>
            <div>
              <Controller
                control={control}
                name='kitchenDisabled'
                defaultValue={false}
                render={({ field }) => (
                  <Switch checked={!field.value} onChange={(checked) => field.onChange(!checked)} />
                )}
              />
            </div>
            <Label text='Chế độ bếp' validate={false} />
          </Field>
          <Field className='!flex-row gap-5 items-center mt-4'>
            <div>
              <Controller
                control={control}
                name='completingQuantityConfirmationDisabled'
                defaultValue={false}
                render={({ field }) => (
                  <Switch checked={!field.value} onChange={(checked) => field.onChange(!checked)} />
                )}
              />
            </div>
            <Label text='Xác nhận số lượng hoàn thành' validate={false} />
          </Field>
        </div>
      </div> */}

      {/* <div className='mt-4'>
        <div className='hidden md:block text-gray-500 font-medium text-base mb-2'>Cấu hình yêu cầu phục vụ</div>
        <Field className='!flex-row gap-5 items-center mt-4'>
          <div>
            <Controller
              control={control}
              name='servingQuantityConfirmationDisabled'
              defaultValue={currentUser?.currentUserStore?.store?.servingQuantityConfirmationDisabled || false}
              render={({ field }) => <Switch checked={!field.value} onChange={(checked) => field.onChange(!checked)} />}
            />
          </div>
          <Label text='Xác nhận số lượng phục vụ' validate={false} />
        </Field>
      </div> */}
    </div>
  );
}
