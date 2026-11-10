import React from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import {
  X,
  Briefcase,
  Building2,
  User,
  MapPin,
  Calendar,
  Award,
  Clock,
  Edit2,
  TrendingUp,
  Layers,
  CheckCircle2
} from "lucide-react";

export default function PlacementDetailsModal({
  open,
  onClose,
  placement,
  canManage = true
}) {
  if (!open || !placement) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-slate-900"></span>
            <h3 className="text-xs font-bold text-slate-900 tracking-wide uppercase">
              Placement Offer Details
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          
          {/* Main Hero Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-sm relative overflow-hidden">
            <div className="absolute right-0 top-0 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[11px] font-bold uppercase tracking-wider mb-2">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>Campus Placement Offer</span>
                </div>
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  {placement.StudentName || "Placed Student"}
                </h2>
                <div className="flex items-center gap-2 text-slate-300 text-xs mt-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold text-white">{placement.CompanyName || "Recruiter"}</span>
                  <span>&bull;</span>
                  <span>{placement.Location || "Location Not Specified"}</span>
                </div>
              </div>

              {/* Package Badge */}
              <div className="bg-white/10 backdrop-blur-xs border border-white/15 px-4 py-2.5 rounded-xl text-center self-start sm:self-auto shrink-0">
                <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block">
                  Annual Package
                </span>
                <span className="text-lg font-extrabold text-emerald-400 font-mono">
                  {placement.Package || "Not Disclosed"}
                </span>
              </div>
            </div>
          </div>

          {/* Section 1: Candidate & Recruiter Information */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-700" />
              <span>Student &amp; Organization Details</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">Placed Student Name</span>
                <span className="font-bold text-slate-900 text-xs">
                  {placement.StudentName || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">Recruiting Company</span>
                <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-600" />
                  <span>{placement.CompanyName || "N/A"}</span>
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">Job Work Location</span>
                <span className="font-medium text-slate-800 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-500" />
                  <span>{placement.Location || "Not Specified"}</span>
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">Employment Classification</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  <CheckCircle2 className="w-3 h-3 text-blue-600" />
                  <span>{placement.JobType || "Full Time"}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Compensation & Batch Intake */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-slate-700" />
              <span>Offer Compensation &amp; Batch Year</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">Total Compensation (CTC)</span>
                <span className="font-mono font-bold text-emerald-700 text-sm">
                  {placement.Package || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">Placement Year / Batch</span>
                <span className="font-mono font-semibold text-slate-900 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  <span>{placement.Year || "N/A"}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Record Audit Timestamps */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-700" />
              <span>Audit &amp; System Timestamps</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/80 p-3 rounded-xl border border-slate-100 text-[11px]">
              <div>
                <span className="text-slate-400 block mb-0.5">Record ID:</span>
                <span className="font-mono text-slate-700 select-all">{placement._id}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Recorded on:</span>
                <span className="text-slate-700 font-medium">
                  {placement.createdAt ? moment(placement.createdAt).format("DD MMM YYYY, hh:mm A") : "N/A"}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div>
            {canManage && (
              <Link
                to={`/admin/placement/edit/${placement._id}`}
                state={{ placement }}
                onClick={onClose}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Edit Record</span>
              </Link>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition shadow-sm cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
