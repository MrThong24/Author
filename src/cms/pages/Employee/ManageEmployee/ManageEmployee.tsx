import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import BaseButton from 'src/shared/components/Buttons/Button';
import DetailHeader from 'src/cms/components/Headers/DetailHeader';
import { useNavigate, useParams } from 'react-router-dom';
import EmployeeForm from './EmployeeForm';
import { useEffect, useState } from 'react';
import {
  EmployeePayload,
  EmployeePayloadWithOutPassword,
  employeeSchema,
  employeeSchemaWithoutPassword
} from 'src/validate/employeeSchema';
import useEmployeeStore from 'src/store/useEmployeeStore';
import { roleManagerTypes, roleOwnerTypes } from 'src/shared/common/constant';
import EmployeeDetail from './EmployeeDetail';
import ModalDelete from 'src/cms/components/Modal/ModalDelete';
import useAuthStore from 'src/store/authStore';
import { RoleType } from 'src/shared/common/enum';
import { AxiosResponse } from 'axios';
import http from 'src/shared/utils/http';
import { Store } from 'antd/es/form/interface';
import useStoreStore from 'src/store/useStoreStore';

export default function ManageEmployee() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [listStoreOwner, setListStoreOwner] = useState<Store[]>([]);
  const {
    isLoading,
    createEmployee,
    getDetailEmployee,
    detailEmployee,
    updateEmployee,
    deleteEmployees,
    getListPosUser,
    loadingPosUser
  } = useEmployeeStore();

  const { currentUser } = useAuthStore();

  const [editEmployee, setEditEmployee] = useState<boolean>(false);
  const [openModalDelete, setOpenModalDelete] = useState<boolean>(false);
  const {
    control,
    reset,
    watch,
    handleSubmit,
    setValue,
    clearErrors,
    formState: { errors }
  } = useForm<EmployeePayload | EmployeePayloadWithOutPassword>({
    resolver: yupResolver(
      id
        ? employeeSchemaWithoutPassword(currentUser?.currentUserStore?.store?.company?.posIntegration || false)
        : employeeSchema(currentUser?.currentUserStore?.store?.company?.posIntegration || false)
    ),
    defaultValues: {
      userStores: [
        {
          key: Date.now(),
          role: '',
          storeId: ''
        }
      ]
    }
  });

  const fetchStoresData = async () => {
    try {
      const response: AxiosResponse = await http.get('/store');
      setListStoreOwner(response.data.data);
    } catch (error) {}
  };
  useEffect(() => {
    if (currentUser?.currentUserStore.role === RoleType.STORE_OWNER) {
      fetchStoresData();
    }
  }, [currentUser]);

  const userStores = watch('userStores');

  const onSubmit = async (data: EmployeePayload | EmployeePayloadWithOutPassword) => {
    try {
      const dataToSubmit: EmployeePayloadWithOutPassword = {
        ...data,
        userStores: data?.userStores?.map((item) => ({
          role: item?.role,
          storeId: item.storeId
        }))
      };

      if (id) {
        if ('username' in dataToSubmit) {
          delete dataToSubmit.username;
        }
        await updateEmployee(id, dataToSubmit);
        await getDetailEmployee(id);
        setEditEmployee(false);
      } else {
        await createEmployee(dataToSubmit);
        navigate(-1);
      }
    } catch (error) {
      console.error('Error during employee submit:', error);
    }
  };

  const handleDeleteEmployee = async () => {
    try {
      await deleteEmployees([id as string]);
      navigate(-1);
    } catch (error) {
      setOpenModalDelete(false);
    }
  };

  useEffect(() => {
    if (id) {
      getDetailEmployee(id);
    }
  }, [id]);

  useEffect(() => {
    if (detailEmployee && id && editEmployee) {
      reset({
        name: detailEmployee?.name,
        phone: detailEmployee?.phone,
        address: detailEmployee?.address || '',
        username: detailEmployee?.username,
        userStores: detailEmployee?.userStores.map((item) => ({
          role: item?.role,
          storeId: item?.storeId
        })),
        posUserId: detailEmployee?.posUserId || ''
      });
    }
  }, [detailEmployee, id, editEmployee]);

  useEffect(() => {
    if (currentUser?.currentUserStore?.store?.company?.posIntegration) {
      getListPosUser();
    }
  }, []);
  return (
    <DetailHeader
      title={`${id ? (editEmployee ? 'Chỉnh sửa' : 'Chi tiết') : 'Tạo mới'} nhân viên`}
      handleBack={() => navigate(-1)}
    >
      {editEmployee || !id ? (
        <EmployeeForm
          control={control}
          errors={errors}
          clearErrors={clearErrors}
          listRole={currentUser?.currentUserStore.role === RoleType.STORE_OWNER ? roleOwnerTypes : roleManagerTypes}
          loading={isLoading || loadingPosUser}
          id={id}
          userStores={userStores}
          setValue={setValue}
          listStore={
            currentUser?.currentUserStore.role === RoleType.STORE_OWNER
              ? listStoreOwner?.map((item) => ({
                  label: item.name,
                  value: item.id
                }))
              : currentUser?.userStores?.map((item) => ({
                  label: item.store.name,
                  value: item.store.id
                }))
          }
        />
      ) : (
        <EmployeeDetail />
      )}

      <div className={`flex justify-center gap-x-4 ${!editEmployee ? 'mt-20' : 'mt-20'}`}>
        <BaseButton
          disabled={isLoading || loadingPosUser}
          onClick={() => {
            if (editEmployee) {
              setEditEmployee(false);
            } else {
              if (!id) {
                navigate(-1);
              } else {
                setOpenModalDelete(true);
              }
            }
          }}
          color='danger'
          className='w-[120px]'
        >
          {editEmployee || !id ? 'Huỷ' : 'Xoá'}
        </BaseButton>

        <BaseButton
          loading={isLoading || loadingPosUser}
          onClick={async () => {
            if (editEmployee || !id) await handleSubmit(onSubmit)();
            else setEditEmployee(true);
          }}
          className='w-[120px]'
        >
          {editEmployee || !id ? 'Lưu' : 'Chỉnh sửa'}
        </BaseButton>
      </div>
      <ModalDelete
        loading={isLoading}
        isOpen={openModalDelete}
        onClose={() => setOpenModalDelete(false)}
        onConfirm={handleDeleteEmployee}
      >
        <h2>Bạn muốn xoá nhân viên này?</h2>
      </ModalDelete>
    </DetailHeader>
  );
}
