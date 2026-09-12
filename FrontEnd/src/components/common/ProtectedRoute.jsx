import { Navigate, Outlet } from 'react-router-dom';
import { useUserContext } from '../../contexts/UseUserContext.jsx'; 
import { getStudentDashboardPath } from "../../pages/Student/studentPath.js";

export default function ProtectedRoute({ children, adminOnly = false, allowedRoles }) {
  const { user, accessToken, loading } = useUserContext(); 

  
  if (loading) {
    return <div className="loading-spinner">Loading authentication...</div>; 
  }

  if (!user || !accessToken) {
    return <Navigate to="/login" replace />;
  }

  const roles = allowedRoles ?? (adminOnly ? ["admin"] : null);

  if (roles && !roles.includes(user.role)) {
    if (user.role === "student") {
      return <Navigate to={getStudentDashboardPath(user)} replace />;
    }
    if (user.role === "admin") {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
}


