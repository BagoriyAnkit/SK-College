import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { UpdateEvent, ViewEvent } from '../../../Service/admin/Event';
import { FaArrowLeft, FaCalendarAlt, FaClock, FaFileAlt } from "react-icons/fa";
import Loader from '../../../Components/Loader';

export default function Edit() {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();

    const [eventData, setEventData] = useState(location.state?.event || {});
    const [loading, setLoading] = useState(!location.state?.event);

    useEffect(() => {
        const fetchEvent = async () => {
            if (!id) return;
            try {
                const res = await ViewEvent(id);
                const data = res?.data || res;
                if (data && typeof data === 'object') {
                    setEventData(data);
                }
            } catch (error) {
                console.error("Failed to load event details:", error);
            } finally {
                setLoading(false);
            }
        };

        if (!location.state?.event) {
            fetchEvent();
        }
    }, [id, location.state]);

    const formik = useFormik({
        enableReinitialize: true,

        initialValues: {
            event_title: eventData?.event_title || "",
            event_date: eventData?.event_date
                ? String(eventData.event_date).slice(0, 10)
                : "",
            start_time: eventData?.start_time || "10:00 AM",
            end_time: eventData?.end_time || "01:00 PM",
            location: eventData?.location || "College Main Auditorium",
            description: eventData?.description || "",
        },

        validationSchema: Yup.object({
            event_title: Yup.string().required("Event Title is required"),
            event_date: Yup.string().required("Event Date is required"),
            start_time: Yup.string().required("Start Time is required"),
            end_time: Yup.string().required("End Time is required"),
            location: Yup.string().required("Location / Venue is required"),
            description: Yup.string().optional(),
        }),

        onSubmit: async (values, { setSubmitting }) => {
            try {
                const res = await UpdateEvent(id, values);

                if (res) {
                    Swal.fire({
                        title: "Updated!",
                        text: "Event details updated successfully.",
                        icon: "success",
                        timer: 1500,
                        showConfirmButton: false,
                    });
                    navigate("/admin/event");
                }
            } catch (error) {
                const message = error?.response?.data?.message || "Failed to update event.";
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
                        onClick={() => navigate("/admin/event")}
                        className="p-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 transition shadow-2xs"
                        title="Back to Events"
                    >
                        <FaArrowLeft className="text-sm" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                            Edit Event
                        </h1>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Modify campus schedule, timing, venue, and attendee information.
                        </p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={formik.handleSubmit} className="space-y-6">
                {/* 1. Event Overview & Location */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                        <FaCalendarAlt className="text-slate-700 text-sm" />
                        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                            1. Event Overview &amp; Location
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Event Title */}
                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Event Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="event_title"
                                placeholder="e.g. Annual Tech Symposium &amp; Hackathon 2026"
                                value={formik.values.event_title}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={`w-full h-10 px-3 text-xs rounded-lg border ${
                                    formik.touched.event_title && formik.errors.event_title
                                        ? "border-red-400 bg-red-50/20"
                                        : "border-slate-300"
                                } focus:outline-none focus:border-slate-500`}
                            />
                            {formik.touched.event_title && formik.errors.event_title && (
                                <p className="text-red-500 text-[11px] mt-1 font-medium">
                                    {formik.errors.event_title}
                                </p>
                            )}
                        </div>

                        {/* Venue / Location */}
                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Venue / Campus Location <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="location"
                                placeholder="e.g. Main Seminar Hall, Block C"
                                value={formik.values.location}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={`w-full h-10 px-3 text-xs rounded-lg border ${
                                    formik.touched.location && formik.errors.location
                                        ? "border-red-400 bg-red-50/20"
                                        : "border-slate-300"
                                } focus:outline-none focus:border-slate-500`}
                            />
                            {formik.touched.location && formik.errors.location && (
                                <p className="text-red-500 text-[11px] mt-1 font-medium">
                                    {formik.errors.location}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. Schedule & Timing */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                        <FaClock className="text-slate-700 text-sm" />
                        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                            2. Date &amp; Timing Schedule
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Event Date */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Event Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                name="event_date"
                                value={formik.values.event_date}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={`w-full h-10 px-3 text-xs rounded-lg border ${
                                    formik.touched.event_date && formik.errors.event_date
                                        ? "border-red-400 bg-red-50/20"
                                        : "border-slate-300"
                                } focus:outline-none focus:border-slate-500`}
                            />
                            {formik.touched.event_date && formik.errors.event_date && (
                                <p className="text-red-500 text-[11px] mt-1 font-medium">
                                    {formik.errors.event_date}
                                </p>
                            )}
                        </div>

                        {/* Start Time */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Start Time <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="start_time"
                                placeholder="e.g. 10:00 AM"
                                value={formik.values.start_time}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={`w-full h-10 px-3 text-xs rounded-lg border ${
                                    formik.touched.start_time && formik.errors.start_time
                                        ? "border-red-400 bg-red-50/20"
                                        : "border-slate-300"
                                } focus:outline-none focus:border-slate-500`}
                            />
                            {formik.touched.start_time && formik.errors.start_time && (
                                <p className="text-red-500 text-[11px] mt-1 font-medium">
                                    {formik.errors.start_time}
                                </p>
                            )}
                        </div>

                        {/* End Time */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                End Time <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="end_time"
                                placeholder="e.g. 01:00 PM"
                                value={formik.values.end_time}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={`w-full h-10 px-3 text-xs rounded-lg border ${
                                    formik.touched.end_time && formik.errors.end_time
                                        ? "border-red-400 bg-red-50/20"
                                        : "border-slate-300"
                                } focus:outline-none focus:border-slate-500`}
                            />
                            {formik.touched.end_time && formik.errors.end_time && (
                                <p className="text-red-500 text-[11px] mt-1 font-medium">
                                    {formik.errors.end_time}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* 3. Description & Agenda */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                        <FaFileAlt className="text-slate-700 text-sm" />
                        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                            3. Event Agenda &amp; Description (Optional)
                        </h2>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Description / Overview
                        </label>
                        <textarea
                            rows={4}
                            name="description"
                            placeholder="Provide details about the keynote speakers, schedule, or attendee instructions..."
                            value={formik.values.description}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className="w-full p-3 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-slate-500 leading-relaxed"
                        ></textarea>
                    </div>
                </div>

                {/* Actions Bar */}
                <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={() => navigate("/admin/event")}
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
