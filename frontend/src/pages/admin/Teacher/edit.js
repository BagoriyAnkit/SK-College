import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { ArrowLeft, User, Building2, Check, AlertCircle } from "lucide-react";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { UpdateTeacher, ViewOne } from '../../../Service/admin/Teacher';
import { ViewAllDepartment } from '../../../Service/admin/Department';

export default function TeacherEdit() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [teachers, setTeachers] = useState({});
  const [departmentList, setDepartmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await ViewAllDepartment(1, 100);
        const list = res?.data || res || [];
        setDepartmentList(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Error fetching department list:", err);
      }
    };
    fetchDepartments();
  }, []);

  const getTeachers = async () => {
    try {
      const res = await ViewOne(id);
      setTeachers(res.data.data || res.data || {});
    } catch (error) {
      console.log("Error loading teacher:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      getTeachers();
    }
  }, [id]);

  // Resolve initial department ID
  const initialDeptId = (() => {
    if (teachers.department?._id) return teachers.department._id;
    if (teachers.department) return teachers.department;
    if (teachers.Department && departmentList.length > 0) {
      const match = departmentList.find(
        (d) => d.DepartmentName?.toLowerCase() === teachers.Department.toLowerCase()
      );
      if (match) return match._id;
    }
    return "";
  })();

  const formik = useFormik({
    enableReinitialize: true,

    initialValues: {
      TeacherName: teachers.TeacherName || "",
      PhoneNumber: teachers.PhoneNumber !== undefined && teachers.PhoneNumber !== null ? String(teachers.PhoneNumber) : "",
      Email: teachers.Email || "",
      department: initialDeptId,
      Department: teachers.department?.DepartmentName || teachers.Department || "",
      Qualification: teachers.Qualification || "",
      Experience: teachers.Experience || "",
      gender: teachers.gender || ""
    },

    validationSchema: Yup.object({
      TeacherName: Yup.string().required("Teacher Name is required"),
      PhoneNumber: Yup.string()
        .matches(/^[0-9]{10}$/, "Phone Number must be exactly 10 digits")
        .required("Phone Number is required"),
      Email: Yup.string()
        .email("Invalid Email address")
        .required("Email is required"),
      department: Yup.string().required("Department selection is required"),
      Qualification: Yup.string().required("Qualification is required"),
      Experience: Yup.string().required("Experience is required"),
      gender: Yup.string().required("Gender selection is required"),
    }),

    onSubmit: async (values) => {
      setSubmitting(true);
      try {
        await UpdateTeacher(id, values);

        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Faculty profile updated successfully",
          confirmButtonColor: "#0f172a"
        });

        navigate("/admin/Teacher");
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
    },
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-8 h-8 border-3 border-slate-300 border-t-slate-800 rounded-full animate-spin"></div>
        <p className="mt-3 text-xs font-medium text-slate-500">Loading faculty details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
            <Link to="/admin/Teacher" className="hover:text-slate-800 transition">Faculty Directory</Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Edit Faculty</span>
            {teachers?.TeacherName && (
              <>
                <span>/</span>
                <span className="text-slate-500">{teachers.TeacherName}</span>
              </>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Edit Faculty Profile</h1>
          <p className="text-xs text-slate-500 mt-0.5">Modify faculty qualifications, department assignment, and contact details</p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/Teacher")}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition shadow-sm w-fit"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500" />
          <span>Back to Faculty List</span>
        </button>
      </div>

      {/* Main Form */}
      <form onSubmit={formik.handleSubmit} className="space-y-6">
        {/* Section 1: Academic & Professional Details */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-200 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Professional & Departmental Details</h2>
              <p className="text-xs text-slate-500">Academic title, assigned department, and credentials</p>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Teacher Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Faculty Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="TeacherName"
                placeholder="e.g. Dr. Johnathan Smith"
                value={formik.values.TeacherName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition ${
                  formik.touched.TeacherName && formik.errors.TeacherName ? "border-red-400 bg-red-50/20" : "border-slate-300"
                }`}
              />
              {formik.touched.TeacherName && formik.errors.TeacherName && (
                <p className="flex items-center gap-1 text-xs text-red-600 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {formik.errors.TeacherName}
                </p>
              )}
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Assigned Department <span className="text-red-500">*</span>
              </label>
              <select
                name="department"
                value={formik.values.department}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  const selectedDept = departmentList.find((d) => String(d._id) === String(selectedId));
                  formik.setFieldValue("department", selectedId);
                  formik.setFieldValue("Department", selectedDept ? selectedDept.DepartmentName : "");
                }}
                onBlur={formik.handleBlur}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition bg-white ${
                  formik.touched.department && formik.errors.department ? "border-red-400 bg-red-50/20" : "border-slate-300"
                }`}
              >
                <option value="">Select Department</option>
                {departmentList.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.DepartmentName} {d.DepartmentCode ? `(${d.DepartmentCode})` : ""}
                  </option>
                ))}
                {teachers.Department && !initialDeptId && (
                  <option value="">Current (Unlinked): {teachers.Department}</option>
                )}
              </select>
              {formik.touched.department && formik.errors.department && (
                <p className="flex items-center gap-1 text-xs text-red-600 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {formik.errors.department}
                </p>
              )}
            </div>

            {/* Qualification */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Qualification <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="Qualification"
                placeholder="e.g. Ph.D in Computer Science, M.Tech"
                value={formik.values.Qualification}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition ${
                  formik.touched.Qualification && formik.errors.Qualification ? "border-red-400 bg-red-50/20" : "border-slate-300"
                }`}
              />
              {formik.touched.Qualification && formik.errors.Qualification && (
                <p className="flex items-center gap-1 text-xs text-red-600 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {formik.errors.Qualification}
                </p>
              )}
            </div>

            {/* Experience */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Teaching / Industry Experience <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="Experience"
                placeholder="e.g. 5+ Years"
                value={formik.values.Experience}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition ${
                  formik.touched.Experience && formik.errors.Experience ? "border-red-400 bg-red-50/20" : "border-slate-300"
                }`}
              />
              {formik.touched.Experience && formik.errors.Experience && (
                <p className="flex items-center gap-1 text-xs text-red-600 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {formik.errors.Experience}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Personal & Contact Information */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-200 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Contact & Personal Details</h2>
              <p className="text-xs text-slate-500">Contact coordinates and personal demographics</p>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Phone Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="PhoneNumber"
                placeholder="10-digit mobile number"
                maxLength={10}
                value={formik.values.PhoneNumber}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition ${
                  formik.touched.PhoneNumber && formik.errors.PhoneNumber ? "border-red-400 bg-red-50/20" : "border-slate-300"
                }`}
              />
              {formik.touched.PhoneNumber && formik.errors.PhoneNumber && (
                <p className="flex items-center gap-1 text-xs text-red-600 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {formik.errors.PhoneNumber}
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
                name="Email"
                placeholder="faculty@college.edu"
                value={formik.values.Email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition ${
                  formik.touched.Email && formik.errors.Email ? "border-red-400 bg-red-50/20" : "border-slate-300"
                }`}
              />
              {formik.touched.Email && formik.errors.Email && (
                <p className="flex items-center gap-1 text-xs text-red-600 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {formik.errors.Email}
                </p>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                name="gender"
                value={formik.values.gender}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition bg-white ${
                  formik.touched.gender && formik.errors.gender ? "border-red-400 bg-red-50/20" : "border-slate-300"
                }`}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Custom">Custom</option>
              </select>
              {formik.touched.gender && formik.errors.gender && (
                <p className="flex items-center gap-1 text-xs text-red-600 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {formik.errors.gender}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate("/admin/Teacher")}
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
            <span>{submitting ? "Updating Faculty..." : "Update Faculty Profile"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}