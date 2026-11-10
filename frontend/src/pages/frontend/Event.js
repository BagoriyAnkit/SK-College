import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import MemoriesSection from "./Memories";
import { ViewAllEvent } from "../../Service/frontend/Event";
import { Image_url, API_url } from "../../config/config";
import {
    CalendarDays,
    Clock,
    MapPin,
    ArrowRight,
    Calendar,
    Search,
    Award,
    Sparkles,
    CheckCircle2,
    Users
} from "lucide-react";
import moment from "moment";
import Swal from "sweetalert2";

export default function Event() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const fetchEvents = async () => {
        try {
            const data = await ViewAllEvent();
            let list = [];
            if (Array.isArray(data)) {
                list = data;
            } else if (Array.isArray(data?.data)) {
                list = data.data;
            }
            setEvents(list);
        } catch (error) {
            console.error("Error fetching events:", error);
            setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    // Filter events based on search and status
    const filteredEvents = useMemo(() => {
        return events.filter((item) => {
            const title = (item.event_title || "").toLowerCase();
            const loc = (item.location || "").toLowerCase();
            const q = searchQuery.toLowerCase().trim();

            const matchesSearch = !q || title.includes(q) || loc.includes(q);
            const matchesStatus =
                statusFilter === "ALL" ||
                (statusFilter === "OPEN" && item.status === true) ||
                (statusFilter === "CLOSED" && item.status === false);

            return matchesSearch && matchesStatus;
        });
    }, [events, searchQuery, statusFilter]);

    const resolveEventImage = (img) => {
        if (!img) return `${Image_url}/1785489858420-sports.jpg`;
        if (img.startsWith("http://") || img.startsWith("https://")) return img;
        if (img.startsWith("/")) return `${API_url}${img}`;
        return `${Image_url}/${img}`;
    };

    const handleRegisterClick = (eventItem) => {
        Swal.fire({
            title: `Register for ${eventItem.event_title}`,
            html: `
                <div class="text-left text-sm space-y-2 py-2">
                    <p class="text-slate-600"><strong>Date:</strong> ${eventItem.event_date || "Announced soon"}</p>
                    <p class="text-slate-600"><strong>Time:</strong> ${eventItem.start_time || "TBA"} - ${eventItem.end_time || "TBA"}</p>
                    <p class="text-slate-600"><strong>Venue:</strong> ${eventItem.location || "College Campus"}</p>
                    <hr class="my-3"/>
                    <p class="text-xs text-slate-500">Please visit the Student Activity Cell or consult your department coordinator to confirm participant registration.</p>
                </div>
            `,
            icon: "info",
            confirmButtonText: "Acknowledged",
            confirmButtonColor: "#0f172a"
        });
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
                            <span className="text-slate-200">Campus Events</span>
                        </div>

                        {/* Institutional Badge */}
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-semibold mb-4">
                            <Calendar className="w-3.5 h-3.5 text-amber-400" />
                            <span>Academic &bull; Technical &bull; Cultural Activities</span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
                            Campus Events &amp; Activities
                        </h1>

                        <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
                            Discover conferences, technical hackathons, guest lectures, athletic meets, and cultural festivals hosted throughout the academic year.
                        </p>
                    </div>
                </section>

                {/* 3. Search & Status Filter Bar */}
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
                                    placeholder="Search events by title or venue..."
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

                            {/* Status Filter Tabs */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setStatusFilter("ALL")}
                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                                        statusFilter === "ALL"
                                            ? "bg-slate-900 text-white shadow-xs"
                                            : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                                    }`}
                                >
                                    All Events
                                </button>
                                <button
                                    onClick={() => setStatusFilter("OPEN")}
                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                                        statusFilter === "OPEN"
                                            ? "bg-slate-900 text-white shadow-xs"
                                            : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                                    }`}
                                >
                                    Open
                                </button>
                                <button
                                    onClick={() => setStatusFilter("CLOSED")}
                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                                        statusFilter === "CLOSED"
                                            ? "bg-slate-900 text-white shadow-xs"
                                            : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                                    }`}
                                >
                                    Concluded
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. Events Grid */}
                <section className="py-12 sm:py-16">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3].map((idx) => (
                                    <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse space-y-4">
                                        <div className="h-48 bg-slate-200 rounded-xl"></div>
                                        <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                                        <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                                        <div className="h-10 bg-slate-200 rounded-xl"></div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredEvents.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredEvents.map((item) => (
                                    <div
                                        key={item._id}
                                        className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden group"
                                    >
                                        <div>
                                            {/* Poster Image */}
                                            <div className="relative h-48 bg-slate-100 overflow-hidden">
                                                <img
                                                    src={resolveEventImage(item.image)}
                                                    alt={item.event_title || "Campus Event"}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                                    loading="lazy"
                                                    onError={(e) => {
                                                        e.currentTarget.onerror = null;
                                                        e.currentTarget.src = `${Image_url}/1785489858420-sports.jpg`;
                                                    }}
                                                />

                                                {/* Status Badge */}
                                                <div className="absolute top-3 right-3">
                                                    <span
                                                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-xs ${
                                                            item.status
                                                                ? "bg-emerald-500 text-white"
                                                                : "bg-slate-700 text-slate-200"
                                                        }`}
                                                    >
                                                        {item.status ? "Open for Registration" : "Concluded"}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Event Info */}
                                            <div className="p-6">
                                                <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-snug group-hover:text-blue-900 transition mb-4">
                                                    {item.event_title}
                                                </h3>

                                                <div className="space-y-2.5 text-xs text-slate-600">
                                                    {item.event_date && (
                                                        <div className="flex items-center gap-2">
                                                            <CalendarDays className="w-4 h-4 text-slate-400 shrink-0" />
                                                            <span className="font-medium text-slate-800">
                                                                {moment(item.event_date).isValid()
                                                                    ? moment(item.event_date).format("dddd, DD MMMM YYYY")
                                                                    : item.event_date}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {(item.start_time || item.end_time) && (
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                                                            <span>
                                                                {item.start_time || "TBA"} {item.end_time ? `- ${item.end_time}` : ""}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {item.location && (
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                                                            <span>{item.location}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <div className="px-6 pb-6 pt-2">
                                            <button
                                                onClick={() => handleRegisterClick(item)}
                                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-xs cursor-pointer"
                                            >
                                                <span>{item.status ? "Event Details & Register" : "View Event Overview"}</span>
                                                <ArrowRight className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            /* Empty State */
                            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
                                <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                                    <Calendar className="w-7 h-7" />
                                </div>
                                <h3 className="text-base font-bold text-slate-900 mb-1">
                                    No Events Scheduled
                                </h3>
                                <p className="text-xs text-slate-500 mb-6">
                                    No events currently match your search or status selection.
                                </p>
                                <button
                                    onClick={() => {
                                        setSearchQuery("");
                                        setStatusFilter("ALL");
                                    }}
                                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition"
                                >
                                    Reset Filters
                                </button>
                            </div>
                        )}
                    </div>
                </section>

                {/* 5. Memories Section */}
                <MemoriesSection />

            </div>

            {/* 6. Footer */}
            <Footer />
        </div>
    );
}
