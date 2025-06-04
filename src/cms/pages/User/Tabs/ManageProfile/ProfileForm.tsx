import { Control, FieldErrors } from 'react-hook-form';
import Field from 'src/shared/components/Core/Field';
import Label from 'src/shared/components/Core/Label';
import FormInput from 'src/shared/components/Form/FormInput';
import useAuthStore from 'src/store/authStore';
import { ProfilePayload } from 'src/validate/userSchema';
import { GetProp, Upload, UploadProps } from 'antd';
import ImgCrop from 'antd-img-crop';
import { UploadChangeParam } from 'antd/es/upload';
import { useEffect, useState } from 'react';
import BaseButton from 'src/shared/components/Buttons/Button';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { beforeUploadImage } from 'src/shared/utils/common';
import { generateImageURL } from 'src/shared/utils/utils';

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

const getBase64 = (img: FileType, callback: (url: string) => void) => {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result as string));
  reader.readAsDataURL(img);
};

interface ProfileForm {
  control: Control<ProfilePayload>;
  errors: FieldErrors<ProfilePayload>;
  onFileChange: (file: UploadChangeParam) => void;
  errorImage: boolean;
}
export default function ProfileForm({ control, errors, errorImage, onFileChange }: ProfileForm) {
  const { currentUser } = useAuthStore();
  const [loadingImage, setLoadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | undefined>();

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
    if (currentUser) {
      setImagePreview(generateImageURL(currentUser.avatar));
    }
  }, [currentUser]);

  return (
    <div className='flex justify-center'>
      <div className='flex flex-col items-center gap-4 w-full max-w-xl'>
        <div className='w-[160px] h-[160px]'>
          <ImgCrop showGrid showReset>
            <Upload
              name='avatar'
              listType='picture-circle'
              className='avatar-uploader'
              showUploadList={false}
              beforeUpload={beforeUploadImage}
              onChange={handleChange}
              accept='.jpg,.jpeg,.png'
            >
              {imagePreview && !loadingImage ? (
                <img src={imagePreview} alt='avatar' style={{ width: '100%', borderRadius: '50%' }} />
              ) : (
                uploadButton
              )}
            </Upload>
          </ImgCrop>
        </div>

        <Field className='w-full'>
          <Label text='Tên nhân viên' validate={true} />
          <FormInput
            control={control}
            name='name'
            type='text'
            disabled={false}
            placeholder='Tên nhân viên'
            errors={errors}
            size='large'
          />
        </Field>

        <Field className='hideArrowsNumber w-full'>
          <Label text='Số điện thoại' validate={true} />
          <FormInput
            control={control}
            name='phone'
            type='number'
            placeholder='Số điện thoại'
            disabled={false}
            errors={errors}
            size='large'
          />
        </Field>
        <Field className='w-full'>
          <Label text='Địa chỉ' />
          <FormInput
            control={control}
            name='address'
            type='text'
            disabled={false}
            placeholder='Địa chỉ'
            errors={errors}
            size='large'
          />
        </Field>
      </div>
    </div>
  );
}
