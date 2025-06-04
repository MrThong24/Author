import { Layout, Drawer } from "antd";
import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { DraggableButton } from "src/shared/components/Buttons/ButtonDrag";
import Sidebar from "./Sidebar";
import { LoadingFullPage } from "src/shared/components/Loading/LoadingFullPage";
import useAuthStore from "src/store/authStore";
import useMediaQuery from "src/hooks/useMediaQuery";
import {
  useMultiSocketEvents,
  disconnectSocket,
  initializeSocket,
} from "src/shared/utils/socket";
import { useTheme } from "src/provider/ThemeContext";
import {
  RequestProductStatus,
  RequestType,
  RoleType,
  SocketEnum,
} from "src/shared/common/enum";
import useLayoutStore from "src/store/layoutStore";
import useWindowResize from "src/hooks/useWindowResize";
import useRequestStore from "src/store/useRequestStore";
import useRequestProductStore from "src/store/useRequestProductStore";

const { Content, Header } = Layout;

const CMSLayout = () => {
  const { theme, setTheme } = useTheme();
  const isMobile = useMediaQuery("(max-width: 1023px)");
  const {
    collapsed,
    drawerVisible,
    toggleCollapsed,
    initializeCollapsed,
    setDrawerVisible,
    toggleDrawer,
  } = useLayoutStore();
  const { isLoading, currentUser, getCurrentUser } = useAuthStore();

  const isResized = useWindowResize();
  const {
    pendingRequestCounts,
    requestCounts,
    setRequestCounts,
    fetchPendingRequestCounts,
  } = useRequestStore();
  const { requestProductCounts, fetchRequestProductCounts } =
    useRequestProductStore();

  useEffect(() => {
    getCurrentUser();
  }, []);

  useEffect(() => {
    initializeSocket();
    initializeCollapsed();
  }, []);

  const handleToggleSidebar = () => {
    if (isMobile) {
      toggleDrawer();
    } else {
      toggleCollapsed();
    }
  };

  useEffect(() => {
    if (currentUser?.currentUserStore?.store?.primaryColor)
      setTheme({
        ...theme,
        primary: currentUser?.currentUserStore.store.primaryColor,
      });
  }, [currentUser?.currentUserStore?.store?.primaryColor]);

  useMultiSocketEvents(
    [
      {
        event: SocketEnum.TABLE_CREATED,
        callback: () => {
          // Reinitialize socket
          disconnectSocket();
          initializeSocket();
        },
      },
    ],
    [isLoading]
  );

  useEffect(() => {
    if (
      isResized &&
      Object.keys(requestCounts).includes(RequestType.PENDING) &&
      collapsed
    )
      return;
    const pendingRequestCountsObject = pendingRequestCounts.reduce<
      Record<string, number>
    >((acc, item) => {
      acc[item.type] = parseInt(item.count);
      return acc;
    }, {});
    const requestProductCountsObject = requestProductCounts.reduce<
      Record<string, number>
    >((acc, item) => {
      acc[item.status] = parseInt(item.count);
      return acc;
    }, {});

    setRequestCounts((prev) => ({
      ...prev,
      ...pendingRequestCountsObject,
      [RequestType.PENDING]:
        (requestProductCountsObject[RequestProductStatus.COMPLETED] || 0) +
        (requestProductCountsObject[RequestProductStatus.INPROGRESS] || 0),
    }));
  }, [pendingRequestCounts, requestProductCounts]);

  useEffect(() => {
    fetchPendingRequestCounts();
    fetchRequestProductCounts();
  }, []);
  return (
    <>
      {!!currentUser?.username && (
        <Layout style={{ height: "100dvh" }}>
          <Header
            className="flex items-center border border-b-2"
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              left: 0,
              zIndex: 99,
            }}
          >
            <div className="cursor-pointer" onClick={handleToggleSidebar}>
              Mobifone
            </div>
          </Header>
          <Layout>
            {currentUser?.currentUserStore?.role !== RoleType.CHEF &&
              (isMobile ? (
                <Drawer
                  placement="left"
                  closable={true}
                  onClose={() => setDrawerVisible(false)}
                  open={drawerVisible}
                  style={{ padding: 0, height: "100dvh" }}
                  width={200}
                  title={null}
                >
                  <Sidebar
                    collapsed={false}
                    isMobile={isMobile}
                    onToggle={handleToggleSidebar}
                    isResized={isResized}
                  />
                </Drawer>
              ) : (
                <Sidebar
                  collapsed={collapsed}
                  isMobile={isMobile}
                  onToggle={handleToggleSidebar}
                  isResized={isResized}
                />
              ))}
            <Layout
              style={{
                marginLeft:
                  currentUser?.currentUserStore?.role !== RoleType.CHEF
                    ? isMobile
                      ? 0
                      : collapsed
                        ? 80
                        : 250
                    : 0,
                transition: "all 0.2s ease",
                padding: isMobile ? "0" : "0 0 0 12px",
                marginTop: 64,
                background: theme.paleSkyBlue,
                height: "100dvh", // Đảm bảo Content full màn hình
                overflow: "hidden", // Tránh bị cuộn khi Sidebar cuộn
              }}
            >
              <Content
                style={{
                  padding: isMobile ? 16 : 24,
                  overflow: "auto",
                  backgroundColor: theme.paleSkyBlue,
                }}
              >
                <Outlet />
              </Content>
            </Layout>
          </Layout>
        </Layout>
      )}
      <LoadingFullPage loading={isLoading} />
    </>
  );
};

export default CMSLayout;
