import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import moment from "moment";
import {
  Image as ImageIcon,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  Sparkles,
  LayoutGrid,
  List,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Layers,
  ArrowUpDown
} from "lucide-react";

import Loader from "../../../Components/Loader";
import MemoriesDetailsModal from "./MemoriesDetailsModal";
import { ViewAllMemories, DeleteMemories } from "../../../Service/admin/Memories";
import { Image_url } from "../../../config/config";

export default function MemoriesList() {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // "newest" | "oldest"
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "table"

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await ViewAllMemories();
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setMemories(list);
    } catch (error) {
      console.error("Error fetching memories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id, fileName) => {
    const result = await Swal.fire({
      title: "Delete Memory Photo?",
      text: `Are you sure you want to permanently delete this memory photo (${fileName || "this image"})? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0f172a",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel"
    });

    if (result.isConfirmed) {
      try {
        await DeleteMemories(id);

        Swal.fire({
          title: "Deleted!",
          text: "Memory photo removed successfully.",
          icon: "success",
          confirmButtonColor: "#0f172a"
        });

        if (selectedMemory?._id === id) {
          setModalOpen(false);
          setSelectedMemory(null);
        }

        fetchData();
      } catch (error) {
        Swal.fire({
          title: "Delete Failed",
          text: error?.response?.data?.message || "Failed to delete memory.",
          icon: "error",
          confirmButtonColor: "#0f172a"
        });
      }
    }
  };

  const handleOpenModal = (memory) => {
    setSelectedMemory(memory);
    setModalOpen(true);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSortBy("newest");
    setPage(1);
  };

  // KPI Statistics
  const stats = useMemo(() => {
    const total = memories.length;
    const now = moment();
    const recentCount = memories.filter((m) => {
      if (!m.createdAt) return false;
      return now.diff(moment(m.createdAt), "days") <= 30;
    }).length;

    return {
      total,
      recent: recentCount,
      liveStatus: "Active on Portal"
    };
  }, [memories]);

  // Filtered & Sorted Records
  const filteredMemories = useMemo(() => {
    if (!Array.isArray(memories)) return [];

    const search = searchTerm.trim().toLowerCase();
    const result = memories.filter((item) => {
      if (!item) return false;
      const img = String(item.image || "").toLowerCase();
      const id = String(item._id || "").toLowerCase();
      const date = item.createdAt ? moment(item.createdAt).format("DD MMMM YYYY").toLowerCase() : "";

      return !search || img.includes(search) || id.includes(search) || date.includes(search);
    });

    // Sorting
    result.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return sortBy === "oldest" ? timeA - timeB : timeB - timeA;
    });

    return result;
  }, [memories, searchTerm, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredMemories.length / limit) || 1;
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * limit;
  const paginatedMemories = filteredMemories.slice(startIndex, startIndex + limit);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Campus Memories &amp; Photo Gallery
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Curate campus life archives, student experiences, celebrations and public website photo gallery
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/memories/add"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Memory</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Memories */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Photographs
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900">
            {stats.total}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Archived across all campus sessions
          </p>
        </div>

        {/* Recent Uploads */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Recent Additions
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-blue-700">
            {stats.recent}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Uploaded in the last 30 days
          </p>
        </div>

        {/* Gallery Status */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
              Gallery Visibility
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-emerald-700">
            {stats.liveStatus}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Synchronized with public college website
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by file name or date..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition"
            />
          </div>

          {/* Controls: Sort, Limit & View Toggle */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Sort Select */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-3 pr-8 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition appearance-none cursor-pointer"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="oldest">Sort: Oldest First</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Limit Select */}
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition cursor-pointer"
            >
              <option value={8}>8 per page</option>
              <option value={12}>12 per page</option>
              <option value={24}>24 per page</option>
            </select>

            {/* View Mode Toggle */}
            <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50/80 p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-400 hover:text-slate-700"
                }`}
                title="Grid Gallery View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === "table"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-400 hover:text-slate-700"
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Refresh / Reset */}
            <button
              type="button"
              onClick={resetFilters}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition cursor-pointer"
              title="Reset Filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {paginatedMemories.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <ImageIcon className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">No Memories Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchTerm
              ? `No photo matches "${searchTerm}". Try resetting your search filter.`
              : "No memories have been uploaded yet. Add campus memories to enrich the photo gallery."}
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            {searchTerm ? (
              <button
                onClick={resetFilters}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition cursor-pointer"
              >
                Clear Search
              </button>
            ) : (
              <Link
                to="/admin/memories/add"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload Memory</span>
              </Link>
            )}
          </div>
        </div>
      ) : viewMode === "grid" ? (
        /* GRID GALLERY VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {paginatedMemories.map((item) => {
            const imageSrc = item.image
              ? `${Image_url}/${item.image}`
              : "/default-fallback-image.png";

            const formattedDate = item.createdAt
              ? moment(item.createdAt).format("DD MMM YYYY")
              : "Archived";

            const timeAgo = item.createdAt ? moment(item.createdAt).fromNow() : "";

            return (
              <div
                key={item._id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col group hover:shadow-md hover:border-slate-300 transition-all duration-200"
              >
                {/* Photo Thumbnail with Hover Overlay */}
                <div className="relative aspect-4/3 bg-slate-950 overflow-hidden cursor-pointer" onClick={() => handleOpenModal(item)}>
                  <img
                    src={imageSrc}
                    alt="Campus Memory"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80";
                    }}
                  />

                  {/* Dark gradient shadow on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <div className="flex items-center justify-between w-full text-white text-xs">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-900/80 px-2 py-0.5 rounded-md backdrop-blur-xs">
                        <Eye className="w-3 h-3" />
                        <span>View Details</span>
                      </span>
                      <span className="text-[10px] text-slate-300">{timeAgo}</span>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-3.5 flex flex-col justify-between flex-1 gap-2.5">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span className="inline-flex items-center gap-1 font-medium">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{formattedDate}</span>
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">
                        #{String(item._id).slice(-4)}
                      </span>
                    </div>
                    <p
                      className="text-xs font-semibold text-slate-800 truncate"
                      title={item.image}
                    >
                      {item.image || "Campus Memory"}
                    </p>
                  </div>

                  {/* Card Action Buttons */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleOpenModal(item)}
                      className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 text-[11px] font-semibold py-1 px-2 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <Link
                        to={`/admin/memories/edit/${item._id}`}
                        className="w-7 h-7 rounded-lg flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                        title="Replace Photo"
                      >
                        <Edit2 className="w-3 h-3" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDelete(item._id, item.image)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center bg-rose-50 hover:bg-rose-100 text-rose-600 transition cursor-pointer"
                        title="Delete Memory"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-5 py-3.5">Photograph Preview</th>
                  <th className="px-5 py-3.5">File Information</th>
                  <th className="px-5 py-3.5">Uploaded Date</th>
                  <th className="px-5 py-3.5">Activity</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {paginatedMemories.map((item) => {
                  const imageSrc = item.image
                    ? `${Image_url}/${item.image}`
                    : "/default-fallback-image.png";

                  const formattedDate = item.createdAt
                    ? moment(item.createdAt).format("DD MMM YYYY, hh:mm A")
                    : "Archived";

                  const timeAgo = item.createdAt ? moment(item.createdAt).fromNow() : "";

                  return (
                    <tr
                      key={item._id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      {/* Photo Thumbnail */}
                      <td className="px-5 py-3">
                        <div
                          className="w-16 h-12 rounded-xl bg-slate-900 overflow-hidden cursor-pointer border border-slate-200/80 relative group shadow-2xs"
                          onClick={() => handleOpenModal(item)}
                        >
                          <img
                            src={imageSrc}
                            alt="Memory Thumbnail"
                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src =
                                "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=300&q=80";
                            }}
                          />
                        </div>
                      </td>

                      {/* File Name & ID */}
                      <td className="px-5 py-3">
                        <div className="font-semibold text-slate-900 truncate max-w-xs" title={item.image}>
                          {item.image || "Untitled Image"}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                          ID: {item._id}
                        </div>
                      </td>

                      {/* Uploaded Date */}
                      <td className="px-5 py-3 text-slate-600">
                        {formattedDate}
                      </td>

                      {/* Activity / Time Ago */}
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{timeAgo || "Archived"}</span>
                        </span>
                      </td>

                      {/* Action Buttons */}
                      <td className="px-5 py-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenModal(item)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                            title="View Full Memory"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <Link
                            to={`/admin/memories/edit/${item._id}`}
                            className="w-7 h-7 rounded-lg flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                            title="Edit Memory"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleDelete(item._id, item.image)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center bg-rose-50 hover:bg-rose-100 text-rose-600 transition cursor-pointer"
                            title="Delete Memory"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Bar */}
      {filteredMemories.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 py-1 text-xs text-slate-500">
          <div>
            Showing{" "}
            <span className="font-semibold text-slate-800">
              {startIndex + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-slate-800">
              {Math.min(startIndex + limit, filteredMemories.length)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-800">
              {filteredMemories.length}
            </span>{" "}
            memories
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
              .map((p, idx, arr) => (
                <React.Fragment key={p}>
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <span className="px-1 text-slate-400">...</span>
                  )}
                  <button
                    onClick={() => setPage(p)}
                    className={`min-w-7 h-7 px-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      safePage === p
                        ? "bg-slate-900 text-white shadow-2xs"
                        : "border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    {p}
                  </button>
                </React.Fragment>
              ))}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Details Lightbox Modal */}
      <MemoriesDetailsModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedMemory(null);
        }}
        memory={selectedMemory}
        onDelete={(id) => handleDelete(id, selectedMemory?.image)}
      />
    </div>
  );
}
