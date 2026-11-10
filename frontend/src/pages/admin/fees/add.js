import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
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

import { AddFees, ViewAllFees } from "../../../Service/admin/Fees";
import { ViewAllCourse } from "../../../Service/admin/Course";
import { ViewAllAdmission } from "../../../Service/admin/admission";
import { ViewAllStudent } from "../../../Service/admin/collage";

export default function FeesAdd() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [students, setStudents] = useState([]);
  const [existingFees, setExistingFees] = useState([]);
  const [selectedStudentLedger, setSelectedStudentLedger] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [cRes, admRes, stuRes, feeRes] = await Promise.all([
          ViewAllCourse(1, 100).catch(() => ({ data: [] })),
          ViewAllAdmission().catch(() => ({ data: [] })),
          ViewAllStudent(1, 100).catch(() => ({ data: [] })),
          ViewAllFees(1, 1000).catch(() => ({ data: [] }))
        ]);

        const courseList = Array.isArray(cRes?.data) ? cRes.data : Array.isArray(cRes) ? cRes : [];
        setCourses(courseList);

        const admList = Array.isArray(admRes?.data) ? admRes.data : Array.isArray(admRes) ? admRes : [];
        setAdmissions(admList);

        const stuList = Array.isArray(stuRes?.data) ? stuRes.data : Array.isArray(stuRes) ? stuRes : [];
        setStudents(stuList);

        const feeList = Array.isArray(feeRes?.data) ? feeRes.data : Array.isArray(feeRes) ? feeRes : [];
        setExistingFees(feeList);
      } catch (error) {
        console.error("Error fetching fee metadata:", error);
      }
    };

    fetchMetadata();
  }, []);

  const formik = useFormik({
    initialValues: {
      studentName: "",
      courseName: "",
      courseId: "",
      totalFees: "",
      discount: 0,
      paidAmount: "",
      dueAmount: "",
      paymentDate: new Date().toISOString().split("T")[0],
      paymentMode: "Cash",
      transactionId: "",
      remarks: "",
      status: "Active",
    },

    validationSchema: Yup.object({
      studentName: Yup.string().required("Student selection is required"),
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
      paymentDate: Yup.string().required("Payment date is required"),
    }),

    onSubmit: async (values) => {
      try {
        setSubmitting(true);

        const payableFees =
          Number(values.totalFees || 0) - Number(values.discount || 0);

        const paid = Number(values.paidAmount || 0);
        const due = Math.max(0, payableFees - paid);

        // Find candidate from admissions or students list
        const selectedAdm = admissions.find(
          (item) => item._id === values.studentName || item.studentName === values.studentName
        );
        const selectedStu = students.find(
          (item) => item._id === values.studentName || item.StudentName === values.studentName
        );

        const finalStudentName =
          selectedAdm?.studentName ||
          selectedStu?.StudentName ||
          values.studentName;

        const finalStudentId =
          selectedAdm?._id ||
          selectedStu?._id ||
          values.studentName;

        const payload = {
          studentId: finalStudentId,
          studentName: finalStudentName,
          courseName: values.courseName,
          courseId: values.courseId || undefined,
          totalFees: Number(values.totalFees),
          discount: Number(values.discount || 0),
          paidAmount: paid,
          dueAmount: due,
          paymentDate: values.paymentDate,
          paymentMode: values.paymentMode || "Cash",
          transactionId: values.transactionId || "",
          remarks: values.remarks || "",
          status: due <= 0 ? "Paid" : "Partial",
        };

        const res = await AddFees(payload);

        if (res?.status === true || res) {
          Swal.fire({
            title: "Success!",
            text: "Fee payment recorded successfully.",
            icon: "success",
            confirmButtonColor: "#0f172a",
          });

          navigate("/admin/fees");
        } else {
          Swal.fire({
            title: "Error!",
            text: res?.message || "Failed to record fee payment.",
            icon: "error",
            confirmButtonColor: "#0f172a",
          });
        }
      } catch (error) {
        Swal.fire({
          title: "Error!",
          text:
            error?.response?.data?.message ||
            error?.message ||
            "Something went wrong while submitting fee payment.",
          icon: "error",
          confirmButtonColor: "#0f172a",
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Calculate live payable and due amounts
  const payableFees = Math.max(
    0,
    Number(formik.values.totalFees || 0) - Number(formik.values.discount || 0)
  );

  const calculatedDue = Math.max(
    0,
    payableFees - Number(formik.values.paidAmount || 0)
  );

  // When a student is selected from dropdown
  const handleStudentChange = (e) => {
    const studentVal = e.target.value;
    formik.setFieldValue("studentName", studentVal);

    if (!studentVal) {
      setSelectedStudentLedger(null);
      return;
    }

    // Match in admissions or students
    const matchedAdm = admissions.find((a) => a._id === studentVal || a.studentName === studentVal);
    const matchedStu = students.find((s) => s._id === studentVal || s.StudentName === studentVal);

    const studentCourse = matchedAdm?.courseName || matchedStu?.Course || "";

    if (studentCourse) {
      formik.setFieldValue("courseName", studentCourse);

      // Find matching course in courses list to prefill tuition fees
      const matchedCourseObj = courses.find(
        (c) =>
          c.courseName?.toLowerCase() === studentCourse.toLowerCase() ||
          c.courseCode?.toLowerCase() === studentCourse.toLowerCase()
      );

      if (matchedCourseObj) {
        formik.setFieldValue("courseId", matchedCourseObj._id);
        if (matchedCourseObj.totalFees) {
          formik.setFieldValue("totalFees", matchedCourseObj.totalFees);
        }
      }
    }

    // Check if an existing ledger exists for this student
    const matchedFee = existingFees.find(
      (f) =>
        f.studentId === studentVal ||
        f.studentName === matchedAdm?.studentName ||
        f.studentName === matchedStu?.StudentName
    );

    if (matchedFee) {
      setSelectedStudentLedger(matchedFee);
      // Pre-fill total fees and discount from existing ledger
      if (matchedFee.totalFees) formik.setFieldValue("totalFees", matchedFee.totalFees);
      if (matchedFee.discount) formik.setFieldValue("discount", matchedFee.discount);
      if (matchedFee.courseName) formik.setFieldValue("courseName", matchedFee.courseName);
    } else {
      setSelectedStudentLedger(null);
    }
  };

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
            <span className="text-slate-800 font-semibold">Record Payment</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Record Fee Payment
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Collect tuition and term fees, configure concessions, and issue official university receipts
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/fees")}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition self-start sm:self-auto cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Fees List</span>
        </button>
      </div>

      {/* Existing Student Ledger Alert (if found) */}
      {selectedStudentLedger && (
        <div className="p-4 bg-blue-50/80 rounded-2xl border border-blue-200 text-xs text-blue-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-sm text-blue-950">
              <History className="w-4 h-4 text-blue-700" />
              <span>Existing Fee Account Detected</span>
            </div>
            <p className="text-blue-700">
              This candidate already has recorded transactions.
              Total Fee: <strong>₹{selectedStudentLedger.totalFees}</strong> &bull;
              Already Paid: <strong className="text-emerald-700">₹{selectedStudentLedger.paidAmount}</strong> &bull;
              Outstanding Balance: <strong className="text-amber-800">₹{selectedStudentLedger.dueAmount}</strong>
            </p>
          </div>

          <span className="px-3 py-1 rounded-full bg-blue-100 font-semibold text-blue-800 text-[11px] shrink-0">
            Existing Account
          </span>
        </div>
      )}

      {/* Form Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          {/* Section 1: Student & Program Details */}
          <div>
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
              <span className="w-1.5 h-4 bg-slate-900 rounded-full"></span>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                1. Student &amp; Academic Program Linkage
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Student Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Student / Applicant <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="studentName"
                    value={formik.values.studentName}
                    onChange={handleStudentChange}
                    onBlur={formik.handleBlur}
                    className={`w-full px-3 py-2.5 text-xs rounded-xl border bg-slate-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition appearance-none cursor-pointer ${
                      formik.touched.studentName && formik.errors.studentName
                        ? "border-rose-400 focus:border-rose-500"
                        : "border-slate-200 focus:border-slate-900"
                    }`}
                  >
                    <option value="">Select Enrolled Student or Applicant</option>
                    <optgroup label="Enrolled Students">
                      {students.map((stu) => (
                        <option key={stu._id} value={stu._id}>
                          {stu.StudentName} {stu.rollNumber ? `(Roll: ${stu.rollNumber})` : ""} - {stu.Course || "Student"}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Admissions / Applicants">
                      {admissions.map((adm) => (
                        <option key={adm._id} value={adm._id}>
                          {adm.studentName} - {adm.courseName}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                  <User className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {formik.touched.studentName && formik.errors.studentName && (
                  <p className="flex items-center gap-1 text-rose-500 text-[11px] mt-1 font-medium">
                    <AlertCircle className="w-3 h-3" />
                    <span>{formik.errors.studentName}</span>
                  </p>
                )}
              </div>

              {/* Course Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Academic Course <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="courseId"
                    value={formik.values.courseId}
                    onChange={(e) => {
                      const courseId = e.target.value;
                      formik.setFieldValue("courseId", courseId);

                      const selectedCourse = courses.find((c) => String(c._id) === String(courseId));
                      if (selectedCourse) {
                        formik.setFieldValue("courseName", selectedCourse.courseName);
                        if (selectedCourse.totalFees) {
                          formik.setFieldValue("totalFees", selectedCourse.totalFees);
                        }
                      }
                    }}
                    onBlur={formik.handleBlur}
                    className={`w-full px-3 py-2.5 text-xs rounded-xl border bg-slate-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition appearance-none cursor-pointer ${
                      formik.touched.courseName && formik.errors.courseName
                        ? "border-rose-400 focus:border-rose-500"
                        : "border-slate-200 focus:border-slate-900"
                    }`}
                  >
                    <option value="">Select Academic Program</option>
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.courseName} {c.courseCode ? `(${c.courseCode})` : ""}
                      </option>
                    ))}
                    {formik.values.courseName && !formik.values.courseId && (
                      <option value="">Current: {formik.values.courseName}</option>
                    )}
                  </select>
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {formik.touched.courseName && formik.errors.courseName && (
                  <p className="flex items-center gap-1 text-rose-500 text-[11px] mt-1 font-medium">
                    <AlertCircle className="w-3 h-3" />
                    <span>{formik.errors.courseName}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Financial Calculation */}
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
                  placeholder="e.g. 50000"
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
                  Institutional Discount / Concession (₹)
                </label>
                <input
                  type="number"
                  name="discount"
                  placeholder="e.g. 5000"
                  min="0"
                  value={formik.values.discount}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition"
                />
              </div>

              {/* Net Payable Fees (Readonly) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Net Payable Course Fee (₹)
                </label>
                <input
                  type="number"
                  value={payableFees}
                  readOnly
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-100 font-bold text-slate-800 outline-none cursor-not-allowed"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Computed as (Total Fee − Concession)
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Payment Transaction Details */}
          <div>
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
              <span className="w-1.5 h-4 bg-slate-900 rounded-full"></span>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                3. Payment Transaction &amp; Settlement
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Paid Amount */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Deposit / Paid Amount (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  name="paidAmount"
                  placeholder="e.g. 20000"
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

              {/* Due Amount (Readonly) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Remaining Due / Balance (₹)
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
                <span className="text-[11px] text-slate-400 mt-1 block">
                  {calculatedDue <= 0 ? "Account fully cleared" : "Balance pending installment clearance"}
                </span>
              </div>

              {/* Payment Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Payment Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  name="paymentDate"
                  value={
                    formik.values.paymentDate
                      ? moment(formik.values.paymentDate).format("YYYY-MM-DD")
                      : ""
                  }
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition"
                />
              </div>

              {/* Payment Mode */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Payment Mode
                </label>
                <select
                  name="paymentMode"
                  value={formik.values.paymentMode}
                  onChange={formik.handleChange}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition cursor-pointer"
                >
                  <option value="Cash">Cash Counter</option>
                  <option value="UPI / QR">UPI / QR Code</option>
                  <option value="Net Banking">Net Banking / NEFT</option>
                  <option value="Debit / Credit Card">Debit / Credit Card</option>
                  <option value="Cheque">Bank Cheque</option>
                  <option value="Demand Draft">Demand Draft (DD)</option>
                </select>
              </div>

              {/* Transaction / Reference ID */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Transaction Reference / Cheque No.
                </label>
                <input
                  type="text"
                  name="transactionId"
                  placeholder="e.g. UPI-923847294"
                  value={formik.values.transactionId}
                  onChange={formik.handleChange}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition"
                />
              </div>

              {/* Remarks / Installment Note */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Payment Remarks / Notes
                </label>
                <input
                  type="text"
                  name="remarks"
                  placeholder="e.g. 1st Term Installment"
                  value={formik.values.remarks}
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
              <span>{submitting ? "Processing Payment..." : "Record Fee Payment"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
