import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import moment from "moment";
import {
  Search,
  Plus,
  Filter,
  Eye,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  GraduationCap,
  Calendar,
  UserCheck,
  UserX,
  FileText,
  Mail,
  Phone
} from "lucide-react";

import Loader from "../../../Components/Loader";
import {
  ViewAllAdmission,
  DeleteAdmission,
  ApproveAdmission,
  RejectAdmission
} from "../../../Service/admin/admission";
import { ViewAllCourse } from "../../../Service/admin/Course";
import { Image_url } from "../../../config/config";
import AdmissionDetailsModal from "./AdmissionDetailsModal";

export default function AddmissionList() {
  const [admission, setAdmission] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [selectedItem, setSelectedItem] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [sessionFilter, setSessionFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Role permissions check
  const userStr = localStorage.getItem("adminUser") || localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const userRole = String(user?.role || "").toLowerCase();
  const canManage = userRole === "admin" || userRole === "hod";

  const getAdmission = async () => {
    try {
      setLoading(true);
      const res = await ViewAllAdmission();
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setAdmission(list);
    } catch (error) {
      console.error("Error fetching admissions:", error);
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
      console.error("Error fetching courses for admission filter:", err);
    }
  };

  useEffect(() => {
    getAdmission();
    loadCourses();
  }, []);

  const handleApprove = async (id, studentName) => {
    const result = await Swal.fire({
      title: "Approve Admission?",
      text: `Are you sure you want to approve ${studentName || "this applicant"}? This will automatically create an academic student profile, a login user account, and dispatch an account setup link to their email.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0f172a",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Approve & Create Student",
      cancelButtonText: "Cancel"
    });

    if (result.isConfirmed) {
      try {
        Swal.fire({
          title: "Processing Approval...",
          text: "Creating academic profile and generating portal credentials...",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        const res = await ApproveAdmission(id);

        Swal.fire({
          title: "Approved!",
          text: res?.message || "Student account created and activation email dispatched.",
          icon: "success",
          confirmButtonColor: "#0f172a"
        });

        getAdmission();
      } catch (error) {
        Swal.fire({
          title: "Approval Failed",
          text: error.response?.data?.message || "Failed to approve admission application.",
          icon: "error",
          confirmButtonColor: "#0f172a"
        });
      }
    }
  };

  const handleReject = async (id, studentName) => {
    const result = await Swal.fire({
      title: "Reject Admission",
      text: `Enter reason for rejecting ${studentName || "this candidate"}'s application:`,
      input: "text",
      inputPlaceholder: "Reason for rejection (e.g. Incomplete eligibility criteria)",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Reject Application",
      cancelButtonText: "Cancel"
    });

    if (result.isConfirmed) {
      try {
        const rejectionReason = result.value || "Application not accepted by college administration.";
        const res = await RejectAdmission(id, { rejectionReason });

        Swal.fire({
          title: "Application Rejected",
          text: res?.message || "The application has been marked as rejected.",
          icon: "info",
          confirmButtonColor: "#0f172a"
        });

        getAdmission();
      } catch (error) {
        Swal.fire({
          title: "Rejection Failed",
          text: error.response?.data?.message || "Failed to reject admission application.",
          icon: "error",
          confirmButtonColor: "#0f172a"
        });
      }
    }
  };

  const handleDelete = async (id, studentName) => {
    const result = await Swal.fire({
      title: "Delete Admission Record?",
      text: `Are you sure you want to permanently remove "${studentName || "this application"}"? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0f172a",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel"
    });

    if (result.isConfirmed) {
      try {
        await DeleteAdmission(id);

        Swal.fire({
          title: "Deleted!",
          text: "Admission record removed successfully.",
          icon: "success",
          confirmButtonColor: "#0f172a"
        });

        getAdmission();
      } catch (error) {
        Swal.fire({
          title: "Delete Failed",
          text: error.response?.data?.message || "Could not delete admission record.",
          icon: "error",
          confirmButtonColor: "#0f172a"
        });
      }
    }
  };

  const handleView = (item) => {
    setSelectedItem(item);
    setIsViewOpen(true);
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
    admission.forEach((item) => {
      if (item.session && typeof item.session === "string") {
        set.add(item.session.trim());
      }
    });
    return Array.from(set).sort();
  }, [admission]);

  // Filtered admissions
  const filteredAdmissions = useMemo(() => {
    if (!Array.isArray(admission)) return [];

    return admission.filter((item) => {
      if (!item) return false;

      const name = String(item.studentName || "").toLowerCase();
      const email = String(item.email || "").toLowerCase();
      const mobile = String(item.mobile || "").toLowerCase();
      const course = String(item.courseName || "").toLowerCase();
      const session = String(item.session || "").toLowerCase();
      const aadhaar = String(item.aadhaar || "").toLowerCase();
      const id = String(item._id || "").toLowerCase();

      const search = searchTerm.toLowerCase().trim();

      const matchesSearch =
        !search ||
        name.includes(search) ||
        email.includes(search) ||
        mobile.includes(search) ||
        course.includes(search) ||
        session.includes(search) ||
        aadhaar.includes(search) ||
        id.includes(search);

      // Course Filter
      const matchesCourse =
        !courseFilter || course === courseFilter.toLowerCase();

      // Session Filter
      const matchesSession = !sessionFilter || item.session === sessionFilter;

      // Status Filter
      const rawStatus = String(item.status || "Pending").toLowerCase();
      const matchesStatus =
        !statusFilter ||
        (statusFilter === "pending" && (rawStatus === "pending" || !rawStatus)) ||
        (statusFilter === "approved" && rawStatus === "approved") ||
        (statusFilter === "rejected" && rawStatus === "rejected");

      return matchesSearch && matchesCourse && matchesSession && matchesStatus;
    });
  }, [admission, searchTerm, courseFilter, sessionFilter, statusFilter]);

  // Pagination Slicing
  const totalPages = Math.ceil(filteredAdmissions.length / limit) || 1;
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * limit;
  const paginatedAdmissions = filteredAdmissions.slice(startIndex, startIndex + limit);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Admissions Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review applicant inquiries, approve admission cohorts, and automatically create verified student portals
          </p>
        </div>

        {canManage && (
          <Link
            to="/admin/addmissions/add"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Direct Admission</span>
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
              placeholder="Search applicant, phone, email, ID..."
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
                <option key={c._id} value={c.courseName}>
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
              <option value="">All Admission Statuses</option>
              <option value="pending">Pending Review Only</option>
              <option value="approved">Approved &amp; Enrolled Only</option>
              <option value="rejected">Rejected Only</option>
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Filter Info & Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Showing {filteredAdmissions.length} admission applications</span>
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

      {/* Admissions Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/75 text-slate-600 font-semibold">
                <th className="py-3.5 px-4">Applicant</th>
                <th className="py-3.5 px-4">Applied Course</th>
                <th className="py-3.5 px-4">Contact Details</th>
                <th className="py-3.5 px-4">Session</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Review / Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedAdmissions.length > 0 ? (
                paginatedAdmissions.map((item) => {
                  const rawStatus = String(item.status || "Pending").toLowerCase();
                  const isApproved = rawStatus === "approved";
                  const isRejected = rawStatus === "rejected";
                  const isPending = !isApproved && !isRejected;

                  const photoUrl = item.photo ? `${Image_url}/${item.photo}` : null;

                  return (
                    <tr
                      key={item._id}
                      className="hover:bg-slate-50/60 transition group"
                    >
                      {/* Applicant */}
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-3">
                          {photoUrl ? (
                            <img
                              src={photoUrl}
                              alt={item.studentName}
                              className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-200">
                              {item.studentName?.charAt(0)?.toUpperCase() || "A"}
                            </div>
                          )}

                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={() => handleView(item)}
                              className="hover:underline text-left text-slate-900 font-bold group-hover:text-blue-900 block truncate transition cursor-pointer"
                              title="Click to view details"
                            >
                              {item.studentName}
                            </button>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-normal">
                              {item.gender && <span className="capitalize">{item.gender}</span>}
                              {item.gender && item.aadhaar && <span>•</span>}
                              {item.aadhaar && (
                                <span className="font-mono">
                                  ID: {item.aadhaar.slice(-4) ? `xxxx-${item.aadhaar.slice(-4)}` : item.aadhaar}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Course */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800 line-clamp-1">
                          {item.courseName || "General Admission"}
                        </div>
                        {item.qualification && (
                          <span className="text-[10px] text-slate-400">
                            Prior: {item.qualification} {item.percentage ? `(${item.percentage}%)` : ""}
                          </span>
                        )}
                      </td>

                      {/* Contact Details */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="font-mono">{item.mobile || "-"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-normal mt-0.5">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[170px]">{item.email}</span>
                        </div>
                      </td>

                      {/* Session */}
                      <td className="py-3 px-4 font-mono text-slate-600">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px]">
                          {item.session || "-"}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 text-slate-500 text-[11px] font-mono">
                        {item.createdAt ? moment(item.createdAt).format("DD/MM/YYYY") : "-"}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        {isApproved ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span>Approved</span>
                          </span>
                        ) : isRejected ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            <span>Rejected</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            <span>Pending</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Modal */}
                          <button
                            type="button"
                            onClick={() => handleView(item)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Approve / Reject for Pending */}
                          {isPending && canManage && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleApprove(item._id, item.studentName)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold shadow-2xs transition active:scale-95 cursor-pointer"
                                title="Approve application and create student"
                              >
                                <CheckCircle className="w-3 h-3" />
                                <span>Approve</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleReject(item._id, item.studentName)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-semibold shadow-2xs transition active:scale-95 cursor-pointer"
                                title="Reject application"
                              >
                                <XCircle className="w-3 h-3" />
                                <span>Reject</span>
                              </button>
                            </>
                          )}

                          {/* Edit Link */}
                          {canManage && (
                            <Link
                              to={`/admin/addmissions/${item._id}`}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                              title="Edit Application"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Link>
                          )}

                          {/* Delete */}
                          {canManage && (
                            <button
                              type="button"
                              onClick={() => handleDelete(item._id, item.studentName)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                              title="Delete Record"
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
                        <GraduationCap className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700">No Admission Applications Found</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Try modifying your search or filter parameters, or register a direct admission application.
                      </p>
                      {(searchTerm || courseFilter || sessionFilter || statusFilter) && (
                        <button
                          onClick={resetFilters}
                          className="mt-3 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
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
        {filteredAdmissions.length > 0 && (
          <div className="border-t border-slate-200/80 px-4 py-3 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <div>
              Showing <span className="font-semibold text-slate-800">{startIndex + 1}</span> to{" "}
              <span className="font-semibold text-slate-800">
                {Math.min(startIndex + limit, filteredAdmissions.length)}
              </span>{" "}
              of <span className="font-semibold text-slate-800">{filteredAdmissions.length}</span> applications
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={safePage === 1}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
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
                          className={`w-7 h-7 rounded-lg text-xs font-semibold transition cursor-pointer ${
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
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
                title="Next page"
              >
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Admission Details Modal */}
      <AdmissionDetailsModal
        open={isViewOpen}
        onClose={() => {
          setIsViewOpen(false);
          setSelectedItem(null);
        }}
        admission={selectedItem}
        onApprove={handleApprove}
        onReject={handleReject}
        canManage={canManage}
      />
    </div>
  );
}
