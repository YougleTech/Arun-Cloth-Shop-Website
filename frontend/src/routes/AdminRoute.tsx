import type { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const AdminRoute = ({ children }: { children: ReactElement }) => {
  const { state } = useAuth();

  if (!state.rehydrated) {
    return <div className="p-6">🔄 Loading admin access...</div>;
  }

  if (!state.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!state.user?.is_staff) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default AdminRoute;
