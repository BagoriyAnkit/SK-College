import React from "react";
import moment from "moment";
import { Link } from "react-router-dom";
import { 
    FaTimes, 
    FaCalendarAlt, 
    FaClock, 
    FaMapMarkerAlt, 
    FaEdit, 
    FaFileAlt,
    FaCheckCircle,
    FaRegCalendarCheck
} from "react-icons/fa";

export default function EventDetailsModal({ open, onClose, event, onToggleStatus }) {
    if (!open || !event) return null;

    const formattedDate = event.event_date
        ? moment(event.event_date).format("dddd, DD MMMM YYYY")
        : "N/A";

    const isUpcoming = event.event_date 
        ? moment(event.event_date).isSameOrAfter(moment(), 'day')
        : true;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden my-auto border border-slate-200">
                {/* Header */}
                <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FaRegCalendarCheck className="text-slate-300 text-base" />
                        <h2 className="text-base font-bold tracking-tight">
                            Event Details
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
                    {/* Event Title Banner */}
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">
                                    Event Name
                                </span>
                                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                                    {event.event_title}
                                </h3>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                                isUpcoming
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-slate-100 text-slate-600 border border-slate-200"
                            }`}>
                                {isUpcoming ? "Upcoming" : "Past Event"}
                            </span>
                        </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                            <div className="flex items-center gap-2 text-slate-400 mb-1">
                                <FaCalendarAlt className="text-xs" />
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                    Event Date
                                </span>
                            </div>
                            <strong className="text-slate-900 text-xs block">
                                {formattedDate}
                            </strong>
                        </div>

                        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                            <div className="flex items-center gap-2 text-slate-400 mb-1">
                                <FaClock className="text-xs" />
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                    Timing Schedule
                                </span>
                            </div>
                            <strong className="text-slate-900 text-xs block font-mono">
                                {event.start_time || "N/A"} {event.end_time ? `- ${event.end_time}` : ""}
                            </strong>
                        </div>

                        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs col-span-2">
                            <div className="flex items-center gap-2 text-slate-400 mb-1">
                                <FaMapMarkerAlt className="text-xs" />
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                    Venue / Campus Location
                                </span>
                            </div>
                            <strong className="text-slate-900 text-xs block">
                                {event.location || "Main College Auditorium"}
                            </strong>
                        </div>
                    </div>

                    {/* Description / Agenda */}
                    {event.description && (
                        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                            <div className="flex items-center gap-2 text-slate-500 border-b border-slate-100 pb-2">
                                <FaFileAlt className="text-xs" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                                    Event Description &amp; Agenda
                                </span>
                            </div>
                            <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed pt-1">
                                {event.description}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-slate-50 px-6 py-3 flex items-center justify-between border-t border-slate-200">
                    <div className="flex items-center gap-2">
                        <Link
                            to={`/admin/event/edit/${event._id}`}
                            state={{ event }}
                            onClick={onClose}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition"
                        >
                            <FaEdit className="text-xs" />
                            <span>Edit Event</span>
                        </Link>

                        {onToggleStatus && (
                            <button
                                type="button"
                                onClick={() => {
                                    onToggleStatus(event._id);
                                    onClose();
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold shadow-2xs transition"
                            >
                                <FaCheckCircle className="text-xs text-emerald-600" />
                                <span>Toggle Status</span>
                            </button>
                        )}
                    </div>

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
