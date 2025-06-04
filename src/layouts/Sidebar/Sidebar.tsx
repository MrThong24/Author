import { Layout } from "antd";
import { Link } from "react-router-dom";
import { sidebarItems } from "./sidebarItems";
import { mobifone } from "src/assets/images";
import useAuthStore from "src/store/authStore";
import { Role } from "src/types/user.type";
import { MdKeyboardArrowDown } from "react-icons/md";
import { GoDotFill } from "react-icons/go";
import { useEffect, useState, useRef, useCallback } from "react";
import { MdKeyboardDoubleArrowDown } from "react-icons/md";
import BaseButton from "src/shared/components/Buttons/Button";

const { Sider } = Layout;
interface SidebarProps {
  collapsed: boolean;
  isMobile?: boolean;
  onToggle: () => void;
  isResized?: boolean;
}
interface SidebarItem {
  text: string;
  icon: JSX.Element;
  path?: string;
  allowedRoles?: Role[];
  subItems?: SubMenuItem[];
}
interface SubMenuItem {
  text: string;
  icon: JSX.Element;
  path: string;
  type?: string;
}

interface SubMenuProps {
  item: SidebarItem;
  collapsed: boolean;
  isItemSelected: (path: string) => boolean;
}

const SubMenu: React.FC<SubMenuProps> = ({
  item,
  collapsed,
  isItemSelected,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const hasActiveChild = item.subItems?.some((subItem) =>
    isItemSelected(subItem.path)
  );

  return (
    <div className="w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center pl-2 py-2 rounded-md transition-all duration-200 text-md font-normal
          ${hasActiveChild ? "bg-primary text-main" : "text-darkestGray hover:bg-primary/5"}
          ${collapsed ? "justify-center" : "justify-between pr-2"}`}
      >
        <div
          className={`flex items-center ${collapsed ? "justify-center" : ""}`}
        >
          <span className={`text-xl mr-2 ${hasActiveChild ? "text-main" : ""}`}>
            {item.icon}
          </span>
          {!collapsed && <span>{item.text}</span>}
        </div>
        {!collapsed && (
          <MdKeyboardArrowDown
            size={20}
            className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        )}
      </button>
      {/*  */}
      <div
        className={`overflow-hidden transition-all duration-200 ease-in-out
          ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
          ${collapsed ? "absolute left-full top-0 bg-white shadow-lg rounded-lg ml-2" : "ml-4"}`}
      >
        {item.subItems?.map((subItem) => {
          return (
            <Link
              key={subItem.path}
              to={subItem.path}
              className={`flex items-center pl-0.5 py-2 transition-colors text-md 
                ${
                  isItemSelected(subItem.path)
                    ? "text-primary hover:text-primary rounded-md bg-primary-50 font-semibold"
                    : "text-black hover:text-primary"
                }
                ${collapsed ? "px-4 py-2 whitespace-nowrap" : ""} mt-3`}
            >
              <span
                className={`text-lg mr-1 ${isItemSelected(subItem.path) ? "text-primary" : "text-lightGray"}`}
              >
                <GoDotFill size={13} />
              </span>
              <div className="flex justify-between w-full">
                <span> {subItem.text} </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

const Sidebar = ({ collapsed, isMobile, onToggle }: SidebarProps) => {
  const { currentUser } = useAuthStore();
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const isItemSelected = (path: string) => {
    return new RegExp(`^/${path}(/|$)`).test(location.pathname);
  };
  const filteredSidebarItems = sidebarItems.filter((item) => {
    return item;
  });

  const renderScrollButton = (scrollAmount: number, className?: string) => {
    return (
      <BaseButton
        className={`absolute bg-white text-black border border-gray-200 ${className || ""}`}
        shape="circle"
        style={{ borderRadius: "100%" }}
        onClick={() => scrollByAmount(scrollAmount)}
      >
        <MdKeyboardDoubleArrowDown />
      </BaseButton>
    );
  };

  // const { theme } = useTheme();
  // Cuộn Menu
  const menuRef = useRef<HTMLDivElement>(null);
  // Hàm xử lý khi cuộn
  const handleScroll = useCallback(() => {
    if (!menuRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = menuRef.current;
    setCanScrollDown(scrollTop + clientHeight < scrollHeight);
  }, []);

  useEffect(() => {
    const menuElement = menuRef.current;
    if (!menuElement) return;

    // Kiểm tra ban đầu khả năng cuộn
    const checkScrollability = () => {
      const { scrollHeight, clientHeight } = menuElement;
      setCanScrollDown(scrollHeight > clientHeight);
    };

    checkScrollability();

    const handleUserInteraction = () => {
      // Đóng isOpenDraw khi đang cuộn
      handleScroll();
      if (isDrawerOpen) {
        setIsDrawerOpen(false);
      }
    };

    // Add event listeners
    menuElement.addEventListener("scroll", handleScroll);
    menuElement.addEventListener("wheel", handleUserInteraction);
    menuElement.addEventListener("touchmove", handleUserInteraction);

    // Clean up
    return () => {
      menuElement.removeEventListener("scroll", handleScroll);
      menuElement.removeEventListener("wheel", handleUserInteraction);
      menuElement.removeEventListener("touchmove", handleUserInteraction);
    };
  }, [collapsed, isDrawerOpen]);
  const scrollByAmount = (amount: number) => {
    if (menuRef.current) {
      menuRef.current.scrollBy({ top: amount, behavior: "smooth" });
    }
  };

  return (
    <div style={{ position: "relative" }}>
      {/* {!isMobile && (
        <button
          onClick={onToggle}
          className="fixed top-20 z-40 bg-main text-primary rounded-full shadow-md"
          style={{
            left: collapsed ? "66px" : "236px",
            transition: "all 0.2s",
          }}
        >
          {collapsed ? (
            <FaCircleChevronRight size={28} />
          ) : (
            <FaCircleChevronLeft size={28} />
          )}
        </button>
      )} */}
      <Sider
        theme="light"
        width={250}
        collapsedWidth={80}
        collapsed={collapsed}
        style={{
          position: "fixed",
          height: "100dvh",
          left: 0,
          top: isMobile ? 0 : 64,
          transition: "all 0.2s",
          zIndex: 10,
        }}
        className="hide-scrollbar"
      >
        <div
          className={`h-[100dvh] w-full bg-main flex flex-col pt-2 ${collapsed ? "pb-2" : "pb-1"} justify-between`}
        >
          <div className="relative flex flex-col flex-grow overflow-hidden">
            <div
              ref={menuRef}
              onScroll={handleScroll}
              className="overflow-hidden overflow-y-auto hide-scrollbar flex-grow"
            >
              <ul className="flex flex-col w-full">
                {filteredSidebarItems.map((item) => {
                  if (item.subItems) {
                    return (
                      <li
                        key={item.text}
                        className="px-2 py-[6px]"
                        onClick={() => {
                          if (isMobile) onToggle();
                        }}
                      >
                        <SubMenu
                          item={item}
                          collapsed={collapsed}
                          isItemSelected={isItemSelected}
                        />
                      </li>
                    );
                  }

                  const selected = item.path && isItemSelected(item.path);
                  return (
                    <li key={item.path} className="relative px-2 py-[6px]">
                      <Link
                        onClick={() => {
                          if (isMobile) onToggle();
                        }}
                        to={item.path || ""}
                        className={`flex items-center px-2 py-2 rounded-md transition-colors text-md font-normal
                        ${
                          selected
                            ? "bg-primary text-main hover:text-main"
                            : "text-darkestGray hover:bg-primary hover:text-main"
                        }
                        ${collapsed ? "justify-center" : "justify-between"}`}
                      >
                        <div className="flex">
                          <span
                            className={`flex-shrink-0 text-center text-xl ${selected ? "text-main" : ""} ${!collapsed ? "mr-2" : ""}`}
                          >
                            {item.icon}
                          </span>

                          {!collapsed && (
                            <span className="truncate">{item.text}</span>
                          )}
                        </div>
                      </Link>
                    </li>
                  );
                })}
                <li></li>
              </ul>
            </div>
          </div>
          {canScrollDown ? (
            <>
              {collapsed ? (
                <div className="relative h-4 py-2">
                  {renderScrollButton(120, "-bottom-0.5 right-0")}
                </div>
              ) : (
                renderScrollButton(120, "bottom-5 right-0")
              )}
            </>
          ) : (
            <></>
          )}

          {!collapsed && (
            <div className="mt-auto text-center  flex items-center justify-center gap-1">
              <p className="text-xs text-gray-500 font-light">Powered by</p>
              <img
                src={mobifone}
                alt="Mobifone"
                className="h-3 object-contain"
              />
            </div>
          )}
        </div>
      </Sider>
    </div>
  );
};

export default Sidebar;
