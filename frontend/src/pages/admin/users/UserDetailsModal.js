import React from "react";
import { Link } from "react-router-dom";
import {
  X,
  User,
  Phone,
  Mail,
  Shield,
  Building2,
  GraduationCap,
  UserCheck,
  UserX,
  Edit2,
  Calendar
} from "lucide-react";

export default function UserDetailsModal({ open, onClose, user }) {
  if (!open || !user) return null;

  const facultyInfo = user.facultyId;
  const deptName =
    facultyInfo?.Department ||
    facultyInfo?.department?.DepartmentName ||
    (typeof facultyInfo?.department === "string" ? facultyInfo.department : null);

  const initials = String(user.name || "U")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "U";

  const getRoleBadge = (role) => {
    const normalized = String(role || "staff").toLowerCase().trim();
    switch (normalized) {
      case "admin":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "hod":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "teacher":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "accountant":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const isActive = String(user.status || "Active").toLowerCase() === "active";

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-900"></span>
            <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase">
              Staff Account Profile
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Identity Header */}
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-lg font-bold shadow-sm">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-slate-900 truncate">
                {user.name || "Staff Member"}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getRoleBadge(
                    user.role
                  )}`}
                >
                  <Shield className="w-3 h-3 mr-1" />
                  {user.role || "Staff"}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-slate-100 text-slate-600 border-slate-200"
                  }`}
                >
                  {isActive ? (
                    <>
                      <UserCheck className="w-3 h-3 text-emerald-600" />
                      <span>Active</span>
                    </>
                  ) : (
                    <>
                      <UserX className="w-3 h-3 text-slate-500" />
                      <span>Inactive</span>
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            {/* Email */}
            <div className="p-3 rounded-lg bg-slate-50/80 border border-slate-100">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5 mb-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                Login Username / Email
              </span>
              <p className="font-semibold text-slate-800 break-all">{user.email || "-"}</p>
            </div>

            {/* Contact Phone */}
            <div className="p-3 rounded-lg bg-slate-50/80 border border-slate-100">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5 mb-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                Contact Phone
              </span>
              <p className="font-semibold text-slate-800">
                {user.phone || facultyInfo?.PhoneNumber || "Not provided"}
              </p>
            </div>

            {/* Linked Faculty Member */}
            <div className="p-3 rounded-lg bg-slate-50/80 border border-slate-100">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5 mb-1">
                <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                Linked Faculty Profile
              </span>
              <p className="font-semibold text-slate-800">
                {facultyInfo?.TeacherName || "Standalone Account (No Link)"}
              </p>
            </div>

            {/* Associated Department */}
            <div className="p-3 rounded-lg bg-slate-50/80 border border-slate-100">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5 mb-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                Department
              </span>
              <p className="font-semibold text-slate-800">{deptName || "General / Admin"}</p>
            </div>

            {/* Account Created At */}
            {user.createdAt && (
              <div className="p-3 rounded-lg bg-slate-50/80 border border-slate-100 sm:col-span-2">
                <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Account Registration Date
                </span>
                <p className="font-semibold text-slate-800">
                  {new Date(user.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  })}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-200 flex items-center justify-between gap-3">
          <Link
            to={`/admin/user/edit/${user._id}`}
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition"
          >
            <Edit2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Edit Account</span>
          </Link>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}