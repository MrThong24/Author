import { ColorPicker, GetProp, Space, Switch, Upload, UploadProps } from 'antd';
import ImgCrop from 'antd-img-crop';
import { UploadChangeParam } from 'antd/es/upload';
import { useEffect, useState } from 'react';
import { Control, Controller, FieldErrors, UseFormSetValue } from 'react-hook-form';
import BaseButton from 'src/shared/components/Buttons/Button';
import Field from 'src/shared/components/Core/Field';
import Label from 'src/shared/components/Core/Label';
import FormInput from 'src/shared/components/Form/FormInput';
import { StorePayload } from 'src/validate/userSchema';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { beforeUploadImage } from 'src/shared/utils/common';
import FormSelect from 'src/shared/components/Form/FormSelect';
import { RiResetLeftLine } from 'react-icons/ri';
import useStoreStore from 'src/store/useStoreStore';
import { generateImageURL } from 'src/shared/utils/utils';

interface StoreFormProps {
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

export default function StoreForm({ control, errors, errorImage, onFileChange, loading, setValue }: StoreFormProps) {
  const [loadingImage, setLoadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | undefined>();
  const { banks } = useStoreStore();
  const { detailStore } = useStoreStore();

  type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

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
    if (detailStore) {
      setImagePreview(generateImageURL(detailStore?.thumbnail));
    }
  }, [detailStore]);

  return (
    <div>
      <div className='flex justify-center flex-col items-center'>
        <ImgCrop showGrid showReset>
          <Upload
            name='avatar'
            listType='picture-card'
            className='avatar-uploader overflow-hidden'
            showUploadList={false}
            beforeUpload={beforeUploadImage}
            onChange={handleChange}
            accept='.jpg,.png'
            disabled={loading}
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
        <p className={`${errorImage ? 'text-danger' : `text-primary`} text-[12px] mt-2`}>Nhấn vào để thêm hình ảnh</p>
      </div>
      <Field className='mt-4'>
        <Label text='Tên cửa hàng' validate={true} />
        <FormInput
          control={control}
          name='name'
          type='text'
          disabled={loading}
          placeholder='Nhập tên cửa hàng'
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
            placeholder='Nhập email'
            disabled={loading}
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
            placeholder='Nhập địa chỉ'
            disabled={loading}
            errors={errors}
            size='large'
          />
        </Field>
      </div>
      <div className='flex flex-col md:flex-row gap-x-10'>
        <Field className='hideArrowsNumber mt-4'>
          <Label text='Số điện thoại' validate={false} />
          <FormInput
            control={control}
            name='phone'
            type='number'
            placeholder='Nhập số điện thoại'
            disabled={loading}
            errors={errors}
            size='large'
            onInput={(e) => {
              const input = e.target as HTMLInputElement;
              input.value = input.value.replace(/[^0-9]/g, '');
            }}
          />
        </Field>
        <Field className='mt-4'>
          <Label text='Slogan' validate={true} />
          <div className='group'>
            <FormInput
              rows={3}
              control={control}
              name='slogan'
              type='textarea'
              disabled={loading}
              placeholder='Nhập slogan'
              errors={errors}
              size='large'
            />
          </div>
        </Field>
      </div>
      <div className='flex flex-col md:flex-row gap-x-10'>
        <Field className='mt-4'>
          <Label text='Tên chủ tài khoản' validate={false} />
          <FormInput
            control={control}
            name='accountHolder'
            type='text'
            placeholder='Nhập tên chủ tài khoản'
            disabled={loading}
            errors={errors}
            size='large'
          />
        </Field>
        <Field className='mt-4'>
          <Label text='Ngân hàng' validate={false} />
          <FormSelect
            control={control}
            disabled={loading}
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
      <div className='flex flex-col md:flex-row gap-x-10'>
        <Field className='mt-4'>
          <Label text='Số tài khoản' validate={false} />
          <FormInput
            control={control}
            name='bankNumber'
            type='text'
            placeholder='Nhập số tài khoản'
            disabled={loading}
            errors={errors}
            size='large'
          />
        </Field>
        <Field className='mt-4'>
          <Label text='Mã số thuế' validate={false} />
          <FormInput
            control={control}
            name='taxCode'
            type='text'
            placeholder='Nhập mã số thuế'
            disabled={loading}
            errors={errors}
            size='large'
          />
        </Field>
      </div>
      <Field className='mt-2'>
        <Label text='Màu sắc hệ thống' validate={false} />
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
                disabled={loading}
                onChange={(value) => {
                  field.onChange(value?.toHexString());
                }}
                className='w-fit'
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
      {/* <Field className='!flex-row gap-5 items-center mt-6'>
        <Label text='Chế độ bếp' validate={false} />
        <div>
          <Controller
            control={control}
            name='kitchenDisabled'
            defaultValue={false}
            render={({ field }) => <Switch checked={!field.value} onChange={(checked) => field.onChange(!checked)} />}
          />
        </div>
      </Field> */}
      {/* <div className='flex flex-col md:flex-row gap-x-10'>
        <Field className='!flex-row gap-5 items-center mt-6'>
          <Label text='Xác nhận số lượng phục vụ' validate={false} />
          <div>
            <Controller
              control={control}
              name='servingQuantityConfirmationDisabled'
              defaultValue={false}
              render={({ field }) => <Switch checked={!field.value} onChange={(checked) => field.onChange(!checked)} />}
            />
          </div>
        </Field>
        <Field className='!flex-row gap-5 items-center mt-6'>
          <Label text='Xác nhận số lượng hoàn thành' validate={false} />
          <div>
            <Controller
              control={control}
              name='completingQuantityConfirmationDisabled'
              defaultValue={false}
              render={({ field }) => <Switch checked={!field.value} onChange={(checked) => field.onChange(!checked)} />}
            />
          </div>
        </Field>
      </div> */}
    </div>
  );
}
