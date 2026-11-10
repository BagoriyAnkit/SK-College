import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FindOneNotice, UpdateNotice } from "../../../Service/admin/Notice";
import { FaArrowLeft, FaBullhorn, FaFileAlt } from "react-icons/fa";
import Loader from "../../../Components/Loader";

export default function Edit() {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();

    const [noticeData, setNoticeData] = useState(location.state?.notice || {});
    const [loading, setLoading] = useState(!location.state?.notice);

    useEffect(() => {
        const fetchNotice = async () => {
            if (!id) return;
            try {
                const res = await FindOneNotice(id);
                const data = res?.data || res;
                if (data && typeof data === 'object') {
                    setNoticeData(data);
                }
            } catch (error) {
                console.error("Failed to load notice details:", error);
            } finally {
                setLoading(false);
            }
        };

        if (!location.state?.notice) {
            fetchNotice();
        }
    }, [id, location.state]);

    const formik = useFormik({
        enableReinitialize: true,

        initialValues: {
            notice_title: noticeData.notice_title || "",
            description: noticeData.description || "",
            department: noticeData.department || "General",
            issued_by: noticeData.issued_by || "Administration",
            publish_date: noticeData.publish_date
                ? String(noticeData.publish_date).slice(0, 10)
                : new Date().toISOString().slice(0, 10),
            for_whom: noticeData.for_whom || "All",
        },

        validationSchema: Yup.object({
            notice_title: Yup.string().required("Notice Title is required"),
            description: Yup.string().required("Notice content / description is required"),
            department: Yup.string().required("Department is required"),
            issued_by: Yup.string().required("Issued By is required"),
            publish_date: Yup.date().required("Publish Date is required"),
            for_whom: Yup.string().required("Target Audience is required"),
        }),

        onSubmit: async (values, { setSubmitting }) => {
            try {
                const res = await UpdateNotice(id, values);

                if (res) {
                    Swal.fire({
                        title: "Updated!",
                        text: "Notice details updated successfully.",
                        icon: "success",
                        timer: 1500,
                        showConfirmButton: false,
                    });
                    navigate("/admin/notice");
                }
            } catch (error) {
                const message = error?.response?.data?.message || "Failed to update notice.";
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[350px]">
                <Loader />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => navigate("/admin/notice")}
                        className="p-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 transition shadow-2xs"
                        title="Back to Notices"
                    >
                        <FaArrowLeft className="text-sm" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                            Edit Notice
                        </h1>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Modify circular details, broadcast scope, and published instructions.
                        </p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={formik.handleSubmit} className="space-y-6">
                {/* 1. Notice Information & Scope */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                        <FaBullhorn className="text-slate-700 text-sm" />
                        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                            1. Notice Information &amp; Audience Scope
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Notice Title */}
                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Notice Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="notice_title"
                                placeholder="e.g. Schedule for Mid-Term Examination 2026-27"
                                value={formik.values.notice_title}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={`w-full h-10 px-3 text-xs rounded-lg border ${
                                    formik.touched.notice_title && formik.errors.notice_title
                                        ? "border-red-400 bg-red-50/20"
                                        : "border-slate-300"
                                } focus:outline-none focus:border-slate-500`}
                            />
                            {formik.touched.notice_title && formik.errors.notice_title && (
                                <p className="text-red-500 text-[11px] mt-1 font-medium">
                                    {formik.errors.notice_title}
                                </p>
                            )}
                        </div>

                        {/* Target Department */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Department / Category <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="department"
                                value={formik.values.department}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className="w-full h-10 px-3 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-slate-500"
                            >
                                <option value="General">General (All Departments)</option>
                                <option value="Computer Science">Computer Science &amp; IT</option>
                                <option value="Management">Management / Commerce</option>
                                <option value="Engineering">Engineering &amp; Technology</option>
                                <option value="Science">Basic &amp; Applied Sciences</option>
                                <option value="Arts & Humanities">Arts &amp; Humanities</option>
                                <option value="Examination Cell">Examination Cell</option>
                                <option value="Placement Cell">Training &amp; Placements</option>
                            </select>
                        </div>

                        {/* Target Audience / For Whom */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Target Audience <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="for_whom"
                                value={formik.values.for_whom}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className="w-full h-10 px-3 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-slate-500"
                            >
                                <option value="All">All Campus (Everyone)</option>
                                <option value="Students">Students Only</option>
                                <option value="Teachers">Faculty &amp; Teachers Only</option>
                                <option value="Staff">Administrative Staff</option>
                            </select>
                        </div>

                        {/* Issued By */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Issued By Authority <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="issued_by"
                                placeholder="e.g. Office of the Principal"
                                value={formik.values.issued_by}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={`w-full h-10 px-3 text-xs rounded-lg border ${
                                    formik.touched.issued_by && formik.errors.issued_by
                                        ? "border-red-400 bg-red-50/20"
                                        : "border-slate-300"
                                } focus:outline-none focus:border-slate-500`}
                            />
                            {formik.touched.issued_by && formik.errors.issued_by && (
                                <p className="text-red-500 text-[11px] mt-1 font-medium">
                                    {formik.errors.issued_by}
                                </p>
                            )}
                        </div>

                        {/* Publish Date */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Publish Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                name="publish_date"
                                value={formik.values.publish_date}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={`w-full h-10 px-3 text-xs rounded-lg border ${
                                    formik.touched.publish_date && formik.errors.publish_date
                                        ? "border-red-400 bg-red-50/20"
                                        : "border-slate-300"
                                } focus:outline-none focus:border-slate-500`}
                            />
                            {formik.touched.publish_date && formik.errors.publish_date && (
                                <p className="text-red-500 text-[11px] mt-1 font-medium">
                                    {formik.errors.publish_date}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. Notice Content / Circular Body */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                        <FaFileAlt className="text-slate-700 text-sm" />
                        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                            2. Notice Body &amp; Description
                        </h2>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Notice Text / Content <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            rows={6}
                            name="description"
                            placeholder="Enter the full text, instructions, and announcement details for the circular..."
                            value={formik.values.description}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={`w-full p-3 text-xs rounded-lg border ${
                                formik.touched.description && formik.errors.description
                                    ? "border-red-400 bg-red-50/20"
                                    : "border-slate-300"
                            } focus:outline-none focus:border-slate-500 leading-relaxed`}
                        ></textarea>
                        {formik.touched.description && formik.errors.description && (
                            <p className="text-red-500 text-[11px] mt-1 font-medium">
                                {formik.errors.description}
                            </p>
                        )}
                    </div>
                </div>

                {/* Actions Bar */}
                <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={() => navigate("/admin/notice")}
                        className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition shadow-2xs bg-white"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={formik.isSubmitting}
                        className="px-6 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-2xs transition disabled:opacity-50"
                    >
                        {formik.isSubmitting ? "Updating..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
}
