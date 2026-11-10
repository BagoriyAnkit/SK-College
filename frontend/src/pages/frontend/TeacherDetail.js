import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import {
    GraduationCap,
    Briefcase,
    Mail,
    Phone,
    User,
    Building2,
    ArrowLeft,
    Award,
    ShieldCheck,
    Calendar,
    BookOpen
} from "lucide-react";
import { ViewFacultyById } from "../../Service/frontend/Teacher";

export default function FacultyDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [faculty, setFaculty] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getFaculty();
    }, [id]);

    const getFaculty = async () => {
        try {
            const res = await ViewFacultyById(id);
            if (res?.data?.data) {
                setFaculty(res.data.data);
            } else if (res?.data) {
                setFaculty(res.data);
            } else if (res) {
                setFaculty(res);
            }
        } catch (error) {
            console.error("Error fetching faculty details:", error);
            setFaculty(null);
        } finally {
            setLoading(false);
        }
    };

    const deptName = typeof faculty?.Department === "object" && faculty?.Department
        ? faculty.Department.DepartmentName
        : (typeof faculty?.department === "object" && faculty?.department ? faculty.department.DepartmentName : faculty?.Department || faculty?.department);

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
                            <Link to="/faculty" className="hover:text-white transition">Faculty</Link>
                            <span>/</span>
                            <span className="text-slate-200 truncate max-w-xs">{faculty?.TeacherName || "Profile"}</span>
                        </div>

                        {/* Back Link */}
                        <Link
                            to="/faculty"
                            className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white mb-6 font-semibold transition"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Back to Faculty Directory</span>
                        </Link>

                        <div className="flex flex-wrap items-center gap-3 mb-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-amber-400 text-xs font-semibold">
                                Faculty Profile
                            </span>
                            {deptName && (
                                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold">
                                    {deptName}
                                </span>
                            )}
                        </div>

                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
                            {faculty?.TeacherName || (loading ? "Loading Faculty Profile..." : "Faculty Not Found")}
                        </h1>
                    </div>
                </section>

                {/* 3. Main Profile Content */}
                <section className="py-12 sm:py-16">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        {loading ? (
                            <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 p-8 animate-pulse space-y-6">
                                <div className="w-24 h-24 rounded-full bg-slate-200 mx-auto"></div>
                                <div className="h-6 bg-slate-200 rounded w-1/3 mx-auto"></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="h-20 bg-slate-100 rounded-xl"></div>
                                    <div className="h-20 bg-slate-100 rounded-xl"></div>
                                </div>
                            </div>
                        ) : !faculty ? (
                            <div className="max-w-md mx-auto bg-white rounded-2xl border border-slate-200 p-12 text-center">
                                <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                                    <User className="w-7 h-7" />
                                </div>
                                <h2 className="text-lg font-bold text-slate-900 mb-2">
                                    Faculty Profile Not Found
                                </h2>
                                <p className="text-xs text-slate-500 mb-6">
                                    The requested faculty member does not exist or has been removed.
                                </p>
                                <Link
                                    to="/faculty"
                                    className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition inline-flex items-center gap-2"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    <span>Back to Directory</span>
                                </Link>
                            </div>
                        ) : (
                            <div className="max-w-4xl mx-auto">
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                    {/* Profile Header Card */}
                                    <div className="p-8 sm:p-10 border-b border-slate-100 text-center">
                                        <div className="w-24 h-24 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-3xl font-extrabold mx-auto mb-4 shadow-md">
                                            {faculty.TeacherName ? faculty.TeacherName.charAt(0).toUpperCase() : "T"}
                                        </div>

                                        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                            {faculty.TeacherName}
                                        </h2>

                                        {deptName && (
                                            <p className="text-sm font-semibold text-slate-600 mt-1 flex items-center justify-center gap-1.5">
                                                <Building2 className="w-4 h-4 text-slate-400" />
                                                <span>Department of {deptName}</span>
                                            </p>
                                        )}

                                        <div className="inline-flex items-center gap-2 mt-4 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
                                            <Award className="w-3.5 h-3.5 text-amber-500" />
                                            <span>SK College Academic Faculty</span>
                                        </div>
                                    </div>

                                    {/* Profile Specifications Grid */}
                                    <div className="p-8 sm:p-10">
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-6">
                                            Academic &amp; Professional Credentials
                                        </h3>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {/* Qualification */}
                                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3.5">
                                                <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                                                    <GraduationCap className="w-5 h-5 text-slate-800" />
                                                </div>
                                                <div>
                                                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Educational Qualification</span>
                                                    <span className="text-sm font-bold text-slate-900">{faculty.Qualification || "Not specified"}</span>
                                                </div>
                                            </div>

                                            {/* Experience */}
                                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3.5">
                                                <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                                                    <Briefcase className="w-5 h-5 text-slate-800" />
                                                </div>
                                                <div>
                                                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Teaching Experience</span>
                                                    <span className="text-sm font-bold text-slate-900">{faculty.Experience || "Not specified"}</span>
                                                </div>
                                            </div>

                                            {/* Department */}
                                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3.5">
                                                <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                                                    <Building2 className="w-5 h-5 text-slate-800" />
                                                </div>
                                                <div>
                                                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Affiliated Department</span>
                                                    <span className="text-sm font-bold text-slate-900">{deptName || "General Faculty"}</span>
                                                </div>
                                            </div>

                                            {/* Gender */}
                                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3.5">
                                                <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                                                    <User className="w-5 h-5 text-slate-800" />
                                                </div>
                                                <div>
                                                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Gender</span>
                                                    <span className="text-sm font-bold text-slate-900 capitalize">{faculty.gender || "Not specified"}</span>
                                                </div>
                                            </div>

                                            {/* Email */}
                                            {faculty.Email && (
                                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3.5">
                                                    <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                                                        <Mail className="w-5 h-5 text-slate-800" />
                                                    </div>
                                                    <div>
                                                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Official Email</span>
                                                        <a href={`mailto:${faculty.Email}`} className="text-sm font-bold text-slate-900 hover:text-blue-900 transition">
                                                            {faculty.Email}
                                                        </a>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Phone */}
                                            {faculty.PhoneNumber && (
                                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3.5">
                                                    <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                                                        <Phone className="w-5 h-5 text-slate-800" />
                                                    </div>
                                                    <div>
                                                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Office Contact</span>
                                                        <span className="text-sm font-bold text-slate-900">{faculty.PhoneNumber}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Back Button */}
                                        <div className="pt-8 flex justify-center">
                                            <button
                                                onClick={() => navigate("/faculty")}
                                                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition inline-flex items-center gap-2 shadow-xs"
                                            >
                                                <ArrowLeft className="w-4 h-4" />
                                                <span>Return to Faculty Directory</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

            </div>

            {/* 4. Footer */}
            <Footer />
        </div>
    );
}
