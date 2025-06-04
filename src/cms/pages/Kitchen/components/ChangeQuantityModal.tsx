import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import CustomModal from 'src/shared/components/Modals/Modal';
import useAuthStore from 'src/store/authStore';

interface ExpandedDataType {
  key: React.Key;
  name: string;
  quantity: number;
  completedQuantity: number;
  servedQuantity: number;
  redoQuantity: number;
  productName: string;
  customerName: string;
}

interface ChangeQuantityModalProps {
  onClose: () => void;
  onConfirm: () => void;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  isOpen: boolean;
  loading?: boolean;
  showCancel?: boolean;
  confirmLabel?: string;
  type?: string;
  className?: string;
  buttonClassName?: string;
  isFromActionModal?: boolean;
  data?: ExpandedDataType[];
}

const ChangeQuantityModal: React.FC<ChangeQuantityModalProps> = ({
  isOpen,
  children,
  onClose,
  onConfirm,
  loading,
  icon,
  showCancel,
  confirmLabel,
  className,
  type = 'primary',
  buttonClassName,
  isFromActionModal,
  data
}) => {
  const { currentUser } = useAuthStore();
  const location = useLocation();
  const isConfirmModalDisabled = useMemo(() => {
    if (type !== 'primary') return false;
    else
      return location.pathname.includes('request/pending')
        ? currentUser?.currentUserStore?.store?.servingQuantityConfirmationDisabled
        : location.pathname.includes('kitchen/inprogress')
          ? currentUser?.currentUserStore?.store?.completingQuantityConfirmationDisabled
          : false;
  }, [
    location.pathname,
    currentUser?.currentUserStore?.store?.servingQuantityConfirmationDisabled,
    currentUser?.currentUserStore?.store?.completingQuantityConfirmationDisabled,
    type
  ]);
  useEffect(() => {
    if (isConfirmModalDisabled && isOpen) {
      if (isFromActionModal) {
        if (data && data.length > 0) {
          onConfirm();
          onClose();
        }
      } else {
        onConfirm();
        onClose();
      }
    }
  }, [isConfirmModalDisabled, isOpen, data]);
  return (
    isConfirmModalDisabled || (
      <CustomModal
        isOpen={isOpen}
        //title='Thông báo'
        icon={
          <div className='bg-mintMist p-2 rounded-[50%]'>
            <div className='bg-lightGreen p-2 rounded-[50%]'>{icon}</div>
          </div>
        }
        onClose={onClose}
        onConfirm={onConfirm}
        type={type}
        textColorIcon='#15803D'
        loading={loading}
        showCancel={showCancel}
        confirmLabel={confirmLabel || 'Đóng'}
        className={className}
        buttonClassName={buttonClassName}
      >
        {children}
      </CustomModal>
    )
  );
};

export default ChangeQuantityModal;
