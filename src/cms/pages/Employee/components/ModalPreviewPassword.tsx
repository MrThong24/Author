import { Button, Modal } from 'antd';
import React from 'react';
import { MdOutlineContentCopy } from 'react-icons/md';
import BaseButton from 'src/shared/components/Buttons/Button';
import Field from 'src/shared/components/Core/Field';
import Label from 'src/shared/components/Core/Label';
import useEmployeeStore from 'src/store/useEmployeeStore';

interface ModalConfirmResetPassword {
  onClose: () => void;
  onConfirm: () => void;
  icon?: React.ReactNode;
  isOpen: boolean;
  loading?: boolean;
}

const ModalPreviewPassword: React.FC<ModalConfirmResetPassword> = ({ isOpen, onClose, onConfirm }) => {
  const { dataResetPassword } = useEmployeeStore();
  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={
        <div className='flex flex-row gap-4'>
          <BaseButton variant='outlined' key='confirm' className='py-5 flex-1 text-[16px]' onClick={onClose}>
            Đóng
          </BaseButton>
          <BaseButton key='cancel' onClick={onConfirm} className='text-white py-5 flex-1'>
            Sao chép
          </BaseButton>
        </div>
      }
      className='modal-resetPassword'
    >
      <Field className='mt-4 mb-8'>
        <Label text='Mật khẩu' validate={false} />
        <div className=' rounded-[8px] px-4 py-[10px] overflow-hidden flex justify-between items-center bg-white shadow-md'>
          <p>{dataResetPassword}</p>
          <MdOutlineContentCopy className='cursor-pointer' onClick={onConfirm} />
        </div>
      </Field>
    </Modal>
  );
};

export default ModalPreviewPassword;
