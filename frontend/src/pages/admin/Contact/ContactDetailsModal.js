import React from "react";
import moment from "moment";
import {
  X,
  User,
  Mail,
  Calendar,
  Clock,
  Trash2,
  Send,
  MessageSquare,
  Hash,
  CheckCircle2,
  HelpCircle,
  ExternalLink
} from "lucide-react";

export default function ContactDetailsModal({
  open,
  onClose,
  contact,
  onDelete
}) {
  if (!open || !contact) return null;

  const formattedDate = contact.createdAt
    ? moment(contact.createdAt).format("DD MMMM YYYY, hh:mm A")
    : "Unknown Date";

  const timeAgo = contact.createdAt
    ? moment(contact.createdAt).fromNow()
    : "";

  const initials = (contact.fullName || "User")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const replyMailto = contact.email
    ? `mailto:${contact.email}?subject=${encodeURIComponent(
        `Re: ${contact.subject || "Your Inquiry to SK College"}`
      )}`
    : null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-slate-900"></span>
            <h3 className="text-xs font-bold text-slate-900 tracking-wide uppercase">
              Contact Inquiry Details
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
            title="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          {/* Sender Hero Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-sm relative overflow-hidden">
            <div className="absolute right-0 top-0 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex items-start gap-4 relative z-10">
              {/* Avatar */}
              <div className="w-12 h-12 rounded-2xl bg-blue-600/30 border border-blue-400/40 text-blue-200 flex items-center justify-center text-sm font-bold shrink-0">
                {initials}
              </div>

              <div className="min-w-0 flex-1">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold uppercase tracking-wider mb-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Verified Inquiry</span>
                </div>
                <h2 className="text-base font-bold text-white tracking-tight truncate">
                  {contact.fullName || "Anonymous Sender"}
                </h2>
                <div className="flex items-center gap-2 text-slate-300 text-xs mt-1 truncate">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <a
                    href={`mailto:${contact.email}`}
                    className="hover:text-blue-300 underline transition truncate"
                  >
                    {contact.email || "No email provided"}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Subject & Timing Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-start gap-2.5">
              <MessageSquare className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="text-[11px] text-slate-400 block font-medium">Inquiry Subject</span>
                <span className="text-xs font-bold text-slate-900 block mt-0.5 break-words">
                  {contact.subject || "General Inquiry"}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-start gap-2.5">
              <Calendar className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Received Date &amp; Time</span>
                <span className="text-xs font-semibold text-slate-900 block mt-0.5">
                  {formattedDate}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {timeAgo}
                </span>
              </div>
            </div>
          </div>

          {/* Complete Message Content */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-slate-700" />
                <span>Message Body</span>
              </span>
              <span className="font-mono text-[10px] text-slate-400">
                ID: {contact._id}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-800 leading-relaxed text-xs whitespace-pre-wrap font-normal">
              {contact.message || "No message content provided."}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onDelete) onDelete(contact._id);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Inquiry</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition cursor-pointer"
            >
              Close
            </button>

            {replyMailto && (
              <a
                href={replyMailto}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition active:scale-95 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Reply by Email</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
