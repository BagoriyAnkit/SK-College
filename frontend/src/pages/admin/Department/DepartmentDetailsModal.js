import React from "react";
import { Link } from "react-router-dom";
import {
  X,
  Building2,
  User,
  Mail,
  Phone,
  GraduationCap,
  FileText,
  UserCheck,
  UserX,
  Edit2
} from "lucide-react";

export default function DepartmentDetailsModal({ open, onClose, department }) {
  if (!open || !department) return null;

  const hod = department.hod;
  const hodName =
    hod?.TeacherName ||
    (typeof department.HOD === "object" && department.HOD
      ? department.HOD.TeacherName
      : department.HOD) ||
    "Not Assigned";

  const isActive = department.Status === true || String(department.Status).toLowerCase() === "active";

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-900"></span>
            <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase">
              Department Profile
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
            <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-sm shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-slate-900 truncate">
                {department.DepartmentName || "Academic Department"}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex px-2 py-0.5 rounded-md font-mono text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200 uppercase">
                  {department.DepartmentCode || "NO-CODE"}
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
            {/* HOD Full Name */}
            <div className="p-3 rounded-lg bg-slate-50/80 border border-slate-100">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5 mb-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Head of Department (HOD)
              </span>
              <p className="font-semibold text-slate-800">{hodName}</p>
            </div>

            {/* HOD Email */}
            <div className="p-3 rounded-lg bg-slate-50/80 border border-slate-100">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5 mb-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                HOD Email
              </span>
              <p className="font-semibold text-slate-800 break-all">{hod?.Email || "N/A"}</p>
            </div>

            {/* HOD Phone */}
            <div className="p-3 rounded-lg bg-slate-50/80 border border-slate-100">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5 mb-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                HOD Contact
              </span>
              <p className="font-semibold text-slate-800">
                {hod?.PhoneNumber !== undefined && hod?.PhoneNumber !== null
                  ? String(hod.PhoneNumber)
                  : "N/A"}
              </p>
            </div>

            {/* HOD Qualification */}
            <div className="p-3 rounded-lg bg-slate-50/80 border border-slate-100">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5 mb-1">
                <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                HOD Credentials
              </span>
              <p className="font-semibold text-slate-800">{hod?.Qualification || "Not specified"}</p>
            </div>

            {/* Description */}
            <div className="p-3 rounded-lg bg-slate-50/80 border border-slate-100 sm:col-span-2">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5 mb-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                Mission & Description
              </span>
              <p className="font-medium text-slate-700 leading-relaxed">
                {department.Description || "No department description provided."}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-200 flex items-center justify-between gap-3">
          <Link
            to={`/admin/department/edit/${department._id}`}
            state={{ department }}
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition"
          >
            <Edit2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Edit Department</span>
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