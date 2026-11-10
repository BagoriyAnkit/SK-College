import React from "react";
import moment from "moment";
import {
  X,
  GraduationCap,
  Calendar,
  BookOpen,
  Users,
  Award,
  Clock,
  CheckCircle2,
  Edit2,
  FileCheck
} from "lucide-react";

export default function ExamDetails({ open, onClose, exam, onOpenMarks }) {
  if (!open || !exam) return null;

  const examDateFormatted = exam.examDate
    ? moment(exam.examDate).format("DD/MM/YYYY")
    : (exam.StartDate ? moment(exam.StartDate).format("DD/MM/YYYY") : "N/A");

  const courseDisplay = exam.course?.courseName || exam.courseName || "General Course";
  const batchDisplay = exam.batch?.batchName || exam.batchName || exam.ClassId || "All Cohorts";
  const maxMarks = exam.maxMarks ?? exam.MaxMarks ?? 100;
  const minMarks = exam.minMarks ?? exam.MinMarks ?? 33;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 transition-all">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-900"></span>
            <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase">
              Exam Schedule Details
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 text-xs text-slate-700">
          {/* Identity Header */}
          <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xs shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 truncate">
                  {exam.examName || exam.ExamName}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  {exam.examType || "Semester"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 font-medium mt-1">
                <span className="font-semibold text-slate-800">{exam.subject || "Subject N/A"}</span>
                <span>•</span>
                <span>AY: {exam.academicYear || exam.AcademicYear || "2026-27"}</span>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-400 block font-medium">Academic Program</span>
              <span className="font-semibold text-slate-800 mt-0.5 block">{courseDisplay}</span>
            </div>

            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-400 block font-medium">Cohort / Batch</span>
              <span className="font-semibold text-slate-800 mt-0.5 block">{batchDisplay}</span>
            </div>

            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-400 block font-medium">Exam Date</span>
              <span className="font-semibold text-slate-800 mt-0.5 block font-mono">{examDateFormatted}</span>
            </div>

            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-400 block font-medium">Status</span>
              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md text-[11px] border border-emerald-200 mt-0.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>{exam.status || "Scheduled"}</span>
              </span>
            </div>

            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-400 block font-medium">Maximum Marks</span>
              <span className="text-sm font-bold text-slate-900 mt-0.5 block">{maxMarks} Marks</span>
            </div>

            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-400 block font-medium">Passing Threshold</span>
              <span className="text-sm font-bold text-slate-700 mt-0.5 block">{minMarks} Marks (Min)</span>
            </div>
          </div>

          {exam.marksCount !== undefined && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">Evaluated Candidates</span>
              <span className="font-bold text-slate-900">{exam.marksCount} Graded</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-200 flex items-center justify-between gap-3">
          {onOpenMarks && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenMarks(exam);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Enter / View Marks</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition ml-auto cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
