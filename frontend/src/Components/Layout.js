import React, { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getAuthUser } from "../utils/auth";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const authUser = getAuthUser();

  if (!authUser) {
    return <Navigate to="/admin/login" replace />;
  }

  // Students are not permitted in admin layout; redirect safely to student portal
  if (authUser.role === "student") {
    return <Navigate to="/portal" replace />;
  }

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800 antialiased font-sans">
      {/* Dark Navy Sidebar */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area (Offset by 120px on desktop to accommodate fixed sidebar) */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen lg:pl-[120px]">
        {/* Sticky Top Header */}
        <Header onMenuClick={() => setMobileOpen(true)} />

        {/* Dynamic Workspace Route View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1700px] w-full mx-auto">
          <Outlet />
        </main>

        {/* Minimal Admin Footer */}
        <Footer />
      </div>
    </div>
  );
}
