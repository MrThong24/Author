import { Tag } from "antd";
import { EmployeeStatus } from "src/shared/common/enum";
import { IoRestaurantOutline } from "react-icons/io5";
import { GrInProgress } from "react-icons/gr";
import {
  CheckOutlined,
} from "@ant-design/icons";

export const RequestStatusBadge = (status: string) => {
  const StatusBadge = ({
    color,
    text,
    icon,
  }: {
    color: string;
    text: string;
    icon: React.ReactNode;
  }) => (
    <Tag
      className="flex gap-1 p-1 items-center justify-center max-w-28 rounded-[40px] border"
      // icon={icon}
      color={color}
    >
      {text}
    </Tag>
  );

  switch (status) {
    case EmployeeStatus.ACTIVE:
      return (
        <StatusBadge color="gold" text="Đang sử dụng" icon={<GrInProgress />} />
      );
    case EmployeeStatus.INACTIVE:
      return (
        <StatusBadge
          color="geekblue"
          text="Ngưng hoạt động"
          icon={<IoRestaurantOutline />}
        />
      );
    case EmployeeStatus.INACTIVE:
      return (
        <StatusBadge
          color="geekblue"
          text="Ngưng hoạt động"
          icon={<IoRestaurantOutline />}
        />
      );
    default:
      return (
        <StatusBadge
          color="green"
          text="Đã xác nhận"
          icon={<CheckOutlined />}
        />
      );
  }
};
