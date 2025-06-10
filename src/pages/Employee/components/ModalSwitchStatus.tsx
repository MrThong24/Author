import CustomModal from "src/shared/components/Modals/Modal";

export default function ModalSwitchStatus({
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
          ? "NGƯNG HOẠT ĐỘNG TÀI KHOẢN"
          : "MỞ HOẠT ĐỘNG TÀI KHOẢN"
      }
      onClose={onClose}
      icon={false}
      onConfirm={onConfirm}
      loading={false}
    >
      <div>
        {valueSwitchStatus ? (
          <div>
            <h2 className="text-md mb-2">
              Khi ngưng hoạt động tài khoản này các dữ liệu liên quan đến tài
              khoản sẽ ngưng sử dụng.
            </h2>
            <span>Bạn có chắc muốn tiếp tục?</span>
          </div>
        ) : (
          "Bạn có chắc chắn muốn kích hoạt tài khoản người dùng này không ?"
        )}
      </div>
    </CustomModal>
  );
}
