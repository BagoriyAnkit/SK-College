import React from "react";
import moment from "moment";
import { Link } from "react-router-dom";
import { 
    FaTimes, 
    FaBullhorn, 
    FaCalendarAlt, 
    FaUserTie, 
    FaUsers, 
    FaBuilding, 
    FaEdit,
    FaFileAlt
} from "react-icons/fa";

export default function NoticeDetailsModal({ open, onClose, notice }) {
    if (!open || !notice) return null;

    const formattedPublishDate = notice.publish_date
        ? moment(notice.publish_date).format("DD MMMM YYYY")
        : "N/A";

    const formattedExpiryDate = notice.expiry_date || notice.ExpiryDate
        ? moment(notice.expiry_date || notice.ExpiryDate).format("DD MMMM YYYY")
        : null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden my-auto border border-slate-200">
                {/* Header */}
                <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FaBullhorn className="text-slate-300 text-base" />
                        <h2 className="text-base font-bold tracking-tight">
                            Notice Details
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        type="button"
                        className="text-slate-400 hover:text-white p-1 rounded-lg transition"
                        title="Close"
                    >
                        <FaTimes className="text-base" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs text-slate-700">
                    {/* Notice Title Banner */}
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">
                                    Notice Title
                                </span>
                                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                                    {notice.notice_title}
                                </h3>
                            </div>
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-800 shrink-0">
                                {notice.for_whom || "All"}
                            </span>
                        </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                            <div className="flex items-center gap-2 text-slate-400 mb-1">
                                <FaBuilding className="text-xs" />
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                    Department
                                </span>
                            </div>
                            <strong className="text-slate-900 text-xs block">
                                {notice.department || "General"}
                            </strong>
                        </div>

                        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                            <div className="flex items-center gap-2 text-slate-400 mb-1">
                                <FaUserTie className="text-xs" />
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                    Issued By
                                </span>
                            </div>
                            <strong className="text-slate-900 text-xs block">
                                {notice.issued_by || "Administration"}
                            </strong>
                        </div>

                        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                            <div className="flex items-center gap-2 text-slate-400 mb-1">
                                <FaCalendarAlt className="text-xs" />
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                    Published Date
                                </span>
                            </div>
                            <strong className="text-slate-900 text-xs block font-mono">
                                {formattedPublishDate}
                            </strong>
                        </div>

                        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                            <div className="flex items-center gap-2 text-slate-400 mb-1">
                                <FaUsers className="text-xs" />
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                    Target Audience
                                </span>
                            </div>
                            <strong className="text-slate-900 text-xs block">
                                {notice.for_whom || "All Campus"}
                            </strong>
                        </div>
                    </div>

                    {/* Expiry Date (if available) */}
                    {formattedExpiryDate && (
                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between text-xs">
                            <span className="font-semibold text-amber-900">Valid Until:</span>
                            <span className="font-mono font-bold text-amber-900">{formattedExpiryDate}</span>
                        </div>
                    )}

                    {/* Full Description / Circular Text */}
                    <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                        <div className="flex items-center gap-2 text-slate-500 border-b border-slate-100 pb-2">
                            <FaFileAlt className="text-xs" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                                Circular Description / Body
                            </span>
                        </div>
                        <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed pt-1">
                            {notice.description || "No detailed description provided."}
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-slate-50 px-6 py-3 flex items-center justify-between border-t border-slate-200">
                    <Link
                        to={`/admin/notice/edit/${notice._id}`}
                        state={{ notice }}
                        onClick={onClose}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition"
                    >
                        <FaEdit className="text-xs" />
                        <span>Edit Notice</span>
                    </Link>

                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition shadow-2xs"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
