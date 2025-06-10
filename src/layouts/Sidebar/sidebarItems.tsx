import { Role } from "src/types/user.type";
import { FaExpandArrowsAlt } from "react-icons/fa";
import { LuFileChartColumnIncreasing, LuUserPlus } from "react-icons/lu";
import { TbReservedLine } from "react-icons/tb";
import { AiOutlineSetting } from "react-icons/ai";

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
    text: "Quản lý tài khoản",
    icon: <AiOutlineSetting size={18} />,
    path: "employee",
    subItems: [
      { text: "Quản lý người dùng", icon: <></>, path: "employee" },
      {
        text: "Quản lý nhóm người dùng",
        icon: <></>,
        path: "group-employee",
      },
    ],
  },
  {
    text: "Quản lý hợp đồng khách hàng",
    icon: <LuUserPlus size={18} />,
    path: "contract",
    subItems: [
      { text: "Quản lý khách hàng", icon: <></>, path: "customer" },
      { text: "Quản lý hợp đồng", icon: <></>, path: "contract" },
    ],
  },
  {
    text: "Quản lý gói dịch vụ",
    icon: <LuFileChartColumnIncreasing size={18} />,
    path: "service",
  },
  {
    text: "Quản lý hệ thông",
    icon: <TbReservedLine size={18} />,
    path: "database",
    subItems: [
      {
        text: "Quản lý cơ sở dữ liệu",
        icon: <></>,
        path: "database",
      },
      {
        text: "Quản lý phân hệ",
        icon: <></>,
        path: "subsystem",
      },
      {
        text: "Quản lý danh mục/ tính năng",
        icon: <></>,
        path: "category",
      },
    ],
  },
  {
    text: "Quản lý tiện ích",
    icon: <FaExpandArrowsAlt size={18} />,
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
