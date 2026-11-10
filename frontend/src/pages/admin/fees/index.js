import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import {
  Search,
  Plus,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Printer,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Calendar,
  Layers,
  FileText
} from "lucide-react";

import Loader from "../../../Components/Loader";
import FeesDetails from "./FeesDeatails";
import ReceiptModal from "./ReceiptModal";
import { ViewAllFees, DeleteFees } from "../../../Service/admin/Fees";
import { ViewAllCourse } from "../../../Service/admin/Course";

export default function FeesList() {
  const [fees, setFees] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [open, setOpen] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedFees, setSelectedFees] = useState(null);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Role permissions
  const userStr = localStorage.getItem("adminUser") || localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const userRole = String(user?.role || "").toLowerCase();
  const canManage = userRole === "admin" || userRole === "accountant";

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await ViewAllFees(1, 1000);
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setFees(list);
    } catch (error) {
      console.error("Error fetching fees list:", error);
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
      console.error("Error fetching courses for fee filter:", err);
    }
  };

  useEffect(() => {
    fetchData();
    loadCourses();
  }, []);

  const handleDelete = async (id, studentName) => {
    const result = await Swal.fire({
      title: "Delete Fee Record?",
      text: `Are you sure you want to delete the fee ledger for "${studentName || "this student"}"? Existing receipt links will be removed.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0f172a",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel"
    });

    if (result.isConfirmed) {
      try {
        await DeleteFees(id);

        Swal.fire({
          title: "Deleted!",
          text: "Fee record deleted successfully.",
          icon: "success",
          confirmButtonColor: "#0f172a"
        });

        fetchData();
      } catch (error) {
        Swal.fire({
          title: "Delete Failed",
          text: error?.response?.data?.message || "Failed to delete fee record.",
          icon: "error",
          confirmButtonColor: "#0f172a"
        });
      }
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setCourseFilter("");
    setStatusFilter("");
    setPage(1);
  };

  // Real statistics computed directly from loaded database records
  const statistics = useMemo(() => {
    let totalFeesSum = 0;
    let collectedSum = 0;
    let pendingSum = 0;

    fees.forEach((f) => {
      const netPayable = Math.max(0, Number(f.totalFees || 0) - Number(f.discount || 0));
      const paid = Number(f.paidAmount || 0);
      const due = Number(f.dueAmount !== undefined ? f.dueAmount : Math.max(0, netPayable - paid));

      totalFeesSum += netPayable;
      collectedSum += paid;
      pendingSum += Math.max(0, due);
    });

    return {
      totalFees: totalFeesSum,
      collected: collectedSum,
      pending: pendingSum,
      count: fees.length
    };
  }, [fees]);

  // Filtered fee records
  const filteredFees = useMemo(() => {
    if (!Array.isArray(fees)) return [];

    return fees.filter((item) => {
      if (!item) return false;

      const name = String(
        item.studentName ||
          item.StudentName ||
          item.studentId?.StudentName ||
          item.studentId?.studentName ||
          ""
      ).toLowerCase();
      const roll = String(
        item.studentId?.RollNumber || item.studentId?.rollNumber || item.rollNumber || ""
      ).toLowerCase();
      const course = String(item.courseName || "").toLowerCase();
      const id = String(item._id || "").toLowerCase();

      const search = searchTerm.toLowerCase().trim();

      const matchesSearch =
        !search ||
        name.includes(search) ||
        roll.includes(search) ||
        course.includes(search) ||
        id.includes(search);

      // Course Filter
      const matchesCourse =
        !courseFilter || course === courseFilter.toLowerCase();

      // Status Filter
      const netPayable = Math.max(0, Number(item.totalFees || 0) - Number(item.discount || 0));
      const paid = Number(item.paidAmount || 0);
      const due = Number(item.dueAmount !== undefined ? item.dueAmount : Math.max(0, netPayable - paid));
      const isPaid = due <= 0;

      const matchesStatus =
        !statusFilter ||
        (statusFilter === "paid" && isPaid) ||
        (statusFilter === "pending" && !isPaid);

      return matchesSearch && matchesCourse && matchesStatus;
    });
  }, [fees, searchTerm, courseFilter, statusFilter]);

  // Pagination Slicing
  const totalPages = Math.ceil(filteredFees.length / limit) || 1;
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * limit;
  const paginatedFees = filteredFees.slice(startIndex, startIndex + limit);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Fees &amp; Accounts Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track student fee balances, monitor installment payments, and generate official university receipts
          </p>
        </div>

        {canManage && (
          <Link
            to="/admin/fees/add"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record Fee Payment</span>
          </Link>
        )}
      </div>

      {/* Real Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Fees */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Fees Expected
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900">
            ₹{statistics.totalFees.toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Across {statistics.count} student ledger accounts
          </p>
        </div>

        {/* Collected Amount */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
              Total Amount Collected
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-emerald-700">
            ₹{statistics.collected.toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Verified deposits and recorded installments
          </p>
        </div>

        {/* Outstanding / Pending Amount */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">
              Pending / Outstanding Due
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-amber-700">
            ₹{statistics.pending.toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Receivables pending installment clearance
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search student, roll number, course..."
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

          {/* Payment Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition appearance-none cursor-pointer"
            >
              <option value="">All Payment Statuses</option>
              <option value="paid">Fully Paid / Cleared Only</option>
              <option value="pending">Outstanding Due / Partial Only</option>
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Filter Info & Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Showing {filteredFees.length} matching fee records</span>
            {(searchTerm || courseFilter || statusFilter) && (
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

      {/* Fees Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/75 text-slate-600 font-semibold">
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Course</th>
                <th className="py-3.5 px-4 text-right">Total Net Fee</th>
                <th className="py-3.5 px-4 text-right">Paid Amount</th>
                <th className="py-3.5 px-4 text-right">Remaining Due</th>
                <th className="py-3.5 px-4 text-center">Last Payment Date</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedFees.length > 0 ? (
                paginatedFees.map((fee) => {
                  const displayName =
                    fee.studentName ||
                    fee.StudentName ||
                    fee.studentId?.StudentName ||
                    fee.studentId?.studentName ||
                    "Student";

                  const rollNumber =
                    fee.studentId?.RollNumber ||
                    fee.studentId?.rollNumber ||
                    fee.rollNumber ||
                    "";

                  const totalFee = Number(fee.totalFees || 0);
                  const discount = Number(fee.discount || 0);
                  const netPayable = Math.max(0, totalFee - discount);
                  const paid = Number(fee.paidAmount || 0);
                  const due = Number(fee.dueAmount !== undefined ? fee.dueAmount : Math.max(0, netPayable - paid));
                  const isPaid = due <= 0;

                  const paymentsCount = Array.isArray(fee.payments) ? fee.payments.length : 1;

                  return (
                    <tr
                      key={fee._id}
                      className="hover:bg-slate-50/60 transition group"
                    >
                      {/* Student */}
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFees(fee);
                            setOpen(true);
                          }}
                          className="hover:underline text-left text-slate-900 font-bold group-hover:text-blue-900 block truncate transition cursor-pointer"
                          title="View Fee Account Details"
                        >
                          {displayName}
                        </button>
                        {rollNumber && (
                          <div className="text-[11px] font-mono text-slate-400 font-normal">
                            Roll: {rollNumber}
                          </div>
                        )}
                      </td>

                      {/* Course */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800 line-clamp-1">
                          {fee.courseName || "General Course"}
                        </div>
                      </td>

                      {/* Total Net Fee */}
                      <td className="py-3 px-4 text-right font-medium text-slate-900">
                        <div>₹{netPayable.toLocaleString("en-IN")}</div>
                        {discount > 0 && (
                          <span className="text-[10px] text-emerald-600 block">
                            (Disc: ₹{discount})
                          </span>
                        )}
                      </td>

                      {/* Paid Amount */}
                      <td className="py-3 px-4 text-right">
                        <span className="font-bold text-emerald-700">
                          ₹{paid.toLocaleString("en-IN")}
                        </span>
                        {paymentsCount > 1 && (
                          <span className="text-[10px] text-slate-400 block font-normal">
                            {paymentsCount} installments
                          </span>
                        )}
                      </td>

                      {/* Remaining Due */}
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`font-bold ${
                            due > 0 ? "text-amber-700" : "text-emerald-700"
                          }`}
                        >
                          ₹{due.toLocaleString("en-IN")}
                        </span>
                      </td>

                      {/* Payment Date */}
                      <td className="py-3 px-4 text-center font-mono text-slate-600 text-[11px]">
                        {fee.paymentDate
                          ? new Date(fee.paymentDate).toLocaleDateString("en-GB")
                          : "-"}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-4 text-center">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span>Paid</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            <span>Partial Due</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* View Account */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedFees(fee);
                              setOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                            title="View Account Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Print / View Receipt */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedFees(fee);
                              setReceiptModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition cursor-pointer"
                            title="Print / View Receipt"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit */}
                          {canManage && (
                            <Link
                              to={`/admin/fees/edit/${fee._id}`}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                              title="Edit Record"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Link>
                          )}

                          {/* Delete */}
                          {canManage && (
                            <button
                              type="button"
                              onClick={() => handleDelete(fee._id, displayName)}
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
                  <td colSpan="8" className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-slate-400">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                        <CreditCard className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700">No Fee Records Found</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Try modifying search or filter criteria, or record a new fee payment.
                      </p>
                      {(searchTerm || courseFilter || statusFilter) && (
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
        {filteredFees.length > 0 && (
          <div className="border-t border-slate-200/80 px-4 py-3 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <div>
              Showing <span className="font-semibold text-slate-800">{startIndex + 1}</span> to{" "}
              <span className="font-semibold text-slate-800">
                {Math.min(startIndex + limit, filteredFees.length)}
              </span>{" "}
              of <span className="font-semibold text-slate-800">{filteredFees.length}</span> fee records
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

      {/* Fees Details Modal */}
      <FeesDetails
        open={open}
        onClose={() => {
          setOpen(false);
          setSelectedFees(null);
        }}
        fees={selectedFees}
      />

      {/* Printable Receipt Modal */}
      <ReceiptModal
        open={receiptModalOpen}
        onClose={() => {
          setReceiptModalOpen(false);
          setSelectedFees(null);
        }}
        fees={selectedFees}
      />
    </div>
  );
}
