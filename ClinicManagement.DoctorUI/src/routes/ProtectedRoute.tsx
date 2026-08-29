import { Navigate } from 'react-router-dom';
import { useAuth } from '../Auth/context/AuthProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
}

export default function ProtectedRoute({
  children,
  roles,
}: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();

  // Chưa đăng nhập
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Route không yêu cầu role
  if (!roles || roles.length === 0) {
    return <>{children}</>;
  }

  // Kiểm tra role
  const hasPermission = user?.roles?.some(
    (userRole) => roles.includes(userRole)
  );

  // Không có quyền
  if (!hasPermission) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}