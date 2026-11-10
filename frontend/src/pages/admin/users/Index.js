import React, { useEffect, useState, useCallback, useMemo } from "react";
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
  Shield,
  Building2,
  GraduationCap,
  Mail,
  Phone,
  UserCheck,
  UserX
} from "lucide-react";
import { ViewAllUser, DeleteUser, UpdateUserStatus } from "../../../Service/admin/User";
import UserDetailsModal from "./UserDetailsModal";

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loader, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Selected User for View Modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const getUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await ViewAllUser(page, limit, searchTerm, roleFilter);
      if (res && res.status) {
        setUsers(Array.isArray(res.data) ? res.data : []);
        setTotalPages(res.totalPages || 1);
        setTotalUsers(res.totalUsers || 0);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching staff users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchTerm, roleFilter]);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const handleStatusToggle = async (id) => {
    try {
      const res = await UpdateUserStatus(id);
      if (res && res.status) {
        Swal.fire({
          icon: "success",
          title: "Status Updated",
          text: `Account status is now ${res.data?.status || "updated"}`,
          timer: 1200,
          showConfirmButton: false,
        });
        getUsers();
      } else {
        throw new Error(res?.message || "Failed to update status");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Status Update Failed",
        text: error?.response?.data?.message || error.message || "Failed to update status",
        confirmButtonColor: "#0f172a"
      });
    }
  };

  const handleDelete = async (id, userName) => {
    const result = await Swal.fire({
      title: "Delete Staff Account?",
      text: `Are you sure you want to remove account access for ${userName || "this user"}? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0f172a",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel"
    });

    if (result.isConfirmed) {
      try {
        const res = await DeleteUser(id);
        if (res && res.status) {
          Swal.fire({
            title: "Deleted!",
            text: "Staff account has been deleted.",
            icon: "success",
            confirmButtonColor: "#0f172a"
          });
          getUsers();
        }
      } catch (error) {
        Swal.fire({
          title: "Delete Failed",
          text: error?.response?.data?.message || "Could not delete staff user",
          icon: "error",
          confirmButtonColor: "#0f172a"
        });
      }
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setIsViewOpen(true);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setRoleFilter("all");
    setStatusFilter("all");
    setPage(1);
  };

  const getRoleBadge = (role) => {
    const normalized = String(role || "staff").toLowerCase().trim();
    switch (normalized) {
      case "admin":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "hod":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "teacher":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "accountant":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  // Client-side status filter applied over the server-filtered dataset
  const filteredUsers = useMemo(() => {
    if (!Array.isArray(users)) return [];
    if (statusFilter === "all") return users;
    return users.filter((u) => {
      const uStatus = String(u.status || "Active").toLowerCase();
      return uStatus === statusFilter.toLowerCase();
    });
  }, [users, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
            <span>Administration</span>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Staff Accounts</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Staff Account Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
              {totalUsers} Accounts
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage system logins, role permissions, and academic profiles for HOD, Teacher, Accountant, and Admin
          </p>
        </div>

        <Link
          to="/admin/user/add"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Add Staff Account</span>
        </Link>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition"
            />
          </div>

          {/* Role Filter */}
          <div className="relative">
            <Shield className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-8 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition appearance-none"
            >
              <option value="all">All Roles</option>
              <option value="admin">Administrator</option>
              <option value="hod">HOD (Head of Dept)</option>
              <option value="teacher">Teacher / Faculty</option>
              <option value="accountant">Accountant / Finance</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition appearance-none"
            >
              <option value="all">All Statuses</option>
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

            {(searchTerm || roleFilter !== "all" || statusFilter !== "all") && (
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

      {/* Staff Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3.5">Staff Member</th>
                <th className="px-5 py-3.5">Assigned Role</th>
                <th className="px-5 py-3.5">Linked Faculty / Dept</th>
                <th className="px-5 py-3.5">Contact</th>
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
                      <span className="mt-2 text-xs">Loading staff accounts...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((item) => {
                  const isActive = String(item.status || "Active").toLowerCase() === "active";
                  const facultyInfo = item.facultyId;
                  const deptName =
                    facultyInfo?.Department ||
                    facultyInfo?.department?.DepartmentName ||
                    (typeof facultyInfo?.department === "string" ? facultyInfo.department : null);

                  const initials = String(item.name || "U")
                    .trim()
                    .split(/\s+/)
                    .filter(Boolean)
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase() || "U";

                  return (
                    <tr key={item._id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & Avatar */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {initials}
                          </div>
                          <div>
                            <button
                              onClick={() => handleViewUser(item)}
                              className="font-bold text-slate-900 hover:text-slate-600 transition text-left block"
                            >
                              {item.name}
                            </button>
                            <span className="text-[11px] text-slate-500 font-mono">
                              {item.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getRoleBadge(
                            item.role
                          )}`}
                        >
                          <Shield className="w-3 h-3" />
                          <span>{item.role || "staff"}</span>
                        </span>
                      </td>

                      {/* Linked Profile / Department */}
                      <td className="px-5 py-3.5">
                        {facultyInfo ? (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1 font-medium text-slate-800">
                              <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                              <span>{facultyInfo.TeacherName || "Linked Faculty"}</span>
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-slate-500">
                              <Building2 className="w-3 h-3 text-slate-400" />
                              <span>Dept: {deptName || "General"}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            Standalone Account
                          </span>
                        )}
                      </td>

                      {/* Contact */}
                      <td className="px-5 py-3.5 text-slate-600">
                        <div className="flex items-center gap-1.5 font-mono text-[11px]">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>
                            {item.phone ||
                              (facultyInfo?.PhoneNumber
                                ? String(facultyInfo.PhoneNumber)
                                : "N/A")}
                          </span>
                        </div>
                      </td>

                      {/* Status Toggle Pill */}
                      <td className="px-5 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleStatusToggle(item._id)}
                          title="Click to toggle account status"
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
                            onClick={() => handleViewUser(item)}
                            title="View Staff Profile"
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <Link
                            to={`/admin/user/edit/${item._id}`}
                            title="Edit Staff Account"
                            className="p-1.5 rounded-lg border border-slate-200 text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            onClick={() => handleDelete(item._id, item.name)}
                            title="Delete Staff Account"
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
                    <p className="font-semibold text-slate-700">No staff accounts found</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {searchTerm || roleFilter !== "all" || statusFilter !== "all"
                        ? "Try clearing your search query or role filter"
                        : "Click '+ Add Staff Account' to create an account for faculty or administrative staff"}
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
            Showing <span className="font-semibold text-slate-800">{filteredUsers.length}</span> staff records (Page {page} of {totalPages})
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

      {/* User Details Modal */}
      <UserDetailsModal
        open={isViewOpen}
        onClose={() => {
          setIsViewOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
      />
    </div>
  );
}