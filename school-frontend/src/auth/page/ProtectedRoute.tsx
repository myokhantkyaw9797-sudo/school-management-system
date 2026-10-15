
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

interface ProtectedRouteProps {
  allowedRoles: string[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const token = useAuthStore((state) => state.token);
  const userRole = useAuthStore((state) => state.role);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // ROLE_ Prefix ပါသည်ဖြစ်စေ၊ မပါသည်ဖြစ်စေ ကိုက်ညီမှု စစ်ဆေးခြင်း
  const hasRole = allowedRoles.some((allowed) => {
    if (!userRole) return false;
    const cleanUserRole = String(userRole).toUpperCase().replace('ROLE_', '');
    const cleanAllowed = String(allowed).toUpperCase().replace('ROLE_', '');
    return cleanUserRole === cleanAllowed;
  });

  if (!hasRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};