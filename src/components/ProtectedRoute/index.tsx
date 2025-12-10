import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  allowedRoles: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { userRole, token } = useAuth();
  const location = useLocation();

  // ** Redirect to login if not authenticated **
  if (!token) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // ** Redirect to unauthorized page if the user doesn't have the required role **
  if (userRole && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  // ** If the user has access, render the protected component **
  return <Outlet />;
};

export default ProtectedRoute;

