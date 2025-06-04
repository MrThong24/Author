import { Suspense, useEffect } from "react";
import { useRoutes, Navigate } from "react-router-dom";
import cmsRoutes from "./cmsRoutes";
import Login from "src/pages/Auth/Login";
import { clearLS } from "src/shared/utils/auth";
import PrivateRoute from "src/auth/PrivateRoute";
import { LoadingFullPage } from "src/shared/components/Loading/LoadingFullPage";
import Unauthorized from "src/pages/Unauthorized";
import useDismissPopupOnOrientationChange from "src/hooks/useDismissPopupOnOrientationChange";
import CMSLayout from "src/layouts/CMSLayout";

const AppRoutes = () => {
  useDismissPopupOnOrientationChange();

  useEffect(() => {
    const handleLogout = () => {
      clearLS();
    };
    window.addEventListener("logout", handleLogout);

    return () => {
      window.removeEventListener("logout", handleLogout);
    };
  }, []);

  const routes = useRoutes([
    {
      path: "/",
      element: (
        <Suspense fallback={<LoadingFullPage loading={true} />}>
          <PrivateRoute>
            <CMSLayout />
          </PrivateRoute>
        </Suspense>
      ),
      children: cmsRoutes,
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/unauthorized",
      element: <Unauthorized />,
    },
    {
      path: "*",
      element: <Navigate to="/404" replace />,
    },
  ]);

  return routes;
};

export default AppRoutes;
