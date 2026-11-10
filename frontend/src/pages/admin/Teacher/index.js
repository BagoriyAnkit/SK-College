import React, { useEffect, useState, useMemo } from 'react';
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
  GraduationCap,
  Building2,
  Phone,
  Mail,
  UserCheck,
  UserX
} from 'lucide-react';

import { ViewAll, DeleteTeacher, UpdateTeacherStatus, ViewOne } from '../../../Service/admin/Teacher';
import { ViewAllDepartment } from '../../../Service/admin/Department';
import TeacherDeatials from './TeacherDeatials';

export default function TeacherList() {
  const [teachers, setTeachers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loader, setLoading] = useState(true);
  const [teacherDetails, setTeacherDetails] = useState(null);
  const [open, setOpen] = useState(false);

  // Pagination & Filtering state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Load departments for filter dropdown
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const res = await ViewAllDepartment(1, 100);
        const deptList = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
          ? res
          : [];
        setDepartments(deptList);
      } catch (err) {
        console.log("Error loading departments:", err);
      }
    };
    loadDepartments();
  }, []);

  // Fetch teachers
  useEffect(() => {
    getTeachers();
  }, [page, limit]);

  const getTeachers = async () => {
    try {
      setLoading(true);
      const res = await ViewAll(page, limit);
      const dataList = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
        ? res
        : [];
      setTeachers(dataList);
      setTotalPages(res?.totalPages || 1);
    } catch (error) {
      console.log("Error fetching teachers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatus = async (id) => {
    try {
      await UpdateTeacherStatus(id);
      Swal.fire({
        icon: "success",
        title: "Status Updated",
        timer: 1200,
        showConfirmButton: false,
      });
      getTeachers();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Status Update Failed",
        text: error?.response?.data?.message || "Failed to update status",
        confirmButtonColor: "#0f172a"
      });
    }
  };

  const handleDelete = async (id, teacherName) => {
    const result = await Swal.fire({
      title: "Delete Faculty Record?",
      text: `Are you sure you want to remove ${teacherName || "this faculty member"}? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0f172a",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel"
    });

    if (result.isConfirmed) {
      try {
        await DeleteTeacher(id);
        Swal.fire({
          title: "Deleted!",
          text: "Faculty member deleted successfully.",
          icon: "success",
          confirmButtonColor: "#0f172a"
        });
        getTeachers();
      } catch (error) {
        Swal.fire({
          title: "Delete Failed",
          text: error?.response?.data?.message || "Could not delete faculty record.",
          icon: "error",
          confirmButtonColor: "#0f172a"
        });
      }
    }
  };

  const handleViewTeacher = async (id) => {
    try {
      const res = await ViewOne(id);
      setTeacherDetails(res.data?.data || res.data);
      setOpen(true);
    } catch (error) {
      console.log("Error viewing teacher:", error);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedDept('');
    setSelectedStatus('');
    setPage(1);
  };

  // Filtered teachers list based on search and filters
  const filteredTeachers = useMemo(() => {
    if (!Array.isArray(teachers)) return [];

    return teachers.filter((t) => {
      if (!t) return false;

      const name = String(t.TeacherName || '').toLowerCase();
      const email = String(t.Email || '').toLowerCase();
      const phone = String(t.PhoneNumber !== undefined && t.PhoneNumber !== null ? t.PhoneNumber : '').toLowerCase();
      const qualification = String(t.Qualification || '').toLowerCase();
      const query = String(searchTerm || '').toLowerCase().trim();

      const matchesSearch = !query || (
        name.includes(query) ||
        email.includes(query) ||
        phone.includes(query) ||
        qualification.includes(query)
      );

      const deptName = String(
        t.department?.DepartmentName ||
        (typeof t.Department === 'object' && t.Department ? t.Department.DepartmentName : t.Department) ||
        ''
      ).toLowerCase();
      const deptId = String(t.department?._id || t.department || '');

      const matchesDept = !selectedDept || deptId === selectedDept || deptName.includes(String(selectedDept).toLowerCase());
      const matchesStatus = !selectedStatus || String(t.status || 'Active').toLowerCase() === String(selectedStatus).toLowerCase();

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [teachers, searchTerm, selectedDept, selectedStatus]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
            <span>Faculty Management</span>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Faculty Directory</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Faculty Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage teaching staff profiles, academic departments, qualifications, and account statuses
          </p>
        </div>

        <Link
          to="/admin/teacher/add"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Faculty</span>
        </Link>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Live Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search faculty name, email, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition"
            />
          </div>

          {/* Department Filter */}
          <div className="relative">
            <Building2 className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition appearance-none"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.DepartmentName} {dept.DepartmentCode ? `(${dept.DepartmentCode})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition appearance-none"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Page Limit & Reset */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 flex-1">
              <span className="text-xs text-slate-500 whitespace-nowrap">Show:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="w-full px-2.5 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            {(searchTerm || selectedDept || selectedStatus) && (
              <button
                onClick={resetFilters}
                title="Reset filters"
                className="px-2.5 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 transition text-xs flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Faculty Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3.5">Faculty Member</th>
                <th className="px-5 py-3.5">Department</th>
                <th className="px-5 py-3.5">Contact Details</th>
                <th className="px-5 py-3.5">Academic Profile</th>
                <th className="px-5 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs">
              {loader ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-7 h-7 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin"></div>
                      <span className="mt-2 text-xs">Loading faculty records...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredTeachers.length > 0 ? (
                filteredTeachers.map((t) => {
                  const deptName =
                    t.department?.DepartmentName ||
                    (typeof t.Department === 'object' && t.Department ? t.Department.DepartmentName : t.Department) ||
                    'General';

                  const initials = String(t.TeacherName || 'F')
                    .trim()
                    .split(/\s+/)
                    .filter(Boolean)
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase() || 'F';

                  return (
                    <tr key={t._id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & Avatar */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {initials}
                          </div>
                          <div>
                            <button
                              onClick={() => handleViewTeacher(t._id)}
                              className="font-bold text-slate-900 hover:text-slate-600 transition text-left block"
                            >
                              {t.TeacherName}
                            </button>
                            <span className="text-[11px] text-slate-500">
                              {t.gender || 'Faculty'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-medium text-[11px] border border-blue-200">
                          <Building2 className="w-3 h-3 text-blue-500" />
                          {deptName}
                        </span>
                      </td>

                      {/* Contact */}
                      <td className="px-5 py-3.5">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{t.Email || 'No email'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{t.PhoneNumber || 'No phone'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Qualification & Experience */}
                      <td className="px-5 py-3.5">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 font-medium text-slate-800">
                            <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
                            <span>{t.Qualification || '-'}</span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Exp: {t.Experience || 'Not specified'}
                          </div>
                        </div>
                      </td>

                      {/* Status Toggle */}
                      <td className="px-5 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleStatus(t._id)}
                          title="Click to toggle status"
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition border ${
                            String(t.status || 'Active').toLowerCase() === "active"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                          }`}
                        >
                          {String(t.status || 'Active').toLowerCase() === "active" ? (
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
                            onClick={() => handleViewTeacher(t._id)}
                            title="View Faculty Details"
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <Link
                            to={`/admin/teacher/edit/${t._id}`}
                            state={{ Teacher: t }}
                            title="Edit Faculty Profile"
                            className="p-1.5 rounded-lg border border-slate-200 text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            onClick={() => handleDelete(t._id, t.TeacherName)}
                            title="Delete Faculty"
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
                    <p className="font-semibold text-slate-700">No faculty members found</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {searchTerm || selectedDept || selectedStatus
                        ? "Try clearing your filters or search keywords"
                        : "Click '+ Add New Faculty' to register your first teacher"}
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
            Showing <span className="font-semibold text-slate-800">{filteredTeachers.length}</span> faculty records (Page {page} of {totalPages})
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
      <TeacherDeatials
        open={open}
        onClose={() => setOpen(false)}
        Teacher={teacherDetails}
      />
    </div>
  );
}