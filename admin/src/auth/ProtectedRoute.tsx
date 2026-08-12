import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "./AuthContext";
import { PageState } from "../components/PageState";

export function ProtectedRoute() {
  const { status } = useAuth();

  if (status === "booting") {
    return <PageState kind="loading" title="Restoring session" message="Checking administrator access." />;
  }

  if (status !== "authenticated") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
