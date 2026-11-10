import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import {
    GraduationCap,
    Briefcase,
    ArrowRight,
    User,
    Search,
    Building2,
    Mail,
    Phone,
    Award,
    Filter
} from "lucide-react";
import { ViewAllFaculty } from "../../Service/frontend/Teacher";

export default function Faculty() {
    const [faculty, setFaculty] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDept, setSelectedDept] = useState("ALL");

    useEffect(() => {
        getFaculty();
    }, []);

    const getFaculty = async () => {
        try {
            const res = await ViewAllFaculty();
            let dataList = [];
            if (Array.isArray(res?.data)) {
                dataList = res.data;
            } else if (Array.isArray(res?.data?.data)) {
                dataList = res.data.data;
            } else if (Array.isArray(res)) {
                dataList = res;
            }
            setFaculty(dataList);
        } catch (error) {
            console.error("Error fetching faculty directory:", error);
            setFaculty([]);
        } finally {
            setLoading(false);
        }
    };

    // Extract unique departments for filter
    const departments = useMemo(() => {
        const depts = new Set();
        faculty.forEach((f) => {
            const deptName = typeof f.Department === "object" && f.Department
                ? f.Department.DepartmentName
                : (typeof f.department === "object" && f.department ? f.department.DepartmentName : f.Department || f.department);
            if (deptName) depts.add(deptName.trim());
        });
        return Array.from(depts);
    }, [faculty]);

    // Filter faculty list
    const filteredFaculty = useMemo(() => {
        return faculty.filter((f) => {
            const name = (f.TeacherName || "").toLowerCase();
            const qual = (f.Qualification || "").toLowerCase();
            const deptName = (typeof f.Department === "object" && f.Department
                ? f.Department.DepartmentName
                : (typeof f.department === "object" && f.department ? f.department.DepartmentName : f.Department || f.department || "")).toLowerCase();
            const q = searchQuery.toLowerCase().trim();

            const matchesSearch = !q || name.includes(q) || qual.includes(q) || deptName.includes(q);
            const matchesDept = selectedDept === "ALL" || deptName === selectedDept.toLowerCase();

            return matchesSearch && matchesDept;
        });
    }, [faculty, searchQuery, selectedDept]);

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
                            <span className="text-slate-200">Faculty Directory</span>
                        </div>

                        {/* Institutional Badge */}
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-semibold mb-4">
                            <Award className="w-3.5 h-3.5 text-amber-400" />
                            <span>Academic Leadership &bull; Subject Matter Mentors</span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
                            Distinguished Faculty
                        </h1>

                        <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
                            Meet our accomplished professors, lecturers, and researchers committed to imparting cutting-edge technical education and individual academic guidance.
                        </p>
                    </div>
                </section>

                {/* 3. Search & Filter Bar */}
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
                                    placeholder="Search by faculty name or qualification..."
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

                            {/* Department Filter & Count */}
                            <div className="flex flex-wrap items-center gap-3">
                                {departments.length > 0 && (
                                    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs">
                                        <Filter className="w-3.5 h-3.5 text-slate-500" />
                                        <span className="text-slate-500 font-medium">Department:</span>
                                        <select
                                            value={selectedDept}
                                            onChange={(e) => setSelectedDept(e.target.value)}
                                            className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer max-w-[150px] truncate"
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

                                <div className="text-xs font-semibold text-slate-500 pl-1">
                                    Total Faculty: <span className="text-slate-900 font-bold">{filteredFaculty.length}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. Faculty Grid */}
                <section className="py-12 sm:py-16">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map((idx) => (
                                    <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse space-y-4">
                                        <div className="w-16 h-16 bg-slate-200 rounded-full mx-auto"></div>
                                        <div className="h-5 bg-slate-200 rounded w-2/3 mx-auto"></div>
                                        <div className="h-4 bg-slate-100 rounded w-1/2 mx-auto"></div>
                                        <div className="h-10 bg-slate-200 rounded-xl w-full"></div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredFaculty.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredFaculty.map((item) => {
                                    const deptName = typeof item.Department === "object" && item.Department
                                        ? item.Department.DepartmentName
                                        : (typeof item.department === "object" && item.department ? item.department.DepartmentName : item.Department || item.department);

                                    return (
                                        <div
                                            key={item._id}
                                            className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden group"
                                        >
                                            <div className="p-6 text-center">
                                                {/* Avatar */}
                                                <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4 group-hover:scale-105 transition shadow-sm">
                                                    {item.TeacherName ? item.TeacherName.charAt(0).toUpperCase() : "T"}
                                                </div>

                                                {/* Name */}
                                                <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-snug group-hover:text-blue-900 transition">
                                                    {item.TeacherName}
                                                </h3>

                                                {/* Department */}
                                                {deptName && (
                                                    <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1">
                                                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                                        <span>{deptName}</span>
                                                    </div>
                                                )}

                                                {/* Badges / Specifications */}
                                                <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                                                    {item.Qualification && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
                                                            <GraduationCap className="w-3 h-3 text-slate-500" />
                                                            <span>{item.Qualification}</span>
                                                        </span>
                                                    )}
                                                    {item.Experience && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
                                                            <Briefcase className="w-3 h-3 text-slate-500" />
                                                            <span>{item.Experience}</span>
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Contact info snippets */}
                                                <div className="mt-5 pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-1">
                                                    {item.Email && (
                                                        <div className="flex items-center justify-center gap-1.5 truncate">
                                                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                            <span className="truncate">{item.Email}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Action Button */}
                                            <div className="px-6 pb-6 pt-1">
                                                <Link
                                                    to={`/faculty/${item._id}`}
                                                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-xs"
                                                >
                                                    <span>View Academic Profile</span>
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
                                    <User className="w-7 h-7" />
                                </div>
                                <h3 className="text-base font-bold text-slate-900 mb-1">
                                    No Faculty Members Found
                                </h3>
                                <p className="text-xs text-slate-500 mb-6">
                                    No faculty records match your search criteria.
                                </p>
                                <button
                                    onClick={() => {
                                        setSearchQuery("");
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

            </div>

            {/* 5. Footer */}
            <Footer />
        </div>
    );
}
