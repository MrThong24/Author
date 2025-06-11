import CustomModal from "src/shared/components/Modals/Modal";

export default function ModalSwitchService({
  isOpen,
  valueSwitchStatus,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  valueSwitchStatus: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <CustomModal
      isOpen={isOpen}
      title={
        valueSwitchStatus
          ? "NGƯNG SỬ DỤNG GÓI DỊCH VỤ"
          : "KÍCH HOẠT SỬ DỤNG GÓI DỊCH VỤ"
      }
      onClose={onClose}
      icon={false}
      onConfirm={onConfirm}
      loading={false}
    >
      <div>
        {valueSwitchStatus
          ? "Bạn có chắn chắn ngưng sử dụng gói dịch vụ này không ?"
          : "Bạn có chắn chắn kích hoạt sử dụng gói dịch vụ này không ?"}
      </div>
    </CustomModal>
  );
}
