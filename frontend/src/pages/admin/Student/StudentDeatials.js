import React from "react";
import { X, User, BookOpen, Phone, Mail, MapPin, Calendar, Layers, Building2, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

export default function StudentDeatials({ open, onClose, student }) {
  if (!open || !student) return null;

  const batchDisplay =
    typeof student.batch === "object"
      ? (student.batch?.batchName || "N/A")
      : (student.batch || "N/A");

  const departmentDisplay =
    typeof student.department === "object"
      ? (student.department?.DepartmentName || "N/A")
      : (student.department || "N/A");

  const initial = student.StudentName ? student.StudentName.charAt(0).toUpperCase() : "S";

  return (
    <div className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4 backdrop-blur-2xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm border border-blue-200">
              {initial}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                {student.StudentName}
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                Roll No: <span className="font-semibold text-slate-800">{student.rollNumber || "N/A"}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                student.status === "Active"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-slate-100 text-slate-600 border border-slate-200"
              }`}
            >
              {student.status || "Inactive"}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          {/* Academic Profile */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
              <BookOpen size={14} className="text-blue-600" />
              <span>Academic Details</span>
            </h3>
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200/80">
              <div>
                <span className="text-slate-400 block text-[11px]">Course Program</span>
                <span className="font-semibold text-slate-900">{student.Course || "N/A"}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Current Semester</span>
                <span className="font-semibold text-slate-900">Semester {student.semester || 1}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Academic Batch</span>
                <span className="font-semibold text-slate-900">{batchDisplay}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Department</span>
                <span className="font-semibold text-slate-900">{departmentDisplay}</span>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
              <User size={14} className="text-blue-600" />
              <span>Personal &amp; Contact Details</span>
            </h3>
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200/80">
              <div>
                <span className="text-slate-400 block text-[11px]">Email Address</span>
                <span className="font-medium text-slate-900 break-all">{student.email || "N/A"}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Phone Number</span>
                <span className="font-medium text-slate-900">{student.Phonenumber || "N/A"}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Date of Birth</span>
                <span className="font-medium text-slate-900">
                  {student.dob ? new Date(student.dob).toLocaleDateString("en-GB") : "N/A"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Address</span>
                <span className="font-medium text-slate-900">{student.address || "N/A"}</span>
              </div>
            </div>
          </div>

          {/* Guardian Information */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-blue-600" />
              <span>Parent / Guardian Information</span>
            </h3>
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200/80">
              <div>
                <span className="text-slate-400 block text-[11px]">Guardian Name</span>
                <span className="font-semibold text-slate-900">{student.parentName || "N/A"}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Guardian Contact</span>
                <span className="font-medium text-slate-900">{student.parentContact || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2.5">
          <Link
            to={`/admin/Student/edit/${student._id}`}
            state={{ student }}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition"
          >
            Edit Student Details
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
