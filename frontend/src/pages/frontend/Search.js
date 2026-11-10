import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { Search as SearchIcon, ArrowRight, BookOpen, GraduationCap, Users, Bell, Calendar } from "lucide-react";

export default function Search() {
    const [keyword, setKeyword] = useState("");
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e?.preventDefault();
        if (!keyword.trim()) return;
        // Navigate to programs search by default
        navigate(`/program?q=${encodeURIComponent(keyword.trim())}`);
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-slate-900 selection:text-white flex flex-col justify-between">
            <Header />

            <div className="pt-20 md:pt-28 flex-1">
                {/* Banner */}
                <section className="relative bg-slate-950 text-white overflow-hidden py-16 sm:py-20 border-b border-slate-800">
                    <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25"></div>

                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center max-w-3xl">
                        <div className="flex items-center justify-center gap-2 text-xs text-slate-400 mb-4 font-medium">
                            <Link to="/" className="hover:text-white transition">Home</Link>
                            <span>/</span>
                            <span className="text-slate-200">Search Portal</span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
                            Search SK College Portal
                        </h1>
                        <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-8">
                            Find academic programs, department faculty, administrative notices, and campus events across the institution.
                        </p>

                        {/* Search Input Box */}
                        <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex items-center gap-3">
                            <div className="relative flex-1">
                                <SearchIcon className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search courses, departments, faculty, or circulars..."
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
                                />
                            </div>
                            <button
                                type="submit"
                                className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition border border-slate-700 shadow-md cursor-pointer shrink-0"
                            >
                                Search
                            </button>
                        </form>
                    </div>
                </section>

                {/* Quick Directory Links */}
                <section className="py-16">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 text-center mb-8">
                            Browse Direct Institutional Categories
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Link
                                to="/program"
                                className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-sm transition text-center group"
                            >
                                <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition">
                                    <GraduationCap className="w-6 h-6 text-amber-400" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 mb-1">Academic Programs</h3>
                                <p className="text-xs text-slate-500">Degree &amp; diploma courses</p>
                            </Link>

                            <Link
                                to="/faculty"
                                className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-sm transition text-center group"
                            >
                                <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition">
                                    <Users className="w-6 h-6 text-emerald-400" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 mb-1">Faculty Directory</h3>
                                <p className="text-xs text-slate-500">Mentors &amp; professors</p>
                            </Link>

                            <Link
                                to="/notice"
                                className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-sm transition text-center group"
                            >
                                <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition">
                                    <Bell className="w-6 h-6 text-blue-400" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 mb-1">Official Notices</h3>
                                <p className="text-xs text-slate-500">Circulars &amp; announcements</p>
                            </Link>

                            <Link
                                to="/events"
                                className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-sm transition text-center group"
                            >
                                <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition">
                                    <Calendar className="w-6 h-6 text-purple-400" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 mb-1">Campus Events</h3>
                                <p className="text-xs text-slate-500">Activities &amp; symposiums</p>
                            </Link>
                        </div>
                    </div>
                </section>
            </div>

            <Footer />
        </div>
    );
}
