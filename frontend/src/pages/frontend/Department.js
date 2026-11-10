import React, { useEffect, useState, useMemo } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { Link } from "react-router-dom";
import {
    Building2,
    Award,
    UserCheck,
    Search,
    BookOpen,
    ArrowRight,
    GraduationCap,
    Layers,
    FileText
} from "lucide-react";
import { ViewAllDepartment } from "../../Service/frontend/Department";

export default function Department() {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        getDepartment();
    }, []);

    const getDepartment = async () => {
        try {
            const res = await ViewAllDepartment();
            let dataList = [];
            if (Array.isArray(res?.data)) {
                dataList = res.data;
            } else if (Array.isArray(res?.data?.data)) {
                dataList = res.data.data;
            } else if (Array.isArray(res)) {
                dataList = res;
            }
            setDepartments(dataList);
        } catch (error) {
            console.error("Error fetching departments:", error);
            setDepartments([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredDepartments = useMemo(() => {
        return departments.filter((d) => {
            const name = (d.DepartmentName || "").toLowerCase();
            const code = (d.DepartmentCode || "").toLowerCase();
            const desc = (d.Description || "").toLowerCase();
            const q = searchQuery.toLowerCase().trim();
            return !q || name.includes(q) || code.includes(q) || desc.includes(q);
        });
    }, [departments, searchQuery]);

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
                            <span className="text-slate-200">Departments</span>
                        </div>

                        {/* Institutional Badge */}
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-semibold mb-4">
                            <Award className="w-3.5 h-3.5 text-amber-400" />
                            <span>Academic Faculties &bull; SK College of Technology</span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
                            Academic Departments
                        </h1>

                        <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
                            Our specialized departments provide rigorous technical disciplines, research initiatives, modern laboratory infrastructure, and faculty mentorship.
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
                                    placeholder="Search departments by name or code..."
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

                            {/* Real Data Counter */}
                            <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200">
                                    <Building2 className="w-3.5 h-3.5 text-slate-800" />
                                    <span>
                                        Total Departments: <strong className="text-slate-900 font-bold">{departments.length}</strong>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. Departments Grid */}
                <section className="py-12 sm:py-16">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map((idx) => (
                                    <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse space-y-4">
                                        <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
                                        <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                                        <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                                        <div className="h-16 bg-slate-100 rounded w-full"></div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredDepartments.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredDepartments.map((item) => {
                                    const hodName = item.hod?.TeacherName ||
                                        (typeof item.HOD === "object" && item.HOD ? item.HOD.TeacherName : item.HOD);

                                    return (
                                        <div
                                            key={item._id}
                                            className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden group"
                                        >
                                            <div className="p-6">
                                                {/* Card Header */}
                                                <div className="flex items-start justify-between gap-3 mb-4">
                                                    <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                                                        <Building2 className="w-5 h-5 text-amber-400" />
                                                    </div>

                                                    {item.DepartmentCode && (
                                                        <span className="px-2.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono font-bold">
                                                            {item.DepartmentCode}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Department Name */}
                                                <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-snug group-hover:text-blue-900 transition mb-3">
                                                    {item.DepartmentName}
                                                </h3>

                                                {/* HOD Info */}
                                                {hodName && (
                                                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 mb-4 text-xs">
                                                        <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                                                        <div>
                                                            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Head of Department</span>
                                                            <span className="font-semibold text-slate-800">{hodName}</span>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Description */}
                                                <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
                                                    {item.Description || "Dedicated academic division providing specialized curricula, research focus, and comprehensive laboratory training."}
                                                </p>
                                            </div>

                                            {/* Action Link */}
                                            <div className="px-6 pb-6 pt-2">
                                                <Link
                                                    to="/program"
                                                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-800 text-xs font-bold uppercase tracking-wider rounded-xl transition"
                                                >
                                                    <BookOpen className="w-3.5 h-3.5" />
                                                    <span>View Department Programs</span>
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
                                    <Building2 className="w-7 h-7" />
                                </div>
                                <h3 className="text-base font-bold text-slate-900 mb-1">
                                    No Departments Found
                                </h3>
                                <p className="text-xs text-slate-500 mb-6">
                                    No department matched "{searchQuery}".
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

                {/* 5. Institutional Bottom Banner */}
                <section className="py-14 bg-slate-900 text-white border-t border-slate-800">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-2">
                            Academic Collaborations
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
                            Connect with Our Department Faculties
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                            Have specific academic questions regarding specializations, laboratory infrastructure, or research projects? Contact our faculty desk.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-4">
                            <Link
                                to="/faculty"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition"
                            >
                                <UserCheck className="w-4 h-4" />
                                <span>Browse Faculty Directory</span>
                            </Link>
                            <Link
                                to="/contact"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider transition"
                            >
                                <span>Department Inquiries</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </section>

            </div>

            {/* 6. Footer */}
            <Footer />
        </div>
    );
}
