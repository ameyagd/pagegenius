import { Navigate } from 'react-router-dom';
import { useAuth } from './LandingPageManager/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { partner, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!partner) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;