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
  Building2,
  User,
  UserCheck,
  UserX,
  FileText
} from 'lucide-react';

import {
  ViewAllDepartment,
  DeleteDepartment,
  UpdateDepartmentStatus,
  ViewOneDepartment,
} from '../../../Service/admin/Department';
import DepartmentDetailsModal from './DepartmentDetailsModal';

export default function DepartmentList() {
  const [department, setDepartment] = useState([]);
  const [selectedDept, setSelectedDept] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [loader, setLoading] = useState(true);

  // Pagination & Filtering
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDepartments, setTotalDepartments] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const getDepartments = async () => {
    try {
      setLoading(true);
      const res = await ViewAllDepartment(page, limit);
      const deptList = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setDepartment(deptList);
      setTotalPages(res?.totalPages || 1);
      setTotalDepartments(res?.totalDepartment || deptList.length);
    } catch (error) {
      console.error("Error fetching departments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDepartments();
  }, [page, limit]);

  const handleStatus = async (id) => {
    try {
      await UpdateDepartmentStatus(id);
      Swal.fire({
        icon: "success",
        title: "Status Updated",
        timer: 1200,
        showConfirmButton: false,
      });
      getDepartments();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Status Update Failed",
        text: error?.response?.data?.message || "Failed to update department status",
        confirmButtonColor: "#0f172a"
      });
    }
  };

  const handleDelete = async (id, deptName) => {
    const result = await Swal.fire({
      title: "Delete Department?",
      text: `Are you sure you want to remove "${deptName || "this department"}"? Associated faculty HOD assignments will be unlinked.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0f172a",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel"
    });

    if (result.isConfirmed) {
      try {
        await DeleteDepartment(id);
        Swal.fire({
          title: "Deleted!",
          text: "Department deleted successfully.",
          icon: "success",
          confirmButtonColor: "#0f172a"
        });
        getDepartments();
      } catch (error) {
        Swal.fire({
          title: "Delete Failed",
          text: error?.response?.data?.message || "Could not delete department.",
          icon: "error",
          confirmButtonColor: "#0f172a"
        });
      }
    }
  };

  const handleViewDepartment = async (id) => {
    try {
      const res = await ViewOneDepartment(id);
      setSelectedDept(res.data?.data || res.data || res);
      setIsViewOpen(true);
    } catch (error) {
      console.error("Error loading department details:", error);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setPage(1);
  };

  // Client-side filtering on current department page
  const filteredDepartments = useMemo(() => {
    if (!Array.isArray(department)) return [];

    return department.filter((item) => {
      if (!item) return false;

      const name = String(item.DepartmentName || '').toLowerCase();
      const code = String(item.DepartmentCode || '').toLowerCase();
      const hodName = String(
        item.hod?.TeacherName ||
        (typeof item.HOD === 'object' && item.HOD ? item.HOD.TeacherName : item.HOD) ||
        ''
      ).toLowerCase();
      const query = String(searchTerm || '').toLowerCase().trim();

      const matchesSearch =
        !query ||
        name.includes(query) ||
        code.includes(query) ||
        hodName.includes(query);

      const isActive = item.Status === true || String(item.Status).toLowerCase() === 'active';
      const matchesStatus =
        !statusFilter ||
        (statusFilter === 'active' && isActive) ||
        (statusFilter === 'inactive' && !isActive);

      return matchesSearch && matchesStatus;
    });
  }, [department, searchTerm, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
            <span>Academic Setup</span>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Departments Management</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Departments Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
              {totalDepartments} Departments
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize college divisions, Department Codes, appointed HODs, and operational statuses
          </p>
        </div>

        <Link
          to="/admin/department/Add"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Department</span>
        </Link>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Live Search */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search department name, code, HOD..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition appearance-none"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
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

            {(searchTerm || statusFilter) && (
              <button
                onClick={resetFilters}
                title="Reset filters"
                className="px-2.5 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 transition text-xs flex items-center gap-1 shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Department Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3.5">Department Name</th>
                <th className="px-5 py-3.5">Code</th>
                <th className="px-5 py-3.5">Head of Dept (HOD)</th>
                <th className="px-5 py-3.5">Description</th>
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
                      <span className="mt-2 text-xs">Loading department records...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredDepartments.length > 0 ? (
                filteredDepartments.map((item) => {
                  const hodName =
                    item.hod?.TeacherName ||
                    (typeof item.HOD === 'object' && item.HOD ? item.HOD.TeacherName : item.HOD) ||
                    '-';
                  const isActive = item.Status === true || String(item.Status).toLowerCase() === 'active';

                  return (
                    <tr key={item._id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & Avatar */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <button
                              type="button"
                              onClick={() => handleViewDepartment(item._id)}
                              className="font-bold text-slate-900 hover:text-slate-600 transition text-left block"
                            >
                              {item.DepartmentName}
                            </button>
                            <span className="text-[11px] text-slate-500 font-mono">
                              ID: {item.DepartmentCode || "-"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Department Code */}
                      <td className="px-5 py-3.5">
                        <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md text-[11px] border border-slate-200 uppercase">
                          {item.DepartmentCode || "-"}
                        </span>
                      </td>

                      {/* HOD */}
                      <td className="px-5 py-3.5">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 font-medium text-slate-800">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>{hodName}</span>
                          </div>
                          {item.hod?.Email && (
                            <div className="text-[11px] text-slate-400 font-mono">
                              {item.hod.Email}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Description */}
                      <td className="px-5 py-3.5 text-slate-600 max-w-xs truncate" title={item.Description}>
                        {item.Description || '-'}
                      </td>

                      {/* Status Toggle Pill */}
                      <td className="px-5 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleStatus(item._id)}
                          title="Click to toggle department status"
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
                            onClick={() => handleViewDepartment(item._id)}
                            title="View Department"
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <Link
                            to={`/admin/department/edit/${item._id}`}
                            state={{ department: item }}
                            title="Edit Department"
                            className="p-1.5 rounded-lg border border-slate-200 text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            onClick={() => handleDelete(item._id, item.DepartmentName)}
                            title="Delete Department"
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
                    <p className="font-semibold text-slate-700">No departments found</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {searchTerm || statusFilter
                        ? "Try clearing your filters or search keywords"
                        : "Click '+ Add New Department' to create an academic division"}
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
            Showing <span className="font-semibold text-slate-800">{filteredDepartments.length}</span> departments (Page {page} of {totalPages})
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
      <DepartmentDetailsModal
        open={isViewOpen}
        onClose={() => {
          setIsViewOpen(false);
          setSelectedDept(null);
        }}
        department={selectedDept}
      />
    </div>
  );
}