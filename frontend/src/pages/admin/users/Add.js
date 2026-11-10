import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  ArrowLeft,
  Shield,
  User,
  Mail,
  Lock,
  Phone,
  GraduationCap,
  Building2,
  Check,
  AlertCircle
} from "lucide-react";
import { CreateUser } from "../../../Service/admin/User";
import { ViewAll as ViewAllFaculty } from "../../../Service/admin/Teacher";
import { ViewAllDepartment } from "../../../Service/admin/Department";

export default function UserAdd() {
  const navigate = useNavigate();
  const [facultyList, setFacultyList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [facRes, deptRes] = await Promise.all([
          ViewAllFaculty(1, 100),
          ViewAllDepartment(1, 100)
        ]);

        const faculties = facRes?.data || facRes || [];
        setFacultyList(Array.isArray(faculties) ? faculties : []);

        const depts = deptRes?.data || deptRes || [];
        setDepartmentList(Array.isArray(depts) ? depts : []);
      } catch (err) {
        console.error("Error loading faculty/departments:", err);
      }
    };
    fetchData();
  }, []);

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      role: "teacher",
      status: "Active",
      facultyId: "",
      departmentId: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Full Name is required"),
      email: Yup.string().email("Invalid email format").required("Email is required"),
      password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
      role: Yup.string().required("Staff role is required"),
      status: Yup.string().required("Status is required"),
    }),
    onSubmit: async (values) => {
      try {
        setSubmitting(true);
        const payload = {
          name: values.name.trim(),
          email: values.email.trim().toLowerCase(),
          password: values.password,
          phone: values.phone ? Number(values.phone) : undefined,
          role: values.role,
          status: values.status,
          facultyId: values.facultyId || undefined,
          departmentId: values.departmentId || undefined,
        };

        const res = await CreateUser(payload);
        if (res && res.status) {
          Swal.fire({
            icon: "success",
            title: "Staff Account Created",
            text: `Successfully created ${values.role.toUpperCase()} account for ${values.name}`,
            confirmButtonColor: "#0f172a"
          });
          navigate("/admin/user");
        } else {
          throw new Error(res?.message || "Failed to create account");
        }
      } catch (error) {
        console.error("Staff user create error:", error);
        Swal.fire({
          icon: "error",
          title: "Account Creation Failed",
          text: error?.response?.data?.message || error.message || "Failed to create staff account",
          confirmButtonColor: "#0f172a"
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  // When a faculty is selected from dropdown, auto-fill details
  const handleFacultySelect = (e) => {
    const selectedId = e.target.value;
    formik.setFieldValue("facultyId", selectedId);

    if (selectedId) {
      const selectedFaculty = facultyList.find((f) => String(f._id) === String(selectedId));
      if (selectedFaculty) {
        if (!formik.values.name || formik.values.name === "Staff User") {
          formik.setFieldValue("name", selectedFaculty.TeacherName || "");
        }
        if (!formik.values.email) {
          formik.setFieldValue("email", selectedFaculty.Email || "");
        }
        if (!formik.values.phone && selectedFaculty.PhoneNumber) {
          formik.setFieldValue("phone", String(selectedFaculty.PhoneNumber));
        }
        if (selectedFaculty.department) {
          const deptId =
            typeof selectedFaculty.department === "object"
              ? selectedFaculty.department._id
              : selectedFaculty.department;
          formik.setFieldValue("departmentId", deptId || "");
        }
      }
    }
  };

  const isAcademicRole = formik.values.role === "teacher" || formik.values.role === "hod";
  const isHodRole = formik.values.role === "hod";

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
            <Link to="/admin/user" className="hover:text-slate-800 transition">
              Staff Accounts
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Add Staff Account</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Add Staff Account</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create an authenticated login account with role permissions for HOD, Teacher, Accountant, or Admin
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/user")}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition shadow-sm w-fit"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500" />
          <span>Back to Staff List</span>
        </button>
      </div>

      {/* Main Form */}
      <form onSubmit={formik.handleSubmit} className="space-y-6">
        {/* Section 1: Role & Access Controls */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-200 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Role & Access Settings</h2>
              <p className="text-xs text-slate-500">Select role permissions and account activation status</p>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Staff Role */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Staff Role <span className="text-red-500">*</span>
              </label>
              <select
                name="role"
                value={formik.values.role}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition bg-white"
              >
                <option value="teacher">Teacher / Faculty</option>
                <option value="hod">Head of Department (HOD)</option>
                <option value="accountant">Accountant / Finance</option>
                <option value="admin">Administrator</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Dictates accessible dashboard sections, navigation items, and data permissions.
              </p>
            </div>

            {/* Account Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Account Status <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                value={formik.values.status}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition bg-white"
              >
                <option value="Active">Active (Permitted to log in)</option>
                <option value="Inactive">Inactive (Login blocked)</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Inactive accounts are prevented from logging into the ERP system.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Academic Profile Linking (for Teacher & HOD) */}
        {isAcademicRole && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-200 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Academic Profile Linking</h2>
                <p className="text-xs text-slate-500">
                  Link this login user with existing faculty record for batch, exam, and department synchronization
                </p>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Faculty Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Faculty Member (Recommended)
                </label>
                <select
                  name="facultyId"
                  value={formik.values.facultyId}
                  onChange={handleFacultySelect}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition bg-white"
                >
                  <option value="">-- Standalone Account (No Link) --</option>
                  {facultyList.map((f) => (
                    <option key={f._id} value={f._id}>
                      {f.TeacherName} ({f.Email || f.Department || "Faculty"})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Selecting a teacher auto-populates name, email, phone, and department.
                </p>
              </div>

              {/* Department Linking for HOD */}
              {isHodRole && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Assigned Managed Department
                  </label>
                  <select
                    name="departmentId"
                    value={formik.values.departmentId}
                    onChange={formik.handleChange}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition bg-white"
                  >
                    <option value="">-- Select Managed Department --</option>
                    {departmentList.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.DepartmentName} {d.DepartmentCode ? `(${d.DepartmentCode})` : ""}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Associates this HOD with the department dashboard and academic records.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Section 3: Credentials & Profile Details */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-200 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">User Credentials & Profile</h2>
              <p className="text-xs text-slate-500">Login username, authentication password, and contact coordinates</p>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Staff Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                placeholder="e.g. Dr. Rajesh Kumar"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition ${
                  formik.touched.name && formik.errors.name ? "border-red-400 bg-red-50/20" : "border-slate-300"
                }`}
              />
              {formik.touched.name && formik.errors.name && (
                <p className="flex items-center gap-1 text-xs text-red-600 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {formik.errors.name}
                </p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address (Login Username) <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                placeholder="e.g. rajesh.kumar@college.edu"
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

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Account Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="password"
                placeholder="Minimum 6 characters"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition font-mono ${
                  formik.touched.password && formik.errors.password ? "border-red-400 bg-red-50/20" : "border-slate-300"
                }`}
              />
              {formik.touched.password && formik.errors.password && (
                <p className="flex items-center gap-1 text-xs text-red-600 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {formik.errors.password}
                </p>
              )}
            </div>

            {/* Contact Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Contact Number (Optional)
              </label>
              <input
                type="text"
                name="phone"
                placeholder="10-digit mobile number"
                maxLength={10}
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition font-mono"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            to="/admin/user"
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
            <span>{submitting ? "Creating Account..." : "Create Staff Account"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}