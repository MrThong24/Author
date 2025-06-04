import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "src/store/authStore";
import { Role } from "src/types/user.type";
import { RoleType } from "src/shared/common/enum";
import Overview from "src/pages/Dashboard/Overview";

interface RouteConfig {
  path: string;
  element: React.ReactNode;
  children?: RouteConfig[];
  allowedRoles?: Role[];
}

const wrapRoute = (route: RouteConfig): RouteConfig => {
  const WrappedComponent = () => {
    const { currentUser } = useAuthStore();

    if (!currentUser) {
      return <Navigate to="/login" replace />;
    }

    if (route.allowedRoles) {
      const userRole = currentUser.currentUserStore?.role as Role;
      if (!route.allowedRoles.includes(userRole)) {
        return <Navigate to="/unauthorized" replace />;
      }
    }

    if (route.children) {
      return <Outlet />;
    }

    return <>{route.element}</>;
  };

  return {
    ...route,
    element: <WrappedComponent />,
    children: route.children?.map(wrapRoute),
  };
};

const routeConfigs: RouteConfig[] = [
  {
    path: "",
    element: <Navigate to="/dashboard/overview" replace />,
  },
  {
    path: "dashboard/*",
    allowedRoles: [RoleType.STORE_OWNER, RoleType.MANAGER],
    element: <Overview />,
    children: [
      {
        path: "overview",
        element: <Overview />,
      },
      {
        path: "revenue-tracking",
        element: <Overview />,
      },
    ],
  },
];

// Process routes with the wrapper
const cmsRoutes = routeConfigs.map(wrapRoute);

export default cmsRoutes;
