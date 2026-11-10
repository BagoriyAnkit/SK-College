import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { useFormik } from "formik";
import * as Yup from "yup";
import moment from "moment";
import {
  ArrowLeft,
  CreditCard,
  User,
  GraduationCap,
  Calendar,
  Check,
  AlertCircle,
  History,
  FileText
} from "lucide-react";

import Loader from "../../../Components/Loader";
import { ViewOneFees, UpdateFees } from "../../../Service/admin/Fees";
import { ViewAllCourse } from "../../../Service/admin/Course";

export default function FeesEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [fees, setFees] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [feeRes, courseRes] = await Promise.all([
          ViewOneFees(id),
          ViewAllCourse(1, 100).catch(() => ({ data: [] }))
        ]);

        const feeData = feeRes?.data?.data || feeRes?.data || feeRes || null;
        setFees(feeData);

        const courseList = Array.isArray(courseRes?.data) ? courseRes.data : Array.isArray(courseRes) ? courseRes : [];
        setCourses(courseList);
      } catch (error) {
        console.error("Error fetching fee record for edit:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Fee account record not found or server error",
          confirmButtonColor: "#0f172a"
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const formik = useFormik({
    enableReinitialize: true,

    initialValues: {
      studentName: fees?.studentName || fees?.StudentName || "",
      courseName: fees?.courseName || "",
      totalFees: fees?.totalFees || "",
      discount: fees?.discount || 0,
      paidAmount: fees?.paidAmount || 0,
      dueAmount: fees?.dueAmount || 0,
      paymentDate: fees?.paymentDate
        ? moment(fees.paymentDate).format("YYYY-MM-DD")
        : "",
      paymentMode: fees?.paymentMode || "Cash",
      status: fees?.status || (Number(fees?.dueAmount || 0) <= 0 ? "Paid" : "Partial"),
    },

    validationSchema: Yup.object({
      studentName: Yup.string().required("Student Name is required"),
      courseName: Yup.string().required("Course selection is required"),
      totalFees: Yup.number()
        .typeError("Total fees must be a valid number")
        .positive("Total fees must be greater than 0")
        .required("Total fees is required"),
      discount: Yup.number()
        .typeError("Discount must be a number")
        .min(0, "Discount cannot be negative"),
      paidAmount: Yup.number()
        .typeError("Paid amount must be a number")
        .min(0, "Paid amount cannot be negative")
        .required("Paid amount is required"),
    }),

    onSubmit: async (values) => {
      try {
        setSubmitting(true);

        const payableFees =
          Number(values.totalFees || 0) - Number(values.discount || 0);

        const paid = Number(values.paidAmount || 0);
        const due = Math.max(0, payableFees - paid);

        const data = {
          studentId: fees?.studentId || undefined,
          studentName: values.studentName,
          courseName: values.courseName,
          courseId: fees?.courseId || undefined,
          totalFees: Number(values.totalFees),
          discount: Number(values.discount || 0),
          paidAmount: paid,
          dueAmount: due,
          paymentDate: values.paymentDate,
          paymentMode: values.paymentMode,
          status: due <= 0 ? "Paid" : "Partial",
        };

        const res = await UpdateFees(id, data);

        if (res?.status === true || res) {
          Swal.fire({
            icon: "success",
            title: "Success",
            text: "Fee account record updated successfully.",
            confirmButtonColor: "#0f172a"
          });

          navigate("/admin/fees");
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: res?.message || "Failed to update fee record.",
            confirmButtonColor: "#0f172a"
          });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text:
            error?.response?.data?.message ||
            error?.message ||
            "Something went wrong while updating fee record.",
          confirmButtonColor: "#0f172a"
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  const payableFees = Math.max(
    0,
    Number(formik.values.totalFees || 0) - Number(formik.values.discount || 0)
  );

  const calculatedDue = Math.max(
    0,
    payableFees - Number(formik.values.paidAmount || 0)
  );

  const paymentsList = Array.isArray(fees?.payments) ? fees.payments : [];

  if (loading) {
    return <Loader />;
  }

  if (!fees) {
    return (
      <div className="p-8 text-center text-slate-500">
        <h2 className="text-lg font-bold text-slate-800">Fee Record Not Found</h2>
        <Link
          to="/admin/fees"
          className="mt-4 inline-block px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
        >
          Back to Fees List
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
            <Link to="/admin/fees" className="hover:text-slate-800 transition">
              Fees &amp; Accounts Ledger
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Edit Fee Record</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Edit Fee Account: {fees.studentName || "Student"}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Modify course tuition assessment, recorded payments, and settlement balance
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/fees")}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition self-start sm:self-auto cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Fees</span>
        </button>
      </div>

      {/* Previous Installments Ledger (if recorded) */}
      {paymentsList.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
          <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100">
            <History className="w-4 h-4 text-slate-700" />
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Payment History &bull; Recorded Installments ({paymentsList.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="py-2 px-3">#</th>
                  <th className="py-2 px-3">Receipt No</th>
                  <th className="py-2 px-3">Payment Mode</th>
                  <th className="py-2 px-3">Date</th>
                  <th className="py-2 px-3 text-right">Amount Deposited</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paymentsList.map((p, idx) => (
                  <tr key={p._id || idx} className="hover:bg-slate-50/60">
                    <td className="py-2 px-3 font-semibold text-slate-800">#{idx + 1}</td>
                    <td className="py-2 px-3 font-mono text-slate-700">{p.receiptNo || "N/A"}</td>
                    <td className="py-2 px-3 text-slate-600">{p.paymentMode || "Cash"}</td>
                    <td className="py-2 px-3 text-slate-500 font-mono text-[11px]">
                      {p.paymentDate ? new Date(p.paymentDate).toLocaleDateString("en-GB") : "-"}
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-emerald-700">
                      ₹{Number(p.amount || 0).toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          {/* Section 1: Student & Program */}
          <div>
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
              <span className="w-1.5 h-4 bg-slate-900 rounded-full"></span>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                1. Student &amp; Program Information
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Student Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Student Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="studentName"
                  value={formik.values.studentName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-3 py-2.5 text-xs rounded-xl border bg-slate-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition ${
                    formik.touched.studentName && formik.errors.studentName
                      ? "border-rose-400 focus:border-rose-500"
                      : "border-slate-200 focus:border-slate-900"
                  }`}
                />
                {formik.touched.studentName && formik.errors.studentName && (
                  <p className="flex items-center gap-1 text-rose-500 text-[11px] mt-1 font-medium">
                    <AlertCircle className="w-3 h-3" />
                    <span>{formik.errors.studentName}</span>
                  </p>
                )}
              </div>

              {/* Course Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Academic Course <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="courseName"
                    value={formik.values.courseName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition appearance-none cursor-pointer"
                  >
                    <option value="">Select Academic Program</option>
                    {courses.map((c) => (
                      <option key={c._id} value={c.courseName}>
                        {c.courseName} {c.courseCode ? `(${c.courseCode})` : ""}
                      </option>
                    ))}
                    {formik.values.courseName &&
                      !courses.some((c) => c.courseName === formik.values.courseName) && (
                        <option value={formik.values.courseName}>
                          Current: {formik.values.courseName}
                        </option>
                      )}
                  </select>
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Fee Structure */}
          <div>
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
              <span className="w-1.5 h-4 bg-slate-900 rounded-full"></span>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                2. Fee Assessment &amp; Concessions
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Total Course Fees */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Total Course Fee (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  name="totalFees"
                  min="1"
                  value={formik.values.totalFees}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-3 py-2.5 text-xs rounded-xl border bg-slate-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition ${
                    formik.touched.totalFees && formik.errors.totalFees
                      ? "border-rose-400 focus:border-rose-500"
                      : "border-slate-200 focus:border-slate-900"
                  }`}
                />
                {formik.touched.totalFees && formik.errors.totalFees && (
                  <p className="flex items-center gap-1 text-rose-500 text-[11px] mt-1 font-medium">
                    <AlertCircle className="w-3 h-3" />
                    <span>{formik.errors.totalFees}</span>
                  </p>
                )}
              </div>

              {/* Concession / Discount */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Discount / Concession (₹)
                </label>
                <input
                  type="number"
                  name="discount"
                  min="0"
                  value={formik.values.discount}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition"
                />
              </div>

              {/* Net Payable */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Net Payable Fees (₹)
                </label>
                <input
                  type="number"
                  value={payableFees}
                  readOnly
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-100 font-bold text-slate-800 outline-none cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Recorded Deposits & Status */}
          <div>
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
              <span className="w-1.5 h-4 bg-slate-900 rounded-full"></span>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                3. Total Deposited &amp; Settlement Status
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Paid Amount */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Total Amount Deposited (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  name="paidAmount"
                  min="0"
                  value={formik.values.paidAmount}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-3 py-2.5 text-xs rounded-xl border bg-slate-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition ${
                    formik.touched.paidAmount && formik.errors.paidAmount
                      ? "border-rose-400 focus:border-rose-500"
                      : "border-slate-200 focus:border-slate-900"
                  }`}
                />
                {formik.touched.paidAmount && formik.errors.paidAmount && (
                  <p className="flex items-center gap-1 text-rose-500 text-[11px] mt-1 font-medium">
                    <AlertCircle className="w-3 h-3" />
                    <span>{formik.errors.paidAmount}</span>
                  </p>
                )}
              </div>

              {/* Remaining Due */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Outstanding Due Balance (₹)
                </label>
                <input
                  type="number"
                  value={calculatedDue}
                  readOnly
                  className={`w-full px-3 py-2.5 text-xs rounded-xl border font-bold outline-none cursor-not-allowed ${
                    calculatedDue > 0
                      ? "bg-amber-50 text-amber-800 border-amber-200"
                      : "bg-emerald-50 text-emerald-800 border-emerald-200"
                  }`}
                />
              </div>

              {/* Payment Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Last Payment Date
                </label>
                <input
                  type="date"
                  name="paymentDate"
                  value={formik.values.paymentDate}
                  onChange={formik.handleChange}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin/fees")}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{submitting ? "Saving Changes..." : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
