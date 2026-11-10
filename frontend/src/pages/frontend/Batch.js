import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ViewAllBatch } from "../../Service/frontend/Batch";
import Header from "./Header";
import Footer from "./Footer";
import {
    GraduationCap,
    Calendar,
    Users,
    UserCheck,
    Search,
    BookOpen,
    Layers,
    Award,
    ArrowRight
} from "lucide-react";

export default function Batch() {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const getBatches = async () => {
        try {
            const res = await ViewAllBatch();
            let list = [];
            if (Array.isArray(res?.data)) {
                list = res.data;
            } else if (Array.isArray(res?.data?.data)) {
                list = res.data.data;
            } else if (Array.isArray(res)) {
                list = res;
            }
            setBatches(list);
        } catch (error) {
            console.error("Error fetching batches:", error);
            setBatches([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getBatches();
    }, []);

    const filteredBatches = useMemo(() => {
        return batches.filter((b) => {
            const name = (b.batchName || "").toLowerCase();
            const session = (b.session || "").toLowerCase();
            const teacher = (b.classTeacher || "").toLowerCase();
            const course = (b.course?.courseName ||
                (typeof b.courseName === "object" && b.courseName ? b.courseName.courseName : b.courseName) || "").toLowerCase();
            const q = searchQuery.toLowerCase().trim();

            return !q || name.includes(q) || session.includes(q) || teacher.includes(q) || course.includes(q);
        });
    }, [batches, searchQuery]);

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
                            <span className="text-slate-200">Academic Batches</span>
                        </div>

                        {/* Institutional Badge */}
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-semibold mb-4">
                            <Layers className="w-3.5 h-3.5 text-amber-400" />
                            <span>Academic Cohorts &bull; Session 2026-27</span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
                            Academic Batches &amp; Cohorts
                        </h1>

                        <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
                            Overview of current student cohorts, active academic sessions, assigned class mentors, and batch capacities.
                        </p>
                    </div>
                </section>

                {/* 3. Search & Metrics Strip */}
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
                                    placeholder="Search by batch name, course, or mentor..."
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

                            <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
                                <div className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200">
                                    Active Batches: <strong className="text-slate-900 font-bold">{batches.length}</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. Batches Grid */}
                <section className="py-12 sm:py-16">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3].map((idx) => (
                                    <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse space-y-4">
                                        <div className="h-6 bg-slate-200 rounded w-1/2"></div>
                                        <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                                        <div className="h-20 bg-slate-100 rounded-xl"></div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredBatches.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredBatches.map((batch) => {
                                    const courseTitle =
                                        batch.course?.courseName ||
                                        (typeof batch.courseName === "object" && batch.courseName ? batch.courseName.courseName : batch.courseName);

                                    return (
                                        <div
                                            key={batch._id}
                                            className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition p-6 flex flex-col justify-between group"
                                        >
                                            <div>
                                                {/* Header */}
                                                <div className="flex items-start justify-between gap-3 mb-4">
                                                    <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                                                        <Layers className="w-5 h-5 text-amber-400" />
                                                    </div>

                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                        Active
                                                    </span>
                                                </div>

                                                <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-snug group-hover:text-blue-900 transition">
                                                    {batch.batchName}
                                                </h3>

                                                {courseTitle && (
                                                    <p className="text-xs text-slate-500 font-medium mt-1">
                                                        {courseTitle}
                                                    </p>
                                                )}

                                                {/* Specifications */}
                                                <div className="mt-5 pt-4 border-t border-slate-100 space-y-2.5 text-xs text-slate-600">
                                                    {batch.session && (
                                                        <div className="flex items-center justify-between">
                                                            <span className="flex items-center gap-1.5 text-slate-500">
                                                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                                <span>Session</span>
                                                            </span>
                                                            <span className="font-semibold text-slate-800">{batch.session}</span>
                                                        </div>
                                                    )}

                                                    {batch.strength && (
                                                        <div className="flex items-center justify-between">
                                                            <span className="flex items-center gap-1.5 text-slate-500">
                                                                <Users className="w-3.5 h-3.5 text-slate-400" />
                                                                <span>Batch Capacity</span>
                                                            </span>
                                                            <span className="font-semibold text-slate-800">{batch.strength} Students</span>
                                                        </div>
                                                    )}

                                                    {batch.classTeacher && (
                                                        <div className="flex items-center justify-between">
                                                            <span className="flex items-center gap-1.5 text-slate-500">
                                                                <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                                                                <span>Class Mentor</span>
                                                            </span>
                                                            <span className="font-semibold text-slate-800">{batch.classTeacher}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="pt-6">
                                                <Link
                                                    to="/program"
                                                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-800 text-xs font-bold uppercase tracking-wider rounded-xl transition"
                                                >
                                                    <BookOpen className="w-3.5 h-3.5" />
                                                    <span>View Curriculum</span>
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            /* Empty State */
                            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
                                <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                                    <Layers className="w-7 h-7" />
                                </div>
                                <h3 className="text-base font-bold text-slate-900 mb-1">
                                    No Batches Found
                                </h3>
                                <p className="text-xs text-slate-500 mb-6">
                                    No active cohorts match your search query.
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

            </div>

            {/* 5. Footer */}
            <Footer />
        </div>
    );
}
