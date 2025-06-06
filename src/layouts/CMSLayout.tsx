import { Layout, Drawer } from "antd";
import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import Sidebar from "./Sidebar";
import { LoadingFullPage } from "src/shared/components/Loading/LoadingFullPage";
import useAuthStore from "src/store/authStore";
import useMediaQuery from "src/hooks/useMediaQuery";
import { initializeSocket } from "src/shared/utils/socket";
import { useTheme } from "src/provider/ThemeContext";
import { RoleType } from "src/shared/common/enum";
import useLayoutStore from "src/store/layoutStore";
import useWindowResize from "src/hooks/useWindowResize";
import { mobifone } from "src/assets/images";
import LayoutHeader from "./LayoutHeader";

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

  return (
    <>
      {!!currentUser?.username && (
        <Layout style={{ height: "100dvh" }}>
          <LayoutHeader handleToggleSidebar={handleToggleSidebar} />
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
                marginLeft: isMobile ? 0 : collapsed ? 80 : 250,
                transition: "all 0.2s ease",
                padding: isMobile ? "0" : "0 0 0 12px",
                marginTop: 64,
                background: theme.paleSkyBlue,
                overflow: "hidden",
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
