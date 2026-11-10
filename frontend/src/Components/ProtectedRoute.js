import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getAuthUser } from "../utils/auth";
import Unauthorized from "./Unauthorized";

/**
 * Reusable ProtectedRoute component for React Router v6.
 * Checks authentication status and validates role permissions.
 *
 * @param {Array<string>} [allowedRoles] - Roles permitted to access the route.
 * @param {React.ReactNode} [children] - Optional child elements (if not using nested routes/Outlet).
 */
export default function ProtectedRoute({ allowedRoles, children }) {
  const location = useLocation();
  const authUser = getAuthUser();

  // 1. Unauthenticated: redirect to login
  if (!authUser) {
    const isStaffRoute = location.pathname.startsWith("/admin");
    const loginTarget = isStaffRoute ? "/admin/login" : "/login";
    return <Navigate to={loginTarget} state={{ from: location }} replace />;
  }

  // 2. Role validation (if specific roles are required)
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = String(authUser.role || "").toLowerCase().trim();
    const normalizedAllowed = allowedRoles.map((r) =>
      String(r).toLowerCase().trim()
    );

    if (!normalizedAllowed.includes(userRole)) {
      // Role mismatch: render in-place Unauthorized fallback
      return (
        <Unauthorized
          currentRole={authUser.role}
          allowedRoles={normalizedAllowed}
        />
      );
    }
  }

  // 3. Permitted: render children or Outlet for nested routes
  return children ? children : <Outlet />;
}
