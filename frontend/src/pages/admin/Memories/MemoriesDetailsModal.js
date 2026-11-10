import React from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import {
  X,
  Image as ImageIcon,
  Calendar,
  Clock,
  Edit2,
  Trash2,
  ExternalLink,
  Download,
  Hash,
  Sparkles
} from "lucide-react";
import { Image_url } from "../../../config/config";

export default function MemoriesDetailsModal({
  open,
  onClose,
  memory,
  onDelete
}) {
  if (!open || !memory) return null;

  const imageSrc = memory.image
    ? `${Image_url}/${memory.image}`
    : "/default-fallback-image.png";

  const formattedDate = memory.createdAt
    ? moment(memory.createdAt).format("DD MMMM YYYY, hh:mm A")
    : "Unknown Date";

  const timeAgo = memory.createdAt
    ? moment(memory.createdAt).fromNow()
    : "";

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-slate-900"></span>
            <h3 className="text-xs font-bold text-slate-900 tracking-wide uppercase">
              Campus Memory Details
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
          {/* Image Display Card */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 shadow-sm group">
            <div className="w-full max-h-96 flex items-center justify-center bg-slate-900/40">
              <img
                src={imageSrc}
                alt="Campus Memory"
                className="w-full h-auto max-h-96 object-contain"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src =
                    "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80";
                }}
              />
            </div>

            {/* Quick overlay pill */}
            <div className="absolute top-3 right-3 flex items-center gap-2">
              <a
                href={imageSrc}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-900 text-white text-[11px] font-medium backdrop-blur-xs transition shadow-sm"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Full Size</span>
              </a>
            </div>
          </div>

          {/* Details & Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* File Reference */}
            <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 shrink-0 mt-0.5">
                <ImageIcon className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[11px] text-slate-400 block font-medium">Image File</span>
                <span className="text-xs font-semibold text-slate-900 truncate block mt-0.5" title={memory.image}>
                  {memory.image || "Untitled Image"}
                </span>
              </div>
            </div>

            {/* Record ID */}
            <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 shrink-0 mt-0.5">
                <Hash className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[11px] text-slate-400 block font-medium">Database ID</span>
                <span className="text-xs font-mono font-semibold text-slate-900 truncate block mt-0.5" title={memory._id}>
                  {memory._id || "N/A"}
                </span>
              </div>
            </div>

            {/* Uploaded Timestamp */}
            <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 shrink-0 mt-0.5">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Uploaded On</span>
                <span className="text-xs font-semibold text-slate-900 block mt-0.5">
                  {formattedDate}
                </span>
              </div>
            </div>

            {/* Relative Time */}
            <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 shrink-0 mt-0.5">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Upload Activity</span>
                <span className="text-xs font-semibold text-slate-900 block mt-0.5 capitalize">
                  {timeAgo || "Recently uploaded"}
                </span>
              </div>
            </div>
          </div>

          {/* Visibility Banner */}
          <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 text-blue-900 flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="text-xs">
              This photograph is active in the public SK College portal memories gallery and campus highlight reels.
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onDelete) onDelete(memory._id);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Memory</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition cursor-pointer"
            >
              Close
            </button>

            <Link
              to={`/admin/memories/edit/${memory._id}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition active:scale-95 cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Replace Photo</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
