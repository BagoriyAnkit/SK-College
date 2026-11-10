import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import {
    GraduationCap,
    BookOpen,
    Clock,
    ArrowRight,
    Search,
    Layers,
    Building2,
    Award,
    Filter,
    CheckCircle2
} from "lucide-react";
import { ViewAllCourse } from "../../Service/frontend/Course";

export default function Programs() {
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedType, setSelectedType] = useState("ALL");
    const [selectedDept, setSelectedDept] = useState("ALL");

    useEffect(() => {
        getCourses();
    }, []);

    const getCourses = async () => {
        try {
            const res = await ViewAllCourse();
            let dataList = [];
            if (Array.isArray(res?.data)) {
                dataList = res.data;
            } else if (Array.isArray(res?.data?.data)) {
                dataList = res.data.data;
            } else if (Array.isArray(res)) {
                dataList = res;
            }
            setPrograms(dataList);
        } catch (error) {
            console.error("Error fetching courses:", error);
            setPrograms([]);
        } finally {
            setLoading(false);
        }
    };

    // Extract unique course types for filter
    const courseTypes = useMemo(() => {
        const types = new Set();
        programs.forEach((p) => {
            if (p.courseType) types.add(p.courseType.trim());
        });
        return Array.from(types);
    }, [programs]);

    // Extract unique departments for filter
    const departments = useMemo(() => {
        const depts = new Set();
        programs.forEach((p) => {
            const deptName = typeof p.department === "object" && p.department
                ? p.department.DepartmentName
                : p.department;
            if (deptName) depts.add(deptName.trim());
        });
        return Array.from(depts);
    }, [programs]);

    // Filter courses based on search, type, and department
    const filteredPrograms = useMemo(() => {
        return programs.filter((p) => {
            const name = (p.courseName || "").toLowerCase();
            const code = (p.courseCode || "").toLowerCase();
            const dept = (typeof p.department === "object" && p.department
                ? p.department.DepartmentName
                : (p.department || "")).toLowerCase();
            const type = (p.courseType || "").toLowerCase();
            const q = searchQuery.toLowerCase().trim();

            const matchesSearch = !q || name.includes(q) || code.includes(q) || dept.includes(q);
            const matchesType = selectedType === "ALL" || (p.courseType && p.courseType.trim().toLowerCase() === selectedType.toLowerCase());
            const matchesDept = selectedDept === "ALL" || dept === selectedDept.toLowerCase();

            return matchesSearch && matchesType && matchesDept;
        });
    }, [programs, searchQuery, selectedType, selectedDept]);

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
                            <span className="text-slate-200">Academic Programs</span>
                        </div>

                        {/* Institutional Badge */}
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-semibold mb-4">
                            <Award className="w-3.5 h-3.5 text-amber-400" />
                            <span>Degree &amp; Diploma Programs &bull; Session 2026-27</span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
                            Academic Degree Programs
                        </h1>

                        <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
                            Discover career-oriented undergraduate and postgraduate programs structured with industry-relevant syllabi, modern laboratory training, and academic rigor.
                        </p>
                    </div>
                </section>

                {/* 3. Search & Filter Bar */}
                <section className="bg-white border-b border-slate-200 py-6 sticky top-20 z-20 shadow-xs">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                            {/* Search Input */}
                            <div className="relative flex-1 max-w-md">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by program name or code..."
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

                            {/* Dropdown Filters */}
                            <div className="flex flex-wrap items-center gap-3">
                                {/* Type Filter */}
                                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs">
                                    <Filter className="w-3.5 h-3.5 text-slate-500" />
                                    <span className="text-slate-500 font-medium">Type:</span>
                                    <select
                                        value={selectedType}
                                        onChange={(e) => setSelectedType(e.target.value)}
                                        className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer"
                                    >
                                        <option value="ALL">All Types</option>
                                        {courseTypes.map((type) => (
                                            <option key={type} value={type}>
                                                {type}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Department Filter */}
                                {departments.length > 0 && (
                                    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs">
                                        <Building2 className="w-3.5 h-3.5 text-slate-500" />
                                        <span className="text-slate-500 font-medium">Department:</span>
                                        <select
                                            value={selectedDept}
                                            onChange={(e) => setSelectedDept(e.target.value)}
                                            className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer max-w-[140px] truncate"
                                        >
                                            <option value="ALL">All Departments</option>
                                            {departments.map((d) => (
                                                <option key={d} value={d}>
                                                    {d}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="text-xs font-semibold text-slate-500 pl-2">
                                    Showing <span className="text-slate-900 font-bold">{filteredPrograms.length}</span> program{filteredPrograms.length === 1 ? "" : "s"}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. Programs Grid */}
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
                                        <div className="h-10 bg-slate-200 rounded-xl w-full"></div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredPrograms.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredPrograms.map((item) => {
                                    const deptName = typeof item.department === "object" && item.department
                                        ? item.department.DepartmentName
                                        : item.department;

                                    return (
                                        <div
                                            key={item._id}
                                            className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden group"
                                        >
                                            <div className="p-6">
                                                {/* Header row: Icon & Type Badge */}
                                                <div className="flex items-start justify-between gap-3 mb-4">
                                                    <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                                                        <GraduationCap className="w-5 h-5 text-amber-400" />
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-1.5 justify-end">
                                                        {item.courseCode && (
                                                            <span className="px-2.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-mono font-bold">
                                                                {item.courseCode}
                                                            </span>
                                                        )}
                                                        {item.courseType && (
                                                            <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider">
                                                                {item.courseType}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Course Title */}
                                                <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-snug group-hover:text-blue-900 transition mb-2">
                                                    {item.courseName}
                                                </h3>

                                                {/* Department */}
                                                {deptName && (
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-4">
                                                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                        <span className="truncate">{deptName}</span>
                                                    </div>
                                                )}

                                                {/* Description snippet */}
                                                <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed mb-6">
                                                    {item.description || "Comprehensive degree program designed to provide rigorous foundational theory and applied laboratory practice."}
                                                </p>

                                                {/* Metadata pills */}
                                                <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-100 text-xs">
                                                    <div className="flex items-center gap-1.5 text-slate-600">
                                                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                        <span>{item.duration || "Structured"}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-slate-600 justify-end">
                                                        <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                        <span>{item.totalSemester ? `${item.totalSemester} Semesters` : "Modular"}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action footer */}
                                            <div className="px-6 pb-6 pt-2 bg-white">
                                                <Link
                                                    to={`/program/${item._id}`}
                                                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-xs"
                                                >
                                                    <span>View Curriculum Details</span>
                                                    <ArrowRight className="w-3.5 h-3.5" />
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
                                    <BookOpen className="w-7 h-7" />
                                </div>
                                <h3 className="text-base font-bold text-slate-900 mb-1">
                                    No Programs Found
                                </h3>
                                <p className="text-xs text-slate-500 mb-6">
                                    No programs match your current filter or search criteria.
                                </p>
                                <button
                                    onClick={() => {
                                        setSearchQuery("");
                                        setSelectedType("ALL");
                                        setSelectedDept("ALL");
                                    }}
                                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition"
                                >
                                    Reset Filters
                                </button>
                            </div>
                        )}
                    </div>
                </section>

                {/* 5. Admission Encouragement Banner */}
                <section className="py-14 bg-slate-900 text-white border-t border-slate-800">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-2">
                            Session 2026-27 Applications
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
                            Ready to Apply for an Academic Program?
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                            Submit your online admission form to secure your seat in our competitive programs. Our academic counselors will verify your credentials and guide you.
                        </p>
                        <Link
                            to="/applyNow"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition"
                        >
                            <span>Start Online Application</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </section>

            </div>

            {/* 6. Footer */}
            <Footer />
        </div>
    );
}
