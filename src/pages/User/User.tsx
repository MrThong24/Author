import React, { useState } from "react";
import type { MenuProps } from "antd";
import { Menu } from "antd";
import Configuration from "./Tabs/ManageProfileStore/Settings/Configuration";
import ManageProfile from "./Tabs/ManageProfile/ManageProfile";
import ManageProfileStore from "./Tabs/ManageProfileStore/Profile/ManageProfileStore";
import ManageProfileEInvoice from "./Tabs/ManageProfileStore/Profile/ManageProfileEInvoice";
import MainHeader from "src/components/Headers/MainHeader";
import useAuthStore from "src/store/authStore";
import { RoleType } from "src/shared/common/enum";
import { IoChevronBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import BaseSelect from "src/shared/components/Core/Select";
import SystemConfig from "./Tabs/SystemConfig/SystemConfig";
type MenuItem = Required<MenuProps>["items"][number];

const Info: React.FC = () => {
  const { currentUser } = useAuthStore();
  const navigate = useNavigate();
  const [current, setCurrent] = useState<string>("profile");
  const items: MenuItem[] = [
    {
      label: "Thông tin tài khoản",
      key: "profile",
    },
    ...(currentUser?.currentUserStore?.role === RoleType.STORE_OWNER ||
    currentUser?.currentUserStore?.role === RoleType.MANAGER
      ? [
          {
            key: "store",
            label: "Thông tin cửa hàng",
            // children: [
            //   { key: 'store', label: 'Thông tin cửa hàng' },
            //   { key: 'configuration', label: 'Cài đặt cấu hình' }
            // ]
          },
        ]
      : []),
    ...(currentUser?.currentUserStore?.role === RoleType.STORE_OWNER ||
    currentUser?.currentUserStore?.role === RoleType.MANAGER
      ? [
          {
            key: "eInvoice",
            label: "Thông tin kết nối HDDT",
          },
        ]
      : []),
    ...(currentUser?.currentUserStore?.role === RoleType.STORE_OWNER ||
    currentUser?.currentUserStore?.role === RoleType.MANAGER
      ? [
          {
            key: "systemConfig",
            label: "Cấu hình hệ thống",
          },
        ]
      : []),
  ];

  const componentsMap: Record<string, React.ReactNode> = {
    profile: <ManageProfile />,
    store: <ManageProfileStore />,
    eInvoice: <ManageProfileEInvoice />,
    configuration: <Configuration />,
    systemConfig: <SystemConfig />,
  };

  const onClick: MenuProps["onClick"] = (e) => {
    setCurrent(e.key);
  };
  return (
    <MainHeader
      title={
        <div className="flex flex-row gap-4 items-center mr-3">
          {currentUser?.currentUserStore?.role === RoleType.CHEF ? (
            <button
              className="flex items-center gap-2"
              onClick={() => navigate(-1)}
            >
              <IoChevronBack size={26} />
              <h2 className="hidden sm:block text-[16px] md:text-xl xl:text-2xl sm:w-auto">
                Quản lý thông tin
              </h2>
            </button>
          ) : (
            <h2 className="hidden sm:block text-[16px] md:text-xl xl:text-2xl sm:w-auto">
              Quản lý thông tin
            </h2>
          )}
          <div className="xl:hidden flex flex-1 items-center gap-3">
            <BaseSelect
              className="w-[165px] !text-white [&_.ant-select-arrow]:!text-white [&_.ant-select-selection-item]:!text-white [&_.ant-select-selector]:!bg-[var(--primary)] [&_.ant-select-selector]:!rounded-[20px]"
              defaultValue={current}
              onChange={setCurrent}
              options={[
                {
                  value: "profile",
                  label: "Thông tin tài khoản",
                },
                ...(currentUser?.currentUserStore?.role ===
                  RoleType.STORE_OWNER ||
                currentUser?.currentUserStore?.role === RoleType.MANAGER
                  ? [
                      {
                        value: "store",
                        label: "Thông tin cửa hàng",
                      },
                    ]
                  : []),
                ...(currentUser?.currentUserStore?.role ===
                  RoleType.STORE_OWNER ||
                currentUser?.currentUserStore?.role === RoleType.MANAGER
                  ? [
                      {
                        value: "eInvoice",
                        label: "Thông tin kết nối HDDT",
                      },
                    ]
                  : []),
                ...(currentUser?.currentUserStore?.role ===
                  RoleType.STORE_OWNER ||
                currentUser?.currentUserStore?.role === RoleType.MANAGER
                  ? [
                      {
                        value: "systemConfig",
                        label: "Cấu hình hệ thống",
                      },
                    ]
                  : []),
              ]}
            />
          </div>
        </div>
      }
    >
      {current !== "store" && current !== "eInvoice" && (
        <div className="flex items-center gap-2 justify-between mb-4 mbsm:mb-0">
          <h2 className="sm:hidden text-[16px] font-bold">Quản lý thông tin</h2>
        </div>
      )}
      <div className="hidden xl:block mb-4">
        <Menu
          onClick={onClick}
          selectedKeys={[current]}
          mode="horizontal"
          items={items}
          className="!bg-transparent shadow-none border-none"
        />
      </div>
      <div className="mt-4">{componentsMap[current]}</div>
    </MainHeader>
  );
};

export default Info;
