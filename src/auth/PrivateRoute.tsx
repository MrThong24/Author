import { Navigate } from 'react-router-dom';
import { getAccessTokenFromLS } from 'src/shared/utils/auth';

interface PrivateRouteProps {
  children: JSX.Element;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  return getAccessTokenFromLS() ? children : <Navigate to='/login' replace />;
};

export default PrivateRoute;
