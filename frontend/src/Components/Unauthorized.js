import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ShieldAlert, ArrowLeft, LogOut, Home } from "lucide-react";
import { getAuthUser, clearAuth, getRedirectPathForRole } from "../utils/auth";

export default function Unauthorized({ currentRole, allowedRoles }) {
  const navigate = useNavigate();
  const location = useLocation();
  const authUser = getAuthUser();
  const role = currentRole || authUser?.role || "user";

  const handleGoHome = () => {
    const destination = getRedirectPathForRole(role);
    navigate(destination, { replace: true });
  };

  const handleLogout = () => {
    clearAuth();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-100 flex items-center justify-center text-red-600">
          <ShieldAlert size={36} />
        </div>

        <h1 className="text-2xl font-bold text-slate-800">
          Access Denied
        </h1>

        <p className="text-slate-500 mt-2 text-sm leading-relaxed">
          You do not have permission to access{" "}
          <span className="font-semibold text-slate-700">
            {location.pathname}
          </span>
          .
        </p>

        <div className="my-6 p-4 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs text-slate-600 space-y-1">
          <p>
            <span className="font-semibold">Current Role:</span>{" "}
            <span className="uppercase font-bold text-violet-700 bg-violet-100 px-2 py-0.5 rounded">
              {role}
            </span>
          </p>
          {allowedRoles && allowedRoles.length > 0 && (
            <p>
              <span className="font-semibold">Allowed Role(s):</span>{" "}
              {allowedRoles.map((r) => r.toUpperCase()).join(", ")}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleGoHome}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium text-sm transition flex items-center justify-center gap-2"
          >
            <Home size={16} />
            Go to My Portal
          </button>

          <button
            onClick={handleLogout}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm transition flex items-center justify-center gap-2"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
