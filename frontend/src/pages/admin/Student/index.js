import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import Loader from "../../../Components/Loader";
import StudentDeatials from "./StudentDeatials";
import { ViewAllStudent, Delete, UpdateStudentStatus } from "../../../Service/admin/collage";
import { ViewAllBatch } from "../../../Service/admin/Batch";
import { ViewAllDepartment } from "../../../Service/admin/Department";
import {
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Filter,
  X,
  GraduationCap,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export default function Student() {
  const [students, setStudents] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [studentDetails, setStudentDetails] = useState(null);

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [batchFilter, setBatchFilter] = useState("all");
  const [semesterFilter, setSemesterFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Metadata dropdowns
  const [departmentList, setDepartmentList] = useState([]);
  const [batchList, setBatchList] = useState([]);

  // Fetch dropdown metadata once
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [dRes, bRes] = await Promise.all([
          ViewAllDepartment(1, 100).catch(() => ({ data: [] })),
          ViewAllBatch(1, 100).catch(() => ({ data: [] }))
        ]);
        setDepartmentList(dRes?.data || []);
        setBatchList(bRes?.data || []);
      } catch (err) {
        console.error("Error fetching filters metadata:", err);
      }
    };
    fetchMetadata();
  }, []);

  const getStudents = async () => {
    try {
      setLoading(true);
      const res = await ViewAllStudent(page, limit);
      const studentData = res?.data || [];
      setStudents(studentData);
      setTotalPages(res?.totalPages || 1);
      setTotalStudents(res?.totalStudents || studentData.length);
    } catch (err) {
      console.error("Error loading students:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getStudents();
  }, [page, limit]);

  // Client-side filter over loaded data
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      // 1. Search query filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const name = (s.StudentName || "").toLowerCase();
        const roll = (s.rollNumber || "").toLowerCase();
        const email = (s.email || "").toLowerCase();
        const phone = String(s.Phonenumber || "").toLowerCase();
        if (!name.includes(query) && !roll.includes(query) && !email.includes(query) && !phone.includes(query)) {
          return false;
        }
      }

      // 2. Department filter
      if (departmentFilter !== "all") {
        const sDeptId = typeof s.department === "object" ? s.department?._id : s.department;
        const sDeptName = typeof s.department === "object" ? s.department?.DepartmentName : s.department;
        if (sDeptId !== departmentFilter && sDeptName !== departmentFilter) {
          return false;
        }
      }

      // 3. Batch filter
      if (batchFilter !== "all") {
        const sBatchId = typeof s.batch === "object" ? s.batch?._id : s.batch;
        const sBatchName = typeof s.batch === "object" ? s.batch?.batchName : s.batch;
        if (sBatchId !== batchFilter && sBatchName !== batchFilter) {
          return false;
        }
      }

      // 4. Semester filter
      if (semesterFilter !== "all") {
        if (String(s.semester || 1) !== String(semesterFilter)) {
          return false;
        }
      }

      // 5. Status filter
      if (statusFilter !== "all") {
        if (String(s.status || "Active").toLowerCase() !== statusFilter.toLowerCase()) {
          return false;
        }
      }

      return true;
    });
  }, [students, searchTerm, departmentFilter, batchFilter, semesterFilter, statusFilter]);

  const handleStatus = async (id) => {
    try {
      await UpdateStudentStatus(id);
      Swal.fire({
        icon: "success",
        title: "Status Updated",
        timer: 1000,
        showConfirmButton: false
      });
      getStudents();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Status Update Failed",
        text: error?.response?.data?.message || "Failed to toggle status"
      });
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Student Record?",
      text: "This student profile will be permanently removed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Delete"
    });

    if (result.isConfirmed) {
      try {
        await Delete(id);
        Swal.fire({
          title: "Deleted!",
          text: "Student deleted successfully",
          icon: "success",
          timer: 1200,
          showConfirmButton: false
        });
        getStudents();
      } catch (error) {
        Swal.fire({
          title: "Error!",
          text: error?.response?.data?.message || "Delete failed",
          icon: "error"
        });
      }
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setDepartmentFilter("all");
    setBatchFilter("all");
    setSemesterFilter("all");
    setStatusFilter("all");
  };

  const hasActiveFilters =
    searchTerm !== "" ||
    departmentFilter !== "all" ||
    batchFilter !== "all" ||
    semesterFilter !== "all" ||
    statusFilter !== "all";

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <GraduationCap className="text-blue-600" size={24} />
            <span>Student Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage academic enrollments, student records, and class assignments
          </p>
        </div>

        <Link
          to="/admin/Student/add"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-2xs transition-colors self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Add New Student</span>
        </Link>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="lg:col-span-2 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, roll no, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full h-9 px-2.5 text-xs bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:border-blue-500 outline-none text-slate-700"
            >
              <option value="all">All Departments</option>
              {departmentList.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.DepartmentName}
                </option>
              ))}
            </select>
          </div>

          {/* Batch Filter */}
          <div>
            <select
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
              className="w-full h-9 px-2.5 text-xs bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:border-blue-500 outline-none text-slate-700"
            >
              <option value="all">All Batches</option>
              {batchList.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.batchName}
                </option>
              ))}
            </select>
          </div>

          {/* Semester Filter */}
          <div>
            <select
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
              className="w-full h-9 px-2.5 text-xs bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:border-blue-500 outline-none text-slate-700"
            >
              <option value="all">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Second Row: Status, Page Size, Reset */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Status:</span>
            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
              {["all", "active", "inactive"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold capitalize transition ${
                    statusFilter === st ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-[11px] text-rose-600 hover:text-rose-700 font-semibold"
              >
                <X size={12} />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500">Rows per page:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="h-8 px-2 text-xs bg-slate-50 rounded-md border border-slate-200 focus:border-blue-500 outline-none text-slate-700 font-medium"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader />
            <p className="text-xs text-slate-400 mt-3">Loading student records...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="px-4 py-3.5">Roll No</th>
                  <th className="px-4 py-3.5">Student</th>
                  <th className="px-4 py-3.5">Contact</th>
                  <th className="px-4 py-3.5">Course &amp; Sem</th>
                  <th className="px-4 py-3.5">Batch</th>
                  <th className="px-4 py-3.5">Department</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => {
                    const batchDisplay =
                      typeof student.batch === "object"
                        ? student.batch?.batchName || "N/A"
                        : student.batch || "N/A";

                    const deptDisplay =
                      typeof student.department === "object"
                        ? student.department?.DepartmentName || "N/A"
                        : student.department || "N/A";

                    const initial = student.StudentName ? student.StudentName.charAt(0).toUpperCase() : "S";

                    return (
                      <tr key={student._id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Roll Number */}
                        <td className="px-4 py-3 font-mono font-bold text-slate-800">
                          {student.rollNumber || "N/A"}
                        </td>

                        {/* Student Name & Email */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
                              {initial}
                            </div>
                            <div>
                              <button
                                type="button"
                                onClick={() => {
                                  setStudentDetails(student);
                                  setOpen(true);
                                }}
                                className="font-semibold text-slate-800 hover:text-blue-600 transition text-left"
                              >
                                {student.StudentName}
                              </button>
                              <p className="text-[11px] text-slate-400">{student.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Phone */}
                        <td className="px-4 py-3 text-slate-600 font-mono">
                          {student.Phonenumber || "N/A"}
                        </td>

                        {/* Course & Semester */}
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-700">{student.Course || "N/A"}</p>
                          <span className="text-[10px] text-slate-400">
                            Semester {student.semester || 1}
                          </span>
                        </td>

                        {/* Batch */}
                        <td className="px-4 py-3 text-slate-600">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
                            {batchDisplay}
                          </span>
                        </td>

                        {/* Department */}
                        <td className="px-4 py-3 text-slate-600">
                          <span className="text-slate-700">{deptDisplay}</span>
                        </td>

                        {/* Status Badge */}
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              student.status === "Active"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-slate-100 text-slate-600 border border-slate-200"
                            }`}
                          >
                            {student.status || "Active"}
                          </span>
                        </td>

                        {/* Standardized Actions */}
                        <td className="px-4 py-3 text-center">
                          <div className="inline-flex items-center justify-center gap-1.5">
                            {/* Quick View Button */}
                            <button
                              type="button"
                              onClick={() => {
                                setStudentDetails(student);
                                setOpen(true);
                              }}
                              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-blue-600 transition"
                              title="View Details"
                            >
                              <Eye size={15} />
                            </button>

                            {/* Edit Button */}
                            <Link
                              to={`/admin/Student/edit/${student._id}`}
                              state={{ student }}
                              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-amber-600 transition"
                              title="Edit Student"
                            >
                              <Edit2 size={15} />
                            </Link>

                            {/* Status Toggle Switch */}
                            <button
                              type="button"
                              onClick={() => handleStatus(student._id)}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded transition ${
                                student.status === "Active"
                                  ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                  : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                              }`}
                              title="Toggle Account Status"
                            >
                              {student.status === "Active" ? "Disable" : "Enable"}
                            </button>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => handleDelete(student._id)}
                              className="p-1.5 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                              title="Delete Student"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="px-4 py-12 text-center text-slate-400 text-xs italic">
                      No student records found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-800">{filteredStudents.length}</span> of{" "}
            <span className="font-semibold text-slate-800">{totalStudents}</span> students
          </div>

          <div className="inline-flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              title="Previous Page"
            >
              <ChevronLeft size={15} />
            </button>

            <span className="px-3 py-1 font-semibold text-slate-700 text-xs">
              Page {page} of {Math.max(1, totalPages)}
            </span>

            <button
              type="button"
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              title="Next Page"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Details View Modal */}
      <StudentDeatials
        open={open}
        onClose={() => setOpen(false)}
        student={studentDetails}
      />
    </div>
  );
}
