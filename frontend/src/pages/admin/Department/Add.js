import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  ArrowLeft,
  Building2,
  User,
  FileText,
  Check,
  AlertCircle
} from 'lucide-react';
import { AddDepartment } from '../../../Service/admin/Department';
import { ViewAll as ViewAllFaculty } from '../../../Service/admin/Teacher';

export default function DepartmentAdd() {
  const navigate = useNavigate();
  const [facultyList, setFacultyList] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const res = await ViewAllFaculty(1, 100);
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setFacultyList(list);
      } catch (err) {
        console.error("Error fetching faculty list for department creation:", err);
      }
    };
    fetchFaculty();
  }, []);

  const formik = useFormik({
    initialValues: {
      DepartmentName: "",
      DepartmentCode: "",
      HOD: "",
      hod: "",
      Description: "",
    },
    validationSchema: Yup.object({
      DepartmentName: Yup.string().required("Department Name is required"),
      DepartmentCode: Yup.string().required("Department Code is required"),
      hod: Yup.string().required("Please select an HOD from faculty list"),
      Description: Yup.string().required("Description is required")
    }),
    onSubmit: async (values) => {
      try {
        setSubmitting(true);
        const res = await AddDepartment(values);
        if (res) {
          Swal.fire({
            title: "Success!",
            text: "Department added successfully",
            icon: "success",
            confirmButtonColor: "#0f172a"
          });
          navigate("/admin/department");
        }
      } catch (error) {
        const message = error?.response?.data?.message || "Something went wrong";
        Swal.fire({
          title: "Registration Failed",
          text: message,
          icon: "error",
          confirmButtonColor: "#0f172a"
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
            <Link to="/admin/department" className="hover:text-slate-800 transition">
              Departments Management
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Add Department</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Add New Department</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Register an academic division, assign an appointed HOD, and specify mission goals
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/department")}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition shadow-sm w-fit"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500" />
          <span>Back to Departments</span>
        </button>
      </div>

      {/* Main Form */}
      <form onSubmit={formik.handleSubmit} className="space-y-6">
        {/* Section 1: Department Identity & Leadership */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-200 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Department Overview & Leadership</h2>
              <p className="text-xs text-slate-500">Official title, administrative code, and appointed department head</p>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Department Name */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Department Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="DepartmentName"
                placeholder="e.g. Computer Science and Engineering"
                value={formik.values.DepartmentName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition ${
                  formik.touched.DepartmentName && formik.errors.DepartmentName ? "border-red-400 bg-red-50/20" : "border-slate-300"
                }`}
              />
              {formik.touched.DepartmentName && formik.errors.DepartmentName && (
                <p className="flex items-center gap-1 text-xs text-red-600 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {formik.errors.DepartmentName}
                </p>
              )}
            </div>

            {/* Department Code */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Department Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="DepartmentCode"
                placeholder="e.g. CSE"
                value={formik.values.DepartmentCode}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 placeholder-slate-400 uppercase font-mono focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition ${
                  formik.touched.DepartmentCode && formik.errors.DepartmentCode ? "border-red-400 bg-red-50/20" : "border-slate-300"
                }`}
              />
              {formik.touched.DepartmentCode && formik.errors.DepartmentCode && (
                <p className="flex items-center gap-1 text-xs text-red-600 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {formik.errors.DepartmentCode}
                </p>
              )}
            </div>

            {/* HOD Faculty Selector */}
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Appointed Head of Department (HOD) <span className="text-red-500">*</span>
              </label>
              <select
                name="hod"
                value={formik.values.hod}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  const selectedFac = facultyList.find(f => String(f._id) === String(selectedId));
                  formik.setFieldValue("hod", selectedId);
                  formik.setFieldValue("HOD", selectedFac ? selectedFac.TeacherName : "");
                }}
                onBlur={formik.handleBlur}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition bg-white ${
                  formik.touched.hod && formik.errors.hod ? "border-red-400 bg-red-50/20" : "border-slate-300"
                }`}
              >
                <option value="">-- Select Faculty Member as HOD --</option>
                {facultyList.map((f) => (
                  <option key={f._id} value={f._id}>
                    {f.TeacherName} {f.Qualification ? `(${f.Qualification})` : ""} {f.Department ? `- ${f.Department}` : ""}
                  </option>
                ))}
              </select>
              {formik.touched.hod && formik.errors.hod && (
                <p className="flex items-center gap-1 text-xs text-red-600 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {formik.errors.hod}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Department Description */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-200 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Mission & Academic Description</h2>
              <p className="text-xs text-slate-500">Provide an overview of departmental focus and facilities</p>
            </div>
          </div>

          <div className="p-6">
            <textarea
              name="Description"
              rows="4"
              placeholder="Enter department vision, research facilities, and curriculum domains"
              value={formik.values.Description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full p-3.5 rounded-lg border text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition ${
                formik.touched.Description && formik.errors.Description ? "border-red-400 bg-red-50/20" : "border-slate-300"
              }`}
            />
            {formik.touched.Description && formik.errors.Description && (
              <p className="flex items-center gap-1 text-xs text-red-600 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {formik.errors.Description}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            to="/admin/department"
            className="px-5 py-2.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition shadow-sm disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>{submitting ? "Registering Department..." : "Register Department"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}