import { MdOutlinePayment, MdOutlineTableRestaurant } from 'react-icons/md';
import { IoCartOutline, IoRestaurantOutline } from 'react-icons/io5';
import { PiNotePencil } from 'react-icons/pi';
import { LuChefHat, LuClipboardPenLine, LuStore, LuUsers } from 'react-icons/lu';
import { Role } from 'src/types/user.type';
import { RoleType } from 'src/shared/common/enum';
import { LuUserRound, LuWalletCards } from 'react-icons/lu';
import { AiOutlineHome } from 'react-icons/ai';
import { FaChartBar, FaRegAddressCard } from 'react-icons/fa';
import { BiDish } from 'react-icons/bi';
import { LiaUserAstronautSolid } from 'react-icons/lia';

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
    text: 'Dashboard',
    icon: <FaChartBar size={18} />,
    path: 'dashboard',
    allowedRoles: [RoleType.STORE_OWNER, RoleType.MANAGER],
    subItems: [
      { text: 'Tổng quan', icon: <></>, path: 'dashboard/overview' },
      { text: 'Theo dõi doanh thu', icon: <></>, path: 'dashboard/revenue-tracking' }
    ]
  },
  {
    text: 'Yêu cầu gọi món',
    icon: <IoRestaurantOutline />,
    path: 'request/order',
    allowedRoles: [RoleType.STORE_OWNER, RoleType.MANAGER, RoleType.STAFF]
  },
  {
    text: 'Yêu cầu nhân viên',
    icon: <LiaUserAstronautSolid />,
    path: 'request/staff',
    allowedRoles: [RoleType.STORE_OWNER, RoleType.MANAGER, RoleType.STAFF]
  },
  {
    text: 'Yêu cầu thanh toán',
    icon: <MdOutlinePayment />,
    path: 'request/payment',
    allowedRoles: [RoleType.STORE_OWNER, RoleType.MANAGER, RoleType.STAFF]
  },
  {
    text: 'Yêu cầu chờ phục vụ',
    icon: <BiDish />,
    path: 'request/pending',
    allowedRoles: [RoleType.STORE_OWNER, RoleType.MANAGER, RoleType.STAFF]
  },
  // {
  //   text: 'Yêu cầu đã chuyển bếp',
  //   icon: <LuFileInput />,
  //   path: 'request-transferred',
  //   allowedRoles: [RoleType.STORE_OWNER, RoleType.MANAGER, RoleType.STAFF]
  // },
  {
    text: 'Quản lý bếp',
    icon: <LuChefHat />,
    path: 'kitchen/inprogress',
    allowedRoles: [RoleType.STORE_OWNER, RoleType.MANAGER, RoleType.STAFF, RoleType.CHEF]
  },
  {
    text: 'Quản lý bàn',
    icon: <MdOutlineTableRestaurant />,
    path: 'table',
    allowedRoles: [RoleType.STORE_OWNER, RoleType.MANAGER, RoleType.STAFF]
  },
  {
    text: 'Quản lý đơn hàng',
    icon: <LuClipboardPenLine />,
    path: 'order',
    allowedRoles: [RoleType.STORE_OWNER, RoleType.MANAGER, RoleType.STAFF]
  },
  {
    text: 'Quản lý đánh giá',
    icon: <PiNotePencil />,
    path: 'review',
    allowedRoles: [RoleType.STORE_OWNER, RoleType.MANAGER]
  },
  {
    text: 'Quản lý khách hàng',
    icon: <LuUserRound />,
    path: 'customer',
    allowedRoles: [RoleType.STORE_OWNER, RoleType.MANAGER, RoleType.STAFF]
  },
  {
    text: 'Quản lý món',
    icon: <IoCartOutline />,
    path: 'product',
    allowedRoles: [RoleType.STORE_OWNER, RoleType.MANAGER]
  },
  {
    text: 'Quản lý nhân viên',
    icon: <LuUsers />,
    path: 'employee',
    allowedRoles: [RoleType.STORE_OWNER, RoleType.MANAGER]
  },
  {
    text: 'Quản lý cửa hàng',
    icon: <LuStore />,
    path: 'store',
    allowedRoles: [RoleType.STORE_OWNER]
  },
  {
    text: 'Thông tin công ty',
    icon: <AiOutlineHome />,
    path: 'company',
    allowedRoles: [RoleType.STORE_OWNER]
  }

  // {
  //   text: 'Users',
  //   icon: <LuUsers />,
  //   subItems: [
  //     { text: 'User List', icon: <LuUsers />, path: 'test/1' },
  //     { text: 'User Profile', icon: <LuUsers />, path: 'test/2' }
  //   ]
  // }
];
