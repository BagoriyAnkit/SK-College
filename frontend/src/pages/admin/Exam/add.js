import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { AddExam } from "../../../Service/admin/Exam";
import { ViewAllCourse } from "../../../Service/admin/Course";
import { ViewAllBatch } from "../../../Service/admin/Batch";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FaArrowLeft, FaCalendarAlt, FaClipboardCheck, FaLayerGroup } from "react-icons/fa";

export default function Add() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [batches, setBatches] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [courseRes, batchRes] = await Promise.all([
                    ViewAllCourse(),
                    ViewAllBatch()
                ]);
                if (courseRes?.data) setCourses(courseRes.data);
                if (batchRes?.data) setBatches(batchRes.data);
            } catch (err) {
                console.error("Error loading courses/batches:", err);
            } finally {
                setLoadingData(false);
            }
        };
        fetchInitialData();
    }, []);

    const formik = useFormik({
        initialValues: {
            ExamName: "",
            examType: "Semester",
            course: "",
            batch: "",
            subject: "",
            AcademicYear: "2026-27",
            StartDate: "",
            EndDate: "",
            MaxMarks: 100,
            MinMarks: 33,
        },

        validationSchema: Yup.object({
            ExamName: Yup.string().required("Exam Name is required"),
            subject: Yup.string().required("Subject is required"),
            course: Yup.string().optional(),
            batch: Yup.string().optional(),
            AcademicYear: Yup.string().required("Academic Year is required"),
            StartDate: Yup.date().required("Exam Date is required"),
            EndDate: Yup.date().optional(),
            MaxMarks: Yup.number()
                .min(1, "Max marks must be greater than 0")
                .required("Max Marks is required"),
            MinMarks: Yup.number()
                .min(0, "Passing marks cannot be negative")
                .test("lessThanMax", "Passing marks cannot exceed maximum marks", function (value) {
                    const { MaxMarks } = this.parent;
                    return value <= MaxMarks;
                })
                .required("Passing Marks is required"),
        }),

        onSubmit: async (values, { setSubmitting }) => {
            try {
                const selectedCourse = courses.find((c) => c._id === values.course);
                const selectedBatch = batches.find((b) => b._id === values.batch);

                const payload = {
                    examName: values.ExamName.trim(),
                    ExamName: values.ExamName.trim(),
                    examType: values.examType,
                    course: values.course || null,
                    courseName: selectedCourse?.courseName || "",
                    batch: values.batch || null,
                    batchName: selectedBatch?.batchName || "",
                    ClassId: selectedBatch?.batchName || "General",
                    subject: values.subject.trim(),
                    examDate: values.StartDate,
                    StartDate: values.StartDate,
                    EndDate: values.EndDate || values.StartDate,
                    maxMarks: Number(values.MaxMarks),
                    MaxMarks: Number(values.MaxMarks),
                    minMarks: Number(values.MinMarks),
                    MinMarks: Number(values.MinMarks),
                    academicYear: values.AcademicYear,
                    AcademicYear: values.AcademicYear,
                    status: "Scheduled"
                };

                const res = await AddExam(payload);

                if (res && res.status !== false) {
                    Swal.fire({
                        title: "Exam Scheduled!",
                        text: "New examination successfully added to schedule.",
                        icon: "success",
                        timer: 1500,
                        showConfirmButton: false,
                    });
                    navigate("/admin/exam");
                } else {
                    Swal.fire({
                        title: "Scheduling Failed",
                        text: res?.message || "Unable to save exam details.",
                        icon: "error",
                    });
                }
            } catch (error) {
                const message =
                    error?.response?.data?.message || error.message || "Failed to schedule exam.";
                Swal.fire({
                    title: "Error!",
                    text: message,
                    icon: "error",
                });
            } finally {
                setSubmitting(false);
            }
        },
    });

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => navigate("/admin/exam")}
                        className="p-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 transition shadow-sm"
                        title="Back to Exams"
                    >
                        <FaArrowLeft className="text-sm" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                            Add New Exam
                        </h1>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Configure assessment schedule, assign subject &amp; batch, and allocate marks.
                        </p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={formik.handleSubmit} className="space-y-6">
                {/* 1. Exam Identity & Classification */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                        <FaClipboardCheck className="text-slate-700 text-sm" />
                        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                            1. Exam Identity &amp; Classification
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Exam Name */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Exam Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="ExamName"
                                placeholder="e.g. Mid Semester Assessment"
                                value={formik.values.ExamName}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={`w-full h-10 px-3 text-xs rounded-lg border ${
                                    formik.touched.ExamName && formik.errors.ExamName
                                        ? "border-red-400 bg-red-50/20"
                                        : "border-slate-300"
                                } focus:outline-none focus:border-slate-500`}
                            />
                            {formik.touched.ExamName && formik.errors.ExamName && (
                                <p className="text-red-500 text-[11px] mt-1 font-medium">
                                    {formik.errors.ExamName}
                                </p>
                            )}
                        </div>

                        {/* Exam Type */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Exam Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="examType"
                                value={formik.values.examType}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className="w-full h-10 px-3 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-slate-500"
                            >
                                <option value="Semester">Semester Exam</option>
                                <option value="Mid Term">Mid Term</option>
                                <option value="Final">Final</option>
                                <option value="Unit Test">Unit Test</option>
                                <option value="Practical">Practical</option>
                                <option value="Internal">Internal</option>
                                <option value="Assignment">Assignment</option>
                            </select>
                        </div>

                        {/* Subject */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Subject <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="subject"
                                placeholder="e.g. Database Management Systems"
                                value={formik.values.subject}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={`w-full h-10 px-3 text-xs rounded-lg border ${
                                    formik.touched.subject && formik.errors.subject
                                        ? "border-red-400 bg-red-50/20"
                                        : "border-slate-300"
                                } focus:outline-none focus:border-slate-500`}
                            />
                            {formik.touched.subject && formik.errors.subject && (
                                <p className="text-red-500 text-[11px] mt-1 font-medium">
                                    {formik.errors.subject}
                                </p>
                            )}
                        </div>

                        {/* Academic Year */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Academic Year <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="AcademicYear"
                                placeholder="e.g. 2026-27"
                                value={formik.values.AcademicYear}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={`w-full h-10 px-3 text-xs rounded-lg border ${
                                    formik.touched.AcademicYear && formik.errors.AcademicYear
                                        ? "border-red-400 bg-red-50/20"
                                        : "border-slate-300"
                                } focus:outline-none focus:border-slate-500`}
                            />
                            {formik.touched.AcademicYear && formik.errors.AcademicYear && (
                                <p className="text-red-500 text-[11px] mt-1 font-medium">
                                    {formik.errors.AcademicYear}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. Course & Batch Assignment */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                        <FaLayerGroup className="text-slate-700 text-sm" />
                        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                            2. Course &amp; Batch Assignment
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Course */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Target Course
                            </label>
                            <select
                                name="course"
                                value={formik.values.course}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className="w-full h-10 px-3 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-slate-500"
                            >
                                <option value="">-- Select Course (Optional) --</option>
                                {courses.map((c) => (
                                    <option key={c._id} value={c._id}>
                                        {c.courseName} {c.courseCode ? `(${c.courseCode})` : ""}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Batch */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Target Batch
                            </label>
                            <select
                                name="batch"
                                value={formik.values.batch}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className="w-full h-10 px-3 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-slate-500"
                            >
                                <option value="">-- Select Batch (Optional) --</option>
                                {batches.map((b) => (
                                    <option key={b._id} value={b._id}>
                                        {b.batchName} {b.session ? `(${b.session})` : ""}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* 3. Schedule & Marks Allocation */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                        <FaCalendarAlt className="text-slate-700 text-sm" />
                        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                            3. Schedule &amp; Marks Allocation
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Start Date */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Exam Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                name="StartDate"
                                value={formik.values.StartDate}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={`w-full h-10 px-3 text-xs rounded-lg border ${
                                    formik.touched.StartDate && formik.errors.StartDate
                                        ? "border-red-400 bg-red-50/20"
                                        : "border-slate-300"
                                } focus:outline-none focus:border-slate-500`}
                            />
                            {formik.touched.StartDate && formik.errors.StartDate && (
                                <p className="text-red-500 text-[11px] mt-1 font-medium">
                                    {formik.errors.StartDate}
                                </p>
                            )}
                        </div>

                        {/* End Date (Optional) */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                End Date (Optional)
                            </label>
                            <input
                                type="date"
                                name="EndDate"
                                value={formik.values.EndDate}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className="w-full h-10 px-3 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-slate-500"
                            />
                        </div>

                        {/* Max Marks */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Maximum Marks <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="MaxMarks"
                                placeholder="100"
                                min="1"
                                value={formik.values.MaxMarks}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={`w-full h-10 px-3 text-xs rounded-lg border ${
                                    formik.touched.MaxMarks && formik.errors.MaxMarks
                                        ? "border-red-400 bg-red-50/20"
                                        : "border-slate-300"
                                } focus:outline-none focus:border-slate-500`}
                            />
                            {formik.touched.MaxMarks && formik.errors.MaxMarks && (
                                <p className="text-red-500 text-[11px] mt-1 font-medium">
                                    {formik.errors.MaxMarks}
                                </p>
                            )}
                        </div>

                        {/* Min / Passing Marks */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Passing Marks <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="MinMarks"
                                placeholder="33"
                                min="0"
                                value={formik.values.MinMarks}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={`w-full h-10 px-3 text-xs rounded-lg border ${
                                    formik.touched.MinMarks && formik.errors.MinMarks
                                        ? "border-red-400 bg-red-50/20"
                                        : "border-slate-300"
                                } focus:outline-none focus:border-slate-500`}
                            />
                            {formik.touched.MinMarks && formik.errors.MinMarks && (
                                <p className="text-red-500 text-[11px] mt-1 font-medium">
                                    {formik.errors.MinMarks}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions Bar */}
                <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={() => navigate("/admin/exam")}
                        className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition shadow-sm bg-white"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={formik.isSubmitting}
                        className="px-6 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition disabled:opacity-50"
                    >
                        {formik.isSubmitting ? "Saving..." : "Schedule Exam"}
                    </button>
                </div>
            </form>
        </div>
    );
}
