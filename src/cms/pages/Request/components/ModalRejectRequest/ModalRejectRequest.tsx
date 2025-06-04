// src/shared/components/Modal/ModalRejectRequest.tsx
import { Radio, Space } from 'antd';
import { useState } from 'react';
import { useTheme } from 'src/provider/ThemeContext';
import BaseInput from 'src/shared/components/Core/Input';
import IconBlue from 'src/shared/components/Icons/IconBlue';
import CustomModal from 'src/shared/components/Modals/Modal';

interface ModalRejectRequestProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  icon: React.ReactNode;
}

const ModalRejectRequest = ({ isOpen, onClose, onConfirm, icon }: ModalRejectRequestProps) => {
  const { theme } = useTheme();
  const [reasonType, setReasonType] = useState<string>('Khách hàng không có tại quán');
  const [customReason, setCustomReason] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleClose = () => {
    setReasonType('Khách hàng không có tại quán');
    setCustomReason('');
    setIsSubmitted(false);
    onClose();
  };

  const handleConfirm = () => {
    setIsSubmitted(true);
    if (reasonType === 'other' && !customReason.trim()) {
      return;
    }
    onConfirm(reasonType === 'other' ? customReason : reasonType);
    handleClose()
  };

  return (
    <CustomModal
      isOpen={isOpen}
      title='Lý do hủy yêu cầu?'
      icon={IconBlue({ icon })}
      onClose={handleClose}
      onConfirm={handleConfirm}
      textColorIcon={'#005FAB'}
    >
      <div className='w-full'>
        <Radio.Group onChange={(e) => setReasonType(e.target.value)} value={reasonType}>
          <Space direction='vertical'>
            <Radio value='Khách hàng không có tại quán'>Khách hàng không có tại quán</Radio>
            <Radio value='other'>Lý do</Radio>
          </Space>
        </Radio.Group>
        {reasonType === 'other' && (
          <BaseInput.TextArea
            placeholder='Nhập lý do'
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            style={{ marginTop: 8 }}
            status={isSubmitted && !customReason.trim() ? 'error' : undefined}
          />
        )}
      </div>
    </CustomModal>
  );
};

export default ModalRejectRequest;
