import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
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
import { FindUser, UpdateUser } from "../../../Service/admin/User";
import { ViewAll as ViewAllFaculty } from "../../../Service/admin/Teacher";
import { ViewAllDepartment } from "../../../Service/admin/Department";

export default function UserEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [facultyList, setFacultyList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [userRes, facRes, deptRes] = await Promise.all([
          FindUser(id),
          ViewAllFaculty(1, 100),
          ViewAllDepartment(1, 100)
        ]);

        if (userRes && userRes.status && userRes.data) {
          setUserData(userRes.data);
        } else {
          Swal.fire({ icon: "error", title: "User Not Found" });
          navigate("/admin/user");
          return;
        }

        const faculties = facRes?.data || facRes || [];
        setFacultyList(Array.isArray(faculties) ? faculties : []);

        const depts = deptRes?.data || deptRes || [];
        setDepartmentList(Array.isArray(depts) ? depts : []);
      } catch (err) {
        console.error("Error loading user edit data:", err);
        Swal.fire({ icon: "error", title: "Error loading user data" });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: userData?.name || "",
      email: userData?.email || "",
      password: "",
      phone:
        userData?.phone !== undefined && userData?.phone !== null
          ? String(userData.phone)
          : "",
      role: userData?.role || "teacher",
      status: userData?.status || "Active",
      facultyId: userData?.facultyId?._id || userData?.facultyId || "",
      departmentId:
        userData?.facultyId?.department?._id ||
        userData?.facultyId?.department ||
        "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Full Name is required"),
      role: Yup.string().required("Staff role is required"),
      status: Yup.string().required("Status is required"),
      password: Yup.string().test(
        "len",
        "Password must be at least 6 characters",
        (val) => !val || val.length >= 6
      ),
    }),
    onSubmit: async (values) => {
      try {
        setSubmitting(true);
        const payload = {
          name: values.name.trim(),
          phone: values.phone ? Number(values.phone) : undefined,
          role: values.role,
          status: values.status,
          facultyId: values.facultyId || null,
          departmentId: values.departmentId || undefined,
        };

        if (values.password && values.password.trim().length >= 6) {
          payload.password = values.password.trim();
        }

        const res = await UpdateUser(id, payload);
        if (res && res.status) {
          Swal.fire({
            icon: "success",
            title: "Staff Account Updated",
            text: `Successfully updated account for ${values.name}`,
            confirmButtonColor: "#0f172a"
          });
          navigate("/admin/user");
        } else {
          throw new Error(res?.message || "Failed to update account");
        }
      } catch (error) {
        console.error("Staff user update error:", error);
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: error?.response?.data?.message || error.message || "Failed to update staff account",
          confirmButtonColor: "#0f172a"
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  const isAcademicRole = formik.values.role === "teacher" || formik.values.role === "hod";
  const isHodRole = formik.values.role === "hod";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-8 h-8 border-3 border-slate-300 border-t-slate-800 rounded-full animate-spin"></div>
        <p className="mt-3 text-xs font-medium text-slate-500">Loading staff account details...</p>
      </div>
    );
  }

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
            <span className="text-slate-800 font-semibold">Edit Staff Account</span>
            {userData?.name && (
              <>
                <span>/</span>
                <span className="text-slate-500">{userData.name}</span>
              </>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Edit Staff Account</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Modify staff details, assigned role, linked faculty profile, and account status
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
              <p className="text-xs text-slate-500">Staff permission level and login accessibility</p>
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
                  Synchronize account with faculty and department records
                </p>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Faculty Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Linked Faculty Member
                </label>
                <select
                  name="facultyId"
                  value={formik.values.facultyId}
                  onChange={formik.handleChange}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition bg-white"
                >
                  <option value="">-- No Linked Faculty (Standalone Account) --</option>
                  {facultyList.map((f) => (
                    <option key={f._id} value={f._id}>
                      {f.TeacherName} ({f.Email || f.Department || "Faculty"})
                    </option>
                  ))}
                </select>
              </div>

              {/* Department Linking for HOD */}
              {isHodRole && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Managed Department
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
              <p className="text-xs text-slate-500">Staff name, email identifier, and password reset</p>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Email (Read-Only) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address (Login Username)
              </label>
              <input
                type="email"
                disabled
                value={formik.values.email}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 text-sm outline-none cursor-not-allowed font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Email serves as the unique login username and cannot be modified.
              </p>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Staff Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
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

            {/* Change Password (Optional) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Update Password (Optional)
              </label>
              <input
                type="password"
                name="password"
                placeholder="Leave blank to preserve current password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition font-mono ${
                  formik.touched.password && formik.errors.password ? "border-red-400 bg-red-50/20" : "border-slate-300"
                }`}
              />
              {formik.touched.password && formik.errors.password ? (
                <p className="flex items-center gap-1 text-xs text-red-600 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {formik.errors.password}
                </p>
              ) : (
                <p className="text-[11px] text-slate-400 mt-1">
                  Only enter a new password if you wish to reset it (minimum 6 characters).
                </p>
              )}
            </div>

            {/* Contact Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Contact Number
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
            <span>{submitting ? "Saving Changes..." : "Save Changes"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}