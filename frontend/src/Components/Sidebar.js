import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getAuthUser } from "../utils/auth";
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  Building2,
  Layers,
  ClipboardList,
  Award,
  Wallet,
  FilePlus,
  Briefcase,
  Bell,
  Calendar,
  Image as ImageIcon,
  Info,
  Phone,
  FileText,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  X,
  ExternalLink
} from "lucide-react";
import logo from "../assets/SKcollege logo.png";

export default function Sidebar({ mobileOpen = false, setMobileOpen = () => {} }) {
  const location = useLocation();
  const authUser = getAuthUser();
  const role = String(authUser?.role || "").toLowerCase().trim();

  const isAdmin = role === "admin";
  const isHod = role === "hod";
  const isTeacher = role === "teacher";
  const isAccountant = role === "accountant";

  // Collapsible category states
  const [academicOpen, setAcademicOpen] = useState(true);
  const [managementOpen, setManagementOpen] = useState(true);
  const [contentOpen, setContentOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Active check helper
  const isActive = (path) => {
    if (path === "/admin/dashboard") {
      return location.pathname === "/admin/dashboard" || location.pathname === "/admin";
    }
    return location.pathname.toLowerCase().startsWith(path.toLowerCase());
  };

  const navLinkClass = (path) => {
    const active = isActive(path);
    return `group flex flex-col items-center justify-center p-2 rounded-lg text-center transition-all duration-150 ${
      active
        ? "bg-slate-800 text-blue-400 font-semibold shadow-xs ring-1 ring-blue-500/40"
        : "text-slate-400 hover:text-white hover:bg-slate-800/60"
    }`;
  };

  const sectionButtonClass =
    "w-full flex items-center justify-center gap-1 px-1 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200 transition-colors text-center";

  // Section access checks matching backend authorization rules
  const hasAcademicAccess = isAdmin || isHod || isTeacher || isAccountant;
  const hasManagementAccess = isAdmin || isHod || isAccountant;
  const hasContentAccess = isAdmin || isHod || isTeacher || isAccountant;
  const hasSettingsAccess = isAdmin;

  // Role display metadata
  const getRoleBadge = () => {
    switch (role) {
      case "admin":
        return { label: "Admin", bg: "bg-blue-500/20 text-blue-300 border-blue-500/30" };
      case "hod":
        return { label: "HOD", bg: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" };
      case "teacher":
        return { label: "Teacher", bg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" };
      case "accountant":
        return { label: "Accountant", bg: "bg-amber-500/20 text-amber-300 border-amber-500/30" };
      default:
        return { label: "Staff", bg: "bg-slate-500/20 text-slate-300 border-slate-500/30" };
    }
  };

  const roleInfo = getRoleBadge();

  const handleLinkClick = () => {
    if (setMobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Mini-Sidebar Shell (120px Width) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-[120px] h-screen h-[100dvh] bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out ${
          mobileOpen ? "translate-x-0 shadow-2xl z-50" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand & ERP Header */}
        <div className="h-16 px-2 border-b border-slate-800 flex flex-col items-center justify-center shrink-0 bg-slate-950/40 relative">
          <Link
            to="/admin/dashboard"
            onClick={handleLinkClick}
            className="flex flex-col items-center justify-center group"
            title="SK College ERP"
          >
            <img
              src={logo}
              alt="SK College"
              className="w-7 h-7 object-contain rounded-md p-0.5 bg-white/10"
            />
            <span className="text-[11px] font-bold text-white tracking-tight leading-tight group-hover:text-blue-400 transition-colors mt-0.5">
              SK COLLEGE
            </span>
          </Link>

          {/* Mobile close button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute top-2 right-2 p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
            aria-label="Close Sidebar"
          >
            <X size={16} />
          </button>
        </div>

        {/* User Role Card */}
        <div className="px-2 py-2 border-b border-slate-800/80 bg-slate-900/60 flex flex-col items-center text-center">
          <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 font-bold text-[11px] uppercase">
            {authUser?.name ? authUser.name.charAt(0) : "U"}
          </div>
          <span className="text-[10px] font-semibold text-slate-200 truncate w-full mt-1">
            {authUser?.name?.split(" ")[0] || "User"}
          </span>
          <span
            className={`inline-block text-[8px] font-bold px-1.5 py-0.2 rounded-full border mt-0.5 ${roleInfo.bg}`}
          >
            {roleInfo.label}
          </span>
        </div>

        {/* Scrollable Navigation List */}
        <nav 
          className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-1.5 py-2.5 space-y-2 text-slate-300 scrollbar-thin scrollbar-thumb-slate-700"
          style={{ scrollbarWidth: "thin" }}
        >
          {/* Main Core Links */}
          <div className="space-y-1">
            {(isAdmin || isHod || isTeacher || isAccountant) && (
              <Link
                to="/admin/dashboard"
                onClick={handleLinkClick}
                className={navLinkClass("/admin/dashboard")}
                title="Dashboard"
              >
                <LayoutDashboard size={18} className="shrink-0" />
                <span className="text-[10px] mt-1 leading-tight text-center">Dashboard</span>
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin/user"
                onClick={handleLinkClick}
                className={navLinkClass("/admin/user")}
                title="Staff Users"
              >
                <ShieldCheck size={18} className="shrink-0" />
                <span className="text-[10px] mt-1 leading-tight text-center">Staff</span>
              </Link>
            )}
          </div>

          {/* ================= ACADEMIC SECTION ================= */}
          {hasAcademicAccess && (
            <div className="pt-1 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setAcademicOpen(!academicOpen)}
                className={sectionButtonClass}
                title="Academic Core"
              >
                <span>Academic</span>
                {academicOpen ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
              </button>

              {academicOpen && (
                <div className="mt-1 space-y-1">
                  {(isAdmin || isHod || isTeacher || isAccountant) && (
                    <Link
                      to="/admin/student"
                      onClick={handleLinkClick}
                      className={navLinkClass("/admin/student")}
                      title="Students"
                    >
                      <GraduationCap size={18} className="shrink-0" />
                      <span className="text-[10px] mt-1 leading-tight text-center">Students</span>
                    </Link>
                  )}

                  {(isAdmin || isHod || isTeacher) && (
                    <Link
                      to="/admin/teacher"
                      onClick={handleLinkClick}
                      className={navLinkClass("/admin/teacher")}
                      title="Faculty"
                    >
                      <UserCheck size={18} className="shrink-0" />
                      <span className="text-[10px] mt-1 leading-tight text-center">Faculty</span>
                    </Link>
                  )}

                  {(isAdmin || isHod || isTeacher || isAccountant) && (
                    <Link
                      to="/admin/course"
                      onClick={handleLinkClick}
                      className={navLinkClass("/admin/course")}
                      title="Courses"
                    >
                      <BookOpen size={18} className="shrink-0" />
                      <span className="text-[10px] mt-1 leading-tight text-center">Courses</span>
                    </Link>
                  )}

                  {(isAdmin || isHod || isTeacher || isAccountant) && (
                    <Link
                      to="/admin/department"
                      onClick={handleLinkClick}
                      className={navLinkClass("/admin/department")}
                      title="Departments"
                    >
                      <Building2 size={18} className="shrink-0" />
                      <span className="text-[10px] mt-1 leading-tight text-center">Depts</span>
                    </Link>
                  )}

                  {(isAdmin || isHod || isTeacher || isAccountant) && (
                    <Link
                      to="/admin/batch"
                      onClick={handleLinkClick}
                      className={navLinkClass("/admin/batch")}
                      title="Batches"
                    >
                      <Layers size={18} className="shrink-0" />
                      <span className="text-[10px] mt-1 leading-tight text-center">Batches</span>
                    </Link>
                  )}

                  {(isAdmin || isHod || isTeacher) && (
                    <Link
                      to="/admin/exam"
                      onClick={handleLinkClick}
                      className={navLinkClass("/admin/exam")}
                      title="Exams & Marks"
                    >
                      <ClipboardList size={18} className="shrink-0" />
                      <span className="text-[10px] mt-1 leading-tight text-center">Exams</span>
                    </Link>
                  )}

                  {(isAdmin || isHod || isTeacher) && (
                    <Link
                      to="/admin/result"
                      onClick={handleLinkClick}
                      className={navLinkClass("/admin/result")}
                      title="Results & Marksheets"
                    >
                      <Award size={18} className="shrink-0" />
                      <span className="text-[10px] mt-1 leading-tight text-center">Results</span>
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ================= MANAGEMENT / OPERATIONS ================= */}
          {hasManagementAccess && (
            <div className="pt-1 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setManagementOpen(!managementOpen)}
                className={sectionButtonClass}
                title="Operations"
              >
                <span>Finance</span>
                {managementOpen ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
              </button>

              {managementOpen && (
                <div className="mt-1 space-y-1">
                  {(isAdmin || isAccountant) && (
                    <Link
                      to="/admin/fees"
                      onClick={handleLinkClick}
                      className={navLinkClass("/admin/fees")}
                      title="Fees & Receipts"
                    >
                      <Wallet size={18} className="shrink-0" />
                      <span className="text-[10px] mt-1 leading-tight text-center">Fees</span>
                    </Link>
                  )}

                  {(isAdmin || isHod || isAccountant) && (
                    <Link
                      to="/admin/addmissions"
                      onClick={handleLinkClick}
                      className={navLinkClass("/admin/addmissions")}
                      title="Admissions"
                    >
                      <FilePlus size={18} className="shrink-0" />
                      <span className="text-[10px] mt-1 leading-tight text-center">Admissions</span>
                    </Link>
                  )}

                  {(isAdmin || isHod) && (
                    <Link
                      to="/admin/placement"
                      onClick={handleLinkClick}
                      className={navLinkClass("/admin/placement")}
                      title="Placements"
                    >
                      <Briefcase size={18} className="shrink-0" />
                      <span className="text-[10px] mt-1 leading-tight text-center">Placements</span>
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ================= CONTENT & COMMUNICATIONS ================= */}
          {hasContentAccess && (
            <div className="pt-1 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setContentOpen(!contentOpen)}
                className={sectionButtonClass}
                title="Communications"
              >
                <span>Notice</span>
                {contentOpen ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
              </button>

              {contentOpen && (
                <div className="mt-1 space-y-1">
                  {(isAdmin || isHod || isTeacher || isAccountant) && (
                    <Link
                      to="/admin/notice"
                      onClick={handleLinkClick}
                      className={navLinkClass("/admin/notice")}
                      title="Notices"
                    >
                      <Bell size={18} className="shrink-0" />
                      <span className="text-[10px] mt-1 leading-tight text-center">Notices</span>
                    </Link>
                  )}

                  {(isAdmin || isHod) && (
                    <Link
                      to="/admin/event"
                      onClick={handleLinkClick}
                      className={navLinkClass("/admin/event")}
                      title="Events"
                    >
                      <Calendar size={18} className="shrink-0" />
                      <span className="text-[10px] mt-1 leading-tight text-center">Events</span>
                    </Link>
                  )}

                  {isAdmin && (
                    <Link
                      to="/admin/memories"
                      onClick={handleLinkClick}
                      className={navLinkClass("/admin/memories")}
                      title="Memories Gallery"
                    >
                      <ImageIcon size={18} className="shrink-0" />
                      <span className="text-[10px] mt-1 leading-tight text-center">Memories</span>
                    </Link>
                  )}

                  {isAdmin && (
                    <Link
                      to="/admin/about"
                      onClick={handleLinkClick}
                      className={navLinkClass("/admin/about")}
                      title="About Info"
                    >
                      <Info size={18} className="shrink-0" />
                      <span className="text-[10px] mt-1 leading-tight text-center">About</span>
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ================= SYSTEM SETTINGS ================= */}
          {hasSettingsAccess && (
            <div className="pt-1 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setSettingsOpen(!settingsOpen)}
                className={sectionButtonClass}
                title="System CMS"
              >
                <span>CMS</span>
                {settingsOpen ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
              </button>

              {settingsOpen && (
                <div className="mt-1 space-y-1">
                  <Link
                    to="/admin/contact"
                    onClick={handleLinkClick}
                    className={navLinkClass("/admin/contact")}
                    title="Contact Inquiries"
                  >
                    <Phone size={18} className="shrink-0" />
                    <span className="text-[10px] mt-1 leading-tight text-center">Contact</span>
                  </Link>

                  <Link
                    to="/admin/faq"
                    onClick={handleLinkClick}
                    className={navLinkClass("/admin/faq")}
                    title="FAQs"
                  >
                    <HelpCircle size={18} className="shrink-0" />
                    <span className="text-[10px] mt-1 leading-tight text-center">FAQs</span>
                  </Link>
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Footer Quick Action */}
        <div className="p-2 border-t border-slate-800 bg-slate-950/60">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Live College Website"
          >
            <ExternalLink size={16} />
            <span className="text-[9px] mt-0.5 text-center leading-tight">Live Site</span>
          </a>
        </div>
      </aside>
    </>
  );
}
