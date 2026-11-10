import React, { useEffect, useState, useMemo } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { Link } from "react-router-dom";
import {
    Briefcase,
    Building2,
    MapPin,
    IndianRupee,
    Search,
    Award,
    CheckCircle2,
    GraduationCap,
    ArrowRight,
    Users
} from "lucide-react";
import { ViewAllPlacement } from "../../Service/frontend/Placement";

export default function Placements() {
    const [placements, setPlacements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        getPlacements();
    }, []);

    const getPlacements = async () => {
        try {
            const res = await ViewAllPlacement();
            let list = [];
            if (Array.isArray(res?.data)) {
                list = res.data;
            } else if (Array.isArray(res?.data?.data)) {
                list = res.data.data;
            } else if (Array.isArray(res)) {
                list = res;
            }
            setPlacements(list);
        } catch (error) {
            console.error("Error fetching placements:", error);
            setPlacements([]);
        } finally {
            setLoading(false);
        }
    };

    // Filter placements
    const filteredPlacements = useMemo(() => {
        return placements.filter((item) => {
            const student = (item.StudentName || "").toLowerCase();
            const company = (item.CompanyName || "").toLowerCase();
            const loc = (item.Location || "").toLowerCase();
            const q = searchQuery.toLowerCase().trim();
            return !q || student.includes(q) || company.includes(q) || loc.includes(q);
        });
    }, [placements, searchQuery]);

    const trainingPillars = [
        {
            title: "Technical Aptitude & Coding",
            desc: "Structured training modules covering computational fundamentals, data structures, and industry coding assessments."
        },
        {
            title: "Soft Skills & Communication",
            desc: "Interactive sessions on corporate etiquette, group discussions, and professional presentation delivery."
        },
        {
            title: "Mock Interview Drills",
            desc: "One-on-one technical and behavioral mock interview sessions conducted by experienced mentors."
        },
        {
            title: "Resume & Portfolio Clinics",
            desc: "Individual guidance to draft clear, ATS-friendly professional resumes and project portfolios."
        }
    ];

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
                            <span className="text-slate-200">Placements</span>
                        </div>

                        {/* Institutional Badge */}
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-semibold mb-4">
                            <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                            <span>Training &amp; Placement Cell &bull; Career Development</span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
                            Training &amp; Corporate Placements
                        </h1>

                        <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
                            Connecting talented students with leading industry recruiters through rigorous pre-placement training, campus recruitment drives, and internship programs.
                        </p>
                    </div>
                </section>

                {/* 3. Search Bar */}
                <section className="bg-white border-b border-slate-200 py-6 sticky top-20 z-20 shadow-xs">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                            {/* Search */}
                            <div className="relative flex-1 max-w-md">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by student name or company..."
                                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery("")}
                                        className="text-xs text-slate-400 hover:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>

                            <div className="text-xs font-semibold text-slate-500">
                                Total Placement Records: <span className="text-slate-900 font-bold">{placements.length}</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. Placement Records Grid */}
                <section className="py-12 sm:py-16">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map((idx) => (
                                    <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse space-y-4">
                                        <div className="w-14 h-14 bg-slate-200 rounded-full mx-auto"></div>
                                        <div className="h-5 bg-slate-200 rounded w-2/3 mx-auto"></div>
                                        <div className="h-4 bg-slate-100 rounded w-1/2 mx-auto"></div>
                                        <div className="h-10 bg-slate-100 rounded-xl"></div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredPlacements.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredPlacements.map((item) => (
                                    <div
                                        key={item._id}
                                        className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition p-6 flex flex-col justify-between group"
                                    >
                                        <div>
                                            {/* Header */}
                                            <div className="flex items-center justify-between gap-3 mb-4">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-lg font-bold">
                                                    {item.StudentName ? item.StudentName.charAt(0).toUpperCase() : "S"}
                                                </div>

                                                {item.CompanyName && (
                                                    <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold">
                                                        {item.CompanyName}
                                                    </span>
                                                )}
                                            </div>

                                            <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-snug group-hover:text-blue-900 transition">
                                                {item.StudentName}
                                            </h3>

                                            {/* Meta details */}
                                            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                                                {item.Package && (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-slate-400">Offered CTC</span>
                                                        <span className="font-bold text-emerald-700 font-mono text-sm">
                                                            ₹ {item.Package}
                                                        </span>
                                                    </div>
                                                )}

                                                {item.JobType && (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-slate-400">Position Type</span>
                                                        <span className="font-medium text-slate-800">{item.JobType}</span>
                                                    </div>
                                                )}

                                                {item.Location && (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-slate-400">Work Location</span>
                                                        <span className="font-medium text-slate-800 flex items-center gap-1">
                                                            <MapPin className="w-3 h-3 text-slate-400" />
                                                            <span>{item.Location}</span>
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            /* Empty State */
                            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
                                <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                                    <Briefcase className="w-7 h-7" />
                                </div>
                                <h3 className="text-base font-bold text-slate-900 mb-1">
                                    No Placement Records Found
                                </h3>
                                <p className="text-xs text-slate-500 mb-6">
                                    No records match your search criteria.
                                </p>
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition"
                                >
                                    Clear Search
                                </button>
                            </div>
                        )}
                    </div>
                </section>

                {/* 5. Placement Preparation Modules */}
                <section className="py-16 bg-white border-t border-slate-200">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-2xl mx-auto mb-12">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                                Employability Readiness
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                Comprehensive Placement Training
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-600 mt-2">
                                Structured training programs integrated with the regular academic schedule to prepare graduating students.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {trainingPillars.map((p) => (
                                <div
                                    key={p.title}
                                    className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center mb-4">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <h3 className="text-sm font-bold text-slate-900 mb-2">
                                        {p.title}
                                    </h3>
                                    <p className="text-xs text-slate-600 leading-relaxed">
                                        {p.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 6. Corporate Partnership Banner */}
                <section className="py-14 bg-slate-900 text-white">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
                            Corporate Recruitment Partnerships
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                            Are you a recruiter seeking talented graduates for software engineering, management, or technical roles? Partner with our Training &amp; Placement Cell.
                        </p>
                        <Link
                            to="/contact"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition"
                        >
                            <span>Contact Placement Cell</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </section>

            </div>

            {/* 7. Footer */}
            <Footer />
        </div>
    );
}
