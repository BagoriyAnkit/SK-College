import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { ArrowLeft, User, BookOpen, Users, Check, AlertCircle, ShieldCheck } from "lucide-react";
import { Update, FindOne } from "../../../Service/admin/collage";
import { ViewAllBatch } from "../../../Service/admin/Batch";
import { ViewAllDepartment } from "../../../Service/admin/Department";
import { useFormik } from "formik";
import * as Yup from "yup";

export default function Edit() {
  const [student, setStudent] = useState(null);
  const [batches, setBatches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();

  const getStudent = async () => {
    try {
      const res = await FindOne(id);
      setStudent(res?.data?.data || null);
    } catch (error) {
      console.log("Error loading student:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      getStudent();
    }
    const loadMetadata = async () => {
      try {
        const bRes = await ViewAllBatch(1, 100);
        setBatches(bRes?.data || []);
      } catch (e) {
        console.log("Error loading batches:", e);
      }
      try {
        const dRes = await ViewAllDepartment(1, 100);
        setDepartments(dRes?.data || []);
      } catch (e) {
        console.log("Error loading departments:", e);
      }
    };
    loadMetadata();
  }, [id]);

  const formik = useFormik({
    enableReinitialize: true,

    initialValues: {
      StudentName: student?.StudentName || "",
      Phonenumber: student?.Phone || student?.Phonenumber || "",
      email: student?.email || "",
      address: student?.address || "",
      Course: student?.Course || student?.CourseId || "",
      dob: student?.dob ? student.dob.split("T")[0] : "",
      rollNumber: student?.rollNumber || "",
      semester: student?.semester || 1,
      batch: student?.batch?._id || student?.batch || "",
      department: student?.department?._id || student?.department || "",
      parentName: student?.parentName || "",
      parentContact: student?.parentContact || "",
      status: student?.status || "Active"
    },

    validationSchema: Yup.object({
      StudentName: Yup.string().required("Student Name is required"),
      Phonenumber: Yup.string()
        .matches(/^[0-9]{10}$/, "Phone Number must be exactly 10 digits")
        .required("Phone Number is required"),
      email: Yup.string().email("Invalid Email address").required("Email is required"),
      address: Yup.string().required("Address is required"),
      Course: Yup.string().required("Course name is required"),
      dob: Yup.date().required("Date of Birth is required"),
      rollNumber: Yup.string(),
      semester: Yup.number().min(1).max(12),
      batch: Yup.string(),
      department: Yup.string(),
      parentName: Yup.string(),
      parentContact: Yup.string(),
      status: Yup.string().oneOf(["Active", "Inactive"])
    }),

    onSubmit: async (values) => {
      setSubmitting(true);
      try {
        const res = await Update(id, values);

        if (res?.data?.status) {
          Swal.fire({
            icon: "success",
            title: "Success",
            text: "Student profile updated successfully",
            confirmButtonColor: "#0f172a"
          });
          navigate("/admin/Student");
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: res?.data?.message || "Failed to update student profile",
            confirmButtonColor: "#0f172a"
          });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: error?.response?.data?.message || "Something went wrong while saving changes",
          confirmButtonColor: "#0f172a"
        });
      } finally {
        setSubmitting(false);
      }
    }
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-8 h-8 border-3 border-slate-300 border-t-slate-800 rounded-full animate-spin"></div>
        <p className="mt-3 text-xs font-medium text-slate-500">Loading student details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
            <Link to="/admin/Student" className="hover:text-slate-800 transition">Students</Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Edit Student</span>
            {student?.StudentName && (
              <>
                <span>/</span>
                <span className="text-slate-500">{student.StudentName}</span>
              </>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Edit Student Profile</h1>
          <p className="text-xs text-slate-500 mt-0.5">Update student academic records, contact info, and status</p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/Student")}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition shadow-sm w-fit"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500" />
          <span>Back to Students</span>
        </button>
      </div>

      {/* Main Form */}
      <form onSubmit={formik.handleSubmit} className="space-y-6">
        {/* Section 1: Academic Details */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Academic Details</h2>
                <p className="text-xs text-slate-500">Program, enrollment, batch, and status</p>
              </div>
            </div>

            {/* Status Selector in Header */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Account Status:</span>
              <select
                name="status"
                value={formik.values.status}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`text-xs font-semibold px-2.5 py-1 rounded-md border outline-none ${
                  formik.values.status === "Active"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                    : "bg-rose-50 text-rose-700 border-rose-300"
                }`}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Roll Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Roll Number
              </label>
              <input
                type="text"
                name="rollNumber"
                placeholder="e.g. SK-2026-001"
                value={formik.values.rollNumber}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition"
              />
            </div>

            {/* Course */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Course <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="Course"
                placeholder="e.g. B.Tech Computer Science"
                value={formik.values.Course}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition ${
                  formik.touched.Course && formik.errors.Course ? "border-red-400 bg-red-50/20" : "border-slate-300"
                }`}
              />
              {formik.touched.Course && formik.errors.Course && (
                <p className="flex items-center gap-1 text-xs text-red-600 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {formik.errors.Course}
                </p>
              )}
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Department
              </label>
              <select
                name="department"
                value={formik.values.department}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition bg-white"
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.DepartmentName} {d.DepartmentCode ? `(${d.DepartmentCode})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Batch */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Batch
              </label>
              <select
                name="batch"
                value={formik.values.batch}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition bg-white"
              >
                <option value="">Select Batch</option>
                {batches.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.batchName} {b.session ? `(${b.session})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Semester */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Semester
              </label>
              <select
                name="semester"
                value={formik.values.semester}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition bg-white"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <option key={sem} value={sem}>
                    Semester {sem}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Personal Information */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-200 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Personal Information</h2>
              <p className="text-xs text-slate-500">Student identity, contact details, and residential address</p>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Student Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Student Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="StudentName"
                placeholder="Enter Student Full Name"
                value={formik.values.StudentName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition ${
                  formik.touched.StudentName && formik.errors.StudentName ? "border-red-400 bg-red-50/20" : "border-slate-300"
                }`}
              />
              {formik.touched.StudentName && formik.errors.StudentName && (
                <p className="flex items-center gap-1 text-xs text-red-600 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {formik.errors.StudentName}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="Phonenumber"
                placeholder="10-digit mobile number"
                maxLength={10}
                value={formik.values.Phonenumber}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition ${
                  formik.touched.Phonenumber && formik.errors.Phonenumber ? "border-red-400 bg-red-50/20" : "border-slate-300"
                }`}
              />
              {formik.touched.Phonenumber && formik.errors.Phonenumber && (
                <p className="flex items-center gap-1 text-xs text-red-600 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {formik.errors.Phonenumber}
                </p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                placeholder="student@example.com"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition ${
                  formik.touched.email && formik.errors.email ? "border-red-400 bg-red-50/20" : "border-slate-300"
                }`}
              />
              {formik.touched.email && formik.errors.email && (
                <p className="flex items-center gap-1 text-xs text-red-600 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {formik.errors.email}
                </p>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="dob"
                value={formik.values.dob}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition ${
                  formik.touched.dob && formik.errors.dob ? "border-red-400 bg-red-50/20" : "border-slate-300"
                }`}
              />
              {formik.touched.dob && formik.errors.dob && (
                <p className="flex items-center gap-1 text-xs text-red-600 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {formik.errors.dob}
                </p>
              )}
            </div>

            {/* Address */}
            <div className="md:col-span-2 lg:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Residential Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="address"
                placeholder="House no., street, locality, city, state"
                value={formik.values.address}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition ${
                  formik.touched.address && formik.errors.address ? "border-red-400 bg-red-50/20" : "border-slate-300"
                }`}
              />
              {formik.touched.address && formik.errors.address && (
                <p className="flex items-center gap-1 text-xs text-red-600 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {formik.errors.address}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Parent / Guardian Information */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-200 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Guardian / Emergency Contact</h2>
              <p className="text-xs text-slate-500">Parent or local guardian contact records</p>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Parent Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Parent / Guardian Name
              </label>
              <input
                type="text"
                name="parentName"
                placeholder="Enter Parent or Guardian Name"
                value={formik.values.parentName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition"
              />
            </div>

            {/* Parent Contact */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Parent Contact Number
              </label>
              <input
                type="text"
                name="parentContact"
                placeholder="10-digit mobile number"
                maxLength={10}
                value={formik.values.parentContact}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition"
              />
            </div>
          </div>
        </div>

        {/* Form Actions Footer */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate("/admin/Student")}
            className="px-5 py-2.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition shadow-sm disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>{submitting ? "Updating Student..." : "Update Student Profile"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}