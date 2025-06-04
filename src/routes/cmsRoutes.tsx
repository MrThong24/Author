import { Navigate, Outlet } from "react-router-dom";

import RequestHistoryDetail from "src/cms/pages/Request/components/History/RequestHistoryDetail";
import useAuthStore from "src/store/authStore";
import { Role } from "src/types/user.type";
import { RoleType } from "src/shared/common/enum";
import Customer from "src/cms/pages/Customer";
import Product from "src/cms/pages/Product";
import ManageProduct from "src/cms/pages/Product/ManageProduct/ManageProduct";
import Review from "src/cms/pages/Review";
import Employee from "src/cms/pages/Employee";
import ManageEmployee from "src/cms/pages/Employee/ManageEmployee/ManageEmployee";
import Request from "src/cms/pages/Request";
import ManageRequest from "src/cms/pages/Request/components/ManageRequest";
import RequestHistory from "src/cms/pages/Request/components/History/RequestHistory";
import User from "src/cms/pages/User";
import Order from "src/cms/pages/Order";
import ManageOrder from "src/cms/pages/Order/ManageOrder/ManageOrder";
import OrderInvoice from "src/cms/pages/Order/ManageOrder/OrderInvoice/OrderInvoice";
import ChangePassword from "src/cms/pages/ChangePassword";
import Table from "src/cms/pages/Table";
import RequestTypeWrapper from "src/cms/pages/Request/RequestTypeWrapper";
import Company from "src/cms/pages/Company";
import Store from "src/cms/pages/Store";
import ManageStore from "src/cms/pages/Store/ManageStore/ManageStore";
import KitchenInProgress from "src/cms/pages/Kitchen/InProgress/KitchenInProgress";
import KitchenPending from "src/cms/pages/Kitchen/Pending/KitchenPending";
import History from "src/cms/pages/Kitchen/History";
import TableInProgressDetail from "src/cms/pages/Kitchen/InProgress/Tabs/TableInProgressDetail";
import TableRequestPendingDetail from "src/cms/pages/Kitchen/Pending/Tabs/TableRequestPendingDetail";
import AllProgressDetail from "src/cms/pages/Kitchen/InProgress/Tabs/AllProgressDetail";
import Overview from "src/cms/pages/Dashboard/Overview";
import RevenueTracking from "src/cms/pages/Dashboard/RevenueTracking";
import ImportProduct from "src/cms/pages/Product/ImportProduct/ImportProduct";

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
const RoleBasedRedirect = () => {
  const { currentUser } = useAuthStore();

  const role = currentUser?.currentUserStore?.role;

  switch (role) {
    case RoleType.STORE_OWNER:
    case RoleType.MANAGER:
    case RoleType.STAFF:
      return <Navigate to="/request/order" replace />;
    case RoleType.CHEF:
      return <Navigate to="/kitchen/inprogress" replace />;
    default:
      return <Navigate to="/unauthorized" replace />;
  }
};
// Route configurations
const routeConfigs: RouteConfig[] = [
  {
    path: "",
    element: <RoleBasedRedirect />,
  },
  {
    path: "product/*",
    element: <Product />,
    children: [
      {
        path: "",
        element: <Product />,
      },
      {
        path: "create",
        element: <ManageProduct />,
      },
      {
        path: "import",
        element: <ImportProduct />,
      },
      {
        path: ":id",
        element: <ManageProduct />,
      },
    ],
    allowedRoles: [RoleType.STORE_OWNER, RoleType.MANAGER],
  },
  {
    path: "kitchen/*",
    element: <KitchenInProgress />,
    children: [
      {
        path: "inprogress",
        element: <KitchenInProgress />,
      },
      {
        path: "inprogress/history",
        element: <History />,
      },
      {
        path: "inprogress/table/:zoneId/:tableId",
        element: <TableInProgressDetail />,
      },
      {
        path: "inprogress/product/:productId/:zoneId/:tableId",
        element: <AllProgressDetail />,
      },
    ],
    allowedRoles: [
      RoleType.STORE_OWNER,
      RoleType.MANAGER,
      RoleType.CHEF,
      RoleType.STAFF,
    ],
  },
  {
    path: "review",
    element: <Review />,
    allowedRoles: [RoleType.STORE_OWNER, RoleType.MANAGER],
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
    path: "request",
    element: <Request />,
    children: [
      {
        path: ":type",
        element: <RequestTypeWrapper />,
      },
      {
        path: "detail/:id",
        element: <ManageRequest />,
      },
      {
        path: ":type/history",
        element: <RequestHistory />,
      },
      {
        path: "history/:id",
        element: <RequestHistoryDetail />,
      },
      {
        path: "pending",
        element: <KitchenPending />,
      },
      {
        path: "pending/history",
        element: <History />,
      },
      {
        path: "pending/table/:zoneId/:tableId",
        element: <TableRequestPendingDetail />,
      },
    ],
    allowedRoles: [RoleType.STORE_OWNER, RoleType.MANAGER, RoleType.STAFF],
  },
  {
    path: "user",
    element: <User />,
  },
  {
    path: "company",
    element: <Company />,
    allowedRoles: [RoleType.STORE_OWNER],
  },
  {
    path: "table",
    element: <Table />,
    allowedRoles: [RoleType.STORE_OWNER, RoleType.MANAGER, RoleType.STAFF],
  },
  {
    path: "order/*",
    element: <Order />,
    children: [
      {
        path: "",
        element: <Order />,
      },
      {
        path: ":id",
        element: <ManageOrder />,
      },
      {
        path: ":id/invoice",
        element: <OrderInvoice />,
      },
    ],
    allowedRoles: [RoleType.STORE_OWNER, RoleType.MANAGER, RoleType.STAFF],
  },
  {
    path: "changePassword",
    element: <ChangePassword />,
  },
  {
    path: "customer",
    element: <Customer />,
    allowedRoles: [RoleType.STORE_OWNER, RoleType.MANAGER, RoleType.STAFF],
  },
  // {
  //   path: 'request-transferred',
  //   element: <RequestTransferred />,
  //   children: [
  //     {
  //       path: '',
  //       element: <RequestTransferred />
  //     },
  //     {
  //       path: 'history',
  //       element: <HistoryRequestTransferred />
  //     },
  //     {
  //       path: ':id',
  //       element: <RequestTransferredDetail />
  //     }
  //   ],
  //   allowedRoles: [RoleType.STORE_OWNER, RoleType.MANAGER, RoleType.STAFF]
  // },
  {
    path: "store/*",
    element: <Store />,
    allowedRoles: [RoleType.STORE_OWNER],
    children: [
      {
        path: "",
        element: <Store />,
      },
      {
        path: "create",
        element: <ManageStore />,
      },
      {
        path: ":id",
        element: <ManageStore />,
      },
    ],
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
        element: <RevenueTracking />,
      },
    ],
  },
];

// Process routes with the wrapper
const cmsRoutes = routeConfigs.map(wrapRoute);

export default cmsRoutes;
