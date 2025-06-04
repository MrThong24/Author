import CustomModal from 'src/shared/components/Modals/Modal';

interface ModalDeleteProps {
  onClose: () => void;
  onConfirm: () => void;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  isOpen: boolean;
  loading?: boolean;
  title?: string;
}

const ModalConfirm: React.FC<ModalDeleteProps> = ({
  isOpen,
  children,
  onClose,
  onConfirm,
  loading,
  icon,
  title = 'Thông báo'
}) => {
  return (
    <CustomModal
      isOpen={isOpen}
      title={title}
      icon={
        <div className='bg-mintMist p-2 rounded-[50%]'>
          <div className='bg-lightGreen p-2 rounded-[50%]'>{icon}</div>
        </div>
      }
      onClose={onClose}
      onConfirm={onConfirm}
      textColorIcon='#15803D'
      loading={loading}
      className='text-center'
    >
      {children}
    </CustomModal>
  );
};

export default ModalConfirm;
