import { notification, Skeleton, Table, TableColumnsType } from 'antd';
import Field from 'src/shared/components/Core/Field';
import Label from 'src/shared/components/Core/Label';
import useEmployeeStore from 'src/store/useEmployeeStore';
import { RiKey2Line, RiResetLeftLine } from 'react-icons/ri';
import { useState } from 'react';
import ModalPreviewPassword from '../components/ModalPreviewPassword';
import ModalConfirm from 'src/cms/components/Modal/ModalConfirm';
import { roleOwnerTypes } from 'src/shared/common/constant';
import { UserStore } from 'src/types/user.type';
import useAuthStore from 'src/store/authStore';

export default function EmployeeDetail() {
  const {
    detailEmployee,
    isLoading,
    resetPasswordEmployee,
    isLoadingResetPassword,
    dataResetPassword,
    listPosUser,
    loadingPosUser
  } = useEmployeeStore();
  const { currentUser } = useAuthStore();

  const [openConfirm, setOpenConfirm] = useState<boolean>(false);
  const [openPreviewPassword, setOpenPreviewPassword] = useState<boolean>(false);
  const handleOpenModalConfirm = async () => {
    setOpenConfirm(true);
  };
  const handleResetPassword = async () => {
    try {
      await resetPasswordEmployee(detailEmployee?.id as string);
      setOpenConfirm(false);
      setOpenPreviewPassword(true);
    } catch (error) {}
  };

  const handleCopyPassword = async () => {
    try {
      await navigator?.clipboard?.writeText(dataResetPassword || '');
      notification.success({
        message: 'Sao chép mật khẩu thành công'
      });
    } catch (err) {
      notification.error({
        message: 'Sao chép mật khẩu thất bại'
      });
    }
  };
  const getRoleLabel = (role: string) => {
    return roleOwnerTypes.find((r) => r.value === role)?.label || 'Chủ cửa hàng';
  };
  const columns: TableColumnsType<UserStore> = [
    { title: 'Tên cửa hàng', width: '50%', render: (value: UserStore) => <div>{value?.store?.name}</div> },
    {
      title: 'Vai trò',
      width: '50%',
      render: (value: UserStore) => <div>{getRoleLabel(value?.role)}</div>
    }
  ];
  return (
    <div>
      <div className='flex flex-col md:flex-row gap-x-10'>
        <Field className='mt-2 mb-3 md:mb-10'>
          <Label text='Tên nhân viên' validate={true} />
          {isLoading || loadingPosUser ? (
            <Skeleton.Input active style={{ width: '100%' }} />
          ) : (
            <div className='w-full h-[44px] px-3 py-3 text-sm border-gray-200 rounded-md bg-white flex items-center shadow-sm'>
              {detailEmployee?.name}
            </div>
          )}
        </Field>
        {/* <Field className='mt-2 mb-10'>
          <Label text='Phân quyền vai trò' validate={true} />
          {isLoading ? (
            <Skeleton.Input active style={{ width: '100%' }} />
          ) : (
            <h2>{detailEmployee?.userStores[0].role === RoleType.STAFF ? 'Nhân viên' : 'Chủ cửa hàng'}</h2>
          )}
        </Field> */}
      </div>
      <div className='flex flex-col md:flex-row gap-x-10'>
        <Field className='mt-2 mb-3 md:mb-10'>
          <Label text='Số điện thoại' validate={true} />
          {isLoading || loadingPosUser ? (
            <Skeleton.Input active style={{ width: '100%' }} />
          ) : (
            <div className='w-full h-[44px] px-3 py-3 text-sm border-gray-200 rounded-md bg-white flex items-center shadow-sm'>
              {detailEmployee?.phone}
            </div>
          )}
        </Field>
        <Field className='mt-2 mb-3 md:mb-10'>
          <Label text='Địa chỉ' />
          {isLoading || loadingPosUser ? (
            <Skeleton.Input active style={{ width: '100%' }} />
          ) : (
            <div className='w-full h-[44px] px-3 py-3 text-sm border-gray-200 rounded-md bg-white flex items-center shadow-sm'>
              {detailEmployee?.address}
            </div>
          )}
        </Field>
      </div>
      <div className='flex flex-col md:flex-row gap-x-10'>
        <Field className='mt-2 mb-3 md:mb-10'>
          <Label text='Tài khoản' validate={true} />
          {isLoading || loadingPosUser ? (
            <Skeleton.Input active style={{ width: '100%' }} />
          ) : (
            <div className='bg-gray-100 rounded w-full h-[44px] px-3 py-3 text-sm text-black'>
              {detailEmployee?.username}
            </div>
          )}
        </Field>
        <Field className='mt-2 mb-3 md:mb-10'>
          <Label text='Mật khẩu' validate={true} />
          {isLoading || loadingPosUser ? (
            <Skeleton.Input active style={{ width: '100%' }} />
          ) : (
            <div className='flex items-center justify-start gap-6'>
              <div className='flex-1 bg-gray-100 rounded w-full h-[44px] px-3 py-3 text-sm text-black'>••••••••••</div>
              <div
                className='cursor-pointer h-[44px] flex flex-col items-center justify-center text-gray-600 hover:text-black'
                onClick={handleOpenModalConfirm}
              >
                <RiResetLeftLine className='text-[24px] rotate-[-90deg]' />
                <span className='text-[11px] leading-none mt-[4px] font-medium'>Đặt lại</span>
              </div>
            </div>
          )}
        </Field>
      </div>
      {currentUser?.currentUserStore?.store?.company?.posIntegration && (
        <div className='flex flex-col md:flex-row gap-x-10'>
          <Field className='mt-2 mb-3 md:mb-10'>
            <Label text='Kết nối nhân viên MobiFone 1POS' validate={true} />
            {isLoading || loadingPosUser ? (
              <Skeleton.Input active style={{ width: '100%' }} />
            ) : (
              <div className='w-full h-[44px] px-3 py-3 text-sm border-gray-200 rounded-md bg-white flex items-center shadow-sm'>
                <div className='w-full h-[44px] px-3 py-3 text-sm border-gray-200 rounded-md bg-white flex items-center shadow-sm'>
                  {listPosUser?.find((item) => item?.user_id === detailEmployee?.posUserId)?.user_name || ''}
                </div>
              </div>
            )}
          </Field>
          <Field className='mt-2 mb-3 md:mb-10'>{''}</Field>
        </div>
      )}
      <div className='flex flex-col justify-between mt-6'>
        <Label text='Danh sách cửa hàng phân công' validate={true} />
        <Table dataSource={detailEmployee?.userStores} columns={columns} pagination={false} />
      </div>
      <ModalConfirm
        isOpen={openConfirm}
        onClose={() => setOpenConfirm(false)}
        onConfirm={handleResetPassword}
        loading={isLoadingResetPassword}
        icon={<RiKey2Line />}
      >
        <div className='text-center'>Bạn chắc chắn muốn tái tạo mật khẩu mới cho người dùng này không?</div>
      </ModalConfirm>
      <ModalPreviewPassword
        isOpen={openPreviewPassword}
        onClose={() => setOpenPreviewPassword(false)}
        onConfirm={handleCopyPassword}
      />
    </div>
  );
}
