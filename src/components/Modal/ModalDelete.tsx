import CustomModal from 'src/shared/components/Modals/Modal';
import { RiDeleteBin6Line } from 'react-icons/ri';

interface ModalDeleteProps {
  onClose: () => void;
  onConfirm: () => void;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  isOpen: boolean;
  loading?: boolean;
}

const ModalDelete: React.FC<ModalDeleteProps> = ({ isOpen, children, onClose, onConfirm, loading }) => {
  return (
    <CustomModal
      isOpen={isOpen}
      //title='Thông báo'
      icon={
        <div className='bg-softPink p-2 rounded-[50%]'>
          <div className='bg-peachBlush p-2 rounded-[50%]'>
            <RiDeleteBin6Line />
          </div>
        </div>
      }
      onClose={onClose}
      onConfirm={onConfirm}
      type='danger'
      textColorIcon='#D92D20'
      loading={loading}
    >
      {children}
    </CustomModal>
  );
};

export default ModalDelete;
