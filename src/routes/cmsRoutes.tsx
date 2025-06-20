import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "src/store/authStore";
import { Role } from "src/types/user.type";
import { RoleType } from "src/shared/common/enum";
import Employee from "src/pages/Employee";
import ManageEmployee from "src/pages/Employee/ManageEmployee/ManageEmployee";
import GroupEmployee from "src/pages/GroupEmployee";
import ManagerGroupEmployee from "src/pages/GroupEmployee/ManageGroupEmployee/ManagerGroupEmployee";
import Subsystem from "src/pages/Subsystem";
import AccessPlatform from "src/pages/AccessPlatform";
import ManageAccessPlatform from "src/pages/AccessPlatform/ManageAccessPlatform/ManageAccessPlatform";
import Category from "src/pages/Category";
import ManageCategory from "src/pages/Category/ManageCategory/ManageCategory";
import Database from "src/pages/Database";
import ManageDatabase from "src/pages/Database/ManageDatabase/ManageDatabase";
import Service from "src/pages/Service";
import ManageService from "src/pages/Service/ManageService/ManageService";
import Contract from "src/pages/Contract";
import ManageContract from "src/pages/Contract/ManageContract/ManageContract";
import Customer from "src/pages/Customer";
import ManageCustomer from "src/pages/Customer/ManageCustomer/ManageCustomer";

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
    path: "group-employee/*",
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
  {
    path: "database/*",
    element: <Database />,
    allowedRoles: [RoleType.STORE_OWNER, RoleType.MANAGER],
    children: [
      {
        path: "",
        element: <Database />,
      },
      {
        path: "create",
        element: <ManageDatabase />,
      },
      {
        path: ":id",
        element: <ManageDatabase />,
      },
    ],
  },
  {
    path: "subsystem/*",
    element: <Subsystem />,
    allowedRoles: [RoleType.STORE_OWNER, RoleType.MANAGER],
    children: [
      {
        path: "",
        element: <Subsystem />,
      },
    ],
  },
  {
    path: "category/*",
    element: <Category />,
    allowedRoles: [RoleType.STORE_OWNER, RoleType.MANAGER],
    children: [
      {
        path: "",
        element: <Category />,
      },
      {
        path: "create",
        element: <ManageCategory />,
      },
      {
        path: ":id",
        element: <ManageCategory />,
      },
    ],
  },
  {
    path: "access-platform/*",
    element: <AccessPlatform />,
    allowedRoles: [RoleType.STORE_OWNER, RoleType.MANAGER],
    children: [
      {
        path: "",
        element: <AccessPlatform />,
      },
      {
        path: "create",
        element: <ManageAccessPlatform />,
      },
      {
        path: ":id",
        element: <ManageAccessPlatform />,
      },
    ],
  },
  {
    path: "service/*",
    element: <Service />,
    allowedRoles: [RoleType.STORE_OWNER, RoleType.MANAGER],
    children: [
      {
        path: "",
        element: <Service />,
      },
      {
        path: "create",
        element: <ManageService />,
      },
      {
        path: ":id",
        element: <ManageService />,
      },
    ],
  },
  {
    path: "contract/*",
    element: <Contract />,
    allowedRoles: [RoleType.STORE_OWNER, RoleType.MANAGER],
    children: [
      {
        path: "",
        element: <Contract />,
      },
      {
        path: "create",
        element: <ManageContract />,
      },
      {
        path: ":id",
        element: <ManageContract />,
      },
    ],
  },
  {
    path: "customer/*",
    element: <Customer />,
    allowedRoles: [RoleType.STORE_OWNER, RoleType.MANAGER],
    children: [
      {
        path: "",
        element: <Customer />,
      },
      {
        path: "create",
        element: <ManageCustomer />,
      },
      {
        path: ":id",
        element: <ManageCustomer />,
      },
    ],
  },
];

const cmsRoutes = routeConfigs.map(wrapRoute);

export default cmsRoutes;
