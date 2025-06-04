import { Badge, Layout, Modal, Button, Tooltip, theme } from "antd";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { sidebarItems } from "./sidebarItems";
import { FaCircleChevronLeft, FaCircleChevronRight } from "react-icons/fa6";
import { RxExit } from "react-icons/rx";
import { FiUser } from "react-icons/fi";
import {
  imageStoreDefault,
  logoBlue,
  logoBlueSmall,
  mobifone,
  mobifoneSmall,
} from "src/assets/images";
import {
  clearLS,
  getAccessTokenFromLS,
  setAccessTokenToLS,
} from "src/shared/utils/auth";
import useAuthStore from "src/store/authStore";
import { Role } from "src/types/user.type";
import { MdKeyboardArrowDown } from "react-icons/md";
import { GoDotFill } from "react-icons/go";
import { LuKeyRound, LuStore } from "react-icons/lu";
import ModalConfirm from "src/cms/components/Modal/ModalConfirm";
import { useEffect, useState, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import BaseSelect from "src/shared/components/Core/Select";
import useRequestStore from "src/store/useRequestStore";
import {
  RequestProductStatus,
  RequestType,
  RoleType,
  SocketEnum,
} from "src/shared/common/enum";
import { getSocket, useMultiSocketEvents } from "src/shared/utils/socket";
import { useUrlQuery } from "src/hooks/useUrlQuery";
import { AxiosResponse } from "axios";
import http from "src/shared/utils/http";
import { Store } from "antd/es/form/interface";
import { useOutsideClick } from "src/hooks/useOutsideClick";
import useMediaQuery from "src/hooks/useMediaQuery";
import CustomModal from "src/shared/components/Modals/Modal";
import useRequestProductStore from "src/store/useRequestProductStore";
import { RequestProduct } from "src/types/request.type";
import { useTheme } from "src/provider/ThemeContext";
import { MdKeyboardDoubleArrowDown } from "react-icons/md";
import BaseButton from "src/shared/components/Buttons/Button";
import { generateImageURL } from "src/shared/utils/utils";
import useWindowResize from "src/hooks/useWindowResize";

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
// Move the getPendingCount function outside of both components to make it reusable
const getPendingCount = (
  type: string,
  requestCounts: { [x: string]: number }
) => {
  if (!requestCounts || Object.keys(requestCounts).length === 0) return 0;
  let requestType = "";
  if (type === "request/order") {
    requestType = RequestType.ORDER;
  } else if (type === "request/staff") {
    requestType = RequestType.STAFF;
  } else if (type === "request/payment") {
    requestType = RequestType.PAYMENT;
  } else if (type === "request/pending") {
    requestType = RequestType.PENDING;
  }
  return requestCounts[requestType] || 0;
};

interface SubMenuProps {
  item: SidebarItem;
  collapsed: boolean;
  isItemSelected: (path: string) => boolean;
  requestCounts: { [x: string]: number };
}

const SubMenu: React.FC<SubMenuProps> = ({
  item,
  collapsed,
  isItemSelected,
  requestCounts,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const hasActiveChild = item.subItems?.some((subItem) =>
    isItemSelected(subItem.path)
  );

  // Remove the duplicate getPendingCount function from here

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
          const pendingCount = getPendingCount(subItem.path, requestCounts);
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
                {/* {pendingCount > 0 && <Badge className='mr-2' count={pendingCount} overflowCount={10}></Badge>} */}
                {pendingCount > 0 && (
                  <Badge className="mr-2" count={pendingCount}></Badge>
                )}
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
  const {
    fetchPendingRequestCounts,
    pendingRequestCounts,
    requestCounts,
    setRequestCounts,
  } = useRequestStore();

  const {
    requestProductCounts,
    fetchRequestProductCounts,
    isLoading: isRequestProductLoading,
  } = useRequestProductStore();
  const [listStoreOwner, setListStoreOwner] = useState<Store[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const [canScrollDown, setCanScrollDown] = useState(false);
  // const [isUserScrolling, setIsUserScrolling] = useState(false);
  const { getAllQuery } = useUrlQuery();
  const { type } = useParams();
  const { fetchRequests } = useRequestStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [openConfirm, setOpenConfirm] = useState<boolean>(false);
  const [selectedStore, setSelectedStore] = useState<string | null>();
  const isItemSelected = (path: string) => {
    return new RegExp(`^/${path}(/|$)`).test(location.pathname);
  };

  const userRole = currentUser?.currentUserStore?.role as Role;
  const kitchenDisabled = currentUser?.currentUserStore?.store?.kitchenDisabled;

  const filteredSidebarItems = sidebarItems.filter((item) => {
    if (kitchenDisabled && item.path === "kitchen/inprogress") return false;
    if (!item.allowedRoles) return true;
    return item.allowedRoles.includes(userRole);
  });

  // const handleLogout = () => {
  //   clearLS();
  //   window.location.reload();
  // };
  // const getPendingCount = (type: string) => {
  //   if (!requestCounts || requestCounts.length === 0) return 0;
  //   let requestType = '';
  //   if (type === 'request/order') {
  //     requestType = RequestType.ORDER;
  //   } else if (type === 'request/staff') {
  //     requestType = RequestType.STAFF;
  //   } else if (type === 'request/payment') {
  //     requestType = RequestType.PAYMENT;
  //   } else if (type === 'request/pending') {
  //     requestType = RequestType.PENDING;
  //   }
  //   return requestCounts[requestType];
  // };
  // const { handleSubmit } = useForm({
  //   mode: 'onChange'
  // });
  const buildQueryString = (
    params: Record<string, string | number | undefined | null>
  ) => {
    const queryParams = new URLSearchParams();

    -Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, String(value));
      }
    });

    const queryString = queryParams.toString();
    return queryString ? `?${queryString}` : "";
  };
  // const onSubmit = async () => {
  //   setOpenConfirm(false);
  //   const res = await chooseStore({
  //     token: `${getAccessTokenFromLS()}` || '',
  //     storeId: selectedStore || ''
  //   });
  //   setAccessTokenToLS(res?.accessToken as string);
  //   getCurrentUser();
  //   fetchRequestProductCounts();
  //   navigate('request/order');
  // };
  //Xử lý đóng Drawer với hook useOutside
  const closeDrawer = () => setIsDrawerOpen(false);

  // Khởi tạo
  useEffect(() => {
    setSelectedStore(currentUser?.currentUserStore?.store?.id);
  }, [currentUser]);

  const fetchStoresData = async () => {
    try {
      const response: AxiosResponse = await http.get("/store");
      setListStoreOwner(response.data.data);
    } catch (error) {}
  };

  useEffect(() => {
    if (
      currentUser?.currentUserStore?.role === RoleType.STORE_OWNER &&
      openConfirm
    ) {
      fetchStoresData();
    }
  }, [openConfirm, currentUser]);

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
          // overflowX: 'hidden',
          // overflowY: 'auto',
          zIndex: 10,
        }}
        className="hide-scrollbar"
      >
        <div
          className={`h-[100dvh] w-full bg-main flex flex-col pt-2 ${collapsed ? "pb-2" : "pb-1"} justify-between`}
        >
          {/* Top section containing logo and menu */}
          <div className="relative flex flex-col flex-grow overflow-hidden">
            <div
              ref={menuRef}
              onScroll={handleScroll}
              className="overflow-hidden overflow-y-auto hide-scrollbar flex-grow"
            >
              {/* ul menu */}
              <ul className="flex flex-col w-full">
                {filteredSidebarItems.map((item) => {
                  const pendingCount = isMobile
                    ? item.path
                      ? getPendingCount(item.path, requestCounts)
                      : 0
                    : item.path
                      ? getPendingCount(item.path, requestCounts)
                      : 0;
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
                          requestCounts={requestCounts}
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
                          <span className="relative">
                            {collapsed && pendingCount > 0 && (
                              <Badge
                                className="absolute -left-4 -top-1.5 ml-2"
                                size="small"
                                count={pendingCount}
                              />
                            )}
                          </span>
                          {!collapsed && (
                            <span className="truncate">{item.text}</span>
                          )}
                        </div>
                        {!collapsed && pendingCount > 0 && (
                          <Badge
                            className="ml-2 items-end"
                            count={pendingCount}
                          />
                        )}
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

          {/* Bottom section with user profile and footer */}
          {/* <div className='mt-auto'>
          <div ref={wrapperRef} className='relative px-4 py-2 text-center flex flex-col justify-center flex-shrink-0'>
            <div
              className='relative flex items-center gap-2 cursor-pointer active:bg-primary-50'
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            >
              <img
                src={currentUser?.avatar || imageStoreDefault}
                alt='avatar'
                className='w-[42px] h-[42px] rounded-full flex-shrink-0 object-cover'
              />
              {!collapsed && (
                <Tooltip
                  title={currentUser?.name}
                  trigger={isSmToMdScreen ? [] : ['hover']}
                  // open={isTooltipOpen}
                  // onOpenChange={(visible) => setIsTooltipOpen(visible)}
                  color={theme?.primary}
                  arrow={{ pointAtCenter: true }}
                  overlayStyle={{ maxWidth: '250px' }} // Giới hạn chiều rộng tooltip
                  autoAdjustOverflow
                >
                  <h2 className='text-black text-[14px] font-semibold truncate max-w-[150px]'>{currentUser?.name}</h2>
                </Tooltip>
              )}
              {isDrawerOpen && (
                <div
                  className={`flex absolute flex-col w-[200px] p-2 gap-3 bg-white rounded-md shadow-md z-50
                      ${!collapsed && !isSmScreen ? 'left-[250px]' : 'left-[20px]'}  
                      border ${isSmScreen ? 'left-[50px] bottom-[100%] shadow-xl' : ' bottom-[10%]'}`}
                >
                  {content}
                </div>
              )}
            </div>

            {collapsed && (
              <div className='mt-4 cursor-pointer mx-auto flex-shrink-0' onClick={handleLogout}>
                <RxExit className='text-danger' size={20} />
              </div>
            )}
          </div> */}

          {/* </div> */}
          {/* {!collapsed && (
              <div className='flex justify-center flex-shrink-0 overflow-hidden'>
                <img src={mobifone} alt='Logo' className='w-[150px] max-w-full object-contain' />
              </div>
            )} */}
          {/* Bottom section with Powered by */}
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
      {/* <ModalConfirm
        isOpen={openConfirm}
        title='Chọn cửa hàng'
        onClose={() => {
          setOpenConfirm(false);
          setSelectedStore(currentUser?.currentUserStore?.store?.id);
        }}
        onConfirm={handleSubmit(onSubmit)}
        icon={<LuStore size={24} />}
        loading={isLoading}
      >
        <BaseSelect
          value={selectedStore}
          options={currentUser?.userStores?.map((item) => item.store) || []}
          placeholder='Chọn cửa hàng'
          fieldNames={{
            label: 'name',
            value: 'id'
          }}
          optionFilterProp='name'
          showSearch
          onChange={(value) => {
            setSelectedStore(value);
          }}
          className='w-full mb-6'
        />
      </ModalConfirm> */}
    </div>
  );
};

export default Sidebar;
