import React, { useEffect, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { FindOneCourse } from "../../Service/frontend/Course";
import { useParams, Link } from "react-router-dom";
import {
    GraduationCap,
    BookOpen,
    Clock,
    Building2,
    Hash,
    Layers,
    ArrowLeft,
    CheckCircle2,
    Award,
    ShieldCheck,
    Calendar,
    ArrowRight
} from "lucide-react";

export default function ProgramDetails() {
    const { id } = useParams();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getCourse();
    }, [id]);

    const getCourse = async () => {
        try {
            const res = await FindOneCourse(id);
            if (res?.data?.data) {
                setCourse(res.data.data);
            } else if (res?.data) {
                setCourse(res.data);
            } else if (res) {
                setCourse(res);
            }
        } catch (error) {
            console.error("Error fetching course details:", error);
            setCourse(null);
        } finally {
            setLoading(false);
        }
    };

    const deptName = typeof course?.department === "object" && course?.department
        ? course.department.DepartmentName
        : course?.department;

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
                            <Link to="/program" className="hover:text-white transition">Programs</Link>
                            <span>/</span>
                            <span className="text-slate-200 truncate max-w-xs">{course?.courseName || "Program Details"}</span>
                        </div>

                        {/* Back Link */}
                        <Link
                            to="/program"
                            className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white mb-6 font-semibold transition"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Back to All Programs</span>
                        </Link>

                        {/* Program Headline */}
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                            {course?.courseCode && (
                                <span className="px-2.5 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-amber-400 font-mono text-xs font-bold">
                                    {course.courseCode}
                                </span>
                            )}
                            {course?.courseType && (
                                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold uppercase tracking-wider">
                                    {course.courseType}
                                </span>
                            )}
                        </div>

                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-3">
                            {course?.courseName || (loading ? "Loading Program Details..." : "Program Not Found")}
                        </h1>

                        {deptName && (
                            <p className="text-sm sm:text-base text-slate-300 flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-slate-400" />
                                <span>Department of {deptName}</span>
                            </p>
                        )}
                    </div>
                </section>

                {/* Main Content Area */}
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {loading ? (
                        <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
                            <div className="h-28 bg-white rounded-2xl border border-slate-200"></div>
                            <div className="h-64 bg-white rounded-2xl border border-slate-200"></div>
                        </div>
                    ) : !course ? (
                        <div className="max-w-md mx-auto bg-white rounded-2xl border border-slate-200 p-12 text-center">
                            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                                <BookOpen className="w-7 h-7" />
                            </div>
                            <h2 className="text-lg font-bold text-slate-900 mb-2">
                                Program Not Found
                            </h2>
                            <p className="text-xs text-slate-500 mb-6">
                                The requested academic degree program could not be located.
                            </p>
                            <Link
                                to="/program"
                                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition inline-flex items-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span>Back to Programs</span>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Left: Detailed Program Info */}
                            <div className="lg:col-span-8 space-y-8">
                                {/* Specification Grid */}
                                <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
                                    <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider mb-6 flex items-center gap-2">
                                        <BookOpen className="w-4 h-4 text-slate-700" />
                                        <span>Program Specifications</span>
                                    </h2>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span>Duration</span>
                                            </div>
                                            <p className="text-base font-bold text-slate-900">
                                                {course.duration || "Standard Track"}
                                            </p>
                                        </div>

                                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                                                <Layers className="w-3.5 h-3.5" />
                                                <span>Total Semesters</span>
                                            </div>
                                            <p className="text-base font-bold text-slate-900">
                                                {course.totalSemester ? `${course.totalSemester} Semesters` : "Modular"}
                                            </p>
                                        </div>

                                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                                                <GraduationCap className="w-3.5 h-3.5" />
                                                <span>Program Type</span>
                                            </div>
                                            <p className="text-base font-bold text-slate-900">
                                                {course.courseType || "Regular"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Overview & Description */}
                                <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
                                    <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider mb-4">
                                        Curriculum &amp; Program Overview
                                    </h2>
                                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed whitespace-pre-line">
                                        {course.description ||
                                            "This comprehensive degree program combines foundational theoretical instruction with practical laboratory coursework, project-oriented assignments, and professional training. Students gain in-depth domain competency and prepare for career opportunities across competitive industries."}
                                    </p>
                                </div>

                                {/* Key Highlights */}
                                <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
                                    <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider mb-6">
                                        Program Learning Outcomes
                                    </h2>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="flex items-start gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                                            <div>
                                                <h3 className="text-xs sm:text-sm font-bold text-slate-900">Comprehensive Core Foundations</h3>
                                                <p className="text-xs text-slate-500 mt-0.5">Deep understanding of underlying engineering and technical concepts.</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                                            <div>
                                                <h3 className="text-xs sm:text-sm font-bold text-slate-900">Laboratory &amp; Hands-on Skills</h3>
                                                <p className="text-xs text-slate-500 mt-0.5">Practical experiments using modern lab equipment and software toolchains.</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                                            <div>
                                                <h3 className="text-xs sm:text-sm font-bold text-slate-900">Project-Based Learning</h3>
                                                <p className="text-xs text-slate-500 mt-0.5">Semester capstone projects addressing practical industry problems.</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                                            <div>
                                                <h3 className="text-xs sm:text-sm font-bold text-slate-900">Career &amp; Higher Study Preparation</h3>
                                                <p className="text-xs text-slate-500 mt-0.5">Curriculum aligned with national entrance benchmarks and employment profiles.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Admission Card & Assistance */}
                            <div className="lg:col-span-4 space-y-6">
                                {/* Admission Application Card */}
                                <div className="bg-slate-950 text-white rounded-2xl border border-slate-800 p-6 sm:p-7 shadow-md">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-2">
                                        Admissions Open 2026-27
                                    </span>
                                    <h3 className="text-xl font-extrabold tracking-tight mb-2">
                                        Enroll in {course.courseName}
                                    </h3>
                                    <p className="text-xs text-slate-300 leading-relaxed mb-6">
                                        Submit your application online. Our admissions desk will verify your prerequisites and assist with documentation.
                                    </p>

                                    <Link
                                        to="/applyNow"
                                        className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition"
                                    >
                                        <span>Apply for This Program</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>

                                {/* Academic Inquiries */}
                                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                                        Admission Guidance
                                    </h3>
                                    <p className="text-xs text-slate-600 leading-relaxed">
                                        Need clarification regarding prerequisites, fee structures, or batch timings?
                                    </p>
                                    <div className="text-xs text-slate-700 space-y-2 pt-2 border-t border-slate-100">
                                        <div>
                                            <span className="text-slate-400 block text-[11px]">Admissions Desk</span>
                                            <span className="font-semibold">+91 98765 43210</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 block text-[11px]">Academic Email</span>
                                            <span className="font-semibold">admissions@skcollege.edu</span>
                                        </div>
                                    </div>
                                    <Link
                                        to="/contact"
                                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold uppercase tracking-wider transition"
                                    >
                                        <span>Contact Admissions Desk</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

            </div>

            {/* 3. Footer */}
            <Footer />
        </div>
    );
}
