import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import {
  Search,
  Plus,
  Filter,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Users,
  BookOpen,
  Calendar,
  User,
  GraduationCap
} from "lucide-react";

import Loader from "../../../Components/Loader";
import {
  ViewAllBatch,
  DeleteBatch,
  UpdateBatchStatus,
  ViewOneBatch
} from "../../../Service/admin/Batch";
import { ViewAllCourse } from "../../../Service/admin/Course";
import BatchDetailsModal from "./BatchDetailsModal";

export default function BatchList() {
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loader, setLoading] = useState(true);

  // Modal State
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [sessionFilter, setSessionFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Current user role check
  const userStr = localStorage.getItem("adminUser") || localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const userRole = String(user?.role || "").toLowerCase();
  const canManage = userRole === "admin" || userRole === "hod";

  const getBatches = async () => {
    try {
      setLoading(true);
      const res = await ViewAllBatch();
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setBatches(list);
    } catch (error) {
      console.error("Error fetching batches:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadCourses = async () => {
    try {
      const res = await ViewAllCourse(1, 100);
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setCourses(list);
    } catch (err) {
      console.error("Error fetching courses for batch filter:", err);
    }
  };

  useEffect(() => {
    getBatches();
    loadCourses();
  }, []);

  const handleStatus = async (id) => {
    try {
      await UpdateBatchStatus(id);

      Swal.fire({
        icon: "success",
        title: "Status Updated",
        timer: 1200,
        showConfirmButton: false,
      });

      getBatches();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Status Update Failed",
        text: error?.response?.data?.message || "Failed to update status",
        confirmButtonColor: "#0f172a"
      });
    }
  };

  const handleDelete = async (id, batchName) => {
    const result = await Swal.fire({
      title: "Delete Batch?",
      text: `Are you sure you want to remove "${batchName || "this batch"}"? Enrolled student records will be checked before deletion.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0f172a",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel"
    });

    if (result.isConfirmed) {
      try {
        await DeleteBatch(id);

        Swal.fire({
          title: "Deleted!",
          text: "Batch deleted successfully.",
          icon: "success",
          confirmButtonColor: "#0f172a"
        });

        getBatches();
      } catch (error) {
        const message =
          error?.response?.data?.message ||
          "Could not delete batch. Students may already be assigned to this cohort.";
        Swal.fire({
          title: "Delete Restricted",
          text: message,
          icon: "error",
          confirmButtonColor: "#0f172a"
        });
      }
    }
  };

  const handleViewBatch = async (batch) => {
    try {
      if (batch._id) {
        const res = await ViewOneBatch(batch._id);
        setSelectedBatch(res?.data || batch);
      } else {
        setSelectedBatch(batch);
      }
      setIsViewOpen(true);
    } catch (error) {
      // Fallback to existing batch object if fetch fails
      setSelectedBatch(batch);
      setIsViewOpen(true);
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setCourseFilter("");
    setSessionFilter("");
    setStatusFilter("");
    setPage(1);
  };

  // Distinct sessions extracted dynamically
  const availableSessions = useMemo(() => {
    const set = new Set();
    batches.forEach((b) => {
      if (b.session && typeof b.session === "string") {
        set.add(b.session.trim());
      }
    });
    return Array.from(set).sort();
  }, [batches]);

  // Filtered batches
  const filteredBatches = useMemo(() => {
    if (!Array.isArray(batches)) return [];

    return batches.filter((batch) => {
      if (!batch) return false;

      const name = String(batch.batchName || "").toLowerCase();
      const courseName = String(
        batch.course?.courseName ||
          (typeof batch.courseName === "object" && batch.courseName ? batch.courseName.courseName : batch.courseName) ||
          ""
      ).toLowerCase();
      const courseCode = String(batch.course?.courseCode || "").toLowerCase();
      const session = String(batch.session || "").toLowerCase();
      const teacherName = String(
        typeof batch.classTeacher === "object" && batch.classTeacher
          ? batch.classTeacher.TeacherName
          : batch.classTeacher || ""
      ).toLowerCase();

      const search = searchTerm.toLowerCase().trim();

      const matchesSearch =
        !search ||
        name.includes(search) ||
        courseName.includes(search) ||
        courseCode.includes(search) ||
        session.includes(search) ||
        teacherName.includes(search);

      // Course Filter
      const batchCourseId = batch.course?._id || (typeof batch.course === "string" ? batch.course : "");
      const matchesCourse =
        !courseFilter ||
        String(batchCourseId) === String(courseFilter) ||
        courseName === courseFilter.toLowerCase();

      // Session Filter
      const matchesSession = !sessionFilter || batch.session === sessionFilter;

      // Status Filter
      const isBatchActive = batch.status === true || String(batch.status).toLowerCase() === "active";
      const matchesStatus =
        !statusFilter ||
        (statusFilter === "active" && isBatchActive) ||
        (statusFilter === "inactive" && !isBatchActive);

      return matchesSearch && matchesCourse && matchesSession && matchesStatus;
    });
  }, [batches, searchTerm, courseFilter, sessionFilter, statusFilter]);

  // Pagination Slicing
  const totalPages = Math.ceil(filteredBatches.length / limit) || 1;
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * limit;
  const paginatedBatches = filteredBatches.slice(startIndex, startIndex + limit);

  if (loader) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Batches Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Organize academic cohorts, assign class teachers, and monitor intake capacities
          </p>
        </div>

        {canManage && (
          <Link
            to="/admin/batch/add"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Batch</span>
          </Link>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search batch, course, mentor..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition"
            />
          </div>

          {/* Course Filter */}
          <div className="relative">
            <select
              value={courseFilter}
              onChange={(e) => {
                setCourseFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition appearance-none cursor-pointer"
            >
              <option value="">All Academic Courses</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.courseName} {c.courseCode ? `(${c.courseCode})` : ""}
                </option>
              ))}
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Session Filter */}
          <div className="relative">
            <select
              value={sessionFilter}
              onChange={(e) => {
                setSessionFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition appearance-none cursor-pointer"
            >
              <option value="">All Academic Sessions</option>
              {availableSessions.map((s) => (
                <option key={s} value={s}>
                  Session: {s}
                </option>
              ))}
            </select>
            <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition appearance-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Filter Info & Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Showing {filteredBatches.length} matching batch cohorts</span>
            {(searchTerm || courseFilter || sessionFilter || statusFilter) && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1 text-slate-700 hover:text-slate-900 font-semibold transition ml-2 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Page Size:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="px-2 py-1 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
        </div>
      </div>

      {/* Batches Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/75 text-slate-600 font-semibold">
                <th className="py-3.5 px-4">Batch Name</th>
                <th className="py-3.5 px-4">Course Program</th>
                <th className="py-3.5 px-4">Session</th>
                <th className="py-3.5 px-4 text-center">Strength</th>
                <th className="py-3.5 px-4">Class Teacher</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedBatches.length > 0 ? (
                paginatedBatches.map((batch) => {
                  const isActive = batch.status === true || String(batch.status).toLowerCase() === "active";
                  const courseDisplay =
                    batch.course?.courseName ||
                    (typeof batch.courseName === "object" && batch.courseName ? batch.courseName.courseName : batch.courseName) ||
                    "-";
                  const courseCode = batch.course?.courseCode || "";
                  const teacherDisplay =
                    typeof batch.classTeacher === "object" && batch.classTeacher
                      ? batch.classTeacher.TeacherName
                      : (typeof batch.classTeacher === "string" && batch.classTeacher.trim() ? batch.classTeacher : "Unassigned");
                  const teacherDept = typeof batch.classTeacher === "object" ? batch.classTeacher?.Department : null;

                  return (
                    <tr
                      key={batch._id}
                      className="hover:bg-slate-50/60 transition group"
                    >
                      {/* Batch Name */}
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        <button
                          type="button"
                          onClick={() => handleViewBatch(batch)}
                          className="hover:underline text-left text-slate-900 font-bold group-hover:text-blue-900 flex items-center gap-1.5 transition"
                          title="Click to view batch details"
                        >
                          <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{batch.batchName}</span>
                        </button>
                      </td>

                      {/* Course */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800 line-clamp-1">
                          {courseDisplay}
                        </div>
                        {courseCode && (
                          <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] font-mono font-medium bg-slate-100 text-slate-600 border border-slate-200">
                            {courseCode}
                          </span>
                        )}
                      </td>

                      {/* Session */}
                      <td className="py-3 px-4 font-mono text-slate-600">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100/80 text-slate-700 border border-slate-200/60 text-[11px]">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {batch.session || "-"}
                        </span>
                      </td>

                      {/* Strength */}
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center justify-center font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[11px]">
                          {batch.strength || 0} Seats
                        </span>
                      </td>

                      {/* Class Teacher */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{teacherDisplay}</span>
                        </div>
                        {teacherDept && (
                          <div className="text-[10px] text-slate-400 ml-5 font-normal">
                            {teacherDept}
                          </div>
                        )}
                      </td>

                      {/* Status Toggle Switch */}
                      <td className="py-3 px-4 text-center">
                        {canManage ? (
                          <button
                            type="button"
                            onClick={() => handleStatus(batch._id)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border transition cursor-pointer active:scale-95 ${
                              isActive
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                            }`}
                            title="Toggle active status"
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isActive ? "bg-emerald-500" : "bg-slate-400"
                              }`}
                            ></span>
                            <span>{isActive ? "Active" : "Inactive"}</span>
                          </button>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                              isActive
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isActive ? "bg-emerald-500" : "bg-slate-400"
                              }`}
                            ></span>
                            <span>{isActive ? "Active" : "Inactive"}</span>
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* View Modal */}
                          <button
                            type="button"
                            onClick={() => handleViewBatch(batch)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit */}
                          {canManage && (
                            <Link
                              to={`/admin/batch/edit/${batch._id}`}
                              state={{ batch }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                              title="Edit Batch"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Link>
                          )}

                          {/* Delete */}
                          {canManage && (
                            <button
                              type="button"
                              onClick={() => handleDelete(batch._id, batch.batchName)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                              title="Delete Batch"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-slate-400">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                        <Users className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700">No Batches Found</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Try clearing or modifying your search and filters, or register a new batch cohort.
                      </p>
                      {(searchTerm || courseFilter || sessionFilter || statusFilter) && (
                        <button
                          onClick={resetFilters}
                          className="mt-3 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {filteredBatches.length > 0 && (
          <div className="border-t border-slate-200/80 px-4 py-3 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <div>
              Showing <span className="font-semibold text-slate-800">{startIndex + 1}</span> to{" "}
              <span className="font-semibold text-slate-800">
                {Math.min(startIndex + limit, filteredBatches.length)}
              </span>{" "}
              of <span className="font-semibold text-slate-800">{filteredBatches.length}</span> batches
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={safePage === 1}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition"
                title="Previous page"
              >
                <ChevronLeft className="w-3.5 h-3.5 text-slate-600" />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    return (
                      p === 1 ||
                      p === totalPages ||
                      (p >= safePage - 1 && p <= safePage + 1)
                    );
                  })
                  .map((p, idx, arr) => {
                    const prevP = arr[idx - 1];
                    const showEllipsis = prevP && p - prevP > 1;

                    return (
                      <React.Fragment key={p}>
                        {showEllipsis && <span className="px-1 text-slate-400">...</span>}
                        <button
                          type="button"
                          onClick={() => setPage(p)}
                          className={`w-7 h-7 rounded-lg text-xs font-semibold transition ${
                            safePage === p
                              ? "bg-slate-900 text-white shadow-xs"
                              : "border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    );
                  })}
              </div>

              <button
                type="button"
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={safePage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition"
                title="Next page"
              >
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Batch Details Modal */}
      <BatchDetailsModal
        open={isViewOpen}
        onClose={() => {
          setIsViewOpen(false);
          setSelectedBatch(null);
        }}
        batch={selectedBatch}
        canManage={canManage}
      />
    </div>
  );
}
