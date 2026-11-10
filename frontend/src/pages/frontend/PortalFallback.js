import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Bell, Calendar, LogOut, ShieldCheck, User, Award } from "lucide-react";
import Header from "./Header";
import Footer from "./Footer";
import { getAuthUser, clearAuth } from "../../utils/auth";

export default function PortalFallback() {
    const navigate = useNavigate();
    const authUser = getAuthUser();
    const role = authUser?.role || "student";
    const name = authUser?.name || "Student";
    const email = authUser?.email || "";

    const handleLogout = () => {
        clearAuth();
        navigate("/login", { replace: true });
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-slate-900 selection:text-white justify-between">
            <Header />

            <div className="pt-20 md:pt-28 flex-1">
                <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    {/* Welcome Header */}
                    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm mb-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-extrabold text-2xl shadow-sm">
                                    {name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                                            Welcome, {name}
                                        </h1>
                                        <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                                            {role}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">
                                        {email ? email : "Logged in successfully"}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="self-start sm:self-center px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 cursor-pointer"
                            >
                                <LogOut size={14} />
                                <span>Logout</span>
                            </button>
                        </div>

                        <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-slate-900 text-amber-400 shrink-0">
                                <ShieldCheck size={18} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                                    Student Portal Services
                                </p>
                                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                                    You have active authenticated access to official academic resources, scheduled notices, degree curricula, and examination portals.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Access Section */}
                    <div>
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
                            Permitted Resources &amp; Services
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <Link
                                to="/notice"
                                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition group"
                            >
                                <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-4 group-hover:scale-105 transition">
                                    <Bell size={20} className="text-amber-400" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-900 transition">
                                    Official Notices
                                </h3>
                                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                                    Stay updated with latest college announcements, circulars, and departmental memos.
                                </p>
                            </Link>

                            <Link
                                to="/exam"
                                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition group"
                            >
                                <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-4 group-hover:scale-105 transition">
                                    <Calendar size={20} className="text-emerald-400" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-900 transition">
                                    Examination Schedules
                                </h3>
                                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                                    View examination timetables, evaluation guidelines, and semester dates.
                                </p>
                            </Link>

                            <Link
                                to="/program"
                                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition group"
                            >
                                <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-4 group-hover:scale-105 transition">
                                    <BookOpen size={20} className="text-blue-400" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-900 transition">
                                    Academic Programs
                                </h3>
                                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                                    Explore degree courses, syllabus outlines, and affiliated departments.
                                </p>
                            </Link>
                        </div>
                    </div>
                </main>
            </div>

            <Footer />
        </div>
    );
}
