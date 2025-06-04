import { Control, FieldErrors } from 'react-hook-form';
import FormInput from 'src/shared/components/Form/FormInput';
import { message, Upload } from 'antd';
import { useEffect, useState } from 'react';
import type { GetProp, UploadProps } from 'antd';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import Label from 'src/shared/components/Core/Label';
import FormSelect from 'src/shared/components/Form/FormSelect';
import { UploadChangeParam } from 'antd/es/upload';
import { ListUnit } from 'src/types/product.type';
import useProductStore from 'src/store/useProductStore';
import { useParams } from 'react-router-dom';
import ImgCrop from 'antd-img-crop';
import { ProductCategory } from 'src/types/categoryProduct.type';
import { ProductPayload } from 'src/validate/productSchema';
import BaseButton from 'src/shared/components/Buttons/Button';
import { beforeUploadImage } from 'src/shared/utils/common';
import { generateImageURL } from 'src/shared/utils/utils';
import { ProductSettings } from 'src/types/store.type';
import NoData from 'src/cms/components/NoData/NoData';

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

const getBase64 = (img: FileType, callback: (url: string) => void) => {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result as string));
  reader.readAsDataURL(img);
};

interface PersonnelFormProps {
  control: Control<ProductPayload>;
  errors: FieldErrors<ProductPayload>;
  onFileChange: (file: UploadChangeParam) => void;
  listCategory: ProductCategory[];
  productSettings: ProductSettings[];
  listUnit: ListUnit[];
  errorImage: boolean;
  loading: boolean;
}

export default function ProductForm({
  control,
  errors,
  errorImage,
  loading,
  listCategory,
  productSettings,
  listUnit,
  onFileChange
}: PersonnelFormProps) {
  const { id } = useParams();
  const { detailProduct } = useProductStore();
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
    if (detailProduct && id) {
      setImagePreview(generateImageURL(detailProduct.thumbnail));
    }
  }, [detailProduct, id]);
  return (
    <div>
      <div className='flex flex-col gap-4 md:flex-row'>
        <div className='text-center'>
          <ImgCrop showGrid showReset>
            <Upload
              name='avatar'
              listType='picture-card'
              className='avatar-uploader'
              showUploadList={false}
              beforeUpload={beforeUploadImage}
              onChange={handleChange}
              disabled={loading}
              accept='.jpg,.png'
            >
              {imagePreview && !loadingImage ? (
                <img
                  src={imagePreview}
                  alt='avatar'
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                uploadButton
              )}
            </Upload>
          </ImgCrop>
          <p className={`${errorImage ? 'text-danger' : `text-primary`} text-[14px] mt-2`}>Nhấn vào để thêm hình ảnh</p>
        </div>
        <div className='flex flex-col md:flex-row flex-1 gap-4'>
          <div className='flex-1'>
            <Label text='Tên sản phẩm' className='mb-2' validate={true} />
            <FormInput
              disabled={loading}
              control={control}
              name='name'
              placeholder='Tên sản phẩm'
              errors={errors}
              size='large'
            />
          </div>
          <div className='flex-1'>
            <Label text='Tên tiếng anh' className='mb-2' validate={true} />
            <FormInput
              disabled={loading}
              control={control}
              name={`translations.${0}.name`}
              placeholder='Tên tiếng Anh'
              errors={errors?.translations?.[0]?.name}
              size='large'
            />
          </div>
        </div>
      </div>
      <div className='flex flex-col md:flex-row gap-x-10 mt-4'>
        <div className='flex flex-col flex-1 gap-y-1 lg:mt-6'>
          <Label text='Danh mục' validate={true} />
          <FormSelect
            disabled={loading}
            placeholder='Danh mục'
            control={control}
            name='productCategoryId'
            options={listCategory.map((category) => ({
              label: category.name,
              value: category.id
            }))}
            errors={errors}
            size='large'
          />
        </div>
        <div className='flex flex-col flex-1 gap-y-1 lg:mt-6'>
          <Label text='Đơn vị' validate={true} />
          <FormSelect
            placeholder='Đơn vị'
            control={control}
            disabled={loading}
            name='unit'
            options={listUnit.map((unit) => ({
              label: unit.name,
              value: unit.name
            }))}
            errors={errors}
            size='large'
          />
        </div>
        <div className='flex flex-col flex-1 gap-y-1 lg:mt-6'>
          <Label text='Giá' validate={true} />
          <FormInput
            control={control}
            name='price'
            disabled={loading}
            type='number'
            placeholder='Giá'
            errors={errors}
            size='large'
            onInput={(e) => {
              const input = e.target as HTMLInputElement;
              input.value = input.value.replace(/[^0-9]/g, '');
            }}
          />
        </div>
      </div>
      <div className='flex flex-col md:flex-row gap-x-10 mt-4'>
        <div className='flex flex-col flex-1 gap-y-1 lg:mt-6'>
          <Label text='Phân loại sản phẩm' validate={true} />
          <FormSelect
            disabled={loading}
            placeholder='Phân loại sản phẩm'
            control={control}
            name='productTypeId'
            options={productSettings.map((category) => ({
              label: category.name,
              value: category.id
            }))}
            errors={errors}
            notFoundContent={<NoData />}
            size='large'
          />
        </div>
        <div className='flex flex-col flex-1 gap-y-1 lg:mt-6'>
          <Label text='Giảm trừ hoá đơn bán hàng' validate={true} />
          <FormInput
            control={control}
            name='discountPercent'
            disabled={true}
            type='number'
            defaultValue={0}
            min={0}
            placeholder='Giảm trừ hoá đơn bán hàng'
            errors={errors}
            size='large'
            suffix='%'
          />
        </div>
        <div className='flex flex-col flex-1'></div>
      </div>
      <div className='mt-4 md:mt-10'>
        <Label text='Mô tả' validate={false} />
        <FormInput
          type='textarea'
          disabled={loading}
          control={control}
          name='description'
          placeholder='Mô tả'
          errors={errors}
          size='large'
        />
      </div>
      <div className='mt-4'>
        <Label text='Mô tả tiếng anh (ENG)' validate={false} />
        <FormInput
          type='textarea'
          disabled={loading}
          control={control}
          name={`translations.${0}.description`}
          placeholder='Mô tả tiếng anh'
          errors={errors?.translations?.[0]?.description}
          size='large'
        />
      </div>
    </div>
  );
}
