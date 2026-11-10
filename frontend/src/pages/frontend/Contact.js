import React, { useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { AddContact } from "../../Service/frontend/Contact";
import {
    Mail,
    Phone,
    MapPin,
    Send,
    User,
    BookOpen,
    Clock,
    Building2,
    Award,
    ShieldCheck,
    MessageSquare,
    ArrowRight
} from "lucide-react";
import Header from "./Header";
import Footer from "./Footer";

export default function Contact() {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        subject: "",
        message: "",
    });
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.fullName || !formData.email || !formData.subject || !formData.message) {
            Swal.fire({
                icon: "warning",
                title: "Incomplete Form",
                text: "Please fill in all inquiry fields before submitting.",
                confirmButtonColor: "#0f172a",
            });
            return;
        }

        try {
            setSubmitting(true);
            const res = await AddContact(formData);

            if (res.data?.status !== false) {
                Swal.fire({
                    icon: "success",
                    title: "Message Sent Successfully!",
                    text: res.data?.message || "Thank you for contacting SK College. Our office will review your inquiry and respond shortly.",
                    confirmButtonColor: "#0f172a",
                });

                setFormData({
                    fullName: "",
                    email: "",
                    subject: "",
                    message: "",
                });
            } else {
                Swal.fire({
                    icon: "warning",
                    title: "Submission Failed",
                    text: res.data?.message || "Unable to send your inquiry.",
                    confirmButtonColor: "#0f172a",
                });
            }
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error.response?.data?.message || "Something went wrong. Please try again later.",
                confirmButtonColor: "#0f172a",
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-slate-900 selection:text-white flex flex-col justify-between">
            {/* 1. Header */}
            <Header />

            {/* Spacer for Fixed Header */}
            <div className="pt-20 md:pt-28 flex-1">

                {/* 2. Institutional Banner */}
                <section className="relative bg-slate-950 text-white overflow-hidden py-14 sm:py-20 border-b border-slate-800">
                    <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25"></div>
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        {/* Breadcrumbs */}
                        <div className="flex items-center gap-2 text-xs text-slate-400 mb-4 font-medium">
                            <Link to="/" className="hover:text-white transition">Home</Link>
                            <span>/</span>
                            <span className="text-slate-200">Contact Us</span>
                        </div>

                        {/* Institutional Badge */}
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-semibold mb-4">
                            <MapPin className="w-3.5 h-3.5 text-amber-400" />
                            <span>Campus Admissions &bull; Administrative Desk</span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
                            Contact Us &amp; Campus Inquiries
                        </h1>

                        <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
                            Have questions regarding academic degree programs, admissions, or campus visits? Reach out to our administrative cell or submit an online inquiry.
                        </p>
                    </div>
                </section>

                {/* 3. Main Contact Section */}
                <section className="py-12 sm:py-16">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                            {/* Left Column: Campus Information */}
                            <div className="lg:col-span-5 space-y-6">
                                {/* Institutional Contact Cards */}
                                <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-6">
                                    <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                                        <Building2 className="w-4 h-4 text-slate-700" />
                                        <span>Campus Headquarters</span>
                                    </div>

                                    {/* Address */}
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5">
                                            <MapPin className="w-5 h-5 text-amber-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                                                Campus Location
                                            </h3>
                                            <p className="text-sm font-semibold text-slate-900">
                                                SK College of Technology
                                            </p>
                                            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                                                Knowledge Park, Main Institutional Area,<br />
                                                Jaipur, Rajasthan 302001
                                            </p>
                                        </div>
                                    </div>

                                    {/* Phone Numbers */}
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5">
                                            <Phone className="w-5 h-5 text-emerald-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                                                Telephone Helplines
                                            </h3>
                                            <p className="text-sm font-bold text-slate-900">
                                                +91 98765 43210
                                            </p>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                Office Desk: +91 141 234 5678
                                            </p>
                                        </div>
                                    </div>

                                    {/* Emails */}
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5">
                                            <Mail className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                                                Official Correspondence
                                            </h3>
                                            <p className="text-sm font-semibold text-slate-900">
                                                info@skcollege.edu
                                            </p>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                Admissions: admissions@skcollege.edu
                                            </p>
                                        </div>
                                    </div>

                                    {/* Office Timings */}
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5">
                                            <Clock className="w-5 h-5 text-purple-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                                                Office Working Hours
                                            </h3>
                                            <p className="text-xs font-semibold text-slate-800">
                                                Monday &ndash; Saturday: 9:00 AM &ndash; 5:00 PM
                                            </p>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                Closed on Sundays &amp; Gazetted Holidays
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Program Inquiry Box */}
                                <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-6 shadow-sm">
                                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
                                        <BookOpen className="w-4 h-4" />
                                        <span>Admissions 2026-27</span>
                                    </div>
                                    <h3 className="text-base font-bold mb-2">
                                        Seeking Program Enrollment?
                                    </h3>
                                    <p className="text-xs text-slate-300 leading-relaxed mb-4">
                                        You can also submit an official preliminary admission application directly online.
                                    </p>
                                    <Link
                                        to="/applyNow"
                                        className="inline-flex items-center gap-2 text-xs font-bold text-white hover:text-amber-300 transition"
                                    >
                                        <span>Go to Online Admission Form</span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                            </div>

                            {/* Right Column: Inquiry Form */}
                            <div className="lg:col-span-7">
                                <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 shadow-sm">
                                    <div className="border-b border-slate-100 pb-5 mb-6">
                                        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                                            Send an Official Message
                                        </h2>
                                        <p className="text-xs sm:text-sm text-slate-500 mt-1">
                                            Submit your inquiry and our desk coordinator will respond via email.
                                        </p>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        {/* Full Name */}
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                                Full Name <span className="text-rose-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                                <input
                                                    type="text"
                                                    name="fullName"
                                                    value={formData.fullName}
                                                    onChange={handleChange}
                                                    placeholder="Enter your full name"
                                                    required
                                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition"
                                                />
                                            </div>
                                        </div>

                                        {/* Email */}
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                                Email Address <span className="text-rose-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    placeholder="e.g. name@example.com"
                                                    required
                                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition"
                                                />
                                            </div>
                                        </div>

                                        {/* Subject */}
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                                Subject / Purpose <span className="text-rose-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <MessageSquare className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                                <input
                                                    type="text"
                                                    name="subject"
                                                    value={formData.subject}
                                                    onChange={handleChange}
                                                    placeholder="e.g. Admission Inquiry for BCA / Campus Visit"
                                                    required
                                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition"
                                                />
                                            </div>
                                        </div>

                                        {/* Message */}
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                                Message Details <span className="text-rose-500">*</span>
                                            </label>
                                            <textarea
                                                name="message"
                                                rows={5}
                                                value={formData.message}
                                                onChange={handleChange}
                                                placeholder="Write your questions or message here..."
                                                required
                                                className="w-full p-4 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition resize-none"
                                            ></textarea>
                                        </div>

                                        {/* Submit Button */}
                                        <div className="pt-2">
                                            <button
                                                type="submit"
                                                disabled={submitting}
                                                className="w-full py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition disabled:opacity-50 inline-flex items-center justify-center gap-2 cursor-pointer"
                                            >
                                                {submitting ? (
                                                    <>
                                                        <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                                                        <span>Submitting Inquiry...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Send className="w-4 h-4" />
                                                        <span>Send Message</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

            </div>

            {/* 4. Footer */}
            <Footer />
        </div>
    );
}
