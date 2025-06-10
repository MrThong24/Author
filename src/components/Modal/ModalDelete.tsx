import CustomModal from "src/shared/components/Modals/Modal";
import { RiDeleteBin6Line } from "react-icons/ri";

interface ModalDeleteProps {
  onClose: () => void;
  onConfirm: () => void;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  isOpen: boolean;
  loading?: boolean;
  title?: string;
}

const ModalDelete: React.FC<ModalDeleteProps> = ({
  isOpen,
  children,
  onClose,
  onConfirm,
  loading,
  title,
}) => {
  return (
    <CustomModal
      isOpen={isOpen}
      title={title}
      onClose={onClose}
      onConfirm={onConfirm}
      type="danger"
      textColorIcon="#D92D20"
      loading={loading}
    >
      <div className="text-gray-700">{children}</div>
    </CustomModal>
  );
};

export default ModalDelete;
