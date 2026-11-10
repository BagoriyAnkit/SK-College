import React from "react";
import { Link } from "react-router-dom";
import {
  X,
  Users,
  BookOpen,
  Calendar,
  User,
  Mail,
  Phone,
  UserCheck,
  UserX,
  Edit2
} from "lucide-react";

export default function BatchDetailsModal({ open, onClose, batch, canManage = true }) {
  if (!open || !batch) return null;

  const isActive = batch.status === true || String(batch.status).toLowerCase() === "active";

  const courseTitle =
    batch.course?.courseName ||
    (typeof batch.courseName === "object" && batch.courseName ? batch.courseName.courseName : batch.courseName) ||
    "Not Assigned";

  const courseCode = batch.course?.courseCode || "";

  const teacherName =
    typeof batch.classTeacher === "object" && batch.classTeacher
      ? batch.classTeacher.TeacherName
      : (typeof batch.classTeacher === "string" && batch.classTeacher.trim() ? batch.classTeacher : "Not Assigned");

  const teacherEmail = typeof batch.classTeacher === "object" ? batch.classTeacher?.Email : null;
  const teacherPhone = typeof batch.classTeacher === "object" ? batch.classTeacher?.PhoneNumber : null;
  const teacherDept = typeof batch.classTeacher === "object" ? batch.classTeacher?.Department : null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-900"></span>
            <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase">
              Batch Cohort Details
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
              <Users className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-slate-900 truncate">
                {batch.batchName || "Academic Batch"}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  {batch.session || "Session N/A"}
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
            {/* Linked Course */}
            <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5 mb-1.5">
                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                Linked Academic Course
              </span>
              <p className="font-semibold text-slate-800 leading-snug">{courseTitle}</p>
              {courseCode && (
                <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-200/70 text-slate-700">
                  Code: {courseCode}
                </span>
              )}
            </div>

            {/* Total Capacity */}
            <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5 mb-1.5">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                Intake Capacity
              </span>
              <p className="text-base font-bold text-slate-800">{batch.strength || 0} Seats</p>
              <span className="text-[10px] text-slate-500">Maximum enrolled student seats</span>
            </div>

            {/* Class Teacher Information */}
            <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 sm:col-span-2">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5 mb-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Class Teacher / Mentor
              </span>
              <p className="font-semibold text-slate-900 text-sm">{teacherName}</p>
              {teacherDept && (
                <p className="text-slate-500 text-[11px] mt-0.5">Department: {teacherDept}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 mt-2 pt-2 border-t border-slate-200/60 text-slate-600">
                {teacherEmail && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono text-[11px]">{teacherEmail}</span>
                  </div>
                )}
                {teacherPhone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono text-[11px]">{String(teacherPhone)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-200 flex items-center justify-between gap-3">
          {canManage ? (
            <Link
              to={`/admin/batch/edit/${batch._id}`}
              state={{ batch }}
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition"
            >
              <Edit2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Edit Batch</span>
            </Link>
          ) : (
            <div />
          )}

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
