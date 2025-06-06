import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "src/store/authStore";
import { Role } from "src/types/user.type";
import { RoleType } from "src/shared/common/enum";
import Employee from "src/pages/Employee";
import ManageEmployee from "src/pages/Employee/ManageEmployee/ManageEmployee";
import GroupEmployee from "src/pages/GroupEmployee";
import ManagerGroupEmployee from "src/pages/GroupEmployee/ManagerGroupEmployee/ManagerGroupEmployee";

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
    element: <Navigate to="/employee" replace />,
  },
  {
    path: "employee/*",
    element: <Employee />,
    allowedRoles: [RoleType.STORE_OWNER, RoleType.MANAGER],
    children: [
      {
        path: "",
        element: <Employee />,
      },
      {
        path: "create",
        element: <ManageEmployee />,
      },
      {
        path: ":id",
        element: <ManageEmployee />,
      },
    ],
  },
  {
    path: "groupEmployee/*",
    element: <GroupEmployee />,
    allowedRoles: [RoleType.STORE_OWNER, RoleType.MANAGER],
    children: [
      {
        path: "",
        element: <GroupEmployee />,
      },
      {
        path: "create",
        element: <ManagerGroupEmployee />,
      },
      {
        path: ":id",
        element: <ManagerGroupEmployee />,
      },
    ],
  },
];

const cmsRoutes = routeConfigs.map(wrapRoute);

export default cmsRoutes;
