import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function GuestRoute() {
  const { isAuthenticated, isGuest, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          color: "var(--color-text)",
        }}
      >
        Loading...
      </div>
    );
  }

  // Allow access if authenticated OR in guest mode
  if (!isAuthenticated && !isGuest) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
