import React from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import {
  X,
  User,
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Edit2,
  ShieldCheck,
  CreditCard,
  Award
} from "lucide-react";
import { Image_url } from "../../../config/config";

export default function AdmissionDetailsModal({
  open,
  onClose,
  admission,
  onApprove,
  onReject,
  canManage = true
}) {
  if (!open || !admission) return null;

  const status = String(admission.status || "Pending").toLowerCase();
  const isApproved = status === "approved";
  const isRejected = status === "rejected";
  const isPending = !isApproved && !isRejected;

  const photoUrl = admission.photo ? `${Image_url}/${admission.photo}` : null;
  const signatureUrl = admission.signature ? `${Image_url}/${admission.signature}` : null;
  const marksheetUrl = admission.marksheet ? `${Image_url}/${admission.marksheet}` : null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-slate-900"></span>
            <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase">
              Admission Application Details
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

        {/* Scrollable Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          {/* Identity Header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-5 border-b border-slate-100">
            <div className="relative shrink-0">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={admission.studentName}
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-xs"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white font-bold text-lg flex items-center justify-center shadow-xs">
                  {admission.studentName?.charAt(0)?.toUpperCase() || "A"}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  {admission.studentName || "Applicant"}
                </h2>
                {/* Status Badge */}
                {isApproved ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                    <span>Approved &amp; Enrolled</span>
                  </span>
                ) : isRejected ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                    <XCircle className="w-3 h-3 text-rose-600" />
                    <span>Rejected</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    <Clock className="w-3 h-3 text-amber-600" />
                    <span>Under Review / Pending</span>
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-slate-500 font-medium">
                {admission.gender && (
                  <span className="capitalize">{admission.gender}</span>
                )}
                {admission.DOB && (
                  <>
                    <span>•</span>
                    <span>DOB: {moment(admission.DOB).format("DD MMM YYYY")}</span>
                  </>
                )}
                {admission.createdAt && (
                  <>
                    <span>•</span>
                    <span>Applied on {moment(admission.createdAt).format("DD/MM/YYYY")}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Rejection Notice if rejected */}
          {isRejected && admission.rejectionReason && (
            <div className="p-3.5 bg-rose-50/70 border border-rose-200/80 rounded-xl text-rose-800">
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                <span>Rejection Reason:</span>
              </div>
              <p className="text-rose-700 leading-relaxed font-medium">
                {admission.rejectionReason}
              </p>
            </div>
          )}

          {/* Linked Student / Auth Information if approved */}
          {isApproved && (admission.studentId || admission.userId) && (
            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-emerald-900">
              <div className="flex items-center gap-1.5 font-bold mb-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Linked Student Account Created</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                {admission.studentId && (
                  <div>
                    <span className="text-emerald-700 font-medium">Student Profile ID: </span>
                    <span className="font-mono font-bold text-slate-800">{admission.studentId}</span>
                  </div>
                )}
                {admission.userId && (
                  <div>
                    <span className="text-emerald-700 font-medium">Auth User ID: </span>
                    <span className="font-mono font-bold text-slate-800">{admission.userId}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Academic & Program Details */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-slate-700" />
              <span>Program &amp; Academic Details</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">Applied Course</span>
                <span className="font-bold text-slate-900 text-xs">
                  {admission.courseName || "Not Specified"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">Academic Session</span>
                <span className="font-mono font-semibold text-slate-800">
                  {admission.session || "-"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">Admission Date</span>
                <span className="font-medium text-slate-800">
                  {admission.admissionDate
                    ? moment(admission.admissionDate).format("DD/MM/YYYY")
                    : "-"}
                </span>
              </div>
            </div>
          </div>

          {/* Contact & Residential Details */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-700" />
              <span>Contact &amp; Identity Details</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">Email Address</span>
                <span className="font-medium text-slate-800 break-all">
                  {admission.email || "-"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">Mobile Phone</span>
                <span className="font-mono font-medium text-slate-800">
                  {admission.mobile || "-"}
                </span>
              </div>
              {admission.aadhaar && (
                <div>
                  <span className="text-slate-400 block text-[11px] mb-0.5">Aadhaar Card No.</span>
                  <span className="font-mono font-medium text-slate-800">
                    {admission.aadhaar}
                  </span>
                </div>
              )}
              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">Residential Address</span>
                <span className="font-medium text-slate-800">
                  {admission.address || "-"}
                </span>
              </div>
              {(admission.city || admission.state || admission.pincode) && (
                <div className="sm:col-span-2">
                  <span className="text-slate-400 block text-[11px] mb-0.5">City / State / PIN Code</span>
                  <span className="font-medium text-slate-800">
                    {[admission.city, admission.state, admission.pincode ? `PIN: ${admission.pincode}` : ""].filter(Boolean).join(", ")}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Family Background */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-700" />
              <span>Parental Background</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">Father's Name</span>
                <span className="font-semibold text-slate-800">
                  {admission.fatherName || "-"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">Mother's Name</span>
                <span className="font-semibold text-slate-800">
                  {admission.motherName || "-"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">Parent / Guardian Mobile</span>
                <span className="font-mono font-semibold text-slate-800">
                  {admission.parentMobile || "-"}
                </span>
              </div>
            </div>
          </div>

          {/* Academic Qualifications & Documents */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-slate-700" />
              <span>Prior Education &amp; Verification</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">Qualification</span>
                <span className="font-semibold text-slate-800">
                  {admission.qualification || "-"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">Board / University</span>
                <span className="font-semibold text-slate-800">
                  {admission.board || "-"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">Passing Year</span>
                <span className="font-mono font-semibold text-slate-800">
                  {admission.passingYear || "-"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">Percentage</span>
                <span className="font-bold text-slate-900">
                  {admission.percentage ? `${admission.percentage}%` : "-"}
                </span>
              </div>
            </div>

            {/* Signature Preview */}
            {signatureUrl && (
              <div className="mt-3 p-3 bg-slate-50/80 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[11px] mb-0.5">Candidate Signature</span>
                  <span className="text-[11px] text-slate-500">Verified digital specimen</span>
                </div>
                <img
                  src={signatureUrl}
                  alt="Signature specimen"
                  className="h-10 max-w-[140px] object-contain border border-slate-200 rounded bg-white p-1"
                />
              </div>
            )}

            {/* Marksheet Attachment */}
            {marksheetUrl && (
              <div className="mt-3 p-3 bg-slate-50/80 rounded-xl border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-slate-600" />
                  <div>
                    <span className="text-slate-800 font-semibold block text-xs">Previous Qualification Marksheet</span>
                    <span className="text-[11px] text-slate-500">Uploaded qualification marksheet/certificate</span>
                  </div>
                </div>
                <a
                  href={marksheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold transition"
                >
                  View Marksheet
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {canManage && (
              <Link
                to={`/admin/addmissions/${admission._id}`}
                onClick={onClose}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition"
              >
                <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Edit Application</span>
              </Link>
            )}

            {isPending && canManage && onApprove && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onApprove(admission._id, admission.studentName);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Approve &amp; Enroll</span>
              </button>
            )}

            {isPending && canManage && onReject && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onReject(admission._id, admission.studentName);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>
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
