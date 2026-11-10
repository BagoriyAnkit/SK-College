import React from "react";
import { Link } from "react-router-dom";
import {
  X,
  User,
  Phone,
  Mail,
  Building2,
  GraduationCap,
  Briefcase,
  UserCheck,
  UserX,
  Edit2
} from "lucide-react";

export default function TeacherDeatials({ open, onClose, Teacher }) {
  if (!open) return null;

  const departmentName =
    Teacher?.department?.DepartmentName ||
    (typeof Teacher?.Department === 'object' && Teacher?.Department
      ? Teacher?.Department?.DepartmentName
      : Teacher?.Department) ||
    'General Faculty';

  const departmentCode = Teacher?.department?.DepartmentCode
    ? ` (${Teacher.department.DepartmentCode})`
    : '';

  const initials = String(Teacher?.TeacherName || 'F')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'F';

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-900"></span>
            <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase">
              Faculty Profile
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
                {Teacher?.TeacherName || 'Faculty Member'}
              </h2>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{departmentName}{departmentCode}</span>
              </p>
            </div>
            <div>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                  String(Teacher?.status || 'Active').toLowerCase() === "active"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-slate-100 text-slate-600 border-slate-200"
                }`}
              >
                {String(Teacher?.status || 'Active').toLowerCase() === "active" ? (
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

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Email */}
            <div className="p-3 rounded-lg bg-slate-50/80 border border-slate-100">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5 mb-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                Email Address
              </span>
              <p className="font-semibold text-slate-800 break-all">{Teacher?.Email || '-'}</p>
            </div>

            {/* Phone */}
            <div className="p-3 rounded-lg bg-slate-50/80 border border-slate-100">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5 mb-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                Phone Number
              </span>
              <p className="font-semibold text-slate-800">{Teacher?.PhoneNumber !== undefined && Teacher?.PhoneNumber !== null ? String(Teacher.PhoneNumber) : '-'}</p>
            </div>

            {/* Qualification */}
            <div className="p-3 rounded-lg bg-slate-50/80 border border-slate-100">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5 mb-1">
                <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                Qualification
              </span>
              <p className="font-semibold text-slate-800">{Teacher?.Qualification || '-'}</p>
            </div>

            {/* Experience */}
            <div className="p-3 rounded-lg bg-slate-50/80 border border-slate-100">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5 mb-1">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                Teaching Experience
              </span>
              <p className="font-semibold text-slate-800">{Teacher?.Experience || '-'}</p>
            </div>

            {/* Gender */}
            <div className="p-3 rounded-lg bg-slate-50/80 border border-slate-100">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5 mb-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Gender
              </span>
              <p className="font-semibold text-slate-800">{Teacher?.gender || '-'}</p>
            </div>

            {/* Department Record */}
            <div className="p-3 rounded-lg bg-slate-50/80 border border-slate-100">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5 mb-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                Assigned Department
              </span>
              <p className="font-semibold text-slate-800">{departmentName}</p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-200 flex items-center justify-between gap-3">
          {Teacher?._id ? (
            <Link
              to={`/admin/teacher/edit/${Teacher._id}`}
              state={{ Teacher }}
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition"
            >
              <Edit2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Edit Profile</span>
            </Link>
          ) : <div />}

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