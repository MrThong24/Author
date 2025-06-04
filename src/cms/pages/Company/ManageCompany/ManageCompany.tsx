import React, { useEffect, useState } from 'react';
import MainHeader from 'src/cms/components/Headers/MainHeader';
import BaseButton from 'src/shared/components/Buttons/Button';
import { CompanyPayload, CompanySchema } from 'src/validate/companySchema';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { RcFile, UploadChangeParam } from 'antd/es/upload';
import useCompanyStore from 'src/store/useCompanyStore';
import ModalConfirm from 'src/cms/components/Modal/ModalConfirm';
import { CiBellOn } from 'react-icons/ci';
import { Menu } from 'antd';
import { MenuProps } from 'antd/lib';
import CompanyForm from './CompanyForm';
import CompanyDetail from './CompanyDetail';
type MenuItem = Required<MenuProps>['items'][number];

export default function ManageCompany() {
  const [editCompany, setEditCompany] = useState<boolean>(false);
  const [errorImage, setErrorImage] = useState<boolean>(false);
  const [fileImage, setFileImage] = useState<RcFile | string>();
  const [openConfirmEdit, setOpenConfirmEdit] = useState<boolean>(false);
  const { isLoading, updateCompany, detailCompany, getDetailCompany } = useCompanyStore();
  const {
    control,
    reset,
    handleSubmit,
    formState: { errors }
  } = useForm<CompanyPayload>({
    resolver: yupResolver(CompanySchema)
  });
  const handleFileChange = async (info: UploadChangeParam) => {
    setFileImage(info?.file?.originFileObj);
    setErrorImage(false);
  };
  const onSubmit = async (data: CompanyPayload) => {
    await updateCompany(data, fileImage as RcFile | string);
    setOpenConfirmEdit(false);
    setEditCompany(false);
  };
  const onSubmitValidate = async () => {
    setOpenConfirmEdit(true);
  };

  useEffect(() => {
    getDetailCompany();
  }, []);

  useEffect(() => {
    if (detailCompany && editCompany) {
      reset({
        name: detailCompany?.name || '',
        taxCode: detailCompany?.taxCode || '',
        legalRepresentative: detailCompany?.legalRepresentative || '',
        address: detailCompany?.address || ''
      });
      setFileImage(detailCompany?.thumbnail || fileImage);
    }
  }, [detailCompany, editCompany]);

  return (
    <div>
      {editCompany ? (
        <CompanyForm
          control={control}
          errors={errors}
          errorImage={errorImage}
          onFileChange={handleFileChange}
          loading={isLoading}
        />
      ) : (
        <CompanyDetail />
      )}
      <div className='flex justify-center gap-6 mt-6'>
        {editCompany && (
          <BaseButton
            loading={false}
            onClick={() => {
              setEditCompany(false);
            }}
            color='danger'
            className='w-[275px]'
          >
            Huỷ
          </BaseButton>
        )}
        <BaseButton
          loading={isLoading}
          onClick={async () => {
            if (editCompany && !fileImage) {
              setErrorImage(true);
              return;
            }
            if (editCompany) await handleSubmit(onSubmitValidate)();
            else setEditCompany(true);
          }}
          className='w-[275px]'
        >
          {editCompany ? 'Lưu' : 'Chỉnh sửa'}
        </BaseButton>
      </div>
      <ModalConfirm
        isOpen={openConfirmEdit}
        onClose={() => setOpenConfirmEdit(false)}
        onConfirm={handleSubmit(onSubmit)}
        loading={isLoading}
        icon={<CiBellOn />}
      >
        Bạn muốn lưu các thay đổi?
      </ModalConfirm>
    </div>
  );
}
