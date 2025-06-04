import CustomModal from 'src/shared/components/Modals/Modal';

interface ModalNotificationProps {
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
}

const ModalNotification: React.FC<ModalNotificationProps> = ({
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
  buttonClassName
}) => {
  return (
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
  );
};

export default ModalNotification;
