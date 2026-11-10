import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import {
    Bell,
    Calendar,
    Building2,
    UserCheck,
    Search,
    Award,
    Filter,
    FileText,
    Users,
    ChevronDown,
    ChevronUp,
    ExternalLink
} from "lucide-react";
import { ViewAllNotice } from "../../Service/frontend/Notice";
import moment from "moment";

export default function Notice() {
    const [noticeData, setNoticeData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedAudience, setSelectedAudience] = useState("ALL");
    const [expandedNoticeId, setExpandedNoticeId] = useState(null);

    useEffect(() => {
        getNotice();
    }, []);

    const getNotice = async () => {
        try {
            const res = await ViewAllNotice();
            let list = [];
            if (Array.isArray(res?.data)) {
                list = res.data;
            } else if (Array.isArray(res?.data?.data)) {
                list = res.data.data;
            } else if (Array.isArray(res)) {
                list = res;
            }
            setNoticeData(list);
        } catch (error) {
            console.error("Error fetching notices:", error);
            setNoticeData([]);
        } finally {
            setLoading(false);
        }
    };

    // Filter notices
    const filteredNotices = useMemo(() => {
        return noticeData.filter((item) => {
            const title = (item.notice_title || "").toLowerCase();
            const desc = (item.description || "").toLowerCase();
            const dept = (item.department || "").toLowerCase();
            const forWhom = (item.for_whom || "").toLowerCase();
            const q = searchQuery.toLowerCase().trim();

            const matchesSearch = !q || title.includes(q) || desc.includes(q) || dept.includes(q);
            const matchesAudience = selectedAudience === "ALL" || forWhom.includes(selectedAudience.toLowerCase());

            return matchesSearch && matchesAudience;
        });
    }, [noticeData, searchQuery, selectedAudience]);

    const toggleExpand = (id) => {
        setExpandedNoticeId(expandedNoticeId === id ? null : id);
    };

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
                            <span className="text-slate-200">Official Notices</span>
                        </div>

                        {/* Institutional Badge */}
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-semibold mb-4">
                            <Bell className="w-3.5 h-3.5 text-amber-400" />
                            <span>Official Notice Board &bull; Office of the Registrar</span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
                            Notices &amp; Institutional Circulars
                        </h1>

                        <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
                            Official announcements, academic schedules, examination notifications, and administrative circulars released for students, staff, and faculty.
                        </p>
                    </div>
                </section>

                {/* 3. Search & Audience Filters */}
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
                                    placeholder="Search by notice title or keywords..."
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

                            {/* Audience Filter Tabs */}
                            <div className="flex flex-wrap items-center gap-2">
                                {["ALL", "Student", "Teacher", "Staff"].map((aud) => (
                                    <button
                                        key={aud}
                                        onClick={() => setSelectedAudience(aud)}
                                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                                            selectedAudience === aud
                                                ? "bg-slate-900 text-white shadow-xs"
                                                : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                                        }`}
                                    >
                                        {aud === "ALL" ? "All Circulars" : aud}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. Notice List */}
                <section className="py-12 sm:py-16">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3, 4].map((idx) => (
                                    <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse space-y-3">
                                        <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                                        <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                                        <div className="h-4 bg-slate-100 rounded w-full"></div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredNotices.length > 0 ? (
                            <div className="space-y-4">
                                {filteredNotices.map((item) => {
                                    const isExpanded = expandedNoticeId === item._id;

                                    return (
                                        <article
                                            key={item._id}
                                            className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition overflow-hidden"
                                        >
                                            <div className="p-6">
                                                {/* Meta strip */}
                                                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        {item.publish_date && (
                                                            <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                                <span>{moment(item.publish_date).format("DD MMM, YYYY")}</span>
                                                            </span>
                                                        )}

                                                        {item.department && (
                                                            <span className="px-2.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-semibold">
                                                                {item.department}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {item.for_whom && (
                                                        <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider">
                                                            For: {item.for_whom}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Notice Title */}
                                                <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug mb-3">
                                                    {item.notice_title}
                                                </h2>

                                                {/* Description */}
                                                <div className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                                    {isExpanded ? (
                                                        <p className="whitespace-pre-line">{item.description}</p>
                                                    ) : (
                                                        <p className="line-clamp-2">{item.description}</p>
                                                    )}
                                                </div>

                                                {/* Footer Info & Expand Toggle */}
                                                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 mt-4 border-t border-slate-100 text-xs">
                                                    <div className="text-slate-500">
                                                        {item.issued_by && (
                                                            <span>Issued by: <strong className="text-slate-700 font-semibold">{item.issued_by}</strong></span>
                                                        )}
                                                    </div>

                                                    {item.description && item.description.length > 120 && (
                                                        <button
                                                            onClick={() => toggleExpand(item._id)}
                                                            className="text-slate-900 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                                                        >
                                                            <span>{isExpanded ? "Collapse Notice" : "Read Full Notice"}</span>
                                                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        ) : (
                            /* Empty State */
                            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
                                <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                                    <Bell className="w-7 h-7" />
                                </div>
                                <h3 className="text-base font-bold text-slate-900 mb-1">
                                    No Notices Found
                                </h3>
                                <p className="text-xs text-slate-500 mb-6">
                                    No circulars match your current filter or search keyword.
                                </p>
                                <button
                                    onClick={() => {
                                        setSearchQuery("");
                                        setSelectedAudience("ALL");
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
