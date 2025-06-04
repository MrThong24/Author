import CustomModal from 'src/shared/components/Modals/Modal';

interface ModalWarningProps {
  onClose: () => void;
  onConfirm: () => void;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  isOpen: boolean;
  loading?: boolean;
}

const ModalWarning: React.FC<ModalWarningProps> = ({ isOpen, children, onClose, onConfirm, loading, icon }) => {
  return (
    <CustomModal
      isOpen={isOpen}
      //title='Thông báo'
      icon={
        <div className='bg-mintOrange p-2 rounded-[50%]'>
          <div className='bg-[#FFEDD5] p-2 rounded-[50%]'>{icon}</div>
        </div>
      }
      onClose={onClose}
      onConfirm={onConfirm}
      textColorIcon='#EA580C'
      loading={loading}
    >
      {children}
    </CustomModal>
  );
};

export default ModalWarning;
