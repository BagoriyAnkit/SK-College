import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  ArrowLeft,
  Users,
  BookOpen,
  Calendar,
  User,
  Check,
  AlertCircle
} from "lucide-react";
import Loader from "../../../Components/Loader";
import { UpdateBatch, ViewOneBatch } from "../../../Service/admin/Batch";
import { ViewAllCourse } from "../../../Service/admin/Course";
import { ViewAll as ViewAllTeachers } from "../../../Service/admin/Teacher";

export default function BatchEdit() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [batch, setBatch] = useState({});
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [batchRes, courseRes, teacherRes] = await Promise.all([
          ViewOneBatch(id),
          ViewAllCourse(1, 100),
          ViewAllTeachers(1, 100)
        ]);

        setBatch(batchRes?.data || {});

        const courseList = Array.isArray(courseRes?.data) ? courseRes.data : Array.isArray(courseRes) ? courseRes : [];
        setCourses(courseList);

        const teacherList = Array.isArray(teacherRes?.data) ? teacherRes.data : Array.isArray(teacherRes) ? teacherRes : [];
        setTeachers(teacherList);
      } catch (error) {
        console.error("Error fetching batch edit metadata:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  // Resolve initial course ObjectId
  const initialCourseId = (() => {
    if (batch.course?._id) return batch.course._id;
    if (typeof batch.course === "string" && batch.course) return batch.course;
    if (batch.courseName && courses.length > 0) {
      const match = courses.find((c) => c.courseName?.toLowerCase() === String(batch.courseName).toLowerCase());
      if (match) return match._id;
    }
    return "";
  })();

  // Resolve initial teacher ObjectId
  const initialTeacherId = (() => {
    if (batch.classTeacher?._id) return batch.classTeacher._id;
    if (typeof batch.classTeacher === "string" && batch.classTeacher) return batch.classTeacher;
    return "";
  })();

  const formik = useFormik({
    enableReinitialize: true,

    initialValues: {
      batchName: batch.batchName || "",
      course: initialCourseId,
      courseName: batch.course?.courseName || batch.courseName || "",
      session: batch.session || "",
      strength: batch.strength || "",
      classTeacher: initialTeacherId,
      status: batch.status ?? true,
    },

    validationSchema: Yup.object({
      batchName: Yup.string().required("Batch Name is required"),
      course: Yup.string().required("Academic Course is required"),
      session: Yup.string().required("Session (e.g. 2024-2027) is required"),
      strength: Yup.number()
        .typeError("Strength must be a valid number")
        .positive("Strength must be greater than 0")
        .required("Intake strength / seats is required"),
      classTeacher: Yup.string().required("Class Teacher is required"),
      status: Yup.boolean().required("Status is required")
    }),

    onSubmit: async (values) => {
      try {
        setSubmitting(true);
        await UpdateBatch(id, values);

        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Batch updated successfully.",
          confirmButtonColor: "#0f172a"
        });

        navigate("/admin/batch");
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: error?.response?.data?.message || "Something went wrong while updating batch",
          confirmButtonColor: "#0f172a"
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
            <Link to="/admin/batch" className="hover:text-slate-800 transition">
              Batches Management
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Edit Batch</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Edit Batch: {batch.batchName || "Cohort"}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Update cohort details, academic course linkage, capacity, and assigned mentor
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/batch")}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition self-start sm:self-auto cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Batches</span>
        </button>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          {/* Section 1: Academic Cohort & Details */}
          <div>
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
              <span className="w-1.5 h-4 bg-slate-900 rounded-full"></span>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Cohort Details & Program Linkage
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Batch Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Batch Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="batchName"
                    placeholder="e.g. BCA 2024-27 Division A"
                    value={formik.values.batchName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`w-full px-3 py-2.5 text-xs rounded-xl border bg-slate-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition ${
                      formik.touched.batchName && formik.errors.batchName
                        ? "border-rose-400 focus:border-rose-500"
                        : "border-slate-200 focus:border-slate-900"
                    }`}
                  />
                  <Users className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {formik.touched.batchName && formik.errors.batchName && (
                  <p className="flex items-center gap-1 text-rose-500 text-[11px] mt-1 font-medium">
                    <AlertCircle className="w-3 h-3" />
                    <span>{formik.errors.batchName}</span>
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
                    name="course"
                    value={formik.values.course}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      const selectedCourse = courses.find((c) => String(c._id) === String(selectedId));
                      formik.setFieldValue("course", selectedId);
                      formik.setFieldValue("courseName", selectedCourse ? selectedCourse.courseName : "");
                    }}
                    onBlur={formik.handleBlur}
                    className={`w-full px-3 py-2.5 text-xs rounded-xl border bg-slate-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition appearance-none cursor-pointer ${
                      formik.touched.course && formik.errors.course
                        ? "border-rose-400 focus:border-rose-500"
                        : "border-slate-200 focus:border-slate-900"
                    }`}
                  >
                    <option value="">Select Associated Course</option>
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.courseName} {c.courseCode ? `(${c.courseCode})` : ""}
                      </option>
                    ))}
                    {batch.courseName && !initialCourseId && (
                      <option value="">Current: {batch.courseName}</option>
                    )}
                  </select>
                  <BookOpen className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {formik.touched.course && formik.errors.course && (
                  <p className="flex items-center gap-1 text-rose-500 text-[11px] mt-1 font-medium">
                    <AlertCircle className="w-3 h-3" />
                    <span>{formik.errors.course}</span>
                  </p>
                )}
              </div>

              {/* Academic Session */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Academic Session / Term <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="session"
                    placeholder="e.g. 2024-2027 or 2024-2025"
                    value={formik.values.session}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`w-full px-3 py-2.5 text-xs rounded-xl border bg-slate-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition ${
                      formik.touched.session && formik.errors.session
                        ? "border-rose-400 focus:border-rose-500"
                        : "border-slate-200 focus:border-slate-900"
                    }`}
                  />
                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {formik.touched.session && formik.errors.session && (
                  <p className="flex items-center gap-1 text-rose-500 text-[11px] mt-1 font-medium">
                    <AlertCircle className="w-3 h-3" />
                    <span>{formik.errors.session}</span>
                  </p>
                )}
              </div>

              {/* Class Teacher */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Class Teacher / Mentor <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="classTeacher"
                    value={formik.values.classTeacher}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`w-full px-3 py-2.5 text-xs rounded-xl border bg-slate-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition appearance-none cursor-pointer ${
                      formik.touched.classTeacher && formik.errors.classTeacher
                        ? "border-rose-400 focus:border-rose-500"
                        : "border-slate-200 focus:border-slate-900"
                    }`}
                  >
                    <option value="">Designate Faculty Mentor</option>
                    {teachers.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.TeacherName} {t.Department ? `(${t.Department})` : ""}
                      </option>
                    ))}
                  </select>
                  <User className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {formik.touched.classTeacher && formik.errors.classTeacher && (
                  <p className="flex items-center gap-1 text-rose-500 text-[11px] mt-1 font-medium">
                    <AlertCircle className="w-3 h-3" />
                    <span>{formik.errors.classTeacher}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Intake Capacity & Status */}
          <div>
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
              <span className="w-1.5 h-4 bg-slate-900 rounded-full"></span>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Intake Capacity & Status
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Strength */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Intake Strength (Total Seats) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  name="strength"
                  placeholder="e.g. 60"
                  min="1"
                  value={formik.values.strength}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-3 py-2.5 text-xs rounded-xl border bg-slate-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition ${
                    formik.touched.strength && formik.errors.strength
                      ? "border-rose-400 focus:border-rose-500"
                      : "border-slate-200 focus:border-slate-900"
                  }`}
                />
                {formik.touched.strength && formik.errors.strength && (
                  <p className="flex items-center gap-1 text-rose-500 text-[11px] mt-1 font-medium">
                    <AlertCircle className="w-3 h-3" />
                    <span>{formik.errors.strength}</span>
                  </p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Cohort Operational Status <span className="text-rose-500">*</span>
                </label>
                <select
                  name="status"
                  value={formik.values.status}
                  onChange={(e) => formik.setFieldValue("status", e.target.value === "true")}
                  onBlur={formik.handleBlur}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition appearance-none cursor-pointer"
                >
                  <option value="true">Active (Students Can Be Enrolled)</option>
                  <option value="false">Inactive / Archived</option>
                </select>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Inactive cohorts are hidden from student assignment selectors.
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin/batch")}
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
