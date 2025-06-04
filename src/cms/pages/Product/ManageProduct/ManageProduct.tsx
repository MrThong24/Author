import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { ProductPayload, productSchema } from 'src/validate/productSchema';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useState } from 'react';
import BaseButton from 'src/shared/components/Buttons/Button';
import ProductForm from './ProductForm';
import { UploadChangeParam } from 'antd/es/upload';
import useProductStore from 'src/store/useProductStore';
import { RcFile } from 'antd/lib/upload';
import useCategoryProductStore from 'src/store/useCategoryProductStore';
import DetailHeader from 'src/cms/components/Headers/DetailHeader';
import ProductDetail from './ProductDetail';
import ModalDelete from 'src/cms/components/Modal/ModalDelete';
import { generateImageURL } from 'src/shared/utils/utils';
import { LanguageCode } from 'src/shared/common/enum';
import useStoreStore from 'src/store/useStoreStore';

export default function ManageProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoading, createProduct, getDetailProduct, updateProduct, deleteProducts, detailProduct, getUnits, unit } =
    useProductStore();
  const { categoryProduct, fetchCategoryProduct } = useCategoryProductStore();
  const { productSettings, fetchProductSettings } = useStoreStore();
  const [errorImage, setErrorImage] = useState<boolean>(false);
  const [fileImage, setFileImage] = useState<RcFile | string>();
  const [editProduct, setEditProduct] = useState<boolean>(false);
  const [openModalDelete, setOpenModalDelete] = useState<boolean>(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm<ProductPayload>({
    resolver: yupResolver(productSchema)
  });

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'productTypeId') {
        const selectedSetting = productSettings.find((setting) => setting.id === value.productTypeId);
        setValue('discountPercent', selectedSetting?.discountPercent || 0);
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, setValue, productSettings]);
  const handleFileChange = async (info: UploadChangeParam) => {
    setFileImage(info?.file?.originFileObj);
    setErrorImage(false);
  };
  const onSubmit = async (data: ProductPayload) => {
    if (!fileImage && !detailProduct?.thumbnail) {
      setErrorImage(true);
      return;
    }
    const updatedData: ProductPayload = {
      ...data,
      translations: data?.translations?.map((item) => ({
        ...item,
        languageCode: LanguageCode.ENGLISH
      }))
    };
    try {
      if (detailProduct?.thumbnail) {
        await updateProduct(detailProduct.id, updatedData, fileImage as RcFile | string);
        await getDetailProduct(detailProduct.id);
        setEditProduct(false);
      } else {
        await createProduct(updatedData, fileImage as RcFile);
        navigate(-1);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (id) {
      getDetailProduct(id);
    }
  }, [id]);

  useEffect(() => {
    if (detailProduct && id) {
      reset({
        name: detailProduct?.name || '',
        unit: detailProduct?.unit || '',
        price: detailProduct?.price,
        productCategoryId: detailProduct?.productCategory?.id,
        description: detailProduct?.description || '',
        discountPercent: detailProduct?.productType?.discountPercent ?? 0,
        translations: [
          {
            description: detailProduct?.translations?.[0]?.description || '',
            languageCode: LanguageCode.ENGLISH,
            name: detailProduct?.translations?.[0]?.name || ''
          }
        ],
        productTypeId: detailProduct?.productTypeId || ''
      });
      setFileImage(detailProduct?.thumbnail);
    }
  }, [detailProduct, id]);

  useEffect(() => {
    getUnits();
    fetchCategoryProduct();
    fetchProductSettings();
  }, []);

  const handleDeleteProduct = async () => {
    try {
      await deleteProducts([id as string]);
      navigate(-1);
    } catch (error) {
      setOpenModalDelete(false);
    }
  };
  return (
    <DetailHeader
      title={`${id ? (editProduct ? 'Chỉnh sửa' : 'Chi tiết') : 'Tạo mới'} sản phẩm`}
      handleBack={() => navigate(-1)}
    >
      <div className='flex flex-col gap-6 justify-between'>
        {!id || editProduct ? (
          <ProductForm
            errorImage={errorImage}
            listCategory={categoryProduct}
            productSettings={productSettings}
            control={control}
            errors={errors}
            listUnit={unit}
            loading={isLoading}
            onFileChange={handleFileChange}
          />
        ) : (
          <ProductDetail />
        )}
        <div className={`flex justify-center gap-x-4 mb-10 ${!editProduct ? 'mt-20' : undefined}`}>
          <BaseButton
            disabled={isLoading}
            onClick={() => {
              if (editProduct) {
                setEditProduct(false);
                reset({
                  name: detailProduct?.name || '',
                  unit: detailProduct?.unit || '',
                  price: detailProduct?.price,
                  productCategoryId: detailProduct?.productCategory?.id,
                  description: detailProduct?.description || '',
                  discountPercent: detailProduct?.discountPercent || 0,
                  translations: [
                    {
                      description: detailProduct?.translations?.[0]?.description || '',
                      languageCode: LanguageCode.ENGLISH,
                      name: detailProduct?.translations?.[0]?.name || ''
                    }
                  ],
                  productTypeId: detailProduct?.productTypeId || ''
                });
                setFileImage(detailProduct?.thumbnail);
              } else {
                if (!id) {
                  navigate(-1);
                } else setOpenModalDelete(true);
              }
            }}
            color='danger'
            className='w-[120px]'
          >
            {editProduct || !id ? 'Huỷ' : 'Xoá'}
          </BaseButton>

          <BaseButton
            loading={isLoading}
            onClick={async () => {
              if ((editProduct || !id) && !fileImage && !detailProduct?.thumbnail) {
                setErrorImage(true);
              }
              if (editProduct || !id) await handleSubmit(onSubmit)();
              else setEditProduct(true);
            }}
            className='w-[120px]'
          >
            {editProduct || !id ? 'Lưu' : 'Chỉnh sửa'}
          </BaseButton>
        </div>
        <ModalDelete
          loading={isLoading}
          isOpen={openModalDelete}
          onClose={() => setOpenModalDelete(false)}
          onConfirm={handleDeleteProduct}
        >
          <h2>Bạn muốn xoá sản phẩm này?</h2>
        </ModalDelete>
      </div>
    </DetailHeader>
  );
}
