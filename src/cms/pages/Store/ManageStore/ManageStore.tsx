import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import BaseButton from 'src/shared/components/Buttons/Button';
import { yupResolver } from '@hookform/resolvers/yup';
import { storeSchema, StorePayload } from 'src/validate/userSchema';
import { RcFile, UploadChangeParam } from 'antd/es/upload';
import StoreDetail from './StoreDetail';
import DetailHeader from 'src/cms/components/Headers/DetailHeader';
import { useNavigate, useParams } from 'react-router-dom';
import StoreForm from './StoreForm';
import useStoreStore from 'src/store/useStoreStore';
import ModalDelete from 'src/cms/components/Modal/ModalDelete';
import { generateImageURL } from 'src/shared/utils/utils';

export default function ManageStore() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { updateStore, isLoading, getBanks, deleteStores } = useStoreStore();
  const { getDetailStore, detailStore, createStore } = useStoreStore();
  const [editStore, setEditStore] = useState<boolean>(false);
  const [errorImage, setErrorImage] = useState<boolean>(false);
  const [fileImage, setFileImage] = useState<RcFile | string>();
  const [openModalDelete, setOpenModalDelete] = useState<boolean>(false);
  const {
    control,
    reset,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<StorePayload>({
    defaultValues: { primaryColor: '#005FAB' },
    resolver: yupResolver(storeSchema)
  });

  const onSubmit = async (data: StorePayload) => {
    if (!fileImage && !detailStore?.thumbnail) {
      setErrorImage(true);
      return;
    }
    try {
      if (!id) {
        await createStore(data, fileImage as RcFile | string);
        navigate(-1);
      } else {
        await updateStore(detailStore?.id as string, data, fileImage as RcFile | string);
        await getDetailStore(id);
        setEditStore(false);
      }
    } catch (error) {}
  };

  const handleFileChange = async (info: UploadChangeParam) => {
    setFileImage(info?.file?.originFileObj);
    setErrorImage(false);
  };

  useEffect(() => {
    if (detailStore && editStore && id) {
      reset({
        name: detailStore?.name || '',
        phone: detailStore?.phone || '',
        address: detailStore?.address || '',
        email: detailStore?.email || '',
        slogan: detailStore?.slogan || '',
        bankBin: detailStore?.bankBin ?? undefined,
        bankNumber: detailStore?.bankNumber || '',
        accountHolder: detailStore?.accountHolder || '',
        primaryColor: detailStore?.primaryColor || '#005FAB',
        kitchenDisabled: detailStore?.kitchenDisabled || false,
        servingQuantityConfirmationDisabled: detailStore?.servingQuantityConfirmationDisabled || false,
        completingQuantityConfirmationDisabled: detailStore?.completingQuantityConfirmationDisabled || false,
        qrSoundRegistered: detailStore?.qrSoundRegistered || false,
        taxCode: detailStore?.taxCode || ''
      });
      setFileImage(detailStore?.thumbnail || fileImage);
      setErrorImage(false);
    }
  }, [detailStore, editStore]);

  useEffect(() => {
    getBanks();
  }, []);

  useEffect(() => {
    if (id) {
      getDetailStore(id as string);
    }
  }, [id]);

  const handleDeleteStore = async () => {
    try {
      await deleteStores([id as string]);
      navigate(-1);
    } catch (error) {
      setOpenModalDelete(false);
    }
  };
  return (
    <DetailHeader
      title={`${id ? (editStore ? 'Chỉnh sửa' : 'Chi tiết') : 'Tạo mới'} cửa hàng`}
      handleBack={() => navigate(-1)}
    >
      {editStore || !id ? (
        <StoreForm
          loading={isLoading}
          onFileChange={handleFileChange}
          control={control}
          errors={errors}
          errorImage={errorImage}
          setValue={setValue}
        />
      ) : (
        <StoreDetail />
      )}
      <div className='flex items-center gap-6 justify-center mt-10 mb-16'>
        <BaseButton
          disabled={isLoading}
          onClick={() => {
            editStore ? (setEditStore(false), setFileImage('')) : !id ? navigate(-1) : setOpenModalDelete(true);
          }}
          color='danger'
          className='w-[120px]'
        >
          {editStore || !id ? 'Huỷ' : 'Xoá'}
        </BaseButton>

        <BaseButton
          loading={isLoading}
          onClick={async () => {
            if ((editStore || !id) && !fileImage && !detailStore?.thumbnail) {
              setErrorImage(true);
            }
            if (editStore || !id) await handleSubmit(onSubmit)();
            else setEditStore(true);
          }}
          className='w-[120px]'
        >
          {editStore || !id ? 'Lưu thông tin' : 'Chỉnh sửa'}
        </BaseButton>
      </div>
      <ModalDelete
        loading={isLoading}
        isOpen={openModalDelete}
        onClose={() => setOpenModalDelete(false)}
        onConfirm={handleDeleteStore}
      >
        <h2>Bạn muốn xoá cửa hàng này?</h2>
      </ModalDelete>
    </DetailHeader>
  );
}
