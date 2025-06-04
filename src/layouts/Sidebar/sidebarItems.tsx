import { Role } from "src/types/user.type";
import { FaChartBar } from "react-icons/fa";

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
    text: "Dashboard",
    icon: <FaChartBar size={18} />,
    path: "dashboard",
    allowedRoles: [],
    subItems: [
      { text: "Tổng quan", icon: <></>, path: "dashboard/overview" },
      {
        text: "Theo dõi doanh thu",
        icon: <></>,
        path: "dashboard/revenue-tracking",
      },
    ],
  },
];
