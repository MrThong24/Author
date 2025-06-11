import { Table } from "antd";
import CustomModal from "src/shared/components/Modals/Modal";

export default function ModalHistoryService({
  isOpen,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const columns = [
    {
      title: "STT",
      width: 60,
      align: "center" as "left" | "right" | "center",
      render: (_text: any, _record: any, index: number) => index + 1,
    },
    {
      title: "Tài khoản thực hiện",
      render: (_record: any) => _record.store,
    },
    {
      title: "Thời gian thực hiện",
      render: (_record: any) => _record.store,
    },
    {
      title: "Hạng mục",
      render: (_record: any) => _record.store,
    },
    {
      title: "Thao tác",
      render: (_record: any) => _record.store,
    },
    {
      title: "Ghi chú",
      render: (_record: any) => _record.store,
    },
  ];
  return (
    <CustomModal
      isOpen={isOpen}
      width="80%" // Assuming width is expected in pixels
      title="Lịch sử điều chỉnh"
      onClose={onClose}
      icon={false}
      showCancel={false}
      onConfirm={onConfirm}
      loading={false}
    >
      <Table
        scroll={{ x: "max-content" }}
        dataSource={[
          {
            store: "123",
          },
        ]}
        columns={columns}
        pagination={false}
        size="small"
        className="w-full"
      />
    </CustomModal>
  );
}
