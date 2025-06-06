import { Role } from "src/types/user.type";
import { FaChartBar } from "react-icons/fa";
import { IoRestaurantOutline } from "react-icons/io5";

interface SubItem {
  text: string;
  icon: JSX.Element;
  path: string;
}
interface SidebarItem {
  text: string;
  icon: JSX.Element;
  path?: string;
  allowedRoles?: Role[];
  subItems?: SubItem[];
}

export const sidebarItems: SidebarItem[] = [
  {
    text: "Quản lý người dùng",
    icon: <FaChartBar size={18} />,
    path: "employee",
    subItems: [
      { text: "Tổng quan", icon: <></>, path: "employee" },
      {
        text: "Theo dõi doanh thu",
        icon: <></>,
        path: "group-employee",
      },
    ],
  },
  {
    text: "Quản lý hệ thông",
    icon: <FaChartBar size={18} />,
    path: "subsystem",
    subItems: [
      {
        text: "Quản lý phân hệ",
        icon: <></>,
        path: "subsystem",
      },
    ],
  },
  {
    text: "Quản lý tiện ích",
    icon: <FaChartBar size={18} />,
    path: "access-platform",
    subItems: [
      {
        text: "Cấu hình truy cập Platform",
        icon: <></>,
        path: "access-platform",
      },
    ],
  },
];
