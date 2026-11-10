import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ViewAllExam } from "../../Service/frontend/Exam";
import Header from "./Header";
import Footer from "./Footer";
import {
    Calendar,
    FileText,
    Award,
    Search,
    Clock,
    CheckCircle2,
    ArrowRight,
    GraduationCap
} from "lucide-react";
import moment from "moment";

export default function Exam() {
    const [exams, setExams] = useState([]);
    const [loader, setLoader] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const getExams = async () => {
        try {
            const res = await ViewAllExam();
            let list = [];
            if (Array.isArray(res?.data)) {
                list = res.data;
            } else if (Array.isArray(res?.data?.data)) {
                list = res.data.data;
            } else if (Array.isArray(res)) {
                list = res;
            }
            setExams(list);
        } catch (error) {
            console.error("Error fetching exams:", error);
            setExams([]);
        } finally {
            setLoader(false);
        }
    };

    useEffect(() => {
        getExams();
    }, []);

    const filteredExams = useMemo(() => {
        return exams.filter((item) => {
            const name = (item.ExamName || "").toLowerCase();
            const year = (item.AcademicYear || "").toLowerCase();
            const q = searchQuery.toLowerCase().trim();

            return !q || name.includes(q) || year.includes(q);
        });
    }, [exams, searchQuery]);

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
                            <span className="text-slate-200">Examinations</span>
                        </div>

                        {/* Institutional Badge */}
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-semibold mb-4">
                            <FileText className="w-3.5 h-3.5 text-amber-400" />
                            <span>Office of the Controller of Examinations</span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
                            Examination Schedules &amp; Evaluation
                        </h1>

                        <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
                            Official schedules, semester timetable notifications, and evaluation guidelines for undergraduate and postgraduate degree candidates.
                        </p>
                    </div>
                </section>

                {/* 3. Search Bar */}
                <section className="bg-white border-b border-slate-200 py-6 sticky top-20 z-20 shadow-xs">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                            <div className="relative flex-1 max-w-md">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by exam name or academic year..."
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
                                Total Scheduled Exams: <strong className="text-slate-900 font-bold">{exams.length}</strong>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. Exams Grid */}
                <section className="py-12 sm:py-16">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        {loader ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3].map((idx) => (
                                    <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse space-y-4">
                                        <div className="h-6 bg-slate-200 rounded w-2/3"></div>
                                        <div className="h-4 bg-slate-100 rounded w-1/3"></div>
                                        <div className="h-16 bg-slate-100 rounded-xl"></div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredExams.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredExams.map((item) => (
                                    <div
                                        key={item._id}
                                        className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition p-6 flex flex-col justify-between group"
                                    >
                                        <div>
                                            {/* Header */}
                                            <div className="flex items-start justify-between gap-3 mb-4">
                                                <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                                                    <FileText className="w-5 h-5 text-amber-400" />
                                                </div>

                                                {item.AcademicYear && (
                                                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-[11px] font-bold">
                                                        {item.AcademicYear}
                                                    </span>
                                                )}
                                            </div>

                                            <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-snug group-hover:text-blue-900 transition">
                                                {item.ExamName}
                                            </h3>

                                            {/* Dates */}
                                            <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-slate-100 text-xs">
                                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Start Date</span>
                                                    <span className="font-bold text-slate-900 mt-0.5 block">
                                                        {item.StartDate ? moment(item.StartDate).format("DD MMM, YYYY") : "TBA"}
                                                    </span>
                                                </div>

                                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">End Date</span>
                                                    <span className="font-bold text-slate-900 mt-0.5 block">
                                                        {item.EndDate ? moment(item.EndDate).format("DD MMM, YYYY") : "TBA"}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Marks specifications */}
                                            {(item.MaxMarks || item.MinMarks) && (
                                                <div className="flex items-center justify-between text-xs pt-3 text-slate-600">
                                                    <div>
                                                        <span className="text-slate-400">Max Marks:</span>{" "}
                                                        <strong className="text-slate-900">{item.MaxMarks || "-"}</strong>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-400">Min Pass:</span>{" "}
                                                        <strong className="text-emerald-700">{item.MinMarks || "-"}</strong>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="pt-6">
                                            <Link
                                                to="/login"
                                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-800 text-xs font-bold uppercase tracking-wider rounded-xl transition"
                                            >
                                                <span>Check Result in Portal</span>
                                                <ArrowRight className="w-3.5 h-3.5" />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            /* Empty State */
                            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
                                <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                                    <FileText className="w-7 h-7" />
                                </div>
                                <h3 className="text-base font-bold text-slate-900 mb-1">
                                    No Examination Schedules Found
                                </h3>
                                <p className="text-xs text-slate-500 mb-6">
                                    No examinations match your current search query.
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
