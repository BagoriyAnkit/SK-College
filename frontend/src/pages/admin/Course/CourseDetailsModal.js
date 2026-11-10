import React from "react";
import { Link } from "react-router-dom";
import {
  X,
  BookOpen,
  Building2,
  Clock,
  Layers,
  GraduationCap,
  FileText,
  UserCheck,
  UserX,
  Edit2
} from "lucide-react";

export default function CourseDetailsModal({ open, onClose, course }) {
  if (!open || !course) return null;

  const isActive = String(course.status || "Active").toLowerCase() === "active";

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-900"></span>
            <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase">
              Course Details
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
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-slate-900 truncate">
                {course.courseName || "Academic Program"}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex px-2 py-0.5 rounded-md font-mono text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                  {course.courseCode || "NO-CODE"}
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
            {/* Department */}
            <div className="p-3 rounded-lg bg-slate-50/80 border border-slate-100">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5 mb-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                Department
              </span>
              <p className="font-semibold text-slate-800">{course.department || "General"}</p>
            </div>

            {/* Course Type */}
            <div className="p-3 rounded-lg bg-slate-50/80 border border-slate-100">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5 mb-1">
                <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                Program Level
              </span>
              <p className="font-semibold text-slate-800">{course.courseType || "Undergraduate (UG)"}</p>
            </div>

            {/* Duration */}
            <div className="p-3 rounded-lg bg-slate-50/80 border border-slate-100">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5 mb-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Duration
              </span>
              <p className="font-semibold text-slate-800">{course.duration || "N/A"}</p>
            </div>

            {/* Total Semesters */}
            <div className="p-3 rounded-lg bg-slate-50/80 border border-slate-100">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5 mb-1">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                Academic Terms
              </span>
              <p className="font-semibold text-slate-800">{course.totalSemester} Semesters</p>
            </div>

            {/* Description */}
            <div className="p-3 rounded-lg bg-slate-50/80 border border-slate-100 sm:col-span-2">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5 mb-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                Curriculum Description
              </span>
              <p className="font-medium text-slate-700 leading-relaxed">
                {course.description || "No curriculum description provided."}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-200 flex items-center justify-between gap-3">
          <Link
            to={`/admin/course/edit/${course._id}`}
            state={{ course }}
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition"
          >
            <Edit2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Edit Course</span>
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