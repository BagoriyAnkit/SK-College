import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, LogOut, ChevronDown, ExternalLink } from "lucide-react";
import { getAuthUser, clearAuth } from "../utils/auth";

export default function ProfileDropdown() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const authUser = getAuthUser();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleManageUsers = () => {
    setOpen(false);
    navigate("/admin/user");
  };

  const handleLogout = () => {
    setOpen(false);
    clearAuth();
    navigate("/admin/login");
  };

  const role = String(authUser?.role || "").toLowerCase().trim();
  const isAdmin = role === "admin";

  const getRoleBadge = () => {
    switch (role) {
      case "admin":
        return { label: "Admin", style: "bg-blue-100 text-blue-700 border-blue-200" };
      case "hod":
        return { label: "HOD", style: "bg-indigo-100 text-indigo-700 border-indigo-200" };
      case "teacher":
        return { label: "Teacher", style: "bg-emerald-100 text-emerald-700 border-emerald-200" };
      case "accountant":
        return { label: "Accountant", style: "bg-amber-100 text-amber-700 border-amber-200" };
      default:
        return { label: "Staff", style: "bg-slate-100 text-slate-700 border-slate-200" };
    }
  };

  const roleBadge = getRoleBadge();
  const userInitial = authUser?.name ? authUser.name.charAt(0).toUpperCase() : "U";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-100 transition-colors focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
        aria-expanded={open}
      >
        <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs shrink-0">
          {userInitial}
        </div>

        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[120px]">
            {authUser?.name || "Profile"}
          </span>
          <span className="text-[10px] text-slate-500 capitalize">
            {roleBadge.label}
          </span>
        </div>

        <ChevronDown
          size={16}
          className={`text-slate-500 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/80">
            <p className="text-[11px] font-medium text-slate-500">Signed in as</p>
            <p className="text-sm font-semibold text-slate-900 truncate">
              {authUser?.name || "Staff Member"}
            </p>
            <p className="text-xs text-slate-500 truncate mb-1">
              {authUser?.email || ""}
            </p>
            <span
              className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${roleBadge.style}`}
            >
              Role: {roleBadge.label}
            </span>
          </div>

          <div className="py-1">
            {isAdmin && (
              <button
                type="button"
                onClick={handleManageUsers}
                className="flex items-center gap-2.5 w-full px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors text-left"
              >
                <User size={15} className="text-slate-500" />
                <span>Staff Account Management</span>
              </button>
            )}

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between w-full px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors text-left sm:hidden"
            >
              <span className="flex items-center gap-2.5">
                <ExternalLink size={15} className="text-slate-500" />
                <span>Public Website</span>
              </span>
            </a>
          </div>

          <div className="border-t border-slate-100 py-1 bg-slate-50/50">
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2.5 w-full px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors text-left"
            >
              <LogOut size={15} className="text-rose-500" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
