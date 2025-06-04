import { GetProp, Upload } from 'antd';
import ImgCrop from 'antd-img-crop';
import { UploadChangeParam } from 'antd/es/upload';
import { UploadProps } from 'antd/lib';
import React, { useEffect, useState } from 'react';
import { Control, FieldErrors } from 'react-hook-form';
import BaseButton from 'src/shared/components/Buttons/Button';
import { beforeUploadImage } from 'src/shared/utils/common';
import { CompanyPayload } from 'src/validate/companySchema';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import Field from 'src/shared/components/Core/Field';
import Label from 'src/shared/components/Core/Label';
import FormInput from 'src/shared/components/Form/FormInput';
import useCompanyStore from 'src/store/useCompanyStore';
import { generateImageURL } from 'src/shared/utils/utils';

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

const getBase64 = (img: FileType, callback: (url: string) => void) => {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result as string));
  reader.readAsDataURL(img);
};

interface CompanyFormProps {
  control: Control<CompanyPayload>;
  errors: FieldErrors<CompanyPayload>;
  onFileChange: (file: UploadChangeParam) => void;
  errorImage: boolean;
  loading: boolean;
}

export default function CompanyForm({ control, errors, errorImage, loading, onFileChange }: CompanyFormProps) {
  const [loadingImage, setLoadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | undefined>();
  const { detailCompany } = useCompanyStore();

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
    if (detailCompany) {
      setImagePreview(generateImageURL(detailCompany.thumbnail) || '');
    }
  }, [detailCompany]);
  return (
    <div className='flex justify-center'>
      <div className='flex flex-col items-center gap-8 w-full max-w-xl'>
        <div className='text-center'>
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
                    objectFit: 'cover',
                    borderRadius: '5px'
                  }}
                />
              ) : (
                uploadButton
              )}
            </Upload>
          </ImgCrop>
          <p className={`${errorImage ? 'text-danger' : 'text-primary'} text-[12px] mt-2 text-center`}>
            Nhấn vào để thêm hình ảnh
          </p>
        </div>

        <Field className='w-full'>
          <Label text='Tên công ty' validate={true} />
          <FormInput
            control={control}
            name='name'
            type='text'
            placeholder='Tên công ty'
            disabled={false}
            errors={errors}
            size='large'
          />
        </Field>

        <div className='flex flex-col md:flex-row md:gap-4 w-full'>
          <Field className='mt-2 w-full'>
            <Label text='Mã số thuế' validate={false} />
            <FormInput
              control={control}
              name='taxCode'
              type='text'
              placeholder='Mã số thuế'
              disabled={false}
              errors={errors}
              size='large'
            />
          </Field>
        </div>

        <div className='flex flex-col md:flex-row md:gap-4 w-full'>
          <Field className='mt-2 w-full'>
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

        <div className='flex flex-col md:flex-row md:gap-4 w-full'>
          <Field className='mt-2 w-full'>
            <Label text='Đại diện pháp luật' validate={false} />
            <FormInput
              control={control}
              name='legalRepresentative'
              type='text'
              placeholder='Đại diện pháp luật'
              disabled={false}
              errors={errors}
              size='large'
            />
          </Field>
        </div>
      </div>
    </div>
  );
}
