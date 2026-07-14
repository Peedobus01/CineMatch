import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted font-mono text-sm">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Send them to login, remembering where they were headed
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
