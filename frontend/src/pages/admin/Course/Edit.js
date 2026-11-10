import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  ArrowLeft,
  BookOpen,
  Building2,
  Clock,
  Layers,
  GraduationCap,
  FileText,
  Check,
  AlertCircle
} from 'lucide-react';
import { updateCourse, FindOneCourse } from '../../../Service/admin/Course';
import { ViewAllDepartment } from '../../../Service/admin/Department';

export default function CourseEdit() {
  const [course, setCourse] = useState({});
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [courseRes, deptRes] = await Promise.all([
          FindOneCourse(id),
          ViewAllDepartment(1, 100)
        ]);
        setCourse(courseRes?.data || courseRes || {});
        const deptList = Array.isArray(deptRes?.data) ? deptRes.data : Array.isArray(deptRes) ? deptRes : [];
        setDepartments(deptList);
      } catch (error) {
        console.error("Error fetching course edit data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMetadata();
    }
  }, [id]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      courseName: course.courseName || "",
      courseCode: course.courseCode || "",
      department: course.department || "",
      duration: course.duration || "",
      totalSemester: course.totalSemester || "",
      courseType: course.courseType || "UG",
      description: course.description || "",
      status: course.status || "Active",
    },

    validationSchema: Yup.object({
      courseName: Yup.string().required("Course Name is required"),
      courseCode: Yup.string().required("Course Code is required"),
      department: Yup.string().required("Department is required"),
      duration: Yup.string().required("Duration is required"),
      totalSemester: Yup.number().required("Total Semester is required"),
      courseType: Yup.string().required("Course Type is required"),
      description: Yup.string().required("Description is required"),
      status: Yup.string().oneOf(["Active", "Inactive"]),
    }),

    onSubmit: async (values) => {
      try {
        setSubmitting(true);
        const res = await updateCourse(id, values);

        if (res.data?.status || res.status === 200) {
          Swal.fire({
            title: "Success!",
            text: "Course updated successfully",
            icon: "success",
            confirmButtonColor: "#0f172a"
          });
          navigate("/admin/Course");
        }
      } catch (error) {
        const message = error?.response?.data?.message || "Something went wrong while updating course";
        Swal.fire({
          title: "Update Failed",
          text: message,
          icon: "error",
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
        <p className="mt-3 text-xs font-medium text-slate-500">Loading course details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
            <Link to="/admin/Course" className="hover:text-slate-800 transition">
              Courses Management
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Edit Course</span>
            {course.courseName && (
              <>
                <span>/</span>
                <span className="text-slate-500">{course.courseName}</span>
              </>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Edit Course Program</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Modify course curriculum, academic terms, and departmental alignment
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/Course")}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition shadow-sm w-fit"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500" />
          <span>Back to Courses</span>
        </button>
      </div>

      {/* Main Form */}
      <form onSubmit={formik.handleSubmit} className="space-y-6">
        {/* Section 1: Course Identity & Academic Classification */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Program Information</h2>
                <p className="text-xs text-slate-500">Degree title, course code, and departmental assignment</p>
              </div>
            </div>

            {/* Status Selector in Header */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Course Status:</span>
              <select
                name="status"
                value={formik.values.status}
                onChange={formik.handleChange}
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
            {/* Course Name */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Course Program Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="courseName"
                placeholder="e.g. Bachelor of Computer Applications (BCA)"
                value={formik.values.courseName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition ${
                  formik.touched.courseName && formik.errors.courseName ? "border-red-400 bg-red-50/20" : "border-slate-300"
                }`}
              />
              {formik.touched.courseName && formik.errors.courseName && (
                <p className="flex items-center gap-1 text-xs text-red-600 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {formik.errors.courseName}
                </p>
              )}
            </div>

            {/* Course Code */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Course Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="courseCode"
                placeholder="e.g. BCA-101"
                value={formik.values.courseCode}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 placeholder-slate-400 uppercase font-mono focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition ${
                  formik.touched.courseCode && formik.errors.courseCode ? "border-red-400 bg-red-50/20" : "border-slate-300"
                }`}
              />
              {formik.touched.courseCode && formik.errors.courseCode && (
                <p className="flex items-center gap-1 text-xs text-red-600 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {formik.errors.courseCode}
                </p>
              )}
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Department <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                list="dept-options-edit"
                name="department"
                placeholder="e.g. Computer Science"
                value={formik.values.department}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition ${
                  formik.touched.department && formik.errors.department ? "border-red-400 bg-red-50/20" : "border-slate-300"
                }`}
              />
              <datalist id="dept-options-edit">
                {departments.map((d) => (
                  <option key={d._id} value={d.DepartmentName} />
                ))}
              </datalist>
              {formik.touched.department && formik.errors.department && (
                <p className="flex items-center gap-1 text-xs text-red-600 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {formik.errors.department}
                </p>
              )}
            </div>

            {/* Course Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Course Type / Level <span className="text-red-500">*</span>
              </label>
              <select
                name="courseType"
                value={formik.values.courseType}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition bg-white"
              >
                <option value="UG">Undergraduate (UG)</option>
                <option value="PG">Postgraduate (PG)</option>
                <option value="Diploma">Diploma</option>
                <option value="Certificate">Certificate</option>
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Program Duration <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="duration"
                placeholder="e.g. 3 Years or 6 Semesters"
                value={formik.values.duration}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition ${
                  formik.touched.duration && formik.errors.duration ? "border-red-400 bg-red-50/20" : "border-slate-300"
                }`}
              />
              {formik.touched.duration && formik.errors.duration && (
                <p className="flex items-center gap-1 text-xs text-red-600 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {formik.errors.duration}
                </p>
              )}
            </div>

            {/* Total Semesters */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Total Semesters <span className="text-red-500">*</span>
              </label>
              <select
                name="totalSemester"
                value={formik.values.totalSemester}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition bg-white ${
                  formik.touched.totalSemester && formik.errors.totalSemester ? "border-red-400 bg-red-50/20" : "border-slate-300"
                }`}
              >
                <option value="">Select Semesters</option>
                <option value="1">1 Semester</option>
                <option value="2">2 Semesters (1 Year)</option>
                <option value="3">3 Semesters</option>
                <option value="4">4 Semesters (2 Years)</option>
                <option value="6">6 Semesters (3 Years)</option>
                <option value="8">8 Semesters (4 Years)</option>
              </select>
              {formik.touched.totalSemester && formik.errors.totalSemester && (
                <p className="flex items-center gap-1 text-xs text-red-600 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {formik.errors.totalSemester}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Curriculum Description */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-200 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Curriculum Description</h2>
              <p className="text-xs text-slate-500">Provide an overview of the course objectives and learning outcomes</p>
            </div>
          </div>

          <div className="p-6">
            <textarea
              name="description"
              rows="4"
              placeholder="Enter detailed description of the program syllabus, career pathways, and academic focus"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full p-3.5 rounded-lg border text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition ${
                formik.touched.description && formik.errors.description ? "border-red-400 bg-red-50/20" : "border-slate-300"
              }`}
            />
            {formik.touched.description && formik.errors.description && (
              <p className="flex items-center gap-1 text-xs text-red-600 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {formik.errors.description}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            to="/admin/Course"
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
            <span>{submitting ? "Updating Course..." : "Update Course"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}