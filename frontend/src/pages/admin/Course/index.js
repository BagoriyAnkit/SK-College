import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
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
  BookOpen,
  Building2,
  Clock,
  Layers,
  GraduationCap,
  UserCheck,
  UserX
} from 'lucide-react';

import { ViewAllCourse, DeleteCourse, UpdateStatus, FindOneCourse } from '../../../Service/admin/Course';
import { ViewAllDepartment } from '../../../Service/admin/Department';
import CourseDetailsModal from './CourseDetailsModal';

export default function Course() {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Filtering
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Course Details Modal
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // Load departments for filter dropdown
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const res = await ViewAllDepartment(1, 100);
        const deptList = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setDepartments(deptList);
      } catch (err) {
        console.error("Error loading departments for filter:", err);
      }
    };
    loadDepartments();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await ViewAllCourse(page, limit);
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setCourses(list);
      setTotalPages(res?.totalPages || 1);
      setTotalCourses(res?.totalCourse || list.length);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, limit]);

  const handleStatus = async (id) => {
    try {
      await UpdateStatus(id);
      Swal.fire({
        icon: "success",
        title: "Status Updated",
        timer: 1200,
        showConfirmButton: false,
      });
      fetchData();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Status Update Failed",
        text: error?.response?.data?.message || "Failed to update course status",
        confirmButtonColor: "#0f172a"
      });
    }
  };

  const handleDelete = async (id, courseName) => {
    const result = await Swal.fire({
      title: "Delete Course?",
      text: `Are you sure you want to delete "${courseName || "this course"}"? Existing batch and student relationships will be verified before deletion.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0f172a",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel"
    });

    if (result.isConfirmed) {
      try {
        await DeleteCourse(id);
        Swal.fire({
          title: "Deleted!",
          text: "Course deleted successfully.",
          icon: "success",
          confirmButtonColor: "#0f172a"
        });
        fetchData();
      } catch (error) {
        const message =
          error?.response?.data?.message ||
          "Could not delete course. Batches or enrolled students may be linked to it.";
        Swal.fire({
          title: "Delete Restricted",
          text: message,
          icon: "error",
          confirmButtonColor: "#0f172a"
        });
      }
    }
  };

  const handleViewCourse = async (id) => {
    try {
      const res = await FindOneCourse(id);
      setSelectedCourse(res?.data || res);
      setIsViewOpen(true);
    } catch (error) {
      console.error("Error viewing course details:", error);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setDeptFilter('');
    setTypeFilter('');
    setStatusFilter('');
    setPage(1);
  };

  // Client-side filtering on current course dataset
  const filteredCourses = useMemo(() => {
    if (!Array.isArray(courses)) return [];

    return courses.filter((c) => {
      if (!c) return false;

      const name = String(c.courseName || '').toLowerCase();
      const code = String(c.courseCode || '').toLowerCase();
      const dept = String(c.department || '').toLowerCase();
      const type = String(c.courseType || '').toLowerCase();
      const query = String(searchTerm || '').toLowerCase().trim();

      const matchesSearch =
        !query ||
        name.includes(query) ||
        code.includes(query) ||
        dept.includes(query);

      const matchesDept = !deptFilter || dept === deptFilter.toLowerCase();
      const matchesType = !typeFilter || type === typeFilter.toLowerCase();
      const matchesStatus =
        !statusFilter ||
        String(c.status || 'Active').toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesDept && matchesType && matchesStatus;
    });
  }, [courses, searchTerm, deptFilter, typeFilter, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
            <span>Academic Setup</span>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Courses Management</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Courses Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
              {totalCourses} Programs
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure college degree programs, academic codes, terms, departments, and enrollment statuses
          </p>
        </div>

        <Link
          to="/admin/course/add"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Course</span>
        </Link>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Live Search */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search course title, code, department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition"
            />
          </div>

          {/* Department Filter */}
          <div className="relative">
            <Building2 className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition appearance-none"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d._id} value={d.DepartmentName}>
                  {d.DepartmentName}
                </option>
              ))}
            </select>
          </div>

          {/* Course Type Filter */}
          <div className="relative">
            <GraduationCap className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition appearance-none"
            >
              <option value="">All Program Types</option>
              <option value="UG">Undergraduate (UG)</option>
              <option value="PG">Postgraduate (PG)</option>
              <option value="Diploma">Diploma</option>
              <option value="Certificate">Certificate</option>
            </select>
          </div>

          {/* Status Filter & Page Limit */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Filter className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-9 pr-6 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition appearance-none"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="px-2.5 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            {(searchTerm || deptFilter || typeFilter || statusFilter) && (
              <button
                onClick={resetFilters}
                title="Reset filters"
                className="p-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 transition text-xs shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Courses Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3.5">Course Program</th>
                <th className="px-5 py-3.5">Course Code</th>
                <th className="px-5 py-3.5">Department</th>
                <th className="px-5 py-3.5">Duration & Terms</th>
                <th className="px-5 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-7 h-7 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin"></div>
                      <span className="mt-2 text-xs">Loading course catalog...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredCourses.length > 0 ? (
                filteredCourses.map((c) => {
                  const isActive = String(c.status || "Active").toLowerCase() === "active";

                  return (
                    <tr key={c._id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & Avatar */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                            <BookOpen className="w-4 h-4" />
                          </div>
                          <div>
                            <button
                              onClick={() => handleViewCourse(c._id)}
                              className="font-bold text-slate-900 hover:text-slate-600 transition text-left block"
                            >
                              {c.courseName}
                            </button>
                            <span className="text-[11px] text-slate-500">
                              {c.courseType || "Undergraduate"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Course Code */}
                      <td className="px-5 py-3.5">
                        <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md text-[11px] border border-slate-200">
                          {c.courseCode || "-"}
                        </span>
                      </td>

                      {/* Department */}
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-medium text-[11px] border border-blue-200">
                          <Building2 className="w-3 h-3 text-blue-500" />
                          {c.department || "General"}
                        </span>
                      </td>

                      {/* Duration & Semesters */}
                      <td className="px-5 py-3.5">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 font-medium text-slate-800">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{c.duration || "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                            <Layers className="w-3 h-3 text-slate-400" />
                            <span>{c.totalSemester} Semesters</span>
                          </div>
                        </div>
                      </td>

                      {/* Status Toggle Pill */}
                      <td className="px-5 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleStatus(c._id)}
                          title="Click to toggle status"
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition border ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                          }`}
                        >
                          {isActive ? (
                            <>
                              <UserCheck className="w-3 h-3 text-emerald-600" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <UserX className="w-3 h-3 text-slate-500" />
                              <span>Inactive</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleViewCourse(c._id)}
                            title="View Course Details"
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <Link
                            to={`/admin/course/edit/${c._id}`}
                            state={{ course: c }}
                            title="Edit Course"
                            className="p-1.5 rounded-lg border border-slate-200 text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            onClick={() => handleDelete(c._id, c.courseName)}
                            title="Delete Course"
                            className="p-1.5 rounded-lg border border-slate-200 text-rose-600 hover:text-rose-800 hover:bg-rose-50 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500">
                    <p className="font-semibold text-slate-700">No courses found</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {searchTerm || deptFilter || typeFilter || statusFilter
                        ? "Try clearing your filters or search keywords"
                        : "Click '+ Add New Course' to introduce a new degree program"}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-600">
          <div>
            Showing <span className="font-semibold text-slate-800">{filteredCourses.length}</span> course programs (Page {page} of {totalPages})
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page <= 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-7 h-7 rounded-lg text-xs font-semibold transition ${
                      page === pageNum
                        ? "bg-slate-900 text-white"
                        : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page >= totalPages}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      <CourseDetailsModal
        open={isViewOpen}
        onClose={() => {
          setIsViewOpen(false);
          setSelectedCourse(null);
        }}
        course={selectedCourse}
      />
    </div>
  );
}