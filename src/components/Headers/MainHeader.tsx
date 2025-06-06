import Notification from "../Notification/Notification";
import useAuthStore from "src/store/authStore";
import { RequestProductStatus, RoleType } from "src/shared/common/enum";
import ProfileUser from "../Profile/ProfileUser";
import { LuMenu } from "react-icons/lu";
import { CgMenuLeft } from "react-icons/cg";
import useLayoutStore from "src/store/layoutStore";
import useMediaQuery from "src/hooks/useMediaQuery";
import useRequestStore from "src/store/useRequestStore";
import useRequestProductStore from "src/store/useRequestProductStore";
import { Badge } from "antd";
import { useEffect, useMemo } from "react";

interface MainHeaderProps {
  children: React.ReactNode;
  title: string | React.ReactNode;
  loading?: boolean;
}

const MainHeader: React.FC<MainHeaderProps> = ({
  children,
  title,
  loading = false,
}) => {
  return (
    <div className="">
      <div className="flex flex-row items-center justify-between mb-4 flex-1">
        <h2 className="text-black font-semibold text-[16px] sm:text-xl xl:text-2xl flex-1">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
};

export default MainHeader;
